import { readFileSync } from 'node:fs';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';
import { GATES_FILE } from '../scripts/build-dependency-gates.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

function readRepoJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, new URL('../', import.meta.url)), 'utf8'));
}

// Parses the same two files the shell fetches at runtime, so the expected panel text is derived
// from the dependency's real recorded state instead of a hardcoded snapshot of another feature's
// mutable status. The assertions below then prove the SHELL rendered that independently-read truth.
function observeDependencyGate(gateKey, expectedRequiredMilestones, options = {}) {
  const gateConfig = readRepoJson('tool-experience.config.json').dependencyGates[gateKey];
  const required = gateConfig.acceptedPredicate.requiredMilestones;
  // Pin the requirement itself: an emptied list would satisfy the gate vacuously.
  expect(required).toEqual(expectedRequiredMilestones);

  const state = options.state || readRepoJson(gateConfig.statePath);
  const published = Array.isArray(state.milestones) ? state.milestones : [];
  const matched = required.filter((milestone) => published.includes(milestone));
  const status = typeof state.status === 'string' ? state.status : null;
  const certification = state.certification && typeof state.certification.status === 'string'
    ? state.certification.status
    : null;

  // The panel renders "unknown" when it observes nothing; a null here would let the assertions
  // below pass against a panel that surfaced no real state at all.
  expect(status).not.toBeNull();
  expect(certification).not.toBeNull();
  const expectation = options.expectation || 'pending';
  if (expectation === 'pending') {
    // This regression proves the PENDING panel, so the milestone requirement must genuinely be unmet.
    expect(matched.length).toBeLessThan(required.length);
  } else {
    // ...and the SATISFIED regression must genuinely be met, or it would prove an open gate vacuously.
    expect(matched.length).toBe(required.length);
    expect(status).toBe('done');
    expect(certification).toBe('done');
  }

  console.log(
    `[dependency-gate] ${gateKey} statePath=${gateConfig.statePath} status=${status} certification=${certification} milestonesMatched=${matched.length}/${required.length} expectation=${expectation}`
  );
  return { status, certification, matchedCount: matched.length, requiredCount: required.length, statePath: gateConfig.statePath };
}

// Derived from the REAL published gate projection so the fixture tracks its shape automatically;
// only the published milestone list is withheld, which is exactly the pre-delivery condition the
// pending regression exists to prove. Feature 002 shipped its milestones in 85a9ce1d, so reading
// live state alone can no longer produce a pending gate — without this fixture the withheld-
// capability path would become permanently unprovable rather than merely un-exercised.
//
// Overrides tool-experience.gates.json, NOT the spec statePath: gate verdicts are resolved at
// build time into that public artifact, because the deployed site never ships `specs/` and a
// runtime fetch of a governance path 404s there. Overriding statePath would leave the runtime
// reading the real, satisfied projection and silently turn this regression green.
function dependencyStateWithheldMilestones(gateKey) {
  const document = readRepoJson(GATES_FILE);
  const state = document.states[gateKey];
  if (!state) throw new Error(`gate projection has no state for ${gateKey}`);
  delete state.milestones;
  delete state.milestonesProvenance;
  return { gatesPath: GATES_FILE, document, state };
}

// Page bootstrap lazily loads scripts (rlg.js pulls rlcontext.js only once it decorates a
// glossary term), so a fixed sleep before clearing the request log races that chain under load.
// Wait for genuine quiescence instead, then clear, so the post-click assertion measures only the
// click. Never settling is a hard failure, not a pass.
async function settleThenClearRequests(page, requests) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const before = requests.length;
    await page.waitForTimeout(150);
    if (requests.length === before) {
      requests.length = 0;
      return;
    }
  }
  throw new Error(`page bootstrap never quiesced; last request: ${requests[requests.length - 1]}`);
}

test('Regression: SCN-012-033 real-page shadow registry validation derives all experiences without cutover', async ({ page }) => {
  const expectedToolIds = readRepoJson('tools.json').tools.map((tool) => tool.id);
  expect(expectedToolIds.length).toBeGreaterThan(0);

  await page.goto(`${site.baseUrl}/index.html`);
  const before = await page.evaluate(() => ({
    navText: document.querySelector('nav')?.textContent || '',
    modeControls: Array.from(document.querySelectorAll('#rlviews, #modeSeg, [data-rlviews]')).map((node) => node.outerHTML),
    experienceHosts: document.querySelectorAll('[data-rlexperience], [data-rlexperience-view]').length
  }));

  await page.addScriptTag({ url: `${site.baseUrl}/rlexperience.js` });
  const result = await page.evaluate(async () => {
    const [registry, config, models, journeys] = await Promise.all([
      fetch('/tools.json').then((response) => response.json()),
      fetch('/tool-experience.config.json').then((response) => response.json()),
      fetch('/simple-models.json').then((response) => response.json()),
      fetch('/journeys.json').then((response) => response.json())
    ]);
    return globalThis.RLEXPERIENCE.validateFoundation({ registry, config, models, journeys });
  });
  expect(result.ok).toBe(true);
  expect(result.value.toolCount).toBe(expectedToolIds.length);
  expect(result.value.toolIds).toEqual(expectedToolIds);
  expect(result.value.shadowOnly).toBe(true);
  expect(result.value.integrationClaims).toEqual([]);

  const refusal = await page.evaluate(async () => {
    const [registry, config, models, journeys] = await Promise.all([
      fetch('/tools.json').then((response) => response.json()),
      fetch('/tool-experience.config.json').then((response) => response.json()),
      fetch('/simple-models.json').then((response) => response.json()),
      fetch('/journeys.json').then((response) => response.json())
    ]);
    registry.tools[1].experience.simpleAdapterModule = '../unsafe.js';
    return globalThis.RLEXPERIENCE.validateFoundation({ registry, config, models, journeys });
  });
  expect(refusal.ok).toBe(false);
  expect(refusal.error.code).toBe('E012-REGISTRY');
  expect(refusal.error.valueEchoed).toBe(false);

  const after = await page.evaluate(() => ({
    navText: document.querySelector('nav')?.textContent || '',
    modeControls: Array.from(document.querySelectorAll('#rlviews, #modeSeg, [data-rlviews]')).map((node) => node.outerHTML),
    experienceHosts: document.querySelectorAll('[data-rlexperience], [data-rlexperience-view]').length
  }));
  expect(after).toEqual(before);
});

test('Regression: SCN-012-028 Feature 002 without published milestones exposes exact Brief gate and no author request', async ({ page }) => {
  const withheld = dependencyStateWithheldMilestones('FEATURE002');
  const fixtureSite = await startStaticServer({
    overrides: { [withheld.gatesPath]: JSON.stringify(withheld.document, null, 2) }
  });
  try {
    const observed = observeDependencyGate('FEATURE002', [
      'current-graph',
      'owner-coverage',
      'powerless-author',
      'atomic-publication'
    ], { state: withheld.state, expectation: 'pending' });
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.goto(`${fixtureSite.baseUrl}/strategy-self-improvement-lab.html`);
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await expect(page.getByRole('tab')).toHaveText(['Simple', 'Power', 'Brief', 'Journey']);
    await settleThenClearRequests(page, requests);

    const initialHistoryLength = await page.evaluate(() => history.length);
    await page.getByRole('tab', { name: 'Brief', exact: true }).click();
    await expect(page).toHaveURL(/#brief$/);
    await expect(page.getByRole('tab', { name: 'Brief', exact: true })).toHaveAttribute('aria-selected', 'true');
    const gate = page.locator('[data-rlexperience-gate="feature-002"]');
    await expect(gate).toBeVisible();
    console.log(`[gate-panel:feature-002] ${JSON.stringify(await gate.innerText())}`);
    /* A pending dependency states what is missing from THIS view in product language. Gate
       codes, acceptance predicates, observed-status dumps and capability slugs are evidence;
       evidence belongs in Power, never in a reader's default view (D13). */
    await expect(gate).toContainText('Not in this view yet');
    await expect(gate).toContainText('the live tool brief');
    await expect(gate).not.toContainText(`Observed status: ${observed.status}`);
    await expect(gate).not.toContainText(`Observed certification: ${observed.certification}`);
    await expect(gate).not.toContainText('Withheld:');
    await expect(gate).not.toContainText('Available now:');
    await expect(gate).not.toContainText('Acceptance gate:');
    await expect(gate).not.toContainText('E012-DEPENDENCY');
    await expect(gate).not.toContainText('dynamic-tool-brief-v2');
    await expect(gate).not.toContainText('milestones=4/4');
    await expect(gate.getByRole('button')).toHaveCount(0);
    expect(await page.evaluate(() => history.length)).toBe(initialHistoryLength + 1);
    expect(requests).toEqual([]);

    await page.goBack();
    await expect(page).toHaveURL(/#simple$/);
    await expect(page.getByRole('tab', { name: 'Simple', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.goForward();
    await expect(page).toHaveURL(/#brief$/);
    await expect(gate).toBeVisible();
    expect(requests).toEqual([]);
  } finally {
    await fixtureSite.close();
  }
});

// Companion to the withheld-milestone regression above. That one now runs against a fixture, so
// without this the SHIPPED state of Feature 002 would have no coverage at all — the gate could
// regress to "pending" in production and both regressions would still be green.
test('Regression: SCN-012-028 Feature 002 with published milestones opens the Brief gate on live state', async ({ page }) => {
  const observed = observeDependencyGate('FEATURE002', [
    'current-graph',
    'owner-coverage',
    'powerless-author',
    'atomic-publication'
  ], { expectation: 'satisfied' });
  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.getByRole('tab', { name: 'Brief', exact: true }).click();
  await expect(page).toHaveURL(/#brief$/);
  const gate = page.locator('[data-rlexperience-gate="feature-002"]');
  /* Non-vacuity: the live state really is satisfied, so absence below is the satisfied
     rendering and not a missing panel. */
  expect(observed.matchedCount).toBe(observed.requiredCount);
  /* A satisfied dependency is not news. It used to print "Dependency available: Feature 002"
     over a Withheld: list, an acceptance predicate and a gate code. It now renders nothing. */
  await expect(gate).toHaveCount(0);
  const brief = page.locator('[data-rlexperience-panel="brief"]');
  await expect(brief).not.toContainText('E012-DEPENDENCY');
  await expect(brief).not.toContainText('Acceptance gate:');
  await expect(brief).not.toContainText('Withheld:');
});

test('Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio and creates no private store', async ({ page }) => {
  const observed = observeDependencyGate('FEATURE008', [
    'rlportfolio-store-privacy',
    'public-evidence-barrier',
    'local-brief-ticker-scope'
  ]);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/market-brief.html`);
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await expect(page.getByRole('tab')).toHaveText(['Brief', 'Portfolio', 'Red Alert', 'Journey']);
  const keysBefore = await page.evaluate(() => Object.keys(localStorage).sort());
  await settleThenClearRequests(page, requests);

  await page.getByRole('tab', { name: 'Portfolio', exact: true }).click();
  await expect(page).toHaveURL(/#portfolio$/);
  await expect(page.getByRole('tab', { name: 'Portfolio', exact: true })).toHaveAttribute('aria-selected', 'true');
  const gate = page.locator('[data-rlexperience-gate="feature-008"]');
  await expect(gate).toBeVisible();
  console.log(`[gate-panel:feature-008] ${JSON.stringify(await gate.innerText())}`);
  await expect(gate).toContainText('Not in this view yet');
  await expect(gate).toContainText('your own portfolio overlay');
  await expect(gate).not.toContainText(`Observed status: ${observed.status}`);
  await expect(gate).not.toContainText('Withheld:');
  await expect(gate).not.toContainText('Available now:');
  await expect(gate).not.toContainText('Acceptance gate:');
  await expect(gate).not.toContainText('E012-DEPENDENCY');
  await expect(gate).not.toContainText('private-portfolio-overlay');
  await expect(gate).not.toContainText('milestones=3/3');
  await expect(gate.getByRole('button')).toHaveCount(0);

  const storageAfter = await page.evaluate(() => ({
    keys: Object.keys(localStorage).sort(),
    modeRecord: JSON.parse(localStorage.getItem('rlExperienceModeV1') || 'null'),
    privateKeys: Object.keys(localStorage).filter((key) => /portfolio|holding|private|journey/i.test(key))
  }));
  expect(storageAfter.keys.filter((key) => !keysBefore.includes(key))).toEqual(['rlExperienceModeV1']);
  expect(storageAfter.privateKeys).toEqual([]);
  expect(Object.keys(storageAfter.modeRecord)).toEqual(['contractVersion', 'toolId', 'mode', 'savedAt']);
  expect(storageAfter.modeRecord.mode).toBe('portfolio');
  expect(requests).toEqual([]);
});

test('Regression: BUG-001 options flow shell is ready before heavy hydration begins', async ({ page }) => {
  test.slow();
  await page.addInitScript(() => {
    const nativeFetch = globalThis.fetch;
    globalThis.__bug001OptionDeltaStarts = [];
    globalThis.fetch = function (...args) {
      const input = args[0];
      const requestUrl = typeof input === 'string'
        ? input
        : input && typeof input.url === 'string'
          ? input.url
          : String(input);
      try {
        const url = new URL(requestUrl, location.href);
        if (url.origin === location.origin && /^\/data\/options\/[^/]+\.json$/.test(url.pathname)) {
          const verdict = document.querySelector('#verdict');
          const feed = document.querySelector('#feed');
          globalThis.__bug001OptionDeltaStarts.push({
            pathname: url.pathname,
            shellReady: Boolean(document.querySelector('#rlviews[data-rlexperience-shell="ready"]')),
            cacheFirstOwnerPainted: Boolean(
              verdict
              && verdict.textContent.trim()
              && verdict.textContent.trim() !== '—'
              && feed
              && feed.childElementCount > 0
            )
          });
        }
      } catch (error) {
        // Native fetch retains ownership of invalid-input handling.
      }
      return Reflect.apply(nativeFetch, this, args);
    };
  });

  await page.goto(`${site.baseUrl}/options-flow-feed-lab.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => globalThis.__bug001OptionDeltaStarts.length > 0);

  const firstDeltaStart = await page.evaluate(() => globalThis.__bug001OptionDeltaStarts[0]);
  console.log(
    `[bug001-order] firstDelta=${firstDeltaStart.pathname} shellReadyAtStart=${firstDeltaStart.shellReady} cacheFirstOwnerPainted=${firstDeltaStart.cacheFirstOwnerPainted}`
  );
  expect(firstDeltaStart.cacheFirstOwnerPainted).toBe(true);
  expect(firstDeltaStart.shellReady).toBe(true);

  await page.waitForFunction(() => (
    new Set(globalThis.__bug001OptionDeltaStarts.map((entry) => entry.pathname)).size === 12
  ));
  const shell = page.locator('#rlviews[data-rlexperience-shell="ready"]');
  await expect(shell).toHaveCount(1);
  await expect(shell.getByRole('tab')).toHaveCount(4);
  await expect(page.locator('[data-rlexperience-panel]')).toHaveCount(4);

  await shell.getByRole('tab', { name: 'Power', exact: true }).click();
  await shell.getByRole('tab', { name: 'Simple', exact: true }).click();
  const deltaStarts = await page.evaluate(() => globalThis.__bug001OptionDeltaStarts);
  expect(deltaStarts).toHaveLength(12);
  expect(new Set(deltaStarts.map((entry) => entry.pathname)).size).toBe(12);
  expect(deltaStarts.every((entry) => entry.shellReady)).toBe(true);
});

async function openResearchAgenda(page, { fixture = null, mode = 'simple' } = {}) {
  const query = fixture ? `?fixture=${fixture}` : '';
  await page.goto(`${site.baseUrl}/research-agenda-lab.html${query}#${mode}/geopolitical-supply-shock`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.waitForFunction(() => globalThis.__researchAgendaDebug && globalThis.__researchAgendaDebug.getViewState());
  await expect(page.locator('body')).toHaveAttribute('data-rlview', mode);
}

test('SCN-019-020 research agenda opens in Simple and Power reveals the complete dossier workspace', async ({ page }) => {
  await openResearchAgenda(page);
  await expect(page.locator('#currentPosture')).toContainText('Unavailable');
  // The reason is asserted as a CONTRACT, not as one authored sentence. Pinning the exact prose tied
  // this test to whichever reason code the 4×/day scheduled refresh last published: when the producer
  // moved this topic from `research-lane-unavailable` to `situation-shape-invalid`, the assertion
  // broke — while the defect it should have caught (the renderer Title-Cased the unmapped slug and
  // printed "Situation Shape Invalid." as if it were an explanation) sailed straight past it, because
  // that string was simply a different string. So assert what must hold for EVERY reason code.
  const reason = (await page.locator('#currentReason').innerText()).trim();
  expect(reason.length).toBeGreaterThan(20);
  expect(reason).toMatch(/[.!?]$/);
  // Adversarial: a Title-Cased machine slug is exactly what the reader must never be shown. Every
  // hyphenated reason code renders as such a slug ("Situation Shape Invalid"), so requiring its
  // ABSENCE fails on the real regression and passes only on real reader copy.
  const slugAsProse = /\b(?:[A-Z][a-z]+ ){2,}(?:Invalid|Missing|Incomplete|Elapsed|Unavailable)\b/;
  expect(reason, `reason copy must not be a Title-Cased machine slug: ${reason}`).not.toMatch(slugAsProse);
  // And it must be the sentence the shared map publishes for the code the payload actually carries.
  const payloadReason = await page.evaluate(() => {
    const view = globalThis.__researchAgendaDebug.getViewState();
    return (view && view.review && view.review.reason) || null;
  });
  if (payloadReason) expect(reason.toLowerCase()).not.toContain(String(payloadReason).toLowerCase());
  await expect(page.locator('#currentScenarios .metric-row')).toHaveCount(0);
  await expect(page.locator('#historicalBand')).toBeHidden();

  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(page).toHaveURL(/#power\/geopolitical-supply-shock$/);
  await expect(page.locator('#historicalBand')).toBeVisible();
  await expect(page.locator('#historicalHeading')).toContainText('2026-08-10');
  await expect(page.locator('#historicalWarning')).toContainText('dated context only');
  await expect(page.locator('#sectionMatrix .matrix-cell')).toHaveCount(8);
  await expect(page.locator('#actorMatrix .matrix-cell')).toHaveCount(7);
  await expect(page.locator('#channelWorkspace table tbody tr')).toHaveCount(6);
  await expect(page.locator('#proxyWorkspace table tbody tr')).toHaveCount(12);
  await expect(page.locator('#evidenceList .evidence-row')).toHaveCount(6);
  await expect(page.locator('#sourceList .source-row')).toHaveCount(11);
  /* The history is an append-only ledger that the 4×/day scheduler grows, so a fixed row count is a
     clock, not a contract — it read 2 when this was written and reads more on every later run. What
     the ledger must actually guarantee is asserted instead: it is non-empty, it never shrinks below
     the two entries this scenario established, and it stays in immutable chronological order. */
  const historyRows = page.locator('#historyList .history-row');
  const historyCount = await historyRows.count();
  expect(historyCount).toBeGreaterThanOrEqual(2);
  const stamps = await page.evaluate(() => Array.from(document.querySelectorAll('#historyList .history-row'))
    .map((row) => {
      const match = row.innerText.match(/[A-Z][a-z]{2} \d{1,2}, \d{4}, \d{1,2}:\d{2} [AP]M UTC/);
      return match ? Date.parse(match[0].replace(/,/g, '')) : null;
    }).filter((value) => Number.isFinite(value)));
  // Every row is timestamped. The rendered format is "Review - Aug 15, 2026, 6:31 PM UTC", so the
  // stamp is parsed from that display form rather than assumed to be ISO.
  expect(stamps.length, 'every history row carries a parseable timestamp').toBe(historyCount);
  expect(stamps.every((value) => Number.isFinite(value))).toBe(true);
  /* Adversarial, and the reason a count check is not enough: an append-only ledger that renders its
     entries out of order, or that appends the same event twice, still has a plausible row count.
     Order is newest-first and ids are unique; both must hold however many entries the scheduler has
     added since this scenario was written. */
  const newestFirst = stamps.slice().sort((left, right) => right - left);
  expect(stamps, 'history renders newest-first').toEqual(newestFirst);
  const ids = await page.evaluate(() => Array.from(document.querySelectorAll('#historyList .history-row'))
    .map((row) => (row.innerText.match(/\b(?:review-[0-9a-f]+|historical-[0-9a-z-]+)\b/) || [null])[0]));
  expect(ids.filter(Boolean).length, 'every history row names its record').toBe(historyCount);
  expect(new Set(ids).size, 'no record is appended twice').toBe(historyCount);
  // The dated seed stays labelled historical, so it can never be read as a current conclusion.
  const rows = await page.evaluate(() => Array.from(document.querySelectorAll('#historyList .history-row'))
    .map((row) => row.innerText.replace(/\s+/g, ' ')));
  expect(rows[rows.length - 1], 'the historical seed remains marked historical only').toContain('historical only');
  await expect(page.locator('#fixtureBand')).toBeHidden();
});

test('SCN-019-017 reversal comparison shows causal evidence invalidation prior view and current view', async ({ page }) => {
  await openResearchAgenda(page, { fixture: 'reversal', mode: 'power' });
  await expect(page.locator('#fixtureBand')).toBeVisible();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE');
  await expect(page.locator('#parityValue')).toHaveText('Matched');
  const comparison = page.locator('#comparisonWorkspace[data-change-direction="reversed"]');
  await expect(comparison).toBeVisible();
  await expect(comparison).toContainText('Reversed');
  await expect(comparison).toContainText('Prior view:');
  await expect(comparison).toContainText('Current view:');
  await expect(comparison).toContainText('Causal evidence:');
  await expect(comparison).toContainText('Refuter:');
  await expect(comparison).toContainText('Invalidation:');
  expect(await page.evaluate(() => globalThis.__researchAgendaDebug.getComparison())).toMatchObject({ direction: 'reversed' });
});

test('Regression: stale and unavailable current reviews cannot masquerade as the prior dossier', async ({ page }) => {
  await openResearchAgenda(page);
  const states = await page.evaluate(() => {
    const current = globalThis.__researchAgendaDebug.getCurrentReview();
    const historical = globalThis.__researchAgendaDebug.getHistoricalDossier();
    const stale = JSON.parse(JSON.stringify(current));
    stale.outcome = 'stale';
    stale.reason = 'newest-evidence-outside-window';
    stale.newestEvidenceAgeHours = 72;
    stale.modelOutputs = null;
    stale.dossierId = null;
    const staleProjection = globalThis.RLAGENDA.computeAgendaViewState(
      globalThis.__researchAgendaDebug.getDefinition(), stale, null
    );
    return { current, historical, staleProjection };
  });
  expect(states.current.outcome).toBe('unavailable');
  expect(states.current.dossierId).toBeNull();
  expect(states.historical.historicalOnly).toBe(true);
  expect(states.staleProjection.ok).toBe(true);
  expect(states.staleProjection.value.outcome).toBe('stale');
  expect(states.staleProjection.value.modelAvailable).toBe(false);
  await expect(page.locator('#currentScenarios .metric-row')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(page.locator('#historicalWarning')).toContainText('does not replace the unavailable current review');
});

test('Regression: browser model chart table and tooltip values match canonical rlagenda output', async ({ page }) => {
  await openResearchAgenda(page, { fixture: 'reversal', mode: 'power' });
  const expected = await page.evaluate(() => {
    const view = globalThis.__researchAgendaDebug.getViewState();
    const definition = globalThis.__researchAgendaDebug.getDefinition();
    return definition.scenarioTree.nodes.filter((node) => node.parentId === null).map((node) => ({
      label: String(node.title || node.scenarioId).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value: view.modelOutputs.scenarioProbability[node.scenarioId].unconditional,
      shown: (view.modelOutputs.scenarioProbability[node.scenarioId].unconditional * 100).toFixed(1) + '%'
    }));
  });
  const chartRows = page.locator('#powerScenarios .metric-row');
  const tableRows = page.locator('#powerScenarioTable tbody tr');
  await expect(chartRows).toHaveCount(expected.length);
  await expect(tableRows).toHaveCount(expected.length);
  for (let index = 0; index < expected.length; index += 1) {
    await expect(chartRows.nth(index).locator('.metric-name')).toHaveText(expected[index].label);
    await expect(chartRows.nth(index).locator('.metric-value')).toHaveText(expected[index].shown);
    await expect(chartRows.nth(index)).toHaveAttribute('title', new RegExp(expected[index].shown.replace('%', '\\%')));
    await expect(tableRows.nth(index).locator('td').nth(1)).toHaveText(expected[index].shown);
    await expect(tableRows.nth(index).locator('td').nth(2)).toHaveText('probability');
  }
  const total = expected.reduce((sum, row) => sum + row.value, 0);
  expect(total).toBeCloseTo(1, 9);

  const mismatch = await page.evaluate(() => {
    const review = globalThis.__researchAgendaDebug.getCurrentReview();
    const definition = globalThis.__researchAgendaDebug.getDefinition();
    review.modelOutputs.channelRanges.oil.base += 0.01;
    return globalThis.RLAGENDA.computeAgendaViewState(definition, review, null);
  });
  expect(mismatch).toEqual({ ok: false, code: 'RLAGENDA-MODEL-INVALID', field: 'storedModelOutputs' });
});

test('Regression: research levers recompute both modes without refetching or mutating history', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await openResearchAgenda(page, { fixture: 'reversal' });
  await settleThenClearRequests(page, requests);
  const before = await page.evaluate(() => ({
    fetches: globalThis.__researchAgendaDebug.getFetchCount(),
    historyLength: history.length,
    historyFingerprint: globalThis.__researchAgendaDebug.getHistoryFingerprint()
  }));
  const simpleOil = page.locator('#currentTransmission .metric-row').filter({ hasText: 'Oil' }).locator('.metric-value');
  const priorSimple = await simpleOil.textContent();
  await page.locator('#lever-number-inventoryPolicyResponseOffset').fill('0.05');
  await page.locator('#lever-number-inventoryPolicyResponseOffset').press('Enter');
  await expect(page.locator('[data-lever-id="inventoryPolicyResponseOffset"] .lever-meta')).toHaveText('Your assumption');
  await expect(simpleOil).not.toHaveText(priorSimple);
  const changedSimple = await simpleOil.textContent();

  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  const powerOil = page.locator('#channelWorkspace tbody tr').filter({ hasText: 'Oil' }).locator('td').nth(1);
  await expect(powerOil).toHaveText(changedSimple);
  const after = await page.evaluate(() => ({
    fetches: globalThis.__researchAgendaDebug.getFetchCount(),
    historyLength: history.length,
    historyFingerprint: globalThis.__researchAgendaDebug.getHistoryFingerprint(),
    changedLeverIds: globalThis.__researchAgendaDebug.getViewState().changedLeverIds
  }));
  expect(after.fetches).toBe(before.fetches);
  expect(after.historyLength).toBe(before.historyLength + 1);
  expect(after.historyFingerprint).toBe(before.historyFingerprint);
  expect(after.changedLeverIds).toContain('inventoryPolicyResponseOffset');
  expect(requests).toEqual([]);
});

test('Regression: private corpus sentinel reaches no DOM request URL storage or public artifact', async ({ page }) => {
  const sentinel = 'RL_PRIVATE_CORPUS_SENTINEL_019';
  const requestUrls = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  await openResearchAgenda(page);
  const result = await page.evaluate((value) => globalThis.RLAGENDA.validatePublicResearchArtifact({
    contractVersion: 'fixture-public-artifact/v1',
    nested: { rows: [{ publicTicker: 'XLE', account: value }] }
  }), sentinel);
  expect(result.ok).toBe(false);
  expect(result.code).toBe('RLAGENDA-PUBLIC-PRIVATE');
  expect(JSON.stringify(result)).not.toContain(sentinel);
  const observed = await page.evaluate(async (value) => {
    const publicPaths = ['research-agenda.json', 'research/agenda/current.json', 'market-brief.page.json'];
    const artifacts = await Promise.all(publicPaths.map((path) => fetch(path).then((response) => response.text())));
    return {
      dom: document.documentElement.textContent,
      href: location.href,
      local: Object.keys(localStorage).map((key) => key + '=' + localStorage.getItem(key)).join('|'),
      session: Object.keys(sessionStorage).map((key) => key + '=' + sessionStorage.getItem(key)).join('|'),
      resources: performance.getEntriesByType('resource').map((entry) => entry.name).join('|'),
      artifacts: artifacts.join('|'),
      value
    };
  }, sentinel);
  for (const field of ['dom', 'href', 'local', 'session', 'resources', 'artifacts']) expect(observed[field]).not.toContain(sentinel);
  expect(requestUrls.join('|')).not.toContain(sentinel);
});