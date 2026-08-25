import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';
import { LIFETIME_TAX_ROUTE, declareOrdinaryHousehold, openPower } from './lifetime-tax.support.mjs';

/* BUG-021. The defect was a read that neither succeeded nor failed: the route sat at
   `truthState = Loading` with no `data-rl-tax-state` attribute for as long as the tab stayed
   open. Every assertion below is driven against THAT condition rather than against a fast read,
   because a fast read succeeded before this change too and proves nothing about the bound.

   The bound and the withheld path are read from the page's own declarations rather than restated
   here, so an operator who changes the declared bound moves these assertions with it. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = JSON.parse(readFileSync(join(ROOT, 'lifetime-tax-strategy.config.json'), 'utf8'));
const BOUND_MS = CONFIG.rules.packReadBoundMs;
const WITHHELD_PACK = CONFIG.rules.medicarePackPaths[String(CONFIG.rules.declaredTaxYear)];

/* 3000 ms is the delay the filing round actually observed settling — it measured the medicare
   pack delayed by three seconds settling normally at 3058 ms. Pinning the tolerated side at a
   delay a real read has taken is what stops the remedy being delivered by making the route
   impatient. The margin covers the eight reads that precede the withheld one plus page load; it
   is not slack in the bound itself. */
const TOLERATED_DELAY_MS = 3000;
const MARGIN_MS = 8000;

/* A digit literal, deliberately: the repo's BUG-009 budget guard can only police a declared wait
   it can read as a number, and an expression it cannot resolve is reported unresolved rather than
   silently trusted. The first assertion below pins this literal against `BOUND_MS + MARGIN_MS`,
   so a change to the declared bound fails here instead of leaving a stale number behind. */
const TERMINAL_WAIT_MS = 18000;

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* ---------- the harness, kept visibly distinct from the system under test ----------

   Both sides are driven with Playwright's own request interception. No server capability is
   added and no page code is replaced: the route still issues the same request to the same
   declared path, so the declared-asset ledger the privacy specs assert is undisturbed.

   `withholdPack` enters the handler and never fulfils, continues or aborts it. That is exactly
   the origin the filing round drove — the request is accepted, no response is ever written and
   the socket is never closed — and it is the one condition the pre-change route could not
   escape.

   `delayPack` waits and then lets the real static server answer, so the response is the genuine
   pack rather than a fixture. */
async function withholdPack(page, path) {
  const entered = [];
  await page.route(`**/${path}`, (route, request) => { entered.push(request.url()); });
  return entered;
}

async function delayPack(page, path, delayMs) {
  await page.route(`**/${path}`, async (route) => {
    await new Promise((settle) => { setTimeout(settle, delayMs); });
    /* The page may already have been torn down by the time the delay elapses on a failing run;
       that is a harness detail and must not be reported as a page fault. */
    try { await route.continue(); } catch (ignored) { void ignored; }
  });
}

async function bootAndWaitForTerminalState(page) {
  const startedAt = Date.now();
  await page.goto(`${site.baseUrl}${LIFETIME_TAX_ROUTE}`);
  await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', /.+/,
    { timeout: TERMINAL_WAIT_MS });
  return Date.now() - startedAt;
}

/* Every rendered stage, exactly as the reader sees it: the stage id, the figure and the standing
   the row claims. Comparing the whole table is what makes "the same figures" a measurement
   rather than a spot check. */
async function settlementTable(page) {
  return page.locator('#settlementStagesBody tr').evaluateAll((nodes) => nodes.map((node) => ({
    stage: node.children[0] ? node.children[0].textContent : '',
    value: node.children[1] ? node.children[1].textContent : '',
    standing: node.children[2] ? node.children[2].textContent : ''
  })));
}

async function unreadDocuments(page) {
  return page.locator('#sourceRecordList li[data-rl-unread-document]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-rl-unread-document')));
}

async function settleHousehold(page) {
  await declareOrdinaryHousehold(page);
  await openPower(page);
}

test('Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and names the document', async ({ page }) => {
  test.setTimeout(60000);
  expect(TERMINAL_WAIT_MS,
    'the literal this suite waits on is the declared bound plus the suite margin, not a number of its own')
    .toBe(BOUND_MS + MARGIN_MS);

  const entered = await withholdPack(page, WITHHELD_PACK);
  const elapsedMs = await bootAndWaitForTerminalState(page);

  expect(entered.length,
    'the harness actually intercepted the declared pack request, so the condition under test was really produced')
    .toBeGreaterThan(0);
  const terminalState = await page.locator('body').getAttribute('data-rl-tax-state');
  /* The exact value, not membership in a set of plausible ones. Which terminal state is reached
     is the whole distinction for an OPTIONAL pack: it must not block the route the way a missing
     configuration does, it must let boot complete and name the absence. Asserting only that some
     terminal value arrived would pass equally on a route that gave up. */
  expect(terminalState,
    'a declared pack that never arrives leaves the route complete and names the absence, rather than blocking boot')
    .toBe('ready');
  expect(elapsedMs,
    'the terminal display state arrives within the declared read bound plus the suite margin')
    .toBeLessThanOrEqual(TERMINAL_WAIT_MS);

  await expect(page.locator('#truthState'),
    'the settlement header no longer reads Loading').not.toHaveText('Loading');

  await openPower(page);
  const unread = page.locator(`#sourceRecordList li[data-rl-unread-document="${WITHHELD_PACK}"]`);
  await expect(unread,
    'the document that did not arrive is named beside the documents that did').toHaveCount(1);
  await expect(unread,
    'and the reason given names the declared bound rather than a generic read failure')
    .toContainText(`did not arrive within the declared read bound of ${BOUND_MS} milliseconds`);
});

/* The stratum-0 half. Every other assertion here drives a PACK read, which stratum 1 governs. A
   bound declared for stratum 0 and never applied to the one read it exists for would leave them
   all green while the route still waited without end on the document that blocks everything
   else — the whole defect, on the read that matters most. */
test('Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds', async ({ page }) => {
  test.setTimeout(60000);
  const entered = await withholdPack(page, 'lifetime-tax-strategy.config.json');

  const startedAt = Date.now();
  await page.goto(`${site.baseUrl}${LIFETIME_TAX_ROUTE}`);
  const declaredBoundMs = await page.evaluate(() => window.RLTAXWORKSPACE.CONFIG_READ_BOUND_MS);
  expect(declaredBoundMs,
    'stratum 0 is a real exported number the route can arm a timer from').toBeGreaterThan(0);
  expect(declaredBoundMs + MARGIN_MS,
    'and this suite waits on that declared stratum-0 bound rather than on a number of its own')
    .toBe(TERMINAL_WAIT_MS);
  await expect(page.locator('body')).toHaveAttribute('data-rl-tax-state', 'config-blocked',
    { timeout: TERMINAL_WAIT_MS });
  const elapsedMs = Date.now() - startedAt;

  expect(entered.length,
    'the harness actually intercepted the configuration request').toBeGreaterThan(0);
  expect(elapsedMs,
    'the configuration read is abandoned within its stratum-0 bound plus the suite margin')
    .toBeLessThanOrEqual(TERMINAL_WAIT_MS);
  await expect(page.locator('#truthState'),
    'the settlement header no longer reads Loading when the configuration itself never arrives')
    .toHaveText('Blocked');
  await expect(page.locator('#configBlockedDetail'),
    'and the refusal names the document that did not arrive and the bound it exceeded')
    .toContainText(`lifetime-tax-strategy.config.json did not arrive within the declared read bound of ${declaredBoundMs} milliseconds`);
});

test('Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement', async ({ page }) => {
  test.setTimeout(90000);

  const undelayed = await page.context().newPage();
  await undelayed.goto(`${site.baseUrl}${LIFETIME_TAX_ROUTE}`);
  await expect(undelayed.locator('body')).toHaveAttribute('data-rl-tax-state', 'ready',
    { timeout: TERMINAL_WAIT_MS });
  await settleHousehold(undelayed);
  const expectedTable = await settlementTable(undelayed);
  expect(expectedTable.length,
    'the undelayed settlement actually rendered stages to compare against').toBeGreaterThan(0);
  await undelayed.close();

  await delayPack(page, WITHHELD_PACK, TOLERATED_DELAY_MS);
  const elapsedMs = await bootAndWaitForTerminalState(page);
  expect(elapsedMs,
    'a delay inside the declared bound is waited out rather than aborted')
    .toBeGreaterThanOrEqual(TOLERATED_DELAY_MS);
  await settleHousehold(page);

  expect(await settlementTable(page),
    'a pack delayed below the bound settles with every figure identical to the undelayed settlement')
    .toEqual(expectedTable);
});

test('Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed', async ({ page }) => {
  test.setTimeout(60000);
  await withholdPack(page, WITHHELD_PACK);
  await bootAndWaitForTerminalState(page);

  const header = await page.locator('#truthState').textContent();
  expect(header,
    'the settlement header does not remain Loading once the declared bound has elapsed')
    .not.toBe('Loading');
  expect(header,
    'and the word it carries is the route\'s own named word for a settlement a missing document left incomplete')
    .toBe('Incomplete');
});

test('Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted', async ({ page }) => {
  test.setTimeout(60000);
  await delayPack(page, WITHHELD_PACK, TOLERATED_DELAY_MS);

  await bootAndWaitForTerminalState(page);
  await expect(page.locator('body'),
    'a delayed but delivered pack still reaches the ready state')
    .toHaveAttribute('data-rl-tax-state', 'ready');
  await settleHousehold(page);
  await expect(page.locator('#truthState'),
    'the tolerated side of the bound settles').toHaveText('Settled');

  expect(await unreadDocuments(page),
    'no declared document is recorded as unread, so the delayed read was served rather than aborted')
    .toEqual([]);
});

test('Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on', async ({ page }) => {
  test.setTimeout(60000);
  await withholdPack(page, WITHHELD_PACK);

  const elapsedMs = await bootAndWaitForTerminalState(page);
  expect(elapsedMs,
    'the withheld read is abandoned rather than waited on, within the declared bound plus the suite margin')
    .toBeLessThanOrEqual(TERMINAL_WAIT_MS);
  expect(elapsedMs,
    'and it is not abandoned before the bound it declares, which would make a working slow origin refuse')
    .toBeGreaterThanOrEqual(BOUND_MS);

  await openPower(page);
  expect(await unreadDocuments(page),
    'the refusing side records the withheld document as unread rather than settling as though it had arrived')
    .toEqual([WITHHELD_PACK]);
});
