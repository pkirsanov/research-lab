#!/usr/bin/env node
/*
 * Bulk-stamped acceptance-record guard (ratchet).
 *
 * `uservalidation.md` closes a packet with a Human Acceptance Record naming a
 * human, an instant, and a method. Gate G136 reads it through
 * `.github/bubbles/scripts/acceptance-authority-lib.sh`, whose terminal verdict
 * checks that `method` is a member of the closed vocabulary and that the
 * method's `requiresField` is present. Measured on 2026-08-25 at 86f18dc04,
 * that is the whole of it:
 *
 *   grep -n 'acceptedAt' .github/bubbles/scripts/acceptance-authority-lib.sh
 *     -> the field is read for PRESENCE and never for VALUE
 *
 * So the record is checked for SHAPE and never for TRUTH. Writing three well
 * formed lines flips the terminal gate from `exit 1 / PD12-NO-RECORD` to
 * `exit 0`, and nothing anywhere asks whether the human named actually did the
 * thing the method claims. That is not hypothetical: thirteen records were
 * written in one pass, ten of them carrying ONE second-precision `acceptedAt`
 * stamped minutes before the commit that introduced them. Every one passed.
 *
 * WHAT MECHANISM CAN PROVE HERE. No file check can prove a keystroke came from
 * a human — the registry says so itself, and this guard does not pretend
 * otherwise. It proves something narrower and fully decidable: that a set of
 * records CONTRADICTS ITSELF. The registry defines the method
 *
 *   human-interactive: "A human exercised the delivered behavior in a live
 *                       session and accepted it. `acceptedBy` names that
 *                       human."
 *
 * One human cannot exercise two different deliveries in the same second. So
 * two records that name the SAME acceptor at the SAME instant under
 * `human-interactive` cannot both be what they claim, whatever else is true.
 * The finding is a proof of inconsistency, not a suspicion.
 *
 * THE LICENSE IS READ AT RUN TIME, NOT COPIED. The clause the inference rests
 * on is "in a live session". A frozen paraphrase of it here would keep the
 * guard enforcing a rule the registry had stopped stating, which is the same
 * class of defect as the stale claim this repository already guards elsewhere.
 * So the registry is parsed on every run and the guard REFUSES when
 *   - the registry is missing or unparseable, or
 *   - `human-interactive` is no longer a declared method, or
 *   - its description no longer contains the live-session clause.
 * A refusal is a loud exit 1 that names the missing license. The guard never
 * degrades into a check nothing authorises.
 *
 * SAME ACCEPTOR, deliberately. The impossibility argument needs ONE human: two
 * DIFFERENT people acting in the same second is a coincidence, not a
 * contradiction, and the registry licenses nothing about it. Grouping on the
 * instant alone would therefore report a case the registry does not condemn.
 * The stated limit of this guard is the other side of that: a bulk stamp that
 * also varied `acceptedBy` would not be caught here. That is a deliberate
 * trade — such a record fabricates human identities rather than mislabelling a
 * method, which is a larger and differently-shaped lie.
 *
 * `external-record` IS NOT IN SCOPE, deliberately. The registry defines it as
 * acceptance recorded elsewhere, with `record` pointing at it. ONE sign-off
 * event legitimately covers many packets, so a shared instant is the EXPECTED
 * shape rather than a contradiction. Eleven such records share one instant in
 * this repository today and every one of them is honest. Flagging them would
 * produce eleven false findings and teach a reader to skip this guard's output,
 * which is worse than not having it.
 *
 * PLACEHOLDERS FALL OUT OF STRICTNESS, not out of a special case. An unfilled
 * template carries `method: [human-interactive | external-record]` and
 * `acceptedAt: [YYYY-MM-DDTHH:MM:SSZ]`. Neither is the exact method id, and
 * neither is a timestamp, so an unaccepted packet is never a member of a group.
 * No list of known placeholder spellings is maintained, because that list would
 * be the thing that rots.
 *
 * SECOND PRECISION IS REQUIRED. The impossibility is about a second. A
 * date-only `acceptedAt: 2026-08-19` says nothing contradictory — many packets
 * can honestly be accepted on one day — so a record without a time-of-day is
 * counted as ineligible and reported in the tally rather than judged. The
 * comparison is on the parsed INSTANT, so the same moment written `...:11Z` and
 * `...:11+00:00` groups together instead of escaping through formatting.
 *
 * RATCHET. The policy predates the guard, so the collisions already committed
 * are frozen in a baseline and the guard fails ONLY on ones that are not.
 *   - A NEW colliding record -> exit 1 (the regression this guard exists to stop).
 *   - A baseline entry that no longer collides -> reported stale, exit 0.
 *     Remove it; the baseline is meant to shrink, never grow.
 *
 * The baseline is keyed per RECORD and includes the stamp it was frozen at:
 * `<packet>::<acceptedBy>@<acceptedAt>`. Both halves are load-bearing.
 * Freezing the GROUP would let a third packet join an already-frozen instant
 * for free, which is precisely the act being guarded. Omitting the stamp would
 * let a frozen record be re-stamped into a different collision and stay silent.
 * Keyed this way, a record that moves produces a key nobody froze and fails.
 *
 * A scan that finds ZERO acceptance records is itself a failure, baseline or
 * not. A parser that quietly stopped matching would otherwise render the guard
 * vacuously green — the `F-AUDIT-06` defect this repository has filed before.
 *
 * Usage:
 *   node scripts/validate-acceptance-bulk-stamp.mjs [--root <dir>] [--all]
 *   node scripts/validate-acceptance-bulk-stamp.mjs --update-baseline
 *
 * Exit: 0 = no new collisions (stale baseline entries may be reported)
 *       1 = a new collision, a vacuous scan, a missing baseline, or a registry
 *           that no longer licenses the check
 *       2 = unusable invocation (unknown argument, including any bypass-shaped
 *           flag — there is no --skip / --force / --ignore / --bypass and there
 *           never will be; accept a record by editing the baseline in a
 *           reviewed commit)
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { markdownFenceMask, markdownHeadings } from './validate-scope-dod-progress.mjs';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT = resolve(dirname(SCRIPT_PATH), '..');
const SPECS_DIR = 'specs';
const BASELINE_REL = 'scripts/validate-acceptance-bulk-stamp.baseline';
const REGISTRY_REL = '.github/bubbles/registry/acceptance-authority.yaml';

/* The method whose definition makes a shared instant a contradiction, and the
   clause of that definition the contradiction rests on. The id is matched
   exactly; the clause is matched case-insensitively inside the registry's own
   description, so a rewording that keeps the meaning keeps the license. */
const INTERACTIVE_METHOD = 'human-interactive';
const LICENSING_CLAUSE = 'live session';

/* The registry section whose heading bounds the record. Read from the registry
   rather than written here for the same reason as the clause. */
const RECORD_SECTION_ID = 'acceptance-record';

const RECORD_FIELDS = ['acceptedBy', 'acceptedAt', 'method'];

/* A time-of-day is mandatory: the impossibility being asserted is about one
   second, and a date-only value asserts nothing. */
const INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

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

const indentOf = (line) => /^\s*/.exec(line)[0].length;
const unquote = (text) => {
  const trimmed = text.trim();
  const quoted = /^(['"])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
};

/* A block scalar (`>-`, `|`, ...) folded to one line. Its body is every
   following line indented deeper than the key, so the terminator is the first
   non-blank line that is not. Blank lines inside are separators, not ends. */
function foldBlockScalar(lines, keyLine) {
  const keyIndent = indentOf(lines[keyLine]);
  const parts = [];
  for (let i = keyLine + 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    if (indentOf(lines[i]) <= keyIndent) break;
    parts.push(lines[i].trim());
  }
  return parts.join(' ');
}

/* The value of `key` on a line, whether inline or a block scalar. */
function scalarAt(lines, index) {
  const match = /^\s*(?:-\s+)?([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(lines[index]);
  if (!match) return null;
  const inline = match[2].trim();
  const value = /^[>|][-+]?\d*$/.test(inline) ? foldBlockScalar(lines, index) : unquote(inline);
  return { key: match[1], value };
}

/* The registry facts this guard depends on, read fresh on every run.
   `ok` is false — loudly, with a reason — rather than defaulting to anything
   permissive, because an empty heading used as a section needle would match
   every line and silently invert the scan. */
export function readRegistryLicense(absRegistryFile) {
  if (!existsSync(absRegistryFile)) {
    return { ok: false, reason: 'registry not found at ' + absRegistryFile };
  }
  let lines;
  try {
    lines = readFileSync(absRegistryFile, 'utf8').split(/\r?\n/);
  } catch (error) {
    return { ok: false, reason: 'registry unreadable: ' + error.message };
  }

  let heading = null;
  let sectionIndent = null;
  let inSections = false;
  let currentSectionId = null;

  const methods = new Map();
  let inMethods = false;
  let methodIndent = null;
  let currentMethod = null;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim() === '' || /^\s*#/.test(raw)) continue;
    const indent = indentOf(raw);

    if (indent === 0) {
      inSections = /^sections\s*:/.test(raw);
      inMethods = false;
      currentSectionId = null;
      currentMethod = null;
      if (/^acceptanceRecord\s*:/.test(raw)) {
        /* walk the acceptanceRecord block for its `methods:` list */
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].trim() === '' || /^\s*#/.test(lines[j])) continue;
          if (indentOf(lines[j]) === 0) break;
          if (/^\s*methods\s*:/.test(lines[j])) {
            inMethods = true;
            methodIndent = indentOf(lines[j]);
            i = j;
            break;
          }
        }
      }
      continue;
    }

    if (inMethods) {
      if (indent <= methodIndent) { inMethods = false; currentMethod = null; continue; }
      const scalar = scalarAt(lines, i);
      if (!scalar) continue;
      if (/^\s*-\s/.test(raw) && scalar.key === 'id') {
        currentMethod = { id: scalar.value, description: '', requiresField: null };
        methods.set(scalar.value, currentMethod);
        continue;
      }
      if (!currentMethod) continue;
      if (scalar.key === 'description') currentMethod.description = scalar.value;
      if (scalar.key === 'requiresField') currentMethod.requiresField = scalar.value;
      continue;
    }

    if (inSections) {
      const scalar = scalarAt(lines, i);
      if (!scalar) continue;
      if (/^\s*-\s/.test(raw) && scalar.key === 'id') {
        currentSectionId = scalar.value;
        sectionIndent = indent;
        continue;
      }
      if (currentSectionId === RECORD_SECTION_ID && scalar.key === 'heading' && indent > sectionIndent) {
        heading = scalar.value;
      }
    }
  }

  if (!heading) {
    return { ok: false, reason: 'registry declares no heading for section `' + RECORD_SECTION_ID + '`' };
  }
  /* An empty needle is a universal match, not a no-match: a heading of `##` would reduce to the
     empty string and then equal every heading with no text. Reject it here rather than let the
     scan silently invert. */
  if (heading.replace(/^#+\s*/, '').trim() === '') {
    return {
      ok: false,
      reason: 'registry heading for section `' + RECORD_SECTION_ID + '` carries no text (' +
        JSON.stringify(heading) + '), which would match every untitled heading rather than one section'
    };
  }
  const interactive = methods.get(INTERACTIVE_METHOD);
  if (!interactive) {
    return {
      ok: false,
      heading,
      reason: 'registry no longer declares the `' + INTERACTIVE_METHOD +
        '` method, so nothing licenses treating a shared instant as a contradiction'
    };
  }
  if (!interactive.description.toLowerCase().includes(LICENSING_CLAUSE)) {
    return {
      ok: false,
      heading,
      reason: 'the `' + INTERACTIVE_METHOD + '` description no longer contains the "' +
        LICENSING_CLAUSE + '" clause this check rests on — it now reads: ' +
        JSON.stringify(interactive.description)
    };
  }
  return {
    ok: true,
    heading,
    methodIds: [...methods.keys()],
    interactiveDescription: interactive.description
  };
}

/* The record fields of one `uservalidation.md`, read only from inside the
   registry-declared section and never from inside a fenced block. The first
   occurrence of each field wins: a record is one block, and prose below it that
   quotes a field is commentary rather than a second record. */
export function parseAcceptanceRecord(text, heading) {
  if (typeof heading !== 'string' || heading.trim() === '') {
    throw new Error('parseAcceptanceRecord requires a non-empty section heading');
  }
  const lines = text.split(/\r?\n/);
  const fenceMask = markdownFenceMask(lines);
  const headings = markdownHeadings(lines, fenceMask);

  const wanted = heading.trim().replace(/^#+\s*/, '').trim().toLowerCase();
  const start = headings.find((entry) => entry.text.trim().toLowerCase() === wanted);
  if (!start) return null;
  const next = headings.find((entry) => entry.line > start.line && entry.level <= start.level);
  const end = next ? next.line : lines.length;

  const fields = {};
  for (let i = start.line + 1; i < end; i++) {
    if (fenceMask[i]) continue;
    const match = /^\s*(?:[-*+]\s+)?([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/.exec(lines[i]);
    if (!match) continue;
    const key = match[1];
    if (!RECORD_FIELDS.includes(key)) continue;
    if (key in fields) continue;
    fields[key] = { value: match[2].trim(), line: i + 1 };
  }
  return Object.keys(fields).length === 0 ? null : fields;
}

/* The instant a record names, or null when it names none this check can use. */
export function instantOf(acceptedAt) {
  if (typeof acceptedAt !== 'string' || !INSTANT_PATTERN.test(acceptedAt.trim())) return null;
  const parsed = Date.parse(acceptedAt.trim());
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : acceptedAt.trim();
}

const keyOf = (packet, acceptedBy, acceptedAt) => packet + '::' + acceptedBy + '@' + acceptedAt;

export function collectAcceptanceStamps(root = ROOT, options = {}) {
  const specsDir = options.specsDir ?? SPECS_DIR;
  const registryFile = options.registryFile
    ? resolve(options.registryFile)
    : resolve(root, REGISTRY_REL);
  const license = readRegistryLicense(registryFile);

  const empty = {
    license,
    registryFile: displayPath(root, registryFile),
    findings: [],
    fileCount: 0,
    recordCount: 0,
    eligibleCount: 0,
    ineligible: [],
    methodCounts: {},
    groupCount: 0
  };
  if (!license.ok) return empty;

  const absSpecs = resolve(root, specsDir);
  if (!existsSync(absSpecs)) return empty;

  const files = listFilesRecursive(absSpecs)
    .filter((abs) => abs.endsWith('/uservalidation.md') || abs.endsWith('\\uservalidation.md'))
    .sort(byteOrder);

  const eligible = [];
  const ineligible = [];
  const methodCounts = {};
  let recordCount = 0;

  for (const abs of files) {
    let fields;
    try {
      fields = parseAcceptanceRecord(readFileSync(abs, 'utf8'), license.heading);
    } catch { continue; }
    if (!fields) continue;
    recordCount++;

    const packet = displayPath(root, dirname(abs));
    const artifact = displayPath(root, abs);
    const method = fields.method?.value ?? '';
    const acceptedBy = fields.acceptedBy?.value ?? '';
    const acceptedAt = fields.acceptedAt?.value ?? '';
    methodCounts[method || '(absent)'] = (methodCounts[method || '(absent)'] ?? 0) + 1;

    if (method !== INTERACTIVE_METHOD) continue;
    if (acceptedBy === '' || acceptedBy.startsWith('[')) {
      ineligible.push({ packet, artifact, reason: 'acceptedBy is unfilled', acceptedBy, acceptedAt });
      continue;
    }
    const instant = instantOf(acceptedAt);
    if (instant === null) {
      ineligible.push({
        packet, artifact, acceptedBy, acceptedAt,
        reason: acceptedAt === '' ? 'acceptedAt is absent'
          : 'acceptedAt carries no second-precision time of day'
      });
      continue;
    }
    eligible.push({ packet, artifact, acceptedBy, acceptedAt, instant });
  }

  /* One group per (acceptor, instant). A group of one is a record that names a
     moment nothing else claims, which is exactly the honest shape. */
  const groups = new Map();
  for (const record of eligible) {
    const groupKey = record.acceptedBy + '@' + String(record.instant);
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(record);
  }

  const findings = [];
  let groupCount = 0;
  for (const [groupKey, members] of groups) {
    if (members.length < 2) continue;
    groupCount++;
    const packets = members.map((member) => member.packet).sort(byteOrder);
    for (const member of members) {
      findings.push({
        ...member,
        key: keyOf(member.packet, member.acceptedBy, member.acceptedAt),
        groupKey,
        groupSize: members.length,
        siblings: packets.filter((packet) => packet !== member.packet),
        detail: 'declares `' + INTERACTIVE_METHOD + '` accepted by ' + member.acceptedBy +
          ' at ' + member.acceptedAt + ', the same instant as ' + (members.length - 1) +
          ' other packet' + (members.length === 2 ? '' : 's') + ' (' +
          packets.filter((packet) => packet !== member.packet).join(', ') + ')'
      });
    }
  }

  findings.sort((a, b) => byteOrder(a.key, b.key));
  ineligible.sort((a, b) => byteOrder(a.packet, b.packet));
  return {
    license,
    registryFile: displayPath(root, registryFile),
    findings,
    fileCount: files.length,
    recordCount,
    eligibleCount: eligible.length,
    ineligible,
    methodCounts,
    groupCount
  };
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

export function validateAcceptanceBulkStamp(root = ROOT, options = {}) {
  const baselineFile = options.baselineFile
    ? resolve(options.baselineFile)
    : resolve(root, BASELINE_REL);
  const scan = collectAcceptanceStamps(root, options);

  const baseline = readBaseline(baselineFile);
  const baselinePresent = baseline !== null;
  const known = baseline ?? new Set();
  const presentKeys = new Set(scan.findings.map((finding) => finding.key));

  const newFindings = scan.findings.filter((finding) => !known.has(finding.key));
  const knownFindings = scan.findings.filter((finding) => known.has(finding.key));
  const staleBaseline = [...known].filter((key) => !presentKeys.has(key)).sort(byteOrder);

  const vacuous = scan.license.ok && scan.recordCount === 0;
  return {
    ...scan,
    ok: scan.license.ok && !vacuous && baselinePresent && newFindings.length === 0,
    vacuous,
    baselineFile: displayPath(root, baselineFile),
    baselinePresent,
    baselineCount: known.size,
    newFindings,
    knownFindings,
    staleBaseline
  };
}

export function formatAcceptanceBulkStampFindings(result, limit = Infinity) {
  const lines = [];
  if (!result.license.ok) {
    lines.push('NO-LICENSE: ' + result.license.reason);
    lines.push('    This guard asserts that two `' + INTERACTIVE_METHOD + '` records sharing one');
    lines.push('    acceptor and one instant contradict each other. That inference belongs to the');
    lines.push('    registry, not to this script, so it refuses rather than enforcing a rule the');
    lines.push('    registry has stopped stating. Repair ' + result.registryFile + ' or retire this guard.');
    return lines;
  }
  if (result.vacuous) {
    lines.push('NO-RECORDS: scanned ' + result.fileCount +
      ' uservalidation.md file(s) and parsed zero acceptance records — the guard cannot vouch for anything');
    return lines;
  }
  if (!result.baselinePresent) {
    lines.push('NO-BASELINE: ' + result.baselineFile + ' is missing — the ratchet has nothing to ' +
      'compare against; regenerate it with --update-baseline in a reviewed commit');
    return lines;
  }

  const shown = result.newFindings.slice(0, limit);
  for (const finding of shown) {
    lines.push('NEW-BULK-STAMP ' + finding.key + ' — ' + finding.detail + ' [' + finding.artifact + ']');
  }
  const hidden = result.newFindings.length - shown.length;
  if (hidden > 0) lines.push('    ... and ' + hidden + ' further new finding(s)');

  if (result.staleBaseline.length > 0) {
    lines.push('STALE-BASELINE: ' + result.staleBaseline.length + ' baseline entr' +
      (result.staleBaseline.length === 1 ? 'y no longer collides' : 'ies no longer collide') +
      ' — remove from ' + result.baselineFile + ':');
    for (const key of result.staleBaseline.slice(0, limit)) lines.push('    ' + key);
  }
  return lines;
}

export function renderBaseline(result, today) {
  const out = [];
  const c = (text) => out.push(text === '' ? '#' : '# ' + text);

  c('validate-acceptance-bulk-stamp baseline — Research Lab');
  c('');
  c('Human Acceptance Records that declare `' + INTERACTIVE_METHOD + '` while naming the');
  c('same acceptor at the same instant as another packet. The registry defines that');
  c('method as a human exercising the delivered behavior in a live session, and one');
  c('human cannot exercise two deliveries in one second, so each group below is a');
  c('self-contradiction rather than a suspicion.');
  c('');
  c('Frozen so the guard can fail on a NEW bulk stamp while this pre-existing set is');
  c('corrected by the workstreams that own it. NOTHING here is corrected by editing');
  c('the record to make the guard quiet.');
  c('');
  c('Keyed `<packet>::<acceptedBy>@<acceptedAt>` — per RECORD, and INCLUDING the');
  c('stamp. Both halves are load-bearing. Freezing the group would let a third packet');
  c('join an already-frozen instant for free, which is the act being guarded. Dropping');
  c('the stamp would let a frozen record be re-stamped into a different collision and');
  c('stay silent. Keyed this way, a record that moves produces a key nobody froze.');
  c('');
  c('THIS LIST MUST SHRINK, NEVER GROW. An entry is paid down by one of:');
  c('  - the acceptor performing the walk and recording the instant it happened, or');
  c('  - relabelling the record to the method that actually applies, where the');
  c('    acceptance happened elsewhere and `record` can point at it, or');
  c('  - withdrawing a record whose acceptance did not happen');
  c('Never by deleting a line here to make the run green.');
  c('');
  c('A baseline entry that no longer collides is reported STALE and the run still');
  c('exits 0. Remove it. Do NOT regenerate the baseline to silence a new finding.');
  c('');
  c('Regenerate ONLY when deliberately accepting the current set:');
  c('  node scripts/validate-acceptance-bulk-stamp.mjs --update-baseline');
  c('');
  c('There is no --skip / --force / --ignore / --bypass flag and there never will be.');
  c('A bypass-shaped flag exits non-zero.');
  c('');
  c('FROZEN: ' + result.findings.length + ' record(s) across ' + result.groupCount +
    ' collision group(s), of ' + result.eligibleCount + ' eligible `' + INTERACTIVE_METHOD +
    '` record(s) in ' + result.recordCount + ' acceptance record(s), on ' + today + '.');
  c('');
  c('---- finding detail --------------------------------------------------------');
  for (const finding of result.findings) {
    c('  ' + finding.key);
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
    'Usage: node scripts/validate-acceptance-bulk-stamp.mjs [options]',
    '',
    '  --all                  list every finding, not just the first few',
    '  --root <dir>           scan a different repo root',
    '  --baseline-file <p>    use a different baseline (test seam)',
    '  --registry-file <p>    read the license from a different registry (test seam)',
    '  --update-baseline      re-freeze the current finding set',
    '  -h, --help             this message',
    '',
    'Exit: 0 ok (stale entries may be reported); 1 a new collision, a vacuous scan,',
    '      a missing baseline, or a registry that no longer licenses the check;',
    '      2 unusable invocation.',
    '',
    'There is no --skip / --force / --ignore / --bypass flag. Accept a record by',
    'editing ' + BASELINE_REL + ' in a reviewed commit.'
  ].join('\n'));
}

function main() {
  const args = process.argv.slice(2);
  let root = ROOT;
  let baselineFile = null;
  let registryFile = null;
  let update = false;
  let limit = 10;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--all') { limit = Infinity; continue; }
    if (arg === '--update-baseline') { update = true; continue; }
    if (arg === '-h' || arg === '--help') { printHelp(); process.exit(0); }
    if (arg === '--root' || arg === '--baseline-file' || arg === '--registry-file') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) {
        console.error('[acceptance-bulk-stamp] ' + arg + ' needs a path');
        process.exit(2);
      }
      if (arg === '--root') root = resolve(value);
      else if (arg === '--baseline-file') baselineFile = resolve(value);
      else registryFile = resolve(value);
      i++;
      continue;
    }
    console.error("[acceptance-bulk-stamp] unknown argument '" + arg + "'");
    if (BYPASS_SHAPED.test(arg)) {
      console.error('[acceptance-bulk-stamp] there is no bypass flag and there never will be. ' +
        'Accept a record by editing ' + BASELINE_REL + ' in a reviewed commit.');
    }
    process.exit(2);
  }

  const options = {};
  if (baselineFile) options.baselineFile = baselineFile;
  if (registryFile) options.registryFile = registryFile;
  const result = validateAcceptanceBulkStamp(root, options);

  if (update) {
    if (!result.license.ok) {
      console.error('[acceptance-bulk-stamp] refusing to freeze without a license — ' + result.license.reason);
      process.exit(1);
    }
    if (result.vacuous) {
      console.error('[acceptance-bulk-stamp] refusing to freeze a vacuous scan — 0 acceptance records parsed');
      process.exit(1);
    }
    const target = baselineFile ?? resolve(root, BASELINE_REL);
    writeFileSync(target, renderBaseline(result, new Date().toISOString().slice(0, 10)));
    console.log('[acceptance-bulk-stamp] baseline written with ' + result.findings.length + ' entr' +
      (result.findings.length === 1 ? 'y' : 'ies'));
    console.log('  ' + displayPath(root, target));
    process.exit(0);
  }

  console.log('[acceptance-bulk-stamp] files=' + result.fileCount +
    ' records=' + result.recordCount +
    ' eligible=' + result.eligibleCount +
    ' ineligible=' + result.ineligible.length +
    ' groups=' + result.groupCount +
    ' colliding=' + result.findings.length +
    ' baseline=' + result.baselineCount +
    ' new=' + result.newFindings.length +
    ' stale=' + result.staleBaseline.length);
  for (const line of formatAcceptanceBulkStampFindings(result, limit)) console.log('  ' + line);

  if (result.ok) {
    console.log('[acceptance-bulk-stamp] OK — no new bulk-stamped acceptance record' +
      (result.staleBaseline.length > 0
        ? ' (' + result.staleBaseline.length + ' stale baseline entr' +
          (result.staleBaseline.length === 1 ? 'y' : 'ies') + ' to remove)'
        : ''));
    process.exit(0);
  }

  let reason;
  if (!result.license.ok) reason = 'the registry no longer licenses this check';
  else if (result.vacuous) reason = 'vacuous scan';
  else if (!result.baselinePresent) reason = 'baseline file missing at ' + result.baselineFile;
  else reason = result.newFindings.length + ' acceptance record(s) share an acceptor and an instant';
  console.log('[acceptance-bulk-stamp] FAIL — ' + reason);
  process.exit(1);
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) main();
