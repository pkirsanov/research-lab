# Scope 4: Consumption ledger and type dispatch

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 3 (`03-applicability-and-consumer-authority`)
**Tags:** `overlay:true`

**Primary Outcome:**
`RLCYCX.consume` is complete and the consumption ledger is real. Exactly one `cycle-consumption/v1` record is written
per attempt — consumed **or** refused — carrying the same named fields either way, so a refusal is a first-class
durable record and is never aggregated into a count, summarised into prose, or omitted. The per-type permitted-field
dispatch is authoritative: a `lifecycle` entry yields a stage from that entry's own declared state vocabulary and
refuses a period, an amplitude, or a phase angle; a `deterministic-calendar` entry yields an occurrence with its
declared `scheduled` / `observed` / `expired` state and refuses a phase, a turn, or a direction. An adjustment posture
that cannot be determined refuses the consumption and leaves the posture **unrecorded** rather than defaulting it, and
a consumer attempting to recompute or replace the publisher's applied correction is refused even when its own
recomputation is more conservative. An `ineligible` long cycle stays `ineligible` at publication, in transport, and at
the consumer, producing no phase, no phase angle, no amplitude, and no next-turn date at any of the three points.

---

## Business Scenarios owned

### BS-014-011: A consumer may not re-derive a corrected p-value

```gherkin
Scenario: Re-deriving or overriding the applied correction is refused at the consumer
  Given an admitted envelope carrying a search breadth and a benjamini-hochberg discovery correction and a holm activation correction applied by the owning engine
  When A3 attempts to recompute or replace the corrected significance carried by the record
  Then the attempt is refused
  And the consumer renders the correction exactly as the owning engine applied it
  And no consumer-authored corrected significance is written to the shared store or to the consumption record
```

### BS-014-015: An insufficient-repetition long cycle is ineligible, terminal, and yields no phase and no next-turn date

```gherkin
Scenario: Repetitions below the catalog minimum terminate the phase claim end to end
  Given a quasi-periodic-oscillation catalog entry whose declared minimum evidence requires four complete repetitions
  And the available as-of-safe history for the covered subject yields fewer than four complete repetitions
  When A2 publishes the record and A3 consumes it for the covered subject under declared authority
  Then the availability state is ineligible at publication, in transport, and at the consumer
  And no phase, no phase angle, no amplitude, and no next-turn date is produced or displayed for that subject
  And exactly one consumption record is written with outcome consumed carrying the ineligible state
```

### BS-014-017: A lifecycle entry is never rendered as an oscillation

```gherkin
Scenario: A lifecycle record yields a stage and refuses a period or phase request
  Given an admitted envelope whose catalog cycle type is lifecycle
  And A3 holds declared consumer authority and presents a covered subject
  When A3 reads the record and then requests a period, an amplitude, or a phase angle from it
  Then A3 renders the lifecycle stage using that catalog entry's own declared state vocabulary
  And the period, amplitude, and phase angle request is refused
  And exactly one consumption record is written naming the consumed cycle type as lifecycle
```

### BS-014-018: A deterministic calendar date is never a turn signal

```gherkin
Scenario: A deterministic-calendar record yields a schedule fact and refuses a turn reading
  Given an admitted envelope whose catalog cycle type is deterministic-calendar and whose minimum evidence is expressed in events
  And A3 holds declared consumer authority and presents a covered subject
  When A3 reads the record and then requests a phase, a turn, or a cycle direction from it
  Then A3 renders the occurrence and its declared state as scheduled, observed, or expired
  And the phase, turn, and direction request is refused
  And exactly one consumption record is written naming the consumed cycle type as deterministic-calendar
```

### BS-014-023: A consumption record captures which inputs the consumer actually read

```gherkin
Scenario: Adjusted versus unadjusted is recorded at consumption, not inferred later
  Given A3 consumes an admitted envelope for a covered subject under declared authority
  And the inputs A3 actually read carry a known adjustment posture
  When the consumption reaches its decision
  Then exactly one consumption record is written naming the consumer, the evidence, the as-of used, the applicability decision, and the outcome
  And that consumption record states whether the consumer read adjusted or unadjusted inputs
```

### BS-014-024: An unknown adjustment posture refuses the consumption instead of defaulting

```gherkin
Scenario: Posture is never assumed to be unadjusted
  Given A3 attempts to consume an admitted envelope where the adjustment posture of the inputs actually read cannot be determined
  When the consumption reaches its decision
  Then the consumption is refused
  And no consumption record records the posture as adjusted or as unadjusted by default
  And the refusal reason names the undeterminable adjustment posture
```

### BS-014-025: A refusal is recorded with the same completeness as a consumption

```gherkin
Scenario: Refusals are first-class records, not omissions or summaries
  Given a set of consumption attempts that produced the outcomes refused-applicability, refused-authority, refused-transport, and refused-vintage
  When A7 reads the consumption ledger for the evidence involved
  Then each refusal appears as its own durable record naming the consumer, the evidence, the as-of used, the applicability decision, and the adjustment posture where determinable
  And no refusal is aggregated into a count, summarised into prose, or omitted from the ledger
```

---

## Implementation Plan

1. **Complete `RLCYCX.consume` in `rlcycx.js`** so every attempt returns exactly one `cycle-consumption/v1` record
   with the same named fields whether the outcome is `consumed` or a `refused-*` value: the consumer, the evidence,
   the as-of used, the applicability decision, the outcome, and the adjustment posture read where determinable.
2. **Implement the per-type permitted-field dispatch in `rlcycx.js`** across all six cycle types, reading the catalog
   type before any measurement field. A `lifecycle` yields a stage from **that entry's own** `stateVocabulary` and
   refuses period, amplitude, and phase angle with `cyc-type-field-unsupported`. A `deterministic-calendar` yields an
   occurrence with a `scheduled` / `observed` / `expired` state and refuses phase, turn, and direction with the same
   code. The consumption record names the consumed cycle type in both cases.
3. **Implement adjustment-posture resolution in `rlcycx.js`** with exactly two legal values. An undeterminable posture
   refuses with `cyc-posture-undeterminable` and leaves `adjustmentPostureRead` **unrecorded** — not defaulted to
   `adjusted` and not defaulted to `unadjusted`.
4. **Implement correction immutability in `rlcycx.js`** so any consumer-side attempt to recompute or replace the
   publisher's applied discovery or activation correction refuses with `cyc-correction-override-attempted`, including
   when the consumer's own recomputation is **more conservative** than the publisher's. The rule is "no consumer-side
   correction", not "no weakening", and no consumer-authored corrected significance reaches the shared store or the
   consumption record.
5. **Implement negative-state terminality in `rlcycx.js`** so `ineligible` resolves identically at publication, in
   transport, and at the consumer, and produces no phase, no phase angle, no amplitude, and no next-turn date at any
   of the three points. A consumption over an `ineligible` record still writes exactly one record with outcome
   `consumed` carrying the `ineligible` state, because the negative state is a value and not an error.
6. **Implement ledger completeness in `rlcycx.js`** so `refused-applicability`, `refused-authority`,
   `refused-transport`, and `refused-vintage` each appear as their own durable record with the same field set as a
   consumption. No aggregation, no prose summary, no omission, and no drop under volume.
7. **Extend `tests/fixtures/shared-cycle-exchange/**`** with the type-dispatch fixtures (a `lifecycle` entry with its
   own state vocabulary, a `deterministic-calendar` entry with event-expressed minimum evidence, both otherwise fully
   valid), an undeterminable-posture fixture, a more-conservative consumer recomputation fixture, an
   insufficient-repetition `quasi-periodic-oscillation` fixture whose catalog minimum is four complete repetitions,
   and a ledger fixture set producing all four refused outcomes.
8. **Extend `tests/shared-cycle-exchange.unit.mjs`** with the two type-dispatch negative tests and **extend
   `tests/shared-cycle-exchange.functional.mjs`** with the posture, correction, ledger-field, and eligibility tests.
9. **Create `tests/shared-cycle-exchange.integration.mjs`** carrying the ledger-completeness test across all four
   refused outcomes.
10. **Create `tests/shared-cycle-exchange.e2e.mjs`** carrying the headless publish → seal → admit → applicability →
    consume path over fixtures, asserting the canonical serialisation is byte-identical to the value the same
    fixtures produce inside the unit suite.
11. **Create `tests/shared-cycle-exchange.stress.mjs`** carrying the ledger-at-volume test: every attempt writes
    exactly one record, and refusals are neither aggregated nor dropped as the family and attempt counts grow.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field — the requested field name for the
type refusals, `adjustmentPostureRead` for the posture refusal, and the record field set for the ledger rows. No row
asserts only that "a refusal occurred". No row contains an early-exit bailout.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Unit | T-04-U1 | `unit` | BS-014-017 | `tests/shared-cycle-exchange.unit.mjs` | On an **otherwise fully valid** `lifecycle` record, a period, an amplitude, and a phase-angle request each refuse with `cyc-type-field-unsupported` naming the requested field, while the stage renders from **that entry's own** declared state vocabulary and the consumption record names the consumed type as `lifecycle`. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-04-U2 | `unit` | BS-014-018 | `tests/shared-cycle-exchange.unit.mjs` | On an **otherwise fully valid** `deterministic-calendar` record whose minimum evidence is expressed in events, a phase, a turn, and a direction request each refuse with `cyc-type-field-unsupported` naming the requested field, while the occurrence renders with a `scheduled` / `observed` / `expired` state and the consumption record names the consumed type as `deterministic-calendar`. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Functional | T-04-F1 | `functional` | BS-014-024 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-posture-undeterminable` fires and the row asserts the outcome is `refused-*` **and** that `adjustmentPostureRead` is left unrecorded — a row that only checked the outcome would pass an implementation defaulting the posture to `adjusted`, so the unrecorded-field assertion is the whole test. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-04-F2 | `functional` | BS-014-011 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-correction-override-attempted` fires when the consumer supplies a recomputed significance that is **more conservative** than the publisher's, proving the rule is "no consumer-side correction" and not "no weakening"; the row also asserts the publisher's Benjamini–Hochberg and Holm corrections render exactly as applied and no consumer-authored value reaches the store or the record. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-04-F3 | `functional` | BS-014-023 | `tests/shared-cycle-exchange.functional.mjs` | A successful consumption writes exactly one record naming the consumer, the evidence, the as-of used, the applicability decision, and the outcome, and states whether the consumer read `adjusted` or `unadjusted` inputs — recorded at consumption rather than inferred from the envelope. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-04-F4 | `functional` | BS-014-015 | `tests/shared-cycle-exchange.functional.mjs` | A `quasi-periodic-oscillation` entry whose catalog minimum is four complete repetitions, given a history yielding fewer than four, resolves `ineligible` at publication, in transport, and at the consumer; the row asserts phase, phase angle, amplitude, and next-turn date are each **absent** at all three points and that exactly one record with outcome `consumed` carries the `ineligible` state. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Integration | T-04-I1 | `integration` | BS-014-025 | `tests/shared-cycle-exchange.integration.mjs` | A fixture set producing `refused-applicability`, `refused-authority`, `refused-transport`, and `refused-vintage` yields four durable records, each carrying the same named field set as a consumption, and the row asserts the ledger contains no count, no prose summary, and no omission — an implementation that rolled refusals into a tally fails the row. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| Integration | T-04-I2 | `integration` | BS-014-023 | `tests/shared-cycle-exchange.integration.mjs` | Interleaved consumed and refused attempts against the same evidence identity produce a ledger whose record count equals the attempt count exactly, with each record's `asOfUsed` and applicability decision matching the attempt that produced it, so no record is coalesced by identity. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| E2E (headless) | T-04-E1 | `e2e` | BS-014-015, BS-014-023 | `tests/shared-cycle-exchange.e2e.mjs` | The full headless path — publish, seal, admit, decide applicability, consume — runs over fixtures with an explicit `decisionTime` and produces a canonical serialisation string-identical to the value the same fixtures produce in the unit suite, proving the Node path is a real check rather than a second implementation. | `node --test tests/shared-cycle-exchange.e2e.mjs` | No |
| Stress | T-04-ST1 | `stress` | BS-014-025 | `tests/shared-cycle-exchange.stress.mjs` | Under a high attempt count mixing consumed and refused outcomes, the ledger writes exactly one record per attempt with zero refusals aggregated, summarised, or dropped, and canonicalisation stays stable over large evidence families. | `node --test tests/shared-cycle-exchange.stress.mjs` | No |
| Project check | T-04-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the consumption ledger, the type dispatch, and the three new test files land, proving this scope adds no repo-check regression and touches no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 11.**

---

### Definition of Done

#### Core items

- [ ] `RLCYCX.consume` writes exactly one `cycle-consumption/v1` record per attempt, with the same named fields whether the outcome is `consumed` or `refused-*`.
- [ ] The per-type permitted-field dispatch reads the catalog type before any measurement field and is authoritative across all six cycle types.
- [ ] A `lifecycle` record renders its stage from that entry's own `stateVocabulary` and refuses period, amplitude, and phase angle with `cyc-type-field-unsupported`.
- [ ] A `deterministic-calendar` record renders an occurrence with a `scheduled` / `observed` / `expired` state and refuses phase, turn, and direction with `cyc-type-field-unsupported`.
- [ ] An undeterminable adjustment posture refuses and leaves `adjustmentPostureRead` unrecorded; neither posture value is ever applied as a default.
- [ ] A consumer-side correction recomputation or replacement is refused regardless of direction, and no consumer-authored corrected significance reaches the shared store or the consumption record.
- [ ] `ineligible` resolves identically at publication, in transport, and at the consumer, and yields no phase, no phase angle, no amplitude, and no next-turn date at any of the three points.
- [ ] The ledger records `refused-applicability`, `refused-authority`, `refused-transport`, and `refused-vintage` as first-class durable records with no aggregation, prose summary, or omission.
- [ ] Every file this scope touches — `rlcycx.js`, `tests/shared-cycle-exchange.unit.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`, `tests/shared-cycle-exchange.e2e.mjs`, `tests/shared-cycle-exchange.stress.mjs`, `tests/fixtures/shared-cycle-exchange/**` — is listed in `design.md` → `### Files 014 MAY CREATE`, and no Protected Surface is opened.
- [ ] **Feature 013 interaction:** this scope extends only 014-owned files and creates three new test files. It opens no file Feature 013 owns, touches none of the five counted registries, and does not reopen `rldata.js`, so its blast radius against the in-flight 013 session is zero.

#### Test items

- [ ] T-04-U1 passes: `cyc-type-field-unsupported` fires for period, amplitude, and phase angle on an otherwise fully valid `lifecycle` record, with the stage rendered from that entry's own vocabulary → evidence recorded in `report.md`.
- [ ] T-04-U2 passes: `cyc-type-field-unsupported` fires for phase, turn, and direction on an otherwise fully valid `deterministic-calendar` record, with the occurrence state rendered → evidence recorded in `report.md`.
- [ ] T-04-F1 passes: `cyc-posture-undeterminable` fires and `adjustmentPostureRead` is asserted unrecorded rather than defaulted → evidence recorded in `report.md`.
- [ ] T-04-F2 passes: `cyc-correction-override-attempted` fires on a **more conservative** consumer recomputation → evidence recorded in `report.md`.
- [ ] T-04-F3 passes: one consumption record names consumer, evidence, as-of used, applicability decision, outcome, and the posture actually read → evidence recorded in `report.md`.
- [ ] T-04-F4 passes: `ineligible` is terminal at all three points with no phase, phase angle, amplitude, or next-turn date, and one `consumed` record carries the state → evidence recorded in `report.md`.
- [ ] T-04-I1 passes: all four refused outcomes appear as durable records with the full field set and no aggregation, summary, or omission → evidence recorded in `report.md`.
- [ ] T-04-I2 passes: ledger record count equals attempt count exactly across interleaved outcomes, with no coalescing by identity → evidence recorded in `report.md`.
- [ ] T-04-E1 passes: the headless publish→consume path produces a canonical serialisation string-identical to the unit-suite value for the same fixtures → evidence recorded in `report.md`.
- [ ] T-04-ST1 passes: exactly one ledger record per attempt at volume with zero refusals dropped and stable canonicalisation over large families → evidence recorded in `report.md`.
- [ ] T-04-S1 passes: `node scripts/selftest.mjs` is green → evidence recorded in `report.md`.

**Test-related DoD items: 11. Test Plan rows: 11. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues left unresolved; every negative row verified to fail when the behaviour it guards is reverted; `spec.md` and `design.md` unmodified by this scope.

---

*Educational research context only — not investment advice.*
