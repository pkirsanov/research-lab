/*
 * tests/distributed-briefs.history.functional.mjs — Feature 002 Scope 07 (SCN-002-008).
 *
 * Every append-only / index corruption must fail closed with B002-HISTORY and no pointer candidate:
 * duplicate recommendation event, changed JSONL prefix, sealed-month edit, malformed row, and index
 * disagreement. Corruptions keep declared hashes consistent so the SPECIFIC integrity check fires.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { buildPublishSet, validatePublishSet } from '../scripts/brief-publication.mjs';
import { buildRun, priorFromStaging } from './fixtures/feature-002/history/history-fixture-builder.mjs';

function sha(bytes) { return `sha256:${createHash('sha256').update(bytes).digest('hex')}`; }
function setFile(staging, path, bytes) {
  staging.files[path] = { bytes, sha256: sha(bytes) };
  if (staging.historyPartitions[path]) staging.historyPartitions[path].mergedBytes = bytes;
}
function rowsOf(staging, path) {
  return staging.files[path].bytes.toString('utf8').split('\n').filter((l) => l.length > 0);
}

test('Duplicate event changed prefix sealed edit malformed row and index mismatch fail closed', () => {
  const runsPath = 'briefs/history/runs/2026-07.jsonl';
  const recPath = 'briefs/history/recommendations/2026-07.jsonl';

  // Baseline: a clean publish set validates.
  assert.equal(validatePublishSet(buildPublishSet(buildRun({ seed: 'clean' })).staging, {}).ok, true);

  // 1. Duplicate recommendation event ID.
  const dup = buildPublishSet(buildRun({ seed: 'dup' })).staging;
  const dupRows = rowsOf(dup, recPath);
  setFile(dup, recPath, Buffer.from(dupRows.concat([dupRows[0]]).join('\n') + '\n', 'utf8'));
  const dupResult = validatePublishSet(dup, {});
  assert.equal(dupResult.ok, false);
  assert.equal(dupResult.error.code, 'B002-HISTORY');
  assert.equal(dupResult.error.reason, 'duplicate-event');
  assert.equal(dupResult.staging, undefined, 'no pointer candidate on refusal');

  // 2. Changed JSONL prefix (append-only violation) on a chained run.
  const first = buildPublishSet(buildRun({ seed: 'p1' })).staging;
  const prior = priorFromStaging(first);
  const second = buildPublishSet(buildRun({ seed: 'p2', prior })).staging;
  setFile(second, runsPath, Buffer.concat([Buffer.from('X', 'utf8'), second.files[runsPath].bytes]));
  const prefixResult = validatePublishSet(second, { priorStreams: prior.streams });
  assert.equal(prefixResult.ok, false);
  assert.equal(prefixResult.error.code, 'B002-HISTORY');
  assert.equal(prefixResult.error.reason, 'prefix-mutation');

  // 3. Sealed-month edit: appending to a sealed month is rejected even though the prefix is intact.
  const sealedBase = buildPublishSet(buildRun({ seed: 's1' })).staging;
  const sealedPrior = priorFromStaging(sealedBase);
  const sealedNext = buildPublishSet(buildRun({ seed: 's2', prior: sealedPrior })).staging;
  const sealedResult = validatePublishSet(sealedNext, { priorStreams: sealedPrior.streams, sealedMonths: ['2026-07'] });
  assert.equal(sealedResult.ok, false);
  assert.equal(sealedResult.error.code, 'B002-HISTORY');
  assert.equal(sealedResult.error.reason, 'sealed-partition-edit');

  // 4. Malformed JSONL row.
  const malformed = buildPublishSet(buildRun({ seed: 'mal' })).staging;
  setFile(malformed, runsPath, Buffer.from('{not valid json\n', 'utf8'));
  const malformedResult = validatePublishSet(malformed, {});
  assert.equal(malformedResult.ok, false);
  assert.equal(malformedResult.error.code, 'B002-HISTORY');
  assert.equal(malformedResult.error.reason, 'malformed-row');

  // 5. Index disagreement: a tampered index row count no longer matches the authoritative rows.
  const idx = buildPublishSet(buildRun({ seed: 'idx' })).staging;
  idx.indexes.partitions[runsPath].rowCount = 999;
  const idxResult = validatePublishSet(idx, {});
  assert.equal(idxResult.ok, false);
  assert.equal(idxResult.error.code, 'B002-HISTORY');
  assert.equal(idxResult.error.reason, 'index-mismatch');
});
