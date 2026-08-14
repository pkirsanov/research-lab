/*
 * tests/distributed-briefs.history.e2e.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Persistent-scenario regression over real artifacts in an isolated filesystem: a single-tool agent
 * resolves current + focused history through the pointer, one object, and one partition WITHOUT
 * reading any unrelated narrative; and duplicate projection, index rebuild, and pointer-swap rollback
 * preserve append-only authority.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildPublishSet, validatePublishSet, regenerateIndexes, rollbackPublication, pointerBytes, selectHistory } from '../scripts/brief-publication.mjs';
import { buildRun, priorFromStaging, isolatedRoot, writeStagingToRoot } from './fixtures/feature-002/history/history-fixture-builder.mjs';

const RLAGENDA = createRequire(import.meta.url)('../rlagenda.js');

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

test('SCN-019-016 real history resolves current and predecessor records without rewriting either', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'rlagenda-history-'));
  const writes = [];
  const write = (relativePath, bytes) => {
    const absolutePath = path.join(root, relativePath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, bytes);
    writes.push(relativePath);
  };
  const readBytes = (relativePath) => readFileSync(path.join(root, relativePath));
  const ZERO_HASH = 'sha256:' + '0'.repeat(64);
  const ONE_HASH = 'sha256:' + '1'.repeat(64);
  const TWO_HASH = 'sha256:' + '2'.repeat(64);
  const topicId = 'geopolitical-supply-shock';
  const predecessorPath = 'research/agenda/dossiers/geopolitical-supply-shock/historical-2026-08-10-v1.json';

  try {
    const predecessorBytes = readFileSync(path.join(process.cwd(), predecessorPath));
    const predecessor = JSON.parse(predecessorBytes.toString('utf8'));
    write(predecessorPath, predecessorBytes);
    const predecessorBytesBefore = readBytes(predecessorPath);

    const generationIdentity = RLAGENDA.deriveGenerationId({
      snapshotDigest: ZERO_HASH,
      registryDigest: ONE_HASH,
      briefWindow: { start: '2026-08-11T00:00:00.000Z', end: '2026-08-11T12:00:00.000Z' },
      generationCutoff: '2026-08-11T12:00:00.000Z'
    });
    const reviewIdentity = RLAGENDA.deriveReviewId({
      generationId: generationIdentity.id,
      topicId,
      definitionDigest: ZERO_HASH,
      calibrationDigest: ONE_HASH,
      evidenceBundleDigest: TWO_HASH
    });
    const dossierBody = {
      contractVersion: RLAGENDA.DOSSIER_VERSION,
      topicId,
      generationId: generationIdentity.id,
      reviewId: reviewIdentity.id,
      supersedesDossierId: predecessor.dossierId,
      substantiveState: { scenario: 'managed-coercion', probability: 0.48 }
    };
    const dossierIdentity = RLAGENDA.deriveDossierId(dossierBody);
    const generationPath = `research/agenda/generations/${generationIdentity.id}.json`;
    const reviewPath = `research/agenda/reviews/${topicId}/${generationIdentity.id}.json`;
    const dossierPath = `research/agenda/dossiers/${topicId}/${dossierIdentity.id}.json`;
    const generationRecord = {
      contractVersion: RLAGENDA.GENERATION_VERSION,
      generationId: generationIdentity.id,
      validationState: 'validated',
      historicalOnly: false,
      topicStates: [{ topicId, state: 'reviewed', reviewId: reviewIdentity.id }]
    };
    const reviewRecord = {
      contractVersion: RLAGENDA.REVIEW_VERSION,
      reviewId: reviewIdentity.id,
      generationId: generationIdentity.id,
      topicId,
      validationState: 'validated',
      historicalOnly: false,
      outcome: 'updated',
      predecessorDossierId: predecessor.dossierId,
      dossierId: dossierIdentity.id
    };
    const dossierRecord = {
      ...dossierBody,
      dossierId: dossierIdentity.id,
      validationState: 'validated',
      historicalOnly: false
    };
    const immutableRecords = [
      [generationPath, generationRecord],
      [reviewPath, reviewRecord],
      [dossierPath, dossierRecord]
    ];
    for (const [relativePath, record] of immutableRecords) {
      const existing = relativePath === dossierPath ? { [predecessorPath]: predecessor } : {};
      assert.equal(RLAGENDA.prepareImmutableCreate(relativePath, record, existing).ok, true);
      write(relativePath, JSON.stringify(record, null, 2) + '\n');
    }

    const recordsByPath = Object.fromEntries(immutableRecords);
    recordsByPath[predecessorPath] = predecessor;
    const generationRef = RLAGENDA.buildArtifactRef(generationPath, generationRecord).ref;
    const reviewRef = RLAGENDA.buildArtifactRef(reviewPath, reviewRecord).ref;
    const dossierRef = RLAGENDA.buildArtifactRef(dossierPath, dossierRecord).ref;
    const predecessorRef = RLAGENDA.buildArtifactRef(predecessorPath, predecessor).ref;
    const predecessorEvent = RLAGENDA.buildHistoryEvent({
      contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
      eventType: 'historical-seed',
      occurredAt: '2026-08-10T23:59:59.000Z',
      topicId,
      generationId: null,
      reviewId: null,
      dossierId: predecessor.dossierId,
      correctsEventId: null,
      supersedesEventId: null,
      artifactRef: predecessorRef
    });
    const currentEvent = RLAGENDA.buildHistoryEvent({
      contractVersion: RLAGENDA.HISTORY_EVENT_VERSION,
      eventType: 'review',
      occurredAt: '2026-08-11T12:30:00.000Z',
      topicId,
      generationId: generationIdentity.id,
      reviewId: reviewIdentity.id,
      dossierId: dossierIdentity.id,
      correctsEventId: null,
      supersedesEventId: predecessorEvent.event.eventId,
      artifactRef: dossierRef
    });
    const appendedHistory = RLAGENDA.appendHistoryEvents('', [predecessorEvent.event, currentEvent.event]);
    assert.equal(appendedHistory.ok, true);
    write('research/agenda/history.jsonl', appendedHistory.candidateText);

    const pointer = {
      contractVersion: RLAGENDA.CURRENT_VERSION,
      updatedAt: '2026-08-11T12:30:00.000Z',
      generationRef,
      topicRefs: [{ topicId, state: 'reviewed', reviewRef, dossierRef }]
    };
    assert.equal(RLAGENDA.validateCurrentPointer(pointer, recordsByPath).ok, true);
    write('research/agenda/current.json', JSON.stringify(pointer, null, 2) + '\n');
    assert.equal(writes.at(-1), 'research/agenda/current.json', 'the current pointer is the last publication write');

    const diskPointer = JSON.parse(readBytes('research/agenda/current.json').toString('utf8'));
    const diskRecords = {};
    diskRecords[diskPointer.generationRef.path] = JSON.parse(readBytes(diskPointer.generationRef.path).toString('utf8'));
    const diskTopicRef = diskPointer.topicRefs[0];
    diskRecords[diskTopicRef.reviewRef.path] = JSON.parse(readBytes(diskTopicRef.reviewRef.path).toString('utf8'));
    diskRecords[diskTopicRef.dossierRef.path] = JSON.parse(readBytes(diskTopicRef.dossierRef.path).toString('utf8'));
    const resolved = RLAGENDA.validateCurrentPointer(diskPointer, diskRecords);
    assert.equal(resolved.ok, true, 'the real pointer resolves through all immutable records');
    const diskDossier = diskRecords[diskTopicRef.dossierRef.path];
    assert.equal(diskDossier.supersedesDossierId, predecessor.dossierId);
    assert.equal(JSON.parse(readBytes(predecessorPath).toString('utf8')).dossierId, diskDossier.supersedesDossierId);

    const currentBytesBefore = readBytes(dossierPath);
    const overwrite = RLAGENDA.prepareImmutableCreate(dossierPath, { ...dossierRecord, attemptedMutation: true }, { [dossierPath]: dossierRecord });
    assert.equal(overwrite.ok, false);
    assert.equal(overwrite.code, 'RLAGENDA-IMMUTABLE-OVERWRITE');
    assert.deepEqual(readBytes(predecessorPath), predecessorBytesBefore, 'predecessor bytes remain unchanged');
    assert.deepEqual(readBytes(dossierPath), currentBytesBefore, 'current dossier bytes remain unchanged');
    assert.equal(readBytes('research/agenda/history.jsonl').toString('utf8').startsWith(RLAGENDA.canonicalizeAgenda(predecessorEvent.event) + '\n'), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
