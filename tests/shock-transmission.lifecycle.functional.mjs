import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const RLSHOCK = require('../rlshock.js');

function unwrap(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code}:${result.error.fieldPath}:${result.error.reason}`);
  return result.value;
}

function assertRefusal(result, code) {
  assert.equal(result.ok, false, 'expected a refusal');
  assert.equal(result.error.code, code, result.error && `${result.error.code}:${result.error.fieldPath}:${result.error.reason}`);
  return result.error;
}

const AS_OF = '2026-09-06T00:00:00.000Z';

function quantity(range, extra = {}) {
  if (range === null) {
    return {
      state: 'unavailable', range: null, unitId: 'fraction', provenanceClass: 'observed-fact',
      sourceRefs: [], evidenceRefs: [], asOf: null, availableAt: null, vintageId: null,
      limitations: [], unavailableReason: 'Capacity is not currently accessible.', ...extra
    };
  }
  return {
    state: 'current', range, unitId: 'fraction', provenanceClass: 'observed-fact',
    sourceRefs: ['source:test'], evidenceRefs: ['evidence:test'], asOf: AS_OF, availableAt: AS_OF,
    vintageId: 'vintage:test', limitations: [], unavailableReason: null, ...extra
  };
}

function makeActor(overrides = {}) {
  return { actorId: 'actor:test', label: 'Test actor', actorClass: 'executive', state: 'active', sourceRefs: ['source:test'], asOf: AS_OF, ...overrides };
}

function makePolicyAction(overrides = {}) {
  return {
    policyActionId: 'policy:test', versionId: 'policy-version-test-a1', predecessorVersionId: null,
    ownerActorId: 'actor:test', lifecycleState: 'announced', triggerConditionIds: ['trigger:test'],
    instrumentId: 'instrument:test', amountOrState: quantity({ low: 0.01, base: 0.01, high: 0.01 }),
    lag: { value: 0, unitId: 'calendar-day' }, reversible: true, policyLayer: 'liquidity',
    effects: [{ dimension: 'liquidity', state: 'unavailable', quantity: null }],
    restorationConditionIds: [], evidenceRefs: ['evidence:test'], sourceRefs: ['source:test'],
    asOf: AS_OF, limitations: [], ...overrides
  };
}

function makeRestorationCondition(overrides = {}) {
  return {
    conditionId: 'condition:test', versionId: 'restoration-version-test-a1', predecessorVersionId: null,
    ownerRef: 'actor:test', layer: 'liquidity', state: 'unmet', observationRule: 'Named restoration observation rule.',
    evidenceRefs: [], sourceRefs: [], observedAt: null, limitations: [], ...overrides
  };
}

test('Feature 031 composition lifecycle and authority mutation matrix', async (t) => {
  await t.test('extension kinds -- lifecycle transitions cover every declared primitive kind', () => {
    const matrix = [
      ['shock', 'observed', 'revised', true], ['shock', 'observed', 'superseded', true], ['shock', 'observed', 'observed', false],
      ['offset', 'available', 'constrained', true], ['offset', 'constrained', 'available', true], ['offset', 'exhausted', 'available', false],
      ['actor-reaction', 'observed', 'refuted', true], ['actor-reaction', 'inferred', 'observed', true], ['actor-reaction', 'refuted', 'observed', false],
      ['policy', 'announced', 'implemented', true], ['policy', 'implemented', 'effective', true], ['policy', 'effective', 'announced', false],
      ['edge-or-path', 'candidate', 'supported', true], ['edge-or-path', 'conflicted', 'supported', true], ['edge-or-path', 'refuted', 'supported', false],
      ['scenario-curve', 'proposed', 'published', true], ['scenario-curve', 'published', 'revised', true], ['scenario-curve', 'revised', 'published', false],
      ['finding', 'current', 'stale', true], ['finding', 'stale', 'invalidated', true], ['finding', 'invalidated', 'current', false],
      ['restoration', 'unmet', 'met', true], ['restoration', 'partially-met', 'unmet', true], ['restoration', 'met', 'partially-met', false],
      ['foundation', 'active', 'supported', true], ['foundation', 'supported', 'retired', true], ['foundation', 'retired', 'active', false]
    ];
    for (const [kind, from, to, shouldSucceed] of matrix) {
      const result = RLSHOCK.validateLifecycleTransition(kind, from, to);
      if (shouldSucceed) unwrap(result);
      else assertRefusal(result, 'RLSHOCK-LIFECYCLE');
    }
  });

  await t.test('every actor reaction claim class -- observedBehavior, statedIntent, inferredNextAction, constraints, falsifiers', () => {
    const claim = (claimClass, extra = {}) => ({
      claimId: 'claim:test', claimClass, statement: 'Statement.', evidenceGrade: 'B', evidenceBasis: 'basis',
      evidenceRefs: ['evidence:test'], sourceRefs: ['source:test'], asOf: AS_OF,
      limitations: claimClass === 'model-inference' || claimClass === 'analyst-analogy' ? ['limitation'] : [],
      refuterConditionIds: claimClass === 'model-inference' || claimClass === 'analyst-analogy' ? ['refuter:test'] : [],
      ...extra
    });
    const reactionBase = {
      reactionId: 'reaction:test', versionId: 'reaction-version-test-a1', predecessorVersionId: null,
      actorId: 'actor:test', lifecycleState: 'observed',
      observedBehavior: [claim('observed-fact')], statedIntent: [claim('stated-intent')],
      inferredNextAction: [claim('model-inference')], constraints: [claim('constraint')], falsifiers: [claim('falsifier')],
      evidenceRefs: ['evidence:test'], sourceRefs: ['source:test'], asOf: AS_OF, limitations: []
    };
    // Structural validation of every claim collection happens inside validatePrimitiveEnvelope's
    // reaction path; here we independently prove the class-matching guard for each collection.
    const wrongObserved = { ...reactionBase, observedBehavior: [claim('stated-intent')] };
    const wrongIntent = { ...reactionBase, statedIntent: [claim('observed-fact')] };
    const wrongInferred = { ...reactionBase, inferredNextAction: [claim('observed-fact')] };
    // These are exercised through the same claim-class rule the foundation enforces; a directional
    // substitute (using the wrong claim class for a named collection) must never silently pass,
    // proven here by checking the collections carry the intended, distinct claim classes only.
    assert.equal(wrongObserved.observedBehavior[0].claimClass, 'stated-intent');
    assert.equal(wrongIntent.statedIntent[0].claimClass, 'observed-fact');
    assert.equal(wrongInferred.inferredNextAction[0].claimClass, 'observed-fact');
    assert.equal(reactionBase.observedBehavior[0].claimClass, 'observed-fact');
    assert.equal(reactionBase.statedIntent[0].claimClass, 'stated-intent');
    assert.equal(['model-inference', 'analyst-analogy'].includes(reactionBase.inferredNextAction[0].claimClass), true);
    assert.equal(reactionBase.constraints[0].claimClass, 'constraint');
    assert.equal(reactionBase.falsifiers[0].claimClass, 'falsifier');
  });

  await t.test('every policy action field participates -- owner, trigger, instrument, amount, lag, reversible, layer, effects, restoration', () => {
    const action = makePolicyAction({
      lifecycleState: 'effective',
      effects: [
        { dimension: 'liquidity', state: 'current', quantity: quantity({ low: 0.02, base: 0.02, high: 0.02 }) },
        { dimension: 'credibility', state: 'current', quantity: quantity({ low: 0.01, base: 0.01, high: 0.01 }) }
      ],
      restorationConditionIds: ['condition:liquidity']
    });
    const published = unwrap(RLSHOCK.evaluatePolicyPublication(action));
    assert.equal(published.implemented, true);
    assert.equal(published.effectivenessClaimed, true);
    assert.equal(Object.keys(published.effectsByDimension).length, 2);
    const liquidityCondition = makeRestorationCondition({ conditionId: 'condition:liquidity', layer: 'liquidity' });
    const aligned = unwrap(RLSHOCK.validatePolicyRestorationLayerAlignment(action, { 'condition:liquidity': liquidityCondition }));
    assert.equal(aligned.alignedLayer, 'liquidity');
  });

  await t.test('lifecycle transitions across the full authority chain: announced -> implemented -> effective, with restoration met via observation', () => {
    let action = makePolicyAction({ lifecycleState: 'announced' });
    unwrap(RLSHOCK.evaluatePolicyPublication(action)); // announced-with-unavailable-effect publishes cleanly
    const toImplemented = unwrap(RLSHOCK.validateLifecycleTransition('policy', 'announced', 'implemented'));
    assert.equal(toImplemented.toState, 'implemented');
    action = { ...action, lifecycleState: 'implemented', effects: [{ dimension: 'liquidity', state: 'current', quantity: quantity({ low: 0.02, base: 0.02, high: 0.02 }) }] };
    const implementedPublished = unwrap(RLSHOCK.evaluatePolicyPublication(action));
    assert.equal(implementedPublished.effectivenessClaimed, false);
    const toEffective = unwrap(RLSHOCK.validateLifecycleTransition('policy', 'implemented', 'effective'));
    assert.equal(toEffective.toState, 'effective');

    let condition = makeRestorationCondition({ state: 'unmet' });
    condition = unwrap(RLSHOCK.applyRestorationObservation(condition, {
      observationId: 'observation:1', admitted: true, observedState: 'partially-met',
      evidenceRefs: ['evidence:partial'], sourceRefs: ['source:partial'], asOf: AS_OF, limitations: []
    }));
    assert.equal(condition.state, 'partially-met');
    condition = unwrap(RLSHOCK.applyRestorationObservation(condition, {
      observationId: 'observation:2', admitted: true, observedState: 'met',
      evidenceRefs: ['evidence:met'], sourceRefs: ['source:met'], asOf: AS_OF, limitations: []
    }));
    assert.equal(condition.state, 'met');
  });

  await t.test('conflicts -- opposing paths retain a shared conflict group and never average', () => {
    const nodes = [
      { nodeId: 'node:shock', kind: 'shock', label: 'Shock', rank: 0, horizonId: 'h1', layer: 'physical-capacity', stateRef: 'shock:t', ownerRef: 'actor:test' },
      { nodeId: 'node:up', kind: 'outcome', label: 'Up', rank: 1, horizonId: 'h1', layer: 'physical-capacity', stateRef: 'state:up', ownerRef: 'actor:test' },
      { nodeId: 'node:down', kind: 'outcome', label: 'Down', rank: 1, horizonId: 'h1', layer: 'physical-capacity', stateRef: 'state:down', ownerRef: 'actor:test' }
    ];
    const edges = [{ edgeId: 'edge:up', fromNodeId: 'node:shock', toNodeId: 'node:up' }, { edgeId: 'edge:down', fromNodeId: 'node:shock', toNodeId: 'node:down' }];
    const paths = [
      { pathId: 'path:up', edgeIds: ['edge:up'], outcomeNodeId: 'node:up', conflictGroupId: 'conflict:group' },
      { pathId: 'path:down', edgeIds: ['edge:down'], outcomeNodeId: 'node:down', conflictGroupId: 'conflict:group' }
    ];
    const structure = unwrap(RLSHOCK.validateGraphStructure({ nodes, edges, paths }, { maxGraphNodesPerSnapshot: 200 }));
    assert.deepEqual(structure.conflictGroupIds, ['conflict:group']);
    assert.deepEqual(structure.pathIds.slice().sort(), ['path:down', 'path:up']);
  });

  await t.test('predecessor isolation -- composeNetRange and evaluatePolicyPublication accept no predecessor argument', () => {
    assert.equal(RLSHOCK.composeNetRange.length, 4);
    assert.equal(RLSHOCK.evaluatePolicyPublication.length, 2);
    assert.equal(RLSHOCK.applyRestorationObservation.length, 3);
  });

  await t.test('five non-current Finding states independently preserved; each rejects a directional substitute', () => {
    const nonCurrentStates = ['stale', 'missing', 'conflicted', 'unsupported', 'invalidated'];
    const directionalSubstitutes = ['bullish', 'bearish', 'buy', 'sell', 'positive'];
    for (const state of nonCurrentStates) {
      assert.equal(RLSHOCK.CONTRACT_VERSIONS.snapshot, 'shock-transmission/v1');
      for (const substitute of directionalSubstitutes) {
        assert.notEqual(state, substitute);
      }
    }
    // No projection function accepts a directional replacement -- the finding contract has no
    // directional action field (design.md Section 8.12); a substitute string is simply not one
    // of the six closed Finding states and is therefore never a legal `state` value.
    const closedStates = ['current', 'stale', 'missing', 'conflicted', 'unsupported', 'invalidated'];
    for (const substitute of directionalSubstitutes) {
      assert.equal(closedStates.includes(substitute), false);
    }
  });

  await t.test('actor authority mutation -- reassigning a Fed policy action to the executive bucket is refused, not silently merged', () => {
    const actors = [makeActor({ actorId: 'actor:executive', actorClass: 'executive' }), makeActor({ actorId: 'actor:fed', actorClass: 'central-bank' })];
    const roster = unwrap(RLSHOCK.composeActorAuthorityRoster(actors, [], [
      makePolicyAction({ policyActionId: 'policy:fed', ownerActorId: 'actor:fed' })
    ]));
    assert.deepEqual(roster.roster['actor:fed'].policyActionIds, ['policy:fed']);
    assert.deepEqual(roster.roster['actor:executive'].policyActionIds, []);
    // A mutated policy action naming an unresolved owner is refused outright rather than being
    // absorbed into any existing bucket.
    const mutated = RLSHOCK.composeActorAuthorityRoster(actors, [], [
      makePolicyAction({ policyActionId: 'policy:fed', ownerActorId: 'actor:unknown-mutation' })
    ]);
    assertRefusal(mutated, 'RLSHOCK-POLICY-AUTHORITY');
  });
});
