# Scope 24: Complete Allocation And Explicit Views

Links: [spec.md](../../spec.md) | [design.md](../../design.md) | [scope index](../_index.md) | [report.md](report.md)

**Status:** In Progress
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

**Allowed file families:** the allocation, Black-Litterman, and sensitivity regions of `rlportfolioanalytics.js`, the Allocation route and view-editor regions of `portfolio-survival-allocation-lab.html`, the allocation policy block of `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and the allocation fixtures under `tests/fixtures/portfolio-survival-allocation/**`.

**Excluded surfaces:** the store-lifecycle regions of `rlportfolio.js`, `rlportfoliobrief.js` ranking, `market-brief.*` and `scripts/brief-*`, the path-generator internals of `rlportfolioanalytics.js` except typed common-path consumption, dossier persistence (`tests/portfolio-dossier.functional.mjs`), `rldata.js`, `rlnav.js`, `rlbrief.js`, `tools.json`, `index.html`, `README.md`, `notes/**`, `package.json`, `package-lock.json`, `specs/001-*` through `specs/007-*`, and `.github/bubbles/**`.

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

The consumer-facing surface is the `portfolio-survival-allocation-lab.html#allocation` deep link (`workspaceTabAllocation`), which hosts the six method rows and the Black-Litterman view editor. The sweep is a stale-reference scan confirming that hash, its tab id, and the per-method result field names stay identical for the sensitivity and dossier consumers.

| Causal binding | Executable assertion |
|---|---|
| Allocation comparison causal authority: `runAllocationComparison` → `allocationModel` → `appendAllocationComparison` → `#allocationTable` | TP-24-03 exact title `Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views` reads `#allocationTable` after explicit inputs and the view are applied, then asserts six method rows, one basis fingerprint, ERC and KKT diagnostics, shared paths, costs, survival outcomes, complete sensitivity, and the no-winner boundary. |

## UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected | Test Type |
|---|---|---|---|---|
| SCN-008-050 feasible six methods | Full feasible constraints | Run all six | Six method-specific results and shared basis | e2e-ui |
| SCN-008-050 conflicting constraints | Infeasible group/cash/turnover set | Run | Infeasible rows and conflict diagnostics; no relaxation | e2e-ui |
| SCN-008-050 BL view | Enter explicit horizon/range/confidence/uncertainty | Confirm and run | Posterior and weights change with attributable input | e2e-ui |
| SCN-008-050 sensitivity | Perturb all declared axes | Inspect ranges | Weight/outcome/reversal ranges; instability visible | e2e-ui |

## Test Plan

Five rows have authored current declarations, including exact TP-24-01 through TP-24-05 titles in their named files. TP-24-06 remains an aggregate planned carrier because the named selftest file has no exact TP-24-06 declaration. This authorship reconciliation grants no execution credit.

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

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior
  - **Two facts together, 2026-08-29 (session-bound).** Existence and discrimination: all 55 manifest scenarios resolve to receipt-derived states across RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN, so each has a carrier proven to fail when its behavior is broken. Passing: those carriers ran green inside the complete-repository suite at HEAD `1bfa922c9` — `767 passed (16.5m)`. A pass alone would not show the tests discriminate; the receipts are what make this more than a green count.
- [x] Broader E2E regression suite passes
  - **Re-verified 2026-08-29 (session-bound):** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome` at HEAD `1bfa922c9` → `767 passed (16.5m)`, zero failures. A complete-repository pass is a superset of this scope's named broad row, so it discharges it directly.
- [ ] Scope-24 attribution covers every claimed path and marker, hunk, or whole-file ownership declaration, with no unauthorized excluded coupling. It makes no isolated-commit claim and no claim about unrelated co-committed paths. → **Resolution condition:** the Scope 24 `boundary` result from the Feature 008 verifier passes, its attributed path set is complete, and an independent audit accepts the result.
- [ ] Consumer impact sweep completed; zero stale first-party references remain → **Resolution condition:** the Scope 24 `consumer` result from the Feature 008 verifier proves non-vacuous matches for every declared canonical identifier, source surface, consumer class, and test carrier, with zero forbidden stale aliases. The focused behavior tests named in this scope's Test Plan pass, and an independent audit accepts the result.

- [x] SCN-008-050 behavior: a user compares six allocations with exclusions, cash, leverage, turnover, groups, and an explicit Black Litterman view, and each method enforces the common applicable constraints or returns infeasible with diagnostics, risk parity solves contribution balance rather than inverse volatility, constrained MVO optimizes inside the feasible set rather than clipping an unconstrained answer, the explicit BL horizon, magnitude, range, confidence, source, and uncertainty produce the posterior returns its own allocation uses, and every candidate exposes convergence, constraint, cost, contribution, path, survival, turnover, and sensitivity outcomes without a winner. Evidence: [TP-24-03 and complete carrier](report.md#tp-24-03-and-tp-24-05) — 15/15 including `SCN-008-050 six real methods enforce one complete basis and explicit views`, `SCN-008-050 infeasible constraints remain visible and explicit posterior changes allocation`, `SCN-008-026 all six allocation methods share one frozen basis`, `SCN-008-027 allocation comparison presents tradeoffs and no universal winner`, `SCN-008-029 conflicting constraints remain infeasible without relaxation`, and `SCN-008-030 explicit BL keeps equilibrium, view, posterior, and uncertainty separate`; [TP-24-04](report.md#tp-24-04) — inverse volatility as ERC, post-hoc clipping, ignored asset bounds, missing benchmark identity, posterior-disconnected weights, and structurally impossible minimums without an irreducible conflict set are each independently rejected; [TP-24-01](report.md#tp-24-01) and [coverage](report.md#coverage-report) — all six interfaces, ERC/KKT identities, BL equilibrium and posterior, costs, contributions, common paths, survival, every sensitivity axis, and irreducible conflicts.
- [x] SCN-008-050 is implemented with real constrained methods, explicit BL posterior, complete outcomes, and no universal winner. Evidence: [scenario contract](report.md#scenario-contract-evidence), [coverage](report.md#coverage-report), and [real-page behavior](report.md#tp-24-03-and-tp-24-05).
- [x] TP-24-01 unit evidence passes. Evidence: [TP-24-01](report.md#tp-24-01).
- [x] TP-24-02 functional evidence passes. Evidence: [TP-24-02](report.md#tp-24-02).
- [x] TP-24-03 complete real-page regression passes. Evidence: [TP-24-03 and complete carrier](report.md#tp-24-03-and-tp-24-05).
- [x] TP-24-04 adversarial mutation proof rejects every audited heuristic or disconnected behavior. Evidence: [TP-24-04](report.md#tp-24-04).
- [x] TP-24-05 constraint/BL real-page regression passes. Evidence: [TP-24-05 and complete carrier](report.md#tp-24-03-and-tp-24-05).
- [x] TP-24-06 broader regression passes. Evidence: [TP-24-06](report.md#tp-24-06).
- [x] Shared Infrastructure Impact Sweep and immutable rollback proof are recorded. Evidence: [shared infrastructure and rollback](report.md#shared-infrastructure-and-rollback-evidence) and [last-valid preservation](report.md#tp-24-02).
- [x] Build Quality Gate passes with zero skips/warnings and no excluded-file changes. Evidence: [lint and quality](report.md#lint-and-quality) and [bounded code diff](report.md#code-diff-evidence).
