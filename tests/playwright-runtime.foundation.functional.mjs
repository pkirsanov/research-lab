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
import * as sharedRuntime from './playwright-runtime.mjs';

const ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const HELPER = resolve(ROOT, 'tests/playwright-runtime.mjs');
const LOCAL_PACKAGE = realpathSync(resolve(ROOT, 'node_modules/playwright'));
const LOCAL_CLI = realpathSync(resolve(ROOT, 'node_modules/.bin/playwright'));
const EXPECTED_BROWSER_SPEC_PATHS = [
  'tests/attention-browser.spec.mjs',
  'tests/bond-regime-lab.spec.mjs',
  'tests/brief-payload-escaping.spec.mjs',
  'tests/causal-rotation-lab.spec.mjs',
  'tests/company-fundamentals-lab.spec.mjs',
  'tests/contextual-tooltip.spec.mjs',
  'tests/deployed-site-parity.spec.mjs',
  'tests/distributed-briefs.spec.mjs',
  'tests/fx-regime-relative-value-lab.spec.mjs',
  'tests/journey-mobile.spec.mjs',
  'tests/journey.spec.mjs',
  'tests/market-action-center.spec.mjs',
  'tests/market-brief-freshness.spec.mjs',
  'tests/market-brief-scorecard.spec.mjs',
  'tests/market-brief-session-date-drift.spec.mjs',
  'tests/market-heatmap-control-surface.spec.mjs',
  'tests/msft-july-market-refresh.spec.mjs',
  'tests/palm-springs-rental-market-lab.spec.mjs',
  'tests/portfolio-survival-foundation.spec.mjs',
  'tests/provider-credentials.spec.mjs',
  'tests/provider-fallback-status.spec.mjs',
  'tests/red-alert.spec.mjs',
  'tests/simple-model-adapters-macro-fundamental.spec.mjs',
  'tests/simple-model-adapters-market.spec.mjs',
  'tests/simple-model-adapters-strategy-property.spec.mjs',
  'tests/simple-models.spec.mjs',
  'tests/simple-production-wiring.spec.mjs',
  'tests/technical-analysis-decision-lab.spec.mjs',
  'tests/tool-discovery.spec.mjs',
  'tests/tool-experience-mobile.spec.mjs',
  'tests/tool-experience.spec.mjs',
  'tests/trend-dynamics-cycle-lab.spec.mjs',
  'tests/volatility-sizing-lab.spec.mjs',
  'tests/web-evidence.spec.mjs'
];
const EXPECTED_NODE_SUITE_PATHS = [
  'tests/attention-payload-contract.test.mjs',
  'tests/brief-d16-direction-aware-publish-gate.test.mjs',
  'tests/brief-refresh-atomicity.test.mjs',
  'tests/feature-004-brief-eligibility.test.mjs',
  'tests/feature-004-collision-invariant.test.mjs',
  'tests/feature-004-journey-evidence-refresh.test.mjs',
  'tests/feature-004-tool-control-binding.test.mjs',
  'tests/feature-004-vehicle-universe.test.mjs',
  'tests/rlattention.test.mjs'
];

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
  const testsDir = resolve(ROOT, 'tests');
  const testFileNames = readdirSync(testsDir);
  const specPaths = testFileNames
    .filter((name) => name.endsWith('.spec.mjs'))
    .sort()
    .map((name) => resolve(testsDir, name));
  const nodeTestNames = testFileNames
    .filter((name) => name.endsWith('.test.mjs'))
    .sort();
  const importers = [];
  const absoluteOverrides = [];

  for (const specPath of specPaths) {
    const source = readFileSync(specPath, 'utf8');
    if (source.includes("from './playwright-runtime.mjs'")) importers.push(specPath);
    if (source.includes('executablePath')) absoluteOverrides.push(specPath);
  }

  console.log('[playwright-runtime] discoveredSpecs=' + specPaths.length);
  console.log('[playwright-runtime] excludedNodeSuites=' + nodeTestNames.length);
  console.log('[playwright-runtime] sharedImporters=' + importers.length);
  console.log('[playwright-runtime] absoluteOverrides=' + absoluteOverrides.length);
  for (const specPath of importers) {
    console.log('[playwright-runtime] importer=' + specPath.slice(ROOT.length + 1));
  }
  assert.equal(specPaths.length, 34);
  assert.deepEqual(
    specPaths.map((specPath) => specPath.slice(ROOT.length + 1)),
    EXPECTED_BROWSER_SPEC_PATHS
  );
  assert.deepEqual(
    nodeTestNames.map((nodeTestName) => `tests/${nodeTestName}`),
    EXPECTED_NODE_SUITE_PATHS
  );
  assert.deepEqual(importers, specPaths);
  assert.deepEqual(absoluteOverrides, []);
});

test('committed discovery boundary keeps browser specs and direct Node suites disjoint', () => {
  const testsDir = resolve(ROOT, 'tests');
  const testFileNames = readdirSync(testsDir);
  const browserSpecNames = testFileNames
    .filter((name) => name.endsWith('.spec.mjs'))
    .sort();
  const nodeSuiteNames = testFileNames
    .filter((name) => name.endsWith('.test.mjs'))
    .sort();

  assert.equal(playwrightConfig.testMatch, '**/*.spec.mjs');
  assert.deepEqual(
    browserSpecNames.map((browserSpecName) => `tests/${browserSpecName}`),
    EXPECTED_BROWSER_SPEC_PATHS
  );
  assert.deepEqual(
    nodeSuiteNames.map((nodeSuiteName) => `tests/${nodeSuiteName}`),
    EXPECTED_NODE_SUITE_PATHS
  );

  for (const browserSpecName of browserSpecNames) {
    const source = readFileSync(resolve(testsDir, browserSpecName), 'utf8');
    assert.match(
      source,
      /from\s+['"]\.\/playwright-runtime\.mjs['"]/,
      `${browserSpecName} must import the shared Playwright runtime`
    );
  }

  for (const nodeSuiteName of nodeSuiteNames) {
    const source = readFileSync(resolve(testsDir, nodeSuiteName), 'utf8');
    assert.match(
      source,
      /(?:from\s+['"]node:test['"]|import\(\s*['"]node:test['"]\s*\))/,
      `${nodeSuiteName} must use node:test`
    );
    assert.doesNotMatch(
      source,
      /from\s+['"](?:playwright\/test|\.\/playwright-runtime\.mjs)['"]/,
      `${nodeSuiteName} must remain direct-node-only`
    );
  }

  console.log('[playwright-runtime] matcher=' + playwrightConfig.testMatch);
  console.log('[playwright-runtime] browserInventory=' + browserSpecNames.length);
  console.log('[playwright-runtime] directNodeInventory=' + nodeSuiteNames.length);
  console.log('[playwright-runtime] discoveryTaxonomy=PASS');
});