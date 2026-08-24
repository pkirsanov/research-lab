# User Validation: BUG-017 — Filed, Nothing Delivered

This packet files a defect and implements nothing. There is no delivered behaviour to
exercise.

The Automation Readiness items below record facts about the **filing** — that the defect is
real, reproduced in this session, and correctly bounded. They are ticked where an executed
check establishes them.

**Ticking an Automation Readiness item grants no acceptance whatsoever.** Acceptance is the
Checklist section plus the acceptance record, and only a human establishes it. Every Checklist
item is unticked and the Human Acceptance Record is unfilled, because nothing has been fixed
and the root cause is not established.

## Automation Readiness

- [x] The defect was reproduced in this session, not reported. **Under the `system-chrome` project at six workers, a ninety-four-test run produced `Error: worker-3 process did not exit within 300000ms after stop, force-killed it`, then `94 passed (5.7m)`, then `1 error was not a part of any test`, exiting 1 after 342 seconds of wall time.**
- [x] Every test passed in the failing run. **The runner reported 94 passed and stated explicitly that the error was not a part of any test. The non-zero exit is teardown, not a test outcome.**
- [x] The comparison holds only the browser project variable. **Same ninety-four tests, same worker count, same machine, same session, same Node v26.4.0 and Playwright 1.61.1. `playwright.config.mjs` differs between the two projects only in `channel: 'chrome'`.**
- [x] The bundled project is fast and clean on the identical set. **`chromium` at six workers: 94 passed (18.2s), exit 0, 19 seconds wall.**
- [x] The slowdown is standing, not only present when the stall occurs. **The clean `system-chrome` run took 77 seconds against 19 for the bundled project on the identical set — roughly four to one, at exit 0.**
- [x] The defect is intermittent, and the two runs were the same command. **Two `system-chrome` invocations at six workers differing only in an output directory outside the repository: one exited 0 in 77 seconds, the other exited 1 in 342.**
- [x] The defect is absent at one worker. **Eight tests at one worker: bundled 4.5s exit 0, system-chrome 6.5s exit 0. About a second apart, so a single-spec reproduction attempt does not find it.**
- [x] Browser processes were not fully released. **Chrome process count sampled at 42 before the failing run and 49 after. Recorded as corroboration of an incomplete release, not as an exact leak count, because a browser was already open on the machine.**
- [x] The stall is at release, not during execution. **The runner reported all 94 passes before it began waiting on the worker.**
- [x] It does not reproduce in the pipeline. **Pipeline run `32651572136` ran the same project at two workers and reported `Running 708 tests`, `31 failed`, `677 passed`. `31 + 677 = 708`, so every test is accounted for, and the `1 error was not a part of any test` signature is absent. Established by accounting, not by matching a `force-killed` string.**
- [x] No repository path was written by any run. **All Playwright output was directed to a temporary directory outside the repository.**
- [x] No file owned by a concurrent session was executed, read, edited or staged. **The ninety-four tests are the entire lifetime-tax spec family, which is this packet owner's own.**
- [x] No source file, test, or configuration file was modified. **The only additions are this packet's seven artifacts.**
- [x] The suite is unchanged by this filing. **`node scripts/selftest.mjs` exits 0 with 3384 passed, 0 failed.**
- [x] The separation from `BUG-016` is stated and evidenced, not asserted. **`report.md` carries a comparison table: BUG-016 reproduces in the pipeline with six genuine test failures and an established cause; this defect reproduces only locally, fails no test, and has no established cause.**
- [ ] The root cause is established. **Left unticked deliberately. Four candidate mechanisms are enumerated in `design.md` and the evidence gathered here distinguishes none of them.**
- [ ] The transport-level attribution is verified. **Left unticked deliberately. The attribution to Chromium's CDP transport over `--remote-debugging-pipe` was carried in from outside this session. No handle trace was taken here, so it is recorded as a candidate and nowhere as a finding.**
- [ ] A frequency or a concurrency threshold is established. **Left unticked deliberately. One occurrence in two runs at six workers is not a rate, and only one worker was force-killed, not several. Establishing either is Scope 1.**
- [ ] A remedy option is chosen. **Left unticked deliberately. Options A through D are enumerated in `design.md` and the choice turns on open question 1, which is yours.**

## Checklist

- [ ] The defect as filed is the real defect: a run in which every test passes exits 1 because a browser worker was force-killed at its teardown budget.
- [ ] Recording it separately from `BUG-016` is right, and merging them would have been wrong. The pipeline run accounts for all its tests, so no teardown loss occurred there, and the six tax failures have an entirely different and fully established cause.
- [ ] The intermittence is understood as the aggravating factor rather than a mitigation. A failure that clears on rerun teaches developers to ignore the exit code, and that lesson generalises beyond this project.
- [ ] The standing four-to-one slowdown is understood as a separate cost from the stall, present on every run at six workers whether or not the teardown hangs.
- [ ] The honesty of the boundary is accepted: the root cause is not established, only one worker was force-killed rather than several, and the transport-level attribution was not verified in this session.
- [ ] The process-count sampling is understood as corroboration rather than an exact leak measurement, given a browser was already open on the machine.
- [ ] Not raising the teardown budget is understood as correct. Three hundred seconds is already long; raising it converts an intermittent false failure into an intermittent multi-minute stall.
- [ ] Not modifying `playwright.config.mjs` during filing is understood as correct, since the remedy choice is open question 1 and belongs to you.
- [ ] Whether diagnosis is worth its cost is **your** decision. That the packet enumerates four candidates and selects none is the intended outcome, not an incomplete one.
- [ ] Answering open question 3 first is agreed, because the pipeline runs the system Chrome channel regardless, which materially weakens the argument against making the bundled project the local default.

## Human Acceptance Record

Acceptance has not occurred and cannot occur yet. This packet delivers no behaviour to
exercise; it delivers a reproduced defect, its measured cost, an explicit boundary around
what was not established, and a decision request. Automation cannot fill this section and
nothing above substitutes for it.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
