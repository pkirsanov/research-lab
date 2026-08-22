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

/* The row above proves the three absent-ish forms agree with EACH OTHER. That is a self-
   comparison: it stays green even if all three drifted together away from what this route
   painted before the handoff existed — and this route's diff was NOT purely additive, it also
   moved boot() from an immediate call to a DOMContentLoaded listener. The values below are
   read out of the PRE-FEATURE blob (git 0f63acb50^:gamma-trading-lab.html line 1295 —
   `provider: 'pages', proxy: '', ticker: 'SPY'`), so they pin what the route booted to before
   the handoff and before the boot-timing change. */
const PRE_FEATURE_UNLINKED_PAINT = Object.freeze({ ticker: 'SPY', provider: 'pages' });

test('Regression: SCN-027-006 with no subject parameter the rescheduled boot still lands on this route pre-feature default subject and provider, not merely on the same value the empty and whitespace forms happen to carry', async ({ page }) => {
    await open(page, '');
    const bare = await firstPaint(page);
    console.log('SCN-027-006 GAMMA UNLINKED PAINT: ' + JSON.stringify(bare));
    expect({ ticker: bare.ticker, provider: bare.provider }).toEqual(PRE_FEATURE_UNLINKED_PAINT);
    expect(bare.noticePresent).toBe(true);
    expect(bare.noticeHidden).toBe(true);
    expect(bare.noticeText).toBe('');
    expect(bare.noticeRole).toBe('status');
});

test('Regression: SCN-027-001 an accepted subject seeds the route and outranks restored session state', async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('gammaTradingLab', JSON.stringify({ provider: 'pages', ticker: 'AMD' }));
    });
    await open(page, '?ticker=nvda');
    await expect(page.locator('#ticker')).toHaveValue('NVDA');
    await expect(page.locator('#linkNotice')).toBeHidden();
});

/* ── Stabilize phase — FR-027-011 on this route ──
 * FR-027-011 binds every receiving route opened with NO subject parameter to select the same
 * default subject. A stabilize probe seeded a hand-set company, followed one link, and then
 * re-opened the route bare: the linked company had replaced the hand-set one in
 * localStorage, so the no-parameter visit no longer selected the same default. With a
 * catalog-miss subject (?ticker=ZZZZ, accepted by the grammar, absent from the snapshot) the
 * route was left in its failed read on every later bare visit, with the notice hidden and
 * nothing on the page to explain it. options-flow already forbids this for the same reason.
 * This row reads the persisted key after a linked visit and fails if the link reached it. */
test('Regression: FR-027-011 a deep-linked subject never becomes the persisted default', async ({ page }) => {
    /* seeded through one real visit rather than addInitScript, which re-runs on EVERY
       navigation and would re-write the hand-set value the later reads are meant to prove */
    await open(page, '');
    await page.evaluate(() => localStorage.setItem('gammaTradingLab', JSON.stringify({ provider: 'pages', ticker: 'AMD' })));

    await open(page, '?ticker=nvda');
    await expect(page.locator('#ticker')).toHaveValue('NVDA');
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem('gammaTradingLab')))).ticker).toBe('AMD');

    /* a subject the grammar accepts but the route cannot resolve must not become the default either */
    await open(page, '?ticker=ZZZZ');
    await expect(page.locator('#ticker')).toHaveValue('ZZZZ');
    expect((await page.evaluate(() => JSON.parse(localStorage.getItem('gammaTradingLab')))).ticker).toBe('AMD');

    /* and the bare visit still selects what the reader set by hand */
    await open(page, '');
    await expect(page.locator('#ticker')).toHaveValue('AMD');
});

/* ── Harden phase — FR-027-009 / BS-027-004 on this route ──
 * FR-027-009 binds EVERY route that has applied a subject, and BS-027-004 requires the
 * company to be stated "in words on the page", "not inferable only from a chart or a table
 * cell". The scenario manifest scoped SCN-027-004 to the two routes this feature newly made
 * subject-carrying, so on this precedent route the applied subject was asserted ONLY through
 * #ticker — a form control's value, which is not a statement. A harden probe removed the
 * subject from the one element that does state it and the whole suite stayed green
 * (red-green-probe exit 7, SURVIVED). This row is that missing assertion: it reads the
 * statement itself, and it fails when the statement stops naming the subject. */
test('Regression: SCN-027-004 the applied subject is stated in words on the page, not only in the ticker control', async ({ page }) => {
    await open(page, '?ticker=nvda');
    /* the pill is written by render(), so wait for it to leave its no-subject default rather
       than racing the first snapshot */
    await page.waitForFunction(() => {
        const pill = document.getElementById('pillTk');
        return pill && pill.textContent.trim() !== '' && pill.textContent.indexOf('no ticker yet') === -1;
    }, null, { timeout: 15000 });
    const stated = await page.evaluate(() => {
        const pill = document.getElementById('pillTk');
        return {
            text: pill.textContent,
            insideCanvas: pill.closest('canvas') !== null,
            isFormControl: ['INPUT', 'SELECT', 'TEXTAREA'].indexOf(pill.tagName) !== -1,
            control: document.getElementById('ticker').value
        };
    });
    /* the statement names the linked company, and it is a statement rather than a control */
    expect(stated.text).toContain('NVDA');
    expect(stated.insideCanvas).toBe(false);
    expect(stated.isFormControl).toBe(false);
    /* and it agrees with the control, so the reader cannot be shown two different subjects */
    expect(stated.control).toBe('NVDA');
});

/* ── found by seeded chaos (spec 027 chaos phase, journey J6, seed 4271006) ──
 * The refusal notice ends in a PRESENT-TENSE clause naming the subject on screen, so it is a
 * claim about the current state and not a record of the arrival. It was rendered once at boot,
 * so a reader who named their own subject afterwards was left reading a notice that still named
 * the subject they had replaced: the ticker control said one company and the notice said another.
 * The existing single-subject rows all assert at first paint, before any reader control change,
 * so none of them could see it. This one drives the control the way a reader does.
 * ───────────────────────────────────────────────────────────────────────────── */
test('Regression: SCN-027-013 the refusal notice keeps naming the subject actually on screen after the reader names their own', async ({ page }) => {
    await open(page, '?ticker=' + encodeURIComponent('NV DA'));
    await revealTool(page);
    const notice = page.locator('#linkNotice');
    await expect(notice).toContainText('could not accept');
    const arrivalSubject = await page.locator('#ticker').inputValue();
    expect(await notice.textContent(), 'the notice must name the subject it booted on').toContain(arrivalSubject);

    await page.fill('#ticker', 'MSFT');
    await page.press('#ticker', 'Enter');
    await page.waitForFunction(() => document.getElementById('ticker').value === 'MSFT', null, { timeout: 20000 });

    const after = await notice.textContent();
    expect(after, 'the notice still names the replaced subject, so the page states two subjects').toContain('MSFT');
    expect(after, 'the reason the link did not land was dropped instead of restated').toContain('could not accept');
});


