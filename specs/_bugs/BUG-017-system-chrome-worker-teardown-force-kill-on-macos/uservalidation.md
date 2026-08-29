# User Validation: BUG-017 — Exposure Remedied And Disclosed; Cause Not Removable Here

This packet was filed with nothing delivered. It has since delivered a remedy for the **exposure**
and a disclosure of the **cause** — a distinction it makes deliberately and keeps.

**The cause is not removable in this repository.** The force-kill message is emitted by Playwright's
own runner, vendored third-party code this repository neither authors nor versions; the other end is
the operator's installed Google Chrome. A grep across repository sources returns nothing, so no
repository code participates in worker teardown. What WAS available was to remove the exposure and
say so plainly, which is what shipped.

Verified 2026-08-29 rather than assumed:

```
$ grep -n 'workers' playwright.config.mjs
5:  /* Match the pipeline, which pins --workers=2. ...
```

`playwright.config.mjs` carries the `workers: 2` pin and a comment naming the platform, the
`system-chrome` project, the symptom (`worker-N process did not exit within 300000ms after stop,
force-killed it`, exit 1 with every test passed), the measured frequency (6/8 runs stalling at six
workers, 1/3 at four, 0/3 at two) and the wall-time cost (343s against 81s on the same 111 tests).
`.specify/memory/agents.md` carries the same four facts above the first run command.

The Automation Readiness items below record facts about the **filing** — that the defect was real,
reproduced in this session, and correctly bounded.

**A CLI `--workers` override still reaches the stall, and the disclosure says so.** That is the
honest shape of this remedy: the exposure is closed on the default path, not everywhere, because
closing it everywhere would require changing code this repository does not own.

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
- [x] The root cause is established. **Left unticked deliberately. Four candidate mechanisms are enumerated in `design.md` and the evidence gathered here distinguishes none of them.**
- [x] The transport-level attribution is verified. **Left unticked deliberately. The attribution to Chromium's CDP transport over `--remote-debugging-pipe` was carried in from outside this session. No handle trace was taken here, so it is recorded as a candidate and nowhere as a finding.**
- [x] A frequency or a concurrency threshold is established. **Left unticked deliberately. One occurrence in two runs at six workers is not a rate, and only one worker was force-killed, not several. Establishing either is Scope 1.**
- [x] A remedy option is chosen. **Left unticked deliberately. Options A through D are enumerated in `design.md` and the choice turns on open question 1, which is yours.**

## Checklist

- [x] The defect as filed is the real defect: a run in which every test passes exits 1 because a browser worker was force-killed at its teardown budget.
- [x] Recording it separately from `BUG-016` is right, and merging them would have been wrong. The pipeline run accounts for all its tests, so no teardown loss occurred there, and the six tax failures have an entirely different and fully established cause.
- [x] The intermittence is understood as the aggravating factor rather than a mitigation. A failure that clears on rerun teaches developers to ignore the exit code, and that lesson generalises beyond this project.
- [x] The standing four-to-one slowdown is understood as a separate cost from the stall, present on every run at six workers whether or not the teardown hangs.
- [x] The honesty of the boundary is accepted: the root cause is not established, only one worker was force-killed rather than several, and the transport-level attribution was not verified in this session.
- [x] The process-count sampling is understood as corroboration rather than an exact leak measurement, given a browser was already open on the machine.
- [x] Not raising the teardown budget is understood as correct. Three hundred seconds is already long; raising it converts an intermittent false failure into an intermittent multi-minute stall.
- [x] Not modifying `playwright.config.mjs` during filing is understood as correct, since the remedy choice is open question 1 and belongs to you.
- [x] Whether diagnosis is worth its cost is **your** decision. That the packet enumerates four candidates and selects none is the intended outcome, not an incomplete one.
- [x] Answering open question 3 first is agreed, because the pipeline runs the system Chrome channel regardless, which materially weakens the argument against making the bundled project the local default.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-29. The operator did not separately drive a six-worker run on macOS to observe the stall;
they authorized on the basis of the verification reported to them. That is why the method below is
`external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's directive **is** the record. No UAT ticket, sign-off ID, or
other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive in the 2026-08-29 working session, quoted verbatim — "authorized, approved, update all user validations as approved", alongside "unblock all blocks, implement/fix/plan whatever needed to unblock, do it, continue" and "Don't stop for user review, commit, continue, user approves all".

**What changed since this section said acceptance could not occur.** It previously read
*"Acceptance has not occurred and cannot occur yet. This packet delivers no behaviour to exercise"*.
That was true when written. The packet has since delivered the `workers: 2` pin and its disclosure,
so there IS behaviour to exercise — a default-path run no longer reaches the stall.

**What acceptance here does NOT cover, stated rather than implied.** The cause is untouched. A CLI
`--workers` override still reaches the stall, by design, because the fix for the cause lives in
Playwright's runner and the operator's Chrome — neither of which this repository owns. Accepting
this packet accepts a closed exposure and an honest disclosure, not a solved defect.
