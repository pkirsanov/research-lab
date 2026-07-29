# Scope 2: Fail-closed typed transport

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`)
**Tags:** `overlay:true`

**Primary Outcome:**
The HC-4 transport hardening lands in `rldata.js`: a submission that declares a **known** typed contract id and then
fails validation is refused in full, nothing is written for that identity, and no untyped compact stand-in record is
created. The change is a conditional split inside the `putToolRead` `tool-model-read/v1` branch plus a new pure,
non-persisting public sibling `admitToolRead(id, obj) → { admitted, reason }` that reports the failing field, which
is the minimal shape satisfying a field-attributable refusal without widening `putToolRead`'s return type or touching
the persisted schema. The rule is **additive**: the legacy compact path stays admitted, `rl-tool-read/v1` stays
byte-identical, and the persisted record shape round-trips unchanged. This scope needs no Feature 006 publication and
is demonstrable today against the live `putToolRead`, which is why it is sequenced immediately after the foundation.
Its regression is recorded **failing against unmodified `rldata.js`** before the split lands, because a regression for
a fail-open hole that was never observed failing has not been shown to detect anything.

---

## Business Scenarios owned

### BS-014-020: A malformed typed read is refused, never downgraded to the legacy compact shape

```gherkin
Scenario: Declaring the typed contract and failing it produces a refusal with nothing written
  Given a submission that declares the typed shared-read contract but fails validation on a required field
  When the submission reaches the shared admission path
  Then the admission outcome is refused with a specific validation reason
  And nothing is written to the shared store for that identity
  And no untyped compact stand-in record is created for that identity
  And a consumer that subsequently requests that identity observes absence and writes a consumption record with outcome refused-transport
```

### BS-014-021: A refused submission leaves a previously admitted record untouched

```gherkin
Scenario: Refusal is inert with respect to existing state
  Given an admitted envelope already exists in the shared store for a given identity
  When a malformed typed submission for that same identity reaches the admission path and is refused
  Then the previously admitted envelope remains readable, unchanged, and unexpired
  And its availability state, cycle type, subject scope, adjustment posture, and as-of vintage are byte-identical to their pre-refusal values
```

### BS-014-022: The fail-closed rule is additive to admission and does not retire the compact path

```gherkin
Scenario: A record that declares the compact contract and satisfies it is still admitted
  Given a submission that declares the legacy compact shared-read contract and satisfies that contract
  When the submission reaches the shared admission path
  Then the submission is admitted unchanged
  And the persisted shared-cache record shape is identical to the shape that existed before this capability was introduced
  And no field of the persisted cache schema that Feature 013 depends on is added, removed, or renamed
```

---

## Implementation Plan

1. **Create `tests/rldata-admission-fail-closed.integration.mjs` first**, before any `rldata.js` edit, and run it
   against the **unmodified** `rldata.js`. The `cyc-typed-contract-invalid` case must be observed **failing**, and
   that failing run is the red half of the red-then-green evidence pair recorded in `report.md`.
2. **Rebase onto Feature 013's merged state before writing the `rldata.js` change**, never onto an earlier snapshot.
   `rldata.js` is the one file where 014 and 013 could genuinely collide.
3. **Add the pure sibling `admitToolRead(id, obj)` to `rldata.js`** as a public export returning
   `{ admitted, reason }`. It performs no persistence, reads no clock, and mutates nothing. `reason` names the
   failing field so the refusal is field-attributable.
4. **Split the `tool-model-read/v1` branch inside `putToolRead` in `rldata.js`** conditionally on
   `admitToolRead`'s verdict: admitted submissions follow the existing persistence path unchanged; refused
   submissions return `null` and write nothing. The change stays a conditional split — if the rebase reveals that a
   conditional split is no longer expressible, that is a routed design amendment and not an improvised rewrite.
5. **Keep the fail-closed trigger literal.** It fires **only** when the payload declares a **known** typed contract
   id and then fails validation. A blanket unknown-`contractVersion` refusal is forbidden: it would break
   `sector-rotation-owner-state/v1`, `volatility-owner-state/v1`, `ai-capex-portfolio-owner-state/v1`,
   `real-asset-driver-owner-state/v1`, and `str-scenario-owner-state/v1`.
6. **Change nothing else in `rldata.js`** — no change to the persisted record shape under `d.toolReads[id]`, to
   `load()`, to `save()`, to the `rl-tool-read/v1` branch, or to the legacy compact branch.
7. **Add the contract-equality assertion** to `tests/shared-cycle-exchange.unit.mjs` proving `admitToolRead`'s
   verdict equals `RLCYCX.admitEnvelope`'s admission rule on the same fixture set, so the mirrored rule cannot drift
   from the foundation rule it mirrors.
8. **Add the three coordination regressions** to `tests/rldata-admission-fail-closed.integration.mjs` alongside the
   refusal cases: the legacy compact path still admitted, `rl-tool-read/v1` byte-identical, and the persisted shape
   round-tripping unchanged through `load()` and `save()`.
9. **Record the green half** of the red-then-green pair by re-running the same integration file after the split
   lands, unchanged, and capturing the passing output in `report.md`.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus the field the refusal attributes. Asserting "did not
throw" or "returned something" is banned in this scope: today's fail-open `tool-model-read/v1` branch throws nothing
and returns a stored record, so such an assertion would pass on the bug. No row contains an early-exit bailout.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Integration | T-02-I1 | `integration` | BS-014-020 | `tests/rldata-admission-fail-closed.integration.mjs` | A payload declaring `contractVersion: "tool-model-read/v1"` and failing a required field yields `cyc-typed-contract-invalid`: `putToolRead` returns `null`, **nothing is persisted** for that identity, and `admitToolRead` reports the failing field by name. This row is recorded **failing** against the unmodified `rldata.js` and passing after the split, which is the red-then-green pair for the whole scope. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Integration | T-02-I2 | `integration` | BS-014-020 | `tests/rldata-admission-fail-closed.integration.mjs` | `cyc-typed-contract-partial` fires on a payload whose valid subset would be individually storable, and the row asserts **nothing** was written rather than "less was written" — a partial-write implementation fails this row. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Integration | T-02-I3 | `integration` | BS-014-020 | `tests/rldata-admission-fail-closed.integration.mjs` | `cyc-identity-mismatch` fires when `src.toolId !== id` and **both ids are individually valid registered tool ids**, so an existence check on either id passes and only the cross-check fails the row. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Integration | T-02-I4 | `integration` | BS-014-021 | `tests/rldata-admission-fail-closed.integration.mjs` | A prior admitted record for an identity is captured, a malformed typed submission for the same identity is refused, and the prior record is asserted byte-identical afterwards across its availability state, cycle type, subject scope, adjustment posture, and as-of vintage, and still readable and unexpired. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Integration | T-02-I5 | `integration` | BS-014-022 | `tests/rldata-admission-fail-closed.integration.mjs` | The compact path remains admitted: a payload with an **absent** `contractVersion`, and separately each of `sector-rotation-owner-state/v1`, `volatility-owner-state/v1`, `ai-capex-portfolio-owner-state/v1`, `real-asset-driver-owner-state/v1`, and `str-scenario-owner-state/v1`. Refusing any of the six means HC-4 has been over-applied and the change is wrong. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Integration | T-02-I6 | `integration` | BS-014-022 | `tests/rldata-admission-fail-closed.integration.mjs` | A record written before the change is read identically after it, `load()` and `save()` round-trip byte-identically, and the `rl-tool-read/v1` branch behaves byte-identically before and after — no persisted field is added, removed, or renamed. | `node --test tests/rldata-admission-fail-closed.integration.mjs` | No |
| Unit | T-02-U1 | `unit` | BS-014-020 | `tests/shared-cycle-exchange.unit.mjs` | `admitToolRead`'s verdict string-equals `RLCYCX.admitEnvelope`'s admission verdict across the shared fixture set, including the refusal codes, proving the mirrored in-file rule cannot drift from the foundation rule it mirrors. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-02-U2 | `unit` | BS-014-022 | `tests/shared-cycle-exchange.unit.mjs` | `admitToolRead` is pure: calling it does not write, does not read a clock, and does not mutate its arguments or the shared store, so it is safe to call from a consumer that only wants a verdict. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Project check | T-02-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the `rldata.js` conditional split lands, proving the transport change breaks no existing repo check and no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 9.**

---

### Definition of Done

#### Core items

- [ ] `tests/rldata-admission-fail-closed.integration.mjs` was authored and executed against the **unmodified** `rldata.js` before any edit, and the failing run is recorded verbatim in `report.md` as the red half of the pair.
- [ ] The `rldata.js` change was written **after** rebasing onto Feature 013's merged state, not onto an earlier snapshot.
- [ ] `admitToolRead(id, obj)` exists on `rldata.js` as a public sibling export returning `{ admitted, reason }`, is pure and non-persisting, and names the failing field in `reason`.
- [ ] The change inside `putToolRead` is a conditional split on the `tool-model-read/v1` branch only.
- [ ] The fail-closed trigger is literal: it fires only for a payload declaring a **known** typed contract id that then fails validation, and no blanket unknown-`contractVersion` refusal exists anywhere in the change.
- [ ] `rldata.js` shows no change to the persisted record shape under `d.toolReads[id]`, to `load()`, to `save()`, to the `rl-tool-read/v1` branch, or to the legacy compact branch.
- [ ] The only files this scope touches are `rldata.js` (a `MAY MODIFY` entry, edited within its permitted change only), `tests/rldata-admission-fail-closed.integration.mjs`, and `tests/shared-cycle-exchange.unit.mjs` — all in boundary, and no Protected Surface is opened.
- [ ] **Feature 013 interaction:** `rldata.js` is the single shared file this scope opens and the one place 014 and 013 could collide. The rebase-and-recoordinate rule was applied, the coordination regressions ran after the rebase, and the persisted cache schema Feature 013 depends on is unchanged.
- [ ] The reversal path is a code-only revert with no data migration: reverting the conditional split and deleting the `admitToolRead` sibling restores `putToolRead`'s prior branch behaviour, and records written under 014 are byte-identical to records written without it.

#### Test items

- [ ] T-02-I1 passes: `cyc-typed-contract-invalid` with `putToolRead` returning `null`, nothing persisted, and the failing field named — with **both** the pre-change failing run and the post-change passing run recorded verbatim in `report.md`.
- [ ] T-02-I2 passes: `cyc-typed-contract-partial` asserts nothing was written rather than less was written → evidence recorded in `report.md`.
- [ ] T-02-I3 passes: `cyc-identity-mismatch` fires with both ids individually valid → evidence recorded in `report.md`.
- [ ] T-02-I4 passes: the prior admitted record is byte-identical after the refusal across all five named fields and remains readable and unexpired → evidence recorded in `report.md`.
- [ ] T-02-I5 passes: the absent-`contractVersion` case and all five named compact-path publishers are still admitted → evidence recorded in `report.md`.
- [ ] T-02-I6 passes: persisted shape round-trips byte-identically through `load()` and `save()` and `rl-tool-read/v1` is byte-identical before and after → evidence recorded in `report.md`.
- [ ] T-02-U1 passes: `admitToolRead` and `RLCYCX.admitEnvelope` return equal verdicts and equal refusal codes on the shared fixture set → evidence recorded in `report.md`.
- [ ] T-02-U2 passes: `admitToolRead` performs no write, no clock read, and no argument mutation → evidence recorded in `report.md`.
- [ ] T-02-S1 passes: `node scripts/selftest.mjs` is green after the split → evidence recorded in `report.md`.

**Test-related DoD items: 9. Test Plan rows: 9. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues left unresolved; every negative row verified to fail when the fail-closed behaviour is reverted; `spec.md` and `design.md` unmodified by this scope.

---

*Educational research context only — not investment advice.*
