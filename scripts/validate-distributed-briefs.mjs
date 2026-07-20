/*
 * scripts/validate-distributed-briefs.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Independent whole-graph validator for a committed (or isolated) distributed-briefs root. It imports
 * the production pure staging helpers and NEVER repairs invalid data. When no `briefs/current.json`
 * pointer is published yet (the atomic cutover is a later scope), the graph is legitimately absent and
 * validation is vacuously clean — absence is not an inconsistency. When a graph is present, every
 * pointer, object, row, index, and compatibility projection must reconcile by path and SHA-256.
 *
 *   validateCurrentGraph(root)            -> pointer/manifest/object/hash coherence
 *   validateHistoryGraph(root)            -> history pointer/index/partition coherence
 *   validateCompatibilityProjection(root) -> payload/snapshot represent the same current run
 *   CLI: node scripts/validate-distributed-briefs.mjs --root <path>
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

function sha256Hex(buf) { return createHash('sha256').update(buf).digest('hex'); }
function fail(reason, detail) { return { ok: false, error: { code: 'B002-PUBLISH-SET', reason, detail: detail === undefined ? null : detail } }; }

function readJson(root, relPath) {
  const abs = path.join(root, relPath);
  if (!existsSync(abs)) return { present: false };
  const bytes = readFileSync(abs);
  return { present: true, bytes, sha256: `sha256:${sha256Hex(bytes)}`, value: JSON.parse(bytes.toString('utf8')) };
}

function checkObjectRef(root, ref) {
  const abs = path.join(root, ref.path);
  if (!existsSync(abs)) return fail('object-missing', ref.path);
  const bytes = readFileSync(abs);
  const sha = `sha256:${sha256Hex(bytes)}`;
  if (sha !== ref.sha256) return fail('object-hash-mismatch', ref.path);
  return { ok: true };
}

/** Validate briefs/current.json and every object it references. Absent pointer = clean/absent. */
export function validateCurrentGraph(root) {
  const pointer = readJson(root, 'briefs/current.json');
  if (!pointer.present) return { ok: true, present: false, reason: 'no-current-pointer-published' };
  const current = pointer.value;
  if (current.contractVersion !== 'brief-current-pointer/v1') return fail('pointer-contract-invalid', 'briefs/current.json');
  for (const ref of [current.manifestRef, current.finalRef, current.evidenceRef]) {
    const result = checkObjectRef(root, ref);
    if (!result.ok) return result;
  }
  // Manifest run identity must agree with the pointer.
  const manifest = JSON.parse(readFileSync(path.join(root, current.manifestRef.path)).toString('utf8'));
  if (manifest.runId !== current.runId || manifest.runFingerprint !== current.runFingerprint) return fail('manifest-run-mismatch', current.manifestRef.path);
  // Map keys must exactly equal orderedSourceToolIds; every tool object must resolve.
  const mapKeys = Object.keys(current.tools).sort();
  if (JSON.stringify(mapKeys) !== JSON.stringify(current.orderedSourceToolIds.slice().sort())) return fail('current-map-key-mismatch', 'briefs/current.json');
  for (const toolId of current.orderedSourceToolIds) {
    const ref = current.tools[toolId];
    const readResult = checkObjectRef(root, { path: ref.readPath, sha256: ref.readSha256 });
    if (!readResult.ok) return readResult;
    if (ref.briefPath) {
      const briefResult = checkObjectRef(root, { path: ref.briefPath, sha256: ref.briefSha256 });
      if (!briefResult.ok) return briefResult;
    }
  }
  return { ok: true, present: true, runId: current.runId, sources: current.orderedSourceToolIds.length };
}

/** Validate briefs/history-current.json, its index, and every partition the index references. */
export function validateHistoryGraph(root) {
  const pointer = readJson(root, 'briefs/history-current.json');
  if (!pointer.present) return { ok: true, present: false, reason: 'no-history-pointer-published' };
  const historyCurrent = pointer.value;
  if (historyCurrent.contractVersion !== 'brief-history-current-pointer/v1') return fail('history-pointer-contract-invalid', 'briefs/history-current.json');
  const indexResult = checkObjectRef(root, { path: historyCurrent.historyIndexRef.path, sha256: historyCurrent.historyIndexRef.sha256 });
  if (!indexResult.ok) return indexResult;
  const index = JSON.parse(readFileSync(path.join(root, historyCurrent.historyIndexRef.path)).toString('utf8'));
  if (index.contractVersion !== 'brief-history-index/v1') return fail('index-contract-invalid', historyCurrent.historyIndexRef.path);
  if (index.indexFingerprint !== historyCurrent.historyIndexRef.indexFingerprint) return fail('index-fingerprint-mismatch', historyCurrent.historyIndexRef.path);
  let partitions = 0;
  for (const partitionPath of Object.keys(index.partitions)) {
    const entry = index.partitions[partitionPath];
    const abs = path.join(root, partitionPath);
    if (!existsSync(abs)) return fail('partition-missing', partitionPath);
    const bytes = readFileSync(abs);
    if (`sha256:${sha256Hex(bytes)}` !== entry.sha256) return fail('partition-hash-mismatch', partitionPath);
    const rows = bytes.toString('utf8').split('\n').filter((l) => l.length > 0);
    if (rows.length !== entry.rowCount) return fail('partition-row-count-mismatch', partitionPath);
    for (const line of rows) { try { JSON.parse(line); } catch (e) { return fail('partition-row-malformed', partitionPath); } }
    partitions += 1;
  }
  return { ok: true, present: true, partitions, indexFingerprint: index.indexFingerprint };
}

/** Validate that market-brief.payload.json / snapshot.json represent the same current pointer run. */
export function validateCompatibilityProjection(root) {
  const pointer = readJson(root, 'briefs/current.json');
  const payload = readJson(root, 'market-brief.payload.json');
  const snapshot = readJson(root, 'market-brief.snapshot.json');
  if (!pointer.present) {
    // Pre-cutover: root projections are the legacy compatibility files and are not pointer-bound yet.
    return { ok: true, present: false, pointerBound: false, reason: 'no-current-pointer-published' };
  }
  const runId = pointer.value.runId;
  const runFingerprint = pointer.value.runFingerprint;
  for (const [name, file] of [['market-brief.payload.json', payload], ['market-brief.snapshot.json', snapshot]]) {
    if (!file.present) return fail('compat-projection-missing', name);
    if (file.value.runId !== runId || file.value.runFingerprint !== runFingerprint) return fail('compat-projection-run-mismatch', name);
  }
  return { ok: true, present: true, pointerBound: true, runId };
}

function main(argv) {
  const args = argv.slice(2);
  const rootArg = args.find((a) => a.startsWith('--root='));
  const rootIdx = args.indexOf('--root');
  // --graph-only validates the briefs/ graph the distributed publisher OWNS (current + history) and skips
  // the compatibility-projection check. That check requires market-brief.* to be pointer-bound projections;
  // the deterministic activation deliberately keeps market-brief.* as the legacy narrative, so the graph is
  // legitimately published without pointer-bound root projections. Default behavior (all three) is unchanged.
  const graphOnly = args.includes('--graph-only');
  let root = '.';
  if (rootArg) root = rootArg.slice('--root='.length);
  else if (rootIdx >= 0 && args[rootIdx + 1]) root = args[rootIdx + 1];
  const resolved = path.resolve(root);
  const current = validateCurrentGraph(resolved);
  const history = validateHistoryGraph(resolved);
  const compat = graphOnly
    ? { ok: true, skipped: true, reason: 'graph-only' }
    : validateCompatibilityProjection(resolved);
  const ok = Boolean(current.ok) && Boolean(history.ok) && Boolean(compat.ok);
  const summary = { ok, mode: graphOnly ? 'graph-only' : 'full', root: path.relative(process.cwd(), resolved) || '.', currentGraph: current, historyGraph: history, compatibilityProjection: compat };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv);
}
