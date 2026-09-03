import { createHash } from 'node:crypto';

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function canonicalizeFixture(value) {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('fixture canonical value must be finite');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalizeFixture).join(',')}]`;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalizeFixture(value[key])}`).join(',')}}`;
  }
  throw new Error('unsupported fixture canonical value');
}

export function digestFixture(value) {
  return `sha256:${createHash('sha256').update(canonicalizeFixture(value), 'utf8').digest('hex')}`;
}

function withVersionId(prefix, value) {
  const body = clone(value);
  const versionId = `${prefix}-${digestFixture(body).slice(7)}`;
  return { ...body, versionId };
}

function quantity(range, provenanceClass = 'observed-fact') {
  return {
    state: 'current',
    range,
    unitId: 'fraction',
    provenanceClass,
    sourceRefs: ['source:public-neutral'],
    evidenceRefs: ['evidence:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    availableAt: '2026-08-31T12:05:00.000Z',
    vintageId: 'vintage:public-neutral',
    limitations: provenanceClass === 'model-estimate' ? ['Model range remains conditional on public evidence.'] : [],
    unavailableReason: null
  };
}

function horizonRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    horizonId: `horizon-${String(index + 1).padStart(3, '0')}`,
    label: `Horizon ${index + 1}`,
    order: index,
    durationBasis: 'calendar-day',
    startExclusive: index,
    endInclusive: index + 1,
    scenarioSetId: `scenario-set-${String(index + 1).padStart(3, '0')}`,
    calibrationPolicyId: `calibration-policy-${String(index + 1).padStart(3, '0')}`
  }));
}

export function makePolicy() {
  return {
    contractVersion: 'shock-transmission/resource-policy/v1',
    policyId: 'shock-transmission/resource-policy/v1',
    maxHorizonsPerDefinition: 48,
    maxGraphNodesPerSnapshot: 200
  };
}

export function makePolicyConfig() {
  return { 'shock-transmission/resource-policy/v1': makePolicy() };
}

export function makeDefinition({ horizonCount = 2, policy = makePolicy() } = {}) {
  const horizons = horizonRows(horizonCount);
  const definition = {
    contractVersion: 'shock-transmission/definition/v1',
    definitionId: 'definition:synthetic-neutral:v1',
    predecessorDefinitionDigest: null,
    topicId: 'synthetic-neutral-shock',
    adapterId: 'synthetic-neutral',
    adapterVersion: '1.0.0',
    resourcePolicyId: policy.policyId,
    resourcePolicyDigest: digestFixture(policy),
    unitRegistry: [
      { unitId: 'fraction', label: 'Fraction', dimension: 'fraction', symbol: '1' },
      { unitId: 'calendar-day', label: 'Calendar day', dimension: 'calendar-day', symbol: 'd' }
    ],
    horizonRegistry: horizons,
    leverRegistry: [{
      leverId: 'neutral-lever',
      label: 'Neutral evidence adjustment',
      description: 'Adjusts one synthetic public input for contract verification.',
      unitId: 'fraction',
      minimum: 0,
      maximum: 1,
      step: 0.05,
      baselinePath: '$.observations[0].quantity.range.base',
      targetIds: ['shock:neutral'],
      ownerAdapterId: 'synthetic-neutral'
    }],
    offsetKinds: [],
    actorRegistry: [{ actorId: 'actor:neutral-public', label: 'Neutral public actor', actorClass: 'other-public' }],
    policyLayerRegistry: [{ policyLayerId: 'physical-capacity', label: 'Physical capacity' }],
    scenarioSetRegistry: horizons.map((horizon) => ({
      scenarioSetId: horizon.scenarioSetId,
      label: `${horizon.label} states`,
      scenarioIds: ['scenario:base']
    })),
    calibrationPolicies: horizons.map((horizon) => ({
      calibrationPolicyId: horizon.calibrationPolicyId,
      outcomeRuleId: 'outcome-rule:neutral',
      minimumResolvedSample: 5
    })),
    stateDimensionRegistry: [],
    sourceRefs: ['source:definition-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: ['Synthetic public fixture for contract verification.']
  };
  definition.definitionDigest = digestFixture(definition);
  return definition;
}

export function makeObservationSet(definition = makeDefinition()) {
  return {
    contractVersion: 'shock-transmission/observation-set/v1',
    observationSetId: 'observation-set:synthetic-neutral:v1',
    topicId: definition.topicId,
    generationCutoff: '2026-08-31T12:10:00.000Z',
    asOf: '2026-08-31T12:00:00.000Z',
    availableAt: '2026-08-31T12:05:00.000Z',
    sourceRefs: ['source:public-neutral'],
    evidenceRefs: ['evidence:public-neutral'],
    observations: [{
      observationId: 'observation:neutral-capacity',
      state: 'current',
      quantity: quantity({ low: 0.18, base: 0.2, high: 0.22 }),
      sourceRefs: ['source:public-neutral'],
      evidenceRefs: ['evidence:public-neutral'],
      asOf: '2026-08-31T12:00:00.000Z',
      availableAt: '2026-08-31T12:05:00.000Z',
      limitations: []
    }],
    unavailableStates: [],
    limitations: []
  };
}

function makeTypedClaim(claimClass) {
  const inferred = claimClass === 'model-inference';
  return {
    claimId: inferred ? 'claim:neutral-inference' : 'claim:neutral-observation',
    claimClass,
    statement: inferred ? 'The supported path may transmit part of the observed loss.' : 'A public source observed reduced capacity.',
    evidenceGrade: inferred ? 'B' : 'A',
    evidenceBasis: inferred ? 'Model links source-qualified capacity to the supported edge.' : 'Direct public observation.',
    evidenceRefs: ['evidence:public-neutral'],
    sourceRefs: ['source:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: inferred ? ['The path depends on the declared transmission model.'] : [],
    refuterConditionIds: inferred ? ['condition:neutral-restoration'] : []
  };
}

export function makeAdapterOutput(definition = makeDefinition(), observationSet = makeObservationSet(definition), { nodeCount = 2 } = {}) {
  const restoration = withVersionId('restoration-version', {
    conditionId: 'condition:neutral-restoration',
    predecessorVersionId: null,
    ownerRef: 'actor:neutral-public',
    layer: 'physical-capacity',
    state: 'unmet',
    observationRule: 'Observed capacity returns to the public baseline.',
    evidenceRefs: ['evidence:public-neutral'],
    sourceRefs: ['source:public-neutral'],
    observedAt: null,
    limitations: ['The condition requires a later public observation.']
  });
  const shock = withVersionId('shock-version', {
    shockId: 'shock:neutral',
    predecessorVersionId: null,
    label: 'Synthetic public capacity shock',
    lifecycleState: 'observed',
    startAt: '2026-08-31T11:00:00.000Z',
    affectedCapacity: quantity({ low: 0.18, base: 0.2, high: 0.22 }),
    observedLoss: quantity({ low: 0.08, base: 0.1, high: 0.12 }),
    uncertainty: quantity({ low: 0.01, base: 0.02, high: 0.03 }, 'model-estimate'),
    repairConditionIds: [restoration.conditionId],
    sourceRefs: ['source:public-neutral'],
    evidenceRefs: ['evidence:public-neutral'],
    provenanceClass: 'observed-fact',
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: ['Synthetic public fixture only.']
  });
  const offset = withVersionId('offset-version', {
    offsetId: 'offset:neutral-inventory',
    predecessorVersionId: null,
    shockId: shock.shockId,
    kindId: 'inventory',
    lifecycleState: 'available',
    capacity: quantity({ low: 0.01, base: 0.02, high: 0.03 }),
    accessibleCapacity: quantity({ low: 0.005, base: 0.01, high: 0.015 }),
    lag: { value: 1, unitId: 'calendar-day' },
    expiryAt: '2026-09-07T12:00:00.000Z',
    requiredForNet: true,
    unknownCapacityUpperBound: null,
    sourceRefs: ['source:public-neutral'],
    evidenceRefs: ['evidence:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: ['Accessible capacity remains source-qualified.']
  });
  const observedClaim = makeTypedClaim('observed-fact');
  const inferredClaim = makeTypedClaim('model-inference');
  const reaction = withVersionId('reaction-version', {
    reactionId: 'reaction:neutral-public',
    predecessorVersionId: null,
    actorId: 'actor:neutral-public',
    lifecycleState: 'observed',
    observedBehavior: [observedClaim],
    statedIntent: [],
    inferredNextAction: [inferredClaim],
    constraints: [],
    falsifiers: [],
    evidenceRefs: ['evidence:public-neutral'],
    sourceRefs: ['source:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: ['Inference remains separate from observed behavior.']
  });
  const actor = {
    actorId: 'actor:neutral-public',
    label: 'Neutral public actor',
    actorClass: 'other-public',
    state: 'active',
    sourceRefs: ['source:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z'
  };
  const policyAction = withVersionId('policy-version', {
    policyActionId: 'policy-action:neutral-public',
    predecessorVersionId: null,
    ownerActorId: actor.actorId,
    lifecycleState: 'announced',
    triggerConditionIds: ['condition:neutral-trigger'],
    instrumentId: 'instrument:neutral-public',
    amountOrState: quantity({ low: 0, base: 0, high: 0 }),
    lag: { value: 1, unitId: 'calendar-day' },
    reversible: true,
    policyLayer: 'physical-capacity',
    effects: [{ dimension: 'physical-capacity', state: 'unavailable', quantity: null }],
    restorationConditionIds: [restoration.conditionId],
    evidenceRefs: ['evidence:public-neutral'],
    sourceRefs: ['source:public-neutral'],
    asOf: '2026-08-31T12:00:00.000Z',
    limitations: ['Announcement is not implementation.']
  });
  const count = Math.max(2, nodeCount);
  const nodes = Array.from({ length: count }, (_, index) => ({
    nodeId: index === 0 ? 'node:shock' : index === count - 1 ? 'node:outcome' : `node:state-${String(index).padStart(3, '0')}`,
    kind: index === 0 ? 'shock' : index === count - 1 ? 'outcome' : 'state',
    label: index === 0 ? 'Initiating shock' : index === count - 1 ? 'Bounded outcome' : `Intermediate state ${index}`,
    rank: index,
    horizonId: definition.horizonRegistry[0].horizonId,
    layer: 'physical-capacity',
    stateRef: index === 0 ? shock.shockId : `state:${String(index).padStart(3, '0')}`,
    ownerRef: actor.actorId
  }));
  const edge = withVersionId('edge-version', {
    edgeId: 'edge:neutral-path',
    predecessorVersionId: null,
    fromNodeId: nodes[0].nodeId,
    toNodeId: nodes[nodes.length - 1].nodeId,
    lifecycleState: 'supported',
    sign: 'positive',
    range: { low: 0.02, base: 0.04, high: 0.07 },
    unitId: 'fraction',
    lag: { value: 2, unitId: 'calendar-day' },
    persistence: { value: 0.75, unitId: 'fraction' },
    horizonIds: [definition.horizonRegistry[0].horizonId],
    evidenceRefs: ['evidence:public-neutral'],
    sourceRefs: ['source:public-neutral'],
    limitationRefs: ['limitation:neutral-model'],
    refuterConditionIds: [restoration.conditionId],
    modelOwnerRef: actor.actorId
  });
  const path = withVersionId('path-version', {
    pathId: 'path:neutral',
    predecessorVersionId: null,
    label: 'Neutral public transmission path',
    lifecycleState: 'active',
    edgeIds: [edge.edgeId],
    outcomeNodeId: nodes[nodes.length - 1].nodeId,
    conflictGroupId: null,
    limitations: ['The path remains bounded by public evidence.']
  });
  const finding = withVersionId('finding-version', {
    findingId: 'finding:neutral',
    predecessorVersionId: null,
    lifecycleState: 'current',
    claim: 'A source-qualified capacity shock has one supported bounded path.',
    publicSubjects: [{ kind: 'topic', value: definition.topicId }],
    horizonId: definition.horizonRegistry[0].horizonId,
    sourceRefs: ['source:public-neutral'],
    provenanceClass: 'model-estimate',
    evidenceRole: 'indirect',
    evidenceGrade: 'B',
    evidenceRefs: ['evidence:public-neutral'],
    pathIds: [path.pathId],
    causalPath: [nodes[0].nodeId, nodes[nodes.length - 1].nodeId],
    refutedBy: [restoration.conditionId],
    limitations: ['The path depends on the declared model.'],
    triggerConditionIds: ['condition:neutral-trigger'],
    invalidationConditionIds: [restoration.conditionId],
    state: 'current',
    asOf: '2026-08-31T12:00:00.000Z'
  });
  return {
    contractVersion: 'shock-transmission/adapter-output/v1',
    topicId: definition.topicId,
    adapterId: definition.adapterId,
    adapterVersion: definition.adapterVersion,
    availableAt: observationSet.availableAt,
    vintageId: 'vintage:public-neutral',
    state: 'current',
    predecessorSnapshotRef: null,
    shocks: [shock],
    offsets: [offset],
    actors: [actor],
    actorReactions: [reaction],
    policyActions: [policyAction],
    restorationConditions: [restoration],
    graph: { nodes, edges: [edge], paths: [path] },
    scenarioCurves: [],
    findings: [finding],
    baselineLeverValues: { 'neutral-lever': 0.2 },
    calibration: [],
    limitations: ['Synthetic public fixture only.']
  };
}

export function identifySnapshot(snapshotBody) {
  const body = clone(snapshotBody);
  delete body.snapshotId;
  delete body.snapshotDigest;
  const snapshotDigest = digestFixture(body);
  return {
    ...body,
    snapshotId: `shock-snapshot-${snapshotDigest.slice(7)}`,
    snapshotDigest
  };
}

export function makeSnapshot({ horizonCount = 2, nodeCount = 2, policy = makePolicy() } = {}) {
  const definition = makeDefinition({ horizonCount, policy });
  const observationSet = makeObservationSet(definition);
  const adapterOutput = makeAdapterOutput(definition, observationSet, { nodeCount });
  const body = {
    contractVersion: 'shock-transmission/v1',
    topicId: definition.topicId,
    adapterId: definition.adapterId,
    adapterVersion: definition.adapterVersion,
    resourcePolicyId: policy.policyId,
    resourcePolicyDigest: digestFixture(policy),
    definitionDigest: definition.definitionDigest,
    observationSetDigest: digestFixture(observationSet),
    asOf: observationSet.asOf,
    availableAt: adapterOutput.availableAt,
    vintageId: adapterOutput.vintageId,
    state: adapterOutput.state,
    predecessorSnapshotRef: adapterOutput.predecessorSnapshotRef,
    shocks: adapterOutput.shocks,
    offsets: adapterOutput.offsets,
    actors: adapterOutput.actors,
    actorReactions: adapterOutput.actorReactions,
    policyActions: adapterOutput.policyActions,
    restorationConditions: adapterOutput.restorationConditions,
    graph: adapterOutput.graph,
    scenarioCurves: adapterOutput.scenarioCurves,
    findings: adapterOutput.findings,
    horizonRegistry: definition.horizonRegistry,
    leverRegistry: definition.leverRegistry,
    baselineLeverValues: adapterOutput.baselineLeverValues,
    calibration: adapterOutput.calibration,
    limitations: adapterOutput.limitations
  };
  return { policy, definition, observationSet, adapterOutput, snapshot: identifySnapshot(body) };
}

export function makeViewState(snapshot, definition) {
  const claims = snapshot.actorReactions.flatMap((reaction) => reaction.observedBehavior.concat(reaction.inferredNextAction));
  const edge = snapshot.graph.edges[0];
  return {
    contractVersion: 'shock-transmission/view-state/v1',
    topicId: snapshot.topicId,
    snapshotId: snapshot.snapshotId,
    definitionDigest: definition.definitionDigest,
    selectedHorizonId: definition.horizonRegistry[0].horizonId,
    projectionClass: 'baseline',
    availability: 'current',
    reason: null,
    fieldPath: null,
    baseline: {
      claims,
      edges: [{
        edgeId: edge.edgeId,
        pathId: snapshot.graph.paths[0].pathId,
        order: 0,
        sign: edge.sign,
        unitId: edge.unitId,
        range: edge.range,
        lag: edge.lag,
        persistence: edge.persistence,
        evidenceRefs: edge.evidenceRefs,
        limitations: ['The path depends on the declared model.'],
        refuters: edge.refuterConditionIds
      }]
    },
    comparison: null,
    graph: snapshot.graph,
    orderedPaths: snapshot.graph.paths,
    policyRows: [],
    scenarioRows: [],
    calibrationRows: [],
    findings: snapshot.findings,
    ownerLinks: [],
    horizonRegistry: definition.horizonRegistry,
    horizonRegistryDigest: digestFixture(definition.horizonRegistry),
    leverRegistry: definition.leverRegistry,
    leverRegistryDigest: digestFixture(definition.leverRegistry),
    changedLeverIds: [],
    persistable: false
  };
}

function pathFor(parent, key) {
  if (typeof key === 'number') return `${parent}[${key}]`;
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
}

export function requiredMemberPaths(value, root = '$') {
  const paths = [];
  function visit(current, currentPath, parts) {
    if (Array.isArray(current)) {
      current.forEach((entry, index) => {
        if (entry && typeof entry === 'object') visit(entry, `${currentPath}[${index}]`, parts.concat(index));
      });
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const key of Object.keys(current)) {
      const fieldPath = pathFor(currentPath, key);
      const fieldParts = parts.concat(key);
      paths.push({ fieldPath, parts: fieldParts });
      visit(current[key], fieldPath, fieldParts);
    }
  }
  visit(value, root, []);
  return paths;
}

export function deleteMember(value, parts) {
  const candidate = clone(value);
  let target = candidate;
  for (let index = 0; index < parts.length - 1; index += 1) target = target[parts[index]];
  delete target[parts[parts.length - 1]];
  return candidate;
}
