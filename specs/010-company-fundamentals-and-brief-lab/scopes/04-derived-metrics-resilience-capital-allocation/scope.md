# Scope 04: Derived Metrics, Contextual Resilience, And Capital Allocation

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `foundation:true`, `diagnostics:true`, `capital-allocation:true`, `ui:true`

**Depends On:** Scope 03 - Period-Safe Reconciliation And Accounting Integrity

**Primary Outcome:** Named pure formulas produce inspectable derived fundamentals and five independent raw/contextual resilience checks, while buybacks, preferred stock, retained earnings, leases, and invalid denominators remain economically qualified rather than collapsed into a score.

## Requirement Coverage

- **Functional:** FR-010-023 through FR-010-040.
- **Non-functional:** covered through the deterministic/explainable foundation established by NFR-010-009 through NFR-010-011.
- **Primary scenarios:** SCN-010-010, SCN-010-011, and SCN-010-012.

## Gherkin Scenarios

### SCN-010-010 - Raw And Contextual Diagnostic Trace

```gherkin
Scenario: A contextual diagnostic preserves its raw accounting result
  Given a DiagnosticCheck/v1 has valid raw inputs and one evidenced contextual adjustment
  When the Resilience workspace selects that check
  Then raw value, formula, threshold, input refs, and period render before contextual output
  And adjustment amount, rationale, source refs, sensitivity, and applicability render without erasing the raw record
```

### SCN-010-011 - Preferred Stock Absence

```gherkin
Scenario: Omitted preferred stock is not converted to zero
  Given no eligible observation proves preferred stock present or explicit zero
  When the preferred-stock diagnostic runs
  Then its state is absent-from-eligible-source or unavailable
  And no numeric zero, positive interpretation, or summary pass is emitted
```

### SCN-010-012 - Buyback And Dilution

```gherkin
Scenario: Repurchases are interpreted with issuance and share effects
  Given a publication contains gross repurchases, treasury stock, issuance, SBC, diluted shares, debt change, and available price context
  When the capital-allocation metric and brief interpretation run
  Then gross repurchase and treasury balance remain distinct from period flows
  And any interpretation cites net share change and dilution rather than treating repurchase existence as beneficial
```

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Exact user-visible result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-010-010 | Valid raw inputs and an evidenced adjustment | Open Resilience; select the check; trace inputs | Raw view precedes contextual view with formula, threshold, adjustment, rationale, refs, and applicability; no composite score | e2e-ui |
| SCN-010-011 | Eligible sources omit preferred stock without proving zero | Open preferred-stock diagnostic | State is `Absent from eligible source` or `Unavailable`; no zero/pass appears | e2e-ui |
| SCN-010-012 | Repurchase, issuance/SBC, share, debt, and price evidence exist | Inspect capital allocation and per-share development | Gross flow, treasury balance, issuance, dilution, and net share change remain distinct before interpretation | e2e-ui |

## Implementation Plan

1. Add named production formula functions for growth, margins, operating cash conversion, explicit free-cash-flow definition, capex intensity, liquidity, net-debt decomposition, leverage where valid, asset efficiency, economically valid returns, and per-share development.
2. Make every `DerivedMetric/v1` carry formula/version, ordered inputs, periods, units, output state, invalid denominator/comparability/precision qualifications, and complete lineage. Missing/conflicted inputs propagate without zero/carry substitution.
3. Implement five independent `DiagnosticCheck/v1` policies: cash/liquid investments versus funded debt; liabilities/equity only with interpretable finite equity; preferred stock closed states; retained-earnings decomposition; treasury-stock/repurchase decomposition.
4. Keep raw accounting facts and named transcript rule-of-thumb visible before lease, treasury-stock, regulatory-capital, or other contextual adjustment. Inapplicable/unsupported checks are excluded from summary direction and never become pass/fail/zero inputs.
5. Implement capital-allocation history across dividends, gross repurchases, issuance/SBC, net share change, acquisitions/divestitures, debt change, and available price/financing context. A beneficial buyback interpretation requires evidence beyond repurchase existence.
6. Deliver the Detailed Resilience vertical slice and Simple resilience summary from the same production selectors, with raw/context blocks, accessible formulas/tables, non-color states, mobile raw-before-context order, and exact trace targets.

## Change Boundary And Rollback

**Allowed:** derived formula/diagnostic/capital-allocation functions and policies, Resilience/Simple projections/renderers, formula tests, and route scenario tests.

**Excluded:** archetype assignment, company-specific KPI definitions, model graphs, narrative authoring, peer statistics, registry/Feature 002, shared market/provider code, and source transport.

**Rollback:** reverse Scope 04 formula/policy/rendering/test hunks and select the prior validated pointer. Raw source objects and prior metrics/history remain immutable.

## Scenario-First Red/Green Contract

Author raw/context ordering, closed preferred-stock states, buyback decomposition, invalid denominator, and no-score assertions first. Expected values are deterministic outputs of known formulas over source-qualified inputs, never fixture-authored conclusions.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Unit | unit | SCN-010-010, SCN-010-011, SCN-010-012 | `tests/company-fundamentals-diagnostics.unit.mjs` | Production formulas, input lineage, invalid denominators, diagnostic applicability, preferred states, and capital-allocation decomposition | `node --test tests/company-fundamentals-diagnostics.unit.mjs` | No |
| TP-04-02 | Publication validator | integration | SCN-010-010, SCN-010-011, SCN-010-012 | `scripts/validate-company-fundamentals.mjs` | Recompute every published metric/check and reject missing lineage, score fields, or raw/context drift | `node scripts/validate-company-fundamentals.mjs` | Yes |
| TP-04-03 | Regression E2E | e2e-ui | SCN-010-010 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-010 raw and contextual diagnostics remain side by side with complete trace` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-010 raw and contextual diagnostics remain side by side with complete trace" --reporter=list` | Yes |
| TP-04-04 | Regression E2E | e2e-ui | SCN-010-011 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-011 omitted preferred stock is absent from source and never zero or pass` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-011 omitted preferred stock is absent from source and never zero or pass" --reporter=list` | Yes |
| TP-04-05 | Regression E2E | e2e-ui | SCN-010-012 | `tests/company-fundamentals-lab.spec.mjs` | `Regression: SCN-010-012 buyback interpretation includes issuance dilution and net share change` | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-010-012 buyback interpretation includes issuance dilution and net share change" --reporter=list` | Yes |
| TP-04-06 | Broader Regression E2E | e2e-ui | SCN-010-010, SCN-010-011, SCN-010-012 | `tests/company-fundamentals-lab.spec.mjs` | Complete cumulative Feature 010 browser suite through Scope 04 | `npx --no-install playwright test tests/company-fundamentals-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes |

### Definition of Done

#### Core Delivery Items

- [ ] FR-010-023 through FR-010-040 are implemented with formula/input lineage, raw-before-context applicability, closed missing states, and no universal score or advice.
- [ ] SCN-010-010, SCN-010-011, and SCN-010-012 are delivered through the same production selectors in Simple, Resilience, Sources, and accepted publications.
- [ ] Formula tests assert production-computed results from source-qualified inputs and fail under pass-through/hardcoded replacements.
- [ ] Scenario-specific E2E regression coverage exists for every Scope 04 user-visible behavior and the broader E2E suite passes.
- [ ] Scenario-first RED and identical-command GREEN evidence exists for every Scope 04 behavior.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-04-01 unit evidence proves derived metrics, qualifications, diagnostic applicability, and capital-allocation decomposition.
- [ ] TP-04-02 integration evidence proves publication formula/lineage and raw/context parity.
- [ ] TP-04-03 Regression E2E evidence proves SCN-010-010.
- [ ] TP-04-04 Regression E2E evidence proves SCN-010-011.
- [ ] TP-04-05 Regression E2E evidence proves SCN-010-012.
- [ ] TP-04-06 broader E2E evidence proves cumulative behavior through Scope 04.

#### Build Quality Gate

- [ ] Exact RED/GREEN ledger, no-score/no-advice/no-zero scans, formula decomposition and invalid-denominator matrix, accessible raw/context/table parity, editor diagnostics, `git diff --check`, selftest, validator, artifact lint, capability-foundation check, framework write guard, and changed-path classification are current and every finding is individually accounted for in `report.md`.
