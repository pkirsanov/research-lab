import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage, fixture } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const NOW = '2026-07-15T14:00:00.000Z';
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');

function loadRuntime() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  const api = require('../rlportfolio.js');
  const policy = JSON.parse(readFileSync(POLICY_PATH, 'utf8'));
  assert.equal(api.validatePolicy(policy).ok, true);
  return { api, policy };
}

function candidateFromCsv(api, policy, workspace, name, now = NOW) {
  const preview = api.validateImport('csv', fixture('valid-portfolio.csv'), workspace, policy);
  assert.equal(preview.ok, true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  return api.buildWorkspaceCandidate(resolved.value, workspace, { name, now }, policy);
}

test('real-format import previews commits reloads and exports one local revision', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const candidate = candidateFromCsv(api, policy, opened.value.workspace, 'Long horizon research');
  assert.equal(candidate.ok, true);
  const committed = store.commitWorkspace(candidate.value, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  const reloaded = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace('2026-07-15T14:01:00.000Z');
  assert.equal(reloaded.ok, true);
  assert.equal(reloaded.value.workspace.currentPortfolioId, committed.value.workspace.currentPortfolioId);
  assert.equal(reloaded.value.workspace.portfolioRevisions.length, 1);
  assert.equal(reloaded.value.workspace.portfolioRevisions[0].holdings.length, 2);
  assert.equal(reloaded.value.storageState.lastVerifiedWrite, true);
  const previewExport = api.exportPreview({ portfolio: reloaded.value.workspace.portfolioRevisions[0] });
  const privateExport = api.exportPrivate({ portfolio: reloaded.value.workspace.portfolioRevisions[0] });
  assert.equal(previewExport.value.personalValuesIncluded, false);
  assert.equal(privateExport.value.warning, 'Private local export - review the destination before saving');
  assert.equal(privateExport.value.mimeType, 'application/json');
});

test('secret-bearing import is redacted and cannot mutate any storage namespace', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const first = store.commitWorkspace(candidateFromCsv(api, policy, store.openWorkspace(NOW).value.workspace, 'Current portfolio').value, 0, NOW);
  assert.equal(first.ok, true);
  const before = JSON.stringify(localStorage.snapshot());
  const sentinel = 'SCOPE01-FUNCTIONAL-PRIVATE-' + Date.now();
  const invalid = api.validateImport('csv', fixture('invalid-secret-portfolio.csv').replaceAll('__PRIVATE_SENTINEL__', sentinel), first.value.workspace, policy);
  assert.equal(invalid.ok, true);
  assert.equal(invalid.value.canConfirm, false);
  assert.equal(invalid.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET'), true);
  assert.equal(JSON.stringify(invalid.value.errors).includes(sentinel), false);
  assert.equal(JSON.stringify(localStorage.snapshot()), before);
  assert.equal(JSON.stringify(sessionStorage.snapshot()).includes(sentinel), false);
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, first.value.workspace.currentPortfolioId);
});

test('atomic write failures preserve the active pointer and retain a validated candidate only in memory', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const first = store.commitWorkspace(candidateFromCsv(api, policy, store.openWorkspace(NOW).value.workspace, 'First revision').value, 0, NOW);
  assert.equal(first.ok, true);
  const pointerBefore = localStorage.getItem('rlPortfolioWorkspaceV1.pointer');
  localStorage.failSet('rlPortfolioWorkspaceV1.pointer');
  const second = candidateFromCsv(api, policy, first.value.workspace, 'Second revision', '2026-07-15T14:02:00.000Z');
  const result = store.commitWorkspace(second.value, 1, '2026-07-15T14:02:00.000Z');
  assert.equal(result.ok, false);
  assert.equal(result.error.reason, 'pointer-write-failed');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'), pointerBefore);
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, first.value.workspace.currentPortfolioId);
  assert.equal(store.currentMemoryWorkspace().currentPortfolioId, second.value.currentPortfolioId);
  assert.equal(JSON.stringify(result.error).includes('Second revision'), false);
});

test('session and memory commits state truthfully and preserve the last valid candidate after rejection', () => {
  const { api, policy } = loadRuntime();
  const blockedDurable = createStorage({ failSet: ['rlPortfolioWorkspaceV1.probe'] });
  const sessionStorage = createStorage();
  const sessionStore = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage }, policy);
  const sessionOpen = sessionStore.openWorkspace(NOW);
  const sessionCommit = sessionStore.commitWorkspace(candidateFromCsv(api, policy, sessionOpen.value.workspace, 'Session revision').value, 0, NOW);
  assert.equal(sessionCommit.ok, true);
  assert.equal(sessionCommit.value.storageState.mode, 'session');
  assert.equal(sessionCommit.value.storageState.savedDurably, false);
  const sessionReload = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage }, policy).openWorkspace(NOW);
  assert.equal(sessionReload.value.workspace.currentPortfolioId, sessionCommit.value.workspace.currentPortfolioId);
  const blockedSession = createStorage({ failSet: ['rlPortfolioWorkspaceSessionV1.probe'] });
  const memoryStore = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage: blockedSession }, policy);
  const memoryOpen = memoryStore.openWorkspace(NOW);
  const memoryCommit = memoryStore.commitWorkspace(candidateFromCsv(api, policy, memoryOpen.value.workspace, 'Memory revision').value, 0, NOW);
  assert.equal(memoryCommit.ok, true);
  assert.equal(memoryCommit.value.storageState.mode, 'memory');
  const invalid = api.validateImport('csv', fixture('invalid-secret-portfolio.csv'), memoryCommit.value.workspace, policy);
  assert.equal(invalid.value.canConfirm, false);
  assert.equal(memoryStore.currentMemoryWorkspace().currentPortfolioId, memoryCommit.value.workspace.currentPortfolioId);
});

test('hostile manual labels remain inert data and namespace writes stay closed', () => {
  const { api, policy } = loadRuntime();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const preview = api.validateImport('json', fixture('manual-alternative.json'), null, policy);
  assert.equal(preview.ok, true);
  const candidate = api.buildWorkspaceCandidate(preview.value, store.openWorkspace(NOW).value.workspace, { name: 'Manual sleeve', now: NOW }, policy);
  const committed = store.commitWorkspace(candidate.value, 0, NOW);
  assert.equal(committed.ok, true);
  assert.equal(committed.value.workspace.portfolioRevisions[0].holdings[0].label, 'Private credit sleeve <script>not executable</script>');
  assert.equal(committed.value.workspace.portfolioRevisions[0].holdings[0].lifecycleState, 'manual');
  assert.equal(Object.keys(localStorage.snapshot()).every((key) => /^rlPortfolio/.test(key)), true);
  assert.equal(localStorage.getItem('rlData'), null);
  assert.equal(localStorage.getItem('rlApiKeys'), null);
});