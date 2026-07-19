/*
 * tests/distributed-briefs.authorship.unit.mjs — Feature 002 Scope 06 (SCN-002-004, SCN-002-005).
 *
 * Unit coverage for the two pure foundation contracts: rlcontracts.validateToolBrief (a market
 * recommendation is legal only when the profile, read eligibility, permitted action family, and cited
 * evidence all bind) and rlcontracts.compactAuthorInput (exact profile input caps, mandatory retention,
 * stable descending-priority whole-fact optional inclusion, over-cap refusal). These exercise production
 * logic directly; no author process and no network are involved.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { eligibleOwnerRead, ineligibleRead, recommendationBrief, profileBudgets } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

test('SCN-002-004: brief validation binds recommendations to eligible owner evidence', () => {
  const read = eligibleOwnerRead();

  // A recommendation-bearing brief whose action family is permitted, whose profile is live-market, and
  // whose cited evidence all exists in the owner read is validated.
  const validBrief = recommendationBrief(read);
  const validResult = RLCONTRACTS.validateToolBrief(validBrief, read, 'live-market');
  assert.equal(validResult.ok, true, validResult.ok ? '' : JSON.stringify(validResult.error));

  // A recommendation citing an evidence identity NOT in the read is rejected: shared/absent evidence
  // cannot support an owner claim (this is the red-stage discriminator — an unsupported author claim
  // must not validate).
  const ghostEvidence = recommendationBrief(read);
  ghostEvidence.recommendations[0].rationaleEvidenceIds = ['fact-rrg-state', 'ghost-evidence-not-in-read'];
  assert.equal(RLCONTRACTS.validateToolBrief(ghostEvidence, read, 'live-market').error.reason, 'recommendation-cited-evidence-absent');

  // A recommendation against an ineligible read is rejected regardless of its own shape.
  const ineligible = ineligibleRead('bond-regime-lab', 'live-market', {
    recommendationEligibility: { eligible: false, reasonCode: 'stale', permittedActionFamilies: [], permittedSubjectBoundary: 'bond-regime-lab' },
    fingerprint: read.fingerprint,
    evidenceRefs: read.evidenceRefs,
    marketSessionEvidenceRef: read.marketSessionEvidenceRef,
    evidenceInterpretations: read.evidenceInterpretations,
    profile: 'live-market'
  });
  const onIneligible = recommendationBrief(read, { toolId: 'bond-regime-lab' });
  onIneligible.recommendations[0].originToolId = 'bond-regime-lab';
  onIneligible.readRef = { ...onIneligible.readRef, fingerprint: ineligible.fingerprint };
  assert.equal(RLCONTRACTS.validateToolBrief(onIneligible, ineligible, 'live-market').error.reason, 'recommendation-read-not-eligible');

  // An action family the read does not permit is rejected.
  const badAction = recommendationBrief(read);
  badAction.recommendations[0].actionFamily = 'trim';
  assert.equal(RLCONTRACTS.validateToolBrief(badAction, read, 'live-market').error.reason, 'recommendation-action-not-permitted');

  // A static/local/off-theme profile may not carry a market recommendation at all.
  const staticRead = eligibleOwnerRead({ profile: 'static-model', toolId: 'ai-capex-strategy-lab' });
  const staticBrief = recommendationBrief(staticRead, { profile: 'static-model' });
  assert.equal(RLCONTRACTS.validateToolBrief(staticBrief, staticRead, 'static-model').error.reason, 'tool-brief-profile-recommendation-forbidden');

  // A no-recommendation outcome that still carries a recommendation is rejected.
  const conflicted = recommendationBrief(read, { outcome: 'no-recommendation' });
  assert.equal(RLCONTRACTS.validateToolBrief(conflicted, read, 'live-market').error.reason, 'tool-brief-outcome-recommendation-conflict');

  // Evidence refs must be an exact subset of the owner read; a new evidence identity is illegal.
  const foreignEvidence = recommendationBrief(read);
  foreignEvidence.evidenceRefs = [{ evidenceType: 'session-aggregate', fingerprint: 'sha256:' + 'f'.repeat(64) }];
  assert.equal(RLCONTRACTS.validateToolBrief(foreignEvidence, read, 'live-market').error.reason, 'tool-brief-evidence-not-in-read');

  // The brief must bind to its read fingerprint exactly.
  const wrongRead = recommendationBrief(read);
  wrongRead.readRef = { ...wrongRead.readRef, fingerprint: 'sha256:' + '1'.repeat(64) };
  assert.equal(RLCONTRACTS.validateToolBrief(wrongRead, read, 'live-market').error.reason, 'tool-brief-read-fingerprint-mismatch');

  // Instruction/markup-shaped content anywhere in the brief is rejected as unsafe.
  const unsafe = recommendationBrief(read, { summary: 'Rotate <script>alert(1)</script> into XLK' });
  assert.equal(RLCONTRACTS.validateToolBrief(unsafe, read, 'live-market').error.reason, 'unsafe-instruction-or-markup');
});

test('SCN-002-005: compaction honors exact profile caps and stable whole-fact priority', () => {
  const budgets = profileBudgets();
  const liveBudget = budgets['live-market'];

  // Two optional facts of equal size but different priority let us prove descending-priority, stable
  // ordering and whole-record inclusion without any truncation.
  const read = eligibleOwnerRead({
    facts: [
      { id: 'fact-required', requiredForBrief: true, briefPriority: 100, value: 'R'.repeat(20) },
      { id: 'fact-high', requiredForBrief: false, briefPriority: 90, value: 'H'.repeat(40) },
      { id: 'fact-low', requiredForBrief: false, briefPriority: 10, value: 'L'.repeat(40) }
    ]
  });

  // A generous cap retains every mandatory field plus all facts; nothing is omitted.
  const full = RLCONTRACTS.compactAuthorInput(read, liveBudget);
  assert.equal(full.ok, true, full.ok ? '' : JSON.stringify(full.error));
  assert.deepEqual(full.value.includedFactIds, ['fact-high', 'fact-low', 'fact-required']);
  assert.equal(full.value.omittedFacts.length, 0);
  assert.ok(full.value.reservedInputTokens <= liveBudget.maxInputTokens);
  assert.equal(full.value.compactedRead.facts.length, 3);

  // The exact byte length that fits the required fact plus ONLY the higher-priority optional. At this cap
  // the required fact and fact-high are included whole and fact-low is omitted (recorded by ID + content
  // fingerprint), proving descending-priority inclusion and exact-cap behavior — never truncation.
  const requiredOnlyRead = eligibleOwnerRead({ facts: [read.facts[0], read.facts[1]] });
  const requiredHighBytes = RLCONTRACTS.compactAuthorInput(requiredOnlyRead, { ...liveBudget, maxInputTokens: 1000000 }).value.reservedInputTokens;
  const tight = RLCONTRACTS.compactAuthorInput(read, { ...liveBudget, maxInputTokens: requiredHighBytes });
  assert.equal(tight.ok, true, tight.ok ? '' : JSON.stringify(tight.error));
  assert.deepEqual(tight.value.includedFactIds, ['fact-high', 'fact-required']);
  assert.equal(tight.value.omittedFacts.length, 1);
  assert.equal(tight.value.omittedFacts[0].id, 'fact-low');
  assert.match(tight.value.omittedFacts[0].fingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.ok(tight.value.reservedInputTokens <= requiredHighBytes);
  // Every included fact is present whole (its full value survived, no truncation).
  const includedLow = tight.value.compactedRead.facts.find((fact) => fact.id === 'fact-low');
  assert.equal(includedLow, undefined);
  const includedHigh = tight.value.compactedRead.facts.find((fact) => fact.id === 'fact-high');
  assert.equal(includedHigh.value, 'H'.repeat(40));

  // Mandatory material alone over the cap refuses with B002-BUDGET rather than summarizing input to fit.
  const overCap = RLCONTRACTS.compactAuthorInput(read, { ...liveBudget, maxInputTokens: 10 });
  assert.equal(overCap.ok, false);
  assert.equal(overCap.error.code, 'B002-BUDGET');
  assert.equal(overCap.error.reason, 'mandatory-material-exceeds-cap');

  // The conservative reservation is the UTF-8 byte length plus the fixed prompt reserve — a token is
  // never smaller than a byte, so the byte length is a safe upper bound on tokens.
  assert.equal(full.value.reservedInputTokens, full.value.inputByteLength + liveBudget.promptReserveBytes);

  // A malformed fact (missing priority) fails loud rather than defaulting.
  const badFactRead = eligibleOwnerRead({ facts: [{ id: 'fact-x', requiredForBrief: false }] });
  assert.equal(RLCONTRACTS.compactAuthorInput(badFactRead, liveBudget).error.reason, 'author-input-fact-priority');
});
