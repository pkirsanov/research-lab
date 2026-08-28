# Spec: BUG-023 — Disclosure Cost Must Be Measured Against Work Outstanding, Not Against Silence

## Problem

`tests/market-brief-cockpit.spec.mjs:301` measures what expanding a block puts on the wire. To
do that it must first know the page's own load has finished. It infers that from a single 500 ms
interval with no new request.

The live layer's request stream is bursty. A lull wider than 500 ms occurs inside a normal load
— 2001 ms was measured — so the inference is unsound, and the requests that follow the lull are
attributed to an expansion that had not happened yet.

## What Must Remain True

The invariant under test is correct and must survive any fix.

- **FR-1.** Expanding any `details[data-mac-block]` MUST NOT cause an off-origin request.
- **FR-2.** Expanding any block MUST NOT cause a credentialed request, on any origin.
- **FR-3.** A block that defers its own artifact fetch until opened MUST still be allowed to do
  so. The invariant is origin, not count. A fix that asserts zero requests is a regression of
  the disclosure-first design.
- **FR-4.** The page MUST continue to load from a `file://` origin with no server and no build
  step.

## What Must Change

- **FR-5.** The verdict MUST NOT depend on the width of any lull in the live layer's request
  stream. A load that pauses is not a load that finished.
- **FR-6.** The test MUST distinguish "the page's own load is still outstanding" from "the page
  has settled" by something other than elapsed silence.
- **FR-7.** If the page's load cannot be shown to have completed, the test MUST fail loudly on
  that condition and name it, rather than proceeding to measure and reporting the shortfall as
  an off-origin violation. A test that cannot establish its precondition has not measured its
  subject.
- **FR-8.** The fix MUST NOT weaken FR-1..FR-4, and MUST NOT be a retry, a longer sleep, or a
  wider quiet window. Each of those trades one flake rate for another without making the
  measurement sound.

## Scenarios

```gherkin
# SCN-023-01
Scenario: a lull inside the live layer's load does not count as settled
  Given the page's live layer issues its requests in batches separated by a lull wider than the quiet window
  When the test establishes its baseline
  Then the baseline is not taken until the live layer has no work outstanding
  And no request belonging to the live layer is attributed to a block expansion

# SCN-023-02
Scenario: the disclosure invariant still holds
  Given the page has fully settled
  When every block is expanded in turn
  Then no off-origin request is issued
  And no credentialed request is issued

# SCN-023-03
Scenario: a deferred artifact fetch is still permitted
  Given a block that defers its own artifact fetch until it is opened
  When that block is expanded
  Then the request it issues is on the file:// origin
  And the test passes

# SCN-023-04
Scenario: an unestablished precondition fails as itself
  Given the page's load cannot be shown to have completed within the declared bound
  When the test runs
  Then it fails naming the unmet precondition
  And it does not report an off-origin violation
```

## Out Of Scope

- The cause of the lull. This spec makes the measurement robust to a lull; it does not undertake
  to remove it.
- Any change to the cockpit page itself. The page is not implicated.
- `BUG-017`'s worker-teardown failure, which shares the suite but not the mechanism.

## Product Principle Alignment

- **P9 — Access without keys or accounts.** The invariant this test guards is exactly that
  promise, which is why the test is worth repairing rather than deleting.
- **P17-P19 / P23 — a guard must be able to fail for its own reason.** A guard that goes red on
  network weather is not discriminating; a guard that cannot establish its precondition and
  reports a different failure is actively misleading. FR-7 exists for that reason.

## Offline-Only Compatibility

`fully-offline` — the subject under test is a `file://` load with no server. Nothing here
introduces a network dependency; the defect is that unrelated network activity is misattributed.
