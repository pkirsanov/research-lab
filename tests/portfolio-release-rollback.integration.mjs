import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  createReadStream,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const TITLE = 'Regression: TP-16-14 SCN-008-036 disposable shared-release rollback and restore preserve exact bytes and existing consumers';
const ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const GIT_ROOT = realpathSync(resolve(ROOT, '.git'));
const FEATURE_ID = 'portfolio-survival-allocation-lab';
const FEATURE_ROUTE = `${FEATURE_ID}.html`;
const FEATURE_NOTE = `notes/${FEATURE_ID}.md`;
const PROFILE_SENTINEL_KEY = 'rlTp1614PersonalStorageSentinel';
const PROFILE_SENTINEL_VALUE = 'tp-16-14-personal-state-preserved';

const WHOLE_RELEASE_PATHS = Object.freeze([
  FEATURE_ROUTE,
  'portfolio-survival-allocation.config.json',
  'rlportfolio.js',
  'rlportfolioanalytics.js',
  'rlportfoliobrief.js',
  'rlexperience-adapters/portfolio-research.js',
  FEATURE_NOTE
]);

const SHARED_RELEASE_PATHS = Object.freeze([
  'README.md',
  'index.html',
  'journeys.json',
  'rldata.js',
  'rlnav.js',
  'scripts/selftest.mjs',
  'scripts/validate-tool-experience.mjs',
  'simple-models.json',
  'tool-experience.config.json',
  'tools.json'
]);

const CANARY_SUPPORT_PATHS = Object.freeze([
  'rlapp.js',
  'rlticker.js',
  'rlviews.js'
]);

const EXISTING_CONSUMERS = Object.freeze([
  { id: 'causal-rotation-lab', file: 'causal-rotation-lab.html' },
  { id: 'bond-regime-lab', file: 'bond-regime-lab.html' },
  { id: 'fx-regime-relative-value-lab', file: 'fx-regime-relative-value-lab.html' },
  { id: 'palm-springs-rental-market-lab', file: 'palm-springs-rental-market-lab.html' },
  { id: 'trend-dynamics-cycle-lab', file: 'trend-dynamics-cycle-lab.html' },
  { id: 'technical-analysis-decision-lab', file: 'technical-analysis-decision-lab.html' }
]);

const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8'
});

function isInside(parent, candidate) {
  return candidate === parent || candidate.startsWith(parent + sep);
}

function assertIsolatedRoot(root, label) {
  const actual = realpathSync(root);
  assert.equal(isInside(ROOT, actual), false, `${label} must not be inside the canonical checkout`);
  assert.equal(isInside(actual, ROOT), false, `${label} must not contain the canonical checkout`);
  assert.equal(isInside(GIT_ROOT, actual), false, `${label} must not be inside canonical .git`);
  assert.equal(isInside(actual, GIT_ROOT), false, `${label} must not contain canonical .git`);
  return actual;
}

function assertRelativePath(relativePath) {
  assert.equal(typeof relativePath, 'string');
  assert.notEqual(relativePath, '');
  assert.equal(relativePath.startsWith('/'), false, `absolute path refused: ${relativePath}`);
  assert.equal(relativePath.split(/[\\/]/).includes('..'), false, `traversal path refused: ${relativePath}`);
  assert.doesNotMatch(relativePath, /(^|\/)(?:\.git|specs|monitoring|backups?|deploy)(?:\/|$)/i);
  assert.doesNotMatch(relativePath, /(?:^|\/)manifest\.ya?ml$/i);
}

function safeMirrorPath(mirrorRoot, relativePath) {
  assertRelativePath(relativePath);
  const target = resolve(mirrorRoot, relativePath);
  assert.equal(isInside(mirrorRoot, target), true, `mirror path escaped: ${relativePath}`);
  assert.equal(isInside(ROOT, target), false, `mirror target entered canonical checkout: ${relativePath}`);
  assert.equal(isInside(GIT_ROOT, target), false, `mirror target entered canonical .git: ${relativePath}`);
  return target;
}

function listFiles(root, relativeDirectory = '') {
  const absoluteDirectory = resolve(root, relativeDirectory);
  if (!existsSync(absoluteDirectory)) return [];
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const relativePath = relativeDirectory ? join(relativeDirectory, entry.name) : entry.name;
      if (entry.isDirectory()) return listFiles(root, relativePath);
      assert.equal(entry.isSymbolicLink(), false, `mirror must not contain a symlink: ${relativePath}`);
      return entry.isFile() ? [relativePath] : [];
    });
}

function featureTestPaths() {
  return readdirSync(resolve(ROOT, 'tests'), { withFileTypes: true })
    .filter((entry) => entry.isFile() && /^portfolio-.*\.mjs$/.test(entry.name))
    .map((entry) => join('tests', entry.name))
    .sort();
}

function featureFixturePaths() {
  return listFiles(resolve(ROOT, 'tests/fixtures/portfolio-survival-allocation'))
    .map((relativePath) => join('tests/fixtures/portfolio-survival-allocation', relativePath));
}

function copyFileIntoMirror(mirrorRoot, relativePath) {
  const source = resolve(ROOT, relativePath);
  const target = safeMirrorPath(mirrorRoot, relativePath);
  assert.equal(existsSync(source), true, `required mirror source missing: ${relativePath}`);
  assert.equal(statSync(source).isFile(), true, `required mirror source is not a file: ${relativePath}`);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  assert.equal(lstatSync(target).isSymbolicLink(), false, `copied mirror path became a symlink: ${relativePath}`);
  assert.equal(isInside(mirrorRoot, realpathSync(target)), true, `copied mirror path resolved outside mirror: ${relativePath}`);
}

function minimumMirrorPaths() {
  const paths = [
    ...WHOLE_RELEASE_PATHS,
    ...SHARED_RELEASE_PATHS,
    ...CANARY_SUPPORT_PATHS,
    ...EXISTING_CONSUMERS.map(({ file }) => file),
    ...featureTestPaths(),
    ...featureFixturePaths()
  ];
  return [...new Set(paths)].sort();
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function inventory(root) {
  return new Map(listFiles(root).map((relativePath) => [
    relativePath,
    readFileSync(resolve(root, relativePath))
  ]));
}

function inventoryDifferences(expected, actual) {
  const paths = [...new Set([...expected.keys(), ...actual.keys()])].sort();
  return paths.filter((relativePath) => {
    const left = expected.get(relativePath);
    const right = actual.get(relativePath);
    return !left || !right || !left.equals(right);
  });
}

function assertInventory(expected, actual, label) {
  const differences = inventoryDifferences(expected, actual);
  assert.deepEqual(differences, [], `${label} changed unexpected bytes: ${differences.join(', ')}`);
}

function uniqueIndex(source, needle, label) {
  const first = source.indexOf(needle);
  assert.notEqual(first, -1, `${label} anchor is missing`);
  assert.equal(source.indexOf(needle, first + needle.length), -1, `${label} anchor is not unique`);
  return first;
}

function objectRanges(source) {
  const ranges = [];
  const stack = [];
  let quote = null;
  let escaped = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote !== null) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') stack.push(index);
    if (char === '}') {
      const start = stack.pop();
      assert.notEqual(start, undefined, 'object scanner found an unmatched closing brace');
      ranges.push({ start, end: index + 1 });
    }
  }
  assert.equal(quote, null, 'object scanner found an unterminated string');
  assert.equal(stack.length, 0, 'object scanner found an unterminated object');
  return ranges;
}

function elementRangeContaining(source, needle, label) {
  const anchor = uniqueIndex(source, needle, label);
  const containing = objectRanges(source)
    .filter(({ start, end }) => start < anchor && anchor < end)
    .sort((left, right) => (left.end - left.start) - (right.end - right.start));
  assert.ok(containing.length > 0, `${label} is not inside an object`);
  const object = containing[0];
  let next = object.end;
  while (/\s/.test(source[next] || '')) next += 1;
  if (source[next] === ',') return { start: object.start, end: next + 1 };
  let previous = object.start - 1;
  while (/\s/.test(source[previous] || '')) previous -= 1;
  assert.equal(source[previous], ',', `${label} object has no array delimiter`);
  return { start: previous, end: object.end };
}

function lineRangeContaining(source, needle, label) {
  const anchor = uniqueIndex(source, needle, label);
  const start = source.lastIndexOf('\n', anchor) + 1;
  const newline = source.indexOf('\n', anchor);
  return { start, end: newline === -1 ? source.length : newline + 1 };
}

function statementRangeContaining(source, needle, label) {
  const anchor = uniqueIndex(source, needle, label);
  const start = source.lastIndexOf('  assert(', anchor);
  assert.notEqual(start, -1, `${label} assertion start is missing`);
  const ending = source.indexOf(');\n', anchor);
  assert.notEqual(ending, -1, `${label} assertion end is missing`);
  return { start, end: ending + 3 };
}

function blockRange(source, startNeedle, endNeedle, label) {
  const start = uniqueIndex(source, startNeedle, `${label} start`);
  const end = uniqueIndex(source, endNeedle, `${label} end`);
  assert.ok(start < end, `${label} markers are reversed`);
  return { start, end };
}

function inclusiveMarkerRange(source, startNeedle, endNeedle, label) {
  const start = uniqueIndex(source, startNeedle, `${label} start`);
  const marker = uniqueIndex(source, endNeedle, `${label} end`);
  const newline = source.indexOf('\n', marker + endNeedle.length);
  return { start, end: newline === -1 ? source.length : newline + 1 };
}

function toCapturedUnit(path, label, source, range, absentAnchor) {
  assert.ok(range.start >= 0 && range.end > range.start && range.end <= source.length, `${label} has invalid bounds`);
  return Object.freeze({
    path,
    label,
    start: range.start,
    end: range.end,
    bytes: source.slice(range.start, range.end),
    absentAnchor
  });
}

function captureBoundedUnits(mirrorRoot) {
  const sources = new Map(SHARED_RELEASE_PATHS.map((path) => [
    path,
    readFileSync(safeMirrorPath(mirrorRoot, path), 'utf8')
  ]));
  const units = [];
  const addObject = (path, needle, label) => {
    const source = sources.get(path);
    units.push(toCapturedUnit(path, label, source, elementRangeContaining(source, needle, label), needle));
  };
  const addLine = (path, needle, label) => {
    const source = sources.get(path);
    units.push(toCapturedUnit(path, label, source, lineRangeContaining(source, needle, label), needle));
  };
  const addStatement = (path, needle, label) => {
    const source = sources.get(path);
    units.push(toCapturedUnit(path, label, source, statementRangeContaining(source, needle, label), needle));
  };
  const addBlock = (path, startNeedle, endNeedle, label) => {
    const source = sources.get(path);
    units.push(toCapturedUnit(path, label, source, blockRange(source, startNeedle, endNeedle, label), startNeedle));
  };
  const addInclusiveBlock = (path, startNeedle, endNeedle, label) => {
    const source = sources.get(path);
    units.push(toCapturedUnit(path, label, source, inclusiveMarkerRange(source, startNeedle, endNeedle, label), startNeedle));
  };
  const addToEnd = (path, startNeedle, label) => {
    const source = sources.get(path);
    const start = uniqueIndex(source, startNeedle, `${label} start`);
    units.push(toCapturedUnit(path, label, source, { start, end: source.length }, startNeedle));
  };

  addObject('tools.json', `"id": "${FEATURE_ID}"`, 'tools registry entry');
  addObject('index.html', `id: '${FEATURE_ID}'`, 'landing registry entry');
  addLine('rlnav.js', '{ label: "Portfolio Survival", full: "Portfolio Survival & Allocation Lab"', 'navigation registry entry');
  addToEnd('rlnav.js', '/* ═══════════ RL Return — generic strict ReturnContext/v1 strip (Feature 008 Scope 26) ═══════════', 'return-context block');
  addInclusiveBlock('rldata.js', '/* ---------- Feature 008 Scope 04/19: coverage-aware bar reads ----------', '/* ---------- End Feature 008 Scope 04 ---------- */', 'RLDATA coverage block');
  addLine('README.md', `| [\`🧭 Portfolio Survival & Allocation Lab\`](${FEATURE_ROUTE})`, 'README registry row');
  addObject('simple-models.json', '"definitionId": "simple-model/portfolio-survival/v1"', 'Simple model entry');
  addObject('journeys.json', '"goalId": "mandate-survival-review"', 'mandate journey definition');
  addObject('journeys.json', '"goalId": "allocation-stability-review"', 'allocation journey definition');
  addObject('journeys.json', '"stepId": "journey/portfolio-survival-allocation-lab/mandate-survival-review/v1/step/evaluate"', 'mandate journey step');
  addObject('journeys.json', '"stepId": "journey/portfolio-survival-allocation-lab/allocation-stability-review/v1/step/evaluate"', 'allocation journey step');
  addLine('tool-experience.config.json', '"rlexperience-adapters/portfolio-research.js",', 'adapter allowlist entry');
  addLine('scripts/validate-tool-experience.mjs', "{ path: '../rlexperience-adapters/portfolio-research.js'", 'adapter validator entry');
  addStatement('scripts/selftest.mjs', 'the released portfolio route is published rather than excluded', 'selftest release-route assertion');
  addStatement('scripts/selftest.mjs', 'Portfolio Survival, Research Agenda, Causal Rotation and Horizon Ladder append after Trend Dynamics', 'selftest registry-order assertion');
  addStatement('scripts/selftest.mjs', "!sitePlan.excludedPaths.includes('rlportfolio.js')", 'selftest shared-module assertion');
  addStatement('scripts/selftest.mjs', 'the registered Portfolio page is the production consumer for rlportfolio.js', 'selftest production-consumer assertion');
  addBlock('scripts/selftest.mjs', '/* ---------- Portfolio brief: owner routing is part of one atomic public-evidence load ----------', '/* ---------- Portfolio Survival: no user-typed value may reach an innerHTML sink ----------', 'selftest portfolio owner-routing group');
  addBlock('scripts/selftest.mjs', '/* ---------- Portfolio Survival: no user-typed value may reach an innerHTML sink ----------', '/* ---------- Market Brief: §6c larger-picture / anti-reactivity helpers ----------', 'selftest portfolio sink group');
  addBlock('scripts/selftest.mjs', '/* ---------- Feature 008 Scope 04: shared-consumer canary (TP-04-04) ----------', '/* ---------- Feature 019 Scope 01: agenda registry contract ----------', 'selftest Feature 008 shared-consumer group');

  for (const path of SHARED_RELEASE_PATHS) {
    const pathUnits = units.filter((unit) => unit.path === path).sort((left, right) => left.start - right.start);
    for (let index = 1; index < pathUnits.length; index += 1) {
      assert.ok(pathUnits[index - 1].end <= pathUnits[index].start, `${path} release units overlap`);
    }
  }
  return Object.freeze({ sources, units: Object.freeze(units) });
}

function removeRanges(source, units) {
  return [...units]
    .sort((left, right) => right.start - left.start)
    .reduce((bytes, unit) => bytes.slice(0, unit.start) + bytes.slice(unit.end), source);
}

function restoreRanges(source, units) {
  return [...units]
    .sort((left, right) => left.start - right.start)
    .reduce((bytes, unit) => bytes.slice(0, unit.start) + unit.bytes + bytes.slice(unit.start), source);
}

function writeMirrorText(mirrorRoot, relativePath, text) {
  const target = safeMirrorPath(mirrorRoot, relativePath);
  assert.equal(existsSync(target), true, `bounded write target missing: ${relativePath}`);
  assert.equal(lstatSync(target).isSymbolicLink(), false, `bounded write target is a symlink: ${relativePath}`);
  assert.equal(isInside(mirrorRoot, realpathSync(target)), true, `bounded write target resolved outside mirror: ${relativePath}`);
  writeFileSync(target, text);
}

function applyRollback(mirrorRoot, captured, wholePaths) {
  for (const relativePath of wholePaths) {
    const target = safeMirrorPath(mirrorRoot, relativePath);
    assert.equal(lstatSync(target).isSymbolicLink(), false, `whole-file rollback target is a symlink: ${relativePath}`);
    rmSync(target);
  }
  for (const path of SHARED_RELEASE_PATHS) {
    const pathUnits = captured.units.filter((unit) => unit.path === path);
    if (!pathUnits.length) continue;
    writeMirrorText(mirrorRoot, path, removeRanges(captured.sources.get(path), pathUnits));
  }
}

function restoreRelease(mirrorRoot, captured, wholeSnapshot) {
  for (const [relativePath, bytes] of wholeSnapshot) {
    const target = safeMirrorPath(mirrorRoot, relativePath);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, bytes);
  }
  for (const path of SHARED_RELEASE_PATHS) {
    const pathUnits = captured.units.filter((unit) => unit.path === path);
    if (!pathUnits.length) continue;
    const rolledBack = readFileSync(safeMirrorPath(mirrorRoot, path), 'utf8');
    writeMirrorText(mirrorRoot, path, restoreRanges(rolledBack, pathUnits));
  }
}

function expectedRollbackInventory(initial, captured, wholePaths) {
  const expected = new Map(initial);
  for (const path of wholePaths) expected.delete(path);
  for (const path of SHARED_RELEASE_PATHS) {
    const pathUnits = captured.units.filter((unit) => unit.path === path);
    if (!pathUnits.length) continue;
    expected.set(path, Buffer.from(removeRanges(captured.sources.get(path), pathUnits)));
  }
  return expected;
}

function extractRegistryIds(mirrorRoot) {
  const tools = JSON.parse(readFileSync(safeMirrorPath(mirrorRoot, 'tools.json'), 'utf8'));
  const index = readFileSync(safeMirrorPath(mirrorRoot, 'index.html'), 'utf8');
  const nav = readFileSync(safeMirrorPath(mirrorRoot, 'rlnav.js'), 'utf8');
  return {
    tools,
    toolsIds: tools.tools.map(({ id }) => id),
    indexIds: Array.from(index.matchAll(/\bid:\s*'([^']+)'/g), (match) => match[1]).filter((id) => id !== 'next-tool'),
    navIds: Array.from(nav.matchAll(/\bfile:\s*"([^"]+\.html)"/g), (match) => match[1])
      .filter((file) => file !== 'index.html')
      .map((file) => file.replace(/\.html$/, ''))
  };
}

function registryDerivedNavigationIds(tools) {
  const groupedIds = new Map();
  for (const { group, id } of tools) {
    if (!groupedIds.has(group)) groupedIds.set(group, []);
    groupedIds.get(group).push(id);
  }
  return [...groupedIds.values()].flat();
}

function assertRegistryContracts(mirrorRoot, featureExpected, expectedIds) {
  const registry = extractRegistryIds(mirrorRoot);
  assert.deepEqual(registry.toolsIds, expectedIds, 'tools.json order must preserve every non-owned registry entry');
  assert.deepEqual(registry.indexIds, expectedIds, 'index registry must preserve tools.json order');
  assert.deepEqual(registry.navIds, expectedIds, 'navigation registry must preserve tools.json order');
  assert.equal(registry.toolsIds.includes(FEATURE_ID), featureExpected, 'Feature 008 registry state is wrong');

  const models = JSON.parse(readFileSync(safeMirrorPath(mirrorRoot, 'simple-models.json'), 'utf8'));
  const journeys = JSON.parse(readFileSync(safeMirrorPath(mirrorRoot, 'journeys.json'), 'utf8'));
  const config = JSON.parse(readFileSync(safeMirrorPath(mirrorRoot, 'tool-experience.config.json'), 'utf8'));
  const modelIds = new Set(models.definitions.map(({ definitionId }) => definitionId));
  const journeyIds = new Set(journeys.definitions.map(({ definitionId }) => definitionId));
  const stepIds = new Set(journeys.steps.map(({ stepId }) => stepId));
  for (const tool of registry.tools.tools) {
    if (tool.experience.simpleModelDefinitionId !== null) {
      assert.equal(modelIds.has(tool.experience.simpleModelDefinitionId), true, `${tool.id} Simple model must resolve`);
    }
    for (const definitionId of tool.experience.journeyDefinitionIds) {
      assert.equal(journeyIds.has(definitionId), true, `${tool.id} journey must resolve: ${definitionId}`);
    }
  }
  for (const definition of journeys.definitions) {
    for (const stepId of definition.stepIds) assert.equal(stepIds.has(stepId), true, `${definition.definitionId} step must resolve`);
  }

  const featureModel = models.definitions.find(({ toolId }) => toolId === FEATURE_ID);
  const featureJourneys = journeys.definitions.filter(({ toolId }) => toolId === FEATURE_ID);
  const featureSteps = journeys.steps.filter(({ definitionId }) => definitionId.startsWith(`journey/${FEATURE_ID}/`));
  const featureAdapterAllowed = config.adapterPolicy.moduleAllowlist.includes('rlexperience-adapters/portfolio-research.js');
  assert.equal(Boolean(featureModel), featureExpected, 'Feature 008 model state must match registry state');
  assert.equal(featureJourneys.length, featureExpected ? 2 : 0, 'Feature 008 journey definitions must change atomically');
  assert.equal(featureSteps.length, featureExpected ? 2 : 0, 'Feature 008 journey steps must change atomically');
  assert.equal(featureAdapterAllowed, featureExpected, 'Feature 008 adapter allowlist state must change atomically');
  assert.equal(existsSync(safeMirrorPath(mirrorRoot, 'rlexperience-adapters/portfolio-research.js')), featureExpected);
  return registry;
}

function assertSelftestCanary(mirrorRoot, captured, featureExpected) {
  const selftestPath = safeMirrorPath(mirrorRoot, 'scripts/selftest.mjs');
  const source = readFileSync(selftestPath, 'utf8');
  for (const unit of captured.units.filter(({ path }) => path === 'scripts/selftest.mjs')) {
    assert.equal(source.includes(unit.absentAnchor), featureExpected, `${unit.label} state is wrong`);
  }
  const check = spawnSync(process.execPath, ['--check', selftestPath], {
    cwd: mirrorRoot,
    encoding: 'utf8',
    timeout: 30_000
  });
  assert.equal(check.error, undefined, `selftest syntax canary failed to start: ${check.error?.message || ''}`);
  assert.equal(check.status, 0, `selftest syntax canary failed: ${check.stdout || ''}${check.stderr || ''}`);
}

function assertSharedAnchors(mirrorRoot, captured, featureExpected) {
  for (const unit of captured.units) {
    const source = readFileSync(safeMirrorPath(mirrorRoot, unit.path), 'utf8');
    assert.equal(source.includes(unit.absentAnchor), featureExpected, `${unit.label} state is wrong`);
  }
}

async function startMirrorServer(mirrorRoot) {
  const requests = [];
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    requests.push(Object.freeze({ method: request.method || 'GET', pathname: requestUrl.pathname }));
    const requestPath = decodeURIComponent(requestUrl.pathname);
    const relativePath = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(mirrorRoot, relativePath);
    if (!isInside(mirrorRoot, filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'referrer-policy': 'no-referrer' });
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': MIME[extname(filePath)] || 'application/octet-stream',
      'referrer-policy': 'no-referrer'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady, rejectReady) => {
    server.once('error', rejectReady);
    server.listen(0, '127.0.0.1', resolveReady);
  });
  return Object.freeze({
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    requests,
    close: () => new Promise((resolveClosed, rejectClosed) => {
      server.close((error) => error ? rejectClosed(error) : resolveClosed());
      server.closeAllConnections?.();
    })
  });
}

async function assertExistingConsumerCanaries(mirrorRoot, server) {
  for (const consumer of EXISTING_CONSUMERS) {
    const expected = readFileSync(safeMirrorPath(mirrorRoot, consumer.file), 'utf8');
    const dataPosition = expected.lastIndexOf('src="rldata.js');
    const appPosition = expected.lastIndexOf('src="rlapp.js');
    const navPosition = expected.lastIndexOf('src="rlnav.js');
    assert.ok(dataPosition >= 0 && dataPosition < appPosition && appPosition < navPosition,
      `${consumer.id} must preserve the rldata → rlapp → rlnav consumer chain`);
    const response = await fetch(`${server.baseUrl}/${consumer.file}`, { signal: AbortSignal.timeout(5_000) });
    assert.equal(response.status, 200, `${consumer.id} fixture route must remain reachable`);
    assert.equal(await response.text(), expected, `${consumer.id} fixture server must serve exact mirror bytes`);
  }
}

async function launchIsolatedProfile(profileRoot) {
  const context = await chromium.launchPersistentContext(profileRoot, {
    channel: 'chrome',
    headless: true,
    serviceWorkers: 'block',
    viewport: { width: 1280, height: 900 }
  });
  context.setDefaultTimeout(10_000);
  const pages = context.pages();
  return { context, page: pages[0] || await context.newPage() };
}

async function assertBrowserCanaries({ featureExpected, phase, profileRoot, server, expectedNavigationIds }) {
  const externalRequests = [];
  const browser = await launchIsolatedProfile(profileRoot);
  browser.context.on('request', (request) => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== server.baseUrl) externalRequests.push(url.origin);
  });
  try {
    await browser.page.goto(`${server.baseUrl}/index.html#data-settings`, { waitUntil: 'domcontentloaded' });
    await browser.page.locator('#data-settings [data-provider-key="finnhub"]').waitFor({ state: 'visible' });
    await browser.page.locator('#rlnav').waitFor({ state: 'attached' });

    const providerKey = `tp1614-${phase}-provider-key`;
    const canarySymbol = `TP1614-${phase.toUpperCase()}`;
    await browser.page.locator('#data-settings [data-provider-key="finnhub"]').fill(providerKey);
    await browser.page.locator('#data-settings .settings-savekey[data-provider="finnhub"]').click();
    await browser.page.waitForFunction(() => globalThis.RLDATA?.providerStatus('finnhub').state === 'configured');

    const browserState = await browser.page.evaluate(({ canarySymbol, featureId, providerKey, sentinelKey }) => {
      const row = { t: Date.now(), o: 100, h: 103, l: 98, c: 102, v: 1000 };
      RLDATA.putBars(canarySymbol, '1d', [row], 'tp-16-14');
      const read = RLDATA.putToolRead('tp-16-14-canary', {
        asOf: new Date().toISOString(),
        read: 'Rollback canary remains local',
        metrics: { state: 'canary' },
        deepLink: 'index.html#data-settings'
      });
      const links = Array.from(document.querySelectorAll('#rlnav a.rlnav-item'))
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && href !== 'index.html')
        .map((href) => href.replace(/\.html$/, ''));
      const state = {
        apiReady: typeof RLDATA === 'object' && typeof RLAPP === 'object',
        featureInNavigation: links.includes(featureId),
        links,
        providerConfigured: RLDATA.providerStatus('finnhub').state === 'configured',
        providerKeyInDom: document.documentElement.outerHTML.includes(providerKey),
        providerKeyInUrl: location.href.includes(providerKey),
        bars: RLDATA.bars(canarySymbol, '1d'),
        toolRead: RLDATA.toolRead('tp-16-14-canary'),
        sentinel: localStorage.getItem(sentinelKey)
      };
      RLDATA.clearKey('finnhub');
      state.providerCleared = RLDATA.providerStatus('finnhub').state === 'unconfigured';
      state.sentinelAfterProviderClear = localStorage.getItem(sentinelKey);
      return state;
    }, {
      canarySymbol,
      featureId: FEATURE_ID,
      providerKey,
      sentinelKey: PROFILE_SENTINEL_KEY
    });

    assert.equal(browserState.apiReady, true, `${phase} provider/RLDATA APIs must boot`);
    assert.equal(browserState.featureInNavigation, featureExpected, `${phase} navigation feature state must match rollback state`);
    assert.deepEqual(browserState.links, expectedNavigationIds, `${phase} browser navigation must preserve registry-derived group order`);
    assert.equal(browserState.providerConfigured, true, `${phase} provider editor must configure the production provider API`);
    assert.equal(browserState.providerCleared, true, `${phase} provider clear must execute the production clear path`);
    assert.equal(browserState.providerKeyInDom, false, `${phase} provider key must not leak into rendered markup`);
    assert.equal(browserState.providerKeyInUrl, false, `${phase} provider key must not leak into the URL`);
    assert.equal(browserState.bars.length, 1, `${phase} RLDATA must round-trip one production bar`);
    assert.equal(browserState.bars[0].c, 102, `${phase} RLDATA must retain the production close field`);
    assert.equal(browserState.toolRead.read, 'Rollback canary remains local', `${phase} RLDATA must return its validated tool read`);
    assert.equal(browserState.sentinel, PROFILE_SENTINEL_VALUE, `${phase} personal sentinel must survive source rollback`);
    assert.equal(browserState.sentinelAfterProviderClear, PROFILE_SENTINEL_VALUE, `${phase} provider cleanup must not touch personal state`);
    assert.deepEqual(externalRequests, [], `${phase} browser canary attempted external network access`);
    return { navCount: browserState.links.length, providerCount: 1, rldataCount: 2 };
  } finally {
    await browser.context.close();
  }
}

test(TITLE, { timeout: 120_000 }, async () => {
  const temporaryRoot = mkdtempSync(join(realpathSync(tmpdir()), 'research-lab-tp16-14-'));
  const mirrorRoot = resolve(temporaryRoot, 'mirror');
  const profileRoot = resolve(temporaryRoot, 'browser-profile');
  mkdirSync(mirrorRoot, { recursive: true });
  mkdirSync(profileRoot, { recursive: true });
  assertIsolatedRoot(mirrorRoot, 'repository mirror');
  assertIsolatedRoot(profileRoot, 'browser profile');

  let seedBrowser = null;
  let server = null;
  try {
    const copiedPaths = minimumMirrorPaths();
    for (const relativePath of copiedPaths) copyFileIntoMirror(mirrorRoot, relativePath);
    const wholePaths = [...new Set([...WHOLE_RELEASE_PATHS, ...featureTestPaths(), ...featureFixturePaths()])].sort();
    const initial = inventory(mirrorRoot);
    const canonicalBefore = new Map(copiedPaths.map((relativePath) => [relativePath, readFileSync(resolve(ROOT, relativePath))]));
    const wholeSnapshot = new Map(wholePaths.map((relativePath) => [relativePath, readFileSync(safeMirrorPath(mirrorRoot, relativePath))]));
    const captured = captureBoundedUnits(mirrorRoot);
    const originalRegistry = extractRegistryIds(mirrorRoot);
    const originalIds = originalRegistry.toolsIds;
    const originalNavigationIds = registryDerivedNavigationIds(originalRegistry.tools.tools);
    assert.equal(originalIds.includes(FEATURE_ID), true, 'pre-rollback registry must contain the release being removed');
    assertSharedAnchors(mirrorRoot, captured, true);

    server = await startMirrorServer(mirrorRoot);
    seedBrowser = await launchIsolatedProfile(profileRoot);
    await seedBrowser.page.goto(`${server.baseUrl}/index.html#data-settings`, { waitUntil: 'domcontentloaded' });
    await seedBrowser.page.evaluate(({ key, value }) => localStorage.setItem(key, value), {
      key: PROFILE_SENTINEL_KEY,
      value: PROFILE_SENTINEL_VALUE
    });
    assert.equal(await seedBrowser.page.evaluate((key) => localStorage.getItem(key), PROFILE_SENTINEL_KEY), PROFILE_SENTINEL_VALUE);
    await seedBrowser.context.close();
    seedBrowser = null;

    applyRollback(mirrorRoot, captured, wholePaths);
    const rollbackTools = originalRegistry.tools.tools.filter(({ id }) => id !== FEATURE_ID);
    const rollbackIds = rollbackTools.map(({ id }) => id);
    const rollbackNavigationIds = registryDerivedNavigationIds(rollbackTools);
    const expectedRollback = expectedRollbackInventory(initial, captured, wholePaths);
    assertInventory(expectedRollback, inventory(mirrorRoot), 'rollback transaction');
    assertSharedAnchors(mirrorRoot, captured, false);
    assertRegistryContracts(mirrorRoot, false, rollbackIds);
    assertSelftestCanary(mirrorRoot, captured, false);
    await assertExistingConsumerCanaries(mirrorRoot, server);
    const rollbackBrowser = await assertBrowserCanaries({
      featureExpected: false,
      phase: 'rollback',
      profileRoot,
      server,
      expectedNavigationIds: rollbackNavigationIds
    });
    const rolledBackRoute = await fetch(`${server.baseUrl}/${FEATURE_ROUTE}`, { signal: AbortSignal.timeout(5_000) });
    assert.equal(rolledBackRoute.status, 404, 'rolled-back fixture server must not serve the removed Feature 008 route');
    assertInventory(expectedRollback, inventory(mirrorRoot), 'rollback canaries');

    const collateralProbe = new Map(expectedRollback);
    const collateralPath = EXISTING_CONSUMERS[0].file;
    collateralProbe.set(collateralPath, Buffer.concat([collateralProbe.get(collateralPath), Buffer.from('\ncollateral-leak')]));
    assert.deepEqual(inventoryDifferences(expectedRollback, collateralProbe), [collateralPath], 'collateral negative control must be detected');

    restoreRelease(mirrorRoot, captured, wholeSnapshot);
    assertInventory(initial, inventory(mirrorRoot), 'restored transaction');
    assertSharedAnchors(mirrorRoot, captured, true);
    assertRegistryContracts(mirrorRoot, true, originalIds);
    assertSelftestCanary(mirrorRoot, captured, true);
    await assertExistingConsumerCanaries(mirrorRoot, server);
    const restoredBrowser = await assertBrowserCanaries({
      featureExpected: true,
      phase: 'restored',
      profileRoot,
      server,
      expectedNavigationIds: originalNavigationIds
    });
    const restoredRoute = await fetch(`${server.baseUrl}/${FEATURE_ROUTE}`, { signal: AbortSignal.timeout(5_000) });
    assert.equal(restoredRoute.status, 200, 'restored fixture server must serve the exact Feature 008 route');
    assert.equal(await restoredRoute.text(), wholeSnapshot.get(FEATURE_ROUTE).toString('utf8'), 'restored route response must equal captured bytes');
    assertInventory(initial, inventory(mirrorRoot), 'restored canaries');

    const restoreProbe = new Map(initial);
    const changedTools = Buffer.from(restoreProbe.get('tools.json'));
    changedTools[changedTools.length - 2] ^= 1;
    restoreProbe.set('tools.json', changedTools);
    assert.deepEqual(inventoryDifferences(initial, restoreProbe), ['tools.json'], 'restore-byte negative control must be detected');
    assertInventory(canonicalBefore, new Map(copiedPaths.map((relativePath) => [relativePath, readFileSync(resolve(ROOT, relativePath))])), 'canonical checkout');
    assert.equal(server.requests.every(({ method }) => method === 'GET'), true, 'fixture server must remain read-only');

    console.log(`[tp-16-14] mirrorIsolation=PASS copiedFiles=${copiedPaths.length} canonicalWrites=0 structuredManifestsCopied=0`);
    console.log(`[tp-16-14] captured wholeFiles=${wholeSnapshot.size} boundedUnits=${captured.units.length} sharedFiles=${SHARED_RELEASE_PATHS.length}`);
    console.log(`[tp-16-14] rollback bytesExact=true featurePresent=false nonOwnedConsumers=${EXISTING_CONSUMERS.length}`);
    console.log(`[tp-16-14] rollback canaries registry=${rollbackIds.length} navigation=${rollbackBrowser.navCount} provider=${rollbackBrowser.providerCount} rldata=${rollbackBrowser.rldataCount} fixtureServer=PASS selftestSource=PASS`);
    console.log('[tp-16-14] rollback personalStorageSentinel=preserved externalRequests=0');
    console.log(`[tp-16-14] restore bytesExact=true featurePresent=true restoredFiles=${initial.size}`);
    console.log(`[tp-16-14] restored canaries registry=${originalIds.length} navigation=${restoredBrowser.navCount} provider=${restoredBrowser.providerCount} rldata=${restoredBrowser.rldataCount} fixtureServer=PASS selftestSource=PASS`);
    console.log('[tp-16-14] restored personalStorageSentinel=preserved externalRequests=0');
    console.log('[tp-16-14] adversarial collateralLeakDetected=true restoreDifferenceDetected=true');
    console.log(`[tp-16-14] canonicalByteInventory=${canonicalBefore.size} sha256Checks=${[...initial.values()].filter((bytes) => sha256(bytes).length === 64).length}`);
  } finally {
    if (seedBrowser) await seedBrowser.context.close().catch(() => {});
    if (server) await server.close().catch(() => {});
    rmSync(temporaryRoot, { recursive: true, force: true });
    assert.equal(existsSync(temporaryRoot), false, 'mirror and isolated browser profile must be removed in finally');
    console.log('[tp-16-14] cleanup mirrorRemoved=true browserProfileRemoved=true');
  }
});
