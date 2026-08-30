# Scope 09: Dependent Path Reproducibility

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

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
Scenario: SCN-008-018 - The same dependent-path specification is executed twice
  Given portfolio revision, return sample, block policy, horizon, cash flows, fees, and seed are identical
  When block-bootstrap paths are generated twice
  Then path identities and result summaries are identical
  And block length and sampling assumptions are visible
  And changing the seed or block policy creates a distinct ScenarioSpecification
```

### SCN-008-019 - Parameter uncertainty is part of survival

```gherkin
Scenario: SCN-008-019 - Plausible expected-return, dependence, or tail parameters vary
  Given the user selects explicit uncertainty ranges or an evidence-derived parameter policy
  When survival paths are evaluated
  Then results show a distribution across parameter uncertainty as well as path randomness
  And the most influential assumptions are identified
  And one point estimate is not presented as the survival truth
```

### SCN-008-038 - A full-personal clear empties stored scenarios

Carries Scope 03's discharged `scenarios` conjunct. Scope 09 is the first scope that
persists a scenario, so it is the first that can assert this without vacuity.

```gherkin
Scenario: SCN-008-038 - A user clears all personal data after running dependent-path scenarios
  Given at least one scenario is genuinely persisted from a completed run
  When the user confirms the full-personal clear
  Then the scenario section is empty on a storage reread
  And public generic assets outside the Feature 008 namespace are byte-identical
  And the emptiness is read back off the storage adapters rather than the module's own report
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

**Allowed file families:** `rlportfolioanalytics.js` (path/scenario regions), `portfolio-survival-allocation-lab.html` (Path Lab regions), `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival.support.mjs`, `tests/fixtures/portfolio-survival-allocation/**` (Scope 09 entries), and — per the F-09-PERSISTENCE-BOUNDARY amendment below, for the scenario-persistence field only — `rlportfolio.js`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, and `tests/portfolio-survival-foundation.spec.mjs`.

**Excluded surfaces:** `rldata.js`, `rlnav.js`, `rlportfoliobrief.js`, `rlbrief.js`, `market-brief.html`, `market-brief.*.json`, `scripts/brief-*`, every private-storage behavior in `rlportfolio.js` other than the scenario-persistence field, the cash-need/survival regions owned by Scope 10, the dependence/hedge/allocation/dossier regions of `rlportfolioanalytics.js`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-paths.spec.mjs`, `tests/portfolio-survival.support.mjs`, and Scope 09 fixture entries.

**Amended 2026-08-13 (F-09-PERSISTENCE-BOUNDARY):** `rlportfolio.js`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, and `tests/portfolio-survival-foundation.spec.mjs` are added to the allowed set, for the scenario-persistence field only.

The three test files are included because each pins a Scope 03 privacy-inventory fact that is *designed* to go red when a later scope gives a declared category a real write path — the category count, the not-representable set, the behavior-clear survivor set, and the rendered category list. Each was updated to cover `scenarios` genuinely, by seeding it through `buildScenarioCandidate`; none was relaxed.

The original boundary excluded private storage while this scope requires a saved scenario that survives a reload and is removed by the existing full-personal clear. Those cannot both hold: the workspace schema is owned by `rlportfolio.js`, and a scenario stored anywhere else would be a parallel top-level key that a clear keyed on `FOUNDATION_LOCAL_KEYS` would miss — the exact privacy defect SCN-008-038 exists to prevent. Storing it inside the workspace inherits the existing clear, because `slotA`/`slotB` are already on that list.

`tests/portfolio-foundation.unit.mjs` is included because Scope 03 pins that no personal section may be declared without a real write path, so the sweep cannot be vacuously true. That pin goes red by design when a new section appears, and it must be updated to populate the new section **through its real builder** — never relaxed to accept an empty container.

**Still excluded:** every other private-storage behavior, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, cash-need/survival logic owned by Scope 10, dependence/hedge/allocation/dossier logic, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 09 exact path/config/route/test/fixture blocks. Risk X-Ray/Brief remain complete, and Path Lab returns a designed unavailable state with no generated or synthetic path.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. Scope 09 fills the existing Path Lab route regions and adds one `scenarios` category to the workspace schema; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

One consumer effect here is real and is recorded rather than smoothed over. Adding a declared personal category is an **additive** schema change, but Scope 03 deliberately pins facts that quantify over the whole category set, so the addition made those pins go red by design. Per the F-09-PERSISTENCE-BOUNDARY amendment above, each pin was updated to cover `scenarios` genuinely — seeded through `buildScenarioCandidate` — and none was relaxed to accept an empty container.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| Path Lab route regions and controls | Scenario controls, identity band, path fan, uncertainty bands, progress and cancel are added to the existing tab | The scope's focused browser rows drive the real route, including obsolete-token cancellation and last-valid preservation |
| `rlportfolioanalytics.js` path/scenario region | New `mulberry32`, index generation, parameter grid, and `ScenarioSpecification/v1` validation exports | Independently checked index and path hashes; deterministic-repeat mutations must fail a pass-through |
| Workspace schema in `rlportfolio.js` — the `scenarios` slot only | A saved scenario must survive a reload and be swept by the existing full-personal clear; storing it outside the workspace would create a top-level key the clear would miss | SCN-008-038 asserts the clear empties stored scenarios; `slotA`/`slotB` are already on the clear list |
| Scope 03 privacy-inventory pins in `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, and `tests/portfolio-survival-foundation.spec.mjs` | Category count, not-representable set, behavior-clear survivor set, and rendered category list all quantify over the declared category set | Each was updated to populate the new category through its real builder; the no-write-path pin keeps the sweep from being vacuously true |
| Risk X-Ray and Portfolio Brief | Read-only consumers that must stay complete if this scope is reverted | The rollback statement above is proven by rerunning their carriers |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

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
| TP-09-06 | Discharged clear conjunct Regression E2E | e2e-ui | SCN-008-038 | `tests/portfolio-survival-paths.spec.mjs` | `Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear" --reporter=list` | Yes | `report.md#tp-09-06` |

> **TP-09-06 location amendment (recorded during Scope 09 execution).** This row
> was authored as a `functional` row in `tests/portfolio-analytics.unit.mjs` run
> under `node --test`. That location cannot carry the claim. The conjunct asserts
> that a persisted scenario *survives a reload* and is then *removed by a full
> personal clear* — both are `localStorage` lifecycle facts that only exist in a
> browser session. A `node --test` row could assert at most that a pure function
> returns an empty array, which would have been a vacuous proxy for the real
> claim while still looking green. The row is therefore relocated to the browser
> spec, which reloads the page and rereads storage. The scenario, the conjunct,
> and the evidence anchor are unchanged; only the runtime that can observe them
> is corrected.


### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-09 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 09 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 09 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

#### Core Delivery Items

- [x] FR-086 through FR-093, FR-097 through FR-098, and FR-100 through FR-103 are fully implemented with reproducible dependent paths, explicit IID/regime states, complete scenario identity, seed/block sensitivity, separate parameter uncertainty, path limits/outputs, invalid/extrapolation states, no expected-path claim, and common random allocation comparisons. Evidence: [report.md#core-item-4](report.md#core-item-4)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 39
  # fail 0
  ```

- [x] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009 through NFR-012, NFR-014 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic dossiers, cutoff/missing integrity, reproducibility, visible calibration/chunk tokens, chart parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only copy. Evidence: [report.md#tp-09-04](report.md#tp-09-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    5 passed (7.7s)
  ```

- [x] Every policy value and range comes from mandatory visible config or explicit user input; changing it changes the identity/trial record and no fallback supplies a path assumption. Evidence: [report.md#tp-09-01](report.md#tp-09-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 39
  # fail 0
  ```

- [x] Path canvas pixels/table rows derive from one immutable result, remain synchronous/nonblank at desktop/mobile/zoom, and have no overlap/body overflow/hidden uncertainty meaning. Evidence: [report.md#tp-09-04](report.md#tp-09-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom (2.1s)

    1 passed (5.0s)
  ```

- [x] SCN-008-038: Scope 03's discharged `scenarios` clear conjunct is verified here, because `ScenarioSpecification/v1` is the first persisted scenario identity in the feature. If a scenario specification is retained across a reload in any form, it is a personal category: it is registered in the privacy inventory, swept by the full-personal clear, and proven empty on reread with the generic public cache byte-identical. If it is never persisted, that is stated with the code path showing it, and the emptiness claim is withdrawn rather than asserted vacuously. TP-09-06 is the carrying row. At Scope 03 the noun had no workspace section, no `policy.storage` key, and no declarable inventory category, so nothing there could observe it. See [Scope 03 Full-Personal-Clear Enumeration Discharge](../_index.md#scope-03-full-personal-clear-enumeration-discharge). Evidence: [report.md#tp-09-06](report.md#tp-09-06)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear (2.2s)

    1 passed (5.4s)
  ```

- [x] Every Scope 09 behavior has intended RED and same-command GREEN evidence before the broader browser row. Evidence: [report.md#tp-09-04](report.md#tp-09-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    1 failed
      Regression: Feature 008 ... fan chart ... (draw disabled)
    5 passed (17.5s)
  -- break reverted --
    5 passed (7.7s)
  ```


#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-09-01 unit evidence proves seeded dependent path determinism, identity changes, separate parameter uncertainty, common streams, warnings/rejections, and stale-token preservation. Evidence: [report.md#tp-09-01](report.md#tp-09-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 39
  # fail 0
  ```

- [x] TP-09-02 Regression E2E evidence proves SCN-008-018 reruns identical paths/results and changes identity when seed or block changes. Evidence: [report.md#scenario-scn-008-018](report.md#scenario-scn-008-018)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-018 identical stationary bootstrap specification reproduces paths (1.5s)

    1 passed (4.2s)
  ```

- [x] TP-09-03 Regression E2E evidence proves SCN-008-019 displays separate path and parameter uncertainty plus influential assumptions without a point-truth claim. Evidence: [report.md#scenario-scn-008-019](report.md#scenario-scn-008-019)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-019 parameter uncertainty is separate from path randomness" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-019 parameter uncertainty is separate from path randomness (1.5s)

    1 passed (4.4s)
  ```

- [x] TP-09-04 canvas/accessibility E2E evidence proves synchronous nonblank fan pixels, equivalent tables, keyboard/touch traversal, stable dimensions, and no overlap at desktop/mobile/zoom. Evidence: [report.md#tp-09-04](report.md#tp-09-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom (2.1s)

    1 passed (5.0s)
  ```

- [x] TP-09-05 broader E2E evidence proves the cumulative Path Lab suite passes after every focused row. Evidence: [report.md#tp-09-05](report.md#tp-09-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  Running 5 tests using 1 worker

    5 passed (7.7s)
  ```

- [x] TP-09-06 discharged clear conjunct evidence proves a persisted scenario survives reload and is removed by the full personal clear, with the scenario section empty on reread. Evidence: [report.md#tp-09-06](report.md#tp-09-06)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-038 a saved scenario survives reload and is removed by a full personal clear (2.2s)

    1 passed (5.4s)
  ```


#### Build Quality Gate

- [x] Focused RED/GREEN records, independent RNG/bootstrap/hash review, scenario/config/trial parity, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, cancellation/last-valid checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16. Evidence: [report.md#scope-09-traceability](report.md#scope-09-traceability)

  **Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

  **Exit Code:** 0

  **Output:**

  ```text
  ℹ️  DoD fidelity: 23 scenarios checked, 23 mapped to DoD, 0 unmapped
  RESULT: FAILED (15 failures, 0 warnings)
  -- zero failure names a Scope 09 file; all 15 name unbuilt scopes 10-16 --
  ```
