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
  assert.equal(byName['behavior-events'].clearedBy, 'behavior');
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
  assert.equal(inventory.value.categories.length, 8, 'every declared category must be projected, so the clearedBy sweep above is not run over a short list');

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
function policyDeclaredKeys(policy) {
  return {
    local: [policy.storage.pointerKey, ...policy.storage.slotKeys, policy.storage.quarantineKey].slice().sort(),
    session: [policy.storage.sessionKey, policy.storage.returnContextKey].slice().sort()
  };
}

test('verified clear covers every policy-declared personal key and leaves the raw namespace holding none of them', () => {
  const { api, policy } = loadContracts();
  const declared = policyDeclaredKeys(policy);
  const declaredCount = declared.local.length + declared.session.length;
  assert.equal(declared.local.length, 4, 'the policy must declare the pointer, both slots, and quarantine');
  assert.equal(declared.session.length, 2, 'the policy must declare the session fallback and the return context');
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
