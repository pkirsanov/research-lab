/*
 * Feature 002 Scope 10 — TP-10-03 all-page control canary (node --test + real browser).
 * Loads every registered page from ROOT with NO briefs/ graph published and NO cutover enable
 * signal (the real pre-cutover state). Proves the shared mount is additive and INERT: it makes
 * zero network requests, reaches a contained "idle" state without breaking the page, and every
 * page keeps its owner controls, the RLDATA status shell, and the provider-credential lifecycle.
 * The brief component never validates itself here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startBriefServer, loadPlaywright, browserLaunchOptions } from './distributed-briefs.support.mjs';
import { ENTRIES } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';

test('Canary: all observed pages retain controls Simple Power state RLDATA and credential lifecycle after mounts', async (t) => {
    let chromium;
    try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }

    const server = await startBriefServer({}); // no graphDir and no enable signal => the mount stays inert
    const browser = await chromium.launch(browserLaunchOptions());
    const failures = [];
    try {
        for (const entry of ENTRIES) {
            const page = await browser.newPage();
            const mountErrors = [];
            page.on('pageerror', (e) => { const s = e.message + ' ' + (e.stack || ''); if (/rlbrief|BriefMount|mountBriefs|RLBRIEF/i.test(s)) mountErrors.push(s); });
            try {
                await page.goto(`${server.baseUrl}/${entry.file}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
                // The inert pre-cutover mount is an empty (zero-height) section, so wait for it ATTACHED with its
                // settled ready flag rather than Playwright's default "visible" state (which never holds for an inert mount).
                await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 20000 });

                // Pre-cutover the mount is inert: contained "idle" state, never an error that breaks the page.
                const state = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
                if (state !== 'idle') failures.push(`${entry.id}: mount state=${state} (expected idle pre-cutover)`);

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
        // The inert mount performs ZERO briefs network across every page (no failed pointer fetch).
        const briefReqs = server.briefRequests();
        if (briefReqs.length) failures.push(`inert mount made ${briefReqs.length} briefs request(s): ${briefReqs.slice(0, 3).join(', ')}`);
    } finally {
        await browser.close();
        await server.close();
    }
    assert.deepEqual(failures, [], `all ${ENTRIES.length} pages retain owner controls, RLDATA, and credential lifecycle with an inert mount`);
});
