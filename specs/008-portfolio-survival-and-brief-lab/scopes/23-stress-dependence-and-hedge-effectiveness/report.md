# Scope 23 Report: Stress Dependence And Hedge Effectiveness

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 23 implements distinct tranquil and stress samples, qualified Forbes-Rigobon adjustment,
tail and overlap diagnostics, appraisal limits, and return-regression hedge comparisons. Hedge variants
reuse one frozen `ScenarioSpecification/v1` and one opaque path identity set. The route shows regression,
residual variance, costs, liquidity, financing, normal, stress, and path outcomes without prescribing a hedge.

## Decision Record

Dependence and hedge effectiveness share one evidence and scenario basis. This prevents raw, adjusted,
cost, residual, and path claims from drifting apart. Opaque path identities replace delimiter-composed IDs.
Unavailable appraisal or thin-sample results render as explicit states and never replace the last valid result.

## Completion Statement

All six declared Test Plan commands pass on the final production tree. The complete Diversification browser
carrier passes 10/10, and the repository selftest passes 3,221/0. Scope status remains `In Progress` until
the planning and certification owners reconcile this evidence.

## Code Diff Evidence

**Claim Source:** current-session repository reads and commands

Commit `d3de615a4` contains the Scope 23 analytics module and three test carriers. The shared route remains
modified for the single-render navigation repair found during final regression. The bounded status was:

```text
$ git status --short -- portfolio-survival-allocation-lab.html rlportfolioanalytics.js tests/portfolio-analytics.unit.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-survival-diversification.spec.mjs specs/008-portfolio-survival-and-brief-lab/scopes/23-stress-dependence-and-hedge-effectiveness/scope.md specs/008-portfolio-survival-and-brief-lab/scopes/23-stress-dependence-and-hedge-effectiveness/report.md specs/008-portfolio-survival-and-brief-lab/state.json
 M portfolio-survival-allocation-lab.html
```

The commit record names these Scope 23 files:

```text
$ git show --format=fuller --name-status --no-renames d3de615a4 -- rlportfolioanalytics.js tests/portfolio-analytics.unit.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-survival-diversification.spec.mjs
commit d3de615a404303468561bfcedfbdaefdd319ddea
		feat(008): advance portfolio risk and scenario analysis
M       rlportfolioanalytics.js
M       tests/portfolio-analytics.unit.mjs
A       tests/portfolio-diversification.functional.mjs
M       tests/portfolio-survival-diversification.spec.mjs
```

No recommendation-track-record or Feature 015 path appears in this bounded change set.

## Test Evidence

**Claim Source:** executed in the current session

### RED And GREEN

The first complete browser rerun failed its keyboard rail assertion after three earlier route tests passed.
The same row passed alone. Sending the key through the live locator still failed in the complete carrier.
The route-tab handler then revealed two renders for one navigation. It called `applyRoute()` immediately and
the resulting `hashchange` called it again. The delayed second render replaced the selected chart rail.
The handler now relies on `hashchange` for changed routes and refreshes directly only for the current route.
The identical complete carrier then passed 10/10.

### TP-23-01

```text
# Feature 008 Scope 23 TP-23-01 unit final
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
lines: 592
sha256: 42c7b94b70f9931642aea8edef55428d63323f6b8386c786219762624ff9ec85
--- last 12 ---
ok 96 - TP-15-01 a market-efficiency conclusion is scoped to the one form it tested
ok 97 - TP-15-01 no correlation number adjudicates substantially identical
1..97
# tests 97
# suites 0
# pass 97
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2142.035909
```

### TP-23-02

```text
# Feature 008 Scope 23 TP-23-02 functional final
$ node --test tests/portfolio-diversification.functional.mjs
exit: 0
lines: 22
sha256: 36f2342e3795c00a69e7124586fb55cecd87b8894531b285b20ec028d4b811af
TAP version 13
# Subtest: TP-23-02 complete diversification projection survives JSON round trip with exact contracts
ok 1 - TP-23-02 complete diversification projection survives JSON round trip with exact contracts
# Subtest: TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection
ok 2 - TP-23-02 reduced or incomplete recompute refuses publication and preserves the last valid projection
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 129.353655
```

### TP-23-03 And TP-23-05

The exact persistent rows each passed. The complete carrier supplies raw-output depth and proves every legacy
Diversification journey remains green.

```text
# Feature 008 Scope 23 complete Diversification browser final after single-render navigation repair
$ npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 15
sha256: fd51e1c44e04ea0dee952d5100241078a65ea72971bf83a9f09ad3e44b2360ea
Running 10 tests using 1 worker
	PASS SCN-008-022 raw stress correlation shows volatility context and qualified adjustment
	PASS SCN-008-023 finite tail evidence never claims universal correlation one
	PASS SCN-008-024 appraisal smoothing and illiquidity block mechanical decorrelation
	PASS dependence matrix alternatives and tables preserve desktop mobile pixel parity
	PASS Diversification refuses rather than showing a simplified matrix
	PASS SCN-008-025 hedged and unhedged comparison keeps carry and basis risk separate
	PASS SCN-008-025 missing cost evidence blocks net benefit rather than assuming zero
	PASS hedge variants stay equivalent and legible at desktop mobile and zoom
	PASS SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence
	PASS SCN-008-049 hedge variants reuse the selected survival scenario and path identities
	10 passed (40.9s)
```

### TP-23-04

```text
# Feature 008 Scope 23 TP-23-04 adversarial final
$ node --test --test-name-pattern="Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract" tests/portfolio-analytics.unit.mjs
exit: 0
lines: 16
sha256: 88809916906b0e5af0b6608a1c093c34d4723f1a224053a2c6c105d1400ff15d
TAP version 13
# Subtest: Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract
ok 1 - Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 123.262451
```

### TP-23-06

```text
# Feature 008 Scope 23 repository selftest post-navigation-repair
$ node scripts/selftest.mjs
exit: 0
lines: 3650
sha256: 9f67f169bd82df50b7c52f814e2ca89c461f611122703a76f5a771cccc9e12a7
--- first 3 ---
Step 1 security - escaped model sinks and CSP on every page
	PASS every shipped HTML page carries a Content-Security-Policy meta
	PASS all pages use one identical CSP instead of drifting per page
--- last 3 ---
================================================
Research-Lab self-test: 3221 passed, 0 failed
================================================
```

### Shared Infrastructure And Rollback

Scope 22's controller and Scope 21's partial-risk projection remain green after opaque path identity changes.

```text
# Feature 008 Scope 22 cross-scope functional canary
$ node --test tests/portfolio-paths.functional.mjs
exit: 0
sha256: 881993c31a2359bdb73c0fea6cd6d4478cf4b20ce3d00bea7e43cce150c24289
ok 1 - TP-22-02 chunk controller cancellation and supersession preserve the last valid result
ok 2 - TP-22-02 complete multi-path flow and distribution records survive a public JSON round trip
# tests 2
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 121.314763
```

```text
# Feature 008 Scope 21 cross-scope functional canary
$ node --test tests/portfolio-risk.functional.mjs
exit: 0
sha256: 4bcb25383c880d5972ed132f72a3dddb72ec7f08e34cd5716642fbf1f528b60f
ok 1 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
ok 2 - SCN-008-047 failed candidate preserves the last valid structured result
# tests 2
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 106.854274
```

The complete Path Lab browser canary also passes 11/11. Its compact evidence hash is
`88c3a1b9bb10fd0544b92bd8d711ee6049c046e9f857f4451243fe7ab612b49b`.

## Uncertainty Declarations

- Qualified stress adjustment remains unavailable when sample identity, anchor variance, or interval evidence is insufficient.
- Appraisal sensitivity remains unavailable when no dated manual alternative exists.
- Hedge results are research comparisons. The route makes no personal hedge recommendation.
- The route file contains earlier shared-scope work. Scope 23 attribution uses symbols and test titles, not the aggregate diff.

## Scenario Contract Evidence

SCN-008-049 executes through `tests/portfolio-analytics.unit.mjs`,
`tests/portfolio-diversification.functional.mjs`, and both exact rows in
`tests/portfolio-survival-diversification.spec.mjs`. The browser carrier uses the real fixture-overlay server.
It does not intercept requests or inject a test DOM.

The carriers and their recorded exit codes, from [Test Evidence](#test-evidence):

```text
$ node --test tests/portfolio-analytics.unit.mjs                                  # TP-23-01 distinct samples, adjustment, appraisal, basis risk
exit: 0   tests 97   pass 97   fail 0   skipped 0   todo 0

$ node --test tests/portfolio-diversification.functional.mjs                      # TP-23-02 costs and projection contracts
exit: 0   tests 2   pass 2   fail 0   skipped 0   todo 0

$ npx --no-install playwright test tests/portfolio-survival-diversification.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0   10 passed (40.9s)
  PASS SCN-008-049 stress dependence appraisal and hedge effectiveness retain distinct qualified evidence
  PASS SCN-008-049 hedge variants reuse the selected survival scenario and path identities

$ node --test --test-name-pattern="Adversarial: reduced diversification and hedge shortcuts cannot satisfy the contract" tests/portfolio-analytics.unit.mjs
exit: 0   tests 1   pass 1   fail 0
```

The two exact `SCN-008-049` browser rows carry the scenario: the first proves stress dependence, appraisal
limits, and hedge effectiveness stay *distinct* qualified evidence rather than one blended number; the second
proves hedge variants reuse the selected survival scenario and path identities, which is what keeps the common
paths common. The adversarial unit row makes the claim non-vacuous — reduced diversification and hedge
shortcuts are refused rather than accepted. Regression basis risk and costs are held separate by the sibling
`SCN-008-025` rows in the same carrier, which keep carry and basis risk apart and block a net-benefit claim
when cost evidence is missing instead of assuming zero.

## Coverage Report

The unit matrix covers sample identity, stress selection, raw and adjusted estimates, intervals, tail events,
downside, drawdown, recovery, de-smoothing, hedge regression, costs, and opaque common paths. The functional
carrier covers exact JSON projection, incomplete recompute refusal, and last-valid preservation. The browser
carrier covers qualified evidence, unavailable states, cost and financing rows, common scenarios, common paths,
keyboard access, mobile layout, zoom, and refusal copy.

## Lint And Quality

- Editor diagnostics report zero errors in all five Scope 23 implementation and test files.
- Incomplete-marker and live-interception scans return zero matches.
- Regression quality reports zero violations and zero warnings.
- Pages dry-run exits 0 with 28 registered pages and 121 root files.
- Structured test paths exit 0 with zero new or stale missing paths and five future planned carriers.
- Artifact lint exits 0. Compact evidence SHA-256: `ed9142d7152044254040019b1b8b5bda8eb2f0e069f511acdd675c357cff0950`.
- The PII scanner reports zero findings across 8,903 files and 1,801 messages.
- `git diff --check` emits no output and exits 0 on the route and Scope 23 report.

Focused traceability passes after this report supplies the concrete carrier evidence:

```text
# Feature 008 Scope 23 canonical focused traceability after evidence
$ bash <bubbles-repo>/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 397
sha256: d104c2722fe0dbf7bcbecaae2e1ea6cb737038c58916197648f3bb005b9250dd
--- Traceability Summary ---
Scenarios checked: 49
Test rows checked: 177
Scenario-to-row mappings: 49
Concrete test file references: 49
Report evidence references: 49
DoD fidelity scenarios: 49 (mapped: 49, unmapped: 0)
Edge confidence: declared=98 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```

## Spot-Check Recommendations

- Retain the reduced-contract adversarial row. It rejects same-sample, missing-adjustment, fixed-ratio, and cost-free shortcuts.
- Retain both exact SCN-008-049 browser rows. They prove evidence qualification and common-path reuse independently.
- Retain the full-carrier keyboard assertion. It exposed duplicate route rendering that isolated rows did not reveal.

## Validation Summary

All declared Scope 23 commands and broad project checks pass. Artifact lint and focused traceability pass.
Planning-owned DoD closure and validate-owned state reconciliation remain outstanding.

## Audit Verdict

Implementation, test, rollback, and cross-consumer evidence are internally coherent. A `bubbles.audit`
specialist has not run for Scope 23, so this report makes no specialist-audit or terminal-feature claim.
