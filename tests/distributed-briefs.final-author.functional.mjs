/*
 * tests/distributed-briefs.final-author.functional.mjs — Feature 002 Scope 08 (SCN-002-025 / SCN-002-027).
 *
 * The external final author is an untrusted boundary; a returned response can try to rewrite truth. This
 * proves the PRODUCTION validators reject every unsupported mutation: an omitted participant / source ref,
 * a hidden conflict, an unsupported (evidence-invented) action, inflated merged confidence, a low-noise
 * observation that consumes an action slot, an out-of-order clock, unsafe/markup text, and a mandatory
 * budget overflow. The unsafe and mismatch classes are additionally driven end-to-end through the REAL
 * bounded child-process final author + invokeAuthor + validateAuthorEnvelope path.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildFinalAuthorRequest, invokeAuthor, validateAuthorEnvelope, AUTHOR_ERRORS } from '../scripts/brief-author.mjs';
import { singleSourceScenario, conflictScenario, buildFinalFromInput, authorIdentity } from './fixtures/feature-002/final/final-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');
const ECHO = fileURLToPath(new URL('./fixtures/feature-002/final/final-author-echo.mjs', import.meta.url));

function runInputsOf(scenario) {
  return {
    registry: scenario.registry,
    reads: scenario.reads,
    briefs: scenario.briefs,
    marketSessionEvidenceRef: scenario.runContext.marketSessionEvidenceRef,
    actionThresholds: scenario.runContext.actionThresholds
  };
}

test('Final author omission hidden conflict unsupported action unsafe text and budget mutations are rejected', async () => {
  const single = singleSourceScenario('after-hours');
  const compactSingle = RLCONTRACTS.compactFinalAuthorInput(single.registry, single.reads, single.briefs, single.groups, single.runContext, single.finalBudget);
  assert.equal(compactSingle.ok, true, compactSingle.ok ? '' : JSON.stringify(compactSingle.error));
  const singleInput = compactSingle.value.finalInput;
  const singleInputs = runInputsOf(single);

  // Baseline: an honest complete final validates.
  const valid = buildFinalFromInput(singleInput, { mode: 'valid' });
  assert.equal(RLCONTRACTS.validateFinalBrief(valid, singleInputs, single.groups).ok, true);

  // Omission: a dropped coverage participant or source ref is rejected.
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'omit-source' }), singleInputs, single.groups).error.reason, 'final-coverage-incomplete');
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'omit-source-ref' }), singleInputs, single.groups).error.reason, 'final-source-refs-incomplete');

  // Unsupported action (evidence-invented / not in the deterministic groups) and inflated confidence rejected.
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'unsupported-action' }), singleInputs, single.groups).error.reason, 'final-action-not-in-groups');
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'inflate-confidence' }), singleInputs, single.groups).error.reason, 'final-confidence-above-minimum');

  // Unsafe/markup text and an out-of-order (collapsed) clock are rejected.
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'unsafe-text' }), singleInputs, single.groups).error.reason, 'unsafe-instruction-or-markup');
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(singleInput, { mode: 'one-clock' }), singleInputs, single.groups).error.reason, 'final-clock-order-invalid');

  // A low-noise (context) observation that consumes an action slot is rejected (SCN-002-027 guard).
  const withUnusual = singleSourceScenario('after-hours', { lowNoiseResults: [{ observationRef: 'obs-nvda-unusual', destination: 'context', suppressionReason: 'no-eligible-owner-interpretation', subjects: ['NVDA'] }] });
  const compactUnusual = RLCONTRACTS.compactFinalAuthorInput(withUnusual.registry, withUnusual.reads, withUnusual.briefs, withUnusual.groups, withUnusual.runContext, withUnusual.finalBudget);
  const unusualInputs = runInputsOf(withUnusual);
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(compactUnusual.value.finalInput, { mode: 'valid' }), unusualInputs, withUnusual.groups).ok, true, 'unusual evidence as context validates');
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(compactUnusual.value.finalInput, { mode: 'promote-unusual' }), unusualInputs, withUnusual.groups).error.reason, 'final-attention-consumes-action');

  // Hidden conflict: a real conflict scenario whose final drops the conflict is rejected.
  const conflict = conflictScenario('morning');
  const compactConflict = RLCONTRACTS.compactFinalAuthorInput(conflict.registry, conflict.reads, conflict.briefs, conflict.groups, conflict.runContext, conflict.finalBudget);
  const conflictInputs = runInputsOf(conflict);
  assert.ok(conflict.groups.conflicts.length >= 1, 'the conflict scenario has a visible conflict');
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(compactConflict.value.finalInput, { mode: 'valid' }), conflictInputs, conflict.groups).ok, true);
  assert.equal(RLCONTRACTS.validateFinalBrief(buildFinalFromInput(compactConflict.value.finalInput, { mode: 'hidden-conflict' }), conflictInputs, conflict.groups).error.reason, 'final-conflict-hidden');

  // Mandatory budget overflow refuses B002-BUDGET before any author invocation.
  const overflow = RLCONTRACTS.compactFinalAuthorInput(single.registry, single.reads, single.briefs, single.groups, single.runContext, { ...single.finalBudget, maxInputTokens: 12 });
  assert.equal(overflow.ok, false);
  assert.equal(overflow.error.code, 'B002-BUDGET');

  // End-to-end through the REAL bounded child-process final author boundary.
  const built = buildFinalAuthorRequest(compactSingle.value, authorIdentity());
  assert.equal(built.ok, true);

  const validResult = await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'valid'], timeoutMs: 8000 });
  assert.equal(validResult.ok, true, validResult.ok ? '' : JSON.stringify(validResult.error));
  const validEnvelope = validateAuthorEnvelope(validResult.envelope, built.request, {});
  assert.equal(validEnvelope.ok, true, validEnvelope.ok ? '' : JSON.stringify(validEnvelope.error));
  assert.equal(RLCONTRACTS.validateFinalBrief(validEnvelope.final, singleInputs, single.groups).ok, true);

  const unsafeResult = await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'unsafe'], timeoutMs: 8000 });
  assert.equal(unsafeResult.ok, true);
  assert.equal(validateAuthorEnvelope(unsafeResult.envelope, built.request, {}).error.code, AUTHOR_ERRORS.UNSAFE);

  const mismatchResult = await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'mismatch'], timeoutMs: 8000 });
  assert.equal(mismatchResult.ok, true);
  assert.equal(validateAuthorEnvelope(mismatchResult.envelope, built.request, {}).error.code, AUTHOR_ERRORS.MISMATCH);

  assert.equal((await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'malformed'], timeoutMs: 8000 })).error.code, AUTHOR_ERRORS.MALFORMED);
  assert.equal((await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'oversize'], maxStdoutBytes: 4096, timeoutMs: 8000 })).error.code, AUTHOR_ERRORS.OVERSIZE);
  assert.equal((await invokeAuthor(built.request, { command: 'node', args: [ECHO, 'timeout'], timeoutMs: 300 })).error.code, AUTHOR_ERRORS.TIMEOUT);
});
