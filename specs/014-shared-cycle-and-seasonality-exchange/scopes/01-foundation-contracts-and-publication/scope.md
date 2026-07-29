# Scope 1: Foundation contracts and publication

**Status:** Not Started
**Depends On:** — (foundation scope; nothing precedes it)
**Tags:** `foundation:true`

**Primary Outcome:**
`rlcycx.js` exists as the single T1 foundation for the exchange: UMD, browser and Node, deeply frozen, zero
dependencies, no DOM, storage, network, timer, or ambient clock, with an explicit `decisionTime` on every entry
point. It owns the frozen closed vocabularies (`RLCYCX.VOCAB`), the frozen 47-code refusal registry
(`RLCYCX.REFUSALS`), the canonicalisation rules, and the first four contracts — `cycle-evidence/v1`,
`cycle-catalog-entry/v1`, `cycle-envelope/v1`, and `cycle-admission/v1` — expressed as `publishEvidence`,
`sealEnvelope`, and `admitEnvelope`. On completion, a conforming finding can be published, sealed, and admitted with
its cycle type, subject scope, search breadth, applied corrections, adjustment posture, as-of vintage, availability
state, and model provenance intact, and every one of the 22 publication, catalog, and envelope refusals returns its
exact registry code with its companion field. Every downstream scope reads its vocabulary, its refusal codes, and
its type-dispatch rule from here rather than restating them.

---

## Business Scenarios owned

### BS-014-002: Publication without multiplicity context is refused

```gherkin
Scenario: A finding whose search breadth and correction record cannot be attached is not publishable
  Given A2 holds a cycle evidence record whose evidence family has no search breadth and no applied discovery or activation correction available
  When A2 attempts to package the record into a typed exchange envelope
  Then the publication is refused
  And no envelope exists for that publisher identity
  And no partial or breadth-stripped record is written to the shared store
  And the refusal reason names the missing search breadth and correction record
```

### BS-014-003: Correlated findings are counted as one evidence family, not as multiple confirmations

```gherkin
Scenario: Findings sharing series, mechanism, and sweep identity resolve to a single family
  Given A1 produced three cycle evidence records derived from the same underlying series, the same mechanism, and the same hypothesis sweep
  When A2 resolves the evidence family identity for those three records
  Then all three records resolve to one and the same family identity
  And the search breadth and correction record is accounted once at that family
  And a consumer reading the envelope sees one evidence family rather than three independent confirmations
```

### BS-014-004: A data-mined periodicity cannot be re-shared as confirmed evidence

```gherkin
Scenario: Breadth and correction travel with the record so a swept hypothesis stays labelled as swept
  Given A1 ran a hypothesis sweep across many candidate periodicities and one candidate survived
  When A2 publishes the surviving candidate as a cycle evidence record
  Then the envelope carries the number of hypotheses searched, the applied benjamini-hochberg discovery correction, the applied holm activation correction, and the held-out gate outcome
  And a consumer that requests the record reads the breadth and the applied corrections alongside the finding
  And the record cannot be presented as confirmed evidence stripped of the breadth that produced it
```

### BS-014-005: Publication without a declared subject scope is refused

```gherkin
Scenario: Silence about subject scope never becomes universal applicability
  Given A2 holds a cycle evidence record with no explicit subject applicability assertion
  When A2 attempts to publish the record
  Then the publication is refused
  And no envelope is created that would be readable for an undeclared subject
  And the refusal reason names the missing subject applicability assertion
```

### BS-014-007: A negative availability state is published, not withheld

```gherkin
Scenario: An unavailable finding is a complete shareable record in its declared negative state
  Given A2 evaluated a catalog entry on a covered subject and the availability state resolved to unavailable
  When A2 publishes the record
  Then the transport admits the envelope
  And the admitted envelope carries the availability state unavailable together with its subject scope, cycle type, search breadth, applied corrections, adjustment posture, as-of vintage, and model provenance record
  And the record is not withheld and is not rewritten into a weaker positive availability state
```

### BS-014-019: A coerced cycle type is refused at transport rather than converted

```gherkin
Scenario: A type mismatch between catalog entry and envelope is a transport refusal
  Given an envelope declaring a cycle type that differs from the catalog type of the entry it references
  When the envelope is presented to the admission path
  Then the envelope admission outcome is refused
  And no type conversion, coercion, or best-effort re-typing is performed
  And a consumer that subsequently requests that identity writes a consumption record with outcome refused-transport
```

---

## Implementation Plan

1. **Create `rlcycx.js`** as a UMD module following the `rlvol.js` precedent: a single deeply frozen export object,
   zero dependencies, no DOM, storage, network, timer, or ambient-clock read, and an explicit `decisionTime`
   parameter on every entry point. Load order in any consuming page is `rldata.js` → `rlapp.js` → `rlnav.js`, with
   `rlcycx.js` loadable ahead of an inline model script that needs it synchronously.
2. **Author `RLCYCX.VOCAB` in `rlcycx.js`** as the frozen closed vocabularies for availability, applicability,
   admission, consumption, comparison, and surface state. An unrecognised value refuses; it never passes through.
   No local synonym, no free text, no private alias.
3. **Author `RLCYCX.REFUSALS` in `rlcycx.js`** as the frozen registry of all 47 `cyc-*` codes from `design.md` →
   *Refusal-code registry*, each lowercase-kebab and conforming to the repo's existing `SAFE_REASON_PATTERN`
   (`^[a-z0-9][a-z0-9-]*$`) so a 014 refusal can travel existing reason-code channels without re-encoding. Scope 1
   implements the 22 publication, catalog, and envelope codes; the remaining 25 are declared in the registry and
   implemented by their owning scopes.
4. **Implement canonicalisation in `rlcycx.js`** — stable key ordering, no wall-clock read, no iteration-order
   dependence, and a fixed floating-point accumulation order — so the same inputs and the same `decisionTime`
   produce byte-identical serialisation in the browser and in Node.
5. **Implement strict finite guards in `rlcycx.js`** using `Number.isFinite` only. The global `isFinite` is banned
   in all 014-authored code because `isFinite(null) === true`. An absent value yields an explicit no-value marker,
   never a throw.
6. **Implement `RLCYCX.publishEvidence(input, decisionTime)` in `rlcycx.js`** returning a `cycle-evidence/v1` record
   or a refusal: exactly one catalog entry, one subject, one vintage, and one posture; mandatory search breadth;
   evidence-family identity derived from series identity, mechanism identity, and sweep identity together; mandatory
   subject applicability assertion; point-in-time revision-aware vintage resolution; mandatory provenance; and a
   refusal on any trend-structure facet, named regime, or predictive field.
7. **Implement `RLCYCX.sealEnvelope(evidence, decisionTime)` in `rlcycx.js`** packaging `cycle-evidence/v1` plus
   `cycle-catalog-entry/v1` plus provenance into a `cycle-envelope/v1` under an addressable publisher identity. The
   envelope is the only path across a tool boundary.
8. **Implement `RLCYCX.admitEnvelope(envelope, decisionTime)` in `rlcycx.js`** returning `cycle-admission/v1`
   whole-or-nothing: a declared type that differs from the catalog type refuses with `cyc-type-mismatch` and is never
   converted; validation failure refuses in full; a refusal writes nothing and leaves any previously admitted record
   for that identity byte-identical.
9. **Implement the type-dispatch table in `rlcycx.js`** so the catalog type is read before any measurement field and
   the permitted-field set is authoritative per type across all six types.
10. **Create `tests/fixtures/shared-cycle-exchange/**`** as the pre-006 demonstration substrate: every fixture is a
    `cycle-evidence/v1`- or `cycle-envelope/v1`-conforming JSON literal with a sibling `*.expected.json` naming the
    expected outcome and, for negatives, the expected `refusalCode` and `refusalField`. One rule violated per
    negative fixture. Every fixture carries an explicit `decisionTime` and no fixture reads a clock.
11. **Create `tests/shared-cycle-exchange.support.mjs`** with the shared fixture loader, the exact-code assertion
    helper (asserting `refusalCode` string equality plus the companion field), and the cross-environment
    canonical-serialisation comparator. It contains no assertions of its own and is imported, never run directly.
12. **Create `tests/shared-cycle-exchange.unit.mjs`** and **`tests/shared-cycle-exchange.functional.mjs`** carrying
    the named negative tests for all 22 codes owned by this scope plus the positive fidelity cases.

---

### Test Plan

Every negative row asserts the exact `refusalCode` string plus its companion field; "some refusal occurred" is not
coverage. Every negative row uses at least one fixture that a permissive implementation would have accepted, so
reverting the behaviour under test makes the row fail. No row contains an early-exit bailout.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Unit | T-01-U1 | `unit` | BS-014-002 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-breadth-missing` fires with `refusalField` naming search breadth on an otherwise complete, positive, significant-looking record — the case a permissive publisher most wants through — and `cyc-family-unresolved` fires when series and mechanism identity are present but sweep identity is absent, so a two-of-three family check fails the row. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U2 | `unit` | BS-014-005 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-applicability-assertion-missing` fires while `declaredSubjects` would have matched the presented subject, proving absence is refused on its own terms and not because the subject mismatched; `cyc-subject-unresolved` fires for an omitted subject and for a `kind` outside the closed vocabulary, with no default subject resolving either. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U3 | `unit` | BS-014-002 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-vintage-multiple` and `cyc-posture-multiple` fire when two individually valid vintages, and both postures, are asserted on one record, so a "valid vintage" or "valid posture" check alone fails the row; `cyc-provenance-missing` fires on a record whose identity would otherwise compute, proving the check is presence, not hashability. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U4 | `unit` | BS-014-007 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-availability-unknown` fires on a value one character off a legal one, so a prefix or `startsWith` check fails the row; `cyc-eligibility-contradicts-measurement` fires on `eligible: false` carrying a phase, an amplitude, and a next-turn date. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U5 | `unit` | BS-014-004 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-trend-structure-claim` fires on a trend-structure field smuggled into `measurement` where every other field is legal; `cyc-regime-claim` fires on a named regime attached to an otherwise valid `regime`-type cycle; `cyc-predictive-claim` fires on a forward-looking field on an otherwise purely descriptive record. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U6 | `unit` | BS-014-019 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-catalog-type-unknown` fires for a `cycleType` outside the six and is asserted **before** any measurement field is read, so a measurement-shaped payload cannot reach dispatch; `cyc-catalog-domain-unknown` fires for an eleventh domain against the closed ten. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U7 | `unit` | BS-014-019 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-envelope-malformed` fires for an envelope missing `evidence` and separately missing `catalogEntry`, each otherwise well-formed JSON; `cyc-envelope-unrecognized-version` fires for `cycle-envelope/v2` carrying a v1-valid body, proving version is checked before shape; `cyc-publisher-unidentified` fires for an absent `publisherId` and separately for an empty string, which a presence-only check would miss. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U8 | `unit` | BS-014-019 | `tests/shared-cycle-exchange.unit.mjs` | `cyc-type-mismatch` fires for `declaredCycleType: lifecycle` against a catalog type of `empirical-seasonality` **with a valid lifecycle measurement attached** — the case a coercing implementation converts — and asserts admission outcome `refused`, that no converted, coerced, or re-typed record exists, and that no partial record was written. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Unit | T-01-U9 | `unit` | BS-014-003, BS-014-004, BS-014-007 | `tests/shared-cycle-exchange.unit.mjs` | Positive fidelity: three records sharing series, mechanism, and sweep identity resolve to one family identity with breadth accounted exactly once; a sealed envelope exposes hypotheses searched, the Benjamini–Hochberg discovery correction, the Holm activation correction, and the held-out gate outcome; an `unavailable` record is admitted in full carrying subject scope, cycle type, breadth, corrections, posture, vintage, and provenance, and is neither withheld nor rewritten positive. | `node --test tests/shared-cycle-exchange.unit.mjs` | No |
| Functional | T-01-F1 | `functional` | BS-014-003 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-catalog-entry-immutable-violation` fires for the same `entryId` with a mutated `cycleType`, and separately with a mutated `minimumEvidence`, proving both are immutable across exchange; `cyc-catalog-state-vocabulary-unknown` fires for a `lifecycle` stage outside **that entry's own** `stateVocabulary` while legal in a different entry's, proving the check is per-entry and not global. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-01-F2 | `functional` | BS-014-005 | `tests/shared-cycle-exchange.functional.mjs` | `cyc-vintage-unresolved-at-cutoff` fires for a truncation-assembled history containing a post-cutoff revision — truncation alone looks clean, so only revision-awareness passes the row — and asserts no earlier vintage is substituted; `cyc-catalog-entry-unresolved` fires for a `catalogEntryRef` absent from a **non-empty** catalog source, so an empty-catalog short-circuit cannot mask it. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-01-F3 | `functional` | BS-014-003, BS-014-004 | `tests/shared-cycle-exchange.functional.mjs` | Canonicalisation and recomputation identity are byte-identical for every fixture across two independent evaluations with the same `decisionTime`, with stable key ordering, no clock read, and a fixed accumulation order; `Number.isFinite` guards return an explicit no-value marker rather than throwing on a partially populated record. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Project check | T-01-S1 | project check | — | `scripts/selftest.mjs` (unmodified) | The repo self-test is green after `rlcycx.js`, the fixtures, and the two test files land, proving scope 1 adds no repo-check regression while touching no existing registration. | `node scripts/selftest.mjs` | No |

**Test Plan rows: 13.**

---

### Definition of Done

#### Core items

- [ ] `rlcycx.js` exists as a UMD, dependency-free, deeply frozen module with an explicit `decisionTime` on every entry point and no DOM, storage, network, timer, or ambient-clock read.
- [ ] `RLCYCX.VOCAB` declares the frozen closed vocabularies for availability, applicability, admission, consumption, comparison, and surface state, and an unrecognised value refuses rather than passing through.
- [ ] `RLCYCX.REFUSALS` declares all 47 `cyc-*` codes from the authoritative registry enumeration, each matching `^[a-z0-9][a-z0-9-]*$`, with the 22 publication, catalog, and envelope codes implemented by this scope.
- [ ] `publishEvidence`, `sealEnvelope`, and `admitEnvelope` are implemented and return `cycle-evidence/v1`, `cycle-envelope/v1`, and `cycle-admission/v1` respectively, or a refusal carrying an exact registry code and its companion field.
- [ ] The catalog type is read before any measurement field, and the per-type permitted-field set is authoritative across all six cycle types.
- [ ] Admission is whole-or-nothing and a refusal writes nothing, leaving any previously admitted record for that identity byte-identical.
- [ ] `Number.isFinite` is used exclusively; the global `isFinite` appears nowhere in 014-authored code.
- [ ] `tests/fixtures/shared-cycle-exchange/**` exists with one rule violated per negative fixture, a sibling `*.expected.json` naming the expected `refusalCode` and `refusalField`, and an explicit `decisionTime` on every fixture.
- [ ] `tests/shared-cycle-exchange.support.mjs` exists and provides the exact-code assertion helper and the cross-environment canonical-serialisation comparator.
- [ ] Every file this scope creates is listed in `design.md` → `### Files 014 MAY CREATE`, and this scope modifies no file at all, so no Protected Surface is opened.
- [ ] **Feature 013 interaction:** this scope creates only new files (`rlcycx.js`, the fixtures, the support module, and the two test files) and opens nothing Feature 013 owns, so its blast radius against the in-flight 013 session is zero.
- [ ] `notes/shared-cycle-exchange.md` records the foundation contract surface delivered by this scope, per the repo house rule that every tool carries a handoff doc.

#### Test items

- [ ] T-01-U1 passes: `cyc-breadth-missing` and `cyc-family-unresolved` assert exact codes and companion fields against fixtures a permissive publisher would have accepted → evidence recorded in `report.md`.
- [ ] T-01-U2 passes: `cyc-applicability-assertion-missing` and `cyc-subject-unresolved` assert exact codes, with the applicability case proving absence refuses on its own terms → evidence recorded in `report.md`.
- [ ] T-01-U3 passes: `cyc-vintage-multiple`, `cyc-posture-multiple`, and `cyc-provenance-missing` assert exact codes against individually valid components → evidence recorded in `report.md`.
- [ ] T-01-U4 passes: `cyc-availability-unknown` and `cyc-eligibility-contradicts-measurement` assert exact codes, with the availability case defeating a prefix check → evidence recorded in `report.md`.
- [ ] T-01-U5 passes: `cyc-trend-structure-claim`, `cyc-regime-claim`, and `cyc-predictive-claim` assert exact codes on records that are otherwise legal → evidence recorded in `report.md`.
- [ ] T-01-U6 passes: `cyc-catalog-type-unknown` and `cyc-catalog-domain-unknown` assert exact codes, with the type check proven to fire before any measurement field is read → evidence recorded in `report.md`.
- [ ] T-01-U7 passes: `cyc-envelope-malformed`, `cyc-envelope-unrecognized-version`, and `cyc-publisher-unidentified` assert exact codes, including the empty-string publisher case → evidence recorded in `report.md`.
- [ ] T-01-U8 passes: `cyc-type-mismatch` asserts the exact code against a declared lifecycle with a valid lifecycle measurement attached, and asserts no converted or partial record exists → evidence recorded in `report.md`.
- [ ] T-01-U9 passes: family identity resolves three records to one, breadth and corrections travel on the envelope, and an `unavailable` record is admitted in full without rewrite → evidence recorded in `report.md`.
- [ ] T-01-F1 passes: `cyc-catalog-entry-immutable-violation` and `cyc-catalog-state-vocabulary-unknown` assert exact codes, with the vocabulary check proven per-entry rather than global → evidence recorded in `report.md`.
- [ ] T-01-F2 passes: `cyc-vintage-unresolved-at-cutoff` fires on revision-awareness rather than truncation, and `cyc-catalog-entry-unresolved` fires against a non-empty catalog → evidence recorded in `report.md`.
- [ ] T-01-F3 passes: canonicalisation is byte-identical across evaluations and `Number.isFinite` guards yield an explicit no-value marker rather than a throw → evidence recorded in `report.md`.
- [ ] T-01-S1 passes: `node scripts/selftest.mjs` is green with no existing registration touched → evidence recorded in `report.md`.

**Test-related DoD items: 13. Test Plan rows: 13. Parity confirmed.**

#### Build Quality Gate

- [ ] Zero warnings across `node --test` output and `node scripts/selftest.mjs`; zero issues left unresolved; every negative test verified to fail when the behaviour it guards is reverted; `spec.md` and `design.md` unmodified by this scope.

---

*Educational research context only — not investment advice.*
