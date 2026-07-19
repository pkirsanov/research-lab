/*
 * tests/distributed-briefs.scheduler.unit.mjs — Feature 002 Scope 09 (SCN-002-010).
 *
 * Pure unit coverage for the two invariants that make evidence-first publication structurally safe:
 *   1. the CLOSED run-state machine — a run may advance ONLY to the immediately following phase, so
 *      final-before-barrier, publish-before-final, and any skip/backward move are impossible; and
 *   2. one-run identity — the manifest, both pointers, the monotonic pointer-last generation, and every
 *      inventory hash belong to exactly one run; a mixed run identity or a drifted inventory hash fails
 *      closed. No filesystem or Git is touched here.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { createHash } from 'node:crypto';
import {
  BRIEF_RUN_PHASES, createRunState, advanceRunState,
  buildPublishSet, validateRunIdentity
} from '../scripts/brief-publication.mjs';
import { buildRun, priorFromStaging } from './fixtures/feature-002/history/history-fixture-builder.mjs';

function sha(bytes) { return `sha256:${createHash('sha256').update(bytes).digest('hex')}`; }

test('SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order', () => {
  // A full legal walk of the closed phase list succeeds one step at a time.
  let state = createRunState('run-unit-1');
  assert.equal(state.phase, BRIEF_RUN_PHASES[0]);
  for (let i = 1; i < BRIEF_RUN_PHASES.length; i += 1) {
    const advanced = advanceRunState(state, BRIEF_RUN_PHASES[i]);
    assert.equal(advanced.ok, true, `legal advance to ${BRIEF_RUN_PHASES[i]}`);
    state = advanced.state;
  }
  assert.equal(state.phase, 'pushed');
  assert.equal(state.history.length, BRIEF_RUN_PHASES.length);

  // The two illegal shapes the barrier forbids: final BEFORE the source barrier, and publish/commit
  // BEFORE final. Both are structurally rejected.
  const atEvidence = advanceRunState(advanceRunState(advanceRunState(advanceRunState(advanceRunState(createRunState('r'), 'lease-held').state, 'worktree-ready').state, 'registry-frozen').state, 'sources-acquired').state, 'evidence-frozen').state;
  const finalBeforeBarrier = advanceRunState(atEvidence, 'final-authored');
  assert.equal(finalBeforeBarrier.ok, false, 'final-before-barrier is rejected');
  assert.equal(finalBeforeBarrier.error.code, 'B002-RUN-STATE');
  assert.equal(finalBeforeBarrier.error.reason, 'illegal-transition');

  const atFinal = advanceRunState(advanceRunState(advanceRunState(atEvidence, 'reads-frozen').state, 'reuse-reserved').state, 'source-briefs-authored').state;
  assert.equal(advanceRunState(atFinal, 'committed').ok, false, 'commit-before-barrier/final is rejected');

  // A backward move and a repeat of the current phase are both rejected.
  assert.equal(advanceRunState(atEvidence, 'sources-acquired').ok, false, 'backward transition rejected');
  assert.equal(advanceRunState(atEvidence, 'evidence-frozen').ok, false, 'repeat transition rejected');
  assert.equal(advanceRunState(atEvidence, 'not-a-phase').ok, false, 'unknown phase rejected');
});

test('SCN-002-010: manifest inventory and pointer-last generation share one run identity', () => {
  const staging = buildPublishSet(buildRun({ seed: 'u2', runId: 'run-u2' })).staging;

  // A coherent first-generation publish set validates with one run identity.
  const ok = validateRunIdentity(staging, { priorGeneration: 0 });
  assert.equal(ok.ok, true);
  assert.equal(ok.identity.runId, 'run-u2');
  assert.equal(ok.identity.generation, 1);

  // A mixed run identity (manifest runId from another run) fails closed.
  const mixed = JSON.parse(JSON.stringify(staging));
  // Rehydrate the Buffers JSON.stringify flattened so the validator still hashes real bytes.
  for (const rel of Object.keys(mixed.files)) mixed.files[rel] = { bytes: staging.files[rel].bytes, sha256: staging.files[rel].sha256 };
  mixed.manifest.body.runId = 'run-OTHER';
  assert.equal(validateRunIdentity(mixed, { priorGeneration: 0 }).ok, false, 'mixed manifest runId rejected');
  assert.equal(validateRunIdentity(mixed, { priorGeneration: 0 }).error.reason, 'run-identity-mismatch');

  // A non-monotonic generation (prior already at generation 1) fails closed.
  assert.equal(validateRunIdentity(staging, { priorGeneration: 5 }).error.reason, 'generation-not-monotonic');

  // A drifted inventory hash (a manifest inventory entry that no longer matches its staged bytes) fails.
  const drifted = { ...staging, files: { ...staging.files }, manifest: { path: staging.manifest.path, body: JSON.parse(JSON.stringify(staging.manifest.body)) } };
  const firstEntry = drifted.manifest.body.inventory.find((e) => e.path.startsWith('briefs/objects/'));
  firstEntry.sha256 = sha(Buffer.from('tampered-inventory-hash'));
  assert.equal(validateRunIdentity(drifted, { priorGeneration: 0 }).ok, false, 'drifted inventory hash rejected');
  assert.equal(validateRunIdentity(drifted, { priorGeneration: 0 }).error.reason, 'inventory-hash-mismatch');

  // The chained second run advances the generation to prior + 1 and still validates.
  const prior = priorFromStaging(staging);
  const second = buildPublishSet(buildRun({ seed: 'u3', runId: 'run-u3', prior })).staging;
  assert.equal(validateRunIdentity(second, { priorGeneration: prior.generation }).ok, true);
  assert.equal(validateRunIdentity(second, { priorGeneration: prior.generation }).identity.generation, prior.generation + 1);
});
