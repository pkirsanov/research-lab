#!/usr/bin/env node
/**
 * scenario-receipts.mjs — re-emit a spec's scenario receipts at the CURRENT revision.
 *
 * WHY THIS EXISTS. `scenario-state-resolve.sh:126` defaults its revision to
 * `git rev-parse HEAD`, and `:478` excludes `SCS-REVISION-DRIFT` from the blocking
 * refusals. So every receipt is bound to the revision it was written at, and ANY
 * later commit — from any session, touching any file — silently voids the whole
 * set while the resolver still exits 0. Three hand-run backfill passes for
 * specs/008 were destroyed exactly that way. A manual pass cannot converge against
 * an unavoidable commit stream; a one-command idempotent re-emission can, because
 * it is simply re-run immediately before certification.
 *
 * WHAT IT DOES. For each requested scenario it applies a declared controlled break
 * in an ISOLATED COPY of the working tree, then emits the four receipts the
 * resolver derives states from, by shelling out to the framework's tool-log.sh
 * (which observes real exit codes and has no bypass flag):
 *
 *   red        broken tree, MUST exit non-zero   -> RED_VERIFIED
 *   implement  any exit                          -> IMPLEMENTED
 *   green      restored tree, MUST exit 0        -> GREEN_TARGETED
 *   regression whole test file, MUST exit 0      -> REGRESSION_GREEN
 *
 * ISOLATION IS NOT OPTIONAL. specs/021-execution-receipts-and-session-review-adoption
 * records a real 2026-08-10 incident where a shared module was mutated to neutralise
 * a check and a concurrent session committed inside that window, publishing the
 * neutralised guard. Breaks are therefore applied only in a copy outside the
 * repository, and the shared tree is digest-checked before and after.
 *
 * The copy is of the WORKING TREE, not a `git worktree` at HEAD: sources here are
 * routinely dirty, so a HEAD checkout would exercise different code than the green.
 *
 * SELF-TESTING THIS RUNNER NEEDS `--log-file`. A red receipt that exits 0 makes the
 * resolver raise SCS-RED-NOT-FAILING, and `scenario-state-resolve.sh:478` filters only
 * SCS-REVISION-DRIFT out of the blocking set — so that refusal BLOCKS certification.
 * The receipt log is append-only evidence and must never be rewritten, so proving this
 * runner refuses a bad break has to write somewhere else. `--log-file` redirects the
 * receipts; it skips no check and can fabricate nothing, because the resolver only ever
 * reads the canonical log. Certification runs use the default.
 *
 * Usage:
 *   node scripts/scenario-receipts.mjs --spec <spec-dir> --all
 *   node scripts/scenario-receipts.mjs --spec <spec-dir> --scenarios SCN-008-003,SCN-008-004
 *   node scripts/scenario-receipts.mjs --spec <spec-dir> --list
 *
 * Exit: 0 only when every requested scenario reached COMPLETE.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const NAME = 'scenario-receipts';

/* ------------------------------------------------------------------ helpers */

function fail(message, code = 2) {
  process.stderr.write(`${NAME}: ${message}\n`);
  process.exit(code);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** Regex-escape, because both Playwright --grep and node --test-name-pattern take patterns. */
function reEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function git(args, cwd) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`git ${args.join(' ')} failed: ${(result.stderr || '').trim()}`);
  }
  return result.stdout.trim();
}

function countOccurrences(haystack, needle) {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/** Snippets may be written as an array of lines so a multi-line break stays readable in JSON. */
function snippet(value) {
  return Array.isArray(value) ? value.join('\n') : value;
}

/* --------------------------------------------------------------------- args */

function parseArgs(argv) {
  const options = {
    spec: '',
    map: '',
    scenarios: [],
    all: false,
    list: false,
    keepWorkdir: false,
    quietChild: false,
    agent: 'bubbles.implement',
    json: false,
    logFile: ''
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined) fail(`${arg} requires a value`);
      i += 1;
      return value;
    };
    switch (arg) {
      case '--spec': options.spec = next(); break;
      case '--map': options.map = next(); break;
      case '--scenarios': options.scenarios = next().split(',').map((s) => s.trim()).filter(Boolean); break;
      case '--all': options.all = true; break;
      case '--list': options.list = true; break;
      case '--keep-workdir': options.keepWorkdir = true; break;
      case '--quiet-child': options.quietChild = true; break;
      case '--agent': options.agent = next(); break;
      case '--log-file': options.logFile = next(); break;
      case '--json': options.json = true; break;
      case '-h':
      case '--help':
        process.stdout.write(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n')
          .filter((line) => line.startsWith(' *') || line.startsWith('/**'))
          .map((line) => line.replace(/^\/?\*+ ?/, '')).join('\n') + '\n');
        process.exit(0);
        break;
      default:
        fail(`unknown argument: ${arg}`);
    }
  }
  if (!options.spec) fail('--spec <spec-dir> is required');
  if (!options.all && options.scenarios.length === 0 && !options.list) {
    fail('pass --all or --scenarios <ids> (or --list)');
  }
  return options;
}

/* ------------------------------------------------------------------ context */

function resolveContext(options) {
  const repoRoot = git(['rev-parse', '--show-toplevel'], process.cwd());

  // The FULL 40-character sha, never abbreviated. scenario-state-resolve.sh:291
  // compares by bare string equality while :293 abbreviates BOTH sides when it
  // composes the refusal, so an abbreviated sha reports total loss as success.
  const revision = git(['rev-parse', 'HEAD'], repoRoot);
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    fail(`resolved revision is not a full 40-character sha: ${revision}`);
  }

  const specDir = path.isAbsolute(options.spec) ? options.spec : path.join(repoRoot, options.spec);
  const specRel = path.relative(repoRoot, specDir);
  const manifestPath = path.join(specDir, 'scenario-manifest.json');
  if (!fs.existsSync(manifestPath)) fail(`scenario manifest not found: ${manifestPath}`);
  const manifestRaw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scenarios = Array.isArray(manifestRaw) ? manifestRaw : (manifestRaw.scenarios || []);

  const mapPath = options.map
    ? (path.isAbsolute(options.map) ? options.map : path.resolve(process.cwd(), options.map))
    : path.join(repoRoot, 'scripts', 'scenario-break-map.json');
  if (!fs.existsSync(mapPath)) fail(`break map not found: ${mapPath}`);
  const breakMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

  const toolLog = path.join(repoRoot, '.github', 'bubbles', 'scripts', 'tool-log.sh');
  if (!fs.existsSync(toolLog)) fail(`tool-log.sh not found: ${toolLog}`);

  return {
    repoRoot,
    revision,
    specDir,
    specRel,
    scenarios,
    manifestById: new Map(scenarios.filter((s) => s && s.id).map((s) => [s.id, s])),
    breakMap,
    entries: breakMap.entries || {},
    mapPath,
    toolLog,
    logFile: options.logFile
      ? path.resolve(process.cwd(), options.logFile)
      : path.join(repoRoot, '.specify', 'runtime', 'tool-calls.jsonl')
  };
}

/* ---------------------------------------------------------------- isolation */

function createWorkdir(repoRoot) {
  if (spawnSync('rsync', ['--version'], { encoding: 'utf8' }).status !== 0) {
    fail('rsync is required to build the isolated copy');
  }
  const workdir = fs.mkdtempSync(path.join(os.tmpdir(), 'rl-scenario-receipts-'));
  const result = spawnSync('rsync', [
    '-a',
    '--exclude', 'node_modules/',
    '--exclude', '.codegraph/',
    '--exclude', 'test-results/',
    `${repoRoot}/`,
    `${workdir}/`
  ], { encoding: 'utf8' });

  // 24 is "some source files vanished mid-copy", which is expected against a
  // live tree other sessions are working in and is not a failure of the copy.
  if (result.status !== 0 && result.status !== 24) {
    fail(`rsync into the isolated copy failed (${result.status}): ${(result.stderr || '').trim()}`);
  }

  // `.git` is COPIED, not symlinked. Several suites here assert against the git
  // index — tests/portfolio-survival.support.mjs `trackedPathsContaining` runs
  // `git grep` over tracked files — so a copy without it fails tests the shared
  // tree passes. Symlinking it would make any git write inside a test land in
  // the real repository, which is precisely the isolation this runner exists to
  // guarantee.
  if (!fs.existsSync(path.join(workdir, '.git'))) {
    fail('the isolated copy has no .git, so index-scanning suites would fail spuriously');
  }

  // Symlinked rather than copied: it is large, read-only for our purposes, and
  // `npx --no-install` resolves through the link.
  const modules = path.join(repoRoot, 'node_modules');
  const linked = path.join(workdir, 'node_modules');
  // When repoRoot is a git worktree, its own node_modules is a link, and the copy
  // above already carries it. lstat, not existsSync: a dangling link still EEXISTs.
  let alreadyLinked = true;
  try { fs.lstatSync(linked); } catch { alreadyLinked = false; }
  if (fs.existsSync(modules) && !alreadyLinked) fs.symlinkSync(modules, linked, 'dir');
  return workdir;
}

/* ------------------------------------------------------------- test command */

/**
 * A manifest may link a test at file level (`tests/x.unit.mjs`) or at test level
 * (`tests/x.unit.mjs#name`). Spec 008 uses the second form, spec 015 the first.
 * A file-level identity means the whole file IS the discriminator.
 */
function splitTestIdentity(identity) {
  const hash = identity.indexOf('#');
  if (hash === -1) return { file: identity, testName: null };
  return { file: identity.slice(0, hash), testName: identity.slice(hash + 1) };
}

/**
 * GREEN_LIVE is a trait-derived state: only a scenario whose manifest declares a
 * behaviour trait that owes a live route proof is required to hold it. This set
 * is kept aligned BY NAME with LIVE_TRAITS in
 * `.github/bubbles/scripts/scenario-state-resolve.sh`; if the framework set
 * changes, the resolver refuses and this list must be reconciled rather than
 * guessed at.
 */
const LIVE_TRAITS = new Set(['user-visible-ui', 'api-contract', 'mutable-state', 'degraded-state',
  'shared-consumer', 'dependency-path', 'responsive-accessible', 'runtime-config']);

function owesLiveProof(manifestRow) {
  return (manifestRow.behaviorTraits || []).some((trait) => LIVE_TRAITS.has(trait));
}

function testCommand({ file, testName }, { whole }) {
  const select = !whole && testName !== null;
  if (file.endsWith('.spec.mjs')) {
    const argv = ['--no-install', 'playwright', 'test', file,
      '--config=playwright.config.mjs', '--project=system-chrome'];
    if (select) argv.push('--grep', reEscape(testName));
    argv.push('--reporter=list');
    return { command: 'npx', argv };
  }
  const argv = ['--test'];
  if (select) argv.push('--test-name-pattern', reEscape(testName));
  argv.push(file);
  return { command: 'node', argv };
}

/**
 * A grep that matches NOTHING makes Playwright exit non-zero, which would look
 * exactly like a killed mutant and fabricate a RED. Probe the selection first.
 */
function probeSelection(parts, cwd) {
  if (parts.testName === null) return { ok: true, note: 'file-level identity runs the whole file; there is no selection to probe' };
  if (!parts.file.endsWith('.spec.mjs')) return { ok: true, note: 'node --test selection is checked from the run output' };
  const result = spawnSync('npx', ['--no-install', 'playwright', 'test', parts.file,
    '--config=playwright.config.mjs', '--project=system-chrome',
    '--grep', reEscape(parts.testName), '--list', '--reporter=list'],
  { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    return { ok: false, note: `selection probe exited ${result.status}: ${(result.stdout || '') + (result.stderr || '')}`.trim() };
  }
  const total = /Total:\s*(\d+)\s*test/i.exec(result.stdout || '');
  if (total && Number(total[1]) === 0) return { ok: false, note: 'selection probe matched 0 tests' };
  return { ok: true, note: total ? `selection probe matched ${total[1]} test(s)` : 'selection probe exited 0' };
}

/* ----------------------------------------------------------------- receipts */

function emitReceipt(context, options, { scenarioId, phase, testIdentity, control, claim, implRefs, scope, command, argv, cwd }) {
  const env = {
    ...process.env,
    BUBBLES_TOOL_LOG_FILE: context.logFile,
    BUBBLES_AGENT_NAME: options.agent,
    BUBBLES_SPEC: context.specRel,
    BUBBLES_SCOPE: scope || '',
    BUBBLES_TOOL_LOG_TAGS: phase === 'implement' ? 'implement' : `test,${phase}`,
    BUBBLES_TOOL_LOG_QUIET: '1',
    BUBBLES_SCENARIO_ID: scenarioId,
    BUBBLES_SCENARIO_PHASE: phase,
    BUBBLES_SCENARIO_TEST: testIdentity,
    BUBBLES_SCENARIO_CONTROL: control,
    BUBBLES_SCENARIO_CLAIM: claim,
    BUBBLES_SCENARIO_REVISION: context.revision,
    BUBBLES_SCENARIO_IMPL_REFS: (implRefs || []).join(',')
  };
  const result = spawnSync('bash', [context.toolLog, command, ...argv], { cwd, env, encoding: 'utf8' });
  const output = (result.stdout || '') + (result.stderr || '');
  if (!options.quietChild) process.stdout.write(output);
  return { exitCode: result.status, output };
}

/* --------------------------------------------------------------- one scenario */

function runScenario(context, options, scenarioId, workdir) {
  const entry = context.entries[scenarioId];
  const manifestRow = context.manifestById.get(scenarioId);
  const record = { scenarioId, outcome: 'UNMAPPED', detail: '', phases: {} };

  if (!manifestRow) {
    record.outcome = 'NOT_IN_MANIFEST';
    record.detail = `${scenarioId} is not an id in ${path.join(context.specRel, 'scenario-manifest.json')}`;
    return record;
  }
  if (!entry) {
    record.detail = 'no break-map entry';
    return record;
  }
  if (entry.vacuous) {
    // A REAL FINDING, not a gap: the behavior could not be broken in a way that
    // fails its own test, so the test discriminates nothing. Recorded, never papered over.
    record.outcome = 'VACUOUS_TEST';
    record.detail = entry.vacuousReason || 'declared vacuous with no reason recorded';
    return record;
  }

  const testIdentity = entry.test;
  const linked = manifestRow.linkedTests || [];
  if (!linked.includes(testIdentity)) {
    record.outcome = 'TEST_NOT_LINKED';
    record.detail = `break map cites ${JSON.stringify(testIdentity)}, which is not in the manifest linkedTests for ${scenarioId}`;
    return record;
  }

  const parts = splitTestIdentity(testIdentity);
  const scope = manifestRow.scope || '';
  const claim = entry.claim || manifestRow.title || scenarioId;
  const implRefs = entry.implementationRefs || [entry.breakFile];

  // --- stage the break in the ISOLATED copy only -----------------------------
  const targetRel = entry.breakFile;
  const targetAbs = path.join(workdir, targetRel);
  if (!fs.existsSync(targetAbs)) {
    record.outcome = 'BREAK_FILE_MISSING';
    record.detail = `${targetRel} does not exist in the isolated copy`;
    return record;
  }
  const original = fs.readFileSync(targetAbs, 'utf8');
  const originalHash = sha256(original);

  let broken = original;
  for (const edit of entry.edits) {
    const find = snippet(edit.find);
    const hits = countOccurrences(broken, find);
    if (hits !== 1) {
      // Refuse rather than guess. A snippet that matches 0 times is stale and a
      // snippet that matches N times would break somewhere unintended.
      record.outcome = 'SNIPPET_NOT_UNIQUE';
      record.detail = `snippet occurs ${hits} times in ${targetRel} (exactly 1 required): ${JSON.stringify(find.slice(0, 90))}`;
      return record;
    }
    // A function replacement, because a plain string one would interpret `$&`,
    // `$1` and friends — and the replacement here is source code.
    broken = broken.replace(find, () => snippet(edit.replace));
  }
  if (broken === original) {
    record.outcome = 'BREAK_IS_A_NO_OP';
    record.detail = `applying the declared edits left ${targetRel} byte-identical`;
    return record;
  }

  const probe = probeSelection(parts, workdir);
  record.detail = probe.note;
  if (!probe.ok) {
    record.outcome = 'TEST_SELECTION_EMPTY';
    return record;
  }

  const restore = () => {
    fs.writeFileSync(targetAbs, original, 'utf8');
    return sha256(fs.readFileSync(targetAbs, 'utf8')) === originalHash;
  };

  // --- red -------------------------------------------------------------------
  fs.writeFileSync(targetAbs, broken, 'utf8');
  let red;
  try {
    const cmd = testCommand(parts, { whole: false });
    process.stdout.write(`\n[${scenarioId}] red        (broken ${targetRel}, must exit non-zero)\n`);
    red = emitReceipt(context, options, {
      scenarioId, phase: 'red', testIdentity, control: entry.control, claim, implRefs, scope,
      command: cmd.command, argv: cmd.argv, cwd: workdir
    });
  } finally {
    if (!restore()) {
      record.outcome = 'RESTORE_FAILED';
      record.detail = `${targetRel} did not restore to its pre-break digest in the isolated copy`;
      return record;
    }
  }
  record.phases.red = red.exitCode;

  if (red.exitCode === 0) {
    // The break did not discriminate. Emitting the remaining three receipts here
    // would manufacture a proof the run did not earn, so we stop.
    record.outcome = 'SURVIVED';
    record.detail = 'the red run exited 0 with the break applied, so the test does not discriminate this behavior; downstream receipts were NOT emitted';
    return record;
  }
  if (/^#\s*tests\s+0\b/m.test(red.output)) {
    record.outcome = 'TEST_SELECTION_EMPTY';
    record.detail = 'node --test selected 0 tests, so the non-zero exit was not earned by the discriminator';
    return record;
  }

  // --- implement -------------------------------------------------------------
  // Run in the isolated copy, which carries the same .git, so `cwd` in the
  // receipt is the throwaway path and no home-directory path is ever written
  // into the committed evidence log.
  process.stdout.write(`\n[${scenarioId}] implement  (requiredOutcome: any)\n`);
  const implement = emitReceipt(context, options, {
    scenarioId, phase: 'implement', testIdentity, control: entry.control, claim, implRefs, scope,
    command: 'git', argv: ['--no-pager', 'log', '--oneline', '-3', '--', ...implRefs], cwd: workdir
  });
  record.phases.implement = implement.exitCode;

  // --- green -----------------------------------------------------------------
  // Run in the SAME restored directory, so a passing green is also the proof
  // that the break was fully backed out.
  process.stdout.write(`\n[${scenarioId}] green      (restored ${targetRel}, must exit 0)\n`);
  const greenCmd = testCommand(parts, { whole: false });
  const green = emitReceipt(context, options, {
    scenarioId, phase: 'green', testIdentity, control: entry.control, claim, implRefs, scope,
    command: greenCmd.command, argv: greenCmd.argv, cwd: workdir
  });
  record.phases.green = green.exitCode;
  if (green.exitCode !== 0) {
    record.outcome = 'GREEN_FAILED';
    record.detail = `the restored tree did not pass the discriminator (exit ${green.exitCode})`;
    return record;
  }

  // --- live ------------------------------------------------------------------
  // Only for a scenario whose manifest traits owe a live route proof, and only
  // from a Playwright spec: that runner boots a real server and drives the real
  // page, so the execution genuinely crosses the production boundary. A
  // `node --test` file drives no route, so emitting `live` from one would claim
  // a boundary the run never crossed - it refuses instead.
  //
  // This is a SEPARATE execution from `green`, not a relabelling of it. The two
  // establish different facts about the same behaviour (the targeted test passes
  // after implementation; the production route proves the outcome), and for a
  // browser-driven test the same command is the honest way to observe both.
  if (owesLiveProof(manifestRow)) {
    // The live proof need not be the discriminator. A scenario can be discriminated
    // at the node level and still owe a consumer-surface assertion, in which case the
    // manifest links both. Prefer the mapped test when it is already live-category,
    // otherwise take the first linked Playwright spec.
    const liveIdentity = parts.file.endsWith('.spec.mjs')
      ? testIdentity
      : linked.find((identity) => splitTestIdentity(identity).file.endsWith('.spec.mjs'));
    if (!liveIdentity) {
      record.outcome = 'LIVE_PROOF_UNAVAILABLE';
      record.detail = `${scenarioId} declares a behaviour trait that owes a live route proof, but no linked test is a live-category spec; no live receipt was emitted`;
      return record;
    }
    const liveParts = splitTestIdentity(liveIdentity);
    process.stdout.write(`\n[${scenarioId}] live       (production route via ${liveParts.file}, must exit 0)\n`);
    const liveCmd = testCommand(liveParts, { whole: false });
    const live = emitReceipt(context, options, {
      scenarioId, phase: 'live', testIdentity: liveIdentity, control: entry.control, claim, implRefs, scope,
      command: liveCmd.command, argv: liveCmd.argv, cwd: workdir
    });
    record.phases.live = live.exitCode;
    if (live.exitCode !== 0) {
      record.outcome = 'LIVE_FAILED';
      record.detail = `the live route run over ${parts.file} exited ${live.exitCode}`;
      return record;
    }
  }

  // --- regression ------------------------------------------------------------
  process.stdout.write(`\n[${scenarioId}] regression (whole ${parts.file}, must exit 0)\n`);
  const regressionCmd = testCommand(parts, { whole: true });
  const regression = emitReceipt(context, options, {
    scenarioId, phase: 'regression', testIdentity, control: entry.control, claim, implRefs, scope,
    command: regressionCmd.command, argv: regressionCmd.argv, cwd: workdir
  });
  record.phases.regression = regression.exitCode;
  if (regression.exitCode !== 0) {
    record.outcome = 'REGRESSION_FAILED';
    record.detail = `the broader run over ${parts.file} exited ${regression.exitCode}`;
    return record;
  }

  record.outcome = 'COMPLETE';
  record.detail = 'red non-zero, implement, green 0, regression 0';
  return record;
}

/* --------------------------------------------------------------------- main */

function main() {
  const options = parseArgs(process.argv.slice(2));
  const context = resolveContext(options);

  const mapped = Object.keys(context.entries);
  if (options.list) {
    process.stdout.write(`spec      : ${context.specRel}\n`);
    process.stdout.write(`revision  : ${context.revision}\n`);
    process.stdout.write(`manifest  : ${context.scenarios.length} scenarios\n`);
    process.stdout.write(`break map : ${path.relative(context.repoRoot, context.mapPath)} (${mapped.length} entries)\n\n`);
    for (const scenario of context.scenarios) {
      const entry = context.entries[scenario.id];
      const state = !entry ? 'unmapped' : (entry.vacuous ? 'VACUOUS (finding)' : `mapped -> ${entry.breakFile}`);
      process.stdout.write(`  ${scenario.id}  ${state}\n`);
    }
    process.exit(0);
  }

  const requested = options.all
    ? context.scenarios.map((s) => s.id).filter((id) => context.entries[id])
    : options.scenarios;
  if (requested.length === 0) fail('no scenarios selected');

  // Shared-tree stability, per spec 021 R1.3. Digested before and after the whole
  // window, because the failure this guards against is a concurrent session
  // publishing bytes we mutated.
  const guarded = [...new Set(Object.values(context.entries).map((e) => e.breakFile).filter(Boolean))];
  const before = new Map(guarded
    .filter((rel) => fs.existsSync(path.join(context.repoRoot, rel)))
    .map((rel) => [rel, sha256(fs.readFileSync(path.join(context.repoRoot, rel)))]));

  const workdir = createWorkdir(context.repoRoot);
  process.stdout.write(`${NAME}: spec ${context.specRel}\n`);
  process.stdout.write(`${NAME}: revision ${context.revision}\n`);
  process.stdout.write(`${NAME}: isolated copy ${workdir}\n`);
  process.stdout.write(`${NAME}: receipts append to ${path.relative(context.repoRoot, context.logFile)}\n`);
  process.stdout.write(`${NAME}: ${requested.length} scenario(s) requested\n`);

  const records = [];
  try {
    for (const scenarioId of requested) {
      process.stdout.write(`\n${'='.repeat(78)}\n${scenarioId}\n${'='.repeat(78)}\n`);
      records.push(runScenario(context, options, scenarioId, workdir));
    }
  } finally {
    if (!options.keepWorkdir) fs.rmSync(workdir, { recursive: true, force: true });
    else process.stdout.write(`\n${NAME}: isolated copy kept at ${workdir}\n`);
  }

  let treeStable = true;
  for (const [rel, hash] of before) {
    const now = sha256(fs.readFileSync(path.join(context.repoRoot, rel)));
    if (now !== hash) {
      treeStable = false;
      process.stderr.write(`${NAME}: SHARED TREE CHANGED during the window: ${rel}\n`);
    }
  }

  process.stdout.write(`\n${'='.repeat(78)}\nSUMMARY  spec=${context.specRel}  revision=${context.revision}\n${'='.repeat(78)}\n`);
  for (const record of records) {
    const phases = Object.entries(record.phases).map(([k, v]) => `${k}=${v}`).join(' ');
    process.stdout.write(`  ${record.outcome.padEnd(20)} ${record.scenarioId}  ${phases}\n`);
    if (record.detail) process.stdout.write(`  ${' '.repeat(20)}   ${record.detail}\n`);
  }
  const complete = records.filter((r) => r.outcome === 'COMPLETE').length;
  const vacuous = records.filter((r) => r.outcome === 'VACUOUS_TEST');
  process.stdout.write(`\n  complete   : ${complete}/${records.length}\n`);
  process.stdout.write(`  shared tree: ${treeStable ? 'unchanged for the whole window' : 'CHANGED — investigate before trusting any receipt above'}\n`);
  if (vacuous.length) {
    process.stdout.write(`  vacuous    : ${vacuous.length} scenario(s) whose test discriminates nothing\n`);
    for (const record of vacuous) process.stdout.write(`               ${record.scenarioId}: ${record.detail}\n`);
  }
  process.stdout.write(`  mapped     : ${mapped.length}/${context.scenarios.length} manifest scenarios\n`);

  if (options.json) {
    process.stdout.write(`\n${JSON.stringify({ spec: context.specRel, revision: context.revision, treeStable, records }, null, 2)}\n`);
  }

  const ok = treeStable && records.every((r) => r.outcome === 'COMPLETE');
  process.exit(ok ? 0 : 1);
}

main();
