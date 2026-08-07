# Bug: BUG-005 Journey Readiness Budget Is Too Narrow Under Full-Suite Load

- **Bug ID:** BUG-005
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Reported:** 2026-08-04
- **Workflow mode:** `bugfix-fastlane`
- **Status:** Confirmed as a suite-context test-harness defect; implementation not started

## Summary

The Feature 012 browser regression `the Market Action Center remains the global
journey surface` can exhaust its fixed 15-second Journey mount wait during the
complete browser suite even though the same shipped Journey state becomes ready
unchanged in isolation and after every predecessor in `tests/journey.spec.mjs`.

The finding is limited to the readiness budget in the browser harness. No
evidence shows a Journey product-state defect, same-file state leak, registry
incompleteness, or controller failure.

## Severity

**Medium.** The product behavior and focused regression are green, but the
full-suite gate can fail deterministically under shared host load. That blocks
Feature 004 Scope 1 full-delivery evidence even though Feature 004 does not own
the failing test.

## Reproduction

### Full-suite context

Run the complete system-Chrome suite with retries disabled. The top-level runner
observed the Feature 012 case time out in `mountJourneyOnPage` after 15,000 ms
while waiting for all of these existing conditions:

1. the Journey panel is visible;
2. the shipped mount reports `data-rljourney-state="ready"`;
3. `globalThis.__rljourneyController` exists.

The same run's final summary reported one counted failure and 276 passes.

### Discriminating checks

From the repository root:

```bash
timeout 300 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0
```

Current result: all 9 same-file tests passed in 13.6 seconds; the target passed
eighth, after every same-file predecessor, in 3.1 seconds.

The top-level runner also executed the exact target alone and observed 1/1 pass.
Together these checks falsify same-file cumulative state leakage. They do not
erase the preserved full-suite failure.

## Expected Behavior

The exact Journey regression must pass inside both the four-worker and serial
complete browser-suite profiles with retries disabled. It must continue to wait
for the visible panel, ready mount, and live controller before comparing the
Center's Journey tool order with the complete registry. Both complete-suite
profiles must retain and pass all 280 current browser identities across the
unchanged 33-file path set.

## Actual Behavior

Under complete-suite host load, the fixed 15-second inner wait can expire before
the real asynchronous mount finishes. In focused and complete same-file runs,
the identical predicate reaches ready and every registry assertion passes.

## Environment

- Repository revision at diagnosis: `7074a6c32e4180a68949d2f3a4795076616bde85`
- OS: Linux
- Browser project: committed `system-chrome`
- Playwright: 1.61.1
- Retries: 0

## Concurrent Baseline Reconciliation

At current repository HEAD `923833254b9463cfb163cac2aace2b2fb305333b`,
commit `92383325` has additively introduced three browser-test identities in
`tests/portfolio-survival-foundation.spec.mjs` without deleting an identity.
The top-level runner's unrestricted system-Chrome list now reports 280 tests in
33 files. The active complete-suite acceptance baseline is therefore 280
identities across 33 files.

Any earlier 277-identity output in this packet remains historical execution
evidence and is not rewritten. The count reconciliation changes no command,
retry setting, worker profile, root cause, code fix, assertion, or behavior
requirement.

## Root Cause

`mountJourneyOnPage` applies one fixed 15-second wait to every caller. The global
Center case performs the shipped Journey mount, whose production path waits for
three required JSON inputs plus the shared `rljourney.js` runtime, constructs and
mounts the controller, then publishes `ready` and the controller. Under broad
suite contention that real async work can exceed the helper's fixed budget.

The wait predicate is correct. The budget is not scoped to the heavier global
Center case and is too narrow for the complete-suite execution environment.

## Intraday Expected-Failure Disposition

The separate intraday Simple adapter test is not a bug from this run. Focused
Playwright JSON reports:

- `expectedStatus: "failed"`;
- actual result `status: "failed"` at the visible-sensitivity assertion;
- aggregate test `status: "expected"`;
- stats `expected: 1`, `unexpected: 0`.

The baseline and changed Simple text remain byte-identical, so the
`test.fail(true, ...)` marker is still active and Playwright excludes it from
the counted failures. No stale-marker packet is created.

## Work Boundary

This packet permits a surgical test-harness change only in
`tests/journey.spec.mjs`. It excludes production JavaScript, HTML, registries,
Feature 004 artifacts, parent Feature 012 artifacts, unrelated tests, and all
certification fields.

## Related Contracts

- [Feature 012 design](../../design.md), Journey browser ownership
- [Feature 012 Scope 08](../../scopes/08-journey-runtime-definitions/scope.md)
- [Bug specification](spec.md)
- [Fix design](design.md)
- [Fix scope](scopes.md)
- [Execution evidence](report.md)
