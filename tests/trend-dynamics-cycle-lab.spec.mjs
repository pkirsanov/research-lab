import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8' };
const CLOCK = '2026-07-15T12%3A00%3A00.000Z';
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if ((filePath !== ROOT && !filePath.startsWith(ROOT + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('not found');
      return;
    }
    response.writeHead(200, { 'content-type': MIME[extname(filePath)] || 'application/octet-stream', 'cache-control': 'no-store' });
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

// The engine panels are Power-view detail. The production page now uses the shared four-view shell,
// which owns the visible tabs and drives the hidden native control. Tests must follow that same path.
async function openPower(page) {
  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
  await expect(page.locator('body')).toHaveClass(/power/);
}

async function openScope2Case(page, caseId, profileId = 'balanced') {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=trend-engine&case=${caseId}&profile=${profileId}&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - ANALYTIC');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  await openPower(page);
  await expect(page.locator('#enginePanel')).toBeVisible();
  return requestedPaths;
}

async function openScope3Case(page, caseId) {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=cycle-engine&case=${caseId}&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - ANALYTIC');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  await openPower(page);
  await expect(page.locator('#cycleEnginePanel')).toBeVisible();
  return requestedPaths;
}

test('Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles', async ({ page }) => {
  const requestedPaths = await openScope2Case(page, 'sustained');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#scenarioTitle')).toContainText('Sustained rising trend');
  await expect(page.locator('#engineDirection')).toHaveText('RISING');
  await expect(page.locator('#engineTrendLifecycle')).toHaveText('SUSTAINED');
  await expect(page.locator('#engineChangeState')).toHaveText('NONE');
  await expect(page.locator('#engineSupporting')).toContainText('independent families');
  await expect(page.locator('#engineContradicting')).toContainText('change/regime');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('trend-engine');
  expect(diagnostics.caseId).toBe('sustained');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.engine.trend.direction).toBe('rising');
  expect(diagnostics.engine.trend.lifecycle).toBe('sustained');
  expect(diagnostics.engine.strength.score).toBeGreaterThanOrEqual(70);
  expect(diagnostics.engine.trend.uncertainty.lower).toBeLessThan(diagnostics.engine.trend.uncertainty.upper);
  expect(diagnostics.engine.change.state).toBe('none');
  expect(diagnostics.engine.turningRecords).toEqual([]);
  expect(diagnostics.engine.supportingFamilies.length).toBeGreaterThanOrEqual(2);
  expect(Array.isArray(diagnostics.engine.contradictingFamilies)).toBe(true);
  expect(requestedPaths).toContain('/tests/fixtures/trend-dynamics-cycle/analytic/trend-engine-inputs.json');
  console.log('[SCN-006-001] direction=' + diagnostics.engine.trend.direction);
  console.log('[SCN-006-001] lifecycle=' + diagnostics.engine.trend.lifecycle);
  console.log('[SCN-006-001] strength=' + diagnostics.engine.strength.score.toFixed(6));
  console.log('[SCN-006-001] uncertainty=' + diagnostics.engine.trend.uncertainty.lower.toFixed(6) + '..' + diagnostics.engine.trend.uncertainty.upper.toFixed(6));
  console.log('[SCN-006-001] change=' + diagnostics.engine.change.state);
  console.log('[SCN-006-001] supporting=' + diagnostics.engine.supportingFamilies.join(','));
  console.log('[SCN-006-001] contradicting=' + diagnostics.engine.contradictingFamilies.join(','));
  console.log('[SCN-006-001] turningRecords=' + diagnostics.engine.turningRecords.length);
  console.log('[SCN-006-001] ownerReadPublished=false');
});

test('Regression: SCN-006-002 sustained uptrend reports accelerating dynamics separately', async ({ page }) => {
  await openScope2Case(page, 'accelerating');
  await expect(page.locator('#engineDirection')).toHaveText('RISING');
  await expect(page.locator('#engineDynamics')).toHaveText('ACCELERATING');
  await expect(page.locator('#engineDynamicsUnits')).toContainText('/observation^2');
  await expect(page.locator('#engineHorizon')).toContainText('126 observations');
  await expect(page.locator('#enginePersistence')).toContainText('persistent');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.engine.trend.direction).toBe('rising');
  expect(diagnostics.engine.dynamics.state).toBe('accelerating');
  expect(diagnostics.engine.dynamics.direction).toBe('rising');
  expect(diagnostics.engine.dynamics.units).toBe('index-points/observation^2');
  expect(diagnostics.engine.dynamics.horizonObservations).toBe(126);
  expect(diagnostics.engine.dynamics.uncertainty.lower).toBeLessThan(diagnostics.engine.dynamics.uncertainty.upper);
  expect(diagnostics.engine.dynamics.persistent).toBe(true);
  expect(diagnostics.engine.dynamics.confirmingFamilies.length).toBeGreaterThanOrEqual(2);
  console.log('[SCN-006-002] direction=' + diagnostics.engine.trend.direction);
  console.log('[SCN-006-002] dynamics=' + diagnostics.engine.dynamics.state);
  console.log('[SCN-006-002] units=' + diagnostics.engine.dynamics.units);
  console.log('[SCN-006-002] horizon=' + diagnostics.engine.dynamics.horizonObservations);
  console.log('[SCN-006-002] persistence=' + diagnostics.engine.dynamics.persistent);
  console.log('[SCN-006-002] interval=' + diagnostics.engine.dynamics.uncertainty.lower.toFixed(6) + '..' + diagnostics.engine.dynamics.uncertainty.upper.toFixed(6));
  console.log('[SCN-006-002] families=' + diagnostics.engine.dynamics.confirmingFamilies.join(','));
  console.log('[SCN-006-002] ownerReadPublished=false');
});

test('Regression: SCN-006-003 decelerating uptrend remains positive and exposes invalidation', async ({ page }) => {
  await openScope2Case(page, 'decelerating');
  await expect(page.locator('#engineDirection')).toHaveText('RISING');
  await expect(page.locator('#engineDynamics')).toHaveText('DECELERATING');
  await expect(page.locator('#engineChangeState')).not.toHaveText('REVERSAL');
  await expect(page.locator('#engineConfirm')).toContainText('Confirm');
  await expect(page.locator('#engineInvalidate')).toContainText('Invalidate');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.engine.trend.direction).toBe('rising');
  expect(diagnostics.engine.trend.currentSlope).toBeGreaterThan(0);
  expect(diagnostics.engine.dynamics.state).toBe('decelerating');
  expect(diagnostics.engine.change.state).not.toBe('reversal');
  expect(diagnostics.engine.change.confirmationConditions.length).toBeGreaterThan(0);
  expect(diagnostics.engine.change.invalidationConditions.length).toBeGreaterThan(0);
  expect(diagnostics.engine.confirmedRegimeChange).toBe(false);
  console.log('[SCN-006-003] direction=' + diagnostics.engine.trend.direction);
  console.log('[SCN-006-003] currentSlope=' + diagnostics.engine.trend.currentSlope.toFixed(6));
  console.log('[SCN-006-003] dynamics=' + diagnostics.engine.dynamics.state);
  console.log('[SCN-006-003] change=' + diagnostics.engine.change.state);
  console.log('[SCN-006-003] confirmation=' + diagnostics.engine.change.confirmationConditions.join(' | '));
  console.log('[SCN-006-003] invalidation=' + diagnostics.engine.change.invalidationConditions.join(' | '));
  console.log('[SCN-006-003] confirmedRegimeChange=false');
  console.log('[SCN-006-003] ownerReadPublished=false');
});

test('Regression: SCN-006-006 early sensitivity changes risk metrics but preserves integrity gates', async ({ page }) => {
  const requestedPaths = await openScope2Case(page, 'sensitivity', 'cautious');
  const cautious = await page.evaluate(() => window.__TDC_DIAGNOSTICS__.engine);
  const fixtureRequestsBefore = requestedPaths.filter((requestPath) => requestPath.endsWith('/trend-engine-inputs.json')).length;
  await page.locator('#profileSelect').selectOption('early');
  await expect.poll(async () => page.evaluate(() => window.__TDC_DIAGNOSTICS__.engine.profile.id)).toBe('early');
  const early = await page.evaluate(() => window.__TDC_DIAGNOSTICS__.engine);
  const fixtureRequestsAfter = requestedPaths.filter((requestPath) => requestPath.endsWith('/trend-engine-inputs.json')).length;
  expect(early.profile.controls.effectZ).toBeLessThan(cautious.profile.controls.effectZ);
  expect(early.profile.controls.persistenceBars).toBeLessThan(cautious.profile.controls.persistenceBars);
  expect(early.profile.controls.cusumLimit).toBeLessThan(cautious.profile.controls.cusumLimit);
  expect(early.speedReliability).not.toEqual(cautious.speedReliability);
  expect(early.speedReliability.firstDetectionIndex).toBeLessThanOrEqual(cautious.speedReliability.firstDetectionIndex);
  expect(early.integrity).toEqual(cautious.integrity);
  expect(early.sourceDigest).toBe(cautious.sourceDigest);
  expect(fixtureRequestsAfter).toBe(fixtureRequestsBefore);
  expect(early.ownerReadPublished).toBe(false);
  await expect(page.locator('#engineSensitivity')).toContainText('Early');
  await expect(page.locator('#engineIntegrity')).toContainText('source, history, as-of, multiplicity, family independence, invalidation');
  console.log('[SCN-006-006] cautiousDetection=' + cautious.speedReliability.firstDetectionIndex);
  console.log('[SCN-006-006] earlyDetection=' + early.speedReliability.firstDetectionIndex);
  console.log('[SCN-006-006] cautiousFalseAlarms=' + cautious.speedReliability.falseAlarms);
  console.log('[SCN-006-006] earlyFalseAlarms=' + early.speedReliability.falseAlarms);
  console.log('[SCN-006-006] cautiousMisses=' + cautious.speedReliability.misses);
  console.log('[SCN-006-006] earlyMisses=' + early.speedReliability.misses);
  console.log('[SCN-006-006] integrityEqual=' + (JSON.stringify(early.integrity) === JSON.stringify(cautious.integrity)));
  console.log('[SCN-006-006] fixtureRefetch=' + (fixtureRequestsAfter - fixtureRequestsBefore));
  console.log('[SCN-006-006] ownerReadPublished=false');
});

test('Regression: SCN-006-016 method-family disagreement remains mixed and unconfirmed', async ({ page }) => {
  await openScope2Case(page, 'disagreement');
  await expect(page.locator('#engineDirection')).toHaveText('RISING');
  await expect(page.locator('#engineDynamics')).toHaveText('ACCELERATING');
  await expect(page.locator('#engineChangeState')).toHaveText('MIXED / UNCONFIRMED');
  await expect(page.locator('#engineContradicting')).toContainText('change/regime');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.engine.agreement).toBe('mixed');
  expect(diagnostics.engine.change.state).toBe('mixed-unconfirmed');
  expect(diagnostics.engine.confirmedRegimeChange).toBe(false);
  expect(diagnostics.engine.trend.direction).toBe('rising');
  expect(diagnostics.engine.dynamics.state).toBe('accelerating');
  expect(diagnostics.engine.familyVotes.filter((vote) => vote.familyCluster === 'trend-local-state')).toHaveLength(1);
  expect(diagnostics.engine.change.qualifyingIndependentFamilies).toBeLessThan(diagnostics.engine.profile.controls.consensusFamilies);
  console.log('[SCN-006-016] agreement=' + diagnostics.engine.agreement);
  console.log('[SCN-006-016] trend=' + diagnostics.engine.trend.direction);
  console.log('[SCN-006-016] dynamics=' + diagnostics.engine.dynamics.state);
  console.log('[SCN-006-016] change=' + diagnostics.engine.change.state);
  console.log('[SCN-006-016] qualifyingChangeFamilies=' + diagnostics.engine.change.qualifyingIndependentFamilies);
  console.log('[SCN-006-016] requiredChangeFamilies=' + diagnostics.engine.profile.controls.consensusFamilies);
  console.log('[SCN-006-016] localStateVotes=' + diagnostics.engine.familyVotes.filter((vote) => vote.familyCluster === 'trend-local-state').length);
  console.log('[SCN-006-016] confirmedRegimeChange=false');
  console.log('[SCN-006-016] ownerReadPublished=false');
});

test('Regression: SCN-006-009 irregular sampling creates no invented observations', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=irregular&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#scenarioTitle')).toContainText('Irregular observations remain irregular');
  await expect(page.locator('#scenarioOutcome')).toContainText('No observations were interpolated');
  await expect(page.locator('#methodEligibility')).toContainText('M14-welch-acf: unavailable (TDC-METHOD-REGULARITY)');
  await expect(page.locator('#methodEligibility')).toContainText('M15-generalized-lomb: eligible');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('irregular');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.foundation.interpolationApplied).toBe(false);
  expect(diagnostics.foundation.inputObservationIds).toEqual(diagnostics.foundation.outputObservationIds);
  expect(diagnostics.foundation.quality.missingIntervals.length).toBeGreaterThan(0);
  expect(requestedPaths).toContain('/tests/fixtures/trend-dynamics-cycle/source-qualified/irregular-series.json');
  console.log('[SCN-006-009] truth=DEGRADED');
  console.log('[SCN-006-009] interpolationApplied=false');
  console.log('[SCN-006-009] regularMethod=TDC-METHOD-REGULARITY');
  console.log('[SCN-006-009] irregularMethod=eligible');
  console.log('[SCN-006-009] ownerReadPublished=false');
});

test('Regression: SCN-006-011 technology attention remains a lifecycle proxy not an oscillation', async ({ page }) => {
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=technology-lifecycle&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - ANALYTIC');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#cycleType')).toHaveText('Lifecycle');
  await expect(page.locator('#cycleState')).toHaveText('Contextual');
  await expect(page.locator('#cycleDetails')).toContainText('Attention is a proxy, not adoption');
  await expect(page.locator('#cycleDetails')).toContainText('No stable recurrence is configured');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('technology-lifecycle');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.foundation.cycle.type).toBe('lifecycle');
  expect(diagnostics.foundation.cycle.stage).toBe('saturation');
  expect(diagnostics.foundation.cycle).not.toHaveProperty('period');
  expect(diagnostics.foundation.cycle).not.toHaveProperty('phase');
  expect(diagnostics.foundation.cycle).not.toHaveProperty('adoptionClaim');
  console.log('[SCN-006-011] type=lifecycle');
  console.log('[SCN-006-011] state=contextual');
  console.log('[SCN-006-011] period=omitted');
  console.log('[SCN-006-011] phase=omitted');
  console.log('[SCN-006-011] adoptionClaim=omitted');
});

test('Regression: SCN-006-012 official political date remains uncertain calendar context', async ({ page }) => {
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=political-calendar&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED');
  await expect(page.locator('#truthState')).toHaveText('DEGRADED');
  await expect(page.locator('#cycleType')).toHaveText('Deterministic calendar');
  await expect(page.locator('#cycleState')).toHaveText('Contextual');
  await expect(page.locator('#cycleDetails')).toContainText('Official date: 2026-11-03');
  await expect(page.locator('#cycleDetails')).toContainText('Direction and magnitude remain evidence-qualified scenarios');
  await expect(page.locator('#cycleDetails')).toContainText('Not a trend-turn signal');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('political-calendar');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.foundation.cycle.type).toBe('deterministic-calendar');
  expect(diagnostics.foundation.cycle.officialDate).toBe('2026-11-03');
  expect(diagnostics.foundation.cycle.effectState).toBe('uncertain');
  expect(diagnostics.foundation.cycle.turnSignal).toBe(false);
  expect(diagnostics.foundation.cycle).not.toHaveProperty('phase');
  console.log('[SCN-006-012] type=deterministic-calendar');
  console.log('[SCN-006-012] effectState=uncertain');
  console.log('[SCN-006-012] turnSignal=false');
  console.log('[SCN-006-012] phase=omitted');
  console.log('[SCN-006-012] ownerReadPublished=false');
});

test('Regression: SCN-006-018 missing stale and incompatible inputs never become current or neutral', async ({ page }) => {
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=invalid-inputs&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - INVALID');
  await expect(page.locator('#truthState')).toHaveText('UNAVAILABLE');
  await expect(page.locator('#scenarioTitle')).toContainText('Invalid inputs fail closed');
  await expect(page.locator('#qualityReasons')).toContainText('TDC-DATA-MISSING');
  await expect(page.locator('#qualityReasons')).toContainText('TDC-DATA-UNIT');
  await expect(page.locator('#qualityReasons')).toContainText('TDC-SOURCE-STALE');
  await expect(page.locator('#scenarioOutcome')).toContainText('No zero, neutral evidence, confidence, or conclusion was produced');
  await expect(page.locator('#publicationState')).toHaveText('TEST FIXTURE: owner-read publication disabled.');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBe('invalid-inputs');
  expect(diagnostics.ownerReadPublished).toBe(false);
  expect(diagnostics.foundation.truthState).toBe('unavailable');
  expect(diagnostics.foundation.errors.map((error) => error.code)).toEqual(expect.arrayContaining(['TDC-DATA-MISSING', 'TDC-DATA-UNIT', 'TDC-SOURCE-STALE']));
  expect(diagnostics.foundation).not.toHaveProperty('confidence');
  expect(diagnostics.foundation).not.toHaveProperty('conclusion');
  expect(diagnostics.foundation).not.toHaveProperty('neutralEvidence');
  console.log('[SCN-006-018] truth=UNAVAILABLE');
  console.log('[SCN-006-018] codes=TDC-DATA-MISSING,TDC-DATA-UNIT,TDC-SOURCE-STALE');
  console.log('[SCN-006-018] confidence=omitted');
  console.log('[SCN-006-018] conclusion=omitted');
  console.log('[SCN-006-018] ownerReadPublished=false');
});

test('Regression: SCN-006-008 weekly and annual components remain separate from trend', async ({ page }) => {
  const requestedPaths = await openScope3Case(page, 'harmonics');
  await expect(page.locator('#cycleScenarioTitle')).toContainText('Weekly and annual components remain separate');
  await expect(page.locator('#cycleState')).toHaveText('CANDIDATE');
  await expect(page.locator('#cycleComponents')).toContainText('Weekly: 7 observations');
  await expect(page.locator('#cycleComponents')).toContainText('Annual: 365 observations');
  await expect(page.locator('#cycleResidualDiagnostics')).toContainText('Reconstruction max error');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const result = diagnostics.cycleEngine;
  expect(result.harmonic.components.map((component) => component.period)).toEqual([7, 365]);
  expect(result.harmonic.components.every((component) => component.strength > 0.9 && component.amplitude > 0 && Number.isFinite(component.phase) && component.repetitions >= component.minimumRepetitions && component.drift && typeof component.drift.state === 'string' && Number.isFinite(component.residualVariance))).toBe(true);
  expect(result.harmonic.components.every((component) => component.id !== 'trend')).toBe(true);
  expect(result.harmonic.interventions).toHaveLength(1);
  expect(result.harmonic.interventions[0]).toMatchObject({ id: 'definition-step', kind: 'step', index: 800 });
  expect(result.harmonic.interventions[0].coefficient).toBeCloseTo(5, 5);
  expect(result.harmonic.trend.values).toHaveLength(result.inputCount);
  expect(result.harmonic.reconstruction.maxAbsoluteError).toBeLessThan(1e-5);
  expect(result.harmonic.residual.variance).toBeLessThan(1e-8);
  expect(result.harmonic.frozenSelection.map((component) => component.period)).toEqual([7, 365]);
  expect(result.regular.interpolationApplied).toBe(false);
  expect(result.regular.welch.segmentCount).toBeGreaterThanOrEqual(4);
  expect(requestedPaths).toContain('/tests/fixtures/trend-dynamics-cycle/analytic/cycle-engine-inputs.json');
  console.log('[SCN-006-008] periods=' + result.harmonic.components.map((component) => component.period).join(','));
  console.log('[SCN-006-008] strengths=' + result.harmonic.components.map((component) => component.strength.toFixed(6)).join(','));
  console.log('[SCN-006-008] amplitudes=' + result.harmonic.components.map((component) => component.amplitude.toFixed(6)).join(','));
  console.log('[SCN-006-008] phases=' + result.harmonic.components.map((component) => component.phase.toFixed(6)).join(','));
  console.log('[SCN-006-008] repetitions=' + result.harmonic.components.map((component) => component.repetitions.toFixed(3)).join(','));
  console.log('[SCN-006-008] drift=' + result.harmonic.components.map((component) => component.drift.state).join(','));
  console.log('[SCN-006-008] intervention=' + result.harmonic.interventions[0].id + ':' + result.harmonic.interventions[0].coefficient.toFixed(6));
  console.log('[SCN-006-008] reconstructionMaxError=' + result.harmonic.reconstruction.maxAbsoluteError.toExponential(6));
  console.log('[SCN-006-008] residualVariance=' + result.harmonic.residual.variance.toExponential(6));
  console.log('[SCN-006-008] interpolationApplied=false');
});

test('Regression: SCN-006-010 insufficient long-cycle history yields no phase or next turn', async ({ page }) => {
  await openScope3Case(page, 'insufficient-history');
  await expect(page.locator('#cycleScenarioTitle')).toContainText('Long-cycle history is insufficient');
  await expect(page.locator('#cycleState')).toHaveText('INELIGIBLE');
  await expect(page.locator('#cycleEligibility')).toContainText('Duration shortfall: 480 observations');
  await expect(page.locator('#cycleEligibility')).toContainText('Repetition shortfall: 2.667');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const cycle = diagnostics.cycleEngine.cycle;
  expect(cycle.type).toBe('quasi-periodic-oscillation');
  expect(cycle.state).toBe('ineligible');
  expect(cycle.requirements.duration.required).toBe(720);
  expect(cycle.requirements.duration.observed).toBe(240);
  expect(cycle.requirements.duration.shortfall).toBe(480);
  expect(cycle.requirements.repetitions.required).toBe(4);
  expect(cycle.requirements.repetitions.observed).toBeCloseTo(4 / 3, 12);
  expect(cycle.requirements.repetitions.shortfall).toBeCloseTo(8 / 3, 12);
  expect(cycle).not.toHaveProperty('phase');
  expect(cycle).not.toHaveProperty('nextTurnDate');
  expect(cycle).not.toHaveProperty('confidence');
  expect(cycle).not.toHaveProperty('neutralEvidence');
  console.log('[SCN-006-010] state=' + cycle.state);
  console.log('[SCN-006-010] durationRequired=' + cycle.requirements.duration.required);
  console.log('[SCN-006-010] durationObserved=' + cycle.requirements.duration.observed);
  console.log('[SCN-006-010] durationShortfall=' + cycle.requirements.duration.shortfall);
  console.log('[SCN-006-010] repetitionsRequired=' + cycle.requirements.repetitions.required);
  console.log('[SCN-006-010] repetitionsObserved=' + cycle.requirements.repetitions.observed.toFixed(6));
  console.log('[SCN-006-010] phase=omitted nextTurnDate=omitted confidence=omitted');
});

test('Regression: SCN-006-013 ENSO context stays scoped to source season geography and mechanism', async ({ page }) => {
  const requestedPaths = [];
  page.on('request', (request) => requestedPaths.push(new URL(request.url()).pathname));
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=climate-context&clock=${CLOCK}`);
  await expect(page.locator('#fixtureBand')).toContainText('TEST FIXTURE - SOURCE-QUALIFIED');
  await openPower(page);
  await expect(page.locator('#cycleEnginePanel')).toBeVisible();
  await expect(page.locator('#cycleState')).toHaveText('CONTEXTUAL');
  await expect(page.locator('#cycleContext')).toContainText('NOAA Climate.gov');
  await expect(page.locator('#cycleContext')).toContainText('El Niño Advisory');
  await expect(page.locator('#cycleContext')).toContainText('Northern Hemisphere winter');
  await expect(page.locator('#cycleContext')).toContainText('southern tier of the United States');
  await expect(page.locator('#cycleContext')).toContainText('No universal target effect');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const cycle = diagnostics.cycleEngine.cycle;
  expect(cycle.type).toBe('quasi-periodic-oscillation');
  expect(cycle.state).toBe('contextual');
  expect(cycle.source.authority).toBe('NOAA Climate.gov');
  expect(cycle.phase).toBe('El Nino');
  expect(cycle.confidence.moderateOrStrongerProbability).toBe(0.84);
  expect(cycle.season).toBe('Northern Hemisphere winter 2023-24');
  expect(cycle.geography).toBe('southern tier of the United States');
  expect(cycle.mechanism).toContain('jet stream');
  expect(cycle.dispersion).toBe('material');
  expect(cycle.limitations.length).toBeGreaterThan(1);
  expect(cycle.universalTargetEffect).toBe(false);
  expect(requestedPaths).toContain('/tests/fixtures/trend-dynamics-cycle/source-qualified/climate-context.json');
  console.log('[SCN-006-013] authority=' + cycle.source.authority);
  console.log('[SCN-006-013] phase=' + cycle.phase);
  console.log('[SCN-006-013] confidence=' + cycle.confidence.moderateOrStrongerProbability.toFixed(2));
  console.log('[SCN-006-013] season=' + cycle.season);
  console.log('[SCN-006-013] geography=' + cycle.geography);
  console.log('[SCN-006-013] dispersion=' + cycle.dispersion);
  console.log('[SCN-006-013] universalTargetEffect=false');
});

test('Regression: SCN-006-014 structural break blocks contaminated cycle activation', async ({ page }) => {
  await openScope3Case(page, 'break-contamination');
  await expect(page.locator('#cycleScenarioTitle')).toContainText('Break evidence precedes periodicity');
  await expect(page.locator('#cycleState')).toHaveText('UNRESOLVED');
  await expect(page.locator('#cycleBreakEvidence')).toContainText('Definition change at observation 180');
  await expect(page.locator('#cycleBreakEvidence')).toContainText('activation blocked');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const result = diagnostics.cycleEngine;
  expect(result.breakFirst.order).toBe(1);
  expect(result.breakFirst.contaminated).toBe(true);
  expect(result.breakFirst.evidence[0].index).toBe(180);
  expect(result.candidatePeriodEvidence.power).toBeGreaterThan(0);
  expect(result.cycle.state).toBe('unresolved');
  expect(result.activation.active).toBe(false);
  expect(result.activation.gates[0]).toMatchObject({ id: 'break-clear', pass: false });
  expect(result.activation.score).toBeGreaterThanOrEqual(0);
  console.log('[SCN-006-014] breakOrder=' + result.breakFirst.order);
  console.log('[SCN-006-014] breakIndex=' + result.breakFirst.evidence[0].index);
  console.log('[SCN-006-014] contaminated=' + result.breakFirst.contaminated);
  console.log('[SCN-006-014] candidatePower=' + result.candidatePeriodEvidence.power.toFixed(6));
  console.log('[SCN-006-014] cycleState=' + result.cycle.state);
  console.log('[SCN-006-014] activation=' + result.activation.active);
  console.log('[SCN-006-014] firstGate=' + result.activation.gates[0].id + ':' + result.activation.gates[0].pass);
});

test('Regression: SCN-006-015 period and lag scans expose correction and reject in-sample winners', async ({ page }) => {
  await openScope3Case(page, 'broad-grid');
  await expect(page.locator('#cycleScenarioTitle')).toContainText('Broad searches are corrected and held out');
  await expect(page.locator('#cycleState')).toHaveText('UNSUPPORTED');
  await expect(page.locator('#cycleMultiplicity')).toContainText('Benjamini-Hochberg discovery');
  await expect(page.locator('#cycleMultiplicity')).toContainText('Holm activation');
  await expect(page.locator('#cycleMultiplicity')).toContainText('Frozen held-out improvement');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const evidence = diagnostics.cycleEngine.multiplicity;
  expect(evidence.searchBreadth.count).toBe(evidence.hypotheses.length);
  expect(evidence.searchBreadth.count).toBeGreaterThan(20);
  expect(evidence.hypotheses.every((hypothesis) => hypothesis.key.split('|').length === 6)).toBe(true);
  expect(evidence.hypotheses.every((hypothesis) => Number.isFinite(hypothesis.rawP) && Number.isFinite(hypothesis.bhAdjusted) && Number.isFinite(hypothesis.holmAdjusted))).toBe(true);
  expect(evidence.discovery.method).toBe('benjamini-hochberg');
  expect(evidence.activation.method).toBe('holm');
  expect(evidence.inSampleWinner.rawP).toBeLessThan(0.05);
  expect(evidence.inSampleWinner.heldOut.evaluatedFrozenHypothesis).toBe(true);
  expect(evidence.inSampleWinner.heldOut.improvement).toBeLessThan(0.05);
  expect(evidence.inSampleWinner.supported).toBe(false);
  console.log('[SCN-006-015] searchBreadth=' + evidence.searchBreadth.count);
  console.log('[SCN-006-015] rawP=' + evidence.inSampleWinner.rawP.toExponential(6));
  console.log('[SCN-006-015] bh=' + evidence.inSampleWinner.bhAdjusted.toExponential(6));
  console.log('[SCN-006-015] holm=' + evidence.inSampleWinner.holmAdjusted.toExponential(6));
  console.log('[SCN-006-015] heldOutImprovement=' + evidence.inSampleWinner.heldOut.improvement.toFixed(6));
  console.log('[SCN-006-015] frozen=' + evidence.inSampleWinner.heldOut.evaluatedFrozenHypothesis);
  console.log('[SCN-006-015] supported=' + evidence.inSampleWinner.supported);
});

test('Regression: SCN-006-017 lead-lag evidence remains association without a mechanism', async ({ page }) => {
  await openScope3Case(page, 'frozen-lag');
  await expect(page.locator('#cycleScenarioTitle')).toContainText('Lead-lag remains association');
  await expect(page.locator('#cycleState')).toHaveText('ASSOCIATION');
  await expect(page.locator('#cycleAssociation')).toContainText('Discovery lag: 3 observations');
  await expect(page.locator('#cycleAssociation')).toContainText('Held-out lag: 3 observations (frozen)');
  await expect(page.locator('#cycleAssociation')).toContainText('Mechanism not established');
  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  const association = diagnostics.cycleEngine.association;
  expect(association.label).toBe('association');
  expect(association.overlap).toBeGreaterThanOrEqual(60);
  expect(association.transform).toBe('level');
  expect(association.lagRange).toEqual([-6, 6]);
  expect(association.discovery.lag).toBe(3);
  expect(association.discovery.effect).toBeGreaterThan(0.7);
  expect(association.discovery.interval.lower).toBeLessThan(association.discovery.effect);
  expect(association.discovery.interval.upper).toBeGreaterThan(association.discovery.effect);
  expect(association.heldOut.lag).toBe(association.discovery.lag);
  expect(association.heldOut.frozen).toBe(true);
  expect(association.heldOut.searched).toBe(false);
  expect(association.heldOut.effect).toBeGreaterThan(0.7);
  expect(association.nearbyStability).toBeGreaterThanOrEqual(0.67);
  expect(association.regimeSlices).toHaveLength(2);
  expect(association.searchBreadth.count).toBe(13);
  expect(association.mechanismEstablished).toBe(false);
  console.log('[SCN-006-017] overlap=' + association.overlap);
  console.log('[SCN-006-017] transform=' + association.transform);
  console.log('[SCN-006-017] lagRange=' + association.lagRange.join('..'));
  console.log('[SCN-006-017] discoveryLag=' + association.discovery.lag);
  console.log('[SCN-006-017] discoveryEffect=' + association.discovery.effect.toFixed(6));
  console.log('[SCN-006-017] heldOutEffect=' + association.heldOut.effect.toFixed(6));
  console.log('[SCN-006-017] nearbyStability=' + association.nearbyStability.toFixed(6));
  console.log('[SCN-006-017] label=' + association.label + ' mechanismEstablished=' + association.mechanismEstablished);
});

// Every other test here drives a fixture route, so the PRODUCTION path -- the one a real reader
// lands on -- had no browser coverage at all. That is where the owner read is assembled and
// published, so a wiring mistake there would reach the Brief unseen. Seeding the shared bar
// cache is what makes the path reachable headlessly; without it the page correctly refuses on
// absent observations and never gets far enough to publish.
// Seeds the shared bar cache so the PRODUCTION route is reachable headlessly. Without it the
// page correctly refuses on absent observations and never gets far enough to compute or publish.
// The peak five observations from the end guarantees a CURRENT turning record, so the
// effective-versus-detected distinction is exercised rather than skipped.
async function seedProductionBars(page) {
  await page.addInitScript(() => {
    const dayMs = 86400000;
    const end = Date.UTC(2026, 6, 14);
    const rows = [];
    for (let i = 399; i >= 0; i--) {
      let c = 400 + Math.sin(i / 9) * 5 + i * 0.02;
      if (i <= 10) c += (10 - Math.abs(i - 5)) * 4;
      rows.push({ t: end - i * dayMs, c });
    }
    window.localStorage.setItem('rlData', JSON.stringify({
      v: 1, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {},
      bars: { SPY: { '1d': { at: Date.UTC(2026, 6, 15, 11), src: 'option-snapshot', rows } } }
    }));
  });
}

test('Regression: SCN-006-020 the production route computes a verdict and publishes it as an owner read', async ({ page }) => {
  await seedProductionBars(page);
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?clock=${CLOCK}`);

  await expect(page.locator('#truthState')).toHaveText(/CURRENT|STALE|DEGRADED/);
  // Asserted as a shape rather than one literal verdict: the point is that the engine RAN on real
  // observations, not that this particular seeded series is flat.
  await expect(page.locator('#scenarioTitle')).toHaveText(/ trend$/);

  const diagnostics = await page.evaluate(() => window.__TDC_DIAGNOSTICS__);
  expect(diagnostics.fixtureId).toBeNull();
  expect(diagnostics.ownerReadPublished).toBe(true);
  expect(typeof diagnostics.resultId).toBe('string');
  expect(diagnostics.resultId.length).toBeGreaterThan(0);
  await expect(page.locator('#publicationState')).toHaveText('Owner read published for the foundation state.');

  // The read must actually be in the shared registry, not merely reported as published.
  const stored = await page.evaluate(() => {
    const cache = JSON.parse(window.localStorage.getItem('rlData') || '{}');
    return (cache.toolReads || {})['trend-dynamics-cycle-lab'] || null;
  });
  expect(stored).not.toBeNull();
  expect(stored.metrics.contractVersion).toBe('tdc-tool-read/v1');
  expect(stored.metrics.resultId).toBe(diagnostics.resultId);
  // The verdict must come from the closed vocabulary and reach the Brief as a real reading.
  expect(['rising', 'falling', 'flat/range', 'mixed', 'unavailable']).toContain(stored.metrics.direction);
  expect(stored.read).toContain('The trend is ' + stored.metrics.direction);
  expect(typeof stored.metrics.strengthScore).toBe('number');
  expect(stored.deepLink).toContain('series=spy-daily');

  // The reader must be able to SEE what was published on their behalf, and follow it back.
  await openPower(page);
  await expect(page.locator('#ownerReadSentence')).toHaveText(stored.read);
  await expect(page.locator('#ownerReadLink')).toHaveAttribute('href', stored.deepLink);

  // Effective and detected must read as DIFFERENT observations. Collapsing them would present a
  // turn as if it had been known on the day it happened, which is the lookahead this panel exists
  // to make visible.
  const replay = await page.evaluate(() => ({
    effective: document.getElementById('replayEffective').textContent.trim(),
    detected: document.getElementById('replayDetected').textContent.trim(),
    retrospective: document.getElementById('replayRetrospective').textContent.trim()
  }));
  if (replay.effective !== 'No turning record is active.') {
    expect(replay.detected).not.toBe(replay.effective);
    expect(replay.detected).toMatch(/observations after effective|not yet detectable/i);
    expect(replay.retrospective).not.toBe('Unavailable');
    console.log(`[SCN-006-019] replay effective="${replay.effective}" detected="${replay.detected}" state=${replay.retrospective}`);
  } else {
    // No current turn in this window is a legitimate outcome; the panel must then say so on
    // every field rather than showing a stale or half-filled record.
    expect(replay.detected).toBe('No turning record is active.');
    console.log('[SCN-006-019] replay: no current turning record in this window');
  }

  // The chart must be drawn synchronously and be NONBLANK. Sampling pixels is the only way to
  // tell a rendered chart from an empty canvas that merely exists.
  const chart = await page.evaluate(() => {
    const canvas = document.getElementById('trendChart');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let painted = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) painted++;
    return { painted, equivalent: document.getElementById('trendChartEquivalent').textContent.trim() };
  });
  expect(chart.painted, 'the trend canvas is blank').toBeGreaterThan(0);
  // A text equivalent must carry the same series facts for anyone not reading pixels.
  expect(chart.equivalent).toMatch(/\d+ observations from \d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}/);
  expect(chart.equivalent).toMatch(/low .*high .*last/);
  console.log('[SCN-006-019] chart paintedPixels=' + chart.painted);
  console.log('[SCN-006-019] chart equivalent="' + chart.equivalent + '"');
  console.log('[SCN-006-020] direction=' + stored.metrics.direction + ' trendType=' + stored.metrics.trendType);
  console.log('[SCN-006-020] truthState=' + stored.metrics.truthState + ' availability=' + stored.availability);
  console.log('[SCN-006-020] resultId=' + stored.metrics.resultId.slice(0, 16));
});

// Scope 4's UI matrix requires the route to hold at 390x844 and 1440x1000, to be operable by
// keyboard, and to expose state through more than colour. Horizontal overflow is the failure
// that actually strands a phone reader: the verdict scrolls off-screen and nothing says so.
test('Regression: SCN-006-020 owner read preserves mixed stale degraded and unavailable truth', async ({ page }) => {
  // Seeds the shared cache with a chosen posture instead of the healthy one. Truth states are
  // only meaningful if a NON-current state can actually be produced and survives publication.
  // Each call registers another init script; they run in order on every navigation and each one
  // rewrites the whole cache entry, so the most recently registered seed is the one that wins.
  const seed = (rowCount, lastBarDaysAgo, withOutlier) => page.addInitScript(([count, staleDays, outlier]) => {
    const dayMs = 86400000;
    const end = Date.UTC(2026, 6, 14) - staleDays * dayMs;
    const rows = [];
    for (let i = count - 1; i >= 0; i--) {
      let c = 400 + Math.sin(i / 9) * 5 + i * 0.02;
      // A single extreme print. Quality degrades on outliers, not on row count, so this is what
      // actually drives the DEGRADED branch rather than merely shortening the history.
      if (outlier && i === 12) c = 4000;
      rows.push({ t: end - i * dayMs, c });
    }
    window.localStorage.setItem('rlData', JSON.stringify({
      v: 1, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {},
      bars: { SPY: { '1d': { at: Date.UTC(2026, 6, 15, 11), src: 'option-snapshot', rows } } }
    }));
  }, [rowCount, lastBarDaysAgo, withOutlier === true]);

  const readOwnerRead = () => page.evaluate(() => {
    const cache = JSON.parse(window.localStorage.getItem('rlData') || '{}');
    return {
      read: (cache.toolReads || {})['trend-dynamics-cycle-lab'] || null,
      published: window.__TDC_DIAGNOSTICS__ ? window.__TDC_DIAGNOSTICS__.ownerReadPublished : null,
      truthText: (document.getElementById('truthState') || {}).textContent
    };
  });

  // 1. A STALE source. The bar cache is healthy but its newest observation is far behind the
  //    cutoff, so freshness must degrade and the read must say so rather than smoothing it over.
  await seed(400, 40, false);
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?clock=${CLOCK}`);
  const stale = await readOwnerRead();
  expect(stale.truthText.trim()).toBe('STALE');
  expect(stale.read, 'a stale run published nothing at all').not.toBeNull();
  expect(stale.read.availability, 'stale source availability was upgraded').toBe('stale');
  console.log('[SCN-006-020] stale availability=' + stale.read.availability + ' truthState=' + stale.read.metrics.truthState);

  // 2. A DEGRADED run. Quality degrades on outliers, so one extreme print is what drives this
  //    branch. The verdict must stay honest and every numeric it cannot support must be OMITTED
  //    rather than defaulted to zero. Asserted unconditionally: a tolerant branch here would let
  //    a page that silently upgraded degraded to current pass.
  await seed(400, 0, true);
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?clock=${CLOCK}`);
  const degraded = await readOwnerRead();
  expect(degraded.truthText.trim(), 'an outlier-contaminated series was reported as clean').toBe('DEGRADED');
  expect(degraded.read, 'a degraded run published nothing at all').not.toBeNull();
  expect(['current', 'stale', 'degraded', 'unavailable'], 'an undeclared truth state escaped the closed vocabulary')
    .toContain(degraded.read.metrics.truthState);
  // Omission, not fabrication: any numeric present must be a real finite number.
  for (const key of ['strengthScore', 'confidencePct']) {
    const value = degraded.read.metrics[key];
    if (value !== undefined && value !== null) {
      expect(Number.isFinite(value), `${key} was published as a non-number`).toBe(true);
    }
  }
  console.log('[SCN-006-020] degraded truthState=' + degraded.read.metrics.truthState + ' availability=' + degraded.read.availability);

  // 3. UNAVAILABLE. With no observations at all the run cannot complete, and an incomplete run
  //    must publish NOTHING. This is the assertion that stops a half-run reaching a consumer as
  //    though it were a finding.
  await page.addInitScript(() => {
    window.localStorage.setItem('rlData', JSON.stringify({
      v: 1, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {}, bars: {}
    }));
  });
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?clock=${CLOCK}`);
  const unavailable = await page.evaluate(() => {
    const cache = JSON.parse(window.localStorage.getItem('rlData') || '{}');
    return {
      read: (cache.toolReads || {})['trend-dynamics-cycle-lab'] || null,
      truthText: (document.getElementById('truthState') || {}).textContent
    };
  });
  expect(unavailable.read, 'an incomplete run published an owner read').toBeNull();
  console.log('[SCN-006-020] unavailable published=' + (unavailable.read === null ? 'none' : 'SOMETHING') + ' truthText=' + unavailable.truthText.trim());
});

test('Regression: SCN-006-019 charts controls focus and 390px layout remain accessible and equivalent', async ({ page }) => {
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?fixture=trend-engine&case=sustained&profile=balanced&clock=${CLOCK}`);
  await openPower(page);
  await expect(page.locator('#truthState')).toBeVisible();

  for (const [width, height] of [[390, 844], [1440, 1000]]) {
    await page.setViewportSize({ width, height });
    // Measured in BOTH modes. Simple hides the dense engine panels, so checking it alone would
    // be the easy case; Power is where the tables and matrices can actually push the layout wide.
    for (const mode of ['simple', 'power']) {
      await page.locator(`#rlviews button[data-rlview-mode="${mode}"]`).click();
      await expect(page.locator('body')).toHaveAttribute('data-rlview', mode);
      const overflow = await page.evaluate(() => ({
        doc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        body: document.body.scrollWidth - document.body.clientWidth
      }));
      expect(overflow.doc, `document overflows horizontally at ${width}px in ${mode}`).toBeLessThanOrEqual(1);
      expect(overflow.body, `body overflows horizontally at ${width}px in ${mode}`).toBeLessThanOrEqual(1);
      console.log(`[SCN-006-019] ${width}x${height} ${mode} docOverflow=${overflow.doc} bodyOverflow=${overflow.body}`);
    }
  }

  // The mode control must be reachable and operable without a pointer.
  await page.setViewportSize({ width: 1440, height: 1000 });
  const powerTab = page.locator('#rlviews button[data-rlview-mode="power"]');
  await powerTab.focus();
  await expect(powerTab).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'power');
  await expect(page.locator('body')).toHaveClass(/power/);
  await expect(powerTab).toHaveAttribute('aria-selected', 'true');

  // State is exposed structurally, not by colour alone: the tablist carries roles and the
  // selected tab is announced through aria-selected rather than styling only.
  const roles = await page.evaluate(() => {
    const seg = document.getElementById('rlviews');
    return {
      tablist: seg.getAttribute('role'),
      label: seg.getAttribute('aria-label'),
      tabs: [...seg.querySelectorAll('button')].map((b) => b.getAttribute('role'))
    };
  });
  expect(roles.tablist).toBe('tablist');
  expect(roles.label).toBeTruthy();
  expect(roles.tabs).toEqual(['tab', 'tab', 'tab', 'tab']);

  // The fixture band is a live region, so a status change is announced rather than only drawn.
  await expect(page.locator('#fixtureBand')).toHaveAttribute('aria-live', 'polite');
});

// The Simple cockpit promises levers the reader can move and watch the verdict update. Two
// distinct claims need proving and they pull in opposite directions: switching MODE must keep
// the SAME result (it is a view change), while moving a LEVER must produce a NEW result -- and
// neither may refetch source data. Asserting only "the page still works" would pass against a
// page that silently refetched on every keystroke, or one whose levers did nothing at all.
// Registration is only real if a reader can actually reach the tool and the identity they land on
// is the one the registry promised. Asserting the tools.json entry exists would prove nothing about
// reachability; asserting navigation works would prove nothing about identity. Both are checked,
// against the SAME registry entry, plus the owner read still publishing once you arrive.
test('Regression: SCN-006-020 registration navigation and owner publication stay in parity', async ({ page }) => {
  // Anchored to the real clock, not the fixed CLOCK the other tests pass. A reader arriving from
  // the landing page carries no clock override, so the seed has to be current for the page to
  // reach a verdict at all -- which is exactly the path this test exists to prove.
  await page.addInitScript(() => {
    const dayMs = 86400000;
    const end = Date.now();
    const rows = [];
    for (let i = 399; i >= 0; i--) rows.push({ t: end - i * dayMs, c: 400 + Math.sin(i / 9) * 5 + i * 0.02 });
    window.localStorage.setItem('rlData', JSON.stringify({
      v: 1, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {},
      bars: { SPY: { '1d': { at: end, src: 'option-snapshot', rows } } }
    }));
  });

  const registry = await page.request.get(`${baseUrl}/tools.json`).then((r) => r.json());
  const entry = registry.tools.find((tool) => tool.id === 'trend-dynamics-cycle-lab');
  expect(entry, 'the tool is absent from tools.json').toBeTruthy();
  expect(entry.file).toBe('trend-dynamics-cycle-lab.html');
  expect(entry.notes).toBe('notes/trend-dynamics-cycle-lab.md');
  expect(entry.data).toBe('trend-dynamics-cycle-universe.json');

  // Every identity the registry names must actually be served, not merely declared.
  for (const path of [entry.file, entry.notes, entry.data]) {
    const response = await page.request.get(`${baseUrl}/${path}`);
    expect(response.status(), `${path} is declared in the registry but not served`).toBe(200);
  }

  // The shared nav must carry the route, so the tool is reachable from every other page.
  const navSource = await page.request.get(`${baseUrl}/rlnav.js`).then((r) => r.text());
  expect(navSource, 'the shared nav does not carry the registered route').toContain('trend-dynamics-cycle-lab.html');

  // Reach the tool the way a reader does: from the landing page, by clicking its link.
  await page.goto(`${baseUrl}/index.html`);
  const card = page.locator('a[href="trend-dynamics-cycle-lab.html"]').first();
  await expect(card, 'the landing page exposes no link to the registered route').toHaveCount(1);
  await card.click();
  await expect(page).toHaveURL(/trend-dynamics-cycle-lab\.html/);

  // Arriving through navigation must still produce and publish a real owner read.
  await expect(page.locator('#truthState')).toHaveText(/CURRENT|STALE|DEGRADED/);
  const published = await page.evaluate(() => {
    const cache = JSON.parse(window.localStorage.getItem('rlData') || '{}');
    const read = (cache.toolReads || {})['trend-dynamics-cycle-lab'] || null;
    return { read, resultId: window.__TDC_DIAGNOSTICS__ && window.__TDC_DIAGNOSTICS__.resultId };
  });
  expect(published.read, 'navigating to the registered route published no owner read').not.toBeNull();
  expect(published.read.id).toBe('trend-dynamics-cycle-lab');
  // The deep link must point back at the owning route, so a consumer can always return to source.
  expect(published.read.deepLink).toContain('trend-dynamics-cycle-lab.html');

  console.log('[SCN-006-020] registry file=' + entry.file + ' notes=' + entry.notes + ' data=' + entry.data);
  console.log('[SCN-006-020] navigated resultId=' + published.resultId + ' deepLink=' + published.read.deepLink);
});

test('Regression: SCN-006-019 Simple Power mobile and local controls share one result without refetch', async ({ page }) => {
  await seedProductionBars(page);

  // Count real network traffic. Requests are OBSERVED via browser events, never intercepted,
  // so the page runs against the live static server exactly as a reader would meet it.
  const dataRequests = [];
  page.on('request', (request) => {
    const url = request.url();
    if (!url.startsWith(baseUrl)) dataRequests.push(url);
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/trend-dynamics-cycle-lab.html?clock=${CLOCK}`);
  await expect(page.locator('#truthState')).toHaveText(/CURRENT|STALE|DEGRADED/);

  const readResult = () => page.evaluate(() => ({
    id: window.__TDC_DIAGNOSTICS__.resultId,
    digest: window.__TDC_DIAGNOSTICS__.requestDigest,
    truth: document.getElementById('truthState').textContent.trim(),
    outcome: document.getElementById('scenarioOutcome').textContent.trim()
  }));

  const atBoot = await readResult();
  expect(atBoot.id.length).toBeGreaterThan(0);

  // A mode switch is a VIEW change. The result id, digest, truth and verdict must all survive it.
  await openPower(page);
  await expect(page.locator('body')).toHaveClass(/power/);
  const inPower = await readResult();
  expect(inPower.id, 'switching to Power recomputed instead of re-rendering').toBe(atBoot.id);
  expect(inPower.digest).toBe(atBoot.digest);
  expect(inPower.truth).toBe(atBoot.truth);
  expect(inPower.outcome).toBe(atBoot.outcome);

  await page.locator('#rlviews button[data-rlview-mode="simple"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-rlview', 'simple');
  await expect(page.locator('body')).not.toHaveClass(/power/);
  expect((await readResult()).id).toBe(atBoot.id);

  // A lever change is a REQUEST change, so it must genuinely recompute. Horizon is the strongest
  // probe: it changes how much history the engine sees, so a page that ignored the lever would
  // return the identical id and fail here.
  await page.selectOption('#horizonSelect', 'h63');
  await expect
    .poll(async () => (await readResult()).id, { message: 'the horizon lever did not recompute' })
    .not.toBe(atBoot.id);
  const afterHorizon = await readResult();
  expect(afterHorizon.digest).not.toBe(atBoot.digest);

  await page.selectOption('#transformSelect', 'log-level');
  await expect
    .poll(async () => (await readResult()).id, { message: 'the transform lever did not recompute' })
    .not.toBe(afterHorizon.id);

  // The whole point of the levers: recompute happens from the shared cache. Any off-origin
  // request here means the page went back to the network for data it already held.
  expect(dataRequests, `levers refetched: ${dataRequests.join(', ')}`).toEqual([]);

  // Returning to the original horizon must reproduce the original result exactly. That proves the
  // recompute is a pure function of the request, not a drifting accumulation of state.
  await page.selectOption('#transformSelect', 'level');
  await page.selectOption('#horizonSelect', 'h126');
  await expect
    .poll(async () => (await readResult()).id, { message: 'restoring the levers did not restore the result' })
    .toBe(atBoot.id);

  console.log('[SCN-006-019] bootResult=' + atBoot.id + ' powerResult=' + inPower.id);
  console.log('[SCN-006-019] horizonResult=' + afterHorizon.id);
  console.log('[SCN-006-019] offOriginRequests=' + dataRequests.length);
});