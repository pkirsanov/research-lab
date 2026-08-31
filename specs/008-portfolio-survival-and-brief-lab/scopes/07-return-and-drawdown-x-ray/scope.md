# Scope 07: Return And Drawdown X-Ray

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `risk:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 06 - Explainable Research Action Lifecycle

**Primary Outcome:** Risk X-Ray uses one frozen source-qualified return sample to show arithmetic return, compounded CAGR, conditional volatility drag, exact drawdown, and unrecovered state with plain-language interpretation, synchronous nonblank canvas, and equivalent accessible table.

## Requirement Coverage

- **Functional:** FR-068 through FR-073 and FR-083 through FR-085.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-011 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-020 through FR-021, FR-050, FR-067, and the no-forecast/no-universal-lower-volatility claim boundary.

## Gherkin Scenarios

### SCN-008-013 - Arithmetic and geometric return remain distinct

```gherkin
Scenario: SCN-008-013 - The portfolio has volatile historical returns
  Given an aligned return sample and portfolio weights are valid
  When Risk X-Ray calculates return statistics
  Then arithmetic mean, compounded CAGR, and observed volatility drag are shown separately
  And the approximation g ~= mu - sigma squared over two is labeled conditional with assumptions
  And no conclusion states that lower volatility universally produces higher wealth
```

### SCN-008-014 - Drawdown and unrecovered state are truthful

```gherkin
Scenario: SCN-008-014 - The latest portfolio path has not recovered its prior peak
  Given the sample includes a peak and subsequent drawdown
  But no later observation regains that peak by the evidence cutoff
  When drawdown statistics are shown
  Then maximum drawdown, peak date, trough date, and current depth are visible
  And recovery is labeled unrecovered as of the cutoff
  And no future recovery duration is fabricated
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-013 returns | Known volatile exact-date fixture, simple/power | Open `#risk-xray`, inspect metric definitions and switch mode | Arithmetic, CAGR, drag, sample, annualization, assumptions, uncertainty and conditional copy remain distinct and equal across modes | e2e-ui |
| SCN-008-014 drawdown | Peak/trough/unrecovered fixture with later excluded observation | Inspect chart/table and traverse points by keyboard/touch | Exact peak/trough/current/depth/time-under-water; `Unrecovered as of cutoff`; no post-cutoff/future duration | e2e-ui |
| Canvas/table parity | 1440x1000 and 390x844, 130% text, reduced motion | Load visible/hidden tab, switch mode, resize, inspect pixels/table | Synchronous nonblank pixels, stable 16:9/4:3 frame, equivalent rows, no body overflow/overlap/clipping | e2e-ui |

## Implementation Plan

1. Add Node/browser dual-runtime `rlportfolioanalytics.js` with pure finite-input/error helpers and exact `alignPortfolioReturns`, `computeReturnMetrics`, and `computeDrawdown` contracts; every clock, cutoff, policy, sample, and identity is an argument.
2. Align adjusted-close simple returns by exact common observation date, explicit valuation currency/FX, source/adjustment/corporate-action state, and declared cutoff. No forward-fill, interpolation, missing-as-zero, calendar guess, post-cutoff observation, or ambient clock is allowed.
3. Compute arithmetic annualization, elapsed-time wealth-index CAGR, observed drag, volatility, sample/annualization state, and conditional approximation only under the designed scale/return/cash-flow assumptions.
4. Compute running peak, trough, maximum/current drawdown, duration/time-under-water, first eligible recovery, and exact unrecovered cutoff state without extrapolation.
5. Build Risk X-Ray Simple and Power projections from the same immutable analytics result and WorkspaceIdentity. Parameter changes create a child identity and do not refetch frozen observations or create a behavior event.
6. Render stable Return/Compounding and Drawdown/Recovery bands, synchronous canvas with `RLCHART` attachment, visible question/interpretation/source line, keyboard/touch point traversal, and immediately adjacent semantic table.
7. Add known independently calculated analytic fixtures and source-qualified UI fixtures. Assertions fail if production logic becomes a pass-through, lower-volatility rank, missing-value substitute, or post-cutoff recovery.

## Change Boundary And Rollback

**Allowed new file:** `rlportfolioanalytics.js`.

**Allowed edits:** `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-survival-risk.spec.mjs`, `tests/portfolio-survival.support.mjs`, and Scope 07 fixture entries.

**Explicitly excluded:** storage/brief behavior except read-only contract consumption, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, allocation/path/dependence/hedge functions, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 07 exact analytics/route/test/fixture blocks. The Brief remains complete; Risk X-Ray returns to a truthful unavailable owner state with no fabricated metric or public registration.

## Consumer Impact Sweep

**This scope renames nothing.** The rename/removal detector matches the rollback sentence directly above, where `remove` falls within 160 characters of `route`. That sentence describes reverting this scope's own additive blocks, not retiring a route any consumer holds. Scope 07 introduces the new file `rlportfolioanalytics.js` and fills the existing `#risk-xray` regions; no route hash, config key, exported symbol, storage key, or persistent test title that existed before this scope is renamed, deleted, moved, or deprecated.

| Consumer surface this scope touches | Why it is touched | Regression check |
|---|---|---|
| `#risk-xray` Simple and Power projections | Return, compounding, drawdown, and recovery bands are added to an existing empty route region | The scope's focused browser rows assert nonblank canvas and the adjacent semantic table on the real route |
| `rlportfolioanalytics.js` exported contracts | New dual-runtime file; `alignPortfolioReturns`, `computeReturnMetrics`, and `computeDrawdown` are additions with no prior name to displace | The analytics unit rows call the production functions directly |
| `WorkspaceIdentity` and its child identities | Parameter changes create a child identity rather than refetching frozen observations | Assertions fail if production logic degrades to a pass-through or substitutes a missing value |
| Portfolio Brief | Read-only consumer of the same frozen return sample; must stay complete if this scope is reverted | The rollback statement above is proven by rerunning the Brief carriers |
| SCN-008-013 connected output authority | `computeReturnMetrics()` → `riskXRayProjection()` → `riskProjection()` → `appendRiskXRay()` → `#riskArithmetic` | TP-07-02 exact title `Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate` independently calculates and asserts arithmetic annualization in `#riskArithmetic`. Current source truth selects `computeReturnMetrics()`. `alignPortfolioReturns()` supplies its input through a sibling call and does not own the asserted metric. |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface here; Feature 008 is registered once, in Scope 16. The only deep links are those fixed hashes, which this scope does not change. A stale-reference scan therefore has no first-party target outside the rows above.

## Scenario-First Red/Green Contract

Write independently calculated formula, cutoff mutation, chart/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-07` and red/green tags. RED must identify a numeric identity, cutoff, copy, pixel, table, keyboard, or geometry defect; asserting fixture literals that bypass production computation is invalid.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-07-01 | Analytics unit | unit | SCN-008-013, SCN-008-014 | `tests/portfolio-analytics.unit.mjs` | Execute exact-date alignment, currency/corporate-action/calendar/missing states, independently calculated arithmetic/CAGR/drag identities, conditional approximation admission, drawdown peak/trough/current/recovery, cutoff exclusion, deterministic identity, and non-finite rejection | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-07-01` |
| TP-07-02 | Regression E2E | e2e-ui | SCN-008-013 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate" --reporter=list` | Yes | `report.md#scenario-scn-008-013` |
| TP-07-03 | Regression E2E | e2e-ui | SCN-008-014 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff" --reporter=list` | Yes | `report.md#scenario-scn-008-014` |
| TP-07-04 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-013, SCN-008-014 | `tests/portfolio-survival-risk.spec.mjs` | `Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom` | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom" --reporter=list` | Yes | `report.md#tp-07-04` |
| TP-07-05 | Broader Regression E2E | e2e-ui | SCN-008-013, SCN-008-014 | `tests/portfolio-survival-risk.spec.mjs` | Execute the complete cumulative Feature 008 Risk X-Ray browser suite after every focused row | `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-07-05` |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 07 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

#### Core Delivery Items

- [x] FR-068 through FR-073 and FR-083 through FR-085 are fully implemented with one frozen return basis, separate arithmetic/CAGR/drag, conditional approximation, exact drawdown/recovery/cutoff, alignment states, backward-looking boundary, plain interpretation, and structured data.
- [x] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-011 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic math, provenance, missing/cutoff integrity, visible calibration, latest-token results, accessibility, chart parity, responsive stable geometry, precision honesty, source transparency, failure isolation, and research-only copy.
- [x] Canvas pixel and table rows are derived from the same immutable result, draw synchronously when measurable, remain nonblank across mode/viewport activation, and have no overlap/body overflow/hover-only meaning.
- [x] Exact change boundary and rollback preserve Brief/foundation behavior and every excluded file family.
- [x] Every Scope 07 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [x] TP-07-01 unit evidence proves source-qualified alignment, independent return identities, conditional drag, cutoff-bounded drawdown, deterministic identity, and rejection states.
- [x] TP-07-02 Regression E2E evidence proves SCN-008-013 keeps arithmetic/CAGR/drag/assumptions separate without a lower-volatility winner.
- [x] TP-07-03 Regression E2E evidence proves SCN-008-014 shows exact peak/trough/current/unrecovered state and excludes later observations.
- [x] TP-07-04 canvas/accessibility E2E evidence proves synchronous nonblank pixels, equivalent tables, keyboard/touch traversal, stable dimensions, and no overlap at desktop/mobile/zoom.
- [x] TP-07-05 broader E2E evidence proves the cumulative Risk X-Ray suite passes after every focused row.

```text
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  ✓  1 Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate (1.1s)
  ✓  2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (816ms)
  ✓  3 Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom (1.1s)
  ✓  4 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio (924ms)
  4 passed (6.5s)
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  29 passed (43.2s)
```

#### Build Quality Gate

- [x] Focused RED/GREEN records, independent arithmetic review, cutoff/source/config parity, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and scope-local traceability are current and clean with every finding individually accounted for in `report.md`. Scope-local traceability is `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`, executed while this scope is the active scope in `state.json`, with zero failure naming this scope's own files. Whole-feature `--all-scopes` traceability is NOT required here; the [Feature Completion Gate](../_index.md#feature-completion-gate) enforces it once, in Scope 16.

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 16
# fail 0
$ node scripts/selftest.mjs
1640 passed, 0 failed
$ node --test tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
# pass 98
# fail 0
$ RED proof -- cutoff derivation inverted to max-of-latest
  x  2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff
  1 failed  3 passed
$ GREEN restored
  4 passed (6.5s)
$ RED proof -- cutoff fence disabled in rlportfolioanalytics.js
# pass 10
# fail 3
$ GREEN restored
# pass 16
# fail 0
$ grep -rn "page.route|context.route|intercept(|msw|nock" tests/portfolio-survival-risk.spec.mjs
(no matches -- live stack, no interception)
$ git diff --check
(clean)
$ bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
RESULT: FAILED (19 failures, 0 warnings)
  -- all 19 name test files owned by UNBUILT scopes 08-16 (paths, diversification,
     allocation, mobile). ZERO name a Scope 07 file, which is the DoD criterion.
```
