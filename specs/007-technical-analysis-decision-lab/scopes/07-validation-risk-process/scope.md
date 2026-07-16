# Scope 07: Validation Cost Expectancy And Process

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `overlay:true`, `validation:true`, `risk-process:true`

**Depends On:** Scope 01 - Capability Foundation And Shared Contracts; Scope 02 - Technique Engine And Evidence Independence; Scope 03 - Level Geometry And Setup Lifecycle; Scope 04 - Five-Gate Synthesis And Candidate Selection; Scope 05 - Existing-Owner Publication And Strict Adapters; Scope 06 - Comparison And Optional Evidence

**Primary Outcome:** Exact setup variants receive as-of-safe, multiplicity-aware, cost-explicit validation passports and frozen hypothetical risk/process audits; changed parameters lose inherited proof, inconsistent arithmetic is rejected, and observable plan violations block the setup without diagnosing emotion or suitability.

## Gherkin Scenarios

### SCN-007-018 / BS-018 - Gross and net expectancy stay separate

```gherkin
Scenario: Costs change an otherwise positive gross setup
  Given a validated setup has a stated win rate and payoff distribution
  And the user supplies commissions, spread, slippage, and gap assumptions
  When expectancy is calculated
  Then gross and net expectancy are both shown
  And breakeven win rate reflects the configured payoff and costs
  And the product does not call gross reward-to-risk an edge
```

### SCN-007-019 / BS-019 - Inconsistent transcript arithmetic is rejected

```gherkin
Scenario: Journal inputs cannot produce the claimed result
  Given a user enters a 71 percent win rate, 6R average winner, and 1.8R average loser
  When the expectancy audit runs
  Then it calculates positive gross expectancy under equal-risk assumptions
  And it flags a claimed negative 50-trade total as inconsistent
  And it names sizing, sequencing, costs, or transcription as required reconciliation inputs
```

### SCN-007-020 / BS-020 - Custom parameters lose inherited validation

```gherkin
Scenario: Changing a threshold creates a new variant
  Given the balanced breakout definition has a supported ValidationRecord
  When the user changes its displacement, volume, persistence, or target rule
  Then a new variant identity is created
  And the prior validation remains attached only to the prior definition
  And the custom result is descriptive-only until evaluated
```

### SCN-007-021 / BS-021 - Psychology guard blocks chasing without mind-reading

```gherkin
Scenario: Late entry violates the precommitted plan
  Given a setup triggered at a defined level
  And current price has moved beyond the configured chase distance
  When the process model evaluates a new hypothetical entry
  Then it flags CHASE and blocks the original plan
  And it explains changed reward-to-risk and invalidation distance
  And it does not diagnose fear, greed, or the user's emotional state
```

## Exact Pure Symbol Ownership

Scope 07 implements `tadBuildPurgedEvaluation`, `tadSimulateSetupVariant`, `tadApplyCosts`, `tadSummarizeValidation`, `tadBuildValidationPassport`, `tadAuditExpectancy`, `tadLossStreakScenario`, and `tadEvaluateBehaviorGuard`. It consumes Scope 01 `RLVALID` primitives and Scope 03 `tadBuildRiskPlan` / `tadAuditTargets` without changing them.

## Implementation Plan

1. Build deterministic purged/embargoed folds through `rlvBuildPurgedFolds`, with source availability cutoffs, discovery/selection separated from evaluation, exact horizon/outcome definition, and no retrospective label leakage.
2. Simulate each exact setup variant over source-qualified history using the same setup, trigger, invalidation, target, expiry, comparison, and session semantics as the current evaluator. Record unresolved terminal paths rather than dropping them.
3. Count every attempted behavior-bearing variant, including failed/rejected runs; apply declared Benjamini-Hochberg discovery, Holm activation, and deflated-statistic controls through `RLVALID`.
4. Apply an explicit `TadCostPolicyV1` to every event before net summary. Commission, regulatory fees, half-spread, entry/exit slippage, gap model, borrow/financing, and sizing semantics remain individually visible; missing required components make net metrics unavailable.
5. Summarize signal count, wins/losses/unresolved, Wilson interval, average/median win/loss, payoff distribution, gross/net expectancy, drawdown, MAE/MFE, duration, uncertainty, regime/timeframe/symbol/sector/period slices, selected-stock fit, and cross-instrument robustness.
6. Build `TadValidationPassportV1` only for the exact variant, population, source/vintage policy, folds, trials, costs, horizon, and comparison identity. Status is one of supported, fragile, descriptive-only, insufficient, rejected, or unavailable.
7. Audit expectancy with reproducible equations and tolerance. For `p=.71`, `W=6R`, `L=1.8R`, compute `E=3.738R` and `N=50` gross total `186.9R`; reject a negative claimed total unless explicit variable size, partial exits, cost sequence, or transcription reconciles it.
8. Compute compounding loss-streak scenarios as scenarios, not forecasts or universal risk advice. Keep risk unit hypothetical and prohibit account/position/holding data.
9. Evaluate observable chase distance, contradiction acknowledgment, changed precommitment fields, target timing/fitting, unvalidated variant count, and setup frequency. Emit clear/caution/blocked without inferring emotion, intent, mental health, or suitability.
10. Execute long validation as deterministic fold/trial/symbol work units with `setTimeout(..., 0)` yields, latest-run identity, monotonic progress, and cancellation that preserves the prior complete passport/result and writes no partial publication/history.
11. Extend validator, analytic and source-qualified validation fixtures, selftest marker, and real-page passport/arithmetic/process regressions. Expected values are independently computed by test assertions from known inputs, not stored as fixture conclusions.

## Shared Infrastructure Impact Sweep

| Shared surface | Protected behavior | Canary and restore contract |
| --- | --- | --- |
| `rlvalidation.js` | Seven exact generic functions, Node/browser parity, deterministic output, no DOM/storage/network access | Full Scope 01 RLVALID selftests and Strategy Validation parity run before Feature 007 validation tests; Scope 07 does not edit the helper |
| `scripts/selftest.mjs` | Existing groups and Scope 01-06 Feature 007 assertions | Full selftest before browser tests; Scope 07 assertions remain in one sub-marker with exact reverse-hunk rollback |
| Feature page/config | Setup/risk identity, source cutoffs, candidate events, gate synthesis, comparison/owner truth | Every prior focused title and cumulative suite remains green; cancellation tests prove prior complete bytes and lifecycle ledger remain unchanged |

## Change Boundary And Rollback

**Allowed edits:** Feature 007 page/config/validator, Feature 007 selftest marker, Feature 007 browser file, and Feature 007 validation fixtures.

**Marker-bounded page edit:** Scope 07 declarations/scheduler live between `/* ---------- Feature 007 Scope 07: validation risk and process ---------- */` and its matching end marker. Selftest additions use the matching sub-marker.

**Explicitly excluded:** `rlvalidation.js`, Strategy Validation, owner publisher pages, shared runtime helpers, registries/navigation, notes/docs, Market Brief, package/workflow files, Feature 005/006 paths, and unrelated tests.

**Rollback/restore:** remove only Scope 07 validation/config/fixture/test hunks; verify the last pre-Scope-07 complete read/passport/ledger bytes are unchanged after cancellation and rollback; rerun Strategy Validation parity, all prior focused rows, and cumulative suite.

## Scenario-First TDD Contract

Write formula, fold, multiplicity, cost, passport, arithmetic, cancellation, and browser assertions before production behavior. Capture intended RED and identical-command GREEN. Every changed visible behavior has a literal `Regression:` title; no broad suite replaces focused proof.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact behavior / persistent title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-07-01 | Unit | unit | SCN-007-018, 019, 020, 021 | `scripts/selftest.mjs` | Execute all eight Scope 07 symbols across as-of simulation, folds, trials, multiplicity, full summaries/slices, costs, gross/net equations, arithmetic reconciliation, identity inheritance, compounding, process states, deterministic work, and cancellation | `node scripts/selftest.mjs` | No | `report.md#tp-07-01` |
| TP-07-02 | Contract validator | functional | SCN-007-018, 019, 020, 021 | `scripts/validate-technical-analysis-decision.mjs` | Validate validation/cost policies, setup/population/source/comparison identity, folds/trials/horizon/outcome fields, cost component requirements, fixture provenance, and config/universe parity | `node scripts/validate-technical-analysis-decision.mjs` | No | `report.md#tp-07-02` |
| TP-07-03 | Regression E2E | e2e-ui | SCN-007-018 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-018 explicit costs separate gross and net expectancy and breakeven` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-018 explicit costs separate gross and net expectancy and breakeven" --reporter=list` | Yes | `report.md#scenario-scn-007-018` |
| TP-07-04 | Regression E2E | e2e-ui | SCN-007-019 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-019 expectancy audit computes 186.9R and rejects the claimed loss` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-019 expectancy audit computes 186.9R and rejects the claimed loss" --reporter=list` | Yes | `report.md#scenario-scn-007-019` |
| TP-07-05 | Regression E2E | e2e-ui | SCN-007-020 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport" --reporter=list` | Yes | `report.md#scenario-scn-007-020` |
| TP-07-06 | Regression E2E | e2e-ui | SCN-007-021 | `tests/technical-analysis-decision-lab.spec.mjs` | `Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion` | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion" --reporter=list` | Yes | `report.md#scenario-scn-007-021` |
| TP-07-07 | Broader Regression E2E | e2e-ui | SCN-007-018, 019, 020, 021 | `tests/technical-analysis-decision-lab.spec.mjs` | Execute the complete cumulative Feature 007 browser suite after every Scope 07 focused title | `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-07-07` |

No stress or load row is planned because Feature 007 declares no numeric latency, percentile, throughput, or concurrency SLA. Deterministic progress, cancellation, navigation availability, and atomic prior-result retention are asserted in TP-07-01 and the complete browser suite without a timing threshold.

### Definition of Done

#### Core Delivery Items

- [ ] As-of setup simulation, purged/embargoed evaluation, trial accounting, multiplicity, outcome summaries/slices, selected-stock fit, and cross-instrument robustness implement the exact design and retain source/vintage identity.
- [ ] Every cost component and missing requirement is explicit; gross geometry, gross expectancy, net expectancy, breakeven, target audit, and uncertainty remain separate and no gross metric is called an edge.
- [ ] Parameter/comparison/profile/cost/population changes produce new identities, preserve prior passports, and remain descriptive-only until the exact variant is evaluated.
- [ ] Expectancy arithmetic and optional reconciliation are reproducible; compounding loss streaks remain scenarios; process guards use observable actions only.
- [ ] Deterministic work units, progress, cancellation, atomic commit, Shared Impact Sweep, marker boundaries, and rollback preserve prior read/passport/ledger and every excluded surface.
- [ ] Every Scope 07 Test Plan row has intended RED and same-command GREEN evidence.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-07-01 unit evidence proves simulation, folds, multiplicity, summaries, costs, arithmetic, identity, process, work-unit, and cancellation branches.
- [ ] TP-07-02 functional evidence proves validation/cost/config/reference and fixture-provenance closure.
- [ ] TP-07-03 Regression E2E evidence proves SCN-007-018 shows separate gross/net expectancy and cost-adjusted breakeven.
- [ ] TP-07-04 Regression E2E evidence proves SCN-007-019 computes positive expectancy and rejects the inconsistent negative total.
- [ ] TP-07-05 Regression E2E evidence proves SCN-007-020 creates a new descriptive-only identity without inherited validation.
- [ ] TP-07-06 Regression E2E evidence proves SCN-007-021 blocks a chased plan through observable distance/R changes without mind-reading.
- [ ] TP-07-07 broader E2E evidence proves the cumulative Feature 007 suite passes after focused Scope 07 rows.

#### Build Quality Gate

- [ ] Focused RED/GREEN records, exact arithmetic cross-check, validation/cost/config parity, RLVALID and Strategy Validation canaries, cancellation immutability, marker diffs, no-interception/silent-pass scan, editor diagnostics, `git diff --check`, artifact lint/freshness, G094, plan sync, and traceability are current and clean with every finding accounted for.
