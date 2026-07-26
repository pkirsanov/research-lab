/*
 * tests/market-action-center.spec.mjs
 * ------------------------------------------------------------------------
 * Feature 012 Scope 09 — TP-09-04 … TP-09-07 live-stack, system-chrome
 * regressions for the Market Action Center rename + public scaffold
 * (SCN-012-017, SCN-012-019, SCN-012-022 + the legacy/provenance regression).
 *
 * REAL-STACK, ZERO REQUEST INTERCEPTION. Each test navigates to the REAL
 * market-brief.html route over a real static HTTP server and boots the REAL
 * production runtime: rlapp.js mounts the REAL registry-driven four-view shell
 * (rlviews.js) for the `market-brief` tool, and the shipped in-page controller
 * builds the REAL Market Action Center content through the pure
 * RLMARKETACTIONCENTER composer and RLBRIEF.renderCenterNoAction. There is NO
 * request routing, NO response stubbing, and NO recorded-traffic replay of any
 * kind anywhere in this file — every panel is rendered from the real committed
 * watchlist.json / tools.json / tool-experience.config.json and the real
 * dependency-state files, served as-is. The private-store "sentinel" is a passive
 * OBSERVATION of the browser's own storage API (a recording wrapper installed
 * before boot that returns the real stored value unchanged), not a network stub.
 *
 * The no-action Brief (SCN-012-019) is driven by calling the REAL production
 * render path (window.__rlmac.renderBrief) with a complete-coverage / zero-action
 * brief fixture — exactly as the Journey specs drive the real controller with a
 * fixture context. The runtime, shell, DOM, history, and storage are all the real
 * production surface.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const PAGE = 'market-brief.html';
const NEW_NAME = 'Market Action Center';
const NO_ACTION_STATEMENT = 'No current action clears the bar for this window.';
const TAB_MODES = ['brief', 'portfolio', 'red-alert', 'journey'];
const TAB_LABELS = ['Brief', 'Portfolio', 'Red Alert', 'Journey'];
/* private Feature-008 store semantics that a PUBLIC watchlist row may never read or create. */
const PRIVATE_KEY_PATTERN = /portfolio|holding|quantit|costbasis|avgcost|pnl|mandate|position|exposure|sharecount/i;
const PRIVATE_COPY_PATTERN = /holding|quantity|cost basis|p&l|pnl|mandate|personal exposure|share count/i;

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Install a PASSIVE storage-access recorder (observation only, never interception) that persists across
   navigations. Records every key the page reads/creates so a public Portfolio render can be proven to
   touch NO private Feature-008 key. This is a recording wrapper over the browser's own storage API — it
   is not a network mock and returns the real stored value unchanged. */
async function installStorageSentinel(page) {
  await page.addInitScript(() => {
    window.__storageAccessLog = { reads: [], writes: [] };
    for (const storeName of ['localStorage', 'sessionStorage']) {
      try {
        const store = window[storeName];
        const realGet = store.getItem.bind(store);
        const realSet = store.setItem.bind(store);
        Object.defineProperty(store, 'getItem', {
          configurable: true,
          value: (key) => { window.__storageAccessLog.reads.push(storeName + ':' + key); return realGet(key); }
        });
        Object.defineProperty(store, 'setItem', {
          configurable: true,
          value: (key, value) => { window.__storageAccessLog.writes.push(storeName + ':' + key); return realSet(key, value); }
        });
      } catch (error) { /* a storeName may be unavailable in a hardened context — ignore */ }
    }
  });
}

/* Navigate to the real route with a FULL document load (an `about:blank` bounce guarantees the body-top
   legacy-hash capture and the Center controller re-run even when only the hash differs), then wait for
   the REAL four-view shell to finish building AND the REAL Center controller to enhance. */
async function openCenter(page, hash = '') {
  await page.goto('about:blank');
  await page.goto(`${site.baseUrl}/${PAGE}${hash}`);
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => {
    const shell = document.getElementById('rlviews');
    return !!(shell && shell.getAttribute('data-rlexperience-shell') === 'ready' &&
      document.querySelector('[data-rlexperience-panel="portfolio"]') && window.__rlmac);
  }, undefined, { timeout: 15000 });
}

function tabButton(page, mode) {
  return page.locator(`#rlviews button[data-rlview-mode="${mode}"]`);
}

/* ═══════════════════════ TP-09-04 — SCN-012-017 rename + exact four views + bookmark ═══════════════════════ */

test('Regression: SCN-012-017 existing Market Brief bookmark opens renamed Center with exact four views', async ({ page }) => {
  await openCenter(page); // a bare `market-brief.html` bookmark

  // the visible product is Market Action Center.
  await expect(page).toHaveTitle(NEW_NAME);
  await expect(page.locator('h1.logo')).toHaveText(NEW_NAME);

  // the existing route + registry identity remain functional.
  expect(page.url().endsWith(`/${PAGE}`) || page.url().endsWith(`/${PAGE}#brief`)).toBe(true);
  await expect(page.locator('[data-rlbrief-mount][data-tool-id="market-brief"]'))
    .toHaveAttribute('data-rlexperience-state', 'registered');

  // EXACTLY four top-level tabs, in order, with the exact labels — no fifth/Simple/Power mode.
  const tabs = page.locator('#rlviews button[data-rlview-mode]');
  await expect(tabs).toHaveCount(4);
  const modes = await tabs.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-rlview-mode')));
  const labels = await tabs.evaluateAll((nodes) => nodes.map((n) => (n.textContent || '').trim()));
  expect(modes).toEqual(TAB_MODES);
  expect(labels).toEqual(TAB_LABELS);
  // the closed four-view set contains no legacy Simple/Power top-level tab.
  await expect(page.locator('#rlviews button[data-rlview-mode="simple"]')).toHaveCount(0);
  await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toHaveCount(0);

  // the bare bookmark boots onto the default Brief view.
  await expect(tabButton(page, 'brief')).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(() => location.hash)).toBe('#brief');

  // a legacy `#simple` bookmark maps safely onto Brief via boot replaceState.
  await openCenter(page, '#simple');
  expect(await page.evaluate(() => location.hash)).toBe('#brief');
  await expect(tabButton(page, 'brief')).toHaveAttribute('aria-selected', 'true');

  // a legacy `#power` bookmark maps onto Brief AND opens the Brief evidence disclosure.
  await openCenter(page, '#power');
  await page.waitForFunction(() => {
    const evidence = document.getElementById('mac-evidence');
    return !!(evidence && evidence.open && evidence.getAttribute('data-mac-evidence-open') === 'power');
  }, undefined, { timeout: 15000 });
  expect(await page.evaluate(() => location.hash)).toBe('#brief');
  await expect(tabButton(page, 'brief')).toHaveAttribute('aria-selected', 'true');

  // Back / Forward traverse the pushed view history and restore the exact tab.
  await openCenter(page);
  await tabButton(page, 'portfolio').click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#portfolio');
  await expect(tabButton(page, 'portfolio')).toHaveAttribute('aria-selected', 'true');
  await tabButton(page, 'journey').click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#journey');
  await page.goBack();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#portfolio');
  await expect(tabButton(page, 'portfolio')).toHaveAttribute('aria-selected', 'true');
  await page.goForward();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe('#journey');
  await expect(tabButton(page, 'journey')).toHaveAttribute('aria-selected', 'true');
});

/* ═══════════════════════ TP-09-05 — SCN-012-019 truthful no-action Brief ═══════════════════════ */

test('Regression: SCN-012-019 complete coverage with zero admitted actions renders no-action and no invented row', async ({ page }) => {
  await openCenter(page);

  // drive the REAL production render path with a complete-coverage, zero-action brief.
  await page.evaluate(() => window.__rlmac.renderBrief({ coverageComplete: true, actions: [] }));
  const noAction = page.locator('#mac-center [data-mac-noaction]');
  await expect(noAction).toHaveCount(1);
  await expect(noAction.locator('b')).toHaveText(NO_ACTION_STATEMENT);
  await expect(noAction).toHaveAttribute('data-mac-noaction-fabricated', 'false');

  // NOTHING is manufactured: no numeric confidence/probability, no fabricated action/catalyst row.
  const centerText = await page.locator('#mac-center').innerText();
  expect(/confidence"?\s*[:=]\s*\d/i.test(centerText)).toBe(false);
  expect(/probability"?\s*[:=]\s*\d/i.test(centerText)).toBe(false);
  // the authored ToolBrief v2 Brief remains an explicit Feature-002 dependency-pending gate (no frozen-bundle claim).
  await expect(page.locator('#mac-center [data-mac-author-state="dependency-pending:feature-002"]')).toHaveCount(1);

  // adversarial (no false no-action): an admitted action suppresses the no-action state entirely.
  await page.evaluate(() => window.__rlmac.renderBrief({ coverageComplete: true, actions: [{ id: 'a1', kind: 'attention', text: 'Watch the FOMC print window.' }] }));
  await expect(page.locator('#mac-center [data-mac-noaction]')).toHaveCount(0);

  // long-context disclosures stay closed by default (a plain load never force-opens the evidence drawer).
  await openCenter(page);
  expect(await page.evaluate(() => { const d = document.getElementById('mac-evidence'); return !!(d && d.open); })).toBe(false);
});

/* ═══════════════════════ TP-09-06 — SCN-012-022 public row never implies a holding ═══════════════════════ */

test('Regression: SCN-012-022 public watchlist row never exposes or implies a holding', async ({ page }) => {
  await installStorageSentinel(page);
  await openCenter(page);
  await tabButton(page, 'portfolio').click();
  await page.waitForSelector('[data-mac-matrix] [data-mac-row]', { timeout: 15000 });

  const rows = page.locator('[data-mac-matrix] [data-mac-row]');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  // every row is scope-labeled `Public watchlist` and carries closed, explicit cells only.
  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    await expect(row.locator('[data-mac-scope-label]')).toHaveText('Public watchlist');
    const rowText = (await row.innerText()).toLowerCase();
    expect(PRIVATE_COPY_PATTERN.test(rowText), `row ${index} must not expose a private holding field`).toBe(false);
    const cells = row.locator('[data-mac-cell]');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(0);
    const states = await cells.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-mac-state')));
    const applicabilities = await cells.evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-mac-applicability')));
    for (const state of states) {
      expect(['current', 'partial', 'stale', 'disputed', 'unavailable', 'not-applicable']).toContain(state);
    }
    for (const applicability of applicabilities) {
      expect(['applicable', 'not-applicable']).toContain(applicability);
    }
  }

  // the private portfolio overlay is an explicit Feature-008 dependency-pending gate, not a capability.
  await expect(page.locator('[data-mac-private-overlay][data-mac-gate="dependency-pending:feature-008"]')).toHaveCount(1);

  // the REAL composed matrix asserts public-only scope with no Feature-008 key read/create and no private fields.
  // getMatrix() returns the composed matrix VALUE directly (or null), not an {ok,value} envelope.
  const matrix = await page.evaluate(() => window.__rlmac.getMatrix());
  expect(matrix, 'the live public matrix must have composed').not.toBeNull();
  expect(matrix.privacyAssertion.publicOnly).toBe(true);
  expect(matrix.privacyAssertion.feature008KeyRead).toBe(false);
  expect(matrix.privacyAssertion.feature008KeyCreated).toBe(false);
  expect(matrix.privacyAssertion.privateFieldsPresent).toBe(false);
  expect(matrix.rows.every((row) => row.scopeClass === 'public-watchlist')).toBe(true);

  // storage sentinel: rendering the public Portfolio read or created NO private Feature-008 key.
  const storage = await page.evaluate(() => window.__storageAccessLog);
  expect(storage.reads.filter((entry) => PRIVATE_KEY_PATTERN.test(entry)), 'no private Feature-008 key may be read').toEqual([]);
  expect(storage.writes.filter((entry) => PRIVATE_KEY_PATTERN.test(entry)), 'no private Feature-008 key may be created').toEqual([]);
});

/* ═══════════════════════ TP-09-07 — legacy hashes / provenance / windows / gates / closed disclosures ═══════════════════════ */

test('Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful', async ({ page }) => {
  // legacy hashes remain safe: both map onto Brief without leaking any private value into history.
  for (const legacy of ['#simple', '#power']) {
    await openCenter(page, legacy);
    expect(await page.evaluate(() => location.hash)).toBe('#brief');
  }

  await openCenter(page);

  // payload provenance is the ACTUAL legacy provenance; the authored v2 Brief stays gated (no frozen-bundle claim).
  const provenance = page.locator('#mac-center [data-mac-provenance]');
  await expect(provenance).toHaveCount(1);
  await expect(provenance).toHaveAttribute('data-mac-provenance', 'legacy-market-brief-payload');
  await expect(provenance).toHaveAttribute('data-mac-author-state', 'dependency-pending:feature-002');

  // the four ET action-gate windows are preserved.
  await expect(page.locator('#windowBtns .win')).toHaveCount(4);

  // Red Alert is the honest empty projection behind a Feature-002 publication gate.
  await tabButton(page, 'red-alert').click();
  await page.waitForSelector('[data-mac-redalert]', { timeout: 15000 });
  await expect(page.locator('[data-mac-redalert-empty]')).toHaveCount(1);
  await expect(page.locator('[data-mac-redalert-gate][data-mac-gate="dependency-pending:feature-002"]')).toHaveCount(1);

  // Journey exposes exactly the four committed global goals; the portfolio-stress goal is Feature-008 gated.
  await tabButton(page, 'journey').click();
  await page.waitForSelector('[data-mac-journey-list] [data-mac-journey-goal]', { timeout: 15000 });
  await expect(page.locator('[data-mac-journey-list] [data-mac-journey-goal]')).toHaveCount(4);
  await expect(page.locator('[data-mac-journey-goal][data-mac-gate="dependency-pending:feature-008"]')).toHaveCount(1);

  // the evidence disclosure stays CLOSED on a plain Brief load (long context is a closed disclosure).
  await openCenter(page);
  expect(await page.evaluate(() => { const d = document.getElementById('mac-evidence'); return !!(d && d.open); })).toBe(false);
});
