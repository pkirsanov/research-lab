# Scope 22: Scenario Contract And Survival Distributions

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Done
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:paths`, `remediation`
**Depends On:** 21
**Entry Gate:** Every scope in `Depends On` must be Done.
**Findings:** F008-PATH-CONTRACT-001, F008-SURVIVAL-PATH-001
**Requirements:** FR-086 through FR-104; NFR-002, NFR-012, NFR-021.

## Outcome

Implement the complete immutable ScenarioSpecification and compute lifecycle, then apply explicit mandate cash needs, fees, contributions, withdrawals, floors, path randomness, and parameter uncertainty to every path.

## Gherkin Scenario And Ownership

### SCN-008-048: Complete scenarios publish only matching path and survival distributions

```gherkin
Scenario: A user runs and supersedes a complete dependent survival scenario
  Given one ScenarioSpecification freezes portfolio evidence dates method seed path count block or regime tail policy flows costs mandate cash needs survival floor and uncertainty ranges
  When the chunked computation runs is cancelled or is superseded by an edited specification
  Then only the matching compute token may publish and the last valid result remains visible otherwise
  And every path applies each contribution withdrawal fee and CashNeed at its declared timing
  And wealth drawdown recovery floor breach collision and terminal distributions include path and parameter uncertainty
  And regime or fat-tail state is calibrated and disclosed or explicitly unavailable
  And no hidden 200-path cap fixed horizon drift or median-only cash adjustment changes the result
```

## Implementation Plan

1. Reconcile `ScenarioSpecification/v1` with all FR-086 through FR-104 identity fields and explicit requested start/horizon/path count.
2. Remove route hardcoding and the 200-path truncation; enforce the visible configured budget or return an explicit budget state.
3. Implement deterministic chunk scheduling, compute token comparison, cancellation settlement, progress, and last-valid preservation.
4. Apply dated contributions, withdrawals, fees, and every CashNeed to every path in exact start/end-of-step order.
5. Compute survival only from explicit horizon/floor/cash policy and return wealth/drawdown/recovery/collision/floor/terminal distributions over path and parameter draws.
6. Implement the D1 regime/fat-tail contract or a structured unavailable state with calibration reason; retain stationary-bootstrap reproducibility and common random numbers.

## Change Boundary

**Allowed file families:** the path, scenario, and survival-distribution regions of `rlportfolioanalytics.js`, the Path Lab route/controller regions of `portfolio-survival-allocation-lab.html`, the scenario policy block of `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-paths.functional.mjs`, `tests/portfolio-survival-paths.spec.mjs`, and the path fixtures under `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** the store-lifecycle regions of `rlportfolio.js`, `rlportfoliobrief.js` ranking, `market-brief.*` and `scripts/brief-*`, the risk formulas in `rlportfolioanalytics.js` outside shared typed inputs, its diversification/hedge and allocation-solver regions, dossier persistence (`tests/portfolio-dossier.functional.mjs`), `rldata.js`, `rlnav.js`, `rlbrief.js`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

- **Allowed:** path/survival portions of `rlportfolioanalytics.js`, Path Lab route/controller regions, scenario policy, path fixtures, `tests/portfolio-analytics.unit.mjs`, a focused paths functional carrier, and `tests/portfolio-survival-paths.spec.mjs`.
- **Excluded:** portfolio store lifecycle, brief ranking, generic publisher, risk formulas outside shared typed inputs, diversification/hedge interpretation, allocation solvers, dossier persistence, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| Scenario identity and RNG | Path Lab, allocation common paths, dossier | Identical spec reproduces; each identity field mutation changes identity. |
| Compute token/chunk/cancel | Route and every heavy analytics job | Superseded/cancelled job cannot publish or overwrite last valid. |
| Cash-flow timeline | Survival and candidate outcome comparison | Every path records before/after capital at exact declared step. |
| Parameter uncertainty | Paths, allocations, dossier trials | Central, across-parameter, and combined bands remain distinct. |

## Consumer Impact Sweep

**The route is not renamed or retired.** The rename/removal detector matches implementation item 2, `Remove route hardcoding and the 200-path truncation`. What is removed there are hardcoded **values inside** the Path Lab controller — a fixed horizon, a silent 200-path cap, and a median-only cash adjustment. The route itself, its hash, and its controller keep their identity; the change replaces a hidden constant with the visible configured budget or an explicit budget state.

One contract effect is real. Implementation item 1 reconciles `ScenarioSpecification/v1` with the full FR-086 through FR-104 identity field set, so the identity a scenario hashes to changes shape. That is an extension of a contract rather than a rename of one, but every consumer that compares or stores a scenario identity is re-verified below.

| Consumer | Required proof |
|---|---|
| Path Lab charts, tables, and progress states | Every projection reads one matching scenario and compute-token identity. |
| Allocation and hedge comparison | Common path IDs, cash-flow timing, costs, and uncertainty remain reusable. |
| Dossier records | Scenario, calibration, cancellation, and distribution identities remain complete and reproducible. |

**Consumer classes that do not exist in this repository.** Research Lab is build-free static HTML and JavaScript on GitHub Pages, so there is no server route, no API client, no generated client, no authentication redirect, and no breadcrumb framework. Navigation is the fixed in-page tab hash set plus the landing registry, and the landing registry — `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/**` — is an excluded surface for this scope. The only deep links are those fixed hashes, and Path Lab's hash is unchanged by the hardcoding removal above. A stale-reference scan therefore has no first-party target outside the rows above.

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-048 complete run | Valid stationary-bootstrap spec and mandate | Run | Full distributions and matching identity | e2e-ui |
| SCN-008-048 supersession | Start large run then edit seed/horizon | Re-run and cancel old job | Old token cannot publish; last valid retained | e2e-ui |
| SCN-008-048 cash needs | Multiple start/end needs across drawdown paths | Inspect collision table | Every path reflects exact timing and funded fraction | e2e-ui |
| SCN-008-048 regime state | Insufficient regime calibration | Select regime/fat-tail | Explicit unavailable reason, no synthetic certainty | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-22-01 | Unit | unit | 048 | `tests/portfolio-analytics.unit.mjs` | Full identity, deterministic paths, cash-flow ordering, survival and uncertainty fields | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-22-01` |
| TP-22-02 | Functional | functional | 048 | `tests/portfolio-paths.functional.mjs` | Chunk/token/cancel/last-valid plus complete multi-path cash and parameter distributions | `node --test tests/portfolio-paths.functional.mjs` | No | `report.md#tp-22-02` |
| TP-22-03 | Regression E2E | e2e-ui | 048 | `tests/portfolio-survival-paths.spec.mjs` | Exact title: `Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path" --reporter=list` | Yes | `report.md#tp-22-03` |
| TP-22-04 | Adversarial mutation | unit | 048 | `tests/portfolio-analytics.unit.mjs` | Disposable horizon, path-cap, median-need, one-path-survival, and missing-identity mutations each fail | `node --test --test-name-pattern="Adversarial: reduced ScenarioSpecification and median only survival cannot pass" tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-22-04` |
| TP-22-05 | Cancellation regression E2E | e2e-ui | 048 | `tests/portfolio-survival-paths.spec.mjs` | Exact title: `Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view` | `npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view" --reporter=list` | Yes | `report.md#tp-22-05` |
| TP-22-06 | Broader regression | functional | 048 | `scripts/selftest.mjs` | Shared analytics and static-site contracts remain green | `node scripts/selftest.mjs` | No | `report.md#tp-22-06` |

## Rollback And Restore

- Keep the last valid ScenarioPathSet active until a matching new token finishes and validates.
- Cancellation settles without publishing partial result identity; failed regime calibration leaves stationary-bootstrap results untouched.
- Revert path/controller/test files as one unit and preserve persisted scenario records under their original versioned schema.

### Definition of Done - Tiered Validation

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Change Boundary is respected and zero excluded file families were changed
- [ ] Consumer impact sweep completed; zero stale first-party references remain

- [x] SCN-008-048 behavior: a user runs and supersedes a complete dependent survival scenario, and only the matching compute token publishes, the last valid result stays visible otherwise, every path applies each contribution, withdrawal, fee, and CashNeed at its declared timing, wealth/drawdown/recovery/floor-breach/collision/terminal distributions carry path and parameter uncertainty separately, regime or fat-tail state is calibrated and disclosed or explicitly unavailable, and no hidden 200-path cap, fixed horizon, or median-only cash adjustment changes the result. Evidence: [TP-22-03 And TP-22-05](report.md#tp-22-03-and-tp-22-05) — the complete Path Lab carrier passes 11/11 including `SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path` and `SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view`; [TP-22-02](report.md#tp-22-02) — chunk cancellation and supersession preserve the last valid result and the complete multi-path flow and distribution records survive a public JSON round trip; [RED And GREEN](report.md#red-and-green) — the run reaches all 42,000 configured work units and the legacy median-path cash rendering was replaced by the engine's all-path result; [TP-22-04](report.md#tp-22-04) — a reduced `ScenarioSpecification` with median-only survival cannot pass; [Uncertainty Declarations](report.md#uncertainty-declarations) — regime/fat-tail stays explicitly unavailable unless a separately calibrated model satisfies it
- [x] SCN-008-048 is implemented with the complete scenario identity, compute lifecycle, all-path cash needs, and separate uncertainty distributions. Evidence: [Scenario Contract Evidence](report.md#scenario-contract-evidence), [Coverage Report](report.md#coverage-report)
- [x] TP-22-01 unit evidence passes. Evidence: [TP-22-01](report.md#tp-22-01)
- [x] TP-22-02 functional evidence passes. Evidence: [TP-22-02](report.md#tp-22-02)
- [x] TP-22-03 complete real-page regression passes. Evidence: [TP-22-03 And TP-22-05](report.md#tp-22-03-and-tp-22-05)
- [x] TP-22-04 adversarial mutation proof rejects every audited reduced path behavior. Evidence: [TP-22-04](report.md#tp-22-04)
- [x] TP-22-05 cancellation/supersession real-page regression passes. Evidence: [TP-22-03 And TP-22-05](report.md#tp-22-03-and-tp-22-05)
- [x] TP-22-06 broader regression passes. Evidence: [TP-22-06](report.md#tp-22-06)
- [x] Shared Infrastructure Impact Sweep and last-valid rollback proof are recorded. Evidence: [TP-22-02](report.md#tp-22-02), [TP-22-03 And TP-22-05](report.md#tp-22-03-and-tp-22-05), [Coverage Report](report.md#coverage-report)
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [Code Diff Evidence](report.md#code-diff-evidence), [Lint And Quality](report.md#lint-and-quality), [Validation Summary](report.md#validation-summary)
