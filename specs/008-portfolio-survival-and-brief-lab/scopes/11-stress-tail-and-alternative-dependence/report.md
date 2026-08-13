# Scope 11 Execution Report

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md) | [uservalidation.md](../../uservalidation.md)

## Summary

No implementation evidence is recorded during planning. Scope status remains `Not Started`.

## Decision Record

Execution agents record decisions that change the approved implementation path without changing the plan-owned behavioral contract.

## Completion Statement

No completion statement is authorized until every Scope 11 DoD item has current execution evidence.

## Code Diff Evidence

Record G093-compatible changed-path classification and path-scoped git evidence for implementation-bearing work.

## Test Evidence

Each section receives the exact command, exit code, claim source, and raw output from the matching tool-log execution.

### TP-11-01

### TP-11-02

### TP-11-03

### TP-11-04

### TP-11-05

### TP-11-06

## Scenario Contract Evidence

### Scenario SCN-008-022

### Scenario SCN-008-023

### Scenario SCN-008-024

## Coverage Report

## Lint And Quality

## Uncertainty Declarations

## Validation Summary

## Audit Verdict

No validation or audit verdict is recorded during planning.

## Scope 11 Execution <a id="scope-11-execution"></a>

This scope is mostly about what the product **refuses to say**. Correlation
analysis is unusually good at producing confident sentences that the evidence
does not support, and each of the four engine functions below is built around
the specific sentence it must not emit.

**"Correlations rose in the crisis, so contagion."** `compareStressDependence`
takes explicitly NAMED samples and returns `contagionLabel: null`. The unit
fixture makes the reason concrete: quadrupling both series leaves correlation
mathematically identical while variance rises sixteen-fold. A raw correlation
rise measured on a higher-variance window is what heteroskedasticity produces on
its own, so labelling it contagion would be the bias, not the finding.

**"The adjusted number settles it."** `forbesRigobonAdjustment` carries its
anchor series in the result, because adjusting on the other series answers a
different question and the value alone cannot say which was used. Its claim
boundary states BOTH directions: a residual rise is consistent with contagion
but does not prove it, and a vanished rise does not disprove it. When the stress
window shows no variance increase it refuses — there is no heteroskedasticity to
correct, so a number would be manufactured rather than measured.

**"Tail dependence is 0.7."** `lowerTailDependence` reports the joint-event
COUNT beside the estimate and refuses below the configured floor. Three joint
observations produce a number with two decimal places and no information; the
refusal says so in those words.

**"The property is uncorrelated with equities."** `alternativeAssetQuality`
blocks a diversification conclusion for an appraisal-valued or user-entered
series until a de-smoothed sensitivity is run, and states that missing evidence
is not an argument for orthogonality. Appraisal series look smooth because they
are appraised, not because the asset is stable.

### TP-11-01 <a id="tp-11-01"></a>

**Command:** `node --test tests/portfolio-analytics.unit.mjs`

**Exit Code:** 0

**Output:**

```text
$ node --test tests/portfolio-analytics.unit.mjs
# pass 53
# fail 0
```

Five Scope 11 rows. Expectations are derived independently rather than read back
from the engine: with rho 0.8 and variance up threefold, delta is 2, the
denominator is 1 + 2(1 - 0.64) = 1.72, and the adjusted correlation is
0.8/sqrt(1.72). The de-smoothing row computes its first element by hand as
(0.021 - 0.5 x 0.02)/0.5 = 0.022 and additionally asserts that de-smoothed
variance EXCEEDS observed variance, which is the whole point of the sensitivity.

The tail row uses an opposed-series fixture whose joint lower-tail count is
exactly zero, so a permissive implementation that emitted an estimate anyway
would fail rather than pass with a small number.

**Non-vacuity, proven twice.**

Returning the raw correlation instead of the adjusted one:

```text
not ok 50 - TP-11-01 the Forbes-Rigobon adjustment removes the mechanical part of a correlation rise
# pass 52
# fail 1
```

Disabling the thin-tail floor:

```text
not ok 51 - TP-11-01 tail dependence reports its joint event count and refuses a thin tail
# pass 52
# fail 1
```

Both reverted, both back to `# pass 53 # fail 0`.

### TP-11-02 <a id="scenario-scn-008-022"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:68:1 › Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment (1.4s)

  1 passed (4.0s)
```

The row asserts every rendered correlation carries its sample name and
observation count in its own table columns, then scans the whole panel for a
contagion assertion. An engine that correctly held `contagionLabel: null` while
the page printed "contagion detected" beside it would fail here.

### TP-11-03 <a id="scenario-scn-008-023"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-023 finite tail evidence never claims universal correlation one" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:95:1 › Regression: SCN-008-023 finite tail evidence never claims universal correlation one (1.2s)

  1 passed (3.7s)
```

**A one-sided row, corrected.** This was first written as
`if (tailState === 'ok') { … } else { … }`. Under the fixture the configured
floor is never met, so the `ok` branch could never run and half the assertion
was decorative. It now asserts the refusal unconditionally on the rendered page
AND proves the satisfied path through the engine with a 40-observation fixture,
so both halves are actually executed. A branch that never runs is not a test of
the thing it appears to test.

The row also scans the rendered panel for three specific overclaims: "all
correlations go to one", "everything is correlated in a crisis", and
"diversification fails when you need it".

### TP-11-04 <a id="scenario-scn-008-024"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:132:1 › Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation (1.1s)

  1 passed (4.3s)
```

Asserts `requiresSensitivity: true` for an appraisal series, that a single
missing quality field withholds the conclusion, that the refusal note says
missing evidence is not an argument for orthogonality, and that de-smoothing
raises variance while leaving the observed record verbatim.

### TP-11-05 <a id="tp-11-05"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity" --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/portfolio-survival-diversification.spec.mjs:170:1 › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (1.5s)

  1 passed (3.9s)
```

Proves synchronous non-blank pixels, `data-rlchart-mode="structured"` with no
`data-rlchart-error`, keyboard focus and arrow traversal, a rail whose option
count equals the table row count, unique table targets for every cell, a printed
numeric value in every correlation cell so meaning never depends on colour
alone, and no body overflow at 1440x1000, 390x844, or 130% text.

**A real contract failure found here.** The matrix first attached with
`data-rlchart-error="E012-CONTEXT-MISSING"` and no mode. The cause was
`links.ticker` set to a bare symbol; `rlcontext.js` requires a ticker link to be
credential-free HTTPS on `finance.yahoo.com` or empty. The chart contract
rejected an unsafe link rather than rendering it — the guard worked. Fixed by
emitting the proper quote URL.

### TP-11-06 <a id="tp-11-06"></a>

**Command:** `npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Output:**

```text
Running 5 tests using 1 worker

  ✓  1 [system-chrome] › Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment (777ms)
  ✓  2 [system-chrome] › Regression: SCN-008-023 finite tail evidence never claims universal correlation one (681ms)
  ✓  3 [system-chrome] › Regression: SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation (632ms)
  ✓  4 [system-chrome] › Regression: Feature 008 dependence matrix alternatives and tables preserve desktop mobile pixel parity (791ms)
  ✓  5 [system-chrome] › Regression: Feature 008 Diversification refuses rather than showing a simplified matrix (580ms)

  5 passed (5.5s)
```

**Non-vacuity of the copy scans.** Replacing the on-page claim boundary with
"Correlations across the crisis window show that diversification fails when you
need it, as all correlations go to one" turned BOTH scenario rows RED and left
the other three GREEN:

```text
  ✘  1 › Regression: SCN-008-022 raw stress correlation shows volatility context and qualified adjustment (905ms)
  ✘  2 › Regression: SCN-008-023 finite tail evidence never claims universal correlation one (890ms)
  2 failed
  3 passed (8.4s)
```

Reverted, back to 5 passed.

## Boundary Amendment: The Config-Key Owner <a id="scope-11-boundary-amendment"></a>

**Finding F-11-CONFIG-BOUNDARY.** Scope 11 requires a configured lower-tail
quantile — the scope text says "configured quantile" and forbids a hidden
threshold. But `rlportfolio.js` owns the exact-key policy validator, and it is
not in this scope's allowed-files list.

The alternative was to derive the quantile from an already-declared value such
as `minimumTailObservations`. That is precisely the hidden assumption this scope
exists to forbid, so it was rejected. The boundary is amended instead to include
`rlportfolio.js` and the three test files that pin the route list.

**This is the third occurrence of the same structural class** (F-08-CONFIG-BOUNDARY,
F-09-PERSISTENCE-BOUNDARY, and now F-11-CONFIG-BOUNDARY): a runtime scope needs a
new config key or a new persisted noun, and the exact-key validator that must
accept it lives in a file the scope excludes. The recurrence is recorded here
rather than patched silently a third time, because the pattern is now evidence
that the scope-boundary template treats `rlportfolio.js` as pure storage when it
is in fact the config-contract owner.

**A route-list pin caught the change in three places.** Adding `diversification`
to `descriptiveRouteStates` failed pins in `tests/portfolio-foundation.unit.mjs`,
`tests/portfolio-privacy.functional.mjs`, and
`tests/portfolio-survival-foundation.spec.mjs`. All three were updated to the new
truth. None was loosened to a subset match — a pin that stops asserting the exact
route set would no longer catch an accidentally-added route.

## Scope-Local Traceability <a id="scope-11-traceability"></a>

**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope`

**Exit Code:** 1

**Output:**

```text
      2 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-allocation.functional.mjs
      8 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-allocation.spec.mjs
      1 ❌ scenario-manifest.json references missing linked test file: tests/portfolio-survival-mobile.spec.mjs
RESULT: FAILED (11 failures, 0 warnings)
```

The gate for this scope is "zero failure naming this scope's own files"; the
whole-feature `--all-scopes` run is deferred to Scope 16. Creating
`tests/portfolio-survival-diversification.spec.mjs` removed the four failures that
named it, and writing this report removed the three that named a missing evidence
reference for `tests/portfolio-analytics.unit.mjs`. The remaining failures all
name test files for scopes 13-16, which have not been built.

## Final Scope 11 Baseline <a id="scope-11-baseline"></a>

**Command:** `node scripts/selftest.mjs` and the node and browser suites

**Exit Code:** 0

**Output:**

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 1640 passed, 0 failed
$ node --test tests/portfolio-analytics.unit.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-privacy.functional.mjs tests/portfolio-brief.functional.mjs tests/portfolio-publisher-boundary.functional.mjs
# pass 151
# fail 0
$ npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome
  51 passed (1.2m)
$ git diff --check
(clean)
```
