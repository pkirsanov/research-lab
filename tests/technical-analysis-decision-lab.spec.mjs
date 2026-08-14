import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};
const CLOCK = '2026-07-15T18%3A00%3A00.000Z';
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    if (typeof request.url !== 'string') {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('request URL required');
      return;
    }
    const requestPath = decodeURIComponent(request.url.split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    const extension = extname(filePath);
    if (!Object.hasOwn(MIME, extension)) {
      response.writeHead(415, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('unsupported static resource type');
      return;
    }
    response.writeHead(200, {
      'content-type': MIME[extension],
      'cache-control': 'no-store'
    });
    createReadStream(filePath).pipe(response);
  });
  await new Promise((resolveReady) => server.listen(0, '127.0.0.1', resolveReady));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((resolveClosed, rejectClosed) => {
    server.close((error) => error ? rejectClosed(error) : resolveClosed());
    server.closeAllConnections?.();
  });
});

test('Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  const response = await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=us-equity-4h-core&clock=${CLOCK}`);
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#profileName')).toHaveText('U.S. equity classic 4h core-only');
  await expect(page.locator('#sessionPolicy')).toContainText('09:30-16:00 America/New_York');
  await expect(page.locator('#aggregationPolicy')).toContainText('240m + 150m remainder');
  await expect(page.locator('#partialPolicy')).toContainText('partial and non-confirming');
  await expect(page.locator('#resultReceipt')).toContainText('No signal, neutral, setup, or probability is published by Scope 01');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('us-equity-4h-core');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.profile.segments.map((segment) => segment.minutes)).toEqual([240, 150]);
  expect(diagnostics.profile.segments[1].status).toBe('partial');
  expect(diagnostics.profile.segments[1].confirming).toBe(false);
  expect(diagnostics.profile.variantId).toMatch(/^tad-variant:[a-f0-9]{64}$/);
  expect(requestedPaths).toContain('/technical-analysis-decision-universe.json');
  expect(requestedPaths).toContain('/tests/fixtures/technical-analysis-decision/source-qualified/us-equity-sessions.json');
  console.log('[SCN-007-005] session=09:30-16:00 America/New_York');
  console.log('[SCN-007-005] segments=240,150');
  console.log('[SCN-007-005] remainder=partial/non-confirming');
  console.log(`[SCN-007-005] variant=${diagnostics.profile.variantId}`);
  console.log('[SCN-007-005] ownerReadPublished=false');
});

test('Regression: SCN-007-006 continuous-market four-hour profile has equal session boundaries', async ({ page }) => {
  const response = await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=continuous-4h&clock=${CLOCK}`);
  expect(response && response.ok()).toBeTruthy();
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#profileName')).toHaveText('Continuous-market 4h');
  await expect(page.locator('#sessionPolicy')).toContainText('00:00-24:00 UTC');
  await expect(page.locator('#aggregationPolicy')).toContainText('6 x 240m equal bars');
  await expect(page.locator('#partialPolicy')).toContainText('No unequal stock-session remainder');
  await expect(page.locator('#primaryRole')).toContainText('Primary 1w');
  await expect(page.locator('#setupRole')).toContainText('Setup 1d');
  await expect(page.locator('#triggerRole')).toContainText('Trigger 4h');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('continuous-4h');
  expect(diagnostics.profile.segments).toHaveLength(6);
  expect(diagnostics.profile.segments.every((segment) => segment.minutes === 240 && segment.status === 'closed')).toBeTruthy();
  expect(diagnostics.profile.qualityFlags).not.toContain('US_EQUITY_PARTIAL_SESSION');
  console.log('[SCN-007-006] session=00:00-24:00 UTC');
  console.log('[SCN-007-006] segments=240,240,240,240,240,240');
  console.log('[SCN-007-006] partialWarning=false');
  console.log('[SCN-007-006] roles=1w/1d/4h');
  console.log('[SCN-007-006] ownerReadPublished=false');
});

test('Regression: SCN-007-007 provisional weekly break never rewrites confirmed history', async ({ page }) => {
  const url = `${baseUrl}/technical-analysis-decision-lab.html?fixture=provisional-week&clock=${CLOCK}`;
  await page.goto(url);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#confirmedWeekly')).toContainText('week-2026-07-10');
  await expect(page.locator('#provisionalWeekly')).toContainText('week-2026-07-17');
  await expect(page.locator('#weeklyReceipt')).toContainText('Open weekly evidence is provisional');
  const beforeReload = await page.evaluate(() => window.__TAD_DIAGNOSTICS__.weekly);
  expect(beforeReload.confirmedBarId).toBe('week-2026-07-10');
  expect(beforeReload.provisionalBarId).toBe('week-2026-07-17');
  expect(beforeReload.provisionalStatus).toBe('provisional');
  await page.reload();
  await expect(page.locator('#confirmedWeekly')).toContainText('week-2026-07-10');
  const afterReload = await page.evaluate(() => window.__TAD_DIAGNOSTICS__.weekly);
  expect(afterReload).toEqual(beforeReload);
  console.log('[SCN-007-007] confirmed=week-2026-07-10');
  console.log('[SCN-007-007] provisional=week-2026-07-17');
  console.log('[SCN-007-007] provisionalStatus=provisional');
  console.log('[SCN-007-007] reloadConfirmedUnchanged=true');
  console.log('[SCN-007-007] ownerReadPublished=false');
});

test('Regression: SCN-007-030 failed delta refresh preserves cached source-qualified truth', async ({ page }) => {
  const responses = [];
  page.on('response', (response) => responses.push({ path: new URL(response.url()).pathname, status: response.status() }));
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=cached-refresh-failure&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED HISTORICAL');
  await expect(page.locator('#truthState')).toHaveText('STALE');
  await expect(page.locator('#cachedTruth')).toContainText('Last source-qualified close: 127.40');
  await expect(page.locator('#cachedTruth')).toContainText('age 26h');
  await expect(page.locator('#failedResource')).toContainText('missing-delta.json');
  await expect(page.locator('#requiredSource')).toContainText('source-qualified 65m delta');
  await expect(page.locator('#refreshReceipt')).toContainText('Cached value remains stale; unavailable tactical evidence contributes no neutral value');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('cached-refresh-failure');
  expect(diagnostics.refresh.httpStatus).toBe(404);
  expect(diagnostics.refresh.cachedClose).toBe(127.4);
  expect(diagnostics.refresh.truthState).toBe('stale');
  expect(diagnostics.refresh).not.toHaveProperty('neutralEvidence');
  expect(responses).toContainEqual({ path: '/tests/fixtures/technical-analysis-decision/invalid/missing-delta.json', status: 404 });
  console.log('[SCN-007-030] deltaStatus=404');
  console.log('[SCN-007-030] cachedClose=127.40');
  console.log('[SCN-007-030] exactAge=26h');
  console.log('[SCN-007-030] truth=STALE');
  console.log('[SCN-007-030] neutralEvidence=omitted');
});

// The page has two different kinds of surface and they must be scanned differently.
// The READING surface is where the tool states what it found; it may never assert an actor,
// a motive, resting liquidity, a universal edge, or a setup. The DISCLOSURE surface (the claim
// ledger and the rejection probe) has to be able to NAME those same forbidden ideas, because
// naming them is how it reports that they are rejected. Banning the words everywhere would
// make the tool fail for being honest, so the ban applies to the reading surface only.
const READING_SURFACE = ['#techniqueReceipt', '#techniqueOutcomes', '#independenceReceipt', '#evidenceFamilies', '#competingHypotheses', '#setupReceipt', '#resultReceipt', '#observedState', '#requiredState', '#actionState'];
async function readingSurfaceText(page) {
  const parts = [];
  for (const selector of READING_SURFACE) parts.push(await page.locator(selector).innerText());
  return parts.join('\n').replace(/\s+/g, ' ');
}
async function normalizedText(page, selector) {
  return (await page.locator(selector).innerText()).replace(/\s+/g, ' ');
}

test('Regression: SCN-007-009 breakout volume supports one proxy family without actor identity', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=breakout-participation&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'breakout-participation');
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - ANALYTIC DETERMINISTIC');

  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  const participation = diagnostics.techniques.filter((technique) => technique.familyId === 'participation-proxy');
  // Every participation transform must read, and each must carry its OHLCV proxy boundary.
  expect(participation).toHaveLength(4);
  expect(participation.every((technique) => technique.ok)).toBeTruthy();
  expect(participation.every((technique) => technique.metrics.proxy === 'ohlcv-volume-transform')).toBeTruthy();
  expect(participation.every((technique) => technique.metrics.actorIdentified === false)).toBeTruthy();
  const relativeVolume = participation.find((technique) => technique.techniqueId === 'relative-volume/v1');
  expect(relativeVolume.status).toBe('expanding');
  expect(relativeVolume.metrics.ratio).toBeGreaterThan(1);

  // Four correlated methods are worth exactly one independent vote.
  const family = diagnostics.families.find((entry) => entry.familyId === 'participation-proxy');
  expect(family.methodCount).toBe(4);
  expect(family.clusterCount).toBe(1);
  expect(family.supports).toBe(1);
  expect(family.state).toBe('supports');

  // The visible page, not just the diagnostics object, must state the proxy boundary and name no actor.
  const outcomesText = await normalizedText(page, '#techniqueOutcomes');
  expect(outcomesText).toContain('No participant identity is inferred');
  expect(await readingSurfaceText(page)).not.toMatch(/institution|smart money|whale|dark pool|accumulating by|who is buying/i);
  console.log(`[SCN-007-009] participationMethods=${family.methodCount} clusterVotes=${family.clusterCount}`);
  console.log(`[SCN-007-009] relativeVolume=${relativeVolume.status} ratio=${relativeVolume.metrics.ratio.toFixed(3)}`);
  console.log('[SCN-007-009] actorIdentified=false');
  console.log('[SCN-007-009] proxy=ohlcv-volume-transform');
  console.log(`[SCN-007-009] familyState=${family.state}`);
});

test('Regression: SCN-007-010 correlated indicators count once and raw count is not confidence', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=correlated-uptrend&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'correlated-uptrend');

  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  const byId = (id) => diagnostics.techniques.find((technique) => technique.techniqueId === id);
  // The premise of the scenario: these correlated transforms all read positive at once.
  expect(byId('sma-stack/v1').status).toBe('stacked-up');
  expect(byId('ema-stack/v1').status).toBe('stacked-up');
  expect(byId('macd/v1').status).toBe('positive');
  expect(byId('adx-dmi/v1').status).toBe('strong-plus');

  // SMA and EMA are one cluster and cast one vote between them.
  const movingAverage = diagnostics.clusters.find((cluster) => cluster.clusterId === 'moving-average');
  expect(movingAverage.members.sort()).toEqual(['ema-stack/v1', 'sma-stack/v1']);
  expect(movingAverage.memberCount).toBe(2);
  expect(Math.abs(movingAverage.vote)).toBe(1);

  // MACD and RSI stay in their own declared clusters rather than merging.
  expect(byId('macd/v1').clusterId).toBe('ema-momentum');
  expect(byId('rsi-wilder/v1').clusterId).toBe('bounded-momentum');

  // Raw methods must exceed independent votes, and both must be visible to the reader.
  const rawMethods = Number(await page.locator('#rawMethodCount').innerText());
  const clusterVotes = Number(await page.locator('#independentClusterCount').innerText());
  expect(rawMethods).toBe(15);
  expect(clusterVotes).toBeLessThan(rawMethods);
  expect(await normalizedText(page, '#largestCluster')).toContain('casts one vote');
  expect(await normalizedText(page, '#independenceReceipt')).toContain('not a confidence level');

  // A raw count must never be dressed up as a confidence or probability.
  const readingText = await readingSurfaceText(page);
  expect(readingText).not.toMatch(/\b\d+\s*(of|\/)\s*\d+\s*(indicators?\s*)?(agree|confidence)/i);
  expect(readingText).not.toMatch(/confidence[:\s]*\d+\s*%/i);
  console.log(`[SCN-007-010] rawMethods=${rawMethods} independentClusterVotes=${clusterVotes}`);
  console.log(`[SCN-007-010] movingAverageMembers=${movingAverage.members.join(',')} vote=${movingAverage.vote}`);
  console.log('[SCN-007-010] macdCluster=ema-momentum rsiCluster=bounded-momentum');
  console.log('[SCN-007-010] countPresentedAsConfidence=false');
  console.log('[SCN-007-010] rawMethodsInspectable=true');
});

test('Regression: SCN-007-011 unresolved range preserves competing phase hypotheses and no long trigger', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=unresolved-range&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'unresolved-range');

  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  // The range has not resolved: no confirmed pivot break exists.
  const pivots = diagnostics.techniques.find((technique) => technique.techniqueId === 'closing-pivots/v1');
  expect(pivots.status).not.toBe('reversal-confirmed');
  expect(pivots.status).not.toBe('break-candidate');

  // Competing readings must remain visible rather than being resolved into one story.
  const trend = diagnostics.families.find((entry) => entry.familyId === 'trend-filters');
  expect(trend.supports).toBeGreaterThan(0);
  expect(trend.contradicts).toBeGreaterThan(0);
  expect(trend.state).toBe('unstable');
  const hypotheses = await normalizedText(page, '#competingHypotheses');
  expect(hypotheses).toContain('remain visible and are not resolved away');
  expect(hypotheses).toContain('trend-filters');

  // Nothing here may become a setup, a trigger, or a probability.
  expect(diagnostics.setupPublished).toBe(false);
  expect(diagnostics.probabilityPublished).toBe(false);
  const setupReceipt = await normalizedText(page, '#setupReceipt');
  expect(setupReceipt).toContain('publishes no setup, entry, trigger, target, stop, or probability');
  expect(await readingSurfaceText(page)).not.toMatch(/accumulation (is|has) (confirmed|complete)|buy (now|here)|long (entry|trigger) at|enter long/i);
  console.log(`[SCN-007-011] pivotState=${pivots.status}`);
  console.log(`[SCN-007-011] trendFilters=${trend.state} supports=${trend.supports} contradicts=${trend.contradicts}`);
  console.log('[SCN-007-011] competingHypothesesVisible=true');
  console.log('[SCN-007-011] setupPublished=false');
  console.log('[SCN-007-011] longTriggerPublished=false');
});

test('Regression: SCN-007-031 ungrounded transcript claim stays rejected across model and copy', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=correlated-uptrend&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'correlated-uptrend');

  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);
  const rejected = diagnostics.claims.filter((claim) => claim.verdict === 'rejected');
  expect(rejected.length).toBeGreaterThan(0);

  // No shipped technique may cite a rejected claim.
  const config = await page.evaluate(async () => (await fetch('technical-analysis-decision-universe.json')).json());
  const rejectedIds = config.claimLedger.filter((record) => record.verdict === 'rejected').map((record) => record.claimId);
  const citing = config.techniques.filter((technique) => technique.claimIds.some((claimId) => rejectedIds.includes(claimId)));
  expect(citing).toHaveLength(0);

  // A live probe proves the refusal rather than asserting it in prose: a method citing the
  // rejected claim is actually dispatched, and the engine refuses it.
  expect(diagnostics.rejectedProbe.refused).toBe(true);
  expect(diagnostics.rejectedProbe.code).toBe('TAD-CLAIM-REJECTED');
  expect(rejectedIds).toContain(diagnostics.rejectedProbe.claimId);
  const probeText = await normalizedText(page, '#rejectedProbe');
  expect(probeText).toContain('was refused');
  expect(probeText).toContain('TAD-CLAIM-REJECTED');
  expect(probeText).toContain('Required for reconsideration');

  // The DISCLOSURE surface must name the rejected claim and its bound. This is required, not banned.
  const ledgerText = await normalizedText(page, '#claimLedger');
  expect(ledgerText).toContain(diagnostics.rejectedProbe.claimId);
  expect(ledgerText).toContain('rejected');
  expect(ledgerText).toMatch(/No hidden actor motive|no independent source/i);

  // The READING surface must never make the claim the ledger rejects. The ban targets the
  // AFFIRMATIVE form only: the page is required to say "No resting liquidity is claimed", so a
  // polarity-blind word ban would fail the tool precisely for making the disclaimer it must make.
  const readingText = await readingSurfaceText(page);
  expect(readingText).not.toMatch(/win rate of \d|\d+\s*% win rate|always (works|leads to)|guaranteed|proves? that price will|stop.hunts? (by|from)|(?<!no )(?<!not )(?<!never )\b(hidden (actor|hand)|resting liquidity)\b/i);
  // And the disclaimers themselves must actually be present, not merely absent of their opposite.
  expect(readingText).toContain('No resting liquidity is claimed');
  expect(readingText).toContain('No participant identity is inferred');
  expect(readingText).toContain('No motive is inferred');
  console.log(`[SCN-007-031] rejectedClaims=${rejected.map((claim) => claim.claimId).join(',')}`);
  console.log('[SCN-007-031] techniquesCitingRejected=0');
  console.log(`[SCN-007-031] probeRefused=${diagnostics.rejectedProbe.refused} code=${diagnostics.rejectedProbe.code}`);
  console.log('[SCN-007-031] ledgerNamesRequiredEvidence=true');
  console.log('[SCN-007-031] universalEdgeOrHiddenActorCopy=absent');
});

test('Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=us-equity-4h-core&clock=${CLOCK}`);
  await page.waitForFunction(() => {
    const diagnostics = window.__TAD_DIAGNOSTICS__;
    return diagnostics?.fixtureId === 'us-equity-4h-core'
      && Array.isArray(diagnostics.seriesEnvelope?.bars)
      && diagnostics.seriesEnvelope.bars.length > 0;
  });
  const shared = await page.evaluate(() => {
    const legacyRows = [{ t: 1700000000000, o: 10, h: 11, l: 9, c: 10.5, v: 100 }];
    RLDATA.putBars('LEGACY-CANARY', '1d', legacyRows, 'canary');
    RLDATA.putToolRead('legacy-canary', { asOf: '2026-07-15T17:00:00.000Z', read: 'Legacy canary', metrics: { state: 'unchanged' }, deepLink: 'legacy.html' });
    const before = JSON.stringify({ bars: RLDATA.bars('LEGACY-CANARY', '1d'), info: RLDATA.barInfo('LEGACY-CANARY', '1d'), read: RLDATA.toolRead('legacy-canary') });
    const envelope = window.__TAD_DIAGNOSTICS__.seriesEnvelope;
    const stored = RLDATA.putQualifiedBarSeries(envelope);
    const restored = RLDATA.qualifiedBarSeries(envelope.symbol, envelope.interval, envelope.source.vintageId);
    const after = JSON.stringify({ bars: RLDATA.bars('LEGACY-CANARY', '1d'), info: RLDATA.barInfo('LEGACY-CANARY', '1d'), read: RLDATA.toolRead('legacy-canary') });
    return {
      before,
      after,
      contractVersion: restored && restored.contractVersion,
      qualifiedRows: restored && restored.bars.length,
      storedRows: stored && stored.bars.length,
      credentialApi: typeof RLDATA.providerFetch,
      validationApi: Object.keys(RLVALID).sort()
    };
  });
  expect(shared.after).toBe(shared.before);
  expect(shared.contractVersion).toBe('tad-series/v1');
  expect(shared.qualifiedRows).toBeGreaterThan(0);
  expect(shared.storedRows).toBe(shared.qualifiedRows);
  expect(shared.credentialApi).toBe('function');
  expect(shared.validationApi).toEqual([
    'rlvAdjustBenjaminiHochberg',
    'rlvAdjustHolm',
    'rlvBuildPurgedFolds',
    'rlvDeflatedSharpe',
    'rlvQuantiles',
    'rlvSummarizeOutcomes',
    'rlvWilsonInterval'
  ]);

  await page.goto(`${baseUrl}/strategy-validation-lab.html`);
  // Feature 007 and the shared shell both define Simple as the default. The legacy native
  // validation workspace is the Power projection, so exercise it through the shipped mode control
  // instead of treating a correctly hidden Power panel as a regression.
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await expect(page.locator('#verdict')).toBeVisible();
  const verdictText = await page.locator('#verdict').innerText();
  expect(verdictText).toMatch(/GOAL MET \(OOS\)|GOAL NOT MET \(OOS\)|No validation yet/);
  expect(verdictText).not.toMatch(/undefined|NaN/);
  const parity = await page.evaluate(() => window.__STRATEGY_RLVALID_PARITY__);
  expect(parity.available).toBe(true);
  expect(parity.equal).toBe(true);
  expect(parity.fields).toEqual(['psr', 'dsr', 'srAnn', 'nTrials', 'n']);
  console.log('[Feature-007-canary] legacyRldataBytesEqual=true');
  console.log(`[Feature-007-canary] qualifiedRows=${shared.qualifiedRows}`);
  console.log('[Feature-007-canary] credentialApi=preserved');
  console.log('[Feature-007-canary] rlvalidDeclarations=7');
  console.log('[Feature-007-canary] strategyParity=true');
});