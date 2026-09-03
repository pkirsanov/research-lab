import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as directRuntime from 'playwright/test';
import playwrightConfig from '../playwright.config.mjs';
import {
  collectDeclaredTestGlobs,
  globToRegExp
} from '../scripts/validate-test-file-reachability.mjs';
import * as sharedRuntime from './playwright-runtime.mjs';

const ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const HELPER = resolve(ROOT, 'tests/playwright-runtime.mjs');
const TESTS_DIR = resolve(ROOT, 'tests');
const REACHABILITY_VALIDATOR = resolve(ROOT, 'scripts/validate-test-file-reachability.mjs');
const REACHABILITY_BASELINE = resolve(ROOT, 'scripts/validate-test-file-reachability.baseline');
const BUG022_BASELINE_CEILING = 26;
const LOCAL_PACKAGE = realpathSync(resolve(ROOT, 'node_modules/playwright'));
const LOCAL_CLI = realpathSync(resolve(ROOT, 'node_modules/.bin/playwright'));

/* A committed `playwright*.config.*`, discovered rather than named, so "sole
   committed browser config" is an assertion instead of an assumption. */
const PLAYWRIGHT_CONFIG_FILE = /(?:^|\/)playwright[^/]*\.config\.[cm]?[jt]s$/;

/* The `.test.mjs` family, kept as a literal because it is a naming convention
   with no behavioural signature to derive from: other node-selected families
   run under node:test too, yet may legitimately import the Playwright API —
   this very `.functional.mjs` file does, to compare runtime identity. */
const DIRECT_NODE_SUITE_SUFFIX = '.test.mjs';

/* Pre-existing crossings, frozen so NEW ones fail (the ratchet
   `scripts/validate-test-file-reachability.mjs` uses, for the same reason).
   `notes/causal-rotation-lab.md:119` and `specs/012-.../test-plan.json` declare
   `node --test` globs that also select browser specs; that debt predates this
   boundary. This list must shrink, never grow. */
const KNOWN_DISCOVERY_CROSSINGS = [
  'tests/causal-rotation-adversarial.spec.mjs',
  'tests/causal-rotation-brief.spec.mjs',
  'tests/causal-rotation-chaos.spec.mjs',
  'tests/causal-rotation-consumers.spec.mjs',
  'tests/causal-rotation-delivery.spec.mjs',
  'tests/causal-rotation-lab.spec.mjs',
  'tests/causal-rotation-pages.spec.mjs',
  'tests/causal-rotation-registry.spec.mjs',
  'tests/distributed-briefs.spec.mjs'
];

/* Both discovery sides are read from the repository at run time. A frozen
   inventory of either is the exact rot this file was repaired from, so the
   declared-glob derivation is imported from the reachability guard rather than
   reimplemented — one definition of "declared glob", not two. */
let declaredGlobsCache = null;
function declaredGlobs() {
  if (declaredGlobsCache === null) declaredGlobsCache = collectDeclaredTestGlobs(ROOT);
  return declaredGlobsCache;
}

function repoTestFiles() {
  return readdirSync(TESTS_DIR)
    .filter((name) => name.endsWith('.mjs'))
    .sort()
    .map((name) => `tests/${name}`);
}

function withDeclarationFixture(files, assertion) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-'));
  try {
    for (const [relativePath, source] of Object.entries(files)) {
      const absolutePath = resolve(fixtureRoot, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, source);
    }
    return assertion(fixtureRoot);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function declarationFor(result, pattern, kind = 'node-test-argument') {
  return result.globs.find((entry) => entry.pattern === pattern && entry.kind === kind);
}

/* Files a discovery mechanism actually selects, plus the patterns and the
   artifacts that declare them. */
function discovery(kind, testFiles) {
  const globs = declaredGlobs().globs.filter((glob) => glob.kind === kind);
  const patterns = globs.map((glob) => glob.pattern);
  const matchers = patterns.map(globToRegExp);
  return {
    patterns,
    declaredBy: [...new Set(globs.flatMap((glob) => glob.sites.map((site) => site.artifact)))].sort(),
    selected: testFiles.filter((path) => matchers.some((matcher) => matcher.test(path)))
  };
}

function committedPlaywrightConfigs() {
  const tracked = spawnSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' });
  assert.equal(tracked.status, 0, 'git ls-files must succeed to enumerate committed configs');
  return tracked.stdout.split('\0').filter((path) => PLAYWRIGHT_CONFIG_FILE.test(path)).sort();
}

test('shared runtime exports the exact checkout-local Playwright 1.61.1 API', () => {
  const manifest = JSON.parse(readFileSync(resolve(LOCAL_PACKAGE, 'package.json'), 'utf8'));
  const config = readFileSync(resolve(ROOT, 'playwright.config.mjs'), 'utf8');
  assert.equal(manifest.name, 'playwright');
  assert.equal(manifest.version, '1.61.1');
  assert.ok(LOCAL_PACKAGE.startsWith(ROOT + sep));
  assert.equal(LOCAL_CLI, realpathSync(resolve(LOCAL_PACKAGE, 'cli.js')));
  assert.equal(sharedRuntime.test, directRuntime.test);
  assert.equal(sharedRuntime.expect, directRuntime.expect);
  assert.equal(playwrightConfig.testMatch, '**/*.spec.mjs');
  assert.match(config, /channel:\s*'chrome'/);
  assert.doesNotMatch(config, /executablePath/);
  console.log('[playwright-runtime] package=' + LOCAL_PACKAGE.slice(ROOT.length + 1));
  console.log('[playwright-runtime] cli=' + LOCAL_CLI.slice(ROOT.length + 1));
  console.log('[playwright-runtime] version=' + manifest.version);
  console.log('[playwright-runtime] browserChannel=chrome');
  console.log('[playwright-runtime] apiIdentity=PASS');
});

test('shared runtime rejects sibling global-prefix and npm-cache Playwright packages', () => {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-playwright-runtime-'));
  const helperUrl = pathToFileURL(HELPER).href;
  const loaderPath = resolve(fixtureRoot, 'reject-local-loader.mjs');
  const cases = [
    ['sibling-repo', resolve(fixtureRoot, 'sibling-repo', 'node_modules', 'playwright')],
    ['global-prefix', resolve(fixtureRoot, 'global-prefix', 'lib', 'node_modules', 'playwright')],
    ['npm-cache-hash', resolve(fixtureRoot, 'npm-cache', '_npx', 'deadbeef', 'node_modules', 'playwright')]
  ];
  const accepted = [];

  writeFileSync(loaderPath, [
    'export async function resolve(specifier, context, nextResolve) {',
    `  if (specifier === 'playwright/test' && context.parentURL === ${JSON.stringify(helperUrl)}) {`,
    "    throw new Error('forced checkout-local resolution failure');",
    '  }',
    '  return nextResolve(specifier, context);',
    '}',
    ''
  ].join('\n'));

  try {
    for (const [label, packageDir] of cases) {
      mkdirSync(packageDir, { recursive: true });
      writeFileSync(resolve(packageDir, 'package.json'), JSON.stringify({
        name: 'playwright',
        version: '1.61.1',
        type: 'module'
      }, null, 2) + '\n');
      writeFileSync(resolve(packageDir, 'test.mjs'), [
        "export const test = 'BORROWED_RUNTIME';",
        "export const expect = 'BORROWED_RUNTIME';",
        ''
      ].join('\n'));
      const cliPath = resolve(packageDir, 'cli.mjs');
      writeFileSync(cliPath, [
        `const runtime = await import(${JSON.stringify(helperUrl)});`,
        "console.log('borrowed=' + runtime.test);",
        ''
      ].join('\n'));

      const result = spawnSync(process.execPath, [
        '--no-warnings',
        '--experimental-loader',
        pathToFileURL(loaderPath).href,
        cliPath
      ], {
        cwd: ROOT,
        encoding: 'utf8'
      });
      const borrowed = result.stdout.includes('BORROWED_RUNTIME');
      console.log(`[playwright-runtime] outside=${label} exit=${result.status} borrowed=${borrowed}`);
      if (result.status === 0 || borrowed) accepted.push(label);
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }

  assert.deepEqual(accepted, []);
});

test('shared runtime contains no browser executable or package fallback authority', () => {
  const source = readFileSync(HELPER, 'utf8');
  for (const forbidden of [
    'executablePath',
    'findPlaywrightPackage',
    'pathToFileURL',
    'process.argv'
  ]) {
    assert.equal(source.includes(forbidden), false, `forbidden runtime authority: ${forbidden}`);
  }
  console.log('[playwright-runtime] browserExecutableFallback=ABSENT');
  console.log('[playwright-runtime] externalPackageFallback=ABSENT');
});

test('every Playwright spec uses the shared seam and sole committed browser config', () => {
  const testFiles = repoTestFiles();
  const browser = discovery('playwright-testMatch', testFiles);
  const committedConfigs = committedPlaywrightConfigs();
  const importers = [];
  const absoluteOverrides = [];

  for (const specPath of browser.selected) {
    const source = readFileSync(resolve(ROOT, specPath), 'utf8');
    if (/from\s+['"]\.\/playwright-runtime\.mjs['"]/.test(source)) importers.push(specPath);
    if (source.includes('executablePath')) absoluteOverrides.push(specPath);
  }

  console.log('[playwright-runtime] committedBrowserConfigs=' + committedConfigs.join(','));
  console.log('[playwright-runtime] testMatch=' + browser.patterns.join(','));
  console.log('[playwright-runtime] discoveredSpecs=' + browser.selected.length);
  console.log('[playwright-runtime] sharedImporters=' + importers.length);
  console.log('[playwright-runtime] absoluteOverrides=' + absoluteOverrides.length);

  /* SOLE committed browser config: exactly one is tracked, and the discovery
     patterns are declared by that same file and nothing else. The identity of
     the file is derived, so renaming it does not need an edit here. */
  assert.equal(committedConfigs.length, 1, `expected one committed Playwright config, got ${committedConfigs.length}`);
  assert.deepEqual(browser.declaredBy, committedConfigs);

  /* Non-vacuity. A derivation that selects nothing would satisfy every
     per-spec assertion below without checking anything — the one guarantee the
     replaced literal count gave incidentally, now stated on purpose. */
  assert.ok(browser.patterns.length > 0, 'committed browser config declares no testMatch pattern');
  assert.ok(browser.selected.length > 0, 'committed testMatch selects no spec under tests/');

  /* The invariant, asserted per discovered spec: the count now follows from
     the derivation instead of being pinned to a number that rots. */
  assert.deepEqual(importers, browser.selected);
  assert.deepEqual(absoluteOverrides, []);
});

test('committed discovery boundary keeps browser specs and direct Node suites disjoint', () => {
  const testFiles = repoTestFiles();
  const browser = discovery('playwright-testMatch', testFiles);
  const directNode = discovery('node-test-argument', testFiles);
  const browserSelected = new Set(browser.selected);

  /* DISJOINTNESS as a set relation between the two runner-selection
     mechanisms: no file may be selected by both the browser matcher and a
     declared `node --test` glob. */
  const crossings = directNode.selected.filter((path) => browserSelected.has(path));
  const newCrossings = crossings.filter((path) => !KNOWN_DISCOVERY_CROSSINGS.includes(path));
  const staleFrozen = KNOWN_DISCOVERY_CROSSINGS.filter((path) => !crossings.includes(path));

  /* Derivation consistency: the statically parsed matcher equals the one the
     imported config exposes, so the parse driving discovery cannot drift. */
  const configuredTestMatch = Array.isArray(playwrightConfig.testMatch)
    ? playwrightConfig.testMatch
    : [playwrightConfig.testMatch];
  assert.deepEqual(browser.patterns, configuredTestMatch);

  assert.ok(browser.selected.length > 0, 'browser matcher selects nothing — disjointness would be vacuous');
  assert.ok(directNode.selected.length > 0, 'no declared node --test glob selects anything — disjointness would be vacuous');
  assert.deepEqual(newCrossings, [], 'file selected by both the browser matcher and a declared node --test glob');
  assert.deepEqual(staleFrozen, [], 'frozen crossing no longer crosses — remove it, the list only shrinks');

  const directNodeSuites = testFiles.filter((path) => path.endsWith(DIRECT_NODE_SUITE_SUFFIX));
  assert.ok(directNodeSuites.length > 0, 'no direct Node suite found under tests/');

  for (const specPath of browser.selected) {
    const source = readFileSync(resolve(ROOT, specPath), 'utf8');
    assert.match(
      source,
      /from\s+['"]\.\/playwright-runtime\.mjs['"]/,
      `${specPath} must import the shared Playwright runtime`
    );
  }

  for (const suitePath of directNodeSuites) {
    const source = readFileSync(resolve(ROOT, suitePath), 'utf8');
    assert.match(
      source,
      /(?:from\s+['"]node:test['"]|import\(\s*['"]node:test['"]\s*\))/,
      `${suitePath} must use node:test`
    );
    assert.doesNotMatch(
      source,
      /from\s+['"](?:playwright\/test|\.\/playwright-runtime\.mjs)['"]/,
      `${suitePath} must remain direct-node-only`
    );
  }

  console.log('[playwright-runtime] matcher=' + browser.patterns.join(','));
  console.log('[playwright-runtime] browserSelected=' + browser.selected.length);
  console.log('[playwright-runtime] nodeGlobSelected=' + directNode.selected.length);
  console.log('[playwright-runtime] directNodeSuites=' + directNodeSuites.length);
  console.log('[playwright-runtime] frozenCrossings=' + KNOWN_DISCOVERY_CROSSINGS.length);
  console.log('[playwright-runtime] newCrossings=' + newCrossings.length);
  console.log('[playwright-runtime] discoveryTaxonomy=PASS');
});

test('Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs', () => {
  const pattern = 'tests/portfolio-*.mjs';
  const reportArtifact = 'specs/008-portfolio/bugs/BUG-004-receipt/report.md';
  const reportSource = [
    '# Report',
    '',
    '## Test Evidence',
    '```text',
    '$ node --test tests/portfolio-*.mjs',
    '```',
    ''
  ].join('\n');

  withDeclarationFixture({ [reportArtifact]: reportSource }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const historical = (result.historicalSites ?? []).filter((site) => site.pattern === pattern);

    assert.equal(declarationFor(result, pattern), undefined);
    assert.equal(historical.length, 1);
    assert.equal(historical[0].artifact, reportArtifact);
    assert.equal(historical[0].line, 5);
    assert.equal(historical[0].artifactRole, 'historical-report');
    assert.equal(historical[0].sectionRole, 'evidence');
    assert.equal(historical[0].authority, 'historical');
    assert.match(historical[0].reason, /historical/);
  });
});

test('Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative', () => {
  const scopePattern = 'tests/scope-*.functional.mjs';
  const structuredPattern = 'tests/structured-*.test.mjs';
  const scopeArtifact = 'specs/101-active/scopes.md';
  const structuredArtifact = 'specs/102-structured/test-plan.json';
  const scopeSource = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '',
    '| Command |',
    '| --- |',
    '| `node --test tests/scope-*.functional.mjs` |',
    ''
  ].join('\n');
  const structuredSource = JSON.stringify({
    scopes: [{
      scopeId: '01-structured',
      tests: [{ command: 'node --test tests/structured-*.test.mjs' }]
    }]
  }, null, 2) + '\n';

  withDeclarationFixture({
    [scopeArtifact]: scopeSource,
    [structuredArtifact]: structuredSource
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const scopeDeclaration = declarationFor(result, scopePattern);
    const structuredDeclaration = declarationFor(result, structuredPattern);

    assert.ok(scopeDeclaration);
    assert.deepEqual(
      scopeDeclaration.sites.map(({ artifact, line }) => ({ artifact, line })),
      [{ artifact: scopeArtifact, line: 9 }]
    );
    assert.ok(structuredDeclaration);
    assert.equal(structuredDeclaration.sites.length, 1);
    assert.equal(structuredDeclaration.sites[0].artifact, structuredArtifact);
    assert.ok(structuredDeclaration.sites[0].line > 0);
  });
});

test('Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority', () => {
  const reportPattern = 'tests/report-heading-*.mjs';
  const activePattern = 'tests/fence-safe-*.functional.mjs';
  const reportArtifact = 'specs/_bugs/BUG-900-fixture/report.md';
  const scopeArtifact = 'specs/900-fixture/scopes.md';
  const reportSource = [
    '# Report',
    '',
    '## Command Registry',
    '```bash',
    'node --test tests/report-heading-*.mjs',
    '```',
    ''
  ].join('\n');
  const scopeSource = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '```markdown',
    '## Evidence',
    '```',
    '| `node --test tests/fence-safe-*.functional.mjs` |',
    ''
  ].join('\n');

  withDeclarationFixture({
    [reportArtifact]: reportSource,
    [scopeArtifact]: scopeSource
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const historical = (result.historicalSites ?? []).filter((site) => site.pattern === reportPattern);
    const active = declarationFor(result, activePattern);

    assert.equal(declarationFor(result, reportPattern), undefined);
    assert.equal(historical.length, 1);
    assert.equal(historical[0].artifactRole, 'historical-report');
    assert.ok(active);
    assert.equal(active.sites[0].artifact, scopeArtifact);
    assert.equal(active.sites[0].sectionRole, 'test-plan');
  });
});

test('Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance', () => {
  const unknownArtifact = 'misc/unknown-declaration.md';
  const unknownPattern = 'tests/unknown-*.mjs';
  const unknownSource = [
    '# Unknown Commands',
    '```bash',
    'node --test tests/unknown-*.mjs',
    '```',
    ''
  ].join('\n');

  withDeclarationFixture({
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty fixture baseline\n',
    'tests/unknown-example.spec.mjs': "import test from 'node:test';\ntest('fixture', () => {});\n",
    [unknownArtifact]: unknownSource
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors ?? [];
    const execution = spawnSync(process.execPath, [
      REACHABILITY_VALIDATOR,
      '--root',
      fixtureRoot,
      '--all-sites'
    ], { cwd: ROOT, encoding: 'utf8' });

    assert.equal(errors.length, 1);
    assert.equal(errors[0].pattern, unknownPattern);
    assert.equal(errors[0].artifact, unknownArtifact);
    assert.equal(errors[0].line, 3);
    assert.equal(errors[0].sectionRole, 'none');
    assert.equal(errors[0].authority, 'error');
    assert.match(errors[0].reason, /unknown/);
    assert.equal(execution.status, 1);
    assert.match(execution.stdout + execution.stderr, /CLASSIFICATION ERROR/);
    assert.match(execution.stdout + execution.stderr, /misc\/unknown-declaration\.md:3/);
  });

  const malformedArtifact = 'specs/901-malformed/test-plan.json';
  withDeclarationFixture({
    [malformedArtifact]: JSON.stringify({
      scopes: [],
      receipt: 'node --test tests/malformed-*.mjs'
    }, null, 2) + '\n'
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    assert.equal(result.classificationErrors.length, 1);
    assert.equal(result.classificationErrors[0].pattern, 'tests/malformed-*.mjs');
    assert.equal(result.classificationErrors[0].artifact, malformedArtifact);
    assert.equal(result.classificationErrors[0].artifactRole, 'structured-test-plan');
    assert.equal(result.classificationErrors[0].authority, 'error');
    assert.equal(result.classificationErrors[0].reason, 'malformed-structured-test-plan');
  });
});

test('Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth', () => {
  const result = collectDeclaredTestGlobs(ROOT);
  const testFiles = repoTestFiles();
  const browserMatchers = result.globs
    .filter((entry) => entry.kind === 'playwright-testMatch')
    .map((entry) => globToRegExp(entry.pattern));
  const activeNodeMatchers = result.globs
    .filter((entry) => entry.kind === 'node-test-argument')
    .map((entry) => globToRegExp(entry.pattern));
  const browserFiles = testFiles.filter((path) => browserMatchers.some((matcher) => matcher.test(path)));
  const browserSet = new Set(browserFiles);
  const activeCrossings = testFiles.filter((path) => (
    browserSet.has(path) && activeNodeMatchers.some((matcher) => matcher.test(path))
  ));
  const newCrossings = activeCrossings.filter((path) => !KNOWN_DISCOVERY_CROSSINGS.includes(path));
  const protectedReport = 'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md';
  const historicalPortfolioSites = (result.historicalSites ?? []).filter((site) => (
    site.pattern === 'tests/portfolio-*.mjs' && site.artifact === protectedReport
  ));
  const historicalMatcher = globToRegExp('tests/portfolio-*.mjs');
  const historicalCrossings = browserFiles.filter((path) => historicalMatcher.test(path));
  const baselineEntries = readFileSync(REACHABILITY_BASELINE, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.startsWith('tests/'));

  assert.equal(historicalPortfolioSites.length, 1);
  assert.equal(historicalCrossings.length, 8);
  assert.deepEqual(newCrossings, []);
  assert.ok(
    baselineEntries.length <= BUG022_BASELINE_CEILING,
    `reachability baseline grew from ${BUG022_BASELINE_CEILING} to ${baselineEntries.length}`
  );

  const activeScopeArtifact = 'specs/902-active-crossing/scopes.md';
  const fixtureReportArtifact = 'specs/902-active-crossing/report.md';
  const activeScopeSource = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '`node --test tests/portfolio-*.mjs`',
    ''
  ].join('\n');
  const fixtureReportSource = [
    '# Report',
    '',
    '## Evidence',
    'node --test tests/portfolio-*.mjs',
    ''
  ].join('\n');

  withDeclarationFixture({
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    [activeScopeArtifact]: activeScopeSource,
    [fixtureReportArtifact]: fixtureReportSource,
    'tests/portfolio-fixture.spec.mjs': "import test from 'node:test';\ntest('fixture', () => {});\n"
  }, (fixtureRoot) => {
    const fixture = collectDeclaredTestGlobs(fixtureRoot);
    const activeBroad = declarationFor(fixture, 'tests/portfolio-*.mjs');
    const fixtureBrowser = declarationFor(fixture, '**/*.spec.mjs', 'playwright-testMatch');
    const fixturePath = 'tests/portfolio-fixture.spec.mjs';

    assert.ok(activeBroad);
    assert.equal(activeBroad.sites[0].artifact, activeScopeArtifact);
    assert.equal(
      fixture.historicalSites.some((site) => site.artifact === fixtureReportArtifact),
      true
    );
    assert.equal(globToRegExp(activeBroad.pattern).test(fixturePath), true);
    assert.equal(globToRegExp(fixtureBrowser.pattern).test(fixturePath), true);
  });
});

test('Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority', () => {
  const result = collectDeclaredTestGlobs(ROOT);
  const testFiles = repoTestFiles();

  for (const pattern of ['tests/*.functional.mjs', 'tests/*.test.mjs']) {
    const declaration = declarationFor(result, pattern);
    assert.ok(declaration, `missing active declaration for ${pattern}`);
    assert.ok(
      declaration.sites.some((site) => site.artifact === '.specify/memory/agents.md'),
      `${pattern} is not declared by the current command registry`
    );
    assert.equal(
      declaration.sites.some((site) => site.artifact.endsWith('/report.md')),
      false,
      `${pattern} still depends on report authority`
    );
    assert.ok(
      testFiles.some((path) => globToRegExp(pattern).test(path)),
      `${pattern} reaches no current test files`
    );
  }
});

const BUG017_PACKET = resolve(
  ROOT,
  'specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos'
);
const BUG017_REPORT = resolve(BUG017_PACKET, 'report.md');
const AGENT_REGISTRY = resolve(ROOT, '.specify/memory/agents.md');

function tableRow(source, number) {
  const prefix = `| ${number} |`;
  const line = source.split('\n').find((candidate) => candidate.startsWith(prefix));
  assert.ok(line, `SCN-BUG017-03: candidate ${number} row is missing`);
  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
  assert.equal(cells.length, 4, `SCN-BUG017-03: candidate ${number} row is malformed`);
  return {
    candidate: cells[1],
    verdict: cells[2].replaceAll('**', ''),
    evidence: cells[3]
  };
}

function bug017Disclosures() {
  const config = readFileSync(resolve(ROOT, 'playwright.config.mjs'), 'utf8');
  const registry = readFileSync(AGENT_REGISTRY, 'utf8');
  const configStart = config.indexOf('/* Scope 4 selects');
  const workersStart = config.indexOf('\n  workers:', configStart);
  const registryStart = registry.indexOf('### Playwright E2E');
  const firstRunCommand = registry.indexOf('npx --no-install playwright test', registryStart);

  assert.ok(configStart >= 0, 'SCN-BUG017-07: playwright.config.mjs disclosure is missing');
  assert.ok(workersStart > configStart, 'SCN-BUG017-07: playwright.config.mjs disclosure is not before workers');
  assert.match(
    config.slice(configStart, workersStart),
    /\*\/\s*$/,
    'SCN-BUG017-07: playwright.config.mjs disclosure is not adjacent to workers'
  );
  assert.ok(registryStart >= 0, 'SCN-BUG017-07: agents.md Playwright E2E section is missing');
  assert.ok(
    firstRunCommand > registryStart,
    'SCN-BUG017-07: agents.md disclosure does not precede the first Playwright run command'
  );

  return [
    ['playwright.config.mjs', config.slice(configStart, workersStart)],
    ['.specify/memory/agents.md', registry.slice(registryStart, firstRunCommand)]
  ];
}

function assertCompleteBug017Disclosure(site, disclosure) {
  const prefix = `SCN-BUG017-07: ${site} disclosure`;
  assert.match(disclosure, /macOS/, `${prefix} is missing platform macOS`);
  assert.match(disclosure, /system-chrome/, `${prefix} is missing project system-chrome`);
  assert.match(disclosure, /300000ms/, `${prefix} is missing the teardown budget`);
  assert.match(disclosure, /force-killed/, `${prefix} is missing the force-kill symptom`);
  assert.match(disclosure, /exits? 1/, `${prefix} is missing the non-zero exit`);
  assert.match(disclosure, /every test passed|fully green run/i, `${prefix} is missing the green-suite symptom`);
  assert.match(disclosure, /6\/8/, `${prefix} is missing the six-worker intermittence`);
  assert.match(disclosure, /1\/3/, `${prefix} is missing the four-worker intermittence`);
  assert.match(disclosure, /0\/3/, `${prefix} is missing the two-worker intermittence`);
  assert.match(disclosure, /343s/, `${prefix} is missing the stalled wall time`);
  assert.match(disclosure, /81s/, `${prefix} is missing the bounded wall time`);
  assert.match(disclosure, /same 111 tests/, `${prefix} is missing the workload identity`);
}

test('Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence', () => {
  const report = readFileSync(BUG017_REPORT, 'utf8');
  const profile = tableRow(report, 3);
  const versionPair = tableRow(report, 4);

  assert.equal(profile.candidate, 'Profile or lock contention');
  assert.equal(versionPair.candidate, 'Version-pair interaction');
  assert.doesNotMatch(
    profile.verdict,
    /\bcause\b/i,
    'SCN-BUG017-03: candidate 3 uses a forbidden causal verdict'
  );
  assert.doesNotMatch(
    versionPair.verdict,
    /\bcause\b/i,
    'SCN-BUG017-03: candidate 4 uses a forbidden causal verdict'
  );
  assert.match(profile.verdict, /^(?:Supported|Contradicted|Untested)\b/);
  assert.match(versionPair.verdict, /^(?:Supported|Contradicted|Untested)\b/);
  assert.match(profile.evidence, /--user-data-dir=/);
  assert.match(profile.evidence, /no per-user profile state is shared/);
  assert.match(versionPair.evidence, /Playwright 1\.61\.1 against Chrome 151\.0\.7922\.170/);
  assert.match(
    versionPair.evidence,
    /only one Chrome build was available, so nothing is discriminated\./,
    'SCN-BUG017-03: candidate 4 lacks the single-build untested rationale'
  );
});

test('Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison', () => {
  const validator = resolve(ROOT, 'scripts/validate-playwright-cost-ratio.mjs');
  const runControl = (control) => {
    const controlTempRoot = mkdtempSync(resolve(tmpdir(), `research-lab-scn-bug017-06-test-${control}-`));
    try {
      const result = spawnSync(process.execPath, [validator, '--control', control], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, TMPDIR: controlTempRoot },
        timeout: 30_000
      });
      return { result, residue: readdirSync(controlTempRoot).sort() };
    } finally {
      rmSync(controlTempRoot, { recursive: true, force: true });
    }
  };
  const { result: atBound, residue: afterAtBound } = runControl('at-bound');
  const { result: overBound, residue: afterOverBound } = runControl('over-bound');

  process.stdout.write(atBound.stdout ?? '');
  process.stderr.write(atBound.stderr ?? '');
  process.stdout.write(overBound.stdout ?? '');
  process.stderr.write(overBound.stderr ?? '');

  assert.equal(atBound.signal, null);
  assert.equal(atBound.status, 0);
  assert.equal(atBound.stderr, '');
  assert.equal(
    atBound.stdout,
    [
      'SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3000 bundledChromiumWallMs=1000',
      'SCN-BUG017-06: wall-time ratio 3.000 meets FR-017-004 maximum 3.000',
      ''
    ].join('\n')
  );
  assert.match(atBound.stdout, /deterministic comparison input/);
  assert.doesNotMatch(atBound.stdout, /\bobserved\b/i);
  assert.deepEqual(afterAtBound, [], 'SCN-BUG017-06: at-bound control left owned temp residue');

  assert.equal(overBound.signal, null);
  assert.equal(overBound.status, 1);
  assert.equal(overBound.stderr, '');
  assert.equal(
    overBound.stdout,
    [
      'SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3001 bundledChromiumWallMs=1000',
      'SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000',
      ''
    ].join('\n')
  );
  assert.match(overBound.stdout, /deterministic comparison input/);
  assert.doesNotMatch(overBound.stdout, /\bobserved\b/i);
  assert.deepEqual(afterOverBound, [], 'SCN-BUG017-06: over-bound control left owned temp residue');

  console.log('[SCN-BUG017-06] deterministicBoundary=3.000');
  console.log('[SCN-BUG017-06] deterministicOverBound=3.001');
  console.log('[SCN-BUG017-06] ownedTempResidue=0');
});

test('Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence', () => {
  for (const [site, disclosure] of bug017Disclosures()) {
    assertCompleteBug017Disclosure(site, disclosure);
  }
});

test('Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin', () => {
  for (const [site, disclosure] of bug017Disclosures()) {
    assertCompleteBug017Disclosure(site, disclosure);
  }
  assert.equal(
    playwrightConfig.workers,
    1,
    'SCN-BUG017-08: disclosure is present but the rollback-gated worker pin is not 1'
  );
});

test('Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity', () => {
  const configSource = readFileSync(resolve(ROOT, 'playwright.config.mjs'), 'utf8');
  const foundationSource = readFileSync(
    resolve(ROOT, 'tests/portfolio-survival-foundation.spec.mjs'),
    'utf8'
  );
  const runnerSource = readFileSync(resolve(LOCAL_PACKAGE, 'lib/runner/index.js'), 'utf8');
  const systemChrome = playwrightConfig.projects.find(({ name }) => name === 'system-chrome');

  assert.equal(playwrightConfig.workers, 1, 'SCN-BUG017-11: fallback must resolve one worker');
  assert.ok(systemChrome, 'SCN-BUG017-11: system-chrome project is missing');
  assert.equal(systemChrome.use.browserName, 'chromium');
  assert.equal(systemChrome.use.channel, 'chrome');
  assert.match(
    runnerSource,
    /PWTEST_CHILD_PROCESS_TIMEOUT \|\| 5 \* 60 \* 1e3/,
    'SCN-BUG017-11: Playwright default worker-stop budget is no longer 300000ms'
  );
  assert.match(configSource, /process did not exit within 300000ms after stop/);
  assert.match(configSource, /force-killed it/);
  assert.doesNotMatch(
    foundationSource,
    /foundationBrowserBoundary|foundationBrowser\.close\(\)/,
    'SCN-BUG017-11: rejected lifecycle candidate must remain rolled back'
  );

  console.log('[SCN-BUG017-11] workers=1');
  console.log('[SCN-BUG017-11] project=system-chrome');
  console.log('[SCN-BUG017-11] channel=chrome');
  console.log('[SCN-BUG017-11] defaultWorkerStopBudgetMs=300000');
  console.log('[SCN-BUG017-11] forceKillDisclosure=present');
  console.log('[SCN-BUG017-11] lifecycleCandidateRolledBack=true');
});