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