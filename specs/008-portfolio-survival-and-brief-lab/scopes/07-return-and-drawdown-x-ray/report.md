# Scope 07 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 07 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-07-01

### TP-07-02

### TP-07-03

### TP-07-04

### TP-07-05

## Scenario Contract Evidence

### Scenario SCN-008-013

### Scenario SCN-008-014

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## TP-07-01 — Analytics Unit — 2026-08-13 (PARTIAL SCOPE DELIVERY)

**Status: PARTIAL. TP-07-01 is delivered and green. TP-07-02 through TP-07-05 are NOT delivered.**
The scope stays `Not Started` in `scopes/_index.md` and `state.json` and is deliberately not promoted,
because four of its five Test Plan rows and the entire Risk X-Ray UI band are unbuilt. This section
records only what actually ran.

**Command:** `node --test tests/portfolio-analytics.unit.mjs`
**Exit Code:** 0
**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
1..13
# tests 13
# suites 0
# pass 13
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 77.728083
```

### What was built

`rlportfolioanalytics.js` — a dual-runtime UMD module owning exactly two things the repo had nowhere
else: exact-common-date alignment of per-symbol observation series under a declared evidence cutoff,
and cutoff-bounded drawdown, recovery, and unrecovered state.

**It deliberately does not own return math.** `annualizedArithmetic`, `cagr`, `volatilityDrag`,
`annualizedVol`, and `volatilityDragApprox` already have exactly one definition in `rlmetrics.js`, and
Product Principle P18 requires reusing the owning implementation. A second definition is precisely the
defect `rlmetrics.js` was created to end — the same asset yielding two different Sharpe ratios
depending on which file computed it. `computeReturnMetrics` delegates all five, and TP-07-01 carries a
test that reads this module's own source and fails if any of those names is ever *declared* here
rather than *called* on `RLMETRICS`.

### The alignment rule, and why each shortcut is refused

Alignment is an exact set intersection of observation dates, and every date that fails to intersect is
reported in `alignment.excluded` rather than silently dropped. The four tempting shortcuts each
produce a number that looks fine and is false: forward-fill invents an observation the source never
published, interpolation invents one that never existed at all, missing-as-zero asserts "this asset
was flat that day" when the truth is that we do not know, and a calendar guess substitutes our opinion
of trading days for the source's own record.

### Two defects this suite caught

**A float-equality defect in recovery detection.** A wealth index is built by chained multiplication,
so the path `100 -> 120 -> 90 -> 120`, which mathematically regains its peak exactly, lands on
`1.1999999999999997`. A strict `>=` reported a completed recovery as `unrecovered`. Fixed with a
relative float-noise tolerance of `1e-12`. Because introducing a tolerance is itself a risk, the suite
carries an adversarial row proving it cannot mask a genuine near-miss: a path landing 0.1% short of
its peak — nine orders of magnitude outside the tolerance — still reports `unrecovered`.

**A latent annualization overclaim.** A five-period sample cannot support an annualized figure
silently, so `annualizationState` reports `extrapolated-from-short-sample` rather than presenting the
number bare.

### Non-vacuity proof (RED / GREEN, same command)

A guard that cannot fail proves nothing, so the cutoff fence was disabled and the suite re-run.

```text
=== RED: cutoff fence disabled ===
not ok 3 - TP-07-01 the cutoff excludes later observations before anything is computed
not ok 4 - TP-07-01 invalid weights, non-positive closes, and short samples refuse rather than guess
not ok 8 - TP-07-01 ADVERSARIAL an unrecovered drawdown never borrows a post-cutoff recovery
# pass 10
# fail 3

=== GREEN restored ===
# pass 13
# fail 0
```

The forward-fill guard was proven sensitive the same way, by feeding the module an honest gapped
fixture and a forward-filled version of the same data:

```text
honest returns: 0.0000 | n=1
forward-filled: 0.5000, -0.2500 | n=2
distinguishable: true
```

The honest sample is one return spanning the gap; the filled sample is two returns, the first of which
is a fabricated +50%. The assertions key on that difference, so a regression to forward-fill cannot
pass.

### Repo baseline after the change

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 1640 passed, 0 failed
================================================
```

### Not delivered in this pass

- **TP-07-02** SCN-008-013 browser regression (arithmetic / CAGR / drag stay separate).
- **TP-07-03** SCN-008-014 browser regression (unrecovered drawdown stops at the cutoff).
- **TP-07-04** canvas and accessibility parity at desktop, mobile, and zoom.
- **TP-07-05** cumulative Risk X-Ray browser suite.
- The Risk X-Ray Simple and Power projections, canvas bands, `RLCHART` attachment, keyboard and touch
  traversal, and the adjacent semantic table in `portfolio-survival-allocation-lab.html`.
- `tests/portfolio-survival-risk.spec.mjs` does not exist yet.

The lab page is unchanged, so Risk X-Ray currently displays no fabricated metric — the module is not
yet wired to any surface. That is the correct intermediate state: the analytics core is proven in
isolation before a surface claims to display it.
