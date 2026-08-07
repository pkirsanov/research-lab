# Design: BUG-007 Shared-Shell Suite Budget

## Design Brief

### Current State

The four-worker system-Chrome suite has two counted failures after BUG-005 and
BUG-006 turned their Journey and contextual-tooltip targets green. Both failing
targets pass in focused one-worker runs with retries disabled, while their
behavior assertions remain decisive.

`tests/simple-production-wiring.spec.mjs` gives TP-15-04 a 900,000 ms outer
budget, but its single-use `openAndAwaitOwnerEvidence` helper has two 30,000 ms
readiness waits. `tests/tool-experience.spec.mjs` gives the named BUG-001
options-flow target no local containing allowance, so it inherits Playwright's
finite default test budget.

### Target State

Calibrate only the budget that controls each observed failure. The owner-parity
helper receives 60,000 ms shell-ready and provider-registration waits. The
options-flow target receives one target-local `test.slow()` statement before
its existing setup.

The change preserves every product behavior, selector, predicate, request,
interaction, and assertion. It also preserves retries at zero and leaves the
global Playwright configuration unchanged.

### Patterns to Follow

- Keep readiness predicate-driven in `openAndAwaitOwnerEvidence`; only its two
	finite readiness margins change.
- Use Playwright's target-local slow annotation for the one options-flow target
	whose containing budget failed.
- Validate with the exact focused targets, both owning files, and the same
	four-worker and serial complete-suite carriers declared in `scopes.md`.
- Use an exact diff check to protect concurrent dirty work and excluded files.

### Patterns to Avoid

- Do not change `playwright.config.mjs`, retries, workers, or global timeouts.
- Do not add sleeps, interception, catches, bailout returns, optional
	assertions, or forced interactions.
- Do not change product code or reopen terminal BUG-001 history because both
	controlling product paths pass their focused discriminators.

### Resolved Decisions

- Treat F-BUG007-001 as a helper-local inner readiness-budget defect.
- Treat F-BUG007-002 as a target-local containing-budget defect.
- Adopt exactly two 30,000 to 60,000 ms replacements and one first-statement
	`test.slow()` insertion.
- Keep the 600,000 ms hydration boundary, 60,000 ms owner poll, 500 ms polling
	interval, and 900,000 ms TP-15-04 outer budget unchanged.
- Keep status and certification `in_progress` until implementation, complete
	acceptance, audit, and validate-owned certification occur.

### Open Questions

None. The complete-suite post-fix runs are falsification checks, not unresolved
design inputs.

## Adoption Decision

`bubbles.design` adopts the routed two-mechanism root cause and exact proposed
mutation without technical amendment. Current source inspection confirms the
single helper call site, both helper-local 30,000 ms waits, the protected
deadlines, the target-local options insertion point, the absence of a global
budget override, and terminal BUG-001 state.

This adoption resolves `TR-BUG007-DESIGN` only. Planning adoption remains owned
by `bubbles.plan`, and implementation remains forbidden until that owner
reconciles the active scope and machine handoff.

## Concurrent Baseline Transition

The active complete-suite baseline is 280 tests across the unchanged 33-file
path set. `spec.md` records that acceptance baseline, and `report.md` grounds it
in the unrestricted system-Chrome discovery at commit
`923833254b9463cfb163cac2aace2b2fb305333b`. That additive commit introduces
exactly three tests in `tests/portfolio-survival-foundation.spec.mjs`.

This transition changes only active exact-count acceptance statements.
Historical 277-test execution evidence remains historical and unchanged. The
commands, retries, worker profiles, two-mechanism root cause, exact three-edit
fix, selectors, predicates, interactions, and assertions retain their existing
design contracts.

## Purpose and Scope

This design makes two existing real-page browser regressions tolerant of
shared-host scheduling contention without changing what either regression
proves. The implementation surface is limited to two timeout literals in one
single-use helper and one local statement in one named target.

## Investigation Summary

| Context | Result | Classification |
|---|---|---|
| Complete browser suite, four workers, retries 0 | 275 passed, 2 failed in 6.0 minutes | Confirms suite-context acceptance failures |
| Exact TP-15-04 sweep, one worker, retries 0 | 1/1 passed in 4.3 minutes; all 19 tools green | Falsifies deterministic product failure for F-BUG007-001 |
| Exact BUG-001 options target, one worker, retries 0 | 1/1 passed in 14.3 seconds; all 12 requests green | Falsifies deterministic product failure for F-BUG007-002 |

The Journey and contextual-tooltip targets passed in the same complete run.
Their BUG-005 and BUG-006 packets do not own these remaining failures.

## Controlling Paths

### TP-15-04

`openAndAwaitOwnerEvidence` performs these ordered waits:

1. navigate to the real tool page;
2. await `#rlviews[data-rlexperience-shell="ready"]` for 30,000 ms;
3. await owner-provider registration for 30,000 ms;
4. retain the 600,000 ms declared hydration boundary;
5. retain the 60,000 ms owner-state polling deadline;
6. drive every owner-parity and native-demotion assertion.

The helper has one call site, inside the long TP-15-04 sweep. The target already
has a 900,000 ms outer budget. The failure therefore belongs to the helper's
inner readiness margin.

### BUG-001 options-flow target

The target observes native fetch starts without interception. It proves cache
paint and shell readiness at the first delta. It then awaits all 12 distinct
option requests and checks shell, tabs, panels, and real navigation.

The target has no local outer allowance. It inherits Playwright's finite
30-second test timeout because `playwright.config.mjs` defines no override.

## Root Cause

The shared four-worker workload delays browser script scheduling and page work.
Two tests have finite budgets sized too close to their isolated durations.

F-BUG007-001 is an inner readiness budget defect. Shell readiness remains a
synchronous truth predicate. Increasing the wait does not make an unready shell
pass.

F-BUG007-002 is a containing test budget defect. Target-local `test.slow()`
adds finite execution margin without changing locator or assertion timeouts.

## Architecture Overview

The repair changes no application architecture. It calibrates two independent
test-harness control paths:

1. TP-15-04 owns a long outer test budget and delegates page readiness to
	`openAndAwaitOwnerEvidence`. Suite contention can exhaust either helper-local
	readiness wait before the outer budget becomes relevant.
2. The options-flow target performs native fetch observation and all assertions
	inside the containing Playwright test budget. Suite contention can exhaust
	that containing budget even though no individual predicate has failed.

The mechanisms must remain separate. Applying `test.slow()` to TP-15-04 would
not address its explicit inner waits. Raising helper waits cannot extend the
options target's containing deadline.

## Falsifiable Local Hypothesis

If the two helper waits become 60 seconds and only the options target becomes
slow, both complete-suite profiles will pass all 280 identities. Every existing
assertion will remain byte-identical.

The hypothesis is false if either complete suite fails, any assertion changes,
or any additional timeout or product surface must change.

## Proposed Fix

### Mutation 1

In `tests/simple-production-wiring.spec.mjs`, change exactly these two arguments:

```diff
-  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });
+  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 60000 });
...
-    { timeout: 30000 }
+    { timeout: 60000 }
```

Do not change the selector, provider predicate, hydration wait, owner-state
deadline, polling interval, target budget, or assertions.

### Mutation 2

In `tests/tool-experience.spec.mjs`, add one first statement:

```diff
 test('Regression: BUG-001 options flow shell is ready before heavy hydration begins', async ({ page }) => {
+  test.slow();
```

Do not change the init script, native fetch forwarding, ready predicates,
request counts, shell checks, panel checks, tabs, or navigation.

## Change Boundary and Preserved Contracts

| Surface | Active design decision |
|---|---|
| `tests/simple-production-wiring.spec.mjs` | Change only the two `timeout: 30000` arguments inside `openAndAwaitOwnerEvidence` to `timeout: 60000`. |
| `tests/tool-experience.spec.mjs` | Add only `test.slow();` as the first statement in the named BUG-001 options-flow target. |
| Readiness semantics | Preserve the shell selector and owner-provider registration predicate exactly. |
| Hydration and polling | Preserve 600,000 ms hydration, 60,000 ms owner polling, and 500 ms polling interval. |
| Outer budget | Preserve TP-15-04 at 900,000 ms. |
| Behavioral proof | Preserve init, native fetch forwarding, request ordering and count, shell, tab, panel, navigation, owner-parity, native-demotion, and honest-unavailable assertions. |
| Excluded surfaces | No product, dependency, global config, retry, worker, sleep, interception, catch, bailout, optional assertion, forced interaction, historical BUG-001, sibling packet, parent feature, or certification change. |

## Data Model and Storage

None. The repair changes test execution budgets only and introduces no entity,
schema, persistence, cache, fixture, or migration.

## API and Product Contract Impact

None. No route, request shape, response shape, provider contract, production
fetch behavior, UI state, or user-visible interaction changes.

## Security, Privacy, and Compliance

The options regression continues to wrap and forward native `fetch` without
interception. No credential, storage, authorization, network destination, or
privacy boundary changes. Catch-based timeout suppression remains forbidden.

## Configuration and Migrations

None. `playwright.config.mjs`, dependencies, product configuration, and all
migration surfaces remain unchanged.

## Observability and Failure Handling

All failure paths remain fail-loud. A missing shell, missing provider,
incomplete hydration, owner-parity mismatch, request-count mismatch, or UI
assertion still fails its test. Retries remain disabled, so the complete-suite
result continues to expose nondeterminism instead of masking it.

## Preserved Deadlines

| Deadline | Value | Decision |
|---|---:|---|
| Declared hydration boundary | 600,000 ms | Keep unchanged |
| Owner-state polling deadline | 60,000 ms | Keep unchanged |
| TP-15-04 outer test budget | 900,000 ms | Keep unchanged |
| Polling interval | 500 ms | Keep unchanged |
| Global Playwright timeout | Framework default | Keep unchanged |

## Alternatives and Tradeoffs

| Alternative | Decision | Reason |
|---|---|---|
| Change `playwright.config.mjs` | Reject | It changes all 280 identities. |
| Add retries | Reject | Retries hide nondeterminism. |
| Add fixed sleeps | Reject | Sleeps guess readiness and add unconditional latency. |
| Increase the 600,000 ms hydration deadline | Reject | The observed failure occurred before that boundary. |
| Increase the 60,000 ms owner-state deadline | Reject | The shell-ready wait failed first. |
| Remove or relax assertions | Reject | That would weaken product truth. |
| Catch timeout errors | Reject | Suppression would convert failure into false green. |
| Change product code | Reject | Both exact product paths pass in isolation. |
| Reopen BUG-001 | Reject | BUG-001 is certified terminal history. |

## Testing and Validation Strategy

1. Preserve the supplied four-worker pre-fix RED as interpreted evidence.
2. Run each exact target with one worker and retries disabled.
3. Run both owning files serially with retries disabled.
4. Run the complete suite with four workers and require 280/280.
5. Run the complete suite serially and require 280/280.
6. Run the repository selftest and both bugfix regression guards.
7. Parse both test modules.
8. Prove the exact diff contains only three authorized edits.
9. Run packet artifact lint and control-plane integrity checks.

| Scenario | Validation carriers | Decisive assertion |
|---|---|---|
| SCN-B007-001 | Focused TP-15-04, complete owning file, four-worker suite, serial suite | All 19 derived tools retain owner parity, native demotion, and honest-unavailable behavior. |
| SCN-B007-002 | Focused BUG-001 target, complete owning file, four-worker suite, serial suite | First delta starts after cache-first owner paint and shell readiness; all 12 requests plus shell, tab, panel, and navigation assertions remain green. |

The focused runs prove each behavior path. The four-worker complete suite is the
adversarial timing carrier. The serial complete suite checks that local budget
annotations do not disturb deterministic execution. None may substitute for
another.

## Risks and Open Questions

| Risk | Design control |
|---|---|
| The new finite margin remains insufficient under the required workload. | TP-B007-05 and TP-B007-06 falsify the design; any broader change requires design re-entry rather than another unplanned timeout increase. |
| A timing edit weakens behavioral proof. | TP-B007-01 through TP-B007-04 retain the exact predicates and assertions, and TP-B007-11 restricts the diff to three edits. |
| Concurrent dirty work is overwritten or absorbed. | Implementation is restricted to the two clean target files and must compare the exact scoped diff without reverting any other path. |
| A test-only diagnosis hides a product defect. | Both exact targets already pass focused with all behavior assertions; post-fix complete-suite failures remain blocking and must be diagnosed rather than suppressed. |

Open questions: None.

### Single-Implementation Justification

This is a narrow test-harness bug fix inside two existing tests. It introduces
no new provider, adapter, strategy, plugin, channel, driver, connector,
component variant, shared product contract, or reusable capability. A new
foundation would add abstraction without removing any real complexity.

## Complexity Tracking

None - simplest viable approach used. The implementation changes two literals
and adds one target-local statement.
