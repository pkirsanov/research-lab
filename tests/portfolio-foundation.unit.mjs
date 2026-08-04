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