# Scopes: BUG-017 — System-Chrome Worker Teardown Force-Kill On macOS

## Sequencing Note

Scope 1 characterises the defect well enough to choose a remedy; it is diagnostic and lands no
behaviour change. Scope 2 applies whatever Scope 1 selects. Scope 3 is a disclosure fallback
that is only correct if Scope 1 concludes the cause is unremovable here. Nothing is started
and every Definition of Done item is unticked.

## Scope 1: Characterise The Stall Well Enough To Choose

**Status:** [ ] Not started

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

- [ ] A frequency is recorded, with the number of runs it rests on, and raw output for each.
- [ ] The lowest worker count at which the stall was observed is recorded.
- [ ] A worker count at which it was not observed is recorded as not-observed, not as safe.
- [ ] Each candidate mechanism is marked supported, contradicted, or untested.
- [ ] No candidate is named as the cause without evidence distinguishing it from the others.
- [ ] A remedy option is selected, or continued diagnosis is recorded as the decision.
- [ ] Raw output evidence is recorded inline for each item above.

## Scope 2: Apply The Selected Remedy

**Status:** [ ] Not started
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

- [ ] Consecutive runs at the chosen worker count all exit 0, with raw output for each.
- [ ] No run reports `worker-N process did not exit within`.
- [ ] Browser process count returns to its pre-run level after each run.
- [ ] The wall-time ratio meets the bound recorded under FR-017-004.
- [ ] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
- [ ] No test was modified to accommodate the remedy.
- [ ] Raw output evidence is recorded inline for each item above.

## Scope 3: Disclose It Where A Developer Meets It

**Status:** [ ] Not started
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

- [ ] Scope 1 recorded that the cause is not removable in this repository.
- [ ] The disclosure names the platform, the project, the symptom, and its intermittence.
- [ ] The disclosure carries the measured wall-time cost.
- [ ] The disclosure is reachable from where a developer runs the suite.

## Cross-Scope Definition of Done

- [ ] `bug.md` status is updated from Confirmed to Fixed and then Verified.
- [ ] `report.md` carries pre-fix reproduction and post-fix proof.
- [ ] The separation from `BUG-016` is intact: no claim in this packet is offered as an
      explanation for the red deploy gate.
- [ ] `uservalidation.md` carries a filled Human Acceptance Record.
