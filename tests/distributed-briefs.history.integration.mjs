/*
 * tests/distributed-briefs.history.integration.mjs — Feature 002 Scope 07 (SCN-002-008).
 *
 * Real isolated-filesystem publish/validate/rollback. Everything lives under an OS temp directory; the
 * repository's authoritative history is never written. Proves append-only prefix preservation on disk,
 * sealed-month immutability, whole-graph pointer coherence, and pointer-swap rollback that reuses the
 * prior immutable objects without deleting anything.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet, validatePublishSet, rollbackPublication, pointerBytes } from '../scripts/brief-publication.mjs';
import { validateCurrentGraph, validateHistoryGraph, validateCompatibilityProjection } from '../scripts/validate-distributed-briefs.mjs';
import { buildRun, priorFromStaging, isolatedRoot, writeStagingToRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';

test('real isolated filesystem publish set preserves prefixes sealed months and coherent pointers', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const runsPath = 'briefs/history/runs/2026-07.jsonl';

    // Run 1: build, validate, materialize into the isolated root, and validate the whole graph on disk.
    const first = buildPublishSet(buildRun({ seed: 'i1', runId: 'run-i1' })).staging;
    assert.equal(validatePublishSet(first, {}).ok, true);
    writeStagingToRoot(dir, first);
    assert.equal(validateCurrentGraph(dir).ok, true);
    assert.equal(validateCurrentGraph(dir).present, true);
    assert.equal(validateCurrentGraph(dir).runId, 'run-i1');
    assert.equal(validateHistoryGraph(dir).ok, true);
    const compatOne = validateCompatibilityProjection(dir);
    assert.equal(compatOne.ok, true);
    assert.equal(compatOne.pointerBound, true);

    const firstPartitionBytes = readFileSync(path.join(dir, runsPath));

    // Run 2: chained append. Prior bytes must remain an EXACT prefix of the on-disk partition.
    const prior = priorFromStaging(first);
    const second = buildPublishSet(buildRun({ seed: 'i2', runId: 'run-i2', prior })).staging;
    assert.equal(validatePublishSet(second, { priorStreams: prior.streams }).ok, true);
    writeStagingToRoot(dir, second);
    const secondPartitionBytes = readFileSync(path.join(dir, runsPath));
    assert.ok(secondPartitionBytes.subarray(0, firstPartitionBytes.length).equals(firstPartitionBytes), 'append-only prefix preserved on disk');
    assert.ok(secondPartitionBytes.length > firstPartitionBytes.length);
    assert.equal(validateCurrentGraph(dir).runId, 'run-i2');
    assert.equal(validateHistoryGraph(dir).ok, true);

    // Sealing 2026-07 makes any further append to that month a fail-closed publish set (never written).
    const sealedPrior = priorFromStaging(second);
    const third = buildPublishSet(buildRun({ seed: 'i3', runId: 'run-i3', prior: sealedPrior })).staging;
    const sealedResult = validatePublishSet(third, { priorStreams: sealedPrior.streams, sealedMonths: ['2026-07'] });
    assert.equal(sealedResult.ok, false);
    assert.equal(sealedResult.error.reason, 'sealed-partition-edit');
    // The refused set never reached disk: the on-disk partition is unchanged from run 2.
    assert.ok(readFileSync(path.join(dir, runsPath)).equals(secondPartitionBytes));

    // Pointer-swap rollback: restore briefs/current.json to run 1 without deleting run 2's objects.
    const run2ManifestPath = path.join(dir, second.pointers.current.manifestRef.path);
    assert.ok(existsSync(run2ManifestPath));
    const rollback = rollbackPublication({ pointer: first.pointers.current });
    assert.equal(rollback.ok, true);
    assert.equal(rollback.rollback.deletedObjects, 0);
    assert.equal(rollback.rollback.rewrittenPartitions, 0);
    writeFileSync(path.join(dir, 'briefs/current.json'), pointerBytes(rollback.rollback.currentPointer));
    writeFileSync(path.join(dir, 'market-brief.payload.json'), pointerBytes(rollback.rollback.projections['market-brief.payload.json']));
    writeFileSync(path.join(dir, 'market-brief.snapshot.json'), pointerBytes(rollback.rollback.projections['market-brief.snapshot.json']));

    // Current pointer now resolves to run 1 again; run 2's immutable objects still exist (nothing deleted).
    assert.equal(validateCurrentGraph(dir).runId, 'run-i1');
    assert.ok(existsSync(run2ManifestPath), 'rollback never deletes prior run objects');
    // History remains append-only and coherent (it is not rolled back).
    assert.equal(validateHistoryGraph(dir).ok, true);
    assert.equal(validateCompatibilityProjection(dir).runId, 'run-i1');
  } finally {
    cleanup();
  }
});
