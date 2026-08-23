import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.jsonl': 'application/x-ndjson; charset=utf-8' };
let server;
let baseUrl;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
    const relative = normalize(requestPath === '/' ? 'index.html' : requestPath.replace(/^\/+/, ''));
    const filePath = resolve(ROOT, relative);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep) || !existsSync(filePath) || !statSync(filePath).isFile()) {
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

/* The defect this exists for: RLDATA.bars is a cache READ, so a page that only calls it asks a cold
   browser for nothing and then correctly reports it has nothing. Every unit gate stayed green while
   a first-time visitor saw an empty ladder above a full exclusion ledger. Only rendering the page
   catches that, so the assertion is on requests actually issued and rows actually drawn. */
test('Regression: a first visit fetches the bar snapshots rather than reading an empty cache', async ({ page }) => {
  const barStatuses = [];
  page.on('response', (response) => {
    const path = new URL(response.url()).pathname;
    if (path.startsWith('/data/bars/')) barStatuses.push(response.status());
  });
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  expect(barStatuses.length).toBeGreaterThan(0);
  expect(barStatuses.every((status) => status === 200)).toBeTruthy();
  /* "not scoreable at mint" is the reason a symbol carries when its bars are absent. With the cache
     warmed, no symbol may be excluded for that reason; a structural reason is a legitimate outcome. */
  await expect(page.locator('#exclusionTable')).not.toContainText('not scoreable at mint');
});

/* The gate is the product: a cell with no resolved outcomes must refuse to publish a forward track
   record and must say how far it is from earning one. The second half of this test is a cross-check
   between two regions, because the first version pinned the literal words "not a measured hit rate"
   and so enshrined them — when the profiles began ranking on the analog rate the notice went on
   asserting the Prob. column was not measured while the table printed "75.0% analog" beneath it, and
   the test stayed green through the contradiction. The notice must now agree with the column. */
test('Regression: an unearned cell withholds its rate and describes the column it actually shows', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect(page.locator('#gateNotice')).toContainText('withheld');
  await expect(page.locator('#gateNotice')).toContainText('0 of 20');

  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  const notice = await page.locator('#gateNotice').innerText();
  const probCells = await page.locator('#simpleTable tbody tr td:nth-child(4)').allInnerTexts();
  const analogRows = probCells.filter((t) => /analog/i.test(t)).length;

  if (analogRows === probCells.length) {
    expect(notice, 'every Prob. cell reads analog, so the notice may not deny it is measured').toContain('measured analog rate');
    expect(notice).not.toContain('not a measured hit rate');
  } else if (analogRows > 0) {
    expect(notice, 'the column is mixed and the notice must say so').toContain('mixed');
  } else {
    expect(notice).toContain('not a measured hit rate');
  }
  /* The withheld thing is the forward track record, and the notice must not blur the two. */
  expect(notice).toMatch(/Measured rate/);
});

/* A control that changes nothing is worse than an absent one, because it implies the view responds
   to a choice it is ignoring. The assertion is on the cell key the gate prints, which is composed
   from the direction the computation actually used. Comparing rendered symbol text instead looked
   reasonable and was not: it passed with the direction handler deleted, because the cache warm
   re-renders asynchronously and the two captures differed on formatting rather than on direction. */
test('Regression: switching direction re-keys the cell the gate reports on', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  await expect(page.locator('#gateNotice')).toContainText('long:h1m');
  await page.selectOption('#selDirection', 'short');
  await expect(page.locator('#gateNotice')).toContainText('short:h1m');
  /* The re-keyed cell must render a DEFINITE answer, not a stale table and not a silent blank.
     Asserting names here instead would be wrong: the probability floor legitimately empties some
     cells, and a test that demands names would pressure the floor down to keep itself green. */
  await expect.poll(async () => {
    const rows = await page.locator('#simpleTable tbody tr').count();
    if (rows > 0) return 'named';
    const body = await page.locator('#simpleTable').innerText();
    return /No candidate cleared the gates/i.test(body) ? 'refused' : 'silent';
  }, { timeout: 15000 }).not.toBe('silent');
});

/* Canvas work in this repo has a known failure mode: a draw deferred to requestAnimationFrame never
   runs in a hidden or background tab, leaving the element at its default size with nothing painted.
   The element existing proves nothing, so this reads the alpha channel. The accessible name is
   checked in the same place because an aria-label on a bare canvas is inert — assistive technology
   surfaces it only once the element carries an image role, and this one did not until it was given
   one. Simple mode is deliberately excluded: the canvas is display:none there, and a hidden element
   is correctly absent from the tree. */
test('Regression: the power view paints its frontier canvas and exposes its accessible name', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  await page.locator('#modeSeg button[data-mode]').last().click();
  await expect.poll(() => page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas || !canvas.width || !canvas.height) return false;
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 0) return true;
    return false;
  }), { timeout: 15000 }).toBeTruthy();
  await expect(page.getByRole('img', { name: /Frontier of target distance/ })).toHaveCount(1);
  await expect(page.locator('#frontierFallback')).not.toBeEmpty();
});

/* The tool exists to name high-probability candidates. It shipped unable to: the profile gated on
   the LIVE ledger, which starts at zero resolved outcomes, so every name was dropped at every
   horizon and the answer was permanently empty. A measured rate was already available and unused.
   This asserts the product does its job — names, above the floor, with their sample shown. */
test('Regression: the high-probability profile names candidates above its floor rather than returning an empty answer', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  await page.selectOption('#selProfile', 'high-probability');
  await page.selectOption('#selHorizon', 'h1m');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  const analogTexts = await page.locator('#simpleTable tbody tr td:nth-child(3)').allInnerTexts();
  expect(analogTexts.length).toBeGreaterThan(0);
  for (const text of analogTexts) {
    const rate = Number(/([0-9.]+)%/.exec(text)?.[1]);
    expect(rate).toBeGreaterThanOrEqual(55);
    /* n alone overstates evidence because the windows overlap, so the independent count must ride
       alongside every rate a reader might act on. */
    expect(text).toMatch(/indep/);
  }
});

/* The floor belongs to the tool, not to one profile. Scoped to high-probability alone, the
   lower-risk list top-ranked a 29.5% name on the strength of its reward-to-risk — a coin flip
   presented as the safest idea on the board. Every profile must refuse to publish below the floor;
   they differ in how they RANK what qualifies. This walks all three and pins that. */
test('Regression: no profile publishes a name below the probability floor', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect.poll(() => page.locator('#simpleTable tbody tr').count(), { timeout: 15000 }).toBeGreaterThan(0);
  await page.selectOption('#selHorizon', 'h1m');
  const leaders = [];
  for (const profile of ['lower-risk', 'high-reward', 'high-probability']) {
    await page.selectOption('#selProfile', profile);
    await page.waitForTimeout(300);
    const texts = await page.locator('#simpleTable tbody tr td:nth-child(3)').allInnerTexts();
    /* Each profile must actually answer at this horizon, or the walk proves nothing. */
    expect(texts.length, profile + ' named nothing at 1 month').toBeGreaterThan(0);
    for (const text of texts) {
      const rate = Number(/([0-9.]+)%/.exec(text)?.[1]);
      expect(rate, profile + ' published ' + text).toBeGreaterThanOrEqual(55);
    }
    leaders.push(await page.locator('#simpleTable tbody tr td:nth-child(1)').first().innerText());
  }
  /* A shared floor must not collapse the profiles into one list — they still rank on their own
     axis, so the top name cannot be identical across all three. */
  expect(new Set(leaders.map((s) => s.trim())).size).toBeGreaterThan(1);
});

/* Opened straight off disk, the universe fetch is blocked and the tool has no data at all. Every
   peer tool fetches its universe the same way, so this is the house pattern rather than a defect —
   but the refusal is the product here, and a blank page would read as "no candidates" instead of
   "no data". The page must SAY it has nothing and must not throw doing it. */
test('Regression: opened from the filesystem the tool states it has no universe instead of rendering a silent blank', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto(pathToFileURL(resolve(ROOT, 'horizon-ladder-lab.html')).href);
  await expect(page.locator('#gateNotice')).toContainText('Universe unavailable');
  await expect(page.locator('#gateNotice')).toContainText('Nothing is substituted');
  expect(await page.locator('#simpleTable tbody tr').count()).toBe(0);
  expect(pageErrors).toEqual([]);
});
