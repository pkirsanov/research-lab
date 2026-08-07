# Bug: BUG-006 Contextual Tooltip Mobile Test Exhausts Its Full-Suite Budget

- **Bug ID:** BUG-006
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Reported:** 2026-08-04
- **Workflow mode:** `bugfix-fastlane`
- **Status:** Confirmed as a suite-context test-harness defect; implementation not started

## Summary

The mobile contextual-disclosure regression in
`tests/contextual-tooltip.spec.mjs` can exhaust Playwright's default 30-second
containing test budget during the complete four-worker browser suite. The
failure occurred on the second real close-button interaction while Playwright
was waiting for the close control to become visible, enabled, and stable.

Every substantive assertion before that interaction had completed, including
the first touch-open path, sheet geometry, Escape close, and focus restoration.
The exact target passes in isolation, and all three tests in the owning file
pass serially. Current evidence therefore supports a suite-contention outer
budget defect rather than a deterministic product defect or file-local leak.

## Severity

**Medium.** The shipped interaction passes focused and same-file execution, but
the complete browser acceptance gate can fail under its normal four-worker
profile. The failure blocks trustworthy acceptance even though no product
behavior regression is currently demonstrated.

## Reproduction

From the Research Lab repository root, run the complete system-Chrome suite
with the committed four-worker profile and retries disabled:

```bash
timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=4 --retries=0
```

The top-level runner observed:

1. discovery remained 277 test identities across 33 files;
2. the identity digest remained
   `832a7e0b84d07af9b8da6bb580cb3bf3efc128a7abf713cabb456d9433e368d6`;
3. 276 tests passed and one test failed after 8.8 minutes;
4. the sole failure was
   `Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas`;
5. Playwright exhausted the 30,000 ms test timeout at the real close-button
   click after the second disclosure open path.

## Discriminating Checks

The exact failed title passed 1/1 with one worker and retries disabled. The
complete `tests/contextual-tooltip.spec.mjs` file also passed 3/3 serially with
retries disabled. The focused target consumed about 15.4 seconds, roughly half
of its default containing budget before full-suite contention is added.

These checks falsify a deterministic product failure and file-local cumulative
state leakage. They do not erase the complete-suite failure, and they do not by
themselves exclude every possible cross-file or host-contention effect.

## Expected Behavior

The mobile contextual-disclosure regression must complete in the focused,
same-file, four-worker complete-suite, and serial complete-suite profiles with
retries disabled. Both complete-suite profiles must retain and pass all 280
current browser identities across the unchanged 33-file path set. The target
must continue to exercise real actionability and preserve all current
interaction, geometry, focus, fallback, and failure-path checks.

## Actual Behavior

Under the complete four-worker workload, the containing 30-second test budget
can expire while the second close button is undergoing Playwright's real
actionability checks. The same product behavior and assertions complete in
focused and same-file execution.

## Environment

- Repository revision at diagnosis: `17ee5f56ff08ea63380b4a2708ac6a53571cb7d0`
- Target test pre-fix blob: `aee8568200fa2ccd6020276386c7d58813cead91`
- OS: Linux
- Browser project: committed `system-chrome`
- Playwright: 1.61.1
- Retries: 0
- Complete-suite workers: 4

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

## Root Cause

`playwright.config.mjs` does not override Playwright's finite default 30-second
test timeout. The affected target performs two real mobile disclosure cycles,
sheet geometry checks, two focus-restoration paths, and a separate no-canvas
page fallback. Under shared four-worker load, those valid operations can consume
the containing test budget before the second real close click finishes.

The failed operation is not an explicit inner readiness wait. It is a real
locator click waiting for actionability at the end of the containing budget.
The smallest supported repair is therefore a finite target-local outer budget,
preferably `test.slow()` at the start of this target only.

## Work Boundary

Packet creation is limited to this BUG-006 directory. The future implementation
may change only `tests/contextual-tooltip.spec.mjs`, and only to add a finite
outer budget to the named mobile disclosure target.

The boundary excludes BUG-005, Feature 004, BUG-002, parent Feature 012
artifacts, product JavaScript, HTML, JSON data, Playwright configuration,
dependencies, unrelated tests, retries, and certification fields.

## Related Contracts

- [Bug specification](spec.md)
- [Fix design](design.md)
- [Fix scope](scopes.md)
- [Execution evidence](report.md)
