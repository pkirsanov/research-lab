# Bug: BUG-007 Shared-Shell Tests Exhaust Suite-Context Budgets

- **Bug ID:** BUG-007
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Reported:** 2026-08-04
- **Workflow mode:** `bugfix-fastlane`
- **Status:** Confirmed as two test-harness budget defects; no implementation started

## Summary

Two shared-shell browser tests fail only inside the complete four-worker suite.
Both exact targets pass with one worker and retries disabled.

The first failure is the TP-15-04 owner-parity sweep. Its outer test budget is
900 seconds, but its single-use page-opening helper has two 30-second inner
readiness waits. The shell-ready wait expired under suite contention.

The second failure is the BUG-001 options-flow startup-ordering regression. It
inherits Playwright's 30-second containing test budget. That outer budget
expired while the test awaited the ready shell count under the same workload.

Current evidence supports test-harness budget defects. It does not demonstrate
a product failure. Every existing readiness predicate and behavior assertion
must remain unchanged.

## Severity

**Medium.** Product behavior passes both focused discriminators, but the
complete browser acceptance gate remains red under its required concurrency.

## Active-Packet Decision

One exact Feature 012 packet search found BUG-001 through BUG-006.

- BUG-001 is terminal and certified `done`. This packet does not rewrite it.
- BUG-005 owns the Journey readiness target, which is now green.
- BUG-006 owns the contextual-tooltip target, which is now green.
- No active packet owns these two remaining failures.

BUG-007 is the next sequential packet. One combined packet is coherent because
both findings concern finite test-harness budgets around shared-shell readiness
under the same four-worker acceptance workload. Each mechanism remains a
separate finding and scenario.

## Reproduction

From the Research Lab repository root, run the complete system-Chrome suite:

```bash
timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0
```

The supplied current run discovered 277 identities across 33 files. It finished
with 275 passed and two counted failures after 6.0 minutes.

### Failure 1

- File: `tests/simple-production-wiring.spec.mjs`
- Line: 845 at discovery time
- Title: `TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact`
- Failure point: `openAndAwaitOwnerEvidence` shell-ready wait
- Inner timeout: 30,000 ms
- Outer target budget: 900,000 ms
- Focused discriminator: 1/1 passed with one worker and retries disabled
- Focused target duration: 4.3 minutes
- Focused command duration: 4.4 minutes
- Sweep result: all 19 tools and all owner-parity assertions passed

### Failure 2

- File: `tests/tool-experience.spec.mjs`
- Line: 258
- Title: `Regression: BUG-001 options flow shell is ready before heavy hydration begins`
- Failure point: ready shell count inside the containing test deadline
- Containing timeout: 30,000 ms
- Focused discriminator: 1/1 passed with one worker and retries disabled
- Focused target duration: 14.3 seconds
- Focused command duration: 17.0 seconds
- Ordering result: all 12 delta starts and shell assertions passed

## Expected Behavior

Both targets must pass focused, same-file, four-worker complete-suite, and
serial complete-suite profiles with retries disabled. All 280 current browser
identities must pass in each complete-suite profile.

## Actual Behavior

Both targets pass alone. Their finite inner or containing budgets can expire
when the complete suite shares the host across four workers.

## Concurrent Baseline Reconciliation

At current repository HEAD `923833254b9463cfb163cac2aace2b2fb305333b`,
commit `92383325` has additively introduced three browser-test identities in
`tests/portfolio-survival-foundation.spec.mjs` without deleting an identity.
The top-level runner's unrestricted system-Chrome list now reports 280 tests in
33 files. The active complete-suite acceptance baseline is therefore 280
identities across 33 files.

The 277-identity reproduction above remains a historical execution fact and is
not rewritten. The count reconciliation changes no command, retry setting,
worker profile, root cause, code fix, assertion, or behavior requirement.

## Root Cause Classification

### F-BUG007-001: helper-local inner budget

`openAndAwaitOwnerEvidence` is used once by the long TP-15-04 sweep. The helper
waits 30 seconds for the ready shell and 30 seconds for owner-provider
registration. Its source comment states that shell readiness is synchronous
once the shell is built. A longer finite wait tolerates delayed script start.
It does not weaken the ready-state predicate.

### F-BUG007-002: target-local containing budget

The options-flow target has no target-local outer allowance. It inherits the
finite 30-second Playwright test timeout. Its focused duration leaves limited
margin for four-worker host contention.

## Exact Mutation Boundary

Future implementation may change only these lines:

1. In `tests/simple-production-wiring.spec.mjs`, change both `timeout: 30000`
   arguments inside `openAndAwaitOwnerEvidence` to `timeout: 60000`.
2. In `tests/tool-experience.spec.mjs`, add `test.slow();` as the first
   statement inside only the named BUG-001 regression.

The implementation must keep these values and behaviors unchanged:

- the 600,000 ms hydration deadline;
- the 60,000 ms owner-state polling deadline;
- every selector, predicate, interaction, and assertion;
- the 900,000 ms TP-15-04 outer budget;
- global Playwright configuration and zero retries.

The boundary excludes production, configuration, dependencies, retries,
fixed sleeps, interception, catches, bailout returns, optional assertions,
forced interactions, BUG-005, BUG-006, Feature 004, BUG-002, parent Feature
012 artifacts, and unrelated dirty work.

## Related Contracts

- [Bug specification](spec.md)
- [Routed fix design](design.md)
- [Routed fix scope](scopes.md)
- [Execution evidence](report.md)
