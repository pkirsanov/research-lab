# Scope 14 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 14 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution. The per-row TP-14-01 through TP-14-07 and per-scenario SCN-008-028/030 blocks are recorded below under their explicit anchors.

## Scenario Contract Evidence

Recorded below under the explicit `scenario-scn-008-028` and `scenario-scn-008-030` anchors.

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## Scope 14 Execution <a id="scope-14-execution"></a>

Two things that a portfolio tool is unusually tempted to fake: the confidence of
an optimiser's point weights, and the provenance of a "view".

**A range, not a point.** A single optimiser weight vector is the most
confident-looking and least reliable output in this domain — minimum-variance
weights swing hard on small covariance changes. `allocationSensitivity` reports
the range each weight takes across the DECLARED perturbation set, labels a
holding unstable when its span exceeds the declared threshold, and lets precision
follow the range: a band wider than a percentage point prints zero decimals,
because the extra digits would be false precision about an answer that moves when
the inputs barely do.

The perturbation applies to the OFF-DIAGONALS only. Scaling the whole matrix
would leave minimum-variance weights unchanged — they are scale-invariant — so
the sensitivity would look reassuringly flat while proving nothing. That is a
test that passes and means nothing, avoided in the implementation rather than
patched over in an assertion.

**Reversal conditions.** A range alone can hide the thing that actually changes a
reader's conclusion: two holdings can each move a little and still swap places.
`reversalConditions` names those pairs and the perturbation where the order
flips.

**Three columns, not one.** `blackLittermanPosterior` returns the implied
equilibrium `pi`, the view structure `P`/`q`/`Omega`, `tau`, and the posterior
mean and covariance separately, and the page renders equilibrium / your view /
posterior as three columns. A single blended expected-return vector cannot show a
reader which part of the answer is the market's and which is their own opinion
reflected back at them.

`pi` verified by hand: `Sigma·w = [0.028, 0.042]`, times `delta` 2.5 = `[0.07,
0.105]`.

**The exclusion is proven, not merely absent.** `blackLittermanViews` and
`blackLittermanPosterior` both ACCEPT behaviour events, derived interests,
holdings, display mode and research frequency as arguments and deliberately
ignore them, reporting `behaviorSignalsSeen` alongside `behaviorDerivedViews: 0`.
A function that never received those inputs could not prove it ignored them.

The receipt below repeats the exact command, exit code, and result line of the seven declared Scope 14 rows that
prove FR-130 through FR-140, already recorded per row under TP-14-01 through TP-14-07 in this report. No new
execution is claimed here.

```text
# Scope 14 declared matrix — 7 of 7 commands executed, 0 failed, 0 skipped
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
# pass 74   # fail 0
$ node --test tests/portfolio-allocation.functional.mjs
exit: 0
# pass 3   # fail 0
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions" --reporter=list
exit: 0
  1 passed (3.8s)
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence" --reporter=list
exit: 0
  1 passed (4.0s)
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate" --reporter=list
exit: 0
  1 passed (3.6s)
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity" --reporter=list
exit: 0
  1 passed (4.0s)
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
  9 passed (15.7s)
```

### TP-14-01 <a id="tp-14-01"></a>

**Command:** `node --test tests/portfolio-analytics.unit.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 74
# fail 0
```

Eleven Scope 14 rows. The defining Black-Litterman property is asserted directly:
a bullish view pulls the posterior TOWARD it without reaching it. Landing on the
view would mean the equilibrium was discarded; not moving would mean the view was
ignored. The correlated asset moves too, which is why the covariance is used
rather than one number being adjusted in isolation.

The reversal assertion is unconditional — the near-degenerate fixture must report
exactly one reversal — so it cannot pass vacuously, and a well-separated pair
must report none.

**Non-vacuity, proven twice.**

Flattening `Omega` so the stated confidence stops mattering:

```text
not ok 72 - TP-14-01 a lower stated confidence moves the posterior less
# pass 73
# fail 1
```

Admitting `behavior-derived` views:

```text
not ok 73 - TP-14-01 behavior, settings, holdings and display mode cannot alter any Black-Litterman field
# pass 73
# fail 1
```

Both reverted, both back to `# pass 74 # fail 0`.

### TP-14-02 <a id="tp-14-02"></a>

**Command:** `node --test tests/portfolio-allocation.functional.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-allocation.functional.mjs
# pass 3
# fail 0
```

The perturbation set, stability threshold, risk aversion and tau are read from
the SAME visible policy the page loads. A functional row that invented its own
numbers would prove the engine works on values nothing in production uses.

### TP-14-03 <a id="scenario-scn-008-028"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:212:1 › Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions (1.2s)

  1 passed (3.8s)
```

Asserts every holding renders as a low-to-high range rather than a point, that
each row carries one of the two declared stability verdicts rather than a blank,
that trial accounting is visible, and that reversal conditions are always
reported including the honest "none" case.

### TP-14-04 <a id="scenario-scn-008-030"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:252:1 › Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence (1.5s)

  1 passed (4.0s)
```

Asserts the posterior EQUALS the equilibrium on every row while no view is
stated, that the editor fields are empty rather than prefilled from holdings,
that the rendered note reports `0 views derived`, and that clicking Add with
empty fields refuses instead of part-accepting.

### TP-14-05 <a id="tp-14-05"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:290:1 › Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate (1.3s)

  1 passed (3.6s)
```

The load-bearing assertion is that the equilibrium column is BYTE-IDENTICAL
before and after a view is stated. If stating a view rewrote the equilibrium, the
reader could no longer see what the market thought, and the separation the whole
scope exists to preserve would be gone.

**Non-vacuity.** Rendering `posteriorMean` in the equilibrium column turned this
row RED and left the other eight GREEN:

```text
  ✘  8 › Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate (1.3s)
  1 failed
  8 passed (15.8s)
```

Reverted.

### TP-14-06 <a id="tp-14-06"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:328:1 › Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity (1.5s)

  1 passed (4.0s)
```

Proves the sensitivity and BL tables carry one row per holding, that every row is
a unique link target, that the allocation canvas stays visible beneath them, and
that there is no body overflow at 1440x1000, 390x844, or 130% text.

### TP-14-07 <a id="tp-14-07"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 9 tests using 1 worker

  ✓  1 [system-chrome] › Regression: SCN-008-026 all six allocation methods share one frozen basis (1.3s)
  ✓  2 [system-chrome] › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (764ms)
  ✓  3 [system-chrome] › Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation (898ms)
  ✓  4 [system-chrome] › Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states (1.2s)
  ✓  5 [system-chrome] › Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence (897ms)
  ✓  6 [system-chrome] › Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions (1.9s)
  ✓  7 [system-chrome] › Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence (2.1s)
  ✓  8 [system-chrome] › Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate (2.0s)
  ✓  9 [system-chrome] › Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity (1.7s)

  9 passed (15.7s)
```

## A Repeated Mistake Of Mine <a id="scope-14-repeated-mistake"></a>

The `th`/`td` index error from Scope 12 recurred here. `td:nth-child(N)` counts
the row-header `th`, so every index was off by one and two rows asserted the
wrong columns — one of them still passing on the wrong data before the other
failed and exposed it.

Both rows now read cells row-wise via `Array.from(row.querySelectorAll('td'))`,
which is structurally immune to the mistake rather than merely corrected for it,
with the reason in a comment. Recording the recurrence rather than the fix alone:
a mistake made twice is a property of the approach, not of the day.

## Boundary Amendment <a id="scope-14-boundary-amendment"></a>

`rlportfolio.js` is admitted for the reason recorded in Scopes 11, 12 and 13: the
scope requires the perturbation set, stability threshold, risk aversion and tau
to come from mandatory visible config, and the exact-key validator that must
accept them lives there. This is the **sixth** occurrence of the structural class
first recorded as F-08-CONFIG-BOUNDARY.

## Scope-Local Traceability <a id="scope-14-traceability"></a>

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 1
**Claim Source:** executed

**Output:**

```text
      1 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-mobile.spec.mjs
RESULT: FAILED (1 failures, 0 warnings)
```

Zero failures name a Scope 14 file. An earlier run reported 3, the extra two
being missing evidence references for `tests/portfolio-analytics.unit.mjs`
against this scope — correct, because this report did not exist yet. The single
remaining failure names `tests/portfolio-survival-mobile.spec.mjs`, which belongs
to a later scope.

## Final Scope 14 Baseline <a id="scope-14-baseline"></a>

**Command:** `node scripts/selftest.mjs` and the node and browser suites

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1640 passed, 0 failed
$ node --test tests/portfolio-analytics.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-allocation.functional.mjs
# pass 175
# fail 0
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome
  63 passed (57.8s)
$ git diff --check
(clean)
```
