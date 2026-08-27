# Design: BUG-017 - Rollback-Gated One-Worker Fallback

> **Active design status:** The Foundation lifecycle candidate is rejected and hash-verified as
> rolled back. The selected route pins one worker while preserving system-Chrome parity and the
> unchanged worker-stop budget. Worker count remains an exposure control, not a root-cause claim.

## Scope 4 Fallback Selection

The candidate passed an earlier strict canary and exact complete run. Two later strict canaries
failed at the same committed bytes. Foundation's browser close timed out, and one worker required
force-kill at the 15-second test bound.

Commits `047292eb2` and `af119275a` reverse the candidate test and implementation commits.
The resulting Foundation and runtime-functional blobs match the pre-candidate baseline. The
fallback changes the repository default from two workers to one. It does not change the browser
project, Chrome channel, vendor stop budget, reporter, or force-kill visibility.

Two complete config-default runs selected this route. Each resolved one worker, passed 94 tests,
exited zero, emitted no force-kill marker, and left no workload-owned residue. This section
supersedes later present-tense descriptions of the Foundation lifecycle candidate.

## Design Brief

### Current State

`tests/portfolio-survival-foundation.spec.mjs` again uses the shared Playwright `test` and closes
only its HTTP server in `afterAll`. Exact blob comparison confirms the lifecycle candidate is
absent. The historical diagnosis found that the cumulative Foundation sequence can leave a
worker holding two anonymous `Socket` handles after Chrome exits.

The exact 94-test `system-chrome` workload failed two of two times at workers=2 after all tests
passed. It passed two of two times at workers=1. Those samples establish exposure, not a worker
count threshold or a worker-count cause.

### Target State

The repository resolves one worker from `playwright.config.mjs`. The exact BUG-022 C03 command
uses that default without a CLI override. System Chrome and its unchanged 300000ms worker-stop
budget remain visible. A force-kill still makes the command fail.

### Patterns to Follow

- Keep Foundation, Paths, and the shared Playwright runtime at pre-candidate bytes.
- Pin the selected worker value in `playwright.config.mjs` and its functional assertions.
- Preserve BUG-022 TP-BUG022-C03's exact command and the `system-chrome` project.
- Preserve force-kill visibility and the vendor's 300000ms worker-stop budget.

### Patterns to Avoid

- Do not restore the rejected Foundation browser-close candidate.
- Do not claim that one worker removes the upstream cause.
- Do not close a shared browser without a distinct worker fixture pool. Paths then receives a
   closed browser and fails its first test.
- Do not close the browser from worker-fixture teardown. That timing enters the stuck vendor
   teardown path it is meant to avoid.
- Do not switch to bundled Chromium, raise the 300000ms budget, or hide teardown errors.

### Resolved Decisions

- The Foundation lifecycle candidate failed current finalization and is rejected.
- Candidate rollback must preserve its prior evidence commits.
- Foundation and its candidate test must match their pre-candidate blobs before fallback work.
- The selected fallback changes only the default worker count and its durable assertions.
- The browser project, Chrome channel, timeout, and force-kill behavior remain unchanged.

### Open Questions

- No question blocks this design reconciliation.
- The owner still must record the acceptable FR-017-004 wall-time multiple before terminal
   acceptance. That value does not change the lifecycle acceptance gates below.

### Single-Implementation Justification

This is a narrow bug fix inside Playwright's existing fixture model. It adds no browser provider,
runner, shared lifecycle API, or second implementation. A repository-wide browser-lifecycle
abstraction would increase the blast radius beyond the one file that reproduces the retained
handles. The file-local derived fixture is the smallest owning boundary that separates
Foundation from later base-test specs.

## Purpose And Scope

This design selects and bounds the repository-level lifecycle candidate identified by the
current stabilization evidence. It does not claim ownership of the two anonymous sockets or
diagnose Chromium's transport internals.

The design changes test-runner lifecycle only. It does not change portfolio behavior, scenario
assertions, page data, HTTP responses, browser-project selection, or the pipeline command. The
red deploy failure remains owned by BUG-016 and is not part of this remedy.

## Active Root-Cause Model

The actionable boundary is the cumulative Foundation workload's browser lifetime:

| Current observation | Design interpretation |
| --- | --- |
| The 94-test workload failed 2/2 at workers=2 and passed 2/2 at workers=1. | Concurrency modulates exposure. It does not establish causality or a safe threshold. |
| A failure occurred with start load 8.90 as well as 32.14. | Host load is neither necessary nor sufficient in the measured sample. |
| Foundation retained two anonymous `Socket` handles after Chrome exited; no Foundation HTTP server or Chrome process remained. | The live boundary is browser transport release inside the Foundation worker, not server cleanup or Chrome-process residue. |
| Foundation alone reproduced; the first 13 rows closed, while the cumulative sequence through row 14 stalled. The row alone closed. | The trigger is cumulative Foundation state through `SCN-008-042`, not that scenario in isolation. |
| Playwright logged its normal teardown stages complete, then the worker remained alive until force-kill. | The retained handles survive into generic worker stop after test execution and nominal vendor teardown. |
| Early browser close plus a distinct worker boundary let Foundation followed by Paths pass 27/27 and both workers exit within 15 seconds. | The focused candidate attacks the earliest repository-owned lifecycle boundary and prevents a later spec from inheriting the closed browser. |

The underlying socket owner remains unestablished. That uncertainty limits the causal claim but
does not require another mechanism menu before testing the focused repository-owned candidate.
The complete 94-test run remains the discriminator between a focused improvement and a remedy.

## Lifecycle Architecture

### Current Flow

1. Foundation imports the shared Playwright `test` from `tests/playwright-runtime.mjs`.
2. Playwright creates a worker-scoped browser and test-scoped contexts/pages.
3. Foundation completes its tests and closes only its HTTP server in `afterAll`.
4. Playwright enters generic worker-fixture teardown and attempts to close the browser transport.
5. After the cumulative trigger, anonymous sockets can keep the worker alive until force-kill.

### Rejected Candidate Flow (Historical)

1. Foundation imports the existing `test` as `baseTest`.
2. Foundation defines a local derived `test` with one automatic worker-scoped
    `foundationBrowserBoundary` fixture.
3. The fixture receives the existing `browser`, records it in the module-owned
    `foundationBrowser` reference, and awaits `use()` without creating another browser.
4. Every existing Foundation hook and test continues to use the local derived `test`.
   Individual test signatures do not gain a required fixture parameter.
5. Foundation's existing `afterAll` awaits `foundationBrowser.close()` before its existing server
    close and before Playwright begins worker-fixture teardown.
6. The browser close is neither caught nor converted to success. A rejection or hook timeout
    remains a visible run failure.
7. Paths and every other untouched spec continue to import the base `test`. Their fixture pool
    differs from Foundation's derived pool, so Playwright starts a fresh worker/browser boundary
    instead of reusing Foundation's closed browser.

The intended implementation shape is:

```js
import { expect, test as baseTest } from './playwright-runtime.mjs';

let foundationBrowser;
const test = baseTest.extend({
   foundationBrowserBoundary: [async ({ browser }, use) => {
      foundationBrowser = browser;
      await use();
   }, { auto: true, scope: 'worker' }]
});

test.afterAll(async () => {
   if (foundationBrowser) await foundationBrowser.close();
   if (server) await server.close();
});
```

This is a lifecycle ownership seam, not a browser factory. It reuses the runner-provided browser
and changes only which spec owns its final close.

## Implementation Boundary

### Candidate Files

- `tests/portfolio-survival-foundation.spec.mjs`: alias `test` to `baseTest`, add the file-local
   `foundationBrowserBoundary`, retain the worker browser in `foundationBrowser`, and close it in
   the existing `afterAll`.
- `tests/playwright-runtime.foundation.functional.mjs`: add the persistent strict-stop canary,
   its close-removal negative control, and assertions that browser project and teardown errors
   cannot be hidden.

### Selected Configuration File

- `playwright.config.mjs`: changes workers from two to one after candidate rejection and
   hash-verified rollback.

### Excluded Files And Behavior

- Do not change `tests/playwright-runtime.mjs`,
   `tests/portfolio-survival-paths.spec.mjs`, or
   `tests/portfolio-survival.support.mjs`.
- Do not change the other seven portfolio spec files, their assertions, or their data.
- Do not change the `system-chrome` project, Chrome channel, reporter, output semantics,
   300000ms vendor timeout, or BUG-022 declaration behavior.
- Do not change packet history, evidence, state, certification, acceptance, or user validation
   while implementing this seam unless the owning workflow separately authorizes those artifacts.

## Contracts And Failure Model

No data model, storage schema, application API, or UI contract changes. The only new contract is
process lifecycle:

- Foundation owns an automatic worker-scoped fixture distinct from the base fixture pool.
- Foundation closes the runner-provided browser after all Foundation tests and before worker
   fixture teardown.
- Later base-test specs receive a usable browser from a fresh boundary.
- Any close rejection, hook timeout, non-zero child exit, force-kill marker, ignored teardown
   error, or workload-owned process residue is a failure.
- Test output is captured in full. Marker checks inspect captured output after execution. They do
   not filter the command stream.

## Security And Isolation

The candidate adds no dependency, credential, external endpoint, or persistent state. The canary
must launch only the repository's local Playwright command and must terminate only child processes
it owns. Process-baseline checks distinguish workload descendants from unrelated VS Code or user
Chrome processes. Temporary output remains outside the repository.

## Configuration And Rollout

The evaluation started with the committed `system-chrome` project and workers=2. The candidate
passed one focused and one complete run. It then failed two current strict-canary runs.

Rollout followed the fallback gate:

1. Preserve both successful and failed candidate evidence.
2. Revert the candidate test commit and verify its parent-tree bytes.
3. Revert the candidate implementation and verify pre-candidate Foundation bytes.
4. Change the config default and adjacent assertions from two workers to one.
5. Run the unchanged BUG-022 C03 command twice through the config default.

## Acceptance And Test Design

### Historical Gate 1 - Strict 27-Test Canary At Workers=2

The persistent test title is
`Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds` in
`tests/playwright-runtime.foundation.functional.mjs`.

Use this outer command.

```text
node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs
```

The test must spawn this real child command.

```text
npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list
```

Acceptance requires exactly 27 passing tests, child exit 0, and both Playwright workers exiting
within 15 seconds of their stop signal. The 15-second clock begins when Playwright sends the
worker stop request, not when the browser workload starts. No force-kill marker, ignored teardown
error, or owned residue may appear.

The negative control removes only the Foundation-owned close. It must preserve 27 passing page
assertions while failing the lifecycle assertion, then restore the exact Foundation file hash and
return the canary to green.

### Historical Gate 2 - Exact 94-Test BUG-022 C03 At Workers=2

After Gate 1 passes, run the canonical command unchanged.

```text
npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

The runner must report `Running 94 tests using 2 workers`, and all 94 tests must pass. The command
must exit 0. The output must contain no `worker-N process did not exit within 300000ms after stop,
force-killed it` line or ignored lifecycle error. Workload-owned Chrome and worker counts must
return to their pre-run baseline. A 94-pass summary with a non-zero process exit fails this gate.

### Repository Closure

After the selected branch is stable, run the complete runtime-foundation functional file and the
packet governance checks. Run `node scripts/selftest.mjs` on the final tree. These checks
complement the two lifecycle gates. None substitutes for them.

### Selected Fallback Gate

Run the unchanged BUG-022 C03 command without `--workers`:

```text
npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

The runner must report `Running 94 tests using 1 worker`. All 94 tests must pass. The command
must exit zero. No force-kill, ignored-lifecycle, or workload-owned residue may remain.

## Rollback And One-Worker Contingency

Before candidate implementation, record baseline hashes and the exact candidate diff for both
candidate files.

If any required current candidate acceptance run fails a lifecycle criterion after the candidate
has reached complete-workload evaluation:

1. Preserve the complete unfiltered failure evidence.
2. Restore only the Foundation lifecycle and candidate-canary hunks.
3. Verify both files match their recorded baseline hashes.
4. Change only `playwright.config.mjs` from workers=2 to workers=1.
5. Run the exact unchanged BUG-022 C03 command under `system-chrome`.

The one-worker contingency requires 94/94 passing, exit 0, clean teardown output, and restored
owned process counts. Failure leaves the defect unresolved. A one-worker pass only bounds
exposure. It does not establish the socket owner or make worker count the root cause.

The finalization canary failed this condition twice. The rollback and one-worker branch are now
selected. Earlier candidate passes remain historical evidence rather than final-tree proof.

## Observability And Diagnostics

The persistent canary records child PID, worker-stop timestamp, worker exit timestamp and code,
resolved project, resolved worker count, pass count, and complete stdout/stderr. The complete run
records equivalent command-level fields plus workload-owned process counts before and after.

Diagnostics must distinguish three outcomes:

- Page assertion failure: not evidence for the lifecycle contingency.
- All page assertions pass but lifecycle acceptance fails: candidate failure eligible for the
   rollback sequence.
- All page assertions and lifecycle criteria pass: candidate selected at workers=2.

## Alternatives And Tradeoffs

| Alternative | Decision | Reason |
| --- | --- | --- |
| Treat worker count as the cause and immediately pin workers=1 | Rejected | Current evidence shows only exposure correlation. It does not establish mechanism or threshold, and it bypasses the focused repository-owned boundary. |
| Bare `browser.close()` in Foundation `afterAll` | Rejected | Without a distinct fixture pool, Playwright can reuse the closed browser for Paths; the first Paths test fails with a closed-target error. |
| Close from worker-fixture teardown | Rejected | The close occurs too late and enters the same retained transport path. |
| Change the shared `tests/playwright-runtime.mjs` fixture | Rejected | The defect is isolated to Foundation. A shared change expands blast radius across every browser spec without evidence that they need it. |
| Switch local verification to bundled Chromium | Rejected | It removes local parity with the `system-chrome` command and avoids rather than repairs the measured lifecycle boundary. |
| Raise the 300000ms worker timeout | Rejected | It lengthens a false-failure stall and supplies no release mechanism. |
| Catch or suppress the force-kill | Rejected | It turns a failed lifecycle into a false exit 0 and destroys the acceptance signal. |
| Disclosure alone | Rejected as a remedy | Existing disclosure does not release the worker or unblock BUG-022 C03. |
| Upstream transport diagnosis before local containment | Not required for selection | Socket ownership remains unknown, but the file-local lifecycle candidate is independently falsifiable by the 27- and 94-test gates. |

## Risks

- A focused 27-test pass can still miss interaction with the other six portfolio spec files.
   Gate 2 is therefore mandatory.
- Explicit browser close relies on Playwright's current worker-scoped browser contract. The
   persistent canary detects lifecycle drift after a Playwright upgrade.
- Unrelated user Chrome or extension-host processes can corrupt naive process counts. Counts must
   be limited to workload-owned descendants and the run's remote-debugging identity.
- The owner has not set the FR-017-004 wall-time ratio. Lifecycle acceptance can proceed, but
   terminal feature acceptance cannot claim that requirement without the owner value.

## Complexity Tracking

None - simplest viable approach used.

## Superseded Design Decisions

This appendix is historical and non-authoritative. It preserves observations without allowing
them to control implementation.

### History: Filing Observations

At the filing revision, bundled Chromium completed the then-selected 94-test set in 18.2 seconds.
System Chrome completed one identical six-worker run in 77 seconds. Another run took 342 seconds
and exited 1 after all tests passed. Later sweeps observed more six-worker force-kills. Those
runs remain valid characterization of cost and intermittence.

### Superseded Worker-Count Causality

The prior design treated increasing worker count as the governing term. Historical runs were 0/3
at two workers, 1/3 at four, and 6/8 at six. The current exact workload then failed 2/2 at two
workers. The historical samples remain true, but their causal inference is superseded.

### Superseded Unselected Remedy Menu

The prior design listed upstream diagnosis, bundled Chromium, a concurrency cap, and disclosure
without selecting a remedy. Current Foundation isolation replaces that menu with the focused
lifecycle candidate and explicit acceptance sequence above. Disclosure remains context only,
bundled Chromium remains rejected, and workers=1 is now a conditional contingency rather than a
causal remedy.
