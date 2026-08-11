/* ════════════════ TP-15-05 TRACEABILITY (Feature 012 / Scope 15) ════════════════
 *
 * TP-15-05 declares: "E2E evidence proves bond-regime native content shows in Power
 * not Simple (BUG-003 closure)" — SCN-012-039, SCN-012-041.
 *
 * That evidence is carried by tests ALREADY IN THIS FILE. This block only makes the
 * declared row locatable by its TP id; it adds no assertion, changes no title, and
 * changes nothing any test verifies.
 *
 * THE ROW IS A LIVE-STACK ROW, so its carrier must be a live-stack test. Carrier 3 below
 * is that carrier. Carriers 1 and 2 remain accurate descriptions of what those tests
 * verify and are listed because they still bound the same behaviour from other angles —
 * but carrier 2 installs `page.route`, which makes it MOCKED under this repo's Live-Stack
 * Test Authenticity rule, so it is expressly NOT the live carrier for this row.
 *
 *   1. `openNativeResearchSurface` (below) — the "native content shows in POWER" half.
 *      It drives the shell exactly as a production user does and then asserts
 *      `body` carries `data-rlview="power"`, that `body` does NOT carry `rlv-focused`,
 *      and that this page's own native control `#treasuryShock` is VISIBLE. Every
 *      test that must see or drive the native research surface goes through it
 *      (BS-004, BS-005, BS-012, BS-014 …), so the "native content lives under Power"
 *      fact is exercised repeatedly, not once. Note that its callers reach it through
 *      `openFromSharedCache`'s default treasury route, so they too are mocked paths.
 *
 *   2. `Regression BUG-003: Ready waits for auto-hydration before Simple and Power
 *      comparison` — MOCKED (holds the treasury response with `page.route` in order to
 *      sample the pre-Ready window). It is the "NOT Simple" half plus the BUG-003 closure
 *      itself. On the shell's Simple view it asserts the production ADAPTER panel
 *      `[data-rlexperience-panel="simple"]` is the VISIBLE Simple surface and that it
 *      carries the adapter id the REGISTRY binds to this tool (read from
 *      simple-models.json, never hard-coded), while this page's own `#simpleView`
 *      digest node is merely ATTACHED — i.e. rendered but off screen, hidden by
 *      rlviews.js's `body.rlv-focused>*:not(#rlviews)…{display:none!important}`.
 *      It then keeps the original anti-divergence check intact: `#simpleView` and
 *      `#powerView` model digests must stay byte-identical across a real
 *      Simple→Power change, with zero new requests. Held for what only it can prove;
 *      it does not carry this row.
 *
 *   3. `TP-15-05 live-stack: shell Simple shows the registry adapter panel with native
 *      content hidden, shell Power shows the native content` — THE LIVE CARRIER. Zero
 *      interception on its path (`routeTreasury: false`), the page's own declared
 *      readiness boundary rather than a timing heuristic, registry-derived adapter id,
 *      and BOTH halves of the declared row asserted in one run against explicitly named
 *      singular roots.
 *
 * MEASURED, not assumed (real page, no fixture preseed, zero interception): this tool's
 * production owner-state provider yields owner state and the Simple panel reaches
 * `state="ready"` on `simple-adapter/fixed-income-sleeve/v1` with `body.rlv-focused`
 * ON — so the Simple surface a production user sees really is the adapter panel and
 * the native surface really is off screen there.
 *
 * NO TITLE WAS RENAMED. Verified before writing this block: nothing selects either
 * carrier by exact title — the only in-repo `--grep` callers
 * (tests/contextual-tooltip.functional.mjs, tests/tool-experience-registry.functional.mjs)
 * target titles in OTHER files, and the `TOOLS[…].title` map indirection lives only in
 * the tests/simple-model-adapters-*.spec.mjs files, which are untouched.
 * ═══════════════════════════════════════════════════════════════════════════════ */
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

let site;
test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

function utcDay(dayOffset) {
  return Date.UTC(2026, 0, 2 + dayOffset);
}

function ratioFixture(options = {}) {
  const sessions = options.sessions || 80;
  const ratioGain = options.ratioGain == null ? 0.04 : options.ratioGain;
  const rows = { JNK: [], HYG: [], LQD: [] };
  for (let index = 0; index < sessions; index += 1) {
    const progress = index / (sessions - 1);
    const lqd = 100;
    rows.LQD.push({ t: utcDay(index), c: lqd });
    rows.JNK.push({ t: utcDay(index), c: 100 * (1 + ratioGain * progress) });
    rows.HYG.push({ t: utcDay(index), c: 100 * (1 + ratioGain * 0.9 * progress) });
  }
  if (options.unmatchedNewest) rows.JNK.push({ t: utcDay(sessions), c: 100 * (1 + ratioGain + 0.002) });
  return rows;
}

function observedSnapshot(options = {}) {
  const observedAt = '2026-01-31';
  const bars = ratioFixture(options);
  return {
    bars,
    barMeta: {
      JNK: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' },
      HYG: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' },
      LQD: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' }
    },
    treasuryChanges: { change21dBp: options.change21dBp || 0, change63dBp: options.change63dBp || 0 },
    confirmations: options.confirmations || [],
    nominalCurve: options.nominalCurve || null,
    realCurve: options.realCurve || null
  };
}

function curveFixture(shortStart, shortEnd, longStart, longEnd, options = {}) {
  const rows = [];
  for (let index = 0; index < 22; index += 1) {
    rows.push({
      date: new Date(Date.UTC(2026, 0, 2 + index)).toISOString().slice(0, 10),
      y3m: options.y3m == null ? 3.5 : options.y3m,
      y2: shortStart + (shortEnd - shortStart) * index / 21,
      y5: 3.8,
      y10: longStart + (longEnd - longStart) * index / 21,
      y30: 4.5
    });
  }
  return { state: 'fresh', rows, observedAt: rows.at(-1).date, sourceId: 'synthetic-official-nominal' };
}

function realCurveFixture(start, end) {
  const rows = [];
  for (let index = 0; index < 22; index += 1) rows.push({ date: new Date(Date.UTC(2026, 0, 2 + index)).toISOString().slice(0, 10), y5: 1.5, y10: start + (end - start) * index / 21, y20: 2, y30: 2.2 });
  return { state: 'fresh', rows, observedAt: rows.at(-1).date, sourceId: 'synthetic-official-real' };
}

async function openWithSnapshot(page, snapshot) {
  await openFromSharedCache(page);
  await page.evaluate((nextSnapshot) => window.BondRegimeLab.replaceObservedSnapshot(nextSnapshot), snapshot);
}

// Feature 012 Scope 15 (four-view experience shell, Model B): bond-regime-lab is now a WIRED
// ordinary tool — bond-regime-lab.html registers __rlOwnerStateProvider["bond-regime-lab"] — so
// rlapp.js resolves ownerModes: ["power"] for it. On the default Simple view the shell therefore
// sets body.rlv-focused, renders the production Simple ADAPTER panel
// ([data-rlexperience-panel="simple"]), and hides this page's own <div class="shell"> — its only
// direct body child — via the shell rule
// `body.rlv-focused>*:not(#rlviews)...{display:none!important}` (rlviews.js).
//
// Nothing was deleted. The page's native research surface — the scenario controls, the decision
// grid, the ranked sleeve-response table and the Power dashboards — MOVED UNDER THE POWER VIEW. A
// test that must SEE or DRIVE that native surface therefore drives the shell exactly as a
// production user does: wait for the shell, then select Power. rlviews.js driveLegacy() also clicks
// the page's own #powerTab, so the page enters its native Power mode; the scenario controls and
// #scenarioAlert live outside #simpleView/#powerView and stay rendered in both native modes, so
// every downstream assertion below is unchanged.
//
// Read-only assertions need NO switch and were left exactly as they were: Playwright's
// getAttribute / textContent / inputValue / evaluateAll and toHaveText / toHaveCount resolve
// attached nodes, so BS-011's Simple-vs-Power model-digest comparison still reads this page's real
// #simpleView and #powerView digest nodes and its anti-divergence check is untouched.
// Mirrors the shell-driving pattern in tests/company-fundamentals-lab.spec.mjs.
//
// TP-15-05 CARRIER 1/2 — the "native content shows in POWER" half of the declared row.
const openNativeResearchSurface = async (page) => {
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  // Power IS in ownerModes, so rlv-focused clears and the native surface becomes visible again.
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await expect(page.locator('body')).not.toHaveClass(/\brlv-focused\b/);
  await expect(page.locator('#treasuryShock')).toBeVisible();
};

test('BS-001 duration-driven ratio improvement stays mixed', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    change21dBp: 42,
    change63dBp: 42,
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: 0,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-credit-state]')).toHaveText('Mixed');
  await expect(page.locator('[data-credit-conflicts]')).toContainText('duration-confounded');
  await expect(page.locator('[data-credit-state]')).not.toHaveText('Constructive');
});

test('BS-002 aligned ratios plus OAS confirmation are constructive', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: -12,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-credit-state]')).toHaveText('Constructive');
  await expect(page.locator('[data-credit-invalidation]')).toContainText('ratio');
  await expect(page.locator('[data-credit-invalidation]')).toContainText('spread');
});

test('BS-003 tight but widening keeps level and momentum separate', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: 18,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-confirmation-level]')).toHaveText('tight');
  await expect(page.locator('[data-confirmation-momentum]')).toHaveText('widening');
  await expect(page.locator('[data-confirmation-direction]')).toHaveText('mixed');
});

test('BS-010 latest common date excludes unmatched leg', async ({ page }) => {
  const snapshot = observedSnapshot({ unmatchedNewest: true });
  await openWithSnapshot(page, snapshot);
  const expectedCommonDate = new Date(snapshot.bars.LQD.at(-1).t).toISOString().slice(0, 10);
  const unmatchedDate = new Date(snapshot.bars.JNK.at(-1).t).toISOString().slice(0, 10);
  await expect(page.locator('[data-ratio-asof="jnk-lqd"]')).toHaveText(expectedCommonDate);
  await expect(page.locator('[data-ratio-table="jnk-lqd"]')).not.toContainText(unmatchedDate);
});

test('BS-004 bull steepener retains defensive credit context', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    ratioGain: -0.04,
    confirmations: [{ id: 'synthetic-oas', kind: 'oas', value: 5.5, changeBp: 20, observedAt: '2026-01-23', freshness: 'fresh' }],
    nominalCurve: curveFixture(4.5, 3.5, 4.5, 4.1),
    realCurve: realCurveFixture(2, 1.8)
  }));
  await expect(page.locator('[data-curve-impulse]')).toHaveText('Bull Steepener');
  await expect(page.locator('[data-duration-state]')).toHaveText('Extend');
  await expect(page.locator('[data-duration-context]')).toContainText('high-quality duration');
  await expect(page.locator('[data-duration-context]')).toContainText('Defensive credit');
});

test('BS-005 bear steepener penalizes long duration most', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    nominalCurve: curveFixture(3.5, 3.7, 4, 4.8),
    realCurve: realCurveFixture(1.7, 2.15)
  }));
  await expect(page.locator('[data-curve-impulse]')).toHaveText('Bear Steepener');
  await expect(page.locator('[data-duration-state]')).toHaveText('Shorten');
  const effects = await page.locator('[data-rate-effect]').evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.dataset.rateEffect, Number(node.textContent)])));
  expect(effects['long-treasury']).toBeLessThan(effects['short-treasury']);
});

test('Regression curve inversion alone leaves duration balanced or indeterminate', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({ nominalCurve: curveFixture(4.6, 4.6, 4, 4, { y3m: 4.8 }) }));
  await expect(page.locator('[data-curve-state]')).toHaveText('Inverted');
  await expect(page.locator('[data-duration-state]')).not.toHaveText('Shorten');
  await expect(page.locator('[data-duration-state]')).not.toHaveText('Extend');
});

async function setScenario(page, values) {
  for (const [id, value] of Object.entries(values)) await page.locator('#' + id).fill(String(value));
}

test('BS-006 six month mixed shock decomposes every sleeve', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  // The native scenario controls driven below live under the Power view (Feature 012 Scope 15).
  await openNativeResearchSurface(page);
  await setScenario(page, { treasuryShock: -50, igSpreadShock: 60, hySpreadShock: 150, breakevenShock: 0 });
  await expect(page.locator('[data-scenario-row]')).toHaveCount(7);
  await expect(page.locator('[data-scenario-row="intermediate-treasury"] [data-term="spread"]')).toHaveText('Not applicable');
  await expect(page.locator('[data-scenario-row="investment-grade-corporate"] [data-term="spread"]')).not.toHaveText('Not applicable');
  await expect(page.locator('[data-scenario-row="inflation-linked-treasury"]')).toContainText('real yield');
  const rows = await page.locator('[data-scenario-row]').evaluateAll((nodes) => nodes.map((node) => ({ carry: Number(node.querySelector('[data-term="carry"]').dataset.value), rate: Number(node.querySelector('[data-term="rate"]').dataset.value), spread: Number(node.querySelector('[data-term="spread"]').dataset.value || 0), convexity: Number(node.querySelector('[data-term="convexity"]').dataset.value), total: Number(node.querySelector('[data-term="total"]').dataset.value) })));
  expect(rows.every((row) => Math.abs(row.carry + row.rate + row.spread + row.convexity - row.total) < 1e-8)).toBeTruthy();
});

test('BS-007 oversized shock preserves estimate and lowers reliability', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  // The native scenario controls driven below live under the Power view (Feature 012 Scope 15).
  await openNativeResearchSurface(page);
  await page.locator('#hySpreadShock').fill('400');
  const row = page.locator('[data-scenario-row="high-yield-corporate"]');
  await expect(row.locator('[data-reliability]')).toHaveText('Reduced reliability');
  await expect(row.locator('[data-term="total"]')).not.toHaveText('Not calculable');
  for (const risk of ['nonparallel curves', 'optionality', 'defaults', 'liquidity', 'tracking']) await expect(row).toContainText(risk);
});

test('BS-008 stale characteristic remains visible and unranked', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  await page.evaluate(() => {
    const instrument = window.BondRegimeLab.runtime.config.instruments.find((row) => row.ticker === 'LQD');
    instrument.rateDuration.asOf = '2020-01-01';
    window.BondRegimeLab.recompute();
  });
  const row = page.locator('[data-scenario-row="investment-grade-corporate"]');
  await expect(row).toContainText('rateDuration');
  await expect(row.locator('[data-rank]')).toHaveText('Not ranked');
  await expect(page.locator('[data-preferred-expression]')).not.toHaveText('Investment-grade corporate');
});

test('Scenario controls reject nonfinite input and persist only allowlisted assumptions', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  // The native scenario controls driven below live under the Power view (Feature 012 Scope 15).
  await openNativeResearchSurface(page);
  await page.locator('#treasuryShock').fill('Infinity');
  await expect(page.locator('#scenarioAlert')).toContainText('finite');
  const storage = await page.evaluate(() => ({ state: JSON.parse(localStorage.getItem('bondRegimeLabState') || '{}'), keys: Object.keys(JSON.parse(localStorage.getItem('bondRegimeLabState') || '{}')).sort() }));
  expect(storage.keys).toEqual(['breakevenShockBp', 'focusSleeveId', 'horizonMonths', 'hySpreadShockBp', 'igSpreadShockBp', 'mode', 'presetId', 'ratioId', 'ratioWindow', 'schemaVersion', 'treasuryShockBp'].sort());
  expect(JSON.stringify(storage.state)).not.toContain('Infinity');
});

function sharedBarCache(options = {}) {
  const bars = ratioFixture({ sessions: 80, ratioGain: 0.04 });
  for (const ticker of ['SGOV', 'SHY', 'IEF', 'TLT', 'TIP']) {
    bars[ticker] = Array.from({ length: 80 }, (_, index) => ({ t: utcDay(index), c: 100 + index * 0.02 }));
  }
  const now = Date.now();
  const buckets = {};
  for (const [ticker, rows] of Object.entries(bars)) buckets[ticker] = { '1d': { at: now, src: 'pages-snapshot', rows } };
  return { v: 1, bars: buckets, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {}, ...options };
}

async function openFromSharedCache(page, options = {}) {
  const cache = sharedBarCache();
  await page.addInitScript((payload) => localStorage.setItem('rlData', JSON.stringify(payload)), cache);
  if (options.routeTreasury !== false) {
    const nominal = await import('node:fs').then(({ readFileSync }) => readFileSync(new URL('./fixtures/bond-regime/nominal-valid.csv', import.meta.url), 'utf8'));
    const real = await import('node:fs').then(({ readFileSync }) => readFileSync(new URL('./fixtures/bond-regime/real-valid.csv', import.meta.url), 'utf8'));
    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
      const body = route.request().url().includes('real_yield_curve') ? real : nominal;
      await route.fulfill({ status: 200, contentType: 'text/csv', body });
    });
  }
  await page.goto(site.baseUrl + '/bond-regime-lab.html');
  await page.waitForFunction(() => {
    const lab = window.BondRegimeLab;
    const renderedDigest = document.querySelector('#decisionGrid')?.dataset.observedDigest;
    return Boolean(
      lab?.runtime.refresh.promise
      && !lab.runtime.refresh.active
      && lab.runtime.viewModel
      && renderedDigest === lab.runtime.viewModel.observedDigest
    );
  });
  await expect(page.locator('#appStatus')).toContainText('Ready');
  // The shared brief mount fetches its pointer independently after the tool is ready; let it reach a
  // terminal state so its one-time, tool-orthogonal network never lands inside a request-count window.
  await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 10000 }).catch(() => { });
}

test('Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state', async ({ page }) => {
  await openFromSharedCache(page, { routeTreasury: false });
  const result = await page.evaluate(async () => {
    await window.BondRegimeLab.hydrate(true);
    const vm = window.BondRegimeLab.runtime.viewModel;
    return { pairState: vm.ratioDetails['jnk-lqd'].series.state, pairAdjustment: vm.ratioDetails['jnk-lqd'].series.adjustment, nominalState: window.BondRegimeLab.runtime.observedSnapshot.nominalCurve?.state || 'unavailable', nominalError: window.BondRegimeLab.runtime.observedSnapshot.nominalCurve?.errorCode || null };
  });
  expect(result.pairState).toBe('ready');
  expect(result.pairAdjustment).toBe('distribution-adjusted');
  expect(result.nominalState === 'fresh' || result.nominalError === 'BRL-CURVE-NOMINAL-UNAVAILABLE').toBeTruthy();
});

test('BS-009 optional macro outage leaves truthful partial read', async ({ page }) => {
  await openFromSharedCache(page);
  await page.evaluate(async () => {
    await window.BondRegimeLab.hydrate(true, { skipOptional: true });
  });
  await expect(page.locator('[data-ratio-asof="jnk-lqd"]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-curve-state]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="oas"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="financial-conditions"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Unavailable');
  await expect(page.locator('#sourceStatusTable')).not.toContainText(/Unavailable\s+0(?:\.0+)?/);
});

test('BS-013 restricted observation remains memory only', async ({ page }) => {
  await openFromSharedCache(page);
  const sentinel = '2.681923';
  const sourceUrl = 'https://example.com/restricted-source-sentinel';
  const result = await page.evaluate(({ sentinel, sourceUrl }) => {
    const normalized = window.BondRegimeLab.setManualObservation({ id: 'oas-session', kind: 'oas', value: Number(sentinel), change: -8, unit: 'percent', observedAt: new Date().toISOString().slice(0, 10), sourceUrl, sourceLabel: 'Current-tab source', acknowledged: true });
    window.BondRegimeLab.publish();
    return { normalized, local: Object.values(localStorage).join('\n'), read: JSON.stringify(RLDATA.toolRead('bond-regime-lab')), config: JSON.stringify(window.BondRegimeLab.runtime.config) };
  }, { sentinel, sourceUrl });
  expect(result.normalized.state).toBe('fresh');
  expect(result.local).not.toContain(sentinel);
  expect(result.local).not.toContain(sourceUrl);
  expect(result.read).not.toContain(sentinel);
  expect(result.read).not.toContain(sourceUrl);
  expect(result.config).not.toContain(sentinel);
  expect(result.config).not.toContain(sourceUrl);
});

test('Cache-first refresh preserves successful families when one source fails', async ({ page }) => {
  await openFromSharedCache(page);
  await page.route('**/*', async (route) => {
    let url = route.request().url();
    try { url = decodeURIComponent(url); } catch (error) { }
    if (url.includes('daily_treasury_real_yield_curve')) await route.abort('failed');
    else await route.fallback();
  });
  const before = await page.locator('[data-ratio-asof="jnk-lqd"]').textContent();
  await page.evaluate(async () => window.BondRegimeLab.hydrate(true));
  const after = await page.locator('[data-ratio-asof="jnk-lqd"]').textContent();
  expect(after).toBe(before);
  await expect(page.locator('[data-source-state="bars"]')).toContainText(/Fresh|Cached/);
  await expect(page.locator('[data-source-state="nominal-curve"]')).toHaveText('Fresh');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Stale');
  await expect(page.locator('[data-source-note="real-curve"]')).toContainText('BRL-OPTIONAL-UNAVAILABLE');
});

test('No browser credential restricted endpoint or raw observation persistence path exists', async ({ page, request }) => {
  await openFromSharedCache(page);
  const source = await (await request.get(site.baseUrl + '/bond-regime-lab.html')).text();
  const config = await (await request.get(site.baseUrl + '/bond-regime-universe.json')).text();
  expect(/<input\b[^>]*(?:password|api[_-]?key|credential|token)/i.test(source)).toBeFalsy();
  expect(/fred\.stlouisfed\.org\/graph\/fredgraph|api[_-]?key=|series\/BAML|series\/NFCI/i.test(config)).toBeFalsy();
  const stores = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(stores.local.filter((key) => /oas|nfci|financial.*condition/i.test(key))).toEqual([]);
  expect(stores.session.filter((key) => /oas|nfci|financial.*condition/i.test(key))).toEqual([]);
});

// Regression: specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/
//
// TP-15-05 CARRIER 2/2 — the "NOT Simple" half plus the BUG-003 closure. The test titled
// 'Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison'
// asserts the production adapter panel is the VISIBLE Simple surface carrying the
// registry-bound adapter id, that this page's own #simpleView is attached-but-off-screen,
// and that the #simpleView/#powerView digests stay byte-identical across a real
// Simple→Power change. See the TP-15-05 traceability block at the top of this file.
test('Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison', async ({ page }) => {
  const cache = sharedBarCache();
  const { readFileSync } = await import('node:fs');
  const nominal = readFileSync(new URL('./fixtures/bond-regime/nominal-valid.csv', import.meta.url), 'utf8');
  const real = readFileSync(new URL('./fixtures/bond-regime/real-valid.csv', import.meta.url), 'utf8');
  const requests = [];
  let releaseTreasury;
  let markTreasuryRequestStarted;
  const treasuryGate = new Promise((resolve) => { releaseTreasury = resolve; });
  const treasuryRequestStarted = new Promise((resolve) => { markTreasuryRequestStarted = resolve; });

  await page.addInitScript((payload) => localStorage.setItem('rlData', JSON.stringify(payload)), cache);
  page.on('request', (request) => requests.push(request.url()));
  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
    markTreasuryRequestStarted();
    await treasuryGate;
    const body = route.request().url().includes('real_yield_curve') ? real : nominal;
    await route.fulfill({ status: 200, contentType: 'text/csv', body });
  });

  try {
    await page.goto(site.baseUrl + '/bond-regime-lab.html');
    await treasuryRequestStarted;
    // Feature 012 Scope 15 (Model B): bond-regime-lab is now a WIRED tool, so the Simple surface a
    // production user sees in this pre-hydration window is the production ADAPTER panel, and this
    // page's own native surface is hidden by the shell rule
    // `body.rlv-focused>*:not(#rlviews)...{display:none!important}` (rlviews.js). Nothing was
    // deleted and nothing moved off-model: #simpleView is still RENDERED and still carries this
    // page's real model digest, which is exactly what the ordering assertions below sample. The
    // precondition therefore now waits on BOTH halves of that split — the Simple surface actually
    // on screen, and this page's own digest node — instead of on a single node that Model B has
    // deliberately taken off screen. (Under Model B that node can never be visible: on shell-Simple
    // the shell hides this whole page, and shell-Power drives the page's own #powerTab, which sets
    // #simpleView.hidden. Requiring visibility here would assert a state production no longer has.)
    //
    // The shell is deliberately LEFT on Simple. Driving it to Power here would collapse the
    // Simple->Power transition at the end of this test into a no-op and silently gut its
    // anti-divergence comparison, so that switch stays exactly where it always was.
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await expect(page.locator('[data-rlexperience-panel="simple"]')).toBeVisible();
    await expect(page.locator('#simpleView [data-model-digest]')).toBeAttached();
    const heldState = await page.evaluate(() => ({
      digest: document.querySelector('#simpleView [data-model-digest]')?.dataset.modelDigest || '',
      refreshActive: window.BondRegimeLab.runtime.refresh.active,
      status: document.getElementById('appStatus')?.textContent.trim() || ''
    }));
    expect(heldState.digest).toMatch(/^[0-9a-f]{8}$/);
    expect(heldState.refreshActive).toBe(true);
    expect(heldState.status, `Premature Ready while automatic hydration remains active: ${heldState.status}`).not.toContain('Ready');
    expect(heldState.status).toContain('Refreshing');
  } finally {
    releaseTreasury();
  }

  await expect(page.locator('#appStatus')).toContainText('Ready');
  expect(await page.evaluate(() => window.BondRegimeLab.runtime.refresh.active)).toBe(false);
  // ANTI-DIVERGENCE, POST-WIRING FORM — asserted in two explicit halves, neither of them dropped.
  //
  // Half 1: the Simple surface the user now sees is the adapter panel, which publishes no
  // data-model-digest of its own. What it does publish is the identity of the adapter driving it,
  // so assert that identity is the one the REGISTRY binds to this tool (read from simple-models.json
  // rather than hard-coded, so a registry rebinding cannot slip past). That closes the divergence
  // question for the Simple side, because TP-15-02's global owner-parity test in
  // tests/simple-production-bridge.integration.mjs proves that this adapter's projection EQUALS the
  // owner/Power-path values from RLMACROROTATION.computeFixedIncomeSleeveSummary — the same module
  // this page's own scenario math delegates to. Simple and Power are therefore provably one model.
  //
  // Half 2: this page's OWN #simpleView and #powerView digests are still compared directly below and
  // must remain byte-identical across a real Simple->Power mode change. That is the original BUG-003
  // divergence check, unchanged.
  const registryAdapterId = JSON.parse(readFileSync(new URL('../simple-models.json', import.meta.url), 'utf8'))
    .definitions.find((definition) => definition.toolId === 'bond-regime-lab').adapterId;
  await expect(page.locator('[data-rlexperience-panel="simple"]'))
    .toHaveAttribute('data-rlexperience-adapter', registryAdapterId);
  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
  const assumptionSelector = '#scenarioPreset, #scenarioHorizon, #treasuryShock, #igSpreadShock, #hySpreadShock, #breakevenShock';
  const assumptions = await page.locator(assumptionSelector).evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.id, node.value])));
  const beforeModeSwitch = requests.length;
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const powerDigest = await page.locator('#powerView [data-model-digest]').getAttribute('data-model-digest');
  const powerAssumptions = await page.locator(assumptionSelector).evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.id, node.value])));
  expect(simpleDigest).toMatch(/^[0-9a-f]{8}$/);
  expect(powerDigest).toBe(simpleDigest);
  expect(powerAssumptions).toEqual(assumptions);
  expect(requests.length).toBe(beforeModeSwitch);
});

// TP-15-05 LIVE-STACK CARRIER (Feature 012 / Scope 15) — SCN-012-039, SCN-012-041.
//
// WHY THIS EXISTS. The BUG-003 test directly above installs `page.route` to hold the treasury
// response open, which is what lets it pin Ready ordering against auto-hydration. Under this
// repo's Live-Stack Test Authenticity rule that makes it a MOCKED test, and a mocked test cannot
// satisfy a live-stack DoD row. Nothing about it is wrong and nothing about it is removed — it
// remains the only test that holds hydration mid-flight and the only one that compares the
// #simpleView and #powerView digests across a mode change. It simply is not the live carrier.
//
// This test is. It runs with ZERO interception: `routeTreasury: false` means no route handler is
// installed on this path, so the page's treasury request leaves for its real origin and its
// outcome — reached or unavailable — is the page's own. Readiness is the page's OWN declared
// boundary, not a timing heuristic: `openFromSharedCache` waits until BondRegimeLab's refresh
// promise has settled, `#decisionGrid`'s rendered digest equals the live view model's, and
// `#appStatus` reads Ready; the shell's own `data-rlexperience-shell="ready"` is waited on
// separately. The adapter id is read from the registry rather than written here, so a rebinding
// in simple-models.json cannot slip past.
//
// It asserts BOTH halves of the declared row against explicitly named roots, each proven singular
// first so a duplicate id fails here rather than being hidden behind `.first()`.
//
// LINE COMMENTS, DELIBERATELY — and no block-comment delimiters anywhere in this text. The repo's
// interception audit strips comments with a naive non-greedy block-comment regex before counting.
// The wildcard glob string passed to the `Cache-first refresh` test's router above happens to
// contain a slash immediately followed by a star, so that stripper reads it as a block-comment
// opener. Today nothing after it closes that opener, so the stripper drops nothing and the count
// is honest. Introducing either delimiter here — as a real block comment OR merely quoted inside
// prose — closes it, and the stripper then silently swallows every line in between, including
// that test's real router call, under-reporting interception by one. Measured, not theorised:
// writing this note as a block comment reported 2 instead of 3. Keep this text delimiter-free.
test('TP-15-05 live-stack: shell Simple shows the registry adapter panel with native content hidden, shell Power shows the native content', async ({ page }) => {
  const { readFileSync } = await import('node:fs');
  const registryAdapterId = JSON.parse(readFileSync(new URL('../simple-models.json', import.meta.url), 'utf8'))
    .definitions.find((definition) => definition.toolId === 'bond-regime-lab').adapterId;

  await openFromSharedCache(page, { routeTreasury: false });
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();

  const body = page.locator('body');
  const adapterPanel = page.locator('[data-rlexperience-panel="simple"]');
  const nativeSimpleView = page.locator('#simpleView');
  const nativeSimpleContent = page.locator('#simpleView #decisionGrid');
  const nativePowerView = page.locator('#powerView');
  const nativePowerContent = page.locator('#powerView #powerParity');
  const nativeControl = page.locator('#treasuryShock');
  await expect(adapterPanel).toHaveCount(1);
  await expect(nativeSimpleView).toHaveCount(1);
  await expect(nativeSimpleContent).toHaveCount(1);
  await expect(nativePowerView).toHaveCount(1);
  await expect(nativePowerContent).toHaveCount(1);
  await expect(nativeControl).toHaveCount(1);

  // HALF 1 — shell Simple: the adapter panel is the surface on screen, the native surface is not.
  // #simpleView must still be ATTACHED: the claim is that native content moved off screen, not
  // that it was deleted, and an absent node would satisfy a bare not-visible check.
  await expect(body).toHaveAttribute('data-rlview', 'simple');
  await expect(body).toHaveClass(/\brlv-focused\b/);
  await expect(adapterPanel).toBeVisible();
  await expect(adapterPanel).toHaveAttribute('data-rlexperience-adapter', registryAdapterId);
  await expect(nativeSimpleView).toBeAttached();
  await expect(nativeSimpleView).not.toBeVisible();
  await expect(nativeSimpleContent).toBeAttached();
  await expect(nativeSimpleContent).not.toBeVisible();
  await expect(nativeControl).not.toBeVisible();

  // HALF 2 — shell Power: the native surface is on screen and the adapter panel steps aside.
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await expect(body).toHaveAttribute('data-rlview', 'power');
  await expect(body).not.toHaveClass(/\brlv-focused\b/);
  await expect(nativePowerView).toBeVisible();
  await expect(nativePowerContent).toBeVisible();
  await expect(nativeControl).toBeVisible();
  await expect(adapterPanel).not.toBeVisible();
});

test('BS-011 Simple and Power share one model digest', async ({ page }) => {
  await openFromSharedCache(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const before = requests.length;
  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
  const assumptions = await page.locator('#treasuryShock').inputValue();
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const powerDigest = await page.locator('#powerView [data-model-digest]').getAttribute('data-model-digest');
  await page.locator('#rlviews button[data-rlview-mode="simple"]').click();
  expect(powerDigest).toBe(simpleDigest);
  await expect(page.locator('#treasuryShock')).toHaveValue(assumptions);
  expect(requests.length).toBe(before);
});

test('BS-012 lever change recomputes without fetch or observed mutation', async ({ page }) => {
  await openFromSharedCache(page);
  // The native lever driven below lives under the Power view (Feature 012 Scope 15). The shell
  // switch happens BEFORE the request recorder is installed, so the measured window below still
  // covers exactly the lever change and nothing else.
  await openNativeResearchSurface(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const beforeRequests = requests.length;
  const beforeObserved = await page.locator('#decisionGrid').getAttribute('data-observed-digest');
  const beforeStamp = await page.locator('[data-source-asof="bars"]').textContent();
  const beforeTotal = await page.locator('[data-scenario-row="high-yield-corporate"] [data-term="total"]').textContent();
  await page.locator('#hySpreadShock').fill('275');
  const afterTotal = await page.locator('[data-scenario-row="high-yield-corporate"] [data-term="total"]').textContent();
  expect(afterTotal).not.toBe(beforeTotal);
  expect(await page.locator('#decisionGrid').getAttribute('data-observed-digest')).toBe(beforeObserved);
  expect(await page.locator('[data-source-asof="bars"]').textContent()).toBe(beforeStamp);
  expect(requests.length).toBe(beforeRequests);
});

test('BS-014 partial data is keyboard and text equivalent', async ({ page }) => {
  await openFromSharedCache(page);
  await page.evaluate(() => window.BondRegimeLab.hydrate(true, { skipOptional: true }));
  await page.locator('#rlviews button[data-rlview-mode="simple"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="oas"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-chart-summary]')).toHaveCount(3);
  await expect(page.locator('[data-chart-table]')).toHaveCount(3);
  await expect(page.locator('[data-duration-invalidation]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-power-reliability]')).toBeVisible();
});

test('Registered Bond Regime tool publishes one owner read without restricted payload', async ({ page, request }) => {
  const registry = await (await request.get(site.baseUrl + '/tools.json')).json();
  const tool = registry.tools.find((entry) => entry.id === 'bond-regime-lab');
  expect(tool).toMatchObject({ file: 'bond-regime-lab.html', data: 'bond-regime-universe.json', notes: 'notes/bond-regime-lab.md' });
  await openFromSharedCache(page);
  const read = await page.evaluate(() => window.BondRegimeLab.publish());
  expect(read.id).toBe('bond-regime-lab');
  expect(read.deepLink).toBe('bond-regime-lab.html#simple');
  expect(JSON.stringify(read)).not.toMatch(/rawManual|sourceUrl|2\.681923/);
  const index = await (await request.get(site.baseUrl + '/index.html')).text();
  expect(index).toContain("id: 'bond-regime-lab'");
});

test('Power canvases are nonblank synchronous and text equivalent on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    const checks = await page.locator('canvas[data-bond-chart]').evaluateAll((canvases) => canvases.map((canvas) => {
      const context = canvas.getContext('2d');
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let nonblank = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] && (pixels[index - 1] || pixels[index - 2] || pixels[index - 3])) nonblank += 1;
      const rect = canvas.getBoundingClientRect();
      return { nonblank, width: rect.width, height: rect.height, hit: typeof canvas.__rlhit === 'function', fallback: canvas.textContent.trim(), label: canvas.getAttribute('aria-label') };
    }));
    expect(checks).toHaveLength(3);
    expect(checks.every((check) => check.nonblank > 20 && check.width > 200 && check.height >= 180 && check.hit && check.fallback && check.label)).toBeTruthy();
    await expect(page.locator('[data-chart-table]')).toHaveCount(3);
  }
});

test('Fresh partial stale error and large-shock layouts contain text without overlap', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-fresh-power.png`), fullPage: true });
    await page.evaluate(() => window.BondRegimeLab.hydrate(true, { skipOptional: true }));
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-partial-power.png`), fullPage: true });
    await page.evaluate(() => {
      const instrument = window.BondRegimeLab.runtime.config.instruments.find((row) => row.ticker === 'LQD');
      instrument.rateDuration.asOf = '2020-01-01';
      window.BondRegimeLab.recompute();
      document.activeElement?.blur();
    });
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-stale-power.png`), fullPage: true });
    await page.locator('#treasuryShock').fill('Infinity');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-error-power.png`), fullPage: true });
    await page.locator('#treasuryShock').fill('0');
    await page.locator('#hySpreadShock').fill('400');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-large-shock-power.png`), fullPage: true });
    const layout = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const visible = [...document.querySelectorAll('.shell button, .shell input, .shell select, .shell [data-power-reliability], .shell #powerView .decision-value')].filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const bad = visible.filter((element) => {
        const rect = element.getBoundingClientRect();
        const viewportOverflow = rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
        const textOverflow = !['INPUT', 'SELECT'].includes(element.tagName) && element.scrollWidth > element.clientWidth + 4 && getComputedStyle(element).overflowX !== 'auto';
        return rect.width <= 0 || rect.height <= 0 || viewportOverflow || textOverflow;
      }).map((element) => element.id || element.textContent.trim().slice(0, 40));
      return { overflow, bad };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.bad).toEqual([]);
    await expect(page.locator('[data-scenario-row="high-yield-corporate"]')).toContainText('Reduced reliability');
  }
});

test('Power ratio window sleeve focus and restored preferences stay local', async ({ page }) => {
  await openFromSharedCache(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const beforeRequests = requests.length;
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await page.locator('#ratioSelect').selectOption('hyg-lqd');
  await page.locator('#ratioWindow').selectOption('3M');
  await page.locator('#focusSleeve').selectOption('long-treasury');
  await expect(page.locator('[data-chart-summary="ratio"]')).toContainText('HYG / LQD');
  await expect(page.locator('[data-chart-summary="decomposition"]')).toContainText('Long Treasury');
  expect(requests.length).toBe(beforeRequests);
  await page.reload();
  await expect(page.locator('#powerTab')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#ratioSelect')).toHaveValue('hyg-lqd');
  await expect(page.locator('#ratioWindow')).toHaveValue('3M');
  await expect(page.locator('#focusSleeve')).toHaveValue('long-treasury');
});

test('Power sleeve analytics expose return risk drawdown and trend when history is sufficient', async ({ page }) => {
  await openFromSharedCache(page);
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const row = page.locator('[data-sleeve-analytics="short-treasury"]');
  await expect(row.locator('[data-market="return"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="volatility"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="drawdown"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="trend"]')).toHaveText(/Uptrend|Downtrend|Mixed/);
});

test('Live page loads production config cache and reachable public sources without uncaught errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await openFromSharedCache(page);
  await expect(page.locator('#configError')).toHaveClass(/is-hidden/);
  await expect(page.locator('#appStatus')).toContainText('Ready');
  expect(errors).toEqual([]);
});

test('Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Simple' })).toBeVisible();
    await page.getByRole('tab', { name: 'Power' }).click();
    await expect(page.locator('#powerView h2')).toHaveCount(5);
    await expect(page.locator('canvas[aria-label]')).toHaveCount(3);
    await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    await page.locator('#rlviews button[data-rlview-mode="power"]').focus();
    await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toBeFocused();
  }
});

/* ════════ spec 018 Scope 5 — brief bond card + provenance render ════════
   These rows drive the REAL production renderer (`RLBRIEF.renderToolReads`, loaded by
   market-brief.html) in a real browser against fixture reads. No request is intercepted:
   the input is a payload-shaped object handed to the renderer, which is what these rows
   are about. That keeps them deterministic without turning them into mocked tests. */

const BOND_TOOL = [{ id: 'bond-regime-lab', title: 'Bond Regime Lab', file: 'bond-regime-lab.html' }];

function bondReadFixture(metrics, readString) {
  return {
    id: 'bond-regime-lab',
    asOf: '2026-08-10T12:00:00.000Z',
    read: readString,
    state: 'unavailable',
    deepLink: 'bond-regime-lab.html#simple',
    source: 'owning-tool-functions',
    metrics: Object.assign({
      creditRegime: 'Indeterminate', durationPosture: 'Indeterminate',
      confidence: 'Low', pricePulse: 'unavailable', confirmationState: 'unavailable',
      curveState: 'Unavailable', curveImpulse: 'Unavailable', inflationState: 'Unavailable',
      curveAdmission: {}, curveAsOf: null, readablePairs: [], evidenceGaps: [],
      preferredSleeveId: null, resultPct: null
    }, metrics)
  };
}

async function renderBondCard(page, read) {
  await page.goto(site.baseUrl + '/market-brief.html');
  await page.waitForFunction(() => Boolean(window.RLBRIEF && window.RLBRIEF.renderToolReads));
  await page.evaluate(({ tools, value }) => {
    let host = document.querySelector('#brl-scope5-probe');
    if (!host) {
      host = document.createElement('div');
      host.id = 'brl-scope5-probe';
      document.body.appendChild(host);
    }
    window.RLBRIEF.renderToolReads(host, tools, { 'bond-regime-lab': value }, {});
  }, { tools: BOND_TOOL, value: read });
  return page.locator('#brl-scope5-probe');
}

test('TP-05-01 BS-018-017 render: the partial-resolution card shows both axes as labelled rows and paints no machine slug', async ({ page }) => {
  const card = await renderBondCard(page, bondReadFixture({
    durationPosture: 'Shorten', curveState: 'Positive', curveImpulse: 'Mixed', inflationState: 'Mixed',
    curveAsOf: '2026-08-10', evidenceGaps: ['an independent credit-spread reading'],
    curveAdmission: { nominal: { verdict: 'current', errorCode: null, lastGoodObservedAt: '2026-08-10', elapsedDays: 1, windowDays: 4, basis: 'observed-gap-max-3d-over-9-gaps-plus-lag-1d' } }
  }, 'Credit evidence is missing, so the credit call cannot be made.'));

  await expect(card.locator('.brl-axes dt')).toHaveCount(2);
  await expect(card.locator('.brl-axes dt').nth(0)).toHaveText('Credit regime');
  await expect(card.locator('.brl-axes dt').nth(1)).toHaveText('Duration posture');
  await expect(card.locator('.brl-axes dd').nth(0)).toContainText('Not resolved');
  await expect(card.locator('.brl-axes dd').nth(1)).toContainText('Shorten');

  // The machine value must not reach the reader anywhere in the card's visible text.
  const text = await card.innerText();
  expect(text).not.toMatch(/(^|\s)unavailable(\s|$)/);
  expect(text).not.toContain('Indeterminate');
  expect(text).toMatch(/One axis resolved and one did not/);
  expect(text).toMatch(/No sleeve is ranked/);

  // Every axis row carries a two-part contextual tooltip, reachable without hover.
  for (const nth of [0, 1]) {
    const token = card.locator('.brl-axes dd .brl-tok').nth(nth);
    const tip = await token.getAttribute('title');
    expect(tip && tip.length).toBeGreaterThan(40);
    expect(tip).toMatch(/This reading:/);
    // Keyboard-reachable, and the accessible name carries the same two-part content as the hover tip.
    await token.focus();
    await expect(token).toBeFocused();
    expect(await token.getAttribute('aria-label')).toContain(tip);
  }
});

test('TP-05-02 BS-018-009 render: the stale card names its window and its last good observation as not current', async ({ page }) => {
  const stale = { verdict: 'stale', errorCode: 'BRL-CURVE-FAMILY-STALE', lastGoodObservedAt: '2026-01-02', elapsedDays: 58, windowDays: 4, basis: 'observed-gap-max-3d-over-7-gaps-plus-lag-1d' };
  const card = await renderBondCard(page, bondReadFixture({
    evidenceGaps: ['the Treasury yield curve', 'an independent credit-spread reading'],
    curveAdmission: { nominal: stale, real: stale }
  }, 'Curve and credit evidence are both missing, so the credit call and the duration call cannot be made.'));

  await expect(card.locator('.brl-adm')).toHaveCount(2);
  for (const nth of [0, 1]) {
    const token = card.locator('.brl-adm .brl-tok').nth(nth);
    await expect(token).toContainText('Stale');
    expect(await token.innerText()).toMatch(/[△▲◐]|Stale/);
  }
  const text = await card.innerText();
  expect(text).toMatch(/4-day derived window/);
  expect(text).toMatch(/58 days old/);
  // The not-current qualifier sits INSIDE the same string as the date, not beside it.
  expect(text).toMatch(/Last good observation 2026-01-02 — not current/);
  const tip = await card.locator('.brl-adm .brl-tok').first().getAttribute('title');
  expect(tip).toMatch(/Last good observation 2026-01-02 — not current/);
  // A withheld family shows no classification.
  expect(text).not.toMatch(/\b(Positive|Inverted|Flat|Bull Steepener|Bear Steepener|Heating|Cooling)\b/);
});

test('TP-05-03 BS-018-015 render: the absent card states that nothing was substituted and prints the published read verbatim', async ({ page }) => {
  const absent = { verdict: 'unavailable', errorCode: 'BRL-CURVE-ARTIFACT-ABSENT', lastGoodObservedAt: null, elapsedDays: null, windowDays: null, basis: 'no-committed-artifact' };
  const published = 'Neither axis has current evidence behind it, so the credit call and the duration call cannot be made.';
  const card = await renderBondCard(page, bondReadFixture({
    evidenceGaps: ['the Treasury yield curve', 'an independent credit-spread reading'],
    curveAdmission: { nominal: absent, real: absent }
  }, published));

  await expect(card.locator('.brl-fam')).toHaveCount(3);
  for (const nth of [0, 1, 2]) {
    await expect(card.locator('.brl-fam .brl-tok').nth(nth)).toContainText('Unavailable');
  }
  const text = await card.innerText();
  expect(text).toMatch(/Nothing was substituted — no zero, no neutral filler, no carried value/);
  // The published string is rendered verbatim and is not duplicated into an aria-label.
  await expect(card.locator('.ay')).toHaveText(published);
  expect(await card.locator('.ay').getAttribute('aria-label')).toBeNull();
});

test('TP-05-04 the source table renders observed as-of and retrieval time with a reachable official source URL', async ({ page }) => {
  await openFromSharedCache(page);
  await page.getByRole('tab', { name: 'Power' }).click();

  const headers = await page.locator('#sourceStatusTable thead th').allInnerTexts();
  expect(headers).toEqual(['Family', 'State', 'Observed as of', 'Retrieved', 'Source / rights']);

  for (const id of ['nominal-curve', 'real-curve']) {
    await expect(page.locator('[data-source-asof="' + id + '"]')).not.toHaveText('');
    const retrieved = await page.locator('[data-source-retrieved="' + id + '"]').innerText();
    expect(retrieved).toMatch(/UTC$|^Not retrieved$/);
    const note = await page.locator('[data-source-note="' + id + '"]').innerText();
    expect(note).toContain('us-treasury');
    expect(note).toContain('public official');
    const link = page.locator('[data-source-note="' + id + '"] a');
    if (await link.count()) {
      expect(await link.getAttribute('href')).toMatch(/^https:\/\/home\.treasury\.gov\//);
      await expect(link).toHaveText('home.treasury.gov');
    }
  }

  // No cell in the whole table may be empty or a bare dash.
  const cells = await page.locator('#sourceStatusTable tbody td').allInnerTexts();
  expect(cells.length).toBeGreaterThan(0);
  for (const cell of cells) {
    expect(cell.trim()).not.toBe('');
    expect(cell.trim()).not.toBe('—');
    expect(cell.trim()).not.toBe('-');
  }
});

test('TP-05-05 no restricted value or restricted source URL is rendered anywhere', async ({ page }) => {
  await openFromSharedCache(page);
  await page.getByRole('tab', { name: 'Power' }).click();

  for (const id of ['oas', 'financial-conditions']) {
    const note = await page.locator('[data-source-note="' + id + '"]').innerText();
    expect(note).toMatch(/memory-only/);
    await expect(page.locator('[data-source-note="' + id + '"] a')).toHaveCount(0);
    const asOf = await page.locator('[data-source-asof="' + id + '"]').innerText();
    expect(asOf.trim()).not.toBe('');
  }

  const body = await page.locator('body').innerText();
  expect(body).not.toMatch(/\boas\s*[:=]\s*\d/i);
  expect(body).not.toMatch(/fred\.stlouisfed\.org|api_key|apikey/i);

  const persisted = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }));
  expect(persisted).not.toMatch(/api_key|apikey|fred\.stlouisfed\.org/i);
});

test('TP-05-06 BS-018-010 render: an underivable admission states its observed-gap count and asserts neither current nor stale', async ({ page }) => {
  const undetermined = { verdict: 'undetermined', errorCode: 'BRL-CURVE-FRESHNESS-UNDERIVABLE', lastGoodObservedAt: null, elapsedDays: null, windowDays: null, basis: 'insufficient-observed-history-gaps-2-of-5' };
  const card = await renderBondCard(page, bondReadFixture({
    evidenceGaps: ['the Treasury yield curve', 'an independent credit-spread reading'],
    curveAdmission: { nominal: undetermined }
  }, 'Neither axis has current evidence behind it, so the credit call and the duration call cannot be made.'));

  const token = card.locator('.brl-adm .brl-tok').first();
  await expect(token).toContainText('Unavailable');
  await expect(token).not.toContainText('Stale');
  const text = await card.innerText();
  // Routed item R-2: the rendered basis is the observation count the rule actually used.
  expect(text).toMatch(/2 observed gaps available against the 5 this family's cadence rule requires/);
  expect(text).toMatch(/Neither current nor stale is asserted/);
});

test('TP-05-07 curve level, curve impulse and the inflation pair never share a row, a token or an as-of', async ({ page }) => {
  const card = await renderBondCard(page, bondReadFixture({
    durationPosture: 'Shorten', curveState: 'Positive', curveImpulse: 'Mixed', inflationState: 'Mixed',
    curveAsOf: '2026-08-10', evidenceGaps: ['an independent credit-spread reading'],
    curveAdmission: { nominal: { verdict: 'current', errorCode: null, lastGoodObservedAt: '2026-08-10', elapsedDays: 1, windowDays: 4, basis: 'observed-gap-max-3d-over-9-gaps-plus-lag-1d' } }
  }, 'Credit evidence is missing, so the credit call cannot be made.'));

  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(card.locator('.brl-fam')).toHaveCount(3);
    const labels = await card.locator('.brl-fam .brl-fam-l').allInnerTexts();
    expect(labels).toEqual(['Curve level', 'Curve impulse', 'Real yield and breakeven']);
    await expect(card.locator('.brl-fam .brl-tok')).toHaveCount(3);
    // Two axis rows must never collapse into one visual line at any width.
    const boxes = await card.locator('.brl-axes dd').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().top));
    expect(boxes[1]).toBeGreaterThan(boxes[0]);
  }

  await openFromSharedCache(page);
  await page.getByRole('tab', { name: 'Power' }).click();
  const breakevenNote = await page.locator('[data-source-note="breakeven"]').innerText();
  expect(breakevenNote).toMatch(/\d+ common dates? of \d+ nominal observations?/);
  const breakevenAsOf = await page.locator('[data-source-asof="breakeven"]').innerText();
  const nominalAsOf = await page.locator('[data-source-asof="nominal-curve"]').innerText();
  expect(typeof breakevenAsOf).toBe('string');
  expect(typeof nominalAsOf).toBe('string');
});

test('TP-06-06 SCN-018-038 the parity line renders exactly one of three verdicts with its compared-field count, and silence is never agreement', async ({ page }) => {
  const cases = [
    { parity: { verdict: 'agree', comparedFields: 4, differing: [], reason: 'Both compositions reached the same reading on all 4 compared fields.' }, word: 'Agree' },
    { parity: { verdict: 'differ', comparedFields: 4, differing: ['curveState'], reason: 'The browser composition and the published headless read disagree on curveState. One model should not reach two answers, so this is a defect to investigate rather than a status to acknowledge.' }, word: 'Differ' },
    { parity: { verdict: 'cannot-compare', comparedFields: 0, differing: [], reason: 'The two compositions hold different observation windows (2025–2026 against 2024–2025), so their inflation and impulse readings are not comparable.' }, word: 'Cannot be compared' },
    { parity: undefined, word: 'Cannot be compared' }
  ];

  for (const item of cases) {
    const card = await renderBondCard(page, bondReadFixture({ parity: item.parity }, 'A published read.'));
    const line = card.locator('.brl-parity');
    await expect(line).toHaveCount(1);
    await expect(line.locator('.brl-tok')).toContainText(item.word);
    const text = await line.innerText();

    // Exactly one verdict word is present — the three are mutually exclusive.
    const present = ['Agree', 'Differ', 'Cannot be compared'].filter((w) => new RegExp('(^|[^a-z])' + w).test(text));
    expect(present).toEqual([item.word]);
    expect(text).toMatch(/across \d+ compared fields?/);
    // Never an empty line, and an absent comparison never reads as agreement.
    expect(text.trim().length).toBeGreaterThan(20);
    if (!item.parity) expect(text).not.toMatch(/(^|[^a-z])Agree/);
  }
});

test('TP-06-07 Regression: the parity line survives an absent comparison and a Differ verdict is not dismissible, collapsible or snoozable', async ({ page }) => {
  // The whole card must still render when the comparison cannot run.
  const absent = await renderBondCard(page, bondReadFixture({}, 'A published read with no parity block.'));
  await expect(absent.locator('.brl-axes dt')).toHaveCount(2);
  await expect(absent.locator('.brl-parity')).toHaveCount(1);
  await expect(absent.locator('.brl-parity')).toContainText('Cannot be compared');

  const differ = await renderBondCard(page, bondReadFixture({
    parity: { verdict: 'differ', comparedFields: 4, differing: ['curveState', 'inflationState'], reason: 'The browser composition and the published headless read disagree on curveState, inflationState. One model should not reach two answers, so this is a defect to investigate rather than a status to acknowledge.' }
  }, 'A published read whose compositions disagree.'));

  const line = differ.locator('.brl-parity');
  // Stated as a defect in words, with no severity level and no alarm styling.
  await expect(line).toContainText('defect to investigate rather than a status to acknowledge');
  const html = await line.innerHTML();
  expect(html).not.toMatch(/severity|critical|P[0-4]\b|alert-danger|blink/i);
  // No dismiss, collapse or snooze affordance anywhere in the block.
  await expect(line.locator('button, [role="button"], details, summary, input[type="checkbox"], [aria-expanded], [data-dismiss], [data-snooze]')).toHaveCount(0);
});

test('TP-05-08 Regression: every publication state stays readable with colour removed and at 200% zoom', async ({ page }) => {
  const states = [
    { label: 'fresh', metrics: { durationPosture: 'Shorten', curveState: 'Positive', curveImpulse: 'Mixed', inflationState: 'Mixed', curveAsOf: '2026-08-10', curveAdmission: { nominal: { verdict: 'current', errorCode: null, lastGoodObservedAt: '2026-08-10', elapsedDays: 1, windowDays: 4, basis: 'observed-gap-max-3d-over-9-gaps-plus-lag-1d' } } } },
    { label: 'stale', metrics: { curveAdmission: { nominal: { verdict: 'stale', errorCode: 'BRL-CURVE-FAMILY-STALE', lastGoodObservedAt: '2026-01-02', elapsedDays: 58, windowDays: 4, basis: 'observed-gap-max-3d-over-7-gaps-plus-lag-1d' } } } },
    { label: 'absent', metrics: { curveAdmission: { nominal: { verdict: 'unavailable', errorCode: 'BRL-CURVE-ARTIFACT-ABSENT', lastGoodObservedAt: null, elapsedDays: null, windowDays: null, basis: 'no-committed-artifact' } } } }
  ];

  for (const state of states) {
    const card = await renderBondCard(page, bondReadFixture(state.metrics, 'A published read for the ' + state.label + ' state.'));
    // Colour removed entirely: the state must still be readable from glyph plus word.
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.id = 'brl-nocolor';
      style.textContent = '*{color:#000 !important;background:#fff !important;border-color:#000 !important}';
      document.head.appendChild(style);
    });
    await expect(card.locator('.brl-axes dt')).toHaveCount(2);
    const tokens = await card.locator('.brl-tok').allInnerTexts();
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) expect(token.trim().length).toBeGreaterThan(1);

    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const fused = await card.locator('.brl-axes dd').evaluateAll((nodes) => nodes.length === 2 && Math.abs(nodes[0].getBoundingClientRect().top - nodes[1].getBoundingClientRect().top) < 2);
    expect(fused).toBeFalsy();
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '';
      document.querySelector('#brl-nocolor')?.remove();
    });
  }
});
