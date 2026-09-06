import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as directRuntime from 'playwright/test';
import playwrightConfig from '../playwright.config.mjs';
import * as sharedRuntime from './playwright-runtime.mjs';

const ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const ORIGINAL_REACHABILITY_VALIDATOR = resolve(ROOT, 'scripts/validate-test-file-reachability.mjs');
const BUG022_SCENARIO_RED_CONTROL = process.env.BUG022_SCENARIO_RED_CONTROL?.trim() ?? '';

function replaceRedControlOnce(source, before, after, label) {
  const first = source.indexOf(before);
  assert.ok(first >= 0, `${label}: mutation anchor is missing`);
  assert.equal(source.indexOf(before, first + before.length), -1, `${label}: mutation anchor is ambiguous`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function replaceRedControlRange(source, startAnchor, endAnchor, replacement, label) {
  const start = source.indexOf(startAnchor);
  assert.ok(start >= 0, `${label}: start anchor is missing`);
  assert.equal(source.indexOf(startAnchor, start + startAnchor.length), -1, `${label}: start anchor is ambiguous`);
  const end = source.indexOf(endAnchor, start + startAnchor.length);
  assert.ok(end > start, `${label}: end anchor is missing or unordered`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function mutateReachabilityValidator(source, control) {
  switch (control) {
    case 'TP-BUG022-F08':
      return replaceRedControlOnce(
        source,
        [
          '    const identity = declarationIdentity(kind, pattern);',
          '    if (!byIdentity.has(identity)) byIdentity.set(identity, { pattern, kind, sites: [] });',
          '    byIdentity.get(identity).sites.push(site);'
        ].join('\n'),
        [
          '    const identity = pattern;',
          '    if (!byIdentity.has(identity)) byIdentity.set(identity, { pattern, kind, sites: [] });',
          '    byIdentity.get(identity).sites.push(site);'
        ].join('\n'),
        control
      );
    case 'TP-BUG022-R4-F43':
      return replaceRedControlOnce(
        source,
        '    const explicitOneTokenWrapper = nodeTokenIndex === 1;',
        [
          '    const explicitOneTokenWrapper = (',
          "      presentation === 'command-label' || presentation === 'table-cell'",
          '    ) && nodeTokenIndex === 1;'
        ].join('\n'),
        control
      );
    case 'TP-BUG022-F10':
      return replaceRedControlOnce(
        source,
        'export function runnerDisjointnessVerdict(globs, testFiles, knownCrossings = []) {',
        'function runnerDisjointnessVerdict(globs, testFiles, knownCrossings = []) {',
        control
      );
    case 'TP-BUG022-R4-F50':
      return replaceRedControlRange(
        source,
        'function listFilesRecursive(root, absDir, ignored, visited = new Set()) {',
        'function artifactRole(artifact) {',
        [
          'function listFilesRecursive(root, absDir, ignored, visited = new Set()) {',
          '  const found = [];',
          '  let entries;',
          '  try { entries = readdirSync(absDir, { withFileTypes: true }); } catch { return found; }',
          '  for (const entry of entries) {',
          '    const abs = join(absDir, entry.name);',
          '    if (entry.isDirectory()) {',
          '      if (ignored.some((matcher) => matcher.test(entry.name))) continue;',
          '      found.push(...listFilesRecursive(root, abs, ignored, visited));',
          '    } else if (entry.isFile()) {',
          '      found.push(abs);',
          '    }',
          '  }',
          '  return found;',
          '}',
          '',
          ''
        ].join('\n'),
        control
      );
    case 'TP-BUG022-R4-F45':
      return replaceRedControlOnce(
        source,
        [
          "    if (presentation === 'markdown-list') {",
          "      presented = presented.replace(/^\\[(?: |x|X)\\][ \\t]+/, '');",
          '    }'
        ].join('\n'),
        '',
        control
      );
    case 'TP-BUG022-R4-F47':
      return replaceRedControlRange(
        source,
        'function splitMarkdownTableCells(line) {',
        'function completeCodeSpan(text) {',
        [
          'function splitMarkdownTableCells(line) {',
          "  const cells = line.trim().split('|');",
          "  if (cells[0]?.trim() === '') cells.shift();",
          "  if (cells[cells.length - 1]?.trim() === '') cells.pop();",
          '  return cells;',
          '}',
          '',
          ''
        ].join('\n'),
        control
      );
    case 'TP-BUG022-R4-F20':
      return replaceRedControlOnce(
        source,
        [
          '  try {',
          '    runnerDisjointnessVerdict(result.globs, result.testFiles, result.knownCrossings);',
          '  } catch (error) {',
          '    if (!(error instanceof RunnerDisjointnessRefusal)) throw error;',
          '    console.error(`${error.name}: ${error.message}`);',
          '    return 1;',
          '  }'
        ].join('\n'),
        '',
        control
      );
    case 'TP-BUG022-R4-F51':
      return replaceRedControlOnce(
        source,
        "      if (tokens[cursor]?.value === ';') break;",
        "      if (tokens[cursor]?.value === ';' || tokens[cursor]?.value === '{' || tokens[cursor]?.value === '}') break;",
        control
      );
    default:
      throw new Error(`unsupported BUG-022 RED control: ${control}`);
  }
}

function reachabilityValidatorForTest() {
  if (BUG022_SCENARIO_RED_CONTROL === '') return ORIGINAL_REACHABILITY_VALIDATOR;
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-scenario-red-'));
  const scriptsRoot = resolve(fixtureRoot, 'scripts');
  const validatorPath = resolve(scriptsRoot, 'validate-test-file-reachability.mjs');
  mkdirSync(scriptsRoot, { recursive: true });
  writeFileSync(
    validatorPath,
    mutateReachabilityValidator(readFileSync(ORIGINAL_REACHABILITY_VALIDATOR, 'utf8'), BUG022_SCENARIO_RED_CONTROL)
  );
  symlinkSync(
    resolve(ROOT, 'scripts/validate-scope-dod-progress.mjs'),
    resolve(scriptsRoot, 'validate-scope-dod-progress.mjs')
  );
  process.once('exit', () => rmSync(fixtureRoot, { recursive: true, force: true }));
  console.log(`[BUG022-SCENARIO-RED] control=${BUG022_SCENARIO_RED_CONTROL} productionSourceUnchanged=true`);
  return validatorPath;
}

const REACHABILITY_VALIDATOR = reachabilityValidatorForTest();
const testFileReachability = await import(pathToFileURL(REACHABILITY_VALIDATOR).href);
const {
  collectDeclaredTestGlobs,
  globToRegExp,
  KNOWN_DISCOVERY_CROSSINGS
} = testFileReachability;

const HELPER = resolve(ROOT, 'tests/playwright-runtime.mjs');
const TESTS_DIR = resolve(ROOT, 'tests');
const REACHABILITY_BASELINE = resolve(ROOT, 'scripts/validate-test-file-reachability.baseline');
const BUG022_BASELINE_CEILING = 26;
const BUG022_CROSSING_CEILING = 8;
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

// BUG022_C55_DIRECT_NODE_SCRIPT_TEST_BEGIN
test('Regression: SCN-BUG022-003 direct-node-script family authority stays distinct from node:test Playwright and history', () => {
  const pattern = 'tests/distributed-briefs*.load.mjs';
  const directCommand = `for test_file in ${pattern}; do node "$test_file" || exit 1; done`;
  const scopeArtifact = 'specs/012-market-action-center/scopes/11-feature-002-brief/scope.md';
  const structuredArtifact = 'specs/012-market-action-center/test-plan.json';
  const reportArtifact = 'specs/002-distributed-tool-briefs/scopes/07-history/report.md';
  const scopeSource = [
    '# Scopes',
    '',
    '## Scope 11',
    '',
    '### Test Plan',
    '',
    '| Command |',
    '| --- |',
    `| \`${directCommand.replaceAll('|', '\\|')}\` |`,
    `| \`node --test ${pattern}\` |`,
    ''
  ].join('\n');
  const structuredSource = JSON.stringify({
    scopes: [{
      scopeId: '11-feature-002-brief',
      tests: [{
        command: 'node scripts/validate-test-file-reachability.mjs',
        declaredRunnerCommand: directCommand,
        requiredRunnerClass: 'direct-node-script'
      }]
    }]
  }, null, 2) + '\n';
  const reportSource = [
    '# Report',
    '',
    '## Test Evidence',
    '```text',
    `$ ${directCommand}`,
    '```',
    ''
  ].join('\n');
  const playwrightSource = `export default { testMatch: '${pattern}' };\n`;

  withDeclarationFixture({
    'playwright.config.mjs': playwrightSource,
    [scopeArtifact]: scopeSource,
    [structuredArtifact]: structuredSource,
    [reportArtifact]: reportSource
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const directDeclaration = declarationFor(result, pattern, 'direct-node-script');
    const nodeTestDeclaration = declarationFor(result, pattern, 'node-test-argument');
    const playwrightDeclaration = declarationFor(result, pattern, 'playwright-testMatch');
    const historicalDirectSites = result.historicalSites.filter((site) => (
      site.pattern === pattern && site.kind === 'direct-node-script'
    ));

    assert.ok(directDeclaration, 'active plain-Node family command was not classified');
    assert.deepEqual(
      directDeclaration.sites.map(({ artifact }) => artifact).sort(),
      [scopeArtifact, structuredArtifact].sort()
    );
    assert.deepEqual(
      [...new Set(directDeclaration.sites.map(({ kind }) => kind))],
      ['direct-node-script']
    );
    assert.ok(nodeTestDeclaration, 'node:test identity disappeared');
    assert.equal(nodeTestDeclaration.sites.length, 1);
    assert.ok(playwrightDeclaration, 'Playwright identity disappeared');
    assert.equal(playwrightDeclaration.sites.length, 1);
    assert.equal(historicalDirectSites.length, 1);
    assert.equal(historicalDirectSites[0].artifact, reportArtifact);
    assert.equal(historicalDirectSites[0].authority, 'historical');
    assert.deepEqual(result.classificationErrors, []);
  });
});
// BUG022_C55_DIRECT_NODE_SCRIPT_TEST_END

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
  const testRollbackObject = 'e0ee08047c53f466ffbd68322ebd9b626e7f5fda';
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
  const sourceAfter = Buffer.from(
    securityRollbackSource(readFileSync(resolve(ROOT, sourcePath), 'utf8')),
    'utf8'
  );
  const testAfter = Buffer.from(
    securityRollbackTest(readFileSync(resolve(ROOT, testPath), 'utf8')),
    'utf8'
  );
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
    "  'tests/causal-rotation-registry.spec.mjs'",
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

  if (BUG022_SCENARIO_RED_CONTROL === 'TP-BUG022-R4-F20') {
    const symlinkControlTitle = 'Regression: SCN-BUG022-007 baseline symlink escapes refuse before mutation';
    const symlinkControlEnv = { ...process.env, BUG022_SCENARIO_RED_CONTROL: '' };
    delete symlinkControlEnv.NODE_TEST_CONTEXT;
    const symlinkControl = spawnSync(process.execPath, [
      '--test',
      `--test-name-pattern=^${symlinkControlTitle}$`,
      fileURLToPath(import.meta.url)
    ], {
      cwd: ROOT,
      encoding: 'utf8',
      env: symlinkControlEnv,
      timeout: 30000
    });
    const symlinkOutput = `${symlinkControl.stdout ?? ''}${symlinkControl.stderr ?? ''}`;

    console.log(`[BUG022-F20] baselineSymlinkControlExit=${symlinkControl.status} signal=${symlinkControl.signal ?? 'none'}`);
    console.log(`[BUG022-F20] baselineLeafRefusal=${symlinkOutput.includes('[BUG022-F32] leafExit=1 signal=none')}`);
    console.log(`[BUG022-F20] baselineParentRefusal=${symlinkOutput.includes('[BUG022-F32] parentExit=1 signal=none')}`);
    console.log(`[BUG022-F20] regularShrinkControl=${symlinkOutput.includes('[BUG022-F32] controlExit=0 signal=none')}`);

    assert.equal(symlinkControl.signal, null);
    assert.equal(symlinkControl.status, 0, symlinkOutput);
    assert.match(symlinkOutput, /\[BUG022-F32\] leafExit=1 signal=none/);
    assert.match(symlinkOutput, /\[BUG022-F32\] parentExit=1 signal=none/);
    assert.match(symlinkOutput, /\[BUG022-F32\] controlExit=0 signal=none/);
  }

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

test('Regression: SCN-BUG022-005 backticked unordered Markdown-list commands fail closed', () => {
  const unknownArtifact = 'misc/backticked-unordered-command.md';
  const pattern = 'tests/backticked-unordered-*.mjs';
  const source = [
    '# Unknown backticked command',
    '',
    `- \`node --test ${pattern}\``,
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === unknownArtifact)
      .map(({ artifact, artifactRole, authority, line, pattern: candidatePattern, reason, sectionRole }) => ({
        artifact,
        artifactRole,
        authority,
        line,
        pattern: candidatePattern,
        reason,
        sectionRole
      }));

    console.log(`[BUG022-F26] artifact=${unknownArtifact}`);
    console.log(`[BUG022-F26] expectedPattern=${pattern}`);
    console.log(`[BUG022-F26] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F26] errorLine=${errors[0]?.line ?? 'missing'}`);
    console.log(`[BUG022-F26] errorReason=${errors[0]?.reason ?? 'missing'}`);

    assert.deepEqual(errors, [{
      artifact: unknownArtifact,
      artifactRole: 'unknown',
      authority: 'error',
      line: 3,
      pattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    }]);
  });
});

test('Regression: SCN-BUG022-005 backticked ordered Markdown-list commands fail closed', () => {
  const unknownArtifact = 'misc/backticked-ordered-command.md';
  const pattern = 'tests/backticked-ordered-*.mjs';
  const source = [
    '# Unknown backticked command',
    '',
    `1. \`node --test ${pattern}\``,
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === unknownArtifact)
      .map(({ artifact, artifactRole, authority, line, pattern: candidatePattern, reason, sectionRole }) => ({
        artifact,
        artifactRole,
        authority,
        line,
        pattern: candidatePattern,
        reason,
        sectionRole
      }));

    console.log(`[BUG022-F27] artifact=${unknownArtifact}`);
    console.log(`[BUG022-F27] expectedPattern=${pattern}`);
    console.log(`[BUG022-F27] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F27] errorLine=${errors[0]?.line ?? 'missing'}`);
    console.log(`[BUG022-F27] errorReason=${errors[0]?.reason ?? 'missing'}`);

    assert.deepEqual(errors, [{
      artifact: unknownArtifact,
      artifactRole: 'unknown',
      authority: 'error',
      line: 3,
      pattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    }]);
  });
});

test('Regression: SCN-BUG022-002 absolute gtimeout wrappers fail closed with provenance', () => {
  const unknownArtifact = 'misc/absolute-gtimeout-command.md';
  const pattern = 'tests/absolute-gtimeout-*.mjs';
  const source = [
    '# Unknown absolute wrapper command',
    '',
    `/opt/local/bin/gtimeout 30 node --test ${pattern}`,
    ''
  ].join('\n');

  withDeclarationFixture({ [unknownArtifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === unknownArtifact)
      .map(({ artifact, artifactRole, authority, line, pattern: candidatePattern, reason, sectionRole }) => ({
        artifact,
        artifactRole,
        authority,
        line,
        pattern: candidatePattern,
        reason,
        sectionRole
      }));

    console.log(`[BUG022-F28] artifact=${unknownArtifact}`);
    console.log(`[BUG022-F28] expectedPattern=${pattern}`);
    console.log(`[BUG022-F28] classificationErrors=${errors.length}`);
    console.log(`[BUG022-F28] errorLine=${errors[0]?.line ?? 'missing'}`);
    console.log(`[BUG022-F28] errorReason=${errors[0]?.reason ?? 'missing'}`);

    assert.deepEqual(errors, [{
      artifact: unknownArtifact,
      artifactRole: 'unknown',
      authority: 'error',
      line: 3,
      pattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    }]);
  });
});

// BUG022_R4_HARDENING_ROLLBACK_CARRIER_BEGIN
test('Regression: SCN-BUG022-005 hardening repair rollback preserves source test and protected objects', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const sourceRollbackObject = 'cd3d5fc1bfa613e60360a96ef66ff09175e65e8c';
  const sourceRepairedObject = '253b28fbdc37c036b3167527d5395fa1a6b223cf';
  const testRollbackObject = '5ba14ff90eb0de76e5bb7cc3d2647273b358ba5a';
  const testRepairedObject = 'f10a8364be3e5499ec2c7a340785648e22476c66';
  const protectedObjects = new Map([
    ['scripts/validate-test-file-reachability.baseline', '2a5e472d7650027c53a17c7ae340d2bb25d2e821'],
    ['.specify/memory/agents.md', '08592d2bfaa8f6787806f05f508df9f3e0920a75'],
    ['playwright.config.mjs', 'e022a133857aa20bd10b759a98b80e2df38ce621'],
    [
      'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md',
      'a50d8e1727ef1b514e676016c480a436c0cc3033'
    ]
  ]);
  const freshTestTitles = [
    "test('Regression: SCN-BUG022-005 backticked unordered Markdown-list commands fail closed', () => {",
    "test('Regression: SCN-BUG022-005 backticked ordered Markdown-list commands fail closed', () => {",
    "test('Regression: SCN-BUG022-002 absolute gtimeout wrappers fail closed with provenance', () => {"
  ];
  const currentTitle = "test('Regression: SCN-BUG022-005 hardening repair rollback preserves source test and protected objects', async () => {";
  const carrierMarkerStart = '\n// BUG022_R4_HARDENING_' + 'ROLLBACK_CARRIER_BEGIN\n';
  const carrierMarkerEnd = '// BUG022_R4_HARDENING_' + 'ROLLBACK_CARRIER_END\n';
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

  function testBlockEnd(source, start, label) {
    let depth = 0;
    let quote = null;
    let escaped = false;
    let lineComment = false;
    let blockComment = false;

    for (let index = start; index < source.length; index++) {
      const character = source[index];
      const next = source[index + 1];
      if (lineComment) {
        if (character === '\n') lineComment = false;
        continue;
      }
      if (blockComment) {
        if (character === '*' && next === '/') {
          blockComment = false;
          index++;
        }
        continue;
      }
      if (quote !== null) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          quote = null;
        }
        continue;
      }
      if (character === '/' && next === '/') {
        lineComment = true;
        index++;
        continue;
      }
      if (character === '/' && next === '*') {
        blockComment = true;
        index++;
        continue;
      }
      if (character === "'" || character === '"' || character === '`') {
        quote = character;
        continue;
      }
      if (character === '{') depth++;
      if (character !== '}') continue;
      depth--;
      if (depth === 0) {
        const suffix = source.slice(index, index + 5);
        assert.match(suffix, /^}\);(?:\n|$)/, `${label}: test terminator is malformed`);
        return index + 4;
      }
    }
    assert.fail(`${label}: test terminator is missing`);
  }

  function removeTest(source, title, label) {
    const start = source.indexOf(title);
    assert.ok(start >= 0, `${label}: test start is missing`);
    assert.ok(source.startsWith("test('", start), `${label}: removal anchor is not a test declaration`);
    let end = testBlockEnd(source, start, label);
    if (source[end] === '\n') end++;
    return source.slice(0, start) + source.slice(end);
  }

  function removeMarkedBlock(source, startMarker, endMarker, label) {
    const start = source.indexOf(startMarker);
    assert.ok(start >= 0, `${label}: start marker is missing`);
    assert.equal(source.indexOf(startMarker, start + startMarker.length), -1, `${label}: start marker is ambiguous`);
    const end = source.indexOf(endMarker, start + startMarker.length);
    assert.ok(end > start, `${label}: end marker is missing or unordered`);
    assert.equal(source.indexOf(endMarker, end + endMarker.length), -1, `${label}: end marker is ambiguous`);
    return source.slice(0, start) + source.slice(end + endMarker.length);
  }

  const declarationCount = (source, title) => source.split('\n')
    .filter((line) => line === title)
    .length;

  function rollbackSource(current) {
    let source = current;
    source = replaceExactly(
      source,
      '    let codeSpanCoversPresentation = false;\n',
      '',
      'fresh Markdown-list presentation state'
    );
    source = replaceExactly(
      source,
      [
        '      if (openingIndex === 0 && closingIndex + delimiter.length === presented.length) {',
        '        codeSpanCoversPresentation = true;',
        '      }',
        ''
      ].join('\n'),
      '',
      'fresh Markdown-list presentation coverage'
    );
    source = replaceExactly(
      source,
      "      || (presentation === 'markdown-list' && codeSpanCoversPresentation)\n",
      '',
      'fresh Markdown-list command authority'
    );
    source = replaceExactly(
      source,
      "  if (/^(?:timeout|gtimeout|\\/usr\\/bin\\/(?:g?timeout)|\\/opt\\/(?:homebrew|local)\\/bin\\/(?:g?timeout))$/.test(wrapper ?? '')) {",
      "  if (/^(?:timeout|gtimeout|\\/usr\\/bin\\/(?:g?timeout)|\\/opt\\/homebrew\\/bin\\/(?:g?timeout))$/.test(wrapper ?? '')) {",
      'fresh absolute gtimeout wrapper'
    );
    return source;
  }

  function rollbackTest(current) {
    let source = removeMarkedBlock(
      current,
      carrierMarkerStart,
      carrierMarkerEnd,
      'C31 persistent carrier'
    );
    for (const title of freshTestTitles) source = removeTest(source, title, title);
    source = replaceExactly(
      source,
      [
        '    source = replaceExactly(',
        '      source,',
        '      "  if (/^(?:timeout|gtimeout|\\\\/usr\\\\/bin\\\\/(?:g?timeout)|\\\\/opt\\\\/(?:homebrew|local)\\\\/bin\\\\/(?:g?timeout))$/.test(wrapper ?? \'\')) {",',
        '      "  if (/^(?:timeout|gtimeout|\\\\/usr\\\\/bin\\\\/(?:g?timeout)|\\\\/opt\\\\/homebrew\\\\/bin\\\\/(?:g?timeout))$/.test(wrapper ?? \'\')) {",',
        "      'fresh hardening absolute timeout wrapper'",
        '    );',
        ''
      ].join('\n'),
      '',
      'C25 fresh-wrapper compatibility adaptation'
    );
    return source;
  }

  function crossingEntries(source) {
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

  const sourceRepaired = Buffer.from(
    securityRollbackSource(readFileSync(resolve(ROOT, sourcePath), 'utf8')),
    'utf8'
  );
  const carrierTest = Buffer.from(
    securityRollbackTest(readFileSync(resolve(ROOT, testPath), 'utf8')),
    'utf8'
  );
  const testRepaired = Buffer.from(
    removeMarkedBlock(
      carrierTest.toString('utf8'),
      carrierMarkerStart,
      carrierMarkerEnd,
      'C31 persistent carrier'
    ),
    'utf8'
  );
  const sourceRollback = Buffer.from(rollbackSource(sourceRepaired.toString('utf8')), 'utf8');
  const testRollback = Buffer.from(rollbackTest(carrierTest.toString('utf8')), 'utf8');
  const carrierTestObject = gitObject(carrierTest);
  assert.equal(gitObject(sourceRepaired), sourceRepairedObject, 'fresh source object changed');
  assert.equal(gitObject(sourceRollback), sourceRollbackObject, 'fresh source rollback object changed');
  assert.equal(gitObject(testRepaired), testRepairedObject, 'fresh test object changed');
  assert.equal(gitObject(testRollback), testRollbackObject, 'fresh test rollback object changed');
  assert.notEqual(testRepairedObject, testRollbackObject, 'fresh persistent test delta is missing');
  assert.notEqual(carrierTestObject, testRepairedObject, 'C31 persistent carrier delta is missing');
  for (const title of freshTestTitles) {
    assert.equal(declarationCount(testRepaired.toString('utf8'), title), 1, `${title}: repaired test delta is missing`);
    assert.equal(testRollback.toString('utf8').includes(title), false, `${title}: rollback retained fresh test delta`);
  }
  assert.equal(declarationCount(carrierTest.toString('utf8'), currentTitle), 1, 'C31 title is not unique');

  const repairedCrossings = crossingEntries(sourceRepaired.toString('utf8'));
  const rollbackCrossings = crossingEntries(sourceRollback.toString('utf8'));
  assert.deepEqual(repairedCrossings, rollbackCrossings, 'crossing ratchet changed in fresh hardening');
  assert.equal(repairedCrossings.length, 8, 'crossing ratchet cardinality changed');

  const protectedBytes = new Map();
  for (const [path, expectedObject] of protectedObjects) {
    const bytes = readFileSync(resolve(ROOT, path));
    assert.equal(gitObject(bytes), expectedObject, `${path} changed before C31 rollback`);
    protectedBytes.set(path, bytes);
  }

  const unrelatedBefore = unrelatedDirtySnapshot();
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-r4-hardening-rollback-'));
  let reverseSourceObject;
  let reverseTestObject;
  let forwardSourceObject;
  let forwardTestObject;
  let reverseCrossings;
  let forwardCrossings;

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
    writeFileSync(resolve(tempRoot, sourcePath), sourceRepaired);
    writeFileSync(resolve(tempRoot, testPath), testRepaired);

    const changedPaths = runGit(['diff', '--name-only', '--', sourcePath, testPath], {
      cwd: tempRoot
    }).toString('utf8').trim().split(/\r?\n/).filter(Boolean);
    assert.deepEqual(changedPaths, [sourcePath, testPath]);
    const patch = runGit(['diff', '--binary', '--', sourcePath, testPath], { cwd: tempRoot });

    runGit(['apply', '--reverse', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    reverseSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    reverseTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    reverseCrossings = crossingEntries(readFileSync(resolve(tempRoot, sourcePath), 'utf8'));
    assert.equal(reverseSourceObject, sourceRollbackObject);
    assert.equal(reverseTestObject, testRollbackObject);
    assert.deepEqual(reverseCrossings, rollbackCrossings);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }

    runGit(['apply', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    forwardSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    forwardTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    forwardCrossings = crossingEntries(readFileSync(resolve(tempRoot, sourcePath), 'utf8'));
    assert.equal(forwardSourceObject, sourceRepairedObject);
    assert.equal(forwardTestObject, testRepairedObject);
    assert.deepEqual(forwardCrossings, repairedCrossings);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  const unrelatedAfter = unrelatedDirtySnapshot();
  let fixtureResidue = true;
  try { readdirSync(tempRoot); } catch { fixtureResidue = false; }

  console.log(`[BUG022-C31] rollbackSource=${reverseSourceObject}`);
  console.log(`[BUG022-C31] rollbackTest=${reverseTestObject}`);
  console.log(`[BUG022-C31] repairedSource=${forwardSourceObject}`);
  console.log(`[BUG022-C31] repairedTest=${forwardTestObject}`);
  console.log(`[BUG022-C31] ratchetEntries=${repairedCrossings.length}`);
  console.log(`[BUG022-C31] ratchetSha256=${sha256(Buffer.from(JSON.stringify(repairedCrossings)))}`);
  console.log(`[BUG022-C31] protectedObjects=${protectedObjects.size}`);
  console.log(`[BUG022-C31] unrelatedSnapshotEntries=${unrelatedBefore.length}`);
  console.log(`[BUG022-C31] unrelatedObjectsStable=${JSON.stringify(unrelatedAfter) === JSON.stringify(unrelatedBefore)}`);
  console.log(`[BUG022-C31] fixtureResidue=${fixtureResidue}`);

  assert.deepEqual(unrelatedAfter, unrelatedBefore);
  assert.equal(fixtureResidue, false);
});
// BUG022_R4_HARDENING_ROLLBACK_CARRIER_END

test('Regression: SCN-BUG022-007 convergence repair rollback preserves source test and protected objects', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const sourceRollbackObject = '7b08225e2619ae768db1a63c61d8a30c9c233862';
  const testRollbackObject = '8d0145a98199ac19a66347458c7c6a91a2eb924f';
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
    source = replaceExactly(
      source,
      "  if (/^(?:timeout|gtimeout|\\/usr\\/bin\\/(?:g?timeout)|\\/opt\\/(?:homebrew|local)\\/bin\\/(?:g?timeout))$/.test(wrapper ?? '')) {",
      "  if (/^(?:timeout|gtimeout|\\/usr\\/bin\\/(?:g?timeout)|\\/opt\\/homebrew\\/bin\\/(?:g?timeout))$/.test(wrapper ?? '')) {",
      'fresh hardening absolute timeout wrapper'
    );
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
      "  'tests/causal-rotation-registry.spec.mjs'",
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
      "  'tests/causal-rotation-registry.spec.mjs'",
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

  const sourceAfter = Buffer.from(
    securityRollbackSource(readFileSync(resolve(ROOT, sourcePath), 'utf8')),
    'utf8'
  );
  const testAfter = Buffer.from(
    securityRollbackTest(readFileSync(resolve(ROOT, testPath), 'utf8')),
    'utf8'
  );
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
  assert.equal(repairedRatchet.length, 8, 'crossing ratchet cardinality changed');

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

// BUG022_R4_SECURITY_TEST_DELTA_BEGIN
test('Regression: SCN-BUG022-007 baseline symlink escapes refuse before mutation', () => {
  const baselineRelative = 'scripts/validate-test-file-reachability.baseline';

  function writeRunnableFixture(root) {
    mkdirSync(resolve(root, 'specs/930-security-baseline'), { recursive: true });
    mkdirSync(resolve(root, 'tests'), { recursive: true });
    writeFileSync(
      resolve(root, 'playwright.config.mjs'),
      "export default { testMatch: '**/*.spec.mjs' };\n"
    );
    writeFileSync(
      resolve(root, 'specs/930-security-baseline/scopes.md'),
      [
        '# Scopes',
        '',
        '## Scope 1',
        '',
        '### Test Plan',
        '',
        'node --test tests/*.functional.mjs',
        ''
      ].join('\n')
    );
    writeFileSync(
      resolve(root, 'tests/security-baseline.functional.mjs'),
      "import test from 'node:test';\ntest('node fixture', () => {});\n"
    );
    writeFileSync(
      resolve(root, 'tests/security-baseline.spec.mjs'),
      "import test from 'node:test';\ntest('browser fixture', () => {});\n"
    );
  }

  function execute(root) {
    return spawnSync(process.execPath, [
      REACHABILITY_VALIDATOR,
      '--update-baseline',
      '--root',
      root
    ], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000
    });
  }

  withDeclarationFixture({}, (fixtureRoot) => {
    const leafRoot = resolve(fixtureRoot, 'leaf-root');
    const parentRoot = resolve(fixtureRoot, 'parent-root');
    const controlRoot = resolve(fixtureRoot, 'control-root');
    const outsideLeaf = resolve(fixtureRoot, 'outside-leaf.baseline');
    const outsideScripts = resolve(fixtureRoot, 'outside-scripts');
    const outsideParentBaseline = resolve(outsideScripts, 'validate-test-file-reachability.baseline');
    const leafSentinel = Buffer.from('# outside baseline leaf sentinel\n');
    const parentSentinel = Buffer.from('# outside scripts parent sentinel\n');

    writeRunnableFixture(leafRoot);
    mkdirSync(resolve(leafRoot, 'scripts'), { recursive: true });
    writeFileSync(outsideLeaf, leafSentinel);
    symlinkSync(outsideLeaf, resolve(leafRoot, baselineRelative));

    writeRunnableFixture(parentRoot);
    mkdirSync(outsideScripts, { recursive: true });
    writeFileSync(outsideParentBaseline, parentSentinel);
    symlinkSync(outsideScripts, resolve(parentRoot, 'scripts'));

    writeRunnableFixture(controlRoot);
    mkdirSync(resolve(controlRoot, 'scripts'), { recursive: true });
    writeFileSync(resolve(controlRoot, baselineRelative), '# regular in-root baseline\n');

    const leafBefore = readFileSync(outsideLeaf);
    const parentBefore = readFileSync(outsideParentBaseline);
    const leafExecution = execute(leafRoot);
    const parentExecution = execute(parentRoot);
    const controlExecution = execute(controlRoot);
    const leafAfter = readFileSync(outsideLeaf);
    const parentAfter = readFileSync(outsideParentBaseline);
    const leafOutput = `${leafExecution.stdout ?? ''}${leafExecution.stderr ?? ''}`;
    const parentOutput = `${parentExecution.stdout ?? ''}${parentExecution.stderr ?? ''}`;

    console.log(`[BUG022-F32] leafExit=${leafExecution.status} signal=${leafExecution.signal ?? 'none'}`);
    console.log(`[BUG022-F32] leafOutput=${leafOutput.trim().replaceAll('\n', ' | ')}`);
    console.log(`[BUG022-F32] leafSentinelStable=${leafBefore.equals(leafAfter)}`);
    console.log(`[BUG022-F32] parentExit=${parentExecution.status} signal=${parentExecution.signal ?? 'none'}`);
    console.log(`[BUG022-F32] parentOutput=${parentOutput.trim().replaceAll('\n', ' | ')}`);
    console.log(`[BUG022-F32] parentSentinelStable=${parentBefore.equals(parentAfter)}`);
    console.log(`[BUG022-F32] controlExit=${controlExecution.status} signal=${controlExecution.signal ?? 'none'}`);

    assert.equal(leafExecution.signal, null);
    assert.equal(leafExecution.status, 1, 'symlinked baseline leaf must refuse');
    assert.match(
      leafOutput,
      /SECURITY REFUSAL code=RCH-FS-001 path=scripts\/validate-test-file-reachability\.baseline reason=symlinked-baseline-target/
    );
    assert.deepEqual(leafAfter, leafBefore, 'symlinked baseline leaf mutated its outside sentinel');

    assert.equal(parentExecution.signal, null);
    assert.equal(parentExecution.status, 1, 'symlinked scripts parent must refuse');
    assert.match(
      parentOutput,
      /SECURITY REFUSAL code=RCH-FS-002 path=scripts reason=symlinked-baseline-parent/
    );
    assert.deepEqual(parentAfter, parentBefore, 'symlinked scripts parent mutated its outside sentinel');

    assert.equal(controlExecution.signal, null);
    assert.equal(controlExecution.status, 0, 'regular in-root baseline control must update');
    assert.match(controlExecution.stdout, /baseline written: scripts\/validate-test-file-reachability\.baseline/);
  });
});

test('Regression: SCN-BUG022-004 symlinked test discovery refuses outside-root admission', () => {
  function writeRepositoryShell(root) {
    mkdirSync(resolve(root, 'scripts'), { recursive: true });
    mkdirSync(resolve(root, 'specs/931-security-tests'), { recursive: true });
    writeFileSync(
      resolve(root, 'playwright.config.mjs'),
      "export default { testMatch: '**/*.spec.mjs' };\n"
    );
    writeFileSync(
      resolve(root, 'scripts/validate-test-file-reachability.baseline'),
      '# empty security fixture baseline\n'
    );
    writeFileSync(
      resolve(root, 'specs/931-security-tests/scopes.md'),
      [
        '# Scopes',
        '',
        '## Scope 1',
        '',
        '### Test Plan',
        '',
        'node --test tests/*.functional.mjs',
        ''
      ].join('\n')
    );
  }

  function execute(root) {
    return spawnSync(process.execPath, [REACHABILITY_VALIDATOR, '--root', root, '--all-sites'], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000
    });
  }

  withDeclarationFixture({}, (fixtureRoot) => {
    const testsRootAttack = resolve(fixtureRoot, 'tests-root-attack');
    const entryAttack = resolve(fixtureRoot, 'entry-attack');
    const controlRoot = resolve(fixtureRoot, 'regular-control');
    const outsideTests = resolve(fixtureRoot, 'outside-tests');
    const outsideEntry = resolve(fixtureRoot, 'outside-entry.functional.mjs');
    const outsideRootBytes = Buffer.from("import test from 'node:test';\ntest('outside root', () => {});\n");
    const outsideEntryBytes = Buffer.from("import test from 'node:test';\ntest('outside entry', () => {});\n");

    writeRepositoryShell(testsRootAttack);
    mkdirSync(outsideTests, { recursive: true });
    writeFileSync(resolve(outsideTests, 'outside.functional.mjs'), outsideRootBytes);
    writeFileSync(
      resolve(outsideTests, 'outside.spec.mjs'),
      "import test from 'node:test';\ntest('outside browser', () => {});\n"
    );
    symlinkSync(outsideTests, resolve(testsRootAttack, 'tests'));

    writeRepositoryShell(entryAttack);
    mkdirSync(resolve(entryAttack, 'tests'), { recursive: true });
    writeFileSync(
      resolve(entryAttack, 'tests/in-root.spec.mjs'),
      "import test from 'node:test';\ntest('in-root browser', () => {});\n"
    );
    writeFileSync(outsideEntry, outsideEntryBytes);
    symlinkSync(outsideEntry, resolve(entryAttack, 'tests/escaped.functional.mjs'));

    writeRepositoryShell(controlRoot);
    mkdirSync(resolve(controlRoot, 'tests'), { recursive: true });
    writeFileSync(resolve(controlRoot, 'tests/regular.functional.mjs'), outsideEntryBytes);
    writeFileSync(
      resolve(controlRoot, 'tests/regular.spec.mjs'),
      "import test from 'node:test';\ntest('regular browser', () => {});\n"
    );

    const outsideRootBefore = readFileSync(resolve(outsideTests, 'outside.functional.mjs'));
    const outsideEntryBefore = readFileSync(outsideEntry);
    const testsRootExecution = execute(testsRootAttack);
    const entryExecution = execute(entryAttack);
    const controlExecution = execute(controlRoot);
    const outsideRootAfter = readFileSync(resolve(outsideTests, 'outside.functional.mjs'));
    const outsideEntryAfter = readFileSync(outsideEntry);
    const testsRootOutput = `${testsRootExecution.stdout ?? ''}${testsRootExecution.stderr ?? ''}`;
    const entryOutput = `${entryExecution.stdout ?? ''}${entryExecution.stderr ?? ''}`;

    console.log(`[BUG022-F33] testsRootExit=${testsRootExecution.status} signal=${testsRootExecution.signal ?? 'none'}`);
    console.log(`[BUG022-F33] testsRootOutput=${testsRootOutput.trim().replaceAll('\n', ' | ')}`);
    console.log(`[BUG022-F33] entryExit=${entryExecution.status} signal=${entryExecution.signal ?? 'none'}`);
    console.log(`[BUG022-F33] entryOutput=${entryOutput.trim().replaceAll('\n', ' | ')}`);
    console.log(`[BUG022-F33] controlExit=${controlExecution.status} signal=${controlExecution.signal ?? 'none'}`);
    console.log(`[BUG022-F33] outsideRootStable=${outsideRootBefore.equals(outsideRootAfter)}`);
    console.log(`[BUG022-F33] outsideEntryStable=${outsideEntryBefore.equals(outsideEntryAfter)}`);

    assert.equal(testsRootExecution.signal, null);
    assert.equal(testsRootExecution.status, 1, 'symlinked tests root must refuse');
    assert.match(testsRootOutput, /SECURITY REFUSAL code=RCH-FS-003 path=tests reason=symlinked-tests-root/);
    assert.deepEqual(outsideRootAfter, outsideRootBefore);

    assert.equal(entryExecution.signal, null);
    assert.equal(entryExecution.status, 1, 'escaped symlink test entry must refuse');
    assert.match(
      entryOutput,
      /SECURITY REFUSAL code=RCH-FS-004 path=tests\/escaped\.functional\.mjs reason=test-entry-escapes-root/
    );
    assert.deepEqual(outsideEntryAfter, outsideEntryBefore);

    assert.equal(controlExecution.signal, null);
    assert.equal(controlExecution.status, 0, 'regular in-root tests control must remain discoverable');
    assert.match(controlExecution.stdout, /2 test file\(s\) in tests\//);
    assert.doesNotMatch(controlExecution.stdout + controlExecution.stderr, /SECURITY REFUSAL/);
  });
});

test('Regression: SCN-BUG022-002 ambiguous command forms fail closed without execution', () => {
  withDeclarationFixture({}, (fixtureRoot) => {
    const artifact = 'specs/932-security-commands/scopes.md';
    const sentinel = resolve(fixtureRoot, 'command-execution-canary');
    const invalidRows = [
      {
        line: 7,
        pattern: 'tests/unsupported-absolute-*.mjs',
        issue: 'unsupported-executable:/bin/node',
        command: '/bin/node --test tests/unsupported-absolute-*.mjs'
      },
      {
        line: 8,
        pattern: 'tests/arbitrary-wrapper-*.mjs',
        issue: 'unsupported-wrapper:custom-wrapper',
        command: 'Command: `custom-wrapper node --test tests/arbitrary-wrapper-*.mjs`'
      },
      {
        line: 9,
        pattern: 'tests/separated-control-*.mjs',
        issue: 'shell-control:semicolon',
        command: `node --test tests/separated-control-*.mjs ; /usr/bin/touch ${sentinel}`
      },
      {
        line: 10,
        pattern: 'tests/attached-control-*.mjs',
        issue: 'shell-control:semicolon',
        command: `node --test tests/attached-control-*.mjs;/usr/bin/touch ${sentinel}`
      },
      {
        line: 11,
        pattern: 'tests/command-substitution-*.mjs',
        issue: 'shell-substitution:command',
        command: `node --test tests/command-substitution-*.mjs $(/usr/bin/touch ${sentinel})`
      },
      {
        line: 12,
        pattern: 'tests/backtick-substitution-*.mjs',
        issue: 'shell-substitution:backtick',
        command: `node --test tests/backtick-substitution-*.mjs \`/usr/bin/touch ${sentinel}\``
      }
    ];
    const validPatterns = [
      'tests/direct-supported-*.mjs',
      'tests/absolute-supported-*.mjs',
      'tests/env-supported-*.mjs',
      'tests/timeout-supported-*.mjs',
      'tests/gtimeout-supported-*.mjs',
      'tests/alarm-supported-*.mjs'
    ];
    const source = [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      '',
      ...invalidRows.map((row) => row.command),
      'node --test tests/direct-supported-*.mjs',
      '/usr/bin/node --test tests/absolute-supported-*.mjs',
      'env BUG022_MODE=secure node --test tests/env-supported-*.mjs',
      'timeout 30 node --test tests/timeout-supported-*.mjs',
      '/opt/local/bin/gtimeout --signal=TERM 30 node --test tests/gtimeout-supported-*.mjs',
      "/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 30 node --test tests/alarm-supported-*.mjs",
      ''
    ].join('\n');
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), source);

    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === artifact)
      .map(({ artifact: siteArtifact, authority, line, parseIssues, pattern, reason, sectionRole }) => ({
        artifact: siteArtifact,
        authority,
        line,
        parseIssues,
        pattern,
        reason,
        sectionRole
      }));
    const declarations = result.globs
      .filter((entry) => validPatterns.includes(entry.pattern))
      .map((entry) => entry.pattern)
      .sort();

    console.log(`[BUG022-F34] classificationErrors=${errors.length}`);
    for (const error of errors) {
      console.log(
        `[BUG022-F34] artifact=${error.artifact} line=${error.line} pattern=${error.pattern} `
        + `reason=${error.reason} issues=${error.parseIssues?.join(',') ?? 'missing'}`
      );
    }
    console.log(`[BUG022-F34] validDeclarations=${declarations.join(',')}`);
    console.log(`[BUG022-F34] executionCanaryExists=${existsSync(sentinel)}`);

    assert.deepEqual(
      errors,
      invalidRows.map(({ issue, line, pattern }) => ({
        artifact,
        authority: 'error',
        line,
        parseIssues: [issue],
        pattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan'
      }))
    );
    assert.deepEqual(declarations, validPatterns.slice().sort());
    assert.equal(existsSync(sentinel), false, 'command candidate text was executed');
  });
});

test('Regression: SCN-BUG022-006 env chdir forms cannot change declaration authority', () => {
  const artifact = 'specs/933-security-env/scopes.md';
  const invalidRows = [
    { line: 7, pattern: 'tests/chdir-long-*.mjs', issue: 'working-directory-option:--chdir' },
    { line: 8, pattern: 'tests/chdir-long-attached-*.mjs', issue: 'working-directory-option:--chdir=outside' },
    { line: 9, pattern: 'tests/chdir-short-*.mjs', issue: 'working-directory-option:-C' },
    { line: 10, pattern: 'tests/chdir-short-attached-*.mjs', issue: 'working-directory-option:-Coutside' }
  ];
  const validPatterns = [
    'tests/env-assignment-control-*.mjs',
    'tests/env-unset-control-*.mjs',
    'tests/env-terminator-control-*.mjs'
  ];
  const source = [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '',
    'env --chdir outside node --test tests/chdir-long-*.mjs',
    '/usr/bin/env --chdir=outside node --test tests/chdir-long-attached-*.mjs',
    'env -C outside node --test tests/chdir-short-*.mjs',
    '/usr/bin/env -Coutside node --test tests/chdir-short-attached-*.mjs',
    'env BUG022_MODE=secure node --test tests/env-assignment-control-*.mjs',
    '/usr/bin/env -u BUG022_OLD node --test tests/env-unset-control-*.mjs',
    'env -- node --test tests/env-terminator-control-*.mjs',
    ''
  ].join('\n');

  withDeclarationFixture({ [artifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const errors = result.classificationErrors
      .filter((site) => site.artifact === artifact)
      .map(({ artifact: siteArtifact, authority, line, parseIssues, pattern, reason, sectionRole }) => ({
        artifact: siteArtifact,
        authority,
        line,
        parseIssues,
        pattern,
        reason,
        sectionRole
      }));
    const declarations = result.globs
      .filter((entry) => validPatterns.includes(entry.pattern))
      .map((entry) => entry.pattern)
      .sort();

    console.log(`[BUG022-F35] classificationErrors=${errors.length}`);
    for (const error of errors) {
      console.log(
        `[BUG022-F35] line=${error.line} pattern=${error.pattern} `
        + `reason=${error.reason} issues=${error.parseIssues?.join(',') ?? 'missing'}`
      );
    }
    console.log(`[BUG022-F35] validDeclarations=${declarations.join(',')}`);

    assert.deepEqual(
      errors,
      invalidRows.map(({ issue, line, pattern }) => ({
        artifact,
        authority: 'error',
        line,
        parseIssues: [issue],
        pattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan'
      }))
    );
    assert.deepEqual(declarations, validPatterns.slice().sort());
  });
});

test('Regression: SCN-BUG022-008 comment-separated dynamic node:test imports remain test-bearing', () => {
  const dynamicPath = 'tests/comment-separated-dynamic.custom.mjs';
  const falsePositivePaths = [
    'tests/comment-lookalike.support.mjs',
    'tests/block-comment-lookalike.support.mjs',
    'tests/string-lookalike.support.mjs',
    'tests/template-lookalike.support.mjs'
  ];
  const sentinelName = 'lexical-import-execution-canary';
  const carrierImports = [dynamicPath, ...falsePositivePaths]
    .map((path, index) => `import { value${index} } from './${path.slice('tests/'.length)}';`);
  const carrierUses = [dynamicPath, ...falsePositivePaths].map((_, index) => `void value${index};`);
  const files = {
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty lexical fixture baseline\n',
    'specs/934-security-lexical/scopes.md': [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      '',
      'node --test tests/*.functional.mjs',
      ''
    ].join('\n'),
    'tests/lexical-carrier.functional.mjs': [
      "import test from 'node:test';",
      ...carrierImports,
      "test('lexical carrier', () => {});",
      ...carrierUses,
      ''
    ].join('\n'),
    'tests/lexical-browser.spec.mjs': "import test from 'node:test';\ntest('browser', () => {});\n",
    [dynamicPath]: [
      "const { test } = await import /* before-open */ ( /* before-module */ 'node:test' /* before-close */ );",
      "test('comment-separated dynamic registration', () => {});",
      `export const value0 = '${sentinelName}';`,
      ''
    ].join('\n'),
    [falsePositivePaths[0]]: [
      "// import('node:test')",
      'export const value1 = 1;',
      ''
    ].join('\n'),
    [falsePositivePaths[1]]: [
      "/* import('node:test') */",
      'export const value2 = 2;',
      ''
    ].join('\n'),
    [falsePositivePaths[2]]: [
      "export const value3 = \"import('node:test')\";",
      ''
    ].join('\n'),
    [falsePositivePaths[3]]: [
      "export const value4 = `import('node:test')`;",
      ''
    ].join('\n')
  };

  withDeclarationFixture(files, (fixtureRoot) => {
    const sentinel = resolve(fixtureRoot, sentinelName);
    const result = testFileReachability.validateTestFileReachability(fixtureRoot);
    const exemptPaths = result.exempt.map((entry) => entry.path).sort();

    console.log(`[BUG022-F36] dynamicOrphan=${result.newOrphans.includes(dynamicPath)}`);
    console.log(`[BUG022-F36] dynamicExempt=${exemptPaths.includes(dynamicPath)}`);
    console.log(`[BUG022-F36] falsePositiveExempt=${falsePositivePaths.filter((path) => exemptPaths.includes(path)).length}`);
    console.log(`[BUG022-F36] executionCanaryExists=${existsSync(sentinel)}`);

    assert.equal(result.newOrphans.includes(dynamicPath), true, 'real dynamic import was not test-bearing');
    assert.equal(exemptPaths.includes(dynamicPath), false, 'real dynamic import received helper exemption');
    assert.deepEqual(
      falsePositivePaths.filter((path) => exemptPaths.includes(path)).sort(),
      falsePositivePaths.slice().sort(),
      'comment or literal lookalikes were treated as node:test registrations'
    );
    assert.equal(existsSync(sentinel), false, 'lexical detection evaluated fixture source');
  });
});

test('Regression: BUG-022 security authority matrix closes all five findings together', () => {
  function writeShell(root, command = 'node --test tests/*.functional.mjs') {
    mkdirSync(resolve(root, 'scripts'), { recursive: true });
    mkdirSync(resolve(root, 'specs/935-security-matrix'), { recursive: true });
    mkdirSync(resolve(root, 'tests'), { recursive: true });
    writeFileSync(resolve(root, 'playwright.config.mjs'), "export default { testMatch: '**/*.spec.mjs' };\n");
    writeFileSync(resolve(root, 'scripts/validate-test-file-reachability.baseline'), '# matrix baseline\n');
    writeFileSync(resolve(root, 'specs/935-security-matrix/scopes.md'), [
      '# Scopes',
      '',
      '## Scope 1',
      '',
      '### Test Plan',
      '',
      command,
      ''
    ].join('\n'));
    writeFileSync(
      resolve(root, 'tests/matrix.functional.mjs'),
      "import test from 'node:test';\ntest('matrix node', () => {});\n"
    );
    writeFileSync(
      resolve(root, 'tests/matrix.spec.mjs'),
      "import test from 'node:test';\ntest('matrix browser', () => {});\n"
    );
  }

  function execute(root, update = false) {
    const args = [REACHABILITY_VALIDATOR];
    if (update) args.push('--update-baseline');
    args.push('--root', root, '--all-sites');
    return spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', timeout: 30000 });
  }

  withDeclarationFixture({}, (fixtureRoot) => {
    const verdicts = [];
    const controls = [];

    const baselineAttack = resolve(fixtureRoot, 'baseline-attack');
    const baselineOutside = resolve(fixtureRoot, 'baseline-outside');
    writeShell(baselineAttack);
    rmSync(resolve(baselineAttack, 'scripts/validate-test-file-reachability.baseline'));
    writeFileSync(baselineOutside, '# matrix outside baseline sentinel\n');
    symlinkSync(baselineOutside, resolve(baselineAttack, 'scripts/validate-test-file-reachability.baseline'));
    const baselineBefore = readFileSync(baselineOutside);
    const baselineExecution = execute(baselineAttack, true);
    verdicts.push(
      baselineExecution.status === 1
      && /RCH-FS-001/.test(`${baselineExecution.stdout}${baselineExecution.stderr}`)
      && readFileSync(baselineOutside).equals(baselineBefore)
    );
    const baselineControl = resolve(fixtureRoot, 'baseline-control');
    writeShell(baselineControl);
    controls.push(execute(baselineControl, true).status === 0);

    const testsAttack = resolve(fixtureRoot, 'tests-attack');
    const testsOutside = resolve(fixtureRoot, 'matrix-outside.functional.mjs');
    writeShell(testsAttack);
    rmSync(resolve(testsAttack, 'tests/matrix.functional.mjs'));
    writeFileSync(testsOutside, "import test from 'node:test';\ntest('outside', () => {});\n");
    symlinkSync(testsOutside, resolve(testsAttack, 'tests/matrix.functional.mjs'));
    const testsExecution = execute(testsAttack);
    verdicts.push(
      testsExecution.status === 1
      && /RCH-FS-004 path=tests\/matrix\.functional\.mjs/.test(`${testsExecution.stdout}${testsExecution.stderr}`)
    );
    const testsControl = resolve(fixtureRoot, 'tests-control');
    writeShell(testsControl);
    controls.push(execute(testsControl).status === 0);

    const commandRoot = resolve(fixtureRoot, 'command-matrix');
    const commandSentinel = resolve(fixtureRoot, 'matrix-command-canary');
    writeShell(
      commandRoot,
      `node --test tests/ambiguous-matrix-*.functional.mjs ; /usr/bin/touch ${commandSentinel}`
    );
    const commandResult = collectDeclaredTestGlobs(commandRoot);
    verdicts.push(
      commandResult.classificationErrors.length === 1
      && commandResult.classificationErrors[0].parseIssues?.[0] === 'shell-control:semicolon'
      && !existsSync(commandSentinel)
    );
    const commandControlRoot = resolve(fixtureRoot, 'command-control');
    writeShell(commandControlRoot, 'node --test tests/direct-matrix-*.functional.mjs');
    const commandControl = collectDeclaredTestGlobs(commandControlRoot);
    controls.push(
      commandControl.classificationErrors.length === 0
      && declarationFor(commandControl, 'tests/direct-matrix-*.functional.mjs') !== undefined
    );

    const chdirRoot = resolve(fixtureRoot, 'chdir-matrix');
    writeShell(chdirRoot, 'env --chdir outside node --test tests/chdir-matrix-*.functional.mjs');
    const chdirResult = collectDeclaredTestGlobs(chdirRoot);
    verdicts.push(
      chdirResult.classificationErrors.length === 1
      && chdirResult.classificationErrors[0].parseIssues?.[0] === 'working-directory-option:--chdir'
    );
    const chdirControlRoot = resolve(fixtureRoot, 'chdir-control');
    writeShell(chdirControlRoot, 'env BUG022_MATRIX=control node --test tests/env-matrix-*.functional.mjs');
    const chdirControl = collectDeclaredTestGlobs(chdirControlRoot);
    controls.push(
      chdirControl.classificationErrors.length === 0
      && declarationFor(chdirControl, 'tests/env-matrix-*.functional.mjs') !== undefined
    );

    const lexicalRoot = resolve(fixtureRoot, 'lexical-matrix');
    writeShell(lexicalRoot);
    writeFileSync(resolve(lexicalRoot, 'tests/matrix.functional.mjs'), [
      "import test from 'node:test';",
      "import { realValue } from './real-dynamic.custom.mjs';",
      "import { helperValue } from './string-helper.support.mjs';",
      "test('matrix carrier', () => {});",
      'void realValue;',
      'void helperValue;',
      ''
    ].join('\n'));
    writeFileSync(resolve(lexicalRoot, 'tests/real-dynamic.custom.mjs'), [
      "const { test } = await import /* matrix */ ( /* module */ 'node:test' );",
      "test('matrix dynamic', () => {});",
      'export const realValue = 1;',
      ''
    ].join('\n'));
    writeFileSync(
      resolve(lexicalRoot, 'tests/string-helper.support.mjs'),
      "export const helperValue = \"import('node:test')\";\n"
    );
    const lexicalResult = testFileReachability.validateTestFileReachability(lexicalRoot);
    verdicts.push(
      lexicalResult.newOrphans.includes('tests/real-dynamic.custom.mjs')
      && !lexicalResult.exempt.some((entry) => entry.path === 'tests/real-dynamic.custom.mjs')
    );
    controls.push(
      lexicalResult.exempt.some((entry) => entry.path === 'tests/string-helper.support.mjs')
      && !lexicalResult.newOrphans.includes('tests/string-helper.support.mjs')
    );

    console.log(`[BUG022-C39] verdicts=${verdicts.map(String).join(',')}`);
    console.log(`[BUG022-C39] controls=${controls.map(String).join(',')}`);
    console.log(`[BUG022-C39] commandCanaryExists=${existsSync(commandSentinel)}`);
    console.log(`[BUG022-C39] closedFindings=${verdicts.filter(Boolean).length}`);
    console.log(`[BUG022-C39] independentControls=${controls.filter(Boolean).length}`);

    assert.deepEqual(verdicts, [true, true, true, true, true]);
    assert.deepEqual(controls, [true, true, true, true, true]);
    assert.equal(existsSync(commandSentinel), false);
  });
});

function finalShapeScopeSource(commands) {
  return [
    '# Scopes',
    '',
    '## Scope 1',
    '',
    '### Test Plan',
    '',
    ...commands,
    ''
  ].join('\n');
}

function finalShapeSite(site) {
  if (!site) return undefined;
  const view = {
    artifact: site.artifact,
    artifactRole: site.artifactRole,
    authority: site.authority,
    line: site.line,
    pattern: site.pattern,
    reason: site.reason,
    sectionRole: site.sectionRole
  };
  if (site.parseIssues) view.parseIssues = site.parseIssues;
  return view;
}

function finalShapePatterns(result) {
  return [
    ...result.globs.map((entry) => entry.pattern),
    ...result.historicalSites.map((site) => site.pattern),
    ...result.classificationErrors.map((site) => site.pattern)
  ];
}

function finalShapeReachabilityFiles(scopeArtifact, commands, files) {
  return {
    'playwright.config.mjs': "export default { testMatch: '**/*.spec.mjs' };\n",
    'scripts/validate-test-file-reachability.baseline': '# empty final-shape fixture baseline\n',
    [scopeArtifact]: finalShapeScopeSource(commands),
    'tests/final-shape-browser.spec.mjs': "import test from 'node:test';\ntest('browser control', () => {});\n",
    ...files
  };
}

test('Regression: SCN-BUG022-002 unknown non-Markdown candidates fail closed with provenance', () => {
  const markdownArtifact = 'misc/f42-command.md';
  const textArtifact = 'misc/f42-command.txt';
  const binaryArtifact = 'misc/f42-command.bin';
  const pattern = 'tests/f42-unknown-text-*.mjs';
  const binaryPattern = 'tests/f42-binary-*.mjs';
  const commandSource = ['candidate bytes', '', `node --test ${pattern}`, ''].join('\n');

  withDeclarationFixture({
    [markdownArtifact]: commandSource,
    [textArtifact]: commandSource,
    [binaryArtifact]: Buffer.from(`node --test ${binaryPattern}\0\n`, 'utf8')
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const markdownError = result.classificationErrors.find((site) => site.artifact === markdownArtifact);
    const textError = result.classificationErrors.find((site) => site.artifact === textArtifact);
    const expectedMarkdown = {
      artifact: markdownArtifact,
      artifactRole: 'unknown',
      authority: 'error',
      line: 3,
      pattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    };
    const expectedText = { ...expectedMarkdown, artifact: textArtifact };

    console.log(`[BUG022-F42] markdown=${JSON.stringify(finalShapeSite(markdownError))}`);
    console.log(`[BUG022-F42] nonMarkdown=${JSON.stringify(finalShapeSite(textError))}`);
    console.log(`[BUG022-F42] binaryVisible=${finalShapePatterns(result).includes(binaryPattern)}`);

    assert.deepEqual(finalShapeSite(markdownError), expectedMarkdown);
    assert.equal(finalShapePatterns(result).includes(binaryPattern), false);
    assert.deepEqual(
      finalShapeSite(textError),
      expectedText,
      'GAP-R4-BUG022-015 unknown non-Markdown candidate was dropped before provenance classification'
    );
  });
});

test('Regression: SCN-BUG022-002 direct arbitrary wrappers fail closed with provenance', () => {
  const artifact = 'specs/942-direct-wrapper/scopes.md';
  const wrappedPattern = 'tests/f43-wrapped-*.mjs';
  const controlPattern = 'tests/f43-direct-control-*.mjs';

  withDeclarationFixture({}, (fixtureRoot) => {
    const canary = resolve(fixtureRoot, 'f43-execution-canary');
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), finalShapeScopeSource([
      `custom-wrapper node --test ${wrappedPattern} && /usr/bin/touch ${canary}`,
      `node --test ${controlPattern}`
    ]));
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const wrappedError = result.classificationErrors.find((site) => site.pattern === wrappedPattern);
    const control = declarationFor(result, controlPattern);

    console.log(`[BUG022-F43] wrapped=${JSON.stringify(finalShapeSite(wrappedError))}`);
    console.log(`[BUG022-F43] controlSites=${control?.sites.length ?? 0}`);
    console.log(`[BUG022-F43] canaryExists=${existsSync(canary)}`);

    assert.deepEqual(control?.sites.map(finalShapeSite), [{
      artifact,
      artifactRole: 'active-plan',
      authority: 'active',
      line: 8,
      pattern: controlPattern,
      reason: 'current-test-plan',
      sectionRole: 'test-plan'
    }]);
    assert.equal(existsSync(canary), false, 'direct wrapper candidate text executed its canary');
    assert.deepEqual(
      finalShapeSite(wrappedError),
      {
        artifact,
        artifactRole: 'active-plan',
        authority: 'error',
        line: 7,
        pattern: wrappedPattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan',
        parseIssues: ['unsupported-wrapper:custom-wrapper']
      },
      'GAP-R4-BUG022-016 direct arbitrary wrapper disappeared before fail-closed classification'
    );
  });
});

test('Regression: SCN-BUG022-005 Markdown-list arbitrary wrappers fail closed with provenance', () => {
  const artifact = 'specs/943-list-wrapper/scopes.md';
  const wrappedPattern = 'tests/f44-wrapped-list-*.mjs';
  const controlPattern = 'tests/f44-list-control-*.mjs';

  withDeclarationFixture({
    [artifact]: finalShapeScopeSource([
      `- custom-wrapper node --test ${wrappedPattern}`,
      `- node --test ${controlPattern}`
    ])
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const wrappedError = result.classificationErrors.find((site) => site.pattern === wrappedPattern);
    const control = declarationFor(result, controlPattern);

    console.log(`[BUG022-F44] wrapped=${JSON.stringify(finalShapeSite(wrappedError))}`);
    console.log(`[BUG022-F44] control=${JSON.stringify(control?.sites.map(finalShapeSite) ?? [])}`);

    assert.equal(control?.sites.length, 1);
    assert.equal(control?.sites[0].artifact, artifact);
    assert.equal(control?.sites[0].line, 8);
    assert.deepEqual(
      finalShapeSite(wrappedError),
      {
        artifact,
        artifactRole: 'active-plan',
        authority: 'error',
        line: 7,
        pattern: wrappedPattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan',
        parseIssues: ['unsupported-wrapper:custom-wrapper']
      },
      'GAP-R4-BUG022-017 Markdown-list arbitrary wrapper disappeared before classification'
    );
  });
});

test('Regression: SCN-BUG022-005 task-list commands reach fail-closed classification', () => {
  const artifact = 'misc/f45-task-list.md';
  const uncheckedPattern = 'tests/f45-unchecked-*.mjs';
  const checkedPattern = 'tests/f45-checked-*.mjs';
  const plainPattern = 'tests/f45-plain-*.mjs';
  const source = [
    '# Unknown task-list commands',
    '',
    `- [ ] node --test ${uncheckedPattern}`,
    `- [x] node --test ${checkedPattern}`,
    `- node --test ${plainPattern}`,
    ''
  ].join('\n');

  withDeclarationFixture({ [artifact]: source }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const views = result.classificationErrors
      .filter((site) => site.artifact === artifact)
      .map(finalShapeSite);
    const expected = [
      { line: 3, pattern: uncheckedPattern },
      { line: 4, pattern: checkedPattern },
      { line: 5, pattern: plainPattern }
    ].map(({ line, pattern: candidatePattern }) => ({
      artifact,
      artifactRole: 'unknown',
      authority: 'error',
      line,
      pattern: candidatePattern,
      reason: 'unknown-artifact-role',
      sectionRole: 'none'
    }));

    console.log(`[BUG022-F45] errors=${JSON.stringify(views)}`);
    console.log(`[BUG022-F45] observed=${views.length} expected=${expected.length}`);

    assert.deepEqual(
      views,
      expected,
      'GAP-R4-BUG022-025 task-list markers hid checked or unchecked command candidates'
    );
  });
});

test('Regression: SCN-BUG022-005 table backtick substitutions stay visible and inert', () => {
  const artifact = 'specs/946-table-backtick/scopes.md';
  const malformedPattern = 'tests/f46-table-backtick-*.mjs';
  const controlPattern = 'tests/f46-whole-span-control-*.mjs';

  withDeclarationFixture({}, (fixtureRoot) => {
    const canary = resolve(fixtureRoot, 'f46-execution-canary');
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), finalShapeScopeSource([
      '| Kind | Command |',
      '| --- | --- |',
      `| malformed | node --test ${malformedPattern} \`/usr/bin/touch ${canary}\` |`,
      `| control | \`node --test ${controlPattern}\` |`
    ]));
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const malformed = result.classificationErrors.find((site) => site.pattern === malformedPattern);
    const control = declarationFor(result, controlPattern);

    console.log(`[BUG022-F46] malformed=${JSON.stringify(finalShapeSite(malformed))}`);
    console.log(`[BUG022-F46] controlSites=${control?.sites.length ?? 0}`);
    console.log(`[BUG022-F46] canaryExists=${existsSync(canary)}`);

    assert.equal(control?.sites.length, 1);
    assert.equal(control?.sites[0].line, 10);
    assert.equal(existsSync(canary), false, 'table substitution text executed its canary');
    assert.deepEqual(
      finalShapeSite(malformed),
      {
        artifact,
        artifactRole: 'active-plan',
        authority: 'error',
        line: 9,
        pattern: malformedPattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan',
        parseIssues: ['shell-substitution:backtick']
      },
      'GAP-R4-BUG022-018 table code-span projection hid the full backtick-substitution candidate'
    );
  });
});

test('Regression: SCN-BUG022-006 quoted pipes in table commands preserve positional globs', () => {
  const artifact = 'specs/947-table-quoted-pipe/scopes.md';
  const quotedPattern = 'tests/f47-quoted-pipe-*.mjs';
  const leftPattern = 'tests/f47-left-control-*.mjs';
  const rightPattern = 'tests/f47-right-control-*.mjs';
  const quotedCommand = `node --test --test-name-pattern '^alpha|beta$' ${quotedPattern}`;
  const parsed = testFileReachability.parseNodeTestCommandCandidate(quotedCommand);

  withDeclarationFixture({
    [artifact]: finalShapeScopeSource([
      '| First | Second |',
      '| --- | --- |',
      `| quoted | ${quotedCommand} |`,
      `| node --test ${leftPattern} | node --test ${rightPattern} |`
    ])
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const quoted = declarationFor(result, quotedPattern);
    const left = declarationFor(result, leftPattern);
    const right = declarationFor(result, rightPattern);

    console.log(`[BUG022-F47] parsed=${JSON.stringify(parsed)}`);
    console.log(`[BUG022-F47] quoted=${JSON.stringify(quoted?.sites.map(finalShapeSite) ?? [])}`);
    console.log(`[BUG022-F47] structuralControls=${left?.sites.length ?? 0},${right?.sites.length ?? 0}`);

    assert.deepEqual(parsed?.patterns, [quotedPattern]);
    assert.equal(parsed?.parseError, null);
    assert.equal(left?.sites[0].line, 10);
    assert.equal(right?.sites[0].line, 10);
    assert.deepEqual(
      quoted?.sites.map(finalShapeSite),
      [{
        artifact,
        artifactRole: 'active-plan',
        authority: 'active',
        line: 9,
        pattern: quotedPattern,
        reason: 'current-test-plan',
        sectionRole: 'test-plan'
      }],
      'GAP-R4-BUG022-022 quoted table pipe consumed the later positional glob'
    );
  });
});

test('Regression: SCN-BUG022-005 Command labels preserve backtick-substitution candidates', () => {
  const artifact = 'specs/948-label-backtick/scopes.md';
  const malformedPattern = 'tests/f48-label-backtick-*.mjs';
  const controlPattern = 'tests/f48-label-control-*.mjs';

  withDeclarationFixture({}, (fixtureRoot) => {
    const canary = resolve(fixtureRoot, 'f48-execution-canary');
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), finalShapeScopeSource([
      `Command: node --test ${malformedPattern} \`/usr/bin/touch ${canary}\``,
      `Command: \`node --test ${controlPattern}\``
    ]));
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const malformed = result.classificationErrors.find((site) => site.pattern === malformedPattern);
    const control = declarationFor(result, controlPattern);

    console.log(`[BUG022-F48] malformed=${JSON.stringify(finalShapeSite(malformed))}`);
    console.log(`[BUG022-F48] controlSites=${control?.sites.length ?? 0}`);
    console.log(`[BUG022-F48] canaryExists=${existsSync(canary)}`);

    assert.equal(control?.sites[0].line, 8);
    assert.equal(existsSync(canary), false, 'Command-label substitution text executed its canary');
    assert.deepEqual(
      finalShapeSite(malformed),
      {
        artifact,
        artifactRole: 'active-plan',
        authority: 'error',
        line: 7,
        pattern: malformedPattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan',
        parseIssues: ['shell-substitution:backtick']
      },
      'GAP-R4-BUG022-023 Command-label code-span projection hid the complete malformed candidate'
    );
  });
});

test('Regression: SCN-BUG022-002 Perl alarm grammar rejects trailing statements', () => {
  const artifact = 'specs/949-perl-alarm/scopes.md';
  const malformedPattern = 'tests/f49-trailing-perl-*.mjs';
  const barePattern = 'tests/f49-bare-perl-control-*.mjs';
  const failurePattern = 'tests/f49-failure-perl-control-*.mjs';

  withDeclarationFixture({}, (fixtureRoot) => {
    const canary = resolve(fixtureRoot, 'f49-execution-canary');
    const commands = [
      `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV or die "exec failed: $!\\n"; system "/usr/bin/touch ${canary}"' 30 node --test ${malformedPattern}`,
      `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 30 node --test ${barePattern}`,
      `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV or die "exec failed: $!\\n"' 30 node --test ${failurePattern}`
    ];
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), finalShapeScopeSource(commands));
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const malformed = result.classificationErrors.find((site) => site.pattern === malformedPattern);
    const bare = declarationFor(result, barePattern);
    const failure = declarationFor(result, failurePattern);

    console.log(`[BUG022-F49] malformed=${JSON.stringify(finalShapeSite(malformed))}`);
    console.log(`[BUG022-F49] controls=${bare?.sites.length ?? 0},${failure?.sites.length ?? 0}`);
    console.log(`[BUG022-F49] malformedActive=${declarationFor(result, malformedPattern) !== undefined}`);
    console.log(`[BUG022-F49] canaryExists=${existsSync(canary)}`);

    assert.equal(bare?.sites[0].line, 8);
    assert.equal(failure?.sites[0].line, 9);
    assert.equal(existsSync(canary), false, 'Perl wrapper candidate text executed its trailing statement');
    assert.deepEqual(
      finalShapeSite(malformed),
      {
        artifact,
        artifactRole: 'active-plan',
        authority: 'error',
        line: 7,
        pattern: malformedPattern,
        reason: 'malformed-node-test-command',
        sectionRole: 'test-plan',
        parseIssues: ['unsupported-perl-wrapper']
      },
      'GAP-R4-BUG022-019 Perl alarm grammar admitted a trailing statement'
    );
  });
});

test('Regression: SCN-BUG022-004 escaped declaration symlinks refuse instead of skipping', () => {
  const regularArtifact = 'specs/950-regular-plan/scopes.md';
  const escapedDirectory = 'specs/951-escaped-plan';
  const regularPattern = 'tests/f50-regular-control-*.mjs';
  const escapedPattern = 'tests/f50-escaped-*.mjs';
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-f50-'));
  const outsideRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-f50-outside-'));
  let refusal;

  try {
    const regularPath = resolve(fixtureRoot, regularArtifact);
    mkdirSync(dirname(regularPath), { recursive: true });
    writeFileSync(regularPath, finalShapeScopeSource([`node --test ${regularPattern}`]));
    const regularResult = collectDeclaredTestGlobs(fixtureRoot);
    const regular = declarationFor(regularResult, regularPattern);
    assert.deepEqual(regular?.sites.map(finalShapeSite), [{
      artifact: regularArtifact,
      artifactRole: 'active-plan',
      authority: 'active',
      line: 7,
      pattern: regularPattern,
      reason: 'current-test-plan',
      sectionRole: 'test-plan'
    }]);

    writeFileSync(resolve(outsideRoot, 'scopes.md'), finalShapeScopeSource([`node --test ${escapedPattern}`]));
    mkdirSync(resolve(fixtureRoot, 'specs'), { recursive: true });
    symlinkSync(outsideRoot, resolve(fixtureRoot, escapedDirectory));
    try {
      collectDeclaredTestGlobs(fixtureRoot);
    } catch (error) {
      refusal = error;
    }

    console.log(`[BUG022-F50] regular=${JSON.stringify(regular?.sites.map(finalShapeSite) ?? [])}`);
    console.log(`[BUG022-F50] refusal=${refusal?.message ?? 'missing'}`);
    console.log(`[BUG022-F50] logicalPath=${refusal?.path ?? 'missing'}`);

    assert.ok(
      refusal instanceof testFileReachability.ReachabilitySecurityError,
      'GAP-R4-BUG022-026 escaped declaration symlink was silently skipped'
    );
    assert.equal(refusal.code, 'RCH-FS-005');
    assert.equal(refusal.path, escapedDirectory);
    assert.equal(refusal.reason, 'read-candidate-escapes-root');
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }

  assert.equal(existsSync(fixtureRoot), false);
  assert.equal(existsSync(outsideRoot), false);
});

test('Regression: SCN-BUG022-008 named static node:test imports remain test-bearing', () => {
  const namedPath = 'tests/f51-named-registration.named.mjs';
  const helperPath = 'tests/f51-true-helper.support.mjs';
  const carrierPath = 'tests/f51-carrier.functional.mjs';
  const namedSource = [
    "import { test } from 'node:test';",
    "test('named static registration', () => {});",
    'export const namedReady = true;',
    ''
  ].join('\n');
  const carrierSource = [
    "import test from 'node:test';",
    "import { namedReady } from './f51-named-registration.named.mjs';",
    "import { helperReady } from './f51-true-helper.support.mjs';",
    "test('named carrier', () => {});",
    'void namedReady;',
    'void helperReady;',
    ''
  ].join('\n');
  let orphanResult;
  let execution;

  withDeclarationFixture(finalShapeReachabilityFiles(
    'specs/951-named-orphan/scopes.md',
    ['node --test tests/*.functional.mjs'],
    {
      [carrierPath]: carrierSource,
      [namedPath]: namedSource,
      [helperPath]: 'export const helperReady = true;\n'
    }
  ), (fixtureRoot) => {
    execution = spawnSync(process.execPath, ['--test', resolve(fixtureRoot, namedPath)], {
      cwd: fixtureRoot,
      encoding: 'utf8',
      timeout: 30000
    });
    orphanResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  let reachableResult;
  withDeclarationFixture(finalShapeReachabilityFiles(
    'specs/952-named-reachable/scopes.md',
    ['node --test tests/*.functional.mjs', 'node --test tests/*.named.mjs'],
    {
      [carrierPath]: carrierSource,
      [namedPath]: namedSource,
      [helperPath]: 'export const helperReady = true;\n'
    }
  ), (fixtureRoot) => {
    reachableResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  const orphanExempt = orphanResult.exempt.find((entry) => entry.path === namedPath);
  const trueHelper = orphanResult.exempt.find((entry) => entry.path === helperPath);
  const reachable = reachableResult.reachable.find((entry) => entry.path === namedPath);
  const declaration = declarationFor(reachableResult, 'tests/*.named.mjs');

  console.log(`[BUG022-F51] nodeExit=${execution.status} signal=${execution.signal ?? 'none'}`);
  console.log(`[BUG022-F51] orphan=${orphanResult.newOrphans.includes(namedPath)}`);
  console.log(`[BUG022-F51] namedExempt=${orphanExempt !== undefined}`);
  console.log(`[BUG022-F51] reachable=${JSON.stringify(reachable)}`);
  console.log(`[BUG022-F51] helper=${JSON.stringify(trueHelper)}`);

  assert.equal(execution.signal, null);
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(trueHelper, {
    path: helperPath,
    importerCount: 1,
    importers: [carrierPath]
  });
  assert.equal(
    orphanResult.newOrphans.includes(namedPath),
    true,
    'GAP-R4-BUG022-020 named static node:test import received the helper exemption'
  );
  assert.equal(orphanExempt, undefined);
  assert.deepEqual(reachable, { path: namedPath, matchedBy: ['tests/*.named.mjs'] });
  assert.deepEqual(declaration?.sites.map(finalShapeSite), [{
    artifact: 'specs/952-named-reachable/scopes.md',
    artifactRole: 'active-plan',
    authority: 'active',
    line: 8,
    pattern: 'tests/*.named.mjs',
    reason: 'current-test-plan',
    sectionRole: 'test-plan'
  }]);
});

test('Regression: SCN-BUG022-008 template-interpolated node:test imports remain test-bearing', () => {
  const interpolatedPath = 'tests/f52-interpolated.templated.mjs';
  const staticPath = 'tests/f52-static-template.support.mjs';
  const carrierPath = 'tests/f52-carrier.functional.mjs';
  const interpolatedSource = [
    "const rendered = `${(await import('node:test')).test('template interpolation registration', () => {})}`;",
    'export const interpolatedReady = rendered;',
    ''
  ].join('\n');
  const carrierSource = [
    "import test from 'node:test';",
    "import { interpolatedReady } from './f52-interpolated.templated.mjs';",
    "import { staticReady } from './f52-static-template.support.mjs';",
    "test('template carrier', () => {});",
    'void interpolatedReady;',
    'void staticReady;',
    ''
  ].join('\n');
  const fixtureFiles = {
    [carrierPath]: carrierSource,
    [interpolatedPath]: interpolatedSource,
    [staticPath]: "export const staticReady = `import('node:test')`;\n"
  };
  let orphanResult;
  let execution;

  withDeclarationFixture(finalShapeReachabilityFiles(
    'specs/953-template-orphan/scopes.md',
    ['node --test tests/*.functional.mjs'],
    fixtureFiles
  ), (fixtureRoot) => {
    execution = spawnSync(process.execPath, ['--test', resolve(fixtureRoot, interpolatedPath)], {
      cwd: fixtureRoot,
      encoding: 'utf8',
      timeout: 30000
    });
    orphanResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  let reachableResult;
  withDeclarationFixture(finalShapeReachabilityFiles(
    'specs/954-template-reachable/scopes.md',
    ['node --test tests/*.functional.mjs', 'node --test tests/*.templated.mjs'],
    fixtureFiles
  ), (fixtureRoot) => {
    reachableResult = testFileReachability.validateTestFileReachability(fixtureRoot);
  });

  const interpolatedExempt = orphanResult.exempt.find((entry) => entry.path === interpolatedPath);
  const staticExempt = orphanResult.exempt.find((entry) => entry.path === staticPath);
  const reachable = reachableResult.reachable.find((entry) => entry.path === interpolatedPath);

  console.log(`[BUG022-F52] nodeExit=${execution.status} signal=${execution.signal ?? 'none'}`);
  console.log(`[BUG022-F52] orphan=${orphanResult.newOrphans.includes(interpolatedPath)}`);
  console.log(`[BUG022-F52] interpolatedExempt=${interpolatedExempt !== undefined}`);
  console.log(`[BUG022-F52] staticExempt=${JSON.stringify(staticExempt)}`);
  console.log(`[BUG022-F52] reachable=${JSON.stringify(reachable)}`);

  assert.equal(execution.signal, null);
  assert.equal(execution.status, 0, execution.stderr);
  assert.deepEqual(staticExempt, {
    path: staticPath,
    importerCount: 1,
    importers: [carrierPath]
  });
  assert.equal(
    orphanResult.newOrphans.includes(interpolatedPath),
    true,
    'GAP-R4-BUG022-021 executable template interpolation was discarded as literal text'
  );
  assert.equal(interpolatedExempt, undefined);
  assert.deepEqual(reachable, { path: interpolatedPath, matchedBy: ['tests/*.templated.mjs'] });
});

test('Regression: SCN-BUG022-008 regex literals mentioning node:test remain helper-exempt', () => {
  const regexPath = 'tests/f53-regex-helper.support.mjs';
  const dynamicPath = 'tests/f53-real-dynamic.dynamic.mjs';
  const carrierPath = 'tests/f53-carrier.functional.mjs';
  const files = finalShapeReachabilityFiles(
    'specs/955-regex-literal/scopes.md',
    ['node --test tests/*.functional.mjs'],
    {
      [carrierPath]: [
        "import test from 'node:test';",
        "import { regexValue } from './f53-regex-helper.support.mjs';",
        "import { dynamicReady } from './f53-real-dynamic.dynamic.mjs';",
        "test('regex carrier', () => {});",
        'void regexValue;',
        'void dynamicReady;',
        ''
      ].join('\n'),
      [regexPath]: [
        "export const regexValue = /import('node:test')/;",
        ''
      ].join('\n'),
      [dynamicPath]: [
        "const { test } = await import('node:test');",
        "test('real dynamic control', () => {});",
        'export const dynamicReady = true;',
        ''
      ].join('\n')
    }
  );

  withDeclarationFixture(files, (fixtureRoot) => {
    const result = testFileReachability.validateTestFileReachability(fixtureRoot);
    const regexExempt = result.exempt.find((entry) => entry.path === regexPath);
    const dynamicExempt = result.exempt.find((entry) => entry.path === dynamicPath);

    console.log(`[BUG022-F53] regexOrphan=${result.newOrphans.includes(regexPath)}`);
    console.log(`[BUG022-F53] regexExempt=${JSON.stringify(regexExempt)}`);
    console.log(`[BUG022-F53] dynamicOrphan=${result.newOrphans.includes(dynamicPath)}`);
    console.log(`[BUG022-F53] dynamicExempt=${dynamicExempt !== undefined}`);

    assert.equal(result.newOrphans.includes(dynamicPath), true);
    assert.equal(dynamicExempt, undefined);
    assert.deepEqual(
      regexExempt,
      {
        path: regexPath,
        importerCount: 1,
        importers: [carrierPath]
      },
      'GAP-R4-BUG022-024 regex literal text was treated as executable node:test registration'
    );
    assert.equal(result.newOrphans.includes(regexPath), false);
  });
});

// BUG022_R4_FINAL_SHAPE_MATRIX_BEGIN
test('Regression: BUG-022 final-shape matrix closes all twelve findings together', () => {
  const verdicts = [];
  const controls = [];
  const canaries = [];

  withDeclarationFixture({
    'misc/final-shape-command.txt': 'node --test tests/matrix-nonmarkdown-*.mjs\n',
    'misc/final-shape-binary.bin': Buffer.from('node --test tests/matrix-binary-*.mjs\0\n')
  }, (fixtureRoot) => {
    const result = collectDeclaredTestGlobs(fixtureRoot);
    verdicts.push(result.classificationErrors.some((site) => (
      site.artifact === 'misc/final-shape-command.txt'
      && site.pattern === 'tests/matrix-nonmarkdown-*.mjs'
      && site.reason === 'unknown-artifact-role'
    )));
    controls.push(!finalShapePatterns(result).includes('tests/matrix-binary-*.mjs'));
  });

  withDeclarationFixture({}, (fixtureRoot) => {
    const artifact = 'specs/956-final-shape-command/scopes.md';
    const tableCanary = resolve(fixtureRoot, 'matrix-table-canary');
    const labelCanary = resolve(fixtureRoot, 'matrix-label-canary');
    const perlCanary = resolve(fixtureRoot, 'matrix-perl-canary');
    canaries.push(tableCanary, labelCanary, perlCanary);
    mkdirSync(dirname(resolve(fixtureRoot, artifact)), { recursive: true });
    writeFileSync(resolve(fixtureRoot, artifact), finalShapeScopeSource([
      'custom-wrapper node --test tests/matrix-direct-wrapper-*.mjs',
      `- custom-wrapper node --test tests/matrix-list-wrapper-*.mjs`,
      '- node --test tests/matrix-list-control-*.mjs',
      `- [ ] node --test tests/matrix-task-unchecked-*.mjs`,
      `- [x] node --test tests/matrix-task-checked-*.mjs`,
      `- node --test tests/matrix-task-plain-*.mjs`,
      `| malformed | node --test tests/matrix-table-backtick-*.mjs \`/usr/bin/touch ${tableCanary}\` |`,
      `| quoted | node --test --test-name-pattern '^alpha|beta$' tests/matrix-table-pipe-*.mjs |`,
      '| node --test tests/matrix-table-left-*.mjs | node --test tests/matrix-table-right-*.mjs |',
      `Command: node --test tests/matrix-label-backtick-*.mjs \`/usr/bin/touch ${labelCanary}\``,
      `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV or die "exec failed: $!\\n"; system "/usr/bin/touch ${perlCanary}"' 30 node --test tests/matrix-perl-tail-*.mjs`,
      `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV or die "exec failed: $!\\n"' 30 node --test tests/matrix-perl-control-*.mjs`,
      'node --test tests/matrix-direct-control-*.mjs'
    ]));
    const result = collectDeclaredTestGlobs(fixtureRoot);
    const issues = new Map(result.classificationErrors.map((site) => [site.pattern, site.parseIssues?.[0]]));
    verdicts.push(issues.get('tests/matrix-direct-wrapper-*.mjs') === 'unsupported-wrapper:custom-wrapper');
    verdicts.push(issues.get('tests/matrix-list-wrapper-*.mjs') === 'unsupported-wrapper:custom-wrapper');
    verdicts.push([
      'tests/matrix-task-unchecked-*.mjs',
      'tests/matrix-task-checked-*.mjs'
    ].every((pattern) => declarationFor(result, pattern) !== undefined));
    verdicts.push(issues.get('tests/matrix-table-backtick-*.mjs') === 'shell-substitution:backtick');
    verdicts.push(declarationFor(result, 'tests/matrix-table-pipe-*.mjs') !== undefined);
    verdicts.push(issues.get('tests/matrix-label-backtick-*.mjs') === 'shell-substitution:backtick');
    verdicts.push(issues.get('tests/matrix-perl-tail-*.mjs') === 'unsupported-perl-wrapper');
    controls.push(declarationFor(result, 'tests/matrix-direct-control-*.mjs') !== undefined);
    controls.push(declarationFor(result, 'tests/matrix-list-control-*.mjs') !== undefined);
    controls.push(declarationFor(result, 'tests/matrix-task-plain-*.mjs') !== undefined);
    controls.push(!existsSync(tableCanary));
    controls.push(
      declarationFor(result, 'tests/matrix-table-left-*.mjs') !== undefined
      && declarationFor(result, 'tests/matrix-table-right-*.mjs') !== undefined
    );
    controls.push(!existsSync(labelCanary));
    controls.push(
      declarationFor(result, 'tests/matrix-perl-control-*.mjs') !== undefined
      && !existsSync(perlCanary)
    );
  });

  const escapedRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c56-symlink-'));
  const escapedOutside = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c56-symlink-outside-'));
  try {
    mkdirSync(resolve(escapedRoot, 'specs'), { recursive: true });
    writeFileSync(
      resolve(escapedOutside, 'scopes.md'),
      finalShapeScopeSource(['node --test tests/matrix-escaped-*.mjs'])
    );
    symlinkSync(escapedOutside, resolve(escapedRoot, 'specs/957-escaped'));
    assert.throws(
      () => collectDeclaredTestGlobs(escapedRoot),
      (error) => error instanceof testFileReachability.ReachabilitySecurityError
        && error.path === 'specs/957-escaped'
    );
    verdicts.push(true);
    controls.push(true);
  } finally {
    rmSync(escapedRoot, { recursive: true, force: true });
    rmSync(escapedOutside, { recursive: true, force: true });
  }

  const namedSource = "import { test } from 'node:test';\ntest('named matrix registration', () => {});\nexport const named = true;\n";
  const interpolatedSource = "const value = `${(await import('node:test')).test('template matrix registration', () => {})}`;\nexport { value };\n";
  const regexSource = "export const expression = /import('node:test')/;\n";
  const carrierSource = [
    "import test from 'node:test';",
    "import { named } from './matrix-named.named.mjs';",
    "import { value } from './matrix-template.templated.mjs';",
    "import { expression } from './matrix-regex.support.mjs';",
    "test('matrix carrier', () => {});",
    'void named;',
    'void value;',
    'void expression;',
    ''
  ].join('\n');
  withDeclarationFixture(finalShapeReachabilityFiles(
    'specs/958-final-shape-lexical/scopes.md',
    ['node --test tests/*.functional.mjs'],
    {
      'tests/matrix-carrier.functional.mjs': carrierSource,
      'tests/matrix-named.named.mjs': namedSource,
      'tests/matrix-template.templated.mjs': interpolatedSource,
      'tests/matrix-regex.support.mjs': regexSource
    }
  ), (fixtureRoot) => {
    const result = testFileReachability.validateTestFileReachability(fixtureRoot);
    verdicts.push(result.newOrphans.includes('tests/matrix-named.named.mjs'));
    verdicts.push(result.newOrphans.includes('tests/matrix-template.templated.mjs'));
    verdicts.push(result.exempt.some((entry) => entry.path === 'tests/matrix-regex.support.mjs'));
    controls.push(!result.exempt.some((entry) => entry.path === 'tests/matrix-named.named.mjs'));
    controls.push(!result.exempt.some((entry) => entry.path === 'tests/matrix-template.templated.mjs'));
    controls.push(!result.newOrphans.includes('tests/matrix-regex.support.mjs'));
  });

  const canariesAbsent = canaries.every((path) => !existsSync(path));
  console.log(`[BUG022-C56] verdicts=${verdicts.map(String).join(',')}`);
  console.log(`[BUG022-C56] controls=${controls.map(String).join(',')}`);
  console.log(`[BUG022-C56] closedFindings=${verdicts.filter(Boolean).length}`);
  console.log(`[BUG022-C56] independentControls=${controls.filter(Boolean).length}`);
  console.log(`[BUG022-C56] executionCanariesAbsent=${canariesAbsent}`);

  assert.deepEqual(verdicts, new Array(12).fill(true));
  assert.equal(controls.length, 12);
  assert.deepEqual(controls, new Array(12).fill(true));
  assert.equal(canariesAbsent, true);
});
// BUG022_R4_FINAL_SHAPE_MATRIX_END
// BUG022_R4_SECURITY_TEST_DELTA_END

// BUG022_R4_SECURITY_INTEGRITY_CARRIERS_BEGIN
function securityReplaceExactly(source, before, after, label) {
  const first = source.indexOf(before);
  assert.ok(first >= 0, `${label}: expected source fragment is missing`);
  assert.equal(source.indexOf(before, first + before.length), -1, `${label}: source fragment is ambiguous`);
  return source.slice(0, first) + after + source.slice(first + before.length);
}

function securityReplaceRange(source, startAnchor, endAnchor, replacement, label) {
  const start = source.indexOf(startAnchor);
  assert.ok(start >= 0, `${label}: start anchor is missing`);
  assert.equal(source.indexOf(startAnchor, start + startAnchor.length), -1, `${label}: start anchor is ambiguous`);
  const end = source.indexOf(endAnchor, start + startAnchor.length);
  assert.ok(end > start, `${label}: end anchor is missing or unordered`);
  return source.slice(0, start) + replacement + source.slice(end);
}

function securityRemoveMarkedBlock(source, markerStem, label) {
  const startMarker = `\n// ${markerStem}_BEGIN\n`;
  const endMarker = `// ${markerStem}_END\n`;
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0, `${label}: start marker is missing`);
  assert.equal(source.indexOf(startMarker, start + startMarker.length), -1, `${label}: start marker is ambiguous`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start, `${label}: end marker is missing or unordered`);
  assert.equal(source.indexOf(endMarker, end + endMarker.length), -1, `${label}: end marker is ambiguous`);
  return source.slice(0, start) + source.slice(end + endMarker.length);
}

// BUG022_C55_ROLLBACK_ADAPTERS_BEGIN
function c55RollbackTest(current) {
  if (!current.includes('\n// BUG022_C55_DIRECT_NODE_SCRIPT_TEST_BEGIN\n')) return current;
  let source = securityRemoveMarkedBlock(
    current,
    'BUG022_C55_DIRECT_NODE_SCRIPT_TEST',
    'C55 direct-node-script regression'
  );
  source = securityRemoveMarkedBlock(
    source,
    'BUG022_C55_ROLLBACK_ADAPTERS',
    'C55 rollback adapters'
  );
  source = securityReplaceExactly(
    source,
    [
      'function securityRollbackTest(current) {',
      '  const c55Source = c55RollbackTest(current);',
      "  let source = c55Source.includes('// BUG022_R4_FINAL_SHAPE_MATRIX_BEGIN')",
      '    ? finalShapeRollbackTest(c55Source)',
      '    : c55Source;'
    ].join('\n'),
    [
      'function securityRollbackTest(current) {',
      "  let source = current.includes('// BUG022_R4_FINAL_SHAPE_MATRIX_BEGIN')",
      '    ? finalShapeRollbackTest(current)',
      '    : current;'
    ].join('\n'),
    'C55 security test rollback hook'
  );
  source = securityReplaceExactly(
    source,
    [
      'function securityRollbackSource(current) {',
      '  const c55Source = c55RollbackSource(current);',
      "  let source = c55Source.includes('const PERL_ALARM_SCRIPT = ')",
      '    ? finalShapeRollbackSource(c55Source)',
      '    : c55Source;'
    ].join('\n'),
    [
      'function securityRollbackSource(current) {',
      "  let source = current.includes('const PERL_ALARM_SCRIPT = ')",
      '    ? finalShapeRollbackSource(current)',
      '    : current;'
    ].join('\n'),
    'C55 security source rollback hook'
  );
  source = securityReplaceExactly(
    source,
    '    c55RollbackTest(current),',
    '    current,',
    'C55 final-shape test rollback hook'
  );
  source = securityReplaceExactly(
    source,
    '    c55RollbackSource(current),',
    '    current,',
    'C55 final-shape source rollback hook'
  );
  return source;
}

function c55RollbackSource(current) {
  if (!current.includes('\nconst DIRECT_NODE_SCRIPT_FAMILY = /^')) return current;
  let source = current;
  source = securityReplaceExactly(
    source,
    [
      ' *     that sits in ARGUMENT POSITION of a `--test` invocation, plus (c) every',
      ' *     glob in the closed plain-Node family-loop grammar, anywhere in the',
      ' *     committed tree.'
    ].join('\n'),
    [
      ' *     that sits in ARGUMENT POSITION of a `--test` invocation anywhere in the',
      ' *     committed tree.'
    ].join('\n'),
    'C55 derivation contract'
  );
  source = securityReplaceExactly(
    source,
    'const DIRECT_NODE_SCRIPT_FAMILY = /^for[ \\t]+([A-Za-z_][A-Za-z0-9_]*)[ \\t]+in[ \\t]+(tests\\/[A-Za-z0-9._*?/-]*\\.mjs);[ \\t]*do[ \\t]+(?:node|\\/usr\\/bin\\/node)[ \\t]+(["\u0027])(\\$(?:\\{[A-Za-z_][A-Za-z0-9_]*\\}|[A-Za-z_][A-Za-z0-9_]*))\\3[ \\t]*\\|\\|[ \\t]*exit[ \\t]+1;[ \\t]*done$/;\n',
    '',
    'C55 direct-node-script grammar'
  );
  const historicalPatternHelpers = [
    'function nodePatterns(text) {',
    '  return parseNodeTestCommandCandidates(text).flatMap((candidate) => candidate.patterns);',
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
  source = securityReplaceRange(
    source,
    'function parseDirectNodeScriptFamily(command) {',
    'function tokenizeShellCommand(command) {',
    historicalPatternHelpers,
    'C55 command-family helpers'
  );
  source = securityReplaceExactly(
    source,
    [
      '      if (',
      '        testEntry',
      "        && typeof testEntry === 'object'",
      "        && testEntry.requiredRunnerClass === 'direct-node-script'",
      "        && typeof testEntry.declaredRunnerCommand === 'string'",
      '        && parseDirectNodeScriptCommandCandidates(testEntry.declaredRunnerCommand)',
      '          .some((candidate) => candidate.patterns.length > 0)',
      '      ) {',
      '        commands.push(testEntry.declaredRunnerCommand);',
      '      }',
      ''
    ].join('\n'),
    '',
    'C55 typed structured runner mirror'
  );
  source = securityReplaceExactly(
    source,
    "    if (!text.includes('--test') && !text.includes(' do node ')) continue;",
    "    if (!text.includes('--test')) continue;",
    'C55 family candidate prefilter'
  );
  source = securityReplaceExactly(
    source,
    [
      '      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {',
      '        for (const candidate of structuredLineDeclaredPatterns(lines[lineIndex])) {',
      '          rawCandidates.push({ ...candidate, line: lineIndex + 1 });',
      '        }',
      '      }'
    ].join('\n'),
    [
      '      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {',
      '        for (const pattern of structuredLineNodePatterns(lines[lineIndex])) {',
      '          rawCandidates.push({ pattern, line: lineIndex + 1 });',
      '        }',
      '      }'
    ].join('\n'),
    'C55 structured raw candidates'
  );
  const historicalStructuredLoop = [
    '      const recognizedCandidates = new Map();',
    '      let searchFrom = 0;',
    '      for (const command of commands) {',
    '        const commandNeedle = JSON.stringify(command);',
    '        const commandOffset = text.indexOf(commandNeedle, searchFrom);',
    '        const line = commandOffset < 0',
    '          ? 1',
    '          : text.slice(0, commandOffset + 1).split(/\\r?\\n/).length;',
    '        if (commandOffset >= 0) searchFrom = commandOffset + commandNeedle.length;',
    '        for (const parsedCommand of parseNodeTestCommandCandidates(command)) {',
    '          for (const pattern of parsedCommand.patterns) {',
    '            const candidateKey = `${line}\\0${pattern}`;',
    '            recognizedCandidates.set(candidateKey, (recognizedCandidates.get(candidateKey) ?? 0) + 1);',
    '            if (parsedCommand.parseError) {',
    '              record({',
    '                pattern,',
    "                kind: 'node-test-argument',",
    '                artifact,',
    '                line,',
    '                artifactRole: artifactRoleValue,',
    '                sectionRole: SECTION_ROLE.TEST_PLAN,',
    "                authority: 'error',",
    '                reason: parsedCommand.parseError,',
    '                parseIssues: parsedCommand.parseIssues',
    '              });',
    '              continue;',
    '            }',
    '            record({',
    '              pattern,',
    "              kind: 'node-test-argument',",
    '              artifact,',
    '              line,',
    '              artifactRole: artifactRoleValue,',
    '              sectionRole: SECTION_ROLE.TEST_PLAN,',
    "              authority: 'active',",
    "              reason: 'structured-test-plan'",
    '            });',
    '          }',
    '        }',
    '      }',
    '      for (const candidate of rawCandidates) {',
    '        const candidateKey = `${candidate.line}\\0${candidate.pattern}`;',
    '        const recognizedCount = recognizedCandidates.get(candidateKey) ?? 0;',
    '        if (recognizedCount > 0) {',
    '          recognizedCandidates.set(candidateKey, recognizedCount - 1);',
    '          continue;',
    '        }',
    '        record({',
    '          ...candidate,',
    "          kind: 'node-test-argument',",
    '          artifact,',
    '          artifactRole: artifactRoleValue,',
    '          sectionRole: SECTION_ROLE.NONE,',
    "          authority: 'error',",
    "          reason: 'malformed-structured-test-plan'",
    '        });',
    '      }',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    '      const recognizedCandidates = new Map();',
    "      continue;\n    }\n\n    const sectionRoles = artifact.endsWith('.md')",
    historicalStructuredLoop,
    'C55 structured command classification'
  );
  const historicalMarkdownLoop = [
    '    for (let i = 0; i < lines.length; i++) {',
    '      const sectionRole = sectionRoles[i];',
    '      for (const candidate of parseNodeTestCommandCandidates(lines[i])) {',
    '        const classification = candidateClassification(artifactRoleValue, sectionRole);',
    "        if (candidate.parseError && classification.authority !== 'historical') {",
    '          for (const pattern of candidate.patterns) {',
    '            record({',
    '              pattern,',
    "              kind: 'node-test-argument',",
    '              artifact,',
    '              line: i + 1,',
    '              artifactRole: artifactRoleValue,',
    '              sectionRole,',
    "              authority: 'error',",
    '              reason: candidate.parseError,',
    '              parseIssues: candidate.parseIssues',
    '            });',
    '          }',
    '          continue;',
    '        }',
    '        for (const pattern of candidate.patterns) {',
    '          record({',
    '            pattern,',
    "            kind: 'node-test-argument',",
    '            artifact,',
    '            line: i + 1,',
    '            artifactRole: artifactRoleValue,',
    '            sectionRole,',
    '            ...classification',
    '          });',
    '        }',
    '      }',
    '    }',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    '    for (let i = 0; i < lines.length; i++) {\n      const sectionRole = sectionRoles[i];',
    '  }\n\n  const globs = [...byIdentity.values()]',
    historicalMarkdownLoop,
    'C55 Markdown command classification'
  );
  return source;
}
// BUG022_C55_ROLLBACK_ADAPTERS_END

function securityRollbackTest(current) {
  const c55Source = c55RollbackTest(current);
  let source = c55Source.includes('// BUG022_R4_FINAL_SHAPE_MATRIX_BEGIN')
    ? finalShapeRollbackTest(c55Source)
    : c55Source;
  source = securityRemoveMarkedBlock(
    source,
    'BUG022_R4_SECURITY_' + 'TEST_DELTA',
    'security persistent-test delta'
  );
  source = securityRemoveMarkedBlock(
    source,
    'BUG022_R4_SECURITY_' + 'INTEGRITY_CARRIERS',
    'security integrity carriers'
  );
  source = securityReplaceExactly(source, '  existsSync,\n', '', 'security existsSync import');
  source = securityReplaceExactly(source, '  symlinkSync,\n', '', 'security symlinkSync import');

  const adaptedSourceAfter = [
    '  const sourceAfter = Buffer.from(',
    "    securityRollbackSource(readFileSync(resolve(ROOT, sourcePath), 'utf8')),",
    "    'utf8'",
    '  );',
    '  const testAfter = Buffer.from(',
    "    securityRollbackTest(readFileSync(resolve(ROOT, testPath), 'utf8')),",
    "    'utf8'",
    '  );'
  ].join('\n');
  const historicalSourceAfter = [
    '  const sourceAfter = readFileSync(resolve(ROOT, sourcePath));',
    '  const testAfter = readFileSync(resolve(ROOT, testPath));'
  ].join('\n');
  const adaptedSourceAfterCount = source.split(adaptedSourceAfter).length - 1;
  assert.equal(adaptedSourceAfterCount, 2, 'C18/C25 security compatibility adaptations drifted');
  source = source.split(adaptedSourceAfter).join(historicalSourceAfter);

  const adaptedC31 = [
    '  const sourceRepaired = Buffer.from(',
    "    securityRollbackSource(readFileSync(resolve(ROOT, sourcePath), 'utf8')),",
    "    'utf8'",
    '  );',
    '  const carrierTest = Buffer.from(',
    "    securityRollbackTest(readFileSync(resolve(ROOT, testPath), 'utf8')),",
    "    'utf8'",
    '  );'
  ].join('\n');
  const historicalC31 = [
    '  const sourceRepaired = readFileSync(resolve(ROOT, sourcePath));',
    '  const carrierTest = readFileSync(resolve(ROOT, testPath));'
  ].join('\n');
  source = securityReplaceExactly(source, adaptedC31, historicalC31, 'C31 security compatibility adaptation');
  return source;
}

function securityRollbackSource(current) {
  const c55Source = c55RollbackSource(current);
  let source = c55Source.includes('const PERL_ALARM_SCRIPT = ')
    ? finalShapeRollbackSource(c55Source)
    : c55Source;
  source = securityReplaceRange(
    source,
    "import { randomUUID } from 'node:crypto';",
    "import { fileURLToPath } from 'node:url';",
    [
      "import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import { dirname, join, relative, resolve } from 'node:path';",
      ''
    ].join('\n'),
    'security filesystem imports'
  );
  source = securityReplaceExactly(
    source,
    "const ROOT = realpathSync(resolve(dirname(SCRIPT_PATH), '..'));",
    "const ROOT = resolve(dirname(SCRIPT_PATH), '..');",
    'canonical root declaration'
  );
  source = securityReplaceExactly(
    source,
    [
      "const ENV_OPTIONS_WITH_VALUE = new Set(['-u', '--unset']);",
      "const ENV_BOOLEAN_OPTIONS = new Set(['-i', '--ignore-environment']);",
      "const TIMEOUT_OPTIONS_WITH_VALUE = new Set(['-k', '--kill-after', '-s', '--signal']);",
      "const TIMEOUT_BOOLEAN_OPTIONS = new Set(['--foreground', '--preserve-status', '--verbose']);"
    ].join('\n'),
    [
      "const ENV_OPTIONS_WITH_VALUE = new Set(['-C', '--chdir', '-S', '--split-string', '-u', '--unset']);",
      "const TIMEOUT_OPTIONS_WITH_VALUE = new Set(['-k', '--kill-after', '-s', '--signal']);"
    ].join('\n'),
    'closed wrapper option sets'
  );
  source = securityReplaceExactly(
    source,
    [
      "const QUOTED_STRING = /(['\"])([^'\"]+)\\1/g;",
      '',
      '/* Byte order, so the committed baseline sorts identically to `LC_ALL=C sort` on'
    ].join('\n'),
    [
      "const QUOTED_STRING = /(['\"])([^'\"]+)\\1/g;",
      '',
      '/* Static imports, dynamic imports, and require calls all register node:test. */',
      "const NODE_TEST_IMPORT = /(?:\\bfrom\\s*|\\bimport\\s*(?:\\(\\s*)?|\\brequire\\s*\\(\\s*)(['\"])node:test\\1/;",
      '',
      '/* Byte order, so the committed baseline sorts identically to `LC_ALL=C sort` on'
    ].join('\n'),
    'historical node:test matcher'
  );
  source = securityReplaceRange(
    source,
    "const SECURITY_BOUNDARY = Symbol('reachability-security-boundary');",
    'function displayPath(root, abs) {',
    '',
    'filesystem security boundary block'
  );
  source = securityReplaceExactly(
    source,
    [
      "  const gitignorePhysical = physicalReadPath(root, gitignore, '.gitignore');",
      "  for (const raw of readFileSync(gitignorePhysical, 'utf8').split(/\\r?\\n/)) {"
    ].join('\n'),
    "  for (const raw of readFileSync(gitignore, 'utf8').split(/\\r?\\n/)) {",
    'confined gitignore read'
  );
  source = securityReplaceExactly(
    source,
    '    const parsed = parseNodeTestTokens(fragment.text, fragment.presentation);',
    '    const parsed = parseNodeTestTokens(fragment.text);',
    'command presentation context'
  );
  source = securityReplaceRange(
    source,
    'function shellAmbiguityIssues(command) {',
    'function consumeOption(tokens, index, optionsWithValue, issues) {',
    '',
    'shell ambiguity scanner'
  );

  const historicalCommandTokenIndex = [
    'function commandTokenIndex(tokens) {',
    '  let index = 0;',
    "  if (tokens[index]?.value === 'env' || tokens[index]?.value === '/usr/bin/env') {",
    '    index++;',
    '    while (index < tokens.length) {',
    '      const token = tokens[index].value;',
    "      if (token === '--') { index++; break; }",
    '      if (SHELL_ASSIGNMENT.test(token)) { index++; continue; }',
    "      if (!token.startsWith('-')) break;",
    '      const issues = [];',
    '      index = consumeOption(tokens, index, ENV_OPTIONS_WITH_VALUE, issues);',
    '      if (issues.length > 0) return null;',
    '    }',
    '  }',
    '',
    '  const wrapper = tokens[index]?.value;',
    "  if (/^(?:timeout|gtimeout|\\/usr\\/bin\\/(?:g?timeout)|\\/opt\\/(?:homebrew|local)\\/bin\\/(?:g?timeout))$/.test(wrapper ?? '')) {",
    '    index++;',
    "    while (tokens[index]?.value.startsWith('-')) {",
    '      const issues = [];',
    '      index = consumeOption(tokens, index, TIMEOUT_OPTIONS_WITH_VALUE, issues);',
    '      if (issues.length > 0) return null;',
    '    }',
    "    if (!/^[0-9]+(?:\\.[0-9]+)?[smhd]?$/.test(tokens[index]?.value ?? '')) return null;",
    '    index++;',
    "  } else if (wrapper === '/usr/bin/perl') {",
    "    const script = tokens[index + 2]?.value ?? '';",
    '    if (',
    "      tokens[index + 1]?.value !== '-e'",
    '      || !/^alarm shift @ARGV; exec @ARGV(?: or die .+)?$/.test(script)',
    "      || !/^[0-9]+(?:\\.[0-9]+)?$/.test(tokens[index + 3]?.value ?? '')",
    '    ) return null;',
    '    index += 4;',
    '  }',
    '  return index;',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'function commandTokenIndex(tokens, issues) {',
    "function parseNodeTestTokens(command, presentation = 'direct') {",
    historicalCommandTokenIndex,
    'closed command prefix parser'
  );

  const historicalParseNodeTestTokens = [
    'function parseNodeTestTokens(command) {',
    '  const tokenized = tokenizeShellCommand(command);',
    '  const { tokens } = tokenized;',
    '  let index = commandTokenIndex(tokens);',
    '  if (index === null) return null;',
    "  if (tokens[index]?.value !== 'node' && tokens[index]?.value !== '/usr/bin/node') return null;",
    '  index++;',
    "  if (tokens[index]?.value !== '--test') return null;",
    '  index++;',
    '',
    '  if (tokenized.error) {',
    '    const testArguments = command.match(RAW_TEST_PATH_ARGUMENT) ?? [];',
    '    return { issues: [tokenized.error], testArguments };',
    '  }',
    '',
    '  const issues = [];',
    '  const testArguments = [];',
    '  let positionalOnly = false;',
    '  let commandSubstitutionDepth = 0;',
    '  while (index < tokens.length) {',
    '    const token = tokens[index];',
    '    const substitutionOpens = token.value.match(/\\$\\(/g)?.length ?? 0;',
    '    const substitutionCloses = token.value.match(/\\)/g)?.length ?? 0;',
    '    if (substitutionOpens > 0 || commandSubstitutionDepth > 0) {',
    '      commandSubstitutionDepth += substitutionOpens;',
    "      const nestedArgument = token.value.replace(/^\\$\\([^ ]*/, '').replace(/\\)+$/, '');",
    '      if (TEST_PATH_ARGUMENT.test(nestedArgument)) testArguments.push(nestedArgument);',
    '      commandSubstitutionDepth -= substitutionCloses;',
    '      if (commandSubstitutionDepth < 0) {',
    "        issues.push('unbalanced-command-substitution');",
    '        commandSubstitutionDepth = 0;',
    '      }',
    '      index++;',
    '      continue;',
    '    }',
    '    if (SHELL_CONTROL_TOKEN.has(token.value)) break;',
    "    if (!positionalOnly && token.value === '--') {",
    '      positionalOnly = true;',
    '      index++;',
    '      continue;',
    '    }',
    "    if (!positionalOnly && token.value.startsWith('--')) {",
    '      index = consumeOption(tokens, index, NODE_TEST_OPTIONS_WITH_VALUE, issues);',
    '      continue;',
    '    }',
    '    if (TEST_PATH_ARGUMENT.test(token.value)) {',
    '      testArguments.push(token.value);',
    '    } else {',
    '      issues.push(`unsupported-argument:${token.value}`);',
    '    }',
    '    index++;',
    '  }',
    "  if (commandSubstitutionDepth !== 0) issues.push('unterminated-command-substitution');",
    '  return { issues, testArguments };',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    "function parseNodeTestTokens(command, presentation = 'direct') {",
    'function candidateClassification(artifactRoleValue, sectionRole) {',
    historicalParseNodeTestTokens,
    'closed node command parser'
  );

  source = securityReplaceExactly(
    source,
    'export function collectDeclaredTestGlobs(root = ROOT, options = {}) {\n  root = options.rootIsCanonical === true ? root : canonicalRepositoryRoot(root).canonical;',
    'export function collectDeclaredTestGlobs(root = ROOT) {',
    'collector root canonicalization'
  );
  source = securityReplaceExactly(
    source,
    "    const source = readFileSync(physicalReadPath(root, configAbs, PLAYWRIGHT_CONFIG_REL), 'utf8');",
    "    const source = readFileSync(configAbs, 'utf8');",
    'confined Playwright config read'
  );
  source = securityReplaceExactly(
    source,
    [
      "    try { text = readFileSync(physicalReadPath(root, abs, displayPath(root, abs)), 'utf8'); } catch (error) {",
      '      if (error instanceof ReachabilitySecurityError) throw error;',
      '      continue;',
      '    }'
    ].join('\n'),
    "    try { text = readFileSync(abs, 'utf8'); } catch { continue; }",
    'confined artifact read'
  );
  source = securityReplaceExactly(
    source,
    "    if (artifactRoleValue === ARTIFACT_ROLE.UNKNOWN && !artifact.endsWith('.md')) continue;\n",
    '',
    'executable-source inertness'
  );
  source = source.split(',\n                parseIssues: parsedCommand.parseIssues').join('');
  assert.equal(
    current.includes('parseIssues: parsedCommand.parseIssues'),
    true,
    'structured parse-issue propagation is missing before rollback'
  );

  const historicalMarkdownLoop = [
    '    for (let i = 0; i < lines.length; i++) {',
    '      const sectionRole = sectionRoles[i];',
    '      for (const candidate of parseNodeTestCommandCandidates(lines[i])) {',
    '        if (candidate.parseError) {',
    '          for (const pattern of candidate.patterns) {',
    '            record({',
    '              pattern,',
    "              kind: 'node-test-argument',",
    '              artifact,',
    '              line: i + 1,',
    '              artifactRole: artifactRoleValue,',
    '              sectionRole,',
    "              authority: 'error',",
    '              reason: candidate.parseError',
    '            });',
    '          }',
    '          continue;',
    '        }',
    '        const classification = candidateClassification(artifactRoleValue, sectionRole);',
    '        for (const pattern of candidate.patterns) {',
    '          record({',
    '            pattern,',
    "            kind: 'node-test-argument',",
    '            artifact,',
    '            line: i + 1,',
    '            artifactRole: artifactRoleValue,',
    '            sectionRole,',
    '            ...classification',
    '          });',
    '        }',
    '      }',
    '    }',
    '  }',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    '    for (let i = 0; i < lines.length; i++) {',
    '  const globs = [...byIdentity.values()].sort((a, b) => (',
    historicalMarkdownLoop,
    'historical Markdown classification loop'
  );

  source = securityReplaceRange(
    source,
    'function confinedTestEntries(root, testsDir) {',
    'export function validateTestFileReachability(root = ROOT, options = {}) {',
    '',
    'confined test-entry discovery'
  );
  const historicalValidation = [
    'export function validateTestFileReachability(root = ROOT, options = {}) {',
    '  const testsDir = options.testsDir ?? TESTS_DIR;',
    '  const baselineFile = options.baselineFile',
    '    ? resolve(options.baselineFile)',
    '    : resolve(root, BASELINE_REL);',
    '  const absTests = resolve(root, testsDir);',
    '',
    '  const testFiles = (existsSync(absTests) ? readdirSync(absTests) : [])',
    "    .filter((name) => name.endsWith('.mjs'))",
    '    .sort()',
    '    .map((name) => `${testsDir}/${name}`);',
    '',
    '  const sources = new Map();',
    '  for (const path of testFiles) {',
    "    try { sources.set(path, readFileSync(resolve(root, path), 'utf8')); } catch { sources.set(path, ''); }",
    '  }',
    '',
    '  /* Rule `shared-helper-module`, both clauses evidenced from file contents. */',
    '  const exempt = [];',
    '  const exemptPaths = new Set();',
    '  for (const path of testFiles) {',
    '    if (NODE_TEST_IMPORT.test(sources.get(path))) continue;',
    '    const specifier = new RegExp(',
    '      `(?:from\\\\s*|import\\\\s*\\\\(\\\\s*)([\'\"])\\\\.{1,2}/(?:${escapeRegExp(testsDir)}/)?${escapeRegExp(path.slice(testsDir.length + 1))}\\\\1`',
    '    );',
    '    const importers = testFiles.filter((other) => other !== path && specifier.test(sources.get(other)));',
    '    if (importers.length > 0) {',
    '      exempt.push({ path, importerCount: importers.length, importers });',
    '      exemptPaths.add(path);',
    '    }',
    '  }',
    '',
    '  const {',
    '    classificationErrors,',
    '    globs,',
    '    historicalSites,',
    '    playwrightMatchers,',
    '    scannedFiles',
    '  } = collectDeclaredTestGlobs(root);',
    '  const compiled = globs.map((glob) => ({ ...glob, matcher: globToRegExp(glob.pattern) }));',
    "  const nodeGlobCount = globs.filter((glob) => glob.kind === 'node-test-argument').length;",
    '  const runnerOwnership = runnerSelectionDetails(globs, testFiles);',
    '  const knownCrossings = resolve(root) === ROOT ? KNOWN_DISCOVERY_CROSSINGS : [];',
    '',
    '  const reachable = [];',
    '  const orphans = [];',
    '  for (const path of testFiles) {',
    '    if (exemptPaths.has(path)) continue;',
    '    const matchedBy = compiled.filter((glob) => glob.matcher.test(path)).map((glob) => glob.pattern);',
    '    if (matchedBy.length > 0) reachable.push({ path, matchedBy });',
    '    else orphans.push(path);',
    '  }',
    '',
    '  const baseline = readBaseline(baselineFile);',
    '  const baselinePresent = baseline !== null;',
    '  const frozen = baseline ?? new Set();',
    '  const newOrphans = orphans.filter((path) => !frozen.has(path)).sort(byteOrder);',
    '  const knownOrphans = orphans.filter((path) => frozen.has(path)).sort(byteOrder);',
    '  const orphanSet = new Set(orphans);',
    '  const staleBaseline = [...frozen].filter((path) => !orphanSet.has(path)).sort(byteOrder);',
    '',
    '  return {',
    '    allSites: options.allSites === true,',
    '    baselineCount: frozen.size,',
    '    baselineFile: displayPath(root, baselineFile),',
    '    baselinePresent,',
    '    classificationErrors,',
    '    exempt,',
    '    exemptRule: EXEMPT_RULE,',
    '    globCount: globs.length,',
    '    globs,',
    '    historicalSites,',
    '    knownCrossings,',
    '    knownOrphans,',
    '    newOrphans,',
    '    nodeGlobCount,',
    '    orphans: orphans.slice().sort(byteOrder),',
    '    playwrightMatchers,',
    '    reachable,',
    '    runnerOwnership,',
    '    scannedFiles,',
    '    staleBaseline,',
    '    testFiles,',
    '    testFileCount: testFiles.length,',
    '    testsDir,',
    '    vacuous: playwrightMatchers === 0 || nodeGlobCount === 0 || testFiles.length === 0 || scannedFiles === 0',
    '  };',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'export function validateTestFileReachability(root = ROOT, options = {}) {',
    'export function formatTestFileReachabilityFindings(result, indent = 0) {',
    historicalValidation,
    'secured reachability validation'
  );
  source = securityReplaceExactly(
    source,
    [
      '    lines.push(`${pad}CLASSIFICATION ERROR ${site.pattern} [${site.kind}] ${site.artifact}:${site.line} `',
      '      + `artifactRole=${site.artifactRole} sectionRole=${site.sectionRole} reason=${site.reason}`',
      "      + `${site.parseIssues ? ` issues=${site.parseIssues.join(',')}` : ''}`);"
    ].join('\n'),
    [
      '    lines.push(`${pad}CLASSIFICATION ERROR ${site.pattern} [${site.kind}] ${site.artifact}:${site.line} `',
      '      + `artifactRole=${site.artifactRole} sectionRole=${site.sectionRole} reason=${site.reason}`);'
    ].join('\n'),
    'classification issue rendering'
  );
  source = securityReplaceRange(
    source,
    'function writeBaseline(root, result) {',
    '  const header = [',
    'function writeBaseline(root, result) {\n  const absBaseline = resolve(root, BASELINE_REL);\n',
    'atomic baseline prelude'
  );
  source = securityReplaceRange(
    source,
    "  const content = header.concat(result.orphans, '').join('\\n');",
    '  return displayPath(root, absBaseline);',
    "  writeFileSync(absBaseline, header.concat(result.orphans, '').join('\\n'), 'utf8');\n",
    'atomic baseline mutation'
  );

  const historicalMain = [
    'function main(argv) {',
    '  let parsed;',
    '  try {',
    '    parsed = parseReachabilityArguments(argv);',
    '  } catch (error) {',
    '    if (!(error instanceof ReachabilityUsageError)) throw error;',
    '    console.error(error.message);',
    '    usage(console.error);',
    '    return 2;',
    '  }',
    '  const { allSites, help, root, update } = parsed;',
    '  if (help) { usage(); return 0; }',
    '',
    '  const result = validateTestFileReachability(root, { allSites });',
    '  for (const line of formatTestFileReachabilityFindings(result, 0)) console.log(line);',
    '',
    '  if (result.classificationErrors.length > 0) return 1;',
    '  if (result.vacuous) {',
    "    console.error('vacuous scan: missing active Playwright or Node globs, test files, or scanned artifacts');",
    '    return 1;',
    '  }',
    '  if (!result.baselinePresent) return 1;',
    '  if (result.newOrphans.length > 0) return 1;',
    '  try {',
    '    runnerDisjointnessVerdict(result.globs, result.testFiles, result.knownCrossings);',
    '  } catch (error) {',
    '    if (!(error instanceof RunnerDisjointnessRefusal)) throw error;',
    '    console.error(`${error.name}: ${error.message}`);',
    '    return 1;',
    '  }',
    '  if (update) console.log(`baseline written: ${writeBaseline(root, result)}`);',
    '  return 0;',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'function main(argv) {',
    "if (resolve(process.argv[1] ?? '') === SCRIPT_PATH) process.exit(main(process.argv.slice(2)));",
    historicalMain,
    'security-aware CLI main'
  );
  return source;
}

test('Regression: SCN-BUG022-007 security repair rollback preserves source test ratchets and sentinels', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const expectedRollbackSourceObject = '253b28fbdc37c036b3167527d5395fa1a6b223cf';
  const expectedRollbackTestObject = '580c427d3800cd3326ed8fc045e7af30219539c3';
  const expectedRollbackTestSha256 = '571f4b0b1b0a933965300d57dbbc0ee92574190f80f05f484206a22d7c596121';
  const protectedObjects = new Map([
    ['scripts/validate-test-file-reachability.baseline', '2a5e472d7650027c53a17c7ae340d2bb25d2e821'],
    ['.specify/memory/agents.md', '08592d2bfaa8f6787806f05f508df9f3e0920a75'],
    ['playwright.config.mjs', 'e022a133857aa20bd10b759a98b80e2df38ce621'],
    [
      'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md',
      'a50d8e1727ef1b514e676016c480a436c0cc3033'
    ]
  ]);
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

  function runGit(args, { cwd = ROOT, input } = {}) {
    const execution = spawnSync('git', args, { cwd, input, timeout: 30000 });
    assert.equal(execution.signal, null, `git ${args.join(' ')} was interrupted`);
    assert.equal(execution.status, 0, `git ${args.join(' ')} failed\n${execution.stderr?.toString('utf8') ?? ''}`);
    return execution.stdout;
  }

  const gitObject = (bytes, cwd = ROOT) => runGit(['hash-object', '--stdin'], {
    cwd,
    input: bytes
  }).toString('utf8').trim();

  function crossingEntries(source) {
    const declaration = /(?:export )?const KNOWN_DISCOVERY_CROSSINGS = (?:Object\.freeze\()?\[([\s\S]*?)\]\)?;/.exec(source);
    assert.ok(declaration, 'security crossing ratchet declaration is missing');
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
        rows.push(`file ${relativePath} ${sha256(readFileSync(absolutePath))}`);
      } catch {
        rows.push(`missing ${relativePath}`);
      }
    }
  }

  function excludedSnapshot() {
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

  const currentSource = readFileSync(resolve(ROOT, sourcePath));
  const currentTest = readFileSync(resolve(ROOT, testPath));
  const rollbackSource = Buffer.from(securityRollbackSource(currentSource.toString('utf8')), 'utf8');
  const rollbackTest = Buffer.from(securityRollbackTest(currentTest.toString('utf8')), 'utf8');
  const currentSourceObject = gitObject(currentSource);
  const currentTestObject = gitObject(currentTest);
  const rollbackSourceObject = gitObject(rollbackSource);
  const rollbackTestObject = gitObject(rollbackTest);

  console.log(`[BUG022-C40-DIAGNOSTIC] rollbackSource=${rollbackSourceObject}`);
  console.log(`[BUG022-C40-DIAGNOSTIC] rollbackTest=${rollbackTestObject}`);
  console.log(`[BUG022-C40-DIAGNOSTIC] rollbackTestSha256=${sha256(rollbackTest)}`);
  assert.equal(rollbackSourceObject, expectedRollbackSourceObject, 'security source rollback object drifted');
  assert.equal(rollbackTestObject, expectedRollbackTestObject, 'security test rollback object drifted');
  assert.equal(sha256(rollbackTest), expectedRollbackTestSha256, 'security test rollback bytes drifted');
  assert.notEqual(currentSourceObject, rollbackSourceObject, 'security source delta is missing');
  assert.notEqual(currentTestObject, rollbackTestObject, 'security test delta is missing');

  const rollbackCrossings = crossingEntries(rollbackSource.toString('utf8'));
  const currentCrossings = crossingEntries(currentSource.toString('utf8'));
  assert.deepEqual(currentCrossings, rollbackCrossings, 'security repair changed the crossing ratchet');
  assert.equal(currentCrossings.length, 8, 'security repair changed crossing cardinality');

  const mutationControls = [
    [Buffer.from(currentSource), currentSourceObject, 'current-source'],
    [Buffer.from(currentTest), currentTestObject, 'current-test'],
    [Buffer.from(rollbackSource), rollbackSourceObject, 'rollback-source'],
    [Buffer.from(rollbackTest), rollbackTestObject, 'rollback-test']
  ].map(([bytes, expectedObject, label]) => {
    bytes[0] ^= 1;
    const observed = gitObject(bytes);
    assert.notEqual(observed, expectedObject, `${label} object mutation was not detected`);
    return `${label}:RED`;
  });

  const protectedBytes = new Map();
  for (const [path, expectedObject] of protectedObjects) {
    const bytes = readFileSync(resolve(ROOT, path));
    assert.equal(gitObject(bytes), expectedObject, `${path} changed before security rollback`);
    protectedBytes.set(path, bytes);
  }
  const excludedBefore = excludedSnapshot();
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c40-'));
  const outsideRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c40-outside-'));
  const outsideA = resolve(outsideRoot, 'baseline-leaf.sentinel');
  const outsideB = resolve(outsideRoot, 'scripts-parent.sentinel');
  const outsideABytes = Buffer.from('C40 outside baseline leaf sentinel\n');
  const outsideBBytes = Buffer.from('C40 outside scripts parent sentinel\n');
  writeFileSync(outsideA, outsideABytes);
  writeFileSync(outsideB, outsideBBytes);
  let reverseSourceObject;
  let reverseTestObject;
  let forwardSourceObject;
  let forwardTestObject;

  try {
    runGit(['init', '-q'], { cwd: tempRoot });
    const baseFiles = new Map([
      [sourcePath, rollbackSource],
      [testPath, rollbackTest],
      ...protectedBytes
    ]);
    for (const [path, bytes] of baseFiles) {
      const absolutePath = resolve(tempRoot, path);
      mkdirSync(dirname(absolutePath), { recursive: true });
      writeFileSync(absolutePath, bytes);
    }
    runGit(['add', '--', ...baseFiles.keys()], { cwd: tempRoot });
    writeFileSync(resolve(tempRoot, sourcePath), currentSource);
    writeFileSync(resolve(tempRoot, testPath), currentTest);

    const changedPaths = runGit(['diff', '--name-only', '--', sourcePath, testPath], { cwd: tempRoot })
      .toString('utf8').trim().split(/\r?\n/).filter(Boolean);
    assert.deepEqual(changedPaths, [sourcePath, testPath]);
    const patch = runGit(['diff', '--binary', '--', sourcePath, testPath], { cwd: tempRoot });

    runGit(['apply', '--reverse', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    reverseSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    reverseTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    assert.equal(reverseSourceObject, expectedRollbackSourceObject);
    assert.equal(reverseTestObject, expectedRollbackTestObject);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }

    runGit(['apply', '--whitespace=nowarn'], { cwd: tempRoot, input: patch });
    forwardSourceObject = gitObject(readFileSync(resolve(tempRoot, sourcePath)), tempRoot);
    forwardTestObject = gitObject(readFileSync(resolve(tempRoot, testPath)), tempRoot);
    assert.equal(forwardSourceObject, currentSourceObject);
    assert.equal(forwardTestObject, currentTestObject);
    for (const [path, expectedObject] of protectedObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }
    assert.deepEqual(readFileSync(outsideA), outsideABytes);
    assert.deepEqual(readFileSync(outsideB), outsideBBytes);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }

  const excludedAfter = excludedSnapshot();
  console.log(`[BUG022-C40] currentSource=${currentSourceObject}`);
  console.log(`[BUG022-C40] currentTest=${currentTestObject}`);
  console.log(`[BUG022-C40] reverseSource=${reverseSourceObject}`);
  console.log(`[BUG022-C40] reverseTest=${reverseTestObject}`);
  console.log(`[BUG022-C40] forwardSource=${forwardSourceObject}`);
  console.log(`[BUG022-C40] forwardTest=${forwardTestObject}`);
  console.log(`[BUG022-C40] mutationControls=${mutationControls.join(',')}`);
  console.log(`[BUG022-C40] ratchetEntries=${currentCrossings.length}`);
  console.log(`[BUG022-C40] ratchetSha256=${sha256(Buffer.from(JSON.stringify(currentCrossings)))}`);
  console.log(`[BUG022-C40] excludedStable=${JSON.stringify(excludedAfter) === JSON.stringify(excludedBefore)}`);
  console.log(`[BUG022-C40] fixtureResidue=${existsSync(tempRoot) || existsSync(outsideRoot)}`);

  assert.deepEqual(excludedAfter, excludedBefore);
  assert.equal(existsSync(tempRoot), false);
  assert.equal(existsSync(outsideRoot), false);
});

test('Regression: BUG-022 security repair contains exactly the validator and focused carrier', async () => {
  const { createHash } = await import('node:crypto');
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const allowed = [sourcePath, testPath];
  const protectedFamilies = [
    ['baseline', 'scripts/validate-test-file-reachability.baseline'],
    ['spec-path-baseline', 'scripts/validate-spec-test-paths.baseline'],
    ['registry', '.specify/memory/agents.md'],
    ['historical-report', 'specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md'],
    ['bug017', 'specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/state.json'],
    ['bug019', 'specs/_bugs/BUG-019-fixture/state.json'],
    ['market', 'market-brief.html'],
    ['tool-brief', 'tests/tool-brief-v2.unit.mjs'],
    ['probe', 'tests/zz-probe-focusable.spec.mjs'],
    ['company-intelligence', 'scripts/company-intelligence-publication.mjs'],
    ['framework', '.github/bubbles/scripts/cli.sh'],
    ['config', 'playwright.config.mjs'],
    ['detached-worktree-control', '.bubbles-worktree']
  ];
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');

  function runGit(args, { cwd = ROOT, input } = {}) {
    const execution = spawnSync('git', args, { cwd, input, timeout: 30000 });
    assert.equal(execution.signal, null, `git ${args.join(' ')} was interrupted`);
    assert.equal(execution.status, 0, `git ${args.join(' ')} failed\n${execution.stderr?.toString('utf8') ?? ''}`);
    return execution.stdout;
  }

  const gitObject = (bytes, cwd = ROOT) => runGit(['hash-object', '--stdin'], {
    cwd,
    input: bytes
  }).toString('utf8').trim();
  const boundaryVerdict = (paths) => {
    const actual = [...new Set(paths)].sort();
    const unexpected = actual.filter((path) => !allowed.includes(path));
    const missing = allowed.filter((path) => !actual.includes(path));
    return { actual, missing, ok: unexpected.length === 0 && missing.length === 0, unexpected };
  };
  const excludedCategory = (path) => {
    if (path === 'scripts/validate-playwright-cost-ratio.mjs' || path === 'scripts/selftest.mjs') {
      return 'shared-concurrent-validator';
    }
    if (path === 'scripts/validate-spec-test-paths.baseline') return 'bug022-c59-test-ratchet';
    if (path.startsWith('specs/_bugs/BUG-017-')) return 'bug017';
    if (path.startsWith('specs/_bugs/BUG-019-')) return 'bug019';
    if (path.startsWith('specs/_bugs/BUG-022-')) return 'bug022-foreign-artifact';
    if (path.startsWith('specs/028-company-intelligence-') || path.includes('company-intelligence')) return 'company-intelligence';
    if (path.startsWith('specs/')) return 'concurrent-spec';
    if (path === '.bubbles-worktree') return 'detached-worktree-control';
    if (path.startsWith('.github/bubbles/') || path.startsWith('.github/agents/bubbles')) return 'framework';
    if (path === 'market-brief.config.json' || path === 'market-brief.html') return 'market';
    if (path === 'rlbrief.js' || path === 'rlmarketaction.js') return 'market';
    if (
      path === 'scripts/brief-author.mjs'
      || path === 'scripts/brief-narrative-parallel.mjs'
      || path === 'scripts/brief-publication.mjs'
      || path === 'scripts/brief-refresh.mjs'
    ) return 'market';
    if (path === 'scripts/web-evidence-acquire.mjs') return 'market';
    if (path.startsWith('tests/fixtures/feature-012/tool-brief-v2/')) return 'tool-brief';
    if (path.startsWith('tests/tool-brief-v2')) return 'tool-brief';
    if (path === 'tests/zz-probe-focusable.spec.mjs') return 'probe';
    return null;
  };

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
        rows.push(`file ${relativePath} ${sha256(readFileSync(absolutePath))}`);
      } catch {
        rows.push(`missing ${relativePath}`);
      }
    }
  }

  const currentSource = readFileSync(resolve(ROOT, sourcePath));
  const currentTest = readFileSync(resolve(ROOT, testPath));
  const rollbackSource = Buffer.from(securityRollbackSource(currentSource.toString('utf8')), 'utf8');
  const rollbackTest = Buffer.from(securityRollbackTest(currentTest.toString('utf8')), 'utf8');
  const currentObjects = new Map([
    [sourcePath, gitObject(currentSource)],
    [testPath, gitObject(currentTest)]
  ]);
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c41-'));
  const outsideRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c41-outside-'));
  const outsideSentinels = [
    [resolve(outsideRoot, 'baseline.sentinel'), Buffer.from('C41 baseline sentinel\n')],
    [resolve(outsideRoot, 'tests.sentinel'), Buffer.from('C41 tests sentinel\n')]
  ];
  for (const [path, bytes] of outsideSentinels) writeFileSync(path, bytes);

  const statusBefore = runGit(['status', '--porcelain=v1', '-z', '--untracked-files=all']).toString('utf8');
  const worktreesBefore = runGit(['worktree', 'list', '--porcelain']).toString('utf8');
  const dirtyPaths = statusBefore.split('\0').filter(Boolean).map((entry) => entry.slice(3)).sort();
  const authorizedDirty = dirtyPaths.filter((path) => allowed.includes(path));
  const excludedDirty = dirtyPaths.filter((path) => !allowed.includes(path));
  const classifiedExcluded = excludedDirty.map((path) => ({ category: excludedCategory(path), path }));
  const unexpectedDirty = classifiedExcluded.filter((entry) => entry.category === null);
  const excludedBefore = [];
  for (const { path } of classifiedExcluded) snapshotPath(path, excludedBefore);
  const stagedPaths = runGit(['diff', '--cached', '--name-only', '-z']).toString('utf8').split('\0').filter(Boolean);
  let changedPaths = [];
  let processResidue = [];

  try {
    runGit(['init', '-q'], { cwd: tempRoot });
    for (const [path, bytes] of [[sourcePath, rollbackSource], [testPath, rollbackTest]]) {
      mkdirSync(dirname(resolve(tempRoot, path)), { recursive: true });
      writeFileSync(resolve(tempRoot, path), bytes);
    }
    runGit(['add', '--', ...allowed], { cwd: tempRoot });
    writeFileSync(resolve(tempRoot, sourcePath), currentSource);
    writeFileSync(resolve(tempRoot, testPath), currentTest);
    changedPaths = runGit(['diff', '--name-only', '-z'], { cwd: tempRoot })
      .toString('utf8').split('\0').filter(Boolean).sort();
    const repairedVerdict = boundaryVerdict(changedPaths);
    assert.equal(repairedVerdict.ok, true, JSON.stringify(repairedVerdict));
    for (const [family, protectedPath] of protectedFamilies) {
      const negative = boundaryVerdict([...changedPaths, protectedPath]);
      assert.equal(negative.ok, false, `${family} mutation did not turn boundary RED`);
      assert.deepEqual(negative.unexpected, [protectedPath], `${family} refusal lost exact provenance`);
      console.log(`[BUG022-C41-NEGATIVE] family=${family} path=${protectedPath} verdict=RED`);
    }
    for (const [path, expectedObject] of currentObjects) {
      assert.equal(gitObject(readFileSync(resolve(tempRoot, path)), tempRoot), expectedObject);
    }
    for (const [path, bytes] of outsideSentinels) assert.deepEqual(readFileSync(path), bytes);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
    rmSync(outsideRoot, { recursive: true, force: true });
  }

  const excludedAfter = [];
  for (const { path } of classifiedExcluded) snapshotPath(path, excludedAfter);
  const statusAfter = runGit(['status', '--porcelain=v1', '-z', '--untracked-files=all']).toString('utf8');
  const worktreesAfter = runGit(['worktree', 'list', '--porcelain']).toString('utf8');
  const processScan = spawnSync('/bin/ps', ['-axo', 'pid=,ppid=,command='], {
    encoding: 'utf8',
    timeout: 30000
  });
  assert.equal(processScan.status, 0, processScan.stderr);
  processResidue = processScan.stdout.split('\n').filter((line) => (
    line.includes(tempRoot) || line.includes(outsideRoot)
  ));

  console.log(`[BUG022-C41] changedPaths=${changedPaths.join(',')}`);
  console.log(`[BUG022-C41] authorizedDirty=${authorizedDirty.join(',')}`);
  console.log(`[BUG022-C41] excludedCategories=${[...new Set(classifiedExcluded.map((entry) => entry.category))].sort().join(',')}`);
  console.log(`[BUG022-C41] unexpectedDirty=${unexpectedDirty.length}`);
  console.log(`[BUG022-C41] stagedPaths=${stagedPaths.length}`);
  console.log(`[BUG022-C41] excludedStable=${JSON.stringify(excludedAfter) === JSON.stringify(excludedBefore)}`);
  console.log(`[BUG022-C41] statusStable=${statusAfter === statusBefore}`);
  console.log(`[BUG022-C41] worktreesStable=${worktreesAfter === worktreesBefore}`);
  console.log(`[BUG022-C41] fixtureResidue=${existsSync(tempRoot) || existsSync(outsideRoot)}`);
  console.log(`[BUG022-C41] processResidue=${processResidue.length}`);

  assert.deepEqual(changedPaths, allowed.slice().sort());
  assert.deepEqual(authorizedDirty, allowed.slice().sort());
  assert.deepEqual(unexpectedDirty, []);
  assert.deepEqual(stagedPaths, []);
  assert.deepEqual(excludedAfter, excludedBefore);
  assert.equal(statusAfter, statusBefore);
  assert.equal(worktreesAfter, worktreesBefore);
  assert.equal(existsSync(tempRoot), false);
  assert.equal(existsSync(outsideRoot), false);
  assert.deepEqual(processResidue, []);
});

// BUG022_R4_FINAL_SHAPE_INTEGRITY_BEGIN
function finalShapeRollbackTest(current) {
  let source = securityRemoveMarkedBlock(
    c55RollbackTest(current),
    'BUG022_R4_FINAL_SHAPE_' + 'MATRIX',
    'final-shape aggregate matrix'
  );
  source = securityRemoveMarkedBlock(
    source,
    'BUG022_R4_FINAL_SHAPE_' + 'INTEGRITY',
    'final-shape integrity carriers'
  );
  source = securityReplaceExactly(
    source,
    [
      'function securityRollbackTest(current) {',
      "  let source = current.includes('// BUG022_R4_FINAL_SHAPE_MATRIX_BEGIN')",
      '    ? finalShapeRollbackTest(current)',
      '    : current;',
      '  source = securityRemoveMarkedBlock(',
      '    source,'
    ].join('\n'),
    [
      'function securityRollbackTest(current) {',
      '  let source = securityRemoveMarkedBlock(',
      '    current,'
    ].join('\n'),
    'final-shape security test rollback compatibility'
  );
  source = securityReplaceExactly(
    source,
    [
      'function securityRollbackSource(current) {',
      "  let source = current.includes('const PERL_ALARM_SCRIPT = ')",
      '    ? finalShapeRollbackSource(current)',
      '    : current;',
      '  source = securityReplaceRange(',
      '    source,'
    ].join('\n'),
    [
      'function securityRollbackSource(current) {',
      '  let source = securityReplaceRange(',
      '    current,'
    ].join('\n'),
    'final-shape security source rollback compatibility'
  );
  return source;
}

function finalShapeRollbackSource(current) {
  let source = securityReplaceExactly(
    c55RollbackSource(current),
    'const PERL_ALARM_SCRIPT = /^alarm shift @ARGV; exec @ARGV(?: or die "exec failed: \\$!\\\\n")?$/;\n',
    '',
    'final-shape Perl grammar declaration'
  );

  const historicalLexer = [
    'function javascriptLexicalTokens(source) {',
    '  const tokens = [];',
    '  let index = 0;',
    '',
    '  while (index < source.length) {',
    '    const character = source[index];',
    '    const next = source[index + 1];',
    '    if (/\\s/.test(character)) {',
    '      index++;',
    '      continue;',
    '    }',
    "    if (character === '/' && next === '/') {",
    '      index += 2;',
    "      while (index < source.length && source[index] !== '\\n') index++;",
    '      continue;',
    '    }',
    "    if (character === '/' && next === '*') {",
    '      index += 2;',
    "      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) index++;",
    '      index = Math.min(source.length, index + 2);',
    '      continue;',
    '    }',
    `    if (character === "'" || character === '"') {`,
    '      const quote = character;',
    "      let value = '';",
    '      index++;',
    '      while (index < source.length) {',
    '        const current = source[index++];',
    "        if (current === '\\\\') {",
    '          if (index < source.length) value += source[index++];',
    '          continue;',
    '        }',
    '        if (current === quote) break;',
    '        value += current;',
    '      }',
    "      tokens.push({ type: 'string', value });",
    '      continue;',
    '    }',
    "    if (character === '`') {",
    '      index++;',
    '      while (index < source.length) {',
    '        const current = source[index++];',
    "        if (current === '\\\\') {",
    '          index++;',
    '          continue;',
    '        }',
    "        if (current === '`') break;",
    '      }',
    "      tokens.push({ type: 'template', value: '' });",
    '      continue;',
    '    }',
    '    if (/[A-Za-z_$]/.test(character)) {',
    '      const start = index++;',
    '      while (index < source.length && /[A-Za-z0-9_$]/.test(source[index])) index++;',
    "      tokens.push({ type: 'identifier', value: source.slice(start, index) });",
    '      continue;',
    '    }',
    "    tokens.push({ type: 'punctuator', value: character });",
    '    index++;',
    '  }',
    '  return tokens;',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'const REGEX_PREFIX_PUNCTUATORS = new Set([',
    'function containsNodeTestRegistration(source) {',
    historicalLexer,
    'final-shape JavaScript lexer'
  );
  source = securityReplaceExactly(
    source,
    "      if (tokens[cursor]?.value === ';') break;",
    "      if (tokens[cursor]?.value === ';' || tokens[cursor]?.value === '{' || tokens[cursor]?.value === '}') break;",
    'final-shape named static import traversal'
  );

  const historicalTraversal = [
    'function listFilesRecursive(absDir, ignored) {',
    '  const found = [];',
    '  let entries;',
    '  try { entries = readdirSync(absDir, { withFileTypes: true }); } catch { return found; }',
    '  for (const entry of entries) {',
    '    const abs = join(absDir, entry.name);',
    '    if (entry.isDirectory()) {',
    '      if (ignored.some((matcher) => matcher.test(entry.name))) continue;',
    '      found.push(...listFilesRecursive(abs, ignored));',
    '    } else if (entry.isFile()) {',
    '      found.push(abs);',
    '    }',
    '  }',
    '  return found;',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'function listFilesRecursive(root, absDir, ignored, visited = new Set()) {',
    'function artifactRole(artifact) {',
    historicalTraversal,
    'final-shape repository traversal'
  );

  const historicalPresentation = [
    'function commandCandidateFragments(line) {',
    '  const trimmed = line.trim();',
    "  if (trimmed === '') return [];",
    '',
    '  let fragments;',
    "  if (trimmed.startsWith('|')) {",
    "    const cells = trimmed.split('|').slice(1);",
    "    if (cells[cells.length - 1]?.trim() === '') cells.pop();",
    '    fragments = cells.map((text) => ({',
    "      presentation: 'table-cell',",
    '      text',
    '    }));',
    '  } else {',
    '    const labelled = /^(?:\\*\\*)?(?:command|executed):(?:\\*\\*)?[ \\t]*(.*)$/i.exec(trimmed);',
    '    const listed = /^(?:[-+*]|\\d+[.)])[ \\t]+(.*)$/.exec(trimmed);',
    '    fragments = [{',
    "      presentation: labelled ? 'command-label' : listed ? 'markdown-list' : 'direct',",
    '      text: labelled ? labelled[1] : listed ? listed[1] : trimmed',
    '    }];',
    '  }',
    '',
    '  return fragments.flatMap(({ presentation, text }) => {',
    '    const presented = text.trim();',
    '    const codeSpans = [];',
    '    let codeSpanCoversPresentation = false;',
    '    let scanFrom = 0;',
    '    while (scanFrom < presented.length) {',
    "      const openingIndex = presented.indexOf('`', scanFrom);",
    '      if (openingIndex < 0) break;',
    '      let openingEnd = openingIndex;',
    "      while (presented[openingEnd] === '`') openingEnd++;",
    '      const delimiter = presented.slice(openingIndex, openingEnd);',
    '      const closingIndex = presented.indexOf(delimiter, openingEnd);',
    '      if (closingIndex < 0) break;',
    '      codeSpans.push(presented.slice(openingEnd, closingIndex).trim());',
    '      if (openingIndex === 0 && closingIndex + delimiter.length === presented.length) {',
    '        codeSpanCoversPresentation = true;',
    '      }',
    '      scanFrom = closingIndex + delimiter.length;',
    '    }',
    '',
    "    const codeSpansAreCommands = presentation === 'table-cell'",
    "      || presentation === 'command-label'",
    "      || (presentation === 'markdown-list' && codeSpanCoversPresentation)",
    "      || (presentation === 'direct' && presented.startsWith('`'));",
    '    const commands = codeSpans.length > 0 && codeSpansAreCommands',
    '      ? codeSpans',
    '      : [presented];',
    '    return commands.map((rawCommand) => {',
    '      let command = rawCommand;',
    "      command = command.replace(/^\\$[ \\t]+/, '');",
    '      return { presentation, text: command };',
    "    }).filter(({ text: command }) => command !== '');",
    '  });',
    '}',
    '',
    ''
  ].join('\n');
  source = securityReplaceRange(
    source,
    'function splitMarkdownTableCells(line) {',
    'export function parseNodeTestCommandCandidates(line) {',
    historicalPresentation,
    'final-shape Markdown presentation parser'
  );
  source = securityReplaceExactly(
    source,
    '      || !PERL_ALARM_SCRIPT.test(script)',
    '      || !/^alarm shift @ARGV; exec @ARGV(?: or die .+)?$/.test(script)',
    'final-shape Perl alarm decision'
  );
  source = securityReplaceExactly(
    source,
    [
      '  let index = commandTokenIndex(tokens, prefixIssues);',
      "  if (prefixIssues.length > 0 && command.includes('--test') && rawTestArguments.length > 0) {",
      '    return { issues: [...new Set(prefixIssues)], testArguments: rawTestArguments };',
      '  }'
    ].join('\n'),
    '  let index = commandTokenIndex(tokens, prefixIssues);',
    'final-shape wrapper issue precedence'
  );
  source = securityReplaceExactly(
    source,
    '    const explicitOneTokenWrapper = nodeTokenIndex === 1;',
    [
      '    const explicitOneTokenWrapper = (',
      "      presentation === 'command-label' || presentation === 'table-cell'",
      '    ) && nodeTokenIndex === 1;'
    ].join('\n'),
    'final-shape role-neutral wrapper decision'
  );
  source = securityReplaceExactly(
    source,
    '  const ambiguityIssues = shellAmbiguityIssues(command);',
    [
      '  if (prefixIssues.length > 0) return { issues: [...new Set(prefixIssues)], testArguments: rawTestArguments };',
      '  const ambiguityIssues = shellAmbiguityIssues(command);'
    ].join('\n'),
    'historical wrapper issue placement'
  );
  source = securityReplaceExactly(
    source,
    '  for (const abs of listFilesRecursive(root, root, ignored).sort()) {',
    '  for (const abs of listFilesRecursive(root, ignored).sort()) {',
    'final-shape traversal call'
  );
  source = securityReplaceExactly(
    source,
    [
      '    const artifactRoleValue = artifactRole(artifact);',
      '    if (',
      '      artifactRoleValue === ARTIFACT_ROLE.UNKNOWN',
      '      && /\\.(?:[cm]?js|jsx|[cm]?ts|tsx)$/.test(artifact)',
      '    ) continue;',
      '    if (artifactRoleValue === ARTIFACT_ROLE.STRUCTURED_TEST_PLAN) {'
    ].join('\n'),
    [
      '    const artifactRoleValue = artifactRole(artifact);',
      "    if (artifactRoleValue === ARTIFACT_ROLE.UNKNOWN && !artifact.endsWith('.md')) continue;",
      '    if (artifactRoleValue === ARTIFACT_ROLE.STRUCTURED_TEST_PLAN) {'
    ].join('\n'),
    'historical non-Markdown role gate'
  );
  return source;
}

test('Regression: SCN-BUG022-007 final-shape repair rollback preserves source test ratchets and history', async () => {
  const sourcePath = 'scripts/validate-test-file-reachability.mjs';
  const testPath = 'tests/playwright-runtime.foundation.functional.mjs';
  const baselinePath = 'scripts/validate-test-file-reachability.baseline';
  const specPathBaselinePath = 'scripts/validate-spec-test-paths.baseline';
  const registryPath = '.specify/memory/agents.md';
  const protectedReportPath = 'specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md';
  const currentSource = readFileSync(resolve(ROOT, sourcePath));
  const currentTest = readFileSync(resolve(ROOT, testPath));
  const rollbackSource = Buffer.from(finalShapeRollbackSource(currentSource.toString('utf8')), 'utf8');
  const rollbackTest = Buffer.from(finalShapeRollbackTest(currentTest.toString('utf8')), 'utf8');
  const protectedBytes = new Map([
    [baselinePath, readFileSync(resolve(ROOT, baselinePath))],
    [specPathBaselinePath, readFileSync(resolve(ROOT, specPathBaselinePath))],
    [registryPath, readFileSync(resolve(ROOT, registryPath))],
    [protectedReportPath, readFileSync(resolve(ROOT, protectedReportPath))]
  ]);
  const tempRoot = mkdtempSync(resolve(tmpdir(), 'research-lab-bug022-c57-'));
  const expectedRollbackObjects = [
    '00852d9064e96c1625b243c2650963b3df3aa146',
    'f6748a2ec92c373772e735c28216cff15826fd65'
  ];

  const runGit = (args, input) => {
    const execution = spawnSync('git', args, { cwd: tempRoot, input, timeout: 30000 });
    assert.equal(execution.signal, null, `git ${args.join(' ')} was interrupted`);
    assert.equal(execution.status, 0, execution.stderr?.toString('utf8') ?? '');
    return execution.stdout;
  };
  const gitObject = (bytes) => spawnSync('git', ['hash-object', '--stdin'], {
    cwd: ROOT,
    input: bytes,
    timeout: 30000
  }).stdout.toString('utf8').trim();
  const currentObjects = [gitObject(currentSource), gitObject(currentTest)];
  const rollbackObjects = [gitObject(rollbackSource), gitObject(rollbackTest)];
  assert.deepEqual(rollbackObjects, expectedRollbackObjects);
  let reverseObjects;
  let forwardObjects;

  try {
    runGit(['init', '-q']);
    for (const [path, bytes] of [
      [sourcePath, rollbackSource],
      [testPath, rollbackTest],
      ...protectedBytes
    ]) {
      mkdirSync(dirname(resolve(tempRoot, path)), { recursive: true });
      writeFileSync(resolve(tempRoot, path), bytes);
    }
    runGit(['add', '--', sourcePath, testPath, ...protectedBytes.keys()]);
    writeFileSync(resolve(tempRoot, sourcePath), currentSource);
    writeFileSync(resolve(tempRoot, testPath), currentTest);
    const changed = runGit(['diff', '--name-only', '--', sourcePath, testPath])
      .toString('utf8').trim().split(/\r?\n/).filter(Boolean).sort();
    assert.deepEqual(changed, [sourcePath, testPath]);
    const patch = runGit(['diff', '--binary', '--', sourcePath, testPath]);
    runGit(['apply', '--reverse', '--whitespace=nowarn'], patch);
    reverseObjects = [sourcePath, testPath].map((path) => gitObject(readFileSync(resolve(tempRoot, path))));
    assert.deepEqual(reverseObjects, rollbackObjects);
    for (const [path, bytes] of protectedBytes) assert.deepEqual(readFileSync(resolve(tempRoot, path)), bytes);
    runGit(['apply', '--whitespace=nowarn'], patch);
    forwardObjects = [sourcePath, testPath].map((path) => gitObject(readFileSync(resolve(tempRoot, path))));
    assert.deepEqual(forwardObjects, currentObjects);
    for (const [path, bytes] of protectedBytes) assert.deepEqual(readFileSync(resolve(tempRoot, path)), bytes);
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }

  console.log(`[BUG022-C57] rollbackObjects=${rollbackObjects.join(',')}`);
  console.log(`[BUG022-C57] currentObjects=${currentObjects.join(',')}`);
  console.log(`[BUG022-C57] reverseObjects=${reverseObjects.join(',')}`);
  console.log(`[BUG022-C57] forwardObjects=${forwardObjects.join(',')}`);
  console.log(`[BUG022-C57] protectedObjects=${protectedBytes.size}`);
  console.log(`[BUG022-C57] fixtureResidue=${existsSync(tempRoot)}`);
  assert.equal(existsSync(tempRoot), false);
});

test('Regression: BUG-022 final-shape repair contains exactly the validator and focused carrier', () => {
  const allowed = [
    'scripts/validate-test-file-reachability.mjs',
    'tests/playwright-runtime.foundation.functional.mjs'
  ].sort();
  const protectedFamilies = [
    ['baseline', 'scripts/validate-test-file-reachability.baseline'],
    ['spec-path-baseline', 'scripts/validate-spec-test-paths.baseline'],
    ['registry', '.specify/memory/agents.md'],
    ['bug017', 'specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/state.json'],
    ['bug020', 'specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite/state.json'],
    ['bug022-planning', 'specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md'],
    ['market', 'market-brief.html'],
    ['tool-brief', 'tests/tool-brief-v2.unit.mjs'],
    ['feature029', 'specs/029-shock-transmission-foundation-and-lab/spec.md'],
    ['feature030', 'specs/030-budget-aware-hybrid-brief-generation/spec.md'],
    ['company-intelligence', 'scripts/company-intelligence-publication.mjs'],
    ['framework', '.github/bubbles/scripts/cli.sh'],
    ['worktree-control', '.bubbles-worktree']
  ];
  const verdict = (paths) => {
    const actual = [...new Set(paths)].sort();
    return {
      actual,
      missing: allowed.filter((path) => !actual.includes(path)),
      unexpected: actual.filter((path) => !allowed.includes(path))
    };
  };
  const current = verdict(allowed);
  assert.deepEqual(current.missing, []);
  assert.deepEqual(current.unexpected, []);
  for (const [family, path] of protectedFamilies) {
    const mutant = verdict([...allowed, path]);
    assert.deepEqual(mutant.unexpected, [path], `${family} mutation escaped the boundary`);
    console.log(`[BUG022-C60-NEGATIVE] family=${family} path=${path} verdict=RED`);
  }
  const staged = spawnSync('git', ['diff', '--cached', '--name-only', '-z'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000
  });
  assert.equal(staged.status, 0, staged.stderr);
  const processScan = spawnSync('/bin/ps', ['-axo', 'pid=,ppid=,command='], {
    encoding: 'utf8',
    timeout: 30000
  });
  assert.equal(processScan.status, 0, processScan.stderr);
  const residue = processScan.stdout.split('\n').filter((line) => (
    line.includes('research-lab-bug022-c56-') || line.includes('research-lab-bug022-c57-')
  ));
  console.log(`[BUG022-C60] implementationPaths=${current.actual.join(',')}`);
  console.log(`[BUG022-C60] protectedMutants=${protectedFamilies.length}`);
  console.log(`[BUG022-C60] stagedPaths=${staged.stdout.split('\0').filter(Boolean).length}`);
  console.log(`[BUG022-C60] processResidue=${residue.length}`);
  assert.deepEqual(staged.stdout.split('\0').filter(Boolean), []);
  assert.deepEqual(residue, []);
});
// BUG022_R4_FINAL_SHAPE_INTEGRITY_END
// BUG022_R4_SECURITY_INTEGRITY_CARRIERS_END

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