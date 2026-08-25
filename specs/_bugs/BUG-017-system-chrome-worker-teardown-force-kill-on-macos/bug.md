# BUG-017: On macOS The System-Chrome Browser Project Intermittently Fails To Tear Down, Turning An All-Green Run Into A Non-Zero Exit

- **Status:** Verified
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

Not established at the transport level. What later measurement did establish is which variable
governs whether a given run stalls — and the reading recorded at filing time was wrong.

**Superseded reading, kept so the correction is legible.** The filing concluded: *"The variable
is the browser channel."* That was drawn from a comparison which never held the channel fixed
while moving the worker count. The reproduction table above varies the project at one worker and
at six, and contains no `system-chrome` run at two. With that cell missing, the channel was the
only variable left standing, so it took the attribution by default.

**Corrected reading.** The stall is conjunctive, and worker count is the governing term.

- Holding the channel fixed at `system-chrome` and moving only the worker count, the stall rate
  is monotone: **0 of 3** runs at two workers, **1 of 3** at four, **6 of 8** at six
  (`report.md` `### Worker sweep`, `### Frequency at the filed configuration`).
- A later controlled pair moves nothing but `--workers` on the same 22 spec files and 111 tests:
  two workers exits 0 with no force-kill, six workers exits 1 with force-kills, every test
  passing in both. Recorded and independently re-derived — see
  `## Independent Re-Derivation Round — The Controlled Pair At N=2`.

The channel is **not** exonerated and must not be recorded as irrelevant: the bundled `chromium`
project was clean at six workers, and the stall has never been observed under it. But that rests
on two runs (`### The bundled project at the same concurrency`), which cannot carry a claim of
channel independence against an eight-run system-Chrome sample. The honest statement is that
`system-chrome` is a necessary condition, worker count decides, and the transport-level mechanism
remains unselected among the candidates in `design.md`.

## What This Means For A Developer

The distinction is not academic — it inverts the guidance.

The pipeline runs this suite on `system-chrome` with `--workers=2`
(`.github/workflows/pages.yml`), which is precisely why it has never reproduced the stall. The
committed `workers: 2` in `playwright.config.mjs` puts a local run on that same count by default.

So the instruction is **leave the pinned worker count alone**. Raising `--workers` is the
remaining route to the stall. Switching to `--project=chromium` would forfeit the local/CI browser
parity the `system-chrome` project exists to provide, in order to avoid a condition that two
workers already avoids — a bad trade, and not the remedy this packet took.

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
