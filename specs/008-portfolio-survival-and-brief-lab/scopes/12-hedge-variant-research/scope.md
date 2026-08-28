# Scope 12: Hedge Variant Research

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Done

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `diversification:true`, `hedge:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 11 - Stress, Tail, And Alternative Dependence

**Primary Outcome:** A user can compare unhedged, hedged, and explicit partial-hedge research variants on one frozen basis with gross risk, carry, direct cost, turnover, basis/residual risk, liquidity, stress/path sensitivity, and honest net-unavailable states, without a prescribed ratio or execution path.

## Requirement Coverage

- **Functional:** FR-116 through FR-122.
- **Non-functional:** NFR-002 through NFR-003, NFR-005, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-014 through FR-016, FR-021, FR-089, FR-103, and no behavior/setting-derived hedge input.

## Gherkin Scenarios

### SCN-008-025 - Hedged and unhedged comparison includes carry and basis risk

```gherkin
Scenario: SCN-008-025 - A user compares a currency-hedged and unhedged research portfolio
  Given hedge proxy, horizon, carry, transaction cost, rebalance, and basis-risk assumptions are explicit
  When the comparison runs
  Then gross risk change, carry, direct cost, turnover, residual exposure, and net modeled outcome are separate
  And missing cost evidence makes net benefit unavailable
  And no hedge ratio is prescribed as personally optimal
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-025 complete/missing costs | Explicit portfolio/proxy/ratio with complete and missing carry/cost fixtures | Compare unhedged/hedged/partial rows and inspect assumptions | Gross/carry/direct/turnover/basis/residual/liquidity/net stay separate; missing cost blocks net; no optimal/suitable ratio copy | e2e-ui |
| Same-basis Path link | One scenario identity and common random streams | Open same-basis Path comparison and return | Variant/scenario fingerprint is preserved and only allocation/hedge overlay differs; no new personal URL field | e2e-ui |
| Responsive comparison | Desktop/mobile/130% text/reduced motion | Inspect variant chart/table/disclosures with long proxy/cost labels | Nonblank synchronous pixels, complete equivalent rows, stable geometry, no overlap/body overflow/clipping | e2e-ui |

## Implementation Plan

1. Add exact `computeHedgeVariant` with target exposure, proxy/instrument class, sign, explicit ratio, horizon, rebalance, carry, commission/spread/slippage, turnover/rebalance cost, liquidity, residual exposure, and basis-risk regression inputs.
2. Compute generic overlay return exactly as designed and preserve gross risk effect, carry, direct costs, turnover, basis/residual variance, liquidity, and net modeled output as separate fields. A hedged/unhedged ETF pair is labeled product-pair evidence rather than a synthetic overlay.
3. Return gross-only or unavailable net benefit when carry/cost/proxy evidence is absent; never supply zero cost, infer a ratio from behavior/settings, automatically optimize suitability, select an executable contract, or mutate the current portfolio.
4. Evaluate explicit ratios across normal/stress paths and configured sensitivity ranges using Scope 09 common random paths. Each ratio/cost/proxy/sample change creates a variant/trial identity.
5. Render stable unhedged/hedged/partial rows, assumptions, What Would Change This Read, same-basis Path link, no-execution copy, synchronous comparison visualization, adjacent table, and mobile disclosures.
6. Add independently derived overlay/basis/cost arithmetic, missing-component states, behavior/setting mutation tests, same-basis path identity, no-prescription copy, and responsive pixel/table real-page assertions.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `rlportfolio.js`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, and Scope 12 fixture entries.

> **Boundary amendment (recorded during execution).** The hedge cost assumptions
> the user does not type — commission, spread, slippage, rebalance frequency,
> proxy basis correlation, instrument class, liquidity — are declared in the
> visible config rather than defaulted in code, which is what this scope
> requires. Their exact-key validator lives in `rlportfolio.js`, so that file is
> admitted for the same reason recorded in Scope 11. This is the **fourth**
> occurrence of the structural class first recorded as F-08-CONFIG-BOUNDARY. See
> [report.md](report.md#scope-12-boundary-amendment).

**Explicitly excluded:** private storage/brief behavior except read-only explicit inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, allocation/dossier implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 12 exact hedge/config/route/test/fixture blocks. Scope 11 dependence/alternative behavior remains complete, and hedge state becomes explicitly unavailable rather than zero-cost or implicitly unhedged.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. Scope 12 adds hedge-variant rows beside Scope 11's dependence rows in the same Diversification route; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| Diversification route regions | Unhedged, hedged, and partial-hedge rows, assumptions, and the same-basis Path link are added to the existing tab | The scope's focused browser rows drive the real page, including no-execution and no-prescription copy |
| `rlportfolioanalytics.js` hedge region | New `computeHedgeVariant` exported beside Scope 11's dependence exports | Independently derived overlay, basis, and cost arithmetic; missing-component states must return unavailable rather than zero cost |
| `portfolio-survival-allocation.config.json` and its exact-key validator in `rlportfolio.js` | Commission, spread, slippage, rebalance frequency, proxy basis correlation, instrument class, and liquidity are declared in visible config instead of defaulted in code — the fourth occurrence of the F-08-CONFIG-BOUNDARY class | The exact-key validator rejects any undeclared key; behavior and settings mutation rows prove no ratio is inferred |
| Scope 09 path identities | Hedge ratios are evaluated across the same base random draws, so the comparison basis is reused rather than redefined | Same-basis path identity is asserted directly |
| Current portfolio | Read-only; a hedge variant is research output and never mutates holdings | Asserted alongside the no-execution copy |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

## Scenario-First Red/Green Contract

Author independent overlay/cost/basis, missing-net, same-basis identity, no-prescription, canvas/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-12` and red/green tags. RED must identify decomposition/state/identity/copy/pixel/parity failure; fixture pass-through or zero-cost substitution is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-12-01 | Analytics unit | unit | SCN-008-025 | `tests/portfolio-analytics.unit.mjs` | Execute independently derived overlay returns, gross risk, carry/direct/turnover costs, basis/residual regression, liquidity/net states, missing component behavior, normal/stress/path sensitivity, ratio identity, and behavior/settings exclusion | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-12-01` |
| TP-12-02 | Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate`; asserts unhedged, partial, and fully hedged rows with residual volatility, carry, direct, turnover, total cost, and basis risk kept separate, plus no prescription | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate" --reporter=list` | Yes | `report.md#scenario-scn-008-025` |
| TP-12-03 | Missing-cost Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero" --reporter=list` | Yes | `report.md#tp-12-03` |
| TP-12-04 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom" --reporter=list` | Yes | `report.md#tp-12-04` |
| TP-12-05 | Broader Regression E2E | e2e-ui | SCN-008-022 through SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | Execute the complete cumulative Feature 008 Diversification browser suite after every hedge-focused row | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-12-05` |

### Definition of Done

- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
- [ ] Broader E2E regression suite passes
- [ ] Consumer impact sweep completed; zero stale first-party references remain

#### Core Delivery Items

- [x] FR-116 through FR-122 are fully implemented with explicit target/proxy/horizon/ratio, residual/basis risk, separate gross/carry/direct/turnover/liquidity/net fields, honest missing-net state, explicit research variants, normal/stress sensitivity, no execution/personal sizing, and invalidation evidence. Evidence: [report.md#scope-12-execution](report.md#scope-12-execution)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 58
  # fail 0
  ```

- [x] NFR-002 through NFR-003, NFR-005, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic explainable outputs, missing-state integrity, visible calibration, accessible chart/table parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only copy. Evidence: [report.md#tp-12-04](report.md#tp-12-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom (2.4s)

    1 passed (5.1s)
  ```

- [x] No hidden zero cost/carry/proxy, behavior-derived ratio, optimal/suitable hedge, executable contract, automatic portfolio mutation, order control, or personalized hedge-size output exists. Evidence: [report.md#tp-12-03](report.md#tp-12-03)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero (2.2s)

    1 passed (6.2s)
  ```

- [x] Hedge pixels/tables/disclosures derive from one result, remain synchronous/nonblank and complete at desktop/mobile/zoom, and have no overlap/body overflow/hidden field. Evidence: [report.md#tp-12-04](report.md#tp-12-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom (2.4s)

    1 passed (5.1s)
  ```

- [x] Every Scope 12 behavior has intended RED and same-command GREEN evidence before the broader browser row. Evidence: [report.md#tp-12-01](report.md#tp-12-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  not ok 56 - missing cost never treated as zero (zero-filled)
  # pass 57  # fail 1
  not ok 55 - imperfect proxy leaves basis risk (rho ignored)
  # pass 57  # fail 1
  -- both reverted --
  # pass 58  # fail 0
  ```


#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [x] TP-12-01 unit evidence proves overlay/cost/basis/residual/liquidity/net arithmetic, missing states, path sensitivity, identity, and behavior/settings exclusion. Evidence: [report.md#tp-12-01](report.md#tp-12-01)

  **Command:** `node --test tests/portfolio-analytics.unit.mjs`

  **Exit Code:** 0

  **Output:**

  ```text
  # pass 58
  # fail 0
  ```

- [x] TP-12-02 Regression E2E evidence proves SCN-008-025 separates every hedge component and blocks net benefit when cost evidence is missing. Evidence: [report.md#scenario-scn-008-025](report.md#scenario-scn-008-025)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate (2.3s)

    1 passed (5.7s)
  ```

- [x] TP-12-03 same-basis E2E evidence proves hedge variants reuse the scenario/random basis and never prescribe or execute a ratio. Evidence: [report.md#tp-12-03](report.md#tp-12-03)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero (2.2s)

    1 passed (6.2s)
  ```

- [x] TP-12-04 canvas/accessibility E2E evidence proves nonblank pixels, equivalent tables/disclosures, keyboard/touch behavior, stable mobile geometry, and no overlap. Evidence: [report.md#tp-12-04](report.md#tp-12-04)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom" --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
    ✓  1 [system-chrome] › Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom (2.4s)

    1 passed (5.1s)
  ```

- [x] TP-12-05 broader E2E evidence proves the complete cumulative Diversification suite passes after every focused hedge row. Evidence: [report.md#tp-12-05](report.md#tp-12-05)

  **Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

  **Exit Code:** 0

  **Output:**

  ```text
  Running 8 tests using 1 worker

    8 passed (13.8s)
  ```


#### Build Quality Gate

- [x] Focused RED/GREEN records, independent hedge/cost/basis arithmetic review, variant/config/scenario/trial parity, no-prescription/execution scan, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16. Evidence: [report.md#scope-12-traceability](report.md#scope-12-traceability)

  **Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

  **Exit Code:** 0

  **Output:**

  ```text
  RESULT: FAILED (11 failures, 0 warnings)
  -- zero failure names a Scope 12 file; all name unbuilt scopes 13-16 --
  ```
