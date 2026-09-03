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

function assertRefusal(result, code, fieldPath) {
  assert.equal(result.ok, false);
  assert.equal(result.error.code, code);
  assert.equal(result.error.fieldPath, fieldPath);
  assert.equal(result.error.valueEchoed, false);
  assert.equal(Object.hasOwn(result.error, 'value'), false);
}

test('Feature 031 exact refusal and canonical traversal matrix', () => {
  const policy = unwrap(RLSHOCK.resolveResourcePolicy(config));
  const { definition, adapterOutput, snapshot } = makeSnapshot({ policy });
  const cases = [
    ['missing', 'RLSHOCK-MISSING-MEMBER', '$.shocks[0].sourceRefs', (candidate) => { delete candidate.shocks[0].sourceRefs; }],
    ['unknown', 'RLSHOCK-UNKNOWN-MEMBER', '$.graph.edges[0].topicShortcut', (candidate) => { candidate.graph.edges[0].topicShortcut = true; }],
    ['malformed', 'RLSHOCK-TIME', '$.shocks[0].asOf', (candidate) => { candidate.shocks[0].asOf = 'not-an-instant'; }],
    ['duplicate', 'RLSHOCK-DUPLICATE', '$.findings[0].sourceRefs[1]', (candidate) => { candidate.findings[0].sourceRefs.push(candidate.findings[0].sourceRefs[0]); }],
    ['incompatible', 'RLSHOCK-DIGEST', '$.resourcePolicyDigest', (candidate) => { candidate.resourcePolicyDigest = 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; }],
    ['private', 'RLSHOCK-PUBLIC-PRIVATE', '$.findings[0].positionSize', (candidate) => { candidate.findings[0].positionSize = 918273.645; }],
    ['hypothetical persistence', 'RLSHOCK-UNKNOWN-MEMBER', '$.localHypothetical', (candidate) => { candidate.localHypothetical = { persistable: true }; }],
    ['unaccounted required offset', 'RLSHOCK-TYPE', '$.offsets[0].accessibleCapacity', (candidate) => { candidate.offsets[0].accessibleCapacity = null; }],
    ['actor authority', 'RLSHOCK-POLICY-AUTHORITY', '$.policyActions[0].ownerActorId', (candidate) => { candidate.policyActions[0].ownerActorId = 'actor:undeclared'; }]
  ];
  for (const [label, code, fieldPath, mutate] of cases) {
    const candidate = clone(snapshot);
    mutate(candidate);
    const first = RLSHOCK.validateSnapshot(candidate, definition, policy);
    const second = RLSHOCK.validateSnapshot(candidate, definition, policy);
    assertRefusal(first, code, fieldPath);
    assert.deepEqual(second, first, label);
  }

  const malformedAdapterOutput = clone(adapterOutput);
  delete malformedAdapterOutput.graph.nodes;
  assertRefusal(
    RLSHOCK.validateAdapterOutput(malformedAdapterOutput, definition, policy),
    'RLSHOCK-MISSING-MEMBER',
    '$.graph.nodes'
  );

  for (const state of ['stale', 'conflicted']) {
    const stateCandidate = clone(adapterOutput);
    stateCandidate.state = state;
    const stateResult = RLSHOCK.validateAdapterOutput(stateCandidate, definition, policy);
    assert.equal(stateResult.ok, true, state);
    assert.equal(stateResult.value.state, state);
  }
  const invalidState = clone(adapterOutput);
  invalidState.state = 'directional';
  assertRefusal(RLSHOCK.validateAdapterOutput(invalidState, definition, policy), 'RLSHOCK-LIFECYCLE', '$.state');

  const viewState = makeViewState(snapshot, definition);
  delete viewState.baseline.edges[0].limitations;
  assertRefusal(RLSHOCK.projectEdgeRows(viewState), 'RLSHOCK-PROJECTION-LOSSY', '$.baseline.edges[0].limitations');

  const source = readFileSync(new URL('../rlshock.js', import.meta.url), 'utf8');
  for (const forbidden of ['geopolitical-supply-shock', 'food-inputs-outlook', 'financial-intermediation', 'Iran']) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.equal(source.includes('positionSize'), true);
  assert.equal(source.includes('valueEchoed: false'), true);
});
