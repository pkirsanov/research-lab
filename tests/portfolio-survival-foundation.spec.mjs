import { expect, test } from './playwright-runtime.mjs';
import { resolve } from 'node:path';
import { FIXTURE_ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

async function blockStorage(page, mode) {
  await page.addInitScript((requestedMode) => {
    function blockedStorage() {
      return Object.freeze({
        get length() { return 0; },
        clear() { throw new Error('storage blocked'); },
        getItem() { throw new Error('storage blocked'); },
        key() { return null; },
        removeItem() { throw new Error('storage blocked'); },
        setItem() { throw new Error('storage blocked'); }
      });
    }
    if (requestedMode === 'session' || requestedMode === 'memory') {
      Object.defineProperty(window, 'localStorage', { configurable: true, value: blockedStorage() });
    }
    if (requestedMode === 'memory') {
      Object.defineProperty(window, 'sessionStorage', { configurable: true, value: blockedStorage() });
    }
  }, mode);
}

async function openRoute(page) {
  const browserRequests = [];
  page.on('request', (request) => browserRequests.push(request.url()));
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  expect(response?.status(), 'unregistered portfolio route foundation must be served').toBe(200);
  await expect(page.getByRole('heading', { name: 'Portfolio Brief' })).toBeVisible();
  await expect(page.locator('#localBoundary')).toContainText('Local-only');
  await expect(page.locator('#workspaceTabBrief')).toHaveAttribute('aria-selected', 'true');
  return browserRequests;
}

async function importValid(page, name = 'Scope 01 portfolio') {
  await page.locator('#portfolioName').fill(name);
  await page.locator('#portfolioFile').setInputFiles(resolve(FIXTURE_ROOT, 'valid-portfolio.csv'));
  await expect(page.locator('#previewAccepted')).toHaveText('3');
  await expect(page.locator('#previewNormalized')).not.toHaveText('0');
  await expect(page.locator('#previewDuplicates')).toHaveText('2');
  await page.locator('#duplicateChoice').selectOption('merge');
  await page.locator('#localOnlyAcknowledgement').check();
  await expect(page.locator('#confirmImport')).toBeEnabled();
  await page.locator('#confirmImport').click();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

async function previewMandate(page, fixtureName) {
  await page.locator('#mandateFile').setInputFiles(resolve(FIXTURE_ROOT, fixtureName));
  await expect(page.locator('#mandateResult')).not.toHaveText('No mandate draft previewed.');
}

async function visitRoute(page, route) {
  await page.locator(`#workspaceTab${route.tab}`).click();
  await expect(page).toHaveURL(new RegExp(`#${route.hash}$`));
  await expect(page.locator(`#workspaceTab${route.tab}`)).toHaveAttribute('aria-selected', 'true');
  return page.locator(`[data-route="${route.hash}"]`);
}

const MANDATE_ROUTES = Object.freeze([
  { hash: 'risk-xray', tab: 'RiskXray' },
  { hash: 'path-lab', tab: 'PathLab' },
  { hash: 'allocation', tab: 'Allocation' }
]);

const MANDATE_DEPENDENT_STATES = Object.freeze([
  'cash-need-collision', 'constraint-feasibility', 'goal-fit', 'survival-to-goal'
]);

const NEVER_INFERRED_FIELDS = Object.freeze([
  'expectedReturn', 'horizon', 'liquidityNeed', 'riskTolerance', 'survivalFloor'
]);

test('Regression: SCN-008-003 explicit mandate alone supplies every hard constraint', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'SCN-008-003 portfolio');
  const beforeMandate = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(beforeMandate.currentMandateId).toBe(null);

  await previewMandate(page, 'mandate-explicit.json');
  await expect(page.locator('#mandateConstraints')).toHaveText('2');
  await expect(page.locator('#mandateHard')).toHaveText('2');
  await expect(page.locator('#mandateResearch')).toHaveText('0');
  await expect(page.locator('#mandateCashNeeds')).toHaveText('1');
  await expect(page.locator('#mandateConflicts')).toHaveText('0');
  await expect(page.locator('#mandateRejected')).toHaveText('0');
  // The four nullable policy fields are absent in the fixture and must be reported absent, not defaulted.
  await expect(page.locator('#mandateAbsent')).toHaveText('4');
  await expect(page.locator('#mandateAbsentList')).toContainText('survivalDefinition');
  await expect(page.locator('#mandateAbsentList')).toContainText('expectedReturnPolicy');
  await expect(page.locator('#mandateImpact')).toContainText('Current portfolio unchanged');
  await expect(page.locator('#mandateImpact')).toContainText('behavior contributes none');

  await expect(page.locator('#confirmMandate')).toBeEnabled();
  await page.locator('#confirmMandate').click();
  await expect(page.locator('#currentMandate')).toContainText('sha256:');

  const afterMandate = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(afterMandate.currentMandateId).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(afterMandate.mandateRevisionCount).toBe(1);
  // A mandate is not a portfolio edit: the portfolio revision identity must survive untouched.
  expect(afterMandate.currentPortfolioId).toBe(beforeMandate.currentPortfolioId);
  expect(afterMandate.holdingCount).toBe(beforeMandate.holdingCount);
  expect(afterMandate.revisionCount).toBe(beforeMandate.revisionCount);

  for (const route of MANDATE_ROUTES) {
    const panel = await visitRoute(page, route);
    await expect(panel.locator('[data-descriptive]')).toContainText(afterMandate.currentPortfolioId);
    for (const state of MANDATE_DEPENDENT_STATES) {
      await expect(panel.locator(`[data-state="${state}"]`)).toContainText('Available');
      await expect(panel.locator(`[data-state="${state}"]`)).toContainText(afterMandate.currentMandateId);
    }
    await expect(panel.locator('[data-constraints]')).toContainText('MSFT');
    await expect(panel.locator('[data-constraints]')).toContainText('0.25');
    await expect(panel.locator('[data-constraints]')).toContainText('BND');
    await expect(panel.locator('[data-constraints]')).toContainText('0.1');
    await expect(panel.locator('[data-cash-needs]')).toContainText('2031-06-30');
    await expect(panel.locator('[data-cash-needs]')).toContainText('40000');
    await expect(panel.locator('[data-behavior]')).toContainText('behavior contributes none');
  }

  const projection = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__.routeStates);
  expect(projection.behaviorContribution).toBe('none');
  expect(projection.settingsContribution).toBe('none');
  expect(projection.routes.map((entry) => entry.route).sort()).toEqual(['allocation', 'path-lab', 'risk-xray']);
  for (const entry of projection.routes) {
    expect(entry.constraints.map((constraint) => constraint.subject).sort()).toEqual(['BND', 'MSFT']);
    expect(entry.constraints.every((constraint) => constraint.inputAuthority === 'user')).toBe(true);
    expect(entry.cashNeeds.map((need) => need.date)).toEqual(['2031-06-30']);
    expect(entry.cashNeeds.every((need) => need.inputAuthority === 'user')).toBe(true);
    for (const field of NEVER_INFERRED_FIELDS) expect(entry.inferredValues[field]).toBe(null);
  }

  // Behavior/interest/settings evidence must be refused outright, never absorbed into a constraint.
  await page.locator('#workspaceTabBrief').click();
  await previewMandate(page, 'mandate-behavior-noise.json');
  await expect(page.locator('#mandateResult')).toContainText('P008-MANDATE-AUTHORITY');
  await expect(page.locator('#mandateResult')).toContainText('forbidden-input-source');
  await expect(page.locator('#confirmMandate')).toBeDisabled();
  const afterNoise = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(afterNoise.currentMandateId).toBe(afterMandate.currentMandateId);
  expect(afterNoise.mandateRevisionCount).toBe(1);
  const noiseProjection = afterNoise.routeStates.routes[0];
  expect(noiseProjection.constraints.map((constraint) => constraint.subject).sort()).toEqual(['BND', 'MSFT']);
  expect(JSON.stringify(afterNoise.routeStates)).not.toMatch(/XOM|commodity-carry|energy|shockMagnitude/i);

  const requests = server.requests.slice(requestStart);
  expect(requests.every((entry) => entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(requests)).not.toMatch(/MSFT|BND|40000|2031-06-30|objectiveLabel/i);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  console.log('[SCN-008-003] mandateId=' + afterMandate.currentMandateId);
  console.log('[SCN-008-003] portfolioUnchanged=' + (afterMandate.currentPortfolioId === beforeMandate.currentPortfolioId));
  console.log('[SCN-008-003] hardConstraints=2');
  console.log('[SCN-008-003] researchConstraints=0');
  console.log('[SCN-008-003] cashNeeds=1');
  console.log('[SCN-008-003] absentFields=4');
  console.log('[SCN-008-003] routesCiting=' + projection.routes.length);
  console.log('[SCN-008-003] behaviorContribution=' + projection.behaviorContribution);
  console.log('[SCN-008-003] behaviorDraftRefused=P008-MANDATE-AUTHORITY');
  console.log('[SCN-008-003] mandateUnchangedAfterNoise=true');
  console.log('[SCN-008-003] remotePersonalRequests=0');
});

test('Regression: SCN-008-004 no mandate leaves goal fit and survival unavailable', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'SCN-008-004 portfolio');
  const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(diagnostics.currentMandateId).toBe(null);
  expect(diagnostics.mandateRevisionCount).toBe(0);

  for (const route of MANDATE_ROUTES) {
    const panel = await visitRoute(page, route);
    // Descriptive research survives the absence of a mandate.
    await expect(panel.locator('[data-descriptive]')).toContainText('Available');
    await expect(panel.locator('[data-descriptive]')).toContainText(diagnostics.currentPortfolioId);
    for (const state of MANDATE_DEPENDENT_STATES) {
      const stateLocator = panel.locator(`[data-state="${state}"]`);
      await expect(stateLocator).toContainText('Unavailable');
      await expect(stateLocator).toContainText('mandate-absent');
      await expect(stateLocator).not.toContainText('sha256:');
    }
    await expect(panel.locator('[data-inferred]')).toContainText('No inferred values');
    for (const field of NEVER_INFERRED_FIELDS) {
      await expect(panel.locator('[data-inferred]')).toContainText(`${field}=absent`);
    }
    await expect(panel.locator('[data-constraints]')).toContainText('No user-entered constraint');
    await expect(panel.locator('[data-cash-needs]')).toContainText('No user-entered cash need');
  }

  const projection = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__.routeStates);
  expect(projection.currentMandateId).toBe(null);
  expect(projection.citedMandateFingerprint).toBe(null);
  for (const entry of projection.routes) {
    expect(entry.descriptive.available).toBe(true);
    expect(entry.descriptive.citedPortfolioId).toBe(diagnostics.currentPortfolioId);
    expect(entry.constraints).toEqual([]);
    expect(entry.cashNeeds).toEqual([]);
    expect(entry.horizon).toBe(null);
    for (const state of entry.mandateDependent) {
      expect(state.available).toBe(false);
      expect(state.reason).toBe('mandate-absent');
      expect(state.citedMandateId).toBe(null);
    }
    for (const field of NEVER_INFERRED_FIELDS) expect(entry.inferredValues[field]).toBe(null);
  }

  // A missing goal must never render as a neutral zero or a placeholder number.
  const routeText = await page.locator('#routeStates').innerText();
  expect(routeText).not.toMatch(/\b(0%|0\.0|TBD|N\/A|default|assumed|typical)\b/i);

  // NFR-022: the research/advice boundary is user-visible, not merely implied by withheld states.
  const boundary = page.locator('footer');
  await expect(boundary).toContainText('Educational research only');
  await expect(boundary).toContainText('cannot place an order');
  await expect(boundary).toContainText('send a broker instruction');

  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  expect(server.requests.slice(requestStart).every((entry) => entry.method === 'GET')).toBe(true);
  console.log('[SCN-008-004] currentMandateId=null');
  console.log('[SCN-008-004] descriptiveAvailable=true');
  console.log('[SCN-008-004] goalFit=unavailable:mandate-absent');
  console.log('[SCN-008-004] survivalToGoal=unavailable:mandate-absent');
  console.log('[SCN-008-004] constraintFeasibility=unavailable:mandate-absent');
  console.log('[SCN-008-004] cashNeedCollision=unavailable:mandate-absent');
  console.log('[SCN-008-004] inferredValues=0');
  console.log('[SCN-008-004] placeholderNumbers=0');
  console.log('[SCN-008-004] educationalBoundary=visible');
  console.log('[SCN-008-004] routes=' + projection.routes.length);
});

test('Regression: SCN-008-003 conflicting mandate stays visibly infeasible with no constraint relaxed', async ({ page }) => {
  await openRoute(page);
  await importValid(page, 'Conflict portfolio');
  await previewMandate(page, 'mandate-explicit.json');
  await page.locator('#confirmMandate').click();
  await expect(page.locator('#currentMandate')).toContainText('sha256:');
  const established = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);

  await previewMandate(page, 'mandate-conflicting.json');
  await expect(page.locator('#confirmMandate')).toBeDisabled();
  await expect(page.locator('#mandateResult')).toContainText('Current mandate unchanged');
  // Every declared constraint and cash need survives the conflict, in declared order.
  await expect(page.locator('#mandateConstraints')).toHaveText('2');
  await expect(page.locator('#mandateCashNeeds')).toHaveText('3');
  await expect(page.locator('#mandateConflictList')).toContainText('constraint-bounds-conflict');
  await expect(page.locator('#mandateConflictList')).toContainText('cash-need-currency-unavailable');
  await expect(page.locator('#mandateConflictList')).toContainText('cash-need-declared-order-invalid');

  const declaredCashNeedDates = await page.locator('#mandateCashNeedRows tr td:first-child').allInnerTexts();
  expect(declaredCashNeedDates).toEqual(['2029-03-31', '2027-09-30', '2034-01-31']);
  const declaredConstraints = await page.locator('#mandateConstraintRows tr td:nth-child(2)').allInnerTexts();
  expect(declaredConstraints).toEqual(['MSFT', 'MSFT']);

  const afterConflict = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(afterConflict.currentMandateId).toBe(established.currentMandateId);
  expect(afterConflict.currentPortfolioId).toBe(established.currentPortfolioId);
  expect(afterConflict.mandateRevisionCount).toBe(1);
  const conflictCount = Number(await page.locator('#mandateConflicts').innerText());
  expect(conflictCount).toBeGreaterThanOrEqual(3);
  console.log('[SCN-008-003-conflict] conflicts=' + conflictCount);
  console.log('[SCN-008-003-conflict] confirmDisabled=true');
  console.log('[SCN-008-003-conflict] declaredConstraintsPreserved=2');
  console.log('[SCN-008-003-conflict] declaredCashNeedsPreserved=3');
  console.log('[SCN-008-003-conflict] declaredOrderPreserved=true');
  console.log('[SCN-008-003-conflict] currentMandateUnchanged=true');
  console.log('[SCN-008-003-conflict] currentPortfolioUnchanged=true');
  console.log('[SCN-008-003-conflict] constraintsRelaxed=0');
});

test('Regression: SCN-008-001 valid local portfolio import creates one current revision', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page);
  const first = await page.evaluate(() => ({
    diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
    localKeys: Object.keys(localStorage).sort(),
    sessionKeys: Object.keys(sessionStorage).sort(),
    url: location.href
  }));
  expect(first.diagnostics.generation).toBe(1);
  expect(first.diagnostics.revisionCount).toBe(1);
  expect(first.diagnostics.holdingCount).toBe(2);
  expect(first.diagnostics.storageMode).toBe('durable');
  expect(first.localKeys).toEqual(['rlPortfolioWorkspaceV1.pointer', 'rlPortfolioWorkspaceV1.slotA']);
  expect(first.sessionKeys).toEqual([]);
  expect(first.url).not.toMatch(/MSFT|BND|quantity|costBasis/i);
  const revisionId = first.diagnostics.currentPortfolioId;
  await page.reload();
  await expect(page.locator('#briefWorkspace #currentRevision')).toContainText(revisionId.slice(0, 20));
  const reloaded = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(reloaded.currentPortfolioId).toBe(revisionId);
  expect(reloaded.revisionCount).toBe(1);

  // Second instantiation allowed by the UI Scenario Matrix: commit over one existing revision.
  const secondName = 'Scope 01 second revision';
  await importValid(page, secondName);
  // The rendered revision line carries the committed name, so this waits on the new state, not a clock.
  await expect(page.locator('#briefWorkspace #currentRevision')).toContainText(secondName);
  const second = await page.evaluate(() => {
    const pointer = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'));
    const active = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.' + pointer.activeSlot));
    return {
      diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
      activeSlot: pointer.activeSlot,
      localKeys: Object.keys(localStorage).sort(),
      sessionKeys: Object.keys(sessionStorage).sort(),
      url: location.href,
      revisionIds: active.portfolioRevisions.map((entry) => entry.portfolioId),
      revisionNames: active.portfolioRevisions.map((entry) => entry.name),
      supersedes: active.portfolioRevisions.map((entry) => entry.supersedes)
    };
  });
  const secondRevisionId = second.diagnostics.currentPortfolioId;
  expect(second.diagnostics.generation).toBe(2);
  expect(second.diagnostics.revisionCount).toBe(2);
  expect(second.diagnostics.storageMode).toBe('durable');
  expect(secondRevisionId).not.toBe(revisionId);
  expect(second.revisionIds).toEqual([revisionId, secondRevisionId]);
  expect(second.supersedes).toEqual([null, revisionId]);
  expect(second.revisionNames).toEqual(['Scope 01 portfolio', secondName]);
  expect(second.activeSlot).toBe('slotB');
  expect(second.localKeys).toEqual(['rlPortfolioWorkspaceV1.pointer', 'rlPortfolioWorkspaceV1.slotA', 'rlPortfolioWorkspaceV1.slotB']);
  expect(second.sessionKeys).toEqual([]);
  expect(second.url).not.toMatch(/MSFT|BND|quantity|costBasis/i);
  expect(second.url).not.toContain(secondName);
  await page.reload();
  const briefRevision = page.locator('#briefWorkspace #currentRevision');
  await expect(briefRevision).toContainText(secondRevisionId.slice(0, 20));
  await expect(briefRevision).toContainText(secondName);
  await expect(briefRevision).not.toContainText(revisionId.slice(0, 20));
  const afterSecondReload = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(afterSecondReload.currentPortfolioId).toBe(secondRevisionId);
  expect(afterSecondReload.revisionCount).toBe(2);
  expect(afterSecondReload.generation).toBe(2);

  const requests = server.requests.slice(requestStart);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every((entry) => !/https?:\/\//.test(entry.pathname) && entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(requests)).not.toMatch(/Scope 01 portfolio|MSFT|BND|costBasis/i);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  expect(await page.evaluate(async () => !navigator.serviceWorker.controller && (await navigator.serviceWorker.getRegistrations()).length === 0)).toBe(true);
  console.log('[SCN-008-001] route=served');
  console.log('[SCN-008-001] previewAccepted=3');
  console.log('[SCN-008-001] duplicateChoice=merge');
  console.log('[SCN-008-001] generation=' + reloaded.generation);
  console.log('[SCN-008-001] revisions=' + reloaded.revisionCount);
  console.log('[SCN-008-001] holdings=' + reloaded.holdingCount);
  console.log('[SCN-008-001] storageMode=' + reloaded.storageMode);
  console.log('[SCN-008-001] localKeys=' + first.localKeys.join(','));
  console.log('[SCN-008-001] remoteRequests=0');
});

test('Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'Prior portfolio');
  const prior = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  const sentinel = 'SCOPE01-E2E-PRIVATE-' + Date.now();
  const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8').replaceAll('__PRIVATE_SENTINEL__', sentinel);
  await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
  await expect(page.locator('#confirmImport')).toBeDisabled();
  await expect(page.locator('#previewRejected')).not.toHaveText('0');
  await expect(page.locator('#importErrors')).toContainText('P008-IMPORT-SECRET');
  await expect(page.locator('#currentRevision')).toContainText('Current portfolio unchanged');
  await expect(page.locator('body')).not.toContainText(sentinel);
  const after = await page.evaluate((privateSentinel) => ({
    diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
    local: Object.values(localStorage).join('\n'),
    session: Object.values(sessionStorage).join('\n'),
    url: location.href,
    bodyContains: document.body.textContent.includes(privateSentinel)
  }), sentinel);
  expect(after.diagnostics.currentPortfolioId).toBe(prior.currentPortfolioId);
  expect(after.diagnostics.generation).toBe(prior.generation);
  expect(after.local).not.toContain(sentinel);
  expect(after.session).not.toContain(sentinel);
  expect(after.url).not.toContain(sentinel);
  expect(after.bodyContains).toBe(false);
  expect(consoleMessages.join('\n')).not.toContain(sentinel);
  expect(JSON.stringify(server.requests.slice(requestStart))).not.toContain(sentinel);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  console.log('[SCN-008-002] confirmation=disabled');
  console.log('[SCN-008-002] redaction=value-not-echoed');
  console.log('[SCN-008-002] generation=' + after.diagnostics.generation);
  console.log('[SCN-008-002] currentUnchanged=true');
  console.log('[SCN-008-002] storageSentinel=false');
  console.log('[SCN-008-002] consoleSentinel=false');
  console.log('[SCN-008-002] urlSentinel=false');
  console.log('[SCN-008-002] requestSentinel=false');
});

test('Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes', async ({ browser }) => {
  const outcomes = [];
  for (const mode of ['durable', 'session', 'memory']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await blockStorage(page, mode);
    const browserRequests = await openRoute(page);
    await expect(page.locator('#storageMode')).toContainText(mode === 'durable' ? 'Durable' : mode === 'session' ? 'Session-only' : 'Memory-only');
    if (mode !== 'durable') await expect(page.locator('#storageWarning')).toContainText('closes with this tab');
    await importValid(page, `${mode} portfolio`);
    await expect(page.locator('#commitResult')).toHaveText(mode === 'durable'
      ? 'Verified durable local revision.'
      : 'Verified for this tab only. No durable-save claim.');
    const before = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(before.savedDurably).toBe(mode === 'durable');
    const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8');
    await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
    await expect(page.locator('#confirmImport')).toBeDisabled();
    const after = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(after.currentPortfolioId).toBe(before.currentPortfolioId);
    expect(after.generation).toBe(before.generation);
    expect(after.storageMode).toBe(mode);
    expect(after.savedDurably).toBe(mode === 'durable');
    expect(browserRequests.length).toBeGreaterThan(0);
    expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
    expect(await page.evaluate(async () => !navigator.serviceWorker.controller && (await navigator.serviceWorker.getRegistrations()).length === 0)).toBe(true);
    if (mode === 'session') {
      await page.reload();
      await expect.poll(async () => page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__ ? window.__PORTFOLIO_DIAGNOSTICS__.currentPortfolioId : null)).toBe(before.currentPortfolioId);
    }
    outcomes.push(`${mode}:${after.generation}:${after.storageMode}`);
    await context.close();
  }
  expect(outcomes).toHaveLength(3);
  console.log('[TP-01-05] modes=' + outcomes.join(','));
  console.log('[TP-01-05] durable=true');
  console.log('[TP-01-05] session=true');
  console.log('[TP-01-05] memory=true');
  console.log('[TP-01-05] priorRevisionPreserved=true');
  console.log('[TP-01-05] falseDurableClaim=false');
  console.log('[TP-01-05] sessionWarning=true');
  console.log('[TP-01-05] externalProviders=0');
});