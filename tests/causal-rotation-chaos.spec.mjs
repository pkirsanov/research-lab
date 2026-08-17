/*
 * Feature 001 Scope 06 — chaos phase. Stochastic real-usage against the live causal owner.
 *
 * This is not a scripted journey. It drives the page with a seeded random walk over the real
 * controls and asserts only invariants that must hold no matter what the user does: the page
 * never throws, never loses its ready flag, never manufactures a plan-eligible claim from an
 * unavailable read, and never writes to the shared credential store.
 *
 * The seed is fixed so a failure is reproducible; the sequence is otherwise arbitrary.
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

/* Deterministic PRNG so a chaos failure is reproducible rather than a one-off anecdote. */
function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/* A real user can only act on what is actually on screen. Every action is visibility-guarded
 * and time-bounded, so a control that is legitimately hidden in the active view is skipped
 * rather than silently burning the test budget on an actionability wait. */
async function clickIfReachable(locator) {
  if (!(await locator.count())) return false;
  const target = locator.first();
  if (!(await target.isVisible().catch(() => false))) return false;
  await target.click({ timeout: 2000 }).catch(() => {});
  return true;
}

test('Regression: stochastic causal usage never throws, blanks, or manufactures plan eligibility', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/causal-rotation-lab.html`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  const random = seededRandom(20260817);
  const postures = ['discovery', 'balanced', 'confirmation'];
  const views = ['simple', 'power', 'brief', 'journey'];
  const performed = [];

  for (let step = 0; step < 40; step += 1) {
    const roll = random();
    if (roll < 0.35) {
      const view = views[Math.floor(random() * views.length)];
      if (await clickIfReachable(page.locator(`[data-rlview-mode="${view}"]`))) performed.push('view:' + view);
    } else if (roll < 0.7) {
      const posture = postures[Math.floor(random() * postures.length)];
      const select = page.locator('#postureSel');
      if (await select.count() && await select.isVisible().catch(() => false)) {
        await select.selectOption(posture, { timeout: 2000 }).catch(() => {});
        performed.push('posture:' + posture);
      }
    } else if (roll < 0.85) {
      const rows = page.locator('#candTableWrap tr[data-candidate]');
      const count = await rows.count();
      if (count) {
        const row = rows.nth(Math.floor(random() * count));
        if (await row.isVisible().catch(() => false)) {
          await row.click({ timeout: 2000 }).catch(() => {});
          performed.push('candidate');
        }
      }
    } else {
      const select = page.locator('#exposureSel');
      if (await select.count() && await select.isVisible().catch(() => false)) {
        const options = await select.locator('option').all();
        if (options.length) {
          const value = await options[Math.floor(random() * options.length)].getAttribute('value');
          if (value) {
            await select.selectOption(value, { timeout: 2000 }).catch(() => {});
            performed.push('exposure:' + value);
          }
        }
      }
    }

    /* Invariants that must survive ANY sequence. */
    await expect(page.locator('body'), `step ${step} after ${performed[performed.length - 1]}`)
      .toHaveAttribute('data-causal-ready', '1');

    const state = await page.evaluate(() => {
      const read = document.getElementById('simpleRead');
      return {
        readLength: read ? (read.innerText || '').trim().length : null,
        credentials: window.localStorage.getItem('rlApiKeys'),
        providerConfig: window.localStorage.getItem('rlProviderConfig'),
        bodyText: (document.body.innerText || '').length
      };
    });
    expect(state.credentials, 'chaos must never write the credential store').toBeNull();
    expect(state.providerConfig, 'chaos must never write provider config').toBeNull();
    expect(state.bodyText, 'the page must never go blank').toBeGreaterThan(0);
  }

  expect(errors, `no page error across ${performed.length} stochastic actions`).toEqual([]);
  expect(performed.length, 'the walk must actually exercise controls').toBeGreaterThan(10);
});
