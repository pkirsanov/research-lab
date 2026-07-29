# Scope 3: Applicability and consumer authority

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`)
**Tags:** `overlay:true`

**Primary Outcome:**
The gate that precedes every consumption exists and is closed by default. `RLCYCX.decideApplicability` returns a
`cycle-applicability/v1` decision across the four fixed subject dimensions — instrument, sector, geography, and
population — where an **absent** assertion resolves `not-applicable` and says so through `reachedFrom`, a declared
transfer is labelled a declared transfer rather than passed off as native scope, and an unknown fifth dimension is
refused rather than silently dropped. Alongside it, the authority and vintage half of `RLCYCX.consume` is delivered:
a consumer whose id is absent from the EP-3 descriptor set is refused, a declared consumer holding authority over a
different evidence class is refused, and a cutoff the evidence cannot serve is refused **with an earlier vintage
genuinely present and provably not substituted**. Consumer authority is configuration, not code: the descriptor set
lives in `shared-cycle-exchange-universe.json`, so adding a consumer is a config edit that can never become a code
path granting itself authority.

---

## Business Scenarios owned

### BS-014-009: A consumer without declared authority is refused

```gherkin
Scenario: Consumption without declared authority produces a recorded refusal, not a read
  Given an admitted envelope exists for a named subject
  And A3 holds no declared consumer authority for that evidence class and subject class
  When A3 presents that subject and a decision-time cutoff to the envelope
  Then the consumption is refused
  And no cycle value, phase, stage, or occurrence is produced for the consumer
  And exactly one consumption record is written with outcome refused-authority
```

### BS-014-010: An unresolvable vintage is refused without substituting an earlier one

```gherkin
Scenario: A cutoff the evidence cannot serve produces a vintage refusal
  Given an admitted envelope whose inputs cannot be resolved at the cutoff A3 presents
  And an earlier admitted vintage of the same evidence exists in the shared store
  When A3 presents the unservable cutoff to the envelope
  Then the vintage resolves to unresolved-at-cutoff
  And the consumption is refused
  And the earlier vintage is not substituted and is not returned to the consumer
  And exactly one consumption record is written with outcome refused-vintage
```

### BS-014-012: Evidence measured on one subject is not transferred to another

```gherkin
Scenario: A subject-inapplicable transfer is refused rather than approximated
  Given an admitted envelope carrying evidence measured on subject S1 with a declared scope covering S1 only
  And A3 holds declared consumer authority for that evidence class
  When A3 presents subject S2, which differs from S1 in instrument, sector, geography, or population
  Then the subject applicability assertion returns not-applicable
  And no phase, stage, occurrence, or availability value derived from S1 is produced for S2
  And exactly one consumption record is written with outcome refused-applicability naming S1, S2, and the reason
```

### BS-014-013: An absent applicability assertion is treated as not-applicable

```gherkin
Scenario: Silence never authorises transfer at the consumer
  Given an admitted envelope carrying evidence for which no subject applicability assertion is present for the presented subject
  And A3 holds declared consumer authority for that evidence class
  When A3 presents that subject and a decision-time cutoff
  Then the applicability decision is not-applicable
  And the consumption is refused
  And exactly one consumption record is written with outcome refused-applicability recording that the decision was reached from an absent assertion
```

### BS-014-014: A declared transfer is consumed and recorded as a declared transfer

```gherkin
Scenario: An explicit applicability declaration authorises consumption and is named in the record
  Given an admitted envelope carrying evidence measured on subject S1 with an explicit applicability declaration covering subject S2
  And A3 holds declared consumer authority for that evidence class and subject class
  When A3 presents subject S2 and a resolvable decision-time cutoff
  Then the applicability decision is applicable
  And exactly one consumption record is written with outcome consumed
  And that consumption record states that the consumption relied on a declared transfer rather than on native subject scope
```

---

## Implementation Plan

1. **Create `shared-cycle-exchange-universe.json`** following the `<tool>-universe.json` precedent, carrying the
   subject registry, the EP-3 consumer-authority descriptors as declarative
   `{ consumerId, evidenceClasses[], subjectClasses[] }` records, and the EP-2 catalog-source binding. Authority is
   configuration; no code path may grant itself authority.
2. **Implement `RLCYCX.decideApplicability(envelope, presentedSubject)` in `rlcycx.js`** returning
   `cycle-applicability/v1` with a `decision` drawn from the frozen applicability vocabulary and a `reachedFrom`
   field distinguishing an **absent assertion** from a **negative declaration**. Both resolve `not-applicable`; only
   `reachedFrom` tells them apart, and the distinction is what proves silence was refused on its own terms.
3. **Implement the four-dimension subject match in `rlcycx.js`** over instrument, sector, geography, and population.
   All four must match for `applicable`; a three-of-four or any-match rule is a defect. A fifth, unrecognised
   dimension refuses with `cyc-subject-dimension-unknown` rather than being ignored.
4. **Implement the EP-5 subject-scope predicate seam in `rlcycx.js`**, bound from
   `shared-cycle-exchange-universe.json`. The predicate may only **narrow**: it can turn `applicable` into a
   refusal and can never turn a refusal into `applicable`, so silent transfer is structurally unreachable.
5. **Implement declared-transfer labelling in `rlcycx.js`** so an explicit declaration covering a non-native subject
   yields `applicable` and carries a flag naming the consumption as relying on a declared transfer rather than on
   native subject scope.
6. **Implement the authority half of `RLCYCX.consume` in `rlcycx.js`**: resolve the consumer id against the EP-3
   descriptor set, then check the evidence class and the subject class. Presence in the descriptor list is not
   authority; the class must match. A failure at either step writes exactly one consumption record with the
   corresponding refused outcome and produces no cycle value, phase, stage, or occurrence.
7. **Implement the vintage half of `RLCYCX.consume` in `rlcycx.js`**: resolve the requested vintage point-in-time
   against the presented cutoff. An unservable cutoff resolves `unresolved-at-cutoff` and refuses. No earlier
   vintage is substituted and none is returned, even when one is present and would satisfy the request.
8. **Extend `tests/fixtures/shared-cycle-exchange/**`** with the applicability and authority fixtures, including a
   three-of-four dimension match differing only on geography, an absent-assertion fixture whose `declaredSubjects`
   would otherwise have matched, a native-scope-only transfer fixture, a declared-transfer fixture, a descriptor set
   containing a consumer with authority over a different evidence class, and a vintage fixture with an earlier
   admitted vintage genuinely present.
9. **Extend `tests/shared-cycle-exchange.unit.mjs`** with the four applicability negative tests and the
   declared-transfer positive test, and **extend `tests/shared-cycle-exchange.functional.mjs`** with the three
   authority and vintage negative tests, all through the exact-code assertion helper in
   `tests/shared-cycle-exchange.support.mjs`.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field — `reachedFrom` for the
applicability decisions, the authority class for the authority refusals, and the resolved vintage state for the
vintage refusal. No row asserts only that "a refusal occurred". No row contains an early-exit bailout.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Unit | T-03-U1 | `unit` | BS-014-012 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-subject-not-applicable` fires when **three of four** dimensions match and only geography differs, so a three-of-four or any-match rule fails the row; the row also asserts no phase, stage, occurrence, or availability value derived from S1 is produced for S2. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-03-U2 | `unit` | BS-014-013 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-applicability-absent-assertion` fires and the row asserts **both** `decision: not-applicable` **and** `reachedFrom: absent-assertion`. A row asserting only `not-applicable` would pass a negative-declaration bug, so the companion field is the whole test. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-03-U3 | `unit` | BS-014-012, BS-014-014 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-transfer-undeclared` fires for `transferPolicy: native-scope-only` with a presented subject outside native scope, and the row asserts that **no `applicable` decision is reachable by a second call with the same inputs**, so a memoised or retry-widening path fails the row. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-03-U4 | `unit` | BS-014-012 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-subject-dimension-unknown` fires when a fifth dimension is supplied, asserting it is **refused rather than ignored** — silently dropping an unknown dimension is the fail-open this row exists to catch. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-03-U5 | `unit` | BS-014-014 | `tests/shared-cycle-exchange.unit.mjs` | Positive path: an explicit declaration covering S2 yields `decision: applicable`, exactly one consumption record with outcome `consumed`, and that record states the consumption relied on a **declared transfer** rather than on native subject scope — so a declared transfer can never be reported as native coverage. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Functional | T-03-F1 | `functional` | BS-014-009 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-authority-undeclared` fires for a consumer id absent from the EP-3 descriptor set attempting to consume an **otherwise perfectly consumable** envelope, and the row asserts exactly one consumption record with outcome `refused-authority` and no cycle value, phase, stage, or occurrence produced. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-03-F2 | `functional` | BS-014-009 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-authority-class-mismatch` fires for a **declared** consumer holding authority over a different evidence class, proving the class is checked and not merely presence in the descriptor list — a presence-only implementation fails the row. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-03-F3 | `functional` | BS-014-010 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-vintage-unserviceable` fires with an **earlier vintage present in the fixture store that would satisfy the request**, and the row asserts the vintage resolves `unresolved-at-cutoff`, the earlier vintage is neither substituted nor returned, and exactly one consumption record with outcome `refused-vintage` is written. Without the earlier vintage present the row proves nothing, so its presence is the adversarial construction. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-03-F4 | `functional` | BS-014-009, BS-014-013 | `tests/shared-cycle-exchange.functional.mjs` | The EP-3 descriptor set is read from `shared-cycle-exchange-universe.json` as data: adding a descriptor changes the outcome, and no code path in `rlcycx.js` can produce `applicable` or an authorised consumption for a consumer absent from the file. The EP-5 predicate is asserted to narrow only — a predicate returning `applicable` where the four-dimension match refused is itself refused. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Project check | T-03-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after `shared-cycle-exchange-universe.json` and the applicability and authority additions land, proving this scope adds no repo-check regression and touches no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 10.**

---

### Definition of Done

#### Core items

- [ ] `shared-cycle-exchange-universe.json` exists carrying the subject registry, the EP-3 consumer-authority descriptors, and the EP-2 catalog-source binding, following the `<tool>-universe.json` precedent.
- [ ] `RLCYCX.decideApplicability` is implemented and returns `cycle-applicability/v1` with a `decision` from the frozen vocabulary and a `reachedFrom` field that distinguishes an absent assertion from a negative declaration.
- [ ] All four subject dimensions — instrument, sector, geography, population — must match for `applicable`; an unrecognised fifth dimension refuses rather than being ignored.
- [ ] The EP-5 subject-scope predicate seam can only narrow: it can turn `applicable` into a refusal and can never turn a refusal into `applicable`.
- [ ] A declared transfer yields `applicable` and is labelled as a declared transfer in the consumption record, so it can never be reported as native subject scope.
- [ ] The authority half of `RLCYCX.consume` resolves the consumer against the EP-3 descriptor set and then checks the evidence class and subject class; presence in the descriptor list alone is never authority.
- [ ] The vintage half of `RLCYCX.consume` resolves point-in-time against the presented cutoff, refuses on `unresolved-at-cutoff`, and never substitutes or returns an earlier vintage.
- [ ] Every refusal path in this scope writes exactly one consumption record and produces no cycle value, phase, stage, or occurrence for the consumer.
- [ ] Every file this scope touches — `rlcycx.js`, `shared-cycle-exchange-universe.json`, `tests/shared-cycle-exchange.unit.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/fixtures/shared-cycle-exchange/**` — is listed in `design.md` → `### Files 014 MAY CREATE`, and no Protected Surface is opened.
- [ ] **Feature 013 interaction:** this scope creates one new registry file and extends only 014-owned files. It opens no file Feature 013 owns and touches none of the five counted registries, so its blast radius against the in-flight 013 session is zero.

#### Test items

- [ ] T-03-U1 passes: `cyc-subject-not-applicable` fires on a three-of-four dimension match differing only on geography → evidence recorded in `report.md`.
- [ ] T-03-U2 passes: `cyc-applicability-absent-assertion` asserts both `not-applicable` and `reachedFrom: absent-assertion` → evidence recorded in `report.md`.
- [ ] T-03-U3 passes: `cyc-transfer-undeclared` fires and no `applicable` decision is reachable on a repeat call with identical inputs → evidence recorded in `report.md`.
- [ ] T-03-U4 passes: `cyc-subject-dimension-unknown` fires for a fifth dimension rather than the dimension being dropped → evidence recorded in `report.md`.
- [ ] T-03-U5 passes: a declared transfer yields `applicable`, one `consumed` record, and an explicit declared-transfer statement in that record → evidence recorded in `report.md`.
- [ ] T-03-F1 passes: `cyc-authority-undeclared` fires against an otherwise perfectly consumable envelope with one `refused-authority` record and no value produced → evidence recorded in `report.md`.
- [ ] T-03-F2 passes: `cyc-authority-class-mismatch` fires for a declared consumer with the wrong evidence class → evidence recorded in `report.md`.
- [ ] T-03-F3 passes: `cyc-vintage-unserviceable` fires with an earlier satisfying vintage present, and that earlier vintage is provably neither substituted nor returned → evidence recorded in `report.md`.
- [ ] T-03-F4 passes: authority is data-driven from `shared-cycle-exchange-universe.json` and the EP-5 predicate is proven to narrow only → evidence recorded in `report.md`.
- [ ] T-03-S1 passes: `node scripts/selftest.mjs` is green → evidence recorded in `report.md`.

**Test-related DoD items: 10. Test Plan rows: 10. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues left unresolved; every negative row verified to fail when the behaviour it guards is reverted; `spec.md` and `design.md` unmodified by this scope.

---

*Educational research context only — not investment advice.*
