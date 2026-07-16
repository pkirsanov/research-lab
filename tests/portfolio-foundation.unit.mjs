import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT, createStorage, fixture } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');
const NOW = '2026-07-15T13:30:00.000Z';

function loadContracts() {
  assert.equal(existsSync(MODULE_PATH), true, 'RLPORTFOLIO production module must exist');
  assert.equal(existsSync(POLICY_PATH), true, 'mandatory portfolio policy must exist');
  delete require.cache[require.resolve('../rlportfolio.js')];
  return {
    api: require('../rlportfolio.js'),
    policy: JSON.parse(readFileSync(POLICY_PATH, 'utf8'))
  };
}

function validDraft(api, policy) {
  const preview = api.validateImport('csv', fixture('valid-portfolio.csv'), null, policy);
  assert.equal(preview.ok, true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  assert.equal(resolved.value.canConfirm, true);
  return resolved.value;
}

test('RLPORTFOLIO is a frozen Node and browser dual-runtime contract', () => {
  const { api } = loadContracts();
  const source = readFileSync(MODULE_PATH, 'utf8');
  const contractsSource = readFileSync(resolve(ROOT, 'rlcontracts.js'), 'utf8');
  const browserRoot = {};
  Function('globalThis', 'window', 'module', 'exports', 'require', `${contractsSource}\nreturn globalThis.RLCONTRACTS;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  Function('globalThis', 'window', 'module', 'exports', 'require', `${source}\nreturn globalThis.RLPORTFOLIO;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  assert.equal(Object.isFrozen(api), true);
  assert.equal(Object.isFrozen(browserRoot.RLPORTFOLIO), true);
  assert.deepEqual(Object.keys(browserRoot.RLPORTFOLIO).sort(), Object.keys(api).sort());
  assert.doesNotMatch(source, /\b(?:fetch|XMLHttpRequest|document|watchlist\.json|rlData)\b/);
});

test('mandatory policy is closed versioned finite and rejects unknown configuration', () => {
  const { api, policy } = loadContracts();
  assert.equal(api.validatePolicy(policy).ok, true);
  assert.equal(api.validatePolicy({ ...policy, hiddenDefault: true }).error.reason, 'unknown-field');
  assert.equal(api.validatePolicy({ ...policy, contractVersion: 'portfolio-survival-allocation-policy/v2' }).error.reason, 'unknown-version');
  assert.equal(api.validatePolicy({ ...policy, analytics: { ...policy.analytics, targetHistoryCalendarYears: Number.POSITIVE_INFINITY } }).error.reason, 'non-finite-policy');
  assert.equal(api.validatePolicy({ ...policy, storage: { ...policy.storage, workspaceNamespace: '' } }).error.reason, 'invalid-policy');
});

test('holding revision and workspace identities are strict deterministic contracts', () => {
  const { api, policy } = loadContracts();
  const draft = validDraft(api, policy);
  const empty = api.createEmptyWorkspace(policy, NOW);
  assert.equal(empty.ok, true);
  const candidateA = api.buildWorkspaceCandidate(draft, empty.value, { name: 'Retirement research', now: NOW }, policy);
  const candidateB = api.buildWorkspaceCandidate(draft, empty.value, { name: 'Retirement research', now: NOW }, policy);
  assert.equal(candidateA.ok, true);
  assert.equal(candidateB.ok, true);
  assert.equal(candidateA.value.currentPortfolioId, candidateB.value.currentPortfolioId);
  assert.equal(candidateA.value.semanticFingerprint, candidateB.value.semanticFingerprint);
  assert.match(candidateA.value.currentPortfolioId, /^sha256:[a-f0-9]{64}$/);
  assert.equal(api.validateWorkspace(candidateA.value, policy).ok, true);
  const revision = candidateA.value.portfolioRevisions[0];
  assert.equal(api.validatePortfolioRevision(revision, policy).ok, true);
  assert.equal(api.validateHoldingEntry({ ...revision.holdings[0], hidden: true }, policy).error.reason, 'unknown-field');
  assert.equal(api.validateWorkspace({ ...candidateA.value, unexpected: true }, policy).error.reason, 'unknown-field');
});

test('valid CSV preview exposes accepted normalized and unresolved duplicate states before confirmation', () => {
  const { api, policy } = loadContracts();
  const result = api.validateImport('csv', fixture('valid-portfolio.csv'), null, policy);
  assert.equal(result.ok, true);
  assert.equal(result.value.rows.length, 3);
  assert.equal(result.value.summary.accepted, 3);
  assert.equal(result.value.summary.normalized > 0, true);
  assert.equal(result.value.summary.duplicates, 2);
  assert.equal(result.value.summary.unresolved, 0);
  assert.equal(result.value.summary.rejected, 0);
  assert.equal(result.value.canConfirm, false);
  assert.deepEqual(result.value.duplicateChoices, ['merge', 'separate']);
});

test('duplicate choices are explicit and row removal can create a valid new preview', () => {
  const { api, policy } = loadContracts();
  const merged = api.resolveDuplicates(api.validateImport('csv', fixture('valid-portfolio.csv'), null, policy).value, 'merge');
  const separate = api.resolveDuplicates(api.validateImport('csv', fixture('valid-portfolio.csv'), null, policy).value, 'separate');
  assert.equal(merged.value.canConfirm, true);
  assert.equal(merged.value.holdings.length, 2);
  assert.equal(separate.value.canConfirm, true);
  assert.equal(separate.value.holdings.length, 3);
  const removable = api.validateImport('csv', fixture('removable-invalid-portfolio.csv'), null, policy);
  assert.equal(removable.value.canConfirm, false);
  const repaired = api.applyDraftRemoval(removable.value, [2]);
  assert.equal(repaired.ok, true);
  assert.equal(repaired.value.canConfirm, true);
  assert.equal(repaired.value.summary.rejected, 0);
});

test('unknown import fields remain blocking through duplicate resolution', () => {
  const { api, policy } = loadContracts();
  const bytes = 'symbol,assetType,currency,quantity,price,unregisteredNote\nMSFT,listed,USD,10,450.25,private context\nMSFT,listed,USD,2,451.00,private context\n';
  const preview = api.validateImport('csv', bytes, null, policy);
  assert.equal(preview.ok, true);
  assert.equal(preview.value.canConfirm, false);
  assert.equal(preview.value.errors.some((error) => error.code === 'P008-IMPORT-SHAPE' && error.reason === 'unknown-field'), true);
  const resolved = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(resolved.ok, true);
  assert.equal(resolved.value.canConfirm, false);
  assert.equal(resolved.value.errors.some((error) => error.code === 'P008-IMPORT-SHAPE' && error.reason === 'unknown-field'), true);
});

test('secret-shaped import rejects the full draft with value-safe PortfolioError values', () => {
  const { api, policy } = loadContracts();
  const sentinel = 'SCOPE01-RUNTIME-PRIVATE-' + Date.now();
  const bytes = fixture('invalid-secret-portfolio.csv').replaceAll('__PRIVATE_SENTINEL__', sentinel);
  const result = api.validateImport('csv', bytes, null, policy);
  assert.equal(result.ok, true);
  assert.equal(result.value.canConfirm, false);
  assert.equal(result.value.holdings.length, 0);
  assert.equal(result.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET'), true);
  assert.equal(result.value.errors.every((error) => error.contractVersion === 'PortfolioError/v1' && error.valueEchoed === false), true);
  assert.equal(JSON.stringify(result).includes(sentinel), false);
  assert.equal(api.validatePortfolioError({ ...result.value.errors[0], rawValue: sentinel }).error.reason, 'unknown-field');
});

test('manual alternatives require valuation liquidity cost and uncertainty truth', () => {
  const { api, policy } = loadContracts();
  const valid = api.validateImport('json', fixture('manual-alternative.json'), null, policy);
  assert.equal(valid.ok, true);
  assert.equal(valid.value.canConfirm, true);
  assert.equal(valid.value.holdings[0].lifecycleState, 'manual');
  const missingTruth = JSON.parse(fixture('manual-alternative.json'));
  delete missingTruth.holdings[0].uncertaintyNote;
  const invalid = api.validateImport('json', JSON.stringify(missingTruth), null, policy);
  assert.equal(invalid.ok, true);
  assert.equal(invalid.value.canConfirm, false);
  assert.equal(invalid.value.errors.some((error) => error.field === 'uncertaintyNote'), true);
});

test('manual listed drafts use the same closed preview contract as file imports', () => {
  const { api, policy } = loadContracts();
  const preview = api.validateManualDraft({
    assetType: 'listed',
    symbol: ' spy ',
    currency: 'usd',
    quantity: 4,
    price: 625.5,
    costBasis: 2100
  }, null, policy);
  assert.equal(preview.ok, true);
  assert.equal(preview.value.canConfirm, true);
  assert.equal(preview.value.summary.accepted, 1);
  assert.equal(preview.value.summary.normalized, 1);
  assert.equal(preview.value.holdings[0].symbol, 'SPY');
  assert.equal(preview.value.holdings[0].inputBasis, 'quantity-price');
  assert.equal(api.validateManualDraft({ ...preview.value.holdings[0], accountNumber: 'private' }, null, policy).value.canConfirm, false);
});

test('atomic durable commits use inactive slots verify bytes and reject generation conflicts', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  const candidate = api.buildWorkspaceCandidate(validDraft(api, policy), opened.value.workspace, { name: 'Atomic portfolio', now: NOW }, policy);
  const committed = store.commitWorkspace(candidate.value, 0, NOW);
  assert.equal(committed.ok, true);
  assert.equal(committed.value.storageState.mode, 'durable');
  assert.equal(committed.value.workspace.generation, 1);
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, committed.value.workspace.currentPortfolioId);
  assert.deepEqual(Object.keys(localStorage.snapshot()).sort(), ['rlPortfolioWorkspaceV1.pointer', 'rlPortfolioWorkspaceV1.slotA']);
  const conflict = store.commitWorkspace(candidate.value, 0, NOW);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.error.code, 'P008-STORE-CONFLICT');
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, committed.value.workspace.currentPortfolioId);
});

test('clearing a portfolio is an atomic revision-state change that preserves immutable history', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const firstCandidate = api.buildWorkspaceCandidate(validDraft(api, policy), store.openWorkspace(NOW).value.workspace, { name: 'Clearable portfolio', now: NOW }, policy);
  const first = store.commitWorkspace(firstCandidate.value, 0, NOW);
  assert.equal(first.ok, true);
  const clearedCandidate = api.buildPortfolioClearCandidate(first.value.workspace, '2026-07-15T13:35:00.000Z', policy);
  assert.equal(clearedCandidate.ok, true);
  assert.equal(clearedCandidate.value.currentPortfolioId, null);
  assert.equal(clearedCandidate.value.portfolioRevisions.length, 1);
  const cleared = store.commitWorkspace(clearedCandidate.value, 1, '2026-07-15T13:35:00.000Z');
  assert.equal(cleared.ok, true);
  assert.equal(cleared.value.workspace.generation, 2);
  assert.equal(store.openWorkspace('2026-07-15T13:36:00.000Z').value.workspace.currentPortfolioId, null);
  assert.equal(store.openWorkspace('2026-07-15T13:36:00.000Z').value.workspace.portfolioRevisions.length, 1);
});

test('slot and pointer faults preserve the last-known-good revision', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const firstCandidate = api.buildWorkspaceCandidate(validDraft(api, policy), store.openWorkspace(NOW).value.workspace, { name: 'First', now: NOW }, policy).value;
  const first = store.commitWorkspace(firstCandidate, 0, NOW);
  assert.equal(first.ok, true);
  localStorage.failSet('rlPortfolioWorkspaceV1.pointer');
  const secondCandidate = api.buildWorkspaceCandidate(validDraft(api, policy), first.value.workspace, { name: 'Second', now: '2026-07-15T13:31:00.000Z' }, policy).value;
  const failed = store.commitWorkspace(secondCandidate, 1, '2026-07-15T13:31:00.000Z');
  assert.equal(failed.ok, false);
  assert.equal(failed.error.code, 'P008-STORE-WRITE');
  assert.equal(store.openWorkspace(NOW).value.workspace.currentPortfolioId, first.value.workspace.currentPortfolioId);
});

test('post-write slot corruption is detected before pointer publication', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage({ corruptAfterSet: { 'rlPortfolioWorkspaceV1.slotA': '{"corrupt":true}' } });
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const candidate = api.buildWorkspaceCandidate(validDraft(api, policy), store.openWorkspace(NOW).value.workspace, { name: 'Corruption probe', now: NOW }, policy);
  const result = store.commitWorkspace(candidate.value, 0, NOW);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'P008-STORE-WRITE');
  assert.equal(result.error.reason, 'slot-verification-failed');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'), null);
  assert.equal(store.currentMemoryWorkspace().currentPortfolioId, candidate.value.currentPortfolioId);
});

test('future records remain untouched and durable session memory states are explicit', () => {
  const { api, policy } = loadContracts();
  const future = JSON.stringify({ contractVersion: 'portfolio-workspace/v2', generation: 9 });
  const pointer = JSON.stringify({ contractVersion: 'portfolio-workspace-pointer/v1', activeSlot: 'slotA', generation: 9, semanticFingerprint: 'sha256:' + '1'.repeat(64), contentSha256: 'sha256:' + '2'.repeat(64) });
  const futureStorage = createStorage({ initial: { 'rlPortfolioWorkspaceV1.pointer': pointer, 'rlPortfolioWorkspaceV1.slotA': future } });
  const futureOpen = api.createPortfolioStore({ localStorage: futureStorage, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(futureOpen.ok, false);
  assert.equal(futureOpen.error.code, 'P008-SCHEMA-FUTURE');
  assert.equal(futureStorage.getItem('rlPortfolioWorkspaceV1.slotA'), future);
  const blockedDurable = createStorage({ failSet: ['rlPortfolioWorkspaceV1.probe'] });
  const sessionOpen = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(sessionOpen.value.storageState.mode, 'session');
  assert.equal(sessionOpen.value.storageState.warning, 'Session-only - closes with this tab');
  const blockedSession = createStorage({ failSet: ['rlPortfolioWorkspaceSessionV1.probe'] });
  const memoryOpen = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage: blockedSession }, policy).openWorkspace(NOW);
  assert.equal(memoryOpen.value.storageState.mode, 'memory');
  assert.equal(memoryOpen.value.storageState.durable, false);
  assert.match(memoryOpen.value.storageState.warning, /closes with this tab/i);
});

test('unknown legacy workspace shapes refuse migration and quarantine metadata is value-safe', () => {
  const { api, policy } = loadContracts();
  const legacy = JSON.stringify({ contractVersion: 'portfolio-workspace/v0', generation: 2, privateValue: 'must-remain-private' });
  const pointer = JSON.stringify({ contractVersion: 'portfolio-workspace-pointer/v1', activeSlot: 'slotA', generation: 2, semanticFingerprint: 'sha256:' + '3'.repeat(64), contentSha256: 'sha256:' + '4'.repeat(64) });
  const localStorage = createStorage({ initial: { 'rlPortfolioWorkspaceV1.pointer': pointer, 'rlPortfolioWorkspaceV1.slotA': legacy } });
  const result = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'P008-MIGRATION');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.slotA'), legacy);
  const quarantine = localStorage.getItem('rlPortfolioWorkspaceV1.quarantine');
  assert.equal(typeof quarantine, 'string');
  assert.equal(quarantine.includes('must-remain-private'), false);
  assert.match(quarantine, /sha256:[a-f0-9]{64}/);
});

test('foundation privacy inventory and verified clear remain available without policy config', () => {
  const { api } = loadContracts();
  const localStorage = createStorage({ initial: {
    'rlPortfolioWorkspaceV1.pointer': 'personal-pointer',
    'rlPortfolioWorkspaceV1.slotA': 'personal-slot',
    'rlPortfolioWorkspaceV1.quarantine': 'safe-metadata',
    rlData: 'public-cache',
    rlApiKeys: 'central-credential-owner'
  } });
  const sessionStorage = createStorage({ initial: {
    rlPortfolioWorkspaceSessionV1: 'personal-session',
    rlReturnContextV1: 'personal-handoff'
  } });
  const before = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(before.ok, true);
  assert.equal(before.value.personalKeyCount, 5);
  assert.equal(JSON.stringify(before.value).includes('personal-slot'), false);
  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true);
  assert.equal(cleared.value.verifiedEmpty, true);
  assert.equal(cleared.value.remainingPersonalKeys.length, 0);
  assert.equal(localStorage.getItem('rlData'), 'public-cache');
  assert.equal(localStorage.getItem('rlApiKeys'), 'central-credential-owner');
});