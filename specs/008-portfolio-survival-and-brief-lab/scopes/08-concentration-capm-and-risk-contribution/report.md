# Scope 08 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 08 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-08-01

### TP-08-02

### TP-08-03

### TP-08-04

### TP-08-05

### TP-08-06

## Scenario Contract Evidence

### Scenario SCN-008-015

### Scenario SCN-008-016

### Scenario SCN-008-017

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## TP-08-01 — Analytics Unit — 2026-08-13 (PARTIAL SCOPE DELIVERY)

**Status: PARTIAL. TP-08-01 is delivered and green. TP-08-02 through TP-08-06 are NOT delivered.**
The scope stays `Not Started` and is deliberately not promoted: five of its six Test Plan rows and the
entire concentration / CAPM / contribution UI are unbuilt. The lab page is untouched by this pass, so
Risk X-Ray displays no Scope 08 figure — the analytics are proven in isolation before any surface
claims to show them.

**Command:** `node --test tests/portfolio-analytics.unit.mjs`
**Exit Code:** 0
**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# tests 25
# pass 25
# fail 0
```

### What was built

Four functions added to `rlportfolioanalytics.js`, each reading its constants from the existing
`analytics` block of `portfolio-survival-allocation.config.json` rather than introducing new
hard-coded numbers (`minimumCapmObservations` 126, `covarianceShrinkageLambda` 0.2,
`riskReconciliationTolerance` 1e-8):

- `computeConcentration(holdings, lens)` — per-lens weight aggregation over any exposure field.
- `fitCapm(portfolio, benchmark, opts)` — OLS beta, alpha, R-squared, correlation, residual risk, and
  beta standard error, each reported separately.
- `computeCovariance(returnsBySymbol, opts)` — raw sample covariance and a separately-returned
  fixed-lambda diagonally shrunk matrix, with Cholesky positive-definiteness on both.
- `riskContributions(symbols, weights, covariance, opts)` — marginal and total contributions with an
  Euler reconciliation check against the configured tolerance.

### The three refusals that carry the scope

**Missing exposure is named, never bucketed.** A holding whose lens field is absent is listed in
`missing` and excluded from `coveredWeight`. It is not folded into `Other`, not given zero, and not
given the average — each of which turns incomplete data into a complete-looking distribution, which is
worse than a visible gap because the reader cannot tell anything is missing. Bucket weights therefore
sum to `coveredWeight`, not to 1.

**A low-fit beta is not a precise one.** `fitState` reports `low-explanatory-power` separately from
`beta`. The adversarial row builds a portfolio that is volatile *and* nearly uncorrelated with its
benchmark, so beta is small while residual risk is large — the exact case where reading beta as total
risk misleads. A degenerate benchmark that never moved refuses with `benchmark-degenerate` rather than
dividing by zero variance and manufacturing an infinite beta.

**Lambda is never auto-raised.** A singular sample is reported as not positive-definite. Silently
increasing shrinkage until the matrix inverts would present a conditioned answer as the observed one
and hide the degeneracy the diagnostics exist to surface. `lambdaWasAutoRaised` is asserted false and
the configured lambda is asserted to be honoured exactly.

**A hedge shows a negative contribution.** Negative risk contributions are reported, not clamped:
flooring them at zero would erase the single most useful thing the decomposition can show. The
decomposition still reconciles to total risk with a negative part present.

### A defect this suite caught

The Cholesky pivot test originally compared against exact zero. Two perfectly collinear series
produce a final pivot of `4v - 4v`, which in floating point lands a hair above zero rather than on it,
so a genuinely singular matrix was reported positive-definite — handing a caller an inverse built on
noise. Fixed with a pivot tolerance relative to the matrix scale. As with the Scope 07 recovery
tolerance, a boundary row proves the new tolerance is noise-only: an ill-conditioned but genuinely
valid matrix, six orders of magnitude above the tolerance, is still accepted.

### Non-vacuity (RED / GREEN, same command)

Folding missing exposure into an `Other` bucket:

```text
=== RED: missing exposure folded into Other ===
not ok 16 - TP-08-01 concentration reports missing exposure rather than bucketing it
# pass 24
# fail 1

=== GREEN restored ===
# pass 25
# fail 0
```

### Repo baseline after the change

```text
$ node scripts/selftest.mjs
1640 passed, 0 failed
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  4 passed (7.3s)
```

Scope 07 remains complete and its browser rows still pass, which is the rollback condition this
scope's Change Boundary requires.

### Not delivered in this pass

- **TP-08-02** SCN-008-015 concentration lenses in the browser.
- **TP-08-03** SCN-008-016 CAPM and factor records.
- **TP-08-04** SCN-008-017 contribution chart, table, and covariance detail.
- **TP-08-05** canvas and accessibility parity for the new diagnostics.
- **TP-08-06** cumulative browser suite.
- Versioned proxy-factor definitions and exact-date factor OLS (implementation-plan item 3) are NOT
  built. `fitCapm` covers the single-benchmark case only.
- Eigenvalue and explicit condition-number diagnostics are NOT built; positive-definiteness is
  reported via Cholesky alone.
- No Simple or Power UI record, lens synchronisation, chart, or table exists for Scope 08.

## Scope 08 UI — 2026-08-13 (STILL PARTIAL; supersedes the TP-08-01 record above only on scope)

**Status: PARTIAL. TP-08-01, TP-08-02, TP-08-04 and TP-08-06 are green. TP-08-03 is delivered on its
REFUSAL path only. TP-08-05 is NOT delivered.** The scope stays `Not Started`.

**Command:** `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output:**

```text
Running 7 tests using 1 worker
  ✓  1 Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate (1.3s)
  ✓  2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (1.4s)
  ✓  3 Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom (1.5s)
  ✓  4 Regression: SCN-008-015 concentration lenses name missing exposure instead of bucketing it (1.5s)
  ✓  5 Regression: SCN-008-016 benchmark fit is unavailable rather than regressed against a guess (1.5s)
  ✓  6 Regression: SCN-008-017 risk contributions reconcile and declare their covariance basis (1.6s)
  ✓  7 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio (1.7s)
  7 passed (13.6s)
```

Cumulative Feature 008 browser regression: `32 passed (59.0s)`. Analytics unit: `26 pass, 0 fail`.
Repo selftest: `1640 passed, 0 failed`.

## F-08-CONFIG-BOUNDARY — routed plan conflict (BLOCKING for TP-08-03 and part of TP-08-05)

**The scope requires new mandatory config while excluding the only file that can accept it.**

The Requirement Coverage section demands "explicit mandatory config ownership of samples, factors,
shrinkage, tolerance, and exposure thresholds". Three of those already exist in the `analytics` block
of `portfolio-survival-allocation.config.json` — `minimumRiskObservations` / `minimumCapmObservations`
(samples), `covarianceShrinkageLambda` (shrinkage), `riskReconciliationTolerance` (tolerance). Two do
not: a **benchmark symbol** and a **concentration alert threshold**. Factor definitions likewise have
no config home.

`rlportfolio.js` validates the analytics block against an **exact key list**
(`analytics: Object.freeze(["contractVersion", "covarianceSensitivity", …])`), and Scope 08's Change
Boundary lists `rlportfolio.js` under **Explicitly excluded**. Adding a policy key without extending
that list makes the whole policy invalid, which the page correctly treats as fail-loud.

This was verified by execution rather than inferred. Adding `benchmarkSymbol`, `riskFreeAnnual`,
`concentrationLenses` and `concentrationAlertWeight` to the analytics block took the import surface to
zero accepted rows and failed all four then-existing browser rows:

```text
Error: expect(locator).toHaveText(expected) failed
Locator:  locator('#previewAccepted')
Expected: "3"
Received: "0"
  4 failed
```

The config change was reverted; the page recovered to `4 passed`.

**Decision taken, and why.** The lens LIST is not a policy value — `symbol`, `assetClass`, `sector`
and `currency` are exposure fields of the holding contract itself — so concentration is driven from
the schema and needs no new config. That is why TP-08-02 could ship in full. The **benchmark symbol**
and the **alert threshold** are genuinely policy, so rather than hard-coding a benchmark in the page
and calling it configuration, the CAPM surface renders an honest `benchmark-unavailable` state and
shows no fitted figure at all. A page that picked SPY for itself would be presenting an unreviewed
editorial choice as though the policy had made it.

**Route:** the owning planner must either extend the analytics key list in `rlportfolio.js` (which
requires widening Scope 08's Change Boundary) or move the benchmark and threshold into a config
surface this scope may already touch. Until that decision lands, TP-08-03's fitted path and the
concentration alert threshold cannot be delivered without violating either the boundary or the
no-hard-coded-policy rule.

### What shipped

- **Concentration** — one section per lens, each with its own `data-coverage` state and a coverage
  line. Bucket weights sum to `coveredWeight`, not to 100%, and holdings with no value for a lens are
  **named**. The browser row asserts no bucket is ever labelled `Other`, `Unknown`, or `N/A`.
- **Benchmark fit** — honest refusal path with every fitted element absent from the DOM, asserted
  element by element.
- **Risk contribution** — per-holding table with weight, marginal, contribution and share as separate
  cells, the covariance basis and lambda stated on the surface (`conditioned`, `lambda auto-raised:
  false`), and the Euler reconciliation residual shown against its configured tolerance. The browser
  row parses the rendered sum and portfolio risk back out of the copy and re-checks the residual
  itself rather than trusting the rendered verdict.

### Non-vacuity (RED / GREEN, same command)

Bucketing missing exposure into `Other`:

```text
=== RED: missing exposure bucketed as Other ===
  ✘  4 Regression: SCN-008-015 concentration lenses name missing exposure instead of bucketing it (6.3s)
  1 failed
  6 passed (20.7s)
```

Restored: `7 passed (13.6s)`. The same break also turns the unit suite from 26/0 to 25/1.

### Still not delivered

- **TP-08-03 fitted path** — beta near 0.6 with low explanatory power against an explicit benchmark.
  Blocked by F-08-CONFIG-BOUNDARY. `fitCapm` itself is unit-tested for exactly this case, including
  the adversarial low-fit/high-residual row; only the *page* path is blocked.
- **TP-08-05** — no new canvas was added for the Scope 08 diagnostics, so there is no synchronous
  pixel, keyboard-traversal, or canvas/table parity evidence for concentration or contribution. The
  Scope 07 canvas is unaffected and still passes its own row.
- Versioned proxy-factor definitions and exact-date factor OLS (implementation-plan item 3).
- Eigenvalue and explicit condition-number diagnostics; positive-definiteness is Cholesky only.
- Look-through concentration and issuer/geography lenses — the holding contract carries no such field,
  so these need a contract change outside this scope.
- Simple/Power mode split for the diagnostics. The page has no `#modeSeg` control at all, so this is a
  page-wide gap rather than a Scope 08 omission.
