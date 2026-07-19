/*
 * scripts/brief-publication.mjs — Feature 002 Scope 07 (SCN-002-007, SCN-002-008).
 *
 * Bounded static history: content-addressed objects, monthly append-only JSONL streams, compact
 * content-addressed indexes, immutable run manifests, and two mutable pointer selectors
 * (briefs/current.json, briefs/history-current.json). Pure staging functions produce an in-memory
 * publish set so Scope 07 integration/load tests can materialize it inside ISOLATED temporary
 * directories and never write the repository's authoritative history.
 *
 *   buildPublishSet(run)          -> staged content objects, monthly rows, indexes, manifest, pointers,
 *                                    and compatibility projections
 *   validatePublishSet(staging)   -> re-hash, JSONL prefix append-only, sealed-month immutability,
 *                                    duplicate-event, index agreement, undeclared-file, pointer coherence
 *   selectHistory(index, query)   -> smallest partition set for a focused history read
 *   rollbackPublication(prior)    -> pure pointer-swap + regenerated compatibility projections
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

function sha256Hex(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

/** Deterministic, sorted-key JSON for one JSONL row / index / pointer body. */
function stableStringify(value) {
  return JSON.stringify(sortValue(value));
}
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortValue(value[key]);
    return out;
  }
  return value;
}

function publishFailure(code, reason, detail) {
  return { ok: false, error: { code, reason, detail: detail === undefined ? null : detail } };
}
function historyFailure(reason, detail) { return publishFailure('B002-HISTORY', reason, detail); }
function publishSetFailure(reason, detail) { return publishFailure('B002-PUBLISH-SET', reason, detail); }

/** Canonical `America/New_York` `YYYY-MM` from an intended ET run date (`YYYY-MM-DD` or ISO). */
export function canonicalMonthFromEtRunDate(input) {
  if (typeof input !== 'string' || input.length < 7) {
    throw new Error('canonicalMonthFromEtRunDate requires an ET run date string');
  }
  // A bare YYYY-MM-DD is already an ET civil date; take its month directly.
  const bare = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
  if (bare) return `${bare[1]}-${bare[2]}`;
  const epoch = Date.parse(input);
  if (!Number.isFinite(epoch)) throw new Error(`invalid ET run date: ${input}`);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit'
  }).formatToParts(new Date(epoch));
  return `${parts.find((p) => p.type === 'year').value}-${parts.find((p) => p.type === 'month').value}`;
}

function contentObject(kind, body) {
  const canonical = stableStringify(body);
  const fingerprint = `sha256:${sha256Hex(Buffer.from(canonical, 'utf8'))}`;
  return { fingerprint, bytes: Buffer.from(canonical, 'utf8') };
}

function jsonlBytes(rows) {
  if (rows.length === 0) return Buffer.alloc(0);
  return Buffer.from(rows.map((row) => stableStringify(row)).join('\n') + '\n', 'utf8');
}

/** Rebuild the compact content-addressed indexes from authoritative partition rows only (no prose). */
export function regenerateIndexes(partitions) {
  const partitionMeta = {};
  for (const partitionPath of Object.keys(partitions).sort()) {
    const rows = partitions[partitionPath];
    const bytes = jsonlBytes(rows);
    const keys = new Set();
    const outcomeCounts = {};
    const eventTypeCounts = {};
    for (const row of rows) {
      if (row.toolId) keys.add(`tool:${row.toolId}`);
      if (row.recommendationKey) keys.add(`rec:${row.recommendationKey}`);
      if (row.runId) keys.add(`run:${row.runId}`);
      if (row.outcome) outcomeCounts[row.outcome] = (outcomeCounts[row.outcome] || 0) + 1;
      if (row.eventType) eventTypeCounts[row.eventType] = (eventTypeCounts[row.eventType] || 0) + 1;
    }
    partitionMeta[partitionPath] = {
      contractVersion: 'brief-history-index-entry/v1',
      path: partitionPath,
      rowCount: rows.length,
      byteLength: bytes.length,
      sha256: `sha256:${sha256Hex(bytes)}`,
      keys: Array.from(keys).sort(),
      outcomeCounts,
      eventTypeCounts
    };
  }
  const canonical = stableStringify({ contractVersion: 'brief-history-index/v1', partitions: partitionMeta });
  return {
    contractVersion: 'brief-history-index/v1',
    partitions: partitionMeta,
    indexFingerprint: `sha256:${sha256Hex(Buffer.from(canonical, 'utf8'))}`
  };
}

/**
 * buildPublishSet(run): materialize one staged publish set. Objects are content-addressed; monthly
 * partitions are the prior sealed bytes plus this run's appended rows; pointers and indexes are
 * derived. Nothing is written to disk here — the caller promotes staging into an isolated worktree.
 */
export function buildPublishSet(run) {
  if (!run || typeof run !== 'object') return publishSetFailure('run-required', 'buildPublishSet requires a run descriptor');
  const registry = run.registry;
  if (!registry || !Array.isArray(registry.orderedSourceToolIds) || !Array.isArray(registry.orderedParticipantIds)) {
    return publishSetFailure('registry-required', 'run.registry must carry ordered source/participant ID sets');
  }
  const month = canonicalMonthFromEtRunDate(run.etRunDate);
  const prior = run.prior && typeof run.prior === 'object' ? run.prior : { streams: {}, pointer: null, generation: 0 };
  const priorStreams = prior.streams && typeof prior.streams === 'object' ? prior.streams : {};
  const files = {};
  const placeFile = (path, bytes) => { files[path] = { bytes, sha256: `sha256:${sha256Hex(bytes)}` }; };

  // 1. Content-addressed objects: evidence bundle, per-source reads/briefs, final brief.
  const evidenceObj = contentObject('evidence', run.evidence.body);
  const evidencePath = `briefs/objects/evidence/bundles/${evidenceObj.fingerprint.slice(7)}.json`;
  placeFile(evidencePath, evidenceObj.bytes);

  const toolRefs = {};
  const currentMap = {};
  const toolRows = {};
  for (const tool of run.tools) {
    const readObj = contentObject('read', tool.read);
    const readPath = `briefs/objects/reads/${tool.toolId}/${readObj.fingerprint.slice(7)}.json`;
    placeFile(readPath, readObj.bytes);
    let briefPath = null;
    let briefSha = null;
    if (tool.brief) {
      const briefObj = contentObject('tool-brief', tool.brief);
      briefPath = `briefs/objects/tool-briefs/${tool.toolId}/${briefObj.fingerprint.slice(7)}.json`;
      briefSha = briefObj.fingerprint;
      placeFile(briefPath, briefObj.bytes);
    }
    toolRefs[tool.toolId] = { readPath, readSha256: readObj.fingerprint, briefPath, briefSha256: briefSha, outcome: tool.outcome };
    currentMap[tool.toolId] = { readPath, readSha256: readObj.fingerprint, briefPath, briefSha256: briefSha, outcome: tool.outcome };
    toolRows[`briefs/history/tools/${tool.toolId}/${month}.jsonl`] = [{
      contractVersion: 'brief-tool-history-row/v1', runId: run.runId, toolId: tool.toolId, outcome: tool.outcome,
      readRef: readObj.fingerprint, briefRef: briefSha, canonicalMonth: month
    }];
  }

  const finalObj = contentObject('final-brief', run.final.body);
  const finalPath = `briefs/objects/final-briefs/${finalObj.fingerprint.slice(7)}.json`;
  placeFile(finalPath, finalObj.bytes);

  // 2. Monthly append-only partitions (prior bytes are the immutable prefix; this run adds rows).
  const addedRows = {};
  for (const partitionPath of Object.keys(toolRows)) addedRows[partitionPath] = toolRows[partitionPath];
  addedRows[`briefs/history/final/${month}.jsonl`] = [{
    contractVersion: 'brief-final-history-row/v1', runId: run.runId, finalRef: finalObj.fingerprint,
    coverage: run.final.coverage || {}, canonicalMonth: month
  }];
  addedRows[`briefs/history/runs/${month}.jsonl`] = [{
    contractVersion: 'brief-run-history-row/v1', runId: run.runId, runFingerprint: run.runFingerprint,
    state: 'published', validation: 'passed', window: run.window, canonicalMonth: month
  }];
  addedRows[`briefs/history/evidence/${month}.jsonl`] = [{
    contractVersion: 'brief-evidence-history-row/v1', runId: run.runId, evidenceRef: evidenceObj.fingerprint,
    state: run.evidence.state, cutoffAt: run.evidence.cutoffAt, canonicalMonth: month
  }];
  const recRows = (run.recommendationEvents || []).map((event) => ({
    contractVersion: 'brief-recommendation-history-row/v1', runId: run.runId, eventId: event.eventId,
    eventType: event.eventType, recommendationKey: event.recommendationKey, occurredAt: event.occurredAt,
    canonicalMonth: month
  }));
  addedRows[`briefs/history/recommendations/${month}.jsonl`] = recRows;

  const historyPartitions = {};
  const mergedPartitions = {};
  for (const partitionPath of Object.keys(addedRows)) {
    const priorBytes = priorStreams[partitionPath] ? Buffer.from(priorStreams[partitionPath], 'utf8') : Buffer.alloc(0);
    const appended = jsonlBytes(addedRows[partitionPath]);
    const mergedBytes = Buffer.concat([priorBytes, appended]);
    historyPartitions[partitionPath] = {
      priorBytes, appendedBytes: appended, mergedBytes,
      priorSha256: `sha256:${sha256Hex(priorBytes)}`, sha256: `sha256:${sha256Hex(mergedBytes)}`
    };
    placeFile(partitionPath, mergedBytes);
    // Merged rows (prior + new) for index regeneration.
    const priorRows = priorBytes.length
      ? priorBytes.toString('utf8').split('\n').filter((l) => l.length > 0).map((l) => JSON.parse(l))
      : [];
    mergedPartitions[partitionPath] = priorRows.concat(addedRows[partitionPath]);
  }

  // 3. Compact content-addressed indexes over the authoritative rows.
  const indexes = regenerateIndexes(mergedPartitions);
  const indexPath = `briefs/indexes/${indexes.indexFingerprint.slice(7)}/history.json`;
  placeFile(indexPath, Buffer.from(stableStringify(indexes), 'utf8'));

  // 4. Immutable run manifest recording the exact publication inventory.
  const generation = (prior.generation || 0) + 1;
  const manifestBody = {
    contractVersion: 'brief-run-manifest/v1', runId: run.runId, runFingerprint: run.runFingerprint,
    canonicalMonth: month, window: run.window,
    registry: { fingerprint: registry.fingerprint, participantCount: registry.orderedParticipantIds.length, sourceCount: registry.orderedSourceToolIds.length },
    evidenceRef: { path: evidencePath, sha256: evidenceObj.fingerprint, state: run.evidence.state, cutoffAt: run.evidence.cutoffAt },
    finalRef: { path: finalPath, sha256: finalObj.fingerprint },
    indexRef: { path: indexPath, sha256: `sha256:${sha256Hex(files[indexPath].bytes)}`, indexFingerprint: indexes.indexFingerprint },
    tools: toolRefs,
    inventory: Object.keys(files).sort().map((path) => ({ path, sha256: files[path].sha256, byteLength: files[path].bytes.length }))
  };
  const manifestPath = `briefs/runs/${month}/${run.runId}/manifest.json`;
  placeFile(manifestPath, Buffer.from(stableStringify(manifestBody), 'utf8'));

  // 5. Pointers — the only mutable selectors. current.json map keys must equal orderedSourceToolIds.
  const currentPointer = {
    contractVersion: 'brief-current-pointer/v1', generation, runId: run.runId, runFingerprint: run.runFingerprint,
    manifestRef: { path: manifestPath, sha256: files[manifestPath].sha256 },
    finalRef: { path: finalPath, sha256: finalObj.fingerprint },
    registry: { fingerprint: registry.fingerprint, participantCount: registry.orderedParticipantIds.length, sourceCount: registry.orderedSourceToolIds.length },
    evidenceRef: { path: evidencePath, sha256: evidenceObj.fingerprint, state: run.evidence.state, cutoffAt: run.evidence.cutoffAt },
    orderedSourceToolIds: registry.orderedSourceToolIds.slice(),
    tools: currentMap
  };
  placeFile('briefs/current.json', Buffer.from(stableStringify(currentPointer), 'utf8'));
  const historyCurrentPointer = {
    contractVersion: 'brief-history-current-pointer/v1', generation, runId: run.runId,
    historyIndexRef: { path: indexPath, sha256: files[indexPath].sha256, indexFingerprint: indexes.indexFingerprint }
  };
  placeFile('briefs/history-current.json', Buffer.from(stableStringify(historyCurrentPointer), 'utf8'));

  // 6. Complete compatibility projections tied to the same selected run.
  const payloadBody = { contractVersion: 'brief-compat-payload/v1', runId: run.runId, runFingerprint: run.runFingerprint, manifestRef: manifestPath, window: run.window, generatedAt: run.evidence.cutoffAt };
  const snapshotBody = { contractVersion: 'brief-compat-snapshot/v1', runId: run.runId, runFingerprint: run.runFingerprint, manifestRef: manifestPath, window: run.window, asOf: run.evidence.cutoffAt };
  placeFile('market-brief.payload.json', Buffer.from(stableStringify(payloadBody), 'utf8'));
  placeFile('market-brief.snapshot.json', Buffer.from(stableStringify(snapshotBody), 'utf8'));

  return {
    ok: true,
    staging: {
      contractVersion: 'brief-publish-set/v1', canonicalMonth: month, generation,
      runId: run.runId, runFingerprint: run.runFingerprint,
      files, historyPartitions, mergedPartitions,
      indexes, manifest: { path: manifestPath, body: manifestBody },
      pointers: { current: currentPointer, historyCurrent: historyCurrentPointer },
      compatibility: { payloadPath: 'market-brief.payload.json', snapshotPath: 'market-brief.snapshot.json' },
      sealedMonths: (prior.sealedMonths || []).slice()
    }
  };
}

/**
 * validatePublishSet(staging): re-hash every artifact, enforce JSONL prefix append-only behavior,
 * sealed-month immutability, duplicate-event rejection, index agreement, undeclared-file rejection,
 * and pointer/manifest/run coherence. Fails closed with B002-HISTORY / B002-PUBLISH-SET.
 */
export function validatePublishSet(staging, options) {
  if (!staging || staging.contractVersion !== 'brief-publish-set/v1') return publishSetFailure('staging-required', 'validatePublishSet requires a staged publish set');
  const opts = options || {};
  const priorStreams = opts.priorStreams && typeof opts.priorStreams === 'object' ? opts.priorStreams : {};
  const sealedMonths = new Set(opts.sealedMonths || staging.sealedMonths || []);

  // (a) Re-hash every declared file.
  for (const path of Object.keys(staging.files)) {
    const file = staging.files[path];
    const recomputed = `sha256:${sha256Hex(file.bytes)}`;
    if (recomputed !== file.sha256) return publishSetFailure('hash-mismatch', path);
  }

  // (b) JSONL prefix append-only + sealed-month + malformed-row + duplicate-event over history partitions.
  const historyPartitions = staging.historyPartitions || {};
  const recEventIds = new Set();
  for (const path of Object.keys(historyPartitions)) {
    const partition = historyPartitions[path];
    const mergedBytes = staging.files[path] ? staging.files[path].bytes : partition.mergedBytes;
    const priorBytes = priorStreams[path] !== undefined ? Buffer.from(priorStreams[path], 'utf8') : partition.priorBytes;
    // Prefix append-only: the immutable prior bytes MUST be an exact byte prefix of the merged partition.
    if (priorBytes.length > mergedBytes.length || !mergedBytes.subarray(0, priorBytes.length).equals(priorBytes)) {
      return historyFailure('prefix-mutation', path);
    }
    // Sealed months are immutable — the partition must be byte-identical to its sealed prior.
    const monthMatch = /(\d{4}-\d{2})\.jsonl$/.exec(path);
    if (monthMatch && sealedMonths.has(monthMatch[1]) && !mergedBytes.equals(priorBytes)) {
      return historyFailure('sealed-partition-edit', path);
    }
    // Malformed rows fail closed.
    const lines = mergedBytes.toString('utf8').split('\n').filter((l) => l.length > 0);
    for (const line of lines) {
      let row;
      try { row = JSON.parse(line); } catch (e) { return historyFailure('malformed-row', path); }
      if (path.includes('/recommendations/') && row.eventId) {
        if (recEventIds.has(row.eventId)) return historyFailure('duplicate-event', row.eventId);
        recEventIds.add(row.eventId);
      }
    }
  }

  // (c) Index agreement: rebuild from authoritative merged rows and compare canonical bytes.
  if (staging.mergedPartitions) {
    const rebuilt = regenerateIndexes(staging.mergedPartitions);
    if (rebuilt.indexFingerprint !== staging.indexes.indexFingerprint) return historyFailure('index-mismatch', 'index fingerprint disagreement');
    if (stableStringify(rebuilt) !== stableStringify(staging.indexes)) return historyFailure('index-mismatch', 'index body disagreement');
  }

  // (d) Undeclared-file rejection: every staged immutable artifact must be declared in the manifest
  // inventory. The mutable pointers and the manifest itself are the publication spine, validated by
  // pointer coherence (e) rather than self-referential inventory entries.
  const manifestPaths = new Set((staging.manifest.body.inventory || []).map((entry) => entry.path));
  const spine = new Set([staging.manifest.path, 'briefs/current.json', 'briefs/history-current.json']);
  const filePaths = Object.keys(staging.files).filter((p) => p.startsWith('briefs/'));
  for (const path of filePaths) {
    if (spine.has(path)) continue;
    if (!manifestPaths.has(path)) return publishSetFailure('undeclared-file', path);
  }
  for (const entry of staging.manifest.body.inventory || []) {
    if (!staging.files[entry.path]) return publishSetFailure('missing-declared-file', entry.path);
    if (staging.files[entry.path].sha256 !== entry.sha256) return publishSetFailure('manifest-hash-mismatch', entry.path);
  }

  // (e) Pointer / manifest / run coherence.
  const current = staging.pointers.current;
  const manifestFile = staging.files[current.manifestRef.path];
  if (!manifestFile || manifestFile.sha256 !== current.manifestRef.sha256) return publishSetFailure('pointer-incoherent', 'manifest ref mismatch');
  if (current.runId !== staging.manifest.body.runId || current.runFingerprint !== staging.manifest.body.runFingerprint) return publishSetFailure('pointer-incoherent', 'run identity mismatch');
  const expectedSources = current.orderedSourceToolIds.slice().sort();
  const mapKeys = Object.keys(current.tools).sort();
  if (JSON.stringify(expectedSources) !== JSON.stringify(mapKeys)) return publishSetFailure('pointer-incoherent', 'current map keys must equal orderedSourceToolIds');
  const finalFile = staging.files[current.finalRef.path];
  if (!finalFile || finalFile.sha256 !== current.finalRef.sha256) return publishSetFailure('pointer-incoherent', 'final ref mismatch');
  const evidenceFile = staging.files[current.evidenceRef.path];
  if (!evidenceFile || evidenceFile.sha256 !== current.evidenceRef.sha256) return publishSetFailure('pointer-incoherent', 'evidence ref mismatch');
  for (const toolId of current.orderedSourceToolIds) {
    const ref = current.tools[toolId];
    if (!ref || !staging.files[ref.readPath] || staging.files[ref.readPath].sha256 !== ref.readSha256) return publishSetFailure('pointer-incoherent', `read ref mismatch ${toolId}`);
    if (ref.briefPath && (!staging.files[ref.briefPath] || staging.files[ref.briefPath].sha256 !== ref.briefSha256)) return publishSetFailure('pointer-incoherent', `brief ref mismatch ${toolId}`);
  }

  return { ok: true, validated: { files: Object.keys(staging.files).length, partitions: Object.keys(historyPartitions).length, recommendationEvents: recEventIds.size, indexFingerprint: staging.indexes.indexFingerprint } };
}

/**
 * selectHistory(index, query): return the SMALLEST partition set answering a focused query. A single
 * tool/month reads one tool partition; a recommendation key reads only recommendation partitions that
 * carry it. Unrelated partitions are never returned.
 */
export function selectHistory(index, query) {
  if (!index || index.contractVersion !== 'brief-history-index/v1') return publishSetFailure('index-required', 'selectHistory requires a history index');
  if (!query || typeof query !== 'object') return publishSetFailure('query-required', 'selectHistory requires a query');
  const entries = Object.values(index.partitions);
  const selected = [];
  for (const entry of entries) {
    const isTool = entry.path.includes('/history/tools/');
    const isRec = entry.path.includes('/history/recommendations/');
    const monthMatch = /(\d{4}-\d{2})\.jsonl$/.exec(entry.path);
    const month = monthMatch ? monthMatch[1] : null;
    if (query.toolId) {
      if (!isTool) continue;
      if (!entry.keys.includes(`tool:${query.toolId}`)) continue;
      if (query.month && month !== query.month) continue;
      selected.push(entry.path);
      continue;
    }
    if (query.recommendationKey) {
      if (!isRec) continue;
      if (!entry.keys.includes(`rec:${query.recommendationKey}`)) continue;
      if (query.month && month !== query.month) continue;
      selected.push(entry.path);
      continue;
    }
    if (query.month && !query.toolId && !query.recommendationKey) {
      if (month === query.month) { selected.push(entry.path); continue; }
    }
  }
  if (selected.length === 0) return publishSetFailure('history-selection-empty', JSON.stringify(query));
  return { ok: true, partitions: selected.sort(), indexFingerprint: index.indexFingerprint, totalPartitions: entries.length };
}

/**
 * rollbackPublication(prior): pure pointer-swap of the publication pointer (briefs/current.json) back
 * to a prior validated manifest, and regenerated compatibility projections tied to that prior run.
 * The append-only history pointer (briefs/history-current.json) is NOT rolled back — history is
 * append-only and its latest index remains authoritative. Never deletes immutable objects/events and
 * never rewrites a partition. Idempotent.
 */
export function rollbackPublication(prior) {
  if (!prior || !prior.pointer || prior.pointer.contractVersion !== 'brief-current-pointer/v1') {
    return publishSetFailure('prior-pointer-required', 'rollbackPublication requires a prior validated current pointer');
  }
  const priorRun = prior.pointer.runId;
  const projections = {
    'market-brief.payload.json': { contractVersion: 'brief-compat-payload/v1', runId: priorRun, runFingerprint: prior.pointer.runFingerprint, manifestRef: prior.pointer.manifestRef.path },
    'market-brief.snapshot.json': { contractVersion: 'brief-compat-snapshot/v1', runId: priorRun, runFingerprint: prior.pointer.runFingerprint, manifestRef: prior.pointer.manifestRef.path }
  };
  return {
    ok: true,
    rollback: {
      contractVersion: 'brief-rollback/v1', mode: 'pointer-swap',
      currentPointer: prior.pointer,
      historyPointerUnchanged: true,
      projections, deletedObjects: 0, rewrittenPartitions: 0
    }
  };
}

/** Serialize a pointer/body object to the same deterministic bytes buildPublishSet writes to disk. */
export function pointerBytes(value) {
  return Buffer.from(stableStringify(value), 'utf8');
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Feature 002 Scope 09 — Evidence-First Atomic Publication.
 *
 * Additive on top of the Scope 07 staging primitives (buildPublishSet / validatePublishSet /
 * selectHistory / rollbackPublication above, all unchanged). Scope 09 adds:
 *   - a CLOSED run-state machine (createRunState / advanceRunState) so the scheduler can only step
 *     through the barrier order and can never enter final/publish/commit/push out of order;
 *   - validateRunIdentity: manifest + both pointers share exactly one run identity, the pointer
 *     generation is monotonic (prior + 1), and every manifest-inventory entry hashes to its staged
 *     bytes — the pointer-last promotion never mixes two runs;
 *   - promotePublishSet: pointer-LAST materialization into an isolated worktree (every object and the
 *     manifest/history pointer first, briefs/current.json written and re-hashed LAST), failing closed
 *     on any byte drift between staged and on-disk bytes;
 *   - stagePublishSet: git-add ONLY the declared publish-set paths and refuse any undeclared cached
 *     path (the closed inventory contract);
 *   - commitPublication / pushPublication / classifyRemoteOverlap: the exact-commit Git boundary with
 *     run trailers, a retry-the-exact-commit push, and a path-overlap refusal;
 *   - resumePublish: hash-validated resume that retries the exact commit/push and NEVER reacquires a
 *     source or reauthors a brief.
 *
 * These functions run ONLY against an isolated worktree / temporary remote supplied by the caller.
 * They never touch the user's root worktree, brief-history.jsonl, or the real origin.
 * ───────────────────────────────────────────────────────────────────────────── */

/** The closed, ordered run phase list. A run may only advance to the immediately next phase. */
export const BRIEF_RUN_PHASES = Object.freeze([
  'initialized',
  'lease-held',
  'worktree-ready',
  'registry-frozen',
  'sources-acquired',
  'evidence-frozen',
  'reads-frozen',
  'reuse-reserved',
  'source-briefs-authored',
  'source-barrier-passed',
  'lifecycle-grouped',
  'final-authored',
  'publish-set-built',
  'publish-set-validated',
  'promoted',
  'staged',
  'committed',
  'pushed'
]);

function runStateFailure(reason, detail) { return publishFailure('B002-RUN-STATE', reason, detail); }

/** Start a fresh closed run-state machine at the first phase. */
export function createRunState(runId) {
  if (typeof runId !== 'string' || !runId) throw new Error('createRunState requires a runId');
  return { runId, phase: BRIEF_RUN_PHASES[0], history: [BRIEF_RUN_PHASES[0]] };
}

/**
 * advanceRunState(state, toPhase): the ONLY legal move is to the immediately following phase. Any skip
 * (e.g. evidence-frozen -> final-authored), any backward move, any repeat, and any unknown phase fail
 * closed with B002-RUN-STATE. This is what makes final-before-barrier and publish-before-final
 * structurally impossible rather than merely discouraged.
 */
export function advanceRunState(state, toPhase) {
  if (!state || typeof state.phase !== 'string' || !Array.isArray(state.history)) return runStateFailure('state-required', 'advanceRunState requires a run state');
  const fromIdx = BRIEF_RUN_PHASES.indexOf(state.phase);
  const toIdx = BRIEF_RUN_PHASES.indexOf(toPhase);
  if (fromIdx < 0) return runStateFailure('unknown-current-phase', state.phase);
  if (toIdx < 0) return runStateFailure('unknown-phase', String(toPhase));
  if (toIdx !== fromIdx + 1) return runStateFailure('illegal-transition', `${state.phase} -> ${toPhase}`);
  return { ok: true, state: { runId: state.runId, phase: toPhase, history: state.history.concat([toPhase]) } };
}

/** True only once the run has reached the terminal published phase. */
export function isRunPublished(state) {
  return Boolean(state) && state.phase === 'pushed';
}

/**
 * validateRunIdentity(staging, options): prove the whole publish set belongs to ONE run. The manifest
 * and both pointers must carry the same runId + runFingerprint, the generation must be exactly the
 * prior generation + 1 (pointer-last monotonicity), the current pointer must reference the staged
 * manifest by its exact hash, and every manifest-inventory entry must hash to its staged bytes. A run
 * whose manifest inventory or pointer identity was mixed from another run fails closed.
 */
export function validateRunIdentity(staging, options) {
  if (!staging || staging.contractVersion !== 'brief-publish-set/v1') return publishSetFailure('staging-required', 'validateRunIdentity requires a staged publish set');
  const opts = options || {};
  const manifest = staging.manifest && staging.manifest.body;
  const current = staging.pointers && staging.pointers.current;
  const historyCurrent = staging.pointers && staging.pointers.historyCurrent;
  if (!manifest || !current || !historyCurrent) return publishSetFailure('staging-incomplete', 'validateRunIdentity requires manifest and both pointers');
  if (manifest.runId !== staging.runId || current.runId !== staging.runId || historyCurrent.runId !== staging.runId) {
    return publishSetFailure('run-identity-mismatch', 'runId');
  }
  if (manifest.runFingerprint !== staging.runFingerprint || current.runFingerprint !== staging.runFingerprint) {
    return publishSetFailure('run-identity-mismatch', 'runFingerprint');
  }
  const priorGeneration = Number.isInteger(opts.priorGeneration) ? opts.priorGeneration : 0;
  if (staging.generation !== priorGeneration + 1 || current.generation !== priorGeneration + 1 || historyCurrent.generation !== priorGeneration + 1) {
    return publishSetFailure('generation-not-monotonic', `${staging.generation} != ${priorGeneration + 1}`);
  }
  const manifestFile = staging.files[current.manifestRef.path];
  if (!manifestFile || manifestFile.sha256 !== current.manifestRef.sha256) return publishSetFailure('pointer-manifest-mismatch', current.manifestRef.path);
  for (const entry of manifest.inventory || []) {
    const file = staging.files[entry.path];
    if (!file) return publishSetFailure('inventory-missing-file', entry.path);
    if (file.sha256 !== entry.sha256) return publishSetFailure('inventory-hash-mismatch', entry.path);
    if (file.bytes.length !== entry.byteLength) return publishSetFailure('inventory-byte-mismatch', entry.path);
  }
  return { ok: true, identity: { runId: staging.runId, runFingerprint: staging.runFingerprint, generation: staging.generation, inventory: (manifest.inventory || []).length } };
}

const POINTER_LAST_PATH = 'briefs/current.json';

/**
 * promotePublishSet(staging, targetDir): materialize the staged publish set into an isolated worktree
 * with briefs/current.json written LAST. Every object, partition, index, manifest, history pointer, and
 * compatibility projection is written and immediately re-hashed against the staged bytes; only after all
 * of them are on disk and verified is briefs/current.json (the single publication selector) written and
 * re-hashed. Any byte drift between staged and on-disk bytes fails closed with B002-PUBLISH-SET, leaving
 * the pointer un-advanced.
 */
export function promotePublishSet(staging, targetDir, options) {
  if (!staging || staging.contractVersion !== 'brief-publish-set/v1') return publishSetFailure('staging-required', 'promotePublishSet requires a staged publish set');
  if (typeof targetDir !== 'string' || !targetDir) return publishSetFailure('target-required', 'promotePublishSet requires a target worktree directory');
  const opts = options || {};
  const writeFile = typeof opts.writeFile === 'function' ? opts.writeFile : (abs, bytes) => { mkdirSync(path.dirname(abs), { recursive: true }); writeFileSync(abs, bytes); };
  const readBack = typeof opts.readFile === 'function' ? opts.readFile : (abs) => readFileSync(abs);
  const allPaths = Object.keys(staging.files);
  if (!allPaths.includes(POINTER_LAST_PATH)) return publishSetFailure('pointer-absent', POINTER_LAST_PATH);
  const objectsFirst = allPaths.filter((p) => p !== POINTER_LAST_PATH).sort();
  const written = [];
  const materialize = (rel) => {
    const abs = path.join(targetDir, rel);
    writeFile(abs, staging.files[rel].bytes);
    const back = readBack(abs);
    if (`sha256:${sha256Hex(back)}` !== staging.files[rel].sha256) return false;
    written.push(rel);
    return true;
  };
  for (const rel of objectsFirst) {
    if (!materialize(rel)) return publishSetFailure('promotion-byte-drift', rel);
  }
  // Pointer-LAST: only now, with every object + manifest + history pointer verified on disk, advance
  // the single publication selector.
  if (!materialize(POINTER_LAST_PATH)) return publishSetFailure('promotion-byte-drift', POINTER_LAST_PATH);
  return { ok: true, promoted: { targetDir, written: written.slice(), objectsBeforePointer: objectsFirst.length, pointerLast: POINTER_LAST_PATH } };
}

/**
 * stagePublishSet(staging, gitRunner): git-add ONLY the declared publish-set paths (every path the
 * generator produced: objects, partitions, indexes, manifest, both pointers, and the two compatibility
 * projections). Then read `git diff --cached --name-only` and refuse if the index carries ANY path
 * outside that closed declared set. `gitRunner(args) -> { code, stdout, stderr }` is bound to the
 * isolated worktree by the caller.
 */
export function stagePublishSet(staging, gitRunner) {
  if (!staging || staging.contractVersion !== 'brief-publish-set/v1') return publishSetFailure('staging-required', 'stagePublishSet requires a staged publish set');
  if (typeof gitRunner !== 'function') return publishSetFailure('git-runner-required', 'stagePublishSet requires a gitRunner');
  const declared = new Set(Object.keys(staging.files));
  for (const rel of Array.from(declared).sort()) {
    const added = gitRunner(['add', '--', rel]);
    if (added.code !== 0) return publishSetFailure('stage-add-failed', rel);
  }
  const cached = gitRunner(['diff', '--cached', '--name-only']);
  if (cached.code !== 0) return publishSetFailure('stage-diff-failed', cached.stderr || null);
  const cachedPaths = cached.stdout.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  for (const rel of cachedPaths) {
    if (!declared.has(rel)) return publishSetFailure('undeclared-staged-path', rel);
  }
  return { ok: true, staged: cachedPaths.slice().sort(), declared: declared.size };
}

/**
 * commitPublication(staging, gitRunner, options): commit the staged run with the three run trailers
 * (Brief-Run-Id, Brief-Run-Fingerprint, Brief-Manifest-SHA256) so the containing commit is discoverable
 * without a circular self-hash. A commit failure fails closed with B002-COMMIT and preserves the staged
 * bytes for an exact resume. Returns the resolved commit SHA on success.
 */
export function commitPublication(staging, gitRunner, options) {
  if (!staging || staging.contractVersion !== 'brief-publish-set/v1') return publishFailure('B002-COMMIT', 'staging-required', 'commitPublication requires a staged publish set');
  if (typeof gitRunner !== 'function') return publishFailure('B002-COMMIT', 'git-runner-required', 'commitPublication requires a gitRunner');
  const opts = options || {};
  const manifestFile = staging.files[staging.manifest.path];
  if (!manifestFile) return publishFailure('B002-COMMIT', 'manifest-missing', staging.manifest.path);
  const manifestSha = manifestFile.sha256;
  const trailers = [
    `Brief-Run-Id: ${staging.runId}`,
    `Brief-Run-Fingerprint: ${staging.runFingerprint}`,
    `Brief-Manifest-SHA256: ${manifestSha}`
  ];
  const subject = opts.subject || `brief: publish run ${staging.runId}`;
  const message = `${subject}\n\n${trailers.join('\n')}\n`;
  const committed = gitRunner(['commit', '-m', message]);
  if (committed.code !== 0) return publishFailure('B002-COMMIT', 'commit-failed', committed.stderr || committed.stdout || null);
  const head = gitRunner(['rev-parse', 'HEAD']);
  if (head.code !== 0) return publishFailure('B002-COMMIT', 'commit-sha-unresolved', head.stderr || null);
  return { ok: true, commit: { sha: head.stdout.trim(), manifestSha, runId: staging.runId, runFingerprint: staging.runFingerprint, trailers: trailers.slice() } };
}

/**
 * pushPublication(gitRunner, options): push the exact HEAD commit to the target remote/branch. A push
 * failure fails closed with B002-PUSH; the caller may retry the SAME commit (no refresh, no authoring).
 */
export function pushPublication(gitRunner, options) {
  if (typeof gitRunner !== 'function') return publishFailure('B002-PUSH', 'git-runner-required', 'pushPublication requires a gitRunner');
  const opts = options || {};
  const remote = opts.remote || 'origin';
  const branch = opts.branch || 'main';
  const head = gitRunner(['rev-parse', 'HEAD']);
  if (head.code !== 0) return publishFailure('B002-PUSH', 'head-unresolved', head.stderr || null);
  const pushed = gitRunner(['push', remote, `HEAD:${branch}`]);
  if (pushed.code !== 0) return publishFailure('B002-PUSH', 'push-failed', pushed.stderr || pushed.stdout || null);
  return { ok: true, push: { remote, branch, commit: head.stdout.trim() } };
}

/**
 * classifyRemoteOverlap(remotePaths, inventoryPaths): after a rejected push the caller fetches the
 * advanced remote and lists the paths it changed. Reconciliation (rebasing the exact run commit onto the
 * advanced remote) is allowed ONLY when those paths do not overlap the run's declared inventory; any
 * overlap is a B002-REMOTE-OVERLAP refusal — automation never chooses a winner for a brief path.
 */
export function classifyRemoteOverlap(remotePaths, inventoryPaths) {
  const remote = new Set((remotePaths || []).map((p) => String(p)));
  const inventory = new Set((inventoryPaths || []).map((p) => String(p)));
  const overlap = [];
  for (const rel of remote) { if (inventory.has(rel)) overlap.push(rel); }
  if (overlap.length > 0) {
    return { ok: false, error: { code: 'B002-REMOTE-OVERLAP', reason: 'declared-path-overlap', detail: overlap.sort() } };
  }
  return { ok: true, reconcilable: true, remoteChangedPaths: Array.from(remote).sort() };
}

/**
 * resumePublish(journal, options): decide the resume action for a crashed/failed run from its private
 * local journal. Before resuming it re-validates the staged-byte hashes (caller supplies the current
 * on-disk hashes); a hash drift refuses. The resume action for a committed-not-pushed run is to push the
 * EXACT commit; for a promoted/staged run it is to commit the EXACT staged bytes; a pushed run is an
 * idempotent no-op. Every resume carries reacquire:false and reauthor:false — a resume never reacquires
 * a source or reauthors a brief.
 */
export function resumePublish(journal, options) {
  if (!journal || typeof journal !== 'object' || typeof journal.phase !== 'string') return publishSetFailure('journal-required', 'resumePublish requires a persisted run journal');
  const opts = options || {};
  if (opts.currentHashes && journal.stagedHashes && typeof journal.stagedHashes === 'object') {
    for (const rel of Object.keys(journal.stagedHashes)) {
      if (opts.currentHashes[rel] !== journal.stagedHashes[rel]) return publishSetFailure('resume-hash-drift', rel);
    }
  }
  const phase = journal.phase;
  if (phase === 'pushed') return { ok: true, resume: { action: 'noop-idempotent', reacquire: false, reauthor: false, commit: journal.commit || null } };
  if (phase === 'committed') return { ok: true, resume: { action: 'push-exact-commit', reacquire: false, reauthor: false, commit: journal.commit || null } };
  if (phase === 'promoted' || phase === 'staged') return { ok: true, resume: { action: 'commit-exact-staged', reacquire: false, reauthor: false, commit: null } };
  return publishSetFailure('resume-not-publishable', phase);
}
