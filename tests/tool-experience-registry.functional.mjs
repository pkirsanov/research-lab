import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  addValidOrdinaryTool,
  clone,
  expectError,
  loadProductionApi,
  makeJourneyDefinition,
  makeModelDefinition,
  makeTool,
  readJson,
  readProductionSource
} from './tool-experience.support.mjs';

const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCOPE_ARTIFACTS = Object.freeze([
  'tool-experience.config.json',
  'simple-models.json',
  'journeys.json',
  'rlexperience.js',
  'scripts/validate-tool-experience.mjs',
  'tests/tool-experience.unit.mjs',
  'tests/tool-experience-registry.functional.mjs',
  'tests/tool-experience.spec.mjs',
  'tests/tool-experience.support.mjs',
  'tools.json',
  'scripts/selftest.mjs'
]);
const NEW_SCOPE_ARTIFACTS = Object.freeze(SCOPE_ARTIFACTS.filter((relativePath) => ![
  'tools.json',
  'scripts/selftest.mjs'
].includes(relativePath)));
const STATIC_PROTECTED_PATHS = Object.freeze([
  'rldata.js',
  'rlviews.js',
  'rlapp.js',
  'rlbrief.js',
  'rlg.js',
  'rlticker.js',
  'rlchart.js',
  'market-brief.config.json',
  'watchlist.json',
  'scripts/fetch-options.mjs'
]);
const SELFTEST_BLOCK_START = '/* ---------- Feature 012 Scope 01: contract/config/registry foundation ---------- */';
const SELFTEST_SUMMARY_START = '/* ---------- summary ---------- */';
const EXACT_REPLAY_CHILD = 'RL_SCOPE01_EXACT_REPLAY_CHILD';
const RED_PRODUCTION_ARTIFACTS = Object.freeze([
  'tool-experience.config.json',
  'simple-models.json',
  'journeys.json',
  'rlexperience.js',
  'scripts/validate-tool-experience.mjs'
]);
const SANDBOX_PROBE_SOURCE = String.raw`import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2]);
const required = [
  'tool-experience.config.json',
  'simple-models.json',
  'journeys.json',
  'rlexperience.js',
  'scripts/validate-tool-experience.mjs'
];
const missingContracts = required.filter((relativePath) => !existsSync(resolve(root, relativePath)));
let missingRegistryExperiences = -1;
try {
  const registry = JSON.parse(readFileSync(resolve(root, 'tools.json'), 'utf8'));
  missingRegistryExperiences = registry.tools.filter((tool) => !Object.hasOwn(tool, 'experience')).length;
} catch {
  missingRegistryExperiences = -1;
}

if (missingContracts.length > 0 || missingRegistryExperiences !== 0) {
  console.error(
    '[scope01-sandbox-probe] RED missing-contract=' +
    (missingContracts.join(',') || 'none') +
    ' missing-registry-experience=' + missingRegistryExperiences
  );
  process.exit(17);
}

try {
  const validatorUrl = pathToFileURL(resolve(root, 'scripts/validate-tool-experience.mjs')).href;
  const validator = await import(validatorUrl);
  const result = validator.validateActualToolExperience();
  console.log(
    '[scope01-sandbox-probe] GREEN tools=' + result.summary.toolCount +
    ' models=' + result.summary.simpleModelDefinitionCount +
    ' journeys=' + result.summary.journeyDefinitionCount +
    ' adversarial=' + result.adversarial.length
  );
} catch (error) {
  console.error('[scope01-sandbox-probe] FAIL ' + (error instanceof Error ? error.message : String(error)));
  process.exit(18);
}`;

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function listFiles(relativeDirectory) {
  const absoluteDirectory = join(REPOSITORY_ROOT, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const relativePath = join(relativeDirectory, entry.name);
      return entry.isDirectory() ? listFiles(relativePath) : [relativePath];
    });
}

function protectedPaths() {
  const registry = JSON.parse(readFileSync(join(REPOSITORY_ROOT, 'tools.json'), 'utf8'));
  return [...new Set([
    ...STATIC_PROTECTED_PATHS,
    ...registry.tools.map((tool) => tool.file),
    ...listFiles('data/options')
  ])].sort();
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

function copySnapshot(targetRoot, sourceSnapshot) {
  for (const [relativePath, entry] of sourceSnapshot) {
    const targetPath = join(targetRoot, relativePath);
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, entry.bytes);
  }
}

function removeExperienceObjects(bytes) {
  const registry = JSON.parse(bytes.toString('utf8'));
  let removed = 0;
  for (const tool of registry.tools) {
    assert.equal(Object.hasOwn(tool, 'experience'), true, `${tool.id} must carry additive experience metadata before rollback`);
    delete tool.experience;
    removed += 1;
  }
  return {
    bytes: Buffer.from(JSON.stringify(registry, null, 2)),
    removed,
    value: registry
  };
}

function removeFeature012SelftestBlock(bytes) {
  const source = bytes.toString('utf8');
  const start = source.indexOf(SELFTEST_BLOCK_START);
  const duplicate = source.indexOf(SELFTEST_BLOCK_START, start + SELFTEST_BLOCK_START.length);
  const end = source.indexOf(SELFTEST_SUMMARY_START, start);
  assert.notEqual(start, -1, 'named Feature 012 selftest block must exist before rollback');
  assert.equal(duplicate, -1, 'named Feature 012 selftest block must be unique');
  assert.notEqual(end, -1, 'selftest summary marker must follow the Feature 012 block');
  return Buffer.from(source.slice(0, start) + source.slice(end));
}

function runSandboxProbe(probePath, sandboxRoot) {
  return spawnSync(process.execPath, [probePath, sandboxRoot], {
    cwd: REPOSITORY_ROOT,
    encoding: 'utf8'
  });
}

function copyRepositoryForExactReplay(targetRoot) {
  const excludedTopLevel = new Set(['.git', 'node_modules', 'playwright-report', 'test-results']);
  cpSync(REPOSITORY_ROOT, targetRoot, {
    recursive: true,
    filter(source) {
      const pathFromRoot = relative(REPOSITORY_ROOT, source);
      const topLevel = pathFromRoot.split(/[\\/]/)[0];
      return pathFromRoot === '' || !excludedTopLevel.has(topLevel);
    }
  });
  const nodeModules = join(REPOSITORY_ROOT, 'node_modules');
  if (existsSync(nodeModules)) symlinkSync(nodeModules, join(targetRoot, 'node_modules'), 'dir');
}

function runExactCommand(command, args, cwd) {
  const childEnvironment = {
    ...process.env,
    [EXACT_REPLAY_CHILD]: '1',
    RL_SCOPE01_BASELINE_REPOSITORY: REPOSITORY_ROOT
  };
  delete childEnvironment.NODE_TEST_CONTEXT;
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: childEnvironment
  });
}

function commandOutput(result) {
  return `${result.stdout || ''}\n${result.stderr || ''}`;
}

function actualPacket() {
  return {
    config: readJson('tool-experience.config.json'),
    registry: readJson('tools.json'),
    models: readJson('simple-models.json'),
    journeys: readJson('journeys.json')
  };
}

function baselineRegistry() {
  return JSON.parse(execFileSync('git', ['show', 'HEAD:tools.json'], {
    cwd: process.env.RL_SCOPE01_BASELINE_REPOSITORY || new URL('..', import.meta.url),
    encoding: 'utf8'
  }));
}

function withoutExperience(tool) {
  const copy = clone(tool);
  delete copy.experience;
  return copy;
}

test('SCN-012-033 actual registry resolves all 23 entries and preserves every pre-existing field', () => {
  const api = loadProductionApi();
  const packet = actualPacket();
  const baseline = baselineRegistry();
  const result = api.validateFoundation(packet);
  assert.equal(result.ok, true);
  assert.equal(result.value.toolCount, 23);
  assert.equal(result.value.ordinaryCount, 22);
  assert.equal(result.value.marketActionCount, 1);
  assert.equal(result.value.simpleModelDefinitionCount, 23);
  assert.equal(result.value.journeyDefinitionCount, 48);
  assert.deepEqual(result.value.toolIds, packet.registry.tools.map((tool) => tool.id));
  assert.deepEqual(packet.registry.tools.map(withoutExperience), baseline.tools, 'experience is the only tools.json addition');
  assert.deepEqual(packet.registry.tools.map((tool) => tool.briefing), baseline.tools.map((tool) => tool.briefing), 'all briefing blocks remain byte-semantic equals');
});

test('SCN-012-033 valid added-tool mutation scales from registry membership with no production ID branch', () => {
  const api = loadProductionApi();
  const packet = actualPacket();
  const added = addValidOrdinaryTool(packet, 'future-registry-tool');
  const result = api.validateFoundation(added);
  assert.equal(result.ok, true);
  assert.equal(result.value.toolCount, packet.registry.tools.length + 1);
  assert.equal(result.value.toolIds.at(-1), 'future-registry-tool');

  const source = readProductionSource();
  for (const tool of packet.registry.tools) {
    assert.equal(source.includes(tool.id), false, `production validator must not branch on ${tool.id}`);
  }
  for (const forbidden of ['fetch(', 'providerFetch(', 'localStorage.', 'sessionStorage.', '.setItem(', 'XMLHttpRequest', 'WebSocket']) {
    assert.equal(source.includes(forbidden), false, `declaration validator must not own ${forbidden}`);
  }
});

test('SCN-012-033 actual packet fails closed for missing duplicate unsafe unresolved and closed-field mutations', () => {
  const api = loadProductionApi();
  const cases = [
    {
      name: 'missing experience',
      code: 'E012-REGISTRY',
      mutate(packet) { delete packet.registry.tools[0].experience; }
    },
    {
      name: 'duplicate ID',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.registry.tools.push(clone(packet.registry.tools[0])); }
    },
    {
      name: 'wrong experience version',
      code: 'E012-VERSION',
      mutate(packet) { packet.registry.tools[1].experience.contractVersion = 'tool-experience/v2'; }
    },
    {
      name: 'wrong ordinary view order',
      code: 'E012-VIEWSET',
      mutate(packet) { packet.registry.tools[1].experience.viewIds = ['power', 'simple', 'brief', 'journey']; }
    },
    {
      name: 'unsafe adapter module',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.registry.tools[1].experience.simpleAdapterModule = '../owner-formula.js'; }
    },
    {
      name: 'unknown experience field',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.registry.tools[1].experience.fetchOwner = true; }
    },
    {
      name: 'unresolved model',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.registry.tools[1].experience.simpleModelDefinitionId = 'simple-model/missing/v1'; }
    },
    {
      name: 'unresolved Journey',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.registry.tools[1].experience.journeyDefinitionIds[0] = 'journey/missing/v1'; }
    },
    {
      name: 'invalid model parameter',
      code: 'E012-SIMPLE-DEFINITION',
      mutate(packet) { packet.models.definitions[0].parameterDefinitions[0].affectsOutputPaths = []; }
    },
    {
      name: 'invalid Journey mechanism',
      code: 'E012-JOURNEY-DEFINITION',
      mutate(packet) { packet.journeys.definitions[0].mechanism = 'arbitrary-script'; }
    },
    {
      name: 'narrative dependency predicate',
      code: 'E012-REGISTRY',
      mutate(packet) { packet.config.dependencyGates.BUG004.acceptedPredicate.narrativeStatus = 'implemented'; }
    }
  ];

  for (const candidate of cases) {
    const packet = actualPacket();
    candidate.mutate(packet);
    const result = api.validateFoundation(packet);
    assert.equal(result.ok, false, `${candidate.name} must fail`);
    assert.equal(result.error.code, candidate.code, candidate.name);
    assert.equal(result.error.valueEchoed, false, candidate.name);
  }
});

test('SCN-012-033 constituent additions require complete model and Journey references', () => {
  const api = loadProductionApi();
  const packet = actualPacket();
  const id = 'incomplete-added-tool';
  packet.registry.tools.push(makeTool({ id }));
  expectError(api.validateFoundation(packet), 'E012-REGISTRY');

  packet.models.definitions.push(makeModelDefinition({ toolId: id }));
  expectError(api.validateFoundation(packet), 'E012-REGISTRY');

  for (const [goalId, mechanism] of [['goal-one', 'wizard'], ['goal-two', 'checklist']]) {
    const journey = makeJourneyDefinition({ toolId: id, goalId, mechanism });
    packet.journeys.definitions.push(journey.definition);
    packet.journeys.steps.push(journey.step);
  }
  assert.equal(api.validateFoundation(packet).ok, true);
});

test('SCN-012-033 committed packet contains no capability overclaim beyond the declared shell canary', () => {
  const packet = actualPacket();
  const serialized = JSON.stringify(packet);
  for (const forbidden of [
    'provider fallback certified',
    'authored Brief certified',
    'private portfolio integrated',
    'visibleModeCutover":true'
  ]) {
    assert.equal(serialized.includes(forbidden), false, `packet must not claim ${forbidden}`);
  }
  assert.equal(packet.config.migrationPolicy.phase, 'shell-canary');
  assert.equal(packet.config.migrationPolicy.shadowOnly, true);
  assert.equal(packet.config.migrationPolicy.visibleModeCutover, false);
  assert.equal(packet.config.migrationPolicy.panelBootstrap, true);
});

test('SCN-012-033 rollback rehearsal replays RED then restores exact Scope 01 bytes without touching protected data', {
  skip: process.env[EXACT_REPLAY_CHILD] === '1'
}, () => {
  const protectedArtifactPaths = protectedPaths();
  const observedWorktreePaths = [...new Set([...SCOPE_ARTIFACTS, ...protectedArtifactPaths])].sort();
  const worktreeBefore = hashInventory(REPOSITORY_ROOT, observedWorktreePaths);
  const scopeSnapshot = snapshot(REPOSITORY_ROOT, SCOPE_ARTIFACTS);
  const protectedSnapshot = snapshot(REPOSITORY_ROOT, protectedArtifactPaths);
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope01-rollback-'));
  const sandboxRoot = join(temporaryRoot, 'worktree');
  const probePath = join(temporaryRoot, 'scope01-sandbox-probe.mjs');

  try {
    mkdirSync(sandboxRoot, { recursive: true });
    copySnapshot(sandboxRoot, scopeSnapshot);
    copySnapshot(sandboxRoot, protectedSnapshot);
    writeFileSync(probePath, SANDBOX_PROBE_SOURCE);

    const baselineToolsBytes = execFileSync('git', ['show', 'HEAD:tools.json'], { cwd: REPOSITORY_ROOT });
    const baselineSelftestBytes = execFileSync('git', ['show', 'HEAD:scripts/selftest.mjs'], { cwd: REPOSITORY_ROOT });
    const rolledBackTools = removeExperienceObjects(scopeSnapshot.get('tools.json').bytes);
    const rolledBackSelftest = removeFeature012SelftestBlock(scopeSnapshot.get('scripts/selftest.mjs').bytes);

    for (const relativePath of NEW_SCOPE_ARTIFACTS) rmSync(join(sandboxRoot, relativePath));
    writeFileSync(join(sandboxRoot, 'tools.json'), rolledBackTools.bytes);
    writeFileSync(join(sandboxRoot, 'scripts/selftest.mjs'), rolledBackSelftest);

    assert.equal(rolledBackTools.removed, 23, 'rollback must remove one real experience declaration per current tool');
    assert.deepEqual(rolledBackTools.value, JSON.parse(baselineToolsBytes.toString('utf8')), 'rolled-back registry must be semantically equal to HEAD');
    assert.equal(rolledBackTools.bytes.equals(baselineToolsBytes), true, 'rolled-back registry bytes must equal HEAD');
    assert.equal(rolledBackSelftest.equals(baselineSelftestBytes), true, 'rolled-back selftest bytes must equal HEAD');
    assert.deepEqual(hashInventory(sandboxRoot, protectedArtifactPaths), new Map([...protectedSnapshot].map(([path, entry]) => [path, entry.hash])));

    const red = runSandboxProbe(probePath, sandboxRoot);
    assert.equal(red.status, 17, `rollback probe must fail with the declared RED status: ${red.stderr}`);
    assert.match(red.stderr, /\[scope01-sandbox-probe\] RED missing-contract=.*tool-experience\.config\.json/);
    assert.match(red.stderr, /missing-registry-experience=23/);

    copySnapshot(sandboxRoot, scopeSnapshot);
    const green = runSandboxProbe(probePath, sandboxRoot);
    assert.equal(green.status, 0, `restored probe must pass: ${green.stderr}`);
    assert.match(green.stdout, /\[scope01-sandbox-probe\] GREEN tools=23 models=23 journeys=48 adversarial=13/);
    assert.deepEqual(hashInventory(sandboxRoot, SCOPE_ARTIFACTS), new Map([...scopeSnapshot].map(([path, entry]) => [path, entry.hash])));
    assert.deepEqual(hashInventory(sandboxRoot, protectedArtifactPaths), new Map([...protectedSnapshot].map(([path, entry]) => [path, entry.hash])));
    assert.deepEqual(hashInventory(REPOSITORY_ROOT, observedWorktreePaths), worktreeBefore, 'real worktree bytes must remain unchanged throughout rehearsal');

    console.log(`[rollback-canary] snapshot scopeArtifacts=${SCOPE_ARTIFACTS.length} protectedFiles=${protectedArtifactPaths.length}`);
    console.log(`[rollback-canary] rollback removedArtifacts=${NEW_SCOPE_ARTIFACTS.length} removedExperienceObjects=${rolledBackTools.removed}`);
    console.log(`[rollback-canary] baseline toolsByteEqual=true toolsSemanticEqual=true selftestByteEqual=true`);
    console.log(`[rollback-canary] RED exit=${red.status} ${red.stderr.trim()}`);
    console.log(`[rollback-canary] GREEN exit=${green.status} ${green.stdout.trim()}`);
    console.log('[rollback-canary] restore scopeHashesEqual=true protectedHashesEqual=true worktreeHashesEqual=true');
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
    assert.equal(existsSync(temporaryRoot), false, 'rollback rehearsal temporary directory must always be removed');
  }
});

test('SCN-012-033 exact TP-01-01/02/03 commands replay RED then GREEN in an isolated rollback baseline', {
  skip: process.env[EXACT_REPLAY_CHILD] === '1'
}, () => {
  const protectedArtifactPaths = protectedPaths();
  const observedWorktreePaths = [...new Set([...SCOPE_ARTIFACTS, ...protectedArtifactPaths])].sort();
  const worktreeBefore = hashInventory(REPOSITORY_ROOT, observedWorktreePaths);
  const protectedBefore = hashInventory(REPOSITORY_ROOT, protectedArtifactPaths);
  const currentProduction = snapshot(REPOSITORY_ROOT, [...RED_PRODUCTION_ARTIFACTS, 'tools.json']);
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope01-exact-replay-'));
  const sandboxRoot = join(temporaryRoot, 'worktree');
  const commands = [
    {
      id: 'TP-01-01',
      command: process.execPath,
      args: ['--test', 'tests/tool-experience.unit.mjs'],
      redPattern: /production contract missing: rlexperience\.js/,
      greenPattern: /pass 7/
    },
    {
      id: 'TP-01-02',
      command: process.execPath,
      args: ['--test', 'tests/tool-experience-registry.functional.mjs'],
      redPattern: /production contract missing: rlexperience\.js|simple-models\.json|tool-experience\.config\.json/,
      greenPattern: /pass 5/
    },
    {
      id: 'TP-01-03',
      command: 'npx',
      args: [
        '--no-install', 'playwright', 'test', 'tests/tool-experience.spec.mjs',
        '--config=playwright.config.mjs', '--project=system-chrome',
        '--grep', 'Regression: SCN-012-033 real-page shadow registry validation derives all experiences without cutover',
        '--reporter=list'
      ],
      redPattern: /rlexperience\.js|Failed to load script|addScriptTag/,
      greenPattern: /1 passed/
    }
  ];

  try {
    copyRepositoryForExactReplay(sandboxRoot);
    for (const relativePath of RED_PRODUCTION_ARTIFACTS) rmSync(join(sandboxRoot, relativePath), { force: true });
    const rolledBackTools = removeExperienceObjects(currentProduction.get('tools.json').bytes);
    writeFileSync(join(sandboxRoot, 'tools.json'), rolledBackTools.bytes);

    const redResults = commands.map((entry) => {
      const result = runExactCommand(entry.command, entry.args, sandboxRoot);
      const output = commandOutput(result);
      assert.notEqual(result.status, 0, `${entry.id} rollback replay must be RED: ${output}`);
      assert.match(output, entry.redPattern, `${entry.id} must fail on the intended missing production contract`);
      return { entry, result };
    });

    copySnapshot(sandboxRoot, currentProduction);
    const greenResults = commands.map((entry) => {
      const result = runExactCommand(entry.command, entry.args, sandboxRoot);
      const output = commandOutput(result);
      assert.equal(result.status, 0, `${entry.id} restored replay must be GREEN: ${output}`);
      assert.match(output, entry.greenPattern, `${entry.id} restored output must prove the expected test count`);
      return { entry, result };
    });

    assert.deepEqual(hashInventory(REPOSITORY_ROOT, observedWorktreePaths), worktreeBefore);
    assert.deepEqual(hashInventory(REPOSITORY_ROOT, protectedArtifactPaths), protectedBefore);
    for (const relativePath of currentProduction.keys()) {
      assert.equal(
        sha256(readFileSync(join(sandboxRoot, relativePath))),
        currentProduction.get(relativePath).hash,
        `${relativePath} must restore exactly in the sandbox`
      );
    }

    console.log(`[exact-replay] sandbox=${basename(temporaryRoot)} scopeArtifacts=${SCOPE_ARTIFACTS.length} protectedFiles=${protectedArtifactPaths.length}`);
    console.log(`[exact-replay] rollback removedProductionArtifacts=${RED_PRODUCTION_ARTIFACTS.length} removedExperienceObjects=${rolledBackTools.removed}`);
    for (const { entry, result } of redResults) console.log(`[exact-replay] RED ${entry.id} exit=${result.status} discriminator=PASS`);
    console.log('[exact-replay] restore productionHashesEqual=true');
    for (const { entry, result } of greenResults) console.log(`[exact-replay] GREEN ${entry.id} exit=${result.status} expectedCount=PASS`);
    console.log('[exact-replay] protectedHashesEqual=true realWorktreeHashesEqual=true');
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
    assert.equal(existsSync(temporaryRoot), false, 'exact replay temporary directory must always be removed');
  }
});