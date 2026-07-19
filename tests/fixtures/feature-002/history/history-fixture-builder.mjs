/*
 * tests/fixtures/feature-002/history/history-fixture-builder.mjs — Feature 002 Scope 07.
 *
 * Deterministic builders for the bounded-history publish set and isolated-filesystem helpers. Every
 * filesystem helper targets a fresh OS temp directory so Scope 07 integration/load tests never write
 * the repository's authoritative history. Legacy corpus builders synthesize bytes in memory only; the
 * actual brief-history.jsonl is read as read-only production input by the integration/e2e tests.
 */
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

export function h(seed) { return `sha256:${createHash('sha256').update(String(seed)).digest('hex')}`; }

export function sourceIds() { return ['sector-research-lab', 'etf-momentum-lab', 'bond-regime-lab']; }

export function baseRegistry() {
  const sources = sourceIds();
  return {
    fingerprint: h('registry'),
    orderedSourceToolIds: sources.slice(),
    orderedParticipantIds: ['market-brief'].concat(sources)
  };
}

export function toolReadBody(toolId, seed) {
  return { contractVersion: 'tool-model-read/v1', toolId, status: 'fresh', summary: `read ${toolId} ${seed}`, facts: [{ id: 'f1', value: String(seed) }] };
}

export function toolBriefBody(toolId, seed) {
  return { contractVersion: 'tool-brief/v1', toolId, outcome: 'newly-authored', status: 'validated', summary: `brief ${toolId} ${seed}` };
}

export function buildRun(overrides = {}) {
  const registry = overrides.registry || baseRegistry();
  const seed = overrides.seed || 'r1';
  const runId = overrides.runId || `run-${seed}`;
  const cutoffAt = overrides.cutoffAt || '2026-07-14T12:40:00.000Z';
  const tools = overrides.tools || registry.orderedSourceToolIds.map((toolId) => ({
    toolId, outcome: 'newly-authored', read: toolReadBody(toolId, seed), brief: toolBriefBody(toolId, seed)
  }));
  return {
    runId,
    runFingerprint: overrides.runFingerprint || h(`rf-${seed}`),
    etRunDate: overrides.etRunDate || '2026-07-14',
    window: overrides.window || 'morning',
    registry,
    evidence: overrides.evidence || { state: 'available', cutoffAt, body: { contractVersion: 'market-session-evidence/v1', cutoffAt, seed: String(seed) } },
    tools,
    final: overrides.final || { body: { contractVersion: 'final-brief/v1', runId, seed: String(seed) }, coverage: { included: tools.length, merged: 0, conflicted: 0, coverageOnly: 0, excluded: 0 } },
    recommendationEvents: overrides.recommendationEvents || [{ eventId: h(`ev-${seed}`), eventType: 'proposed', recommendationKey: h(`rk-${seed}`), occurredAt: cutoffAt }],
    prior: overrides.prior || null
  };
}

/** Chain the next run onto a prior staged publish set (append-only prefix + generation + pointer). */
export function priorFromStaging(staging) {
  const streams = {};
  for (const partitionPath of Object.keys(staging.historyPartitions)) {
    streams[partitionPath] = staging.files[partitionPath].bytes.toString('utf8');
  }
  return {
    streams,
    generation: staging.generation,
    pointer: staging.pointers.current,
    historyCurrent: staging.pointers.historyCurrent,
    sealedMonths: staging.sealedMonths
  };
}

export function isolatedRoot() {
  const dir = mkdtempSync(path.join(tmpdir(), 'rl-briefs-'));
  return { dir, cleanup: () => { try { rmSync(dir, { recursive: true, force: true }); } catch (e) { /* best effort */ } } };
}

export function writeStagingToRoot(root, staging) {
  for (const rel of Object.keys(staging.files)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, staging.files[rel].bytes);
  }
}

// ---------- Legacy corpus synthesis (in-memory only; never the real file) ----------

export function legacyRow(ts, window, extra = {}) {
  return { ts, window, regimeScore: 1, vix: 15, fearGreed: 50, sectors: {}, names: {}, spy: {}, breadth: {}, flowProxies: {}, usdjpy: 150, ...extra };
}

/** Build exact legacy JSONL bytes (trailing newline) from parsed rows. */
export function legacyBytes(rows) {
  return Buffer.from(rows.map((row) => JSON.stringify(row)).join('\n') + '\n', 'utf8');
}
