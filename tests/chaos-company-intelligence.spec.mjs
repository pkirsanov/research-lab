/*
 * TEMPORARY chaos harness — feature 025 chaos phase. Deleted at the end of the run unless a
 * finding promotes one of these probes into the permanent spec.
 *
 * Same execution surface as tests/company-intelligence-lab.spec.mjs: the route's own ephemeral
 * static server, no stubbed module, no intercepted response for the core journeys. What differs
 * is ordering — actions are drawn from a seeded PRNG and chained into journeys rather than fired
 * one at a time in a scripted order.
 *
 * Run: npx --no-install playwright test tests/chaos-company-intelligence.spec.mjs \
 *        --config=playwright.config.mjs --project=system-chrome --reporter=list
 */
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

const ROUTE = 'company-intelligence-lab.html';
const SEED = 20260819;

/* Mulberry32 — a seeded PRNG, so a failing journey replays action-for-action from the seed. */
function makeRandom(seed) {
    let state = seed >>> 0;
    return function next() {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

let site;

test.beforeAll(async () => {
    site = await startStaticServer();
});

test.afterAll(async () => {
    if (site) await site.close();
});

/* Deterministic teardown for every journey that installs a route. A handler still sleeping when
   the test ends throws on `route.continue()` against a closing page, which surfaces as an error
   outside any test and keeps the worker alive; `ignoreErrors` drops the handlers and swallows
   what they throw. Journeys that install no route make this a no-op. */
test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
});

/* A delayed pass-through that cannot outlive its test: the sleep is bounded, and a continue
   against a page that is already closing is swallowed rather than left unhandled. */
function delayedContinue(milliseconds) {
    return async (route) => {
        await new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
        try { await route.continue(); } catch { /* page or context already closing */ }
    };
}

/* Every journey runs under this watch, so a page-level exception or a failed response fails the
   journey that produced it rather than silently passing under a DOM assertion. */
function watch(page) {
    const runtimeErrors = [];
    const failedResponses = [];
    const externalRequests = [];
    const barRequests = [];
    page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('response', (response) => {
        if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });
    page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url());
        if (url.pathname.startsWith('/data/bars/')) barRequests.push(url.pathname);
    });
    return { runtimeErrors, failedResponses, externalRequests, barRequests };
}

function assertClean(observed, where) {
    expect(observed.runtimeErrors, `${where} runtime errors: ${observed.runtimeErrors.join(' | ')}`).toEqual([]);
    expect(observed.failedResponses, `${where} failed responses: ${observed.failedResponses.join(' | ')}`).toEqual([]);
    expect(observed.externalRequests, `${where} external requests: ${observed.externalRequests.join(' | ')}`).toEqual([]);
}

/* One user action paints the cockpit twice by design: once synchronously from the registry and
   again when the corpus resolves. Waiting for the corpus attribute as well as the run status is
   what the committed spec does, and without it a probe reads the FIRST of those two paints. */
async function open(page, query = '') {
    await page.goto(`${site.baseUrl}/${ROUTE}${query}`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/, { timeout: 30_000 });
}

/* Counts cockpit PAINTS, not mutation records: the observer callback is batched per microtask, so
   one clear-and-repopulate cycle is one callback however many child records it produced. A
   duplicated click listener shows itself here as extra paints per user click. */
async function installRebuildCounter(page) {
    await page.evaluate(() => {
        window.__chaosRebuilds = 0;
        const host = document.getElementById('cockpit-horizons');
        window.__chaosObserver = new MutationObserver(() => { window.__chaosRebuilds += 1; });
        window.__chaosObserver.observe(host, { childList: true });
    });
}

/* The reading a run rendered, without the run's clock. `metrics.contentFingerprint` embeds
   `composedAt`, so two compositions milliseconds apart differ BY DESIGN and cannot serve as a
   determinism probe. The rendered cockpit text can. */
async function renderedReading(page) {
    return page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('#cockpit-horizons [data-horizon]'));
        return cards.map((card) => [
            card.getAttribute('data-horizon'),
            card.getAttribute('data-direction'),
            card.getAttribute('data-evidence-quality'),
            card.querySelector('[data-horizon-summary]').textContent.trim()
        ].join('|')).join('\n') + '\n' + document.getElementById('cockpit-coverage-line').textContent.trim();
    });
}

async function readRebuilds(page) {
    return page.evaluate(() => window.__chaosRebuilds);
}

async function resetRebuilds(page) {
    await page.evaluate(() => { window.__chaosRebuilds = 0; });
}

const SHAPE = Object.freeze({
    horizons: 4,
    workspaces: 10,
    coverageRows: 15
});

async function assertShapeIntact(page, where) {
    await expect(page.locator('#cockpit-horizons [data-horizon]'), where).toHaveCount(SHAPE.horizons);
    await expect(page.locator('#cockpit-horizons [data-horizon-dive]'), where).toHaveCount(SHAPE.horizons);
    await expect(page.locator('[data-workspace]'), where).toHaveCount(SHAPE.workspaces);
    await expect(page.locator('#workspace-coverage-rows [data-coverage-row]'), where).toHaveCount(SHAPE.coverageRows);
    /* The four horizons stay peers under every ordering — no merged reading appears. */
    await expect(page.locator('[data-overall-direction]'), where).toHaveCount(0);
    await expect(page.locator('[data-blended-direction]'), where).toHaveCount(0);
}

/* ---------------------------------------------------------------------------------------------
   Journey 1 — mode churn, deep-dive churn and repeated apply interleaved from the seed.
   --------------------------------------------------------------------------------------------- */
test('Chaos J1: seeded interleaving of mode, deep dive, apply and resize leaves the run composed and intact', async ({ page }) => {
    const observed = watch(page);
    const random = makeRandom(SEED);
    await open(page, '?symbol=MSFT');
    await installRebuildCounter(page);

    const horizonIds = ['immediate', 'event', 'swing', 'structural'];
    const viewports = [{ width: 375, height: 800 }, { width: 900, height: 900 }, { width: 1440, height: 1000 }];
    const trace = [];

    for (let step = 0; step < 40; step += 1) {
        const draw = random();
        if (draw < 0.25) {
            const mode = random() < 0.5 ? 'simple' : 'power';
            await page.locator(`#mode-${mode}`).click();
            await expect(page.locator('body')).toHaveAttribute('data-mode', mode);
            trace.push(`mode:${mode}`);
        } else if (draw < 0.55) {
            /* The cockpit lives on the simple surface, so a reader reaches a deep dive there. */
            await page.locator('#mode-simple').click();
            const horizonId = horizonIds[Math.floor(random() * horizonIds.length)];
            const dive = page.locator(`#cockpit-horizons [data-horizon-dive="${horizonId}"] > summary`);
            await dive.click();
            trace.push(`dive:${horizonId}`);
        } else if (draw < 0.75) {
            const viewport = viewports[Math.floor(random() * viewports.length)];
            await page.setViewportSize(viewport);
            trace.push(`resize:${viewport.width}`);
        } else {
            await page.locator('#subject-apply').click();
            await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
            trace.push('apply');
        }
    }

    await page.locator('#mode-power').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await assertShapeIntact(page, `after trace ${trace.join(',')}`);
    assertClean(observed, 'J1');

    /* Every apply in the trace produced exactly one cockpit rebuild per resolved composition,
       so no listener accumulated across the churn. */
    const applies = trace.filter((entry) => entry === 'apply').length;
    const rebuilds = await readRebuilds(page);
    console.log(`[chaos J1] steps=${trace.length} applies=${applies} dives=${trace.filter((e) => e.startsWith('dive')).length} modes=${trace.filter((e) => e.startsWith('mode')).length} resizes=${trace.filter((e) => e.startsWith('resize')).length} paints=${rebuilds}`);
    expect(applies, 'the seeded trace really fired applies').toBeGreaterThan(0);
    expect(rebuilds, `rebuilds ${rebuilds} for ${applies} applies`).toBeLessThanOrEqual(applies * 2 + 2);
});

/* ---------------------------------------------------------------------------------------------
   Journey 2 — repeated apply on an already-composed state.
   --------------------------------------------------------------------------------------------- */
test('Chaos J2: twelve applies on an unchanged subject refetch no bar file and duplicate no region', async ({ page }) => {
    const observed = watch(page);
    await open(page, '?symbol=MSFT');
    await page.locator('#mode-power').click();
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'loaded');
    expect(observed.barRequests.length, 'the first run really fetched committed bars').toBeGreaterThan(0);

    const readingBefore = await renderedReading(page);
    observed.barRequests.length = 0;
    await installRebuildCounter(page);

    for (let index = 0; index < 12; index += 1) {
        await page.locator('#subject-apply').click();
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    }

    expect(observed.barRequests, `repeat applies refetched: ${observed.barRequests.join(', ')}`).toEqual([]);
    await assertShapeIntact(page, 'after twelve applies');
    assertClean(observed, 'J2');

    /* Twelve applies produce the designed two paints each, not a growing number. */
    const rebuilds = await readRebuilds(page);
    console.log(`[chaos J2] paints=${rebuilds} for 12 applies; bar refetches=${observed.barRequests.length}`);
    expect(rebuilds, `paints ${rebuilds} for 12 applies`).toBeLessThanOrEqual(12 * 2 + 2);

    /* The composed reading is the same each time: only the decision clock moves. */
    const readingAfter = await renderedReading(page);
    expect(readingAfter, 'repeat composition of an unchanged subject is deterministic').toBe(readingBefore);
});

/* ---------------------------------------------------------------------------------------------
   Journey 3 — out-of-order subject switching. MSFT is the only subject the registry covers with
   a committed event file, so a leak of that file into an uncovered subject is visible in the DOM.
   --------------------------------------------------------------------------------------------- */
test('Chaos J3: interleaved subject switches settle on the last subject and carry no other subject events', async ({ page }) => {
    const observed = watch(page);
    await open(page, '?symbol=MSFT');
    await page.locator('#mode-power').click();
    const msftEventIds = await page.locator('#workspace-events-body [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));
    expect(msftEventIds.length, 'MSFT really renders committed events, so their absence means something').toBeGreaterThan(0);

    /* Rapid out-of-order switching: type and apply without waiting for the previous run to settle. */
    const order = ['AAPL', 'MSFT', 'AAPL', 'MSFT', 'AAPL'];
    for (const symbol of order) {
        await page.locator('#subject-input').fill(symbol);
        await page.locator('#subject-apply').click();
    }
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#subject-identity')).toContainText('AAPL');

    const settledEventIds = await page.locator('#workspace-events-body [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));
    for (const id of settledEventIds) {
        expect(msftEventIds, `AAPL rendered MSFT event ${id}`).not.toContain(id);
    }

    /* Then a further apply on the settled subject: if a losing in-flight run left another
       subject's committed file behind, this synchronous composition renders it. */
    await page.locator('#subject-apply').click();
    const immediateEventIds = await page.locator('#workspace-events-body [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    const finalEventIds = await page.locator('#workspace-events-body [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));

    for (const id of immediateEventIds) {
        expect(msftEventIds, `AAPL re-apply rendered MSFT event ${id} synchronously`).not.toContain(id);
    }
    for (const id of finalEventIds) {
        expect(msftEventIds, `AAPL settled render carried MSFT event ${id}`).not.toContain(id);
    }
    await expect(page.locator('#subject-identity')).toContainText('AAPL');
    await assertShapeIntact(page, 'after interleaved subject switching');
    assertClean(observed, 'J3');
});

/* ---------------------------------------------------------------------------------------------
   Journey 3b — the same interleaving with the committed event file served slowly, which is the
   ordering a real slow link produces. Only the DEPENDENCY's latency is altered; the route is not
   stubbed and still fetches and renders whatever it actually observed.
   --------------------------------------------------------------------------------------------- */
test('Chaos J3b: a slow committed event file cannot land under a later subject', async ({ page }) => {
    const observed = watch(page);
    await page.route('**/data/company-intelligence/**', delayedContinue(900));

    await open(page, '?symbol=AAPL');
    await page.locator('#mode-power').click();
    const aaplBaseline = await page.locator('#workspace-events-body').innerText();

    await page.locator('#subject-input').fill('MSFT');
    await page.locator('#subject-apply').click();
    await page.locator('#subject-input').fill('AAPL');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#subject-identity')).toContainText('AAPL');

    /* Give the losing MSFT run every chance to land after the winner settled. */
    await page.waitForTimeout(2000);
    await expect(page.locator('#subject-identity')).toContainText('AAPL');
    const afterSettle = await page.locator('#workspace-events-body').innerText();
    expect(afterSettle, 'a losing run repainted the events region under a later subject').toBe(aaplBaseline);

    /* And the next composition of the settled subject reads no leftover file. */
    await page.locator('#subject-apply').click();
    const immediate = await page.locator('#workspace-events-body').innerText();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    const settled = await page.locator('#workspace-events-body').innerText();
    expect(immediate, 'a leftover committed file from a losing run reached a later composition').toBe(aaplBaseline);
    expect(settled).toBe(aaplBaseline);
    assertClean(observed, 'J3b');
});

/* ---------------------------------------------------------------------------------------------
   Journey 4 — navigation away and back, plus viewport churn, plus render determinism.
   --------------------------------------------------------------------------------------------- */
test('Chaos J4: navigating away and back recomposes the same reading and leaves no state behind', async ({ page }) => {
    const observed = watch(page);
    await open(page, '?symbol=MSFT');
    const first = await renderedReading(page);

    await page.goto(`${site.baseUrl}/index.html`);
    await page.goBack();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/, { timeout: 30_000 });
    const second = await renderedReading(page);
    await page.locator('#mode-power').click();
    await assertShapeIntact(page, 'after back navigation');

    expect(second, 'the same subject composes the same reading after a round trip').toBe(first);

    /* A fresh load of the route with no query starts from its own opening subject, not from the
       subject the previous visit ended on. */
    await page.goto(`${site.baseUrl}/${ROUTE}`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    const inputValue = await page.locator('#subject-input').inputValue();
    expect(inputValue.length, 'the route reopened with a subject of its own').toBeGreaterThan(0);

    for (const viewport of [{ width: 320, height: 640 }, { width: 1600, height: 900 }, { width: 375, height: 800 }]) {
        await page.setViewportSize(viewport);
        const overflow = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        }));
        expect(overflow.scrollWidth, `sideways scroll at ${viewport.width}`).toBeLessThanOrEqual(overflow.clientWidth);
    }
    assertClean(observed, 'J4');
});

/* ---------------------------------------------------------------------------------------------
   Journey 5 — refusal fuzz interleaved with valid subjects.
   --------------------------------------------------------------------------------------------- */
test('Chaos J5: refused entries interleaved with valid subjects always recover to a composed run', async ({ page }) => {
    const observed = watch(page);
    const random = makeRandom(SEED ^ 0x5f);
    await open(page, '?symbol=MSFT');

    const payloads = [
        '', '   ', '<B>X</B>', '120 shares at cost basis 210.44', 'MSFT MSFT MSFT',
        'a'.repeat(400), '../../etc/passwd', '"><script>1</script>', 'ZZZZZZ', '¤¤¤',
        'msft', 'DROP TABLE tools;--', '0', '-1', 'NULL'
    ];
    const valid = ['MSFT', 'AAPL'];

    for (let step = 0; step < 24; step += 1) {
        if (random() < 0.6) {
            const payload = payloads[Math.floor(random() * payloads.length)];
            await page.locator('#subject-input').fill(payload);
            await page.locator('#subject-apply').click();
            const status = await page.locator('body').getAttribute('data-run-status');
            expect(['refused', 'composed', 'composing'], `payload ${JSON.stringify(payload)} left status ${status}`).toContain(status);
        } else {
            const symbol = valid[Math.floor(random() * valid.length)];
            await page.locator('#subject-input').fill(symbol);
            await page.locator('#subject-apply').click();
            await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
            /* Recovery: the refusal from a previous step is no longer shown. */
            await expect(page.locator('#subject-refusal')).toBeHidden();
        }
    }

    await page.locator('#subject-input').fill('MSFT');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await page.locator('#mode-power').click();
    await assertShapeIntact(page, 'after refusal fuzz');

    /* A page-level exception is never acceptable, whatever was typed. */
    const thrown = observed.runtimeErrors.filter((entry) => entry.startsWith('pageerror:'));
    expect(thrown, `fuzz raised: ${thrown.join(' | ')}`).toEqual([]);
    expect(observed.externalRequests, `fuzz left origin: ${observed.externalRequests.join(', ')}`).toEqual([]);

    /* A symbol with no committed file is a DESIGNED absence: the route probes for the delta, the
       server answers 404, and the run composes an absence rather than failing. So a 404 here is
       expected — what must hold is that every one of them stayed inside the committed data
       directory, which is also the traversal check for the `../../etc/passwd` payload. */
    for (const entry of observed.failedResponses) {
        const path = new URL(entry.slice(entry.indexOf(' ') + 1)).pathname;
        expect(path, `a fuzz payload reached ${path}`).toMatch(/^\/data\/[A-Za-z0-9._%\-/]+$/);
        expect(path, `a fuzz payload escaped the data directory: ${path}`).not.toContain('..');
    }
    console.log(`[chaos J5] 404 probes=${observed.failedResponses.length} paths=${[...new Set(observed.failedResponses.map((e) => new URL(e.slice(e.indexOf(' ') + 1)).pathname))].join(', ')}`);

    /* No fuzz payload was ever persisted. */
    const stored = await page.evaluate(() => {
        const found = [];
        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);
            found.push(String(window.localStorage.getItem(key)));
        }
        return found.join('\n');
    });
    expect(stored).not.toContain('210.44');
    expect(stored).not.toContain('DROP TABLE');
    expect(stored).not.toContain('etc/passwd');
});

/* ---------------------------------------------------------------------------------------------
   Journey 6 — the strongest cross-subject probe. Both corpus legs are served slowly, so the
   composition runs genuinely overlap, and the DOM is SAMPLED CONTINUOUSLY rather than only after
   it settles. A leak that exists for one paint and is corrected by the next would pass a
   settled-state assertion and fails here.
   --------------------------------------------------------------------------------------------- */
test('Chaos J6: every intermediate paint during overlapping runs names one subject and only its own events', async ({ page }) => {
    const observed = watch(page);
    await page.route('**/data/bars/**', delayedContinue(800));

    await open(page, '?symbol=MSFT');
    await page.locator('#mode-power').click();
    const msftEventIds = await page.locator('#workspace-events-body [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));
    expect(msftEventIds.length, 'MSFT really renders committed events').toBeGreaterThan(0);

    await page.evaluate(() => {
        window.__chaosSamples = [];
        const sample = () => {
            const identity = document.getElementById('subject-identity').textContent || '';
            window.__chaosSamples.push({
                identity,
                runStatus: document.body.getAttribute('data-run-status'),
                corpusStatus: document.body.getAttribute('data-corpus-status'),
                eventIds: Array.from(document.querySelectorAll('#workspace-events-body [data-event-id]'))
                    .map((node) => node.getAttribute('data-event-id'))
            });
        };
        window.__chaosSampler = new MutationObserver(sample);
        window.__chaosSampler.observe(document.querySelector('main'), { childList: true, subtree: true, characterData: true });
        new MutationObserver(sample).observe(document.body, { attributes: true });
        sample();
    });

    for (const symbol of ['AAPL', 'MSFT', 'AAPL', 'MSFT', 'AAPL']) {
        await page.locator('#subject-input').fill(symbol);
        await page.locator('#subject-apply').click();
    }
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/, { timeout: 30_000 });
    /* Let every losing run land after the winner settled. */
    await page.waitForTimeout(3000);

    const samples = await page.evaluate(() => window.__chaosSamples);
    /* The shared ticker enhancer renders its "explain this ticker" affordance inline, so the
       identity line reads `(MSFT?)` in textContent once a paint has been enhanced. The subject
       is still the parenthesised uppercase ticker; the optional `?` is that affordance, not part
       of the symbol. Matching it here keeps this extraction reading the SUBJECT rather than
       silently degrading to 'none' on every enhanced paint. */
    const identities = new Set(samples.map((entry) => (/\(([A-Z.]+)\??\)/.exec(entry.identity) || [null, 'none'])[1]));
    const composing = samples.filter((entry) => entry.runStatus === 'composing').length;
    console.log(`[chaos J6] samples=${samples.length} distinct subjects seen=${[...identities].join(',')} composing-state paints=${composing} msft event ids=${msftEventIds.length}`);
    expect(samples.length, 'the overlapping runs really produced intermediate paints').toBeGreaterThan(5);
    expect(identities.size, 'the sampler really saw more than one subject mid-flight').toBeGreaterThan(1);

    const leaks = samples.filter((entry) => /AAPL/.test(entry.identity)
        && entry.eventIds.some((id) => msftEventIds.includes(id)));
    expect(leaks.map((entry) => `${entry.identity.slice(0, 40)} :: ${entry.eventIds.join(',')}`),
        'a paint showed AAPL beside MSFT events').toEqual([]);

    /* And the run really did end on the last subject the reader asked for. */
    await expect(page.locator('#subject-identity')).toContainText('AAPL');
    await assertShapeIntact(page, 'after overlapping runs');
    assertClean(observed, 'J6');
});

/* ---------------------------------------------------------------------------------------------
   Journey 7 — a refusal must not leave a mixed page: the reading still on screen has to belong to
   the subject the identity line names, not to the entry that was just refused.
   --------------------------------------------------------------------------------------------- */
test('Chaos J7: a refused entry leaves the previous subject whole rather than a half-updated page', async ({ page }) => {
    const observed = watch(page);
    await open(page, '?symbol=MSFT');
    await page.locator('#mode-power').click();
    const identityBefore = await page.locator('#subject-identity').textContent();
    const eventsBefore = await page.locator('#workspace-events-body').innerText();
    const coverageBefore = await page.locator('#workspace-coverage-totals').textContent();

    for (const payload of ['300 shares at cost basis 12.5', '<script>x</script>', '', 'profit 1200 usd']) {
        await page.locator('#subject-input').fill(payload);
        await page.locator('#subject-apply').click();
        const status = await page.locator('body').getAttribute('data-run-status');
        if (status !== 'refused') continue;
        /* The identity line, the events and the coverage account are still the prior subject's,
           unchanged and internally consistent. */
        expect(await page.locator('#subject-identity').textContent(), payload).toBe(identityBefore);
        expect(await page.locator('#workspace-events-body').innerText(), payload).toBe(eventsBefore);
        expect(await page.locator('#workspace-coverage-totals').textContent(), payload).toBe(coverageBefore);
        await expect(page.locator('#subject-refusal')).toBeVisible();
    }

    /* And a valid entry afterwards clears the refusal and composes again. */
    await page.locator('#subject-input').fill('MSFT');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#subject-refusal')).toBeHidden();
    await assertShapeIntact(page, 'after refusal recovery');
    assertClean(observed, 'J7');
});

/* ---------------------------------------------------------------------------------------------
   Seed sweep — the journeys above run one seed each. These replay the same journey shapes under
   three further seeds, so a defect reachable only from a different action ordering still shows.
   --------------------------------------------------------------------------------------------- */
for (const sweepSeed of [11, 4242, 987654]) {
    test(`Chaos sweep seed ${sweepSeed}: mixed churn and fuzz leave the route composed with no page error`, async ({ page }) => {
        const observed = watch(page);
        const random = makeRandom(sweepSeed);
        await open(page, '?symbol=MSFT');

        const horizonIds = ['immediate', 'event', 'swing', 'structural'];
        const payloads = ['', '   ', '<i>x</i>', '5 contracts at 3.20 premium', 'MSFT', 'AAPL', 'msft', 'Q'.repeat(80)];
        const viewports = [{ width: 360, height: 720 }, { width: 1024, height: 800 }];

        for (let step = 0; step < 30; step += 1) {
            const draw = random();
            if (draw < 0.2) {
                await page.locator(`#mode-${random() < 0.5 ? 'simple' : 'power'}`).click();
            } else if (draw < 0.4) {
                await page.locator('#mode-simple').click();
                const horizonId = horizonIds[Math.floor(random() * horizonIds.length)];
                await page.locator(`#cockpit-horizons [data-horizon-dive="${horizonId}"] > summary`).click();
            } else if (draw < 0.55) {
                await page.setViewportSize(viewports[Math.floor(random() * viewports.length)]);
            } else if (draw < 0.8) {
                await page.locator('#subject-input').fill(payloads[Math.floor(random() * payloads.length)]);
                await page.locator('#subject-apply').click();
            } else {
                await page.locator('#subject-apply').click();
            }
        }

        await page.locator('#subject-input').fill('MSFT');
        await page.locator('#subject-apply').click();
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
        await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/, { timeout: 30_000 });
        await page.locator('#mode-power').click();
        await assertShapeIntact(page, `sweep ${sweepSeed}`);

        const thrown = observed.runtimeErrors.filter((entry) => entry.startsWith('pageerror:'));
        expect(thrown, `seed ${sweepSeed} raised: ${thrown.join(' | ')}`).toEqual([]);
        expect(observed.externalRequests, `seed ${sweepSeed} left origin`).toEqual([]);
    });
}
