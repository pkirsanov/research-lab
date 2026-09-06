/*
 * tests/tool-brief-v2.spec.mjs
 * ---------------------------------------------------------------------------
 * Feature 012 Scope 11 — TP-11-05, TP-11-06, and (see the note below) the
 * SCN-012-018 / SCN-012-020 Center regressions.
 *
 * REAL-STACK, ZERO REQUEST INTERCEPTION. Each test navigates to the REAL
 * market-brief.html route over a real static HTTP server and boots the REAL
 * production runtime. The Center controller reads the REAL committed
 * tool-experience.gates.json through the REAL rlexperience dependency predicate
 * to decide whether the Feature 002 gate is satisfied — the page is never told
 * the answer. Rendering runs through the REAL RLBRIEF renderers via the shipped
 * `window.__rlmac` seams, exactly as the Scope 09 specs drive the real
 * controller with a fixture context. Nothing is routed, stubbed, or replayed.
 *
 * The ToolBrief/v2 objects handed to those seams are built in Node by the REAL
 * production path — freezeBundleForAuthor -> compactToolBriefV2Input ->
 * buildToolAuthorRequestV2 -> validateToolBriefV2 — so a brief the validator
 * would refuse can never reach the browser assertions.
 *
 * FILE-LOCATION NOTE (recorded, not silently resolved): the Scope 11 Test Plan
 * names tests/market-action-center.spec.mjs as the location for TP-11-07 and
 * TP-11-08. That file is NOT listed under the scope's own "Implementation
 * Files", and the scope's "Change Boundary And Protected Paths" says
 * "Allowed: only files listed under Implementation Files". The two persistent
 * titles are therefore carried HERE, verbatim, in an allowed new file. The
 * discrepancy between the Test Plan's File/Location column and the Change
 * Boundary is routed to bubbles.plan rather than resolved by editing either.
 */
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

import { buildToolAuthorRequestV2, compactToolBriefV2Input, validateToolBriefV2 } from '../scripts/brief-author.mjs';
import { freezeBundleForAuthor } from '../scripts/web-evidence-acquire.mjs';
import * as fx from './fixtures/feature-012/tool-brief-v2/builder.mjs';

const PAGE = 'market-brief.html';
/* private Feature-008 semantics that a PUBLIC authored Brief may never expose. */
const PRIVATE_COPY_PATTERN = /holding|quantity|cost basis|p&l|pnl|mandate|personal exposure|share count|position size/i;
const PRIVATE_KEY_PATTERN = /portfolio|holding|quantit|costbasis|avgcost|pnl|mandate|position|exposure|sharecount/i;

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* Build one VALIDATED ToolBrief/v2 through the real production chain. */
function authoredBriefFor(options) {
  const opts = options || {};
  const scope = opts.scope || 'tool';
  const frozen = freezeBundleForAuthor(fx.bundle(), fx.lanePolicy());
  if (!frozen.ok) throw new Error(`fixture bundle must freeze: ${JSON.stringify(frozen.error)}`);
  const compact = compactToolBriefV2Input({
    toolId: fx.TOOL_ID, runId: fx.RUN_ID, cutoffAt: fx.CUTOFF_AT, ownerRead: fx.ownerRead(),
    evidenceProjection: frozen.value, scope,
    ticker: scope === 'public-ticker' ? fx.PUBLIC_TICKER : null,
    publicTickers: [fx.PUBLIC_TICKER]
  });
  if (!compact.ok) throw new Error(`fixture must compact: ${JSON.stringify(compact.error)}`);
  const built = buildToolAuthorRequestV2(compact.value, fx.identity());
  if (!built.ok) throw new Error(`fixture must build a request: ${JSON.stringify(built.error)}`);
  const brief = fx.authoredBrief(built.request, {
    scope, ticker: scope === 'public-ticker' ? fx.PUBLIC_TICKER : null
  });
  const verdict = validateToolBriefV2(brief, { request: built.request });
  if (!verdict.ok) throw new Error(`fixture brief must validate: ${JSON.stringify(verdict.error)}`);
  return { brief, frozen: frozen.value, ownerReadSha256: fx.ownerRead().sha256 };
}

/* The Center brief input: an authored ToolBrief/v2 plus the leading rows, each carrying all six
   falsifiable fields the composer requires. */
function centerBriefInput(brief) {
  return {
    coverageComplete: true,
    legacyProvenance: 'legacy-market-brief-payload',
    authoredBrief: brief,
    actions: [{
      verb: 'verify', subject: 'MSFT fiscal-year guidance',
      horizon: '0-4w', trigger: 'the next print confirms the raised guide',
      invalidation: 'guidance is cut or the margin median breaks lower',
      freshness: 'current', citations: ['claim-guidance'],
      ownerLink: 'company-fundamentals-lab.html#MSFT'
    }],
    imminentCatalysts: [{
      subject: 'MSFT quarterly print', whenAt: '2026-07-29T20:00:00.000Z',
      horizon: '0-1w', trigger: 'the print lands inside this window',
      invalidation: 'the print is deferred past the horizon',
      freshness: 'current', citations: ['claim-margin'],
      ownerLink: 'company-fundamentals-lab.html#MSFT'
    }],
    visibleLimitations: [{ text: 'Only two independent origins corroborate the guidance claim.', blocking: true }],
    backdrop: 'Long-form backdrop for this window.',
    methodology: 'How the owner read and the evidence bundle were combined.',
    ownerDetail: 'Owner-model detail.',
    experiments: 'Experimental reads.'
  };
}

async function openCenter(page, hash = '') {
  await page.goto('about:blank');
  await page.goto(`${site.baseUrl}/${PAGE}${hash}`);
  await expect(page.locator('body')).toBeVisible();
  await page.waitForFunction(() => {
    const shell = document.getElementById('rlviews');
    return !!(shell && shell.getAttribute('data-rlexperience-shell') === 'ready' &&
      document.querySelector('[data-rlexperience-panel="portfolio"]') && window.__rlmac);
  }, undefined, { timeout: 15000 });
}

/* ═══════════════════ TP-11-05 — SCN-012-005 frozen inputs, powerless author ═══════════════════ */

test('Regression: SCN-012-005 current Brief uses exact frozen read and bundle with a powerless author', async ({ page }) => {
  await openCenter(page);

  // the page derived the Feature 002 gate state itself, from the real published gates document.
  const dependency = await page.evaluate(() => window.__rlmac.getDependency());
  expect(dependency).toEqual({ feature002: 'accepted' });

  const { brief, ownerReadSha256 } = authoredBriefFor({});
  const composed = await page.evaluate((input) => {
    const result = window.__rlmac.renderBrief(input);
    return { ok: !!(result && result.ok), gate: result && result.ok ? result.value.gates.authoredBriefV2 : null };
  }, centerBriefInput(brief));
  expect(composed.ok).toBe(true);

  // the gate is now SATISFIED, and it says so with the exact token — not by going quiet.
  expect(composed.gate).toBe('satisfied:feature-002');
  const banner = page.locator('#mac-center [data-mac-authored-brief]');
  await expect(banner).toHaveCount(1);
  await expect(banner).toHaveAttribute('data-mac-author-state', 'satisfied:feature-002');
  await expect(banner).toHaveAttribute('data-mac-authored-brief', 'tool-brief/v2');

  // the rendered Brief names the EXACT frozen owner read and evidence bundle it was authored from.
  await expect(banner).toHaveAttribute('data-mac-frozen-read', ownerReadSha256);
  await expect(banner).toHaveAttribute('data-mac-frozen-bundle', brief.evidenceBundleSha256);

  // the author capability ledger is recorded as empty in the projection the page actually composed.
  const capabilities = await page.evaluate(() => window.__rlmac.getProjection().views.brief.authored.authorCapabilities);
  expect(Object.values(capabilities).some(Boolean)).toBe(false);
  await expect(banner).toHaveAttribute('data-mac-author-capabilities', 'none');

  // adversarial: an authored Brief that cannot name its frozen inputs is refused, not degraded.
  const unattributed = await page.evaluate((input) => {
    const broken = JSON.parse(JSON.stringify(input));
    delete broken.authoredBrief.evidenceBundleSha256;
    const result = window.__rlmac.composeCenterProjection({
      projectionId: 'probe', generationRef: 'probe', cutoffAt: '2026-07-26T15:00:00.000Z',
      activeView: 'brief', dependency: { feature002: 'accepted' }, brief: broken,
      portfolio: { publicMatrixRef: 'probe' }, redAlert: { alertRefs: [] },
      journey: { definitionRefs: window.__rlmac.journeyIds.slice() }
    });
    return { ok: !!(result && result.ok), code: result && result.error ? result.error.code : null };
  }, centerBriefInput(brief));
  expect(unattributed.ok).toBe(false);
  expect(unattributed.code).toBe('RLMKT-GATE');
});

/* ═══════════════════ TP-11-06 — SCN-012-008 concise first, long detail closed ═══════════════════ */

test('Regression: SCN-012-008 qualified tool Brief leads with cited action and keeps long detail closed', async ({ page }) => {
  await openCenter(page);
  const { brief } = authoredBriefFor({});

  const rendered = await page.evaluate((b) => window.__rlmac.renderToolBriefV2(b), brief);
  expect(rendered).toBe(true);

  const host = page.locator('#mac-tool-brief');
  await expect(host).toBeVisible();

  // the action and every falsifier lead the first viewport.
  const action = host.locator('[data-rlbrief-v2-action]');
  await expect(action).toHaveCount(1);
  for (const field of ['trigger', 'invalidation', 'horizon', 'confidenceBasis']) {
    await expect(action.locator(`[data-mac-field="${field}"]`)).toHaveCount(1);
    await expect(action.locator(`[data-mac-field="${field}"]`)).not.toBeEmpty();
  }
  // claim-level citations, and an owner link to the tool that owns the math.
  await expect(action.locator('[data-mac-citation]')).toHaveCount(1);
  await expect(action.locator('[data-mac-citation="claim-guidance"]')).toHaveCount(1);
  await expect(action.locator('a.dl')).toHaveAttribute('href', 'company-fundamentals-lab.html#MSFT');

  // confidence is a BASIS, never a manufactured number.
  const actionText = await action.innerText();
  expect(/confidence"?\s*[:=]?\s*\d/i.test(actionText)).toBe(false);

  // every long-detail disclosure ships CLOSED in the markup — not closed by script after paint.
  const details = host.locator('details[data-rlbrief-v2-detail]');
  await expect(details).toHaveCount(4);
  const openStates = await details.evaluateAll((nodes) => nodes.map((n) => n.open));
  expect(openStates).toEqual([false, false, false, false]);

  // and the concise lead is ABOVE the first disclosure in document order.
  const conciseLeads = await page.evaluate(() => {
    const first = document.querySelector('#mac-tool-brief [data-rlbrief-v2-action]');
    const detail = document.querySelector('#mac-tool-brief details[data-rlbrief-v2-detail]');
    return !!(first && detail && (first.compareDocumentPosition(detail) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(conciseLeads).toBe(true);

  // a brief the validator would refuse never renders: the renderer draws, it does not adjudicate.
  const refusedRender = await page.evaluate(() => {
    window.__rlmac.renderToolBriefV2({ contractVersion: 'tool-brief/v1' });
    const host2 = document.getElementById('mac-tool-brief');
    return { hidden: host2.hidden, html: host2.innerHTML };
  });
  expect(refusedRender.hidden).toBe(true);
  expect(refusedRender.html).toBe('');
});

/* ═══════════════════ TP-11-07 — SCN-012-018 Center priority + visible falsifiers ═══════════════════ */

test('Regression: SCN-012-018 Center Brief prioritizes bounded actions and catalysts with visible falsifiers', async ({ page }) => {
  await openCenter(page);
  const { brief } = authoredBriefFor({});
  const composed = await page.evaluate((input) => {
    const result = window.__rlmac.renderBrief(input);
    return {
      ok: !!(result && result.ok),
      lead: result && result.ok ? result.value.views.brief.leadSections : null,
      closed: result && result.ok ? result.value.views.brief.closedSections : null
    };
  }, centerBriefInput(brief));
  expect(composed.ok).toBe(true);
  expect(composed.lead).toEqual(['actions', 'imminentCatalysts', 'visibleLimitations']);
  expect(composed.closed).toEqual(['backdrop', 'methodology', 'ownerDetail', 'experiments']);

  const center = page.locator('#mac-center');
  await expect(center.locator('[data-mac-action]')).toHaveCount(1);
  await expect(center.locator('[data-mac-catalyst]')).toHaveCount(1);

  // each leading row carries all six falsifiable fields, visibly.
  for (const selector of ['[data-mac-action]', '[data-mac-catalyst]']) {
    const row = center.locator(selector);
    for (const field of ['horizon', 'trigger', 'invalidation', 'freshness', 'citations']) {
      await expect(row.locator(`[data-mac-field="${field}"]`)).toHaveCount(1);
      await expect(row.locator(`[data-mac-field="${field}"]`)).not.toBeEmpty();
    }
    await expect(row.locator('a.dl')).toHaveCount(1);
  }

  // actions and catalysts precede every long-context disclosure in document order.
  const orderHolds = await page.evaluate(() => {
    const action = document.querySelector('#mac-center [data-mac-action]');
    const catalyst = document.querySelector('#mac-center [data-mac-catalyst]');
    const firstClosed = document.querySelector('#mac-center details[data-mac-closed-section]');
    if (!action || !catalyst || !firstClosed) return false;
    const before = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return before(action, catalyst) && before(catalyst, firstClosed);
  });
  expect(orderHolds).toBe(true);

  // backdrop, methodology, owner detail and experiments are closed by default.
  const closed = center.locator('details[data-mac-closed-section]');
  await expect(closed).toHaveCount(4);
  expect(await closed.evaluateAll((nodes) => nodes.map((n) => n.open))).toEqual([false, false, false, false]);

  // a BLOCKING limitation is visible copy, never tucked behind a disclosure.
  const limitation = center.locator('[data-mac-limitation]');
  await expect(limitation).toHaveCount(1);
  await expect(limitation).toHaveAttribute('data-mac-limitation-blocking', 'true');
  const limitationHidden = await page.evaluate(() =>
    !!document.querySelector('#mac-center details [data-mac-limitation]'));
  expect(limitationHidden).toBe(false);

  // adversarial: a leading row missing a falsifier is refused, not rendered short.
  const missingFalsifier = await page.evaluate((input) => {
    const broken = JSON.parse(JSON.stringify(input));
    delete broken.actions[0].invalidation;
    const result = window.__rlmac.composeCenterProjection({
      projectionId: 'probe', generationRef: 'probe', cutoffAt: '2026-07-26T15:00:00.000Z',
      activeView: 'brief', dependency: { feature002: 'accepted' }, brief: broken,
      portfolio: { publicMatrixRef: 'probe' }, redAlert: { alertRefs: [] },
      journey: { definitionRefs: window.__rlmac.journeyIds.slice() }
    });
    return { ok: !!(result && result.ok), code: result && result.error ? result.error.code : null };
  }, centerBriefInput(brief));
  expect(missingFalsifier.ok).toBe(false);
  expect(missingFalsifier.code).toBe('RLMKT-PROJECTION');
});

/* ═══════════════════ TP-11-08 — SCN-012-020 public ticker, zero private fields ═══════════════════ */

test('Regression: SCN-012-020 public watchlist ticker receives cited scheduled Brief with zero private fields', async ({ page }) => {
  // record every storage key the page reads or creates, so a public-ticker render can be proven
  // to touch NO private Feature-008 key. This is a passive recorder, not a stub.
  await page.addInitScript(() => {
    window.__storageAccessLog = { reads: [], writes: [] };
    for (const storeName of ['localStorage', 'sessionStorage']) {
      try {
        const store = window[storeName];
        const realGet = store.getItem.bind(store);
        const realSet = store.setItem.bind(store);
        Object.defineProperty(store, 'getItem', { configurable: true, value: (key) => { window.__storageAccessLog.reads.push(storeName + ':' + key); return realGet(key); } });
        Object.defineProperty(store, 'setItem', { configurable: true, value: (key, value) => { window.__storageAccessLog.writes.push(storeName + ':' + key); return realSet(key, value); } });
      } catch (error) { /* a store may be unavailable in a hardened context */ }
    }
  });
  await openCenter(page);

  const { brief } = authoredBriefFor({ scope: 'public-ticker' });
  expect(brief.scope).toBe('public-ticker');
  expect(brief.ticker).toBe(fx.PUBLIC_TICKER);

  // the ticker is one the COMMITTED public watchlist actually lists.
  const listed = await page.evaluate(async (ticker) => {
    const watchlist = await (await fetch('watchlist.json')).json();
    return watchlist.items.some((item) => item.ticker === ticker);
  }, fx.PUBLIC_TICKER);
  expect(listed).toBe(true);

  expect(await page.evaluate((b) => window.__rlmac.renderToolBriefV2(b), brief)).toBe(true);
  const host = page.locator('#mac-tool-brief');
  await expect(host.locator('[data-rlbrief-v2-scope="public-ticker"]')).toHaveCount(1);

  // the published Brief is CITED.
  await expect(host.locator('[data-mac-citation]').first()).toBeVisible();

  // no private field, in the DOM copy or in the object the page was handed.
  const copy = (await host.innerText()).toLowerCase();
  expect(PRIVATE_COPY_PATTERN.test(copy)).toBe(false);
  expect(PRIVATE_KEY_PATTERN.test(JSON.stringify(brief))).toBe(false);

  // and no private Feature-008 storage key was read or created while rendering it.
  const storage = await page.evaluate(() => window.__storageAccessLog);
  const privateTouched = [].concat(storage.reads, storage.writes).filter((key) => PRIVATE_KEY_PATTERN.test(key.split(':').slice(1).join(':')));
  expect(privateTouched).toEqual([]);
});
