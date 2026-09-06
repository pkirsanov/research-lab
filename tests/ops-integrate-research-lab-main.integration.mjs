import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_DIR = resolve(ROOT, 'specs/_ops/OPS-integrate-research-lab-main');
const MANIFEST_PATH = resolve(SPEC_DIR, 'scenario-manifest.json');

function runGit(repositoryRoot, args, { expectedStatus = 0 } = {}) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
    timeout: 30_000
  });

  assert.equal(result.error, undefined, `git ${args.join(' ')} must execute`);
  assert.equal(
    result.status,
    expectedStatus,
    `git ${args.join(' ')} exited ${result.status}: ${result.stderr}`
  );
  return result.stdout.trimEnd();
}

function createGitFixture(prefix) {
  const repositoryRoot = mkdtempSync(join(tmpdir(), prefix));
  runGit(repositoryRoot, ['init', '--quiet', '--initial-branch=main']);
  runGit(repositoryRoot, ['config', 'user.email', 'ops-test@example.invalid']);
  runGit(repositoryRoot, ['config', 'user.name', 'OPS Test']);
  writeFileSync(resolve(repositoryRoot, 'inventory.txt'), 'initial\n');
  runGit(repositoryRoot, ['add', '--', 'inventory.txt']);
  runGit(repositoryRoot, ['commit', '--quiet', '-m', 'initial inventory']);
  return repositoryRoot;
}

function readRefSnapshot(repositoryRoot) {
  const bytes = `${runGit(repositoryRoot, [
    'for-each-ref',
    '--sort=refname',
    '--format=%(refname)%09%(objectname)%09%(objecttype)',
    'refs'
  ])}\n`;
  const refs = new Map(bytes.trimEnd().split('\n').map((line) => {
    const [name, objectId, objectType] = line.split('\t');
    return [name, { objectId, objectType }];
  }));
  return {
    inventoryId: `sha256:${createHash('sha256').update(bytes).digest('hex')}`,
    refs
  };
}

function executableProductionOwner(scenario) {
  const candidates = new Set([
    ...(scenario.implementationRefs || []),
    ...(scenario.testMechanism?.productionOwners || [])
  ]);
  return [...candidates].find((candidate) => {
    if (!/\.(?:mjs|js)$/.test(candidate) || candidate.startsWith('tests/')) return false;
    return existsSync(resolve(ROOT, candidate));
  });
}

test('Regression: SCN-OPS-009 changed Git state invalidates the frozen inventory', async () => {
  const repositoryRoot = createGitFixture('research-lab-ops-inventory-drift-');
  try {
    const frozen = readRefSnapshot(repositoryRoot);
    const frozenMain = frozen.refs.get('refs/heads/main')?.objectId;
    assert.match(frozenMain || '', /^[0-9a-f]{40}$/, 'the fixture must freeze a full main identity');

    writeFileSync(resolve(repositoryRoot, 'inventory.txt'), 'drifted\n');
    runGit(repositoryRoot, ['add', '--', 'inventory.txt']);
    runGit(repositoryRoot, ['commit', '--quiet', '-m', 'change one Git identity']);

    const changed = readRefSnapshot(repositoryRoot);
    const changedRefs = [...changed.refs].filter(([name, value]) => {
      const before = frozen.refs.get(name);
      return before?.objectId !== value.objectId || before?.objectType !== value.objectType;
    }).map(([name]) => name);
    assert.deepEqual(changedRefs, ['refs/heads/main'], 'the negative control must change exactly one Git identity');
    assert.notEqual(changed.inventoryId, frozen.inventoryId, 'the changed identity must invalidate the frozen inventory');

    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const scenario = manifest.scenarios.find((entry) => entry.id === 'SCN-OPS-009');
    assert.ok(scenario, 'SCN-OPS-009 must remain declared');
    const productionOwner = executableProductionOwner(scenario);
    assert.ok(
      productionOwner,
      'SCN-OPS-009 has no executable production owner for freeze and INVENTORY-DRIFT refusal'
    );

    const implementation = await import(pathToFileURL(resolve(ROOT, productionOwner)).href);
    assert.equal(typeof implementation.freezeInventory, 'function', 'the production owner must export freezeInventory');
    assert.equal(typeof implementation.guardInventoryMutation, 'function', 'the production owner must export guardInventoryMutation');

    const guardedRepository = createGitFixture('research-lab-ops-guarded-drift-');
    try {
      const productionFreeze = await implementation.freezeInventory({ repositoryRoot: guardedRepository });
      writeFileSync(resolve(guardedRepository, 'inventory.txt'), 'drifted\n');
      runGit(guardedRepository, ['add', '--', 'inventory.txt']);
      runGit(guardedRepository, ['commit', '--quiet', '-m', 'change guarded Git identity']);

      let mutationCalls = 0;
      const refusal = await implementation.guardInventoryMutation({
        repositoryRoot: guardedRepository,
        frozenInventory: productionFreeze,
        nextMutation: async () => {
          mutationCalls += 1;
          runGit(guardedRepository, ['update-ref', 'refs/heads/integration-probe', 'refs/heads/main']);
        }
      });

      assert.equal(refusal.ok, false, 'drift must refuse the next mutation');
      assert.equal(refusal.code, 'INVENTORY-DRIFT', 'drift must use the closed refusal code');
      assert.equal(refusal.mutationExecuted, false, 'the refusal must report that no mutation ran');
      assert.equal(mutationCalls, 0, 'the guarded mutation callback must not run');
      assert.equal(
        runGit(guardedRepository, ['show-ref', '--verify', '--quiet', 'refs/heads/integration-probe'], { expectedStatus: 1 }),
        '',
        'the refused mutation must leave no target ref'
      );
    } finally {
      rmSync(guardedRepository, { force: true, recursive: true });
    }
  } finally {
    rmSync(repositoryRoot, { force: true, recursive: true });
  }
});