# BUG-004 Same-Day Behavior Occurrence Rejection

- **Severity:** High. A valid behavior occurrence can disappear from the local
  audit record.
- **Status:** Root cause confirmed and reproduced by a two-arm differential in
  this session. The repair is adopted and the adversarial regression passes.
  Delivery remains `in_progress` because findings `BUG-004-F1` and
  `BUG-004-F2` are unresolved.
- **Workflow mode:** `bugfix-fastlane`
- **Parent feature:** `specs/008-portfolio-survival-and-brief-lab`
- **Introduced by:** `edbbddf0d32fb3477086ecf0281c46a759264bff`
- **Consolidates:** `BUG-003-behavior-dedup-contradicts-occurrence-model`, deleted

## Number Assignment And Folder Consolidation

`BUG-003` was the next number when this packet was first filed. A concurrent
packet appeared at `BUG-003-behavior-dedup-contradicts-occurrence-model` while
this one was being validated, so this packet moved to `BUG-004` to remove the
duplicate ID.

Both folders described ONE defect. They are now consolidated into this packet.
The other folder held the richer decision analysis and no execution artifacts,
so its analysis was merged into this `bug.md`, `spec.md`, and `design.md`, and
the folder was deleted. `BUG-003` is a retired number for this feature and is
not reused.

## Summary

Commit `edbbddf0d` changed `buildBehaviorCandidate()` to reject events when an
existing row had the same semantic identity and New York civil date. That
predicate conflated `BehaviorEventIdentity/v1` with
`BehaviorOccurrence/v1`.

Feature 008 D1-Q2 excludes occurrence time from semantic identity but retains
it in every occurrence. A subsequent occurrence can therefore share a semantic
identity and civil date while carrying a different `occurrenceId`. Storage must
retain that occurrence for audit. Downstream semantic de-duplication must stop
it from increasing relevance.

## The Contradiction

Parent `design.md` D1-Q2 separates the two identities and says so in the same
paragraph that defines them:

> `BehaviorEventIdentity/v1` is a SHA-256 over category, subject kind, subject
> ID, domain, horizon, source surface, completed result identity, generic
> evidence identity, completion-condition ID, and policy version. **Occurrence
> time is excluded from semantic de-duplication but retained for each
> occurrence.** Only equal semantic identities collapse.
>
> `BehaviorOccurrence/v1` stores `eventIdentity`, `occurredAt`,
> `newYorkCivilDate`, and `occurrenceId`.

The committed, unmodified test `tests/portfolio-foundation.unit.mjs` encodes
that contract at lines 737-753. A later same-civil-day report must be
`accepted: true` with `reason: null`, must keep the SAME `eventIdentity`, must
carry a DIFFERENT `occurrenceId`, and must grow `behaviorEvents.length` to 3.
The same test then requires an EXACT occurrence repeat to be refused with
`duplicate-completion` and to leave the store at 2.

`edbbddf0d` cannot satisfy the first half. Its predicate refuses the later
same-day report.

## Measured Evidence

Both arms ran in the current session against the same committed test file,
hashed identically at
`dbe43efdd2ce44dc382d00831d342a19877c09b03b8a78bce9068bae53eb65d7`.

| Arm | Predicate | Result | Exit |
|---|---|---|---|
| Control, pristine `HEAD` worktree | `edbbddf0d` content + civil day | `tests 58`, `pass 57`, `fail 1` | 1 |
| Treatment, working tree | `eventId` occurrence identity | `tests 58`, `pass 58`, `fail 0` | 0 |

The single control failure is `not ok 27 - privacy inventory reports real
category counts and carries no stored subject value`, asserting `false !== true`
at `tests/portfolio-foundation.unit.mjs:738:10`, where `false` is
`laterOccurrence.value.accepted`. `HEAD` is broken against its own committed,
design-sanctioned specification. Under this repository's doctrine a failing test
means the CODE is fixed, never the test. Full output and exit codes are in
`report.md`.

## Provenance

`edbbddf0d` predates the occurrence model rather than dissenting from it. Its
own message states the concern it was solving:

> Deduplication compared `eventId`, which fingerprints `occurredAt`, so it could
> never match a repeat: the same research completion grew the stored evidence
> every time it was confirmed. Compare content identity scoped to the civil day,
> which is what the function's own contract and the two-day scenario already
> describe.

The observation is accurate and the concern is legitimate. The remedy was
applied at the wrong layer. Stored growth is bounded by the declared event cap,
and INFLUENCE of repeated occurrences is already refused at the derivation and
ranking layers. Collapsing at write time bought nothing those layers did not
already provide, and it destroyed the audit trail the occurrence model exists to
keep. `design.md` records the decision and the growth answer in full.

## Ownership Gap This Packet Closes

Scope 28's Change Boundary lists production source under `Excluded`, yet
`rlportfolio.js` is production source and carried this uncommitted, load-bearing
change. No scope, bug, or Change Boundary in this feature declared ownership of
it. This packet is that owner. It adopts the edit, records the behavior
decision, and carries the regression that keeps the decision from silently
reverting.

## Reproduction Steps

1. Build one valid behavior event from a fixed behavior draft.
2. Persist that event in a valid workspace.
3. Build the same semantic draft at a different instant on the same New York
   civil date.
4. Call `buildBehaviorCandidate()` with the populated workspace.
5. Inspect `accepted`, `reason`, and the stored behavior-event count.

## Expected Behavior

The second occurrence has the same `eventIdentity` and a different `eventId`.
Storage accepts it and preserves both occurrences. Repeating the exact
occurrence rejects the write as `duplicate-completion`.

Semantic de-duplication occurs before relevance score, floor eligibility, and
ordering. Adding same-semantic occurrences cannot change those projections.

## Actual Behavior At The Introducing Commit

The candidate returns `accepted: false` for the distinct same-day occurrence.
Executed in this session against a pristine `HEAD` worktree,
`node --test tests/portfolio-foundation.unit.mjs` reported 58 tests, 57 pass,
1 fail, exit 1. The failing row is `not ok 27 - privacy inventory reports real
category counts and carries no stored subject value`.

## Root Cause

The commit replaced exact occurrence equality:

```text
entry.eventId === eventResult.value.eventId
```

with a storage predicate that combined semantic identity and civil date:

```text
entry.dedupeKey === eventResult.value.dedupeKey
entry.occurrence.newYorkCivilDate === eventResult.value.occurrence.newYorkCivilDate
```

`dedupeKey` is the semantic `eventIdentity`. The civil date is occurrence
metadata. Combining them created a third identity rule that neither parent
contract defines.

## Adopted Change State

The uncommitted `rlportfolio.js` change restores exact `eventId` comparison.
This packet ADOPTS that change unmodified and owns it. The change was inspected
against D1-Q2, the committed specification test, the workspace uniqueness
invariant, and the brief ranker, and was found correct.

`tests/portfolio-behavior-occurrence.unit.mjs` is the adversarial regression. It
ran in the current session and reported 5 tests, 5 pass, 0 fail, exit 0. It pins
both halves of the contract: a later same-day occurrence is accepted with the
same `eventIdentity` and a distinct `occurrenceId`, and an exact repeat is still
refused as `duplicate-completion`. It also pins the cap bound and carries an
in-memory sensitivity proof against the superseded predicate. It does not
compare `evidenceScore` or ranked order.

The uncommitted browser diagnostic in
`tests/portfolio-survival-foundation.spec.mjs` says `duplicateExactOccurrence`.
It is concurrent work, is not owned by this packet, and remains untouched.

## Residual Findings

### BUG-004-F1 - Parent design contradicts D1-Q2

The older `Behavior And Relevance Contract` says one semantic event remains
active and repeated meaning returns the existing event. D1-Q2 separately
defines semantic identity and retained occurrence identity. The parent design
must distinguish storage admission from ranking de-duplication.

Owner: `bubbles.design`.

### BUG-004-F2 - `evidenceScore` is repeat-sensitive and conflicts with FR-B003-005

This finding was verified by reading the derivation in the current source, not
inferred.

`deriveInterestSignals()` accumulates `bucket.score` once per retained
occurrence (`rlportfolio.js:2480`), and `rlportfoliobrief.js:452` repeats the
pattern. Adopting the occurrence model therefore lets a later same-day
occurrence add decayed weight where the superseded predicate discarded it.

Everything else in the projection is repeat-immune, and that was verified too.
`bucket.eventIdentities` and `bucket.dates` are sets, `floorSatisfied` and
`relevanceBand` derive from their cardinalities (`rlportfolio.js:2489-2493`),
and `signalId` fingerprints only
`{ contractVersion, subjectId, domain, supportingEventIds }`
(`rlportfolio.js:2512-2517`). A repository-wide search found no non-test reader
of `evidenceScore` on any portfolio surface.

The blocking part is a contract conflict rather than a safety claim.
`spec.md` FR-B003-005 currently lists evidence score among the projections a
semantic repetition must not change. The adopted fix changes it. Either
FR-B003-005 narrows to exclude `evidenceScore`, or the score must accumulate per
distinct identity. That is a scoring-policy decision for the feature owner, and
this bug fix does not make it.

This conflict is why the packet does not close.

Owners: `bubbles.design` to resolve the contract conflict, then `bubbles.test`
and `bubbles.implement` if the score must change.

## Impact

- A valid local occurrence can be omitted from the audit record.
- Privacy inventory counts can under-report accepted occurrences.
- The exact-occurrence candidate can expose relevance inflation unless the
  downstream semantic boundary is enforced.
- No parent specification change is required. SCN-008-044 and D1-Q2 already
  define the intended behavior.

## Ownership And Routing

The storage repair is adopted, proven, and owned by this packet. The next
required owner is `bubbles.design`, for two reasons.

First, `BUG-004-F1`: the older parent-design text must be reconciled with D1-Q2
so storage admission and ranking de-duplication are distinct.

Second, `BUG-004-F2`: `spec.md` FR-B003-005 and the adopted behavior disagree
about whether `evidenceScore` may move on a semantic repeat. That contract
conflict must be decided before this packet can close.
