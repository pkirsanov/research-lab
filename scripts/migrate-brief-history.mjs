/*
 * scripts/migrate-brief-history.mjs — Feature 002 Scope 07 (SCN-002-009).
 *
 * Read-only legacy-history migration. The default `--check` action inventories the ACTUAL
 * brief-history.jsonl, maps every row that is actually present (the row count is DERIVED from the
 * live file at run time — never a fixed literal such as 26 or 55), validates strict one-to-one
 * parity, and proves the legacy bytes are unchanged before and after. It never writes the legacy
 * file. Writing normalized artifacts happens only through the publication staging adapter during a
 * later implementation migration phase; this CLI has no write path.
 *
 * Pure cores (`inventoryLegacyHistory`, `mapLegacyRows`, `validateMigrationParity`) take exact bytes
 * so Scope 07 filesystem tests can drive them against isolated fixture corpora without ever touching
 * the repository's authoritative history.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

export const MIGRATION_ERRORS = Object.freeze({
  BYTES_REQUIRED: 'legacy-bytes-required',
  EMPTY_CORPUS: 'legacy-corpus-empty',
  MALFORMED_ROW: 'legacy-row-malformed',
  BLANK_INTERIOR: 'legacy-row-blank-interior',
  MISSING_TIMESTAMP: 'legacy-row-timestamp-missing',
  INVALID_TIMESTAMP: 'legacy-row-timestamp-invalid',
  MISSING_WINDOW: 'legacy-row-window-missing',
  INVENTORY_REQUIRED: 'legacy-inventory-required',
  OCCURRENCE_COUNT: 'occurrence-count-mismatch',
  ROW_BIJECTION: 'row-bijection-broken',
  RAW_FINGERPRINT: 'raw-fingerprint-mismatch',
  COVERAGE_CHANGED: 'timestamp-window-coverage-changed',
  TIME_BOUNDS: 'time-bounds-changed',
  OCCURRENCE_LOST: 'duplicate-occurrence-lost',
  CONTENT_UNRESOLVED: 'occurrence-content-unresolved',
  IMPLICIT_NARRATIVE: 'implicit-narrative-reconstructed',
  RE_DERIVATION: 'partition-index-re-derivation-mismatch',
  BYTES_CHANGED: 'legacy-bytes-changed'
});

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function migrationFailure(reason, detail) {
  return { ok: false, error: { code: 'B002-MIGRATION', reason, detail: detail === undefined ? null : detail } };
}

/** Canonical `America/New_York` `YYYY-MM` for a legacy occurrence epoch. */
function canonicalMonthEt(epochMs) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(new Date(epochMs));
  const year = parts.find((p) => p.type === 'year').value;
  const month = parts.find((p) => p.type === 'month').value;
  return `${year}-${month}`;
}

/**
 * inventoryLegacyHistory(bytes): freeze the read-only legacy corpus.
 * Records byte count, full file hash, one raw-line hash per line ACTUALLY PRESENT (count derived),
 * parsed timestamps/windows, and min/max times. A malformed or blank interior row blocks migration;
 * no row is skipped.
 */
export function inventoryLegacyHistory(bytes) {
  if (!Buffer.isBuffer(bytes)) {
    return migrationFailure(MIGRATION_ERRORS.BYTES_REQUIRED, 'inventory requires a Buffer of the exact file bytes');
  }
  const byteLength = bytes.length;
  const fileSha256 = `sha256:${sha256Hex(bytes)}`;
  const text = bytes.toString('utf8');
  const endsWithNewline = text.endsWith('\n');
  const rawLines = text.split('\n');
  const rows = [];
  for (let i = 0; i < rawLines.length; i += 1) {
    const line = rawLines[i];
    if (line.length === 0) {
      // Only a single empty tail produced by the final newline is tolerated; an interior blank line
      // is a corrupt corpus and blocks migration.
      if (i === rawLines.length - 1 && endsWithNewline) continue;
      return migrationFailure(MIGRATION_ERRORS.BLANK_INTERIOR, `blank line at source index ${i}`);
    }
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch (error) {
      return migrationFailure(MIGRATION_ERRORS.MALFORMED_ROW, `source index ${i} is not valid JSON`);
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return migrationFailure(MIGRATION_ERRORS.MALFORMED_ROW, `source index ${i} is not a JSON object`);
    }
    if (typeof parsed.ts !== 'string' || parsed.ts.length === 0) {
      return migrationFailure(MIGRATION_ERRORS.MISSING_TIMESTAMP, `source index ${i}`);
    }
    if (typeof parsed.window !== 'string' || parsed.window.length === 0) {
      return migrationFailure(MIGRATION_ERRORS.MISSING_WINDOW, `source index ${i}`);
    }
    const epochMs = Date.parse(parsed.ts);
    if (!Number.isFinite(epochMs)) {
      return migrationFailure(MIGRATION_ERRORS.INVALID_TIMESTAMP, `source index ${i} ts=${parsed.ts}`);
    }
    // Row fingerprint is SHA-256 over the exact row bytes WITHOUT the line terminator.
    const rawFingerprint = `sha256:${sha256Hex(Buffer.from(line, 'utf8'))}`;
    rows.push({
      index: rows.length,
      sourceLineIndex: i,
      ts: parsed.ts,
      epochMs,
      window: parsed.window,
      canonicalMonth: canonicalMonthEt(epochMs),
      rawFingerprint,
      parsed
    });
  }
  if (rows.length === 0) {
    return migrationFailure(MIGRATION_ERRORS.EMPTY_CORPUS, 'no rows present');
  }
  let minTime = rows[0].ts;
  let maxTime = rows[0].ts;
  let minEpoch = rows[0].epochMs;
  let maxEpoch = rows[0].epochMs;
  const windowCounts = {};
  for (const row of rows) {
    if (row.epochMs < minEpoch) { minEpoch = row.epochMs; minTime = row.ts; }
    if (row.epochMs > maxEpoch) { maxEpoch = row.epochMs; maxTime = row.ts; }
    windowCounts[row.window] = (windowCounts[row.window] || 0) + 1;
  }
  return {
    ok: true,
    inventory: {
      contractVersion: 'legacy-history-inventory/v1',
      source: 'brief-history.jsonl',
      byteLength,
      fileSha256,
      endsWithNewline,
      rowCount: rows.length, // DERIVED from the live file — never a fixed literal.
      rows,
      minTime,
      maxTime,
      minEpochMs: minEpoch,
      maxEpochMs: maxEpoch,
      windowCounts
    }
  };
}

/** Canonical migrated-read content object for one legacy row (occurrence timestamp excluded). */
function migratedReadContent(parsed) {
  const body = {};
  for (const key of Object.keys(parsed)) {
    if (key === 'ts') continue; // occurrence identity, not shared content
    body[key] = parsed[key];
  }
  const content = {
    contractVersion: 'legacy-migrated-read/v1',
    migrationSource: { file: 'brief-history.jsonl', kind: 'legacy-global-history-row' },
    body
  };
  const contentFingerprint = `sha256:${sha256Hex(RLCONTRACTS.canonicalize(content, 'legacy-migrated-read/v1'))}`;
  return { content, contentFingerprint };
}

/**
 * mapLegacyRows(inventory): deterministic mapping.
 * Each row receives `legacy/<timestamp>/<window>/<row-hash-prefix>` as its legacy run key and retains
 * its source-row fingerprint. Normalized data actually present becomes migrated read content with a
 * `migrationSource` marker. Exact canonical duplicate content creates ONE content object with multiple
 * occurrence references. No historical per-tool brief, recommendation lifecycle, or final narrative is
 * invented: each occurrence records explicit unavailability unless a Git final proof is supplied.
 */
export function mapLegacyRows(inventory, options) {
  if (!inventory || inventory.contractVersion !== 'legacy-history-inventory/v1' || !Array.isArray(inventory.rows)) {
    return migrationFailure(MIGRATION_ERRORS.INVENTORY_REQUIRED, 'mapLegacyRows requires a frozen legacy inventory');
  }
  const gitFinalProver = options && typeof options.gitFinalProver === 'function' ? options.gitFinalProver : null;
  const contentObjects = {};
  const occurrences = [];
  for (const row of inventory.rows) {
    const { content, contentFingerprint } = migratedReadContent(row.parsed);
    if (!contentObjects[contentFingerprint]) {
      contentObjects[contentFingerprint] = { content, occurrenceCount: 0 };
    }
    contentObjects[contentFingerprint].occurrenceCount += 1;
    const rowHashPrefix = row.rawFingerprint.slice('sha256:'.length, 'sha256:'.length + 12);
    const legacyRunKey = `legacy/${row.ts}/${row.window}/${rowHashPrefix}`;
    // A final association is created ONLY when Git history proves an exact payload/run relationship;
    // otherwise the occurrence is explicitly `legacy-final-unavailable`.
    const proven = gitFinalProver ? gitFinalProver(row) : null;
    const finalAssociation = proven && typeof proven === 'object' && proven.finalRef
      ? { status: 'git-proven', finalRef: proven.finalRef }
      : { status: 'legacy-final-unavailable', finalRef: null };
    occurrences.push({
      contractVersion: 'legacy-run-occurrence/v1',
      sourceLineIndex: row.sourceLineIndex,
      legacyRunKey,
      ts: row.ts,
      window: row.window,
      canonicalMonth: row.canonicalMonth,
      sourceRowFingerprint: row.rawFingerprint,
      contentRef: contentFingerprint,
      // Explicit historical absences — never reconstructed prose.
      toolBrief: { status: 'legacy-tool-brief-unavailable' },
      recommendationLifecycle: { status: 'legacy-recommendation-unavailable' },
      finalBrief: finalAssociation
    });
  }
  // Derive monthly run partitions + a compact content-addressed index over the authoritative rows.
  const partitions = {};
  for (const occurrence of occurrences) {
    const partitionPath = `briefs/history/runs/${occurrence.canonicalMonth}.jsonl`;
    if (!partitions[partitionPath]) partitions[partitionPath] = [];
    partitions[partitionPath].push({
      contractVersion: 'legacy-run-row/v1',
      legacyRunKey: occurrence.legacyRunKey,
      ts: occurrence.ts,
      window: occurrence.window,
      sourceRowFingerprint: occurrence.sourceRowFingerprint,
      contentRef: occurrence.contentRef,
      toolBrief: occurrence.toolBrief.status,
      recommendation: occurrence.recommendationLifecycle.status,
      final: occurrence.finalBrief.status
    });
  }
  const indexes = buildMigrationIndexes(partitions, contentObjects);
  return {
    ok: true,
    mapping: {
      contractVersion: 'legacy-history-mapping/v1',
      rowCount: inventory.rowCount,
      occurrences,
      contentObjects,
      partitions,
      indexes,
      unavailable: {
        toolBriefs: occurrences.length,
        recommendations: occurrences.length,
        finals: occurrences.filter((o) => o.finalBrief.status === 'legacy-final-unavailable').length
      }
    }
  };
}

function buildMigrationIndexes(partitions, contentObjects) {
  const partitionIndex = {};
  const partitionPaths = Object.keys(partitions).sort();
  for (const partitionPath of partitionPaths) {
    const rows = partitions[partitionPath];
    const bytes = Buffer.from(rows.map((row) => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''), 'utf8');
    partitionIndex[partitionPath] = {
      path: partitionPath,
      rowCount: rows.length,
      byteLength: bytes.length,
      sha256: `sha256:${sha256Hex(bytes)}`
    };
  }
  const contentIndex = {};
  for (const fingerprint of Object.keys(contentObjects).sort()) {
    contentIndex[fingerprint] = { occurrenceCount: contentObjects[fingerprint].occurrenceCount };
  }
  return {
    contractVersion: 'legacy-migration-index/v1',
    partitions: partitionIndex,
    contentObjects: contentIndex,
    totalRows: partitionPaths.reduce((sum, p) => sum + partitions[p].length, 0),
    distinctContentObjects: Object.keys(contentObjects).length
  };
}

/**
 * validateMigrationParity(inventory, mapping, options): prove the migration one-to-one, complete, and
 * non-inventive, and (when raw bytes are supplied) that the legacy file hash is unchanged.
 */
export function validateMigrationParity(inventory, mapping, options) {
  if (!inventory || inventory.contractVersion !== 'legacy-history-inventory/v1') {
    return migrationFailure(MIGRATION_ERRORS.INVENTORY_REQUIRED, 'parity requires a frozen legacy inventory');
  }
  if (!mapping || mapping.contractVersion !== 'legacy-history-mapping/v1') {
    return migrationFailure(MIGRATION_ERRORS.INVENTORY_REQUIRED, 'parity requires a legacy mapping');
  }
  const derivedRowCount = inventory.rowCount;
  const occurrences = mapping.occurrences;
  // (1) Derived input row count equals mapped occurrence count, one-to-one.
  if (occurrences.length !== derivedRowCount) {
    return migrationFailure(MIGRATION_ERRORS.OCCURRENCE_COUNT, `rows=${derivedRowCount} occurrences=${occurrences.length}`);
  }
  // (2) Bijection over source line indexes (no row dropped or invented).
  const seenLineIndexes = new Set();
  for (const occurrence of occurrences) {
    if (seenLineIndexes.has(occurrence.sourceLineIndex)) {
      return migrationFailure(MIGRATION_ERRORS.ROW_BIJECTION, `duplicate sourceLineIndex ${occurrence.sourceLineIndex}`);
    }
    seenLineIndexes.add(occurrence.sourceLineIndex);
  }
  const byLineIndex = new Map(inventory.rows.map((row) => [row.sourceLineIndex, row]));
  for (const row of inventory.rows) {
    if (!seenLineIndexes.has(row.sourceLineIndex)) {
      return migrationFailure(MIGRATION_ERRORS.ROW_BIJECTION, `source index ${row.sourceLineIndex} has no occurrence`);
    }
  }
  // (3) Every raw row fingerprint is preserved exactly per occurrence, and (4)/(5) coverage/bounds hold.
  const inventoryCoverage = inventory.rows.map((r) => `${r.ts}\u0000${r.window}`).sort();
  const mappedCoverage = [];
  for (const occurrence of occurrences) {
    const row = byLineIndex.get(occurrence.sourceLineIndex);
    if (occurrence.sourceRowFingerprint !== row.rawFingerprint) {
      return migrationFailure(MIGRATION_ERRORS.RAW_FINGERPRINT, `source index ${occurrence.sourceLineIndex}`);
    }
    mappedCoverage.push(`${occurrence.ts}\u0000${occurrence.window}`);
  }
  mappedCoverage.sort();
  if (JSON.stringify(inventoryCoverage) !== JSON.stringify(mappedCoverage)) {
    return migrationFailure(MIGRATION_ERRORS.COVERAGE_CHANGED, 'timestamp/window multiset differs');
  }
  let minTime = occurrences[0].ts;
  let maxTime = occurrences[0].ts;
  for (const occurrence of occurrences) {
    if (occurrence.ts < minTime) minTime = occurrence.ts;
    if (occurrence.ts > maxTime) maxTime = occurrence.ts;
  }
  if (minTime !== inventory.minTime || maxTime !== inventory.maxTime) {
    return migrationFailure(MIGRATION_ERRORS.TIME_BOUNDS, `min/max drift observed`);
  }
  // (6) Duplicate content preserves every occurrence, and every content ref resolves.
  const contentCounts = {};
  for (const occurrence of occurrences) {
    if (!mapping.contentObjects[occurrence.contentRef]) {
      return migrationFailure(MIGRATION_ERRORS.CONTENT_UNRESOLVED, occurrence.contentRef);
    }
    contentCounts[occurrence.contentRef] = (contentCounts[occurrence.contentRef] || 0) + 1;
  }
  let summedOccurrences = 0;
  for (const fingerprint of Object.keys(mapping.contentObjects)) {
    const declared = mapping.contentObjects[fingerprint].occurrenceCount;
    if (declared !== (contentCounts[fingerprint] || 0)) {
      return migrationFailure(MIGRATION_ERRORS.OCCURRENCE_LOST, `${fingerprint} declared=${declared} mapped=${contentCounts[fingerprint] || 0}`);
    }
    summedOccurrences += declared;
  }
  if (summedOccurrences !== derivedRowCount) {
    return migrationFailure(MIGRATION_ERRORS.OCCURRENCE_LOST, `content occurrences=${summedOccurrences} rows=${derivedRowCount}`);
  }
  // (7) Every absent per-tool brief / recommendation / final is EXPLICITLY unavailable (never reconstructed).
  for (const occurrence of occurrences) {
    if (occurrence.toolBrief.status !== 'legacy-tool-brief-unavailable') {
      return migrationFailure(MIGRATION_ERRORS.IMPLICIT_NARRATIVE, `reconstructed tool brief at ${occurrence.sourceLineIndex}`);
    }
    if (occurrence.recommendationLifecycle.status !== 'legacy-recommendation-unavailable') {
      return migrationFailure(MIGRATION_ERRORS.IMPLICIT_NARRATIVE, `reconstructed recommendation at ${occurrence.sourceLineIndex}`);
    }
    if (occurrence.finalBrief.status !== 'legacy-final-unavailable' && occurrence.finalBrief.status !== 'git-proven') {
      return migrationFailure(MIGRATION_ERRORS.IMPLICIT_NARRATIVE, `invalid final status at ${occurrence.sourceLineIndex}`);
    }
    if (occurrence.finalBrief.status === 'git-proven' && !occurrence.finalBrief.finalRef) {
      return migrationFailure(MIGRATION_ERRORS.IMPLICIT_NARRATIVE, `git-proven final without ref at ${occurrence.sourceLineIndex}`);
    }
  }
  // (8) Generated partition/index hashes and counts agree with a fresh re-derivation.
  const rebuilt = buildMigrationIndexes(mapping.partitions, mapping.contentObjects);
  if (JSON.stringify(rebuilt) !== JSON.stringify(mapping.indexes)) {
    return migrationFailure(MIGRATION_ERRORS.RE_DERIVATION, 'index re-derivation mismatch');
  }
  let partitionRowTotal = 0;
  for (const partitionPath of Object.keys(mapping.partitions)) {
    partitionRowTotal += mapping.partitions[partitionPath].length;
  }
  if (partitionRowTotal !== derivedRowCount) {
    return migrationFailure(MIGRATION_ERRORS.RE_DERIVATION, `partition rows=${partitionRowTotal} rows=${derivedRowCount}`);
  }
  // (9) Legacy bytes unchanged (when the raw bytes are provided for a re-proof).
  let bytesUnchanged = null;
  if (options && Buffer.isBuffer(options.bytes)) {
    const recomputed = `sha256:${sha256Hex(options.bytes)}`;
    if (recomputed !== inventory.fileSha256 || options.bytes.length !== inventory.byteLength) {
      return migrationFailure(MIGRATION_ERRORS.BYTES_CHANGED, `recomputed=${recomputed}`);
    }
    bytesUnchanged = true;
  }
  return {
    ok: true,
    parity: {
      contractVersion: 'legacy-migration-parity/v1',
      derivedRowCount,
      occurrenceCount: occurrences.length,
      distinctContentObjects: Object.keys(mapping.contentObjects).length,
      duplicateOccurrences: derivedRowCount - Object.keys(mapping.contentObjects).length,
      minTime,
      maxTime,
      windowCounts: inventory.windowCounts,
      explicitUnavailable: mapping.unavailable,
      byteLength: inventory.byteLength,
      fileSha256: inventory.fileSha256,
      bytesUnchanged
    }
  };
}

/** CLI entrypoint. Default action is the read-only `--check`. */
async function main(argv) {
  const args = argv.slice(2);
  const unknown = args.filter((a) => a !== '--check' && !a.startsWith('--file='));
  if (unknown.length > 0) {
    process.stderr.write(`migrate-brief-history: unknown argument(s): ${unknown.join(' ')}\n`);
    process.stderr.write('usage: node scripts/migrate-brief-history.mjs [--check] [--file=<path>]\n');
    process.exit(2);
    return;
  }
  const fileArg = args.find((a) => a.startsWith('--file='));
  const here = path.dirname(fileURLToPath(import.meta.url));
  const filePath = fileArg ? fileArg.slice('--file='.length) : path.join(here, '..', 'brief-history.jsonl');

  const before = readFileSync(filePath);
  const beforeHash = `sha256:${sha256Hex(before)}`;

  const inv = inventoryLegacyHistory(before);
  if (!inv.ok) {
    process.stdout.write(JSON.stringify({ ok: false, phase: 'inventory', error: inv.error }, null, 2) + '\n');
    process.exit(1);
    return;
  }
  const map = mapLegacyRows(inv.inventory);
  if (!map.ok) {
    process.stdout.write(JSON.stringify({ ok: false, phase: 'map', error: map.error }, null, 2) + '\n');
    process.exit(1);
    return;
  }
  const parity = validateMigrationParity(inv.inventory, map.mapping, { bytes: before });

  // Re-read AFTER all processing to prove the source is untouched (no-write guarantee).
  const after = readFileSync(filePath);
  const afterHash = `sha256:${sha256Hex(after)}`;
  const bytesUnchanged = before.equals(after) && beforeHash === afterHash;

  const summary = {
    ok: Boolean(parity.ok) && bytesUnchanged,
    action: 'check',
    file: path.relative(path.join(here, '..'), filePath),
    derivedRowCount: inv.inventory.rowCount, // DERIVED — printed so operators can see the live count.
    byteLength: inv.inventory.byteLength,
    fileSha256Before: beforeHash,
    fileSha256After: afterHash,
    bytesUnchanged,
    minTime: inv.inventory.minTime,
    maxTime: inv.inventory.maxTime,
    windowCounts: inv.inventory.windowCounts,
    parity: parity.ok ? parity.parity : null,
    error: parity.ok ? null : parity.error
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  process.exit(summary.ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv);
}
