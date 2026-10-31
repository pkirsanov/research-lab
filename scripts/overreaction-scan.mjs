#!/usr/bin/env node
/* Overreaction snap-back scan over the committed corpus — the same rloverreaction.js rules the
 * Swing Structure Lab runs in the browser, so a research run can see which fresh drops still need
 * a sourced cause / revisions / credit record in data/overreaction/evidence.json.
 *
 *   node scripts/overreaction-scan.mjs            # human-readable
 *   node scripts/overreaction-scan.mjs --json     # machine-readable
 *   node scripts/overreaction-scan.mjs --validate # validate the evidence file only (exit 1 on error)
 *
 * Reads data/bars/<SYM>.json, data/bars/live.json, sector-universe.json, the XNYS calendar and the
 * evidence file. Never fetches. */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const R = createRequire(import.meta.url)('../rloverreaction.js');
const args = new Set(process.argv.slice(2));

function readJSON(path, fallback) {
  const full = resolve(ROOT, path);
  if (!existsSync(full)) return fallback;
  return JSON.parse(readFileSync(full, 'utf8'));
}

export const EVIDENCE_PATH = 'data/overreaction/evidence.json';

export function loadEvidence() {
  const doc = readJSON(EVIDENCE_PATH, null);
  return { doc, check: doc ? R.validateEvidence(doc) : { ok: false, errors: [EVIDENCE_PATH + ': missing'] } };
}

export function scanUniverse({ nowMs = Date.now() } = {}) {
  const uni = readJSON('sector-universe.json', { sectorMap: {} });
  const live = readJSON('data/bars/live.json', { quotes: {} });
  const calendar = readJSON('data/calendars/xnys/calendar.json', { rows: [] });
  const session = (calendar.rows || []).find((row) => row.regular && Date.parse(row.regular.startUtc) <= nowMs && nowMs < Date.parse(row.regular.endUtc)) || null;
  const cache = {};
  const rowsFor = (sym) => {
    if (!(sym in cache)) { const j = readJSON('data/bars/' + sym + '.json', null); cache[sym] = j && Array.isArray(j.rows) ? j.rows : null; }
    return cache[sym];
  };
  const progressFor = (q) => {
    if (!q || !session || q.sessionDate !== session.tradingDate) return null;
    return R.sessionProgress(Date.parse(q.asOf), Date.parse(session.regular.startUtc), Date.parse(session.regular.endUtc));
  };
  const { doc } = loadEvidence();
  const out = R.scanUniverse({ sectorMap: uni.sectorMap, rowsFor, quoteFor: (sym) => (live.quotes || {})[sym] || null, progressFor, benchSym: 'SPY', nowMs, sessionLive: !!session, vix: null, evidence: doc });
  return { ...out, sessionLive: !!session, liveQuotes: Object.keys(live.quotes || {}).length, liveUpdated: live.updated || null };
}

function pct(x) { return Number.isFinite(x) ? (x * 100).toFixed(1) + '%' : '—'; }

if (import.meta.url === 'file://' + process.argv[1]) {
  const { check } = loadEvidence();
  if (args.has('--validate')) {
    if (!check.ok) { console.error('[overreaction-evidence] FAIL\n  ' + check.errors.join('\n  ')); process.exit(1); }
    console.log('[overreaction-evidence] PASS');
    process.exit(0);
  }
  const out = scanUniverse();
  if (args.has('--json')) { console.log(JSON.stringify({ evidenceValid: check.ok, evidenceErrors: check.errors, ...out }, null, 2)); process.exit(0); }
  console.log(`scanned ${out.scanned} stocks · session ${out.sessionLive ? 'LIVE' : 'closed'} · live quotes ${out.liveQuotes} (updated ${out.liveUpdated || 'never'})`);
  const br = out.baseRate;
  console.log(`mechanical base rate (${br.cohort}): ${br.hits}/${br.n} hit T1 before stop` + (br.n ? ` = ${pct(br.rate)} vs breakeven ${pct(br.breakeven)}` : '') + (br.sufficient ? '' : ' — below the 30-analog minimum'));
  if (!check.ok) console.log('evidence file invalid: ' + check.errors.join('; '));
  if (!out.results.length) { console.log('no qualifying drops in the last ' + R.POLICY.lookbackSessions + ' sessions'); process.exit(0); }
  for (const { candidate: c, evidence, evaluation: e } of out.results) {
    console.log(`\n${e.show ? 'SHOW ' : '     '}${c.symbol} ${c.shockDate}${c.shockLive ? ' (live)' : ''}  move ${pct(c.shock.move)} residual ${pct(c.shock.residual)} vs ${c.shock.refSym || '—'}  RVOL ${c.shock.rvol.toFixed(1)}  state ${c.post.state}`);
    console.log(`     verdict ${e.verdict} · confidence ${e.confidence} · ${evidence ? 'evidence on file' : e.needsEvidence ? 'NEEDS EVIDENCE (cause, revisions, credit) — passes every price gate' : 'no evidence (fails on price alone)'}${e.firstFailure ? ' · first failure: ' + e.firstFailure : ''}`);
  }
}
