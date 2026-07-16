#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = process.cwd();
const DATA_ROOT = resolve(ROOT, 'data');
const errors = [];
let jsonCount = 0;

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
  if (!existsSync(indexPath)) return;
  const index = readJson(indexPath);
  if (!index) return;
  if (!Array.isArray(index.tickers)) {
    errors.push(`data/${kind}/index.json tickers must be an array`);
    return;
  }
  if (index.count !== index.tickers.length) errors.push(`data/${kind}/index.json count does not match tickers length`);
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

console.log(`[brief-cache] PASS: ${jsonCount} JSON cache files parsed and available indexes are coherent`);
