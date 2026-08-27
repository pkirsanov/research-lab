# BUG-009 Scopes

**Layout:** single-file
**Mode:** `bugfix-fastlane`
**Packet status:** `in_progress`
**Next required owner:** `bubbles.plan`

[Spec](spec.md) | [Design](design.md) | [Report](report.md) |
[User validation](uservalidation.md) |
[Scenario manifest](scenario-manifest.json) |
[Structured Test Plan](test-plan.json)

This diagnosis-only filing changes no source or persistent test. Planning owns
the final scope, scenario-manifest, and structured test-plan reconciliation.

## Execution Outline

### Phase Order

1. **Scope 1 - Restore Risk Mutation Assertion Origin:** add one focused direct
   carrier, remap only `F008-RISK-INPUT-001`, prove shipped GREEN and mutation
   `ERR_ASSERTION` RED, then run the strict registry and bounded regressions.

### New Types And Signatures

- No product type, API, schema, configuration, or persistence change.
- One new persistent functional `test()` title.
- One registry `title` value changes.

### Validation Checkpoints

1. Preserve the current single-finding strict-registry RED.
2. Prove the focused title GREEN on shipped source.
3. Prove the same title RED through `ERR_ASSERTION` under the exact mutation.
4. Prove the full registry is 3/3 GREEN with all 18 mutations causal.
5. Run full risk and broader carriers, selftest, adversarial guard, fixed
   canonical G028 scanner, and packet gates.

| Scope | Outcome | Planned test paths | Status |
| --- | --- | --- | --- |
| 1 | Give `F008-RISK-INPUT-001` one direct assertion-origin carrier | `tests/portfolio-risk.functional.mjs` and one title remap in `tests/portfolio-test-integrity.unit.mjs` | Not Started |

## Scope 1 - Restore Risk Mutation Assertion Origin

**Scope ID:** `01-restore-risk-mutation-assertion-origin`
**Status:** Not Started
**Depends On:** commits `82d1db5e5` and `7c0c5d64e`
**Finding:** `F008-RISK-INPUT-001`
**Execution dependency:** `bubbles.plan` -> `bubbles.test` -> quality phases ->
`bubbles.validate`

### Implementation Files

| Path | Planned role |
| --- | --- |
| `tests/portfolio-risk.functional.mjs` | Add one focused direct `assetTreatment()` title with complete shipped assertions. |
| `tests/portfolio-test-integrity.unit.mjs` | Change only the selected title for `F008-RISK-INPUT-001`. |

`rlportfolioanalytics.js#assetTreatment` is the inspected production owner. It
is not an implementation file for this scope.

### Change Boundary

Only the two test hunks named above and phase-owned BUG-009 packet updates may
change. Product source, the injector, the mutation anchor and replacement,
other mappings, BUG-007, BUG-008, parent Feature 008, and concurrent dirty paths
remain unchanged and unstaged.

### Shared Infrastructure Impact Sweep

The full strict registry must retain all 18 entries, one application through
each declared hook, one selected test per entry, and one assertion-origin mutant
failure per entry. A changed-path check must prove the test-only boundary.

### Consumer Impact Sweep

| Consumer | Required outcome |
| --- | --- |
| Focused risk carrier | Direct shipped GREEN and mutation `ERR_ASSERTION` RED. |
| Full risk carrier | All titles remain green. |
| Relevant analytics carrier | Existing risk calculations remain green. |
| Risk browser carrier | Existing Risk X-Ray behavior remains green. |
| Feature 008 browser matrix | No broader route regression. |
| Strict registry | Three outer tests and all 18 mutation cases remain green. |

### Gherkin Scenarios

```gherkin
Scenario: SCN-B009-001 unsupported holdings remain named without aborting asset treatment
  Given assetTreatment receives one listed holding with declared look-through
  And assetTreatment receives one unsupported holding without look-through
  When the focused carrier runs on shipped source
  Then state is ok and the listed holding remains market based
  And the unsupported holding is named in excludedFromMarketAnalytics
  And look-through is partial with exact covered and missing holding ids
  When the exact F008-RISK-INPUT-001 early-return mutation is applied once
  Then the same focused title fails through ERR_ASSERTION
  And it does not fail through TypeError or ERR_TEST_FAILURE
```

### UI Scenario Matrix

No user-visible behavior changes. `tests/portfolio-survival-risk.spec.mjs`
provides scenario-specific E2E regression, and the full eight-file Feature 008
browser matrix provides broader E2E regression.

### Implementation Plan

1. Add the exact focused title declared in `design.md#focused-carrier`.
2. Call `RLPA.assetTreatment()` directly with one listed and one unsupported
   holding.
3. Assert state, market inclusion, named exclusion, partial look-through,
   exact ids, and weights.
4. Run the focused title on shipped source and record GREEN.
5. Run the same title under the unchanged mutation and record one
   `ERR_ASSERTION` RED with no runtime-rubble substitute.
6. Remap only the `title` field for `F008-RISK-INPUT-001`.
7. Run the full strict registry, full risk carrier, relevant broader carriers,
   selftest, adversarial guard, fixed canonical G028 scanner, and packet gates.
8. Prove changed-path containment before validate-owned certification.

### Test Plan

| Plan ID | Test Type | Category | File / exact title | Required result |
| --- | --- | --- | --- | --- |
| `TP-B009-000` | Pre-fix RED regression | `unit` | `tests/portfolio-test-integrity.unit.mjs` - `Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing` | Exit 1; only `F008-RISK-INPUT-001`; 18 applications. |
| `TP-B009-001` | Focused shipped carrier | `functional` | `tests/portfolio-risk.functional.mjs` - `BUG-009 risk mapping: unsupported holding is named without aborting asset treatment` | One shipped pass with complete direct assertions. |
| `TP-B009-002` | Focused mutation negative control | `functional` | Same BUG-009 title under `F008-RISK-INPUT-001` | One `ERR_ASSERTION` failure; no `TypeError` or `ERR_TEST_FAILURE`. |
| `TP-B009-003` | Full strict registry | `unit` | `tests/portfolio-test-integrity.unit.mjs` | 3 tests, 3 passes, all 18 cases causal. |
| `TP-B009-004` | Full risk carrier | `functional` | `tests/portfolio-risk.functional.mjs` | Complete file green. |
| `TP-B009-005` | Relevant broader Node carriers | `unit`, `functional` | `tests/portfolio-analytics.unit.mjs` and `tests/portfolio-risk.functional.mjs` | Both files green. |
| `TP-B009-006` | Scenario-specific Regression E2E | `e2e-ui` | `tests/portfolio-survival-risk.spec.mjs` | Risk X-Ray browser carrier green. |
| `TP-B009-007` | Broader Regression E2E | `e2e-ui` | Full eight-file Feature 008 browser matrix | All route carriers green. |
| `TP-B009-008` | Canonical repository selftest | `functional` | `scripts/selftest.mjs` | Green without budget or baseline change. |
| `TP-B009-009` | Adversarial regression quality | `functional` | Registry and risk carrier | Bugfix guard green. |
| `TP-B009-010` | Fixed canonical G028 scan | `functional` | Canonical Bubbles scanner at or after commit `db7b4f2` | Green against this BUG-009 packet. |
| `TP-B009-011` | Packet gates | `functional` | Artifact lint and traceability guard | Both green. |

### Test Plan To DoD Parity

| Test Plan row | Primary DoD item |
| --- | --- |
| `TP-B009-000` | Persistent pre-fix strict-registry RED is recorded |
| `TP-B009-001` | Focused direct carrier passes on shipped source |
| `TP-B009-002` | Focused direct carrier fails through `ERR_ASSERTION` under mutation |
| `TP-B009-003` | Full strict registry is 3/3 GREEN with all 18 cases causal |
| `TP-B009-004` | Full risk carrier passes |
| `TP-B009-005` | Relevant broader Node carriers pass |
| `TP-B009-006` | Scenario-specific risk E2E passes |
| `TP-B009-007` | Broader Feature 008 E2E passes |
| `TP-B009-008` | Canonical selftest passes |
| `TP-B009-009` | Regression-quality guard passes |
| `TP-B009-010` | Fixed canonical G028 scanner passes |
| `TP-B009-011` | Packet gates pass |

### Definition of Done - Tiered Validation

#### Core Items

- [ ] `SCN-B009-001` proves unsupported holdings remain named without aborting
  asset treatment: shipped source returns `ok`, names the unsupported exclusion,
  and reports exact partial look-through, while the unchanged mutation fails the
  same focused title through `ERR_ASSERTION` without `TypeError` or
  `ERR_TEST_FAILURE`.
- [ ] Root cause remains the broad mutation-to-title mapping documented in
  [design.md](design.md), with current-session RED evidence retained in
  [report.md](report.md).
- [ ] One focused direct `assetTreatment()` title is implemented with exact
  state, named exclusion, and look-through assertions.
- [ ] Only the `F008-RISK-INPUT-001` title mapping changes; its anchor,
  replacement, carrier, intended hook, and all other mappings remain unchanged.
- [ ] Delivery changes remain inside the declared test-only Change Boundary.
- [ ] `TP-B009-000` persistent pre-fix strict-registry RED is recorded.
  Evidence: `report.md#tp-b009-000`.
- [ ] `TP-B009-001` focused shipped-source GREEN passes exactly once.
  Evidence: `report.md#tp-b009-001`.
- [ ] `TP-B009-002` focused mutation RED fails exactly once through
  `ERR_ASSERTION`, with no `TypeError` or `ERR_TEST_FAILURE` substitute.
  Evidence: `report.md#tp-b009-002`.
- [ ] `TP-B009-003` full strict registry passes 3/3 and all 18 mutation cases
  remain causal. Evidence: `report.md#tp-b009-003`.
- [ ] `TP-B009-004` full risk carrier passes. Evidence:
  `report.md#tp-b009-004`.
- [ ] `TP-B009-005` relevant broader Node carriers pass. Evidence:
  `report.md#tp-b009-005`.
- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  pass. Evidence: `report.md#tp-b009-006`.
- [ ] Broader E2E regression suite passes. Evidence:
  `report.md#tp-b009-007`.
- [ ] `TP-B009-008` canonical selftest passes. Evidence:
  `report.md#tp-b009-008`.
- [ ] `TP-B009-009` regression-quality guard passes. Evidence:
  `report.md#tp-b009-009`.
- [ ] `TP-B009-010` canonical G028 scanner from the Bubbles checkout containing
  commit `db7b4f2` passes. Evidence: `report.md#tp-b009-010`.
- [ ] `TP-B009-011` packet artifact lint and traceability guard pass. Evidence:
  `report.md#tp-b009-011`.
- [ ] Human acceptance remains unclaimed and human-owned in
  [uservalidation.md](uservalidation.md).

#### Build Quality Gate

- [ ] Build Quality Gate passes with zero skipped required tests, zero
  infrastructure-error substitutes, zero source changes, zero anchor changes,
  zero unrelated staged paths, exact changed-path containment, current packet
  documentation, fixed canonical G028 scan, artifact lint, traceability, and
  validate-owned transition checks green.

All items remain unchecked. This packet records diagnosis and routes planning;
it claims no implementation, test delivery, human acceptance, or certification.