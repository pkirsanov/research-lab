/*
 * Company Multi-Horizon Intelligence Lab — browser surface (feature 025 scope 2).
 *
 * The route is exercised as a production user meets it: its own ephemeral static server, no
 * request interception, no stubbed module. Every assertion reads what the page actually rendered
 * from the committed corpus it actually fetched.
 *
 * Run: npx --no-install playwright test tests/company-intelligence-lab.spec.mjs \
 *        --config=playwright.config.mjs --project=system-chrome --reporter=list
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROUTE = 'company-intelligence-lab.html';
const REGISTERED_PAGES = new Set(JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8')).tools.map((tool) => tool.file));
const ROUTE_SOURCE = readFileSync(join(ROOT, ROUTE), 'utf8');

let site;

test.beforeAll(async () => {
    site = await startStaticServer();
});

test.afterAll(async () => {
    if (site) await site.close();
});

/* Deterministic teardown even when a test times out, which is the one path where a `finally`
   inside the test body is not guaranteed to run. `ignoreErrors` drops every route handler and
   swallows what an in-flight one throws, so nothing survives the test to hold its worker open.
   A no-op for every test that installs no route. */
test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
});

/* One composed run, with every runtime error and failed response captured. Every test starts
   here, so a page-level exception fails the test that would otherwise assert around it. */
async function openComposedRoute(page, { query = '' } = {}) {
    const runtimeErrors = [];
    const failedResponses = [];
    const externalRequests = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));
    page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
    });
    page.on('response', (response) => {
        if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });
    page.on('request', (request) => {
        if (new URL(request.url()).origin !== new URL(site.baseUrl).origin) externalRequests.push(request.url());
    });

    await page.goto(`${site.baseUrl}/${ROUTE}${query}`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/);
    expect(runtimeErrors, `runtime errors: ${runtimeErrors.join(' | ')}`).toEqual([]);
    expect(failedResponses, `failed responses: ${failedResponses.join(' | ')}`).toEqual([]);
    expect(externalRequests, `external requests: ${externalRequests.join(' | ')}`).toEqual([]);
    return { runtimeErrors, failedResponses, externalRequests };
}

async function openPowerMode(page) {
    await page.locator('#mode-power').click();
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'power');
}

test('four horizon regions render with four summaries and four deep-dive controls', async ({ page }) => {
    await openComposedRoute(page);

    const cards = page.locator('#cockpit-horizons [data-horizon]');
    await expect(cards).toHaveCount(4);
    const horizonIds = await cards.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-horizon')));
    expect(horizonIds.slice().sort()).toEqual(['event', 'immediate', 'structural', 'swing']);

    await expect(page.locator('#cockpit-horizons [data-horizon-summary]')).toHaveCount(4);
    await expect(page.locator('#cockpit-horizons [data-horizon-dive]')).toHaveCount(4);
    await expect(page.locator('#cockpit-horizons [data-gap-effect]')).toHaveCount(4);
    await expect(page.locator('#cockpit-horizons [data-invalidation]')).toHaveCount(4);

    for (const horizonId of horizonIds) {
        const card = page.locator(`#cockpit-horizons [data-horizon="${horizonId}"]`);
        const direction = await card.getAttribute('data-direction');
        const quality = await card.getAttribute('data-evidence-quality');
        expect(['constructive', 'pressured', 'flat', 'none']).toContain(direction);
        expect(['broad', 'narrow', 'thin', 'absent']).toContain(quality);
        if (direction === 'none') expect(quality).toBe('absent');
        const summary = await card.locator('[data-horizon-summary]').textContent();
        expect(summary.trim().length).toBeGreaterThan(20);
    }

    /* The cockpit is one region and the power surface holds exactly ten workspaces. */
    await expect(page.locator('#cockpit-heading')).toBeVisible();
    await expect(page.locator('[data-workspace]')).toHaveCount(10);
});

test('Regression: SCN-025-005 four horizon cards stay peers and never merge into one direction', async ({ page }) => {
    await openComposedRoute(page);

    const directions = await page.locator('#cockpit-horizons [data-horizon]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-direction')));
    expect(directions).toHaveLength(4);

    /* No element anywhere claims a single overall direction for the company. */
    await expect(page.locator('[data-overall-direction]')).toHaveCount(0);
    await expect(page.locator('[data-blended-direction]')).toHaveCount(0);
    const bodyText = await page.locator('main').innerText();
    expect(bodyText).not.toMatch(/overall (?:direction|read|verdict|score)/i);
    expect(bodyText).not.toMatch(/blended/i);

    /* When two horizons oppose each other both readings survive and a record names the pair. */
    await openPowerMode(page);
    const opposing = directions.includes('constructive') && directions.includes('pressured');
    const records = page.locator('#workspace-contradictions-body [data-contradiction-id]');
    if (opposing) {
        expect(await records.count()).toBeGreaterThan(0);
        const statement = await records.first().textContent();
        expect(statement).toContain('Both readings stand');
    } else {
        await expect(page.locator('#workspace-contradictions-body [data-contradiction-count="0"]')).toHaveCount(1);
    }
    /* Either way the four cards still carry their own direction attribute. */
    const after = await page.locator('#cockpit-horizons [data-horizon]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-direction')));
    expect(after).toEqual(directions);
});

test('an owned dimension renders a deep link whose target is a registered route', async ({ page }) => {
    await openComposedRoute(page);
    await openPowerMode(page);

    const links = page.locator('#workspace-coverage-rows a[data-owner-link]');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    const targets = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    /* A deep link that opened the owning tool on some OTHER subject would answer the reader's
       question about a different company, so the target is checked in two halves: the path is
       a registered route, and the query — when the owner declares it reads one — names the
       company the reader is actually looking at. */
    const openedCompany = new URL(page.url()).searchParams.get('symbol') || 'MSFT';
    let carried = 0;
    for (const target of targets) {
        const [path, query] = target.split('?');
        expect(REGISTERED_PAGES.has(path), `${path} is a registered route`).toBe(true);
        /* Non-negotiable: the href never grows an origin. A scheme, an absolute URL or a
           protocol-relative prefix would execute or navigate off-site under this page's
           script-src 'unsafe-inline' CSP. */
        expect(target).toMatch(/^[A-Za-z0-9._-]+\.html(\?[A-Za-z][A-Za-z0-9_]*=[A-Za-z0-9%._-]+)?$/);
        expect(new URL(target, page.url()).origin).toBe(new URL(page.url()).origin);
        if (query !== undefined) {
            carried += 1;
            expect(new URLSearchParams(query).get('ticker')).toBe(openedCompany);
        }
    }
    expect(carried, 'at least one owner route opens on the company being read').toBeGreaterThan(0);

    /* Every row without an owner renders a sentence instead of a link, and the two sets partition
       the registry exactly. */
    const rows = page.locator('#workspace-coverage-rows [data-coverage-row]');
    const rowCount = await rows.count();
    expect(rowCount).toBe(15);
    const unowned = page.locator('#workspace-coverage-rows [data-coverage-row][data-has-owner="false"]');
    const unownedCount = await unowned.count();
    expect(unownedCount).toBeGreaterThan(0);
    expect(unownedCount + linkCount).toBe(rowCount);
    await expect(unowned.first().locator('a')).toHaveCount(0);
    const statement = await unowned.first().locator('[data-no-owner]').textContent();
    expect(statement).toContain('No registered tool owns');
});

test('every rendered numeric value carries a provenance chip, a source name and an as-of date', async ({ page }) => {
    await openComposedRoute(page);
    await openPowerMode(page);

    const values = page.locator('[data-value-id]');
    const count = await values.count();
    expect(count, 'the run rendered at least one numeric value').toBeGreaterThan(0);

    const described = await values.evaluateAll((nodes) => nodes.map((node) => ({
        valueId: node.getAttribute('data-value-id'),
        provenance: node.getAttribute('data-provenance-class'),
        chip: node.querySelector('[data-provenance]') ? node.querySelector('[data-provenance]').getAttribute('data-provenance') : null,
        source: node.querySelector('[data-source-name]') ? node.querySelector('[data-source-name]').getAttribute('data-source-name') : null,
        asOf: node.querySelector('[data-as-of]') ? node.querySelector('[data-as-of]').getAttribute('data-as-of') : null,
        number: node.querySelector('[data-value-number]') ? node.querySelector('[data-value-number]').getAttribute('data-value-number') : null
    })));

    for (const value of described) {
        expect(['observed', 'derived', 'proxy', 'modelled'], value.valueId).toContain(value.provenance);
        expect(value.chip, value.valueId).toBe(value.provenance);
        expect((value.source || '').length, value.valueId).toBeGreaterThan(3);
        expect(value.asOf, value.valueId).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(value.number, value.valueId).not.toBeNull();
        if (value.number !== 'unavailable') expect(Number.isFinite(Number(value.number)), value.valueId).toBe(true);
    }
});

test('Regression: SCN-025-021 an unavailable dimension renders a named absence and never a dash or a zero', async ({ page }) => {
    await openComposedRoute(page);
    await openPowerMode(page);

    const unavailable = page.locator('[data-dimension][data-dimension-state="unavailable"]');
    const count = await unavailable.count();
    expect(count, 'increment A really leaves dimensions unavailable').toBeGreaterThan(0);

    const rendered = await unavailable.evaluateAll((nodes) => nodes.map((node) => ({
        dimension: node.getAttribute('data-dimension'),
        reason: node.querySelector('[data-reason-code]') ? node.querySelector('[data-reason-code]').getAttribute('data-reason-code') : null,
        statement: node.querySelector('[data-absence-statement]') ? node.querySelector('[data-absence-statement]').textContent : null,
        valueCount: node.querySelectorAll('[data-value-id]').length,
        text: node.innerText
    })));

    for (const entry of rendered) {
        expect(entry.reason, entry.dimension).not.toBeNull();
        expect(entry.reason, entry.dimension).toMatch(/^[a-z][a-z-]+$/);
        expect((entry.statement || '').length, entry.dimension).toBeGreaterThan(20);
        expect(entry.valueCount, entry.dimension).toBe(0);
        expect(entry.text, entry.dimension).not.toMatch(/(^|\s)[—–-](\s|$)/);
        expect(entry.text, entry.dimension).not.toMatch(/(^|\s)0(\.0+)?(\s|$)/);
    }

    /* The coverage account states the same absence in its own row and in the body attribute. */
    const unavailableAttribute = await page.locator('body').getAttribute('data-coverage-unavailable');
    expect(Number(unavailableAttribute)).toBeGreaterThan(0);
    const coverageRows = page.locator('#workspace-coverage-rows [data-coverage-row]');
    await expect(coverageRows).toHaveCount(15);
    const totals = await page.locator('#workspace-coverage-totals').textContent();
    expect(totals).toContain('15 dimensions accounted for');
});

test('Regression: SCN-025-021 a scripted narrative string renders as visible escaped text', async ({ page }) => {
    await openComposedRoute(page);

    /* The page declares no innerHTML assignment at all, so markup has no sink to reach. */
    expect(ROUTE_SOURCE).not.toContain('innerHTML');
    expect(ROUTE_SOURCE).not.toContain('outerHTML');
    expect(ROUTE_SOURCE).not.toContain('insertAdjacentHTML');
    expect(ROUTE_SOURCE).not.toContain('document.write');

    const payload = '<B>X</B>';
    await page.locator('#subject-input').fill(payload);
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'refused');

    const refusal = page.locator('#subject-refusal');
    await expect(refusal).toBeVisible();
    await expect(refusal).toHaveAttribute('data-refusal-code', 'C025-IDENTITY-UNRESOLVED');
    const shown = await refusal.textContent();
    expect(shown).toContain(payload);
    /* The payload rendered as characters, not as an element. */
    await expect(refusal.locator('b')).toHaveCount(0);
    const injectedNodes = await refusal.evaluate((node) => node.querySelectorAll('*').length);
    expect(injectedNodes).toBe(0);
});

test('a position, size or cost basis entry is refused in the browser and nothing is stored', async ({ page }) => {
    await openComposedRoute(page);

    await page.locator('#subject-input').fill('120 shares at cost basis 210.44');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'refused');
    await expect(page.locator('#subject-refusal')).toHaveAttribute('data-refusal-code', 'C025-INPUT-REFUSED');

    const stored = await page.evaluate(() => {
        const found = [];
        for (let index = 0; index < window.localStorage.length; index += 1) {
            const key = window.localStorage.key(index);
            found.push({ key, value: window.localStorage.getItem(key) });
        }
        return found;
    });
    for (const entry of stored) {
        expect(entry.value, entry.key).not.toContain('210.44');
        expect(entry.value, entry.key).not.toContain('120 shares');
    }
    /* The route declares no credential surface either. */
    await expect(page.locator('input[type="password"]')).toHaveCount(0);
    expect(ROUTE_SOURCE).not.toContain('type="password"');
    expect(ROUTE_SOURCE).not.toContain('providerFetch');
});

test('each canvas draws non-blank pixels and pairs with a table holding the same values', async ({ page }) => {
    await openComposedRoute(page);
    await openPowerMode(page);

    const canvases = [
        { canvas: '#chart-performance', head: '#table-performance-head', rows: '#table-performance-rows', caption: '#caption-performance' },
        { canvas: '#chart-volatility', head: '#table-volatility-head', rows: '#table-volatility-rows', caption: '#caption-volatility' },
        { canvas: '#chart-cycles', head: '#table-cycles-head', rows: '#table-cycles-rows', caption: '#caption-cycles' }
    ];

    for (const entry of canvases) {
        const label = await page.locator(entry.canvas).getAttribute('aria-label');
        expect((label || '').length, entry.canvas).toBeGreaterThan(10);
        const caption = await page.locator(entry.caption).textContent();
        expect(caption.trim(), entry.canvas).toBe(label.trim());

        const distinctColours = await page.locator(entry.canvas).evaluate((canvas) => {
            const context = canvas.getContext('2d');
            const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
            const seen = new Set();
            for (let index = 0; index < data.length; index += 4) {
                seen.add(`${data[index]},${data[index + 1]},${data[index + 2]},${data[index + 3]}`);
            }
            return seen.size;
        });
        expect(distinctColours, `${entry.canvas} drew more than one colour`).toBeGreaterThan(1);

        await expect(page.locator(`${entry.head} th`)).toHaveCount(3);
        const rowCount = await page.locator(`${entry.rows} tr`).count();
        expect(rowCount, entry.rows).toBeGreaterThan(0);
        /* The table holds one row per plotted point, or one explicit row when nothing plotted. */
        const plotted = Number(await page.locator(entry.canvas).getAttribute('data-series-points'));
        const availableRows = await page.locator(`${entry.rows} tr[data-row-state="available"]`).count();
        expect(availableRows, `${entry.rows} mirrors the plotted points`).toBe(plotted);
        if (plotted === 0) expect(rowCount, entry.rows).toBe(1);
        const states = await page.locator(`${entry.rows} tr`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-row-state')));
        for (const state of states) expect(['available', 'unavailable']).toContain(state);
        /* A point with no value renders explicit text, never an empty cell. */
        const emptyCells = await page.locator(`${entry.rows} td`).evaluateAll((nodes) => nodes.filter((node) => node.textContent.trim() === '').length);
        expect(emptyCells, entry.rows).toBe(0);
    }

    /* The performance canvas really plotted a series from the committed corpus. */
    const performanceRows = await page.locator('#table-performance-rows tr[data-row-state="available"]').count();
    expect(performanceRows, 'the committed corpus produced plotted sessions').toBeGreaterThan(1);
});

test('the route defers no drawing and schedules no timer', async ({ page }) => {
    await openComposedRoute(page);

    expect(ROUTE_SOURCE).not.toContain('requestAnimationFrame');
    expect(ROUTE_SOURCE).not.toContain('setTimeout');
    expect(ROUTE_SOURCE).not.toContain('setInterval');

    /* Shared script order: the data module runs first and navigation runs last. */
    const sources = ROUTE_SOURCE.match(/<script src="([^"]+)"><\/script>/g)
        .map((tag) => /src="([^"]+)"/.exec(tag)[1]);
    expect(sources[0]).toBe('rldata.js');
    expect(sources[sources.length - 1]).toBe('rlnav.js');
    expect(sources).toContain('rlcompanyintel.js');
    expect(sources.indexOf('rlcompanyintel.js')).toBeLessThan(sources.indexOf('rlnav.js'));

    /* Every element identity the script reads is declared in the shipped markup. */
    const declared = new Set([...ROUTE_SOURCE.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
    const referenced = [...ROUTE_SOURCE.matchAll(/\b(?:byId|setText)\(\s*"([^"]+)"/g)].map((match) => match[1]);
    expect(referenced.length, 'byId and setText literals were found').toBeGreaterThan(20);
    const missing = referenced.filter((id) => !declared.has(id));
    expect(missing, `undeclared element ids: ${missing.join(', ')}`).toEqual([]);
    /* And the declared identity list the boot check walks matches those literals exactly. */
    const listed = [...ROUTE_SOURCE.matchAll(/ELEMENT_IDS = \[([\s\S]*?)\];/g)]
        .flatMap((match) => [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
    expect(listed.length).toBeGreaterThan(20);
    for (const id of referenced) expect(listed, `${id} is declared in ELEMENT_IDS`).toContain(id);
});

test('switching the mode segment triggers no request and no recomposition', async ({ page }) => {
    await openComposedRoute(page);

    const fingerprintBefore = await page.locator('#workspace-sources-run').textContent();
    const requests = [];
    page.on('request', (request) => requests.push(request.url()));

    await openPowerMode(page);
    await expect(page.locator('#workspace-coverage-rows [data-coverage-row]')).toHaveCount(15);
    await page.locator('#mode-simple').click();
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'simple');

    expect(requests, `mode switching issued: ${requests.join(', ')}`).toEqual([]);
    const fingerprintAfter = await page.locator('#workspace-sources-run').textContent();
    expect(fingerprintAfter).toBe(fingerprintBefore);
    expect(fingerprintAfter).toMatch(/Run fingerprint sha256:[a-f0-9]{64}/);
});

/* FR-025-017 asks the run to reuse committed and cached observations first and to retrieve only
   the missing or stale delta. `loadOne` implements it by returning "cached" without a fetch when
   the shared cache already holds the symbol, and nothing asserted that the short circuit fires:
   a regression to always-fetch would have kept every other row in this file green. */
test('FR-025-017 a second run reuses the cached corpus and refetches no committed bar file', async ({ page }) => {
    const barRequests = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (path.startsWith('/data/bars/')) barRequests.push(path);
    });

    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'loaded');

    /* Non-vacuous control: the first run really did go to the committed corpus for both legs,
       so a later count of zero means the cache answered rather than that nothing ever fetches. */
    expect(barRequests.length, `first run fetched: ${barRequests.join(', ')}`).toBeGreaterThan(0);
    const firstRun = barRequests.slice();
    expect(firstRun.some((path) => path.includes('MSFT'))).toBe(true);

    /* And the delta really landed in the shared cache, which is what the reuse path reads. */
    const cached = await page.evaluate(() => (window.RLDATA.bars('MSFT', '1d') || []).length);
    expect(cached).toBeGreaterThan(0);

    barRequests.length = 0;
    const runLineBefore = await page.locator('#workspace-sources-run').textContent();

    await page.locator('#subject-input').fill('MSFT');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'loaded');

    expect(barRequests, `second run refetched: ${barRequests.join(', ')}`).toEqual([]);

    /* The reused corpus still composes a complete run over the same subject. The run FINGERPRINT
       is deliberately not asserted equal: each run carries its own decision time, so two runs
       milliseconds apart hash differently by design, and demanding equality here would assert
       against the injected-clock contract rather than for the reuse one. */
    const runLineAfter = await page.locator('#workspace-sources-run').textContent();
    expect(runLineAfter).toContain('for company:msft on identity basis sec-cik');
    expect(runLineBefore).toContain('for company:msft on identity basis sec-cik');
    expect(runLineAfter).toMatch(/Run fingerprint sha256:[a-f0-9]{64}/);
    await expect(page.locator('#workspace-coverage-rows [data-coverage-row]')).toHaveCount(15);
    /* And the cache the second run read from still holds the same committed series it reused. */
    expect(await page.evaluate(() => (window.RLDATA.bars('MSFT', '1d') || []).length)).toBe(cached);
});

test('at 375 CSS pixels the four summaries stack and the document never scrolls sideways', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await openComposedRoute(page);

    const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        mainScroll: document.querySelector('main').scrollWidth,
        mainClient: document.querySelector('main').clientWidth
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
    expect(overflow.mainScroll).toBeLessThanOrEqual(overflow.mainClient);

    /* Stacked: every horizon card starts at the same left edge. */
    const lefts = await page.locator('#cockpit-horizons [data-horizon]')
        .evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().left)));
    expect(lefts).toHaveLength(4);
    expect(new Set(lefts).size).toBe(1);

    /* Below 600 pixels the canvas hides and its equivalent table carries the values alone. */
    await openPowerMode(page);
    await expect(page.locator('#chart-performance')).toBeHidden();
    await expect(page.locator('#table-performance')).toBeVisible();
    expect(await page.locator('#table-performance-rows tr').count()).toBeGreaterThan(0);
});

test('the route composes from cache first and publishes a verified owner read', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });

    await expect(page.locator('#subject-identity')).toContainText('MSFT');
    const publication = await page.locator('#cockpit-publication').textContent();
    expect(publication).toContain('company-intelligence-lab');
    expect(publication).toMatch(/availability (current|stale|unavailable)/);

    /* The read really landed on the shared channel under the nine-key contract. */
    const stored = await page.evaluate(() => window.RLDATA.toolRead('company-intelligence-lab'));
    expect(stored).not.toBeNull();
    expect(Object.keys(stored).sort()).toEqual(
        ['asOf', 'availability', 'computedAt', 'contractVersion', 'deepLink', 'freshUntil', 'id', 'metrics', 'read'].sort()
    );
    expect(stored.contractVersion).toBe('rl-tool-read/v1');
    expect(stored.metrics.horizonSummaries).toHaveLength(4);
    expect(stored.metrics.contentFingerprint).toMatch(/^sha256:[a-f0-9]{64}$/);
    if (stored.availability === 'unavailable') {
        expect(stored.asOf).toBeNull();
        expect(stored.freshUntil).toBeNull();
    }

    /* A run with zero refusals says so explicitly rather than leaving an empty block. */
    await openPowerMode(page);
    const refusalBlock = await page.locator('#workspace-sources-refusals').textContent();
    expect(refusalBlock.trim().length).toBeGreaterThan(10);
});

/* ---------- Scope 3 — company event capability (increment B), Test Plan row 3.6 ---------- */

test('Regression: SCN-025-016 a passed event renders as occurred and never as an upcoming catalyst', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    /* The events workspace really carries sourced dates now, not the increment-A absence copy. */
    const rows = page.locator('#workspace-events-body [data-event-id]');
    expect(await rows.count(), 'the committed MSFT event file reached the rendered set').toBeGreaterThan(0);

    const rendered = await rows.evaluateAll((nodes) => nodes.map((node) => ({
        eventId: node.getAttribute('data-event-id'),
        dateClass: node.getAttribute('data-date-class'),
        placement: node.getAttribute('data-event-placement'),
        text: node.textContent
    })));

    /* Every rendered event carries its own date class and its own placement. */
    for (const entry of rendered) {
        expect(['scheduled', 'estimated', 'occurred', 'revised', 'unavailable'], entry.eventId).toContain(entry.dateClass);
        expect(['upcoming', 'occurred'], entry.eventId).toContain(entry.placement);
        expect(entry.text, entry.eventId).toMatch(/\d{4}-\d{2}-\d{2}/);
    }

    /* At least one event has passed, and every passed event is an outcome rather than a forecast. */
    const occurred = rendered.filter((entry) => entry.dateClass === 'occurred');
    expect(occurred.length, 'a dated event in the committed file has already passed').toBeGreaterThan(0);
    for (const entry of occurred) {
        expect(entry.placement, entry.eventId).toBe('occurred');
    }

    /* The upcoming catalyst list is its own region and holds none of those event ids. */
    const catalystIds = await page.locator('#workspace-events-upcoming [data-event-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-event-id')));
    for (const entry of occurred) {
        expect(catalystIds, `${entry.eventId} left the upcoming catalyst list`).not.toContain(entry.eventId);
    }

    /* Non-vacuous: the region really is populated by the same run, so the absence above means
       something. Either a dated event lies ahead, or the region states why it is empty. */
    const upcomingRegion = await page.locator('#workspace-events-upcoming').textContent();
    expect(upcomingRegion.trim().length).toBeGreaterThan(10);
    if (catalystIds.length === 0) expect(upcomingRegion).toMatch(/no .*(dated|catalyst|event)/i);

    /* An occurred event states what was observed and never renders a dash or a bare zero. */
    for (const entry of occurred) {
        const outcome = await page.locator(`#workspace-events-body [data-event-id="${entry.eventId}"] [data-observed-outcome]`).textContent();
        expect(outcome.trim().length, entry.eventId).toBeGreaterThan(10);
        expect(entry.text, entry.eventId).not.toMatch(/(^|\s)[—–-](\s|$)/);
    }

    /* Each rendered event still carries the provenance the rest of the page carries. */
    const provenance = await rows.first().evaluate((node) => ({
        sourceName: node.querySelector('[data-source-name]') ? node.querySelector('[data-source-name]').getAttribute('data-source-name') : null,
        sourceClass: node.getAttribute('data-source-class')
    }));
    expect(provenance.sourceName, 'the event names its source').toBeTruthy();
    expect(['committed-file', 'cache', 'owner-read', 'fixture', 'none']).toContain(provenance.sourceClass);
});

/* ==========================================================================
   Scope 4 — Authored research plan and append-only versions (increment C).
   ========================================================================== */

test('each research branch renders one disclosure row whose header carries the disposition word', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    const rows = page.locator('#workspace-plan-body [data-branch-id]');
    const count = await rows.count();
    expect(count, 'the committed authored plan reached the rendered plan workspace').toBeGreaterThan(1);

    const rendered = await rows.evaluateAll((nodes) => nodes.map((node) => ({
        branchId: node.getAttribute('data-branch-id'),
        disposition: node.getAttribute('data-disposition'),
        tag: node.tagName.toLowerCase(),
        header: node.querySelector('summary') ? node.querySelector('summary').textContent : null,
        body: node.textContent
    })));

    /* One disclosure row per branch, with the disposition audible in the header before expanding. */
    const branchIds = rendered.map((entry) => entry.branchId);
    expect(new Set(branchIds).size, 'every branch renders exactly one row').toBe(count);
    for (const entry of rendered) {
        expect(entry.tag, entry.branchId).toBe('details');
        expect(['changed', 'confirmed', 'no-change', 'refused'], entry.branchId).toContain(entry.disposition);
        expect(entry.header, entry.branchId).toContain(entry.disposition);
        expect(entry.header.trim().length, entry.branchId).toBeGreaterThan(entry.disposition.length + 10);
        expect(entry.body, entry.branchId).toMatch(/Stopped by/);
    }

    /* The summary line states the budget the run actually spent. */
    const summary = await page.locator('#workspace-plan-summary').textContent();
    expect(summary).toMatch(new RegExp(String(count) + ' branches ran'));
    expect(await page.locator('#workspace-plan-summary').getAttribute('data-plan-state')).toBe('branches');
    expect(await page.locator('#workspace-plan-summary').getAttribute('data-plan-source')).toBe('agent-authored');
});

test('an empty research plan renders its reason as readable copy rather than an empty block', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=KO' });
    await openPowerMode(page);

    /* KO resolves and composes, but no authored plan is committed for it. */
    await expect(page.locator('#workspace-plan-body [data-branch-id]')).toHaveCount(0);
    const summaryNode = page.locator('#workspace-plan-summary');
    expect(await summaryNode.getAttribute('data-plan-state')).toBe('empty');
    expect(await summaryNode.getAttribute('data-empty-reason')).toBe('floor-was-sufficient');

    const copy = await summaryNode.textContent();
    expect(copy.trim().length, 'the empty plan states a reason instead of leaving a blank').toBeGreaterThan(40);
    expect(copy).toMatch(/floor/i);

    /* The region itself is not a blank block: it carries the same stated reason. */
    const body = await page.locator('#workspace-plan-body').textContent();
    expect(body.trim().length).toBeGreaterThan(20);
});

test('Regression: SCN-025-022 the outcome record shows the predecessor unmodified beside the new version', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    const record = page.locator('#workspace-outcome-body');
    const currentId = await record.getAttribute('data-version-id');
    const priorId = await record.getAttribute('data-prior-version-id');
    expect(currentId, 'this run carries its own dated version id').toMatch(/^company:msft:\d{4}-\d{2}-\d{2}$/);
    expect(priorId, 'the committed predecessor is named').toMatch(/^company:msft:\d{4}-\d{2}-\d{2}$/);
    expect(priorId, 'the predecessor is a different version from this run').not.toBe(currentId);

    /* The predecessor renders as its own row carrying the fingerprint it shipped with. */
    const priorRow = page.locator(`#workspace-outcome-body [data-version-row="${priorId}"]`);
    await expect(priorRow).toHaveCount(1);
    const priorFingerprint = await priorRow.getAttribute('data-content-fingerprint');
    expect(priorFingerprint).toMatch(/^sha256:[0-9a-f]{64}$/);

    /* The committed predecessor file on disk still carries exactly that fingerprint, so the
       rendered history is the unmodified file rather than a recomputed copy. */
    const committed = JSON.parse(readFileSync(join(ROOT, 'data', 'company-intelligence', 'company-msft',
        'versions', priorId.replace(/:/g, '-') + '.json'), 'utf8'));
    expect(committed.contentFingerprint).toBe(priorFingerprint);
    expect(committed.versionId).toBe(priorId);

    /* The write plan this run emits creates the new version and touches no prior file. */
    const created = await record.getAttribute('data-write-created-path');
    const untouched = await record.getAttribute('data-write-untouched-paths');
    expect(created).toBe(`data/company-intelligence/company-msft/versions/${currentId.replace(/:/g, '-')}.json`);
    expect(untouched.split(' ').filter(Boolean)).toContain(
        `data/company-intelligence/company-msft/versions/${priorId.replace(/:/g, '-')}.json`);
    expect(untouched).not.toContain(created);

    /* The record is readable prose, not two bare identifiers. */
    const copy = await record.textContent();
    expect(copy.trim().length).toBeGreaterThan(80);
    expect(copy).toContain(priorId);
});

test('FR-025-022 each deep dive lists every contributing read with its state, source and as-of date', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });

    const horizonIds = await page.locator('#cockpit-horizons [data-horizon]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-horizon')));
    expect(horizonIds).toHaveLength(4);

    /* A contributing read is one the composer actually used. The requirement is that the deep
       dive states each one's state, source and as-of date — not that it lists bare identifiers. */
    let contributingRowsSeen = 0;
    for (const horizonId of horizonIds) {
        const dive = page.locator(`#cockpit-horizons [data-horizon-dive="${horizonId}"]`);
        await expect(dive).toHaveCount(1);

        const declared = JSON.parse(await dive.getAttribute('data-contributing-dimension-ids'));
        const rows = dive.locator('[data-contributing-dimension]');
        await expect(rows, `${horizonId} renders one row per contributing read`).toHaveCount(declared.length);

        const rendered = await rows.evaluateAll((nodes) => nodes.map((node) => ({
            dimensionId: node.getAttribute('data-contributing-dimension'),
            state: node.getAttribute('data-contributing-state'),
            source: node.getAttribute('data-contributing-source'),
            asOf: node.getAttribute('data-contributing-as-of'),
            text: node.textContent
        })));
        expect(rendered.map((row) => row.dimensionId).sort()).toEqual(declared.slice().sort());

        for (const row of rendered) {
            contributingRowsSeen += 1;
            /* A contributing read reached the composer, so it is current or partial by construction. */
            expect(['current', 'partial'], `${horizonId}/${row.dimensionId} state`).toContain(row.state);
            /* Honest absence: a missing source or date states the absence, never a dash or a zero. */
            expect(row.source, `${horizonId}/${row.dimensionId} source`).toBeTruthy();
            expect(row.asOf, `${horizonId}/${row.dimensionId} as-of`).toBeTruthy();
            expect(row.text).toContain(row.state);
            expect(row.text).not.toMatch(/(^|\s)[—–-](\s|$)/);
            if (row.asOf === 'no dated source') {
                expect(row.text).toContain('no dated source');
            } else {
                expect(row.asOf, `${horizonId}/${row.dimensionId} as-of is a real date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
                expect(row.text).toContain(row.asOf);
            }
        }
    }

    /* The assertion is only meaningful if this corpus actually produced contributing reads. */
    expect(contributingRowsSeen, 'the composed run carried at least one contributing read').toBeGreaterThan(0);
});

test('FR-025-014 every dated coverage row states its age, so a stale read cannot read as current', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    const rows = await page.locator('#workspace-coverage-rows [data-coverage-row]')
        .evaluateAll((nodes) => nodes.map((node) => ({
            dimensionId: node.getAttribute('data-coverage-row'),
            state: node.getAttribute('data-state'),
            asOf: node.getAttribute('data-coverage-as-of'),
            ageDays: node.getAttribute('data-coverage-age-days'),
            text: node.innerText.replace(/\s+/g, ' ')
        })));
    expect(rows.length, 'the coverage account renders every mandatory dimension').toBe(15);

    /* A dated read is one the run actually sourced. Its age is what separates current from
       stale, so the reader must be able to see it rather than infer it from the state word. */
    const dated = rows.filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row.asOf || ''));
    expect(dated.length, 'the committed corpus produced at least one dated read').toBeGreaterThan(0);

    for (const row of dated) {
        expect(Number.isFinite(Number(row.ageDays)), `${row.dimensionId} carries a numeric age`).toBe(true);
        expect(Number(row.ageDays), `${row.dimensionId} age is not negative`).toBeGreaterThanOrEqual(0);
        expect(row.text, `${row.dimensionId} states its age in the row`).toMatch(
            new RegExp(`${row.ageDays} day`));
    }

    /* An undated read states the absence in words. It never borrows a zero age, which would
       read as "observed today", and never a dash. */
    for (const row of rows.filter((candidate) => !dated.includes(candidate))) {
        expect(row.ageDays, `${row.dimensionId} undated age`).toBe('no age');
        expect(row.text, `${row.dimensionId} names the absence`).toContain('no age');
        expect(row.text).not.toMatch(/(^|\s)[—–-](\s|$)/);
        expect(row.text, `${row.dimensionId} must not claim a zero-day age`).not.toMatch(/\b0 days?\b/);
    }
});

/* ---------- Gaps phase — a non-functional requirement the Coverage Report never audited ---------- */

test('NFR-025-005 every rendered ticker is a linked, described token from the shared ticker module', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    /* The shared module rescans on a 240ms debounce after the route renders, so the reader sees
       the upgraded token a moment after compose. Waiting for it is the honest test; asserting
       before it would measure the debounce rather than the requirement. */
    await expect.poll(
        () => page.locator('a.rltkr').count(),
        { message: 'the shared ticker module upgraded at least one token', timeout: 5000 }
    ).toBeGreaterThan(0);

    /* The shared module upgrades known symbols in place. A bare MSFT text node anywhere in the
       rendered document means the token shipped undescribed and unlinked. */
    const tokens = await page.evaluate(() => {
        const linked = [...document.querySelectorAll('a.rltkr')].map((node) => node.textContent.trim());
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const bare = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const parent = node.parentElement;
            if (!parent || parent.closest('a,button,input,textarea,select,script,style,code,pre,.rltkr,.rlnav')) continue;
            if (/\bMSFT\b/.test(node.nodeValue || '')) bare.push(parent.tagName + ': ' + node.nodeValue.trim().slice(0, 60));
        }
        return { linked, bare };
    });
    expect(tokens.linked.length, 'the shared ticker module produced linked tokens').toBeGreaterThan(0);
    expect(tokens.linked, 'the subject ticker itself is a described token').toContain('MSFT');
    expect(tokens.bare, `undescribed ticker text nodes: ${tokens.bare.join(' | ')}`).toEqual([]);
});

/* ==========================================================================
   Stabilize phase — runtime robustness and resource behaviour of this route.

   The rows above all compose against a healthy corpus. These compose against a BROKEN one,
   because the failure path is the one a reader meets on a bad day and the one nothing here
   asserted. Every row below drives the real page over a real server; only the DEPENDENCY's
   observed state is pinned, never the system under test.
   ========================================================================== */

const COMMITTED_SOURCES = [
    'data/bars/MSFT.json',
    'data/bars/SPY.json',
    'data/company-intelligence/company-msft/events.json',
    'data/company-intelligence/company-msft/plan-authored.json',
    'data/company-intelligence/company-msft/current.json',
    'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json'
];

/* An unhandled rejection leaves no mark on the page and no mark on `pageerror`, so a route can
   swallow a whole load path and still look green. Recording it from inside the page is the only
   way a "degrades honestly" claim can be checked rather than assumed. */
async function watchForUnhandledRejections(page) {
    await page.addInitScript(() => {
        window.__rlUnhandled = [];
        window.addEventListener('unhandledrejection', (event) => {
            window.__rlUnhandled.push(String((event.reason && event.reason.message) || event.reason));
        });
    });
    return () => page.evaluate(() => window.__rlUnhandled);
}

test('Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero', async ({ page }) => {
    const broken = await startStaticServer({ missing: COMMITTED_SOURCES });
    try {
        const unhandled = await watchForUnhandledRejections(page);
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto(`${broken.baseUrl}/${ROUTE}?symbol=MSFT`);
        /* The run still completes. A corpus-wide outage is not a reason to stop composing, it is
           a reason for every dimension to state that it has no source. */
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
        await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'unavailable');

        /* Non-vacuous control: the outage really reached the coverage account. */
        const rows = await page.locator('#workspace-coverage-rows [data-coverage-row]')
            .evaluateAll((nodes) => nodes.map((node) => ({
                dimensionId: node.getAttribute('data-coverage-row'),
                state: node.getAttribute('data-state'),
                text: node.innerText.replace(/\s+/g, ' ').trim()
            })));
        expect(rows.length, 'every mandatory dimension still answers under a total outage').toBe(15);
        const unavailable = rows.filter((row) => row.state === 'unavailable');
        expect(unavailable.length, 'the outage really reached the coverage account').toBeGreaterThan(0);

        /* Named absence, never a fabricated zero and never a dash standing in for a number. */
        for (const row of unavailable) {
            expect(row.text.length, `${row.dimensionId} states its absence`).toBeGreaterThan(10);
            expect(row.text, `${row.dimensionId} must not render a bare dash`).not.toMatch(/(^|\s)[—–-](\s|$)/);
            expect(row.text, `${row.dimensionId} must not fabricate a zero`).not.toMatch(/(^|\s)0(\.0+)?(\s|%|$)/);
        }

        /* Four horizons still publish, and a horizon with no evidence says so rather than guessing. */
        const cards = await page.locator('#cockpit-horizons [data-horizon]')
            .evaluateAll((nodes) => nodes.map((node) => ({
                direction: node.getAttribute('data-direction'),
                quality: node.getAttribute('data-evidence-quality')
            })));
        expect(cards).toHaveLength(4);
        for (const card of cards) {
            if (card.direction === 'none') expect(card.quality).toBe('absent');
        }

        expect(await unhandled(), 'a failed load must not become an unhandled rejection').toEqual([]);
        expect(pageErrors, `runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);
    } finally {
        await broken.close();
    }
});

test('Stabilize: a malformed committed payload degrades to an absence rather than a half-read value', async ({ page }) => {
    const overrides = {};
    for (const path of COMMITTED_SOURCES) overrides[path] = '<<< not json at all >>>';
    const broken = await startStaticServer({ overrides });
    try {
        const unhandled = await watchForUnhandledRejections(page);
        const pageErrors = [];
        page.on('pageerror', (error) => pageErrors.push(error.message));

        await page.goto(`${broken.baseUrl}/${ROUTE}?symbol=MSFT`);
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
        await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'unavailable');

        /* A payload that parses to nothing must not surface as an empty region: the plan and the
           event workspaces state the absence in words. */
        const planCopy = await page.locator('#workspace-plan-summary').textContent();
        expect(planCopy.trim().length, 'the plan region states why it is empty').toBeGreaterThan(20);
        expect(await page.locator('#workspace-plan-body [data-branch-id]')).toHaveCount(0);

        expect(await unhandled(), 'a malformed payload must not become an unhandled rejection').toEqual([]);
        expect(pageErrors, `runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);
    } finally {
        await broken.close();
    }
});

test('Stabilize: an unreadable coverage registry refuses by name instead of rendering a blank page', async ({ page }) => {
    const broken = await startStaticServer({ overrides: { 'company-intelligence.config.json': '{ not json' } });
    try {
        const unhandled = await watchForUnhandledRejections(page);
        await page.goto(`${broken.baseUrl}/${ROUTE}`);

        /* The registry is the one dependency the route cannot compose without, so it refuses —
           and the refusal is a named code the reader can act on, not an empty shell. */
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'refused', { timeout: 30_000 });
        const refusal = page.locator('#subject-refusal');
        await expect(refusal).toBeVisible();
        const copy = (await refusal.innerText()).replace(/\s+/g, ' ').trim();
        expect(copy).toMatch(/^C025-[A-Z-]+:/);
        expect(copy.length, 'the refusal explains itself').toBeGreaterThan(40);

        /* Refused is not blank: the page the reader is left with still explains what this tool is. */
        expect((await page.locator('body').innerText()).length).toBeGreaterThan(500);
        expect(await unhandled(), 'a refused boot must not leave an unhandled rejection').toEqual([]);
    } finally {
        await broken.close();
    }
});

test('Stabilize: a storage layer that throws on every write still composes the run', async ({ page }) => {
    const unhandled = await watchForUnhandledRejections(page);
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    /* Safari private mode throws on localStorage.setItem, and a full quota throws everywhere.
       Persistence is a convenience here; losing it must not cost the reader the run. */
    await page.addInitScript(() => {
        Object.getPrototypeOf(window.localStorage).setItem = function () {
            throw new DOMException('QuotaExceededError', 'QuotaExceededError');
        };
    });

    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#workspace-coverage-rows [data-coverage-row]')).toHaveCount(15);

    /* And the composed run really used the corpus it just fetched, in memory, unpersisted. */
    expect(await page.evaluate(() => (window.RLDATA.bars('MSFT', '1d') || []).length)).toBeGreaterThan(0);
    expect(await unhandled(), 'a refused write must not become an unhandled rejection').toEqual([]);
    expect(pageErrors, `runtime errors: ${pageErrors.join(' | ')}`).toEqual([]);
});

test('Stabilize: the route writes only the shared data container and leaves a sibling tool cache intact', async ({ page }) => {
    /* Two sibling containers this route has no business touching. If a cache write ever widened
       to a whole-container replace, these sentinels are what would disappear. */
    await page.addInitScript(() => {
        window.localStorage.setItem('sectorLab', JSON.stringify({ sentinel: 'sector-lab-payload' }));
        window.localStorage.setItem('etfMomLab', JSON.stringify({ sentinel: 'etf-momentum-payload' }));
    });

    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await page.locator('#subject-input').fill('MSFT');
    await page.locator('#subject-apply').click();
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });

    const storage = await page.evaluate(() => ({
        keys: Object.keys(window.localStorage).sort(),
        sectorLab: window.localStorage.getItem('sectorLab'),
        etfMomLab: window.localStorage.getItem('etfMomLab')
    }));
    expect(storage.sectorLab).toBe(JSON.stringify({ sentinel: 'sector-lab-payload' }));
    expect(storage.etfMomLab).toBe(JSON.stringify({ sentinel: 'etf-momentum-payload' }));
    /* Non-vacuous control: the run really did write, so "left the siblings alone" means something. */
    expect(storage.keys, `keys written: ${storage.keys.join(', ')}`).toContain('rlData');
    expect(storage.keys.filter((key) => !['rlData', 'sectorLab', 'etfMomLab'].includes(key)),
        'the route introduced no container of its own').toEqual([]);
});

test('Stabilize: repeat composition of an unchanged subject issues no further request', async ({ page }) => {
    const requests = [];
    page.on('request', (request) => {
        const path = new URL(request.url()).pathname;
        if (path.startsWith('/data/') || path.endsWith('.json')) requests.push(path);
    });

    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'loaded');

    /* Non-vacuous control: the first run really went to the network for the committed record,
       so a later count of zero means the session read is being reused rather than that this
       route never reads anything. */
    expect(requests.some((path) => path.includes('/company-intelligence/')),
        `first run fetched: ${requests.join(', ')}`).toBe(true);

    requests.length = 0;
    for (let attempt = 0; attempt < 5; attempt += 1) {
        await page.locator('#subject-apply').click();
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    }
    await expect.poll(() => requests.length, { timeout: 3000, message: 'settling' }).toBe(0);

    /* A committed file cannot change without a reload, so re-requesting one on every apply is
       pure cost. Five repeat compositions must cost nothing. */
    expect(requests, `repeat compositions refetched: ${requests.join(', ')}`).toEqual([]);
    /* And the reuse still composes a complete run rather than a degraded one. */
    await expect(page.locator('#workspace-coverage-rows [data-coverage-row]')).toHaveCount(15);
    await expect(page.locator('body')).toHaveAttribute('data-corpus-status', 'loaded');
});

test('Stabilize: the idle route runs no polling loop, no interval and no animation frame', async ({ page }) => {
    /* The source-text check above proves this route's own script schedules nothing. It cannot
       see what the shared modules schedule once the page is live, and a polling loop introduced
       there would be invisible to every other row in this file. */
    await page.addInitScript(() => {
        window.__rlSchedules = { intervals: 0, frames: 0, timeouts: 0 };
        const nativeInterval = window.setInterval;
        const nativeFrame = window.requestAnimationFrame;
        const nativeTimeout = window.setTimeout;
        window.setInterval = function (...args) { window.__rlSchedules.intervals += 1; return nativeInterval.apply(window, args); };
        window.requestAnimationFrame = function (...args) { window.__rlSchedules.frames += 1; return nativeFrame.apply(window, args); };
        window.setTimeout = function (...args) { window.__rlSchedules.timeouts += 1; return nativeTimeout.apply(window, args); };
    });

    await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });

    /* Compose hands off to a one-shot debounce in the shared ticker module, so the count is taken
       once that deferred work has run. Sampling before it would measure the handoff; sampling
       after it measures whether anything RESCHEDULES, which is what a polling loop does. */
    await page.waitForTimeout(1500);
    const settled = await page.evaluate(() => window.__rlSchedules);
    const requestsWhileIdle = [];
    page.on('request', (request) => requestsWhileIdle.push(request.url()));
    await page.waitForTimeout(3000);
    const afterIdle = await page.evaluate(() => window.__rlSchedules);

    /* No repeating clock anywhere on the live page, and no drawing loop. */
    expect(afterIdle.intervals, 'the live route schedules no interval').toBe(0);
    expect(afterIdle.frames, 'the live route schedules no animation frame').toBe(0);
    /* Non-vacuous control: deferred work really was scheduled, so "no further work" is a claim
       about settling rather than about a page that never scheduled anything. */
    expect(settled.timeouts, 'the page did schedule deferred work while composing').toBeGreaterThan(0);
    /* And it settled: three idle seconds add no new deferred work and no new request. */
    expect(afterIdle.timeouts - settled.timeouts, 'the settled route reschedules nothing').toBe(0);
    expect(requestsWhileIdle, `idle route polled: ${requestsWhileIdle.join(', ')}`).toEqual([]);
});

test('Stabilize: a version chain that points at itself terminates instead of looping', async ({ page }) => {
    /* An append-only chain is walked by following each record's predecessor. A corrupted record
       naming itself is the shape that turns that walk into an infinite request loop. */
    const selfReferencing = JSON.stringify({
        contractVersion: 'company-intel-version/v1',
        subjectId: 'company:msft',
        versionId: 'company:msft:2026-08-11',
        priorVersionId: 'company:msft:2026-08-11',
        authoredAt: '2026-08-11',
        contentFingerprint: 'sha256:' + '0'.repeat(64),
        horizons: []
    });
    const corrupted = await startStaticServer({
        overrides: { 'data/company-intelligence/company-msft/versions/company-msft-2026-08-11.json': selfReferencing }
    });
    try {
        const versionRequests = [];
        page.on('request', (request) => {
            if (new URL(request.url()).pathname.includes('/versions/')) versionRequests.push(request.url());
        });
        const unhandled = await watchForUnhandledRejections(page);

        await page.goto(`${corrupted.baseUrl}/${ROUTE}?symbol=MSFT`);
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
        await page.waitForTimeout(2000);

        /* The walk terminates, and the session read means the cycle costs one request, not one
           per hop. Both bounds matter: the loop bound stops the walk, the session read stops the
           traffic. */
        expect(versionRequests.length, `version requests: ${versionRequests.length}`).toBe(1);
        expect(await unhandled(), 'a corrupted chain must not become an unhandled rejection').toEqual([]);
    } finally {
        await corrupted.close();
    }
});

test('Chaos: a background corpus paint does not close a deep dive the reader opened', async ({ page }) => {
    /* One apply paints the cockpit twice: once synchronously from the coverage registry and
       again when the corpus resolves. The second paint is not something the reader asked for,
       so a drill-down opened between the two must survive it. Chaos found this by opening a
       deep dive inside that window; the rebuild discarded every <details> open state. */
    await openComposedRoute(page);
    await page.waitForFunction(
        () => document.body.getAttribute('data-corpus-status') !== 'pending',
        null,
        { timeout: 30_000 }
    );
    await page.waitForTimeout(2000);

    /* Apply and open the dive in the same task as the synchronous paint, strictly before the
       asynchronous corpus paint can land. */
    const openedOnApplyPaint = await page.evaluate(() => {
        document.getElementById('subject-input').value = 'AAPL';
        document.getElementById('subject-apply').click();
        const dive = document.querySelector('#cockpit-horizons [data-horizon-dive="immediate"]');
        if (!dive) return false;
        dive.open = true;
        return dive.open;
    });
    expect(openedOnApplyPaint, 'the apply paint produced no deep dive to open').toBe(true);

    await page.waitForTimeout(3000);

    await expect(page.locator('#cockpit-horizons [data-horizon-dive="immediate"]')).toHaveAttribute('open', '');
    /* The dives the reader did NOT open stay closed: the carry-over restores a recorded open
       set rather than opening everything. */
    const openCount = await page.locator('#cockpit-horizons [data-horizon-dive]')
        .evaluateAll((nodes) => nodes.filter((node) => node.open).length);
    expect(openCount, 'the carry-over opened dives the reader never touched').toBe(1);
});

/* ── VAL-READY-07 · no server at all ─────────────────────────────────────────────────────── */
test('the route reaches its first paint from a file:// origin with no server and no off-origin request', async ({ page }) => {
    /* Every other browser assertion in this file serves the route over HTTP. This repository is
       build-free and its pages are meant to work from a bare checkout opened straight off disk,
       so a reader with no server and no toolchain is a supported reader — and until this test
       existed nothing proved the route survives that origin. The precedent is
       tests/market-brief-cockpit.spec.mjs, `expanding a block from a file:// origin requires no
       network call, no credential and no build step`; this follows its shape. */
    test.setTimeout(90_000);

    /* Build-free, checked at the source: one `type="module"` tag would make the page depend on
       ES-module resolution, which is exactly what a bare file:// checkout cannot supply. */
    expect(ROUTE_SOURCE, 'the route must load classic scripts, not ES modules')
        .not.toMatch(/<script[^>]*type=["']module["']/);

    const requests = [];
    const runtimeErrors = [];
    page.on('request', (request) => requests.push(request.url()));
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    await page.goto(pathToFileURL(join(ROOT, ROUTE)).href);

    /* First paint is the composed cockpit: the run status the route sets when it has actually
       composed its horizons. A refusal banner is not a first paint — it is the page telling the
       reader it could not do its job. */
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#cockpit-horizons [data-horizon]')).toHaveCount(4);
    await expect(page.locator('#cockpit-horizons [data-horizon-summary]')).toHaveCount(4);
    const summary = await page.locator('#cockpit-horizons [data-horizon-summary]').first().textContent();
    expect(summary.trim().length, 'the first paint must carry readable copy, not an empty region')
        .toBeGreaterThan(20);
    expect(runtimeErrors, `runtime errors: ${runtimeErrors.join(' | ')}`).toEqual([]);

    /* The invariant is ORIGIN, not request count: a committed same-origin file the route reads
       off disk is the design. A cross-origin or credentialed request is the real defect, because
       it is what would break the reader who has no network and no key. */
    const offOrigin = requests.filter((url) => !url.startsWith('file://'));
    expect(offOrigin, `the route must issue no off-origin request from a file:// origin: ${offOrigin.join(' | ')}`)
        .toEqual([]);
    const credentialed = requests.filter((url) => /[?&](key|token|apikey|api_key|access_token)=/i.test(url));
    expect(credentialed, `the route must send no credential: ${credentialed.join(' | ')}`).toEqual([]);
});

/* ── VAL-READY-07b · nothing waits on a network call before the first paint, server present ── */
test('the first paint composes with every data request still outstanding, then reconciles to the served registry', async ({ page }) => {
    /* The file:// test above proves the route survives an origin that cannot issue a request at
       all. This proves the harder half of the same Checklist item: with a server PRESENT, the
       first composed view must still not be waiting on anything. Every runtime fetch the route
       issues is held open — the registry, the bars, the events, the research record — and the
       page must reach a composed cockpit anyway, from the registry copy that ships inside the
       document. That is the repository's cache-first first paint (P12).

       The document and its classic <script> tags are how the page loads at all, so they are
       continued immediately; `fetch`/`xhr` is what a first paint must not wait on. */
    test.setTimeout(90_000);

    const held = [];
    let release;
    const gate = new Promise((resolve) => { release = resolve; });

    await page.route('**/*', async (route, request) => {
        const kind = request.resourceType();
        if (kind !== 'fetch' && kind !== 'xhr') {
            /* A handler that throws or never settles keeps its worker alive past the test. */
            try { await route.continue(); } catch { /* page or context already closing */ }
            return;
        }
        held.push(request.url());
        await gate;
        try { await route.continue(); } catch { /* page or context already closing */ }
    });

    const runtimeErrors = [];
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    try {
        await page.goto(`${site.baseUrl}/${ROUTE}?symbol=MSFT`);

        /* First paint, while every data request is still open. A refusal banner is not a first
           paint, and an empty shell is not a first paint: four horizons carrying readable copy. */
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 20_000 });
        await expect(page.locator('#cockpit-horizons [data-horizon]')).toHaveCount(4);
        await expect(page.locator('#cockpit-horizons [data-horizon-summary]')).toHaveCount(4);
        const summary = await page.locator('#cockpit-horizons [data-horizon-summary]').first().textContent();
        expect(summary.trim().length, 'the first paint must carry readable copy, not an empty region')
            .toBeGreaterThan(20);

        /* The paint came from the embedded copy, and the served registry has not answered — so
           the composed view above genuinely predates every response. */
        await expect(page.locator('body')).toHaveAttribute('data-registry-source', 'embedded');
        expect(
            held.some((url) => url.endsWith('company-intelligence.config.json')),
            `the route must still be asking the server for its registry: ${held.join(' | ')}`
        ).toBe(true);

        /* Now let the server answer. The served registry is authoritative: the source flips, and
           the page settles composed with its corpus resolved. */
        release();
        await expect(page.locator('body')).toHaveAttribute('data-registry-source', 'served', { timeout: 30_000 });
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed');
        await expect(page.locator('body')).toHaveAttribute('data-corpus-status', /^(loaded|unavailable)$/, { timeout: 30_000 });
        expect(runtimeErrors, `runtime errors: ${runtimeErrors.join(' | ')}`).toEqual([]);
    } finally {
        /* Resume every parked handler first, then drop the routes: with `ignoreErrors`,
           `unrouteAll` silently swallows what a still-in-flight handler throws instead of
           leaving it unhandled the way plain `unroute` does. An unhandled rejection from a
           handler that outlives its test is what keeps a Playwright worker from exiting. */
        release();
        await page.unrouteAll({ behavior: 'ignoreErrors' });
    }
});

/* ── VAL-READY-08 · keyboard reachability ────────────────────────────────────────────────── */
test('every interactive control on the route is reachable and operable from the keyboard alone', async ({ page }) => {
    /* No mouse is used anywhere below. Tab is the only way focus moves, and Enter is the only
       way a control is operated, so a reader who never touches a pointing device is the reader
       this test represents. */
    test.setTimeout(90_000);
    await openComposedRoute(page);

    /* Walk the tab ring from the document start and record where focus actually landed. The
       document-order index makes "sensible order" checkable rather than a matter of opinion:
       focus must move forward through the page, never jump backwards into a control the reader
       has already passed. */
    const walk = [];
    for (let step = 0; step < 80; step++) {
        await page.keyboard.press('Tab');
        const landed = await page.evaluate(() => {
            const node = document.activeElement;
            if (!node || node === document.body || node === document.documentElement) return null;
            const all = Array.prototype.slice.call(document.querySelectorAll('*'));
            const style = window.getComputedStyle(node);
            return {
                id: node.id || null,
                tag: node.tagName.toLowerCase(),
                dive: node.parentElement ? node.parentElement.getAttribute('data-horizon-dive') : null,
                docIndex: all.indexOf(node),
                outlineStyle: style.outlineStyle,
                outlineWidth: style.outlineWidth
            };
        });
        if (landed === null) break;
        /* Focus left the page and wrapped back to the top of the tab ring: the walk is done. */
        if (walk.length > 0 && landed.docIndex <= walk[walk.length - 1].docIndex) break;
        walk.push(landed);
    }

    expect(walk.length, 'Tab moved focus nowhere at all').toBeGreaterThan(0);

    /* 1 · Order. The recorded walk is strictly forward through the document. */
    const indexes = walk.map((entry) => entry.docIndex);
    const sortedIndexes = indexes.slice().sort((a, b) => a - b);
    expect(indexes, `tab order jumped backwards: ${walk.map((e) => e.id || e.tag).join(' → ')}`)
        .toEqual(sortedIndexes);

    /* 2 · Reachability. Every control the route owns is somewhere on that ring. */
    const reached = new Set(walk.map((entry) => entry.id).filter(Boolean));
    for (const controlId of ['subject-input', 'subject-apply', 'mode-simple', 'mode-power']) {
        expect(reached.has(controlId), `#${controlId} is not reachable by Tab`).toBe(true);
    }
    const divesReached = walk.filter((entry) => entry.tag === 'summary' && entry.dive !== null)
        .map((entry) => entry.dive);
    expect(divesReached.slice().sort(), 'every deep-dive control must be reachable by Tab')
        .toEqual(['event', 'immediate', 'structural', 'swing']);

    /* 3 · Visible focus. A control the reader can reach but cannot see is not usable: the focus
       ring is the only thing telling a keyboard reader where they are. */
    for (const entry of walk) {
        const label = entry.id ? `#${entry.id}` : `${entry.tag}${entry.dive ? `[${entry.dive}]` : ''}`;
        expect(entry.outlineStyle, `${label} shows no focus ring while focused`).not.toBe('none');
        expect(entry.outlineWidth, `${label} shows a zero-width focus ring`).not.toBe('0px');
    }

    /* 4 · Operability — deep dives open from the keyboard, not from a click. */
    for (const horizonId of ['immediate', 'swing', 'structural', 'event']) {
        const control = page.locator(`#cockpit-horizons [data-horizon-dive="${horizonId}"] > summary`);
        await control.focus();
        expect(await control.evaluate((node) => node === document.activeElement),
            `the ${horizonId} deep dive must take focus`).toBe(true);
        expect(await control.evaluate((node) => node.parentElement.open),
            `the ${horizonId} deep dive starts closed`).toBe(false);
        await page.keyboard.press('Enter');
        expect(await control.evaluate((node) => node.parentElement.open),
            `the ${horizonId} deep dive must open from the keyboard`).toBe(true);
        await expect(page.locator(`#cockpit-horizons [data-horizon-dive="${horizonId}"] [data-invalidation]`))
            .toBeVisible();
        await page.keyboard.press('Enter');
        expect(await control.evaluate((node) => node.parentElement.open),
            `the ${horizonId} deep dive must close again from the keyboard`).toBe(false);
    }

    /* 5 · Operability — the mode segment switches from the keyboard. */
    const modePower = page.locator('#mode-power');
    await modePower.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'power');
    await expect(modePower).toHaveAttribute('aria-pressed', 'true');
    const modeSimple = page.locator('#mode-simple');
    await modeSimple.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'simple');

    /* 6 · Operability — a company is opened by typing and pressing a button, no pointer. */
    await page.locator('#subject-input').focus();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('AAPL');
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement.id),
        'Tab from the identifier field must land on the apply control').toBe('subject-apply');
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });
    await expect(page.locator('#subject-input')).toHaveValue('AAPL');

    /* 7 · Reachability in Power mode. Steps 1-6 walk the Simple view, which is the default and
       holds the four horizon controls. Power reveals the workspaces, and that is where the
       controls a keyboard reader is most likely to be stranded on live: the owner deep links
       that carry the reader out to the tool owning a dimension, and the research-plan
       disclosures. Neither is on the Simple ring, so without this pass "every control" would
       mean "every control in the smaller of the two views".

       Identity here is the element's own index within its own selector set, resolved inside the
       same evaluate that reads focus. An index into `querySelectorAll('*')` drifts under this
       route's second paint, and a data attribute stamped before the walk is destroyed when the
       shared ticker module rehydrates a token — both were tried and both produce false misses. */
    await page.locator('#mode-power').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'power');
    await expect(page.locator('#workspace-coverage-rows a[data-owner-link]').first()).toBeVisible();

    const powerTargets = 'a[data-owner-link], #workspace-plan-body [data-branch-id] > summary';
    const powerCount = await page.locator(powerTargets).count();
    expect(powerCount, 'Power mode must expose owner links and plan disclosures to reach').toBeGreaterThan(0);

    await page.evaluate(() => { if (document.activeElement) document.activeElement.blur(); });
    const reachedPower = new Set();
    for (let step = 0; step < 400 && reachedPower.size < powerCount; step++) {
        await page.keyboard.press('Tab');
        const index = await page.evaluate((selector) => {
            const node = document.activeElement;
            if (!node) return null;
            const found = Array.prototype.slice.call(document.querySelectorAll(selector)).indexOf(node);
            return found === -1 ? null : found;
        }, powerTargets);
        if (index !== null) reachedPower.add(index);
    }

    const unreachable = await page.locator(powerTargets).evaluateAll(
        (nodes, reached) => nodes
            .map((node, index) => ({ index, label: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40) }))
            .filter((entry) => !reached.includes(entry.index))
            .map((entry) => entry.label),
        [...reachedPower]);
    expect(unreachable, `Power-mode controls no Tab press ever focused: ${unreachable.join(' | ')}`).toEqual([]);
});

/* ---------------------------------------------------------------------------
 * Feature 027 Scope 3 — the declarations and the stated bare reasons, on screen.
 * ------------------------------------------------------------------------- */

test('Regression: SCN-027-018 every subject-carrying owner link opens its owner route on the company being read', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    const registry = JSON.parse(readFileSync(join(ROOT, 'company-intelligence.config.json'), 'utf8')).coverageRegistry;
    const carrying = registry.filter((row) => typeof row.ownerSubjectParam === 'string');
    /* The upstream promise is only satisfiable once EVERY declared row reaches its owner on the
       company in front of the reader, so the expected set is read from the registry rather than
       hard-coded — a row added later is covered without editing this test. */
    expect(carrying.map((row) => row.ownerDeepLink).sort()).toEqual([
        'gamma-trading-lab.html', 'options-flow-feed-lab.html',
        'options-structure-lab.html', 'volatility-sizing-lab.html'
    ]);

    const targets = await page.locator('#workspace-coverage-rows a[data-owner-link]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    for (const row of carrying) {
        const href = `${row.ownerDeepLink}?${row.ownerSubjectParam}=MSFT`;
        expect(targets, `${row.dimensionId} opens its owner on the company being read`).toContain(href);
        expect(REGISTERED_PAGES.has(row.ownerDeepLink), `${row.ownerDeepLink} is a registered route`).toBe(true);
    }

    /* And the parameter really arrives: opened with the composed link, the target route's own
       loaded copy of the shared rule accepts the company off its own query string. Whether that
       company is then inside the target's catalog is that route's own covered/not-covered
       decision, owned and tested by Scopes 1 and 2; what is proven here is the handoff. */
    for (const row of carrying) {
        await page.goto(`${site.baseUrl}/${row.ownerDeepLink}?${row.ownerSubjectParam}=MSFT`,
            { waitUntil: 'domcontentloaded' });
        await expect(page.locator('#linkNotice'), `${row.ownerDeepLink} carries one link notice`).toHaveCount(1);
        const handoff = await page.evaluate(() => (window.RLTKR && window.RLTKR.linkedSubject
            ? window.RLTKR.linkedSubject(window.location.search)
            : null));
        expect(handoff, `${row.ownerDeepLink} loads the shared subject rule`).not.toBeNull();
        expect(handoff.status, `${row.ownerDeepLink} accepts the linked company`).toBe('accepted');
        expect(handoff.subject).toBe('MSFT');
    }
});

test('Regression: SCN-027-014 every bare owner row renders its stated reason beside the link on both the coverage table and the dimension card', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    const registry = JSON.parse(readFileSync(join(ROOT, 'company-intelligence.config.json'), 'utf8')).coverageRegistry;
    const bare = registry.filter((row) => typeof row.ownerBareReason === 'string');
    expect(bare).toHaveLength(7);

    const expectedPhrase = (reason) => (reason === 'market-scoped'
        ? 'answers a market-wide question rather than a company one'
        : 'does not model an individual company you can choose');

    /* Coverage table: the row still renders its link, AND states why that link carries no
       company. A bare link with no sentence beside it reads as a forgotten parameter. */
    for (const row of bare) {
        const cell = page.locator(`#workspace-coverage-rows [data-coverage-row="${row.dimensionId}"]`);
        await expect(cell, `${row.dimensionId} renders a coverage row`).toHaveCount(1);
        await expect(cell.locator('a[data-owner-link]'), `${row.dimensionId} keeps its owner link`).toHaveCount(1);
        const stated = cell.locator('[data-owner-bare-reason]');
        await expect(stated, `${row.dimensionId} states its bare reason in the table`).toHaveCount(1);
        await expect(stated).toContainText(expectedPhrase(row.ownerBareReason));
    }

    /* A subject-carrying row states nothing, because its link already carries the company. */
    const carryingIds = registry.filter((row) => typeof row.ownerSubjectParam === 'string')
        .map((row) => row.dimensionId);
    for (const dimensionId of carryingIds) {
        await expect(page.locator(`#workspace-coverage-rows [data-coverage-row="${dimensionId}"] [data-owner-bare-reason]`),
            `${dimensionId} carries the company, so it states no bare reason`).toHaveCount(0);
    }

    /* Dimension card: the same sentence, on the other surface. The two must not disagree. */
    let cardsChecked = 0;
    for (const row of bare) {
        const card = page.locator(`[data-dimension="${row.dimensionId}"]`).first();
        if (await card.count() === 0) continue;
        cardsChecked += 1;
        await expect(card.locator('a[data-owner-link]'), `${row.dimensionId} card keeps its owner link`).toHaveCount(1);
        const stated = card.locator('[data-owner-bare-reason]');
        await expect(stated, `${row.dimensionId} states its bare reason on the card`).toHaveCount(1);
        await expect(stated).toContainText(expectedPhrase(row.ownerBareReason));
        /* Same sentence on both surfaces, not two paraphrases of one decision. */
        const tableText = (await page.locator(
            `#workspace-coverage-rows [data-coverage-row="${row.dimensionId}"] [data-owner-bare-reason]`).textContent()).trim();
        expect((await stated.textContent()).trim()).toBe(tableText);
    }
    expect(cardsChecked, 'at least one bare dimension rendered a card to compare against').toBeGreaterThan(0);
});

test('Regression: SCN-027-010 the rendered reason is written with textContent and no registry-authored value reaches an attribute or an href', async ({ page }) => {
    await openComposedRoute(page, { query: '?symbol=MSFT' });
    await openPowerMode(page);

    /* The route ships script-src 'unsafe-inline', so a registry string that reached markup would
       execute rather than be escaped. The statement is therefore written as text, never parsed. */
    expect(ROUTE_SOURCE).not.toMatch(/data-owner-bare-reason[^\n]*innerHTML/);
    expect(ROUTE_SOURCE).toMatch(/el\("(p|span)", owner\.statement, \{[^}]*"data-owner-bare-reason": "true"[^}]*\}\)/);

    const stated = page.locator('[data-owner-bare-reason]');
    expect(await stated.count(), 'the page rendered at least one stated reason').toBeGreaterThan(0);
    const nodes = await stated.evaluateAll((elements) => elements.map((element) => ({
        marker: element.getAttribute('data-owner-bare-reason'),
        childElements: element.children.length,
        html: element.innerHTML,
        text: element.textContent,
        href: element.getAttribute('href')
    })));
    for (const node of nodes) {
        /* The marker is the only registry-independent attribute value; the sentence itself lives
           in a text node, so it carries no element children and no markup. */
        expect(node.marker).toBe('true');
        expect(node.childElements, 'the statement is a text node, not parsed markup').toBe(0);
        expect(node.html).toBe(node.text);
        expect(node.html).not.toMatch(/[<>]/);
        expect(node.href, 'a statement is never a link').toBeNull();
    }

    /* Every owner href is still a bare registered route or a route plus one encoded parameter —
       no registry value widened it. */
    const hrefs = await page.locator('#workspace-coverage-rows a[data-owner-link]')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute('href')));
    for (const href of hrefs) {
        expect(href).toMatch(/^[A-Za-z0-9._-]+\.html(\?[A-Za-z][A-Za-z0-9_]*=[A-Za-z0-9%._-]+)?$/);
        expect(new URL(href, page.url()).origin).toBe(new URL(page.url()).origin);
    }
});

/* ── F-AUDIT-08: the hub reads its deep-link subject through the shared corridor rule ──
   This route is the hub every owner deep link points back at. It read ?symbol= with a private
   parser that applied nothing but trim + uppercase, while every spoke route routed its subject
   through RLTKR.linkedSubject. The identical divergence on the spokes became SEC-027-01, a real
   XSS. The two tests below are the halves of the swap: nothing currently valid stopped working,
   and what the shared grammar refuses now never becomes the subject. */

test('Regression: F-AUDIT-08 every currently-valid deep-link subject still opens its company', async ({ page }) => {
    /* One SEC identity, one SEC identity with a shorter ticker, and one resolved from the
       committed bar corpus alone — the three identity bases this route can resolve. */
    for (const [symbol, basis] of [['MSFT', 'sec-cik'], ['KO', 'sec-cik'], ['AAPL', 'committed-bars']]) {
        await openComposedRoute(page, { query: `?symbol=${symbol}` });
        await expect(page.locator('#subject-input')).toHaveValue(symbol);
        /* The shared ticker affordance appends its own glyph inside the parenthesis, so the
           identity is matched around it rather than against a frozen string. */
        await expect(page.locator('#subject-identity')).toContainText(new RegExp(`\\(${symbol}\\W*\\)\\s*resolved on ${basis}`));
        /* An accepted link is honoured silently: the notice is for a link that was not. */
        await expect(page.locator('#link-notice')).toBeHidden();
    }

    /* Lower case and surrounding whitespace normalise exactly as they did before the swap. */
    await openComposedRoute(page, { query: '?symbol=%20%20msft%20%20' });
    await expect(page.locator('#subject-input')).toHaveValue('MSFT');
    await expect(page.locator('#subject-identity')).toContainText(/\(MSFT\W*\)\s*resolved on sec-cik/);
    await expect(page.locator('#link-notice')).toBeHidden();
});

test('Regression: F-AUDIT-08 a subject the shared grammar refuses never becomes the hub subject', async ({ page }) => {
    /* Every value here is refused by RLTKR.linkedSubject and was already unresolvable at this
       route's own resolver, so refusing it earlier costs no working input. */
    const refused = [
        'javascript:alert(1)',
        '../../etc/passwd',
        '//evil.example',
        '<img src=x onerror=1>',
        'MSFT" onmouseover="alert(1)',
        'ABCDEFGHIJKLM',
        '^VIX'
    ];

    for (const value of refused) {
        const requested = [];
        const runtimeErrors = [];
        page.on('pageerror', (error) => runtimeErrors.push(error.message));
        page.on('request', (request) => requested.push(request.url()));

        await page.goto(`${site.baseUrl}/${ROUTE}?symbol=${encodeURIComponent(value)}`);
        await expect(page.locator('body')).toHaveAttribute('data-run-status', 'composed', { timeout: 30_000 });

        /* The refused value did not become the subject: the route composed its default company. */
        await expect(page.locator('#subject-input'), `${value} became the subject`).toHaveValue('MSFT');
        await expect(page.locator('#subject-identity')).toContainText(/\(MSFT\W*\)\s*resolved on sec-cik/);

        /* And the reader is told, rather than being shown a company the link did not name. */
        const notice = page.locator('#link-notice');
        await expect(notice, `${value} was swallowed silently`).toBeVisible();
        await expect(notice).toHaveAttribute('data-link-handoff', 'refused');
        await expect(notice).toContainText('could not accept');
        await expect(notice).toContainText('MSFT');

        /* The refused text reaches neither the rendered page nor a request path. The subject
           flows into a committed-bars fetch and into a symbol-keyed shared cache, so a value
           that survived this far would be reachable at both. The top-level navigation is
           excluded: that request IS the hostile link, and the claim is about what the route
           does with it afterwards. */
        const body = await page.locator('body').innerText();
        expect(body, `${value} was echoed back to the page`).not.toContain(value);
        const subsequent = requested.filter((url) => !url.startsWith(`${site.baseUrl}/${ROUTE}`));
        expect(subsequent.length, 'the route issued its own requests after the navigation').toBeGreaterThan(0);
        const carried = subsequent.filter((url) => url.includes(encodeURIComponent(value))
            || decodeURIComponent(url).includes(value));
        expect(carried, `${value} reached a request: ${carried.join(' | ')}`).toEqual([]);
        expect(runtimeErrors, `runtime errors: ${runtimeErrors.join(' | ')}`).toEqual([]);

        page.removeAllListeners('pageerror');
        page.removeAllListeners('request');
    }
});


