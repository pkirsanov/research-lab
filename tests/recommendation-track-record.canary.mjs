/*
 * tests/recommendation-track-record.canary.mjs — Feature 015, scope 01 canary rows T-01-C1 and
 * T-01-C2.
 *
 * These two rows assert the SUBSTRATE rather than the claim contract, and they run before the
 * broad reruns. Scopes 02 - 10 all import `recommendation-track-record.support.mjs`, so a changed
 * signature or a lost fixture convention there surfaces as nine unrelated failures at the end of a
 * long suite. T-01-C1 names that defect at the substrate, in seconds, before `T-01-R1` and
 * `T-01-R2` ever start.
 *
 * T-01-C2 rehearses the back-out. This scope is purely additive, so its restore target is
 * *absent*: discarding the new files returns the repository to its pre-scope state. The rehearsal
 * happens in a disposable detached `git worktree` rather than on the live tree, which concurrent
 * sessions share, and the worktree is torn down in a `finally` so a failed rehearsal cannot leak
 * one.
 *
 * Two conventions carry both rows. Every assertion is against an exact value, and every derived
 * property is paired with the adversarial half that proves the instrument is live — a counter that
 * reads zero because it was never wired up would certify the property it was meant to test. No
 * count is written as a literal: the baseline total moved from `952` to `2487` between planning and
 * delivery, so a pinned figure fails for a reason that has nothing to do with this scope.
 *
 * `scripts/selftest.mjs` is not byte-stable: two runs of one tree agree on their totals and their
 * group structure, but a small number of assertion MESSAGES embed Monte-Carlo sample statistics and
 * differ run to run. T-01-C2 therefore runs a determinism control and excuses exactly the positions
 * that control proves unstable, rather than comparing bytes flatly and failing at random. Three
 * baseline runs is what that costs, which is still a fraction of the browser suite this precedes.
 *
 * Byte-identity across the two trees is the wrong comparison and was replaced by ATTRIBUTABLE
 * DELTA. `scripts/selftest.mjs` reports counts DERIVED from the tree inside its assertion messages,
 * so a scope that legitimately adds a file moves those counts without regressing anything — the
 * comparison could not go green while the code was correct, which makes it a broken comparison
 * rather than a strict one. What replaces it is stricter, not looser: the non-numeric skeleton of
 * every line must still be byte-identical, and every count that moved must have moved by exactly
 * the amount this scope's own additions account for, derived per run and cross-checked against the
 * set of files this scope added. A count that moves for any other reason is unattributed and fails.
 *
 * That added set, and the pre-scope commit the rehearsal checks out, are derived from COMMIT
 * HISTORY rather than from `git status --porcelain`. Reading them off the porcelain was only ever
 * correct while the work was uncommitted; once the scope was committed the porcelain emptied, the
 * added set collapsed to nothing, and the vacuity guard refused a tree that was in fact fine.
 * Working-tree cleanliness is a property of WHEN the row runs, not of what the scope did.
 *
 * Scopes 02 - 10 EXTEND this file; they do not rewrite it.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
    CLAIM_FIXTURE_DIR,
    EXPECTED_SUFFIX,
    FIXTURE_ROOT,
    REPO_ROOT,
    loadClaimFixture,
    loadClaimFixtures,
    mintInputFrom,
    withDisposableStore,
} from './recommendation-track-record.support.mjs';

import * as support from './recommendation-track-record.support.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUPPORT_PATH = path.join(HERE, 'recommendation-track-record.support.mjs');
const SUPPORT_URL = pathToFileURL(SUPPORT_PATH).href;

/* A selftest transcript is ~2500 lines; the 1 MiB default would truncate it into a parse error. */
const CAPTURE_LIMIT = 64 * 1024 * 1024;

/* ---------------------------------------------------------------------------------------------
 * The support module's declared surface.
 *
 * Names alone would not catch a changed signature, so each function carries its declared arity.
 * Trailing defaults are excluded from `Function.length`, which is why the labelled helpers read one
 * lower than their parameter lists.
 * ------------------------------------------------------------------------------------------- */

const EXPECTED_CONSTANTS = Object.freeze(['CLAIM_FIXTURE_DIR', 'EXPECTED_SUFFIX', 'FIXTURE_ROOT', 'REPO_ROOT']);

const EXPECTED_FUNCTION_ARITY = Object.freeze({
    assertBytesUnchanged: 2,
    assertEvaluable: 1,
    assertRefusal: 3,
    barsDirectoryListing: 0,
    bytesEqual: 2,
    committedSeries: 0,
    filePorts: 1,
    foundationActionVocabulary: 0,
    foundationSourceText: 0,
    loadClaimFixture: 1,
    loadClaimFixtures: 0,
    loadClaimsModule: 0,
    mintInputFrom: 1,
    readBytes: 1,
    toolsRegistry: 0,
    withDisposableStore: 1,
});

/** Every fixture shape the loader must round-trip, keyed by the `expected.outcome` discriminator. */
const FIXTURE_SHAPES = Object.freeze(['evaluable', 'not-evaluable', 'violation']);

/** The date fields `mintInputFrom` carries. Each must come from the input and never from a clock. */
const DATE_FIELDS = Object.freeze(['proposedAt', 'resolutionDate', 'entryDate']);

/* ---------------------------------------------------------------------------------------------
 * `scripts/selftest.mjs` transcript parsing.
 *
 * The emitters are fixed at `selftest.mjs#L70`, `#L71`, `#L74` and `#L11922-11924`: an assertion is
 * `'  ✓ ' + msg` or `'  ✗ ' + msg`, a group header is the bare name at column zero, and the summary
 * is a 48-character banner around one totals line. Parsing them exactly is what lets the baseline
 * be DERIVED — `passed` must equal the number of ✓ lines it claims to summarise — instead of
 * compared against a literal that is wrong within weeks.
 * ------------------------------------------------------------------------------------------- */

const PASS_PREFIX = '  \u2713 ';
const FAIL_PREFIX = '  \u2717 ';
const SUMMARY_BANNER = '='.repeat(48);
const TOTALS_LINE = /^Research-Lab self-test: (\d+) passed, (\d+) failed$/;

function parseSelftestTranscript(stdout) {
    const groups = [];
    let current = null;
    let totals = null;

    for (const line of stdout.split('\n')) {
        if (line.startsWith(PASS_PREFIX) || line.startsWith(FAIL_PREFIX)) {
            assert.notEqual(current, null, `assertion line outside any group: ${line}`);
            current.lines.push(line);
            continue;
        }
        const matched = TOTALS_LINE.exec(line);
        if (matched !== null) {
            assert.equal(totals, null, 'the transcript must carry exactly one totals line');
            totals = { passed: Number(matched[1]), failed: Number(matched[2]) };
            continue;
        }
        // Blank lines, the banner, and every indented diagnostic are structure, not assertions.
        if (line === '' || line === SUMMARY_BANNER || line.startsWith(' ')) continue;
        current = { name: line, lines: [] };
        groups.push(current);
    }

    return { groups, totals };
}

function countLinesWithPrefix(groups, prefix) {
    return groups.reduce(
        (running, group) => running + group.lines.filter((line) => line.startsWith(prefix)).length,
        0,
    );
}

/** One group's passing-assertion count. The property AC-018 actually protects is that this never falls. */
function passCount(group) {
    return group.lines.filter((line) => line.startsWith(PASS_PREFIX)).length;
}

function runSelftest(cwd) {
    const run = spawnSync(process.execPath, ['scripts/selftest.mjs'], {
        cwd,
        encoding: 'utf8',
        maxBuffer: CAPTURE_LIMIT,
    });
    assert.equal(run.error, undefined, `selftest in ${cwd} failed to spawn: ${run.error}`);
    return { cwd, status: run.status, stdout: run.stdout, ...parseSelftestTranscript(run.stdout) };
}

/**
 * The live-tree baseline, computed once and shared by both rows.
 *
 * The run costs ~26 seconds and both rows need the identical transcript — C1 to assert it is
 * internally consistent, C2 to diff it against the pre-scope run. The memo is a cache of a
 * deterministic computation, not a skip: whichever row runs first pays for it, and either row is
 * still correct when run alone.
 */
let liveBaselineMemo = null;
function liveBaseline() {
    if (liveBaselineMemo === null) liveBaselineMemo = runSelftest(REPO_ROOT);
    return liveBaselineMemo;
}

/** A stable key for one assertion position: the group it sits in, and its index within that group. */
function lineKey(groupName, index) {
    return `${groupName}\u0000${index}`;
}

/**
 * The assertion positions whose TEXT is not reproducible for a fixed tree, derived by running the
 * live baseline a second time rather than declared here.
 *
 * `scripts/selftest.mjs` embeds Monte-Carlo sample statistics in some assertion messages, so those
 * lines differ between two runs of the identical tree. A flat byte comparison against the pre-scope
 * run would therefore fail at random, and a canary that fails at random is one nobody reads.
 * Deriving the set from a control run keeps the comparison exact everywhere it can be exact — a
 * deterministic line that changed still fails — while writing nothing down about which lines drift.
 *
 * A position that is both unstable AND genuinely regressed would escape the text comparison. The
 * per-group assertion count, the group name set and the group ordering are all compared
 * unconditionally, so such a position is still bounded by those.
 */
function unstableLineKeys(runA, runB) {
    const keys = new Set();
    const byName = new Map(runB.groups.map((group) => [group.name, group]));
    for (const group of runA.groups) {
        const counterpart = byName.get(group.name);
        assert.notEqual(counterpart, undefined, `group "${group.name}" is missing from the control run`);
        assert.equal(
            counterpart.lines.length,
            group.lines.length,
            `group "${group.name}": two runs of one tree must emit the same number of assertions`,
        );
        for (let index = 0; index < group.lines.length; index += 1) {
            if (group.lines[index] !== counterpart.lines[index]) keys.add(lineKey(group.name, index));
        }
    }
    return keys;
}

/* ---------------------------------------------------------------------------------------------
 * Child-process probes.
 *
 * Import-time side effects are only observable from OUTSIDE the importing process, because this
 * file has already imported the support module by the time any assertion runs.
 * ------------------------------------------------------------------------------------------- */

const RUNNER_COUNT_LABELS = Object.freeze(['tests', 'suites', 'pass', 'fail']);

/* The runner picks `spec` on a TTY and `tap` on a pipe, so the reporter is named explicitly: a
 * probe whose summary format depended on how the suite was launched is not a measurement. */
const RUNNER_REPORTER = '--test-reporter=tap';

function parseRunnerCounts(stdout) {
    const counts = {};
    for (const label of RUNNER_COUNT_LABELS) {
        const matched = new RegExp(`^# ${label} (\\d+)$`, 'm').exec(stdout);
        assert.notEqual(matched, null, `the runner summary is missing its "${label}" line. stdout was:\n${stdout}`);
        counts[label] = Number(matched[1]);
    }
    return counts;
}

function writeProbe(root, name, source) {
    const probePath = path.join(root, name);
    fs.writeFileSync(probePath, source, 'utf8');
    return probePath;
}

function runNode(args) {
    // The parent is itself running under `node --test`, which exports its own context to children.
    // A probe inheriting it reports through the parent's child protocol instead of the reporter
    // named on its own command line, and the summary this parses is never emitted.
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    delete env.NODE_TEST_WORKER_ID;

    const run = spawnSync(process.execPath, args, {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        env,
        maxBuffer: CAPTURE_LIMIT,
    });
    assert.equal(run.error, undefined, `node ${args.join(' ')} failed to spawn: ${run.error}`);
    return run;
}

/* The fs methods the support module could reach for. Each is wrapped on the shared `node:fs`
 * exports object, which `import fs from 'node:fs'` resolves to in the module under observation, so
 * a wrapper installed here is seen at that module's call sites. */
const OBSERVED_FS_METHODS = Object.freeze([
    'existsSync', 'readFileSync', 'readdirSync', 'openSync', 'mkdirSync', 'writeFileSync', 'statSync', 'realpathSync',
]);

function fsObservationProbeSource() {
    return [
        `import fs from 'node:fs';`,
        `const NAMES = ${JSON.stringify(OBSERVED_FS_METHODS)};`,
        `const originals = new Map();`,
        `const calls = [];`,
        `for (const name of NAMES) {`,
        `    const original = fs[name];`,
        `    originals.set(name, original);`,
        `    fs[name] = function observed(...args) {`,
        `        calls.push({ name, target: String(args[0]) });`,
        `        return original.apply(fs, args);`,
        `    };`,
        `}`,
        `const beforeImport = calls.length;`,
        `const loaded = await import(${JSON.stringify(SUPPORT_URL)});`,
        `const atImport = calls.slice(beforeImport);`,
        `const beforeLoader = calls.length;`,
        `loaded.loadClaimFixtures();`,
        `const duringLoader = calls.slice(beforeLoader);`,
        `for (const [name, original] of originals) fs[name] = original;`,
        `fs.writeFileSync(process.argv[2], JSON.stringify({ atImport, duringLoader }), 'utf8');`,
        ``,
    ].join('\n');
}

/** Normalise an fs argument to an absolute path so a `file://` URL and a path compare equal. */
function normaliseTarget(target) {
    return target.startsWith('file:') ? fileURLToPath(target) : target;
}

/* ---------------------------------------------------------------------------------------------
 * Git helpers for the restore rehearsal.
 * ------------------------------------------------------------------------------------------- */

function git(args, cwd = REPO_ROOT) {
    const run = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: CAPTURE_LIMIT });
    assert.equal(run.error, undefined, `git ${args.join(' ')} failed to spawn: ${run.error}`);
    assert.equal(run.status, 0, `git ${args.join(' ')} exited ${run.status}: ${run.stderr}`);
    return run.stdout;
}

/**
 * The file families scope 01 is allowed to touch, taken verbatim from the scope's Change Boundary.
 * An entry outside these is collateral, and collateral is what destroys the property T-01-C2
 * exists to prove: that this change set is small enough to back out cleanly.
 */
const ALLOWED_EXACT_PATHS = Object.freeze(['rlclaims.js']);
const ALLOWED_PATH_PREFIXES = Object.freeze([
    'tests/recommendation-track-record.',
    'tests/fixtures/recommendation-track-record/',
    'briefs/objects/claims/',
    'specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/',
]);

/** The scope's own planning and evidence artifacts, the one family it may MODIFY rather than add. */
const SCOPE_ARTIFACT_PREFIX = 'specs/015-recommendation-outcome-ledger-and-track-record/scopes/01-frozen-claim-contract/';

function isAllowedPath(candidate) {
    return (
        ALLOWED_EXACT_PATHS.includes(candidate)
        || ALLOWED_PATH_PREFIXES.some((prefix) => candidate.startsWith(prefix))
    );
}

/* ---------------------------------------------------------------------------------------------
 * The pre-scope boundary.
 *
 * The rehearsal needs the commit the repository sat at BEFORE this scope existed, and the set of
 * files this scope is answerable for. Both are derived from commit history, so the row holds from
 * a clean committed tree and mid-development alike.
 *
 * No SHA is written down. The boundary is the parent of the commit that first introduced the
 * scope's origin file, and the derivation is checked against known answers at both ends: the
 * origin file must be absent at the boundary and present at HEAD. A boundary that drifted to the
 * wrong commit fails there rather than quietly rehearsing against the wrong tree.
 * ------------------------------------------------------------------------------------------- */

/** The file whose first appearance dates this scope. It is the scope's own module, added by it. */
const SCOPE_ORIGIN_PATH = 'rlclaims.js';

/** Whether `commit` carries `candidate` at that exact path. */
function commitCarriesPath(commit, candidate) {
    return git(['ls-tree', '--name-only', commit, candidate]).trim() !== '';
}

/**
 * The commit immediately before this scope's files first appeared, derived rather than pinned.
 *
 * `git log --diff-filter=A --reverse` lists a path's additions oldest-first, so its first entry is
 * the commit that introduced the scope, and that commit's parent is the last state of the
 * repository without it.
 */
function preScopeCommit() {
    const introductions = git(['log', '--diff-filter=A', '--format=%H', '--reverse', '--', SCOPE_ORIGIN_PATH])
        .split('\n')
        .filter((line) => line !== '');
    assert.ok(
        introductions.length > 0,
        `no commit adds ${SCOPE_ORIGIN_PATH} — the boundary cannot be dated from a file this scope never added`,
    );
    const introducing = introductions[0];
    assert.match(introducing, /^[0-9a-f]{40}$/, 'the introducing commit must resolve to a full object name');

    // `rev-list --parents` prints "<commit> <parent>...". A merge would make "the state before"
    // ambiguous, so exactly one parent is required rather than assumed.
    const lineage = git(['rev-list', '--parents', '-n', '1', introducing]).trim().split(' ');
    assert.equal(
        lineage.length,
        2,
        `the introducing commit must have exactly one parent, got ${lineage.length - 1} — the boundary would be ambiguous`,
    );
    return lineage[1];
}

/**
 * Every file this scope is answerable for, unioned across both tree states.
 *
 * Committed additions and still-untracked additions are unioned because the row must hold from a
 * clean committed tree AND mid-development: in the first the untracked half is empty and history
 * carries the set, in the second the reverse. A porcelain directory entry (git collapses untracked
 * trees) is carried through untouched — it matches no scanned-source shape and no baseline path,
 * so it attributes nothing.
 */
function scopeAddedPaths(preScope, untrackedTargets) {
    const committed = git(['diff', '--diff-filter=A', '--name-only', preScope, 'HEAD'])
        .split('\n')
        .filter((line) => line !== '');
    return [...new Set([...committed, ...untrackedTargets.filter(isAllowedPath)])].sort();
}

/**
 * Every file that existed at the boundary and does not at HEAD.
 *
 * This scope is purely additive, so the set is expected to be empty and is asserted to be. It is
 * still DERIVED rather than assumed absent, because a removal would shrink the committed-surface
 * file tally and an attribution that only ever added would then over-count.
 */
function scopeRemovedPaths(preScope) {
    return git(['diff', '--diff-filter=D', '--name-only', preScope, 'HEAD'])
        .split('\n')
        .filter((line) => line !== '')
        .sort();
}

/* ---------------------------------------------------------------------------------------------
 * Attributable delta.
 *
 * `scripts/selftest.mjs` embeds counts DERIVED from the tree in its assertion messages, so a scope
 * that legitimately adds a file moves those counts. Five move here, and none is a regression:
 *
 *   - `#L7665` reports the size of its production-source scan universe, which grows by every
 *     root-level `.js`/`.html` this scope adds;
 *   - `#L8702` reports the frozen spec-test-path tally, where every added `tests/*.mjs` that the
 *     committed baseline lists as known-missing moves from `known-missing` into `stale`;
 *   - `#L2659` reports how many committed files the PII scan read, which grows by every added file
 *     that scan actually COUNTS — which is not the same as every added file;
 *   - `#L2665` reports how many commit messages it read, which grows by every commit that landed
 *     between the boundary and `HEAD`;
 *   - `#L8700` reports how many `tests/*.mjs` references the spec artifacts name, which grows by
 *     the references this scope's own artifacts contribute.
 *
 * The last three only became measurable once the work was COMMITTED. While it sat untracked the two
 * trees agreed on them, because `git ls-files`, `git log` and — for the artifacts this scope had
 * not yet written — the specs tree all still described the pre-scope repository. Committing is what
 * exposed the scope's own footprint, so the rule set grew; the comparison did not loosen.
 *
 * A flat byte comparison cannot go green while the code is correct. Attribution replaces it with
 * something stricter: the non-numeric skeleton must still match byte for byte, and every count that
 * moved must have moved by exactly the amount this scope's own additions account for. Every
 * magnitude is DERIVED per run — from the two trees, from commit history, and from the committed
 * baseline — so no figure is written down anywhere, and a count that moves for any other reason
 * stays unattributed and fails the row.
 * ------------------------------------------------------------------------------------------- */

/* Mirrors the universe `selftest.mjs#L7659` enumerates. The mirror is self-checking rather than
 * trusted: the attribution below binds the EXACT sizes it derives to the numbers the transcript
 * actually printed, so a mirror that drifted would leave the line unattributed instead of green. */
const PRODUCTION_SOURCE_EXTENSIONS = Object.freeze(['.js', '.html']);
const PRODUCTION_SOURCE_SUBDIR = 'rlexperience-adapters';

/** The committed frozen path set `validate-spec-test-paths.mjs` reads, and the reason line 2 moves. */
const SPEC_TEST_PATH_BASELINE = 'scripts/validate-spec-test-paths.baseline';

function scannedProductionSources(root) {
    const rootLevel = fs
        .readdirSync(root)
        .filter((entry) => PRODUCTION_SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext)));
    const adapters = fs
        .readdirSync(path.join(root, PRODUCTION_SOURCE_SUBDIR))
        .filter((entry) => entry.endsWith('.js'))
        .map((entry) => `${PRODUCTION_SOURCE_SUBDIR}/${entry}`);
    return [...rootLevel, ...adapters].sort();
}

/** Whether a repository-relative path would land in that universe, used to filter the porcelain. */
function isScannedProductionSource(candidate) {
    if (candidate.startsWith(`${PRODUCTION_SOURCE_SUBDIR}/`)) {
        const tail = candidate.slice(PRODUCTION_SOURCE_SUBDIR.length + 1);
        return tail.length > 0 && !tail.includes('/') && tail.endsWith('.js');
    }
    if (candidate.includes('/')) return false;
    return PRODUCTION_SOURCE_EXTENSIONS.some((ext) => candidate.endsWith(ext));
}

function frozenSpecTestPathBaseline(root) {
    return new Set(
        fs
            .readFileSync(path.join(root, SPEC_TEST_PATH_BASELINE), 'utf8')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line !== '' && !line.startsWith('#')),
    );
}

/* ---- The committed-surface file universe -----------------------------------------------------
 *
 * `pii-scan.mjs#L188` does not count every path. It enumerates `git ls-files`, then drops its own
 * config, anything under a skipped directory, anything above a size ceiling, anything it cannot
 * read, and anything carrying a NUL byte. A rule that assumed "one added file, one more scanned
 * file" would over-attribute the day this scope adds an untracked scratch file or a PNG fixture, so
 * the predicate is mirrored from the scanner rather than guessed. Like the scan-universe mirror it
 * is self-checking: the magnitude it derives is bound to the delta the transcript actually printed,
 * so a mirror that drifted leaves the line unattributed instead of green.
 * ------------------------------------------------------------------------------------------- */

const PII_CONFIG_PATH = 'scripts/pii-scan.config.json';
const PII_SKIP_DIRS = Object.freeze([
    '.git', 'node_modules', '_site', 'playwright-report', 'test-results', '.codegraph', '.brief-work',
]);
const PII_MAX_FILE_BYTES = 32 * 1024 * 1024;

/** The index of the tree at `root`, which is the universe `pii-scan.mjs` enumerates. */
function trackedPaths(root) {
    return new Set(git(['ls-files', '-z'], root).split('\u0000').filter((entry) => entry !== ''));
}

/** Whether `candidate` would increment `filesScanned` for the tree at `root`. */
function isPiiScanCounted(root, tracked, candidate) {
    if (candidate === PII_CONFIG_PATH) return false;
    if (!tracked.has(candidate)) return false;
    if (candidate.split('/').some((segment) => PII_SKIP_DIRS.includes(segment))) return false;
    let text;
    try {
        const absolute = path.join(root, candidate);
        if (fs.statSync(absolute).size > PII_MAX_FILE_BYTES) return false;
        text = fs.readFileSync(absolute, 'utf8');
    } catch {
        return false;
    }
    return !text.includes('\u0000');
}

/* ---- The spec-artifact reference surface -----------------------------------------------------
 *
 * `validate-spec-test-paths.mjs#L86` walks `specs/` on the FILESYSTEM rather than through the
 * index, reads every text artifact, and counts each repo-root-relative `tests/....mjs` token. Both
 * halves matter: walking the filesystem is why an artifact edited but not yet committed still moves
 * the count, and the token's lookbehind is why `other/tests/x.mjs` does not. The matcher below is
 * that regex verbatim — anything looser would count references the guard does not, and the derived
 * magnitude would stop matching the transcript.
 * ------------------------------------------------------------------------------------------- */

const SPEC_ARTIFACT_DIR = 'specs';
const SPEC_TEST_PATH_TOKEN = /(?<![A-Za-z0-9._/-])tests\/[A-Za-z0-9._/-]*\.mjs/g;

function countSpecTestPathReferences(text) {
    SPEC_TEST_PATH_TOKEN.lastIndex = 0;
    let found = 0;
    while (SPEC_TEST_PATH_TOKEN.exec(text) !== null) found += 1;
    return found;
}

/** Every artifact the guard would scan under `<root>/specs`, mapped to its reference count. */
function specArtifactReferenceCounts(root) {
    const counts = new Map();
    const base = path.join(root, SPEC_ARTIFACT_DIR);
    if (!fs.existsSync(base)) return counts;

    const walk = (directory) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const child = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                walk(child);
                continue;
            }
            if (!entry.isFile()) continue;
            let text;
            try {
                text = fs.readFileSync(child, 'utf8');
            } catch {
                continue;
            }
            if (text.includes('\u0000')) continue; // binary artifact, not a text reference surface
            counts.set(path.relative(root, child).split(path.sep).join('/'), countSpecTestPathReferences(text));
        }
    };
    walk(base);
    return counts;
}

/**
 * Whether a `specs/` artifact belongs to this scope: its own scope directory, or one it added.
 *
 * Ownership is the right partition rather than "was added", because the artifacts this scope writes
 * its evidence into ALREADY EXISTED — the planning pass created them. They are modified, not added,
 * and a rule keyed on additions alone would derive nothing and leave the reference growth
 * unexplained.
 */
function isScopeOwnedSpecArtifact(candidate, addedSet) {
    return (
        candidate.startsWith(SCOPE_ARTIFACT_PREFIX)
        || (candidate.startsWith(`${SPEC_ARTIFACT_DIR}/`) && addedSet.has(candidate))
    );
}

/**
 * What this scope's own footprint accounts for, each magnitude derived from an independent source.
 *
 * The scan-universe delta is read off the two trees and then required to name exactly the files git
 * reports as added; the file-universe delta is the added set filtered by the scanner's own counting
 * rule; the commit-message delta is read off commit history; the reference delta is read off the
 * artifacts this scope owns. Two derivations that agree is what makes each of these an attribution
 * rather than a restatement of whatever the transcript happened to print.
 */
function deriveAttribution(liveRoot, preRoot, addedPaths, removedPaths, preScope) {
    const liveScanned = scannedProductionSources(liveRoot);
    const preScanned = scannedProductionSources(preRoot);
    const preSet = new Set(preScanned);
    const liveSet = new Set(liveScanned);

    const added = liveScanned.filter((entry) => !preSet.has(entry));
    const removed = preScanned.filter((entry) => !liveSet.has(entry));
    const fromAddedSet = addedPaths.filter(isScannedProductionSource).sort();

    const baseline = frozenSpecTestPathBaseline(liveRoot);
    const resolvedBaselineEntries = addedPaths.filter((entry) => baseline.has(entry)).sort();

    // The committed-surface file universe: this scope's own additions, filtered by the rule the
    // scanner uses, less anything it removed — evaluated in whichever tree that file exists in.
    const liveTracked = trackedPaths(liveRoot);
    const preTracked = trackedPaths(preRoot);
    const countedAdded = addedPaths.filter((entry) => isPiiScanCounted(liveRoot, liveTracked, entry)).sort();
    const countedRemoved = removedPaths.filter((entry) => isPiiScanCounted(preRoot, preTracked, entry)).sort();

    // The commit-message universe. `A..HEAD` is a difference of reachable sets only while `A` is an
    // ancestor of `HEAD`, so the reverse count is carried alongside and asserted to be empty.
    const commitsSinceBoundary = Number(git(['rev-list', '--count', `${preScope}..HEAD`]).trim());
    const commitsBehindBoundary = Number(git(['rev-list', '--count', `HEAD..${preScope}`]).trim());

    // The spec-artifact reference surface, split into what this scope owns and everything else.
    const addedSet = new Set(addedPaths);
    const liveArtifacts = specArtifactReferenceCounts(liveRoot);
    const preArtifacts = specArtifactReferenceCounts(preRoot);
    let ownedDelta = 0;
    let totalDelta = 0;
    const contributingArtifacts = [];
    for (const artifact of new Set([...liveArtifacts.keys(), ...preArtifacts.keys()])) {
        const delta = (liveArtifacts.get(artifact) ?? 0) - (preArtifacts.get(artifact) ?? 0);
        totalDelta += delta;
        if (!isScopeOwnedSpecArtifact(artifact, addedSet)) continue;
        ownedDelta += delta;
        if (delta !== 0) contributingArtifacts.push(artifact);
    }

    return {
        scanUniverse: { pre: preScanned.length, live: liveScanned.length, added, removed, fromAddedSet },
        baselineReclassification: {
            magnitude: resolvedBaselineEntries.length,
            entries: resolvedBaselineEntries,
        },
        scannedFileUniverse: {
            magnitude: countedAdded.length - countedRemoved.length,
            added: countedAdded,
            removed: countedRemoved,
        },
        commitMessageUniverse: {
            magnitude: commitsSinceBoundary,
            behindBoundary: commitsBehindBoundary,
        },
        specTestReferences: {
            magnitude: ownedDelta,
            totalDelta,
            contributingArtifacts: contributingArtifacts.sort(),
            artifacts: { pre: preArtifacts.size, live: liveArtifacts.size },
            baselineEntries: {
                pre: [...frozenSpecTestPathBaseline(preRoot)].sort(),
                live: [...baseline].sort(),
            },
        },
    };
}

/* Every decimal run becomes a NUL placeholder, so the skeleton comparison is byte-identity over
 * everything that is not a count. A changed word, a reordered clause or a dropped writer name all
 * change the skeleton and can never be attributed. */
const NUMBER_TOKEN = /\d+/g;

function splitNumbers(line) {
    const numbers = [];
    const skeleton = line.replace(NUMBER_TOKEN, (matched) => {
        numbers.push(Number(matched));
        return '\u0000';
    });
    return { skeleton, numbers };
}

/**
 * The message fragments that anchor a rule to the one line it explains.
 *
 * The first two rules were written before this file carried any anchor and identify their line by
 * arithmetic alone, which is why each binds the EXACT pre and live sizes rather than a delta. The
 * three added later are anchored instead: a repository-wide file tally and a commit tally can
 * plausibly move by the same amount as something else, and a rule that matched on magnitude alone
 * would then attribute a difference it had not actually explained. An anchor is strictly narrower
 * than no anchor, and it fails closed — reword the assertion in `selftest.mjs` and the line becomes
 * unattributed rather than silently waved through.
 */
const PII_FILE_COUNT_MARKER = 'the scan covered the repository (files=';
const PII_MESSAGE_COUNT_MARKER = 'the scan covered commit messages (messages=';
const SPEC_TEST_REFERENCE_MARKER = 'reference(s) across';

/** The closed set of reasons a difference may carry. Anything else is a bug in the classifier. */
const ATTRIBUTION_REASONS = Object.freeze([
    'production-source-scan-universe',
    'frozen-baseline-reclassification',
    'committed-surface-file-universe',
    'committed-surface-commit-messages',
    'scope-artifact-test-references',
]);

/**
 * Name the attribution for one differing line, or `null` when nothing accounts for it.
 *
 * Every shape requires the skeleton to be byte-identical, so this is strictly narrower than the
 * comparison it replaces everywhere the counts did not move — a scope adding nothing derives empty
 * magnitudes and gets exact byte-identity back.
 */
function classifyDifference(preLine, liveLine, attribution) {
    const before = splitNumbers(preLine);
    const after = splitNumbers(liveLine);
    if (before.skeleton !== after.skeleton) return null;
    if (before.numbers.length !== after.numbers.length) return null;

    const moved = [];
    for (let index = 0; index < before.numbers.length; index += 1) {
        const delta = after.numbers[index] - before.numbers[index];
        if (delta !== 0) moved.push({ index, pre: before.numbers[index], live: after.numbers[index], delta });
    }
    if (moved.length === 0) return null;

    /* The anchored rules come first so a line that names its own counter is never claimed by a
     * rule that identifies its line by arithmetic. Each requires exactly ONE number to have moved,
     * which is how the other counters on the same line are asserted to be invariant. */

    // The committed-surface file tally, which grows by this scope's own additions — filtered by the
    // rule `pii-scan.mjs` uses to decide what it counts, not by "every path git reports as added".
    const files = attribution.scannedFileUniverse;
    if (
        preLine.includes(PII_FILE_COUNT_MARKER)
        && moved.length === 1
        && files.magnitude !== 0
        && moved[0].delta === files.magnitude
    ) {
        return 'committed-surface-file-universe';
    }

    // The commit-message tally, which grows by exactly the commits between the boundary and HEAD.
    // Deriving it rather than pinning one is what keeps the rule true if the scope later lands
    // across several commits.
    const messages = attribution.commitMessageUniverse;
    if (
        preLine.includes(PII_MESSAGE_COUNT_MARKER)
        && moved.length === 1
        && messages.magnitude > 0
        && moved[0].delta === messages.magnitude
    ) {
        return 'committed-surface-commit-messages';
    }

    // The spec-artifact reference tally, which grows by the `tests/*.mjs` references this scope's
    // own artifacts contribute. The single-move requirement is the invariant half: this scope adds
    // no spec artifact and no baseline entry, so those two counters on the same line must not move.
    const references = attribution.specTestReferences;
    if (
        preLine.includes(SPEC_TEST_REFERENCE_MARKER)
        && moved.length === 1
        && references.magnitude !== 0
        && moved[0].delta === references.magnitude
    ) {
        return 'scope-artifact-test-references';
    }

    // Growth of the production-source scan universe, bound to the EXACT sizes of the two trees
    // rather than to a delta, so a different count that happens to move by the same amount fails.
    const scan = attribution.scanUniverse;
    if (
        moved.length === 1
        && scan.live !== scan.pre
        && moved[0].pre === scan.pre
        && moved[0].live === scan.live
    ) {
        return 'production-source-scan-universe';
    }

    // Reclassification across the frozen baseline: entries leave one bucket and enter another, so
    // the deltas are equal and opposite and their magnitude is the number of baseline-listed files
    // this scope added. Conservation is asserted, not assumed.
    const magnitude = attribution.baselineReclassification.magnitude;
    if (
        magnitude > 0
        && moved.length === 2
        && moved[0].delta + moved[1].delta === 0
        && Math.abs(moved[0].delta) === magnitude
    ) {
        return 'frozen-baseline-reclassification';
    }

    return null;
}

/* =============================================================================================
 * T-01-C1
 * =========================================================================================== */

test('T-01-C1: the shared substrate holds its own contracts before any broad rerun', () => {
    /* ---- 1. Export surface -------------------------------------------------------------- */

    const declaredNames = [...EXPECTED_CONSTANTS, ...Object.keys(EXPECTED_FUNCTION_ARITY)].sort();
    assert.deepEqual(
        Object.keys(support).sort(),
        declaredNames,
        'the support module exports exactly the surface scopes 02 - 10 import — no more, no fewer',
    );

    for (const name of EXPECTED_CONSTANTS) {
        assert.equal(typeof support[name], 'string', `${name} must be a string constant`);
        assert.ok(support[name].length > 0, `${name} must not be empty`);
    }

    // Arity, not just presence: a helper that quietly grew a required parameter would keep its name
    // and break all nine importing files at once.
    for (const [name, arity] of Object.entries(EXPECTED_FUNCTION_ARITY)) {
        assert.equal(typeof support[name], 'function', `${name} must be a function`);
        assert.equal(support[name].length, arity, `${name} declared arity`);
    }

    /* ---- 2. The four constants resolve to exact, derived locations ----------------------- */

    assert.equal(REPO_ROOT, path.resolve(HERE, '..'), 'REPO_ROOT is derived from the module location');
    assert.equal(FIXTURE_ROOT, path.join(REPO_ROOT, 'tests', 'fixtures', 'recommendation-track-record'));
    assert.equal(CLAIM_FIXTURE_DIR, path.join(FIXTURE_ROOT, 'claims'));
    assert.equal(EXPECTED_SUFFIX, '.expected.json', 'a sibling named .expect.json would load as no expectation at all');
    assert.equal(fs.existsSync(SUPPORT_PATH), true, 'the module under observation must exist at the derived path');

    /* ---- 3. Import side-effect freedom --------------------------------------------------- */

    withDisposableStore(({ root }) => {
        assert.equal(root.startsWith(REPO_ROOT), false, 'the probe scratch must live outside the repository');

        // 3a. Registers zero tests. The runner counts a file with no subtests as one synthetic
        // test, so the claim is differential: importing the support module must leave the counts
        // byte-identical to an empty control file.
        const controlProbe = writeProbe(root, 'control.mjs', 'export const control = true;\n');
        const importProbe = writeProbe(root, 'import-only.mjs', `import ${JSON.stringify(SUPPORT_URL)};\n`);
        const registeringProbe = writeProbe(
            root,
            'registers-two.mjs',
            [
                `import nodeTest from 'node:test';`,
                `import ${JSON.stringify(SUPPORT_URL)};`,
                `nodeTest('canary probe one', () => {});`,
                `nodeTest('canary probe two', () => {});`,
                ``,
            ].join('\n'),
        );

        const controlRun = runNode(['--test', RUNNER_REPORTER, controlProbe]);
        const importRun = runNode(['--test', RUNNER_REPORTER, importProbe]);
        const registeringRun = runNode(['--test', RUNNER_REPORTER, registeringProbe]);

        assert.equal(controlRun.status, 0, 'the control probe must run clean');
        assert.equal(importRun.status, 0, 'the import-only probe must run clean');
        assert.equal(registeringRun.status, 0, 'the registering probe must run clean');

        const controlCounts = parseRunnerCounts(controlRun.stdout);
        const importCounts = parseRunnerCounts(importRun.stdout);
        const registeringCounts = parseRunnerCounts(registeringRun.stdout);

        assert.equal(controlCounts.fail, 0, 'the control probe must not fail');
        assert.deepEqual(
            importCounts,
            controlCounts,
            'importing the support module must register zero tests — its counts must equal an empty file',
        );

        // Adversarial half. Without it a runner reporting a constant would make the row vacuous.
        assert.ok(
            registeringCounts.tests > controlCounts.tests,
            `the counter must move when tests ARE registered: ${registeringCounts.tests} vs ${controlCounts.tests}`,
        );

        // 3b. Prints nothing.
        const silentRun = runNode([importProbe]);
        assert.equal(silentRun.status, 0, 'the import-only probe must exit 0 under plain node');
        assert.equal(silentRun.stdout, '', 'importing the support module must print nothing to stdout');
        assert.equal(silentRun.stderr, '', 'importing the support module must print nothing to stderr');

        // Adversarial half: the channels being asserted empty are genuinely observed.
        const MARKER = 'canary-observes-stdout';
        const noisyProbe = writeProbe(
            root,
            'noisy.mjs',
            [
                `import ${JSON.stringify(SUPPORT_URL)};`,
                `process.stdout.write(${JSON.stringify(MARKER)});`,
                `process.stderr.write(${JSON.stringify(MARKER)});`,
                ``,
            ].join('\n'),
        );
        const noisyRun = runNode([noisyProbe]);
        assert.equal(noisyRun.stdout, MARKER, 'the stdout channel must carry what is written to it');
        assert.equal(noisyRun.stderr, MARKER, 'the stderr channel must carry what is written to it');

        // 3c. Opens no file. Every read must be lazy and inside a function, so the ONLY fs call the
        // import may produce is the ESM loader reading the module's own source: `getSourceSync` ->
        // `readFileSync` -> `openSync` on this very file. A call naming any OTHER path is the
        // module opening a file at import time, which is what this asserts against.
        const resultPath = path.join(root, 'fs-observation.json');
        const fsProbe = writeProbe(root, 'fs-observation.mjs', fsObservationProbeSource());
        const fsRun = runNode([fsProbe, resultPath]);
        assert.equal(fsRun.status, 0, `the fs-observation probe must exit 0: ${fsRun.stderr}`);

        const observed = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
        const foreignAtImport = observed.atImport.filter(
            (call) => normaliseTarget(call.target) !== SUPPORT_PATH,
        );
        assert.deepEqual(
            foreignAtImport,
            [],
            'importing the support module must open no file other than its own source',
        );

        // Adversarial half. `foreignAtImport` being empty proves nothing unless the observer can
        // see a foreign read at all — calling the loader must produce several.
        const foreignDuringLoader = observed.duringLoader.filter(
            (call) => normaliseTarget(call.target) !== SUPPORT_PATH,
        );
        assert.ok(
            foreignDuringLoader.length > 0,
            'the observer must record foreign reads when the loader actually runs, or the import check is vacuous',
        );
        assert.ok(
            foreignDuringLoader.some((call) => normaliseTarget(call.target).startsWith(CLAIM_FIXTURE_DIR)),
            'the loader must read the claim fixture directory it is asked for',
        );
    });

    /* ---- 4. One input of each fixture shape round-trips with its sibling resolved --------- */

    const fixtures = loadClaimFixtures();
    assert.ok(fixtures.length > 0, 'the fixture set is enumerated at test time, never asserted as a count literal');

    const byShape = new Map();
    for (const fixture of fixtures) {
        const shape = fixture.expected.outcome;
        if (!byShape.has(shape)) byShape.set(shape, fixture);
    }
    assert.deepEqual(
        [...byShape.keys()].sort(),
        [...FIXTURE_SHAPES].sort(),
        'every declared fixture shape must be represented, and no undeclared shape may appear',
    );

    for (const shape of FIXTURE_SHAPES) {
        const representative = byShape.get(shape);
        const { name } = representative;

        const reloaded = loadClaimFixture(name);
        assert.equal(reloaded.name, name, `${name}: the loader records the fixture name`);
        assert.deepEqual(reloaded, representative, `${name}: the sweep entry and the single load agree`);

        // The round trip is against the bytes on disk, so a loader that cached or synthesised a
        // value would diverge here rather than agree with itself.
        const rawInput = JSON.parse(fs.readFileSync(path.join(CLAIM_FIXTURE_DIR, `${name}.json`), 'utf8'));
        const rawExpected = JSON.parse(
            fs.readFileSync(path.join(CLAIM_FIXTURE_DIR, `${name}${EXPECTED_SUFFIX}`), 'utf8'),
        );
        assert.deepEqual(reloaded.input, rawInput, `${name}: the input round-trips from disk`);
        assert.deepEqual(reloaded.expected, rawExpected, `${name}: the ${EXPECTED_SUFFIX} sibling is resolved`);
        assert.equal(reloaded.expected.outcome, shape, `${name}: the sibling declares the ${shape} shape`);

        /* Dates come from the input, never from a clock. */
        assert.equal(
            typeof reloaded.input.binding,
            'object',
            `${name}: the fixture must declare a binding block for its dates to be read from`,
        );
        const built = mintInputFrom(reloaded);
        for (const field of DATE_FIELDS) {
            assert.equal(
                built[field],
                reloaded.input.binding[field],
                `${name}: ${field} must be the value the input declares`,
            );
        }

        // A clock-reaching loader would substitute a timestamp for an absent date. Deleting the
        // key must yield exactly `null`.
        for (const field of DATE_FIELDS) {
            const stripped = structuredClone(reloaded);
            delete stripped.input.binding[field];
            assert.equal(
                mintInputFrom(stripped)[field],
                null,
                `${name}: an absent ${field} must resolve to null, never to "now"`,
            );
        }

        // And across a real clock tick the built input must be byte-identical.
        const firstBuild = JSON.stringify(mintInputFrom(reloaded));
        const startedAt = Date.now();
        while (Date.now() === startedAt) { /* spin until the wall clock advances */ }
        assert.ok(Date.now() > startedAt, `${name}: the clock must have advanced for the tick to mean anything`);
        assert.equal(
            JSON.stringify(mintInputFrom(reloaded)),
            firstBuild,
            `${name}: the built input must not vary across a clock tick`,
        );
    }

    // The sibling guard fires rather than loading a missing expectation as "no expectation at all".
    assert.throws(
        () => loadClaimFixture('__canary-absent-sibling__'),
        (error) => error instanceof Error && error.message.includes(EXPECTED_SUFFIX),
        'a fixture without its sibling must throw, never load as an unexpected input',
    );

    /* ---- 5. The loader order is content-derived and stable ------------------------------- */

    const firstPass = loadClaimFixtures().map((fixture) => fixture.name);
    const secondPass = loadClaimFixtures().map((fixture) => fixture.name);
    assert.deepEqual(secondPass, firstPass, 'two calls must return the identical order');
    assert.deepEqual(
        firstPass,
        [...firstPass].sort(),
        'the order must equal the sort of the names — derived from content, not from directory-read order',
    );
    assert.equal(new Set(firstPass).size, firstPass.length, 'no fixture may be enumerated twice');
    assert.equal(Object.isFrozen(fixtures), true, 'the fixture sweep must be frozen so a row cannot mutate it');
    assert.equal(Object.isFrozen(fixtures[0]), true, 'each fixture entry must be frozen');

    /* ---- 6. The repository baseline is unchanged ------------------------------------------ */

    // The parser is checked against a synthetic transcript first. A parser that returned empty
    // structure for every input would make every assertion below it vacuously true.
    const syntheticGroups = ['canary-group-one', 'canary-group-two'];
    const synthetic = [
        '',
        syntheticGroups[0],
        `${PASS_PREFIX}first assertion`,
        `${PASS_PREFIX}second assertion`,
        '  [diagnostics] an indented line that is not an assertion',
        '',
        syntheticGroups[1],
        `${PASS_PREFIX}third assertion`,
        `${FAIL_PREFIX}FAIL: fourth assertion`,
        '',
        SUMMARY_BANNER,
        'Research-Lab self-test: 3 passed, 1 failed',
        SUMMARY_BANNER,
        '',
    ].join('\n');
    const parsedSynthetic = parseSelftestTranscript(synthetic);
    assert.deepEqual(parsedSynthetic.groups.map((group) => group.name), syntheticGroups);
    assert.deepEqual(parsedSynthetic.groups.map((group) => group.lines.length), [2, 2]);
    assert.deepEqual(parsedSynthetic.totals, { passed: 3, failed: 1 });
    assert.equal(countLinesWithPrefix(parsedSynthetic.groups, PASS_PREFIX), 3, 'the parser counts ✓ lines exactly');
    assert.equal(countLinesWithPrefix(parsedSynthetic.groups, FAIL_PREFIX), 1, 'the parser counts ✗ lines exactly');

    // And it detects a transcript whose totals disagree with the lines they claim to summarise.
    const skewed = parseSelftestTranscript(synthetic.replace('3 passed', '4 passed'));
    assert.notEqual(
        skewed.totals.passed,
        countLinesWithPrefix(skewed.groups, PASS_PREFIX),
        'the reconciliation must be able to detect a total that disagrees with its lines',
    );

    const live = liveBaseline();
    assert.equal(live.status, 0, `node scripts/selftest.mjs must exit 0, got ${live.status}`);
    assert.notEqual(live.totals, null, 'the baseline transcript must carry its totals line');
    assert.equal(live.totals.failed, 0, 'the baseline must report 0 failed');
    assert.ok(Number.isInteger(live.totals.passed), 'the passed total must be an integer');
    assert.ok(live.totals.passed > 0, 'the baseline must report a positive passed total, derived and never pinned');

    // Totals reconcile with the lines they summarise. This is the derived form of "the baseline is
    // unchanged" available to a single run: a group emptied or a total drifting from its own
    // transcript fails here without any figure being written down.
    assert.equal(
        countLinesWithPrefix(live.groups, PASS_PREFIX),
        live.totals.passed,
        'the reported passed total must equal the number of ✓ lines in the transcript',
    );
    assert.equal(
        countLinesWithPrefix(live.groups, FAIL_PREFIX),
        live.totals.failed,
        'the reported failed total must equal the number of ✗ lines in the transcript',
    );

    // Group lines intact: every group is named once and still carries assertions.
    const groupNames = live.groups.map((group) => group.name);
    assert.ok(groupNames.length > 0, 'the baseline must report at least one group');
    assert.equal(new Set(groupNames).size, groupNames.length, 'no two groups may share a name');
    for (const group of live.groups) {
        assert.ok(group.lines.length > 0, `group "${group.name}" carries no assertion — an emptied group is a deleted one`);
    }
});

/* =============================================================================================
 * T-01-C2
 * =========================================================================================== */

test('T-01-C2: the restore path is rehearsed in a disposable worktree, never on the live tree', () => {
    /* ---- 1. The live tree carries nothing outside this scope's allowed file families ------ */

    // The classifier is checked against known answers first. One that returned true for everything
    // would wave every entry through while reporting green.
    assert.equal(isAllowedPath('tests/recommendation-track-record.canary.mjs'), true, 'this file is in family');
    assert.equal(isAllowedPath('rlclaims.js'), true, 'the claim module is in family');
    assert.equal(isAllowedPath('tests/fixtures/recommendation-track-record/claims/x.json'), true, 'fixtures are in family');
    assert.equal(isAllowedPath('briefs/objects/claims/2026-08-18-example.json'), true, 'a published claim object is in family');
    assert.equal(isAllowedPath(`${SCOPE_ARTIFACT_PREFIX}report.md`), true, "the scope's own artifacts are in family");
    assert.equal(isAllowedPath('rlvalidation.js'), false, 'a 007-owned module is out of family');
    assert.equal(isAllowedPath('scripts/selftest.mjs'), false, 'the baseline script is out of family');
    assert.equal(isAllowedPath('rlclaims.js.bak'), false, 'an exact-match family must not widen into a prefix');
    assert.equal(isAllowedPath('briefs/objects/recommendations/x.json'), false, "a sibling brief-object family is out of family");
    assert.equal(isAllowedPath('tests/other-feature.unit.mjs'), false, "a neighbouring feature's test file is out of family");

    // The scan-universe classifier gets the same treatment, because it decides which added files
    // are allowed to move a count below. One that returned true for everything would inflate the
    // attribution and wave a real regression through.
    assert.equal(isScannedProductionSource('rlclaims.js'), true, 'a root-level module is scanned');
    assert.equal(isScannedProductionSource('index.html'), true, 'a root-level page is scanned');
    assert.equal(isScannedProductionSource('rlexperience-adapters/rlvol.js'), true, 'an adapter module is scanned');
    assert.equal(isScannedProductionSource('tests/recommendation-track-record.unit.mjs'), false, 'a test file is not a production source');
    assert.equal(isScannedProductionSource('scripts/selftest.mjs'), false, 'a script is not a root-level source');
    assert.equal(isScannedProductionSource('rlexperience-adapters/nested/deep.js'), false, 'the adapter family is one level deep');
    assert.equal(isScannedProductionSource('notes/market-brief.md'), false, 'a note is not a production source');

    const porcelain = git(['status', '--porcelain']).split('\n').filter((line) => line !== '');
    const workingTree = porcelain.map((entry) => ({ raw: entry, status: entry.slice(0, 2), target: entry.slice(3) }));
    for (const entry of workingTree) {
        assert.equal(
            entry.target.startsWith('"'),
            false,
            `porcelain quoted "${entry.raw}" — a path needing quoting is not one this scope creates`,
        );
        assert.equal(isAllowedPath(entry.target), true, `working-tree entry outside the allowed families: ${entry.raw}`);
    }

    /* ---- 1b. The pre-scope boundary, derived from history rather than from a clean tree -- */

    const head = git(['rev-parse', 'HEAD']).trim();
    const preScope = preScopeCommit();
    assert.match(head, /^[0-9a-f]{40}$/, 'HEAD must resolve to a full object name');
    assert.match(preScope, /^[0-9a-f]{40}$/, 'the pre-scope commit must resolve to a full object name');
    assert.notEqual(preScope, head, 'the boundary must sit before HEAD, or the rehearsal compares a tree with itself');

    // Known answers at both ends of the boundary. A derivation that landed on the wrong commit
    // would rehearse against the wrong tree and attribute this scope's additions to nothing.
    assert.equal(commitCarriesPath(head, SCOPE_ORIGIN_PATH), true, `HEAD must carry ${SCOPE_ORIGIN_PATH}`);
    assert.equal(
        commitCarriesPath(preScope, SCOPE_ORIGIN_PATH),
        false,
        `the pre-scope commit must not carry ${SCOPE_ORIGIN_PATH} — the boundary is one commit too late`,
    );

    /* This scope's additions, and the only things that may account for a count that moved: the
     * files committed since the boundary, unioned with any still-untracked ones. */
    const untracked = workingTree.filter((entry) => entry.status === '??').map((entry) => entry.target);
    const addedPaths = scopeAddedPaths(preScope, untracked);
    const removedPaths = scopeRemovedPaths(preScope);
    assert.ok(addedPaths.length > 0, 'the rehearsal is vacuous unless this scope actually added something');
    for (const added of addedPaths) {
        assert.equal(isAllowedPath(added), true, `this scope added a file outside the allowed families: ${added}`);
    }

    /* No collateral modification. A tracked file may be dirty only when this scope owns it — one of
     * its own planning artifacts, or a file it added itself. Editing anything else is collateral,
     * which is exactly what destroys the clean back-out this row exists to prove. The rule used to
     * read "must be untracked", which held only while the scope was uncommitted: once delivered,
     * every file it owns is tracked, and that phrasing refused the scope's own maintenance. */
    const ownedByScope = new Set(addedPaths);
    for (const entry of workingTree) {
        if (entry.status === '??') continue;
        assert.equal(
            entry.target.startsWith(SCOPE_ARTIFACT_PREFIX) || ownedByScope.has(entry.target),
            true,
            `${entry.target} is tracked and modified but not owned by this scope — that is collateral`,
        );
    }

    /* ---- 2. Rehearse the restore in a disposable detached worktree ------------------------ */

    const live = liveBaseline();
    assert.equal(live.status, 0, 'the live baseline must exit 0 before it can be a comparison basis');
    assert.equal(live.totals.failed, 0, 'the live baseline must report 0 failed');

    // The determinism control: a second run of the SAME tree. Every position it disagrees with is
    // unstable by construction, and only those are excused from the byte comparison below.
    const control = runSelftest(REPO_ROOT);
    assert.equal(control.status, 0, `the control run must exit 0, got ${control.status}`);
    assert.equal(control.totals.failed, 0, 'the control run must report 0 failed');
    assert.equal(
        control.totals.passed,
        live.totals.passed,
        'two runs of the live tree must report the identical passed total',
    );
    const unstable = unstableLineKeys(live, control);

    // The mask may not swallow a whole group, which is the one way a derived exclusion could hide a
    // real regression rather than excuse a known drift.
    for (const group of live.groups) {
        const maskedInGroup = group.lines.filter((_, index) => unstable.has(lineKey(group.name, index))).length;
        assert.ok(
            maskedInGroup < group.lines.length,
            `group "${group.name}" is entirely non-deterministic — the mask would swallow it whole`,
        );
    }

    // The scratch root holds the worktree. It is managed here rather than through
    // `withDisposableStore` because the ordering is load-bearing: git must deregister the worktree
    // BEFORE the directory is deleted, and the helper's cleanup would delete it first.
    const scratch = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'rtr-restore-'));
    const worktree = path.join(scratch, 'pre-scope');
    assert.equal(scratch.startsWith(REPO_ROOT), false, 'the rehearsal must happen outside the repository');

    try {
        git(['worktree', 'add', '--detach', worktree, preScope]);

        assert.equal(fs.existsSync(path.join(worktree, 'scripts', 'selftest.mjs')), true,
            'the worktree must carry the committed baseline script');
        // The restore target is *absent*: none of this scope's new files exist at the boundary.
        assert.equal(fs.existsSync(path.join(worktree, 'rlclaims.js')), false,
            'the pre-scope tree must not contain the claim module');
        assert.equal(fs.existsSync(path.join(worktree, 'tests', 'recommendation-track-record.support.mjs')), false,
            'the pre-scope tree must not contain the support module');
        assert.equal(fs.existsSync(path.join(worktree, 'tests', 'fixtures', 'recommendation-track-record')), false,
            'the pre-scope tree must not contain the fixture root');

        const pre = runSelftest(worktree);
        assert.equal(pre.status, 0, `the pre-scope baseline must exit 0, got ${pre.status}`);
        assert.notEqual(pre.totals, null, 'the pre-scope transcript must carry its totals line');
        assert.equal(pre.totals.failed, 0, 'the pre-scope baseline must report 0 failed');
        assert.equal(
            countLinesWithPrefix(pre.groups, PASS_PREFIX),
            pre.totals.passed,
            'the pre-scope totals must reconcile with the lines they summarise',
        );

        // Every pre-existing group survives, its passing-assertion count never falls, and every
        // line that moved is accounted for by this scope's own additions. This is AC-018's "no
        // pre-existing count decreasing" stated exactly, plus the attribution that makes a
        // difference either explained or a failure — never merely tolerated.
        const attribution = deriveAttribution(REPO_ROOT, worktree, addedPaths, removedPaths, preScope);

        // The scan universe may only have GROWN, and by exactly the files the porcelain names.
        // Two independent derivations agreeing is what makes the magnitude an attribution.
        assert.deepEqual(
            attribution.scanUniverse.removed,
            [],
            'no production source may leave the scan universe — this scope is purely additive',
        );
        assert.deepEqual(
            attribution.scanUniverse.added,
            attribution.scanUniverse.fromAddedSet,
            'the scan-universe growth must be exactly the production sources git reports as added',
        );
        assert.equal(
            attribution.scanUniverse.live - attribution.scanUniverse.pre,
            attribution.scanUniverse.added.length,
            'the derived scan sizes must differ by exactly the number of added production sources',
        );
        for (const entry of attribution.scanUniverse.added) {
            assert.equal(isAllowedPath(entry), true, `added production source outside the allowed families: ${entry}`);
        }
        for (const entry of attribution.baselineReclassification.entries) {
            assert.equal(isAllowedPath(entry), true, `resolved baseline entry outside the allowed families: ${entry}`);
        }

        // The committed-surface file universe may only have GROWN, and only within the families
        // this scope owns. `removed` is derived rather than assumed empty, so a deletion would
        // shrink the magnitude instead of quietly leaving it overstated.
        assert.deepEqual(
            attribution.scannedFileUniverse.removed,
            [],
            'no scanned file may leave the committed surface — this scope is purely additive',
        );
        assert.ok(
            attribution.scannedFileUniverse.magnitude > 0,
            'this scope must add at least one file the committed-surface scan counts, or the file rule is inert',
        );
        for (const entry of attribution.scannedFileUniverse.added) {
            assert.equal(isAllowedPath(entry), true, `scanned added file outside the allowed families: ${entry}`);
        }

        // The commit-message universe. `<boundary>..HEAD` counts a difference of reachable sets
        // only while the boundary is an ancestor of HEAD, so the reverse count must be empty —
        // otherwise the magnitude is the size of one side of a fork, which explains nothing.
        assert.equal(
            attribution.commitMessageUniverse.behindBoundary,
            0,
            'the boundary must be an ancestor of HEAD, or the commit-message delta is not a difference of reachable sets',
        );
        assert.ok(
            attribution.commitMessageUniverse.magnitude > 0,
            'at least one commit must separate the boundary from HEAD, or the message rule is inert',
        );

        // The spec-artifact reference surface. The invariant halves are asserted directly rather
        // than left to the classifier: this scope writes into artifacts that already existed and
        // adds no frozen baseline entry, so the artifact tally and the baseline must be identical
        // across the two trees. The whole growth must come from artifacts this scope owns — an
        // unowned artifact contributing a reference is not this scope's footprint.
        assert.equal(
            attribution.specTestReferences.artifacts.live,
            attribution.specTestReferences.artifacts.pre,
            'this scope adds no spec artifact file, so the scanned-artifact tally must not move',
        );
        assert.deepEqual(
            attribution.specTestReferences.baselineEntries.live,
            attribution.specTestReferences.baselineEntries.pre,
            'this scope adds no frozen baseline entry, so the baseline must be identical across the two trees',
        );
        assert.equal(
            attribution.specTestReferences.totalDelta,
            attribution.specTestReferences.magnitude,
            "every tests/*.mjs reference the specs tree gained must come from an artifact this scope owns",
        );
        assert.ok(
            attribution.specTestReferences.contributingArtifacts.length > 0,
            'at least one owned artifact must contribute a reference, or the reference rule is inert',
        );
        for (const entry of attribution.specTestReferences.contributingArtifacts) {
            assert.equal(isAllowedPath(entry), true, `contributing spec artifact outside the allowed families: ${entry}`);
        }

        // Adversarial half for the classifier itself, against known answers built FROM the derived
        // attribution. A classifier that returned a name for everything would attribute a genuine
        // regression and certify the property this row exists to test.
        const scanShape = (value) => `a message carrying ${value} files and 3 writers`;
        assert.equal(
            classifyDifference(scanShape(attribution.scanUniverse.pre), scanShape(attribution.scanUniverse.live), attribution),
            'production-source-scan-universe',
            'the exact pre/live scan sizes are attributable',
        );
        assert.equal(
            classifyDifference(scanShape(attribution.scanUniverse.pre), `${scanShape(attribution.scanUniverse.live)} and a new clause`, attribution),
            null,
            'a changed word is never attributable, however the counts moved',
        );
        assert.equal(
            classifyDifference('a message carrying 3 writers', 'a message carrying 4 writers', attribution),
            null,
            'a count that is not the scan size is unattributable even when it moves by the same amount',
        );
        assert.equal(
            classifyDifference(scanShape(attribution.scanUniverse.pre), scanShape(attribution.scanUniverse.live + 1), attribution),
            null,
            'the scan size must land on the live tree size exactly, not merely move',
        );

        const magnitude = attribution.baselineReclassification.magnitude;
        const bucketShape = (known, stale) => `${known} known-missing, ${stale} stale of 221 referenced`;
        assert.equal(
            classifyDifference(bucketShape(71, 6), bucketShape(71 - magnitude, 6 + magnitude), attribution),
            'frozen-baseline-reclassification',
            'an equal-and-opposite move of the derived magnitude is attributable',
        );
        assert.equal(
            classifyDifference(bucketShape(71, 6), bucketShape(71 - magnitude - 1, 6 + magnitude + 1), attribution),
            null,
            'a reclassification larger than this scope accounts for is unattributable',
        );
        assert.equal(
            classifyDifference(bucketShape(71, 6), bucketShape(71 - magnitude, 6 + magnitude + 1), attribution),
            null,
            'a reclassification that does not conserve its total is unattributable',
        );

        /* Adversarial half for the three anchored rules. The probe base is one past the live scan
         * size, so no probe can be claimed by the unanchored scan-universe rule and each therefore
         * exercises the rule it names. Each rule is shown to accept exactly its derived magnitude,
         * to refuse one more than that, and to refuse the same magnitude carried on a line it is
         * not anchored to — a rule that said yes to any movement of its own counter would attribute
         * a genuine regression and certify the property this row exists to test. */
        const probeBase = attribution.scanUniverse.pre + 1;

        const fileMagnitude = attribution.scannedFileUniverse.magnitude;
        const filesShape = (value) => `${PII_FILE_COUNT_MARKER}${value})`;
        assert.equal(
            classifyDifference(filesShape(probeBase), filesShape(probeBase + fileMagnitude), attribution),
            'committed-surface-file-universe',
            "a file tally that moved by exactly this scope's added-and-scanned files is attributable",
        );
        assert.equal(
            classifyDifference(filesShape(probeBase), filesShape(probeBase + fileMagnitude + 1), attribution),
            null,
            'a file tally that moved further than this scope added is unattributable',
        );
        assert.equal(
            classifyDifference(
                `an unrelated message carrying ${probeBase} files`,
                `an unrelated message carrying ${probeBase + fileMagnitude} files`,
                attribution,
            ),
            null,
            'the file magnitude on a line the rule is not anchored to is unattributable',
        );

        const messageMagnitude = attribution.commitMessageUniverse.magnitude;
        const messagesShape = (value) => `${PII_MESSAGE_COUNT_MARKER}${value})`;
        assert.equal(
            classifyDifference(messagesShape(probeBase), messagesShape(probeBase + messageMagnitude), attribution),
            'committed-surface-commit-messages',
            'a message tally that moved by exactly the commits since the boundary is attributable',
        );
        assert.equal(
            classifyDifference(messagesShape(probeBase), messagesShape(probeBase + messageMagnitude + 1), attribution),
            null,
            'a message tally that moved further than the commits since the boundary is unattributable',
        );
        assert.equal(
            classifyDifference(
                `an unrelated message carrying ${probeBase} messages`,
                `an unrelated message carrying ${probeBase + messageMagnitude} messages`,
                attribution,
            ),
            null,
            'the message magnitude on a line the rule is not anchored to is unattributable',
        );

        const referenceMagnitude = attribution.specTestReferences.magnitude;
        const referencesShape = (references, artifacts, entries) =>
            `the guard is not vacuously green (${references} ${SPEC_TEST_REFERENCE_MARKER} ${artifacts} artifact(s), baseline ${entries} entries)`;
        const referencesBefore = referencesShape(probeBase, probeBase, probeBase);
        assert.equal(
            classifyDifference(
                referencesBefore,
                referencesShape(probeBase + referenceMagnitude, probeBase, probeBase),
                attribution,
            ),
            'scope-artifact-test-references',
            "a reference tally that moved by exactly this scope's own contribution is attributable",
        );
        assert.equal(
            classifyDifference(
                referencesBefore,
                referencesShape(probeBase + referenceMagnitude + 1, probeBase, probeBase),
                attribution,
            ),
            null,
            'a reference tally that moved further than this scope contributes is unattributable',
        );
        assert.equal(
            classifyDifference(
                referencesBefore,
                referencesShape(probeBase + referenceMagnitude, probeBase + 1, probeBase),
                attribution,
            ),
            null,
            'a moving artifact tally is unattributable however the references moved',
        );
        assert.equal(
            classifyDifference(
                referencesBefore,
                referencesShape(probeBase + referenceMagnitude, probeBase, probeBase + 1),
                attribution,
            ),
            null,
            'a moving baseline tally is unattributable however the references moved',
        );

        const liveByName = new Map(live.groups.map((group) => [group.name, group]));
        const unattributed = [];
        const attributed = [];
        for (const group of pre.groups) {
            const counterpart = liveByName.get(group.name);
            assert.notEqual(counterpart, undefined, `pre-existing group "${group.name}" is missing from the live run`);
            assert.ok(
                passCount(counterpart) >= passCount(group),
                `group "${group.name}": a pre-existing pass count fell from ${passCount(group)} to ${passCount(counterpart)}`,
            );

            for (let index = 0; index < group.lines.length; index += 1) {
                // Positions the control run proved unstable carry a sample statistic in their
                // message. They are excused from the text comparison and from nothing else.
                if (unstable.has(lineKey(group.name, index))) continue;
                const liveLine = counterpart.lines[index];
                if (liveLine === group.lines[index]) continue;
                const reason = liveLine === undefined
                    ? null
                    : classifyDifference(group.lines[index], liveLine, attribution);
                if (reason === null) {
                    unattributed.push({ group: group.name, index, pre: group.lines[index], live: liveLine ?? '<absent>' });
                } else {
                    attributed.push({ group: group.name, index, reason });
                }
            }
        }

        assert.equal(
            unattributed.length,
            0,
            `every cross-tree difference must be attributable to this scope's own additions; `
            + `${unattributed.length} was not, and an unexplained difference is a regression:\n`
            + unattributed
                .map((entry) => `  group "${entry.group}" line ${entry.index}\n    pre : ${entry.pre}\n    live: ${entry.live}`)
                .join('\n'),
        );

        // Attribution is a narrowing of byte-identity, never a widening: nothing may be attributed
        // beyond what the derived magnitudes can produce.
        const attributedReasons = new Set(attributed.map((entry) => entry.reason));
        for (const reason of attributedReasons) {
            assert.ok(
                ATTRIBUTION_REASONS.includes(reason),
                `unknown attribution reason "${reason}" — the closed set must stay closed`,
            );
        }

        // Relative order of the pre-existing groups is preserved, so a new group cannot be inserted
        // by renumbering or relabelling one that was already there.
        const preNames = new Set(pre.groups.map((group) => group.name));
        assert.deepEqual(
            live.groups.map((group) => group.name).filter((name) => preNames.has(name)),
            pre.groups.map((group) => group.name),
            'the pre-existing groups must appear in the live run in their original order',
        );

        // Additive-only arithmetic, derived rather than pinned: the whole total delta is
        // attributable to groups the live run added plus growth inside pre-existing ones. No figure
        // is written down anywhere.
        const addedInNewGroups = live.groups
            .filter((group) => !preNames.has(group.name))
            .reduce((running, group) => running + group.lines.length, 0);
        const growthInPreExistingGroups = pre.groups.reduce(
            (running, group) => running + (liveByName.get(group.name).lines.length - group.lines.length),
            0,
        );
        assert.equal(
            live.totals.passed,
            pre.totals.passed + addedInNewGroups + growthInPreExistingGroups,
            'the live total must be the pre-scope total plus exactly the assertions the live run added',
        );
    } finally {
        // Teardown runs whether the rehearsal succeeded or failed, so a failure cannot leak a
        // worktree. It asserts nothing here: an assertion in `finally` would mask the real failure,
        // so the leak checks sit after the block instead.
        spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: REPO_ROOT, encoding: 'utf8' });
        spawnSync('git', ['worktree', 'prune'], { cwd: REPO_ROOT, encoding: 'utf8' });
        fs.rmSync(scratch, { recursive: true, force: true });
    }

    /* ---- 3. Nothing leaked --------------------------------------------------------------- */

    assert.equal(fs.existsSync(worktree), false, 'the worktree directory must be gone');
    assert.equal(fs.existsSync(scratch), false, 'the disposable scratch root must be gone');
    assert.equal(
        git(['worktree', 'list']).includes(scratch),
        false,
        'no worktree entry may still reference the disposable scratch root',
    );
});
