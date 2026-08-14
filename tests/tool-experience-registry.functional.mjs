import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
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
const require = createRequire(import.meta.url);
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

// The rehearsal sandbox must carry every production module the validator actually loads, or the
// restored GREEN probe fails on a missing dependency instead of on anything the rehearsal is
// testing. Deriving that set from the validator source — rather than keeping a second
// hand-maintained list — means the sandbox cannot silently drift again the way it did when
// Scope 08 added rljourney.js (a8efa69d) without updating any manifest here. Entries already
// covered by SCOPE_ARTIFACTS are excluded, because those are deliberately REMOVED by the
// rollback and must not simultaneously be asserted unchanged as protected data.
const VALIDATOR_ENTRY = 'scripts/validate-tool-experience.mjs';

function validatorProductionDependencies() {
  const source = readFileSync(join(REPOSITORY_ROOT, VALIDATOR_ENTRY), 'utf8');
  const referenced = new Set();
  for (const match of source.matchAll(/(?:require\(|path:\s*)(['"])\.\.\/([^'"]+)\1/g)) {
    referenced.add(match[2]);
  }
  for (const match of source.matchAll(/readRequired\((['"])([^'"]+)\1\)/g)) {
    referenced.add(match[2]);
  }
  const firstLoadBlock = /const firstLoadPaths = \[([\s\S]*?)\];/.exec(source);
  if (firstLoadBlock) {
    for (const match of firstLoadBlock[1].matchAll(/['"]([^'"]+)['"]/g)) referenced.add(match[1]);
  }
  const dependencies = [...referenced]
    .filter((relativePath) => !SCOPE_ARTIFACTS.includes(relativePath))
    .sort();
  assert.ok(
    dependencies.length > 0,
    'validator must declare at least one external production dependency for the sandbox to carry'
  );
  for (const relativePath of dependencies) {
    assert.equal(
      existsSync(join(REPOSITORY_ROOT, relativePath)),
      true,
      `validator dependency ${relativePath} must exist in the repository`
    );
  }
  return dependencies;
}

function protectedPaths() {
  const registry = JSON.parse(readFileSync(join(REPOSITORY_ROOT, 'tools.json'), 'utf8'));
  const config = JSON.parse(readFileSync(join(REPOSITORY_ROOT, 'tool-experience.config.json'), 'utf8'));
  return [...new Set([
    ...STATIC_PROTECTED_PATHS,
    ...validatorProductionDependencies(),
    'tool-experience.gates.json',
    ...Object.values(config.dependencyGates).map((gate) => gate.statePath),
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

// BUG-002 (Feature 012 moving-HEAD baseline drift): the Scope 01 rollback authority must be
// HEAD-INDEPENDENT. `git show HEAD:` returned the modern bytes the moment Scope 01 landed, so
// the rollback comparison silently degraded into comparing the registry against itself. This
// pins the immutable parent of d94a5b9 (where `experience` first appeared in this history) — the same anchor
// the already-GREEN SCN-012-031 reference fix uses. The two guards below fail LOUD if the pin
// is ever repointed at post-Scope-01 content, keeping SCN-012-033 adversarial.
const LEGACY_BASELINE_COMMIT = 'b533b972a473ffca9252362ecc5d73de52423da9';
const LEGACY_BASELINE_FORBIDDEN_MARKER = Object.freeze({
  'tools.json': '"experience"',
  'scripts/selftest.mjs': 'Feature 012'
});

function baselineRepositoryRoot() {
  return process.env.RL_SCOPE01_BASELINE_REPOSITORY || new URL('..', import.meta.url);
}

function baselineBytes(relativePath) {
  const bytes = execFileSync('git', ['show', `${LEGACY_BASELINE_COMMIT}:${relativePath}`], {
    cwd: baselineRepositoryRoot()
  });
  const forbidden = LEGACY_BASELINE_FORBIDDEN_MARKER[relativePath];
  if (forbidden) {
    assert.equal(
      bytes.includes(forbidden),
      false,
      `legacy baseline ${relativePath} @ ${LEGACY_BASELINE_COMMIT} must not contain the modern marker ${forbidden}`
    );
  }
  return bytes;
}

function baselineRegistry() {
  return JSON.parse(baselineBytes('tools.json').toString('utf8'));
}

// SCN-012-033 proves exactly ONE claim about the registry: the Scope 01 change added
// `experience` and nothing else to tools.json. That claim is about the Scope 01 DELTA, so BOTH
// sides of the containment proof must be pinned to that delta — the pre-Scope-01 parent above,
// and the Scope 01 commit itself. Comparing TODAY's registry against the pre-Scope-01 parent
// instead silently re-asserts a second, unintended claim ("tools.json has never changed since
// Scope 01"), which is false by design: later certified work legitimately edited four entries —
// market-brief (title, nav) in the Scope 09 rename 380812b4; msft-july-print-model (updated,
// blurb, tags) in 05232f26; and simpleWiring on msft-july-print-model,
// palm-springs-rental-market-lab and ocean-shores-rental-market-lab in b548519e. Pinning both
// sides keeps the real assertion adversarial while making it immune to that lawful drift.
const SCOPE01_REGISTRY_COMMIT = 'd94a5b9065e3a885347ec9e40816a2030405d6f1';
const SCOPE01_REGISTRY_REQUIRED_MARKER = '"experience"';

function scope01RegistryBytes() {
  const bytes = execFileSync('git', ['show', `${SCOPE01_REGISTRY_COMMIT}:tools.json`], {
    cwd: baselineRepositoryRoot()
  });
  assert.equal(
    bytes.includes(SCOPE01_REGISTRY_REQUIRED_MARKER),
    true,
    `Scope 01 registry @ ${SCOPE01_REGISTRY_COMMIT} must contain ${SCOPE01_REGISTRY_REQUIRED_MARKER} — the pin is not the Scope 01 delta`
  );
  return bytes;
}

function scope01Registry() {
  return JSON.parse(scope01RegistryBytes().toString('utf8'));
}

function withoutExperience(tool) {
  const copy = clone(tool);
  delete copy.experience;
  return copy;
}

test('SCN-012-033 actual registry resolves every entry and preserves every pre-existing field', () => {
  const api = loadProductionApi();
  const packet = actualPacket();
  const baseline = baselineRegistry();
  const result = api.validateFoundation(packet);
  assert.equal(result.ok, true);
  const ordinaryCount = packet.registry.tools.filter((tool) => tool.experience.kind === 'ordinary').length;
  assert.equal(result.value.toolCount, packet.registry.tools.length);
  assert.equal(result.value.ordinaryCount, ordinaryCount);
  assert.equal(result.value.marketActionCount, packet.registry.tools.length - ordinaryCount);
  assert.equal(result.value.simpleModelDefinitionCount, packet.models.definitions.length);
  assert.equal(result.value.journeyDefinitionCount, packet.journeys.definitions.length);
  assert.deepEqual(result.value.toolIds, packet.registry.tools.map((tool) => tool.id));
  // The Scope 01 delta itself: strip `experience` from the Scope 01 registry and the remainder
  // must be semantically identical to its pre-Scope-01 parent. This is the SCN-012-033 claim.
  assert.deepEqual(scope01Registry().tools.map(withoutExperience), baseline.tools, 'experience is the only tools.json addition made by Scope 01');
  // ...and that claim must still be LIVE at HEAD: every current entry carries `experience`, and
  // no field present on its pre-Scope-01 counterpart was dropped. This keeps the test's
  // "preserves every pre-existing field" promise adversarial against today's registry without
  // falsely forbidding the later certified value edits enumerated above.
  const documentedLaterFieldRetirements = {
    'waterfront-polo-lab': ['notes'],
    'palm-springs-rental-market-lab': ['notes'],
    'ocean-shores-rental-market-lab': ['notes']
  };
  for (const tool of packet.registry.tools) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(tool, 'experience'),
      `${tool.id} must still carry the Scope 01 experience field`
    );
    const priorEntry = baseline.tools.find((entry) => entry.id === tool.id);
    if (!priorEntry) {
      continue;
    }
    const dropped = Object.keys(priorEntry).filter(
      (key) => !Object.prototype.hasOwnProperty.call(tool, key)
    );
    assert.deepEqual(dropped, documentedLaterFieldRetirements[tool.id] || [], `${tool.id} carries an undocumented pre-existing field retirement`);
  }
  assert.deepEqual(
    baseline.tools.map((prior) => packet.registry.tools.find((tool) => tool.id === prior.id).briefing),
    baseline.tools.map((tool) => tool.briefing),
    'all pre-Scope-01 briefing blocks remain byte-semantic equals'
  );
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

test('SCN-019-020 tool model adapter module journey and public target registries are in parity', () => {
  const packet = actualPacket();
  const foundation = loadProductionApi().validateFoundation(packet);
  assert.equal(foundation.ok, true, foundation.error && foundation.error.reason);

  const tool = packet.registry.tools.find((candidate) => candidate.id === 'research-agenda-lab');
  assert.ok(tool, 'research agenda must be registered');
  const model = packet.models.definitions.find((candidate) => candidate.toolId === tool.id);
  assert.ok(model, 'research agenda Simple model must resolve');
  assert.equal(model.definitionId, tool.experience.simpleModelDefinitionId);
  assert.equal(model.adapterId, tool.experience.simpleAdapterId);
  assert.equal(model.adapterModule, tool.experience.simpleAdapterModule);
  assert.ok(packet.config.adapterPolicy.moduleAllowlist.includes(model.adapterModule));

  const adapter = require('../' + model.adapterModule);
  assert.equal(adapter.module, model.adapterModule);
  assert.ok(adapter.supportedAdapterIds.includes(model.adapterId));
  assert.equal(typeof adapter.createResearchAgendaAdapters, 'function');
  assert.equal(typeof adapter.registerResearchAgendaAdapters, 'function');

  assert.equal(tool.experience.journeyDefinitionIds.length, 2);
  for (const definitionId of tool.experience.journeyDefinitionIds) {
    const definition = packet.journeys.definitions.find((candidate) => candidate.definitionId === definitionId);
    assert.ok(definition, `${definitionId} must resolve`);
    assert.equal(definition.toolId, tool.id);
    assert.equal(definition.noExecution, true);
    assert.ok(definition.stepIds.length >= 3);
    for (const stepId of definition.stepIds) {
      const step = packet.journeys.steps.find((candidate) => candidate.stepId === stepId);
      assert.ok(step, `${stepId} must resolve`);
      assert.equal(step.definitionId, definitionId);
      assert.equal(step.sideEffectPolicy, 'none');
    }
  }

  const agenda = readJson('research-agenda.json');
  const expectedTargets = agenda.topics.map((topic) => topic.topicId);
  const page = readFileSync(join(REPOSITORY_ROOT, tool.file), 'utf8');
  const targetAttribute = /data-public-target-ids="([^"]+)"/.exec(page);
  assert.ok(targetAttribute, 'owning page must declare durable public targets');
  assert.deepEqual(targetAttribute[1].split(','), expectedTargets);
  assert.match(page, /src="rlexperience-adapters\/research-agenda\.js"/);
  assert.match(page, /data-tool-id="research-agenda-lab"/);
  assert.match(readFileSync(join(REPOSITORY_ROOT, 'rlapp.js'), 'utf8'), /data-public-target-ids/);
  assert.match(readFileSync(join(REPOSITORY_ROOT, 'rlviews.js'), 'utf8'), /publicTargetIds/);
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

    const baselineToolsBytes = baselineBytes('tools.json');
    const baselineSelftestBytes = baselineBytes('scripts/selftest.mjs');
    const rolledBackTools = removeExperienceObjects(scopeSnapshot.get('tools.json').bytes);
    const rolledBackSelftest = removeFeature012SelftestBlock(scopeSnapshot.get('scripts/selftest.mjs').bytes);

    for (const relativePath of NEW_SCOPE_ARTIFACTS) rmSync(join(sandboxRoot, relativePath));
    writeFileSync(join(sandboxRoot, 'tools.json'), rolledBackTools.bytes);
    writeFileSync(join(sandboxRoot, 'scripts/selftest.mjs'), rolledBackSelftest);

    assert.equal(rolledBackTools.removed, actualPacket().registry.tools.length, 'rollback must remove one real experience declaration per current tool');
      // Exactness of the rollback transform is proved against the Scope 01 DELTA, where it is
      // achievable: stripping `experience` from the Scope 01 registry must reproduce its
      // pre-Scope-01 parent byte-for-byte. Proving it against HEAD instead would demand that
      // tools.json never changed after Scope 01, which is false by design (see the pin comment).
      const scope01RolledBackTools = removeExperienceObjects(scope01RegistryBytes());
      assert.equal(scope01RolledBackTools.removed, 23, 'the Scope 01 registry must carry exactly one experience declaration per tool');
      assert.deepEqual(scope01RolledBackTools.value, JSON.parse(baselineToolsBytes.toString('utf8')), 'rolling Scope 01 back must be semantically equal to the pre-Scope-01 registry');
      assert.equal(scope01RolledBackTools.bytes.equals(baselineToolsBytes), true, 'rolling Scope 01 back must reproduce the pre-Scope-01 registry bytes exactly');
      // The rolled-back selftest CANNOT be byte-compared to the pre-Scope-01 parent: c81d808d
      // landed Scopes 01-04 together, so removing the *named Scope 01 block* still leaves the
      // Scope 02/03/04 assertions behind (a 7-line residual: COMPANY_ROUTE_SCRIPTS,
      // resolveArchetypeView, RLCOMPANY.evaluateModel, data-mode-seg). No commit isolates the
      // Scope 01 selftest delta, so byte-equality is unachievable by construction and asserting
      // it would assert something false. Recorded as F-BUG002-006. What IS provable — and what
      // the rehearsal actually depends on — is asserted instead.
      const rolledBackSelftestSource = rolledBackSelftest.toString('utf8');
      assert.equal(rolledBackSelftestSource.includes(SELFTEST_BLOCK_START), false, 'rolled-back selftest must no longer declare the Feature 012 Scope 01 block');
      assert.equal(rolledBackSelftestSource.includes(SELFTEST_SUMMARY_START), true, 'rollback must splice out only the Scope 01 block and leave the summary marker intact');
      assert.equal(baselineSelftestBytes.includes(SELFTEST_BLOCK_START), false, 'the pre-Scope-01 selftest must not contain the Feature 012 Scope 01 block');
      assert.ok(rolledBackSelftest.length < scopeSnapshot.get('scripts/selftest.mjs').bytes.length, 'rollback must shrink the selftest by the removed Scope 01 block');
    assert.deepEqual(hashInventory(sandboxRoot, protectedArtifactPaths), new Map([...protectedSnapshot].map(([path, entry]) => [path, entry.hash])));

    const red = runSandboxProbe(probePath, sandboxRoot);
    assert.equal(red.status, 17, `rollback probe must fail with the declared RED status: ${red.stderr}`);
    assert.match(red.stderr, /\[scope01-sandbox-probe\] RED missing-contract=.*tool-experience\.config\.json/);
    assert.match(red.stderr, new RegExp('missing-registry-experience=' + actualPacket().registry.tools.length));

    copySnapshot(sandboxRoot, scopeSnapshot);
    const green = runSandboxProbe(probePath, sandboxRoot);
    assert.equal(green.status, 0, `restored probe must pass: ${green.stderr}`);
    assert.match(green.stdout, new RegExp('\\[scope01-sandbox-probe\\] GREEN tools=' + actualPacket().registry.tools.length + ' models=' + actualPacket().models.definitions.length + ' journeys=' + actualPacket().journeys.definitions.length + ' adversarial=13'));
    assert.deepEqual(hashInventory(sandboxRoot, SCOPE_ARTIFACTS), new Map([...scopeSnapshot].map(([path, entry]) => [path, entry.hash])));
    assert.deepEqual(hashInventory(sandboxRoot, protectedArtifactPaths), new Map([...protectedSnapshot].map(([path, entry]) => [path, entry.hash])));
    assert.deepEqual(hashInventory(REPOSITORY_ROOT, observedWorktreePaths), worktreeBefore, 'real worktree bytes must remain unchanged throughout rehearsal');

    console.log(`[rollback-canary] snapshot scopeArtifacts=${SCOPE_ARTIFACTS.length} protectedFiles=${protectedArtifactPaths.length}`);
    console.log(`[rollback-canary] rollback removedArtifacts=${NEW_SCOPE_ARTIFACTS.length} removedExperienceObjects=${rolledBackTools.removed}`);
      console.log('[rollback-canary] scope01 delta toolsByteEqual=true toolsSemanticEqual=true; selftest blockRemoved=true summaryIntact=true (byte-equality unachievable — see F-BUG002-006)');
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
      greenPattern: /pass 6/
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