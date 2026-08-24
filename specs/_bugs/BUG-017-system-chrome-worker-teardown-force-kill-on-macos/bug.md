# BUG-017: On macOS The System-Chrome Browser Project Intermittently Fails To Tear Down, Turning An All-Green Run Into A Non-Zero Exit

- **Status:** Fixed — awaiting independent verification
- **Severity:** Medium — developer experience only; does not reproduce in the pipeline
- **Surface:** `playwright.config.mjs` project `system-chrome` (`channel: 'chrome'`), local macOS runs
- **Filed at commit:** `7d592cf1b`
- **Measured at commit:** `7d592cf1b`

## This Is Not The Cause Of The Red Deploy Gate

Recorded first, because conflating the two would be wrong and the temptation is real: both
involve the `system-chrome` project and both produce a non-zero exit.

`specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main` records a genuine
product defect — six tests asserting against a panel the deployed branch does not carry. The
pipeline run there accounts for all seven hundred and eight of its tests as either a pass or
a failure, so nothing was lost to a worker teardown. **This defect does not reproduce in the
pipeline at all.** It is a local-only cost paid by developers, and it must not be offered as
an explanation for a red gate that has a different, established cause.

## Summary

Running a test set under the `system-chrome` project on macOS intermittently leaves a worker
process alive after the run completes. The runner waits five minutes for it, force-kills it,
and exits 1 — **even though every test passed**. The same set on the bundled `chromium`
project completes in a fraction of the time with a clean exit.

The failure is a lie in both directions. It reports failure when nothing failed, and it
reports it only sometimes, which is worse than reporting it always: a developer who reruns
and sees green learns to distrust the runner rather than the browser.

## Reproduction

Both projects are defined in `playwright.config.mjs` and differ only in whether they use the
system Chrome channel:

- `system-chrome` — `browserName: 'chromium'`, `channel: 'chrome'`, headless
- `chromium` — `browserName: 'chromium'`, headless, bundled build

Ninety-four tests were selected from the lifetime-tax spec family, run under each project with
six workers, output directed outside the repository. Full commands and verbatim output are in
`report.md`.

| Run | Project | Workers | Tests | Result | Exit | Wall |
|---|---|---|---|---|---|---|
| 1 | `chromium` | 1 | 8 | 8 passed (4.5s) | 0 | 5s |
| 2 | `system-chrome` | 1 | 8 | 8 passed (6.5s) | 0 | 6s |
| 3 | `chromium` | 6 | 94 | 94 passed (18.2s) | 0 | 19s |
| 4 | `system-chrome` | 6 | 94 | 94 passed (1.3m) | 0 | 77s |
| 5 | `system-chrome` | 6 | 94 | 94 passed (5.7m) **+ force-kill** | **1** | **342s** |

Runs 4 and 5 are the identical command. Run 5 produced:

```
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
  94 passed (5.7m)
  1 error was not a part of any test, see above for details
```

## Expected vs Actual

**Expected.** A run in which every test passes exits 0. Choice of browser channel changes
which browser is exercised, not whether the runner can finish.

**Actual.** Ninety-four passes and exit 1, because one worker did not exit within the
runner's three-hundred-second teardown budget.

## Two Distinct Costs, Both Real

**The intermittent false failure.** Run 5 is the headline: a fully green suite reported as a
failure. Because it is intermittent — once in two identical runs at six workers — it also
teaches the wrong lesson. A developer who reruns and passes concludes the runner is flaky and
stops reading its exit code.

**The standing slowdown, which is not intermittent.** Even the clean run is more than four
times slower: seventy-seven seconds against nineteen for the identical ninety-four tests. That
cost is paid on every local run whether or not the teardown stalls.

Neither cost appears at one worker. Runs 1 and 2 differ by about a second.

## Processes Survive The Run

Chrome process count was sampled either side of run 5:

```
before: 42
after:  49
```

Seven more Chrome processes after a run that reported completion. The count is not a clean
measurement — a browser was open on the machine — so it is offered as corroboration of a
teardown that does not fully release, not as an exact leak count.

## What Was Not Established

Stated plainly so it is not read as more than it is.

- **The transport-level attribution was not verified here.** The stall has been attributed
  elsewhere to Chromium's CDP transport over `--remote-debugging-pipe`. No handle trace was
  taken in this session, so that mechanism is recorded as an unverified hypothesis in
  `design.md`, not as a finding.
- **Only one worker was force-killed, not several.** Run 5 names `worker-3` and no other. A
  higher count may occur under different conditions; it was not observed here.
- **No repository fixture was implicated or exonerated.** The same ninety-four tests pass
  cleanly on the bundled project, which points away from the tests, but pointing away is not
  proof and no fixture-level isolation was attempted.
- **The frequency is not characterised.** One occurrence in two runs at six workers is not a
  rate.

## Impact

- A green local suite can exit 1, so any gate or script keying on the exit code is
  unreliable on macOS.
- Local verification is more than four times slower than it needs to be, on every run.
- Trust in the runner erodes, which is the most expensive consequence and the hardest to
  reverse.

## Root Cause

Not established. What is established is the boundary: identical tests, identical worker
count, identical machine, same session — the bundled `chromium` project completes cleanly and
quickly, and the `system-chrome` project is slow and intermittently fails to release a
worker. The variable is the browser channel. Candidate mechanisms are enumerated in
`design.md` and none is selected by the evidence gathered here.

## Scope Of This Packet

**In scope.** Recording the defect, its reproduction, its measured cost, and the boundary
between what was and was not established.

**Out of scope, deliberately.**

- Changing `playwright.config.mjs` or any test. No source file was modified.
- The red deploy gate. That is `BUG-016`, it has a different and established cause, and the
  two must not be merged.
- Diagnosing the transport-level mechanism, which needs instrumentation this filing did not
  run.

## Artifacts

- `spec.md` — the behaviour being specified
- `design.md` — boundary, candidate mechanisms, and remedy options
- `scopes.md` — the fix scopes and their Definition of Done
- `report.md` — executed evidence behind every claim above
- `uservalidation.md` — filing readiness and the human acceptance record
- `state.json` — control-plane state
