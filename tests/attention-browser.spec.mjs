/*
 * tests/attention-browser.spec.mjs
 * ------------------------------------------------------------------------
 * Feature 017 Scope 03 — TP-03-01 … TP-03-05 live-stack, system-chrome
 * regressions for the Decision Attention tier inside the existing Brief view
 * (SCN-017-028 … SCN-017-032).
 *
 * REAL-STACK, ZERO REQUEST INTERCEPTION. Every test navigates to the REAL
 * market-brief.html route over a real static HTTP server and boots the REAL
 * production runtime against the REAL committed market-brief.payload.json /
 * watchlist.json / tools.json. There is NO page.route, NO context.route, NO
 * msw/nock, NO response stubbing and NO recorded-traffic replay anywhere in
 * this file. The "no network" proof in TP-03-01 is a PASSIVE observation: a
 * `page.on('request')` recorder that watches what the page actually asks for
 * and never answers anything.
 *
 * The fixture-driven tests (TP-03-04, TP-03-05) drive the REAL render path
 * through an in-page seam, exactly as the Journey and Market Action Center
 * specs drive `window.__rlmac.renderBrief` with a fixture context. They do not
 * touch the network.
 *
 * DOM contract asserted here (from specs/017-.../scopes/03-.../scope.md):
 *   #decisionAttention              the tier section, rendered ABOVE #attention
 *   #decisionAttention [data-attn-item]   one ranked attention item
 *   [data-attn-field]               a rendered field that must carry a tooltip
 *   #attentionRecord                the record block, rendered BELOW #scorecard
 *   window.__rlattn.render(context) the single re-render seam a fixture drives,
 *                                   mirroring the existing window.__rlmac.renderBrief seam
 *
 * The "research next step" sink is the `verb` field, which is what
 * RLATTN.toViewModel exposes for it.
 *
 * Deterministic by construction: every instant used by a fixture is an explicit
 * literal passed into the render context. No Math.random, no wall clock.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const PAGE = 'market-brief.html';

const PAYLOAD = JSON.parse(readFileSync(new URL('../market-brief.payload.json', import.meta.url), 'utf8'));
const ATTENTION_ITEMS = (PAYLOAD.attention || [])
  .filter((item) => item && item.contractVersion === 'decision-attention/v1');

/* The three closed severity words RLATTN publishes. A decision-attention item may
   RECORD its severity, but the reader-facing tier must never LABEL one — that
   vocabulary belongs to the Red Alert surface. */
const SEVERITY_WORDS = ['mild', 'moderate', 'severe'];

/* REAL alert-styling names read out of market-brief.html — not invented:
     .pill.warn   / .pill.bad     the alert pill styling (inline <style>)
     #freshbar.warn / #freshbar.bad
     data-mac-redalert*           the Red Alert surface block markers emitted by
                                  renderRedAlert() into [data-rlexperience-panel="red-alert"]
   Each name is PROVEN real inside the test before absence is asserted, so an
   assertion against a name that does not exist cannot pass as a tautology. */
const ALERT_STYLE_CLASSES = ['warn', 'bad'];
const RED_ALERT_ATTR_PREFIX = 'data-mac-redalert';

/* fixture instants — explicit, never derived from the system clock. */
const FIXTURE_NOW = '2026-08-06T18:00:00.000Z';
const STALE_GENERATED_AT = '2026-08-01T12:00:00.000Z';
const ELAPSED_EXPIRY = '2026-08-02T20:00:00.000Z';
const LIVE_EXPIRY = '2026-08-09T20:00:00.000Z';

/* An all-refused generation is valid and renders the declared empty state. Tests
   that exercise card rendering still need one contract-shaped input, so they use
   this deterministic seed only when the committed tier is honestly empty. */
const ATTENTION_FIXTURE_SEED = ATTENTION_ITEMS[0] || Object.freeze({
  rank: 1,
  domain: 'index breadth',
  horizon: 'swing',
  title: 'Breadth diverges from the index trend',
  structuralAnchor: 'The broad-market participation gate remains unresolved.',
  what: 'Participation weakened while the index held its structural trend.',
  why: 'A persistent divergence can change the next-session risk posture.',
  confidence: 55,
  deepLink: 'market-heatmap-lab.html',
  contractVersion: 'decision-attention/v1',
  id: 'attn-browser-fixture-seed',
  gateId: 'gate-browser-fixture-seed',
  subject: 'SPY',
  disposition: 'attention',
  severity: 'moderate',
  imminence: 'developing',
  headline: 'Breadth weakened while the index held its structural trend',
  rationale: 'The participation signal diverged from the index close.',
  verb: 'scenario-test',
  invalidation: 'Breadth recovers above the declared broad-market gate.',
  escalationTrigger: 'Breadth falls below the observed session low.',
  expiry: LIVE_EXPIRY,
  decisionWindow: 'morning',
  windowBoundaryUtc: '2026-08-06T15:00:00.000Z',
  windowTradingDate: '2026-08-06',
  windowResolvedFrom: 'session',
  transmissionPath: ['breadth-market-structure'],
  transmissionAbsenceNote: null,
  marketConfirmation: { state: 'present', detail: 'The breadth divergence is present in the observed session.' },
  marketConfirmationNote: null,
  figures: [{
    label: 'broad-market participation',
    value: 'below the declared gate',
    provenance: { sourceId: 'market-heatmap-lab', asOf: '2026-08-06T14:30:00.000Z' }
  }],
  observedAt: '2026-08-06T14:30:00.000Z',
  state: 'discovered',
  supersededBy: null,
  lifecycle: [{ to: 'discovered', at: '2026-08-06T14:30:00.000Z', condition: 'observed', ref: null }]
});

/* one distinct hostile payload per sink, so a single escaped sink cannot cover for another. */
const XSS = {
  headline: '<img id="rl-attn-xss-headline" src="x" onerror="globalThis.__rlAttnInjected=true">',
  rationale: '<img id="rl-attn-xss-rationale" src="x" onerror="globalThis.__rlAttnInjected=true">',
  escalationTrigger: '<img id="rl-attn-xss-escalation" src="x" onerror="globalThis.__rlAttnInjected=true">',
  invalidation: '<img id="rl-attn-xss-invalidation" src="x" onerror="globalThis.__rlAttnInjected=true">',
  verb: '<script data-rlattn-xss id="rl-attn-xss-nextstep">globalThis.__rlAttnInjected=true;</script>'
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

/* ── helpers ───────────────────────────────────────────────────────────── */

/* The Brief view is the default view; a full document load guarantees the real
   controller runs. #scorecard visible is the established boot signal used by the
   shipped brief specs. */
async function openBrief(page) {
  await page.goto('about:blank');
  await page.goto(`${site.baseUrl}/${PAGE}`);
  await expect(page.locator('#scorecard')).toBeVisible({ timeout: 30000 });
}

/* Precondition for SCN-017-028: no provider key and no proxy configured. This is
   page STATE setup (the same localStorage the landing page writes), not request
   interception — nothing is answered, routed or stubbed. */
async function clearProviderAccess(page) {
  await page.addInitScript(() => {
    try { window.localStorage.removeItem('rlProviderConfig'); } catch (error) { void error; }
    try { window.localStorage.removeItem('rlApiKeys'); } catch (error) { void error; }
  });
}

/* Build a decision-attention/v1 item from the first committed item so a fixture
   stays contract-shaped, then apply the overrides the scenario needs. */
function fixtureItem(overrides) {
  return Object.assign({}, ATTENTION_FIXTURE_SEED, overrides);
}

async function renderFixture(page, context) {
  const seam = await page.evaluate(() => typeof (window.__rlattn && window.__rlattn.render));
  expect(seam, 'window.__rlattn.render must exist as the fixture render seam for the decision attention tier')
    .toBe('function');
  await page.evaluate((ctx) => window.__rlattn.render(ctx), context);
}

async function ensureRenderedAttentionFixture(page) {
  if (ATTENTION_ITEMS.length > 0) return ATTENTION_ITEMS;
  const fixture = [fixtureItem({ id: 'attn-empty-generation-render-fixture', expiry: LIVE_EXPIRY })];
  await renderFixture(page, { nowUtc: FIXTURE_NOW, generatedAt: FIXTURE_NOW, attention: fixture });
  return fixture;
}

/* Every scenario in this file runs under the same console guard. Two of the
   tests already collected `pageerror` for their own assertions, which left the
   other scenarios uncovered and said nothing about warnings at all. Attaching
   it here means a console error or warning fails the scenario that produced it,
   by name, instead of scrolling past in the reporter.

   The guard is SCOPED TO ITS OWN SUBJECT, not softened. It previously ignored
   nothing, which made all ten scenarios hostage to conditions this suite neither
   causes nor controls, and it went red on a different scenario each run. Two
   measured classes are ignored now, each keyed on a failure CLASS the browser
   itself reports rather than on network-ish words appearing somewhere in a
   string:

     A. a BROWSER-EMITTED transport/CORS finding whose failing target is OFF our
        own test origin — a third-party provider the page merely attempts to
        reach. Observed: ~85 `blocked by CORS policy` + `net::ERR_FAILED` pairs
        for query1.finance.yahoo.com.

     B. a HOST-TRANSPORT event — net::ERR_NETWORK_CHANGED,
        ERR_INTERNET_DISCONNECTED, ERR_NETWORK_IO_SUSPENDED — at ANY origin.
        When the machine's networking changes state, Chrome aborts every socket
        that was already in flight, so a single flap reports against the
        provider fetch AND against our own loopback assets in the same breath.
        Measured during a reproduced failure: 42 entries, every one of them
        `Failed to load resource: net::ERR_NETWORK_CHANGED` attributed to
        http://127.0.0.1:PORT/{watchlist,tools,journeys}.json, /rlviews.js and
        /data/bars/*.json. Class A cannot reach those, which is why an
        origin-only rule left the flake in place.

   Chrome attributes both classes unambiguously, which is why the rule is
   structural rather than a text allow-list. The two entries a blocked provider
   fetch actually produces are:
     "Access to fetch at 'https://query1.finance.yahoo.com/...' from origin
      'http://127.0.0.1:PORT' has been blocked by CORS policy: ..."   location: the DOCUMENT
     "Failed to load resource: net::ERR_FAILED"                       location: the PROVIDER url
   while a same-origin script that fails carries our own script URL as its
   location, and an application-level console.error carries no URL at all.

   Five properties stop this from becoming a blind spot:
     1. `pageerror` — any uncaught page exception — is NEVER ignorable. A real
        product defect surfaces there and still fails the scenario by name.
     2. Under class A, a finding naming one of OUR OWN scripts (a same-origin
        *.js / *.mjs in the text or in the source location) is NEVER ignorable,
        whatever it says. Our code is served from site.baseUrl, so our own
        broken, missing or failing script is still fatal here.
     3. A finding with no browser transport/CORS signature is NEVER ignorable —
        an application-level console.error or console.warn still fails, and it
        carries no URL to qualify on in the first place.
     4. A Content-Security-Policy violation is NEVER ignorable. It is the page
        reaching somewhere its OWN policy forbids — a product defect — and its
        text embeds the whole connect-src allow-list, so it would otherwise
        qualify as "names an off-origin URL".
     5. Class B is a closed set of three OS-level codes, so every failure that
        can actually indict the local server keeps failing: a 404 or 500 arrives
        as "the server responded with a status of ...", a dead server arrives as
        ERR_CONNECTION_REFUSED, and neither matches. Nor can class B hide a
        broken page: losing a script or a payload breaks the DOM assertions that
        every scenario runs BEFORE this guard.
   The property "this page must not reach a provider at all" was never delegated
   to console text anyway: TP-03-01 proves it at the REQUEST layer with a
   passive page.on('request') recorder, under the same no-provider-access page
   state the other nine scenarios run in. Ignoring the console ECHO of a blocked
   third-party request removes noise, not coverage. */

/* Browser transport + CORS signatures. Every one is emitted BY THE BROWSER about
   a resource it could not reach — none of them is producible by application
   code calling console.error. */
const TRANSPORT_FINDING =
  /(net::ERR_[A-Z_]+|Failed to load resource|Failed to fetch|NetworkError when attempting to fetch|blocked by CORS policy|Access-Control-Allow-Origin|Cross-Origin Request Blocked)/;

/* HOST-TRANSPORT class. Chrome raises these three from NetworkChangeNotifier when
   the MACHINE's networking changes state, and it then aborts every socket that was
   already in flight — loopback included, which is why this class lands on our own
   origin too. None of them is an HTTP status, a script error, or anything a page or
   a server can elect to emit, so unlike a 404, a refused connection or a parse
   error, this class carries no information about the software under test. */
const HOST_TRANSPORT_EVENT = /net::ERR_(NETWORK_CHANGED|INTERNET_DISCONNECTED|NETWORK_IO_SUSPENDED)\b/;

/* a page-caused class that must stay fatal even though its text names off-origin URLs. */
const POLICY_VIOLATION = /Content Security Policy/i;

const URL_IN_TEXT = /https?:\/\/[^\s'"()]+/g;
const SCRIPT_URL = /\.m?js(\?|#|$)/;

function findingUrls(message) {
  const located = message.location().url || '';
  const inText = message.text().match(URL_IN_TEXT) || [];
  return located ? [located].concat(inText) : inText;
}

function isUpstreamNetworkFinding(message) {
  const base = site && site.baseUrl;
  /* fail closed: with no known origin nothing can be classified, so nothing is ignored. */
  if (!base) return false;

  const text = message.text();
  if (POLICY_VIOLATION.test(text)) return false;

  /* class B — a host-transport event. Deliberately ORIGIN-INDEPENDENT, because the
     abort is indiscriminate: one flap cancels the provider fetch and the loopback
     fetch alike, so keying this class on origin would leave most of the noise
     behind. It still cannot mask a broken page — a run that genuinely lost a script
     or a payload fails the scenario's own DOM assertions, which all run before this
     guard, and any uncaught exception that followed arrives as a `pageerror`, which
     is never ignorable. */
  if (HOST_TRANSPORT_EVENT.test(text)) return true;

  if (!TRANSPORT_FINDING.test(text)) return false;

  /* class A — a transport/CORS finding whose failing target is OFF our own origin. */
  const urls = findingUrls(message);
  const ours = (url) => url.startsWith(base);
  if (urls.some((url) => ours(url) && SCRIPT_URL.test(url))) return false;

  return urls.some((url) => !ours(url));
}

const consoleFindings = [];
const ignoredFindings = [];

test.beforeEach(async ({ page }) => {
  consoleFindings.length = 0;
  ignoredFindings.length = 0;
  page.on('console', (message) => {
    const type = message.type();
    if (type !== 'error' && type !== 'warning') return;
    const entry = `${type}: ${message.text()}`;
    if (isUpstreamNetworkFinding(message)) ignoredFindings.push(entry);
    else consoleFindings.push(entry);
  });
  /* an uncaught page exception is the page's own failure and is never ignorable. */
  page.on('pageerror', (error) => consoleFindings.push(`pageerror: ${error.message}`));
});

test.afterEach(() => {
  expect(consoleFindings,
    'the browser run must emit no console error and no console warning that THIS PAGE causes. '
    + `Emitted: ${JSON.stringify(consoleFindings)}. `
    + `(${ignoredFindings.length} upstream-network finding(s) were ignored as third-party `
    + `reachability or host-transport events, not page defects: ${JSON.stringify(ignoredFindings)})`)
    .toEqual([]);
});

/* ═══════════════ TP-03-01 — SCN-017-028 tier + record from committed data ═══════════════ */

test('decision attention tier renders items and record from committed data', async ({ page }) => {
  test.setTimeout(90_000);

  await clearProviderAccess(page);

  // PASSIVE observation only — record what the page asks for, answer nothing.
  const requested = [];
  page.on('request', (request) => requested.push(request.url()));

  await openBrief(page);

  // the tier renders EXACTLY the committed items, not merely a container.
  const tier = page.locator('#decisionAttention');
  await expect(tier).toBeVisible();
  await expect(tier.locator('[data-attn-item]')).toHaveCount(ATTENTION_ITEMS.length);

  // specific committed headline text is on screen — a container with N empty cards cannot pass.
  for (const item of ATTENTION_ITEMS) {
    await expect(tier).toContainText(item.headline);
  }
  if (ATTENTION_ITEMS.length === 0) {
    expect(PAYLOAD.attentionExclusions, 'an empty committed tier must account for refused candidates')
      .toBeInstanceOf(Array);
    expect(PAYLOAD.attentionExclusions.length, 'an empty tier with no exclusions is a silent drop')
      .toBeGreaterThan(0);
    await expect(tier.locator('[data-attn-field="empty-state"]')).toBeVisible();
  }

  // the tier sits ABOVE the existing #attention feed, inside the Brief view.
  const tierIsAboveLegacyFeed = await page.evaluate(() => {
    const tierEl = document.getElementById('decisionAttention');
    const legacy = document.getElementById('attention');
    if (!tierEl || !legacy) return null;
    return (tierEl.compareDocumentPosition(legacy) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  expect(tierIsAboveLegacyFeed, '#decisionAttention must render above #attention').toBe(true);

  // the record block renders a real summary sentence BELOW #scorecard — not an empty placeholder.
  const record = page.locator('#attentionRecord');
  await expect(record).toBeVisible();
  const recordSummary = (await record.innerText()).trim();
  expect(recordSummary.length, `#attentionRecord must render a summary, got ${JSON.stringify(recordSummary)}`)
    .toBeGreaterThan(20);
  const recordIsBelowScorecard = await page.evaluate(() => {
    const scorecard = document.getElementById('scorecard');
    const recordEl = document.getElementById('attentionRecord');
    if (!scorecard || !recordEl) return null;
    return (scorecard.compareDocumentPosition(recordEl) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  expect(recordIsBelowScorecard, '#attentionRecord must render below #scorecard').toBe(true);

  // ADVERSARIAL: neither surface may reach a provider or a proxy. Observed, never stubbed.
  const offOrigin = requested.filter((url) => !url.startsWith(site.baseUrl));
  expect(offOrigin, `no off-origin request may be issued, saw: ${offOrigin.join(' | ')}`).toEqual([]);
  const providerBound = requested.filter((url) =>
    /(finance\.yahoo|query[12]\.finance|stooq|alphavantage|polygon\.io|finnhub|financialmodelingprep|fmpcloud|tiingo|twelvedata|marketstack|corsproxy|allorigins|\/proxy\/)/i.test(url));
  expect(providerBound, `no provider or proxy request may be issued, saw: ${providerBound.join(' | ')}`).toEqual([]);
});

/* ═══════════════ TP-03-02 — SCN-017-029 no alert severity label, no alert styling ═══════════════ */

test('decision attention items carry no alert severity label or alert styling', async ({ page }) => {
  test.setTimeout(90_000);

  await openBrief(page);

  const renderedItems = await ensureRenderedAttentionFixture(page);
  const items = page.locator('#decisionAttention [data-attn-item]');
  await expect(items).toHaveCount(renderedItems.length);

  // PROVE the names are REAL before asserting their absence, so this cannot be a tautology:
  // the alert pill styling must exist as a rule in the page's own stylesheet…
  const realAlertRules = await page.evaluate(() => {
    const found = [];
    for (const sheet of Array.from(document.styleSheets)) {
      let rules = [];
      try { rules = Array.from(sheet.cssRules || []); } catch (error) { void error; }
      for (const rule of rules) {
        const selector = rule && rule.selectorText;
        if (typeof selector === 'string' && /\.pill\.(warn|bad)|#freshbar\.(warn|bad)/.test(selector)) found.push(selector);
      }
    }
    return found;
  });
  expect(realAlertRules.length, 'the .pill.warn / .pill.bad alert styling must exist on the real page')
    .toBeGreaterThan(0);

  // …and the Red Alert surface must really emit data-mac-redalert markers.
  await page.locator('#rlviews button[data-rlview-mode="red-alert"]').click();
  await expect(page.locator('[data-rlexperience-panel="red-alert"] [data-mac-redalert]')).not.toHaveCount(0);
  await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
  await expect(items).toHaveCount(renderedItems.length);

  // POSITIVE absence: inspect every rendered node of every item.
  const audit = await page.evaluate(({ severityWords, alertClasses, redAlertPrefix }) => {
    const offences = { severityLabels: [], severityAttributes: [], alertClassed: [], redAlertMarked: [] };
    let inspected = 0;
    for (const item of Array.from(document.querySelectorAll('#decisionAttention [data-attn-item]'))) {
      for (const node of [item, ...Array.from(item.querySelectorAll('*'))]) {
        inspected += 1;
        for (const cls of alertClasses) {
          if (node.classList && node.classList.contains(cls)) offences.alertClassed.push(cls + ' on ' + node.tagName);
        }
        for (const attr of Array.from(node.attributes || [])) {
          if (attr.name.startsWith(redAlertPrefix)) offences.redAlertMarked.push(attr.name);
          if (/severity/i.test(attr.name)) offences.severityAttributes.push(attr.name + '=' + attr.value);
        }
        const own = (node.textContent || '').trim().toLowerCase();
        if (node.children.length === 0 && severityWords.indexOf(own) !== -1) offences.severityLabels.push(own);
      }
    }
    return { offences, inspected };
  }, { severityWords: SEVERITY_WORDS, alertClasses: ALERT_STYLE_CLASSES, redAlertPrefix: RED_ALERT_ATTR_PREFIX });

  expect(audit.inspected, 'the audit must have inspected real rendered nodes').toBeGreaterThan(0);
  expect(audit.offences.severityLabels, 'no attention item may render a severity word as a label').toEqual([]);
  expect(audit.offences.severityAttributes, 'no attention item may declare a severity attribute').toEqual([]);
  expect(audit.offences.alertClassed, 'no attention item may use the .warn / .bad alert styling').toEqual([]);
  expect(audit.offences.redAlertMarked, 'no attention item may carry a data-mac-redalert marker').toEqual([]);
});

/* ═══════════════ TP-03-03 — SCN-017-030 contextual tooltip on every field and control ═══════════════ */

test('every decision attention field and control exposes a contextual tooltip', async ({ page }) => {
  test.setTimeout(90_000);

  await openBrief(page);

  const renderedItems = await ensureRenderedAttentionFixture(page);
  const items = page.locator('#decisionAttention [data-attn-item]');
  await expect(items).toHaveCount(renderedItems.length);

  // the matrix requires an expandable item; expand the first one so the expanded
  // fields (escalation trigger, invalidation, expiry, provenance) are also audited.
  const disclosure = items.first().locator('summary');
  await expect(disclosure).not.toHaveCount(0);
  await disclosure.first().click();

  const audit = await page.evaluate(() => {
    const checked = [];
    const missing = [];
    const echoed = [];
    const shallow = [];
    const targets = Array.from(document.querySelectorAll(
      '#decisionAttention [data-attn-field], #decisionAttention button, #decisionAttention summary, #decisionAttention a[href], #decisionAttention [role="button"]'));
    for (const node of targets) {
      const tip = ((node.getAttribute('title') || node.getAttribute('data-tip')) || '').trim();
      const label = (node.textContent || '').trim();
      const id = node.tagName + '[' + (node.getAttribute('data-attn-field') || node.className || '') + ']';
      checked.push(id);
      if (tip.length === 0) { missing.push(id); continue; }
      if (tip.toLowerCase() === label.toLowerCase()) { echoed.push(id + ' -> ' + tip); continue; }
      // a contextual reading is a sentence about the CURRENT value, not a repeated label.
      if (tip.length < 25 || tip.indexOf(' ') === -1) shallow.push(id + ' -> ' + tip);
    }
    return { checked, missing, echoed, shallow };
  });

  // a vacuously empty tier cannot pass.
  expect(audit.checked.length, 'the tier must expose fields and controls to audit').toBeGreaterThan(0);
  expect(audit.missing, 'every field and control must expose a tooltip').toEqual([]);
  expect(audit.echoed, 'a tooltip must not merely repeat its own label').toEqual([]);
  expect(audit.shallow, 'every tooltip must state what the current reading means').toEqual([]);
});

/* ═══════════════ TP-03-04 — SCN-017-031 authored markup renders escaped at every sink ═══════════════ */

test('authored decision attention text with markup renders escaped', async ({ page }) => {
  test.setTimeout(90_000);

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await openBrief(page);

  await renderFixture(page, {
    nowUtc: FIXTURE_NOW,
    generatedAt: FIXTURE_NOW,
    attention: [fixtureItem({
      id: 'attn-xss-fixture',
      headline: `Headline ${XSS.headline}`,
      rationale: `Rationale ${XSS.rationale}`,
      escalationTrigger: `Escalation ${XSS.escalationTrigger}`,
      invalidation: `Invalidation ${XSS.invalidation}`,
      verb: `Next step ${XSS.verb}`,
      expiry: LIVE_EXPIRY
    })]
  });

  const tier = page.locator('#decisionAttention');
  const item = tier.locator('[data-attn-item]');
  await expect(item).toHaveCount(1);

  // expand so the expanded sinks render too.
  const disclosure = item.locator('summary');
  await expect(disclosure).not.toHaveCount(0);
  await disclosure.first().click();

  // every sink shows the markup as VISIBLE TEXT.
  await expect(tier).toContainText(`Headline ${XSS.headline}`);
  await expect(tier).toContainText(`Rationale ${XSS.rationale}`);
  await expect(tier).toContainText(`Escalation ${XSS.escalationTrigger}`);
  await expect(tier).toContainText(`Invalidation ${XSS.invalidation}`);
  await expect(tier).toContainText(`Next step ${XSS.verb}`);

  // ADVERSARIAL: text assertions alone can pass even if a node was ALSO created.
  for (const sentinel of ['rl-attn-xss-headline', 'rl-attn-xss-rationale', 'rl-attn-xss-escalation',
    'rl-attn-xss-invalidation', 'rl-attn-xss-nextstep']) {
    await expect(page.locator(`#${sentinel}`), `${sentinel} must never be created as a node`).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.querySelector('script[data-rlattn-xss]') !== null)).toBe(false);
  expect(await page.evaluate(() => globalThis.__rlAttnInjected === true)).toBe(false);
  expect(pageErrors, `browser errors during escaped render: ${pageErrors.join(' | ')}`).toEqual([]);
});

/* ═══════════════ TP-03-05 — SCN-017-032 elapsed renders expired, stale generation declared ═══════════════ */

test('elapsed decision attention items render expired and a stale generation is declared', async ({ page }) => {
  test.setTimeout(90_000);

  await openBrief(page);

  /* Neither headline may contain the token the assertions below test for: the headline
     renders as visible item text, so a headline carrying "expired" makes the positive
     assertion tautological and the negative assertion unfalsifiable. */
  const elapsedHeadline = 'Elapsed fixture item that must stay visible past its deadline';
  const liveHeadline = 'Live fixture item that must remain current';

  await renderFixture(page, {
    nowUtc: FIXTURE_NOW,
    generatedAt: STALE_GENERATED_AT,
    attention: [
      fixtureItem({ id: 'attn-elapsed-fixture', headline: elapsedHeadline, expiry: ELAPSED_EXPIRY }),
      fixtureItem({ id: 'attn-live-fixture', headline: liveHeadline, expiry: LIVE_EXPIRY })
    ]
  });

  const tier = page.locator('#decisionAttention');

  // the elapsed item is LABELLED expired, not removed — both items are still present.
  await expect(tier.locator('[data-attn-item]')).toHaveCount(2);
  const elapsedItem = tier.locator('[data-attn-item]', { hasText: elapsedHeadline });
  await expect(elapsedItem).toHaveCount(1);
  await expect(elapsedItem).toContainText(/expired/i);

  // ADVERSARIAL: a renderer that stamps everything expired is equally wrong.
  const liveItem = tier.locator('[data-attn-item]', { hasText: liveHeadline });
  await expect(liveItem).toHaveCount(1);
  await expect(liveItem).not.toContainText(/expired/i);

  // the stale generation is declared in plain reader language, naming the stale generation.
  await expect(tier).toContainText(/stale/i);
  const declaration = (await tier.innerText()).replace(/\s+/g, ' ');
  expect(/stale/i.test(declaration) && /generation|generated|as of/i.test(declaration),
    `the stale generation must be declared in plain language, got: ${declaration.slice(0, 400)}`).toBe(true);
});

/* ═══════════════ TP-05-04 — SCN-017-043 all six performance budgets ═══════════════
 *
 * Six budgets, six independent assertions, each naming itself on failure. One
 * blown budget must not be able to hide inside an aggregate.
 *
 * MEASUREMENT METHOD
 *   Every timing is taken INSIDE the page with performance.now(), so the
 *   Playwright/CDP round trip is excluded and what is measured is what the
 *   reader's browser actually pays. Each compute/render budget is the MEDIAN of
 *   repeated runs — the stable statistic on a shared machine — and the max is
 *   reported in the failure message so a pathological outlier is still visible.
 *
 * CEILINGS
 *   Measured first on this machine, then set with headroom. They are loose
 *   enough not to flake and tight enough that a real regression trips them: each
 *   is roughly an order of magnitude above the observed median, not a number so
 *   large it can never fail. A red budget is fixed by fixing the code, never by
 *   widening the ceiling (design NFR-003, P22/D7, D18).
 *
 * NO INTERCEPTION
 *   The network claim is a PASSIVE observation. `page.on('request')` records
 *   what the page asks for and answers nothing. There is no page.route, no
 *   context.route, no msw/nock, no stubbing and no replay anywhere in this test.
 */

/* Ceilings were MEASURED on this machine first, then set with deliberate,
   stated headroom. Observed medians when they were set:

     budget                       observed median   ceiling   headroom
     1 module initialisation      33.20 ms          200 ms      ~6x
     1 module first-load bytes    41 732 B          47 104 B    ~13%
     2 candidate validation, 50    0.400 ms           8 ms      ~20x
     3 ranking, 200                0.300 ms           8 ms      ~27x
     4 tier render, 7 cards        0.800 ms           6 ms       ~8x
     5 record render               0.100 ms           4 ms      ~40x

   The 8 ms and 6 ms figures are the design's own published budgets
   (design.md "Build + validate + rank + select, cap 7 <= 8 ms" and
   "Tier render, 7 items <= 6 ms"), so they are honoured rather than invented.
   The byte ceiling is the published 46 KB first-load budget and is the
   TIGHTEST of the six: rlattention.js already spends 88% of it, so a module
   that grew by a tenth fails here.

   The record ceiling carries the largest multiple because Chrome clamps
   performance.now() to roughly 0.1 ms; a tighter number would measure timer
   resolution rather than the renderer. Even so, a 40x regression trips it.

   A red budget is fixed by fixing the code, never by widening the ceiling
   (design NFR-003, P22/D7, D18). */
const BUDGETS = Object.freeze({
  moduleInitMs: 200,
  validateFiftyMs: 8,
  rankTwoHundredMs: 8,
  tierRenderSevenMs: 6,
  recordRenderMs: 4,
  moduleBytes: 46 * 1024
});

const VALIDATION_SET_SIZE = 50;
const RANKING_SET_SIZE = 200;
const TIER_CARD_CEILING = 7;

/* Build N contract-shaped items from the committed payload, each with a distinct
   id and headline so ranking and selection do the real work of ordering and
   de-duplicating rather than collapsing a set of clones. */
function fixtureSet(size) {
  const seed = ATTENTION_FIXTURE_SEED;
  const items = [];
  for (let index = 0; index < size; index += 1) {
    items.push(Object.assign({}, seed, {
      id: `attn-budget-${String(index).padStart(4, '0')}`,
      rank: (index % TIER_CARD_CEILING) + 1,
      confidence: 40 + (index % 55),
      headline: `Budget fixture item ${index} carrying a distinct headline for ranking`
    }));
  }
  return items;
}

test('decision attention rendering holds all six performance budgets', async ({ page }) => {
  test.setTimeout(180_000);

  /* ── PASSIVE request recorder, armed BEFORE navigation ─────────────────── */
  const requests = [];
  page.on('request', (request) => { requests.push({ url: request.url(), at: Date.now() }); });

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await clearProviderAccess(page);
  await openBrief(page);

  /* the tier and the record must both be on the page before anything is
     measured — a budget met by rendering nothing is not a budget met. */
  await expect(page.locator('#decisionAttention')).toHaveCount(1);
  await expect(page.locator('#attentionRecord')).toHaveCount(1);

  /* ── BUDGET 1 — module initialisation ──────────────────────────────────
     The real resource-timing entry the browser recorded for rlattention.js:
     how long the added module took to arrive and become available, plus the
     bytes it added to first load. */
  const moduleTiming = await page.evaluate(() => {
    const entry = performance.getEntriesByType('resource')
      .find((candidate) => candidate.name.endsWith('/rlattention.js'));
    if (!entry) return null;
    return {
      durationMs: entry.duration,
      bytes: entry.decodedBodySize || entry.encodedBodySize || entry.transferSize || 0,
      moduleReady: typeof window.RLATTN === 'object' && typeof window.RLATTN.selectAttentionItems === 'function'
    };
  });

  expect(moduleTiming, 'rlattention.js must appear in the page resource timeline — otherwise no initialisation happened')
    .not.toBeNull();
  expect(moduleTiming.moduleReady, 'RLATTN must be initialised and callable on the page before budgets are measured')
    .toBe(true);
  expect(moduleTiming.durationMs,
    `BUDGET 1 module initialisation: rlattention.js took ${moduleTiming.durationMs.toFixed(2)} ms to load and expose `
    + `RLATTN, over the ${BUDGETS.moduleInitMs} ms ceiling`)
    .toBeLessThanOrEqual(BUDGETS.moduleInitMs);
  expect(moduleTiming.bytes,
    `BUDGET 1 module initialisation: rlattention.js added ${moduleTiming.bytes} bytes to first load, `
    + `over the ${BUDGETS.moduleBytes} byte ceiling`)
    .toBeLessThanOrEqual(BUDGETS.moduleBytes);
  expect(moduleTiming.bytes,
    'the resource entry must report a real body size — a zero would make the byte budget unfalsifiable')
    .toBeGreaterThan(0);

  /* ── BUDGET 2 and 3 — candidate validation and ranking ─────────────────
     Both run against the REAL module already loaded on the page, over sets
     built from the committed payload. Medians over repeated runs. */
  const compute = await page.evaluate(({ validationSize, rankingSize, seedItem, cardCeiling }) => {
    const build = (size) => {
      const items = [];
      for (let index = 0; index < size; index += 1) {
        items.push(Object.assign({}, seedItem, {
          id: `attn-budget-${String(index).padStart(4, '0')}`,
          rank: (index % cardCeiling) + 1,
          confidence: 40 + (index % 55),
          headline: `Budget fixture item ${index} carrying a distinct headline for ranking`
        }));
      }
      return items;
    };
    const median = (samples) => samples.slice().sort((a, b) => a - b)[Math.floor(samples.length / 2)];

    const validationSet = build(validationSize);
    const rankingSet = build(rankingSize);

    /* one untimed warm-up pass each, so the recorded numbers describe steady
       state rather than first-call compilation. */
    validationSet.forEach((item) => window.RLATTN.validateAttentionItem(item, {}));
    window.RLATTN.rankAttentionItems(rankingSet);

    const validationSamples = [];
    for (let run = 0; run < 9; run += 1) {
      const start = performance.now();
      let verdicts = 0;
      for (const item of validationSet) {
        if (window.RLATTN.validateAttentionItem(item, {})) verdicts += 1;
      }
      validationSamples.push(performance.now() - start);
      if (verdicts !== validationSet.length) return { error: 'validation did not return a verdict per candidate' };
    }

    const rankingSamples = [];
    let rankedLength = 0;
    for (let run = 0; run < 9; run += 1) {
      const start = performance.now();
      const ranked = window.RLATTN.rankAttentionItems(rankingSet);
      rankingSamples.push(performance.now() - start);
      rankedLength = Array.isArray(ranked) ? ranked.length : (ranked && ranked.ranked ? ranked.ranked.length : -1);
    }

    return {
      error: null,
      validationMedianMs: median(validationSamples),
      validationMaxMs: Math.max(...validationSamples),
      validatedCount: validationSet.length,
      rankingMedianMs: median(rankingSamples),
      rankingMaxMs: Math.max(...rankingSamples),
      rankedCount: rankedLength
    };
  }, {
    validationSize: VALIDATION_SET_SIZE,
    rankingSize: RANKING_SET_SIZE,
    seedItem: ATTENTION_FIXTURE_SEED,
    cardCeiling: TIER_CARD_CEILING
  });

  expect(compute.error, `the compute budget harness must run cleanly: ${compute.error}`).toBeNull();

  /* non-vacuity: the sets really were the declared sizes and really were
     processed. A budget met over an empty set measures nothing. */
  expect(compute.validatedCount, 'the validation budget must run over a fifty-candidate set')
    .toBe(VALIDATION_SET_SIZE);
  expect(compute.rankedCount, 'the ranking budget must rank the full two-hundred-item set')
    .toBe(RANKING_SET_SIZE);

  expect(compute.validationMedianMs,
    `BUDGET 2 candidate validation: ${VALIDATION_SET_SIZE} candidates took a median of `
    + `${compute.validationMedianMs.toFixed(2)} ms (max ${compute.validationMaxMs.toFixed(2)} ms), `
    + `over the ${BUDGETS.validateFiftyMs} ms ceiling`)
    .toBeLessThanOrEqual(BUDGETS.validateFiftyMs);

  expect(compute.rankingMedianMs,
    `BUDGET 3 ranking: ${RANKING_SET_SIZE} items took a median of ${compute.rankingMedianMs.toFixed(2)} ms `
    + `(max ${compute.rankingMaxMs.toFixed(2)} ms), over the ${BUDGETS.rankTwoHundredMs} ms ceiling`)
    .toBeLessThanOrEqual(BUDGETS.rankTwoHundredMs);

  /* ── BUDGET 4 and 5 — tier render at the ceiling, and record render ─────
     Driven through the REAL window.__rlattn.render seam. Budget 4 renders a
     full seven-card tier; budget 5 renders a pass whose only populated block
     is the attention record, which isolates the record's own cost. */
  const seam = await page.evaluate(() => typeof (window.__rlattn && window.__rlattn.render));
  expect(seam, 'window.__rlattn.render must exist as the render seam the budgets are measured through').toBe('function');

  const render = await page.evaluate(({ sevenItems, nowUtc }) => {
    const median = (samples) => samples.slice().sort((a, b) => a - b)[Math.floor(samples.length / 2)];
    const tierHost = document.getElementById('decisionAttention');
    const recordHost = document.getElementById('attentionRecord');

    const tierContext = { nowUtc, generatedAt: nowUtc, attention: sevenItems };
    const recordOnlyContext = { nowUtc, generatedAt: nowUtc, attention: [] };

    window.__rlattn.render(tierContext);
    const renderedCards = tierHost.querySelectorAll('[data-attn-item]').length;

    const tierSamples = [];
    for (let run = 0; run < 5; run += 1) {
      const start = performance.now();
      window.__rlattn.render(tierContext);
      tierSamples.push(performance.now() - start);
    }
    const tierMarkupLength = tierHost.innerHTML.length;

    window.__rlattn.render(recordOnlyContext);
    const recordSamples = [];
    for (let run = 0; run < 5; run += 1) {
      const start = performance.now();
      window.__rlattn.render(recordOnlyContext);
      recordSamples.push(performance.now() - start);
    }
    const recordMarkupLength = recordHost.innerHTML.length;

    return {
      renderedCards,
      tierMedianMs: median(tierSamples),
      tierMaxMs: Math.max(...tierSamples),
      tierMarkupLength,
      recordMedianMs: median(recordSamples),
      recordMaxMs: Math.max(...recordSamples),
      recordMarkupLength
    };
  }, { sevenItems: fixtureSet(TIER_CARD_CEILING), nowUtc: FIXTURE_NOW });

  /* non-vacuity: the measured renders genuinely produced a full tier and a
     populated record. A render that painted nothing would be fast and wrong. */
  expect(render.renderedCards, `the tier render budget must be measured at the ${TIER_CARD_CEILING}-card ceiling`)
    .toBe(TIER_CARD_CEILING);
  expect(render.tierMarkupLength, 'the measured tier render must have produced markup').toBeGreaterThan(0);
  expect(render.recordMarkupLength, 'the measured record render must have produced markup').toBeGreaterThan(0);

  expect(render.tierMedianMs,
    `BUDGET 4 tier render: ${TIER_CARD_CEILING} cards took a median of ${render.tierMedianMs.toFixed(2)} ms `
    + `(max ${render.tierMaxMs.toFixed(2)} ms), over the ${BUDGETS.tierRenderSevenMs} ms ceiling`)
    .toBeLessThanOrEqual(BUDGETS.tierRenderSevenMs);

  expect(render.recordMedianMs,
    `BUDGET 5 record render: took a median of ${render.recordMedianMs.toFixed(2)} ms `
    + `(max ${render.recordMaxMs.toFixed(2)} ms), over the ${BUDGETS.recordRenderMs} ms ceiling`)
    .toBeLessThanOrEqual(BUDGETS.recordRenderMs);

  /* ── BUDGET 6 — no additional network request, no additional blocking script ──
     Quiescence first: the page's own live layer settles, then the boundary is
     drawn and every request after it is attributable to the renders above. */
  let quiet = false;
  let settledCount = requests.length;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const before = requests.length;
    await page.waitForTimeout(750);
    if (requests.length === before) { quiet = true; settledCount = requests.length; break; }
  }
  expect(quiet,
    `the page must reach network quiescence before the added-request boundary is drawn; still saw traffic after `
    + `${requests.length} requests`)
    .toBe(true);

  /* non-vacuity: the recorder is genuinely observing. A recorder that saw
     nothing at all would report "no additional requests" for the wrong reason. */
  expect(settledCount,
    'the passive request recorder must have observed the page load — otherwise a zero delta proves nothing')
    .toBeGreaterThan(0);

  const boundary = requests.length;
  await page.evaluate(({ sevenItems, nowUtc }) => {
    window.__rlattn.render({ nowUtc, generatedAt: nowUtc, attention: sevenItems });
  }, { sevenItems: fixtureSet(TIER_CARD_CEILING), nowUtc: FIXTURE_NOW });
  await page.waitForTimeout(1500);

  const added = requests.slice(boundary).map((entry) => entry.url);
  expect(added,
    `BUDGET 6 network: rendering the decision attention tier and record must add no network request, saw: `
    + `${added.join(', ')}`)
    .toEqual([]);

  const blockingScripts = await page.evaluate(() => Array.from(document.querySelectorAll('script[src]'))
    .filter((node) => !node.defer && !node.async)
    .map((node) => node.getAttribute('src')));
  const deferredScripts = await page.evaluate(() => Array.from(document.querySelectorAll('script[src]'))
    .filter((node) => node.defer || node.async)
    .map((node) => node.getAttribute('src')));

  /* non-vacuity: the scan sees the page's real script tags, including the new
     module. A selector that matched nothing would report zero blocking scripts. */
  expect(deferredScripts.length, 'the script scan must see the page scripts it is asserting about')
    .toBeGreaterThan(0);
  expect(deferredScripts.some((src) => src && src.includes('rlattention.js')),
    `rlattention.js must be present and deferred; scripts seen: ${deferredScripts.join(', ')}`)
    .toBe(true);
  expect(blockingScripts,
    `BUDGET 6 blocking script: the decision attention tier must add no render-blocking script, found: `
    + `${blockingScripts.join(', ')}`)
    .toEqual([]);

  expect(pageErrors, `browser errors during the budget run: ${pageErrors.join(' | ')}`).toEqual([]);
});

/* ═══════════════ TP-06-05 — SCN-017-051 declared empty state for an all-excluded generation ═══════════════
 *
 * Feature 017 Scope 06. F-017-06 routes the authoring lane through
 * scripts/build-attention-items.mjs, which calls the certified composer once
 * per candidate and EXCLUDES every candidate it refuses. A generation in which
 * every candidate is refused therefore publishes an empty attention set — and
 * the tier owes the reader its declared empty state rather than a placeholder
 * card, a fabricated item, or a blank space that reads as "nothing was checked".
 *
 * WHY THE EMPTY SET IS NOT HAND-WRITTEN. Passing `attention: []` straight into
 * the render seam would prove only that an empty array renders an empty state.
 * The empty set here is the OBSERVED OUTPUT of the real build step refusing
 * three real candidates, so this scenario fails both against a build step that
 * publishes a refused candidate and against a tier that renders nothing at all.
 *
 * REAL-STACK, ZERO REQUEST INTERCEPTION, consistent with the rest of this file:
 * the page is the real market-brief.html over the real static server and the
 * re-render goes through the same window.__rlattn.render seam TP-03-04 and
 * TP-03-05 already drive. No page.route, no context.route, no msw/nock.
 */

test('SCN-017-051 The tier renders its declared empty state for an all-excluded generation', async ({ page }) => {
  test.setTimeout(120_000);

  const build = await import(new URL('../scripts/build-attention-items.mjs', import.meta.url).href);
  expect(typeof build.buildAttentionItems,
    'scripts/build-attention-items.mjs must export buildAttentionItems — it is the step whose refusals empty the tier')
    .toBe('function');

  const config = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));
  const ctx = build.attentionBuildContext(PAYLOAD, config);
  const available = ctx.watchlistScope.filter((ticker) => ctx.publishedActionSubjects.indexOf(ticker) === -1);
  expect(available.length,
    `the committed watchlist must leave subjects no action already covers, got ${JSON.stringify(available)}`)
    .toBeGreaterThanOrEqual(3);

  /* three candidates, each genuinely unbuildable for its OWN named reason. */
  const candidateFor = (subject) => ({
    observed: {
      disposition: 'attention',
      subject,
      severity: 'moderate',
      imminence: 'developing',
      observedAt: '2026-08-06T14:30:00.000Z',
      transmissionPath: ['credit-funding'],
      marketConfirmation: { state: 'present', detail: 'The spread widened across five consecutive sessions.' },
      figures: [{
        label: 'spread change',
        value: 'plus eighteen basis points',
        provenance: { sourceId: 'market-heatmap-lab', asOf: '2026-08-05T20:00:00.000Z' }
      }]
    },
    headline: `Excluded fixture candidate for ${subject} that must never reach the reader`,
    rationale: 'The widening has persisted across five consecutive sessions.',
    verb: 'monitor',
    horizon: 'this-week',
    escalationTrigger: 'The spread widens beyond thirty five basis points intraday.',
    invalidation: 'The spread retraces below eight basis points of its five session start.',
    expiry: '2026-08-13T20:00:00.000Z',
    severity: 'moderate',
    imminence: 'developing'
  });

  const first = candidateFor(available[0]);
  delete first.invalidation;
  const second = candidateFor(available[1]);
  delete second.escalationTrigger;
  const third = candidateFor(available[2]);
  third.observed = { ...third.observed, subject: 'ZZZZ' };

  const candidates = [first, second, third];
  expect(candidates.length,
    'the generation must DECLARE candidates — an empty candidate list would make the empty tier tautological')
    .toBe(3);
  expect(ctx.watchlistScope.includes('ZZZZ'), 'ZZZZ must genuinely sit outside the committed watchlist scope').toBe(false);

  const run = build.buildAttentionItems(candidates, PAYLOAD, config);

  /* the empty set is the OBSERVED consequence of universal refusal. */
  expect([...run.items], `every candidate must be refused, published: ${JSON.stringify(run.items)}`).toEqual([]);
  expect(run.exclusions.length,
    `every declared candidate must be recorded as excluded, got ${JSON.stringify(run.exclusions)}`)
    .toBe(candidates.length);

  await openBrief(page);
  await renderFixture(page, {
    nowUtc: FIXTURE_NOW,
    generatedAt: '2026-08-06T14:52:47.682Z',
    attention: run.items
  });

  const tier = page.locator('#decisionAttention');

  /* 1. NO item renders — no placeholder card, no fabricated item. */
  await expect(tier.locator('[data-attn-item]')).toHaveCount(0);

  /* and specifically none of the refused candidates leaked onto the page. */
  const tierText = (await tier.innerText()).replace(/\s+/g, ' ');
  for (const candidate of candidates) {
    expect(tierText.includes(candidate.headline),
      `a refused candidate must never render. Found its headline in the tier: ${candidate.headline}`)
      .toBe(false);
  }

  /* 2. the DECLARED empty state is VISIBLE, and it is the capability module's
        own statement read from the real loaded module rather than a string this
        test invented. */
  const declaredEmptyStatement = await page.evaluate(
    () => window.RLATTN.selectAttentionItems([], null).emptyStatement
  );
  expect(typeof declaredEmptyStatement, 'the module must declare an empty statement for the tier to render')
    .toBe('string');
  expect(declaredEmptyStatement.length, 'the declared empty statement must be a real sentence').toBeGreaterThan(10);

  const emptyState = tier.locator('[data-attn-field="empty-state"]');
  await expect(emptyState).toBeVisible();
  await expect(emptyState).toHaveText(declaredEmptyStatement);

  /* 3. ADVERSARIAL: a tier that rendered NOTHING AT ALL would satisfy "zero
        items" and "no fabricated card" trivially. It must still be present, be
        visible, and still report the count it is reporting zero of — otherwise
        an empty tier is indistinguishable from a tier that never ran. */
  await expect(tier).toBeVisible();
  const openCount = tier.locator('[data-attn-field="open-count"]');
  await expect(openCount).toBeVisible();
  await expect(openCount).toContainText(/0 items/);
  expect(tierText.length,
    `the tier must still say something to the reader, got ${JSON.stringify(tierText)}`)
    .toBeGreaterThan(20);

  /* and the "module did not load" degradation must NOT be what is on screen:
     "nothing needs a decision" and "nothing was checked" are different claims. */
  expect(tierText.toLowerCase().includes('could not be loaded'),
    `the empty state must be the declared one, not the module-unavailable degradation. Tier text: ${tierText}`)
    .toBe(false);
});

/* ═══════════════ TP-03-03 — SCN-017-057 the narrow projection ═══════════════ */

test('SCN-017-057 The tier stays readable at a phone width with nothing clipped', async ({ page }) => {
  test.setTimeout(90_000);

  /* 360 x 740 is the narrow end of the phone range the cockpit has to survive.
     Set BEFORE navigation so the first paint is the narrow one — resizing after
     load would let a layout that only reflows on resize pass. */
  await page.setViewportSize({ width: 360, height: 740 });
  await openBrief(page);

  const tier = page.locator('#decisionAttention');
  await expect(tier).toBeVisible();
  const renderedItems = await ensureRenderedAttentionFixture(page);

  /* READINESS BEFORE MEASUREMENT. openBrief() proves FIRST PAINT only: the page's
     renderAll() paints #scorecard and #decisionAttention in the SAME synchronous
     pass, so this tier is already visible while the rest of the page is still
     moving — the shared shell is still injecting its nav and its "Data behind this
     page" control, the ticker decorator rewrites tickers on DOM mutation, and the
     cache-first hydrate re-renders sections as its delta lands. Assertion 1 below
     measures the WHOLE DOCUMENT, so taking it in that window reports a layout no
     reader ever sees, and the verdict then turns on how far the page happened to
     have settled rather than on whether anything is clipped.

     Each wait below is a state the page itself publishes — the tier's own item
     count, its own final text metrics, and its own geometry ceasing to change.
     None of them is a fixed delay, and none of them can hide a clip: a layout that
     settles clipped still fails assertion 2, and a layout that never settles fails
     here by name rather than passing on a lucky sample. */
  await expect(tier.locator('[data-attn-item]')).toHaveCount(renderedItems.length);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.evaluate(() => new Promise((settled, neverSettled) => {
    /* exactly the geometry assertions 1 and 2 read, so "settled" means settled for
       the measurement that follows rather than for something adjacent to it. */
    const signature = () => {
      const nodes = document.querySelectorAll(
        '#decisionAttention [data-attn-field], #decisionAttention button, #decisionAttention a, #decisionAttention summary');
      return [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
        nodes.length,
        ...Array.from(nodes, (node) => {
          const box = node.getBoundingClientRect();
          return `${Math.round(box.left)}:${Math.round(box.right)}`;
        })
      ].join('|');
    };
    const startedAt = performance.now();
    let previous = null;
    let identicalFrames = 0;
    const onFrame = () => {
      const current = signature();
      identicalFrames = current === previous ? identicalFrames + 1 : 0;
      previous = current;
      if (identicalFrames >= 3) { settled(); return; }
      if (performance.now() - startedAt > 20000) {
        neverSettled(new Error(`the phone-width layout never stopped changing, so it cannot be measured. Last: ${current}`));
        return;
      }
      requestAnimationFrame(onFrame);
    };
    requestAnimationFrame(onFrame);
  }));

  /* 1. NO HORIZONTAL OVERFLOW. Measured on the document, because a tier that
        fits while pushing the PAGE sideways still hands the reader a sideways
        scrollbar. One pixel of tolerance for sub-pixel layout rounding. */
  const overflow = await page.evaluate(() => ({
    docScroll: document.documentElement.scrollWidth,
    docClient: document.documentElement.clientWidth
  }));
  expect(overflow.docScroll,
    `the page must not scroll sideways at 360px: scrollWidth ${overflow.docScroll} vs clientWidth ${overflow.docClient}`)
    .toBeLessThanOrEqual(overflow.docClient + 1);

  /* 2. NO CLIPPED CONTROL. Every rendered field and control must sit inside the
        viewport; a control whose right edge is past it is unreachable on a
        phone even though it is technically "rendered". */
  const clipped = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const nodes = Array.from(document.querySelectorAll('#decisionAttention [data-attn-field], #decisionAttention button, #decisionAttention a, #decisionAttention summary'));
    return nodes
      .filter((node) => {
        const box = node.getBoundingClientRect();
        return box.width > 0 && (box.right > width + 1 || box.left < -1);
      })
      .map((node) => ({
        field: node.getAttribute('data-attn-field') || node.tagName.toLowerCase(),
        right: Math.round(node.getBoundingClientRect().right),
        viewport: width
      }));
  });
  expect(clipped,
    `no decision attention field or control may extend past a 360px viewport. Clipped: ${JSON.stringify(clipped)}`)
    .toEqual([]);

  /* 3. ADVERSARIAL — the two assertions above are satisfiable by a tier that
        rendered nothing at all, so prove there was something to clip. The tier
        must carry real measured content at this width. */
  const measured = await page.evaluate(() => {
    const host = document.querySelector('#decisionAttention');
    return {
      fields: host ? host.querySelectorAll('[data-attn-field]').length : 0,
      text: host ? (host.textContent || '').trim().length : 0
    };
  });
  expect(measured.fields,
    'the narrow run must render real fields, or "nothing is clipped" proves nothing')
    .toBeGreaterThan(0);
  expect(measured.text).toBeGreaterThan(20);

  /* 4. and the CLIPPED-CONTROL detector itself must be able to fail. The page
        clips horizontal overflow, so a wide child does NOT grow
        documentElement.scrollWidth — which is exactly why assertion 2 measures
        each control's own rect rather than trusting the document. Prove that
        measurement catches a control placed past the viewport edge. */
  const detects = await page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const host = document.querySelector('#decisionAttention');
    const probe = document.createElement('span');
    probe.setAttribute('data-attn-field', 'overflow-probe');
    probe.textContent = 'probe';
    probe.style.cssText = `position:absolute;left:${width + 500}px;width:200px`;
    host.appendChild(probe);
    const caught = Array.from(host.querySelectorAll('[data-attn-field]')).some((node) => {
      const box = node.getBoundingClientRect();
      return box.width > 0 && (box.right > width + 1 || box.left < -1);
    });
    probe.remove();
    return caught;
  });
  expect(detects, 'the clipped-control measurement must detect a control placed past the viewport edge').toBe(true);
});

/* ═══════════ TP-04-08 — SCN-017-058 the record withholds rather than zeroes ═══════════ */

test('SCN-017-058 The record shows the withheld state with its sample size, never a zero rate', async ({ page }) => {
  test.setTimeout(90_000);

  await openBrief(page);

  const record = page.locator('#attentionRecord');
  await expect(record).toBeVisible();

  /* the published record, read from the same artifact the page fetches, so the
     assertion below is against the shipped reduction rather than a guess. */
  const published = JSON.parse(readFileSync(new URL('../market-brief.attention-scorecard.json', import.meta.url), 'utf8'));
  expect(published.overall.insufficientSample,
    'this scenario asserts the WITHHELD state, so the committed record must currently be under its minimum sample')
    .toBe(true);

  /* 1. the withheld statement is what the reader sees — the module's own words. */
  await expect(record).toContainText(published.overall.statement);

  /* 2. the sample size is SHOWN, not hidden behind the refusal. A refusal that
        does not say how much history exists gives the reader no way to know
        whether to come back tomorrow or next quarter. */
  const sampleText = await record.evaluate((host) => {
    const withTitle = Array.from(host.querySelectorAll('[title]')).map((n) => n.getAttribute('title'));
    return `${host.textContent} ${withTitle.join(' ')}`;
  });
  expect(sampleText,
    `the record must state the closed sample and the minimum it is measured against. Rendered: ${JSON.stringify(sampleText)}`)
    .toContain(String(published.overall.closedSample));
  expect(sampleText).toContain(String(published.overall.minClosedSample));

  /* 3. NEVER A ZERO. A withheld rate rendered as 0% reads as "we are never
        right", which is a different and false claim. Neither a percentage nor a
        decimal rate may appear while the sample is insufficient. */
  const visible = (await record.textContent()) || '';
  expect(/\d+(\.\d+)?\s*%/.test(visible),
    `no rate may render while the sample is withheld. Rendered: ${JSON.stringify(visible)}`)
    .toBe(false);

  /* 4. ADVERSARIAL — assertions 1-3 are all satisfiable by an empty block, so
        prove the block actually rendered its own content. */
  expect(visible.trim().length,
    'the record must say something to the reader; an empty block would satisfy every check above')
    .toBeGreaterThan(40);
  expect(visible.toLowerCase().includes('cannot be computed'),
    `the withheld state must be the module's refusal, not the module-unavailable degradation. Rendered: ${JSON.stringify(visible)}`)
    .toBe(false);
});

/* ═══════════════ H-4 — SCN-017-059 the two lists carry different cards ═══════════════ */

test('SCN-017-059 No item appears in both the decision tier and the catalyst feed', async ({ page }) => {
  test.setTimeout(90_000);

  /* H-4 re-scoped the older feed to catalysts and gave decisions their own tier.
     Both renderers read the SAME payload.attention array, so relabelling the
     heading was not enough: every decision card was also rendering below as a
     catalyst, and the reader met each item twice on one page. */
  await openBrief(page);

  const tier = page.locator('#decisionAttention');
  const feed = page.locator('#attention');
  await expect(tier).toBeVisible();
  await ensureRenderedAttentionFixture(page);

  const tierHeadlines = await tier.locator('[data-attn-item]').allInnerTexts();
  expect(tierHeadlines.length,
    'the tier must publish real cards, or "no overlap" is satisfied by an empty page')
    .toBeGreaterThan(0);

  const feedText = ((await feed.innerText().catch(() => '')) || '').trim();

  /* Each tier card's headline is the strongest identity the DOM exposes on both
     surfaces. A headline that reappears verbatim below is the duplication. */
  const duplicated = [];
  for (const block of tierHeadlines) {
    const headline = block.split('\n').map((line) => line.trim()).filter(Boolean)[0];
    if (headline && headline.length > 24 && feedText.includes(headline)) duplicated.push(headline);
  }
  expect(duplicated,
    `no decision-tier card may reappear in the catalyst feed. Duplicated: ${JSON.stringify(duplicated)}`)
    .toEqual([]);

  /* ADVERSARIAL: the comparison must be capable of finding a match at all —
     a substring test against text that was never loaded would pass vacuously. */
  const probe = tierHeadlines[0].split('\n').map((line) => line.trim()).filter(Boolean)[0];
  expect(probe.length, 'the probe headline must be substantial enough to match on').toBeGreaterThan(24);
  expect(`prefix ${probe} suffix`.includes(probe),
    'the substring comparison used above must actually detect a repeated headline')
    .toBe(true);
});

/* ═══════════ TP-04-09 — SCN-017-063 the record reads the PUBLISHED reduction ═══════════ */

/* Closes F-017-06 adversarially.
 *
 * The existing withheld-state row (SCN-017-058) asserts against the SHIPPED
 * scorecard, which currently reduces to closedSample 0. At that value the wired
 * read and the old hardcoded `computeInterruptionRate([], ...)` emit the SAME
 * statement, the same sample size and the same minimum — so that row would still
 * pass against the defect. The finding said so itself: "a fixture with an empty
 * ledger cannot detect this defect."
 *
 * This row seeds a SUFFICIENT sample instead, which the empty-ledger recompute
 * can never produce. It is served over a real HTTP fetch by the suite's static
 * server, NOT via page.route: repo policy classifies an intercepted Playwright
 * test out of e2e-ui entirely, so mocking here would convert the only live-stack
 * proof into a mocked one and leave the gap open while appearing to close it.
 * Overriding one served artifact pins a DEPENDENCY's observed state; the page
 * still performs its own fetch and still renders whatever it actually observed.
 *
 * Fixtures supply outcome observations only. Every number asserted below is
 * derived by the production reducer from those observations, so this cannot
 * drift into asserting a hand-typed expectation. */
test('SCN-017-063 The record renders the published reduction, not a recomputed empty ledger', async ({ page }) => {
  test.setTimeout(90_000);

  const RLATTN = createRequire(import.meta.url)('../rlattention.js');
  const asOf = '2026-08-08T12:00:00.000Z';

  const effectiveClass = RLATTN.TERMINAL_OUTCOME_CLASSES
    .find((outcomeClass) => outcomeClass !== 'expired-without-effect');
  expect(effectiveClass, 'the module must publish a terminal class that counts as effective').toBeTruthy();

  const records = [
    ...Array.from({ length: 17 }, () => ({ outcomeClass: effectiveClass })),
    ...Array.from({ length: 5 }, () => ({ outcomeClass: 'expired-without-effect' }))
  ];

  const overall = RLATTN.computeInterruptionRate(records, null, asOf);
  const withheld = RLATTN.computeInterruptionRate([], null, asOf);

  expect(overall.sufficientSample,
    'the seeded sample must clear the reducer minimum, otherwise this row proves nothing')
    .toBe(true);
  expect(overall.statement,
    'the seeded and empty reductions must differ, or the assertion below cannot discriminate')
    .not.toBe(withheld.statement);

  const seededSite = await startStaticServer({
    overrides: {
      'market-brief.attention-scorecard.json': JSON.stringify({
        contractVersion: 'attention-scorecard/v1',
        generatedAt: asOf,
        overall,
        byDecisionWindow: {},
        byChannel: {}
      })
    }
  });

  try {
    await page.goto('about:blank');
    await page.goto(`${seededSite.baseUrl}/${PAGE}`);
    await expect(page.locator('#scorecard')).toBeVisible({ timeout: 30000 });

    const record = page.locator('#attentionRecord');
    await expect(record).toBeVisible();

    const rendered = await record.evaluate((host) => {
      const titles = Array.from(host.querySelectorAll('[title]')).map((node) => node.getAttribute('title'));
      return `${host.textContent} ${titles.join(' ')}`;
    });

    expect(rendered,
      `the record must render the PUBLISHED reduction's statement. Rendered: ${JSON.stringify(rendered)}`)
      .toContain(overall.statement);
    expect(rendered, 'the published effective/closed counts must reach the reader')
      .toContain(String(overall.closedSample));
    expect(rendered,
      'the withheld statement must be absent — its presence is the defect this row exists to catch')
      .not.toContain(withheld.statement);
  } finally {
    await seededSite.close();
  }
});

/* ═══════════════ SCN-017-065 — BS-017-018 / FR-018 owner deep link ═══════════════ */

/* The reader is told to check the figures at source, so the link has to actually
   go there. The adversarial half is the reason this scenario exists: `deepLink`
   is authored input that reaches an href, and a hostile value renders exactly
   like a real one. Text assertions alone would pass on a `javascript:` link. */
test('SCN-017-065 An item links to its owning tool and a hostile link never becomes an anchor', async ({ page }) => {
  test.setTimeout(90_000);

  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await openBrief(page);

  const tier = page.locator('#decisionAttention');

  const linkedItems = await ensureRenderedAttentionFixture(page);

  /* every COMMITTED item links to the tool that owns its math. */
  for (const item of linkedItems) {
    expect(typeof item.deepLink,
      `committed item ${item.id} must carry a deep link (FR-018)`).toBe('string');

    const card = tier.locator(`[data-attn-id="${item.id}"]`);
    await expect(card).toHaveCount(1);

    const link = card.locator('[data-attn-field="owner-link"]');
    await expect(link, `item ${item.id} must expose a link to its owning tool`).toHaveCount(1);
    await expect(link).toHaveAttribute('href', item.deepLink);
  }

  /* ADVERSARIAL: each hostile value must be refused an anchor. A bare
     toHaveCount(0) on the anchor would also pass if the tier failed to render
     at all, so each case asserts the card itself is still present. */
  const HOSTILE = [
    'javascript:globalThis.__rlAttnLinkInjected=true',
    'https://evil.example.com/market-heatmap-lab.html',
    '../../etc/passwd',
    'data:text/html,<script>globalThis.__rlAttnLinkInjected=true</script>'
  ];

  for (const hostile of HOSTILE) {
    await renderFixture(page, {
      nowUtc: FIXTURE_NOW,
      generatedAt: FIXTURE_NOW,
      attention: [fixtureItem({ id: 'attn-hostile-link', deepLink: hostile, expiry: LIVE_EXPIRY })]
    });

    const card = tier.locator('[data-attn-id="attn-hostile-link"]');
    await expect(card, `the tier must still render the item for ${hostile}`).toHaveCount(1);
    await card.locator('summary').first().click();

    await expect(card.locator('[data-attn-field="owner-link"]'),
      `a hostile deep link must never become an anchor: ${hostile}`).toHaveCount(0);

    const hrefs = await card.locator('a').evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')));
    expect(hrefs, `no anchor in the card may carry the hostile value: ${hostile}`).not.toContain(hostile);
  }

  expect(await page.evaluate(() => globalThis.__rlAttnLinkInjected === true),
    'a hostile deep link must never execute').toBe(false);
  expect(pageErrors, `browser errors during owner-link render: ${pageErrors.join(' | ')}`).toEqual([]);
});
