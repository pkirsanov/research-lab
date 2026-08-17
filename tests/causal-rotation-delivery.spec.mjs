/*
 * Feature 001 Scope 06 — SCN-001-F01 coherence and deterministic corpus load.
 *
 * One candidate must keep ONE identity as it travels owner -> consumer -> Brief -> ledger.
 * The point of these tests is that the four surfaces read the same production evaluator, so a
 * divergence here means a second causal model has appeared somewhere.
 *
 * The load check uses the REAL committed observation set replayed against the production
 * evaluator. It deliberately fabricates no market history: repetition is over recorded
 * contracts, and the assertion is determinism and boundedness, never a favourable outcome.
 */
import { test, expect } from './playwright-runtime.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createStaticSite, REPO_ROOT as ROOT } from './causal-static-site.mjs';

const site = createStaticSite();
let baseUrl;

test.beforeAll(async () => { baseUrl = await site.start(); });

test.afterAll(async () => {
  await site.stop();
});

const rootJson = (relative) => JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));

test('Regression: local live delivery exposes coherent causal owner consumer Brief and ledger contracts', async ({ page }) => {
  const failures = [];
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('pageerror', (error) => failures.push('pageerror: ' + error.message));

  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  /* Every committed causal resource must serve over live HTTP from the same origin. */
  const statuses = await page.evaluate(async () => {
    const paths = [
      'causal-rotation.config.json',
      'causal-rotation-observations.json',
      'causal-rotation.snapshot.json',
      'causal-rotation-ledger.jsonl',
      'market-brief.snapshot.json'
    ];
    const out = {};
    for (const path of paths) out[path] = (await fetch(path, { cache: 'no-store' })).status;
    return out;
  });
  for (const [path, status] of Object.entries(statuses)) {
    expect(status, `${path} must serve locally`).toBe(200);
  }

  /* The ledger is committed and currently empty. That is a real state, not a load failure, and
     it must be served as an empty document rather than a 404. */
  const ledgerText = await page.evaluate(async () => (await fetch('causal-rotation-ledger.jsonl', { cache: 'no-store' })).text());
  expect(ledgerText.trim()).toBe('');

  expect(failures, 'no request or page error during local delivery').toEqual([]);
});

test('Regression: A source-recorded candidate moves from owner research to Brief coverage', async ({ page }) => {
  const causalSnapshot = rootJson('causal-rotation.snapshot.json');
  const briefSnapshot = rootJson('market-brief.snapshot.json');
  const registry = rootJson('tools.json');

  const top = causalSnapshot.candidates[0];
  expect(top, 'the committed snapshot must expose at least one candidate').toBeTruthy();

  /* The Brief read must carry the SAME candidate identity, stage, as-of and falsifier as the
     owner snapshot — not a recomputed or rounded copy. */
  const briefRead = briefSnapshot.toolReads['causal-rotation-lab'];
  expect(briefRead, 'Tier-A must publish the causal read').toBeTruthy();
  expect(briefRead.metrics.topCandidateId).toBe(top.candidateId);
  expect(briefRead.metrics.stage).toBe(top.stage);
  expect(briefRead.metrics.evidenceAsOf).toBe(top.evidenceAsOf);
  expect(briefRead.metrics.exposureId).toBe(top.exposureId);
  expect(briefRead.metrics.invalidation).toBe(top.invalidation[0].description);
  expect(briefRead.metrics.regimeVersionId).toBe(top.currentRegime.id);

  /* Coverage names the same tool exactly once, and the deep link resolves to the owner page. */
  const coverage = (briefSnapshot.toolCoverage || []).filter((row) => row.id === 'causal-rotation-lab');
  expect(coverage.length).toBe(1);
  const entry = registry.tools.find((tool) => tool.id === 'causal-rotation-lab');
  expect(coverage[0].deepLink).toBe(entry.file);

  /* The owner page renders that same candidate, so the browser and the artifacts agree. */
  await page.goto(`${baseUrl}/causal-rotation-lab.html#candidate=${encodeURIComponent(top.candidateId)}`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');
  await page.click('[data-rlview-mode="power"]');
  await expect(page.locator('body')).toHaveClass(/power/);
  await expect(page.locator('#candTableWrap')).toContainText(top.candidateId);

  /* Every timing-owner verdict the consumers publish must still be one of the contract states —
     the causal overlay may not invent a verdict for an owner that publishes none. */
  const allowedStates = ['confirming', 'weakening', 'established', 'emerging', 'unavailable'];
  Object.values(causalSnapshot.timingReads || {}).forEach((read) => {
    expect(allowedStates).toContain(read.marketState);
  });
});

test('Regression: large valid recorded-contract corpus keeps cached first paint and interactive controls usable', async ({ page }) => {
  /* The corpus is the REAL committed observation set replayed N times through the production
     evaluator in the browser. No synthetic market history is fabricated: the inputs are the
     recorded contracts, and what is asserted is determinism, boundedness and responsiveness. */
  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  const result = await page.evaluate(async () => {
    const config = await (await fetch('causal-rotation.config.json', { cache: 'no-store' })).json();
    const observations = await (await fetch('causal-rotation-observations.json', { cache: 'no-store' })).json();
    const before = JSON.stringify(observations);
    const asOf = '2026-07-12T22:00:00Z';
    const digests = [];
    const started = performance.now();
    for (let index = 0; index < 60; index += 1) {
      const evaluated = window.RLCausal.evaluateAll({
        config, observationSet: observations, asOf,
        sensitivityPosture: 'discovery', riskOverlay: 'none'
      });
      digests.push(JSON.stringify(evaluated.candidates.map((candidate) => candidate.candidateDigest)));
    }
    return {
      elapsedMs: performance.now() - started,
      distinctDigests: Array.from(new Set(digests)).length,
      iterations: digests.length,
      inputsUnchanged: JSON.stringify(observations) === before,
      diagnosticsBounded: (window.RLCausal.diagnostics().length || 0) < 10000
    };
  });

  expect(result.iterations).toBe(60);
  /* Deterministic: 60 evaluations of identical recorded input yield ONE digest set. */
  expect(result.distinctDigests).toBe(1);
  /* Input-immutable: evaluation never mutates the committed corpus. */
  expect(result.inputsUnchanged).toBe(true);
  expect(result.diagnosticsBounded).toBe(true);
  /* Bounded: no stack overflow, no runaway. Generous so it measures boundedness, not machine speed. */
  expect(result.elapsedMs).toBeLessThan(60000);

  /* The page stays interactive after the corpus run. */
  await page.click('[data-rlview-mode="power"]');
  await expect(page.locator('body')).toHaveClass(/power/);
  await expect(page.locator('#postureSel')).toBeEnabled();
  await page.selectOption('#postureSel', 'confirmation');
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');
});
