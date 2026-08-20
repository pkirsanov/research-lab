# Scope 12 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 12 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-12-01

### TP-12-02

### TP-12-03

### TP-12-04

### TP-12-05

## Scenario Contract Evidence

### Scenario SCN-008-025

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## Scope 12 Execution <a id="scope-12-execution"></a>

Hedging is where a research tool most easily slides into advice. Two modelling
decisions keep this one on the research side of that line.

**Costs stay separate.** Carry, direct cost and turnover are three fields and
three table columns. A single "net benefit" number is worse than useless here:
a large carry cost and a large risk reduction produce the same net figure as a
small one of each, and the reader cannot tell which happened. What is offered
instead of a verdict is `costPerVolatilityPoint` — cost per unit of volatility
removed — so the trade-off is weighed by the person whose money it is.

**Basis risk is modelled, not assumed away.** Residual variance is
`1 - 2·ratio·rho + ratio²`. With a perfect proxy this collapses to `(1 - ratio)`
and a full hedge leaves nothing. With rho below one, a FULL hedge still leaves
`sigma·sqrt(1 - 2rho + 1)` of residual volatility. The naive alternative — treat
"fully hedged" as riskless — is precisely what the second controlled break
restored, and it failed.

**A missing cost is never zero.** An absent carry or spread returns
`state: "gross-only"` with `netBenefit: null` and a note saying zero is a claim
about the world this comparison has no evidence for. Zero-filling would produce
a confident, cheap-looking hedge out of missing data.

**Nothing is prescribed.** `prescribedRatio` is null, `executable` is false, no
contract is selected, and the portfolio is never modified.

### TP-12-01 <a id="tp-12-01"></a>

**Command:** `node --test tests/portfolio-analytics.unit.mjs`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 58
# fail 0
```

Five Scope 12 rows with independently calculated expectations: carry
100000 × 0.01 × 1 = 1000; round-trip 0.001 + 0.0005 + 0.0005 = 0.002 so direct
cost = 200; four rebalances so turnover = 100000 × 0.002 × 4 = 800; total 2000.
The imperfect-proxy row computes residual volatility as 0.20 × sqrt(0.2) by hand
and asserts it EXCEEDS the perfect-proxy case.

The validation row asserts that an out-of-range ratio refuses rather than being
clamped: clamping 1.5 to 1 would silently answer a question the user did not ask.

**Non-vacuity, proven twice.**

Zero-filling missing cost components:

```text
not ok 56 - TP-12-01 a missing cost component blocks net benefit and is never treated as zero
# pass 57
# fail 1
```

Ignoring basis correlation, i.e. residual variance `(1 - ratio)²`:

```text
not ok 55 - TP-12-01 an imperfect proxy leaves basis risk even at a full hedge ratio
# pass 57
# fail 1
```

Both reverted, both back to `# pass 58 # fail 0`.

### TP-12-02 <a id="scenario-scn-008-025"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:257:1 › Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate (2.3s)

  1 passed (5.7s)
```

Asserts the exact seven column headers, so a future change that merged carry and
direct into one "cost" column would fail rather than pass quietly. Asserts the
unhedged baseline costs zero and reduces zero, that a full hedge costs more and
leaves less residual volatility, and that the full-hedge row still reports basis
risk remaining. Then scans the rendered surface for "recommended ratio",
"optimal for you", and "place the order".

**Non-vacuity.** Replacing the on-page claim boundary with "The recommended hedge
ratio is 50%, which is optimal for you. Place the order with your broker to
implement it." turned this row RED and left the other seven GREEN:

```text
  ✘  6 › Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate (1.6s)
  1 failed
  7 passed (23.9s)
```

Reverted, back to GREEN.

### TP-12-03 <a id="tp-12-03"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:306:1 › Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero (2.2s)

  1 passed (6.2s)
```

Leaves the carry field empty and asserts every variant row carries
`data-variant-state="gross-only"`, that no total-cost cell shows a currency
figure, and that the refusal names `annualCarryFraction` and says zero is a claim
about the world.

### TP-12-04 <a id="tp-12-04"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom" --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:331:1 › Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom (2.4s)

  1 passed (5.1s)
```

Proves unique link targets for every hedge row, that the dependence matrix stays
painted above 200 coloured pixels with the hedge table below it at both
geometries, that row count is stable, and that there is no body overflow at
1440x1000, 390x844, or 130% text.

**A test-authoring error found and fixed.** The first version indexed the table
cells as if the variant label were a `td`. It is a `th`, so every `td` index was
off by one and the row asserted the wrong columns. Corrected with the offset
noted in a comment, because the same mistake is easy to repeat.

### TP-12-05 <a id="tp-12-05"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
Running 8 tests using 1 worker

  ✓  1 [system-chrome] › Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment
  ✓  2 [system-chrome] › Regression: SCN-008-023 finite tail evidence never claims universal correlation one
  ✓  3 [system-chrome] › Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation (958ms)
  ✓  4 [system-chrome] › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (1.7s)
  ✓  5 [system-chrome] › Regression: Feature 008 Diversification refuses rather than showing a simplified matrix (887ms)
  ✓  6 [system-chrome] › Regression: SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate (1.5s)
  ✓  7 [system-chrome] › Regression: SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero (1.3s)
  ✓  8 [system-chrome] › Regression: Feature 008 hedge variants stay equivalent and legible at desktop mobile and zoom (1.5s)

  8 passed (13.8s)
```

## Boundary Amendment <a id="scope-12-boundary-amendment"></a>

The hedge cost assumptions the user does not type — commission, spread,
slippage, rebalance frequency, proxy basis correlation, instrument class,
liquidity — are declared in the visible config rather than defaulted in code,
which is what the scope requires. Their exact-key validator lives in
`rlportfolio.js`, so that file is admitted to this scope's boundary for the same
reason recorded in Scope 11's F-11-CONFIG-BOUNDARY. This is the **fourth**
occurrence of that structural class.

## Scope-Local Traceability <a id="scope-12-traceability"></a>

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 1
**Claim Source:** executed

**Output:**

```text
      2 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-allocation.functional.mjs
      8 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-allocation.spec.mjs
      1 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-mobile.spec.mjs
RESULT: FAILED (11 failures, 0 warnings)
```

Zero failures name a Scope 12 file. An earlier run reported 12, the extra one
being a missing evidence reference for `tests/portfolio-analytics.unit.mjs`
against this scope — correct, because this report did not exist yet. The
remaining failures all name test files for scopes 13-16.

## Final Scope 12 Baseline <a id="scope-12-baseline"></a>

**Command:** `node scripts/selftest.mjs` and the node and browser suites

**Exit Code:** 0
**Claim Source:** executed

**Output:**

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1640 passed, 0 failed
$ node --test tests/portfolio-analytics.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
# pass 156
# fail 0
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome
  54 passed (1.2m)
$ git diff --check
(clean)
```
