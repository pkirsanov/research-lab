/*
 * tests/distributed-briefs.migration.e2e.mjs — Feature 002 Scope 07 (SCN-002-009).
 *
 * Persistent-scenario regression: the ACTUAL legacy corpus (row count derived from the live file)
 * migrates into externally inspectable partitions/index inside an isolated filesystem, every
 * occurrence/gap/ref is inspectable, no per-tool brief / recommendation / final narrative is invented,
 * and the legacy file stays byte-identical. The real brief-history.jsonl is only ever read-only.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { inventoryLegacyHistory, mapLegacyRows, validateMigrationParity } from '../scripts/migrate-brief-history.mjs';
import { isolatedRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';

const LEGACY_URL = new URL('../brief-history.jsonl', import.meta.url);
function sha(bytes) { return `sha256:${createHash('sha256').update(bytes).digest('hex')}`; }

test('Regression: SCN-002-009 all actual legacy rows (derived count) migrate with immutable bytes and no invented narratives', () => {
  const before = readFileSync(LEGACY_URL);
  const beforeHash = sha(before);
  const derivedRowCount = before.toString('utf8').split('\n').filter((l) => l.length > 0).length;

  const inv = inventoryLegacyHistory(before);
  assert.equal(inv.ok, true, JSON.stringify(inv.error));
  const map = mapLegacyRows(inv.inventory);
  assert.equal(map.ok, true, JSON.stringify(map.error));
  const parity = validateMigrationParity(inv.inventory, map.mapping, { bytes: before });
  assert.equal(parity.ok, true, JSON.stringify(parity.error));
  assert.equal(parity.parity.derivedRowCount, derivedRowCount);

  // Materialize the migrated partitions + index into an ISOLATED root (externally inspectable).
  const { dir, cleanup } = isolatedRoot();
  try {
    for (const partitionPath of Object.keys(map.mapping.partitions)) {
      const abs = path.join(dir, partitionPath);
      mkdirSync(path.dirname(abs), { recursive: true });
      const bytes = Buffer.from(map.mapping.partitions[partitionPath].map((row) => JSON.stringify(row)).join('\n') + '\n', 'utf8');
      writeFileSync(abs, bytes);
      // Declared migration index hash agrees with the materialized partition.
      assert.equal(sha(bytes), map.mapping.indexes.partitions[partitionPath].sha256);
    }
    mkdirSync(path.join(dir, 'briefs/history/migration'), { recursive: true });
    writeFileSync(path.join(dir, 'briefs/history/migration/index.json'), Buffer.from(JSON.stringify(map.mapping.indexes, null, 2), 'utf8'));

    // Read the inspectable partitions back and prove NO narrative was invented and every ref is present.
    let inspected = 0;
    for (const partitionPath of Object.keys(map.mapping.partitions)) {
      const rows = readFileSync(path.join(dir, partitionPath)).toString('utf8').split('\n').filter((l) => l.length > 0).map((l) => JSON.parse(l));
      for (const row of rows) {
        assert.match(row.legacyRunKey, /^legacy\/.+\/.+\/[0-9a-f]{12}$/);
        assert.match(row.sourceRowFingerprint, /^sha256:[0-9a-f]{64}$/);
        assert.equal(row.toolBrief, 'legacy-tool-brief-unavailable');
        assert.equal(row.recommendation, 'legacy-recommendation-unavailable');
        assert.equal(row.final, 'legacy-final-unavailable');
        // No invented narrative body fields ever appear.
        assert.equal(row.summary, undefined);
        assert.equal(row.recommendations, undefined);
        assert.equal(row.finalNarrative, undefined);
        inspected += 1;
      }
    }
    assert.equal(inspected, derivedRowCount, 'every actual row is externally inspectable exactly once');
    assert.ok(readdirSync(path.join(dir, 'briefs/history')).length > 0);
  } finally {
    cleanup();
  }

  // The real legacy file remains byte-identical and untouched.
  const after = readFileSync(LEGACY_URL);
  assert.ok(before.equals(after), 'legacy corpus bytes unchanged');
  assert.equal(sha(after), beforeHash);
});
