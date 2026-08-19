/*
 * scripts/build-scorecard.mjs — publish the brief's own error rate.
 *
 * This is the differentiator made numeric. No subscription competitor can publish its own miss rate;
 * a single-operator, no-revenue, educational project can. But the posture is worth nothing until the
 * number is on the page, so this reduces the append-only outcome ledger into
 * market-brief.scorecard.json for the cockpit to render ABOVE the attention feed.
 *
 * Honesty rules, in order of importance:
 *   - Misses are published with the same prominence as hits, in full, with what invalidated them.
 *     Selective reporting is the one unrecoverable failure for this product.
 *   - Below the declared minimum resolved sample the rate is WITHHELD (null) and the sample size is
 *     shown instead. A hit rate over four calls is noise dressed as evidence.
 *   - `not-evaluable` is reported as its own share, never hidden and never counted as a win. It is
 *     the honest cost of prose gates, and showing it is what creates pressure to write checkable ones.
 *   - Confidence is calibrated against realised frequency, so a stated 60% that realises 40% is
 *     visible rather than flattering.
 *
 *   CLI: node scripts/build-scorecard.mjs [--dry-run] [--root <path>] [--as-of YYYY-MM-DD]
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REC_DIR = 'briefs/history/recommendations';
export const SCORECARD_CONTRACT = 'brief-scorecard/v1';
export const SCORECARD_PATH = 'market-brief.scorecard.json';

/* A verdict that went one way or the other. `expired`, `unresolved` and `not-evaluable` are real
   outcomes but they are NOT evidence for or against a call, so they never enter the hit rate. */
const RESOLVED = Object.freeze({ satisfied: 1, invalidated: -1 });

export const CONFIDENCE_BUCKETS = Object.freeze([
  { id: 'lt-50', label: 'below 50', min: 0, max: 50 },
  { id: '50-59', label: '50-59', min: 50, max: 60 },
  { id: '60-69', label: '60-69', min: 60, max: 70 },
  { id: '70-79', label: '70-79', min: 70, max: 80 },
  { id: 'gte-80', label: '80 and above', min: 80, max: 101 }
]);

const DEFAULT_POLICY = Object.freeze({
  contractVersion: 'scorecard-policy/v1',
  minResolvedSample: 20,
  recentMissCount: 3,
  windowDays: [30, 90]
});

export function loadPolicy(root) {
  const abs = path.join(root, 'market-brief.config.json');
  if (!existsSync(abs)) return DEFAULT_POLICY;
  try {
    const declared = JSON.parse(readFileSync(abs, 'utf8'))['scorecard-policy/v1'];
    return declared ? { ...DEFAULT_POLICY, ...declared } : DEFAULT_POLICY;
  } catch { return DEFAULT_POLICY; }
}

export function readLedger(root) {
  const abs = path.join(root, REC_DIR);
  if (!existsSync(abs)) return [];
  const rows = [];
  for (const entry of readdirSync(abs)) {
    const rel = path.join(abs, entry);
    if (!entry.endsWith('.jsonl') || !statSync(rel).isFile()) continue;
    for (const line of readFileSync(rel, 'utf8').split('\n')) {
      if (line.length > 0) rows.push(JSON.parse(line));
    }
  }
  return rows;
}

function ratio(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1e4) / 1e4 : null;
}

function emptyTally() {
  return { closed: 0, satisfied: 0, invalidated: 0, expired: 0, unresolved: 0, notEvaluable: 0 };
}

function tallyInto(tally, eventType) {
  tally.closed += 1;
  if (eventType === 'satisfied') tally.satisfied += 1;
  else if (eventType === 'invalidated') tally.invalidated += 1;
  else if (eventType === 'expired') tally.expired += 1;
  else if (eventType === 'unresolved') tally.unresolved += 1;
  else if (eventType === 'not-evaluable') tally.notEvaluable += 1;
}

/** A tally plus the derived rates, with the rate WITHHELD below the declared minimum sample. */
export function summarize(tally, minResolvedSample) {
  const resolved = tally.satisfied + tally.invalidated;
  const insufficient = resolved < minResolvedSample;
  return {
    ...tally,
    resolved,
    hitRate: insufficient ? null : ratio(tally.satisfied, resolved),
    insufficientSample: insufficient,
    notEvaluableShare: ratio(tally.notEvaluable, tally.closed)
  };
}

function groupSummary(rows, keyOf, minResolvedSample) {
  const groups = new Map();
  for (const row of rows) {
    const key = keyOf(row) || 'unspecified';
    if (!groups.has(key)) groups.set(key, emptyTally());
    tallyInto(groups.get(key), row.eventType);
  }
  const out = {};
  for (const [key, tally] of [...groups.entries()].sort((a, b) => (b[1].closed - a[1].closed) || a[0].localeCompare(b[0]))) {
    out[key] = summarize(tally, minResolvedSample);
  }
  return out;
}

/**
 * Stated confidence against realised frequency. This is the table that says whether a 60% actually
 * behaves like a 60%. `realised` stays null below the minimum sample rather than showing a rate the
 * sample cannot support.
 */
function calibration(rows, minResolvedSample) {
  return CONFIDENCE_BUCKETS.map((bucket) => {
    const inBucket = rows.filter((row) => Number.isFinite(row.confidence) && row.confidence >= bucket.min && row.confidence < bucket.max);
    const tally = emptyTally();
    for (const row of inBucket) tallyInto(tally, row.eventType);
    const resolved = tally.satisfied + tally.invalidated;
    const resolvedRows = inBucket.filter((row) => RESOLVED[row.eventType]);
    const statedMean = resolvedRows.length
      ? Math.round((resolvedRows.reduce((sum, row) => sum + row.confidence, 0) / resolvedRows.length) * 10) / 1000
      : null;
    return {
      bucket: bucket.id, label: bucket.label,
      closed: tally.closed, resolved,
      stated: statedMean,
      realised: resolved >= minResolvedSample ? ratio(tally.satisfied, resolved) : null,
      insufficientSample: resolved < minResolvedSample
    };
  });
}

export function buildScorecard(root, options = {}) {
  const policy = loadPolicy(root);
  const rows = readLedger(root);
  const asOfMs = options.asOf ? Date.parse(`${options.asOf}T23:59:59.999Z`) : Date.now();
  const generatedAt = new Date(asOfMs).toISOString();

  const outcomes = rows.filter((row) => row.outcomeContractVersion && row.eventType);
  const closedKeys = new Set(outcomes.map((row) => row.recommendationKey));
  const proposedKeys = new Set(rows.filter((row) => row.eventType === 'proposed').map((row) => row.recommendationKey));
  const openCalls = [...proposedKeys].filter((key) => !closedKeys.has(key)).length;

  const inWindow = (row, days) => {
    if (days === null) return true;
    const at = Date.parse(row.proposedAt || row.occurredAt);
    return Number.isFinite(at) && at >= asOfMs - days * 864e5;
  };

  const windows = {};
  for (const days of [...policy.windowDays, null]) {
    const scoped = outcomes.filter((row) => inWindow(row, days));
    const tally = emptyTally();
    for (const row of scoped) tallyInto(tally, row.eventType);
    windows[days === null ? 'all' : `${days}d`] = {
      days,
      ...summarize(tally, policy.minResolvedSample),
      byHorizon: groupSummary(scoped, (row) => row.horizon, policy.minResolvedSample),
      byDirection: groupSummary(scoped, (row) => row.direction, policy.minResolvedSample),
      byDomain: groupSummary(scoped, (row) => (row.deepLink || '').replace(/\.html$/, ''), policy.minResolvedSample),
      calibration: calibration(scoped, policy.minResolvedSample)
    };
  }

  // Misses in full, most recent first. This list is the point: a scorecard that hides its misses is
  // marketing.
  const recentMisses = outcomes
    .filter((row) => row.eventType === 'invalidated')
    .sort((left, right) => String(right.occurredAt).localeCompare(String(left.occurredAt)))
    .slice(0, policy.recentMissCount)    .map((row) => ({
      recommendationKey: row.recommendationKey,
      instrument: row.instrument, direction: row.direction, horizon: row.horizon,
      confidence: row.confidence, deepLink: row.deepLink,
      proposedAt: row.proposedAt, closedAt: row.occurredAt,
      reasonCode: row.reasonCode, invalidatedBy: row.outcome || null
    }));

  /* The evaluator stamps every row it appends with a single runId, so the newest runId present is
     the run that just closed calls. Deriving the per-run count here keeps it a filter over evidence
     that already exists rather than a second producer that could disagree with the ledger. */
  const newestOutcome = outcomes.reduce((newest, row) => {
    const at = Date.parse(row.occurredAt);
    if (!Number.isFinite(at)) return newest;
    return newest === null || at > newest.at ? { at, runId: row.runId || null } : newest;
  }, null);
  const thisRunRows = newestOutcome && newestOutcome.runId
    ? outcomes.filter((row) => row.runId === newestOutcome.runId)
    : [];
  const thisRunTally = emptyTally();
  for (const row of thisRunRows) tallyInto(thisRunTally, row.eventType);
  const resolvedThisRun = {
    runId: newestOutcome ? newestOutcome.runId : null,
    ...thisRunTally,
    resolved: thisRunTally.satisfied + thisRunTally.invalidated
  };

  return {
    contractVersion: SCORECARD_CONTRACT,
    generatedAt,
    policy: {
      minResolvedSample: policy.minResolvedSample,
      recentMissCount: policy.recentMissCount,
      windowDays: policy.windowDays,
      note: 'A rate is withheld below the minimum resolved sample. not-evaluable is never counted as a win. Confidence is evidence quality, not a win probability — only realised frequency below is a frequency.'
    },
    openCalls,
    resolvedThisRun,
    windows,
    recentMisses
  };
}

function canonicalBytes(value) {
  // Minified: this artifact is fetched on every cockpit load and counts against the declared
  // first-load budget. It is machine-read, so indentation buys nothing.
  return Buffer.from(JSON.stringify(value) + '\n', 'utf8');
}

export function runBuildScorecard(root, options = {}) {
  const log = options.log || (() => { });
  const scorecard = buildScorecard(root, options);
  const all = scorecard.windows.all;
  log(`[scorecard] ${all.closed} closed call(s); ${all.resolved} resolved (${all.satisfied} in favour, ${all.invalidated} against)`);
  log(`[scorecard] hit rate: ${all.hitRate === null ? `withheld — insufficient resolved sample (n = ${all.resolved}, minimum ${scorecard.policy.minResolvedSample})` : `${Math.round(all.hitRate * 1000) / 10}%`}`);
  log(`[scorecard] not machine-evaluable: ${all.notEvaluableShare === null ? 'n/a' : `${Math.round(all.notEvaluableShare * 1000) / 10}%`}; ${scorecard.openCalls} call(s) still open`);
  if (options.dryRun) { log('[scorecard] --dry-run: nothing written'); return { ok: true, scorecard, dryRun: true }; }
  writeFileSync(path.join(root, SCORECARD_PATH), canonicalBytes(scorecard));
  log(`[scorecard] wrote ${SCORECARD_PATH}`);
  return { ok: true, scorecard };
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
  const result = runBuildScorecard(root, { dryRun, asOf, log: (line) => console.log(line) });
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  process.exit(mainCli(process.argv));
}
