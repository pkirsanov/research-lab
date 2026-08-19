/*
 * Feature 001 Scope 03 — causal context on the Sector, Global and Real Assets owner tools.
 *
 * Every page is served from the repository root over real HTTP with no owner-model mocks. The
 * point of this file is the SEPARATION: causal context may appear beside an owner verdict, and it
 * may never change one. Each scenario therefore captures the owner surface with causal context
 * present and compares it against the same page with the causal bridge disabled at load, which is
 * the only comparison that can actually catch a leak.
 */
import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
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

/* The owner surface, captured as the OWNER'S OWN published verdict plus the text of the owner
   controls. Raw innerText alone is the wrong instrument here: the shared context system binds a
   "?" disclosure affordance asynchronously, so identical pages can differ by decoration timing and
   nothing about that is an owner-model change. The published tool read IS the owner's metrics,
   ranking and verdict, so comparing it catches a real leak that decoration noise cannot mask. */
async function ownerSurface(page, selectors) {
  return page.evaluate((list) => {
    const causal = document.getElementById('causalContextPanel');
    const strip = (text) => String(text || '').replace(/[?\u200b]/g, '').replace(/\s+/g, ' ').trim();
    /* Wall-clock stamps are not model outputs; two loads seconds apart legitimately differ. Every
       other field stays byte-exact, so a real change to a metric, ranking or verdict still fails. */
    const ISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g;
    const normalise = (value) => {
      if (typeof value === 'string') return value.replace(ISO, '<timestamp>');
      if (Array.isArray(value)) return value.map(normalise);
      if (value && typeof value === 'object') {
        const out = {};
        for (const key of Object.keys(value).sort()) out[key] = normalise(value[key]);
        return out;
      }
      return value;
    };
    const out = { toolRead: null, text: {} };
    const ids = ['sector-research-lab', 'global-rotation-lab', 'real-assets-lab'];
    for (const id of ids) {
      const read = window.RLDATA && typeof window.RLDATA.toolRead === 'function' ? window.RLDATA.toolRead(id) : null;
      if (read) {
        const copy = normalise(JSON.parse(JSON.stringify(read)));
        delete copy.asOf;
        out.toolRead = copy;
        break;
      }
    }
    for (const selector of list) {
      const nodes = Array.from(document.querySelectorAll(selector))
        .filter((node) => !(causal && causal.contains(node)));
      out.text[selector] = nodes.map((node) => strip(node.innerText || node.textContent));
    }
    return out;
  }, selectors);
}

/* These pages land in a shell-focused view that hides owner content by design. Causal context is
   owner content, so every assertion here runs in an OWNER view. The owner mode is discovered by
   switching until the shell stops focusing, rather than hardcoding a mode id per page. */
async function enterOwnerView(page) {
  if (!(await page.evaluate(() => document.body.classList.contains('rlv-focused')))) return true;
  const tabs = page.locator('button[data-rlview-mode]');
  const count = await tabs.count();
  for (let index = 0; index < count; index += 1) {
    await tabs.nth(index).click();
    if (!(await page.evaluate(() => document.body.classList.contains('rlv-focused')))) return true;
  }
  return false;
}

/* Every test below drives this helper one to three times, and each call is a FULL load of a heavy
   analytics page plus a network settle. Measured on one worker with no contention, the sector test
   spends 23.7 s of the 30 s Playwright applies when a config declares no timeout — 79% of a budget
   nobody chose. Under the suite's own four-worker parallelism that margin is gone, so each test
   declares the budget its work actually needs. The settle below is still timing-dependent; only its
   allowance grew. See specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget. */
async function openOwner(page, file, { disableCausal = false } = {}) {
  /* Routes persist for the page's lifetime, so the "after" navigation must start from a clean
     slate or it silently keeps the disabled modules and proves nothing. */
  await page.unrouteAll();
  if (disableCausal) {
    /* Refusing the two causal modules is the cleanest way to produce a genuine "before" page:
       the owner code path is untouched and the bridge simply never exists. */
    await page.route('**/rlcausal*.js', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '/* disabled */' }));
  }
  await page.goto(`${baseUrl}/${file}`);
  await page.waitForLoadState('networkidle');
  expect(await enterOwnerView(page), `${file} must expose an owner view`).toBe(true);
}

test('Regression: served owner timing reads and causal snapshot share compatible exposure contracts', async ({ page }) => {
  test.setTimeout(180_000);
  await openOwner(page, 'sector-research-lab.html');

  const contract = await page.evaluate(async () => {
    const config = await (await fetch('causal-rotation.config.json', { cache: 'no-store' })).json();
    const catalogue = (config.exposureCatalog || []).map((item) => ({ id: item.id, owner: item.timingOwner }));
    const reads = window.RLCausalConsumer.timingReads();
    return {
      timingContract: config.contracts.timingRead,
      moduleContract: window.RLCausalConsumer.TIMING_CONTRACT,
      catalogue,
      reads: reads.map((read) => ({
        exposureId: read.exposureId, owner: read.ownerToolId, contractVersion: read.contractVersion,
        asOf: read.asOf, freshUntil: read.freshUntil, marketState: read.marketState,
        deepLink: read.deepLink, limitations: read.limitations.length
      }))
    };
  });

  expect(contract.moduleContract).toBe(contract.timingContract);
  expect(contract.reads.length).toBeGreaterThan(0);
  const owned = contract.catalogue.filter((item) => item.owner === 'sector-research-lab').map((item) => item.id).sort();
  expect(contract.reads.map((read) => read.exposureId).sort()).toEqual(owned);
  for (const read of contract.reads) {
    expect(read.contractVersion, read.exposureId).toBe('rotation-timing/v1');
    expect(read.owner, read.exposureId).toBe('sector-research-lab');
    expect(Number.isNaN(Date.parse(read.asOf)), read.exposureId).toBe(false);
    expect(Number.isNaN(Date.parse(read.freshUntil)), read.exposureId).toBe(false);
    expect(read.deepLink, read.exposureId).toBeTruthy();
    expect(read.limitations, read.exposureId).toBeGreaterThan(0);
  }
});

test('Regression: Sector acceleration remains visible while cause is unverified', async ({ page }) => {
  test.setTimeout(180_000);
  const selectors = ['#simpleView', '#modeSeg'];

  await openOwner(page, 'sector-research-lab.html', { disableCausal: true });
  const before = await ownerSurface(page, selectors);
  expect(await page.locator('#causalContext').count()).toBe(1);
  expect(await page.locator('[data-causal-context]').count()).toBe(0);

  await openOwner(page, 'sector-research-lab.html');
  const after = await ownerSurface(page, selectors);

  /* The owner surface is byte-identical with the causal bridge present. */
  expect(after).toEqual(before);

  /* Causal context exists, is separate, and reports honestly. */
  await expect(page.locator('[data-causal-context]')).toBeVisible();
  const rows = page.locator('[data-causal-exposure]');
  await expect(rows).toHaveCount(3);
  const panelText = await page.locator('#causalContextPanel').innerText();
  expect(panelText).toMatch(/does not enter/i);
  expect(panelText).not.toMatch(/\b(buy|sell|short)\b/i);

  /* No hypothesis is selected from price behaviour: an exposure with no causal read says so. */
  const semis = page.locator('[data-causal-exposure="exp:semiconductors"]');
  await expect(semis).toHaveCount(1);
  const semisText = await semis.innerText();
  expect(semisText).toMatch(/cause unverified|cause-emerging|contradicted|watch|confirmable|established/);

  /* The same separation must hold on a phone-sized viewport. */
  await page.setViewportSize({ width: 390, height: 844 });
  await openOwner(page, 'sector-research-lab.html');
  const mobile = await ownerSurface(page, selectors);
  expect(mobile.toolRead, 'mobile owner verdict').toEqual(after.toolRead);
  await expect(page.locator('[data-causal-exposure]'), 'mobile').toHaveCount(3);
});

test('Regression: A country causal read disagrees with its market model', async ({ page }) => {
  test.setTimeout(180_000);
  const selectors = ['#leaderboard', '#narrative'];

  await openOwner(page, 'global-rotation-lab.html', { disableCausal: true });
  const before = await ownerSurface(page, selectors);

  await openOwner(page, 'global-rotation-lab.html');
  const after = await ownerSurface(page, selectors);
  expect(after).toEqual(before);

  await expect(page.locator('[data-causal-context]')).toBeVisible();
  const us = page.locator('[data-causal-exposure="exp:united-states"]');
  await expect(us).toHaveCount(1);

  /* The US timing read states the absence rather than inventing a benchmark verdict. */
  const read = await page.evaluate(() => window.RLCausalConsumer.timingReads('global-rotation-lab')[0]);
  expect(read.marketState).toBe('unavailable');
  expect(read.limitations.join(' ')).toMatch(/no United States confirmation state/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await openOwner(page, 'global-rotation-lab.html');
  const mobile = await ownerSurface(page, selectors);
  expect(mobile.toolRead, 'mobile owner order').toEqual(after.toolRead);
  await expect(page.locator('[data-causal-exposure="exp:united-states"]'), 'mobile').toHaveCount(1);
});

test('Regression: Energy equities strengthen while the underlying proxy remains weak', async ({ page }) => {
  test.setTimeout(180_000);
  const selectors = ['#simpleView'];

  await openOwner(page, 'real-assets-lab.html', { disableCausal: true });
  const before = await ownerSurface(page, selectors);

  await openOwner(page, 'real-assets-lab.html');
  const after = await ownerSurface(page, selectors);
  expect(after).toEqual(before);

  await expect(page.locator('[data-causal-context]')).toBeVisible();
  await expect(page.locator('[data-causal-exposure="exp:energy-equities"]')).toHaveCount(1);
  await expect(page.locator('[data-causal-exposure="exp:oil-underlying"]')).toHaveCount(1);

  /* Inventory and curve causes stay unavailable: the read says what it is, and what it is not. */
  const reads = await page.evaluate(() => window.RLCausalConsumer.timingReads('real-assets-lab'));
  expect(reads.length).toBe(2);
  expect(reads.map((read) => read.exposureId).sort()).toEqual(['exp:energy-equities', 'exp:oil-underlying']);
  expect(reads.map((read) => read.limitations.join(' ')).join(' ')).toMatch(/inventory and curve evidence remain unavailable|no oil-linked confirmation/i);

  await page.setViewportSize({ width: 390, height: 844 });
  await openOwner(page, 'real-assets-lab.html');
  const mobile = await ownerSurface(page, selectors);
  expect(mobile.toolRead, 'mobile driver verdict').toEqual(after.toolRead);
  await expect(page.locator('[data-causal-exposure]'), 'mobile').toHaveCount(2);
});

test('Regression: consumers reject unknown causal versions while owner models remain usable', async ({ page }) => {
  test.setTimeout(180_000);
  const selectors = ['#simpleView', '#modeSeg'];
  await openOwner(page, 'sector-research-lab.html', { disableCausal: true });
  const before = await ownerSurface(page, selectors);

  /* Serve a config whose snapshot contract version is unknown to the reader. The causal modules
     must be re-enabled here, or this would only re-measure the disabled page and prove nothing. */
  await page.unrouteAll();
  await page.route('**/causal-rotation.config.json', async (route) => {
    const response = await route.fetch();
    const config = await response.json();
    config.contracts.snapshot = 'causal-snapshot/v99-unknown';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(config) });
  });

  await page.goto(`${baseUrl}/sector-research-lab.html`);
  await page.waitForLoadState('networkidle');
  expect(await enterOwnerView(page)).toBe(true);
  const after = await ownerSurface(page, selectors);

  /* The owner model is untouched by a causal contract it cannot read. */
  expect(after).toEqual(before);

  /* And every exposure degrades to an explicit unavailable state rather than a blank panel. */
  await expect(page.locator('[data-causal-context]')).toBeVisible();
  const unavailable = page.locator('[data-causal-state="unavailable"]');
  await expect(unavailable).toHaveCount(3);
  await expect(page.locator('[data-causal-cause="unverified"]').first()).toContainText('cause unverified');
});
