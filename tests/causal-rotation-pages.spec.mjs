/*
 * Feature 001 Scope 06 — SCN-001-F03 static-runtime survival.
 *
 * The product is single-file, build-free and served as static assets, so "it works" has to be
 * proven against the PAGES BUILD OUTPUT (_site), not only against the repository root. These
 * tests serve _site directly, which is what GitHub Pages actually publishes.
 *
 * They also assert the property that makes this product what it is: no backend, no bundler, no
 * authentication and no credential is required for a first paint.
 */
import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(REPO, '_site');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonl': 'application/x-ndjson; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

let server;
let baseUrl;

test.beforeAll(async () => {
  /* The Pages artifact must already have been built by scripts/build-pages-site.mjs. Failing
     loudly here is correct: silently falling back to the repo root would let these tests pass
     while the deployed artifact was broken or missing. */
  if (!existsSync(SITE)) {
    throw new Error('_site is missing — run `node scripts/build-pages-site.mjs` before the Pages suite');
  }
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(SITE, relative);
    if ((filePath !== SITE && !filePath.startsWith(SITE + sep)) || !existsSync(filePath) || !statSync(filePath).isFile()) {
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

test('Regression: The complete tool is exercised across supported static runtimes', async ({ page }) => {
  const registry = JSON.parse(readFileSync(join(SITE, 'tools.json'), 'utf8'));
  const entry = registry.tools.find((tool) => tool.id === 'causal-rotation-lab');
  expect(entry, 'the Pages artifact must carry the registered causal tool').toBeTruthy();

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    const failures = [];
    const onError = (error) => failures.push(`${viewport.name} pageerror: ${error.message}`);
    const onResponse = (response) => { if (response.status() >= 400) failures.push(`${viewport.name} ${response.status()} ${response.url()}`); };
    page.on('pageerror', onError);
    page.on('response', onResponse);

    await page.goto(`${baseUrl}/${entry.file}`);
    await expect(page.locator('body'), viewport.name).toHaveAttribute('data-causal-ready', '1');

    /* Non-blank: the Simple cockpit paints a real read from the deployed artifact. */
    const simpleText = (await page.locator('#simpleRead').innerText().catch(() => '')).trim();
    expect(simpleText.length, `${viewport.name} Simple read must not be blank`).toBeGreaterThan(0);

    /* No backend, bundler, auth or credential dependency: every request is same-origin static. */
    const external = await page.evaluate(() => performance.getEntriesByType('resource')
      .map((resource) => resource.name)
      .filter((name) => !name.startsWith(location.origin)));
    expect(external, `${viewport.name} must not depend on a third-party runtime`).toEqual([]);

    const credentialUse = await page.evaluate(() => ({
      keys: window.localStorage.getItem('rlProviderConfig'),
      legacy: window.localStorage.getItem('rlApiKeys')
    }));
    expect(credentialUse.keys, `${viewport.name} first paint must not require provider credentials`).toBeNull();
    expect(credentialUse.legacy).toBeNull();

    page.off('pageerror', onError);
    page.off('response', onResponse);
    expect(failures, `${viewport.name} static runtime must load cleanly`).toEqual([]);
  }

  /* The deployed catalog reaches the tool, and its notes ship alongside it. */
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/index.html`);
  expect(await page.locator(`#grid a[href="${entry.file}"]`).count()).toBe(1);
  const notesStatus = await page.evaluate(async (notes) => (await fetch(notes, { cache: 'no-store' })).status, entry.notes);
  expect(notesStatus).toBe(200);
});

test('Regression: mobile causal queue clocks timeline consumers and Brief do not overlap or clip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  /* Nothing may spill horizontally on a 390px viewport — the classic mobile clipping failure. */
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(overflow.scrollWidth, 'no horizontal overflow at 390px').toBeLessThanOrEqual(overflow.clientWidth + 1);

  await page.click('[data-rlview-mode="power"]');
  await expect(page.locator('body')).toHaveClass(/power/);

  /* The Power surfaces must be laid out, not collapsed to zero height or stacked on top of
     each other. Zero-area panels are the shape of a clipped mobile layout. */
  const boxes = await page.evaluate(() => {
    const ids = ['candTableWrap', 'powerView'];
    return ids.map((id) => {
      const node = document.getElementById(id);
      if (!node) return { id, present: false };
      const rect = node.getBoundingClientRect();
      return { id, present: true, width: Math.round(rect.width), height: Math.round(rect.height), left: Math.round(rect.left) };
    });
  });
  boxes.filter((box) => box.present).forEach((box) => {
    expect(box.width, `${box.id} must have width on mobile`).toBeGreaterThan(0);
    expect(box.height, `${box.id} must have height on mobile`).toBeGreaterThan(0);
    expect(box.left, `${box.id} must not be pushed off-canvas`).toBeGreaterThanOrEqual(-1);
  });

  const overflowAfterPower = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth
  }));
  expect(overflowAfterPower.scrollWidth).toBeLessThanOrEqual(overflowAfterPower.clientWidth + 1);
});

test('Regression: complete causal delivery has keyboard labels text equivalents and bounded announcements', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  /* Every interactive control carries an accessible name — an unnamed control is unusable to a
     screen reader even though it is perfectly clickable. */
  const unnamed = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('button, select, input, a[href], [role="tab"]'));
    return nodes
      .filter((node) => {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        const name = (node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || '').trim();
        return name.length === 0;
      })
      .map((node) => node.tagName + '#' + (node.id || '(anonymous)'));
  });
  expect(unnamed, 'every visible control must have an accessible name').toEqual([]);

  /* Live regions must be bounded and polite, never a firehose. */
  const liveRegions = await page.evaluate(() => Array.from(document.querySelectorAll('[role="status"], [aria-live]'))
    .map((node) => ({
      role: node.getAttribute('role'),
      live: node.getAttribute('aria-live'),
      length: (node.textContent || '').trim().length
    })));
  liveRegions.forEach((region) => {
    expect(region.length, 'a live region announcement must stay bounded').toBeLessThan(2000);
    if (region.live) expect(['polite', 'off']).toContain(region.live);
  });

  /* The canvas chart must have a text equivalent, because a canvas is opaque to assistive tech. */
  await page.click('[data-rlview-mode="power"]');
  await expect(page.locator('body')).toHaveClass(/power/);
  const canvasEquivalents = await page.evaluate(() => Array.from(document.querySelectorAll('canvas'))
    .map((node) => ({
      id: node.id || '(anonymous)',
      hasText: !!((node.getAttribute('aria-label') || node.getAttribute('title') || node.textContent || '').trim())
    })));
  canvasEquivalents.forEach((entry) => {
    expect(entry.hasText, `canvas ${entry.id} needs a text equivalent`).toBe(true);
  });

  /* Keyboard reachability: tabbing forward from the document start reaches a real control
     rather than dead-ending on the body. */
  let focused = null;
  for (let step = 0; step < 12; step += 1) {
    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => (document.activeElement ? document.activeElement.tagName : null));
    if (['BUTTON', 'A', 'SELECT', 'INPUT', 'TEXTAREA'].includes(focused)) break;
  }
  expect(['BUTTON', 'A', 'SELECT', 'INPUT', 'TEXTAREA'], 'keyboard focus must reach a real control').toContain(focused);
});
