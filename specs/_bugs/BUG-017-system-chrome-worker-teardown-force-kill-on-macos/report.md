# Report: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

- **Filed at commit:** `7d592cf1b`
- **Measured at commit:** `7d592cf1b`
- **Phase:** bug (filing only)
- **Delivered behaviour:** none

## Test-Phase RED Before GREEN Evidence

RED-STAGE: six workers reported 111 successful test outcomes but exited 1.

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file playwright.config.mjs --find 'workers: 2,' --replace 'workers: 6,' --label 'BUG-017 worker-count exposure: six workers versus repository two-worker setting' --bound 900 --summary-match '111 passed' -- npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

GREEN-STAGE: the restored two-worker configuration reported all 111 tests passing and exited 0.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            BUG-017 worker-count exposure: six workers versus repository two-worker setting
file:             playwright.config.mjs
mutation:         workers: 2,  ->  workers: 6,   (1 occurrence(s))
command:          npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
red-exit:         1
red-summary:        111 passed (6.1m)
green-exit:       0
green-summary:      111 passed (1.7m)
summary-compared:   111 passed (<elapsed>)  vs    111 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b restored=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

Full-output receipt: `lines=13`, `sha256=940c43f5626a0184d0d85a7cc4b7d3fffbedee410e9a16286ae4e3086cf27f1f`.

## Current Linked Functional Canary

**Phase:** test
**Command:** `gtimeout 240 node --test --test-name-pattern='^shared runtime exports the exact checkout-local Playwright 1\.61\.1 API$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API (0.953625ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 189.940083
```

Full-output receipt: `lines=14`, `sha256=f0a6b33bb324380603edc878ee7d7fd32a37eeede156e0a642e644adb0953563`.

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

## Scope 3 Disposition — Declined (superseded; see Scope 3 Execution below)

The reasoning below is kept verbatim as the record of what was decided at the time. It was
reversed by a later execution, which took the scope. See `## Scope 3 Execution — Disclosure
Written` for the reversal and its grounds.

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
with its items left unticked. *(Superseded: a later execution took Scope 3 and ticked its four
items. See `## Scope 3 Execution — Disclosure Written` below.)*

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

## Scope 1 Addendum — The Cause Is Not Removable In This Repository

Recorded here because Scope 3's first Definition of Done item requires *Scope 1* to have recorded
it, and the Decision above stopped at selecting Option C. Everything in this section was verified
in this execution on the same macOS host; every premise below was re-derived rather than accepted
on trust.

**1. The failing step belongs to the vendored runner, not to this repository.**

```
$ grep -rl 'did not exit within' node_modules/
node_modules/playwright/lib/runner/index.js

$ grep -rl 'did not exit within' --include='*.mjs' --include='*.js' --include='*.html' . \
    | grep -v node_modules | grep -v '^./specs/' | grep -v '^./_site/'
(no output)
```

The force-kill is emitted by Playwright's own runner. No repository source emits that message and
no repository source participates in worker teardown: the specs drive pages and end, and the
wait that fails happens after the last spec has reported.

**2. The other party is the operator's installed browser, not a repository artifact.**

```
$ sw_vers -productVersion
26.5.2
$ '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --version
Google Chrome 151.0.7922.174
$ npx --no-install playwright --version
Version 1.61.1
```

`channel: 'chrome'` resolves to a machine-installed application bundle that the repository does
not vendor, version, or update. The repository pins the runner in its lockfile and pins nothing
at all on the browser side. Both ends of the transport that fails are therefore outside its
control.

**3. What Scope 2 removed was the divergence, not the defect.** The stall is still reachable at
the commit that carries the remedy — see the reproduction under Scope 3 Execution below, which
force-killed four workers on a fully green run. Pinning `workers: 2` stopped the default path
from meeting it. It did not make the teardown notification arrive.

**Counter-argument considered.** The repository *does* own the line `channel: 'chrome'`, and
deleting it would end all exposure, because the bundled `chromium` project has never stalled in
any run recorded in this packet. That removes the exposure, not the cause — and at the price of
running a different browser locally than the deploy gate runs, since CI invokes
`--project=system-chrome`. That is Option B, rejected in the Decision above on precisely that
ground, and nothing measured here reopens it.

**Conclusion recorded for Scope 1: the cause is not removable in this repository.** Exposure is
repository-ownable and has been bounded. The defect itself is upstream and can only be reported,
not fixed, from here.

## Scope 3 Execution — Disclosure Written

### Why the declination above is superseded

The declination rested on this scope's adversarial scenario: *given Scope 1 concluded a remedy is
available in this repository, this scope is declined rather than taken*. That scenario exists so
that a notice cannot be filed **instead of** a fix. The fix was filed: `workers: 2` is committed
and is what the default path now runs. A disclosure added afterwards does not stand in for it.

The same scope's first Definition of Done item — *the cause is not removable in this repository* —
presupposes the opposite condition to the adversarial scenario's `Given`. Both cannot bind. The
discriminator is the distinction the Scope 1 Addendum draws and the declination itself already
conceded in writing: a remedy for the **exposure** was available and was taken; the **cause** is
not removable here. On that reading the adversarial scenario is satisfied, not violated, and the
scope is taken.

What the declination got right and this execution keeps: the disclosure belongs with the change
rather than in a general notice, because the default path no longer stalls and only an operator
who raises `--workers` can still meet it.

### The condition is still reachable at the remedy commit

Twenty-two `tests/lifetime-tax*.spec.mjs` files, 111 tests, this session, this host, all output
written to a temporary directory outside the repository:

```
A proj=system-chrome exit=0 wall=81s  forcekills=0 | 111 passed (1.3m) | Running 111 tests using 2 workers
B proj=chromium      exit=0 wall=66s  forcekills=0 | 111 passed (1.1m) | Running 111 tests using 2 workers
C proj=system-chrome exit=1 wall=343s forcekills=4 | 111 passed (5.7m) | Running 111 tests using 6 workers

C.log:
Running 111 tests using 6 workers
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-5 process did not exit within 300000ms after stop, force-killed it
Error: worker-4 process did not exit within 300000ms after stop, force-killed it
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
  111 passed (5.7m)
  4 errors were not a part of any test, see above for details

failed-test count in A.log, B.log, C.log: 0, 0, 0
```

Run A is the configured default and is clean. Run C raises `--workers` and reproduces the defect
independently of the earlier characterisation. **The measured wall-time cost carried into the
disclosure is run C against run A: 343 seconds against 81, on the identical 111 tests, plus an
exit code no test earned.**

Two of this packet's earlier records are corrected by run C rather than confirmed. `bug.md`
records under *What Was Not Established* that only one worker was force-killed and that a higher
count "was not observed here". Four were force-killed in run C — `worker-1`, `worker-5`,
`worker-4`, `worker-3` — so the multi-worker case is now observed. The Chrome build also moved
from `151.0.7922.170` to `151.0.7922.174` between the characterisation and this run, and the
defect survived the change, which weakens candidate 4 without discriminating it.

### Where the disclosure was placed, and why there

Primary site: the comment beside `workers: 2` in `playwright.config.mjs`.

```
$ grep -c 'config=playwright.config.mjs' <(grep -rh 'playwright test' .specify/memory/agents.md .github/workflows/pages.yml)
18
$ grep -cv 'config=playwright.config.mjs' <(grep -rh 'playwright test' .specify/memory/agents.md .github/workflows/pages.yml)
0
```

Every one of the eighteen documented invocations of this suite — every command in the registry
and the pipeline's own job — names `playwright.config.mjs` on the command line. There is no way
to run this suite without naming that file. It is also the file that owns the `workers` knob, so
the notice cannot drift away from the value it explains, and the reader who raises `--workers` —
now the only reader who can meet the stall — is editing or overriding that exact line.

Reach site: `.specify/memory/agents.md` under `### Playwright E2E`, immediately above the first
run command, because that section is where a developer copies the command from before they ever
open the config. It carries the same platform, project, symptom, intermittence and cost, and
points at the config and this report.

`README.md` was deliberately not used. It is this repository's managed architecture and
development document under `docsRegistryOverrides.managedDocs` in `.github/bubbles-project.yaml`,
so it is not this execution's to write.

### Definition of Done evidence

- *Scope 1 recorded that the cause is not removable in this repository* — the Scope 1 Addendum
  above, resting on the two greps showing the force-kill is emitted only by
  `node_modules/playwright/lib/runner/index.js`, the installed-Chrome version check, and the
  counter-argument recorded and answered.
- *The disclosure names the platform, the project, the symptom, and its intermittence* — the
  config comment names macOS, `system-chrome`, the 300000ms teardown force-kill with an exit 1 on
  a fully green run, and "intermittently" quantified as 6/8 at six workers, 1/3 at four, 0/3 at
  two. The registry note carries the same four.
- *The disclosure carries the measured wall-time cost* — "343s against 81s for the same 111
  tests", measured in run C against run A above, in both sites.
- *The disclosure is reachable from where a developer runs the suite* — 18 of 18 documented
  invocations name the config file; the registry note sits directly above the first of them.

### The suite is unchanged by this scope

```
$ git diff --stat -- playwright.config.mjs
 playwright.config.mjs | 16 ++++++++++++----

$ node -e 'import("./playwright.config.mjs").then(m=>console.log(m.default.workers, m.default.testMatch, m.default.projects.map(p=>p.name+":"+(p.use.channel||"bundled")).join(", ")))'
2 **/*.spec.mjs system-chrome:chrome, chromium:bundled
```

The change is comment-only. The resolved worker count, discovery glob and both project
definitions are byte-for-byte the behaviour they were before. No test was modified, no project
default was switched, and the pipeline job is untouched.

## Independent Verification Round — Partial; The Row Stays Open

Run at `982a63641` by a party that wrote no part of this packet. The disclosure half verifies
completely. The measurement half does not, and the row is therefore **left unticked**.

### Verified: the disclosure is where a developer meets it

Both sites carry all four required facts — platform, project, symptom, intermittence — plus the
cost. `playwright.config.mjs` states macOS, the `system-chrome` project, the exact force-kill
string and the non-zero exit with every test passed, `6/8` at six workers, `1/3` at four, `0/3` at
two, and `343s against 81s` on the same 111 tests. `.specify/memory/agents.md` `### Playwright E2E`
carries the same set and sits directly above the first run command, which is the line a developer
copies.

The reachability claim was re-counted rather than accepted:

```
every "playwright test" invocation in .specify/memory/agents.md and .github/workflows/pages.yml
  total invocations = 18
  naming --config=playwright.config.mjs = 18
  NOT naming it = 0
```

Independently confirmed alongside it: the disclosure commit `2d79740e1` changes the config comment
only — the `workers:` line is not in its diff — and touches no file under `tests/`. The pin itself
landed earlier, in `13494be66`. So the disclosure did not stand in for the fix, and did not adjust
a test to suit it.

### Not verified: the 343s figure was not re-derived

Runs A and C in `### The condition is still reachable at the remedy commit` are `system-chrome`
measurements. This round was constrained to `--project=chromium`, so neither was re-run. Only run B
was reproduced, and it reproduces closely:

```
recorded  B proj=chromium exit=0 wall=66s forcekills=0 | 111 passed (1.1m) | 2 workers
this round  npx --no-install playwright test tests/lifetime-tax*.spec.mjs \
              --config=playwright.config.mjs --project=chromium --reporter=line
            specfiles=22   PW_EXIT=0   wall=64s   111 passed (1.1m)
```

The test set is confirmed to be the one the measurement names: 22 spec files, 111 tests. The
bundled project is clean and fast on it, which is one of the two legs of the comparison.

The other leg — `343s`, exit 1, four force-kills at `--workers=6` on `system-chrome` — carries the
headline number into both disclosure sites and rests on the implementing round's own measurement.
Re-deriving it would mean deliberately re-triggering an intermittent upstream stall, which is also
a residue hazard: it force-kills browser processes by construction. Two things follow. The stall is
intermittent at `6/8`, so a single re-run that came back clean would not falsify the figure either;
closing this properly needs a run count, not one run. And the figure is a characterisation of the
**unfixed exposure**, not of the remedy — the remedy is the pin plus the disclosure, and both of
those verify above.

### What would close the row

One command, repeated enough times to speak to a `6/8` rate, by a party that did not write the
packet:

```
npx --no-install playwright test tests/lifetime-tax*.spec.mjs \
  --config=playwright.config.mjs --project=system-chrome --workers=6 --reporter=line
```

with the browser-process count taken before and after each run, and `worker-N process did not exit
within` counted in each log. Until then the row asserts a transition to `Verified` on a cost figure
no independent party has reproduced, so it stays open.

## Independent Re-Derivation Round — The Controlled Pair At N=2

Run by a party that wrote no part of this packet and none of its remedy — the pin landed in
`13494be66` and the disclosure in `2d79740e1`, both before this round existed. This round answers
the one condition the partial round above left open, and it also corrects an attribution.

### The attribution correction

`bug.md` recorded *"The variable is the browser channel."* That is superseded. The reproduction
table it rests on varies the project at one worker and at six and contains **no `system-chrome`
run at two**, so the channel was the only variable left standing. The worker sweep already in this
report contradicts it directly: on a fixed `system-chrome` channel the stall rate moves 0/3 → 1/3 →
6/8 as the worker count moves 2 → 4 → 6. The corrected reading is in `bug.md` `## Root Cause`.

Nothing captured above is rewritten. The measurements were right; the sentence drawn from them was
not.

### The pair, re-derived

Both runs below are the same 22 `tests/lifetime-tax*.spec.mjs` files and the same 111 tests. The
only difference between them is `--workers`. Output was directed outside the repository.

```
npx --no-install playwright test tests/lifetime-tax*.spec.mjs \
  --config=playwright.config.mjs --project=system-chrome --reporter=list          # A2
npx --no-install playwright test tests/lifetime-tax*.spec.mjs \
  --config=playwright.config.mjs --project=system-chrome --workers=6 --reporter=list   # C2

A2 proj=system-chrome exit=0 wall=76s  forcekills=0 failmarks=0 |  111 passed (1.3m) | using 2 workers
C2 proj=system-chrome exit=1 wall=366s forcekills=4 failmarks=0 |  111 passed (6.1m) | using 6 workers
```

C2's four force-kill lines, verbatim:

```
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
Error: worker-5 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
```

Against the figures carried into both disclosure sites:

| Config | Recorded | This round | Exit | Force-kills | Tests |
|---|---|---|---|---|---|
| `system-chrome`, 2 workers | 81s | **76s** | 0 both | 0 both | 111 passed both |
| `system-chrome`, 6 workers | 343s | **366s** | 1 both | 4 both | 111 passed both |

The `343s` figure reproduces at `366s`, within 7%. The exit code, the force-kill count and the
all-passing result reproduce exactly. **Every test passed in all four runs**, so the non-zero exit
is teardown, never an assertion — `✘` count is 0 in each log.

### Two corroborating facts, re-counted rather than accepted

```
$ grep -n 'workers' .github/workflows/pages.yml
58:      run: npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list,json

$ ls -1 tests/lifetime-tax*.spec.mjs | wc -l
22
```

The pipeline runs this suite on the **same channel** the stall is observed under, at the one worker
count at which it has not been observed. That is the whole of why CI never reproduced it, and it is
why "switch channel" is the wrong instruction: CI is already on that channel.

### What this round does not establish

- **Not a rate.** N=2 per configuration. The `6/8` figure at six workers is not re-derived at that
  precision here; two runs cannot speak to a rate. What is re-derived is the controlled contrast
  and the cost figure, which is what the row was blocked on.
- **The channel is not exonerated.** The bundled `chromium` project remains clean wherever it was
  measured, but only at N=2 at six workers. Worker count is established as the governing term
  *within* `system-chrome`; that `chromium` would stall if pushed further is untested either way.
- **The transport mechanism is still unselected.** Candidates 1 and 2 above remain unresolved. This
  round instrumented nothing at that level.

### Process residue after a force-kill

The partial round flagged re-triggering the stall as a residue hazard. It was checked:

```
automation Chrome processes started today (this round's runs)  = 0
surviving automation Chrome processes, started Sat Aug 22      = 4   (build 151.0.7922.170)
```

C2 force-killed four workers and left **no** surviving browser process of its own. The four that do
survive predate this round by roughly two and a half days and run an older Chrome build than the
`151.0.7922.174` recorded against the remedy, so they belong to an earlier session. They are
reported, not claimed: this round did not produce them and did not remove them.

That cuts both ways and is recorded as such. It weakens `bug.md` `## Processes Survive The Run` as
a general claim — a stall does not always leak — while the two-and-a-half-day-old survivors show
that when it does leak, the orphans persist indefinitely.

### Code Diff Evidence

**Phase:** gaps
**Command:** `for commit in 13494be66 b08ba13f4 2d79740e1; do printf '%s ' "$commit"; git cat-file -t "$commit"; done && git --no-pager show --stat --oneline --decorate=no 13494be66 b08ba13f4 2d79740e1`
**Exit Code:** 0
**Claim Source:** executed

```text
13494be66 commit
b08ba13f4 commit
2d79740e1 commit
13494be66 fix(BUG-017): pin the worker count local runs share with the pipeline
 playwright.config.mjs                              |   6 +
 .../report.md                                      | 200 +++++++++++++++++++--
 .../scopes.md                                      |  32 ++--
 3 files changed, 211 insertions(+), 27 deletions(-)
b08ba13f4 BUG-017: correct the root cause from browser channel to worker count, and close the bug.md status row
 .specify/memory/agents.md                          | 24 ++++--
 playwright.config.mjs                              | 22 +++--
 .../bug.md                                         | 45 ++++++++--
 .../report.md                                      | 95 ++++++++++++++++++++++
 .../scopes.md                                      | 21 +++--
 5 files changed, 179 insertions(+), 28 deletions(-)
2d79740e1 BUG-017: take Scope 3 - disclose the macOS system-chrome teardown stall where the suite is run
 .specify/memory/agents.md                          |  12 ++
 playwright.config.mjs                              |  16 +-
 .../report.md                                      | 172 ++++++++++++++++++++-
 .../scopes.md                                      |  27 ++--
 .../state.json                                     |  38 +++--
 5 files changed, 239 insertions(+), 26 deletions(-)
```

The commits resolve as Git commit objects and include the non-artifact source path
`playwright.config.mjs`. This evidence does not certify the packet or alter human acceptance.

## Gaps Audit Finding Ledger - 2026-08-27 UTC

The canonical state-transition guard was executed against this packet. It exited `1` with 39
failures before this audit and 38 after the Code Diff Evidence repair above.

| Finding | Guard increments | Disposition |
| --- | ---: | --- |
| G053 lacked git-backed implementation delta evidence | 1 -> 0 | Addressed here with current-session commit-object and `git show` evidence over `13494be66`, `b08ba13f4` and `2d79740e1`. |
| G057 has no `scenario-manifest.json` | 1 | `route_required` to `bubbles.plan`; link the measured worker-count scenarios to the existing system-Chrome suite without inventing receipts. |
| G060 sees passing output before the first recognized failing marker | 1 | `route_required` to the producing execution owner; preserve the measurements and label their actual failing-before-passing proof order. |
| Scope completion is absent from `state.json` and G027 therefore rejects the phase claims | 2 | `route_required` to `bubbles.validate`; certification remains unchanged here. |
| Each of three scopes lacks scenario-specific E2E DoD, broader-suite DoD and an explicit scenario E2E Test Plan row | 10 | `route_required` to `bubbles.plan`; nine missing rows plus the aggregate refusal. |
| Ten checked measurement and remedy items have no resolvable evidence block | 10 | `route_required` to `bubbles.test`; attach existing frequency, threshold, candidate, repeated-run, process, timing and selftest evidence without re-running or rewriting history. |
| The plan resolves `node_modules/playwright/lib/runner/index.js` as implementation, producing two vendor TODO/STUB hits | 1 | `route_required` to `bubbles.plan`; the repository implementation is `playwright.config.mjs`, while the vendor file is causal evidence only. |
| G028 resolves no repository implementation file from the scope plan | 1 | `route_required` to `bubbles.plan`; name the worker-pin configuration and disclosure surfaces. |
| Eight Gherkin claims lack faithful DoD text: frequency; threshold; candidate discrimination; repeated zero exits; process release; proportional cost; developer disclosure; disclosure-not-substitute | 9 | `route_required` to `bubbles.plan`; eight claims plus the aggregate refusal. |
| G084 found trust-inheritance wording in the Scope 1 addendum | 1 -> 0 | Addressed by `bubbles.plan`; the addendum now says every premise was re-derived rather than accepted on trust, preserving the historical meaning. |
| G094 requires one spec classification and three design sections | 1 | `route_required` first to `bubbles.analyst`, then `bubbles.design`; classify the single worker-bound exposure remedy explicitly. |
| G136 reports unchecked human Checklist decisions | 1 | Human owner only. Automation must not tick them or strengthen the shared acceptance act. |

The open increments total 38. The packet remains `in_progress`.

## Test Phase — Planned Scenario Canaries And Revision Refresh

**Phase:** test
**Implementation revision:** `b1d358ce7ea7dcd5ecf27b3d3ef5707537c290b4`
**Claim Source:** executed

The three tests planned by `fb91c2e99` were appended to
`tests/playwright-runtime.foundation.functional.mjs`. The five existing test bodies were not
edited. The focused command over all three new titles passed with zero skipped tests:

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-(?:03|07|08)' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (1.732083ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (1.816166ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.151667ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 228.344958
```

### SCN-BUG017-03 causal-label mutation

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md --find '| 3 | Profile or lock contention | **Contradicted as profile contention** |' --replace '| 3 | Profile or lock contention | **Cause** |' --label 'SCN-BUG017-03 causal verdict is rejected' --bound 120 --summary-match 'Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence|SCN-BUG017-03: candidate 3 uses a forbidden causal verdict' -- node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-BUG017-03 causal verdict is rejected
file:             specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md
mutation:         | 3 | Profile or lock contention | **Contradicted as profile contention** |  ->  | 3 | Profile or lock contention | **Cause** |   (1 occurrence(s))
command:          node --test --test-name-pattern=\^Regression:\ SCN-BUG017-03\ candidate\ classifications\ require\ distinguishing\ evidence\$ tests/playwright-runtime.foundation.functional.mjs
red-exit:         1
red-summary:        AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 3 uses a forbidden causal verdict
green-exit:       0
green-summary:    ✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.765625ms)
summary-compared:   AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 3 uses a forbidden causal verdict  vs  ✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=bf60889e35a5e836673baed6ebb624d711ae66d4 restored=bf60889e35a5e836673baed6ebb624d711ae66d4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### SCN-BUG017-03 single-build-rationale mutation

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md --find 'only one Chrome build was available, so nothing is discriminated.' --replace 'the candidate was reviewed.' --label 'SCN-BUG017-03 untested candidate requires a discriminating rationale' --bound 120 --summary-match 'Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence|SCN-BUG017-03: candidate 4 lacks the single-build untested rationale' -- node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-BUG017-03 untested candidate requires a discriminating rationale
file:             specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md
mutation:         only one Chrome build was available, so nothing is discriminated.  ->  the candidate was reviewed.   (1 occurrence(s))
command:          node --test --test-name-pattern=\^Regression:\ SCN-BUG017-03\ candidate\ classifications\ require\ distinguishing\ evidence\$ tests/playwright-runtime.foundation.functional.mjs
red-exit:         1
red-summary:        AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 4 lacks the single-build untested rationale
green-exit:       0
green-summary:    ✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.708042ms)
summary-compared:   AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 4 lacks the single-build untested rationale  vs  ✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=bf60889e35a5e836673baed6ebb624d711ae66d4 restored=bf60889e35a5e836673baed6ebb624d711ae66d4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### SCN-BUG017-07 platform mutation

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file playwright.config.mjs --find 'and on macOS a `system-chrome` run' --replace 'and a `system-chrome` run' --label 'SCN-BUG017-07 config disclosure requires the platform' --bound 120 --summary-match 'Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence|SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS' -- node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-BUG017-07 config disclosure requires the platform
file:             playwright.config.mjs
mutation:         and on macOS a `system-chrome` run  ->  and a `system-chrome` run   (1 occurrence(s))
command:          node --test --test-name-pattern=\^Regression:\ SCN-BUG017-07\ disclosure\ names\ its\ platform\ project\ symptom\ and\ intermittence\$ tests/playwright-runtime.foundation.functional.mjs
red-exit:         1
red-summary:        AssertionError [ERR_ASSERTION]: SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS
green-exit:       0
green-summary:    ✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.657917ms)
summary-compared:   AssertionError [ERR_ASSERTION]: SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS  vs  ✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b restored=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### SCN-BUG017-08 worker-pin mutation

**Phase:** test
**Command:** `scripts/red-green-probe.sh --file playwright.config.mjs --find '  workers: 2,' --replace '  workers: 6,' --label 'SCN-BUG017-08 disclosure cannot replace the two-worker pin' --bound 120 --summary-match 'Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin|SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2' -- node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-BUG017-08 disclosure cannot replace the two-worker pin
file:             playwright.config.mjs
mutation:           workers: 2,  ->    workers: 6,   (1 occurrence(s))
command:          node --test --test-name-pattern=\^Regression:\ SCN-BUG017-08\ disclosure\ cannot\ replace\ the\ system-chrome\ worker\ pin\$ tests/playwright-runtime.foundation.functional.mjs
red-exit:         1
red-summary:        AssertionError [ERR_ASSERTION]: SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2
green-exit:       0
green-summary:    ✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.643667ms)
summary-compared:   AssertionError [ERR_ASSERTION]: SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2  vs  ✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b restored=d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### Full linked functional file

**Phase:** test
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

The complete file was run from the clean temporary worktree with checkout-local dependencies.
Seven tests passed, including all three tests added here. The unchanged discovery-boundary test
failed on eight committed `portfolio-survival-*.spec.mjs` files selected by both Playwright and a
declared direct-Node glob. The same test failed with the same eight-file set at the untouched
planning revision `fb91c2e99`, before these tests existed.

```text
# implementation revision b1d358ce7
exit: 1
lines: 65
sha256: d3a799640509c97f74bde44eb9eaadc95dcd59a914386cd8682560b2542b64d0
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin
AssertionError [ERR_ASSERTION]: file selected by both the browser matcher and a declared node --test glob
actual: tests/portfolio-survival-accessibility.spec.mjs, tests/portfolio-survival-allocation.spec.mjs, tests/portfolio-survival-brief.spec.mjs, tests/portfolio-survival-diversification.spec.mjs, tests/portfolio-survival-foundation.spec.mjs, tests/portfolio-survival-mobile.spec.mjs, tests/portfolio-survival-paths.spec.mjs, tests/portfolio-survival-risk.spec.mjs

# untouched planning revision fb91c2e99
exit: 1
lines: 62
sha256: 6fc6427ba47a7466b91265a0ef080ced62106a702f2cffbe4d8ad297c279ae71
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
AssertionError [ERR_ASSERTION]: file selected by both the browser matcher and a declared node --test glob
actual: tests/portfolio-survival-accessibility.spec.mjs, tests/portfolio-survival-allocation.spec.mjs, tests/portfolio-survival-brief.spec.mjs, tests/portfolio-survival-diversification.spec.mjs, tests/portfolio-survival-foundation.spec.mjs, tests/portfolio-survival-mobile.spec.mjs, tests/portfolio-survival-paths.spec.mjs, tests/portfolio-survival-risk.spec.mjs
```

The unchanged failure is not repaired here because its producers and direct-Node declarations
belong to the portfolio-survival feature. Growing `KNOWN_DISCOVERY_CROSSINGS` would weaken the
existing shrink-only ratchet rather than repair those declarations.

### Complete 22-file lifetime-tax system-Chrome workload

**Phase:** test
**Command:** `npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-017 22 lifetime-tax specs system-chrome at b1d358ce7
exit: 0
lines: 116
sha256: dfcb137ac0b0d8e3d65cdd5337756e35bdbc133f8393e8ec309eb977934766fd
Running 111 tests using 2 workers
✓ [system-chrome] Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount
✓ [system-chrome] Regression: SCN-022-013 the combined total is the sum of two independent settlements
✓ [system-chrome] Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds
✓ [system-chrome] Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement
✓ [system-chrome] Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed
✓ [system-chrome] Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted
✓ [system-chrome] Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on
111 passed (1.3m)
```

### Receipt-state and repository validation at `56957d514`

**Phase:** test
**Claim Source:** executed

The receipt resolver was required through every applicable state up to
`REGRESSION_GREEN`. It exited 0 and derived all eight states from current-revision receipts:

```text
source revision: 56957d5144bf
SCN-BUG017-01 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-02 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-03 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-04 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-05 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-06 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-BUG017-07 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
SCN-BUG017-08 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
all 165 refusals are SCS-REVISION-DRIFT: superseded receipts, excluded from derivation, not blocking
certifiable: yes
exit: 0
lines: 177
sha256: ecff205e60cc8896ffafe68beef8bd403c443a2f1149be62147b95617e707f4a
```

The same transition guard was measured immediately before and after the receipt refresh. The
scenario-state check cleared; certification and human-acceptance gates remained unchanged:

```text
BEFORE revision=b1d358ce7 exit=1 lines=603 sha256=a3cc937b9cfb1e0725055c13995a1ae56073d2b88f846ae78a5accf2f440dc61
failedGateIds: [G027,G136]
failedChecks: [Check-4-scenario-states]
failureCount: 5

AFTER revision=56957d514 exit=1 lines=388 sha256=0a176ec7f35cb85714f992e74057c7789d112694aecf2fb35b44cf2b41db713e
failedGateIds: [G027,G136]
failedChecks: []
failureCount: 4
```

The full linked functional file remained at seven passing tests and one failure already observed
at planning revision `fb91c2e99`. The same eight portfolio-survival crossings failed there; all
three BUG-017 titles passed in the final run.

```text
command: node --test tests/playwright-runtime.foundation.functional.mjs
revision: 56957d514
exit: 1
lines: 65
sha256: 34eb31dbacc54012dc60f297d3168045b5cca9fe0158a2f833613796c7837406
pass: 7
fail: 1
failure: committed discovery boundary keeps browser specs and direct Node suites disjoint
actual: 8 committed tests/portfolio-survival-*.spec.mjs crossings
```

The clean-worktree repository checks produced these independent outcomes:

```text
scenario-test-resolve: exit=0 references=17 resolved=17
scenario-obligation-lint: exit=0 scenarios=8
test-mechanism-lint: exit=0 mechanisms=8
artifact-lint: exit=0 PASSED
acceptance-bulk-stamp: exit=0 new=0 stale=0
spec-test-paths: exit=0 new=0 stale=0
pii-scan: exit=0 findings=0 files=10007
scope-dod-progress: exit=1 new=13, including 3 BUG-017 certification-count drifts
repository selftest: exit=1 pass=3464 fail=1
selftest sha256: b632ae4ecf9b8302cbefcfd8244cae628d763c3b070e88730c0e94eaea276d3d
selftest failure: scope progress reports the same 13 certification-count drifts
```

## Current-Main Test Evidence At `6ad5f4252`

**Phase:** test
**Claim Source:** executed

The three exact functional canaries each passed independently at the current local `main` tip.

### Current-Main SCN-BUG017-03 Evidence

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (1.148042ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 234.347417
sha256: 2e6db3a7a309a6ad8bd9dd7e1870088a4b91cdc2587d76885d8c6a9462fd68e6
```

Both planned negative controls discriminated and restored `report.md` to its initial blob hash.

```text
probe: SCN-BUG017-03 causal verdict is rejected
exit: 0
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 3 uses a forbidden causal verdict
green-exit: 0
revert-verified: yes
committed: bd8499976af53a2aa8106b98b57bc9660e8b8622
restored: bd8499976af53a2aa8106b98b57bc9660e8b8622
discriminating: yes
sha256: 00c55f758120b71e84d5f388e45037a825f4cefc3a1aa430ba67041584268d40
probe: SCN-BUG017-03 untested candidate requires a discriminating rationale
exit: 0
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 4 lacks the single-build untested rationale
green-exit: 0
revert-verified: yes
committed: bd8499976af53a2aa8106b98b57bc9660e8b8622
restored: bd8499976af53a2aa8106b98b57bc9660e8b8622
discriminating: yes
sha256: be8c4af15f2ae1a56ff1997e1402b936a141577c062b3cf764b3509c79b70c25
```

### Current-Main SCN-BUG017-07 Evidence

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.83525ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 222.022625
sha256: 3810907e76e0de1475e7914b1a704f78292c0b8e994fccc34d8149534a58aaa0
```

The planned platform-removal negative control discriminated and restored `playwright.config.mjs`.

```text
probe: SCN-BUG017-07 config disclosure requires the platform
exit: 0
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes
sha256: 1a3d8c12a5cf703ac6b63b0d14ccac14335bd36b64ef72c728695e63b1ab3ced
```

### Current-Main SCN-BUG017-08 Evidence

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.8965ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 204.125834
sha256: 0e5edec396cd827ca74ccf122e501ac1b102162645ef187d4205935028a64ffe
```

The planned worker-pin negative control discriminated and restored `playwright.config.mjs`.

```text
probe: SCN-BUG017-08 disclosure cannot replace the two-worker pin
exit: 0
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes
sha256: abb1516ce91e396e8e0313aaafa2753a15a47c2341d152915705b64fc937ef5b
```

### Current-Main Broader Runs

The complete linked functional file still exposes the discovery-boundary failure already recorded
at planning revision `fb91c2e99`. The current run proves all three BUG-017 titles pass, but it does
not prove that all five earlier runtime-foundation tests are green.

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
exit: 1
lines: 65
sha256: 6256543048352fd802ecdc73ac673ff8b2478a6ba6a7a3baec54a74fa396a9ef
pass: 7
fail: 1
passed: Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence
passed: Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence
passed: Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin
failure: committed discovery boundary keeps browser specs and direct Node suites disjoint
actual: 8 committed tests/portfolio-survival-*.spec.mjs crossings
```

The first browser-suite attempt quoted the glob and therefore passed a literal pattern to Playwright;
it exited `1` with `No tests found` and is not suite evidence. The corrected repository command let
the shell expand all 22 files and passed all 111 tests under `system-chrome` with two workers.

**Command:** `npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 111 tests using 2 workers
✓ Regression: SCN-022-013 the combined total is the sum of two independent settlements
✓ Regression: SCN-021-03 the configuration read is bounded by its own stratum-0 declaration when that origin never responds
✓ Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement
✓ Regression: SCN-021-01 the settlement header does not remain Loading once the declared bound has elapsed
✓ Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted
✓ Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on
111 passed (1.3m)
exit: 0
lines: 116
sha256: 63de266d13dd8407eb703a9bcf7fbd2bbf2ea5c0a34746628607206140c1012c
```

## Integration-Revision Receipt Refresh Evidence At `8091b5767`

**Phase:** test
**Claim Source:** executed

The run started from `8091b5767de2d1f6529b2800f466a21b85e26d57`. The receipt
resolver derived `PLANNED` for all eight scenarios and excluded 253 superseded receipts.
The linked-test resolver then resolved all 17 references with exit 0.

### Three Exact Functional Canaries

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
exit: 0
lines: 9
sha256: 503fd1fb55d128f363cd3e4f5e1688a6753a6e2a24e74e364edec9ed4747138e
test: Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence
tests: 1
pass: 1
fail: 0
skipped: 0
todo: 0
duration_ms: 186.097625
```

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
exit: 0
lines: 9
sha256: cd7c581f9b931d7c12b89184e0373867d0a3283229ed70c9682a1695ffed4871
test: Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence
tests: 1
pass: 1
fail: 0
skipped: 0
todo: 0
duration_ms: 179.273917
```

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
exit: 0
lines: 9
sha256: 026b03185b3ada4b0e564235721a23184f18da9d8f864752bade8e3e829555ef
test: Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin
tests: 1
pass: 1
fail: 0
skipped: 0
todo: 0
duration_ms: 184.709208
```

### Four Discriminating RED/GREEN Probes

Each command used `scripts/red-green-probe.sh` with the exact mutation and test from
`scopes.md`. Every probe produced its planned assertion, reran GREEN, and restored the
tracked target to its starting blob.

```text
SCN-BUG017-03 causal-label probe
exit: 0
sha256: e5e913cc4e61c21c3e2bdc6de01c76f3f94c43f7196b8715658833c3386a1375
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 3 uses a forbidden causal verdict
green-exit: 0
revert-verified: yes
committed: 7283e27d5a8bb1a87de90bc6eb2b516f0235dc9a
restored: 7283e27d5a8bb1a87de90bc6eb2b516f0235dc9a
discriminating: yes

SCN-BUG017-03 single-build-rationale probe
exit: 0
sha256: 6d360fce8e023472999c7e7ba66ad884ddbfc22127ba7ae0fdcff2e861c2d2b4
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 4 lacks the single-build untested rationale
green-exit: 0
revert-verified: yes
committed: 7283e27d5a8bb1a87de90bc6eb2b516f0235dc9a
restored: 7283e27d5a8bb1a87de90bc6eb2b516f0235dc9a
discriminating: yes

SCN-BUG017-07 platform-removal probe
exit: 0
sha256: 9686d361e30b735f5a8b9edd6cfdb21b98d41713a8025a4a52bbe7b0ae05915b
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes

SCN-BUG017-08 two-to-six-worker probe
exit: 0
sha256: b4ec98437896985095c4c6b234f3b4f60e4ef8bcac00b19055e72a9c599eff4b
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes
```

### Complete Runtime-Foundation File

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
exit: 1
lines: 65
sha256: c5d9c19964591670b346217e700e658f8fc15bd41991cfc753d75a8028b2181c
pass: shared runtime exports the exact checkout-local Playwright 1.61.1 API
pass: shared runtime rejects sibling global-prefix and npm-cache Playwright packages
pass: shared runtime contains no browser executable or package fallback authority
pass: every Playwright spec uses the shared seam and sole committed browser config
failure: committed discovery boundary keeps browser specs and direct Node suites disjoint
actual: tests/portfolio-survival-accessibility.spec.mjs
actual: tests/portfolio-survival-allocation.spec.mjs
actual: tests/portfolio-survival-brief.spec.mjs
actual: tests/portfolio-survival-diversification.spec.mjs
actual: tests/portfolio-survival-foundation.spec.mjs
actual: tests/portfolio-survival-mobile.spec.mjs
actual: tests/portfolio-survival-paths.spec.mjs
actual: tests/portfolio-survival-risk.spec.mjs
```

This failure keeps SCN-BUG017-03 and SCN-BUG017-07 at `PLANNED`. Their focused
tests and mutations passed, but their unchecked DoD rows also require the complete file green.

### Complete 22-File Lifetime-Tax Workload

**Command:** `npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
runner: Version 1.61.1
exit: 0
lines: 116
sha256: fa5ec30573aa8028e9df2fa0d24881c7240251cda2da3f24a87e34a782186ec6
files: 22
project: system-chrome
workers: 2
tests: 111
passed: 111
failed: 0
skipped: 0
duration: 1.3m
```

## Current-Head Closure After BUG-022

**Phase:** test
**Base revision:** `4b549f9d8ffd2ed37100b31691cf71f7fe9c9fec`
**Claim Source:** executed

BUG-022 removed the shared discovery-boundary failure. This round reran each BUG-017
functional canary and negative control before changing this packet.

### Exact Scenario Tests

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-017 SCN-03 exact current-head
exit: 0
lines: 9
sha256: 6e1e3fa3848c7c981635a1aae342aa192ee71f45333e43c437a5b8b94305162a
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.862458ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 196
```

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-017 SCN-07 exact current-head
exit: 0
lines: 9
sha256: c73f936c8ccc627fa2dba2f5afcb105639d842933c298e7d79c4ca4f92b02f49
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.77425ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 192.781333
```

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-017 SCN-08 exact current-head
exit: 0
lines: 9
sha256: 7442fe84022719ff5a2228ea17c72fe74343a8a16b84a493476e931670db1b61
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.698916ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 179.490542
```

### Four Revision-Current RED/GREEN Probes

The commands match the four mutations in `scopes.md`. Each probe emitted its specified
assertion, reran GREEN, and restored the tracked file to its starting blob hash.

```text
SCN-BUG017-03 causal-label probe
exit: 0
capture-sha256: ac691048d346998bb99a98c3845fb050ab616a1e2d6bfb12b426765931a86a0f
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 3 uses a forbidden causal verdict
green-exit: 0
revert-verified: yes
committed: 7ca974130ac963da62ee8e46eb08132f73ab1a55
restored: 7ca974130ac963da62ee8e46eb08132f73ab1a55
discriminating: yes

SCN-BUG017-03 single-build-rationale probe
exit: 0
capture-sha256: aeb47674b8a4485cd76503e56c187a01bd7bca6481b6aacce3b4ccdbb6902812
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-03: candidate 4 lacks the single-build untested rationale
green-exit: 0
revert-verified: yes
committed: 7ca974130ac963da62ee8e46eb08132f73ab1a55
restored: 7ca974130ac963da62ee8e46eb08132f73ab1a55
discriminating: yes

SCN-BUG017-07 platform-removal probe
exit: 0
capture-sha256: 090ae9f197f0ff3d038a5657201eaf523430a29bdb4244c126faefa070338e92
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes

SCN-BUG017-08 two-to-six-worker probe
exit: 0
capture-sha256: 465a8087cc87cef603827c8e6c705b3f1ae0eea412eb40e0000700dbd05aef42
red-exit: 1
red-summary: AssertionError [ERR_ASSERTION]: SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2
green-exit: 0
revert-verified: yes
committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
restored: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
discriminating: yes
```

A separate hash check returned the same working and committed blobs after all probes:

```text
report working: 7ca974130ac963da62ee8e46eb08132f73ab1a55
report committed: 7ca974130ac963da62ee8e46eb08132f73ab1a55
config working: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
config committed: d888fc38c3e2d92309b1efbf84b4f9322d2a9a9b
worktree status: clean
```

### Complete Runtime Foundation

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-017 full runtime foundation current-head after BUG-022
exit: 0
lines: 44
sha256: a5d6c83da1bb214e6d7a25a95257f238341a485a7bda9db197bc2e1b5f1797c8
--- first 20 ---
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] committedBrowserConfigs=playwright.config.mjs
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] sharedImporters=79
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
--- omitted 4 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ shared runtime contains no browser executable or package fallback authority (0.18775ms)
✔ every Playwright spec uses the shared seam and sole committed browser config (1516.740625ms)
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint (3.161833ms)
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs (1.549334ms)
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative (1.323375ms)
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority (1.262834ms)
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance (37.539ms)
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth (393.276542ms)
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority (389.705917ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.388125ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.209792ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.13425ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2716.651291
```

The diff from `b1d358ce7` adds BUG-022 helpers and six tests after the fifth original
test body. It changes none of the five original test bodies. The current run reports all
five original tests and all nine later regressions green.

### Manifest Authorship State

The three structured BUG-017 links already use the canonical `testState: "authored"` value.
Currentness remains receipt-derived, so this round did not add a declared scenario state.

### Distinct Two-Worker Teardown Recurrence

**Claim Source:** interpreted from BUG-022's executed report evidence

BUG-022 separately ran the 94-test Feature 008 Playwright command. Its report records
`94 passed`, two force-kill errors, and process exit 1 at the configured two-worker setting.
This BUG-017 round did not execute that command and does not claim that it passed.

The recurrence belongs to BUG-017's runtime remedy owner. It shows that the two-worker pin
bounds exposure but does not eliminate it. It does not satisfy Feature 008's Playwright pass
row, and it is not evidence for either checkbox closed above.

## Current-Revision Stabilization At `d532faaac` {#current-revision-stabilization-at-d532faaac}

**Phase:** stabilize
**Claim Source:** interpreted
**Interpretation:** Fresh execution falsifies the packet's current two-worker elimination claim.
The defect is tied to the Foundation workload's Chrome transport shutdown. Machine load can
amplify the condition, but it is neither necessary nor sufficient in this sample.

No source, test, configuration, state, certification, acceptance, checkbox, protected Feature
008 report, or baseline changed in this stabilization round. All source probes ran in a detached
clean worktree and were restored byte-for-byte.

### Bounded Full-Run Matrix

Every matrix leg used the same eight `tests/portfolio-survival-*.spec.mjs` files, the
`system-chrome` project, list reporter, and output directory. Only `--workers` changed.

| Run | Workers | Start load | Tests | Playwright result | Wall | Owned residue |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| W2-R1 | 2 | 32.14 | 94 | 94 passed, 3 force-kills, exit 1 | 352s | 0 |
| W1-R1 | 1 | 6.53 | 94 | 94 passed, exit 0 | 91s | 0 |
| W2-R2 | 2 | 8.90 | 94 | 94 passed, 3 force-kills, exit 1 | 358s | 0 |
| W1-R2 | 1 | 11.24 | 94 | 94 passed, exit 0 | 91s | 0 |

The current sample is **2 of 2 failures at two workers** and **0 of 2 failures at one worker**.
It does not estimate a stable long-run rate. It directly contradicts the historical `0/3` at
two workers and the text that says the committed pin eliminates the default-path recurrence.

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 900 /bin/zsh -f /tmp/rl-bug017-run-probe-db38903e.zsh 2 W2-R1`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `a19b8e6531815afdc387878a559c71c280f94edb82383860826ede92ed3d465e`

```text
RUN_BEGIN id=W2-R1 workers=2 head=d532faaacff25987dda284d68740c0c68bd466ad output=/tmp/rl-bug017-matrix-output-db38903e
RUNNER_VERSION=Version 1.61.1
MACHINE logicalCpu=12 load={ 32.14 12.29 8.37 }
Running 94 tests using 2 workers
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
94 passed (5.9m)
3 errors were not a part of any test, see above for details
PLAYWRIGHT_EXIT id=W2-R1 workers=2 exit=1 wallSeconds=352
PROCESS_COUNTS label=after-W2-R1 worktreeCwd=0 remoteDebugChrome=0
WORKTREE_STATUS id=W2-R1 porcelainLines=0
RUN_END id=W2-R1 workers=2 exit=1
```

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 900 /bin/zsh -f /tmp/rl-bug017-run-probe-db38903e.zsh 1 W1-R1`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `d75071754703a264d7a04ecb3420c27320fd978761a5d1fcce9ea4dada0ddf7b`

```text
RUN_BEGIN id=W1-R1 workers=1 head=d532faaacff25987dda284d68740c0c68bd466ad output=/tmp/rl-bug017-matrix-output-db38903e
RUNNER_VERSION=Version 1.61.1
MACHINE logicalCpu=12 load={ 6.53 7.59 7.42 }
Running 94 tests using 1 worker
94 passed (1.5m)
PLAYWRIGHT_EXIT id=W1-R1 workers=1 exit=0 wallSeconds=91
MACHINE_AFTER logicalCpu=12 load={ 9.52 8.30 7.71 }
PROCESS_COUNTS label=after-W1-R1 worktreeCwd=0 remoteDebugChrome=0
WORKTREE_STATUS id=W1-R1 porcelainLines=0
RUN_END id=W1-R1 workers=1 exit=0
```

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 900 /bin/zsh -f /tmp/rl-bug017-run-probe-db38903e.zsh 2 W2-R2`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `e638b42496b7485ced98f41e77a7e3b76797bea1fe06a3a1b0ef382357f4d9f4`

```text
RUN_BEGIN id=W2-R2 workers=2 head=d532faaacff25987dda284d68740c0c68bd466ad output=/tmp/rl-bug017-matrix-output-db38903e
RUNNER_VERSION=Version 1.61.1
MACHINE logicalCpu=12 load={ 8.90 8.21 7.69 }
Running 94 tests using 2 workers
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
94 passed (6.0m)
3 errors were not a part of any test, see above for details
PLAYWRIGHT_EXIT id=W2-R2 workers=2 exit=1 wallSeconds=358
PROCESS_COUNTS label=after-W2-R2 worktreeCwd=0 remoteDebugChrome=0
WORKTREE_STATUS id=W2-R2 porcelainLines=0
RUN_END id=W2-R2 workers=2 exit=1
```

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 900 /bin/zsh -f /tmp/rl-bug017-run-probe-db38903e.zsh 1 W1-R2`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `e64b8a9333804324ea369decc8024f80ea470b7c0c1c5335b5254638e6e859ce`

```text
RUN_BEGIN id=W1-R2 workers=1 head=d532faaacff25987dda284d68740c0c68bd466ad output=/tmp/rl-bug017-matrix-output-db38903e
RUNNER_VERSION=Version 1.61.1
MACHINE logicalCpu=12 load={ 11.24 7.74 7.62 }
Running 94 tests using 1 worker
94 passed (1.5m)
PLAYWRIGHT_EXIT id=W1-R2 workers=1 exit=0 wallSeconds=91
MACHINE_AFTER logicalCpu=12 load={ 18.25 11.21 8.97 }
PROCESS_COUNTS label=after-W1-R2 worktreeCwd=0 remoteDebugChrome=0
WORKTREE_STATUS id=W1-R2 porcelainLines=0
RUN_END id=W1-R2 workers=1 exit=0
```

### Process Ancestry And Residue

The clean-worktree tree was the outer probe, `npx`, the Playwright runner, and Playwright worker
processes. During W2-R1, one worker remained at 5m50s. During W2-R2, two workers remained at
5m28s while load had fallen to 3.67. Neither sample contained a clean-worktree Chrome process.
Every completed run returned the clean-worktree Playwright and remote-debugging process counts
to zero.

A separate `playwright test-server` appeared under the VS Code extension host in the developer
worktree. It had no children and listened on an ephemeral loopback port. Its PID changed between
samples. It was not a descendant of any matrix runner and is not counted as matrix residue.

### Shutdown Stage

The fifth full run enabled `DEBUG=pw:test,pw:test:protocol` and counted against the six-run cap.
All 94 scenarios passed. Playwright logged the `headless`, `playwright`, and final teardown stages
as finished at the same timestamp. One worker then remained alive until the 300000ms dispatcher
bound expired.

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 900 env DEBUG_COLORS=0 DEBUG='pw:test,pw:test:protocol' PW_RUNNER_DEBUG=1 /bin/zsh -f /tmp/rl-bug017-run-probe-db38903e.zsh 2 W2-DEBUG`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `10148920bc288294dc3f7e87d9d218b8899d8a4d2c009f2e24a06f38441438e8`

```text
Running 94 tests using 2 workers
2026-08-27T17:10:37.526Z pw:test started teardown "headless"
2026-08-27T17:10:37.526Z pw:test finished teardown "headless"
2026-08-27T17:10:37.526Z pw:test started teardown "playwright"
2026-08-27T17:10:37.526Z pw:test finished teardown "playwright"
2026-08-27T17:10:37.526Z pw:test started teardown
2026-08-27T17:10:37.526Z pw:test finished teardown
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
94 passed (5.7m)
1 error was not a part of any test, see above for details
PLAYWRIGHT_EXIT id=W2-DEBUG workers=2 exit=1 wallSeconds=345
PROCESS_COUNTS label=after-W2-DEBUG worktreeCwd=0 remoteDebugChrome=0
WORKTREE_STATUS id=W2-DEBUG porcelainLines=0
RUN_END id=W2-DEBUG workers=2 exit=1
```

### Workload Isolation

The selected specs create no Node timers, subprocesses, watchers, or sockets beyond their
per-file HTTP servers. Every server has an awaited `afterAll`. The shared server closes all
connections after `server.close()` starts.

The allocation and diversification pair passed 26 tests at two workers. Both workers received
`__stop__`, closed Chrome, reached `process.exit(0)`, and retained only IPC, stdout, and stderr.
The Foundation and Paths pair passed 27 tests, but the Foundation worker retained two anonymous
Socket handles after Chrome exited. It never reached `process.exit(0)` and hit the strict 15000ms
diagnostic bound. Foundation alone reproduced the same result.

The first eight and second eight Foundation rows each closed cleanly. The first twelve and first
thirteen rows also closed cleanly. Adding `SCN-008-042` as row fourteen reproduced the transport
stall. The second half contains `SCN-008-042` and closes cleanly, so that row is not independently
causal. The trigger is the cumulative Foundation sequence ending at that row.

### Rejected Lifecycle Shapes

A bare `browser.close()` in the Foundation `afterAll` closed the transport in a focused run.
It is not safe because Playwright can reuse that worker browser for another spec. Foundation
followed by Paths at one worker failed the first Paths test with
`browser.newContext: Target page, context or browser has been closed`.

The same bare close failed the sixth and final full run. Playwright recorded one failed test and
`"afterAll" hook timeout of 30000ms exceeded`. VS Code discarded the async terminal payload before
it could be retrieved, so the outer numeric exit is not admissible evidence. Playwright's own
`.last-run.json` records `status: failed`. This run cannot satisfy BUG-022 C03.

Closing from a worker fixture teardown also failed. That teardown occurs too late and enters the
same stuck transport path.

### Focused Root-Fix Candidate

The discriminating candidate combines two requirements:

1. Give the Foundation test type one auto worker-scoped boundary fixture.
2. Close its browser in the existing `afterAll`, before worker fixture teardown.

The boundary makes Playwright start a fresh worker for later base-test specs. The early close
removes the Foundation Chrome transport before the vendor stop path. Foundation followed by Paths
at one available worker passed all 27 tests. Both worker processes reached `process.exit(0)` within
the strict 15000ms stop bound.

**Phase:** stabilize
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 300 env NODE_OPTIONS='--require=/tmp/rl-bug017-worker-stop-probe-db38903e.cjs' PWTEST_CHILD_PROCESS_TIMEOUT=15000 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --output=/tmp/rl-bug017-scoped-output-db38903e`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `f7500cd5aaea6c71e85a72926cc08acba72a0dad7e3fe0f7badedb5fcaa1f15b`

```text
Running 27 tests using 1 worker
[BUG017-WORKER pid=91462] probe installed
[SCN-008-003] portfolioUnchanged=true
[SCN-008-003] hardConstraints=2
[SCN-008-003] researchConstraints=0
[SCN-008-003] cashNeeds=1
[SCN-008-003] absentFields=4
[SCN-008-003] behaviorContribution=none
[SCN-008-003] remotePersonalRequests=0
[BUG017-WORKER pid=91462] exit event code=0
[BUG017-WORKER pid=11198] probe installed
[BUG017-WORKER pid=11198] exit event code=0
  27 passed (1.0m)
```

This focused proof does not certify the candidate against the complete 94-test workload. The
six-full-run cap is exhausted. No seventh full run executed.

### Current Verdict And Owner Route

**Verdict:** `UNSTABLE`

Three findings remain open:

1. `STAB-BUG017-001` high: the committed two-worker claim is stale and false for this workload.
2. `STAB-BUG017-002` high: the Foundation sequence can strand the system-Chrome pipe transport.
3. `STAB-BUG017-003` high: BUG-022 C03 has no final-tree exit-0 evidence.

Planning ownership must add the current recurrence, lifecycle boundary, and persistent regression
contract to BUG-017. Implementation ownership must apply the focused worker-boundary plus early
close shape. Test ownership must run the strict Foundation-to-Paths canary and one fresh exact
BUG-022 C03 command. A one-worker config pin is the measured low-cost mitigation if the lifecycle
candidate fails that complete run. The historical `0/3` claim must not survive either route.

The packet and certification status remain `in_progress`. No completion or stabilize phase claim
is recorded for BUG-022.


## Scope 4 Implementation - Foundation-Owned Browser Lifecycle {#scope-4-implementation-foundation-owned-browser-lifecycle}

**Phase:** implement
**Claim Source:** executed
**Execution time:** 2026-08-27T19:13:15Z

The selected route is the Foundation-local lifecycle boundary. The complete two-worker gate
passed, so the one-worker fallback was not eligible and `playwright.config.mjs` remains unchanged.
No stabilize or regression phase is claimed here for either packet.

### Failing-First Strict Canary

The persistent canary ran before the Foundation implementation changed. All 27 browser tests
executed, one worker exited after stop, and the Foundation worker received `__stop__` without
emitting an exit record before Playwright's strict child timeout. The outer test therefore exited
1 on its lifecycle assertion.

**Phase:** implement
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `e14819d5f126b560fe01a2f760efa8b72cb00ce1907edf1a1bacf7f6b2618854`

```text
# BUG-017 Scope 4 RED missing Foundation lifecycle boundary
exit: 1
lines: 401
sha256: e14819d5f126b560fe01a2f760efa8b72cb00ce1907edf1a1bacf7f6b2618854
Running 27 tests using 2 workers
[BUG017-CANARY pid=35931] installed
[BUG017-CANARY pid=35928] stop at=1787857034134
[BUG017-CANARY pid=35928] exit code=0 at=1787857034322 elapsedMs=188
[BUG017-CANARY pid=35931] stop at=1787857040429
AssertionError [ERR_ASSERTION]: SCN-BUG017-09: child did not exit zero within the strict worker-stop bound
actual: 1
expected: 0
```

### Persistent Strict Canary GREEN

**Phase:** implement
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `2f420eb5de2bc1adaf66b186b7cef13f64e6e598ce5f21dba86d6edcdc7fdfc7`

```text
# BUG-017 Scope 4 GREEN Foundation lifecycle boundary
exit: 0
lines: 199
sha256: 2f420eb5de2bc1adaf66b186b7cef13f64e6e598ce5f21dba86d6edcdc7fdfc7
Running 27 tests using 2 workers
[BUG017-CANARY pid=71742] stop at=1787857107160
[BUG017-CANARY pid=71742] exit code=0 at=1787857107336 elapsedMs=176
[BUG017-CANARY pid=71744] stop at=1787857135938
[BUG017-CANARY pid=71744] exit code=0 at=1787857135942 elapsedMs=4
[SCN-BUG017-09] tests=27
[SCN-BUG017-09] workers=2
[SCN-BUG017-09] workerStops=2
[SCN-BUG017-09] workerExits=2
[SCN-BUG017-09] maxStopToExitMs=176
[SCN-BUG017-09] forceKills=0
[SCN-BUG017-09] residue=0
tests 1
pass 1
fail 0
skipped 0
todo 0
```

### Close-Removal Discriminator And Exact Restoration

The self-reverting probe removed only the Foundation-owned close. Both arms retained 27 passing
page tests. RED exited 1, restored GREEN exited 0, and the committed Foundation blob was restored
exactly.

**Phase:** implement
**Command:** `scripts/red-green-probe.sh --file tests/portfolio-survival-foundation.spec.mjs --find '  if (foundationBrowser) await foundationBrowser.close();' --replace '  void foundationBrowser;' --label 'SCN-BUG017-09 Foundation-owned close is required' --bound 300 --summary-match '27 passed' -- node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `e852083fb655f5addb9bc5e33d840f60e7988d91c333920aaa085a0e5d4671e4`

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-BUG017-09 Foundation-owned close is required
file:             tests/portfolio-survival-foundation.spec.mjs
mutation:           if (foundationBrowser) await foundationBrowser.close();  ->    void foundationBrowser;   (1 occurrence(s))
command:          node --test --test-name-pattern=^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$ tests/playwright-runtime.foundation.functional.mjs
red-exit:         1
red-summary:          27 passed (43.4s)
green-exit:       0
green-summary:      27 passed (46.3s)
summary-compared:     27 passed (<elapsed>)  vs    27 passed (<elapsed>)   (elapsed time normalised out)
revert-verified:  yes (committed=2731a3f5455e888b408c80c5ffe0355c2acc1d1e restored=2731a3f5455e888b408c80c5ffe0355c2acc1d1e)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### Lifecycle Containment Regression

**Phase:** implement
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-11 lifecycle remediation cannot hide force-kill or switch browser project$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `338690f98f9738373d40af01999492949272b7ce313d74bfef07f648dfa0fe70`

```text
[SCN-BUG017-11] project=system-chrome
[SCN-BUG017-11] channel=chrome
[SCN-BUG017-11] workers=2
[SCN-BUG017-11] defaultWorkerStopBudgetMs=300000
[SCN-BUG017-11] browserCloseBeforeServer=true
[SCN-BUG017-11] forceKillErrorsStreamed=true
[SCN-BUG017-11] teardownErrorsCaught=0
Regression: SCN-BUG017-11 lifecycle remediation cannot hide force-kill or switch browser project
tests 1
pass 1
fail 0
cancelled 0
skipped 0
todo 0
```

### Exact BUG-022 C03 At Workers Two

The canonical wildcard expanded to the same eight portfolio-survival spec files. Playwright
resolved two workers, passed all 94 tests, emitted no failure-shaped force-kill block, and exited
0. This is the acceptance discriminator that retains the lifecycle candidate.

**Phase:** implement
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `763bea8081d68ed1803dd58797307c0bf0bd541cb206c60a898c36db061f3620`

```text
# BUG-017 Scope 4 TP-BUG017-04-03 exact BUG-022 C03 workers 2
exit: 0
lines: 303
sha256: 763bea8081d68ed1803dd58797307c0bf0bd541cb206c60a898c36db061f3620
Running 94 tests using 2 workers
system-chrome: portfolio-survival-accessibility.spec.mjs
system-chrome: portfolio-survival-allocation.spec.mjs
system-chrome: portfolio-survival-brief.spec.mjs
system-chrome: portfolio-survival-diversification.spec.mjs
system-chrome: portfolio-survival-foundation.spec.mjs
system-chrome: portfolio-survival-mobile.spec.mjs
system-chrome: portfolio-survival-paths.spec.mjs
system-chrome: portfolio-survival-risk.spec.mjs
94 passed (1.7m)
```

### Selected Route And Process Release

**Phase:** implement
**Command:** `zsh -f -c '<resolved-config, candidate-hash, and process-residue receipt>'`
**Exit Code:** 0
**Claim Source:** executed

```text
SCOPE4_ROUTE_RECEIPT_BEGIN
candidateGate=PASS
selectedRoute=foundation-lifecycle
fallbackEligible=false
resolvedWorkers=2
project=system-chrome
channel=chrome
foundationSha256=68048d53b828788b4312495ec7117c572e189ccbebc95a9c959d4b50abaf73e5
canarySha256=61480b0e29ecd720bc764ea2f230a580d703a0fc90633ff1404a137e01e6bb70
configSha256=f2046ba0a332862e9a13475339099a29be5a44763b59c3d73f42baa0cbb6417d
ownedProcessResidue=0
playwrightWorkerResidue=0
forceKillSuppression=absent
SCOPE4_ROUTE_RECEIPT_END
```

### Complete Runtime-Foundation Functional Suite

The first complete-file attempt correctly rejected an external `node_modules` symlink. After
replacing it with a physical APFS clone inside the isolated worktree, the identical command
passed all 16 tests, including the live 27-test child canary.

**Phase:** implement
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `f614146ce8eb1ac6e97dd973e7293270d56495954adb4fb1382f387006952559`

```text
# BUG-017 Scope 4 complete runtime-foundation functional suite isolated dependencies
exit: 0
lines: 243
sha256: f614146ce8eb1ac6e97dd973e7293270d56495954adb4fb1382f387006952559
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] sharedImporters=79
[playwright-runtime] newCrossings=0
Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds
Regression: SCN-BUG017-11 lifecycle remediation cannot hide force-kill or switch browser project
tests 16
pass 16
fail 0
cancelled 0
skipped 0
todo 0
```

### Clean Code-Tree Repository Selftest

**Phase:** implement
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `672840abd9200f20cc9bdfbfe69cb3516b50b52f9db1f8095c80b4ea7c88b733`

```text
# BUG-017 Scope 4 clean repository selftest at 5620a4e78
exit: 0
lines: 3960
sha256: 672840abd9200f20cc9bdfbfe69cb3516b50b52f9db1f8095c80b4ea7c88b733
Step 1 security - escaped model sinks and CSP on every page
Feature 004 RLFX/RLDATA foundation
security findings - a declared bound that nothing validates is not a bound
TB-SEC-02-01: invalid earliest claim ages are refused
TB-SEC-02-02: negative settlement is refused
TB-SEC-02-03: shipped pack behavior remains intact
TB-SEC-01-01: response-body read bound remains armed
TB-SEC-01-02: unrepresentable timer bounds are refused
TB-SEC-03-01: repository anchor comes from the checkout
TB-SEC-03-02: foreign checkout targets are refused
Research-Lab self-test: 3465 passed, 0 failed
```

### Implementation Commits And Boundary

- `b3322965e` changes only the Foundation spec and persistent lifecycle canary.
- `5620a4e78` adds only the SCN-BUG017-11 containment regression.
- Both commits were preceded by explicit staged-path allowlist checks reporting `LEAKAGE=0`.
- `playwright.config.mjs`, Paths, shared fixtures, the browser project, the vendor teardown
  timeout, portfolio assertions, historical evidence, certification, acceptance, and Checklist
  content were not changed by these commits.

### Additive Supersession Integrity

**Phase:** implement
**Command:** `node --input-type=module -e '<compare baseline report and Scopes 1-3 bytes against current artifacts>'`
**Exit Code:** 0
**Claim Source:** executed

```text
SCOPE4_SUPERSESSION_CHECK_BEGIN
baseline=8ebf4b751331d1ea6b7e88555a9333f4810f2ed4
priorReportBytes=94534
currentReportBytes=104583
priorReportIsExactPrefix=true
historicalScopesOneThroughThreeByteIdentical=true
historicalCheckedRowsRewritten=0
currentClosureHistoricalZeroOfThreeReferences=0
selectedRoute=foundation-lifecycle
selectedWorkers=2
additiveSupersession=PASS
SCOPE4_SUPERSESSION_CHECK_END
```

### Current Repository Guards

**Phase:** implement
**Command:** `node scripts/validate-test-file-reachability.mjs; node scripts/validate-scope-dod-progress.mjs --all; node scripts/validate-acceptance-bulk-stamp.mjs; node scripts/pii-scan.mjs; node scripts/validate-spec-test-paths.mjs; bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-survival-foundation.spec.mjs tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `37359eea1259a5e94f511966a4198a9165a3defe33a2aa585d932d558af2529e`

```text
# BUG-017 Scope 4 current repository guards
exit: 0
lines: 78
sha256: 37359eea1259a5e94f511966a4198a9165a3defe33a2aa585d932d558af2529e
CURRENT_GUARDS_BEGIN
REACHABILITY_EXIT=0
SCOPE_PROGRESS_EXIT=0
ACCEPTANCE_GUARD_EXIT=0
PII_SCAN_EXIT=0
SPEC_TEST_PATHS_EXIT=0
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/portfolio-survival-foundation.spec.mjs
Adversarial signal detected in tests/portfolio-survival-foundation.spec.mjs
Scanning tests/playwright-runtime.foundation.functional.mjs
Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2
Files with adversarial signals: 2
REGRESSION_QUALITY_EXIT=0
CURRENT_GUARDS_OVERALL=0
CURRENT_GUARDS_END
```

## Scope 4 Finalization Validation - Candidate Rejected {#scope-4-finalization-validation-candidate-rejected}

**Phase:** implement
**Claim Source:** executed
**Execution time:** 2026-08-27T19:42:40Z

The pre-closeout validation bundle left every packet and repository guard green, including both
packet artifact lints, both traceability guards, scope progress, acceptance, PII, spec-test paths,
reachability, regression quality, and the 3465-assertion repository selftest. The complete focused
runtime-foundation file did not stay green. Its real SCN-BUG017-09 child hit the same lifecycle
boundary this scope is intended to close, so the bundle exited 1.

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `7051fc012b0113d8a8cf967087e88e830ebdbf88034e2a1f91a645302dcd04ba`

```text
# BUG-017 Scope 4 finalization validation before closeout
exit: 1
lines: 4786
sha256: 7051fc012b0113d8a8cf967087e88e830ebdbf88034e2a1f91a645302dcd04ba
AssertionError [ERR_ASSERTION]: SCN-BUG017-09: child did not exit zero within the strict worker-stop bound
ARTIFACT_BUG017_EXIT=0
ARTIFACT_BUG022_EXIT=0
TRACEABILITY_BUG017_EXIT=0
TRACEABILITY_BUG022_EXIT=0
SCOPE_PROGRESS_EXIT=0
ACCEPTANCE_GUARD_EXIT=0
PII_SCAN_EXIT=0
SPEC_TEST_PATHS_EXIT=0
REACHABILITY_EXIT=0
FOCUSED_FUNCTIONAL_EXIT=1
REGRESSION_QUALITY_EXIT=0
SELFTEST_EXIT=0
OVERALL_EXIT=1
```

An immediate run of only the exact planned canary confirmed that this was not a different test in
the functional file. All 27 test bodies reached the final Foundation row. Foundation's new
`afterAll` then exceeded its 30000ms hook timeout while awaiting the browser close. Worker 86433
received `__stop__` but emitted no exit record, and Playwright force-killed it at the strict
15000ms bound. The other worker exited zero immediately.

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
Error: worker-1 process did not exit within 15000ms after stop, force-killed it
"afterAll" hook timeout of 30000ms exceeded.
1 failed
26 passed (58.3s)
1 error was not a part of any test, see above for details
[BUG017-CANARY pid=86433] installed
[BUG017-CANARY pid=86434] installed
[BUG017-CANARY pid=86433] stop at=1787859623192
[BUG017-CANARY pid=86434] stop at=1787859656969
[BUG017-CANARY pid=86434] exit code=0 at=1787859656969 elapsedMs=0
tests 1
pass 0
fail 1
duration_ms 59171.740333
```

The earlier exact 94-test exit-0 capture remains preserved as a real historical run. It cannot
close Scope 4 after the persistent canary fails twice at the same committed candidate bytes. The
one-worker fallback remains ineligible because its planned predecessor is a failed complete
SCN-BUG017-10 run, and that predecessor did not occur. No bounded matrix or 94-test command was
rerun. Scope 4 remains in progress, no implement completion claim is added, and BUG-022 receives
no regression or stabilize phase claim.

### Synchronized Packet Guards

**Phase:** implement
**Claim Source:** executed
**Exit Code:** 0
**Capture SHA-256:** `e408841bb68032bb5bd3e43e83d204fe2819199511d6a6f67a385883c092963f`

```text
# BUG-017 Scope 4 synchronized packet guards
exit: 0
lines: 4307
sha256: e408841bb68032bb5bd3e43e83d204fe2819199511d6a6f67a385883c092963f
ARTIFACT_BUG017_EXIT=0
ARTIFACT_BUG022_EXIT=0
TRACEABILITY_BUG017_EXIT=0
TRACEABILITY_BUG022_EXIT=0
SCOPE_PROGRESS_EXIT=0
ACCEPTANCE_GUARD_EXIT=0
PII_SCAN_EXIT=0
SPEC_TEST_PATHS_EXIT=0
REACHABILITY_EXIT=0
REGRESSION_QUALITY_EXIT=0
SELFTEST_EXIT=0
DIFF_CHECK_EXIT=0
OVERALL_EXIT=0
```

### Candidate Boundary And State Integrity

**Phase:** implement
**Claim Source:** executed
**Exit Code:** 0

```text
CANDIDATE_BOUNDARY_BEGIN
ALLOWED specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md
ALLOWED specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/scenario-manifest.json
ALLOWED specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/scopes.md
ALLOWED specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/state.json
ALLOWED specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
ALLOWED specs/_bugs/BUG-022-historical-report-declaration-leak/scenario-manifest.json
ALLOWED tests/playwright-runtime.foundation.functional.mjs
ALLOWED tests/portfolio-survival-foundation.spec.mjs
EXPECTED_PATHS=8 ACTUAL_PATHS=8 LEAKAGE=0
TOP_LEVEL_STATUS_UNCHANGED=true
CERTIFICATION_UNCHANGED=true
SCOPE4_STATUS=In Progress
SCOPE4_COMPLETED_IMPLEMENT_CLAIM=false
NEXT_REQUIRED_OWNER=bubbles.stabilize
BUG017_ACCEPTANCE_DIFF_EXIT=0
BUG022_STATE_ACCEPTANCE_DIFF_EXIT=0
CANDIDATE_BOUNDARY_END
```

## Scope 4 Fallback Selection And Verification {#scope-4-fallback-selection-and-verification}

**Phase:** stabilize
**Claim Source:** executed
**Execution date:** 2026-08-27

The current finalization failures activate the approved fallback route. The earlier lifecycle
passes and failures remain unchanged above. This section records new inverse commits and new
fallback execution. It does not reinterpret a non-zero command as a pass.

**Candidate Rollback And Baseline Identity**

Commit `047292eb2d2d7444dff1e45b52738950609cad4b` reverses lifecycle test commit
`5620a4e7865742eca3651565bffcac86153a4419`. Commit
`af119275ad624893d5c55ac07d046d646c0928a4` reverses lifecycle implementation commit
`b3322965e6209b125391c3f147b45ce1ae8241b4`. Both inverse commits follow evidence commit
`00041db0fce7b8f87bebe459859a410ec17d5210`.

**Command:** `git ls-tree 8ebf4b751 -- tests/portfolio-survival-foundation.spec.mjs tests/playwright-runtime.mjs tests/portfolio-survival-paths.spec.mjs; git ls-tree HEAD -- <same paths>; git diff --quiet 8ebf4b751 -- <same paths>`
**Exit Code:** 0
**Claim Source:** executed

```text
ROLLBACK_AND_BASELINE_RECEIPT_BEGIN
047292eb2d2d7444dff1e45b52738950609cad4b
af119275ad624893d5c55ac07d046d646c0928a4
BASELINE_OBJECTS
b50262e48116f614380a000d0f226617e24e2c82 tests/playwright-runtime.mjs
bc66800eb67d51f2bfdd3beae19bbe0bee697d2e tests/portfolio-survival-foundation.spec.mjs
ab2b3eac1ee84b711f9966b1a01eaf900c744972 tests/portfolio-survival-paths.spec.mjs
CURRENT_COMMITTED_OBJECTS
b50262e48116f614380a000d0f226617e24e2c82 tests/playwright-runtime.mjs
bc66800eb67d51f2bfdd3beae19bbe0bee697d2e tests/portfolio-survival-foundation.spec.mjs
ab2b3eac1ee84b711f9966b1a01eaf900c744972 tests/portfolio-survival-paths.spec.mjs
FOUNDATION_SHARED_PATHS_BASELINE_EXIT=0
ROLLBACK_AND_BASELINE_RECEIPT_END
```

The candidate runtime-functional blob also returned to baseline object
`0d319b8b1662dbb45dd4a5b61b189b6909ded77d` before the fallback assertion changed it.
The candidate version was `eb79697d24213fd4283a4e88c21df620d2f23734`.

### Selected Route

`playwright.config.mjs` now resolves one worker. The adjacent config disclosure and command
registry state that this is an exposure bound after candidate rollback. Neither surface claims
that two workers avoid recurrence. The `system-chrome` project, Chrome channel, Playwright
300000ms worker-stop budget, list reporter, and force-kill error remain unchanged.

### Runtime-Foundation Functional Suite

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `faaff00198b2f9caad97d2d265fa051954803fe7094eeb26cfafe38998235b7e`

```text
# BUG-017 Scope 4 fallback runtime-foundation functional suite
exit: 0
lines: 51
sha256: faaff00198b2f9caad97d2d265fa051954803fe7094eeb26cfafe38998235b7e
Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin
Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
tests 15
pass 15
fail 0
cancelled 0
skipped 0
todo 0
```

### Exact Config-Default Run Matrix

Both rows invoked this exact child command without `--workers`:

```text
npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

| Run | Consumer | Resolved workers | Tests | Exit | Wall | Force-kill | Ignored lifecycle | Owned residue | Capture SHA-256 |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| BUG017-FALLBACK-R1 | BUG-017 TP-BUG017-04-04 | 1 | 94/94 | 0 | 99s | 0 | 0 | 0 | `c1e5e7d345cd779fd9b817cc6fd850c4aed138beb8e02e9f2afbcaa1325c0153` |
| BUG022-C03-R2 | BUG-022 TP-BUG022-C03 | 1 | 94/94 | 0 | 86s | 0 | 0 | 0 | `a3e93124da2431f11b6347f53b9ed678d0776cd56a3e75d2583b6dae68961c2b` |

**Command:** exact config-default command above, invoked by the bounded process-ownership probe
**Exit Code:** 0
**Claim Source:** executed

```text
RUN_BEGIN id=BUG017-FALLBACK-R1
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
PROCESS_COUNTS label=before-BUG017-FALLBACK-R1 worktreeCwd=0 remoteDebugChrome=0
Running 94 tests using 1 worker
94 passed (1.6m)
PROCESS_COUNTS label=after-BUG017-FALLBACK-R1 worktreeCwd=0 remoteDebugChrome=0
RUN_RECEIPT id=BUG017-FALLBACK-R1 playwrightExit=0 wallSeconds=99 resolvedOne=1 passed94=1 forceKill=0 ignoredLifecycle=0 ownedResidue=0 remoteDebugDelta=0
RUN_END id=BUG017-FALLBACK-R1
captureSha256=c1e5e7d345cd779fd9b817cc6fd850c4aed138beb8e02e9f2afbcaa1325c0153
result=PASS
```

**Command:** exact config-default command above, invoked by the bounded process-ownership probe
**Exit Code:** 0
**Claim Source:** executed

```text
RUN_BEGIN id=BUG022-C03-R2
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
PROCESS_COUNTS label=before-BUG022-C03-R2 worktreeCwd=0 remoteDebugChrome=0
Running 94 tests using 1 worker
94 passed (1.4m)
PROCESS_COUNTS label=after-BUG022-C03-R2 worktreeCwd=0 remoteDebugChrome=0
RUN_RECEIPT id=BUG022-C03-R2 playwrightExit=0 wallSeconds=86 resolvedOne=1 passed94=1 forceKill=0 ignoredLifecycle=0 ownedResidue=0 remoteDebugDelta=0
RUN_END id=BUG022-C03-R2
captureSha256=a3e93124da2431f11b6347f53b9ed678d0776cd56a3e75d2583b6dae68961c2b
result=PASS
```

### Uncertainty Declaration

**Attempted:** Two complete config-default runs tested the selected route after exact rollback.

**Observed:** Both runs passed every test and all declared lifecycle acceptance checks.

**Not established:** Two runs do not prove that one worker removes the upstream socket cause.
The fallback bounds measured exposure and preserves failure visibility.

### Final Repository Selftest

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `e640a67af9cae0c02f9ef8e1e0826e76d0fdcaf824187a4a67e98beeb1a39b47`

```text
# BUG-017 Scope 4 fallback final repository selftest
exit: 0
lines: 3960
sha256: e640a67af9cae0c02f9ef8e1e0826e76d0fdcaf824187a4a67e98beeb1a39b47
TB-SEC-02-01: invalid earliest claim ages are refused
TB-SEC-02-02: negative settlement is refused
TB-SEC-02-03: shipped pack behavior remains intact
TB-SEC-01-01: response-body read bound remains armed
TB-SEC-01-02: unrepresentable timer bounds are refused
TB-SEC-03-01: repository anchor comes from the checkout
TB-SEC-03-02: foreign checkout targets are refused
Research-Lab self-test: 3465 passed, 0 failed
```

### Final Pass-Style Validator Matrix

**Command:** bounded matrix of both packet lints, traceability, scenario obligations, scope
progress, acceptance, PII, spec paths, reachability, regression quality, and `git diff --check`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `3614f9db25c5a5dd1f469e3c364d4686907e842445f9e61a04aa5fc64b00f2cc`

```text
FINAL_VALIDATOR_MATRIX_BEGIN
artifact-bug017=0
artifact-bug022=0
traceability-bug017=0
traceability-bug022=0
scenario-obligations-bug017=0
scenario-obligations-bug022=0
scope-progress=0
acceptance=0
pii=0
spec-test-paths=0
reachability=0
regression-quality=0
diff-check=0
overall=0
captureSha256=3614f9db25c5a5dd1f469e3c364d4686907e842445f9e61a04aa5fc64b00f2cc
FINAL_VALIDATOR_MATRIX_END
```

The matrix wrapper exits non-zero when any listed check exits non-zero. Its observed exit was
zero. The completion guards below ran separately and are not included in that verdict.

### Current Completion Guards - Non-Terminal

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `69b0477535dfb90655747e729aef0afb93a7763bf91ed318b824d33ec9179e86`

```text
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
targetStatus: done
failedGateIds: [G028,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-9-evidence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 8
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `63da0db7847d524e65f35236c13c2453aa3a1ed65e3e5d291e5f50ea651dff14`

```text
BEGIN TRANSITION_GUARD_RESULT_V1
workflowMode: bugfix-fastlane
targetStatus: done
failedGateIds: [G022,G027,G040,G136]
failedChecks: [Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 12
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

Neither completion guard is recorded as passing. Packet status, certification, certified phases,
and acceptance remain unchanged.

## Scope 4 Independent Test Verification At Planning Commit 5615b8918 {#scope-4-independent-test-verification-at-planning-commit-5615b8918}

**Phase:** test
**Claim Source:** executed
**Execution date:** 2026-08-27

### Canonical Scenario-State Derivation

The canonical resolver was inspected before use. It defines the closed derived-state vocabulary
as `PLANNED`, `RED_VERIFIED`, `IMPLEMENTED`, `GREEN_TARGETED`, `GREEN_LIVE`,
`REGRESSION_GREEN`, `OBSERVED`, and validate-owned `CERTIFIED`. It does not define a rejected,
retired, or superseded scenario state. No such state was written into the scenario manifest.

**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos --source-revision aa6383b7e23c163a038f4ef85e08616152c74c2f --format text`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `63d57adf6dacd4e3eb0e7d1296c3e0412cf4602f261035437a537dee9a0d2287`

```text
# BUG-017 Scope 4 canonical scenario state resolve at fallback revision
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 120 bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos --source-revision aa6383b7e23c163a038f4ef85e08616152c74c2f --format text
exit: 0
lines: 339
sha256: 63d57adf6dacd4e3eb0e7d1296c3e0412cf4602f261035437a537dee9a0d2287
--- first 20 ---
scenario-state-resolve: specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos
  source revision: aa6383b7e23c
  SCN-BUG017-09  state=PLANNED  derived=[PLANNED]
  SCN-BUG017-10  state=PLANNED  derived=[PLANNED]
  SCN-BUG017-11  state=PLANNED  derived=[PLANNED]
--- omitted 299 line(s); sha256 above covers the full output ---
  (all 325 refusals are SCS-REVISION-DRIFT: superseded receipts, excluded from derivation, not blocking)
```

The resolver therefore provides no derived execution state that can be used to relabel the two
rejected candidate scenarios or certify the selected fallback. Their planning lifecycle remains
an owner-routed correction. The historical green and RED captures remain unchanged.

### Focused Selected-Fallback Functional Check

The detached worktree did not contain the git-ignored dependency tree, so its first invocation
stopped before behavior with `ERR_MODULE_NOT_FOUND`. The exact command was then run from the
dependency-provisioned primary checkout after `git status --short` returned no changes for every
BUG-017 runtime, config, and portfolio-test path. That checkout was at planning commit
`5615b8918c583fe7535b3f82a174184b491e2694`.

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `34bc8fec7fbc79729aab02cd9755f294ea2e0a8af1752e8833cd0338469d77f6`

```text
# BUG-017 Scope 4 current SCN-11 focused fallback functional dependency-provisioned checkout
exit: 0
lines: 15
sha256: 34bc8fec7fbc79729aab02cd9755f294ea2e0a8af1752e8833cd0338469d77f6
[SCN-BUG017-11] workers=1
[SCN-BUG017-11] project=system-chrome
[SCN-BUG017-11] channel=chrome
[SCN-BUG017-11] defaultWorkerStopBudgetMs=300000
[SCN-BUG017-11] forceKillDisclosure=present
[SCN-BUG017-11] lifecycleCandidateRolledBack=true
tests 1
pass 1
fail 0
skipped 0
todo 0
```

### Git Receipt And Rollback Verification

Git resolves both revert objects and their reverted commits. The lifecycle-test revert is a
child of evidence commit `00041db0f`, and the implementation revert is its immediate child.
The three candidate-owned runtime files match the pre-candidate baseline blobs at the planning
commit. The only paths changed between fallback commit `aa6383b7e` and planning commit
`5615b8918` are this report and `scopes.md`, so no fallback runtime or config byte changed.

**Command:** bounded `git rev-parse`, `git show -s`, `git ls-tree`, `git diff --quiet`,
`git diff --name-only`, and `git grep` checks over the named commits and packet report
**Exit Code:** 0
**Claim Source:** executed

```text
ROLLBACK_GIT_VERIFICATION_BEGIN
047292eb2d2d7444dff1e45b52738950609cad4b
af119275ad624893d5c55ac07d046d646c0928a4
COMMIT=047292eb2d2d7444dff1e45b52738950609cad4b PARENTS=00041db0fce7b8f87bebe459859a410ec17d5210 SUBJECT=Revert "test(BUG-017): lock lifecycle containment"
COMMIT=af119275ad624893d5c55ac07d046d646c0928a4 PARENTS=047292eb2d2d7444dff1e45b52738950609cad4b SUBJECT=Revert "fix(BUG-017): close Foundation browser before teardown"
BASELINE_OBJECTS
100644 blob b50262e48116f614380a000d0f226617e24e2c82 tests/playwright-runtime.mjs
100644 blob bc66800eb67d51f2bfdd3beae19bbe0bee697d2e tests/portfolio-survival-foundation.spec.mjs
100644 blob ab2b3eac1ee84b711f9966b1a01eaf900c744972 tests/portfolio-survival-paths.spec.mjs
CURRENT_OBJECTS
100644 blob b50262e48116f614380a000d0f226617e24e2c82 tests/playwright-runtime.mjs
100644 blob bc66800eb67d51f2bfdd3beae19bbe0bee697d2e tests/portfolio-survival-foundation.spec.mjs
100644 blob ab2b3eac1ee84b711f9966b1a01eaf900c744972 tests/portfolio-survival-paths.spec.mjs
FOUNDATION_SHARED_PATHS_BASELINE_EXIT=0
POST_FALLBACK_CHANGED_PATHS
specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md
specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/scopes.md
RUN_RECEIPT id=BUG017-FALLBACK-R1 playwrightExit=0 wallSeconds=99 resolvedOne=1 passed94=1 forceKill=0 ignoredLifecycle=0 ownedResidue=0 remoteDebugDelta=0
RUN_RECEIPT id=BUG022-C03-R2 playwrightExit=0 wallSeconds=86 resolvedOne=1 passed94=1 forceKill=0 ignoredLifecycle=0 ownedResidue=0 remoteDebugDelta=0
ROLLBACK_GIT_VERIFICATION_END
```

The two current candidate failures remain preserved in the report: the complete focused
runtime-foundation run failed on the SCN-BUG017-09 strict worker-stop assertion, and the immediate
exact named canary reported a 15000ms worker force-kill. Neither result is converted into a pass.
Because the two committed 94-test receipts cover unchanged runtime and config bytes, this pass
did not spend another complete 94-test run.

### Plan-Owned Closure Rows

The evidence supports checking the selected-fallback row. It does not support checking the
candidate-pass statement as written. `scopes.md` planning text is owned by `bubbles.plan`, so this
test pass records the exact additive correction instead of changing that foreign-owned text:

```markdown
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior persist for the selected fallback: TP-BUG017-04-04 maps SCN-BUG017-11 to the exact config-default 94-test system-Chrome command and asserts one resolved worker, 94/94 passing, exit 0, no force-kill or ignored lifecycle error, and zero owned residue. **Phase:** test. **Claim Source:** executed. -> Evidence: [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification) and [Scope 4 independent test verification](report.md#scope-4-independent-test-verification-at-planning-commit-5615b8918).
- [x] TP-BUG017-04-01 is rejected as the active closure route rather than recorded as passing: its historical GREEN and adversarial RED remain preserved, two current acceptance canaries failed at unchanged candidate bytes, commits `047292eb2` and `af119275a` hash-restore the candidate files, and those failures make the verified TP-BUG017-04-04 one-worker fallback eligible. **Phase:** test. **Claim Source:** executed. -> Evidence: [Persistent strict canary GREEN](report.md#persistent-strict-canary-green), [Scope 4 finalization validation](report.md#scope-4-finalization-validation-candidate-rejected), [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification), and [Scope 4 independent test verification](report.md#scope-4-independent-test-verification-at-planning-commit-5615b8918).
```

The scenario manifest schema exposes no rejected or superseded scenario lifecycle state. The
resolver derives SCN-BUG017-09, SCN-BUG017-10, and SCN-BUG017-11 as `PLANNED` from the available
structured receipts. Planning must therefore retire the candidate paths and select the fallback
without adding a hand-authored scenario state. Scope 4 remains `In Progress` in this test-owned
change, and no state or certification mirror is changed.

### Current Validator Results

Each command ran against the detached tree at `5615b8918` after the report and evidence-link
edits. The pass-style checks are green. The canonical linked-test resolver is a real blocking
failure and is not included in the green set.

| Check | Exit | Observed result | Capture SHA-256 |
| --- | ---: | --- | --- |
| `node scripts/selftest.mjs` | 0 | 3465 passed, 0 failed | `1c212c68f2c059ff0c0b2cbe01bbf8fcf66bd04106f4bf7e44e1c8b0cce6f44b` |
| `bash .github/bubbles/scripts/traceability-guard.sh <packet>` | 0 | 11 scenarios mapped; 27 test rows; 0 warnings | `7685f146adb960e3c4cfc129e5098334d640ba4148b8788beb753d37a631cc63` |
| `node scripts/validate-scope-dod-progress.mjs --all` | 0 | no new DoD progress drift | `b5a9ca8bc45dec0c5056a5a3a21883be1163a6a543e818f032093730455961a7` |
| `node scripts/validate-acceptance-bulk-stamp.mjs` | 0 | no new bulk-stamped acceptance record | `4cc6dabaa6ef05110ef65d568e833c847c0bed35c092423761522d3c410fbabe` |
| `node scripts/pii-scan.mjs` | 0 | 10016 files; 0 findings | `38784ac9194018e7f6d5f8ab8a0c6903d6ade356642e4627effc4fb6c50d6662` |
| `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix <two carriers>` | 0 | 0 violations; 0 warnings; 2 adversarial carriers | `cdf8ff9d2e3e0b288b438342b5506a5759a6aab3684867be4bdacc53b9be1aa3` |
| `bash .github/bubbles/scripts/scenario-test-resolve.sh <packet> --repo-root <worktree>` | 1 | 17 unresolved linked-test titles | `d984be634384de528228495de62d58c93fc952d7fad07e98fb3289fad2ffc76c` |

```text
SELFTEST_EXIT=0
Research-Lab self-test: 3465 passed, 0 failed
TRACEABILITY_EXIT=0
RESULT: PASSED (0 warnings)
SCOPE_PROGRESS_EXIT=0
[scope-dod-progress] OK - no new DoD progress drift
ACCEPTANCE_GUARD_EXIT=0
[acceptance-bulk-stamp] OK - no new bulk-stamped acceptance record
PII_SCAN_EXIT=0
[pii-scan] files=10016 messages=2311 findings=0 OK
REGRESSION_QUALITY_EXIT=0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
SCENARIO_TEST_RESOLVE_EXIT=1
scenario-test-resolve: 17 unresolved reference(s) of 35 checked.
```

### Linked-Test Resolution Blocker

SCN-BUG017-09 references its removed candidate title. SCN-BUG017-10 and SCN-BUG017-11 each
reference eight synthetic `TP-BUG017-04-0x complete BUG-022 C03 portfolio set` titles that do
not exist in the named files. The resolver therefore exits 1 under Gate G057.

The manifest schema supports `lockdown.state: replaced` plus `replacedBy`; it does not support a
rejected, retired, or superseded derived scenario state. The test resolver does not exempt a
replaced scenario from reference checks. Planning must use `replaced` for SCN-BUG017-09 and
SCN-BUG017-10, set `replacedBy` to `SCN-BUG017-11`, and replace missing title references with
canonical resolvable string references. The existing report anchors preserve the candidate's
historical GREEN, RED, rejection, and rollback evidence.

One existing accessibility adversarial carrier uses `page.route(...).fulfill(...)` to inject a
mutated document. It is a UI-unit mechanism rather than live-route proof. The regression-quality
guard still finds two valid adversarial carriers, and the other portfolio files continue to run
through the real browser boundary. This observation does not convert the unresolved linked-test
references into a pass.

### Current Transition Guard - Routed Closeout

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `1e6474c301227289cc909e812d26c5644dc03cf229a7fa3f327e89c51bfed59b`

```text
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 3
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

This refusal is the controlling completion result. Scope 4 stays `In Progress`; the two plan-owned
rows stay unchecked; state counts, execution claims, certification, acceptance, and top-level
status stay unchanged. The next required owner remains `bubbles.plan` for the additive row and
scenario/test-plan reconciliation, followed by `bubbles.validate` only after the planning repair
and fresh test verification pass.

## Scope 4 Current Test Execution At 2026-08-28 {#scope-4-current-test-execution-at-2026-08-28}

**Phase:** test
**Claim Source:** executed
**Execution time:** 2026-08-28T05:13:36Z

The active Markdown and JSON Test Plans assign one identical complete command to
TP-BUG017-04-04 and TP-BUG017-04-04B. This phase executed that command once. The same
execution therefore resolves both rows without reducing or repeating the workload.

SCN-BUG017-09 and SCN-BUG017-10 remain replaced historical candidates. This phase did not
execute either candidate. Their failed current evidence remains visible above.

### Pre-Execution Linked-Test Resolution

**Command:** `/bin/bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos --repo-root .`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `c48e44229a95772b5d47958f8c04ed1be041168b8edb4df0ec1991996bc010fd`

```text
# BUG017 Scope 4 linked-test resolution safe evidence
$ /bin/bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos --repo-root .
exit: 0
lines: 1
sha256: c48e44229a95772b5d47958f8c04ed1be041168b8edb4df0ec1991996bc010fd
--- output ---
[scenario-test-resolve] OK — 35 reference(s) resolved via literal-scan; 18 category comparison(s) not applicable (no test-discovery adapter declared)
```

The checkout-local runner and wildcard resolved before browser execution:

```text
BUG017_SCOPE4_RUNNER_AND_WORKLOAD_BEGIN
Version 1.61.1
WORKLOAD_FILE_COUNT=8
WORKLOAD_FILE=tests/portfolio-survival-accessibility.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-allocation.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-brief.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-diversification.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-foundation.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-mobile.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-paths.spec.mjs
WORKLOAD_FILE=tests/portfolio-survival-risk.spec.mjs
RUNNER_IDENTITY_EXIT=0
BUG017_SCOPE4_RUNNER_AND_WORKLOAD_END
```

### TP-BUG017-04-04 And TP-BUG017-04-04B

**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Capture command:** `node /private/tmp/rl-bug017-scope4-test-probe.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `ed9bd75c5142d0e6d895601a4331a760c4ceab32d5ef792b7c4ff9417061b13e`

The bounded capture hashed all 313 output lines. The probe streamed the complete child output
without filtering. It tracked the child process tree throughout the run.

```text
# BUG017 Scope 4 TP-BUG017-04-04 and 04-04B exact C03
$ node /private/tmp/rl-bug017-scope4-test-probe.mjs
exit: 0
lines: 313
sha256: ed9bd75c5142d0e6d895601a4331a760c4ceab32d5ef792b7c4ff9417061b13e
--- first 20 ---
BUG017_SCOPE4_EXACT_RUN_BEGIN
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
CONFIG_RECEIPT workers=1 project=system-chrome browser=chromium channel=chrome configOk=true
PROCESS_BASELINE relevantCount=4 relevantPids=26206,26317,26424,26425

Running 94 tests using 1 worker

  ✓   1 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:89:1 › Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete (2.5s)
  ✓   2 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:316:1 › Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision (2.2s)
  ✓   3 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:501:1 › Adversarial: SCN-008-053 reduced accessibility implementations fail closed (799ms)
  ✓   4 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:109:1 › Regression: SCN-008-026 all six allocation methods share one frozen basis (399ms)
  ✓   5 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:137:1 › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (389ms)
  ✓   6 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:158:1 › Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation (393ms)
  ✓   7 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:189:1 › Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states (624ms)
  ✓   8 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:235:1 › Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence (392ms)
  ✓   9 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:253:1 › Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions (401ms)
  ✓  10 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:293:1 › Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence (595ms)
  ✓  11 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:339:1 › Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate (622ms)
  ✓  12 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:375:1 › Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity (563ms)
  ✓  13 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:411:1 › Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views (2.2s)
--- omitted 273 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓  83 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:143:1 › Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (372ms)
  ✓  84 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:180:1 › Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom (446ms)
  ✓  85 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:253:1 › Regression: SCN-008-015 concentration lenses expose overlap and missing look through (412ms)
  ✓  86 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:286:1 › Regression: SCN-008-016 beta alpha R squared and residual risk stay separate (392ms)
  ✓  87 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:325:1 › Regression: SCN-008-016 benchmark fit is unavailable rather than regressed against a guess (427ms)
  ✓  88 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:344:1 › Regression: SCN-008-017 marginal and total risk contributions reconcile (395ms)
  ✓  89 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:372:1 › Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies (387ms)
  ✓  90 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:409:1 › Regression: SCN-008-017 return contribution stays distinct from risk contribution (395ms)
  ✓  91 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:438:1 › Regression: SCN-008-015 manual assets and absent look through stay visible not omitted (393ms)
  ✓  92 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:465:1 › Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity (463ms)
  ✓  93 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:527:1 › Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth (439ms)
  ✓  94 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:565:1 › Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio (391ms)

  94 passed (1.5m)
PLAYWRIGHT_EXIT=0 PLAYWRIGHT_SIGNAL=none
RUN_SIGNALS resolvedOne=1 passed94=1 forceKillMarkers=0 ignoredLifecycleMarkers=0 skipped=0
PROCESS_OWNERSHIP trackedPids=199 maxConcurrent=12 ownedResidue=0 ownedResiduePids=none
PROCESS_AFTER relevantCount=4 trackedRelevantResidue=0 ambientRelevantDelta=0
RUN_RECEIPT accepted=1 tests=94 passed=94 failed=0 skipped=0 todo=0
BUG017_SCOPE4_EXACT_RUN_END
```

The process baseline contained four unrelated relevant processes. The post-run sample contained
the same count. The probe found no new ambient process and no surviving process from the tracked
workload tree.

### TP-BUG017-04-05

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `f5218b8a1a3991e53cbff0be3037a58e8f24a8342388f7a432d68c93050e0489`

```text
# BUG017 Scope 4 TP-BUG017-04-05 exact functional
$ node --test --test-name-pattern=^Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$ tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 15
sha256: f5218b8a1a3991e53cbff0be3037a58e8f24a8342388f7a432d68c93050e0489
--- output ---
[SCN-BUG017-11] workers=1
[SCN-BUG017-11] project=system-chrome
[SCN-BUG017-11] channel=chrome
[SCN-BUG017-11] defaultWorkerStopBudgetMs=300000
[SCN-BUG017-11] forceKillDisclosure=present
[SCN-BUG017-11] lifecycleCandidateRolledBack=true
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (4.047375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 200.633584
```

### Mock, Skip, And Self-Validation Audit

**Claim Source:** interpreted
**Interpretation:** The one executable interception belongs to a named adversarial mutation
carrier. It does not provide the sole proof for SCN-BUG017-11. The active live proof observes
the real system-Chrome runner process, configured worker count, exit, diagnostics, and residue.

```text
BUG017_SCOPE4_TEST_INTEGRITY_SCAN_BEGIN
MOCK_INTERCEPTION_SCAN
tests/portfolio-survival-accessibility.spec.mjs:484:  await page.route(`${server.baseUrl}/${LAB_FILE}`, (route) => route.fulfill({
tests/portfolio-survival-foundation.spec.mjs:651: * Neither row intercepts a request: no page.route/context.route/msw/nock appears here, because
tests/portfolio-survival-foundation.spec.mjs:1019: * page's own diagnostics. No request is intercepted — no page.route/context.route/msw/nock appears
tests/portfolio-survival-foundation.spec.mjs:1418: * Nothing here intercepts a request: no page.route/context.route/msw/nock, because an
MOCK_SCAN_GREP_EXIT=0
SKIP_TODO_ONLY_SCAN
SKIP_TODO_ONLY_MATCHES=0
SKIP_CHECK_EXIT=0
BUG017_SCOPE4_TEST_INTEGRITY_SCAN_END
```

- **Files scanned:** nine active carrier files.
- **Executable interception patterns:** one, in the existing accessibility adversarial carrier.
- **Reclassifications:** the intercepted mutation remains a synthetic adversarial complement.
- **Live-category gap:** none for SCN-BUG017-11. The exact runner-level proof stayed live.
- **Self-validating mechanisms found:** none in the two active mechanisms. The E2E receipt
  observes runner-produced process outcomes. The functional test reads current config and vendor
  runner bytes, then asserts the planned containment contract.
- **Skipped, todo, or only markers:** zero.

### Active Test-Plan Result

| Test Plan row | Tests | Passed | Failed | Skipped | Todo | Exit | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| TP-BUG017-04-04 | 94 | 94 | 0 | 0 | 0 | 0 | PASS |
| TP-BUG017-04-04B | 94 | 94 | 0 | 0 | 0 | 0 | PASS through the same complete execution |
| TP-BUG017-04-05 | 1 | 1 | 0 | 0 | 0 | 0 | PASS |

The active test rows now have current test-phase execution evidence. Scope 4 and both status
mirrors remain `in_progress`. This phase changed no planning semantics, test source, runtime
source, configuration, certification, acceptance, or historical candidate evidence.

## Scope 4 Independent Regression Verification At 2026-08-28 {#scope-4-independent-regression-verification-at-2026-08-28}

**Phase:** regression
**Claim Source:** interpreted
**Interpretation:** The protected BUG-017 route and its BUG-022 consumer have no observed
regression. The live repository selftest is not clean because excluded concurrent work causes
two failures. This section does not claim a repository-wide regression-free result.
**Execution time:** 2026-08-28T05:46:03Z

### Derived Protected Surface And Consumers

The committed Scope 4 range starts after `2c9b6de1a` and ends at current HEAD
`7e23e73241cf85822c6a8b6e59a9227389377ede`. Git reported thirteen changed paths.
The selected runtime route reaches these three current surfaces:

- `playwright.config.mjs`
- `.specify/memory/agents.md`
- `tests/playwright-runtime.foundation.functional.mjs`

The two explicit revert commits restored `tests/playwright-runtime.mjs`,
`tests/portfolio-survival-foundation.spec.mjs`, and
`tests/portfolio-survival-paths.spec.mjs` to baseline object identities.
The selected route also changes BUG-017 packet artifacts and two BUG-022 evidence artifacts.

The canonical impact resolver derived all eleven BUG-017 scenarios as affected. It also
derived `SCN-BUG022-003` as the affected consumer scenario. This result came from the three
runtime and registry paths above. It did not inherit a hand-maintained consumer list.

The live dirty boundary contained five BUG-017 packet files and the excluded concurrent
market-brief and tool-brief-v2 paths. A path-limited diff against HEAD returned zero for the
runner config, command registry, functional carrier, and all eight portfolio browser files.

### Current Protected Browser Execution

**Command:** `node /private/tmp/rl-bug017-scope4-test-probe.mjs`
**Child command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `992800292ed5179ccc44555bdb06fafe04647f645f069db3c4699bcf42a1de0c`

```text
# BUG-017 regression exact BUG-022 C03 consumer with process ownership
$ node /private/tmp/rl-bug017-scope4-test-probe.mjs
exit: 0
lines: 313
sha256: 992800292ed5179ccc44555bdb06fafe04647f645f069db3c4699bcf42a1de0c
CONFIG_RECEIPT workers=1 project=system-chrome browser=chromium channel=chrome configOk=true
Running 94 tests using 1 worker
94 passed (1.4m)
PLAYWRIGHT_EXIT=0 PLAYWRIGHT_SIGNAL=none
RUN_SIGNALS resolvedOne=1 passed94=1 forceKillMarkers=0 ignoredLifecycleMarkers=0 skipped=0
PROCESS_OWNERSHIP trackedPids=192 maxConcurrent=12 ownedResidue=0 ownedResiduePids=none
PROCESS_AFTER relevantCount=4 trackedRelevantResidue=0 ambientRelevantDelta=0
RUN_RECEIPT accepted=1 tests=94 passed=94 failed=0 skipped=0 todo=0
BUG017_SCOPE4_EXACT_RUN_END
```

This execution independently verified the selected worker count, browser project, Chrome
channel, process exit, force-kill visibility, and process release. It executed the exact
BUG-022 C03 consumer command once. It did not execute either rejected candidate scenario.

### Current Functional And Direct-Node Families

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `9232b97374413397011838bac8ff55fa8e54d59f463268f4fbaac0ebbf27c49c`

```text
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
ℹ tests 15
ℹ pass 15
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Command:** `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `175b973fc07c2fb442ad25de3bc36c9df2c581a57781375d6d04387b3950df0c`

```text
exit: 0
lines: 266
sha256: 175b973fc07c2fb442ad25de3bc36c9df2c581a57781375d6d04387b3950df0c
✔ SCN-008-046 all five public artifacts contribute independently to one local generic evidence identity
✔ SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
✔ SCN-008-047 failed candidate preserves the last valid structured result
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ℹ tests 257
ℹ pass 257
ℹ fail 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5015.41375
```

### Traceability, Quality, And Acceptance Matrix

**Claim Source:** executed
**Capture SHA-256:** `342817098a87a8543e6e15c6d14a6c8f1b9ac0e4ebd11477f55a8a7ffff8118c`

```text
CHECK_EXIT artifact_bug017=0
CHECK_EXIT artifact_bug022=0
CHECK_EXIT traceability_bug017=0
CHECK_EXIT traceability_bug022=0
CHECK_EXIT obligations_bug017=0
CHECK_EXIT obligations_bug022=0
CHECK_EXIT mechanisms_bug017=0
CHECK_EXIT mechanisms_bug022=0
CHECK_EXIT linked_tests_bug017=0
[scenario-test-resolve] OK — 35 reference(s) resolved via literal-scan; 18 category comparison(s) not applicable (no test-discovery adapter declared)
CHECK_EXIT linked_tests_bug022=0
[scenario-test-resolve] OK — 0 reference(s) resolved via literal-scan
CHECK_EXIT spec_test_paths=0
CHECK_EXIT scope_progress=0
CHECK_EXIT acceptance=0
CHECK_EXIT reachability=1
NEW ORPHAN tests/tool-brief-v2.stress.mjs — matched by none of the 10 declared glob(s)
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 9
Files with adversarial signals: 9
CHECK_EXIT regression_quality=0
MATRIX_OVERALL_EXIT=1
```

BUG-017 resolved all 35 linked-test references. BUG-022 returned success with zero linked
references. Its manifest still says tests were unauthored and keeps each `linkedTests` array
empty. The test files now exist and executed above. This is a planning-owned manifest gap,
not a failure of the selected BUG-017 runtime route.

The active carrier scan found no executable `skip`, `todo`, `fixme`, or `only` marker.
The focused functional inventory grew from fourteen to fifteen test declarations. Its
`assert.*` inventory grew from 106 to 114. The command registry declares no line-coverage
command, so this pass did not invent a coverage percentage.

### Repository Selftest Attribution

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `bb3aa0404e464f1431104e953e01019927a08485b41d7fa9b8f29714823b03ec`

```text
# BUG-017 regression live-checkout repository selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3967
sha256: bb3aa0404e464f1431104e953e01019927a08485b41d7fa9b8f29714823b03ec
✗ FAIL: no tests/*.mjs file is unreachable outside the frozen baseline — a file no declared command selects is never run, so it reads as coverage while delivering none (1 new, 6 known-orphan, 20 stale, 11 exempt as shared-helper-module, of 207 file(s))
✗ FAIL: market-brief.html classifies exactly 17 uniquely-named top-level blocks, six default-visible and eleven collapsed, so an unclassified block cannot reach the default view unnoticed
================================================
Research-Lab self-test: 3463 passed, 2 failed
================================================
```

The same command passed at clean detached HEAD `7e23e73241cf` with 3465 passes and zero
failures. Its capture SHA-256 is
`0eb62babdc20d45eb6449c468e6160ce1d443d6558dffd7130c144b25b3720c9`.
That clean run attributes the two live failures to uncommitted concurrent paths.
It does not prove the five uncommitted BUG-017 packet files. The live browser, functional,
Node, artifact, traceability, and scenario checks above prove the current packet surface.

### Scenario State And Required Shell

**Claim Source:** executed

```text
/opt/homebrew/bin/bash
GNU bash, version 5.3.15(1)-release (aarch64-apple-darwin25.4.0)
STATE_TRANSITION_GUARD_BASH_N_EXIT=0
scenario-state-resolve: specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos
source revision: 7e23e73241cf
SCN-BUG017-01  state=PLANNED  derived=[PLANNED]
SCN-BUG017-02  state=PLANNED  derived=[PLANNED]
SCN-BUG017-03  state=PLANNED  derived=[PLANNED]
SCN-BUG017-04  state=PLANNED  derived=[PLANNED]
SCN-BUG017-05  state=PLANNED  derived=[PLANNED]
SCN-BUG017-06  state=PLANNED  derived=[PLANNED]
SCN-BUG017-07  state=PLANNED  derived=[PLANNED]
SCN-BUG017-08  state=PLANNED  derived=[PLANNED]
SCN-BUG017-09  state=PLANNED  derived=[PLANNED]
SCN-BUG017-10  state=PLANNED  derived=[PLANNED]
SCN-BUG017-11  state=PLANNED  derived=[PLANNED]
```

The scenario-state capture has SHA-256
`fb98c63924c160856ed1fb9e29f2729ae3fa853443a48fd9a9dcc8a6cf9ef65c`.
All 325 refusal lines were revision-drift exclusions. The resolver exited zero.

### Current Transition Guard

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `c1a6c807f65628dec22fe6e446e79789ad4cf2b897d34c365c3a557f50ab9282`

```text
/opt/homebrew/bin/bash
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G017,G027,G136]
failedChecks: [Check-4-scenario-states,Check-9-evidence]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 9
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

The diagnostic rerun exposed all nine blocking observations. Two observations report the same
three-of-four completion mirror mismatch. Three observations reject the shared Scope 4 evidence
link because its parent section contains fewer than ten non-blank lines before its first child
heading. One observation reports stale receipts. One reports a cloned receipt identity. One
reports the eleven unsatisfied scenario-state chains. The final observation is G136 acceptance.

The guard executed through Homebrew Bash and reached its result envelope. It did not produce a
parser error. The installed gate registry has no current G017 record. Its G016 record says it
consolidates former G017. The guard still emits G017 for the evidence blockers. This metadata
drift is framework-owned and remains route-only from this downstream packet.

### Finding Accounting And Verdict

| Finding | Classification | Evidence | Disposition |
| --- | --- | --- | --- |
| `F-FRAMEWORK-017-TRANSITION-GUARD-SYNTAX` | Addressed as false under the required shell | Homebrew Bash 5.3.15 resolves first and `bash -n` exits 0 | No framework edit. |
| `F-VALIDATE-017-SCENARIO-STATES` | Unresolved and validate-owned | All eleven states derive as `PLANNED` | Preserve for `bubbles.validate`. |
| `F-VALIDATE-017-COMPLETION-MIRROR` | Unresolved and validate-owned | Execution lists four Done scopes while certification lists three | Preserve for `bubbles.validate`. |
| `F-ACCEPTANCE-017-G136` | Unresolved operator and validation boundary | The Human Acceptance Record exists while all ten Checklist rows remain unchecked | Preserve for the completion guard and operator boundary. |
| `F-PLAN-017-EVIDENCE-ANCHOR-WINDOW` | Unresolved and planning-owned | Three checked Scope 4 rows link to a parent evidence heading whose pre-child block is shorter than ten non-blank lines | Route to `bubbles.plan`. |
| `F-VALIDATE-017-STALE-RECEIPTS` | Unresolved and validate-owned | The guard reports 76 stale receipts in its evidence-integrity check | Preserve for `bubbles.validate` to classify against current obligations. |
| `F-VALIDATE-017-RECEIPT-CLONE` | Unresolved and validate-owned | The guard reports one substantive stdout identity across incompatible or unproven receipt identities | Preserve for `bubbles.validate` and audit ownership. |
| `F-CONCURRENT-SELFTEST` | Reproduced and route-only | Live selftest is 3463/2 while clean HEAD is 3465/0 | The active concurrent owner controls the excluded paths. |
| `F-REGRESSION-022-LINKED-TEST-VACUITY` | New planning-owned finding | BUG-022 resolves zero linked references although its functional and browser carriers now exist | Route to `bubbles.plan` for BUG-022. |
| `F-FRAMEWORK-017-GATE-ID-DRIFT` | New framework-owned finding | The guard emits failed gate G017 while the installed registry records G017 only as a former gate consolidated into G016 | Route to the canonical Bubbles owner. Do not edit downstream framework files. |

**Protected-surface verdict:** No regression was observed in the one-worker system-Chrome
route, the unchanged 300000ms stop budget, failure visibility, candidate rollback, process
release, BUG-022 C03 browser consumer, or Feature 008 direct Node family.

**Overall verdict:** `REGRESSION_DETECTED`. The two repository selftest failures belong to
excluded concurrent work. A repository-wide `REGRESSION_FREE` claim is therefore not made.
Top-level status and certification remain `in_progress`.

## Current Implementation Wording Authority At 2026-08-28 {#current-implementation-wording-authority-at-2026-08-28}

**Phase:** implement
**Claim Source:** interpreted

The current config disclosure does not assign the mechanism to Playwright, Chrome, or
repository code. It records only that Playwright emits the force-kill and that the selected
browser is operator-installed Chrome. Those ownership facts do not establish the transport or
process mechanism.

The earlier Scope 1 addendum and fallback uncertainty declaration remain historical narrative.
They do not control the selected route's current causal statement. Their commands, exits, and
candidate receipts remain unchanged.

The rejected Foundation lifecycle candidate remains rolled back. The selected route remains
`workers: 1` with `system-chrome`, `channel: chrome`, the 300000ms budget, and visible force-kill
behavior. BUG-022's earlier two-worker candidate receipt remains historical. Its later fallback
consumer receipt records the current one-worker route.

`.specify/memory/agents.md` still assigns an upstream causal label. This phase does not edit that
foreign-owned command registry. The contradiction routes to `bubbles.commands`.

### Focused Current-Session Verification

**Phase:** implement
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `5ba758c82c24c157dedfdcbf93e3eea0df53176d5b279b0c3e86a76677db68bb`

```text
# BUG-017 wording authority focused functional
$ node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 51
sha256: 5ba758c82c24c157dedfdcbf93e3eea0df53176d5b279b0c3e86a76677db68bb
--- first 20 ---
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] committedBrowserConfigs=playwright.config.mjs
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=81
[playwright-runtime] sharedImporters=81
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=81
[playwright-runtime] nodeGlobSelected=118
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
--- omitted 11 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ every Playwright spec uses the shared seam and sole committed browser config (2697.135084ms)
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint (4.265166ms)
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs (1.50775ms)
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative (1.189167ms)
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority (1.299667ms)
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance (40.332542ms)
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth (481.366667ms)
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority (576.445209ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.705625ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.476334ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.265584ms)
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (1.550583ms)
ℹ tests 15
ℹ suites 0
ℹ pass 15
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4414.938958
```

The first static wrapper searched the command registry for the clarification's wording instead
of the registry's actual phrase. It stopped before the diff check and is not pass evidence. The
corrected wrapper below used the exact registry phrase. No file changed between those attempts.

**Phase:** implement
**Command:** `zsh -c 'print -- "BUG017_WORDING_STATIC_BEGIN"; grep -n "workers: 1" playwright.config.mjs; grep -n "name: .system-chrome." playwright.config.mjs; grep -n "channel: .chrome." playwright.config.mjs; grep -n "300000ms" playwright.config.mjs; grep -n "force-killed it" playwright.config.mjs; if grep -nEi "cause is upstream|upstream cause|upstream socket cause|defect itself is upstream" playwright.config.mjs; then print -- "CONFIG_CAUSAL_OVERCLAIM=present"; exit 1; else print -- "CONFIG_CAUSAL_OVERCLAIM=absent"; fi; grep -n "Current Implementation Wording Authority At 2026-08-28" specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md; grep -n "candidate receipts remain unchanged" specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md; grep -n "Fallback Consumer Receipt" specs/_bugs/BUG-022-historical-report-declaration-leak/report.md; grep -n "selected the planned one-worker fallback" specs/_bugs/BUG-022-historical-report-declaration-leak/report.md; grep -n "upstream cause" .specify/memory/agents.md; registry_rc=$?; [[ $registry_rc -eq 0 ]] || exit 1; print -- "COMMAND_REGISTRY_CONTRADICTION_FOUND=true"; git diff --check -- playwright.config.mjs specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md specs/_bugs/BUG-022-historical-report-declaration-leak/report.md; diff_rc=$?; print -- "FOCUSED_DIFF_CHECK_EXIT=$diff_rc"; print -- "BUG017_WORDING_STATIC_END"; exit $diff_rc'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG017_WORDING_STATIC_BEGIN
24:  workers: 1,
27:      name: 'system-chrome',
30:        channel: 'chrome',
8:    restored to its pre-candidate bytes. Playwright can wait out its unchanged 300000ms
9:    teardown budget, report `worker-N process did not exit within 300000ms after stop,
10:    force-killed it`, and exit 1 after a fully green run. Historical characterization remains
CONFIG_CAUSAL_OVERCLAIM=absent
3244:## Current Implementation Wording Authority At 2026-08-28 {#current-implementation-wording-authority-at-2026-08-28}
3256:candidate receipts remain unchanged.
1243:## BUG-017 Scope 4 Fallback Consumer Receipt {#bug-017-scope-4-fallback-consumer-receipt}
1250:commits, and selected the planned one-worker fallback. This receipt records BUG-022's unchanged
262:bounds exposure rather than removing the upstream cause. The full disclosure sits beside the `workers` line in
COMMAND_REGISTRY_CONTRADICTION_FOUND=true
FOCUSED_DIFF_CHECK_EXIT=0
BUG017_WORDING_STATIC_END
```

## Superseding Current Wording Authority After Iteration 4 {#superseding-current-wording-authority-after-iteration-4}

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The live command registry, live Playwright config, and fresh iteration-4 receipt now agree on current causal wording.

The [live command-registry wording](../../../.specify/memory/agents.md#playwright-e2e) and
[live Playwright config disclosure](../../../playwright.config.mjs) say the underlying
mechanism is not established. Both state that `workers: 1` bounds exposure.

The [fresh iteration-4 test receipt](#test-phase-convergence-iteration-4-current-process-residue-proof)
records one worker, `system-chrome`, `channel: chrome`, 94 of 94 passes, and exit 0. It records
zero Playwright worker or remote-debugging Chrome residue. It also records zero repository or
external probe artifacts after cleanup, with no force-kill, lifecycle, skip, `todo`, `fixme`,
or `only` marker.

The contradiction receipt in [the earlier current-authority section](#current-implementation-wording-authority-at-2026-08-28)
remains unchanged as execution history. It is historical and non-authoritative for current
wording.

The one-worker setting provides exposure containment for the observed teardown condition. It does not
remove, identify, or diagnose any root, upstream, socket, transport, or process mechanism.

<!-- bubbles:test-iteration-4-current-proof-begin -->

## Test Phase Convergence Iteration 4 Current Process-Residue Proof {#test-phase-convergence-iteration-4-current-process-residue-proof}

**Phase:** test
**Claim Source:** executed
**Execution date:** 2026-08-28
**Persisted mode:** `bugfix-fastlane`
**Semantic mode:** `fix action:fastlane target:bug`

This section records only commands executed in the current test invocation. It leaves the
rejected SCN-BUG017-09 and SCN-BUG017-10 candidate receipts unchanged.

### Current Mode Resolution

**Command:** `bash .github/bubbles/scripts/mode-resolver.sh fix action:fastlane target:bug`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `f7ccd0bd74b094512fcd06fcd0dd30d284056b6c4e10c05ff37f1dddfe6fd544`

```text
# BUG-017 iteration 4 semantic bugfix-fastlane mode
$ bash .github/bubbles/scripts/mode-resolver.sh fix action:fastlane target:bug
exit: 0
lines: 45
sha256: f7ccd0bd74b094512fcd06fcd0dd30d284056b6c4e10c05ff37f1dddfe6fd544
statusCeiling: done
description: Focused bug loop with mandatory reproduction and verification. Loops until validate certifies the fix or returns a documented blocked verdict.
transitionAudit:
  profile: delivery-completion-v1
  target: statusCeiling
phaseOrder: [select, bootstrap, implement, test, regression, simplify, gaps, harden, stabilize, devops, security, validate, audit, finalize]
```

### Current Linked-Test Resolution

**Command 1:** `/bin/bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos --repo-root .`
**Command 1 Exit Code:** 0
**Command 2:** `/bin/bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-022-historical-report-declaration-leak --repo-root .`
**Command 2 Exit Code:** 0
**Combined wrapper Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `fd1de01200020ad3e50d8c9efe52f07a4d968615e3abed6e56851a67196d9a79`

```text
# BUG-017 and BUG-022 iteration 4 linked-test resolution
exit: 0
lines: 7
sha256: fd1de01200020ad3e50d8c9efe52f07a4d968615e3abed6e56851a67196d9a79
BUG017_LINKED_TEST_RESOLUTION_BEGIN
[scenario-test-resolve] OK — 35 reference(s) resolved via literal-scan; 18 category comparison(s) not applicable (no test-discovery adapter declared)
BUG017_LINKED_TEST_RESOLUTION_EXIT=0
BUG022_LINKED_TEST_RESOLUTION_BEGIN
[scenario-test-resolve] OK — 30 reference(s) resolved via literal-scan; 6 category comparison(s) not applicable (no test-discovery adapter declared)
BUG022_LINKED_TEST_RESOLUTION_EXIT=0
LINKED_TEST_RESOLUTION_END
```

### Current Focused BUG-017 And BUG-022 Functional Contracts

**Command:** `node --test '--test-name-pattern=^(Regression: SCN-BUG022-|Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$)' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `790928d37ea85d21fdc2ff54e7cec9d0dfef14adcb12f25d63fbc64b128b65e6`

```text
[SCN-BUG017-11] workers=1
[SCN-BUG017-11] project=system-chrome
[SCN-BUG017-11] channel=chrome
[SCN-BUG017-11] defaultWorkerStopBudgetMs=300000
[SCN-BUG017-11] forceKillDisclosure=present
[SCN-BUG017-11] lifecycleCandidateRolledBack=true
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
ℹ tests 7
ℹ suites 0
ℹ pass 7
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3351.038084
```

### Current Exact BUG-022 C03 Process-Ownership Proof

**Child command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Capture command:** `node --input-type=module -`
**Outer bound:** 900 seconds
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `d11ebe0748de9b55578374a346ecc8416fb90ed02b4ade0a0e8ec1085ff149da`

The inline probe used the existing process-tree sampling pattern. It classified descendants by
the checkout-local Playwright worker entrypoint and Chrome's remote-debugging pipe. Playwright
created its last-run file in an external temporary path. The probe removed that file and every
repository output path created by the run before it exited.

The displayed `postRunPaths` value below normalizes the local checkout prefix to `<repo>`.
The capture SHA-256 above covers the unmodified raw command output.

```text
# BUG-017 iteration 4 post-resolution current one-worker C03 process ownership proof
$ node --input-type=module -
exit: 0
lines: 316
sha256: d11ebe0748de9b55578374a346ecc8416fb90ed02b4ade0a0e8ec1085ff149da
BUG017_ITERATION4_PROCESS_PROOF_BEGIN
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
CONFIG_RECEIPT workers=1 project=system-chrome browser=chromium channel=chrome configOk=true
PROCESS_BEFORE playwrightWorkers=0 remoteDebugChrome=0 relevant=0 competingWorkloads=0
OUTPUT_PRE_CLEAN repositoryArtifacts=0 paths=none externalTemp=0
OUTPUT_BASELINE repositoryArtifacts=0 externalTemp=0
Running 94 tests using 1 worker
94 passed (1.5m)
PLAYWRIGHT_EXIT=0 PLAYWRIGHT_SIGNAL=none SPAWN_ERROR=none
RUN_SIGNALS resolvedOne=1 passed94=1 forceKillMarkers=0 ignoredLifecycleMarkers=0 skipped=0 todo=0 fixme=0 only=0
PROCESS_OWNERSHIP trackedPids=284 maxConcurrent=12 trackedPlaywrightWorkers=1 maxPlaywrightWorkers=1 trackedRemoteDebugChrome=256 maxRemoteDebugChrome=4 sampleErrors=0 ownedResidue=0
PROCESS_AFTER playwrightWorkers=0 remoteDebugChrome=0 relevant=0 relevantDelta=0 ownedPlaywrightWorkerResidue=0 ownedRemoteDebugChromeResidue=0
OUTPUT_ARTIFACTS postRunRepository=1 postRunPaths=<repo>/test-results externalTempCreated=1 finalRepository=0 finalExternalTemp=0 clean=1
RUN_RECEIPT accepted=1 tests=94 passed=94 failed=0 skipped=0 todo=0 fixme=0 only=0
BUG017_ITERATION4_PROCESS_PROOF_END
```

### Current Focused Artifact Lint

**Command 1:** `/bin/bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`
**Command 1 Exit Code:** 0
**Command 2:** `/bin/bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak`
**Command 2 Exit Code:** 0
**Combined wrapper Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `5d419d528ea6d8729428ef9d71b7feba1d35672f265f583997e90077120ba8a2`

```text
# BUG-017 and BUG-022 iteration 4 focused artifact lint
exit: 0
lines: 85
sha256: 5d419d528ea6d8729428ef9d71b7feba1d35672f265f583997e90077120ba8a2
BUG017_ARTIFACT_LINT_BEGIN
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
Artifact lint PASSED.
BUG017_ARTIFACT_LINT_EXIT=0
BUG022_ARTIFACT_LINT_BEGIN
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
Artifact lint PASSED.
BUG022_ARTIFACT_LINT_EXIT=0
FOCUSED_ARTIFACT_LINT_END
```

The current exact C03 execution satisfied every process-proof signal requested by the active
test finding. It did not execute either rejected candidate scenario and did not run the
repository-wide selftest.

<!-- bubbles:test-iteration-4-current-proof-end -->

## Validate Phase Convergence Iteration 4 Certification Reconciliation {#validate-phase-convergence-iteration-4-certification-reconciliation}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Current validate execution establishes the focused command results below. The
94-test process result remains test-phase evidence from the current-session receipt above; validate
inspected its anchor and provenance but did not execute or adopt that browser command as its own run.

### Current Test Receipt Provenance

The current test section above is tagged `Phase: test`, `Claim Source: executed`, execution date
2026-08-28, persisted mode `bugfix-fastlane`, and semantic mode
`fix action:fastlane target:bug`. Its complete-capture SHA-256
`d11ebe0748de9b55578374a346ecc8416fb90ed02b4ade0a0e8ec1085ff149da` covers the
316-line process probe. The bounded receipt reports one configured worker, `system-chrome`, Chrome
channel, 94 of 94 passing, child exit 0, no force-kill or lifecycle-ignore marker, no skipped,
`todo`, `fixme`, or `only` marker, zero owned Playwright or Chrome residue, and complete output
cleanup. This validate phase did not rerun SCN-BUG017-04, SCN-BUG017-05, SCN-BUG017-09, or
SCN-BUG017-10. Their manifest entries remain historical and replaced by SCN-BUG017-11 where
declared.

### Validate-Owned Completion Mirror Repair

The four scope artifacts are marked Done. Validate reconciled both `completedScopes` arrays and
`certification.scopeProgress` to these exact scope IDs and DoD counts:

| Scope ID | Status | Checked | Unchecked |
| --- | --- | ---: | ---: |
| `01-characterise-the-stall-well-enough-to-choose` | done | 10 | 0 |
| `02-apply-the-selected-remedy` | done | 9 | 0 |
| `03-disclose-it-where-a-developer-meets-it` | done | 8 | 0 |
| `04-close-the-foundation-browser-before-worker-teardown` | done | 3 | 0 |

Packet status and `certification.status` remain `in_progress`. No certified phase, scenario state,
acceptance value, or execution provenance was advanced.

### Current Validate Execution

**Claim Source:** executed

| Check | Exit | Complete-capture fact |
| --- | ---: | --- |
| Semantic mode resolution | 0 | 45 lines, SHA-256 `f7ccd0bd74b094512fcd06fcd0dd30d284056b6c4e10c05ff37f1dddfe6fd544`; ceiling `done`, audit profile `delivery-completion-v1` |
| Goal fidelity at pre-certification | 1 | 3 lines, SHA-256 `a90d02e41bd4a4edf8bf5eade75a4e370b370e68336436ce5daa4778c4999161`; G070 reports no non-empty Outcome Contract and no Hard Constraints |
| Canonical scenario-state certifiability | 1 | 393 lines, SHA-256 `05a414bf236c903598d2b70e4a0dcde190c18fb6ae3c6b1a8925955a30e46ba3`; all eleven scenarios derive only `PLANNED` at source revision `4bd96545cd66` |
| Completion-mirror validator after repair | 0 | 2 lines, SHA-256 `b5a9ca8bc45dec0c5056a5a3a21883be1163a6a543e818f032093730455961a7`; no new DoD progress drift |
| Artifact lint after repair | 0 | 40 lines, SHA-256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| Linked-test resolution | 0 | 35 references resolved; SHA-256 `c48e44229a95772b5d47958f8c04ed1be041168b8edb4df0ec1991996bc010fd` |
| Traceability guard | 0 | 125 lines, SHA-256 `5ad69ecd07764052ce224dc19cf84373112523fec58170e1b3991b1bfb69100c`; 9 scenarios mapped, 25 rows checked, 0 warnings |
| Focused BUG-017/BUG-022 functional contracts | 0 | 21 lines, SHA-256 `3a02af0a8664b23438b44d116a16e6be6a68b978660f8a2056e0bd56a4ca753d`; 7 passed, 0 failed, 0 skipped, 0 todo |
| Asserted transition guard after mirror repair | 1 | 763 lines, SHA-256 `91dcc51a7094eef256675d474fce1b34724aad7a8f4d090eae76d4bef418c82f`; `DELIVERY_COMPLETION_FAILED` |

The post-repair guard clears G027 and reports four remaining blocking conditions: scenario states
are not receipt-derived beyond `PLANNED`; 76 current evidence receipts are stale; one substantive
stdout hash is classified as a receipt clone across incompatible or unproven identities; and G136
rejects the ten unchecked Checklist rows. The existing Human Acceptance Record does not override
unchecked behavior-specific acceptance. The operator's generic authorization and approval text
does not enumerate these ten rows, so validate did not check them or rewrite the record.

No repository-wide selftest was executed by validate. Existing nonzero selftest evidence and all
excluded market-brief, tool-brief, probe, and company-intelligence work remain outside this
validation claim.

## Validate-Owned Outcome Contract Success Signal Mapping — Iteration 4 {#validate-owned-outcome-contract-success-signal-mapping-iteration-4}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** This section evaluates the newly declared Success Signal against the cited
iteration-4 test evidence. It does not rerun the browser workload, create a test receipt, or decide
whether the receipt remains admissible after later artifact edits.

**Declared Success Signal:** Current selected-route evidence must show the exact config-default
BUG-022 C03 workload at one worker under `system-chrome` with `channel: chrome`; 94 of 94 passing
with process exit zero; no force-kill or ignored-lifecycle marker; and zero workload-owned
Playwright or Chrome residue.

| Success Signal clause | Current evidence | Evaluation |
| --- | --- | --- |
| Exact config-default C03 route resolves one worker, `system-chrome`, and `channel: chrome` | [Iteration-4 process-residue proof](#test-phase-convergence-iteration-4-current-process-residue-proof) records `CONFIG_RECEIPT workers=1 project=system-chrome browser=chromium channel=chrome configOk=true`. | Demonstrated by the cited test receipt. |
| The workload reports 94 of 94 passing and exits zero | The same receipt records `Running 94 tests using 1 worker`, `94 passed`, `PLAYWRIGHT_EXIT=0`, and `RUN_RECEIPT accepted=1 tests=94 passed=94 failed=0`. | Demonstrated by the cited test receipt. |
| No force-kill or ignored-lifecycle marker is emitted | The same receipt records `forceKillMarkers=0` and `ignoredLifecycleMarkers=0`, with zero skip, `todo`, `fixme`, or `only` markers. | Demonstrated by the cited test receipt. |
| Zero workload-owned Playwright or Chrome residue remains | The same receipt records `ownedResidue=0`, zero post-run Playwright-worker residue, zero post-run remote-debugging Chrome residue, and `clean=1` after output cleanup. | Demonstrated by the cited test receipt. |

The [current wording authority](#superseding-current-wording-authority-after-iteration-4) preserves
the evidence boundary. Current configuration remains `workers: 1`, `system-chrome`,
`channel: chrome`, with the 300000ms teardown budget unchanged. Any force-kill, ignored lifecycle
error, non-zero exit, or owned residue remains a failure. The route bounds exposure only; it does
not establish or remove a root, upstream, socket, transport, or process mechanism. Rejected
SCN-BUG017-09 and SCN-BUG017-10 lifecycle receipts remain historical. This mapping does not claim
the repository-wide selftest is green and does not advance scenario state, specialist phases,
human acceptance, or certification.


<!-- bubbles:implement-iteration-4-scn-bug017-06-evidence-begin -->

## Implementation Phase Convergence Iteration 4 SCN-BUG017-06 Ratio Evaluator Evidence {#implementation-phase-convergence-iteration-4-scn-bug017-06-ratio-evaluator-evidence}

**Phase:** implement
**Claim Source:** interpreted
**Evidence provenance:** The prior `bubbles.implement` invocation under repository-binding decision
`rb:vscode-004aa4f6bc5dacec42ad4d9f2afe0015:8` executed the commands below. This report-only
follow-up independently located that invocation's RESULT-ENVELOPE in the current session evidence
and recomputed both implementation-file hashes. It did not rerun or adopt the prior commands as
new execution evidence.

### Frozen Implementation Boundary

The implementation closure contains exactly two files:

- `scripts/validate-playwright-cost-ratio.mjs`, SHA-256
  `f23c862277e6b6d6bd9eee56f54f260b7b640197bedb7843fe97806ffa3fb153`.
- `tests/playwright-runtime.foundation.functional.mjs`, SHA-256
  `15c79fee9ae824446f60fdd02b69ace9d8743f92e755cdf4843eff1c364b70a9`.

The helper defines `evaluateWallTimeRatio()` as the single FR-017-004 predicate. Both
`runControl()` and `runLive()` call it. The predicate accepts a comparison only when
`systemChromeWallMs / bundledChromiumWallMs <= 3.0`, and it owns the scenario message and exit
code for both deterministic and live inputs.

The CLI surface is closed to these forms:

| Accepted invocation | Path |
| --- | --- |
| `node scripts/validate-playwright-cost-ratio.mjs --live` | Runs the complete 22-file lifetime-tax workload under bundled Chromium and system Chrome at the configured one-worker default, then applies the shared predicate. |
| `node scripts/validate-playwright-cost-ratio.mjs --control at-bound` | Creates the isolated 3000ms-to-1000ms comparison and applies the shared predicate. |
| `node scripts/validate-playwright-cost-ratio.mjs --control over-bound` | Creates the isolated 3001ms-to-1000ms comparison and applies the shared predicate. |

`parseInvocation()` rejects every other argument shape. `main()` maps that usage rejection to exit
64. The deterministic controls remove their owned operating-system temporary record before exit.

### Prior Implementation Execution Receipts

The rows below transcribe the prior implementation invocation's session evidence. They are not
commands executed by this report-only follow-up.

| Receipt | Exact inner command recorded by the prior invocation | Exit | Capture SHA-256 | Recorded signal |
| --- | --- | ---: | --- | --- |
| Pre-implementation RED | `node --test --test-name-pattern='^Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison$' tests/playwright-runtime.foundation.functional.mjs` | 1 | `fc5e5fff323608676732bc98e6fb815db7a0d9b6b30f0381aa1ffce0ffe07830` | `MODULE_NOT_FOUND` for `scripts/validate-playwright-cost-ratio.mjs`. |
| Deterministic over-bound refusal | `node scripts/validate-playwright-cost-ratio.mjs --control over-bound` | 1 | `9ba8dc10d4c8fbf3b3f556b03891d7b07498c6110fab5d2c20fc7b8193248a88` | `SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000`. |
| Deterministic at-bound GREEN | `node scripts/validate-playwright-cost-ratio.mjs --control at-bound` | 0 | `126769549145b36cfb711d95a4cc02d7879d38aa7e7dd3e6e1e8a0bed047de01` | `SCN-BUG017-06: wall-time ratio 3.000 meets FR-017-004 maximum 3.000`. |
| Persistent focused regression | `node --test --test-name-pattern='^Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `acb4319a35943c788b1873948d7b501e97e9509720a9140bc006e290fe0942dc` | 1 test passed; 0 failed. |
| Complete runtime functional family | `node --test tests/playwright-runtime.foundation.functional.mjs` | 0 | `7f73c531ed46a1098dd1bab09750f882ef39bc0fee55b84960db4d109b197526` | 16 tests passed; 0 failed, skipped, or todo. |

### Ownership And Claim Boundary

This implementation evidence establishes only the frozen evaluator and persistent functional
regression at the source hashes above. The helper's real `--live` mode was not executed by the
implementation invocation or by this follow-up. Fresh live-mode, repository-selftest, broader
workload, and final SCN-BUG017-06 scenario receipts remain owned by `bubbles.test` and are unclaimed
here. This section does not advance scenario state, terminal certification, specialist
certification, or human acceptance.

<!-- bubbles:implement-iteration-4-scn-bug017-06-evidence-end -->

<!-- bubbles:certifying-window-begin -->

## Simplify Phase Convergence Iteration 4 — BUG-017 Ratio And Containment Review {#simplify-phase-convergence-iteration-4-bug017}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** The review found one dead internal return value in the ratio helper. Removing
that return changes no validation branch, message, exit code, threshold, child-process lifecycle,
or temporary-record lifecycle. The complete functional carrier and both deterministic controls
executed against the resulting tree.
**Executed At:** 2026-08-29T08:02:53Z
**Outcome:** `route_required`

### Review And Change

The reuse pass confirmed that `evaluateWallTimeRatio()` remains the single predicate for live and
deterministic inputs. The quality pass removed the unused object returned by
`loadValidatedConfiguration()`. The efficiency pass found no safe change in the live child-process,
signal, or cleanup paths. Those paths remain explicit because they preserve owned-process teardown
and external temporary-record cleanup.

The combined simplify batch changes two implementation files in one Playwright validation family:

- `scripts/validate-playwright-cost-ratio.mjs` removes one unused return statement.
- `tests/playwright-runtime.foundation.functional.mjs` reuses its existing root declaration cache
  for two BUG-022 assertions. Fixture-root calls still execute independently.

`playwright.config.mjs`, `.specify/memory/agents.md`, the 3.0 maximum, the one-worker fallback,
`system-chrome`, `channel: chrome`, the 300000ms stop budget, exact failure messages, rejected
lifecycle history, and external-fixture provenance remain unchanged. This phase adds no scenario
receipt. SCN-BUG017-11 remains owned by `bubbles.test` at the final stable revision.

### Deterministic Ratio Controls

**Command:** `node scripts/validate-playwright-cost-ratio.mjs --control at-bound`; then
`node scripts/validate-playwright-cost-ratio.mjs --control over-bound` inside a wrapper that accepts
only exit sequence `0,1` and zero owned temporary residue
**Exit Code:** 0
**Claim Source:** executed

```text
BUG017_SIMPLIFY_RATIO_CONTROLS_BEGIN
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3000 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.000 meets FR-017-004 maximum 3.000
AT_BOUND_EXIT=0
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3001 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000
OVER_BOUND_EXIT=1
OWNED_TEMP_RESIDUE=0
EXPECTED_AT_BOUND_EXIT=0
EXPECTED_OVER_BOUND_EXIT=1
EXPECTED_OWNED_TEMP_RESIDUE=0
BUG017_SIMPLIFY_RATIO_CONTROLS_PASS
BUG017_SIMPLIFY_RATIO_CONTROLS_END
```

### Final Functional Carrier

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# simplify final runtime-foundation functional carrier
$ node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 59
sha256: c470fc6a9d76ff96c67e0af860b6a3486164603ac689d15b5186778029d8d370
--- first 20 ---
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] committedBrowserConfigs=playwright.config.mjs
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] sharedImporters=79
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
--- omitted 19 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint (2.942458ms)
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs (1.14175ms)
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative (1.0905ms)
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority (1.5925ms)
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance (34.740917ms)
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth (1.877959ms)
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority (0.456791ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.656292ms)
✔ Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison (69.656375ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.339417ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.094875ms)
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (0.391542ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 935.721917
```

### Packet And Containment Checks

| Check | Exit | Current signal |
| --- | ---: | --- |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos` | 0 | Artifact lint passed; 40 lines; SHA-256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| `node scripts/validate-scope-dod-progress.mjs` | 0 | 63 packets, 86 claims, 72 agreements, 14 frozen drifts, zero new or stale drift |
| Targeted `git diff --check` | 0 | The six simplify implementation and artifact paths contain no whitespace error |
| Unedited-surface comparison | 0 | `playwright.config.mjs`, `scripts/validate-test-file-reachability.mjs`, and `.specify/memory/agents.md` have no live-tree delta |
| Protected Feature 008 report comparison | 0 | The historical report has no live-tree delta |

The phase changes no packet status, certification field, scope status, acceptance value, scenario
state, historical evidence identity, browser command, or test assertion. Status and certification
remain `in_progress`. The next workflow phase owner is `bubbles.gaps`.

## Post-Hardening Regression Phase — Convergence Iteration 4 {#post-hardening-regression-phase-convergence-iteration-4-bug017}

**Phase:** regression
**Claim Source:** executed
**Executed At:** 2026-08-29T10:17:00Z
**Outcome:** `completed_diagnostic`
**Verdict:** `REGRESSION_FREE`

This regression epoch used detached HEAD `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`.
It overlaid exactly twelve authorized current paths from BUG-017 and BUG-022.
The overlay excluded every market-brief, tool-brief, probe, BUG-019, and company-intelligence path.

The current ratio helper has Git object `1fac6a8b7a783fd2c416c9449658296045a12611`.
That object differs from its prior live-proof object because simplify removed one unused return.
The phase therefore executed a new real dual-project comparison instead of reusing the prior proof.

### Current Ratio Controls And Live Comparison

**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node scripts/validate-playwright-cost-ratio.mjs --control at-bound`, followed by the identical `over-bound` form
**Exit Code:** 0 for the enclosing contract
**Claim Source:** executed

```text
BUG017_RATIO_CONTROLS_BEGIN
OWNED_TEMP_BEFORE=0
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3000 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.000 meets FR-017-004 maximum 3.000
AT_BOUND_EXIT=0
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3001 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000
OVER_BOUND_EXIT=1
OWNED_TEMP_AFTER=0
OWNED_TEMP_DELTA=0
RATIO_CONTROL_WRAPPER_EXIT=0
BUG017_RATIO_CONTROLS_END
```

**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 1400 node scripts/validate-playwright-cost-ratio.mjs --live`
**Exit Code:** 0
**Claim Source:** executed
**Complete-capture SHA-256:** `da7eb5041845885a1c1500478485cc4ae3906b3258d37c76ae7b511196ad9ccc`

```text
# BUG-017 regression R4 current-source live dual-project ratio
exit: 0
lines: 239
sha256: da7eb5041845885a1c1500478485cc4ae3906b3258d37c76ae7b511196ad9ccc
SCN-BUG017-06: live workload files=22 configuredWorkers=1
SCN-BUG017-06: live project=chromium files=22 start
111 passed (1.6m)
SCN-BUG017-06: live project=chromium exit=0 signal=none wallMs=96307.648
SCN-BUG017-06: live project=system-chrome files=22 start
111 passed (1.8m)
SCN-BUG017-06: live project=system-chrome exit=0 signal=none wallMs=107152.022
SCN-BUG017-06: observed runtime input systemChromeWallMs=107152.022 bundledChromiumWallMs=96307.648
SCN-BUG017-06: wall-time ratio 1.113 meets FR-017-004 maximum 3.000
BUG017_LIVE_OWNED_TEMP_RESIDUE=0
BUG017_LIVE_CLEANUP=PASS
```

### Current One-Worker Feature 008 Consumer

**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`, executed by an external process-ownership probe
**Exit Code:** 0
**Claim Source:** executed
**Complete-capture SHA-256:** `9c931f0f328b1424e88ed75715e78f4fdbe6d5e93871e0b2e0feff018883db90`

```text
# BUG-017 BUG-022 regression R4 exact 94-test one-worker C03 with process proof
exit: 0
lines: 313
sha256: 9c931f0f328b1424e88ed75715e78f4fdbe6d5e93871e0b2e0feff018883db90
BUG017_BUG022_R4_C03_PROCESS_PROOF_BEGIN
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
PROCESS_BEFORE rootCwd=0 remoteDebugChrome=0
Running 94 tests using 1 worker
94 passed (1.5m)
PLAYWRIGHT_EXIT=0 WALL_SECONDS=89
RUN_SIGNALS resolvedOne=1 passed94=1 forceKillMarkers=0 ignoredLifecycleMarkers=0
PROCESS_AFTER rootCwd=0 remoteDebugChrome=0 rootDelta=0 remoteDebugDelta=0
OUTPUT_CLEANUP before=1 after=0
RUN_RECEIPT accepted=1 tests=94 passed=94 failed=0 skipped=0 todo=0 ownedProcessDelta=0 remoteDebugDelta=0
PROBE_EXIT=0
BUG017_BUG022_R4_C03_PROCESS_PROOF_END
```

### Baseline, Cross-Spec, And Coverage Comparison

**Claim Source:** interpreted
**Interpretation:** Prior values come from preserved report receipts. Current values come from this
phase's isolated executions. The Feature 008 direct and browser consumers cover the shared spec
impact. The structural comparator covers the changed functional carrier.

| Check | Prior current baseline | Post-hardening result | Delta |
| --- | --- | --- | --- |
| Ratio boundary | 3.000 accepted and 3.001 refused | Same exits and messages | Stable |
| Real ratio | Prior source object had a passing live receipt | 1.113, both projects exit 0 | Current source re-proved |
| Shared functional carrier | 20 passed, 0 failed | 20 passed, 0 failed | Stable |
| Feature 008 direct Node | 257 passed, 0 failed | 257 passed, 0 failed | Stable |
| Feature 008 C03 | 94 passed, one worker, exit 0 | 94 passed, one worker, exit 0 | Stable |
| Canonical selftest | 3465 passed, 0 failed | 3465 passed, 0 failed | Stable |
| Functional declarations | 16 at HEAD | 20 in the authorized overlay | +4 |
| Functional assertion calls | 128 at HEAD | 156 in the authorized overlay | +28 |

The current Feature 008 design keeps the eight browser carriers on real pages and the shared
system-Chrome command. The BUG-022 design retains the same Playwright ownership boundary.
No route, model, data, or UI-flow contradiction was found across those contracts.

### Protected Checks And Integrity

| Check | Exit | Current result |
| --- | ---: | --- |
| Complete shared functional carrier | 0 | 20 passed, 0 failed, 0 skipped, 0 todo; SHA-256 `9c01aefadf91c91dd0ae337ca8bd7c4f94e8e4a892f1acec0e9eb01ae1e47813` |
| Feature 008 direct Node consumers | 0 | 257 passed; SHA-256 `a2a38a5feff9ee550985933a065f855e0540ce2d0d756fae5ff82fa4e73f66be` |
| Production reachability | 0 | 0 classification errors and 0 new orphans; SHA-256 `95811b00ec5c110cf85af7c8965ff9b4f7efc1565e6cb89d06df7df643a0e1bb` |
| Protected governance and traceability matrix | 0 | All 16 child checks exited 0; SHA-256 `823b0e6be34d9a87b6a5af1d7fce2b1ecff0f9a7372050e67d9f6906c148a174` |
| Canonical selftest | 0 | 3465 passed, 0 failed before report append; SHA-256 `acf3b2d3560395faa122155969f670a6b66ec8ffa42f4550b2de3612931972c2` |
| Post-report report-sensitive matrix | 0 | All eight children exited 0; SHA-256 `d41b05cba85669b87f0f9751fc3930ce2c3846830cb82effc36c164b25da452d` |
| Post-report canonical selftest | 0 | 3465 passed, 0 failed; SHA-256 `76130c3052891a948e6aea0fc3ab70663417589e11ad94b07dcc6438b9e3d1f4` |
| Protected integrity comparator | 0 | 12 authorized paths, 0 excluded paths, 0 protected failures |
| Coverage and weakening comparator | 0 | 4 added tests, 28 added assertion lines, 0 deleted tests, 0 deleted assertion lines |
| Explicit marker and interception scan | 0 | Both no-match children exited 1 as required |

The protected Feature 008 report remains at SHA-256
`8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b`.
The reachability baseline remains 26 entries at SHA-256
`dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73`.
The crossing ratchet remains nine entries at SHA-256
`b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470`.
The command registry remains at SHA-256
`2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49`.

The BUG-017 report removed zero prior lines. The rejected-candidate anchors and both explicit
revert identities remain present. The Foundation source remains at HEAD bytes and contains no
`foundationBrowserBoundary` or `foundationBrowser.close()` marker.

### Preserved Boundaries

This phase generated no scenario-state receipt. It did not edit source, config, tests, planning,
certification, user validation, or installed framework files.

The human G136 boundary remains unchanged. Final stable-revision receipts remain reserved for the
single final checkpoint. Later simplify, gaps, harden, security, validate, and audit phases remain
independently owned. Global stale-and-clone adjudication and external framework drift remain
append-only external work. Twenty stale reachability entries remain visible and non-blocking.

```text
🟢 REGRESSION_FREE
Protected functional baseline: 20/20 -> 20/20
Feature 008 direct Node: 257/257 -> 257/257
Feature 008 browser C03: 94/94 -> 94/94
Canonical selftest: 3465/3465 -> 3465/3465
Cross-spec conflicts: 0
Design contradictions: 0
Coverage: 16 -> 20 tests; 128 -> 156 assertion calls
New reachability orphans: 0
Protected integrity failures: 0
```

## Post-Hardening Simplify Phase — Convergence Iteration 4 {#post-hardening-simplify-phase-convergence-iteration-4-bug017}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** One shared-carrier test recomputed both runner selections before calling the
production disjointness verdict. The change now consumes the verdict's selected sets directly.
Every existing non-vacuity, parity, crossing, provenance, and per-file assertion remains.
**Executed At:** 2026-08-29T10:34:08Z
**Outcome:** `route_required`

### Superseding Review

This section supersedes the earlier simplify assessment for the reopened BUG-022 repair only.
The earlier section and its execution occurrence remain unchanged.

| Pass | Current result |
| --- | --- |
| Reuse | The test now uses `runnerDisjointnessVerdict()` as the single runner-selection implementation. |
| Quality | The test no longer destructures the unused `crossings` value. No test or assertion call was removed. |
| Efficiency | The test no longer compiles and matches both runner glob sets a second time through `discovery()`. |

The exact blob delta contains 11 added and 11 removed lines. The net line change is zero.
The test object changed from `520a6a71b398a221c3f55c884b8591b680a05da1` to
`d7bcf636103992a90b08d0b46f76c1838a55c42a`.

The ratio helper needs no further reduction. Its control record, child ownership, signal handling,
and temporary-root cleanup encode tested behavior. The helper remains object
`1fac6a8b7a783fd2c416c9449658296045a12611`.

The one-worker configuration and command registry also need no reduction. Their detailed text
preserves the measured limit and the developer-facing disclosure. Their objects remain
`e022a133857aa20bd10b759a98b80e2df38ce621` and
`08592d2bfaa8f6787806f05f508df9f3e0920a75`.

### Deterministic Ratio Controls

**Command:** bounded `--control at-bound` and `--control over-bound` invocations with owned-temp comparison
**Exit Code:** 0 for the enclosing contract
**Claim Source:** executed

```text
SIMPLIFY_RATIO_CONTROLS_BEGIN
OWNED_TEMP_BEFORE=0
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3000 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.000 meets FR-017-004 maximum 3.000
AT_BOUND_EXIT=0
SCN-BUG017-06: deterministic comparison input systemChromeWallMs=3001 bundledChromiumWallMs=1000
SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000
OVER_BOUND_EXIT=1
OWNED_TEMP_AFTER=0
SIMPLIFY_RATIO_CONTROLS_END
```

### Current Verification

| Check | Exit | Current signal |
| --- | ---: | --- |
| Exact affected disjointness title | 0 | One test passed. Browser selection was 79, Node selection was 115, and new crossings were zero. |
| TP-BUG022-F07 through F10, each in a separate invocation | 0 each | Root refusal, typed identity, wrapper distinction, and typed disjointness behavior passed. |
| Complete shared functional carrier | 0 | 20 passed with zero failures, skips, or todos. Complete-capture SHA-256 `9467954b474292f17eeb08d9aaabb624edf08c3a0fb7cb673952db26e38ff01f`. |
| Production reachability | 0 | Zero classification errors and zero new orphans. Complete-capture SHA-256 `95811b00ec5c110cf85af7c8965ff9b4f7efc1565e6cb89d06df7df643a0e1bb`. |
| Regression quality | 0 | Zero violations and zero warnings. The adversarial signal remained present. |
| Both packet artifact lints | 0 | Complete-capture SHA-256 `bec5645058bb65a0e938b181590c8cb811536c54163997855fa2dc6580f7c446`. |
| Both packet traceability guards | 0 | Complete-capture SHA-256 `04f6291fb023b50a227dc8d6b42c436c9823c66c6e82828658ed75569e8a9f2b`. |
| Canonical selftest before this report append | 0 | 3465 passed and zero failed. Complete-capture SHA-256 `0053ec80f5822af6eef982275ca74ab813b4d24ed8e1a799610be7cc7c976bcc`. |
| Reviewed JavaScript syntax | 0 | All four reviewed JavaScript files passed `node --check`. |
| Exact simplify blob diff | 0 | The 11-line replacement has no whitespace error and a zero net line change. |

No production source, configuration, command registry, baseline, crossing ratchet, or protected
Feature 008 report changed in this phase. No final receipt chain was executed. Status and
certification remain `in_progress`. The next required owner is `bubbles.gaps`.


