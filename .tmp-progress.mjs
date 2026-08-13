import { readFileSync, writeFileSync } from 'node:fs';
const path = 'specs/008-portfolio-survival-and-brief-lab/state.json';
const target = Number(process.argv[2]);
const status = process.argv[3];
const s = JSON.parse(readFileSync(path, 'utf8'));
for (const holder of [s.execution, s.certification]) {
  const row = holder.scopeProgress.find((r) => Number(r.scope) === target);
  if (!row) throw new Error('scope row missing: ' + target);
  row.status = status;
}
if (process.argv[4]) s.execution.currentScope = Number(process.argv[4]);
writeFileSync(path, JSON.stringify(s, null, 2) + '\n');
console.log('scope', target, '->', status, 'currentScope', s.execution.currentScope);
