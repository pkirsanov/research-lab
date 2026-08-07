# Bug Fix Design: BUG-006 Contextual Tooltip Suite Budget

## Investigation Summary

The diagnosis compares the complete-suite failure with two narrower execution
contexts and the controlling test/configuration source:

| Context | Result | Disposition |
|---|---|---|
| Complete browser suite, four workers, retries 0 | 276 passed, 1 failed in 8.8 minutes; target exhausted 30 seconds at second close click | Confirms a suite-context containing-budget failure |
| Exact failed title, one worker, retries 0 | 1/1 passed; target 15.4 seconds, command 17.7 seconds | Falsifies deterministic product failure |
| Complete contextual-tooltip file, one worker, retries 0 | 3/3 passed; target 15.2 seconds, command 20.5 seconds | Falsifies file-local cumulative leakage |

The test source shows that the target reaches the second disclosure open only
after validating mobile sheet geometry, Escape close, and first focus
restoration. The failed line is a real locator click, so Playwright is retaining
its normal visible, enabled, and stable actionability requirements.

## Concurrent Baseline Transition

The active complete-suite baseline is 280 tests across the unchanged 33-file
path set. `spec.md` records that acceptance baseline, and `report.md` grounds it
in the unrestricted system-Chrome discovery at commit
`923833254b9463cfb163cac2aace2b2fb305333b`. That additive commit introduces
exactly three tests in `tests/portfolio-survival-foundation.spec.mjs`.

This transition changes only active exact-count acceptance statements.
Historical 277-test execution evidence remains historical and unchanged. The
commands, retries, worker profiles, root cause, bounded fix, interactions, and
assertions retain their existing design contracts.

## Root Cause

`playwright.config.mjs` leaves the containing test timeout at Playwright's
finite 30-second default. The mobile target is materially heavier than the two
neighboring contextual tests: it opens two pages, performs two disclosure
cycles, measures geometry, validates two focus returns, and checks the
no-canvas same-data fallback. Its focused duration already consumes roughly
half the default budget. Four-worker host contention can consume the remaining
margin before the second close-button action completes.

No explicit inner readiness timeout failed. Adding a narrower wait around an
earlier state would not address the observed containing test deadline and could
replace real actionability with a weaker proxy.

## Falsifiable Local Hypothesis

If only the named mobile target receives Playwright's finite slow-test budget,
the complete four-worker and serial suites will pass while every existing
interaction and assertion remains byte-identical.

The hypothesis is falsified if either complete-suite profile still times out,
if the test requires any forced or programmatic interaction to pass, or if the
one-statement boundary cannot preserve all current assertions.

## Fix Design

### Smallest Mutation

Add `test.slow();` as the first statement inside only this target:

```javascript
test('Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas', async ({ page }) => {
  test.slow();
```

With the current Playwright configuration, this applies Playwright's finite
slow-test multiplier only to the containing target. It does not change global
configuration, locator actionability, assertion timeouts, or neighboring tests.

An explicit target-local `test.setTimeout(...)` is an acceptable fallback only
if the implementation owner proves `test.slow()` is unavailable or behaves
differently in the committed Playwright version. No current evidence requires
that alternative.

### Preserved Behavior

The implementation must preserve all of these operations and assertions:

1. 390 by 844 mobile viewport on the primary and no-canvas pages;
2. touch pointer open on the first table-row contextual trigger;
3. sheet layout, dialog role, modal semantics, and in-viewport geometry;
4. Escape close and focus restoration to the original trigger;
5. second touch pointer open;
6. real locator close-button click with normal actionability;
7. connected/current trigger, closed disclosure, one trigger, and focus checks;
8. canvas-unavailable state on the separately initialized page;
9. visible, primary same-data table, explanatory hint, and non-empty verdict;
10. the neighboring malformed label-only failure-path test.

### Proposed Mutation Boundary

Allowed after this packet:

- `tests/contextual-tooltip.spec.mjs`: one target-local outer-budget statement
  at the start of the named mobile test.

Excluded:

- `playwright.config.mjs` and all global timeout configuration;
- retries, fixed sleeps, force options, dispatching click programmatically,
  direct DOM close calls, interception, catches, bailouts, and optional asserts;
- production JavaScript, HTML, JSON data, dependencies, and unrelated tests;
- BUG-005, Feature 004, BUG-002, parent Feature 012, and certification artifacts.

## Inner Readiness Wait Decision

No new inner readiness wait is justified by current evidence. The observed
failure is the containing 30-second deadline during a real click, after the
second disclosure-open action was issued. A new inner wait would be considered
only if measured post-fix evidence identifies one specific state transition
that remains unresolved well before the outer deadline. Any such wait must be
finite, target-local, strictly below the containing budget, and additive to the
real close-button click rather than a replacement for it.

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Increase `playwright.config.mjs` timeout | Reject | Changes all 280 identities for one heavy target. |
| Add retries | Reject | Conceals nondeterminism and violates acceptance. |
| Add a fixed sleep | Reject | Guesses readiness and adds unconditional latency. |
| Use `{ force: true }` | Reject | Removes actionability coverage from the regression. |
| Dispatch or invoke close programmatically | Reject | Bypasses the user interaction the test owns. |
| Remove geometry, focus, fallback, or failure checks | Reject | Weakens the regression contract. |
| Change product code | Reject | Focused and same-file evidence show the current product path completes. |

## Regression Design

1. Retain the inherited four-worker pre-fix RED as interpreted evidence.
2. Run the exact target with one worker and retries disabled.
3. Run all three contextual-tooltip tests serially with retries disabled.
4. Run the complete suite with four workers and retries disabled; require all
  280 identities across the unchanged 33-file path set to pass.
5. Run the complete suite serially with retries disabled.
6. Run the repository selftest and bugfix regression-quality guard.
7. Parse the JavaScript and prove the diff contains only the authorized
   target-local budget statement.
8. Run packet artifact lint and JSON/scenario integrity checks.

## Complexity Tracking

None - the proposed implementation adds one target-local test statement and no
abstraction, dependency, configuration, or production path.
