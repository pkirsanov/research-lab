# BUG-017: On macOS The System-Chrome Browser Project Intermittently Fails To Tear Down, Turning An All-Green Run Into A Non-Zero Exit

- **Status:** Reopened — In Progress
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

**Historical filing observation.** The following count belongs to run 5 and is retained
verbatim. Current Foundation isolation found no Chrome residue, so this count does not
describe the current recurrence.

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

- **The underlying transport attribution remains unverified.** The filing carried an
  attribution to Chromium's CDP transport over `--remote-debugging-pipe` and took no handle
  trace. Current isolation later found two anonymous `Socket` handles in the Foundation worker
  after Chrome exited. That observation narrows the lifecycle boundary but does not identify
  the sockets' owner or the underlying transport mechanism.
- **Only one worker was force-killed, not several.** Run 5 names `worker-3` and no other. A
  higher count may occur under different conditions; it was not observed here.
- **Superseded fixture reading.** The filing implicated or exonerated no repository fixture
  because it attempted no fixture-level isolation. Current evidence now implicates the
  Foundation lifecycle boundary. Its cumulative sequence through row 14 triggers the retained
  handles, while the row alone does not. No HTTP server or Chrome residue remains after the
  isolated trigger.
- **The long-run frequency is not characterised.** The filing observed one occurrence in two
  six-worker runs. Current evidence observed two failures in two two-worker runs and two passes
  in two one-worker runs. Neither sample is a long-run rate.

## Impact

- A green local suite can exit 1, so any gate or script keying on the exit code is
  unreliable on macOS.
- Local verification is more than four times slower than it needs to be, on every run.
- Trust in the runner erodes, which is the most expensive consequence and the hardest to
  reverse.

## Root Cause

The underlying transport mechanism remains unestablished. Current recurrence evidence now
implicates the Foundation lifecycle boundary. It also disproves the prior claim that worker
count alone governs whether the run stalls.

**Superseded reading, kept so the correction is legible.** The filing concluded: *"The variable
is the browser channel."* That was drawn from a comparison which never held the channel fixed
while moving the worker count. The reproduction table above varies the project at one worker and
at six, and contains no `system-chrome` run at two. With that cell missing, the channel was the
only variable left standing, so it took the attribution by default.

**Superseded second reading, retained for historical traceability.** The stall is conjunctive,
and worker count is the governing term.

- Holding the channel fixed at `system-chrome` and moving only the worker count, the stall rate
  is monotone: **0 of 3** runs at two workers, **1 of 3** at four, **6 of 8** at six
  (`report.md` `### Worker sweep`, `### Frequency at the filed configuration`).
- A later controlled pair moves nothing but `--workers` on the same 22 spec files and 111 tests:
  two workers exits 0 with no force-kill, six workers exits 1 with force-kills, every test
  passing in both. Recorded and independently re-derived — see
  `## Independent Re-Derivation Round — The Controlled Pair At N=2`.

**Superseded conclusion from that round, retained verbatim.** The channel is **not** exonerated
and must not be recorded as irrelevant: the bundled `chromium` project was clean at six workers,
and the stall has never been observed under it. But that rests on two runs (`### The bundled
project at the same concurrency`), which cannot carry a claim of channel independence against an
eight-run system-Chrome sample. The honest statement is that `system-chrome` is a necessary
condition, worker count decides, and the transport-level mechanism remains unselected among the
candidates in `design.md`.

**Current reading after recurrence.** The exact 94-test `system-chrome` workload failed in two
of two current-revision runs at two workers after every test passed. The same workload passed in
two of two runs at one worker. These are current samples, not rates or proof that one worker
removes the cause.

The Foundation worker retained two anonymous `Socket` handles after Chrome exited. No HTTP
server or Chrome process remained. The cumulative Foundation sequence through row 14 triggers
the retention, while that row alone does not. This implicates Foundation's transport lifecycle
boundary without selecting the underlying mechanism. Worker count modulates exposure, but it
does not decide the outcome and is not the sole cause.

## What This Means For A Developer

The current recurrence reopens this defect. The pipeline and committed configuration both use
two workers, but the exact local workload now fails at that count. The two-worker pin therefore
modulates exposure rather than proving remediation.

Keep `system-chrome` and two workers while evaluating the Foundation lifecycle candidate. The
candidate closes Foundation's owned browser before worker teardown. Its strict
Foundation-to-Paths probe passed 27 of 27 tests and released both workers within 15 seconds.
That focused result does not prove the remedy. The candidate must still pass the exact 94-test
workload with exit 0, no force-kill marker, and no workload-owned process residue.

Move the repository setting to one worker only if the lifecycle candidate fails that complete
run and its changes are rolled back. One worker passed the current two-run sample, but it remains
a conditional fallback rather than the selected remedy or a root-cause claim.

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
