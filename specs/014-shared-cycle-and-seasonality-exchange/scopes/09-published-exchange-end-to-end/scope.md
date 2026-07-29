# Scope 9: Published exchange end to end

**Status:** Not Started
**Depends On:** Scope 1 (`01-foundation-contracts-and-publication`), Scope 2 (`02-fail-closed-typed-transport`), Scope 3 (`03-applicability-and-consumer-authority`), Scope 4 (`04-consumption-ledger-and-type-dispatch`), Scope 5 (`05-prospective-baseline-comparison`), Scope 6 (`06-provenance-by-recomputation`), Scope 7 (`07-lab-surface-simple-power-mobile`), Scope 8 (`08-brief-and-journey-context`)
**Tags:** `overlay:true`, `blocked-on-006-scope-4`

**Primary Outcome:**
The EP-1 publisher adapter binding lands against Feature 006's real `tdcEvaluateCycle` result shape, and a **real
published** cycle finding traverses the whole exchange — publish, seal, admit, applicability, consume — with full
fidelity and no loss, no coercion, and no re-derivation. The admitted envelope exposes the same catalog cycle type,
the same subject scope, the same search breadth, the same applied discovery and activation corrections, the same
adjustment posture, the same as-of vintage, and the same availability state the engine declared, and it claims no
trend-structure facet and names no regime. An authorised consumer presenting the same subject and the same
decision-time cutoff resolves the publisher's exact type, availability state, and as-of vintage, and exactly one
consumption record is written with outcome `consumed` naming the consumer, the evidence, the as-of used, the
applicability decision, and the adjustment posture read. The adapter is a pure mapper: it carries eligibility, type,
and availability from the engine and computes none of them (HC-1, HC-2). Feature 006's own surfaces
(`trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`,
`scripts/validate-trend-dynamics-cycle.mjs`) are Protected Surfaces and are read, never modified.

**Blocking condition (binding).** This scope is `blocked-on-006-scope-4`. It is **not schedulable** until Feature 006
Scope 4 publishes a real owner read. Fixtures prove the contract; they can never satisfy this scope, and a
fixture-backed pass reported here would be fabricated evidence.

---

## Business Scenarios owned

### BS-014-001: A published cycle finding survives the exchange boundary with full fidelity

```gherkin
Scenario: An admitted envelope carries type, subject scope, breadth, correction, posture, vintage, state, and provenance
  Given A2 holds a cycle evidence record for one catalog entry measured on one subject at one resolved as-of vintage
  And the record carries its evidence family identity, its search breadth, its applied discovery and activation corrections, its adjustment posture, its availability state, and its model provenance record
  When A2 packages the record into a typed exchange envelope under an addressable publisher identity
  Then the transport records the admission outcome as admitted
  And the admitted envelope exposes the same catalog cycle type, the same subject scope, the same search breadth, the same applied corrections, the same adjustment posture, the same as-of vintage, and the same availability state that A2 declared
  And no trend-structure facet is claimed and no regime is named by the envelope
```

### BS-014-008: An authorised consumer resolves the publisher's exact state

```gherkin
Scenario: A second surface reads the same subject, type, availability state, and vintage as the publisher
  Given an admitted envelope published by A2 for a named subject at a resolved as-of vintage
  And A3 holds declared consumer authority for that evidence class and that subject class
  When A3 presents the same subject and the same decision-time cutoff to the envelope
  Then the applicability assertion returns applicable
  And A3 resolves the same catalog cycle type, the same availability state, and the same as-of vintage that A2 published
  And exactly one consumption record is written with outcome consumed, naming the consumer, the evidence, the as-of used, the applicability decision, and the adjustment posture read
```

---

## Implementation Plan

1. **Bind the EP-1 publisher adapter in `rlcycx.js`** as a named pure export registered through the EP-1 seam that
   Scope 1 established. Its signature is the design's `(engineOutput, subject, decisionTime) → publishEvidence input`.
   It maps Feature 006's real `tdcEvaluateCycle` result shape onto the `cycle-evidence/v1` input, supplying 006's
   catalog entry, its search-breadth and correction record (hypotheses searched, Benjamini–Hochberg discovery
   correction, Holm activation correction, held-out gate outcome), and its engine and configuration versions. The
   adapter reads eligibility, type, and availability from the engine result and **carries** them; it contains no
   branch that computes, infers, or overrides any of the three.
2. **Bind the EP-2 catalog source in `shared-cycle-exchange-universe.json`** to 006's real closed catalog so envelope
   sealing resolves live `cycle-catalog-entry/v1` records rather than fixture entries. 014 reads that catalog and
   authors no entry and extends no domain or type.
3. **Bind the EP-3 consumer-authority descriptor in `shared-cycle-exchange-universe.json`** for the consuming surface
   that reads real published evidence, as declarative configuration only.
4. **Wire the real-publication path through `scripts/validate-shared-cycle-exchange.mjs`** so the validator reports
   whether the envelope under inspection originated from a real 006 publication or from a fixture, and reports the
   two distinguishably. A validator that cannot tell them apart cannot prove this scope.
5. **Extend `tests/shared-cycle-exchange.support.mjs`** with the real-publication harness: it acquires a live
   `tdcEvaluateCycle` result, refuses to run when 006 publication is unavailable, and reports that refusal as a
   skip-with-reason that is never reported as a pass.
6. **Extend `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`,
   `tests/shared-cycle-exchange.e2e.mjs`, and `tests/shared-cycle-exchange.spec.mjs`** with the end-to-end fidelity,
   authorised-consumption, and negative-state publication tests driven by the real publisher.
7. **Record the 006 binding in `notes/shared-cycle-exchange.md`** — which 006 result fields map to which
   `cycle-evidence/v1` fields, and which fields are carried rather than computed.
8. **Touch no Feature 006 file.** `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, and
   `scripts/validate-trend-dynamics-cycle.mjs` are Protected Surfaces per `design.md` → *Protected Surfaces*.

---

### Test Plan

Every row in this Test Plan runs against **real published Feature 006 evidence**. No row is satisfiable by a fixture,
and no row may be marked passing on fixture output. Each fidelity row asserts field-by-field equality between what the
engine declared and what the admitted envelope exposes, not merely that an envelope exists. No Playwright row contains
an early-exit bailout: every required assertion is a direct `expect(locator).toBeVisible()` or a direct count
assertion with no escape path, and no row returns early on a URL check or a missing element. This scope owns **zero**
refusal codes per the `_index.md` refusal-code ownership map; every code it exercises is owned and exact-code-asserted
elsewhere.

| Test Type | ID | Category | Scenarios | File/Location | What it proves | Command | Live System |
|---|---|---|---|---|---|---|---|
| Functional | T-09-F1 | `functional` | BS-014-001 | `tests/shared-cycle-exchange.functional.mjs` | A real `tdcEvaluateCycle` result mapped through the EP-1 adapter and sealed yields an admitted envelope whose catalog cycle type, subject scope, search breadth, applied Benjamini–Hochberg discovery correction, applied Holm activation correction, adjustment posture, as-of vintage, and availability state are each asserted equal to the engine's declared value field by field. The row additionally asserts the envelope carries no trend-structure facet key and no regime name, so an adapter that enriched the record would fail. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Functional | T-09-F2 | `functional` | BS-014-001 | `tests/shared-cycle-exchange.functional.mjs` | The EP-1 adapter is a pure carrier: given a real engine result whose declared availability state and declared eligibility **disagree with what a recomputation from the measurement fields would suggest**, the adapter emits the engine's declared values unchanged. The disagreement is the adversarial element — an adapter that computed either field would emit the recomputed value and fail this row. | `node --test tests/shared-cycle-exchange.functional.mjs` | No |
| Integration | T-09-I1 | `integration` | BS-014-008 | `tests/shared-cycle-exchange.integration.mjs` | An authorised consumer presenting the publisher's own subject and cutoff to a real admitted envelope resolves the identical catalog cycle type, availability state, and as-of vintage, and writes **exactly one** consumption record with outcome `consumed` naming the consumer, the evidence, the as-of used, the applicability decision, and the posture read. The row asserts the record count is one, not at-least-one. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| Integration | T-09-I2 | `integration` | BS-014-001 | `tests/shared-cycle-exchange.integration.mjs` | A real engine-published `unavailable` availability state is admitted **complete** — carrying subject, type, breadth, corrections, posture, vintage, and provenance — and is neither withheld nor rewritten into a weaker positive state. A positive-availability sibling published in the same run is present, so an implementation that filtered negatives on the way out would emit one envelope where the row requires two. | `node --test tests/shared-cycle-exchange.integration.mjs` | No |
| E2E (headless) | T-09-E1 | `e2e` | BS-014-001, BS-014-008 | `tests/shared-cycle-exchange.e2e.mjs` | The whole chain — real publish, seal, admit, applicability, consume — runs headlessly on real 006 output and the consumed reading is asserted identical to the published reading at every carried field; the row asserts the admission outcome is `admitted` and the applicability decision is `applicable` with both read from the records rather than inferred from the absence of an error. | `node --test tests/shared-cycle-exchange.e2e.mjs` | No |
| E2E UI | T-09-P1 | `e2e-ui` | BS-014-008 | `tests/shared-cycle-exchange.spec.mjs` | The Simple cycle context panel, presented the publisher's own subject and cutoff against a real published envelope, renders the publisher's exact cycle type, availability state, and as-of vintage as visible text asserted by direct `expect(locator).toBeVisible()`, and the consumption ledger shows one `consumed` row for that read. The row asserts no em dash, no spinner, and no "unavailable data" placeholder occupies any of the three fields. | `npx --no-install playwright test tests/shared-cycle-exchange.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes |
| Tool validator | T-09-V1 | tool validator | BS-014-001 | `scripts/validate-shared-cycle-exchange.mjs` | The validator distinguishes a real 006-originated envelope from a fixture envelope and reports the origin explicitly, so a fixture can never be presented as end-to-end evidence for this scope. The row asserts the validator reports real origin for the published envelope and fixture origin for a fixture envelope in the same run. | `node scripts/validate-shared-cycle-exchange.mjs` | No |

**Test Plan rows: 7.**

---

### Definition of Done

#### Core items

- [ ] **This scope is `blocked-on-006-scope-4` and is NOT schedulable until Feature 006 Scope 4 publishes a real owner read.** Feature 006 Scope 4 is `Not Started`, Feature 006's own state is `not_started`, and the 006 validator prints `owner-publication=false`. Until that changes, this scope may not be started, may not be marked In Progress, and may not be marked Done.
- [ ] **Fixtures prove the contract but can never satisfy this scope.** Every row in this Test Plan requires real published Feature 006 evidence. A fixture-backed pass reported as an end-to-end exchange is fabricated evidence, and a fixture-backed run is recorded as a skip-with-reason, never as a pass.
- [ ] The EP-1 publisher adapter is a named pure export in `rlcycx.js` with the signature `(engineOutput, subject, decisionTime) → publishEvidence input`, registered through the EP-1 seam established by Scope 1.
- [ ] The adapter carries eligibility, type, and availability from the engine result and contains no branch that computes, infers, or overrides any of the three.
- [ ] The admitted envelope exposes the engine's declared catalog cycle type, subject scope, search breadth, applied discovery correction, applied activation correction, adjustment posture, as-of vintage, and availability state, each equal field by field.
- [ ] The admitted envelope claims no trend-structure facet and names no regime, satisfying HC-3.
- [ ] The EP-2 catalog source and the EP-3 consumer-authority descriptor are bound declaratively in `shared-cycle-exchange-universe.json`; no code path grants itself authority and no catalog entry, domain, or type is authored or extended by 014.
- [ ] An authorised consumer presenting the publisher's subject and cutoff resolves the identical type, availability state, and as-of vintage, and exactly one consumption record with outcome `consumed` is written naming the consumer, the evidence, the as-of used, the applicability decision, and the posture read.
- [ ] A real engine-published `unavailable` state is admitted complete and is neither withheld nor rewritten into a positive state.
- [ ] `scripts/validate-shared-cycle-exchange.mjs` reports real-publication origin distinguishably from fixture origin.
- [ ] No Feature 006 file is modified — `trend-dynamics-cycle-lab.html`, `trend-dynamics-cycle-universe.json`, and `scripts/validate-trend-dynamics-cycle.mjs` are read only, per `design.md` → *Protected Surfaces* (HC-1).
- [ ] This scope owns zero refusal codes per the `_index.md` refusal-code ownership map, and mints none.
- [ ] Every file this scope touches — `rlcycx.js`, `shared-cycle-exchange-universe.json`, `scripts/validate-shared-cycle-exchange.mjs`, `notes/shared-cycle-exchange.md`, `tests/shared-cycle-exchange.support.mjs`, `tests/shared-cycle-exchange.functional.mjs`, `tests/shared-cycle-exchange.integration.mjs`, `tests/shared-cycle-exchange.e2e.mjs`, `tests/shared-cycle-exchange.spec.mjs` — is listed in `design.md` → `### Files 014 MAY CREATE` or `### Files 014 MAY MODIFY`, and no Protected Surface is opened as a change target.
- [ ] **Feature 013 interaction:** this scope opens no file Feature 013 owns. It does not reopen `rldata.js`, does not touch `rlratio.js`, `ratio-pairs.json`, `rlregime.js`, `regime-archetypes.json`, or `market-regime-lab.html`, does not touch 013's regime owner-read adapter in `scripts/brief-refresh.mjs`, and touches none of the five counted registries, so `node scripts/validate-tool-experience.mjs` stays green against the unchanged counts.

#### Test items

- [ ] T-09-F1 passes on real published 006 evidence: every carried field is equal to the engine's declared value and no trend-structure facet or regime name appears → evidence recorded in `report.md`.
- [ ] T-09-F2 passes on real published 006 evidence: the adapter emits the engine's declared availability and eligibility even when a recomputation would disagree → evidence recorded in `report.md`.
- [ ] T-09-I1 passes on real published 006 evidence: the consumer resolves identical type, state, and vintage, and exactly one `consumed` record is written with all named fields → evidence recorded in `report.md`.
- [ ] T-09-I2 passes on real published 006 evidence: a real `unavailable` state is admitted complete alongside its positive sibling → evidence recorded in `report.md`.
- [ ] T-09-E1 passes on real published 006 evidence: the full publish-to-consume chain preserves every carried field headlessly → evidence recorded in `report.md`.
- [ ] T-09-P1 passes on real published 006 evidence: the Simple panel renders the publisher's exact type, state, and vintage with no placeholder occupying any field → evidence recorded in `report.md`.
- [ ] T-09-V1 passes on real published 006 evidence: the validator reports real origin and fixture origin distinguishably in the same run → evidence recorded in `report.md`.

**Test-related DoD items: 7. Test Plan rows: 7. Parity confirmed.**

---

*Educational research context only — not investment advice.*
