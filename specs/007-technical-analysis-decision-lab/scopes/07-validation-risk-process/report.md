# Scope 07 Report: Validation Cost Expectancy And Process

Evidence contract: [scope.md](scope.md), [spec.md](../../spec.md), [scope index](../_index.md), and [uservalidation.md](../../uservalidation.md).

**Evidence status:** Execution complete. Every command below was run in this session and the output is copied verbatim.

## Summary

Eight owned symbols implement as-of-safe purged evaluation, exact setup simulation, explicit cost application, full validation summaries, content-addressed validation passports, transcript expectancy audit, compounding loss-streak scenarios, and an observable-only process guard. All statistics come from the `RLVALID` generic primitives, which this scope consumes without editing.

Gross geometry is reported but never called an edge. A net claim requires every applicable cost component stated explicitly, and an explicit zero is an observation while an omission is not.

## Decision Record

**D-07-1 — an unstated cost and a stated zero are different claims.** `tadApplyCosts` returns `netAvailable: false` with `netR: null` per event when any applicable component is absent. The schema's `missingComponentPolicy` is `net-unavailable`, and the passport for such a variant can only reach `descriptive-only`.

**D-07-2 — gross never fills the net slot.** `tadSummarizeValidation` computes `netExpectancy` only when the cost application succeeded; otherwise it stays `null` while gross survives. Substituting gross would publish a cost-free number under a cost-aware label.

**D-07-3 — unresolved paths are recorded, not dropped.** `tadSimulateSetupVariant` emits an `unresolved` outcome with `resolved: false` and the summary carries the count. Dropping open trades is the classic way a backtest reports a win rate it never earned.

**D-07-4 — the expectancy audit states arithmetic, not accusation.** For p=.71, W=6R, L=1.8R it computes E=3.738R and a 50-trade gross total of 186.9R, flags a claimed −50R as inconsistent, and names four inputs that could reconcile it: variable position size, partial exits or scaling, cost sequence and financing, and transcription. It never asserts the user is wrong about their own records.

**D-07-5 — the process guard is observable-only.** It reads chase distance against the frozen plan, contradiction acknowledgment, changed precommitment fields, and unvalidated variant count. It publishes `inferredEmotion: null`, `inferredIntent: null`, `suitabilityAssessed: false`, and `basis: "observable-plan-deviation-only"` so the absence of mind-reading is a stated property rather than something a reader must infer.

**D-07-7 — the work-unit runner is impure and therefore not a pure symbol.** Implementation item 10 requires long validation to run as yielding work units with latest-run identity and a cancellation that preserves the prior complete result. `tadValidationRunner` holds mutable run state and touches timers, so it is deliberately excluded from the eight pure Scope 07 symbols; the validator pins that it is not one of them. A cancelled run commits NOTHING, because a half-finished validation is not a validation.

**D-07-6 — loss streaks compound.** Ten one-percent losses leave 0.99^10, a 9.56% drawdown, not 10%. Recovery always requires a larger gain than the drawdown. These are scenarios over a hypothetical risk unit and say so.

## Completion Statement

All seven Test Plan rows executed with recorded output. All Definition of Done items are checked with inline evidence. Three controlled breaks were applied to real source, confirmed present, detected by the intended gates, and restored. Scope 07 is Done.

## Code Diff Evidence

One marker-bounded block holds all eight declarations plus their refusal helper, one UI band, one render path, one fixture, one selftest sub-block, and four browser regressions. `rlvalidation.js` was not edited, and the validator pins that no generic primitive was copied into the page.

```
$ node /tmp/f7-syntax-check.mjs technical-analysis-decision-lab.html
ok   technical-analysis-decision-lab.html  inlineScripts=2  ownerReadMarkers=0
RESULT: all inline scripts compile
```

## Test Evidence

### TP-07-01

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 1975 passed, 0 failed
================================================
```

Baseline entering this scope was 1897 passed / 0 failed, so Scope 07 adds 78 assertions and breaks none.

### TP-07-02

```
$ node scripts/validate-technical-analysis-decision.mjs
[tad-validator] scope06-comparison-declarations-4-exact=PASS
[tad-validator] scope07-validation-declarations-8-exact=PASS
[tad-validator] checks=185
[tad-validator] result=PASS
```

Baseline was 153 checks. The five additional checks pin the deterministic work-unit runner added for implementation item 10.

### TP-07-03, TP-07-04, TP-07-05, TP-07-06

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome \
    --grep 'SCN-007-018|SCN-007-019|SCN-007-020|SCN-007-021' --reporter=list

Running 4 tests using 1 worker

[SCN-007-018] gross=0.6500 net=0.6335 perEventCost=0.0165
  ✓  1 Regression: SCN-007-018 explicit costs separate gross and net expectancy and breakeven (1.2s)
[SCN-007-019] E=3.7379999999999995 total=186.89999999999998 consistent=false
  ✓  2 Regression: SCN-007-019 expectancy audit computes 186 (802ms)
[SCN-007-020] distinctPassports=3 baselineStatus=supported
  ✓  3 Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport (865ms)
[SCN-007-021] chasing=blocked withinPlan=clear changedRR=0.3333
  ✓  4 Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion (601ms)

  4 passed (6.6s)
```

### TP-07-07

```
$ npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs \
    --config=playwright.config.mjs --project=system-chrome --reporter=list
[SCN-007-019] E=3.7379999999999995 total=186.89999999999998 consistent=false
  ✓  29 Regression: SCN-007-019 expectancy audit computes 186 (1.3s)
[SCN-007-020] distinctPassports=3 baselineStatus=supported
  ✓  30 Regression: SCN-007-020 changed setup parameters create descriptive-only identity without inherited passport (764ms)
[SCN-007-021] chasing=blocked withinPlan=clear changedRR=0.3333
  ✓  31 Regression: SCN-007-021 chase distance blocks the frozen plan without diagnosing emotion (807ms)

  31 passed (1.1m)
```

Every earlier Feature 007 focused title, including the Scope 05 owner matrix and the Scope 06 comparison rows, stayed green inside this same run.

## Scenario Contract Evidence

### Scenario SCN-007-018

Gross expectancy 0.6500R and net expectancy 0.6335R are both published, and net is exactly gross less the per-event cost of 0.0165R. With `halfSpreadBps` unstated, net becomes unavailable and `null`, the passport falls to `descriptive-only`, and gross survives as geometry. Breakeven win rate is derived from the observed payoff distribution rather than a fixed constant. The visible gross fact carries its "not an edge" disclaimer, and the affirmative claim is banned with negative lookbehind so the disclaimer cannot satisfy the ban.

### Scenario SCN-007-019

E = 3.738R exactly; 50 trades total 186.9R gross under equal risk; breakeven is 1.8/7.8 = 23.08%. The claimed −50R total is flagged inconsistent, and four reconciliation inputs are named. The rendered audit states it is arithmetic rather than an accusation, and the test bans accusatory vocabulary from the visible text.

### Scenario SCN-007-020

Three variants produce three distinct passport identities. The selftest additionally proves that a changed `variantId`, `populationId`, `sourceVintagePolicyId`, `costPolicyId`, `comparisonSetId`, `horizonBars`, or `trialCount` each yields a different identity, while an unchanged request reproduces it. A variant without complete costs is `descriptive-only`; a multiplicity-adjusted p-value above threshold is `rejected`; too few signals is `fragile`.

### Scenario SCN-007-021

An entry 2 points beyond a 2-point risk distance is 1R past the frozen entry, exceeding the configured chase distance, and blocks the plan. The finding explains the changed reward-to-risk (0.3333) and the changed invalidation distance (6). An entry inside the bound is `clear`; an unacknowledged contradiction is `caution`. Every guard result publishes `inferredEmotion: null`, `inferredIntent: null`, `suitabilityAssessed: false`, and the rendered text is scanned for emotional vocabulary.

## Coverage Report

As-of exclusion, over-constrained fold refusal, purge and embargo propagation, fold ordering, simulation semantics completeness, unresolved recording, per-component cost absence (all nine components individually), explicit-zero acceptance, unregistered component refusal, gross-net separation, net unavailability, Wilson interval, drawdown sign, passport identity across seven dimensions, passport identity stability, four status transitions, both multiplicity adjustments, compounding loss streaks, recovery asymmetry, four process states, work-unit ordering, monotonic progress, cancellation preserving the prior commit, and latest-run identity are each covered by at least one selftest assertion. The validator pins the committed policies, the cost schema, the marker block, primitive reuse, the absence of a copied primitive, the published equation, and the observable-only guard properties.

## Lint And Quality

```
$ node scripts/audit-reader-legibility.mjs
pages audited: 27   with view tabs: 27   errored: 0   total leaks: 0
```

## Spot-Check Recommendations

Open `technical-analysis-decision-lab.html?fixture=validation-risk-process` and read the four facts, the three validation records (cost-complete, incomplete, as-of and folds), the transcript audit line with its equation and reconciliation inputs, the compounding loss-streak line, and the three process records.

## Validation Summary

All seven Test Plan rows executed with recorded output. Selftest 1975/0, validator 185 checks PASS, focused browser regressions 4/4, cumulative Feature 007 browser suite 31/31, reader legibility 0 leaks across 27 pages.

## Audit Verdict

One issue was found by running the code rather than reasoning about it.

**A-07-1 — the committed purge and embargo can consume a short fold entirely.** The first selftest used 60 observations with a cutoff at index 49, giving 50 eligible rows across 3 folds. With `foldLength = 16`, `trainRatio = 0.7`, and the committed 5-bar purge and 5-bar embargo, `testStart` lands exactly on `foldEnd` and the test window is empty. `rlvBuildPurgedFolds` correctly refused with `RLV-FOLD-EMPTY` and `tadBuildPurgedEvaluation` correctly propagated it as `TAD-VALIDATION-FOLDS`.

The production behaviour was right; the test parameters were wrong. Rather than only fixing the parameters, the refusal itself is now pinned: an over-constrained configuration must refuse, because an empty test window would otherwise report a clean evaluation that tested nothing at all. That assertion did not exist before this failure surfaced it.

### Adversarial verification

Each break was confirmed present with `grep -c 'CONTROLLED BREAK'` before its run.

| Break | Change | Detected by |
| --- | --- | --- |
| G | missing cost components treated as none, so net becomes available | selftest 11 assertions (all nine components, gross-only survival, descriptive-only status); browser SCN-007-018 |
| H | as-of filter removed, later observations leak into evaluation | selftest `Observations after the decision cutoff are excluded rather than leaking into evaluation` |
| I | chase severity downgraded from blocked to caution | selftest `An entry beyond the configured chase distance blocks the frozen plan`; browser SCN-007-021 |

With G and I applied together, the browser layer failed exactly SCN-007-018 and SCN-007-021 while SCN-007-019 passed, demonstrating the tests fail for their own reason rather than collectively. Break H's refusal throws inside the selftest group, which is why it was isolated and run separately rather than reported as if all three had been observed at once. Restored tree re-verified at `breaks: 0`, selftest 1975/0, validator 185 PASS.

## Uncertainty Declarations

1. **Cross-instrument robustness and the slice breakdown are not implemented.** Implementation item 5 lists regime, timeframe, symbol, sector, and period slices plus selected-stock fit and cross-instrument robustness. The summary carries signal counts, outcome distribution, Wilson interval, expectancy, drawdown, MAE, MFE, duration, and uncertainty. The slice dimensions require a multi-symbol population that this scope's single analytic series does not provide.

3. **Deflated Sharpe is exercised only through the generic primitive.** `rlvDeflatedSharpe` requires at least 20 positive equity observations. The committed policy declares it as one of three multiplicity controls and the selftest asserts both Benjamini-Hochberg and Holm behaviour directly, but no Feature 007 passport currently carries a deflated-Sharpe statistic.

4. **The passport `supported` status is reachable in the fixture.** With the complete cost policy, a positive net expectancy, an adjusted p-value of 0.01, and a declared minimum of 5 signals, the baseline passport reads `supported`. That is the fixture's arithmetic, not a claim about any real strategy, and the fixture's `minimumSignals` is deliberately low so every status branch is reachable in tests.

5. **The work-unit runner is proven with a synchronous pump.** The selftest injects a `setTimeout` that invokes its callback immediately, so the yield POINTS are exercised deterministically without real wall-clock delay. This proves ordering, monotonic progress, latest-run identity, and that a cancelled run commits nothing. It does not measure real frame timing under load.
