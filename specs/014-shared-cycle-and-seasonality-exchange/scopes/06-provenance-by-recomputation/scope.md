# Scope 6: Provenance by recomputation

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 4 (`04-consumption-ledger-and-type-dispatch`)
**Tags:** `overlay:true`

**Primary Outcome:**
`RLCYCX.recomputeIdentity(record)` and `RLCYCX.verifyProvenance(record, recomputed)` establish that a model-derived cycle
claim is verified by deterministic recomputation and by nothing else. Recomputation runs from the record's own recorded
inputs, its lineage, its engine version, and its configuration version alone, and reproduces the published record
exactly — including its cycle type and its availability state — before the verdict `reproducible` is issued, and that
verdict cites the recomputation identity rather than any external source. When the recomputation diverges, the verdict is
`not-reproducible` and stays `not-reproducible` even when two independent external web origins publish figures that agree
with the claim: external corroboration is not provenance, it does not enter the verdict function, and no consuming
surface is permitted to present a `not-reproducible` claim as verified on the strength of that agreement. The
`not-reproducible` verdict is terminal and non-upgradable — a repeat adjudication with the same record returns the same
verdict — and no verification path mutates the evidence record, the applicability decision, or the consumption ledger
that preceded it.

---

## Business Scenarios owned

### BS-014-034: A model-derived claim is verified by deterministic recomputation

```gherkin
Scenario: Recorded inputs, lineage, and version reproduce the published record exactly
  Given an admitted envelope carrying a model provenance record with its recorded inputs, its lineage, its engine version, and its configuration version
  When A7 deterministically recomputes the claim from those recorded inputs alone
  Then the recomputation reproduces the published record exactly, including its cycle type and its availability state
  And A7 marks the claim reproducible
  And the verdict cites the recomputation identity rather than any external source
```

### BS-014-035: External corroboration is not provenance for a model-derived claim

```gherkin
Scenario: Two agreeing independent origins do not rescue a claim that fails recomputation
  Given an admitted envelope whose model-derived claim diverges when deterministically recomputed from its recorded inputs
  And two independent external web origins publish figures that agree with the claim
  When A7 adjudicates the claim
  Then A7 marks the claim not-reproducible
  And the agreement of the two external origins does not change the verdict
  And no consuming surface is permitted to present the claim as verified on the basis of that external agreement
```

---

## Implementation Plan

1. **Implement `RLCYCX.recomputeIdentity(record)` in `rlcycx.js`** over the canonicalisation rules the foundation already
   owns, deriving the identity from the record's recorded inputs, lineage, engine version, and configuration version and
   from nothing else. The function is pure, reads no clock, no DOM, no storage, and no network, and its output is a
   string.
2. **Bind cycle type and availability state into the recomputation input set in `rlcycx.js`** so a record that reproduces
   its numeric measurement but not its declared cycle type, or not its declared availability state, does **not** reproduce
   exactly. Exact reproduction is defined over the whole published record, not over its numbers.
3. **Implement `RLCYCX.verifyProvenance(record, recomputed)` in `rlcycx.js`** as a function of the stored identity and the
   recomputed identity only. Equality yields the verdict `reproducible` citing the recomputation identity; inequality
   yields `not-reproducible` carrying `cyc-provenance-not-reproducible` and naming the field whose recomputation diverged.
   The signature accepts no external-source argument, so corroboration is structurally incapable of entering the verdict.
4. **Implement the presentation lock in `rlcycx.js`** so a `not-reproducible` verdict carries an explicit
   non-presentable-as-verified marker that consuming surfaces read, and so any attempt to consume such a claim as verified
   refuses with `cyc-provenance-not-reproducible` naming the attempted presentation. External corroboration, where present
   on the record, is carried through as a labelled non-provenance annotation and never as a verdict input.
5. **Implement verdict terminality in `rlcycx.js`** so `not-reproducible` is reproduced identically by a repeat
   adjudication of the same record, and so no verification path writes to the evidence record, the applicability decision,
   or the consumption ledger.
6. **Extend `tests/fixtures/shared-cycle-exchange/**`** with the provenance fixture family: a record that recomputes
   exactly; a record whose numbers recompute but whose declared cycle type differs; a record whose numbers recompute but
   whose declared availability state differs; a diverging record carrying two independent external origins that agree with
   the claim; and a record identical to the reproducible one except for a perturbed configuration version. Each negative
   fixture violates exactly one rule and carries a sibling `*.expected.json` naming the expected `refusalCode` and
   `refusalField`.
7. **Extend `tests/shared-cycle-exchange.unit.mjs`** with the recomputation-identity and divergence tests, **extend
   `tests/shared-cycle-exchange.functional.mjs`** with the presentation-lock test, **extend
   `tests/shared-cycle-exchange.e2e.mjs`** with the headless byte-identity pairing, and **extend
   `tests/shared-cycle-exchange.stress.mjs`** with identity stability over large evidence families.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string `cyc-provenance-not-reproducible` plus its companion field —
the diverging field name for the recomputation rows and the attempted presentation for the presentation-lock row. No row
asserts only that "a refusal occurred", and no row contains an early-exit bailout. The `not-reproducible` verdict's
rendering in the Power provenance panel is carried by Scope 7's lab suite, which owns the `e2e-ui` surface per the
`_index.md` refusal-code ownership map; this scope proves the verdict function itself.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Unit | T-06-U1 | `unit` | BS-014-034 | `tests/shared-cycle-exchange.unit.mjs` | A record recomputed from its recorded inputs, lineage, engine version, and configuration version alone reproduces the published record exactly and yields `reproducible` citing the recomputation identity. The fixture also carries an external corroborating source that the row asserts is **absent** from the verdict's cited basis, so a verdict that mixed corroboration in fails the row. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-06-U2 | `unit` | BS-014-034 | `tests/shared-cycle-exchange.unit.mjs` | A record whose numeric measurement recomputes exactly but whose declared **cycle type** differs, and separately one whose declared **availability state** differs, each yield `not-reproducible` with `cyc-provenance-not-reproducible` naming the diverging field. An implementation comparing only the numbers passes both fixtures, which is what makes them adversarial. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-06-U3 | `unit` | BS-014-035 | `tests/shared-cycle-exchange.unit.mjs` | A diverging claim accompanied by two independent external origins that agree with it yields `not-reproducible`, and the row asserts the verdict is byte-identical to the verdict produced for the same record with the corroboration removed — proving the agreement is not merely outweighed but structurally excluded from the verdict function. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-06-U4 | `unit` | BS-014-034 | `tests/shared-cycle-exchange.unit.mjs` | Perturbing only the configuration version on an otherwise reproducible record flips the verdict to `not-reproducible`, proving the configuration version is a genuine recomputation input rather than a recorded-but-unused field. Without this row, an implementation ignoring the version would pass T-06-U1. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Functional | T-06-F1 | `functional` | BS-014-035 | `tests/shared-cycle-exchange.functional.mjs` | A `not-reproducible` verdict carries the non-presentable-as-verified marker, and an explicit attempt to consume the claim as verified refuses with `cyc-provenance-not-reproducible` naming the attempted presentation; the row also asserts the external corroboration is carried only as a labelled non-provenance annotation. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-06-F2 | `functional` | BS-014-035 | `tests/shared-cycle-exchange.functional.mjs` | The `not-reproducible` verdict is terminal: a repeat adjudication of the same record returns the identical verdict, and the row asserts the evidence record, the applicability decision, and every prior consumption record are byte-identical before and after both adjudications. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| E2E (headless) | T-06-E1 | `e2e` | BS-014-034 | `tests/shared-cycle-exchange.e2e.mjs` | The headless recomputation path over the provenance fixtures produces a recomputation identity string-identical to the value the same fixtures produce in the unit suite, proving one canonicalisation implementation rather than two agreeing approximations. | `node --test tests/shared-cycle-exchange.e2e.mjs` | No |
| Stress | T-06-ST1 | `stress` | BS-014-034 | `tests/shared-cycle-exchange.stress.mjs` | Recomputation identity is stable over large evidence families and independent of key insertion order and of repeated invocation, so a `reproducible` verdict cannot flip under volume or under a differently-ordered but equivalent record. | `node --test tests/shared-cycle-exchange.stress.mjs` | No |
| Project check | T-06-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after the recomputation and verdict functions and their fixtures land, proving this scope adds no repo-check regression and alters no other feature's registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 9.**

---

### Definition of Done

#### Core items

- [ ] `RLCYCX.recomputeIdentity(record)` is pure, derives its identity from recorded inputs, lineage, engine version, and configuration version alone, and reads no clock, DOM, storage, or network.
- [ ] Exact reproduction is defined over the whole published record: a record reproducing its numbers but not its declared cycle type or its declared availability state does not reproduce.
- [ ] `RLCYCX.verifyProvenance(record, recomputed)` is a function of the stored and recomputed identities only, and its signature accepts no external-source argument.
- [ ] A `reproducible` verdict cites the recomputation identity and cites no external source.
- [ ] A diverging recomputation yields `not-reproducible` carrying `cyc-provenance-not-reproducible` and naming the diverging field.
- [ ] External corroboration is carried as a labelled non-provenance annotation, never as a verdict input, and never changes a verdict.
- [ ] A `not-reproducible` verdict carries the non-presentable-as-verified marker, and consuming it as verified refuses with the exact code.
- [ ] The `not-reproducible` verdict is terminal and non-upgradable, and no verification path mutates evidence, applicability, or consumption state admitted before it.
- [ ] The one surface refusal code owned by this scope per `_index.md` — `cyc-provenance-not-reproducible` — has named negative tests asserting the exact code string plus its companion field on both the recomputation path and the presentation path.
- [ ] Every file this scope touches — `rlcycx.js`, `tests/shared-cycle-exchange.unit.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.e2e.mjs`, `tests/shared-cycle-exchange.stress.mjs`, `tests/fixtures/shared-cycle-exchange/**` — is listed in `design.md` → `### Files 014 MAY CREATE`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope extends only 014-owned files. It opens no file Feature 013 owns, touches none of the five counted registries, and does not reopen `rldata.js`, `rlbrief.js`, `rljourney.js`, or `scripts/brief-refresh.mjs`, so its blast radius against the in-flight 013 session is zero.

#### Test items

- [ ] T-06-U1 passes: an exactly-reproducing record yields `reproducible` citing the recomputation identity with no external source in the cited basis → evidence recorded in `report.md`.
- [ ] T-06-U2 passes: a cycle-type divergence and an availability-state divergence each yield `cyc-provenance-not-reproducible` naming the diverging field → evidence recorded in `report.md`.
- [ ] T-06-U3 passes: two agreeing independent external origins leave the `not-reproducible` verdict byte-identical to the corroboration-free verdict → evidence recorded in `report.md`.
- [ ] T-06-U4 passes: perturbing only the configuration version flips the verdict, proving the version is a real recomputation input → evidence recorded in `report.md`.
- [ ] T-06-F1 passes: the non-presentable-as-verified marker holds and consuming the claim as verified refuses with the exact code → evidence recorded in `report.md`.
- [ ] T-06-F2 passes: the `not-reproducible` verdict is terminal and prior admitted state is byte-identical across repeat adjudication → evidence recorded in `report.md`.
- [ ] T-06-E1 passes: the headless recomputation identity is string-identical to the unit-suite value for the same fixtures → evidence recorded in `report.md`.
- [ ] T-06-ST1 passes: recomputation identity is stable over large families and independent of key insertion order → evidence recorded in `report.md`.
- [ ] T-06-S1 passes: `node scripts/selftest.mjs` is green → evidence recorded in `report.md`.

**Test-related DoD items: 9. Test Plan rows: 9. Parity confirmed.**

---

*Educational research context only — not investment advice.*
