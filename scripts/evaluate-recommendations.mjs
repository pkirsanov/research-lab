/*
 * scripts/evaluate-recommendations.mjs — score published calls against their OWN published terms.
 *
 * The brief has proposed and never scored: 215 rows, zero outcomes. This closes the loop. For every
 * open call it re-reads the trigger and invalidation the brief itself published, checks them against
 * the committed daily bars, and appends a close event through the shipped, tested lifecycle reducer
 * (RLCONTRACTS.reduceRecommendationEvents) rather than a private one.
 *
 * Rules that keep the score honest:
 *   - A call is judged ONLY against levels it published itself. Nothing is re-derived with hindsight.
 *   - Evaluation is on COMPLETED daily CLOSES after the call was made, because "a confirmed daily
 *     CLOSE" is the language the brief writes its gates in. An intraday touch is not a close.
 *   - `not-evaluable` is a first-class outcome, never dropped and never forced into a verdict. A call
 *     with no machine-checkable level counts against coverage, not against the hit rate.
 *   - A call still inside its horizon with nothing breached emits NOTHING. Silence means open.
 *   - Events are append-only. A correction is a new event; no row is ever edited.
 *
 *   CLI: node scripts/evaluate-recommendations.mjs [--dry-run] [--as-of YYYY-MM-DD] [--root <path>]
 */
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { canonicalMonthFromEtRunDate, regenerateIndexes } from './brief-publication.mjs';

const REC_DIR = 'briefs/history/recommendations';
const HISTORY_DIR = 'briefs/history';
export const OUTCOME_CONTRACT = 'brief-recommendation-outcome-row/v1';

/* How long a call gets to resolve before it expires, in completed sessions, keyed by the horizon the
   brief itself publishes. These are evaluation windows, not predictions. */
export const HORIZON_SESSIONS = Object.freeze({ tactical: 3, swing: 10, structural: 40 });
const DEFAULT_HORIZON_SESSIONS = 10;

function requireRl(root) {
  return createRequire(import.meta.url)(path.join(path.resolve(root), 'rlcontracts.js'));
}

function readHistoryPartitions(root) {
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

const BAR_CACHE = new Map();
function dailyBars(root, symbol) {
  const key = `${root}|${symbol}`;
  if (BAR_CACHE.has(key)) return BAR_CACHE.get(key);
  const abs = path.join(root, `data/bars/${symbol}.json`);
  let rows = null;
  if (existsSync(abs)) {
    try {
      const snapshot = JSON.parse(readFileSync(abs, 'utf8'));
      rows = Array.isArray(snapshot.rows) ? snapshot.rows : null;
    } catch { rows = null; }
  }
  BAR_CACHE.set(key, rows);
  return rows;
}

/**
 * foldLedger(partitions) — the current lifecycle state per recommendationKey.
 *
 * A key's terms come from its most recent body-carrying event (a proposal, or a body-restored event
 * enriching an older bodiless one). A key that has already reached a close event is done.
 */
export function foldLedger(partitions) {
  const state = new Map();
  const rows = [];
  for (const [rel, partitionRows] of Object.entries(partitions)) {
    if (!rel.startsWith(REC_DIR)) continue;
    for (const row of partitionRows) rows.push(row);
  }
  rows.sort((left, right) => String(left.occurredAt || '').localeCompare(String(right.occurredAt || '')));

  for (const row of rows) {
    if (!row.recommendationKey) continue;
    if (!state.has(row.recommendationKey)) {
      state.set(row.recommendationKey, { recommendationKey: row.recommendationKey, firstProposedAt: null, body: null, bodyAt: null, closed: null, events: 0 });
    }
    const entry = state.get(row.recommendationKey);
    entry.events += 1;
    if (row.eventType === 'proposed' && !entry.firstProposedAt) entry.firstProposedAt = row.occurredAt;
    if (row.bodyContractVersion && (!entry.bodyAt || String(row.occurredAt) >= String(entry.bodyAt))) {
      entry.body = row; entry.bodyAt = row.occurredAt;
    }
    if (row.outcomeContractVersion || ['satisfied', 'invalidated', 'expired', 'unresolved', 'not-evaluable', 'withdrawn'].includes(row.eventType)) {
      entry.closed = row.eventType;
    }
  }
  return state;
}

/** Completed daily closes strictly after `sinceIso`, oldest first. */
function closesAfter(rows, sinceIso) {
  const since = Date.parse(sinceIso);
  if (!rows || !Number.isFinite(since)) return [];
  return rows.filter((row) => row.t > since && Number.isFinite(row.c));
}

/**
 * judge(body, options) — the verdict for ONE call against its OWN levels.
 * Returns { eventType, reasonCode, detail } or null when the call is still legitimately open.
 */
export function judge(body, options) {
  const root = options.root;
  const asOfMs = options.asOfMs;
  const levels = Array.isArray(body.levels) ? body.levels : [];
  const proposedAt = body.occurredAt;

  if (body.evaluability !== 'machine-checkable' || !levels.length) {
    return {
      eventType: 'not-evaluable',
      reasonCode: body.evaluabilityReason || 'no-machine-checkable-level',
      detail: { levels: levels.length, instrument: body.instrument || null }
    };
  }

  const windowSessions = HORIZON_SESSIONS[body.horizon] || DEFAULT_HORIZON_SESSIONS;
  const instruments = [...new Set(levels.map((level) => level.instrument))];
  const barsByInstrument = new Map(instruments.map((symbol) => [symbol, dailyBars(root, symbol)]));
  const missing = instruments.filter((symbol) => !barsByInstrument.get(symbol));

  // Elapsed sessions is measured on whatever instrument we DO hold, so a partially covered call can
  // still expire honestly instead of hanging open forever.
  const covered = instruments.filter((symbol) => barsByInstrument.get(symbol));
  if (!covered.length) {
    return { eventType: 'not-evaluable', reasonCode: 'no-committed-bars-for-instrument', detail: { instruments, missing } };
  }
  const elapsed = Math.max(...covered.map((symbol) => closesAfter(barsByInstrument.get(symbol), proposedAt).filter((row) => row.t <= asOfMs).length));

  // Whichever gate the market reaches FIRST decides the call. Scanning all invalidation levels
  // before any trigger level would let a breach 30 sessions later beat a trigger that fired on day
  // one, which would understate the hit rate. On the SAME close, invalidation wins: risk first.
  let earliest = null;
  for (const level of levels) {
    const rows = barsByInstrument.get(level.instrument);
    if (!rows) continue;
    const forward = closesAfter(rows, proposedAt);
    for (let index = 0; index < forward.length; index += 1) {
      const row = forward[index];
      if (row.t > asOfMs) break;
      const breached = level.relation === 'above' ? row.c > level.value : row.c < level.value;
      if (!breached) continue;
      const candidate = {
        t: row.t, close: row.c, level, sessions: index + 1,
        eventType: level.source === 'invalidation' ? 'invalidated' : 'satisfied'
      };
      const better = !earliest
        || candidate.t < earliest.t
        || (candidate.t === earliest.t && candidate.eventType === 'invalidated' && earliest.eventType !== 'invalidated');
      if (better) earliest = candidate;
      break; // first breach of THIS level is the only one that matters
    }
  }
  if (earliest) {
    return {
      eventType: earliest.eventType,
      reasonCode: `${earliest.level.source}-level-${earliest.level.relation}-${earliest.level.value}`,
      detail: {
        instrument: earliest.level.instrument, relation: earliest.level.relation, level: earliest.level.value,
        close: Math.round(earliest.close * 1e4) / 1e4, closedAt: new Date(earliest.t).toISOString(),
        sessionsToResolve: earliest.sessions
      }
    };
  }

  if (elapsed < windowSessions) return null; // still legitimately open — silence means open

  if (missing.length === instruments.length) {
    return { eventType: 'unresolved', reasonCode: 'no-bars-covering-the-horizon', detail: { instruments, missing } };
  }
  return {
    eventType: 'expired',
    reasonCode: `horizon-${body.horizon || 'default'}-elapsed`,
    detail: { windowSessions, sessionsObserved: elapsed, instruments, missing }
  };
}

/**
 * planEvaluation(root, options) — pure: the closures that WOULD be appended. Every verdict is routed
 * through the shipped reducer so the event ids, ordering and dedupe are the contract layer's, not ours.
 */
export function planEvaluation(root, options = {}) {
  const RL = requireRl(root);
  const partitions = readHistoryPartitions(root);
  const ledger = foldLedger(partitions);
  const asOfMs = options.asOf ? Date.parse(`${options.asOf}T23:59:59.999Z`) : Date.now();
  const runId = options.runId || `evaluate-${new Date(asOfMs).toISOString().slice(0, 10)}`;
  const occurredAt = new Date(asOfMs).toISOString();
  const canonicalMonth = canonicalMonthFromEtRunDate(occurredAt);

  const closures = [];
  const detailByKey = new Map();
  const stats = { open: 0, alreadyClosed: 0, bodiless: 0, closed: 0, byOutcome: {} };

  for (const entry of ledger.values()) {
    if (entry.closed) { stats.alreadyClosed += 1; continue; }
    if (!entry.body) { stats.bodiless += 1; continue; }
    stats.open += 1;
    const verdict = judge(entry.body, { root, asOfMs });
    if (!verdict) continue;
    closures.push({ originRecommendationKey: entry.recommendationKey, eventType: verdict.eventType, reasonCode: verdict.reasonCode });
    detailByKey.set(entry.recommendationKey, { verdict, entry });
    stats.closed += 1;
    stats.byOutcome[verdict.eventType] = (stats.byOutcome[verdict.eventType] || 0) + 1;
  }

  if (!closures.length) return { rows: [], partitions, stats, runId };

  // The reducer owns event identity and ordering. `previous` carries the open entries it is closing;
  // `current` is empty because this run re-proposes nothing, it only resolves.
  const previous = { entries: {} };
  for (const closure of closures) {
    const { entry } = detailByKey.get(closure.originRecommendationKey);
    previous.entries[closure.originRecommendationKey] = {
      originRecommendationKey: closure.originRecommendationKey,
      aggregationKey: closure.originRecommendationKey,
      observationFingerprint: null,
      terms: {
        subjects: entry.body.instruments || [], actionFamily: entry.body.direction || null,
        horizon: entry.body.horizon || null, trigger: entry.body.trigger || null,
        invalidation: entry.body.invalidation || null
      },
      state: 'open',
      observations: {},
      firstProposedAt: entry.firstProposedAt || entry.body.occurredAt,
      lastEventId: entry.body.eventId,
      lastEventType: 'proposed'
    };
  }

  const reduced = RL.reduceRecommendationEvents(previous, [], { runId, occurredAt, canonicalMonth, closures });
  if (!reduced || reduced.ok === false) {
    throw new Error(`the lifecycle reducer refused the closure set: ${JSON.stringify(reduced && reduced.error)}`);
  }
  const events = reduced.events || (reduced.value && reduced.value.events) || [];

  const knownEventIds = new Set();
  for (const rows of Object.values(partitions)) for (const row of rows) if (row.eventId) knownEventIds.add(row.eventId);

  const rows = [];
  for (const event of events) {
    if (knownEventIds.has(event.eventId)) continue;
    const detail = detailByKey.get(event.recommendationKey);
    rows.push({
      contractVersion: 'brief-recommendation-history-row/v2',
      outcomeContractVersion: OUTCOME_CONTRACT,
      runId, canonicalMonth,
      eventId: event.eventId,
      eventType: event.eventType,
      recommendationKey: event.recommendationKey,
      occurredAt: event.occurredAt,
      reasonCode: event.reasonCode || null,
      proposedAt: detail ? (detail.entry.firstProposedAt || detail.entry.body.occurredAt) : null,
      instrument: detail ? detail.entry.body.instrument : null,
      direction: detail ? detail.entry.body.direction : null,
      horizon: detail ? detail.entry.body.horizon : null,
      confidence: detail ? detail.entry.body.confidence : null,
      deepLink: detail ? detail.entry.body.deepLink : null,
      outcome: detail ? detail.verdict.detail : null,
      evaluatedAsOf: occurredAt
    });
  }
  return { rows, partitions, stats, runId };
}

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

function jsonlBytes(rows) {
  if (!rows.length) return Buffer.alloc(0);
  return Buffer.from(rows.map((row) => canonicalBytes(row).toString('utf8')).join('\n') + '\n', 'utf8');
}

export function runEvaluation(root, options = {}) {
  const log = options.log || (() => { });
  const plan = planEvaluation(root, options);
  const { rows, partitions, stats } = plan;

  log(`[evaluate] ${stats.open} open call(s); ${stats.alreadyClosed} already closed; ${stats.bodiless} without a durable body`);
  const outcomes = Object.entries(stats.byOutcome).map(([outcome, count]) => `${count} ${outcome}`).join(' · ') || 'none';
  log(`[evaluate] verdicts this run: ${outcomes}`);

  if (!rows.length) { log('[evaluate] no call resolved this run — nothing appended'); return { ok: true, added: 0, stats }; }
  if (options.dryRun) { log(`[evaluate] --dry-run: ${rows.length} close event(s) withheld, no bytes written`); return { ok: true, added: 0, dryRun: true, stats }; }

  const merged = { ...partitions };
  const byMonth = new Map();
  for (const row of rows) {
    if (!byMonth.has(row.canonicalMonth)) byMonth.set(row.canonicalMonth, []);
    byMonth.get(row.canonicalMonth).push(row);
  }
  for (const [month, monthRows] of byMonth) {
    const rel = `${REC_DIR}/${month}.jsonl`;
    const prior = merged[rel] || [];
    merged[rel] = prior.concat(monthRows);
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, jsonlBytes(merged[rel]));
    log(`[evaluate] ${rel}: ${prior.length} -> ${merged[rel].length} rows`);
  }

  const indexes = regenerateIndexes(merged);
  const indexPath = `briefs/indexes/${indexes.indexFingerprint.slice(7)}/history.json`;
  const indexBytes = canonicalBytes(indexes);
  mkdirSync(path.dirname(path.join(root, indexPath)), { recursive: true });
  writeFileSync(path.join(root, indexPath), indexBytes);

  const pointerPath = path.join(root, 'briefs/history-current.json');
  if (existsSync(pointerPath)) {
    const pointer = JSON.parse(readFileSync(pointerPath, 'utf8'));
    pointer.historyIndexRef = {
      path: indexPath,
      sha256: `sha256:${createHash('sha256').update(indexBytes).digest('hex')}`,
      indexFingerprint: indexes.indexFingerprint
    };
    writeFileSync(pointerPath, canonicalBytes(pointer));
  }

  return { ok: true, added: rows.length, indexPath, stats };
}

function mainCli(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const asOfIdx = args.indexOf('--as-of');
  const asOfArg = args.find((a) => a.startsWith('--as-of='));
  const asOf = asOfArg ? asOfArg.slice('--as-of='.length) : (asOfIdx >= 0 ? args[asOfIdx + 1] : null);
  const rootIdx = args.indexOf('--root');
  const rootArg = args.find((a) => a.startsWith('--root='));
  const root = path.resolve(rootArg ? rootArg.slice('--root='.length) : (rootIdx >= 0 ? args[rootIdx + 1] : '.'));
  const result = runEvaluation(root, { dryRun, asOf, log: (line) => console.log(line) });
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  process.exit(mainCli(process.argv));
}
