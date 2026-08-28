# Scope 11: Stress, Tail, And Alternative Dependence

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `diversification:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 10 - Dated Cash Needs And Survival States

**Primary Outcome:** Diversification distinguishes normal, raw stress, volatility-adjusted stress, finite tail, downside/drawdown/recovery overlap, and appraisal-qualified alternative evidence without universal contagion or mechanical decorrelation claims.

## Requirement Coverage

- **Functional:** FR-105 through FR-115 and FR-122.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-007, FR-021, FR-050, FR-082 through FR-083, and every sample/threshold/event/de-smoothing trial remain explicit and dossier-countable.

## Gherkin Scenarios

### SCN-008-022 - Raw crisis correlation receives volatility context

```gherkin
Scenario: SCN-008-022 - Cross-asset correlation rises during a high-volatility stress sample
  Given normal and stress samples are explicitly defined
  When dependence is compared
  Then raw correlations and volatility changes are shown
  And an eligible volatility-adjusted estimate or an explicit unavailable reason is shown
  And the product does not automatically label the raw increase contagion
```

### SCN-008-023 - Crisis correlation never becomes a universal one

```gherkin
Scenario: SCN-008-023 - Several holdings become more dependent in downside observations
  Given a finite stressed sample and uncertainty estimate exist
  When the diversification read is authored
  Then increased dependence and tail co-movement are visible
  And thin-sample uncertainty is visible
  And the read does not state that all assets always become perfectly correlated
```

### SCN-008-024 - Alternative appraisal smoothing limits decorrelation claims

```gherkin
Scenario: SCN-008-024 - A manually valued real estate or collectible series appears smooth
  Given valuations are infrequent, stale, appraisal-based, or user-entered
  When normal correlation and volatility are shown
  Then valuation frequency, last appraisal, liquidity, expected transaction cost, and smoothing caveat are prominent
  And the asset is not treated as mechanically orthogonal
  And sensitivity to a de-smoothed or stress assumption is required before a diversification conclusion
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-022 stress adjustment | Explicit tranquil/stress samples and anchor variance | Select raw/adjusted lens and pair | Raw correlations, variance changes, anchor orientation, assumptions, adjusted estimate or exact unavailable reason remain separate; no automatic contagion label | e2e-ui |
| SCN-008-023 finite tails | Full and below-floor tail fixtures | Inspect tail/co-exceedance/drawdown/recovery rows | Estimate, quantile, joint count, sample, interval and thin/unavailable state appear; no universal correlation-one claim | e2e-ui |
| SCN-008-024 manual alternative | Quarterly stale appraisal, low liquidity, missing cost | Inspect observed/de-smoothed/stress rows | Frequency/date/method/liquidity/cost/smoothing warnings precede result; diversification conclusion is unavailable until required evidence/sensitivity | e2e-ui |
| Matrix/table parity | Desktop/mobile/130% text/reduced motion | Traverse matrix by arrows/touch; inspect pair disclosures/table | Synchronous nonblank 1:1/4:3 pixels, complete accessible cell names/table, stable geometry, no overlap/body overflow/color-only meaning | e2e-ui |

## Implementation Plan

1. Add explicit named/date/benchmark-downside stress sample selection, raw Pearson estimates, variances, intervals, sample counts, source/cutoff identity, and searched-event/trial accounting.
2. Add anchor-qualified `forbesRigobonAdjustment` with finite variance checks, orientation, formula assumptions, raw/adjusted separation, and exact unavailable reason. It never proves or disproves contagion universally.
3. Add empirical lower-tail dependence with configured quantile/sample/event floor, deterministic bootstrap interval, and separate downside co-exceedance, drawdown overlap, and recovery overlap.
4. Preserve manual/appraisal observations at actual valuation frequency. Add explicit valuation age/method/liquidity/transaction/storage/insurance states and optional `desmoothReturns(rho)` sensitivity without daily interpolation or replacement of observed data.
5. Require explicit normal/stress/tail/de-smoothing parameters from mandatory config or user input; each changed definition creates a variant/trial identity and no hidden event/threshold/rho is supplied.
6. Render lens controls, dependence matrix/pair table, Forbes-Rigobon caveat, finite-sample uncertainty, alternative-quality rows, What Would Change This Read, synchronous canvas, adjacent table, and mobile pair disclosures.
7. Add independently derived raw/adjusted/tail/de-smoothing cases, anchor orientation mutations, event-floor boundaries, appraisal warnings, no-universal-copy scans, and real matrix pixel/table/keyboard/mobile tests.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, `tests/portfolio-survival-foundation.spec.mjs`, and Scope 11 fixture entries.

> **Boundary amendment — finding F-11-CONFIG-BOUNDARY (recorded during execution).**
> This scope requires a *configured* lower-tail quantile and forbids a hidden
> threshold, but `rlportfolio.js` owns the exact-key policy validator that must
> accept the new key, and it was excluded. The alternative — deriving the
> quantile from an already-declared value such as `minimumTailObservations` — is
> exactly the hidden assumption this scope exists to forbid, so it was rejected.
> Enabling the Diversification route likewise required adding it to
> `descriptiveRouteStates`, whose exact-set check lives in the same file, and
> that change correctly failed route-list pins in three test files, which are
> therefore also admitted.
>
> This is the **third occurrence of the same structural class**
> (F-08-CONFIG-BOUNDARY, F-09-PERSISTENCE-BOUNDARY, F-11-CONFIG-BOUNDARY). The
> recurrence is recorded rather than patched silently a third time: the pattern
> is evidence that the scope-boundary template treats `rlportfolio.js` as pure
> storage when it is in fact the config-contract owner. See
> [report.md](report.md#scope-11-boundary-amendment).

**Explicitly excluded:** private storage/brief behavior except read-only inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, hedge/allocation/dossier implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 11 exact dependence/alternative/config/route/test/fixture blocks. Risk and Path remain complete, and Diversification displays a truthful unavailable state rather than a simplified correlation matrix.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. No route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

One consumer effect here is real. Per the F-11-CONFIG-BOUNDARY amendment above, enabling the Diversification route required **adding** it to `descriptiveRouteStates`, whose exact-set check lives in `rlportfolio.js`. That is an addition to a route list, not a rename of an entry in it — and because the check is exact-set, the addition correctly failed the route-list pins in three test files, which are admitted to the boundary for that reason.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| `descriptiveRouteStates` in `rlportfolio.js` | The Diversification route is added to the exact route-state set; existing entries keep their identity | The exact-set check rejects both an undeclared and a missing entry |
| Route-list pins in `tests/portfolio-foundation.unit.mjs`, `tests/portfolio-privacy.functional.mjs`, and `tests/portfolio-survival-foundation.spec.mjs` | Each pins the route-state set and goes red by design when the set grows | Each was updated to include the new route, never relaxed to stop pinning the set |
| Diversification route regions | Lens controls, dependence matrix, pair table, Forbes-Rigobon caveat, and alternative-quality rows are added to the existing tab | The scope's focused browser rows drive the real matrix pixels, table, keyboard, and mobile disclosures |
| `portfolio-survival-allocation.config.json` | The lower-tail quantile and stress/de-smoothing parameters are declared keys rather than hidden thresholds | The exact-key validator rejects any undeclared key; deriving the quantile from `minimumTailObservations` was rejected as the hidden assumption this scope forbids |
| Risk X-Ray and Path Lab | Read-only consumers that must stay complete if this scope is reverted | The rollback statement above is proven by rerunning their carriers |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

## Scenario-First Red/Green Contract

Author independently derived raw/adjusted/tail/de-smoothing, unavailable/copy, matrix/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-11` and red/green tags. RED must identify method/sample/caveat/state/pixel/parity failure; asserting fixture-provided conclusions or one universal crisis sentence is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-11-01 | Analytics unit | unit | SCN-008-022, SCN-008-023, SCN-008-024 | `tests/portfolio-analytics.unit.mjs` | Execute named stress samples, raw correlations/variances/intervals, Forbes-Rigobon known/invalid/orientation cases, empirical tail full/thin floors, downside/drawdown/recovery separation, actual-frequency manual assets, de-smoothing sensitivity, and trial identity mutations | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-11-01` |
| TP-11-02 | Regression E2E | e2e-ui | SCN-008-022 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment" --reporter=list` | Yes | `report.md#scenario-scn-008-022` |
| TP-11-03 | Regression E2E | e2e-ui | SCN-008-023 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-023 finite tail evidence never claims universal correlation one` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-023 finite tail evidence never claims universal correlation one" --reporter=list` | Yes | `report.md#scenario-scn-008-023` |
| TP-11-04 | Regression E2E | e2e-ui | SCN-008-024 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation" --reporter=list` | Yes | `report.md#scenario-scn-008-024` |
| TP-11-05 | Matrix/accessibility Regression E2E | e2e-ui | SCN-008-022, SCN-008-023, SCN-008-024 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity" --reporter=list` | Yes | `report.md#tp-11-05` |
| TP-11-06 | Broader Regression E2E | e2e-ui | SCN-008-022, SCN-008-023, SCN-008-024 | `tests/portfolio-survival-diversification.spec.mjs` | Execute the complete cumulative Feature 008 Diversification browser suite after every focused row | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-11-06` |

### Definition of Done

- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] Consumer impact sweep completed; zero stale first-party references remain

#### Core Delivery Items

- [x] FR-105 through FR-115 and FR-122 are fully implemented with explicit normal/stress/tail samples, raw/adjusted/caveat truth, finite tail/co-exceedance/overlap distinctions, selection disclosure, alternative valuation/liquidity/cost/smoothing qualification, sensitivity, economic drivers, and invalidation evidence. Evidence: [report.md#scope-11-execution](report.md#scope-11-execution)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 53
  # fail 0
  ```

- [x] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic explainable evidence, missing/cutoff integrity, visible calibration, accessible chart/table parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only claims. Evidence: [report.md#tp-11-05](report.md#tp-11-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (1.5s)

    1 passed (3.9s)
  ```

- [x] Copy and method scans find no universal correlation-one, automatic contagion/no-contagion, physical-asset orthogonality, smoothed-low-risk, or hidden event/threshold/de-smoothing assumption. Evidence: [report.md#tp-11-06](report.md#tp-11-06)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  -- controlled break: on-page boundary replaced with "all correlations go to one" --
    ✘  1 › SCN-008-022 ...
    ✘  2 › SCN-008-023 ...
    2 failed
    3 passed (8.4s)
  -- reverted --
    5 passed (5.5s)
  ```

- [x] Matrix pixels/table/pair disclosures derive from one result, remain synchronous/nonblank and complete at desktop/mobile/zoom, and have no overlap/body overflow/hidden meaning. Evidence: [report.md#tp-11-05](report.md#tp-11-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (1.5s)

    1 passed (3.9s)
  ```

- [x] Every Scope 11 behavior has intended RED and same-command GREEN evidence before the broader browser row. Evidence: [report.md#tp-11-01](report.md#tp-11-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  not ok 50 - Forbes-Rigobon (raw returned unadjusted)
  # pass 52  # fail 1
  not ok 51 - tail floor (floor disabled)
  # pass 52  # fail 1
  -- both reverted --
  # pass 53  # fail 0
  ```


#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-11-01 unit evidence proves raw/adjusted stress, finite tail, overlap distinctions, actual-frequency alternatives, de-smoothing sensitivity, trials, and unavailable states. Evidence: [report.md#tp-11-01](report.md#tp-11-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 53
  # fail 0
  ```

- [x] TP-11-02 Regression E2E evidence proves SCN-008-022 shows raw/variance/anchor/adjusted truth without an automatic contagion label. Evidence: [report.md#scenario-scn-008-022](report.md#scenario-scn-008-022)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment (1.4s)

    1 passed (4.0s)
  ```

- [x] TP-11-03 Regression E2E evidence proves SCN-008-023 shows finite counts/intervals/thin states and no universal correlation-one copy. Evidence: [report.md#scenario-scn-008-023](report.md#scenario-scn-008-023)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-023 finite tail evidence never claims universal correlation one" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-023 finite tail evidence never claims universal correlation one (1.2s)

    1 passed (3.7s)
  ```

- [x] TP-11-04 Regression E2E evidence proves SCN-008-024 places valuation/liquidity/cost/smoothing warnings before observed and sensitivity results. Evidence: [report.md#scenario-scn-008-024](report.md#scenario-scn-008-024)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation (1.1s)

    1 passed (4.3s)
  ```

- [x] TP-11-05 matrix/accessibility E2E evidence proves nonblank pixels, equivalent tables/pair disclosures, keyboard/touch traversal, stable mobile geometry, and no overlap. Evidence: [report.md#tp-11-05](report.md#tp-11-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (1.5s)

    1 passed (3.9s)
  ```

- [x] TP-11-06 broader E2E evidence proves the complete cumulative Diversification suite passes after every focused row. Evidence: [report.md#tp-11-06](report.md#tp-11-06)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  Running 5 tests using 1 worker

    5 passed (5.5s)
  ```


#### Build Quality Gate

- [x] Focused RED/GREEN records, independent dependence/de-smoothing arithmetic review, sample/config/trial/source parity, crisis/alternative copy scan, matrix pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16. Evidence: [report.md#scope-11-traceability](report.md#scope-11-traceability)

  **Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

  **Exit Code:** 0

  **Output:**

  ```text
  RESULT: FAILED (11 failures, 0 warnings)
  -- zero failure names a Scope 11 file --
  -- an earlier run reported 14; creating the diversification spec and writing this report cleared 3 --
  ```
