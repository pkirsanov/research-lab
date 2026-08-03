/**
 * Per-ticker owner reads for the public watchlist matrix.
 *
 * The matrix contract in rlmarketaction.js resolves a cell from
 * ownerReads[toolId][ticker]. Nothing ever produced that input, so every
 * applicable cell fell through to the documented "no current public owner read"
 * branch and the Portfolio view was a grid of the word `unavailable`.
 *
 * This produces the reads that DO have committed evidence behind them. It never
 * invents one: a ticker with no bars, an unobserved session, or a stale snapshot
 * yields an explicit reasoned gap, because BI-2 forbids the alternative.
 *
 * Volatility is computed through rlmetrics.js, the single canonical metric spine
 * (D4), so the figure here and the figure the owning tool shows cannot diverge.
 *
 * Usage:  node scripts/build-owner-reads.mjs [--dry-run] [--as-of YYYY-MM-DD]
 * Exit :  0 written (or dry-run clean) · 1 no read could be produced at all
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createRequire } from 'node:module';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const featureRequire = createRequire(import.meta.url);
const METRICS = featureRequire('../rlmetrics.js');

const DRY_RUN = process.argv.includes('--dry-run');
const asOfArgIndex = process.argv.indexOf('--as-of');
const AS_OF = asOfArgIndex >= 0 ? process.argv[asOfArgIndex + 1] : new Date().toISOString().slice(0, 10);

/* A snapshot older than this is reported `stale`, never silently treated as current. */
const FRESH_MAX_DAYS = 7;
/* One quarter of sessions is the shortest window that makes an annualized figure meaningful. */
const VOL_WINDOW = 63;

const readJson = (relativePath) => JSON.parse(readFileSync(resolve(ROOT, relativePath), 'utf8'));

function daysBetween(isoA, isoB) {
  const a = Date.parse(`${isoA}T00:00:00Z`);
  const b = Date.parse(`${isoB}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.round((b - a) / 86400000);
}

/* Returns an owner read, or a reasoned gap. Never a fabricated number. */
function volatilityRead(ticker) {
  const barsPath = `data/bars/${ticker}.json`;
  if (!existsSync(resolve(ROOT, barsPath))) {
    return { state: 'unavailable', gapReason: `no committed daily bars for ${ticker}` };
  }
  const bars = readJson(barsPath);
  const rows = Array.isArray(bars.rows) ? bars.rows : [];
  if (rows.length < VOL_WINDOW + 1) {
    return { state: 'unavailable', gapReason: `only ${rows.length} sessions on file; ${VOL_WINDOW + 1} needed` };
  }
  if (bars.sessionState && bars.sessionState !== 'observed') {
    return { state: 'unavailable', gapReason: `latest session is ${bars.sessionState}, not observed` };
  }
  const closes = rows.slice(-(VOL_WINDOW + 1)).map((row) => row.c).filter((c) => Number.isFinite(c));
  if (closes.length < VOL_WINDOW + 1) {
    return { state: 'unavailable', gapReason: 'the recent window contains a non-finite close' };
  }
  const annualizedVol = METRICS.annualizedVol(METRICS.returnsFromCloses(closes));
  if (!Number.isFinite(annualizedVol)) {
    return { state: 'unavailable', gapReason: 'realized volatility did not resolve to a finite value' };
  }
  const age = bars.asof ? daysBetween(bars.asof, AS_OF) : null;
  const stale = age === null || age > FRESH_MAX_DAYS;
  const pct = (annualizedVol * 100).toFixed(1);
  return {
    state: stale ? 'stale' : 'current',
    read: `Realized ${VOL_WINDOW}-session volatility ${pct}% annualized.`,
    asOf: bars.asof ? `${bars.asof}T00:00:00.000Z` : null,
    provenance: 'same-origin-snapshot',
    gapReason: stale ? `snapshot is ${age === null ? 'undated' : `${age} days`} old` : null,
    metrics: { annualizedVol: Number(annualizedVol.toFixed(6)), window: VOL_WINDOW }
  };
}

/* domain -> the tool whose read this producer emits. The matrix walks its own
   registry-derived precedence and takes the first tool that has a read. */
const PRODUCERS = [
  { toolId: 'volatility-sizing-lab', domainId: 'volatility', build: volatilityRead }
];

function main() {
  const watchlist = readJson('watchlist.json');
  const items = Array.isArray(watchlist.items) ? watchlist.items : [];
  const ownerReads = {};
  let current = 0;
  let gaps = 0;

  for (const producer of PRODUCERS) {
    ownerReads[producer.toolId] = {};
    for (const item of items) {
      const read = producer.build(item.ticker);
      read.ownerDeepLink = `${producer.toolId}.html#power`;
      ownerReads[producer.toolId][item.ticker] = read;
      if (read.state === 'current') current += 1; else gaps += 1;
    }
  }

  const artifact = {
    contractVersion: 'public-owner-reads/v1',
    generatedAt: new Date().toISOString(),
    asOf: AS_OF,
    source: 'committed same-origin snapshots via rlmetrics',
    tickers: items.map((item) => item.ticker),
    domainsProduced: PRODUCERS.map((p) => p.domainId),
    ownerReads
  };

  console.log(`owner reads: ${current} current, ${gaps} gap(s) across ${items.length} ticker(s)`);
  for (const producer of PRODUCERS) {
    for (const item of items) {
      const read = ownerReads[producer.toolId][item.ticker];
      console.log(`  ${item.ticker.padEnd(6)} ${producer.domainId.padEnd(14)} ${read.state.padEnd(11)} ${read.read || read.gapReason}`);
    }
  }

  if (DRY_RUN) {
    console.log('dry run: market-brief.owner-reads.json not written');
    return current > 0 ? 0 : 1;
  }
  writeFileSync(resolve(ROOT, 'market-brief.owner-reads.json'), `${JSON.stringify(artifact, null, 2)}\n`);
  console.log('wrote market-brief.owner-reads.json');
  return current > 0 ? 0 : 1;
}

process.exit(main());
