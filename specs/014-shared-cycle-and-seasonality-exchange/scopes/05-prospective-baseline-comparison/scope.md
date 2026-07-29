# Scope 5: Prospective baseline comparison

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 4 (`04-consumption-ledger-and-type-dispatch`)
**Tags:** `overlay:true`

**Primary Outcome:**
`RLCYCX.freezeComparison`, `RLCYCX.accrue`, and `RLCYCX.report` complete the `cycle-comparison/v1` lifecycle, and that
lifecycle is prospective by construction rather than by convention. A comparison freezes ex ante against the **identical**
unadjusted baseline for the reading — the same subject, the same input series, the same vintage discipline — and only
observations dated after the freeze time accrue to it. A freeze time that falls after the earliest already-accrued
observation invalidates the comparison outright, reaches no `reported` state, produces no superiority claim, and is
recorded as an audit finding regardless of how favourable the underlying numbers are. A candidate baseline whose
adjustment posture differs from the reading refuses the freeze, and no reconciliation, rescaling, or posture-conversion
path is offered anywhere on that refusal. A window that closes with fewer observations than it declared resolves to the
terminal state `insufficient`, which is stated as insufficient and never dressed as partial, early, or preliminary. A
`reported` comparison whose result is favourable is presented as a comparison; an attempt to express it as validated
superiority is refused. Every one of these refusals is terminal and non-upgradable: a refused comparison never becomes
`reported` on a retry with the same inputs, and no refusal mutates evidence, applicability, or consumption state that
was admitted before it.

---

## Business Scenarios owned

### BS-014-026: A prospective comparison is frozen ex ante against the identical unadjusted baseline

```gherkin
Scenario: Only post-freeze data accrues, and the result is reported as a comparison
  Given a published cycle evidence record and an identical unadjusted baseline sharing the same subject, the same input series, and the same vintage discipline
  When A2 declares the comparison with its observation window and freezes it before that window opens
  Then the comparison state is frozen and then accruing
  And only observations dated after the freeze time accrue to the comparison
  And when the window closes with sufficient observations the state becomes reported and the result is presented as a comparison rather than as validated superiority
```

### BS-014-027: An in-sample or retrospective superiority claim is refused

```gherkin
Scenario: A back-dated freeze invalidates the comparison instead of producing a result
  Given a proposed comparison whose declared freeze time is later than the earliest observation already accrued to it
  When A2 submits the comparison for reporting
  Then the comparison is refused as invalid
  And no reported state is reached and no superiority claim is produced
  And A7 records the retrospective freeze as a finding regardless of the underlying numbers
```

### BS-014-028: A baseline with a mismatched adjustment posture refuses the comparison

```gherkin
Scenario: Cross-posture comparison is refused rather than reconciled
  Given a cycle-informed reading whose inputs carry the adjusted posture
  And a candidate baseline whose inputs carry the unadjusted posture and which is not the identical unadjusted baseline for that reading
  When A2 attempts to freeze the comparison between them
  Then the comparison is refused
  And no reconciliation, rescaling, or posture conversion is performed
  And the refusal reason names the adjustment posture mismatch
```

### BS-014-029: An accruing comparison that closes short is reported as insufficient

```gherkin
Scenario: Too few post-freeze observations yields insufficient, not an early result
  Given a frozen comparison whose observation window has closed with fewer observations than it declared
  When A2 reports the comparison
  Then the comparison state is insufficient
  And the comparison is presented as insufficient rather than as a partial, early, or preliminary result
```

---

## Implementation Plan

1. **Add the `cycle-comparison/v1` contract to `rlcycx.js`** exactly as `design.md` → `### C-7` defines it, registered in
   the same deeply frozen contract table as the foundation's other contracts, with the closed comparison-state vocabulary
   `frozen` / `accruing` / `reported` / `insufficient` / `refused` and no sixth value.
2. **Implement `RLCYCX.freezeComparison(reading, baseline, window, decisionTime)` in `rlcycx.js`.** It validates the
   window first — `closesAt` strictly after `opensAt` and `declaredObservationCount` strictly greater than zero, refusing
   with `cyc-comparison-window-invalid` naming the offending field — then validates baseline identity, then validates
   adjustment posture, and only then emits the `frozen` record carrying an explicit `frozenAt` drawn from the caller's
   `decisionTime`. No entry point reads an ambient clock.
3. **Implement baseline identity in `rlcycx.js`** as identity, not value equality: the baseline must be *the* identical
   unadjusted baseline for the reading — same subject identity, same input-series identity, same vintage discipline. A
   baseline that is numerically equivalent but distinct refuses with `cyc-baseline-not-identical` naming the dimension
   that differs.
4. **Implement adjustment-posture matching in `rlcycx.js`** so a reading carrying `adjusted` inputs paired with a baseline
   carrying `unadjusted` inputs refuses with `cyc-baseline-posture-mismatch` naming both postures. The refusal record
   exposes no reconcile, rescale, or posture-conversion affordance, and the module exports no function that would perform
   one.
5. **Implement `RLCYCX.accrue(comparison, observation, decisionTime)` in `rlcycx.js`** so an observation accrues only when
   its observation date is strictly after `frozenAt`. An observation dated at or before the freeze time is excluded and
   the exclusion is recorded on the comparison, so a caller cannot mistake exclusion for absence.
6. **Implement retrospective-freeze detection in `rlcycx.js`** so a declared `frozenAt` that falls after the earliest
   already-accrued observation refuses with `cyc-freeze-retrospective`, reaches no `reported` state, produces no
   superiority claim, and emits an audit finding on the refusal record. The check runs before any result is computed, so
   the favourability of the numbers cannot influence it.
7. **Implement `RLCYCX.report(comparison, decisionTime)` in `rlcycx.js`** so a window closing with fewer accrued
   observations than `declaredObservationCount` resolves to the terminal state `insufficient`, and the record carries no
   result value and no partial, early, or preliminary label. A window closing with sufficient observations resolves to
   `reported` and the record is shaped as a comparison; any attempt to express the outcome as validated superiority
   refuses with `cyc-superiority-claim`.
8. **Enforce refusal terminality in `rlcycx.js`** so every comparison refusal is a terminal state that a repeat call with
   the same inputs reproduces identically, and so no refusal path writes to the evidence record, the applicability
   decision, or the consumption ledger that preceded it.
9. **Extend `tests/fixtures/shared-cycle-exchange/**`** with the comparison fixture family: a reading with its identical
   unadjusted baseline and a full post-freeze observation series; a pre-freeze observation whose inclusion would improve
   the result; an equivalent-but-not-identical baseline; an `adjusted` reading paired with an `unadjusted` baseline; a
   favourable reading with a back-dated freeze; a short-closing window; and the two invalid-window cases. Each negative
   fixture violates exactly one rule and carries a sibling `*.expected.json` naming the expected `refusalCode` and
   `refusalField`.
10. **Extend `tests/shared-cycle-exchange.unit.mjs`** with the window-validation and freeze/accrue state-machine tests, and
    **extend `tests/shared-cycle-exchange.functional.mjs`** with the retrospective-freeze, posture-mismatch,
    baseline-identity, superiority-claim, and short-close tests.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field — `refusalField` for the window and
identity rows, both posture values for the posture row, and the audit finding for the retrospective-freeze row. No row
asserts only that "a refusal occurred", and no row contains an early-exit bailout. Every negative fixture is one the
permissive implementation this scope replaces would have accepted, so reverting the behaviour makes the row fail. The
`cycle-comparison/v1` rendering assertions on the Power comparison panel are carried by Scope 7's lab suite, which owns
the `e2e-ui` surface per the `_index.md` refusal-code ownership map.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Unit | T-05-U1 | `unit` | BS-014-029 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-comparison-window-invalid` fires with `refusalField: closesAt` when `closesAt <= opensAt`, and separately with `refusalField: declaredObservationCount` when that count is `0`. Both fixtures are otherwise complete and would freeze cleanly, so a check that validated only baseline identity or posture would admit them. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-05-U2 | `unit` | BS-014-026 | `tests/shared-cycle-exchange.unit.mjs` | The lifecycle runs `frozen` then `accruing`, and an observation dated **at or before** `frozenAt` whose inclusion would materially improve the result is excluded and recorded as excluded rather than silently dropped. An implementation accruing every supplied observation passes only if this pre-freeze observation is present, which is why the fixture carries it. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-05-U3 | `unit` | BS-014-026, BS-014-029 | `tests/shared-cycle-exchange.unit.mjs` | The comparison-state vocabulary is closed to `frozen`, `accruing`, `reported`, `insufficient`, `refused`; a sixth value is refused rather than passed through, and `insufficient` is asserted terminal — a repeat `report` call with the same inputs returns `insufficient` again and never upgrades to `reported`. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Functional | T-05-F1 | `functional` | BS-014-027 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-freeze-retrospective` fires on a reading whose accrued outcome is **favourable**, and the row asserts both that no `reported` state and no superiority claim is reachable and that an audit finding is emitted on the refusal record. The favourable numbers are the adversarial element: a check that softened on a good result would pass without them. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-05-F2 | `functional` | BS-014-028 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-baseline-posture-mismatch` fires naming both the reading's `adjusted` posture and the baseline's `unadjusted` posture, and the row asserts the module exports no reconcile, rescale, or posture-conversion function and the refusal record carries no such affordance. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-05-F3 | `functional` | BS-014-026 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-baseline-not-identical` fires against a baseline that is numerically **equivalent** to the identical unadjusted baseline but is a distinct series identity. A value-equality check passes this fixture; only an identity check refuses it, which is precisely what the row asserts. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-05-F4 | `functional` | BS-014-026 | `tests/shared-cycle-exchange.functional.mjs` | On a `reported` comparison whose result is favourable, the record is shaped as a comparison and carries no validated-superiority field, and an explicit attempt to express the outcome as superiority refuses with `cyc-superiority-claim` naming the attempted field. The favourable result is what makes the row adversarial. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-05-F5 | `functional` | BS-014-029 | `tests/shared-cycle-exchange.functional.mjs` | A window closing with fewer accrued observations than declared resolves to `insufficient`; the row asserts the record exposes **no** result value and that the state string is none of `partial`, `early`, `preliminary`, and that the accrued observations that do exist are not reported as a reduced result. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-05-F6 | `functional` | BS-014-027, BS-014-028 | `tests/shared-cycle-exchange.functional.mjs` | Comparison refusals are inert with respect to prior admitted state: after each refusal, the evidence record, the applicability decision, and every consumption record written before the attempt are byte-identical to their pre-refusal values, and no comparison refusal writes a consumption record of its own. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Project check | T-05-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the comparison lifecycle and its fixtures land, proving this scope adds no repo-check regression and alters no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 10.**

---

### Definition of Done

#### Core items

- [ ] `cycle-comparison/v1` is registered in `rlcycx.js` exactly as `design.md` → `### C-7` defines it, with a closed five-value comparison-state vocabulary.
- [ ] `RLCYCX.freezeComparison` validates the window, then baseline identity, then adjustment posture, and takes `frozenAt` from the caller's `decisionTime` with no ambient clock read.
- [ ] Baseline matching is identity-based; a numerically equivalent but distinct baseline refuses with `cyc-baseline-not-identical`.
- [ ] A posture mismatch refuses with `cyc-baseline-posture-mismatch`, and no reconcile, rescale, or posture-conversion function is exported or offered.
- [ ] `RLCYCX.accrue` admits only observations dated strictly after `frozenAt` and records each exclusion rather than dropping it.
- [ ] A freeze time falling after the earliest already-accrued observation refuses with `cyc-freeze-retrospective`, reaches no `reported` state, produces no superiority claim, and emits an audit finding — evaluated before any result is computed.
- [ ] A short-closing window resolves to the terminal state `insufficient` carrying no result value and none of the labels `partial`, `early`, `preliminary`.
- [ ] A favourable `reported` comparison is shaped as a comparison, and an attempt to express it as validated superiority refuses with `cyc-superiority-claim`.
- [ ] Every comparison refusal is terminal and non-upgradable, and no refusal path mutates evidence, applicability, or consumption state admitted before it.
- [ ] All five comparison refusal codes owned by this scope per `_index.md` — `cyc-freeze-retrospective`, `cyc-baseline-posture-mismatch`, `cyc-baseline-not-identical`, `cyc-superiority-claim`, `cyc-comparison-window-invalid` — each have a named negative test asserting the exact code string plus its companion field.
- [ ] Every file this scope touches — `rlcycx.js`, `tests/shared-cycle-exchange.unit.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/fixtures/shared-cycle-exchange/**` — is listed in `design.md` → `### Files 014 MAY CREATE`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope extends only 014-owned files. It opens no file Feature 013 owns, touches none of the five counted registries, and does not reopen `rldata.js`, `rlbrief.js`, `rljourney.js`, or `scripts/brief-refresh.mjs`, so its blast radius against the in-flight 013 session is zero.

#### Test items

- [ ] T-05-U1 passes: `cyc-comparison-window-invalid` fires with the correct `refusalField` for both the inverted-window and zero-count fixtures → evidence recorded in `report.md`.
- [ ] T-05-U2 passes: the `frozen` → `accruing` transition holds and a result-improving pre-freeze observation is excluded and recorded as excluded → evidence recorded in `report.md`.
- [ ] T-05-U3 passes: the comparison-state vocabulary is closed and `insufficient` is proven terminal across a repeat report call → evidence recorded in `report.md`.
- [ ] T-05-F1 passes: `cyc-freeze-retrospective` fires on a favourable reading with an audit finding and no reachable `reported` state → evidence recorded in `report.md`.
- [ ] T-05-F2 passes: `cyc-baseline-posture-mismatch` names both postures and no conversion path exists → evidence recorded in `report.md`.
- [ ] T-05-F3 passes: `cyc-baseline-not-identical` fires against an equivalent-but-distinct baseline → evidence recorded in `report.md`.
- [ ] T-05-F4 passes: a favourable `reported` comparison carries no superiority field and an explicit superiority attempt refuses with `cyc-superiority-claim` → evidence recorded in `report.md`.
- [ ] T-05-F5 passes: a short close yields `insufficient` with no result value and none of the softening labels → evidence recorded in `report.md`.
- [ ] T-05-F6 passes: every comparison refusal leaves prior evidence, applicability, and consumption state byte-identical → evidence recorded in `report.md`.
- [ ] T-05-S1 passes: `node scripts/selftest.mjs` is green → evidence recorded in `report.md`.

**Test-related DoD items: 10. Test Plan rows: 10. Parity confirmed.**

---

*Educational research context only — not investment advice.*
