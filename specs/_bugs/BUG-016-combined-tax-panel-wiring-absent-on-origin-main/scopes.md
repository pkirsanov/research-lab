# Scopes: BUG-016 — Combined Tax Panel Absent From The Deployed Branch

## Sequencing Note

Scope 1 is a decision, not an implementation, and it gates Scope 2. Scope 3 is independent of
both and may be taken at any time or declined outright. Nothing here is started; every
Definition of Done item is unticked and should remain so until the work is authorised.

## Scope 1: Decide How The Two Resolutions Are Reconciled

**Status:** [ ] Not started

### Problem This Scope Resolves

The wiring exists on one line and not the other. Restoring it is trivial in content and
non-trivial in branch state, and the branch decision was explicitly withheld from the filing
run. Until the owner selects Option A, B, or a combination from `design.md`, Scope 2 has no
defined shape.

This scope is **not agent-dischargeable**. No evidence selects between the options; the
choice depends on how the operator wants the two lines to relate.

### Gherkin Scenarios

```gherkin
Feature: A reconciliation approach is selected before content is changed
  Scenario: The owner selects an approach
    Given the two branch tips hold different resolutions of the same page
    And the wiring is absent at their merge base
    When the owner selects a reconciliation approach
    Then the selection is recorded with its rationale
    And Scope 2 is defined in terms of that selection

  Scenario: The selection accounts for recurrence
    Given four merges have each discarded the wiring
    When the owner selects a reconciliation approach
    Then the selection states whether Scope 3 is taken or declined
    And a declined Scope 3 is recorded as a decision, not an omission
```

### Implementation Plan

1. Read `design.md` Remedy Options and Open Questions.
2. Select an approach and record it, with the rationale, in this scope.
3. State whether Scope 3 is taken or declined.

### Test Plan

| Type | Coverage |
|---|---|
| None | This scope produces a recorded decision, not behaviour. There is nothing to execute. |

### Definition of Done

- [ ] A reconciliation approach is selected and recorded with its rationale.
- [ ] Open questions 1 and 4 in `design.md` are answered.
- [ ] The disposition of Scope 3 is recorded as taken or declined.
- [ ] Scope 2's shape is restated in terms of the selected approach.

## Scope 2: Make The Deployed Branch Carry The Panel Its Tests Exercise

**Status:** [ ] Not started
**Depends on:** Scope 1

### Problem This Scope Resolves

Six tests assert against three selectors that do not exist on the deployed page. The
computation module is already deployed; only the markup and the script tag that mount it are
absent.

### Gherkin Scenarios

```gherkin
Feature: The deployed page carries the combined settlement panel
  Scenario: The curve chart resolves
    Given the deployed revision of the lifetime tax strategy lab
    When a test waits for the combined curve chart
    Then the element is found within the assertion budget

  Scenario: The unavailability marker resolves
    Given a pack year mismatch and a refusing state leg
    When a test waits for the combined settlement card unavailability marker
    Then the element is found and carries the expected reason code

  Scenario: The federal leg value resolves
    Given the deployed revision of the lifetime tax strategy lab
    When a test reads the combined federal leg value
    Then the read returns without exhausting the test budget

  Scenario: The whole spec passes, not only the quotable failure
    Given the three absent selectors are restored
    When the combined spec is run against the deployed revision
    Then every test in it passes, not only the one that timed out at thirty seconds
```

### Implementation Plan

1. Apply the approach selected in Scope 1.
2. Confirm all four wiring markers are non-zero on the deployed branch.
3. Confirm the deployed spec revision matches the deployed page revision, resolving the
   retired test title.
4. Run the combined spec against the deployed revision.

### Test Plan

| Type | Coverage |
|---|---|
| Browser | All eight tests in `tests/lifetime-tax-combined.spec.mjs` pass against the deployed revision. |
| Selftest | `node scripts/selftest.mjs` reports zero failures and no fewer assertions than the recorded baseline. |
| Gate | The deploy workflow's `verify` job passes and `deploy` runs rather than reporting `skipped`. |

### Definition of Done

- [ ] All four wiring markers count non-zero on the deployed branch.
- [ ] All three previously absent selectors resolve.
- [ ] All eight tests in `tests/lifetime-tax-combined.spec.mjs` pass, with raw output recorded.
- [ ] The retired test title is no longer present on the deployed branch.
- [ ] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
- [ ] The deploy gate is green and `deploy` is not skipped.
- [ ] No test was relaxed to accommodate a page without the panel.
- [ ] Raw output evidence is recorded inline for each item above.

## Scope 3: Notice The Next Silent Loss

**Status:** [ ] Not started
**Disposition:** undecided — Scope 1 records whether this is taken or declined

### Problem This Scope Resolves

Four merges each discarded the wiring, each without a conflict and each without a diagnostic.
Restoring the content without addressing recurrence restores a value the next merge may drop.

### Gherkin Scenarios

```gherkin
Feature: A branch that loses an implementation says so
  Scenario: A spec is present and its target selectors are not
    Given a spec file present on the branch
    And a page it targets that lacks the selectors the spec asserts
    When the coherence check runs
    Then the condition is reported before publication

  Scenario: A coherent branch is not obstructed
    Given a spec file whose target selectors are all present
    When the coherence check runs
    Then it reports nothing and does not fail
```

### Implementation Plan

1. Decide the check's scope, narrowly enough to stay cheap and quiet.
2. Establish the check fails on the current condition and passes on a coherent branch.
3. Wire it where it runs before publication.

### Test Plan

| Type | Coverage |
|---|---|
| Adversarial | The check fails against a branch state carrying the spec without the selectors. |
| Negative | The check passes against a coherent branch and reports nothing. |
| Selftest | `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline. |

### Definition of Done

- [ ] The check fails on the defective condition, with raw output recorded.
- [ ] The check passes on a coherent branch, with raw output recorded.
- [ ] The check is not satisfiable by a branch that carries the spec and not the selectors.
- [ ] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
- [ ] Raw output evidence is recorded inline for each item above.

## Cross-Scope Definition of Done

- [ ] `bug.md` status is updated from Confirmed to Fixed and then Verified.
- [ ] `report.md` carries pre-fix failure proof and post-fix success proof.
- [ ] The twenty-five failures owned elsewhere are confirmed still attributed elsewhere and
      were not altered by this packet's remedy.
- [ ] `uservalidation.md` carries a filled Human Acceptance Record.
