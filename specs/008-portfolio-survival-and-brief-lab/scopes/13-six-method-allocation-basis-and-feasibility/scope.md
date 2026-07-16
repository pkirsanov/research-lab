# Scope 13: Six-Method Allocation Basis And Feasibility

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `allocation:true`, `ui:true`, `canvas:true`

**Depends On:** Scope 12 - Hedge Variant Research

**Primary Outcome:** Current, equal-weight, minimum-variance, risk-parity, equilibrium-only Black-Litterman, and constrained MVO candidates run on one frozen evidence/constraint/cost/scenario basis, retain feasible/unstable/infeasible/unavailable states, and present objective tradeoffs without a winner or portfolio mutation.

## Requirement Coverage

- **Functional:** FR-123 through FR-129 and FR-132 through FR-141.
- **Non-functional:** NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-022.
- **Cross-cutting:** FR-014 through FR-016, FR-021, FR-089, FR-103, FR-116 through FR-121, and every solver/cost/mean/covariance/constraint policy remains explicit.

## Gherkin Scenarios

### SCN-008-026 - All six allocation methods share one comparison basis

```gherkin
Scenario: A user compares allocation approaches
  Given one frozen portfolio universe, evidence set, mandate, and cost policy are valid
  When current, equal-weight, minimum-variance, risk-parity, Black-Litterman, and constrained MVO candidates run
  Then every candidate uses the same shared inputs and constraints where applicable
  And method-specific assumptions remain visible
  And all feasible and infeasible candidates appear side by side
```

### SCN-008-027 - No optimizer is the universal winner

```gherkin
Scenario: One allocation candidate has the strongest in-sample metric
  Given other candidates differ on drawdown, cash-need survival, turnover, concentration, and sensitivity
  When the comparison summary renders
  Then it states the tradeoffs by objective
  And it does not label the strongest in-sample candidate best or recommended
  And the user can inspect what assumption would reverse the apparent lead
```

### SCN-008-029 - Conflicting constraints return infeasible

```gherkin
Scenario: The mandate cannot be satisfied by the eligible universe
  Given explicit minimums, maximums, exclusions, liquidity, and cash requirements conflict
  When an allocation method attempts to solve
  Then the candidate is infeasible
  And the smallest identifiable conflicting constraint set is explained when possible
  And no constraint is silently relaxed
  And the current portfolio remains unchanged
```

## UI Scenario Matrix

| Scenario | Viewports / Inputs | User Steps | Exact Visible Result | Test Type |
|----------|--------------------|------------|----------------------|-----------|
| SCN-008-026 six rows | One complete common basis with mixed candidate states | Run all six, inspect assumptions/outcomes | Six fixed rows share basis fingerprint; method assumptions/states remain separate; none disappears | e2e-ui |
| SCN-008-027 no winner | Candidate leads return but loses on other dimensions | Change objective presentation lens and inspect reversal conditions | Tradeoff table changes emphasis only; no score/winner/recommended/suitable/apply/rebalance command appears | e2e-ui |
| SCN-008-029 infeasible | Hard minimums exceed 100% after exclusions/cash | Run candidates, inspect conflict, open mandate correction | INFEASIBLE row/conflict set remains visible; constraints/current portfolio unchanged; no relaxed weight vector | e2e-ui |
| Candidate chart/table | Desktop/mobile/130% text/reduced motion | Inspect six rows, weight/risk/path tables and charts | Synchronous nonblank pixels, exact table ranges/states, stable ordered rows, contained scroll, no overlap/body overflow | e2e-ui |

## Implementation Plan

1. Add exact `AllocationBasis/v1` with eligible assets, portfolio/evidence/currency identity, raw/selected covariance, explicit expected-return policy or absence, mandate constraints, cash treatment, cost policy, scenario basis/common random streams, solver policy, and method-specific children.
2. Add deterministic bounded-simplex/linear-half-space projection, residual reporting, feasibility proof, and deletion-filter irreducible conflict set. Label the conflict irreducible, never globally smallest unless proven; no constraint is relaxed or reordered.
3. Implement current baseline, projected equal weight, minimum variance, equal-risk-contribution risk parity, equilibrium-only Black-Litterman, and constrained MVO with exact iteration/objective/KKT or projected-gradient/constraint residual/convergence state.
4. Require explicit covariance/mean/risk-aversion/cash/cost/constraint/iteration/tolerance policy. Missing expected-return policy makes MVO unavailable; solver-budget exhaustion returns unstable/unavailable and never a silent vector.
5. Evaluate every feasible candidate on common concentration/risk/path/cash-need/turnover/cost dimensions and retain current/infeasible/unavailable candidates in stable order. The current baseline is observation, not endorsement.
6. Build a Pareto-style tradeoff projection and reversal-condition placeholders derived from actual candidate dimensions, with no blended winner score and no portfolio/apply/rebalance mutation.
7. Render six stable candidate rows, common basis band, outcome comparison, infeasible conflict, assumptions, no-winner copy, synchronous range/weight visuals, equivalent tables, and mobile disclosures.
8. Add independently checked convex cases, risk-budget identities, heuristic inverse-volatility adversary, bounds/group/turnover/cash conflicts, convergence failures, basis fingerprint equality, current-portfolio immutability, and real UI tests.

## Change Boundary And Rollback

**Allowed files:** `rlportfolioanalytics.js`, `portfolio-survival-allocation-lab.html`, `portfolio-survival-allocation.config.json`, `tests/portfolio-analytics.unit.mjs`, `tests/portfolio-allocation.functional.mjs`, `tests/portfolio-survival-allocation.spec.mjs`, and Scope 13 fixture entries.

**Explicitly excluded:** private storage/brief behavior except read-only inputs, `rldata.js`, `rlnav.js`, generic Market Brief surfaces, explicit BL views/sensitivity owned by Scope 14, dossier validation/cost/trial rendering, registries/docs, package/source-lock files, Feature 001-007 work, unrelated tools/tests, and framework-managed files.

**Rollback/restore:** remove Scope 13 exact basis/solver/route/test/fixture blocks. Prior risk/path/diversification behavior remains complete; Allocation shows an explicit unavailable owner state and never mutates the current portfolio.

## Scenario-First Red/Green Contract

Author independent objective/constraint/residual, basis equality, infeasibility, no-winner, immutability, canvas/table, and persistent browser assertions first. Run exact commands through the tool log with `SCOPE-13` and red/green tags. RED must identify solver/constraint/state/identity/copy/pixel/parity failure; heuristic inverse-volatility or fixture-supplied weights are invalid substitutes.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|----|------|----------|----------|-----------------|-----------------------------------|---------|-------------|-----------------|
| TP-13-01 | Analytics unit | unit | SCN-008-026, SCN-008-027, SCN-008-029 | `tests/portfolio-analytics.unit.mjs` | Execute bounded projection, deterministic conflict filtering, current/equal/min-var/risk-parity/equilibrium-BL/MVO objectives, KKT/projected-gradient/constraint residuals, convergence states, risk-budget identity, inverse-volatility adversary, and current-portfolio immutability | `node --test tests/portfolio-analytics.unit.mjs` | No | `report.md#tp-13-01` |
| TP-13-02 | Allocation composition functional | functional | SCN-008-026, SCN-008-027, SCN-008-029 | `tests/portfolio-allocation.functional.mjs` | Run six production candidates on one basis, preserve method assumptions/states, compute common path/cost/outcome fields, render Pareto tradeoffs/reversal inputs, and retain infeasible/unavailable rows without mutation | `node --test tests/portfolio-allocation.functional.mjs` | No | `report.md#tp-13-02` |
| TP-13-03 | Regression E2E | e2e-ui | SCN-008-026 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-026 all six allocation methods share one frozen basis` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-026 all six allocation methods share one frozen basis" --reporter=list` | Yes | `report.md#scenario-scn-008-026` |
| TP-13-04 | Regression E2E | e2e-ui | SCN-008-027 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner" --reporter=list` | Yes | `report.md#scenario-scn-008-027` |
| TP-13-05 | Regression E2E | e2e-ui | SCN-008-029 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation" --reporter=list` | Yes | `report.md#scenario-scn-008-029` |
| TP-13-06 | Canvas/accessibility Regression E2E | e2e-ui | SCN-008-026, SCN-008-027, SCN-008-029 | `tests/portfolio-survival-allocation.spec.mjs` | `Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states` | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states" --reporter=list` | Yes | `report.md#tp-13-06` |
| TP-13-07 | Broader Regression E2E | e2e-ui | SCN-008-026, SCN-008-027, SCN-008-029 | `tests/portfolio-survival-allocation.spec.mjs` | Execute the complete cumulative Feature 008 Allocation browser suite after every Scope 13 focused row | `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-13-07` |

### Definition of Done

#### Core Delivery Items

- [ ] FR-123 through FR-129 and FR-132 through FR-141 are fully implemented with six candidates, one frozen basis, visible method assumptions, baseline/equal/min-var/risk-parity/MVO contracts, explicit expected returns/risk aversion, complete states, no constraint relaxation, full outcomes/sensitivity seams, no universal winner, and zero portfolio/external mutation.
- [ ] NFR-002 through NFR-003, NFR-005 through NFR-006, NFR-009, NFR-011 through NFR-018, and NFR-021 through NFR-022 are satisfied by deterministic explainable candidates, missing/cutoff integrity, reproducible dossiers, visible calibration, accessible chart/table parity, stable responsive geometry, precision/source honesty, failure isolation, and research-only copy.
- [ ] Every solver returns objective, iterations, residuals, constraint checks and reason; infeasible/unstable/unavailable rows remain visible and no hidden policy, relaxed constraint, heuristic substitute, score, winner, apply, rebalance, or trade control exists.
- [ ] Candidate pixels/tables/disclosures derive from one comparison, remain synchronous/nonblank and ordered at desktop/mobile/zoom, and have no overlap/body overflow/hidden state.
- [ ] Every Scope 13 behavior has intended RED and same-command GREEN evidence before the broader browser row.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-13-01 unit evidence proves projection, conflict, six method objectives/residuals/states, risk-budget identity, heuristic adversary, and portfolio immutability.
- [ ] TP-13-02 functional evidence proves six production candidates share one basis, preserve assumptions/states, expose common outcomes/tradeoffs, and retain infeasible/unavailable rows.
- [ ] TP-13-03 Regression E2E evidence proves SCN-008-026 renders all six stable rows on one frozen basis with method-specific assumptions.
- [ ] TP-13-04 Regression E2E evidence proves SCN-008-027 presents objective tradeoffs/reversal conditions and no winner/recommend/apply copy.
- [ ] TP-13-05 Regression E2E evidence proves SCN-008-029 shows irreducible conflict, relaxes nothing, and preserves the current portfolio.
- [ ] TP-13-06 canvas/accessibility E2E evidence proves six ordered rows, nonblank pixels, equivalent tables/disclosures, stable mobile geometry, and no overlap.
- [ ] TP-13-07 broader E2E evidence proves the complete cumulative Allocation suite passes after every focused row.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, independent solver/objective/KKT/constraint arithmetic review, basis/config/scenario/cost parity, no-winner/execution/default scan, canvas pixel/table/mobile/zoom/keyboard/no-overlap checks, no-interception/external-request scan, source-lock/runner checks, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, Test Plan/DoD parity, plan sync, and traceability are current and clean with every finding individually accounted for in `report.md`.
