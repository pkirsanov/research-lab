# Scope 09: Dependent Path Reproducibility

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `paths:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 08 - Concentration, CAPM, And Risk Contribution

**Primary Outcome:** Path Lab generates byte-reproducible stationary-bootstrap paths from one explicit scenario identity and shows path randomness separately from deterministic parameter uncertainty, with visible seed/block/sample/policy and no expected-path claim.

## Requirement Coverage

- **Functional:** FR-086 through FR-093, FR-097 through FR-098, and FR-100 through FR-103.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009 through NFR-012, NFR-014 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-021, FR-050, FR-067, FR-083, FR-089, and every seed/config/identity/cutoff field remain explicit.

## Gherkin Scenarios

### SCN-008-018 - Block-bootstrap paths are reproducible

```gherkin
Scenario: The same dependent-path specification is executed twice
  Given portfolio revision, return sample, block policy, horizon, cash flows, fees, and seed are identical
  When block-bootstrap paths are generated twice
  Then path identities and result summaries are identical
  And block length and sampling assumptions are visible
  And changing the seed or block policy creates a distinct ScenarioSpecification
```

### SCN-008-019 - Parameter uncertainty is part of survival

```gherkin
Scenario: Plausible expected-return, dependence, or tail parameters vary
  Given the user selects explicit uncertainty ranges or an evidence-derived parameter policy
  When survival paths are evaluated
  Then results show a distribution across parameter uncertainty as well as path randomness
  And the most influential assumptions are identified
  And one point estimate is not presented as the survival truth
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-018 deterministic rerun | Fixed return fingerprint, seed, block, horizon, flows, fees, weights | Run, inspect identity, rerun identical, change seed/block | Identical run hashes/summaries match; changed seed/block creates a new identity; assumptions remain visible | e2e-ui |
| SCN-008-019 uncertainty separation | Explicit 21-point policy grid and common base streams | Run central/grid scenario and inspect bands/influence | Central path-randomness, across-parameter, combined distributions and influence rows are separately labeled | e2e-ui |
| Path canvas/table | Desktop/mobile/130% text/reduced motion/hidden tab | Inspect fan pixels, keyboard/touch paths, table, mode switch | Synchronous nonblank 3:2/4:3 frame, equivalent percentiles/identities, stable dimensions, no overlap/body overflow | e2e-ui |

## Implementation Plan

1. Add exact `mulberry32`, stationary-bootstrap index generation, deterministic stratified parameter grid, common random stream, path identity, and `ScenarioSpecification/v1` validation to `rlportfolioanalytics.js`; `Math.random`, ambient clock, and hidden seed are prohibited.
2. Freeze portfolio/evidence/return fingerprints, method, seed, block policy, horizon, path count, parameter draws/ranges, rebalance, costs, contributions, withdrawals, cash needs, valuation basis, and allocation candidate in every scenario identity.
3. Generate multivariate stationary-bootstrap paths with explicit cyclic block behavior and mandatory config-owned mean block/path/parameter budgets. IID, if shown, is labeled an independence simplification; regime/fat-tail is explicit unavailable until its complete designed contract exists.
4. Separate central-parameter path percentiles, across-parameter medians/failure dispersion, combined distribution, and assumption influence. Parameter policy changes create distinct identities/trial records.
5. Use the same base random draws for allocation-only comparisons and state when common random paths are active. A representative path remains an example, never the expected future path.
6. Render Path Lab scenario controls, identity/reproducibility band, path fan, separate uncertainty bands, source/assumption lines, synchronous canvas/`RLCHART`, equivalent table, progress/cancel, and last-valid result preservation with compute-token checks.
7. Add independently checked bootstrap-index/path hashes, deterministic-repeat mutations, extreme finite warnings, non-finite/contradictory rejection, obsolete-token cancellation, mobile pixels/table/geometry, and no-pass-through tests.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival.support.mjs`, and Scope 09 fixture entries.

**Explicitly excluded:** private storage/brief behavior except read-only inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, cash-need/survival logic owned by Scope 10, dependence/hedge/allocation/dossier logic, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 09 exact path/config/route/test/fixture blocks. Risk X-Ray/Brief remain complete, and Path Lab returns a designed unavailable state with no generated or synthetic path.

## Scenario-First Red/Green Contract

Author index/path hash, parameter-band, identity mutation, cancellation, canvas/table, and browser assertions first. Run exact commands through the tool log with `SCOPE-09` and red/green tags. RED must identify determinism, dependence, uncertainty, identity, stale-publication, pixel, parity, or geometry failure; asserting a fixture-provided expected hash without production transformation is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-09-01 | Analytics unit | unit | SCN-008-018, SCN-008-019 | `tests/portfolio-analytics.unit.mjs` | Execute RNG vectors, stationary-bootstrap indices/path hashes, cyclic block behavior, scenario identity mutations, deterministic parameter grid/common streams, central/across/combined bands, influence ordering, finite-extreme warnings, invalid rejection, and obsolete-token preservation | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-09-01` |
| TP-09-02 | Regression E2E | e2e-ui | SCN-008-018 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths" --reporter=list` | Yes | `report.md#scenario-scn-008-018` |
| TP-09-03 | Regression E2E | e2e-ui | SCN-008-019 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: SCN-008-019 parameter uncertainty is separate from path randomness` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-019 parameter uncertainty is separate from path randomness" --reporter=list` | Yes | `report.md#scenario-scn-008-019` |
| TP-09-04 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-018, SCN-008-019 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom" --reporter=list` | Yes | `report.md#tp-09-04` |
| TP-09-05 | Broader Regression E2E | e2e-ui | SCN-008-018, SCN-008-019 | `tests/portfolio-survival-paths.spec.mjs` | Execute the complete cumulative Feature 008 Path Lab browser suite after every focused row | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-09-05` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-086 through FR-093, FR-097 through FR-098, and FR-100 through FR-103 are fully implemented with reproducible dependent paths, explicit IID/regime states, complete scenario identity, seed/block sensitivity, separate parameter uncertainty, path limits/outputs, invalid/extrapolation states, no expected-path claim, and common random allocation comparisons.
- [ ] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009 through NFR-012, NFR-014 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic dossiers, cutoff/missing integrity, reproducibility, visible calibration/chunk tokens, chart parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only copy.
- [ ] Every policy value and range comes from mandatory visible config or explicit user input; changing it changes the identity/trial record and no fallback supplies a path assumption.
- [ ] Path canvas pixels/table rows derive from one immutable result, remain synchronous/nonblank at desktop/mobile/zoom, and have no overlap/body overflow/hidden uncertainty meaning.
- [ ] Every Scope 09 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-09-01 unit evidence proves seeded dependent path determinism, identity changes, separate parameter uncertainty, common streams, warnings/rejections, and stale-token preservation.
- [ ] TP-09-02 Regression E2E evidence proves SCN-008-018 reruns identical paths/results and changes identity when seed or block changes.
- [ ] TP-09-03 Regression E2E evidence proves SCN-008-019 displays separate path and parameter uncertainty plus influential assumptions without a point-truth claim.
- [ ] TP-09-04 canvas/accessibility E2E evidence proves synchronous nonblank fan pixels, equivalent tables, keyboard/touch traversal, stable dimensions, and no overlap at desktop/mobile/zoom.
- [ ] TP-09-05 broader E2E evidence proves the cumulative Path Lab suite passes after every focused row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent RNG/bootstrap/hash review, scenario/config/trial parity, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, cancellation/last-valid checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
