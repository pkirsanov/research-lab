# BUG-004 Expected Behavior Specification

## Problem Statement

Feature 008 stores behavior occurrences for audit and derives relevance from
semantic completion identity. The regression applied a semantic-plus-day rule
at storage, which discarded a distinct occurrence.

This bug specification narrows SCN-008-044 and D1-Q2. It does not change the
parent specification.

## Outcome Contract

**Intent:** Preserve every distinct valid behavior occurrence as an auditable
record while allowing each semantic completion identity to contribute to
relevance only once.

**Success Signal:** `SCN-B004-OCCURRENCE-ADMISSION` passes when a distinct
same-day occurrence is retained under a shared semantic identity and an exact
occurrence repeat is rejected without changing the store.
`SCN-B004-SEMANTIC-ANTI-INFLATION` passes when the augmented stream retains more
occurrences but adds no semantic identity. On the same frozen basis, both
streams produce equal score, floor state, relevance band, and supporting
identities. They also produce equal rank identity and canonical order. The
augmented stream is a FORWARD stream: every added occurrence is at or after the
retained representative. An earlier added occurrence is excluded by
FR-B004-005a and is not verified here.

**Hard Constraints:**

- Occurrence audit retention is append-only. A distinct valid occurrence is
  retained and is never collapsed, evicted, or rewritten as part of admission.
- Exact occurrence identity governs storage admission. Only an existing equal
  `eventId` / `occurrenceId` is rejected, and that rejection leaves the store
  unchanged.
- Semantic anti-inflation governs relevance. Equal semantic identities collapse
  to one canonical contribution before score, floor, band, supporting-identity,
  signal-identity, rank-identity, or ordering derivation. The canonical
  contribution is the EARLIEST occurrence of the identity.
- Rank behavior remains deterministic on a frozen basis. Adding a FORWARD
  occurrence without adding a semantic identity cannot change rank identity or
  canonical order. An added occurrence earlier than the retained representative
  displaces it and is excluded by FR-B004-005a.
- No new sensitive field or value is stored. The repair uses the existing
  semantic and occurrence identity records and existing occurrence metadata.
- Clear and privacy boundaries are not weakened. Privacy inventory may report
  retained occurrence cardinality without exposing a stored subject value, and
  owner clear removes all behavior occurrences and their ranking influence.

**Failure Condition:** The repair fails if it omits a distinct occurrence or
stores an exact repeat. It also fails if a repeated semantic identity reported
at or after the retained representative changes any relevance or rank
projection on the same frozen basis. Storing new sensitive data or leaving
occurrence or ranking influence after owner clear also fails. A displacement
caused by an EARLIER added occurrence is not a failure of this repair; it is
the declared limit in FR-B004-005a and is routed to a follow-up packet.

## Requirements

### FR-B003-000 - Two identities, two jobs

An eligible behavior event carries both identities and they are NOT
interchangeable.

| Field | Assigned from | Excludes `occurredAt`? | Answers |
|---|---|---|---|
| `eventIdentity` / `dedupeKey` | `canonicalBehaviorIdentity(...).eventIdentity` | yes | "which completion is this?" |
| `occurrence.occurrenceId` / `eventId` | `buildBehaviorOccurrence(...).occurrenceId` | no | "which reporting of it is this?" |

`buildBehaviorEvent` MUST keep assigning
`dedupeKey: identityResult.value.eventIdentity` and
`eventId: occurrenceResult.value.occurrenceId`. A change that makes the two
fields equal, or that folds `occurredAt` into `eventIdentity`, breaks this
specification.

### FR-B003-001 - Storage identity is occurrence identity

`buildBehaviorCandidate()` MUST reject a write only when the exact
`BehaviorOccurrence/v1` already exists. Equality MUST use the deterministic
occurrence identity represented by `eventId` and `occurrenceId`.

- Duplicate: `ok: true`, `accepted: false`,
  `reason: "duplicate-completion"`, `behaviorEvents` unchanged in length and in
  content.
- Not duplicate: `ok: true`, `accepted: true`, `reason: null`, the event
  appended.

The refusal MUST be a rule over the whole store rather than its most recent row.

### FR-B004-002 - Semantic identity remains stable across occurrences

Two valid occurrences built from equal semantic fields and different
`occurredAt` values MUST share `BehaviorEventIdentity/v1`. They MUST carry
different `BehaviorOccurrence/v1` identities.

### FR-B004-003 - Civil date does not control storage admission

`newYorkCivilDate` MUST remain occurrence metadata. Equal civil dates MUST NOT
cause a distinct occurrence to be rejected.
Same-civil-day is the discriminating case. A different civil date was never
contested and is retained only as a control proving this requirement is not
"admit everything".

### FR-B003-003a - The append guard agrees with the workspace invariant

`validateWorkspace` refuses any workspace holding two behavior events with the
same `eventId` (`P008-IDENTITY / duplicate-event-id`, `rlportfolio.js:1518`).
`eventId` is therefore the workspace's declared unique key for a stored
occurrence. The append-time duplicate predicate MUST use that same key. A
coarser append-time key refuses writes the schema would have accepted, and a
looser one admits writes the schema will reject.
### FR-B004-004 - Exact repeats remain idempotent

Repeating the same semantic fields and exact `occurredAt` MUST produce the same
occurrence identity. Storage MUST reject that exact repeat without changing the
workspace event count.

### FR-B004-005 - Semantic repetition cannot inflate relevance

Before score, floor eligibility, or ordering is derived, equal semantic
identities MUST collapse to one canonical completion contribution. An
additional occurrence of an already-supported semantic identity whose
`occurredAt` is at or after the retained representative's `occurredAt` may
increase retained audit cardinality, but MUST NOT change:

- supporting semantic identity count;
- distinct-date eligibility;
- evidence score;
- floor satisfaction;
- relevance band;
- signal or rank identity; or
- canonical ranked order.

The complete occurrence stream MUST remain available for local audit.

#### FR-B004-005a - Declared limit: the invariance is forward-only

This requirement holds in ONE direction, and the wording above is scoped to
that direction deliberately rather than by omission.

`dedupeBehaviorEvents` retains the EARLIEST occurrence of a semantic identity
(`rlportfolio.js:2311`). Every projection FR-B004-005 names is therefore a
function of that earliest row. An added occurrence that is EARLIER than the
retained representative REPLACES it, so it moves those projections even though
it adds no semantic identity. That case is OUT OF SCOPE for this packet.

Measured on the shipped modules at `report.md#gaps-b004-x1-probe`, adding an
earlier occurrence of an already-supported identity holds
`distinctCompletionIdentities` at `2` while moving `evidenceScore` from
`1.6062` to `1.5698` and changing `signalId` and `supportingOccurrenceIds`. In
a fixture where the earlier occurrence lands on a civil date already used by
another identity, it also moves `distinctNewYorkCivilDates` from `2` to `1` and
`floorSatisfied` from `true` to `false`.

The exclusion is a DEFERRAL, not a claim of impossibility. The direction is
reachable. `buildBehaviorCandidate` carries no monotonicity guard, the shipped
lab clock is `new Date().toISOString()` rather than a monotonic source, and
`validateWorkspace` enforces only `eventId` uniqueness with no occurrence
ordering invariant, so a rehydrated or externally supplied stream carries no
forward-order guarantee.

Deferral is acceptable HERE for two reasons that are properties of this packet
rather than of the defect. Every candidate repair changes the `evidenceScore`
accumulation that this specification's `Out Of Scope` section already excludes
as a feature decision. Every candidate repair also changes stored `signalId`
values, which is a stored-contract migration and not a bug fix. Resolving it
inside this packet would therefore smuggle a scoring change and a stored-id
migration through a bug lane.

The missing direction is routed to follow-up packet
`BUG-006-earlier-occurrence-displaces-retained-representative`, which is NOT YET
OPENED. This packet MUST NOT be read as having verified it.

### FR-B003-005a - Stored growth is bounded and refuses rather than evicts

`buildBehaviorCandidate` MUST enforce `policy.behavior.maxBehaviorEvents` before
appending. At the cap a NEW occurrence MUST fail with
`P008-SCHEMA-CORRUPT / behavior-event-cap-exceeded` and `recoverable: true`,
leaving the store untouched. Eviction of an earlier occurrence is NOT permitted,
because an evidence store that silently drops history cannot be audited.

At the cap an EXACT repeat MUST still return `ok: true` with `accepted: false`
and `duplicate-completion`, because the duplicate check runs before the cap
check and a replayed report must never read as capacity exhaustion.

### FR-B004-006 - Design vocabulary is reconciled

The parent design MUST distinguish exact-occurrence storage admission from
semantic relevance de-duplication. The older `Eligible Completion Gate`,
`De-Duplication`, and `Deterministic Decay` text MUST not contradict D1-Q2.

### FR-B004-007 - Concurrent work is preserved

The repair MUST preserve the existing uncommitted changes in `rlportfolio.js`,
`tests/portfolio-survival-foundation.spec.mjs`, and
`tests/portfolio-behavior-occurrence.unit.mjs`. It MUST NOT modify the
concurrent `BUG-003-behavior-dedup-contradicts-occurrence-model` packet.

## Acceptance Scenarios

```gherkin
Scenario: A distinct same-day occurrence remains auditable
  Given one stored behavior occurrence for a semantic completion
  When the same semantic completion is recorded at another instant on the same New York civil date
  Then storage accepts the new occurrence
  And both occurrences share one semantic event identity
  And both occurrences have different occurrence identities
  And repeating either exact occurrence is rejected

Scenario: Repeated semantic occurrences cannot increase relevance
  Given a baseline with distinct semantic completion identities and declared civil dates
  And an augmented stream adds same-semantic occurrences on equal and different civil dates
  And every added occurrence is at or after that identity's retained earliest occurrence
  When relevance score, floor eligibility, and canonical ordering are derived
  Then the augmented stream retains more audit occurrences
  And both streams expose equal supporting semantic identities
  And both streams expose equal distinct-date eligibility
  And both streams expose equal score, floor state, relevance band, and ordering
```

## Parent Contract Alignment

SCN-008-044 already requires only exact semantic duplicates to collapse and
requires floors to use distinct eligible dates and completion identities. D1-Q2
already separates `BehaviorEventIdentity/v1` from `BehaviorOccurrence/v1`.

No product-principle, public-data, privacy, release, or configuration contract
changes.

## Acceptance Criteria

| ID | Criterion | Verified by | Current state |
|---|---|---|---|
| AC-1 | The committed specification suite passes end to end | `node --test tests/portfolio-foundation.unit.mjs` reports `pass 58`, `fail 0`, exit 0 | Met, `report.md#cmd-2` |
| AC-2 | FR-B003-002 and FR-B003-003 hold and are adversarial | `tests/portfolio-behavior-occurrence.unit.mjs` case `a later same-civil-day completion is a distinct occurrence under one semantic identity` | Met, `report.md#cmd-1` |
| AC-3 | FR-B003-004 holds, so de-duplication is narrowed and not removed | `tests/portfolio-behavior-occurrence.unit.mjs` case `an exact occurrence repeat is still refused as a duplicate` | Met, `report.md#cmd-1` |
| AC-4 | FR-B004-005 holds for every projection it names, in the forward direction it declares | `tests/portfolio-behavior-occurrence.unit.mjs` case `a repeated same-day occurrence cannot buy relevance it did not earn`, including its baseline-versus-augmented score, identity, and order comparison | Met for the forward direction, `report.md#validate-focused-carrier`. The backward direction is the declared limit FR-B004-005a and is NOT verified here; see `report.md#gaps-b004-x1-probe`. Packet status remains `in_progress` pending validation restart. |
| AC-5 | FR-B003-005a holds | `tests/portfolio-behavior-occurrence.unit.mjs` case `stored occurrence growth is bounded by the declared behaviour-event cap` | Met, `report.md#cmd-1` |
| AC-6 | The regression is red under the superseded predicate | `tests/portfolio-behavior-occurrence.unit.mjs` case `reinstating the superseded content+civil-day predicate turns the accepted-occurrence assertion red`, plus the on-disk control arm in `report.md` | Met, `report.md#control-arm` |
| AC-7 | Repository-wide invariants are unbroken | `node scripts/selftest.mjs` exit 0 with `0 failed`, and `git diff --check` exit 0 | Met, `report.md#cmd-3` and `report.md#cmd-4` |
| AC-8 | FR-B004-006 parent design reconciliation is complete | Parent `design.md` distinguishes storage admission from ranking de-duplication | Met. The current parent design separates exact-occurrence storage from semantic relevance contribution. |

## Out Of Scope

- Any change to `tests/portfolio-foundation.unit.mjs`. It is the committed
  specification and is consumed here as authority, not adjusted.
- Any change to the `evidenceScore` accumulation formula. Changing a scoring
  formula is a feature decision, not a bug fix. The conflict is recorded under
  FR-B003-005 and routed.
- The backward direction of FR-B004-005, where an added occurrence EARLIER than
  the retained representative displaces it. The limit is declared in
  FR-B004-005a, measured at `report.md#gaps-b004-x1-probe`, and routed to
  follow-up packet
  `BUG-006-earlier-occurrence-displaces-retained-representative` (not yet
  opened). It is excluded
  because every candidate repair changes both the excluded `evidenceScore`
  accumulation and stored `signalId` values.
- Committing or pushing. This packet leaves the adoption in the working tree.
