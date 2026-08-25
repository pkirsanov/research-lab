/*
 * BUG-005 regression: `rlportfolio.deriveInterestSignals` threw an uncaught
 * `RangeError: Invalid time value` whenever EVERY eligible event in a domain fell outside
 * `policy.behavior.maximumEvidenceAgeDays`.
 *
 * The domain bucket was created from an event's STRUCTURAL validity and only afterwards
 * filtered on age, so a stale-only domain kept a bucket whose `latest` stayed null. The signal
 * mapper then evaluated `new Date(Date.parse(null) + ...).toISOString()`, which throws by
 * specification. The throw happened inside `Array.prototype.map`, so one retired domain
 * destroyed the derivation for every fresh domain beside it.
 *
 * The fixture here is ADVERSARIAL in the exact sense the defect requires: the asserted stale
 * domain holds NO in-window event at all. A fixture mixing fresh and stale evidence WITHIN that
 * domain would be tautological — the bucket would acquire a `latest` from the fresh event and the
 * superseded ordering would pass. Vacuity guards assert the measured age against declared policy
 * and assert the stale domain really did store a row, so "no signal emitted" cannot be green
 * because nothing was ever recorded.
 *
 * `reinstating the superseded pre-filter bucket creation` proves sensitivity by mutating module
 * SOURCE TEXT in a throwaway browser-shaped root rather than asserting it, matching the technique
 * already used by `tests/portfolio-behavior-occurrence.unit.mjs`. The mutant differs from shipped
 * source only in WHERE the bucket is created, so it is not a strawman.
 *
 * The refusal assertions pin what the fix must NOT widen, so this file cannot be read as
 * "the evidence-age window was relaxed".
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { ROOT } from './portfolio-survival.support.mjs';

const require = createRequire(import.meta.url);
const MODULE_PATH = resolve(ROOT, 'rlportfolio.js');
const CONTRACTS_PATH = resolve(ROOT, 'rlcontracts.js');
const BRIEF_PATH = resolve(ROOT, 'rlportfoliobrief.js');
const POLICY_PATH = resolve(ROOT, 'portfolio-survival-allocation.config.json');

const RESULT_IDENTITY = `sha256:${'ab12'.repeat(16)}`;
const GENERIC_EVIDENCE_IDENTITY = `sha256:${'cd34'.repeat(16)}`;

const STALE_DOMAIN = 'equity-research';
const FRESH_DOMAIN = 'comparison-research';
const FLOOR_DOMAIN = 'macro-research';
const FUTURE_DOMAIN = 'horizon-research';

const NOW = '2026-07-20T08:00:00.000Z';
/* 190.92 days before NOW against a declared 56-day window. No rounding argument puts it back
   inside, and it is the ONLY event its domain will ever hold. */
const STALE_AT = '2026-01-10T10:00:00.000Z';
const FRESH_FIRST = '2026-07-15T09:05:00.000Z';
const FRESH_SECOND = '2026-07-16T10:00:00.000Z';
/* After NOW, so it fails the same filter through the `ageDays < 0` arm. */
const FUTURE_AT = '2026-08-01T10:00:00.000Z';

/* The shipped ordering: the bucket is created inside the accumulation loop, which only ever runs
   over events that already survived the age filter. */
const SHIPPED_LAZY_CREATE = [
  '      var key = String(event.domain);',
  '      if (!byDomain[key]) {',
  '        byDomain[key] = {',
  '          domain: key,',
  '          subjectKind: "domain",',
  '          horizon: null,',
  '          eventIdentities: Object.create(null),',
  '          dates: Object.create(null),',
  '          latest: null,',
  '          score: 0',
  '        };',
  '      }',
  '      var bucket = byDomain[key];'
].join('\n');
const SUPERSEDED_ALIAS_ONLY = '      var bucket = byDomain[String(event.domain)];';

/* The pre-filter loop tail. Pairing the structural guard with the age computation makes this
   anchor unique: the age computation alone appears in both loops. */
const SHIPPED_PREFILTER_TAIL = [
  '      if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;',
  '      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;'
].join('\n');
const SUPERSEDED_PREFILTER_TAIL = [
  '      if (!event.genericEvidenceIdentity || !event.eventIdentity || !event.occurrence) return;',
  '      var key = String(event.domain);',
  '      if (!byDomain[key]) {',
  '        byDomain[key] = {',
  '          domain: key,',
  '          subjectKind: "domain",',
  '          horizon: null,',
  '          eventIdentities: Object.create(null),',
  '          dates: Object.create(null),',
  '          latest: null,',
  '          score: 0',
  '        };',
  '      }',
  '      var ageDays = (Date.parse(now) - Date.parse(event.occurredAt)) / 86400000;'
].join('\n');

function loadContracts() {
  delete require.cache[require.resolve('../rlportfoliobrief.js')];
  delete require.cache[require.resolve('../rlportfolio.js')];
  return {
    api: require('../rlportfolio.js'),
    brief: require('../rlportfoliobrief.js'),
    policy: JSON.parse(readFileSync(POLICY_PATH, 'utf8'))
  };
}

/* Evaluates module SOURCE TEXT in a throwaway browser-shaped root, which is how this repo proves
   predicate sensitivity without editing and restoring shipped production source. */
function loadFromSource(source) {
  const browserRoot = {};
  Function('globalThis', 'window', 'module', 'exports', 'require',
    `${readFileSync(CONTRACTS_PATH, 'utf8')}\nreturn globalThis.RLCONTRACTS;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  Function('globalThis', 'window', 'module', 'exports', 'require',
    `${source}\nreturn globalThis.RLPORTFOLIO;`)(browserRoot, browserRoot, undefined, undefined, undefined);
  return browserRoot.RLPORTFOLIO;
}

function behaviorDraft(overrides = {}) {
  return {
    category: 'ticker-research-completed',
    completionConditionId: 'risk-panel-reviewed',
    domain: STALE_DOMAIN,
    genericEvidenceIdentity: GENERIC_EVIDENCE_IDENTITY,
    horizon: 'medium-term',
    resultIdentity: RESULT_IDENTITY,
    sourceSurface: 'risk-xray',
    subjectId: 'subject-alpha',
    subjectKind: 'ticker',
    ...overrides
  };
}

function append(api, policy, workspace, now, overrides = {}) {
  const result = api.buildBehaviorCandidate(behaviorDraft(overrides), workspace, { now }, policy);
  assert.equal(result.ok, true, `behavior candidate must build: ${JSON.stringify(result.error || {})}`);
  return result.value.workspace;
}

function emptyWorkspace(api, policy) {
  const empty = api.createEmptyWorkspace(policy, STALE_AT);
  assert.equal(empty.ok, true, 'an empty workspace must be constructible');
  return empty.value;
}

/* One stale-only domain, one domain that clears the floor, one in-window domain below the floor.
   The three coexist so the stale domain's effect on its siblings is observable in one derivation. */
function mixedWorkspace(api, policy) {
  let workspace = emptyWorkspace(api, policy);
  workspace = append(api, policy, workspace, STALE_AT, { domain: STALE_DOMAIN });
  workspace = append(api, policy, workspace, FRESH_FIRST, { domain: FRESH_DOMAIN, subjectId: 'subject-beta' });
  workspace = append(api, policy, workspace, FRESH_SECOND, { domain: FRESH_DOMAIN, subjectId: 'subject-gamma' });
  workspace = append(api, policy, workspace, FRESH_FIRST, { domain: FLOOR_DOMAIN, subjectId: 'subject-delta' });
  return workspace;
}

function freshOnlyWorkspace(api, policy) {
  let workspace = emptyWorkspace(api, policy);
  workspace = append(api, policy, workspace, FRESH_FIRST, { domain: FRESH_DOMAIN, subjectId: 'subject-beta' });
  workspace = append(api, policy, workspace, FRESH_SECOND, { domain: FRESH_DOMAIN, subjectId: 'subject-gamma' });
  return workspace;
}

test('BUG-005: a domain whose every eligible event has aged out yields no signal instead of throwing', () => {
  const { api, policy } = loadContracts();
  const workspace = mixedWorkspace(api, policy);

  // Vacuity guard 1: the stale event must genuinely be outside the DECLARED window, read from
  // policy rather than hardcoded, so a policy change cannot silently make this test inert.
  const measuredAgeDays = (Date.parse(NOW) - Date.parse(STALE_AT)) / 86400000;
  assert.ok(measuredAgeDays > policy.behavior.maximumEvidenceAgeDays,
    `the stale fixture must exceed the declared window: ${measuredAgeDays} vs ${policy.behavior.maximumEvidenceAgeDays}`);

  // Vacuity guard 2: the stale domain must actually have stored evidence, and ALL of it must be
  // out of window. "No signal" is only meaningful if there was something that could have produced one.
  const staleRows = workspace.behaviorEvents.filter((event) => event.domain === STALE_DOMAIN);
  assert.ok(staleRows.length > 0, 'the stale domain must have stored at least one occurrence');
  assert.ok(staleRows.every((event) => (Date.parse(NOW) - Date.parse(event.occurredAt)) / 86400000 > policy.behavior.maximumEvidenceAgeDays),
    'EVERY eligible event in the asserted domain must be stale, or this fixture is tautological');
  assert.ok(staleRows.every((event) => event.lifecycleState === 'eligible'),
    'the stale rows must be eligible, or they would be dropped by an unrelated guard');

  const derived = api.deriveInterestSignals(workspace, NOW, policy);
  assert.equal(derived.ok, true,
    `derivation must return an envelope, not throw: ${JSON.stringify(derived.error || {})}`);
  assert.equal(derived.value.some((signal) => signal.domain === STALE_DOMAIN), false,
    'a domain with no live evidence must not be emitted as an interest signal');

  // Absence is the honest statement, not data loss: the occurrences remain auditable in storage.
  assert.equal(workspace.behaviorEvents.filter((event) => event.domain === STALE_DOMAIN).length, staleRows.length,
    'omitting the signal must not delete the underlying occurrence evidence');
});

test('BUG-005: a future-dated-only domain is omitted through the same filter without throwing', () => {
  const { api, policy } = loadContracts();
  let workspace = emptyWorkspace(api, policy);
  workspace = append(api, policy, workspace, FUTURE_AT, { domain: FUTURE_DOMAIN });

  assert.ok(Date.parse(FUTURE_AT) > Date.parse(NOW),
    'the fixture must be future-dated relative to the derivation instant');
  assert.equal(workspace.behaviorEvents.filter((event) => event.domain === FUTURE_DOMAIN).length, 1);

  const derived = api.deriveInterestSignals(workspace, NOW, policy);
  assert.equal(derived.ok, true, `the ageDays < 0 arm must also return an envelope: ${JSON.stringify(derived.error || {})}`);
  assert.equal(derived.value.some((signal) => signal.domain === FUTURE_DOMAIN), false,
    'a domain whose only evidence is future-dated has no live support and must not be emitted');
});

test('BUG-005: a stale domain must not suppress the fresh domains beside it', () => {
  const { api, policy } = loadContracts();
  const mixed = api.deriveInterestSignals(mixedWorkspace(api, policy), NOW, policy);
  assert.equal(mixed.ok, true, JSON.stringify(mixed.error || {}));

  const freshSignal = mixed.value.find((signal) => signal.domain === FRESH_DOMAIN);
  assert.ok(freshSignal, 'the fresh sibling must still emit its signal');

  // Non-vacuity control in the other direction: the fix must not have made derivation return an
  // empty array. The fresh domain is compared against a workspace that contains ONLY it, which the
  // superseded ordering also derives successfully — so any drift here is caused by this change.
  const isolated = api.deriveInterestSignals(freshOnlyWorkspace(api, policy), NOW, policy);
  assert.equal(isolated.ok, true, JSON.stringify(isolated.error || {}));
  const isolatedSignal = isolated.value.find((signal) => signal.domain === FRESH_DOMAIN);
  assert.ok(isolatedSignal, 'the isolated control must emit the same domain');

  assert.equal(freshSignal.evidenceScore, isolatedSignal.evidenceScore,
    'a stale sibling must not perturb the fresh domain evidenceScore');
  assert.equal(freshSignal.relevanceBand, isolatedSignal.relevanceBand,
    'a stale sibling must not perturb the fresh domain relevanceBand');
  assert.equal(freshSignal.signalId, isolatedSignal.signalId,
    'a stale sibling must not perturb the fresh domain signal identity');
  assert.deepEqual(freshSignal.supportingEventIds, isolatedSignal.supportingEventIds);
  assert.equal(freshSignal.latestSupportAt, FRESH_SECOND);

  // The fresh domain must be a REAL signal, not a degenerate one, or "unchanged" would be vacuous.
  assert.equal(freshSignal.floorSatisfied, true, 'the fresh control must genuinely clear the floor');
  assert.equal(freshSignal.distinctUtcDateCount, 2);
  assert.ok(freshSignal.evidenceScore > 0);
});

test('BUG-005: in-window evidence below the floor is still emitted, so the fix widened nothing', () => {
  const { api, policy } = loadContracts();
  const derived = api.deriveInterestSignals(mixedWorkspace(api, policy), NOW, policy);
  assert.equal(derived.ok, true, JSON.stringify(derived.error || {}));

  const floorSignal = derived.value.find((signal) => signal.domain === FLOOR_DOMAIN);
  assert.ok(floorSignal, 'an in-window domain below the floor must still be reported, not dropped');
  assert.equal(floorSignal.floorSatisfied, false);
  assert.equal(floorSignal.relevanceBand, 'insufficient-evidence');
  assert.equal(floorSignal.supportingEventIds.length, 1);
  assert.equal(floorSignal.latestSupportAt, FRESH_FIRST);

  // The contract that made a stale-only signal unrepresentable is unchanged, and still refuses
  // exactly the shape Candidate A would have required. This is the "what stays rejected" pin.
  assert.equal(api.validateInterestSignal({ ...floorSignal, latestSupportAt: null }, policy).ok, false,
    'a null latestSupportAt must still be refused');
  assert.equal(api.validateInterestSignal({ ...floorSignal, expiresAt: null }, policy).ok, false,
    'a null expiresAt must still be refused');
  assert.equal(api.validateInterestSignal({ ...floorSignal, supportingEventIds: [] }, policy).ok, false,
    'an unsupported signal must still be refused');
  assert.equal(api.validateInterestSignal(floorSignal, policy).ok, true,
    'the emitted signal itself must satisfy the unchanged validator');
});

test('BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red', () => {
  const { api, policy } = loadContracts();
  const shipped = readFileSync(MODULE_PATH, 'utf8');

  // The mutation is only meaningful if it lands on the shipped ordering exactly once each way.
  assert.equal(shipped.split(SHIPPED_LAZY_CREATE).length - 1, 1,
    'the shipped post-filter bucket creation must be present exactly once');
  assert.equal(shipped.split(SHIPPED_PREFILTER_TAIL).length - 1, 1,
    'the shipped pre-filter loop tail must be present exactly once');

  const superseded = shipped
    .replace(SHIPPED_LAZY_CREATE, SUPERSEDED_ALIAS_ONLY)
    .replace(SHIPPED_PREFILTER_TAIL, SUPERSEDED_PREFILTER_TAIL);
  assert.notEqual(superseded, shipped, 'the mutant must differ from shipped source');

  const mutant = loadFromSource(superseded);
  const workspace = mixedWorkspace(api, policy);

  // The mutant still derives fresh-only input correctly, so it is a faithful reinstatement of the
  // superseded ordering rather than a broken module that would throw on anything.
  const mutantFresh = mutant.deriveInterestSignals(freshOnlyWorkspace(api, policy), NOW, policy);
  assert.equal(mutantFresh.ok, true, 'the mutant must remain functional on in-window evidence');

  assert.throws(() => mutant.deriveInterestSignals(workspace, NOW, policy), RangeError,
    'creating the bucket before the age filter must reproduce the RangeError this fix removed');

  // And the shipped module survives the identical input, which is the discrimination.
  const shippedResult = api.deriveInterestSignals(workspace, NOW, policy);
  assert.equal(shippedResult.ok, true, 'the shipped ordering must survive the input that kills the mutant');
});

test('BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance', () => {
  const { api, brief, policy } = loadContracts();
  const workspace = mixedWorkspace(api, policy);

  const derived = api.deriveInterestSignals(workspace, NOW, policy);
  assert.equal(derived.ok, true, JSON.stringify(derived.error || {}));
  assert.equal(derived.value.some((signal) => signal.domain === STALE_DOMAIN), false,
    'the persisted contract states the stale domain by absence');

  const briefResult = brief.deriveInterestSignals({
    behaviorCutoffAt: NOW,
    events: workspace.behaviorEvents,
    policy
  });
  assert.equal(briefResult.ok, true, JSON.stringify(briefResult.error || {}));
  const briefStale = briefResult.value.interestSignals.find((signal) => signal.domain === STALE_DOMAIN);

  // The brief's transient floor-accounting contract states the SAME fact explicitly, because it
  // owns `rawOccurrenceCount` — the field that lets the brief say "history exists but none of it
  // counts". The forms differ; the substantive claim is identical.
  assert.ok(briefStale, 'the brief reports the stale domain so its raw count is not lost');
  assert.equal(briefStale.score, 0);
  assert.deepEqual(briefStale.supportingOccurrenceIds, []);
  assert.equal(briefStale.latestSupportAt, null);
  assert.equal(briefStale.floor.satisfied, false);
  assert.equal(briefStale.floor.distinctCompletionIdentities, 0);
  assert.ok(briefStale.floor.rawOccurrenceCount > 0,
    'the brief must retain the raw count, which is why it emits where the portfolio omits');

  // Neither derivation grants live relevance to the stale domain. That is the agreement.
  const briefFresh = briefResult.value.interestSignals.find((signal) => signal.domain === FRESH_DOMAIN);
  assert.ok(briefFresh, 'the fresh domain must still be reported by both derivations');
  assert.equal(briefFresh.floor.satisfied, true);
  assert.ok(briefFresh.score > 0);
  assert.ok(derived.value.some((signal) => signal.domain === FRESH_DOMAIN));

  // The brief module is untouched by this fix and stays null-safe by construction.
  assert.equal(readFileSync(BRIEF_PATH, 'utf8').includes('if (!isIso(newestCompletedAt)) return'), true,
    'the brief guards its own timestamp parse, which is the guard the portfolio derivation lacked');
});
