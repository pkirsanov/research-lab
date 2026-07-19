/*
 * tests/distributed-briefs.history.unit.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Pure coverage for focused history selection (smallest partition set) and byte-deterministic,
 * idempotent history projection + index regeneration. No filesystem, no network.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPublishSet, regenerateIndexes, selectHistory } from '../scripts/brief-publication.mjs';
import { buildRun, h } from './fixtures/feature-002/history/history-fixture-builder.mjs';

function toolRow(toolId, runId) {
  return { contractVersion: 'brief-tool-history-row/v1', runId, toolId, outcome: 'newly-authored', readRef: h(`read-${toolId}-${runId}`) };
}
function recRow(runId, recommendationKey) {
  return { contractVersion: 'brief-recommendation-history-row/v1', runId, eventId: h(`ev-${runId}`), eventType: 'proposed', recommendationKey };
}

test('SCN-002-007: history selection returns the smallest tool month and recommendation partition set', () => {
  const recommendationKey = h('rk-july');
  const partitions = {
    'briefs/history/tools/sector-research-lab/2026-07.jsonl': [toolRow('sector-research-lab', 'run-jul')],
    'briefs/history/tools/sector-research-lab/2026-08.jsonl': [toolRow('sector-research-lab', 'run-aug')],
    'briefs/history/tools/etf-momentum-lab/2026-07.jsonl': [toolRow('etf-momentum-lab', 'run-jul')],
    'briefs/history/recommendations/2026-07.jsonl': [recRow('run-jul', recommendationKey)],
    'briefs/history/recommendations/2026-08.jsonl': [recRow('run-aug', h('rk-aug'))],
    'briefs/history/final/2026-07.jsonl': [{ contractVersion: 'brief-final-history-row/v1', runId: 'run-jul', finalRef: h('final-jul') }]
  };
  const index = regenerateIndexes(partitions);

  // A single tool + month resolves EXACTLY one partition — not the other month, other tool, or final.
  const toolSelection = selectHistory(index, { toolId: 'sector-research-lab', month: '2026-07' });
  assert.equal(toolSelection.ok, true);
  assert.deepEqual(toolSelection.partitions, ['briefs/history/tools/sector-research-lab/2026-07.jsonl']);
  assert.equal(toolSelection.totalPartitions, 6);
  assert.ok(!toolSelection.partitions.some((p) => p.includes('2026-08') || p.includes('etf-momentum-lab') || p.includes('/final/')));

  // A recommendation key + month resolves EXACTLY the one recommendation partition.
  const recSelection = selectHistory(index, { recommendationKey, month: '2026-07' });
  assert.equal(recSelection.ok, true);
  assert.deepEqual(recSelection.partitions, ['briefs/history/recommendations/2026-07.jsonl']);
  assert.ok(!recSelection.partitions.some((p) => p.includes('/tools/') || p.includes('2026-08')));

  // An absent selector is a closed refusal, not a silent global-history scan.
  assert.equal(selectHistory(index, { toolId: 'no-such-tool', month: '2026-07' }).ok, false);
});

test('SCN-002-008: history projection and index regeneration are byte deterministic and idempotent', () => {
  const runOne = buildPublishSet(buildRun({ seed: 'det' }));
  const runTwo = buildPublishSet(buildRun({ seed: 'det' }));
  assert.equal(runOne.ok, true);
  assert.equal(runTwo.ok, true);

  // Identical run input yields byte-identical content objects, index fingerprint, and pointers.
  for (const path of Object.keys(runOne.staging.files)) {
    assert.equal(runOne.staging.files[path].sha256, runTwo.staging.files[path].sha256, `deterministic bytes for ${path}`);
  }
  assert.equal(runOne.staging.indexes.indexFingerprint, runTwo.staging.indexes.indexFingerprint);
  assert.equal(runOne.staging.pointers.current.runId, runTwo.staging.pointers.current.runId);

  // Rebuilding the index from authoritative merged rows reproduces the same canonical fingerprint.
  const rebuilt = regenerateIndexes(runOne.staging.mergedPartitions);
  assert.equal(rebuilt.indexFingerprint, runOne.staging.indexes.indexFingerprint);
  assert.deepEqual(rebuilt.partitions, runOne.staging.indexes.partitions);

  // Re-projecting does not churn row counts: each authoritative partition still holds its exact rows.
  for (const partitionPath of Object.keys(runOne.staging.mergedPartitions)) {
    assert.equal(
      runOne.staging.mergedPartitions[partitionPath].length,
      runTwo.staging.mergedPartitions[partitionPath].length
    );
  }
});
