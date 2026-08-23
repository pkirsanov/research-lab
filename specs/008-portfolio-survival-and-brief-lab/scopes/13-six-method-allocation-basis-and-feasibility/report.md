# Scope 13 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 13 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-13-01

### TP-13-02

### TP-13-03

### TP-13-04

### TP-13-05

### TP-13-06

### TP-13-07

## Scenario Contract Evidence

### Scenario SCN-008-026

### Scenario SCN-008-027

### Scenario SCN-008-029

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## Scope 13 Execution <a id="scope-13-execution"></a>

Six methods, one frozen basis, and a refusal to crown any of them.

**One basis.** Every candidate reads the same universe, the same covariance and
the same constraint set, so a difference between rows is attributable to the
METHOD and not to a changed input. That is the only thing that makes the
comparison mean anything.

**Minimum variance solves the full covariance.** Verified by hand on a two-asset
case: det = 0.04·0.09 − 0.01² = 0.0035, Σ⁻¹**1** ∝ [0.08, 0.03], normalised to
0.7273 / 0.2727. Dropping the off-diagonals turns it into inverse-variance
weighting — a genuinely different method that would coincide with the risk-parity
row. When the matrix is not invertible the candidate says so rather than
substituting the diagonal approximation under the same name.

**The forecast-dependent methods refuse.** Black-Litterman needs stated views AND
a stated confidence; mean-variance needs stated expected returns. Neither is
inferred. The mean-variance refusal names the specific temptation: returns are
never estimated from past data here, because a historical mean is a poor forecast
and using one silently would hide that choice inside the result.

**Infeasibility is graded, and nothing is relaxed.** A constraint set whose
minimums sum above one, or whose maximums cannot fill the portfolio, is
UNIVERSALLY infeasible — impossible for any allocation, which is a much stronger
and more useful finding than "this solver failed". A candidate that merely misses
a satisfiable constraint is reported separately. Infeasible candidates keep their
weights and stay in the list, because dropping them would make the comparison
look cleaner than the mandate actually allows.

**Nothing is best.** `recommendedMethod` and `bestMethod` are both null, at both
the comparison and candidate level. Minimum variance will usually post the lowest
modelled volatility, which is exactly the moment a surface is tempted to crown
it, and exactly what the copy scan forbids.

### TP-13-01 <a id="tp-13-01"></a>

**Command:** `node --test tests/portfolio-analytics.unit.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 63
# fail 0
```

**A real bug found and removed.** The first draft called a non-existent
`solveLinearSystem` inside a `try/catch`. The catch swallowed the ReferenceError
and the surface reported `covariance-not-invertible` — a plausible DOMAIN refusal
standing in for a programming error, on a matrix that was perfectly invertible.
The real function is `solveSymmetric`. The catch is gone: a missing function
should crash the test suite, not be laundered into a believable excuse.

**Non-vacuity, proven twice.**

Suppressing the universal-impossibility check:

```text
not ok 62 - TP-13-01 conflicting constraints are infeasible and are never silently relaxed
# pass 62
# fail 1
```

Substituting inverse-variance for the full covariance solve:

```text
not ok 60 - TP-13-01 minimum variance solves the full covariance, verified by hand
# pass 62
# fail 1
```

Both reverted, both back to `# pass 63 # fail 0`.

### TP-13-02 <a id="tp-13-02"></a>

**Command:** `node --test tests/portfolio-allocation.functional.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-allocation.functional.mjs
# pass 2
# fail 0
```

Proves the six production candidates share one frozen basis and keep their own
states: a method that could not RUN is distinguishable from one that ran and
produced an infeasible answer. Collapsing those into a single pass/fail would
lose the difference between "I have no view to work from" and "your mandate
forbids this".

### TP-13-03 <a id="scenario-scn-008-026"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-026 all six allocation methods share one frozen basis" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:68:1 › Regression: SCN-008-026 all six allocation methods share one frozen basis (1.2s)

  1 passed (7.5s)
```

Asserts all six methods appear in order, that each carries its own assumptions
line, and that the two forecast-dependent methods render their refusal reason
rather than being omitted. A method absent from the table looks like a method
that was never considered.

### TP-13-04 <a id="scenario-scn-008-027"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:96:1 › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (843ms)

  1 passed (7.5s)
```

Scans the rendered panel for "best allocation", "recommended method", "optimal
choice" and "you should switch", and additionally asserts no `data-best`,
`data-recommended` or `.winner` node exists — a winner marked only in the DOM
would still drive styling.

**Non-vacuity.** Replacing the claim boundary with "The best allocation is
minimum variance — it is the optimal choice and you should switch to it." turned
this row RED and left the other four GREEN:

```text
  ✘  2 › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (1.4s)
  1 failed
  4 passed (13.6s)
```

Reverted.

### TP-13-05 <a id="scenario-scn-008-029"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:117:1 › Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation (1.1s)

  1 passed (7.5s)
```

Asserts the explanation says nothing was relaxed and the current portfolio is
unchanged, and that EVERY rendered candidate carries an explicit feasibility
verdict from the closed set. A blank verdict would leave a reader unable to tell
checked from unchecked.

### TP-13-06 <a id="tp-13-06"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:148:1 › Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states (1.2s)

  1 passed (7.5s)
```

The canvas was added because this row's declared title promises pixels and the
route had none. Bars carry their method label AND their numeric volatility, and
an infeasible bar is hatched AND captioned "· infeasible". Marking infeasibility
by colour alone would hide it from a reader who cannot distinguish the hues, on
exactly the rows where the mandate is being breached.

### TP-13-07 <a id="tp-13-07"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 5 tests using 1 worker

  ✓  1 [system-chrome] › Regression: SCN-008-026 all six allocation methods share one frozen basis (1.2s)
  ✓  2 [system-chrome] › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (843ms)
  ✓  3 [system-chrome] › Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation (1.1s)
  ✓  4 [system-chrome] › Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states (1.2s)
  ✓  5 [system-chrome] › Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence (813ms)

  5 passed (7.5s)
```

### TP-13-08 <a id="tp-13-08"></a>

**Command:** `node --test tests/portfolio-allocation.functional.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-allocation.functional.mjs
# pass 2
# fail 0
```

Discharges Scope 03's second deferred clear conjunct. Scope 13 is the first scope
that persists an allocation, so this is the first point at which the emptiness
claim could be made non-vacuously. The row writes through the REAL builder,
rereads through a NEW store over the same backing keys (rereading the in-memory
object would prove nothing about persistence), asserts the behavior-only clear
PRESERVES it — a saved allocation is something the user kept, not a behavioural
inference — and that the full-personal clear empties it on a fresh reread.

**Non-vacuity.** Making the builder store nothing turned this row RED, so the
"cleared" assertion is not passing over an empty-by-construction container:

```text
not ok 2 - TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear
# pass 1
# fail 1
```

## Findings Recorded <a id="scope-13-findings"></a>

**1. A parity contradiction in this scope's own artifact.** The Test Plan
declares 8 rows while the DoD header said "Exact Parity With 7 Test Plan Rows"
and listed 7 items, leaving TP-13-08 with no evidence item and the Build Quality
Gate's parity requirement unsatisfiable as written. Header corrected to 8 and the
missing item added. This is the same class as the Scope 09 contradiction.

**2. Test titles had drifted from the plan.** Four rows were authored with
descriptive titles of my own before the plan's exact persistent titles were
checked. The plan is authority, so the TESTS were renamed — not the plan.

**3. A caught programming error laundered as a domain refusal.** See TP-13-01.

**4. Two wiring defects in the route.** `probe.weights` is a symbol-keyed map,
not a positional array, so passing it directly made the comparison refuse with
`current-weights-required`. And the refusal rendered a bare "unavailable" with no
reason — which is both worse for a reader and what made the first defect hard to
see. Both fixed; the refusal now names its reason.

**5. Four pins caught the new privacy category.** Each was updated to the new
truth rather than loosened. The populatable-section sweep in particular refused
to accept a category with no write path, which is precisely its job, and was
satisfied by seeding through the real builder.

## Boundary Amendment <a id="scope-13-boundary-amendment"></a>

`rlportfolio.js` is admitted for the same reason recorded in Scopes 11 and 12:
it owns the workspace-section contract and the exact-key validator that the new
`allocations` section must pass. The three test files carrying route-list and
privacy-category pins are admitted for the same reason. This is the **fifth**
occurrence of the structural class first recorded as F-08-CONFIG-BOUNDARY.

## Scope-Local Traceability <a id="scope-13-traceability"></a>

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 1
**Claim Source:** executed

**Output:**

```text
      1 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-mobile.spec.mjs
RESULT: FAILED (1 failure, 0 warnings)
```

Zero failures name a Scope 13 file. An earlier run reported 11; creating
`tests/portfolio-survival-allocation.spec.mjs` and
`tests/portfolio-allocation.functional.mjs` cleared 6, and writing this report
cleared the remaining 4 that named a missing evidence reference. The single
remaining failure names `tests/portfolio-survival-mobile.spec.mjs`, which belongs
to a later scope.

## Final Scope 13 Baseline <a id="scope-13-baseline"></a>

**Command:** `node scripts/selftest.mjs` and the node and browser suites

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1640 passed, 0 failed
$ node --test tests/portfolio-analytics.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs tests/portfolio-allocation.functional.mjs
# pass 163
# fail 0
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome
  59 passed (50.1s)
$ git diff --check
(clean)
```

<!-- bubbles:certifying-window-begin -->

## Current Certifying Window

The prior execution record is preserved above. Current status is governed by the canonical transition checks.
