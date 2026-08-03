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
/* Relative strength is measured over the same quarter, against the broad-market benchmark. */
const RS_WINDOW = 63;
const BENCHMARK = 'SPY';
/* The longest moving average in the stack; also the minimum history a structure read needs. */
const MA_LONG = 200;

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

/* Shared preconditions for a bars-derived read. Returns { rows, bars } or a reasoned gap,
   so every producer refuses on the SAME evidence rules instead of each inventing its own. */
function barsOrGap(ticker, minSessions) {
  const barsPath = `data/bars/${ticker}.json`;
  if (!existsSync(resolve(ROOT, barsPath))) {
    return { gap: { state: 'unavailable', gapReason: `no committed daily bars for ${ticker}` } };
  }
  const bars = readJson(barsPath);
  const rows = Array.isArray(bars.rows) ? bars.rows : [];
  if (rows.length < minSessions) {
    return { gap: { state: 'unavailable', gapReason: `only ${rows.length} sessions on file; ${minSessions} needed` } };
  }
  if (bars.sessionState && bars.sessionState !== 'observed') {
    return { gap: { state: 'unavailable', gapReason: `latest session is ${bars.sessionState}, not observed` } };
  }
  return { rows, bars };
}

function staleness(bars) {
  const age = bars.asof ? daysBetween(bars.asof, AS_OF) : null;
  const stale = age === null || age > FRESH_MAX_DAYS;
  return {
    state: stale ? 'stale' : 'current',
    asOf: bars.asof ? `${bars.asof}T00:00:00.000Z` : null,
    gapReason: stale ? `snapshot is ${age === null ? 'undated' : `${age} days`} old` : null
  };
}

/* Relative strength against the benchmark over the same window, in percentage points.
   A relative figure needs BOTH legs measured over the SAME sessions, so a benchmark gap is a
   gap for the whole read rather than a silent fallback to the ticker's absolute return. */
function macroRotationRead(ticker) {
  if (ticker === BENCHMARK) {
    return { state: 'not-applicable', gapReason: `${ticker} is the benchmark this read is measured against` };
  }
  const subject = barsOrGap(ticker, RS_WINDOW + 1);
  if (subject.gap) return subject.gap;
  const benchmark = barsOrGap(BENCHMARK, RS_WINDOW + 1);
  if (benchmark.gap) {
    return { state: 'unavailable', gapReason: `benchmark ${BENCHMARK} unusable: ${benchmark.gap.gapReason}` };
  }
  const totalReturn = (rows) => {
    const window = rows.slice(-(RS_WINDOW + 1)).map((row) => row.c).filter((c) => Number.isFinite(c));
    if (window.length < RS_WINDOW + 1) return null;
    const first = window[0];
    if (!(first > 0)) return null;
    return (window[window.length - 1] / first) - 1;
  };
  const subjectReturn = totalReturn(subject.rows);
  const benchmarkReturn = totalReturn(benchmark.rows);
  if (subjectReturn === null || benchmarkReturn === null) {
    return { state: 'unavailable', gapReason: 'the recent window contains a non-finite or non-positive close' };
  }
  const spreadPoints = (subjectReturn - benchmarkReturn) * 100;
  const lead = spreadPoints >= 0 ? 'ahead of' : 'behind';
  const age = staleness(subject.bars);
  return {
    state: age.state,
    read: `${Math.abs(spreadPoints).toFixed(1)}pp ${lead} ${BENCHMARK} over ${RS_WINDOW} sessions.`,
    asOf: age.asOf,
    provenance: 'same-origin-snapshot',
    gapReason: age.gapReason,
    metrics: {
      relativeReturnPoints: Number(spreadPoints.toFixed(4)),
      subjectReturn: Number(subjectReturn.toFixed(6)),
      benchmarkReturn: Number(benchmarkReturn.toFixed(6)),
      benchmark: BENCHMARK,
      window: RS_WINDOW
    }
  };
}

/* Nearest-expiry at-the-money implied move from the committed chain. Only two watchlist names
   have a committed chain; the rest stay an explicit gap rather than borrowing a proxy symbol's
   volatility, which would read as this ticker's own and be false. */
function optionsRead(ticker) {
  const chainPath = `data/options/${ticker}.json`;
  if (!existsSync(resolve(ROOT, chainPath))) {
    return { state: 'unavailable', gapReason: `no committed option chain for ${ticker}` };
  }
  const chain = readJson(chainPath);
  const contracts = Array.isArray(chain.o) ? chain.o : [];
  const spot = Number(chain.spot);
  if (!contracts.length || !(spot > 0)) {
    return { state: 'unavailable', gapReason: `chain for ${ticker} has no contracts or no spot` };
  }
  const asOfMs = Date.parse(`${AS_OF}T00:00:00Z`);
  /* `e` is a Unix epoch in SECONDS, not an ISO date. Parsing it as a date string silently
     discarded every expiry and reported the chain as entirely past — the gap was honest, but
     it was my bug, not the data's. */
  const expiries = [...new Set(contracts.map((row) => row.e).filter((e) => Number.isFinite(e)))]
    .map((epochSeconds) => ({ epochSeconds, ms: epochSeconds * 1000 }))
    .filter((entry) => entry.ms >= asOfMs)
    .sort((a, b) => a.ms - b.ms)
    .map((entry) => ({ ...entry, expiry: new Date(entry.ms).toISOString().slice(0, 10) }));
  if (!expiries.length) {
    return { state: 'unavailable', gapReason: `every committed expiry for ${ticker} is already past ${AS_OF}` };
  }
  const nearest = expiries[0];
  const atTheMoney = contracts
    .filter((row) => row.e === nearest.epochSeconds && Number.isFinite(row.iv) && row.iv > 0 && Number.isFinite(row.k))
    .sort((a, b) => Math.abs(a.k - spot) - Math.abs(b.k - spot))
    .slice(0, 4);
  if (!atTheMoney.length) {
    return { state: 'unavailable', gapReason: `no priced at-the-money implied volatility for ${ticker} ${nearest.expiry}` };
  }
  const impliedVol = atTheMoney.reduce((sum, row) => sum + row.iv, 0) / atTheMoney.length;
  const sessionsOut = Math.max(1, Math.round((nearest.ms - asOfMs) / 86400000));
  const impliedMovePct = impliedVol * Math.sqrt(sessionsOut / 365) * 100;
  if (!Number.isFinite(impliedMovePct)) {
    return { state: 'unavailable', gapReason: 'implied move did not resolve to a finite value' };
  }
  const snapshotDate = typeof chain.asof === 'string' ? chain.asof.slice(0, 10) : null;
  const age = snapshotDate ? daysBetween(snapshotDate, AS_OF) : null;
  const stale = age === null || age > FRESH_MAX_DAYS;
  return {
    state: stale ? 'stale' : 'current',
    read: `Options imply a ${impliedMovePct.toFixed(1)}% move by ${nearest.expiry}.`,
    asOf: snapshotDate ? `${snapshotDate}T00:00:00.000Z` : null,
    provenance: 'same-origin-snapshot',
    gapReason: stale ? `chain snapshot is ${age === null ? 'undated' : `${age} days`} old` : null,
    metrics: {
      impliedVol: Number(impliedVol.toFixed(6)),
      impliedMovePct: Number(impliedMovePct.toFixed(4)),
      expiry: nearest.expiry,
      daysToExpiry: sessionsOut,
      atTheMoneyContracts: atTheMoney.length
    }
  };
}

/* Moving-average stack: where the last close sits against its 20 / 50 / 200-session averages.
   This is the structure read the brief already attributes to swing-structure-lab in prose
   ("Bull-stacked 20>50>200"), computed here from the same committed closes so the two cannot
   disagree. */
function technicalRead(ticker) {
  const subject = barsOrGap(ticker, MA_LONG + 1);
  if (subject.gap) return subject.gap;
  const closes = subject.rows.map((row) => row.c).filter((c) => Number.isFinite(c));
  if (closes.length < MA_LONG + 1) {
    return { state: 'unavailable', gapReason: 'the recent window contains a non-finite close' };
  }
  const mean = (window) => window.reduce((sum, value) => sum + value, 0) / window.length;
  const last = closes[closes.length - 1];
  const ma20 = mean(closes.slice(-20));
  const ma50 = mean(closes.slice(-50));
  const ma200 = mean(closes.slice(-MA_LONG));
  if (![last, ma20, ma50, ma200].every((value) => Number.isFinite(value) && value > 0)) {
    return { state: 'unavailable', gapReason: 'a moving average did not resolve to a finite value' };
  }
  const stacked = ma20 > ma50 && ma50 > ma200;
  const inverted = ma20 < ma50 && ma50 < ma200;
  const structure = stacked ? 'Bull-stacked (20>50>200)' : inverted ? 'Bear-stacked (20<50<200)' : 'Mixed stack';
  const vs200 = ((last / ma200) - 1) * 100;
  const side = vs200 >= 0 ? 'above' : 'below';
  const age = staleness(subject.bars);
  return {
    state: age.state,
    read: `${structure}; last close ${Math.abs(vs200).toFixed(1)}% ${side} its 200-session average.`,
    asOf: age.asOf,
    provenance: 'same-origin-snapshot',
    gapReason: age.gapReason,
    metrics: {
      lastClose: Number(last.toFixed(4)),
      ma20: Number(ma20.toFixed(4)),
      ma50: Number(ma50.toFixed(4)),
      ma200: Number(ma200.toFixed(4)),
      percentVs200: Number(vs200.toFixed(4)),
      structure: stacked ? 'bull' : inverted ? 'bear' : 'mixed'
    }
  };
}

/* domain -> the tool whose read this producer emits. The matrix walks its own
   registry-derived precedence and takes the first tool that has a read.

   `fundamentals` and `catalyst` have no producer because no statement or event data is
   committed. `gaps` has none for a different reason: eight unrelated tools claim that domain
   and NOTHING in the registry defines what it means, so any read would be inventing a
   semantic. All three stay explicit gaps, which is the honest state. */
const PRODUCERS = [
  { toolId: 'volatility-sizing-lab', domainId: 'volatility', build: volatilityRead },
  { toolId: 'swing-structure-lab', domainId: 'technical', build: technicalRead },
  { toolId: 'etf-momentum-lab', domainId: 'macro-rotation', build: macroRotationRead },
  { toolId: 'options-structure-lab', domainId: 'options', build: optionsRead }
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
      /* A tool owns several matrix domains. Without this the matrix would serve one read into
         all of them — the options implied move rendered as the technical cell too. */
      read.domainId = producer.domainId;
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
