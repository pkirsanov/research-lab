# Bug Fix Design: BUG-005 Journey Readiness Budget

## Investigation Summary

The diagnosis compared three execution contexts and the controlling source:

| Context | Result | Disposition |
|---|---|---|
| Complete browser suite, four workers | Preserved top-level failure at the 15-second mount wait | Confirms suite-context budget defect |
| Exact target alone | Top-level runner observed 1/1 pass | Product state can reach the unchanged predicate |
| Complete `tests/journey.spec.mjs`, one worker | 9/9 pass; target eighth in 3.1s | Falsifies same-file cumulative leakage |

`rlapp.js::mountJourney()` waits for three required JSON inputs and the shared
Journey runtime in one `Promise.all`, then constructs and mounts the controller.
Only after `controller.mount()` does it set the anchor to `ready` and publish
`__rljourneyController`. A rejected load sets `unavailable`, so simply allowing
more time cannot turn an unavailable state into a false ready state.

## Concurrent Baseline Transition

The active complete-suite baseline is 280 tests across the unchanged 33-file
path set. `spec.md` records that acceptance baseline, and `report.md` grounds it
in the unrestricted system-Chrome discovery at commit
`923833254b9463cfb163cac2aace2b2fb305333b`. That additive commit introduces
exactly three tests in `tests/portfolio-survival-foundation.spec.mjs`.

This transition changes only active exact-count acceptance statements.
Historical 277-test execution evidence remains historical and unchanged. The
commands, retries, worker profiles, root cause, bounded fix, selectors,
predicates, and assertions retain their existing design contracts.

## Root Cause

`tests/journey.spec.mjs::mountJourneyOnPage()` hard-codes a 15,000 ms wait for
all callers. The global Center case performs the heaviest registry-backed mount
and can be delayed by concurrent browser-suite work and host contention beyond
that fixed inner budget. The containing product state and predicate are correct;
the test-specific execution budget is not calibrated to the full-suite profile.

## Falsifiable Local Hypothesis

If the Center call alone receives a finite larger mount budget while the helper
predicate remains byte-equivalent, the complete-suite failure will disappear
and every wrong-state case will remain red.

The hypothesis is falsified if either complete-suite profile still times out,
if the Center reaches `unavailable`, or if any substantive assertion must be
relaxed to obtain green.

## Fix Design

### Smallest Mutation

1. Add one optional timeout argument to `mountJourneyOnPage`, defaulting to the
   existing 15,000 ms.
2. Pass a Center-specific finite budget from only
   `the Market Action Center remains the global journey surface`.
3. Select the Center wait from measured complete-suite readiness evidence. A
   30,000 ms inner-wait ceiling is the maximum proposed value. The containing
   test budget must remain strictly larger; use target-local `test.slow()` only
   when needed to preserve deterministic post-mount assertion time. If a
   30-second inner wait is insufficient, stop and route a production/performance
   investigation instead of widening it.
4. Keep the exact predicate unchanged: visible panel, ready mount, and live
   controller.
5. Keep every registry equality, uniqueness, and initial-order assertion.

### Proposed Mutation Boundary

Allowed:

- `tests/journey.spec.mjs`: helper timeout parameter and one Center call-site
  value only.

Excluded:

- `rlapp.js`, `rljourney.js`, `rlexperience.js`, all HTML, JSON registries,
  Playwright project configuration, retries, all Feature 004 artifacts, parent
  Feature 012 artifacts, and unrelated tests.

### No-Weakening Guard

The implementation review must compare the pre/post predicate and assertions.
Only the timeout value flow may differ. The target must still fail if:

- the panel remains hidden;
- the anchor never reaches `ready`;
- `__rljourneyController` is absent;
- the registry order omits or duplicates a tool;
- `market-brief` is not first.

## Alternatives Considered

| Alternative | Decision | Reason |
|---|---|---|
| Increase the helper timeout for every Journey test | Reject | It widens unrelated test budgets and hides the owning Center distinction. |
| Increase the whole Playwright project timeout | Reject | It changes 280-test behavior for one localized wait; any required outer-budget increase stays on the target through `test.slow()`. |
| Add retries | Reject | Retries conceal nondeterminism and violate the zero-retry acceptance profile. |
| Remove the controller or ready-state condition | Reject | That weakens the product contract and permits false green. |
| Add a fixed sleep before the wait | Reject | A sleep guesses readiness and adds latency without observing product state. |
| Change production loading | Reject | Focused and complete same-file runs show production reaches the correct state. |

## Regression Design

1. Preserve the exact target title and execute it focused with one worker and no
   retries.
2. Execute all 9 tests in `tests/journey.spec.mjs` serially to retain the
   same-file accumulation discriminator.
3. Execute the complete browser suite with four workers and retries disabled.
4. Execute the complete browser suite serially and retries disabled.
5. Run the bugfix regression-quality guard against `tests/journey.spec.mjs`.
6. Re-run `node scripts/selftest.mjs` to preserve the build-free project
   baseline.

The four-worker complete suite is the adversarial timing carrier: restoring the
old Center budget while preserving the same workload must reproduce the timeout.
The substantive predicate itself is protected by source review and the existing
target assertions; it may not be replaced by a timeout-only success signal.

## Complexity Tracking

None - the proposed change parameterizes one existing wait and changes one call
site. No abstraction, production path, dependency, or configuration is added.
