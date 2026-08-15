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

test('Regression: SCN-007-008 wick creates a failed-break candidate without actor or motive claims', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=setup-lifecycle&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'setup-lifecycle');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);

  // An excursion beyond the zone that closes back inside is a failed-break candidate, never a break.
  const failed = diagnostics.levelLifecycle.failedBreak;
  expect(failed.intrabarExcursion).toBe(true);
  expect(failed.closedBeyond).toBe(false);
  expect(failed.state).toBe('held');
  expect(failed.reasonCodes).toContain('intrabar-excursion-without-closed-break');
  expect(failed.decidedFromClosedBars).toBeGreaterThan(0);
  // The same level with a genuine close beyond it must read differently, or the distinction is empty.
  expect(diagnostics.levelLifecycle.confirmedBreak.state).toBe('broken');
  expect(diagnostics.levelLifecycle.confirmedBreak.closedBeyond).toBe(true);

  const lifecycleText = await normalizedText(page, '#levelLifecycle');
  expect(lifecycleText).toContain('failed-break candidate');
  expect(lifecycleText).toContain('does not identify a participant');
  expect(await readingSurfaceText(page)).not.toMatch(/stop.?hunt|liquidity (sweep|grab|hunt)|smart money|institution|manipulat|shake ?out|whale/i);
  console.log(`[SCN-007-008] failedBreak=${failed.state} excursion=${failed.intrabarExcursion} closedBeyond=${failed.closedBeyond}`);
  console.log(`[SCN-007-008] confirmedBreak=${diagnostics.levelLifecycle.confirmedBreak.state}`);
  console.log('[SCN-007-008] actorOrMotiveClaimed=false');
  console.log('[SCN-007-008] decidedFromClosedBars=' + failed.decidedFromClosedBars);
  console.log('[SCN-007-008] confirmationStillRequired=true');
});

test('Regression: SCN-007-012 candidate becomes armed before trigger with no backdated entry', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=setup-lifecycle&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'setup-lifecycle');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);

  const armed = diagnostics.candidates.find((candidate) => candidate.key === 'armed');
  expect(armed.state).toBe('ARMED');
  expect(armed.evaluationState).toBe('ARMED');
  // ARMED is reached through WATCH; the state is never skipped.
  expect(armed.events.map((event) => event.toState)).toEqual(['WATCH', 'ARMED']);
  expect(armed.events.every((event) => Date.parse(event.observationCutoff) <= Date.parse(event.decisionTime))).toBeTruthy();
  expect(armed.terminal).toBe(false);
  // No entry may be assumed, and nothing may be dated before the decision that produced it.
  expect(armed.events.every((event) => event.toState !== 'TRIGGERED')).toBeTruthy();
  // The graph itself must refuse the skip. Asserting only the path this storyline took would
  // still pass if WATCH quietly gained an edge straight to TRIGGERED.
  expect(armed.skipRefused).toBe(true);
  expect(armed.skipCode).toBe('TAD-CANDIDATE-TRANSITION');
  expect(diagnostics.setupPublished).toBe(false);
  expect(diagnostics.executionClaimed).toBe(false);

  const receipt = await normalizedText(page, '#candidateReceipt');
  expect(receipt).toContain('no entry is assumed, priced, or backdated');
  expect(receipt).toMatch(/waiting for .*closed-reclaim/);
  const timelines = await normalizedText(page, '#candidateTimelines');
  expect(timelines).toContain('WATCH to ARMED');
  console.log(`[SCN-007-012] armedPath=${armed.events.map((event) => event.toState).join('>')}`);
  console.log(`[SCN-007-012] evaluatorState=${armed.evaluationState}`);
  console.log('[SCN-007-012] triggerObserved=false');
  console.log('[SCN-007-012] backdatedEntry=false');
  console.log('[SCN-007-012] setupPublished=false');
});

test('Regression: SCN-007-013 confluence retains level provenance and never becomes a liquidity heatmap', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=setup-lifecycle&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'setup-lifecycle');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);

  const zone = diagnostics.zones.slice().sort((a, b) => b.memberCount - a.memberCount)[0];
  expect(zone.memberCount).toBe(3);
  expect(zone.label).toBe('historical/model level confluence');
  expect(zone.independentFamilyIds.length).toBe(3);
  // Every member must remain individually inspectable rather than dissolving into the zone.
  expect(zone.memberLevelIds).toHaveLength(3);
  for (const levelId of zone.memberLevelIds) {
    const level = diagnostics.levels.find((entry) => entry.levelId === levelId);
    expect(level.methodId).toBeTruthy();
    expect(level.interval).toBeTruthy();
    expect(level.timeframeRole).toBeTruthy();
    expect(level.sourceVintageId).toBeTruthy();
    expect(level.observedAt).toBeTruthy();
    expect(typeof level.uncertainty).toBe('number');
  }

  const zoneText = await normalizedText(page, '#confluenceZones');
  expect(zoneText).toContain('daily-swing-low');
  expect(zoneText).toContain('sma-50');
  expect(zoneText).toContain('composite-hvn');
  expect(await normalizedText(page, '#zoneLabel')).toBe('historical/model level confluence');
  // The zone must never be described in order-book or liquidity terms. The ban targets the
  // AFFIRMATIVE form only: the page is required to say it is "not resting orders", so a
  // polarity-blind ban would fail the tool for making exactly the disclaimer it must make.
  const surface = await readingSurfaceText(page) + ' ' + zoneText + ' ' + (await normalizedText(page, '#confluenceReceipt'));
  expect(surface).not.toMatch(/(?<!not )(?<!no )\b(order.?book|liquidity (heatmap|map|pool|level)|resting (order|liquidity)|depth chart|bid.?ask ladder)/i);
  expect(surface).toContain('not a book, not resting orders');
  console.log(`[SCN-007-013] zoneMembers=${zone.memberCount} independentFamilies=${zone.independentFamilyIds.join(',')}`);
  console.log(`[SCN-007-013] label=${zone.label}`);
  console.log('[SCN-007-013] memberProvenanceRetained=true');
  console.log('[SCN-007-013] orderBookLanguage=absent');
  console.log(`[SCN-007-013] zones=${diagnostics.zones.length}`);
});

test('Regression: SCN-007-025 armed setup expires immutably and a later pattern gets a new identity', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=setup-lifecycle&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'setup-lifecycle');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);

  const expired = diagnostics.candidates.find((candidate) => candidate.key === 'expired');
  expect(expired.state).toBe('EXPIRED');
  expect(expired.terminal).toBe(true);
  expect(expired.terminalConditionId).toBe('closed-reclaim-never-occurred');
  expect(expired.events.map((event) => event.toState)).toEqual(['WATCH', 'ARMED', 'EXPIRED']);
  // The unmet trigger and the original vintage stay inspectable after expiry.
  expect(expired.events[expired.events.length - 1].reasonCodes).toContain('trigger-window-closed');
  expect(expired.events.every((event) => event.observationCutoff && event.decisionTime)).toBeTruthy();
  // A terminal record must refuse to reopen — probed live, not asserted in prose.
  expect(expired.reopenRefused).toBe(true);
  expect(expired.reopenCode).toBe('TAD-CANDIDATE-TERMINAL');

  // A later similar pattern is a different candidate identity, not a revival of this one.
  const identities = diagnostics.candidates.map((candidate) => candidate.candidateId);
  expect(new Set(identities).size).toBe(identities.length);
  expect(identities.every((identity) => /^tad-candidate:[a-f0-9]{64}$/.test(identity))).toBeTruthy();
  const armed = diagnostics.candidates.find((candidate) => candidate.key === 'armed');
  expect(armed.candidateId).not.toBe(expired.candidateId);
  console.log(`[SCN-007-025] expiredPath=${expired.events.map((event) => event.toState).join('>')}`);
  console.log(`[SCN-007-025] terminalCondition=${expired.terminalConditionId}`);
  console.log(`[SCN-007-025] reopenRefused=${expired.reopenRefused} code=${expired.reopenCode}`);
  console.log(`[SCN-007-025] distinctCandidateIdentities=${new Set(identities).size}/${identities.length}`);
  console.log('[SCN-007-025] originalVintageInspectable=true');
});

test('Regression: SCN-007-026 completed evaluation stays hypothetical with frozen terminal reason', async ({ page }) => {
  await page.goto(`${baseUrl}/technical-analysis-decision-lab.html?fixture=setup-lifecycle&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'setup-lifecycle');
  const diagnostics = await page.evaluate(() => window.__TAD_DIAGNOSTICS__);

  const completed = diagnostics.candidates.find((candidate) => candidate.key === 'completed');
  expect(completed.state).toBe('COMPLETED_EVALUATION');
  expect(completed.terminal).toBe(true);
  expect(completed.terminalConditionId).toBe('first-natural-target-reached');
  expect(completed.events.map((event) => event.toState)).toEqual(['WATCH', 'ARMED', 'TRIGGERED', 'COMPLETED_EVALUATION']);
  // Gross and net are both retained, along with the path that produced them.
  expect(completed.hypotheticalOutcome.grossR).toBeGreaterThan(0);
  expect(completed.hypotheticalOutcome.netR).toBeGreaterThan(0);
  expect(completed.hypotheticalOutcome.netR).toBeLessThan(completed.hypotheticalOutcome.grossR);
  expect(completed.hypotheticalOutcome.path).toBe('trigger-to-first-target');
  expect(completed.reopenRefused).toBe(true);

  // The geometry must have been frozen before the trigger, from targets that already existed.
  expect(diagnostics.riskPlan.orderedTargetIds.length).toBeGreaterThan(0);
  expect(diagnostics.targetAudit.matchesFrozenPlan).toBe(true);
  expect(diagnostics.fittedTargetAudit.findings.some((finding) => finding.code === 'TAD-TARGET-FITTING')).toBeTruthy();
  for (const targetId of diagnostics.riskPlan.orderedTargetIds) {
    expect(diagnostics.levels.some((level) => level.levelId === targetId)).toBeTruthy();
  }

  const timelines = await normalizedText(page, '#candidateTimelines');
  expect(timelines).toContain('Hypothetical evaluation only');
  expect(timelines).toContain('No order was placed, no position was held, and nothing was realised');
  expect(diagnostics.executionClaimed).toBe(false);
  // The product may never say the user traded this.
  expect(await readingSurfaceText(page) + ' ' + timelines).not.toMatch(/you (entered|exited|bought|sold|made|earned)|your (entry|exit|profit|position)|we (entered|exited)|realised (profit|gain)|realized (profit|gain)/i);
  console.log(`[SCN-007-026] completedPath=${completed.events.map((event) => event.toState).join('>')}`);
  console.log(`[SCN-007-026] terminalCondition=${completed.terminalConditionId}`);
  console.log(`[SCN-007-026] grossR=${completed.hypotheticalOutcome.grossR} netR=${completed.hypotheticalOutcome.netR}`);
  console.log('[SCN-007-026] targetsPreDerived=true fittedTargetDetected=true');
  console.log('[SCN-007-026] executionClaimed=false');
});

async function gateDiagnostics(page, baseUrl2) {
  await page.goto(`${baseUrl2}/technical-analysis-decision-lab.html?fixture=gate-synthesis&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'gate-synthesis');
  return page.evaluate(() => window.__TAD_DIAGNOSTICS__);
}

test('Regression: SCN-007-001 aligned trend without governed location remains no edge', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const gates = diagnostics.situations['aligned-but-extended'].synthesis;

  expect(gates.gates[0].gateId).toBe('primary');
  expect(gates.gates[0].outcome).toBe('pass');
  expect(gates.gates[2].gateId).toBe('location');
  expect(gates.gates[2].outcome).toBe('fail');
  expect(gates.gates[2].reasonCodes).toContain('outside-governed-zone');
  expect(gates.gates[2].reasonCodes).toContain('chase-risk');
  expect(gates.transitionEligible).toBe(false);
  expect(gates.firstBlockingGateId).toBe('location');

  // The aligned trend must not become a bullish trigger just because primary passed.
  const read = diagnostics.noEdgeCompetition.read;
  expect(read.state).not.toBe('TRIGGERED');
  expect(read.selectedCandidateId).toBeNull();
  expect(read.directionPublished).toBe(false);
  const surface = await readingSurfaceText(page) + ' ' + (await normalizedText(page, '#gateRecords'));
  expect(surface).not.toMatch(/bullish trigger|buy (now|here)|go long/i);
  console.log(`[SCN-007-001] primary=${gates.gates[0].outcome} location=${gates.gates[2].outcome}`);
  console.log(`[SCN-007-001] firstBlockingGate=${gates.firstBlockingGateId}`);
  console.log(`[SCN-007-001] readState=${read.state} selected=${read.selectedCandidateId}`);
  console.log('[SCN-007-001] chaseRiskNamed=true');
  console.log('[SCN-007-001] directionPublished=false');
});

test('Regression: SCN-007-002 five mandatory gates produce one complete triggered read', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const gates = diagnostics.situations['complete-trigger'].synthesis;

  expect(gates.gates).toHaveLength(5);
  expect(gates.gates.map((gate) => gate.gateId)).toEqual(['primary', 'regime', 'location', 'trigger', 'validation-risk-process']);
  expect(gates.gates.every((gate) => gate.outcome === 'pass')).toBeTruthy();
  expect(gates.transitionEligible).toBe(true);
  expect(gates.firstBlockingGateId).toBeNull();
  expect(gates.passCount).toBe(5);

  const read = diagnostics.competition.read;
  expect(read.state).toBe('TRIGGERED');
  expect(read.selectedCandidateId).toBeTruthy();
  expect(read.readId).toMatch(/^tad-read:[a-f0-9]{64}$/);
  expect(read.selectionBasis).toBe('strongest-complete-gate-and-validation-evidence');
  // Every gate must state what it observed and what it required, or the read is not explainable.
  expect(gates.gates.every((gate) => typeof gate.observed === 'string' && gate.observed.length > 0)).toBeTruthy();
  expect(gates.gates.every((gate) => typeof gate.required === 'string' && gate.required.length > 0)).toBeTruthy();
  expect(await normalizedText(page, '#readState')).toBe('TRIGGERED');
  console.log(`[SCN-007-002] gates=${gates.gates.map((gate) => gate.gateId + ':' + gate.outcome).join(' ')}`);
  console.log(`[SCN-007-002] readState=${read.state} selected=${read.selectedCandidateId.slice(0, 24)}`);
  console.log(`[SCN-007-002] selectionBasis=${read.selectionBasis}`);
  console.log('[SCN-007-002] everyGateStatesObservedAndRequired=true');
  console.log(`[SCN-007-002] passCount=${gates.passCount}`);
});

test('Regression: SCN-007-003 structural invalidation defeats correlated bullish indicators', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const gates = diagnostics.situations['structural-invalidation'].synthesis;

  // Primary, regime and location all pass, so nothing here is failing for lack of bullish evidence.
  expect(gates.gates[0].outcome).toBe('pass');
  expect(gates.gates[1].outcome).toBe('pass');
  expect(gates.gates[2].outcome).toBe('pass');
  expect(gates.gates[3].outcome).toBe('fail');
  expect(gates.gates[3].reasonCodes).toContain('closed-beyond-invalidation');
  expect(gates.transitionEligible).toBe(false);
  // The fifth gate still passes and is still shown — but it is diagnostic only and cannot outvote.
  expect(gates.gates[4].outcome).toBe('pass');
  expect(gates.gates[4].diagnosticOnly).toBe(true);
  expect(gates.gates[3].blocksTransition).toBe(true);

  const gateText = await normalizedText(page, '#gateRecords');
  expect(gateText).toContain('diagnostic only');
  expect(await normalizedText(page, '#gateReceipt')).toContain('cannot outvote a failed mandatory gate');
  console.log(`[SCN-007-003] passedBefore=${gates.gates.slice(0, 3).map((gate) => gate.gateId).join(',')}`);
  console.log(`[SCN-007-003] trigger=${gates.gates[3].outcome} reason=closed-beyond-invalidation`);
  console.log(`[SCN-007-003] laterGatePass=${gates.gates[4].outcome} diagnosticOnly=${gates.gates[4].diagnosticOnly}`);
  console.log(`[SCN-007-003] transitionEligible=${gates.transitionEligible}`);
  console.log('[SCN-007-003] outvotedByIndicators=false');
});

test('Regression: SCN-007-004 tactical strength preserves primary downtrend conflict and eligibility', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const conflict = diagnostics.situations['timeframe-conflict'].synthesis;
  const eligible = diagnostics.situations['timeframe-conflict-countertrend-eligible'].synthesis;

  // The conflict is stated, and the primary is never called reversed.
  expect(conflict.gates[0].outcome).toBe('pass');
  expect(conflict.gates[0].reasonCodes.some((reason) => reason.startsWith('timeframe-conflict:'))).toBeTruthy();
  expect(conflict.gates[0].reasonCodes.some((reason) => reason.includes('primary-downtrend-confirmed'))).toBeTruthy();
  // Only a family declared for countertrend research may remain armed.
  expect(conflict.gates[1].outcome).toBe('fail');
  expect(conflict.gates[1].reasonCodes).toContain('timeframe-conflict-without-countertrend-eligible-family');
  expect(conflict.gates[1].reasonCodes).toContain('primary-not-reversed');
  expect(eligible.gates[1].outcome).toBe('pass');
  expect(eligible.gates[1].reasonCodes).toContain('primary-not-reversed');

  const gateText = await normalizedText(page, '#gateRecords');
  expect(gateText).toContain('conflicts with the confirmed primary');
  expect(await readingSurfaceText(page) + ' ' + gateText).not.toMatch(/primary (trend )?(has )?reversed|trend reversal confirmed/i);
  console.log(`[SCN-007-004] primaryGate=${conflict.gates[0].outcome} conflictStated=true`);
  console.log(`[SCN-007-004] regimeWithoutCountertrendFamily=${conflict.gates[1].outcome}`);
  console.log(`[SCN-007-004] regimeWithCountertrendFamily=${eligible.gates[1].outcome}`);
  console.log('[SCN-007-004] primaryCalledReversed=false');
  console.log('[SCN-007-004] onlyCountertrendEligibleFamiliesArmed=true');
});

test('Regression: SCN-007-022 unresolved candidates produce no edge or mixed without a weak signal', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const read = diagnostics.noEdgeCompetition.read;

  expect(['NO_EDGE', 'MIXED']).toContain(read.state);
  expect(read.selectedCandidateId).toBeNull();
  expect(read.selectionBasis).toBe('no-candidate-cleared-every-mandatory-gate');
  expect(read.directionPublished).toBe(false);
  expect(read.executionClaimed).toBe(false);
  // Every candidate is blocked, and the read may still name the nearest one and what it lacks.
  expect(read.ranked.every((entry) => entry.transitionEligible === false)).toBeTruthy();
  expect(read.nearestReadyCandidateId).toBeTruthy();
  expect(read.nearestMissingCondition).toBeTruthy();
  expect(read.ranked.length).toBe(3);

  const surface = await readingSurfaceText(page) + ' ' + (await normalizedText(page, '#candidateRanking'));
  expect(surface).not.toMatch(/low.confidence (buy|sell|long|short)|weak (buy|sell) signal|slight(ly)? bullish|slight(ly)? bearish/i);
  expect(diagnostics.setupPublished).toBe(false);
  console.log(`[SCN-007-022] readState=${read.state} selected=${read.selectedCandidateId}`);
  console.log(`[SCN-007-022] nearestReady=${read.nearestReadyCandidateId.slice(0, 24)} missing=${read.nearestMissingCondition}`);
  console.log(`[SCN-007-022] blockedCandidates=${read.ranked.length}`);
  console.log('[SCN-007-022] forcedWeakSignal=false');
  console.log(`[SCN-007-022] selectionBasis=${read.selectionBasis}`);
});

test('Regression: SCN-007-027 candidate ranking favors complete evidence and keeps alternatives visible', async ({ page }) => {
  const diagnostics = await gateDiagnostics(page, baseUrl);
  const read = diagnostics.competition.read;
  const byId = Object.fromEntries(diagnostics.competition.candidates.map((candidate) => [candidate.candidateId, candidate]));

  // The selected candidate is the one with complete gate evidence, not the most bullish one.
  const selected = byId[read.selectedCandidateId];
  expect(selected.setupDefinitionId).toBe('failed-break-reclaim/v1');
  expect(read.ranked[0].candidateId).toBe(read.selectedCandidateId);
  expect(read.ranked[0].passCount).toBe(5);
  const bullish = diagnostics.competition.candidates.find((candidate) => candidate.setupDefinitionId === 'breakout-acceptance-retest/v1');
  const bullishRank = read.ranked.find((entry) => entry.candidateId === bullish.candidateId);
  expect(bullishRank.rank).toBeGreaterThan(1);

  // Direction must not appear as a ranking dimension or in the ranked output.
  expect(read.rankDimensions).not.toContain('direction');
  expect(JSON.stringify(read.ranked)).not.toContain('"direction"');
  // Non-selected candidates stay visible with their missing condition.
  expect(read.ranked).toHaveLength(3);
  const rankingText = await normalizedText(page, '#candidateRanking');
  expect(rankingText).toContain('breakout-acceptance-retest/v1');
  expect(rankingText).toContain('balance-extreme-mean-reversion/v1');
  expect(rankingText).toContain('Missing:');
  expect(await normalizedText(page, '#competitionReceipt')).toContain('Direction is not a ranking dimension');
  console.log(`[SCN-007-027] selected=${selected.setupDefinitionId} passCount=${read.ranked[0].passCount}`);
  console.log(`[SCN-007-027] bullishCandidateRank=${bullishRank.rank}`);
  console.log(`[SCN-007-027] rankDimensions=${read.rankDimensions.join(',')}`);
  console.log(`[SCN-007-027] alternativesVisible=${read.ranked.length - 1}`);
  console.log('[SCN-007-027] directionInRanking=false');
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

/* ---------- Feature 007 Scope 05: owner publication and strict adapters ---------- */
// Every owner assertion below reads the real page over HTTP and inspects the actual RLDATA
// envelope the page published. Nothing is stubbed and no request is intercepted.
const SCOPE05_OWNERS = {
  'swing-structure/v1': 'swing-structure-lab',
  'intraday-auction/v1': 'intraday-tape-lab',
  'options-positioning/v1': 'options-structure-lab',
  'gamma-playbook/v1': 'gamma-trading-lab',
  'market-breadth/v1': 'market-heatmap-lab',
  'relative-context/v1': 'sector-research-lab'
};

async function ownerDiagnostics(page, baseUrl2) {
  await page.goto(`${baseUrl2}/technical-analysis-decision-lab.html?fixture=owner-publication&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'owner-publication');
  return page.evaluate(() => window.__TAD_DIAGNOSTICS__);
}

test('Regression: SCN-007-015 missing option snapshot stays unavailable and never becomes neutral gamma', async ({ page }) => {
  const diagnostics = await ownerDiagnostics(page, baseUrl);
  const missing = diagnostics.situations.find((entry) => entry.key === 'missing-option-snapshot');
  expect(missing).toBeTruthy();
  expect(missing.option.eligible).toBe(false);
  expect(missing.option.code).toBe('TAD-OPTION-SNAPSHOT-UNAVAILABLE');

  // The option owner's own truth state survives intact. Nothing promotes it to current.
  const optionEntry = missing.admissions.find((entry) => entry.capabilityVersion === 'options-positioning/v1');
  expect(optionEntry.admitted).toBe(true);
  expect(optionEntry.truthState).toBe('unavailable');

  // The daily owner in the same situation remains usable, so absence is scoped, not contagious.
  const swingEntry = missing.admissions.find((entry) => entry.capabilityVersion === 'swing-structure/v1');
  expect(swingEntry.truthState).toBe('current');

  await expect(page.locator('#ownerOptionState')).toContainText('unavailable');
  await expect(page.locator('#ownerOptionState')).toContainText('TAD-OPTION-SNAPSHOT-UNAVAILABLE');

  // The visible refusal must say absence is not read as neutral, and must not show a zero level.
  const ownerRecords = (await page.locator('#ownerRecords').innerText()).replace(/\s+/g, ' ');
  expect(ownerRecords).toContain('No option chain snapshot exists for this symbol');
  expect(ownerRecords).toMatch(/neutral dealer positioning are not inferred/);
  expect(ownerRecords).not.toMatch(/(?<!not )(?<!no )(?<!never )net gamma (?:is|reads) 0\b/);
  expect(ownerRecords).not.toMatch(/(?<!not )(?<!no )(?<!never )positioning is neutral/);
});

test('Regression: SCN-007-016 option flip walls and GEX preserve one inherited convention', async ({ page }) => {
  const diagnostics = await ownerDiagnostics(page, baseUrl);
  const complete = diagnostics.situations.find((entry) => entry.key === 'complete');
  expect(complete.option.eligible).toBe(true);
  expect(complete.option.distinctConventions).toEqual(['dealer-long-calls-short-puts']);

  // The two option owners apply the convention at different points and each says so. This is the
  // asymmetry that makes a single blanket "apply the flip" rule wrong for both pages.
  const applied = Object.fromEntries(complete.option.conventions.map((entry) => [entry.ownerId, entry.signApplied]));
  expect(applied['options-structure-lab']).toBe(true);
  expect(applied['gamma-trading-lab']).toBe(false);

  // Two owners disagreeing refuses rather than silently re-signing one of them.
  const conflict = diagnostics.situations.find((entry) => entry.key === 'conflicting-convention');
  expect(conflict.option.eligible).toBe(false);
  expect(conflict.option.code).toBe('TAD-OPTION-CONVENTION-CONFLICT');
  expect(conflict.option.distinctConventions.length).toBe(2);

  await expect(page.locator('#ownerSignConvention')).toContainText('dealer-long-calls-short-puts');
  await expect(page.locator('#ownerSignConvention')).toContainText('refused for conflicting conventions');
  const ownerRecords = (await page.locator('#ownerRecords').innerText()).replace(/\s+/g, ' ');
  expect(ownerRecords).toContain('will not silently re-sign a snapshot');

  // The real option owner pages must declare the convention and must not re-sign inside the block.
  // A source-token check cannot observe runtime, so where the page actually publishes, assert the
  // REAL emitted signApplied value. That is what a consumer will read; the source text is not.
  const observedSignApplied = {};
  for (const ownerId of ['options-structure-lab', 'gamma-trading-lab']) {
    const ownerResponse = await page.goto(`${baseUrl}/${ownerId}.html`);
    expect(ownerResponse && ownerResponse.ok()).toBeTruthy();
    const source = await page.content();
    expect(source).toContain('signConventionId');
    expect(source).toContain('Feature 007 owner read:');
    const emitted = await page.evaluate(async (id) => {
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const read = globalThis.RLDATA?.toolRead?.(id) ?? null;
        if (read?.metrics?.ownerRead?.payload) return read.metrics.ownerRead.payload;
        await new Promise((r) => setTimeout(r, 250));
      }
      return globalThis.RLDATA?.toolRead?.(id)?.metrics?.ownerRead?.payload ?? null;
    }, ownerId);
    if (emitted) {
      observedSignApplied[ownerId] = emitted.signApplied;
      expect(typeof emitted.signConventionId).toBe('string');
      expect(typeof emitted.signApplied).toBe('boolean');
    }
  }
  // options-structure bakes the convention into its stored values; gamma-trading applies it at
  // read time. If either page ever flipped, a consumer would double-sign or under-sign a snapshot.
  if ('options-structure-lab' in observedSignApplied) expect(observedSignApplied['options-structure-lab']).toBe(true);
  if ('gamma-trading-lab' in observedSignApplied) expect(observedSignApplied['gamma-trading-lab']).toBe(false);
  console.log(`[Feature-007-owner] observedSignApplied=${JSON.stringify(observedSignApplied)}`);
});

test('Regression: SCN-007-017 OHLCV leaves footprint depth and large-trade modules unavailable', async ({ page }) => {
  const diagnostics = await ownerDiagnostics(page, baseUrl);
  expect(diagnostics.microstructure.map((entry) => entry.requestId)).toEqual(['footprint', 'depth', 'large-trade']);
  expect(diagnostics.microstructure.every((entry) => entry.eligible === false)).toBe(true);
  expect(diagnostics.microstructure.every((entry) => ['ohlcv-bars', 'option-chain-snapshot'].includes(entry.offeredKind))).toBe(true);

  const microText = (await page.locator('#microstructureRecords').innerText()).replace(/\s+/g, ' ');
  expect(microText).toContain('Footprint / volume-at-price by aggressor - unavailable');
  expect(microText).toContain('Order-book depth - unavailable');
  expect(microText).toContain('Large-trade classification - unavailable');
  // Each module names the exact feed it needs, so the gap is legible rather than mysterious.
  expect(microText).toContain('tick-level volume at price with bid/ask or aggressor classification');
  expect(microText).toContain('time-stamped full-book add, move, cancel, and execute events');
  expect(microText).toContain('per-trade size, price, time, and classification');
  // No proxy may be dressed up as the real feed.
  expect(microText).toMatch(/an OHLCV or option-snapshot proxy is not substituted for it/);
  expect(microText).not.toMatch(/(?<!not )(?<!no )(?<!never )(?:footprint|depth) (?:feed )?available/i);

  const receipt = (await page.locator('#microstructureReceipt').innerText()).replace(/\s+/g, ' ');
  expect(receipt).toContain('0 of 3 microstructure contracts are satisfied');
});

test('Regression: SCN-007-024 daily-only read stays useful while tactical evidence remains unavailable', async ({ page }) => {
  const diagnostics = await ownerDiagnostics(page, baseUrl);
  const daily = diagnostics.situations.find((entry) => entry.key === 'daily-only');
  expect(daily.admissions.length).toBe(2);
  expect(daily.admissions.every((entry) => entry.admitted)).toBe(true);
  expect(daily.admissions.some((entry) => entry.capabilityVersion === 'intraday-auction/v1')).toBe(false);
  expect(daily.admissions.find((entry) => entry.capabilityVersion === 'swing-structure/v1').truthState).toBe('current');
  expect(diagnostics.tacticalAvailable).toBe(false);

  const tactical = (await page.locator('#ownerTacticalState').innerText()).replace(/\s+/g, ' ');
  expect(tactical).toContain('unavailable');
  // The daily read must stay usable. An honest gap is not the same as a dead page.
  expect(tactical).toContain('daily-eligible reads remain usable');
  const ownerRecords = (await page.locator('#ownerRecords').innerText()).replace(/\s+/g, ' ');
  expect(ownerRecords).toContain('Daily evidence only; no intraday owner published');
  expect(ownerRecords).toContain('swing-structure-lab: admitted as swing-structure/v1 with truth current');
});

test('Regression: Feature 007 owner integrations preserve source cutoffs limitations and existing reads', async ({ page }) => {
  test.setTimeout(180000);
  const nested = ['contractVersion', 'capabilityVersion', 'ownerId', 'resultId', 'sourceSetId', 'symbol',
    'sessionContractId', 'decisionCutoff', 'truthState', 'closedCoverage', 'provisionalCoverage', 'payload', 'limitations'];
  let publishedCount = 0;

  // Open each REAL owner page and inspect the envelope it actually published to RLDATA.
  for (const [capability, ownerId] of Object.entries(SCOPE05_OWNERS)) {
    const response = await page.goto(`${baseUrl}/${ownerId}.html`);
    expect(response && response.ok()).toBeTruthy();
    const published = await page.evaluate(async (id) => {
      // Give the page's own render a chance to publish; never force it and never stub it.
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const read = globalThis.RLDATA?.toolRead?.(id) ?? null;
        if (read && read.metrics && read.metrics.ownerRead) return read;
        await new Promise((r) => setTimeout(r, 250));
      }
      return globalThis.RLDATA?.toolRead?.(id) ?? null;
    }, ownerId);

    if (published && published.metrics && published.metrics.ownerRead) {
      publishedCount += 1;
      const owner = published.metrics.ownerRead;
      expect(owner.contractVersion).toBe('rl-ta-owner-read/v1');
      expect(owner.capabilityVersion).toBe(capability);
      expect(owner.ownerId).toBe(ownerId);
      expect(Object.keys(owner).sort()).toEqual(nested.slice().sort());
      expect(Array.isArray(owner.limitations) && owner.limitations.length > 0).toBe(true);
      expect(typeof owner.sourceSetId).toBe('string');
      expect(typeof owner.decisionCutoff).toBe('string');
      console.log(`[Feature-007-owner] ${ownerId}=published truth=${owner.truthState}`);
    } else {
      // A page with no data must publish NOTHING rather than a fabricated read. That is a
      // legitimate outcome here, and it is exactly what must not become a fake payload.
      expect(published === null || published.metrics?.ownerRead === undefined).toBe(true);
      console.log(`[Feature-007-owner] ${ownerId}=no-data-no-publication`);
    }

    // The publisher must never break the owner's own page, and its marker pair must be intact.
    const source = await page.content();
    expect(source.split(`Feature 007 owner read: ${capability}`).length - 1).toBe(2);
  }

  // Seeding the SHARED cache through the product's own documented cache-first path makes a real
  // owner compute and publish for real. Without this the envelope assertion above could pass
  // vacuously on a machine with no market data, which would make this canary decorative.
  const seeded = await page.goto(`${baseUrl}/swing-structure-lab.html`);
  expect(seeded && seeded.ok()).toBeTruthy();
  const seedOutcome = await page.evaluate(() => {
    if (!globalThis.RLDATA?.putBars) return { seeded: false, reason: 'putBars unavailable' };
    const rows = [];
    let close = 100;
    const start = Date.UTC(2023, 0, 3);
    for (let i = 0; i < 320; i += 1) {
      close += Math.sin(i / 9) * 0.6 + 0.05;
      rows.push({ t: start + i * 86400000, o: close - 0.4, h: close + 0.8, l: close - 0.9, c: close, v: 1000000 + i * 100 });
    }
    globalThis.RLDATA.putBars('SPY', '1d', rows, 'selftest-seed');
    globalThis.RLDATA.putBars('SPY', '1wk', rows.filter((_, i) => i % 5 === 0), 'selftest-seed');
    return { seeded: true, rows: rows.length };
  });
  expect(seedOutcome.seeded).toBe(true);
  await page.goto(`${baseUrl}/swing-structure-lab.html?t=SPY`);
  const seededRead = await page.evaluate(async () => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const read = globalThis.RLDATA?.toolRead?.('swing-structure-lab') ?? null;
      if (read && read.metrics && read.metrics.ownerRead) return read;
      await new Promise((r) => setTimeout(r, 250));
    }
    return globalThis.RLDATA?.toolRead?.('swing-structure-lab') ?? null;
  });
  expect(seededRead && seededRead.metrics && seededRead.metrics.ownerRead).toBeTruthy();
  const seededOwner = seededRead.metrics.ownerRead;
  expect(Object.keys(seededOwner).sort()).toEqual(nested.slice().sort());
  expect(seededOwner.contractVersion).toBe('rl-ta-owner-read/v1');
  expect(seededOwner.capabilityVersion).toBe('swing-structure/v1');
  expect(seededOwner.ownerId).toBe('swing-structure-lab');
  expect(seededOwner.symbol).toBe('SPY');
  expect(seededOwner.limitations.length).toBeGreaterThan(0);
  expect(seededOwner.closedCoverage).toBeGreaterThan(0);
  // The outer generic read the page already published is preserved alongside the nested passport.
  expect(seededRead.id).toBe('swing-structure-lab');
  expect(typeof seededRead.read).toBe('string');
  expect(seededRead.read.length).toBeGreaterThan(0);
  // No option snapshot was seeded, so option evidence must be an explicit absence, not a zero.
  expect(seededOwner.payload.optionSnapshotAvailable).toBe(false);
  expect(seededOwner.payload.optionSnapshot).toBeNull();
  console.log(`[Feature-007-owner] seededPublication=true closedCoverage=${seededOwner.closedCoverage} liveOwnersPublished=${publishedCount}`);

  // Strategy Validation stays read-only: it must publish no nested Feature 007 passport.
  const validationResponse = await page.goto(`${baseUrl}/strategy-validation-lab.html`);
  expect(validationResponse && validationResponse.ok()).toBeTruthy();
  const validationSource = await page.content();
  expect(validationSource).not.toContain('rl-ta-owner-read/v1');
  expect(validationSource).not.toContain('Feature 007 owner read');
  const rlvalidDeclarations = await page.evaluate(() => (globalThis.RLVALID ? Object.keys(globalThis.RLVALID).length : 0));
  expect(rlvalidDeclarations).toBeGreaterThan(0);

  // An absent Feature 006 read is explicit unavailable evidence, never a silent default.
  const diagnostics = await ownerDiagnostics(page, baseUrl);
  expect(diagnostics.featureSix.compatible).toBe(true);
  expect(diagnostics.featureSix.wrongSymbol).toBe('TAD-F006-SYMBOL');
  expect(diagnostics.featureSix.wrongContract).toBe('TAD-F006-CONTRACT');
  expect(diagnostics.featureSix.absent).toBe('TAD-F006-ABSENT');
  expect(diagnostics.registeredCapabilities.sort()).toEqual(Object.keys(SCOPE05_OWNERS).sort());
  console.log(`[Feature-007-owner] strategyValidationParity=true rlvalidKeys=${rlvalidDeclarations}`);
});
/* ---------- End Feature 007 Scope 05: owner publication and strict adapters ---------- */

/* ---------- Feature 007 Scope 06: comparison and optional evidence ---------- */
async function comparisonDiagnostics(page, baseUrl2) {
  await page.goto(`${baseUrl2}/technical-analysis-decision-lab.html?fixture=comparison-roles&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'comparison-roles');
  return page.evaluate(() => window.__TAD_DIAGNOSTICS__);
}

test('Regression: SCN-007-014 market sector and peer roles expose relative weakness separately', async ({ page }) => {
  const diagnostics = await comparisonDiagnostics(page, baseUrl);
  const confirmed = diagnostics.situations.find((entry) => entry.key === 'confirmed');
  expect(confirmed.results.map((r) => r.role)).toEqual(['broad-market', 'sector-industry', 'direct-peer', 'optional-context']);

  // Each role reports only its own declared members, so one role cannot stand in for another.
  const byRole = Object.fromEntries(confirmed.results.map((r) => [r.role, r]));
  expect(byRole['broad-market'].symbolIds).toEqual(['MKT']);
  expect(byRole['sector-industry'].symbolIds).toEqual(['SEC']);
  expect(byRole['direct-peer'].symbolIds).toEqual(['P1', 'P2', 'P3']);
  expect(byRole['optional-context'].symbolIds).toEqual(['CTX']);

  // The subject lags market, sector and every peer while leading optional context. A single
  // blended score would hide exactly that disagreement, so the roles are reported apart.
  expect(byRole['broad-market'].state).toBe('relative-weakness');
  expect(byRole['sector-industry'].state).toBe('relative-weakness');
  expect(byRole['direct-peer'].state).toBe('relative-weakness');
  expect(byRole['optional-context'].state).toBe('confirms-strength');
  expect(confirmed.contradictions.sort()).toEqual(['broad-market', 'direct-peer', 'sector-industry']);

  // Ratios are normalized total return, never raw-price similarity.
  expect(byRole['direct-peer'].ratios.length).toBe(3);
  expect(byRole['direct-peer'].ratios.every((entry) => Number.isFinite(entry.ratio) && entry.ratio < 1)).toBe(true);

  const rolesText = (await page.locator('#comparisonRoles').innerText()).replace(/\s+/g, ' ');
  expect(rolesText).toContain('broad-market: relative-weakness');
  expect(rolesText).toContain('sector-industry: relative-weakness');
  expect(rolesText).toContain('direct-peer: relative-weakness');
  expect(rolesText).toContain('optional-context: confirms-strength');
  await expect(page.locator('#comparisonContradictions')).toContainText('broad-market');
  await expect(page.locator('#comparisonContradictions')).toContainText('direct-peer');

  // The Dow industrial/transport rule must be disclaimed, not silently generalized. Ban the
  // affirmative equivalence claim; the disclaimer itself is required and asserted present.
  expect(diagnostics.dowEquivalenceClaimed).toBe(false);
  expect(rolesText).toMatch(/not an identical substitute for Dow's industrial and transport averages/);
  expect(rolesText).not.toMatch(/(?<!not )(?<!never )(?<!no )(?:equivalent to|identical to) Dow/i);

  // Incompatible comparators are excluded by name and never auto-replaced.
  const incompatible = diagnostics.situations.find((entry) => entry.key === 'incompatible-comparators');
  const incompatiblePeer = incompatible.results.find((r) => r.role === 'direct-peer');
  expect(incompatiblePeer.symbolIds).toEqual(['P1', 'PX-ADJ', 'PX-FX']);
  expect(incompatiblePeer.eligibleIds).toEqual(['P1']);
  expect(incompatiblePeer.excluded.map((e) => e.reason).sort()).toEqual(['incompatible-adjustment', 'incompatible-currency']);
  expect(rolesText).toContain('No comparator is automatically replaced');

  // Denominator rule: below the minimum the percentile is withheld but ratios survive.
  const thin = diagnostics.situations.find((entry) => entry.key === 'thin-peer-set');
  const thinPeer = thin.results.find((r) => r.role === 'direct-peer');
  expect(thinPeer.denominator).toBe(2);
  expect(thinPeer.percentile).toBeNull();
  expect(thinPeer.percentileState).toBe('denominator-below-minimum');
  expect(thinPeer.ratios.length).toBe(2);
  expect(byRole['direct-peer'].denominator).toBe(3);
  expect(byRole['direct-peer'].percentileState).toBe('available');
  await expect(page.locator('#comparisonDenominator')).toContainText('3 eligible of 3 declared; minimum 3');
});

test('Regression: SCN-007-028 comparison membership change creates a new variant and preserves prior validation', async ({ page }) => {
  const diagnostics = await comparisonDiagnostics(page, baseUrl);
  const baseline = diagnostics.baselineComparisonSetId;
  expect(baseline).toMatch(/^tad-comparison:[a-f0-9]{64}$/);

  // Every membership change produces a distinct identity. Reclassifying a symbol counts, because
  // it changes which role the evidence belongs to even though the symbol set is unchanged.
  const changed = diagnostics.situations.filter((entry) => entry.key !== 'confirmed');
  expect(changed.length).toBe(3);
  expect(changed.every((entry) => entry.identityChanged === true)).toBe(true);
  expect(new Set(diagnostics.situations.map((entry) => entry.comparisonSetId)).size).toBe(diagnostics.situations.length);
  expect(new Set(diagnostics.situations.map((entry) => entry.membershipDigest)).size).toBe(diagnostics.situations.length);

  const reclassified = diagnostics.situations.find((entry) => entry.key === 'reclassified-membership');
  expect(reclassified.comparisonSetId).not.toBe(baseline);
  expect(reclassified.results.find((r) => r.role === 'direct-peer').symbolIds).toEqual(['P1', 'P2']);
  expect(reclassified.results.find((r) => r.role === 'optional-context').symbolIds).toEqual(['P3', 'CTX']);
  // Moving a symbol out of the peer set lowers the denominator, so the percentile is withheld.
  expect(reclassified.results.find((r) => r.role === 'direct-peer').percentileState).toBe('denominator-below-minimum');

  // The prior validation record stays attached to the membership it was produced against.
  expect(diagnostics.priorValidation.attachedComparisonSetId).toBe(baseline);
  const variantText = (await page.locator('#comparisonVariants').innerText()).replace(/\s+/g, ' ');
  expect(variantText).toContain('new identity');
  expect(variantText).not.toContain('identity unchanged');
  expect(variantText).toContain(`remains attached to ${baseline} only`);
  expect(variantText).toContain(diagnostics.priorValidation.validationRecordId);

  await expect(page.locator('#comparisonIdentity')).toHaveText(baseline);
  const receipt = (await page.locator('#comparisonVariantReceipt').innerText()).replace(/\s+/g, ' ');
  expect(receipt).toContain('3 membership changes evaluated');
  expect(receipt).toContain('stays attached only to the membership it was produced against');
  console.log(`[SCN-007-028] baseline=${baseline.slice(0, 30)} distinctIdentities=${new Set(diagnostics.situations.map((e) => e.comparisonSetId)).size}`);
});
/* ---------- End Feature 007 Scope 06: comparison and optional evidence ---------- */

/* ---------- Feature 007 Scope 07: validation risk and process ---------- */
async function validationDiagnostics(page, baseUrl2) {
  await page.goto(`${baseUrl2}/technical-analysis-decision-lab.html?fixture=validation-risk-process&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'validation-risk-process');
  return page.evaluate(() => window.__TAD_DIAGNOSTICS__);
}

test('Regression: SCN-007-018 explicit costs separate gross and net expectancy and breakeven', async ({ page }) => {
  const diagnostics = await validationDiagnostics(page, baseUrl);

  // Both numbers exist and they are different. Net is strictly worse because costs are real.
  expect(Number.isFinite(diagnostics.summary.grossExpectancy)).toBe(true);
  expect(Number.isFinite(diagnostics.summary.netExpectancy)).toBe(true);
  expect(diagnostics.summary.netAvailable).toBe(true);
  expect(diagnostics.summary.netExpectancy).toBeLessThan(diagnostics.summary.grossExpectancy);
  expect(Math.abs(diagnostics.summary.netExpectancy - (diagnostics.summary.grossExpectancy - diagnostics.costs.perEventCostR))).toBeLessThan(1e-9);

  // A missing cost component makes net UNAVAILABLE. It is never quietly treated as zero, and
  // gross is never promoted into the net slot to fill the gap.
  expect(diagnostics.costs.missingComponents).toContain('halfSpreadBps');
  expect(diagnostics.costs.incompleteNetAvailable).toBe(false);
  expect(diagnostics.grossOnlySummary.netExpectancy).toBeNull();
  expect(diagnostics.grossOnlySummary.netAvailable).toBe(false);
  expect(Number.isFinite(diagnostics.grossOnlySummary.grossExpectancy)).toBe(true);
  expect(diagnostics.descriptiveOnlyPassport.status).toBe('descriptive-only');

  // Breakeven reflects the observed payoff distribution rather than a fixed constant.
  expect(diagnostics.summary.breakevenWinRate).toBeGreaterThan(0);
  expect(diagnostics.summary.breakevenWinRate).toBeLessThan(1);

  const gross = (await page.locator('#grossExpectancy').innerText()).replace(/\s+/g, ' ');
  const net = (await page.locator('#netExpectancy').innerText()).replace(/\s+/g, ' ');
  // Gross must be shown WITH its disclaimer. Ban the affirmative claim, require the disclaimer.
  expect(gross).toContain('gross geometry');
  expect(gross).toMatch(/not an edge/);
  expect(gross).not.toMatch(/(?<!not )(?<!never )gross (?:reward-to-risk )?is an edge/i);
  expect(net).toContain('net after every stated cost component');
  await expect(page.locator('#breakevenWinRate')).toContainText('from the observed payoff distribution');

  const records = (await page.locator('#validationRecords').innerText()).replace(/\s+/g, ' ');
  expect(records).toContain('Net expectancy is unavailable rather than assumed zero');
  expect(records).toContain('An unstated cost and a stated zero are different claims');
  expect(records).toContain('unresolved');
  expect(records).toContain('recorded, never dropped');
  console.log(`[SCN-007-018] gross=${diagnostics.summary.grossExpectancy.toFixed(4)} net=${diagnostics.summary.netExpectancy.toFixed(4)} perEventCost=${diagnostics.costs.perEventCostR.toFixed(4)}`);
});

test('Regression: SCN-007-019 expectancy audit computes 186', async ({ page }) => {
  const diagnostics = await validationDiagnostics(page, baseUrl);

  // The exact arithmetic the scenario names: p=.71, W=6R, L=1.8R -> E=3.738R, N=50 -> 186.9R.
  expect(Math.abs(diagnostics.audit.expectancyR - 3.738)).toBeLessThan(1e-9);
  expect(Math.abs(diagnostics.audit.grossTotalR - 186.9)).toBeLessThan(1e-9);
  expect(Math.abs(diagnostics.audit.breakevenWinRate - 1.8 / 7.8)).toBeLessThan(1e-12);

  // A claimed negative fifty-trade total cannot follow from those inputs under equal risk.
  expect(diagnostics.audit.claimedTotalR).toBe(-50);
  expect(diagnostics.audit.consistent).toBe(false);

  // The audit names what could reconcile it. It does not accuse the user of anything.
  expect(diagnostics.audit.reconciliationInputs.length).toBe(4);
  expect(diagnostics.audit.reconciliationInputs.join(' ')).toMatch(/position size/);
  expect(diagnostics.audit.reconciliationInputs.join(' ')).toMatch(/partial exits|scaling/);
  expect(diagnostics.audit.reconciliationInputs.join(' ')).toMatch(/cost sequence/);
  expect(diagnostics.audit.reconciliationInputs.join(' ')).toMatch(/transcription/);

  const audit = (await page.locator('#expectancyAudit').innerText()).replace(/\s+/g, ' ');
  expect(audit).toContain('E = p*W - (1-p)*L; total = E*N');
  expect(audit).toContain('3.738R');
  expect(audit).toContain('186.9R');
  expect(audit).toContain('23.08%');
  expect(audit).toContain('is inconsistent');
  expect(audit).toContain('arithmetic, not an accusation');
  expect(audit).toMatch(/gross expectancy is not an edge/);
  // No accusatory or emotional framing of the user's records.
  expect(audit).not.toMatch(/\b(lying|dishonest|fabricated|made up)\b/i);
  console.log(`[SCN-007-019] E=${diagnostics.audit.expectancyR} total=${diagnostics.audit.grossTotalR} consistent=${diagnostics.audit.consistent}`);
});

test('Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport', async ({ page }) => {
  const diagnostics = await validationDiagnostics(page, baseUrl);
  const byKey = Object.fromEntries(diagnostics.passports.map((entry) => [entry.key, entry]));
  expect(Object.keys(byKey).sort()).toEqual(['baseline', 'changedDisplacement', 'changedTarget']);

  // Every changed parameter is a different variant with a different passport identity.
  expect(byKey.changedDisplacement.passportId).not.toBe(byKey.baseline.passportId);
  expect(byKey.changedTarget.passportId).not.toBe(byKey.baseline.passportId);
  expect(new Set(diagnostics.passports.map((entry) => entry.passportId)).size).toBe(3);
  expect(new Set(diagnostics.passports.map((entry) => entry.variantId)).size).toBe(3);

  // Without a complete cost policy a variant can only be descriptive, never supported.
  expect(diagnostics.descriptiveOnlyPassport.status).toBe('descriptive-only');
  expect(diagnostics.descriptiveOnlyPassport.passportId).toBe(byKey.baseline.passportId);

  const records = (await page.locator('#validationRecords').innerText()).replace(/\s+/g, ' ');
  expect(records).toContain('is a different identity, so the baseline passport is not inherited by it');
  expect(records).toContain('descriptive-only');
  expect(records).toContain('balanced-breakout/v1+displacement');
  expect(records).toContain('balanced-breakout/v1+target');
  await expect(page.locator('#passportStatus')).not.toHaveText('None');
  console.log(`[SCN-007-020] distinctPassports=${new Set(diagnostics.passports.map((e) => e.passportId)).size} baselineStatus=${byKey.baseline.status}`);
});

test('Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion', async ({ page }) => {
  const diagnostics = await validationDiagnostics(page, baseUrl);
  const byKey = Object.fromEntries(diagnostics.process.map((entry) => [entry.key, entry]));

  // An entry beyond the configured chase distance blocks the frozen plan.
  expect(byKey.chasing.state).toBe('blocked');
  expect(byKey.chasing.codes).toContain('CHASE');
  expect(byKey.withinPlan.state).toBe('clear');
  expect(byKey.unacknowledged.state).toBe('caution');

  // It explains the changed reward-to-risk and invalidation distance rather than just refusing.
  expect(Math.abs(byKey.chasing.changedInvalidationDistance - 6)).toBeLessThan(1e-9);
  expect(Math.abs(byKey.chasing.changedRewardToRisk - 2 / 6)).toBeLessThan(1e-9);

  // Nothing about the user's mind. Findings are observable plan deviation only.
  diagnostics.process.forEach((entry) => {
    expect(entry.inferredEmotion).toBeNull();
    expect(entry.inferredIntent).toBeNull();
    expect(entry.suitabilityAssessed).toBe(false);
    expect(entry.basis).toBe('observable-plan-deviation-only');
  });

  const processText = (await page.locator('#processRecords').innerText()).replace(/\s+/g, ' ');
  expect(processText).toContain('CHASE (blocked)');
  expect(processText).toContain('the original plan is blocked');
  expect(processText).toContain('Changed reward-to-risk');
  expect(processText).toContain('invalidation distance');
  // No emotional or psychological diagnosis anywhere in the rendered guard.
  expect(processText).not.toMatch(/\b(fear|greed|panic|revenge|emotional|impulsive|undisciplined)\b/i);
  const receipt = (await page.locator('#processReceipt').innerText()).replace(/\s+/g, ' ');
  expect(receipt).toContain('observable deviation from the precommitted plan only');
  expect(receipt).toContain('No emotion, intent, mental state, or suitability is inferred');
  console.log(`[SCN-007-021] chasing=${byKey.chasing.state} withinPlan=${byKey.withinPlan.state} changedRR=${byKey.chasing.changedRewardToRisk.toFixed(4)}`);
});
/* ---------- End Feature 007 Scope 07: validation risk and process ---------- */

/* ---------- Feature 007 Scope 08: experience publication and registration ---------- */
async function projection(page, baseUrl2) {
  // The view mode is a persisted local preference, so a prior run could otherwise decide which
  // mode this test starts in. Pin it to the product default before the page boots.
  await page.addInitScript(() => { try { localStorage.setItem('tad-view-mode', 'simple'); } catch (error) { /* preference only */ } });
  await page.goto(`${baseUrl2}/technical-analysis-decision-lab.html?fixture=gate-synthesis&clock=${CLOCK}`);
  await page.waitForFunction(() => window.__TAD_DIAGNOSTICS__?.fixtureId === 'gate-synthesis');
  await page.waitForFunction(() => document.getElementById('simpleResultIdentity')?.textContent !== 'None');
  return page;
}

test('Regression: SCN-007-023 Simple and Power preserve one result with zero display-mode requests', async ({ page }) => {
  await projection(page, baseUrl);

  const simple = {
    identity: await page.locator('#simpleResultIdentity').innerText(),
    truth: await page.locator('#simpleTruth').innerText(),
    validation: await page.locator('#simpleValidation').innerText(),
    process: await page.locator('#simpleProcess').innerText(),
    gates: await page.locator('#simpleGateTableBody').innerText()
  };
  expect(simple.identity).toMatch(/^tad-read:[a-f0-9]{64}$/);
  // Simple is the default and Power bands are hidden until the mode is switched.
  await expect(page.locator('body')).not.toHaveClass(/power/);
  await expect(page.locator('#simpleCockpit')).toBeVisible();
  await expect(page.locator('section.band.pw').first()).toBeHidden();

  // Count every request made from the moment the result is committed. Switching mode must add none.
  const requests = [];
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));
  await page.locator('#modeSeg button[data-mode="power"]').click();
  await expect(page.locator('body')).toHaveClass(/power/);
  await expect(page.locator('section.band.pw').first()).toBeVisible();
  await expect(page.locator('#simpleCockpit')).toBeHidden();
  await page.locator('#modeSeg button[data-mode="simple"]').click();
  await expect(page.locator('body')).not.toHaveClass(/power/);
  expect(requests).toEqual([]);

  // The same immutable result is still projected after the round trip.
  expect(await page.locator('#simpleResultIdentity').innerText()).toBe(simple.identity);
  expect(await page.locator('#simpleTruth').innerText()).toBe(simple.truth);
  expect(await page.locator('#simpleValidation').innerText()).toBe(simple.validation);
  expect(await page.locator('#simpleProcess').innerText()).toBe(simple.process);
  expect(await page.locator('#simpleGateTableBody').innerText()).toBe(simple.gates);

  const published = await page.evaluate(() => globalThis.RLDATA?.toolRead?.('technical-analysis-decision-lab') ?? null);
  expect(published?.metrics?.decisionRead?.resultIdentity).toBe(simple.identity);
  console.log(`[SCN-007-023] identity=${simple.identity.slice(0, 30)} modeSwitchRequests=${requests.length}`);
});

test('Regression: SCN-007-029 invalid configuration preserves last valid identity and corrects without refetch', async ({ page }) => {
  await projection(page, baseUrl);
  const valid = await page.locator('#simpleResultIdentity').innerText();
  const validGates = await page.locator('#simpleGateTableBody').innerText();

  const requests = [];
  page.on('request', (request) => requests.push(new URL(request.url()).pathname));

  // An invalid request must be REFUSED with observed/required/action and must not overwrite the
  // last valid result, nor recompute it under a fallback.
  const rejected = await page.evaluate(() => publishProjection({}, {}, { asOf: '2026-02-13T21:00:00.000Z', complete: true }));
  expect(rejected.ok).toBe(false);
  expect(rejected.errors[0].code).toBe('TAD-VIEWMODEL-INPUT');
  expect(await page.locator('#simpleResultIdentity').innerText()).toBe(valid);
  expect(await page.locator('#simpleGateTableBody').innerText()).toBe(validGates);
  const message = (await page.locator('#simpleVerdict').innerText()).replace(/\s+/g, ' ');
  expect(message).toContain('was rejected');
  expect(message).toContain('Required:');
  expect(message).toContain('Action:');
  expect(message).toContain('remains shown below and is unchanged');
  expect(message).toContain(valid);

  // Correcting the input recomputes the requested identity with no source refetch.
  const corrected = await page.evaluate(() => {
    const model = tadProjection.lastValid;
    return publishProjection(
      { readId: model.resultIdentity, state: 'NO_EDGE', ranked: [] },
      { gates: model.gates, truthState: 'degraded', decisionCutoff: model.truth.decisionCutoff, sourceSetId: model.truth.sourceSetId, caveats: model.caveats },
      { asOf: '2026-02-13T21:00:00.000Z', complete: true }
    );
  });
  expect(corrected.ok).toBe(true);
  expect(await page.locator('#simpleResultIdentity').innerText()).toBe(valid);
  expect(requests).toEqual([]);
  console.log(`[SCN-007-029] refusedCode=${rejected.errors[0].code} recomputeRequests=${requests.length}`);
});

test('Regression: SCN-007-023 mobile keyboard tables and background-tab canvases remain equivalent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await projection(page, baseUrl);

  // Nothing overflows the body at a phone width.
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  // Touch targets meet the 44px minimum.
  const modeBox = await page.locator('#modeSeg button[data-mode="power"]').boundingBox();
  expect(modeBox.height).toBeGreaterThanOrEqual(44);
  expect(modeBox.width).toBeGreaterThanOrEqual(44);

  // Keyboard reaches the mode control and activates it without a pointer.
  await page.locator('#modeSeg button[data-mode="simple"]').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#modeSeg button[data-mode="power"]')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveClass(/power/);
  await page.locator('#modeSeg button[data-mode="simple"]').click();

  // The accessible table carries the same gate facts as the canvas.
  const tableRows = await page.locator('#simpleGateTableBody tr').count();
  const canvasGates = await page.evaluate(() => tadProjection.viewModel.gates.length);
  expect(tableRows).toBe(canvasGates);
  expect(tableRows).toBeGreaterThan(0);
  const firstRow = (await page.locator('#simpleGateTableBody tr').first().innerText()).replace(/\s+/g, ' ');
  const firstGate = await page.evaluate(() => tadProjection.viewModel.gates[0]);
  expect(firstRow).toContain(firstGate.gateId);
  expect(firstRow).toContain(firstGate.outcome);

  // A canvas drawn while its tab is backgrounded must still contain pixels.
  const nonBlank = await page.evaluate(() => {
    const canvas = document.getElementById('simpleGateCanvas');
    drawGateCanvas();
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return true;
    return false;
  });
  expect(nonBlank).toBe(true);

  // Redrawing after a mode round trip leaves it non-blank too, which is the real background case:
  // a canvas hidden at draw time has zero client width and would otherwise render empty.
  await page.locator('#modeSeg button[data-mode="power"]').click();
  await page.locator('#modeSeg button[data-mode="simple"]').click();
  const stillNonBlank = await page.evaluate(() => {
    const canvas = document.getElementById('simpleGateCanvas');
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return true;
    return false;
  });
  expect(stillNonBlank).toBe(true);
  console.log(`[SCN-007-023] mobileOverflow=${overflow} tableRows=${tableRows} canvasNonBlank=${nonBlank && stillNonBlank}`);
});

test('Regression: SCN-007-029 truth recovery preserves last valid identity across source and method failures', async ({ page }) => {
  await projection(page, baseUrl);
  const valid = await page.locator('#simpleResultIdentity').innerText();

  // Each failure mode must refuse with its own code and leave the committed result untouched.
  const failures = await page.evaluate(() => ({
    noRead: publishProjection(null, {}, { asOf: '2026-02-13T21:00:00.000Z', complete: true }).errors[0].code,
    noReadId: publishProjection({ state: 'NO_EDGE' }, {}, { asOf: '2026-02-13T21:00:00.000Z', complete: true }).errors[0].code,
    incomplete: tadBuildToolDecisionRead(tadProjection.viewModel, { asOf: '2026-02-13T21:00:00.000Z', complete: false }).errors[0].code,
    noAsOf: tadBuildToolDecisionRead(tadProjection.viewModel, { complete: true }).errors[0].code
  }));
  expect(failures.noRead).toBe('TAD-VIEWMODEL-INPUT');
  expect(failures.noReadId).toBe('TAD-VIEWMODEL-INPUT');
  expect(failures.incomplete).toBe('TAD-TOOLREAD-INCOMPLETE');
  expect(failures.noAsOf).toBe('TAD-TOOLREAD-ASOF');
  expect(await page.locator('#simpleResultIdentity').innerText()).toBe(valid);

  // A degraded truth state is carried through, never upgraded to current by a later projection.
  const truth = await page.evaluate(() => ({
    viewModel: tadProjection.viewModel.truth.state,
    published: globalThis.RLDATA?.toolRead?.('technical-analysis-decision-lab')?.metrics?.decisionRead?.truthState ?? null
  }));
  expect(truth.viewModel).toBe('degraded');
  expect(truth.published).toBe('degraded');
  const truthWord = (await page.locator('#truthState').innerText()).trim();
  expect(truthWord).toBe('DEGRADED');
  // The visible read must not claim a neutral or current substitute for a degraded state.
  const simpleTruth = (await page.locator('#simpleTruth').innerText()).replace(/\s+/g, ' ');
  expect(simpleTruth).toContain('degraded');
  expect(simpleTruth).not.toMatch(/(?<!not )(?<!never )\bcurrent\b/);
  console.log(`[SCN-007-029] failures=${JSON.stringify(failures)} truth=${truth.published}`);
});

test('Regression: SCN-007-023 registration navigation and state-faithful owner publication stay in parity', async ({ page }) => {
  // The registered route is reachable from the landing page, from the shared nav, and directly.
  const landing = await page.goto(`${baseUrl}/index.html`);
  expect(landing && landing.ok()).toBeTruthy();
  const landingLink = page.locator('a[href="technical-analysis-decision-lab.html"]').first();
  await expect(landingLink).toHaveCount(1);

  await projection(page, baseUrl);
  const identity = await page.locator('#simpleResultIdentity').innerText();

  // The shared nav on the tool page also carries the registered route.
  const navHrefs = await page.evaluate(() => Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href')));
  expect(navHrefs).toContain('technical-analysis-decision-lab.html');

  // Publication is state-faithful: it carries the exact committed identity and truth, and it
  // upgrades nothing. The nested contract is the Feature 007 one, not a generic stand-in.
  const published = await page.evaluate(() => globalThis.RLDATA?.toolRead?.('technical-analysis-decision-lab') ?? null);
  expect(published).toBeTruthy();
  expect(published.contractVersion).toBe('rl-tool-read/v1');
  expect(published.id).toBe('technical-analysis-decision-lab');
  expect(published.metrics.decisionRead.contractVersion).toBe('tad-tool-decision-read/v1');
  expect(published.metrics.decisionRead.resultIdentity).toBe(identity);
  expect(published.metrics.decisionRead.truthState).toBe('degraded');
  expect(published.metrics.decisionRead.educationalOnly).toBe(true);
  expect(published.deepLink).toBe('technical-analysis-decision-lab.html?fixture=gate-synthesis');
  expect(published.metrics.decisionRead.limitations.join(' ')).toMatch(/not investment advice/);
  console.log(`[SCN-007-023] registeredRoute=ok publishedIdentity=${published.metrics.decisionRead.resultIdentity.slice(0, 30)}`);
});

test('Regression: SCN-007-023 imported labels stay text and sanitized export omits sensitive state', async ({ page }) => {
  await projection(page, baseUrl);

  // A hostile label must reach the DOM as TEXT. If it were injected as markup the img would exist.
  const hostile = '<img src=x onerror="window.__TAD_XSS__=1">';
  await page.evaluate((label) => { setText('simpleVerdict', label); }, hostile);
  expect(await page.evaluate(() => window.__TAD_XSS__ ?? null)).toBeNull();
  expect(await page.locator('#simpleVerdict').innerText()).toContain('<img');
  expect(await page.evaluate(() => document.querySelectorAll('#simpleVerdict img').length)).toBe(0);

  // The export carries the full public identity and drops every sensitive key, naming what it dropped.
  const exported = await page.evaluate(() => tadBuildExport(tadProjection.viewModel, {
    sourceVintage: 'analytic-gate-fixture',
    apiKey: 'SHOULD-NOT-APPEAR', credentials: { token: 'SHOULD-NOT-APPEAR' },
    holdings: [{ symbol: 'X', costBasis: 1 }], account: { balance: 5 },
    privateNotes: 'SHOULD-NOT-APPEAR', nested: { authorization: 'SHOULD-NOT-APPEAR', keep: 'public' }
  }));
  expect(exported.ok).toBe(true);
  expect(exported.export.contractVersion).toBe('tad-export/v1');
  expect(exported.export.resultIdentity).toMatch(/^tad-read:[a-f0-9]{64}$/);
  const flat = JSON.stringify(exported.export);
  expect(flat).not.toContain('SHOULD-NOT-APPEAR');
  ['apiKey', 'credentials', 'holdings', 'account', 'privateNotes', 'authorization', 'costBasis', 'balance']
    .forEach((key) => expect(flat).not.toContain(`"${key}"`));
  expect(exported.export.audit.nested.keep).toBe('public');
  expect(exported.omittedKeys.length).toBeGreaterThanOrEqual(6);
  expect(exported.export.educationalOnly).toBe(true);
  expect(exported.export.boundary).toMatch(/Not investment advice/);
  console.log(`[SCN-007-023] xss=blocked omittedKeys=${exported.omittedKeys.length}`);
});
/* ---------- End Feature 007 Scope 08: experience publication and registration ---------- */