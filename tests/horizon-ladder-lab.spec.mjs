import { test, expect } from './playwright-runtime.mjs';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/* The gate is the product: a cell with no resolved outcomes must refuse to publish a rate and must
   say how far it is from earning one, rather than presenting model arithmetic as a measured rate. */
test('Regression: an unearned cell withholds its rate and states the distance to earning one', async ({ page }) => {
  await page.goto(baseUrl + '/horizon-ladder-lab.html');
  await expect(page.locator('#gateNotice')).toContainText('Probability withheld');
  await expect(page.locator('#gateNotice')).toContainText('0 of 20');
  await expect(page.locator('#gateNotice')).toContainText('not a measured hit rate');
});
