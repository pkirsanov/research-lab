# Scope 21 Report: Partial Risk Input And Diagnostics

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 21 now emits `AssetMetricEligibility/v1` for every holding and metric family and composes one
`RiskDiagnosticSet/v1` without erasing valid results when another holding or metric is unavailable. Listed
weight-only, listed value, cash, dated manual, undated manual, and unsupported inputs retain independent
states. Daily covariance remains separate from compatible-frequency manual evidence, and no eligible sleeve is
silently reweighted.

## Decision Record

Input eligibility and diagnostics remain one vertical Risk X-Ray slice. CAGR uses exact elapsed calendar days.
Raw and explicitly conditioned covariance carry separate diagnostics and fingerprints. Asset, factor, and
return contributions reconcile independently and are never added together. Dated manual evidence computes in a
separate `CompatibleFrequencyRiskResult/v1`; it never enters the daily covariance matrix.

## Completion Statement

Implementation and the declared test matrix are complete. Scope status remains `In Progress` until planning
and certification owners reconcile the eight evidence-backed DoD rows after artifact and focused traceability
validation.

## Code Diff Evidence

**Claim Source:** executed

```text
$ git diff --numstat -- <Scope 21 existing files>
200     15      portfolio-survival-allocation-lab.html
647     59      rlportfolioanalytics.js
233     12      tests/portfolio-analytics.unit.mjs
75      12      tests/portfolio-survival-risk.spec.mjs
$ wc -l tests/portfolio-risk.functional.mjs
108 tests/portfolio-risk.functional.mjs
$ git diff --check -- <Scope 21 files>
(no output; exit 0)
```

## Test Evidence

**Claim Source:** executed

The five declared commands were recorded in `.specify/runtime/tool-calls.jsonl` with spec
`008-portfolio-survival-and-brief-lab`, scope `21-partial-risk-input-and-diagnostics`, exact argv, exit code,
duration, and output hashes.

### TP-21-01

```text
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
TAP version 13
ok - TP-21-01 SCN-008-047 emits complete per-metric eligibility and diagnostic contracts
ok - Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray
1..81
# tests 81
# suites 0
# pass 81
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### TP-21-02

```text
$ node --test tests/portfolio-risk.functional.mjs
exit: 0
TAP version 13
ok 1 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
ok 2 - SCN-008-047 failed candidate preserves the last valid structured result
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### TP-21-03

The exact persistent row passed. The complete carrier below provides the live-system evidence depth and proves
all earlier Risk X-Ray journeys remain green.

```text
# Feature 008 Scope 21 complete risk browser carrier
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 18
sha256: ef0dc7e8715d0937a90704eb52a1479102487cf1cf51a5647cb521ed1da75510
Running 13 tests using 1 worker
	PASS 1 SCN-008-013 arithmetic CAGR and conditional drag stay separate
	PASS 2 SCN-008-014 unrecovered drawdown stops at the evidence cutoff
	PASS 3 return and drawdown canvas tables remain equivalent
	PASS 4 SCN-008-015 concentration lenses expose overlap and missing look through
	PASS 5 SCN-008-016 beta alpha R squared and residual risk stay separate
	PASS 6 SCN-008-016 benchmark fit is unavailable rather than regressed against a guess
	PASS 7 SCN-008-017 marginal and total risk contributions reconcile
	PASS 8 SCN-008-016 declared proxy factors report exposures and name themselves proxies
	PASS 9 SCN-008-017 return contribution stays distinct from risk contribution
	PASS 10 SCN-008-015 manual assets and absent look through stay visible not omitted
	PASS 11 contribution diagnostics preserve mobile canvas table parity
	PASS 12 SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
	PASS 13 Risk X-Ray retains partial eligible results rather than whole-refusing
13 passed
```

### TP-21-04

```text
$ node --test --test-name-pattern="Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray" tests/portfolio-analytics.unit.mjs
exit: 0
TAP version 13
# Subtest: Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray
ok 1 - Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### TP-21-05

```text
# Feature 008 Scope 21 repository selftest final
$ node scripts/selftest.mjs
exit: 0
lines: 3625
sha256: 4d1ce9aca6105dbc4eebfd368b417f046da271b9db9663318ecb1d92368d206a
--- first 20 ---
Step 1 security - escaped model sinks and CSP on every page
	PASS every shipped HTML page carries a Content-Security-Policy meta
	PASS all pages use one identical CSP instead of drifting per page
	PASS no model/config-authored field reaches innerHTML without esc()
--- omitted 3585 line(s); sha256 above covers the full output ---
--- last 20 ---
================================================
Research-Lab self-test: 3192 passed, 0 failed
================================================
```

### RED And GREEN

The compatible-frequency unit discriminator first failed because `compatibleFrequencyResults` was absent.
After the separate actual-frequency computation was added, the identical focused row passed. The strengthened
live mixed-input scenario then failed because `#riskCompatibleFrequency` was absent. After the immutable result
was rendered, the identical live scenario passed. No assertion was deleted or weakened.

## Uncertainty Declarations

- The persisted import contract does not yet carry a dated manual time series. The real-page mixed fixture
	therefore renders an explicit `No dated manual series` state, while the Node fixture exercises the complete
	compatible-frequency result.
- Seven future remediation-scope test carriers remain `planned-not-authored`; structured path validation keeps
	them visible without making the active Scope 21 unrunnable.

## Scenario Contract Evidence

SCN-008-047 is implemented by `tests/portfolio-analytics.unit.mjs`,
`tests/portfolio-risk.functional.mjs`, and the exact persistent row in
`tests/portfolio-survival-risk.spec.mjs`.

## Coverage Report

The test matrix covers six input classes across five metric families, exact elapsed CAGR, independent metric
coverage, partial daily alignment at original weights, actual-frequency manual results, concentration, CAPM,
proxy factors, raw/conditioned covariance, asset/factor/return contributions, last-valid rollback, and
Simple/Power identity parity. The complete analytics suite covers 81 tests, the functional carrier 2, the Risk
X-Ray browser carrier 13, and the repository suite 3,192 assertions.

## Lint And Quality

- Regression quality guard: 0 violations, 0 warnings.
- Pages build dry run: exit 0; 28 registered pages and 121 root files.
- Structured test paths: exit 0; zero new missing paths and seven future planned carriers.
- Editor diagnostics: zero errors in all five Scope 21 files.
- Incomplete-marker and live-interception scans: zero matches.
- `git diff --check`: exit 0.
- Artifact lint: `Artifact lint PASSED`.
- Canonical focused traceability: `RESULT: PASSED (0 warnings)`.

```text
--- Traceability Summary ---
Scenarios checked: 47
Test rows checked: 163
Scenario-to-row mappings: 47
Concrete test file references: 47
Report evidence references: 47
DoD fidelity scenarios: 47 (mapped: 47, unmapped: 0)
Edge confidence: declared=85 inferred=0 ambiguous=9
RESULT: PASSED (0 warnings)
```

## Spot-Check Recommendations

- Retain the mixed Node fixture because it proves all six input classes and the compatible-frequency branch in
	one immutable result.
- Retain the singular-matrix adversarial case and the `lambdaWasAutoRaised:false` UI assertion; together they
	prevent silent covariance repair.

## Validation Summary

Artifact lint and canonical focused traceability pass. All five declared commands pass, the complete Risk
X-Ray browser carrier passes 13/13, and the repository selftest passes 3,192/0. Scope 21 is ready for
planning-owned DoD closure and validate-owned status reconciliation.

The consolidated receipt below repeats the exact command, exit code, and result line of each row already
recorded under Test Evidence and Lint And Quality in this report; no new execution is claimed here.

```text
# Scope 21 declared matrix — 5 of 5 commands executed, 0 failed, 0 skipped
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
# tests 81   # pass 81   # fail 0   # skipped 0
$ node --test tests/portfolio-risk.functional.mjs
exit: 0
# tests 2   # pass 2   # fail 0   # skipped 0
$ npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
13 passed
$ node --test --test-name-pattern="Adversarial: reduced risk input and diagnostic paths cannot satisfy Risk X Ray" tests/portfolio-analytics.unit.mjs
exit: 0
# tests 1   # pass 1   # fail 0   # skipped 0
$ node scripts/selftest.mjs
exit: 0
Research-Lab self-test: 3192 passed, 0 failed
RESULT: PASSED (0 warnings)
```

## Audit Verdict

Scope 21 implementation, tests, rollback behavior, and cross-consumer compatibility are internally consistent.
No terminal feature claim is made.
