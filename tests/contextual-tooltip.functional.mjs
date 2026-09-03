import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, normalize, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROVIDERS = ['rlg.js', 'rlticker.js', 'rlchart.js'];
const CANARY_PAGES = [
  'market-heatmap-lab.html',
  'options-structure-lab.html',
  'company-fundamentals-lab.html'
];
const FORBIDDEN_ENGINES = /rlgtip|rltkrtip|rlcharttip/;
const PROCESS_PROOF_CHILD = 'RL_SCOPE03_PROCESS_PROOF_CHILD';
const REPLAY_EXCLUDED_TOP_LEVEL = new Set([
  '.git',
  'node_modules',
  'playwright-report',
  'test-results'
]);
const LEGACY_AUTHORITY_PATHS = Object.freeze([
  ...PROVIDERS,
  ...CANARY_PAGES,
  'scripts/selftest.mjs'
]);
const LEGACY_FIXTURE_ROOT = resolve(
  ROOT,
  'tests/fixtures/feature-012/contextual-tooltip-pre-scope03'
);
const LEGACY_FIXTURE_CONTRACT = 'feature-012-scope03-legacy-authority/v1';
const LEGACY_FIXTURE_SOURCE_COMMIT = 'b533b972a473ffca9252362ecc5d73de52423da9';
const LEGACY_REPLAY_HYDRATION_MARKER = 'data-heatmap-hydration="ready"';
const SCOPE03_GOVERNED_PATHS = Object.freeze([
  'rlcontext.js',
  ...LEGACY_AUTHORITY_PATHS,
  'tests/contextual-tooltip.unit.mjs',
  'tests/contextual-tooltip.functional.mjs',
  'tests/contextual-tooltip.spec.mjs'
]);
const SCOPE03_ROLLBACK_MUTATION_PATHS = Object.freeze(
  SCOPE03_GOVERNED_PATHS.slice(0, LEGACY_AUTHORITY_PATHS.length + 1)
);
const RED_INFRASTRUCTURE_PATTERNS = Object.freeze([
  /SyntaxError/,
  /No tests found/,
  /Cannot find package ['"]playwright/,
  /ERR_MODULE_NOT_FOUND[^\n]*playwright/,
  /Executable doesn't exist/,
  /browserType\.launch/,
  /Failed to launch/,
  /EADDRINUSE/
]);

function read(relativePath) {
  return readFileSync(resolve(ROOT, relativePath), 'utf8');
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function governedSnapshot(root) {
  assert.equal(
    new Set(SCOPE03_GOVERNED_PATHS).size,
    SCOPE03_GOVERNED_PATHS.length,
    'Scope 03 governed paths must be unique'
  );
  const result = new Map();
  for (const relativePath of SCOPE03_GOVERNED_PATHS) {
    const absolutePath = join(root, relativePath);
    assert.equal(existsSync(absolutePath), true, `Scope 03 governed path missing: ${relativePath}`);
    assert.equal(statSync(absolutePath).isFile(), true, `Scope 03 governed path is not a file: ${relativePath}`);
    const bytes = readFileSync(absolutePath);
    result.set(relativePath, { bytes, hash: sha256(bytes) });
  }
  return result;
}

function assertGovernedInventoryEqual(actual, expected, label) {
  const actualPaths = [...actual.keys()];
  const expectedPaths = [...expected.keys()];
  assert.equal(actualPaths.length, SCOPE03_GOVERNED_PATHS.length, `${label}: governed path count changed`);
  assert.equal(expectedPaths.length, SCOPE03_GOVERNED_PATHS.length, `${label}: expected governed path count changed`);
  for (let index = 0; index < SCOPE03_GOVERNED_PATHS.length; index += 1) {
    const relativePath = SCOPE03_GOVERNED_PATHS[index];
    assert.equal(actualPaths[index], relativePath, `${label}: actual governed inventory differs at ${relativePath}`);
    assert.equal(expectedPaths[index], relativePath, `${label}: expected governed inventory differs at ${relativePath}`);
    assert.equal(actual.get(relativePath).hash, expected.get(relativePath).hash, `${label}: governed path changed: ${relativePath}`);
    assert.equal(actual.get(relativePath).bytes.equals(expected.get(relativePath).bytes), true, `${label}: governed bytes changed: ${relativePath}`);
  }
}

function recordScope03Mutation(relativePath, operation) {
  const canonicalPath = normalize(relativePath).split('\\').join('/');
  assert.equal(canonicalPath, relativePath, `Scope 03 rollback mutation path is not canonical: ${relativePath}`);
  assert.equal(
    SCOPE03_ROLLBACK_MUTATION_PATHS.includes(relativePath),
    true,
    `Scope 03 rollback mutation path is not authorized: ${relativePath}`
  );
  assert.equal(operation?.kind === 'write' || operation?.kind === 'delete', true, `Scope 03 rollback mutation operation is invalid: ${relativePath}`);
  assert.equal(Array.isArray(operation?.ledger), true, `Scope 03 rollback mutation ledger is required: ${relativePath}`);
  assert.equal(typeof operation?.apply, 'function', true, `Scope 03 rollback mutation callback is required: ${relativePath}`);
  operation.ledger.push({ relativePath, operation: operation.kind });
  operation.apply();
}

function snapshot(root, relativePaths) {
  return new Map(relativePaths.map((relativePath) => {
    const bytes = readFileSync(join(root, relativePath));
    return [relativePath, { bytes, hash: sha256(bytes) }];
  }));
}

function restoreSnapshot(root, sourceSnapshot, mutationLedger) {
  for (const [relativePath, entry] of sourceSnapshot) {
    recordScope03Mutation(relativePath, {
      kind: 'write',
      ledger: mutationLedger,
      apply() { writeFileSync(join(root, relativePath), entry.bytes); }
    });
  }
}

function assertScope03MutationSet(mutationLedger, requiredPaths, label) {
  const actualPaths = new Set();
  for (const entry of mutationLedger) {
    assert.equal(
      SCOPE03_ROLLBACK_MUTATION_PATHS.includes(entry.relativePath),
      true,
      `${label}: unauthorized rollback mutation recorded: ${entry.relativePath}`
    );
    actualPaths.add(entry.relativePath);
  }
  assert.deepEqual(
    SCOPE03_ROLLBACK_MUTATION_PATHS.filter((relativePath) => actualPaths.has(relativePath)),
    requiredPaths,
    `${label}: actual rollback write set differs from the required subset`
  );
}

function copyRepositoryForReplay(targetRoot) {
  cpSync(ROOT, targetRoot, {
    recursive: true,
    filter(source) {
      const pathFromRoot = relative(ROOT, source);
      const topLevel = pathFromRoot.split(/[\\/]/)[0];
      return pathFromRoot === '' || !REPLAY_EXCLUDED_TOP_LEVEL.has(topLevel);
    }
  });
  const nodeModules = join(ROOT, 'node_modules');
  if (existsSync(nodeModules)) symlinkSync(nodeModules, join(targetRoot, 'node_modules'), 'dir');
}

// BUG-002 (scope-baseline HEAD-drift antipattern): the pre-Scope-03 authority is a committed,
// manifest-closed fixture. The source commit is provenance only; runtime verification reads no
// Git ref. Manifest shape, exact bytes, and semantic marker checks fail loud on fixture drift.
const DECORATOR_MARKER = /src="rlcontext\.js|src="rlexperience\.js/;

function loadLegacyFixtureManifest(fixtureRoot = LEGACY_FIXTURE_ROOT) {
  const manifestPath = join(fixtureRoot, 'manifest.json');
  assert.equal(existsSync(manifestPath), true, `legacy fixture manifest missing: ${manifestPath}`);
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  assert.deepEqual(
    Object.keys(manifest).sort(),
    ['contractVersion', 'files', 'pathCount', 'provenance'],
    'legacy fixture manifest has an unknown or missing top-level field'
  );
  assert.equal(manifest.contractVersion, LEGACY_FIXTURE_CONTRACT);
  assert.deepEqual(
    Object.keys(manifest.provenance || {}).sort(),
    ['sourceCommit', 'sourceRole'],
    'legacy fixture provenance has an unknown or missing field'
  );
  assert.equal(manifest.provenance.sourceCommit, LEGACY_FIXTURE_SOURCE_COMMIT);
  assert.match(manifest.provenance.sourceRole, /pre-Scope-03/);
  assert.equal(manifest.pathCount, LEGACY_AUTHORITY_PATHS.length);
  assert.equal(manifest.files.length, LEGACY_AUTHORITY_PATHS.length);
  assert.deepEqual(
    manifest.files.map((entry) => entry.path),
    LEGACY_AUTHORITY_PATHS,
    'legacy fixture manifest must list the closed authority paths in canonical order'
  );
  for (const entry of manifest.files) {
    assert.deepEqual(
      Object.keys(entry).sort(),
      ['byteLength', 'fixturePath', 'path', 'semanticRole', 'sha256'],
      `legacy fixture manifest entry ${entry.path || '<unknown>'} has an unknown or missing field`
    );
    assert.equal(entry.fixturePath, entry.path, `legacy fixture ${entry.path} must use its closed relative path`);
    assert.equal(Number.isInteger(entry.byteLength) && entry.byteLength > 0, true, `legacy fixture ${entry.path} byteLength must be a positive integer`);
    assert.match(entry.sha256, /^[0-9a-f]{64}$/, `legacy fixture ${entry.path} sha256 must be lowercase hex`);
    assert.equal(typeof entry.semanticRole === 'string' && entry.semanticRole.length > 0, true, `legacy fixture ${entry.path} semanticRole is required`);
  }
  return manifest;
}

function baselineBytes(relativePath, fixtureRoot = LEGACY_FIXTURE_ROOT) {
  assert.equal(
    LEGACY_AUTHORITY_PATHS.includes(relativePath),
    true,
    `legacy fixture path not authorized: ${relativePath}`
  );
  const manifest = loadLegacyFixtureManifest(fixtureRoot);
  const entry = manifest.files.find((candidate) => candidate.path === relativePath);
  assert.notEqual(entry, undefined, `legacy fixture manifest entry missing: ${relativePath}`);
  const fixturePath = resolve(fixtureRoot, entry.fixturePath);
  assert.equal(
    relative(resolve(fixtureRoot), fixturePath),
    entry.fixturePath,
    `legacy fixture ${relativePath} must resolve inside the fixture root`
  );
  assert.equal(existsSync(fixturePath), true, `legacy fixture file missing: ${relativePath}`);
  const bytes = readFileSync(fixturePath);
  assert.equal(bytes.length, entry.byteLength, `legacy fixture ${relativePath} byte length drifted`);
  assert.equal(sha256(bytes), entry.sha256, `legacy fixture ${relativePath} sha256 drifted`);
  if (CANARY_PAGES.includes(relativePath)) {
    assert.equal(
      DECORATOR_MARKER.test(bytes.toString('utf8')),
      false,
      `legacy fixture ${relativePath} must not contain Scope 03 decorator wiring`
    );
  }
  return bytes;
}

function verifyLegacyFixtureFailureControls(temporaryRoot) {
  const fixtureRoot = join(temporaryRoot, 'fixture-controls');
  cpSync(LEGACY_FIXTURE_ROOT, fixtureRoot, { recursive: true });

  assert.throws(
    () => baselineBytes('not-authorized.js', fixtureRoot),
    /legacy fixture path not authorized: not-authorized\.js/
  );

  const missingPath = 'rlg.js';
  rmSync(join(fixtureRoot, missingPath));
  assert.throws(
    () => baselineBytes(missingPath, fixtureRoot),
    /legacy fixture file missing: rlg\.js/
  );
  cpSync(join(LEGACY_FIXTURE_ROOT, missingPath), join(fixtureRoot, missingPath));

  const changedPath = 'rlticker.js';
  const changedBytes = readFileSync(join(fixtureRoot, changedPath));
  changedBytes[0] ^= 1;
  writeFileSync(join(fixtureRoot, changedPath), changedBytes);
  assert.throws(
    () => baselineBytes(changedPath, fixtureRoot),
    /legacy fixture rlticker\.js sha256 drifted/
  );
  cpSync(join(LEGACY_FIXTURE_ROOT, changedPath), join(fixtureRoot, changedPath));

  const contaminatedPath = 'market-heatmap-lab.html';
  const contaminatedBytes = Buffer.concat([
    readFileSync(join(fixtureRoot, contaminatedPath)),
    Buffer.from('\n<script src="rlcontext.js"></script>\n')
  ]);
  writeFileSync(join(fixtureRoot, contaminatedPath), contaminatedBytes);
  const manifestPath = join(fixtureRoot, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const contaminatedEntry = manifest.files.find((entry) => entry.path === contaminatedPath);
  contaminatedEntry.byteLength = contaminatedBytes.length;
  contaminatedEntry.sha256 = sha256(contaminatedBytes);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  assert.throws(
    () => baselineBytes(contaminatedPath, fixtureRoot),
    /legacy fixture market-heatmap-lab\.html must not contain Scope 03 decorator wiring/
  );

  return { unknownPath: true, missingFile: true, sha256: true, decoratorMarker: true };
}

function applyLegacyBaseline(sandboxRoot, mutationLedger) {
  for (const relativePath of LEGACY_AUTHORITY_PATHS) {
    recordScope03Mutation(relativePath, {
      kind: 'write',
      ledger: mutationLedger,
      apply() { writeFileSync(join(sandboxRoot, relativePath), baselineBytes(relativePath)); }
    });
  }
  recordScope03Mutation('rlcontext.js', {
    kind: 'delete',
    ledger: mutationLedger,
    apply() { rmSync(join(sandboxRoot, 'rlcontext.js'), { force: true }); }
  });
}

function prepareLegacyReplayDependencies(sandboxRoot, mutationLedger) {
  const relativePath = 'market-heatmap-lab.html';
  const pagePath = join(sandboxRoot, relativePath);
  const source = readFileSync(pagePath, 'utf8');
  const legacyBody = '<body data-tkr-noauto>';
  assert.equal(source.includes(legacyBody), true, `${relativePath} legacy body marker is required`);
  assert.doesNotMatch(source, /data-heatmap-hydration=/, `${relativePath} legacy fixture unexpectedly owns the later hydration contract`);
  const prepared = source.replace(
    legacyBody,
    `<body data-tkr-noauto ${LEGACY_REPLAY_HYDRATION_MARKER}>`
  );
  assert.doesNotMatch(prepared, DECORATOR_MARKER, `${relativePath} replay prerequisite must not add Scope 03 decorator wiring`);
  recordScope03Mutation(relativePath, {
    kind: 'write',
    ledger: mutationLedger,
    apply() { writeFileSync(pagePath, prepared); }
  });
}

function makeMinimalDocument() {
  function makeElement() {
    const attributes = new Map();
    const listeners = new Map();
    return {
      __attributes: attributes,
      __listeners: listeners,
      appendChild() {},
      addEventListener(type, handler) { listeners.set(type, handler); },
      classList: {
        add() {},
        contains() { return false; },
        remove() {}
      },
      getAttribute(name) { return attributes.get(name) ?? null; },
      getBoundingClientRect() { return { height: 40, left: 0, top: 0, width: 120 }; },
      id: '',
      setAttribute(name, value) { attributes.set(name, String(value)); },
      style: {}
    };
  }
  const head = makeElement();
  const body = makeElement();
  const documentElement = makeElement();
  return {
    addEventListener() {},
    body,
    createElement: makeElement,
    documentElement,
    getElementById() { return null; },
    head,
    readyState: 'loading'
  };
}

function loadLegacyProviderState(root) {
  const document = makeMinimalDocument();
  const browserRoot = {
    console,
    document,
    innerHeight: 900,
    innerWidth: 1200,
    setTimeout
  };
  browserRoot.globalThis = browserRoot;
  browserRoot.window = browserRoot;
  const context = vm.createContext(browserRoot);
  for (const relativePath of PROVIDERS) {
    vm.runInContext(readFileSync(join(root, relativePath), 'utf8'), context, { filename: relativePath });
  }
  const canvas = document.createElement('canvas');
  const hitTest = () => browserRoot.RLCHART.tip('Legacy point', [['value', '64%']], 'Legacy function attach');
  browserRoot.RLCHART.attach(canvas, hitTest);
  const values = {
    glossary: {
      definition: browserRoot.__rlg.G.gamma[0],
      interpretation: browserRoot.__rlg.G.gamma[1],
      labelKey: browserRoot.__rlg.labelKey('Net gamma by strike'),
      macroRisk: browserRoot.RLG.macroRegime({ fg: { score: 65 }, vix: 32 }).risk
    },
    ticker: {
      href: browserRoot.RLTKR.href('^VIX'),
      kind: browserRoot.RLTKR.kind('SPY'),
      name: browserRoot.RLTKR.name('SPY'),
      normalized: browserRoot.RLTKR.normTicker(' spy ')
    },
    chart: {
      decluttered: browserRoot.RLCHART.declutterY([{ y: 10 }, { y: 11 }], 12, 0, 40).map((item) => item.ly),
      nearest: browserRoot.RLCHART.nearestIndex([1, 4, 9], 6),
      tooltip: browserRoot.RLCHART.tip('Legacy point', [['value', '64%']], 'Legacy function attach')
    }
  };
  return {
    legacyChartAttach: typeof browserRoot.RLCHART.attach === 'function'
      && canvas.__rlhit === hitTest
      && canvas.getAttribute('data-rlchart') === '1'
      && canvas.__listeners.has('mousemove'),
    legacyRLG: browserRoot.__rlg.labelKey('Net gamma by strike') === 'gex'
      && typeof browserRoot.RLG.macroRegime === 'function',
    legacyTickerLink: browserRoot.RLTKR.href('SPY') === 'https://finance.yahoo.com/quote/SPY'
      && /<a[^>]+href="https:\/\/finance\.yahoo\.com\/quote\/SPY"/.test(browserRoot.RLTKR.tag('SPY')),
    values
  };
}

function loadCurrentOwnerValues(root) {
  const browserRoot = {
    URL,
    clearTimeout,
    console,
    crypto: globalThis.crypto,
    setTimeout,
    TextEncoder
  };
  browserRoot.globalThis = browserRoot;
  browserRoot.window = browserRoot;
  const context = vm.createContext(browserRoot);
  for (const relativePath of ['rlexperience.js', 'rlcontext.js', ...PROVIDERS]) {
    vm.runInContext(readFileSync(join(root, relativePath), 'utf8'), context, { filename: relativePath });
  }
  const gamma = browserRoot.RLG.lookup('gamma');
  return {
    glossary: {
      definition: gamma.definition,
      interpretation: gamma.interpretation,
      labelKey: browserRoot.RLG.labelKey('Net gamma by strike'),
      macroRisk: browserRoot.RLG.macroRegime({ fg: { score: 65 }, vix: 32 }).risk
    },
    ticker: {
      href: browserRoot.RLTKR.href('^VIX'),
      kind: browserRoot.RLTKR.kind('SPY'),
      name: browserRoot.RLTKR.name('SPY'),
      normalized: browserRoot.RLTKR.normTicker(' spy ')
    },
    chart: {
      decluttered: Array.from(browserRoot.RLCHART.declutterY([{ y: 10 }, { y: 11 }], 12, 0, 40), (item) => item.ly),
      nearest: browserRoot.RLCHART.nearestIndex([1, 4, 9], 6),
      tooltip: browserRoot.RLCHART.tip('Legacy point', [['value', '64%']], 'Legacy function attach')
    }
  };
}

function ownerValueFingerprints(values) {
  return Object.fromEntries(Object.entries(values).map(([owner, value]) => [
    owner,
    sha256(Buffer.from(JSON.stringify(value)))
  ]));
}

function verifyLegacyCanaryPages(root) {
  const pageRules = new Map([
    ['market-heatmap-lab.html', [/src="rlg\.js/, /src="rlchart\.js/, /src="rlticker\.js/, /RLCHART\.attach\(cv, function/]],
    ['options-structure-lab.html', [/id = "rlgtip"/, /src="rlchart\.js/, /src="rlticker\.js/, /RLCHART\.attach\(cv, function/]],
    ['company-fundamentals-lab.html', [/src="rlg\.js/, /src="rlchart\.js/, /src="rlticker\.js/]]
  ]);
  let passed = 0;
  for (const [relativePath, patterns] of pageRules) {
    const bytes = readFileSync(join(root, relativePath));
    const source = bytes.toString('utf8');
      assert.equal(bytes.equals(baselineBytes(relativePath)), true, `${relativePath} must use exact pinned pre-Scope-03 baseline bytes`);
      assert.doesNotMatch(source, DECORATOR_MARKER);
    for (const pattern of patterns) assert.match(source, pattern, `${relativePath} missing legacy page canary ${pattern}`);
    passed += 1;
  }
  return passed;
}

function runExactCommand(command, args, cwd) {
  const childEnvironment = {
    ...process.env,
    [PROCESS_PROOF_CHILD]: '1'
  };
  delete childEnvironment.NODE_TEST_CONTEXT;
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: childEnvironment,
    timeout: 120000
  });
}

function commandOutput(result) {
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function assertIntendedRed(entry, result) {
  const output = commandOutput(result);
  assert.equal(result.error, undefined, `${entry.id} failed to start: ${result.error?.message || ''}`);
  assert.notEqual(result.status, null, `${entry.id} timed out or was terminated: ${output}`);
  assert.notEqual(result.status, 0, `${entry.id} must be RED in the rollback baseline: ${output}`);
  assert.match(output, entry.redPattern, `${entry.id} must fail on missing contextual production behavior`);
  for (const pattern of RED_INFRASTRUCTURE_PATTERNS) {
    assert.doesNotMatch(output, pattern, `${entry.id} RED must not be syntax, discovery, package, Chrome, or server failure`);
  }
}

function assertExpectedGreen(entry, result) {
  const output = commandOutput(result);
  assert.equal(result.error, undefined, `${entry.id} failed to start: ${result.error?.message || ''}`);
  assert.equal(result.status, 0, `${entry.id} must be GREEN after exact current-byte restore: ${output}`);
  assert.match(output, entry.greenPattern, `${entry.id} must report ${entry.greenCount}`);
}

function loadBrowserStack() {
  const browserRoot = {
    URL,
    clearTimeout,
    console,
    crypto: globalThis.crypto,
    setTimeout,
    TextEncoder
  };
  browserRoot.globalThis = browserRoot;
  browserRoot.window = browserRoot;
  const context = vm.createContext(browserRoot);
  browserRoot.__vmContext = context;
  for (const file of ['rlexperience.js', 'rlcontext.js', ...PROVIDERS]) {
    vm.runInContext(read(file), context, { filename: file });
  }
  return browserRoot;
}

function loadBrowserFiles(files) {
  const browserRoot = {
    URL,
    clearTimeout,
    console,
    crypto: globalThis.crypto,
    setTimeout,
    TextEncoder
  };
  browserRoot.globalThis = browserRoot;
  browserRoot.window = browserRoot;
  const context = vm.createContext(browserRoot);
  browserRoot.__vmContext = context;
  for (const file of files) vm.runInContext(read(file), context, { filename: file });
  return browserRoot;
}

function browserRecord(browser, value) {
  browser.__fixtureJson = JSON.stringify(value);
  const record = vm.runInContext('JSON.parse(__fixtureJson)', browser.__vmContext);
  delete browser.__fixtureJson;
  return record;
}

function makeContext(overrides = {}) {
  return {
    contractVersion: 'contextual-tooltip/v1',
    contextId: 'functional/point-a',
    triggerKind: 'chart-point',
    label: 'Point A',
    definition: 'A source-qualified analytical point used by the functional canary.',
    displayed: {
      valueText: '64%',
      numericValue: 64,
      unit: 'percent',
      truthState: 'current'
    },
    interpretation: {
      text: '64% is above the owner-declared 60% participation threshold for this one-day window.',
      direction: 'threshold-dependent',
      comparisonBasis: 'Observed constituents with complete one-day returns',
      window: '1 trading day',
      thresholdsOrBounds: ['broad participation >= 60%']
    },
    provenance: {
      ownerId: 'functional-canary',
      modelId: 'functional-owner-model',
      evidenceIdentity: 'functional/point-a/2026-07-23T00:00:00Z',
      sourceRefs: ['fixture:functional:point-a'],
      observedAsOf: '2026-07-23T00:00:00Z',
      retrievedOrPublishedAt: '2026-07-23T00:01:00Z',
      freshness: 'fresh',
      dataTier: 'test-fixture'
    },
    uncertainty: {
      state: 'bounded',
      rangeOrBand: '62%-66%',
      reason: 'The owner model declares a four-point missing-observation band.'
    },
    limitation: 'This point measures participation and does not establish durability.',
    triggerCondition: 'The owner-declared participation threshold remains satisfied.',
    invalidationCondition: 'Participation falls below 60% or observation coverage becomes incomplete.',
    links: {
      owner: 'market-heatmap-lab.html#power',
      citation: '',
      sameDataTable: '#heatmap-row-point-a',
      ticker: 'https://finance.yahoo.com/quote/SPY'
    },
    accessibility: {
      conciseLabel: 'Point A 64 percent, current',
      longDescriptionId: 'rlcontext-functional-point-a'
    },
    contextFingerprint: null,
    ...overrides
  };
}

test('TP-03-02 RLG retains glossary aliases and macro ownership while composing RLCTX contexts', () => {
  const browser = loadBrowserFiles(['rlexperience.js', 'rlcontext.js', 'rlg.js']);
  const gamma = browser.RLG.lookup('Net gamma by strike');
  const context = browser.RLG.contextFor('Net gamma by strike');

  assert.equal(gamma.key, 'gex');
  assert.equal(gamma.definition, 'Gamma Exposure — aggregate dealer gamma across all strikes, in dollars of hedging per 1% move.');
  assert.equal(browser.RLG.macroRegime({ fg: { score: 65 }, vix: 32 }).risk, 1);
  assert.equal(browser.RLCTX.validateContext(context).ok, true);
  assert.equal(context.definition, gamma.definition);
  assert.equal(context.interpretation.text, gamma.interpretation);
});

test('TP-03-02 RLTKR retains public identity and Yahoo navigation while composing a separate RLCTX control', () => {
  const browser = loadBrowserFiles(['rlexperience.js', 'rlcontext.js', 'rlticker.js']);
  const context = browser.RLTKR.context('SPY');
  const markup = browser.RLTKR.tag('SPY');

  assert.equal(browser.RLTKR.name('SPY'), 'SPDR S&P 500 ETF');
  assert.equal(browser.RLTKR.kind('SPY'), 'Index ETF');
  assert.equal(browser.RLTKR.href('SPY'), 'https://finance.yahoo.com/quote/SPY');
  assert.equal(browser.RLCTX.validateContext(context).ok, true);
  assert.match(markup, /<a[^>]+href="https:\/\/finance\.yahoo\.com\/quote\/SPY"/);
  assert.match(markup, /<button[^>]+class="[^"]*rltkr-context/);
  assert.equal(/position|holding|cost basis|p&l/i.test(JSON.stringify(context)), false);
});

test('TP-03-02 RLCHART validates exact contexts stable point rails and same-data targets', () => {
  const browser = loadBrowserFiles(['rlexperience.js', 'rlcontext.js', 'rlchart.js']);
  const pointContext = browserRecord(browser, makeContext());
  const result = browser.RLCHART.validateStructuredAdapter({
    hitTest: () => 'point-a',
    orderedPointIds: ['point-a'],
    contextFor: () => pointContext,
    tableTargetFor: (pointId) => `heatmap-row-${pointId}`,
    seriesOrder: ['breadth']
  });

  assert.equal(result.ok, true, JSON.stringify(result.error));
  assert.equal(result.value.orderedPointIds[0], 'point-a');
  assert.equal(result.value.points['point-a'].contextFingerprint.startsWith('sha256:'), true);
  assert.equal(result.value.tableTargets['point-a'], 'heatmap-row-point-a');
});

test('TP-03-02 providers compose validated owner contexts through one RLCTX API', () => {
  const browser = loadBrowserStack();

  assert.equal(browser.RLCTX.CONTROLLER_ID, 'rlcontext-disclosure');
  assert.equal(typeof browser.RLCTX.createController, 'function');
  assert.equal(typeof browser.RLCTX.bind, 'function');
  assert.equal(typeof browser.RLG.lookup, 'function');
  assert.equal(typeof browser.RLG.contextFor, 'function');
  assert.equal(typeof browser.RLTKR.context, 'function');
  assert.equal(typeof browser.RLCHART.validateStructuredAdapter, 'function');

  const glossary = browser.RLG.contextFor('gamma');
  const ticker = browser.RLTKR.context('SPY');
  assert.equal(browser.RLCTX.validateContext(glossary).ok, true);
  assert.equal(browser.RLCTX.validateContext(ticker).ok, true);
  assert.equal(glossary.definition, browser.RLG.lookup('gamma').definition);
  assert.equal(ticker.displayed.valueText, 'SPY');
  assert.equal(ticker.links.ticker, browser.RLTKR.href('SPY'));
  assert.equal(/position|holding|cost basis|p&l/i.test(JSON.stringify(ticker)), false);
});

test('TP-03-02 structured chart adapter freezes stable point order and exact table projection', () => {
  const browser = loadBrowserStack();
  const pointContext = browserRecord(browser, makeContext());
  const result = browser.RLCHART.validateStructuredAdapter({
    hitTest: () => 'point-a',
    orderedPointIds: ['point-a'],
    contextFor: () => pointContext,
    tableTargetFor: (pointId) => `heatmap-row-${pointId}`,
    seriesOrder: ['breadth']
  });

  assert.equal(result.ok, true, JSON.stringify(result.error));
  assert.equal(Object.isFrozen(result.value), true);
  assert.equal(Object.isFrozen(result.value.orderedPointIds), true);
  assert.deepEqual(Array.from(result.value.orderedPointIds), ['point-a']);
  assert.equal(result.value.points['point-a'].links.sameDataTable, '#heatmap-row-point-a');
  assert.equal(result.value.tableTargets['point-a'], 'heatmap-row-point-a');
});

test('TP-03-02 active providers and canary pages contain one disclosure owner and no private engines', () => {
  for (const file of PROVIDERS) {
    assert.doesNotMatch(read(file), FORBIDDEN_ENGINES, `${file} still owns a private tooltip engine`);
    assert.match(read(file), /RLCTX/, `${file} does not delegate disclosure to RLCTX`);
  }

  const controllerSource = read('rlcontext.js');
  assert.match(controllerSource, /rlcontext-disclosure/);
  for (const page of CANARY_PAGES) {
    const source = read(page);
    assert.match(source, /<script src="rlexperience\.js"/);
    assert.match(source, /<script src="rlcontext\.js"/);
    assert.doesNotMatch(source, FORBIDDEN_ENGINES, `${page} still embeds a private tooltip engine`);
  }
});

test('TP-03-02 provider ownership canaries preserve glossary ticker and chart calculations', () => {
  const browser = loadBrowserStack();
  const gamma = browser.RLG.lookup('gamma');

  assert.equal(gamma.definition, 'Rate of change of delta per $1 move — how fast hedges must be adjusted.');
  assert.equal(browser.RLG.labelKey('Net gamma by strike'), 'gex');
  assert.equal(browser.RLG.macroRegime({ fg: { score: 65 }, vix: 32 }).risk, 1);
  assert.equal(browser.RLTKR.normTicker(' spy '), 'SPY');
  assert.equal(browser.RLTKR.name('SPY'), 'SPDR S&P 500 ETF');
  assert.equal(browser.RLTKR.kind('SPY'), 'Index ETF');
  assert.equal(browser.RLTKR.href('^VIX'), 'https://finance.yahoo.com/quote/%5EVIX');
  assert.equal(browser.RLCHART.nearestIndex([1, 4, 9], 6), 1);
  assert.equal(browser.RLCHART.declutterY([{ y: 10 }, { y: 11 }], 12, 0, 40)[1].ly, 22);
});

if (process.env[PROCESS_PROOF_CHILD] !== '1') {
  test('Regression: F-BUG002-008 scoped rollback oracle catches governed mutation and ignores unrelated concurrent files', () => {
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope03-oracle-'));
    const sandboxRoot = join(temporaryRoot, 'worktree');
    const unrelatedPath = 'concurrency-control/unrelated-report.md';
    const expectedGovernedPaths = [
      'rlcontext.js',
      'rlg.js',
      'rlticker.js',
      'rlchart.js',
      'market-heatmap-lab.html',
      'options-structure-lab.html',
      'company-fundamentals-lab.html',
      'scripts/selftest.mjs',
      'tests/contextual-tooltip.unit.mjs',
      'tests/contextual-tooltip.functional.mjs',
      'tests/contextual-tooltip.spec.mjs'
    ];
    const mutationLedger = [];
    let governedMutationDetected = false;
    let unauthorizedMutationRejected = false;

    try {
      assert.deepEqual(SCOPE03_GOVERNED_PATHS, expectedGovernedPaths);
      assert.deepEqual(SCOPE03_ROLLBACK_MUTATION_PATHS, expectedGovernedPaths.slice(0, 8));
      for (const relativePath of SCOPE03_GOVERNED_PATHS) {
        mkdirSync(dirname(join(sandboxRoot, relativePath)), { recursive: true });
        cpSync(join(ROOT, relativePath), join(sandboxRoot, relativePath));
      }
      const before = governedSnapshot(sandboxRoot);
      const changedContext = Buffer.from(before.get('rlcontext.js').bytes);
      changedContext[0] ^= 1;
      writeFileSync(join(sandboxRoot, 'rlcontext.js'), changedContext);
      assert.throws(
        () => assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), before, 'governed mutation control'),
        /governed mutation control: governed path changed: rlcontext\.js/
      );
      governedMutationDetected = true;
      writeFileSync(join(sandboxRoot, 'rlcontext.js'), before.get('rlcontext.js').bytes);
      assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), before, 'governed mutation restoration');

      let unauthorizedOperationRan = false;
      assert.throws(
        () => recordScope03Mutation(unrelatedPath, {
          kind: 'write',
          ledger: mutationLedger,
          apply() {
            unauthorizedOperationRan = true;
            writeFileSync(join(sandboxRoot, unrelatedPath), 'unauthorized rollback write\n');
          }
        }),
        /Scope 03 rollback mutation path is not authorized: concurrency-control\/unrelated-report\.md/
      );
      unauthorizedMutationRejected = true;
      assert.equal(unauthorizedOperationRan, false, 'unauthorized rollback operation must be rejected before mutation');
      assert.equal(existsSync(join(sandboxRoot, unrelatedPath)), false, 'unauthorized rollback path must remain absent');

      mkdirSync(dirname(join(sandboxRoot, unrelatedPath)), { recursive: true });
      writeFileSync(join(sandboxRoot, unrelatedPath), 'concurrent report changed during rollback\n');
      assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), before, 'unrelated concurrency control');

      applyLegacyBaseline(sandboxRoot, mutationLedger);
      prepareLegacyReplayDependencies(sandboxRoot, mutationLedger);
      restoreSnapshot(sandboxRoot, snapshot(ROOT, SCOPE03_ROLLBACK_MUTATION_PATHS), mutationLedger);
      assertScope03MutationSet(mutationLedger, SCOPE03_ROLLBACK_MUTATION_PATHS, 'oracle control rehearsal');
      assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), before, 'oracle control restored sandbox');
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
      assert.equal(existsSync(temporaryRoot), false, 'oracle control temporary root must always be removed');
    }

    console.log(`[scope03-oracle] governedFiles=${SCOPE03_GOVERNED_PATHS.length}`);
    console.log(`[scope03-oracle] rollbackMutationFiles=${SCOPE03_ROLLBACK_MUTATION_PATHS.length}`);
    console.log(`[scope03-oracle] governedMutationDetected=${governedMutationDetected}`);
    console.log(`[scope03-oracle] unauthorizedMutationRejected=${unauthorizedMutationRejected}`);
    console.log('[scope03-oracle] unrelatedConcurrentControlIgnored=true');
  });

  test('SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes', {
    timeout: 120000
  }, () => {
    const realWorktreeBefore = governedSnapshot(ROOT);
    const currentSnapshot = snapshot(ROOT, SCOPE03_ROLLBACK_MUTATION_PATHS);
    const mutationLedger = [];
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope03-rollback-'));
    const sandboxRoot = join(temporaryRoot, 'worktree');
    let proof;
    let fixtureControls;

    try {
      fixtureControls = verifyLegacyFixtureFailureControls(temporaryRoot);
      copyRepositoryForReplay(sandboxRoot);
      applyLegacyBaseline(sandboxRoot, mutationLedger);
      for (const relativePath of LEGACY_AUTHORITY_PATHS) {
        assert.equal(
          sha256(readFileSync(join(sandboxRoot, relativePath))),
          sha256(baselineBytes(relativePath)),
            `${relativePath} must equal the manifest-backed pre-Scope-03 baseline authority`
        );
      }
      assert.equal(existsSync(join(sandboxRoot, 'rlcontext.js')), false, 'pre-Scope-03 sandbox must not retain rlcontext.js');
      const legacy = loadLegacyProviderState(sandboxRoot);
      const legacyCanaryPages = verifyLegacyCanaryPages(sandboxRoot);
      const legacyFingerprints = ownerValueFingerprints(legacy.values);
      assert.equal(legacy.legacyRLG, true);
      assert.equal(legacy.legacyTickerLink, true);
      assert.equal(legacy.legacyChartAttach, true);
      assert.equal(legacyCanaryPages, 3);

      restoreSnapshot(sandboxRoot, currentSnapshot, mutationLedger);        // Companion current-state proof (BUG-002 design Principle 2). The legacy expectation
        // above only carries meaning if the MODERN pages genuinely DO carry the Scope 03
        // decorator wiring. Without this direction, pinning the baseline could mask a
        // regression that stripped the decorators from production entirely.
        for (const relativePath of CANARY_PAGES) {
          assert.match(
            readFileSync(join(sandboxRoot, relativePath), 'utf8'),
            DECORATOR_MARKER,
            `${relativePath} must carry Scope 03 decorator wiring once the current bytes are restored`
          );
        }      const restoredValues = loadCurrentOwnerValues(sandboxRoot);
      const restoredFingerprints = ownerValueFingerprints(restoredValues);
      assert.deepEqual(restoredFingerprints, legacyFingerprints, 'owner-value fingerprints must survive rollback and exact restore');
      assertScope03MutationSet(mutationLedger, SCOPE03_ROLLBACK_MUTATION_PATHS, 'isolated rollback rehearsal');
      assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), realWorktreeBefore, 'isolated rollback restored sandbox');
      assertGovernedInventoryEqual(governedSnapshot(ROOT), realWorktreeBefore, 'isolated rollback real worktree');
      proof = {
        legacyCanaryPages,
        legacyChartAttach: legacy.legacyChartAttach,
        legacyRLG: legacy.legacyRLG,
        legacyTickerLink: legacy.legacyTickerLink,
        ownerValueFingerprints: restoredFingerprints
      };
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
      assert.equal(existsSync(temporaryRoot), false, 'rollback rehearsal temporary root must always be removed');
    }

    const manifest = loadLegacyFixtureManifest();
  console.log(`[scope03-rollback] baselineAuthority=fixture:${relative(ROOT, LEGACY_FIXTURE_ROOT)} contract=${manifest.contractVersion} sourceCommit=${manifest.provenance.sourceCommit} authorityFiles=${LEGACY_AUTHORITY_PATHS.length} governedFiles=${SCOPE03_GOVERNED_PATHS.length} rollbackMutationFiles=${SCOPE03_ROLLBACK_MUTATION_PATHS.length}`);
    console.log(`[scope03-rollback] fixtureControls=${JSON.stringify(fixtureControls)}`);
    console.log(`[scope03-rollback] legacyRLG=${proof.legacyRLG} legacyTickerLink=${proof.legacyTickerLink} legacyChartAttach=${proof.legacyChartAttach}`);
    console.log(`[scope03-rollback] legacyCanaryPages=${proof.legacyCanaryPages}/3`);
    console.log(`[scope03-rollback] ownerValueFingerprints=${JSON.stringify(proof.ownerValueFingerprints)} unchanged=true`);
    console.log('[scope03-rollback] governedHashesEqual=true actualRollbackWriteSetEqual=true');
    console.log('[scope03-rollback] tempRootRemoved=true');
  });

  test('SCN-012-003 exact TP-03-01 through TP-03-05 commands replay RED then GREEN in isolated rollback baseline', {
    timeout: 180000
  }, () => {
    const commands = [
      {
        id: 'TP-03-01',
        command: process.execPath,
        args: ['--test', 'tests/contextual-tooltip.unit.mjs'],
        redPattern: /production contract missing: rlcontext\.js|ENOENT[^\n]*rlcontext\.js/,
        greenPattern: /pass 5\b/,
        greenCount: '5/5'
      },
      {
        id: 'TP-03-02',
        command: process.execPath,
        args: ['--test', 'tests/contextual-tooltip.functional.mjs'],
        redPattern: /ENOENT[\s\S]*rlcontext\.js|RLCTX|contextFor|validateStructuredAdapter/,
        greenPattern: /pass 7\b/,
        greenCount: '7/7 child guard'
      },
      {
        id: 'TP-03-03',
        command: 'npx',
        args: [
          '--no-install', 'playwright', 'test', 'tests/contextual-tooltip.spec.mjs',
          '--config=playwright.config.mjs', '--project=system-chrome',
          '--grep', 'Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table',
          '--reporter=list'
        ],
        redPattern: /data-rlchart-mode|structured|rlcontext-disclosure|same-data table/i,
        greenPattern: /1 passed/,
        greenCount: '1/1'
      },
      {
        id: 'TP-03-04',
        command: 'npx',
        args: [
          '--no-install', 'playwright', 'test', 'tests/contextual-tooltip.spec.mjs',
          '--config=playwright.config.mjs', '--project=system-chrome',
          '--grep', 'Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers',
          '--reporter=list'
        ],
        redPattern: /data-rlchart-mode|structured|rlcontext-disclosure|E012-CONTEXT-MISSING/i,
        greenPattern: /1 passed/,
        greenCount: '1/1'
      },
      {
        id: 'TP-03-05',
        command: 'npx',
        args: [
          '--no-install', 'playwright', 'test', 'tests/contextual-tooltip.spec.mjs',
          '--config=playwright.config.mjs', '--project=system-chrome',
          '--grep', 'Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas',
          '--reporter=list'
        ],
        redPattern: /data-rlchart-mode|structured|rlcontext-disclosure|data-rlchart-unavailable|same-data table/i,
        greenPattern: /1 passed/,
        greenCount: '1/1'
      }
    ];
    const realWorktreeBefore = governedSnapshot(ROOT);
    const currentProduction = snapshot(ROOT, SCOPE03_ROLLBACK_MUTATION_PATHS);
    const mutationLedger = [];
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope03-exact-replay-'));
    const sandboxRoot = join(temporaryRoot, 'worktree');
    let redResults;
    let greenResults;

    try {
      copyRepositoryForReplay(sandboxRoot);
      applyLegacyBaseline(sandboxRoot, mutationLedger);
      // The true pre-Scope-03 page predates the later hydration sentinel awaited by the
      // unchanged current-route browser test. Add only that inert readiness prerequisite
      // in the disposable sandbox so the exact command reaches its contextual assertion.
      prepareLegacyReplayDependencies(sandboxRoot, mutationLedger);
      redResults = commands.map((entry) => {
        const result = runExactCommand(entry.command, entry.args, sandboxRoot);
        assertIntendedRed(entry, result);
        return { entry, result };
      });

      restoreSnapshot(sandboxRoot, currentProduction, mutationLedger);
      greenResults = commands.map((entry) => {
        const result = runExactCommand(entry.command, entry.args, sandboxRoot);
        assertExpectedGreen(entry, result);
        return { entry, result };
      });

      assertScope03MutationSet(mutationLedger, SCOPE03_ROLLBACK_MUTATION_PATHS, 'exact replay rehearsal');
      assertGovernedInventoryEqual(governedSnapshot(sandboxRoot), realWorktreeBefore, 'exact replay restored sandbox');
      assertGovernedInventoryEqual(governedSnapshot(ROOT), realWorktreeBefore, 'exact replay real worktree');
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
      assert.equal(existsSync(temporaryRoot), false, 'exact replay temporary root must always be removed');
    }

    const manifest = loadLegacyFixtureManifest();
    console.log(`[scope03-exact-replay] sandbox=${basename(temporaryRoot)} baselineAuthority=fixture:${relative(ROOT, LEGACY_FIXTURE_ROOT)} contract=${manifest.contractVersion} sourceCommit=${manifest.provenance.sourceCommit} authorityFiles=${LEGACY_AUTHORITY_PATHS.length}`);
    console.log(`[scope03-exact-replay] redPrerequisite=${LEGACY_REPLAY_HYDRATION_MARKER} sandboxOnly=true decoratorsAdded=false`);
    for (const { entry, result } of redResults) {
      console.log(`[scope03-exact-replay] RED-stage ${entry.id} exit=${result.status} discriminator=missing-contextual-foundation`);
    }
    console.log('[scope03-exact-replay] restore productionHashesEqual=true');
    for (const { entry, result } of greenResults) {
      console.log(`[scope03-exact-replay] GREEN-stage ${entry.id} exit=${result.status} expectedCount=${entry.greenCount}`);
    }
    console.log(`[scope03-exact-replay] governedFiles=${SCOPE03_GOVERNED_PATHS.length} rollbackMutationFiles=${SCOPE03_ROLLBACK_MUTATION_PATHS.length}`);
    console.log('[scope03-exact-replay] governedHashesEqual=true actualRollbackWriteSetEqual=true');
    console.log('[scope03-exact-replay] tempRootRemoved=true');
  });
}