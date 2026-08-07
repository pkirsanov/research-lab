import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const REPORT = 'specs/004-fx-regime-relative-value-lab/report.md';
const TEST = 'tests/feature-004-dirty-tree-collision.test.mjs';
const sha256 = (v) => createHash('sha256').update(v).digest('hex');

const report = readFileSync(REPORT, 'utf8');
const test = readFileSync(TEST, 'utf8');

const markers = [...report.matchAll(/<!-- ([a-z0-9-]+):start -->/g)].map((m) => m[1]);

function blockOf(rep, marker) {
  const startMarker = `<!-- ${marker}:start -->`;
  const endMarker = `<!-- ${marker}:end -->`;
  const re = new RegExp(`${startMarker}\\n` + '```json\\n([\\s\\S]*?)\\n```\\n' + endMarker);
  const m = rep.match(re);
  if (!m) return null;
  return { raw: m[0], body: m[1], index: m.index };
}

// 1. actual hash of every block, in file order
const actual = new Map();
console.log('=== ACTUAL BLOCK HASHES (file order) ===');
for (const marker of markers) {
  const b = blockOf(report, marker);
  if (!b) { console.log(`${marker}\tNO-MATCH`); continue; }
  actual.set(marker, sha256(b.raw));
  console.log(`${String(actual.size).padStart(2)}  ${marker}\t${sha256(b.raw)}\toffset=${b.index}\tbytes=${Buffer.byteLength(b.raw)}`);
}

// 2. test-file pins
console.log('\n=== TEST FILE PINS ===');
const pins = new Map();
for (const m of test.matchAll(/const ([A-Z0-9_]*BLOCK_SHA256) = '([a-f0-9]{64})';/g)) {
  pins.set(m[1], m[2]);
  console.log(`${m[1]}\t${m[2]}`);
}

// 3. pin -> marker association from IMMUTABLE_PREDECESSOR_BLOCKS + assertPinnedReportBlock sites
console.log('\n=== PIN vs ACTUAL (does the pin match real bytes?) ===');
const pinToMarker = {
  BASELINE_BLOCK_SHA256: 'feature004-dirty-baseline-v1',
  SUPERSESSION_BLOCK_SHA256: 'feature004-dirty-supersession-v1',
  DISPOSITION_BLOCK_SHA256: 'feature004-dirty-collision-disposition-v1',
  DELTA_BLOCK_SHA256: 'feature004-dirty-collision-delta-v1',
  SETTLED_BLOCK_SHA256: 'feature004-dirty-collision-settled-delta-v1',
  SCRIPT_TRANSITIONS_BLOCK_SHA256: 'feature004-dirty-collision-script-transitions-v1',
  SUPERSEDED_VALIDATOR_NOTE_BLOCK_SHA256: 'feature004-superseded-validator-note-v1',
  OWNER_SETTLED_SELFTEST_BLOCK_SHA256: 'feature004-dirty-collision-owner-settled-selftest-v1',
  SELFTEST_SUCCESSOR_V2_BLOCK_SHA256: 'feature004-dirty-collision-selftest-successor-v2',
  SELFTEST_SUCCESSOR_V3_BLOCK_SHA256: 'feature004-dirty-collision-selftest-successor-v3',
  DURABLE_EVIDENCE_BLOCK_SHA256: 'feature004-scope1-durable-evidence-v1',
  CURRENT_IDENTITY_V4_BLOCK_SHA256: 'feature004-dirty-collision-current-identity-v4',
  CURRENT_IDENTITY_V5_BLOCK_SHA256: 'feature004-dirty-collision-current-identity-v5',
  FOREIGN_ROADMAP_V6_BLOCK_SHA256: 'feature004-dirty-collision-foreign-roadmap-v6',
  FOREIGN_SET_V7_BLOCK_SHA256: 'feature004-dirty-collision-foreign-set-v7',
  POST_COMMIT_V9_BLOCK_SHA256: 'feature004-dirty-collision-post-commit-v9',
  POST_COMMIT_V10_BLOCK_SHA256: 'feature004-dirty-collision-post-commit-v10',
  POST_COMMIT_V11_BLOCK_SHA256: 'feature004-dirty-collision-post-commit-v11',
  POST_COMMIT_V12_BLOCK_SHA256: 'feature004-dirty-collision-post-commit-v12',
  POST_COMMIT_V13_BLOCK_SHA256: 'feature004-dirty-collision-post-commit-v13',
  POST_COMMIT_V14_BLOCK_SHA256: 'feature004-dirty-collision-scoped-evidence-v14',
  POST_COMMIT_V15_BLOCK_SHA256: 'feature004-dirty-collision-multi-item-evidence-v15'
};
for (const [pin, marker] of Object.entries(pinToMarker)) {
  const pv = pins.get(pin);
  const av = actual.get(marker);
  if (pv === undefined) { console.log(`${pin}\tPIN-ABSENT`); continue; }
  console.log(`${pv === av ? 'MATCH  ' : 'DIVERGE'}  ${pin}\tpin=${pv}\tactual=${av}\t${marker}`);
}

// 4. every recorded hash inside report.md that looks like a block link
console.log('\n=== RECORDED 64-HEX OCCURRENCES IN report.md, resolved against actual block hashes ===');
const actualByHash = new Map();
for (const [m, h] of actual) actualByHash.set(h, m);
const counts = new Map();
for (const m of report.matchAll(/[a-f0-9]{64}/g)) {
  counts.set(m[0], (counts.get(m[0]) || 0) + 1);
}
for (const [hash, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  const owner = actualByHash.get(hash);
  console.log(`${String(n).padStart(3)}x  ${hash}  ${owner ? 'CURRENT-BLOCK=' + owner : ''}`);
}
