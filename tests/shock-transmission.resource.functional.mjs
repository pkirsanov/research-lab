import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

import { clone, makeDefinition, makeSnapshot } from './fixtures/shock-transmission/foundation-fixture.mjs';

const require = createRequire(import.meta.url);
const RLSHOCK = require('../rlshock.js');
const config = JSON.parse(readFileSync(new URL('../market-brief.config.json', import.meta.url), 'utf8'));

function unwrap(result) {
  assert.equal(result.ok, true, result.error && JSON.stringify(result.error));
  return result.value;
}

function assertResource(result, fieldPath) {
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'RLSHOCK-RESOURCE');
  assert.equal(result.error.fieldPath, fieldPath);
  assert.equal(result.error.valueEchoed, false);
}

test('Feature 031 resource policy enforces horizon and graph boundaries', () => {
  const policyResult = RLSHOCK.resolveResourcePolicy(config);
  const policy = unwrap(policyResult);
  assert.deepEqual(Object.keys(policy).sort(), [
    'contractVersion',
    'policyId',
    'maxHorizonsPerDefinition',
    'maxGraphNodesPerSnapshot'
  ].sort());
  assert.equal(policy.maxHorizonsPerDefinition, 48);
  assert.equal(policy.maxGraphNodesPerSnapshot, 200);
  assert.match(policyResult.digest, /^sha256:[a-f0-9]{64}$/);

  for (const count of [47, 48]) {
    const definition = makeDefinition({ horizonCount: count, policy });
    assert.equal(RLSHOCK.validateDefinition(definition, policy).ok, true, `horizons=${count}`);
  }
  const tooManyHorizons = makeDefinition({ horizonCount: 49, policy });
  tooManyHorizons.horizonRegistry[48] = { malformed: true };
  assertResource(RLSHOCK.validateDefinition(tooManyHorizons, policy), '$.horizonRegistry[48]');

  for (const count of [199, 200]) {
    const { definition, snapshot } = makeSnapshot({ horizonCount: 1, nodeCount: count, policy });
    assert.equal(RLSHOCK.validateSnapshot(snapshot, definition, policy).ok, true, `nodes=${count}`);
  }
  const oversized = makeSnapshot({ horizonCount: 1, nodeCount: 201, policy });
  oversized.snapshot.graph.nodes[200] = { malformed: true };
  assertResource(RLSHOCK.validateSnapshot(oversized.snapshot, oversized.definition, policy), '$.graph.nodes[200]');

  const missingPolicy = clone(config);
  delete missingPolicy['shock-transmission/resource-policy/v1'].maxHorizonsPerDefinition;
  const missing = RLSHOCK.resolveResourcePolicy(missingPolicy);
  assert.equal(missing.error.code, 'RLSHOCK-MISSING-MEMBER');
  assert.equal(missing.error.fieldPath, '$["shock-transmission/resource-policy/v1"].maxHorizonsPerDefinition');

  const extraPolicy = clone(config);
  extraPolicy['shock-transmission/resource-policy/v1'].fallbackLimit = 48;
  const extra = RLSHOCK.resolveResourcePolicy(extraPolicy);
  assert.equal(extra.error.code, 'RLSHOCK-UNKNOWN-MEMBER');
  assert.equal(extra.error.fieldPath, '$["shock-transmission/resource-policy/v1"].fallbackLimit');
});
