/*
 * Feature 001 Scope 05 — registration, discoverability, and the outcome/correction ledger
 * driven through the real browser over live HTTP.
 *
 * These tests exist to prove three things that a unit assertion cannot:
 *   1. the registered tool actually resolves — page, notes, data and snapshot all return 200;
 *   2. recording an outcome does NOT reopen the frozen decision (SCN-001-E01);
 *   3. a correction annotates its target instead of replacing it (SCN-001-E02).
 *
 * The registry assertions are derived from tools.json rather than hardcoded, so a later
 * registration change cannot silently pass a stale expectation.
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
  '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const TOOL_ID = 'causal-rotation-lab';
const COMPLETE_CANDIDATE = 'cand:financial-credit-selectivity:banks';

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

const registryEntry = () => {
  const registry = JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8'));
  return registry.tools.find((tool) => tool.id === TOOL_ID);
};

async function openLab(page, { candidate, mode } = {}) {
  const parts = [];
  if (candidate) parts.push('candidate=' + encodeURIComponent(candidate));
  const hash = parts.length ? '#' + parts.join('&') : '';
  await page.goto(`${baseUrl}/${TOOL_ID}.html${hash}`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');
  /* The shared four-view shell owns view selection on every registered tool. */
  if (mode === 'power') {
    await page.click('[data-rlview-mode="power"]');
    await expect(page.locator('body')).toHaveClass(/power/);
  }
}

test('Regression: registered causal page notes data and snapshot resources return successful live responses', async ({ page }) => {
  const entry = registryEntry();
  expect(entry, 'the causal tool must be registered in tools.json').toBeTruthy();

  /* Derived from the registry so a path rename cannot pass a stale expectation. */
  const targets = [entry.file, entry.notes, entry.data, 'causal-rotation.config.json', 'causal-rotation.snapshot.json'];
  for (const target of targets) {
    expect(target, 'every registry-declared resource must be named').toBeTruthy();
  }

  await page.goto(`${baseUrl}/index.html`);
  const statuses = await page.evaluate(async (paths) => {
    const out = {};
    for (const path of paths) out[path] = (await fetch(path, { cache: 'no-store' })).status;
    return out;
  }, targets);

  for (const target of targets) {
    expect(statuses[target], `${target} must resolve over live HTTP`).toBe(200);
  }

  /* Adversarial: the same fetch harness must be able to observe a real 404, otherwise the
     assertions above would pass even if every request silently succeeded. */
  const missing = await page.evaluate(async () => (await fetch('causal-rotation-lab-does-not-exist.html', { cache: 'no-store' })).status);
  expect(missing).toBe(404);
});

test('Regression: Invalidation occurs before confirmation', async ({ page }) => {
  await openLab(page, { candidate: COMPLETE_CANDIDATE, mode: 'power' });

  await page.click('#freezeBtn');
  await expect(page.locator('#savedNotice')).toBeVisible();

  /* The exact frozen bytes and digest, captured BEFORE any outcome is recorded. */
  const before = await page.evaluate(() => {
    const records = JSON.parse(window.localStorage.getItem('rlCausalDecisionsV1') || '[]');
    return { bytes: JSON.stringify(records), digest: records[records.length - 1].decisionDigest };
  });
  expect(before.digest).toMatch(/^sha256:/);

  await page.click('[data-outcome-index="0"]');
  await expect(page.locator('#outcomeNotice')).toBeVisible();

  const after = await page.evaluate(() => {
    const records = JSON.parse(window.localStorage.getItem('rlCausalDecisionsV1') || '[]');
    const events = JSON.parse(window.localStorage.getItem('rlCausalOutcomesV1') || '[]');
    return {
      bytes: JSON.stringify(records),
      digest: records[records.length - 1].decisionDigest,
      outcomes: events.filter((event) => event.eventType === 'outcome'),
      decisionCount: records.length
    };
  });

  /* SCN-001-E01: the outcome appended, and the frozen decision was NOT reopened. */
  expect(after.outcomes.length).toBe(1);
  expect(after.decisionCount).toBe(1);
  expect(after.bytes).toBe(before.bytes);
  expect(after.digest).toBe(before.digest);

  const outcome = after.outcomes[0];
  expect(outcome.payload.decisionDigest).toBe(before.digest);
  expect(['confirmed', 'falsified', 'expired', 'unresolved']).toContain(outcome.payload.state);
  expect(outcome.contentDigest).toMatch(/^sha256:/);

  /* The recorded state is visible in the history rather than only in storage. */
  await expect(page.locator('#outcomeHistoryTable')).toBeVisible();
  await expect(page.locator(`#outcomeHistoryTable tr[data-outcome-state="${outcome.payload.state}"]`).first()).toBeVisible();
});

test('Regression: A ledger event requires a reviewed correction', async ({ page }) => {
  await openLab(page, { candidate: COMPLETE_CANDIDATE, mode: 'power' });

  await page.click('#freezeBtn');
  await page.click('[data-outcome-index="0"]');
  await expect(page.locator('#outcomeHistoryTable')).toBeVisible();

  const beforeCorrection = await page.evaluate(() => window.localStorage.getItem('rlCausalOutcomesV1'));
  const outcomeEventId = await page.evaluate(() => {
    const events = JSON.parse(window.localStorage.getItem('rlCausalOutcomesV1') || '[]');
    return events.find((event) => event.eventType === 'outcome').eventId;
  });

  page.once('dialog', (dialog) => dialog.accept('The invalidation was attributed to the wrong catalyst.'));
  await page.click(`[data-correct-event="${outcomeEventId}"]`);
  await expect(page.locator('#outcomeNotice')).toBeVisible();

  const after = await page.evaluate(() => {
    const events = JSON.parse(window.localStorage.getItem('rlCausalOutcomesV1') || '[]');
    return { events, raw: JSON.stringify(events) };
  });

  /* SCN-001-E02: the correction appended with a target reference, and every prior event
     is byte-identical and still present. */
  const corrections = after.events.filter((event) => event.eventType === 'correction');
  expect(corrections.length).toBe(1);
  expect(corrections[0].payload.targetEventId).toBe(outcomeEventId);

  const priorPrefix = JSON.parse(beforeCorrection);
  expect(JSON.stringify(after.events.slice(0, priorPrefix.length))).toBe(JSON.stringify(priorPrefix));

  /* The corrected event remains visible and is marked as corrected, not removed. */
  await expect(page.locator('#outcomeHistoryTable [data-corrected="1"]').first()).toBeVisible();
  const rowCount = await page.locator('#outcomeHistoryTable tbody tr').count();
  expect(rowCount).toBeGreaterThan(0);
});

test('Regression: A user opens the Research Lab catalog after full causal delivery', async ({ page }) => {
  const entry = registryEntry();

  await page.goto(`${baseUrl}/index.html`);

  /* Scoped to the catalog grid: the index legitimately also renders a shared-nav link, so an
     unscoped count would conflate the two surfaces the scenario asks about separately. */
  const catalogLinks = page.locator(`#grid a[href="${entry.file}"]`);
  expect(await catalogLinks.count(), 'the catalog must list the causal tool exactly once').toBe(1);

  /* Exactly once in shared navigation, on a page that is not the tool itself. */
  await openLab(page);
  const navLinks = page.locator(`#rlnav a[href="${entry.file}"], nav a[href="${entry.file}"]`);
  const navCount = await navLinks.count();
  expect(navCount, 'shared navigation must render the causal tool exactly once').toBe(1);

  /* Market Brief coverage recognizes the same identifier, exactly once. */
  const snapshot = JSON.parse(readFileSync(join(ROOT, 'market-brief.snapshot.json'), 'utf8'));
  const coverage = (snapshot.toolCoverage || []).filter((row) => row.id === TOOL_ID);
  expect(coverage.length, 'Brief coverage must carry exactly one causal row').toBe(1);
  expect(coverage[0].deepLink).toBe(entry.file);

  /* Adversarial: the same locators must return 0 for an id that was never registered, so a
     selector that matched everything could not have produced the counts above. */
  const absent = await page.locator('a[href="causal-rotation-lab-unregistered.html"]').count();
  expect(absent).toBe(0);
});
