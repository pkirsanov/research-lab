import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { clone, readJson } from './tool-experience.support.mjs';

/*
 * TP-08-01 — Journey runtime unit tests (tests/journey.unit.mjs).
 *
 * Proves the rljourney.js runtime contracts for SCN-012-009 (durable session
 * shape + restore drift), SCN-012-010 (dependency-aware transitive stale
 * backtracking), and SCN-012-011 (typed non-executing completion packet), plus
 * the definition/step/DAG/mechanism validators, canonical fingerprints, and the
 * closed refusal-code surface.
 *
 * The module is loaded directly (createRequire) because it ships as a UMD dual
 * module with its own browser global; the shared support helper only loads
 * rlexperience.js. readJson/clone are reused read-only.
 */

const require = createRequire(import.meta.url);
const RLJOURNEY_URL = new URL('../rljourney.js', import.meta.url);

function loadJourneyApi() {
  assert.equal(existsSync(RLJOURNEY_URL), true, 'production runtime missing: rljourney.js');
  const path = RLJOURNEY_URL.pathname;
  delete require.cache[require.resolve(path)];
  return require(path);
}

const RJ = loadJourneyApi();

function requireValue(result) {
  assert.equal(result.ok, true, result.error && `${result.error.code} ${result.error.fieldPath} ${result.error.reason}`);
  return result.value;
}

function requireError(result, code) {
  assert.equal(result.ok, false, 'expected a refusal');
  assert.equal(RJ.REFUSAL_CODES.includes(result.error.code), true, `refusal code ${result.error.code} must be closed`);
  if (code) assert.equal(result.error.code, code, `${result.error.fieldPath} ${result.error.reason}`);
  return result.error;
}

/* A real single-step definition drawn from the production registry. */
function productionDefinition(toolId, goalId) {
  const registry = readJson('journeys.json');
  const definition = registry.definitions.find((candidate) => candidate.toolId === toolId && candidate.goalId === goalId);
  assert.notEqual(definition, undefined, `${toolId}/${goalId} definition must exist`);
  const steps = registry.steps.filter((step) => definition.stepIds.includes(step.stepId));
  return { definition: clone(definition), steps: clone(steps) };
}

/* A synthetic multi-step branching definition: a -> b -> c chain with unrelated d. */
function syntheticChain(overrides = {}) {
  const definition = {
    contractVersion: 'journey-definition/v1',
    definitionId: 'journey/synthetic/chain/v1',
    definitionVersion: 'v1',
    toolId: 'synthetic',
    goalId: 'chain',
    title: 'Synthetic chain',
    outcomeDescription: 'Exercise the dependency DAG.',
    mechanism: 'decision-tree',
    prerequisiteRules: [{ ruleId: 'r', predicate: 'explicit-choice-recorded' }],
    contextSchema: { contractVersion: 'journey-context-schema/v1', allowedFields: ['evidenceIdentity', 'publicTargetId'], requiredFields: ['evidenceIdentity'] },
    stepIds: ['a', 'b', 'c', 'd'],
    evidencePolicy: { requiredSlots: ['owner-evidence'], allowedProvenance: ['owner-evidence', 'public-source'] },
    backtrackPolicy: { mode: 'transitive-dependents-stale', auditPriorOutcomes: true },
    staleEvidencePolicy: { mode: 'reopen-dependent-steps', preserveAudit: true },
    completionPolicy: { predicates: ['explicit-choice-recorded'], outcomes: ['complete', 'partial', 'refused'] },
    packetPolicy: { contractVersion: 'journey-completion-packet/v1', humanSignoffRequired: true, noExecution: true },
    privacyClass: 'public-safe',
    noExecution: true,
    accessibility: { progressSemantics: 'ordered-list', currentStepSemantics: 'aria-current-step' },
    limitations: ['Research only.'],
    definitionFingerprint: null,
    ...overrides
  };
  const step = (id, deps) => ({
    contractVersion: 'journey-step/v1',
    stepId: id,
    definitionId: 'journey/synthetic/chain/v1',
    title: id,
    purpose: 'p',
    mechanismRole: 'decision-tree',
    dependsOnStepIds: deps,
    inputSchema: { contractVersion: 'journey-step-input/v1', allowedFields: ['choice'], requiredFields: ['choice'] },
    allowedInputProvenance: ['user-assumption'],
    requiredEvidenceSlots: ['owner-evidence'],
    optionalEvidenceSlots: [],
    completionPredicate: 'explicit-choice-recorded',
    branchRules: [],
    staleWhen: [],
    invalidatesStepIds: [],
    ownerDeepLinks: ['synthetic.html#journey'],
    sideEffectPolicy: 'none',
    accessibility: { label: id, description: 'd' },
    stepFingerprint: null
  });
  return { definition, steps: [step('a', []), step('b', ['a']), step('c', ['b']), step('d', [])] };
}

const EVIDENCE = [{ slot: 'owner-evidence', ref: 'owner:current' }];

function completeAll(session, stepIds) {
  let current = session;
  for (const stepId of stepIds) {
    current = requireValue(RJ.completeStep(current, stepId, { input: { choice: stepId }, evidence: EVIDENCE, conclusion: `${stepId}-done`, completedAt: '2026-07-26T00:01:00.000Z' }));
  }
  return current;
}

test('TP-08-01 compiles a real definition and rejects malformed definitions with closed codes', () => {
  const { definition, steps } = productionDefinition('market-action', 'triage');
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  assert.equal(compiled.contractVersion, 'journey-compiled-definition/v1');
  assert.equal(compiled.noExecution, true);
  assert.match(compiled.definitionFingerprint, /^sha256:/);
  assert.equal(compiled.order.length, steps.length);

  const missingNoExecution = clone(definition);
  missingNoExecution.noExecution = false;
  requireError(RJ.compileDefinition(missingNoExecution, steps), 'RLJOURNEY-DEFINITION');

  const badMechanism = clone(definition);
  badMechanism.mechanism = 'freeform';
  requireError(RJ.compileDefinition(badMechanism, steps), 'RLJOURNEY-DEFINITION');

  const badOutcomes = clone(definition);
  badOutcomes.completionPolicy = clone(definition.completionPolicy);
  badOutcomes.completionPolicy.outcomes = ['complete', 'partial'];
  requireError(RJ.compileDefinition(badOutcomes, steps), 'RLJOURNEY-DEFINITION');
});

test('TP-08-01 rejects executable JavaScript anywhere in Journey data (no-code invariant)', () => {
  const { definition, steps } = syntheticChain();
  const withFn = clone(definition);
  withFn.limitations = ['ok'];
  withFn.injected = () => 'boom';
  requireError(RJ.compileDefinition(withFn, steps), 'RLJOURNEY-EXECUTION');

  const stepWithFn = clone(steps);
  stepWithFn[0].hook = function evil() { return 1; };
  requireError(RJ.compileDefinition(definition, stepWithFn), 'RLJOURNEY-EXECUTION');
});

test('TP-08-01 produces deterministic canonical fingerprints independent of key order', () => {
  const a = RJ.fingerprint({ alpha: 1, beta: [2, 3], gamma: { x: 'y' } });
  const b = RJ.fingerprint({ gamma: { x: 'y' }, beta: [2, 3], alpha: 1 });
  assert.equal(a, b, 'key order must not change the fingerprint');
  assert.match(a, /^sha256:[0-9a-f]{64}$/);
  assert.notEqual(a, RJ.fingerprint({ alpha: 1, beta: [2, 3], gamma: { x: 'z' } }));

  const { definition, steps } = syntheticChain();
  const first = requireValue(RJ.compileDefinition(definition, steps));
  const second = requireValue(RJ.compileDefinition(clone(definition), clone(steps)));
  assert.equal(first.definitionFingerprint, second.definitionFingerprint, 'compilation must be reproducible');
});

test('TP-08-01 builds a topological step order and rejects dependency cycles', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  assert.deepEqual(compiled.transitiveDependents.a, ['b', 'c']);
  assert.deepEqual(compiled.transitiveDependents.d, []);
  assert.ok(compiled.order.indexOf('a') < compiled.order.indexOf('b'));
  assert.ok(compiled.order.indexOf('b') < compiled.order.indexOf('c'));

  const cyclic = syntheticChain();
  cyclic.steps.find((step) => step.stepId === 'a').dependsOnStepIds = ['c'];
  requireError(RJ.compileDefinition(cyclic.definition, cyclic.steps), 'RLJOURNEY-DAG');
});

test('TP-08-01 SCN-012-009 creates a durable session, restores it byte-identically, and rejects definition drift', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const session = requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' }, createdAt: '2026-07-26T00:00:00.000Z' }));
  // a visit/creation is NOT a completed step: every step starts pending and the next required step is 'a'.
  assert.equal(session.nextRequiredStepId, 'a');
  assert.ok(session.order.every((stepId) => session.steps[stepId].status === 'pending'));

  const progressed = completeAll(session, ['a', 'b']);
  const record = requireValue(RJ.serializeSession(progressed));
  const restored = requireValue(RJ.restoreSession(compiled, record));
  assert.equal(restored.sessionFingerprint, progressed.sessionFingerprint, 'restore must reproduce the exact session');
  assert.equal(restored.steps.a.status, 'complete');
  assert.equal(restored.steps.b.status, 'complete');
  // topological order is a>d>b>c: after a,b the first ready incomplete step is the
  // dependency-free 'd'; 'c' also becomes ready (its dependency b is complete) but sorts later.
  assert.equal(restored.nextRequiredStepId, 'd');
  assert.equal(restored.steps.c.status, 'pending');
  assert.equal(restored.steps.d.status, 'pending');

  const drifted = clone(record);
  drifted.definitionFingerprint = 'sha256:' + '0'.repeat(64);
  requireError(RJ.restoreSession(compiled, drifted), 'RLJOURNEY-STALE');
});

test('TP-08-01 requires recorded evidence for completion and enforces dependency order', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const session = requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' } }));

  // a visit/click without evidence is not a completion.
  requireError(RJ.completeStep(session, 'a', { input: { choice: 'a' }, evidence: [] }), 'RLJOURNEY-STEP');
  // wrong evidence slot is rejected.
  requireError(RJ.completeStep(session, 'a', { input: { choice: 'a' }, evidence: [{ slot: 'unrelated' }] }), 'RLJOURNEY-STEP');
  // completing a dependent before its dependency is rejected.
  requireError(RJ.completeStep(session, 'b', { input: { choice: 'b' }, evidence: EVIDENCE }), 'RLJOURNEY-STEP');
});

test('TP-08-01 SCN-012-010 backtracking stales only transitive dependents and preserves unrelated steps', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const session = requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' } }));
  const done = completeAll(session, ['a', 'd', 'b', 'c']);
  assert.equal(done.status, 'steps-complete');

  const preview = requireValue(RJ.previewBacktrack(done, 'a'));
  assert.deepEqual(preview.staleDependents, ['b', 'c']);
  assert.deepEqual(preview.unrelatedComplete, ['d']);

  const after = requireValue(RJ.backtrackStep(done, 'a', { reason: 'replace earlier assumption' }));
  assert.equal(after.steps.a.status, 'active');
  assert.equal(after.steps.b.status, 'stale');
  assert.equal(after.steps.c.status, 'stale');
  assert.match(after.steps.b.staleReason, /dependency backtracked: a/);
  assert.match(after.steps.b.staleReason, /replace earlier assumption/);
  assert.equal(after.steps.d.status, 'complete', 'unrelated completed step must remain intact');
  assert.equal(after.steps.d.staleReason, null);
});

test('TP-08-01 SCN-012-010 completion packet excludes stale dependent conclusions', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const session = requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' } }));
  const after = requireValue(RJ.backtrackStep(completeAll(session, ['a', 'd', 'b', 'c']), 'a', { reason: 'new value' }));

  const partial = requireValue(RJ.buildCompletionPacket(after, { outcome: 'partial' }));
  assert.equal(partial.outcome, 'partial');
  assert.deepEqual(partial.outcomes.map((row) => row.stepId), ['d'], 'only the unrelated complete step contributes a conclusion');
  assert.deepEqual(partial.excludedStaleSteps, ['b', 'c']);

  // a complete packet cannot be built while dependents are stale.
  requireError(RJ.buildCompletionPacket(after, { outcome: 'complete', signoff: { by: 'analyst' } }), 'RLJOURNEY-STALE');
});

test('TP-08-01 builds typed complete / partial / refused packets with signoff rules', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const done = completeAll(requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' } })), ['a', 'b', 'c', 'd']);

  requireError(RJ.buildCompletionPacket(done, { outcome: 'complete' }), 'RLJOURNEY-PACKET'); // signoff required
  const complete = requireValue(RJ.buildCompletionPacket(done, { outcome: 'complete', signoff: { by: 'analyst', at: '2026-07-26T01:00:00.000Z' } }));
  assert.equal(complete.outcome, 'complete');
  assert.equal(complete.outcomes.length, 4);
  assert.equal(complete.noExecution, true);
  assert.match(complete.packetFingerprint, /^sha256:/);

  const partial = requireValue(RJ.buildCompletionPacket(done, { outcome: 'partial' }));
  assert.equal(partial.outcome, 'partial');
  const refused = requireValue(RJ.buildCompletionPacket(done, { outcome: 'refused' }));
  assert.equal(refused.outcome, 'refused');
  requireError(RJ.buildCompletionPacket(done, { outcome: 'execute' }), 'RLJOURNEY-PACKET');
});

test('TP-08-01 SCN-012-011 recording signoff triggers NO execution and leaves ledgers byte-identical', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  const done = completeAll(requireValue(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1' } })), ['a', 'b', 'c', 'd']);
  const packet = requireValue(RJ.buildCompletionPacket(done, { outcome: 'complete', signoff: { by: 'analyst' } }));

  // sentinel research ledgers the runtime must never touch.
  const requestLedger = { entries: ['brief-fetch'] };
  const executionLedger = { orders: [] };
  const publicationLedger = { published: [] };
  const before = JSON.stringify([requestLedger, executionLedger, publicationLedger]);

  const reviewed = requireValue(RJ.recordSignoff(packet, { by: 'analyst', decision: 'accept-research-process', at: '2026-07-26T02:00:00.000Z' }));
  const after = JSON.stringify([requestLedger, executionLedger, publicationLedger]);

  assert.equal(after, before, 'no ledger may change when human signoff is recorded');
  assert.equal(reviewed.reviewRecorded, true, 'signoff mutates only local review state');
  assert.equal(reviewed.executed, false);
  assert.equal(reviewed.noExecution, true);
  assert.equal(executionLedger.orders.length, 0);
  // the runtime exposes NO execution entry point at all.
  assert.equal(typeof RJ.execute, 'undefined');
  assert.equal(typeof RJ.submitOrder, 'undefined');
  assert.equal(typeof RJ.rebalance, 'undefined');
});

test('TP-08-01 enforces the privacy boundary and validates mechanism adapters declaratively', () => {
  const { definition, steps } = syntheticChain();
  const compiled = requireValue(RJ.compileDefinition(definition, steps));

  // forbidden sensitive field in context is rejected by the privacy guard.
  requireError(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1', accountBalance: 100 } }), 'RLJOURNEY-PRIVACY');
  requireError(RJ.assertNoForbiddenFields({ nested: { holdingQuantity: 5 } }), 'RLJOURNEY-PRIVACY');
  // a context field outside the definition's allowed set (but not sensitive) is a session refusal.
  requireError(RJ.createSession(compiled, { context: { evidenceIdentity: 'e-1', strayField: 'x' } }), 'RLJOURNEY-SESSION');

  for (const mechanism of RJ.MECHANISMS) {
    const adapter = requireValue(RJ.validateMechanismAdapter(clone(RJ.MECHANISM_ADAPTERS[mechanism])));
    assert.equal(adapter.mechanism, mechanism);
  }
  requireError(RJ.validateMechanismAdapter({ mechanism: 'wizard', progression: 'linear', run: () => 1 }), 'RLJOURNEY-EXECUTION');
});

test('TP-08-01 keeps the portfolio-stress private goal gated (Scope 13, not implemented here)', () => {
  const { definition, steps } = productionDefinition('market-action', 'portfolio-stress');
  const compiled = requireValue(RJ.compileDefinition(definition, steps));
  assert.equal(compiled.privacyClass, 'local-private-ref');
  assert.equal(compiled.gated, true, 'portfolio-stress private execution stays gated to Scope 13');
  assert.ok(compiled.steps.every((step) => step.gated === true));
});
