import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { clone, makeSnapshot, makeViewState } from './fixtures/shock-transmission/foundation-fixture.mjs';

const require = createRequire(import.meta.url);
const RLSHOCK = require('../rlshock.js');
const config = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

function unwrap(result) {
  assert.equal(result.ok, true, result.error && JSON.stringify(result.error));
  return result.value;
}

function setup() {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(config));
  const { definition, snapshot } = makeSnapshot({ policy });
  assert.equal(RLSHOCK.validateSnapshot(snapshot, definition, policy).ok, true);
  return { definition, snapshot, viewState: makeViewState(snapshot, definition) };
}

test('Regression: SCN-031-004 claim rows retain distinct visible evidence semantics', () => {
  const { viewState } = setup();
  const rows = unwrap(RLSHOCK.projectClaimRows(viewState));
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    'contractVersion', 'claimId', 'claimClass', 'visibleLabel', 'evidenceGrade',
    'evidenceBasis', 'sourceRefs', 'asOf', 'limitations', 'refuters'
  ].sort());
  assert.deepEqual(rows.map(({ claimClass, visibleLabel }) => ({ claimClass, visibleLabel })), [
    { claimClass: 'observed-fact', visibleLabel: 'Observed fact' },
    { claimClass: 'model-inference', visibleLabel: 'Model inference' }
  ]);
  assert.equal(rows[1].limitations.length, 1);
  assert.equal(rows[1].refuters.length, 1);
  assert.equal(rows[0].limitations.length, 0);
  assert.equal(Object.isFrozen(rows[1].limitations), true);

  const weakened = clone(viewState);
  weakened.baseline.claims[1].claimClass = 'observed-fact';
  const weakenedRows = unwrap(RLSHOCK.projectClaimRows(weakened));
  assert.equal(weakenedRows[1].visibleLabel, 'Observed fact');
  assert.notDeepEqual(weakenedRows, rows);
});

test('Regression: SCN-031-007 edge rows retain the complete bounded qualifier contract', () => {
  const { viewState } = setup();
  const rows = unwrap(RLSHOCK.projectEdgeRows(viewState));
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    'contractVersion', 'edgeId', 'pathId', 'order', 'sign', 'unitId', 'low', 'base',
    'high', 'lag', 'persistence', 'evidenceRefs', 'limitations', 'refuters'
  ].sort());
  assert.equal(rows[0].low <= rows[0].base && rows[0].base <= rows[0].high, true);
  assert.equal(rows[0].sign, 'positive');
  assert.equal(rows[0].unitId, 'fraction');
  assert.deepEqual(rows[0].lag, { value: 2, unitId: 'calendar-day' });
  assert.deepEqual(rows[0].persistence, { value: 0.75, unitId: 'fraction' });
  assert.equal(rows[0].evidenceRefs.length, 1);
  assert.equal(rows[0].limitations.length, 1);
  assert.equal(rows[0].refuters.length, 1);
  assert.equal(Object.isFrozen(rows), true);
  assert.equal(Object.isFrozen(rows[0].lag), true);
});
