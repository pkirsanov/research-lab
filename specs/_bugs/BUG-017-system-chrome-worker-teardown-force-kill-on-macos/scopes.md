# Scopes: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

## Reopening Addendum — Two-Worker Recurrence At `d532faaac`

The checked Scope 1 through Scope 3 rows remain a historical record of what their recorded
runs established. They are not rewritten or unchecked. The later evidence under
`report.md` `Current-Revision Stabilization At d532faaac` supersedes only the inference that
three clean runs at two workers eliminated the recurrence. The exact BUG-022 C03 portfolio
workload failed at two workers in two of two current-revision runs after all 94 tests passed.
Scope 4 is therefore the active closure scope. Its unchecked Definition of Done controls any
new claim that BUG-017 is remediated for the blocked BUG-022 consumer.

## Execution Outline — Reopened Work

### Phase Order

1. **Scope 4 candidate evaluation.** Preserve the Foundation lifecycle candidate's successful
  and failed runs, then reject it after current finalization fails twice.
2. **Scope 4 fallback selection.** Hash-verify candidate rollback, set the repository default
  to one worker, and run the unchanged BUG-022 C03 command twice.

### New Types And Signatures

- No product type, schema, route, or public API changes.
- Planned local extension in `tests/portfolio-survival-foundation.spec.mjs`:
  `const test = baseTest.extend({ foundationBrowserBoundary: [fixture, { auto: true,
  scope: 'worker' }] })`.
- Planned worker owner: `let foundationBrowser`, assigned from Playwright's existing `browser`
  fixture by `foundationBrowserBoundary` without an explicit parameter at each test site.
- Planned lifecycle signature: Foundation's existing `afterAll` closes that owned browser
  before Playwright begins worker teardown.
- Planned persistent canary title: `Regression: SCN-BUG017-09 Foundation-to-Paths releases
  its worker within 15 seconds`.

### Validation Checkpoints

1. The persistent Foundation-to-Paths child-process canary must report 27/27 passing and exit
  within 15 seconds of worker stop before the complete workload may run.
2. The exact BUG-022 C03 94-test command must pass at workers=2 with exit 0 and no force-kill
  marker before the lifecycle candidate can be retained.
3. A workers=1 configuration may be evaluated only after checkpoint 2 fails and the lifecycle
  candidate is rolled back; it must pass the same exact C03 command.
4. Packet planning lint and traceability checks gate handoff. Runtime implementation and test
  evidence remain unchecked until executed by the next owner.

## Execution Inventory

| Scope | Outcome | Surfaces | Primary validation | Status |
| --- | --- | --- | --- | --- |
| 1 | Characterise the original stall | Diagnostics | Worker sweep and candidate discrimination | Done |
| 2 | Apply the original exposure remedy | Runner config | Complete lifetime-tax workload | Done (historical) |
| 3 | Disclose the remaining override risk | Config and command registry | Disclosure and workload regressions | Done (historical) |
| 4 | Resolve the current two-worker recurrence | Rejected Foundation lifecycle candidate; selected one-worker config fallback | Candidate history, rollback hashes, then two exact 94-test BUG-022 C03 runs | In Progress |

## Sequencing Note

Scope 1 characterises the defect well enough to choose a remedy; it is diagnostic and lands no
behaviour change. Scope 2 applies whatever Scope 1 selects. Scope 3 is a disclosure fallback
that is only correct if Scope 1 concludes the cause is unremovable here. Those three scopes are
preserved as the original execution sequence. Scope 4 follows them additively and is the only
active scope after the current-revision two-worker recurrence.

## Scope 1: Characterise The Stall Well Enough To Choose

**Status:** Done

### Consumer Surface

The operator surface is the Playwright CLI command whose exit code and teardown diagnostics
must truthfully describe the completed browser workload.

### Problem This Scope Resolves

The boundary in `design.md` establishes that the browser channel is the variable and that the
stall scales with concurrency and occurs at release rather than during execution. It does not
establish a mechanism, a frequency, or a threshold. Four candidate mechanisms remain
undistinguished, and one occurrence in two runs is not a rate. Choosing a remedy on that basis
would be choosing on a guess.

### Gherkin Scenarios

```gherkin
Feature: The stall is characterised before a remedy is chosen
# SCN-BUG017-01
  Scenario: A frequency is established
    Given repeated identical runs under the system-chrome project at six workers
    When the runs complete
    Then the proportion exhibiting a force-killed worker is recorded
    And the record states the number of runs it is based on

# SCN-BUG017-02
  Scenario: A concurrency threshold is probed
    Given runs at increasing worker counts
    When each completes
    Then the lowest worker count at which the stall was observed is recorded
    And a count at which it was not observed is recorded as not-observed rather than as safe

# SCN-BUG017-03
  Scenario: The cheap candidates are discriminated
    Given the profile-contention and version-pair candidates
    When each is tested
    Then each is recorded as supported, contradicted, or untested
    And no candidate is recorded as the cause without evidence that distinguishes it
```

### Implementation Plan

1. Run the same set repeatedly under `system-chrome` at six workers; record every exit code.
2. Repeat at lower worker counts to probe where the stall stops being observed.
3. Test the two cheap candidates from `design.md`.
4. Record which candidates are supported, contradicted, or untested.
5. Select a remedy option, or record that diagnosis should continue.

### Implementation Files

- `playwright.config.mjs` is the repository-owned system-Chrome project and worker-count surface.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` are concrete members of the measured lifetime-tax E2E workload.
- Playwright's runner and the operator-installed Chrome are causal evidence only; neither is a repository implementation path.

### Test Plan

| Type | Coverage |
|---|---|
| Repeated execution | Identical runs under `system-chrome`, exit code recorded for each. |
| Concurrency sweep | `SCN-BUG017-02 A concurrency threshold is probed` by running concrete workload carriers `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` at varying worker counts and recording stall presence per count. |
| Process sampling | Browser process count before and after each run. |
| Functional regression | `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence`, run with `node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs`. It parses the candidate table in this packet's `report.md`; requires candidates 3 and 4, an allowed supported/contradicted/untested verdict, and candidate-specific distinguishing evidence; and rejects a causal verdict. This complements rather than replaces the unchanged process-level workload. |
| E2E | Scenario-specific process-level E2E characterization for SCN-BUG017-01 through SCN-BUG017-03 runs the 22-file lifetime-tax system-Chrome suite; concrete workload tests include `tests/lifetime-tax-combined.spec.mjs` test `Regression: SCN-022-013 the combined total is the sum of two independent settlements` and `tests/lifetime-tax-read-bound.spec.mjs` test `Regression: SCN-021-01 a declared pack whose origin never responds reaches a terminal display state within the declared bound and names the document`. |
| Regression E2E | `e2e-ui` characterization for SCN-BUG017-01 through SCN-BUG017-03 executes the complete 22-file lifetime-tax system-Chrome workload across the declared worker-count sweep and preserves each named browser regression. |

#### SCN-BUG017-03 Discriminating RED Mutations

Both probes use the same named test and `scripts/red-green-probe.sh`, which restores and
hash-verifies the tracked target before running the unchanged GREEN command.

1. Causal-label rejection:

  ```bash
  scripts/red-green-probe.sh --file specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md --find '| 3 | Profile or lock contention | **Contradicted as profile contention** |' --replace '| 3 | Profile or lock contention | **Cause** |' --label 'SCN-BUG017-03 causal verdict is rejected' --bound 120 -- node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs
  ```

  Expected RED: the Node test exits non-zero with
  `SCN-BUG017-03: candidate 3 uses a forbidden causal verdict`.

1. Untested-rationale rejection:

  ```bash
  scripts/red-green-probe.sh --file specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md --find 'only one Chrome build was available, so nothing is discriminated.' --replace 'the candidate was reviewed.' --label 'SCN-BUG017-03 untested candidate requires a discriminating rationale' --bound 120 -- node --test --test-name-pattern='^Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence$' tests/playwright-runtime.foundation.functional.mjs
  ```

  Expected RED: the Node test exits non-zero with
  `SCN-BUG017-03: candidate 4 lacks the single-build untested rationale`.

### Definition of Done

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass for SCN-BUG017-01 through SCN-BUG017-03. **Claim Source:** executed. → Evidence: [BUG-017 report](report.md), specifically `Frequency at the filed configuration`, `Worker sweep`, and `Candidate mechanisms`, records every browser assertion passing while characterising the process-level outcome; the scenario manifest preserves the exact linked tests.
- [x] Broader E2E regression suite passes for the complete 22-file lifetime-tax system-Chrome workload at the selected two-worker configuration. **Claim Source:** executed. → Evidence: [BUG-017 report](report.md), `Scope 2 Execution — Remedy Applied`, records three consecutive complete 94-test workloads at two workers, all exit 0 with zero force-kills.
- [x] A frequency is established: the proportion of identical six-worker system-Chrome runs exhibiting a force-killed worker is recorded with the number of runs and raw output for each, using the scenario-specific E2E workload for SCN-BUG017-01.
  → Evidence: `report.md` `## Scope 1 Execution — Characterisation` records the 22-file lifetime-tax workload, every exit, force-kill count, and sample size; every page test passed in each recorded workload run.
- [x] A concurrency threshold is probed: the lowest worker count at which the stall was observed is recorded.
  → Evidence: [Worker sweep](report.md#worker-sweep--the-stall-was-observed-at-four-not-observed-at-two).
- [x] The same threshold probe records a worker count at which the stall was not observed as not-observed, never as safe.
  → Evidence: [Worker sweep](report.md#worker-sweep--the-stall-was-observed-at-four-not-observed-at-two).
- [x] The cheap candidates are discriminated: each profile-contention and version-pair candidate is marked supported, contradicted, or untested.
  → Evidence: [Candidate mechanisms](report.md#candidate-mechanisms).
- [x] No candidate is named as the cause without evidence distinguishing it from the others.
  → Evidence: [Candidate mechanisms](report.md#candidate-mechanisms).
- [x] `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence` passes against the committed candidate table; both planned self-reverting RED probes discriminate; each RED emits its specified SCN-BUG017-03 assertion message; and all five pre-existing runtime-foundation tests remain byte-unchanged and green. **Claim Source:** executed. → Evidence: [exact scenario tests](report.md#exact-scenario-tests) records the exact test at exit 0, both specified RED assertions, both GREEN exits, hash restoration, the byte-identity diff, and the complete file at 14/14.
- [x] A remedy option is selected, and the broader lifetime-tax E2E regression suite passes at its two-worker system-Chrome configuration.
  → Evidence: `report.md` `### Decision` records the selected option; `report.md` `### The pair, re-derived` records `A2 proj=system-chrome exit=0 wall=76s forcekills=0 failmarks=0 | 111 passed (1.3m) | using 2 workers`.
- [x] Raw output evidence is recorded inline for each item above.
  → Evidence: [Six-worker frequency output](report.md#frequency-at-the-filed-configuration--six-workers-eight-runs-six-stalls).

## Scope 2: Apply The Selected Remedy

**Status:** Done
**Depends on:** Scope 1

### Consumer Surface

The CLI command used by developers to run `system-chrome` is the consumer: a passing workload
must return exit 0 without a surviving browser worker.

### Problem This Scope Resolves

A green suite exits 1, intermittently, and local verification is more than four times slower
than the bundled project on every run.

### Gherkin Scenarios

```gherkin
Feature: A passing run reports success
# SCN-BUG017-04
  Scenario: Repeated runs exit zero
    Given the selected remedy is applied
    When the ninety-four-test set runs repeatedly at the chosen worker count
    Then every run exits zero
    And no run reports a worker that did not exit within its teardown budget

# SCN-BUG017-05
  Scenario: Browser processes are released
    Given a run has completed
    When the browser process count is sampled
    Then it has returned to its pre-run level

# SCN-BUG017-06
  Scenario: The cost is proportionate
    Given the selected remedy is applied
    When the same set runs under both projects
    Then the wall-time ratio meets the bound recorded under FR-017-004
```

### Implementation Plan

1. Apply the option selected in Scope 1.
2. Run the set repeatedly and record every exit code.
3. Sample browser process count either side of each run.
4. Measure the wall-time ratio against the bundled project.

### Implementation Files

- `playwright.config.mjs` owns the selected `workers: 2` exposure bound and the `system-chrome` project.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` are concrete tests in the unchanged 22-file remedy workload.
- `tests/playwright-runtime.foundation.functional.mjs` is the existing repository config/runtime canary.

### Test Plan

| Type | Coverage |
|---|---|
| Repeated execution | Consecutive runs at the chosen worker count all exit 0. |
| Process sampling | `SCN-BUG017-05 Browser processes are released` around concrete workload carriers `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs`; process count returns to its pre-run level. |
| Timing | Wall-time ratio against the bundled project meets the recorded bound. |
| Selftest | `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline. |
| E2E | Scenario-specific process-level E2E verification for SCN-BUG017-04 through SCN-BUG017-06 runs the 22-file lifetime-tax system-Chrome suite at the configured worker count; concrete workload tests include `tests/lifetime-tax-combined.spec.mjs` test `Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction` and `tests/lifetime-tax-read-bound.spec.mjs` test `Regression: SCN-021-05 the refusing side of the bound is pinned: a withheld pack is abandoned by name rather than waited on`. |
| Regression E2E | `e2e-ui` verification for SCN-BUG017-04 through SCN-BUG017-06 executes the complete 22-file lifetime-tax system-Chrome workload at the configured two-worker bound, including process release and wall-time assertions. |

### Definition of Done

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass for SCN-BUG017-04 through SCN-BUG017-06. **Claim Source:** executed. → Evidence: [BUG-017 report](report.md), `Scope 2 Execution — Remedy Applied`, records three consecutive scenario workloads with 94 passes, exit 0, no force-kill, restored process counts, and the configured worker setting; the scenario manifest preserves the exact linked tests.
- [x] Broader E2E regression suite passes for the complete 22-file lifetime-tax system-Chrome workload at the selected two-worker configuration. **Claim Source:** executed. → Evidence: [BUG-017 report](report.md), `Scope 2 Execution — Remedy Applied`, records the complete workload passing on every configured run.
- [x] Repeated runs exit zero: consecutive scenario-specific system-Chrome E2E workloads for SCN-BUG017-04 through SCN-BUG017-06 at the chosen worker count all exit 0, with raw output for each.
  → Evidence: `report.md` `## Scope 2 Execution — Remedy Applied` records three consecutive 94-test runs, all tests passing, exit 0, and zero force-kills.
- [x] No run reports `worker-N process did not exit within`.
  → Evidence: [Scope 2 remedy runs](report.md#scope-2-execution--remedy-applied).
- [x] Browser processes are released: the browser process count returns to its pre-run level after each run.
  → Evidence: [Scope 2 remedy runs](report.md#scope-2-execution--remedy-applied).
- [x] The cost is proportionate: the wall-time ratio meets the bound recorded under FR-017-004.
  → Evidence: [FR-017-004 bound](report.md#the-fr-017-004-bound).
- [x] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
  → Evidence: [Scope 2 unchanged suite](report.md#the-suite-is-unchanged).
- [x] No test was modified to accommodate the remedy, and the broader lifetime-tax E2E regression suite passes under the repository-owned `playwright.config.mjs` worker setting.
  → Evidence: `report.md` `### The suite is unchanged` records the test diff; `report.md` `### The pair, re-derived` records all 111 tests passing at two workers with exit 0 and zero force-kills.
- [x] Raw output evidence is recorded inline for each item above.
  → Evidence: [Scope 2 remedy runs](report.md#scope-2-execution--remedy-applied).

## Scope 3: Disclose It Where A Developer Meets It

**Status:** Done
**Disposition:** correct only if Scope 1 concludes the cause is not removable here

### Consumer Surface

The operator surface is the Playwright CLI guidance in `playwright.config.mjs` and the command
registry read by a developer before invoking the browser suite.

### Problem This Scope Resolves

If the cause is upstream, the intermittent exit 1 remains. The confusion it causes does not
have to.

### Gherkin Scenarios

```gherkin
Feature: An unremovable defect is disclosed rather than rediscovered
# SCN-BUG017-07
  Scenario: A developer meets the symptom
    Given a run reporting all tests passed and exiting non-zero
    When the developer looks for an explanation where they work
    Then the condition, its platform, and its intermittence are described

# SCN-BUG017-08
  Scenario: Disclosure does not stand in for an available fix
    Given Scope 1 concluded a remedy is available in this repository
    When the disposition of this scope is reviewed
    Then this scope is declined rather than taken
```

### Implementation Plan

1. Confirm Scope 1 concluded the cause is not removable here.
2. Describe the condition, its platform, its intermittence, and its measured cost, where a
   developer running the suite will meet it.

### Implementation Files

- `playwright.config.mjs` owns both the worker bound and the adjacent developer disclosure.

### Consumer Proof Files

- `.specify/memory/agents.md` is the command-registry disclosure surface reached before the suite runs.
- `tests/playwright-runtime.foundation.functional.mjs` is the existing repository config/runtime canary.
- `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` remain concrete members of the disclosed system-Chrome workload.

### Test Plan

| Type | Coverage |
|---|---|
| Review | The disclosure states platform, project, symptom, intermittence, and measured cost. |
| Adversarial | The disclosure is not accepted while Scope 1 records an available remedy. |
| Functional regression | `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence`, run with `node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs`. It asserts independently on `playwright.config.mjs` and `.specify/memory/agents.md` that each disclosure names macOS, `system-chrome`, the 300000ms force-kill symptom with a green suite exiting non-zero, the 6/8, 1/3, and 0/3 intermittence record, and the 343s-versus-81s cost on 111 tests. It also asserts that the config disclosure is adjacent to `workers: 2` and the registry disclosure precedes the first Playwright run command. |
| Adversarial regression | `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin`, run with `node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs`. It requires the conjunction of the full disclosure and resolved `playwrightConfig.workers === 2`; disclosure alone cannot pass. |
| E2E | Scenario-specific E2E workload verification for SCN-BUG017-07 and SCN-BUG017-08 runs the same 22-file lifetime-tax system-Chrome suite after the `playwright.config.mjs` exposure remedy; concrete tests include `tests/lifetime-tax-combined.spec.mjs` test `Regression: SCN-022-013 the combined total is the sum of two independent settlements` and `tests/lifetime-tax-read-bound.spec.mjs` test `Regression: SCN-021-04 the tolerated side of the bound is pinned: a pack delayed below the bound is served rather than aborted`. |
| Regression E2E | `e2e-ui` verification for SCN-BUG017-07 and SCN-BUG017-08 executes the complete 22-file lifetime-tax system-Chrome workload after the worker-bound remedy and developer disclosure. |

#### SCN-BUG017-07 And SCN-BUG017-08 Discriminating RED Mutations

1. Disclosure-content rejection for SCN-BUG017-07:

  ```bash
  scripts/red-green-probe.sh --file playwright.config.mjs --find 'and on macOS a `system-chrome` run' --replace 'and a `system-chrome` run' --label 'SCN-BUG017-07 config disclosure requires the platform' --bound 120 -- node --test --test-name-pattern='^Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence$' tests/playwright-runtime.foundation.functional.mjs
  ```

  Expected RED: the Node test exits non-zero with
  `SCN-BUG017-07: playwright.config.mjs disclosure is missing platform macOS`, even though
  the worker pin and the second disclosure site remain intact.

1. Remedy-before-disclosure rejection for SCN-BUG017-08:

  ```bash
  scripts/red-green-probe.sh --file playwright.config.mjs --find '  workers: 2,' --replace '  workers: 6,' --label 'SCN-BUG017-08 disclosure cannot replace the two-worker pin' --bound 120 -- node --test --test-name-pattern='^Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin$' tests/playwright-runtime.foundation.functional.mjs
  ```

  Expected RED: the Node test exits non-zero with
  `SCN-BUG017-08: disclosure is present but the system-chrome worker pin is not 2`.

### Definition of Done

Taken. The earlier round declined this scope on its adversarial scenario and left these items
unticked; that declination is superseded. The scenario forbids a notice filed **instead of** an
available fix, and the fix was filed — `workers: 2` is committed and is what the default path
runs, so a disclosure added afterwards does not stand in for it. The first item below presupposes
the opposite condition to the scenario's `Given`, and the discriminator the declination itself
conceded in writing is that a remedy for the **exposure** was available and taken while the
**cause** is not removable here. Full reversal reasoning and evidence:
`report.md` `## Scope 3 Execution — Disclosure Written`.

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass for SCN-BUG017-07 and SCN-BUG017-08. **Claim Source:** executed. → Evidence: [remedy-commit workload](report.md#the-condition-is-still-reachable-at-the-remedy-commit) records the disclosure-state configuration with all 111 browser tests passing; the scenario manifest preserves the functional disclosure canary and named lifetime-tax consumer links.
- [x] Broader E2E regression suite passes for the complete 22-file lifetime-tax system-Chrome workload at the selected two-worker configuration. **Claim Source:** executed. → Evidence: [remedy-commit workload](report.md#the-condition-is-still-reachable-at-the-remedy-commit) records run A at two workers with `111 passed`, exit 0, and zero force-kills.
- [x] Scope 1 recorded that the cause is not removable in this repository, and disclosure does not stand in for the available fix because `workers: 2` is applied before the notice describes the remaining explicit override.
  → Evidence: `report.md` `## Scope 1 Addendum — The Cause Is Not Removable In This Repository` records the causal boundary; `report.md` `### Why the declination above is superseded` records that the exposure remedy was filed first. The repository implementation is `playwright.config.mjs`; vendor-runner and installed-Chrome observations are causal evidence only.
- [x] A developer meets the symptom disclosure where the suite is run: it names the platform, the project, the symptom, and its intermittence, and the scenario-specific system-Chrome E2E workload for SCN-BUG017-07 and SCN-BUG017-08 passes under that default configuration.
  → Evidence: the comment beside `workers: 2` in `playwright.config.mjs` names macOS, the `system-chrome` project, the symptom (`worker-N process did not exit within 300000ms after stop, force-killed it`, exit 1 with every test passed), and quantifies "intermittently" as 6/8 runs stalling at six workers, 1/3 at four, 0/3 at two. `.specify/memory/agents.md` `### Playwright E2E` carries the same four. `git diff -U0 -- playwright.config.mjs` shows comment lines only.
- [x] The disclosure carries the measured wall-time cost.
  → Evidence: **343s against 81s on the identical 111 tests**, measured in this execution — run C (`--workers=6`, exit 1, 4 force-kills, `111 passed (5.7m)`) against run A (configured 2 workers, exit 0, `111 passed (1.3m)`), raw lines under `report.md` `### The condition is still reachable at the remedy commit`. Both figures appear in both disclosure sites.
- [x] The disclosure is reachable from where a developer runs the suite, and the broader lifetime-tax E2E regression suite passes after the remedy and disclosure.
  → Evidence: **18 of 18** documented invocations name `--config=playwright.config.mjs`; **0** do not. `report.md` `### The pair, re-derived` records the complete 22-file, 111-test system-Chrome workload passing at two workers, exit 0, with zero force-kills.
- [x] `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence` passes only when both developer-facing sites carry every required disclosure field and placement; its planned platform-removal RED probe discriminates with the specified SCN-BUG017-07 assertion message; and the five pre-existing runtime-foundation tests remain byte-unchanged and green. **Claim Source:** executed. → Evidence: [exact scenario tests](report.md#exact-scenario-tests) records the exact test at exit 0, the specified RED assertion, GREEN exit, hash restoration, the byte-identity diff, and the complete file at 14/14.
- [x] `tests/playwright-runtime.foundation.functional.mjs` test `Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin` passes only when the full disclosure and resolved two-worker pin coexist; its planned two-to-six RED probe leaves disclosure intact, discriminates with the specified SCN-BUG017-08 assertion message, and hash-verifies restoration before GREEN. **Claim Source:** executed. → Evidence: [current-main SCN-BUG017-08 evidence](report.md#current-main-scn-bug017-08-evidence).

## Scope 4: Close The Foundation Browser Before Worker Teardown

**Status:** In Progress
**Depends On:** Scope 3

### Fallback Selection Addendum

The lifecycle candidate passed one strict canary and one exact complete run. Finalization then
failed the complete runtime-foundation file and the exact named canary. A second current canary
failed at the same committed bytes. These failures reject the candidate as a stable final route.

Commit `047292eb2` reverses the lifecycle-test commit. Commit `af119275a` reverses the lifecycle
implementation. The Foundation and runtime-functional files then matched baseline blobs
`bc66800e...` and `0d319b8b...`. Shared runtime and Paths remained unchanged.

The selected fallback pins one worker. Two unchanged BUG-022 C03 commands resolved one worker,
passed 94 tests, exited zero, emitted no force-kill or ignored-lifecycle marker, and left zero
owned residue. The packet remains in progress pending current guard recording and downstream
validation. No acceptance or certification state changes in this scope.

### Consumer Surface

The blocked consumer is the exact BUG-022 C03 Playwright CLI command over the eight
`tests/portfolio-survival-*.spec.mjs` files. Its all-passing workload must return exit 0.

### Problem This Scope Resolves

The exact BUG-022 C03 portfolio workload now reproduces at the repository's configured two
workers: two of two runs completed all 94 tests and still exited 1, with three force-killed
workers across the pair. The failures occurred at measured host loads 32.14 and 8.90, so load
is neither necessary nor sufficient for the recurrence. A debug run completed every Playwright
teardown stage but left one worker alive until the 300000ms force-kill boundary.

The Foundation worker retained two anonymous Socket handles after Chrome exited. Foundation
alone can reproduce after the cumulative sequence through SCN-008-042, while the individual
row alone does not. The focused lifecycle candidate did not remain green during finalization.
This scope therefore selects the planned rollback-gated one-worker fallback.

### Additive Supersession Rule

The historical `0/3 at two workers` result remains a valid observation about those three runs.
It no longer supports an elimination, safety, or closure claim. SCN-BUG017-09 through
SCN-BUG017-11 and the unchecked rows below are the controlling current-revision contract.

### Gherkin Scenarios

```gherkin
Feature: Foundation releases its browser before the worker is asked to stop
# SCN-BUG017-09
  Scenario: The focused lifecycle boundary survives the strict canary
    Given the system-chrome project is configured with two workers on macOS
    And Foundation receives an automatic worker-scoped boundary fixture
    And Foundation closes its owned browser in its existing afterAll
    When the cumulative Foundation-to-Paths canary runs in a child process
    Then all 27 tests pass
    And the child exits zero within 15 seconds of worker stop
    And no worker force-kill or ignored teardown error is reported

# SCN-BUG017-10
  Scenario: The lifecycle candidate clears the blocked complete workload
    Given SCN-BUG017-09 has passed without an ignored lifecycle error
    When the exact BUG-022 C03 94-test portfolio command runs at two workers
    Then all 94 tests pass and the command exits zero
    And no worker remains until the 300000ms force-kill boundary
    And no Chrome process started by the workload remains after exit

# SCN-BUG017-11
  Scenario: One worker is used only after the lifecycle candidate fails
    Given the lifecycle candidate has failed a required current acceptance run
    And the candidate changes have been hash-verified as rolled back
    When the repository worker setting is changed from two to one
    Then the exact BUG-022 C03 command is rerun without changing browser project
    And closure requires 94 passing tests, exit zero, and no ignored force-kill error
```

### Implementation Plan

1. Keep `system-chrome` as the exercised project and keep `workers: 2` while evaluating the
   lifecycle candidate.
2. In `tests/portfolio-survival-foundation.spec.mjs`, import the existing Playwright test as
  `baseTest`, define a local `test = baseTest.extend(...)`, and use the automatic worker-scoped
  `foundationBrowserBoundary` fixture to retain the existing `browser` owner in
  `foundationBrowser`. Do not add a required fixture parameter to each Foundation test and do
  not change `tests/playwright-runtime.mjs`.
3. Add `if (foundationBrowser) await foundationBrowser.close();` to Foundation's existing
  `afterAll`, before its existing server close and before Playwright worker teardown. A bare
  `browser.close()` call outside the owning hook and a worker-fixture teardown that closes
  after Foundation's hook are rejected implementation shapes.
4. Add the persistent SCN-BUG017-09 child-process canary. Start its 15-second stop bound when
   Playwright asks the worker to stop, not when the browser workload starts. Require the real
   27-test Foundation-to-Paths sequence, exit 0, and absence of force-kill markers.
5. Run the complete exact BUG-022 C03 command once the canary passes. Retain the candidate at
   two workers only if all 94 tests pass, the command exits 0, process counts return to their
   pre-run baseline, and no force-kill or ignored teardown error appears.
6. If a required current candidate acceptance run fails a lifecycle criterion, preserve the
  failure evidence. Roll back the lifecycle candidate before selecting one worker.
7. Do not suppress, catch-and-ignore, relabel, or filter the worker force-kill error. Do not
   switch the browser project to bundled Chromium. Do not raise the 300000ms teardown budget.
8. Run the unchanged C03 command twice through the config default. Require one worker, 94
  passes, exit zero, no force-kill marker, and zero owned residue in each run.

### Implementation Files

- `tests/portfolio-survival-foundation.spec.mjs` — restored to its pre-candidate baseline.
- `tests/playwright-runtime.foundation.functional.mjs` — fallback pin and containment
  regression after candidate-test rollback.
- `playwright.config.mjs` — selected one-worker fallback after hash-verified rollback.

### Change Boundary

**Allowed implementation families:**

- `tests/portfolio-survival-foundation.spec.mjs` for the local automatic worker fixture,
  `foundationBrowser` owner, and existing `afterAll` close.
- `tests/playwright-runtime.foundation.functional.mjs` for the persistent lifecycle-shape and
  child-stop regression.
- `playwright.config.mjs` only on the conditional workers=1 branch after the complete
  two-worker lifecycle run fails.

**Excluded surfaces:**

- Portfolio assertions, scenario data, application source, generated site output, and
  BUG-022 declaration behavior.
- `tests/portfolio-survival-paths.spec.mjs`, which is the read-only canary terminus, and shared
  helpers including `tests/playwright-runtime.mjs` and `tests/portfolio-survival.support.mjs`.
- Browser-project selection, Chrome channel configuration, the 300000ms runner teardown
  budget, reporter behavior, and error handling that could hide a force-kill.
- BUG-017 historical evidence, checked historical DoD rows, state, certification,
  uservalidation, acceptance, and tool logs.

### Rollback

- Before the complete C03 run, record the exact candidate diff and baseline hashes for every
  allowed implementation file.
- If the candidate fails SCN-BUG017-10, restore only those candidate hunks and verify their
  hashes before changing `workers: 2` to `workers: 1`.
- If the candidate passes, rollback proof is a self-reverting mutation that removes the
  Foundation-owned close and makes the strict canary fail on its lifecycle assertion, followed
  by hash restoration and a green canary.
- No rollback may alter tests outside the declared boundary or any historical packet evidence.

### Test Plan

| ID | Type | Scenario | File / exact title | Command | Required result |
| --- | --- | --- | --- | --- | --- |
| TP-BUG017-04-01 | E2E UI regression | SCN-BUG017-09 | `tests/playwright-runtime.foundation.functional.mjs` — `Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds` | `node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs` | The test spawns `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-paths.spec.mjs --config=playwright.config.mjs --project=system-chrome --workers=2 --reporter=list`; the real child reports 27/27 passing and exit 0 within 15 seconds of worker stop, with zero force-kill or ignored-error markers. |
| TP-BUG017-04-02 | Adversarial regression | SCN-BUG017-09 | Same named canary | `scripts/red-green-probe.sh --file tests/portfolio-survival-foundation.spec.mjs --find '  if (foundationBrowser) await foundationBrowser.close();' --replace '  void foundationBrowser;' --label 'SCN-BUG017-09 Foundation-owned close is required' --bound 300 -- node --test --test-name-pattern='^Regression: SCN-BUG017-09 Foundation-to-Paths releases its worker within 15 seconds$' tests/playwright-runtime.foundation.functional.mjs` | RED must fail on the 15-second child-stop/lifecycle assertion, restore the Foundation file hash, and GREEN must pass. |
| TP-BUG017-04-03 | Regression E2E | SCN-BUG017-10 | `tests/portfolio-survival-foundation.spec.mjs` plus the other seven concrete portfolio specs named in the scenario manifest | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Resolved worker count is 2; 94/94 pass; exit 0; no `worker-N process did not exit within 300000ms after stop, force-killed it`; owned Chrome and worker process counts return to baseline. |
| TP-BUG017-04-04 | Conditional Regression E2E | SCN-BUG017-11 | `tests/portfolio-survival-foundation.spec.mjs` plus the same seven concrete portfolio specs | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Candidate rollback is hash-verified; both config-default runs resolve 1 worker; 94/94 pass; exit 0; no force-kill, ignored-error, or owned-residue marker. |
| TP-BUG017-04-05 | Functional regression | SCN-BUG017-11 | `tests/playwright-runtime.foundation.functional.mjs` — `Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity` | `node --test --test-name-pattern='^Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$' tests/playwright-runtime.foundation.functional.mjs` | The config resolves one worker and retains `system-chrome`; the 300000ms budget and force-kill disclosure remain; the rejected Foundation lifecycle seam remains absent. |

The six-full-run diagnostic cap recorded by the current-revision stabilization round is
exhausted. TP-BUG017-04-03 is the next implementation validation after the bounded canary, not
another exploratory rerun. Do not spend another complete run before applying the candidate.

### Definition of Done

- [x] Scenario-specific evidence records every Scope 4 branch outcome. The lifecycle candidate's green and red canaries remain preserved. The selected SCN-BUG017-11 fallback functional test and two complete C03 runs pass. **Phase:** implement. **Claim Source:** executed. → Evidence: [Scope 4 finalization validation](report.md#scope-4-finalization-validation-candidate-rejected) and [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification).
- [x] Broader E2E regression suite passes for the complete eight-file, 94-test BUG-022 C03 portfolio workload under the selected system-Chrome worker configuration. **Phase:** implement. **Claim Source:** executed. → Evidence: [Exact BUG-022 C03 at workers two](report.md#exact-bug-022-c03-at-workers-two).
- [x] The additive supersession is respected: no current closure claim relies on the historical `0/3 at two workers` observation, and no historical evidence or checked row is rewritten. **Phase:** implement. **Claim Source:** executed. → Evidence: [Additive supersession integrity](report.md#additive-supersession-integrity).
- [x] The lifecycle candidate used automatic worker-scoped ownership during evaluation. The final tree removes that candidate through explicit reverts and retains neither rejected close shape. **Phase:** implement. **Claim Source:** executed. → Evidence: [Lifecycle containment regression](report.md#lifecycle-containment-regression) and [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification).
- [ ] TP-BUG017-04-01 passes the real cumulative Foundation-to-Paths canary at 27/27 with workers=2, child exit 0 within the strict 15-second worker-stop bound, and zero force-kill or ignored teardown errors. **Phase:** implement. **Claim Source:** executed. The prior green capture is preserved, but two current finalization attempts failed this lifecycle criterion at the same committed candidate bytes. → Evidence: [Persistent strict canary GREEN](report.md#persistent-strict-canary-green) and [Scope 4 finalization validation](report.md#scope-4-finalization-validation-candidate-rejected).
- [x] TP-BUG017-04-02 proves the canary is discriminating: removing only the Foundation-owned close produces the planned lifecycle RED, then exact hash restoration returns the canary to GREEN. **Phase:** implement. **Claim Source:** executed. → Evidence: [Close-removal discriminator and exact restoration](report.md#close-removal-discriminator-and-exact-restoration).
- [x] TP-BUG017-04-03 runs the complete exact BUG-022 C03 94-test command at workers=2 and records 94/94 passing, exit 0, no 300000ms force-kill marker, and restored owned process counts. **Phase:** implement. **Claim Source:** executed. → Evidence: [Exact BUG-022 C03 at workers two](report.md#exact-bug-022-c03-at-workers-two) and [selected route and process release](report.md#selected-route-and-process-release).
- [x] The earlier TP-BUG017-04-03 pass retained the candidate provisionally. Two later strict-canary failures supersede that provisional route without erasing its evidence. **Phase:** implement. **Claim Source:** executed. → Evidence: [Exact BUG-022 C03 at workers two](report.md#exact-bug-022-c03-at-workers-two) and [Scope 4 finalization validation](report.md#scope-4-finalization-validation-candidate-rejected).
- [x] Candidate rollback is hash-verified before workers=1 is selected. TP-BUG017-04-04 then passes the unchanged exact 94-test command twice through the config default. **Phase:** implement. **Claim Source:** executed. → Evidence: [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification).
- [x] No force-kill error is ignored, caught as success, filtered from evidence, or relabelled; no browser-project switch or teardown-budget increase is present. **Phase:** implement. **Claim Source:** executed. → Evidence: [Lifecycle containment regression](report.md#lifecycle-containment-regression).
- [x] The implementation diff contains only the declared allowed file families, with zero changes to excluded surfaces and zero sensitive or machine-local leakage. **Phase:** implement. **Claim Source:** executed. → Evidence: [Candidate boundary and state integrity](report.md#candidate-boundary-and-state-integrity) and [Synchronized packet guards](report.md#synchronized-packet-guards).
- [x] Rollback is proven by explicit inverse commits and exact baseline blob identities. Foundation, shared runtime, and Paths remain at pre-candidate bytes. Historical packet evidence remains reachable. **Phase:** implement. **Claim Source:** executed. → Evidence: [Scope 4 fallback selection](report.md#scope-4-fallback-selection-and-verification).
- [x] Packet artifact lint, planning traceability checks, and the repository baseline selftest pass after planning and implementation artifacts are synchronized. **Phase:** implement. **Claim Source:** executed. → Evidence: [Synchronized packet guards](report.md#synchronized-packet-guards).

The remaining unchecked strict-canary row records the rejected candidate's unstable finalization.
It must not be converted into a pass. The selected fallback is proven by TP-BUG017-04-04 and
TP-BUG017-04-05 while packet status remains in progress.

### Uncertainty Declaration — Scope 4

**Attempted:** This planning pass reconciled the current-revision recurrence into an explicit
implementation boundary, three scenarios, five exact test rows, a conditional decision rule,
and rollback requirements. It did not implement or execute the lifecycle candidate.

**Observed:** The current-session repository files establish the existing Foundation and Paths
lifecycle hooks, the two-worker config, and the exact BUG-022 C03 command. The operator-supplied
stabilization measurements are diagnostic input and are not claimed as execution by this
planning pass.

**Would resolve:** The next execution owner must produce the planned adversarial RED and GREEN
canary, then run TP-BUG017-04-03. Only its actual result selects either the retained two-worker
lifecycle remedy or the rollback-first one-worker branch. Every DoD row remains unchecked until
its own command-backed evidence exists.

## Cross-Scope Definition of Done

The checked rows below are preserved historical closure records. They do not satisfy or waive
any unchecked Scope 4 row, and they do not authorize BUG-022 to consume the old two-worker
closure claim.

- [x] `bug.md` status is updated from Confirmed to Fixed and then Verified.
  → Evidence: `bug.md` now reads `Verified`. The earlier round left this half-open for one stated
    reason — the `343s` leg of the cost comparison had never been re-derived by a party other than
    the one that measured it, and `## Independent Verification Round` was constrained to
    `--project=chromium` so it could only reproduce run B. That constraint was self-imposed and is
    lifted. `## Independent Re-Derivation Round — The Controlled Pair At N=2` re-runs both legs on
    `system-chrome` by a party that wrote neither the pin (`13494be66`) nor the disclosure
    (`2d79740e1`): **2 workers → exit 0, 76s, 0 force-kills** against the recorded 81s; **6 workers
    → exit 1, 366s, 4 force-kills** against the recorded 343s, within 7%. All 111 tests passed in
    both, `✘` count 0, so the non-zero exit is teardown and not an assertion.
    **Sample size relied on, stated plainly: N=2 per configuration** — one recorded, one
    independently re-derived — sitting on top of the fourteen-run worker sweep already in
    `report.md`. The intermittency objection does not apply to this closure: it was raised against a
    single *clean* re-run, which could not falsify a 6/8 rate. The re-run was not clean. It stalled,
    which reproduces the claim positively rather than by failure to refute it. The `6/8` rate itself
    is **not** re-derived at that precision and is not asserted by this tick.
- [x] `report.md` carries pre-fix reproduction and post-fix proof.
  → Evidence: pre-fix is the sixteen-run characterisation under `## Scope 1 Execution — Characterisation`; post-fix is the three-run verification under `## Scope 2 Execution — Remedy Applied`. Both were already recorded and are summarised in `## Cross-Scope Definition of Done — Status`; this tick only stops the artifact contradicting itself.
- [x] The separation from `BUG-016` is intact: no claim in this packet is offered as an
      explanation for the red deploy gate.
  → Evidence: `## The Separation From BUG-016` carries a six-row comparison establishing they are different defects. Re-verified mechanically after BUG-016 was closed in the same session, which is when contamination would have been introduced: `git show origin/main:specs/_bugs/BUG-016-*/scopes.md | grep -c 'BUG-017'` returns **0** — BUG-016 cites nothing from this packet as evidence, in either direction.
- [x] `uservalidation.md` carries a filled Human Acceptance Record.
  → Evidence: filled at the operator's instruction "validated BUG-016 and BUG-017, sign them" —
    `acceptedBy: operator`, `acceptedAt: 2026-08-25T22:22:04Z`, `method: human-interactive`,
    the method the registry defines as a human exercising the delivered behaviour in a live
    session. One acceptance act covered both packets, so the record declares `acceptanceAct`,
    the packets it covers, and a basis specific to this one. The Checklist remains unticked and
    no status moved; this row asserts the record exists and is filled, nothing further.
