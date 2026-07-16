# Scope 10: Dated Cash Needs And Survival States

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `paths:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 09 - Dependent Path Reproducibility

**Primary Outcome:** Path Lab applies explicit contributions, withdrawals, and dated cash needs at their declared chronological step, records collision capital and sequence effects, and reports survival only when the user supplied a complete success definition.

## Requirement Coverage

- **Functional:** FR-094 through FR-104.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-007, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-011 through FR-016, FR-089 through FR-093, and the no-shift/no-softening/no-guarantee/no-hidden-floor boundary.

## Gherkin Scenarios

### SCN-008-020 - Withdrawal collision changes the path outcome

```gherkin
Scenario: A dated cash need lands during an early drawdown
  Given the user entered the need amount and date explicitly
  And a generated path falls before that date
  When the withdrawal is applied at the declared time
  Then the path records the cash-need collision and post-withdrawal capital
  And survival or floor outcomes reflect sequence risk
  And the need is not shifted or reduced to improve the result
```

### SCN-008-021 - Missing survival definition does not create a default

```gherkin
Scenario: The user runs paths without a floor or goal horizon
  Given return history and portfolio weights are available
  But survival success conditions are absent
  When paths are generated
  Then wealth, drawdown, and cash-flow distributions may be shown
  And survival probability is unavailable with a reason
  And no hidden wealth floor, withdrawal rate, or success threshold is supplied
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-020 collision | Drawdown path plus dated end-of-step need | Run, select collision path/marker, inspect before/after table | Exact first modeled date on/after need, before/amount/after/funded fraction/later effect and changed floor state; no moved/reduced need | e2e-ui |
| SCN-008-021 no definition | Valid paths; mandate horizon/floor absent | Run and inspect survival band | Wealth/drawdown/cash-flow distributions remain; survival says unavailable and links explicit fields; no percentage/floor/rate appears | e2e-ui |
| Timeline/fan parity | Desktop/mobile/130% text/reduced motion | Traverse ordered timeline and path chart/table by keyboard/touch | Marker/list/table order matches; canvas nonblank; stable geometry; no overlap/body overflow/clipped amount/date/state | e2e-ui |

## Implementation Plan

1. Add exact dated contribution/withdrawal/CashNeed ordering, `start-of-step` and `end-of-step` semantics, first modeled date on/after explicit date, currency/start-value preconditions, capital-before/amount/after/funded-fraction records, and downstream path effects.
2. Add `computeSurvival` with explicit horizon, floor/condition, cash-need treatment, failure definitions, path count/calibration limits, uncertainty, terminal wealth, floor breaches, drawdown/time-under-water/recovery, and cash-need outcomes.
3. Preserve distribution-only path output when survival inputs are absent. Do not derive a floor, horizon, withdrawal rate, liquidity need, probability, amount, or treatment from portfolio, behavior, settings, or config.
4. Return explicit universally infeasible/collision/partial/unavailable states when eligible resources or currency/starting-value evidence cannot fund needs; never shift, reduce, skip, reorder, clip, or silently convert a need.
5. Render survival definition, cash-flow timeline, collision selection, before/after capital, funded/at-risk results, sequence examples, failure definitions, uncertainty, and assumption/dossier links from the same ScenarioSpecification.
6. Synchronize timeline, fan chart, selected path, and equivalent ordered table. Preserve the last valid result on invalid/non-finite edits and make corrections create a new scenario identity.
7. Add independently calculated start/end-step, date-boundary, ordering, currency, absolute/fraction, collision, infeasible, no-definition, and mobile/timeline/canvas cases.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-paths.spec.mjs`, and Scope 10 fixture entries.

**Explicitly excluded:** storage/brief behavior except read-only explicit inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, dependence/hedge/allocation/dossier implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 10 exact cash-flow/survival/route/test/fixture blocks. Scope 09 path distributions remain reproducible; Path Lab shows survival/collision unavailable rather than inventing a result.

## Scenario-First Red/Green Contract

Author chronological cash-flow, collision, unavailable survival, timeline/table/canvas, and persistent browser assertions first. Execute each row through the tool log with `SCOPE-10` and red/green tags. RED must identify date/order/capital/floor/identity/UI failure; a test that seeds the asserted collision output instead of computing it is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-10-01 | Analytics unit | unit | SCN-008-020, SCN-008-021 | `tests/portfolio-analytics.unit.mjs` | Execute chronological start/end-step flows, date boundary, capital before/after/funded fraction, sequence effects, currency/starting-value requirements, explicit survival conditions, distribution-only absence, infeasible resources, identity mutations, and no-shift/no-default mutations | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-10-01` |
| TP-10-02 | Regression E2E | e2e-ui | SCN-008-020 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: SCN-008-020 dated cash need records before and after collision capital` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-020 dated cash need records before and after collision capital" --reporter=list` | Yes | `report.md#scenario-scn-008-020` |
| TP-10-03 | Regression E2E | e2e-ui | SCN-008-021 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: SCN-008-021 missing survival definition renders distributions without probability` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-021 missing survival definition renders distributions without probability" --reporter=list` | Yes | `report.md#scenario-scn-008-021` |
| TP-10-04 | Timeline/canvas Regression E2E | e2e-ui | SCN-008-020, SCN-008-021 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity" --reporter=list` | Yes | `report.md#tp-10-04` |
| TP-10-05 | Broader Regression E2E | e2e-ui | SCN-008-018 through SCN-008-021 | `tests/portfolio-survival-paths.spec.mjs` | Execute the complete cumulative Feature 008 Path Lab browser suite after every Scope 10 focused row | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-10-05` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-094 through FR-104 are fully implemented with exact chronological flows, collision state, explicit survival preconditions/limits/failures, full path outputs, infeasibility, no expected path, common scenario basis, and deep links to assumptions/candidate/dossier.
- [ ] NFR-002 through NFR-003, NFR-005 through NFR-007, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic identities, provenance, missing/cutoff/atomic truth, reproducible dossier inputs, visible calibration, accessible chart/table parity, responsive stable geometry, precision/source honesty, failure isolation, and research-only copy.
- [ ] Missing horizon/floor/condition/currency/start value remains unavailable; no hidden policy or behavior supplies it, and no cash need is moved, reduced, skipped, reordered, or silently converted.
- [ ] Timeline and path canvas/table derive from the same result, remain synchronous/nonblank and ordered at desktop/mobile/zoom, and have no overlap/body overflow/hidden state.
- [ ] Every Scope 10 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-10-01 unit evidence proves exact cash-flow timing/collision/capital/sequence, explicit survival admission, distribution-only absence, infeasibility, identity, and adversarial no-shift/no-default behavior.
- [ ] TP-10-02 Regression E2E evidence proves SCN-008-020 applies the need at the declared modeled step and shows exact before/after/funded/later outcomes.
- [ ] TP-10-03 Regression E2E evidence proves SCN-008-021 shows distributions but no survival probability or hidden floor/rate without explicit conditions.
- [ ] TP-10-04 timeline/canvas E2E evidence proves ordered markers/table/path pixels, keyboard/touch traversal, stable mobile/desktop geometry, and no overlap.
- [ ] TP-10-05 broader E2E evidence proves the complete cumulative Path Lab suite passes after every focused row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent cash-flow/survival arithmetic review, mandate/scenario/config parity, timeline/canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
