#!/usr/bin/env node
/*
 * Test-file reachability guard (ratchet).
 *
 * `scripts/validate-spec-test-paths.mjs` answers one half of the coverage
 * question: does every test path a spec NAMES exist on disk? This guard answers
 * the other half, which nothing was asking: does every test file that EXISTS on
 * disk get picked up by any verification command this repo declares?
 *
 * Measured on 2026-08-20 at fc9b71280, the answer was no for 62 of 180
 * `tests/*.mjs` files. Whole suffix families — `.functional.mjs`,
 * `.integration.mjs`, `.stress.mjs`, `.load.mjs`, `.security.mjs`,
 * `.canary.mjs` — were written, committed, and never reached by a glob any
 * declared command uses. Two of them had been failing for long enough that
 * their pinned expectations had rotted, and nobody saw it, because nothing ran
 * them. A test that is never selected costs the same to write as one that is,
 * and proves strictly nothing.
 *
 * DERIVATION. Both sides of the comparison are read from the repository at run
 * time. Neither is written down here:
 *   - The FILE set is `readdirSync(tests)` filtered to `*.mjs`.
 *   - The GLOB set is the union of (a) the Playwright discovery matcher parsed
 *     out of `playwright.config.mjs`, which is what the blocking CI browser job
 *     actually selects with, and (b) every glob-shaped `tests/....mjs` token
 *     that sits in ARGUMENT POSITION of a `--test` invocation anywhere in the
 *     committed tree.
 * A frozen copy of either list is the exact defect this guard exists to detect,
 * so it must not be reintroduced to implement it.
 *
 * ARGUMENT POSITION, not co-occurrence. `--test` and a glob appearing on the
 * same line is not a command: 25 such lines are prose in spec reports, and the
 * broadest of them (`tests/` + `*` + `.mjs`) would have made every file
 * trivially reachable and the guard vacuously green. The scanner therefore
 * consumes only the run of tokens after `--test` that are each either a flag or
 * a `tests/....mjs` path, and stops at the first token that is neither.
 *
 * GLOBS ONLY. A command that names one exact file is not counted. Naming a file
 * proves someone once ran it; it cannot keep covering that file when it is
 * renamed, and it never covers the sibling added next to it. The property worth
 * protecting is that a file is selected by a PATTERN, which keeps holding
 * without anyone editing a command.
 *
 * EXEMPTION — one named rule, `shared-helper-module`, never a silent skip. A
 * file is exempt iff BOTH hold, and both are evidenced from the file contents:
 *   1. it imports nothing from `node:test`, so it registers no test of its own
 *      and there is nothing for a runner to select; and
 *   2. at least one other `tests/*.mjs` file imports it, so it is a shared seam
 *      rather than a dead file.
 * This is what `.support.mjs` and the shared Playwright seam satisfy. A file
 * that registers tests is never exempt however it is named, and a file nothing
 * imports is never exempt however it is named. Exempt files are reported, with
 * their importer count, so the exemption stays legible instead of invisible.
 *
 * RATCHET. The debt predates the guard, so the pre-existing orphan set is
 * frozen in a committed baseline and the guard fails ONLY on files that are NOT
 * in it.
 *   - A NEW orphan -> exit 1 (the regression this guard exists to stop).
 *   - A baseline entry that is no longer orphaned -> reported as stale, exit 0.
 *     Remove it; the baseline is meant to shrink, never grow.
 *
 * SELF-DECLARATION. This file and its baseline are excluded from the
 * declaration scan. A guard that quotes a command shape in its own source would
 * declare that shape to itself; the same trap was recorded live in
 * `specs/025-.../scopes.md`, where quoting a validator's diagnostic verbatim
 * into an artifact kept the validator red. For the same reason the findings
 * printed below carry bare glob patterns and never a runnable command line: the
 * output of this guard is routinely pasted into `report.md`, which is inside
 * the scan.
 *
 * VACUITY. A scan that derives zero globs, finds zero test files, or reads zero
 * artifacts fails on its own, baseline or not — a pattern that quietly stopped
 * matching would otherwise reproduce the blind spot this guard closes.
 *
 * Usage:
 *   node scripts/validate-test-file-reachability.mjs [--root <dir>] [--all-sites]
 *   node scripts/validate-test-file-reachability.mjs --update-baseline
 *
 * Exit: 0 = no new orphans (stale baseline entries may be reported)
 *       1 = new orphan(s), a vacuous scan, or a missing baseline file
 *       2 = unusable invocation (unknown argument, including any bypass-shaped
 *           flag — there is no --skip / --force / --ignore / --bypass and there
 *           never will be; accept a new orphan by editing the baseline in a
 *           reviewed commit)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  markdownFenceMask,
  markdownHeadings
} from './validate-scope-dod-progress.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const TESTS_DIR = 'tests';
const BASELINE_REL = 'scripts/validate-test-file-reachability.baseline';
const SELF_REL = 'scripts/validate-test-file-reachability.mjs';
const PLAYWRIGHT_CONFIG_REL = 'playwright.config.mjs';
const EXEMPT_RULE = 'shared-helper-module';

const ARTIFACT_ROLE = Object.freeze({
  PLAYWRIGHT_CONFIG: 'playwright-config',
  COMMAND_REGISTRY: 'command-registry',
  ACTIVE_PLAN: 'active-plan',
  STRUCTURED_TEST_PLAN: 'structured-test-plan',
  VALIDATION_NOTE: 'validation-note',
  HISTORICAL_REPORT: 'historical-report',
  UNKNOWN: 'unknown'
});

const SECTION_ROLE = Object.freeze({
  COMMAND_REGISTRY: 'command-registry',
  TEST_PLAN: 'test-plan',
  VALIDATION: 'validation',
  EVIDENCE: 'evidence',
  NONE: 'none'
});

/* `--test` followed by a run of tokens that are each a flag or a repo test
   path. The trailing guard keeps `--testMatch` and `--test-only` from matching,
   and the one-or-more quantifier is what makes prose inert: the first token
   after `--test` in a sentence is a word, so nothing is captured. */
const NODE_TEST_INVOCATION =
  /--test(?![A-Za-z0-9-])((?:[ \t]+(?:--[A-Za-z0-9][A-Za-z0-9=._/-]*|tests\/[A-Za-z0-9._*/-]*\.mjs))+)/g;

/* A repo-root-relative test path inside an already-isolated argument run. */
const TEST_PATH_ARGUMENT = /tests\/[A-Za-z0-9._*/-]*\.mjs/g;

/* Playwright's discovery matcher, in either the single-string or array form. */
const PLAYWRIGHT_TEST_MATCH_ARRAY = /testMatch:\s*\[([^\]]*)\]/;
const PLAYWRIGHT_TEST_MATCH_STRING = /testMatch:\s*(['"])([^'"]+)\1/;
const QUOTED_STRING = /(['"])([^'"]+)\1/g;

/* `import ... from 'node:test'`, `import 'node:test'`, and `import('node:test')`
   all register the runner; any of them disqualifies a file from being treated
   as a shared helper. */
const NODE_TEST_IMPORT = /(?:from\s*|import\s*|require\s*\(\s*)(['"])node:test\1/;

/* Byte order, so the committed baseline sorts identically to `LC_ALL=C sort` on
   every platform. Test paths are ASCII by construction. */
const byteOrder = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function displayPath(root, abs) {
  const rel = relative(root, abs).split('\\').join('/');
  return rel === '' || rel.startsWith('../') ? abs : rel;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Directory names the working tree carries but the repository does not, read
   out of `.gitignore` rather than listed here so a newly ignored build
   directory is skipped without editing this file. `.git` is always skipped. */
export function ignoredDirectoryMatchers(root = ROOT) {
  const matchers = [/^\.git$/];
  const gitignore = resolve(root, '.gitignore');
  if (!existsSync(gitignore)) return matchers;
  for (const raw of readFileSync(gitignore, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#') || line.startsWith('!')) continue;
    const name = line.replace(/^\//, '').replace(/\/$/, '');
    if (name === '' || name.includes('/')) continue;
    if (name.startsWith('*.') || name.endsWith('.pyc') || name.endsWith('.flock')) continue;
    matchers.push(new RegExp('^' + name.split('*').map(escapeRegExp).join('[^/]*') + '$'));
  }
  return matchers;
}

/* A shell-style glob over repo-root-relative POSIX paths. `**` crosses path
   separators, a single `*` does not — the same split Playwright's own matcher
   uses, so `**` + `/*.spec.mjs` selects the same files here as it does there. */
export function globToRegExp(pattern) {
  let source = '';
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === '*' && pattern[i + 1] === '*') {
      i++;
      if (pattern[i + 1] === '/') { i++; source += '(?:[^/]+/)*'; } else source += '.*';
    } else if (ch === '*') {
      source += '[^/]*';
    } else if (ch === '?') {
      source += '[^/]';
    } else {
      source += escapeRegExp(ch);
    }
  }
  return new RegExp('^' + source + '$');
}

function listFilesRecursive(absDir, ignored) {
  const found = [];
  let entries;
  try { entries = readdirSync(absDir, { withFileTypes: true }); } catch { return found; }
  for (const entry of entries) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) {
      if (ignored.some((matcher) => matcher.test(entry.name))) continue;
      found.push(...listFilesRecursive(abs, ignored));
    } else if (entry.isFile()) {
      found.push(abs);
    }
  }
  return found;
}

function artifactRole(artifact) {
  if (artifact === PLAYWRIGHT_CONFIG_REL) return ARTIFACT_ROLE.PLAYWRIGHT_CONFIG;
  if (artifact === '.specify/memory/agents.md') return ARTIFACT_ROLE.COMMAND_REGISTRY;
  if (/^specs\/.+\/test-plan\.json$/.test(artifact)) return ARTIFACT_ROLE.STRUCTURED_TEST_PLAN;
  if (/^specs\/.+\/(?:scopes\.md|scopes\/[^/]+\/scope\.md)$/.test(artifact)) {
    return ARTIFACT_ROLE.ACTIVE_PLAN;
  }
  if (/^specs\/.+\/report\.md$/.test(artifact)) return ARTIFACT_ROLE.HISTORICAL_REPORT;
  if (/^notes\/.+\.md$/.test(artifact)) return ARTIFACT_ROLE.VALIDATION_NOTE;
  return ARTIFACT_ROLE.UNKNOWN;
}

function headingSectionRole(text) {
  if (/\bcommand registry\b/i.test(text)) return SECTION_ROLE.COMMAND_REGISTRY;
  if (/\btest plan\b/i.test(text)) return SECTION_ROLE.TEST_PLAN;
  if (/^validation(?:\b|\s)/i.test(text)) return SECTION_ROLE.VALIDATION;
  if (/\b(?:test evidence|execution evidence|evidence|verification|before fix|after fix)\b/i.test(text)) {
    return SECTION_ROLE.EVIDENCE;
  }
  return SECTION_ROLE.NONE;
}

function markdownSectionRoles(lines) {
  const fenceMask = markdownFenceMask(lines);
  const headings = markdownHeadings(lines, fenceMask);
  const roles = new Array(lines.length).fill(SECTION_ROLE.NONE);
  const ancestry = [];
  let headingIndex = 0;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    while (headingIndex < headings.length && headings[headingIndex].line === lineIndex) {
      const heading = headings[headingIndex++];
      while (ancestry.length > 0 && ancestry[ancestry.length - 1].level >= heading.level) ancestry.pop();
      ancestry.push({ level: heading.level, role: headingSectionRole(heading.text) });
    }
    for (let ancestryIndex = ancestry.length - 1; ancestryIndex >= 0; ancestryIndex--) {
      if (ancestry[ancestryIndex].role === SECTION_ROLE.NONE) continue;
      roles[lineIndex] = ancestry[ancestryIndex].role;
      break;
    }
  }
  return roles;
}

function nodePatterns(text) {
  const patterns = [];
  NODE_TEST_INVOCATION.lastIndex = 0;
  let invocation;
  while ((invocation = NODE_TEST_INVOCATION.exec(text)) !== null) {
    TEST_PATH_ARGUMENT.lastIndex = 0;
    let argument;
    while ((argument = TEST_PATH_ARGUMENT.exec(invocation[1])) !== null) {
      if (argument[0].includes('*')) patterns.push(argument[0]);
    }
  }
  return patterns;
}

function candidateClassification(artifactRoleValue, sectionRole) {
  if (artifactRoleValue === ARTIFACT_ROLE.HISTORICAL_REPORT) {
    return { authority: 'historical', reason: 'historical-report-receipt' };
  }
  if (
    artifactRoleValue === ARTIFACT_ROLE.COMMAND_REGISTRY
    && sectionRole === SECTION_ROLE.COMMAND_REGISTRY
  ) {
    return { authority: 'active', reason: 'current-command-registry' };
  }
  if (artifactRoleValue === ARTIFACT_ROLE.ACTIVE_PLAN && sectionRole === SECTION_ROLE.TEST_PLAN) {
    return { authority: 'active', reason: 'current-test-plan' };
  }
  if (artifactRoleValue === ARTIFACT_ROLE.VALIDATION_NOTE && sectionRole === SECTION_ROLE.VALIDATION) {
    return { authority: 'active', reason: 'current-validation-note' };
  }
  if (artifactRoleValue === ARTIFACT_ROLE.UNKNOWN) {
    return { authority: 'error', reason: 'unknown-artifact-role' };
  }
  return { authority: 'error', reason: 'unrecognized-authority-section' };
}

function lineCanContainCandidate(line, artifactRoleValue, sectionRole) {
  if (artifactRoleValue === ARTIFACT_ROLE.HISTORICAL_REPORT) return true;
  if (candidateClassification(artifactRoleValue, sectionRole).authority === 'active') return true;
  return /^\s*(?:\$\s+)?node\s+--test\b/.test(line);
}

function structuredTestCommands(parsed) {
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.scopes)) return null;
  const commands = [];
  for (const scope of parsed.scopes) {
    if (!scope || typeof scope !== 'object' || !Array.isArray(scope.tests)) continue;
    for (const testEntry of scope.tests) {
      if (testEntry && typeof testEntry === 'object' && typeof testEntry.command === 'string') {
        commands.push(testEntry.command);
      }
    }
  }
  return commands;
}

/* Every verification glob the repository declares, each carrying the artifact
   and line that declares it. */
export function collectDeclaredTestGlobs(root = ROOT) {
  const byPattern = new Map();
  const historicalSites = [];
  const classificationErrors = [];
  const record = (site) => {
    if (site.authority === 'historical') {
      historicalSites.push(site);
      return;
    }
    if (site.authority === 'error') {
      classificationErrors.push(site);
      return;
    }
    const { pattern, kind } = site;
    if (!byPattern.has(pattern)) byPattern.set(pattern, { pattern, kind, sites: [] });
    byPattern.get(pattern).sites.push(site);
  };

  const configAbs = resolve(root, PLAYWRIGHT_CONFIG_REL);
  let playwrightMatchers = 0;
  if (existsSync(configAbs)) {
    const source = readFileSync(configAbs, 'utf8');
    const line = source.slice(0, source.search(/testMatch:/) + 1).split(/\r?\n/).length;
    const arrayForm = PLAYWRIGHT_TEST_MATCH_ARRAY.exec(source);
    const patterns = [];
    if (arrayForm) {
      QUOTED_STRING.lastIndex = 0;
      let quoted;
      while ((quoted = QUOTED_STRING.exec(arrayForm[1])) !== null) patterns.push(quoted[2]);
    } else {
      const stringForm = PLAYWRIGHT_TEST_MATCH_STRING.exec(source);
      if (stringForm) patterns.push(stringForm[2]);
    }
    for (const pattern of patterns) {
      playwrightMatchers++;
      record({
        pattern,
        kind: 'playwright-testMatch',
        artifact: PLAYWRIGHT_CONFIG_REL,
        line,
        artifactRole: ARTIFACT_ROLE.PLAYWRIGHT_CONFIG,
        sectionRole: SECTION_ROLE.NONE,
        authority: 'active',
        reason: 'playwright-direct-config'
      });
    }
  }

  const ignored = ignoredDirectoryMatchers(root);
  const selfAbs = resolve(root, SELF_REL);
  const baselineAbs = resolve(root, BASELINE_REL);
  let scannedFiles = 0;
  for (const abs of listFilesRecursive(root, ignored).sort()) {
    if (abs === selfAbs || abs === baselineAbs) continue;
    let text;
    try { text = readFileSync(abs, 'utf8'); } catch { continue; }
    if (text.includes('\0')) continue;
    scannedFiles++;
    if (!text.includes('--test')) continue;
    const artifact = displayPath(root, abs);
    const lines = text.split(/\r?\n/);

    const artifactRoleValue = artifactRole(artifact);
    if (artifactRoleValue === ARTIFACT_ROLE.STRUCTURED_TEST_PLAN) {
      const rawCandidates = [];
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        for (const pattern of nodePatterns(lines[lineIndex])) {
          rawCandidates.push({ pattern, line: lineIndex + 1 });
        }
      }
      let commands = null;
      try { commands = structuredTestCommands(JSON.parse(text)); } catch { commands = null; }
      if (commands === null) {
        for (const candidate of rawCandidates) {
          record({
            ...candidate,
            kind: 'node-test-argument',
            artifact,
            artifactRole: artifactRoleValue,
            sectionRole: SECTION_ROLE.NONE,
            authority: 'error',
            reason: 'malformed-structured-test-plan'
          });
        }
        continue;
      }

      const recognizedCandidates = new Map();
      let searchFrom = 0;
      for (const command of commands) {
        const commandNeedle = JSON.stringify(command);
        const commandOffset = text.indexOf(commandNeedle, searchFrom);
        const line = commandOffset < 0
          ? 1
          : text.slice(0, commandOffset + 1).split(/\r?\n/).length;
        if (commandOffset >= 0) searchFrom = commandOffset + commandNeedle.length;
        for (const pattern of nodePatterns(command)) {
          const candidateKey = `${line}\0${pattern}`;
          recognizedCandidates.set(candidateKey, (recognizedCandidates.get(candidateKey) ?? 0) + 1);
          record({
            pattern,
            kind: 'node-test-argument',
            artifact,
            line,
            artifactRole: artifactRoleValue,
            sectionRole: SECTION_ROLE.TEST_PLAN,
            authority: 'active',
            reason: 'structured-test-plan'
          });
        }
      }
      for (const candidate of rawCandidates) {
        const candidateKey = `${candidate.line}\0${candidate.pattern}`;
        const recognizedCount = recognizedCandidates.get(candidateKey) ?? 0;
        if (recognizedCount > 0) {
          recognizedCandidates.set(candidateKey, recognizedCount - 1);
          continue;
        }
        record({
          ...candidate,
          kind: 'node-test-argument',
          artifact,
          artifactRole: artifactRoleValue,
          sectionRole: SECTION_ROLE.NONE,
          authority: 'error',
          reason: 'malformed-structured-test-plan'
        });
      }
      continue;
    }

    const sectionRoles = artifact.endsWith('.md')
      ? markdownSectionRoles(lines)
      : new Array(lines.length).fill(SECTION_ROLE.NONE);
    for (let i = 0; i < lines.length; i++) {
      const sectionRole = sectionRoles[i];
      if (!lineCanContainCandidate(lines[i], artifactRoleValue, sectionRole)) continue;
      const classification = candidateClassification(artifactRoleValue, sectionRole);
      for (const pattern of nodePatterns(lines[i])) {
        record({
          pattern,
          kind: 'node-test-argument',
          artifact,
          line: i + 1,
          artifactRole: artifactRoleValue,
          sectionRole,
          ...classification
        });
      }
    }
  }

  const globs = [...byPattern.values()].sort((a, b) => byteOrder(a.pattern, b.pattern));
  historicalSites.sort((left, right) => (
    byteOrder(left.artifact, right.artifact) || left.line - right.line || byteOrder(left.pattern, right.pattern)
  ));
  classificationErrors.sort((left, right) => (
    byteOrder(left.artifact, right.artifact) || left.line - right.line || byteOrder(left.pattern, right.pattern)
  ));
  return { classificationErrors, globs, historicalSites, playwrightMatchers, scannedFiles };
}

export function readBaseline(absBaselineFile) {
  if (!existsSync(absBaselineFile)) return null;
  const entries = new Set();
  for (const raw of readFileSync(absBaselineFile, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (line === '' || line.startsWith('#')) continue;
    entries.add(line);
  }
  return entries;
}

export function validateTestFileReachability(root = ROOT, options = {}) {
  const testsDir = options.testsDir ?? TESTS_DIR;
  const baselineFile = options.baselineFile
    ? resolve(options.baselineFile)
    : resolve(root, BASELINE_REL);
  const absTests = resolve(root, testsDir);

  const testFiles = (existsSync(absTests) ? readdirSync(absTests) : [])
    .filter((name) => name.endsWith('.mjs'))
    .sort()
    .map((name) => `${testsDir}/${name}`);

  const sources = new Map();
  for (const path of testFiles) {
    try { sources.set(path, readFileSync(resolve(root, path), 'utf8')); } catch { sources.set(path, ''); }
  }

  /* Rule `shared-helper-module`, both clauses evidenced from file contents. */
  const exempt = [];
  const exemptPaths = new Set();
  for (const path of testFiles) {
    if (NODE_TEST_IMPORT.test(sources.get(path))) continue;
    const specifier = new RegExp(
      `(?:from\\s*|import\\s*\\(\\s*)(['"])\\.{1,2}/(?:${escapeRegExp(testsDir)}/)?${escapeRegExp(path.slice(testsDir.length + 1))}\\1`
    );
    const importers = testFiles.filter((other) => other !== path && specifier.test(sources.get(other)));
    if (importers.length > 0) {
      exempt.push({ path, importerCount: importers.length, importers });
      exemptPaths.add(path);
    }
  }

  const {
    classificationErrors,
    globs,
    historicalSites,
    playwrightMatchers,
    scannedFiles
  } = collectDeclaredTestGlobs(root);
  const compiled = globs.map((glob) => ({ ...glob, matcher: globToRegExp(glob.pattern) }));
  const nodeGlobCount = globs.filter((glob) => glob.kind === 'node-test-argument').length;

  const reachable = [];
  const orphans = [];
  for (const path of testFiles) {
    if (exemptPaths.has(path)) continue;
    const matchedBy = compiled.filter((glob) => glob.matcher.test(path)).map((glob) => glob.pattern);
    if (matchedBy.length > 0) reachable.push({ path, matchedBy });
    else orphans.push(path);
  }

  const baseline = readBaseline(baselineFile);
  const baselinePresent = baseline !== null;
  const frozen = baseline ?? new Set();
  const newOrphans = orphans.filter((path) => !frozen.has(path)).sort(byteOrder);
  const knownOrphans = orphans.filter((path) => frozen.has(path)).sort(byteOrder);
  const orphanSet = new Set(orphans);
  const staleBaseline = [...frozen].filter((path) => !orphanSet.has(path)).sort(byteOrder);

  return {
    allSites: options.allSites === true,
    baselineCount: frozen.size,
    baselineFile: displayPath(root, baselineFile),
    baselinePresent,
    classificationErrors,
    exempt,
    exemptRule: EXEMPT_RULE,
    globCount: globs.length,
    globs,
    historicalSites,
    knownOrphans,
    newOrphans,
    nodeGlobCount,
    orphans: orphans.slice().sort(byteOrder),
    playwrightMatchers,
    reachable,
    scannedFiles,
    staleBaseline,
    testFileCount: testFiles.length,
    testsDir,
    vacuous: playwrightMatchers === 0 || nodeGlobCount === 0 || testFiles.length === 0 || scannedFiles === 0
  };
}

export function formatTestFileReachabilityFindings(result, indent = 0) {
  const pad = ' '.repeat(indent);
  const lines = [];
  lines.push(`${pad}${result.testFileCount} test file(s) in ${result.testsDir}/, `
    + `${result.globCount} active glob(s), ${result.historicalSites.length} historical site(s), `
    + `${result.classificationErrors.length} classification error(s) from ${result.scannedFiles} artifact(s), `
    + `${result.reachable.length} reachable, ${result.exempt.length} exempt (${result.exemptRule}), `
    + `${result.orphans.length} orphan(s)`);
  for (const glob of result.globs) {
    lines.push(`${pad}glob ${glob.pattern} [${glob.kind}] declared at ${glob.sites.length} site(s), `
      + `first ${glob.sites[0].artifact}:${glob.sites[0].line}`);
    if (result.allSites) {
      for (const site of glob.sites) {
        lines.push(`${pad}  active ${site.pattern} [${site.kind}] ${site.artifact}:${site.line} `
          + `artifactRole=${site.artifactRole} sectionRole=${site.sectionRole} reason=${site.reason}`);
      }
    }
  }
  if (result.allSites) {
    for (const site of result.historicalSites) {
      lines.push(`${pad}historical ${site.pattern} [${site.kind}] ${site.artifact}:${site.line} `
        + `artifactRole=${site.artifactRole} sectionRole=${site.sectionRole} reason=${site.reason}`);
    }
  }
  for (const site of result.classificationErrors) {
    lines.push(`${pad}CLASSIFICATION ERROR ${site.pattern} [${site.kind}] ${site.artifact}:${site.line} `
      + `artifactRole=${site.artifactRole} sectionRole=${site.sectionRole} reason=${site.reason}`);
  }
  for (const entry of result.exempt) {
    lines.push(`${pad}exempt ${entry.path} — ${result.exemptRule}: registers no node:test test, `
      + `imported by ${entry.importerCount} test file(s)`);
  }
  for (const path of result.newOrphans) {
    lines.push(`${pad}NEW ORPHAN ${path} — matched by none of the ${result.globCount} declared glob(s)`);
  }
  if (result.knownOrphans.length > 0) {
    lines.push(`${pad}${result.knownOrphans.length} known orphan(s) frozen in ${result.baselineFile}`);
    if (result.allSites) for (const path of result.knownOrphans) lines.push(`${pad}  known ${path}`);
  }
  for (const path of result.staleBaseline) {
    lines.push(`${pad}STALE BASELINE ${path} — now reachable; remove it from ${result.baselineFile}`);
  }
  if (!result.baselinePresent) lines.push(`${pad}BASELINE MISSING ${result.baselineFile}`);
  return lines;
}

function usage(stream = console.log) {
  stream('Usage: node scripts/validate-test-file-reachability.mjs [--root <dir>] [--all-sites]');
  stream('       node scripts/validate-test-file-reachability.mjs --update-baseline [--root <dir>]');
  stream('There is no --skip / --force / --ignore / --bypass flag.');
}

function writeBaseline(root, result) {
  const absBaseline = resolve(root, BASELINE_REL);
  const header = [
    '# validate-test-file-reachability baseline — Research Lab',
    '#',
    '# `tests/*.mjs` files that NO declared verification glob selects, so no',
    '# command this repository declares ever runs them. Frozen so the guard can',
    '# fail on NEW orphans while this pre-existing set is paid down.',
    '#',
    '# Keyed on the FILE path. A file added to a suffix family already listed',
    '# here still FAILS unless its own path is listed — the debt is the file,',
    '# not the family, so a frozen family cannot absorb new work silently.',
    '#',
    '# THIS LIST MUST SHRINK, NEVER GROW. Every entry is paid down by one of:',
    '#   - declare a glob that selects it in a real verification command, or',
    '#   - fold its assertions into a suite a declared glob already selects, or',
    '#   - delete it, if the coverage it claims is not wanted',
    '#',
    '# A baseline entry that is no longer orphaned is reported as STALE and the',
    '# run still exits 0. Remove it. Do NOT regenerate the baseline to silence a',
    '# genuine new finding.',
    '#',
    '# Regenerate ONLY when deliberately accepting the current set:',
    '#   node scripts/validate-test-file-reachability.mjs --update-baseline',
    '#',
    '# There is no --skip / --force / --ignore / --bypass flag and there never',
    '# will be. A bypass-shaped flag exits non-zero.',
    '#',
    `# FROZEN: ${result.orphans.length} orphan(s) of ${result.testFileCount} test file(s), against`,
    `# ${result.globCount} declared glob(s), on ${new Date().toISOString().slice(0, 10)}.`,
    '#',
    '# ---- unreachable suffix families -----------------------------------------',
    ...suffixSummary(result).map((line) => `#   ${line}`),
    '#',
    '# ---- frozen files (LC_ALL=C sorted) --------------------------------------',
    ''
  ];
  writeFileSync(absBaseline, header.concat(result.orphans, '').join('\n'), 'utf8');
  return displayPath(root, absBaseline);
}

function suffixSummary(result) {
  const counts = new Map();
  for (const path of result.orphans) {
    const name = path.slice(path.lastIndexOf('/') + 1);
    const dot = name.indexOf('.');
    const suffix = dot >= 0 ? name.slice(dot) : name;
    counts.set(suffix, (counts.get(suffix) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || byteOrder(a[0], b[0]))
    .map(([suffix, count]) => `${String(count).padStart(4)} | ${suffix}`);
}

function main(argv) {
  let root = ROOT;
  let update = false;
  let allSites = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--update-baseline') update = true;
    else if (arg === '--all-sites') allSites = true;
    else if (arg === '--root') { root = resolve(argv[++i] ?? ''); }
    else if (arg === '--help' || arg === '-h') { usage(); return 0; }
    else { console.error(`unknown argument: ${arg}`); usage(console.error); return 2; }
  }

  const result = validateTestFileReachability(root, { allSites });
  for (const line of formatTestFileReachabilityFindings(result, 0)) console.log(line);

  if (result.classificationErrors.length > 0) return 1;
  if (update) {
    console.log(`baseline written: ${writeBaseline(root, result)}`);
    return 0;
  }
  if (result.vacuous) {
    console.error('vacuous scan: missing active Playwright or Node globs, test files, or scanned artifacts');
    return 1;
  }
  if (!result.baselinePresent) return 1;
  return result.newOrphans.length > 0 ? 1 : 0;
}

if (resolve(process.argv[1] ?? '') === SCRIPT_PATH) process.exit(main(process.argv.slice(2)));
