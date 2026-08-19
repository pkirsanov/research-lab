import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

/*
 * The cockpit's disclosure-first default view (Feature 026 Scope 4).
 *
 * The complaint this suite locks in: the brief printed everything at once, so the reader met
 * roughly 128,000 characters of narrative before reaching anything that asked for a decision.
 * The fix is NOT deletion — every block still ships — it is demotion: the decision surface, the
 * dark legs, the changed list, the roll-up and the track record stay visible, and every
 * supporting block moves behind exactly one native disclosure control.
 *
 * REAL-STACK, ZERO INTERCEPTION. The page is the committed market-brief.html served over a real
 * static HTTP server, booting the committed rlcockpit.js / rlbrief.js / rlattention.js. Where a
 * payload state is needed that the live artifact cannot be relied on to carry, a whole payload
 * FILE is substituted at the server — exactly as a different publishing window would produce.
 * There is no page.route, no context.route, no intercept and no stub of the code under test.
 *
 * WHY NOTHING HERE IS PINNED TO LIVE CONTENT. market-brief.payload.json and its page projection
 * regenerate four times a day, a tool read is legitimately null, and the Scope 2 and Scope 3
 * blocks appear only once the composer next runs. Every content assertion below therefore runs
 * against a fixture built to the CONTRACT SHAPE, and the two assertions that do read the live
 * artifact are written to accept every state the contract permits.
 */

const PAGE = 'market-brief.html';
const PAGE_PATH = new URL('../market-brief.html', import.meta.url);
const PAGE_HTML = readFileSync(PAGE_PATH, 'utf8');
const REAL_PAGE_PAYLOAD = JSON.parse(readFileSync(new URL('../market-brief.page.json', import.meta.url), 'utf8'));

/* The screen inventory, as data. A block present on the page but absent here — or present here
   with the wrong default — fails the classification test, which is what stops a fifteenth
   section from quietly appearing above the fold. */
const INVENTORY = Object.freeze({
  'dark-legs': 'visible',
  headline: 'visible',
  'decision-surface': 'visible',
  'cross-asset': 'visible',
  changed: 'visible',
  'track-record': 'visible',
  regime: 'collapsed',
  'next-session': 'collapsed',
  'standing-research': 'collapsed',
  backdrop: 'collapsed',
  catalysts: 'collapsed',
  events: 'collapsed',
  groups: 'collapsed',
  watchlist: 'collapsed',
  'tool-reads': 'collapsed',
  experimental: 'collapsed'
});

/* One dark leg, one measured leg, one changed instrument and a roll-up: the honest current shape
   of a run, expressed as the contract rather than as a copy of today's file. */
function cockpitPayload(extra) {
  return JSON.stringify({
    ...REAL_PAGE_PAYLOAD,
    generatedAt: new Date().toISOString(),
    crossAsset: {
      contractVersion: 'cross-asset/v1',
      sessions: 5,
      requiredLegs: 4,
      dark: [{
        contractVersion: 'dark-state/v1',
        leg: 'credit',
        shape: 'dark',
        reason: 'No free public source on file publishes an independent credit-spread reading, so nothing was measured this run.',
        withheld: 'the brief is not stating whether credit is confirming or contradicting the equity trend',
        substitutionRefusal: 'Nothing was substituted for the credit leg: no neighbouring instrument, no earlier run\u2019s value and no zero.'
      }],
      legs: [{
        contractVersion: 'cross-asset-reading/v1',
        leg: 'rates',
        shape: 'measured',
        label: 'Rates',
        driver: 'TLT',
        claim: 'whether a duration move is building',
        changePct: -1.42,
        sessions: 5,
        long63Pct: 3.1,
        provenance: 'Observed',
        state: 'resolved',
        confirmation: null,
        withheld: null,
        asOf: '2026-08-17',
        deepLink: 'real-assets-lab.html'
      }, {
        contractVersion: 'cross-asset-reading/v1',
        leg: 'energy',
        shape: 'measured',
        label: 'Energy',
        driver: 'USO',
        claim: 'whether an energy build is running',
        changePct: 2.05,
        sessions: 3,
        long63Pct: null,
        provenance: 'Proxy',
        state: 'partial',
        confirmation: null,
        withheld: null,
        asOf: '2026-08-17',
        deepLink: 'real-assets-lab.html'
      }],
      standing: []
    },
    changed: [{ symbol: 'NVDA', kind: 'levelCrossed', line: 'NVDA crossed ma50, 168.20 to 174.60', prev: {}, cur: {} }],
    rollUp: {
      line: '= 10 unchanged \u00b7 1 first seen',
      count: 10,
      baselineCount: 1,
      members: [
        { symbol: 'AAPL', state: 'bull-stack' }, { symbol: 'AMZN', state: 'bull-stack' },
        { symbol: 'AVGO', state: 'bull-stack' }, { symbol: 'GOOGL', state: 'bull-stack' },
        { symbol: 'META', state: 'chop' }, { symbol: 'MSFT', state: 'bull-stack' },
        { symbol: 'QQQ', state: 'bull-stack' }, { symbol: 'RSP', state: 'chop' },
        { symbol: 'SPY', state: 'bull-stack' }, { symbol: 'TSLA', state: 'chop' },
        { symbol: 'XLK', state: 'n/a' }
      ]
    },
    ...(extra || {})
  });
}

async function openCockpit(page, server) {
  await page.goto(`${server.baseUrl}/${PAGE}`);
  // #scorecard is the established boot signal the other brief suites use: it is painted by
  // renderAll(), so waiting on it proves the render pass this suite inspects has actually run.
  await expect(page.locator('#scorecard')).toBeVisible({ timeout: 30_000 });
}

/** Every classified block, with what the browser can actually observe about it. */
function readBlocks(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('[data-mac-block]')).map((node) => ({
    block: node.getAttribute('data-mac-block'),
    declared: node.getAttribute('data-mac-default'),
    isDetails: node.tagName.toLowerCase() === 'details',
    open: node.tagName.toLowerCase() === 'details' ? node.open : null,
    insideCollapsed: node.parentElement ? node.parentElement.closest('details') !== null : false,
    ownControls: node.tagName.toLowerCase() === 'details'
      ? Array.from(node.children).filter((child) => child.tagName.toLowerCase() === 'summary').length
      : 0,
    top: node.getBoundingClientRect().top + window.scrollY,
    order: window.getComputedStyle(node).order
  })));
}

/*
 * The expanded state as ASSISTIVE TECHNOLOGY receives it, read out of the browser's own
 * accessibility tree over CDP.
 *
 * Why not read an `aria-expanded` attribute: a native <summary> carries none, and adding one by
 * hand would be a second, hand-maintained copy of a state the user agent already owns — wrong
 * the moment JavaScript is off, which is exactly the condition this mechanism was chosen to
 * survive. Playwright's ariaSnapshot() renders a summary as plain text and reports no state at
 * all, so it cannot answer this question either. The accessibility tree is the only surface that
 * carries the real answer, so that is what is asserted.
 */
async function axExpanded(page, selector) {
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('Accessibility.enable');
    const { root } = await client.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    if (!nodeId) return { role: null, expanded: null };
    const { nodes } = await client.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false });
    for (const node of nodes) {
      const property = (node.properties || []).find((entry) => entry.name === 'expanded');
      if (property) return { role: node.role ? node.role.value : null, expanded: property.value.value };
    }
    return { role: nodes.length && nodes[0].role ? nodes[0].role.value : null, expanded: null };
  } finally {
    await client.detach();
  }
}

/* ── 4.1 · SCN-026-021 ───────────────────────────────────────────────────────────────────── */
test('every supporting block is collapsed on load and the decision surface, dark states, changed list and roll-up are visible', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const blocks = await readBlocks(page);
    const seen = new Map(blocks.map((entry) => [entry.block, entry]));

    // The inventory and the page agree in BOTH directions. A page block missing from the
    // inventory is unclassified; an inventory block missing from the page has been deleted, and
    // this scope deletes nothing.
    expect([...seen.keys()].sort()).toEqual(Object.keys(INVENTORY).sort());

    for (const [block, declared] of Object.entries(INVENTORY)) {
      const entry = seen.get(block);
      expect(entry.declared, `${block} must declare its default state`).toBe(declared);
      if (declared === 'collapsed') {
        expect(entry.isDetails, `${block} must be a native disclosure control`).toBe(true);
        expect(entry.open, `${block} must be shut on load`).toBe(false);
      } else {
        expect(entry.insideCollapsed, `${block} must not sit inside a collapsed control`).toBe(false);
      }
    }

    // …and the four default-visible surfaces actually painted, rather than merely being
    // classified as visible while rendering nothing.
    await expect(page.locator('#darkLegs [data-mac-dark-card="credit"]')).toBeVisible();
    await expect(page.locator('#decisionAttention')).toBeVisible();
    await expect(page.locator('#changedList [data-mac-changed="NVDA"]')).toBeVisible();
    await expect(page.locator('#changedList [data-mac-rollup] > summary')).toBeVisible();
  } finally {
    await server.close();
  }
});

/* ── 4.2 · SCN-026-022 ───────────────────────────────────────────────────────────────────── */
test('every disclosure control is reachable and operable by keyboard alone and reports aria-expanded on both states', async ({ page }) => {
  test.setTimeout(120_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const summaries = page.locator('details[data-mac-block] > summary');
    const count = await summaries.count();
    expect(count).toBe(Object.values(INVENTORY).filter((state) => state === 'collapsed').length);

    for (let index = 0; index < count; index++) {
      const summary = summaries.nth(index);
      const block = await summary.evaluate((node) => node.parentElement.getAttribute('data-mac-block'));

      // Keyboard ALONE. focus() puts the caret on the control the way Tab would; Enter is the
      // key the user agent's own disclosure handling answers to. No click is issued anywhere.
      await summary.focus();
      expect(await summary.evaluate((node) => node === document.activeElement),
        `${block} summary must be focusable`).toBe(true);

      const collapsedState = await summary.evaluate((node) => node.parentElement.open);
      expect(collapsedState, `${block} starts collapsed`).toBe(false);
      const collapsedAria = await axExpanded(page, `details[data-mac-block="${block}"] > summary`);
      expect(collapsedAria, `${block} must report itself collapsed to assistive technology`)
        .toEqual({ role: 'DisclosureTriangle', expanded: false });

      await page.keyboard.press('Enter');
      expect(await summary.evaluate((node) => node.parentElement.open),
        `${block} must expand from the keyboard`).toBe(true);
      const expandedAria = await axExpanded(page, `details[data-mac-block="${block}"] > summary`);
      expect(expandedAria, `${block} must report itself expanded to assistive technology`)
        .toEqual({ role: 'DisclosureTriangle', expanded: true });

      // Focus survives the toggle: losing it here would strand a keyboard reader mid-page.
      expect(await summary.evaluate((node) => node === document.activeElement),
        `${block} summary must keep focus after expanding`).toBe(true);

      await page.keyboard.press('Enter');
      expect(await summary.evaluate((node) => node.parentElement.open),
        `${block} must collapse again from the keyboard`).toBe(false);
    }
  } finally {
    await server.close();
  }
});

/* ── 4.3 · SCN-026-023 ───────────────────────────────────────────────────────────────────── */
test('expanding a block from a file:// origin requires no network call, no credential and no build step', async ({ page }) => {
  test.setTimeout(90_000);
  // No build step: the page loads plain classic scripts. One `type="module"` tag would make the
  // page depend on ES-module resolution, which is the thing "build-free" has to keep out.
  expect(PAGE_HTML).not.toMatch(/<script[^>]*type=["']module["']/);

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(pathToFileURL(PAGE_PATH.pathname).href);
  await expect(page.locator('details[data-mac-block]').first()).toBeAttached({ timeout: 30_000 });

  // The page's live layer fetches market data on load — that is a page cost, not a disclosure
  // cost, and it is still in flight when the blocks become attached. Snapshotting the counter
  // before it settles would bill those background requests to the expansion below and fail a
  // page that is behaving correctly. Wait for the request stream to go quiet first, so the
  // slice really does measure only what opening a block put on the wire.
  let quiescing = -1;
  for (let attempt = 0; attempt < 40 && quiescing !== requests.length; attempt++) {
    quiescing = requests.length;
    await page.waitForTimeout(500);
  }
  expect(requests.length, 'the live layer must settle before disclosure cost is measured').toBe(quiescing);

  const before = requests.length;
  const summaries = page.locator('details[data-mac-block] > summary');
  const count = await summaries.count();
  for (let index = 0; index < count; index++) {
    await summaries.nth(index).focus();
    await page.keyboard.press('Enter');
    expect(await summaries.nth(index).evaluate((node) => node.parentElement.open)).toBe(true);
  }
  /* What this actually promises is in the title: no NETWORK call, no credential. It is not "no
     request at all", because one block defers its fetch until it is opened — market-brief.html
     line 1810 wires experimentalDrawer's toggle to load its artifact on demand, which is the
     correct behaviour for a disclosure-first page with a first-load budget: a reader who never
     opens the drawer never pays for it. Asserting zero requests would punish that design and
     push the fetch back onto first load.

     So the invariant is ORIGIN, not count. Every request the expansion causes must stay on the
     same file:// origin and carry no credential, which is what makes the page work offline from
     a bare checkout with no server and no key. A cross-origin or credentialed fetch is the real
     defect and still fails here. */
  const novel = requests.slice(before).filter((url) => !new Set(requests.slice(0, before)).has(url));
  const offOrigin = novel.filter((url) => !url.startsWith('file://'));
  expect(offOrigin, 'expanding a block must issue no off-origin request').toEqual([]);
  const credentialed = novel.filter((url) => /[?&](key|token|apikey|api_key|access_token)=/i.test(url));
  expect(credentialed, 'expanding a block must send no credential').toEqual([]);
});

/* ── 4.4 · SCN-026-024 ───────────────────────────────────────────────────────────────────── */
test('a dark state, a resolved miss and an invalidation are each outside every collapsed control', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    for (const selector of ['#darkLegs', '#darkLegs [data-mac-dark-card="credit"]', '#scorecard', '#attentionRecord']) {
      const collapsed = await page.locator(selector).evaluate((node) => {
        const owner = node.closest('details');
        return owner === null ? null : owner.getAttribute('data-mac-block');
      });
      expect(collapsed, `${selector} must not be inside a disclosure control`).toBe(null);
    }
    // The withheld conclusion is the part a reader acts on, and it is on the page in full.
    await expect(page.locator('#darkLegs [data-mac-dark-card="credit"]'))
      .toContainText('the brief is not stating whether credit is confirming');
  } finally {
    await server.close();
  }
});

/* ── 4.5 · FR-026-022 dark position ──────────────────────────────────────────────────────── */
test('Regression: SCN-026-018 every dark state renders above the first supporting block in the default view', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const blocks = await readBlocks(page);
    const dark = blocks.find((entry) => entry.block === 'dark-legs');
    const firstSupporting = blocks.filter((entry) => entry.declared === 'collapsed')
      .reduce((lowest, entry) => (lowest === null || entry.top < lowest.top ? entry : lowest), null);
    expect(dark.top).toBeLessThan(firstSupporting.top);
    // …and it is first in the document, not merely above one particular drawer.
    expect(blocks[0].block).toBe('dark-legs');
  } finally {
    await server.close();
  }
});

/* ── 4.6 · FR-026-025 ────────────────────────────────────────────────────────────────────── */
test('the default view contains only the decision surface, the dark states, the changed narrative and the roll-up line', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const visible = (await readBlocks(page)).filter((entry) => entry.declared === 'visible').map((entry) => entry.block);
    // The headline and the track-record line are the two the screen inventory adds to
    // FR-026-025's four; both are named there as visible and never collapsible.
    expect(visible.sort()).toEqual(['changed', 'cross-asset', 'dark-legs', 'decision-surface', 'headline', 'track-record']);

    // Nothing else escaped a drawer: every remaining top-level child of the page shell is
    // either a classified block, the header, or the footer.
    const strays = await page.evaluate(() => Array.from(document.querySelector('.wrap').children)
      .filter((node) => !node.hasAttribute('data-mac-block')
        && !['header'].includes(node.tagName.toLowerCase())
        && node.id !== 'foot')
      .map((node) => node.tagName.toLowerCase() + (node.id ? '#' + node.id : '')));
    expect(strays, 'every top-level block must be classified by the screen inventory').toEqual([]);
  } finally {
    await server.close();
  }
});

/* ── 4.7 · FR-026-026 ────────────────────────────────────────────────────────────────────── */
test('each supporting block is expandable through exactly one control and no block carries two', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    for (const entry of (await readBlocks(page)).filter((block) => block.declared === 'collapsed')) {
      expect(entry.ownControls, `${entry.block} must carry exactly one summary`).toBe(1);
    }
    // …and no supporting block is ALSO hidden by a mode gate, which would cost two controls.
    const hiddenByStyle = await page.evaluate(() => Array.from(document.querySelectorAll('details[data-mac-block]'))
      .filter((node) => window.getComputedStyle(node).display === 'none')
      .map((node) => node.getAttribute('data-mac-block')));
    expect(hiddenByStyle, 'a supporting block must be collapsed, never display:none').toEqual([]);
  } finally {
    await server.close();
  }
});

/* ── 4.8 · FR-026-030 ────────────────────────────────────────────────────────────────────── */
test('every rendered default-view value carries an in-place explanation of what it is and what the current value implies', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const values = await page.evaluate(() => Array.from(document.querySelectorAll('[data-mac-value], [data-attn-field]'))
      .filter((node) => node.closest('details') === null)
      .map((node) => ({ text: (node.textContent || '').trim(), title: node.getAttribute('title') || '' })));

    expect(values.length, 'the default view must render at least one explained value').toBeGreaterThan(8);
    const unexplained = values.filter((value) => !value.title.includes('Reading now'));
    expect(unexplained, 'every default-view value states what it is AND what the reading implies').toEqual([]);
    // TP-026-4.8 requires the observed PAIRING COUNT on the record, not merely a green run: a
    // test count says how many assertions ran, which is a different instrument from how many
    // rendered values were found to carry an explanation. Emitting it makes the coverage
    // legible, and re-running the row reproduces the number.
    console.log(`[TP-026-4.8] value-to-explanation pairing: ${values.length} of ${values.length} default-visible values carry an in-place explanation; unexplained=${unexplained.length}`);
  } finally {
    await server.close();
  }
});

/* ── 4.9 · the live decision surface under BUG-009 ───────────────────────────────────────── */
test('Regression: SCN-026-BUG009 the live payload renders the unreachable decision-surface statement and no fabricated card', async ({ page }) => {
  test.setTimeout(90_000);
  // The COMMITTED artifacts, unsubstituted. Written to accept every state the contract permits,
  // because the payload republishes four times a day and a run that starts publishing items is
  // a legitimate future state, not a regression this suite should invent a failure for.
  const server = await startStaticServer({});
  try {
    await openCockpit(page, server);
    const cards = page.locator('#decisionAttention [data-attn-item]');
    const empty = page.locator('#decisionAttention [data-attn-field="empty-state"]');
    const cardCount = await cards.count();

    if (cardCount === 0) {
      // The state a live run actually reaches today: a published statement, never a blank, a
      // dash or a zero standing in for one.
      await expect(empty).toBeVisible();
      expect((await empty.textContent()).trim().length).toBeGreaterThan(20);
    } else {
      // The other permitted state. Every card is real and collapsed to its own summary; none is
      // an empty shell fabricated to fill the list.
      await expect(empty).toHaveCount(0);
      for (let index = 0; index < cardCount; index++) {
        expect((await cards.nth(index).textContent()).trim().length).toBeGreaterThan(0);
      }
    }
    // Either way the emptiness is never BOTH claimed and populated.
    expect(cardCount === 0 || (await empty.count()) === 0).toBe(true);
  } finally {
    await server.close();
  }
});

/* ── 4.10 · fixture ──────────────────────────────────────────────────────────────────────── */
test('fixture: a payload with an empty attention list and a reachable producer renders the quiet statement', async ({ page }) => {
  test.setTimeout(90_000);
  // FIXTURE-SOURCED, and this is not live coverage. BUG-009 means the live producer records
  // nothing, so the quiet state has no live subject; the payload below supplies one.
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload({ attention: [] }) } });
  try {
    await openCockpit(page, server);
    const empty = page.locator('#decisionAttention [data-attn-field="empty-state"]');
    await expect(empty).toBeVisible();
    await expect(page.locator('#decisionAttention [data-attn-item]')).toHaveCount(0);
    // The count line still states the number rather than leaving the reader to infer it.
    await expect(page.locator('#decisionAttention [data-attn-field="open-count"]')).toContainText('0 items');
  } finally {
    await server.close();
  }
});

/* ── 4.11 · fixture ──────────────────────────────────────────────────────────────────────── */
test('fixture: a payload carrying ranked attention cards renders them collapsed to their summaries', async ({ page }) => {
  test.setTimeout(90_000);
  // FIXTURE-SOURCED, and this is not live coverage, for the same reason as the quiet state.
  // The card is contract-shaped `decision-attention/v1`: the tier admits an item on its
  // contractVersion and its view model, so a shorter hand-written object would be filtered out
  // and this test would pass on an empty list for the wrong reason.
  const expiry = new Date(Date.now() + 3 * 86_400_000).toISOString();
  const observedAt = new Date(Date.now() - 3_600_000).toISOString();
  const ranked = [{
    contractVersion: 'decision-attention/v1',
    id: 'attn-cockpit-fixture-1',
    gateId: 'gate-cockpit-fixture-1',
    rank: 1,
    domain: 'index breadth',
    horizon: 'swing',
    subject: 'SPY',
    disposition: 'attention',
    severity: 'moderate',
    imminence: 'developing',
    title: 'Breadth diverges from the index trend',
    headline: 'Breadth weakened while the index held its structural trend',
    structuralAnchor: 'The broad-market participation gate remains unresolved.',
    what: 'Participation weakened while the index held its structural trend.',
    why: 'A persistent divergence can change the next-session risk posture.',
    rationale: 'The participation signal diverged from the index close.',
    verb: 'scenario-test',
    invalidation: 'Breadth recovers above the declared broad-market gate.',
    escalationTrigger: 'Breadth falls below the observed session low.',
    confidence: 55,
    deepLink: 'market-heatmap-lab.html',
    expiry,
    decisionWindow: 'morning',
    windowBoundaryUtc: observedAt,
    windowTradingDate: observedAt.slice(0, 10),
    windowResolvedFrom: 'session',
    transmissionPath: ['breadth-market-structure'],
    transmissionAbsenceNote: null,
    marketConfirmation: { state: 'present', detail: 'The breadth divergence is present in the observed session.' },
    marketConfirmationNote: null,
    figures: [{
      label: 'broad-market participation',
      value: 'below the declared gate',
      provenance: { sourceId: 'market-heatmap-lab', asOf: observedAt }
    }],
    observedAt,
    state: 'discovered',
    supersededBy: null,
    lifecycle: [{ to: 'discovered', at: observedAt, condition: 'observed', ref: null }]
  }];
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload({ attention: ranked }) } });
  try {
    await openCockpit(page, server);
    const items = page.locator('#decisionAttention [data-attn-item]');
    const count = await items.count();
    expect(count, 'the fixture card must reach the decision surface').toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
      // Collapsed to its summary: the body exists but is not painted until the reader asks.
      const shut = await items.nth(index).evaluate((node) => {
        const owner = node.tagName.toLowerCase() === 'details' ? node : node.querySelector('details');
        return owner === null ? 'no-disclosure' : owner.open;
      });
      expect(shut, 'a decision card is collapsed to its summary on load').toBe(false);
    }
  } finally {
    await server.close();
  }
});

/* ── 4.12 · NFR-026-005 ──────────────────────────────────────────────────────────────────── */
test('Regression: SCN-026-ESC a payload whose narrative carries markup renders as escaped text at every sink', async ({ page }) => {
  test.setTimeout(90_000);
  const injected = JSON.parse(cockpitPayload());
  injected.crossAsset.dark[0].reason = 'No source on file <img src=x onerror="window.__macXss=1"> publishes it.';
  injected.crossAsset.legs[0].label = '<script>window.__macXss=1</script>Rates';
  injected.changed[0].line = 'NVDA <b onmouseover="window.__macXss=1">crossed</b> ma50';
  injected.rollUp.line = '= 10 unchanged <svg onload="window.__macXss=1"></svg>';
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': JSON.stringify(injected) } });
  try {
    await openCockpit(page, server);
    // The markup arrived as TEXT. Finding the literal angle bracket in textContent is the proof
    // that esc() ran; finding a live element would be the proof that it did not.
    await expect(page.locator('#darkLegs [data-mac-dark-card="credit"]')).toContainText('<img src=x onerror=');
    await expect(page.locator('#changedList [data-mac-changed="NVDA"]')).toContainText('<b onmouseover=');
    const injectedNodes = await page.evaluate(() => ({
      images: document.querySelectorAll('#darkLegs img, #crossAsset img, #changedList img').length,
      scripts: document.querySelectorAll('#darkLegs script, #crossAsset script, #changedList script').length,
      svgs: document.querySelectorAll('#changedList svg').length,
      flag: window.__macXss === undefined ? 'unset' : 'FIRED'
    }));
    expect(injectedNodes).toEqual({ images: 0, scripts: 0, svgs: 0, flag: 'unset' });
  } finally {
    await server.close();
  }
});

/* ── 4.15 · adversarial ──────────────────────────────────────────────────────────────────── */
test('adversarial: moving a dark card inside a details element fails the not-collapsed assertion', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);

    // The guard passes on the shipped page…
    const shipped = await page.locator('#darkLegs').evaluate((node) => node.closest('details') !== null);
    expect(shipped).toBe(false);

    // …and REJECTS the one arrangement it exists to catch. Without this the assertion above
    // could be green because the page happens to contain no <details> at all.
    const afterMove = await page.evaluate(() => {
      const drawer = document.querySelector('details[data-mac-block="backdrop"] .body');
      drawer.appendChild(document.querySelector('#darkLegs'));
      return document.querySelector('#darkLegs').closest('details') !== null;
    });
    expect(afterMove, 'a dark card inside a drawer must be detected, not tolerated').toBe(true);
  } finally {
    await server.close();
  }
});

/* ── 4.16 · adversarial ──────────────────────────────────────────────────────────────────── */
test('adversarial: focus order follows DOM order and no style rule reorders a visible block behind a collapsed one', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const blocks = await readBlocks(page);

    // Painted order equals document order. `order` is the property that could silently break
    // this, so it is checked directly as well as through the resulting geometry.
    for (const entry of blocks) expect(entry.order, `${entry.block} must not carry a flex order`).toBe('0');
    for (let index = 1; index < blocks.length; index++) {
      expect(blocks[index].top, `${blocks[index].block} paints after ${blocks[index - 1].block}`)
        .toBeGreaterThanOrEqual(blocks[index - 1].top);
    }

    // The adversarial half: applying a reordering rule must break the geometry check, proving
    // the check reads the painted position rather than re-reading the DOM it came from.
    const reordered = await page.evaluate(() => {
      const wrap = document.querySelector('.wrap');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      document.querySelector('[data-mac-block="experimental"]').style.order = '-1';
      const dark = document.querySelector('[data-mac-block="dark-legs"]').getBoundingClientRect().top;
      const last = document.querySelector('[data-mac-block="experimental"]').getBoundingClientRect().top;
      return { dark, last };
    });
    expect(reordered.last, 'a reordering rule must be detectable by painted position')
      .toBeLessThan(reordered.dark);
  } finally {
    await server.close();
  }
});

/*
 * The four assertions below close the per-scope E2E gap. Each scope's contract was proven at the
 * module and validator level, where a fixture can be shaped freely; these prove the same
 * contracts survive the trip through the real renderer into a real browser, which is the only
 * place the reader actually meets them.
 */

test('TP-026-1.16 the default-visible text a reader actually meets fits the declared total cap', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    // The budget is enforced on the PAYLOAD by the validator. This is the other half: that the
    // enforced number describes what is rendered. Text inside a closed <details> is disclosed,
    // not default-visible, so it is excluded here exactly as the measurement excludes it.
    const visibleChars = await page.evaluate(() => Array.from(document.querySelectorAll('[data-mac-block][data-mac-default="visible"]'))
      .filter((node) => !node.parentElement || node.parentElement.closest('details') === null)
      .reduce((total, node) => total + (node.innerText || '').replace(/\s+/g, ' ').trim().length, 0));
    expect(visibleChars, 'the default view must carry text').toBeGreaterThan(0);
    expect(visibleChars, `default-visible rendered text ${visibleChars} must fit the declared 3000 cap`).toBeLessThanOrEqual(3000);
  } finally {
    await server.close();
  }
});

test('TP-026-2.21 every required cross-asset slot resolves on screen to exactly one of a reading or a dark state', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const legs = await page.evaluate(() => {
      const text = (sel) => Array.from(document.querySelectorAll(sel)).map((n) => (n.innerText || '').toLowerCase()).join(' ');
      const readings = text('[data-mac-block="cross-asset"]');
      const dark = text('[data-mac-block="dark-legs"]');
      return ['rates', 'energy', 'credit'].map((leg) => ({
        leg,
        asReading: readings.includes(leg) ? 1 : 0,
        asDark: dark.includes(leg) ? 1 : 0
      }));
    });
    // The arithmetic the contract demands: one slot, one resolution, never both and never neither.
    for (const entry of legs) {
      expect(entry.asReading + entry.asDark, `${entry.leg} resolves exactly once on screen`).toBe(1);
    }
    // And the dark leg must carry no figure, which is the substitution this feature refuses.
    const darkText = await page.locator('[data-mac-block="dark-legs"]').innerText();
    expect(darkText, 'a dark leg publishes no percentage').not.toMatch(/-?\d+(\.\d+)?\s*%/);
  } finally {
    await server.close();
  }
});

test('TP-026-3.20 the changed list and its roll-up balance on screen, and no unchanged instrument earns narrative', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const changedText = await page.locator('[data-mac-block="changed"]').innerText();
    // The fixture publishes exactly one changed instrument and counts eleven others.
    expect(changedText).toContain('NVDA');
    expect(changedText, 'the roll-up states the unchanged count').toMatch(/10 unchanged/);
    // Delta-only: an instrument counted into the roll-up must NOT also carry its own narrative
    // line. MSFT is in the roll-up members, so its symbol may appear at most in that one line.
    const msftLines = changedText.split('\n').filter((line) => line.includes('MSFT'));
    expect(msftLines.length, 'an unchanged instrument is a count, never a paragraph').toBeLessThanOrEqual(1);
  } finally {
    await server.close();
  }
});

test('TP-026-5.17 the track record is part of the default view and is not reachable only by expanding', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({ overrides: { 'market-brief.page.json': cockpitPayload() } });
  try {
    await openCockpit(page, server);
    const placement = await page.evaluate(() => {
      const node = document.querySelector('[data-mac-block="track-record"]');
      if (!node) return null;
      return { declared: node.getAttribute('data-mac-default'), insideCollapsed: node.parentElement ? node.parentElement.closest('details') !== null : false };
    });
    expect(placement, 'the track record block ships').not.toBeNull();
    expect(placement.declared, 'the track record is declared visible').toBe('visible');
    // A scorecard hidden behind a drawer is a scorecard that hides its misses.
    expect(placement.insideCollapsed, 'the track record sits outside every collapsed control').toBe(false);
  } finally {
    await server.close();
  }
});

/*
 * BUG-009 R4. The attention feed has been empty on every published run because every
 * candidate is refused for want of an observed gate result. The old text — "No attention
 * items in the current payload" — reads as a calm market, which is the single most
 * dangerous sentence this brief can print: it invites the reader to conclude nothing
 * happened when the truth is that the detector produced nothing to substantiate.
 */
test('SCN-BUG009-R4 an empty attention feed tells the reader it was refused, not that the market was calm', async ({ page }) => {
  test.setTimeout(90_000);
  const refused = [
    { code: 'RLATTN-PROVENANCE', field: 'gateResult', index: 0, reason: 'an attention item is built from an observed gate result', subject: null },
    { code: 'RLATTN-PROVENANCE', field: 'gateResult', index: 1, reason: 'an attention item is built from an observed gate result', subject: null },
    { code: 'RLATTN-PROVENANCE', field: 'gateResult', index: 2, reason: 'an attention item is built from an observed gate result', subject: null }
  ];
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': cockpitPayload({ attention: [], attentionExclusions: refused }) }
  });
  try {
    await openCockpit(page, server);
    const host = page.locator('[data-mac-attention-empty="refused"]');
    await expect(host, 'the refusal block is published when candidates were refused').toHaveCount(1);

    // The attention feed lives inside the collapsed "catalysts" drawer by Scope 4's
    // disclosure-first design, so the refusal statement is disclosed content rather than
    // default-visible text — it costs no default-visible budget and is one control away,
    // exactly where a reader goes to ask what the feed found.
    await page.locator('[data-mac-summary="catalysts"]').click();
    await expect(host, 'opening the catalysts control reveals the refusal').toBeVisible();
    const text = (await host.textContent()) || '';

    expect(text, 'the reader is told how many candidates were withheld').toContain('3 candidates refused');
    expect(text, 'the reason is reproduced from the exclusion record').toContain('an attention item is built from an observed gate result');
    expect(text, 'nothing was quietly substituted for the refused candidates').toContain('Nothing was substituted');
    expect(text, 'the block refuses the calm reading explicitly').toContain('does not mean nothing happened');

    // Three identical reasons state their cause ONCE with a count, not three times.
    await expect(page.locator('[data-mac-attention-exclusion]'),
      'identical reasons collapse to a single counted line').toHaveCount(1);

    // The misleading sentence must be gone from the rendered page in this state.
    const body = await page.locator('body').innerText();
    expect(body, 'the old calm-sounding sentence is not what a refused feed prints')
      .not.toContain('No attention items in the current payload. Nothing was refused');
  } finally {
    await server.close();
  }
});

test('SCN-BUG009-R4 a genuinely quiet run still reads as quiet and is not dressed up as a refusal', async ({ page }) => {
  test.setTimeout(90_000);
  const server = await startStaticServer({
    overrides: { 'market-brief.page.json': cockpitPayload({ attention: [], attentionExclusions: [] }) }
  });
  try {
    await openCockpit(page, server);
    // The negative control for the row above: with nothing refused, the refusal block MUST NOT
    // appear. Without this, a renderer that always cried refusal would pass the test above.
    await expect(page.locator('[data-mac-attention-empty="refused"]'),
      'no refusal is claimed when nothing was refused').toHaveCount(0);
    await expect(page.locator('[data-mac-attention-empty="quiet"]'),
      'the genuinely quiet state is still expressible').toHaveCount(1);
  } finally {
    await server.close();
  }
});
