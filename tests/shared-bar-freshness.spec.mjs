import { readFileSync } from 'node:fs';
import { expect, test } from './playwright-runtime.mjs';
import { startStaticServer } from './tool-experience.support.mjs';

function snapshot(symbol) {
  return JSON.parse(readFileSync(new URL(`../data/bars/${symbol}.json`, import.meta.url), 'utf8'));
}

const current = {
  MSFT: snapshot('MSFT').rows,
  QQQ: snapshot('QQQ').rows,
  SPY: snapshot('SPY').rows
};

let site;
test.beforeAll(async () => { site = await startStaticServer(); });
test.afterAll(async () => { if (site) await site.close(); });

test('Regression: shared bars refresh legacy bridge provenance without refetching current snapshots', async ({ page }) => {
  await page.addInitScript(({ rows }) => {
    localStorage.setItem('rlData', JSON.stringify({
      v: 1,
      bars: {
        MSFT: { '1d': { at: Date.now(), src: 'sector-lab', rows: rows.MSFT.slice(0, -20) } },
        QQQ: { '1d': { at: Date.now(), src: 'etf-lab', rows: rows.QQQ.slice(0, -20) } },
        SPY: { '1d': { at: Date.now(), src: 'pages-snapshot', rows: rows.SPY } }
      },
      quotes: {},
      options: {},
      macro: null,
      events: {},
      toolReads: {}
    }));
  }, { rows: current });

  const snapshotRequests = [];
  page.on('request', (request) => {
    const match = new URL(request.url()).pathname.match(/\/data\/bars\/(MSFT|QQQ|SPY)\.json$/);
    if (match) snapshotRequests.push(match[1]);
  });

  await page.goto(`${site.baseUrl}/index.html`);
  const before = await page.evaluate(() => ({
    MSFT: RLDATA.barInfo('MSFT', '1d', 12),
    QQQ: RLDATA.barInfo('QQQ', '1d', 12),
    SPY: RLDATA.barInfo('SPY', '1d', 12),
    freshMSFT: RLDATA.bars('MSFT', '1d', 12),
    freshQQQ: RLDATA.bars('QQQ', '1d', 12),
    freshSPY: RLDATA.bars('SPY', '1d', 12)
  }));

  expect(before.MSFT.state).toBe('stale');
  expect(before.QQQ.state).toBe('stale');
  expect(before.SPY.state).toBe('fresh');
  expect(before.freshMSFT).toBeNull();
  expect(before.freshQQQ).toBeNull();
  expect(before.freshSPY.length).toBe(current.SPY.length);

  await page.evaluate(async () => {
    await Promise.all([
      RLDATA.ensureBars('MSFT', '1d', 12, '2y'),
      RLDATA.ensureBars('QQQ', '1d', 12, '2y'),
      RLDATA.ensureBars('SPY', '1d', 12, '2y')
    ]);
  });

  const after = await page.evaluate(() => ({
    MSFT: { info: RLDATA.barInfo('MSFT', '1d', 12), last: RLDATA.bars('MSFT', '1d').at(-1).c },
    QQQ: { info: RLDATA.barInfo('QQQ', '1d', 12), last: RLDATA.bars('QQQ', '1d').at(-1).c },
    SPY: { info: RLDATA.barInfo('SPY', '1d', 12), last: RLDATA.bars('SPY', '1d').at(-1).c }
  }));

  expect(after.MSFT.info.src).toBe('pages-snapshot');
  expect(after.QQQ.info.src).toBe('pages-snapshot');
  expect(after.SPY.info.src).toBe('pages-snapshot');
  expect(after.MSFT.last).toBe(current.MSFT.at(-1).c);
  expect(after.QQQ.last).toBe(current.QQQ.at(-1).c);
  expect(after.SPY.last).toBe(current.SPY.at(-1).c);
  expect(snapshotRequests.sort()).toEqual(['MSFT', 'QQQ']);
});