/*
 * scripts/backfill-recommendations.mjs — recover the recommendation bodies that git still holds.
 *
 * The append-only ledger under briefs/history/recommendations/<month>.jsonl carried only a hash pair.
 * Every call's instrument, direction, levels, trigger and invalidation lived exclusively in
 * market-brief.payload.json, which each run OVERWRITES — so the terms of 215 published calls survive
 * ONLY as git history. This walks that history and re-emits each historical `proposed` event WITH its
 * durable body, so the outcome evaluator can score calls that were made before bodies were captured.
 *
 * Guarantees:
 *   - IDEMPOTENT. eventId is a pure function of (commit, recommendationKey, index); a second run adds
 *     zero rows.
 *   - APPEND-ONLY. Existing bytes are an exact prefix of the rewritten partition; nothing is edited.
 *   - NON-COLLIDING. Backfilled eventIds live in their own contract namespace, so they can never
 *     shadow a live publication event.
 *   - JOINABLE. recommendationKey uses the SAME (subject, family) formula the live publisher uses, so
 *     backfilled history and live history read as one lifecycle.
 *   - HONEST. Rows are marked `bodySource: "backfill:git"` with their source commit. A call whose own
 *     prose names no instrument or no level is recorded `not-evaluable`, never given a plausible one.
 *
 *   CLI: node scripts/backfill-recommendations.mjs [--dry-run] [--root <path>]
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { canonicalMonthFromEtRunDate, regenerateIndexes } from './brief-publication.mjs';
import {
  ROW_CONTRACT_V2, loadInstrumentUniverse, recommendationRowsFromPayload, stableSha
} from './recommendation-body.mjs';

const PAYLOAD_PATH = 'market-brief.payload.json';
const REC_DIR = 'briefs/history/recommendations';
const HISTORY_DIR = 'briefs/history';

function git(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

/** Every commit that touched the payload, oldest first, so the ledger reads forward in time. */
export function payloadCommits(root) {
  const out = git(root, ['log', '--reverse', '--format=%H', '--', PAYLOAD_PATH]).trim();
  return out ? out.split('\n') : [];
}

function payloadAtCommit(root, commit) {
  try { return JSON.parse(git(root, ['show', `${commit}:${PAYLOAD_PATH}`])); }
  catch { return null; }
}

/** Read every committed history partition as parsed rows — the input regenerateIndexes expects. */
export function readHistoryPartitions(root) {
  const partitions = {};
  const walk = (relDir) => {
    const abs = path.join(root, relDir);
    if (!existsSync(abs)) return;
    for (const entry of readdirSync(abs)) {
      const rel = `${relDir}/${entry}`;
      if (statSync(path.join(root, rel)).isDirectory()) { walk(rel); continue; }
      if (!entry.endsWith('.jsonl')) continue;
      partitions[rel] = readFileSync(path.join(root, rel), 'utf8')
        .split('\n').filter((line) => line.length > 0).map((line) => JSON.parse(line));
    }
  };
  walk(HISTORY_DIR);
  return partitions;
}

function backfillEventId(commit, recommendationKey, index) {
  return stableSha({ contractVersion: 'brief-recommendation-backfill-eventid/v1', commit, recommendationKey, index });
}

/**
 * planBackfill(root) — pure: what WOULD be appended, without touching disk. Returns rows grouped by
 * canonical month plus the counters the CLI reports.
 *
 * Two row kinds, because the ledger is append-only and a past event is immutable:
 *   - `body-restored` enriches an event the ledger ALREADY holds. It names the original eventId in
 *     `restoresEventId` rather than editing that row, which is the same shape the contract layer's
 *     `correction` event uses.
 *   - `proposed` records a call the ledger never captured at all — a payload that shipped to the live
 *     site before (or outside) distributed publication.
 */
export function planBackfill(root) {
  const universe = loadInstrumentUniverse(root);
  const partitions = readHistoryPartitions(root);
  const knownEventIds = new Set();
  const liveByKeyTime = new Map();
  const alreadyRestored = new Set();
  for (const [rel, rows] of Object.entries(partitions)) {
    for (const row of rows) {
      if (row.eventId) knownEventIds.add(row.eventId);
      if (!rel.startsWith(REC_DIR)) continue;
      if (row.restoresEventId) alreadyRestored.add(row.restoresEventId);
      if (row.eventType !== 'proposed' || !row.recommendationKey) continue;
      liveByKeyTime.set(`${row.recommendationKey}|${row.occurredAt}`, {
        eventId: row.eventId, bodiless: !row.bodyContractVersion
      });
    }
  }

  const byMonth = new Map();
  const restoredEventIds = new Set(alreadyRestored);
  const stats = {
    commits: 0, commitsWithPayload: 0, candidateRows: 0, newRows: 0, alreadyPresent: 0,
    bodyRestored: 0, proposed: 0, machineCheckable: 0, notEvaluable: 0, distinctKeys: new Set()
  };

  for (const commit of payloadCommits(root)) {
    stats.commits += 1;
    const payload = payloadAtCommit(root, commit);
    if (!payload) continue;
    const occurredAt = typeof payload.asOf === 'string' && payload.asOf
      ? payload.asOf
      : (typeof payload.generatedAt === 'string' ? payload.generatedAt : null);
    if (!occurredAt) continue;
    let month;
    try { month = canonicalMonthFromEtRunDate(occurredAt); } catch { continue; }
    stats.commitsWithPayload += 1;

    const rows = recommendationRowsFromPayload(payload, {
      universe, occurredAt,
      eventIdFor: (recommendationKey, index) => backfillEventId(commit, recommendationKey, index)
    });

    for (const row of rows) {
      stats.candidateRows += 1;
      if (knownEventIds.has(row.eventId)) { stats.alreadyPresent += 1; continue; }
      const liveEntry = liveByKeyTime.get(`${row.recommendationKey}|${row.occurredAt}`) || null;
      // Restore a body ONLY onto an event that lacks one; a complete row needs no enrichment.
      const restoresEventId = liveEntry && liveEntry.bodiless ? liveEntry.eventId : null;
      if (liveEntry && !liveEntry.bodiless) { stats.alreadyPresent += 1; continue; }
      // One restoration per original event: a key re-proposed in the same instant is still one event.
      if (restoresEventId && restoredEventIds.has(restoresEventId)) { stats.alreadyPresent += 1; continue; }
      knownEventIds.add(row.eventId);
      if (restoresEventId) restoredEventIds.add(restoresEventId);
      stats.newRows += 1;
      stats.distinctKeys.add(row.recommendationKey);
      if (restoresEventId) stats.bodyRestored += 1; else stats.proposed += 1;
      if (row.evaluability === 'machine-checkable') stats.machineCheckable += 1; else stats.notEvaluable += 1;
      if (!byMonth.has(month)) byMonth.set(month, []);
      byMonth.get(month).push({
        contractVersion: ROW_CONTRACT_V2,
        runId: `backfill-${commit.slice(0, 12)}`,
        canonicalMonth: month,
        sourceCommit: commit,
        ...row,
        eventType: restoresEventId ? 'body-restored' : 'proposed',
        restoresEventId,
        bodySource: 'backfill:git'
      });
    }
  }

  const unrestored = [];
  for (const [key, entry] of liveByKeyTime) {
    // Only a BODILESS event needs restoring; a row that already carries its own body is complete.
    if (!entry.bodiless) continue;
    if (!restoredEventIds.has(entry.eventId)) unrestored.push(key);
  }

  return {
    byMonth, partitions,
    stats: { ...stats, distinctKeys: stats.distinctKeys.size, liveEventsWithoutRecoverableBody: unrestored.length }
  };
}

function jsonlBytes(rows) {
  if (rows.length === 0) return Buffer.alloc(0);
  // Sorted-key encoding, byte-identical to the publication engine's own jsonlBytes. Anything else
  // makes regenerateIndexes disagree with the bytes on disk and fails validateHistoryGraph.
  return Buffer.from(rows.map((row) => canonicalBytes(row).toString('utf8')).join('\n') + '\n', 'utf8');
}

export function runBackfill(root, options) {
  const opts = options || {};
  const log = opts.log || (() => { });
  const plan = planBackfill(root);
  const { byMonth, partitions, stats } = plan;

  log(`[backfill] scanned ${stats.commits} payload commits (${stats.commitsWithPayload} readable)`);
  log(`[backfill] ${stats.candidateRows} candidate rows -> ${stats.newRows} new, ${stats.alreadyPresent} already present`);
  log(`[backfill]   ${stats.bodyRestored} body-restored (enrich an event the ledger already holds)`);
  log(`[backfill]   ${stats.proposed} proposed (history the ledger never captured)`);
  log(`[backfill] ${stats.distinctKeys} distinct recommendation keys; ${stats.machineCheckable} machine-checkable, ${stats.notEvaluable} not-evaluable`);
  log(`[backfill] ${stats.liveEventsWithoutRecoverableBody} live events have no recoverable body in git`);

  if (!stats.newRows) { log('[backfill] nothing to add — history already carries every derivable body'); return { ok: true, added: 0, stats }; }
  if (opts.dryRun) { log('[backfill] --dry-run: no bytes written'); return { ok: true, added: 0, dryRun: true, stats }; }

  // Append (never rewrite): prior bytes stay an exact prefix of the new partition.
  const merged = { ...partitions };
  for (const [month, rows] of byMonth) {
    const rel = `${REC_DIR}/${month}.jsonl`;
    const prior = merged[rel] || [];
    merged[rel] = prior.concat(rows);
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, jsonlBytes(merged[rel]));
    log(`[backfill] ${rel}: ${prior.length} -> ${merged[rel].length} rows`);
  }

  // The history index and its pointer must stay coherent, or validateHistoryGraph fails closed.
  const indexes = regenerateIndexes(merged);
  const indexPath = `briefs/indexes/${indexes.indexFingerprint.slice(7)}/history.json`;
  const canonicalIndexBytes = canonicalBytes(indexes);
  mkdirSync(path.dirname(path.join(root, indexPath)), { recursive: true });
  writeFileSync(path.join(root, indexPath), canonicalIndexBytes);

  const pointerPath = path.join(root, 'briefs/history-current.json');
  if (existsSync(pointerPath)) {
    const pointer = JSON.parse(readFileSync(pointerPath, 'utf8'));
    pointer.historyIndexRef = {
      path: indexPath,
      sha256: `sha256:${createHash('sha256').update(canonicalIndexBytes).digest('hex')}`,
      indexFingerprint: indexes.indexFingerprint
    };
    writeFileSync(pointerPath, canonicalBytes(pointer));
    log(`[backfill] history pointer -> ${indexPath}`);
  }

  return { ok: true, added: stats.newRows, indexPath, stats };
}

/** Sorted-key JSON, byte-identical to what the publication engine writes for pointers and indexes. */
function canonicalBytes(value) {
  const sortValue = (input) => {
    if (Array.isArray(input)) return input.map(sortValue);
    if (input && typeof input === 'object') {
      const out = {};
      for (const key of Object.keys(input).sort()) out[key] = sortValue(input[key]);
      return out;
    }
    return input;
  };
  return Buffer.from(JSON.stringify(sortValue(value)), 'utf8');
}

function mainCli(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const rootIdx = args.indexOf('--root');
  const rootArg = args.find((a) => a.startsWith('--root='));
  const root = path.resolve(rootArg ? rootArg.slice('--root='.length) : (rootIdx >= 0 ? args[rootIdx + 1] : '.'));
  const result = runBackfill(root, { dryRun, log: (line) => console.log(line) });
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  process.exit(mainCli(process.argv));
}
