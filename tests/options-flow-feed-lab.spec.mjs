import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * Real-route browser regressions for the Unusual Options Activity Lab
 * (options-flow-feed-lab.html) under specs/027-company-scoped-owner-deep-links Scope 2.
 *
 * This route has no owning feature spec, so FR-027-015 is proven against a baseline
 * captured from the UNMODIFIED route before the subject handoff was added. The captured
 * values are pinned in BASELINE below and recorded verbatim in the feature report.
 *
 * Chains are preseeded into the page's OWN cache (localStorage rlOptFlow:<SYM>) via
 * addInitScript — the sanctioned cache-first path. There is NO page.route /
 * route.fulfill / route.abort / response interception anywhere in this file.
 */

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* ── the route's own closed catalog, mirrored here so a drift in either is visible ── */
const UNIVERSE = ['SPY', 'QQQ', 'IWM', 'NVDA', 'TSLA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'AMD', 'AVGO'];
/* covered by the scan but every strike has zero volume, so rebuild() flags none of them */
const SILENT = 'AVGO';
/* a real, grammar-valid symbol that the twelve-name scan does not cover */
const UNCOVERED = 'MU';
const EXPIRY = Math.floor(Date.UTC(2030, 0, 18) / 1000);

/* deterministic chains: no randomness, no clock dependence beyond cache freshness */
function chainFor(symbol, index) {
    const spot = 100 + index;
    const silent = symbol === SILENT;
    return {
        spot,
        expiry: EXPIRY,
        rows: [
            { type: 'C', strike: spot + 5, volume: silent ? 0 : 2000, oi: 1000, iv: 0.3 + index * 0.05, mid: 1 + index * 0.1, expiry: EXPIRY, spot },
            { type: 'P', strike: spot - 5, volume: silent ? 0 : 500, oi: 1000, iv: 0.3, mid: 0.5, expiry: EXPIRY, spot }
        ]
    };
}

function seededCache() {
    const at = Date.now();
    const cache = {};
    UNIVERSE.forEach((symbol, index) => { cache['rlOptFlow:' + symbol] = { at, parsed: chainFor(symbol, index) }; });
    return cache;
}

async function open(page, options = {}) {
    await page.addInitScript((payload) => {
        for (const key of Object.keys(payload.cache)) localStorage.setItem(key, JSON.stringify(payload.cache[key]));
        if (payload.saved) localStorage.setItem('optFlowState', payload.saved);
    }, { cache: seededCache(), saved: options.saved || null });
    await page.goto(site.baseUrl + '/options-flow-feed-lab.html' + (options.query || ''));
    await page.waitForFunction(() => {
        const status = document.getElementById('status');
        return status && status.textContent && status.textContent.indexOf('chains cached') !== -1;
    });
}

/* the native control surface is hidden by the shared shell in its Simple view; Power
   restores it, which is where a reader actually sees this page's own markup */
async function openNativeResearchSurface(page) {
    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    await expect(page.locator('body')).not.toHaveClass(/\brlv-focused\b/);
}

async function capture(page) {
    return page.evaluate(() => {
        const textOf = (id) => { const node = document.getElementById(id); return node ? node.textContent : null; };
        const symbolOf = (node) => { const link = node ? node.querySelector('a.rltkr') : null; return link ? link.textContent.trim() : null; };
        const feed = Array.from(document.querySelectorAll('#feed .card'));
        const rows = Array.from(document.querySelectorAll('#tbody tr'));
        const byTicker = Array.from(document.querySelectorAll('#byTicker > div'));
        return {
            verdict: textOf('verdict'),
            verdictSub: textOf('verdictSub'),
            status: textOf('status'),
            feedOrder: feed.map((card) => symbolOf(card.querySelector('.ct'))),
            tableOrder: rows.map((row) => symbolOf(row.children[0]) + ' ' + row.children[1].textContent.trim() + ' ' + row.children[9].textContent.trim()),
            byTickerOrder: byTicker.map((row) => symbolOf(row)),
            savedState: localStorage.getItem('optFlowState')
        };
    });
}

/* what the route actually persists, read straight out of the page after a visit */
async function persisted(page) {
    return page.evaluate(() => {
        const raw = localStorage.getItem('optFlowState');
        return {
            raw,
            stateKeys: Object.keys(JSON.parse(raw)).sort(),
            storageKeys: Object.keys(localStorage).sort()
        };
    });
}

/* FR-027-015 — captured from the unmodified route (sha256
   5b66a095b58e798686aefb407767dd118584a70694965b36b52d39a45b57dc98, identical to HEAD)
   BEFORE any Scope 2 edit, and recorded verbatim in report.md. Note savedState: the
   route's saveState() serialises the whole state object, so it has always written six
   keys including sortK and sortDir — not the four that loadState() reads back. */
const BASELINE = {
    verdict: 'Tape lean: call-heavy (leaning bullish)',
    verdictSub: 'Across 22 flagged strikes · call premium $3.3M vs put premium $275K (positioning proxy, not real-time flow)',
    status: '12/12 chains cached · 22 active strikes',
    feedOrder: ['GOOGL', 'AMD', 'MSFT', 'META', 'AMZN', 'TSLA', 'AAPL', 'IWM', 'NVDA', 'SPY', 'QQQ', 'SPY', 'QQQ', 'IWM', 'NVDA', 'TSLA', 'AAPL', 'MSFT', 'META', 'AMZN', 'GOOGL', 'AMD'],
    tableOrder: ['GOOGL C 94', 'AMD C 94', 'MSFT C 93', 'META C 93', 'AMZN C 93', 'TSLA C 92', 'AAPL C 92', 'IWM C 91', 'NVDA C 91', 'SPY C 90', 'QQQ C 90', 'SPY P 20', 'QQQ P 20', 'IWM P 20', 'NVDA P 19', 'TSLA P 19', 'AAPL P 19', 'MSFT P 19', 'META P 19', 'AMZN P 19', 'GOOGL P 19', 'AMD P 19'],
    byTickerOrder: ['AMD', 'GOOGL', 'AMZN', 'META', 'MSFT', 'AAPL', 'TSLA', 'NVDA', 'IWM', 'QQQ', 'SPY'],
    savedState: '{"mode":"simple","side":"both","min":0,"dte":"all","sortK":"score","sortDir":-1}'
};

test('Regression: SCN-027-005 with no subject parameter the verdict text, feed row count and order, default-sort table order, by-ticker order, status line and persisted-state round trip match the captured pre-change baseline', async ({ page }) => {
    await open(page);
    const observed = await capture(page);
    console.log('FR-027-015 BASELINE OBSERVED: ' + JSON.stringify(observed));
    expect(observed).toEqual(BASELINE);
    await expect(page.locator('#linkNotice')).toHaveAttribute('hidden', '');
    expect(await page.locator('#linkNotice').textContent()).toBe('');
});

test('Regression: SCN-027-001 ?ticker=NVDA renders a focus band naming NVDA with its flagged-strike count and call-versus-put premium split', async ({ page }) => {
    await open(page, { query: '?ticker=NVDA' });
    const band = await page.locator('#linkNotice').textContent();
    expect(band).toContain('NVDA');
    expect(band).toMatch(/2 flagged strikes/);
    expect(band).toMatch(/call premium \$\d/);
    expect(band).toMatch(/put premium \$\d/);
    expect(band).toContain('end-of-day');
    const aggregate = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll('#tbody tr'))
            .filter((row) => (row.children[0].textContent || '').indexOf('NVDA') === 0);
        return cells.length;
    });
    expect(aggregate).toBe(2);
});

test('Regression: SCN-027-003 the focus band is present and the feed, table and by-ticker row counts equal the unlinked baseline exactly', async ({ page }) => {
    await open(page);
    const plain = await capture(page);
    await open(page, { query: '?ticker=NVDA' });
    const linked = await capture(page);
    await expect(page.locator('#linkNotice')).not.toHaveAttribute('hidden', '');
    expect(linked.feedOrder).toEqual(plain.feedOrder);
    expect(linked.tableOrder).toEqual(plain.tableOrder);
    expect(linked.byTickerOrder).toEqual(plain.byTickerOrder);
    const sort = await page.evaluate(() => JSON.parse(localStorage.getItem('optFlowState')));
    expect(sort.sortK).toBe('score');
    expect(sort.sortDir).toBe(-1);
});

test('Regression: SCN-027-002 a link outranks saved state for this visit and the linked subject is absent from localStorage afterwards', async ({ page }) => {
    await open(page, {
        query: '?ticker=TSLA',
        saved: JSON.stringify({ mode: 'power', side: 'C', min: 40, dte: 'near', sortK: 'premium', sortDir: 1 })
    });
    const band = await page.locator('#linkNotice').textContent();
    expect(band).toContain('TSLA');
    const stored = await page.evaluate(() => {
        const raw = localStorage.getItem('optFlowState');
        const keys = Object.keys(localStorage);
        return { raw, keys };
    });
    expect(stored.raw).not.toContain('TSLA');
    expect(stored.keys.some((key) => key.indexOf('TSLA') !== -1 && key !== 'rlOptFlow:TSLA')).toBe(false);
    const restored = JSON.parse(stored.raw);
    expect(restored.side).toBe('C');
    expect(restored.min).toBe(40);
    expect(restored.dte).toBe('near');
    expect(Object.prototype.hasOwnProperty.call(restored, 'subject')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(restored, 'focus')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(restored, 'ticker')).toBe(false);

    /* The persisted key set is IDENTICAL with and without a link: the focus is a per-visit
       read, never a stored preference. UNCOVERED is grammar-valid and is the one symbol the
       harness does NOT seed a rlOptFlow:<SYM> cache entry for, so on that visit no storage
       key at all carries the linked ticker and the claim needs no carve-out. */
    await open(page);
    const unlinked = await persisted(page);
    await open(page, { query: '?ticker=' + UNCOVERED });
    const linked = await persisted(page);
    expect(unlinked.stateKeys).toEqual(['dte', 'min', 'mode', 'side', 'sortDir', 'sortK']);
    expect(linked.stateKeys).toEqual(unlinked.stateKeys);
    expect(linked.storageKeys).toEqual(unlinked.storageKeys);
    expect(linked.raw).not.toContain(UNCOVERED);
    expect(linked.storageKeys.filter((key) => key.indexOf(UNCOVERED) !== -1)).toEqual([]);
});

test('Regression: SCN-027-004 the focus band names the active subject as page text rather than only in a table cell', async ({ page }) => {
    await open(page, { query: '?ticker=AAPL' });
    await openNativeResearchSurface(page);
    const notice = page.locator('#linkNotice');
    await expect(notice).toBeVisible();
    await expect(notice).toHaveAttribute('role', 'status');
    expect(await notice.evaluate((node) => node.tagName)).not.toBe('TD');
    expect(await notice.evaluate((node) => node.closest('table') === null)).toBe(true);
    expect(await notice.innerText()).toContain('AAPL');
});

test('Regression: SCN-027-012 a covered ticker with no flagged strike and an uncovered ticker render two distinct named statements, neither blank', async ({ page }) => {
    await open(page, { query: '?ticker=' + SILENT });
    const silent = (await page.locator('#linkNotice').textContent()).trim();
    await open(page, { query: '?ticker=' + UNCOVERED });
    const uncovered = (await page.locator('#linkNotice').textContent()).trim();
    expect(silent.length).toBeGreaterThan(0);
    expect(uncovered.length).toBeGreaterThan(0);
    expect(silent).toContain(SILENT);
    expect(uncovered).toContain(UNCOVERED);
    expect(silent).not.toBe(uncovered);
    expect(silent).toMatch(/crossed the activity bar/);
    expect(uncovered).toMatch(/does not include it/);
    expect(silent).not.toMatch(/does not include it/);
});

test('Regression: SCN-027-013 a refused subject leaves the scan unchanged and every control reflecting one subject', async ({ page }) => {
    await open(page);
    const plain = await capture(page);
    await open(page, { query: '?ticker=' + encodeURIComponent('<script>alert(1)</script>') });
    const refused = await capture(page);
    const band = (await page.locator('#linkNotice').textContent()).trim();
    expect(band.length).toBeGreaterThan(0);
    expect(band).not.toContain('script');
    expect(band).not.toContain('alert');
    expect(refused.feedOrder).toEqual(plain.feedOrder);
    expect(refused.tableOrder).toEqual(plain.tableOrder);
    expect(refused.byTickerOrder).toEqual(plain.byTickerOrder);
    expect(refused.verdict).toBe(plain.verdict);
});

test('Regression: SCN-027-010 no adversarial corpus value reaches the body, an attribute or localStorage on the options-flow route', async ({ page }) => {
    const corpus = [
        'javascript:alert(1)',
        '<img src=x onerror=alert(1)>',
        '../../etc/passwd',
        'NVDA"onload="alert(1)',
        "NVDA';DROP TABLE--",
        'A'.repeat(64)
    ];
    for (const value of corpus) {
        await open(page, { query: '?ticker=' + encodeURIComponent(value) });
        const leak = await page.evaluate((needle) => {
            const html = document.documentElement.outerHTML;
            const storage = Object.keys(localStorage).map((key) => key + '=' + localStorage.getItem(key)).join('\n');
            return { inHtml: html.indexOf(needle) !== -1, inStorage: storage.indexOf(needle) !== -1 };
        }, value);
        expect(leak.inHtml, 'corpus value must not reach the document: ' + value).toBe(false);
        expect(leak.inStorage, 'corpus value must not reach localStorage: ' + value).toBe(false);
    }
});

test('Regression: SCN-027-005 an unlinked open issues no request the linked open does not, and neither adds a request beyond the seeded cache-first path', async ({ page }) => {
    const seen = [];
    page.on('request', (request) => { if (request.url().indexOf('/data/options/') !== -1) seen.push(request.url()); });
    await open(page);
    const plain = seen.length;
    seen.length = 0;
    await open(page, { query: '?ticker=NVDA' });
    expect(seen.length).toBe(plain);
    expect(plain).toBe(0);
});

/* FEATURE-027 file:// reach parity ─────────────────────────────────────────────
 * Scope 2 DoD: the subject handoff must introduce no NEW file:// incompatibility.
 * These two rows open the real route from a file:// origin (no server, no bundler)
 * and compare the reach signature — did the route's own script run to completion,
 * did the shared ticker module resolve, how many uncaught page errors — with a
 * ?ticker= value present against no query string at all.
 * ───────────────────────────────────────────────────────────────────────────── */

const FILE_ORIGIN = 'file://' + new URL('../options-flow-feed-lab.html', import.meta.url).pathname;

async function openFromFile(page, query) {
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error && error.message)));
    await page.addInitScript((cache) => {
        try { for (const key of Object.keys(cache)) localStorage.setItem(key, JSON.stringify(cache[key])); } catch (e) { /* opaque file:// storage is itself part of the signature */ }
    }, seededCache());
    await page.goto(FILE_ORIGIN + (query || ''));
    await page.waitForFunction(() => {
        const status = document.getElementById('status');
        return status && status.textContent && status.textContent !== 'loading…';
    }, null, { timeout: 15000 }).catch(() => { /* a route that never leaves 'loading…' is a real reach failure, recorded below */ });
    const reach = await page.evaluate(() => {
        const status = document.getElementById('status');
        const notice = document.getElementById('linkNotice');
        return {
            scriptCompleted: !!(status && status.textContent && status.textContent.indexOf('chains cached') !== -1),
            rltkrResolved: typeof window.RLTKR === 'object' && window.RLTKR !== null,
            noticePresent: !!notice,
            feedRendered: document.querySelectorAll('#feed .card').length > 0,
            tableRendered: document.querySelectorAll('#tbody tr').length > 0,
            noticeText: notice ? notice.textContent : null,
            noticeHidden: notice ? notice.hasAttribute('hidden') : null
        };
    });
    return { ...reach, pageErrors: errors.length, errorMessages: errors };
}

test('FEATURE-027 file:// parity: the options-flow route reaches the same file:// outcome with a ?ticker= subject as with no query string', async ({ page }) => {
    const plain = await openFromFile(page, '');
    const linked = await openFromFile(page, '?ticker=NVDA');
    const signature = (r) => ({
        scriptCompleted: r.scriptCompleted,
        rltkrResolved: r.rltkrResolved,
        noticePresent: r.noticePresent,
        feedRendered: r.feedRendered,
        tableRendered: r.tableRendered,
        pageErrors: r.pageErrors
    });
    console.log('FILE_PARITY options-flow plain: ' + JSON.stringify(plain));
    console.log('FILE_PARITY options-flow linked: ' + JSON.stringify(linked));
    expect(signature(linked)).toEqual(signature(plain));
});

test('FEATURE-027 file:// paint: the options-flow route fully reaches its paint from a file:// origin with and without a subject', async ({ page }) => {
    const plain = await openFromFile(page, '');
    expect(plain.pageErrors, 'unlinked file:// open must raise no page error: ' + JSON.stringify(plain.errorMessages)).toBe(0);
    expect(plain.scriptCompleted, 'unlinked file:// open must reach the cached-chains status').toBe(true);
    expect(plain.rltkrResolved, 'RLTKR must resolve from a file:// origin').toBe(true);
    expect(plain.feedRendered).toBe(true);
    expect(plain.tableRendered).toBe(true);
    expect(plain.noticeHidden, 'with no subject the notice stays hidden').toBe(true);
    expect(plain.noticeText).toBe('');

    const linked = await openFromFile(page, '?ticker=NVDA');
    expect(linked.pageErrors, 'linked file:// open must raise no page error: ' + JSON.stringify(linked.errorMessages)).toBe(0);
    expect(linked.scriptCompleted, 'linked file:// open must reach the cached-chains status').toBe(true);
    expect(linked.rltkrResolved).toBe(true);
    expect(linked.feedRendered).toBe(true);
    expect(linked.tableRendered).toBe(true);
    expect(linked.noticeHidden, 'with a subject the focus band is shown').toBe(false);
    expect(linked.noticeText, 'the focus band must render its real text, not a blank').toContain('NVDA');
});
