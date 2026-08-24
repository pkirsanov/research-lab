# Report: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

- **Filed at commit:** `7d592cf1b`
- **Measured at commit:** `7d592cf1b`
- **Phase:** bug (filing only)
- **Delivered behaviour:** none

## Summary

Five runs in one session, on one machine, with the browser project as the only variable
across each comparison. The bundled `chromium` project runs ninety-four tests in 18.2s and
exits 0. The `system-chrome` project runs the same ninety-four twice: once in 1.3m with exit
0, and once in 5.7m with a force-killed worker and exit 1. Every test passed in all three.

The defect is therefore both a false failure and a standing slowdown, and it is intermittent
at six workers. It is confined to local macOS runs and does not reproduce in the pipeline.

## Evidence Provenance

Every block below was produced by a command executed during this filing session, on macOS, at
`7d592cf1b`. Nothing is reproduced from a prior description.

Test selection and isolation:

- The ninety-four tests are the entire lifetime-tax spec family, chosen because they are this
  packet owner's own and because no file belonging to a concurrent session is touched by
  selecting them.
- Playwright output was directed to a temporary directory outside the repository, so no
  repository path was written by any run.
- No test, configuration file, or source file was modified.

Two claims carry a stated method and are labelled where they appear:

- The browser process counts either side of run 5 were sampled on a machine with a browser
  already open. They corroborate an incomplete release; they are not an exact leak count.
- Non-reproduction in the pipeline is established by test accounting in the pipeline run, not
  by matching a `force-killed` string in its log.

## Test Evidence

### The two projects differ only in the browser channel

```
$ cat playwright.config.mjs
import { defineConfig } from 'playwright/test';

export default defineConfig({
  testMatch: '**/*.spec.mjs',
  projects: [
    {
      name: 'system-chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        headless: true
      }
    },
    {
      // Bundled Playwright chromium — lets the provider-credentials UI spec validate
      // locally without a system Chrome install. CI invokes --project=system-chrome
      // explicitly, so this project is inert there.
      name: 'chromium',
      use: {
        browserName: 'chromium',
        headless: true
      }
    }
  ]
});
```

### Toolchain and platform

```
$ node -v
v26.4.0
$ npx --no-install playwright --version
Version 1.61.1
$ ls -d "/Applications/Google Chrome.app"
/Applications/Google Chrome.app
```

The host is macOS. A system Chrome is installed, so the `system-chrome` project resolves a
real installed browser rather than falling back.

### At one worker the two projects are indistinguishable

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --workers=2 --reporter=line --output=<tmp>/chromium tests/lifetime-tax-combined.spec.mjs

Running 8 tests using 1 worker
  8 passed (4.5s)
CHROMIUM_EXIT=0 WALL_SECONDS=5
```

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=line --output=<tmp>/systemchrome tests/lifetime-tax-combined.spec.mjs

Running 8 tests using 1 worker
  8 passed (6.5s)
SYSTEM_CHROME_EXIT=0 WALL_SECONDS=6
```

Both clean, about a second apart. The defect is not visible at this scale, which is why a
single-spec reproduction attempt does not find it.

### At six workers the bundled project is fast and clean

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --workers=6 --reporter=line --output=<tmp>/chromium6 <the 20 lifetime-tax spec files>

Running 94 tests using 6 workers
  94 passed (18.2s)
CHROMIUM6_EXIT=0 WALL_SECONDS=19
```

### The same ninety-four under system-chrome: four times slower, still clean

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=6 --reporter=line --output=<tmp>/systemchrome6 <the same 20 spec files>

Running 94 tests using 6 workers
  94 passed (1.3m)
SYSTEMCHROME6_EXIT=0 WALL_SECONDS=77
```

Seventy-seven seconds against nineteen for the identical set — roughly four to one. This run
exited 0, so the slowdown is a standing cost independent of the stall.

### The identical command again: every test passes, exit 1

```
$ pgrep -f 'Google Chrome' | wc -l
42

$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=6 --reporter=line --output=<tmp>/sc6b <the same 20 spec files>

Running 94 tests using 6 workers
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
  94 passed (5.7m)
  1 error was not a part of any test, see above for details
REPEAT_EXIT=1 WALL_SECONDS=342

$ pgrep -f 'Google Chrome' | wc -l
49
```

This is the defect in full. Ninety-four passes, no test failure, and exit 1 — caused by a
worker that did not exit within the three-hundred-second teardown budget. The runner is
explicit that the error was *not a part of any test*.

Note on the process counts: a browser was already open on the machine, so 42 and 49 are not a
clean before-and-after of the run alone. They corroborate a teardown that does not fully
release; they are not an exact leak count.

### Runs 4 and 5 are the same command

The two `system-chrome` invocations differ only in their output directory, which is outside
the repository and cannot affect browser lifecycle. Same project, same worker count, same
ninety-four tests, same session, same machine. One exited 0 in seventy-seven seconds; the
other exited 1 in three hundred and forty-two. That is the intermittence.

### It does not reproduce in the pipeline

Pipeline run `32651572136` ran the `system-chrome` project at two workers:

```
verify  Full browser suite (blocking)  Running 708 tests using 2 workers
verify  Full browser suite (blocking)    31 failed
verify  Full browser suite (blocking)    677 passed (12.5m)
```

`31 + 677 = 708`, matching the run's own test count. Every test is accounted for as a pass or
a failure, and the summary carries no `1 error was not a part of any test` line — the exact
signature run 5 produced locally. A force-killed worker loses its in-flight tests from that
accounting; this run loses none.

This is why the packet asserts non-reproduction in the pipeline: it rests on the accounting,
not on searching the log for a string.

## The Separation From BUG-016

Both defects involve the `system-chrome` project and both end in a non-zero exit. They are
different defects and this packet does not explain the other.

| | BUG-016 | BUG-017 |
|---|---|---|
| Where it reproduces | pipeline and anywhere the deployed branch runs | local macOS only |
| What fails | six tests, genuinely | nothing — every test passes |
| Exit-code cause | real test failures | worker teardown |
| Deterministic | yes, eleven consecutive runs | no, once in two runs at six workers |
| Cause established | yes, a recurring merge-resolution loss | no |

Offering this defect as an explanation for the red gate would be wrong: the pipeline run
accounts for all its tests, and the six tax failures there have a fully established and
entirely different cause.

## Filing Verification

### The suite is unchanged

```
# selftest baseline before filing
$ node scripts/selftest.mjs
exit: 0
lines: 3842
sha256: 29b4729e52f80d26816336f9ff1b0d21e1714bd4eb02c8638ccebb48922bb127
--- from the tail ---
================================================
Research-Lab self-test: 3384 passed, 0 failed
================================================
```

Verification form:

```
bash .github/bubbles/scripts/evidence-capture.sh --verify 29b4729e52f80d26816336f9ff1b0d21e1714bd4eb02c8638ccebb48922bb127 -- node scripts/selftest.mjs
```

### Nothing outside this packet was touched

No source file, test, configuration file, workflow, pack, or `scripts/selftest.mjs` was
modified. All Playwright output was written outside the repository. The only additions are
this packet's seven artifacts.

## Scope 1 Execution — Characterisation

Measured at commit `ffd8e02af` on the same macOS host, against the same twenty lifetime-tax
spec files (ninety-four tests) the filing used, so the frequency figure is comparable to the
one already recorded rather than a fresh unrelated number.

A harness repeated one invocation N times and recorded, per run, the exit code, wall seconds,
the count of `did not exit within` lines, and the one-minute load average sampled immediately
before and after. Load was recorded because a teardown timeout is a wall-clock threshold and
this host was concurrently running another session's test suites, so contention had to be
measurable rather than argued about.

### Frequency at the filed configuration — six workers, eight runs, six stalls

```
RUN sc6  1 exit=1 wall=336s forcekills=7 loadbefore=7.32  loadafter=31.08 summary=94 passed (5.6m)
RUN sc6  2 exit=1 wall=332s forcekills=5 loadbefore=31.08 loadafter=23.26 summary=94 passed (5.5m)
RUN sc6  3 exit=0 wall=165s forcekills=0 loadbefore=23.26 loadafter=14.14 summary=94 passed (2.8m)
RUN sc6  4 exit=1 wall=332s forcekills=1 loadbefore=14.14 loadafter=11.61 summary=94 passed (5.5m)
RUN sc6  5 exit=1 wall=349s forcekills=7 loadbefore=11.61 loadafter=6.17  summary=94 passed (5.8m)
RUN sc6b 1 exit=0 wall=132s forcekills=0 loadbefore=9.16  loadafter=11.61 summary=94 passed (2.2m)
RUN sc6b 2 exit=1 wall=332s forcekills=6 loadbefore=11.61 loadafter=7.11  summary=94 passed (5.5m)
RUN sc6b 3 exit=1 wall=333s forcekills=7 loadbefore=7.11  loadafter=8.04  summary=94 passed (5.5m)
```

Six of eight runs exited 1. **Every one of the eight passed all ninety-four tests.** No run
lost a test to the stall, which is what makes the exit code a lie rather than a symptom.

### Contention is contradicted as the mechanism

Contention was a candidate this execution added, because the filing's runs 4 and 5 were the
identical command at 1.3m and 5.7m. The measurement refuses it. The clean run `sc6 3` began at
load 23.26 — higher than the three stalls that began at 7.32, 11.61 and 7.11. A mechanism that
requires load to be high does not fit a clean run at the second-highest load in the set.

### Worker sweep — the stall was observed at four, not observed at two

```
RUN sc4 1 exit=1 wall=329s forcekills=4 loadbefore=8.74  loadafter=10.13 summary=94 passed (5.5m)
RUN sc4 2 exit=0 wall=213s forcekills=0 loadbefore=10.13 loadafter=5.14  summary=94 passed (3.5m)
RUN sc4 3 exit=0 wall=50s  forcekills=0 loadbefore=5.14  loadafter=9.16  summary=94 passed (48.9s)
RUN sc2 1 exit=0 wall=40s  forcekills=0 loadbefore=5.23  loadafter=9.57  summary=94 passed (39.9s)
RUN sc2 2 exit=0 wall=47s  forcekills=0 loadbefore=9.57  loadafter=11.36 summary=94 passed (46.5s)
RUN sc2 3 exit=0 wall=47s  forcekills=0 loadbefore=11.36 loadafter=9.78  summary=94 passed (46.7s)
```

The lowest worker count at which the stall **was observed** is four. Two workers is recorded as
**not observed in three runs** — not as safe. Three runs cannot establish absence for a defect
that presents at six of eight.

### The bundled project at the same concurrency

```
RUN bundled6 1 exit=0 wall=17s forcekills=0 loadbefore=8.04  loadafter=11.84 summary=94 passed (16.5s)
RUN bundled6 2 exit=0 wall=17s forcekills=0 loadbefore=11.84 loadafter=12.81 summary=94 passed (16.0s)
```

Same specs, same six workers, same host, same minutes. The bundled browser never stalled and
ran the set in seventeen seconds against a hundred and thirty-two at best for system Chrome.

### What the runner is actually waiting for

One run under `DEBUG=pw:browser` (exit 0, 100s, no force-kill, ninety-four passed) still
exhibited the pathology at the thirty-second granularity:

```
pw:browser [pid=62625] <gracefully close start> +1ms
pw:browser [pid=62625] <gracefully close end> +0ms
pw:browser [pid=62616] <gracefully close start> +9ms
pw:browser [pid=62616] <gracefully close end> +0ms
pw:browser [pid=62663] <kill> +30s
pw:browser [pid=62663] <will force kill> +0ms
pw:browser [pid=62663] exception while trying to kill process: Error: kill ESRCH +0ms
pw:browser [pid=62663] <gracefully close end> +0ms
```

Five browsers closed in zero milliseconds. One did not, and when the runner finally killed it
the kill returned **ESRCH — no such process**. The browser had already exited. The runner was
waiting on an exit it was never told about, not on a browser that refused to leave.

The same log carries twelve `chrome/updater/app/app_wakeall.cc` lines referencing
`~/Library/Application Support/Google`. An installed Chrome has an updater and a bundled
Chromium does not.

### Candidate mechanisms

| # | Candidate | Verdict | Distinguishing evidence |
|---|---|---|---|
| 1 | Transport shutdown | **Supported** | Graceful close never completed for one process, and the eventual kill returned `ESRCH`. The process was gone; only the notification was missing. |
| 2 | macOS process lifecycle of an installed bundle | **Supported** | The bundled binary was clean at identical concurrency while the installed bundle stalled six of eight, and only the installed bundle wakes an updater. |
| 3 | Profile or lock contention | **Contradicted as profile contention** | Every launch carries its own `--user-data-dir=…/playwright_chromiumdev_profile-*`, so no per-user profile state is shared. Other shared state of an installed bundle is not excluded; that overlaps candidate 2 and remains untested. |
| 4 | Version-pair interaction | **Untested** | Playwright 1.61.1 against Chrome 151.0.7922.170 is recorded, but only one Chrome build was available, so nothing is discriminated. |

Candidates 1 and 2 are not rivals. An installed bundle that spawns updater helpers is a
plausible reason an exit notification is lost, and neither is named as *the* cause.

### Why the pipeline never sees it

```
$ grep -n 'workers' .github/workflows/pages.yml
58:      run: npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list,json

$ grep -c 'workers' playwright.config.mjs
0

$ node -e 'console.log(require("os").cpus().length)'
12
```

The pipeline pins two workers. The configuration pinned none, so a local run defaulted to half
the CPU count — six on this host. **The pipeline and the developer were running different
concurrencies, and nothing recorded that.** The filing's "does not reproduce in the pipeline"
is explained: CI runs the one count at which this execution never observed the stall.

### Decision

**Option C — bound the concurrency — selected**, and the objection recorded against it in
`design.md` no longer applies. The cap is not "an observation, not an understood threshold". It
is the value the deploy gate has been running all along, so pinning it removes a divergence
rather than inventing one.

Option B was rejected on the same evidence. Making the bundled browser the local default is
faster still, but it would put the developer on a different browser from the gate — adding a
fidelity gap in order to close a concurrency gap.

Option A is not foreclosed. The `ESRCH` evidence above is a sharper upstream report than the
packet could previously have written, and this remedy does not depend on that report landing.

## Scope 2 Execution — Remedy Applied

`playwright.config.mjs` now pins the worker count to the value the pipeline uses. A `--workers`
flag on the command line still overrides it, so the sweep above remains reproducible.

```
$ node -e 'const c=require("fs").readFileSync("playwright.config.mjs","utf8");console.log(/workers:\s*2/.test(c))'
true
```

Three consecutive runs, no `--workers` flag, so the configured value is what applies:

```
FIXRUN 1 exit=0 wall=48s forcekills=0 chrome_before=4 chrome_after=4 workersline=using 2 worker summary=94 passed (47.8s)
FIXRUN 2 exit=0 wall=47s forcekills=0 chrome_before=4 chrome_after=4 workersline=using 2 worker summary=94 passed (46.0s)
FIXRUN 3 exit=0 wall=47s forcekills=0 chrome_before=4 chrome_after=4 workersline=using 2 worker summary=94 passed (47.0s)
```

Every run exited 0. No run reported `did not exit within`. The count of Playwright-launched
Chrome processes was four before and four after each run — the four belong to another session
and are constant, so the run returned the host to its pre-run level. The set now completes in
forty-seven seconds where six workers needed a hundred and thirty-two at best and three hundred
and forty-nine at worst.

### The FR-017-004 bound

FR-017-004 leaves the acceptable multiple to the owner. It is recorded here as **three to one**,
measured like-for-like: both projects at the configured worker count, rather than the earlier
figure that compared six workers against six.

```
BUNDLED2 1 exit=0 wall=23s forcekills=0 workers=using 2 worker summary=94 passed (22.8s)
BUNDLED2 2 exit=0 wall=25s forcekills=0 workers=using 2 worker summary=94 passed (23.8s)
```

Forty-seven seconds against twenty-four is **two to one**, inside the bound, with no stalled
case to price in. The filing measured roughly four to one clean and roughly eighteen to one
stalled, so the remedy improves the ratio as well as removing the false exit code.

### The suite is unchanged

```
$ node scripts/selftest.mjs
Research-Lab self-test: 3406 passed, 0 failed
```

No test was modified. The only source change is the `workers` line in `playwright.config.mjs`.

## Scope 3 Disposition — Declined

Scope 3 carries an adversarial scenario that decides its own fate:

```gherkin
  Scenario: Disclosure does not stand in for an available fix
    Given Scope 1 concluded a remedy is available in this repository
    When the disposition of this scope is reviewed
    Then this scope is declined rather than taken
```

Scope 1 concluded a remedy was available here and Scope 2 took it, so the scope is **declined**,
not completed. Its Definition of Done is left unticked rather than satisfied, because satisfying
it would mean writing a disclosure the scope itself says must not be written.

Its first item — that the cause is not removable in this repository — is in fact true: what was
removed is the divergence, not the lost exit notification. That does not license taking the
scope. The default path a developer runs no longer stalls, and a disclosure aimed at "where a
developer meets it" would describe a symptom the default no longer produces.

What survives is narrower and belongs with the change rather than in a notice: the `workers`
line in `playwright.config.mjs` carries a comment naming the measured frequencies, the CLI
override, and this packet. A developer who overrides `--workers` upward can still meet the
stall, and that is what the comment is for.

## Cross-Scope Definition of Done — Status

- `bug.md` status moved from `Confirmed` to `Fixed — awaiting independent verification`. It is
  not marked `Verified`: this execution measured its own remedy, and verification by the party
  that wrote the fix is not independent.
- `report.md` carries pre-fix reproduction and post-fix proof — the sixteen-run characterisation
  above and the three-run verification.
- The separation from `BUG-016` is intact. Nothing in this execution is offered as an
  explanation for the red deploy gate; that gate had a different, established cause, and this
  defect is confirmed here to be absent at the concurrency the pipeline runs.
- `uservalidation.md` is **unchanged and its Human Acceptance Record remains unfilled**. That
  artifact is human-owned. Filling it would be the agent granting itself acceptance, which is
  the one thing the file says cannot happen.

## Completion Statement

Scopes 1 and 2 are executed and their Definition of Done items are ticked against the raw
output recorded above. Scope 3 is declined on the instruction of its own adversarial scenario,
with its items left unticked.

The root cause is **narrowed but not established**. Two candidates are supported and neither is
named as the cause: the evidence shows the runner waiting on an exit notification that never
arrived for a process that had already gone, and it shows the installed bundle differing from
the bundled binary in a way that fits. It does not show which of those is the mechanism, and
the packet does not claim it does.

What the remedy rests on is narrower and firmer than the diagnosis: local and CI were running
different worker counts, the stall was never observed at CI's count, and the configuration now
carries that count. That is a divergence closed, not a cause removed.

Status stays `in_progress` pending Scope 3 and independent validation. `certifiedCompletedPhases`
remains empty: phase certification belongs to the validating agent, and no independent party has
re-derived any measurement recorded here.

