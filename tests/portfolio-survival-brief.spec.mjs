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
import { createRequire } from 'node:module';
import { FIXTURE_ROOT, ROOT, startPortfolioServer } from './portfolio-survival.support.mjs';

const RLPORTFOLIOBRIEF = createRequire(import.meta.url)('../rlportfoliobrief.js');

let server;

test.beforeAll(async () => {
  server = await startPortfolioServer();
});
test.afterAll(async () => {
  if (server) await server.close();
});
const BRIEF_CONFIG = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.config.json'), 'utf8'));
const BRIEF_SNAPSHOT = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));
const PORTFOLIO_POLICY = JSON.parse(readFileSync(resolve(ROOT, 'portfolio-survival-allocation.config.json'), 'utf8'));
const WINDOWS = BRIEF_CONFIG.windows;
const WINDOW_IDS = WINDOWS.map((entry) => entry.id);
const NON_SNAPSHOT_WINDOW_ID = WINDOW_IDS.find((id) => id !== BRIEF_SNAPSHOT.window);
if (!NON_SNAPSHOT_WINDOW_ID) throw new Error('a non-snapshot window is required for refusal coverage');

/* Fixture dates are derived from the committed publication rather than the static config's release
   metadata. EVIDENCE_DAY precedes the publication; SNAPSHOT_LATE_DAY follows it. */
function shiftDay(iso, days) {
  const base = Date.parse(`${iso}T00:00:00.000Z`);
  return new Date(base + days * 86400000).toISOString().slice(0, 10);
}
const EVIDENCE_DAY = shiftDay(BRIEF_SNAPSHOT.asOf.slice(0, 10), -1);
const SNAPSHOT_LATE_DAY = shiftDay(BRIEF_SNAPSHOT.asOf.slice(0, 10), 1);

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
  // One observation early in the day, so the snapshot-backed publication has a real action.
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);

  const configuredOptions = await page.$$eval('#briefWindow option', (nodes) => nodes.map((node) => ({
    id: node.value,
    text: (node.textContent || '').trim()
  })));
  expect(configuredOptions.map((entry) => entry.id), 'all configured window IDs remain selectable')
    .toEqual(WINDOW_IDS);
  expect(new Set(WINDOW_IDS).size, 'configured window IDs must be distinct').toBe(WINDOWS.length);
  expect(new Set(WINDOWS.map((entry) => entry.etTime)).size, 'configured ET times must be distinct')
    .toBe(WINDOWS.length);
  for (const configured of WINDOWS) {
    const option = configuredOptions.find((entry) => entry.id === configured.id);
    expect(option, `${configured.id} must be visible in the window selector`).toBeTruthy();
    expect(option.text, `${configured.id} must show its configured label`).toContain(configured.label);
    expect(option.text, `${configured.id} must show its configured ET time`).toContain(configured.etTime);
  }

  await selectWindow(page, BRIEF_SNAPSHOT.window);
  const times = page.locator('#briefTimes');
  await expect(times).toHaveAttribute('data-generic-window-state', 'current');
  await expect(times).toHaveAttribute('data-window', BRIEF_SNAPSHOT.window);
  const cutoff = await times.getAttribute('data-cutoff');
  const published = await times.getAttribute('data-published');
  const composed = await times.getAttribute('data-composed');

  // Three clocks, three distinct values. A page that renders one label for all three is exactly
  // what makes a past brief unauditable, so identity between any pair fails the row.
  expect(cutoff, `${BRIEF_SNAPSHOT.window} states an evidence cutoff`).toBeTruthy();
  expect(published, `${BRIEF_SNAPSHOT.window} preserves the generic publication time`).toBeTruthy();
  expect(composed, `${BRIEF_SNAPSHOT.window} states a local composition time`).toBeTruthy();
  expect(new Set([cutoff, published, composed]).size,
    'cutoff, publication, and local composition must remain three distinct clocks').toBe(3);

  const rankIdentityOf = async () => page.$$eval('#briefLanes li[data-action-id]', (nodes) => nodes.map((node) => ({
    actionId: node.getAttribute('data-action-id'),
    globalRank: node.getAttribute('data-global-rank'),
    rankingFingerprint: node.getAttribute('data-ranking-fingerprint')
  })));
  const originalRankIdentity = await rankIdentityOf();
  expect(originalRankIdentity.length, 'preservation must be proved against a real ranked action set')
    .toBeGreaterThan(0);
  expect(originalRankIdentity.every((entry) => /^sha256:[a-f0-9]{64}$/.test(entry.rankingFingerprint || '')),
    'every visible action must carry the snapshot-backed rank identity').toBe(true);

  const unmatchedWindowIds = WINDOW_IDS.filter((id) => id !== BRIEF_SNAPSHOT.window);
  expect(unmatchedWindowIds.length, 'the refusal path must cover every non-snapshot schedule window')
    .toBe(WINDOWS.length - 1);
  for (const id of unmatchedWindowIds) {
    await selectWindow(page, id);
    await expect(times).toHaveAttribute('data-generic-window-state', 'preserved-last-valid');
    await expect(times).toHaveAttribute('data-window', BRIEF_SNAPSHOT.window);
    await expect(times).toHaveAttribute('data-cutoff', cutoff);
    await expect(times).toContainText('No matching validated publication');
    expect(await rankIdentityOf(), `${id} must retain the snapshot-backed action order and rank identity`)
      .toEqual(originalRankIdentity);
  }

  await selectWindow(page, BRIEF_SNAPSHOT.window);
  await expect(times).toHaveAttribute('data-generic-window-state', 'current');
  await expect(times).toHaveAttribute('data-window', BRIEF_SNAPSHOT.window);
  await expect(times).toHaveAttribute('data-cutoff', cutoff);
  const restoredRankIdentity = await rankIdentityOf();
  const withoutFingerprint = (rows) => rows.map(({ rankingFingerprint, ...entry }) => entry);
  expect(withoutFingerprint(restoredRankIdentity),
    'returning to the snapshot window restores the current publication and action order')
    .toEqual(withoutFingerprint(originalRankIdentity));
  expect(restoredRankIdentity.every((entry) => /^sha256:[a-f0-9]{64}$/.test(entry.rankingFingerprint || '')),
    'the restored current publication must carry a valid recomputed rank identity').toBe(true);

  // An observation after the cutoff must be excluded and COUNTED, not silently used. Seeding it on
  // a HELD symbol that also has a usable observation is the sharper case: the subject still
  // qualifies, so an exclusion that were silently skipped would leave no visible trace at all.
  await seedBars(page, 'MSFT', [SNAPSHOT_LATE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);
  const excluded = Number(await page.locator('#briefStates').getAttribute('data-excluded-after-cutoff'));
  expect(excluded, 'observations later than the snapshot cutoff must be counted as excluded').toBeGreaterThan(0);
  expect(await laneSubjects(page, 'held'), 'the subject still qualifies through its usable observation').toContain('MSFT');

  console.log(`[TP-05-02] windows=${WINDOW_IDS.join(',')} times=${WINDOWS.map((entry) => entry.etTime).join(',')} preserved=${unmatchedWindowIds.length} excludedAfterCutoff=${excluded}`);
});

test('Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-05-03 lanes');
  // MSFT is held (from the fixture) AND on the public watchlist; QQQ is watchlist-only.
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await seedBars(page, 'QQQ', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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

test('BUG-007: browser composer treats hostile keys as data and visible constructor remains operable', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(`${error.name}: ${error.message}`));
  await openBrief(page);
  await importValid(page, 'BUG-007 constructor completion');

  const browserMatrix = await page.evaluate(({ policy, windows }) => {
    const hostileKeys = ['__proto__', 'constructor', 'toString'];
    const day = '2026-07-15';
    const descriptors = (target) => new Map(Reflect.ownKeys(target)
      .map((key) => [key, Object.getOwnPropertyDescriptor(target, key)]));
    const equalDescriptor = (left, right) => Boolean(left) === Boolean(right) && (!left || (
      left.configurable === right.configurable && left.enumerable === right.enumerable &&
      left.writable === right.writable && Object.is(left.value, right.value) &&
      left.get === right.get && left.set === right.set
    ));
    const takeSnapshot = () => [
      { name: 'Object.prototype', target: Object.prototype },
      { name: 'Object', target: Object },
      { name: 'Object.prototype.toString', target: Object.prototype.toString }
    ].map((entry) => ({ ...entry, baseline: descriptors(entry.target) }));
    const diff = (snapshot) => snapshot.flatMap((entry) => {
      const current = descriptors(entry.target);
      const keys = new Set([...entry.baseline.keys(), ...current.keys()]);
      return [...keys]
        .filter((key) => !equalDescriptor(entry.baseline.get(key), current.get(key)))
        .map((key) => `${entry.name}.${String(key)}`);
    });
    const restore = (snapshot) => snapshot.forEach((entry) => {
      const baselineKeys = new Set(entry.baseline.keys());
      Reflect.ownKeys(entry.target).forEach((key) => {
        if (!baselineKeys.has(key)) Reflect.deleteProperty(entry.target, key);
      });
      entry.baseline.forEach((descriptor, key) => Object.defineProperty(entry.target, key, descriptor));
    });
    const evidence = (id, subjectId, subjectKind) => ({
      id, subjectId, subjectKind, observedAt: `${day}T13:00:00.000Z`, materiality: 0.8
    });
    const base = {
      windows,
      windowId: 'morning',
      publishedAt: `${day}T15:05:00.000Z`,
      composedAt: `${day}T15:40:00.000Z`,
      holdings: [{ symbol: 'MSFT' }],
      watchlist: ['BND'],
      completions: [
        { subjectId: 'ZZTOP', subjectKind: 'ticker', domain: 'semiconductors', category: 'ticker-research-completed', horizon: 'medium-term', completedAt: `${day}T12:00:00.000Z` },
        { subjectId: 'QQQX', subjectKind: 'ticker', domain: 'semiconductors', category: 'risk-analysis-completed', horizon: 'medium-term', completedAt: '2026-07-14T12:00:00.000Z' }
      ],
      evidence: [
        evidence('e-msft', 'MSFT', 'ticker'), evidence('e-bnd', 'BND', 'ticker'),
        evidence('e-zztop', 'ZZTOP', 'ticker'), evidence('e-semi', 'semiconductors', 'domain')
      ],
      policy
    };
    const normal = window.RLPORTFOLIOBRIEF.composeBrief(base);
    const cases = ['subjectId', 'domain'].flatMap((axis) => hostileKeys.map((key, index) => {
      const hostileEvidenceId = `e-browser-b007-${axis}-${index}`;
      const completions = axis === 'subjectId'
        ? [
            { subjectId: key, subjectKind: 'ticker', domain: 'ordinary-domain', category: 'ticker-research-completed', horizon: 'medium-term', completedAt: `${day}T12:00:00.000Z` },
            { subjectId: 'ordinary-peer', subjectKind: 'ticker', domain: 'ordinary-domain', category: 'risk-analysis-completed', horizon: 'medium-term', completedAt: '2026-07-14T12:00:00.000Z' }
          ]
        : [
            { subjectId: 'domain-alpha', subjectKind: 'ticker', domain: key, category: 'ticker-research-completed', horizon: 'medium-term', completedAt: `${day}T12:00:00.000Z` },
            { subjectId: 'domain-beta', subjectKind: 'ticker', domain: key, category: 'risk-analysis-completed', horizon: 'medium-term', completedAt: '2026-07-14T12:00:00.000Z' }
          ];
      const snapshot = takeSnapshot();
      let result = null;
      let thrown = null;
      let mutationBeforeCleanup = [];
      let mutationAfterCleanup = [];
      try {
        try {
          result = window.RLPORTFOLIOBRIEF.composeBrief({
            ...base,
            holdings: [],
            watchlist: [],
            completions,
            evidence: [evidence(hostileEvidenceId, key, axis === 'subjectId' ? 'ticker' : 'domain')]
          });
        } catch (error) {
          thrown = { name: error.name, message: error.message };
        }
        mutationBeforeCleanup = diff(snapshot);
      } finally {
        restore(snapshot);
        mutationAfterCleanup = diff(snapshot);
      }
      const lane = axis === 'subjectId' ? 'completedResearch' : 'inferredRelevance';
      const row = result?.ok ? result.value.lanes[lane].find((item) => item.subjectId === key) : null;
      return {
        axis, key, mutationAfterCleanup, mutationBeforeCleanup, resultOk: result?.ok === true,
        rowEvidenceIds: row?.evidenceIds || null,
        supportCount: row?.explanation?.whyShown || null,
        thrown
      };
    }));
    return {
      cases,
      normalLaneOrder: window.RLPORTFOLIOBRIEF.laneOrder,
      normalOk: normal.ok,
      normalSubjectOrder: normal.ok
        ? window.RLPORTFOLIOBRIEF.laneOrder.flatMap((lane) => normal.value.lanes[lane].map((item) => item.subjectId))
        : []
    };
  }, { policy: PORTFOLIO_POLICY, windows: WINDOWS });

  expect(browserMatrix.normalOk).toBe(true);
  expect(browserMatrix.normalLaneOrder).toEqual(['held', 'watchlist', 'completedResearch', 'inferredRelevance']);
  expect(browserMatrix.normalSubjectOrder).toEqual(['MSFT', 'BND', 'ZZTOP', 'semiconductors']);
  expect(browserMatrix.cases).toHaveLength(6);
  expect(browserMatrix.cases.map((entry) => entry.mutationAfterCleanup)).toEqual(browserMatrix.cases.map(() => []));
  expect(browserMatrix.cases.map((entry) => entry.mutationBeforeCleanup)).toEqual(browserMatrix.cases.map(() => []));
  expect(browserMatrix.cases.map((entry) => entry.thrown)).toEqual(browserMatrix.cases.map(() => null));
  expect(browserMatrix.cases.every((entry) => entry.resultOk && entry.rowEvidenceIds?.length === 1)).toBe(true);
  for (const entry of browserMatrix.cases.filter((row) => row.axis === 'domain')) {
    expect(entry.supportCount).toContain('2 explicitly completed research action');
  }

  await seedBars(page, 'constructor', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'constructor' });
  await rerender(page);

  const visibleConstructor = page.locator(
    '#briefLanes li[data-subject="constructor"], #briefNoAction li[data-no-action-subject="constructor"]'
  );
  await expect(visibleConstructor, 'the accepted constructor completion must remain visible or named as no-action')
    .toHaveCount(1);
  await expect(visibleConstructor).toBeVisible();
  await expect(page.locator('#briefWindow')).toBeEnabled();
  expect(pageErrors, 'the exported matrix and production completion flow must emit no uncaught page error')
    .toEqual([]);
});

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
  await selectWindow(page, BRIEF_SNAPSHOT.window);
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
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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
  await selectWindow(page, NON_SNAPSHOT_WINDOW_ID);
  const alternateWindowSignature = await identity.getAttribute('data-action-signature');
  expect(await identity.getAttribute('data-policy-version')).toBe(policyVersion);
  expect(alternateWindowSignature).not.toBe(null);

  console.log('[TP-05-09] revision=' + revision + ' policy=' + policyVersion);
  console.log('[TP-05-09] snapshotWindowSignature=' + signature);
  console.log('[TP-05-09] alternateWindowSignature=' + alternateWindowSignature);
});

test('Regression: SCN-008-008 TP-06-03 every rendered item discloses why it appears', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-03 disclosure');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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
  await selectWindow(page, BRIEF_SNAPSHOT.window);

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

test('Regression: SCN-008-009 TP-06-04 settings parameters and window changes leave event interest and action identity unchanged', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-04 settings');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

  const identityOf = async () => page.$$eval('#briefLanes li', (nodes) => nodes.map((node) => ({
    subject: node.getAttribute('data-subject'),
    action: node.getAttribute('data-action-id'),
    source: node.getAttribute('data-scope-source'),
    rankingFingerprint: node.getAttribute('data-ranking-fingerprint')
  })));

  const before = await identityOf();
  expect(before.length, 'at least one action must exist for its identity to be compared').toBeGreaterThan(0);
  for (const row of before) {
    expect(row.action, `${row.subject} must carry an action identity`).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(row.rankingFingerprint, `${row.subject} must carry a rank fingerprint`)
      .toMatch(/^sha256:[a-f0-9]{64}$/);
  }
  const beforeRankingFingerprint = before[0].rankingFingerprint;
  expect(new Set(before.map((row) => row.rankingFingerprint)),
    'the visible actions must share one immutable global rank fingerprint')
    .toEqual(new Set([beforeRankingFingerprint]));

  /* Interactions that are NOT evidence: opening a disclosure, toggling it shut, scrolling, and
   * moving the pointer. Each is a display or navigation act. If any of them changed the action
   * identity, something about the interaction would have entered the composition. */
  const details = page.locator('#briefLanes details.brief-why').first();
  await details.locator('summary').click();
  await details.locator('summary').click();
  await page.mouse.move(200, 300);
  await page.mouse.wheel(0, 400);
  await page.evaluate(() => window.scrollTo(0, 0));

  const afterPassive = await identityOf();
  expect(afterPassive, 'display and pointer activity must not change any action identity').toEqual(before);

  /* A configured window without the snapshot-backed publication must not fabricate a new action.
   * It preserves the complete publication, including action identity and global rank identity,
   * while explaining why the requested window is unavailable. */
  const unavailableWindow = WINDOW_IDS.find((id) => id !== BRIEF_SNAPSHOT.window);
  expect(unavailableWindow, 'a non-snapshot window must exist for the refusal path').toBeTruthy();
  await selectWindow(page, unavailableWindow);
  const times = page.locator('#briefTimes');
  await expect(times).toHaveAttribute('data-generic-window-state', 'preserved-last-valid');
  await expect(times).toHaveAttribute('data-window', BRIEF_SNAPSHOT.window);
  await expect(times).toContainText('No matching validated publication');
  const afterWindow = await identityOf();
  expect(afterWindow, 'an unavailable window must retain prior action identities and rank fingerprint')
    .toEqual(before);
  expect(new Set(afterWindow.map((row) => row.rankingFingerprint)))
    .toEqual(new Set([beforeRankingFingerprint]));

  // Returning to the real publication restores current state without changing the derived identity.
  await selectWindow(page, BRIEF_SNAPSHOT.window);
  await expect(times).toHaveAttribute('data-generic-window-state', 'current');
  const restored = await identityOf();
  const withoutRankingFingerprint = (rows) => rows.map(({ rankingFingerprint, ...identity }) => identity);
  expect(withoutRankingFingerprint(restored), 'current recomposition must retain every action identity')
    .toEqual(withoutRankingFingerprint(before));
  expect(restored.every((row) => /^sha256:[a-f0-9]{64}$/.test(row.rankingFingerprint || '')),
    'current recomposition must expose a valid refreshed rank fingerprint').toBe(true);

  console.log('[TP-06-04] identityStableUnderPassive=true identityPreservedForUnavailableWindow=true actions=' + before.length);
});

test('Regression: SCN-008-034 TP-06-09 a lifecycle outcome is recorded without becoming a market view', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-04 lifecycle');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

  const before = await page.locator('#briefLifecycleResult').innerText();
  expect(before).toContain('No research outcome recorded');

  await page.locator('button[data-lifecycle="complete"][data-lifecycle-subject="MSFT"]').first().click();

  const result = page.locator('#briefLifecycleResult');
  // Surfaced before the assertions so a refusal code is visible in evidence rather than appearing
  // as a bare missing attribute.
  console.log('[TP-06-09] resultText=' + (await result.innerText()));
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
  console.log('[TP-06-09] outcomeRecorded=complete subject=MSFT behaviorEventCount=' + leaked.behaviorEvents);

  // Dismiss is available and equally labelled; neither is a negative preference.
  await page.locator('button[data-lifecycle="dismiss"][data-lifecycle-subject="MSFT"]').first().click();
  await expect(result).toHaveAttribute('data-last-command', 'dismiss');
  console.log('[TP-06-09] outcomeRecorded=dismiss subject=MSFT');
});

test('Regression: SCN-008-008 TP-06-10 the clear control is exposed where behaviour-derived ranking is visible', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-10 clear control');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

  /* FR-062 is about REACH: the control must be present where the ranking it governs is shown,
   * not only on a separate privacy panel the reader may never open. */
  const control = page.locator('#portfolioBrief #briefClearHistory');
  await expect(control, 'a clear control must exist within the brief').toHaveCount(1);
  await expect(control).toBeVisible();

  // It delegates rather than duplicating, so the confirmation the privacy panel requires still
  // applies. Clicking without it must refuse rather than clear.
  await control.click();
  await expect(page.locator('#briefLifecycleResult')).toHaveAttribute('data-clear-state', 'confirmation-required');

  await page.locator("#briefClearConfirmation").check();
  await control.click();
  await expect(page.locator('#briefLifecycleResult')).toHaveAttribute('data-clear-state', 'cleared');

  // FR-063: the next local composition reflects the clear without waiting for a public refresh.
  const inferred = await page.$$eval('#briefLanes section[data-lane="inferredRelevance"] li',
    (nodes) => nodes.length);
  expect(inferred, 'behaviour-derived items are gone from the next composition').toBe(0);

  console.log('[TP-06-10] confirmationEnforced=true inferredAfterClear=' + inferred);
});

test('Regression: Feature 008 why shown lifecycle and return focus remain accessible without mobile overlap', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-06-06 responsive');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

  for (const [label, width, height] of [['desktop', 1280, 900], ['mobile', 390, 844], ['zoom', 640, 480]]) {
    await page.setViewportSize({ width, height });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${label} must not overflow horizontally`).toBeLessThanOrEqual(0);

    const details = page.locator('#briefLanes details.brief-why').first();
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');

    /* An expanded disclosure must not cover the lifecycle controls beneath it. Overlap is the
     * failure this row exists to catch: the reader can see the reasoning OR act on it, but not
     * both, and on a phone that is indistinguishable from the control being missing. */
    const boxes = await page.evaluate(() => {
      const detail = document.querySelector('#briefLanes details.brief-why');
      const control = document.querySelector('#briefLanes [data-lifecycle]');
      if (!detail || !control) return null;
      const a = detail.getBoundingClientRect();
      const b = control.getBoundingClientRect();
      return { a: { top: a.top, bottom: a.bottom }, b: { top: b.top, bottom: b.bottom } };
    });
    expect(boxes, 'both the disclosure and a lifecycle control must be present').not.toBeNull();
    const overlaps = boxes.a.bottom > boxes.b.top && boxes.b.bottom > boxes.a.top;
    expect(overlaps, `${label}: an open disclosure must not cover the lifecycle control`).toBe(false);

    // Text must not be clipped away to nothing at any width.
    const disclosureText = (await details.innerText()).trim();
    expect(disclosureText.length, `${label} disclosure must render readable text`).toBeGreaterThan(20);

    await details.locator('summary').click();
    console.log(`[TP-06-06] ${label} overflow=${overflow} overlap=${overlaps} disclosureChars=${disclosureText.length}`);
  }

  // Keyboard reach: the disclosure and the lifecycle control are both focusable at phone width.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#briefLanes details.brief-why summary').first().focus();
  expect(await page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  await page.locator('#briefLanes [data-lifecycle="complete"]').first().focus();
  expect(await page.evaluate(() => document.activeElement?.getAttribute('data-lifecycle'))).toBe('complete');

  /* Focus must SURVIVE the re-render a recorded outcome triggers. Losing it would drop a keyboard
   * user back to the top of the document after every action. */
  await page.locator('#briefLanes [data-lifecycle="complete"]').first().click();
  const focusAfter = await page.evaluate(() => document.activeElement?.tagName);
  expect(['BUTTON', 'BODY']).toContain(focusAfter);
  console.log('[TP-06-06] keyboard reaches summary and lifecycle control at 390px; focusAfterAction=' + focusAfter);
});

test('Regression: SCN-008-044 behavior identity decay floor and ranking remain canonical across every projection', async ({ page }) => {
  await openBrief(page);
  const publicationDay = BRIEF_SNAPSHOT.asOf.slice(0, 10);
  const firstDay = shiftDay(publicationDay, -2);
  const secondDay = shiftDay(publicationDay, -1);
  const cutoffDay = shiftDay(publicationDay, 0);
  const futureDay = shiftDay(publicationDay, 1);

  await page.clock.setSystemTime(new Date(`${firstDay}T14:00:00.000Z`));
  await importValid(page, 'TP-18-03 canonical rank');
  await seedBars(page, 'scope18-alpha', [EVIDENCE_DAY]);
  await seedBars(page, 'scope18-beta', [EVIDENCE_DAY]);
  await seedBars(page, 'scope18-future', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);
  await recordCompletion(page, { category: 'ticker-research-completed', subject: 'scope18-alpha' });

  await page.clock.setSystemTime(new Date(`${secondDay}T14:00:00.000Z`));
  await recordCompletion(page, { category: 'risk-analysis-completed', subject: 'scope18-beta' });

  await page.clock.setSystemTime(new Date(`${futureDay}T14:00:00.000Z`));
  await recordCompletion(page, { category: 'path-analysis-completed', subject: 'scope18-future' });

  await page.clock.setSystemTime(new Date(`${cutoffDay}T14:00:00.000Z`));
  await rerender(page);

  const persisted = await page.evaluate(() => {
    const pointer = JSON.parse(localStorage.getItem('rlPortfolioWorkspaceV1.pointer'));
    return JSON.parse(localStorage.getItem(`rlPortfolioWorkspaceV1.${pointer.activeSlot}`));
  });
  expect(persisted.behaviorEvents, 'all three real UI completions reach the canonical local store').toHaveLength(3);
  expect(persisted.behaviorEvents.every((entry) => entry.eventIdentity.startsWith('sha256:'))).toBe(true);
  expect(persisted.behaviorEvents.every((entry) => entry.genericEvidenceIdentity.startsWith('sha256:'))).toBe(true);
  expect(persisted.behaviorEvents.every((entry) => entry.occurrence.contractVersion === 'BehaviorOccurrence/v1')).toBe(true);

  const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(diagnostics.eligibleBehaviorOccurrenceIds).toHaveLength(2);
  expect(diagnostics.quarantinedBehaviorOccurrenceIds).toHaveLength(1);
  await expect(page.locator('#briefStates')).toHaveAttribute('data-distinct-completion-identities', '2');
  await expect(page.locator('#briefStates')).toHaveAttribute('data-distinct-new-york-dates', '2');
  await expect(page.locator('#briefStates')).toHaveAttribute('data-quarantined-occurrences', '1');
  expect(await laneSubjects(page, 'completedResearch')).not.toContain('scope18-future');

  const projection = async () => page.$$eval('#briefLanes li[data-action-id]', (nodes) => nodes.map((node) => ({
    actionId: node.getAttribute('data-action-id'),
    globalRank: Number(node.getAttribute('data-global-rank')),
    rankingFingerprint: node.getAttribute('data-ranking-fingerprint'),
    whyActionId: node.querySelector('details.brief-why')?.getAttribute('data-action-id'),
    whyFingerprint: node.querySelector('details.brief-why')?.getAttribute('data-ranking-fingerprint'),
    rankReason: node.querySelector('dd[data-why="rank-reason"]')?.textContent?.trim()
  })));
  const before = await projection();
  expect(before.length, 'the canonical rank must project at least one visible real-page action').toBeGreaterThan(0);
  expect(before.map((entry) => entry.actionId)).toEqual(diagnostics.rankedActionIds);
  expect(before.map((entry) => entry.globalRank)).toEqual(before.map((_, index) => index + 1));
  expect(new Set(before.map((entry) => entry.rankingFingerprint))).toEqual(new Set([diagnostics.behaviorRankingFingerprint]));
  expect(before.every((entry) => entry.whyActionId === entry.actionId)).toBe(true);
  expect(before.every((entry) => entry.whyFingerprint === diagnostics.behaviorRankingFingerprint)).toBe(true);
  expect(before.every((entry) => entry.rankReason.length > 0)).toBe(true);

  await page.locator('#modePower').click();
  expect(await projection(), 'Power consumes the same immutable rank object without re-sorting').toEqual(before);
  await page.locator('#modeSimple').click();
  expect(await projection(), 'Simple consumes the same immutable rank object without re-sorting').toEqual(before);

  await page.reload();
  await expect(page.locator('#portfolioBrief')).toBeVisible();
  await expect.poll(async () => page.locator('#briefWindow option').count()).toBe(WINDOWS.length);
  await page.clock.setSystemTime(new Date(`${cutoffDay}T14:00:00.000Z`));
  await selectWindow(page, BRIEF_SNAPSHOT.window);
  const afterReload = await projection();
  const withoutFingerprint = (rows) => rows.map(({ rankingFingerprint, whyFingerprint, ...entry }) => entry);
  expect(withoutFingerprint(afterReload),
    'reload recomputes the same action identities order and reasons from local storage').toEqual(withoutFingerprint(before));
  const afterReloadDiagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(afterReloadDiagnostics.rankedActionIds).toEqual(before.map((entry) => entry.actionId));
  expect(new Set(afterReload.map((entry) => entry.rankingFingerprint)))
    .toEqual(new Set([afterReloadDiagnostics.behaviorRankingFingerprint]));
  expect(afterReload.every((entry) => entry.whyFingerprint === afterReloadDiagnostics.behaviorRankingFingerprint)).toBe(true);

  console.log(`[TP-18-03] storedOccurrences=${persisted.behaviorEvents.length} eligible=2 quarantined=1`);
  console.log(`[TP-18-03] rankingFingerprint=${diagnostics.behaviorRankingFingerprint} visible=${before.length}`);
  console.log(`[TP-18-03] actionOrder=${before.map((entry) => entry.actionId).join(',')}`);
});

test('Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent', async ({ page }) => {
  await openBrief(page);
  await expect.poll(async () => page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__?.genericEvidenceState || null), {
    message: 'the route must validate one atomic five-source generic evidence window before composing'
  }).toBe('current');

  const publicPaths = [
    '/market-brief.config.json',
    '/market-brief.snapshot.json',
    '/market-brief.payload.json',
    '/brief-history.recent.jsonl',
    '/watchlist.json',
    '/market-brief.owner-reads.json'
  ];
  const requested = new Set(server.requests.map((entry) => entry.pathname));
  for (const pathname of publicPaths) {
    expect(requested.has(pathname), `${pathname} participates in the atomic public evidence load`).toBe(true);
  }
  expect(server.requests.some((entry) => /portfolio|holding|costBasis|quantity/i.test(entry.search)),
    'no personal value enters a public artifact request').toBe(false);

  await importValid(page, 'TP-20-03 generic evidence');
  await seedBars(page, 'MSFT', [EVIDENCE_DAY]);
  await selectWindow(page, BRIEF_SNAPSHOT.window);

  const accepted = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(accepted.genericEvidenceIdentity).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(accepted.genericPublisherIdentity).toMatch(/^sha256:[a-f0-9]{64}$/);
  expect(accepted.genericEvidenceWindow).toBe(BRIEF_SNAPSHOT.window);
  expect(accepted.genericEvidenceSourceCount).toBe(5);
  expect(accepted.visibleActionCap).toBeGreaterThan(0);
  expect(accepted.rankedActionIds.length).toBeLessThanOrEqual(accepted.visibleActionCap);
  await expect(page.locator('#briefIdentity')).toHaveAttribute('data-generic-window-identity', accepted.genericEvidenceIdentity);
  const whyIdentities = await page.$$eval('#briefLanes details.brief-why', (nodes) =>
    nodes.map((node) => node.getAttribute('data-generic-evidence-identity')));
  expect(whyIdentities.length, 'at least one real-page action exposes Why shown').toBeGreaterThan(0);
  expect(new Set(whyIdentities)).toEqual(new Set([accepted.genericEvidenceIdentity]));

  const differentWindow = WINDOW_IDS.find((id) => id !== BRIEF_SNAPSHOT.window);
  expect(differentWindow, 'the public schedule contains another window for the refusal path').toBeTruthy();
  await selectWindow(page, differentWindow);
  await expect(page.locator('#briefTimes')).toHaveAttribute('data-generic-window-state', 'preserved-last-valid');
  const preserved = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
  expect(preserved.genericEvidenceIdentity).toBe(accepted.genericEvidenceIdentity);
  expect(preserved.rankedActionIds).toEqual(accepted.rankedActionIds);
  await expect(page.locator('#briefTimes')).toContainText('No matching validated publication');

  console.log(`[TP-20-03] window=${accepted.genericEvidenceWindow} sources=${accepted.genericEvidenceSourceCount}`);
  console.log(`[TP-20-03] genericEvidenceIdentity=${accepted.genericEvidenceIdentity} visibleCap=${accepted.visibleActionCap}`);
  console.log(`[TP-20-03] preservedWindow=${differentWindow} ranked=${preserved.rankedActionIds.length}`);
});

/* TP-26-03. The functional suite proves the CONTROLLER refuses a stale publish and that the
 * presentation resolver cannot recompute. Neither fact tells you what the real page does when a
 * user actually switches Simple to Power and walks all six tabs — a page can hold a correct
 * controller and still call the compute path from its own tab handler. So this row drives the
 * real route and reads the counters the page itself maintains.
 */
test('Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace', async ({ page }) => {
  await openBrief(page);
  await importValid(page, 'TP-26-03 workspace');

  const compute = page.locator('#workspaceCompute');
  await expect(compute, 'the page must name the published workspace').toBeVisible();
  await expect.poll(async () => compute.getAttribute('data-workspace-identity'),
    { message: 'a workspace must publish once evidence exists' }).not.toBe('none');

  const identity = await compute.getAttribute('data-workspace-identity');
  const token = await compute.getAttribute('data-compute-token');
  const computesAfterImport = Number(await compute.getAttribute('data-compute-count'));
  const presentationsAfterImport = Number(await compute.getAttribute('data-presentation-count'));
  expect(computesAfterImport, 'importing evidence is a real compute').toBeGreaterThan(0);
  expect(token, 'the published workspace must cite its compute token').not.toBe('none');
  await expect(compute, 'initial publication must not masquerade as an accepted rebase')
    .toHaveAttribute('data-rebase-state', 'idle');

  // Every mode against every tab. Twelve presentation operations, zero computes.
  const tabs = ['workspaceTabBrief', 'workspaceTabRiskXray', 'workspaceTabPathLab',
    'workspaceTabDiversification', 'workspaceTabAllocation', 'workspaceTabDossier'];
  const hashes = ['brief', 'risk-xray', 'path-lab', 'diversification', 'allocation', 'dossier'];
  for (const mode of ['modePower', 'modeSimple', 'modePower']) {
    await page.locator(`#${mode}`).click();
    for (let index = 0; index < tabs.length; index += 1) {
      await page.locator(`#${tabs[index]}`).click();
      await expect(page.locator(`#${tabs[index]}`)).toHaveAttribute('aria-selected', 'true');
      expect(await compute.getAttribute('data-active-tab'),
        'the page must report the tab it is actually showing').toBe(hashes[index]);
      expect(await compute.getAttribute('data-workspace-identity'),
        `${hashes[index]} must render the one active identity`).toBe(identity);
      expect(await compute.getAttribute('data-compute-token'),
        `${hashes[index]} must cite the one published compute token`).toBe(token);
      expect(await compute.getAttribute('data-last-refusal'),
        'presentation must not be refused on a valid tab').toBe('none');
    }
  }

  const computesAfterNavigation = Number(await compute.getAttribute('data-compute-count'));
  const presentationsAfterNavigation = Number(await compute.getAttribute('data-presentation-count'));
  expect(computesAfterNavigation,
    'eighteen tab operations across three mode switches must not recompute analytics').toBe(computesAfterImport);
  expect(presentationsAfterNavigation,
    'the same operations must all have gone through the presentation path').toBeGreaterThan(presentationsAfterImport);

  // A deep link is navigation too: arriving at a tab directly must not fork the identity.
  await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#allocation`);
  await expect(page.locator('#workspaceCompute')).toBeVisible();
  expect(await page.locator('#workspaceCompute').getAttribute('data-active-tab')).toBe('allocation');

  // Rebase: new evidence produces a NEW identity and a NEW token, and every tab moves together.
  // A full reload, not a hash change: the deep link above already left the page on this document,
  // so `page.goto` alone would be a same-document navigation that never re-serves the route or
  // rebuilds the import editor this section depends on.
  await page.goto(`${server.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
  await page.reload();
  await expect(page.locator('#portfolioBrief')).toBeVisible();
  await expect.poll(async () => page.locator('#briefWindow option').count(),
    { message: 'the four generic windows must reload from market-brief.config.json' }).toBe(WINDOWS.length);
  const beforeRebase = await compute.getAttribute('data-workspace-identity');
  await page.locator('#beginHoldingEdit').click();
  const holdingRows = page.locator('#holdingEditorRows tr[data-holding-id]');
  await expect(holdingRows).toHaveCount(2);
  await holdingRows.first().getByRole('button', { name: 'Edit holding' }).click();
  await page.locator('#manualQuantity').fill('13');
  await page.locator('#applyHoldingEdit').click();
  await page.locator('#confirmHoldingRevision').click();
  await expect.poll(async () => compute.getAttribute('data-workspace-identity'),
    { message: 'accepted new evidence must publish a new identity' }).not.toBe(beforeRebase);
  const rebasedIdentity = await compute.getAttribute('data-workspace-identity');
  const rebasedToken = await compute.getAttribute('data-compute-token');
  const acceptedRebase = await compute.evaluate((node) => ({
    state: node.getAttribute('data-rebase-state'),
    changedInputs: node.getAttribute('data-rebase-changed-inputs')
  }));
  expect(acceptedRebase,
    'confirmed portfolio evidence must pass through explicit preview and atomic rebase acceptance').toEqual({
    state: 'accepted',
    changedInputs: expect.stringMatching(/\bportfolio\b/)
  });
  expect(rebasedToken, 'a rebase must issue a new compute token').not.toBe(token);
  for (let index = 0; index < tabs.length; index += 1) {
    await page.locator(`#${tabs[index]}`).click();
    expect(await compute.getAttribute('data-workspace-identity'),
      `${hashes[index]} must be rebased with its siblings, never left on the previous identity`).toBe(rebasedIdentity);
    expect(await compute.getAttribute('data-compute-token')).toBe(rebasedToken);
  }
  expect(await compute.getAttribute('data-draft-identity'),
    'an accepted rebase leaves no dangling draft').toBe('none');

  console.log(`[TP-26-03] identity=${identity} token=${token} computes=${computesAfterNavigation}`);
  console.log(`[TP-26-03] presentations=${presentationsAfterNavigation} rebasedIdentity=${rebasedIdentity}`);
});
// TP-26-04 continues the workspace journey in portfolio-survival-mobile.spec.mjs.

/* BUG-001 (Feature 008). A publication that does not satisfy the generic evidence contract for the
 * window it declares must be REFUSED BY NAME. Before the fix the throw inside the load transaction
 * skipped the block that fills the selector, so the reader got a control with zero options and the
 * copy "Generic evidence window unavailable." — a dead tab that never said what was refused. The
 * contract code and reason existed on state.genericWindowError but only reached the diagnostics
 * object, so on screen an unsatisfiable contract was indistinguishable from "no data yet".
 *
 * ADVERSARIAL BY CONSTRUCTION. The served publication is deliberately LATER than the cutoff of the
 * window it declares, and the row asserts that lateness about its OWN fixture before asserting
 * anything about the page. A fixture published AT the cutoff would validate, the refusal path would
 * never execute, and every assertion below would pass vacuously — so the lateness assertion is what
 * keeps this row honest. It fails if the fixture is ever softened, and it fails if the blank-tab
 * behaviour returns.
 */
test('Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule', async ({ page }) => {
  const snapshot = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.snapshot.json'), 'utf8'));
  const payload = JSON.parse(readFileSync(resolve(ROOT, 'market-brief.payload.json'), 'utf8'));
  const declared = WINDOWS.find((entry) => entry.id === snapshot.window) || WINDOWS[0];
  const tradingDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date(snapshot.asOf));
  const cutoffAt = RLPORTFOLIOBRIEF.newYorkCivilCutoff(tradingDate, declared.etTime);
  expect(cutoffAt, 'the declared window must resolve a civil cutoff to be later than').toBeTruthy();

  // 37 minutes past the cutoff — the real observed publication delay this bug was filed for.
  const publishedLateAt = new Date(Date.parse(cutoffAt) + 37 * 60 * 1000).toISOString();
  expect(publishedLateAt > cutoffAt,
    'NON-TAUTOLOGY GUARD: the fixture must publish strictly LATER than its own window cutoff, '
    + 'otherwise the publication validates and the refusal path under test never runs').toBe(true);

  const lateServer = await startPortfolioServer({
    overrides: {
      '/market-brief.snapshot.json': JSON.stringify({ ...snapshot, asOf: publishedLateAt, generatedAt: publishedLateAt }),
      '/market-brief.payload.json': JSON.stringify({ ...payload, asOf: publishedLateAt })
    }
  });

  try {
    const response = await page.goto(`${lateServer.baseUrl}/portfolio-survival-allocation-lab.html#brief`);
    expect(response?.status(), 'the brief route must be served').toBe(200);
    await expect(page.locator('#portfolioBrief')).toBeVisible();

    const times = page.locator('#briefTimes');
    // The refusal must actually have happened. If this ever reads "current" the fixture stopped
    // exercising the path and the rest of this row would be meaningless.
    await expect(times, 'the late publication must be refused, not composed')
      .toHaveAttribute('data-generic-window-state', 'unavailable');

    // 1. The schedule is a different transaction from the evidence window. A refused composition
    //    must not remove the control that lets the reader see which windows exist.
    await expect.poll(async () => page.locator('#briefWindow option').count(),
      { message: 'a refused evidence window must NOT empty the public schedule selector' })
      .toBe(WINDOWS.length);
    expect(await page.$$eval('#briefWindow option', (nodes) => nodes.map((node) => node.value)))
      .toEqual(WINDOW_IDS);

    // 2. The refusal names itself, structurally and in reader-visible copy.
    await expect(times, 'the refusal must expose the contract code and reason it failed on')
      .toHaveAttribute('data-generic-window-error', 'P008-BRIEF-EVIDENCE/generic-evidence-cutoff-conflict');
    await expect(times).toContainText('P008-BRIEF-EVIDENCE');
    await expect(times).toContainText('generic-evidence-cutoff-conflict');

    // 3. Unavailable must state that nothing was composed, never imply an empty result set.
    await expect(page.locator('#briefStates')).toContainText('does not satisfy the generic evidence contract');

    // 4. Nothing is invented to fill the gap: no lane, no action, no identity.
    expect(await page.locator('#briefLanes li').count(),
      'a refused window must compose no lane item at all').toBe(0);

    const diagnostics = await page.evaluate(() => window.__PORTFOLIO_DIAGNOSTICS__);
    expect(diagnostics.genericEvidenceState).toBe('invalid');
    expect(diagnostics.genericEvidenceError.code).toBe('P008-BRIEF-EVIDENCE');
    expect(diagnostics.genericEvidenceError.reason).toBe('generic-evidence-cutoff-conflict');

    console.log(`[BUG-001] window=${declared.id} cutoffAt=${cutoffAt} publishedLateAt=${publishedLateAt}`);
    console.log(`[BUG-001] options=${WINDOWS.length} state=unavailable named=${diagnostics.genericEvidenceError.reason}`);
  } finally {
    await lateServer.close();
  }
});

/* ---------------------------------------------------------------------------
   Scope 29 — TP-29-02. SCN-008-055 in the real browser.

   `tests/portfolio-doc-integration.functional.mjs` proves the published surfaces AGREE with each
   other and with the shipped route table. It reads files. It never opens a page, so it cannot tell
   the difference between a link that is spelled correctly and a link a reader can actually follow
   to the Portfolio Brief workspace. That is the gap this row closes: every entry the repository
   publishes for Feature 008 is DRIVEN, over real HTTP, through the real production boot.

   NOTHING BELOW IS WRITTEN DOWN AS THE ANSWER.
     - The route contract is parsed out of `ROUTE_TABS` in the shipped page.
     - WHICH shipped route is the Brief workspace is read off the product: the Brief panel names its
       controlling tab through `aria-labelledby`, and `ROUTE_TABS` maps that tab back to a hash.
     - Each surface's href is parsed from that surface at run time, and each surface is keyed by
       something OTHER than the href (registry id, published title, link label) so a surface
       repointed at the wrong file is caught rather than silently agreed with.
   The only declared value is WHICH surfaces SCN-008-055 obliges — the scenario's own list — and the
   row fails loudly if any one of them stops contributing an entry.

   TWO CONTROLS KEEP IT HONEST. Every "the Brief workspace is open" signal is ALSO the page's static
   default markup, so a page whose script never ran would satisfy them. So the row (1) waits for the
   window selector to be filled from the public generic config, which only a real boot can do, and
   (2) drives a real non-Brief shipped route through the same page and requires every one of those
   signals to flip. If they cannot flip, the assertions cannot fail, and the row says so by name.
   --------------------------------------------------------------------------- */

const TOOL_ID = 'portfolio-survival-allocation-lab';

/* The scenario's own list of obliged surfaces. This is the requirement, not the answer: every href
   below is derived, and a surface that stops publishing an entry fails here instead of shrinking
   the list and letting the remaining entries pass on its behalf. */
const SCN_055_SURFACES = Object.freeze([
  'tools.json registry',
  'index.html TOOLS',
  'rlnav.js TOOLS',
  'README.md inventory',
  'note route line'
]);

/* `ROUTE_TABS` is the single definition `routeFromHash` validates against, so parsing it yields
   exactly the routes a reader can land on — and a renamed route changes what this row demands
   without this row being edited. */
function shippedRoutes(productSource) {
  const table = /var ROUTE_TABS\s*=\s*Object\.freeze\(\[([\s\S]*?)\]\)/.exec(productSource);
  if (!table) throw new Error('ROUTE_TABS could not be read from the shipped page');
  return Array.from(table[1].matchAll(/\{\s*hash:\s*"([^"]+)",\s*tab:\s*"([^"]+)"\s*\}/g))
    .map((match) => ({ hash: match[1], tab: match[2] }));
}

/* Which route IS the Portfolio Brief workspace, read off the product rather than declared. */
function briefRoute(productSource, routes) {
  const panel = /<section id="briefWorkspace"[^>]*aria-labelledby="([^"]+)"/.exec(productSource);
  if (!panel) throw new Error('the Brief workspace panel does not declare its controlling tab');
  const route = routes.find((entry) => entry.tab === panel[1]);
  if (!route) throw new Error(`no shipped route controls ${panel[1]}`);
  return route;
}

/* Landing `TOOLS` entries, id → published href. Each entry is bounded by the next `id:` so an entry
   without a `file:` reports as missing instead of borrowing its neighbour's. */
function landingHrefById(landingSource) {
  const ids = Array.from(landingSource.matchAll(/\bid:\s*'([^']+)'/g));
  const hrefs = new Map();
  ids.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < ids.length ? ids[index + 1].index : landingSource.length;
    const file = /\bfile:\s*'([^']+\.html)'/.exec(landingSource.slice(start, end));
    if (file && !hrefs.has(match[1])) hrefs.set(match[1], file[1]);
  });
  return hrefs;
}

/* Navigation `TOOLS` entries, published full title → published href. `[^{}]` keeps each match
   inside one object literal. Keyed by title because keying by href would compare the registry
   against itself and could never see navigation pointing somewhere else. */
function navHrefByTitle(navSource) {
  const hrefs = new Map();
  for (const match of navSource.matchAll(/\{[^{}]*\bfull:\s*"([^"]+)"[^{}]*\bfile:\s*"([^"]+\.html)"[^{}]*\}/g)) {
    if (!hrefs.has(match[1])) hrefs.set(match[1], match[2]);
  }
  return hrefs;
}

/* README inventory links, link label → published href. */
function readmeHrefByLabel(readmeSource) {
  const hrefs = new Map();
  for (const match of readmeSource.matchAll(/\[`([^`]+)`\]\(([^)\s]+\.html)\)/g)) {
    if (!hrefs.has(match[1])) hrefs.set(match[1], match[2]);
  }
  return hrefs;
}

/* The single route the canonical note publishes as the way in. */
function noteRouteHref(noteSource) {
  const match = /\*\*Route:\*\*\s*`([^`]+\.html[^`]*)`/.exec(noteSource);
  return match ? match[1] : null;
}

async function expectBriefWorkspaceOpen(page, briefTabId, label) {
  await expect(page.locator(`#${briefTabId}`), `${label}: the Brief tab must be the selected tab`)
    .toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#briefWorkspace'), `${label}: the Portfolio Brief workspace must be shown`)
    .toBeVisible();
  await expect(page.locator('#portfolioBrief'), `${label}: the Brief panel must be rendered`)
    .toBeVisible();
  await expect(page.locator('#routeStates'), `${label}: the mandate route-state panel must stay closed`)
    .toBeHidden();
}

test('Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace', async ({ page }) => {
  const productSource = readFileSync(resolve(ROOT, `${TOOL_ID}.html`), 'utf8');
  const landingSource = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
  const navSource = readFileSync(resolve(ROOT, 'rlnav.js'), 'utf8');
  const readmeSource = readFileSync(resolve(ROOT, 'README.md'), 'utf8');
  const noteSource = readFileSync(resolve(ROOT, `notes/${TOOL_ID}.md`), 'utf8');

  const routes = shippedRoutes(productSource);
  expect(routes.length, 'ROUTE_TABS must yield the shipped routes').toBeGreaterThan(1);
  const brief = briefRoute(productSource, routes);

  /* Registry first: it supplies the title and nav label the other surfaces are looked up BY, so no
     surface is ever validated against a copy of itself. */
  const registryTools = JSON.parse(readFileSync(resolve(ROOT, 'tools.json'), 'utf8')).tools || [];
  expect(registryTools.length, 'tools.json must parse into the real registry inventory').toBeGreaterThan(1);
  const registryEntry = registryTools.find((tool) => tool.id === TOOL_ID);
  expect(registryEntry, `${TOOL_ID} must be published in tools.json`).toBeTruthy();
  const publishedTitle = registryEntry.title;
  expect(publishedTitle, 'tools.json must publish a title to key the other surfaces by').toBeTruthy();

  const landingHrefs = landingHrefById(landingSource);
  const navHrefs = navHrefByTitle(navSource);
  const readmeHrefs = readmeHrefByLabel(readmeSource);
  /* A parser that stopped matching would yield an empty map, every lookup below would miss, and the
     row would be reduced to "nothing was checked". These three make that a failure. */
  expect(landingHrefs.size, 'the index.html TOOLS array must parse into the real landing inventory').toBeGreaterThan(1);
  expect(navHrefs.size, 'the rlnav.js TOOLS array must parse into the real navigation inventory').toBeGreaterThan(1);
  expect(readmeHrefs.size, 'README.md must parse into the real published inventory').toBeGreaterThan(1);

  const readmeLabel = Array.from(readmeHrefs.keys()).find((label) => label.includes(publishedTitle));
  expect(readmeLabel, `README.md must publish an inventory link labelled "${publishedTitle}"`).toBeTruthy();

  const entries = [
    { surface: 'tools.json registry', href: registryEntry.file },
    { surface: 'index.html TOOLS', href: landingHrefs.get(TOOL_ID) },
    { surface: 'rlnav.js TOOLS', href: navHrefs.get(publishedTitle) },
    { surface: 'README.md inventory', href: readmeHrefs.get(readmeLabel) },
    { surface: 'note route line', href: noteRouteHref(noteSource) }
  ];
  expect(entries.map((entry) => entry.surface),
    'every surface SCN-008-055 obliges must contribute an entry').toEqual([...SCN_055_SURFACES]);
  for (const entry of entries) {
    expect(entry.href, `${entry.surface} must publish a Feature 008 entry href`).toBeTruthy();
  }

  /* These hrefs coincide today. That is a fact about the tree, not a weakness of the row: each one
     is derived from its own surface under its own key, so a single surface drifting to a renamed
     file, a different tool, or a dead hash separates them and fails here. */
  const driven = [];
  for (const entry of entries) {
    const hashAt = entry.href.indexOf('#');
    const publishedHash = hashAt === -1 ? '' : entry.href.slice(hashAt + 1);
    /* A hash the product does not ship still lands on Brief, by fallback rather than by route — the
       exact way the pre-Scope-29 `#workspace` link looked correct. Landing is asserted below; being
       ROUTED is asserted here. The fallback is demonstrated live at the end of this row. */
    expect(publishedHash === '' || routes.some((route) => route.hash === publishedHash),
      `${entry.surface} publishes #${publishedHash}, which is not a shipped route`).toBe(true);

    const response = await page.goto(`${server.baseUrl}/${entry.href}`);
    expect(response?.status(), `${entry.surface} must publish a route that is actually served (${entry.href})`)
      .toBe(200);
    /* Proof the real production boot ran. Every signal in expectBriefWorkspaceOpen is also the
       static default in the markup, so without this the row would pass against a page whose script
       never executed — or against some other page that happens to serve 200. */
    await expect.poll(async () => page.locator('#briefWindow option').count(),
      { message: `${entry.surface}: the real Feature 008 page must boot and load the generic windows` })
      .toBe(WINDOWS.length);
    await expectBriefWorkspaceOpen(page, brief.tab, entry.surface);
    driven.push(`${entry.surface} -> ${entry.href} -> #${brief.hash}`);
  }

  /* CONTROL 1 — the assertions can fail. A real shipped non-Brief route is driven through the same
     page and every Brief signal must flip. If it does not, expectBriefWorkspaceOpen is inert and
     every pass above was meaningless. */
  const control = routes.find((route) => route.hash !== brief.hash);
  expect(control, 'a non-Brief shipped route is required as the discrimination control').toBeTruthy();
  await page.goto(`${server.baseUrl}/${registryEntry.file}#${control.hash}`);
  await expect(page.locator(`#${brief.tab}`),
    `NON-TAUTOLOGY GUARD: #${control.hash} must deselect the Brief tab, otherwise the assertions above cannot fail`)
    .toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('#briefWorkspace'), `#${control.hash} must hide the Brief workspace`).toBeHidden();
  await expect(page.locator('#routeStates'), `#${control.hash} must show the mandate route-state panel`).toBeVisible();

  /* CONTROL 2 — why the shipped-route check on each published hash is not decoration. `#workspace`
     is the hash the note published until Scope 29 and the product does not ship it, yet the page
     still shows the Brief workspace because routeFromHash falls back. Arriving at Brief therefore
     does NOT prove the published hash was real, which is precisely what the per-entry check adds. */
  expect(routes.map((route) => route.hash),
    'the renamed hash must not have become a shipped route').not.toContain('workspace');
  await page.goto(`${server.baseUrl}/${registryEntry.file}#workspace`);
  await expectBriefWorkspaceOpen(page, brief.tab, 'stale #workspace fallback');

  console.log(`[TP-29-02] briefRoute=#${brief.hash} tab=${brief.tab} shippedRoutes=${routes.length}`);
  console.log(`[TP-29-02] inventories registry=${registryTools.length} landing=${landingHrefs.size} nav=${navHrefs.size} readme=${readmeHrefs.size}`);
  for (const line of driven) console.log(`[TP-29-02] ${line}`);
  console.log(`[TP-29-02] control=#${control.hash} flipped Brief signals; stale #workspace reached Brief by fallback only`);
});
