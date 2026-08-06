import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

import { recommendationRowsFromOutcome } from '../scripts/recommendation-body.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const require = createRequire(import.meta.url);
const RLFX = require(resolve(ROOT, 'rlfx.js'));
const universe = JSON.parse(readFileSync(resolve(ROOT, 'fx-vehicle-universe.json'), 'utf8'));
const currencyDecisionSeed = JSON.parse(readFileSync(resolve(ROOT, 'tests/fixtures/fx-regime/commonjs-determinism-input.json'), 'utf8'));
const expectedTickers = ['FXY', 'FXE', 'UUP', 'UDN', 'USDU', 'CEW', 'YCS'];

function clone(value) {
  return structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freezeDeep);
  return Object.freeze(value);
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  Object.values(value).forEach(assertDeepFrozen);
}

function approvedContext(observation, decisionTime = '2026-08-03T12:00:00.000Z') {
  const contextUniverse = clone(universe);
  const policy = contextUniverse.sourcePolicies.find((entry) => entry.policyId === observation.sourcePolicyId);
  policy.activation = 'approved';
  policy.sourceUsePolicyId = `reviewed-use:${policy.policyId}`;
  policy.sourceUseReviewRef = `reviewed-source:${policy.policyId}`;
  policy.rights = 'reference-only';
  policy.retention = 'normalized-facts-and-hash';
  policy.reviewWindow = {
    mode: 'max-age',
    observedMaxAgeMs: 604800000,
    retrievalMaxAgeMs: 259200000
  };
  return { universe: contextUniverse, decisionTime, payloadKind: 'normalized-structural-fact' };
}

function scalarObservation(base, overrides = {}) {
  return {
    contractVersion: 'rlfx-vehicle-observation/v1',
    observationId: base.observationId,
    vehicleId: base.vehicleId,
    ticker: base.ticker,
    factKind: base.factKind,
    sourcePolicyId: base.sourcePolicyId,
    source: clone(base.source),
    observedAsOf: '2026-08-01T00:00:00.000Z',
    retrievedAt: '2026-08-01T01:00:00.000Z',
    expectedCadence: 'event-driven',
    reviewWindow: {
      mode: 'max-age',
      observedMaxAgeMs: 604800000,
      retrievalMaxAgeMs: 259200000
    },
    freshUntil: '2026-08-04T01:00:00.000Z',
    rights: 'reference-only',
    quality: 'issuer-declared',
    revisionId: 'source-review-v1',
    limitations: ['Reference-only structural fact; not a current market observation.'],
    kind: 'scalar',
    availability: 'fresh',
    value: 'reviewed-value',
    unit: 'classification',
    ...overrides
  };
}

function trackingSeriesObservation(factKind, returnBasis) {
  return {
    contractVersion: 'rlfx-vehicle-observation/v1',
    observationId: `tracking:FXY:${factKind}`,
    vehicleId: 'vehicle:FXY',
    ticker: 'FXY',
    factKind,
    sourcePolicyId: 'tracking-source:controlled-v1',
    source: { id: 'tracking-source-controlled', class: 'approved-public-market', url: null },
    observedAsOf: '2026-08-03T00:00:00.000Z',
    retrievedAt: '2026-08-03T01:00:00.000Z',
    expectedCadence: 'daily',
    reviewWindow: {
      mode: 'max-age',
      observedMaxAgeMs: 172800000,
      retrievalMaxAgeMs: 172800000
    },
    freshUntil: '2026-08-05T00:00:00.000Z',
    rights: 'reference-only',
    quality: 'approved-public-derived',
    revisionId: 'tracking-fixture-v1',
    limitations: ['Controlled exact-date tracking fixture; no market fact is asserted.'],
    kind: 'series',
    availability: 'fresh',
    series: {
      seriesId: `tracking-series:FXY:${factKind}`,
      returnBasis,
      adjustment: 'raw-close',
      currency: 'USD'
    },
    unit: 'index-level'
  };
}

function unavailableTrackingObservation(factKind, reason) {
  const observation = trackingSeriesObservation(factKind, factKind === 'nav' ? 'nav-per-share' : 'market-price');
  delete observation.series;
  delete observation.unit;
  observation.observedAsOf = null;
  observation.retrievedAt = null;
  observation.expectedCadence = null;
  observation.reviewWindow = null;
  observation.freshUntil = null;
  observation.quality = null;
  observation.revisionId = null;
  observation.kind = 'unavailable';
  observation.availability = 'unavailable';
  observation.unavailableReason = reason;
  observation.availabilityDetail = 'Controlled unavailable tracking leg.';
  return observation;
}

function trackingRows(points) {
  return points.map(([date, close]) => ({ t: Date.parse(`${date}T20:00:00.000Z`), c: close }));
}

function trackingContext(factKind, availability) {
  return {
    contractVersion: 'rlfx-vehicle-observation/v1',
    observationId: `tracking:FXY:context:${factKind}`,
    vehicleId: 'vehicle:FXY',
    ticker: 'FXY',
    factKind,
    sourcePolicyId: 'tracking-source:controlled-v1',
    source: { id: 'tracking-source-controlled', class: 'approved-public-market', url: null },
    observedAsOf: '2026-08-03T00:00:00.000Z',
    retrievedAt: '2026-08-03T01:00:00.000Z',
    expectedCadence: 'daily',
    reviewWindow: {
      mode: 'max-age',
      observedMaxAgeMs: 172800000,
      retrievalMaxAgeMs: 172800000
    },
    freshUntil: '2026-08-05T00:00:00.000Z',
    rights: 'reference-only',
    quality: 'approved-public-derived',
    revisionId: 'tracking-fixture-v1',
    limitations: ['Context is displayed only and is not allocated into tracking residuals.'],
    kind: 'scalar',
    availability,
    value: 0.4,
    unit: 'percent'
  };
}

function trackingInput() {
  return {
    decisionTime: '2026-08-03T12:00:00.000Z',
    vehicleId: 'vehicle:FXY',
    ticker: 'FXY',
    horizon: 'swing',
    horizonSessions: 2,
    market: {
      observation: trackingSeriesObservation('market-price', 'market-price'),
      rows: trackingRows([
        ['2026-07-01', 100], ['2026-07-02', 101], ['2026-07-03', 102], ['2026-07-04', 104]
      ])
    },
    nav: {
      observation: trackingSeriesObservation('nav', 'nav-per-share'),
      rows: trackingRows([
        ['2026-07-01', 100], ['2026-07-02', 100.5], ['2026-07-03', 101.5], ['2026-07-04', 103], ['2026-07-05', 104]
      ])
    },
    underlying: {
      observation: trackingSeriesObservation('underlying-level', 'benchmark-index'),
      rows: trackingRows([
        ['2026-07-01', 100], ['2026-07-02', 100.8], ['2026-07-03', 101.2], ['2026-07-04', 102]
      ])
    },
    contexts: [trackingContext('expense', 'fresh'), trackingContext('premium-discount', 'revised')]
  };
}

test('Feature 004 vehicle universe validates seven closed identities without changing v1 exports', () => {
  assert.equal(typeof RLFX.validateVehicleUniverse, 'function');
  assert.equal(typeof RLFX.normalizeVehicleObservation, 'function');
  assert.equal(typeof RLFX.validateUniverse, 'function');
  assert.equal(typeof RLFX.computeCurrencyDecision, 'function');

  const result = RLFX.validateVehicleUniverse(universe);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.value.vehicles.map((vehicle) => vehicle.ticker), expectedTickers);
  assert.equal(new Set(result.value.vehicles.map((vehicle) => vehicle.vehicleId)).size, 7);
  assert.ok(result.value.observations.every((observation) => observation.kind === 'unavailable'));
  assert.ok(result.value.observations.every((observation) => !Object.hasOwn(observation, 'value') && !Object.hasOwn(observation, 'series')));
  assert.equal(result.value.policies.trackingPolicies[0].contractVersion, 'rlfx-vehicle-tracking-policy/v1');
  assert.equal(result.value.policies.fitPolicies[0].contractVersion, 'rlfx-vehicle-fit-policy/v1');
  assert.equal(result.value.policies.liquidityPolicies[0].contractVersion, 'rlfx-vehicle-liquidity-policy/v1');
  assert.equal(result.value.policies.costPolicies[0].contractVersion, 'rlfx-vehicle-cost-policy/v1');
  assert.ok([
    result.value.policies.trackingPolicies[0].minimumCommonDateCount,
    result.value.policies.trackingPolicies[0].maximumAbsoluteUnexplainedResidual,
    result.value.policies.fitPolicies[0].activeStatusMaximumAgeMs,
    ...result.value.policies.liquidityPolicies[0].criteria.map((criterion) => criterion.threshold),
    ...result.value.policies.costPolicies[0].criteria.map((criterion) => criterion.threshold)
  ].every(Number.isFinite));

  const withUnknownKey = clone(universe);
  withUnknownKey.unreviewedCategoryImport = [];
  const unknownResult = RLFX.validateVehicleUniverse(withUnknownKey);
  assert.equal(unknownResult.ok, false);
  assert.equal(unknownResult.errors[0].code, 'RLFX_VEHICLE_UNIVERSE_INVALID');

  const missingFact = clone(universe);
  missingFact.observations = missingFact.observations.filter((observation) => observation.observationId !== missingFact.vehicles[0].factRefs.activeStatus);
  const missingResult = RLFX.validateVehicleUniverse(missingFact);
  assert.equal(missingResult.ok, false);
  assert.equal(missingResult.errors[0].code, 'RLFX_VEHICLE_UNIVERSE_INVALID');

  const missingPolicy = clone(universe);
  missingPolicy.policies.trackingPolicies = [];
  const missingPolicyResult = RLFX.validateVehicleUniverse(missingPolicy);
  assert.equal(missingPolicyResult.ok, false);
  assert.equal(missingPolicyResult.errors[0].code, 'RLFX_VEHICLE_UNIVERSE_INVALID');

  const reorderedCriteria = clone(universe);
  reorderedCriteria.policies.fitPolicies[0].criterionOrder.reverse();
  const reorderedResult = RLFX.validateVehicleUniverse(reorderedCriteria);
  assert.equal(reorderedResult.ok, false);
  assert.equal(reorderedResult.errors[0].code, 'RLFX_VEHICLE_UNIVERSE_INVALID');

  const nonFinitePolicy = clone(universe);
  nonFinitePolicy.policies.liquidityPolicies[0].criteria[0].threshold = Number.POSITIVE_INFINITY;
  const nonFiniteResult = RLFX.validateVehicleUniverse(nonFinitePolicy);
  assert.equal(nonFiniteResult.ok, false);
  assert.equal(nonFiniteResult.errors[0].code, 'RLFX_VEHICLE_UNIVERSE_INVALID');
});

test('Feature 004 vehicle observations fail closed on rights, clocks, active status, and non-finite values', () => {
  const base = universe.observations.find((observation) => observation.vehicleId === 'vehicle:FXY' && observation.factKind === 'objective');
  assert.ok(base);

  const unavailable = RLFX.normalizeVehicleObservation(base, { universe, decisionTime: '2026-08-03T12:00:00.000Z', payloadKind: 'normalized-structural-fact' });
  assert.equal(unavailable.kind, 'unavailable');
  assert.equal(unavailable.availability, 'unavailable');
  assert.equal(unavailable.unavailableReason, 'RIGHTS_UNCLEAR');
  assert.equal(unavailable.source.url, null);
  assert.equal(Object.hasOwn(unavailable, 'value'), false);
  assert.equal(Object.hasOwn(unavailable, 'series'), false);

  const freshInput = scalarObservation(base);
  const fresh = RLFX.normalizeVehicleObservation(freshInput, approvedContext(base));
  assert.equal(fresh.kind, 'scalar');
  assert.equal(fresh.availability, 'fresh');
  assert.equal(fresh.freshUntil, '2026-08-04T01:00:00.000Z');
  assert.equal(fresh.observedAsOf, freshInput.observedAsOf);
  assert.equal(fresh.retrievedAt, freshInput.retrievedAt);

  const stale = RLFX.normalizeVehicleObservation(freshInput, approvedContext(base, '2026-08-05T00:00:00.000Z'));
  assert.equal(stale.kind, 'scalar');
  assert.equal(stale.availability, 'stale');
  assert.equal(stale.value, 'reviewed-value');

  const malformedClock = RLFX.normalizeVehicleObservation(
    scalarObservation(base, { retrievedAt: 'not-an-instant' }),
    approvedContext(base)
  );
  assert.equal(malformedClock.kind, 'unavailable');
  assert.equal(malformedClock.unavailableReason, 'SOURCE_ERROR');
  assert.equal(malformedClock.observedAsOf, '2026-08-01T00:00:00.000Z');
  assert.equal(malformedClock.retrievedAt, null);
  assert.equal(Object.hasOwn(malformedClock, 'value'), false);

  const restricted = RLFX.normalizeVehicleObservation(
    scalarObservation(base, { rights: 'restricted', value: 'must-not-survive' }),
    approvedContext(base)
  );
  assert.equal(restricted.kind, 'unavailable');
  assert.equal(restricted.unavailableReason, 'RIGHTS_UNCLEAR');
  assert.equal(restricted.source.url, null);
  assert.equal(Object.hasOwn(restricted, 'value'), false);

  const nonFinite = RLFX.normalizeVehicleObservation(
    scalarObservation(base, { value: Number.POSITIVE_INFINITY, unit: 'ratio' }),
    approvedContext(base)
  );
  assert.equal(nonFinite.kind, 'unavailable');
  assert.equal(nonFinite.unavailableReason, 'SOURCE_ERROR');
  assert.equal(Object.hasOwn(nonFinite, 'value'), false);

  const activeBase = universe.observations.find((observation) => observation.vehicleId === 'vehicle:FXY' && observation.factKind === 'active-status');
  const unknownActiveStatus = RLFX.normalizeVehicleObservation(
    scalarObservation(activeBase, { value: 'unknown' }),
    approvedContext(activeBase)
  );
  assert.equal(unknownActiveStatus.kind, 'unavailable');
  assert.equal(unknownActiveStatus.unavailableReason, 'SOURCE_ERROR');
  assert.equal(Object.hasOwn(unknownActiveStatus, 'value'), false);
});

test('RLFX vehicle tracking preserves market NAV underlying and unexplained residual', () => {
  assert.equal(typeof RLFX.computeVehicleTrackingRead, 'function');

  const input = trackingInput();
  const read = RLFX.computeVehicleTrackingRead(input);
  const repeated = RLFX.computeVehicleTrackingRead(clone(input));

  assert.deepEqual(repeated, read);
  assert.equal(Object.isFrozen(read), true);
  assert.equal(Object.isFrozen(read.observationSet), true);
  assert.equal(read.contractVersion, 'rlfx-vehicle-tracking-read/v1');
  assert.equal(read.vehicleId, 'vehicle:FXY');
  assert.equal(read.ticker, 'FXY');
  assert.equal(read.horizon, 'swing');
  assert.equal(read.state, 'Tracking');
  assert.equal(read.unavailableReason, null);
  assert.deepEqual(read.observationSet.alignedRows.map((row) => row.date), ['2026-07-02', '2026-07-03', '2026-07-04']);
  assert.equal(read.observationSet.coverage.commonRowCount, 4);
  assert.deepEqual(read.observationSet.coverage.unmatchedNewerDates, {
    market: [],
    nav: ['2026-07-05'],
    underlying: []
  });
  assert.deepEqual(read.returnBasis, {
    market: 'market-price',
    nav: 'nav-per-share',
    underlying: 'benchmark-index'
  });

  const expectedMarketReturn = 104 / 101 - 1;
  const expectedNavReturn = 103 / 100.5 - 1;
  const expectedUnderlyingReturn = 102 / 100.8 - 1;
  assert.equal(read.returns.market, expectedMarketReturn);
  assert.equal(read.returns.nav, expectedNavReturn);
  assert.equal(read.returns.underlying, expectedUnderlyingReturn);
  assert.equal(read.observedDifferences.marketMinusNav, expectedMarketReturn - expectedNavReturn);
  assert.equal(read.observedDifferences.navMinusUnderlying, expectedNavReturn - expectedUnderlyingReturn);
  assert.equal(read.observedDifferences.marketMinusUnderlying, expectedMarketReturn - expectedUnderlyingReturn);
  assert.deepEqual(read.unexplainedResidual, {
    basis: 'nav-minus-underlying',
    value: expectedNavReturn - expectedUnderlyingReturn
  });
  assert.deepEqual(read.sourcedContexts, [
    { factKind: 'expense', observationId: 'tracking:FXY:context:expense', state: 'fresh' },
    { factKind: 'premium-discount', observationId: 'tracking:FXY:context:premium-discount', state: 'revised' }
  ]);
  assert.equal(read.evidenceCutoff, '2026-08-03T00:00:00.000Z');
  assert.equal(read.freshUntil, '2026-08-05T00:00:00.000Z');
  assert.deepEqual(Object.keys(read).sort(), [
    'contractVersion', 'evidenceCutoff', 'freshUntil', 'horizon', 'limitations',
    'observationSet', 'observedDifferences', 'returnBasis', 'returns', 'sourcedContexts',
    'state', 'ticker', 'trackingReadId', 'unavailableReason', 'unexplainedResidual', 'vehicleId'
  ].sort());

  const mismatchedBasis = trackingInput();
  mismatchedBasis.underlying.observation.series.returnBasis = 'total-return-index';
  const mismatchedRead = RLFX.computeVehicleTrackingRead(mismatchedBasis);
  assert.equal(mismatchedRead.state, 'Unavailable');
  assert.equal(mismatchedRead.unavailableReason, 'RETURN_BASIS_MISMATCH');
  assert.deepEqual(mismatchedRead.returns, { market: null, nav: null, underlying: null });
  assert.equal(mismatchedRead.unexplainedResidual, null);

  const missingLeg = trackingInput();
  missingLeg.nav = null;
  const missingRead = RLFX.computeVehicleTrackingRead(missingLeg);
  assert.equal(missingRead.state, 'Indeterminate');
  assert.equal(missingRead.unavailableReason, 'TRACKING_EVIDENCE_INCOMPLETE');
  assert.equal(missingRead.returnBasis.nav, null);
  assert.deepEqual(missingRead.observedDifferences, {
    marketMinusNav: null,
    navMinusUnderlying: null,
    marketMinusUnderlying: null
  });
  assert.equal(missingRead.unexplainedResidual, null);
  assert.ok(missingRead.limitations.every((limitation) => !/attributed|allocated/i.test(limitation)));
});

test('Feature 004 vehicle tracking fails closed and retains observed direction reversal', () => {
  const staleLeg = trackingInput();
  staleLeg.market.observation.availability = 'stale';
  const staleRead = RLFX.computeVehicleTrackingRead(staleLeg);
  assert.equal(staleRead.state, 'Unavailable');
  assert.equal(staleRead.unavailableReason, 'REQUIRED_FACT_STALE');

  const unavailableLeg = trackingInput();
  unavailableLeg.nav.observation = unavailableTrackingObservation('nav', 'NO_SOURCE');
  const unavailableRead = RLFX.computeVehicleTrackingRead(unavailableLeg);
  assert.equal(unavailableRead.state, 'Unavailable');
  assert.equal(unavailableRead.unavailableReason, 'NO_SOURCE');

  const insufficient = trackingInput();
  insufficient.underlying.rows = trackingRows([['2026-07-04', 102]]);
  const insufficientRead = RLFX.computeVehicleTrackingRead(insufficient);
  assert.equal(insufficientRead.state, 'Indeterminate');
  assert.equal(insufficientRead.unavailableReason, 'INSUFFICIENT_HISTORY');
  assert.equal(insufficientRead.observationSet.state, 'insufficient');
  assert.equal(insufficientRead.observationSet.coverage.commonRowCount, 1);
  assert.deepEqual(insufficientRead.returns, { market: null, nav: null, underlying: null });

  const reversal = trackingInput();
  reversal.underlying.rows = trackingRows([
    ['2026-07-01', 103], ['2026-07-02', 102], ['2026-07-03', 101], ['2026-07-04', 100]
  ]);
  const reversalRead = RLFX.computeVehicleTrackingRead(reversal);
  assert.equal(reversalRead.state, 'Diverging');
  assert.equal(reversalRead.unavailableReason, null);
  assert.ok(reversalRead.returns.market > 0);
  assert.ok(reversalRead.returns.nav > 0);
  assert.ok(reversalRead.returns.underlying < 0);
  assert.equal(reversalRead.unexplainedResidual.value, reversalRead.observedDifferences.navMinusUnderlying);
});

const fitFactValues = {
  FXY: {
    issuer: 'controlled-issuer-fxy', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'foreign-currency-strength', direction: 'long-JPY/short-USD', 'currency-or-basket': 'JPY',
    benchmark: 'controlled-jpy-reference', 'exposure-mechanism': 'currency-deposit',
    'legal-structure': 'single-currency-trust', leverage: 'unlevered', 'reset-policy': 'none',
    expense: 0.005, 'tax-form-class': 'grantor-trust'
  },
  FXE: {
    issuer: 'controlled-issuer-fxe', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'foreign-currency-strength', direction: 'long-EUR/short-USD', 'currency-or-basket': 'EUR',
    benchmark: 'controlled-eur-reference', 'exposure-mechanism': 'currency-deposit',
    'legal-structure': 'single-currency-trust', leverage: 'unlevered', 'reset-policy': 'none',
    expense: 0.005, 'tax-form-class': 'grantor-trust'
  },
  UUP: {
    issuer: 'controlled-issuer-uup', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'dollar-strength', direction: 'long-USD', 'currency-or-basket': 'USDX-six-currency',
    benchmark: 'controlled-usdx-reference', 'exposure-mechanism': 'currency-futures',
    'legal-structure': 'futures-commodity-pool', leverage: 'unlevered', 'reset-policy': 'none',
    expense: 0.005, 'tax-form-class': 'schedule-k1'
  },
  UDN: {
    issuer: 'controlled-issuer-udn', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'dollar-weakness', direction: 'short-USD', 'currency-or-basket': 'USDX-six-currency',
    benchmark: 'controlled-usdx-reference', 'exposure-mechanism': 'currency-futures',
    'legal-structure': 'futures-commodity-pool', leverage: 'unlevered', 'reset-policy': 'none',
    expense: 0.005, 'tax-form-class': 'schedule-k1'
  },
  USDU: {
    issuer: 'controlled-issuer-usdu', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'dollar-strength', direction: 'long-USD', 'currency-or-basket': 'USDU-developed-em-dynamic',
    benchmark: 'controlled-usdu-reference', 'exposure-mechanism': 'currency-contracts',
    'legal-structure': 'currency-contract-fund', leverage: 'unlevered', 'reset-policy': 'none',
    expense: 0.005, 'tax-form-class': 'form-1099'
  },
  CEW: {
    issuer: 'controlled-issuer-cew', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'diversified-em-currency', direction: 'long-diversified-EM-currency-basket',
    'currency-or-basket': 'diversified-em-currency-basket', benchmark: 'controlled-cew-reference',
    'exposure-mechanism': 'currency-contracts', 'legal-structure': 'currency-contract-fund',
    leverage: 'unlevered', 'reset-policy': 'none', expense: 0.005, 'tax-form-class': 'form-1099'
  },
  YCS: {
    issuer: 'controlled-issuer-ycs', exchange: 'controlled-exchange', 'active-status': 'active',
    objective: 'dollar-strength', direction: 'short-JPY/long-USD', 'currency-or-basket': 'JPY',
    benchmark: 'controlled-daily-inverse-jpy-reference', 'exposure-mechanism': 'daily-inverse-currency',
    'legal-structure': 'daily-reset-fund', leverage: '2x-inverse-daily', 'reset-policy': 'daily',
    expense: 0.005, 'tax-form-class': 'form-1099'
  }
};

function controlledFitSourcePolicy() {
  return {
    contractVersion: 'rlfx-vehicle-source-policy/v1',
    policyId: 'vehicle-source:controlled-fit-fixture-v1',
    sourceId: 'controlled-fit-fixture',
    sourceClass: 'approved-public-market',
    sourceUrl: 'https://example.invalid/feature-004-controlled-fit-fixture',
    activation: 'approved',
    sourceUsePolicyId: 'controlled-use:feature-004-fit-v1',
    sourceUseReviewRef: 'controlled-review:feature-004-fit-v1',
    rights: 'reference-only',
    retention: 'normalized-facts-and-hash',
    allowedFactKinds: [
      'issuer', 'exchange', 'active-status', 'objective', 'direction', 'currency-or-basket',
      'benchmark', 'exposure-mechanism', 'legal-structure', 'leverage', 'reset-policy',
      'expense', 'tax-form-class', 'spread', 'volume', 'reset-session'
    ],
    forbiddenPayloadKinds: ['current-market-values'],
    subjectTickers: expectedTickers,
    expectedCadence: 'event-driven',
    reviewWindow: { mode: 'max-age', observedMaxAgeMs: 86400000, retrievalMaxAgeMs: 86400000 },
    limitations: ['Controlled test-only fit facts; no current market fact is asserted by the production registry.']
  };
}

function controlledRecommendationSourcePolicy() {
  const policy = controlledFitSourcePolicy();
  policy.policyId = 'vehicle-source:controlled-recommendation-market-v1';
  policy.sourceId = 'controlled-recommendation-market';
  policy.sourceUsePolicyId = 'controlled-use:feature-004-recommendation-market-v1';
  policy.sourceUseReviewRef = 'controlled-review:feature-004-recommendation-market-v1';
  policy.allowedFactKinds = ['market-price'];
  policy.forbiddenPayloadKinds = ['restricted-provider-payload'];
  policy.subjectTickers = ['FXY'];
  policy.expectedCadence = 'daily';
  policy.limitations = ['Controlled test-only market series for attributable recommendation gates.'];
  return policy;
}

function fitObservation(vehicle, factKind, value, observationId) {
  return {
    contractVersion: 'rlfx-vehicle-observation/v1',
    observationId,
    vehicleId: vehicle.vehicleId,
    ticker: vehicle.ticker,
    factKind,
    sourcePolicyId: 'vehicle-source:controlled-fit-fixture-v1',
    source: { id: 'controlled-fit-fixture', class: 'approved-public-market', url: 'https://example.invalid/feature-004-controlled-fit-fixture' },
    observedAsOf: '2026-08-03T09:00:00.000Z',
    retrievedAt: '2026-08-03T10:00:00.000Z',
    expectedCadence: 'event-driven',
    reviewWindow: { mode: 'max-age', observedMaxAgeMs: 86400000, retrievalMaxAgeMs: 86400000 },
    freshUntil: '2026-08-04T09:00:00.000Z',
    rights: 'reference-only',
    quality: 'approved-public-derived',
    revisionId: 'controlled-fit-fixture-v1',
    limitations: ['Controlled test-only observation; not a current production fact.'],
    kind: 'scalar',
    availability: 'fresh',
    value,
    unit: factKind === 'spread' ? 'basis-points' : (factKind === 'volume' ? 'shares' : (factKind === 'expense' ? 'decimal' : 'classification'))
  };
}

function fitTrackingReadAt(vehicle, horizon, decisionTime, observedAsOf) {
  const input = trackingInput();
  input.decisionTime = decisionTime;
  input.vehicleId = vehicle.vehicleId;
  input.ticker = vehicle.ticker;
  input.horizon = horizon;
  [input.market, input.nav, input.underlying].forEach((leg) => {
    leg.observation.vehicleId = vehicle.vehicleId;
    leg.observation.ticker = vehicle.ticker;
    leg.observation.observationId = `tracking:${vehicle.ticker}:${leg.observation.factKind}`;
    leg.observation.series.seriesId = `tracking-series:${vehicle.ticker}:${leg.observation.factKind}`;
    leg.observation.observedAsOf = observedAsOf;
  });
  input.contexts.forEach((observation) => {
    observation.vehicleId = vehicle.vehicleId;
    observation.ticker = vehicle.ticker;
    observation.observationId = `tracking:${vehicle.ticker}:context:${observation.factKind}`;
  });
  return RLFX.computeVehicleTrackingRead(input);
}

function fitTrackingRead(vehicle, horizon) {
  return fitTrackingReadAt(vehicle, horizon, '2026-08-03T12:00:00.000Z', '2026-08-03T00:00:00.000Z');
}

function vehicleFitInput() {
  const fitUniverse = clone(universe);
  fitUniverse.sourcePolicies.push(controlledFitSourcePolicy());
  const observations = [];
  fitUniverse.vehicles.forEach((vehicle) => {
    const values = fitFactValues[vehicle.ticker];
    Object.values(vehicle.factRefs).forEach((observationId) => {
      const registered = fitUniverse.observations.find((entry) => entry.observationId === observationId);
      observations.push(fitObservation(vehicle, registered.factKind, values[registered.factKind], observationId));
    });
    observations.push(fitObservation(vehicle, 'spread', 5, `fit:${vehicle.ticker}:spread`));
    observations.push(fitObservation(vehicle, 'volume', 1000, `fit:${vehicle.ticker}:volume`));
  });
  const ycs = fitUniverse.vehicles.find((vehicle) => vehicle.ticker === 'YCS');
  observations.push(fitObservation(ycs, 'reset-session', {
    resetSessionId: 'controlled-ycs-session-2026-08-03',
    resetSessionEndsAt: '2026-08-03T20:00:00.000Z'
  }, 'fit:YCS:reset-session'));
  return {
    decisionTime: '2026-08-03T12:00:00.000Z',
    universe: fitUniverse,
    objective: { kind: 'foreign-currency-strength', subjectId: 'JPY', direction: 'long-JPY/short-USD' },
    controls: {
      horizon: 'swing',
      vehicleClass: 'unlevered-single-currency',
      dailyResetPermission: 'exclude',
      liquidityPolicyId: 'vehicle-liquidity-research-minimum-v1',
      costPolicyId: 'vehicle-cost-research-maximum-v1'
    },
    observations,
    trackingReads: fitUniverse.vehicles.map((vehicle) => fitTrackingRead(vehicle, 'swing'))
  };
}

function selectedOwnerControls() {
  return {
    objective: 'foreign-currency-strength',
    subjectId: 'JPY',
    cohort: 'G10',
    horizon: 'swing',
    pairMode: 'explicit',
    base: 'JPY',
    quote: 'USD',
    vehicleClass: 'unlevered-single-currency',
    dailyResetPermission: 'exclude',
    liquidityPolicyId: 'vehicle-liquidity-research-minimum-v1',
    costPolicyId: 'vehicle-cost-research-maximum-v1',
    evidenceLens: 'balanced',
    dollarComparison: 'Broad'
  };
}

function currencyDecisionForOwner(controls, decisionTime) {
  const seed = clone(currencyDecisionSeed);
  seed.decisionTime = decisionTime;
  seed.configVersion = 'fixture-owner-currency-v1';
  seed.controls = {
    cohort: controls.cohort,
    horizon: controls.horizon,
    pairMode: controls.pairMode,
    base: controls.base,
    quote: controls.quote,
    evidenceLens: controls.evidenceLens,
    dollarComparison: controls.dollarComparison
  };
  const decision = clone(RLFX.computeCurrencyDecision(seed));
  const strongestCurrency = controls.subjectId;
  decision.state = 'ready';
  decision.broadDollar = {
    selected: controls.dollarComparison,
    state: controls.objective === 'dollar-strength' ? 'Strengthening' : 'Weakening',
    basis: 'controlled-owner-fixture',
    series: {},
    concentration: 'broad',
    conflicts: [],
    confirmation: 'Controlled broad-dollar evidence remains directional.',
    invalidation: 'An opposing controlled broad-dollar direction invalidates the fixture read.'
  };
  decision.cohorts = {
    G10: {
      state: 'ranked',
      ranked: [
        { currency: strongestCurrency, cohort: 'G10', state: 'Strong', zDistance: 1.2, coverageRatio: 1 },
        { currency: 'USD', cohort: 'G10', state: 'Weak', zDistance: -1, coverageRatio: 1 }
      ]
    },
    'liquid-EM': { state: 'unavailable', ranked: [] },
    'managed-reference': { state: 'reference-only', ranked: [] }
  };
  decision.pair = {
    contractVersion: 'rlfx-pair-read/v1',
    base: controls.base,
    quote: controls.quote,
    state: 'Candidate',
    momentum: {
      tactical: { state: 'Positive' },
      swing: { state: 'Positive' },
      structural: { state: 'Positive' }
    },
    risk: { state: 'Normal' },
    confirmation: 'Controlled pair evidence remains aligned.',
    invalidation: 'A controlled pair reversal invalidates the fixture read.'
  };
  decision.hedgeResearch = { state: 'Research Priority' };
  decision.carryUnwind = { state: 'Dormant', conditions: [] };
  decision.conflicts = [];
  decision.coverage = { required: 7, available: 7, ratio: 1, stale: 0, unavailable: 0 };
  decision.confirmation = 'Confirm the controlled currency decision on its next exact observation window.';
  decision.invalidation = 'Invalidate the controlled currency decision when its directional evidence reverses.';
  decision.asOf = '2026-08-03T08:00:00.000Z';
  decision.freshUntil = '2026-08-04T08:00:00.000Z';
  decision.limitations = ['Controlled currency decision fixture; no market claim is asserted.'];
  delete decision.decisionId;
  decision.decisionId = RLFX.decisionId(decision);
  return freezeDeep(decision);
}

function normalizedOwnerObservations(fitInput) {
  return fitInput.observations.map((observation) => RLFX.normalizeVehicleObservation(observation, {
    universe: fitInput.universe,
    decisionTime: fitInput.decisionTime,
    payloadKind: 'normalized-structural-fact'
  }));
}

function ownerInputFromFit(fitInput, controls) {
  return {
    decisionTime: fitInput.decisionTime,
    currencyDecision: currencyDecisionForOwner(controls, fitInput.decisionTime),
    vehicleUniverse: fitInput.universe,
    vehicleObservations: normalizedOwnerObservations(fitInput),
    trackingReads: fitInput.trackingReads,
    controls,
    fitPolicyId: fitInput.universe.policies.fitPolicyId,
    trackingPolicyId: fitInput.universe.policies.trackingPolicyId
  };
}

function recommendationGate(instrument, marketObservation, gateId, relation, level) {
  return {
    gateId,
    instrument: clone(instrument),
    relation,
    level,
    unit: 'instrument-price',
    observationBasis: {
      observationId: marketObservation.observationId,
      field: marketObservation.series.adjustment === 'adjusted-close' ? 'adjusted-close' : 'close',
      adjustment: marketObservation.series.adjustment,
      observedAsOf: marketObservation.observedAsOf
    },
    evidenceRefs: [marketObservation.observationId]
  };
}

function ownerInputWithRecommendation({ horizon = 'swing', mutate } = {}) {
  const fitInput = vehicleFitInput();
  fitInput.universe.sourcePolicies.push(controlledRecommendationSourcePolicy());
  const controls = selectedOwnerControls();
  if (horizon !== 'swing') {
    setFitHorizon(fitInput, horizon);
    controls.horizon = horizon;
  }
  const input = ownerInputFromFit(fitInput, controls);
  const marketObservation = trackingSeriesObservation('market-price', 'market-price');
  marketObservation.sourcePolicyId = 'vehicle-source:controlled-recommendation-market-v1';
  marketObservation.source = {
    id: 'controlled-recommendation-market',
    class: 'approved-public-market',
    url: 'https://example.invalid/feature-004-controlled-fit-fixture'
  };
  marketObservation.reviewWindow = {
    mode: 'max-age',
    observedMaxAgeMs: 86400000,
    retrievalMaxAgeMs: 86400000
  };
  marketObservation.freshUntil = '2026-08-04T00:00:00.000Z';
  marketObservation.limitations = ['Controlled test-only market series for attributable recommendation gates.'];
  const instrument = {
    vehicleId: marketObservation.vehicleId,
    ticker: marketObservation.ticker,
    marketSeriesId: marketObservation.series.seriesId
  };
  const recommendationEvidence = {
    contractVersion: 'rlfx-attributable-recommendation-evidence/v1',
    economicDirection: { instrumentSide: 'long', exposure: 'long-JPY/short-USD' },
    marketObservation,
    trigger: recommendationGate(instrument, marketObservation, 'gate:FXY:confirm', 'closes-above', 104),
    invalidation: recommendationGate(instrument, marketObservation, 'gate:FXY:invalidate', 'closes-below', 98),
    provenance: [{ class: 'observed-fact', evidenceRef: marketObservation.observationId }]
  };
  if (mutate) mutate({ input, recommendationEvidence, marketObservation });
  if (recommendationEvidence.marketObservation) {
    freezeDeep(recommendationEvidence.marketObservation);
    input.vehicleObservations.push(recommendationEvidence.marketObservation);
  }
  input.recommendationEvidence = recommendationEvidence;
  return input;
}

function assertUnavailableNonRecommendation(outcome, label) {
  assert.equal(outcome.outcome, 'unavailable', label);
  assert.equal(outcome.evaluability, 'non-recommendation', label);
  assert.notEqual(outcome.evaluability, 'not-evaluable', label);
  ['instrument', 'trigger', 'invalidation'].forEach((field) => {
    assert.equal(Object.hasOwn(outcome, field), false, `${label}: ${field} is absent`);
  });
}

function collectStrings(value, strings) {
  if (typeof value === 'string') {
    strings.push(value);
    return;
  }
  if (!value || typeof value !== 'object') return;
  Object.values(value).forEach((child) => collectStrings(child, strings));
}

function collectKeys(value, keys) {
  if (!value || typeof value !== 'object') return;
  Object.entries(value).forEach(([key, child]) => {
    keys.add(key);
    collectKeys(child, keys);
  });
}

function setFitFact(input, ticker, factKind, value) {
  const observation = input.observations.find((entry) => entry.ticker === ticker && entry.factKind === factKind);
  assert.ok(observation, `${ticker} ${factKind} fixture exists`);
  observation.value = value;
}

function setFitHorizon(input, horizon) {
  input.controls.horizon = horizon;
  input.trackingReads = input.universe.vehicles.map((vehicle) => fitTrackingRead(vehicle, horizon));
}

function vehicleEvaluation(read, ticker) {
  const evaluation = read.evaluations.find((entry) => entry.ticker === ticker);
  assert.ok(evaluation, `${ticker} evaluation exists`);
  return evaluation;
}

function vehicleCriterion(evaluation, criterion) {
  const result = evaluation.criteria.find((entry) => entry.criterion === criterion);
  assert.ok(result, `${evaluation.ticker} ${criterion} criterion exists`);
  return result;
}

test('RLFX vehicle fit rejects every direction mismatch before ranking', () => {
  assert.equal(typeof RLFX.computeVehicleFitRead, 'function');
  const input = vehicleFitInput();
  const read = RLFX.computeVehicleFitRead(input);

  assert.deepEqual(read.evaluations.map((entry) => entry.ticker), expectedTickers);
  assert.equal(read.evaluations.length, input.universe.vehicles.length);
  assert.ok(read.evaluations.every((evaluation) => {
    return evaluation.criteria.map((criterion) => criterion.criterion).join('|') === input.universe.policies.fitPolicies[0].criterionOrder.join('|');
  }));
  assert.equal(read.selectedVehicleId, 'vehicle:FXY');
  assert.equal(read.selected.ticker, 'FXY');
  assert.equal(vehicleCriterion(read.selected, 'tracking').state, 'pass');
  const mismatches = read.evaluations.filter((evaluation) => evaluation.ticker !== 'FXY');
  assert.ok(mismatches.every((evaluation) => evaluation.reasonCodes.includes('DIRECTION_MISMATCH')));
  assert.ok(mismatches.every((evaluation) => vehicleCriterion(evaluation, 'objective-direction').state === 'fail'));
  assert.ok(vehicleEvaluation(read, 'YCS').reasonCodes.includes('DIRECTION_MISMATCH'));

  const opposite = vehicleFitInput();
  setFitFact(opposite, 'FXY', 'direction', 'short-JPY/long-USD');
  const oppositeRead = RLFX.computeVehicleFitRead(opposite);
  assert.equal(vehicleEvaluation(oppositeRead, 'FXY').state, 'Rejected');
  assert.ok(vehicleEvaluation(oppositeRead, 'FXY').reasonCodes.includes('DIRECTION_MISMATCH'));
  assert.equal(oppositeRead.selectedVehicleId, null);
});

test('RLFX broad-dollar vehicle fit rejects basket mismatch before lexicographic selection', () => {
  const input = vehicleFitInput();
  input.objective = { kind: 'dollar-strength', subjectId: 'USDX-six-currency', direction: 'long-USD' };
  input.controls.vehicleClass = 'broad-dollar-basket';
  const read = RLFX.computeVehicleFitRead(input);

  assert.equal(read.selectedVehicleId, 'vehicle:UUP');
  assert.equal(vehicleCriterion(vehicleEvaluation(read, 'USDU'), 'currency-basket').state, 'fail');
  assert.ok(vehicleEvaluation(read, 'USDU').reasonCodes.includes('BASKET_MISMATCH'));
  assert.deepEqual(read.evaluations.map((entry) => entry.ticker), expectedTickers);

  const semanticTie = vehicleFitInput();
  semanticTie.objective = { kind: 'dollar-strength', subjectId: 'USDX-six-currency', direction: 'long-USD' };
  semanticTie.controls.vehicleClass = 'broad-dollar-basket';
  setFitFact(semanticTie, 'USDU', 'currency-or-basket', 'USDX-six-currency');
  const tieRead = RLFX.computeVehicleFitRead(semanticTie);
  assert.equal(tieRead.state, 'Unavailable');
  assert.equal(tieRead.selectedVehicleId, null);
  assert.equal(tieRead.selected, null);
  assert.ok(tieRead.reasonCodes.includes('FIT_TIE'));
});

test('RLFX daily-reset fit rejects YCS outside the exact tactical reset session', () => {
  const valid = vehicleFitInput();
  valid.objective = { kind: 'dollar-strength', subjectId: 'JPY', direction: 'short-JPY/long-USD' };
  valid.controls.vehicleClass = 'tactical-daily-reset';
  valid.controls.dailyResetPermission = 'permit-tactical';
  setFitHorizon(valid, 'tactical');
  const validRead = RLFX.computeVehicleFitRead(valid);
  assert.equal(validRead.state, 'Tactical-Only');
  assert.equal(validRead.selectedVehicleId, 'vehicle:YCS');
  assert.equal(vehicleEvaluation(validRead, 'YCS').state, 'Tactical-Only');

  const swing = clone(valid);
  setFitHorizon(swing, 'swing');
  const swingRead = RLFX.computeVehicleFitRead(swing);
  assert.equal(vehicleEvaluation(swingRead, 'YCS').state, 'Rejected');
  assert.ok(vehicleEvaluation(swingRead, 'YCS').reasonCodes.includes('HORIZON_INCOMPATIBLE'));

  const excluded = clone(valid);
  excluded.controls.dailyResetPermission = 'exclude';
  const excludedRead = RLFX.computeVehicleFitRead(excluded);
  assert.equal(vehicleEvaluation(excludedRead, 'YCS').state, 'Rejected');
  assert.ok(vehicleEvaluation(excludedRead, 'YCS').reasonCodes.includes('DAILY_RESET_NOT_PERMITTED'));

  const opposite = clone(valid);
  opposite.objective = { kind: 'foreign-currency-strength', subjectId: 'JPY', direction: 'long-JPY/short-USD' };
  const oppositeRead = RLFX.computeVehicleFitRead(opposite);
  assert.equal(vehicleEvaluation(oppositeRead, 'YCS').state, 'Rejected');
  assert.ok(vehicleEvaluation(oppositeRead, 'YCS').reasonCodes.includes('DIRECTION_MISMATCH'));

  const expired = clone(valid);
  setFitFact(expired, 'YCS', 'reset-session', {
    resetSessionId: 'controlled-ycs-expired-session',
    resetSessionEndsAt: expired.decisionTime
  });
  const expiredRead = RLFX.computeVehicleFitRead(expired);
  assert.equal(vehicleEvaluation(expiredRead, 'YCS').state, 'Unavailable');
  assert.ok(vehicleEvaluation(expiredRead, 'YCS').reasonCodes.includes('RESET_SESSION_UNAVAILABLE'));
  assert.equal(expiredRead.state, 'Unavailable');
  assert.equal(expiredRead.selectedVehicleId, null);
});

test('RLFX settled vehicle evaluations produce No Eligible Vehicle without substitution', () => {
  const settled = vehicleFitInput();
  settled.objective = { kind: 'foreign-currency-strength', subjectId: 'CAD', direction: 'long-CAD/short-USD' };
  const settledRead = RLFX.computeVehicleFitRead(settled);

  assert.equal(settledRead.state, 'No Eligible Vehicle');
  assert.equal(settledRead.selectedVehicleId, null);
  assert.equal(settledRead.selected, null);
  assert.equal(settledRead.evaluations.length, settled.universe.vehicles.length);
  assert.deepEqual(settledRead.evaluations.map((entry) => entry.ticker), expectedTickers);
  assert.ok(settledRead.evaluations.every((entry) => entry.state === 'Rejected'));
  assert.ok(settledRead.reasonCodes.includes('NO_ELIGIBLE_VEHICLE'));

  const missingCurrentFact = vehicleFitInput();
  missingCurrentFact.observations = missingCurrentFact.observations.filter((observation) => {
    return !(observation.ticker === 'FXY' && observation.factKind === 'active-status');
  });
  const unavailableRead = RLFX.computeVehicleFitRead(missingCurrentFact);
  assert.equal(unavailableRead.state, 'Unavailable');
  assert.equal(unavailableRead.selectedVehicleId, null);
  assert.equal(vehicleEvaluation(unavailableRead, 'FXY').state, 'Unavailable');
  assert.equal(vehicleCriterion(vehicleEvaluation(unavailableRead, 'FXY'), 'active-status').state, 'unavailable');
  assert.ok(vehicleEvaluation(unavailableRead, 'FXY').reasonCodes.includes('ACTIVE_STATUS_UNKNOWN'));
});

test('RLFX owner decision is deterministic deeply frozen browser and CommonJS safe with one currency identity', () => {
  assert.equal(typeof RLFX.computeFxOwnerDecision, 'function');
  assert.equal(typeof RLFX.projectFxToolReadV2, 'function');

  const input = ownerInputFromFit(vehicleFitInput(), selectedOwnerControls());
  const owner = RLFX.computeFxOwnerDecision(input);
  const repeatedInput = ownerInputFromFit(vehicleFitInput(), selectedOwnerControls());
  const repeated = RLFX.computeFxOwnerDecision(repeatedInput);
  const projection = RLFX.projectFxToolReadV2(owner);
  assert.equal(owner.currencyDecision, input.currencyDecision);
  assert.equal(owner.currencyDecision.decisionId, input.currencyDecision.decisionId);
  assert.equal(owner.configVersions.currencyUniverse, input.currencyDecision.configVersion);
  assert.equal(owner.configVersions.vehicleUniverse, input.vehicleUniverse.version);
  assert.equal(owner.configVersions.fitPolicy, input.fitPolicyId);
  assert.equal(owner.configVersions.trackingPolicy, input.trackingPolicyId);
  assert.equal(owner.ownerDecisionId, repeated.ownerDecisionId);
  assert.equal(owner.evidenceIdentity, repeated.evidenceIdentity);
  assert.equal(RLFX.canonicalize(owner), RLFX.canonicalize(repeated));
  assertDeepFrozen(owner);
  assertDeepFrozen(projection);
  assert.doesNotMatch(String(RLFX.computeFxOwnerDecision), /computeCurrencyDecision\s*\(/);
  assert.throws(() => RLFX.computeFxOwnerDecision({ ...input, sourceEnvelopes: [] }));

  const browserContext = { ownerInputJson: JSON.stringify(input) };
  runInNewContext(readFileSync(resolve(ROOT, 'rlfx.js'), 'utf8'), browserContext);
  const browserJson = runInNewContext(`(function () {
    function freeze(value) {
      if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
      Object.keys(value).forEach(function (key) { freeze(value[key]); });
      return Object.freeze(value);
    }
    var input = JSON.parse(ownerInputJson);
    freeze(input.currencyDecision);
    input.vehicleObservations.forEach(freeze);
    input.trackingReads.forEach(freeze);
    var owner = RLFX.computeFxOwnerDecision(input);
    return JSON.stringify({ owner: owner, projection: RLFX.projectFxToolReadV2(owner) });
  })()`, browserContext);
  const browser = JSON.parse(browserJson);
  assert.equal(RLFX.canonicalize(browser.owner), RLFX.canonicalize(owner));
  assert.equal(RLFX.canonicalize(browser.projection), RLFX.canonicalize(projection));
});

test('RLFX v2 projection preserves selected no eligible and unavailable owner outcomes', () => {
  const selectedInput = ownerInputFromFit(vehicleFitInput(), selectedOwnerControls());
  const selectedOwner = RLFX.computeFxOwnerDecision(selectedInput);
  const selectedRead = RLFX.projectFxToolReadV2(selectedOwner);
  assert.equal(selectedOwner.state, 'ready');
  assert.equal(selectedOwner.vehicleFit.state, 'Eligible');
  assert.equal(selectedRead.contractVersion, 'rl-tool-read/v1');
  assert.equal(selectedRead.metrics.contractVersion, 'rlfx-tool-read/v2');
  assert.equal(selectedRead.availability, 'current');
  assert.equal(selectedRead.asOf, selectedOwner.evidenceCutoff);
  assert.equal(selectedRead.metrics.vehicle.selectedVehicleId, 'vehicle:FXY');
  assert.equal(selectedRead.metrics.vehicle.selectedTicker, 'FXY');
  assert.equal(selectedRead.metrics.vehicle.selectedStructure, 'single-currency-trust');
  assert.equal(selectedRead.metrics.vehicle.selectedDirection, 'long-JPY/short-USD');
  assert.equal(selectedRead.metrics.vehicle.trackingState, 'Tracking');
  assert.equal(selectedRead.metrics.vehicle.alternatives.length, 6);
  assert.ok(selectedRead.metrics.vehicle.rejected.every((entry) => entry.reasonCodes.length > 0));
  assert.equal(selectedRead.metrics.ownerDecisionId, selectedOwner.ownerDecisionId);
  assert.equal(selectedRead.metrics.evidenceIdentity, selectedOwner.evidenceIdentity);
  assert.equal(selectedRead.metrics.educationalOnly, true);
  assert.equal(selectedRead.metrics.executionAvailable, false);

  const noEligibleFit = vehicleFitInput();
  const noEligibleControls = selectedOwnerControls();
  noEligibleControls.subjectId = 'CAD';
  noEligibleControls.base = 'CAD';
  const noEligibleOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(noEligibleFit, noEligibleControls));
  const noEligibleRead = RLFX.projectFxToolReadV2(noEligibleOwner);
  assert.equal(noEligibleOwner.state, 'ready');
  assert.equal(noEligibleOwner.vehicleFit.state, 'No Eligible Vehicle');
  assert.equal(noEligibleOwner.vehicleFit.selectedVehicleId, null);
  assert.match(noEligibleOwner.ownerDecision, /No Eligible Vehicle/);
  assert.equal(noEligibleRead.availability, 'current');
  assert.equal(noEligibleRead.metrics.vehicle.selectedVehicleId, null);
  assert.equal(noEligibleRead.metrics.vehicle.selectedTicker, null);
  assert.equal(noEligibleRead.metrics.vehicle.alternatives.length, 7);
  assert.equal(noEligibleRead.metrics.vehicle.rejected.length, 7);

  const unavailableFit = vehicleFitInput();
  unavailableFit.observations = unavailableFit.observations.filter((observation) => {
    return !(observation.ticker === 'FXY' && observation.factKind === 'active-status');
  });
  const unavailableOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(unavailableFit, selectedOwnerControls()));
  const unavailableRead = RLFX.projectFxToolReadV2(unavailableOwner);
  assert.equal(unavailableOwner.state, 'partial');
  assert.equal(unavailableOwner.vehicleFit.state, 'Unavailable');
  assert.equal(unavailableOwner.vehicleFit.selectedVehicleId, null);
  assert.notEqual(unavailableOwner.ownerDecisionId, selectedOwner.ownerDecisionId);
  assert.equal(unavailableRead.availability, 'unavailable');
  assert.equal(unavailableRead.asOf, null);
  assert.equal(unavailableRead.freshUntil, null);
  assert.equal(unavailableRead.metrics.vehicle.selectedVehicleId, null);
  assert.equal(unavailableRead.metrics.vehicle.selectedTicker, null);
  assert.equal(unavailableRead.metrics.vehicle.selectedStructure, null);
  assert.equal(unavailableRead.metrics.vehicle.selectedDirection, null);
  assert.equal(unavailableRead.metrics.vehicle.trackingState, null);
});

test('RLFX owner semantic evidence identity ignores retrieval occurrence and changes on revision state and cutoff', () => {
  const baselineFit = vehicleFitInput();
  const baselineOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(baselineFit, selectedOwnerControls()));

  const retrievalFit = vehicleFitInput();
  retrievalFit.observations.find((observation) => observation.observationId === 'vehicle:FXY:issuer').retrievedAt = '2026-08-03T10:30:00.000Z';
  const retrievalOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(retrievalFit, selectedOwnerControls()));
  assert.notEqual(retrievalOwner.ownerDecisionId, baselineOwner.ownerDecisionId);
  assert.equal(retrievalOwner.evidenceIdentity, baselineOwner.evidenceIdentity);

  const revisionFit = vehicleFitInput();
  revisionFit.observations.find((observation) => observation.observationId === 'vehicle:FXY:issuer').revisionId = 'controlled-fit-fixture-v2';
  const revisionOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(revisionFit, selectedOwnerControls()));
  assert.notEqual(revisionOwner.evidenceIdentity, baselineOwner.evidenceIdentity);

  const stateFit = vehicleFitInput();
  stateFit.observations.find((observation) => observation.observationId === 'vehicle:FXY:issuer').availability = 'revised';
  const stateOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(stateFit, selectedOwnerControls()));
  assert.notEqual(stateOwner.evidenceIdentity, baselineOwner.evidenceIdentity);

  const cutoffInput = ownerInputFromFit(vehicleFitInput(), selectedOwnerControls());
  const cutoffCurrency = clone(cutoffInput.currencyDecision);
  cutoffCurrency.asOf = '2026-08-03T07:00:00.000Z';
  delete cutoffCurrency.decisionId;
  cutoffCurrency.decisionId = RLFX.decisionId(cutoffCurrency);
  cutoffInput.currencyDecision = freezeDeep(cutoffCurrency);
  const cutoffOwner = RLFX.computeFxOwnerDecision(cutoffInput);
  assert.notEqual(cutoffOwner.evidenceCutoff, baselineOwner.evidenceCutoff);
  assert.notEqual(cutoffOwner.evidenceIdentity, baselineOwner.evidenceIdentity);
});

test('RLFX owner decision expires YCS at the source reset boundary', () => {
  const currentFit = vehicleFitInput();
  currentFit.objective = { kind: 'dollar-strength', subjectId: 'JPY', direction: 'short-JPY/long-USD' };
  setFitHorizon(currentFit, 'tactical');
  const controls = selectedOwnerControls();
  controls.objective = 'dollar-strength';
  controls.horizon = 'tactical';
  controls.vehicleClass = 'tactical-daily-reset';
  controls.dailyResetPermission = 'permit-tactical';
  const currentOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(currentFit, controls));
  const currentRead = RLFX.projectFxToolReadV2(currentOwner);
  assert.equal(currentOwner.vehicleFit.state, 'Tactical-Only');
  assert.equal(currentRead.metrics.vehicle.selectedTicker, 'YCS');

  const expiredFit = vehicleFitInput();
  expiredFit.decisionTime = '2026-08-03T20:00:00.000Z';
  expiredFit.trackingReads = expiredFit.universe.vehicles.map((vehicle) => {
    return fitTrackingReadAt(vehicle, 'tactical', expiredFit.decisionTime, '2026-08-03T00:00:00.000Z');
  });
  const expiredOwner = RLFX.computeFxOwnerDecision(ownerInputFromFit(expiredFit, controls));
  const expiredRead = RLFX.projectFxToolReadV2(expiredOwner);
  assert.equal(expiredOwner.vehicleFit.state, 'Unavailable');
  assert.equal(expiredOwner.vehicleFit.selectedVehicleId, null);
  assert.notEqual(expiredOwner.evidenceIdentity, currentOwner.evidenceIdentity);
  assert.notEqual(expiredOwner.ownerDecisionId, currentOwner.ownerDecisionId);
  assert.equal(expiredRead.availability, 'unavailable');
  assert.equal(expiredRead.metrics.vehicle.selectedVehicleId, null);
  assert.equal(expiredRead.metrics.vehicle.selectedTicker, null);
  assert.equal(expiredRead.metrics.vehicle.trackingState, null);
});

test('RLFX v2 projection omits restricted private raw and execution-bearing fields', () => {
  const fitInput = vehicleFitInput();
  const restricted = fitInput.observations.find((observation) => observation.ticker === 'FXE' && observation.factKind === 'expense');
  restricted.rights = 'restricted';
  restricted.value = 918273.645;
  const owner = RLFX.computeFxOwnerDecision(ownerInputFromFit(fitInput, selectedOwnerControls()));
  const projection = RLFX.projectFxToolReadV2(owner);
  const keys = new Set();
  collectKeys(projection, keys);
  [
    'source', 'sourceUrl', 'url', 'rows', 'holdings', 'account', 'accountValue',
    'costBasis', 'taxStatus', 'brokerCredentials', 'order', 'orderSize',
    'personalized', 'restrictedValue'
  ].forEach((field) => assert.equal(keys.has(field), false, `${field} is absent`));
  const serialized = JSON.stringify(projection);
  assert.doesNotMatch(serialized, /example\.invalid|918273\.645/);
  assert.equal(projection.metrics.executionAvailable, false);
});

test('RLFX RecommendationOutcomeV1 rejects incomplete attributable gates and projects reader-safe branches', () => {
  assert.equal(typeof RLFX.computeRecommendationOutcome, 'function');
  assert.equal(typeof RLFX.projectFxReaderDecision, 'function');

  const ledgerPaths = [
    resolve(ROOT, 'briefs/history/recommendations/2026-07.jsonl'),
    resolve(ROOT, 'briefs/history/recommendations/2026-08.jsonl')
  ];
  const ledgerBytesBefore = ledgerPaths.map((ledgerPath) => readFileSync(ledgerPath));

  const completeInput = ownerInputWithRecommendation();
  const completeOwner = RLFX.computeFxOwnerDecision(completeInput);
  const completeOutcome = completeOwner.recommendationOutcome;
  assert.equal(completeOutcome.outcome, 'recommendation');
  assert.equal(completeOutcome.evaluability, 'machine-checkable');
  assert.equal(completeOutcome.instrument.ticker, 'FXY');
  assert.notDeepEqual(completeOutcome.trigger, completeOutcome.invalidation);
  assert.deepEqual(RLFX.computeRecommendationOutcome({
    ownerDecision: completeOwner,
    ownerEvidenceRefs: [completeInput.recommendationEvidence.marketObservation.observationId],
    recommendationEvidence: completeInput.recommendationEvidence
  }), completeOutcome);

  const gateMutations = [
    ['gateId missing', (gate) => { delete gate.gateId; }],
    ['gateId invalid', (gate) => { gate.gateId = ''; }],
    ['instrument missing', (gate) => { delete gate.instrument; }],
    ['instrument mismatch', (gate) => { gate.instrument.ticker = 'FXE'; }],
    ['relation missing', (gate) => { delete gate.relation; }],
    ['relation invalid', (gate) => { gate.relation = 'touches'; }],
    ['level missing', (gate) => { delete gate.level; }],
    ['level nonfinite', (gate) => { gate.level = Number.POSITIVE_INFINITY; }],
    ['unit missing', (gate) => { delete gate.unit; }],
    ['unit invalid', (gate) => { gate.unit = 'percent'; }],
    ['observation basis missing', (gate) => { delete gate.observationBasis; }],
    ['observation basis invalid', (gate) => { gate.observationBasis.observationId = 'outside-owner'; }],
    ['evidence refs missing', (gate) => { delete gate.evidenceRefs; }],
    ['evidence ref ineligible', (gate) => { gate.evidenceRefs = ['outside-owner']; }]
  ];
  let firstUnavailableOutcome = null;
  for (const gateName of ['trigger', 'invalidation']) {
    for (const [mutationName, mutateGate] of gateMutations) {
      const owner = RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
        mutate: ({ recommendationEvidence }) => mutateGate(recommendationEvidence[gateName])
      }));
      assertUnavailableNonRecommendation(owner.recommendationOutcome, `${gateName} ${mutationName}`);
      firstUnavailableOutcome ||= owner.recommendationOutcome;
    }
  }

  const identicalOwner = RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
    mutate: ({ recommendationEvidence }) => {
      recommendationEvidence.invalidation = clone(recommendationEvidence.trigger);
      recommendationEvidence.invalidation.gateId = 'gate:FXY:duplicate-semantics';
    }
  }));
  assertUnavailableNonRecommendation(identicalOwner.recommendationOutcome, 'identical gates');
  assert.ok(identicalOwner.recommendationOutcome.reasonCodes.includes('TRIGGER_INVALIDATION_IDENTICAL'));

  const staleOwner = RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
    mutate: ({ recommendationEvidence }) => {
      recommendationEvidence.marketObservation.availability = 'stale';
      recommendationEvidence.marketObservation.freshUntil = '2026-08-03T11:59:59.999Z';
    }
  }));
  assertUnavailableNonRecommendation(staleOwner.recommendationOutcome, 'stale market evidence');
  assert.ok(staleOwner.recommendationOutcome.reasonCodes.includes('MARKET_EVIDENCE_STALE'));

  const restrictedOwner = RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
    mutate: ({ recommendationEvidence }) => {
      recommendationEvidence.marketObservation.rights = 'restricted';
    }
  }));
  assertUnavailableNonRecommendation(restrictedOwner.recommendationOutcome, 'rights-ineligible market evidence');
  assert.ok(restrictedOwner.recommendationOutcome.reasonCodes.includes('MARKET_RIGHTS_INELIGIBLE'));

  for (const horizon of ['tactical', 'swing']) {
    const owner = RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
      horizon,
      mutate: ({ recommendationEvidence }) => { delete recommendationEvidence.trigger.level; }
    }));
    assertUnavailableNonRecommendation(owner.recommendationOutcome, `${horizon} incomplete gate`);
  }

  assert.throws(() => RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
    mutate: ({ recommendationEvidence }) => { recommendationEvidence.unknownBranch = true; }
  })), /unknown key/);
  assert.throws(() => RLFX.computeFxOwnerDecision(ownerInputWithRecommendation({
    mutate: ({ recommendationEvidence }) => { recommendationEvidence.trigger.unknownGateField = true; }
  })), /unknown key/);

  const noVehicleFit = vehicleFitInput();
  const noVehicleControls = selectedOwnerControls();
  noVehicleControls.subjectId = 'CAD';
  noVehicleControls.base = 'CAD';
  const noVehicleOutcome = RLFX.computeFxOwnerDecision(
    ownerInputFromFit(noVehicleFit, noVehicleControls)
  ).recommendationOutcome;
  assert.equal(noVehicleOutcome.outcome, 'no-vehicle');
  assert.equal(noVehicleOutcome.evaluability, 'non-recommendation');
  ['instrument', 'trigger', 'invalidation'].forEach((field) => {
    assert.equal(Object.hasOwn(noVehicleOutcome, field), false, `no-vehicle ${field} is absent`);
  });
  const settledNoVehicleRead = RLFX.computeVehicleFitRead({
    ...noVehicleFit,
    objective: { kind: 'foreign-currency-strength', subjectId: 'CAD', direction: 'long-CAD/short-USD' }
  });
  settledNoVehicleRead.evaluations.flatMap((evaluation) => evaluation.reasonCodes).forEach((reasonCode) => {
    assert.ok(noVehicleOutcome.reasonCodes.includes(reasonCode), `no-vehicle retains ${reasonCode}`);
  });

  let eventIdCalls = 0;
  const rowOptions = {
    occurredAt: '2026-08-03T12:00:00.000Z',
    eventIdFor(recommendationKey, index) {
      eventIdCalls += 1;
      return `test-event:${recommendationKey}:${String(index)}`;
    }
  };
  assert.deepEqual(recommendationRowsFromOutcome(noVehicleOutcome, rowOptions), []);
  assert.deepEqual(recommendationRowsFromOutcome(firstUnavailableOutcome, rowOptions), []);
  assert.equal(eventIdCalls, 0, 'non-recommendations return before event construction');

  const recommendationRows = recommendationRowsFromOutcome(completeOutcome, rowOptions);
  assert.equal(eventIdCalls, 1);
  assert.equal(recommendationRows.length, 1);
  assert.equal(recommendationRows[0].eventType, 'proposed');
  assert.equal(recommendationRows[0].bodyContractVersion, 'brief-recommendation-body/v1');
  assert.equal(recommendationRows[0].bodySource, 'rlfx-recommendation-outcome/v1');
  assert.equal(recommendationRows[0].instrument, 'FXY');
  assert.equal(recommendationRows[0].evaluability, 'machine-checkable');
  assert.deepEqual(recommendationRows[0].levels.map(({ relation, value, source }) => ({ relation, value, source })), [
    { relation: 'above', value: 104, source: 'trigger' },
    { relation: 'below', value: 98, source: 'invalidation' }
  ]);

  const reader = RLFX.projectFxReaderDecision(completeOwner);
  assert.deepEqual(Object.keys(reader).sort(), [
    'confirmation', 'continuity', 'decision', 'direction', 'educationalDisclosure',
    'evidenceCutoff', 'evidenceState', 'executionDisclosure', 'horizon', 'invalidation',
    'objective', 'ownerDeepLink', 'reasons', 'summary', 'vehicle'
  ].sort());
  assert.match(reader.decision, /Complete research setup/);
  assert.match(reader.evidenceCutoff, /^Evidence through 2026-08-03 at /);
  assert.match(reader.continuity, /Simple, Power, Brief, and Journey/);
  assert.equal(reader.educationalDisclosure, 'Educational research, not investment advice.');
  assert.equal(reader.executionDisclosure, 'No trade execution or order preparation is available.');
  assert.equal(reader.ownerDeepLink, 'fx-regime-relative-value-lab.html#power');

  const hostileTicker = `FXY</script><img src=x onerror="run()"> & '`;
  const hostileOwner = clone(completeOwner);
  hostileOwner.vehicleFit.selected.ticker = hostileTicker;
  hostileOwner.recommendationOutcome.instrument.ticker = hostileTicker;
  hostileOwner.recommendationOutcome.trigger.instrument.ticker = hostileTicker;
  hostileOwner.recommendationOutcome.invalidation.instrument.ticker = hostileTicker;
  freezeDeep(hostileOwner);
  const hostileReader = RLFX.projectFxReaderDecision(hostileOwner);
  const hostileStrings = [];
  collectStrings(hostileReader, hostileStrings);
  const hostileCopy = hostileStrings.join('\n');
  assert.match(hostileCopy, /&lt;\/script&gt;&lt;img/);
  assert.match(hostileCopy, /&quot;run\(\)&quot;/);
  assert.match(hostileCopy, /&amp;/);
  assert.match(hostileCopy, /&#39;/);
  assert.doesNotMatch(hostileCopy, /[<>]/);

  const readerKeys = new Set();
  collectKeys(reader, readerKeys);
  [
    'ownerDecisionId', 'evidenceIdentity', 'contractVersion', 'gateId', 'marketSeriesId',
    'observationId', 'evidenceRefs', 'provenance', 'reasonCodes', 'unavailableReason',
    'status', 'code', 'holdings', 'account', 'accountValue', 'costBasis',
    'brokerCredentials', 'order', 'orderSize', 'executionAvailable'
  ].forEach((field) => assert.equal(readerKeys.has(field), false, `${field} is absent from the reader projection`));
  const serializedReader = JSON.stringify(reader);
  [
    completeOwner.ownerDecisionId,
    completeOwner.evidenceIdentity,
    completeOutcome.trigger.gateId,
    completeOutcome.invalidation.gateId,
    completeInput.recommendationEvidence.marketObservation.observationId
  ].forEach((machineIdentity) => assert.equal(serializedReader.includes(machineIdentity), false, `${machineIdentity} is not reader copy`));
  assert.doesNotMatch(serializedReader, /\b(?:capability|scope|specification|framework)\b/i);
  assert.doesNotMatch(serializedReader, /(?:TRIGGER_|INVALIDATION_|MARKET_|VEHICLE_|EVIDENCE_|NO_ELIGIBLE_VEHICLE)/);

  ledgerPaths.forEach((ledgerPath, index) => {
    assert.deepEqual(readFileSync(ledgerPath), ledgerBytesBefore[index], `${ledgerPath} bytes remain unchanged`);
  });
});
