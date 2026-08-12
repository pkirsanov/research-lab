import { readFileSync } from 'node:fs';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

const msftSnapshot = JSON.parse(readFileSync(new URL('../data/bars/MSFT.json', import.meta.url), 'utf8'));
const currentRows = msftSnapshot.rows;
const staleRows = currentRows.slice(0, -20);
const currentClose = currentRows.at(-1).c;
const staleClose = staleRows.at(-1).c;

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: Swing replaces recently stamped legacy MSFT rows with the current Pages snapshot', async ({ page }) => {
  expect(staleRows.length).toBeGreaterThan(200);
  expect(staleClose).not.toBe(currentClose);

  await page.addInitScript(({ rows }) => {
    localStorage.setItem('rlData', JSON.stringify({
      v: 1,
      bars: { MSFT: { '1d': { at: Date.now(), src: 'sector-lab', rows } } },
      quotes: {},
      options: {},
      macro: null,
      events: {},
      toolReads: {}
    }));
    localStorage.setItem('swingStructLab', JSON.stringify({
      provider: 'auto',
      ticker: 'MSFT',
      win: 126,
      mode: 'power',
      acct: 10000,
      riskPct: 1,
      svStance: 'neutral',
      svAggr: 'balanced',
      svHz: 'swing'
    }));
  }, { rows: staleRows });

  const snapshotRequests = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/data/bars/MSFT.json')) snapshotRequests.push(request.url());
  });

  await page.goto(`${site.baseUrl}/swing-structure-lab.html`);
  await expect(page.locator('#status')).toContainText('loaded MSFT', { timeout: 20_000 });

  const lastValue = page.locator('#kpis .kpi').first().locator('.v');
  await expect(lastValue).toHaveText(`$${currentClose.toFixed(2)}`);

  const cache = await page.evaluate(() => ({
    info: RLDATA.barInfo('MSFT', '1d'),
    last: RLDATA.bars('MSFT', '1d').at(-1).c
  }));
  expect(cache.info.src).toBe('pages-snapshot');
  expect(cache.last).toBe(currentClose);
  expect(snapshotRequests.length).toBeGreaterThan(0);
});

test('Regression: Swing keeps a current Pages snapshot cache-first', async ({ page }) => {
  await page.addInitScript(({ rows }) => {
    localStorage.setItem('rlData', JSON.stringify({
      v: 1,
      bars: { MSFT: { '1d': { at: Date.now(), src: 'pages-snapshot', rows } } },
      quotes: {},
      options: {},
      macro: null,
      events: {},
      toolReads: {}
    }));
    localStorage.setItem('swingStructLab', JSON.stringify({
      provider: 'auto',
      ticker: 'MSFT',
      win: 126,
      mode: 'power',
      acct: 10000,
      riskPct: 1,
      svStance: 'neutral',
      svAggr: 'balanced',
      svHz: 'swing'
    }));
  }, { rows: currentRows });

  const snapshotRequests = [];
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/data/bars/MSFT.json')) snapshotRequests.push(request.url());
  });

  await page.goto(`${site.baseUrl}/swing-structure-lab.html`);
  await expect(page.locator('#status')).toContainText('loaded MSFT', { timeout: 20_000 });
  await expect(page.locator('#kpis .kpi').first().locator('.v')).toHaveText(`$${currentClose.toFixed(2)}`);
  expect(snapshotRequests).toEqual([]);
});