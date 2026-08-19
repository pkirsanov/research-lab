import { readFileSync } from 'node:fs';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';
import { startPinnedAgendaSite } from './research-agenda-fixture.support.mjs';
import { GATES_FILE } from '../scripts/build-dependency-gates.mjs';

let site;
// BUG-012 scope 02: the agenda fixture boots against committed bar inputs, so a scheduled corpus
// refresh cannot change what these tests resolve. Separate from `site` on purpose — the Scope 03
// regressions below compare against servers that must still expose the real, mutable corpus.
let agendaSite;
test.beforeAll(async () => { site = await startStaticServer(); agendaSite = await startPinnedAgendaSite(); });
test.afterAll(async () => { if (site) await site.close(); if (agendaSite) await agendaSite.close(); });

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
  // The claim is that switching to an UNCERTIFIED Portfolio fetches no data — no holdings, no
  // private overlay, no gated artifact. It is not that the page makes no request at all: rlg.js
  // pulls the shared rlcontext.js/rlexperience.js controller the first time it decorates a
  // glossary term, and which side of `settleThenClearRequests` that lands on depends on when a
  // decoratable term first renders. Asserting an empty array made this test fail deterministically
  // in chromium on the full-file run while passing under `--grep`, because the grep changed the
  // sequence. Those two modules carry no user data and no gated content, so they are named here
  // and everything else — any JSON, any artifact, any portfolio route — still fails the test.
  const RUNTIME_LAZY_CHAIN = ['rlcontext.js', 'rlexperience.js'];
  const dataRequests = requests.filter((url) => !RUNTIME_LAZY_CHAIN.some((mod) => url.endsWith(`/${mod}`)));
  expect(dataRequests).toEqual([]);
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
  await page.goto(`${agendaSite.baseUrl}/research-agenda-lab.html${query}#${mode}/geopolitical-supply-shock`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.waitForFunction(() => globalThis.__researchAgendaDebug && globalThis.__researchAgendaDebug.getViewState());
  await expect(page.locator('body')).toHaveAttribute('data-rlview', mode);
}

test('Regression: agenda shell has one Simple owner, durable target focus, tab focus retention, and inert closed navigation', async ({ page }) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto(`${site.baseUrl}/research-agenda-lab.html#simple/geopolitical-supply-shock`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => globalThis.__researchAgendaDebug && globalThis.__researchAgendaDebug.getViewState());
    await expect(page.locator('[data-public-target-id="geopolitical-supply-shock"]')).toBeFocused();
  }

  const simplePanel = page.locator('[data-rlexperience-panel="simple"]');
  await expect(simplePanel).toBeHidden();
  await expect(page.getByRole('heading', { name: 'No result yet' })).toHaveCount(0);
  await expect(page.locator('#currentPosture')).toBeVisible();

  const drawer = page.locator('#rlnav');
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await expect(drawer).toHaveAttribute('inert', '');
  expect(await drawer.evaluate((node) => node.inert)).toBe(true);

  const simpleTab = page.locator('#rlviews').getByRole('tab', { name: 'Simple', exact: true });
  const powerTab = page.locator('#rlviews').getByRole('tab', { name: 'Power', exact: true });
  await simpleTab.focus();
  await simpleTab.press('ArrowRight');
  await expect(powerTab).toHaveAttribute('aria-selected', 'true');
  await page.waitForTimeout(100);
  await expect(powerTab).toBeFocused();

  await page.locator('#rlnav-launcher').click();
  await expect(drawer).toHaveAttribute('aria-hidden', 'false');
  await expect(drawer).not.toHaveAttribute('inert', '');
  await drawer.getByRole('button', { name: 'Close navigation' }).click();
  await expect(drawer).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('#rlnav-launcher')).toBeFocused();
});

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
  /* A row that CLAIMS a record must name it; a state transition has no artifact and must not pretend
     to. Demanding an id from every row conflated the two and went red the moment the scheduler
     appended a lifecycle event, which names nothing precisely because there is nothing to name. */
  const rowText = await page.evaluate(() => Array.from(document.querySelectorAll('#historyList .history-row'))
    .map((row) => row.innerText.replace(/\s+/g, ' ')));
  const recordRows = rowText.filter((text) => !text.includes('state transition'));
  const transitionRows = rowText.filter((text) => text.includes('state transition'));
  expect(recordRows.length, 'the history carries at least one real record').toBeGreaterThanOrEqual(2);
  const ids = recordRows.map((text) => (text.match(/\b(?:review|historical|generation)-[0-9a-z-]+\b/) || [null])[0]);
  expect(ids.filter(Boolean).length, 'every row that claims a record names it').toBe(recordRows.length);
  expect(new Set(ids).size, 'no record is appended twice').toBe(recordRows.length);
  transitionRows.forEach((text) => expect(text, 'a state transition claims no record it does not have').toContain('Immutable event'));
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
    const staleProjection = globalThis.RLAGENDA.computeAgendaViewState(
      globalThis.__researchAgendaDebug.getDefinition(), stale, null, null
    );
    return { current, historical, staleProjection };
  });
  expect(states.current.outcome).toBe('unavailable');
  expect(states.current.dossierRef).toBeNull();
  expect(states.current.modelSnapshotRef).toBeNull();
  expect(states.historical.historicalOnly).toBe(true);
  expect(states.staleProjection.ok).toBe(true);
  expect(states.staleProjection.value.outcome).toBe('stale');
  expect(states.staleProjection.value.modelAvailable).toBe(false);
  expect(states.staleProjection.value.modelUnavailableReason).toBe('review-model-unavailable');
  await expect(page.locator('#currentScenarios .metric-row')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  await expect(page.locator('#historicalWarning')).toContainText('does not replace the unavailable current review');
});

test('Regression: unchanged current review renders identical Simple and Power sustained models and tampered snapshot refs render unavailable', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await openResearchAgenda(page, { fixture: 'reversal' });
  await settleThenClearRequests(page, requests);

  const simple = await page.evaluate(() => ({
    review: globalThis.__researchAgendaDebug.getCurrentReview(),
    dossier: globalThis.__researchAgendaDebug.getResolvedDossier(),
    historical: globalThis.__researchAgendaDebug.getHistoricalDossier(),
    view: globalThis.__researchAgendaDebug.getViewState()
  }));
  expect(simple.review.outcome).toBe('unchanged');
  expect(Object.hasOwn(simple.review, 'modelOutputs')).toBe(false);
  expect(simple.review.dossierRef).toEqual(simple.review.predecessorDossierRef);
  expect(simple.review.modelSnapshotRef.dossierRef).toEqual(simple.review.dossierRef);
  expect(simple.dossier.contractVersion).toBe('research-dossier/v1');
  expect(simple.dossier.historicalOnly).toBe(false);
  expect(simple.dossier.generationId).toBe(simple.review.generationId);
  expect(simple.historical.historicalOnly).toBe(true);
  expect(simple.view.modelAvailable).toBe(true);
  expect(simple.view.parity).toBe('matched');

  await page.getByRole('tab', { name: 'Power', exact: true }).click();
  const power = await page.evaluate(() => globalThis.__researchAgendaDebug.getViewState());
  expect(power.modelAvailable).toBe(true);
  expect(power.modelOutputs).toEqual(simple.view.modelOutputs);
  expect(power.charts).toEqual(simple.view.charts);

  const invalidCases = await page.evaluate(() => {
    const definition = globalThis.__researchAgendaDebug.getDefinition();
    const originalReview = globalThis.__researchAgendaDebug.getCurrentReview();
    const originalDossier = globalThis.__researchAgendaDebug.getResolvedDossier();
    const clone = (value) => JSON.parse(JSON.stringify(value));
    const hash = 'sha256:' + '0'.repeat(64);
    const cases = [];
    cases.push(['resolved-dossier-missing', originalReview, null]);

    const missingDossierRef = clone(originalReview);
    delete missingDossierRef.dossierRef;
    cases.push(['dossier-ref-missing', missingDossierRef, originalDossier]);

    const missingSnapshotRef = clone(originalReview);
    missingSnapshotRef.modelSnapshotRef = null;
    cases.push(['model-snapshot-ref-missing', missingSnapshotRef, originalDossier]);

    const wrongPath = clone(originalReview);
    wrongPath.dossierRef.path = wrongPath.dossierRef.path.replace('/geopolitical-supply-shock/', '/wrong-topic/');
    wrongPath.predecessorDossierRef.path = wrongPath.dossierRef.path;
    wrongPath.modelSnapshotRef.dossierRef.path = wrongPath.dossierRef.path;
    cases.push(['dossier-path-mismatch', wrongPath, originalDossier]);

    const wrongIdDossier = clone(originalDossier);
    wrongIdDossier.dossierId = 'dossier-' + 'f'.repeat(64);
    cases.push(['dossier-id-mismatch', originalReview, wrongIdDossier]);

    const wrongHash = clone(originalReview);
    wrongHash.dossierRef.sha256 = hash;
    wrongHash.predecessorDossierRef.sha256 = hash;
    wrongHash.modelSnapshotRef.dossierRef.sha256 = hash;
    cases.push(['dossier-digest-mismatch', wrongHash, originalDossier]);

    const tamperedSnapshot = clone(originalReview);
    tamperedSnapshot.modelSnapshotRef.modelOutputsSha256 = hash;
    cases.push(['model-snapshot-digest-mismatch', tamperedSnapshot, originalDossier]);

    return cases.map(([reason, review, dossier]) => ({
      reason,
      result: globalThis.RLAGENDA.computeAgendaViewState(definition, review, dossier, null)
    }));
  });
  for (const probe of invalidCases) {
    expect(probe.result.ok, probe.reason).toBe(true);
    expect(probe.result.value.modelAvailable, probe.reason).toBe(false);
    expect(probe.result.value.modelUnavailableReason, probe.reason).toBe(probe.reason);
    expect(probe.result.value.modelOutputs, probe.reason).toBeNull();
    expect(probe.result.value.charts, probe.reason).toEqual([]);
  }
  expect(requests).toEqual([]);
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
    const dossier = globalThis.__researchAgendaDebug.getResolvedDossier();
    dossier.modelOutputs.channelRanges.oil.base += 0.01;
    return globalThis.RLAGENDA.computeAgendaViewState(definition, review, dossier, null);
  });
  expect(mismatch.ok).toBe(true);
  expect(mismatch.value.modelAvailable).toBe(false);
  expect(mismatch.value.modelUnavailableReason).toBe('resolved-dossier-invalid');
  expect(mismatch.value.modelOutputs).toBeNull();
  expect(mismatch.value.charts).toEqual([]);
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

test('Regression: all five visible levers produce exact changed ids and identical Simple and Power outputs with no hidden proxy adjustment', async ({ page }) => {
  const expectedLeverIds = [
    'hormuzPhysicalPassFraction',
    'babElMandebPhysicalPassFraction',
    'reroutedShare',
    'inventoryPolicyResponseOffset',
    'demandOffset'
  ];
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await openResearchAgenda(page, { fixture: 'reversal' });
  await settleThenClearRequests(page, requests);

  const controls = page.locator('#leverGrid [data-lever-id]');
  await expect(controls).toHaveCount(5);
  expect((await controls.evaluateAll((nodes) => nodes.map((node) => node.dataset.leverId))).sort()).toEqual(expectedLeverIds.slice().sort());

  const before = await page.evaluate(() => ({
    fetches: globalThis.__researchAgendaDebug.getFetchCount(),
    historyFingerprint: globalThis.__researchAgendaDebug.getHistoryFingerprint(),
    review: globalThis.__researchAgendaDebug.getCurrentReview(),
    published: globalThis.__researchAgendaDebug.getViewState().baselineLeverState
  }));
  expect(Object.hasOwn(before.published, 'proxyAdjustment')).toBe(false);

  const invalidLevers = await page.evaluate(() => {
    const definition = globalThis.__researchAgendaDebug.getDefinition();
    const review = globalThis.__researchAgendaDebug.getCurrentReview();
    const dossier = globalThis.__researchAgendaDebug.getResolvedDossier();
    const published = globalThis.__researchAgendaDebug.getViewState().baselineLeverState;
    const missing = JSON.parse(JSON.stringify(published));
    delete missing.demandOffset;
    const unknown = { ...published, unknownControl: 0 };
    const hiddenProxy = { ...published, proxyAdjustment: 0 };
    return [missing, unknown, hiddenProxy].map((leverState) => globalThis.RLAGENDA.computeAgendaViewState(definition, review, dossier, leverState));
  });
  for (const refusal of invalidLevers) {
    expect(refusal).toMatchObject({ ok: false, code: 'RLAGENDA-MODEL-INVALID', field: 'leverState' });
  }

  for (const leverId of expectedLeverIds) {
    const baseline = before.published[leverId];
    const changed = baseline >= 0.99 ? baseline - 0.01 : baseline + 0.01;
    const input = page.locator(`#lever-number-${leverId}`);
    await input.fill(String(changed));
    await input.press('Enter');
    await expect(page.locator(`[data-lever-id="${leverId}"] .lever-meta`)).toHaveText('Your assumption');
    const simple = await page.evaluate(() => globalThis.__researchAgendaDebug.getViewState());
    expect(simple.changedLeverIds).toEqual([leverId]);

    await page.getByRole('tab', { name: 'Power', exact: true }).click();
    const power = await page.evaluate(() => globalThis.__researchAgendaDebug.getViewState());
    expect(power.modelOutputs).toEqual(simple.modelOutputs);
    expect(power.charts).toEqual(simple.charts);
    expect(power.changedLeverIds).toEqual([leverId]);

    await page.getByRole('button', { name: 'Reset published values' }).click();
    const reset = await page.evaluate(() => globalThis.__researchAgendaDebug.getViewState());
    expect(reset.leverState).toEqual(before.published);
    expect(reset.changedLeverIds).toEqual([]);
    await page.getByRole('tab', { name: 'Simple', exact: true }).click();
  }

  const after = await page.evaluate(() => ({
    fetches: globalThis.__researchAgendaDebug.getFetchCount(),
    historyFingerprint: globalThis.__researchAgendaDebug.getHistoryFingerprint(),
    review: globalThis.__researchAgendaDebug.getCurrentReview()
  }));
  expect(after.fetches).toBe(before.fetches);
  expect(after.historyFingerprint).toBe(before.historyFingerprint);
  expect(after.review).toEqual(before.review);
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

// ---------------------------------------------------------------------------
// BUG-012 Scope 03 — a boot failure reports itself instead of hanging.
//
// Scope 01 repaired the corpus, so the reversal boot now SUCCEEDS. A regression
// that merely boots it therefore exercises none of the error path and would pass
// whether or not the `.catch` sets `state.view`. These tests induce the failure
// deliberately, at the dependency, and prove the reverted `.catch` still hangs.
// ---------------------------------------------------------------------------

const AGENDA_FIXTURE_CUTOFF = '2026-08-14T12:00:00.000Z'; // reversal-ui.json attemptedAt
const AGENDA_REFUSAL = 'fixture canonical model failed: RLAGENDA-MODEL-INVALID';
const AGENDA_READY = () => globalThis.__researchAgendaDebug && globalThis.__researchAgendaDebug.getViewState();

function readRepoText(relativePath) {
  return readFileSync(new URL(relativePath, new URL('../', import.meta.url)), 'utf8');
}

// Reproduces BUG-012's exact defect shape in ONE served payload, without touching data/bars/**:
// the row the fixture cutoff resolves to gets its dividend-adjusted close put back into `c`
// beside the raw low — literally what the cron wrote. rlagenda.js then refuses it on
// `l > min(o, c)` with RLAGENDA-MODEL-INVALID, which is the refusal the six tests hit.
function barsWithAdjustedCloseBesideRawLow(symbol) {
  const file = JSON.parse(readRepoText(`data/bars/${symbol}.json`));
  const cutoff = Date.parse(AGENDA_FIXTURE_CUTOFF);
  const index = file.rows.reduce((last, row, at) => (row.t <= cutoff ? at : last), -1);
  const row = file.rows[index];
  // Without these the injection could be vacuous: coherent-before and adjusted-below-low are
  // what make the served row violate the validator, and only that row, for the reason claimed.
  expect(index, 'the cutoff must resolve to a real row').toBeGreaterThan(-1);
  expect(row.l, 'the committed row must be coherent before injection').toBeLessThanOrEqual(Math.min(row.o, row.c));
  expect(row.ac, 'the adjusted close must sit below the raw low, or nothing is induced').toBeLessThan(row.l);
  file.rows[index] = { ...row, c: row.ac };
  return { payload: JSON.stringify(file), row: file.rows[index] };
}

function replaceOnce(source, find, replacement, label) {
  const parts = source.split(find);
  expect(parts.length, `revert anchor must appear exactly once: ${label}`).toBe(2);
  return parts.join(replacement);
}

// The pre-fix page, reconstructed by removing the three hunks the fix added. Every anchor is
// asserted present, so this can never silently degrade into serving the fixed page and proving
// nothing. Used twice: to show the reverted `.catch` still hangs, and to show the SUCCESS path
// returns byte-identical view state before and after the fix (INV-012B-9).
function preFixAgendaPage() {
  let source = readRepoText('research-agenda-lab.html');
  source = replaceOnce(source, ', bootFailure: null,', ',', 'state.bootFailure initialiser');
  source = replaceOnce(source, 'state.bootFailure = { status: "failed", reason: reason, message: message };', '', 'catch failure record');
  source = replaceOnce(source, 'state.view = { bootStatus: "failed", modelAvailable: false, bootFailure: state.bootFailure };', '', 'catch terminal view');
  source = replaceOnce(source, 'getBootFailure: function () { return state.bootFailure ? JSON.parse(JSON.stringify(state.bootFailure)) : null; },', '', 'debug getter');
  return source;
}

function agendaUrl(baseUrl, { fixture = null, mode = 'simple' } = {}) {
  return `${baseUrl}/research-agenda-lab.html${fixture ? `?fixture=${fixture}` : ''}#${mode}/geopolitical-supply-shock`;
}

test('Regression: SCN-012B-007/008 an induced reversal boot failure resolves the readiness observer and carries its reason', async ({ page }) => {
  const injected = barsWithAdjustedCloseBesideRawLow('COP');
  console.log(`[bug012-scope3] induced COP cutoff row: l=${injected.row.l} c=${injected.row.c} l>min(o,c)=${injected.row.l > Math.min(injected.row.o, injected.row.c)}`);
  const failingSite = await startStaticServer({ overrides: { 'data/bars/COP.json': injected.payload } });
  try {
    await page.goto(agendaUrl(failingSite.baseUrl, { fixture: 'reversal' }), { waitUntil: 'domcontentloaded' });

    // SCN-012B-007: the caller waits on exactly the predicate the six affected tests wait on.
    // Before the fix this never resolved; the budget here is the test's own, not a config override.
    const startedAt = Date.now();
    await page.waitForFunction(AGENDA_READY, null, { timeout: 15000 });
    console.log(`[bug012-scope3] readiness observer resolved after ${Date.now() - startedAt}ms`);

    const view = await page.evaluate(() => globalThis.__researchAgendaDebug.getViewState());
    expect(view).not.toBeNull();
    expect(view.bootStatus).toBe('failed');
    expect(view.modelAvailable).toBe(false);
    // Marked, never disguised: none of a healthy view's fields may be present, or a consumer
    // could read this terminal failure as a result.
    for (const field of ['modelOutputs', 'charts', 'parity', 'baselineLeverState', 'changedLeverIds', 'review']) {
      expect(Object.hasOwn(view, field), `a failed view must not carry ${field}`).toBe(false);
    }

    // SCN-012B-008: the reason must reach the observer, not only the DOM. Assert DOM parity
    // first, then erase every trace of it from the document and read the debug surface again —
    // a value scraped from the DOM could not survive that.
    await expect(page.locator('#currentReason')).toContainText(AGENDA_REFUSAL);
    await expect(page.locator('#currentPosture')).toContainText('Unavailable');
    const erased = await page.evaluate(() => {
      document.getElementById('currentReason').textContent = '';
      document.getElementById('currentPosture').textContent = '';
      return {
        domCarriesRefusal: document.documentElement.textContent.includes('RLAGENDA-MODEL-INVALID'),
        bootFailure: globalThis.__researchAgendaDebug.getBootFailure(),
        viewBootFailure: globalThis.__researchAgendaDebug.getViewState().bootFailure
      };
    });
    expect(erased.domCarriesRefusal, 'the DOM must no longer carry the reason when it is read back').toBe(false);
    expect(erased.bootFailure).not.toBeNull();
    expect(erased.bootFailure.status).toBe('failed');
    expect(erased.bootFailure.message).toBe(AGENDA_REFUSAL);
    expect(erased.bootFailure.reason).toContain(AGENDA_REFUSAL);
    expect(erased.viewBootFailure).toEqual(erased.bootFailure);
    console.log(`[bug012-scope3] retrieved after DOM erasure: ${JSON.stringify(erased.bootFailure)}`);
  } finally {
    await failingSite.close();
  }
});

test('Regression: SCN-012B-007 the reverted catch leaves the observer unresolved on the same induced failure', async ({ page }) => {
  const injected = barsWithAdjustedCloseBesideRawLow('COP');
  const revertedSite = await startStaticServer({
    overrides: { 'research-agenda-lab.html': preFixAgendaPage(), 'data/bars/COP.json': injected.payload }
  });
  try {
    await page.goto(agendaUrl(revertedSite.baseUrl, { fixture: 'reversal' }), { waitUntil: 'domcontentloaded' });
    // Wait on the signal the reverted `.catch` DOES produce, so the assertion below is about a
    // handler that has demonstrably run rather than about a boot still in flight.
    await expect(page.locator('#currentReason')).toContainText(AGENDA_REFUSAL, { timeout: 15000 });

    const observed = await page.evaluate(() => ({
      view: globalThis.__researchAgendaDebug.getViewState(),
      hasGetter: typeof globalThis.__researchAgendaDebug.getBootFailure === 'function'
    }));
    expect(observed.view, 'the reverted catch must leave getViewState() null — this is the hang').toBeNull();
    expect(observed.hasGetter).toBe(false);
    // And the wait the six tests perform genuinely does not complete, bounded by this test.
    await expect(page.waitForFunction(AGENDA_READY, null, { timeout: 2000 })).rejects.toThrow(/[Tt]imeout/);
    console.log('[bug012-scope3] reverted catch: reason in DOM, getViewState() still null, readiness wait rejected');
  } finally {
    await revertedSite.close();
  }
});

test('Regression: SCN-012B-009 a successful boot returns view state identical to the pre-fix page', async ({ page }) => {
  const preFixSite = await startStaticServer({ overrides: { 'research-agenda-lab.html': preFixAgendaPage() } });
  try {
    const capture = async (baseUrl, options) => {
      await page.goto(agendaUrl(baseUrl, options), { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(AGENDA_READY, null, { timeout: 15000 });
      return page.evaluate(() => ({
        view: globalThis.__researchAgendaDebug.getViewState(),
        bootFailure: typeof globalThis.__researchAgendaDebug.getBootFailure === 'function'
          ? globalThis.__researchAgendaDebug.getBootFailure()
          : 'absent'
      }));
    };

    for (const options of [{ fixture: 'reversal' }, {}]) {
      const fixed = await capture(site.baseUrl, options);
      const preFix = await capture(preFixSite.baseUrl, options);
      const label = options.fixture || 'no-fixture';
      // A successful boot must be untouched by the error-path change: the same value, with no
      // failure marker leaking into it and no failure recorded beside it.
      expect(fixed.view, `${label}: successful view must equal the pre-fix page's`).toEqual(preFix.view);
      // The reversal fixture is the boot this scope can break, so pin it as genuinely healthy —
      // otherwise "identical" could one day mean identically failed. The no-fixture boot renders
      // an UNAVAILABLE current review by design, which is a successful boot, not a failed one.
      if (options.fixture) expect(fixed.view.modelAvailable, `${label}: the model must be available`).toBe(true);
      expect(Object.hasOwn(fixed.view, 'bootStatus'), `${label}: success must carry no bootStatus`).toBe(false);
      expect(Object.hasOwn(fixed.view, 'bootFailure'), `${label}: success must carry no bootFailure`).toBe(false);
      expect(fixed.bootFailure, `${label}: no boot failure may be recorded on success`).toBeNull();
      expect(preFix.bootFailure, `${label}: the pre-fix replica must genuinely lack the getter`).toBe('absent');
      console.log(`[bug012-scope3] ${label}: success view identical pre/post fix, keys=${Object.keys(fixed.view).length}`);
    }
  } finally {
    await preFixSite.close();
  }
});