/*
 * Resolve dependency-gate state at BUILD time into a public artifact.
 *
 * Why this exists: `tool-experience.config.json` declares each gate's source of
 * truth as `statePath` — a governance file under `specs/`. The browser used to
 * fetch those paths directly, which works when the repo root is served but 404s
 * on GitHub Pages, because `scripts/build-pages-site.mjs` deliberately ships
 * only public product surfaces and never `specs/`.
 *
 * A 404 degrades to `null`, and a null state can satisfy no predicate, so every
 * gate silently evaluated as pending on the deployed site. Capabilities that
 * were genuinely delivered (BUG-004 and Feature 002 are both done/done) were
 * withheld from real users, and every visit issued one failed request per gate.
 *
 * A gate verdict is a property of the committed tree, not of the visitor, so it
 * is resolved here and published as a minimal projection: exactly the four
 * fields `evaluateDependencyGatesInternal` reads. Governance detail stays
 * private; the deployed product tells the truth.
 *
 *   CLI: node scripts/build-dependency-gates.mjs [--check] [--dry-run] [--root <path>]
 *        --check   exit 1 if the committed artifact has drifted from source
 *        --dry-run print the projection, write nothing
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

export const GATES_FILE = 'tool-experience.gates.json';
const CONTRACT = 'tool-experience-dependency-gates/v1';

const readJson = (root, relative) => JSON.parse(readFileSync(join(root, relative), 'utf8'));

/* Only the fields the runtime predicate reads. Anything else would leak
   governance state into a public artifact without a consumer. */
function projectState(state) {
  const certification = state && typeof state.certification === 'object' && state.certification ? state.certification : {};
  const projection = {
    status: typeof state.status === 'string' ? state.status : null,
    certification: { status: typeof certification.status === 'string' ? certification.status : null }
  };
  if (Array.isArray(state.milestones)) projection.milestones = state.milestones.slice();
  if (Array.isArray(state.evidenceIds)) projection.evidenceIds = state.evidenceIds.slice();
  return projection;
}

export function buildDependencyGates(root) {
  const config = readJson(root, 'tool-experience.config.json');
  const gates = config && config.dependencyGates;
  if (!gates || typeof gates !== 'object') throw new Error('tool-experience.config.json declares no dependencyGates');

  const states = {};
  const sources = {};
  for (const key of Object.keys(gates).sort()) {
    const gate = gates[key];
    if (typeof gate.statePath !== 'string' || !gate.statePath) throw new Error(`gate ${key} declares no statePath`);
    states[key] = projectState(readJson(root, gate.statePath));
    sources[key] = gate.statePath;
  }
  return { contractVersion: CONTRACT, sources, states };
}

export function serializeDependencyGates(document) {
  return JSON.stringify(document, null, 2) + '\n';
}

function mainCli(argv) {
  const args = argv.slice(2);
  const rootIndex = args.indexOf('--root');
  const root = resolve(rootIndex === -1 ? process.cwd() : args[rootIndex + 1]);
  const serialized = serializeDependencyGates(buildDependencyGates(root));

  if (args.includes('--dry-run')) { process.stdout.write(serialized); return 0; }

  if (args.includes('--check')) {
    let committed = null;
    try { committed = readFileSync(join(root, GATES_FILE), 'utf8'); } catch { /* absent */ }
    if (committed === serialized) { console.log(`[dependency-gates] ${GATES_FILE} is current`); return 0; }
    console.error(`[dependency-gates] ${GATES_FILE} is STALE — re-run: node scripts/build-dependency-gates.mjs`);
    return 1;
  }

  writeFileSync(join(root, GATES_FILE), serialized);
  const document = JSON.parse(serialized);
  for (const key of Object.keys(document.states)) {
    const state = document.states[key];
    console.log(`[dependency-gates] ${key}: status=${state.status} certification=${state.certification.status}`);
  }
  console.log(`[dependency-gates] wrote ${GATES_FILE}`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  process.exit(mainCli(process.argv));
}
