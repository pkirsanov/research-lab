import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const productionUrl = new URL('../rlcontext.js', import.meta.url);
const require = createRequire(import.meta.url);

function loadProductionApi() {
  assert.equal(existsSync(productionUrl), true, 'production contract missing: rlcontext.js');
  delete require.cache[require.resolve(productionUrl.pathname)];
  return require(productionUrl.pathname);
}

function makeContext(overrides = {}) {
  return {
    contractVersion: 'contextual-tooltip/v1',
    contextId: 'market-heatmap/breadth/current',
    triggerKind: 'chart-point',
    label: 'Advancing breadth',
    definition: 'The percentage of observed constituents with a positive return.',
    displayed: {
      valueText: '64%',
      numericValue: 64,
      unit: 'percent',
      truthState: 'current'
    },
    interpretation: {
      text: '64% is above the declared 60% broad-participation threshold for the 1-day window.',
      direction: 'threshold-dependent',
      comparisonBasis: 'Observed S&P 500 constituents with complete 1-day returns',
      window: '1 trading day',
      thresholdsOrBounds: ['broad participation >= 60%']
    },
    provenance: {
      ownerId: 'market-heatmap-lab',
      modelId: 'market-breadth',
      evidenceIdentity: 'market-heatmap/SPY/2026-07-22T20:00:00Z',
      sourceRefs: ['rlData:bars:SPY:1d'],
      observedAsOf: '2026-07-22T20:00:00Z',
      retrievedOrPublishedAt: '2026-07-22T20:05:00Z',
      freshness: 'fresh',
      dataTier: 'same-origin-snapshot'
    },
    uncertainty: {
      state: 'bounded',
      rangeOrBand: '62%-66% under missing-constituent bounds',
      reason: 'Four constituents have unavailable 1-day returns.'
    },
    limitation: 'Breadth measures participation, not the magnitude or durability of the move.',
    triggerCondition: 'Breadth remains at or above 60% with at least 90% constituent coverage.',
    invalidationCondition: 'Breadth falls below 60% or observed coverage falls below 90%.',
    links: {
      owner: 'market-heatmap-lab.html#power',
      citation: '',
      sameDataTable: '#breadth-table-row-current',
      ticker: 'https://finance.yahoo.com/quote/SPY'
    },
    accessibility: {
      conciseLabel: 'Advancing breadth 64 percent, current',
      longDescriptionId: 'rlcontext-market-heatmap-breadth-current'
    },
    contextFingerprint: null,
    ...overrides
  };
}

function expectRefusal(result, fieldPath) {
  assert.equal(result.ok, false);
  assert.equal(result.error.contractVersion, 'experience-error/v1');
  assert.equal(result.error.code, 'E012-CONTEXT-MISSING');
  assert.equal(result.error.fieldPath, fieldPath);
  assert.equal(result.error.valueEchoed, false);
}

test('SCN-012-003 validates and deeply freezes a complete current-value context', () => {
  const api = loadProductionApi();
  const source = makeContext();
  const result = api.validateContext(source);

  assert.equal(result.ok, true);
  assert.equal(result.value.contextFingerprint.startsWith('sha256:'), true);
  assert.equal(Object.isFrozen(result.value), true);
  assert.equal(Object.isFrozen(result.value.interpretation), true);
  assert.equal(Object.isFrozen(result.value.provenance.sourceRefs), true);
  assert.equal(source.contextFingerprint, null, 'validation must not mutate its input');
  assert.equal(result.value.displayed.numericValue, 64);
  assert.equal(result.value.interpretation.direction, 'threshold-dependent');
});

test('SCN-012-004 rejects missing and label-only current interpretation', () => {
  const api = loadProductionApi();

  const missing = makeContext();
  delete missing.interpretation.text;
  expectRefusal(api.validateContext(missing), '$.interpretation.text');

  const labelOnly = makeContext({
    interpretation: {
      ...makeContext().interpretation,
      text: 'Advancing breadth 64%'
    }
  });
  expectRefusal(api.validateContext(labelOnly), '$.interpretation.text');
});

test('SCN-012-003 keeps unavailable distinct from zero and requires an exact reason', () => {
  const api = loadProductionApi();
  const unavailable = makeContext({
    displayed: {
      valueText: 'Unavailable',
      numericValue: null,
      unit: 'percent',
      truthState: 'unavailable'
    },
    interpretation: {
      ...makeContext().interpretation,
      text: 'No breadth conclusion is available because current constituent coverage is below the declared minimum.'
    },
    uncertainty: {
      state: 'unavailable',
      rangeOrBand: 'Unavailable',
      reason: 'Only 41% of required constituents have current observations.'
    }
  });

  const result = api.validateContext(unavailable);
  assert.equal(result.ok, true);
  assert.equal(result.value.displayed.numericValue, null);

  const fabricatedZero = structuredClone(unavailable);
  fabricatedZero.displayed.numericValue = 0;
  expectRefusal(api.validateContext(fabricatedZero), '$.displayed.numericValue');
});

test('SCN-012-003 rejects unknown fields unsafe links invalid states and unsupported direction', () => {
  const api = loadProductionApi();

  const unknown = makeContext({ bullish: true });
  expectRefusal(api.validateContext(unknown), '$.bullish');

  const unsafeLink = makeContext();
  unsafeLink.links.citation = 'javascript:alert(1)';
  expectRefusal(api.validateContext(unsafeLink), '$.links.citation');

  const invalidState = makeContext();
  invalidState.displayed.truthState = 'neutral';
  expectRefusal(api.validateContext(invalidState), '$.displayed.truthState');

  const unsupportedDirection = makeContext();
  unsupportedDirection.interpretation.direction = 'bullish';
  expectRefusal(api.validateContext(unsupportedDirection), '$.interpretation.direction');
});

test('SCN-012-003 canonical fingerprints are stable across key order and browser/CommonJS runtimes', () => {
  const api = loadProductionApi();
  const left = makeContext();
  const right = JSON.parse(JSON.stringify(left, Object.keys(left).reverse()));

  const leftResult = api.validateContext(left);
  assert.equal(leftResult.ok, true);
  assert.equal(api.fingerprint({ b: 2, a: 1 }), 'sha256:43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777');
  assert.equal(api.fingerprint({ a: 1, b: 2 }), api.fingerprint({ b: 2, a: 1 }));

  const source = require('node:fs').readFileSync(productionUrl, 'utf8');
  const browserRoot = { RLEXPERIENCE: api };
  const browserApi = Function('globalThis', 'module', `${source}\nreturn globalThis.RLCTX;`)(browserRoot, undefined);
  assert.equal(browserRoot.RLCTX, browserApi);
  assert.equal(browserApi.validateContext(left).value.contextFingerprint, leftResult.value.contextFingerprint);
  assert.equal(typeof right, 'object');
});