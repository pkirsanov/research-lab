# Scope 24: Complete Allocation And Explicit Views

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** Not Started
**Scope-Kind:** runtime-behavior
**Tags:** `overlay:allocation`, `remediation`
**Depends On:** 23
**Entry Gate:** Every scope in `Depends On` must be Done.
**Findings:** F008-ALLOCATION-001, F008-SENSITIVITY-BL-001
**Requirements:** FR-123 through FR-141; NFR-002, NFR-005, NFR-017, NFR-021.

## Outcome

Implement all six allocation methods under one complete constrained basis, feed explicit Black-Litterman views into posterior allocation, and expose diagnostics, costs, path/survival outcomes, contributions, and multi-axis sensitivity without clipping or heuristic substitution.

## Gherkin Scenario And Ownership

### SCN-008-050: Six real methods share all constraints and explicit views

```gherkin
Scenario: A user compares six allocations with exclusions cash leverage turnover groups and an explicit Black Litterman view
  Given one frozen basis contains eligible assets evidence covariance expected-return policy costs common paths and every explicit constraint
  When current equal-weight minimum-variance equal-risk-contribution Black-Litterman and constrained-MVO candidates run
  Then each method enforces the common applicable constraints or returns infeasible with diagnostics
  And risk parity solves contribution balance rather than inverse volatility
  And constrained MVO optimizes within the feasible set rather than clipping an unconstrained answer
  And the explicit BL horizon magnitude range confidence source and uncertainty produce posterior returns used by its allocation
  And every candidate exposes convergence constraint cost contribution path survival turnover and sensitivity outcomes without a winner
```

## Implementation Plan

1. Reconcile `AllocationBasis/v1` with asset/group bounds, exclusions, explicit cash reserve, leverage/sum rule, turnover budget, eligibility, cost, and common-scenario fields.
2. Implement deterministic feasible projection and conflict diagnostics; no post-hoc clipping or constraint relaxation.
3. Implement minimum variance, equal-risk-contribution risk parity, explicit Black-Litterman posterior plus common constrained optimizer, and constrained MVO with residual/convergence diagnostics.
4. Keep no-view BL as explicit equilibrium-only research using a declared benchmark allocation and risk-aversion policy; never substitute accidental equal weight.
5. Extend the BL editor to require horizon, magnitude/range, confidence source, and uncertainty, then feed the posterior into candidate weights.
6. Run method-appropriate sensitivity over history, means, covariance, views, costs, constraints, risk aversion, and group/turnover bounds.
7. Project contributions, costs, turnover, drawdown/common paths, cash-needs survival, instability, and reversal conditions for every candidate.

## Change Boundary

- **Allowed:** allocation/BL/sensitivity portions of `rlportfolioanalytics.js`, Allocation route/editor regions, policy/fixtures, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-allocation.functional.mjs`, and `tests/portfolio-survival-allocation.spec.mjs`.
- **Excluded:** personal store lifecycle, brief ranking, generic publisher, path generator internals except typed common-path consumption, dossier persistence, registry/docs, and framework-managed files.

## Shared Infrastructure Impact Sweep

| Contract | Consumers | Canary |
|---|---|---|
| AllocationBasis and feasibility | All six methods, paths, dossier | Every candidate reports the same basis fingerprint and constraint residuals. |
| Constrained solvers | Allocation UI and sensitivity | Known optima/KKT or ERC identities plus infeasible controls. |
| Black-Litterman posterior | BL editor, candidate, dossier | Explicit view mutation changes posterior and weights; behavior mutation does not. |
| Common paths and costs | Candidate outcomes and no-winner comparison | Same path IDs/cost policy across methods. |

## Consumer Impact Sweep

| Consumer | Required proof |
|---|---|
| Allocation Simple and Power | Six stable method rows share one basis, state vocabulary, costs, paths, and no-winner boundary. |
| Black-Litterman editor | Explicit views, uncertainty, posterior, and resulting allocation remain attributable and behavior-independent. |
| Dossier and sensitivity views | Every solver attempt, residual, constraint, perturbation, and outcome retains its identity. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-050 feasible six methods | Full feasible constraints | Run all six | Six method-specific results and shared basis | e2e-ui |
| SCN-008-050 conflicting constraints | Infeasible group/cash/turnover set | Run | Infeasible rows and conflict diagnostics; no relaxation | e2e-ui |
| SCN-008-050 BL view | Enter explicit horizon/range/confidence/uncertainty | Confirm and run | Posterior and weights change with attributable input | e2e-ui |
| SCN-008-050 sensitivity | Perturb all declared axes | Inspect ranges | Weight/outcome/reversal ranges; instability visible | e2e-ui |

## Test Plan

Every remediation assertion and exact title below is `planned-not-authored` at P1. Existing carrier paths do not imply that the new test exists.

| ID | Test Type | Category | Scenario | File / Location | Executable Behavior | Command | Live System | Evidence |
|---|---|---|---|---|---|---|---|---|
| TP-24-01 | Unit | unit | 050 | `tests/portfolio-analytics.unit.mjs` | Projection, solvers, KKT/ERC, BL posterior, constraints, diagnostics, sensitivity identities | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-24-01` |
| TP-24-02 | Functional | functional | 050 | `tests/portfolio-allocation.functional.mjs` | Six candidates on one basis with costs, contributions, common paths, survival and no winner | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-24-02` |
| TP-24-03 | Regression E2E | e2e-ui | 050 | `tests/portfolio-survival-allocation.spec.mjs` | Exact title: `Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views" --reporter=list` | Yes | `report.md#tp-24-03` |
| TP-24-04 | Adversarial mutation | unit | 050 | `tests/portfolio-analytics.unit.mjs` | Disposable inverse-volatility, clipping, ignored-constraint, equal-weight-benchmark, and unused-posterior mutations each fail | `node --test --test-name-pattern="Adversarial: heuristic clipped and disconnected allocation methods cannot satisfy the six method contract" tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-24-04` |
| TP-24-05 | Constraint/BL regression E2E | e2e-ui | 050 | `tests/portfolio-survival-allocation.spec.mjs` | Exact title: `Regression: SCN-008-050 infeasible constraints remain visible and explicit BL posterior changes allocation` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-050 infeasible constraints remain visible and explicit BL posterior changes allocation" --reporter=list` | Yes | `report.md#tp-24-05` |
| TP-24-06 | Broader regression | functional | 050 | `scripts/selftest.mjs` | Shared analytics and static-site invariants remain green | `node scripts/selftest.mjs` | No | `report.md#tp-24-06` |

## Rollback And Restore

- Keep current allocation and every prior candidate immutable; a new run publishes only after all method rows validate on one basis.
- Solver failure/infeasibility remains a stable candidate row and cannot mutate the current PortfolioDefinition.
- Revert allocation/editor/test files as one unit while preserving persisted candidate records under their versioned identities.

### Definition of Done - Tiered Validation

- [ ] SCN-008-050 is implemented with real constrained methods, explicit BL posterior, complete outcomes, and no universal winner.
- [ ] TP-24-01 unit evidence passes.
- [ ] TP-24-02 functional evidence passes.
- [ ] TP-24-03 complete real-page regression passes.
- [ ] TP-24-04 adversarial mutation proof rejects every audited heuristic or disconnected behavior.
- [ ] TP-24-05 constraint/BL real-page regression passes.
- [ ] TP-24-06 broader regression passes.
- [ ] Shared Infrastructure Impact Sweep and immutable rollback proof are recorded.
- [ ] Build Quality Gate passes with zero skips/warnings and no excluded-file changes.
