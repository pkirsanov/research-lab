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
function simArch(n, omega, alpha, seed) {
    const rng = makeRng(seed); let sig2 = omega / (1 - alpha); const r = [];
    for (let i = 0; i < n; i += 1) { const e = gauss(rng); const x = Math.sqrt(sig2) * e; r.push(x); sig2 = omega + alpha * x * x; }
    return r;
}
function iidReturns(n, sigma, seed) { const rng = makeRng(seed); const r = []; for (let i = 0; i < n; i += 1) r.push(sigma * gauss(rng)); return r; }
function closesFromReturns(returns, start = 100) { const closes = [start]; for (const r of returns) closes.push(closes[closes.length - 1] * Math.exp(r)); return closes; }
function baseT(count) { return Date.UTC(2024, 0, 2) - (count - 1) * 86400000 + 200 * 86400000; }
function barRows(closes) { const b0 = Date.UTC(2023, 0, 2); return closes.map((c, i) => ({ t: b0 + i * 86400000, c: Math.round(c * 1e4) / 1e4 })); }

/* clustered, high-persistence, GARCH-convergent series with a recent burst */
function clusteredCloses(seed = 99) { return closesFromReturns(simGarch(300, 0.00002, 0.08, 0.90, seed).concat([0.055, -0.05, 0.058])); }
/* the same clustered shape scaled to roughly 30% annualized forecast vol, preserving its storm percentile */
function halfThrottleStormCloses(seed = 99) { return closesFromReturns(simGarch(300, 0.00002, 0.08, 0.90, seed).concat([0.055, -0.05, 0.058]).map((value) => value * 0.336)); }
/* constant daily return → zero variance → GARCH cannot estimate ω → FIT_NONCONVERGENT → labeled EWMA fallback (and NOT managed-suppressed: maxAbs return exceeds the band floor) */
function nonConvergentCloses() { const r = []; for (let i = 0; i < 300; i += 1) r.push(0.001); return closesFromReturns(r); }
/* pegged/managed series: mostly flat with rare tiny moves → managed-suppressed */
function peggedCloses() { const out = []; let p = 100; for (let i = 0; i < 170; i += 1) { p = p * (1 + (i % 20 === 0 ? 0.00003 : 0)); out.push(p); } return out; }
/* low, non-pegged volatility: tiny ±0.001 oscillation with drift → forecastVol below floor, NOT managed */
function lowVolCloses() { const out = []; let p = 100; for (let i = 0; i < 200; i += 1) { p = p * Math.exp(0.001 * (i % 2 ? 1 : -1) + 0.00005); out.push(Math.round(p * 1e6) / 1e6); } return out; }
/* short series → INSUFFICIENT_HISTORY (min 60) */
function shortCloses() { return closesFromReturns(simGarch(40, 0.00002, 0.08, 0.90, 5)); }
/* short-memory ARCH series → fitted GARCH persistence diverges materially from EWMA λ=0.94 */
function divergentPersistenceCloses() { return closesFromReturns(simArch(400, 0.00005, 0.35, 7)); }

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

test('Regression BS-001: high-persistence forecast stays elevated and typed forecast', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }), { estimator: 'garch11', mode: 'power' });
    const forecast = await page.evaluate(() => {
        const decision = window.VolSizingLab.runtime.decision;
        return {
            kind: decision.forecast.kind,
            value: decision.forecast.value,
            longRunVol: decision.term.longRunVol,
            persistence: decision.persistence.persistence,
            estimator: decision.diagnostics.estimatorResolved
        };
    });
    expect(forecast.estimator).toBe('garch11');
    expect(forecast.kind).toBe('forecast');
    expect(forecast.persistence).toBeGreaterThan(0.8);
    expect(forecast.value).toBeGreaterThan(forecast.longRunVol);
    await expect(page.locator('#powerView [data-chart-summary="term"]')).toContainText('GARCH11 forecast term');
});

test('Regression BS-003: sizing multiplier throttles to about half in a storm with a worked example', async ({ page }) => {
    await open(page, cacheFor({ SPY: halfThrottleStormCloses() }), { mode: 'power' });
    await page.fill('#targetVolInput', '15');
    await page.waitForFunction(() => window.VolSizingLab.runtime.decision.controls.targetVol === 0.15);
    const sizing = await page.evaluate(() => {
        const decision = window.VolSizingLab.runtime.decision;
        return {
            multiplier: decision.sizing.multiplier,
            expected: Math.min(decision.sizing.cap, decision.controls.targetVol / Math.max(decision.sizing.forecastVolFloor, decision.forecast.value)),
            forecastVol: decision.forecast.value,
            regime: decision.regime.band,
            notional: decision.sizing.workedExample.notional,
            conditionalExposure: decision.sizing.workedExample.conditionalExposure
        };
    });
    expect(sizing.multiplier).toBeCloseTo(sizing.expected, 10);
    expect(sizing.forecastVol).toBeCloseTo(0.30, 1);
    expect(sizing.regime).toBe('storm');
    expect(sizing.multiplier).toBeCloseTo(0.5, 1);
    expect(sizing.notional).toBe(100000);
    expect(sizing.conditionalExposure).toBeCloseTo(sizing.notional * sizing.multiplier, 6);
    await expect(page.locator('#powerView [data-worked-example]')).toContainText('conditional exposure');
    await expect(page.locator('#powerView [data-sizing-conditional]')).toContainText('apply only if a separate signal fires');
    const assumption = page.locator('#powerView [data-sizing-assumption]');
    await expect(assumption).toBeVisible();
    await expect(assumption).toContainText('holds risk steady, not growth');
    await expect(assumption).toContainText('growth-optimal sizing');
    await expect(assumption).toContainText('1/vol²');
});

test('Regression BS-012: EWMA-vs-GARCH persistence divergence is shown not averaged', async ({ page }) => {
    await open(page, cacheFor({ SPY: divergentPersistenceCloses() }), { estimator: 'garch11', mode: 'power' });
    const result = await page.evaluate(() => {
        const decision = window.VolSizingLab.runtime.decision;
        return {
            estimator: decision.diagnostics.estimatorResolved,
            persistence: decision.persistence.persistence,
            conflictCodes: decision.conflicts.map((conflict) => conflict.code)
        };
    });
    expect(result.estimator).toBe('garch11');
    expect(Math.abs(result.persistence - 0.94)).toBeGreaterThan(0.1);
    expect(result.conflictCodes).toContain('EWMA_GARCH_PERSISTENCE_DIVERGENCE');
    await expect(page.locator('#powerView [data-conflicts]')).toContainText('EWMA_GARCH_PERSISTENCE_DIVERGENCE');
    await expect(page.locator('#powerView [data-chart-summary="estimator"]')).toContainText('shown not averaged');
});

test('Regression BS-002: storm-gauge percentile always renders its trailing window and observation count', async ({ page }) => {
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const percentile = await page.locator('[data-regime-percentile]').textContent();
    const window = await page.locator('[data-regime-window]').textContent();
    expect(Number(percentile)).toBeGreaterThanOrEqual(0);
    expect(Number(percentile)).toBeLessThanOrEqual(100);
    expect(Number(window)).toBeGreaterThan(0);
    await expect(page.locator('#simpleView')).toContainText('trailing window of');
    await expect(page.locator('#simpleView')).toContainText('observations');
    const visibleSimple = page.locator('[data-rlexperience-panel="simple"]');
    await expect(visibleSimple).toBeVisible();
    await expect(visibleSimple).toContainText('percentile');
    await expect(visibleSimple).toContainText(window + ' observations');
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
    await open(page, cacheFor({ SPY: clusteredCloses() }));
    const native = await page.evaluate(() => {
        const decision = window.VolSizingLab.runtime.decision;
        return {
            forecastPct: (decision.forecast.value * 100).toFixed(4),
            regime: decision.regime.band,
            percentile: Math.round(decision.regime.percentile),
            window: decision.regime.windowRef.observations,
            multiplier: decision.sizing.multiplier.toFixed(2)
        };
    });
    const visibleSimple = page.locator('[data-rlexperience-panel="simple"]');
    await expect(visibleSimple).toBeVisible();
    await expect(visibleSimple).toContainText('Forecast ' + native.forecastPct + '%');
    await expect(visibleSimple).toContainText(native.regime);
    await expect(visibleSimple).toContainText(native.percentile + 'th percentile');
    await expect(visibleSimple).toContainText(native.window + ' observations');
    await expect(visibleSimple).toContainText('×' + native.multiplier);
    await openNativeResearchSurface(page);
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

test('Cache-first partial paint renders before stale-cache delta completion with synchronous non-blank canvases and table fallback', async ({ page }) => {
    const staleCache = cacheFor({ SPY: clusteredCloses() });
    staleCache.bars.SPY['1d'].at = Date.now() - 365 * 86400000;
    await page.addInitScript(() => {
        window.__volFirstPaintAt = null;
        window.__volFirstPaintDecision = null;
        const inspect = () => {
            const node = document.querySelector('[data-forecast-value]');
            if (window.__volFirstPaintAt === null && node && /^\d/.test(node.textContent || '')) {
                const decision = window.VolSizingLab && window.VolSizingLab.runtime && window.VolSizingLab.runtime.decision;
                window.__volFirstPaintAt = performance.now();
                window.__volFirstPaintDecision = decision ? {
                    decisionId: decision.decisionId,
                    observedAsOf: decision.forecast.observedAsOf
                } : null;
            }
        };
        const install = () => {
            if (!document.documentElement) return;
            new MutationObserver(inspect).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
            inspect();
        };
        if (document.documentElement) install(); else document.addEventListener('readystatechange', install, { once: true });
    });
    await open(page, staleCache, { mode: 'power' });
    await page.waitForFunction(() => {
        const barResource = performance.getEntriesByType('resource').find((entry) => /\/data\/bars\/SPY\.json(?:\?|$)/.test(entry.name));
        const runtime = window.VolSizingLab && window.VolSizingLab.runtime;
        return !!barResource && barResource.responseEnd > 0 && !!runtime && !!runtime.decision && !runtime.refresh.active;
    });
    await expect(page.locator('[data-chart-summary="term"]')).not.toHaveText('--');
    const termRows = await page.locator('#termTable tr').count();
    expect(termRows).toBeGreaterThan(0);
    const chronology = await page.evaluate(() => {
        const barResource = performance.getEntriesByType('resource').find((entry) => /\/data\/bars\/SPY\.json(?:\?|$)/.test(entry.name));
        const decision = window.VolSizingLab.runtime.decision;
        return {
            firstPaintAt: window.__volFirstPaintAt,
            deltaResponseEnd: barResource ? barResource.responseEnd : null,
            firstDecision: window.__volFirstPaintDecision,
            latestDecision: { decisionId: decision.decisionId, observedAsOf: decision.forecast.observedAsOf }
        };
    });
    expect(chronology.firstPaintAt).not.toBeNull();
    expect(chronology.deltaResponseEnd).not.toBeNull();
    expect(chronology.firstPaintAt).toBeLessThan(chronology.deltaResponseEnd);
    expect(chronology.firstDecision).not.toBeNull();
    expect(chronology.latestDecision.decisionId).not.toBe(chronology.firstDecision.decisionId);
    expect(Date.parse(chronology.latestDecision.observedAsOf)).toBeGreaterThan(Date.parse(chronology.firstDecision.observedAsOf));
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
    await page.waitForFunction(() => document.querySelectorAll('#toolReads .toolread').length > 0);
    const volNode = page.locator('#toolReads .toolread', { hasText: 'Volatility Regime & Vol-Targeting Sizing Lab' });
    await expect(volNode).toHaveCount(1);
    await expect(volNode).toContainText('conditional vol');
    await expect(volNode).toContainText('browser');
    const substantiveRead = ownerRead.read.slice(ownerRead.read.indexOf('conditional vol'));
    await expect(volNode.locator('.ay')).toContainText(substantiveRead);
    expect(await page.evaluate(() => typeof window.RLVOL)).toBe('undefined');
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

/* ═══════════════════════════════════════════════════════════════════════════════
 * specs/027-company-scoped-owner-deep-links Scope 2 — the catalog-bound subject handoff.
 *
 * This route holds a company as a variable behind a CLOSED eleven-asset catalog, so
 * grammar acceptance is necessary and not sufficient: an accepted string is applied only
 * after it matches runtime.config.assets[].symbol, and otherwise the route names it as
 * unavailable while the default asset stays fully computed. No title above was renamed
 * and no assertion above was weakened — these are additive.
 * ═══════════════════════════════════════════════════════════════════════════════ */

const LINKED_CACHE = () => cacheFor({ SPY: clusteredCloses(), NVDA: clusteredCloses(7) });

async function openWithQuery(page, query) {
    await page.addInitScript((payload) => { if (!localStorage.getItem('rlData')) localStorage.setItem('rlData', JSON.stringify(payload)); }, LINKED_CACHE());
    await page.goto(site.baseUrl + '/volatility-sizing-lab.html' + query);
    await page.waitForFunction(() => window.VolSizingLab && window.VolSizingLab.runtime && window.VolSizingLab.runtime.decision);
}

async function firstPaint(page) {
    return page.evaluate(() => {
        /* The RLTKR decorator appends an "Explain <ticker>" button inside ticker-bearing nodes, so
         * a raw textContent read yields "SPY?" wherever it has run -- which depends on the shared
         * cache and so differs between a local run and CI. Whether the affordance rendered is not
         * what these assertions are about; the subject underneath it is. */
        const undecorated = (node) => {
            if (!node) return null;
            const clone = node.cloneNode(true);
            clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
            return (clone.textContent || '').trim();
        };
        const notice = document.getElementById('linkNotice');
        const decision = window.VolSizingLab.runtime.decision;
        return {
            asset: window.VolSizingLab.runtime.controls.asset,
            selectValue: document.getElementById('assetSelect').value,
            targetVolInput: document.getElementById('targetVolInput').value,
            targetVol: window.VolSizingLab.runtime.controls.targetVol,
            assetName: undecorated(document.querySelector('[data-asset-name]')),
            decisionState: decision.state,
            noticeText: notice ? notice.textContent : null,
            noticeHidden: notice ? notice.hidden : null
        };
    });
}

/* Captured from the unmodified route before any Scope 2 edit and pinned here, so this
   assertion compares against the pre-feature paint rather than against the post-change
   value of the same run. */
const UNLINKED_BASELINE = {
    asset: 'SPY',
    selectValue: 'SPY',
    targetVolInput: '15',
    targetVol: 0.15,
    assetName: 'SPY',
    decisionState: 'ready'
};

test('Regression: SCN-027-005 with no subject parameter the first-paint DOM and the computed decision are identical to the pre-feature baseline', async ({ page }) => {
    await openWithQuery(page, '');
    const paint = await firstPaint(page);
    console.log('SCN-027-005 VOLATILITY UNLINKED PAINT: ' + JSON.stringify(paint));
    expect({
        asset: paint.asset,
        selectValue: paint.selectValue,
        targetVolInput: paint.targetVolInput,
        targetVol: paint.targetVol,
        assetName: paint.assetName,
        decisionState: paint.decisionState
    }).toEqual(UNLINKED_BASELINE);
    expect(paint.noticeHidden).toBe(true);
    expect(paint.noticeText).toBe('');
});

test('Regression: SCN-027-001 ?ticker=NVDA selects NVDA in the asset select and names it on screen', async ({ page }) => {
    await openWithQuery(page, '?ticker=NVDA');
    const paint = await firstPaint(page);
    expect(paint.asset).toBe('NVDA');
    expect(paint.selectValue).toBe('NVDA');
    expect(paint.assetName).toBe('NVDA');
    /* the catalog's own default target vol for NVDA, not the default asset's 15% */
    expect(paint.targetVolInput).toBe('25');
    expect(paint.targetVol).toBeCloseTo(0.25, 10);
    expect(paint.noticeHidden).toBe(true);
});

test('Regression: SCN-027-004 the active subject is readable as page text and in the accessibility tree, not only inside a chart', async ({ page }) => {
    await openWithQuery(page, '?ticker=NVDA');
    await openNativeResearchSurface(page);
    const named = page.locator('#simpleView [data-asset-name], #powerView [data-asset-name]').first();
    /* The RLTKR decorator injects an "Explain <ticker>" affordance button after every KNOWN
     * ticker, so this node renders as "NVDA?" wherever that decorator has run — which depends on
     * the shared cache and so differs between a local run and CI. Strip ONLY those injected
     * buttons: the subject itself must still render verbatim as page text, which is the claim. */
    const namedText = () => named.evaluate((node) => {
      const clone = node.cloneNode(true);
      clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
      return (clone.textContent || '').trim();
    });
    await expect.poll(namedText).toBe('NVDA');
    expect(await named.evaluate((node) => node.closest('canvas') === null)).toBe(true);
    const option = page.locator('#assetSelect option[value="NVDA"]');
    await expect(option).toHaveCount(1);
    expect((await option.textContent()).trim().startsWith('NVDA —')).toBe(true);
    expect(await page.locator('#assetSelect').inputValue()).toBe('NVDA');
});

test('Regression: SCN-027-012 an acceptable company outside the eleven-asset universe is named as unavailable and the default asset stays fully computed', async ({ page }) => {
    await openWithQuery(page, '?ticker=TSLA');
    const paint = await firstPaint(page);
    /* TSLA passes the shared grammar but is not one of the eleven catalog entries */
    expect(paint.noticeHidden).toBe(false);
    expect(paint.noticeText).toContain('TSLA');
    expect(paint.noticeText).toMatch(/no data|does not cover|not covered/i);
    /* the default asset is still selected AND still fully computed — never a blank view */
    expect(paint.asset).toBe('SPY');
    expect(paint.selectValue).toBe('SPY');
    expect(paint.assetName).toBe('SPY');
    expect(paint.targetVolInput).toBe('15');
    await expect(page.locator('[data-decision-id]')).toContainText('decision ');
    const catalog = await page.evaluate(() => window.VolSizingLab.runtime.config.assets.map((a) => a.symbol));
    expect(catalog).toHaveLength(11);
    expect(catalog).not.toContain('TSLA');
});

/* The catalog binding is the whole of what keeps an accepted-but-uncatalogued company out of
   this route's state, yet the two SCN-027-012 assertions above can only reach their subject
   AFTER openWithQuery has waited for a completed decision. Removing the binding stops that
   decision from ever arriving — boot never even publishes window.VolSizingLab — so those
   assertions report a 30-second timeout, a verdict indistinguishable from machine contention,
   instead of naming the defect. This one observes the binding in the DOM, which
   applyLinkedSubject writes before any data path is required and before the global is
   published, so the same removal fails fast and says what broke. */
test('Regression: SCN-027-012 the catalog binding is discriminating on its own — an accepted but uncatalogued subject never becomes the active asset', async ({ page }) => {
    await page.addInitScript((payload) => { if (!localStorage.getItem('rlData')) localStorage.setItem('rlData', JSON.stringify(payload)); }, LINKED_CACHE());
    await page.goto(site.baseUrl + '/volatility-sizing-lab.html?ticker=TSLA');
    /* populateAssets and applyLinkedSubject run in one synchronous block, so options existing
       means the subject has already been applied or rejected. No decision is awaited. */
    await page.waitForFunction(() => document.querySelectorAll('#assetSelect option').length > 0,
        null, { timeout: 15000 });
    const bound = await page.evaluate(() => {
        const notice = document.getElementById('linkNotice');
        return {
            selectValue: document.getElementById('assetSelect').value,
            options: Array.from(document.querySelectorAll('#assetSelect option')).map((o) => o.value),
            accepted: window.RLTKR.linkedSubject('?ticker=TSLA').status,
            configErrorShown: !document.getElementById('configError').classList.contains('is-hidden'),
            noticeHidden: notice.hidden,
            noticeText: notice.textContent
        };
    });
    /* the subject passes the shared grammar, so nothing below is explained away by a refusal */
    expect(bound.accepted).toBe('accepted');
    expect(bound.options).not.toContain('TSLA');
    /* the binding itself: an accepted non-member is never adopted, and whatever IS active is a member */
    expect(bound.selectValue).not.toBe('TSLA');
    expect(bound.options).toContain(bound.selectValue);
    /* the unavailable branch is live code, not a branch the binding made unreachable */
    expect(bound.noticeHidden).toBe(false);
    expect(bound.noticeText).toContain('TSLA');
    /* and the route is still healthy rather than parked on its config-error panel */
    expect(bound.configErrorShown).toBe(false);
});

test('Regression: SCN-027-013 after a refusal every control reflects one single subject and none reflects the refused value', async ({ page }) => {
    await openWithQuery(page, '?ticker=' + encodeURIComponent('NV DA/../x'));
    const paint = await firstPaint(page);
    expect(paint.noticeHidden).toBe(false);
    expect(paint.noticeText).not.toContain('NV DA');
    expect(paint.noticeText).not.toContain('..');
    expect(paint.asset).toBe('SPY');
    expect(paint.selectValue).toBe('SPY');
    expect(paint.assetName).toBe('SPY');
    const consistent = await page.evaluate(() => {
        // The rendered subject carries the decorator's affordance; the runtime values do not.
        const undecorated = (node) => {
            const clone = node.cloneNode(true);
            clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
            return (clone.textContent || '').trim();
        };
        const runtime = window.VolSizingLab.runtime;
        return {
            control: runtime.controls.asset,
            select: document.getElementById('assetSelect').value,
            named: Array.from(document.querySelectorAll('[data-asset-name]')).map(undecorated)
        };
    });
    expect(new Set([consistent.control, consistent.select].concat(consistent.named)).size).toBe(1);
});

test('Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage, and empty and whitespace parameters match the no-parameter paint', async ({ page }) => {
    await openWithQuery(page, '');
    const bare = await firstPaint(page);
    for (const query of ['?ticker=', '?ticker=%20%20%09']) {
        await openWithQuery(page, query);
        const paint = await firstPaint(page);
        expect(paint, 'empty/whitespace must paint exactly as no parameter: ' + query).toEqual(bare);
    }
    const corpus = [
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '../../etc/passwd',
        'SPY"onload="alert(1)',
        "SPY';DROP TABLE--",
        'A'.repeat(64)
    ];
    for (const value of corpus) {
        await openWithQuery(page, '?ticker=' + encodeURIComponent(value));
        const leak = await page.evaluate((needle) => {
            const html = document.documentElement.outerHTML;
            const storage = Object.keys(localStorage).map((key) => key + '=' + localStorage.getItem(key)).join('\n');
            return { inHtml: html.indexOf(needle) !== -1, inStorage: storage.indexOf(needle) !== -1, asset: window.VolSizingLab.runtime.controls.asset };
        }, value);
        expect(leak.inHtml, 'corpus value must not reach the document: ' + value).toBe(false);
        expect(leak.inStorage, 'corpus value must not reach localStorage: ' + value).toBe(false);
        expect(leak.asset, 'a refused value must never become the active asset: ' + value).toBe('SPY');
    }
});

/* ── FEATURE-027 Gap A: catalog binding, not the grammar, is what stops an accepted subject ──
 * SCN-027-012 above proves an accepted-but-uncatalogued subject is NAMED as unavailable and
 * that the default asset stays fully computed. The security half of the same rule was never
 * asserted: that such a subject reaches NO fetch target, NO path segment and NO storage key.
 * That half matters because the shared receiver deliberately does NOT narrow — rlticker.js
 * accepts ".", "-" and ".." — so "..", a traversal-shaped string, clears grammar acceptance
 * and is stopped by the catalog ALONE. This row asserts the whole observable footprint of an
 * accepted-but-uncatalogued open is byte-identical to the no-parameter open.
 * ───────────────────────────────────────────────────────────────────────────── */

const ACCEPTED_BUT_UNCATALOGUED = Object.freeze(['TSLA', '..', '.', '-', 'ZZZZZZZZZZZZ']);

/* Everything the route can be observed to REACH on one open: the same-origin paths it
   requested and every storage entry it left behind, plus the asset it settled on. */
async function openAndObserveFootprint(page, query) {
    const requested = [];
    const onRequest = (request) => requested.push(request.url());
    page.on('request', onRequest);
    try {
        await openWithQuery(page, query);
    } finally {
        page.off('request', onRequest);
    }
    const observed = await page.evaluate(() => {
        const raw = localStorage.getItem('rlData');
        let barSymbols = null;
        try { barSymbols = Object.keys(JSON.parse(raw).bars).sort(); } catch (e) { barSymbols = null; }
        return {
            keys: Object.keys(localStorage).sort(),
            barSymbols,
            asset: window.VolSizingLab.runtime.controls.asset
        };
    });
    return {
        paths: Array.from(new Set(requested.map((url) => new URL(url).pathname))).sort(),
        rawRequests: requested.slice(),
        storageKeys: observed.keys,
        barSymbols: observed.barSymbols,
        asset: observed.asset
    };
}

test('Regression: SCN-027-012 an accepted but uncatalogued subject — including the grammar-valid traversal form ".." — reaches no request path and no storage key, so the open is footprint-identical to the no-parameter open', async ({ page }) => {
    const plain = await openAndObserveFootprint(page, '');
    expect(plain.asset).toBe('SPY');
    expect(plain.barSymbols, 'the seeded bar cache must be readable for this comparison to mean anything').not.toBeNull();
    console.log('SCN-027-012 FOOTPRINT unlinked: ' + JSON.stringify({ paths: plain.paths, storageKeys: plain.storageKeys, barSymbols: plain.barSymbols }));

    for (const subject of ACCEPTED_BUT_UNCATALOGUED) {
        /* the shared rule really does ACCEPT this value — the claim under test is that
           acceptance is not sufficient, so a value the grammar refuses would prove nothing */
        const accepted = await page.evaluate((value) => window.RLTKR.linkedSubject('?ticker=' + encodeURIComponent(value)).status, subject);
        expect(accepted, subject + ' must be grammar-ACCEPTED for this row to mean anything').toBe('accepted');

        const linked = await openAndObserveFootprint(page, '?ticker=' + encodeURIComponent(subject));
        expect(linked.asset, 'an uncatalogued subject must never become the active asset: ' + subject).toBe('SPY');
        /* The claim under test is that the SUBJECT reaches no request. Comparing the two whole
           path SETS conflated that with "the shared shell loads the same lazy assets on every
           open", which it does not: `/rljourney.js`, `/journeys.json` and the `/briefs/objects/**`
           reads land inside or outside the observation window at random, and this row went red
           on 3 of 8 identical runs for that reason alone — a guard whose green depends on a
           timer is not a guard. So the subject-independent difference is named and bounded, and
           the subject claim is asserted DIRECTLY and more strictly than before: over every RAW
           request URL rather than only its pathname, so a subject smuggled into a query string
           or a fragment — which the old pathname-only comparison could not have seen — fails. */
        const extraPaths = linked.paths.filter((path) => !plain.paths.includes(path));
        const SHARED_SHELL_LAZY = /^\/(rljourney\.js|journeys\.json|briefs\/)/;
        expect(extraPaths.filter((path) => !SHARED_SHELL_LAZY.test(path)),
            'an uncatalogued subject must add no request path outside the shared shell lazy set: ' + subject).toEqual([]);
        /* No request may carry the subject as a path segment. `.`, `-` and `..` are punctuation
           that appears inside ordinary file names, so a substring test would fire on every URL
           and prove nothing; a SEGMENT test is the form that actually distinguishes "the route
           built a path out of the subject" from "a filename happens to contain a dot". */
        const asSegment = linked.rawRequests.filter((url) => new URL(url).pathname.split('/').includes(subject));
        expect(asSegment, 'no request path may carry the uncatalogued subject as a segment: ' + subject).toEqual([]);
        /* For a subject that is not pure punctuation the stricter form applies, over the RAW
           URL rather than only its pathname — so a subject smuggled into a query string or a
           fragment, which the previous pathname-only set comparison could not have seen, fails.
           The document navigation itself is excluded: that request IS the deep link the reader
           followed, so it necessarily carries the subject and asserting otherwise would be a
           false claim rather than a stricter one. */
        if (/[A-Za-z0-9]/.test(subject)) {
            const navigation = site.baseUrl + '/volatility-sizing-lab.html?ticker=' + encodeURIComponent(subject);
            const mentioning = linked.rawRequests
                .filter((url) => url !== navigation)
                .filter((url) => url.toUpperCase().includes(subject.toUpperCase()));
            expect(mentioning, 'no request other than the deep link itself may mention the uncatalogued subject anywhere in its URL: ' + subject).toEqual([]);
        }
        expect(linked.storageKeys, 'an uncatalogued subject must add no storage key: ' + subject).toEqual(plain.storageKeys);
        /* the cache this route keys BY SYMBOL is where an unbound subject would land first */
        expect(linked.barSymbols, 'an uncatalogued subject must never become a symbol-keyed cache entry: ' + subject).toEqual(plain.barSymbols);
        expect(linked.barSymbols, 'the uncatalogued subject must be absent from the symbol-keyed cache: ' + subject).not.toContain(subject);
        /* and specifically: nothing the route requested carries a traversal segment */
        const traversing = linked.rawRequests.filter((url) => new URL(url).pathname.split('/').includes('..'));
        expect(traversing, 'no request path may carry a ".." segment: ' + subject).toEqual([]);
    }
});

/* FEATURE-027 file:// reach parity ─────────────────────────────────────────────
 * Scope 2 DoD: the subject handoff must introduce no NEW file:// incompatibility
 * on this receiving route. This route fetches volatility-sizing-universe.json at
 * boot, which a file:// origin cannot serve, so it renders its pre-existing
 * configuration-unavailable banner instead of operating — a limitation the route
 * already had at HEAD and which this feature did not create. What IS this
 * feature's responsibility, and what this row asserts, is that the reach outcome
 * is IDENTICAL with a ?ticker= subject present and with no query string at all:
 * the parameter neither adds nor removes a file:// failure.
 * ───────────────────────────────────────────────────────────────────────────── */

const VOL_FILE_ORIGIN = 'file://' + new URL('../volatility-sizing-lab.html', import.meta.url).pathname;

async function volReachFromFile(page, query) {
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error && error.message)));
    await page.goto(VOL_FILE_ORIGIN + (query || ''));
    await page.waitForTimeout(1500);
    const reach = await page.evaluate(() => {
        const configError = document.getElementById('configError');
        const notice = document.getElementById('linkNotice');
        const lab = window.VolSizingLab;
        return {
            rltkrResolved: typeof window.RLTKR === 'object' && window.RLTKR !== null,
            labPresent: !!lab,
            configErrorShown: !!(configError && !configError.classList.contains('is-hidden')),
            configLoaded: !!(lab && lab.runtime && lab.runtime.config),
            activeAsset: lab && lab.runtime && lab.runtime.controls ? lab.runtime.controls.asset : null,
            noticePresent: !!notice,
            noticeHidden: notice ? notice.hasAttribute('hidden') : null
        };
    });
    return { ...reach, pageErrors: errors.length, errorMessages: errors };
}

test('FEATURE-027 file:// parity: the volatility route reaches the same file:// outcome with a ?ticker= subject as with no query string', async ({ page }) => {
    const plain = await volReachFromFile(page, '');
    const linked = await volReachFromFile(page, '?ticker=NVDA');
    const signature = (r) => ({
        rltkrResolved: r.rltkrResolved,
        labPresent: r.labPresent,
        configErrorShown: r.configErrorShown,
        configLoaded: r.configLoaded,
        activeAsset: r.activeAsset,
        noticePresent: r.noticePresent,
        noticeHidden: r.noticeHidden,
        pageErrors: r.pageErrors
    });
    console.log('FILE_PARITY volatility plain: ' + JSON.stringify(plain));
    console.log('FILE_PARITY volatility linked: ' + JSON.stringify(linked));
    expect(signature(linked)).toEqual(signature(plain));
});

/* ── found by seeded chaos (spec 027 chaos phase, journey J1, seed 4271001) ──
 * The catalog-miss notice ends in a PRESENT-TENSE clause naming the asset on screen, so it is
 * a claim about the current state and not a record of the arrival. It was rendered once, inside
 * the boot-only applyLinkedSubject, so a reader who picked their own asset afterwards was left
 * reading a notice that still named the asset they had replaced — the select said one asset and
 * the notice said another. SCN-027-013 asserts single-subject coherence at FIRST PAINT only,
 * before any reader control change, so it could not see this. This one drives the select.
 * ───────────────────────────────────────────────────────────────────────────── */
test('Regression: SCN-027-013 the catalog-miss notice keeps naming the asset actually on screen after the reader changes it', async ({ page }) => {
    await openWithQuery(page, '?ticker=TSLA');
    await openNativeResearchSurface(page);
    const notice = page.locator('#linkNotice');
    await expect(notice).toContainText('no data for TSLA');
    await expect(notice).toContainText('showing SPY');

    await page.selectOption('#assetSelect', 'NVDA');
    await page.waitForFunction(() => window.VolSizingLab.runtime.controls.asset === 'NVDA', null, { timeout: 20000 });

    const after = await notice.textContent();
    expect(after, 'the notice still names the replaced asset, so the page states two subjects').toContain('showing NVDA');
    /* the explanation survives the re-statement rather than being silently erased */
    expect(after, 'the reason the link did not land was dropped instead of restated').toContain('no data for TSLA');
    const coherent = await page.evaluate(() => {
        // The rendered subject carries the decorator's affordance; the runtime values do not.
        const undecorated = (node) => {
            const clone = node.cloneNode(true);
            clone.querySelectorAll('.rltkr-context').forEach((button) => button.remove());
            return (clone.textContent || '').trim();
        };
        const runtime = window.VolSizingLab.runtime;
        return [runtime.controls.asset, document.getElementById('assetSelect').value]
            .concat(Array.from(document.querySelectorAll('[data-asset-name]')).map(undecorated));
    });
    expect(new Set(coherent).size, 'controls disagree after the change: ' + JSON.stringify(coherent)).toBe(1);

    /* an applied subject leaves no notice to go stale, and changing away from it adds none */
    await openWithQuery(page, '?ticker=NVDA');
    await openNativeResearchSurface(page);
    await expect(notice).toHaveAttribute('hidden', '');
    await page.selectOption('#assetSelect', 'QQQ');
    await page.waitForFunction(() => window.VolSizingLab.runtime.controls.asset === 'QQQ', null, { timeout: 20000 });
    await expect(notice).toHaveAttribute('hidden', '');
});
