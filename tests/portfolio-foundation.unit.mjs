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
  const chained = api.buildWorkspaceCandidate(draft, candidateA.value, { name: 'Retirement research', now: NOW }, policy);
  assert.equal(chained.ok, true);
  const superseding = chained.value.portfolioRevisions[1];
  assert.equal(superseding.supersedes, revision.portfolioId);
  assert.equal(superseding.semanticFingerprint, revision.semanticFingerprint, 'identical content must keep one semantic identity regardless of lineage');
  assert.notEqual(superseding.portfolioId, revision.portfolioId, 'the revision id must still distinguish position in the lineage chain');
  assert.equal(api.validatePortfolioRevision(superseding, policy).ok, true, 'the validator must re-derive both fingerprints exactly as the builder did');
  assert.equal(api.validateWorkspace(chained.value, policy).ok, true);
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

function mandateFixture(name) {
  return JSON.parse(fixture(name));
}

function mandateDraft(api, policy, name, now = NOW) {
  const result = api.validateMandateDraft(mandateFixture(name), api.createEmptyWorkspace(policy, now).value, { now }, policy);
  assert.equal(result.ok, true);
  return result.value;
}

test('explicit mandate draft is a closed user-authority contract over units dates currencies and hard research classification', () => {
  const { api, policy } = loadContracts();
  const draft = mandateDraft(api, policy, 'mandate-explicit.json');
  assert.equal(draft.contractVersion, 'portfolio-mandate-preview/v1');
  assert.equal(draft.canConfirm, true);
  assert.deepEqual(draft.errors, []);
  assert.deepEqual(draft.conflicts, []);
  assert.equal(draft.summary.hardConstraints, 2);
  assert.equal(draft.summary.researchConstraints, 0);
  assert.equal(draft.mandate.horizon.unit, 'calendar-date');
  assert.equal(draft.mandate.horizon.endDate, '2036-12-31');
  assert.equal(draft.mandate.valuationCurrency, 'USD');
  assert.equal(draft.mandate.cashNeeds[0].unit, 'currency');
  assert.equal(draft.mandate.cashNeeds[0].treatmentTiming, 'start-of-step');
  assert.equal(draft.mandate.cashNeeds[0].priority, 1);
  assert.equal(draft.mandate.constraints.every((entry) => entry.inputAuthority === 'user'), true);
  assert.equal(draft.mandate.cashNeeds.every((entry) => entry.inputAuthority === 'user'), true);
  const raw = mandateFixture('mandate-explicit.json');
  assert.equal(api.validateMandateDraft({ ...raw, inputAuthority: 'user' }, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'unknown-field'), true);
  assert.equal(api.validateMandateDraft({ ...raw, horizon: { endDate: '2036-12-31', unit: 'trading-day' } }, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'horizon-invalid'), true);
  assert.equal(api.validateMandateDraft({ ...raw, horizon: { endDate: '2020-01-31', unit: 'calendar-date' } }, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'horizon-not-future'), true);
  assert.equal(api.validateMandateDraft({ ...raw, valuationCurrency: 'dollars' }, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'valuation-currency-invalid'), true);
  const badUnit = { ...raw, constraints: [{ ...raw.constraints[0], unit: 'basis-points' }] };
  assert.equal(api.validateMandateDraft(badUnit, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'constraint-unit-invalid'), true);
  const badAuthority = { ...raw, constraints: [{ ...raw.constraints[0], constraintKind: 'inferred' }] };
  assert.equal(api.validateMandateDraft(badAuthority, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'constraint-authority-invalid'), true);
  const badTiming = { ...raw, cashNeeds: [{ ...raw.cashNeeds[0], treatmentTiming: 'whenever' }] };
  assert.equal(api.validateMandateDraft(badTiming, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'cash-need-timing-invalid'), true);
  const pastNeed = { ...raw, cashNeeds: [{ ...raw.cashNeeds[0], date: '2026-01-31' }] };
  assert.equal(api.validateMandateDraft(pastNeed, null, { now: NOW }, policy).value.conflicts.some((conflict) => conflict.reason === 'cash-need-date-past'), true);
  assert.equal(draft.mandate.objectiveLabel, 'Fund a dated withdrawal without forced selling');
  const missingPurpose = { ...raw, objectiveLabel: '' };
  assert.equal(api.validateMandateDraft(missingPurpose, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'objective-label-required'), true);
  assert.equal(draft.mandate.cashNeeds[0].amount, 40000);
  const badAmount = { ...raw, cashNeeds: [{ ...raw.cashNeeds[0], amount: 0 }] };
  assert.equal(api.validateMandateDraft(badAmount, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'cash-need-amount-invalid'), true);
  const badFraction = { ...raw, cashNeeds: [{ ...raw.cashNeeds[0], unit: 'portfolio-fraction', amount: 1.5 }] };
  assert.equal(api.validateMandateDraft(badFraction, null, { now: NOW }, policy).value.errors.some((error) => error.reason === 'cash-need-fraction-out-of-range'), true);
});

test('absent mandate fields stay null and no default horizon floor objective or expected return is created', () => {
  const { api, policy } = loadContracts();
  const draft = mandateDraft(api, policy, 'mandate-explicit.json');
  assert.deepEqual(draft.absentFields.slice().sort(), ['costPolicy', 'expectedReturnPolicy', 'rebalancePolicy', 'survivalDefinition']);
  assert.equal(draft.mandate.survivalDefinition, null);
  assert.equal(draft.mandate.rebalancePolicy, null);
  assert.equal(draft.mandate.costPolicy, null);
  assert.equal(draft.mandate.expectedReturnPolicy, null);
  const committed = api.buildMandateCandidate(draft, api.createEmptyWorkspace(policy, NOW).value, { now: NOW }, policy);
  assert.equal(committed.ok, true);
  const mandate = committed.value.mandateRevisions[0];
  assert.deepEqual(
    ['survivalDefinition', 'rebalancePolicy', 'costPolicy', 'expectedReturnPolicy'].map((field) => mandate[field]),
    [null, null, null, null]
  );
  const emptyRoutes = api.projectRouteStates(api.createEmptyWorkspace(policy, NOW).value, policy);
  assert.equal(emptyRoutes.ok, true);
  assert.equal(emptyRoutes.value.currentMandateId, null);
  assert.equal(emptyRoutes.value.routes.every((route) => Object.values(route.inferredValues).every((entry) => entry === null)), true);
  assert.equal(emptyRoutes.value.routes.every((route) => route.horizon === null && route.constraints.length === 0 && route.cashNeeds.length === 0), true);
});

test('conflicting mandate stays infeasible with every declared constraint and cash need preserved in declared order', () => {
  const { api, policy } = loadContracts();
  const draft = mandateDraft(api, policy, 'mandate-conflicting.json');
  assert.equal(draft.canConfirm, false);
  assert.deepEqual(draft.errors, []);
  assert.equal(draft.declaredConstraints, 2);
  assert.equal(draft.declaredCashNeeds, 3);
  assert.equal(draft.mandate.constraints.length, 2);
  assert.equal(draft.mandate.cashNeeds.length, 3);
  assert.deepEqual(draft.mandate.cashNeeds.map((entry) => entry.date), ['2029-03-31', '2027-09-30', '2034-01-31']);
  assert.deepEqual(draft.mandate.constraints.map((entry) => `${entry.kind}:${entry.minimum}:${entry.maximum}`), ['minimum-exposure:0.4:null', 'maximum-exposure:null:0.2']);
  const reasons = draft.conflicts.map((conflict) => conflict.reason).sort();
  assert.deepEqual(reasons, ['cash-need-after-horizon', 'cash-need-currency-unavailable', 'cash-need-declared-order-invalid', 'constraint-bounds-conflict']);
  assert.equal(draft.conflicts.every((conflict) => conflict.error.contractVersion === 'PortfolioError/v1' && conflict.error.valueEchoed === false), true);
  assert.equal(draft.summary.conflicts, 4);
  const built = api.buildMandateCandidate(draft, api.createEmptyWorkspace(policy, NOW).value, { now: NOW }, policy);
  assert.equal(built.ok, false);
  assert.equal(built.error.code, 'P008-MANDATE-SHAPE');
  assert.equal(built.error.reason, 'mandate-draft-not-confirmable');
});

test('mandate revision identity is deterministic supersedes the prior mandate and never mutates the portfolio', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage: createStorage() }, policy);
  const portfolio = store.commitWorkspace(api.buildWorkspaceCandidate(validDraft(api, policy), store.openWorkspace(NOW).value.workspace, { name: 'Mandate host portfolio', now: NOW }, policy).value, 0, NOW);
  assert.equal(portfolio.ok, true);
  const base = portfolio.value.workspace;
  const draft = mandateDraft(api, policy, 'mandate-explicit.json');
  const first = api.buildMandateCandidate(draft, base, { now: NOW }, policy);
  const repeat = api.buildMandateCandidate(draft, base, { now: NOW }, policy);
  assert.equal(first.ok, true);
  assert.equal(first.value.currentMandateId, repeat.value.currentMandateId);
  assert.match(first.value.currentMandateId, /^sha256:[a-f0-9]{64}$/);
  assert.equal(first.value.currentPortfolioId, base.currentPortfolioId);
  assert.deepEqual(first.value.portfolioRevisions, base.portfolioRevisions);
  assert.equal(api.validateWorkspace(first.value, policy).ok, true);
  assert.equal(api.validateMandateRevision(first.value.mandateRevisions[0], policy).ok, true);
  assert.equal(first.value.mandateRevisions[0].supersedes, null);
  assert.equal(api.validateMandateRevision({ ...first.value.mandateRevisions[0], hiddenDefault: true }, policy).error.reason, 'unknown-field');
  assert.equal(api.validateMandateRevision({ ...first.value.mandateRevisions[0], objectiveLabel: 'Rewritten without re-identity' }, policy).error.reason, 'mandate-identity-mismatch');
  const committed = store.commitWorkspace(first.value, base.generation, NOW);
  assert.equal(committed.ok, true);
  const second = api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), committed.value.workspace, { now: NOW }, policy);
  assert.equal(second.ok, false);
  assert.equal(second.error.reason, 'mandate-revision-unchanged');
  const revised = api.validateMandateDraft({ ...mandateFixture('mandate-explicit.json'), objectiveLabel: 'Second explicit objective' }, committed.value.workspace, { now: NOW }, policy);
  const supersede = api.buildMandateCandidate(revised.value, committed.value.workspace, { now: NOW }, policy);
  assert.equal(supersede.ok, true);
  assert.equal(supersede.value.mandateRevisions[1].supersedes, committed.value.workspace.currentMandateId);
  assert.equal(supersede.value.mandateRevisions.length, 2);
  assert.equal(supersede.value.currentPortfolioId, base.currentPortfolioId);
  const cleared = api.buildMandateClearCandidate(committed.value.workspace, '2026-07-15T13:40:00.000Z', policy);
  assert.equal(cleared.value.currentMandateId, null);
  assert.equal(cleared.value.mandateRevisions.length, 1);
  assert.equal(cleared.value.currentPortfolioId, base.currentPortfolioId);
});

test('behavior events interest signals and display settings cannot create or modify any mandate field', () => {
  const { api, policy } = loadContracts();
  const noise = mandateFixture('mandate-behavior-noise.json');
  const refusedNoise = api.validateMandateDraft(noise, null, { now: NOW }, policy);
  assert.equal(refusedNoise.ok, false);
  assert.equal(refusedNoise.error.code, 'P008-MANDATE-AUTHORITY');
  assert.equal(refusedNoise.error.reason, 'forbidden-input-source');
  assert.equal(refusedNoise.error.field, 'behaviorEvents');
  assert.equal(JSON.stringify(refusedNoise.error).includes('XOM'), false);
  assert.equal(JSON.stringify(refusedNoise.error).includes('commodity-carry'), false);
  assert.equal(JSON.stringify(refusedNoise.error).includes('0.35'), false);
  const explicit = mandateFixture('mandate-explicit.json');
  ['behaviorEvents', 'interestSignals', 'actionOutcomes', 'settings'].forEach((source) => {
    const smuggled = api.validateMandateDraft({ ...explicit, [source]: noise[source] ?? [] }, null, { now: NOW }, policy);
    assert.equal(smuggled.ok, false, `${source} must not reach the mandate path`);
    assert.equal(smuggled.error.code, 'P008-MANDATE-AUTHORITY');
    assert.equal(smuggled.error.field, source);
  });
  const clean = api.validateMandateDraft(explicit, null, { now: NOW }, policy);
  const noisyHorizon = api.validateMandateDraft(explicit, null, { now: NOW }, policy);
  assert.equal(clean.value.mandate.horizon.endDate, noisyHorizon.value.mandate.horizon.endDate);
  assert.equal(clean.value.impact.behaviorContribution, 'none');
  assert.equal(clean.value.impact.settingsContribution, 'none');
  assert.equal(clean.value.impact.portfolioUnchanged, true);
  assert.equal(clean.value.impact.mandateUnchangedUntilConfirm, true);
});

test('route projection cites one mandate revision and reports mandate-absent states without inventing values', () => {
  const { api, policy } = loadContracts();
  const store = api.createPortfolioStore({ localStorage: createStorage(), sessionStorage: createStorage() }, policy);
  const portfolio = store.commitWorkspace(api.buildWorkspaceCandidate(validDraft(api, policy), store.openWorkspace(NOW).value.workspace, { name: 'Route projection portfolio', now: NOW }, policy).value, 0, NOW);
  const withoutMandate = api.projectRouteStates(portfolio.value.workspace, policy);
  assert.equal(withoutMandate.ok, true);
  assert.deepEqual(withoutMandate.value.routes.map((route) => route.route), ['allocation', 'path-lab', 'risk-xray']);
  assert.equal(withoutMandate.value.routes.every((route) => route.descriptive.available === true && route.descriptive.citedPortfolioId === portfolio.value.workspace.currentPortfolioId), true);
  assert.equal(withoutMandate.value.routes.every((route) => route.mandateDependent.every((entry) => entry.available === false && entry.reason === 'mandate-absent' && entry.citedMandateId === null)), true);
  assert.deepEqual(
    withoutMandate.value.routes[0].mandateDependent.map((entry) => entry.state),
    ['cash-need-collision', 'constraint-feasibility', 'goal-fit', 'survival-to-goal']
  );
  const draft = mandateDraft(api, policy, 'mandate-explicit.json');
  const candidate = api.buildMandateCandidate(draft, portfolio.value.workspace, { now: NOW }, policy);
  const committed = store.commitWorkspace(candidate.value, portfolio.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  const withMandate = api.projectRouteStates(committed.value.workspace, policy);
  assert.equal(withMandate.ok, true);
  assert.equal(withMandate.value.currentMandateId, committed.value.workspace.currentMandateId);
  assert.equal(withMandate.value.routes.every((route) => route.mandateDependent.every((entry) => entry.available === true && entry.reason === null && entry.citedMandateId === committed.value.workspace.currentMandateId)), true);
  const mandate = committed.value.workspace.mandateRevisions[0];
  withMandate.value.routes.forEach((route) => {
    assert.deepEqual(route.constraints, mandate.constraints, `${route.route} must carry the mandate constraints unchanged`);
    assert.deepEqual(route.cashNeeds, mandate.cashNeeds, `${route.route} must carry the mandate cash needs unchanged`);
    assert.deepEqual(route.horizon, mandate.horizon);
    assert.equal(Object.values(route.inferredValues).every((entry) => entry === null), true);
  });
  assert.equal(withMandate.value.behaviorContribution, 'none');
  assert.equal(withMandate.value.settingsContribution, 'none');
});

const RESULT_IDENTITY = `sha256:${'ab12'.repeat(16)}`;
const SUBJECT_ALPHA = 'subject-alpha';
const SUBJECT_BETA = 'subject-beta';
const BENIGN_EXTRA_FIELD = 'alphaBetaGamma';
const EARLIER = '2026-07-15T09:05:00.000Z';
const SAME_DAY_LATER = '2026-07-15T21:45:00.000Z';
const NEXT_DAY = '2026-07-16T10:00:00.000Z';
const LATER = '2026-07-20T08:00:00.000Z';

function behaviorDraft(overrides = {}) {
  return {
    category: 'ticker-research-completed',
    completionConditionId: 'risk-panel-reviewed',
    domain: 'equity-research',
    horizon: 'medium-term',
    resultIdentity: RESULT_IDENTITY,
    sourceSurface: 'risk-xray',
    subjectId: SUBJECT_ALPHA,
    subjectKind: 'ticker',
    ...overrides
  };
}

function builtEvent(api, policy, overrides = {}, now = NOW) {
  const result = api.buildBehaviorEvent(behaviorDraft(overrides), { now }, policy);
  assert.equal(result.ok, true, `event must be constructible: ${JSON.stringify(result.error || {})}`);
  return result.value;
}

function portfolioAndMandateWorkspace(api, policy) {
  const empty = api.createEmptyWorkspace(policy, NOW);
  assert.equal(empty.ok, true);
  const withPortfolio = api.buildWorkspaceCandidate(validDraft(api, policy), empty.value, { name: 'Behavior scope portfolio', now: NOW }, policy);
  assert.equal(withPortfolio.ok, true);
  const withMandate = api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), withPortfolio.value, { now: NOW }, policy);
  assert.equal(withMandate.ok, true);
  return withMandate.value;
}

function appendEvent(api, policy, workspace, overrides, now = NOW) {
  const result = api.buildBehaviorCandidate(behaviorDraft(overrides), workspace, { now }, policy);
  assert.equal(result.ok, true, `behavior candidate must build: ${JSON.stringify(result.error || {})}`);
  return result;
}

test('behavior event vocabulary is closed to the declared categories lifecycle states and draft fields', () => {
  const { api, policy } = loadContracts();
  const categories = policy.behavior.eventCategories;
  const lifecycleStates = policy.behavior.eventLifecycleStates;
  assert.equal(categories.length > 0, true, 'an empty category list would make the per-category assertions vacuous');
  assert.equal(lifecycleStates.length > 0, true, 'an empty lifecycle list would make the per-state assertions vacuous');

  let constructed = 0;
  categories.forEach((category) => {
    const event = builtEvent(api, policy, { category });
    assert.equal(event.category, category);
    assert.equal(event.lifecycleState, 'eligible', 'a constructed event is always eligible; quarantine is never a user-supplied state');
    assert.equal(event.policyVersion, policy.behavior.contractVersion);
    assert.equal(api.validateBehaviorEvent(event, policy).ok, true);
    constructed += 1;
  });
  assert.equal(constructed, categories.length, 'every declared category must have been exercised, not merely iterated over');

  let accepted = 0;
  lifecycleStates.forEach((lifecycleState) => {
    const result = api.validateBehaviorEvent({ ...builtEvent(api, policy), lifecycleState }, policy);
    assert.equal(result.ok, true, `${lifecycleState} is declared and must validate`);
    accepted += 1;
  });
  assert.equal(accepted, lifecycleStates.length);

  const undeclaredCategory = 'ticker-research-abandoned';
  assert.equal(categories.includes(undeclaredCategory), false, 'the negative case must name a category the policy does not declare');
  assert.equal(api.buildBehaviorEvent(behaviorDraft({ category: undeclaredCategory }), { now: NOW }, policy).error.reason, 'behavior-event-invalid');
  assert.equal(api.validateBehaviorEvent({ ...builtEvent(api, policy), lifecycleState: 'observed' }, policy).error.reason, 'behavior-event-invalid');

  const withLifecycle = api.buildBehaviorEvent({ ...behaviorDraft(), lifecycleState: 'eligible' }, { now: NOW }, policy);
  assert.equal(withLifecycle.error.reason, 'unknown-field', 'a caller cannot pre-declare lifecycle state through the draft');
  const missingField = behaviorDraft();
  delete missingField.completionConditionId;
  assert.equal(api.buildBehaviorEvent(missingField, { now: NOW }, policy).error.reason, 'unknown-field', 'a partial draft cannot become an eligible event');
  assert.equal(api.buildBehaviorEvent(behaviorDraft(), { now: '2026-07-15' }, policy).error.reason, 'behavior-options-invalid');
});

test('every declared excluded behavior source is rejected by name in any casing or separator form at any depth', () => {
  const { api, policy } = loadContracts();
  const tokens = policy.behavior.forbiddenEventFields;
  assert.equal(tokens.length > 0, true, 'an empty exclusion list would make the per-token assertions vacuous');

  let rejected = 0;
  tokens.forEach((token) => {
    const result = api.buildBehaviorEvent({ ...behaviorDraft(), [token]: 1 }, { now: NOW }, policy);
    assert.equal(result.ok, false, `${token} must never reach an event`);
    assert.equal(result.error.reason, 'forbidden-behavior-source', `${token} must be refused as an excluded source, not as a generic shape error`);
    assert.equal(result.error.field, `draft.${token}`, `${token} must be named exactly so the sheet can explain the refusal`);
    rejected += 1;
  });
  assert.equal(rejected, tokens.length, 'every declared token must have been exercised, not merely iterated over');

  // Control: the same one-extra-field shape carrying a name the policy does not exclude must
  // fail for a different reason. Without this the rejections above could be caused by the
  // extra field alone and would hold for any name at all.
  assert.equal(
    tokens.some((token) => BENIGN_EXTRA_FIELD.toLowerCase().replace(/[^a-z0-9]/g, '').includes(token)),
    false,
    'the control field name must not itself contain a declared token'
  );
  const control = api.buildBehaviorEvent({ ...behaviorDraft(), [BENIGN_EXTRA_FIELD]: 1 }, { now: NOW }, policy);
  assert.equal(control.ok, false);
  assert.equal(control.error.reason, 'unknown-field', 'an unexcluded extra name is a shape error, so the exclusion refusals above are caused by the token');

  ['dwellTime', 'dwell_time', 'Dwell-Time', 'DWELL', 'userSettings', 'scrollDepth'].forEach((variant) => {
    const result = api.buildBehaviorEvent({ ...behaviorDraft(), [variant]: 1 }, { now: NOW }, policy);
    assert.equal(result.error.reason, 'forbidden-behavior-source', `${variant} must normalize onto a declared token`);
    assert.equal(result.error.field, `draft.${variant}`);
  });

  const nested = api.buildBehaviorEvent({ ...behaviorDraft(), container: { inner: [{ scrollDepth: 1 }] } }, { now: NOW }, policy);
  assert.equal(nested.error.reason, 'forbidden-behavior-source');
  assert.equal(nested.error.field, 'draft.container.inner[0].scrollDepth', 'a nested excluded source must be named at its exact path');

  const stored = api.validateBehaviorEvent({ ...builtEvent(api, policy), engagement: 1 }, policy);
  assert.equal(stored.error.reason, 'forbidden-behavior-source', 'an excluded source already on disk is refused on read, not only on write');
  assert.equal(stored.error.field, 'behaviorEvent.engagement');
});

test('semantic de-duplication collapses same-day repeats to the earliest occurrence without shrinking distinct evidence', () => {
  const { api, policy } = loadContracts();
  const atNow = builtEvent(api, policy, {}, NOW);
  const atEarlier = builtEvent(api, policy, {}, EARLIER);
  const atSameDayLater = builtEvent(api, policy, {}, SAME_DAY_LATER);
  const atNextDay = builtEvent(api, policy, {}, NEXT_DAY);
  const otherSubject = builtEvent(api, policy, { subjectId: SUBJECT_BETA }, NOW);

  assert.equal(atNow.dedupeKey, atEarlier.dedupeKey, 'occurrence time is deliberately absent from the de-duplication payload');
  assert.notEqual(atNow.eventId, atEarlier.eventId, 'identity must still distinguish two reports of the same completion');
  assert.notEqual(atNow.dedupeKey, atNextDay.dedupeKey, 'a different UTC day is different evidence');
  assert.notEqual(atNow.dedupeKey, otherSubject.dedupeKey, 'a different subject is different evidence');
  assert.equal(builtEvent(api, policy, {}, NOW).eventId, atNow.eventId, 'identity is deterministic for identical inputs');

  const repeated = api.dedupeBehaviorEvents([atNow, atEarlier, atSameDayLater, atNextDay, otherSubject], policy);
  assert.equal(repeated.ok, true);
  assert.equal(repeated.value.inputCount, 5);
  assert.equal(repeated.value.retainedCount, 3);
  assert.equal(repeated.value.collapsedCount, 2);
  assert.equal(repeated.value.inputCount > repeated.value.retainedCount, true, 'a real collapse must have happened or the retained assertions prove nothing');
  const survivor = repeated.value.events.find((entry) => entry.dedupeKey === atNow.dedupeKey);
  assert.equal(survivor.occurredAt, EARLIER, 'the earliest occurrence survives regardless of input order');
  assert.equal(survivor.eventId, atEarlier.eventId);

  // Control: an all-distinct set must collapse nothing, so the collapse above is caused by
  // semantic repetition rather than by the reducer always discarding inputs.
  const distinct = api.dedupeBehaviorEvents([atEarlier, atNextDay, otherSubject], policy);
  assert.equal(distinct.value.collapsedCount, 0);
  assert.equal(distinct.value.retainedCount, 3);
  assert.deepEqual(distinct.value.events.map((entry) => entry.eventId), [atEarlier.eventId, atNextDay.eventId, otherSubject.eventId]);

  assert.equal(api.dedupeBehaviorEvents([{ ...atNow, subjectId: SUBJECT_BETA }], policy).error.reason, 'behavior-event-identity-mismatch');
  assert.equal(api.dedupeBehaviorEvents([atNow, atNow], policy).value.retainedCount, 1, 'a byte-identical repeat is one piece of evidence');
});

test('action outcome commands map to exactly one lifecycle state and reject mismatched or unknown transitions', () => {
  const { api, policy } = loadContracts();
  const commands = policy.behavior.outcomeCommands;
  const declaredStates = policy.behavior.outcomeStates;
  assert.equal(commands.length > 0, true, 'an empty command list would make the per-command assertions vacuous');
  const actionId = RESULT_IDENTITY;

  const observed = commands.map((command) => {
    const result = api.reduceActionOutcome(actionId, command, 'owner-decision', NOW, policy);
    assert.equal(result.ok, true, `${command} is declared and must reduce`);
    assert.equal(result.value.command, command);
    assert.equal(api.validateActionOutcome(result.value, policy).ok, true);
    return result.value.state;
  });
  assert.equal(observed.length, commands.length, 'every declared command must have been exercised, not merely iterated over');
  assert.equal(new Set(observed).size, commands.length, 'each command must reach a distinct state');
  assert.deepEqual([...observed].sort(), [...declaredStates].sort(), 'the reachable states are exactly the declared states');
  assert.deepEqual(observed, ['completed', 'dismissed', 'invalidated', 'open']);

  const completed = api.reduceActionOutcome(actionId, 'complete', 'owner-decision', NOW, policy).value;
  const dismissed = api.reduceActionOutcome(actionId, 'dismiss', 'owner-decision', NOW, policy).value;
  assert.notEqual(completed.outcomeId, dismissed.outcomeId, 'the command is part of outcome identity');
  assert.equal(api.validateActionOutcome({ ...completed, state: 'dismissed' }, policy).error.reason, 'action-outcome-invalid', 'a command and a state cannot be recorded out of step');
  assert.equal(api.validateActionOutcome({ ...completed, reason: 'Rejected by owner' }, policy).error.reason, 'action-outcome-invalid', 'a reason is a safe token, never free text');
  assert.equal(api.reduceActionOutcome(actionId, 'downrank', 'owner-decision', NOW, policy).error.reason, 'unknown-outcome-command');
  assert.equal(api.validateActionOutcome({ ...completed, engagement: 1 }, policy).error.reason, 'forbidden-behavior-source');
});

test('privacy inventory reports real category counts and carries no stored subject value', () => {
  const { api, policy } = loadContracts();
  const storageAdapters = { localStorage: createStorage(), sessionStorage: createStorage() };
  const base = portfolioAndMandateWorkspace(api, policy);
  const first = appendEvent(api, policy, base, {});
  const second = appendEvent(api, policy, first.value.workspace, { category: 'risk-analysis-completed', subjectId: SUBJECT_BETA });
  const populated = second.value.workspace;

  const inventory = api.privacyInventory(populated, storageAdapters, policy);
  assert.equal(inventory.ok, true);
  const byName = Object.fromEntries(inventory.value.categories.map((entry) => [entry.category, entry]));
  assert.equal(byName['behavior-events'].recordCount, 2, 'the inventory must be read while behavior evidence genuinely exists');
  assert.equal(byName['behavior-events'].present, true);
  assert.equal(byName['behavior-events'].clearedBy, 'behavior-and-all-personal');
  assert.equal(byName['portfolio-revisions'].recordCount > 0, true);
  assert.equal(byName['portfolio-revisions'].clearedBy, 'all-personal');
  assert.equal(byName['mandate-revisions'].recordCount > 0, true);
  assert.equal(byName['interest-signals'].recordCount, 0);
  assert.equal(byName['interest-signals'].present, false);

  const categoryCounts = inventory.value.eventCategoryCounts;
  assert.equal(categoryCounts['ticker-research-completed'], 1);
  assert.equal(categoryCounts['risk-analysis-completed'], 1);
  assert.deepEqual(Object.keys(categoryCounts).sort(), [...policy.behavior.eventCategories].sort(), 'every declared category is reported, including the zeroes');
  assert.equal(Object.values(categoryCounts).reduce((sum, count) => sum + count, 0), populated.behaviorEvents.length);
  assert.deepEqual(Object.keys(inventory.value.outcomeStateCounts).sort(), [...policy.behavior.outcomeStates].sort());

  // The inventory is read from a workspace that provably holds both subjects, so an absent
  // subject value is a real omission rather than an artefact of an empty workspace.
  assert.deepEqual(populated.behaviorEvents.map((entry) => entry.subjectId).sort(), [SUBJECT_ALPHA, SUBJECT_BETA]);
  const serialized = JSON.stringify(inventory.value);
  [SUBJECT_ALPHA, SUBJECT_BETA, RESULT_IDENTITY, populated.currentPortfolioId, populated.currentMandateId].forEach((value) => {
    assert.equal(serialized.includes(value), false, 'the inventory reports counts and states only, never a stored value');
  });
  assert.equal(JSON.stringify(populated).includes(SUBJECT_ALPHA), true, 'the value is genuinely stored, so its absence from the inventory is meaningful');

  assert.deepEqual(inventory.value.excludedSourceTokens, policy.behavior.forbiddenEventFields);
  assert.equal(inventory.value.excludedSourceTokens.length > 0, true);
  assert.equal(inventory.value.excludedSourceCount, 0);
  assert.equal(inventory.value.genericNamespacesInspected, false);
  assert.equal(inventory.value.categories.every((entry) => ['behavior', 'behavior-and-all-personal', 'all-personal'].includes(entry.clearedBy)), true);
  // `clearFoundationStorage` removes every declared foundation key, and all eight categories are
  // backed by those keys, so no category can survive it. A label omitting `all-personal` would be
  // telling an owner less than the full-personal clear actually deletes.
  assert.equal(inventory.value.categories.every((entry) => entry.clearedBy.split('-and-').includes('all-personal')), true,
    'every category must name the all-personal clear, which empties all of them');
  assert.equal(inventory.value.categories.length, 8, 'every declared category must be projected, so the clearedBy sweep above is not run over a short list');

  /* The serialized sweep above is a DENYLIST: it catches only the five values it names. A leak it
   * was never told to look for passes it silently — proven by injecting a `subjectValue` field into
   * every category record, which left this file fully green. The record is therefore closed by
   * SHAPE instead, which is an allowlist: any field beyond the declared four is a value-bearing
   * surface whatever it happens to hold. */
  const DECLARED_CATEGORY_FIELDS = ['category', 'clearedBy', 'present', 'recordCount'];
  inventory.value.categories.forEach((entry) => {
    assert.deepEqual(Object.keys(entry).sort(), DECLARED_CATEGORY_FIELDS,
      'category ' + entry.category + ' projects exactly the declared count and state fields and carries no additional value-bearing field');
  });

  const duplicate = api.buildBehaviorCandidate(behaviorDraft(), populated, { now: SAME_DAY_LATER }, policy);
  assert.equal(duplicate.value.accepted, false);
  assert.equal(duplicate.value.reason, 'duplicate-completion');
  assert.equal(duplicate.value.workspace.behaviorEvents.length, 2, 'a semantic repeat must not grow stored evidence');
});

test('behavior clear empties behavior categories only after they are proven non-empty and preserves portfolio and mandate identity', () => {
  const { api, policy } = loadContracts();
  const storageAdapters = { localStorage: createStorage(), sessionStorage: createStorage() };
  const base = portfolioAndMandateWorkspace(api, policy);
  const first = appendEvent(api, policy, base, {});
  const populated = appendEvent(api, policy, first.value.workspace, { subjectId: SUBJECT_BETA }).value.workspace;

  // Populate-and-prove: without this the post-clear emptiness assertions would hold against a
  // workspace that never carried behavior evidence at all.
  assert.equal(populated.behaviorEvents.length, 2);
  assert.equal(api.privacyInventory(populated, storageAdapters, policy).value.categories.find((entry) => entry.category === 'behavior-events').present, true);

  const cleared = api.buildBehaviorClearCandidate(populated, LATER, policy);
  assert.equal(cleared.ok, true);
  assert.equal(cleared.value.clearedEventCount, populated.behaviorEvents.length, 'the reported cleared count must match the proven pre-clear population');
  assert.equal(cleared.value.workspace.behaviorEvents.length, 0);
  assert.equal(cleared.value.workspace.interestSignals.length, 0);
  assert.equal(api.validateWorkspace(cleared.value.workspace, policy).ok, true);

  assert.equal(cleared.value.workspace.currentPortfolioId, populated.currentPortfolioId);
  assert.equal(cleared.value.workspace.currentMandateId, populated.currentMandateId);
  assert.equal(cleared.value.preservedPortfolioId, populated.currentPortfolioId);
  assert.equal(cleared.value.preservedMandateId, populated.currentMandateId);
  assert.deepEqual(cleared.value.workspace.portfolioRevisions, populated.portfolioRevisions, 'explicit portfolio facts survive a behavior clear byte for byte');
  assert.deepEqual(cleared.value.workspace.mandateRevisions, populated.mandateRevisions, 'mandate and cash needs survive a behavior clear byte for byte');
  assert.equal(cleared.value.workspace.createdAt, populated.createdAt);
  assert.equal(cleared.value.workspace.updatedAt, LATER);

  assert.notEqual(cleared.value.workspace.semanticFingerprint, populated.semanticFingerprint, 'removing evidence must change workspace identity');
  // Control: clearing a workspace that holds no behavior evidence leaves identity untouched,
  // so the change above is caused by the removal and not by calling the clear at all.
  const emptyClear = api.buildBehaviorClearCandidate(base, LATER, policy);
  assert.equal(emptyClear.ok, true);
  assert.equal(emptyClear.value.clearedEventCount, 0);
  assert.equal(emptyClear.value.workspace.semanticFingerprint, base.semanticFingerprint);

  const after = api.privacyInventory(cleared.value.workspace, storageAdapters, policy);
  const afterByName = Object.fromEntries(after.value.categories.map((entry) => [entry.category, entry]));
  assert.equal(afterByName['behavior-events'].recordCount, 0);
  assert.equal(afterByName['behavior-events'].present, false);
  assert.equal(afterByName['interest-signals'].present, false);
  assert.equal(afterByName['portfolio-revisions'].recordCount, populated.portfolioRevisions.length, 'a behavior clear is not a portfolio clear');
  assert.equal(afterByName['mandate-revisions'].recordCount, populated.mandateRevisions.length);
  assert.equal(afterByName['portfolio-revisions'].present, true);
  assert.equal(Object.values(after.value.eventCategoryCounts).every((count) => count === 0), true);
  assert.equal(Object.keys(after.value.eventCategoryCounts).length, policy.behavior.eventCategories.length, 'the zero sweep above must run over the full declared category list');

  assert.equal(api.buildBehaviorClearCandidate(populated, '2026-07-20', policy).error.reason, 'timestamp-invalid');
});

test('verified foundation clear reports empty only after reread and a remove fault cannot report success', () => {
  const { api } = loadContracts();
  const present = {
    'rlPortfolioWorkspaceV1.pointer': 'pointer-record',
    'rlPortfolioWorkspaceV1.slotA': 'slot-record'
  };
  const localStorage = createStorage({ initial: { ...present } });
  const sessionStorage = createStorage({ initial: { rlPortfolioWorkspaceSessionV1: 'session-record' } });

  const before = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(before.value.personalKeyCount, 3, 'the fault case must start from storage that provably holds personal keys');

  localStorage.failRemove('rlPortfolioWorkspaceV1.pointer');
  const faulted = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(faulted.ok, false, 'a key that survives deletion can never be reported as cleared');
  assert.equal(faulted.error.reason, 'foundation-clear-incomplete');
  assert.equal(Object.prototype.hasOwnProperty.call(faulted, 'value'), false, 'a partial deletion emits no success state at all');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'), 'pointer-record', 'the injected fault genuinely blocked one deletion');
  assert.equal(localStorage.getItem('rlPortfolioWorkspaceV1.slotA'), null, 'the unfaulted keys were still deleted, so the refusal is about the survivor');
  const midway = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(midway.value.personalKeyCount, 1);
  assert.deepEqual(midway.value.presentKeys, [{ key: 'rlPortfolioWorkspaceV1.pointer', storage: 'local' }]);

  const recovered = createStorage({ initial: { ...present } });
  const recoveredSession = createStorage({ initial: { rlPortfolioWorkspaceSessionV1: 'session-record' } });
  assert.equal(api.foundationPrivacyInventory({ localStorage: recovered, sessionStorage: recoveredSession }).value.personalKeyCount, 3);
  const succeeded = api.clearFoundationStorage({ localStorage: recovered, sessionStorage: recoveredSession });
  assert.equal(succeeded.ok, true);
  assert.equal(succeeded.value.verifiedEmpty, true);
  assert.deepEqual(succeeded.value.remainingPersonalKeys, []);
  const reread = api.foundationPrivacyInventory({ localStorage: recovered, sessionStorage: recoveredSession });
  assert.equal(reread.value.personalKeyCount, 0, 'emptiness is proven by an independent reread, not by the clear call reporting on itself');
  assert.deepEqual(reread.value.presentKeys, []);

  const unreadable = createStorage({ initial: { ...present } });
  unreadable.failGet('rlPortfolioWorkspaceV1.slotA');
  const unverifiable = api.clearFoundationStorage({ localStorage: unreadable, sessionStorage: createStorage() });
  assert.equal(unverifiable.ok, false, 'a key that cannot be reread cannot be certified empty');
  assert.equal(unverifiable.error.reason, 'foundation-clear-incomplete');
});

// The declared personal storage surface, read from the POLICY that declares it rather than
// from the module under test. Asserting the module's clear against the module's own key list
// would be circular: dropping a key from that list removes it from both the clear and the
// expectation at once and stays green. The policy is the independent second source.
//
// DERIVED by iterating `policy.storage`, never by naming its fields. Naming them reintroduced the
// same circularity one level down: the `4`/`2` pins below were counting the very literal list
// written beside them, so they agreed by construction and a SEVENTH declared key was swept by
// nothing and reddened nothing. Iterating puts a new declared key in scope automatically, and the
// closed non-key partition below means a new field cannot escape the sweep by being named
// something other than `*Key`/`*Keys`.
const POLICY_STORAGE_NON_KEY_FIELDS = Object.freeze([
  'contractVersion', 'migrationVersions', 'pointerContractVersion',
  'probeValue', 'workspaceContractVersion', 'workspaceNamespace'
].slice().sort());

function policyDeclaredKeys(policy) {
  const storage = policy.storage;
  const isKeyField = (field) => /Keys?$/.test(field);
  const fields = Object.keys(storage).slice().sort();
  // Closed partition over EVERY field, so no field can be silently out of scope: a field either
  // declares personal storage keys (iterated below) or is one of the known non-key metadata
  // fields. A field that is neither fails here instead of being skipped without a word.
  assert.deepEqual(fields.filter((field) => !isKeyField(field)), POLICY_STORAGE_NON_KEY_FIELDS,
    'every policy.storage field must either declare keys as *Key/*Keys or be a known non-key metadata field');
  const keyFields = fields.filter(isKeyField);
  assert.ok(keyFields.length > 0, 'the policy must declare at least one personal storage key');

  const declared = [];
  keyFields.forEach((field) => {
    const value = storage[field];
    const keys = Array.isArray(value) ? value : [value];
    assert.ok(keys.length > 0, `policy.storage.${field} declares no key`);
    keys.forEach((key) => {
      assert.equal(typeof key, 'string', `policy.storage.${field} must declare string keys`);
      assert.ok(key.length > 0, `policy.storage.${field} must not declare an empty key`);
      declared.push(key);
    });
  });

  // The medium is derived from the declared workspace namespace as well, rather than from a
  // second hand-written split: a key inside the durable workspace namespace is a local key and
  // anything else is a session key, so a new declared key lands in a bucket without being named.
  const localPrefix = storage.workspaceNamespace + '.';
  return {
    local: declared.filter((key) => key.startsWith(localPrefix)).sort(),
    session: declared.filter((key) => !key.startsWith(localPrefix)).sort()
  };
}

test('verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them', () => {
  const { api, policy } = loadContracts();
  const declared = policyDeclaredKeys(policy);
  const declaredCount = declared.local.length + declared.session.length;
  // Pinned against the DERIVED set, so the literal and the subject are two sources that can
  // disagree. A seventh `policy.storage` key reddens here rather than arriving unswept, and once
  // the pin is updated to admit it the coverage assertions below force the clear to sweep it.
  assert.equal(declared.local.length, 4, 'the policy-derived local surface is the pointer, both slots, and quarantine');
  assert.equal(declared.session.length, 2, 'the policy-derived session surface is the session fallback and the return context');
  assert.equal(new Set([...declared.local, ...declared.session]).size, declaredCount, 'a duplicate key would let one survivor hide behind another');

  // Every declared key is populated, including the inactive slot. A pointer swap routinely
  // leaves a complete personal workspace in the inactive slot, so a clear that skips it
  // leaves recoverable personal data behind while still reporting success.
  const localStorage = createStorage({ initial: Object.fromEntries(declared.local.map((key, index) => [key, `local-record-${index}`])) });
  const sessionStorage = createStorage({ initial: Object.fromEntries(declared.session.map((key, index) => [key, `session-record-${index}`])) });

  // Populate-and-prove: without this the post-clear emptiness below would hold against
  // storage that never held anything, which is true of any clear including a no-op.
  assert.deepEqual(Object.keys(localStorage.snapshot()).sort(), declared.local, 'the raw local namespace must genuinely hold every declared key before the clear');
  assert.deepEqual(Object.keys(sessionStorage.snapshot()).sort(), declared.session, 'the raw session namespace must genuinely hold every declared key before the clear');
  const before = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(before.ok, true);
  assert.equal(before.value.personalKeyCount, declaredCount, 'a key the module omits from its own declared list shows up here as a short count');
  assert.deepEqual(before.value.presentKeys.map((entry) => entry.key).sort(), [...declared.local, ...declared.session].sort());

  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `verified clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  assert.equal(cleared.value.verifiedEmpty, true);
  assert.equal(cleared.value.clearedKeyCount, declaredCount, 'the reported coverage must match the full policy-declared surface, not a subset of it');

  // Exact SET emptiness read straight off the adapters, not through the module inventory
  // that shares the clear list. A `/^rlPortfolioWorkspaceV1/` style prefix check would accept
  // a surviving key under the same prefix; an empty-set comparison cannot.
  assert.deepEqual(Object.keys(localStorage.snapshot()), [], 'no key may survive in the raw local namespace');
  assert.deepEqual(Object.keys(sessionStorage.snapshot()), [], 'no key may survive in the raw session namespace');
  declared.local.forEach((key) => assert.equal(localStorage.getItem(key), null, `${key} must not survive the clear`));
  declared.session.forEach((key) => assert.equal(sessionStorage.getItem(key), null, `${key} must not survive the clear`));
});

// The personal surface and the generic surface are BOTH derived from the policy key set, as a
// partition: declared means "must be gone", not-declared means "must survive". Naming either
// side literally freezes it, and the survivor half is the one that gets forgotten -- an
// over-broad clear that also wiped the shared caches still satisfies an all-empty assertion.
// The workspace sweep is derived the same way, off the empty-workspace contract, so a section
// added to the workspace later is required to be empty here without editing this test.
function personalWorkspaceSections(api, policy) {
  const empty = api.createEmptyWorkspace(policy, NOW);
  assert.equal(empty.ok, true);
  return Object.entries(empty.value).filter(([, value]) => Array.isArray(value)).map(([name]) => name).sort();
}

test('full-personal clear empties every declared personal section and leaves generic public assets byte-identical', () => {
  const { api, policy } = loadContracts();
  const declared = policyDeclaredKeys(policy);
  const declaredLocal = new Set(declared.local);

  // Real shared cache-first market assets, not test-only names: these are the generic public
  // caches every tool reuses, so wiping them is a real product regression rather than a
  // hypothetical one.
  const genericLocal = Object.freeze({ rlData: '{"bars":{}}', optSnaps: '{"SPY":{}}' });
  const localStorage = createStorage({ initial: { ...genericLocal } });
  const sessionStorage = createStorage();

  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const withPortfolio = store.commitWorkspace(api.buildWorkspaceCandidate(validDraft(api, policy), opened.value.workspace, { name: 'Full clear portfolio', now: NOW }, policy).value, opened.value.workspace.generation, NOW);
  assert.equal(withPortfolio.ok, true);
  const withMandate = store.commitWorkspace(api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), withPortfolio.value.workspace, { now: NOW }, policy).value, withPortfolio.value.workspace.generation, NOW);
  assert.equal(withMandate.ok, true);
  const withEvidence = store.commitWorkspace(appendEvent(api, policy, withMandate.value.workspace, {}).value.workspace, withMandate.value.workspace.generation, NOW);
  assert.equal(withEvidence.ok, true);

  // Populate-and-prove, read back out of committed bytes. Without it every emptiness assertion
  // below would also hold for a store that persisted nothing and a clear that did nothing.
  const committed = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NEXT_DAY);
  assert.equal(committed.ok, true);
  assert.equal(committed.value.workspace.portfolioRevisions.length > 0, true, 'holdings must genuinely be on disk before the clear is meaningful');
  assert.equal(committed.value.workspace.mandateRevisions.length > 0, true, 'the mandate must genuinely be on disk before the clear is meaningful');
  assert.equal(committed.value.workspace.mandateRevisions[0].cashNeeds.length > 0, true, 'cash needs must genuinely be on disk, not an empty list inside a present mandate');
  assert.equal(committed.value.workspace.behaviorEvents.length > 0, true, 'behavior evidence must genuinely be on disk before the clear is meaningful');
  assert.notEqual(committed.value.workspace.currentPortfolioId, null);
  assert.notEqual(committed.value.workspace.currentMandateId, null);

  // The keys a durable commit does not itself create -- the inactive slot, quarantine, the
  // session fallback, and the return context -- are the ones a clear most easily skips, so
  // they are stocked here, derived from the declared set rather than named.
  const residualLocal = declared.local.filter((key) => localStorage.getItem(key) === null);
  assert.equal(residualLocal.length > 0, true, 'at least one declared local key must still need stocking, or this arm proves nothing');
  residualLocal.forEach((key, index) => localStorage.setItem(key, `residual-local-${index}`));
  declared.session.forEach((key, index) => sessionStorage.setItem(key, `residual-session-${index}`));

  const presentLocal = Object.keys(localStorage.snapshot());
  const survivorsExpected = presentLocal.filter((key) => !declaredLocal.has(key)).sort();
  assert.deepEqual(presentLocal.filter((key) => declaredLocal.has(key)).sort(), declared.local, 'every declared local key must be present before the clear');
  assert.deepEqual(Object.keys(sessionStorage.snapshot()).sort(), declared.session, 'every declared session key must be present before the clear');
  assert.deepEqual(survivorsExpected, Object.keys(genericLocal).sort(), 'the derived survivor set must be exactly the non-declared keys, so the partition is real');

  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `verified clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  assert.equal(cleared.value.verifiedEmpty, true);

  // One comparison carries both halves: a declared key that survives appears in the actual
  // set, and a generic key that was wiped disappears from it. `localStorage.clear()` fails
  // here; a clear that skips the inactive slot fails here too.
  assert.deepEqual(Object.keys(localStorage.snapshot()).sort(), survivorsExpected, 'exactly the non-declared keys may survive a full-personal clear');
  assert.deepEqual(Object.keys(sessionStorage.snapshot()), [], 'no declared session key may survive, and nothing generic was seeded there to mask one');
  assert.deepEqual(localStorage.snapshot(), genericLocal, 'the surviving generic caches must be byte-identical, not re-serialized or truncated');

  // Category emptiness proven by an independent reopen of the cleared namespace, over a
  // section list derived from the workspace contract rather than written out here.
  const sections = personalWorkspaceSections(api, policy);
  ['actionOutcomes', 'behaviorEvents', 'interestSignals', 'mandateRevisions', 'portfolioRevisions'].forEach((section) => {
    assert.equal(sections.includes(section), true, `${section} must be part of the derived personal section sweep`);
  });
  const reopened = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(LATER);
  assert.equal(reopened.ok, true, `a cleared namespace must still open: ${JSON.stringify(reopened.error || {})}`);
  sections.forEach((section) => {
    assert.deepEqual(reopened.value.workspace[section], [], `${section} must be empty after a full-personal clear`);
  });
  assert.equal(reopened.value.workspace.currentPortfolioId, null, 'no holdings pointer may survive');
  assert.equal(reopened.value.workspace.currentMandateId, null, 'no mandate or cash-need pointer may survive');
  assert.equal(JSON.stringify(reopened.value.workspace).includes(SUBJECT_ALPHA), false, 'no cleared subject may reappear through the reopened workspace');
  assert.equal(JSON.stringify(committed.value.workspace).includes(SUBJECT_ALPHA), true, 'the subject was genuinely stored, so its absence above is meaningful');
});

// The clear sweep above asserts every derived personal section is empty afterwards. Two of
// those sections have no write path through the exported builders, so their emptiness is
// vacuously true and the sweep reports coverage it does not have. This pins that limit to the
// exact refusal that causes it: when a later scope adds a real write path the refusal stops
// firing and this test goes red, instead of the sweep quietly continuing to over-report.
test('the two personal sections the clear sweep cannot populate are pinned by their own distinct refusal', () => {
  const { api, policy } = loadContracts();
  const sections = personalWorkspaceSections(api, policy);

  const opened = api.createPortfolioStore({ localStorage: createStorage(), sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const withPortfolio = api.buildWorkspaceCandidate(validDraft(api, policy), opened.value.workspace, { name: 'Sweep limit portfolio', now: NOW }, policy);
  assert.equal(withPortfolio.ok, true);
  const withMandate = api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), withPortfolio.value, { now: NOW }, policy);
  assert.equal(withMandate.ok, true);
  const populated = appendEvent(api, policy, withMandate.value, {}).value.workspace;

  // Reachability is measured by what a builder actually put there, not declared by name.
  const populatable = sections.filter((section) => populated[section].length > 0);
  const unreachable = sections.filter((section) => !populatable.includes(section));
  assert.deepEqual(populatable, ['behaviorEvents', 'mandateRevisions', 'portfolioRevisions'], 'the builders this scope exports reach exactly three of the derived personal sections');
  assert.deepEqual(unreachable, ['actionOutcomes', 'interestSignals'], 'exactly two derived sections have no write path, so the sweep asserts their emptiness vacuously');

  // Distinct reasons, so neither refusal can stand in for the other if one is removed.
  assert.equal(
    api.validateWorkspace({ ...populated, interestSignals: [{ signalId: RESULT_IDENTITY }] }, policy).error.reason,
    'unsupported-contract-scope',
    'an interest signal is refused as outside the contract scope, which is why the sweep can never observe one'
  );
  assert.equal(
    api.validateWorkspace({ ...populated, actionOutcomes: [api.reduceActionOutcome(RESULT_IDENTITY, 'complete', 'owner-decision', NOW, policy).value] }, policy).error.reason,
    'workspace-hash-mismatch',
    'a structurally valid outcome is still refused because no exported builder can hash it into a workspace, which is why the sweep can never observe one'
  );

  // Control: the same spread with neither section touched is accepted, so both refusals are
  // caused by the section content rather than by rebuilding the object.
  assert.equal(api.validateWorkspace({ ...populated }, policy).ok, true, 'the untouched spread must still validate, or the two refusals prove nothing about the sections');
});

test('exact rollback restores the pre-change workspace identity and the Scope 01/02 durable record survives a committed round trip', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const sessionStorage = createStorage();

  // Scope 02 baseline: a durable workspace carrying holdings and a mandate and no behavior.
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const withPortfolio = store.commitWorkspace(api.buildWorkspaceCandidate(validDraft(api, policy), opened.value.workspace, { name: 'Rollback portfolio', now: NOW }, policy).value, opened.value.workspace.generation, NOW);
  assert.equal(withPortfolio.ok, true);
  const committed = store.commitWorkspace(api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), withPortfolio.value.workspace, { now: NOW }, policy).value, withPortfolio.value.workspace.generation, NOW);
  assert.equal(committed.ok, true);
  const baseline = committed.value.workspace;
  assert.equal(baseline.portfolioRevisions.length > 0, true, 'the baseline must carry the Scope 01 holdings the rollback has to preserve');
  assert.equal(baseline.mandateRevisions.length > 0, true, 'the baseline must carry the Scope 02 mandate the rollback has to preserve');
  assert.deepEqual(baseline.behaviorEvents, [], 'the baseline must carry no behavior, or the rollback would be removing something it did not add');

  // Uncommitted arm. The candidate builders copy `generation` through untouched, so the two
  // stored hash identities can be compared directly: an identity match is reachable only if
  // every hashed byte came back, which no field-subset comparison could establish.
  const mutated = appendEvent(api, policy, baseline, {}).value.workspace;
  assert.equal(mutated.behaviorEvents.length, 1, 'the round trip needs a genuinely added record');
  assert.notEqual(mutated.semanticFingerprint, baseline.semanticFingerprint, 'the state must genuinely have changed, or the restore below is trivially true');
  assert.notEqual(mutated.contentSha256, baseline.contentSha256, 'the stored bytes must genuinely have changed, or the restore below is trivially true');

  const rolledBack = api.buildBehaviorClearCandidate(mutated, baseline.updatedAt, policy);
  assert.equal(rolledBack.ok, true, `the rollback must build: ${JSON.stringify(rolledBack.error || {})}`);
  assert.equal(rolledBack.value.clearedEventCount, 1, 'the rollback must report removing the record that was added, not skip it and still succeed');
  assert.equal(rolledBack.value.workspace.semanticFingerprint, baseline.semanticFingerprint, 'exact restore: the semantic identity must equal the pre-change identity');
  assert.equal(rolledBack.value.workspace.contentSha256, baseline.contentSha256, 'exact restore: the content identity must equal the pre-change identity');
  assert.deepEqual(rolledBack.value.workspace, baseline, 'exact restore: no field may differ from the pre-change workspace');

  // The change guard has to be able to fail. A duplicate completion is the product's own
  // no-change path, and it leaves the identity unmoved -- so `notEqual` above is a real
  // discriminator rather than an assertion that could never fire.
  const duplicate = appendEvent(api, policy, mutated, {});
  assert.equal(duplicate.value.accepted, false, 'the same completion must be recognised as a duplicate');
  assert.equal(duplicate.value.workspace.semanticFingerprint, mutated.semanticFingerprint, 'a duplicate leaves the identity unmoved, which is the no-change case the guard must be able to detect');

  // Committed arm. Identity is read back out of the stored pointer, not from memory.
  const pointerNow = () => JSON.parse(localStorage.getItem(policy.storage.pointerKey));
  const basePointer = pointerNow();
  assert.equal(basePointer.semanticFingerprint, baseline.semanticFingerprint, 'the pointer must be the durable identity of the baseline, or nothing below reads the real record');

  // Source-rollback half of the Change Boundary: removing this scope leaves the Scope 02
  // record untouched, because no Scope 03 read or candidate surface writes. Proving it on the
  // raw namespace is what establishes "storage generation is preserved" without a commit.
  const durableBefore = localStorage.snapshot();
  assert.equal(api.foundationPrivacyInventory({ localStorage, sessionStorage }).ok, true);
  assert.equal(api.privacyInventory(baseline, { localStorage, sessionStorage }, policy).ok, true);
  assert.equal(api.projectRouteStates(baseline, policy).ok, true);
  assert.equal(api.buildBehaviorCandidate(behaviorDraft(), baseline, { now: NEXT_DAY }, policy).ok, true);
  assert.equal(api.buildBehaviorClearCandidate(baseline, NEXT_DAY, policy).ok, true);
  assert.deepEqual(localStorage.snapshot(), durableBefore, 'no Scope 03 inventory, projection, or candidate surface may write to the durable record');
  assert.equal(pointerNow().generation, basePointer.generation, 'the storage generation must be preserved by everything short of an explicit commit');
  assert.equal(pointerNow().semanticFingerprint, baseline.semanticFingerprint, 'the durable portfolio and mandate hashes must be preserved alongside the generation');

  const committedMutation = store.commitWorkspace(mutated, baseline.generation, NEXT_DAY);
  assert.equal(committedMutation.ok, true);
  assert.notDeepEqual(localStorage.snapshot(), durableBefore, 'a real commit does move the raw namespace, so the untouched comparison above is a result rather than an inability to observe a write');
  const mutatedPointer = pointerNow();
  assert.notEqual(mutatedPointer.activeSlot, basePointer.activeSlot, 'a real commit swaps the slot, so the durable record genuinely moved');
  assert.equal(mutatedPointer.generation, basePointer.generation + 1);
  assert.notEqual(mutatedPointer.semanticFingerprint, basePointer.semanticFingerprint, 'the durable identity genuinely changed, or the restore below is trivially true');

  const rollbackCandidate = api.buildBehaviorClearCandidate(committedMutation.value.workspace, LATER, policy);
  assert.equal(rollbackCandidate.ok, true);
  const committedRollback = store.commitWorkspace(rollbackCandidate.value.workspace, committedMutation.value.workspace.generation, LATER);
  assert.equal(committedRollback.ok, true);

  const restored = api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(LATER);
  assert.equal(restored.ok, true, `the rolled-back namespace must still open: ${JSON.stringify(restored.error || {})}`);

  // The preserved set is derived: every workspace field except the three a behavior clear
  // declares as affected and the four a commit rewrites.
  const MOVED_BY_A_COMMITTED_ROLLBACK = new Set(['actionOutcomes', 'behaviorEvents', 'interestSignals', 'contentSha256', 'generation', 'semanticFingerprint', 'updatedAt']);
  const preserved = Object.keys(baseline).filter((field) => !MOVED_BY_A_COMMITTED_ROLLBACK.has(field)).sort();
  ['currentMandateId', 'currentPortfolioId', 'mandateRevisions', 'portfolioRevisions'].forEach((field) => {
    assert.equal(preserved.includes(field), true, `${field} must fall inside the derived preserved set, or the compared fields are not the Scope 01/02 facts`);
  });
  preserved.forEach((field) => {
    assert.deepEqual(restored.value.workspace[field], baseline[field], `${field} must survive a committed rollback byte for byte`);
  });
  assert.deepEqual(restored.value.workspace.behaviorEvents, [], 'the committed rollback must have removed the behavior it was rolling back');

  // Stated rather than over-claimed: a committed rollback is a new generation, not a rewind,
  // so the pointer identity does not return to the baseline value even though every preserved
  // field does. Asserting that keeps the limit from being read as an exact pointer restore.
  assert.equal(restored.value.workspace.generation, basePointer.generation + 2, 'a committed rollback advances the generation instead of rewinding it');
  assert.notEqual(pointerNow().semanticFingerprint, basePointer.semanticFingerprint, 'the pointer identity carries the generation, so it cannot and must not return to the baseline value');
});

// The six provenance classes FR-019 declares. Only `user-entered-holding` is representable on
// the surfaces this scope owns, so the enumeration is exercised the only honest way available
// here: the class a stored holding carries is asserted by name, and each of the other five is
// attempted by name and required to be refused.
const FR019_PROVENANCE_CLASSES = Object.freeze([
  'behavior-derived-interest',
  'model-estimate',
  'observable-fact',
  'recommendation',
  'user-entered-constraint',
  'user-entered-holding'
]);

test('FR-019: a stored holding carries exactly one declared provenance class and each of the other five declared classes is refused as an invalid class', () => {
  const { api, policy } = loadContracts();
  assert.equal(new Set(FR019_PROVENANCE_CLASSES).size, 6, 'FR-019 declares six distinct provenance classes, so the attempt set must hold six');

  const empty = api.createEmptyWorkspace(policy, NOW);
  assert.equal(empty.ok, true);
  const candidate = api.buildWorkspaceCandidate(validDraft(api, policy), empty.value, { name: 'Provenance portfolio', now: NOW }, policy);
  assert.equal(candidate.ok, true);
  const holdings = candidate.value.portfolioRevisions[0].holdings;
  assert.equal(holdings.length > 0, true, 'FR-019 needs at least one real holding, or every claim below is about nothing');

  holdings.forEach((holding) => {
    // Selects on VALUE membership in the declared class set and then asserts WHICH field holds
    // it. The filter can legitimately return zero fields (unclassed) or two (a second field
    // that also stamps a class), so naming `provenanceClass` is a real result, not the
    // property the filter already selected on.
    const classBearingFields = Object.keys(holding).filter((field) => FR019_PROVENANCE_CLASSES.includes(holding[field])).sort();
    assert.deepEqual(classBearingFields, ['provenanceClass'], 'FR-019 exactly one field on a holding may carry a declared provenance class');
    assert.equal(holding.provenanceClass, 'user-entered-holding', 'FR-019 a user-entered holding must be classed as one, never left unclassed or presented as an observable fact');
  });

  const holding = holdings[0];
  assert.equal(api.validateHoldingEntry(holding, policy).ok, true, 'FR-019 control: the declared holding class must still be accepted, so the refusals below are caused by the class rather than by the holding');

  let refused = 0;
  FR019_PROVENANCE_CLASSES.filter((className) => className !== 'user-entered-holding').forEach((className) => {
    const attempt = api.validateHoldingEntry({ ...holding, provenanceClass: className }, policy);
    assert.equal(attempt.ok, false, `FR-019 a holding must not be relabelled as ${className}`);
    // The reason is the load-bearing half. `provenanceClass` is inside the holding identity
    // payload, so a build that dropped the class check would STILL fail here -- with
    // `holding-identity-mismatch` from the fingerprint. Requiring the class reason is what
    // makes removing the class check red rather than incidentally still green.
    assert.equal(attempt.error.reason, 'holding-invalid', `FR-019 ${className} must be refused as an invalid provenance class, not incidentally by the identity fingerprint`);
    refused += 1;
  });
  assert.equal(refused, 5, 'FR-019 all five non-holding classes must have been attempted, not merely listed');
});

// The behavior evidence-floor and decay inputs FR-036 requires to be visible and versioned.
const FR036_EVIDENCE_FLOOR_AND_DECAY_INPUTS = Object.freeze([
  'halfLifeDays',
  'highScore',
  'maximumEvidenceAgeDays',
  'mediumScore',
  'minimumDistinctCompletions',
  'minimumDistinctUtcDates',
  'recentSupportDays'
]);

test('FR-036: every behavior evidence-floor and decay input is a visible declared finite policy value and its version is stamped onto every event', () => {
  const { api, policy } = loadContracts();
  assert.equal(api.validatePolicy(policy).ok, true);
  assert.equal(FR036_EVIDENCE_FLOOR_AND_DECAY_INPUTS.length > 0, true, 'an empty input list would make every per-input claim below vacuous');

  let exercised = 0;
  FR036_EVIDENCE_FLOOR_AND_DECAY_INPUTS.forEach((input) => {
    assert.equal(
      Object.prototype.hasOwnProperty.call(policy.behavior, input),
      true,
      `FR-036 ${input} must be visible in the policy file a reader can open, not buried in code`
    );
    assert.equal(Number.isFinite(policy.behavior[input]), true, `FR-036 ${input} must be a finite readable research parameter`);

    // Visible AND declared: a policy that simply omits the input must not load. Without this
    // arm the presence check above would also pass for an input the contract does not require,
    // which could be silently dropped in a later edit.
    const without = { ...policy, behavior: { ...policy.behavior } };
    delete without.behavior[input];
    const omitted = api.validatePolicy(without);
    assert.equal(omitted.ok, false, `FR-036 a policy missing ${input} must not load`);
    assert.equal(omitted.error.reason, 'invalid-policy', `FR-036 dropping ${input} must be refused as an invalid behavior policy`);

    const nonFinite = api.validatePolicy({ ...policy, behavior: { ...policy.behavior, [input]: Number.POSITIVE_INFINITY } });
    assert.equal(nonFinite.ok, false, `FR-036 ${input} must not accept a non-finite value`);
    assert.equal(nonFinite.error.reason, 'non-finite-policy', `FR-036 ${input} must be rejected by name when it is not finite`);
    exercised += 1;
  });
  assert.equal(exercised, FR036_EVIDENCE_FLOOR_AND_DECAY_INPUTS.length, 'FR-036 every declared input must have been exercised, not merely iterated over');

  // Versioned: evidence admitted under one floor and decay version stays distinguishable from
  // evidence admitted under a later one. This goes red if the stamp is dropped or renamed. It
  // does NOT prove the stamp is read from the policy rather than written as a literal, because
  // `validatePolicy` rejects any other section version so the two cannot be varied apart here.
  assert.equal(typeof policy.behavior.contractVersion, 'string');
  assert.equal(policy.behavior.contractVersion.length > 0, true, 'FR-036 the evidence-floor and decay policy must be versioned');
  const event = builtEvent(api, policy);
  assert.equal(
    event.policyVersion,
    policy.behavior.contractVersion,
    'FR-036 every behavior event must be stamped with the evidence-floor and decay policy version it was admitted under'
  );
});

// A durable namespace holding two genuinely committed behavior records, read back out of
// stored bytes. Every FR-037 claim below is about mutating those bytes, so a store that
// persisted nothing fails the population assertion before any mutation runs.
function seedDurableBehaviorNamespace(api, policy) {
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const first = appendEvent(api, policy, opened.value.workspace, {});
  const second = appendEvent(api, policy, first.value.workspace, { subjectId: SUBJECT_BETA }, NEXT_DAY);
  const committed = store.commitWorkspace(second.value.workspace, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true, `the seed must commit: ${JSON.stringify(committed.error || {})}`);
  const pointer = JSON.parse(localStorage.getItem(policy.storage.pointerKey));
  const slotKey = `${policy.storage.workspaceNamespace}.${pointer.activeSlot}`;
  const slotBytes = localStorage.getItem(slotKey);
  assert.equal(
    JSON.parse(slotBytes).behaviorEvents.length,
    2,
    'two behavior records must genuinely be on disk, or "no part was interpreted" holds for an empty store'
  );
  return { localStorage, sessionStorage, slotKey, slotBytes };
}

test('FR-037: a corrupt unrecognized or future-version behavior record is quarantined with an inspectable reason and no part of the workspace is interpreted', () => {
  const { api, policy } = loadContracts();

  const damage = [
    { name: 'corrupt', reason: 'behavior-event-invalid', apply: (slot) => { slot.behaviorEvents[0].category = 'not-a-declared-category'; } },
    { name: 'future-version', reason: 'behavior-event-invalid', apply: (slot) => { slot.behaviorEvents[0].contractVersion = 'portfolio-behavior-event/v2'; } },
    { name: 'unrecognized', reason: 'unknown-field', apply: (slot) => { slot.behaviorEvents[0].unrecognizedField = 1; } }
  ];

  let quarantined = 0;
  damage.forEach((damaged) => {
    const seeded = seedDurableBehaviorNamespace(api, policy);
    const slot = JSON.parse(seeded.slotBytes);
    damaged.apply(slot);
    const damagedBytes = JSON.stringify(slot);
    seeded.localStorage.setItem(seeded.slotKey, damagedBytes);

    const opened = api.createPortfolioStore({ localStorage: seeded.localStorage, sessionStorage: seeded.sessionStorage }, policy).openWorkspace(LATER);
    assert.equal(opened.ok, false, `FR-037 a ${damaged.name} behavior record must not open`);
    // The second record is still valid. Requiring no workspace at all is what makes "ignored
    // rather than partially interpreted" a real claim: a store that dropped the bad record and
    // returned the good one would be green on `ok === false` alone.
    assert.equal(opened.value, undefined, `FR-037 a ${damaged.name} behavior record must yield no workspace, so the still-valid second record cannot be partially interpreted`);
    assert.equal(opened.error.reason, damaged.reason, `FR-037 a ${damaged.name} behavior record must be refused for its own reason, not a generic one`);
    assert.equal(seeded.localStorage.getItem(seeded.slotKey), damagedBytes, `FR-037 the ${damaged.name} record must be left in place for inspection, not silently rewritten or repaired`);

    const quarantineBytes = seeded.localStorage.getItem(policy.storage.quarantineKey);
    assert.equal(typeof quarantineBytes, 'string', `FR-037 a ${damaged.name} behavior record must leave a quarantine record`);
    const record = JSON.parse(quarantineBytes);
    assert.deepEqual(record.reasonCodes, [damaged.reason], `FR-037 the quarantine record for a ${damaged.name} behavior record must state its inspectable reason`);
    assert.equal(record.sourceKey, seeded.slotKey, `FR-037 the quarantine record must name where the ${damaged.name} record came from`);
    assert.equal(quarantineBytes.includes(SUBJECT_ALPHA), false, `FR-037 the quarantine record for a ${damaged.name} behavior record must carry no stored subject value`);
    quarantined += 1;
  });
  assert.equal(quarantined, damage.length, 'FR-037 every damage shape must have been exercised, not merely listed');

  // Control: the same seed, undamaged, opens with BOTH records and writes no quarantine.
  // Without it an implementation that quarantined every open would satisfy the arms above.
  const clean = seedDurableBehaviorNamespace(api, policy);
  const cleanOpen = api.createPortfolioStore({ localStorage: clean.localStorage, sessionStorage: clean.sessionStorage }, policy).openWorkspace(LATER);
  assert.equal(cleanOpen.ok, true, `FR-037 control: an undamaged behavior record must still open: ${JSON.stringify(cleanOpen.error || {})}`);
  assert.equal(cleanOpen.value.workspace.behaviorEvents.length, 2, 'FR-037 control: both committed records must load, so quarantine is selective rather than universal');
  assert.equal(clean.localStorage.getItem(policy.storage.quarantineKey), null, 'FR-037 control: a clean open must write no quarantine record');
});

test('FR-029: no read compose inventory or export path removes personal data, and the same bytes do clear when the clear is explicitly invoked', () => {
  const { api, policy } = loadContracts();
  const localStorage = createStorage();
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const withPortfolio = store.commitWorkspace(
    api.buildWorkspaceCandidate(validDraft(api, policy), opened.value.workspace, { name: 'Explicit clear portfolio', now: NOW }, policy).value,
    opened.value.workspace.generation,
    NOW
  );
  assert.equal(withPortfolio.ok, true);
  const withEvidence = store.commitWorkspace(
    appendEvent(api, policy, withPortfolio.value.workspace, {}).value.workspace,
    withPortfolio.value.workspace.generation,
    NOW
  );
  assert.equal(withEvidence.ok, true);
  const workspace = withEvidence.value.workspace;

  const before = localStorage.snapshot();
  assert.equal(Object.keys(before).length > 0, true, 'FR-029 personal bytes must genuinely exist, or "nothing was removed" holds for an empty namespace');
  assert.equal(workspace.behaviorEvents.length > 0, true, 'FR-029 behavior history must genuinely exist before an unrequested removal could be observed');

  // Every non-clear entry point this module exposes, run over the populated namespace.
  assert.equal(api.createPortfolioStore({ localStorage, sessionStorage }, policy).openWorkspace(NEXT_DAY).ok, true);
  assert.equal(api.privacyInventory(workspace, { localStorage, sessionStorage }, policy).ok, true);
  assert.equal(api.foundationPrivacyInventory({ localStorage, sessionStorage }).ok, true);
  assert.equal(api.projectRouteStates(workspace, policy).ok, true);
  assert.equal(api.exportPreview({ portfolio: workspace.portfolioRevisions[0] }).ok, true);
  assert.equal(api.exportPrivate({ portfolio: workspace.portfolioRevisions[0] }).ok, true);

  assert.deepEqual(localStorage.snapshot(), before, 'FR-029 no read compose inventory or export path may remove personal bytes without an explicit clear request');

  // Control: the same bytes DO clear on the explicit call, so their survival above is caused by
  // the absence of a clear request and not by a clear that no longer works on this namespace.
  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `FR-029 the explicit clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  assert.equal(cleared.value.verifiedEmpty, true);
  assert.equal(
    Object.keys(localStorage.snapshot()).some((key) => Object.prototype.hasOwnProperty.call(before, key)),
    false,
    'FR-029 control: the explicit clear must genuinely remove the personal bytes that survived every read path'
  );
});

// Each id below is a NEGATIVE: a class of source that must never become behavior evidence.
// The tokens are the ones the id's own spec sentence names, mapped onto the declared
// `forbiddenEventFields` vocabulary. An id with an empty token list would make every
// per-token claim under it vacuous, so the list length is asserted before it is walked.
const EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT = Object.freeze({
  // FR-030 cross-device identifier, sync profile, advertising identifier, account-linked profile
  'FR-030': Object.freeze(['accountlinked', 'advertisingid', 'crossdevice', 'syncprofile']),
  // FR-031 dwell time, clicks, scroll, return frequency, notification opens, other engagement
  'FR-031': Object.freeze(['clickcount', 'dwell', 'engagement', 'notificationopen', 'opencount', 'returnfrequency', 'scroll']),
  // FR-032 health, family, politics, religion, ethnicity, income/wealth class, psychological diagnosis
  'FR-032': Object.freeze(['diagnosis', 'ethnicity', 'family', 'health', 'income', 'politics', 'religion', 'sensitivetrait', 'wealthclass']),
  // FR-033 settings, preference fields, shock magnitudes, risk controls, display mode
  'FR-033': Object.freeze(['displaymode', 'parametervalue', 'preference', 'riskcontrol', 'setting', 'shockmagnitude']),
  // FR-035 raw text, secret fields, quantities, cost basis, P&L, goal amounts
  'FR-035': Object.freeze(['cashamount', 'costbasis', 'credential', 'goalamount', 'pnl', 'quantity', 'rawtext'])
});

test('FR-030 FR-031 FR-032 FR-033 FR-035: every excluded source named by each requirement is a declared token, is refused by name on both the build and the persistence path, and the refusal is selective', () => {
  const { api, policy } = loadContracts();
  const workspace = portfolioAndMandateWorkspace(api, policy);
  const workspaceBefore = JSON.stringify(workspace);

  // Selectivity control, run FIRST so every refusal below is known to be caused by the token.
  // A guard that refused every draft would already be red here.
  const cleanDraft = api.buildBehaviorCandidate(behaviorDraft(), workspace, { now: NOW }, policy);
  assert.equal(cleanDraft.ok, true, `control: a draft carrying no excluded source must still be accepted: ${JSON.stringify(cleanDraft.error || {})}`);
  assert.equal(cleanDraft.value.accepted, true, 'control: the clean draft must genuinely be recorded, or "refusal is selective" rests on nothing');

  // Second selectivity control: an unrecognized but harmless field is refused as an UNKNOWN
  // field, never as an excluded source. Without this arm an implementation that labelled every
  // rejection `forbidden-behavior-source` would satisfy all the per-token reasons below.
  const benign = api.buildBehaviorEvent({ ...behaviorDraft(), [BENIGN_EXTRA_FIELD]: 'inert' }, { now: NOW }, policy);
  assert.equal(benign.ok, false, 'control: an undeclared draft field must not be accepted');
  assert.equal(
    benign.error.reason,
    'unknown-field',
    'control: a harmless undeclared field must be refused as unknown, so "forbidden-behavior-source" is a real classification rather than the only rejection reason'
  );

  const requirements = Object.keys(EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT).sort();
  assert.equal(requirements.length, 5, 'five requirements must be exercised, not merely declared');

  let attempted = 0;
  requirements.forEach((requirement) => {
    const tokens = EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT[requirement];
    assert.equal(tokens.length > 0, true, `${requirement} must name at least one excluded source, or its per-token claims are vacuous`);

    tokens.forEach((token) => {
      assert.equal(
        policy.behavior.forbiddenEventFields.includes(token),
        true,
        `${requirement} the ${token} source must be declared excluded in the policy a reader can open, not only rejected by code`
      );

      // Build path. The field name is the token verbatim, so a guard that stopped matching
      // this token goes red here rather than falling through to a generic shape error.
      const attempt = api.buildBehaviorEvent({ ...behaviorDraft(), [token]: 'attempted' }, { now: NOW }, policy);
      assert.equal(attempt.ok, false, `${requirement} a behavior draft carrying ${token} must not become an event`);
      assert.equal(
        attempt.error.reason,
        'forbidden-behavior-source',
        `${requirement} ${token} must be refused as an excluded behavior source, not incidentally as an unknown field`
      );
      assert.equal(
        attempt.error.field,
        `draft.${token}`,
        `${requirement} the refusal must name draft.${token} exactly, so the surface can say which source was excluded`
      );

      // Persistence path. The build guard alone does not prove the source cannot reach storage,
      // because the candidate builder is a separate entry point.
      const persisted = api.buildBehaviorCandidate({ ...behaviorDraft(), [token]: 'attempted' }, workspace, { now: NOW }, policy);
      assert.equal(persisted.ok, false, `${requirement} a behavior candidate carrying ${token} must not build`);
      assert.equal(persisted.error.reason, 'forbidden-behavior-source', `${requirement} ${token} must be refused on the persistence path for its own reason`);
      assert.equal(persisted.value, undefined, `${requirement} a ${token} attempt must yield no workspace, so no part of it can be committed`);
      attempted += 1;
    });
  });

  const declaredTokenCount = Object.values(EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT).reduce((sum, tokens) => sum + tokens.length, 0);
  assert.equal(attempted, declaredTokenCount, 'every declared excluded source must have been attempted, not merely iterated over');
  assert.equal(
    new Set(Object.values(EXCLUDED_SOURCE_TOKENS_BY_REQUIREMENT).flat()).size,
    policy.behavior.forbiddenEventFields.length,
    'the five requirements must account for every declared excluded source, so a token added to the policy without a requirement owner is caught'
  );
  assert.equal(JSON.stringify(workspace), workspaceBefore, 'no refused attempt may mutate the workspace it was offered against');
});

// ---------------------------------------------------------------------------------------
// Shared population for FR-023, FR-027, FR-028, and FR-038.
//
// One workspace carrying a real value for every noun those ids name and that is
// representable at this contract scope: two holdings with a quantity and a cost basis, a
// mandate with a dated cash need, a provider label taken verbatim from the import, and two
// eligible behavior events. Each sentinel is distinctive enough that finding it in a byte
// range is a real observation rather than an accidental digit match.
// ---------------------------------------------------------------------------------------
const LOCAL_ONLY_QUANTITY = '1234.5678';
const LOCAL_ONLY_COST_BASIS = '98765.4321';
const PLAIN_HOLDING_LABEL = 'ordinary-holding-label';
const INERT_MARKUP_LABEL = '<script>alert(1)</script>';
const INERT_NAVIGATION_LABEL = 'javascript:void(0)';
const CASH_NEED_DATE = '2031-06-30';
const GENERIC_CACHE_KEY = 'rlDataGenericCacheProbe';

function localOnlyCsv(label) {
  return 'symbol,assetType,currency,quantity,price,costBasis,label\n' +
    `MSFT,listed,USD,${LOCAL_ONLY_QUANTITY},450.25,${LOCAL_ONLY_COST_BASIS},${label}\n` +
    `AAPL,listed,USD,10,200.00,500.00,${PLAIN_HOLDING_LABEL}\n`;
}

function localOnlyWorkspace(api, policy, label = INERT_MARKUP_LABEL) {
  const preview = api.validateImport('csv', localOnlyCsv(label), null, policy);
  assert.equal(preview.ok, true, `the local-only import must parse: ${JSON.stringify(preview.error || {})}`);
  const draft = api.resolveDuplicates(preview.value, 'merge');
  assert.equal(draft.ok, true, `the local-only draft must resolve: ${JSON.stringify(draft.error || {})}`);
  assert.equal(draft.value.canConfirm, true, 'the local-only draft must be confirmable, or nothing below is populated');
  const withPortfolio = api.buildWorkspaceCandidate(draft.value, api.createEmptyWorkspace(policy, NOW).value, { name: 'Local-only research portfolio', now: NOW }, policy);
  assert.equal(withPortfolio.ok, true, `the local-only portfolio must build: ${JSON.stringify(withPortfolio.error || {})}`);
  const withMandate = api.buildMandateCandidate(mandateDraft(api, policy, 'mandate-explicit.json'), withPortfolio.value, { now: NOW }, policy);
  assert.equal(withMandate.ok, true, `the local-only mandate must build: ${JSON.stringify(withMandate.error || {})}`);
  const first = appendEvent(api, policy, withMandate.value, {});
  return appendEvent(api, policy, first.value.workspace, { subjectId: SUBJECT_BETA }, NEXT_DAY).value.workspace;
}

// Comments are stripped before the sink scan below, so a prose mention of a sink in a
// module that must contain none cannot fail the build for the wrong reason. A stripper that
// blanked the file would make every `doesNotMatch` vacuous, so the retained ratio is
// asserted before the scan runs.
function strippedSource(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

// Every network sink, navigation surface, and browser-owned persistence surface a
// local-only contract cannot reach. `globalThis` and `require` are excluded on purpose:
// they are this module's own dual-runtime bootstrap and export tail, not a sink.
const FR023_EGRESS_IDENTIFIERS = Object.freeze([
  'BroadcastChannel', 'EventSource', 'Notification', 'ServiceWorker', 'WebSocket', 'Worker',
  'XMLHttpRequest', 'document', 'fetch', 'history', 'importScripts', 'indexedDB', 'location',
  'navigator', 'openDatabase', 'postMessage', 'process', 'sendBeacon'
]);

test('FR-023: the module carries no egress sink, every byte it writes lands in the declared personal namespace, and the preview that declares it excludes personal values genuinely excludes them', () => {
  const { api, policy } = loadContracts();

  // 1. No sink exists. A local-only contract that grew a network, navigation, or
  // unmanaged-persistence surface goes red here before any data claim is reached.
  const source = readFileSync(MODULE_PATH, 'utf8');
  const scannable = strippedSource(source);
  assert.equal(scannable.length > source.length * 0.5, true, 'FR-023 comment stripping must leave the module substantially intact, or every sink claim below is made against a blank file');
  assert.equal(FR023_EGRESS_IDENTIFIERS.length > 0, true, 'FR-023 an empty sink list would make the per-sink claims vacuous');
  let scanned = 0;
  FR023_EGRESS_IDENTIFIERS.forEach((identifier) => {
    assert.doesNotMatch(scannable, new RegExp(`\\b${identifier}\\b`), `FR-023 ${identifier} must not appear in a module that keeps holdings quantities cost basis mandate cash needs and behavior history local-only`);
    scanned += 1;
  });
  assert.equal(scanned, FR023_EGRESS_IDENTIFIERS.length, 'FR-023 every declared sink must have been scanned, not merely listed');
  assert.match(`${scannable}\nfetch("https://example.com");`, /\bfetch\b/, 'FR-023 control: the same scan must find a sink that is genuinely present, so "no match" is caused by the module and not by a pattern that matches nothing');

  // 2. Populate and prove. Each noun FR-023 names gets one sentinel that is genuinely in
  // the workspace, so its later confinement is an observation rather than an empty set.
  const workspace = localOnlyWorkspace(api, policy);
  const serializedWorkspace = JSON.stringify(workspace);
  const named = Object.freeze({
    holdings: PLAIN_HOLDING_LABEL,
    quantities: LOCAL_ONLY_QUANTITY,
    'cost basis': LOCAL_ONLY_COST_BASIS,
    mandate: mandateFixture('mandate-explicit.json').objectiveLabel,
    'cash needs': CASH_NEED_DATE,
    'behavior history': SUBJECT_ALPHA
  });
  const nouns = Object.keys(named);
  assert.equal(nouns.length, 6, 'FR-023 every noun the id names that is representable at this scope must carry a sentinel; P&L is deliberately absent because no holding revision mandate or event field holds one');
  nouns.forEach((noun) => {
    assert.equal(serializedWorkspace.includes(named[noun]), true, `FR-023 the ${noun} sentinel must genuinely be in the workspace, or its confinement below is asserted about nothing`);
  });

  // 3. Every write lands inside the declared personal namespace. The adapter is seeded with
  // a generic public cache key first, so the namespace it reports is not simply empty.
  const localStorage = createStorage({ initial: { [GENERIC_CACHE_KEY]: 'generic-public-cache' } });
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const committed = store.commitWorkspace({ ...workspace, generation: opened.value.workspace.generation }, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true, `FR-023 the local-only workspace must commit: ${JSON.stringify(committed.error || {})}`);

  // The capability probe is the one write the module makes outside a persisted slot: it puts a
  // declared constant into the namespace, reads it back to tell durable from session from memory,
  // and removes it. Its keys are derived from the policy rather than written as literals, so a
  // namespace rename carries the allowance with it instead of leaving a stale literal behind that
  // would quietly admit a foreign key.
  const probeKeys = [`${policy.storage.workspaceNamespace}.probe`, `${policy.storage.sessionKey}.probe`];
  const declaredKeys = [policy.storage.pointerKey, ...policy.storage.slotKeys, policy.storage.quarantineKey, policy.storage.sessionKey, policy.storage.returnContextKey, ...probeKeys];
  const recordedWrites = [...localStorage.writes(), ...sessionStorage.writes()];
  const writtenKeys = recordedWrites.map((entry) => entry.key);
  assert.equal(writtenKeys.length > 0, true, 'FR-023 the commit must genuinely have written, or "every write stayed local" holds for zero writes');
  writtenKeys.forEach((key) => {
    assert.equal(declaredKeys.includes(key), true, `FR-023 ${key} is outside the declared personal storage contract, so a personal value left the local-only namespace`);
  });

  // Admitting the probe key on the strength of its name alone would let a probe that ever carried
  // a personal value, or that stopped cleaning up after itself, pass as a declared write. So the
  // probe is held to the three properties that make it harmless: it carries exactly the declared
  // constant, it carries none of the six sentinels, and it does not survive the commit.
  const probeWrites = recordedWrites.filter((entry) => probeKeys.includes(entry.key));
  assert.equal(probeWrites.length > 0, true, 'FR-023 the capability probe must genuinely have been written, or the claims below hold for zero probes');
  probeWrites.forEach((entry) => {
    assert.equal(entry.value, policy.storage.probeValue, `FR-023 ${entry.key} must carry exactly the declared probe constant, so the probe cannot become a channel for a personal value`);
    nouns.forEach((noun) => {
      assert.equal(entry.value.includes(named[noun]), false, `FR-023 the ${noun} sentinel must not appear in the ${entry.key} probe write`);
    });
    assert.equal(localStorage.getItem(entry.key), null, `FR-023 ${entry.key} must not survive the commit in durable storage, so a capability probe cannot leave personal residue behind`);
    assert.equal(sessionStorage.getItem(entry.key), null, `FR-023 ${entry.key} must not survive the commit in session storage, so a capability probe cannot leave personal residue behind`);
  });

  // Controls for the three probe claims. Each drives the module's OWN probe path into the violating
  // state through an in-memory policy clone or an adapter option, never through an edit to the
  // module, then runs the claim's own predicate against what that produced and requires it to
  // throw. A claim that cannot go red is caught here rather than passing silently for the life of
  // the file.
  const taintedProbePolicy = { ...policy, storage: { ...policy.storage, probeValue: `${policy.storage.probeValue}-${LOCAL_ONLY_QUANTITY}` } };
  const taintedLocal = createStorage();
  const taintedOpen = api.createPortfolioStore({ localStorage: taintedLocal, sessionStorage: createStorage() }, taintedProbePolicy).openWorkspace(NOW);
  assert.equal(taintedOpen.ok, true, 'FR-023 control: the tainted-probe store must still open, or its probe never ran');
  const taintedProbeWrite = taintedLocal.writes().find((entry) => entry.key === probeKeys[0]);
  assert.notEqual(taintedProbeWrite, undefined, 'FR-023 control: the tainted-probe store must have written a probe, or the two value claims are proven against no write');
  assert.throws(
    () => assert.equal(taintedProbeWrite.value, policy.storage.probeValue),
    undefined,
    'FR-023 control: the declared-constant claim must reject a probe whose value is not the declared constant'
  );
  assert.throws(
    () => assert.equal(taintedProbeWrite.value.includes(LOCAL_ONLY_QUANTITY), false),
    undefined,
    'FR-023 control: the sentinel claim must reject a probe that carries a personal value'
  );

  const uncleanedLocal = createStorage({ failRemove: [probeKeys[0]] });
  api.createPortfolioStore({ localStorage: uncleanedLocal, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(uncleanedLocal.writes().some((entry) => entry.key === probeKeys[0]), true, 'FR-023 control: the uncleaned-probe store must have written a probe, or the persistence claim is proven against no write');
  assert.throws(
    () => assert.equal(uncleanedLocal.getItem(probeKeys[0]), null),
    undefined,
    'FR-023 control: the non-persistence claim must reject a probe that was written and then never removed'
  );

  const namespaceBytes = writtenKeys.map((key) => localStorage.getItem(key) || sessionStorage.getItem(key) || '').join('');
  nouns.forEach((noun) => {
    assert.equal(namespaceBytes.includes(named[noun]), true, `FR-023 the ${noun} sentinel must be found inside the declared personal namespace, so the key sweep above covered the bytes that carry it`);
  });
  assert.equal(localStorage.getItem(GENERIC_CACHE_KEY), 'generic-public-cache', 'FR-023 the generic public cache key must be untouched by a personal commit');
  assert.equal(
    nouns.some((noun) => localStorage.getItem(GENERIC_CACHE_KEY).includes(named[noun])),
    false,
    'FR-023 no personal sentinel may reach a generic public cache key'
  );

  // Recorder control: a key outside the namespace written through the SAME adapter is
  // recorded. Without it "every written key was declared" could hold because the recorder
  // never sees a foreign write at all.
  localStorage.setItem(GENERIC_CACHE_KEY, 'written-after-measurement');
  assert.equal(
    localStorage.writes().some((entry) => entry.key === GENERIC_CACHE_KEY),
    true,
    'FR-023 control: the write recorder must capture a key outside the declared namespace, so the sweep above is a real finding'
  );

  // 4. The one surface that declares it excludes personal values must be telling the truth.
  // The preview and the private export receive the SAME revision, so an absent value in the
  // preview is an omission rather than an input it was never given.
  const revision = workspace.portfolioRevisions[0];
  const preview = api.exportPreview({ portfolio: revision });
  const privateExport = api.exportPrivate({ portfolio: revision });
  assert.equal(preview.ok, true, `FR-023 the preview must build: ${JSON.stringify(preview.error || {})}`);
  assert.equal(privateExport.ok, true, `FR-023 the private export must build: ${JSON.stringify(privateExport.error || {})}`);
  assert.equal(preview.value.personalValuesIncluded, false, 'FR-023 the preview must declare that it carries no personal value');
  const serializedPreview = JSON.stringify(preview.value);
  const revisionSentinels = [PLAIN_HOLDING_LABEL, LOCAL_ONLY_QUANTITY, LOCAL_ONLY_COST_BASIS, INERT_MARKUP_LABEL];
  revisionSentinels.forEach((sentinel) => {
    assert.equal(privateExport.value.text.includes(sentinel), true, `FR-023 control: ${sentinel} must be present in the private export of the same revision, so its absence from the preview is a real omission and not an undetectable value`);
    assert.equal(serializedPreview.includes(sentinel), false, `FR-023 ${sentinel} must not appear in a preview that declares personalValuesIncluded false`);
  });
  assert.deepEqual(
    Object.keys(preview.value).sort(),
    ['categories', 'contractVersion', 'holdingCount', 'personalValuesIncluded', 'valuationCurrency'],
    'FR-023 the preview shape is closed, so a personal field added to it is caught by name rather than only by its current value'
  );
});

// The six groups FR-027 requires the inventory to separate, each mapped onto the inventory
// surfaces that report it. Two groups sharing one surface is exactly the failure the id
// forbids, so the mapped surfaces are asserted pairwise distinct before any count is read.
const FR027_SEPARATED_GROUPS = Object.freeze({
  holdings: Object.freeze(['portfolio-revisions']),
  'mandate and cash needs': Object.freeze(['mandate-revisions', 'cash-needs']),
  'behavior events': Object.freeze(['behavior-events']),
  'inferred interests': Object.freeze(['interest-signals']),
  'dismissed and completed actions': Object.freeze(['action-outcomes'])
});

test('FR-027: the local privacy inventory reports each named personal group on its own surface, separates dismissed from completed, and keeps cached generic evidence out of the personal count', () => {
  const { api, policy } = loadContracts();
  const workspace = localOnlyWorkspace(api, policy);
  const localStorage = createStorage({ initial: { [GENERIC_CACHE_KEY]: 'generic-public-cache' } });
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(store.commitWorkspace({ ...workspace, generation: opened.value.workspace.generation }, opened.value.workspace.generation, NOW).ok, true);

  const inventory = api.privacyInventory(workspace, { localStorage, sessionStorage }, policy);
  assert.equal(inventory.ok, true, `FR-027 the inventory must build: ${JSON.stringify(inventory.error || {})}`);
  const byName = Object.fromEntries(inventory.value.categories.map((entry) => [entry.category, entry]));

  const groups = Object.keys(FR027_SEPARATED_GROUPS);
  assert.equal(groups.length, 5, 'FR-027 every named personal group must be mapped; cached generic evidence is asserted separately below because it is a declared non-category');
  const mappedSurfaces = groups.flatMap((group) => FR027_SEPARATED_GROUPS[group]);
  assert.equal(
    new Set(mappedSurfaces).size,
    mappedSurfaces.length,
    'FR-027 no inventory surface may serve two named groups, or the inventory has merged categories the id requires it to separate'
  );
  let inspected = 0;
  groups.forEach((group) => {
    FR027_SEPARATED_GROUPS[group].forEach((surface) => {
      assert.equal(Object.prototype.hasOwnProperty.call(byName, surface), true, `FR-027 ${group} must be reported on its own ${surface} surface`);
      assert.equal(typeof byName[surface].recordCount, 'number', `FR-027 ${group} must report a count of its own on ${surface}`);
      assert.equal(byName[surface].present, byName[surface].recordCount > 0, `FR-027 the ${surface} presence flag must follow its own count`);
      inspected += 1;
    });
  });
  assert.equal(inspected, mappedSurfaces.length, 'FR-027 every mapped surface must have been inspected, not merely listed');

  // Counted independently: a single lumped counter cannot satisfy four different totals.
  assert.equal(byName['portfolio-revisions'].recordCount, workspace.portfolioRevisions.length, 'FR-027 holdings must be counted from the portfolio revisions themselves');
  assert.equal(byName['mandate-revisions'].recordCount, workspace.mandateRevisions.length, 'FR-027 mandate must be counted separately from its cash needs');
  assert.equal(
    byName['cash-needs'].recordCount,
    workspace.mandateRevisions.reduce((sum, entry) => sum + entry.cashNeeds.length, 0),
    'FR-027 cash needs must be counted separately from the mandate revision that carries them'
  );
  assert.equal(byName['behavior-events'].recordCount, workspace.behaviorEvents.length, 'FR-027 behavior events must be counted on their own surface');
  assert.equal(byName['behavior-events'].recordCount, 2, 'FR-027 behavior evidence must genuinely exist, or its separation from the other groups is asserted over an empty set');
  assert.equal(byName['portfolio-revisions'].present, true, 'FR-027 holdings must genuinely be present in the inventory being read');
  assert.equal(byName['cash-needs'].present, true, 'FR-027 a cash need must genuinely be present in the inventory being read');

  // Dismissed and completed are separate outcome states, and every state the reducer can
  // actually produce has its own counter slot. An inventory that lumped them into one
  // closed-action counter would leave one produced state with no slot.
  const producedStates = policy.behavior.outcomeCommands.map((command) => {
    const reduced = api.reduceActionOutcome(RESULT_IDENTITY, command, 'owner-decision', NOW, policy);
    assert.equal(reduced.ok, true, `FR-027 the ${command} outcome must reduce, or the counter slots below are compared against nothing`);
    return reduced.value.state;
  });
  assert.equal(new Set(producedStates).size, producedStates.length, 'FR-027 the reducer must produce pairwise distinct outcome states');
  assert.equal(producedStates.includes('completed') && producedStates.includes('dismissed'), true, 'FR-027 dismissed and completed must both be genuinely producible states');
  producedStates.forEach((state) => {
    assert.equal(
      Object.prototype.hasOwnProperty.call(inventory.value.outcomeStateCounts, state),
      true,
      `FR-027 the ${state} outcome state must have its own counter slot, so dismissed and completed actions are reported separately`
    );
  });
  assert.deepEqual(
    Object.keys(inventory.value.outcomeStateCounts).sort(),
    [...policy.behavior.outcomeStates].sort(),
    'FR-027 the outcome counter keyspace is exactly the declared states, so a state cannot be folded into another'
  );
  // Honest scope limit: the counters are read at zero because `validateWorkspace` re-derives
  // the workspace hash, so an outcome cannot be placed into a workspace from outside the
  // builders this scope exposes. Asserting that refusal keeps the limit from going silent.
  assert.equal(
    api.validateWorkspace({ ...workspace, actionOutcomes: [api.reduceActionOutcome(RESULT_IDENTITY, 'complete', 'owner-decision', NOW, policy).value] }, policy).error.reason,
    'workspace-hash-mismatch',
    'FR-027 an outcome added to a workspace outside the builders must be refused, which is why the per-state counts above are exercised at zero'
  );

  // Cached generic evidence stays separate: the generic key sits in the same adapter and is
  // neither counted nor listed, and the inventory says so rather than implying it swept it.
  assert.equal(inventory.value.genericNamespacesInspected, false, 'FR-027 the inventory must declare that generic namespaces were not inspected rather than implying it covered them');
  assert.equal(Object.keys(localStorage.snapshot()).includes(GENERIC_CACHE_KEY), true, 'FR-027 the generic cache key must genuinely be in the same adapter, or its exclusion below is asserted about nothing');
  assert.equal(
    inventory.value.personalKeyCount,
    Object.keys(localStorage.snapshot()).filter((key) => key !== GENERIC_CACHE_KEY).length,
    'FR-027 the personal key count must exclude the cached generic evidence sharing the adapter'
  );
  const foundationInventory = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(foundationInventory.ok, true);
  assert.equal(
    foundationInventory.value.presentKeys.some((entry) => entry.key === GENERIC_CACHE_KEY),
    false,
    'FR-027 a cached generic evidence key must never be listed as a personal key'
  );
  assert.equal(foundationInventory.value.presentKeys.length > 0, true, 'FR-027 personal keys must genuinely be listed, or the generic exclusion above holds for an empty list');
});

test('FR-028: a behavior clear removes the eligible events and empties the derived-interest container while holdings mandate and cash needs survive, and the separately requested clears do remove them', () => {
  const { api, policy } = loadContracts();
  const workspace = localOnlyWorkspace(api, policy);

  // Populate and prove, including the lifecycle state, so "removes eligible events" is a
  // claim about events that were genuinely eligible rather than about an empty list.
  assert.equal(workspace.behaviorEvents.length, 2, 'FR-028 behavior evidence must genuinely exist before a clear can remove it');
  workspace.behaviorEvents.forEach((event) => {
    assert.equal(event.lifecycleState, 'eligible', 'FR-028 the events being cleared must genuinely be in the eligible lifecycle state');
  });
  assert.equal(workspace.portfolioRevisions.length > 0, true, 'FR-028 holdings must genuinely exist before their survival can be observed');
  assert.equal(workspace.mandateRevisions[0].cashNeeds.length > 0, true, 'FR-028 a cash need must genuinely exist before its survival can be observed');

  const cleared = api.buildBehaviorClearCandidate(workspace, LATER, policy);
  assert.equal(cleared.ok, true, `FR-028 the behavior clear must succeed: ${JSON.stringify(cleared.error || {})}`);
  assert.equal(cleared.value.clearedEventCount, workspace.behaviorEvents.length, 'FR-028 the reported cleared count must match the proven pre-clear population');
  assert.equal(cleared.value.workspace.behaviorEvents.length, 0, 'FR-028 a behavior clear must remove the eligible events');
  assert.equal(cleared.value.workspace.interestSignals.length, 0, 'FR-028 a behavior clear must leave no derived interest behind');
  assert.equal(api.validateWorkspace(cleared.value.workspace, policy).ok, true, 'FR-028 the cleared workspace must still be a valid workspace');

  assert.deepEqual(cleared.value.workspace.portfolioRevisions, workspace.portfolioRevisions, 'FR-028 holdings must survive a behavior clear byte for byte');
  assert.deepEqual(cleared.value.workspace.mandateRevisions, workspace.mandateRevisions, 'FR-028 mandate and cash needs must survive a behavior clear byte for byte');
  assert.equal(cleared.value.workspace.currentPortfolioId, workspace.currentPortfolioId, 'FR-028 a behavior clear must not de-current the portfolio');
  assert.equal(cleared.value.workspace.currentMandateId, workspace.currentMandateId, 'FR-028 a behavior clear must not de-current the mandate');

  // "Unless separately requested": the separate clears DO remove what the behavior clear
  // preserved. Without this arm, an implementation that could not clear a portfolio or a
  // mandate at all would satisfy every preservation claim above.
  const portfolioClear = api.buildPortfolioClearCandidate(workspace, LATER, policy);
  assert.equal(portfolioClear.ok, true, `FR-028 the separately requested portfolio clear must succeed: ${JSON.stringify(portfolioClear.error || {})}`);
  assert.equal(portfolioClear.value.currentPortfolioId, null, 'FR-028 control: a separately requested portfolio clear must genuinely remove the portfolio, so the behavior clear preserving it is caused by the request kind');
  assert.equal(portfolioClear.value.currentMandateId, workspace.currentMandateId, 'FR-028 a portfolio clear must not also remove the mandate');
  assert.equal(portfolioClear.value.behaviorEvents.length, workspace.behaviorEvents.length, 'FR-028 a portfolio clear must not also remove behavior history');

  const mandateClear = api.buildMandateClearCandidate(workspace, LATER, policy);
  assert.equal(mandateClear.ok, true, `FR-028 the separately requested mandate clear must succeed: ${JSON.stringify(mandateClear.error || {})}`);
  assert.equal(mandateClear.value.currentMandateId, null, 'FR-028 control: a separately requested mandate clear must genuinely remove the mandate, so the behavior clear preserving it is caused by the request kind');
  assert.equal(mandateClear.value.currentPortfolioId, workspace.currentPortfolioId, 'FR-028 a mandate clear must not also remove the portfolio');
  assert.equal(mandateClear.value.behaviorEvents.length, workspace.behaviorEvents.length, 'FR-028 a mandate clear must not also remove behavior history');

  // Honest scope limit: the derived-interest container is asserted empty above over a
  // container this contract forces empty. Asserting the refusal keeps a future widening
  // from silently inheriting an untested "removes derived interests" claim.
  assert.equal(
    api.validateWorkspace({ ...workspace, interestSignals: [{ interestId: 'inferred' }] }, policy).error.reason,
    'unsupported-contract-scope',
    'FR-028 a workspace carrying a derived interest is refused at this contract scope, which is why the emptiness claim above is not yet exercised against a populated set'
  );
});

// The five nouns FR-034 requires an eligible event to retain, mapped onto the stored fields
// that carry them. Dropping any one of these fields from a stored event must be refused.
const FR034_RETAINED_FIELDS = Object.freeze({
  category: 'category',
  subject: 'subjectKind',
  'subject id': 'subjectId',
  domain: 'domain',
  timestamp: 'occurredAt',
  'source surface': 'sourceSurface',
  'local lifecycle state': 'lifecycleState'
});

test('FR-034: an eligible behavior event is admitted only for a documented completed research action and retains category subject domain timestamp source surface and lifecycle state', () => {
  const { api, policy } = loadContracts();
  const documented = policy.behavior.eventCategories;
  assert.equal(documented.length > 0, true, 'FR-034 an empty documented category list would make every per-category claim vacuous');

  // Limited to completed research actions: the documented vocabulary itself contains only
  // completed actions, so an in-progress or open-ended category cannot be declared.
  documented.forEach((category) => {
    assert.match(category, /-completed$/, `FR-034 ${category} must name a completed research action, so an in-progress activity cannot be admitted as evidence`);
  });

  // Control, run first: every documented category is genuinely accepted, so the refusals
  // below are caused by the attempted category rather than by a builder that refuses all.
  let accepted = 0;
  documented.forEach((category) => {
    const built = api.buildBehaviorEvent(behaviorDraft({ category }), { now: NOW }, policy);
    assert.equal(built.ok, true, `FR-034 control: the documented category ${category} must be accepted: ${JSON.stringify(built.error || {})}`);
    assert.equal(built.value.category, category, `FR-034 the admitted event must retain the ${category} it was built for`);
    accepted += 1;
  });
  assert.equal(accepted, documented.length, 'FR-034 every documented category must have been exercised, not merely iterated over');

  // Attempts: a research action that is not completed, and a category outside the
  // documented vocabulary, are both refused.
  const undocumented = ['ticker-research-started', 'ticker-research-in-progress', 'dossier-review-opened', 'not-a-declared-category'];
  let refused = 0;
  undocumented.forEach((category) => {
    assert.equal(documented.includes(category), false, `FR-034 ${category} must genuinely be outside the documented vocabulary, or its refusal proves nothing`);
    const attempt = api.buildBehaviorEvent(behaviorDraft({ category }), { now: NOW }, policy);
    assert.equal(attempt.ok, false, `FR-034 ${category} is not a documented completed research action and must not become an eligible event`);
    assert.equal(attempt.error.reason, 'behavior-event-invalid', `FR-034 ${category} must be refused as an invalid event, not incidentally by another guard`);
    refused += 1;
  });
  assert.equal(refused, undocumented.length, 'FR-034 every undocumented category must have been attempted, not merely listed');

  // Retention: the built event carries every named noun with the value it was built from.
  const event = api.buildBehaviorEvent(behaviorDraft(), { now: NOW }, policy);
  assert.equal(event.ok, true, `FR-034 the reference event must build: ${JSON.stringify(event.error || {})}`);
  const draft = behaviorDraft();
  assert.equal(event.value.category, draft.category, 'FR-034 an eligible event must retain its category');
  assert.equal(event.value.subjectKind, draft.subjectKind, 'FR-034 an eligible event must retain its subject kind');
  assert.equal(event.value.subjectId, draft.subjectId, 'FR-034 an eligible event must retain its subject id');
  assert.equal(event.value.domain, draft.domain, 'FR-034 an eligible event must retain its domain');
  assert.equal(event.value.sourceSurface, draft.sourceSurface, 'FR-034 an eligible event must retain the surface it came from');
  assert.equal(event.value.occurredAt, NOW, 'FR-034 an eligible event must retain the timestamp it occurred at');
  assert.equal(event.value.lifecycleState, 'eligible', 'FR-034 an admitted event must carry the eligible local lifecycle state');
  assert.equal(policy.behavior.eventLifecycleStates.includes(event.value.lifecycleState), true, 'FR-034 the local lifecycle state must be one the policy declares');

  // Attempts: dropping any retained field makes the stored event unreadable, so retention is
  // enforced rather than merely populated by the current builder.
  const retained = Object.keys(FR034_RETAINED_FIELDS);
  assert.equal(retained.length, 7, 'FR-034 every named retained noun must be mapped onto a stored field');
  let dropped = 0;
  retained.forEach((noun) => {
    const field = FR034_RETAINED_FIELDS[noun];
    assert.equal(Object.prototype.hasOwnProperty.call(event.value, field), true, `FR-034 the stored event must carry a ${field} field for ${noun}`);
    const withoutField = { ...event.value };
    delete withoutField[field];
    const validated = api.validateBehaviorEvent(withoutField, policy);
    assert.equal(validated.ok, false, `FR-034 an event that lost its ${noun} must not validate`);
    assert.equal(validated.error.reason, 'unknown-field', `FR-034 an event missing ${field} must be refused by shape rather than read with the noun absent`);
    dropped += 1;
  });
  assert.equal(dropped, retained.length, 'FR-034 every retained field must have been dropped and refused, not merely listed');
  assert.equal(api.validateBehaviorEvent(event.value, policy).ok, true, 'FR-034 control: the intact event must still validate, so the refusals above are caused by the dropped field');
});

// Provider-supplied strings that must be carried as text and never gain executable or
// navigational meaning: script markup, an inline URL scheme, and an attribute-shaped payload.
const FR038_INERT_PAYLOADS = Object.freeze([INERT_MARKUP_LABEL, INERT_NAVIGATION_LABEL, '<b onclick="x()">y</b>', 'https://example.com/redirect']);

test('FR-038: an imported provider label carrying markup or a navigation scheme is retained as inert text with no navigation authority, and the recommendation token fields refuse it while still accepting a legitimate token', () => {
  const { api, policy } = loadContracts();

  // Control, run first: a plain label round-trips byte for byte, so "retained verbatim"
  // below is a property of the import rather than an artefact of a rewrite that happens to
  // leave these payloads alone.
  const plainPreview = api.validateImport('csv', localOnlyCsv('an ordinary provider label'), null, policy);
  assert.equal(plainPreview.ok, true, `FR-038 control: a plain provider label must import: ${JSON.stringify(plainPreview.error || {})}`);
  assert.equal(plainPreview.value.holdings[0].label, 'an ordinary provider label', 'FR-038 control: a plain provider label must be retained as written');

  let carried = 0;
  FR038_INERT_PAYLOADS.forEach((payload) => {
    const preview = api.validateImport('csv', localOnlyCsv(payload), null, policy);
    assert.equal(preview.ok, true, `FR-038 a provider label containing ${payload} must import as text: ${JSON.stringify(preview.error || {})}`);
    assert.equal(preview.value.canConfirm, true, `FR-038 a provider label containing ${payload} must not block the draft, because it is data rather than a defect`);
    assert.equal(preview.value.holdings[0].label, payload, `FR-038 ${payload} must be retained byte for byte as inert text, neither executed nor rewritten into a structural field`);
    assert.equal(typeof preview.value.holdings[0].label, 'string', `FR-038 ${payload} must remain a plain string value`);
    carried += 1;
  });
  assert.equal(carried, FR038_INERT_PAYLOADS.length, 'FR-038 every inert payload must have been imported, not merely listed');

  // No navigation authority. The route projection is computed from a workspace whose current
  // revision provably carries the markup label, so the label's absence from the projection
  // is a real omission rather than an input the projection never saw.
  const markupWorkspace = localOnlyWorkspace(api, policy, INERT_MARKUP_LABEL);
  const navigationWorkspace = localOnlyWorkspace(api, policy, INERT_NAVIGATION_LABEL);
  assert.equal(JSON.stringify(markupWorkspace).includes(INERT_MARKUP_LABEL), true, 'FR-038 the markup label must genuinely be in the workspace the routes are projected from');
  assert.equal(JSON.stringify(navigationWorkspace).includes(INERT_NAVIGATION_LABEL), true, 'FR-038 the navigation-scheme label must genuinely be in the workspace the routes are projected from');

  const markupRoutes = api.projectRouteStates(markupWorkspace, policy);
  const navigationRoutes = api.projectRouteStates(navigationWorkspace, policy);
  assert.equal(markupRoutes.ok, true, `FR-038 the route projection must build: ${JSON.stringify(markupRoutes.error || {})}`);
  assert.equal(navigationRoutes.ok, true, `FR-038 the route projection must build: ${JSON.stringify(navigationRoutes.error || {})}`);
  assert.equal(policy.mandate.descriptiveRouteStates.length > 0, true, 'FR-038 an empty declared route list would make the route claims below vacuous');
  assert.deepEqual(
    markupRoutes.value.routes.map((entry) => entry.route),
    policy.mandate.descriptiveRouteStates,
    'FR-038 every route must come from the declared route vocabulary, so an imported label cannot add or rename a destination'
  );
  assert.deepEqual(
    navigationRoutes.value.routes.map((entry) => entry.route),
    markupRoutes.value.routes.map((entry) => entry.route),
    'FR-038 two workspaces differing only in a provider label must project identical routes, so the label carries no navigation authority'
  );
  [[INERT_MARKUP_LABEL, markupRoutes], [INERT_NAVIGATION_LABEL, navigationRoutes]].forEach(([payload, projected]) => {
    assert.equal(JSON.stringify(projected.value).includes(payload), false, `FR-038 ${payload} must not reach the route projection in any field`);
  });

  // Recommendation text. Control first: a legitimate token draft is accepted, so a builder
  // that refused everything would already be red before any payload is attempted.
  const legitimate = api.buildBehaviorEvent(behaviorDraft(), { now: NOW }, policy);
  assert.equal(legitimate.ok, true, `FR-038 control: a legitimate token draft must be accepted: ${JSON.stringify(legitimate.error || {})}`);
  const alternative = api.buildBehaviorEvent(behaviorDraft({ subjectId: SUBJECT_BETA, sourceSurface: 'path-lab' }), { now: NOW }, policy);
  assert.equal(alternative.ok, true, `FR-038 control: a second legitimate token draft must also be accepted, so acceptance is not limited to one canonical value: ${JSON.stringify(alternative.error || {})}`);

  const tokenFields = ['subjectKind', 'subjectId', 'domain', 'horizon', 'sourceSurface', 'completionConditionId'];
  let attempts = 0;
  tokenFields.forEach((field) => {
    FR038_INERT_PAYLOADS.forEach((payload) => {
      const attempt = api.buildBehaviorEvent(behaviorDraft({ [field]: payload }), { now: NOW }, policy);
      assert.equal(attempt.ok, false, `FR-038 ${payload} must not be admitted into the ${field} of a recommendation event`);
      assert.equal(attempt.error.reason, 'behavior-event-invalid', `FR-038 ${payload} in ${field} must be refused as an invalid event, so markup cannot become part of a stored recommendation token`);
      assert.equal(attempt.value, undefined, `FR-038 a ${field} carrying ${payload} must yield no event at all`);
      attempts += 1;
    });
  });
  assert.equal(attempts, tokenFields.length * FR038_INERT_PAYLOADS.length, 'FR-038 every payload must have been attempted against every token field, not merely listed');
});

// ---------------------------------------------------------------------------------------
// NFR-001, NFR-004, NFR-008, NFR-019, NFR-023, NFR-024.
//
// Where an id shares ground with a functional requirement already covered above, the block
// below asserts the part the FR does not: NFR-001 sweeps the PUBLIC PROJECTIONS the module
// emits rather than its sinks (FR-023), NFR-004 asserts the ranking OBJECTIVE rather than
// the excluded-token list (FR-031), NFR-019 asserts CREDENTIAL rejection rather than markup
// inertness (FR-038), and NFR-023 and NFR-024 are deliberately split -- traceable means the
// change is reported and inspectable, verified means the deletion is confirmed by an
// independent reread. Sharing one assertion between the last two would leave whichever half
// is not asserted resting on the other half's evidence.
// ---------------------------------------------------------------------------------------

// Mirrors the module's own field-name normalisation, so an engagement metric offered as
// `Dwell_Time` is measured against the declared `dwell` token the way the module measures it.
function normalizedFieldToken(name) {
  return String(name).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// The nouns NFR-001 names that are representable at this contract scope, each mapped to a
// sentinel `localOnlyWorkspace` genuinely puts in the workspace. P&L is absent for the same
// reason FR-023 records: no holding revision, mandate, or event field holds one.
function nfr001Sentinels() {
  return Object.freeze({
    portfolio: PLAIN_HOLDING_LABEL,
    quantities: LOCAL_ONLY_QUANTITY,
    'cost basis': LOCAL_ONLY_COST_BASIS,
    goals: mandateFixture('mandate-explicit.json').objectiveLabel,
    'cash needs': CASH_NEED_DATE,
    behavior: SUBJECT_ALPHA
  });
}

test('NFR-001: every personal noun the id names is stored in the declared local namespace and appears in none of the public projections the module emits, while the local-only projections that legitimately carry it prove the same search does find it', () => {
  const { api, policy } = loadContracts();
  const workspace = localOnlyWorkspace(api, policy);
  const sentinels = nfr001Sentinels();
  const nouns = Object.keys(sentinels);
  assert.equal(nouns.length, 6, 'NFR-001 every noun the id names that is representable at this scope must carry a sentinel, or the sweep below is short');
  assert.equal(new Set(Object.values(sentinels)).size, nouns.length, 'NFR-001 two nouns sharing one sentinel would let a leak of the first pass as a finding about the second');

  // Populate and prove. Without this, "absent from every public projection" would hold for a
  // value that was never in the workspace those projections were built from.
  const serializedWorkspace = JSON.stringify(workspace);
  nouns.forEach((noun) => {
    assert.equal(serializedWorkspace.includes(sentinels[noun]), true, `NFR-001 the ${noun} sentinel must genuinely be in the local workspace, or its absence from the public projections is asserted about nothing`);
  });

  const localStorage = createStorage({ initial: { [GENERIC_CACHE_KEY]: 'generic-public-cache' } });
  const sessionStorage = createStorage();
  const store = api.createPortfolioStore({ localStorage, sessionStorage }, policy);
  const opened = store.openWorkspace(NOW);
  assert.equal(opened.ok, true);
  const committed = store.commitWorkspace({ ...workspace, generation: opened.value.workspace.generation }, opened.value.workspace.generation, NOW);
  assert.equal(committed.ok, true, `NFR-001 the local workspace must commit: ${JSON.stringify(committed.error || {})}`);

  // "stays local" has a positive half that an absence sweep alone never establishes: the bytes
  // must genuinely be IN the declared local namespace. A module that simply stored nothing
  // would satisfy every absence claim below.
  const localBytes = Object.values(localStorage.snapshot()).concat(Object.values(sessionStorage.snapshot())).join('');
  nouns.forEach((noun) => {
    assert.equal(localBytes.includes(sentinels[noun]), true, `NFR-001 the ${noun} sentinel must be found inside the declared local storage namespace, because "stays local" is a claim about where it IS as well as where it is not`);
  });

  // The projections the module emits that are shareable, published, or read by a surface
  // outside the owner's own workspace view. The local route projection is deliberately NOT
  // here: it legitimately carries the mandate cash need, and it serves as the control below.
  const preview = api.exportPreview({ portfolio: workspace.portfolioRevisions[0] });
  const inventory = api.privacyInventory(workspace, { localStorage, sessionStorage }, policy);
  const foundationInventory = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(preview.ok, true, `NFR-001 the export preview must build: ${JSON.stringify(preview.error || {})}`);
  assert.equal(inventory.ok, true, `NFR-001 the privacy inventory must build: ${JSON.stringify(inventory.error || {})}`);
  assert.equal(foundationInventory.ok, true, `NFR-001 the foundation privacy inventory must build: ${JSON.stringify(foundationInventory.error || {})}`);

  // A legacy shape is quarantined with metadata rather than migrated, and the quarantine
  // record is itself a surface a support flow can be asked to hand over. The legacy slot is
  // seeded with every sentinel so its omission from the quarantine record is a real omission.
  const legacySlot = JSON.stringify({ contractVersion: 'portfolio-workspace/v0', generation: 2, ...Object.fromEntries(nouns.map((noun, index) => [`legacyField${index}`, sentinels[noun]])) });
  const legacyPointer = JSON.stringify({ contractVersion: 'portfolio-workspace-pointer/v1', activeSlot: 'slotA', generation: 2, semanticFingerprint: `sha256:${'3'.repeat(64)}`, contentSha256: `sha256:${'4'.repeat(64)}` });
  const legacyStorage = createStorage({ initial: { [policy.storage.pointerKey]: legacyPointer, [policy.storage.slotKeys[0]]: legacySlot } });
  const legacyOpen = api.createPortfolioStore({ localStorage: legacyStorage, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(legacyOpen.ok, false, 'NFR-001 an unknown legacy shape must refuse migration, or no quarantine record is produced to sweep');
  const quarantineRecord = legacyStorage.getItem(policy.storage.quarantineKey);
  assert.equal(typeof quarantineRecord, 'string', 'NFR-001 the quarantine record must exist, or the claims about it hold for nothing');
  nouns.forEach((noun) => {
    assert.equal(legacyStorage.getItem(policy.storage.slotKeys[0]).includes(sentinels[noun]), true, `NFR-001 the ${noun} sentinel must still be in the untouched legacy slot, so its absence from the quarantine record is an omission rather than a value that was never there`);
  });

  const publicSurfaces = Object.freeze({
    'export preview': JSON.stringify(preview.value),
    'privacy inventory': JSON.stringify(inventory.value),
    'foundation privacy inventory': JSON.stringify(foundationInventory.value),
    'quarantine record': quarantineRecord,
    'generic public cache': localStorage.getItem(GENERIC_CACHE_KEY)
  });
  const surfaceNames = Object.keys(publicSurfaces);
  assert.equal(surfaceNames.length, 5, 'NFR-001 every public projection this scope emits must be swept, not a subset of them');

  let swept = 0;
  surfaceNames.forEach((surface) => {
    assert.equal(typeof publicSurfaces[surface], 'string', `NFR-001 the ${surface} surface must have produced bytes to search, or its per-noun claims are made against nothing`);
    assert.equal(publicSurfaces[surface].length > 0, true, `NFR-001 the ${surface} surface must be non-empty, or an absence in it is an artefact of an empty string`);
    nouns.forEach((noun) => {
      assert.equal(publicSurfaces[surface].includes(sentinels[noun]), false, `NFR-001 the ${noun} sentinel must not reach the ${surface}, because personal state stays local and absent from public surfaces`);
      swept += 1;
    });
  });
  assert.equal(swept, surfaceNames.length * nouns.length, 'NFR-001 every surface and noun pair must have been swept, not merely iterated over');

  // Detectability controls. Each runs the SAME `includes` predicate against a local-only
  // surface that legitimately carries the sentinel, so "not found" above is a property of the
  // public surfaces rather than of a value this test cannot see anywhere.
  const privateExport = api.exportPrivate({ portfolio: workspace.portfolioRevisions[0] });
  assert.equal(privateExport.ok, true, `NFR-001 the private export must build: ${JSON.stringify(privateExport.error || {})}`);
  [['portfolio', PLAIN_HOLDING_LABEL], ['quantities', LOCAL_ONLY_QUANTITY], ['cost basis', LOCAL_ONLY_COST_BASIS]].forEach(([noun, sentinel]) => {
    assert.equal(privateExport.value.text.includes(sentinel), true, `NFR-001 control: the ${noun} sentinel must be found by the same search in the owner's own private export, so its absence from the public surfaces is a real omission`);
  });
  const routeProjection = api.projectRouteStates(workspace, policy);
  assert.equal(routeProjection.ok, true, `NFR-001 the local route projection must build: ${JSON.stringify(routeProjection.error || {})}`);
  assert.equal(
    JSON.stringify(routeProjection.value).includes(CASH_NEED_DATE),
    true,
    'NFR-001 control: the cash-need sentinel must be found by the same search in the local route projection, which legitimately carries it, so its absence from the public surfaces is selective rather than universal'
  );

  // Red-ability. The absence predicate is run against bytes that provably carry the sentinel
  // and is required to throw, so a predicate that could never fail is caught here.
  assert.throws(
    () => assert.equal(privateExport.value.text.includes(LOCAL_ONLY_QUANTITY), false),
    undefined,
    'NFR-001 control: the absence predicate must reject a surface that genuinely carries a personal value'
  );
  assert.throws(
    () => assert.equal(JSON.stringify(routeProjection.value).includes(CASH_NEED_DATE), false),
    undefined,
    'NFR-001 control: the absence predicate must reject a projection that genuinely carries a cash need'
  );
});

// The three metric families NFR-004 names, each mapped onto the declared excluded sources
// that carry it. The mapping is asserted against the policy rather than trusted, so a family
// whose tokens were dropped from the policy is caught by name instead of silently thinning
// the sweep.
const NFR004_ENGAGEMENT_FAMILIES = Object.freeze({
  click: Object.freeze(['clickcount', 'scroll']),
  dwell: Object.freeze(['dwell']),
  retention: Object.freeze(['returnfrequency', 'opencount', 'notificationopen'])
});

test('NFR-004: no declared ranking input is an engagement metric, every click dwell and retention source is refused by name on the path that grows ranking evidence, and a research completion is still admitted and still counted', () => {
  const { api, policy } = loadContracts();
  const storageAdapters = { localStorage: createStorage(), sessionStorage: createStorage() };
  const workspace = portfolioAndMandateWorkspace(api, policy);
  const workspaceBefore = JSON.stringify(workspace);

  // Selectivity control, run FIRST and carried all the way to the ranking evidence. A guard
  // that refused every draft would be red here, and a guard that accepted the draft but never
  // let it reach the counted evidence would be red on the count.
  const admitted = api.buildBehaviorCandidate(behaviorDraft(), workspace, { now: NOW }, policy);
  assert.equal(admitted.ok, true, `NFR-004 control: a documented research completion must still be admitted: ${JSON.stringify(admitted.error || {})}`);
  assert.equal(admitted.value.accepted, true, 'NFR-004 control: the research completion must genuinely be recorded, or "the refusal is selective" rests on nothing');
  assert.equal(admitted.value.workspace.behaviorEvents.length, workspace.behaviorEvents.length + 1, 'NFR-004 control: task-utility evidence must actually grow, so ranking has something research-relevant to read');
  const admittedInventory = api.privacyInventory(admitted.value.workspace, storageAdapters, policy);
  assert.equal(admittedInventory.value.eventCategoryCounts[behaviorDraft().category], 1, 'NFR-004 control: the admitted completion must be counted under its research category, so acceptance reaches the ranking evidence rather than stopping at the builder');

  // Second selectivity control: a harmless undeclared field is refused as UNKNOWN, so
  // `forbidden-behavior-source` below is a real classification and not the only rejection.
  const benign = api.buildBehaviorCandidate({ ...behaviorDraft(), [BENIGN_EXTRA_FIELD]: 'inert' }, workspace, { now: NOW }, policy);
  assert.equal(benign.ok, false, 'NFR-004 control: an undeclared draft field must not be accepted');
  assert.equal(benign.error.reason, 'unknown-field', 'NFR-004 control: a harmless undeclared field must be refused as unknown, so an engagement refusal is a distinct finding');

  // The objective itself. The ranking inputs are derived from the policy by numeric-ness, not
  // read from a frozen list here, so a click-based or dwell-based input added to the behavior
  // policy later enters this set and is caught without editing this test.
  const declaredRankingInputs = Object.keys(policy.behavior).filter((name) => Number.isFinite(policy.behavior[name]));
  assert.equal(declaredRankingInputs.length > 0, true, 'NFR-004 an empty ranking-input set would make the objective claim below vacuous');
  const forbiddenTokens = policy.behavior.forbiddenEventFields;
  assert.equal(forbiddenTokens.length > 0, true, 'NFR-004 an empty excluded-source list would make the objective claim below vacuous');
  const engagementRankingInputs = declaredRankingInputs.filter((name) => forbiddenTokens.some((token) => normalizedFieldToken(name).includes(token)));
  assert.deepEqual(engagementRankingInputs, [], 'NFR-004 no value that scores or decays behavior evidence may be an engagement metric, because ranking is evaluated for research relevance and task utility');

  // Red-ability for the objective claim: the same derivation run over a policy clone that DOES
  // declare a dwell-scored input must find it. Without this the empty intersection could be a
  // property of the derivation rather than of the policy.
  const engagementPolicy = { ...policy, behavior: { ...policy.behavior, dwellWeightDays: 3 } };
  const clonedRankingInputs = Object.keys(engagementPolicy.behavior).filter((name) => Number.isFinite(engagementPolicy.behavior[name]));
  assert.throws(
    () => assert.deepEqual(clonedRankingInputs.filter((name) => forbiddenTokens.some((token) => normalizedFieldToken(name).includes(token))), []),
    undefined,
    'NFR-004 control: the objective claim must reject a policy that declares an engagement-scored ranking input'
  );

  // Every family the id names, refused by name on the path that grows the ranking evidence.
  const families = Object.keys(NFR004_ENGAGEMENT_FAMILIES);
  assert.equal(families.length, 3, 'NFR-004 click dwell and retention must each be exercised, not merely named');
  let attempted = 0;
  families.forEach((family) => {
    const tokens = NFR004_ENGAGEMENT_FAMILIES[family];
    assert.equal(tokens.length > 0, true, `NFR-004 the ${family} family must name at least one source, or its claims are vacuous`);
    tokens.forEach((token) => {
      assert.equal(forbiddenTokens.includes(token), true, `NFR-004 the ${family} source ${token} must be declared excluded in the policy a reader can open, not only rejected by code`);
      const attempt = api.buildBehaviorCandidate({ ...behaviorDraft(), [token]: 'attempted' }, workspace, { now: NOW }, policy);
      assert.equal(attempt.ok, false, `NFR-004 a draft carrying the ${family} metric ${token} must not become ranking evidence`);
      assert.equal(attempt.error.reason, 'forbidden-behavior-source', `NFR-004 ${token} must be refused as an excluded behavior source, so ranking cannot be optimized for ${family}`);
      assert.equal(attempt.error.field, `draft.${token}`, `NFR-004 the refusal must name draft.${token} exactly, so the surface can say which engagement source was excluded`);
      assert.equal(attempt.value, undefined, `NFR-004 a ${token} attempt must yield no workspace, so no part of it can reach the evidence ranking reads`);
      attempted += 1;
    });
  });
  assert.equal(attempted, Object.values(NFR004_ENGAGEMENT_FAMILIES).reduce((sum, tokens) => sum + tokens.length, 0), 'NFR-004 every named engagement source must have been attempted, not merely iterated over');

  // What survives admission carries no engagement metric either. A field admitted onto the
  // stored event would be readable by ranking regardless of what the draft guard refused.
  const storedEvent = admitted.value.workspace.behaviorEvents[admitted.value.workspace.behaviorEvents.length - 1];
  const storedFields = Object.keys(storedEvent);
  assert.equal(storedFields.length > 0, true, 'NFR-004 the stored event must carry fields, or the sweep below runs over nothing');
  storedFields.forEach((field) => {
    assert.equal(
      forbiddenTokens.some((token) => normalizedFieldToken(field).includes(token)),
      false,
      `NFR-004 the retained event field ${field} must not be an engagement metric, because ranking reads the stored event rather than the refused draft`
    );
  });

  // Red-ability for the refusal claim: the same predicate run against the ACCEPTED candidate
  // must throw, so `ok: false` is caused by the engagement metric and is not a constant.
  assert.throws(
    () => assert.equal(admitted.ok, false),
    undefined,
    'NFR-004 control: the refusal predicate must reject a research completion that was correctly admitted'
  );
  assert.equal(JSON.stringify(workspace), workspaceBefore, 'NFR-004 no refused engagement attempt may mutate the workspace it was offered against');
});

// A storage adapter that ACCEPTS a write and stores nothing. This is the shape a quota-pressed
// or restricted browser store presents when it swallows rather than throws, and it is the only
// adapter that can tell a SURFACED persistence failure from a swallowed one: after a swallow
// and after a correct refusal the store holds exactly the same bytes, so no assertion about
// store state can separate them. It wraps the shared adapter so everything else is unchanged.
function silentlyDroppingStorage(shouldDrop) {
  const inner = createStorage();
  return {
    clear: () => inner.clear(),
    getItem: (key) => inner.getItem(key),
    key: (index) => inner.key(index),
    get length() { return inner.length; },
    removeItem: (key) => inner.removeItem(key),
    setItem: (key, value) => { if (shouldDrop(String(key))) return; inner.setItem(key, value); },
    snapshot: () => inner.snapshot(),
    writes: () => inner.writes()
  };
}

test('NFR-008: a throwing store and a silently dropping store both surface an explicit write failure with no success state, capability loss is reported in words, and the same commit still succeeds unfaulted', () => {
  const { api, policy } = loadContracts();
  const draft = validDraft(api, policy);

  // Control, run FIRST: the surface can say success, and says it only with the durability
  // facts attached. Without this arm every `ok: false` below could be a constant.
  const cleanLocal = createStorage();
  const cleanStore = api.createPortfolioStore({ localStorage: cleanLocal, sessionStorage: createStorage() }, policy);
  const cleanOpen = cleanStore.openWorkspace(NOW);
  const cleanCandidate = api.buildWorkspaceCandidate(draft, cleanOpen.value.workspace, { name: 'Resilience control', now: NOW }, policy);
  const cleanCommit = cleanStore.commitWorkspace(cleanCandidate.value, cleanOpen.value.workspace.generation, NOW);
  assert.equal(cleanCommit.ok, true, `NFR-008 control: an unfaulted commit must succeed: ${JSON.stringify(cleanCommit.error || {})}`);
  assert.equal(cleanCommit.value.storageState.savedDurably, true, 'NFR-008 control: a save that did land must say so');
  assert.equal(cleanCommit.value.storageState.lastVerifiedWrite, true, 'NFR-008 control: a save that did land must report a verified write');
  assert.equal(cleanLocal.getItem(policy.storage.pointerKey) !== null, true, 'NFR-008 control: the unfaulted commit must genuinely have published a pointer, so the success state is backed by bytes');

  // Arm 1: the store throws. The failure must be surfaced as an explicit error with NO success
  // state at all, because a partial success state is exactly a claim that the save worked.
  const throwingLocal = createStorage();
  const throwingStore = api.createPortfolioStore({ localStorage: throwingLocal, sessionStorage: createStorage() }, policy);
  const throwingOpen = throwingStore.openWorkspace(NOW);
  const throwingCandidate = api.buildWorkspaceCandidate(draft, throwingOpen.value.workspace, { name: 'Throwing store', now: NOW }, policy);
  throwingLocal.failSet(policy.storage.slotKeys[0]);
  const threw = throwingStore.commitWorkspace(throwingCandidate.value, throwingOpen.value.workspace.generation, NOW);
  assert.equal(threw.ok, false, 'NFR-008 a store that rejected the write must not be reported as a completed local save');
  assert.equal(threw.error.code, 'P008-STORE-WRITE', 'NFR-008 the persistence failure must be surfaced under its own write-failure code, not folded into a generic result');
  assert.equal(threw.error.valueEchoed, false, 'NFR-008 the visible failure must stay value-safe');
  assert.equal(Object.prototype.hasOwnProperty.call(threw, 'value'), false, 'NFR-008 a failed save must emit no success state at all, because a success state is the claim the id forbids');

  // Arm 2: the store SWALLOWS. It accepts the write, reports nothing, and stores nothing --
  // leaving byte-for-byte the same store state as arm 1. Only the returned signal separates a
  // surfaced failure from a swallowed one, so this arm is asserted on the signal.
  const droppedSlots = new Set(policy.storage.slotKeys);
  const silentLocal = silentlyDroppingStorage((key) => droppedSlots.has(key));
  const silentStore = api.createPortfolioStore({ localStorage: silentLocal, sessionStorage: createStorage() }, policy);
  const silentOpen = silentStore.openWorkspace(NOW);
  assert.equal(silentOpen.value.storageState.mode, 'durable', 'NFR-008 the dropping store must present as durable at open, or the commit below is refused for the wrong reason');
  const silentCandidate = api.buildWorkspaceCandidate(draft, silentOpen.value.workspace, { name: 'Silently dropping store', now: NOW }, policy);
  const swallowed = silentStore.commitWorkspace(silentCandidate.value, silentOpen.value.workspace.generation, NOW);
  assert.equal(swallowed.ok, false, 'NFR-008 a store that accepted the write and kept nothing must still surface a failure, because the product cannot claim a local save succeeded when it did not');
  assert.equal(swallowed.error.code, 'P008-STORE-WRITE', 'NFR-008 a swallowed write must be surfaced under the same explicit write-failure code as a rejected one');
  assert.equal(swallowed.error.reason, 'slot-verification-failed', 'NFR-008 the swallowed write must be caught by reading the bytes back, which is the only way a silent drop becomes visible');
  assert.equal(Object.prototype.hasOwnProperty.call(swallowed, 'value'), false, 'NFR-008 a swallowed save must emit no success state either');
  assert.deepEqual(Object.keys(silentLocal.snapshot()), [], 'NFR-008 the dropping store genuinely kept nothing, so the failure above was surfaced from a store state that is indistinguishable from a swallow');
  assert.equal(silentLocal.getItem(policy.storage.pointerKey), null, 'NFR-008 no pointer may be published over a slot whose bytes never landed');

  // Arm 3: quota and capability pressure is visible in words, not only in a flag.
  const blockedDurable = createStorage({ failSet: [`${policy.storage.workspaceNamespace}.probe`] });
  const degraded = api.createPortfolioStore({ localStorage: blockedDurable, sessionStorage: createStorage() }, policy).openWorkspace(NOW);
  assert.equal(degraded.ok, true, 'NFR-008 a store that cannot persist durably must still open, or the visible-degradation claim never runs');
  assert.equal(degraded.value.storageState.durable, false, 'NFR-008 lost durability must be reported rather than assumed');
  assert.equal(degraded.value.storageState.savedDurably, false, 'NFR-008 a session-only store must not claim a durable save');
  assert.equal(typeof degraded.value.storageState.warning === 'string' && degraded.value.storageState.warning.length > 0, true, 'NFR-008 quota or capability pressure must be visible as a message the owner can read, not only as a boolean');
  assert.notEqual(degraded.value.storageState.warning, cleanOpen.value.storageState.warning, 'NFR-008 the warning must be caused by the degradation, so an unfaulted open must not carry the same warning');
  assert.equal(cleanOpen.value.storageState.durable, true, 'NFR-008 control: the unfaulted open must report durability, so `durable: false` above is a real signal');

  // Red-ability. A facade that converts the surfaced refusal into a reported success is the
  // exact defect the id forbids; the arm-2 predicate must reject it. This is applied to the
  // module's own faulted result in memory, so nothing on disk is changed to prove it.
  const swallowingFacade = swallowed.ok ? swallowed : { ok: true, value: { storageState: { ...cleanCommit.value.storageState } } };
  assert.throws(
    () => assert.equal(swallowingFacade.ok, false),
    undefined,
    'NFR-008 control: the surfaced-failure predicate must reject a layer that turns a failed save into a reported success'
  );
  assert.throws(
    () => assert.equal(Object.prototype.hasOwnProperty.call(swallowingFacade, 'value'), false),
    undefined,
    'NFR-008 control: the no-success-state predicate must reject a layer that attaches a durable-looking success state to a failed save'
  );
});

test('NFR-019: every declared credential field name and credential value shape is rejected without echoing the value, markup does not smuggle a credential past the guard, and an ordinary provider label is still imported', () => {
  const { api, policy } = loadContracts();
  const sentinel = `NFR019-RUNTIME-PRIVATE-${Date.now()}`;

  // Selectivity control, run FIRST: an ordinary provider label imports and is confirmable, so
  // an importer that refused everything would be red before a single credential is offered.
  const ordinary = api.validateImport('csv', localOnlyCsv('an ordinary provider label'), null, policy);
  assert.equal(ordinary.ok, true, `NFR-019 control: an ordinary import must parse: ${JSON.stringify(ordinary.error || {})}`);
  assert.equal(ordinary.value.canConfirm, true, 'NFR-019 control: an ordinary import must be confirmable, or every rejection below is a blanket refusal');
  assert.equal(ordinary.value.holdings.length > 0, true, 'NFR-019 control: an ordinary import must yield holdings, so a rejected draft is a real difference');
  assert.equal(ordinary.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET'), false, 'NFR-019 control: an ordinary import must raise no credential finding, so the credential code is a real classification');

  // Every declared credential FIELD NAME. The list is read from the policy, so a token dropped
  // from the declared surface thins this sweep by name rather than silently.
  const fieldTokens = policy.import.secretFieldTokens;
  assert.equal(fieldTokens.length > 0, true, 'NFR-019 an empty credential-token list would make the per-token claims vacuous');
  let rejectedNames = 0;
  fieldTokens.forEach((token) => {
    const bytes = `symbol,assetType,currency,quantity,price,${token}\nMSFT,listed,USD,10,450.25,${sentinel}\n`;
    const result = api.validateImport('csv', bytes, null, policy);
    assert.equal(result.ok, true, `NFR-019 a column named ${token} must be handled as untrusted data rather than crashing the import`);
    assert.equal(result.value.canConfirm, false, `NFR-019 a draft carrying the credential-shaped column ${token} must not be confirmable`);
    assert.equal(result.value.holdings.length, 0, `NFR-019 a credential-shaped column ${token} must reject the whole draft, so no row of it can be committed`);
    const finding = result.value.errors.find((error) => error.code === 'P008-IMPORT-SECRET');
    assert.notEqual(finding, undefined, `NFR-019 ${token} must be reported as a credential finding, not incidentally as an unknown column`);
    assert.equal(finding.reason, 'secret-shaped-field', `NFR-019 ${token} must be refused for its credential-shaped NAME`);
    assert.equal(finding.valueEchoed, false, `NFR-019 the ${token} refusal must not echo the value it refused, because imported text is untrusted data`);
    assert.equal(JSON.stringify(result).includes(sentinel), false, `NFR-019 the value under ${token} must appear nowhere in the result, not even in a diagnostic`);
    rejectedNames += 1;
  });
  assert.equal(rejectedNames, fieldTokens.length, 'NFR-019 every declared credential field name must have been attempted, not merely listed');

  // Every declared credential VALUE SHAPE, offered in an ordinary column. The name guard
  // cannot catch these, so without this arm a pasted bearer token in a label column passes.
  const valuePrefixes = policy.import.secretValuePrefixes;
  assert.equal(valuePrefixes.length > 0, true, 'NFR-019 an empty credential-prefix list would make the per-prefix claims vacuous');
  let rejectedValues = 0;
  valuePrefixes.forEach((prefix) => {
    const credential = `${prefix}${sentinel}`;
    assert.equal(credential.length >= policy.import.secretValueMinimumLength, true, `NFR-019 the ${prefix} probe must reach the declared credential length, or it is refused for being short rather than for being a credential`);
    const result = api.validateImport('csv', localOnlyCsv(credential), null, policy);
    assert.equal(result.ok, true, `NFR-019 a ${prefix} value must be handled as untrusted data rather than crashing the import`);
    assert.equal(result.value.canConfirm, false, `NFR-019 a draft carrying a ${prefix} credential value must not be confirmable`);
    const finding = result.value.errors.find((error) => error.code === 'P008-IMPORT-SECRET');
    assert.notEqual(finding, undefined, `NFR-019 a ${prefix} value must be reported as a credential finding even in an ordinary column`);
    assert.equal(finding.reason, 'secret-shaped-value', `NFR-019 a ${prefix} value must be refused for its credential-shaped VALUE, which the field-name guard cannot see`);
    assert.equal(finding.valueEchoed, false, `NFR-019 the ${prefix} refusal must not echo the credential it refused`);
    assert.equal(JSON.stringify(result).includes(sentinel), false, `NFR-019 a ${prefix} credential must appear nowhere in the result`);
    rejectedValues += 1;
  });
  assert.equal(rejectedValues, valuePrefixes.length, 'NFR-019 every declared credential value shape must have been attempted, not merely listed');

  // The two guards compose. Executable markup carried in a credential-shaped column is still a
  // credential finding, so markup cannot be used to dress a credential past the name guard;
  // and the same markup in an ordinary label raises no credential finding, so the two
  // classifications stay distinct instead of collapsing into one blanket rejection.
  const markupCredential = api.validateImport('csv', `symbol,assetType,currency,quantity,price,${fieldTokens[0]}\nMSFT,listed,USD,10,450.25,${INERT_MARKUP_LABEL}\n`, null, policy);
  assert.equal(markupCredential.value.canConfirm, false, 'NFR-019 markup in a credential-shaped column must not be confirmable');
  assert.equal(
    markupCredential.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET' && error.reason === 'secret-shaped-field'),
    true,
    'NFR-019 markup must not smuggle a credential-shaped column past the guard'
  );
  const markupLabel = api.validateImport('csv', localOnlyCsv(INERT_MARKUP_LABEL), null, policy);
  assert.equal(markupLabel.value.canConfirm, true, 'NFR-019 markup in an ordinary label is untrusted DATA and must not be rejected as a credential');
  assert.equal(
    markupLabel.value.errors.some((error) => error.code === 'P008-IMPORT-SECRET'),
    false,
    'NFR-019 markup in an ordinary label must raise no credential finding, so the credential classification is selective'
  );

  // A refusal that is handed the raw value is itself a leak, so the error contract must refuse
  // to carry one.
  const firstFinding = api.validateImport('csv', `symbol,assetType,currency,quantity,price,${fieldTokens[0]}\nMSFT,listed,USD,10,450.25,${sentinel}\n`, null, policy).value.errors[0];
  assert.equal(api.validatePortfolioError({ ...firstFinding, rawValue: sentinel }).error.reason, 'unknown-field', 'NFR-019 a credential finding must not be able to carry the raw value it refused');

  // Red-ability: the rejection predicate run against the ordinary import must throw.
  assert.throws(
    () => assert.equal(ordinary.value.canConfirm, false),
    undefined,
    'NFR-019 control: the credential-rejection predicate must reject an ordinary import that was correctly accepted'
  );
});

test('NFR-023: a recommendation route cites the exact revision identity it used or names why it cannot, and a clear reports a per-category change that matches the inspected before and after inventory', () => {
  const { api, policy } = loadContracts();
  const storageAdapters = { localStorage: createStorage(), sessionStorage: createStorage() };

  // Traceable recommendation. The projection must cite the exact revision it read, and the
  // citation must track the workspace rather than be a constant, so a second mandate that
  // differs only in its declared objective is projected and required to cite differently. The
  // variant is built by mutating the fixture in memory, so the difference is an input change.
  const explicit = portfolioAndMandateWorkspace(api, policy);
  const restatedFixture = { ...mandateFixture('mandate-explicit.json'), objectiveLabel: 'Fund a dated withdrawal without forced selling and hold a named reserve' };
  const restatedDraft = api.validateMandateDraft(restatedFixture, api.createEmptyWorkspace(policy, LATER).value, { now: LATER }, policy);
  assert.equal(restatedDraft.ok, true, `NFR-023 the restated mandate draft must validate: ${JSON.stringify(restatedDraft.error || {})}`);
  const restated = api.buildMandateCandidate(restatedDraft.value, explicit, { now: LATER }, policy);
  assert.equal(restated.ok, true, `NFR-023 a second mandate must build, or the citation cannot be shown to track the revision: ${JSON.stringify(restated.error || {})}`);
  assert.notEqual(restated.value.currentMandateId, explicit.currentMandateId, 'NFR-023 the two workspaces must carry different mandate revisions, or an identical citation proves nothing');

  const explicitProjection = api.projectRouteStates(explicit, policy);
  const restatedProjection = api.projectRouteStates(restated.value, policy);
  assert.equal(explicitProjection.ok, true, `NFR-023 the route projection must build: ${JSON.stringify(explicitProjection.error || {})}`);
  assert.equal(restatedProjection.ok, true, `NFR-023 the second route projection must build: ${JSON.stringify(restatedProjection.error || {})}`);
  assert.equal(explicitProjection.value.routes.length > 0, true, 'NFR-023 an empty route list would make the per-route citation claims vacuous');
  explicitProjection.value.routes.forEach((route) => {
    assert.equal(route.descriptive.citedPortfolioId, explicit.currentPortfolioId, `NFR-023 the ${route.route} route must cite the exact portfolio revision it was computed from`);
    route.mandateDependent.forEach((entry) => {
      assert.equal(entry.citedMandateId, explicit.currentMandateId, `NFR-023 the ${route.route} ${entry.state} state must cite the exact mandate revision it was computed from`);
      assert.equal(entry.reason, null, `NFR-023 an available ${entry.state} state must carry no absence reason, so a reason is a real finding`);
    });
  });
  assert.notEqual(
    restatedProjection.value.currentMandateId,
    explicitProjection.value.currentMandateId,
    'NFR-023 the citation must change when the mandate changes, so it traces the revision that was actually read rather than naming a constant'
  );

  // The other half of the traceability the id allows: exact event categories, reported over
  // the full declared vocabulary rather than only the ones that happen to be populated.
  const first = appendEvent(api, policy, explicit, {});
  const populated = appendEvent(api, policy, first.value.workspace, { subjectId: SUBJECT_BETA }, NEXT_DAY).value.workspace;
  const before = api.privacyInventory(populated, storageAdapters, policy);
  assert.equal(before.ok, true);
  assert.deepEqual(Object.keys(before.value.eventCategoryCounts).sort(), [...policy.behavior.eventCategories].sort(), 'NFR-023 every declared event category must be traceable, including the ones currently at zero');

  // Traceable clearing: what the clear reports must match what an independent before-and-after
  // inspection of the inventory shows, category by category.
  const cleared = api.buildBehaviorClearCandidate(populated, LATER, policy);
  assert.equal(cleared.ok, true, `NFR-023 the clear must build: ${JSON.stringify(cleared.error || {})}`);
  const after = api.privacyInventory(cleared.value.workspace, storageAdapters, policy);
  assert.equal(after.ok, true);
  const countsByCategory = (inventory) => Object.fromEntries(inventory.value.categories.map((entry) => [entry.category, entry.recordCount]));
  const beforeCounts = countsByCategory(before);
  const afterCounts = countsByCategory(after);
  const observedDelta = Object.fromEntries(Object.keys(beforeCounts).map((category) => [category, beforeCounts[category] - afterCounts[category]]));
  assert.equal(Object.keys(observedDelta).length, before.value.categories.length, 'NFR-023 the inspected change must cover every reported category, so a category that changed silently is caught');
  assert.equal(observedDelta['behavior-events'], cleared.value.clearedEventCount, 'NFR-023 the count the clear reports must equal the change an owner can independently inspect in the inventory');
  assert.equal(observedDelta['behavior-events'] > 0, true, 'NFR-023 the inspected change must be non-zero, or the match above holds for a clear that did nothing');
  assert.equal(observedDelta['interest-signals'], cleared.value.clearedInterestCount, 'NFR-023 the derived-interest change must be reported as its own number rather than folded into the event count');
  assert.equal(cleared.value.preservedPortfolioId, populated.currentPortfolioId, 'NFR-023 a clear must name what it preserved, not only what it removed');
  assert.equal(cleared.value.preservedMandateId, populated.currentMandateId, 'NFR-023 a clear must name the mandate it preserved');
  Object.keys(observedDelta).filter((category) => !['behavior-events', 'interest-signals'].includes(category)).forEach((category) => {
    assert.equal(observedDelta[category], 0, `NFR-023 the ${category} category must be unchanged by a behavior clear, so the reported scope of the change is the real scope`);
  });

  // Control: a clear over a workspace with no behavior evidence reports zero and moves nothing,
  // so the reported number tracks reality rather than being a constant.
  const emptyCleared = api.buildBehaviorClearCandidate(explicit, LATER, policy);
  assert.equal(emptyCleared.ok, true);
  assert.equal(emptyCleared.value.clearedEventCount, 0, 'NFR-023 control: a clear with nothing to remove must report zero');

  // Red-ability: a report that mis-states the change by one must fail the match above.
  const misreported = { ...cleared.value, clearedEventCount: cleared.value.clearedEventCount + 1 };
  assert.throws(
    () => assert.equal(observedDelta['behavior-events'], misreported.clearedEventCount),
    undefined,
    'NFR-023 control: the traceability match must reject a clear whose reported change does not match the inspected change'
  );
});

test('NFR-024: local deletion is certified only after an independent reread proves emptiness, a survivor or an unreadable key blocks the success state, and the raw namespace confirms it without trusting the report', () => {
  const { api, policy } = loadContracts();
  const declared = policyDeclaredKeys(policy);
  const declaredCount = declared.local.length + declared.session.length;
  const seedLocal = () => createStorage({ initial: Object.fromEntries(declared.local.map((key, index) => [key, `local-record-${index}`])) });
  const seedSession = () => createStorage({ initial: Object.fromEntries(declared.session.map((key, index) => [key, `session-record-${index}`])) });

  // Populate and prove, so every emptiness claim below is a deletion rather than a starting state.
  const localStorage = seedLocal();
  const sessionStorage = seedSession();
  assert.equal(api.foundationPrivacyInventory({ localStorage, sessionStorage }).value.personalKeyCount, declaredCount, 'NFR-024 the clear must start from storage that provably holds every declared personal key');

  const cleared = api.clearFoundationStorage({ localStorage, sessionStorage });
  assert.equal(cleared.ok, true, `NFR-024 a complete deletion must be certifiable: ${JSON.stringify(cleared.error || {})}`);
  assert.equal(cleared.value.verifiedEmpty, true, 'NFR-024 the deletion must be reported as verified, not merely as requested');
  assert.deepEqual(cleared.value.remainingPersonalKeys, [], 'NFR-024 a verified deletion must name no survivor');

  // The verification that matters is the one that does NOT come from the module's own report.
  // An exact empty-set comparison on the raw adapters catches a survivor under the same prefix
  // that a prefix or count check would admit.
  assert.deepEqual(Object.keys(localStorage.snapshot()), [], 'NFR-024 the raw local namespace must be empty when read directly, without trusting the clear to report on itself');
  assert.deepEqual(Object.keys(sessionStorage.snapshot()), [], 'NFR-024 the raw session namespace must be empty when read directly');
  const reread = api.foundationPrivacyInventory({ localStorage, sessionStorage });
  assert.equal(reread.value.personalKeyCount, 0, 'NFR-024 an independent reread must observe zero personal keys, which is what makes the deletion verified rather than requested');
  assert.deepEqual(reread.value.presentKeys, [], 'NFR-024 the reread must name no remaining personal key');

  // Requested is not verified, arm 1: one key survives deletion. The request was issued for
  // every key, so a module that certified on the strength of having asked would pass here.
  const survivorLocal = seedLocal();
  const survivorSession = seedSession();
  survivorLocal.failRemove(declared.local[0]);
  const incomplete = api.clearFoundationStorage({ localStorage: survivorLocal, sessionStorage: survivorSession });
  assert.equal(incomplete.ok, false, 'NFR-024 a key that survived deletion must block the success state, because clearing is confirmed rather than attempted');
  assert.equal(incomplete.error.reason, 'foundation-clear-incomplete', 'NFR-024 an incomplete deletion must be refused under its own reason');
  assert.equal(Object.prototype.hasOwnProperty.call(incomplete, 'value'), false, 'NFR-024 an incomplete deletion must emit no success state at all');
  assert.equal(survivorLocal.getItem(declared.local[0]), `local-record-0`, 'NFR-024 the injected fault genuinely blocked one deletion, so the refusal is about a real survivor');

  // Requested is not verified, arm 2: the key can be removed but cannot be reread. Nothing can
  // be certified complete that cannot be observed, so this must refuse even though the
  // deletion itself was never rejected.
  const unreadableLocal = seedLocal();
  unreadableLocal.failGet(declared.local[1]);
  const unverifiable = api.clearFoundationStorage({ localStorage: unreadableLocal, sessionStorage: seedSession() });
  assert.equal(unverifiable.ok, false, 'NFR-024 a key that cannot be reread cannot be certified deleted, because verification is the evidence the id requires');
  assert.equal(unverifiable.error.reason, 'foundation-clear-incomplete', 'NFR-024 an unverifiable deletion must be refused under the same incomplete reason');

  // Local, not remote. The clear is a synchronous total function of the two in-memory adapters,
  // which carry no network capability at all, so nothing here can be pending on a remote
  // deletion request.
  assert.equal(typeof cleared.then, 'undefined', 'NFR-024 the clear must settle synchronously, so no remote deletion round-trip can be outstanding when it certifies');
  assert.equal(typeof incomplete.then, 'undefined', 'NFR-024 the refusal must settle synchronously too');

  // Red-ability. A module that reported a verified deletion while a key survived is the exact
  // defect the id forbids: the self-report arm accepts the lie, and the raw-namespace arm is
  // the one that catches it. Both are shown here against the module's own faulted state.
  const lyingReport = { ok: true, value: { verifiedEmpty: true, remainingPersonalKeys: [] } };
  assert.equal(lyingReport.value.verifiedEmpty, true, 'NFR-024 control: a self-report can claim a verified deletion that did not happen, which is why the raw namespace is read directly');
  assert.throws(
    () => assert.deepEqual(Object.keys(survivorLocal.snapshot()), []),
    undefined,
    'NFR-024 control: the raw-namespace arm must reject a namespace that still holds a survivor, even when the report claims a verified deletion'
  );
  assert.throws(
    () => assert.equal(incomplete.ok, true),
    undefined,
    'NFR-024 control: the certification predicate must reject an incomplete deletion'
  );
  assert.throws(
    () => assert.equal(reread.value.personalKeyCount, declaredCount),
    undefined,
    'NFR-024 control: the reread predicate must distinguish an emptied namespace from a populated one'
  );
});

/* ═══════════ Feature 008 Scope 04 — public evidence barrier and coverage ═══════════ */

// rldata.js is an IIFE that attaches to a root object rather than exporting, so it is loaded the
// way scripts/selftest.mjs already loads it. `fetch` is passed as a RECORDER rather than omitted:
// omitting it would make "no request was issued" trivially true, which proves nothing about policy.
function loadRldata({ initial = {}, protocol = 'https:' } = {}) {
  const source = readFileSync(resolve(ROOT, 'rldata.js'), 'utf8');
  const durable = createStorage({ initial });
  const session = createStorage();
  const requests = [];
  const fetchRecorder = (url, init) => {
    requests.push({ url: String(url), init: init || {} });
    return Promise.reject(new Error('network is not reachable in this suite'));
  };
  const root = { location: { pathname: '/index.html', protocol } };
  const api = Function(
    'globalThis', 'window', 'localStorage', 'sessionStorage', 'fetch', 'location', 'document',
    source + '\nreturn globalThis.RLDATA;'
  )(root, root, durable, session, fetchRecorder, root.location, undefined);
  return { api, durable, session, requests };
}

// Two consecutive UTC weekdays of same-origin daily bars, oldest-first, matching the shape putBars
// stores. The dates are explicit so a coverage claim can be checked against them rather than
// against a range string the caller asked for.
function coverageRows(dates) {
  return dates.map((iso, index) => ({ t: Date.parse(iso + 'T00:00:00.000Z'), c: 100 + index }));
}

test('SCN-008-005 TP-04-01: bar coverage is measured from actual dates and same-origin-only never issues a request', () => {
  const { api, requests } = loadRldata();
  assert.equal(typeof api.ensureBarCoverage, 'function', 'RLDATA must expose the additive ensureBarCoverage method');

  const dates = ['2026-07-06', '2026-07-07', '2026-07-08'];
  api.putBars('SCOPE04-COVERAGE', '1d', coverageRows(dates), 'same-origin-fixture');

  const covered = api.ensureBarCoverage('SCOPE04-COVERAGE', '1d', { mode: 'same-origin-only', requiredFirst: '2026-07-06', requiredLast: '2026-07-08' });
  assert.equal(covered.state, 'complete', 'coverage that spans the required window reports complete');
  assert.equal(covered.firstDate, '2026-07-06', 'the envelope reports the ACTUAL first date rather than the requested range');
  assert.equal(covered.lastDate, '2026-07-08', 'the envelope reports the ACTUAL last date');
  assert.equal(covered.observedCount, 3, 'the envelope counts the rows it actually has');
  assert.equal(covered.requestIssued, false, 'satisfied coverage issues no request');

  // The load-bearing half: a window the cache CANNOT satisfy must still not reach the network under
  // same-origin-only. A recorder is used so this asserts policy, not the absence of a fetch binding.
  const short = api.ensureBarCoverage('SCOPE04-COVERAGE', '1d', { mode: 'same-origin-only', requiredFirst: '2021-01-01', requiredLast: '2026-07-08' });
  assert.equal(short.state, 'partial', 'coverage shorter than the required window reports partial, never a false complete');
  assert.equal(short.firstDate, '2026-07-06', 'partial coverage still reports its real first date');
  assert.ok(String(short.partialReason || '').length > 0, 'partial coverage names why it is partial');
  assert.equal(short.requestIssued, false, 'same-origin-only never triggers a hidden request for missing coverage');
  assert.deepEqual(requests, [], 'no fetch of any kind was issued under same-origin-only');
});

test('SCN-008-035 TP-04-01: absent coverage is unavailable and no missing value is substituted', () => {
  const { api, requests } = loadRldata();

  const absent = api.ensureBarCoverage('SCOPE04-NOTHING', '1d', { mode: 'same-origin-only', requiredFirst: '2026-07-06', requiredLast: '2026-07-08' });
  assert.equal(absent.state, 'unavailable', 'a symbol with no same-origin rows is unavailable, not complete and not zero');
  assert.equal(absent.firstDate, null, 'an unavailable envelope carries no invented first date');
  assert.equal(absent.lastDate, null, 'an unavailable envelope carries no invented last date');
  assert.equal(absent.observedCount, 0, 'an unavailable envelope reports zero observations rather than a filled default');
  assert.ok(String(absent.unavailableReason || '').length > 0, 'an unavailable envelope names its reason');

  // A zero close is a legitimate observation; "no observation" must not render as one.
  const serialized = JSON.stringify(absent);
  assert.equal(/"c"\s*:\s*0/.test(serialized), false, 'absent coverage does not fabricate a zero close');
  assert.deepEqual(requests, [], 'an unavailable read under same-origin-only reaches no network');
});

test('SCN-008-005 TP-04-01: ensureBarCoverage is additive — legacy bars behaviour and cache keys are unchanged', () => {
  const { api, durable } = loadRldata();
  const dates = ['2026-07-06', '2026-07-07'];
  api.putBars('SCOPE04-LEGACY', '1d', coverageRows(dates), 'same-origin-fixture');

  const before = JSON.parse(durable.getItem('rlData'));
  const beforeBars = JSON.stringify(api.bars('SCOPE04-LEGACY', '1d'));

  api.ensureBarCoverage('SCOPE04-LEGACY', '1d', { mode: 'same-origin-only', requiredFirst: '2026-07-06', requiredLast: '2026-07-07' });

  const after = JSON.parse(durable.getItem('rlData'));
  assert.equal(JSON.stringify(api.bars('SCOPE04-LEGACY', '1d')), beforeBars, 'a coverage read does not alter the rows legacy callers see');
  assert.deepEqual(Object.keys(after).sort(), Object.keys(before).sort(), 'a coverage read introduces no new top-level cache key');
  assert.equal(after.v, before.v, 'the cache schema version is untouched');
});

/* SCN-008-035 — partial data must not create synthetic completeness. The projection reports what
 * each holding's evidence actually supports; it computes no analytics, which stay in later scopes. */

const TRUTH_HOLDINGS = Object.freeze([
  { symbol: 'CURRENT', factorTags: ['quality'], derivedValue: 4502.5 },
  { symbol: 'STALEPX', factorTags: ['value'], derivedValue: 1200 },
  { symbol: 'NOFACTOR', factorTags: [], derivedValue: 800 },
  { symbol: 'NOPRICE', factorTags: ['size'], derivedValue: 640 }
]);

const TRUTH_EVIDENCE = Object.freeze({
  CURRENT: { state: 'complete', lastDate: '2026-07-15', firstDate: '2021-01-04' },
  STALEPX: { state: 'stale', lastDate: '2026-05-01', firstDate: '2021-01-04' },
  NOFACTOR: { state: 'complete', lastDate: '2026-07-15', firstDate: '2021-01-04' },
  NOPRICE: { state: 'unavailable', lastDate: null, firstDate: null }
});

test('SCN-008-035 TP-04-01: the truth-state projection names each impact and never substitutes a missing value', () => {
  const { api } = loadContracts();
  assert.equal(typeof api.portfolioTruthState, 'function', 'RLPORTFOLIO must expose portfolioTruthState');

  const projection = api.portfolioTruthState(TRUTH_HOLDINGS, TRUTH_EVIDENCE, '2026-07-15');
  assert.equal(projection.ok, true, 'a well-formed projection succeeds');

  const rows = projection.value.rows;
  assert.equal(rows.length, 4, 'every holding is projected — none is dropped for being partial');
  const bySymbol = Object.fromEntries(rows.map((row) => [row.symbol, row]));

  // Valid current results remain visible and usable.
  assert.equal(bySymbol.CURRENT.priceState, 'current');
  assert.equal(bySymbol.CURRENT.factorState, 'present');
  assert.equal(bySymbol.CURRENT.confidence, 'full');
  assert.equal(bySymbol.CURRENT.valueIncluded, true, 'a fully-evidenced holding stays included');

  // Each impact is named PER RESULT rather than summarised once for the portfolio.
  assert.equal(bySymbol.STALEPX.priceState, 'stale');
  assert.ok(String(bySymbol.STALEPX.priceReason || '').includes('2026-05-01'), 'the stale row names the last date it actually has');
  assert.equal(bySymbol.STALEPX.confidence, 'reduced', 'stale evidence reduces confidence by explicit policy');

  assert.equal(bySymbol.NOFACTOR.priceState, 'current', 'a missing factor does not degrade an unrelated price state');
  assert.equal(bySymbol.NOFACTOR.factorState, 'missing');
  assert.equal(bySymbol.NOFACTOR.confidence, 'reduced');

  assert.equal(bySymbol.NOPRICE.priceState, 'missing');
  assert.equal(bySymbol.NOPRICE.confidence, 'unavailable', 'absent price evidence is unavailable, not merely reduced');
  assert.equal(bySymbol.NOPRICE.valueIncluded, false, 'a holding with no price evidence is excluded rather than valued');

  /* The load-bearing assertion: a missing value must be null. Zero, the prior value, and the
   * portfolio average are each a synthetic completeness this scenario exists to forbid. */
  assert.equal(bySymbol.NOPRICE.value, null, 'a missing value is null — never zero, unchanged, or averaged');
  const included = rows.filter((row) => row.valueIncluded).map((row) => row.value);
  assert.equal(included.includes(0), false, 'no included row carries a fabricated zero');
  assert.equal(projection.value.summary.excludedForMissingEvidence, 1, 'the summary counts what was excluded rather than hiding it');
  assert.equal(projection.value.summary.valuedCount, 3, 'only evidenced holdings are valued');
});

test('SCN-008-035 TP-04-01: an unknown evidence state is refused rather than defaulted to current', () => {
  const { api } = loadContracts();
  // Defaulting an unrecognised state to "current" is the exact synthetic completeness this forbids.
  const projection = api.portfolioTruthState(
    [{ symbol: 'WEIRD', factorTags: ['quality'], derivedValue: 100 }],
    { WEIRD: { state: 'not-a-real-state', lastDate: '2026-07-15' } },
    '2026-07-15'
  );
  assert.equal(projection.ok, true, 'the projection still returns a record rather than throwing');
  const row = projection.value.rows[0];
  assert.equal(row.priceState, 'missing', 'an unrecognised evidence state is treated as missing, never as current');
  assert.equal(row.valueIncluded, false);
  assert.equal(row.value, null);
});

/* FR-083 requires corporate actions, currency conversion, missing bars and mismatched trading
   calendars to produce EXPLICIT alignment states. The failure being prevented is the comfortable
   default: treating an undeclared series as unadjusted-and-native, which silently corrupts any
   return computed across a split, and inventing gap counts for a series that has no comparison
   basis. */
test('SCN-008-035 TP-04-01: undeclared alignment properties report undeclared and are never assumed', () => {
  const { api } = loadRldata();
  api.putBars('SCOPE04-ALIGN-A', '1d', coverageRows(['2026-07-06', '2026-07-07']), 'same-origin-fixture');

  const report = api.barAlignmentStates(['SCOPE04-ALIGN-A'], '1d');
  const only = report.symbols['SCOPE04-ALIGN-A'];
  assert.equal(report.contractVersion, 'rl-bar-alignment/v1');
  assert.equal(only.corporateAction, 'undeclared', 'an undeclared corporate-action basis must not be reported as unadjusted');
  assert.equal(only.currency, 'undeclared', 'an undeclared currency must not be reported as native');
  assert.equal(only.units, 'undeclared');
  assert.equal(only.transform, 'undeclared');
  assert.ok(only.retrievedAt, 'FR-020 requires a retrieval time distinct from the observation dates');
  assert.equal(only.firstDate, '2026-07-06', 'observation time is reported from the actual rows');

  // A single series cannot distinguish a market holiday from an absent bar.
  assert.equal(only.missingBars.state, 'no-comparison-basis',
    'one series alone must not fabricate a gap count');
  assert.equal(only.missingBars.count, 0);
  assert.equal(report.calendar.state, 'no-comparison-basis');
});

test('SCN-008-035 TP-04-01: a mismatched trading calendar is measured against a real basis and named per date', () => {
  const { api } = loadRldata();
  // B is missing 2026-07-07 INSIDE its own span, so the absence is a real gap rather than a
  // shorter history — which ensureBarCoverage already reports separately.
  api.putBars('SCOPE04-CAL-A', '1d', coverageRows(['2026-07-06', '2026-07-07', '2026-07-08']), 'same-origin-fixture');
  api.putBars('SCOPE04-CAL-B', '1d', coverageRows(['2026-07-06', '2026-07-08']), 'same-origin-fixture');

  const report = api.barAlignmentStates(['SCOPE04-CAL-A', 'SCOPE04-CAL-B'], '1d');
  assert.equal(report.calendar.state, 'mismatched');
  assert.deepEqual(report.symbols['SCOPE04-CAL-B'].missingBars.dates, ['2026-07-07'],
    'the mismatch names the actual date rather than only a count');
  assert.equal(report.symbols['SCOPE04-CAL-B'].missingBars.state, 'gaps-present');
  assert.equal(report.symbols['SCOPE04-CAL-A'].missingBars.state, 'complete-within-span',
    'the complete series must not be blamed for its neighbour’s gap');
  assert.deepEqual(report.calendar.mismatchedDates, { 'SCOPE04-CAL-B': ['2026-07-07'] });

  // A shorter history is a coverage question, not a calendar mismatch; conflating them double-reports.
  const short = loadRldata().api;
  short.putBars('SCOPE04-SPAN-A', '1d', coverageRows(['2026-07-06', '2026-07-07', '2026-07-08']), 'same-origin-fixture');
  short.putBars('SCOPE04-SPAN-B', '1d', coverageRows(['2026-07-07', '2026-07-08']), 'same-origin-fixture');
  const spanReport = short.barAlignmentStates(['SCOPE04-SPAN-A', 'SCOPE04-SPAN-B'], '1d');
  assert.equal(spanReport.calendar.state, 'aligned',
    'a later start is short history, not a trading-calendar mismatch');
  assert.equal(spanReport.symbols['SCOPE04-SPAN-B'].missingBars.count, 0);
});

