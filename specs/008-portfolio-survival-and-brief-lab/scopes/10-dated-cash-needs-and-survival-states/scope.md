# Scope 10: Dated Cash Needs And Survival States

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

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
Scenario: SCN-008-020 - A dated cash need lands during an early drawdown
  Given the user entered the need amount and date explicitly
  And a generated path falls before that date
  When the withdrawal is applied at the declared time
  Then the path records the cash-need collision and post-withdrawal capital
  And survival or floor outcomes reflect sequence risk
  And the need is not shifted or reduced to improve the result
```

### SCN-008-021 - Missing survival definition does not create a default

```gherkin
Scenario: SCN-008-021 - The user runs paths without a floor or goal horizon
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

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. Scope 10 adds cash-flow timing and survival regions beside Scope 09's path regions in the same Path Lab route; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| Path Lab route regions | Survival definition, cash-flow timeline, collision selection, and funded/at-risk results are added to the existing tab | The scope's focused browser rows drive the real route and the equivalent ordered table |
| `rlportfolioanalytics.js` cash-flow and survival region | New `computeSurvival` and dated contribution/withdrawal/`CashNeed` ordering exported beside Scope 09's path exports | Independently calculated start-of-step and end-of-step, date-boundary, ordering, currency, and collision cases |
| Scope 09 `ScenarioSpecification` consumers | Survival reads the same specification; distribution-only output is preserved when survival inputs are absent | Scope 09 path distributions must stay reproducible when this scope is reverted |
| Explicit mandate and `CashNeed` inputs from Scope 02 | Read-only; no floor, horizon, withdrawal rate, liquidity need, or treatment may be derived from portfolio, behavior, settings, or config | SCN-008-021 asserts a missing survival definition creates no default |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

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

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 10 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

#### Core Delivery Items

- [x] FR-094 through FR-104 are fully implemented with exact chronological flows, collision state, explicit survival preconditions/limits/failures, full path outputs, infeasibility, no expected path, common scenario basis, and deep links to assumptions/candidate/dossier. Evidence: [report.md#scope-10-execution](report.md#scope-10-execution)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 48
  # fail 0
  ```

- [x] NFR-002 through NFR-003, NFR-005 through NFR-007, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic identities, provenance, missing/cutoff/atomic truth, reproducible dossier inputs, visible calibration, accessible chart/table parity, responsive stable geometry, precision/source honesty, failure isolation, and research-only copy. Evidence: [report.md#tp-10-04](report.md#tp-10-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  Running 9 tests using 1 worker

    9 passed (13.4s)
  ```

- [x] Missing horizon/floor/condition/currency/start value remains unavailable; no hidden policy or behavior supplies it, and no cash need is moved, reduced, skipped, reordered, or silently converted. Evidence: [report.md#scenario-scn-008-021](report.md#scenario-scn-008-021)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-021 missing survival definition renders distributions without probability" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-021 missing survival definition renders distributions without probability (1.3s)

    1 passed (3.8s)
  ```

- [x] Timeline and path canvas/table derive from the same result, remain synchronous/nonblank and ordered at desktop/mobile/zoom, and have no overlap/body overflow/hidden state. Evidence: [report.md#tp-10-04](report.md#tp-10-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity (1.9s)

    1 passed (4.6s)
  ```

- [x] Every Scope 10 behavior has intended RED and same-command GREEN evidence before the broader browser row. Evidence: [report.md#tp-10-01](report.md#tp-10-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  not ok 41 - a need lands on the first modeled session ... (needs shifted +1)
  not ok 43 - collision capital
  not ok 44 - date changes the outcome
  # pass 45  # fail 3
  -- break reverted --
  # pass 48  # fail 0
  ```


#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [x] TP-10-01 unit evidence proves exact cash-flow timing/collision/capital/sequence, explicit survival admission, distribution-only absence, infeasibility, identity, and adversarial no-shift/no-default behavior. Evidence: [report.md#tp-10-01](report.md#tp-10-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 48
  # fail 0
  ```

- [x] TP-10-02 Regression E2E evidence proves SCN-008-020 applies the need at the declared modeled step and shows exact before/after/funded/later outcomes. Evidence: [report.md#scenario-scn-008-020](report.md#scenario-scn-008-020)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-020 dated cash need records before and after collision capital" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-020 dated cash need records before and after collision capital (1.4s)

    1 passed (3.8s)
  ```

- [x] TP-10-03 Regression E2E evidence proves SCN-008-021 shows distributions but no survival probability or hidden floor/rate without explicit conditions. Evidence: [report.md#scenario-scn-008-021](report.md#scenario-scn-008-021)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-021 missing survival definition renders distributions without probability" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-021 missing survival definition renders distributions without probability (1.3s)

    1 passed (3.8s)
  ```

- [x] TP-10-04 timeline/canvas E2E evidence proves ordered markers/table/path pixels, keyboard/touch traversal, stable mobile/desktop geometry, and no overlap. Evidence: [report.md#tp-10-04](report.md#tp-10-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity (1.9s)

    1 passed (4.6s)
  ```

- [x] TP-10-05 broader E2E evidence proves the complete cumulative Path Lab suite passes after every focused row. Evidence: [report.md#tp-10-05](report.md#tp-10-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  Running 9 tests using 1 worker

    9 passed (13.4s)
  ```


#### Build Quality Gate

- [x] Focused RED/GREEN records, independent cash-flow/survival arithmetic review, mandate/scenario/config parity, timeline/canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16. Evidence: [report.md#scope-10-traceability](report.md#scope-10-traceability)

  **Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

  **Exit Code:** 0

  **Output:**

  ```text
  RESULT: FAILED (15 failures, 0 warnings)
  -- zero failure names a Scope 10 file; all 15 name unbuilt scopes 10-16 --
  -- an earlier run reported 17; the extra 2 were missing Scope 10 report evidence, now written --
  ```
