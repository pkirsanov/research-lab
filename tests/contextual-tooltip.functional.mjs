import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve } from 'node:path';
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
const SCOPE03_PRODUCTION_PATHS = Object.freeze([
  'rlcontext.js',
  ...LEGACY_AUTHORITY_PATHS
]);
const SCOPE03_CURRENT_PATHS = Object.freeze([
  ...SCOPE03_PRODUCTION_PATHS,
  'tests/contextual-tooltip.unit.mjs',
  'tests/contextual-tooltip.functional.mjs',
  'tests/contextual-tooltip.spec.mjs'
]);
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

function listRegularFiles(root, relativeDirectory = '') {
  const absoluteDirectory = join(root, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      if (relativeDirectory === '' && REPLAY_EXCLUDED_TOP_LEVEL.has(entry.name)) return [];
      const relativePath = join(relativeDirectory, entry.name);
      if (entry.isDirectory()) return listRegularFiles(root, relativePath);
      return entry.isFile() ? [relativePath] : [];
    });
}

function snapshot(root, relativePaths) {
  return new Map(relativePaths.map((relativePath) => {
    const bytes = readFileSync(join(root, relativePath));
    return [relativePath, { bytes, hash: sha256(bytes) }];
  }));
}

function hashInventory(root, relativePaths) {
  return new Map(relativePaths.map((relativePath) => [
    relativePath,
    sha256(readFileSync(join(root, relativePath)))
  ]));
}

function restoreSnapshot(root, sourceSnapshot) {
  for (const [relativePath, entry] of sourceSnapshot) {
    writeFileSync(join(root, relativePath), entry.bytes);
  }
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

function baselineBytes(relativePath) {
  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: ROOT });
}

function applyLegacyBaseline(sandboxRoot) {
  for (const relativePath of LEGACY_AUTHORITY_PATHS) {
    writeFileSync(join(sandboxRoot, relativePath), baselineBytes(relativePath));
  }
  rmSync(join(sandboxRoot, 'rlcontext.js'), { force: true });
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
    assert.equal(bytes.equals(baselineBytes(relativePath)), true, `${relativePath} must use exact HEAD authority bytes`);
    assert.doesNotMatch(source, /src="rlcontext\.js|src="rlexperience\.js/);
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
  test('SCN-012-003 isolated rollback restores legacy providers and exact current Scope 03 bytes', {
    timeout: 120000
  }, () => {
    const worktreePaths = listRegularFiles(ROOT);
    const currentSet = new Set(SCOPE03_CURRENT_PATHS);
    const protectedPaths = worktreePaths.filter((relativePath) => !currentSet.has(relativePath));
    const realWorktreeBefore = hashInventory(ROOT, worktreePaths);
    const currentSnapshot = snapshot(ROOT, SCOPE03_CURRENT_PATHS);
    const currentHashes = hashInventory(ROOT, SCOPE03_CURRENT_PATHS);
    const protectedHashes = hashInventory(ROOT, protectedPaths);
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope03-rollback-'));
    const sandboxRoot = join(temporaryRoot, 'worktree');
    let proof;

    try {
      copyRepositoryForReplay(sandboxRoot);
      applyLegacyBaseline(sandboxRoot);
      for (const relativePath of LEGACY_AUTHORITY_PATHS) {
        assert.equal(
          sha256(readFileSync(join(sandboxRoot, relativePath))),
          sha256(baselineBytes(relativePath)),
          `${relativePath} must equal git show HEAD authority`
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
      assert.deepEqual(hashInventory(sandboxRoot, protectedPaths), protectedHashes);

      restoreSnapshot(sandboxRoot, currentSnapshot);
      const restoredValues = loadCurrentOwnerValues(sandboxRoot);
      const restoredFingerprints = ownerValueFingerprints(restoredValues);
      assert.deepEqual(restoredFingerprints, legacyFingerprints, 'owner-value fingerprints must survive rollback and exact restore');
      assert.deepEqual(hashInventory(sandboxRoot, SCOPE03_CURRENT_PATHS), currentHashes);
      assert.deepEqual(hashInventory(sandboxRoot, protectedPaths), protectedHashes);
      assert.deepEqual(hashInventory(ROOT, worktreePaths), realWorktreeBefore);
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

    console.log(`[scope03-rollback] baselineAuthority=git:HEAD authorityFiles=${LEGACY_AUTHORITY_PATHS.length} currentFiles=${SCOPE03_CURRENT_PATHS.length} protectedFiles=${protectedPaths.length}`);
    console.log(`[scope03-rollback] legacyRLG=${proof.legacyRLG} legacyTickerLink=${proof.legacyTickerLink} legacyChartAttach=${proof.legacyChartAttach}`);
    console.log(`[scope03-rollback] legacyCanaryPages=${proof.legacyCanaryPages}/3`);
    console.log(`[scope03-rollback] ownerValueFingerprints=${JSON.stringify(proof.ownerValueFingerprints)} unchanged=true`);
    console.log('[scope03-rollback] currentHashesEqual=true protectedHashesEqual=true realWorktreeHashesEqual=true');
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
    const worktreePaths = listRegularFiles(ROOT);
    const productionSet = new Set(SCOPE03_PRODUCTION_PATHS);
    const protectedPaths = worktreePaths.filter((relativePath) => !productionSet.has(relativePath));
    const realWorktreeBefore = hashInventory(ROOT, worktreePaths);
    const currentProduction = snapshot(ROOT, SCOPE03_PRODUCTION_PATHS);
    const productionHashes = hashInventory(ROOT, SCOPE03_PRODUCTION_PATHS);
    const protectedHashes = hashInventory(ROOT, protectedPaths);
    const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope03-exact-replay-'));
    const sandboxRoot = join(temporaryRoot, 'worktree');
    let redResults;
    let greenResults;

    try {
      copyRepositoryForReplay(sandboxRoot);
      applyLegacyBaseline(sandboxRoot);
      redResults = commands.map((entry) => {
        const result = runExactCommand(entry.command, entry.args, sandboxRoot);
        assertIntendedRed(entry, result);
        return { entry, result };
      });

      restoreSnapshot(sandboxRoot, currentProduction);
      greenResults = commands.map((entry) => {
        const result = runExactCommand(entry.command, entry.args, sandboxRoot);
        assertExpectedGreen(entry, result);
        return { entry, result };
      });

      assert.deepEqual(hashInventory(sandboxRoot, SCOPE03_PRODUCTION_PATHS), productionHashes);
      assert.deepEqual(hashInventory(sandboxRoot, protectedPaths), protectedHashes);
      assert.deepEqual(hashInventory(ROOT, worktreePaths), realWorktreeBefore);
    } finally {
      rmSync(temporaryRoot, { recursive: true, force: true });
      assert.equal(existsSync(temporaryRoot), false, 'exact replay temporary root must always be removed');
    }

    console.log(`[scope03-exact-replay] sandbox=${basename(temporaryRoot)} baselineAuthority=git:HEAD authorityFiles=${LEGACY_AUTHORITY_PATHS.length}`);
    for (const { entry, result } of redResults) {
      console.log(`[scope03-exact-replay] RED-stage ${entry.id} exit=${result.status} discriminator=missing-contextual-foundation`);
    }
    console.log('[scope03-exact-replay] restore productionHashesEqual=true');
    for (const { entry, result } of greenResults) {
      console.log(`[scope03-exact-replay] GREEN-stage ${entry.id} exit=${result.status} expectedCount=${entry.greenCount}`);
    }
    console.log('[scope03-exact-replay] protectedHashesEqual=true realWorktreeHashesEqual=true');
    console.log('[scope03-exact-replay] tempRootRemoved=true');
  });
}