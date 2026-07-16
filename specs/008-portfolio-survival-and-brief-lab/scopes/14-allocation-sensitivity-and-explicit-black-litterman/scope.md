# Scope 14: Allocation Sensitivity And Explicit Black-Litterman

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `allocation:true`, `ui:true`, `canvas:true`, `privacy-critical:true`

**Depends On:** Scope 13 - Six-Method Allocation Basis And Feasibility

**Primary Outcome:** Allocation Comparison exposes weight/objective/path instability across declared perturbations and accepts Black-Litterman views only through a separate explicit user editor whose equilibrium, view, uncertainty, posterior, and behavior-exclusion records remain fully attributable.

## Requirement Coverage

- **Functional:** FR-130 through FR-140.
- **Non-functional:** NFR-002 through NFR-006, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-023.
- **Cross-cutting:** FR-019, FR-022, FR-031 through FR-038, FR-123 through FR-129, and no behavior/settings/holding-frequency input to views, returns, or confidence.

## Gherkin Scenarios

### SCN-008-028 - Estimation sensitivity exposes unstable weights

```gherkin
Scenario: Small input changes produce large allocation changes
  Given a candidate is recomputed across declared history, mean, covariance, and constraint perturbations
  When its sensitivity band is evaluated
  Then weight ranges, turnover, objective ranges, and unstable holdings are visible
  And the point-weight vector is labeled unstable when warranted by the declared policy
  And no false precision is shown
```

### SCN-008-030 - Black-Litterman views are explicit, not inferred

```gherkin
Scenario: A behavior-derived interest exists for a market theme
  Given the user has not entered a Black-Litterman view for that theme
  When the Black-Litterman candidate runs
  Then behavior history contributes no view, return adjustment, or confidence
  And the candidate remains equilibrium-only or unavailable according to its explicit inputs
  And any later user-entered view is labeled separately with sensitivity
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-028 instability | Declared history/mean/covariance/cost/view/constraint perturbations | Run sensitivity, inspect ranges and reversal conditions | Valid/failed/infeasible trial counts, per-asset ranges, turnover/objective/path ranges and unstable labels; precision follows range | e2e-ui |
| SCN-008-030 equilibrium-only | Theme InterestSignal, no explicit BL view | Run BL, inspect editor/inputs, change unrelated behavior/settings | Candidate stays equilibrium-only/unavailable; no P/q/Omega/mean/confidence change; exclusion statement visible | e2e-ui |
| Explicit view entry | Valid benchmark/covariance and user-entered view/range/confidence source | Preview and confirm view | Implied equilibrium, user view, uncertainty and posterior remain separate; new candidate identity/sensitivity appears | e2e-ui |
| Responsive sensitivity/editor | Desktop/mobile/130% text/reduced motion | Inspect range visuals/tables and BL sheet via keyboard/touch | Nonblank pixels, equivalent ranges, full field groups, stable geometry, no overlap/body overflow/clipping | e2e-ui |

## Implementation Plan

1. Add `runSensitivity` over mandatory declared history windows, covariance lambdas, expected-return policies/ranges, user-view confidence/uncertainty, costs, and constraint perturbations appropriate to each method.
2. Report valid/failed/infeasible trial counts, weight ranges/dispersion, turnover/objective/path ranges, unstable assets, assumption influence, and reversal conditions. Any changed variant counts toward trial identity.
3. Add exact Black-Litterman equilibrium `pi`, explicit structured `P`, `q`, `Omega`, `tau`, user confidence/uncertainty, posterior mean/covariance, and common constrained solver input with complete source/identity records.
4. Keep benchmark weights/implied equilibrium, each explicit user view, view rationale/source, posterior estimates, and optimizer output separate. No views yields equilibrium-only; missing benchmark/covariance yields unavailable.
5. Exclude behavior events/interests, holdings presence, settings, display mode, research frequency, and passive activity from every BL/mean/confidence field by closed API shape and mutation tests.
6. Render sensitivity ranges/reversal conditions and explicit BL editor with the exclusion statement, structured views, no inferred suggestions/prefill, preview, validation, identity change, and mobile field groups.
7. Pair every range visualization with exact tables, visible trial/precision state, synchronous pixels, keyboard/touch behavior, and no winner/apply/rebalance output.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and Scope 14 fixture entries.

**Explicitly excluded:** private event/store behavior except read-only mutation inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, dossier/walk-forward/tax implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 14 exact sensitivity/BL-editor/test/fixture blocks. Scope 13 retains six candidate states with equilibrium-only BL and no sensitivity claim; no explicit view is silently converted into another method input.

## Scenario-First Red/Green Contract

Author independent posterior/sensitivity identities, trial counts, mutation isolation, precision/copy, editor, canvas/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-14` and red/green tags. RED must identify calculation/isolation/state/identity/UI failure; fixture posterior pass-through or behavior-sourced view data is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-14-01 | Analytics unit | unit | SCN-008-028, SCN-008-030 | `tests/portfolio-analytics.unit.mjs` | Execute declared perturbation grid/trial counts/ranges/reversals, independently derived BL equilibrium/posterior cases, no-view/unavailable states, closed P/q/Omega inputs, identity changes, and behavior/settings/holdings-frequency mutation isolation | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-14-01` |
| TP-14-02 | Allocation functional | functional | SCN-008-028, SCN-008-030 | `tests/portfolio-allocation.functional.mjs` | Run production sensitivity and BL view lifecycle through the common basis, preserve trial/state/assumption attribution, suppress false precision, and prove explicit view changes never mutate behavior/portfolio/current basis | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-14-02` |
| TP-14-03 | Regression E2E | e2e-ui | SCN-008-028 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions" --reporter=list` | Yes | `report.md#scenario-scn-008-028` |
| TP-14-04 | Regression E2E | e2e-ui | SCN-008-030 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence" --reporter=list` | Yes | `report.md#scenario-scn-008-030` |
| TP-14-05 | Explicit-view Regression E2E | e2e-ui | SCN-008-030 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate" --reporter=list` | Yes | `report.md#tp-14-05` |
| TP-14-06 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-028, SCN-008-030 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity" --reporter=list` | Yes | `report.md#tp-14-06` |
| TP-14-07 | Broader Regression E2E | e2e-ui | SCN-008-026 through SCN-008-030 | `tests/portfolio-survival-allocation.spec.mjs` | Execute the complete cumulative Feature 008 Allocation browser suite after every Scope 14 focused row | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-14-07` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-130 through FR-140 are fully implemented with separate benchmark/implied/user-view/confidence/posterior/weights, zero behavior/settings view input, explicit MVO policy, complete states, no relaxation, full outcomes/sensitivity ranges, instability/precision truth, no universal winner, and reversal conditions.
- [ ] NFR-002 through NFR-006, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-023 are satisfied by deterministic explainable sensitivity/BL records, missing/cutoff integrity, reproducible dossiers, visible calibration, accessible chart/table parity, stable responsive geometry, precision/source honesty, failure isolation, research-only copy, and exact inference auditability.
- [ ] Mutation tests prove behavior events/interests, holdings presence, settings, display mode, and research frequency cannot alter P, q, Omega, implied/posterior expected returns, confidence, risk aversion, or optimizer output.
- [ ] Sensitivity/editor pixels/tables/fields derive from one comparison, remain synchronous/nonblank and complete at desktop/mobile/zoom, and have no overlap/body overflow/hidden attribution.
- [ ] Every Scope 14 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-14-01 unit evidence proves perturbation ranges/trials/reversals, independent BL posterior math, no-view states, identity, and complete behavior/settings isolation.
- [ ] TP-14-02 functional evidence proves production sensitivity/BL lifecycle, attribution, precision, trial states, and current basis/portfolio immutability.
- [ ] TP-14-03 Regression E2E evidence proves SCN-008-028 exposes ranges/trials/unstable labels/reversal conditions without false point precision.
- [ ] TP-14-04 Regression E2E evidence proves SCN-008-030 leaves BL inputs/returns/confidence/candidate identity unchanged under behavior/settings changes.
- [ ] TP-14-05 explicit-view E2E evidence proves equilibrium, user view, uncertainty, posterior and allocation effect remain separate and attributable.
- [ ] TP-14-06 canvas/accessibility E2E evidence proves nonblank sensitivity pixels, equivalent tables, complete mobile editor fields, keyboard/touch behavior, and no overlap.
- [ ] TP-14-07 broader E2E evidence proves the complete cumulative Allocation suite passes after every focused row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent BL/posterior/sensitivity arithmetic review, trial/basis/config/view parity, forbidden-inference/no-winner/execution/default scan, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
