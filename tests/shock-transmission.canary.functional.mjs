import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const START = '/* ---------- Feature 031 shock-transmission foundation (START) ---------- */';
const END = '/* ---------- Feature 031 shock-transmission foundation (END) ---------- */';
const BASELINE_SELFTEST_SHA256 = '6aa3964641cdb099fda27d85a64555567e2505c63f0d7b615c39cf2f38ea0cd6';

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

test('Feature 031 foundation canary preserves the registered selftest inventory', () => {
  const source = readFileSync(new URL('../scripts/selftest.mjs', import.meta.url), 'utf8');
  const start = source.indexOf(START);
  const end = source.indexOf(END);
  assert.ok(start >= 0, 'Feature 031 selftest sentinel start must exist');
  assert.ok(end > start, 'Feature 031 selftest sentinel end must follow start');
  assert.equal(source.indexOf(START, start + START.length), -1);
  assert.equal(source.indexOf(END, end + END.length), -1);
  const afterEnd = end + END.length;
  assert.equal(source[afterEnd], '\n');
  const withoutSentinel = source.slice(0, start) + source.slice(afterEnd + 1);
  assert.equal(sha256(withoutSentinel), BASELINE_SELFTEST_SHA256);
  assert.equal((source.match(/group\('Feature 031 shock-transmission foundation'\)/g) || []).length, 1);
  assert.ok(source.indexOf("group('Feature 031 shock-transmission foundation')") < source.indexOf('/* ---------- summary ---------- */'));

  const prior = globalThis.RLSHOCK;
  const sentinel = Object.freeze({ owner: 'scope-01-canary' });
  globalThis.RLSHOCK = sentinel;
  delete require.cache[require.resolve('../rlshock.js')];
  const commonJsApi = require('../rlshock.js');
  assert.equal(globalThis.RLSHOCK, sentinel);
  assert.equal(Object.isFrozen(commonJsApi), true);
  if (prior === undefined) delete globalThis.RLSHOCK;
  else globalThis.RLSHOCK = prior;

  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../rlshock.js', import.meta.url), 'utf8'), context, { filename: 'rlshock.js' });
  assert.equal(Object.isFrozen(context.RLSHOCK), true);
  assert.equal(vm.runInContext('RLSHOCK.digest({ b: 2, a: 1 })', context), commonJsApi.digest({ a: 1, b: 2 }));
  assert.equal(context.fetch, undefined);
  assert.equal(context.document, undefined);
});

/* Scope 2 TP-02-10: the composition canary executes production composition and
   lifecycle paths (offset composition, DAG structural validation, actor authority
   roster, policy publication, restoration evidence gating, and lifecycle
   transitions) directly against the frozen production export, before the full
   repository selftest runs. */

test('Feature 031 composition canary preserves the registered selftest inventory', () => {
  delete require.cache[require.resolve('../rlshock.js')];
  const RLSHOCK = require('../rlshock.js');
  assert.equal(Object.isFrozen(RLSHOCK), true);

  function unwrap(result) {
    assert.equal(result.ok, true, result.error && `${result.error.code}:${result.error.fieldPath}:${result.error.reason}`);
    return result.value;
  }
  function assertRefusal(result, code) {
    assert.equal(result.ok, false, 'expected a refusal');
    assert.equal(result.error.code, code, result.error && `${result.error.code}:${result.error.fieldPath}:${result.error.reason}`);
  }

  // Offset composition: gross loss is never copied into net.
  const gross = { low: 0.1, base: 0.15, high: 0.2 };
  const offset = {
    offsetId: 'offset:canary', versionId: 'offset-version-canary', shockId: 'shock:canary', kindId: 'inventory',
    lifecycleState: 'available',
    capacity: { state: 'current', range: { low: 0.02, base: 0.02, high: 0.02 }, unitId: 'fraction', provenanceClass: 'observed-fact', sourceRefs: ['s'], evidenceRefs: ['e'], asOf: '2026-09-01T00:00:00.000Z', availableAt: '2026-09-01T00:00:00.000Z', vintageId: 'v1', limitations: [], unavailableReason: null },
    accessibleCapacity: { state: 'current', range: { low: 0.02, base: 0.02, high: 0.02 }, unitId: 'fraction', provenanceClass: 'observed-fact', sourceRefs: ['s'], evidenceRefs: ['e'], asOf: '2026-09-01T00:00:00.000Z', availableAt: '2026-09-01T00:00:00.000Z', vintageId: 'v1', limitations: [], unavailableReason: null },
    lag: { value: 0, unitId: 'calendar-day' }, expiryAt: null, requiredForNet: false, unknownCapacityUpperBound: null
  };
  const net = unwrap(RLSHOCK.composeNetRange(gross, [offset], '2026-09-02T00:00:00.000Z', null));
  assert.notEqual(net.range.base, gross.base);

  // DAG structural validation: a cycle is refused with the exact code.
  const cyclicNodes = [
    { nodeId: 'node:a', kind: 'shock', label: 'A', rank: 0, horizonId: 'h1', layer: 'liquidity', stateRef: 's:a', ownerRef: 'actor:canary' },
    { nodeId: 'node:b', kind: 'state', label: 'B', rank: 1, horizonId: 'h1', layer: 'liquidity', stateRef: 's:b', ownerRef: 'actor:canary' }
  ];
  assertRefusal(RLSHOCK.validateGraphStructure({ nodes: cyclicNodes, edges: [{ edgeId: 'e1', fromNodeId: 'node:b', toNodeId: 'node:a' }], paths: [] }, { maxGraphNodesPerSnapshot: 200 }), 'RLSHOCK-GRAPH-CYCLE');

  // Actor authority roster: the five canonical roles partition strictly by actor id.
  const actors = ['executive', 'finance-ministry', 'resource-agency', 'central-bank', 'legislature'].map((cls) => ({
    actorId: `actor:${cls}`, label: cls, actorClass: cls, state: 'active', sourceRefs: ['s'], asOf: '2026-09-01T00:00:00.000Z'
  }));
  const roster = unwrap(RLSHOCK.composeActorAuthorityRoster(actors, [], [
    { policyActionId: 'policy:fed-canary', ownerActorId: 'actor:central-bank' },
    { policyActionId: 'policy:exec-canary', ownerActorId: 'actor:executive' }
  ]));
  assert.deepEqual(roster.roster['actor:central-bank'].policyActionIds, ['policy:fed-canary']);
  assert.equal(roster.roster['actor:executive'].policyActionIds.includes('policy:fed-canary'), false);

  // Policy publication: announced cannot publish a current effect.
  assertRefusal(RLSHOCK.evaluatePolicyPublication({
    policyActionId: 'policy:canary', lifecycleState: 'announced', policyLayer: 'liquidity',
    effects: [{ dimension: 'liquidity', state: 'current', quantity: null }]
  }), 'RLSHOCK-LIFECYCLE');

  // Restoration evidence gating: no observation means no movement toward met.
  const condition = {
    conditionId: 'condition:canary', versionId: 'restoration-version-canary', predecessorVersionId: null,
    ownerRef: 'actor:canary', layer: 'liquidity', state: 'unmet', observationRule: 'Named rule.',
    evidenceRefs: [], sourceRefs: [], observedAt: null, limitations: []
  };
  const unchanged = unwrap(RLSHOCK.applyRestorationObservation(condition, null));
  assert.equal(unchanged.state, 'unmet');

  // Lifecycle transitions: table-driven, both an allowed and a rejected move.
  assert.equal(unwrap(RLSHOCK.validateLifecycleTransition('policy', 'announced', 'implemented')).toState, 'implemented');
  assertRefusal(RLSHOCK.validateLifecycleTransition('policy', 'announced', 'effective'), 'RLSHOCK-LIFECYCLE');
});
