#!/usr/bin/env node
/* On-disk quarantine for bar rows that cannot be re-fetched (BUG-012, INV-012B-3).
 *
 * `scripts/fetch-bars.mjs` refuses an incoherent row at WRITE time: `partitionCoherentBars` drops
 * the offending session, keeps the rest of the symbol, and records what it refused. That closes the
 * invariant for every row the fetcher touches — and only for those. A row already sitting in
 * `data/bars/` whose symbol the fetcher can no longer reach never passes through that path again,
 * so it stays incoherent forever while the guard reports it every run. An invariant with a
 * permanently exempt population is not an invariant; it is a guard that has learned to lose.
 *
 * Two such symbols exist in this corpus and neither can be repaired by fetching:
 *
 *   EA   183 of 511 rows, sessions 2024-07-25 .. 2026-05-11. `l` above `min(o, c)` — the original
 *        mixed-basis signature, an adjusted close filed beside a raw low. EA appears in NO universe
 *        file, so `universe()` never selects it; `repairUniverse()` does, by walking the directory,
 *        but the vendor call did not return it and the catch kept the last-good copy.
 *   NDX  5 of 474 rows, sessions 2026-07-20 .. 2026-07-24. `o = h = l = 0` beside a live close —
 *        a different corruption with the same verdict. NDX is declared `"on": false` in
 *        `options-structure-universe.json`, labelled "options often NOT on the public Yahoo
 *        endpoint", and was last fetched 2026-07-26.
 *
 * The raw close for those rows is unrecoverable. Yahoo's adjustment factor varies by date and was
 * never persisted, so it cannot be divided back out, and no fetch returns the rows. Every remedy
 * that leaves a row in place has to INVENT one of its four prices — reconstruct the close, clamp
 * `h`/`l` to span `o`/`c`, interpolate a neighbouring session, or promote the adjusted value into
 * `c`. Each publishes a session that did not happen, which is the defect this packet exists to
 * remove, not a repair of it. This repository renders absence as unavailable and never substitutes.
 * So the row goes, and the fact that it went is written down.
 *
 * This applies the SAME rule at the SAME strength as the write path — it imports
 * `partitionCoherentBars` rather than restating the predicate, so the rows it drops are exactly the
 * rows the corpus scan flags — and writes the SAME provenance shape the write path writes,
 * `quarantinedSessions` beside `quarantinedRows`, so a consumer has one thing to read rather than
 * two dialects of the same fact.
 *
 * It is a separate script rather than a mode of `validate-bars-coherence.mjs` on purpose: that
 * module is a guard, and a guard you cannot run without wondering whether it just rewrote your
 * corpus is one people stop running. Reporting and mutating stay apart. For the same reason the
 * default here is a dry run.
 *
 * Usage:  node scripts/quarantine-incoherent-bars.mjs           report only, writes nothing
 *         node scripts/quarantine-incoherent-bars.mjs --apply   rewrite the affected files
 * Exit:   0 = corpus already clean, or (with --apply) every incoherent row quarantined
 *         1 = incoherent rows remain — reported in a dry run, or a symbol refused below
 *         2 = the scan found nothing to scan, so a pass here would assert nothing
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { partitionCoherentBars } from './validate-bars-coherence.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BARS_DIR_REL = 'data/bars';
const NON_SYMBOL_FILES = new Set(['index.json']);

/* Session lists that describe a ROW rather than the file. Each names sessions the record claims are
   present and characterised — reconstructed from intraday, thin, or observed with zero trades. A
   quarantined session has no row at all, so leaving its date in one of these would have the record
   assert two incompatible things about the same session. */
const ROW_DESCRIBING_SESSION_LISTS = ['reconstructedSessions', 'thinObservedSessions', 'zeroObservedSessions'];

function sessionDateFromMs(value) {
  return Number.isFinite(value) ? new Date(value).toISOString().slice(0, 10) : null;
}

/* Pure, so the adversarial selftest can exercise it without touching the corpus. Returns the next
   record rather than mutating, and reports `changed: false` when there was nothing to refuse — the
   caller must not rewrite a file it has no reason to rewrite. */
export function quarantineRecord(record) {
  const rows = record && Array.isArray(record.rows) ? record.rows : null;
  if (!rows) return { changed: false, refused: 'no rows array', record, quarantined: [], removed: 0 };

  const { coherent, quarantined } = partitionCoherentBars(rows);
  if (!quarantined.length) return { changed: false, refused: null, record, quarantined: [], removed: 0 };

  /* Emptying a file is not a quarantine, it is a deletion wearing a quarantine's clothes: the
     series would still be enumerated as committed while describing no session at all. That is a
     judgement about whether the symbol belongs in the corpus, which is not this script's to make,
     so it refuses and says so instead of silently producing an empty history. */
  if (!coherent.length) {
    return {
      changed: false, refused: 'every row is incoherent, so quarantining would leave no history',
      record, quarantined, removed: 0
    };
  }

  const retainedSessions = new Set(coherent.map((row) => sessionDateFromMs(row.t)));

  /* Prior entries carry forward for the same reason the write path carries them: a session refused
     before and still absent is absent for the same reason, and its explanation should outlive the
     run that discovered it. A session that is present and coherent drops out, so the record heals
     itself the moment the data becomes trustworthy — including on a later successful fetch, since
     the write path applies the identical `retainedSessions` test. No age filter is applied here:
     every entry this pass creates was carved out of the file's own retained window, so an entry
     that fell outside that window could not have been produced in the first place. */
  const byTimestamp = new Map();
  for (const entry of [...(Array.isArray(record.quarantinedRows) ? record.quarantinedRows : []), ...quarantined]) {
    if (entry && entry.session && Number.isFinite(entry.t)) byTimestamp.set(entry.t, entry);
  }
  const quarantinedRows = [...byTimestamp.values()]
    .filter((entry) => !retainedSessions.has(entry.session))
    .sort((a, b) => a.t - b.t);
  const quarantinedSessions = [...new Set(quarantinedRows.map((entry) => entry.session))];
  const quarantinedSessionSet = new Set(quarantinedSessions);

  /* `asof` is derived from the last row, so removing a trailing row without recomputing it leaves
     the record naming a session the file no longer contains — the precise dishonesty the write
     path avoids by refusing rows BEFORE it derives anything from them. NDX is exactly this case:
     its five incoherent rows are its five most recent, and its `asof` is the last of them. */
  const nextAsof = sessionDateFromMs(coherent[coherent.length - 1].t);

  const next = {};
  let provenanceWritten = false;
  const writeProvenance = () => {
    next.quarantinedSessions = quarantinedSessions;
    next.quarantinedRows = quarantinedRows;
    provenanceWritten = true;
  };
  for (const key of Object.keys(record)) {
    if (key === 'quarantinedSessions' || key === 'quarantinedRows') {
      if (!provenanceWritten) writeProvenance();
      continue;
    }
    /* Emitted immediately before `rows`, which is where the write path puts them, so a file
       repaired here and a file rewritten by a later fetch have the same field order. */
    if (key === 'rows') {
      if (!provenanceWritten) writeProvenance();
      next.rows = coherent;
      continue;
    }
    if (key === 'asof') { next.asof = nextAsof; continue; }
    if (ROW_DESCRIBING_SESSION_LISTS.includes(key) && Array.isArray(record[key])) {
      next[key] = record[key].filter((session) => !quarantinedSessionSet.has(session));
      continue;
    }
    /* The expected session's own bar being the refused one is the common case, because a bar is
       least settled on the day it closes. The write path names that state rather than leaving the
       record claiming the session was observed. */
    if (key === 'sessionState' && record.expectedSessionDate && quarantinedSessionSet.has(record.expectedSessionDate)) {
      next.sessionState = 'quarantined';
      continue;
    }
    next[key] = record[key];
  }
  if (!provenanceWritten) writeProvenance();

  return {
    changed: true, refused: null, record: next, quarantined: quarantinedRows,
    removed: rows.length - coherent.length,
    rowsBefore: rows.length, rowsAfter: coherent.length,
    asofBefore: record.asof, asofAfter: nextAsof
  };
}

export function quarantineBarsCorpus(root = ROOT, { apply = false, barsDirRel = BARS_DIR_REL } = {}) {
  const barsDir = join(root, barsDirRel);
  let entries = [];
  try {
    entries = readdirSync(barsDir).filter((name) => name.endsWith('.json') && !NON_SYMBOL_FILES.has(name)).sort();
  } catch (error) {
    return { vacuous: true, scannedFiles: 0, scannedRows: 0, changed: [], refused: [{ file: barsDirRel, reason: error.message }] };
  }

  const changed = [];
  const refused = [];
  let scannedFiles = 0;
  let scannedRows = 0;

  for (const name of entries) {
    const rel = barsDirRel + '/' + name;
    const abs = join(barsDir, name);
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(abs, 'utf8'));
    } catch (error) {
      refused.push({ file: rel, reason: error.message });
      continue;
    }
    if (!parsed || !Array.isArray(parsed.rows)) {
      refused.push({ file: rel, reason: 'no rows array' });
      continue;
    }
    scannedFiles++;
    scannedRows += parsed.rows.length;

    const outcome = quarantineRecord(parsed);
    if (outcome.refused) { refused.push({ file: rel, reason: outcome.refused }); continue; }
    if (!outcome.changed) continue;

    /* Minified, matching `writeFileSync(existingFile, JSON.stringify(record))` in the write path.
       Re-indenting here would rewrite all 292 files as a formatting change and bury the real one. */
    if (apply) writeFileSync(abs, JSON.stringify(outcome.record));
    changed.push({
      file: rel, symbol: parsed.sym || name.replace(/\.json$/, ''),
      removed: outcome.removed, rowsBefore: outcome.rowsBefore, rowsAfter: outcome.rowsAfter,
      asofBefore: outcome.asofBefore, asofAfter: outcome.asofAfter,
      sessions: outcome.quarantined.map((entry) => entry.session)
    });
  }

  return {
    /* Same vacuity guard the corpus scan carries, for the same reason: a pass earned by matching
       nothing is the one failure mode a green verdict cannot distinguish from success. */
    vacuous: scannedFiles === 0 || scannedRows === 0,
    scannedFiles, scannedRows, changed, refused, applied: apply
  };
}

export function formatQuarantineFindings(result) {
  const lines = [];
  lines.push('scanned ' + result.scannedFiles + ' file(s), ' + result.scannedRows + ' row(s)');
  for (const entry of result.refused) lines.push('refused: ' + entry.file + ' \u2014 ' + entry.reason);
  if (!result.changed.length) {
    lines.push('no incoherent row on disk \u2014 nothing to quarantine');
    return lines;
  }
  const total = result.changed.reduce((sum, entry) => sum + entry.removed, 0);
  lines.push((result.applied ? 'quarantined ' : 'would quarantine ') + total + ' row(s) across ' + result.changed.length + ' file(s)');
  for (const entry of result.changed) {
    lines.push('  ' + entry.symbol + ': ' + entry.removed + ' row(s) removed, ' + entry.rowsBefore + ' \u2192 ' + entry.rowsAfter
      + ', sessions ' + entry.sessions[0] + ' .. ' + entry.sessions[entry.sessions.length - 1]
      + (entry.asofBefore === entry.asofAfter ? ', asof unchanged ' + entry.asofAfter : ', asof ' + entry.asofBefore + ' \u2192 ' + entry.asofAfter));
  }
  return lines;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  const apply = process.argv.includes('--apply');
  const result = quarantineBarsCorpus(ROOT, { apply });
  for (const line of formatQuarantineFindings(result)) console.log(line);
  if (result.vacuous) {
    console.log('VACUOUS: the scan matched no bar rows, so a pass here would assert nothing');
    process.exit(2);
  }
  if (result.refused.length) {
    console.log('FAIL: ' + result.refused.length + ' file(s) could not be processed');
    process.exit(1);
  }
  if (!apply && result.changed.length) {
    console.log('DRY RUN: re-run with --apply to write these quarantines');
    process.exit(1);
  }
  console.log('OK: no incoherent row remains on disk');
  process.exit(0);
}
