/*
 * Feature 002 Scope 10/11 — TP-10-03 all-page control canary (node --test + real browser).
 * Post-cutover: loads every registered page from ROOT and serves the REAL briefs/ graph from ROOT.
 * The 22 source-tool pages carry the `rlbrief-enabled` meta and MUST render their verified brief
 * (terminal "ready" state); the market-brief final-aggregator page keeps a mount but has no source
 * brief and is intentionally left un-enabled, so it stays in the contained "idle" state. In every
 * case the page keeps its owner controls, the RLDATA status shell, and the provider-credential
 * lifecycle — proving the cutover is additive: enabling briefs renders them without breaking any
 * host page. The brief component's own verification is covered by the spec/integration tests.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startBriefServer, loadPlaywright, browserLaunchOptions } from './distributed-briefs.support.mjs';
import { ENTRIES } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';

test('Canary: enabled source pages render briefs and retain controls/RLDATA/credential lifecycle; the aggregator stays idle', async (t) => {
    let chromium;
    try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }

    // No graphDir => /briefs/* falls through to the real ROOT/briefs/ graph, so the enabled pages
    // render against the actually-published briefs exactly as production (GitHub Pages) serves them.
    const server = await startBriefServer({});
    const browser = await chromium.launch(browserLaunchOptions());
    const failures = [];
    let enabledReady = 0;
    try {
        for (const entry of ENTRIES) {
            const page = await browser.newPage();
            const mountErrors = [];
            page.on('pageerror', (e) => { const s = e.message + ' ' + (e.stack || ''); if (/rlbrief|BriefMount|mountBriefs|RLBRIEF/i.test(s)) mountErrors.push(s); });
            try {
                await page.goto(`${server.baseUrl}/${entry.file}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
                // Wait for the mount to reach its settled terminal state (the ready flag is set only on a
                // terminal state — ready for an enabled source page, idle for the un-enabled aggregator).
                await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 30000 });

                // A source page is enabled and MUST render its verified brief; the final-aggregator page is
                // intentionally left un-enabled (no source brief of its own) and stays in the inert idle state.
                const isSource = !!(entry.briefing && entry.briefing.role === 'source');
                const state = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
                if (isSource) {
                    if (state !== 'ready') failures.push(`${entry.id}: enabled source mount state=${state} (expected ready)`);
                    else enabledReady++;
                } else if (state !== 'idle') {
                    failures.push(`${entry.id}: aggregator mount state=${state} (expected idle)`);
                }

                // Owner controls survive OUTSIDE the mount subtree.
                const ownerControls = await page.evaluate(() => {
                    const mount = document.querySelector('[data-rlbrief-mount]');
                    const all = Array.from(document.querySelectorAll('button,input,select,canvas,a[href],[role="tab"],details'));
                    return all.filter((el) => !(mount && mount.contains(el))).length;
                });
                if (ownerControls < 1) failures.push(`${entry.id}: no owner controls survive outside the mount`);

                // RLDATA status shell + credential lifecycle unchanged (the trigger still toggles).
                const shell = await page.$('#rl-data-shell');
                if (!shell) failures.push(`${entry.id}: RLDATA status shell missing`);
                else {
                    const before = await page.getAttribute('.rl-data-trigger', 'aria-expanded');
                    await page.click('.rl-data-trigger');
                    const after = await page.getAttribute('.rl-data-trigger', 'aria-expanded');
                    if (before === after) failures.push(`${entry.id}: status/credential trigger did not toggle`);
                }

                // The shared mount must not throw into the host page.
                if (mountErrors.length) failures.push(`${entry.id}: mount raised an error: ${mountErrors[0].slice(0, 140)}`);
            } catch (e) {
                failures.push(`${entry.id}: canary failed: ${String(e.message).slice(0, 140)}`);
            } finally {
                await page.close();
            }
        }
        // Post-cutover the enabled source pages DO fetch their brief; prove the cutover is live
        // (a wholly-zero briefs network would mean nothing actually rendered).
        const briefReqs = server.briefRequests();
        if (briefReqs.length < 1) failures.push('cutover enabled but zero briefs requests were observed across all pages');
        if (enabledReady < 1) failures.push('no enabled source page reached the ready state');
    } finally {
        await browser.close();
        await server.close();
    }
    assert.deepEqual(failures, [], `all ${ENTRIES.length} pages: enabled source pages render ready and every page retains owner controls, RLDATA, and credential lifecycle (aggregator stays idle)`);
});
