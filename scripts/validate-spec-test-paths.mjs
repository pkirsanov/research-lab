#!/usr/bin/env node
/*
 * Spec-artifact test-path existence guard (ratchet).
 *
 * Playwright silently ignores a file argument that does not exist as long as at
 * least one other argument still resolves. Verified with Playwright 1.61.1 in
 * this repo: naming two spec files where one is absent reports "Total: 4 tests
 * in 1 file" and exits 0. A zero-selection `--grep` is NOT affected (it exits 1),
 * so the hazard is file/path arguments only.
 *
 * This repo stores verification commands and test-plan rows inside specs/** as
 * durable evidence, so a stale path keeps reporting success while covering
 * strictly less than it claims. This guard derives every repo-root-relative
 * `tests/....mjs` reference straight out of the committed artifacts and asserts
 * the referenced file exists on disk.
 *
 * RATCHET. The policy predates the guard, so the pre-existing missing set is
 * frozen in a committed baseline and the guard fails ONLY on paths that are NOT
 * in that baseline.
 *   - A NEW missing path -> exit 1 (the regression this guard exists to stop).
 *   - A baseline entry that is no longer missing -> reported as stale, exit 0.
 *     Remove it; the baseline is meant to shrink, never grow.
 *
 * The baseline is keyed on the missing PATH, not on the referencing site. A
 * brand-new reference to an already-known-missing path therefore passes, while a
 * reference to any path not listed fails. Keying on the site instead would make
 * every artifact edit that shifts a line number look like a new finding.
 *
 * Two further properties are deliberate:
 *   - No hardcoded path list in code and no expected count. Both would freeze on
 *     the day they were written and stop tracking the artifacts.
 *   - A scan that finds ZERO references is itself a failure, baseline or not. A
 *     regex that quietly matched nothing would otherwise reproduce the exact
 *     blind spot this guard exists to close.
 *
 * Usage:
 *   node scripts/validate-spec-test-paths.mjs [--root <dir>] [--all-sites]
 *   node scripts/validate-spec-test-paths.mjs --update-baseline
 *
 * Exit: 0 = no new missing paths (stale baseline entries may be reported)
 *       1 = new missing path(s), a vacuous scan, or a missing baseline file
 *       2 = unusable invocation (unknown argument, including any bypass-shaped
 *           flag — there is no --skip / --force / --ignore / --bypass and there
 *           never will be; accept a new path by editing the baseline in a
 *           reviewed commit)
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const SPECS_DIR = 'specs';
const BASELINE_REL = 'scripts/validate-spec-test-paths.baseline';

/* A repo-root-relative `tests/....mjs` token, covering both the Playwright
   `.spec.mjs` files and the plain `.mjs` files driven by `node --test`. The
   lookbehind anchors the match at a path start so an unrelated nested path such
   as `other/tests/x.mjs` is not misread as a repo test reference. */
const TEST_PATH_TOKEN = /(?<![A-Za-z0-9._/-])tests\/[A-Za-z0-9._/-]*\.mjs/g;

/* Byte order, so the committed baseline sorts identically to `LC_ALL=C sort` on
   every platform. Matched paths are ASCII by construction of TEST_PATH_TOKEN,
   so code-unit order and byte order coincide. */
const byteOrder = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/* Repo-relative when the path is inside the root, absolute otherwise, so a
   `--baseline-file` seam pointing outside the repo stays readable instead of
   rendering as a `../../../tmp/...` chain. */
function displayPath(root, abs) {
  const rel = relative(root, abs).split('\\').join('/');
  return rel === '' || rel.startsWith('../') ? abs : rel;
}

function listFilesRecursive(absDir) {
  const found = [];
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const abs = join(absDir, entry.name);
    if (entry.isDirectory()) found.push(...listFilesRecursive(abs));
    else if (entry.isFile()) found.push(abs);
  }
  return found;
}

/* Every `tests/*.mjs` reference in every text artifact under `<root>/<specsDir>`,
   each carrying the artifact and line that names it. */
export function collectSpecTestPathReferences(root = ROOT, specsDir = SPECS_DIR) {
  const absSpecs = resolve(root, specsDir);
  const references = [];
  let scannedFiles = 0;
  if (!existsSync(absSpecs)) return { scannedFiles, references, specsDir };

  for (const abs of listFilesRecursive(absSpecs).sort()) {
    let text;
    try { text = readFileSync(abs, 'utf8'); } catch { continue; }
    if (text.includes('\0')) continue; // binary artifact, not a text reference surface
    scannedFiles++;
    const artifact = relative(root, abs).split('\\').join('/');
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      TEST_PATH_TOKEN.lastIndex = 0;
      let match;
      while ((match = TEST_PATH_TOKEN.exec(lines[i])) !== null) {
        references.push({ path: match[0], artifact, line: i + 1 });
      }
    }
  }
  return { scannedFiles, references, specsDir };
}

/* Frozen path set. Blank lines and `#` comments are ignored, so the file can
   carry the provenance header that makes the debt legible. */
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

export function validateSpecTestPaths(root = ROOT, options = {}) {
  const specsDir = options.specsDir ?? SPECS_DIR;
  const baselineFile = options.baselineFile
    ? resolve(options.baselineFile)
    : resolve(root, BASELINE_REL);
  const { scannedFiles, references } = collectSpecTestPathReferences(root, specsDir);

  const sitesByPath = new Map();
  for (const ref of references) {
    if (!sitesByPath.has(ref.path)) sitesByPath.set(ref.path, []);
    sitesByPath.get(ref.path).push({ artifact: ref.artifact, line: ref.line });
  }

  const missing = [];
  for (const path of [...sitesByPath.keys()].sort(byteOrder)) {
    let isFile = false;
    try { isFile = statSync(resolve(root, path)).isFile(); } catch { isFile = false; }
    if (!isFile) missing.push({ path, sites: sitesByPath.get(path) });
  }

  const baseline = readBaseline(baselineFile);
  const baselinePresent = baseline !== null;
  const known = baseline ?? new Set();
  const missingPaths = new Set(missing.map((entry) => entry.path));

  const newMissing = missing.filter((entry) => !known.has(entry.path));
  const knownMissing = missing.filter((entry) => known.has(entry.path));
  /* No longer missing: the file exists again, or every reference to it was
     removed. Either way the debt was paid and the entry must leave the file. */
  const staleBaseline = [...known].filter((path) => !missingPaths.has(path)).sort(byteOrder);

  const vacuous = references.length === 0;
  return {
    ok: !vacuous && baselinePresent && newMissing.length === 0,
    vacuous,
    baselineFile: displayPath(root, baselineFile),
    baselinePresent,
    baselineCount: known.size,
    scannedFiles,
    referenceCount: references.length,
    referencedPathCount: sitesByPath.size,
    missing,
    newMissing,
    knownMissing,
    staleBaseline
  };
}

/* `specs/002-foo/report.md` -> `specs/002-foo`. */
function specOf(artifact) {
  const parts = artifact.split('/');
  return parts.length >= 2 ? parts[0] + '/' + parts[1] : artifact;
}

/* Who owns the frozen debt, so the baseline records it instead of absorbing it
   silently. Splits each spec's reference sites into plan context and `report.md`
   evidence context, because those are materially different classes of finding. */
export function computeDebtAttribution(missing, root = ROOT) {
  const bySpec = new Map();
  for (const entry of missing) {
    for (const site of entry.sites) {
      const spec = specOf(site.artifact);
      if (!bySpec.has(spec)) bySpec.set(spec, { paths: new Set(), sites: 0, evidenceSites: 0 });
      const record = bySpec.get(spec);
      record.paths.add(entry.path);
      record.sites++;
      if (site.artifact.endsWith('/report.md')) record.evidenceSites++;
    }
  }

  const rows = [];
  for (const [spec, record] of bySpec) {
    let status = 'unknown';
    try {
      const parsed = JSON.parse(readFileSync(resolve(root, spec, 'state.json'), 'utf8'));
      if (typeof parsed.status === 'string') status = parsed.status;
    } catch { status = 'unknown'; }
    rows.push({
      spec,
      status,
      pathCount: record.paths.size,
      siteCount: record.sites,
      evidenceSites: record.evidenceSites,
      planSites: record.sites - record.evidenceSites
    });
  }
  rows.sort((a, b) => b.pathCount - a.pathCount || byteOrder(a.spec, b.spec));
  return rows;
}

export function renderBaseline(result, attribution, today) {
  const siteTotal = result.missing.reduce((n, entry) => n + entry.sites.length, 0);
  const out = [];
  const c = (text) => out.push(text === '' ? '#' : '# ' + text);

  c('validate-spec-test-paths baseline — Research Lab');
  c('');
  c('`tests/*.mjs` paths named by a committed spec artifact that do NOT exist on');
  c('disk. Frozen so the guard can fail on NEW stale references while this');
  c('pre-existing set is triaged.');
  c('');
  c('Keyed on the missing PATH, not on the referencing site. A new reference to a');
  c('path already listed here passes; a reference to a path NOT listed here FAILS.');
  c('That is the regression this guard exists to stop.');
  c('');
  c('THIS LIST MUST SHRINK, NEVER GROW. Every entry is one of:');
  c('  - planned but never written   -> write the test, or drop the plan row');
  c('  - renamed or moved            -> repoint the reference');
  c('  - naming-convention drift     -> reconcile the plan against disk');
  c('  - captured terminal evidence of a since-deleted scratch file -> a');
  c('    transcript, not a coverage claim; historical and grandfathered');
  c('');
  c('A baseline entry that is no longer missing is reported as STALE and the run');
  c('still exits 0. Remove it. Do NOT regenerate the baseline to silence a');
  c('genuine new finding.');
  c('');
  c('Regenerate ONLY when deliberately accepting the current set:');
  c('  node scripts/validate-spec-test-paths.mjs --update-baseline');
  c('');
  c('There is no --skip / --force / --ignore / --bypass flag and there never will');
  c('be. A bypass-shaped flag exits non-zero.');
  c('');
  c('FROZEN: ' + result.missing.length + ' missing path(s) across ' + siteTotal +
    ' reference site(s), on ' + today + '.');
  c('');
  c('---- debt attribution ------------------------------------------------------');
  c('  paths | sites | spec | status');
  for (const row of attribution) {
    c('  ' + String(row.pathCount).padStart(5) + ' | ' + String(row.siteCount).padStart(5) +
      ' | ' + row.spec + ' | status=' + row.status +
      (row.status === 'done' ? '  <-- see NOTE' : ''));
  }

  const doneRows = attribution.filter((row) => row.status === 'done');
  if (doneRows.length > 0) {
    c('');
    c('---- NOTE: a status=done spec is carrying frozen debt -----------------------');
    c('');
    c('A not_started spec whose Test Plan names an unwritten test is expected debt.');
    c('A status=done spec is a materially different class and is called out here so');
    c('it stays visible to whoever pays this down rather than lost in the list.');
    for (const row of doneRows) {
      c('');
      c('  ' + row.spec + ' — status=done');
      c('    ' + row.pathCount + ' distinct missing path(s) across ' + row.siteCount +
        ' reference site(s)');
      c('      ' + String(row.planSites).padStart(4) +
        ' site(s) in plan context — a forward-looking coverage claim');
      c('      ' + String(row.evidenceSites).padStart(4) +
        ' site(s) in report.md — an EVIDENCE context, not a plan context');
    }
    c('');
    c('`report.md` is captured-transcript and gap-declaration space. A stale path');
    c('there may be a verbatim terminal capture of a scratch file that has since');
    c('been deleted, or the report explicitly documenting that a planned path does');
    c('NOT exist. Read the site before treating it as a false coverage claim; the');
    c('remedy is usually owned by the planning artifact, not by the report.');
  }

  c('');
  c('---- frozen paths (LC_ALL=C sorted) -----------------------------------------');
  out.push('');
  for (const entry of result.missing) out.push(entry.path);
  out.push('');
  return out.join('\n');
}

/* One line per finding naming an artifact and line, so a failure is directly
   actionable. `limitSites` bounds only the per-path detail, never the path list. */
export function formatSpecTestPathFindings(result, limitSites = Infinity) {
  const lines = [];
  if (result.vacuous) {
    lines.push('NO-REFERENCES: scanned ' + result.scannedFiles +
      ' spec artifact(s) and matched zero tests/*.mjs references — the guard cannot vouch for anything');
    return lines;
  }
  if (!result.baselinePresent) {
    lines.push('NO-BASELINE: ' + result.baselineFile + ' is missing — the ratchet has nothing to ' +
      'compare against; regenerate it with --update-baseline in a reviewed commit');
    return lines;
  }

  for (const entry of result.newMissing) {
    lines.push('NEW-MISSING ' + entry.path + ' (' + entry.sites.length + ' reference site(s))');
    const shown = entry.sites.slice(0, limitSites);
    for (const site of shown) lines.push('    referenced at ' + site.artifact + ':' + site.line);
    const hidden = entry.sites.length - shown.length;
    if (hidden > 0) lines.push('    ... and ' + hidden + ' further reference site(s)');
  }

  if (result.staleBaseline.length > 0) {
    lines.push('STALE-BASELINE: ' + result.staleBaseline.length + ' baseline entr' +
      (result.staleBaseline.length === 1 ? 'y is' : 'ies are') +
      ' no longer missing — remove from ' + result.baselineFile + ':');
    for (const path of result.staleBaseline) lines.push('    ' + path);
  }
  return lines;
}

const BYPASS_SHAPED = /^--(skip|force|ignore|bypass|no-verify|unsafe|allow)/i;

function printHelp() {
  console.log([
    'Usage: node scripts/validate-spec-test-paths.mjs [options]',
    '',
    '  --all-sites            list every reference site, not just the first few',
    '  --root <dir>           scan a different repo root',
    '  --baseline-file <p>    use a different baseline (test seam)',
    '  --update-baseline      re-freeze the current missing set',
    '  -h, --help             this message',
    '',
    'Exit: 0 ok (stale entries may be reported); 1 new missing path, vacuous scan,',
    '      or missing baseline; 2 unusable invocation.',
    '',
    'There is no --skip / --force / --ignore / --bypass flag. Accept a new path by',
    'editing ' + BASELINE_REL + ' in a reviewed commit.'
  ].join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  let root = ROOT;
  let baselineFile = null;
  let update = false;
  /* Every finding is always listed; only the repeated per-path sites are bounded. */
  let limitSites = 3;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all-sites') { limitSites = Infinity; continue; }
    if (arg === '--update-baseline') { update = true; continue; }
    if (arg === '-h' || arg === '--help') { printHelp(); process.exit(0); }
    if (arg === '--root' || arg === '--baseline-file') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('[spec-test-paths] ' + arg + ' needs a path');
        process.exit(2);
      }
      if (arg === '--root') root = resolve(value); else baselineFile = resolve(value);
      i++;
      continue;
    }
    console.error("[spec-test-paths] unknown argument '" + arg + "'");
    if (BYPASS_SHAPED.test(arg)) {
      console.error('[spec-test-paths] there is no bypass flag and there never will be. ' +
        'Accept a new path by editing ' + BASELINE_REL + ' in a reviewed commit.');
    }
    process.exit(2);
  }

  const result = validateSpecTestPaths(root, baselineFile ? { baselineFile } : {});

  if (update) {
    if (result.vacuous) {
      console.error('[spec-test-paths] refusing to freeze a vacuous scan — 0 references matched');
      process.exit(1);
    }
    const target = baselineFile ?? resolve(root, BASELINE_REL);
    const today = new Date().toISOString().slice(0, 10);
    writeFileSync(target, renderBaseline(result, computeDebtAttribution(result.missing, root), today));
    console.log('[spec-test-paths] baseline written with ' + result.missing.length + ' entr' +
      (result.missing.length === 1 ? 'y' : 'ies'));
    console.log('  ' + displayPath(root, target));
    process.exit(0);
  }

  console.log('[spec-test-paths] scanned=' + result.scannedFiles +
    ' references=' + result.referenceCount +
    ' distinctPaths=' + result.referencedPathCount +
    ' missingPaths=' + result.missing.length +
    ' baseline=' + result.baselineCount +
    ' new=' + result.newMissing.length +
    ' stale=' + result.staleBaseline.length);
  for (const line of formatSpecTestPathFindings(result, limitSites)) console.log('  ' + line);

  if (result.ok) {
    console.log('[spec-test-paths] OK — no new missing test path(s)' +
      (result.staleBaseline.length > 0
        ? ' (' + result.staleBaseline.length + ' stale baseline entr' +
          (result.staleBaseline.length === 1 ? 'y' : 'ies') + ' to remove)'
        : ''));
    process.exit(0);
  }

  let reason;
  if (result.vacuous) reason = 'vacuous scan';
  else if (!result.baselinePresent) reason = 'baseline file missing at ' + result.baselineFile;
  else reason = result.newMissing.length + ' new referenced path(s) do not exist';
  console.log('[spec-test-paths] FAIL — ' + reason);
  process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
