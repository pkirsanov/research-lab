/*
 * Group a Playwright JSON report's failures by the spec that OWNS the failing test file.
 *
 * A red gate answers one question: is this branch fit to publish. When a run fails in more than
 * one independently owned area, a reader currently has to download the report artifact and read
 * it by hand to work out which failures are theirs. This prints that split.
 *
 * Ownership is DERIVED from the spec artifacts themselves, which already name the tests they rely
 * on, so nothing here is a second hand-maintained list that could drift from the first.
 *
 * This is a reporter. It never changes the verdict: it exits 0 even when it finds failures, so it
 * cannot mask, soften, or invent one. The suite's own exit code remains the gate.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = '.';
const REPORT = process.argv[2] || process.env.PLAYWRIGHT_JSON_OUTPUT_NAME || 'playwright-report.json';
const TEST_PATH_TOKEN = /tests\/[A-Za-z0-9._-]+\.mjs/g;

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && /\.(md|json)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/* `specs/025-foo/bugs/BUG-001-bar/report.md` -> `specs/025-foo/bugs/BUG-001-bar`. */
function owningSpecDir(artifactPath) {
  const parts = relative(ROOT, artifactPath).split('/');
  return parts.slice(0, parts.length - 1).join('/');
}

function buildOwnership() {
  const owners = new Map();
  for (const artifact of walk(join(ROOT, 'specs'))) {
    let body = '';
    try {
      if (statSync(artifact).size > 4_000_000) continue;
      body = readFileSync(artifact, 'utf8');
    } catch { continue; }
    for (const match of body.matchAll(TEST_PATH_TOKEN)) {
      const file = match[0];
      if (!owners.has(file)) owners.set(file, new Set());
      owners.get(file).add(owningSpecDir(artifact));
    }
  }
  return owners;
}

function collectFailures(report) {
  const failures = [];
  const visit = (suite, filePath) => {
    const file = suite.file || filePath || '';
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const results = test.results || [];
        const bad = results.some((r) => r.status === 'failed' || r.status === 'timedOut');
        const recovered = results.some((r) => r.status === 'passed');
        if (bad && !recovered) failures.push({ file, title: spec.title, line: spec.line });
      }
    }
    for (const child of suite.suites || []) visit(child, file);
  };
  for (const suite of report.suites || []) visit(suite, suite.file);
  return failures;
}

function main() {
  if (!existsSync(REPORT)) {
    console.log(`No JSON report at ${REPORT} — nothing to summarize.`);
    return;
  }
  let report;
  try {
    report = JSON.parse(readFileSync(REPORT, 'utf8'));
  } catch (error) {
    console.log(`Could not read ${REPORT} as JSON: ${error.message}`);
    return;
  }

  const failures = collectFailures(report);
  if (failures.length === 0) {
    console.log('## Browser suite\n\nNo failing tests in the JSON report.');
    return;
  }

  const owners = buildOwnership();
  const grouped = new Map();
  for (const failure of failures) {
    const normalized = failure.file.startsWith('tests/') ? failure.file : `tests/${failure.file}`;
    if (!grouped.has(normalized)) grouped.set(normalized, []);
    grouped.get(normalized).push(failure);
  }

  const files = [...grouped.keys()].sort();
  console.log(`## Browser suite — ${failures.length} failing test(s) in ${files.length} test file(s)\n`);
  /* The split is the point: a reader scans for their own file instead of the whole list. A widely
     referenced test file is claimed by many specs, so the claim list is capped rather than
     printed in full — the file is the actionable unit, the claims are the trail back. */
  for (const file of files) {
    const rows = grouped.get(file);
    console.log(`### \`${file}\` — ${rows.length} failing\n`);
    for (const row of rows) console.log(`- ${row.line ? `line ${row.line} — ` : ''}${row.title}`);
    const claims = [...(owners.get(file) || [])].sort();
    if (claims.length === 0) {
      console.log('\nClaimed by: no spec artifact names this test file.\n');
    } else {
      const shown = claims.slice(0, 4).map((c) => `\`${c}\``).join(', ');
      const rest = claims.length > 4 ? ` and ${claims.length - 4} more` : '';
      console.log(`\nClaimed by ${claims.length} spec artifact(s): ${shown}${rest}.\n`);
    }
  }
}

main();
