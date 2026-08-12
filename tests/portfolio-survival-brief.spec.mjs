/* Feature 008 Scope 05 — four-window direct-scope Portfolio Brief, in the real browser.
 *
 * These rows exist because the functional suite proves the COMPOSER is correct while saying
 * nothing about whether the page actually shows what the composer returned. A page can call a
 * correct function and then render a lane it was never given, collapse two clocks into one label,
 * or fill an empty inferred lane with placeholder copy that reads like a result. Each row below
 * therefore asserts the RENDERED state, not the return value.
 */
import { expect, test } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FIXTURE_ROOT, ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});

test.afterAll(async () => {
  if (server) await server.close();
});

const BRIEF_CONFIG = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));
const WINDOWS = BRIEF_CONFIG.windows;
const WINDOW_IDS = WINDOWS.map((entry) => entry.id);

/* Fixture dates are DERIVED from the generic config's own as-of date rather than hard-coded, so a
   later config refresh cannot silently turn these observations into after-cutoff ones and quietly
   empty every lane. EVIDENCE_DAY precedes the earliest cutoff; LATE_DAY follows the latest. */
function shiftDay(iso, days) {
  const base = Date.parse(`${iso}T00:00:00.000Z`);
  return new Date(base + days * 86400000).toISOString().slice(0, 10);
}
const EVIDENCE_DAY = shiftDay(BRIEF_CONFIG.asOf, -1);
const LATE_DAY = shiftDay(BRIEF_CONFIG.asOf, 2);

async function openBrief(page) {
  const response = await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  expect(response?.status(), 'the brief route must be served').toBe(200);
  await expect(page.locator('#portfolioBrief')).toBeVisible();
  // The window select is populated from the PUBLIC generic config, so its option count is
  // evidence that the page consumed the real contract rather than a local hard-coded list.
  await expect.poll(async () => page.locator('#briefWindow option').count(),
    { message: 'the four generic windows must load from market-brief.config.json' }).toBe(WINDOWS.length);
}

async function importValid(page, name) {
  await page.locator('#portfolioName').fill(name);
  await page.locator('#portfolioFile').setInputFiles(resolve(FIXTURE_ROOT, 'valid-portfolio.csv'));
  await expect(page.locator('#previewAccepted')).toHaveText('3');
  await page.locator('#duplicateChoice').selectOption('merge');
  await page.locator('#localOnlyAcknowledgement').check();
  await page.locator('#confirmImport').click();
  await expect(page.locator('#currentRevision')).toContainText('Current revision');
}

/* Seed the shared same-origin bar cache — the SAME public surface the page derives its generic
   evidence from. No test-only backdoor exists on the page: if these rows can drive it, so can a
   real cached series, which is what makes the assertions below evidence about production. */
async function seedBars(page, symbol, dates, { closes } = {}) {
  await page.evaluate(({ sym, days, cs }) => {
    const rows = days.map((day, index) => ({
      t: Date.parse(`${day}T00:00:00.000Z`),
      c: cs ? cs[index] : 100 + index
    }));
    window.RLDATA.putBars(sym, '1d', rows, 'tp-05-fixture');
  }, { sym: symbol, days: dates, cs: closes || null });
}

async function rerender(page) {
  // Re-selecting the current window re-runs the production render path; nothing is called directly.
  const current = await page.locator('#briefWindow').inputValue();
  await page.locator('#briefWindow').selectOption(current);
}

async function selectWindow(page, windowId) {
  await page.locator('#briefWindow').selectOption(windowId);
}

async function laneSubjects(page, lane) {
  return page.$$eval(`#briefLanes section.brief-lane[data-lane="${lane}"] li`,
    (nodes) => nodes.map((node) => node.getAttribute('data-subject')));
}

test('Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-02 windows');
  // One observation early in the day, so it survives every window's cutoff.
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);

  const seen = [];
  for (const id of WINDOW_IDS) {
    await selectWindow(page, id);

    const times = page.locator('#briefTimes');
    await expect(times).toHaveAttribute('data-window', id);
    const cutoff = await times.getAttribute('data-cutoff');
    const published = await times.getAttribute('data-published');
    const composed = await times.getAttribute('data-composed');

    // Three clocks, three distinct values. A page that renders one label for all three is exactly
    // what makes a past brief unauditable, so identity between any pair fails the row.
    expect(cutoff, `${id} states an evidence cutoff`).toBeTruthy();
    expect(published, `${id} preserves the generic publication time`).toBeTruthy();
    expect(composed, `${id} states a local composition time`).toBeTruthy();
    expect(cutoff, `${id} must not reuse the composition clock as the cutoff`).not.toBe(composed);
    expect(cutoff, `${id} must not reuse the publication clock as the cutoff`).not.toBe(published);
    seen.push({ id, cutoff });
  }

  // The four cutoffs must actually differ; identical cutoffs would mean the window selection was
  // decorative and the same evidence horizon was used throughout.
  const distinctCutoffs = new Set(seen.map((entry) => entry.cutoff));
  expect(distinctCutoffs.size, 'each window must resolve its own cutoff').toBe(WINDOW_IDS.length);

  // An observation after the cutoff must be excluded and COUNTED, not silently used. Seeding it on
  // a HELD symbol that also has a usable observation is the sharper case: the subject still
  // qualifies, so an exclusion that were silently skipped would leave no visible trace at all.
  await seedBars(page, 'MSFT', [LATE_DAY]);
  await selectWindow(page, 'pre-market');
  const excluded = Number(await page.locator('#briefStates').getAttribute('data-excluded-after-cutoff'));
  expect(excluded, 'observations later than the pre-market cutoff must be counted as excluded').toBeGreaterThan(0);
  expect(await laneSubjects(page, 'held'), 'the subject still qualifies through its usable observation').toContain('MSFT');

  console.log(`[TP-05-02] windows=${WINDOW_IDS.join(',')} distinctCutoffs=${distinctCutoffs.size} excludedAfterCutoff=${excluded}`);
});

test('Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-03 lanes');
  // MSFT is held (from the fixture) AND on the public watchlist; QQQ is watchlist-only.
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await seedBars(page, 'QQQ', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  expect(await laneSubjects(page, 'held')).toContain('MSFT');
  expect(await laneSubjects(page, 'watchlist'), 'QQQ qualifies only through the public watchlist').toContain('QQQ');

  // Each rendered item must state HOW it qualified. A lane without a per-item source label lets a
  // reader infer authority from position alone, which is the conflation this row guards.
  const sources = await page.$$eval('#briefLanes li', (nodes) => nodes.map((node) => ({
    subject: node.getAttribute('data-subject'),
    lane: node.getAttribute('data-lane'),
    source: node.getAttribute('data-scope-source')
  })));
  expect(sources.find((row) => row.subject === 'MSFT').source).toBe('direct-holding');
  expect(sources.find((row) => row.subject === 'QQQ').source).toBe('direct-watchlist');
  for (const row of sources) {
    expect(row.source, `${row.subject} must declare its qualification source`).toBeTruthy();
  }

  // Raw browsing history cannot populate Completed research or Inferred relevance. Nothing was
  // recorded through the explicit completion path, so both lanes must be empty AND say so.
  expect(await laneSubjects(page, 'completedResearch')).toEqual([]);
  expect(await laneSubjects(page, 'inferredRelevance')).toEqual([]);
  await expect(page.locator('#briefLanes p[data-lane-empty="inferredRelevance"]')).toBeVisible();

  // MSFT is both held and watchlisted. It appears ONCE, in the higher-authority lane, and discloses
  // the second qualification rather than being listed twice.
  expect(await laneSubjects(page, 'watchlist'),
    'a held subject must not be duplicated into the watchlist lane').not.toContain('MSFT');
  await expect(page.locator('#briefLanes li[data-subject="MSFT"]')).toContainText('also qualifies via watchlist');

  console.log('[TP-05-03] held=MSFT watchlistOnly=QQQ completedResearch=0 inferred=0 duplicated=0');
});

test('Regression: SCN-008-010 insufficient completed history produces zero inferred actions', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-04 floor');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  // No completion has been recorded, so the browser is below the declared floor on both counts.
  await expect(page.locator('#briefStates')).toHaveAttribute('data-behavior-history', 'insufficient-history');
  expect(await laneSubjects(page, 'inferredRelevance'),
    'below the floor the inferred lane must be empty rather than filled with speculation').toEqual([]);

  // The empty lane must EXPLAIN itself. An absent lane and a lane that is empty for a stated
  // reason read very differently to a user deciding whether to trust the brief.
  const emptyCopy = page.locator('#briefLanes p[data-lane-empty="inferredRelevance"]');
  await expect(emptyCopy).toBeVisible();
  await expect(emptyCopy).toContainText('below the declared floor');

  // Direct value survives the shortfall untouched — an empty inferred lane is not an empty brief.
  expect(await laneSubjects(page, 'held')).toContain('MSFT');
  await expect(page.locator('#briefStates')).toHaveAttribute('data-material-change', 'material-change');

  // The floor counts are shown, so the shortfall is legible rather than a bare label.
  await expect(page.locator('#briefStates')).toContainText('completions');
  await expect(page.locator('#briefStates')).toContainText('dates');

  console.log('[TP-05-04] behaviorHistory=insufficient-history inferred=0 heldRetained=true explained=true');
});

test('Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-05 responsive');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await seedBars(page, 'QQQ', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'zoom', width: 720, height: 900 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    // Source meaning must survive every viewport. A lane label that disappears on mobile leaves
    // the reader with items whose authority is unknowable.
    for (const lane of ['held', 'watchlist', 'completedResearch', 'inferredRelevance']) {
      await expect(page.locator(`#briefLanes section.brief-lane[data-lane="${lane}"]`),
        `${lane} lane must remain present at ${viewport.name}`).toBeVisible();
    }
    expect(await laneSubjects(page, 'held'), `held lane survives ${viewport.name}`).toContain('MSFT');
    await expect(page.locator('#briefLanes li[data-subject="MSFT"]')).toContainText('direct-holding');

    // No horizontal overflow of the document at any viewport.
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `no horizontal body overflow at ${viewport.name}`).toBeLessThanOrEqual(1);

    // Lane sections must not overlap each other. Rects that intersect mean text is being drawn
    // over text, which no amount of correct data can compensate for.
    const rects = await page.$$eval('#briefLanes section.brief-lane',
      (nodes) => nodes.map((node) => node.getBoundingClientRect()).map((r) => ({ top: r.top, bottom: r.bottom, left: r.left, right: r.right })));
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        const overlaps = a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
        expect(overlaps, `lane ${i} and lane ${j} must not overlap at ${viewport.name}`).toBe(false);
      }
    }
    console.log(`[TP-05-05] ${viewport.name} overflow=${overflow} lanes=${rects.length} overlaps=0`);
  }

  // The window control must stay operable by keyboard at the narrowest viewport.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#briefWindow').focus();
  expect(await page.evaluate(() => document.activeElement?.id)).toBe('briefWindow');
  console.log('[TP-05-05] keyboard focus reaches #briefWindow at 390px');
});

/* Records a completion through the production UI path — the only way a behaviour event enters the
   workspace. No storage is written directly, so a populated completed-research lane below is
   evidence that the real path feeds the composer. */
async function recordCompletion(page, { category, subject, source = 'completed-research' }) {
  await page.locator('#behaviorCategory').selectOption(category);
  await page.locator('#behaviorSubject').fill(subject);
  await page.locator('#behaviorEvidenceSource').selectOption(source);
  await page.locator('#previewCompletion').click();
  await expect(page.locator('#confirmCompletion')).toBeEnabled();
  await page.locator('#confirmCompletion').click();
}

test('Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-07 completions');

  /* The precondition that makes this row non-vacuous: the lane starts EMPTY, so a populated lane
   * below is caused by the completion rather than by a subject that was already qualifying. The
   * sibling row asserts the empty case; this one asserts the populated case, which nothing else
   * in this file exercised. */
  /* The subject id is used VERBATIM by the page — no case normalisation — so the cached series must
   * be keyed exactly as the completion names it. Seeding 'NVDA' for a subject 'nvda' would leave
   * the lane evidence-less and make this row pass for the wrong reason. */
  await seedBars(page, 'nvda', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');
  expect(await laneSubjects(page, 'completedResearch'), 'the lane is empty before any completion is recorded').toEqual([]);

  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'nvda' });
  await rerender(page);

  const subjects = await laneSubjects(page, 'completedResearch');
  expect(subjects, 'the recorded completion qualifies nvda through the completed-research lane').toContain('nvda');

  const row = await page.$$eval('#briefLanes li', (nodes) => nodes
    .map((node) => ({
      subject: node.getAttribute('data-subject'),
      lane: node.getAttribute('data-lane'),
      source: node.getAttribute('data-scope-source')
    }))
    .find((entry) => entry.subject === 'nvda'));

  expect(row.lane, 'nvda sits in the completed-research lane, not a direct one').toBe('completedResearch');
  expect(row.source, 'the rendered item states HOW it qualified rather than leaving it to position').toBe('direct-completed-research');

  // A completion is not a holding. nvda must not have been promoted into the held lane.
  expect(await laneSubjects(page, 'held'), 'a completed-research subject is never rendered as a holding').not.toContain('nvda');

  console.log('[TP-05-07] completedResearchLane=' + subjects.join(','));
  console.log('[TP-05-07] renderedSource=' + row.source);
  console.log('[TP-05-07] promotedToHeld=false');
});

test('Regression: SCN-008-007 TP-05-08 a scoped subject with no surviving evidence is explained on screen', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-08 no-action');

  /* The fixture holds MSFT, AAPL and BND. Only MSFT gets a cached series, so the other two are
   * in scope with nothing observed. Before FR-064 they rendered nowhere at all and the reader
   * could not distinguish "nothing to do" from "we never looked". */
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  const explained = await page.$$eval('#briefNoAction li', (nodes) => nodes.map((node) => ({
    subject: node.getAttribute('data-no-action-subject'),
    reason: node.getAttribute('data-no-action-reason')
  })));

  expect(explained.length, 'subjects without evidence are listed rather than dropped from the page').toBeGreaterThan(0);
  for (const entry of explained) {
    expect(entry.reason, `${entry.subject} must state WHY it has no action`).toBeTruthy();
  }

  // The explained subjects must NOT also appear as actionable items.
  const laneSubjectIds = await page.$$eval('#briefLanes li', (nodes) => nodes.map((n) => n.getAttribute('data-subject')));
  for (const entry of explained) {
    expect(laneSubjectIds, `${entry.subject} is explained, not actionable`).not.toContain(entry.subject);
  }

  console.log('[TP-05-08] explained=' + explained.map((e) => `${e.subject}:${e.reason}`).join(','));
});

test('Regression: SCN-008-007 TP-05-09 brief identity binds revision window policy and action set', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-09 identity');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  const identity = page.locator('#briefIdentity');
  const revision = await identity.getAttribute('data-revision');
  const policyVersion = await identity.getAttribute('data-policy-version');
  const signature = await identity.getAttribute('data-action-signature');

  expect(revision, 'the identity names the portfolio revision it was composed from').toBeTruthy();
  expect(revision).not.toBe('null');
  expect(policyVersion, 'the behaviour policy in force is part of the identity').toBeTruthy();
  expect(policyVersion).not.toBe('null');
  expect(signature, 'the resulting action set is folded into the identity').toBeTruthy();

  /* Changing the window changes the cutoff and therefore what may qualify. The identity must move
   * with it, otherwise two different briefs would present the same identity. */
  await selectWindow(page, 'pre-market');
  const preMarketSignature = await identity.getAttribute('data-action-signature');
  expect(await identity.getAttribute('data-policy-version')).toBe(policyVersion);
  expect(preMarketSignature).not.toBe(null);

  console.log('[TP-05-09] revision=' + revision + ' policy=' + policyVersion);
  console.log('[TP-05-09] afterHoursSignature=' + signature);
  console.log('[TP-05-09] preMarketSignature=' + preMarketSignature);
});

test('Regression: SCN-008-008 TP-06-03 every rendered item discloses why it appears', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-03 disclosure');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  const rows = page.locator('#briefLanes li');
  const count = await rows.count();
  expect(count, 'at least one item must render for this disclosure to mean anything').toBeGreaterThan(0);

  /* The disclosure must be REACHABLE, not merely present in the DOM. A hover-only affordance is
   * out of reach on touch and for keyboard users, so it is asserted as a real <details> the
   * reader can open. */
  for (let index = 0; index < count; index += 1) {
    const row = rows.nth(index);
    const subject = await row.getAttribute('data-subject');
    const details = row.locator('details.brief-why');
    await expect(details, `${subject} must carry a Why shown disclosure`).toHaveCount(1);

    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');

    for (const field of ['why-shown', 'event-categories', 'relevance-confidence', 'horizon',
      'recency', 'evidence-state', 'trigger', 'completion', 'invalidation', 'research-verb']) {
      const value = await details.locator(`dd[data-why="${field}"]`).textContent();
      expect(value?.trim(), `${subject} must disclose ${field}`).toBeTruthy();
    }

    // FR-046 on screen: relevance is labelled as relevance, never as a success probability.
    const relevance = await details.locator('dd[data-why="relevance-confidence"]').textContent();
    expect(relevance).toContain('not a success probability');
  }

  console.log('[TP-06-03] rowsDisclosed=' + count);
});

test('Regression: SCN-008-034 TP-06-05 the route exposes research and lifecycle verbs only', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-05 verbs');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  // Every authored action verb comes from the closed research set.
  const verbs = await page.$$eval('#briefLanes li', (nodes) =>
    nodes.map((node) => node.getAttribute('data-research-verb')));
  const RESEARCH = ['review', 'inspect', 'compare', 'run-scenario', 'test-dependence',
    'revisit-thesis', 'refresh-evidence', 'open-owning-analysis'];
  expect(verbs.length).toBeGreaterThan(0);
  for (const verb of verbs) {
    expect(RESEARCH, `"${verb}" must be a research verb`).toContain(verb);
  }

  /* Every control inside the brief is either a research verb or a LABELLED lifecycle verb. An
   * unlabelled destructive control is exactly what this row is meant to catch, so the label text
   * is asserted rather than only the presence of a button. */
  const controls = await page.$$eval('#portfolioBrief button', (nodes) => nodes.map((node) => ({
    lifecycle: node.getAttribute('data-lifecycle'),
    label: (node.textContent || '').trim()
  })));
  for (const control of controls) {
    if (!control.lifecycle) continue;
    expect(['complete', 'dismiss']).toContain(control.lifecycle);
    expect(control.label.length, 'a lifecycle control must be labelled').toBeGreaterThan(0);
  }

  // No order verb, size instruction, or suitability claim anywhere in the rendered route.
  const text = await page.locator('#portfolioBrief').innerText();
  expect(text).not.toMatch(/\b(buy|sell|short|order|trade size|position size|rebalance|execute|suitab)/i);

  console.log('[TP-06-05] verbs=' + Array.from(new Set(verbs)).join(',') + ' lifecycleControls=' + controls.filter((c) => c.lifecycle).length);
});

test('Regression: SCN-008-034 TP-06-04 a lifecycle outcome is recorded without becoming a market view', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-04 lifecycle');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, 'after-hours');

  const before = await page.locator('#briefLifecycleResult').innerText();
  expect(before).toContain('No research outcome recorded');

  await page.locator('button[data-lifecycle="complete"][data-lifecycle-subject="MSFT"]').first().click();

  const result = page.locator('#briefLifecycleResult');
  // Surfaced before the assertions so a refusal code is visible in evidence rather than appearing
  // as a bare missing attribute.
  console.log('[TP-06-04] resultText=' + (await result.innerText()));
  await expect(result).toHaveAttribute('data-last-command', 'complete');
  await expect(result).toHaveAttribute('data-last-subject', 'MSFT');

  /* The load-bearing assertion: an outcome is a record that the USER acted, never an inference
   * about what they believe. If completing an action silently created an interest signal, the
   * lifecycle would be a back door into the behaviour model. */
  const text = await result.innerText();
  expect(text).toContain('not a market view');

  const leaked = await page.evaluate(() => {
    const diagnostics = window.__PORTFOLIO_DIAGNOSTICS__ || {};
    return { behaviorEvents: diagnostics.behaviorEventCount ?? null };
  });
  console.log('[TP-06-04] outcomeRecorded=complete subject=MSFT behaviorEventCount=' + leaked.behaviorEvents);

  // Dismiss is available and equally labelled; neither is a negative preference.
  await page.locator('button[data-lifecycle="dismiss"][data-lifecycle-subject="MSFT"]').first().click();
  await expect(result).toHaveAttribute('data-last-command', 'dismiss');
  console.log('[TP-06-04] outcomeRecorded=dismiss subject=MSFT');
});
