# Scope 08: Concentration, CAPM, And Risk Contribution

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `risk:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 07 - Return And Drawdown X-Ray

**Primary Outcome:** Risk X-Ray completes position/look-through concentration, benchmark/factor interpretation, raw/conditioned covariance diagnostics, and marginal/total risk contribution reconciliation without conflating beta, fit, residual, return contribution, missing coverage, or conditioned assumptions.

## Requirement Coverage

- **Functional:** FR-074 through FR-082.
- **Non-functional:** NFR-002 through NFR-003, NFR-005, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-020 through FR-021, FR-068, FR-083 through FR-085, and explicit mandatory config ownership of samples, factors, shrinkage, tolerance, and exposure thresholds.

## Gherkin Scenarios

### SCN-008-015 - Concentration exposes overlapping risk

```gherkin
Scenario: Several holdings share the same issuer, sector, factor, or underlying constituents
  Given compatible exposure data is available
  When concentration is evaluated
  Then position, issuer, sector, factor, and known look-through overlap remain separate views
  And missing holdings detail is visible
  And a concentration threshold is labeled as a research parameter rather than universal suitability
```

### SCN-008-016 - Beta, R-squared, and residual risk stay separate

```gherkin
Scenario: A portfolio has moderate benchmark beta but low explanatory power
  Given a named benchmark and aligned return window are valid
  When the CAPM diagnostic runs
  Then beta, R-squared, alpha estimate, and residual risk are reported separately
  And the benchmark, sample, frequency, and uncertainty are visible
  And moderate beta is not described as low total risk
```

### SCN-008-017 - Marginal and total risk contribution reconcile

```gherkin
Scenario: Risk contributions are available for the current covariance estimate
  Given finite weights and a valid covariance estimate exist
  When asset and factor contributions are calculated
  Then marginal and total contribution definitions are visible
  And total contributions reconcile to portfolio risk within declared numerical tolerance
  And unstable or non-positive-definite estimates are not silently repaired without disclosure
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-015 concentration | Overlapping issuer/sector/factor and partial look-through fixture | Switch lenses, inspect coverage rows | Each lens has its own coverage/source/date; missing detail stays missing; threshold is visible policy | e2e-ui |
| SCN-008-016 CAPM/factors | Known beta near 0.6 with low explanatory power and explicit benchmark | Inspect Simple row and Power record | Beta, alpha, R-squared, correlation, residual, sample/frequency/uncertainty stay separate; no low-total-risk copy | e2e-ui |
| SCN-008-017 contributions | Positive-definite and singular covariance fixtures | Inspect contribution chart/table and covariance details | MRC/RC definitions, sum/tolerance, raw/conditioned states, negative hedge contributions, and failure reason are visible | e2e-ui |
| Responsive diagnostics | Desktop/mobile/130% text/reduced motion | Traverse lenses/charts/tables by keyboard/touch | Nonblank synchronous pixels, table parity, stable dimensions, contained Power scrolling, no overlap/body overflow | e2e-ui |

## Implementation Plan

1. Add `computeConcentration` with separate position, issuer, asset-class, sector, geography, factor, currency, and dated look-through lenses; each output carries covered count/weight/source date and never assigns missing data to zero, average, or `Other`.
2. Add `fitCapm` with exact aligned excess-return inputs, benchmark, beta, alpha availability, R-squared, correlation, residual risk, standard errors, sample/frequency, risk-free policy, and low-fit interpretation.
3. Add explicit versioned proxy-factor definitions, exact-date OLS with intercept, condition/rank checks, coefficients/exposures/fit/residual/instability, and unavailable factors. No label text or behavior supplies a factor.
4. Add raw sample covariance, configured fixed-lambda diagonal shrinkage, Cholesky/eigen/condition diagnostics, and no automatic lambda increase. Raw and conditioned matrices remain separate results.
5. Add `riskContributions` for MRC/RC, negative contributions, configured `1e-8` reconciliation, factor contribution, and distinct return contribution.
6. Render Simple important-risk rows and Power concentration/CAPM/factor/contribution records, synchronized lenses, synchronous chart frames, equivalent tables, source/alignment audit, contextual explanations, and explicit unstable/unavailable states.
7. Add independently derived analytic matrices/regressions, singular/rank-deficient cases, partial metadata/look-through fixtures, and mobile/canvas/table real-page tests.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-risk.spec.mjs`, and Scope 08 fixture entries.

**Explicitly excluded:** `rlportfolio.js`, `rlportfoliobrief.js`, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, path/dependence/hedge/allocation/dossier implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 08 exact analytics/route/test/fixture blocks. Scope 07 return/drawdown remains complete, and its focused/broader risk tests pass without the later diagnostics.

## Scenario-First Red/Green Contract

Author coverage, regression identity, covariance, contribution, copy, chart/table, and persistent browser assertions before production behavior. Execute each row through the tool log with `SCOPE-08` and red/green tags. RED must identify a computed/coverage/reconciliation/state/UI defect; fixture pass-through or silent matrix repair is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-08-01 | Analytics unit | unit | SCN-008-015, SCN-008-016, SCN-008-017 | `tests/portfolio-analytics.unit.mjs` | Execute separate concentration lenses/coverage, independently derived CAPM/factor cases, raw/shrunk covariance diagnostics, positive-definite/singular/rank-deficient states, MRC/RC identities, negative contributions, and exact reconciliation tolerance | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-08-01` |
| TP-08-02 | Regression E2E | e2e-ui | SCN-008-015 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: SCN-008-015 concentration lenses expose overlap and missing look through` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-015 concentration lenses expose overlap and missing look through" --reporter=list` | Yes | `report.md#scenario-scn-008-015` |
| TP-08-03 | Regression E2E | e2e-ui | SCN-008-016 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: SCN-008-016 beta alpha R squared and residual risk stay separate` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-016 beta alpha R squared and residual risk stay separate" --reporter=list` | Yes | `report.md#scenario-scn-008-016` |
| TP-08-04 | Regression E2E | e2e-ui | SCN-008-017 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: SCN-008-017 marginal and total risk contributions reconcile` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-017 marginal and total risk contributions reconcile" --reporter=list` | Yes | `report.md#scenario-scn-008-017` |
| TP-08-05 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-015, SCN-008-016, SCN-008-017 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity" --reporter=list` | Yes | `report.md#tp-08-05` |
| TP-08-06 | Broader Regression E2E | e2e-ui | SCN-008-013 through SCN-008-017 | `tests/portfolio-survival-risk.spec.mjs` | Execute the complete cumulative Feature 008 Risk X-Ray browser suite after every Scope 08 focused row | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-08-06` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-074 through FR-082 are fully implemented with separate concentration lenses/coverage, explicit threshold policy, complete CAPM/factor diagnostics, raw/conditioned covariance disclosure, reconciled marginal/total contribution, and distinct return contribution/manual-asset interpretation.
- [ ] NFR-002 through NFR-003, NFR-005, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic identities, explainability, missing-state integrity, visible calibration, accessible chart/table parity, stable responsive geometry, precision honesty, source transparency, failure isolation, and research-only copy.
- [ ] Singular, non-positive-definite, sparse, unstable, missing benchmark/risk-free/factor/look-through states remain visible; no matrix, factor, or missing classification is silently repaired or supplied.
- [ ] Desktop/mobile/zoom canvas pixels, equivalent tables, keyboard/touch navigation, contained scrolling, long labels, focus rings, and state text have no overlap, clipping, blank canvas, body overflow, or color-only meaning.
- [ ] Every Scope 08 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [ ] TP-08-01 unit evidence proves concentration coverage, CAPM/factors, covariance diagnostics, contributions, reconciliation, and adversarial unavailable states.
- [ ] TP-08-02 Regression E2E evidence proves SCN-008-015 separates all concentration lenses and exposes missing look-through coverage.
- [ ] TP-08-03 Regression E2E evidence proves SCN-008-016 keeps beta/alpha/R-squared/correlation/residual/sample/uncertainty separate without a total-risk shortcut.
- [ ] TP-08-04 Regression E2E evidence proves SCN-008-017 reconciles MRC/RC to portfolio risk and discloses singular/raw/conditioned state.
- [ ] TP-08-05 canvas/accessibility E2E evidence proves synchronous nonblank risk visuals and equivalent tables remain stable and operable on desktop/mobile/zoom.
- [ ] TP-08-06 broader E2E evidence proves the complete cumulative Risk X-Ray suite passes after every focused row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent matrix/regression arithmetic review, config/source/coverage parity, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
