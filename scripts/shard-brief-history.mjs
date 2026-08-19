/*
 * scripts/shard-brief-history.mjs — bound what the cockpit downloads, without losing a row.
 *
 * brief-history.jsonl grew to 2.37 MB across 107 runs and market-brief.html fetched ALL of it on
 * every page load — while assigning it to a variable nothing reads. At ~22 KB per run and 4 runs a
 * day that is roughly 30 MB after a year, downloaded in full, for nothing.
 *
 * This shards the append-only file two ways:
 *   - briefs/tier-a/<YYYY-MM>.jsonl  — every row, in full, partitioned by ET month. Nothing is lost.
 *   - brief-history.recent.jsonl     — the last N runs as a COMPACT projection (regime, VIX, F&G,
 *     benchmark structure). That is what a trend view actually needs; toolReads/toolCoverage/groups
 *     are 90% of the bytes and belong in the monthly shard.
 *
 * brief-history.jsonl itself is NEVER rewritten. It stays the append target, byte-for-byte, because
 * the atomicity tests assert exactly that and the distributed migration reads it as production input.
 *
 * Deliberate path choice: shards live under briefs/tier-a/, NOT briefs/history/. Everything under
 * briefs/history/ is walked into the content-addressed history index; a file this script rewrites on
 * every run would invalidate that index the moment the recommendation ledger regenerated it.
 *
 *   CLI: node scripts/shard-brief-history.mjs [--dry-run] [--root <path>] [--recent <n>]
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const SOURCE = 'brief-history.jsonl';
export const RECENT = 'brief-history.recent.jsonl';
export const SHARD_DIR = 'briefs/tier-a';
export const RECENT_CONTRACT = 'brief-history-recent-row/v2';
/* The projection this file emitted before Feature 026 Scope 3. Kept as a named export so a
   reader can distinguish the two by contractVersion instead of by field probing, and so the
   additive claim of FR-026-040 is checkable against a name rather than a memory. */
export const RECENT_CONTRACT_V1 = 'brief-history-recent-row/v1';

function etMonth(iso) {
  const epoch = Date.parse(iso);
  if (!Number.isFinite(epoch)) return null;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit' })
    .formatToParts(new Date(epoch));
  return `${parts.find((p) => p.type === 'year').value}-${parts.find((p) => p.type === 'month').value}`;
}

/**
 * The compact projection the cockpit can afford to load every time. Deliberately excludes
 * toolReads / toolCoverage / groups / sectors / names: those are the monthly shard's job, and a page
 * that needs them should read the one month it cares about.
 *
 * Feature 026 Scope 3 raised this to brief-history-recent-row/v2. The bump is ADDITIVE: every v1
 * key above `crossAsset` stays at its path with its meaning, so a reader that never heard of v2
 * reads exactly what it read before. The four new keys carry what the run SAW, which is what makes
 * "what changed since I last told you" answerable without refetching a single instrument.
 *
 * A historic source row carries none of them and is projected as `null` — never `{}` and never `0`.
 * That distinction is load-bearing: `{}` would read as "twelve instruments, none of them tracked"
 * and `0` would read as "measured, and the answer was zero". `null` reads as absent prior state,
 * and the change detector answers `baseline` for it, which is notes/market-brief.md §5's existing
 * rule rather than a new one.
 *
 * The v2 keys are PROJECTIONS, not copies. A verbatim `tracked` block is ~3.5 KB per row, so a
 * full 30-row window would have carried ~106 KB of per-instrument levels and flags into a first
 * load that is budgeted at 200 KB total — the window would have blown the budget on its own
 * within a week of four-a-day runs. What the PAGE needs is the state label it renders; what the
 * CHANGE DETECTOR needs is the full level and flag set, and that lives in the append-only ledger
 * this file shards from, which is never first-loaded. `trackedStates` is deliberately NOT named
 * `tracked`, so a future caller cannot mistake a label map for the state the predicates require.
 */
function compactTrackedStates(tracked) {
  if (!tracked || typeof tracked !== 'object' || Array.isArray(tracked)) return null;
  const out = {};
  for (const symbol of Object.keys(tracked).sort()) {
    const state = tracked[symbol];
    if (!state || typeof state !== 'object') { out[symbol] = null; continue; }
    out[symbol] = state.maStack ?? state.rrgState ?? null;
  }
  return out;
}

/** Per leg the window keeps only what a history strip plots: the move and whether it resolved. */
function compactCrossAsset(crossAsset) {
  if (!crossAsset || typeof crossAsset !== 'object' || Array.isArray(crossAsset)) return null;
  const out = {};
  for (const leg of Object.keys(crossAsset).sort()) {
    const reading = crossAsset[leg];
    if (!reading || typeof reading !== 'object') { out[leg] = null; continue; }
    out[leg] = { changePct: reading.changePct ?? null, state: reading.state ?? null };
  }
  return out;
}

/** The leg ids only. A dark reason is a paragraph and belongs to the payload, not to 30 rows. */
function compactDark(dark) {
  if (!Array.isArray(dark)) return null;
  return dark.map((entry) => (entry && typeof entry === 'object' ? entry.leg ?? null : null))
    .filter((leg) => typeof leg === 'string');
}

export function compactRow(row) {
  const bench = row.bench || {};
  return {
    contractVersion: RECENT_CONTRACT,
    ts: row.ts || null,
    window: row.window || null,
    marketClosed: Boolean(row.marketClosed),
    nextSessionDate: row.nextSessionDate || null,
    regimeBand: row.regimeBand ?? null,
    regimeScore: row.regimeScore ?? null,
    vix: row.vix ?? null,
    fearGreed: row.fearGreed ?? null,
    bench: {
      px: bench.px ?? null,
      maStack: bench.maStack ?? null,
      ma200Dist: bench.ma200Dist ?? null,
      pctFrom52wHigh: bench.pctFrom52wHigh ?? null,
      mom126: bench.mom126 ?? null,
      mom252: bench.mom252 ?? null
    },
    crossAsset: compactCrossAsset(row.crossAsset),
    trackedStates: compactTrackedStates(row.tracked),
    claims: row.claims ?? null,
    dark: compactDark(row.dark)
  };
}

export function readSourceRows(root) {
  const abs = path.join(root, SOURCE);
  if (!existsSync(abs)) return [];
  return readFileSync(abs, 'utf8').split('\n').filter((line) => line.length > 0).map((line) => JSON.parse(line));
}

export function planShards(root, options = {}) {
  const recentCount = Number.isFinite(options.recent) && options.recent > 0 ? options.recent : 30;
  const rows = readSourceRows(root);
  const byMonth = new Map();
  for (const row of rows) {
    const month = etMonth(row.ts) || 'undated';
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month).push(row);
  }
  const recent = rows.slice(-recentCount).map(compactRow);
  return { rows, byMonth, recent, recentCount };
}

function jsonlBytes(rows) {
  if (!rows.length) return Buffer.alloc(0);
  return Buffer.from(rows.map((row) => JSON.stringify(row)).join('\n') + '\n', 'utf8');
}

export function runShard(root, options = {}) {
  const log = options.log || (() => { });
  const plan = planShards(root, options);
  const sourceBytes = existsSync(path.join(root, SOURCE)) ? statSync(path.join(root, SOURCE)).size : 0;

  log(`[shard] ${plan.rows.length} run(s) across ${plan.byMonth.size} month(s); source ${Math.round(sourceBytes / 1024)} KB`);
  if (options.dryRun) {
    const recentBytes = jsonlBytes(plan.recent).length;
    log(`[shard] --dry-run: recent window would be ${plan.recent.length} row(s), ${Math.round(recentBytes / 1024)} KB. Nothing written.`);
    return { ok: true, dryRun: true, plan };
  }

  mkdirSync(path.join(root, SHARD_DIR), { recursive: true });
  const written = [];
  for (const [month, monthRows] of [...plan.byMonth.entries()].sort()) {
    const rel = `${SHARD_DIR}/${month}.jsonl`;
    const bytes = jsonlBytes(monthRows);
    const abs = path.join(root, rel);
    // Byte-compare before writing so an unchanged month keeps its mtime and the commit stays scoped.
    if (existsSync(abs) && readFileSync(abs).equals(bytes)) continue;
    writeFileSync(abs, bytes);
    written.push(`${rel} (${monthRows.length} rows)`);
  }

  const recentBytes = jsonlBytes(plan.recent);
  writeFileSync(path.join(root, RECENT), recentBytes);
  log(`[shard] ${RECENT}: ${plan.recent.length} row(s), ${Math.round(recentBytes.length / 1024)} KB (was ${Math.round(sourceBytes / 1024)} KB on every page load)`);
  if (written.length) log(`[shard] shards updated: ${written.join(', ')}`);
  return { ok: true, recentBytes: recentBytes.length, sourceBytes, months: plan.byMonth.size, written };
}

function mainCli(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const recentIdx = args.indexOf('--recent');
  const recentArg = args.find((a) => a.startsWith('--recent='));
  const recent = Number(recentArg ? recentArg.slice('--recent='.length) : (recentIdx >= 0 ? args[recentIdx + 1] : NaN));
  const rootIdx = args.indexOf('--root');
  const rootArg = args.find((a) => a.startsWith('--root='));
  const root = path.resolve(rootArg ? rootArg.slice('--root='.length) : (rootIdx >= 0 ? args[rootIdx + 1] : '.'));
  const result = runShard(root, { dryRun, recent, log: (line) => console.log(line) });
  return result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  process.exit(mainCli(process.argv));
}
