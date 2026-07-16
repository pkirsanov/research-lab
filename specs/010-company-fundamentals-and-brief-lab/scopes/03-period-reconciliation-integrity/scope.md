# Scope 03: Period-Safe Reconciliation And Accounting Integrity

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `accounting-integrity:true`, `ui:true`

**Depends On:** Scope 02 - Controlled Source Ingestion And Pointer-Last Promotion

**Primary Outcome:** Annual, quarter, YTD, trailing, instant, amended, recast, and conflicting observations retain exact meaning; statement integrity and conflict states block only dependent conclusions while the Detailed Statements and Sources slices make every break inspectable.

## Requirement Coverage

- **Functional:** FR-010-003, FR-010-004, and FR-010-013 through FR-010-022.
- **Non-functional:** NFR-010-010.
- **Primary scenarios:** SCN-010-004, SCN-010-005, and SCN-010-025.

## Gherkin Scenarios

### SCN-010-004 - Period-Safe History

```gherkin
Scenario: Annual quarterly YTD and instant facts retain period meaning
  Given one company dossier contains compatible and incompatible ReportingPeriod/v1 records
  When the user selects annual, quarterly, trailing, and comparison controls
  Then each computed delta uses only matching duration, concept, unit, currency, and comparability states
  And a YTD or instant observation never appears as a standalone quarter
```

### SCN-010-005 - Statement Imbalance

```gherkin
Scenario: A precision-qualified balance-sheet imbalance blocks dependent conclusions
  Given a copied accepted SEC fact set is changed so assets fall outside the summed XBRL rounding intervals for liabilities and equity
  When the production publication validator runs statement integrity and dependent projections
  Then it emits C010-INTEGRITY-BALANCE-SHEET with input refs, difference, and allowed interval
  And clean resilience plus dependent model and brief outputs are blocked while source facts remain inspectable
```

### SCN-010-025 - Source Conflict

```gherkin
Scenario: Filing and normalized provider disagreement remains unresolved
  Given two eligible observations appear to map to one company concept and period but materially disagree without amendment relation
  When reconciliation and dependent projections run
  Then both observations remain visible and the normalized fact state is conflicted
  And no average is created and dependent metrics, anchors, and claims inherit conflicted or unavailable state
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-004 | Compatible and incompatible annual/quarter/YTD/instant records | Use period and analysis controls in Statements | Only valid deltas enable; exact duration/fiscal/unit/source remains visible; YTD never appears as a quarter | e2e-ui |
| SCN-010-005 | Precision-derived statement imbalance exists | Open Statements, resilience summary, and source inputs | Integrity row gives difference/tolerance; dependent clean conclusions are blocked; inputs remain traceable | e2e-ui |
| SCN-010-025 | Filing and normalized observations conflict | Open the conflicted metric and Sources comparison | Both values/mappings remain; no average/current clean anchor appears; dependent consumers show conflicted/unavailable | e2e-ui |

## Implementation Plan

1. Implement exact ReportingPeriod classification for instant, quarter, YTD, annual, trailing, amendments, 52/53-week years, and stub periods. Direct quarter and derived Q4 are distinct evidence classes and IDs.
2. Implement explicit mapping resolution by company/taxonomy/concept/unit/kind/sign/scale. Deduplicate semantic identity, establish amendment/recast chronology only when proven, and retain unresolved mappings/conflicts without hidden precedence or averaging.
3. Implement level/change/percentage/common-size/per-share analysis only when period, denominator, split basis, currency, units, and comparability are valid. Preserve original values and explicit conversion/alignment records.
4. Implement precision-derived balance-sheet tolerance, compatible cash roll-forward, per-share basis checks, and dependency-state propagation. A missing precision or component makes that check unevaluable; no hidden tolerance is selected.
5. Deliver the Detailed Statements and Sources vertical slice: period controls, complete eligible rows, integrity row, breaks, restatement/conflict comparison, formulas/consumers, exact source clocks, and accessible table-first mobile behavior.
6. Extend the production validator to recompute summary/detail integrity and reject any publication that upgrades conflicted/imbalanced source truth.

## Change Boundary And Rollback

**Allowed:** period/mapping/reconciliation/integrity production functions, validator checks, Statements/Sources route bands, recorded-source adversarial mutations, and scope-owned tests.

**Excluded:** derived metric interpretations, archetype rules, model assumptions/formulas, adaptive prose, registry/navigation, Feature 002, provider transport, and shared market code.

**Rollback:** reverse only Scope 03 functions/renderers/tests and select the prior validated current pointer if a Scope 03 publication was promoted. Source observations and history remain immutable.

## Scenario-First Red/Green Contract

Author exact period-compatibility, precision-interval, conflict-propagation, and user-visible break assertions first. Adversarial inputs are mutations of copied recorded source envelopes; expected results must be produced by production functions rather than copied from fixture fields.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Unit | unit | SCN-010-004, SCN-010-005, SCN-010-025 | `tests/company-fundamentals-accounting.unit.mjs` | Production period, mapping, precision-tolerance, roll-forward, conflict, and dependency propagation functions over recorded-source mutations | `node --test tests/company-fundamentals-accounting.unit.mjs` | No |
| TP-03-02 | Publication validator | integration | SCN-010-004, SCN-010-005, SCN-010-025 | `scripts/validate-company-fundamentals.mjs` | Recompute period/integrity/conflict state across all current publication refs and reject summary/detail drift | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-03-03 | Regression E2E | e2e-ui | SCN-010-004 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-004 annual quarterly YTD and instant history preserve exact period meaning` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-004 annual quarterly YTD and instant history preserve exact period meaning" --reporter=list` | Yes |
| TP-03-04 | Regression E2E | e2e-ui | SCN-010-005 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-005 statement imbalance blocks clean dependent conclusions and preserves source facts` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-005 statement imbalance blocks clean dependent conclusions and preserves source facts" --reporter=list` | Yes |
| TP-03-05 | Regression E2E | e2e-ui | SCN-010-025 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-025 conflicting sources remain visible and never become an average` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-025 conflicting sources remain visible and never become an average" --reporter=list` | Yes |
| TP-03-06 | Broader Regression E2E | e2e-ui | SCN-010-004, SCN-010-005, SCN-010-025 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 03 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-003, FR-010-004, FR-010-013 through FR-010-022, and NFR-010-010 are implemented with exact period, comparability, reconciliation, precision, and conflict lineage.
- [ ] SCN-010-004, SCN-010-005, and SCN-010-025 are fully inspectable through production Statements/Sources UI and accepted publication validation.
- [ ] Adversarial accounting tests transform copies of real recorded source bytes and assert production-computed results; no test validates a literal it injected.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 03 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 03 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-03-01 unit evidence proves period, mapping, precision, reconciliation, and conflict production behavior.
- [ ] TP-03-02 integration evidence proves whole-publication period/integrity/conflict validation and summary/detail parity.
- [ ] TP-03-03 Regression E2E evidence proves SCN-010-004.
- [ ] TP-03-04 Regression E2E evidence proves SCN-010-005.
- [ ] TP-03-05 Regression E2E evidence proves SCN-010-025.
- [ ] TP-03-06 broader E2E evidence proves cumulative behavior through Scope 03.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, source-mutation provenance, no-first-fact/no-average/no-carry scans, statement and cash identities, accessible table parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, capability-foundation check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
