import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

let site;
test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

function utcDay(dayOffset) {
  return Date.UTC(2026, 0, 2 + dayOffset);
}

function ratioFixture(options = {}) {
  const sessions = options.sessions || 80;
  const ratioGain = options.ratioGain == null ? 0.04 : options.ratioGain;
  const rows = { JNK: [], HYG: [], LQD: [] };
  for (let index = 0; index < sessions; index += 1) {
    const progress = index / (sessions - 1);
    const lqd = 100;
    rows.LQD.push({ t: utcDay(index), c: lqd });
    rows.JNK.push({ t: utcDay(index), c: 100 * (1 + ratioGain * progress) });
    rows.HYG.push({ t: utcDay(index), c: 100 * (1 + ratioGain * 0.9 * progress) });
  }
  if (options.unmatchedNewest) rows.JNK.push({ t: utcDay(sessions), c: 100 * (1 + ratioGain + 0.002) });
  return rows;
}

function observedSnapshot(options = {}) {
  const observedAt = '2026-01-31';
  const bars = ratioFixture(options);
  return {
    bars,
    barMeta: {
      JNK: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' },
      HYG: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' },
      LQD: { adjustment: 'distribution-adjusted', freshness: 'fresh', observedAt, sourceId: 'synthetic-browser-boundary' }
    },
    treasuryChanges: { change21dBp: options.change21dBp || 0, change63dBp: options.change63dBp || 0 },
    confirmations: options.confirmations || [],
    nominalCurve: options.nominalCurve || null,
    realCurve: options.realCurve || null
  };
}

function curveFixture(shortStart, shortEnd, longStart, longEnd, options = {}) {
  const rows = [];
  for (let index = 0; index < 22; index += 1) {
    rows.push({
      date: new Date(Date.UTC(2026, 0, 2 + index)).toISOString().slice(0, 10),
      y3m: options.y3m == null ? 3.5 : options.y3m,
      y2: shortStart + (shortEnd - shortStart) * index / 21,
      y5: 3.8,
      y10: longStart + (longEnd - longStart) * index / 21,
      y30: 4.5
    });
  }
  return { state: 'fresh', rows, observedAt: rows.at(-1).date, sourceId: 'synthetic-official-nominal' };
}

function realCurveFixture(start, end) {
  const rows = [];
  for (let index = 0; index < 22; index += 1) rows.push({ date: new Date(Date.UTC(2026, 0, 2 + index)).toISOString().slice(0, 10), y5: 1.5, y10: start + (end - start) * index / 21, y20: 2, y30: 2.2 });
  return { state: 'fresh', rows, observedAt: rows.at(-1).date, sourceId: 'synthetic-official-real' };
}

async function openWithSnapshot(page, snapshot) {
  await openFromSharedCache(page);
  await page.evaluate((nextSnapshot) => window.BondRegimeLab.replaceObservedSnapshot(nextSnapshot), snapshot);
}

test('BS-001 duration-driven ratio improvement stays mixed', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    change21dBp: 42,
    change63dBp: 42,
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: 0,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-credit-state]')).toHaveText('Mixed');
  await expect(page.locator('[data-credit-conflicts]')).toContainText('duration-confounded');
  await expect(page.locator('[data-credit-state]')).not.toHaveText('Constructive');
});

test('BS-002 aligned ratios plus OAS confirmation are constructive', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: -12,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-credit-state]')).toHaveText('Constructive');
  await expect(page.locator('[data-credit-invalidation]')).toContainText('ratio');
  await expect(page.locator('[data-credit-invalidation]')).toContainText('spread');
});

test('BS-003 tight but widening keeps level and momentum separate', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    confirmations: [{
      id: 'synthetic-oas',
      kind: 'oas',
      value: 2.5,
      changeBp: 18,
      observedAt: '2026-01-31',
      freshness: 'fresh',
      rights: 'restricted-local-view'
    }]
  }));
  await expect(page.locator('[data-confirmation-level]')).toHaveText('tight');
  await expect(page.locator('[data-confirmation-momentum]')).toHaveText('widening');
  await expect(page.locator('[data-confirmation-direction]')).toHaveText('mixed');
});

test('BS-010 latest common date excludes unmatched leg', async ({ page }) => {
  const snapshot = observedSnapshot({ unmatchedNewest: true });
  await openWithSnapshot(page, snapshot);
  const expectedCommonDate = new Date(snapshot.bars.LQD.at(-1).t).toISOString().slice(0, 10);
  const unmatchedDate = new Date(snapshot.bars.JNK.at(-1).t).toISOString().slice(0, 10);
  await expect(page.locator('[data-ratio-asof="jnk-lqd"]')).toHaveText(expectedCommonDate);
  await expect(page.locator('[data-ratio-table="jnk-lqd"]')).not.toContainText(unmatchedDate);
});

test('BS-004 bull steepener retains defensive credit context', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    ratioGain: -0.04,
    confirmations: [{ id: 'synthetic-oas', kind: 'oas', value: 5.5, changeBp: 20, observedAt: '2026-01-23', freshness: 'fresh' }],
    nominalCurve: curveFixture(4.5, 3.5, 4.5, 4.1),
    realCurve: realCurveFixture(2, 1.8)
  }));
  await expect(page.locator('[data-curve-impulse]')).toHaveText('Bull Steepener');
  await expect(page.locator('[data-duration-state]')).toHaveText('Extend');
  await expect(page.locator('[data-duration-context]')).toContainText('high-quality duration');
  await expect(page.locator('[data-duration-context]')).toContainText('Defensive credit');
});

test('BS-005 bear steepener penalizes long duration most', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({
    nominalCurve: curveFixture(3.5, 3.7, 4, 4.8),
    realCurve: realCurveFixture(1.7, 2.15)
  }));
  await expect(page.locator('[data-curve-impulse]')).toHaveText('Bear Steepener');
  await expect(page.locator('[data-duration-state]')).toHaveText('Shorten');
  const effects = await page.locator('[data-rate-effect]').evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.dataset.rateEffect, Number(node.textContent)])));
  expect(effects['long-treasury']).toBeLessThan(effects['short-treasury']);
});

test('Regression curve inversion alone leaves duration balanced or indeterminate', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot({ nominalCurve: curveFixture(4.6, 4.6, 4, 4, { y3m: 4.8 }) }));
  await expect(page.locator('[data-curve-state]')).toHaveText('Inverted');
  await expect(page.locator('[data-duration-state]')).not.toHaveText('Shorten');
  await expect(page.locator('[data-duration-state]')).not.toHaveText('Extend');
});

async function setScenario(page, values) {
  for (const [id, value] of Object.entries(values)) await page.locator('#' + id).fill(String(value));
}

test('BS-006 six month mixed shock decomposes every sleeve', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  await setScenario(page, { treasuryShock: -50, igSpreadShock: 60, hySpreadShock: 150, breakevenShock: 0 });
  await expect(page.locator('[data-scenario-row]')).toHaveCount(7);
  await expect(page.locator('[data-scenario-row="intermediate-treasury"] [data-term="spread"]')).toHaveText('Not applicable');
  await expect(page.locator('[data-scenario-row="investment-grade-corporate"] [data-term="spread"]')).not.toHaveText('Not applicable');
  await expect(page.locator('[data-scenario-row="inflation-linked-treasury"]')).toContainText('real yield');
  const rows = await page.locator('[data-scenario-row]').evaluateAll((nodes) => nodes.map((node) => ({ carry: Number(node.querySelector('[data-term="carry"]').dataset.value), rate: Number(node.querySelector('[data-term="rate"]').dataset.value), spread: Number(node.querySelector('[data-term="spread"]').dataset.value || 0), convexity: Number(node.querySelector('[data-term="convexity"]').dataset.value), total: Number(node.querySelector('[data-term="total"]').dataset.value) })));
  expect(rows.every((row) => Math.abs(row.carry + row.rate + row.spread + row.convexity - row.total) < 1e-8)).toBeTruthy();
});

test('BS-007 oversized shock preserves estimate and lowers reliability', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  await page.locator('#hySpreadShock').fill('400');
  const row = page.locator('[data-scenario-row="high-yield-corporate"]');
  await expect(row.locator('[data-reliability]')).toHaveText('Reduced reliability');
  await expect(row.locator('[data-term="total"]')).not.toHaveText('Not calculable');
  for (const risk of ['nonparallel curves', 'optionality', 'defaults', 'liquidity', 'tracking']) await expect(row).toContainText(risk);
});

test('BS-008 stale characteristic remains visible and unranked', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  await page.evaluate(() => {
    const instrument = window.BondRegimeLab.runtime.config.instruments.find((row) => row.ticker === 'LQD');
    instrument.rateDuration.asOf = '2020-01-01';
    window.BondRegimeLab.recompute();
  });
  const row = page.locator('[data-scenario-row="investment-grade-corporate"]');
  await expect(row).toContainText('rateDuration');
  await expect(row.locator('[data-rank]')).toHaveText('Not ranked');
  await expect(page.locator('[data-preferred-expression]')).not.toHaveText('Investment-grade corporate');
});

test('Scenario controls reject nonfinite input and persist only allowlisted assumptions', async ({ page }) => {
  await openWithSnapshot(page, observedSnapshot());
  await page.locator('#treasuryShock').fill('Infinity');
  await expect(page.locator('#scenarioAlert')).toContainText('finite');
  const storage = await page.evaluate(() => ({ state: JSON.parse(localStorage.getItem('bondRegimeLabState') || '{}'), keys: Object.keys(JSON.parse(localStorage.getItem('bondRegimeLabState') || '{}')).sort() }));
  expect(storage.keys).toEqual(['breakevenShockBp', 'focusSleeveId', 'horizonMonths', 'hySpreadShockBp', 'igSpreadShockBp', 'mode', 'presetId', 'ratioId', 'ratioWindow', 'schemaVersion', 'treasuryShockBp'].sort());
  expect(JSON.stringify(storage.state)).not.toContain('Infinity');
});

function sharedBarCache(options = {}) {
  const bars = ratioFixture({ sessions: 80, ratioGain: 0.04 });
  for (const ticker of ['SGOV', 'SHY', 'IEF', 'TLT', 'TIP']) {
    bars[ticker] = Array.from({ length: 80 }, (_, index) => ({ t: utcDay(index), c: 100 + index * 0.02 }));
  }
  const now = Date.now();
  const buckets = {};
  for (const [ticker, rows] of Object.entries(bars)) buckets[ticker] = { '1d': { at: now, src: 'pages-snapshot', rows } };
  return { v: 1, bars: buckets, quotes: {}, options: {}, si: {}, macro: null, events: {}, toolReads: {}, ...options };
}

async function openFromSharedCache(page, options = {}) {
  const cache = sharedBarCache();
  await page.addInitScript((payload) => localStorage.setItem('rlData', JSON.stringify(payload)), cache);
  if (options.routeTreasury !== false) {
    const nominal = await import('node:fs').then(({ readFileSync }) => readFileSync(new URL('./fixtures/bond-regime/nominal-valid.csv', import.meta.url), 'utf8'));
    const real = await import('node:fs').then(({ readFileSync }) => readFileSync(new URL('./fixtures/bond-regime/real-valid.csv', import.meta.url), 'utf8'));
    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
      const body = route.request().url().includes('real_yield_curve') ? real : nominal;
      await route.fulfill({ status: 200, contentType: 'text/csv', body });
    });
  }
  await page.goto(site.baseUrl + '/bond-regime-lab.html');
  await page.waitForFunction(() => {
    const lab = window.BondRegimeLab;
    const renderedDigest = document.querySelector('#decisionGrid')?.dataset.observedDigest;
    return Boolean(
      lab?.runtime.refresh.promise
      && !lab.runtime.refresh.active
      && lab.runtime.viewModel
      && renderedDigest === lab.runtime.viewModel.observedDigest
    );
  });
  await expect(page.locator('#appStatus')).toContainText('Ready');
  // The shared brief mount fetches its pointer independently after the tool is ready; let it reach a
  // terminal state so its one-time, tool-orthogonal network never lands inside a request-count window.
  await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { state: 'attached', timeout: 10000 }).catch(() => {});
}

test('Live smoke returns a valid adjusted pair and official nominal headers or explicit unavailable source state', async ({ page }) => {
  await openFromSharedCache(page, { routeTreasury: false });
  const result = await page.evaluate(async () => {
    await window.BondRegimeLab.hydrate(true);
    const vm = window.BondRegimeLab.runtime.viewModel;
    return { pairState: vm.ratioDetails['jnk-lqd'].series.state, pairAdjustment: vm.ratioDetails['jnk-lqd'].series.adjustment, nominalState: window.BondRegimeLab.runtime.observedSnapshot.nominalCurve?.state || 'unavailable', nominalError: window.BondRegimeLab.runtime.observedSnapshot.nominalCurve?.errorCode || null };
  });
  expect(result.pairState).toBe('ready');
  expect(result.pairAdjustment).toBe('distribution-adjusted');
  expect(result.nominalState === 'fresh' || result.nominalError === 'BRL-CURVE-NOMINAL-UNAVAILABLE').toBeTruthy();
});

test('BS-009 optional macro outage leaves truthful partial read', async ({ page }) => {
  await openFromSharedCache(page);
  await page.evaluate(async () => {
    await window.BondRegimeLab.hydrate(true, { skipOptional: true });
  });
  await expect(page.locator('[data-ratio-asof="jnk-lqd"]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-curve-state]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="oas"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="financial-conditions"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Unavailable');
  await expect(page.locator('#sourceStatusTable')).not.toContainText(/Unavailable\s+0(?:\.0+)?/);
});

test('BS-013 restricted observation remains memory only', async ({ page }) => {
  await openFromSharedCache(page);
  const sentinel = '2.681923';
  const sourceUrl = 'https://example.com/restricted-source-sentinel';
  const result = await page.evaluate(({ sentinel, sourceUrl }) => {
    const normalized = window.BondRegimeLab.setManualObservation({ id: 'oas-session', kind: 'oas', value: Number(sentinel), change: -8, unit: 'percent', observedAt: new Date().toISOString().slice(0, 10), sourceUrl, sourceLabel: 'Current-tab source', acknowledged: true });
    window.BondRegimeLab.publish();
    return { normalized, local: Object.values(localStorage).join('\n'), read: JSON.stringify(RLDATA.toolRead('bond-regime-lab')), config: JSON.stringify(window.BondRegimeLab.runtime.config) };
  }, { sentinel, sourceUrl });
  expect(result.normalized.state).toBe('fresh');
  expect(result.local).not.toContain(sentinel);
  expect(result.local).not.toContain(sourceUrl);
  expect(result.read).not.toContain(sentinel);
  expect(result.read).not.toContain(sourceUrl);
  expect(result.config).not.toContain(sentinel);
  expect(result.config).not.toContain(sourceUrl);
});

test('Cache-first refresh preserves successful families when one source fails', async ({ page }) => {
  await openFromSharedCache(page);
  await page.route('**/*', async (route) => {
    let url = route.request().url();
    try { url = decodeURIComponent(url); } catch (error) { }
    if (url.includes('daily_treasury_real_yield_curve')) await route.abort('failed');
    else await route.fallback();
  });
  const before = await page.locator('[data-ratio-asof="jnk-lqd"]').textContent();
  await page.evaluate(async () => window.BondRegimeLab.hydrate(true));
  const after = await page.locator('[data-ratio-asof="jnk-lqd"]').textContent();
  expect(after).toBe(before);
  await expect(page.locator('[data-source-state="bars"]')).toContainText(/Fresh|Cached/);
  await expect(page.locator('[data-source-state="nominal-curve"]')).toHaveText('Fresh');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Stale');
  await expect(page.locator('[data-source-note="real-curve"]')).toContainText('BRL-OPTIONAL-UNAVAILABLE');
});

test('No browser credential restricted endpoint or raw observation persistence path exists', async ({ page, request }) => {
  await openFromSharedCache(page);
  const source = await (await request.get(site.baseUrl + '/bond-regime-lab.html')).text();
  const config = await (await request.get(site.baseUrl + '/bond-regime-universe.json')).text();
  expect(/<input\b[^>]*(?:password|api[_-]?key|credential|token)/i.test(source)).toBeFalsy();
  expect(/fred\.stlouisfed\.org\/graph\/fredgraph|api[_-]?key=|series\/BAML|series\/NFCI/i.test(config)).toBeFalsy();
  const stores = await page.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage) }));
  expect(stores.local.filter((key) => /oas|nfci|financial.*condition/i.test(key))).toEqual([]);
  expect(stores.session.filter((key) => /oas|nfci|financial.*condition/i.test(key))).toEqual([]);
});

// Regression: specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/
test('Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison', async ({ page }) => {
  const cache = sharedBarCache();
  const { readFileSync } = await import('node:fs');
  const nominal = readFileSync(new URL('./fixtures/bond-regime/nominal-valid.csv', import.meta.url), 'utf8');
  const real = readFileSync(new URL('./fixtures/bond-regime/real-valid.csv', import.meta.url), 'utf8');
  const requests = [];
  let releaseTreasury;
  let markTreasuryRequestStarted;
  const treasuryGate = new Promise((resolve) => { releaseTreasury = resolve; });
  const treasuryRequestStarted = new Promise((resolve) => { markTreasuryRequestStarted = resolve; });

  await page.addInitScript((payload) => localStorage.setItem('rlData', JSON.stringify(payload)), cache);
  page.on('request', (request) => requests.push(request.url()));
  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
    markTreasuryRequestStarted();
    await treasuryGate;
    const body = route.request().url().includes('real_yield_curve') ? real : nominal;
    await route.fulfill({ status: 200, contentType: 'text/csv', body });
  });

  try {
    await page.goto(site.baseUrl + '/bond-regime-lab.html');
    await treasuryRequestStarted;
    await expect(page.locator('#simpleView [data-model-digest]')).toBeVisible();
    const heldState = await page.evaluate(() => ({
      digest: document.querySelector('#simpleView [data-model-digest]')?.dataset.modelDigest || '',
      refreshActive: window.BondRegimeLab.runtime.refresh.active,
      status: document.getElementById('appStatus')?.textContent.trim() || ''
    }));
    expect(heldState.digest).toMatch(/^[0-9a-f]{8}$/);
    expect(heldState.refreshActive).toBe(true);
    expect(heldState.status, `Premature Ready while automatic hydration remains active: ${heldState.status}`).not.toContain('Ready');
    expect(heldState.status).toContain('Refreshing');
  } finally {
    releaseTreasury();
  }

  await expect(page.locator('#appStatus')).toContainText('Ready');
  expect(await page.evaluate(() => window.BondRegimeLab.runtime.refresh.active)).toBe(false);
  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
  const assumptionSelector = '#scenarioPreset, #scenarioHorizon, #treasuryShock, #igSpreadShock, #hySpreadShock, #breakevenShock';
  const assumptions = await page.locator(assumptionSelector).evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.id, node.value])));
  const beforeModeSwitch = requests.length;
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const powerDigest = await page.locator('#powerView [data-model-digest]').getAttribute('data-model-digest');
  const powerAssumptions = await page.locator(assumptionSelector).evaluateAll((nodes) => Object.fromEntries(nodes.map((node) => [node.id, node.value])));
  expect(simpleDigest).toMatch(/^[0-9a-f]{8}$/);
  expect(powerDigest).toBe(simpleDigest);
  expect(powerAssumptions).toEqual(assumptions);
  expect(requests.length).toBe(beforeModeSwitch);
});

test('BS-011 Simple and Power share one model digest', async ({ page }) => {
  await openFromSharedCache(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const before = requests.length;
  const simpleDigest = await page.locator('#simpleView [data-model-digest]').getAttribute('data-model-digest');
  const assumptions = await page.locator('#treasuryShock').inputValue();
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const powerDigest = await page.locator('#powerView [data-model-digest]').getAttribute('data-model-digest');
  await page.locator('#rlviews button[data-rlview-mode="simple"]').click();
  expect(powerDigest).toBe(simpleDigest);
  await expect(page.locator('#treasuryShock')).toHaveValue(assumptions);
  expect(requests.length).toBe(before);
});

test('BS-012 lever change recomputes without fetch or observed mutation', async ({ page }) => {
  await openFromSharedCache(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const beforeRequests = requests.length;
  const beforeObserved = await page.locator('#decisionGrid').getAttribute('data-observed-digest');
  const beforeStamp = await page.locator('[data-source-asof="bars"]').textContent();
  const beforeTotal = await page.locator('[data-scenario-row="high-yield-corporate"] [data-term="total"]').textContent();
  await page.locator('#hySpreadShock').fill('275');
  const afterTotal = await page.locator('[data-scenario-row="high-yield-corporate"] [data-term="total"]').textContent();
  expect(afterTotal).not.toBe(beforeTotal);
  expect(await page.locator('#decisionGrid').getAttribute('data-observed-digest')).toBe(beforeObserved);
  expect(await page.locator('[data-source-asof="bars"]').textContent()).toBe(beforeStamp);
  expect(requests.length).toBe(beforeRequests);
});

test('BS-014 partial data is keyboard and text equivalent', async ({ page }) => {
  await openFromSharedCache(page);
  await page.evaluate(() => window.BondRegimeLab.hydrate(true, { skipOptional: true }));
  await page.locator('#rlviews button[data-rlview-mode="simple"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-source-state="real-curve"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-source-state="oas"]')).toHaveText('Unavailable');
  await expect(page.locator('[data-chart-summary]')).toHaveCount(3);
  await expect(page.locator('[data-chart-table]')).toHaveCount(3);
  await expect(page.locator('[data-duration-invalidation]')).not.toHaveText('Unavailable');
  await expect(page.locator('[data-power-reliability]')).toBeVisible();
});

test('Registered Bond Regime tool publishes one owner read without restricted payload', async ({ page, request }) => {
  const registry = await (await request.get(site.baseUrl + '/tools.json')).json();
  const tool = registry.tools.find((entry) => entry.id === 'bond-regime-lab');
  expect(tool).toMatchObject({ file: 'bond-regime-lab.html', data: 'bond-regime-universe.json', notes: 'notes/bond-regime-lab.md' });
  await openFromSharedCache(page);
  const read = await page.evaluate(() => window.BondRegimeLab.publish());
  expect(read.id).toBe('bond-regime-lab');
  expect(read.deepLink).toBe('bond-regime-lab.html#simple');
  expect(JSON.stringify(read)).not.toMatch(/rawManual|sourceUrl|2\.681923/);
  const index = await (await request.get(site.baseUrl + '/index.html')).text();
  expect(index).toContain("id: 'bond-regime-lab'");
});

test('Power canvases are nonblank synchronous and text equivalent on desktop and mobile', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    const checks = await page.locator('canvas[data-bond-chart]').evaluateAll((canvases) => canvases.map((canvas) => {
      const context = canvas.getContext('2d');
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let nonblank = 0;
      for (let index = 3; index < pixels.length; index += 4) if (pixels[index] && (pixels[index - 1] || pixels[index - 2] || pixels[index - 3])) nonblank += 1;
      const rect = canvas.getBoundingClientRect();
      return { nonblank, width: rect.width, height: rect.height, hit: typeof canvas.__rlhit === 'function', fallback: canvas.textContent.trim(), label: canvas.getAttribute('aria-label') };
    }));
    expect(checks).toHaveLength(3);
    expect(checks.every((check) => check.nonblank > 20 && check.width > 200 && check.height >= 180 && check.hit && check.fallback && check.label)).toBeTruthy();
    await expect(page.locator('[data-chart-table]')).toHaveCount(3);
  }
});

test('Fresh partial stale error and large-shock layouts contain text without overlap', async ({ page }, testInfo) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await page.locator('#rlviews button[data-rlview-mode="power"]').click();
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-fresh-power.png`), fullPage: true });
    await page.evaluate(() => window.BondRegimeLab.hydrate(true, { skipOptional: true }));
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-partial-power.png`), fullPage: true });
    await page.evaluate(() => {
      const instrument = window.BondRegimeLab.runtime.config.instruments.find((row) => row.ticker === 'LQD');
      instrument.rateDuration.asOf = '2020-01-01';
      window.BondRegimeLab.recompute();
      document.activeElement?.blur();
    });
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-stale-power.png`), fullPage: true });
    await page.locator('#treasuryShock').fill('Infinity');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-error-power.png`), fullPage: true });
    await page.locator('#treasuryShock').fill('0');
    await page.locator('#hySpreadShock').fill('400');
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: testInfo.outputPath(`bond-regime-${viewport.width}-large-shock-power.png`), fullPage: true });
    const layout = await page.evaluate(() => {
      const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const visible = [...document.querySelectorAll('.shell button, .shell input, .shell select, .shell [data-power-reliability], .shell #powerView .decision-value')].filter((element) => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
      const bad = visible.filter((element) => {
        const rect = element.getBoundingClientRect();
        const viewportOverflow = rect.left < -1 || rect.right > document.documentElement.clientWidth + 1;
        const textOverflow = !['INPUT', 'SELECT'].includes(element.tagName) && element.scrollWidth > element.clientWidth + 4 && getComputedStyle(element).overflowX !== 'auto';
        return rect.width <= 0 || rect.height <= 0 || viewportOverflow || textOverflow;
      }).map((element) => element.id || element.textContent.trim().slice(0, 40));
      return { overflow, bad };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.bad).toEqual([]);
    await expect(page.locator('[data-scenario-row="high-yield-corporate"]')).toContainText('Reduced reliability');
  }
});

test('Power ratio window sleeve focus and restored preferences stay local', async ({ page }) => {
  await openFromSharedCache(page);
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  const beforeRequests = requests.length;
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  await page.locator('#ratioSelect').selectOption('hyg-lqd');
  await page.locator('#ratioWindow').selectOption('3M');
  await page.locator('#focusSleeve').selectOption('long-treasury');
  await expect(page.locator('[data-chart-summary="ratio"]')).toContainText('HYG / LQD');
  await expect(page.locator('[data-chart-summary="decomposition"]')).toContainText('Long Treasury');
  expect(requests.length).toBe(beforeRequests);
  await page.reload();
  await expect(page.locator('#powerTab')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#ratioSelect')).toHaveValue('hyg-lqd');
  await expect(page.locator('#ratioWindow')).toHaveValue('3M');
  await expect(page.locator('#focusSleeve')).toHaveValue('long-treasury');
});

test('Power sleeve analytics expose return risk drawdown and trend when history is sufficient', async ({ page }) => {
  await openFromSharedCache(page);
  await page.locator('#rlviews button[data-rlview-mode="power"]').click();
  const row = page.locator('[data-sleeve-analytics="short-treasury"]');
  await expect(row.locator('[data-market="return"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="volatility"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="drawdown"]')).not.toHaveText('Unavailable');
  await expect(row.locator('[data-market="trend"]')).toHaveText(/Uptrend|Downtrend|Mixed/);
});

test('Live page loads production config cache and reachable public sources without uncaught errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await openFromSharedCache(page);
  await expect(page.locator('#configError')).toHaveClass(/is-hidden/);
  await expect(page.locator('#appStatus')).toContainText('Ready');
  expect(errors).toEqual([]);
});

test('Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await openFromSharedCache(page);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('tab', { name: 'Simple' })).toBeVisible();
    await page.getByRole('tab', { name: 'Power' }).click();
    await expect(page.locator('#powerView h2')).toHaveCount(5);
    await expect(page.locator('canvas[aria-label]')).toHaveCount(3);
    await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBeTruthy();
    await page.locator('#rlviews button[data-rlview-mode="power"]').focus();
    await expect(page.locator('#rlviews button[data-rlview-mode="power"]')).toBeFocused();
  }
});