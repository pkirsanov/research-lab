/*
 * Feature 002 Scope 10 — TP-10-02 integration (node --test + real browser).
 * Serves the ephemeral fixture graph and drives the production shell in a real Chromium:
 * proves the shared mount verifies coherent current objects, that mode switching performs no
 * refetch, that history loads only after "Open history" and then only the selected partition,
 * and that a SHA-256 mismatch fails closed with no partial evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGraph, writeGraphToTemp, removeTemp } from './fixtures/feature-002/ui/ui-fixture-builder.mjs';
import { startBriefServer, harnessUrl, loadPlaywright, browserLaunchOptions } from './distributed-briefs.support.mjs';

test('static loader verifies coherent current objects and fetches history only after selection', async (t) => {
    let chromium;
    try { ({ chromium } = await loadPlaywright()); } catch (e) { t.skip('Playwright runtime unavailable'); return; }

    const g = buildGraph({ toolId: 'sector-research-lab', session: 'pre-market' });
    const dir = writeGraphToTemp(g.files);
    const server = await startBriefServer({ graphDir: dir });
    const browser = await chromium.launch(browserLaunchOptions());
    try {
        const page = await browser.newPage();
        const cacheHeaders = new Map();
        page.on('response', (res) => { try { cacheHeaders.set(new URL(res.url()).pathname, res.headers()['cache-control'] || ''); } catch (e) { /* ignore */ } });

        await page.goto(harnessUrl(server.baseUrl, 'sector-research-lab'), { waitUntil: 'load' });
        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });

        const state = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
        assert.equal(state, 'ready', 'coherent current graph renders ready');

        // the summary + decision rendered from the verified brief/read.
        const summary = await page.textContent('[data-rlbrief-part="summary"]');
        assert.ok(summary && summary.length > 0);

        // pointer fetched no-store; an immutable object cacheable.
        assert.equal(cacheHeaders.get('/briefs/current.json'), 'no-store');
        assert.ok((cacheHeaders.get(g.pointer.manifestRef.path.replace(/^/, '/')) || '').indexOf('immutable') >= 0);

        // history is ABSENT from network until "Open history".
        assert.equal(server.briefRequests().some((p) => p.indexOf('/briefs/history/') === 0), false, 'no history partition before Open history');

        // Power mode switch reveals already-loaded evidence with NO new network request.
        const beforePower = server.briefRequests().length;
        await page.click('#rlbrief-power > summary');
        await page.waitForSelector('[data-rlbrief-part="price"]', { timeout: 5000 });
        assert.equal(server.briefRequests().length, beforePower, 'mode switch performs no refetch');
        // official close is a separate row from the indicative latest.
        assert.ok(await page.$('[data-rlbrief-part="official-close"]'));
        assert.ok(await page.$('[data-rlbrief-part="indicative"]'));

        // Open history -> loads pointer + index only.
        await page.click('[data-rlbrief-part="history"] button');
        await page.waitForSelector('#rlbrief-hist-select', { timeout: 8000 });
        const afterOpen = server.briefRequests();
        assert.ok(afterOpen.some((p) => p === '/briefs/history-current.json'));
        assert.equal(afterOpen.some((p) => p.indexOf('/briefs/history/') === 0), false, 'no partition fetched until a filter is selected');

        // select ONE partition -> only that partition is fetched.
        await page.selectOption('#rlbrief-hist-select', '0');
        await page.waitForSelector('[data-rlbrief-part="history-timeline"]', { timeout: 8000 });
        const partitions = server.briefRequests().filter((p) => p.indexOf('/briefs/history/') === 0);
        assert.equal(partitions.length, 1, 'exactly one selected partition fetched');
        assert.ok(partitions[0].indexOf('/briefs/history/tools/sector-research-lab/') === 0);

        await page.close();
    } finally {
        await browser.close();
        await server.close();
        removeTemp(dir);
    }

    // ── fail-closed: a SHA-256 mismatch on the read shows integrity-error and no partial content ──
    const bad = buildGraph({ toolId: 'sector-research-lab', session: 'pre-market', corrupt: 'read-hash' });
    const badDir = writeGraphToTemp(bad.files);
    const badServer = await startBriefServer({ graphDir: badDir });
    const browser2 = await chromium.launch(browserLaunchOptions());
    try {
        const page = await browser2.newPage();
        await page.goto(harnessUrl(badServer.baseUrl, 'sector-research-lab'), { waitUntil: 'load' });
        await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 15000 });
        const st = await page.getAttribute('[data-rlbrief-mount]', 'data-rlbrief-state');
        assert.equal(st, 'integrity-error', 'hash mismatch fails closed');
        assert.equal(await page.$('[data-rlbrief-part="price"]'), null, 'no partial evidence rendered on integrity failure');
        const status = await page.textContent('[data-rlbrief-part="status"]');
        assert.ok(status.indexOf('Could not verify this brief') >= 0);
        await page.close();
    } finally {
        await browser2.close();
        await badServer.close();
        removeTemp(badDir);
    }
});
