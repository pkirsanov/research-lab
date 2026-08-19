#!/usr/bin/env node
/* OHLC coherence guard for the daily-bar corpus (BUG-012, INV-012B-1..3).
 *
 * A daily bar states four prices about ONE session. Three of them — open, high, low — describe
 * where the price went; the fourth, close, is where it ended. That makes two relations true of
 * every real session, by definition rather than by convention:
 *
 *     l <= min(o, c)      the low is the lowest price the session touched
 *     h >= max(o, c)      the high is the highest price the session touched
 *
 * They fail the moment two of the four fields are quoted on DIFFERENT price bases. BUG-012 is
 * exactly that: `trimBars` took `c` from Yahoo's adjusted-close series while `o`, `h` and `l` came
 * from the raw quote series, so after any dividend the adjusted close sat below the raw low and the
 * row asserted a session that never happened. 71,714 of 150,161 rows across 245 of 293 files were
 * written that way, and nothing in the pipeline objected — `rlagenda.js` refused such a bar at READ
 * time, correctly, but by then the row had already been published.
 *
 * This guard exists because fixing the writer alone is not durable. The writer was correct once;
 * a later change to which series `c` came from reintroduced the incoherence silently, and would do
 * so again. A guard makes it structurally impossible in the same way the BUG-009 budget guard did
 * for unreachable Playwright waits: the invariant is asserted where the value is produced (write
 * time, `assertCoherentBar`) AND across everything already produced (corpus scan, wired into
 * `node scripts/selftest.mjs`), so neither a new write nor a silent corpus drift can pass.
 *
 * Enforcement has two GRANULARITIES, and they are not interchangeable. `partitionCoherentBars`
 * refuses a vendor row on its own, quarantining that session and keeping the rest of the symbol;
 * `assertCoherentBar` refuses outright and is reserved for a row this repository CONSTRUCTED, where
 * an incoherent result is our defect and must abort rather than be filed as vendor noise. Both
 * resolve to `barCoherenceViolation`, so the invariant itself is identical at either granularity.
 *
 * The corpus scan is adversarial only against the REAL `data/bars/` corpus. Run against a synthetic
 * clean sample it is tautological — it would pass before and after the fix and prove nothing — so
 * `validateBarsCorpus` reports `vacuous` when it matched no files or no rows, and the selftest
 * asserts on that flag rather than trusting a bare green.
 *
 * Usage:  node scripts/validate-bars-coherence.mjs
 * Exit:   0 = every row coherent, 1 = at least one row violates, 2 = the scan found nothing to scan.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BARS_DIR_REL = 'data/bars';

/* `index.json` is the run manifest, not a bar file: it carries per-symbol summaries under
   `tickers`, never `rows`. Scanning it would neither find violations nor cost anything, but naming
   it here keeps the file count honest — 293 symbol files, not 294 entries. */
const NON_SYMBOL_FILES = new Set(['index.json']);

/* --------------------------------------------------------------- the predicate */

/* The one place the invariant is written down. Both call sites — the write-time assertion and the
   corpus scan — resolve to this, so they cannot drift apart and start disagreeing about what
   "coherent" means. */
export function barCoherenceViolation(row) {
  if (!row || typeof row !== 'object') return 'row is not an object';
  const { o, h, l, c } = row;
  /* A non-finite price is a different defect with a different remedy, and reporting it as an
     ordering violation would send a reader looking for an adjustment bug that is not there. The
     writer already skips rows with a non-finite close before this guard sees them. */
  if (![o, h, l, c].every(Number.isFinite)) return null;
  const lowBound = Math.min(o, c);
  const highBound = Math.max(o, c);
  if (l > lowBound) return 'l ' + l + ' exceeds min(o, c) ' + lowBound;
  if (h < highBound) return 'h ' + h + ' is below max(o, c) ' + highBound;
  if (l > h) return 'l ' + l + ' exceeds h ' + h;
  return null;
}

export function isCoherentBar(row) {
  return barCoherenceViolation(row) === null;
}

/* Write-time enforcement. Throws rather than returning a verdict the caller may ignore: a guard
   whose result can be dropped on the floor is not a guard. The message names the symbol, the
   session and the four prices, because the first question asked of any such failure is "which row,
   and what did the vendor actually say". */
export function assertCoherentBar(row, symbol) {
  const violation = barCoherenceViolation(row);
  if (!violation) return row;
  const session = Number.isFinite(row && row.t) ? new Date(row.t).toISOString() : 'unknown session';
  throw new Error(
    'incoherent bar refused for ' + (symbol || 'unknown symbol') + ' at ' + session + ': ' + violation
    + ' (o=' + (row && row.o) + ' h=' + (row && row.h) + ' l=' + (row && row.l) + ' c=' + (row && row.c) + ')'
  );
}

/* Per-ROW refusal, for vendor-supplied rows. `assertCoherentBar` refuses at the granularity of the
 * call, which for a whole payload means the granularity of the SYMBOL: the first bad row aborts the
 * write and the file keeps its last-good copy. That is the wrong unit when the vendor's own raw
 * series carries one bad session — Yahoo published `o` above `h` for XLRE on 2026-08-18 — because
 * one untrustworthy bar then forfeits the other 517 trustworthy ones indefinitely. Re-running does
 * not help; it fails identically every time, which is how a corpus stays broken.
 *
 * The invariant is applied at exactly the same strength: `barCoherenceViolation` is the same
 * predicate the write-time assertion and the corpus scan resolve to, so the rows this drops are
 * precisely the rows the scan would have flagged, and no incoherent row is ever written.
 *
 * Dropping silently would be this bug wearing a different hat, so the quarantine is a RECORD rather
 * than a discard. Every refused row comes back carrying its session, the relation that failed, and
 * the four prices the vendor actually published, so the caller can file it beside the rows it kept
 * and a reader of a gap can see it was refused rather than merely absent. */
export function partitionCoherentBars(rows) {
  const coherent = [];
  const quarantined = [];
  for (const row of Array.isArray(rows) ? rows : []) {
    const violation = barCoherenceViolation(row);
    if (!violation) { coherent.push(row); continue; }
    quarantined.push({
      t: row && row.t,
      session: Number.isFinite(row && row.t) ? new Date(row.t).toISOString().slice(0, 10) : null,
      detail: violation, o: row && row.o, h: row && row.h, l: row && row.l, c: row && row.c
    });
  }
  return { coherent, quarantined };
}

/* ------------------------------------------------------------------ corpus scan */

export function validateBarsCorpus(root = ROOT, barsDirRel = BARS_DIR_REL) {
  const barsDir = join(root, barsDirRel);
  let entries = [];
  try {
    entries = readdirSync(barsDir).filter((name) => name.endsWith('.json') && !NON_SYMBOL_FILES.has(name)).sort();
  } catch (error) {
    return {
      vacuous: true, unreadable: [{ file: barsDirRel, reason: error.message }],
      scannedFiles: 0, scannedRows: 0, violatingFiles: [], violationCount: 0, violations: []
    };
  }

  const violations = [];
  const violatingFiles = [];
  const unreadable = [];
  let scannedRows = 0;
  let scannedFiles = 0;

  for (const name of entries) {
    const rel = barsDirRel + '/' + name;
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(join(barsDir, name), 'utf8'));
    } catch (error) {
      unreadable.push({ file: rel, reason: error.message });
      continue;
    }
    const rows = parsed && Array.isArray(parsed.rows) ? parsed.rows : null;
    if (!rows) {
      unreadable.push({ file: rel, reason: 'no rows array' });
      continue;
    }
    scannedFiles++;
    let fileViolations = 0;
    for (const row of rows) {
      scannedRows++;
      const violation = barCoherenceViolation(row);
      if (!violation) continue;
      fileViolations++;
      violations.push({
        file: rel,
        symbol: (parsed && parsed.sym) || name.replace(/\.json$/, ''),
        session: Number.isFinite(row.t) ? new Date(row.t).toISOString() : 'unknown',
        detail: violation, o: row.o, h: row.h, l: row.l, c: row.c
      });
    }
    if (fileViolations) violatingFiles.push({ file: rel, count: fileViolations, rows: rows.length });
  }

  return {
    /* Vacuous when the scan had nothing to assert on. Without this the guard passes loudest exactly
       when it has stopped looking at anything — the failure mode that makes a green meaningless. */
    vacuous: scannedFiles === 0 || scannedRows === 0,
    scannedFiles, scannedRows, unreadable,
    violatingFiles, violationCount: violations.length, violations
  };
}

export function formatBarsCoherenceFindings(result, limit = 5) {
  const lines = [];
  lines.push('scanned ' + result.scannedFiles + ' file(s), ' + result.scannedRows + ' row(s)');
  for (const entry of result.unreadable) lines.push('unreadable: ' + entry.file + ' \u2014 ' + entry.reason);
  if (!result.violationCount) return lines;
  lines.push(result.violationCount + ' incoherent row(s) across ' + result.violatingFiles.length + ' file(s)');
  for (const violation of result.violations.slice(0, limit)) {
    lines.push(violation.symbol + ' ' + violation.session + ': ' + violation.detail);
  }
  const hidden = result.violationCount - Math.min(limit, result.violations.length);
  if (hidden > 0) lines.push('... and ' + hidden + ' more');
  return lines;
}

/* ------------------------------------------------------------------------- CLI */

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const result = validateBarsCorpus();
  for (const line of formatBarsCoherenceFindings(result, 20)) console.log(line);
  if (result.vacuous) {
    console.log('VACUOUS: the scan matched no bar rows, so a pass here would assert nothing');
    process.exit(2);
  }
  console.log(result.violationCount === 0
    ? 'OK: every scanned row satisfies l <= min(o, c), h >= max(o, c) and l <= h'
    : 'FAIL: ' + result.violationCount + ' row(s) violate OHLC coherence');
  process.exit(result.violationCount === 0 ? 0 : 1);
}
