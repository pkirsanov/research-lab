import { expect, test } from './playwright-runtime.mjs';
import { resolve } from 'node:path';
import { commitTrackedLeak, FIXTURE_ROOT, startPortfolioServer, trackedPathsContaining } from './portfolio-survival.support.mjs';

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
    // The declared kind is displayed, not just the subject and bound: a route panel that
    // downgrades every hard bound to research renders the same subjects and numbers.
    await expect(panel.locator('[data-constraints]')).not.toContainText('research');
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
    // Both fixture constraints are declared hard; the projection must carry the declared
    // kind through, or a hard bound reaches every dependent route state as advisory.
    expect(entry.constraints.map((constraint) => constraint.constraintKind)).toEqual(['hard', 'hard']);
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
    // 'No inferred values' is a prefix that survives any appended key, so read every
    // rendered pair: a sixth field carrying a real number would display beneath that heading.
    const inferredText = await panel.locator('[data-inferred]').innerText();
    expect(inferredText.match(/=(?!absent\b)[^\s·]+/g)).toBe(null);
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
    // Quantify over the whole projected set, not the listed names: an unlisted key is
    // exactly the hidden value this scenario denies.
    expect(Object.keys(entry.inferredValues).sort()).toEqual([...NEVER_INFERRED_FIELDS].sort());
    expect(Object.values(entry.inferredValues).every((value) => value === null)).toBe(true);
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
  // Unprefixed lines report the final committed state the assertions above pin; firstImport.* is the earlier snapshot.
  console.log('[SCN-008-001] route=served');
  console.log('[SCN-008-001] previewAccepted=3');
  console.log('[SCN-008-001] duplicateChoice=merge');
  console.log('[SCN-008-001] firstImport.generation=' + first.diagnostics.generation);
  console.log('[SCN-008-001] firstImport.revisionCount=' + first.diagnostics.revisionCount);
  console.log('[SCN-008-001] firstImport.holdings=' + first.diagnostics.holdingCount);
  console.log('[SCN-008-001] firstImport.localKeys=' + first.localKeys.join(','));
  console.log('[SCN-008-001] generation=' + afterSecondReload.generation);
  console.log('[SCN-008-001] revisionCount=' + afterSecondReload.revisionCount);
  console.log('[SCN-008-001] storageMode=' + second.diagnostics.storageMode);
  console.log('[SCN-008-001] activeSlot=' + second.activeSlot);
  console.log('[SCN-008-001] localKeys=' + second.localKeys.join(','));
  console.log('[SCN-008-001] remoteRequests=0');
});

/*
 * SCN-008-002 sink 5 — `committed artifacts`.
 *
 * The four runtime sinks are provable with a per-run value, but a probe built from Date.now()
 * can NEVER appear in a tracked file, so it cannot test this sink at all — it makes the clause
 * untestable, not satisfied. The probe below is therefore FIXED (a literal a leak could really
 * deposit in git) and the run-unique suffix is kept on top of it, so per-run isolation on the
 * four runtime sinks is unchanged.
 *
 * The constant's only legitimate home is this file, so the assertion is
 * `found set === declared origins`, never `found set is empty`: a bare tree-wide scan would
 * self-trigger on the declaration itself and prove nothing.
 */
const COMMITTED_ARTIFACT_SENTINEL = 'SCOPE01-PRIVATE-COMMITTED-PROBE-7f3a9c2e';
const COMMITTED_ARTIFACT_ORIGINS = Object.freeze(['tests/portfolio-survival-foundation.spec.mjs']);

test('Regression: SCN-008-002 invalid or secret-bearing import is atomic and redacted', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', (message) => consoleMessages.push(message.text()));
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'Prior portfolio');
  const prior = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  const sentinel = COMMITTED_ARTIFACT_SENTINEL + '-' + Date.now();
  const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8').replaceAll('__PRIVATE_SENTINEL__', sentinel);
  await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
  await expect(page.locator('#confirmImport')).toBeDisabled();
  await expect(page.locator('#previewRejected')).not.toHaveText('0');
  await expect(page.locator('#importErrors')).toContainText('P008-IMPORT-SECRET');
  /* safeErrorCopy() renders `CODE · row N · field X · reason`. Asserting only the code would let a
   * regression drop the row/field segments — the part that makes the rejection actionable. */
  const errorCopy = (await page.locator('#importErrors li').allTextContents()).join('\n');
  expect(errorCopy, 'rejection reason names the offending row').toMatch(/row \d+/);
  expect(errorCopy, 'rejection reason names the offending field').toMatch(/field \S+/);
  expect(errorCopy, 'rejection reason names row and field without echoing the value').not.toContain(sentinel);
  await expect(page.locator('#currentRevision')).toContainText('Current portfolio unchanged');
  await expect(page.locator('body')).not.toContainText(sentinel);
  const after = await page.evaluate((privateSentinel) => ({
    diagnostics: window.__PORTFOLIO_DIAGNOSTICS__,
    local: Object.values(localStorage).join('\n'),
    session: Object.values(sessionStorage).join('\n'),
    url: location.href,
    bodyContains: document.body.textContent.includes(privateSentinel),
    // `rlData` is the shared cache scripts/brief-distributed-publish.mjs harvests into briefs/.
    sharedCache: localStorage.getItem('rlData'),
    foreignKeys: Object.keys(localStorage).filter((key) => !key.startsWith('rlPortfolioWorkspaceV1.')).sort()
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

  /* Sink 5, causal half — the only route by which a rejected value could BECOME a committed
   * artifact. scripts/brief-distributed-publish.mjs harvests localStorage.rlData.toolReads into
   * tracked briefs/, so a portfolio write into the shared cache would carry the rejected value
   * into git on the next publish. The repo-wide "every tool publishes its read to
   * RLDATA.toolReads" convention makes that a live regression, not a hypothetical one. */
  expect(after.sharedCache, 'rejection leaves no shared-cache entry for the brief publisher to harvest').toBe(null);
  expect(after.foreignKeys, 'rejection writes no storage key outside the private portfolio namespace').toEqual([]);

  /* Sink 5, artifact half — the fixed probe may exist only where it is declared. Asserting the
   * bare prefix (not just the run-unique value) also catches a truncated or prefix-only leak. */
  expect(after.local).not.toContain(COMMITTED_ARTIFACT_SENTINEL);
  expect(after.session).not.toContain(COMMITTED_ARTIFACT_SENTINEL);
  expect(after.url).not.toContain(COMMITTED_ARTIFACT_SENTINEL);
  expect(consoleMessages.join('\n')).not.toContain(COMMITTED_ARTIFACT_SENTINEL);
  expect(JSON.stringify(server.requests.slice(requestStart))).not.toContain(COMMITTED_ARTIFACT_SENTINEL);
  const sentinelPaths = trackedPathsContaining(COMMITTED_ARTIFACT_SENTINEL);
  expect(sentinelPaths, 'rejected value reaches no tracked file beyond its declared origin').toEqual([...COMMITTED_ARTIFACT_ORIGINS]);

  /* adversarial: the SAME scanner, pointed at a disposable repo that has committed the probe to a
   * brief-shaped tracked artifact, reports that path. Without this, an inert scan (wrong root,
   * wrong flags, always-empty) would make the assertion above pass vacuously. */
  const leak = commitTrackedLeak(COMMITTED_ARTIFACT_SENTINEL, 'briefs/current.json');
  try {
    const leakedPaths = trackedPathsContaining(COMMITTED_ARTIFACT_SENTINEL, leak.root);
    expect(leakedPaths, 'scanner detects a rejected value committed to a tracked artifact').toEqual(['briefs/current.json']);
    expect(leakedPaths.filter((path) => !COMMITTED_ARTIFACT_ORIGINS.includes(path)), 'a leak outside the declared origins is reported as a violation').toEqual(['briefs/current.json']);
  } finally {
    leak.cleanup();
  }

  console.log('[SCN-008-002] confirmation=disabled');
  console.log('[SCN-008-002] redaction=value-not-echoed');
  console.log('[SCN-008-002] generation=' + after.diagnostics.generation);
  console.log('[SCN-008-002] currentUnchanged=true');
  console.log('[SCN-008-002] storageSentinel=false');
  console.log('[SCN-008-002] consoleSentinel=false');
  console.log('[SCN-008-002] urlSentinel=false');
  console.log('[SCN-008-002] requestSentinel=false');
  // Paths only — never the probe value, or this evidence would itself become a new origin.
  console.log('[SCN-008-002] committedArtifactProbe=fixed-scannable');
  console.log('[SCN-008-002] committedArtifactOrigins=' + sentinelPaths.join(','));
  console.log('[SCN-008-002] committedArtifactViolations=0');
  console.log('[SCN-008-002] sharedCacheEntry=absent');
  console.log('[SCN-008-002] foreignStorageKeys=0');
  console.log('[SCN-008-002] scannerAdversarialDetection=briefs/current.json');
});

test('Regression: Feature 008 atomic slots preserve last valid portfolio in durable session and memory modes', async ({ browser }) => {
  const outcomes = [];
  for (const mode of ['durable', 'session', 'memory']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const consoleMessages = [];
    page.on('console', (message) => consoleMessages.push(message.text()));
    const requestStart = server.requests.length;
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
    /* The probe carries the same FIXED prefix TP-01-04 scans for, so the one tracked-tree scan
     * after this loop covers the rejection performed in every persistence mode. The per-mode
     * suffix keeps the runtime-sink checks isolated per iteration. */
    const modeSentinel = COMMITTED_ARTIFACT_SENTINEL + '-' + mode + '-' + Date.now();
    const invalidBytes = (await import('node:fs')).readFileSync(resolve(FIXTURE_ROOT, 'invalid-secret-portfolio.csv'), 'utf8').replaceAll('__PRIVATE_SENTINEL__', modeSentinel);
    await page.locator('#portfolioFile').setInputFiles({ name: 'invalid.csv', mimeType: 'text/csv', buffer: Buffer.from(invalidBytes) });
    await expect(page.locator('#confirmImport')).toBeDisabled();
    const after = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(after.currentPortfolioId).toBe(before.currentPortfolioId);
    expect(after.generation).toBe(before.generation);
    expect(after.storageMode).toBe(mode);
    expect(after.savedDurably).toBe(mode === 'durable');

    /* Sink absence per persistence mode. A blocked store is a plain stub, not a Storage, so
     * enumeration goes through the Storage API (`length`/`key`/`getItem`) rather than
     * Object.keys — which on the stub would return its own method names. `live` is an
     * instanceof probe, so it classifies the store without writing to it. A store the app cannot
     * write is one the rejected value cannot reach, which is why it is recorded, not assumed. */
    const sinks = await page.evaluate(() => {
      const live = (name) => { try { return window[name] instanceof Storage; } catch (error) { return false; } };
      const entries = (name) => {
        try {
          const store = window[name];
          const keys = [];
          const values = [];
          for (let index = 0; index < store.length; index += 1) {
            const key = store.key(index);
            if (key === null) continue;
            keys.push(key);
            values.push(String(store.getItem(key)));
          }
          return { keys, text: values.join('\n') };
        } catch (error) { return { keys: [], text: '' }; }
      };
      const shared = () => { try { return localStorage.getItem('rlData'); } catch (error) { return null; } };
      return { local: entries('localStorage'), session: entries('sessionStorage'), localLive: live('localStorage'), sessionLive: live('sessionStorage'), url: location.href, body: document.body.textContent, sharedCache: shared() };
    });
    expect(sinks.localLive, `${mode}: localStorage liveness matches the declared persistence mode`).toBe(mode === 'durable');
    expect(sinks.sessionLive, `${mode}: sessionStorage liveness matches the declared persistence mode`).toBe(mode !== 'memory');
    expect(sinks.local.text, `${mode}: rejected value absent from localStorage`).not.toContain(modeSentinel);
    expect(sinks.session.text, `${mode}: rejected value absent from sessionStorage`).not.toContain(modeSentinel);
    expect(sinks.url, `${mode}: rejected value absent from the URL`).not.toContain(modeSentinel);
    expect(sinks.body, `${mode}: rejected value is not echoed to the page`).not.toContain(modeSentinel);
    expect(consoleMessages.join('\n'), `${mode}: rejected value absent from logs`).not.toContain(modeSentinel);
    expect(JSON.stringify(server.requests.slice(requestStart)), `${mode}: rejected value absent from telemetry`).not.toContain(modeSentinel);
    expect(sinks.sharedCache, `${mode}: rejection leaves no shared-cache entry to harvest`).toBe(null);
    expect(sinks.local.keys.filter((key) => !key.startsWith('rlPortfolioWorkspaceV1.')), `${mode}: no storage key outside the private portfolio namespace`).toEqual([]);

    expect(browserRequests.length).toBeGreaterThan(0);
    expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
    expect(await page.evaluate(async () => !navigator.serviceWorker.controller && (await navigator.serviceWorker.getRegistrations()).length === 0)).toBe(true);
    if (mode === 'session') {
      await page.reload();
      await expect.poll(async () => page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__ ? window.__PORTFOLIO_DIAGNOSTICS__.currentPortfolioId : null)).toBe(before.currentPortfolioId);
    }
    outcomes.push(`${mode}:${after.generation}:${after.storageMode}:${sinks.localLive ? 'local-live' : 'local-blocked'}:${sinks.sessionLive ? 'session-live' : 'session-blocked'}`);
    await context.close();
  }
  expect(outcomes).toHaveLength(3);
  /* One scan closes the committed-artifacts sink for all three modes: every iteration above pushed
   * the same fixed prefix through a rejection. */
  const sentinelPaths = trackedPathsContaining(COMMITTED_ARTIFACT_SENTINEL);
  expect(sentinelPaths, 'no persistence mode leaks a rejected value into a tracked file').toEqual([...COMMITTED_ARTIFACT_ORIGINS]);
  console.log('[TP-01-05] modes=' + outcomes.join(','));
  console.log('[TP-01-05] durable=true');
  console.log('[TP-01-05] session=true');
  console.log('[TP-01-05] memory=true');
  console.log('[TP-01-05] priorRevisionPreserved=true');
  console.log('[TP-01-05] falseDurableClaim=false');
  console.log('[TP-01-05] sessionWarning=true');
  console.log('[TP-01-05] externalProviders=0');
  console.log('[TP-01-05] sinkScanModes=durable,session,memory');
  console.log('[TP-01-05] committedArtifactOrigins=' + sentinelPaths.join(','));
  console.log('[TP-01-05] sharedCacheEntry=absent');
});