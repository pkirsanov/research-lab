# Scopes: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

## Reopening Addendum — Two-Worker Recurrence At `d532faaac`

The checked Scope 1 through Scope 3 rows remain a historical record of what their recorded
runs established. They are not rewritten or unchecked. The later evidence under
`report.md` `Current-Revision Stabilization At d532faaac` supersedes only the inference that
three clean runs at two workers eliminated the recurrence. The exact BUG-022 C03 portfolio
workload failed at two workers in two of two current-revision runs after all 94 tests passed.
SCN-BUG017-04 and SCN-BUG017-05 therefore remain historical Scope 2 records whose RED/GREEN
evidence is preserved; their two-worker obligations are replaced for current closure by
SCN-BUG017-11 and are not active selected-route requirements. SCN-BUG017-06 retains the
wall-time criterion, whose current planning authority is stated under Scope 4 without turning
historical timing into a human acceptance result.
Scope 4 remains the completed selected-route closure scope. Scope 2 was reopened for
SCN-BUG017-06's committed ratio evaluator and same-revision receipt set. That reconciliation is
complete at source revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. Structured tool-log
lines 1598 through 1602 carry the RED, implementation, targeted GREEN, live, and protected
regression receipts. The canonical resolver derives SCN-BUG017-06 as `REGRESSION_GREEN`.
Scope 2 is done. BUG-level status remains in progress because SCN-BUG017-11 remains `PLANNED`
for a new source revision. Scope 4's Definition of Done remains satisfied by the test evidence
under `report.md` `Scope 4 Current Test Execution At 2026-08-28`.

## Current Scenario Manifest Boundary

The current machine-readable scenario set is exactly SCN-BUG017-01, SCN-BUG017-02,
SCN-BUG017-03, SCN-BUG017-06, SCN-BUG017-07, SCN-BUG017-08, and SCN-BUG017-11.
The first six remain active because the selected fix still depends on evidence-bounded
characterisation, the FR-017-004 cost threshold, and disclosure that cannot replace the
containment. SCN-BUG017-11 is the current runtime-closure route.

SCN-BUG017-04, SCN-BUG017-05, SCN-BUG017-09, and SCN-BUG017-10 are absent from
`scenario-manifest.json`. The installed schema defines no ignored or superseded archive, and
the installed state resolver treats every scenario array entry as a current receipt obligation.
Their exact historical Gherkin appears below as Markdown quotations, outside active scenario
syntax. Their provisional GREEN, later RED, rollback, and rejection evidence remains in
`report.md` and in the historical Test Plan records below.

## Execution Outline — Convergence Iteration 4

### Phase Order

1. **Scope 2 ratio-contract completion.** Retain the committed shared SCN-BUG017-06 ratio
  evaluator and the five canonical phase receipts bound to source revision `d0c09a3ec90d`.
2. **Scope 4 decision preservation.** Retain the Foundation lifecycle candidate's successful
  and failed runs as rejected historical evidence without making either candidate scenario an
  active closure obligation.
3. **Scope 4 fallback closure.** Keep the hash-verified rollback and one-worker repository
  default, then close only through SCN-BUG017-11's canonical functional and exact BUG-022 C03
  references.

### New Types And Signatures

- No product type, schema, route, or public API changes.
- Rejected historical local extension in `tests/portfolio-survival-foundation.spec.mjs`:
  `const test = baseTest.extend({ foundationBrowserBoundary: [fixture, { auto: true,
  scope: 'worker' }] })`.
- Rejected historical worker owner: `let foundationBrowser`, assigned from Playwright's existing `browser`
  fixture by `foundationBrowserBoundary` without an explicit parameter at each test site.
- Rejected historical lifecycle signature: Foundation's existing `afterAll` closes that owned browser
  before Playwright begins worker teardown.
- Selected configuration contract: `playwright.config.mjs` resolves `workers: 1` while retaining
  the existing `system-chrome` project and unchanged worker-stop budget.

### Validation Checkpoints

1. The planning packet must keep SCN-BUG017-04, SCN-BUG017-05, SCN-BUG017-09, and
  SCN-BUG017-10 outside the current scenario manifest while leaving their successful and failed
  evidence intact in explicit historical sections.
2. SCN-BUG017-11 must resolve only to canonical, repository-present tests for the selected
  one-worker fallback and the unchanged exact BUG-022 C03 workload.
3. Scenario obligations, Markdown-to-JSON Test Plan parity, traceability, linked-test
  resolution, and scope-progress integrity must pass before handoff.
4. TP-BUG017-02-02 remains supported by its separately checked repository-selftest record. It is
  not relabeled as one of the current scenario-state phases.
5. Current test-owned execution closes the active references under the selected one-worker
  configuration; acceptance, validation, and certification gates remain independently owned.

## Execution Inventory

| Scope | Outcome | Surfaces | Primary validation | Status |
| --- | --- | --- | --- | --- |
| 1 | Characterise the original stall | Diagnostics | Worker sweep and candidate discrimination | Done; SCN-BUG017-01 through SCN-BUG017-03 remain active invariants |
| 2 | Apply the original exposure remedy and close the active cost invariant | Ratio helper and focused regression | Deterministic ratio controls, live comparison, isolated repository selftest, and complete lifetime-tax workload | Done; SCN-BUG017-06 resolves `REGRESSION_GREEN` at `d0c09a3ec90d` |
| 3 | Disclose the remaining override risk | Config and command registry | Disclosure and workload regressions | Done; SCN-BUG017-07 and SCN-BUG017-08 remain active invariants |
| 4 | Resolve the current two-worker recurrence | Rejected Foundation lifecycle candidate; selected one-worker config fallback | Historical candidate record plus SCN-BUG017-11 canonical fallback verification | Done |

## Sequencing Note

Scope 1 characterises the defect well enough to choose a remedy; it is diagnostic and lands no
behaviour change. Scope 2 applies whatever Scope 1 selects. Scope 3 is a disclosure fallback
that is only correct if Scope 1 concludes the cause is unremovable here. Those three scopes are
preserved as the original execution sequence. Scope 4 follows them additively and keeps the
selected runtime-closure route complete after the current-revision two-worker recurrence.
Scope 2 is done because SCN-BUG017-06 has its committed evaluator and one-revision receipt
chain. The diagnostic, cost, and disclosure constraints listed in the current manifest remain
active invariants. SCN-BUG017-11 remains planned for a new revision and does not reopen Scope 2.

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
# SCN-BUG017-06
  Scenario: The cost is proportionate
    Given the selected remedy is applied
    When the same set runs under both projects
    Then the wall-time ratio meets the bound recorded under FR-017-004
```

### Replaced Scenario Gherkin — Historical, Not Active

The quotation below preserves the prior Gherkin text verbatim after each Markdown quote marker.
It is decision history, not executable scenario syntax and not a current receipt obligation.

> ```gherkin
> Feature: A passing run reports success
> # SCN-BUG017-04
>   Scenario: Repeated runs exit zero
>     Given the selected remedy is applied
>     When the ninety-four-test set runs repeatedly at the chosen worker count
>     Then every run exits zero
>     And no run reports a worker that did not exit within its teardown budget
>
> # SCN-BUG017-05
>   Scenario: Browser processes are released
>     Given a run has completed
>     When the browser process count is sampled
>     Then it has returned to its pre-run level
> ```

### Implementation Plan

1. Apply the option selected in Scope 1.
2. Run the set repeatedly and record every exit code.
3. Sample browser process count either side of each run.
4. Add `scripts/validate-playwright-cost-ratio.mjs` as the single ratio predicate and live
  dual-project runner. It must enumerate exactly the 22 `lifetime-tax*.spec.mjs` files, reject
  any configured worker count other than one, run both projects without a worker override,
  require both commands to exit zero, and enforce the unchanged FR-017-004 maximum of 3.0.
5. Add `Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison`
  to `tests/playwright-runtime.foundation.functional.mjs`. It must exercise the same predicate
  through the helper's deterministic control mode and assert its exact refusal and cleanup.
6. Measure the wall-time ratio against the bundled project through the committed helper.

### Implementation Files

- `playwright.config.mjs` owned the historical `workers: 2` exposure bound and owns the current
  one-worker selection recorded under Scope 4, together with the unchanged `system-chrome` project.
- `scripts/validate-playwright-cost-ratio.mjs` is the planned executable owner for the live pair,
  shared ratio predicate, exact SCN-BUG017-06 refusal, and isolated deterministic control input.
- `tests/playwright-runtime.foundation.functional.mjs` is the existing registered functional
  family and will own the focused persistent regression for the ratio predicate.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` are concrete tests in the unchanged 22-file remedy workload.
- `tests/playwright-runtime.foundation.functional.mjs` is the existing repository config/runtime canary.

### Change Boundary For The Ratio-Test Repair

- Allowed implementation files: `scripts/validate-playwright-cost-ratio.mjs` and the smallest
  additive SCN-BUG017-06 block in `tests/playwright-runtime.foundation.functional.mjs`.
- Allowed planning files: this Scope 2 section, `scenario-manifest.json`, `test-plan.json`, and
  plan-owned execution routing in `state.json`.
- Excluded: `playwright.config.mjs`, all 22 lifetime-tax test bodies, `report.md`,
  `uservalidation.md`, certification and status fields, project config, framework-managed files,
  BUG-022, global stale/clone adjudication, both G136 boundaries, and unrelated concurrent work.
- The helper may create and remove only its own uniquely named temporary comparison directory.
  It must not write a measurement fixture, browser output, or generated artifact into the checkout.

### Test Plan

| ID | Scenario | Test Type | Category | File / exact title | Command | Live system | Required result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TP-BUG017-02-01 | SCN-BUG017-06 | Like-for-like timing | `e2e-ui` | `scripts/validate-playwright-cost-ratio.mjs`; exact carriers remain `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` in the complete 22-file workload | `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 1400 node scripts/validate-playwright-cost-ratio.mjs --live` | Yes | The helper requires configured workers=1, enumerates exactly 22 files, runs both projects without a worker override, requires both exits to be zero, and evaluates the measured system-Chrome/bundled-Chromium ratio as no more than the unchanged FR-017-004 maximum of 3.0. |
| TP-BUG017-02-02 | SCN-BUG017-06 | Repository regression | `functional` | `scripts/selftest.mjs` | `node scripts/selftest.mjs` | No | The build-free repository invariant suite reports zero failures without reducing its recorded assertion baseline. |
| TP-BUG017-02-03 | SCN-BUG017-06 | Regression E2E | `e2e-ui` | `tests/lifetime-tax-combined.spec.mjs` — `Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`; `tests/lifetime-tax-read-bound.spec.mjs` — `Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement` | `npx --no-install playwright test tests/lifetime-tax-combined.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure$' --reporter=list && npx --no-install playwright test tests/lifetime-tax-read-bound.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep='^Regression: SCN-021-02 a declared pack delayed below the bound settles with every figure identical to the undelayed settlement$' --reporter=list` | Yes | Both exact scenario carriers pass through the selected system-Chrome configuration with no hidden lifecycle failure. |
| TP-BUG017-02-04 | SCN-BUG017-06 | Broader Regression E2E | `e2e-ui` | `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` as concrete carriers in the complete 22-file lifetime-tax workload | `npx --no-install playwright test tests/lifetime-tax*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | The complete affected system-Chrome workload exits zero under the selected configuration and preserves the FR-017-004 comparison boundary. |

#### SCN-BUG017-06 Deterministic RED Contract

- Preserve TP-BUG017-02-01 as the positive live proof. It runs the identical 22-file workload
  under `system-chrome` and bundled `chromium` at the configured one-worker setting, requires
  both commands to exit zero, and evaluates the measured ratio against the unchanged 3.0 bound.
- A six-worker live timing attempt does not qualify as RED evidence. Its ratio depends on
  ambient scheduling and can remain below 3.0 even when the test is otherwise healthy.
- The repository contains the committed `scripts/validate-playwright-cost-ratio.mjs` evaluator
  and one additive persistent regression in the existing
  `tests/playwright-runtime.foundation.functional.mjs` family.
- The helper has three explicit modes and no implicit fallback. `--live` executes the real pair and
  calls the shared ratio predicate. `--control at-bound` creates a uniquely named temporary
  comparison record with 3000/1000, calls that predicate, cleans up, and exits zero at 3.000.
  `--control over-bound` copies that record, changes only `systemChromeWallMs` to 3001, keeps
  `bundledChromiumWallMs` at 1000 and the maximum at 3.000, calls the same predicate, removes
  the temporary directory in `finally`, and exits 1 with
  `SCN-BUG017-06: wall-time ratio 3.001 exceeds FR-017-004 maximum 3.000`.
- The current RED receipt executes
  `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node scripts/validate-playwright-cost-ratio.mjs --control over-bound`.
  The current targeted GREEN receipt executes
  `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node scripts/validate-playwright-cost-ratio.mjs --control at-bound`.
  Both receipts bind the same test identity and negative-control text. The persistent regression
  command is `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node --test --test-name-pattern='^Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison$' tests/playwright-runtime.foundation.functional.mjs`.
- The control output must label its 3001/1000 values as deterministic comparison input, never as
  observed elapsed runtime. It must not alter the production 3.0 criterion, substitute a static
  text-presence assertion for ratio evaluation, or depend on machine load.
- A hard-coded `gtimeout` path is invalid on this macOS environment. Every command above uses the
  repository-supported explicit Perl alarm wrapper; the helper must also terminate both child
  processes and remove its temporary output on interruption.

### Replaced Scenario Test Record — Historical, Not Active Test Plan

| Historical scenario | Former coverage | Recorded outcome and disposition |
| --- | --- | --- |
| SCN-BUG017-04 | Repeated complete lifetime-tax runs at the former two-worker setting | Provisional GREEN runs and their exact exits remain under `report.md` `Scope 2 Execution — Remedy Applied`. The later two-worker recurrence rejected this as current closure; SCN-BUG017-11 replaces it. |
| SCN-BUG017-05 | Pre-run and post-run browser-process sampling at the former two-worker setting | The process-release samples remain under `report.md` `Scope 2 Execution — Remedy Applied`. The later force-kill recurrence rejected this as current closure; SCN-BUG017-11 replaces it. |

### Historical Scope 2 Completion Record — Not A Current DoD Item

> - [x] The historical scenario-specific E2E record for SCN-BUG017-04 through SCN-BUG017-06 remains preserved. **Claim Source:** executed. → Evidence: [BUG-017 report](report.md), `Scope 2 Execution — Remedy Applied`, records three consecutive scenario workloads with 94 passes, exit 0, no force-kill, restored process counts, and the configured worker setting; only SCN-BUG017-06 remains in the current scenario manifest.

### Definition of Done

The checked rows below preserve the original Scope 2 execution record. They are not current
receipt requirements for SCN-BUG017-04 or SCN-BUG017-05. SCN-BUG017-06 remains active only for
the separate FR-017-004 cost invariant.

The current SCN-BUG017-06 receipts supersede only the former statement that no current receipt
existed. Historical two-worker evidence and rejected candidate receipts remain unchanged. The
current chain is tool-log lines 1598 through 1602. Every row carries source revision
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619`, the same negative control, and the declared
implementation references. TP-BUG017-02-02 remains covered by its separate checked item below.
No new repository-selftest receipt is claimed by the five-phase scenario-state chain.

- [x] The committed SCN-BUG017-06 ratio evaluator applies one predicate to live measurements and
  both deterministic controls, keeps the maximum at 3.000, emits the exact 3.001 refusal, emits the
  exact 3.000 acceptance, and removes its isolated temporary comparison directory on every exit.
  **Claim Source:** executed. → Evidence: [structured current-revision receipts](../../../.specify/runtime/tool-calls.jsonl#L1598-L1600) record the deterministic RED, implementation contract, and at-bound GREEN. The canonical resolver derives SCN-BUG017-06 through `RED_VERIFIED`, `IMPLEMENTED`, and `GREEN_TARGETED` at `d0c09a3ec90d`.
- [x] Fresh SCN-BUG017-06 receipts bind the deterministic RED and targeted GREEN to the same test
  identity and negative control, then bind the real one-worker dual-project live proof and the
  separate protected regression at one source revision. **Claim Source:** executed. → Evidence:
  [tool-log lines 1598 through 1602](../../../.specify/runtime/tool-calls.jsonl#L1598-L1602) carry
  phase sequence `red, implement, green, live, regression`, exit sequence `1, 0, 0, 0, 0`, and
  source revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. The canonical resolver derives
  SCN-BUG017-06 as `REGRESSION_GREEN`.

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass for SCN-BUG017-06: TP-BUG017-02-03 exercises the exact `tests/lifetime-tax-combined.spec.mjs` and `tests/lifetime-tax-read-bound.spec.mjs` carriers, and TP-BUG017-02-04 preserves the complete affected workload. **Claim Source:** executed. → Evidence: [tool-log line 1600](../../../.specify/runtime/tool-calls.jsonl#L1600) records targeted GREEN with exit 0 and stdout SHA-256 `126769549145b36cfb711d95a4cc02d7879d38aa7e7dd3e6e1e8a0bed047de01`; [line 1601](../../../.specify/runtime/tool-calls.jsonl#L1601) records live comparison with exit 0 and stdout SHA-256 `f1db723539f4822d5597180b19d355ebcea5134fe705764c1aa19a78ba6a0cdf`; [line 1602](../../../.specify/runtime/tool-calls.jsonl#L1602) records the protected regression with exit 0 and stdout SHA-256 `79b41072df61e36acb680c71610f3eddf7b15ef2e12ebce045c5076c81728ee4`. All three bind source revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. [The FR-017-004 bound](report.md#the-fr-017-004-bound) records the three-to-one decision threshold.
- [x] Broader E2E regression suite passes for the complete 22-file lifetime-tax system-Chrome workload at the selected one-worker configuration. **Claim Source:** executed. → Evidence: [the live receipt](../../../.specify/runtime/tool-calls.jsonl#L1601) and [the separate protected regression receipt](../../../.specify/runtime/tool-calls.jsonl#L1602) both exit 0 at source revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. The canonical resolver derives SCN-BUG017-06 as `REGRESSION_GREEN`.
- [x] Historical repeated-run record: consecutive system-Chrome E2E workloads at the former chosen worker count exited 0, with raw output for each.
  → Evidence: `report.md` `## Scope 2 Execution — Remedy Applied` records three consecutive 94-test runs, all tests passing, exit 0, and zero force-kills.
- [x] No run reports `worker-N process did not exit within`.
  → Evidence: [Scope 2 remedy runs](report.md#scope-2-execution--remedy-applied).
- [x] Historical process-release record: the browser process count returned to its pre-run level after each recorded run.
  → Evidence: [Scope 2 remedy runs](report.md#scope-2-execution--remedy-applied).
- [x] The cost is proportionate: the wall-time ratio meets the bound recorded under FR-017-004.
  → Evidence: [tool-log line 1601](../../../.specify/runtime/tool-calls.jsonl#L1601) exits 0 with stdout SHA-256 `f1db723539f4822d5597180b19d355ebcea5134fe705764c1aa19a78ba6a0cdf` at source revision `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`; [the FR-017-004 bound](report.md#the-fr-017-004-bound) records the three-to-one decision threshold.
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

## Scope 4: Persist The Rollback-Gated One-Worker Fallback

**Status:** Done
**Depends On:** Scope 3

### Fallback Selection Addendum

The lifecycle candidate passed one strict canary and one exact complete run. Finalization then
failed the complete runtime-foundation file and the exact named canary. A second current canary
failed at the same committed bytes. These failures reject the candidate as a stable final route.

Commit `047292eb2` reverses the lifecycle-test commit. Commit `af119275a` reverses the lifecycle
implementation. The Foundation and runtime-functional files then matched baseline blobs
`bc66800e...` and `0d319b8b...`. Shared runtime and Paths remained unchanged.

The selected fallback pins one worker. The current-session shared execution for
TP-BUG017-04-04 and TP-BUG017-04-04B resolved one worker, retained system-Chrome and Chrome,
passed 94 of 94 tests, exited zero, emitted no force-kill or ignored-lifecycle marker, reported
zero skips and todos, and left zero owned residue. TP-BUG017-04-05 passed one of one with exit
zero and zero skips or todos. Scope 4 is done. The packet, acceptance, and certification remain
in progress for their owning gates.

### FR-017-004 Planning Threshold

The active wall-time threshold is no more than three times the bundled Chromium project for the
identical workload at the same configured worker count. The threshold is adopted from the
existing `report.md` `The FR-017-004 bound` record and the Scope 2 planning contract. It is a
planning decision, not a claim that a human accepted the selected fallback. The historical
two-worker measurement supports the threshold's selection but does not establish current
one-worker acceptance; that independently owned acceptance remains unchanged.

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
It no longer supports an elimination, safety, or closure claim. SCN-BUG017-04 and
SCN-BUG017-05 retain the former two-worker route's decision history, and SCN-BUG017-09 through
SCN-BUG017-10 retain the lifecycle candidate's decision history. All four are replaced as
active runtime-closure scenarios by SCN-BUG017-11. SCN-BUG017-06 retains only the separate
three-to-one planning threshold above; no historical timing or evidence receipt is relabeled as
current human acceptance.

### Gherkin Scenarios

```gherkin
Feature: The selected fallback closes the current system-Chrome recurrence
# SCN-BUG017-11
  Scenario: One worker is used only after the lifecycle candidate fails
    Given the lifecycle candidate has failed a required current acceptance run
    And the candidate changes have been hash-verified as rolled back
    When the exact BUG-022 C03 command runs through the repository config default
    Then it resolves one worker without changing browser project
    And closure requires 94 passing tests, exit zero, and no ignored force-kill error
```

### Rejected Candidate Scenarios — Historical, Not Active Closure

The quotation below preserves the candidate-planning Gherkin text verbatim after each Markdown
quote marker. These scenarios are absent from the current manifest and are not receipt targets.

> ```gherkin
> Feature: Foundation releases its browser before the worker is asked to stop
> # SCN-BUG017-09
>   Scenario: The focused lifecycle boundary survives the strict canary
>     Given the system-chrome project is configured with two workers on macOS
>     And Foundation receives an automatic worker-scoped boundary fixture
>     And Foundation closes its owned browser in its existing afterAll
>     When the cumulative Foundation-to-Paths canary runs in a child process
>     Then all 27 tests pass
>     And the child exits zero within 15 seconds of worker stop
>     And no worker force-kill or ignored teardown error is reported
>
> # SCN-BUG017-10
>   Scenario: The lifecycle candidate clears the blocked complete workload
>     Given SCN-BUG017-09 has passed without an ignored lifecycle error
>     When the exact BUG-022 C03 94-test portfolio command runs at two workers
>     Then all 94 tests pass and the command exits zero
>     And no worker remains until the 300000ms force-kill boundary
>     And no Chrome process started by the workload remains after exit
> ```

SCN-BUG017-09 retains its earlier strict-canary GREEN, close-removal RED, and two later failures
at unchanged candidate bytes. SCN-BUG017-10 retains its provisional complete-workload GREEN.
The later strict-canary failures reject both candidate routes. The explicit revert commits,
baseline blob identities, and selected fallback evidence remain under `report.md` `Scope 4
Finalization Validation - Candidate Rejected` and `Scope 4 Fallback Selection And Verification`.

### Implementation Plan

1. Preserve the report anchors for the candidate's strict-canary GREEN, adversarial RED, later
  strict-canary failures, provisional complete-workload pass, explicit reverts, and baseline
  blob identities. Do not edit or reinterpret that evidence.
2. Keep SCN-BUG017-09 and SCN-BUG017-10 out of the current scenario manifest because the
  installed resolver has no archive state. Preserve them as historical decision records, not
  active Gherkin or passing obligations.
3. Keep the selected final-tree contract at one worker. Preserve the `system-chrome` project,
  Chrome channel, 300000ms worker-stop budget, list reporter, and visible force-kill failure.
4. Link SCN-BUG017-11 to the eight real portfolio-survival spec paths and the exact existing
  fallback-containment test title. Use no synthetic portfolio test title.
5. Preserve the current test-owned execution of the exact config-default BUG-022 C03 command and
  the exact focused SCN-BUG017-11 functional command without rerunning replaced candidates.
6. Mark Scope 4 done after all three active Test Plan rows resolve from current evidence. Keep
  BUG-level status and certification in progress until their independent owners clear later gates.

### Implementation Files

- `playwright.config.mjs` — selected one-worker runtime configuration.
- `.specify/memory/agents.md` — command-registry disclosure for the selected fallback.
- `tests/playwright-runtime.foundation.functional.mjs` — existing exact SCN-BUG017-11
  containment regression.
- The eight `tests/portfolio-survival-*.spec.mjs` files — unchanged live workload selected by
  the exact BUG-022 C03 command.
- `scopes.md`, `scenario-manifest.json`, and `test-plan.json` — planning-owned active-route
  contract and test handoff.

### Change Boundary

**Allowed planning families for this reconciliation:**

- This packet's `scopes.md`, `scenario-manifest.json`, and `test-plan.json`.
- Plan-owned execution routing metadata in `state.json`, without status, certification, or
  acceptance changes.

**Allowed next-owner activity:**

- `bubbles.test` may generate distinct current receipts only for SCN-BUG017-01,
  SCN-BUG017-02, SCN-BUG017-03, SCN-BUG017-06, SCN-BUG017-07, SCN-BUG017-08, and
  SCN-BUG017-11. It must not rerun or relabel SCN-BUG017-04, SCN-BUG017-05,
  SCN-BUG017-09, or SCN-BUG017-10 as current success.

**Excluded surfaces:**

- All runtime source, test bodies, runner configuration, command-registry content, application
  source, generated site output, and BUG-022 declaration behavior.
- The eight portfolio-survival spec files, `tests/playwright-runtime.foundation.functional.mjs`,
  `tests/playwright-runtime.mjs`, and `tests/portfolio-survival.support.mjs` are read-and-execute
  surfaces only for this handoff.
- Browser-project selection, Chrome channel configuration, the 300000ms runner teardown
  budget, reporter behavior, and error handling that could hide a force-kill.
- BUG-017 and BUG-022 historical report evidence, certification, uservalidation, acceptance,
  framework-managed files, unrelated specs, and concurrent market-brief work.

### Rollback

- The rejected candidate rollback is a completed historical decision, not an active mutation
  step. Its two explicit revert commits and baseline blob identities remain in `report.md`.
- Do not restore the Foundation-owned browser-close candidate during selected-route testing.
- A failure in either active row leaves Scope 4 in progress and routes the observed behavior to
  `bubbles.implement`; it does not authorize a worker-count change, browser-project switch,
  longer teardown budget, hidden force-kill, or evidence rewrite.

### Test Plan

| ID | Type | Scenario | File / exact title | Command | Required result |
| --- | --- | --- | --- | --- | --- |
| TP-BUG017-04-04 | Regression E2E | SCN-BUG017-11 | The eight real `tests/portfolio-survival-*.spec.mjs` files named in `scenario-manifest.json` | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | The config-default run resolves one worker; 94/94 tests pass; exit is zero; no force-kill or ignored-lifecycle marker appears; workload-owned process counts return to baseline. |
| TP-BUG017-04-04B | Broader Regression E2E | SCN-BUG017-11 | The complete eight-file portfolio-survival browser suite | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | The complete selected consumer suite stays green under the same one-worker system-Chrome route. This row uses the same command as TP-BUG017-04-04 because the scenario-specific behavior is the runner-level outcome of the full suite. |
| TP-BUG017-04-05 | Adversarial functional regression | SCN-BUG017-11 | `tests/playwright-runtime.foundation.functional.mjs` — `Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity` | `node --test --test-name-pattern='^Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity$' tests/playwright-runtime.foundation.functional.mjs` | The config resolves one worker and retains `system-chrome`; the 300000ms budget and force-kill disclosure remain; the rejected Foundation lifecycle seam remains absent. |

The project config declares no `testImpact` or `traceContracts` map. No impact-plan or trace/SLO
row applies to this scope.

### Rejected Candidate Test Record — Historical, Not Active Test Plan

| Historical ID | Replaced scenario | Recorded decision evidence |
| --- | --- | --- |
| TP-BUG017-04-01 | SCN-BUG017-09 | The named 27-test strict canary produced an earlier GREEN and two later failures at unchanged candidate bytes. It is removed from the final tree and does not need to pass. |
| TP-BUG017-04-02 | SCN-BUG017-09 | The close-removal RED and exact restoration remain evidence that the rejected canary discriminated during candidate evaluation. |
| TP-BUG017-04-03 | SCN-BUG017-10 | The two-worker complete workload passed provisionally before later strict-canary failures rejected the candidate. It remains history, not selected-route closure. |

### Definition of Done

- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass: TP-BUG017-04-04 executes SCN-BUG017-11 through the exact config-default 94-test system-Chrome command and proves one resolved worker, 94/94 passing, exit zero, no force-kill or ignored lifecycle error, and zero workload-owned residue. **Claim Source:** executed. → Evidence: [Scope 4 current test execution](report.md#tp-bug017-04-04-and-tp-bug017-04-04b) records `workers=1`, `project=system-chrome`, `channel=chrome`, 94/94 passing, exit 0, zero force-kill and ignored-lifecycle markers, zero skips and todos, and `ownedResidue=0`; complete-capture SHA-256 `ed9bd75c5142d0e6d895601a4331a760c4ceab32d5ef792b7c4ff9417061b13e` covers all 313 lines.
- [x] Broader E2E regression suite passes: TP-BUG017-04-04B executes the same complete eight-file, 94-test portfolio-survival system-Chrome suite under the selected one-worker default. **Claim Source:** executed. → Evidence: [Scope 4 current test execution](report.md#tp-bug017-04-04-and-tp-bug017-04-04b) states that TP-BUG017-04-04 and TP-BUG017-04-04B share the identical complete command, records all 94 tests passing with exit 0 and zero skips or todos, and binds the shared run to capture SHA-256 `ed9bd75c5142d0e6d895601a4331a760c4ceab32d5ef792b7c4ff9417061b13e`.
- [x] TP-BUG017-04-05 passes the exact existing SCN-BUG017-11 fallback-containment test and proves one worker, system-Chrome parity, the unchanged 300000ms stop budget, visible force-kill disclosure, and absence of the rejected lifecycle candidate. **Claim Source:** executed. → Evidence: [Scope 4 current test execution](report.md#tp-bug017-04-05) records one of one passing with exit 0, zero skips and todos, `workers=1`, `project=system-chrome`, `channel=chrome`, `defaultWorkerStopBudgetMs=300000`, `forceKillDisclosure=present`, and `lifecycleCandidateRolledBack=true`; capture SHA-256 `f5218b8a1a3991e53cbff0be3037a58e8f24a8342388f7a432d68c93050e0489` covers the complete 15-line output.

The rejected TP-BUG017-04-01 statement is no longer an active checkbox. Its failed current
acceptance runs must never be converted into a pass. The historical candidate record above and
the unchanged report anchors retain the complete decision evidence.

### Current Evidence Resolution — Scope 4

The current test phase executed the active commands once each. The complete 94-test shared run
satisfies TP-BUG017-04-04 and TP-BUG017-04-04B without reducing or repeating the workload. Its
capture SHA-256 is `ed9bd75c5142d0e6d895601a4331a760c4ceab32d5ef792b7c4ff9417061b13e`.
The focused one-test run satisfies TP-BUG017-04-05. Its capture SHA-256 is
`f5218b8a1a3991e53cbff0be3037a58e8f24a8342388f7a432d68c93050e0489`.
SCN-BUG017-09 and SCN-BUG017-10 remain replaced historical failures and were not rerun or
relabeled. No source, configuration, test, report evidence, acceptance, certification, or
BUG-level status is changed by this planning reconciliation.

## Cross-Scope Definition of Done

The checked rows below are preserved historical closure records. Scope 4 closes only from its
current one-worker evidence; these rows do not authorize BUG-022 to consume the old two-worker
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
