#!/usr/bin/env node
// sync-inline-tool-dates.mjs
// Keep the inline TOOLS array in index.html in sync with tools.json.
//
// tools.json is the machine-readable manifest. The refresh bot
// (.github/workflows/tools-refresh.yml) updates it 4x/day from each tool
// file's mtime, but it never touched the inline array the landing page
// renders from — so the two drifted apart (28 of 29 dates stale) and the
// Pages verify step started failing on the mismatch.
//
// This script patches only the `updated:` value of each inline entry whose
// id exists in tools.json, and leaves anything else alone (including the
// commented-out 'next-tool' template). It warns about ids present in one
// source but not the other without failing, so the refresh bot stays
// resilient; the Pages verify gate remains the enforcer of consistency.
//
// Usage: node scripts/sync-inline-tool-dates.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8'));
const byId = new Map(manifest.tools.map((t) => [t.id, t.updated]));

const indexPath = resolve(ROOT, 'index.html');
const html = readFileSync(indexPath, 'utf8');

let updated = 0;
let current = 0;
const unknown = new Set();
const seen = new Set();
const patched = html.replace(
  /id:\s*'([^']+)'[^}]*?updated:\s*'([^']*)'/g,
  (match, id, oldDate) => {
    seen.add(id);
    const next = byId.get(id);
    if (next === undefined) {
      unknown.add(id);
      return match;
    }
    if (next === oldDate) {
      current += 1;
      return match;
    }
    updated += 1;
    return match.replace(`updated: '${oldDate}'`, `updated: '${next}'`);
  },
);

for (const id of byId.keys()) {
  if (!seen.has(id)) {
    console.warn(`sync-inline-tool-dates: tools.json id '${id}' has no inline entry in index.html`);
  }
}
for (const id of unknown) {
  console.warn(`sync-inline-tool-dates: inline entry '${id}' is not in tools.json, left unchanged`);
}
if (patched !== html) writeFileSync(indexPath, patched, 'utf8');
console.log(`sync-inline-tool-dates: updated ${updated}, already current ${current}, unknown ${unknown.size}`);
