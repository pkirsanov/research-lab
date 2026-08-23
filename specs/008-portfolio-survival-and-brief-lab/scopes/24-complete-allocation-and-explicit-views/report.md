# Scope 24 Report: Complete Allocation And Explicit Views

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 24 implements `AllocationBasis/v1`, all six named allocation interfaces, deterministic bounded-constraint
projection, projected minimum-variance and constrained-MVO solvers, true equal-risk-contribution risk parity,
explicit Black-Litterman posterior allocation, complete cost/path/survival/contribution diagnostics, structural
infeasibility evidence, and declared multi-axis sensitivity. The Allocation route derives one basis from the current
revision, conditioned covariance, confirmed mandate, public policy, and same-basis historical paths. Expected returns,
benchmark weights, risk aversion, and views remain explicit local inputs. No candidate is selected or applied.

## Decision Record

- Constraints are enforced inside deterministic Dykstra projection and projected optimization. No unconstrained vector
	is clipped into a result.
- Current allocation remains an observed baseline and may be visibly infeasible. Every other method retains its own
	state and residuals.
- Black-Litterman requires a qualified explicit benchmark. No view means `equilibrium-only`; absent benchmark input
	remains unavailable. Explicit views carry horizon, range, confidence source, uncertainty, authority, cutoff, and
	invalidation.
- Sensitivity is an explicit command because its full six-method, eleven-axis trial matrix is materially more expensive
	than ordinary route rendering. Every point enters `AllocationSensitivityTrial/v1`; no trial becomes a winner score.
- Allocation research inputs and sensitivity are local derived controller state. Full personal clear resets them and
	no candidate mutates the current `PortfolioDefinition`.

## Completion Statement

Implementation and all six declared Test Plan commands pass. The complete Allocation browser carrier passes 15/15,
the complete analytics matrix passes 102/102, the functional carrier passes 6/6, and the repository selftest passes
3,245/0. Scope status remains `In Progress` until planning and certification owners reconcile this evidence.

## Code Diff Evidence

**Claim Source:** executed and interpreted against a shared dirty tree

```text
$ git status --short -- <Scope 24 paths>
 M portfolio-survival-allocation-lab.html
 M portfolio-survival-allocation.config.json
 M rlportfolio.js
 M rlportfolioanalytics.js
 M tests/portfolio-allocation.functional.mjs
 M tests/portfolio-analytics.unit.mjs
 M tests/portfolio-survival-allocation.spec.mjs
?? tests/fixtures/portfolio-survival-allocation/mandate-allocation-infeasible.json
?? tests/fixtures/portfolio-survival-allocation/scope-24-allocation-basis.json
$ git log -1 --format="%h %s" -- <shared allocation paths>
d3de615a4 feat(008): advance portfolio risk and scenario analysis
$ git diff --check -- <Scope 24 paths>
exit: 0
```

The shared route and analytics/test files carried prior Feature 008 work before Scope 24 began. Scope 24 attribution is
bounded to the new allocation basis/solver/sensitivity functions, policy fields, explicit Allocation inputs and tables,
`TP-24-*` and `SCN-008-050` assertions, and the two new fixtures. Recommendation-track-record and Feature 015 paths were
not edited by this scope.

## Test Evidence

**Claim Source:** executed in the current session

### RED And GREEN

The first focused unit run failed all three Scope 24 rows because the public interfaces did not exist:

```text
$ node --test --test-name-pattern="TP-24-01" tests/portfolio-analytics.unit.mjs
TypeError: RLPA.validateAllocationBasis is not a function
TypeError: RLPA.solveEqualRiskContribution is not a function
TypeError: RLPA.solveBlackLittermanAllocation is not a function
tests 3
pass 0
fail 3
exit: 1
```

After the additive solver implementation, the identical focused run passed 3/3. The first exact browser flow then
exposed two real contract faults in sequence: identity payloads lacked a contract version, then used uppercase versions
outside the canonical safe-ID grammar. The same scenario passed after lowercase versioned identity payloads landed.
The candidate-infeasibility row initially used a 25% cap that mathematically pinned both BL results to one boundary;
the dedicated fixture now makes the current portfolio infeasible at 70% while retaining enough feasible space for an
explicit posterior to change weights.

### TP-24-01

```text
# Feature 008 Scope 24 TP-24-01 unit final
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
lines: 622
sha256: 369be44f00d0d95cba96aebebc4246949f7030185fbe7aef83e4db91a1b53e2c
--- last 12 ---
1..102
# tests 102
# suites 0
# pass 102
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8552.243911
```

### TP-24-02

```text
# Feature 008 Scope 24 TP-24-02 functional final
$ node --test tests/portfolio-allocation.functional.mjs
exit: 0
lines: 46
sha256: 77b08041d2cc75e0b114acaf8c9ba6579c2c80f78125dad6411b56e60d798759
--- last 12 ---
1..6
# tests 6
# suites 0
# pass 6
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2386.819851
```

### TP-24-03 And TP-24-05

Both exact rows passed independently. The complete carrier provides the required raw-output depth and proves every
legacy Allocation, sensitivity, BL, dossier, and claim-boundary journey remains green:

```text
# Feature 008 Scope 24 complete Allocation browser final
$ npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 20
sha256: 6f9a5797ce81c234fafe7ef93caf2eeb4b6691667c2a600b1d8a37ed5e7103c2
Running 15 tests using 1 worker
	PASS SCN-008-026 all six allocation methods share one frozen basis
	PASS SCN-008-027 allocation comparison presents tradeoffs and no universal winner
	PASS SCN-008-029 conflicting constraints remain infeasible without relaxation
	PASS allocation rows preserve mobile canvas/table parity and infeasible states
	PASS Allocation refuses rather than showing candidate weights without evidence
	PASS SCN-008-028 unstable allocation shows ranges and reversal conditions
	PASS SCN-008-030 behavior cannot alter BL views, returns, or confidence
	PASS SCN-008-030 explicit BL keeps equilibrium, view, posterior, and uncertainty separate
	PASS allocation sensitivity and BL editor preserve mobile table parity
	PASS SCN-008-050 six real methods enforce one complete basis and explicit views
	PASS SCN-008-050 infeasible constraints remain visible and explicit posterior changes allocation
	PASS all four dossier and claim-boundary regressions
	15 passed (27.8s)
```

### TP-24-04

```text
# Feature 008 Scope 24 TP-24-04 adversarial final
$ node --test --test-name-pattern="Adversarial: heuristic clipped and disconnected allocation methods cannot satisfy the six method contract" tests/portfolio-analytics.unit.mjs
exit: 0
lines: 16
sha256: 86ca55f08c16a08a1c96d06a877901bf67ca1a6b606f43e552c99e78dea4e0e9
TAP version 13
# Subtest: Adversarial: heuristic clipped and disconnected allocation methods cannot satisfy the contract
ok 1 - Adversarial: heuristic clipped and disconnected allocation methods cannot satisfy the contract
1..1
# tests 1
# pass 1
# fail 0
# skipped 0
# todo 0
# duration_ms 404.817381
```

The row independently rejects inverse volatility as ERC, post-hoc clipping, ignored asset bounds, missing benchmark
identity, posterior-disconnected weights, and structurally impossible minimums without an irreducible conflict set.

### TP-24-06

```text
# Feature 008 Scope 24 TP-24-06 repository selftest final
$ node scripts/selftest.mjs
exit: 0
lines: 3674
sha256: 2ae9a5751360f10d9410beeb924d266990659c90101dca7a5bc6b321c0c2bb59
--- first 4 ---
Step 1 security - escaped model sinks and CSP on every page
	PASS every shipped HTML page carries a Content-Security-Policy meta
	PASS all pages use one identical CSP instead of drifting per page
--- last 5 ---
================================================
Research-Lab self-test: 3245 passed, 0 failed
================================================
```

## Uncertainty Declarations

- Scope 24 reports projected-gradient/KKT and ERC residuals under the explicit solver tolerance. It does not claim a
	closed-form global optimum for a non-convex risk-budget objective.
- The structural conflict set is deterministic and irreducible under deletion filtering; it is explicitly not claimed
	globally smallest.
- Historical common paths are evidence-bounded observed rows, not forecasts. Survival stays unavailable until the user
	declares a floor.
- Sensitivity ranges cover only the eleven declared axis sets. They do not establish robustness outside those points.

## Scenario Contract Evidence

SCN-008-050 executes through `tests/portfolio-analytics.unit.mjs`,
`tests/portfolio-allocation.functional.mjs`, and the two exact persistent rows in
`tests/portfolio-survival-allocation.spec.mjs`. The live rows use the real fixture-overlay server with no request
interception or DOM injection.

## Coverage Report

Unit coverage exercises basis validation, projection, all six interfaces, ERC/KKT identities, BL equilibrium and
posterior, costs, contributions, common paths, survival, every sensitivity axis, missing-axis refusal, heuristic
mutations, and irreducible conflicts. Functional coverage composes the richer four-asset/group/cash/cost/path fixture
through all candidates and 174 sensitivity trials with public JSON round-trip. Browser coverage exercises explicit
inputs, no-view equilibrium, complete views, mandate infeasibility, posterior-driven weights, 198 route sensitivity
trials, solver/cost/path/survival rendering, no-winner copy, and mobile/table parity.

## Lint And Quality

- Editor diagnostics: zero errors across all nine Scope 24 implementation, policy, fixture, and test paths.
- Incomplete-marker and live-interception scans: zero matches.
- Regression quality guard: 0 violations and 0 warnings.
- Pages build dry run: exit 0; 28 registered pages and 121 root files.
- Structured test paths: exit 0; zero new missing paths and five future planned carriers.
- `git diff --check` over the bounded Scope 24 paths: exit 0.
- PII scan: exit 0; zero findings across 9,267 files and 1,821 messages.
- Artifact lint: exit 0 with `Artifact lint PASSED`.
- Canonical focused traceability: exit 0 with 50 scenarios, 184 test rows, 50 report evidence references, and zero warnings.

## Shared Infrastructure And Rollback Evidence

- All six candidates carry one basis fingerprint and one ordered common-path set. The exact browser row asserts one
	DOM fingerprint across all six rows.
- A failed or infeasible solve returns a stable candidate row with residual/conflict evidence. It never changes the
	current portfolio, mandate, or prior local result.
- Applying new expected returns or a new explicit view invalidates only the derived sensitivity result. Full personal
	clear resets expected returns, benchmark, views, and sensitivity alongside other controller-derived personal state.
- Scope 21 risk, Scope 22 paths, and Scope 23 diversification remain separate consumers; no formula was copied into
	the route.

## Spot-Check Recommendations

- Retain the inverse-volatility adversarial fixture. Its correlated covariance makes the heuristic visibly fail the
	equal-risk-contribution identity.
- Retain both exact SCN-008-050 rows. One proves the complete six-method/sensitivity projection; the other proves a
	candidate can remain infeasible while posterior means and constrained weights stay attributable.
- Retain the explicit empty benchmark state. Equal weight must never reappear as a silent BL benchmark fallback.

## Validation Summary

All declared Scope 24 commands and focused quality checks pass. Validate-owned certification now mirrors Scope 24 as
`in_progress`, which cleared the scope-universe resolver without a terminal claim. Canonical focused traceability passes:

```text
# Feature 008 Scope 24 focused traceability reconciled
$ bash <bubbles-repo>/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 406
sha256: 4444937ea652e4d0bc63c4db63019cdc86daa59fce0a318fa5999adec30c82a5
--- Traceability Summary ---
Scenarios checked: 50
Test rows checked: 184
Scenario-to-row mappings: 50
Concrete test file references: 50
Report evidence references: 50
DoD fidelity scenarios: 50 (mapped: 50, unmapped: 0)
Edge confidence: declared=100 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```

Scope 24 is ready for planning-owned DoD closure and subsequent execution/certification status reconciliation.

## Audit Verdict

Implementation, tests, rollback behavior, and cross-consumer compatibility are internally coherent. No terminal scope
or feature claim is made; Scopes 25-29 remain dependency-ordered work.