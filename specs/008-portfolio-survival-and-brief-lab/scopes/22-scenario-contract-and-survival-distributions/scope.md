# Scope 22: Scenario Contract And Survival Distributions

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
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

| Consumer | Required proof |
|---|---|
| Path Lab charts, tables, and progress states | Every projection reads one matching scenario and compute-token identity. |
| Allocation and hedge comparison | Common path IDs, cash-flow timing, costs, and uncertainty remain reusable. |
| Dossier records | Scenario, calibration, cancellation, and distribution identities remain complete and reproducible. |

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

- [ ] SCN-008-048 is implemented with the complete scenario identity, compute lifecycle, all-path cash needs, and separate uncertainty distributions.
- [ ] TP-22-01 unit evidence passes.
- [ ] TP-22-02 functional evidence passes.
- [ ] TP-22-03 complete real-page regression passes.
- [ ] TP-22-04 adversarial mutation proof rejects every audited reduced path behavior.
- [ ] TP-22-05 cancellation/supersession real-page regression passes.
- [ ] TP-22-06 broader regression passes.
- [ ] Shared Infrastructure Impact Sweep and last-valid rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings and no excluded-file changes.
