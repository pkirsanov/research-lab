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
import * as testFileReachability from '../scripts/validate-test-file-reachability.mjs';
import * as sharedRuntime from './playwright-runtime.mjs';

const {
  collectDeclaredTestGlobs,
  globToRegExp,
  KNOWN_DISCOVERY_CROSSINGS
} = testFileReachability;

const ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const HELPER = resolve(ROOT, 'tests/playwright-runtime.mjs');
const TESTS_DIR = resolve(ROOT, 'tests');
const REACHABILITY_VALIDATOR = resolve(ROOT, 'scripts/validate-test-file-reachability.mjs');
const REACHABILITY_BASELINE = resolve(ROOT, 'scripts/validate-test-file-reachability.baseline');
const BUG022_BASELINE_CEILING = 26;
const BUG022_CROSSING_CEILING = 9;
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
  const globs = declaredGlobs().globs;
  const browserPatterns = globs.filter((glob) => glob.kind === 'playwright-testMatch').map((glob) => glob.pattern);

  /* DISJOINTNESS as a set relation between the two runner-selection
     mechanisms: no file may be selected by both the browser matcher and a
     declared `node --test` glob. */
  const disjointness = testFileReachability.runnerDisjointnessVerdict(
    globs,
    testFiles,
    KNOWN_DISCOVERY_CROSSINGS
  );
  const { browserSelected, newCrossings, nodeSelected, staleCrossings: staleFrozen } = disjointness;

  /* Derivation consistency: the statically parsed matcher equals the one the
     imported config exposes, so the parse driving discovery cannot drift. */
  const configuredTestMatch = Array.isArray(playwrightConfig.testMatch)
    ? playwrightConfig.testMatch
    : [playwrightConfig.testMatch];
  assert.deepEqual(browserPatterns, configuredTestMatch);

  assert.ok(browserSelected.length > 0, 'browser matcher selects nothing — disjointness would be vacuous');
  assert.ok(nodeSelected.length > 0, 'no declared node --test glob selects anything — disjointness would be vacuous');
  assert.deepEqual(newCrossings, [], 'file selected by both the browser matcher and a declared node --test glob');
  assert.deepEqual(staleFrozen, [], 'frozen crossing no longer crosses — remove it, the list only shrinks');

  const directNodeSuites = testFiles.filter((path) => path.endsWith(DIRECT_NODE_SUITE_SUFFIX));
  assert.ok(directNodeSuites.length > 0, 'no direct Node suite found under tests/');

  for (const specPath of browserSelected) {
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

  console.log('[playwright-runtime] matcher=' + browserPatterns.join(','));
  console.log('[playwright-runtime] browserSelected=' + browserSelected.length);
  console.log('[playwright-runtime] nodeGlobSelected=' + nodeSelected.length);
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
  const result = declaredGlobs();
  const testFiles = repoTestFiles();
  const {
    browserSelected: browserFiles,
    newCrossings
  } = testFileReachability.runnerDisjointnessVerdict(
    result.globs,
    testFiles,
    KNOWN_DISCOVERY_CROSSINGS
  );
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
    KNOWN_DISCOVERY_CROSSINGS.length <= BUG022_CROSSING_CEILING,
    `frozen crossing set grew from ${BUG022_CROSSING_CEILING} to ${KNOWN_DISCOVERY_CROSSINGS.length}`
  );
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
  const result = declaredGlobs();
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

test('Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write', () => {
  const sentinel = '# BUG-022 baseline sentinel\ntests/frozen-sentinel.mjs\n';
  const cases = [
    { label: 'bare-root', args: ['--root'] },
    { label: 'update-before-bare-root', args: ['--update-baseline', '--root'] },
    { label: 'update-after-option-root', args: ['--root', '--update-baseline'] },
    { label: 'all-sites-option-root', args: ['--root', '--all-sites'] }
  ];

  withDeclarationFixture({}, (fixtureRoot) => {
    const observations = cases.map(({ label, args }) => {
      const caseRoot = resolve(fixtureRoot, label);
      const baselinePath = resolve(caseRoot, 'scripts/validate-test-file-reachability.baseline');
      mkdirSync(resolve(caseRoot, '.specify/memory'), { recursive: true });
      mkdirSync(resolve(caseRoot, 'scripts'), { recursive: true });
      mkdirSync(resolve(caseRoot, 'tests'), { recursive: true });
      writeFileSync(
        resolve(caseRoot, '.specify/memory/agents.md'),
        '# Commands\n\n## Command Registry\n\nnode --test tests/*.functional.mjs\n'
      );
      writeFileSync(
        resolve(caseRoot, 'playwright.config.mjs'),
        "export default { testMatch: '**/*.spec.mjs' };\n"
      );
      writeFileSync(
        resolve(caseRoot, 'tests/root-operand.functional.mjs'),
        "import test from 'node:test';\ntest('fixture', () => {});\n"
      );
      writeFileSync(baselinePath, sentinel);

      const before = readFileSync(baselinePath, 'utf8');
      const execution = spawnSync(process.execPath, [REACHABILITY_VALIDATOR, ...args], {
        cwd: caseRoot,
        encoding: 'utf8'
      });
      const after = readFileSync(baselinePath, 'utf8');
      const output = `${execution.stdout ?? ''}${execution.stderr ?? ''}`;
      return {
        after,
        before,
        label,
        output,
        signal: execution.signal,
        status: execution.status
      };
    });

    const unknown = spawnSync(process.execPath, [REACHABILITY_VALIDATOR, '--unknown-bug022-option'], {
      cwd: resolve(fixtureRoot, 'bare-root'),
      encoding: 'utf8'
    });

    for (const observation of observations) {
      const scanned = /test file\(s\) in|^glob |CLASSIFICATION ERROR|NEW ORPHAN|STALE BASELINE|baseline written:/m
        .test(observation.output);
      console.log(
        `[BUG022-F07] case=${observation.label} exit=${observation.status} signal=${observation.signal ?? 'none'} `
        + `scanOutput=${scanned} baselineStable=${observation.after === observation.before}`
      );
      assert.equal(observation.signal, null);
      assert.equal(observation.status, 2, `${observation.label} must be a usage refusal`);
      assert.match(observation.output, /Usage: node scripts\/validate-test-file-reachability\.mjs/);
      assert.equal(scanned, false, `${observation.label} reached repository scanning`);
      assert.equal(observation.after, observation.before, `${observation.label} changed its baseline sentinel`);
    }

    console.log(`[BUG022-F07] unknownOptionExit=${unknown.status} signal=${unknown.signal ?? 'none'}`);
    assert.equal(unknown.signal, null);
    assert.equal(unknown.status, 2);
    assert.match(`${unknown.stdout ?? ''}${unknown.stderr ?? ''}`, /unknown argument: --unknown-bug022-option/);
  });
});

test('Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern', () => {
  const pattern = 'tests/shared-runner-*.mjs';
  withDeclarationFixture({
    'playwright.config.mjs': `export default { testMatch: '${pattern}' };\n`,
    'specs/903-runner-identity/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      `| command | \`node --test ${pattern}\` |`,
      ''
    ].join('\n')
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const declarations = result.globs.filter((entry) => entry.pattern === pattern);
    const kinds = declarations.map((entry) => entry.kind).sort();

    console.log(`[BUG022-F08] pattern=${pattern}`);
    console.log(`[BUG022-F08] declarationCount=${declarations.length}`);
    console.log(`[BUG022-F08] kinds=${kinds.join(',')}`);
    for (const declaration of declarations) {
      console.log(
        `[BUG022-F08] declaration=${declaration.kind} sites=${declaration.sites.length} `
        + `siteKinds=${declaration.sites.map((site) => site.kind).join(',')}`
      );
    }

    assert.equal(declarations.length, 2);
    assert.deepEqual(kinds, ['node-test-argument', 'playwright-testMatch']);
    for (const declaration of declarations) {
      assert.ok(declaration.sites.length > 0);
      assert.equal(
        declaration.sites.every((site) => site.kind === declaration.kind),
        true,
        `${declaration.kind} declaration contains a foreign runner site`
      );
      assert.equal(declaration.sites.every((site) => site.pattern === pattern), true);
    }
  });
});

test('Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert', () => {
  const unknownArtifact = 'misc/wrapped-commands.md';
  const wrappedPatterns = [
    'tests/env-wrapped-*.mjs',
    'tests/timeout-wrapped-*.mjs',
    'tests/perl-wrapped-*.mjs'
  ];
  const prosePatterns = [
    'tests/prose-env-*.mjs',
    'tests/prose-timeout-*.mjs',
    'tests/prose-perl-*.mjs'
  ];
  const source = [
    '# Unknown command candidates',
    '',
    'env BUG022_MODE=red node --test tests/env-wrapped-*.mjs',
    'timeout 30 node --test tests/timeout-wrapped-*.mjs',
    "/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node --test tests/perl-wrapped-*.mjs",
    '',
    'Documentation mentions env BUG022_MODE=red node --test tests/prose-env-*.mjs without issuing it.',
    'Documentation mentions timeout 30 node --test tests/prose-timeout-*.mjs without issuing it.',
    "Documentation mentions /usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node --test tests/prose-perl-*.mjs without issuing it.",
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors.filter((site) => site.artifact === unknownArtifact);
    const errorPatterns = errors.map((site) => site.pattern).sort();
    const everyPattern = [
      ...result.globs.map((entry) => entry.pattern),
      ...result.historicalSites.map((site) => site.pattern),
      ...result.classificationErrors.map((site) => site.pattern)
    ];

    console.log(`[BUG022-F09] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F09] errorPatterns=${errorPatterns.join(',')}`);
    console.log(`[BUG022-F09] proseCandidateCount=${prosePatterns.filter((pattern) => everyPattern.includes(pattern)).length}`);
    for (const error of errors) {
      console.log(
        `[BUG022-F09] ${error.artifact}:${error.line} section=${error.sectionRole} reason=${error.reason}`
      );
    }

    assert.deepEqual(errorPatterns, wrappedPatterns.slice().sort());
    assert.deepEqual(errors.map((site) => site.line), [3, 4, 5]);
    assert.equal(errors.every((site) => site.sectionRole === 'none'), true);
    assert.equal(errors.every((site) => site.reason === 'unknown-artifact-role'), true);
    assert.equal(prosePatterns.some((pattern) => everyPattern.includes(pattern)), false);
  });
});

test('Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing', () => {
  const pattern = 'tests/shared-crossing-*.mjs';
  const fixturePath = 'tests/shared-crossing-example.mjs';
  const commandBytes = `node --test ${pattern}`;
  const verdict = testFileReachability.runnerDisjointnessVerdict;
  const Refusal = testFileReachability.RunnerDisjointnessRefusal;

  assert.equal(typeof verdict, 'function', 'shared production disjointness verdict is missing');
  assert.equal(typeof Refusal, 'function', 'typed production disjointness refusal is missing');

  withDeclarationFixture({
    'playwright.config.mjs': `export default { testMatch: '${pattern}' };\n`,
    'specs/904-active-crossing/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      commandBytes,
      ''
    ].join('\n'),
    [fixturePath]: "import test from 'node:test';\ntest('fixture', () => {});\n"
  }, (fixtureRoot) => {
    const active = collectDeclaredTestGlobs(fixtureRoot);
    assert.throws(
      () => verdict(active.globs, [fixturePath], []),
      (error) => {
        assert.ok(error instanceof Refusal);
        assert.deepEqual(error.newCrossings, [fixturePath]);
        assert.deepEqual(error.staleCrossings, []);
        assert.deepEqual(error.crossings, [fixturePath]);
        console.log(`[BUG022-F10] activeRefusal=${error.name} path=${error.newCrossings[0]}`);
        return true;
      }
    );
  });

  withDeclarationFixture({
    'playwright.config.mjs': `export default { testMatch: '${pattern}' };\n`,
    'specs/904-historical-crossing/report.md': [
      '# Report',
      '',
      '## Test Evidence',
      commandBytes,
      ''
    ].join('\n'),
    [fixturePath]: "import test from 'node:test';\ntest('fixture', () => {});\n"
  }, (fixtureRoot) => {
    const historical = collectDeclaredTestGlobs(fixtureRoot);
    const result = verdict(historical.globs, [fixturePath], []);
    assert.deepEqual(result.crossings, []);
    assert.equal(historical.historicalSites.some((site) => site.pattern === pattern), true);
    console.log(`[BUG022-F10] historicalVerdict=${result.status} crossings=${result.crossings.length}`);
  });
});

// BUG022_R4_ATOMIC_TEST_DELTA_BEGIN
test('Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed', () => {
  const unknownArtifact = 'misc/presented-commands.md';
  const tablePattern = 'tests/table-presented-*.mjs';
  const tableWithoutTrailingPipePattern = 'tests/table-no-trailing-pipe-*.mjs';
  const labelledPattern = 'tests/label-presented-*.mjs';
  const prosePattern = 'tests/prose-presented-*.mjs';
  const source = [
    '# Unknown command presentations',
    '',
    '| Kind | Declaration |',
    '| --- | --- |',
    '| table | `node --test tests/table-presented-*.mjs` |',
    '| table-no-trailing-pipe | `node --test tests/table-no-trailing-pipe-*.mjs`',
    '',
    'Command: `node --test tests/label-presented-*.mjs`',
    'Documentation mentions Command: node --test tests/prose-presented-*.mjs without presenting a command.',
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors.filter((site) => site.artifact === unknownArtifact);
    const errorPatterns = errors.map((site) => site.pattern).sort();
    const everyPattern = [
      ...result.globs.map((entry) => entry.pattern),
      ...result.historicalSites.map((site) => site.pattern),
      ...result.classificationErrors.map((site) => site.pattern)
    ];

    console.log(`[BUG022-F11] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F11] errorPatterns=${errorPatterns.join(',')}`);
    console.log(`[BUG022-F11] errorLines=${errors.map((site) => site.line).join(',')}`);
    console.log(`[BUG022-F11] proseCandidate=${everyPattern.includes(prosePattern)}`);

    assert.deepEqual(errorPatterns, [labelledPattern, tablePattern, tableWithoutTrailingPipePattern].sort());
    assert.deepEqual(errors.map((site) => site.line), [5, 6, 8]);
    assert.equal(errors.every((site) => site.artifactRole === 'unknown'), true);
    assert.equal(errors.every((site) => site.sectionRole === 'none'), true);
    assert.equal(errors.every((site) => site.authority === 'error'), true);
    assert.equal(errors.every((site) => site.reason === 'unknown-artifact-role'), true);
    assert.equal(everyPattern.includes(prosePattern), false);
  });
});

test('Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable', () => {
  const pattern = 'tests/quoted-option-*.functional.mjs';
  const malformedPattern = 'tests/malformed-quoted-option-*.functional.mjs';
  const scopeArtifact = 'specs/905-quoted-options/scopes.md';
  const source = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '',
    `node --test --test-name-pattern '^critical behavior with spaces$' ${pattern}`,
    `node --test ${pattern} --test-name-pattern '^critical behavior with spaces$'`,
    `node --test "${malformedPattern}`,
    ''
  ].join('\n');

  withDeclarationFixture({ [scopeArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const declaration = declarationFor(result, pattern);
    const sites = declaration?.sites.map(({ artifact, line, sectionRole }) => ({
      artifact,
      line,
      sectionRole
    })) ?? [];
    const malformed = result.classificationErrors.find((site) => site.pattern === malformedPattern);

    console.log(`[BUG022-F12] pattern=${pattern}`);
    console.log(`[BUG022-F12] declarationPresent=${declaration !== undefined}`);
    console.log(`[BUG022-F12] siteCount=${sites.length}`);
    console.log(`[BUG022-F12] lines=${sites.map((site) => site.line).join(',')}`);
    console.log(`[BUG022-F12] malformedFailClosed=${malformed !== undefined}`);

    assert.ok(declaration, 'quoted Node options hid the declared test glob');
    assert.deepEqual(sites, [
      { artifact: scopeArtifact, line: 7, sectionRole: 'test-plan' },
      { artifact: scopeArtifact, line: 8, sectionRole: 'test-plan' }
    ]);
    assert.equal(result.classificationErrors.length, 1);
    assert.deepEqual(
      malformed && {
        artifact: malformed.artifact,
        line: malformed.line,
        sectionRole: malformed.sectionRole,
        authority: malformed.authority,
        reason: malformed.reason
      },
      {
        artifact: scopeArtifact,
        line: 9,
        sectionRole: 'test-plan',
        authority: 'error',
        reason: 'malformed-node-test-command'
      }
    );
  });
});

test('Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write', async () => {
  const { createHash } = await import('node:crypto');
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const baselineRelative = 'scripts/validate-test-file-reachability.baseline';

  function writeFixture(root, { baseline, commands = [], tests = {}, playwright = true }) {
    const baselinePath = resolve(root, baselineRelative);
    mkdirSync(resolve(root, 'scripts'), { recursive: true });
    writeFileSync(baselinePath, baseline);
    if (playwright) {
      writeFileSync(
        resolve(root, 'playwright.config.mjs'),
        "export default { testMatch: '**/*.spec.mjs' };\n"
      );
    }
    if (commands.length > 0) {
      const scopePath = resolve(root, 'specs/906-baseline-update/scopes.md');
      mkdirSync(dirname(scopePath), { recursive: true });
      writeFileSync(scopePath, [
        '# Scopes',
        '',
        '## Scope 1',
        '',
        '### Test Plan',
        '',
        ...commands,
        ''
      ].join('\n'));
    }
    for (const [relativePath, source] of Object.entries(tests)) {
      const absolutePath = resolve(root, relativePath);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, source);
    }
    return baselinePath;
  }

  function execute(root, update) {
    const args = [REACHABILITY_VALIDATOR];
    if (update) args.push('--update-baseline');
    args.push('--root', root);
    return spawnSync(process.execPath, args, {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000
    });
  }

  withDeclarationFixture({}, (fixtureRoot) => {
    const orphanRoot = resolve(fixtureRoot, 'new-orphan');
    const orphanBaseline = '# orphan sentinel\ntests/paid-down.security.mjs\n';
    const orphanBaselinePath = writeFixture(orphanRoot, {
      baseline: orphanBaseline,
      commands: ['node --test tests/*.functional.mjs'],
      tests: {
        'tests/known.functional.mjs': "import test from 'node:test';\ntest('known', () => {});\n",
        'tests/new-orphan.security.mjs': "import test from 'node:test';\ntest('orphan', () => {});\n",
        'tests/browser.spec.mjs': "import test from 'node:test';\ntest('browser', () => {});\n"
      }
    });
    const orphanBefore = readFileSync(orphanBaselinePath);
    const orphanExecution = execute(orphanRoot, true);
    const orphanAfter = readFileSync(orphanBaselinePath);

    const vacuousRoot = resolve(fixtureRoot, 'vacuous');
    const vacuousBaseline = '# vacuity sentinel\ntests/frozen-vacuous.mjs\n';
    const vacuousBaselinePath = writeFixture(vacuousRoot, {
      baseline: vacuousBaseline,
      playwright: false,
      tests: { 'README.txt': 'fixture with no test authority\n' }
    });
    const vacuousBefore = readFileSync(vacuousBaselinePath);
    const vacuousExecution = execute(vacuousRoot, true);
    const vacuousAfter = readFileSync(vacuousBaselinePath);

    const validRoot = resolve(fixtureRoot, 'valid-shrink');
    const validBaseline = [
      '# valid shrink sentinel',
      'tests/known-orphan.security.mjs',
      'tests/resolved-stale.functional.mjs',
      ''
    ].join('\n');
    const validBaselinePath = writeFixture(validRoot, {
      baseline: validBaseline,
      commands: ['node --test tests/*.functional.mjs'],
      tests: {
        'tests/resolved-stale.functional.mjs': "import test from 'node:test';\ntest('resolved', () => {});\n",
        'tests/known-orphan.security.mjs': "import test from 'node:test';\ntest('known orphan', () => {});\n",
        'tests/browser.spec.mjs': "import test from 'node:test';\ntest('browser', () => {});\n"
      }
    });
    const validBefore = readFileSync(validBaselinePath);
    const validUpdate = execute(validRoot, true);
    const validAfterUpdate = readFileSync(validBaselinePath);
    const validNormal = execute(validRoot, false);
    const validAfterNormal = readFileSync(validBaselinePath);
    const validEntries = testFileReachability.readBaseline(validBaselinePath);

    const invalidObservations = [
      {
        label: 'new-orphan',
        execution: orphanExecution,
        before: orphanBefore,
        after: orphanAfter
      },
      {
        label: 'vacuous',
        execution: vacuousExecution,
        before: vacuousBefore,
        after: vacuousAfter
      }
    ];
    for (const observation of invalidObservations) {
      console.log(
        `[BUG022-F13] case=${observation.label} exit=${observation.execution.status} `
        + `signal=${observation.execution.signal ?? 'none'}`
      );
      console.log(`[BUG022-F13] case=${observation.label} beforeSha256=${sha256(observation.before)}`);
      console.log(`[BUG022-F13] case=${observation.label} afterSha256=${sha256(observation.after)}`);
      console.log(`[BUG022-F13] case=${observation.label} bytesStable=${observation.before.equals(observation.after)}`);
      assert.equal(observation.execution.signal, null);
      assert.equal(observation.execution.status, 1, `${observation.label} update must refuse`);
      assert.equal(sha256(observation.after), sha256(observation.before));
      assert.deepEqual(observation.after, observation.before);
    }

    console.log(`[BUG022-F13] case=valid-shrink updateExit=${validUpdate.status}`);
    console.log(`[BUG022-F13] case=valid-shrink normalExit=${validNormal.status}`);
    console.log(`[BUG022-F13] case=valid-shrink beforeSha256=${sha256(validBefore)}`);
    console.log(`[BUG022-F13] case=valid-shrink afterSha256=${sha256(validAfterUpdate)}`);
    console.log(`[BUG022-F13] case=valid-shrink normalRunBytesStable=${validAfterUpdate.equals(validAfterNormal)}`);
    assert.equal(validUpdate.signal, null);
    assert.equal(validUpdate.status, 0);
    assert.notDeepEqual(validAfterUpdate, validBefore);
    assert.deepEqual([...validEntries], ['tests/known-orphan.security.mjs']);
    assert.equal(validNormal.signal, null);
    assert.equal(validNormal.status, 0);
    assert.deepEqual(validAfterNormal, validAfterUpdate);
  });
});

test('Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing', () => {
  const dynamicPath = 'tests/dynamic-registration.custom.mjs';
  const staticPath = 'tests/static-registration.custom.mjs';
  const requirePath = 'tests/require-registration.custom.mjs';
  const helperPath = 'tests/true-helper.support.mjs';
  const carrierSource = [
    "import test from 'node:test';",
    "import { dynamicReady } from './dynamic-registration.custom.mjs';",
    "import { staticReady } from './static-registration.custom.mjs';",
    "import { requireReady } from './require-registration.custom.mjs';",
    "test('carrier', () => {});",
    'void dynamicReady;',
    'void staticReady;',
    'void requireReady;',
    ''
  ].join('\n');
  const dynamicSource = [
    "const { test } = await import('node:test');",
    "test('dynamic registration', () => {});",
    'export const dynamicReady = true;',
    ''
  ].join('\n');
  const staticSource = [
    "import test from 'node:test';",
    "test('static registration', () => {});",
    'export const staticReady = true;',
    ''
  ].join('\n');
  const requireSource = [
    "const test = require('node:test');",
    "test('require registration', () => {});",
    'export const requireReady = true;',
    ''
  ].join('\n');

  let orphanResult;
  withDeclarationFixture({
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty baseline\n',
    'specs/907-dynamic-orphan/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      'node --test tests/*.functional.mjs',
      ''
    ].join('\n'),
    'tests/dynamic-carrier.functional.mjs': carrierSource,
    [dynamicPath]: dynamicSource,
    [staticPath]: staticSource,
    [requirePath]: requireSource
  }, (fixtureRoot) => {
    orphanResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  let reachableResult;
  withDeclarationFixture({
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty baseline\n',
    'specs/908-dynamic-reachable/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      'node --test tests/*.functional.mjs',
      'node --test tests/*.custom.mjs',
      ''
    ].join('\n'),
    'tests/dynamic-carrier.functional.mjs': carrierSource,
    [dynamicPath]: dynamicSource
  }, (fixtureRoot) => {
    reachableResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  let helperResult;
  withDeclarationFixture({
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty baseline\n',
    'specs/909-true-helper/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      'node --test tests/*.functional.mjs',
      ''
    ].join('\n'),
    'tests/helper-carrier.functional.mjs': [
      "import test from 'node:test';",
      "import { helperValue } from './true-helper.support.mjs';",
      "test('carrier', () => {});",
      'void helperValue;',
      ''
    ].join('\n'),
    [helperPath]: 'export const helperValue = 1;\n'
  }, (fixtureRoot) => {
    helperResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  console.log(`[BUG022-F14] orphanNew=${orphanResult.newOrphans.includes(dynamicPath)}`);
  console.log(`[BUG022-F14] orphanExempt=${orphanResult.exempt.some((entry) => entry.path === dynamicPath)}`);
  console.log(`[BUG022-F14] reachable=${reachableResult.reachable.some((entry) => entry.path === dynamicPath)}`);
  console.log(`[BUG022-F14] reachableExempt=${reachableResult.exempt.some((entry) => entry.path === dynamicPath)}`);
  console.log(`[BUG022-F14] staticOrphan=${orphanResult.newOrphans.includes(staticPath)}`);
  console.log(`[BUG022-F14] staticExempt=${orphanResult.exempt.some((entry) => entry.path === staticPath)}`);
  console.log(`[BUG022-F14] requireOrphan=${orphanResult.newOrphans.includes(requirePath)}`);
  console.log(`[BUG022-F14] requireExempt=${orphanResult.exempt.some((entry) => entry.path === requirePath)}`);
  console.log(`[BUG022-F14] trueHelperExempt=${helperResult.exempt.some((entry) => entry.path === helperPath)}`);

  assert.equal(orphanResult.newOrphans.includes(dynamicPath), true);
  assert.equal(orphanResult.exempt.some((entry) => entry.path === dynamicPath), false);
  assert.equal(reachableResult.newOrphans.includes(dynamicPath), false);
  assert.equal(reachableResult.reachable.some((entry) => entry.path === dynamicPath), true);
  assert.equal(reachableResult.exempt.some((entry) => entry.path === dynamicPath), false);
  assert.equal(orphanResult.newOrphans.includes(staticPath), true);
  assert.equal(orphanResult.exempt.some((entry) => entry.path === staticPath), false);
  assert.equal(orphanResult.newOrphans.includes(requirePath), true);
  assert.equal(orphanResult.exempt.some((entry) => entry.path === requirePath), false);
  assert.equal(helperResult.exempt.some((entry) => entry.path === helperPath), true);
});

test('Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const sourceRollbackObject = '805d78d3719db0c0c438989df3eb13b7242cc7a9';
  const testRollbackObject = '79c9226484db386c9134b6cd4267e082e8ec179e';
  const protectedObjects = new Map([
    ['scripts/validate-test-file-reachability.baseline', '2a5e472d7650027c53a17c7ae340d2bb25d2e821'],
    ['.specify/memory/agents.md', '08592d2bfaa8f6787806f05f508df9f3e0920a75'],
    [
      'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md',
      'a50d8e1727ef1b514e676016c480a436c0cc3033'
    ]
  ]);
  const markerStart = '// BUG022_R4_ATOMIC_TEST_DELTA_BEGIN\n';
  const markerEnd = '// BUG022_R4_ATOMIC_TEST_DELTA_END\n';
  const sourceAfter = readFileSync(resolve(ROOT, sourcePath));
  const testAfter = readFileSync(resolve(ROOT, testPath));
  const testText = testAfter.toString('utf8');
  const markerStartIndex = testText.indexOf(markerStart);
  const markerEndIndex = testText.indexOf(markerEnd, markerStartIndex + markerStart.length);

  function runGit(args, { cwd = ROOT, input } = {}) {
    const execution = spawnSync('git', args, { cwd, input });
    assert.equal(execution.signal, null, `git ${args.join(' ')} was interrupted`);
    assert.equal(
      execution.status,
      0,
      `git ${args.join(' ')} failed\n${execution.stderr?.toString('utf8') ?? ''}`
    );
    return execution.stdout;
  }

  const gitObject = (bytes, cwd = ROOT) => runGit(['hash-object', '--stdin'], {
    cwd,
    input: bytes
  }).toString('utf8').trim();
  const contentSha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

  assert.ok(markerStartIndex >= 0, 'atomic test-delta start marker is missing');
  assert.ok(markerEndIndex > markerStartIndex, 'atomic test-delta end marker is missing');
  const markedRollback = (
    testText.slice(0, markerStartIndex)
    + testText.slice(markerEndIndex + markerEnd.length)
  );
  const currentMarkerStart = '\n// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_BEGIN\n';
  const currentMarkerEnd = '// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_END\n\n';
  const currentMarkerStartIndex = markedRollback.indexOf(currentMarkerStart);
  const currentMarkerEndIndex = markedRollback.indexOf(
    currentMarkerEnd,
    currentMarkerStartIndex + currentMarkerStart.length
  );
  assert.ok(currentMarkerStartIndex >= 0, 'current test-delta start marker is missing');
  assert.ok(
    currentMarkerEndIndex > currentMarkerStartIndex,
    'current test-delta end marker is missing or unordered'
  );
  const completeRollback = (
    markedRollback.slice(0, currentMarkerStartIndex)
    + markedRollback.slice(currentMarkerEndIndex + currentMarkerEnd.length)
  );
  const sharedRatchetImport = [
    'const {',
    '  collectDeclaredTestGlobs,',
    '  globToRegExp,',
    '  KNOWN_DISCOVERY_CROSSINGS',
    '} = testFileReachability;'
  ].join('\n');
  const historicalRatchetImport = [
    'const {',
    '  collectDeclaredTestGlobs,',
    '  globToRegExp',
    '} = testFileReachability;'
  ].join('\n');
  const historicalRatchet = [
    '/* Pre-existing crossings, frozen so NEW ones fail (the ratchet',
    '   `scripts/validate-test-file-reachability.mjs` uses, for the same reason).',
    '   `notes/causal-rotation-lab.md:119` and `specs/012-.../test-plan.json` declare',
    '   `node --test` globs that also select browser specs; that debt predates this',
    '   boundary. This list must shrink, never grow. */',
    'const KNOWN_DISCOVERY_CROSSINGS = [',
    "  'tests/causal-rotation-adversarial.spec.mjs',",
    "  'tests/causal-rotation-brief.spec.mjs',",
    "  'tests/causal-rotation-chaos.spec.mjs',",
    "  'tests/causal-rotation-consumers.spec.mjs',",
    "  'tests/causal-rotation-delivery.spec.mjs',",
    "  'tests/causal-rotation-lab.spec.mjs',",
    "  'tests/causal-rotation-pages.spec.mjs',",
    "  'tests/causal-rotation-registry.spec.mjs',",
    "  'tests/distributed-briefs.spec.mjs'",
    '];',
    '',
    ''
  ].join('\n');
  const localRatchetRollback = completeRollback
    .replace(sharedRatchetImport, historicalRatchetImport)
    .replace(
      '/* Both discovery sides are read from the repository at run time.',
      historicalRatchet + '/* Both discovery sides are read from the repository at run time.'
    );
  const testRollback = Buffer.from(localRatchetRollback, 'utf8');
  const sourceRollback = runGit(['cat-file', 'blob', sourceRollbackObject]);
  const sourceAfterObject = gitObject(sourceAfter);
  const testAfterObject = gitObject(testAfter);

  assert.equal(gitObject(sourceRollback), sourceRollbackObject);
  assert.equal(gitObject(testRollback), testRollbackObject);
  assert.notEqual(sourceAfterObject, sourceRollbackObject, 'atomic production source delta is missing');
  assert.notEqual(testAfterObject, testRollbackObject, 'atomic persistent-test delta is missing');

  const excludedPaths = [
    'market-brief.config.json',
    'market-brief.html',
    'rlbrief.js',
    'rlmarketaction.js',
    'scripts/brief-author.mjs',
    'scripts/brief-publication.mjs',
    'scripts/web-evidence-acquire.mjs',
    'tests/fixtures/feature-012/tool-brief-v2',
    ...readdirSync(TESTS_DIR)
      .filter((name) => name.startsWith('tool-brief-v2-') || name === 'zz-probe-focusable.spec.mjs')
      .map((name) => `tests/${name}`)
  ].sort();

  function snapshotEntry(relativePath, rows) {
    const absolutePath = resolve(ROOT, relativePath);
    try {
      const entries = readdirSync(absolutePath, { withFileTypes: true });
      rows.push(`directory ${relativePath}`);
      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        snapshotEntry(`${relativePath}/${entry.name}`, rows);
      }
    } catch {
      try {
        const bytes = readFileSync(absolutePath);
        rows.push(`file ${relativePath} ${contentSha256(bytes)}`);
      } catch {
        rows.push(`missing ${relativePath}`);
      }
    }
  }

  function excludedSnapshot() {
    const rows = [];
    for (const relativePath of excludedPaths) snapshotEntry(relativePath, rows);
    return rows;
  }

  const protectedBytes = new Map();
  for (const [path, expectedObject] of protectedObjects) {
    const bytes = readFileSync(resolve(ROOT, path));
    assert.equal(gitObject(bytes), expectedObject, `${path} changed before rollback validation`);
    protectedBytes.set(path, bytes);
  }
  const excludedBefore = excludedSnapshot();
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-r4-rollback-'));
  let reverseSourceObject;
  let reverseTestObject;
  let forwardSourceObject;
  let forwardTestObject;

  try {
    runGit(['init', '-q'], { cwd: tempRoot });
    const baseFiles = new Map([
      [sourcePath, sourceRollback],
      [testPath, testRollback],
      ...protectedBytes
    ]);
    for (const [path, bytes] of baseFiles) {
      const absolutePath = resolve(tempRoot, path);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, bytes);
    }
    runGit(['add', '--', ...baseFiles.keys()], { cwd: tempRoot });
    writeFileSync(resolve(tempRoot, sourcePath), sourceAfter);
    writeFileSync(resolve(tempRoot, testPath), testAfter);

    const patch = runGit(['diff', '--binary', '--', sourcePath, testPath], { cwd: tempRoot });
    const patchText = patch.toString('utf8');
    assert.match(patchText, /scripts\/validate-test-file-reachability\.mjs/);
    assert.match(patchText, /tests\/playwright-runtime\.foundation\.functional\.mjs/);

    runGit(['apply', '--reverse', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    reverseSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    reverseTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    assert.equal(reverseSourceObject, sourceRollbackObject);
    assert.equal(reverseTestObject, testRollbackObject);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }

    runGit(['apply', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    forwardSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    forwardTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    assert.equal(forwardSourceObject, sourceAfterObject);
    assert.equal(forwardTestObject, testAfterObject);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  const excludedAfter = excludedSnapshot();
  let residue = true;
  try { readdirSync(tempRoot); } catch { residue = false; }

  console.log(`[BUG022-C18] rollbackSource=${reverseSourceObject}`);
  console.log(`[BUG022-C18] rollbackTest=${reverseTestObject}`);
  console.log(`[BUG022-C18] repairedSource=${forwardSourceObject}`);
  console.log(`[BUG022-C18] repairedTest=${forwardTestObject}`);
  console.log(`[BUG022-C18] protectedObjects=${protectedObjects.size}`);
  console.log(`[BUG022-C18] excludedSnapshotEntries=${excludedBefore.length}`);
  console.log(`[BUG022-C18] excludedObjectsStable=${JSON.stringify(excludedAfter) === JSON.stringify(excludedBefore)}`);
  console.log(`[BUG022-C18] mutationResidue=${residue}`);

  assert.deepEqual(excludedAfter, excludedBefore);
  assert.equal(residue, false);
});
// BUG022_R4_ATOMIC_TEST_DELTA_END

// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_BEGIN
test('Regression: SCN-BUG022-007 active runner crossing refuses baseline update before write', async () => {
  const { createHash } = await import('node:crypto');
  const pattern = 'tests/active-crossing-*.spec.mjs';
  const crossingPath = 'tests/active-crossing-case.spec.mjs';
  const baselineRelative = 'scripts/validate-test-file-reachability.baseline';
  const sentinel = Buffer.from('# active crossing sentinel\ntests/already-paid-down.security.mjs\n');
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

  withDeclarationFixture({
    'playwright.config.mjs': `export default { testMatch: '${pattern}' };\n`,
    [baselineRelative]: sentinel,
    'specs/910-active-crossing/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      '',
      `node --test ${pattern}`,
      ''
    ].join('\n'),
    [crossingPath]: "import test from 'node:test';\ntest('active crossing', () => {});\n"
  }, (fixtureRoot) => {
    const baselinePath = resolve(fixtureRoot, baselineRelative);
    const before = readFileSync(baselinePath);
    const execution = spawnSync(process.execPath, [
      REACHABILITY_VALIDATOR,
      '--update-baseline',
      '--root',
      fixtureRoot
    ], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000
    });
    const after = readFileSync(baselinePath);
    const validatorSource = readFileSync(REACHABILITY_VALIDATOR, 'utf8');
    const mainStart = validatorSource.indexOf('function main(argv) {');
    const mainEnd = validatorSource.indexOf('\nif (resolve(process.argv[1]', mainStart);
    const mainSource = validatorSource.slice(mainStart, mainEnd);
    const verdictIndex = mainSource.indexOf('runnerDisjointnessVerdict(');
    const writeIndex = mainSource.indexOf('writeBaseline(');
    const writeCalls = mainSource.match(/writeBaseline\(/g) ?? [];

    console.log(`[BUG022-F20] exit=${execution.status} signal=${execution.signal ?? 'none'}`);
    console.log(`[BUG022-F20] stderr=${execution.stderr.trim().replaceAll('\n', ' | ')}`);
    console.log(`[BUG022-F20] crossing=${crossingPath} pattern=${pattern}`);
    console.log(`[BUG022-F20] beforeSha256=${sha256(before)}`);
    console.log(`[BUG022-F20] afterSha256=${sha256(after)}`);
    console.log(`[BUG022-F20] baselineBytesStable=${before.equals(after)}`);
    console.log(`[BUG022-F20] verdictBeforeWrite=${verdictIndex >= 0 && verdictIndex < writeIndex}`);
    console.log(`[BUG022-F20] baselineWriteCalls=${writeCalls.length}`);

    assert.equal(execution.signal, null);
    assert.equal(execution.status, 1, 'active runner crossing update must refuse');
    assert.match(execution.stderr, /RunnerDisjointnessRefusal/);
    assert.match(execution.stderr, new RegExp(crossingPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.deepEqual(after, before, 'crossing update changed the sentinel baseline');
    assert.ok(mainStart >= 0 && mainEnd > mainStart, 'production main() boundary is missing');
    assert.ok(verdictIndex >= 0, 'production main() does not call runnerDisjointnessVerdict()');
    assert.ok(verdictIndex < writeIndex, 'runner disjointness is not decided before baseline write');
    assert.equal(writeCalls.length, 1, 'production main() must have one baseline-write call');
    assert.doesNotMatch(
      mainSource,
      /runnerSelectionDetails|new Set\(|newCrossings|staleCrossings/,
      'production main() duplicates runner-crossing decision logic'
    );
  });
});

test('Regression: SCN-BUG022-006 boolean test-only preserves a quoted positional glob', () => {
  const pattern = 'tests/boolean-test-only-*.functional.mjs';
  const scopeArtifact = 'specs/911-boolean-test-only/scopes.md';
  const command = `node --test --test-only "${pattern}"`;
  const source = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '',
    command,
    ''
  ].join('\n');
  const parsed = testFileReachability.parseNodeTestCommandCandidate(command);

  withDeclarationFixture({ [scopeArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const declaration = declarationFor(result, pattern);
    const sites = declaration?.sites.map(({ artifact, line, reason, sectionRole }) => ({
      artifact,
      line,
      reason,
      sectionRole
    })) ?? [];

    console.log(`[BUG022-F21] command=${command}`);
    console.log(`[BUG022-F21] parseError=${parsed?.parseError ?? 'none'}`);
    console.log(`[BUG022-F21] testArguments=${parsed?.testArguments.join(',') ?? 'missing'}`);
    console.log(`[BUG022-F21] patterns=${parsed?.patterns.join(',') ?? 'missing'}`);
    console.log(`[BUG022-F21] declarationPresent=${declaration !== undefined}`);
    console.log(`[BUG022-F21] siteCount=${sites.length}`);
    console.log(`[BUG022-F21] classificationErrors=${result.classificationErrors.length}`);

    assert.ok(parsed, 'boolean --test-only command was not recognized');
    assert.equal(parsed.parseError, null);
    assert.deepEqual(parsed.parseIssues, []);
    assert.deepEqual(parsed.testArguments, [pattern]);
    assert.deepEqual(parsed.patterns, [pattern]);
    assert.ok(declaration, 'boolean --test-only consumed the quoted positional glob');
    assert.deepEqual(sites, [{
      artifact: scopeArtifact,
      line: 7,
      reason: 'current-test-plan',
      sectionRole: 'test-plan'
    }]);
    assert.deepEqual(result.classificationErrors, []);
  });
});

test('Regression: SCN-BUG022-005 table rows and Markdown lists expose every declaration candidate', () => {
  const unknownArtifact = 'misc/complete-presentations.md';
  const patterns = {
    command: 'tests/command-control-*.mjs',
    ordered: 'tests/ordered-list-*.mjs',
    prose: 'tests/inert-prose-*.mjs',
    tableFirst: 'tests/table-first-*.mjs',
    tableSecond: 'tests/table-second-*.mjs',
    unordered: 'tests/unordered-list-*.mjs'
  };
  const source = [
    '# Complete command presentations',
    '',
    '| First declaration | Second declaration |',
    '| --- | --- |',
    `| \`node --test ${patterns.tableFirst}\` | \`node --test ${patterns.tableSecond}\` |`,
    '',
    `- node --test ${patterns.unordered}`,
    `1. node --test ${patterns.ordered}`,
    '',
    `Command: \`node --test ${patterns.command}\``,
    `Documentation mentions node --test ${patterns.prose} as inert prose.`,
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === unknownArtifact)
      .map(({ artifact, artifactRole, authority, line, pattern, reason, sectionRole }) => ({
        artifact,
        artifactRole,
        authority,
        line,
        pattern,
        reason,
        sectionRole
      }))
      .sort((left, right) => left.pattern.localeCompare(right.pattern));
    const expected = [
      { pattern: patterns.tableFirst, line: 5 },
      { pattern: patterns.tableSecond, line: 5 },
      { pattern: patterns.unordered, line: 7 },
      { pattern: patterns.ordered, line: 8 },
      { pattern: patterns.command, line: 10 }
    ].map(({ pattern, line }) => ({
      artifact: unknownArtifact,
      artifactRole: 'unknown',
      authority: 'error',
      line,
      pattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    })).sort((left, right) => left.pattern.localeCompare(right.pattern));
    const everyPattern = [
      ...result.globs.map((entry) => entry.pattern),
      ...result.historicalSites.map((site) => site.pattern),
      ...result.classificationErrors.map((site) => site.pattern)
    ];

    console.log(`[BUG022-F22] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F22] patterns=${errors.map((site) => site.pattern).join(',')}`);
    console.log(`[BUG022-F22] lines=${errors.map((site) => site.line).join(',')}`);
    console.log(`[BUG022-F22] secondTable=${everyPattern.includes(patterns.tableSecond)}`);
    console.log(`[BUG022-F22] unorderedList=${everyPattern.includes(patterns.unordered)}`);
    console.log(`[BUG022-F22] orderedList=${everyPattern.includes(patterns.ordered)}`);
    console.log(`[BUG022-F22] commandControl=${everyPattern.includes(patterns.command)}`);
    console.log(`[BUG022-F22] proseCandidate=${everyPattern.includes(patterns.prose)}`);

    assert.deepEqual(errors, expected);
    assert.equal(everyPattern.includes(patterns.prose), false);
  });
});

test('Regression: SCN-BUG022-007 convergence repair rollback preserves source test and protected objects', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const sourceRollbackObject = '7b08225e2619ae768db1a63c61d8a30c9c233862';
  const testRollbackObject = '2133b5bf608b252ae8ec5f1f7f12ec95d8bf9e3a';
  const protectedObjects = new Map([
    ['scripts/validate-test-file-reachability.baseline', '2a5e472d7650027c53a17c7ae340d2bb25d2e821'],
    ['.specify/memory/agents.md', '08592d2bfaa8f6787806f05f508df9f3e0920a75'],
    [
      'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md',
      'a50d8e1727ef1b514e676016c480a436c0cc3033'
    ]
  ]);
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

  function runGit(args, { cwd = ROOT, input } = {}) {
    const execution = spawnSync('git', args, { cwd, input, timeout: 30000 });
    assert.equal(execution.signal, null, `git ${args.join(' ')} was interrupted`);
    assert.equal(
      execution.status,
      0,
      `git ${args.join(' ')} failed\n${execution.stderr?.toString('utf8') ?? ''}`
    );
    return execution.stdout;
  }

  const gitObject = (bytes, cwd = ROOT) => runGit(['hash-object', '--stdin'], {
    cwd,
    input: bytes
  }).toString('utf8').trim();

  function replaceExactly(source, before, after, label) {
    const first = source.indexOf(before);
    assert.ok(first >= 0, `${label}: expected source fragment is missing`);
    assert.equal(source.indexOf(before, first + before.length), -1, `${label}: source fragment is ambiguous`);
    return source.slice(0, first) + after + source.slice(first + before.length);
  }

  function replaceBeforeAnchor(source, startAnchor, endAnchor, replacement, label) {
    const start = source.indexOf(startAnchor);
    assert.ok(start >= 0, `${label}: start anchor is missing`);
    assert.equal(source.indexOf(startAnchor, start + startAnchor.length), -1, `${label}: start anchor is ambiguous`);
    const end = source.indexOf(endAnchor, start + startAnchor.length);
    assert.ok(end > start, `${label}: end anchor is missing or unordered`);
    return source.slice(0, start) + replacement + source.slice(end);
  }

  function rollbackSource(current) {
    let source = current;
    const sharedRatchetBlock = [
      '/* Pre-existing Node/Playwright crossings are one shared shrink-only ratchet.',
      '   The production CLI and the committed boundary carrier consume these exact',
      '   values so baseline updates cannot bypass runner ownership validation. */',
      'export const KNOWN_DISCOVERY_CROSSINGS = Object.freeze([',
      "  'tests/causal-rotation-adversarial.spec.mjs',",
      "  'tests/causal-rotation-brief.spec.mjs',",
      "  'tests/causal-rotation-chaos.spec.mjs',",
      "  'tests/causal-rotation-consumers.spec.mjs',",
      "  'tests/causal-rotation-delivery.spec.mjs',",
      "  'tests/causal-rotation-lab.spec.mjs',",
      "  'tests/causal-rotation-pages.spec.mjs',",
      "  'tests/causal-rotation-registry.spec.mjs',",
      "  'tests/distributed-briefs.spec.mjs'",
      ']);',
      '',
      ''
    ].join('\n');
    source = replaceExactly(source, sharedRatchetBlock, '', 'shared crossing ratchet export');
    source = replaceExactly(
      source,
      "    const listed = /^(?:[-+*]|\\d+[.)])[ \\t]+(.*)$/.exec(trimmed);\n",
      '',
      'Markdown list presentation recognizer'
    );
    source = replaceExactly(
      source,
      [
        "      presentation: labelled ? 'command-label' : listed ? 'markdown-list' : 'direct',",
        '      text: labelled ? labelled[1] : listed ? listed[1] : trimmed'
      ].join('\n'),
      [
        "      presentation: labelled ? 'command-label' : 'direct',",
        '      text: labelled ? labelled[1] : trimmed'
      ].join('\n'),
      'presentation selection'
    );
    const originalFragmentTail = [
      '  return fragments.map(({ presentation, text }) => {',
      '    let command = text.trim();',
      "    const openingTicks = /^`+/.exec(command)?.[0] ?? '';",
      "    if (openingTicks !== '') {",
      '      const closingIndex = command.indexOf(openingTicks, openingTicks.length);',
      '      if (closingIndex >= openingTicks.length) {',
      '        command = command.slice(openingTicks.length, closingIndex).trim();',
      '      }',
      '    }',
      "    command = command.replace(/^\\$[ \\t]+/, '');",
      '    return { presentation, text: command };',
      '  });',
      '}',
      '',
      ''
    ].join('\n');
    source = replaceBeforeAnchor(
      source,
      '  return fragments.flatMap(({ presentation, text }) => {',
      'export function parseNodeTestCommandCandidates(line) {',
      originalFragmentTail,
      'complete presentation fragment expansion'
    );
    source = replaceBeforeAnchor(
      source,
      'export function parseNodeTestCommandCandidates(line) {',
      'function tokenizeShellCommand(command) {',
      '',
      'plural command-candidate parser'
    );
    source = replaceExactly(
      source,
      [
        "    if (!positionalOnly && token.value.startsWith('--')) {",
        '      index = consumeOption(tokens, index, NODE_TEST_OPTIONS_WITH_VALUE, issues);',
        '      continue;',
        '    }'
      ].join('\n'),
      [
        "    if (!positionalOnly && token.value.startsWith('--')) {",
        '      const optionIndex = index;',
        '      index = consumeOption(tokens, index, NODE_TEST_OPTIONS_WITH_VALUE, issues);',
        '      if (',
        '        index === optionIndex + 1',
        "        && !tokens[optionIndex].value.includes('=')",
        '        && tokens[index]?.quoted',
        '      ) index++;',
        '      continue;',
        '    }'
      ].join('\n'),
      'boolean option positional consumption'
    );
    const originalSingleCandidateParser = [
      'export function parseNodeTestCommandCandidate(line) {',
      '  for (const fragment of commandCandidateFragments(line)) {',
      '    const parsed = parseNodeTestTokens(fragment.text);',
      '    if (!parsed) continue;',
      '    return {',
      '      command: fragment.text,',
      "      parseError: parsed.issues.length > 0 ? 'malformed-node-test-command' : null,",
      '      parseIssues: parsed.issues,',
      "      patterns: parsed.testArguments.filter((path) => path.includes('*') || path.includes('?')),",
      '      presentation: fragment.presentation,',
      '      testArguments: parsed.testArguments',
      '    };',
      '  }',
      '  return null;',
      '}',
      '',
      'function nodePatterns(text) {',
      '  return parseNodeTestCommandCandidate(text)?.patterns ?? [];',
      '}',
      '',
      'function structuredLineNodePatterns(line) {',
      '  const direct = nodePatterns(line);',
      '  if (direct.length > 0) return direct;',
      '',
      '  const objectValue = /^\\s*"[^"]+"\\s*:\\s*("(?:\\\\.|[^"\\\\])*")/.exec(line);',
      '  const arrayValue = /^\\s*("(?:\\\\.|[^"\\\\])*")\\s*,?\\s*$/.exec(line);',
      '  const encoded = objectValue?.[1] ?? arrayValue?.[1];',
      '  if (!encoded) return [];',
      '  try {',
      '    const value = JSON.parse(encoded);',
      "    return typeof value === 'string' ? nodePatterns(value) : [];",
      '  } catch {',
      '    return [];',
      '  }',
      '}',
      '',
      ''
    ].join('\n');
    source = replaceExactly(
      source,
      'function candidateClassification(artifactRoleValue, sectionRole) {',
      originalSingleCandidateParser + 'function candidateClassification(artifactRoleValue, sectionRole) {',
      'single command-candidate parser placement'
    );
    const originalStructuredCommandLoop = [
      '        const parsedCommand = parseNodeTestCommandCandidate(command);',
      '        for (const pattern of parsedCommand?.patterns ?? []) {',
      '          const candidateKey = `${line}\\0${pattern}`;',
      '          recognizedCandidates.set(candidateKey, (recognizedCandidates.get(candidateKey) ?? 0) + 1);',
      '          if (parsedCommand.parseError) {',
      '            record({',
      '              pattern,',
      "              kind: 'node-test-argument',",
      '              artifact,',
      '              line,',
      '              artifactRole: artifactRoleValue,',
      '              sectionRole: SECTION_ROLE.TEST_PLAN,',
      "              authority: 'error',",
      '              reason: parsedCommand.parseError',
      '            });',
      '            continue;',
      '          }',
      '          record({',
      '            pattern,',
      "            kind: 'node-test-argument',",
      '            artifact,',
      '            line,',
      '            artifactRole: artifactRoleValue,',
      '            sectionRole: SECTION_ROLE.TEST_PLAN,',
      "            authority: 'active',",
      "            reason: 'structured-test-plan'",
      '          });',
      '        }',
      '      }',
      ''
    ].join('\n');
    source = replaceBeforeAnchor(
      source,
      '        for (const parsedCommand of parseNodeTestCommandCandidates(command)) {',
      '      for (const candidate of rawCandidates) {',
      originalStructuredCommandLoop,
      'structured test-plan command loop'
    );
    const originalMarkdownCandidateLoop = [
      '      const candidate = parseNodeTestCommandCandidate(lines[i]);',
      '      if (!candidate) continue;',
      '      if (candidate.parseError) {',
      '        for (const pattern of candidate.patterns) {',
      '          record({',
      '            pattern,',
      "            kind: 'node-test-argument',",
      '            artifact,',
      '            line: i + 1,',
      '            artifactRole: artifactRoleValue,',
      '            sectionRole,',
      "            authority: 'error',",
      '            reason: candidate.parseError',
      '          });',
      '        }',
      '        continue;',
      '      }',
      '      const classification = candidateClassification(artifactRoleValue, sectionRole);',
      '      for (const pattern of candidate.patterns) {',
      '        record({',
      '          pattern,',
      "          kind: 'node-test-argument',",
      '          artifact,',
      '          line: i + 1,',
      '          artifactRole: artifactRoleValue,',
      '          sectionRole,',
      '          ...classification',
      '        });',
      '      }',
      ''
    ].join('\n');
    source = replaceBeforeAnchor(
      source,
      '      for (const candidate of parseNodeTestCommandCandidates(lines[i])) {',
      '    }\n  }\n\n  const globs =',
      originalMarkdownCandidateLoop,
      'Markdown candidate classification loop'
    );
    source = replaceExactly(
      source,
      '  const knownCrossings = resolve(root) === ROOT ? KNOWN_DISCOVERY_CROSSINGS : [];\n',
      '',
      'root-scoped crossing ratchet selection'
    );
    source = replaceExactly(source, '    knownCrossings,\n', '', 'known crossing result field');
    source = replaceExactly(source, '    testFiles,\n', '', 'typed test-file result field');
    const preWriteVerdict = [
      '  try {',
      '    runnerDisjointnessVerdict(result.globs, result.testFiles, result.knownCrossings);',
      '  } catch (error) {',
      '    if (!(error instanceof RunnerDisjointnessRefusal)) throw error;',
      '    console.error(`${error.name}: ${error.message}`);',
      '    return 1;',
      '  }',
      ''
    ].join('\n');
    source = replaceExactly(source, preWriteVerdict, '', 'pre-write typed verdict');
    return source;
  }

  function rollbackTest(current) {
    let source = current;
    const markerStart = '\n// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_BEGIN\n';
    const markerEnd = '// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_END\n\n';
    const start = source.indexOf(markerStart);
    const end = source.indexOf(markerEnd, start + markerStart.length);
    assert.ok(start >= 0, 'current test-delta start marker is missing');
    assert.ok(end > start, 'current test-delta end marker is missing or unordered');
    source = source.slice(0, start) + source.slice(end + markerEnd.length);
    source = replaceBeforeAnchor(
      source,
      '  const markedRollback = (',
      '  const sourceRollback = runGit',
      [
        '  const testRollback = Buffer.from(',
        '    testText.slice(0, markerStartIndex)',
        '    + testText.slice(markerEndIndex + markerEnd.length),',
        "    'utf8'",
        '  );',
        ''
      ].join('\n'),
      'historical C18 compatibility adaptation'
    );
    source = replaceExactly(
      source,
      [
        'const {',
        '  collectDeclaredTestGlobs,',
        '  globToRegExp,',
        '  KNOWN_DISCOVERY_CROSSINGS',
        '} = testFileReachability;'
      ].join('\n'),
      [
        'const {',
        '  collectDeclaredTestGlobs,',
        '  globToRegExp',
        '} = testFileReachability;'
      ].join('\n'),
      'shared ratchet import'
    );
    const localRatchetBlock = [
      '/* Pre-existing crossings, frozen so NEW ones fail (the ratchet',
      '   `scripts/validate-test-file-reachability.mjs` uses, for the same reason).',
      '   `notes/causal-rotation-lab.md:119` and `specs/012-.../test-plan.json` declare',
      '   `node --test` globs that also select browser specs; that debt predates this',
      '   boundary. This list must shrink, never grow. */',
      'const KNOWN_DISCOVERY_CROSSINGS = [',
      "  'tests/causal-rotation-adversarial.spec.mjs',",
      "  'tests/causal-rotation-brief.spec.mjs',",
      "  'tests/causal-rotation-chaos.spec.mjs',",
      "  'tests/causal-rotation-consumers.spec.mjs',",
      "  'tests/causal-rotation-delivery.spec.mjs',",
      "  'tests/causal-rotation-lab.spec.mjs',",
      "  'tests/causal-rotation-pages.spec.mjs',",
      "  'tests/causal-rotation-registry.spec.mjs',",
      "  'tests/distributed-briefs.spec.mjs'",
      '];',
      '',
      ''
    ].join('\n');
    source = replaceExactly(
      source,
      '/* Both discovery sides are read from the repository at run time.',
      localRatchetBlock + '/* Both discovery sides are read from the repository at run time.',
      'local crossing ratchet restoration'
    );
    return source;
  }

  function ratchetEntries(source) {
    const declaration = /(?:export )?const KNOWN_DISCOVERY_CROSSINGS = (?:Object\.freeze\()?\[([\s\S]*?)\]\)?;/.exec(source);
    assert.ok(declaration, 'crossing ratchet declaration is missing');
    return [...declaration[1].matchAll(/^\s*'([^']+)'[,]?$/gm)].map((match) => match[1]);
  }

  function snapshotPath(relativePath, rows) {
    const absolutePath = resolve(ROOT, relativePath);
    try {
      const entries = readdirSync(absolutePath, { withFileTypes: true });
      rows.push(`directory ${relativePath}`);
      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
        snapshotPath(`${relativePath}/${entry.name}`, rows);
      }
    } catch {
      try {
        const bytes = readFileSync(absolutePath);
        rows.push(`file ${relativePath} ${sha256(bytes)}`);
      } catch {
        rows.push(`missing ${relativePath}`);
      }
    }
  }

  function unrelatedDirtySnapshot() {
    const status = runGit(['status', '--porcelain=v1', '-z', '--untracked-files=all']).toString('utf8');
    const paths = status.split('\0')
      .filter(Boolean)
      .map((entry) => entry.slice(3))
      .filter((path) => path !== sourcePath && path !== testPath)
      .sort();
    const rows = [];
    for (const path of paths) snapshotPath(path, rows);
    return rows;
  }

  const sourceAfter = readFileSync(resolve(ROOT, sourcePath));
  const testAfter = readFileSync(resolve(ROOT, testPath));
  const sourceRollback = Buffer.from(rollbackSource(sourceAfter.toString('utf8')), 'utf8');
  const testRollback = Buffer.from(rollbackTest(testAfter.toString('utf8')), 'utf8');
  const sourceAfterObject = gitObject(sourceAfter);
  const testAfterObject = gitObject(testAfter);
  const rollbackRatchet = ratchetEntries(testRollback.toString('utf8'));
  const repairedRatchet = ratchetEntries(sourceAfter.toString('utf8'));

  console.log(`[BUG022-C25-DIAGNOSTIC] sourceRollbackObject=${gitObject(sourceRollback)} bytes=${sourceRollback.length}`);
  console.log(`[BUG022-C25-DIAGNOSTIC] testRollbackObject=${gitObject(testRollback)} bytes=${testRollback.length}`);
  assert.equal(gitObject(sourceRollback), sourceRollbackObject, 'source rollback object drifted');
  assert.equal(gitObject(testRollback), testRollbackObject, 'test rollback object drifted');
  assert.notEqual(sourceAfterObject, sourceRollbackObject, 'production source delta is missing');
  assert.notEqual(testAfterObject, testRollbackObject, 'persistent test delta is missing');
  assert.deepEqual(repairedRatchet, rollbackRatchet, 'crossing ratchet changed during relocation');
  assert.equal(repairedRatchet.length, 9, 'crossing ratchet cardinality changed');

  const protectedBytes = new Map();
  for (const [path, expectedObject] of protectedObjects) {
    const bytes = readFileSync(resolve(ROOT, path));
    assert.equal(gitObject(bytes), expectedObject, `${path} changed before rollback canary`);
    protectedBytes.set(path, bytes);
  }

  const unrelatedBefore = unrelatedDirtySnapshot();
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-r4-current-rollback-'));
  let reverseSourceObject;
  let reverseTestObject;
  let forwardSourceObject;
  let forwardTestObject;
  let reverseRatchet;
  let forwardRatchet;

  try {
    runGit(['init', '-q'], { cwd: tempRoot });
    const baseFiles = new Map([
      [sourcePath, sourceRollback],
      [testPath, testRollback],
      ...protectedBytes
    ]);
    for (const [path, bytes] of baseFiles) {
      const absolutePath = resolve(tempRoot, path);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, bytes);
    }
    runGit(['add', '--', ...baseFiles.keys()], { cwd: tempRoot });
    writeFileSync(resolve(tempRoot, sourcePath), sourceAfter);
    writeFileSync(resolve(tempRoot, testPath), testAfter);

    const changedPaths = runGit(['diff', '--name-only', '--', sourcePath, testPath], {
      cwd: tempRoot
    }).toString('utf8').trim().split(/\r?\n/).filter(Boolean);
    assert.deepEqual(changedPaths, [sourcePath, testPath]);
    const patch = runGit(['diff', '--binary', '--', sourcePath, testPath], { cwd: tempRoot });

    runGit(['apply', '--reverse', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    reverseSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    reverseTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    reverseRatchet = ratchetEntries(readFileSync(resolve(tempRoot, testPath), 'utf8'));
    assert.equal(reverseSourceObject, sourceRollbackObject);
    assert.equal(reverseTestObject, testRollbackObject);
    assert.deepEqual(reverseRatchet, rollbackRatchet);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }

    runGit(['apply', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    forwardSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    forwardTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    forwardRatchet = ratchetEntries(readFileSync(resolve(tempRoot, sourcePath), 'utf8'));
    assert.equal(forwardSourceObject, sourceAfterObject);
    assert.equal(forwardTestObject, testAfterObject);
    assert.deepEqual(forwardRatchet, repairedRatchet);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  const unrelatedAfter = unrelatedDirtySnapshot();
  let residue = true;
  try { readdirSync(tempRoot); } catch { residue = false; }

  console.log(`[BUG022-C25] rollbackSource=${reverseSourceObject}`);
  console.log(`[BUG022-C25] rollbackTest=${reverseTestObject}`);
  console.log(`[BUG022-C25] repairedSource=${forwardSourceObject}`);
  console.log(`[BUG022-C25] repairedTest=${forwardTestObject}`);
  console.log(`[BUG022-C25] ratchetEntries=${repairedRatchet.length}`);
  console.log(`[BUG022-C25] ratchetSha256=${sha256(Buffer.from(JSON.stringify(repairedRatchet)))}`);
  console.log(`[BUG022-C25] protectedObjects=${protectedObjects.size}`);
  console.log(`[BUG022-C25] unrelatedSnapshotEntries=${unrelatedBefore.length}`);
  console.log(`[BUG022-C25] unrelatedObjectsStable=${JSON.stringify(unrelatedAfter) === JSON.stringify(unrelatedBefore)}`);
  console.log(`[BUG022-C25] mutationResidue=${residue}`);

  assert.deepEqual(unrelatedAfter, unrelatedBefore);
  assert.equal(residue, false);
});
// BUG022_R4_CURRENT_REPAIR_TEST_DELTA_END

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
  const tempPrefix = 'research-lab-scn-bug017-06-';
  const ownedTempEntries = () => readdirSync(tmpdir())
    .filter((entry) => entry.startsWith(tempPrefix))
    .sort();
  const before = ownedTempEntries();
  const atBound = spawnSync(process.execPath, [validator, '--control', 'at-bound'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  const afterAtBound = ownedTempEntries();
  const overBound = spawnSync(process.execPath, [validator, '--control', 'over-bound'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  const afterOverBound = ownedTempEntries();

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
  assert.deepEqual(afterAtBound, before, 'SCN-BUG017-06: at-bound control left owned temp residue');

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
  assert.deepEqual(afterOverBound, before, 'SCN-BUG017-06: over-bound control left owned temp residue');

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

test('Regression: SCN-BUG017-11 fallback selection requires rejected candidate and hash-verified rollback', () => {
  const prefix = 'SCN-BUG017-11 selection precondition';
  const identities = Object.freeze({
    rejectionAnchor: 'scope-4-finalization-validation-candidate-rejected',
    testRevert: '047292eb2d2d7444dff1e45b52738950609cad4b',
    testCandidate: '5620a4e7865742eca3651565bffcac86153a4419',
    implementationRevert: 'af119275ad624893d5c55ac07d046d646c0928a4',
    implementationCandidate: 'b3322965e6209b125391c3f147b45ce1ae8241b4',
    foundationBaseline: 'bc66800eb67d51f2bfdd3beae19bbe0bee697d2e',
    runtimeFunctionalBaseline: '0d319b8b1662dbb45dd4a5b61b189b6909ded77d'
  });
  const runtimeFunctionalPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const foundationPath = 'tests/portfolio-survival-foundation.spec.mjs';
  const rejectedCanaryTitle = [
    'Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker ',
    'within 15 seconds'
  ].join('');

  function gitOutput(args, claim) {
    const execution = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
    assert.equal(execution.signal, null, `${prefix}: ${claim} was interrupted`);
    assert.equal(
      execution.status,
      0,
      `${prefix}: ${claim} failed\n${execution.stderr ?? ''}`
    );
    return execution.stdout;
  }

  function commitRecord(hash, claim) {
    const fields = gitOutput(
      ['show', '-s', '--format=%H%x00%P%x00%s%x00%B', hash],
      claim
    ).trimEnd().split('\0');
    assert.ok(fields.length >= 4, `${prefix}: ${claim} returned a malformed commit record`);
    const [actualHash, parentText, subject, ...body] = fields;
    assert.equal(actualHash, hash, `${prefix}: ${claim} resolved a different object`);
    return {
      body: body.join('\0'),
      hash: actualHash,
      parents: parentText.split(' ').filter(Boolean),
      subject
    };
  }

  function changedPaths(hash, claim) {
    return gitOutput(
      ['diff-tree', '--no-commit-id', '--name-only', '-r', hash],
      claim
    ).trim().split(/\r?\n/).filter(Boolean).sort();
  }

  function treeBlob(treeish, path, claim) {
    const line = gitOutput(['ls-tree', treeish, '--', path], claim).trim();
    const match = /^(\d{6}) blob ([0-9a-f]{40})\t(.+)$/.exec(line);
    assert.ok(match, `${prefix}: ${claim} did not resolve one blob entry`);
    assert.equal(match[3], path, `${prefix}: ${claim} resolved the wrong path`);
    return match[2];
  }

  const testRevert = commitRecord(identities.testRevert, 'lifecycle test revert');
  const testCandidate = commitRecord(identities.testCandidate, 'lifecycle test candidate');
  const implementationRevert = commitRecord(
    identities.implementationRevert,
    'lifecycle implementation revert'
  );
  const implementationCandidate = commitRecord(
    identities.implementationCandidate,
    'lifecycle implementation candidate'
  );

  assert.equal(
    testRevert.subject,
    'Revert "test(BUG-017): lock lifecycle containment"',
    `${prefix}: lifecycle test revert is not explicit`
  );
  assert.match(
    testRevert.body,
    new RegExp(`This reverts commit ${identities.testCandidate}\\.`),
    `${prefix}: lifecycle test revert does not name its candidate`
  );
  assert.equal(testCandidate.subject, 'test(BUG-017): lock lifecycle containment');
  assert.deepEqual(testCandidate.parents, [identities.implementationCandidate]);
  assert.deepEqual(changedPaths(identities.testCandidate, 'lifecycle test candidate paths'), [
    runtimeFunctionalPath
  ]);
  assert.deepEqual(changedPaths(identities.testRevert, 'lifecycle test revert paths'), [
    runtimeFunctionalPath
  ]);

  assert.equal(
    implementationRevert.subject,
    'Revert "fix(BUG-017): close Foundation browser before teardown"',
    `${prefix}: lifecycle implementation revert is not explicit`
  );
  assert.match(
    implementationRevert.body,
    new RegExp(`This reverts commit ${identities.implementationCandidate}\\.`),
    `${prefix}: lifecycle implementation revert does not name its candidate`
  );
  assert.equal(
    implementationCandidate.subject,
    'fix(BUG-017): close Foundation browser before teardown'
  );
  assert.deepEqual(implementationRevert.parents, [identities.testRevert]);
  assert.deepEqual(changedPaths(identities.implementationCandidate, 'implementation candidate paths'), [
    runtimeFunctionalPath,
    foundationPath
  ].sort());
  assert.deepEqual(changedPaths(identities.implementationRevert, 'implementation revert paths'), [
    runtimeFunctionalPath,
    foundationPath
  ].sort());

  assert.equal(implementationCandidate.parents.length, 1);
  const preCandidateTree = implementationCandidate.parents[0];
  assert.equal(
    treeBlob(preCandidateTree, foundationPath, 'pre-candidate Foundation identity'),
    identities.foundationBaseline
  );
  assert.equal(
    treeBlob(identities.implementationRevert, foundationPath, 'final-revert Foundation identity'),
    identities.foundationBaseline
  );
  assert.equal(
    treeBlob(preCandidateTree, runtimeFunctionalPath, 'pre-candidate runtime-functional identity'),
    identities.runtimeFunctionalBaseline
  );
  assert.equal(
    treeBlob(
      identities.implementationRevert,
      runtimeFunctionalPath,
      'final-revert runtime-functional identity'
    ),
    identities.runtimeFunctionalBaseline
  );

  const report = readFileSync(BUG017_REPORT, 'utf8');
  const anchorToken = `{#${identities.rejectionAnchor}}`;
  const anchorIndex = report.indexOf(anchorToken);
  assert.ok(anchorIndex >= 0, `${prefix}: candidate-rejection report anchor is missing`);
  assert.equal(
    report.indexOf(anchorToken, anchorIndex + anchorToken.length),
    -1,
    `${prefix}: candidate-rejection report anchor is ambiguous`
  );
  const sectionStart = report.lastIndexOf('\n## ', anchorIndex);
  const sectionEnd = report.indexOf('\n## ', anchorIndex + anchorToken.length);
  const rejectionSection = report.slice(
    sectionStart < 0 ? 0 : sectionStart + 1,
    sectionEnd < 0 ? report.length : sectionEnd
  );
  const failedReceipts = rejectionSection.match(/\*\*Exit Code:\*\* 1/g) ?? [];
  assert.match(rejectionSection, /^## Scope 4 Finalization Validation - Candidate Rejected/m);
  assert.ok(failedReceipts.length >= 2, `${prefix}: rejection section lacks both failed receipts`);
  assert.match(rejectionSection, /AssertionError \[ERR_ASSERTION\]/);
  assert.match(rejectionSection, /process did not exit within 15000ms after stop, force-killed it/);
  assert.equal(
    rejectionSection.includes(rejectedCanaryTitle),
    true,
    `${prefix}: rejected canary title is missing from historical evidence`
  );

  const configSource = readFileSync(resolve(ROOT, 'playwright.config.mjs'), 'utf8');
  const foundationSource = readFileSync(resolve(ROOT, foundationPath), 'utf8');
  const runtimeFunctionalSource = readFileSync(resolve(ROOT, runtimeFunctionalPath), 'utf8');
  const runnerSource = readFileSync(resolve(LOCAL_PACKAGE, 'lib/runner/index.js'), 'utf8');
  const systemChrome = playwrightConfig.projects.find(({ name }) => name === 'system-chrome');

  assert.equal(playwrightConfig.workers, 1, `${prefix}: fallback must resolve one worker`);
  assert.ok(systemChrome, `${prefix}: system-chrome project is missing`);
  assert.equal(systemChrome.use.browserName, 'chromium');
  assert.equal(systemChrome.use.channel, 'chrome');
  assert.match(
    runnerSource,
    /process\.env\.PWTEST_CHILD_PROCESS_TIMEOUT \|\| 5 \* 60 \* 1e3/,
    `${prefix}: vendor worker-stop budget is no longer 300000ms`
  );
  assert.match(
    runnerSource,
    /this\.emit\("processError", \{ message: `Error: \$\{this\._processName\} process did not exit within \$\{timeout\}ms after stop, force-killed it` \}\)/,
    `${prefix}: vendor force-kill no longer emits a visible process error`
  );
  assert.match(configSource, /process did not exit within 300000ms after stop,\s+force-killed it/);
  assert.doesNotMatch(configSource, /PWTEST_CHILD_PROCESS_TIMEOUT\s*[:=]/);
  assert.doesNotMatch(
    foundationSource,
    /foundationBrowserBoundary|foundationBrowser\.close\(\)/,
    `${prefix}: rejected lifecycle seam returned to Foundation`
  );
  assert.equal(
    runtimeFunctionalSource.includes(rejectedCanaryTitle),
    false,
    `${prefix}: rejected canary title returned to the current functional carrier`
  );

  console.log(`[SCN-BUG017-11-selection] rejectionAnchor=${identities.rejectionAnchor}`);
  console.log(`[SCN-BUG017-11-selection] failedCandidateReceipts=${failedReceipts.length}`);
  console.log(`[SCN-BUG017-11-selection] testRevert=${testRevert.hash}`);
  console.log(`[SCN-BUG017-11-selection] testCandidate=${testCandidate.hash}`);
  console.log(`[SCN-BUG017-11-selection] implementationRevert=${implementationRevert.hash}`);
  console.log(`[SCN-BUG017-11-selection] implementationCandidate=${implementationCandidate.hash}`);
  console.log(`[SCN-BUG017-11-selection] foundationBaseline=${identities.foundationBaseline}`);
  console.log(`[SCN-BUG017-11-selection] runtimeFunctionalBaseline=${identities.runtimeFunctionalBaseline}`);
  console.log('[SCN-BUG017-11-selection] workers=1');
  console.log('[SCN-BUG017-11-selection] project=system-chrome');
  console.log('[SCN-BUG017-11-selection] channel=chrome');
  console.log('[SCN-BUG017-11-selection] defaultWorkerStopBudgetMs=300000');
  console.log('[SCN-BUG017-11-selection] forceKillSemantics=visible-process-error');
  console.log('[SCN-BUG017-11-selection] rejectedLifecycleSeam=current-absent');
  console.log('[SCN-BUG017-11-selection] rejectedCanaryTitle=current-absent,historical-present');
  console.log('[SCN-BUG017-11-selection] candidateAcceptanceWorkloadInvocations=0');
});