import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { commitTrackedLeak, FIXTURE_ROOT, ROOT, startPortfolioServer, trackedPathsContaining } from './portfolio-survival.support.mjs';

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
  expect(projection.routes.map((entry) => entry.route).sort()).toEqual(['allocation', 'diversification', 'dossier', 'path-lab', 'risk-xray']);
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

/*
 * Scope 03 browser rows — TP-03-04 (SCN-008-011) and TP-03-05 (SCN-008-012).
 *
 * Two browser-layer vacuity modes have already shipped real green passes in this feature, so
 * both rows are written against them rather than around them:
 *
 *   1. A number read from the COMPLETION PREVIEW DRAFT instead of the committed PROJECTION
 *      renders identically whether or not anything was ever stored. Every count below is tied
 *      to the persisted bytes (`persistedWorkspace`) and re-asserted after a reload, which
 *      destroys draft state — a draft-fed counter collapses to zero there.
 *   2. `toContainText` is a prefix/substring check that survives appended content, so a real
 *      value can sit under a "none"/"empty" heading and still pass. Every emptiness claim uses
 *      exact text (`toHaveText`) or an explicit absence scan of the rendered block.
 *
 * Neither row intercepts a request: no page.route/context.route/msw/nock appears here, because
 * an intercepted row is a mocked row and cannot satisfy a live-stack e2e-ui DoD item.
 */
const BEHAVIOR_POLICY = JSON.parse(readFileSync(resolve(ROOT, 'portfolio-survival-allocation.config.json'), 'utf8')).behavior;

// Reads the workspace back out of the raw namespaced bytes rather than out of any app object,
// so a rendered count can be compared against what is genuinely on disk.
async function persistedWorkspace(page) {
  return page.evaluate(() => {
    const pointer = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'));
    return JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.' + pointer.activeSlot));
  });
}

async function previewCompletion(page, { category, subject, source = 'completed-research' }) {
  await page.locator('#behaviorCategory').selectOption(category);
  await page.locator('#behaviorSubject').fill(subject);
  await page.locator('#behaviorEvidenceSource').selectOption(source);
  await page.locator('#previewCompletion').click();
}

async function recordCompletion(page, options) {
  await previewCompletion(page, options);
  await expect(page.locator('#confirmCompletion')).toBeEnabled();
  await page.locator('#confirmCompletion').click();
}

const BEHAVIOR_EMPTY_INFLUENCE = 'Behavior-derived ranking influence · none';

/* Sentinels for the two categories a BEHAVIOR clear must preserve. Distinctive on purpose: the
 * assertions below compare bytes, so a clear that rewrote either key is not mistaken for a clear
 * that left it alone. Neither string carries a behavior subject, so the origin-request and
 * rendered-block sweeps at the end of the row stay meaningful. */
const PRESERVED_SESSION_FALLBACK = JSON.stringify({ sentinel: 'session-fallback-must-survive-behavior-clear' });
const PRESERVED_RETURN_CONTEXT = JSON.stringify({ sentinel: 'return-context-must-survive-behavior-clear' });

test('Regression: SCN-008-011 clear behavior removes ranking influence and preserves portfolio', async ({ page }) => {
  /* The declared evidence floor is two distinct completions on two distinct UTC dates. A run
   * confined to one wall-clock day could only ever render `floor-not-met`, so the scenario's
   * precondition — behavior-derived items CURRENTLY affect ranking — would never be established
   * and the clear would be asserted against a surface that never showed anything. The system
   * clock is moved between two real UTC dates; no request, response, or app function is stubbed. */
  await page.clock.install({ time: new Date('2026-05-04T09:15:00.000Z') });
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'SCN-008-011 portfolio');
  await previewMandate(page, 'mandate-explicit.json');
  await page.locator('#confirmMandate').click();
  await expect(page.locator('#currentMandate')).toContainText('sha256:');

  /* The two categories this row used to leave with no assertion at all. `quarantine` and
   * `session-fallback` both declare `cleared by all-personal`, so a BEHAVIOR clear must PRESERVE
   * them — and nothing here could see either one: the namespace guard at the end filters to keys
   * OUTSIDE `rlPortfolioWorkspaceV1.`, which excludes the quarantine key by construction, and it
   * reads `localStorage` alone, which never holds a session key. A behavior clear that widened
   * into either would have passed this row unchanged.
   *
   * Quarantine is stocked through the real corruption path rather than written by hand. The two
   * session keys are stocked directly, exactly as the public `rlData` cache below is: durable mode
   * neither writes nor reads them, which is what makes "still there afterwards" a claim about the
   * clear rather than about the app having rewritten them. */
  await populateQuarantine(page);
  await page.evaluate((stock) => {
    sessionStorage.setItem(stock.sessionKey, stock.sessionValue);
    sessionStorage.setItem(stock.returnContextKey, stock.returnContextValue);
  }, {
    sessionKey: STORAGE_POLICY.sessionKey,
    sessionValue: PRESERVED_SESSION_FALLBACK,
    returnContextKey: STORAGE_POLICY.returnContextKey,
    returnContextValue: PRESERVED_RETURN_CONTEXT
  });
  const before = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);

  /* A public generic cache owned by the other Research Lab tools. SCN-008-011 preserves it, and
   * a behavior clear that widened into `localStorage.clear()` would destroy it — so this is a
   * live regression, not a restatement of "this page never names that key". */
  await page.evaluate(() => localStorage.setItem('rlData', JSON.stringify({ watchlist: ['SPY', 'TLT'], toolReads: {} })));
  const publicCacheBefore = await page.evaluate(() => localStorage.getItem('rlData'));

  // Exact, not prefix: `· none` as a substring survives an appended ranked subject.
  await expect(page.locator('#behaviorInfluence')).toHaveText(BEHAVIOR_EMPTY_INFLUENCE);
  expect((await persistedWorkspace(page)).behaviorEvents).toEqual([]);

  /* Vacuity discriminator for mode 1: a preview is a draft and nothing else. If the influence
   * line were fed by the draft it would already report one completion here. */
  await previewCompletion(page, { category: 'ticker-research-completed', subject: 'msft' });
  await expect(page.locator('#completionPreview')).toContainText('msft');
  await expect(page.locator('#completionPreview')).toContainText('no event is recorded until you confirm');
  await expect(page.locator('#behaviorInfluence')).toHaveText(BEHAVIOR_EMPTY_INFLUENCE);
  expect((await persistedWorkspace(page)).behaviorEvents, 'a preview writes no event').toEqual([]);

  await expect(page.locator('#confirmCompletion')).toBeEnabled();
  await page.locator('#confirmCompletion').click();
  await expect(page.locator('#behaviorResult')).toContainText('Recorded one completed-research event');
  await recordCompletion(page, { category: 'risk-analysis-completed', subject: 'msft' });
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'bnd' });

  await page.clock.setSystemTime(new Date('2026-05-05T10:30:00.000Z'));
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'msft' });
  // Same condition, same subject, same UTC day: semantic de-duplication must refuse to grow evidence.
  await previewCompletion(page, { category: 'ticker-research-completed', subject: 'msft' });
  await page.locator('#confirmCompletion').click();
  await expect(page.locator('#behaviorResult')).toContainText('duplicate-completion');

  const persistedBefore = await persistedWorkspace(page);
  expect(persistedBefore.behaviorEvents, 'four distinct completions survive the same-day repeat').toHaveLength(4);
  /* The displayed number is asserted against the persisted array length, so a projection that
   * silently stopped tracking events cannot leave a stale literal on screen. */
  await expect(page.locator('#behaviorInfluence')).toHaveText(
    `Behavior-derived ranking influence · 2 ranked subjects · ${persistedBefore.behaviorEvents.length} eligible completions`);
  const rankedBefore = [
    '1 · msft · 3 completions · 2 UTC dates · 2 categories · floor-met',
    '2 · bnd · 1 completion · 1 UTC date · 1 category · floor-not-met'
  ];
  expect(await page.locator('#behaviorRankRows li').allInnerTexts()).toEqual(rankedBefore);
  expect(await page.locator('#behaviorRankRows li').evaluateAll((rows) => rows.map((row) => row.dataset.behaviorSubject)))
    .toEqual(['msft', 'bnd']);
  // FR-036: the versioned floor and decay inputs the ranking uses are visible, not implied.
  await expect(page.locator('#behaviorPolicyInputs')).toHaveText(
    'Declared relevance inputs · floor 2 completions on 2 UTC dates · half-life 14 days · maximum evidence age 56 days · policy portfolio-behavior-policy/v1');

  await page.locator('#openPrivacy').click();
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="behavior-events"]'))
    .toHaveText('behavior-events · 4 records · present · cleared by behavior-and-all-personal');
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="portfolio-revisions"]'))
    .toHaveText('portfolio-revisions · 1 record · present · cleared by all-personal');

  /* A reload destroys every draft. The same ranking rendering after it is what separates a
   * projection-derived surface from a preview-derived one. */
  await page.reload();
  await page.locator('#openPrivacy').click();
  expect(await page.locator('#behaviorRankRows li').allInnerTexts(), 'ranking survives a reload, so it is not draft-derived').toEqual(rankedBefore);

  /* Anti-vacuity for the preservation half: "still present after the clear" is trivially true of a
   * key that was never there. Presence is proven here first, by bytes, on BOTH adapters — the
   * session values are read back through `foundationKeyState`, which queries `sessionStorage`
   * directly, not through the `localStorage`-only guard this row already carried. */
  const preservedBefore = await foundationKeyState(page);
  expect(preservedBefore.values[STORAGE_POLICY.quarantineKey],
    'a real quarantine record exists before the behavior clear').not.toBeNull();
  expect(preservedBefore.values[STORAGE_POLICY.sessionKey],
    'the session fallback key genuinely holds its bytes before the behavior clear').toBe(PRESERVED_SESSION_FALLBACK);
  expect(preservedBefore.values[STORAGE_POLICY.returnContextKey],
    'the return context key genuinely holds its bytes before the behavior clear').toBe(PRESERVED_RETURN_CONTEXT);
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="quarantine"]'))
    .toHaveText('quarantine · 1 record · present · cleared by all-personal');
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="session-fallback"]'))
    .toHaveText('session-fallback · 2 records · present · cleared by all-personal');

  await expect(page.locator('#clearBehavior')).toBeDisabled();
  await page.locator('#clearBehaviorConfirmation').check();
  await expect(page.locator('#clearBehavior')).toBeEnabled();
  const generationBeforeClear = (await persistedWorkspace(page)).generation;
  await page.locator('#clearBehavior').click();
  await expect(page.locator('#privacyResult')).toContainText('Behavior history cleared');
  await expect(page.locator('#privacyResult')).toContainText('portfolio and mandate preserved');

  // Cleared, asserted exactly and as an absence — not as a heading a survivor could hide under.
  await expect(page.locator('#behaviorInfluence')).toHaveText(BEHAVIOR_EMPTY_INFLUENCE);
  expect(await page.locator('#behaviorRankRows li').count()).toBe(0);
  const behaviorBlockText = await page.locator('#behaviorEvidence').innerText();
  expect(behaviorBlockText, 'no cleared subject survives anywhere in the rendered behavior block').not.toMatch(/msft|bnd/i);
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="behavior-events"]'))
    .toHaveText('behavior-events · 0 records · empty · cleared by behavior-and-all-personal');
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="interest-signals"]'))
    .toHaveText('interest-signals · 0 records · empty · cleared by behavior-and-all-personal');

  /* The preservation half of the same column. Asserted by BYTES rather than by presence, so a
   * clear that widened into either key and rewrote it fails here just as loudly as one that
   * deleted it, and the rendered rows must still declare `all-personal` for both. */
  const preservedAfter = await foundationKeyState(page);
  expect(preservedAfter.values[STORAGE_POLICY.quarantineKey],
    'the quarantine record survives the behavior clear with its bytes unchanged')
    .toBe(preservedBefore.values[STORAGE_POLICY.quarantineKey]);
  expect(preservedAfter.values[STORAGE_POLICY.sessionKey],
    'the session fallback key survives the behavior clear with its bytes unchanged').toBe(PRESERVED_SESSION_FALLBACK);
  expect(preservedAfter.values[STORAGE_POLICY.returnContextKey],
    'the return context key survives the behavior clear with its bytes unchanged').toBe(PRESERVED_RETURN_CONTEXT);
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="quarantine"]'))
    .toHaveText('quarantine · 1 record · present · cleared by all-personal');
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="session-fallback"]'))
    .toHaveText('session-fallback · 2 records · present · cleared by all-personal');

  const persistedAfter = await persistedWorkspace(page);
  expect(persistedAfter.behaviorEvents, 'events are gone from the persisted bytes, not only from the view').toEqual([]);
  expect(persistedAfter.interestSignals).toEqual([]);
  expect(persistedAfter.actionOutcomes, 'this run recorded no action outcome, so none may appear after the clear').toEqual([]);

  /* Scoped to the sections the requirement names. A whole-workspace sweep would contradict the
   * scenario this row asserts: SCN-008-011 PRESERVES the portfolio and the mandate, and both
   * legitimately name the same tickers (holdings[].symbol, constraints[].subject). What must not
   * survive is a cleared subject inside a BEHAVIOR section, so the sweep is bare-token — stricter
   * than the quoted-value form it replaces — over exactly those sections. */
  const behaviorSections = {
    behaviorEvents: persistedAfter.behaviorEvents,
    interestSignals: persistedAfter.interestSignals,
    actionOutcomes: persistedAfter.actionOutcomes
  };
  expect(JSON.stringify(behaviorSections), 'no cleared subject survives in a stored behavior section').not.toMatch(/msft|bnd/i);
  /* The other half of the behavior surface: derived ranking state. The `innerText` sweep above
   * cannot see a subject parked in a dataset attribute, so the rows are read structurally too. */
  expect(await page.locator('#behaviorRankRows li').evaluateAll((rows) => rows.map((row) => row.dataset.behaviorSubject)),
    'no cleared subject survives in the derived ranking state').toEqual([]);

  // Preserved half: identity, not resemblance.
  const after = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(after.currentPortfolioId).toBe(before.currentPortfolioId);
  expect(after.revisionCount).toBe(before.revisionCount);
  expect(after.holdingCount).toBe(before.holdingCount);
  expect(after.currentMandateId).toBe(before.currentMandateId);
  expect(after.mandateRevisionCount).toBe(before.mandateRevisionCount);
  expect(after.generation, 'the clear is one new verified generation, not an in-place edit').toBe(generationBeforeClear + 1);
  expect(persistedAfter.currentPortfolioId).toBe(before.currentPortfolioId);
  expect(persistedAfter.currentMandateId).toBe(before.currentMandateId);

  /* Preservation asserted positively, not only as an absence. The narrowed behavior sweep above is
   * equally satisfied by a clear that destroyed the holdings and the constraints, so the values
   * that MUST survive are named here — including the two tickers the behavior sections may not
   * keep, which is precisely why the sweep had to be scoped rather than dropped. */
  const survivingHoldings = persistedAfter.portfolioRevisions
    .find((revision) => revision.portfolioId === persistedAfter.currentPortfolioId).holdings;
  expect(survivingHoldings.map((holding) => [holding.symbol, holding.quantity, holding.costBasis]).sort(),
    'the imported holdings survive the behavior clear intact').toEqual([['BND', 20, 1400], ['MSFT', 12, 3900]]);
  const survivingConstraints = persistedAfter.mandateRevisions
    .find((mandate) => mandate.mandateId === persistedAfter.currentMandateId).constraints;
  expect(survivingConstraints.map((entry) => [entry.subject, entry.constraintKind, entry.minimum, entry.maximum]),
    'the declared mandate constraints survive in declared order').toEqual([['MSFT', 'hard', null, 0.25], ['BND', 'hard', 0.1, null]]);

  await expect(page.locator('#currentRevision')).toContainText(before.currentPortfolioId);
  await expect(page.locator('#currentMandate')).toContainText(before.currentMandateId);

  // The mandate's constraints and dated cash need are still rendered on every dependent route.
  for (const route of MANDATE_ROUTES) {
    const panel = await visitRoute(page, route);
    await expect(panel.locator('[data-constraints]')).toContainText('MSFT');
    await expect(panel.locator('[data-constraints]')).toContainText('0.25');
    await expect(panel.locator('[data-cash-needs]')).toContainText('2031-06-30');
    await expect(panel.locator('[data-cash-needs]')).toContainText('40000');
  }

  const publicCacheAfter = await page.evaluate(() => ({
    shared: localStorage.getItem('rlData'),
    foreignKeys: Object.keys(localStorage).filter((key) => !key.startsWith('rlPortfolioWorkspaceV1.')).sort()
  }));
  expect(publicCacheAfter.shared, 'the public generic cache and watchlist are byte-identical').toBe(publicCacheBefore);
  expect(publicCacheAfter.foreignKeys, 'the behavior clear neither removes nor adds a key outside its namespace').toEqual(['rlData']);

  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  const requests = server.requests.slice(requestStart);
  expect(requests.every((entry) => entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(requests), 'no behavior subject leaves the origin').not.toMatch(/msft|bnd|ticker-research/i);

  console.log('[SCN-008-011] eligibleCompletionsBeforeClear=' + persistedBefore.behaviorEvents.length);
  console.log('[SCN-008-011] rankedSubjectsBeforeClear=2');
  console.log('[SCN-008-011] rankingOrderBeforeClear=msft,bnd');
  console.log('[SCN-008-011] floorMetBeforeClear=msft');
  console.log('[SCN-008-011] previewOnlyChangedProjection=false');
  console.log('[SCN-008-011] rankingSurvivedReload=true');
  console.log('[SCN-008-011] duplicateSameDayCompletion=rejected');
  console.log('[SCN-008-011] eligibleCompletionsAfterClear=' + persistedAfter.behaviorEvents.length);
  console.log('[SCN-008-011] interestSignalsAfterClear=' + persistedAfter.interestSignals.length);
  console.log('[SCN-008-011] portfolioPreserved=' + (after.currentPortfolioId === before.currentPortfolioId));
  console.log('[SCN-008-011] mandatePreserved=' + (after.currentMandateId === before.currentMandateId));
  console.log('[SCN-008-011] holdingsPreserved=' + survivingHoldings.map((holding) => holding.symbol).join(','));
  console.log('[SCN-008-011] mandateConstraintSubjectsPreserved=' + survivingConstraints.map((entry) => entry.subject).join(','));
  console.log('[SCN-008-011] clearedSubjectScope=behaviorEvents,interestSignals,actionOutcomes,rankingRows');
  console.log('[SCN-008-011] cashNeedsPreserved=true');
  console.log('[SCN-008-011] quarantinePreservedByBehaviorClear='
    + (preservedAfter.values[STORAGE_POLICY.quarantineKey] === preservedBefore.values[STORAGE_POLICY.quarantineKey]));
  console.log('[SCN-008-011] sessionFallbackPreservedByBehaviorClear='
    + (preservedAfter.values[STORAGE_POLICY.sessionKey] === PRESERVED_SESSION_FALLBACK
      && preservedAfter.values[STORAGE_POLICY.returnContextKey] === PRESERVED_RETURN_CONTEXT));
  console.log('[SCN-008-011] publicCacheByteIdentical=' + (publicCacheAfter.shared === publicCacheBefore));
  console.log('[SCN-008-011] foreignStorageKeys=' + publicCacheAfter.foreignKeys.join(','));
  console.log('[SCN-008-011] remotePersonalRequests=0');
});

test('Regression: SCN-008-012 behavior evidence excludes engagement and sensitive profiling', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await importValid(page, 'SCN-008-012 portfolio');

  /* Positive control. The claim under test is a negative — "no engagement, sensitive, or
   * cross-device data is stored" — and an implementation that recorded NOTHING AT ALL would
   * satisfy every refusal assertion below. One legitimate completion must genuinely be admitted
   * first, and a second must still be admitted after the whole refusal sweep, or the refusals
   * prove only that the form is dead. */
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'msft' });
  await expect(page.locator('#behaviorResult')).toContainText('Recorded one completed-research event');
  const control = await persistedWorkspace(page);
  expect(control.behaviorEvents, 'the recorder genuinely admits a completed research action').toHaveLength(1);
  expect(control.behaviorEvents[0].category).toBe('ticker-research-completed');
  expect(control.behaviorEvents[0].lifecycleState).toBe('eligible');
  const baseline = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);

  /* "pointer movement, dwell time, scroll depth, settings ... exist or can be observed" — so
   * they are genuinely produced here rather than argued about. Nothing below is a research
   * completion, so nothing below may become evidence. */
  await page.mouse.move(120, 200);
  await page.mouse.move(420, 380);
  await page.mouse.move(640, 120);
  await page.mouse.wheel(0, 900);
  await page.mouse.wheel(0, -400);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.locator('#workspaceTabRiskXray').click();
  await page.locator('#workspaceTabPathLab').click();
  await page.locator('#workspaceTabBrief').click();
  await page.locator('#openPrivacy').click();
  await page.locator('#openPrivacy').click();
  await page.locator('#exportAcknowledgement').check();
  await page.locator('#exportAcknowledgement').uncheck();
  await page.locator('#manualAssetType').selectOption('cash');
  await page.locator('#manualAssetType').selectOption('');
  // A real dwell period with the pointer resting on the surface. The wait is the stimulus
  // under test, not a timing crutch: dwell time is a duration, so it has to actually elapse.
  await page.mouse.move(300, 300);
  await page.waitForTimeout(300);
  const afterObservation = await persistedWorkspace(page);
  expect(afterObservation.behaviorEvents, 'pointer, scroll, dwell, tab, and settings activity create no event').toHaveLength(1);
  expect(afterObservation.generation, 'observed activity commits no workspace generation').toBe(baseline.generation);

  /* Every declared excluded source is ATTEMPTED through the real UI and must be refused by
   * name. Reading the offered list off the page and equating it to the policy's declared set
   * means the sweep cannot silently shrink to the two tokens that happen to be handled. */
  const offered = await page.locator('#behaviorEvidenceSource option[value^="excluded:"]')
    .evaluateAll((options) => options.map((option) => option.value.slice('excluded:'.length)));
  expect([...offered].sort(), 'the UI offers every declared excluded source as an attemptable input')
    .toEqual([...BEHAVIOR_POLICY.forbiddenEventFields].sort());
  const attempted = [];
  for (const token of offered) {
    await previewCompletion(page, { category: 'risk-analysis-completed', subject: 'bnd', source: `excluded:${token}` });
    await expect(page.locator('#behaviorResult')).toContainText('P008-SCHEMA-CORRUPT');
    await expect(page.locator('#behaviorResult')).toContainText('forbidden-behavior-source');
    await expect(page.locator('#behaviorResult')).toContainText(`draft.${token}`);
    await expect(page.locator('#confirmCompletion')).toBeDisabled();
    attempted.push(token);
  }
  expect(attempted, 'every offered excluded source was actually exercised').toHaveLength(BEHAVIOR_POLICY.forbiddenEventFields.length);
  expect(attempted.length).toBeGreaterThan(0);

  const afterAttempts = await persistedWorkspace(page);
  expect(afterAttempts.behaviorEvents, 'no refused attempt grew the stored evidence').toHaveLength(1);
  expect(afterAttempts.generation, 'no refused attempt committed a generation').toBe(baseline.generation);

  /* The claim under test is that an excluded source may not reach BEHAVIOR EVIDENCE, not that its
   * name may not exist anywhere. `costBasis` and `quantity` are declared HoldingEntry fields the
   * user imported, so a whole-workspace sweep would refuse the user's own portfolio. The sweep is
   * therefore scoped to the three sections that constitute the evidence payload. */
  const behaviorEvidenceText = JSON.stringify({
    behaviorEvents: afterAttempts.behaviorEvents,
    interestSignals: afterAttempts.interestSignals,
    actionOutcomes: afterAttempts.actionOutcomes
  }).toLowerCase();
  for (const token of BEHAVIOR_POLICY.forbiddenEventFields) {
    expect(behaviorEvidenceText, `no ${token} field or value reaches the stored behavior evidence`).not.toContain(token);
  }
  expect(behaviorEvidenceText, 'no observed engagement value is stored as behavior evidence').not.toContain('observed-excluded-value');
  /* Scoped, not vacuous. The payload is non-empty (one admitted event, asserted above) and the
   * colliding tokens genuinely exist in the workspace, so the sweep passes because the evidence is
   * clean — not because the value never existed anywhere to leak. */
  const importedHoldings = afterAttempts.portfolioRevisions
    .find((revision) => revision.portfolioId === afterAttempts.currentPortfolioId).holdings;
  expect(importedHoldings.some((holding) => typeof holding.costBasis === 'number' && typeof holding.quantity === 'number'),
    'costBasis and quantity really are imported holding fields, so the scoped sweep is meaningful').toBe(true);

  /* Positive control, second half: the refusals above are selective, not a dead form. */
  await recordCompletion(page, { category: 'path-analysis-completed', subject: 'msft' });
  await expect(page.locator('#behaviorResult')).toContainText('Recorded one completed-research event');
  const afterControl = await persistedWorkspace(page);
  expect(afterControl.behaviorEvents, 'a legitimate completion is still admitted after every refusal').toHaveLength(2);
  expect(afterControl.behaviorEvents.every((entry) => entry.lifecycleState === 'eligible')).toBe(true);
  expect(afterControl.behaviorEvents.every((entry) => BEHAVIOR_POLICY.eventCategories.includes(entry.category)),
    'only named completed-research categories contribute').toBe(true);
  // Quantify over the stored shape: an unlisted key is exactly the hidden profile field this denies.
  for (const entry of afterControl.behaviorEvents) {
    expect(Object.keys(entry).sort()).toEqual([
      'category', 'completionConditionId', 'contractVersion', 'dedupeKey', 'domain', 'eventId', 'horizon',
      'lifecycleState', 'occurredAt', 'policyVersion', 'resultIdentity', 'sourceSurface', 'subjectId', 'subjectKind'
    ]);
  }

  await page.locator('#openPrivacy').click();
  // Exact `0`, not a prefix: a substring check would pass on "0 excluded sources plus 3 inferred".
  await expect(page.locator('#privacyExcludedCount')).toHaveText('0');
  await expect(page.locator('#privacyProfileStatement')).toHaveText(
    'No cross-device identifier · no hidden profile · no engagement objective · ranking optimizes research relevance only');
  const declaredTokenText = await page.locator('#privacyExcludedTokens').innerText();
  for (const token of BEHAVIOR_POLICY.forbiddenEventFields) {
    expect(declaredTokenText, `the excluded-source inventory names ${token}`).toContain(token);
  }
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="behavior-events"]'))
    .toHaveText('behavior-events · 2 records · present · cleared by behavior-and-all-personal');
  await expect(page.locator('#privacyCategoryRows li[data-privacy-category="interest-signals"]'))
    .toHaveText('interest-signals · 0 records · empty · cleared by behavior-and-all-personal');

  /* Engagement wording is legitimate ONLY inside the declared exclusion inventory, which must
   * name the tokens it refuses. Everywhere else it would be an engagement objective. */
  const rankingText = await page.locator('#behaviorEvidence').innerText();
  const categoryText = await page.locator('#privacyCategoryRows').innerText();
  for (const surface of [rankingText, categoryText]) {
    expect(surface).not.toMatch(/engagement|dwell|scroll|click-through|time on site|session length|retention/i);
  }
  expect(rankingText, 'the ranking objective is stated as research relevance').toContain('research relevance');

  const traces = await page.evaluate(async () => ({
    cookie: document.cookie,
    foreignLocal: Object.keys(localStorage).filter((key) => !key.startsWith('rlPortfolioWorkspaceV1.')).sort(),
    session: Object.keys(sessionStorage).sort(),
    databases: typeof indexedDB.databases === 'function' ? (await indexedDB.databases()).map((entry) => entry.name) : [],
    serviceWorkers: (await navigator.serviceWorker.getRegistrations()).length
  }));
  expect(traces.cookie, 'no cross-device or identity cookie is written').toBe('');
  expect(traces.foreignLocal, 'no hidden profile namespace is created').toEqual([]);
  expect(traces.session, 'no session-scoped profile is created').toEqual([]);
  expect(traces.databases, 'no shadow profile store is created').toEqual([]);
  expect(traces.serviceWorkers, 'no background worker could carry a profile off-device').toBe(0);

  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  const requests = server.requests.slice(requestStart);
  expect(requests.every((entry) => entry.method === 'GET')).toBe(true);
  const requestText = JSON.stringify(requests).toLowerCase();
  for (const token of BEHAVIOR_POLICY.forbiddenEventFields) {
    expect(requestText, `no ${token} value leaves the origin`).not.toContain(token);
  }

  console.log('[SCN-008-012] legitimateCompletionsRecorded=' + afterControl.behaviorEvents.length);
  console.log('[SCN-008-012] excludedSourcesAttempted=' + attempted.length);
  console.log('[SCN-008-012] excludedSourcesDeclared=' + BEHAVIOR_POLICY.forbiddenEventFields.length);
  console.log('[SCN-008-012] excludedSourcesAccepted=0');
  console.log('[SCN-008-012] observedActivityEvents=0');
  console.log('[SCN-008-012] observedActivityGenerations=0');
  console.log('[SCN-008-012] storedExcludedTokens=0');
  console.log('[SCN-008-012] excludedTokenScope=behaviorEvents,interestSignals,actionOutcomes');
  console.log('[SCN-008-012] excludedSourceCountShown=0');
  console.log('[SCN-008-012] crossDeviceIdentifiers=0');
  console.log('[SCN-008-012] hiddenProfileNamespaces=0');
  console.log('[SCN-008-012] cookies=0');
  console.log('[SCN-008-012] indexedDbStores=0');
  console.log('[SCN-008-012] engagementCopyOutsideExclusionInventory=0');
  console.log('[SCN-008-012] remotePersonalRequests=0');
});

/*
 * TP-03-06 — the foundation/clear MATRIX.
 *
 * The row's description names four cells: behavior-only clear, full-personal clear, partial
 * deletion failure, and prior import/mandate preservation. Two of them — `#clearBehavior` and
 * the preservation half — are carried by the SCN-008-011 row above. The other two are carried
 * here, because before this pair the strings `emergencyClear`, `clearFoundationStorage`,
 * `Verified empty`, and `foundation-clear-incomplete` appeared NOWHERE in this file. An
 * eight-row green run said nothing whatever about them, which is exactly why a matrix claim
 * cannot be settled by counting rows.
 *
 * "Complete" is quantified on both axes the artifacts declare, not asserted:
 *   - the privacy categories, each checked against ITS OWN rendered `cleared by …` string
 *     rather than a table written into this test, with the category NAME set asserted exactly
 *     so a ninth category breaks the row instead of silently shrinking the sweep, and
 *   - the six declared foundation clear steps, each faulted on its own — never a subset —
 *     with an unfaulted control in the same harness proving the refusals are caused by the
 *     injected fault and not by a flow that always fails.
 *
 * Nothing here intercepts a request: no page.route/context.route/msw/nock, because an
 * intercepted row is a mocked row and cannot satisfy a live-stack e2e-ui DoD item. The fault
 * in the second row is injected into the browser's own storage DEVICE (`Storage.prototype`),
 * which is the environment the module talks to, not a stub of the module under test.
 */
const STORAGE_POLICY = JSON.parse(readFileSync(resolve(ROOT, 'portfolio-survival-allocation.config.json'), 'utf8')).storage;
const FOUNDATION_LOCAL_KEYS = Object.freeze([
  STORAGE_POLICY.pointerKey, ...STORAGE_POLICY.slotKeys, STORAGE_POLICY.quarantineKey
]);
const FOUNDATION_SESSION_KEYS = Object.freeze([STORAGE_POLICY.sessionKey, STORAGE_POLICY.returnContextKey]);
const FOUNDATION_KEYS = Object.freeze([...FOUNDATION_LOCAL_KEYS, ...FOUNDATION_SESSION_KEYS]);

/* Asserted exactly, on purpose. `clearedBy` below is read off the runtime so the test can never
 * disagree with the contract about what a category should DO; the name set is pinned here so the
 * matrix cannot quietly stop covering a category that someone adds. */
const DECLARED_PRIVACY_CATEGORIES = Object.freeze([
  'action-outcomes', 'allocations', 'behavior-events', 'cash-needs', 'dossiers', 'interest-signals',
  'mandate-revisions', 'portfolio-revisions', 'quarantine', 'scenarios', 'session-fallback'
]);

/* The closed vocabulary a `cleared by` verdict may draw from. Asserted as MEMBERSHIP, not as an
 * exact snapshot of the labels currently in use: which categories share a label is a product
 * decision the runtime owns and the per-row assertions check, whereas an unrecognised token means
 * a rendered row is telling an owner something this matrix cannot classify. */
const CLEAR_VOCABULARY = Object.freeze(['all-personal', 'behavior', 'behavior-and-all-personal']);

const PUBLIC_GENERIC_CACHE = JSON.stringify({ watchlist: ['SPY', 'TLT'], toolReads: {} });

// Reads the runtime's own per-category declaration out of the rendered row, including the
// `cleared by` verdict that decides which clear operation each category must obey.
async function declaredPrivacyMatrix(page) {
  const rendered = await page.locator('#privacyCategoryRows li').evaluateAll((items) => items.map((item) => ({
    datasetCategory: item.dataset.privacyCategory,
    text: item.textContent
  })));
  return rendered.map(({ datasetCategory, text }) => {
    const parsed = /^(\S+) · (\d+) records? · (present|empty) · cleared by (\S+)$/.exec(text);
    if (!parsed) throw new Error(`unparsable privacy category row: ${text}`);
    if (parsed[1] !== datasetCategory) throw new Error(`row label ${parsed[1]} disagrees with dataset ${datasetCategory}`);
    return { category: datasetCategory, recordCount: Number(parsed[2]), present: parsed[3] === 'present', clearedBy: parsed[4] };
  });
}

async function foundationKeyState(page) {
  return page.evaluate((keys) => {
    const state = {};
    for (const key of keys.local) state[key] = localStorage.getItem(key);
    for (const key of keys.session) state[key] = sessionStorage.getItem(key);
    return {
      values: state,
      presentKeys: Object.keys(state).filter((key) => state[key] !== null).sort(),
      foreignLocalKeys: Object.keys(localStorage).filter((key) => !key.startsWith('rlPortfolioWorkspaceV1.')).sort()
    };
  }, { local: [...FOUNDATION_LOCAL_KEYS], session: [...FOUNDATION_SESSION_KEYS] });
}

// Populates every category this page can genuinely reach: an imported portfolio, an explicit
// mandate with its dated cash need, and committed completed-research evidence.
async function populateFoundation(page, label) {
  await importValid(page, label);
  await previewMandate(page, 'mandate-explicit.json');
  await page.locator('#confirmMandate').click();
  await expect(page.locator('#currentMandate')).toContainText('sha256:');
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'msft' });
  await recordCompletion(page, { category: 'risk-analysis-completed', subject: 'bnd' });
}

/*
 * `quarantine` is the one all-personal category backed by a RAW storage key rather than a
 * workspace array, and no normal action produces it. It is produced through the real corruption
 * path — corrupt bytes, reopen, quarantine written — and the good bytes are then restored, so the
 * clear afterwards runs against a workspace that still holds a portfolio, a mandate, and behavior
 * evidence at the same time as a quarantine record.
 */
async function populateQuarantine(page) {
  const goodSlot = await page.evaluate(() => {
    const pointer = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'));
    const key = 'rlPortfolioWorkspaceV1.' + pointer.activeSlot;
    const value = localStorage.getItem(key);
    localStorage.setItem(key, '{ not json');
    return { key, value };
  });
  await page.reload();
  await expect.poll(async () => (await foundationKeyState(page)).values[STORAGE_POLICY.quarantineKey],
    'corrupt bytes are quarantined by the real open path').not.toBeNull();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), goodSlot);
  await page.reload();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

test('Regression: TP-03-06 full-personal clear empties every declared category and leaves the generic public cache byte-identical', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);
  await populateFoundation(page, 'TP-03-06 portfolio');
  await populateQuarantine(page);

  await page.evaluate((cache) => localStorage.setItem('rlData', cache), PUBLIC_GENERIC_CACHE);
  await page.locator('#openPrivacy').click();

  const before = await declaredPrivacyMatrix(page);
  expect(before.map((entry) => entry.category).sort(),
    'the rendered matrix covers exactly the declared privacy categories').toEqual([...DECLARED_PRIVACY_CATEGORIES]);
  const observedVocabulary = [...new Set(before.map((entry) => entry.clearedBy))].sort();
  expect(observedVocabulary.filter((token) => !CLEAR_VOCABULARY.includes(token)),
    'every category declares a clear operation from the closed vocabulary').toEqual([]);
  expect(observedVocabulary.length,
    'the rendered rows must not collapse to one constant label, or the per-row verdicts below are indistinguishable')
    .toBeGreaterThan(1);

  /* The precondition that makes the emptiness claim mean anything: a clear that runs against an
   * already-empty store would satisfy every assertion below without deleting a thing. */
  const populated = before.filter((entry) => entry.present).map((entry) => entry.category).sort();
  expect(populated, 'the categories this page can reach are genuinely populated before the clear')
    .toEqual(['behavior-events', 'cash-needs', 'mandate-revisions', 'portfolio-revisions', 'quarantine']);
  const storageBefore = await foundationKeyState(page);
  expect(storageBefore.presentKeys.length, 'real foundation keys exist to be removed').toBeGreaterThan(0);

  await page.locator('#emergencyClear').click();

  // Exact, not a prefix: `Verified empty` as a substring survives an appended "… 2 keys retained".
  await expect(page.locator('#privacyResult')).toHaveText(`Verified empty · ${FOUNDATION_KEYS.length} closed foundation keys checked`);
  await expect(page.locator('#privacyInventory')).toHaveText(
    '0 Feature 008 personal storage keys present · 0 unavailable to inspect · values never rendered');

  /* The whole matrix, cell by cell, against each category's OWN declaration. Every category is
   * cleared by an operation that includes all-personal, so after this clear every one of them
   * must read empty — including the three that survive a behavior clear. */
  const after = await declaredPrivacyMatrix(page);
  expect(after.map((entry) => entry.category).sort()).toEqual([...DECLARED_PRIVACY_CATEGORIES]);
  for (const entry of after) {
    const declaration = before.find((row) => row.category === entry.category);
    expect(entry.clearedBy, `${entry.category} keeps its declared clear operation`).toBe(declaration.clearedBy);
    expect(declaration.clearedBy, `${entry.category} declares an operation the full-personal clear performs`)
      .toMatch(/all-personal/);
    await expect(page.locator(`#privacyCategoryRows li[data-privacy-category="${entry.category}"]`))
      .toHaveText(`${entry.category} · 0 records · empty · cleared by ${entry.clearedBy}`);
  }

  const storageAfter = await foundationKeyState(page);
  expect(storageAfter.presentKeys, 'no declared foundation key survives the full-personal clear').toEqual([]);

  /* The positive half. An absence sweep alone cannot tell "the declared keys were removed" from
   * "the device was wiped" — a `localStorage.clear()` implementation passes every assertion above.
   * The generic cache another Research Lab tool owns is the discriminator, and it is asserted by
   * bytes rather than by presence. */
  expect(storageAfter.foreignLocalKeys, 'the clear neither removes nor adds a key outside its namespace').toEqual(['rlData']);
  expect(await page.evaluate(() => localStorage.getItem('rlData')),
    'the generic public cache and watchlist are byte-identical across the full-personal clear').toBe(PUBLIC_GENERIC_CACHE);

  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl)).toBe(true);
  const requests = server.requests.slice(requestStart);
  expect(requests.every((entry) => entry.method === 'GET')).toBe(true);
  expect(JSON.stringify(requests), 'no personal subject leaves the origin').not.toMatch(/msft|bnd/i);

  console.log('[TP-03-06] declaredCategories=' + DECLARED_PRIVACY_CATEGORIES.join(','));
  console.log('[TP-03-06] populatedBeforeFullPersonalClear=' + populated.join(','));
  console.log('[TP-03-06] foundationKeysPresentBefore=' + storageBefore.presentKeys.join(','));
  console.log('[TP-03-06] clearedKeyCountReported=' + FOUNDATION_KEYS.length);
  console.log('[TP-03-06] categoriesEmptyAfterFullPersonalClear=' + after.length);
  console.log('[TP-03-06] foundationKeysPresentAfter=' + storageAfter.presentKeys.length);
  console.log('[TP-03-06] publicCacheByteIdentical=true');
  console.log('[TP-03-06] foreignStorageKeys=' + storageAfter.foreignLocalKeys.join(','));
  console.log('[TP-03-06] remotePersonalRequests=0');
});

test('Regression: TP-03-06 every declared foundation clear step refuses success on its own and retains only its own key', async ({ browser }) => {
  /* This test opens a FRESH browser context per arm — one control plus one per declared
   * foundation key — so its cost scales with FOUNDATION_KEYS, not with a single page load.
   * Measured alone it runs ~26s against Playwright's 30s default, i.e. it consumes ~87% of
   * the default budget and tips over it under full-suite load. It has failed in a full run
   * while passing in isolation for exactly that reason.
   *
   * The budget is raised HERE rather than globally on purpose: a global raise would blunt
   * timeout-based failure detection for the other 310 tests to accommodate one legitimately
   * expensive test. The cost is inherent to the fault-injection matrix, not a slow assertion,
   * so the honest fix is to state this test's real budget and leave the strict default in
   * force everywhere else. */
  test.setTimeout(120_000);
  const observed = [];
  const retentionProven = [];
  // `null` is the control arm. Without it a refusal proves nothing: a flow that always failed
  // would satisfy all six faulted arms.
  for (const faultKey of [null, ...FOUNDATION_KEYS]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    if (faultKey !== null) {
      /* One declared step is faulted, by name, at the storage device. Every other remove still
       * succeeds, which is what makes this a PARTIAL deletion failure rather than a blocked
       * store — the distinction the assertions below turn on. */
      await page.addInitScript((key) => {
        const original = Storage.prototype.removeItem;
        Storage.prototype.removeItem = function (name) {
          if (name === key) throw new Error('remove blocked');
          return original.call(this, name);
        };
      }, faultKey);
    }
    await openRoute(page);
    await populateFoundation(page, 'TP-03-06 fault portfolio');
    await populateQuarantine(page);
    await page.evaluate((cache) => localStorage.setItem('rlData', cache), PUBLIC_GENERIC_CACHE);
    await page.locator('#openPrivacy').click();

    const before = await foundationKeyState(page);
    expect(before.presentKeys, `${faultKey ?? 'control'}: real foundation keys exist to be removed`)
      .toEqual([...FOUNDATION_LOCAL_KEYS].sort());
    await page.locator('#emergencyClear').click();
    const after = await foundationKeyState(page);

    if (faultKey === null) {
      await expect(page.locator('#privacyResult')).toHaveText(`Verified empty · ${FOUNDATION_KEYS.length} closed foundation keys checked`);
      expect(after.presentKeys, 'control: an unfaulted clear removes every declared key').toEqual([]);
    } else {
      await expect(page.locator('#privacyResult')).toHaveText('P008-STORE-WRITE · foundation-clear-incomplete');
      // No success payload may reach the surface on a partial deletion.
      expect(await page.locator('#privacyResult').innerText()).not.toContain('Verified empty');
      // Targeted, not blanket: every step except the faulted one still deleted.
      expect(after.presentKeys.filter((key) => key !== faultKey),
        `${faultKey}: the other declared steps still delete`).toEqual([]);
      /* Retention is only observable for a step whose key durable mode actually holds. The two
       * session keys are absent here, so their arms prove the refusal but NOT retention; that
       * split is asserted below rather than left for a reader to assume. */
      if (before.values[faultKey] !== null) {
        expect(after.values[faultKey], `${faultKey}: the retained key survives with its bytes unchanged`)
          .toBe(before.values[faultKey]);
        expect(after.presentKeys, `${faultKey}: exactly one declared key survives`).toEqual([faultKey]);
        retentionProven.push(faultKey);
      }
    }
    expect(await page.evaluate(() => localStorage.getItem('rlData')),
      `${faultKey ?? 'control'}: the generic public cache is untouched`).toBe(PUBLIC_GENERIC_CACHE);

    observed.push(`${faultKey ?? 'control'}:${after.presentKeys.length}`);
    await context.close();
  }
  expect(observed, 'every declared clear step was faulted on its own, not a subset').toHaveLength(FOUNDATION_KEYS.length + 1);
  /* Named, not counted. Durable mode holds the four local keys, so those four arms prove
   * retention; the two session keys are unreachable in this mode, so their arms are refusal-only
   * and are recorded as such instead of being folded into a coverage number. */
  expect(retentionProven.sort(), 'retention is proven for exactly the durable-mode foundation keys')
    .toEqual([...FOUNDATION_LOCAL_KEYS].sort());

  console.log('[TP-03-06] declaredClearSteps=' + FOUNDATION_KEYS.join(','));
  console.log('[TP-03-06] faultedStepsIndividually=' + FOUNDATION_KEYS.length);
  console.log('[TP-03-06] unfaultedControlSucceeded=true');
  console.log('[TP-03-06] partialFailureArms=' + observed.join(','));
  console.log('[TP-03-06] retentionProvenSteps=' + retentionProven.join(','));
  console.log('[TP-03-06] refusalOnlySteps=' + FOUNDATION_SESSION_KEYS.join(','));
  console.log('[TP-03-06] successPayloadOnPartialFailure=0');
});

/* ═══════════ Feature 008 Scope 04 — public evidence barrier (TP-04-05) ═══════════ */

test('Regression: SCN-008-005 TP-04-05 personal state coexists with the shared cache and the only published read is the constant privacy boundary', async ({ page }) => {
  const requestStart = server.requests.length;
  const browserRequests = await openRoute(page);

  /* The precondition that makes the barrier claim mean anything: real personal state must EXIST
   * locally while the public cache is read. A barrier asserted over an empty workspace proves
   * nothing, because there would be nothing available to leak. */
  await populateFoundation(page, 'TP-04-05 portfolio');
  const workspace = await persistedWorkspace(page);
  expect(workspace.portfolioRevisions.length, 'local personal state genuinely exists before the barrier is read').toBeGreaterThan(0);

  const published = await page.evaluate(() => {
    const cache = JSON.parse(localStorage.getItem('rlData') || '{}');
    return cache.toolReads || {};
  });

  /* The tool is NOT a registered shared-cache participant yet — registration is Scope 16 — so the
   * barrier is that nothing personal reaches the public cache, not that a record must appear.
   * Publishing on load was tried and reverted: it broke Scope 03's committed byte-identity
   * assertion and created a cache entry the rejection-path rows require to be absent. What the
   * module MAY publish is pinned at unit level by TP-04-03/04, which prove RLDATA's own contract
   * check accepts the constant boundary record and nothing richer. */
  const ids = Object.keys(published);
  for (const id of ids) {
    const record = published[id].v ?? published[id];
    expect(record.availability, `any read this tool publishes is unavailable by contract: ${id}`).toBe('unavailable');
    expect(record.metrics?.personalDataIncluded, `any read this tool publishes declares no personal data: ${id}`).toBe(false);
  }

  /* The whole point: the personal values that demonstrably exist locally must not appear anywhere
   * in the shared public cache, in any request URL, or in the address bar. */
  const publicState = JSON.stringify(published);
  for (const secret of ['MSFT', 'BND', 'TP-04-05 portfolio', 'costBasis', 'holdings', 'rlPortfolioWorkspace']) {
    expect(publicState.includes(secret), `the shared public cache must not carry ${secret}`).toBe(false);
  }

  const requests = server.requests.slice(requestStart);
  expect(requests.every((entry) => entry.method === 'GET'), 'the barrier issues no mutating request').toBe(true);
  expect(JSON.stringify(requests), 'no personal subject appears in any request the page made').not.toMatch(/msft|bnd|costbasis/i);
  expect(browserRequests.every((url) => new URL(url).origin === server.baseUrl), 'every request stayed same-origin').toBe(true);
  expect(page.url(), 'no personal subject reaches the address bar').not.toMatch(/msft|bnd|costbasis/i);

  console.log('[TP-04-05] publishedToolReadIds=' + (ids.join(',') || '(none — registration is Scope 16)'));
  console.log('[TP-04-05] localPortfolioRevisions=' + workspace.portfolioRevisions.length);
  console.log('[TP-04-05] sentinelsInPublicCache=0');
  console.log('[TP-04-05] offOriginRequests=0');
});

/* TP-04-06 / SCN-008-035. The failure this guards is the comfortable one: a holding whose evidence
   is absent quietly renders as zero, as the last value it had, or as the portfolio average, so the
   surface looks complete and the reader cannot tell which numbers are earned. Every phase therefore
   asserts BOTH that the affected holding is named AND that no substitute stands in for it. */
const TRUTH_ROW = '#truthRows li';

async function truthRows(page) {
  return page.$$eval(TRUTH_ROW, (nodes) => nodes.map((node) => ({
    symbol: node.getAttribute('data-symbol'),
    priceState: node.getAttribute('data-price-state'),
    factorState: node.getAttribute('data-factor-state'),
    confidence: node.getAttribute('data-confidence'),
    valueIncluded: node.getAttribute('data-value-included') === 'true',
    text: node.textContent
  })));
}

async function seedBars(page, symbol, { ageMs = 0 } = {}) {
  await page.evaluate(({ sym, age }) => {
    const rows = [
      { t: Date.UTC(2026, 3, 28), c: 100 },
      { t: Date.UTC(2026, 3, 29), c: 101 },
      { t: Date.UTC(2026, 3, 30), c: 102 }
    ];
    window.RLDATA.putBars(sym, '1d', rows, 'tp-04-06-fixture');
    if (age > 0) {
      // Age the RECORD, not the span, so the surface must distinguish "old reading" from "short history".
      const cache = JSON.parse(window.localStorage.getItem('rlData'));
      cache.bars[sym]['1d'].at = Date.now() - age;
      window.localStorage.setItem('rlData', JSON.stringify(cache));
    }
  }, { sym: symbol, age: ageMs });
}

test('Regression: SCN-008-035 partial data corrupt schema and localStorage disabled preserve truth', async ({ page }) => {
  await openRoute(page);
  await importValid(page, 'TP-04-06 partial truth');

  // Phase A — no bar evidence at all. Both holdings must be excluded BY NAME.
  let rows = await truthRows(page);
  expect(rows.map((row) => row.symbol).sort(), 'both imported holdings must be reported').toEqual(['BND', 'MSFT']);
  for (const row of rows) {
    expect(row.priceState, `${row.symbol} has no cached bars, so its price cannot be current`).toBe('missing');
    expect(row.valueIncluded, `${row.symbol} must be excluded, not valued`).toBe(false);
    expect(row.confidence).toBe('unavailable');
    expect(row.text).toContain('excluded from valuation, no substitute applied');
    // The substitution ban, stated positively: no stand-in number may appear on an unevidenced row.
    expect(row.text, `${row.symbol} must not carry a substituted number`).not.toMatch(/value included|\b0(\.0+)?\b|average/i);
  }
  await expect(page.locator('#truthSummary')).toContainText('0 of 2 holdings carry usable price evidence');
  await expect(page.locator('#truthSummary')).toContainText('2 excluded for missing evidence');

  // Phase B — evidence for MSFT only. The valid row must survive independently of the missing one.
  await seedBars(page, 'MSFT');
  await page.reload();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
  rows = await truthRows(page);
  const msft = rows.find((row) => row.symbol === 'MSFT');
  const bnd = rows.find((row) => row.symbol === 'BND');
  expect(msft.priceState, 'a freshly cached full series reads as current').toBe('current');
  expect(msft.valueIncluded, 'the evidenced holding must remain valued').toBe(true);
  expect(bnd.priceState, 'the unevidenced holding must stay missing beside a valid one').toBe('missing');
  expect(bnd.valueIncluded, 'one holding gaining evidence must not value another').toBe(false);
  expect(bnd.text).toContain('excluded from valuation, no substitute applied');
  await expect(page.locator('#truthSummary')).toContainText('1 of 2 holdings carry usable price evidence');

  // The imported fixture carries no factor tags, so a missing factor must be named on its own axis
  // and must NOT be allowed to masquerade as a price problem.
  expect(msft.factorState).toBe('missing');
  expect(msft.text).toContain('factor tags missing');
  expect(msft.confidence, 'a missing factor reduces confidence without invalidating the price').toBe('reduced');

  // Phase C — age the MSFT record. Stale must be said out loud, with the observation date.
  await seedBars(page, 'MSFT', { ageMs: 1000 * 60 * 60 * 24 * 45 });
  await page.reload();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
  rows = await truthRows(page);
  const stale = rows.find((row) => row.symbol === 'MSFT');
  expect(stale.priceState, 'an aged cache record must read stale, never current').toBe('stale');
  expect(stale.text, 'a stale row must name the observation it is actually resting on').toContain('2026-04-30');
  expect(stale.valueIncluded, 'stale evidence is still evidence — the row stays valued and labelled').toBe(true);

  // Non-vacuity: the summary count and the rendered rows must agree. If any phase had substituted a
  // value for an unevidenced holding, valuedCount would exceed the rows actually marked as included.
  const summaryText = await page.locator('#truthSummary').textContent();
  const claimedValued = Number(summaryText.match(/^(\d+) of/)[1]);
  expect(claimedValued, 'the headline count must equal the rows that are genuinely valued')
    .toBe(rows.filter((row) => row.valueIncluded).length);

  // Phase D — corrupt schema in the active slot. Whatever survives must be a REAL revision; the
  // corrupt bytes must never become holding rows, and no row may gain a substituted value because
  // its neighbour was lost. Asserting "rows come from the last valid revision OR there are none"
  // covers both legitimate atomic-slot outcomes without guessing which one fires.
  await page.evaluate(() => {
    const pointer = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'));
    localStorage.setItem('rlPortfolioWorkspaceV1.' + pointer.activeSlot, '{ not json');
  });
  await page.reload();
  await expect.poll(async () => (await foundationKeyState(page)).values[STORAGE_POLICY.quarantineKey],
    'the corrupt slot must travel the real quarantine path, not be silently discarded').not.toBeNull();
  const afterCorruption = await truthRows(page);
  for (const row of afterCorruption) {
    expect(['MSFT', 'BND'], 'no holding row may be synthesised from corrupt bytes').toContain(row.symbol);
    if (!row.valueIncluded) {
      expect(row.text).toContain('excluded from valuation, no substitute applied');
    }
  }
  const corruptSummary = await page.locator('#truthSummary').textContent();
  expect(corruptSummary.includes('Holding evidence unavailable') || /^\d+ of \d+ holdings/.test(corruptSummary),
    'after corruption the surface must either state unavailability or report a real revision').toBe(true);

  // Phase E — storage degraded to session-only. Truth must still render and still not substitute.
  const sessionPage = await page.context().newPage();
  await blockStorage(sessionPage, 'session');
  await sessionPage.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  await expect(sessionPage.locator('#storageMode')).toContainText('Session-only');
  await expect(sessionPage.locator('#truthSummary'), 'with no durable revision the surface states unavailability rather than inventing rows')
    .toContainText('Holding evidence unavailable');
  expect(await sessionPage.$$(TRUTH_ROW), 'no holding rows may be fabricated without a revision').toHaveLength(0);
  await sessionPage.close();

  console.log('[TP-04-06] phaseA excluded=2 substituted=0');
  console.log('[TP-04-06] phaseB valued=1 missingBesideValid=BND');
  console.log('[TP-04-06] phaseC staleNamed=MSFT lastObservation=2026-04-30');
  console.log(`[TP-04-06] phaseD quarantined=true syntheticRows=0 rows=${afterCorruption.length}`);
  console.log('[TP-04-06] phaseE sessionOnly rows=0 unavailableStated=true');
});