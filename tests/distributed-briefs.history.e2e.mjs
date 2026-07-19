/*
 * tests/distributed-briefs.history.e2e.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Persistent-scenario regression over real artifacts in an isolated filesystem: a single-tool agent
 * resolves current + focused history through the pointer, one object, and one partition WITHOUT
 * reading any unrelated narrative; and duplicate projection, index rebuild, and pointer-swap rollback
 * preserve append-only authority.
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet, validatePublishSet, regenerateIndexes, rollbackPublication, pointerBytes, selectHistory } from '../scripts/brief-publication.mjs';
import { buildRun, priorFromStaging, isolatedRoot, writeStagingToRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';

test('Regression: SCN-002-007 one tool current and monthly history resolve without unrelated narrative reads', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const first = buildPublishSet(buildRun({ seed: 'e1', runId: 'run-e1' })).staging;
    writeStagingToRoot(dir, first);
    const prior = priorFromStaging(first);
    const second = buildPublishSet(buildRun({ seed: 'e2', runId: 'run-e2', prior })).staging;
    writeStagingToRoot(dir, second);

    // A single-tool agent reads ONLY the files it needs; record every path it touches.
    const readSet = [];
    const read = (rel) => { readSet.push(rel); return readFileSync(path.join(dir, rel)); };

    const current = JSON.parse(read('briefs/current.json').toString('utf8'));
    const toolId = current.orderedSourceToolIds[0];
    const toolRef = current.tools[toolId];
    read(toolRef.readPath); // one complete read object answers current state

    const historyCurrent = JSON.parse(read('briefs/history-current.json').toString('utf8'));
    const index = JSON.parse(read(historyCurrent.historyIndexRef.path).toString('utf8'));
    const selection = selectHistory(index, { toolId, month: '2026-07' });
    assert.equal(selection.ok, true);
    assert.equal(selection.partitions.length, 1, 'exactly one monthly partition answers recent history');
    read(selection.partitions[0]);

    // Nothing unrelated is required: no other tool object, no final narrative, no evidence bundle,
    // no unrelated partition, no other month.
    const otherToolIds = current.orderedSourceToolIds.slice(1);
    for (const rel of readSet) {
      assert.ok(!rel.includes('/final-briefs/'), `must not read final narrative: ${rel}`);
      assert.ok(!rel.includes('/evidence/'), `must not read evidence bundle: ${rel}`);
      for (const other of otherToolIds) assert.ok(!rel.includes(`/${other}/`), `must not read unrelated tool ${other}: ${rel}`);
    }
    // The tool partition read is the selected tool's own month only.
    assert.ok(readSet.some((rel) => rel === `briefs/history/tools/${toolId}/2026-07.jsonl`));
    assert.ok(!readSet.some((rel) => /history\/(runs|final|evidence|recommendations)\//.test(rel)), 'no global-history stream scanned');
  } finally {
    cleanup();
  }
});

test('Regression: SCN-002-008 duplicate projection index rebuild and rollback preserve append-only authority', () => {
  const { dir, cleanup } = isolatedRoot();
  try {
    const runsPath = 'briefs/history/runs/2026-07.jsonl';
    const first = buildPublishSet(buildRun({ seed: 'r1', runId: 'run-r1' })).staging;
    writeStagingToRoot(dir, first);
    const prior = priorFromStaging(first);
    const second = buildPublishSet(buildRun({ seed: 'r2', runId: 'run-r2', prior })).staging;
    assert.equal(validatePublishSet(second, { priorStreams: prior.streams }).ok, true);
    writeStagingToRoot(dir, second);

    // Duplicate projection: re-building run 2 from identical input yields byte-identical artifacts.
    const secondAgain = buildPublishSet(buildRun({ seed: 'r2', runId: 'run-r2', prior })).staging;
    for (const p of Object.keys(second.files)) {
      assert.equal(second.files[p].sha256, secondAgain.files[p].sha256, `duplicate projection is byte-identical for ${p}`);
    }

    // Index rebuild from the on-disk authoritative partition reproduces the declared fingerprint.
    const onDiskRuns = readFileSync(path.join(dir, runsPath)).toString('utf8').split('\n').filter((l) => l.length > 0).map((l) => JSON.parse(l));
    const rebuilt = regenerateIndexes({ [runsPath]: onDiskRuns });
    assert.equal(rebuilt.partitions[runsPath].rowCount, 2, 'append-only authority: run 1 + run 2 rows both present');
    assert.equal(rebuilt.partitions[runsPath].sha256, second.indexes.partitions[runsPath].sha256);

    // Pointer-swap rollback to run 1 preserves append-only authority: run 2 objects remain; history keeps both rows.
    const run2Manifest = path.join(dir, second.pointers.current.manifestRef.path);
    const rollback = rollbackPublication({ pointer: first.pointers.current });
    assert.equal(rollback.ok, true);
    writeFileSync(path.join(dir, 'briefs/current.json'), pointerBytes(rollback.rollback.currentPointer));
    assert.ok(existsSync(run2Manifest), 'rollback never deletes run 2 objects');
    const runsAfter = readFileSync(path.join(dir, runsPath)).toString('utf8').split('\n').filter((l) => l.length > 0);
    assert.equal(runsAfter.length, 2, 'history partition still holds both appended rows after rollback');
  } finally {
    cleanup();
  }
});
