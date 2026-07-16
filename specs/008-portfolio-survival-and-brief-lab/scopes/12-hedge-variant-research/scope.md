# Scope 12: Hedge Variant Research

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

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
Scenario: A user compares a currency-hedged and unhedged research portfolio
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

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-diversification.spec.mjs`, and Scope 12 fixture entries.

**Explicitly excluded:** private storage/brief behavior except read-only explicit inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, allocation/dossier implementation, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 12 exact hedge/config/route/test/fixture blocks. Scope 11 dependence/alternative behavior remains complete, and hedge state becomes explicitly unavailable rather than zero-cost or implicitly unhedged.

## Scenario-First Red/Green Contract

Author independent overlay/cost/basis, missing-net, same-basis identity, no-prescription, canvas/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-12` and red/green tags. RED must identify decomposition/state/identity/copy/pixel/parity failure; fixture pass-through or zero-cost substitution is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-12-01 | Analytics unit | unit | SCN-008-025 | `tests/portfolio-analytics.unit.mjs` | Execute independently derived overlay returns, gross risk, carry/direct/turnover costs, basis/residual regression, liquidity/net states, missing component behavior, normal/stress/path sensitivity, ratio identity, and behavior/settings exclusion | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-12-01` |
| TP-12-02 | Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-025 hedge comparison separates gross carry costs basis and residual` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedge comparison separates gross carry costs basis and residual" --reporter=list` | Yes | `report.md#scenario-scn-008-025` |
| TP-12-03 | Same-basis Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-025 hedge variants reuse one scenario basis and never prescribe a ratio` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedge variants reuse one scenario basis and never prescribe a ratio" --reporter=list` | Yes | `report.md#tp-12-03` |
| TP-12-04 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | `Regression: SCN-008-025 hedge variant pixels tables and disclosures remain equivalent on mobile` | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedge variant pixels tables and disclosures remain equivalent on mobile" --reporter=list` | Yes | `report.md#tp-12-04` |
| TP-12-05 | Broader Regression E2E | e2e-ui | SCN-008-022 through SCN-008-025 | `tests/portfolio-survival-diversification.spec.mjs` | Execute the complete cumulative Feature 008 Diversification browser suite after every hedge-focused row | `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-12-05` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-116 through FR-122 are fully implemented with explicit target/proxy/horizon/ratio, residual/basis risk, separate gross/carry/direct/turnover/liquidity/net fields, honest missing-net state, explicit research variants, normal/stress sensitivity, no execution/personal sizing, and invalidation evidence.
- [ ] NFR-002 through NFR-003, NFR-005, NFR-011, NFR-013 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic explainable outputs, missing-state integrity, visible calibration, accessible chart/table parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only copy.
- [ ] No hidden zero cost/carry/proxy, behavior-derived ratio, optimal/suitable hedge, executable contract, automatic portfolio mutation, order control, or personalized hedge-size output exists.
- [ ] Hedge pixels/tables/disclosures derive from one result, remain synchronous/nonblank and complete at desktop/mobile/zoom, and have no overlap/body overflow/hidden field.
- [ ] Every Scope 12 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [ ] TP-12-01 unit evidence proves overlay/cost/basis/residual/liquidity/net arithmetic, missing states, path sensitivity, identity, and behavior/settings exclusion.
- [ ] TP-12-02 Regression E2E evidence proves SCN-008-025 separates every hedge component and blocks net benefit when cost evidence is missing.
- [ ] TP-12-03 same-basis E2E evidence proves hedge variants reuse the scenario/random basis and never prescribe or execute a ratio.
- [ ] TP-12-04 canvas/accessibility E2E evidence proves nonblank pixels, equivalent tables/disclosures, keyboard/touch behavior, stable mobile geometry, and no overlap.
- [ ] TP-12-05 broader E2E evidence proves the complete cumulative Diversification suite passes after every focused hedge row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent hedge/cost/basis arithmetic review, variant/config/scenario/trial parity, no-prescription/execution scan, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
