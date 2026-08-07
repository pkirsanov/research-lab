# Design: BUG-001 Shared-Shell Suite Budget

## Design Brief

### Current State

`openNativeResearchSurface` in `tests/company-fundamentals-lab.spec.mjs` waits
for the ready shared shell through an expectation with no explicit timeout.
The supplied failure records the resulting 5-second expectation budget.

The helper then selects Power. It verifies `data-rlview="power"`, rejects a
lingering `rlv-focused` class, and requires visible detailed tabs.

The helper has eight call sites in one Feature 010 browser file. The supplied
four-worker suite failed at the first wait. The exact target and complete
owning file both passed serially with retries disabled.

### Target State

Give only the ready-shell visibility assertion a 30-second finite expectation
budget. Preserve the selector, action order, later assertions, all call sites,
and every product check.

### Patterns to Follow

- Keep readiness predicate-driven in
  `tests/company-fundamentals-lab.spec.mjs::openNativeResearchSurface`.
- Set the timeout on the single shell-ready `toBeVisible` assertion.
- Keep retries disabled.
- Validate the same target in focused, file-local, concurrent, and serial
  carriers.
- Compare the exact scoped diff before acceptance.

### Patterns to Avoid

- Do not change `playwright.config.mjs`.
- Do not add `test.slow()` or a containing test timeout.
- Do not add sleeps, retries, catches, interception, or optional assertions.
- Do not change product code or any other test.

### Resolved Decisions

- Adopt the helper-local readiness-budget diagnosis without technical
  amendment.
- Permit only `{ timeout: 30_000 }` on the shell-ready `toBeVisible` call.
- Preserve the eight helper call sites, Power interaction, three later state
  assertions, retries, workers, and `playwright.config.mjs`.
- Require focused, owning-file, four-worker, and serial carriers after the
  implementation owner applies the one-line change.
- Keep top-level status and certification `in_progress`.

### Open Questions

None. The complete-suite post-fix runs are falsification checks, not unresolved
design inputs.

## Adoption Decision

`bubbles.design` adopts the routed one-mechanism diagnosis and exact proposed
mutation without technical amendment. Current source inspection confirms one
shell-ready assertion without a local timeout, the subsequent Power click and
three direct state assertions, exactly eight helper call sites, and no
expectation-timeout override in `playwright.config.mjs`.

The supplied 276/277 suite result, focused 1/1 result, and owning-file 32/32
result remain interpreted packet evidence. This design invocation did not
rerun browser tests and makes no post-fix execution claim.

This adoption resolves `TR-BUG001-DESIGN` only. Planning adoption remains owned
by `bubbles.plan`, and implementation remains forbidden until that owner
reconciles the active scope and machine handoff.

## Concurrent Baseline Transition

The active complete-suite baseline is 280 tests across the unchanged 33-file
path set. `spec.md` records that acceptance baseline, and `report.md` grounds it
in the unrestricted system-Chrome discovery at commit
`923833254b9463cfb163cac2aace2b2fb305333b`. That additive commit introduces
exactly three tests in `tests/portfolio-survival-foundation.spec.mjs`.

This transition changes only active exact-count acceptance statements. The
supplied 276/277 RED carrier and other historical 277-test execution references
remain historical and unchanged. The commands, retries, worker profiles, root
cause, one-line fix, selector, interaction order, and assertions retain their
existing design contracts.

## Purpose and Scope

This design calibrates one existing browser-test readiness expectation under
shared-host contention. It changes no product behavior, route, data flow,
configuration, dependency, or user-visible contract.

## Architecture Overview

No product architecture changes. The existing helper remains the gate from the
Feature 010 tests into the native Power surface. Its shell-ready visibility
predicate remains decisive; only that predicate's finite wait budget changes.
All later interactions and assertions retain their current order and meaning.

## Investigation Summary

| Context | Result | Classification |
|---|---|---|
| Complete browser suite, four workers, retries 0 | 277 identities, 33 files, 276 passed, one failed | Confirms a suite-context acceptance failure |
| Exact SCN-010-007 target, one worker, retries 0 | 1/1 passed, target 1.2 seconds | Falsifies a deterministic product failure |
| Complete Feature 010 browser file, one worker, retries 0 | 32/32 passed, target 953 ms | Falsifies file-local leakage |

The same complete run passed BUG-005 Journey, BUG-006 tooltip, BUG-007 options,
and the BUG-007 19-tool sweep targets. Those packets do not own this failure.

## Controlling Path

`openNativeResearchSurface` performs these ordered actions:

1. Await `#rlviews[data-rlexperience-shell="ready"]`.
2. Click `#rlviews button[data-rlview-mode="power"]`.
3. Require `body[data-rlview="power"]`.
4. Require the body not to carry `rlv-focused`.
5. Require `[data-detailed-tabs]` to be visible.

Only step 1 lacks an explicit timeout. The failure occurred there. Steps 2
through 5 were not reached in the failed complete-suite target.

## Root Cause

The complete four-worker workload can delay browser script scheduling and shell
attachment beyond the helper's inherited 5-second expectation budget.

This is a suite-context helper-local readiness budget defect. The evidence does
not support a product defect, file-local leak, target-level timeout change, or
global timeout change.

## Why 30 Seconds

Thirty seconds is finite and six times the inherited expectation margin. It is
also the requested maximum without new evidence.

The isolated target and owning file are fast. They do not justify a larger
allowance. A 60-second helper wait would exceed the current evidence.

The same selector remains decisive. A missing shell still fails after the
finite 30-second bound.

## Falsifiable Local Hypothesis

If only the ready-shell assertion receives a 30-second timeout, the four-worker
and serial suites will pass 280/280. Every later assertion will remain
byte-identical.

The hypothesis is false if either complete suite fails. It is also false if a
second source or configuration change becomes necessary.

## Proposed Fix

In `tests/company-fundamentals-lab.spec.mjs`, change one line:

```diff
-    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible();
+    await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30_000 });
```

Do not change any other line in that file.

## Failure Semantics

The repair must preserve four independent failures:

1. A missing ready shell fails the explicit 30-second visibility assertion.
2. A wrong Power result fails the body `data-rlview` assertion.
3. A lingering focused class fails the negative class assertion.
4. Hidden detailed tabs fail the final visibility assertion.

No catch, fallback, conditional return, force, or optional locator may suppress
these failures.

## Change Boundary

| Surface | Decision |
|---|---|
| `tests/company-fundamentals-lab.spec.mjs` | Add `{ timeout: 30_000 }` to one shell-ready assertion only. |
| `openNativeResearchSurface` selector | Preserve exactly. |
| Power interaction and native guards | Preserve exactly. |
| Helper call sites | Preserve all eight. |
| `playwright.config.mjs` | No change. |
| Product and dependencies | No change. |
| Other packets and dirty paths | No change. |

## Local Helper Impact Sweep

The helper serves eight tests in one file. The full 32-test owning-file run is
the impact carrier for those call sites.

No shared fixture, global bootstrap, auth state, session state, or storage
contract changes. No cross-file canary is required.

## Data Model and Storage

None. The repair changes no data, schema, persistence, cache, or fixture.

## API and Product Contract Impact

None. No route, response, external integration, UI state, or user interaction
changes.

## Security and Privacy

None. The repair adds no request, credential, storage, or network behavior.

## Configuration and Dependencies

None. Playwright configuration and dependency manifests remain unchanged.

## Alternatives

| Alternative | Decision | Reason |
|---|---|---|
| Change global expectation timeout | Reject | It changes every browser assertion. |
| Add retries | Reject | Retries hide nondeterminism. |
| Add a fixed sleep | Reject | A sleep guesses readiness and adds unconditional delay. |
| Add `test.slow()` | Reject | The observed failure is one inner expectation budget. |
| Change product shell code | Reject | The focused target and complete file are green. |
| Change all helper assertions | Reject | Only the first wait controls the failure. |
| Use 60 seconds | Reject | Current evidence supports no value above 30 seconds. |
| Catch the timeout | Reject | Suppression would create a false green. |

## Testing and Validation Plan

1. Preserve the supplied 276/1 four-worker RED as interpreted evidence.
2. Run the exact SCN-010-007 title with one worker and retries disabled.
3. Run all 32 owning-file tests with one worker and retries disabled.
4. Run the complete suite with four workers and require 280/280.
5. Run the complete suite serially and require 280/280.
6. Run selftest, bugfix guard, syntax, exact-diff, and packet checks.

| Scenario | Validation carriers | Decisive assertion |
|---|---|---|
| SCN-B001-001 | Focused SCN-010-007 target, complete owning file, four-worker complete suite, serial complete suite | The shell becomes ready within 30 seconds and the unchanged Power-mode, focused-class, detailed-tabs, and comparability assertions all pass. |

The focused carriers prove product behavior. The four-worker suite is the
adversarial timing carrier. The serial suite checks deterministic execution.

## Risks and Open Questions

| Risk | Control |
|---|---|
| Thirty seconds remains insufficient under the required workload. | The four-worker suite rejects the design. Re-enter design before any broader timeout change. |
| A timing edit weakens product proof. | Exact diff and bugfix guard require every later assertion to remain unchanged. |
| Concurrent work is overwritten. | Permit one line in one clean target file. Compare scoped status and diff. |
| A test diagnosis hides a product defect. | Focused and full-file green runs must remain green. Any later product evidence reopens diagnosis. |

Open questions: None.

## Complexity Tracking

None - simplest viable approach used. This is one assertion-budget change in
one existing helper, so a new abstraction would add complexity without removing
duplication.
