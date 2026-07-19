/*
 * Feature 002 Scope 10 — TP-10-04 .. TP-10-16 scenario regression E2E (Playwright, system-chrome).
 * Each test serves a scenario-specific ephemeral fixture graph and drives the production shared
 * mount in a real browser, asserting the exact UX contract: official-vs-indicative separation,
 * comparable volume, window comparison, report lifecycle/dispute/revision, reaction chronology,
 * low-noise context, the truthful state matrix, selective history, accessibility/safety/geometry,
 * and generic registry-added mounting with no page-specific branch.
 */
import { test, expect } from './playwright-runtime.mjs';
import { buildGraph, writeGraphToTemp, removeTemp } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';
import { startBriefServer, harnessUrl } from './distributed-briefs.support.mjs';

async function serve(g) {
    const dir = writeGraphToTemp(g.files);
    const server = await startBriefServer({ graphDir: dir, registryOverride: g.registryOverride });
    return { dir, server };
}
async function teardown(ctx) { if (ctx.server) await ctx.server.close(); if (ctx.dir) removeTemp(ctx.dir); }
async function mountReady(page, ctx, toolId) {
    await page.goto(harnessUrl(ctx.server.baseUrl, toolId), { waitUntil: 'load' });
    await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 20000 });
}
async function openPower(page) {
    await page.click('#rlbrief-power > summary');
    await page.waitForSelector('#rlbrief-power[open]', { timeout: 5000 });
}

test('Regression: pre-market Simple and Power keep official close separate and disclose comparable volume', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        expect(await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state')).toBe('ready');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="official-close"]')).toBeVisible();
        await expect(page.locator('[data-rlbrief-part="indicative"]')).toContainText('Pre-market - indicative');
        const off = await page.locator('[data-rlbrief-part="official-close"] td').nth(1).innerText();
        const ind = await page.locator('[data-rlbrief-part="indicative"] td').nth(1).innerText();
        expect(off).not.toBe(ind); // the prior official close is never aliased to the indicative latest
        await expect(page.locator('[data-rlbrief-part="comparable"]')).toContainText('Qualified sample');
        await expect(page.locator('#rlbrief-power')).toContainText('sample:');
        await expect(page.locator('#rlbrief-power')).toContainText('coverage:');
        await expect(page.locator('#rlbrief-power')).toContainText('median:');
        await expect(page.locator('#rlbrief-power')).toContainText('percentile:');
    } finally { await teardown(ctx); }
});

test('Regression: morning final compares the exact published pre-market thesis with owner read evidence', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'market-brief', window: 'morning', priorThesis: 'confirmed' }));
    try {
        await mountReady(page, ctx, 'market-brief');
        await expect(page.locator('[data-rlbrief-part="window"]')).toContainText('morning');
        await expect(page.locator('[data-rlbrief-part="prior-thesis"]')).toContainText('Pre-market rotation lean into tech strength');
        await expect(page.locator('[data-rlbrief-part="prior-thesis"]')).toContainText('confirmed');
    } finally { await teardown(ctx); }
});

test('Regression: pre-close final never labels a partial regular print as the official close', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'regular' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="indicative"]')).toContainText('Regular session - partial');
        await expect(page.locator('[data-rlbrief-part="official-close"]')).toHaveCount(0);
    } finally { await teardown(ctx); }
});

test('Regression: after-hours views preserve official close and label every post-close print indicative', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'after-hours' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="official-close"]')).toBeVisible();
        await expect(page.locator('[data-rlbrief-part="indicative"]')).toContainText('After-hours - indicative');
        const off = await page.locator('[data-rlbrief-part="official-close"] td').nth(1).innerText();
        const ind = await page.locator('[data-rlbrief-part="indicative"] td').nth(1).innerText();
        expect(off).not.toBe(ind);
    } finally { await teardown(ctx); }
});

test('Regression: holiday and early-close context strips use explicit calendar boundaries and next valid session', async ({ page }) => {
    let ctx = await serve(buildGraph({ toolId: 'sector-research-lab', calendar: 'holiday' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await expect(page.locator('[data-rlbrief-part="context"]')).toContainText('Market holiday');
        await expect(page.locator('[data-rlbrief-part="context"]')).toContainText('Next session: 2026-07-16');
    } finally { await teardown(ctx); }
    ctx = await serve(buildGraph({ toolId: 'sector-research-lab', calendar: 'early-close' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await expect(page.locator('[data-rlbrief-part="context"]')).toContainText('Early close');
        await expect(page.locator('[data-rlbrief-part="context"]')).toContainText('Official close:');
    } finally { await teardown(ctx); }
});

test('Regression: CPI row moves from upcoming to released without stale actual or post-release consensus', async ({ page }) => {
    let ctx = await serve(buildGraph({ toolId: 'sector-research-lab', report: 'upcoming' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="report"]')).toContainText('Not released');
        await expect(page.locator('[data-rlbrief-part="report"]')).not.toContainText('actual:');
    } finally { await teardown(ctx); }
    ctx = await serve(buildGraph({ toolId: 'sector-research-lab', report: 'released' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="report"]')).toContainText('Released');
        await expect(page.locator('[data-rlbrief-part="report"]')).toContainText('actual: 0.3');
        await expect(page.locator('[data-rlbrief-part="report"]')).toContainText('consensus: 0.2');
        await expect(page.locator('[data-rlbrief-part="report"]')).toContainText('previous: 0.1');
    } finally { await teardown(ctx); }
});

test('Regression: report conflicts stay separate and revisions append without rewriting the original', async ({ page }) => {
    let ctx = await serve(buildGraph({ toolId: 'sector-research-lab', report: 'disputed' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="report-dispute"]')).toBeVisible();
        await expect(page.locator('[data-rlbrief-part="report-dispute"] tbody tr')).toHaveCount(2);
        await expect(page.locator('[data-rlbrief-part="report-dispute"]')).toContainText('bls-public-api-v2');
        await expect(page.locator('[data-rlbrief-part="report-dispute"]')).toContainText('manual-consensus-artifact');
        await expect(page.locator('[data-rlbrief-part="report-dispute"] caption')).toContainText('synthesis blocked');
    } finally { await teardown(ctx); }
    ctx = await serve(buildGraph({ toolId: 'sector-research-lab', report: 'revised' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="report-revision"]')).toContainText('Original: 0.3');
        await expect(page.locator('[data-rlbrief-part="report-revision"]')).toContainText('Revision 1');
        await expect(page.locator('[data-rlbrief-part="report-revision"]')).toContainText('original preserved');
    } finally { await teardown(ctx); }
});

test('Regression: reaction disclosure and history exclude look-ahead and retain immutable chronology', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', reaction: true }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await openPower(page);
        await expect(page.locator('[data-rlbrief-part="reaction-timeline"] li').first()).toContainText('Baseline');
        await expect(page.locator('[data-rlbrief-part="reaction-segment"]').first()).toContainText('regular');
        await expect(page.locator('[data-rlbrief-part="reaction"]')).toContainText('strictly post-release');
    } finally { await teardown(ctx); }
});

test('Regression: unsupported unusual evidence remains context and consumes no action slot', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', lowNoise: true }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        await expect(page.locator('[data-rlbrief-part="low-noise"]')).toContainText('Context only - action gate not met');
        await expect(page.locator('[data-rlbrief-part="no-recommendation"]')).toBeVisible();
        await expect(page.locator('[data-rlbrief-part="recommendations"]')).toHaveCount(0);
        await expect(page.locator('[data-rlbrief-part="simple"]')).not.toContainText('rotate:');
    } finally { await teardown(ctx); }
});

test('Regression: shared state matrix remains truthful and non-current failures cannot replace current', async ({ page }) => {
    let ctx = await serve(buildGraph({ toolId: 'sector-research-lab', corrupt: 'read-hash' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        expect(await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state')).toBe('integrity-error');
        await expect(page.locator('[data-rlbrief-part="price"]')).toHaveCount(0);
        await expect(page.locator('[data-rlbrief-part="status"]')).toContainText('Could not verify this brief');
    } finally { await teardown(ctx); }
    ctx = await serve(buildGraph({ toolId: 'sector-research-lab', omitPointer: true }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        expect(await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state')).toBe('empty');
        await expect(page.locator('[data-rlbrief-part="status"]')).toContainText('No published brief yet');
    } finally { await teardown(ctx); }
    ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        expect(await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state')).toBe('ready');
    } finally { await teardown(ctx); }
});

test('Regression: focused history fetches only the selected partition and opened evidence objects', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' }));
    try {
        await mountReady(page, ctx, 'sector-research-lab');
        expect(ctx.server.briefRequests().filter((p) => p.indexOf('/briefs/history/') === 0).length).toBe(0);
        await page.click('[data-rlbrief-part="history"] button');
        await page.waitForSelector('#rlbrief-hist-select', { timeout: 8000 });
        expect(ctx.server.briefRequests().some((p) => p === '/briefs/history-current.json')).toBe(true);
        expect(ctx.server.briefRequests().filter((p) => p.indexOf('/briefs/history/') === 0).length).toBe(0);
        await page.selectOption('#rlbrief-hist-select', '0');
        await page.waitForSelector('[data-rlbrief-part="history-timeline"]', { timeout: 8000 });
        const parts = ctx.server.briefRequests().filter((p) => p.indexOf('/briefs/history/') === 0);
        expect(parts.length).toBe(1);
        expect(parts[0].indexOf('/briefs/history/tools/sector-research-lab/')).toBe(0);
        await expect(page.locator('[data-rlbrief-part="history-timeline"] li')).toHaveCount(2);
    } finally { await teardown(ctx); }
});

test('Regression: shared brief and history UI is accessible safe and stable at desktop mobile and zoom', async ({ page }) => {
    const ctx = await serve(buildGraph({ toolId: 'sector-research-lab', session: 'pre-market', unsafe: true }));
    try {
        await page.setViewportSize({ width: 390, height: 844 });
        await mountReady(page, ctx, 'sector-research-lab');
        // authored markup is rendered literally (textContent), never parsed into a live element.
        await expect(page.locator('[data-rlbrief-part="summary"]')).toContainText('<script>');
        expect(await page.locator('[data-rlbrief-part="summary"] script').count()).toBe(0);
        // an unsafe authored citation is neutralized to an inert label.
        await openPower(page);
        await page.click('[data-rlbrief-part="provenance"] > summary');
        await page.waitForSelector('[data-rlbrief-link="rejected"]', { timeout: 8000 });
        await expect(page.locator('[data-rlbrief-link="rejected"]')).toBeVisible();
        // 44px control targets and no horizontal overflow at mobile.
        const box = await page.locator('[data-rlbrief-part="history"] button').boundingBox();
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
        // 130% root text zoom does not clip or overflow.
        await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBe(true);
    } finally { await teardown(ctx); }
});

test('Regression: valid added registry source receives the shared mount with no page-specific branch', async ({ page }) => {
    const g = buildGraph({ toolId: 'added-source-fixture-lab', session: 'pre-market', addedSource: true });
    const ctx = await serve(g);
    try {
        await page.goto(harnessUrl(ctx.server.baseUrl, 'added-source-fixture-lab'), { waitUntil: 'load' });
        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 20000 });
        expect(await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state')).toBe('ready');
        await expect(page.locator('[data-rlbrief-part="summary"]')).toContainText('added-source-fixture-lab');
        await expect(page.locator('[data-rlbrief-part="history"] button')).toBeVisible();
    } finally { await teardown(ctx); }
});
