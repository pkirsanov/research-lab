#!/usr/bin/env node
/* Portfolio review: spec status + DoD completion, derived from artifacts on disk. */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SPECS = 'specs';
const countIn = (file, re) => {
  try { return (readFileSync(file, 'utf8').match(re) || []).length; } catch { return 0; }
};

const rows = [];
for (const name of readdirSync(SPECS).sort()) {
  const dir = join(SPECS, name);
  if (!existsSync(join(dir, 'state.json'))) continue;
  let status = '(unreadable)';
  try { status = JSON.parse(readFileSync(join(dir, 'state.json'), 'utf8')).status ?? '(none)'; } catch { }

  const scopeFiles = [];
  const scopesDir = join(dir, 'scopes');
  if (existsSync(scopesDir)) {
    for (const entry of readdirSync(scopesDir)) {
      const f = join(scopesDir, entry, 'scope.md');
      if (existsSync(f)) scopeFiles.push(f);
    }
  }
  if (!scopeFiles.length && existsSync(join(dir, 'scopes.md'))) scopeFiles.push(join(dir, 'scopes.md'));

  let done = 0, open = 0;
  for (const f of scopeFiles) {
    done += countIn(f, /^- \[x\]/gm);
    open += countIn(f, /^- \[ \]/gm);
  }
  rows.push({ name, status, done, total: done + open });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(pad('SPEC', 54) + pad('STATUS', 16) + 'DoD');
for (const r of rows) {
  const pct = r.total ? Math.round((r.done / r.total) * 100) : 0;
  console.log(pad(r.name, 54) + pad(r.status, 16) + `${r.done}/${r.total} (${pct}%)`);
}
const open = rows.filter((r) => !['done', 'blocked'].includes(r.status));
console.log(`\ntotal specs: ${rows.length}`);
console.log(`terminal (done|blocked): ${rows.length - open.length}`);
console.log(`NON-TERMINAL: ${open.length}${open.length ? ' -> ' + open.map((r) => `${r.name}[${r.status}]`).join(', ') : ''}`);
