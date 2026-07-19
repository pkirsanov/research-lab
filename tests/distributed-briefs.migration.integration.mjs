/*
 * tests/distributed-briefs.migration.integration.mjs — Feature 002 Scope 07 (SCN-002-009).
 *
 * The ACTUAL brief-history.jsonl is production input, not a fixture. This test reads it read-only,
 * derives the row count from the live file (never a fixed literal), maps every row, proves strict
 * one-to-one parity with exact hashes/times/windows and explicit historical gaps, and re-reads the
 * file to prove the bytes are byte-identical before and after.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { inventoryLegacyHistory, mapLegacyRows, validateMigrationParity } from '../scripts/migrate-brief-history.mjs';

const LEGACY_URL = new URL('../brief-history.jsonl', import.meta.url);
function sha(bytes) { return `sha256:${createHash('sha256').update(bytes).digest('hex')}`; }

test('actual legacy corpus maps all actual rows (derived count) with exact hashes times windows and explicit gaps', () => {
  const before = readFileSync(LEGACY_URL);
  const beforeHash = sha(before);

  // Independent, dynamic row count derived directly from the raw bytes — never a hardcoded 26 or 55.
  const independentRowCount = before.toString('utf8').split('\n').filter((l) => l.length > 0).length;

  const inv = inventoryLegacyHistory(before);
  assert.equal(inv.ok, true, JSON.stringify(inv.error));
  // The inventory count is DERIVED from the live file and equals the independent line count.
  assert.equal(inv.inventory.rowCount, independentRowCount);
  assert.equal(inv.inventory.rows.length, independentRowCount);
  assert.equal(inv.inventory.byteLength, before.length);
  assert.equal(inv.inventory.fileSha256, beforeHash);

  const map = mapLegacyRows(inv.inventory);
  assert.equal(map.ok, true, JSON.stringify(map.error));
  assert.equal(map.mapping.occurrences.length, independentRowCount, 'one occurrence per actual row');

  // Every occurrence carries a deterministic legacy key, its exact source-row fingerprint, and
  // EXPLICIT historical absences — never a reconstructed narrative.
  for (const occurrence of map.mapping.occurrences) {
    assert.match(occurrence.legacyRunKey, /^legacy\/.+\/.+\/[0-9a-f]{12}$/);
    assert.match(occurrence.sourceRowFingerprint, /^sha256:[0-9a-f]{64}$/);
    assert.equal(occurrence.toolBrief.status, 'legacy-tool-brief-unavailable');
    assert.equal(occurrence.recommendationLifecycle.status, 'legacy-recommendation-unavailable');
    assert.equal(occurrence.finalBrief.status, 'legacy-final-unavailable');
  }
  assert.equal(map.mapping.unavailable.toolBriefs, independentRowCount);
  assert.equal(map.mapping.unavailable.recommendations, independentRowCount);
  assert.equal(map.mapping.unavailable.finals, independentRowCount);

  const parity = validateMigrationParity(inv.inventory, map.mapping, { bytes: before });
  assert.equal(parity.ok, true, JSON.stringify(parity.error));
  assert.equal(parity.parity.derivedRowCount, independentRowCount);
  assert.equal(parity.parity.occurrenceCount, independentRowCount);
  // Duplicate-content occurrences are all preserved: distinct objects + duplicates == the derived count.
  assert.equal(parity.parity.distinctContentObjects + parity.parity.duplicateOccurrences, independentRowCount);
  assert.equal(parity.parity.minTime, inv.inventory.minTime);
  assert.equal(parity.parity.maxTime, inv.inventory.maxTime);
  assert.equal(parity.parity.bytesUnchanged, true);

  // Window coverage is preserved exactly (sum of window counts == derived row count).
  const windowSum = Object.values(inv.inventory.windowCounts).reduce((a, b) => a + b, 0);
  assert.equal(windowSum, independentRowCount);

  // Re-read AFTER all processing: the legacy file is byte-identical and untouched.
  const after = readFileSync(LEGACY_URL);
  assert.ok(before.equals(after), 'legacy corpus bytes unchanged');
  assert.equal(sha(after), beforeHash);
});
