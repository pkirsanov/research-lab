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
 * the amount this scope's own additions account for, derived per run and cross-checked against
 * `git status --porcelain`. A count that moves for any other reason is unattributed and fails.
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
 * Attributable delta.
 *
 * `scripts/selftest.mjs` embeds counts DERIVED from the tree in its assertion messages, so a scope
 * that legitimately adds a file moves those counts. Two move here, and neither is a regression:
 *
 *   - `#L7665` reports the size of its production-source scan universe, which grows by every
 *     root-level `.js`/`.html` this scope adds;
 *   - `#L8702` reports the frozen spec-test-path tally, where every added `tests/*.mjs` that the
 *     committed baseline lists as known-missing moves from `known-missing` into `stale`.
 *
 * A flat byte comparison therefore cannot go green while the code is correct. Attribution replaces
 * it with something stricter: the non-numeric skeleton must still match byte for byte, and every
 * count that moved must have moved by exactly the amount this scope's own additions account for.
 * Both magnitudes are DERIVED — from the two trees and from the committed baseline — and
 * cross-checked against `git status --porcelain`, so no `1`, `67` or `68` is written down anywhere
 * and a count that moves for any other reason stays unattributed and fails the row.
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

/**
 * What this scope's own additions account for, derived twice from independent sources.
 *
 * The scan-universe delta is read off the two trees; the porcelain is then required to name exactly
 * the same files. Two derivations that agree is what makes this an attribution rather than a
 * restatement of whatever the transcript happened to print.
 */
function deriveAttribution(liveRoot, preRoot, addedPaths) {
    const liveScanned = scannedProductionSources(liveRoot);
    const preScanned = scannedProductionSources(preRoot);
    const preSet = new Set(preScanned);
    const liveSet = new Set(liveScanned);

    const added = liveScanned.filter((entry) => !preSet.has(entry));
    const removed = preScanned.filter((entry) => !liveSet.has(entry));
    const fromPorcelain = addedPaths.filter(isScannedProductionSource).sort();

    const baseline = frozenSpecTestPathBaseline(liveRoot);
    const resolvedBaselineEntries = addedPaths.filter((entry) => baseline.has(entry)).sort();

    return {
        scanUniverse: { pre: preScanned.length, live: liveScanned.length, added, removed, fromPorcelain },
        baselineReclassification: {
            magnitude: resolvedBaselineEntries.length,
            entries: resolvedBaselineEntries,
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
 * Name the attribution for one differing line, or `null` when nothing accounts for it.
 *
 * Both shapes require the skeleton to be byte-identical, so this is strictly narrower than the
 * comparison it replaces everywhere the counts did not move — a scope adding no production source
 * derives an empty attribution and gets exact byte-identity back.
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
    assert.equal(isAllowedPath('rlvalidation.js'), false, 'a 007-owned module is out of family');
    assert.equal(isAllowedPath('scripts/selftest.mjs'), false, 'the baseline script is out of family');
    assert.equal(isAllowedPath('rlclaims.js.bak'), false, 'an exact-match family must not widen into a prefix');
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

        // Purely additive: outside its own planning artifacts this scope may only ADD files, and
        // that is what makes HEAD the pre-scope commit the rehearsal below checks out.
        if (!entry.target.startsWith(SCOPE_ARTIFACT_PREFIX)) {
            assert.equal(entry.status, '??', `${entry.target} is tracked and modified — this scope must only add files`);
        }
    }

    /* Only the untracked entries are this scope's additions, and only they may account for a count
     * that moved. A directory entry (porcelain collapses untracked trees) is carried through
     * untouched: it matches no scanned-source shape and no baseline path, so it attributes nothing. */
    const addedPaths = workingTree.filter((entry) => entry.status === '??').map((entry) => entry.target);
    assert.ok(addedPaths.length > 0, 'the rehearsal is vacuous unless this scope actually added something');

    /* ---- 2. Rehearse the restore in a disposable detached worktree ------------------------ */

    const head = git(['rev-parse', 'HEAD']).trim();
    assert.match(head, /^[0-9a-f]{40}$/, 'HEAD must resolve to a full object name');

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
        git(['worktree', 'add', '--detach', worktree, head]);

        assert.equal(fs.existsSync(path.join(worktree, 'scripts', 'selftest.mjs')), true,
            'the worktree must carry the committed baseline script');
        // The restore target is *absent*: none of this scope's new files exist at HEAD.
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
        const attribution = deriveAttribution(REPO_ROOT, worktree, addedPaths);

        // The scan universe may only have GROWN, and by exactly the files the porcelain names.
        // Two independent derivations agreeing is what makes the magnitude an attribution.
        assert.deepEqual(
            attribution.scanUniverse.removed,
            [],
            'no production source may leave the scan universe — this scope is purely additive',
        );
        assert.deepEqual(
            attribution.scanUniverse.added,
            attribution.scanUniverse.fromPorcelain,
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
        // beyond what the two derived magnitudes can produce.
        const attributedReasons = new Set(attributed.map((entry) => entry.reason));
        for (const reason of attributedReasons) {
            assert.ok(
                ['production-source-scan-universe', 'frozen-baseline-reclassification'].includes(reason),
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
