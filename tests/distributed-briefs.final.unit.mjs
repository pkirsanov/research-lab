/*
 * tests/distributed-briefs.final.unit.mjs — Feature 002 Scope 08 (SCN-002-025 / SCN-002-027).
 *
 * Pure-contract coverage for the window-aware final aggregation foundation:
 *  - compactFinalAuthorInput retains every source owner ref and window-required field, records exact
 *    cap/order/omission metadata, and refuses B002-BUDGET rather than omit mandatory material (SCN-002-025);
 *  - evaluateLowNoiseGate promotes an unusual observation to an action slot ONLY with an eligible owner
 *    interpretation PLUS structural break / three-distinct-fingerprint persistence / independent
 *    corroboration, and repeated identical fingerprints earn no persistence credit (SCN-002-027).
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { singleSourceScenario, makeHash } from './fixtures/feature-002/final/final-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

test('SCN-002-025: final compaction retains every source owner ref and window-required field', () => {
  const scenario = singleSourceScenario('pre-market');
  const compact = RLCONTRACTS.compactFinalAuthorInput(scenario.registry, scenario.reads, scenario.briefs, scenario.groups, scenario.runContext, scenario.finalBudget);
  assert.equal(compact.ok, true, compact.ok ? '' : JSON.stringify(compact.error));

  const input = compact.value.finalInput;
  // One mandatory FinalSourceEnvelope per DERIVED source ID, in registry order, retaining read/brief refs.
  assert.deepEqual(input.sourceEnvelopes.map((envelope) => envelope.toolId), scenario.registry.orderedSourceToolIds);
  assert.equal(input.sourceEnvelopes.length, 2);
  for (const envelope of input.sourceEnvelopes) {
    assert.equal(envelope.contractVersion, 'final-source-envelope/v1');
    assert.equal(envelope.readRef.fingerprint, scenario.reads[envelope.toolId].fingerprint);
    assert.equal(envelope.briefRef.fingerprint, scenario.briefs[envelope.toolId].contentFingerprint);
    assert.ok(Array.isArray(envelope.ownerInterpretationRefs));
    assert.ok(envelope.eligibility && typeof envelope.eligibility.eligible === 'boolean');
  }
  // The run/window header retains the window contract fields for pre-market (no prior thesis).
  assert.equal(input.runHeader.window, 'pre-market');
  assert.equal(input.runHeader.priorWindowThesisRef, null);
  assert.ok(Array.isArray(input.runHeader.requiredEvidenceResults) && input.runHeader.requiredEvidenceResults.length >= 1);
  // Derived counts / conservative byte-as-token reservation are exact and never a literal.
  assert.deepEqual(compact.value.orderedSourceToolIds, scenario.registry.orderedSourceToolIds);
  assert.equal(compact.value.participantIds.length, 3);
  assert.equal(compact.value.reservedInputTokens, compact.value.inputByteLength + compact.value.promptReserveBytes);
  assert.equal(compact.value.includedFactIds.length, 2);
  assert.equal(compact.value.omittedFacts.length, 0);

  // Optional facts add WHOLE and record omitted IDs/fingerprints when the cap is tight (no truncation).
  const tight = RLCONTRACTS.compactFinalAuthorInput(scenario.registry, scenario.reads, scenario.briefs, scenario.groups, scenario.runContext, { ...scenario.finalBudget, maxInputTokens: compact.value.reservedInputTokens - 20 });
  assert.equal(tight.ok, true, tight.ok ? '' : JSON.stringify(tight.error));
  assert.ok(tight.value.omittedFacts.length >= 1, 'a tight cap must omit at least one optional fact whole');
  assert.ok(tight.value.includedFactIds.length < 2);
  for (const omitted of tight.value.omittedFacts) {
    assert.ok(typeof omitted.id === 'string' && typeof omitted.sourceToolId === 'string' && /^sha256:[a-f0-9]{64}$/.test(omitted.fingerprint));
  }

  // Mandatory overflow refuses B002-BUDGET rather than drop a participant or window field.
  const overflow = RLCONTRACTS.compactFinalAuthorInput(scenario.registry, scenario.reads, scenario.briefs, scenario.groups, scenario.runContext, { ...scenario.finalBudget, maxInputTokens: 10 });
  assert.equal(overflow.ok, false);
  assert.equal(overflow.error.code, 'B002-BUDGET');

  // A missing source read/brief is a fail-closed coverage refusal (never a silent omission).
  const missing = RLCONTRACTS.compactFinalAuthorInput(scenario.registry, { 'sector-research-lab': scenario.reads['sector-research-lab'] }, scenario.briefs, scenario.groups, scenario.runContext, scenario.finalBudget);
  assert.equal(missing.ok, false);
  assert.equal(missing.error.reason, 'final-source-read-missing');

  // The aggregator can never be self-consumed as a source brief.
  const selfConsumed = RLCONTRACTS.compactFinalAuthorInput(scenario.registry, { ...scenario.reads, 'market-brief': scenario.reads['sector-research-lab'] }, scenario.briefs, scenario.groups, scenario.runContext, scenario.finalBudget);
  assert.equal(selfConsumed.ok, false);
  assert.equal(selfConsumed.error.reason, 'final-aggregator-self-consumed');
});

test('SCN-002-027: low-noise gate requires owner plus structural persistence or independent corroboration', () => {
  const base = {
    basisValidated: true,
    currentEvidence: true,
    unusualnessClaimed: true,
    comparisonQualified: true,
    ownerEligible: true,
    ownerInterpretationRef: 'interp-rrg',
    falsifiable: { trigger: 'holds above prior high', invalidation: 'loses prior swing low', subjects: ['XLK'], horizon: 'swing' },
    structuralBreak: true,
    persistenceFingerprints: [],
    independentCorroboration: false,
    disputed: false,
    conflicted: false,
    thin: false,
    profileBoundaryOk: true
  };
  // All gates clear via a declared structural break -> action.
  const promoted = RLCONTRACTS.evaluateLowNoiseGate(base).value;
  assert.equal(promoted.destination, 'action');
  assert.equal(promoted.promote, true);

  // Persistence via THREE DISTINCT fingerprints also promotes (no structural break needed).
  const persistent = RLCONTRACTS.evaluateLowNoiseGate({ ...base, structuralBreak: false, persistenceFingerprints: [makeHash('a'), makeHash('b'), makeHash('c')] }).value;
  assert.equal(persistent.destination, 'action');

  // Repeated identical fingerprints earn NO persistence credit -> stays context.
  const repeated = RLCONTRACTS.evaluateLowNoiseGate({ ...base, structuralBreak: false, persistenceFingerprints: [makeHash('a'), makeHash('a'), makeHash('a')] }).value;
  assert.equal(repeated.destination, 'context');
  assert.ok(repeated.reasons.includes('no-structural-break-persistence-or-corroboration'));

  // No eligible owner interpretation -> context, no action slot.
  const noOwner = RLCONTRACTS.evaluateLowNoiseGate({ ...base, ownerEligible: false, ownerInterpretationRef: null }).value;
  assert.equal(noOwner.destination, 'context');
  assert.ok(noOwner.reasons.includes('no-eligible-owner-interpretation'));

  // Non-falsifiable owner recommendation -> context.
  const notFalsifiable = RLCONTRACTS.evaluateLowNoiseGate({ ...base, falsifiable: { trigger: '', invalidation: '', subjects: [], horizon: '' } }).value;
  assert.equal(notFalsifiable.destination, 'context');
  assert.ok(notFalsifiable.reasons.includes('owner-recommendation-not-falsifiable'));

  // Invalid basis -> unavailable; provider dispute -> disputed; unqualified unusualness comparison -> unavailable.
  assert.equal(RLCONTRACTS.evaluateLowNoiseGate({ ...base, basisValidated: false }).value.destination, 'unavailable');
  assert.equal(RLCONTRACTS.evaluateLowNoiseGate({ ...base, disputed: true }).value.destination, 'disputed');
  assert.equal(RLCONTRACTS.evaluateLowNoiseGate({ ...base, comparisonQualified: false }).value.destination, 'unavailable');

  // A blocking dispute/conflict/thin/profile-boundary keeps valid evidence as context (no confidence bump).
  const thin = RLCONTRACTS.evaluateLowNoiseGate({ ...base, thin: true }).value;
  assert.equal(thin.destination, 'context');
  assert.ok(thin.reasons.includes('thin-baseline'));
});
