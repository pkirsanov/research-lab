/*
 * tests/distributed-briefs.history.load.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Load: a full 31-day, four-window month of runs (31 x 4 = 124 authoritative references) accumulates
 * into the monthly partitions. The measured production projection must stay within every declared
 * artifact budget (64 KiB/row, 4 MiB/partition, 1 MiB/index) and index regeneration must remain
 * idempotent. Run with `node tests/distributed-briefs.history.load.mjs` (NOT the node:test runner).
 */
import assert from 'node:assert/strict';

import { buildPublishSet, validatePublishSet, regenerateIndexes } from '../scripts/brief-publication.mjs';
import { buildRun, priorFromStaging } from './fixtures/feature-002/history/history-fixture-builder.mjs';

const WINDOWS = ['pre-market', 'morning', 'pre-close', 'after-hours'];
const MiB = 1024 * 1024;
const KiB = 1024;

let passes = 0;
let failures = 0;
function check(cond, msg) {
  if (cond) { passes += 1; console.log('  \u2713 ' + msg); }
  else { failures += 1; console.log('  \u2717 FAIL: ' + msg); }
}

console.log('Load: 31-day four-window history stays bounded to 124 authoritative references');

let prior = null;
let last = null;
let runCount = 0;
for (let day = 1; day <= 31; day += 1) {
  const dd = String(day).padStart(2, '0');
  for (const window of WINDOWS) {
    const seed = `d${dd}w${window}`;
    const built = buildPublishSet(buildRun({ seed, runId: `run-${seed}`, etRunDate: `2026-07-${dd}`, window, prior }));
    if (!built.ok) { check(false, `run ${seed} built: ${JSON.stringify(built.error)}`); break; }
    last = built.staging;
    prior = priorFromStaging(last);
    runCount += 1;
  }
}

check(runCount === 124, `drove ${runCount} runs (31 days x 4 windows == 124)`);

const runsPath = 'briefs/history/runs/2026-07.jsonl';
const runsRows = last.mergedPartitions[runsPath].length;
check(runsRows === 124, `runs partition holds exactly 124 authoritative references (got ${runsRows})`);

// Every partition month resolves to the single canonical month (no split/overflow).
const monthlyPaths = Object.keys(last.mergedPartitions);
check(monthlyPaths.every((p) => /2026-07\.jsonl$/.test(p)), 'every partition stays in the single canonical month 2026-07');

// Budget: no single JSONL row exceeds 64 KiB.
let maxRowBytes = 0;
for (const partitionPath of monthlyPaths) {
  for (const row of last.mergedPartitions[partitionPath]) {
    const b = Buffer.byteLength(JSON.stringify(row), 'utf8');
    if (b > maxRowBytes) maxRowBytes = b;
  }
}
check(maxRowBytes <= 64 * KiB, `largest JSONL row ${maxRowBytes}B within the 64 KiB row budget`);

// Budget: no monthly partition exceeds 4 MiB.
let maxPartitionBytes = 0;
for (const partitionPath of monthlyPaths) {
  const b = last.files[partitionPath].bytes.length;
  if (b > maxPartitionBytes) maxPartitionBytes = b;
}
check(maxPartitionBytes <= 4 * MiB, `largest monthly partition ${maxPartitionBytes}B within the 4 MiB partition budget`);

// Budget: the compact index stays under 1 MiB.
const indexPath = Object.keys(last.files).find((p) => p.startsWith('briefs/indexes/'));
const indexBytes = last.files[indexPath].bytes.length;
check(indexBytes <= MiB, `history index ${indexBytes}B within the 1 MiB index budget`);

// Idempotency under load: regenerating the index from authoritative rows reproduces the fingerprint.
const rebuilt = regenerateIndexes(last.mergedPartitions);
check(rebuilt.indexFingerprint === last.indexes.indexFingerprint, 'index regeneration is idempotent under load');

// The final run still validates append-only against its immutable prefix.
const finalValidation = validatePublishSet(last, {});
check(finalValidation.ok === true, `final run validates append-only (${finalValidation.ok ? 'ok' : JSON.stringify(finalValidation.error)})`);

console.log('\n' + '='.repeat(48));
console.log('history load: ' + passes + ' passed, ' + failures + ' failed');
console.log('='.repeat(48));
process.exit(failures ? 1 : 0);
