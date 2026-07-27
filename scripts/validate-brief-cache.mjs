#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const DATA_ROOT = resolve(ROOT, 'data');
const errors = [];
let jsonCount = 0;
const REQUIRE_CURRENT_RUN = process.argv.includes('--require-current-run');
const EXPECTED_WINDOW = process.env.BRIEF_WINDOW || null;
const EXPECTED_DATE = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());
const XNYS_CALENDAR = join(DATA_ROOT, 'calendars', 'xnys', 'calendar.json');

function latestCompletedSessionDate() {
  if (process.env.BAR_EXPECTED_SESSION_DATE) return process.env.BAR_EXPECTED_SESSION_DATE;
  if (!existsSync(XNYS_CALENDAR)) return null;
  try {
    const calendar = JSON.parse(readFileSync(XNYS_CALENDAR, 'utf8'));
    const now = Date.now();
    const rows = (calendar.rows || []).filter((row) =>
      (row.dateState === 'regular' || row.dateState === 'early-close')
      && row.regular
      && Number.isFinite(Date.parse(row.regular.endUtc))
      && Date.parse(row.regular.endUtc) <= now
    );
    return rows.length ? rows[rows.length - 1].tradingDate : null;
  } catch {
    return null;
  }
}
function isSessionBoundSymbol(sym) {
  return typeof sym === 'string' && !sym.endsWith('-USD') && !sym.endsWith('=X');
}

function readJson(path) {
  try {
    jsonCount += 1;
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    errors.push(`${path.slice(ROOT.length + 1)} is invalid JSON: ${error.message}`);
    return null;
  }
}

function walk(path) {
  for (const entry of readdirSync(path)) {
    const child = join(path, entry);
    if (statSync(child).isDirectory()) walk(child);
    else if (entry.endsWith('.json')) readJson(child);
  }
}

function validateIndex(kind) {
  const directory = join(DATA_ROOT, kind);
  const indexPath = join(directory, 'index.json');
  if (!existsSync(indexPath)) {
    if (REQUIRE_CURRENT_RUN) errors.push(`data/${kind}/index.json is required for a complete scheduled run`);
    return;
  }
  const index = readJson(indexPath);
  if (!index) return;
  if (!Array.isArray(index.tickers)) {
    errors.push(`data/${kind}/index.json tickers must be an array`);
    return;
  }
  if (index.count !== index.tickers.length) errors.push(`data/${kind}/index.json count does not match tickers length`);
  if (REQUIRE_CURRENT_RUN) {
    if (!EXPECTED_WINDOW) errors.push('BRIEF_WINDOW is required with --require-current-run');
    if (index.refreshDate !== EXPECTED_DATE) errors.push(`data/${kind}/index.json refreshDate must equal ${EXPECTED_DATE}`);
    if (index.refreshWindow !== EXPECTED_WINDOW) errors.push(`data/${kind}/index.json refreshWindow must equal ${EXPECTED_WINDOW}`);
    if (!Number.isInteger(index.expected) || index.expected <= 0) errors.push(`data/${kind}/index.json expected must be a positive integer`);
    if (index.count !== index.expected) errors.push(`data/${kind}/index.json count ${index.count} does not match expected ${index.expected}`);
    if (index.freshCount !== index.expected) errors.push(`data/${kind}/index.json freshCount ${index.freshCount} does not match expected ${index.expected}`);
    if (index.carriedCount !== 0) errors.push(`data/${kind}/index.json carriedCount must be 0 for a complete scheduled run`);
    if (!Array.isArray(index.missing) || index.missing.length !== 0) errors.push(`data/${kind}/index.json missing must be an empty array`);
    if (kind === 'bars') {
      const expectedSessionDate = latestCompletedSessionDate() || index.expectedSessionDate || null;
      if (!expectedSessionDate) errors.push('data/bars/index.json cannot resolve expectedSessionDate');
      if (index.expectedSessionDate !== expectedSessionDate) errors.push(`data/bars/index.json expectedSessionDate must equal ${expectedSessionDate}`);
      if (!Number.isInteger(index.reconstructedCount) || index.reconstructedCount < 0) errors.push('data/bars/index.json reconstructedCount must be a non-negative integer');
      if (!Number.isInteger(index.sessionReuseCount) || index.sessionReuseCount < 0) errors.push('data/bars/index.json sessionReuseCount must be a non-negative integer');
      const reconstructedCount = index.tickers.filter((row) => row && row.reconstructed).length;
      const sessionReuseCount = index.tickers.filter((row) => row && row.sessionCached).length;
      if (index.reconstructedCount !== reconstructedCount) errors.push(`data/bars/index.json reconstructedCount ${index.reconstructedCount} does not match ticker receipts ${reconstructedCount}`);
      if (index.sessionReuseCount !== sessionReuseCount) errors.push(`data/bars/index.json sessionReuseCount ${index.sessionReuseCount} does not match ticker receipts ${sessionReuseCount}`);
      for (const row of index.tickers) {
        if (row && isSessionBoundSymbol(row.sym) && row.asof !== expectedSessionDate) errors.push(`data/bars/index.json ${row.sym} asof ${row.asof || '<missing>'} must equal completed XNYS session ${expectedSessionDate}`);
      }
    }
  }
  for (const row of index.tickers) {
    if (!row || typeof row.sym !== 'string' || !row.sym.trim()) {
      errors.push(`data/${kind}/index.json contains an invalid ticker row`);
      continue;
    }
    if (!existsSync(join(directory, `${row.sym}.json`))) errors.push(`data/${kind}/${row.sym}.json is missing`);
  }
}

if (!existsSync(DATA_ROOT) || !statSync(DATA_ROOT).isDirectory()) {
  errors.push('data directory is missing');
} else {
  walk(DATA_ROOT);
  validateIndex('bars');
  validateIndex('options');
}

if (jsonCount === 0) errors.push('data cache contains no JSON files');

if (errors.length) {
  console.error('[brief-cache] FAIL');
  for (const error of errors) console.error('  - ' + error);
  process.exit(1);
}

console.log(`[brief-cache] PASS: ${jsonCount} JSON cache files parsed; indexes are coherent${REQUIRE_CURRENT_RUN ? ` and complete for ${EXPECTED_DATE}/${EXPECTED_WINDOW}` : ''}`);
