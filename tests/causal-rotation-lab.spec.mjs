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

test('Regression: served causal contracts preserve explicit stale and unavailable states', async ({ request }) => {
  const configResponse = await request.get(baseUrl + '/causal-rotation.config.json');
  const observationsResponse = await request.get(baseUrl + '/causal-rotation-observations.json');
  const timingResponse = await request.get(baseUrl + '/tests/fixtures/causal-rotation/invalid/stale-timing.json');
  expect(configResponse.ok()).toBeTruthy();
  expect(observationsResponse.ok()).toBeTruthy();
  expect(timingResponse.ok()).toBeTruthy();
  const observations = await observationsResponse.json();
  expect(observations.hypotheses.some((hypothesis) => hypothesis.unavailableEvidence?.some((entry) => entry.evidenceClass === 'valuation'))).toBeTruthy();
});

test('Regression: Evidence available after a decision is excluded from that decision', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const result = JSON.parse(await page.locator('#time-result').textContent());
  expect(result.eligible).toBe(0);
  expect(result.excludedCodes.length).toBeGreaterThan(0);
  expect(result.excludedCodes.every((code) => code === 'CR-TIME-INELIGIBLE')).toBeTruthy();
  expect(result.laterCode).toBe('CR-TIME-INELIGIBLE');
  expect(result.frozenBytesUnchanged).toBeTruthy();
  expect(result.frozenDigestUnchanged).toBeTruthy();
  expect(result.outcomeState).toBe('falsified');
});

test('Regression: One announcement drives price options and ETF activity', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const result = JSON.parse(await page.locator('#cluster-result').textContent());
  expect(result.clusters).toBe(1);
  expect(result.members).toBe(4);
  expect(result.origins).toBe(1);
  expect(result.reasonKeys).toBe(1);
});

test('Regression: Decision-critical valuation and timing inputs are stale or unavailable', async ({ page }) => {
  await page.goto(baseUrl + '/tests/fixtures/causal-rotation/foundation-harness.html');
  await expect(page.getByRole('status')).toHaveText('Production causal foundation ready');
  const results = JSON.parse(await page.locator('#stale-result').textContent());
  expect(results.map((result) => result.posture)).toEqual(['discovery', 'balanced', 'confirmation']);
  expect(results.every((result) => result.timingState === 'stale' && result.timingCode === 'CR-TIMING-UNAVAILABLE')).toBeTruthy();
  expect(results.every((result) => result.missing.includes('valuation') && result.planEligible === false)).toBeTruthy();
});

/* ═══════════════════════ SCOPE-02 — Causal Rotation Lab owner UI ═══════════════════════
   The owner page is served from the repository root over real HTTP and reads only committed
   same-origin resources. There are no evaluator mocks: every assertion is made against the same
   rlcausal.js evaluation the production page runs.

   Candidates are chosen for what they PROVE, not for convenience:
   - AI infrastructure demand is the sourced-mechanism candidate still awaiting market confirmation.
   - The reflex bounce is the one carrying a current blocking contradiction.
   - Financial credit selectivity is the only family with every required evidence class present,
     so it is the only one whose timeline is genuinely drawable. */

const AI_CANDIDATE = 'cand:ai-infrastructure-demand:semiconductors';
const REFLEX_CANDIDATE = 'cand:semiconductor-reflex-bounce:semiconductors';
const COMPLETE_CANDIDATE = 'cand:financial-credit-selectivity:banks';

/* The UI scenario matrix requires every scenario to hold at both viewports. */
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

async function openLab(page, { candidate, posture, mode } = {}) {
  const parts = [];
  if (candidate) parts.push('candidate=' + encodeURIComponent(candidate));
  if (posture) parts.push('posture=' + encodeURIComponent(posture));
  const hash = parts.length ? '#' + parts.join('&') : '';
  await page.goto(`${baseUrl}/causal-rotation-lab.html${hash}`);
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');
  /* Since registration the shared four-view shell owns view selection, exactly as it does on
     every other registered tool, so Power is entered through that control rather than a hash. */
  if (mode === 'power') {
    await page.click('[data-rlview-mode="power"]');
    await expect(page.locator('body')).toHaveClass(/power/);
  }
}

test('Regression: owner page and committed causal resources load over live same-origin HTTP', async ({ page }) => {
  const failures = [];
  page.on('response', (response) => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
  page.on('pageerror', (error) => failures.push('pageerror: ' + error.message));

  await openLab(page);

  for (const asset of ['causal-rotation.config.json', 'causal-rotation-observations.json', 'causal-rotation-ledger.jsonl', 'rlcausal.js']) {
    const status = await page.evaluate(async (path) => (await fetch(path, { cache: 'no-store' })).status, asset);
    expect(status, `${asset} must be served`).toBe(200);
  }
  expect(await page.evaluate(() => (window.RLCausal ? 'present' : 'absent'))).toBe('present');
  expect(failures, failures.join('\n')).toEqual([]);
});

test('Regression: A sourced policy mechanism leads market confirmation', async ({ page }) => {
  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openLab(page, { candidate: AI_CANDIDATE, posture: 'discovery' });

    await expect(page.locator('body'), viewport.name).not.toHaveClass(/power/);
    await expect(page.locator('#simpleStage'), viewport.name).toHaveText('cause-emerging');
    await expect(page.locator('#planEligible'), viewport.name).toHaveText('not plan-eligible');

    /* An early cause must never read as an instruction. */
    const simpleText = await page.locator('#simpleBody').innerText();
    expect(simpleText, viewport.name).not.toMatch(/\b(buy|sell|short|add to|trim|take profit|enter the trade)\b/i);
    expect(simpleText, viewport.name).toMatch(/not advice/i);

    await expect(page.locator('#sourceAge'), viewport.name).not.toHaveText('');
    await expect(page.locator('#expectedWindow'), viewport.name).toContainText('→');
    await expect(page.locator('#confirmList li'), viewport.name).not.toHaveCount(0);
    await expect(page.locator('#invalidateList li'), viewport.name).not.toHaveCount(0);

    /* The market-confirmation clock is honestly unavailable rather than assumed. */
    await expect(page.locator('#clockStrip .cell').nth(3), viewport.name).toContainText(/unavailable|missing/);

    /* Moving the posture explains the CHANGED gate without touching evidence quality. */
    await page.selectOption('#postureSel', 'confirmation');
    await expect(page.locator('body'), viewport.name).toHaveAttribute('data-causal-ready', '1');
    await expect(page.locator('#gateHeadline'), viewport.name).toContainText('confirmation');
    await expect(page.locator('#gateMarketState'), viewport.name).toContainText('→');
    await expect(page.locator('#invariantGates'), viewport.name).toContainText('contradiction');
    await expect(page.locator('#invariantGates'), viewport.name).toContainText('independence');
  }
});

test('Regression: Fundamental evidence contradicts an oversold semiconductor rebound', async ({ page }) => {
  await openLab(page, { candidate: REFLEX_CANDIDATE, posture: 'discovery', mode: 'power' });
  await expect(page.locator('body')).toHaveClass(/power/);

  await expect(page.locator('#contradictionBlock')).toContainText('blocking contradiction');
  await expect(page.locator('#contradictionBlock')).toContainText('obs:intel-q2-fy26-eps-guidance');

  /* Contradiction is rendered BEFORE supporting detail, not after it. */
  const order = await page.evaluate(() => {
    const detail = document.getElementById('detailBody');
    const contradiction = document.getElementById('contradictionBlock');
    const support = document.getElementById('supportBlock');
    if (!detail || !contradiction || !support) return null;
    const nodes = Array.from(detail.querySelectorAll('*'));
    return { contradiction: nodes.indexOf(contradiction), support: nodes.indexOf(support) };
  });
  expect(order).not.toBeNull();
  expect(order.contradiction).toBeGreaterThanOrEqual(0);
  expect(order.support).toBeGreaterThan(order.contradiction);

  await expect(page.locator('#regimeCurrent')).toContainText('reg:us-2026-07-recorded');
  await expect(page.locator('#regimeAlternative')).toContainText('reg:alternative-liquidity-down-multiples-compress');

  const detailText = await page.locator('#detailBody').innerText();
  expect(detailText).toMatch(/contradicted|reflex/i);
  /* The candidate must not be LABELLED durable repair. A bare substring check would match the
     page's own disclaimer ("read as reflex or contradicted rather than durable repair"), so the
     assertion targets the affirmative claim, and every remaining mention must be that disclaimer. */
  expect(detailText).not.toMatch(/\b(is|as|confirms?|confirmed)\s+(a\s+|the\s+)?durable repair\b/i);
  const repairMentions = detailText.match(/durable repair/gi) || [];
  const disclaimedMentions = detailText.match(/rather than durable repair/gi) || [];
  expect(repairMentions.length).toBe(disclaimedMentions.length);

  /* Same candidate identity in both modes — Power is a deeper view, not a second conclusion. */
  expect(detailText).toContain(REFLEX_CANDIDATE);
  await page.click('[data-rlview-mode="simple"]');
  await expect(page.locator('#simpleRead')).toContainText(REFLEX_CANDIDATE);
  await expect(page.locator('#simpleStage')).toHaveText('contradicted');

  /* The same scenario must hold on a phone-sized viewport. */
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page, { candidate: REFLEX_CANDIDATE, posture: 'discovery', mode: 'power' });
  await expect(page.locator('#contradictionBlock'), 'mobile').toContainText('blocking contradiction');
  await expect(page.locator('#regimeCurrent'), 'mobile').toContainText('reg:us-2026-07-recorded');
  await expect(page.locator('#regimeAlternative'), 'mobile').toContainText('reg:alternative-liquidity-down-multiples-compress');
  const mobileOrder = await page.evaluate(() => {
    const detail = document.getElementById('detailBody');
    const nodes = Array.from(detail.querySelectorAll('*'));
    return nodes.indexOf(document.getElementById('supportBlock')) > nodes.indexOf(document.getElementById('contradictionBlock'));
  });
  expect(mobileOrder, 'contradiction precedes support on mobile too').toBe(true);
});

test('Regression: A required chart input is unavailable and local decision storage fails', async ({ page }) => {
  /* Storage refuses the decision append ONLY, so the failure under test is the append itself
     rather than a broken page. */
  await page.addInitScript(() => {
    const original = window.localStorage.setItem.bind(window.localStorage);
    window.localStorage.setItem = function (key, value) {
      if (key === 'rlCausalDecisionsV1') throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      return original(key, value);
    };
  });

  await openLab(page, { candidate: REFLEX_CANDIDATE, posture: 'discovery', mode: 'power' });

  /* The chart is replaced by a structured unavailable state naming the exact missing fields. */
  await expect(page.locator('#chartUnavailable')).toBeVisible();
  await expect(page.locator('#chartUnavailable')).toContainText('evidenceClass:valuation');
  await expect(page.locator('#chartUnavailable')).toContainText('valuation.provider');
  await expect(page.locator('#causalChart')).toHaveCount(0);
  await expect(page.locator('#unavailableEvidence')).toContainText('missing fields');

  /* Freezing while storage rejects the append leaves an unsaved, exportable draft. */
  await page.fill('#decisionNote', 'Watch revision breadth before treating this as repair.');
  await page.click('#freezeBtn');
  await expect(page.locator('#draftNotice')).toBeVisible();
  await expect(page.locator('#draftNotice')).toContainText('unsaved draft');
  await expect(page.locator('#exportBtn')).toBeVisible();

  /* The UI must never announce that the decision was recorded. */
  const recorderText = await page.locator('#recorderBody').innerText();
  expect(recorderText).not.toMatch(/was appended to the browser-local store/i);
  expect(await page.locator('#savedNotice').count()).toBe(0);
  expect(await page.evaluate(() => window.localStorage.getItem('rlCausalDecisionsV1'))).toBeNull();

  /* The same honesty must hold on a phone-sized viewport. */
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page, { candidate: REFLEX_CANDIDATE, posture: 'discovery', mode: 'power' });
  await expect(page.locator('#chartUnavailable'), 'mobile').toContainText('evidenceClass:valuation');
  await page.fill('#decisionNote', 'Mobile check.');
  await page.click('#freezeBtn');
  await expect(page.locator('#draftNotice'), 'mobile').toContainText('unsaved draft');
  expect(await page.locator('#savedNotice').count(), 'mobile').toBe(0);
});

test('Regression: a decisions import is all-or-nothing and never lands partially', async ({ page }) => {
  await openLab(page, { candidate: COMPLETE_CANDIDATE, posture: 'discovery', mode: 'power' });

  /* Build one genuinely valid record and one whose digest does not match its content. */
  const files = await page.evaluate(() => {
    const config = { contracts: { ledgerEvent: 'causal-ledger-event/v1' } };
    const makeEvent = (id) => {
      const event = {
        contractVersion: config.contracts.ledgerEvent,
        eventType: 'decision',
        eventId: 'evt:' + id,
        recordedAt: '2026-07-12T21:45:00Z',
        payload: { decisionId: id, candidateId: 'cand:financial-credit-selectivity:banks', sensitivityPosture: 'discovery', decisionAt: '2026-07-12T21:45:00Z' }
      };
      event.contentDigest = window.RLCausal.digestRecord(event);
      return event;
    };
    const good = makeEvent('dec:import-good');
    const tampered = makeEvent('dec:import-bad');
    tampered.payload.sensitivityPosture = 'confirmation'; /* digest now stale on purpose */
    return { good: JSON.stringify(good), tampered: JSON.stringify(tampered) };
  });

  /* A file containing one valid and one invalid record must import NOTHING. */
  await page.setInputFiles('#importInput', {
    name: 'mixed.jsonl', mimeType: 'application/x-ndjson',
    buffer: Buffer.from(files.good + '\n' + files.tampered + '\n')
  });
  await expect(page.locator('#importNotice')).toContainText('refused in full');
  expect(await page.evaluate(() => window.localStorage.getItem('rlCausalDecisionsV1'))).toBeNull();

  /* A wholly valid file imports completely. */
  await page.setInputFiles('#importInput', {
    name: 'good.jsonl', mimeType: 'application/x-ndjson',
    buffer: Buffer.from(files.good + '\n')
  });
  await expect(page.locator('#importNotice')).toContainText('Imported 1 decision record');
  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('rlCausalDecisionsV1') || '[]'));
  expect(stored.length).toBe(1);
  expect(stored[0].decisionId).toBe('dec:import-good');
});

test('Regression: causal controls clocks timeline and charts remain keyboard and screen-reader operable', async ({ page }) => {
  await openLab(page, { candidate: COMPLETE_CANDIDATE, posture: 'discovery', mode: 'power' });

  const canvas = page.locator('#causalChart');
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toHaveAttribute('data-rlchart-mode', 'structured');
  expect(await canvas.getAttribute('data-rlchart-error')).toBeNull();
  await expect(canvas).toHaveAttribute('role', 'img');
  const label = await canvas.getAttribute('aria-label');
  expect(label && label.length).toBeGreaterThan(20);

  /* A complete chart is NOT blank. */
  const painted = await page.evaluate(() => {
    const node = document.getElementById('causalChart');
    const data = node.getContext('2d').getImageData(0, 0, node.width, node.height).data;
    const seen = new Set();
    for (let i = 0; i < data.length; i += 4) seen.add(data[i] + ',' + data[i + 1] + ',' + data[i + 2]);
    return seen.size;
  });
  expect(painted, 'a drawn timeline must contain more than one colour').toBeGreaterThan(1);

  /* The same data is reachable without the canvas. */
  await expect(page.locator('#clockTable tbody tr')).not.toHaveCount(0);

  await expect(canvas).toHaveAttribute('tabindex', '0');
  const firstRow = page.locator('#candTableWrap tr[data-candidate]').first();
  await firstRow.focus();
  await firstRow.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  await expect(page.locator('#modeSeg button[data-mode="power"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#postureSel')).toBeEnabled();
});

test('Regression: posture and sleeve controls rerender without causal or market network requests', async ({ page }) => {
  await openLab(page, { candidate: AI_CANDIDATE, posture: 'discovery', mode: 'power' });

  const requests = [];
  page.on('request', (request) => requests.push(request.url()));

  await page.selectOption('#postureSel', 'confirmation');
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');
  await page.selectOption('#postureSel', 'discovery');
  await page.selectOption('#exposureSel', 'all');
  await page.click('[data-rlview-mode="simple"]');
  await page.click('[data-rlview-mode="power"]');
  await expect(page.locator('body')).toHaveAttribute('data-causal-ready', '1');

  /* Recomputing is synchronous over already-loaded evidence. */
  const offending = requests.filter((url) => /causal-rotation|finance\.yahoo|twelvedata|stockanalysis|finnhub|stlouisfed/i.test(url));
  expect(offending, offending.join('\n')).toEqual([]);
});

test('Regression: a private or credential field refuses the whole note and records nothing', async ({ page }) => {
  await openLab(page, { candidate: COMPLETE_CANDIDATE, posture: 'discovery', mode: 'power' });

  await page.fill('#decisionNote', 'Sized against my cost basis and account number 12345.');
  await page.click('#freezeBtn');

  await expect(page.locator('#rejectedNotice')).toBeVisible();
  await expect(page.locator('#rejectedNotice')).toContainText('rejected in full');
  /* Refused in full: nothing is written and nothing is silently stripped. */
  expect(await page.evaluate(() => window.localStorage.getItem('rlCausalDecisionsV1'))).toBeNull();
  expect(await page.locator('#savedNotice').count()).toBe(0);

  /* The same note without the private field records normally, proving the gate is the field
     and not a broken recorder. */
  await page.fill('#decisionNote', 'Sized against the recorded regime assumptions.');
  await page.click('#freezeBtn');
  await expect(page.locator('#savedNotice')).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(window.localStorage.getItem('rlCausalDecisionsV1') || '[]'));
  expect(stored.length).toBe(1);
});

test('Regression: the causal owner leaves the shared RLDATA market cache and RLAPP status untouched', async ({ page }) => {
  /* Load an existing registered tool FIRST so the shared cache is already populated. */
  await page.goto(`${baseUrl}/volatility-sizing-lab.html`);
  await page.waitForSelector('#rl-data-shell', { state: 'attached' });
  const before = await page.evaluate(() => {
    const data = window.RLDATA.freshness();
    return { bars: Object.keys(data.bars).length, options: Object.keys(data.options).length, toolReads: Object.keys(data.toolReads).length };
  });

  await openLab(page, { candidate: AI_CANDIDATE, posture: 'discovery' });
  const after = await page.evaluate(() => {
    const data = window.RLDATA.freshness();
    return {
      bars: Object.keys(data.bars).length,
      options: Object.keys(data.options).length,
      causal: window.RLDATA.toolRead('causal-rotation-lab')
    };
  });

  /* The causal owner adds a compact tool read and NOTHING to the market cache. */
  expect(after.bars).toBe(before.bars);
  expect(after.options).toBe(before.options);
  expect(after.causal).not.toBeNull();
  expect(after.causal.id).toBe('causal-rotation-lab');
  expect(Object.prototype.hasOwnProperty.call(after.causal, 'candidates')).toBe(false);

  /* The existing tool still mounts its own status shell and controls afterwards. */
  await page.goto(`${baseUrl}/volatility-sizing-lab.html`);
  await expect(page.locator('#rl-data-shell')).toBeAttached();
  const trigger = page.locator('.rl-data-trigger');
  const expandedBefore = await trigger.getAttribute('aria-expanded');
  await trigger.click();
  expect(await trigger.getAttribute('aria-expanded')).not.toBe(expandedBefore);
});
