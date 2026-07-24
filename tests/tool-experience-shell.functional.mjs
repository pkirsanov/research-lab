import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  createReadStream,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  loadPlaywright,
  startStaticServer
} from './provider-credentials.support.mjs';
import { readJson } from './tool-experience.support.mjs';

const SYSTEM_CHROME = '/opt/google/chrome/chrome';
const REPOSITORY_ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCOPE02_CURRENT_PATHS = Object.freeze([
  'rlviews.js',
  'rlapp.js',
  'rlexperience.js',
  'tool-experience.config.json',
  'scripts/selftest.mjs',
  'tests/tool-experience-shell.unit.mjs',
  'tests/tool-experience-shell.functional.mjs',
  'tests/tool-experience-mobile.spec.mjs',
  'tests/tool-experience.spec.mjs'
]);
const REPLAY_EXCLUDED_TOP_LEVEL = new Set([
  '.git',
  'node_modules',
  'playwright-report',
  'test-results'
]);
const STORAGE_SENTINELS = Object.freeze({
  rlExperienceModeV1: '{"sentinel":"SCOPE02_MODE_SENTINEL"}',
  'scope02.local.sentinel': 'SCOPE02_LOCAL_SENTINEL',
  'rlPortfolioV1.sentinel': 'SCOPE02_PORTFOLIO_SENTINEL',
  'rlJourneySessionsV1.slotA': 'SCOPE02_JOURNEY_SENTINEL'
});
const SANDBOX_MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8'
});
let browser;
let site;

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

function inventoryDigest(inventory) {
  return sha256(Buffer.from([...inventory]
    .map(([relativePath, hash]) => `${relativePath}\0${hash}`)
    .join('\n')));
}

function restoreSnapshot(root, sourceSnapshot) {
  for (const [relativePath, entry] of sourceSnapshot) {
    writeFileSync(join(root, relativePath), entry.bytes);
  }
}

function copyRepositoryForReplay(targetRoot) {
  cpSync(REPOSITORY_ROOT, targetRoot, {
    recursive: true,
    filter(source) {
      const pathFromRoot = relative(REPOSITORY_ROOT, source);
      const topLevel = pathFromRoot.split(/[\\/]/)[0];
      return pathFromRoot === '' || !REPLAY_EXCLUDED_TOP_LEVEL.has(topLevel);
    }
  });
  const nodeModules = join(REPOSITORY_ROOT, 'node_modules');
  if (existsSync(nodeModules)) symlinkSync(nodeModules, join(targetRoot, 'node_modules'), 'dir');
}

function baselineBytes(relativePath) {
  return execFileSync('git', ['show', `HEAD:${relativePath}`], { cwd: REPOSITORY_ROOT });
}

function reconstructScope01MigrationPolicy(sandboxRoot) {
  const configPath = join(sandboxRoot, 'tool-experience.config.json');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  config.migrationPolicy = {
    ...config.migrationPolicy,
    phase: 'contract-shadow',
    shadowOnly: true,
    visibleModeCutover: false,
    panelBootstrap: false
  };
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  return config.migrationPolicy;
}

async function startSandboxStaticServer(root) {
  const server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relativePath = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(root, relativePath);
    if ((filePath !== root && !filePath.startsWith(root + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': SANDBOX_MIME[extname(filePath)] || 'application/octet-stream',
      'referrer-policy': 'no-referrer'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  return {
    baseUrl: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolveClosed, rejectClosed) => {
      server.close((error) => error ? rejectClosed(error) : resolveClosed());
      server.closeAllConnections?.();
    })
  };
}

async function readStorageSentinels(page) {
  return page.evaluate((keys) => Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])), Object.keys(STORAGE_SENTINELS));
}

test.before(async () => {
  assert.equal(existsSync(SYSTEM_CHROME), true, 'source-locked system Chrome must exist');
  const { chromium } = await loadPlaywright();
  browser = await chromium.launch({ executablePath: SYSTEM_CHROME, headless: true });
  site = await startStaticServer();
});

test.after(async () => {
  if (browser) await browser.close();
  if (site) await site.close();
});

test('SCN-012-028 and SCN-012-029 all 23 registry pages bootstrap one exact shell without script-order drift', async () => {
  const registry = readJson('tools.json');
  assert.equal(registry.tools.length, 23);
  const failures = [];

  for (const tool of registry.tools) {
    const source = readFileSync(new URL(`../${tool.file}`, import.meta.url), 'utf8');
    const dataIndex = source.indexOf('src="rldata.js');
    const appIndex = source.indexOf('src="rlapp.js');
    const navIndex = source.indexOf('src="rlnav.js');
    assert.equal(dataIndex >= 0 && dataIndex < appIndex && appIndex < navIndex, true, `${tool.id} shared script order`);
    assert.equal((source.match(/data-rlbrief-mount/g) || []).length, 1, `${tool.id} unique bootstrap mount`);

    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => {
      if (/RLEXPERIENCE|RLVIEWS|RLAPP/.test(error.message)) pageErrors.push(error.message);
    });
    try {
      await page.goto(`${site.baseUrl}/${tool.file}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 10000 });
      const actual = await page.evaluate(() => {
        const shell = document.querySelector('#rlviews[data-rlexperience-shell="ready"]');
        const legacy = Array.from(document.querySelectorAll('#modeSeg, #simpleTab, #powerTab'));
        return {
          labels: Array.from(shell.querySelectorAll('[role="tab"]'), (node) => node.textContent.trim()),
          shellCount: document.querySelectorAll('#rlviews').length,
          statusCount: document.querySelectorAll('#rl-data-shell').length,
          panelCount: document.querySelectorAll('[data-rlexperience-panel]').length,
          readyShellCount: document.querySelectorAll('[data-rlexperience-shell="ready"]').length,
          legacySuppressed: legacy.every((node) => (
            getComputedStyle(node).display === 'none'
            && node.getAttribute('aria-hidden') === 'true'
            && node.tabIndex === -1
          )),
          bodyView: document.body.dataset.rlview,
          shellState: shell.getAttribute('data-rlexperience-canary')
        };
      });
      assert.deepEqual(actual.labels, tool.experience.kind === 'market-action-center'
        ? ['Brief', 'Portfolio', 'Red Alert', 'Journey']
        : ['Simple', 'Power', 'Brief', 'Journey']);
      assert.equal(actual.shellCount, 1);
      assert.equal(actual.readyShellCount, 1);
      assert.equal(actual.statusCount, 1);
      assert.equal(actual.panelCount, 4);
      assert.equal(actual.legacySuppressed, true);
      assert.equal(actual.bodyView, tool.experience.kind === 'market-action-center' ? 'brief' : 'simple');
      assert.equal(actual.shellState, 'shadow-safe');
      assert.deepEqual(pageErrors, []);
      console.log(`[shell-canary] tool=${tool.id} views=${actual.labels.join('|')} panels=${actual.panelCount} legacySuppressed=${actual.legacySuppressed} statusControls=${actual.statusCount}`);
    } catch (error) {
      failures.push(`${tool.id}: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  assert.deepEqual(failures, []);
});

test('SCN-012-028 view-only changes preserve provider status owner read and private storage boundaries', async () => {
  const page = await browser.newPage();
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]');
  await page.waitForTimeout(150);
  requests.length = 0;

  const before = await page.evaluate(() => {
    localStorage.setItem('scope02.private.sentinel', 'SCOPE02_PRIVATE_SENTINEL');
    return {
      provider: JSON.stringify(RLDATA.providerAccess()),
      ownerRead: JSON.stringify(RLDATA.toolRead('strategy-self-improvement-lab')),
      keys: Object.keys(localStorage).sort(),
      privateSentinel: localStorage.getItem('scope02.private.sentinel')
    };
  });
  for (const mode of ['power', 'brief', 'journey', 'simple']) {
    await page.getByRole('tab', { name: new RegExp(`^${mode === 'journey' ? 'Journey' : mode[0].toUpperCase() + mode.slice(1)}$`) }).click();
  }
  const after = await page.evaluate(() => ({
    provider: JSON.stringify(RLDATA.providerAccess()),
    ownerRead: JSON.stringify(RLDATA.toolRead('strategy-self-improvement-lab')),
    keys: Object.keys(localStorage).sort(),
    modeRecord: JSON.parse(localStorage.getItem('rlExperienceModeV1') || 'null'),
    privateSentinel: localStorage.getItem('scope02.private.sentinel'),
    privatePublicSerialization: JSON.stringify({
      url: location.href,
      title: document.title,
      history: history.state,
      referrer: document.referrer,
      dom: document.querySelector('#rlviews')?.outerHTML
    }).includes('SCOPE02_PRIVATE_SENTINEL')
  }));

  assert.equal(after.provider, before.provider);
  assert.equal(after.ownerRead, before.ownerRead);
  assert.deepEqual(after.keys.filter((key) => !before.keys.includes(key)), ['rlExperienceModeV1']);
  assert.deepEqual(Object.keys(after.modeRecord), ['contractVersion', 'toolId', 'mode', 'savedAt']);
  assert.equal(after.modeRecord.toolId, 'strategy-self-improvement-lab');
  assert.equal(after.modeRecord.mode, 'simple');
  assert.equal(after.privateSentinel, before.privateSentinel);
  assert.equal(after.privatePublicSerialization, false);
  assert.deepEqual(requests, []);
  console.log('[shell-boundary] viewChanges=4 fetches=0 providerStatus=preserved ownerRead=preserved');
  console.log(`[shell-boundary] newStorageKeys=${after.keys.filter((key) => !before.keys.includes(key)).join(',')}`);
  console.log(`[shell-boundary] modeRecordFields=${Object.keys(after.modeRecord).join(',')}`);
  console.log('[shell-boundary] privateSentinelStorageByteEqual=true publicSurfaceMatches=0');
  await page.evaluate(() => localStorage.removeItem('scope02.private.sentinel'));
  await page.close();
});

test('SCN-012-031 compatibility rollback restores legacy controls then exact current Scope 02 bytes', { timeout: 120000 }, async () => {
  const worktreePaths = listRegularFiles(REPOSITORY_ROOT);
  const allowedSet = new Set(SCOPE02_CURRENT_PATHS);
  const protectedPaths = worktreePaths.filter((relativePath) => !allowedSet.has(relativePath));
  const dataPaths = protectedPaths.filter((relativePath) => relativePath.startsWith(`data${sep}`));
  const optionPaths = dataPaths.filter((relativePath) => relativePath.startsWith(`data${sep}options${sep}`));
  const registry = readJson('tools.json');
  const protectedHtmlPaths = [...new Set(['index.html', ...registry.tools.map((tool) => tool.file)])].sort();
  const allowedBefore = hashInventory(REPOSITORY_ROOT, SCOPE02_CURRENT_PATHS);
  const protectedBefore = hashInventory(REPOSITORY_ROOT, protectedPaths);
  const currentScopeSnapshot = snapshot(REPOSITORY_ROOT, SCOPE02_CURRENT_PATHS);
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'research-lab-scope02-rollback-'));
  const sandboxRoot = join(temporaryRoot, 'worktree');
  let sandboxSite;
  let page;

  try {
    copyRepositoryForReplay(sandboxRoot);
    const sandboxProtectedBefore = hashInventory(sandboxRoot, protectedPaths);
    const sandboxDataBefore = hashInventory(sandboxRoot, dataPaths);
    const sandboxOptionsBefore = hashInventory(sandboxRoot, optionPaths);
    const sandboxHtmlBefore = hashInventory(sandboxRoot, protectedHtmlPaths);
    writeFileSync(join(sandboxRoot, 'rlviews.js'), baselineBytes('rlviews.js'));
    writeFileSync(join(sandboxRoot, 'rlapp.js'), baselineBytes('rlapp.js'));
    const migrationPolicy = reconstructScope01MigrationPolicy(sandboxRoot);
    const sandboxRegistry = JSON.parse(readFileSync(join(sandboxRoot, 'tools.json'), 'utf8'));

    assert.equal(sandboxRegistry.tools.length, 23);
    assert.equal(sandboxRegistry.tools.every((tool) => Object.hasOwn(tool, 'experience')), true, 'Scope 01 registry declarations must remain intact');
    assert.deepEqual(migrationPolicy, {
      contractVersion: 'experience-migration-policy/v1',
      phase: 'contract-shadow',
      shadowOnly: true,
      visibleModeCutover: false,
      panelBootstrap: false
    });

    sandboxSite = await startSandboxStaticServer(sandboxRoot);
    page = await browser.newPage();
    await page.goto(`${sandboxSite.baseUrl}/__scope02-storage-seed__`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((sentinels) => {
      for (const [key, value] of Object.entries(sentinels)) localStorage.setItem(key, value);
    }, STORAGE_SENTINELS);
    const storageBefore = await readStorageSentinels(page);

    await page.goto(`${sandboxSite.baseUrl}/market-heatmap-lab.html`, { waitUntil: 'domcontentloaded' });
    await page.addScriptTag({ url: `${sandboxSite.baseUrl}/rlviews.js` });
    await page.waitForFunction(() => {
      const roots = [document.getElementById('rlviews'), document.getElementById('modeSeg')].filter(Boolean);
      const labels = roots.flatMap((root) => Array.from(root.querySelectorAll('button'), (button) => button.textContent.trim().toLowerCase()));
      return labels.includes('simple') && labels.includes('power');
    });
    const legacyState = await page.evaluate(() => {
      const roots = [document.getElementById('rlviews'), document.getElementById('modeSeg')].filter(Boolean);
      const buttons = roots.flatMap((root) => Array.from(root.querySelectorAll('button')));
      const result = {};
      for (const mode of ['simple', 'power']) {
        const button = buttons.find((candidate) => candidate.textContent.trim().toLowerCase() === mode);
        const style = button && getComputedStyle(button);
        result[mode] = {
          present: Boolean(button),
          visible: Boolean(button && style.display !== 'none' && style.visibility !== 'hidden' && button.getBoundingClientRect().height > 0),
          ariaHidden: button?.getAttribute('aria-hidden') || null,
          tabIndex: button?.tabIndex ?? null
        };
      }
      return {
        ...result,
        currentShellCount: document.querySelectorAll('#rlviews[data-rlexperience-shell="ready"]').length
      };
    });
    assert.deepEqual(legacyState, {
      simple: { present: true, visible: true, ariaHidden: null, tabIndex: 0 },
      power: { present: true, visible: true, ariaHidden: null, tabIndex: -1 },
      currentShellCount: 0
    });

    await page.evaluate(() => {
      const roots = [document.getElementById('rlviews'), document.getElementById('modeSeg')].filter(Boolean);
      const button = roots.flatMap((root) => Array.from(root.querySelectorAll('button')))
        .find((candidate) => candidate.textContent.trim().toLowerCase() === 'power');
      button.click();
    });
    await page.waitForFunction(() => document.body.classList.contains('power'));
    const powerBehavior = await page.evaluate(() => ({
      bodyPower: document.body.classList.contains('power'),
      visiblePowerPanels: Array.from(document.querySelectorAll('.pw')).filter((node) => getComputedStyle(node).display !== 'none').length
    }));
    assert.equal(powerBehavior.bodyPower, true);
    assert.equal(powerBehavior.visiblePowerPanels > 0, true);

    await page.evaluate(() => {
      const roots = [document.getElementById('rlviews'), document.getElementById('modeSeg')].filter(Boolean);
      const button = roots.flatMap((root) => Array.from(root.querySelectorAll('button')))
        .find((candidate) => candidate.textContent.trim().toLowerCase() === 'simple');
      button.click();
    });
    await page.waitForFunction(() => !document.body.classList.contains('power'));
    const simpleBehavior = await page.evaluate(() => ({
      bodyPower: document.body.classList.contains('power'),
      visiblePowerPanels: Array.from(document.querySelectorAll('.pw')).filter((node) => getComputedStyle(node).display !== 'none').length
    }));
    assert.equal(simpleBehavior.bodyPower, false);
    assert.equal(simpleBehavior.visiblePowerPanels, 0);
    assert.deepEqual(await readStorageSentinels(page), storageBefore);
    assert.deepEqual(hashInventory(sandboxRoot, protectedPaths), sandboxProtectedBefore);
    assert.deepEqual(hashInventory(sandboxRoot, dataPaths), sandboxDataBefore);
    assert.deepEqual(hashInventory(sandboxRoot, optionPaths), sandboxOptionsBefore);
    assert.deepEqual(hashInventory(sandboxRoot, protectedHtmlPaths), sandboxHtmlBefore);

    restoreSnapshot(sandboxRoot, currentScopeSnapshot);
    assert.deepEqual(hashInventory(sandboxRoot, SCOPE02_CURRENT_PATHS), allowedBefore);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]');
    const restoredState = await page.evaluate(() => ({
      labels: Array.from(document.querySelectorAll('#rlviews [role="tab"]'), (node) => node.textContent.trim()),
      panelCount: document.querySelectorAll('[data-rlexperience-panel]').length,
      legacySuppressed: Array.from(document.querySelectorAll('#modeSeg, #simpleTab, #powerTab')).every((node) => (
        getComputedStyle(node).display === 'none'
        && node.getAttribute('aria-hidden') === 'true'
        && node.tabIndex === -1
      )),
      shellState: document.querySelector('#rlviews')?.getAttribute('data-rlexperience-canary') || null
    }));
    assert.deepEqual(restoredState, {
      labels: ['Simple', 'Power', 'Brief', 'Journey'],
      panelCount: 4,
      legacySuppressed: true,
      shellState: 'shadow-safe'
    });
    assert.deepEqual(await readStorageSentinels(page), storageBefore);
    assert.deepEqual(hashInventory(sandboxRoot, protectedPaths), sandboxProtectedBefore);
    assert.deepEqual(hashInventory(REPOSITORY_ROOT, SCOPE02_CURRENT_PATHS), allowedBefore);
    assert.deepEqual(hashInventory(REPOSITORY_ROOT, protectedPaths), protectedBefore);

    console.log(`[scope02-rollback] sandbox=${temporaryRoot.split(sep).at(-1)} browser=${SYSTEM_CHROME} server=no-store-static`);
    console.log('[scope02-rollback] baselineAuthority=git:HEAD sharedFiles=rlviews.js,rlapp.js configReconstruction=scope01-explicit-contract');
    console.log(`[scope02-rollback] boundary allowedFiles=${SCOPE02_CURRENT_PATHS.length} protectedFiles=${protectedPaths.length} worktreeFiles=${worktreePaths.length}`);
    console.log(`[scope02-rollback] protectedDigest=${inventoryDigest(protectedBefore)} byteEqual=true`);
    console.log(`[scope02-rollback] dataFiles=${dataPaths.length} dataDigest=${inventoryDigest(sandboxDataBefore)} byteEqual=true`);
    console.log(`[scope02-rollback] optionFiles=${optionPaths.length} optionDigest=${inventoryDigest(sandboxOptionsBefore)} byteEqual=true`);
    console.log(`[scope02-rollback] protectedHtmlFiles=${protectedHtmlPaths.length} htmlDigest=${inventoryDigest(sandboxHtmlBefore)} byteEqual=true`);
    console.log('[scope02-rollback] scope01Registry tools=23 experiences=23 phase=contract-shadow shadowOnly=true visibleModeCutover=false panelBootstrap=false');
    console.log(`[scope02-rollback] legacyControls simpleVisible=${legacyState.simple.visible} powerVisible=${legacyState.power.visible} currentShellCount=${legacyState.currentShellCount}`);
    console.log(`[scope02-rollback] legacyPower bodyPower=${powerBehavior.bodyPower} visiblePowerPanels=${powerBehavior.visiblePowerPanels}`);
    console.log(`[scope02-rollback] legacySimple bodyPower=${simpleBehavior.bodyPower} visiblePowerPanels=${simpleBehavior.visiblePowerPanels}`);
    console.log(`[scope02-rollback] storageSentinels=${Object.keys(STORAGE_SENTINELS).length} modeLocalPortfolioJourneyByteEqual=true`);
    console.log('[scope02-rollback] restore currentScopeHashesEqual=true protectedHashesEqual=true dataOptionsHtmlHashesEqual=true');
    console.log(`[scope02-rollback] restoredShell labels=${restoredState.labels.join('|')} panels=${restoredState.panelCount} legacySuppressed=${restoredState.legacySuppressed} state=${restoredState.shellState}`);
    console.log('[scope02-rollback] realWorktree allowedHashesEqual=true protectedHashesEqual=true');
  } finally {
    if (page) await page.close();
    if (sandboxSite) await sandboxSite.close();
    rmSync(temporaryRoot, { recursive: true, force: true });
    assert.equal(existsSync(temporaryRoot), false, 'rollback rehearsal temporary directory must always be removed');
  }
  console.log('[scope02-rollback] cleanup temporarySandboxRemoved=true');
});