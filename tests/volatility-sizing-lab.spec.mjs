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

async function open(page, cache, options = {}) {
    await page.addInitScript((payload) => { if (!localStorage.getItem('rlData')) localStorage.setItem('rlData', JSON.stringify(payload)); }, cache);
    await page.goto(site.baseUrl + '/volatility-sizing-lab.html');
    await page.waitForFunction(() => window.VolSizingLab && window.VolSizingLab.runtime && window.VolSizingLab.runtime.decision);
    if (options.asset) {
        await page.selectOption('#assetSelect', options.asset);
        await page.waitForFunction((a) => window.VolSizingLab.runtime.controls.asset === a && !window.VolSizingLab.runtime.refresh.active, options.asset);
    }
    if (options.estimator === 'garch11') {
        await page.click('#estimatorSeg button[data-estimator="garch11"]');
        await page.waitForFunction(() => window.VolSizingLab.runtime.controls.estimator === 'garch11');
    }
    if (options.mode === 'power') {
        await page.click('#powerTab');
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
    await page.click('#powerTab');
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
    await expect(page.locator('[data-regime-managed]')).toBeVisible();
    await expect(page.locator('[data-degraded="MANAGED_SUPPRESSED"]')).toBeVisible();
    const suggestion = (await page.locator('[data-sizing-suggestion]').textContent()).toLowerCase();
    expect(suggestion).toContain('withheld');
    const managedSuppressed = await page.evaluate(() => window.VolSizingLab.runtime.decision.regime.managedSuppressed);
    const sizingState = await page.evaluate(() => window.VolSizingLab.runtime.decision.sizing.state);
    expect(managedSuppressed).toBe(true);
    expect(sizingState).toBe('unavailable');
});

test('Regression BS-009: insufficient history is unavailable with exact counts', async ({ page }) => {
    await open(page, cacheFor({ SPY: shortCloses() }));
    await expect(page.locator('[data-degraded="INSUFFICIENT_HISTORY"]')).toBeVisible();
    await expect(page.locator('[data-degraded="INSUFFICIENT_HISTORY"]')).toContainText('required minimum');
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
    await expect(page.locator('#simpleView')).toBeVisible();
    await expect(page.locator('#assetSelect')).toBeVisible();
});
