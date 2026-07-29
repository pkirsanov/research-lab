import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * Real-route browser regressions for the Volatility Regime & Vol-Targeting Sizing Lab
 * (specs/011-volatility-regime-and-sizing-lab). Bars are preseeded into the shared
 * rlData cache via addInitScript (the sanctioned cache-first path) and the production
 * route is served from the real ephemeral same-origin static server. There is NO
 * page.route / route.fulfill / route.abort / response interception anywhere in this file.
 */

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* ── deterministic generators (no randomness; volatility clustering via a fixed LCG) ── */
function makeRng(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
function gauss(rng) { return (rng() * 2 - 1) + (rng() * 2 - 1) + (rng() * 2 - 1); }
function simGarch(n, omega, alpha, beta, seed) {
    const rng = makeRng(seed); let sig2 = omega / (1 - alpha - beta); const r = [];
    for (let i = 0; i < n; i += 1) { const e = gauss(rng); const x = Math.sqrt(sig2) * e; r.push(x); sig2 = omega + alpha * x * x + beta * sig2; }
    return r;
}
function iidReturns(n, sigma, seed) { const rng = makeRng(seed); const r = []; for (let i = 0; i < n; i += 1) r.push(sigma * gauss(rng)); return r; }
function closesFromReturns(returns, start = 100) { const closes = [start]; for (const r of returns) closes.push(closes[closes.length - 1] * Math.exp(r)); return closes; }
function baseT(count) { return Date.UTC(2024, 0, 2) - (count - 1) * 86400000 + 200 * 86400000; }
function barRows(closes) { const b0 = Date.UTC(2023, 0, 2); return closes.map((c, i) => ({ t: b0 + i * 86400000, c: Math.round(c * 1e4) / 1e4 })); }

/* clustered, high-persistence, GARCH-convergent series with a recent burst */
function clusteredCloses(seed = 99) { return closesFromReturns(simGarch(300, 0.00002, 0.08, 0.90, seed).concat([0.055, -0.05, 0.058])); }
/* constant daily return → zero variance → GARCH cannot estimate ω → FIT_NONCONVERGENT → labeled EWMA fallback (and NOT managed-suppressed: maxAbs return exceeds the band floor) */
function nonConvergentCloses() { const r = []; for (let i = 0; i < 300; i += 1) r.push(0.001); return closesFromReturns(r); }
/* pegged/managed series: mostly flat with rare tiny moves → managed-suppressed */
function peggedCloses() { const out = []; let p = 100; for (let i = 0; i < 170; i += 1) { p = p * (1 + (i % 20 === 0 ? 0.00003 : 0)); out.push(p); } return out; }
/* low, non-pegged volatility: tiny ±0.001 oscillation with drift → forecastVol below floor, NOT managed */
function lowVolCloses() { const out = []; let p = 100; for (let i = 0; i < 200; i += 1) { p = p * Math.exp(0.001 * (i % 2 ? 1 : -1) + 0.00005); out.push(Math.round(p * 1e6) / 1e6); } return out; }
/* short series → INSUFFICIENT_HISTORY (min 60) */
function shortCloses() { return closesFromReturns(simGarch(40, 0.00002, 0.08, 0.90, 5)); }

function cacheFor(barsBySymbol) {
    const now = Date.now();
    const buckets = {};
    for (const sym of Object.keys(barsBySymbol)) {
        buckets[sym] = { '1d': { at: now, src: 'pages-snapshot', rows: barRows(barsBySymbol[sym]) } };
    }
    return { v: 1, bars: buckets, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {} };
}

/*
 * Feature 012 Scope 15 (four-view experience shell, Model B): volatility-sizing-lab is now a WIRED
 * ordinary tool — the page registers __rlOwnerStateProvider["volatility-sizing-lab"] and the registry
 * binds it to the adapter simple-adapter/conditional-volatility/v1 — so rlviews.js resolves
 * ownerModes: ["power"] for it. On the default Simple view the shell therefore sets body.rlv-focused,
 * renders the production Simple ADAPTER panel ([data-rlexperience-panel="simple"]), and hides this
 * page's own content via the shell rule
 * `body.rlv-focused>*:not(#rlviews)...{display:none!important}` (rlviews.js).
 *
 * Nothing was deleted. The page's native research surface — the asset / estimator / target-vol /
 * history control bar and the #simpleView + #powerView cockpits — MOVED UNDER THE POWER VIEW. A test
 * that must SEE or DRIVE that native surface therefore drives the shell exactly as a production user
 * does: wait for the shell, then select Power. rlviews.js driveLegacy() also clicks this page's own
 * #powerTab, so the page enters its native Power mode. The control bar lives OUTSIDE
 * #simpleView/#powerView and stays rendered in both native modes, so every control interaction below
 * behaves exactly as it always did.
 *
 * Read-only assertions need NO switch and were left exactly as they were: Playwright's textContent /
 * getAttribute / innerText and toHaveText / toContainText resolve ATTACHED nodes, so assertions that
 * read this page's real #simpleView cockpit — which renderSimple() still refreshes on every render, in
 * BOTH native modes — are untouched.
 *
 * Mirrors the proven shell-driving pattern in tests/bond-regime-lab.spec.mjs and
 * tests/company-fundamentals-lab.spec.mjs.
 */

/* ════════════════ TP-15-06 TRACEABILITY (Feature 012 / Scope 15) ════════════════
 *
 * TP-15-06 declares: "E2E evidence proves volatility-sizing native Simple moved to Power
 * and Simple shows the panel or an honest unavailable pending the RLVOL provider"
 * — SCN-012-041, SCN-012-042.
 *
 * That evidence is carried by tests ALREADY IN THIS FILE. This block only makes the
 * declared row locatable by its TP id; it adds no assertion, changes no title, and
 * changes nothing any test verifies. Three carriers, each covering a distinct clause:
 *
 *   1. "native Simple MOVED TO POWER" — `openNativeResearchSurface` (directly above).
 *      It drives the shell as a production user does, then asserts `body` carries
 *      `data-rlview="power"`, that `body` does NOT carry `rlv-focused`, and that this
 *      page's own native control `#assetSelect` is VISIBLE. Every test needing the
 *      native surface routes through it (BS-002, BS-009, BS-014, the controls-recompute
 *      test …), so the move is exercised repeatedly rather than once.
 *
 *   2. "Simple SHOWS THE PANEL" — `TP-02-04: the volatility tool is reachable THROUGH
 *      the shared rlnav registration, not just by direct URL`. Arriving through the real
 *      nav it asserts `[data-rlexperience-panel="simple"]` is VISIBLE as the landed
 *      Simple surface while this page's own `#simpleView` is merely ATTACHED (rendered
 *      but off screen), then reaches the native surface under Power.
 *
 *   3. "OR AN HONEST UNAVAILABLE" — `Regression BS-009: insufficient history is
 *      unavailable with exact counts`. Under deliberately insufficient owner evidence it
 *      asserts the panel carries the REGISTRY-bound adapter id (read from
 *      simple-models.json, never hard-coded) and `data-rlexperience-simple-state
 *      ="unavailable"`, i.e. the adapter refuses to publish an invented number when the
 *      owner model says INSUFFICIENT_HISTORY. This is the honest-degradation arm, and it
 *      is conditioned on starved evidence — never on the provider being absent.
 *
 * WHICH ARM HOLDS TODAY — MEASURED, not assumed (real page, no fixture preseed, zero
 * interception): the RLVOL-backed owner-state provider EXISTS and yields owner state, so
 * the STRONGER arm holds. The Simple panel reaches `state="ready"` on
 * `simple-adapter/conditional-volatility/v1` with a real numeric read
 * ("Forecast 11.7304% (calm) annualized-decimal") and `body.rlv-focused` ON. The
 * "pending the RLVOL provider" honest-unavailable fallback is therefore NOT the live
 * production outcome; carrier 3 keeps that branch covered for starved evidence, which is
 * the only condition under which production should still degrade.
 *
 * NO TITLE WAS RENAMED. Verified before writing this block: nothing selects any carrier
 * by exact title — the only in-repo `--grep` callers
 * (tests/contextual-tooltip.functional.mjs, tests/tool-experience-registry.functional.mjs)
 * target titles in OTHER files, and the `TOOLS[…].title` map indirection lives only in the
 * tests/simple-model-adapters-*.spec.mjs files, which are untouched.
 * ═══════════════════════════════════════════════════════════════════════════════ */
const openNativeResearchSurface = async (page) => {
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    // Power IS in ownerModes, so rlv-focused clears and the native surface becomes visible again.
    await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
    await expect(page.locator('body')).not.toHaveClass(/\brlv-focused\b/);
    await expect(page.locator('#assetSelect')).toBeVisible();
};

async function open(page, cache, options = {}) {
    await page.addInitScript((payload) => { if (!localStorage.getItem('rlData')) localStorage.setItem('rlData', JSON.stringify(payload)); }, cache);
    await page.goto(site.baseUrl + '/volatility-sizing-lab.html');
    await page.waitForFunction(() => window.VolSizingLab && window.VolSizingLab.runtime && window.VolSizingLab.runtime.decision);
    if (options.asset || options.estimator) {
        // The native control bar driven immediately below is only on screen under the shell Power view
        // (Feature 012 Scope 15, Model B). Guarded so that callers which drive no native control keep
        // their exact previous behaviour — only the asset/estimator paths gain the shell switch.
        await openNativeResearchSurface(page);
    }
    if (options.asset) {
        await page.selectOption('#assetSelect', options.asset);
        await page.waitForFunction((a) => window.VolSizingLab.runtime.controls.asset === a && !window.VolSizingLab.runtime.refresh.active, options.asset);
    }
    if (options.estimator === 'garch11') {
        await page.click('#estimatorSeg button[data-estimator="garch11"]');
        await page.waitForFunction(() => window.VolSizingLab.runtime.controls.estimator === 'garch11');
    }
    if (options.mode === 'power') {
        await page.click('#rlviews button[data-rlview-mode="power"]');
        await page.waitForFunction(() => window.VolSizingLab.runtime.ui.mode === 'power');
    }
}

test('Regression BS-002: storm-gauge percentile always renders its trailing window and observation count', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const percentile = await page.locator('[data-regime-percentile]').textContent();
    const window = await page.locator('[data-regime-window]').textContent();
    expect(Number(percentile)).toBeGreaterThanOrEqual(0);
    expect(Number(percentile)).toBeLessThanOrEqual(100);
    expect(Number(window)).toBeGreaterThan(0);
    await expect(page.locator('#simpleView')).toContainText('trailing window of');
    await expect(page.locator('#simpleView')).toContainText('observations');
});

test('Regression BS-005: no directional element appears in Simple or Power', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }), { mode: 'power' });
    const simple = (await page.locator('#simpleView').innerText()).toLowerCase();
    await page.click('#rlviews button[data-rlview-mode="power"]');
    const power = (await page.locator('#powerView').innerText()).toLowerCase();
    const forbidden = /\b(buy|sell|bullish|bearish|uptrend|downtrend|overbought|oversold|breakout|go long|go short)\b/;
    expect(simple).not.toMatch(forbidden);
    expect(power).not.toMatch(forbidden);
    expect(simple).not.toContain('price target');
    expect(power).not.toContain('price target');
});

test('Regression BS-007: backtest is a deep-link with no in-tool verdict', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const href = await page.locator('[data-backtest-cta]').getAttribute('href');
    expect(href).toContain('strategy-validation-lab.html#focus=SPY');
    expect(href).toContain('src=volatility-sizing-lab');
    const simple = (await page.locator('#simpleView').innerText()).toLowerCase();
    expect(simple).not.toContain('cagr');
    expect(simple).not.toContain('sharpe');
    expect(simple).not.toContain('equity curve');
});

test('Regression BS-008: managed-suppressed history is marked, not calm/full-size', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses(), 'CNY=X': peggedCloses() }), { asset: 'CNY=X' });
    // Feature 012 Scope 15 (Model B): #simpleView can no longer be VISIBLE anywhere in production. On
    // shell-Simple the shell hides this whole page; on shell-Power rlviews driveLegacy() clicks this
    // page's own #powerTab and setMode() sets #simpleView.hidden. The shell additionally hides
    // #simpleTab/#powerTab, so the native Simple cockpit is genuinely unreachable — requiring
    // visibility here would assert a state production no longer has. The invariant the original
    // toBeVisible() was PROXYING is the badge toggle renderSimple() performs:
    //   q("[data-regime-managed]").classList.toggle("is-hidden", !d.regime.managedSuppressed)
    // so assert that toggle directly against the explicit native root. That is strictly MORE precise
    // than the original check, which could not have distinguished a silently inverted toggle from an
    // ancestor-hidden node. Nothing is dropped.
    await expect(page.locator('#simpleView [data-regime-managed]')).toBeAttached();
    await expect(page.locator('#simpleView [data-regime-managed]')).not.toHaveClass(/\bis-hidden\b/);
    // The managed mark the user actually SEES is the native Power degraded banner, so toBeVisible() is
    // preserved there verbatim. The root scope is REQUIRED, not cosmetic: once the page is in its
    // native Power mode render() calls both renderSimple() and renderPower(), so degradedBanner() is
    // injected into BOTH #simpleDegraded and #powerDegraded and an unscoped
    // [data-degraded="MANAGED_SUPPRESSED"] now matches 2 NATIVE nodes (strict-mode violation).
    await expect(page.locator('#powerView [data-degraded="MANAGED_SUPPRESSED"]')).toBeVisible();
    // Anti-divergence: the page's OTHER native surface must carry the identical reason (no split-brain).
    await expect(page.locator('#simpleView [data-degraded="MANAGED_SUPPRESSED"]')).toBeAttached();
    const suggestion = (await page.locator('[data-sizing-suggestion]').textContent()).toLowerCase();
    expect(suggestion).toContain('withheld');
    const managedSuppressed = await page.evaluate(() => window.VolSizingLab.runtime.decision.regime.managedSuppressed);
    const sizingState = await page.evaluate(() => window.VolSizingLab.runtime.decision.sizing.state);
    expect(managedSuppressed).toBe(true);
    expect(sizingState).toBe('unavailable');
});

// TP-15-06 CARRIER 3/3 — the "or an honest unavailable" arm. Under deliberately starved owner
// evidence the registry-bound adapter must project `unavailable` rather than invent a number.
// See the TP-15-06 traceability block near the top of this file.
test('Regression BS-009: insufficient history is unavailable with exact counts', async ({ page }) => {
    await open(page, cacheFor({ SPY: shortCloses() }));
    // ANTI-DIVERGENCE (new invariant, Feature 012 Scope 15). The Simple surface a production user now
    // sees for this tool is the production ADAPTER panel, not this page's #simpleView. Assert — while
    // the shell is still on Simple, which is where that panel is on screen — that the adapter the
    // REGISTRY binds to this tool projects the SAME unavailable verdict the owner decision reaches
    // below. The adapter id is read from simple-models.json rather than hard-coded, so a registry
    // rebinding cannot slip past. If the adapter ever published a `ready` projection carrying an
    // invented number while the owner model says INSUFFICIENT_HISTORY, this fails.
    const { readFileSync } = await import('node:fs');
    const registryAdapterId = JSON.parse(readFileSync(new URL('../simple-models.json', import.meta.url), 'utf8'))
        .definitions.find((definition) => definition.toolId === 'volatility-sizing-lab').adapterId;
    const adapterPanel = page.locator('[data-rlexperience-panel="simple"]');
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await expect(adapterPanel).toHaveAttribute('data-rlexperience-adapter', registryAdapterId);
    await expect(adapterPanel).toHaveAttribute('data-rlexperience-simple-state', 'unavailable');
    await expect(adapterPanel).toBeVisible();
    // The native degraded banner moved under the Power view, so the ORIGINAL assertions below are bound
    // to an explicit NATIVE root. The scope is REQUIRED, not cosmetic: in native Power mode render()
    // calls both renderSimple() and renderPower(), so degradedBanner() is injected into BOTH
    // #simpleDegraded and #powerDegraded and an unscoped [data-degraded="INSUFFICIENT_HISTORY"] now
    // matches 2 NATIVE nodes (strict-mode violation). Both halves are asserted; neither is dropped.
    await openNativeResearchSurface(page);
    await expect(page.locator('#powerView [data-degraded="INSUFFICIENT_HISTORY"]')).toBeVisible();
    await expect(page.locator('#powerView [data-degraded="INSUFFICIENT_HISTORY"]')).toContainText('required minimum');
    // The page's OTHER native surface must carry the identical reason and counts (no split-brain).
    await expect(page.locator('#simpleView [data-degraded="INSUFFICIENT_HISTORY"]')).toContainText('required minimum');
    const state = await page.evaluate(() => window.VolSizingLab.runtime.decision.state);
    const coverage = await page.evaluate(() => window.VolSizingLab.runtime.decision.coverage);
    expect(state).toBe('unavailable');
    expect(coverage.required).toBe(60);
    expect(coverage.available).toBeLessThan(60);
    await expect(page.locator('[data-forecast-value]')).toHaveText('--');
});

test('Regression BS-010: Simple and Power share one decision identity', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }), { mode: 'power' });
    const simpleId = await page.locator('[data-decision-id]').textContent();
    const powerId = await page.locator('[data-decision-id-power]').textContent();
    expect(simpleId).toBe(powerId);
    const runtimeId = await page.evaluate(() => window.VolSizingLab.runtime.decision.decisionId);
    expect(simpleId).toContain(runtimeId);
});

test('Regression BS-004: near-zero forecast vol floors the multiplier at the cap', async ({ page }) => {
    await open(page, cacheFor({ SPY: lowVolCloses() }));
    const managed = await page.evaluate(() => window.VolSizingLab.runtime.decision.regime.managedSuppressed);
    expect(managed).toBe(false);
    const decision = await page.evaluate(() => window.VolSizingLab.runtime.decision.sizing);
    expect(decision.multiplier).toBe(decision.cap);
    expect(Number.isFinite(decision.multiplier)).toBe(true);
    await expect(page.locator('[data-sizing-suggestion]')).toContainText('×' + decision.cap.toFixed(2));
});

test('Regression BS-006: GARCH fit is labeled a lightweight optimizer not MLE', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }), { estimator: 'garch11', mode: 'power' });
    const resolved = await page.evaluate(() => window.VolSizingLab.runtime.decision.diagnostics.estimatorResolved);
    expect(resolved).toBe('garch11');
    await expect(page.locator('[data-estimator-resolved]')).toContainText('lightweight optimizer');
    const power = (await page.locator('#powerView').innerText()).toLowerCase();
    expect(power).not.toContain('maximum likelihood');
    expect(power).not.toContain('mle');
    expect(power).not.toContain('institutional');
});

test('Regression BS-011: non-convergent GARCH falls back to labeled EWMA', async ({ page }) => {
    await open(page, cacheFor({ SPY: nonConvergentCloses() }), { estimator: 'garch11' });
    const resolved = await page.evaluate(() => window.VolSizingLab.runtime.decision.diagnostics.estimatorResolved);
    const converged = await page.evaluate(() => window.VolSizingLab.runtime.decision.diagnostics.garchConverged);
    expect(resolved).toBe('ewma');
    expect(converged).toBe(false);
    await expect(page.locator('#simpleView')).toContainText('did not converge');
    const forecastValue = await page.locator('[data-forecast-value]').textContent();
    expect(Number(forecastValue)).toBeGreaterThan(0);
});

test('Regression BS-013: realized is never relabeled a forecast in the owner read', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const kinds = await page.evaluate(() => {
        const d = window.VolSizingLab.runtime.decision;
        return { forecast: d.forecast.kind, forecastEst: d.forecast.estimator, realized: d.realized.kind, realizedEst: d.realized.estimator };
    });
    expect(kinds.forecast).toBe('forecast');
    expect(kinds.realized).toBe('realized');
    expect(kinds.realizedEst).toBe('realized-rolling');
    const owner = await page.evaluate(() => JSON.parse(JSON.stringify(RLDATA.toolRead('volatility-sizing-lab'))));
    expect(owner.metrics.forecastVol).not.toBeNull();
    expect(owner.metrics.realizedVol).not.toBeNull();
    await expect(page.locator('[data-forecast-kind]')).toHaveText('forecast');
});

test('Regression BS-014: longer history is caveated and reproduces no multi-decade claim', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    // The native #historyRange control driven below lives under the Power view (Feature 012 Scope 15).
    await openNativeResearchSurface(page);
    await page.selectOption('#historyRange', '10y');
    await page.waitForFunction(() => window.VolSizingLab.runtime.controls.historyRange === '10y' && !window.VolSizingLab.runtime.refresh.active);
    const limitations = await page.evaluate(() => window.VolSizingLab.runtime.decision.limitations.join(' '));
    expect(limitations.toLowerCase()).toContain('best-effort');
    const owner = await page.evaluate(() => JSON.stringify(RLDATA.toolRead('volatility-sizing-lab')));
    expect(owner.toLowerCase()).not.toContain('outperform');
    expect(owner).not.toMatch(/1[05]0?-year|multi-decade/i);
});

test('Cache-first partial paint renders synchronous non-blank canvases with text and table fallback', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }), { mode: 'power' });
    await expect(page.locator('[data-chart-summary="term"]')).not.toHaveText('--');
    const termRows = await page.locator('#termTable tr').count();
    expect(termRows).toBeGreaterThan(0);
    const nonBlank = await page.evaluate(() => {
        const canvas = document.getElementById('termChart');
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let painted = 0;
        for (let i = 0; i < data.length; i += 4) { if (data[i] !== 10 || data[i + 1] !== 18 || data[i + 2] !== 24) painted += 1; }
        return painted;
    });
    expect(nonBlank).toBeGreaterThan(50);
});

test('Controls recompute one decision without any market-data request', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const barRequests = [];
    page.on('request', (request) => { const url = request.url(); if (/\/data\/bars\/|query1\.finance\.yahoo\.com/.test(url)) barRequests.push(url); });
    // The native #targetVolInput control driven below lives under the Power view (Feature 012 Scope 15).
    // The switch is deliberately placed AFTER the request listener is attached and INSIDE the counted
    // window, so the no-market-data-request invariant now covers the shell view change as well as the
    // control change. Nothing about the interception/counting logic below is altered, and a request
    // issued by the view switch would FAIL this test rather than be masked by it.
    await openNativeResearchSurface(page);
    const before = await page.evaluate(() => window.VolSizingLab.runtime.decision.decisionId);
    await page.fill('#targetVolInput', '25');
    await page.waitForFunction((prev) => window.VolSizingLab.runtime.decision.decisionId !== prev, before);
    await page.waitForTimeout(200);
    expect(barRequests).toEqual([]);
    const after = await page.evaluate(() => window.VolSizingLab.runtime.decision.controls.targetVol);
    expect(after).toBeCloseTo(0.25, 5);
});

test('Power canvases carry aria-label and same-data table on desktop and mobile', async ({ page }) => {
    for (const size of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
        await page.setViewportSize(size);
        await open(page, cacheFor({ SPY: clusteredCloses() }), { mode: 'power' });
        for (const id of ['termChart', 'persistenceChart', 'estimatorChart']) {
            await expect(page.locator('#' + id)).toHaveAttribute('aria-label', /.+/);
        }
        expect(await page.locator('#termTable tr').count()).toBeGreaterThan(0);
        expect(await page.locator('#persistenceTable tr').count()).toBeGreaterThan(0);
        expect(await page.locator('#estimatorTable tr').count()).toBeGreaterThan(0);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow).toBeLessThanOrEqual(2);
    }
});

test('Registered Volatility Sizing tool publishes one owner read and Market Brief renders it without recompute', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const ownerRead = await page.evaluate(() => JSON.parse(JSON.stringify(RLDATA.toolRead('volatility-sizing-lab'))));
    expect(ownerRead.contractVersion).toBe('rl-tool-read/v1');
    expect(ownerRead.id).toBe('volatility-sizing-lab');
    expect(ownerRead.availability).toBe('current');
    expect(ownerRead.read).toContain('conditional vol');
    // Same browser context → shared localStorage rlData carries the published owner read to the brief.
    // The brief loads its owner-read renderer (RLBRIEF) and the shared cache (RLDATA) but NOT the
    // volatility model (RLVOL): it consumes the published owner read and never recomputes it.
    await page.goto(site.baseUrl + '/market-brief.html');
    const rendered = await page.evaluate(async (publishedRead) => {
        const tools = await fetch('tools.json').then((r) => r.json());
        const snap = await fetch('market-brief.snapshot.json').then((r) => r.json()).catch(() => ({}));
        const host = document.createElement('div');
        RLBRIEF.renderToolReads(host, tools.tools, snap.toolReads || {}, RLDATA.toolRead() || {});
        const volNode = Array.from(host.querySelectorAll('.toolread')).find((n) => /Vol-Targeting/.test(n.innerText));
        return { hasVol: !!volNode, volText: volNode ? volNode.innerText : '', containsRead: volNode ? volNode.innerText.indexOf(publishedRead) >= 0 : false, hasRlvol: typeof window.RLVOL };
    }, ownerRead.read);
    expect(rendered.hasVol).toBe(true);
    expect(rendered.volText).toContain('conditional vol');
    expect(rendered.volText).toContain('browser');
    expect(rendered.containsRead).toBe(true);
    expect(rendered.hasRlvol).toBe('undefined');
});

// TP-15-06 CARRIER 2/3 — the "Simple shows the panel" arm: arriving through the real shared nav,
// the adapter panel is the VISIBLE Simple surface while this page's own #simpleView is
// attached-but-off-screen, and the native surface is reachable under Power.
// See the TP-15-06 traceability block near the top of this file.
test('TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL', async ({ page }) => {
    // Sanctioned cache-first preseed so the registered route boots deterministically once the nav lands on it.
    await page.addInitScript((payload) => { if (!localStorage.getItem('rlData')) localStorage.setItem('rlData', JSON.stringify(payload)); }, cacheFor({ SPY: clusteredCloses() }));
    // Start on a DIFFERENT page that carries the shared left-nav drawer injected by rlnav.js (index.html loads rlnav.js).
    await page.goto(site.baseUrl + '/index.html');
    // The drawer is collapsed by default; open it via its real launcher control (the same control a user uses).
    await page.click('#rlnav-launcher');
    await page.waitForSelector('#rlnav.open');
    // Locate the Volatility Sizing Lab entry by its REGISTERED nav label ("Vol Sizing", from rlnav.js / tools.json).
    const navEntry = page.locator('#rlnav a.rlnav-item', { hasText: 'Vol Sizing' });
    await expect(navEntry).toHaveCount(1);
    // The registration contract: the nav entry points at the registered file basename (a broken registry entry fails here).
    await expect(navEntry).toHaveAttribute('href', 'volatility-sizing-lab.html');
    // Follow the registered route THROUGH the nav (a real click, not a hand-typed URL).
    await navEntry.click();
    await page.waitForURL('**/volatility-sizing-lab.html');
    // The registered route resolves to the real tool page: correct document title, booted runtime, and the Simple cockpit.
    await expect(page).toHaveTitle(/Volatility Regime & Vol-Targeting Sizing Lab/);
    await page.waitForFunction(() => window.VolSizingLab && window.VolSizingLab.runtime && window.VolSizingLab.runtime.decision);
    // Feature 012 Scope 15 (Model B): the registered route now renders THROUGH the experience shell, so
    // the Simple cockpit a production user lands on is the production ADAPTER panel and this page's own
    // #simpleView is deliberately off screen (it is still RENDERED, and renderSimple() still refreshes
    // it on every render). Assert both halves of that split — the Simple surface actually on screen and
    // this page's own cockpit node — instead of a single node Model B has taken off screen.
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await expect(page.locator('[data-rlexperience-panel="simple"]')).toBeVisible();
    await expect(page.locator('#simpleView')).toBeAttached();
    // ...and the native research surface is reachable from the landed route under the Power view. The
    // original #assetSelect visibility assertion is preserved verbatim (openNativeResearchSurface also
    // anchors on it), which is what proves the registered route really booted this tool's own controls.
    await openNativeResearchSurface(page);
    await expect(page.locator('#powerView')).toBeVisible();
    await expect(page.locator('#assetSelect')).toBeVisible();
});
