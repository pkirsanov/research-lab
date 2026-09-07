import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { makeDefinition, makePolicy } from './fixtures/shock-transmission/foundation-fixture.mjs';

const require = createRequire(import.meta.url);
const RLSHOCK = require('../rlshock.js');

function unwrap(result) {
  assert.equal(result.ok, true, result.error && JSON.stringify(result.error));
  return result.value;
}

test("Regression: SCN-031-014 definitions retain independent ordered horizons", () => {
  const policy = makePolicy();
  const definitionA = makeDefinition({ horizonCount: 1, policy });
  const definitionB = makeDefinition({ horizonCount: 3, policy });

  assert.equal(RLSHOCK.validateDefinition(definitionA, policy).ok, true);
  assert.equal(RLSHOCK.validateDefinition(definitionB, policy).ok, true);

  const registriesA = unwrap(RLSHOCK.resolveDefinitionRegistries(definitionA));
  const registriesB = unwrap(RLSHOCK.resolveDefinitionRegistries(definitionB));

  // Definition A keeps exactly its own single declared horizon, unchanged.
  assert.deepEqual(registriesA.horizonRegistry, definitionA.horizonRegistry);
  assert.equal(registriesA.horizonRegistry.length, 1);

  // Definition B keeps exactly its own three declared horizons, in declared order, with no
  // coercion toward the legacy structural/swing/tactical labels.
  assert.deepEqual(registriesB.horizonRegistry, definitionB.horizonRegistry);
  assert.equal(registriesB.horizonRegistry.length, 3);
  registriesB.horizonRegistry.forEach((horizon, index) => {
    assert.equal(horizon.order, index);
    assert.equal(horizon.horizonId, definitionB.horizonRegistry[index].horizonId);
    assert.equal(horizon.label, definitionB.horizonRegistry[index].label);
    assert.equal(horizon.durationBasis, definitionB.horizonRegistry[index].durationBasis);
    assert.equal(horizon.startExclusive, definitionB.horizonRegistry[index].startExclusive);
    assert.equal(horizon.endInclusive, definitionB.horizonRegistry[index].endInclusive);
    assert.equal(['structural', 'swing', 'tactical'].includes(horizon.horizonId), false);
  });

  // The two definitions' resolved registries are mutually independent: neither leaks the other's
  // horizon count, ids, or digest.
  assert.notEqual(registriesA.horizonRegistry.length, registriesB.horizonRegistry.length);
  assert.notEqual(registriesA.horizonRegistryDigest, registriesB.horizonRegistryDigest);
  assert.notEqual(registriesA.definitionDigest, registriesB.definitionDigest);

  // The returned registries are frozen and independent from the source definition's own arrays.
  assert.equal(Object.isFrozen(registriesA.horizonRegistry), true);
  assert.equal(Object.isFrozen(registriesA.horizonRegistry[0]), true);
  assert.notEqual(registriesA.horizonRegistry, definitionA.horizonRegistry);
});
