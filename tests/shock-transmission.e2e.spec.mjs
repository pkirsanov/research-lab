import { existsSync, readFileSync } from 'node:fs';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const ROOT = new URL('../', import.meta.url);
const ROUTE_PATH = 'research-agenda-lab.html';
const ROUTE_URL = `${ROUTE_PATH}#simple/geopolitical-supply-shock`;
const BINDING_KEYS = Object.freeze([
  'contractVersion',
  'foundationContractVersion',
  'resourcePolicy',
  'resourcePolicyDigest'
]);

let site;

test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

function readRepoText(relativePath) {
  return readFileSync(new URL(relativePath, ROOT), 'utf8');
}

function countOccurrences(source, fragment) {
  return source.split(fragment).length - 1;
}

function replaceOnce(source, fragment, replacement, label) {
  expect(countOccurrences(source, fragment), `${label} mutation anchor count`).toBe(1);
  return source.replace(fragment, replacement);
}

function scriptSources(source) {
  return Array.from(source.matchAll(/<script src="([^"]+)"><\/script>/g), (match) => match[1]);
}

function bindingSourceConforms(source) {
  const scripts = scriptSources(source);
  const shockIndex = scripts.indexOf('rlshock.js');
  const agendaIndex = scripts.indexOf('rlagenda.js');
  const bindCall = '          bindShockFoundation(values[3]);';
  const initialSelection = '          var selected = state.agenda.topics.some';
  return shockIndex >= 0
    && agendaIndex === shockIndex + 1
    && countOccurrences(source, '<script src="rlshock.js"></script>') === 1
    && countOccurrences(source, 'RLSHOCK.resolveResourcePolicy(config)') === 1
    && countOccurrences(source, 'fetchJson("market-brief.config.json")') === 1
    && countOccurrences(source, bindCall) === 1
    && source.indexOf(bindCall) < source.indexOf(initialSelection);
}

async function installPolicyResolutionCounter(page) {
  await page.addInitScript(() => {
    let assignedApi;
    globalThis.__feature031PolicyResolutionCount = 0;
    Object.defineProperty(globalThis, 'RLSHOCK', {
      configurable: true,
      get() { return assignedApi; },
      set(api) {
        const wrapped = {};
        for (const key of Object.keys(api)) wrapped[key] = api[key];
        if (typeof api.resolveResourcePolicy === 'function') {
          wrapped.resolveResourcePolicy = function resolveResourcePolicy(config) {
            globalThis.__feature031PolicyResolutionCount += 1;
            return api.resolveResourcePolicy(config);
          };
        }
        assignedApi = Object.freeze(wrapped);
      }
    });
  });
}

async function observeRoute(page, baseUrl) {
  await page.goto(`${baseUrl}/${ROUTE_URL}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const debug = globalThis.__researchAgendaDebug;
    return debug && (debug.getViewState() !== null || debug.getBootFailure() !== null);
  }, null, { timeout: 15000 });
  return page.evaluate(() => {
    const debug = globalThis.__researchAgendaDebug;
    const binding = typeof debug.getShockFoundationBinding === 'function'
      ? debug.getShockFoundationBinding()
      : null;
    return {
      binding,
      bindingFrozen: binding !== null && Object.isFrozen(binding),
      bindingKeys: binding === null ? [] : Object.keys(binding),
      digestMatches: binding !== null
        && binding.resourcePolicyDigest === globalThis.RLSHOCK.digest(binding.resourcePolicy),
      failure: debug.getBootFailure(),
      policyCallCount: globalThis.__feature031PolicyResolutionCount,
      policyFrozen: binding !== null && Object.isFrozen(binding.resourcePolicy),
      posture: document.getElementById('currentPosture').textContent,
      view: debug.getViewState()
    };
  });
}

async function observeOverrides(page, overrides) {
  const mutationSite = await startStaticServer({ overrides });
  try {
    return await observeRoute(page, mutationSite.baseUrl);
  } finally {
    await mutationSite.close();
  }
}

function expectExplicitBindingFailure(observation, expectedFragment) {
  expect(observation.binding).toBeNull();
  expect(observation.failure).not.toBeNull();
  expect(observation.failure.status).toBe('failed');
  expect(observation.failure.message).toContain(expectedFragment);
  expect(observation.view.bootStatus).toBe('failed');
  expect(observation.view.modelAvailable).toBe(false);
}

test('Regression: SCN-031-022 existing Agenda binds the shock foundation without a new route', async ({ page }) => {
  const routeSource = readRepoText(ROUTE_PATH);
  const shockSource = readRepoText('rlshock.js');
  const productionConfig = JSON.parse(readRepoText('market-brief.config.json'));

  expect(bindingSourceConforms(routeSource)).toBe(true);
  expect(existsSync(new URL('shock-transmission-lab.html', ROOT))).toBe(false);
  await installPolicyResolutionCounter(page);

  const production = await observeRoute(page, site.baseUrl);
  expect(production.failure).toBeNull();
  expect(production.policyCallCount).toBe(1);
  expect(production.bindingKeys).toEqual(BINDING_KEYS);
  expect(production.bindingFrozen).toBe(true);
  expect(production.policyFrozen).toBe(true);
  expect(production.digestMatches).toBe(true);
  expect(production.binding.contractVersion).toBe('research-agenda/shock-foundation-binding/v1');
  expect(production.binding.foundationContractVersion).toBe('shock-transmission/v1');
  expect(production.binding.resourcePolicy).toEqual(productionConfig['shock-transmission/resource-policy/v1']);
  expect(production.view).not.toBeNull();
  expect(Object.hasOwn(production.view, 'bootStatus')).toBe(false);

  const missingScriptSource = replaceOnce(
    routeSource,
    '  <script src="rlshock.js"></script>\n',
    '',
    'missing script'
  );
  expect(bindingSourceConforms(missingScriptSource)).toBe(false);
  const missingScript = await observeOverrides(page, { [ROUTE_PATH]: missingScriptSource });
  expectExplicitBindingFailure(missingScript, 'RLSHOCK-CONTRACT at $.RLSHOCK');
  expect(missingScript.policyCallCount).toBe(0);

  const reorderedScripts = replaceOnce(
    routeSource,
    '  <script src="rlshock.js"></script>\n  <script src="rlagenda.js"></script>',
    '  <script src="rlagenda.js"></script>\n  <script src="rlshock.js"></script>',
    'reordered scripts'
  );
  expect(bindingSourceConforms(reorderedScripts)).toBe(false);

  const missingCallSource = replaceOnce(
    routeSource,
    '          bindShockFoundation(values[3]);\n',
    '',
    'missing policy call'
  );
  expect(bindingSourceConforms(missingCallSource)).toBe(false);
  const missingCall = await observeOverrides(page, { [ROUTE_PATH]: missingCallSource });
  expectExplicitBindingFailure(missingCall, 'RLSHOCK-CONTRACT at $.shockFoundationBinding');
  expect(missingCall.policyCallCount).toBe(0);

  const duplicateCallSource = replaceOnce(
    routeSource,
    '          bindShockFoundation(values[3]);\n',
    '          bindShockFoundation(values[3]);\n          bindShockFoundation(values[3]);\n',
    'duplicate policy call'
  );
  expect(bindingSourceConforms(duplicateCallSource)).toBe(false);
  const duplicateCall = await observeOverrides(page, { [ROUTE_PATH]: duplicateCallSource });
  expectExplicitBindingFailure(duplicateCall, 'RLSHOCK-CONTRACT at $.shockFoundationBinding');
  expect(duplicateCall.policyCallCount).toBe(1);

  const changedBindingShapeSource = replaceOnce(
    routeSource,
    '        foundationContractVersion: RLSHOCK.CONTRACT_VERSIONS.snapshot,',
    '        foundationVersion: RLSHOCK.CONTRACT_VERSIONS.snapshot,',
    'changed binding shape'
  );
  const changedBindingShape = await observeOverrides(page, { [ROUTE_PATH]: changedBindingShapeSource });
  expectExplicitBindingFailure(changedBindingShape, 'RLSHOCK-CONTRACT at $.shockFoundationBinding');
  expect(changedBindingShape.policyCallCount).toBe(1);

  const changedSnapshotContractSource = replaceOnce(
    routeSource,
    '        foundationContractVersion: RLSHOCK.CONTRACT_VERSIONS.snapshot,',
    '        foundationContractVersion: RLSHOCK.CONTRACT_VERSIONS.definition,',
    'changed snapshot contract'
  );
  const changedSnapshotContract = await observeOverrides(page, { [ROUTE_PATH]: changedSnapshotContractSource });
  expectExplicitBindingFailure(changedSnapshotContract, 'RLSHOCK-VERSION-UNSUPPORTED at $.foundationContractVersion');
  expect(changedSnapshotContract.policyCallCount).toBe(1);

  const missingExportSource = replaceOnce(
    shockSource,
    '    resolveResourcePolicy: resolveResourcePolicy,\n',
    '',
    'missing policy export'
  );
  const missingExport = await observeOverrides(page, { 'rlshock.js': missingExportSource });
  expectExplicitBindingFailure(missingExport, 'RLSHOCK-CONTRACT at $.RLSHOCK.resolveResourcePolicy');
  expect(missingExport.policyCallCount).toBe(0);

  const rejectedConfig = structuredClone(productionConfig);
  rejectedConfig['shock-transmission/resource-policy/v1'].maxHorizonsPerDefinition = 47;
  const rejectedPolicy = await observeOverrides(page, {
    'market-brief.config.json': JSON.stringify(rejectedConfig)
  });
  expectExplicitBindingFailure(rejectedPolicy, 'RLSHOCK-RESOURCE');
  expect(rejectedPolicy.failure.message).toContain('maxHorizonsPerDefinition');
  expect(rejectedPolicy.policyCallCount).toBe(1);

  const rollbackSource = replaceOnce(
    replaceOnce(
      replaceOnce(routeSource, '  <script src="rlshock.js"></script>\n', '', 'rollback script'),
      '          bindShockFoundation(values[3]);\n',
      '',
      'rollback binding call'
    ),
    '        if (!state.shockFoundationBinding) return Promise.reject(foundationBindingError("RLSHOCK-CONTRACT", "$.shockFoundationBinding", "Shock foundation binding must complete before topic selection."));\n',
    '',
    'rollback topic guard'
  );
  const rollback = await observeOverrides(page, { [ROUTE_PATH]: rollbackSource });
  expect(rollback.failure).toBeNull();
  expect(rollback.binding).toBeNull();
  expect(rollback.policyCallCount).toBe(0);
  expect(production.view).toEqual(rollback.view);

  console.log(`TP-01-11 production policyCalls=${production.policyCallCount} bindingKeys=${production.bindingKeys.join(',')}`);
  console.log('TP-01-11 controls=missing-script,reordered-script,missing-call,duplicate-call,binding-shape,snapshot-contract,missing-export,rejected-policy');
  console.log(`TP-01-11 legacyViewParity=${JSON.stringify(production.view) === JSON.stringify(rollback.view)}`);
});