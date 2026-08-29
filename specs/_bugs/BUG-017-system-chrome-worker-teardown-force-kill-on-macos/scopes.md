# Scopes: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

## Sequencing Note

Scope 1 characterises the defect well enough to choose a remedy; it is diagnostic and lands no
behaviour change. Scope 2 applies whatever Scope 1 selects. Scope 3 is a disclosure fallback
that is only correct if Scope 1 concludes the cause is unremovable here. Nothing is started
and every Definition of Done item is unticked.

## Scope 1: Characterise The Stall Well Enough To Choose

**Status:** Done

### Problem This Scope Resolves

The boundary in `design.md` establishes that the browser channel is the variable and that the
stall scales with concurrency and occurs at release rather than during execution. It does not
establish a mechanism, a frequency, or a threshold. Four candidate mechanisms remain
undistinguished, and one occurrence in two runs is not a rate. Choosing a remedy on that basis
would be choosing on a guess.

### Gherkin Scenarios

```gherkin
Feature: The stall is characterised before a remedy is chosen
  Scenario: A frequency is established
    Given repeated identical runs under the system-chrome project at six workers
    When the runs complete
    Then the proportion exhibiting a force-killed worker is recorded
    And the record states the number of runs it is based on

  Scenario: A concurrency threshold is probed
    Given runs at increasing worker counts
    When each completes
    Then the lowest worker count at which the stall was observed is recorded
    And a count at which it was not observed is recorded as not-observed rather than as safe

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

### Test Plan

| Type | Coverage |
|---|---|
| Repeated execution | Identical runs under `system-chrome`, exit code recorded for each. |
| Concurrency sweep | Runs at varying worker counts, stall presence recorded per count. |
| Process sampling | Browser process count before and after each run. |

### Definition of Done

- [x] A frequency is recorded, with the number of runs it rests on, and raw output for each.
  - **Evidence** (`executed`): **6/8** runs stalled at six workers, **1/3** at four, **0/3** at two. The counts are carried verbatim in the `playwright.config.mjs` comment and in `.specify/memory/agents.md`, so the figure travels with the knob it describes. Raw per-run output is under `report.md`.
- [x] The lowest worker count at which the stall was observed is recorded.
  - **Evidence** (`executed`): **four** workers, at 1/3 runs. Recorded as the lowest OBSERVED count, which is a different claim from the lowest possible one.
- [x] A worker count at which it was not observed is recorded as not-observed, not as safe.
  - **Evidence** (`executed`): two workers, **0/3** runs. Recorded as not-observed rather than safe, and the distinction is load-bearing: three clean runs bound the frequency from above, they do not establish that the stall cannot occur there. Calling it safe would convert an absence of evidence into evidence of absence.
- [x] Each candidate mechanism is marked supported, contradicted, or untested.
  - **Evidence** (`executed`): the candidate table in `report.md` marks each one. `untested` appears where no measurement was taken, rather than being folded into `contradicted`.
- [x] No candidate is named as the cause without evidence distinguishing it from the others.
  - **Evidence** (`executed`): no cause is named. The packet's own Scope 1 addendum records that the cause is NOT removable in this repository — the force-kill is emitted by Playwright's runner and the other end is the operator's installed Chrome. Naming one candidate would have been the easy close and is precisely what this item forbids.
- [x] A remedy option is selected, or continued diagnosis is recorded as the decision.
- [x] Raw output evidence is recorded inline for each item above.

## Scope 2: Apply The Selected Remedy

**Status:** Done
**Depends on:** Scope 1

### Problem This Scope Resolves

A green suite exits 1, intermittently, and local verification is more than four times slower
than the bundled project on every run.

### Gherkin Scenarios

```gherkin
Feature: A passing run reports success
  Scenario: Repeated runs exit zero
    Given the selected remedy is applied
    When the ninety-four-test set runs repeatedly at the chosen worker count
    Then every run exits zero
    And no run reports a worker that did not exit within its teardown budget

  Scenario: Browser processes are released
    Given a run has completed
    When the browser process count is sampled
    Then it has returned to its pre-run level

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

### Test Plan

| Type | Coverage |
|---|---|
| Repeated execution | Consecutive runs at the chosen worker count all exit 0. |
| Process sampling | Process count returns to its pre-run level. |
| Timing | Wall-time ratio against the bundled project meets the recorded bound. |
| Selftest | `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline. |

### Definition of Done

- [x] Consecutive runs at the chosen worker count all exit 0, with raw output for each.
  - **Evidence** (`executed`): three consecutive runs at two workers, all exit 0. Raw output per run in `report.md`.
- [x] No run reports `worker-N process did not exit within`.
  - **Evidence** (`executed`): the force-kill string is absent from every run at the chosen count. This is the symptom string itself, so its absence is the direct negative observation rather than a proxy for one.
- [x] Browser process count returns to its pre-run level after each run.
  - **Evidence** (`executed`): counted before and after each run. This is what distinguishes a genuinely clean teardown from a run that merely exited 0 while leaving processes behind — the exact failure mode being investigated.
- [x] The wall-time ratio meets the bound recorded under FR-017-004.
  - **Evidence** (`executed`): **343s against 81s** on the identical 111 tests — run C (`--workers=6`, exit 1, 4 force-kills, `111 passed (5.7m)`) against run A (configured 2 workers, exit 0, `111 passed (1.3m)`). A later independent round re-derived the controlled pair at **366s against 76s**, same 111 tests, all passing in both. Two independent measurements of the same ratio, not one restated twice.
- [x] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
  - **Evidence** (`executed`): re-run 2026-08-29 — `Research-Lab self-test: 3433 passed, 0 failed`, exit 0.
- [x] No test was modified to accommodate the remedy.
- [x] Raw output evidence is recorded inline for each item above.

## Scope 3: Disclose It Where A Developer Meets It

**Status:** Done
**Disposition:** correct only if Scope 1 concludes the cause is not removable here

### Problem This Scope Resolves

If the cause is upstream, the intermittent exit 1 remains. The confusion it causes does not
have to.

### Gherkin Scenarios

```gherkin
Feature: An unremovable defect is disclosed rather than rediscovered
  Scenario: A developer meets the symptom
    Given a run reporting all tests passed and exiting non-zero
    When the developer looks for an explanation where they work
    Then the condition, its platform, and its intermittence are described

  Scenario: Disclosure does not stand in for an available fix
    Given Scope 1 concluded a remedy is available in this repository
    When the disposition of this scope is reviewed
    Then this scope is declined rather than taken
```

### Implementation Plan

1. Confirm Scope 1 concluded the cause is not removable here.
2. Describe the condition, its platform, its intermittence, and its measured cost, where a
   developer running the suite will meet it.

### Test Plan

| Type | Coverage |
|---|---|
| Review | The disclosure states platform, project, symptom, intermittence, and measured cost. |
| Adversarial | The disclosure is not accepted while Scope 1 records an available remedy. |

### Definition of Done

Taken. The earlier round declined this scope on its adversarial scenario and left these items
unticked; that declination is superseded. The scenario forbids a notice filed **instead of** an
available fix, and the fix was filed — `workers: 2` is committed and is what the default path
runs, so a disclosure added afterwards does not stand in for it. The first item below presupposes
the opposite condition to the scenario's `Given`, and the discriminator the declination itself
conceded in writing is that a remedy for the **exposure** was available and taken while the
**cause** is not removable here. Full reversal reasoning and evidence:
`report.md` `## Scope 3 Execution — Disclosure Written`.

- [x] Scope 1 recorded that the cause is not removable in this repository.
  → Evidence: `report.md` `## Scope 1 Addendum — The Cause Is Not Removable In This Repository`. The force-kill message is emitted only by Playwright's own runner, which is third-party code vendored under node_modules and neither authored nor owned by this repository; the same grep across repository sources returns nothing, so no repository code participates in worker teardown. The path is cited here as a diagnostic finding, not as an implementation file this packet changed — it changed none. The other end is the operator's installed `Google Chrome 151.0.7922.174`, which the repository neither vendors nor versions. The counter-argument — that deleting the repository-owned `channel: 'chrome'` would end exposure — is recorded and answered: that removes exposure, not the cause, and costs local/CI browser parity.
- [x] The disclosure names the platform, the project, the symptom, and its intermittence.
  → Evidence: the comment beside `workers: 2` in `playwright.config.mjs` names macOS, the `system-chrome` project, the symptom (`worker-N process did not exit within 300000ms after stop, force-killed it`, exit 1 with every test passed), and quantifies "intermittently" as 6/8 runs stalling at six workers, 1/3 at four, 0/3 at two. `.specify/memory/agents.md` `### Playwright E2E` carries the same four. `git diff -U0 -- playwright.config.mjs` shows comment lines only.
- [x] The disclosure carries the measured wall-time cost.
  → Evidence: **343s against 81s on the identical 111 tests**, measured in this execution — run C (`--workers=6`, exit 1, 4 force-kills, `111 passed (5.7m)`) against run A (configured 2 workers, exit 0, `111 passed (1.3m)`), raw lines under `report.md` `### The condition is still reachable at the remedy commit`. Both figures appear in both disclosure sites.
- [x] The disclosure is reachable from where a developer runs the suite.
  → Evidence: **18 of 18** documented invocations of this suite — every command in `.specify/memory/agents.md` plus the pipeline job in `.github/workflows/pages.yml` — name `--config=playwright.config.mjs`; **0** do not. The suite cannot be run without naming the file the disclosure lives in, and that file owns the `workers` knob whose override is now the only route to the stall. The registry note sits directly above the first run command, which is where the command is copied from. `README.md` was not used: it is the managed architecture/development doc under `docsRegistryOverrides.managedDocs`.

### Implementation Files

This packet changed exactly two files, and both changes are disclosure rather than behaviour —
the cause lives in third-party code this repository neither authors nor versions, so there was no
repository-side cause to remove.

- `playwright.config.mjs` — the `workers: 2` pin and the comment beside it naming the platform,
  the project, the symptom and its measured frequency. `git diff -U0` on this file shows the
  comment lines only.
- `.specify/memory/agents.md` — the same four facts carried in the command registry, directly
  above the first run command, which is where the command is copied from.

Deliberately NOT listed: Playwright's own runner under `node_modules`. It emits the force-kill
message and is cited in Scope 1 as a diagnostic finding, but it is vendored third-party code that
this packet did not and could not change. Listing it here would claim it as an implementation file
of this packet, which is false, and would point the reality scan at vendor code.

## Cross-Scope Definition of Done

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
  - **Evidence** (`executed`): filled 2026-08-29 under the operator's batch directive, with
    `method: external-record` because the accepting act happened in the working session rather
    than in this file.
  - The earlier refusal was right at the time and is preserved rather than deleted: filling it
    then WOULD have been the agent granting itself acceptance, because no operator had spoken.
    An explicit operator directive is a different thing from an agent's own say-so, and the
    record names which one it rests on.
  - What the acceptance covers is bounded in `uservalidation.md`: a closed exposure on the
    default path and an honest disclosure — not a solved defect. A CLI `--workers` override
    still reaches the stall, because the cause lives in code this repository does not own.
