import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';
import { buildOverreactionFixture } from './overreaction-fixture.support.mjs';

/* The Swing Structure Lab's overreaction snap-back panel, driven end to end on a synthetic corpus:
   every same-origin input the scanner reads is served from the fixture, so the result depends on
   the rules in rloverreaction.js and on nothing in the live data tree. */
const fx = buildOverreactionFixture();

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

async function serveFixture(page, evidence) {
  await page.route('**/*', (route) => {
    const path = new URL(route.request().url()).pathname;
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
    if (path.endsWith('/sector-universe.json')) return json({ entries: [], sectorMap: fx.sectorMap });
    if (path.endsWith('/data/bars/live.json')) return json({ updated: fx.lastDate + 'T20:00:00.000Z', expectedSessionDate: fx.lastDate, quotes: {} });
    if (path.endsWith('/data/overreaction/evidence.json')) return json(evidence);
    if (path.endsWith('/data/calendars/xnys/calendar.json')) return json({ rows: [] });
    const bar = /\/data\/bars\/([^/]+)\.json$/.exec(path);
    if (bar) {
      const sym = decodeURIComponent(bar[1]);
      return fx.bars[sym] ? json({ sym, interval: '1d', asof: fx.lastDate, src: 'yahoo', rows: fx.bars[sym] }) : route.fulfill({ status: 404, body: '' });
    }
    if (/^https?:\/\/(127\.0\.0\.1|localhost)/.test(route.request().url())) return route.continue();
    return route.abort();
  });
}

test('Overreaction panel shows the overblown fixture drop as one high-confidence card with its plan', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await serveFixture(page, fx.evidence);
  await page.goto(`${site.baseUrl}/swing-structure-lab.html`);

  const card = page.locator('#orCards .or-card');
  await expect(card).toHaveCount(1, { timeout: 20_000 });
  await expect(card).toContainText('OVRA');
  await expect(card).toContainText('snap-back after a -9.5% drop');
  await expect(card).toContainText('confidence 7/10');
  await expect(card).toContainText('Wrong if');
  await expect(card).toContainText('no-news');
  await expect(page.locator('#orMeta')).toContainText('Scanned 4 stocks');
  await expect(page.locator('#orMeta')).toContainText('market closed');
  expect(errors).toEqual([]);
});

test('Overreaction panel shows no card without sourced evidence, and the Power audit names the missing gate', async ({ page }) => {
  await serveFixture(page, { ...fx.evidence, events: [] });
  await page.addInitScript(() => {
    localStorage.setItem('swingStructLab', JSON.stringify({ provider: 'auto', ticker: 'SPY', win: 126, mode: 'power', acct: 10000, riskPct: 1, svStance: 'neutral', svAggr: 'balanced', svHz: 'swing' }));
  });
  await page.goto(`${site.baseUrl}/swing-structure-lab.html`);

  await expect(page.locator('#orCards')).toContainText('No high-confidence overreaction this run.', { timeout: 20_000 });
  await expect(page.locator('#orMeta')).toContainText('1 pass every price gate and await a sourced cause check');
  const row = page.locator('#orAudit table.or-audit tbody tr');
  await expect(row).toHaveCount(1);
  await expect(row).toContainText('OVRA');
  await expect(row).toContainText('needed');
  await expect(row).toContainText('verdict unclear');
});
