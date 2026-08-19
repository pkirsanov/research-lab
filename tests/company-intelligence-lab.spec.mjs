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
import { fileURLToPath } from 'node:url';
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
    for (const target of targets) {
        expect(REGISTERED_PAGES.has(target), `${target} is a registered route`).toBe(true);
    }

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
