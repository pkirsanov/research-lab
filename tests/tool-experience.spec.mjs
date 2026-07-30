import { readFileSync } from 'node:fs';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

function readRepoJson(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, new URL('../', import.meta.url)), 'utf8'));
}

// Parses the same two files the shell fetches at runtime, so the expected panel text is derived
// from the dependency's real recorded state instead of a hardcoded snapshot of another feature's
// mutable status. The assertions below then prove the SHELL rendered that independently-read truth.
function observeDependencyGate(gateKey, expectedRequiredMilestones) {
  const gateConfig = readRepoJson('tool-experience.config.json').dependencyGates[gateKey];
  const required = gateConfig.acceptedPredicate.requiredMilestones;
  // Pin the requirement itself: an emptied list would satisfy the gate vacuously.
  expect(required).toEqual(expectedRequiredMilestones);

  const state = readRepoJson(gateConfig.statePath);
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
  // This regression proves the PENDING panel, so the milestone requirement must genuinely be unmet.
  expect(matched.length).toBeLessThan(required.length);

  console.log(
    `[dependency-gate] ${gateKey} statePath=${gateConfig.statePath} status=${status} certification=${certification} milestonesMatched=${matched.length}/${required.length}`
  );
  return { status, certification, matchedCount: matched.length, requiredCount: required.length };
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
  expect(result.value.toolCount).toBe(23);
  expect(result.value.toolIds).toHaveLength(23);
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
  const observed = observeDependencyGate('FEATURE002', [
    'current-graph',
    'owner-coverage',
    'powerless-author',
    'atomic-publication'
  ]);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${site.baseUrl}/strategy-self-improvement-lab.html`);
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
  await expect(gate.getByRole('heading')).toHaveText('Dependency pending: Feature 002');
  await expect(gate).toContainText(`Observed status: ${observed.status}`);
  await expect(gate).toContainText(`Observed certification: ${observed.certification}`);
  await expect(gate).toContainText(`Observed milestones matched: ${observed.matchedCount} of ${observed.requiredCount}`);
  await expect(gate).toContainText('Withheld: dynamic-tool-brief-v2, live-web-evidence, public-alert-publication');
  await expect(gate).toContainText('Available now: simple, power, journey, deterministic-local-evidence');
  await expect(gate).toContainText('Acceptance gate: status=done; certification=done; milestones=all-4-required');
  await expect(gate).toContainText('Gate: E012-DEPENDENCY:feature-002');
  // The requirement must never be restated as a fraction: "4/4" reads as fully-met progress.
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
  await expect(gate.getByRole('heading')).toHaveText('Dependency pending: Feature 008');
  await expect(gate).toContainText(`Observed status: ${observed.status}`);
  await expect(gate).toContainText(`Observed certification: ${observed.certification}`);
  await expect(gate).toContainText(`Observed milestones matched: ${observed.matchedCount} of ${observed.requiredCount}`);
  await expect(gate).toContainText('Withheld: private-portfolio-overlay, portfolio-stress-journey');
  await expect(gate).toContainText('Available now: public-watchlist-matrix, public-scope-journeys');
  await expect(gate).toContainText('Acceptance gate: status=done; certification=done; milestones=all-3-required');
  await expect(gate).toContainText('Gate: E012-DEPENDENCY:feature-008');
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