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
**Claim Source:** executed
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
**Claim Source:** executed
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

## Scope 07 Delivered — 2026-08-13 (supersedes the PARTIAL record above)

The partial record above stands as history. Scope 07 is now **Done**: all five Test Plan rows are
green, the Risk X-Ray surface is wired, and status is `Done` in `scope.md`, `scopes/_index.md`, and
both `state.json` progress mirrors.

### TP-07-02 through TP-07-05 — browser rows

**Command:** `npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Running 4 tests using 1 worker
  ✓  1 Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate (1.1s)
  ✓  2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (816ms)
  ✓  3 Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom (1.1s)
  ✓  4 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio (924ms)
  4 passed (6.5s)
```

Cumulative Feature 008 browser regression after the focused rows:

```text
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  29 passed (43.2s)
```

### What the browser rows verify independently

Expected values are calculated in the spec file from the fixture, not read back from the module. That
caught a genuine error in my own arithmetic: the fixture's two MSFT lots merge by **summing derived
values** (10 at 450.25 plus 2 at 451.00), not by repricing 12 units at one lot's price. The page was
right and the first hand-calculation was wrong.

### The evidence cutoff is the portfolio's boundary, not the newest bar

`riskCutoff` takes the **minimum of the per-symbol latest observations** — the last date on which
every constituent still has evidence. Taking the maximum would let one fresher series push the
boundary past the others, and a recovery measured there would rest on a portfolio that was never
fully observed on that date. TP-07-03 exercises exactly this: MSFT recovers to 240 on `2026-05-11`
while BND's evidence stops on `2026-05-08`, and the page reports `Unrecovered as of cutoff
2026-05-08` rather than borrowing the later, half-observed recovery.

### Three real defects found and fixed during wiring

**The accessible point rail was destroyed on every re-render.** `RLCHART.ensurePointRail` reuses any
rail it finds by id. Attaching while the route panel was still detached made it adopt the *previous*
render's rail, which `replaceChildren` then discarded — so keyboard traversal silently disappeared
after the first route change. Draw and attach are now deferred until the panel is connected.

**A pre-existing mobile overflow on every route view.** At 390px the document scrolled 142px
horizontally. Isolation by element removal showed it was **not** Risk X-Ray content: the brief route
measured 0 while `path-lab` and `allocation` — neither of which has any Scope 07 content — both
measured 142. The cause was a `<p class="subtle">` carrying an unbreakable 64-character sha256
identity; `.identity` already wrapped, `.subtle` and `.microcopy` did not. Fixed at the shared class,
which takes all three route views to 0.

**A wrong first fix, recorded because it was wrong.** The table was blamed first and given
`overflow-x: auto`. Re-measuring showed the overflow unchanged at 142, which is what forced the
element-removal isolation that found the real cause. The table containment is kept because three
numeric columns genuinely do not fit a phone, but it was not the overflow fix.

### Non-vacuity (RED / GREEN, same command)

Inverting the cutoff derivation from minimum to maximum:

```text
=== RED: cutoff takes max instead of min ===
  ✓  1 Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate (1.0s)
  ✘  2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (5.8s)
  ✓  3 Regression: Feature 008 return and drawdown canvas tables remain equivalent...
  ✓  4 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
  1 failed  3 passed
```

Restored: `4 passed (6.5s)`.

### Live-stack authenticity

```text
$ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/portfolio-survival-risk.spec.mjs
exit=1 (no matches)
```

Every row drives the real page, the real `RLDATA` cache, the real analytics module, and a real
Chrome. Bars are seeded through `RLDATA.putBars`, the same public surface production reads — there is
no test-only entry point on the page.

### Scope-local traceability

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
ℹ️  Scenarios checked: 17
ℹ️  Test rows checked: 60
ℹ️  DoD fidelity scenarios: 17 (mapped: 17, unmapped: 0)
RESULT: FAILED (19 failures, 0 warnings)

$ ... | grep '❌' | sort -u
❌ scenario-manifest.json references missing linked test file: tests/portfolio-allocation.functional.mjs
❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-allocation.spec.mjs
❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-diversification.spec.mjs
❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-mobile.spec.mjs
❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-paths.spec.mjs

$ ... | grep '❌' | grep -cE 'risk|analytics|07'
0
```

All 19 failures name test files owned by **unbuilt** scopes 08 through 16. **Zero** name a Scope 07
file, which is the DoD criterion exactly as written. The guard was run while scope 07 was the active
scope in `state.json`, as the DoD requires; the resolver refuses `--current-scope` against a scope
already marked done, so the run precedes the status flip rather than following it.

### Not claimed

The whole-feature `--all-scopes` traceability run is **not** clean and is **not** claimed here. The
Feature Completion Gate enforces it once, in Scope 16, and it cannot pass until scopes 08 through 16
ship their test files. Scopes 08 through 16 remain `Not Started`.

<!-- bubbles:certifying-window-begin -->

## Current Certifying Window

The prior execution record is preserved above. Current status is governed by the canonical transition checks.
