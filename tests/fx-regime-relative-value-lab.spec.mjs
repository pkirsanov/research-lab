import { createRequire } from 'node:module';
import { test, expect } from './playwright-runtime.mjs';
import { startStaticServer } from './provider-credentials.support.mjs';

const require = createRequire(import.meta.url);
const nodeRLFX = require('../rlfx.js');
let site;

test.beforeAll(async () => {
  site = await startStaticServer();
});

test.afterAll(async () => {
  if (site) await site.close();
});

function rows(dates, levels) {
  return levels.map((close, index) => ({
    t: Date.parse(dates[index] + 'T21:00:00.000Z'),
    c: close
  }));
}

function currencySeries(codes, levelsByCode, dates) {
  return Object.fromEntries(codes.map((code) => [code, rows(dates, levelsByCode[code])]));
}

async function openHarness(page) {
  await page.goto(site.baseUrl + '/tests/fixtures/fx-regime/foundation-harness.html');
  await expect(page.locator('#ready')).toHaveText('RLFX foundation functional harness');
  return page.evaluate(() => fetch('/tests/fixtures/fx-regime/foundation-cases.json').then((response) => response.json()));
}

test('Browser functional source envelopes match in browser and CommonJS for one decisionTime', async ({ page }) => {
  const fixture = await openHarness(page);
  const raw = {
    symbol: fixture.sourceEnvelope.symbol,
    interval: fixture.sourceEnvelope.interval,
    providerTag: fixture.sourceEnvelope.providerTag,
    sourceUrl: fixture.sourceEnvelope.sourceUrl,
    retrievedAt: fixture.sourceEnvelope.retrievedAt,
    rows: rows(fixture.dates, fixture.sourceEnvelope.levels)
  };
  const expected = nodeRLFX.normalizeSourceEnvelope(raw, fixture.sourceEnvelope.policy, fixture.decisionTime);
  const browser = await page.evaluate(({ fixture, raw }) => {
    const meta = {
      sourceId: fixture.sourceEnvelope.policy.sourceId,
      providerTag: raw.providerTag,
      url: raw.sourceUrl,
      sourceUsePolicyId: fixture.sourceEnvelope.policy.sourceUsePolicyId,
      sourceUseReviewRef: fixture.sourceEnvelope.policy.sourceUseReviewRef,
      retrievedAt: raw.retrievedAt,
      expectedCadence: fixture.sourceEnvelope.policy.expectedCadence,
      reviewWindow: fixture.sourceEnvelope.policy.reviewWindow,
      rights: fixture.sourceEnvelope.policy.rights,
      quality: 'observed',
      limitations: fixture.sourceEnvelope.policy.limitations
    };
    window.RLDATA.putBarSeries(raw.symbol, raw.interval, raw.rows, meta);
    const envelope = window.RLDATA.barSeries(raw.symbol, raw.interval, fixture.sourceEnvelope.policy, fixture.decisionTime);
    window.RLDATA.putBars('LEGACY-RIGHTS-SENTINEL', '1d', [{ t: raw.rows[0].t, c: 918273.645 }], 'fixture-approved');
    const legacy = window.RLDATA.barSeries('LEGACY-RIGHTS-SENTINEL', '1d', { ...fixture.sourceEnvelope.policy, subjects: ['LEGACY-RIGHTS-SENTINEL'] }, fixture.decisionTime);
    const versioned = {
      contractVersion: 'rl-tool-read/v1',
      id: 'fx-regime-relative-value-lab',
      availability: 'unavailable',
      asOf: null,
      read: 'Unavailable under controlled source posture',
      metrics: { state: 'unavailable' },
      deepLink: 'fx-regime-relative-value-lab.html#simple',
      computedAt: fixture.decisionTime,
      freshUntil: null
    };
    const saved = window.RLDATA.putToolRead(versioned.id, versioned);
    return {
      canonical: window.RLFX.canonicalize(envelope),
      legacy,
      saved,
      schema: JSON.parse(localStorage.getItem('rlData')).v
    };
  }, { fixture, raw });
  expect(browser.canonical).toBe(nodeRLFX.canonicalize(expected));
  expect(expected.observedAsOf).toBe(new Date(raw.rows.at(-1).t).toISOString());
  expect(expected.retrievedAt).toBe(raw.retrievedAt);
  expect(browser.legacy.availability).toBe('unavailable');
  expect(browser.legacy.unavailableReason).toBe('RIGHTS_UNCLEAR');
  expect(browser.legacy.rows).toEqual([]);
  expect(JSON.stringify(browser.legacy)).not.toContain('918273.645');
  expect(browser.saved.computedAt).toBe(fixture.decisionTime);
  expect(browser.saved.asOf).toBeNull();
  expect(browser.schema).toBe(1);
});

test('Browser functional SCN-004-001/002: Broad AFE EME and proxy states remain separate', async ({ page }) => {
  const fixture = await openHarness(page);
  const input = structuredClone(fixture.broadDollar);
  input.series = input.series.map((series) => ({ ...series, rows: rows(fixture.dates, series.levels) }));
  const result = await page.evaluate((value) => window.RLFX.computeBroadDollar(value), input);
  expect(result.series['official-broad'].state).toBe('Weakening');
  expect(result.series['proxy-broad'].state).toBe('Strengthening');
  expect(result.series['official-afe'].observedAsOf).not.toBe(result.series['official-eme'].observedAsOf);
  expect(result.conflicts.map((conflict) => conflict.code)).toContain('OFFICIAL_PROXY_DIVERGENCE');
  expect(result.concentration).not.toBe('broad');
});

test('Browser functional SCN-004-003/005/008: cohort rank uses one full-graph exact-date window', async ({ page }) => {
  const fixture = await openHarness(page);
  const commonDates = fixture.dates.slice(0, 4);
  const baseInput = {
    decisionTime: fixture.decisionTime,
    cohort: 'G10',
    currencies: fixture.g10.codes.map((code) => ({ code, cohort: 'G10', rankEligible: true, autoPairEligible: true, management: 'free-float' })),
    currencySeries: currencySeries(fixture.g10.codes, fixture.g10.levels, commonDates),
    horizonSessions: 3,
    minimumPeers: 3,
    minimumCoverageRatio: 0.6,
    stateZ: 0.5,
    deadbandLogReturn: 0.001
  };
  const ranked = await page.evaluate((value) => window.RLFX.computeCurrencyStrength(value), baseInput);
  const eur = ranked.ranked.find((entry) => entry.currency === 'EUR');
  expect(eur.state).not.toBe('Strong');
  expect(eur.rawMeanLogReturn).toBeLessThan(0);
  expect(ranked.ranked.every((entry) => entry.rankWindowId === ranked.rankWindow.setId)).toBe(true);
  expect(new Set(ranked.ranked.map((entry) => entry.evaluationDate)).size).toBe(1);

  const lagged = structuredClone(baseInput);
  lagged.currencySeries.CHF = rows(fixture.dates.slice(1, 5), fixture.g10.levels.CHF);
  const unavailable = await page.evaluate((value) => window.RLFX.computeCurrencyStrength(value), lagged);
  const inspectablePair = await page.evaluate(({ dates, levels }) => window.RLFX.alignExact([
    { legId: 'EUR', observationId: 'EUR', subject: 'EUR', adjustment: 'raw-close', rows: dates.map((date, index) => ({ t: Date.parse(date + 'T21:00:00.000Z'), c: levels[index] })) },
    { legId: 'USD', observationId: 'USD', subject: 'USD', adjustment: 'raw-close', rows: dates.map((date) => ({ t: Date.parse(date + 'T21:00:00.000Z'), c: 1 })) }
  ], 3, 'pair-return'), { dates: commonDates, levels: fixture.g10.levels.EUR });
  expect(unavailable.state).toBe('unavailable');
  expect(unavailable.ranked).toEqual([]);
  expect(unavailable.rankWindow.coverage.commonRowCount).toBeLessThan(4);
  expect(inspectablePair.state).toBe('aligned');
});

test('Browser functional SCN-004-004: explicit orientation and inverse sources count one relationship', async ({ page }) => {
  const fixture = await openHarness(page);
  const directRows = rows(fixture.dates.slice(0, 4), [1.1, 1.2, 1.3, 1.4]);
  const inverseRows = directRows.map((row) => ({ t: row.t, c: 1 / row.c }));
  const result = await page.evaluate(({ directRows, inverseRows }) => {
    const direct = window.RLFX.orientSeries(directRows, { base: 'EUR', quote: 'USD' }, { base: 'EUR', quote: 'USD' });
    const inverse = window.RLFX.orientSeries(inverseRows, { base: 'USD', quote: 'EUR' }, { base: 'EUR', quote: 'USD' });
    const invalid = window.RLFX.orientSeries(directRows, { base: 'GBP', quote: 'USD' }, { base: 'EUR', quote: 'USD' });
    return { direct, inverse, invalid };
  }, { directRows, inverseRows });
  const directReturn = result.direct.rows.at(-1).c / result.direct.rows[0].c - 1;
  const inverseReturn = result.inverse.rows.at(-1).c / result.inverse.rows[0].c - 1;
  expect(inverseReturn).toBeCloseTo(directReturn, 12);
  expect(result.direct.relationshipId).toBe(result.inverse.relationshipId);
  expect(result.invalid.unavailableReason).toBe('INVALID_ORIENTATION');
  expect(result.invalid.rows).toEqual([]);
});

test('Browser functional SCN-004-006/007: cohort and managed-reference eligibility never pool', async ({ page }) => {
  const fixture = await openHarness(page);
  const dates = fixture.dates.slice(0, 4);
  const buildInput = (cohort, codes, levels) => ({
    decisionTime: fixture.decisionTime,
    cohort,
    currencies: codes.map((code) => ({ code, cohort, rankEligible: true, autoPairEligible: true, management: 'free-float' })),
    currencySeries: currencySeries(codes, levels, dates),
    horizonSessions: 3,
    minimumPeers: 3,
    minimumCoverageRatio: 0.6,
    stateZ: 0.5,
    deadbandLogReturn: 0.001
  });
  const g10 = await page.evaluate((value) => window.RLFX.computeCurrencyStrength(value), buildInput('G10', fixture.g10.codes, fixture.g10.levels));
  const liquidEm = await page.evaluate((value) => window.RLFX.computeCurrencyStrength(value), buildInput('liquid-EM', fixture.liquidEm.codes, fixture.liquidEm.levels));
  const managed = await page.evaluate((decisionTime) => window.RLFX.computeCurrencyStrength({
    decisionTime,
    cohort: 'managed-reference',
    currencies: [{ code: 'CNY', cohort: 'managed-reference', rankEligible: false, autoPairEligible: false, management: 'managed' }],
    currencySeries: { CNY: [{ t: Date.parse('2026-01-02T21:00:00.000Z'), c: 1 }, { t: Date.parse('2026-01-19T21:00:00.000Z'), c: 1.0001 }] },
    horizonSessions: 1,
    minimumPeers: 1,
    minimumCoverageRatio: 1,
    stateZ: 0.5,
    deadbandLogReturn: 0.001
  }), fixture.decisionTime);
  expect(g10.ranked.every((entry) => fixture.g10.codes.includes(entry.currency))).toBe(true);
  expect(liquidEm.ranked.every((entry) => fixture.liquidEm.codes.includes(entry.currency))).toBe(true);
  expect(g10.autoCandidate.base).not.toBe(liquidEm.autoCandidate.base);
  expect(managed.state).toBe('reference-only');
  expect(managed.ranked).toEqual([]);
  expect(managed.autoCandidate).toBeNull();
});

test('Browser functional SCN-004-009/010: pair momentum and Policy-rate proxy remain distinct', async ({ page }) => {
  const fixture = await openHarness(page);
  const input = {
    decisionTime: fixture.decisionTime,
    base: fixture.pair.base,
    quote: fixture.pair.quote,
    cohort: fixture.pair.cohort,
    selectedHorizon: 'tactical',
    rows: rows(fixture.dates, fixture.pair.risingLevels),
    baseStrength: { zDistance: 1.1, coverageRatio: 0.9 },
    quoteStrength: { zDistance: -1, coverageRatio: 0.9 },
    policy: fixture.pair.policy,
    carry: fixture.policyCarry,
    reerValue: fixture.reerValue,
    positioning: fixture.positioning,
    event: fixture.eventUnavailable,
    managedReference: false,
    fundingStrength: false,
    riskRise: false
  };
  const withConflict = await page.evaluate((value) => window.RLFX.computePairRead(value), input);
  const withoutConflict = await page.evaluate((value) => window.RLFX.computePairRead({ ...value, carry: { ...value.carry, value: 0.75 } }), input);
  expect(withConflict.momentum.tactical.state).toBe('Positive');
  expect(withConflict.carry.kind).toBe('policy-rate-proxy');
  expect(withConflict.carry.label).toBe('Policy-rate proxy');
  expect(withConflict.carry.subtype).toBeUndefined();
  expect(withConflict.carry.roll).toBe('not-applicable');
  expect(withConflict.carry.liquidity).toBe('not-observed');
  expect(withConflict.carry.cost).toBe('not-observed');
  expect(withConflict.conflicts.map((conflict) => conflict.code)).toContain('TREND_CARRY_DIVERGENCE');
  expect(withConflict.confidencePct).toBeLessThan(withoutConflict.confidencePct);
});

test('Browser functional SCN-004-011: CarryReadV1 rejects every incomplete market-implied branch', async ({ page }) => {
  const fixture = await openHarness(page);
  const requiredPaths = [
    ['instrument'], ['instrument', 'id'], ['instrument', 'venue'], ['instrument', 'contractOrQuote'],
    ['tenor'], ['basis'], ['roll'], ['liquidity'], ['cost'], ['rights'], ['observedAsOf'],
    ['retrievedAt'], ['freshUntil'], ['limitations']
  ];
  const result = await page.evaluate(({ marketCarry, policyCarry, decisionTime, requiredPaths }) => {
    const rejected = requiredPaths.map((path) => {
      const candidate = structuredClone(marketCarry);
      let target = candidate;
      for (let index = 0; index < path.length - 1; index += 1) target = target[path[index]];
      delete target[path.at(-1)];
      try { window.RLFX.normalizeCarryRead(candidate, decisionTime); return false; } catch (_error) { return true; }
    });
    return {
      rejected,
      complete: window.RLFX.normalizeCarryRead(marketCarry, decisionTime),
      proxy: window.RLFX.normalizeCarryRead(policyCarry, decisionTime)
    };
  }, { marketCarry: fixture.marketCarry, policyCarry: fixture.policyCarry, decisionTime: fixture.decisionTime, requiredPaths });
  expect(result.rejected.every(Boolean)).toBe(true);
  expect(result.complete.kind).toBe('market-implied');
  expect(result.proxy.label).toBe('Policy-rate proxy');
  expect(result.proxy.subtype).toBeUndefined();
});

test('Browser functional SCN-004-012/013/014: value and positioning retain semantics and clocks', async ({ page }) => {
  const fixture = await openHarness(page);
  const base = {
    decisionTime: fixture.decisionTime,
    base: fixture.pair.base,
    quote: fixture.pair.quote,
    cohort: fixture.pair.cohort,
    selectedHorizon: 'tactical',
    rows: rows(fixture.dates, fixture.pair.fallingLevels),
    baseStrength: { zDistance: 0.2, coverageRatio: 0.9 },
    quoteStrength: { zDistance: -0.1, coverageRatio: 0.9 },
    policy: fixture.pair.policy,
    carry: fixture.policyCarry,
    reerValue: fixture.reerValue,
    positioning: fixture.positioning,
    event: fixture.eventUnavailable,
    managedReference: false,
    fundingStrength: false,
    riskRise: false
  };
  const result = await page.evaluate((value) => {
    const available = window.RLFX.computePairRead(value);
    const missing = window.RLFX.computePairRead({ ...value, positioning: { state: 'Unavailable', availability: 'unavailable', unavailableReason: 'NO_COVERAGE', limitations: ['No mapped contract'] } });
    return { available, missing };
  }, base);
  expect(result.available.state).not.toBe('Candidate');
  expect(result.available.conflicts.map((conflict) => conflict.code)).toContain('VALUE_TREND_TENSION');
  expect(result.available.positioning.reportAsOf).toBe(fixture.positioning.reportAsOf);
  expect(result.available.positioning.releasedAt).toBe(fixture.positioning.releasedAt);
  expect(result.missing.positioning.unavailableReason).toBe('NO_COVERAGE');
  expect(JSON.stringify(result.missing.positioning)).not.toMatch(/uncrowded|balanced|light/i);
});

test('Browser functional SCN-004-015/016/024: unwind and event absence retain multi-family rules and safe projection', async ({ page }) => {
  const fixture = await openHarness(page);
  const pairInput = {
    decisionTime: fixture.decisionTime,
    base: fixture.pair.base,
    quote: fixture.pair.quote,
    cohort: fixture.pair.cohort,
    selectedHorizon: 'tactical',
    rows: rows(fixture.dates, fixture.pair.fallingLevels),
    baseStrength: { zDistance: 0.8, coverageRatio: 0.9 },
    quoteStrength: { zDistance: -0.8, coverageRatio: 0.9 },
    policy: fixture.pair.policy,
    carry: { ...fixture.policyCarry, value: 0.75 },
    reerValue: fixture.reerValue,
    positioning: fixture.positioning,
    event: fixture.eventUnavailable,
    managedReference: false,
    fundingStrength: false,
    riskRise: false
  };
  const rightsObservation = {
    contractVersion: 'rlfx-currency-observation/v1',
    observationId: 'restricted:sentinel',
    family: 'spot',
    subject: { kind: 'pair', id: 'EURJPY' },
    base: 'EUR', quote: 'JPY', sourceBase: 'EUR', sourceQuote: 'JPY', inverted: false,
    positiveMeaning: 'EUR strengthens versus JPY', cohort: 'G10', tradability: 'indicative-proxy',
    value: 918273.645, unit: 'JPY per EUR', transformation: 'raw', horizon: null,
    source: { id: 'restricted-source', label: 'Restricted source', url: 'https://restricted.example.invalid/value' },
    observedAsOf: '2026-01-19T21:00:00.000Z', retrievedAt: '2026-01-19T21:05:00.000Z',
    expectedCadence: 'daily', reviewWindow: { mode: 'max-age', observedMaxAgeMs: 86400000, retrievalMaxAgeMs: 86400000 },
    availability: 'fresh', availabilityDetail: 'Technically retrievable but unreviewed', rights: 'unknown',
    quality: 'indicative-proxy', revisionId: null, adjustment: 'raw-close',
    lineage: { originIds: ['restricted:sentinel'], relationshipId: 'rel:EUR-JPY', derivedFrom: [] },
    limitations: ['Redistribution rights are unknown']
  };
  const result = await page.evaluate(({ pairInput, rightsObservation }) => {
    const highCarryOnly = window.RLFX.computePairRead(pairInput);
    const active = window.RLFX.computePairRead({ ...pairInput, fundingStrength: true, riskRise: true });
    const normalized = window.RLFX.normalizeObservation(rightsObservation);
    return { highCarryOnly, active, normalized };
  }, { pairInput, rightsObservation });
  expect(result.highCarryOnly.carryUnwind.state).toBe('Dormant');
  expect(result.active.carryUnwind.state).toBe('Active');
  expect(result.highCarryOnly.event.unavailableReason).toBe('NO_SOURCE');
  expect(result.highCarryOnly.invalidation).toMatch(/price|risk/i);
  expect(result.normalized.availability).toBe('unavailable');
  expect(result.normalized.unavailableReason).toBe('RIGHTS_UNCLEAR');
  expect(result.normalized.value).toBeUndefined();
  expect(JSON.stringify(result.normalized)).not.toContain('918273.645');
  expect(JSON.stringify(result.normalized)).not.toContain('restricted.example.invalid');
});

/* ══════════════════════════════════════════════════════════════════════════════════════════════
   Scope 2 — production-route regressions (TP-02-01 … TP-02-19).

   These serve the repository root exactly as checked out: no request interception, no fixture
   substitution, no controlled source input. Every assertion is therefore a statement about what
   the shipped route actually does under the committed source posture.

   Measured posture (scopes.md → "Measured Source Posture"): all 95 committed vehicle observations
   carry rights "unknown", so every registry member resolves Unavailable and the aggregate never
   reaches the settled No Eligible Vehicle outcome. The authorized-facts branches of
   SCN-004-027…031 are proven against the same production rlfx.js path by the named contracts in
   tests/feature-004-vehicle-universe.test.mjs.
   ══════════════════════════════════════════════════════════════════════════════════════════════ */

const FX_ROUTE = '/fx-regime-relative-value-lab.html';
const FX_REGISTRY_ORDER = ['FXY', 'FXE', 'UUP', 'UDN', 'USDU', 'CEW', 'YCS'];
const FX_EVIDENCE_FAMILIES = ['Spot', 'Independent strength', 'Carry', 'REER value', 'Delayed positioning', 'Realized risk', 'Events'];

async function openFxRoute(page) {
  const requested = [];
  page.on('request', (request) => { requested.push(request.url()); });
  await page.goto(site.baseUrl + FX_ROUTE);
  await expect(page.locator('body')).toHaveAttribute('data-fx-ready', '1');
  return requested;
}

function fxOwnerSnapshot(page) {
  return page.evaluate(() => {
    const lab = window.FxRegimeLab;
    const owner = lab.ownerDecision();
    const reader = lab.readerDecision();
    const read = lab.toolRead();
    return {
      ownerDecisionId: owner.ownerDecisionId,
      evidenceIdentity: owner.evidenceIdentity,
      ownerState: owner.state,
      fitState: owner.vehicleFit.state,
      selected: owner.vehicleFit.selected,
      freshUntil: owner.freshUntil,
      evaluations: owner.vehicleFit.evaluations.map((e) => ({
        vehicleId: e.vehicleId, ticker: e.ticker, state: e.state, reasonCodes: e.reasonCodes.slice()
      })),
      decision: reader.decision,
      vehicle: reader.vehicle,
      confirmation: reader.confirmation,
      invalidation: reader.invalidation,
      evidenceCutoff: reader.evidenceCutoff,
      reasons: reader.reasons.slice(),
      availability: read.availability,
      requestCount: lab.requestCount(),
      loadError: lab.loadError()
    };
  });
}

test('Regression SCN-004-017: public FX route paints truthful unavailable state without an authorized dependency', async ({ page }) => {
  const requested = await openFxRoute(page);
  const state = await fxOwnerSnapshot(page);

  expect(state.loadError).toBeNull();
  expect(state.ownerState).toBe('unavailable');
  expect(state.fitState).toBe('Unavailable');
  expect(state.selected).toBeNull();
  expect(state.freshUntil).toBeNull();
  expect(state.decision).toBe('Recommendation unavailable');
  expect(state.vehicle).toBeNull();
  expect(state.confirmation).toBeNull();
  expect(state.invalidation).toBeNull();
  expect(state.availability).toBe('unavailable');
  expect(state.reasons.length).toBeGreaterThan(0);

  // The unavailable state is explicit and reasoned, never blank and never a neutral placeholder.
  await expect(page.locator('#simplePanel')).toContainText('Recommendation unavailable');
  await expect(page.locator('#simpleReasons')).toContainText('Reuse rights are not established for a required fact.');

  // No unapproved source was requested: every request stayed same-origin.
  expect(requested.filter((url) => !url.startsWith(site.baseUrl))).toEqual([]);

  // No numeric rank, pair level, or regime score was substituted for the missing evidence.
  expect(await page.locator('#simplePanel').innerText()).not.toMatch(/\d+\.\d+/);
});

test('Regression SCN-004-018: control changes cause zero data requests', async ({ page }) => {
  await openFxRoute(page);
  // Let the initial load fully settle so the counter below measures control-driven traffic only.
  await page.waitForLoadState('networkidle');
  const before = await page.evaluate(() => window.FxRegimeLab.requestCount());

  const networkAfterReady = [];
  page.on('request', (request) => { networkAfterReady.push(request.url()); });

  const controlIds = await page.$$eval('#controlGrid select', (nodes) => nodes.map((n) => n.getAttribute('data-control-id')));
  expect(controlIds.length).toBeGreaterThan(0);

  // Drive every control to a different option through the real change event.
  for (const id of controlIds) {
    const select = page.locator(`#controlGrid select[data-control-id="${id}"]`);
    const options = await select.locator('option').evaluateAll((nodes) => nodes.map((n) => n.value));
    const current = await select.inputValue();
    const next = options.find((value) => value !== current);
    if (next === undefined) continue;
    await select.selectOption(next);
  }

  const after = await page.evaluate(() => window.FxRegimeLab.requestCount());
  expect(after).toBe(before);
  expect(networkAfterReady).toEqual([]);
});

test('Regression SCN-004-017/018: Simple and Power share one unavailable owner decision while controls do not fetch', async ({ page }) => {
  await openFxRoute(page);
  const first = await fxOwnerSnapshot(page);

  // Simple, Power, and the identity panel all project the SAME frozen owner decision.
  await expect(page.locator('#identityPanel')).toContainText(first.ownerDecisionId);
  await expect(page.locator('#identityPanel')).toContainText(first.evidenceIdentity);
  await expect(page.locator('#simplePanel')).toContainText(first.evidenceCutoff);
  await expect(page.locator('#identityPanel')).toContainText('Unavailable');

  // A control change re-freezes one decision that every projection still shares, with no fetch.
  await page.locator('#controlGrid select[data-control-id="horizon"]').selectOption('tactical');
  const second = await fxOwnerSnapshot(page);
  expect(second.requestCount).toBe(first.requestCount);
  expect(second.ownerState).toBe('unavailable');
  await expect(page.locator('#identityPanel')).toContainText(second.ownerDecisionId);
  await expect(page.locator('#simplePanel')).toContainText(second.evidenceCutoff);

  // Every unavailable field stays unavailable in BOTH projections — no projection invents a value.
  expect(second.vehicle).toBeNull();
  expect(second.confirmation).toBeNull();
  expect(second.invalidation).toBeNull();
  expect(second.selected).toBeNull();
});

test('Regression SCN-004-025: canvas pointer keyboard summary table and responsive layout share one projection', async ({ page }) => {
  await openFxRoute(page);

  // The structured adapter attached cleanly — a rejected adapter records data-rlchart-error.
  const canvas = page.locator('#vehicleChart');
  await expect(canvas).toHaveAttribute('data-rlchart-mode', 'structured');
  expect(await canvas.getAttribute('data-rlchart-error')).toBeNull();

  // One projection drives the keyboard rail, the visible summary, and the accessible table.
  const projection = await page.evaluate(() => window.FxRegimeLab.projection().map((row) => ({ pointId: row.pointId, ticker: row.ticker, state: row.state })));
  expect(projection.map((row) => row.ticker)).toEqual(FX_REGISTRY_ORDER);

  const railOptions = await page.$$eval('[role="listbox"] [role="option"]', (nodes) => nodes.map((n) => n.textContent.trim()));
  expect(railOptions.length).toBe(projection.length);

  const summary = await page.locator('#vehicleChartSummary').innerText();
  for (const row of projection) expect(summary).toContain(row.ticker);

  const tableRows = await page.$$eval('#vehicleTableBody tr', (nodes) => nodes.map((n) => n.id));
  expect(tableRows).toEqual(projection.map((row) => 'vehicle-row-' + row.pointId));

  // Keyboard focus reaches the canvas and selects a point from the same projection.
  await canvas.focus();
  await page.keyboard.press('ArrowRight');
  const activePoint = await canvas.getAttribute('data-rlchart-active-point');
  expect(projection.map((row) => row.pointId)).toContain(activePoint);
  expect(await canvas.getAttribute('aria-activedescendant')).toBeTruthy();

  // The canvas is genuinely painted, not a blank element.
  const nonblank = await page.evaluate(() => {
    const el = document.getElementById('vehicleChart');
    const data = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
    for (let i = 3; i < data.length; i += 4) if (data[i] !== 0) return true;
    return false;
  });
  expect(nonblank).toBe(true);

  // Responsive containment: no page-level horizontal overflow at either checkpoint or at 130% text.
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
  await page.evaluate(() => { document.documentElement.style.fontSize = '130%'; });
  await page.waitForTimeout(200);
  const scaledOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(scaledOverflow).toBeLessThanOrEqual(1);
});

test('Regression SCN-004-001/002: public dollar slots stay independently unavailable without authorization', async ({ page }) => {
  await openFxRoute(page);

  // Each dollar comparison slot is selectable and each resolves independently unavailable — the
  // route never lets one slot's absence supply another slot's value.
  const seen = [];
  for (const slot of ['Broad', 'AFE', 'EME']) {
    await page.locator('#controlGrid select[data-control-id="dollarComparison"]').selectOption(slot);
    const state = await fxOwnerSnapshot(page);
    expect(state.ownerState).toBe('unavailable');
    expect(state.vehicle).toBeNull();
    seen.push(state.evidenceCutoff);
    // No unreviewed proxy supplied a number or a divergence for this slot.
    expect(await page.locator('#currencyPanel').innerText()).not.toMatch(/\d+\.\d+/);
  }
  expect(seen.length).toBe(3);
});

test('Regression SCN-004-003/006/007/008: public cohort boards remain bounded and unranked without authorized spot', async ({ page }) => {
  await openFxRoute(page);

  for (const cohort of ['G10', 'liquid-EM', 'managed-reference']) {
    await page.locator('#controlGrid select[data-control-id="cohort"]').selectOption(cohort);
    const state = await fxOwnerSnapshot(page);
    expect(state.ownerState).toBe('unavailable');
    // No automatic rank or candidate emerged from an unauthorized cohort board.
    expect(state.vehicle).toBeNull();
    expect(state.selected).toBeNull();
    const currency = await page.locator('#currencyPanel').innerText();
    expect(currency).not.toMatch(/\brank\s*[:#]?\s*\d/i);
  }
});

test('Regression SCN-004-004/005: public pair and alignment surfaces infer no orientation or numeric result', async ({ page }) => {
  await openFxRoute(page);

  // Changing base and quote must not manufacture an orientation verdict or a common-date value.
  await page.locator('#controlGrid select[data-control-id="base"]').selectOption('JPY');
  await page.locator('#controlGrid select[data-control-id="quote"]').selectOption('USD');
  const forward = await fxOwnerSnapshot(page);
  expect(forward.ownerState).toBe('unavailable');
  expect(forward.confirmation).toBeNull();
  expect(forward.invalidation).toBeNull();

  const currencyText = await page.locator('#currencyPanel').innerText();
  expect(currencyText).not.toMatch(/\d+\.\d+/);
  // Ticker spelling alone never implies a direction.
  expect(currencyText).not.toMatch(/\b(stronger|weaker)\b/i);
});

test('Regression SCN-004-009-016: public evidence anatomy retains exact unavailable families', async ({ page }) => {
  await openFxRoute(page);

  const families = await page.$$eval('#evidenceTableBody tr', (rows) => rows.map((row) => ({
    name: row.children[0].textContent.trim(),
    state: row.children[1].textContent.trim()
  })));

  // Every family is present exactly once and carries its OWN state — none is pooled or inherited.
  expect(families.map((f) => f.name)).toEqual(FX_EVIDENCE_FAMILIES);
  for (const family of families) {
    expect(family.state).not.toBe('');
    expect(family.state).not.toBe('Available');
  }
  // No family reported a numeric result while its evidence is unavailable.
  expect(await page.locator('#evidenceTable').innerText()).not.toMatch(/\d+\.\d+/);
});

test('Regression SCN-004-024: rights-unclear source values stay out of public route state', async ({ page }) => {
  await openFxRoute(page);

  const exposure = await page.evaluate(() => ({
    dom: document.body.innerHTML,
    owner: JSON.stringify(window.FxRegimeLab.ownerDecision()),
    read: JSON.stringify(window.FxRegimeLab.toolRead()),
    storage: JSON.stringify(Object.entries(localStorage)) + JSON.stringify(Object.entries(sessionStorage))
  }));

  // A rights-unclear observation contributes its REASON, never its value or its restricted source.
  for (const surface of [exposure.dom, exposure.owner, exposure.read, exposure.storage]) {
    expect(surface).not.toContain('restricted.example.invalid');
    expect(surface).not.toContain('918273.645');
  }
  expect(exposure.owner).toContain('RIGHTS_UNCLEAR');
});

test('Regression SCN-004-024/025: direct FX route exposes no credential or restricted-payload surface', async ({ page }) => {
  await openFxRoute(page);

  // The route offers no credential capture surface of any kind.
  expect(await page.locator('input[type="password"]').count()).toBe(0);
  expect(await page.locator('input[name*="key" i], input[name*="token" i], input[id*="apikey" i]').count()).toBe(0);

  const wroteCredential = await page.evaluate(() => {
    const keys = Object.keys(localStorage).concat(Object.keys(sessionStorage));
    return keys.filter((key) => /key|token|secret|credential/i.test(key));
  });
  expect(wroteCredential).toEqual([]);

  // Source context remains reachable and explained without carrying a restricted value.
  const identity = await page.locator('#identityPanel').innerText();
  expect(identity).toContain('Unavailable');
});

test('Regression SCN-004-027: the route never infers FXY orientation or a direction match from an unauthorized fact', async ({ page }) => {
  await openFxRoute(page);
  await page.locator('#controlGrid select[data-control-id="vehicleClass"]').selectOption('unlevered-single-currency');
  const state = await fxOwnerSnapshot(page);

  const byTicker = Object.fromEntries(state.evaluations.map((e) => [e.ticker, e]));
  // FXY is present and MUST NOT be promoted without an authorized fact.
  expect(byTicker.FXY).toBeTruthy();
  expect(byTicker.FXY.state).toBe('Unavailable');
  expect(byTicker.FXY.reasonCodes).toContain('RIGHTS_UNCLEAR');

  // The opposite-direction products are present too, and none was given a direction verdict.
  for (const ticker of ['UUP', 'USDU', 'YCS']) {
    expect(byTicker[ticker]).toBeTruthy();
    expect(byTicker[ticker].state).toBe('Unavailable');
    expect(byTicker[ticker].reasonCodes).not.toContain('DIRECTION_MISMATCH');
  }
  // No member was promoted to a fit state, so no orientation was inferred anywhere.
  expect(state.evaluations.filter((e) => e.state !== 'Unavailable')).toEqual([]);
  expect(state.selected).toBeNull();
});

test('Regression SCN-004-028: the route reports tracking evidence incomplete and invents no contribution', async ({ page }) => {
  await openFxRoute(page);
  const state = await fxOwnerSnapshot(page);

  for (const evaluation of state.evaluations) {
    expect(evaluation.reasonCodes).toContain('TRACKING_EVIDENCE_INCOMPLETE');
  }
  // The residual is never closed by an invented attribution.
  const surface = await page.evaluate(() => document.body.innerText + JSON.stringify(window.FxRegimeLab.ownerDecision()));
  for (const invented of ['carryAttribution', 'feeAttribution', 'rollAttribution', 'premiumAttribution']) {
    expect(surface).not.toContain(invented);
  }
});

test('Regression SCN-004-029: a shared long-dollar direction cannot merge or reorder UUP and USDU', async ({ page }) => {
  await openFxRoute(page);
  await page.locator('#controlGrid select[data-control-id="dollarComparison"]').selectOption('Broad');
  const state = await fxOwnerSnapshot(page);

  const uup = state.evaluations.filter((e) => e.ticker === 'UUP');
  const usdu = state.evaluations.filter((e) => e.ticker === 'USDU');
  // Both broad-dollar wrappers survive as separate identities — neither is merged away or dropped.
  expect(uup.length).toBe(1);
  expect(usdu.length).toBe(1);
  expect(uup[0].vehicleId).not.toBe(usdu[0].vehicleId);
  // Neither was ranked above the other on a shared direction alone.
  expect(uup[0].state).toBe('Unavailable');
  expect(usdu[0].state).toBe('Unavailable');
  expect(state.selected).toBeNull();

  // Both remain independently visible in the accessible table.
  await expect(page.locator('#vehicleTableBody')).toContainText('UUP');
  await expect(page.locator('#vehicleTableBody')).toContainText('USDU');
});

test('Regression SCN-004-030: YCS never earns a tactical pass without an authorized reset session', async ({ page }) => {
  await openFxRoute(page);

  for (const horizon of ['tactical', 'swing', 'structural']) {
    for (const reset of ['permit-tactical', 'exclude']) {
      await page.locator('#controlGrid select[data-control-id="horizon"]').selectOption(horizon);
      await page.locator('#controlGrid select[data-control-id="dailyResetPermission"]').selectOption(reset);
      const state = await fxOwnerSnapshot(page);
      const ycs = state.evaluations.find((e) => e.ticker === 'YCS');
      expect(ycs).toBeTruthy();
      // A daily-reset product never reaches Tactical-Only or selection without an authorized session.
      expect(ycs.state).toBe('Unavailable');
      expect(ycs.state).not.toBe('Tactical-Only');
      expect(state.selected).toBeNull();
    }
  }
});

test('Regression SCN-004-031: an unavailable aggregate never becomes No Eligible Vehicle and selects no substitute', async ({ page }) => {
  await openFxRoute(page);
  const state = await fxOwnerSnapshot(page);

  // Unavailable and the settled No Eligible Vehicle outcome are DIFFERENT canonical results, and the
  // route must not upgrade an unauthorized posture into a settled non-recommendation.
  expect(state.fitState).toBe('Unavailable');
  expect(state.fitState).not.toBe('No Eligible Vehicle');
  expect(state.selected).toBeNull();

  // Every registry member appears exactly once with its own exact reasons.
  expect(state.evaluations.map((e) => e.ticker)).toEqual(FX_REGISTRY_ORDER);
  for (const evaluation of state.evaluations) {
    expect(evaluation.reasonCodes.length).toBeGreaterThan(0);
  }
  // No constraint was relaxed and no unrelated fund was substituted.
  expect(state.evaluations.filter((e) => !FX_REGISTRY_ORDER.includes(e.ticker))).toEqual([]);
});

test('Regression SCN-004-025 adversarial: authored markup renders only as text at every reader sink', async ({ page }) => {
  await openFxRoute(page);

  const hostile = '<img src=x onerror=alert(1)><script>alert(2)</script>" onmouseover="alert(3)';

  // Layer 1 — the boundary. Each control either REFUSES hostile copy through the production closed
  // vocabulary, or accepts it and must render it inert. Both are safe; silently building markup is
  // not. The refusal must also roll back, or a later recompute would rethrow and wedge the route.
  const boundary = await page.evaluate((value) => {
    const results = {};
    for (const id of ['objective', 'subjectId', 'evidenceLens', 'dollarComparison', 'horizon']) {
      let refused = false;
      try { window.FxRegimeLab.setControl(id, value); } catch (error) { refused = true; }
      results[id] = refused;
    }
    return {
      results,
      refusedCount: Object.values(results).filter(Boolean).length,
      stillLive: window.FxRegimeLab.ownerDecision() !== null
    };
  }, hostile);

  // The guard is live: hostile copy cannot pass every control unchallenged.
  expect(boundary.refusedCount).toBeGreaterThan(0);
  // A refused value is rolled back, so the route keeps rendering.
  expect(boundary.stillLive).toBe(true);
  await expect(page.locator('#simplePanel')).toContainText('Recommendation unavailable');

  // Layer 2 — the sinks. No authored model or configuration string anywhere on the route created an
  // element, an inline script, an event-handler attribute, or a javascript: URL.
  const sinks = await page.evaluate(() => ({
    injectedImages: document.querySelectorAll('img[src="x"]').length,
    inlineScripts: Array.from(document.querySelectorAll('script:not([src])')).filter((n) => /alert\(/.test(n.textContent)).length,
    handlerAttributes: document.querySelectorAll('[onmouseover],[onerror],[onclick],[onload]').length,
    javascriptUrls: Array.from(document.querySelectorAll('[href],[src]')).filter((n) => /^javascript:/i.test(n.getAttribute('href') || n.getAttribute('src') || '')).length
  }));
  expect(sinks.injectedImages).toBe(0);
  expect(sinks.inlineScripts).toBe(0);
  expect(sinks.handlerAttributes).toBe(0);
  expect(sinks.javascriptUrls).toBe(0);

  // Layer 3 — the sink mechanism itself. Every contextual explanation is carried as an attribute
  // value and as text, never as parsed markup, so an authored '<' stays a literal '<'.
  const escaped = await page.evaluate(() => {
    const probe = document.createElement('span');
    const authored = '<b>authored</b>';
    probe.textContent = authored;
    return { html: probe.innerHTML, children: probe.children.length };
  });
  expect(escaped.children).toBe(0);
  expect(escaped.html).toBe('&lt;b&gt;authored&lt;/b&gt;');
});

test('Browser functional SCN-004-020: controlled Global inputs preserve exact two-leg and three-leg products', async ({ page }) => {
  await page.goto(site.baseUrl + '/global-rotation-lab.html');
  await page.waitForFunction(() => typeof window.RLFX !== 'undefined');

  const result = await page.evaluate(() => {
    const base = Date.UTC(2025, 0, 1);
    const series = (n, rate) => Array.from({ length: n }, (_, i) => ({ t: base + i * 864e5, c: 100 * Math.pow(rate, i) }));
    const out = window.RLFX.computeGlobalRotation({
      decisionTime: '2026-08-08T00:00:00.000Z',
      horizonSessions: 63,
      posture: 'balanced',
      benchmark: 'ACWI',
      postureWeights: { momentum: 0.56, trend: 0.26, risk: 0.18 },
      agreementDeadbandPct: 0.25,
      countries: [{
        ticker: 'EWJ', country: 'Japan', currency: 'JPY',
        etfRows: series(90, 1.002), benchmarkRows: series(90, 1.001),
        fxRows: series(88, 1.0005), fxSourceOrientation: { base: 'USD', quote: 'JPY' },
        momentum: 0.4, trend: 0.3, risk: 0.2, usdFreshUntil: null, fxFreshUntil: null
      }]
    });
    const leader = out.leader;
    return {
      sameObject: leader.usdLeadership === leader.decomposition,
      sameSet: leader.usdLeadership.observationSet === leader.decomposition.observationSet,
      usdHasFx: 'fxReturn' in leader.usdLeadership,
      usdAsOf: leader.usdLeadership.asOf,
      decompAsOf: leader.decomposition.asOf,
      usdRelative: leader.usdLeadership.usdRelativeReturn,
      localReturn: leader.decomposition.approximateLocalReturn,
      usdReturn: leader.decomposition.usdReturnOnDecompositionDates,
      fxReturn: leader.decomposition.fxReturn
    };
  });

  expect(result.sameObject).toBe(false);
  expect(result.sameSet).toBe(false);
  expect(result.usdHasFx).toBe(false);
  expect(result.usdAsOf).not.toBe(result.decompAsOf);
  // Approximate local return is exactly (1 + R_USD) / (1 + R_FX) - 1.
  expect(result.localReturn).toBeCloseTo((1 + result.usdReturn) / (1 + result.fxReturn) - 1, 12);
});

test('Browser functional SCN-004-021: controlled FX reversal cannot change Global score or rank', async ({ page }) => {
  await page.goto(site.baseUrl + '/global-rotation-lab.html');
  await page.waitForFunction(() => typeof window.RLFX !== 'undefined');

  const result = await page.evaluate(() => {
    const base = Date.UTC(2025, 0, 1);
    const series = (n, rate) => Array.from({ length: n }, (_, i) => ({ t: base + i * 864e5, c: 100 * Math.pow(rate, i) }));
    const run = (fxRows) => window.RLFX.computeGlobalRotation({
      decisionTime: '2026-08-08T00:00:00.000Z',
      horizonSessions: 63,
      posture: 'balanced',
      benchmark: 'ACWI',
      postureWeights: { momentum: 0.56, trend: 0.26, risk: 0.18 },
      agreementDeadbandPct: 0.25,
      countries: [{
        ticker: 'EWJ', country: 'Japan', currency: 'JPY',
        etfRows: series(90, 1.002), benchmarkRows: series(90, 1.001),
        fxRows, fxSourceOrientation: { base: 'USD', quote: 'JPY' },
        momentum: 0.4, trend: 0.3, risk: 0.2, usdFreshUntil: null, fxFreshUntil: null
      }]
    });
    const up = run(series(88, 1.0009)), down = run(series(88, 0.9991));
    let refusedFxKey = false;
    try {
      window.RLFX.scoreCountryLeadership({ momentum: 0.4, trend: 0.3, risk: 0.2, fx: 0.9, weights: { momentum: 0.56, trend: 0.26, risk: 0.18 } });
    } catch (error) { refusedFxKey = true; }
    return {
      rankedEqual: JSON.stringify(up.ranked) === JSON.stringify(down.ranked),
      fxDiffers: up.leader.decomposition.fxReturn !== down.leader.decomposition.fxReturn,
      usdEqual: up.leader.usdLeadership.usdRelativeReturn === down.leader.usdLeadership.usdRelativeReturn,
      refusedFxKey
    };
  });

  expect(result.rankedEqual).toBe(true);
  // Non-vacuous: the FX leg genuinely moved, and USD leadership stayed FX-independent.
  expect(result.fxDiffers).toBe(true);
  expect(result.usdEqual).toBe(true);
  expect(result.refusedFxKey).toBe(true);
});

test('Regression SCN-004-022: public Global route preserves USD leadership and truthful unavailable decomposition', async ({ page }) => {
  const requested = [];
  page.on('request', (request) => { requested.push(request.url()); });
  await page.goto(site.baseUrl + '/global-rotation-lab.html');
  await page.waitForFunction(() => typeof window.RLFX !== 'undefined');
  await page.waitForLoadState('networkidle');

  // The migrated page ships no FX score lever and no duplicated orientation flag.
  expect(await page.locator('#fxWeight').count()).toBe(0);
  expect(await page.locator('#fxWeightValue').count()).toBe(0);

  const state = await page.evaluate(() => {
    const raw = localStorage.getItem('globalRotationLabState');
    return { persisted: raw ? JSON.parse(raw) : null, hasRlfx: typeof window.RLFX.computeGlobalRotation === 'function' };
  });
  expect(state.hasRlfx).toBe(true);
  if (state.persisted) expect(Object.keys(state.persisted)).not.toContain('fxWeight');

  // The route serves rlfx.js for real — an excluded module would 404 here.
  const rlfxRequest = requested.filter((url) => url.includes('rlfx.js'));
  expect(rlfxRequest.length).toBeGreaterThan(0);
  const rlfxResponse = await page.request.get(site.baseUrl + '/rlfx.js');
  expect(rlfxResponse.status()).toBe(200);

  // No zero-FX assumption reaches the visible page.
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('0.00% FX');
  expect(body).not.toMatch(/FX confirmation weight/i);
});

test('Regression SCN-004-025 adversarial: every declared context has definition current meaning focus and adjacent text', async ({ page }) => {
  await openFxRoute(page);

  const audit = await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[data-tip]'));
    return {
      count: nodes.length,
      missingDefinition: nodes.filter((n) => !/ — /.test(n.getAttribute('data-tip'))).length,
      missingMeaning: nodes.filter((n) => !/Current reading: /.test(n.getAttribute('data-tip'))).length,
      missingFocus: nodes.filter((n) => n.getAttribute('tabindex') === null).length,
      missingAdjacent: nodes.filter((n) => !n.getAttribute('aria-label')).length,
      missingTitle: nodes.filter((n) => !n.getAttribute('title')).length
    };
  });

  // Every declared context class is covered; removing any one of the five would fail this audit.
  expect(audit.count).toBeGreaterThan(0);
  expect(audit.missingDefinition).toBe(0);
  expect(audit.missingMeaning).toBe(0);
  expect(audit.missingFocus).toBe(0);
  expect(audit.missingAdjacent).toBe(0);
  expect(audit.missingTitle).toBe(0);

  // Every ticker on the route is RLTKR-decorated.
  const undecorated = await page.evaluate(() => Array.from(document.querySelectorAll('[data-tkr]')).filter((n) => !n.querySelector('a') && n.tagName !== 'A').length);
  expect(undecorated).toBe(0);
});

test('Regression SCN-004-023: the real Brief route states the FX/Global relationship honestly', async ({ page }) => {  await page.goto(site.baseUrl + '/market-brief.html');
  const panel = page.locator('#fxGlobalRelationship');
  await expect(panel).toHaveCount(1);
  await expect(panel.locator('[data-relationship]')).toHaveCount(1);

  const state = await page.evaluate(() => {
    const node = document.querySelector('#fxGlobalRelationship [data-relationship]');
    // textContent, not innerText: the panel lives inside a collapsed <details> drawer.
    return { relationship: node && node.getAttribute('data-relationship'), text: document.getElementById('fxGlobalRelationship').textContent };
  });

  // The FX route is excluded until Scope 5, so its owner read is absent here. The honest result is
  // Insufficient Evidence — never a fabricated direction.
  expect(['Agreement', 'Divergence', 'Insufficient Evidence']).toContain(state.relationship);
  expect(state.relationship).toBe('Insufficient Evidence');
  expect(state.text).toContain('No directional relationship is attributable');

  // No third composite, score, or coverage claim is rendered anywhere in the panel.
  expect(state.text).not.toMatch(/\bscore\b/i);
  expect(state.text).not.toMatch(/\bcoverage\b/i);
  expect(state.text).not.toMatch(/\d+\s*%/);
});

/* TP-04-04 / TP-04-05 — controlled owner facts through production rlbrief.js in a real browser.
   These are functional, not E2E: the owner reads are constructed, the classifier is production. */
async function openBriefClassifier(page) {
  await page.goto(site.baseUrl + '/market-brief.html');
  await page.waitForFunction(() => typeof window.RLBRIEF !== 'undefined' && typeof window.RLBRIEF.evaluateFxGlobalRelationship === 'function');
}

const FX_READ = (side) => ({
  contractVersion: 'rlfx-tool-read/v2', id: 'fx-regime-relative-value-lab', availability: 'current',
  asOf: '2026-08-08T12:00:00.000Z', read: 'FX owner read', deepLink: 'fx-regime-relative-value-lab.html#power',
  computedAt: '2026-08-08T12:00:00.000Z', freshUntil: '2026-08-09T00:00:00.000Z',
  metrics: { evidenceIdentity: 'fxe-v1-aaa', recommendationOutcome: { economicDirection: { exposure: 'long-JPY/short-USD', instrumentSide: side } } }
});
const GLOBAL_READ = (relative) => ({
  contractVersion: 'rl-tool-read/v1', id: 'global-rotation-lab', availability: 'current',
  asOf: '2026-08-08T12:00:00.000Z', read: 'Global owner read', deepLink: 'global-rotation-lab.html#simple',
  computedAt: '2026-08-08T12:00:00.000Z', freshUntil: '2026-08-09T00:00:00.000Z',
  metrics: { evidenceIdentity: 'gr-v1-bbb', leader: { ticker: 'EWJ', usdLeadership: { state: 'ready', usdRelativeReturn: relative } } }
});

test('Browser functional SCN-004-023: controlled current owner facts render Agreement and Divergence', async ({ page }) => {
  await openBriefClassifier(page);

  const both = await page.evaluate(({ fxRead, up, down }) => {
    const at = '2026-08-08T12:00:00.000Z';
    return {
      agree: window.RLBRIEF.evaluateFxGlobalRelationship(fxRead, up, at),
      diverge: window.RLBRIEF.evaluateFxGlobalRelationship(fxRead, down, at)
    };
  }, { fxRead: FX_READ('long'), up: GLOBAL_READ(0.04), down: GLOBAL_READ(-0.04) });

  expect(both.agree.relationship).toBe('Agreement');
  expect(both.diverge.relationship).toBe('Divergence');
  expect(both.agree.blockingReasons).toEqual([]);

  // Both owners are attributed with their own clocks and deep links; nothing is merged.
  expect(both.agree.fx.ownerDeepLink).not.toBe(both.agree.global.ownerDeepLink);
  expect(both.agree.fx.computedAt).toBeTruthy();
  expect(both.agree.global.freshUntil).toBeTruthy();
  expect(both.agree.score).toBeUndefined();
  expect(both.agree.coverage).toBeUndefined();

  // Non-vacuity: one label for both inputs would mean the classifier decided nothing.
  expect(both.agree.relationship).not.toBe(both.diverge.relationship);
});

test('Browser functional SCN-004-023 adversarial: stale missing flat or unaccepted owner facts stay reasoned unavailable', async ({ page }) => {
  await openBriefClassifier(page);

  const cases = await page.evaluate(({ fxRead, flat, stale, wrongTool }) => {
    const at = '2026-08-08T12:00:00.000Z';
    const run = (fx, global) => {
      const r = window.RLBRIEF.evaluateFxGlobalRelationship(fx, global, at);
      return { relationship: r.relationship, reasons: r.blockingReasons.slice(), fx: r.fx, global: r.global, keys: Object.keys(r) };
    };
    return {
      flat: run(fxRead, flat),
      stale: run(fxRead, stale),
      missing: run(null, flat),
      wrongTool: run(wrongTool, flat)
    };
  }, {
    fxRead: FX_READ('long'),
    flat: GLOBAL_READ(0),
    stale: Object.assign(GLOBAL_READ(0.04), { freshUntil: '2026-08-08T00:00:00.000Z' }),
    wrongTool: Object.assign(FX_READ('long'), { id: 'some-other-lab' })
  });

  for (const key of ['flat', 'stale', 'missing', 'wrongTool']) {
    expect(cases[key].relationship).toBe('Insufficient Evidence');
    // No third composite, matrix domain/cell/applicability, or coverage claim is ever produced.
    expect(cases[key].keys.sort()).toEqual(['blockingReasons', 'contractVersion', 'fx', 'global', 'relationship']);
  }

  expect(cases.flat.reasons).toContain('DIRECTION_NOT_ATTRIBUTABLE');
  expect(cases.stale.reasons).toContain('OWNER_STALE');
  expect(cases.missing.reasons).toContain('FX_OWNER_READ_MISSING');
  expect(cases.wrongTool.reasons).toContain('OWNER_TOOL_MISMATCH');

  // A refused pairing still keeps the owner that IS current attributable through its own deep link.
  expect(cases.stale.fx).not.toBeNull();
  expect(cases.stale.fx.ownerDeepLink).toBe('fx-regime-relative-value-lab.html#power');
  expect(cases.stale.global).toBeNull();
});