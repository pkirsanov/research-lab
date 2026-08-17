/*
 * Feature 001 Scope 04 — causal read in the Tier-A snapshot and the Market Brief.
 *
 * Served from the repository root over real HTTP. The causal read is produced by the SAME
 * production evaluator the owner lab runs; there is no Brief-only causal model to test against.
 * The point of these tests is restraint: an early cause may be COVERED, and may not consume an
 * action or attention slot.
 */
import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8'
};

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
  await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  if (server) await new Promise((done) => server.close(done));
});

const readRootJson = (relative) => JSON.parse(readFileSync(join(ROOT, relative), 'utf8'));

test('Regression: live Tier-A snapshot exposes one valid or explicitly unavailable causal tool read', async ({ page }) => {
  const status = await (async () => {
    await page.goto(`${baseUrl}/market-brief.html`);
    return page.evaluate(async () => (await fetch('market-brief.snapshot.json', { cache: 'no-store' })).status);
  })();
  expect(status).toBe(200);

  const snapshot = readRootJson('market-brief.snapshot.json');
  const causal = snapshot.toolReads['causal-rotation-lab'];
  expect(causal, 'Tier-A must expose a causal tool read').toBeTruthy();
  expect(causal.deepLink).toBeTruthy();

  /* Exactly one of the two honest shapes: usable, or unavailable with no stage at all. */
  if (causal.metrics.health === 'unavailable') {
    expect(causal.metrics.stage).toBeNull();
    expect(causal.metrics.planEligible).toBe(false);
  } else {
    expect(typeof causal.metrics.stage).toBe('string');
    expect(causal.metrics.causeStatus).toBeTruthy();
    expect(causal.metrics.evidenceAsOf).toBeTruthy();
    expect(causal.metrics.confirmation).toBeTruthy();
    expect(causal.metrics.invalidation).toBeTruthy();
  }

  /* The public causal snapshot is served and agrees with the read. */
  const snapshotStatus = await page.evaluate(async () => (await fetch('causal-rotation.snapshot.json', { cache: 'no-store' })).status);
  expect(snapshotStatus).toBe(200);
  const causalSnapshot = readRootJson('causal-rotation.snapshot.json');
  expect(causalSnapshot.contractVersion).toBe('causal-snapshot/v1');
  expect(causalSnapshot.candidates.length).toBe(causal.metrics.candidateCount);
});

test('Regression: A valid early candidate does not change the next-session plan', async ({ page }) => {
  const snapshot = readRootJson('market-brief.snapshot.json');
  const causal = snapshot.toolReads['causal-rotation-lab'];

  /* The committed candidate is real, early, and NOT plan-eligible. */
  expect(causal.metrics.planEligible).toBe(false);
  expect(['cause-emerging', 'watch', 'confirmable', 'contradicted']).toContain(causal.metrics.stage);

  /* The owner deep link stays available on the read itself. Coverage is REGISTRY-derived and the
     causal lab is deliberately unregistered until SCOPE-05, so it correctly has no coverage row
     yet; asserting one here would be asserting a registration this scope does not perform. */
  expect(causal.deepLink).toContain('causal-rotation-lab.html');
  const registry = readRootJson('tools.json');
  const registered = registry.tools.some((tool) => tool.id === 'causal-rotation-lab');
  expect(snapshot.toolCoverage.filter((row) => row.id === 'causal-rotation-lab').length).toBe(registered ? 1 : 0);
  expect(snapshot.toolCoverage.length).toBe(registry.tools.length);

  await page.goto(`${baseUrl}/market-brief.html`);
  await page.waitForLoadState('networkidle');

  /* It consumes no action or attention slot. */
  const slots = await page.evaluate(async () => {
    const payload = await (await fetch('market-brief.payload.json', { cache: 'no-store' })).json();
    const text = JSON.stringify(payload.nextSessionActions || []) + JSON.stringify(payload.attention || []);
    return { mentionsCausal: /causal-rotation-lab|cand:/i.test(text) };
  });
  expect(slots.mentionsCausal, 'a coverage-only causal candidate must not occupy an action or attention slot').toBe(false);
});

test('Regression: Causal evidence and market reactions share one origin', async ({ page }) => {
  const causalSnapshot = readRootJson('causal-rotation.snapshot.json');
  const candidate = causalSnapshot.candidates[0];

  /* Clusters collapse to origin keys, so reactions linked to one announcement cannot be counted
     twice as independent support. */
  const originKeys = candidate.evidenceClusters.map((cluster) => cluster.originKeys.join('|'));
  expect(new Set(originKeys).size).toBe(originKeys.length);
  expect(candidate.independentSupportClusterCount).toBe(candidate.independentSupportClusterIds.length);
  expect(new Set(candidate.reasonKeys).size).toBe(candidate.reasonKeys.length);

  /* Every cluster with more than one observation still contributes exactly one origin. */
  for (const cluster of candidate.evidenceClusters) {
    expect(cluster.originKeys.length, `${cluster.id} must trace to one origin`).toBe(1);
  }

  await page.goto(`${baseUrl}/market-brief.html`);
  await page.waitForLoadState('networkidle');
  const causal = readRootJson('market-brief.snapshot.json').toolReads['causal-rotation-lab'];
  expect(causal.metrics.independentConfirmationCount).toBeLessThanOrEqual(candidate.evidenceClusters.length);
});

test('Regression: Headless causal validation fails while other Brief tools remain valid', async ({ page }) => {
  /* Drive the PRODUCTION adapter with a broken committed record and assert isolation. */
  const { buildCausalToolRead } = await import('../scripts/brief-refresh.mjs');
  const { createRequire } = await import('node:module');
  const requireModule = createRequire(join(ROOT, 'scripts', 'x.mjs'));
  const readFile = (relative) => readFileSync(join(ROOT, relative), 'utf8');
  const brokenRead = (relative) => {
    if (relative === 'causal-rotation-observations.json') {
      const observations = JSON.parse(readFile(relative));
      observations.contractVersion = 'causal-observation-set/v99-unknown';
      return JSON.stringify(observations);
    }
    return readFile(relative);
  };

  const snapshot = readRootJson('market-brief.snapshot.json');
  const others = Object.fromEntries(Object.entries(snapshot.toolReads).filter(([id]) => id !== 'causal-rotation-lab'));
  const before = JSON.stringify(others);

  const isolated = buildCausalToolRead(others, { read: brokenRead, require: requireModule });
  expect(isolated.snapshot).toBeNull();
  expect(isolated.toolRead.metrics.health).toBe('unavailable');
  expect(isolated.toolRead.metrics.stage).toBeNull();
  expect(isolated.toolRead.metrics.planEligible).toBe(false);
  expect(isolated.toolRead.metrics.healthDetail).toBeTruthy();

  /* No other read was touched by the causal failure. */
  expect(JSON.stringify(others)).toBe(before);

  /* And the Brief itself still renders from the existing snapshot. */
  await page.goto(`${baseUrl}/market-brief.html`);
  await page.waitForLoadState('networkidle');
  const reachable = await page.evaluate(async () => (await fetch('market-brief.snapshot.json', { cache: 'no-store' })).status);
  expect(reachable).toBe(200);
});
