#!/usr/bin/env node
/*
 * Scope DoD progress-claim guard (ratchet).
 *
 * `specs/**\/state.json` carries a scope registry whose entries claim how many
 * Definition-of-Done rows the matching scope artifact has ticked and how many
 * it has not — `dodChecked`/`dodUnchecked`, spelled `dodTicked`/`dodUnticked`
 * in some packets and `dodChecked`/`dodTotal` in others. Measured on 2026-08-25
 * at 8e6c35aa7, NOTHING in this repository compared either number against the
 * artifact it summarises:
 *
 *   grep -n 'dodChecked\|dodUnchecked' .github/bubbles/scripts/*.sh \
 *                                      .github/bubbles/scripts/*.py   -> exit 1
 *
 * So the field is a snapshot with no invariant behind it. The failure mode is
 * not a wrong edit; it is the ABSENCE of one. A pass reconciles the number,
 * a later pass legitimately ticks one more DoD row, and the registry silently
 * describes a state the artifact left. That happened twice in a single session.
 * A reader trusting the registry then counts work that is not done, or misses
 * work that is.
 *
 * DERIVATION. Both sides are read from the repository at run time; neither is
 * written down here. A frozen copy of either side would reproduce the exact
 * defect this guard exists to detect.
 *   - The CLAIM is every count-bearing entry of `execution.scopeProgress` and
 *     `certification.scopeProgress`. Each array is judged separately, because
 *     when the two disagree exactly one of them is the stale one.
 *   - The TRUTH is a count of `- [x]` / `- [ ]` rows inside the scope
 *     artifact's Definition-of-Done section.
 *
 * MAPPING — the scope ORDINAL, never the title. A claim keys on `scopeId`,
 * which is written as `03-effective-marginal-rate-curve` in most packets and as
 * the bare number `3` in others; an artifact is either the directory
 * `scopes/03-effective-marginal-rate-curve/scope.md` or a `## Scope 3:` section
 * of a single `scopes.md`. The one token both sides always carry is the leading
 * ordinal, so that is the join key. Reconstructing a slug from a title would
 * break on every title edit and silently stop checking. The one non-numeric
 * identifier, `cross-scope`, is a real convention rather than a malformed id:
 * bug packets close with a `## Cross-Scope Definition of Done` block owned by
 * the packet, and it is joined by that name.
 *
 * SCOPE SECTIONS — shallowest matching level only. `#### Scope 5 Test Evidence
 * Items` is a sub-heading INSIDE scope 5, not the start of a sixth scope. The
 * splitter therefore takes the shallowest heading level among the headings that
 * match the scope pattern and treats only that level as a section start.
 * `## Scope Summary`, `## Scope Inventory`, `## Scope Table` and `## Scope DAG`
 * carry no ordinal and are not scope sections.
 *
 * DoD SECTION — equal-or-higher level ends it. The section runs from the
 * `Definition of Done` heading to the next heading whose level is less than or
 * equal to it, so the `#### Core Delivery Items` / `#### Test Evidence Items` /
 * `#### Build Quality Gate` sub-headings that a tiered DoD splits itself into
 * are counted, while the sibling `## Recorded Deviations` section that follows
 * is not.
 *
 * FENCES ARE NOT CONTENT. A `- [ ]` inside a fenced block is documentation of a
 * row, not a row, and `# SCN-021-01` inside a fenced Gherkin block is a comment,
 * not a heading. Both scans track the open fence marker — including the case of
 * a ``` line appearing inside a ~~~ block, which does not close it — so neither
 * a documented example nor a Gherkin comment is ever counted. Verified against
 * BUG-021, whose two claims of 8 and 6 sum to exactly its 14 real rows while a
 * fence-naive heading scan reads five phantom headings in the same file.
 *
 * RATCHET. The policy predates the guard, so the pre-existing drift is frozen
 * in a committed baseline and the guard fails ONLY on drift that is NOT in it.
 *   - NEW drift -> exit 1 (the regression this guard exists to stop).
 *   - A baseline entry that is no longer drifted -> reported stale, exit 0.
 *     Remove it; the baseline is meant to shrink, never grow.
 *
 * The baseline is keyed on the SCOPE, not on the numbers, so re-freezing is not
 * a way to accept a new wrong number: a scope already listed stays frozen until
 * it is reconciled, and any scope not listed fails the moment it drifts. Keying
 * on the numbers would let one edit silence itself.
 *
 * UNRESOLVED is a finding, not a skip. A claim whose scope artifact cannot be
 * located is a claim nothing can check, which is the same blind spot in a new
 * costume, so it is reported and baseline-gated exactly like drift.
 *
 * A scan that finds ZERO claims is itself a failure, baseline or not. A matcher
 * that quietly stopped matching would otherwise render the guard vacuously
 * green — the `F-AUDIT-06` defect this repository has filed before.
 *
 * Usage:
 *   node scripts/validate-scope-dod-progress.mjs [--root <dir>] [--all]
 *   node scripts/validate-scope-dod-progress.mjs --update-baseline
 *
 * Exit: 0 = no new drift (stale baseline entries may be reported)
 *       1 = new drift, a vacuous scan, or a missing baseline file
 *       2 = unusable invocation (unknown argument, including any bypass-shaped
 *           flag — there is no --skip / --force / --ignore / --bypass and there
 *           never will be; accept a scope by editing the baseline in a reviewed
 *           commit)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const SPECS_DIR = 'specs';
const BASELINE_REL = 'scripts/validate-scope-dod-progress.baseline';

/* Field-name variants for the same claim. Every spelling in the committed tree
   is normalised here rather than checking one and leaving the others unguarded:
   the defect is identical whichever noun a packet chose. `dodTotal` states the
   denominator instead of the remainder, so the unchecked side is derived. */
const CHECKED_KEYS = ['dodChecked', 'dodTicked'];
const UNCHECKED_KEYS = ['dodUnchecked', 'dodUnticked'];
const TOTAL_KEYS = ['dodTotal'];

/* Byte order, so the committed baseline sorts identically to `LC_ALL=C sort` on
   every platform. Keys are ASCII by construction. */
const byteOrder = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

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

/* A fenced block opens on ``` or ~~~ (CommonMark allows up to three leading
   spaces) and closes only on a fence of the SAME character at least as long.
   Tracking the marker matters: a ``` line inside a ~~~ block is content. */
export function markdownFenceMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let open = null;
  for (let i = 0; i < lines.length; i++) {
    const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(lines[i]);
    if (open === null) {
      if (fence && !(fence[1][0] === '`' && fence[2].includes('`'))) {
        open = { char: fence[1][0], length: fence[1].length };
        mask[i] = true;
      }
      continue;
    }
    mask[i] = true;
    if (fence && fence[1][0] === open.char && fence[1].length >= open.length && fence[2].trim() === '') {
      open = null;
    }
  }
  return mask;
}

/* ATX headings only, and never inside a fence. */
export function markdownHeadings(lines, fenceMask) {
  const headings = [];
  for (let i = 0; i < lines.length; i++) {
    if (fenceMask[i]) continue;
    const match = /^ {0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(lines[i]);
    if (match) headings.push({ line: i, level: match[1].length, text: match[2] });
  }
  return headings;
}

/* A task-list row, nested or not, and never inside a fence. */
const TASK_ROW = /^\s*[-*+]\s+\[([ xX])\]/;

export function countTaskRows(lines, fenceMask, from, to) {
  let checked = 0, unchecked = 0;
  for (let i = from; i < to; i++) {
    if (fenceMask[i]) continue;
    const match = TASK_ROW.exec(lines[i]);
    if (!match) continue;
    if (match[1] === ' ') unchecked++; else checked++;
  }
  return { checked, unchecked };
}

/* The Definition-of-Done rows of one heading-bounded region. The section ends at
   the first heading whose level is <= the DoD heading's own, so a tiered DoD
   keeps its `####` sub-sections and drops the sibling section that follows. */
export function countDodRows(lines, fenceMask, headings, from, to) {
  const dod = headings.find((h) => h.line >= from && h.line < to && /definition of done/i.test(h.text));
  if (!dod) return null;
  const next = headings.find((h) => h.line > dod.line && h.line < to && h.level <= dod.level);
  const end = next ? next.line : to;
  return { ...countTaskRows(lines, fenceMask, dod.line + 1, end), headingLine: dod.line + 1 };
}

/* `## Scope 3: ...`, `## Scope 3 - ...`, `## SCOPE-03 - ...`. The ordinal is
   mandatory, which is what keeps `## Scope Summary` and `## Scope Inventory`
   from being read as sections. */
const SCOPE_HEADING = /^scopes?[\s\-_]*(\d+)\b/i;

/* `cross-scope` is a real registry identifier, not a malformed one: bug packets
   close with a `## Cross-Scope Definition of Done` block that belongs to the
   packet rather than to any numbered scope. Treating it as unresolvable would
   file six standing findings that can never be paid down. */
const CROSS_SCOPE_HEADING = /cross[\s\-_]*scope/i;
export const CROSS_SCOPE_KEY = 'cross-scope';

/* A section runs to the next heading at or above its own level, so the trailing
   cross-scope block ends the last numbered scope instead of being absorbed by
   it — which would otherwise let a scope with no DoD of its own silently borrow
   the packet's. `from` is the heading line ITSELF, because a numbered scope
   carries its DoD as a sub-heading while the cross-scope block IS one. */
function sectionsAtLevel(lines, headings, starts, level) {
  return starts.map((start) => {
    const next = headings.find((h) => h.line > start.line && h.level <= level);
    return { from: start.line, to: next ? next.line : lines.length, title: start.text };
  });
}

export function scopeSectionsOf(lines, fenceMask, headings) {
  const sections = [];

  const numbered = headings
    .map((h) => ({ ...h, match: SCOPE_HEADING.exec(h.text) }))
    .filter((h) => h.match !== null);
  if (numbered.length > 0) {
    const level = Math.min(...numbered.map((h) => h.level));
    const starts = numbered.filter((h) => h.level === level);
    for (const [index, section] of sectionsAtLevel(lines, headings, starts, level).entries()) {
      sections.push({ ...section, key: String(starts[index].match[1]).padStart(2, '0') });
    }
  }

  const cross = headings.filter((h) => CROSS_SCOPE_HEADING.test(h.text));
  if (cross.length > 0) {
    const level = Math.min(...cross.map((h) => h.level));
    const starts = cross.filter((h) => h.level === level);
    for (const section of sectionsAtLevel(lines, headings, starts, level)) {
      sections.push({ ...section, key: CROSS_SCOPE_KEY });
    }
  }

  return sections;
}

/* The registry's scope identifier reduced to the token both sides share: a
   zero-padded ordinal for a numbered scope, however the packet spells it
   (`03-effective-marginal-rate-curve`, `SCOPE-03`, or the bare number `3`), or
   the literal cross-scope key. */
export function scopeKeyOf(value) {
  if (typeof value === 'number' && Number.isInteger(value)) return String(value).padStart(2, '0');
  const text = String(value ?? '');
  if (CROSS_SCOPE_HEADING.test(text)) return CROSS_SCOPE_KEY;
  const match = /(\d+)/.exec(text);
  return match ? String(Number(match[1])).padStart(2, '0') : null;
}

function firstNumber(entry, keys) {
  for (const key of keys) if (typeof entry?.[key] === 'number') return entry[key];
  return null;
}

/* The claim a registry entry makes, normalised across field-name variants, or
   null when the entry makes no count claim at all and there is nothing to
   check. `dodTotal` states the denominator, so the remainder is derived. */
export function claimOf(entry) {
  const checked = firstNumber(entry, CHECKED_KEYS);
  const total = firstNumber(entry, TOTAL_KEYS);
  let unchecked = firstNumber(entry, UNCHECKED_KEYS);
  if (unchecked === null && total !== null && checked !== null) unchecked = total - checked;
  if (checked === null && unchecked === null) return null;
  return { checked, unchecked };
}

/* Every scope artifact of one packet, keyed by scope key, from either layout:
   a per-scope directory, or the sections of a single `scopes.md`. */
export function scopeArtifactsOf(absPacketDir, root) {
  const byKey = new Map();

  const scopesDir = join(absPacketDir, 'scopes');
  if (existsSync(scopesDir)) {
    for (const entry of readdirSync(scopesDir, { withFileTypes: true }).sort((a, b) => byteOrder(a.name, b.name))) {
      if (!entry.isDirectory()) continue;
      const abs = join(scopesDir, entry.name, 'scope.md');
      if (!existsSync(abs)) continue;
      const key = scopeKeyOf(entry.name);
      if (key === null || byKey.has(key)) continue;
      const lines = readFileSync(abs, 'utf8').split(/\r?\n/);
      const fenceMask = markdownFenceMask(lines);
      const headings = markdownHeadings(lines, fenceMask);
      const dod = countDodRows(lines, fenceMask, headings, 0, lines.length);
      byKey.set(key, { artifact: displayPath(root, abs), dod });
    }
  }

  const single = join(absPacketDir, 'scopes.md');
  if (existsSync(single)) {
    const lines = readFileSync(single, 'utf8').split(/\r?\n/);
    const fenceMask = markdownFenceMask(lines);
    const headings = markdownHeadings(lines, fenceMask);
    for (const section of scopeSectionsOf(lines, fenceMask, headings)) {
      if (byKey.has(section.key)) continue;
      const dod = countDodRows(lines, fenceMask, headings, section.from, section.to);
      byKey.set(section.key, { artifact: displayPath(root, single), dod, section: section.title });
    }
  }

  return byKey;
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

/* One frozen unit: this packet's scope as claimed by this registry array. */
const keyOf = (packet, scopeKey, source) => packet + '#' + scopeKey + '::' + source;

export function collectScopeDodProgress(root = ROOT, specsDir = SPECS_DIR) {
  const absSpecs = resolve(root, specsDir);
  const findings = [];
  let packetCount = 0, claimCount = 0, agreeCount = 0;
  if (!existsSync(absSpecs)) return { findings, packetCount, claimCount, agreeCount };

  const states = listFilesRecursive(absSpecs)
    .filter((abs) => abs.endsWith('/state.json') || abs.endsWith('\\state.json'))
    .sort();

  for (const absState of states) {
    let state;
    try { state = JSON.parse(readFileSync(absState, 'utf8')); } catch { continue; }
    const absPacketDir = dirname(absState);
    const packet = displayPath(root, absPacketDir);
    packetCount++;

    let artifacts = null; // located lazily: most packets make no count claim
    for (const source of ['execution', 'certification']) {
      const entries = Array.isArray(state?.[source]?.scopeProgress) ? state[source].scopeProgress : [];
      for (const entry of entries) {
        const claim = claimOf(entry);
        if (claim === null) continue;
        claimCount++;
        const scopeKey = scopeKeyOf(entry?.scopeId ?? entry?.scope);
        if (artifacts === null) artifacts = scopeArtifactsOf(absPacketDir, root);

        const scopeLabel = String(entry?.scopeId ?? entry?.scope ?? '(unnamed)');
        const base = { packet, source, scopeKey, scopeLabel, claim };

        if (scopeKey === null) {
          findings.push({ ...base, key: keyOf(packet, '--', source), reason: 'unresolved',
            detail: 'registry entry carries no recognisable scope identifier' });
          continue;
        }
        const key = keyOf(packet, scopeKey, source);
        const artifact = artifacts.get(scopeKey);
        if (!artifact) {
          findings.push({ ...base, key, reason: 'unresolved',
            detail: 'no scope artifact for ' + scopeKey + ' in this packet' });
          continue;
        }
        if (!artifact.dod) {
          findings.push({ ...base, key, artifact: artifact.artifact, reason: 'unresolved',
            detail: 'scope artifact has no Definition of Done heading' });
          continue;
        }
        const actual = { checked: artifact.dod.checked, unchecked: artifact.dod.unchecked };
        const checkedOk = claim.checked === null || claim.checked === actual.checked;
        const uncheckedOk = claim.unchecked === null || claim.unchecked === actual.unchecked;
        if (checkedOk && uncheckedOk) { agreeCount++; continue; }
        findings.push({ ...base, key, artifact: artifact.artifact, actual, reason: 'drift',
          detail: 'claims ' + claim.checked + '/' + claim.unchecked +
            ' checked/unchecked, artifact has ' + actual.checked + '/' + actual.unchecked });
      }
    }
  }

  findings.sort((a, b) => byteOrder(a.key, b.key));
  return { findings, packetCount, claimCount, agreeCount };
}

export function validateScopeDodProgress(root = ROOT, options = {}) {
  const specsDir = options.specsDir ?? SPECS_DIR;
  const baselineFile = options.baselineFile
    ? resolve(options.baselineFile)
    : resolve(root, BASELINE_REL);
  const { findings, packetCount, claimCount, agreeCount } = collectScopeDodProgress(root, specsDir);

  const baseline = readBaseline(baselineFile);
  const baselinePresent = baseline !== null;
  const known = baseline ?? new Set();
  const presentKeys = new Set(findings.map((finding) => finding.key));

  const newFindings = findings.filter((finding) => !known.has(finding.key));
  const knownFindings = findings.filter((finding) => known.has(finding.key));
  const staleBaseline = [...known].filter((key) => !presentKeys.has(key)).sort(byteOrder);

  const vacuous = claimCount === 0;
  return {
    ok: !vacuous && baselinePresent && newFindings.length === 0,
    vacuous,
    baselineFile: displayPath(root, baselineFile),
    baselinePresent,
    baselineCount: known.size,
    packetCount,
    claimCount,
    agreeCount,
    findings,
    driftCount: findings.filter((finding) => finding.reason === 'drift').length,
    unresolvedCount: findings.filter((finding) => finding.reason === 'unresolved').length,
    newFindings,
    knownFindings,
    staleBaseline
  };
}

export function formatScopeDodProgressFindings(result, limit = Infinity) {
  const lines = [];
  if (result.vacuous) {
    lines.push('NO-CLAIMS: scanned ' + result.packetCount +
      ' packet(s) and matched zero DoD progress claims — the guard cannot vouch for anything');
    return lines;
  }
  if (!result.baselinePresent) {
    lines.push('NO-BASELINE: ' + result.baselineFile + ' is missing — the ratchet has nothing to ' +
      'compare against; regenerate it with --update-baseline in a reviewed commit');
    return lines;
  }

  const shown = result.newFindings.slice(0, limit);
  for (const finding of shown) {
    lines.push('NEW-' + finding.reason.toUpperCase() + ' ' + finding.key +
      ' (' + finding.scopeLabel + ') — ' + finding.detail +
      (finding.artifact ? ' [' + finding.artifact + ']' : ''));
  }
  const hidden = result.newFindings.length - shown.length;
  if (hidden > 0) lines.push('    ... and ' + hidden + ' further new finding(s)');

  if (result.staleBaseline.length > 0) {
    lines.push('STALE-BASELINE: ' + result.staleBaseline.length + ' baseline entr' +
      (result.staleBaseline.length === 1 ? 'y is' : 'ies are') +
      ' reconciled — remove from ' + result.baselineFile + ':');
    for (const key of result.staleBaseline.slice(0, limit)) lines.push('    ' + key);
  }
  return lines;
}

export function renderBaseline(result, today) {
  const out = [];
  const c = (text) => out.push(text === '' ? '#' : '# ' + text);

  c('validate-scope-dod-progress baseline — Research Lab');
  c('');
  c('Scopes whose state.json progress claim does NOT match the Definition-of-Done');
  c('rows of the artifact it summarises, plus claims whose artifact cannot be');
  c('located at all. Frozen so the guard can fail on NEW drift while this');
  c('pre-existing set is reconciled.');
  c('');
  c('Keyed on `<packet>#<ordinal>::<registry array>`, NOT on the numbers. A scope');
  c('already listed here stays frozen until it is reconciled, so re-freezing');
  c('cannot be used to accept a new wrong number; a scope NOT listed here FAILS');
  c('the moment its claim and its artifact disagree. That is the regression this');
  c('guard exists to stop.');
  c('');
  c('The two registry arrays are listed separately on purpose: when');
  c('`execution.scopeProgress` and `certification.scopeProgress` disagree, exactly');
  c('one of them is the stale one, and collapsing them would hide which.');
  c('');
  c('THIS LIST MUST SHRINK, NEVER GROW. Every entry is paid down by one of:');
  c('  - reconcile the claim against the artifact, in the owning packet, or');
  c('  - give the scope a Definition of Done the claim can summarise, or');
  c('  - drop a count claim the packet cannot substantiate');
  c('Never by ticking a checkbox to match the number.');
  c('');
  c('A baseline entry that is no longer drifted is reported as STALE and the run');
  c('still exits 0. Remove it. Do NOT regenerate the baseline to silence a');
  c('genuine new finding.');
  c('');
  c('Regenerate ONLY when deliberately accepting the current set:');
  c('  node scripts/validate-scope-dod-progress.mjs --update-baseline');
  c('');
  c('There is no --skip / --force / --ignore / --bypass flag and there never will');
  c('be. A bypass-shaped flag exits non-zero.');
  c('');
  c('FROZEN: ' + result.findings.length + ' finding(s) — ' + result.driftCount +
    ' drifted, ' + result.unresolvedCount + ' unresolvable — of ' + result.claimCount +
    ' claim(s) across ' + result.packetCount + ' packet(s), on ' + today + '.');
  c('');
  c('---- finding detail --------------------------------------------------------');
  for (const finding of result.findings) {
    c('  ' + finding.reason.padEnd(10) + ' ' + finding.key);
    c('             ' + finding.detail);
  }
  c('');
  c('---- frozen keys (LC_ALL=C sorted) ------------------------------------------');
  out.push('');
  for (const finding of result.findings) out.push(finding.key);
  out.push('');
  return out.join('\n');
}

const BYPASS_SHAPED = /^--(skip|force|ignore|bypass|no-verify|unsafe|allow)/i;

function printHelp() {
  console.log([
    'Usage: node scripts/validate-scope-dod-progress.mjs [options]',
    '',
    '  --all                  list every finding, not just the first few',
    '  --root <dir>           scan a different repo root',
    '  --baseline-file <p>    use a different baseline (test seam)',
    '  --update-baseline      re-freeze the current finding set',
    '  -h, --help             this message',
    '',
    'Exit: 0 ok (stale entries may be reported); 1 new drift, vacuous scan, or',
    '      missing baseline; 2 unusable invocation.',
    '',
    'There is no --skip / --force / --ignore / --bypass flag. Accept a scope by',
    'editing ' + BASELINE_REL + ' in a reviewed commit.'
  ].join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  let root = ROOT;
  let baselineFile = null;
  let update = false;
  let limit = 10;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') { limit = Infinity; continue; }
    if (arg === '--update-baseline') { update = true; continue; }
    if (arg === '-h' || arg === '--help') { printHelp(); process.exit(0); }
    if (arg === '--root' || arg === '--baseline-file') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('[scope-dod-progress] ' + arg + ' needs a path');
        process.exit(2);
      }
      if (arg === '--root') root = resolve(value); else baselineFile = resolve(value);
      i++;
      continue;
    }
    console.error("[scope-dod-progress] unknown argument '" + arg + "'");
    if (BYPASS_SHAPED.test(arg)) {
      console.error('[scope-dod-progress] there is no bypass flag and there never will be. ' +
        'Accept a scope by editing ' + BASELINE_REL + ' in a reviewed commit.');
    }
    process.exit(2);
  }

  const result = validateScopeDodProgress(root, baselineFile ? { baselineFile } : {});

  if (update) {
    if (result.vacuous) {
      console.error('[scope-dod-progress] refusing to freeze a vacuous scan — 0 claims matched');
      process.exit(1);
    }
    const target = baselineFile ?? resolve(root, BASELINE_REL);
    writeFileSync(target, renderBaseline(result, new Date().toISOString().slice(0, 10)));
    console.log('[scope-dod-progress] baseline written with ' + result.findings.length + ' entr' +
      (result.findings.length === 1 ? 'y' : 'ies'));
    console.log('  ' + displayPath(root, target));
    process.exit(0);
  }

  console.log('[scope-dod-progress] packets=' + result.packetCount +
    ' claims=' + result.claimCount +
    ' agree=' + result.agreeCount +
    ' drift=' + result.driftCount +
    ' unresolved=' + result.unresolvedCount +
    ' baseline=' + result.baselineCount +
    ' new=' + result.newFindings.length +
    ' stale=' + result.staleBaseline.length);
  for (const line of formatScopeDodProgressFindings(result, limit)) console.log('  ' + line);

  if (result.ok) {
    console.log('[scope-dod-progress] OK — no new DoD progress drift' +
      (result.staleBaseline.length > 0
        ? ' (' + result.staleBaseline.length + ' stale baseline entr' +
          (result.staleBaseline.length === 1 ? 'y' : 'ies') + ' to remove)'
        : ''));
    process.exit(0);
  }

  let reason;
  if (result.vacuous) reason = 'vacuous scan';
  else if (!result.baselinePresent) reason = 'baseline file missing at ' + result.baselineFile;
  else reason = result.newFindings.length + ' scope progress claim(s) do not match their artifact';
  console.log('[scope-dod-progress] FAIL — ' + reason);
  process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
