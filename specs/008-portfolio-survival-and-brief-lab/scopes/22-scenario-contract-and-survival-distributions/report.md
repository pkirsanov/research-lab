# Scope 22 Report: Scenario Contract And Survival Distributions

Links: [scope.md](scope.md) | [spec.md](../../spec.md) | [scope index](../_index.md)

## Summary

Scope 22 implements the complete nested `ScenarioSpecification/v1`, deterministic chunk and token lifecycle,
full configured path count, all-path costs and declared flows, separate path/parameter/combined distributions,
all-path survival, and structured method availability. The real Path Lab now runs 2,000 paths by 21 parameter
draws in configured 2,000-work-unit chunks. Cancellation and supersession preserve the last valid result.

## Decision Record

Scenario identity, compute publication, cash-flow application, and survival distributions stay together because
splitting them permits mismatched paths and claims. Compute budgets are explicit in the policy SST. A scenario
requires complete return coverage even though Risk X-Ray may publish a partial diagnostic. Saved scenario identity
uses the current portfolio and mandate computation basis rather than the append-only saved-scenario collection, so
saving the same scenario remains idempotent. Scope 22 in-memory token and result state participates in full-personal
clear.

## Completion Statement

Implementation and all six declared Test Plan commands pass. The full Path Lab browser carrier passes 11/11,
the repository selftest passes 3,212/0, the Scope 21 risk functional canary passes 2/2, and the runtime-derived
full clear removes a populated Scope 22 compute identity. Scope status remains `In Progress` until the planning
and certification owners reconcile this evidence.

## Code Diff Evidence

**Claim Source:** executed and interpreted against a shared dirty tree

```text
$ git status --short -- <Scope 22 paths>
 M portfolio-survival-allocation-lab.html
 M portfolio-survival-allocation.config.json
 M rlportfolio.js
 M rlportfolioanalytics.js
 M specs/008-portfolio-survival-and-brief-lab/scopes/22-scenario-contract-and-survival-distributions/scope.md
 M tests/portfolio-analytics.unit.mjs
 M tests/portfolio-survival-paths.spec.mjs
?? tests/portfolio-paths.functional.mjs
$ git diff --check -- <tracked Scope 22 paths>
exit: 0
```

The shared route, analytics module, and analytics/browser tests already carried uncommitted Scope 21 work before
Scope 22 began. Their aggregate diff is therefore not attributed wholly to Scope 22. Scope 22 owns the new complete
scenario/token/chunk/distribution symbols, the policy fields, the Path Lab controller/rendering changes, the
`TP-22-*` and `SCN-008-048` assertions, and `tests/portfolio-paths.functional.mjs`. No recommendation-track-record
or Feature 015 path was edited.

## Test Evidence

**Claim Source:** executed in the current session

### RED And GREEN

The first real-page run failed before any Scope 22 control existed:

```text
$ npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path" --reporter=list
Locator: locator('[data-route="path-lab"]').locator('#pathComputeStatus')
Expected: "completed"
Error: element(s) not found
1 failed
```

After controller wiring, the identical test reached all 42,000 configured work units and failed closed at final
publication because explicitly unavailable survival was incorrectly required to carry a path count. After that
contract was corrected, it failed on the remaining legacy median-path cash rendering. Replacing that rendering
with the engine's all-path result made the identical test pass. The full browser run then exposed and closed three
compatibility defects: append-only saved rows changing scenario identity, partial return evidence starting a path
run, and synchronous legacy assertions reading before an async token completed.

### TP-22-01

```text
# Feature 008 Scope 22 TP-22-01 unit final
$ node --test tests/portfolio-analytics.unit.mjs
exit: 0
lines: 544
sha256: e702c42de4c9f85bf0e73132b0524eca18a0ccbf8b364ab202e172f6dbbd50f8
--- last 12 ---
ok 89 - TP-15-01 no correlation number adjudicates substantially identical
1..89
# tests 89
# suites 0
# pass 89
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2486.038404
```

### TP-22-02

```text
$ node --test tests/portfolio-paths.functional.mjs
✔ TP-22-02 chunk controller cancellation and supersession preserve the last valid result
✔ TP-22-02 complete multi-path flow and distribution records survive a public JSON round trip
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 124.16424
```

### TP-22-03 And TP-22-05

The exact one-row runners both passed. The full carrier supplies the required raw-output depth and proves all
legacy Path Lab journeys remain green:

```text
# Feature 008 Scope 22 complete Path Lab browser final
$ npx --no-install playwright test tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 16
sha256: cb5987ae768b39ff62327cf2c85bd021f6b2c7b4993b077bc323e3b132b2e64d
Running 11 tests using 1 worker
	✓ SCN-008-018 identical stationary bootstrap specification reproduces paths
	✓ SCN-008-019 parameter uncertainty is separate from path randomness
	✓ SCN-008-038 a saved scenario survives reload and is removed by a full personal clear
	✓ dependent path fan and uncertainty tables remain equivalent at desktop mobile and zoom
	✓ Path Lab refuses rather than generating a path without evidence
	✓ SCN-008-020 dated cash need records before and after collision capital
	✓ SCN-008-021 missing survival definition renders distributions without probability
	✓ cash need timeline and path table preserve order and mobile canvas parity
	✓ an incomplete cash need is refused rather than partly assumed
	✓ SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
	✓ SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
	11 passed (45.7s)
```

### TP-22-04

```text
$ node --test --test-name-pattern="Adversarial: reduced ScenarioSpecification and median only survival cannot pass" tests/portfolio-analytics.unit.mjs
✔ Adversarial: reduced ScenarioSpecification and median only survival cannot pass
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 158.127707
```

### TP-22-06

```text
# Feature 008 Scope 22 repository selftest final
$ node scripts/selftest.mjs
exit: 0
lines: 3642
sha256: 872cd90d222f56eaa446f3b3ea923e0c31d75b091969de3dde825d19a0f86e50
--- last 8 ---
================================================
Research-Lab self-test: 3212 passed, 0 failed
================================================
```

## Uncertainty Declarations

- The calibrated available method remains stationary bootstrap. Regime/fat-tail is represented by the complete
	structured method contract and remains unavailable unless a separately calibrated model satisfies it.
- Exchange holidays remain explicitly unmodeled in the projected business-day horizon, as stated on the page.
- The aggregate working diff includes earlier Scope 21 changes on shared files; Scope 22 attribution is symbol- and
	test-title-bounded rather than inferred from the whole file diff.

## Scenario Contract Evidence

SCN-008-048 executes through `tests/portfolio-analytics.unit.mjs`,
`tests/portfolio-paths.functional.mjs`, and the two exact persistent rows in
`tests/portfolio-survival-paths.spec.mjs`. The live tests use the real fixture-overlay server without request
interception or test-injected DOM.

## Coverage Report

The unit matrix covers every exact nested scenario boundary and every identity field. Functional coverage exercises
chunk cancellation, supersession, last-valid preservation, all-path flows, distribution validation, and JSON
round-trip. Browser coverage exercises 2,000 configured paths, 21 parameter draws, cash needs, survival, cancellation,
supersession, persistence, complete clear, refusal, canvas/table parity, and mobile/zoom behavior.

## Lint And Quality

- Editor diagnostics: zero errors across the policy, route, modules, and three Scope 22 test carriers.
- Regression quality guard: 0 violations and 0 warnings.
- Pages build dry-run: exit 0; 28 registered pages and 121 root files.
- Structured test paths: exit 0; zero new missing paths and six future planned carriers.
- Scope 21 risk functional migration canary: 2 passed, 0 failed.
- Runtime-derived full-personal clear browser proof: 1 passed; populated token/result identity resets to idle/null.
- `git diff --check` over tracked Scope 22 paths: exit 0.

## Spot-Check Recommendations

- Retain both exact SCN-008-048 browser rows. They prove old-token completion cannot become current and that the full
	configured path count reaches every cash-need and survival distribution.
- Retain the adversarial unit row. It independently breaks reduced identity, hidden 200-path truncation, disposable
	horizon length, median-only survival, and missing identity.

## Validation Summary

All declared Scope 22 commands and focused quality checks pass. Artifact lint passes. The installed downstream
traceability copy reports three future `planned-not-authored` carriers because it predates the canonical
current-scope projection. The canonical guard passes the active Scope 22 universe while preserving strict
all-scope enforcement:

```text
# Feature 008 Scope 22 canonical focused traceability
$ bash <bubbles-repo>/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab --current-scope
exit: 0
lines: 388
sha256: 8ef7e54d9ae96097f18f64b43444070a6330d4d2a63b81079dfc100c7d141bde
Scenarios checked: 48
Test rows checked: 170
Scenario-to-row mappings: 48
Concrete test file references: 48
Report evidence references: 48
DoD fidelity scenarios: 48 (mapped: 48, unmapped: 0)
Edge confidence: declared=96 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```

## Audit Verdict

Implementation and test evidence are internally coherent. No terminal feature claim is made; Scopes 23-29 remain
future dependency-ordered work.
