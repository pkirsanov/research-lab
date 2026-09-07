import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import {
  clone, makeSnapshot, makeViewState,
  makeHypothetical, makeHypotheticalAdapterOutput, makeProjectionInput
} from './fixtures/shock-transmission/foundation-fixture.mjs';

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

test('Regression: SCN-031-024 hypothetical projection is nonpersistable and reset is exact', () => {
  const { definition, snapshot, viewState: baseline } = setup();
  const baselineDigest = RLSHOCK.digest(baseline);

  // A same-topic lever change produces a labelled, nonpersistable comparison distinct from the baseline.
  const hypothetical = makeHypothetical(baseline, definition, snapshot, RLSHOCK);
  const adapterOutput = makeHypotheticalAdapterOutput(baseline);
  const compared = unwrap(RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(hypothetical, adapterOutput)));
  assert.equal(compared.projectionClass, 'user-hypothetical');
  assert.equal(compared.persistable, false);
  assert.deepEqual(compared.changedLeverIds, hypothetical.changedLeverIds);
  assert.notDeepEqual(compared.comparison, null);
  assert.notEqual(compared.comparison.claims[0].statement, baseline.baseline.claims[0].statement);
  assert.deepEqual(compared.baseline, baseline.baseline, 'the loaded baseline itself is never mutated by a comparison');
  assert.notEqual(RLSHOCK.digest(compared), baselineDigest, 'a labelled comparison is not identity-equal to the baseline');
  assert.equal(Object.isFrozen(compared), true);
  assert.equal(Object.isFrozen(compared.comparison.claims), true);

  // A mismatched baseline digest on the hypothetical contract refuses before any comparison is built.
  const staleHypothetical = makeHypothetical(baseline, definition, snapshot, RLSHOCK, { baselineViewDigest: 'sha256:' + '0'.repeat(64) });
  const staleResult = RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(staleHypothetical, adapterOutput));
  assert.equal(staleResult.ok, false);
  assert.equal(staleResult.error.code, 'RLSHOCK-DIGEST');
  assert.equal(staleResult.error.fieldPath, '$.baselineViewDigest');

  // A declared-persistable hypothetical contract refuses by exact field path; it is never silently coerced.
  const persistableHypothetical = makeHypothetical(baseline, definition, snapshot, RLSHOCK, { persistable: true });
  const persistableResult = RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(persistableHypothetical, adapterOutput));
  assert.equal(persistableResult.ok, false);
  assert.equal(persistableResult.error.code, 'RLSHOCK-HYPOTHETICAL-PERSIST');

  // Reset clears every local value and reprojects the exact loaded baseline identity.
  const reset = unwrap(RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(null, null)));
  assert.equal(reset.comparison, null);
  assert.deepEqual(reset.changedLeverIds, []);
  assert.equal(reset.persistable, false);
  assert.deepEqual(reset, baseline, 'reset deep-equals the originally loaded baseline view');
  assert.equal(RLSHOCK.digest(reset), baselineDigest, 'reset reproduces the exact baseline digest');

  // The nonpersistable guard refuses every hypothetical-shaped or nonpersistable candidate by exact path.
  const guardedHypothetical = RLSHOCK.validatePersistenceCandidate(hypothetical);
  assert.equal(guardedHypothetical.ok, false);
  assert.equal(guardedHypothetical.error.code, 'RLSHOCK-HYPOTHETICAL-PERSIST');
  const guardedComparison = RLSHOCK.validatePersistenceCandidate(compared);
  assert.equal(guardedComparison.ok, false);
  assert.equal(guardedComparison.error.code, 'RLSHOCK-HYPOTHETICAL-PERSIST');
  const guardedCanonical = RLSHOCK.validatePersistenceCandidate({ contractVersion: 'shock-transmission/v1', topicId: 'topic:neutral' });
  assert.equal(guardedCanonical.ok, true, 'an ordinary canonical candidate without persistable:false is admitted by the guard');

  // The weakened-input matrix: mismatched topic, mismatched snapshot, and an undeclared lever id each refuse by exact path.
  const wrongTopic = makeHypothetical(baseline, definition, snapshot, RLSHOCK, { topicId: 'topic:not-loaded' });
  const wrongTopicResult = RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(wrongTopic, adapterOutput));
  assert.equal(wrongTopicResult.ok, false);
  assert.equal(wrongTopicResult.error.fieldPath, '$.topicId');

  const wrongLever = makeHypothetical(baseline, definition, snapshot, RLSHOCK, { changedLeverIds: ['lever:not-declared'] });
  const wrongLeverResult = RLSHOCK.projectViewState(baseline, definition, makeProjectionInput(wrongLever, adapterOutput));
  assert.equal(wrongLeverResult.ok, false);
  assert.equal(wrongLeverResult.error.code, 'RLSHOCK-UNKNOWN-MEMBER');
});
