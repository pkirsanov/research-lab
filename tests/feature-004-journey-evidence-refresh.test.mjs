import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const runtimePath = new URL('../rljourney.js', import.meta.url).pathname;

function loadRuntime() {
  delete require.cache[require.resolve(runtimePath)];
  return require(runtimePath);
}

const RJ = loadRuntime();

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath} ${result.error.reason}`);
  return result.value;
}

function requireError(result, code) {
  assert.equal(result.ok, false, 'expected a closed Journey refusal');
  assert.equal(result.error.code, code, `${result.error.fieldPath} ${result.error.reason}`);
  return result.error;
}

function clone(value) {
  return structuredClone(value);
}

function semanticRef(requirementId, fingerprintCharacter, occurrence = '2026-08-03T12:00:00.000Z') {
  return {
    requirementId,
    evidenceRef: `owner:${requirementId}`,
    semanticFingerprint: `sha256:${fingerprintCharacter.repeat(64)}`,
    sourceClass: 'owner-evidence',
    valueState: 'ready',
    observedAsOf: '2026-08-03T11:00:00.000Z',
    retrievedOrPublishedAt: occurrence,
    freshness: 'fresh',
    dataTier: 'public'
  };
}

const BASE_REFS = Object.freeze([
  semanticRef('control:objective', '1'),
  semanticRef('owner:currency-decision', '2'),
  semanticRef('owner:vehicle-fit', '3'),
  semanticRef('vehicle:tracking', '4'),
  semanticRef('owner:unrelated', '5')
]);

function refsWith(changes = {}) {
  return BASE_REFS.map((reference) => {
    const next = clone(reference);
    if (changes[reference.requirementId]) {
      Object.assign(next, changes[reference.requirementId]);
    }
    return next;
  });
}

function makeDefinition() {
  const definitionId = 'journey/feature-004/semantic-refresh/v1';
  const definition = {
    contractVersion: 'journey-definition/v1',
    definitionId,
    definitionVersion: '1.0.0',
    toolId: 'feature-004-test',
    goalId: 'semantic-refresh',
    title: 'Semantic evidence refresh',
    outcomeDescription: 'Exercise generic Journey evidence refresh.',
    mechanism: 'wizard',
    prerequisiteRules: [{ ruleId: 'current', predicate: 'all-required-evidence-current' }],
    contextSchema: {
      contractVersion: 'journey-context-schema/v1',
      allowedFields: ['ownerDecisionId', 'evidenceIdentity', 'objective', 'sessionNote'],
      requiredFields: ['ownerDecisionId', 'evidenceIdentity', 'objective', 'sessionNote']
    },
    stepIds: ['objective', 'currency', 'fit', 'tracking', 'unrelated'],
    evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence'] },
    backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
    staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
    completionPolicy: { predicates: ['all-required-evidence-current'], outcomes: ['complete', 'partial', 'refused'] },
    packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true },
    privacyClass: 'public-safe',
    noExecution: true,
    accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
    limitations: ['Research only.'],
    definitionFingerprint: null
  };
  const step = (stepId, dependsOnStepIds, staleWhen) => ({
    contractVersion: 'journey-step/v1',
    stepId,
    definitionId,
    title: stepId,
    purpose: `Review ${stepId}.`,
    mechanismRole: 'wizard',
    dependsOnStepIds,
    inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: ['choice'] },
    allowedInputProvenance: ['user-assumption'],
    requiredEvidenceSlots: ['owner-evidence'],
    optionalEvidenceSlots: [],
    completionPredicate: 'all-required-evidence-current',
    branchRules: [],
    staleWhen,
    invalidatesStepIds: [],
    ownerDeepLinks: ['feature-004-test.html#journey'],
    sideEffectPolicy: 'none',
    accessibility: { label: stepId, description: `Review ${stepId}.` },
    stepFingerprint: null
  });
  return {
    definition,
    steps: [
      step('objective', [], ['control:objective']),
      step('currency', ['objective'], ['owner:currency-decision']),
      step('fit', ['currency'], ['owner:vehicle-fit']),
      step('tracking', ['fit'], ['vehicle:tracking']),
      step('unrelated', [], ['owner:unrelated'])
    ]
  };
}

function completeSteps(session, stepIds) {
  let current = session;
  for (const stepId of stepIds) {
    current = requireValue(RJ.completeStep(current, stepId, {
      input: { choice: `${stepId}-choice` },
      evidence: [{ slot: 'owner-evidence', ref: `owner:${stepId}`, provenance: 'owner-evidence' }],
      conclusion: { result: `${stepId}-outcome` },
      completedAt: '2026-08-03T12:30:00.000Z'
    }));
  }
  return current;
}

function completedSession() {
  const source = makeDefinition();
  const compiled = requireValue(RJ.compileDefinition(source.definition, source.steps));
  const context = {
    ownerDecisionId: 'owner-decision-stable-across-refresh',
    evidenceIdentity: 'owner-evidence-v1',
    objective: 'review-wrapper-fit',
    sessionNote: 'retain explicit session context'
  };
  const created = requireValue(RJ.createSession(compiled, {
    sessionId: 'session/feature-004/semantic-refresh',
    createdAt: '2026-08-03T12:00:00.000Z',
    context,
    semanticEvidenceRefs: clone(BASE_REFS)
  }));
  const completed = completeSteps(created, compiled.order);
  const packet = requireValue(RJ.buildCompletionPacket(completed, {
    outcome: 'complete',
    signoff: { reviewer: 'independent-reviewer', decision: 'accept-research-process' }
  }));
  return { compiled, context, completed, packet };
}

function assertCleared(record) {
  assert.deepEqual(record.evidence, []);
  assert.equal(record.conclusion, null);
  assert.equal(record.completedAt, null);
}

function assertNoForbiddenPacketKeys(value) {
  const forbidden = ['order', 'portfolio', 'holding', 'account', 'credential'];
  const visit = (current) => {
    if (!current || typeof current !== 'object') return;
    for (const [key, nested] of Object.entries(current)) {
      const lowered = key.toLowerCase();
      assert.equal(forbidden.some((token) => lowered.includes(token)), false, `forbidden packet field: ${key}`);
      visit(nested);
    }
  };
  visit(value);
}

test('RLJOURNEY evidence refresh reopens only semantic dependents and preserves no execution', async (t) => {
  assert.equal(typeof RJ.refreshEvidence, 'function', 'production RLJOURNEY.refreshEvidence must be exported');

  await t.test('unchanged semantic refs are deterministic and retrieval occurrence noise is idempotent', () => {
    const { completed } = completedSession();
    const unchanged = requireValue(RJ.refreshEvidence(completed, clone(BASE_REFS)));
    assert.strictEqual(unchanged, completed, 'an unchanged semantic refresh returns the current immutable session');

    const occurrenceOnly = refsWith({
      'owner:vehicle-fit': {
        observedAsOf: '2026-08-03T11:00:00.000Z',
        retrievedOrPublishedAt: '2026-08-03T12:59:59.000Z'
      }
    });
    const noisy = requireValue(RJ.refreshEvidence(completed, occurrenceOnly));
    assert.strictEqual(noisy, completed, 'retrieval occurrence fields do not change semantic identity');
    assert.equal(noisy.sessionFingerprint, completed.sessionFingerprint);
    assert.equal(noisy.history.length, completed.history.length);
  });

  await t.test('objective change reopens the root, stales only transitive dependents, and preserves unrelated state', () => {
    const { context, completed, packet } = completedSession();
    const beforeHistory = clone(completed.history);
    const beforeUnrelated = clone(completed.steps.unrelated);
    const refreshed = requireValue(RJ.refreshEvidence(completed, refsWith({
      'control:objective': { semanticFingerprint: `sha256:${'a'.repeat(64)}` }
    })));

    assert.equal(refreshed.steps.objective.status, 'active');
    assertCleared(refreshed.steps.objective);
    for (const stepId of ['currency', 'fit', 'tracking']) {
      assert.equal(refreshed.steps[stepId].status, 'stale', `${stepId} is a transitive dependent`);
      assert.match(refreshed.steps[stepId].staleReason, /E012-JOURNEY-STALE/);
      assertCleared(refreshed.steps[stepId]);
    }
    assert.deepEqual(refreshed.steps.unrelated, beforeUnrelated, 'unrelated completed outcome remains current');
    assert.deepEqual(refreshed.context, context, 'unchanged objective/session context is preserved explicitly');
    assert.equal(refreshed.context.ownerDecisionId, completed.context.ownerDecisionId, 'ownerDecisionId alone does not control refresh');
    assert.deepEqual(refreshed.history.slice(0, beforeHistory.length), beforeHistory, 'full prior audit history is retained');
    assert.deepEqual(refreshed.history.at(-1).reopened, ['objective']);
    assert.deepEqual(refreshed.history.at(-1).staled, ['currency', 'fit', 'tracking']);
    assert.deepEqual(refreshed.history.at(-1).priorOutcomes.map((row) => row.stepId), ['objective', 'currency', 'fit', 'tracking']);
    assert.equal(refreshed.history.at(-1).priorOutcomes.every((row) => row.conclusion !== null), true, 'prior conclusions remain in audit history');
    assert.notEqual(refreshed.sessionFingerprint, packet.trace.sessionFingerprint, 'the signed completion fingerprint is invalidated');
    requireError(RJ.buildCompletionPacket(refreshed, {
      outcome: 'complete',
      signoff: { reviewer: 'independent-reviewer' }
    }), 'RLJOURNEY-STALE');
  });

  await t.test('fit middle-step change preserves current ancestors and stales only its dependent', () => {
    const { completed } = completedSession();
    const refreshed = requireValue(RJ.refreshEvidence(completed, refsWith({
      'owner:vehicle-fit': { semanticFingerprint: `sha256:${'b'.repeat(64)}` }
    })));
    assert.equal(refreshed.steps.objective.status, 'complete');
    assert.equal(refreshed.steps.currency.status, 'complete');
    assert.equal(refreshed.steps.fit.status, 'active');
    assert.equal(refreshed.steps.tracking.status, 'stale');
    assert.equal(refreshed.steps.unrelated.status, 'complete');
    assertCleared(refreshed.steps.fit);
    assertCleared(refreshed.steps.tracking);
  });

  await t.test('tracking leaf change reopens only tracking and leaves every other completed step current', () => {
    const { completed } = completedSession();
    const refreshed = requireValue(RJ.refreshEvidence(completed, refsWith({
      'vehicle:tracking': { semanticFingerprint: `sha256:${'c'.repeat(64)}` }
    })));
    assert.equal(refreshed.steps.tracking.status, 'active');
    for (const stepId of ['objective', 'currency', 'fit', 'unrelated']) {
      assert.equal(refreshed.steps[stepId].status, 'complete', `${stepId} remains current`);
    }
    requireError(RJ.buildCompletionPacket(refreshed, {
      outcome: 'complete',
      signoff: { reviewer: 'independent-reviewer' }
    }), 'RLJOURNEY-PACKET');
  });

  await t.test('multiple changed refs reopen every direct step while direct status wins over inherited staleness', () => {
    const { completed } = completedSession();
    const refreshed = requireValue(RJ.refreshEvidence(completed, refsWith({
      'control:objective': { semanticFingerprint: `sha256:${'d'.repeat(64)}` },
      'owner:vehicle-fit': { semanticFingerprint: `sha256:${'e'.repeat(64)}` }
    })));
    assert.deepEqual(refreshed.history.at(-1).reopened, ['objective', 'fit']);
    assert.deepEqual(refreshed.history.at(-1).staled, ['currency', 'tracking']);
    assert.equal(refreshed.steps.objective.status, 'active');
    assert.equal(refreshed.steps.fit.status, 'active');
    assert.equal(refreshed.steps.currency.status, 'stale');
    assert.equal(refreshed.steps.tracking.status, 'stale');
    assert.equal(refreshed.steps.unrelated.status, 'complete');
  });

  await t.test('reevaluation creates a new signed packet that remains non-executing and privacy-safe', () => {
    const { completed, packet: priorPacket } = completedSession();
    let refreshed = requireValue(RJ.refreshEvidence(completed, refsWith({
      'control:objective': { semanticFingerprint: `sha256:${'f'.repeat(64)}` }
    })));
    refreshed = completeSteps(refreshed, ['objective', 'currency', 'fit', 'tracking']);
    const packet = requireValue(RJ.buildCompletionPacket(refreshed, {
      outcome: 'complete',
      signoff: { reviewer: 'independent-reviewer', decision: 'accept-refreshed-research-process' }
    }));
    const reviewed = requireValue(RJ.recordSignoff(packet, {
      reviewer: 'independent-reviewer',
      decision: 'accept-refreshed-research-process'
    }));

    assert.notEqual(packet.packetFingerprint, priorPacket.packetFingerprint);
    assert.equal(packet.trace.sessionFingerprint, refreshed.sessionFingerprint);
    assert.equal(packet.noExecution, true);
    assert.equal(packet.executed, false);
    assert.equal(reviewed.noExecution, true);
    assert.equal(reviewed.executed, false);
    assertNoForbiddenPacketKeys(packet);
  });

  await t.test('malformed, unknown, incomplete, mismatched, and privacy-forbidden refs fail closed', () => {
    const { completed } = completedSession();
    requireError(RJ.refreshEvidence(completed, { refs: clone(BASE_REFS) }), 'RLJOURNEY-INPUT');

    const malformed = clone(BASE_REFS);
    malformed[0].semanticFingerprint = 'not-a-canonical-fingerprint';
    requireError(RJ.refreshEvidence(completed, malformed), 'RLJOURNEY-INPUT');

    const unknown = clone(BASE_REFS);
    unknown.push(semanticRef('owner:unknown', '9'));
    requireError(RJ.refreshEvidence(completed, unknown), 'RLJOURNEY-STALE');

    requireError(RJ.refreshEvidence(completed, clone(BASE_REFS).slice(0, -1)), 'RLJOURNEY-STALE');

    const mismatched = clone(completed);
    mismatched.definitionId = 'journey/foreign/definition/v1';
    requireError(RJ.refreshEvidence(mismatched, clone(BASE_REFS)), 'RLJOURNEY-STALE');

    const forbidden = clone(BASE_REFS);
    forbidden[0].accountId = 'must-never-enter-session';
    requireError(RJ.refreshEvidence(completed, forbidden), 'RLJOURNEY-PRIVACY');
  });

  await t.test('broken dependency graphs and missing packet steps fail closed', () => {
    const { completed } = completedSession();
    const brokenGraph = clone(completed);
    brokenGraph.steps.objective.dependsOnStepIds = ['tracking'];
    requireError(RJ.refreshEvidence(brokenGraph, clone(BASE_REFS)), 'RLJOURNEY-DAG');

    const missingStep = clone(completed);
    delete missingStep.steps.tracking;
    requireError(RJ.buildCompletionPacket(missingStep, {
      outcome: 'complete',
      signoff: { reviewer: 'independent-reviewer' }
    }), 'RLJOURNEY-PACKET');
  });

  await t.test('refresh is deeply immutable and never mutates session or caller refs', () => {
    const { completed } = completedSession();
    const sessionBefore = RJ.canonicalize(completed);
    const refs = refsWith({
      'owner:vehicle-fit': { semanticFingerprint: `sha256:${'6'.repeat(64)}` }
    });
    const refsBefore = RJ.canonicalize(refs);
    const refreshed = requireValue(RJ.refreshEvidence(completed, refs));

    assert.equal(RJ.canonicalize(completed), sessionBefore);
    assert.equal(RJ.canonicalize(refs), refsBefore);
    assert.equal(Object.isFrozen(refreshed), true);
    assert.equal(Object.isFrozen(refreshed.steps.fit), true);
    assert.equal(Object.isFrozen(refreshed.semanticEvidenceRefs), true);
    assert.equal(Object.isFrozen(refreshed.history.at(-1).priorOutcomes), true);
  });
});