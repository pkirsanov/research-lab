/*
 * tests/distributed-briefs.lifecycle.unit.mjs — Feature 002 Scope 06 (SCN-002-006).
 *
 * Unit coverage for the two pure lifecycle reducers: rlcontracts.reduceRecommendationEvents (idempotent
 * append-only proposal/reaffirm/modify/supersede/close/correction transitions with immutable prior terms)
 * and rlcontracts.groupRecommendations (compatible merge with minimum-retained confidence, shared-evidence
 * origins counted once, incompatible pairs kept as visible conflicts, ineligible exclusions). Foundation
 * identity is derived, never author-owned.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import { recommendationRecord } from './fixtures/feature-002/authorship/brief-fixture-builder.mjs';

const require = createRequire(import.meta.url);
const RLCONTRACTS = require('../rlcontracts.js');

const MONTH = '2026-07';
function run(id) {
  return { runId: id, occurredAt: '2026-07-14T12:41:00.000Z', canonicalMonth: MONTH };
}
function eventTypes(events, key) {
  return events.filter((event) => event.recommendationKey === key).map((event) => event.eventType).sort();
}

test('SCN-002-006: stable identities distinguish reaffirm modify supersede close outcome and correction', () => {
  const recA = recommendationRecord();
  const keysA = RLCONTRACTS.deriveRecommendationKeys(recA);

  // Run 1: a new origin proposes.
  const r1 = RLCONTRACTS.reduceRecommendationEvents(null, [recA], run('run-1'));
  assert.equal(r1.ok, true, r1.ok ? '' : JSON.stringify(r1.error));
  assert.deepEqual(r1.value.events.map((event) => event.eventType), ['proposed']);
  assert.equal(r1.value.events[0].recommendationKey, keysA.originRecommendationKey);
  assert.equal(r1.value.index.entries[keysA.originRecommendationKey].state, 'active');
  const proposedEventId = r1.value.events[0].eventId;

  // Running an identical reduction is idempotent: same event IDs and same index fingerprint.
  const r1again = RLCONTRACTS.reduceRecommendationEvents(null, [recA], run('run-1'));
  assert.deepEqual(r1again.value.events.map((event) => event.eventId), r1.value.events.map((event) => event.eventId));
  assert.equal(r1again.value.index.indexFingerprint, r1.value.index.indexFingerprint);

  // Run 2: identical terms reaffirm by reference (no narrative copy: observationTerms is null).
  const r2 = RLCONTRACTS.reduceRecommendationEvents(r1.value.index, [recA], run('run-2'));
  assert.deepEqual(r2.value.events.map((event) => event.eventType), ['reaffirmed']);
  assert.equal(r2.value.events[0].observationTerms, null);

  // Run 3: a material change (new trigger) keeps the SAME origin key but appends a modified event with a
  // new immutable observation. Prior terms remain addressable under the origin's observation map.
  const recAmod = recommendationRecord({ trigger: 'XLK breaks above the prior swing high' });
  const keysAmod = RLCONTRACTS.deriveRecommendationKeys(recAmod);
  assert.equal(keysAmod.originRecommendationKey, keysA.originRecommendationKey);
  assert.notEqual(keysAmod.observationFingerprint, keysA.observationFingerprint);
  const r3 = RLCONTRACTS.reduceRecommendationEvents(r2.value.index, [recAmod], run('run-3'));
  assert.deepEqual(r3.value.events.map((event) => event.eventType), ['modified']);
  const modifiedEntry = r3.value.index.entries[keysA.originRecommendationKey];
  assert.equal(modifiedEntry.observationFingerprint, keysAmod.observationFingerprint);
  assert.ok(modifiedEntry.observations[keysA.observationFingerprint], 'prior observation terms remain addressable');
  assert.ok(modifiedEntry.observations[keysAmod.observationFingerprint], 'new observation terms are recorded');

  // Run 4: a changed thesis + action is a NEW origin key that supersedes the old one through linked keys.
  const recB = recommendationRecord({ thesisFamily: 'defensive-hedge', actionFamily: 'hedge', supersedesKeys: [keysA.originRecommendationKey] });
  const keysB = RLCONTRACTS.deriveRecommendationKeys(recB);
  assert.notEqual(keysB.originRecommendationKey, keysA.originRecommendationKey);
  const r4 = RLCONTRACTS.reduceRecommendationEvents(r3.value.index, [recB], run('run-4'));
  assert.deepEqual(eventTypes(r4.value.events, keysA.originRecommendationKey), ['superseded']);
  assert.deepEqual(eventTypes(r4.value.events, keysB.originRecommendationKey), ['proposed']);
  assert.equal(r4.value.index.entries[keysA.originRecommendationKey].state, 'superseded');
  const supersededEvent = r4.value.events.find((event) => event.eventType === 'superseded');
  assert.deepEqual(supersededEvent.relatedKeys, [keysB.originRecommendationKey]);

  // Run 5: an explicit closure closes the active interval with the original frozen terms.
  const r5 = RLCONTRACTS.reduceRecommendationEvents(r4.value.index, [], { ...run('run-5'), closures: [{ originRecommendationKey: keysB.originRecommendationKey, eventType: 'satisfied', reasonCode: 'target-reached' }] });
  assert.deepEqual(r5.value.events.map((event) => event.eventType), ['satisfied']);
  assert.equal(r5.value.index.entries[keysB.originRecommendationKey].state, 'closed');

  // Run 6: a correction names the affected event ID and never deletes or edits it.
  const r6 = RLCONTRACTS.reduceRecommendationEvents(r5.value.index, [], { ...run('run-6'), corrections: [{ affectedEventId: proposedEventId, recommendationKey: keysA.originRecommendationKey, reasonCode: 'mislabeled-horizon' }] });
  const correction = r6.value.events.find((event) => event.eventType === 'correction');
  assert.ok(correction);
  assert.deepEqual(correction.relatedKeys, [proposedEventId]);
  // The original proposed event ID is unchanged and re-derivable — corrections append, never mutate.
  assert.equal(r1.value.events[0].eventId, proposedEventId);
});

test('SCN-002-006: compatible origins merge shared causes count once and conflicts remain separate', () => {
  // Two independent origins with the same aggregation key but DIFFERENT evidence merge into one group and
  // count as two independent confirmations; merged confidence is the MINIMUM, never averaged.
  const independentA = recommendationRecord({ originToolId: 'sector-research-lab', rationaleEvidenceIds: ['rrg-state'], confidenceScore: 64 });
  const independentB = recommendationRecord({ originToolId: 'etf-momentum-lab', rationaleEvidenceIds: ['momentum-rank'], confidenceScore: 50 });
  const merged = RLCONTRACTS.groupRecommendations([independentA, independentB]);
  assert.equal(merged.ok, true, merged.ok ? '' : JSON.stringify(merged.error));
  assert.equal(merged.value.groups.length, 1);
  assert.equal(merged.value.groups[0].memberKeys.length, 2);
  assert.equal(merged.value.groups[0].independentOriginCount, 2);
  assert.equal(merged.value.groups[0].mergedConfidenceScore, 50);
  assert.notEqual(merged.value.groups[0].mergedConfidenceScore, 57);
  assert.equal(merged.value.groups[0].sharedEvidenceOrigin, false);

  // Two origins that cite the SAME evidence count once (correlated tools are not independent confirmation).
  const sharedA = recommendationRecord({ originToolId: 'sector-research-lab', rationaleEvidenceIds: ['shared-cpi-surprise'], confidenceScore: 64 });
  const sharedB = recommendationRecord({ originToolId: 'bond-regime-lab', rationaleEvidenceIds: ['shared-cpi-surprise'], confidenceScore: 71 });
  const sharedGroup = RLCONTRACTS.groupRecommendations([sharedA, sharedB]);
  assert.equal(sharedGroup.value.groups.length, 1);
  assert.equal(sharedGroup.value.groups[0].memberKeys.length, 2);
  assert.equal(sharedGroup.value.groups[0].independentOriginCount, 1);
  assert.equal(sharedGroup.value.groups[0].sharedEvidenceOrigin, true);
  assert.equal(sharedGroup.value.groups[0].mergedConfidenceScore, 64);

  // Incompatible direction on a shared subject stays a separate visible conflict, never a merge.
  const bullish = recommendationRecord({ originToolId: 'sector-research-lab', subjects: ['XLK'], actionFamily: 'add', horizon: 'swing', rationaleEvidenceIds: ['breadth'] });
  const bearish = recommendationRecord({ originToolId: 'etf-momentum-lab', subjects: ['XLK'], actionFamily: 'trim', horizon: 'swing', rationaleEvidenceIds: ['momentum'] });
  const conflicted = RLCONTRACTS.groupRecommendations([bullish, bearish]);
  assert.equal(conflicted.value.groups.length, 2);
  assert.equal(conflicted.value.conflicts.length, 1);
  assert.equal(conflicted.value.conflicts[0].reason, 'direction-conflict');

  // Ineligible records are excluded with a reason and never grouped.
  const excluded = recommendationRecord({ marketEligible: false });
  const withExclusion = RLCONTRACTS.groupRecommendations([excluded]);
  assert.equal(withExclusion.value.groups.length, 0);
  assert.equal(withExclusion.value.exclusions.length, 1);
  assert.equal(withExclusion.value.exclusions[0].reason, 'market-ineligible');
});
