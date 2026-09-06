import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import {
  canonicalizeFixture,
  clone,
  deleteMember,
  digestFixture,
  makePolicy,
  makeSnapshot,
  makeViewState,
  requiredMemberPaths
} from './fixtures/shock-transmission/foundation-fixture.mjs';

const require = createRequire(import.meta.url);
const RLSHOCK = require('../rlshock.js');
const productionConfig = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

function unwrap(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code}:${result.error.fieldPath}:${result.error.reason}`);
  return result.value;
}

function assertRefusal(result, code, fieldPath) {
  assert.equal(result.ok, false, fieldPath);
  assert.equal(result.error.contractVersion, 'shock-transmission/error/v1', fieldPath);
  assert.equal(result.error.code, code, fieldPath);
  assert.equal(result.error.fieldPath, fieldPath, fieldPath);
  assert.equal(result.error.valueEchoed, false, fieldPath);
  assert.equal(Object.isFrozen(result), true, fieldPath);
  assert.equal(Object.isFrozen(result.error), true, fieldPath);
}

function independentDigest(value) {
  return `sha256:${createHash('sha256').update(canonicalizeFixture(value), 'utf8').digest('hex')}`;
}

test('Regression: SCN-031-001 complete shock admission preserves canonical provenance', () => {
  const policyResult = RLSHOCK.resolveResourcePolicy(productionConfig);
  const policy = unwrap(policyResult);
  assert.deepEqual(policy, makePolicy());
  assert.equal(policyResult.digest, digestFixture(policy));

  const bundle = makeSnapshot({ policy });
  const definition = unwrap(RLSHOCK.validateDefinition(bundle.definition, policy));
  const observationSet = unwrap(RLSHOCK.validateObservationSet(bundle.observationSet, definition, bundle.observationSet.generationCutoff));
  const adapterOutput = unwrap(RLSHOCK.validateAdapterOutput(bundle.adapterOutput, definition, policy));
  const composed = unwrap(RLSHOCK.composeSnapshot(definition, observationSet, adapterOutput, policy));
  const admitted = unwrap(RLSHOCK.validateSnapshot(composed, definition, policy));

  assert.equal(admitted.contractVersion, 'shock-transmission/v1');
  assert.equal(admitted.topicId, definition.topicId);
  assert.equal(admitted.resourcePolicyDigest, digestFixture(policy));
  assert.equal(admitted.definitionDigest, definition.definitionDigest);
  assert.equal(admitted.observationSetDigest, digestFixture(observationSet));
  const identityBody = clone(admitted);
  delete identityBody.snapshotId;
  delete identityBody.snapshotDigest;
  const expectedDigest = independentDigest(identityBody);
  assert.equal(admitted.snapshotDigest, expectedDigest);
  assert.equal(admitted.snapshotId, `shock-snapshot-${expectedDigest.slice(7)}`);
  assert.equal(RLSHOCK.canonicalize({ z: 2, a: { y: 4, b: 3 } }), RLSHOCK.canonicalize({ a: { b: 3, y: 4 }, z: 2 }));
  assert.equal(RLSHOCK.digest({ z: 2, a: 1 }), independentDigest({ a: 1, z: 2 }));
  assert.equal(Object.isFrozen(admitted), true);
  assert.equal(Object.isFrozen(admitted.shocks[0].affectedCapacity.range), true);

  for (const quantity of [admitted.shocks[0].affectedCapacity, admitted.shocks[0].observedLoss, admitted.shocks[0].uncertainty]) {
    assert.equal(quantity.sourceRefs.length, 1);
    assert.equal(quantity.evidenceRefs.length, 1);
    assert.match(quantity.asOf, /Z$/);
    assert.match(quantity.availableAt, /Z$/);
    assert.match(quantity.vintageId, /^vintage:/);
    assert.ok(['observed-fact', 'model-estimate'].includes(quantity.provenanceClass));
  }
});

test('Regression: SCN-031-002 every missing nested member returns its exact path', () => {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(productionConfig));
  const { definition, snapshot } = makeSnapshot({ policy });
  const definitionPaths = requiredMemberPaths(definition);
  const snapshotPaths = requiredMemberPaths(snapshot);
  assert.ok(definitionPaths.length >= 70, `definition path count ${definitionPaths.length}`);
  assert.ok(snapshotPaths.length >= 190, `snapshot path count ${snapshotPaths.length}`);

  for (const { fieldPath, parts } of definitionPaths) {
    const result = RLSHOCK.validateDefinition(deleteMember(definition, parts), policy);
    assertRefusal(result, 'RLSHOCK-MISSING-MEMBER', fieldPath);
  }
  for (const { fieldPath, parts } of snapshotPaths) {
    const result = RLSHOCK.validateSnapshot(deleteMember(snapshot, parts), definition, policy);
    assertRefusal(result, 'RLSHOCK-MISSING-MEMBER', fieldPath);
  }
});

test('Regression: SCN-031-003 unknown members fail closed and never project', () => {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(productionConfig));
  const { definition, snapshot } = makeSnapshot({ policy });
  const cases = [
    ['$.countrySpecificShortcut', (candidate) => { candidate.countrySpecificShortcut = 'forbidden'; }],
    ['$.shocks[0].commodity', (candidate) => { candidate.shocks[0].commodity = 'forbidden'; }],
    ['$.shocks[0].affectedCapacity.company', (candidate) => { candidate.shocks[0].affectedCapacity.company = 'forbidden'; }],
    ['$.graph.edges[0].countrySpecificShortcut', (candidate) => { candidate.graph.edges[0].countrySpecificShortcut = true; }],
    ['$.horizonRegistry[0].topicDefault', (candidate) => { candidate.horizonRegistry[0].topicDefault = true; }],
    ['$.baselineLeverValues["unexpected-lever"]', (candidate) => { candidate.baselineLeverValues['unexpected-lever'] = 0.5; }]
  ];
  for (const [fieldPath, mutate] of cases) {
    const candidate = clone(snapshot);
    mutate(candidate);
    const result = RLSHOCK.validateSnapshot(candidate, definition, policy);
    assertRefusal(result, 'RLSHOCK-UNKNOWN-MEMBER', fieldPath);
    assert.equal(Object.hasOwn(result, 'value'), false);
  }

  const definitionCandidate = clone(definition);
  definitionCandidate.policyActor = 'forbidden';
  assertRefusal(RLSHOCK.validateDefinition(definitionCandidate, policy), 'RLSHOCK-UNKNOWN-MEMBER', '$.policyActor');
});

test('Regression: SCN-031-004 observed and inferred claims retain distinct evidence contracts', () => {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(productionConfig));
  const { definition, snapshot } = makeSnapshot({ policy });
  const viewState = makeViewState(snapshot, definition);
  const rows = unwrap(RLSHOCK.projectClaimRows(viewState));

  assert.deepEqual(rows.map((row) => row.visibleLabel), ['Observed fact', 'Model inference']);
  assert.deepEqual(rows.map((row) => row.claimClass), ['observed-fact', 'model-inference']);
  assert.deepEqual(rows.map((row) => row.evidenceGrade), ['A', 'B']);
  assert.equal(rows[0].limitations.length, 0);
  assert.equal(rows[0].refuters.length, 0);
  assert.equal(rows[1].limitations.length, 1);
  assert.equal(rows[1].refuters.length, 1);
  assert.match(rows[1].evidenceBasis, /Model links/);
  assert.equal(Object.isFrozen(rows), true);
  assert.equal(Object.isFrozen(rows[1]), true);

  const missingLimitation = clone(viewState);
  missingLimitation.baseline.claims[1].limitations = [];
  assertRefusal(RLSHOCK.projectClaimRows(missingLimitation), 'RLSHOCK-EVIDENCE', '$.baseline.claims[1].limitations');
  const missingRefuter = clone(viewState);
  missingRefuter.baseline.claims[1].refuterConditionIds = [];
  assertRefusal(RLSHOCK.projectClaimRows(missingRefuter), 'RLSHOCK-EVIDENCE', '$.baseline.claims[1].refuterConditionIds');
});

test('Regression: SCN-031-007 ranges units and signs reject every boundary mismatch', () => {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(productionConfig));
  const { definition, snapshot } = makeSnapshot({ policy });
  assert.equal(RLSHOCK.validateSnapshot(snapshot, definition, policy).ok, true);

  const cases = [
    ['RLSHOCK-RANGE', '$.graph.edges[0].range.low', (candidate) => { candidate.graph.edges[0].range.low = Number.NaN; }],
    ['RLSHOCK-RANGE', '$.graph.edges[0].range.base', (candidate) => { candidate.graph.edges[0].range.base = -0.1; }],
    ['RLSHOCK-RANGE', '$.graph.edges[0].range.high', (candidate) => { candidate.graph.edges[0].range.high = 0.01; }],
    ['RLSHOCK-UNIT', '$.graph.edges[0].unitId', (candidate) => { candidate.graph.edges[0].unitId = 'undeclared-unit'; }],
    ['RLSHOCK-SIGN', '$.graph.edges[0].sign', (candidate) => { candidate.graph.edges[0].sign = 'negative'; }],
    ['RLSHOCK-SIGN', '$.graph.edges[0].sign', (candidate) => { candidate.graph.edges[0].sign = 'mixed'; }],
    ['RLSHOCK-SIGN', '$.graph.edges[0].sign', (candidate) => { candidate.graph.edges[0].sign = 'zero'; }]
  ];
  for (const [code, fieldPath, mutate] of cases) {
    const candidate = clone(snapshot);
    mutate(candidate);
    assertRefusal(RLSHOCK.validateSnapshot(candidate, definition, policy), code, fieldPath);
  }
});
