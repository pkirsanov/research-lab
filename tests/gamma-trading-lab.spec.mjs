import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * Real-route browser regressions for the Gamma Trading Lab
 * (specs/027-company-scoped-owner-deep-links, Scope 1).
 *
 * The route is served from the real ephemeral same-origin static server and opened with a
 * real query string. There is NO page.route / route.fulfill / route.abort anywhere in this
 * file: the subject handoff is a pure read of location.search, so mocking the network would
 * prove nothing about it.
 */

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

const ROUTE = '/gamma-trading-lab.html';
const DEFAULT_SUBJECT = 'SPY';

/* The corpus of design.md § Security, minus the two empty-ish values (covered by the
   SCN-027-006 test below) and minus '.', '-' and '..', which the unchanged receiver pattern
   /^[A-Z0-9.\-]{1,12}$/ ACCEPTS. Calling those refused would be a false claim; FR-027-003
   forbids narrowing the pattern that accepts them. */
const REFUSED_CORPUS = Object.freeze([
    'javascript:alert(1)', 'data:text/html,x', '//evil.example', '../../etc/passwd',
    '<img src=x onerror=1>', 'SPY onmouseover=1', 'SPY&x=1', 'SPY#frag', 'SPY\u0000',
    'ABCDEFGHIJKLM', '\u0426\u0415\u041d\u0410', 'SP\nY', 'SP\tY'
]);

async function open(page, query) {
    await page.goto(site.baseUrl + ROUTE + (query || ''));
    // boot() reflects the resolved subject into the ticker input; that is the first paint.
    await expect(page.locator('#ticker')).not.toHaveValue('', { timeout: 15000 });
}

/* The shared shell opens this route in a focused view that hides the tool's own surface, so
   a reader reaches the controls by picking the owning view. That click is a real user path,
   not a test affordance, and it is what makes "usable" observable. */
async function revealTool(page) {
    const modes = await page.locator('#rlviews button[data-rlview-mode]').evaluateAll(
        (nodes) => nodes.map((node) => node.getAttribute('data-rlview-mode')));
    expect(modes.length, 'the shared view shell rendered its tablist').toBeGreaterThan(0);
    for (const mode of modes) {
        await page.click('#rlviews button[data-rlview-mode="' + mode + '"]');
        if (await page.locator('#ticker').isVisible()) return mode;
    }
    throw new Error('no shell view revealed the tool surface; tried ' + modes.join(', '));
}

/* Values the boot path writes, plus the notice, plus the structural identity of the control
   rail. Async market data is deliberately excluded — it is not part of the handoff contract
   and would make the comparison a timing race rather than a regression proof. */
async function firstPaint(page) {
    return page.evaluate(() => {
        const notice = document.getElementById('linkNotice');
        const rail = document.querySelector('.modebar');
        return {
            ticker: document.getElementById('ticker').value,
            provider: document.getElementById('prov').value,
            noticePresent: Boolean(notice),
            noticeHidden: notice ? notice.hasAttribute('hidden') : null,
            noticeRole: notice ? notice.getAttribute('role') : null,
            noticeText: notice ? notice.textContent : null,
            railIds: rail ? Array.from(rail.querySelectorAll('[id]')).map((el) => el.id).join(',') : null
        };
    });
}

test('Regression: SCN-027-009 a refused subject leaves the default subject active and every control usable', async ({ page }) => {
    await open(page, '?ticker=' + encodeURIComponent('javascript:alert(1)'));
    await expect(page.locator('#ticker')).toHaveValue(DEFAULT_SUBJECT);
    await revealTool(page);
    for (const id of ['#ticker', '#prov', '#forceRefresh', '#go']) {
        await expect(page.locator(id)).toBeVisible();
        await expect(page.locator(id)).toBeEnabled();
    }
    await page.fill('#ticker', 'NVDA');
    await expect(page.locator('#ticker')).toHaveValue('NVDA');
});

test('Regression: SCN-027-011 the notice states that the link named a subject it could not accept and which subject is shown', async ({ page }) => {
    await open(page, '?ticker=' + encodeURIComponent('<img src=x onerror=1>'));
    await revealTool(page);
    const notice = page.locator('#linkNotice');
    await expect(notice).toBeVisible();
    await expect(notice).toHaveAttribute('role', 'status');
    const text = (await notice.textContent()) || '';
    expect(text).toMatch(/could not accept/i);
    expect(text).toContain(DEFAULT_SUBJECT);
});

test('Regression: SCN-027-010 no adversarial corpus value appears in the body, in any attribute or in localStorage', async ({ page }) => {
    for (const value of REFUSED_CORPUS) {
        await open(page, '?ticker=' + encodeURIComponent(value));
        const leaked = await page.evaluate((probe) => {
            const needle = probe.trim().toUpperCase();
            if (!needle || /^[A-Z0-9.\-]{1,12}$/.test(needle)) return 'corpus value is not refusable';
            const attributes = [];
            document.querySelectorAll('*').forEach((el) => {
                for (const attr of el.attributes) attributes.push(attr.value);
            });
            const storage = JSON.stringify(Object.entries(localStorage));
            const haystack = [document.body.innerHTML, attributes.join('\n'), storage].join('\n').toUpperCase();
            return haystack.includes(needle) ? 'leaked' : null;
        }, value);
        expect(leaked, 'refused value ' + JSON.stringify(value) + ' must not reach a sink').toBeNull();
        await expect(page.locator('#ticker')).toHaveValue(DEFAULT_SUBJECT);
    }
});

test('Regression: SCN-027-006 no parameter, an empty parameter and a whitespace parameter render identical first paints', async ({ page }) => {
    await open(page, '');
    const bare = await firstPaint(page);
    await open(page, '?ticker=');
    const empty = await firstPaint(page);
    await open(page, '?ticker=%20%20%09');
    const blank = await firstPaint(page);
    expect(bare.ticker).toBe(DEFAULT_SUBJECT);
    expect(bare.noticePresent).toBe(true);
    expect(bare.noticeHidden).toBe(true);
    expect(bare.noticeText).toBe('');
    expect(empty).toEqual(bare);
    expect(blank).toEqual(bare);
});

test('Regression: SCN-027-001 an accepted subject seeds the route and outranks restored session state', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('gammaTradingLab', JSON.stringify({ provider: 'pages', ticker: 'AMD' }));
    });
    await open(page, '?ticker=nvda');
    await expect(page.locator('#ticker')).toHaveValue('NVDA');
    await expect(page.locator('#linkNotice')).toBeHidden();
});
