#!/usr/bin/env node
/*
 * measure-provenance-exposure.mjs — Spec 028 Scope 1, TP-028-01.
 *
 * Answers the question design.md poses before any provenance mechanism is chosen: how often does a
 * PUBLISHED row (a timestamp already committed under data/bars/<SYMBOL>.json) come back from the
 * vendor with a DIFFERENT value on replay?
 *
 * This script is READ-ONLY by construction. It never calls writeFileSync and never touches
 * data/bars/*.json. It re-fetches the same 2y daily-bar payload fetch-bars.mjs would fetch, applies
 * the SAME basis rule trimBars uses (o/h/l/c raw, adjusted close carried separately as `ac`), and
 * compares the freshly-fetched row for each already-published timestamp against the committed row
 * for that timestamp. It reports two counts, not one, because they mean different things:
 *
 *   - legacyBasisChanges: the committed row itself is INCOHERENT (fails the same o/h/l/c ordering
 *     invariant validate-bars-coherence.mjs enforces). Any value drift on such a row is consistent
 *     with the mixed-basis arithmetic BUG-012 removed from the writer, not with a vendor
 *     restatement of a properly-written row.
 *   - restatedValueChanges: the committed row IS coherent (already written on the Option B raw
 *     basis) and the vendor nonetheless returned a different o/h/l/c/v on replay. This is the
 *     residual exposure design.md's decision must actually cover.
 *
 * Usage:  node scripts/measure-provenance-exposure.mjs [--limit=N] [--symbols=A,B,C]
 * Exit:   0 on a completed measurement (any counts), 1 on a fetch/parse failure that stops the run
 *         before it produces a trustworthy count.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCoherentBar } from './validate-bars-coherence.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BARS_DIR = join(ROOT, 'data', 'bars');
const NON_SYMBOL_FILES = new Set(['index.json']);

const LIMIT = (() => {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  const n = arg ? Number(arg.slice('--limit='.length)) : null;
  return Number.isInteger(n) && n > 0 ? n : null;
})();
const ONLY_SYMBOLS = (() => {
  const arg = process.argv.find((a) => a.startsWith('--symbols='));
  return arg ? new Set(arg.slice('--symbols='.length).split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)) : null;
})();
const FETCH_TIMEOUT_MS = 20000;
const FETCH_ATTEMPTS = 3;
const FETCH_RETRY_BASE_MS = 500;
const FETCH_CONCURRENCY = 4;

function readJSON(f, fallback) { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return fallback; } }

function corpusHash() {
  const hash = createHash('sha256');
  for (const name of listSymbolFiles()) hash.update(name + ':' + readFileSync(join(BARS_DIR, name)));
  return hash.digest('hex');
}
function listSymbolFiles() {
  return readdirSync(BARS_DIR).filter((n) => n.endsWith('.json') && !NON_SYMBOL_FILES.has(n)).sort();
}

async function getJSON(url) {
  let lastError = null;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (research-lab bars snapshot)' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
      });
      if (r.ok) return r.json();
      lastError = new Error('HTTP ' + r.status);
      if (r.status !== 429 && (r.status < 500 || r.status >= 600)) throw lastError;
    } catch (error) {
      lastError = error;
    }
    if (attempt < FETCH_ATTEMPTS) await new Promise((resolveDelay) => setTimeout(resolveDelay, FETCH_RETRY_BASE_MS * attempt));
  }
  throw lastError || new Error('request failed');
}

function sessionDateFromMs(value) {
  return Number.isFinite(value) ? new Date(value).toISOString().slice(0, 10) : null;
}

/* Same basis rule as fetch-bars.mjs trimBars — duplicated rather than imported, because this
   script must not import anything from the ingestion write path (Scope 1's Change Boundary
   excludes that path from being touched, and importing from it would make this measurement's
   correctness depend on a file this packet is not allowed to modify or reason about jointly). */
function trimBarsReadOnly(j) {
  const r = j && j.chart && j.chart.result && j.chart.result[0];
  if (!r || !r.timestamp) return null;
  const ts = r.timestamp, q = (r.indicators && r.indicators.quote && r.indicators.quote[0]) || {};
  const adj = (r.indicators.adjclose && r.indicators.adjclose[0] && r.indicators.adjclose[0].adjclose) || null;
  const byTimestamp = new Map();
  for (let i = 0; i < ts.length; i++) {
    const hasRawQuotes = !!q.close;
    const rawClose = hasRawQuotes ? q.close[i] : null;
    const adjClose = adj && Number.isFinite(adj[i]) ? adj[i] : null;
    const c = Number.isFinite(rawClose) ? rawClose : (hasRawQuotes ? null : adjClose);
    if (!Number.isFinite(c)) continue;
    const row = { t: ts[i] * 1000, o: q.open ? q.open[i] : c, h: q.high ? q.high[i] : c, l: q.low ? q.low[i] : c, c, v: (q.volume ? q.volume[i] : 0) || 0 };
    if (Number.isFinite(adjClose)) row.ac = adjClose;
    byTimestamp.set(row.t, row);
  }
  return byTimestamp;
}

function valuesDiffer(a, b) {
  const fields = ['o', 'h', 'l', 'c', 'v'];
  return fields.some((f) => Number(a[f]) !== Number(b[f]));
}

async function measureSymbol(sym) {
  const existing = readJSON(join(BARS_DIR, sym + '.json'), null);
  const existingRows = existing && Array.isArray(existing.rows) ? existing.rows : [];
  if (!existingRows.length) return { sym, publishedRows: 0, legacyBasisChanges: 0, restatedValueChanges: 0, unreplayable: 0, error: null };

  let fresh;
  try {
    const daily = await getJSON('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(sym) + '?interval=1d&range=2y&includeAdjustedClose=true&events=div%2Csplits');
    fresh = trimBarsReadOnly(daily);
  } catch (error) {
    return { sym, publishedRows: existingRows.length, legacyBasisChanges: 0, restatedValueChanges: 0, unreplayable: existingRows.length, error: String(error && error.message || error) };
  }
  if (!fresh) return { sym, publishedRows: existingRows.length, legacyBasisChanges: 0, restatedValueChanges: 0, unreplayable: existingRows.length, error: 'vendor returned no replayable series' };

  let legacyBasisChanges = 0, restatedValueChanges = 0, unreplayable = 0;
  const legacyExamples = [], restatedExamples = [];
  for (const row of existingRows) {
    const freshRow = fresh.get(row.t);
    if (!freshRow) { unreplayable++; continue; }
    if (!valuesDiffer(row, freshRow)) continue;
    if (isCoherentBar(row)) {
      restatedValueChanges++;
      if (restatedExamples.length < 3) restatedExamples.push({ t: sessionDateFromMs(row.t), was: row, now: freshRow });
    } else {
      legacyBasisChanges++;
      if (legacyExamples.length < 3) legacyExamples.push({ t: sessionDateFromMs(row.t), was: row, now: freshRow });
    }
  }
  return { sym, publishedRows: existingRows.length, legacyBasisChanges, restatedValueChanges, unreplayable, error: null, legacyExamples, restatedExamples };
}

async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const hashBefore = corpusHash();

  let symbols = listSymbolFiles().map((n) => n.slice(0, -'.json'.length));
  if (ONLY_SYMBOLS) symbols = symbols.filter((s) => ONLY_SYMBOLS.has(s.toUpperCase()));
  if (LIMIT) symbols = symbols.slice(0, LIMIT);

  console.log('measure-provenance-exposure: replaying ' + symbols.length + ' symbol file(s), read-only');
  const results = await mapWithConcurrency(symbols, FETCH_CONCURRENCY, measureSymbol);

  const hashAfter = corpusHash();
  const nonMutating = hashBefore === hashAfter;

  let totalPublished = 0, totalLegacy = 0, totalRestated = 0, totalUnreplayable = 0;
  const errors = [];
  const legacyExamples = [], restatedExamples = [];
  for (const r of results) {
    totalPublished += r.publishedRows;
    totalLegacy += r.legacyBasisChanges;
    totalRestated += r.restatedValueChanges;
    totalUnreplayable += r.unreplayable;
    if (r.error) errors.push({ sym: r.sym, error: r.error });
    if (r.legacyExamples) legacyExamples.push(...r.legacyExamples.map((e) => ({ sym: r.sym, ...e })));
    if (r.restatedExamples) restatedExamples.push(...r.restatedExamples.map((e) => ({ sym: r.sym, ...e })));
  }

  const summary = {
    symbolsMeasured: symbols.length,
    publishedRowsChecked: totalPublished,
    legacyBasisChanges: totalLegacy,
    restatedValueChanges: totalRestated,
    unreplayableRows: totalUnreplayable,
    fetchErrors: errors.length,
    corpusHashBefore: hashBefore,
    corpusHashAfter: hashAfter,
    nonMutating,
    errors: errors.slice(0, 10),
    legacyExampleSample: legacyExamples.slice(0, 5),
    restatedExampleSample: restatedExamples.slice(0, 5)
  };

  console.log(JSON.stringify(summary, null, 2));

  if (!nonMutating) {
    console.error('FAIL: corpus hash changed across the measurement run — this script must never write to data/bars');
    process.exit(1);
  }
  if (symbols.length === 0) {
    console.error('FAIL: no symbol files found to measure — vacuous run');
    process.exit(1);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('measure-provenance-exposure crashed: ' + (error && error.stack || error));
  process.exit(1);
});
