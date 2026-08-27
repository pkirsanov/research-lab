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


