# Design: BUG-004 Occurrence Storage And Semantic Relevance

- **Parent feature:** `specs/008-portfolio-survival-and-brief-lab`
- **Change owner for `rlportfolio.js`:** this packet
- **Superseded commit:** `edbbddf0d fix(008): a repeat completion must not bank a second event`

## Design Brief

### Current State

The candidate storage path rejects only an exact `eventId`. The parent design previously mixed that occurrence rule with an older semantic write-time rule.

### Target State

Storage preserves every distinct occurrence. Semantic projection contributes one canonical completion to score, floors, and rank.

### Patterns To Follow

- Reuse `BehaviorOccurrence/v1` as the storage uniqueness contract.
- Reuse `BehaviorEventIdentity/v1` as the semantic projection contract.
- Reuse the earliest-eligible-occurrence rule and the workspace pointer-swap transaction.

### Patterns To Avoid

- Do not combine semantic identity with civil date as a storage key. That rule discards audit evidence.
- Do not sum repeated semantic occurrences before score, floor, or rank derivation. That rule inflates relevance.

### Resolved Decisions

- BUG-004 is authoritative because it contains the complete eight-file bug packet.
- BUG-003 described the same defect and contained only three artifacts when inspected.
- The parent specification stays unchanged.

### Open Questions

None for design.

## Ownership Status

This file records the confirmed diagnosis, adopted behavior decision, completed
parent design reconciliation, and remaining owner packets.

BUG-003 and BUG-004 describe the same defect. Both name commit `edbbddf0d`,
`buildBehaviorCandidate()`, same-day semantic-plus-civil-date rejection, the
exact-`eventId` candidate, and `BehaviorOccurrence/v1` as authority.

BUG-003 appeared first and contained only `bug.md`, `spec.md`, and `design.md`
when authority was selected. BUG-004 contains the complete eight-file packet
and records the concurrent number collision. BUG-004 is therefore the
authoritative packet.

The BUG-003 folder remained present through authority selection, then
disappeared during concurrent work before final validation. This design run did
not delete, rename, or merge it. The untracked occurrence carrier still uses
BUG-003 labels, so attribution repair belongs to `bubbles.test`.

## Decision

`BehaviorOccurrence/v1` is the correct long-term contract. The append-time
duplicate key is `eventId`, which is the occurrence identity.

The parent `design.md` D1-Q2 defines the occurrence record as
`{ eventIdentity, occurredAt, newYorkCivilDate, occurrenceId }`. A repeated
research completion on the same civil day is a distinct, independently auditable
OCCURRENCE that shares ONE semantic `eventIdentity`. Only an EXACT occurrence
repeat is a `duplicate`.

The adopted production text in `buildBehaviorCandidate` is:

```js
// Appending an event is a normal workspace revision, so it inherits the same pointer-swap
// commit and generation check as a portfolio or mandate change. An exact occurrence repeat
// is recorded as `duplicate`; later occurrences remain auditable and are collapsed by rankers.
var duplicate = candidate.behaviorEvents.some(function (entry) {
  return entry.eventId === eventResult.value.eventId;
});
```

`buildBehaviorEvent` assigns the two identities separately
(`rlportfolio.js:2272-2273`): `dedupeKey` receives
`identityResult.value.eventIdentity`, which excludes `occurredAt`, and `eventId`
receives `occurrenceResult.value.occurrenceId`, which includes it. The two
fields answer different questions and are not interchangeable.

Four independent surfaces ratify the occurrence model:

1. Parent `design.md` D1-Q2 states that occurrence time is excluded from
   semantic de-duplication but retained for each occurrence.
2. `tests/portfolio-foundation.unit.mjs:737-748` encodes it as an executable
   requirement.
3. `validateWorkspace` refuses two events sharing one `eventId`
   (`rlportfolio.js:1518`, `P008-IDENTITY / duplicate-event-id`), so `eventId`
   is the declared unique key of a stored occurrence. Under the superseded
   predicate the append guard was strictly COARSER than the schema's own key,
   so it refused writes the schema would have accepted.
4. The brief ranker keys its eligible set on `occurrence.occurrenceId`
   (`rlportfoliobrief.js:379-381`), so the write path and the rank path now
   agree on one notion of "the same occurrence".

Discarding evidence is also not reversible. Collapsing at write time destroys
the record that a completion was confirmed twice. Collapsing at read time keeps
the record and presents one completion. Only the second remains recoverable if
the presentation rule later changes.

## Supersedes

This decision supersedes commit
`edbbddf0d fix(008): a repeat completion must not bank a second event`
(2026-08-23), which deduplicated on content identity scoped to the civil day:

```js
// edbbddf0d
var duplicate = candidate.behaviorEvents.some(function (entry) {
  return entry.dedupeKey === eventResult.value.dedupeKey &&
    entry.occurrence.newYorkCivilDate === eventResult.value.occurrence.newYorkCivilDate;
});
```

That commit PREDATES the occurrence model rather than dissenting from it. Its
stated concern was that `eventId` fingerprints `occurredAt` and so could never
match a repeat. The observation is accurate, and it is the point: two reports at
different instants are not the same occurrence. What could never match was an
occurrence repeat that had not actually occurred twice.

The commit combined a semantic key with a coarse time bucket. That created a
third identity rule which neither parent contract defines, and it discarded a
distinct occurrence before the audit stream could retain it.

## Measured Proof

Both arms ran in the current session against the same committed specification
test. `git status --porcelain -- tests/portfolio-foundation.unit.mjs` reported
the file unmodified, and the file hashed identically in both arms at
`dbe43efdd2ce44dc382d00831d342a19877c09b03b8a78bce9068bae53eb65d7`. Only the
predicate differed.

| Arm | `buildBehaviorCandidate` predicate | Result | Exit |
|---|---|---|---|
| Control, pristine `HEAD` worktree at `5d4a27778` | `edbbddf0d` content + civil day | `tests 58`, `pass 57`, `fail 1` | 1 |
| Treatment, working tree | `eventId` occurrence identity | `tests 58`, `pass 58`, `fail 0` | 0 |

The single control failure is `not ok 27 - privacy inventory reports real
category counts and carries no stored subject value`, asserting at
`tests/portfolio-foundation.unit.mjs:738:10`:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

false !== true
```

`false` is `laterOccurrence.value.accepted`. `HEAD` is therefore broken against
its own committed, design-sanctioned specification, and the adopted change
repairs it. Under this repository's doctrine a failing test means the CODE is
fixed, never the test. `tests/portfolio-foundation.unit.mjs` was consumed here
as authority and was not modified.

The control arm ran in a throwaway `git worktree` at `/tmp/rl_bug003_control`,
so no shipped source was mutated to produce it. The worktree was removed after
the run. `report.md` carries the captured output and exit codes.

## Growth Bound

The superseded commit's concern about unbounded evidence growth was legitimate.
It is answered here rather than waved away. Growth is bounded by
`policy.behavior.maxBehaviorEvents`, which
`portfolio-survival-allocation.config.json:173` declares as `500` and
`rlportfolio.js:543` validates as a positive integer.

Both enforcement sites named below were read in the current source.

**Write path, `rlportfolio.js:2423`, inside `buildBehaviorCandidate`:**

```js
if (!duplicate) {
  if (candidate.behaviorEvents.length + 1 > policy.behavior.maxBehaviorEvents) {
    return failure("P008-SCHEMA-CORRUPT", "behavior-event-cap-exceeded", "behaviorEvents", null, true);
  }
  candidate.behaviorEvents.push(eventResult.value);
}
```

At the cap this REFUSES and returns before the `push`, with a recoverable named
error, leaving the store untouched. It does NOT evict an earlier occurrence.
Refusing rather than evicting is the correct behavior for an evidence store,
because silently dropping history would defeat the audit trail this decision
exists to protect.

**Read path, `rlportfolio.js:1511`, inside `validateWorkspace`:**

```js
if (value.behaviorEvents.length > policy.behavior.maxBehaviorEvents) {
  return failure("P008-SCHEMA-CORRUPT", "behavior-event-cap-exceeded", "behaviorEvents", null, false);
}
```

This re-enforces the same cap on read, so a workspace that exceeded it by any
route is refused rather than trusted. The cap is enforced twice more
independently, at `dedupeBehaviorEvents` (`rlportfolio.js:2298`) and brief-side
at `rlportfoliobrief.js:338-340`.

**Plainly stated:** stored occurrence growth IS bounded. The bound is
`maxBehaviorEvents`, currently 500, enforced at the write path before the append
and re-enforced at three read paths. The write path refuses at the cap and never
evicts.

Influence is bounded separately from storage. `deriveInterestSignals`
accumulates into SETS rather than counters (`rlportfolio.js:2476-2477`):

```js
bucket.eventIdentities[event.eventIdentity] = true;
bucket.dates[event.occurrence.newYorkCivilDate] = true;
```

`floorSatisfied` and `relevanceBand` derive from the cardinality of those two
sets (`rlportfolio.js:2489-2493`), `supportingEventIds` is the sorted identity
set, and `signalId` fingerprints only
`{ contractVersion, subjectId, domain, supportingEventIds }`
(`rlportfolio.js:2512-2517`). A same-day repeat therefore moves none of them.
Age bounds derivation further, because `maximumEvidenceAgeDays` excludes stale
occurrences on both paths (`rlportfolio.js:2474`, `rlportfoliobrief.js:448`).

Two further mechanisms bound influence at the ranking layer.
`dedupeBehaviorEvents` (`rlportfolio.js:2305-2313`) retains the EARLIEST
occurrence per `dedupeKey`, and the brief's floor gate
(`rlportfoliobrief.js:462-464`) requires distinct completion identities and
distinct New York civil dates while reporting `floor.rawOccurrenceCount`
separately. Reporting raw occurrences apart from distinct completions is only
meaningful when raw occurrences can exceed distinct completions, which the
superseded predicate prevented within a civil day.

Erasure also remains total. `buildBehaviorClearCandidate` (`rlportfolio.js:3317`)
sets `behaviorEvents` to `[]`, so the owner-facing clear is unaffected by how
many occurrences accumulated.

## What Is Still A Duplicate

This change NARROWS the duplicate rule. It does not remove it. Reading this fix
as "de-duplication was removed" would be wrong.

An incoming event is still refused with `ok: true`, `accepted: false`,
`reason: "duplicate-completion"`, and an unchanged store whenever the store
already holds an event with the same `eventId`, which is the same
`occurrenceId`. Because `occurrenceId` fingerprints
`{ contractVersion, eventIdentity, occurredAt, newYorkCivilDate }`, an exact
occurrence repeat means identical semantic identity AND identical `occurredAt`.
A replayed submission, a double-fired handler, a retried write, and a re-import
of an already-stored row are all still refused and still cannot inflate the
store.

The refusal is a rule over the whole store rather than its head row, because
`some()` matches any stored occurrence. It also runs BEFORE the cap check, so a
replayed report at the cap reads as `duplicate-completion` rather than as
capacity exhaustion.

`tests/portfolio-behavior-occurrence.unit.mjs` pins this half explicitly, and
its final case asserts that BOTH predicates refuse the exact repeat.

## Semantic Projection Boundary

The current `evidenceScore` implementation is not repeat-immune. Both
derivations accumulate per retained occurrence rather than per semantic identity
(`rlportfolio.js:2480`, `rlportfoliobrief.js:452`):

```js
bucket.score += Math.pow(0.5, ageDays / behavior.halfLifeDays);
```

Without downstream collapse, a later same-day occurrence adds decayed weight
where the superseded storage predicate would have discarded it. This is the
implementation gap that the semantic projection boundary must close.

FR-B004-005 and the reconciled parent design close the policy question. The
earliest eligible occurrence per `BehaviorEventIdentity/v1` is the sole score,
floor, signal, and order contribution. Later occurrences remain audit records
and may change only `rawOccurrenceCount`.

Finding `BUG-004-F2` remains open for implementation and adversarial test proof.

The verified blast radius, and the exact limit of what was checked:

- `evidenceScore` is emitted on the `InterestSignal` contract and
  range-validated (`rlportfolio.js:2346`), but it does NOT feed `floorSatisfied`
  or `relevanceBand`, and it does NOT feed `signalId`. Verified by reading the
  derivation at `rlportfolio.js:2489-2517`.
- A repository-wide search for `evidenceScore` across `*.js`, `*.mjs`, and
  `*.html` found no reader on any portfolio surface. The only non-test hits are
  the field-name list, the validator, the assignment, and mirrored copies under
  the generated `_site/` directory.
- The value is bounded above by the 500-occurrence cap and the age window, so it
  cannot grow without limit.

This evidence defines the repair boundary. The implementation must collapse by
semantic identity before score and order derivation, even though the current
score has no located portfolio reader and remains bounded.

## Root Cause Analysis

### Investigation Summary

The investigation compared four concrete surfaces:

1. commit `edbbddf0d`, which introduced semantic-plus-day rejection;
2. `rlportfolio.js`, which defines semantic and occurrence fingerprints;
3. parent D1-Q2, which separates both identities; and
4. the focused unit carrier, which requires a distinct occurrence to persist.

### Root Cause

The storage predicate used fields from two identity layers. `dedupeKey` names
semantic meaning. `newYorkCivilDate` describes an occurrence. The conjunction
discarded a distinct occurrence before the audit stream could retain it.

### Impact Analysis

- **Affected component:** `rlportfolio.js::buildBehaviorCandidate`.
- **Affected projection:** behavior-event storage and privacy inventory counts.
- **Affected test:** the focused privacy-inventory unit row.
- **Residual projection risk:** `deriveInterestSignals()` currently adds score
  inside the occurrence loop without first calling semantic de-duplication.

## Change Boundary

**Included, owned and adopted by this packet:**

- `rlportfolio.js`, function `buildBehaviorCandidate` only: the duplicate
  predicate and its leading comment. This adopts the pre-existing uncommitted
  working-tree change unmodified. The change was inspected against the contracts
  above and found correct, so it is adopted as-is rather than rewritten.
- `tests/portfolio-behavior-occurrence.unit.mjs`: the adversarial regression.
- `specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/**`.

Adopting the `rlportfolio.js` edit closes a real ownership gap. Scope 28 lists
production source under `Excluded`, yet `rlportfolio.js` is production source
and carried this uncommitted, load-bearing change. No scope, bug, or Change
Boundary in this feature declared ownership of it. This packet is that owner.
Re-evaluating Scope 28's own Build Quality Gate row belongs to Scope 28's owner.

**Excluded:**

- `tests/portfolio-foundation.unit.mjs`. It is the committed specification and
  is consumed here as authority. It was verified unmodified before and after
  this work.
- Every other function in `rlportfolio.js`, including `buildBehaviorEvent`,
  `buildBehaviorOccurrence`, `dedupeBehaviorEvents`, and `deriveInterestSignals`.
- `rlportfoliobrief.js`, read as corroborating evidence only.
- The `evidenceScore` accumulation formula. See the open finding above.
- `specs/015-*` and all framework-managed paths under `.github/bubbles/`,
  `.github/agents/bubbles*`, `.github/prompts/bubbles.*`,
  `.github/instructions/bubbles-*`, and `.github/skills/bubbles-*`.
- Commit and push. The adoption stays in the working tree deliberately.

## Regression Design

`tests/portfolio-behavior-occurrence.unit.mjs` contains five cases. All five
pass under the adopted predicate.

| Case | Pins | Adversarial? |
|---|---|---|
| `a later same-civil-day completion is a distinct occurrence under one semantic identity` | R3, R4 | Yes. `accepted` is `false` under the superseded predicate. |
| `an exact occurrence repeat is still refused as a duplicate` | R2 | No by design. This half must hold under both predicates, and pinning it is what stops the fix reading as "de-duplication removed". |
| `a repeated same-day occurrence cannot buy relevance it did not earn` | R5 | Yes. The repeat is not stored under the superseded predicate. |
| `stored occurrence growth is bounded by the declared behaviour-event cap` | R6 | Yes. The second occurrence is not stored under the superseded predicate. |
| `reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red` | AC-6 | Yes. It IS the sensitivity proof. |

Two anti-tautology guards are load-bearing:

- The same-day case asserts both occurrences carry
  `newYorkCivilDate === '2026-07-15'` (lines 106-107). A fixture that straddled
  midnight would be green under BOTH predicates and would prove nothing.
- The mutation case asserts the shipped predicate appears exactly once in the
  module source and that the superseded predicate is absent before mutating. A
  silent no-op replacement would make the whole demonstration vacuous.

The mutation applies to an in-memory copy of the module source and evaluates in
a throwaway browser-shaped root. Nothing on disk is mutated by the test.

## Design Reconciliation

The parent design now separates two boundaries:

1. Storage rejects only an exact `BehaviorOccurrence/v1` identity.
2. Semantic projection retains the earliest eligible occurrence per
  `BehaviorEventIdentity/v1` before score, floors, signal identity, and order.

Civil date remains occurrence metadata and participates only in the distinct-date
floor after semantic collapse. Every occurrence remains available to privacy
inventory and local audit. Repeated publications and later occurrences cannot
change score, eligibility, relevance, or canonical ordering.

### Compatibility And Rollback

The correction keeps both v1 contract versions. Current occurrence-bearing rows
remain byte-stable and require no migration or rehash.

Legacy pre-Scope-18 rows remain read-and-clear compatible. They remain excluded
from relevance because the runtime cannot invent missing generic evidence or
occurrence identity.

A rejected append preserves the active workspace pointer. Rollback selects a
previous validated generation and never collapses rows in place. Reinstating the
semantic-plus-day predicate is not a supported rollback because it restores the
defect. Previously discarded occurrences cannot be backfilled.

## Implementation Owner Packet

**Owner:** `bubbles.implement`, after design reconciliation and a red
anti-inflation test.

1. Preserve the existing exact-`eventId` storage candidate.
2. Apply semantic de-duplication before relevance accumulation.
3. Keep occurrence persistence and privacy counts unchanged.
4. Preserve the current public ranking and explanation contracts.
5. Make no collateral change outside the scope boundary.

## Test Owner Packet

**Owner:** `bubbles.test`.

Preserve the concurrent `tests/portfolio-behavior-occurrence.unit.mjs` carrier.
It distinguishes exact occurrences, checks the floor boundary, and mutates the
superseded predicate in memory. It does not assert equal `evidenceScore` or
ranked order.

Add the missing baseline-versus-augmented score and order discriminators in the
appropriate functional and browser carriers. The augmented stream must contain
more stored occurrences but no new semantic identity.

A test that checks only stored cardinality is insufficient. A test whose added
occurrences also add semantic identities is tautological.

## Alternatives Considered

1. **Semantic-plus-day rejection at storage.** Rejected because it erases a
   distinct occurrence and invents an identity rule.
2. **One stored row per semantic identity.** Rejected because it removes the
   occurrence audit stream required by D1-Q2.
3. **Accept every write without exact-repeat rejection.** Rejected because a
   byte-identical occurrence could inflate storage and inventory counts.

## Complexity Tracking

None. The design separates the two existing identity layers and reuses the
existing semantic de-duplication boundary.
