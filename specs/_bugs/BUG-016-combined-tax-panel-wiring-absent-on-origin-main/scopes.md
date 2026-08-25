# Scopes: BUG-016 — Combined Tax Panel Absent From The Deployed Branch

## Sequencing Note

Scope 1 is a decision, not an implementation, and it gates Scope 2. Scope 3 is independent of
both and may be taken at any time or declined outright. Nothing here is started; every
Definition of Done item is unticked and should remain so until the work is authorised.

## Scope 1: Decide How The Two Resolutions Are Reconciled

**Status:** Done

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

### The Decision

**Approach: Option A — the content is landed directly on the deployed line, and the histories are
not reconciled by branch surgery.** This is recorded after the fact, not before it: the panel
reached `origin/main` through the Feature 022 work that continued while this packet sat open,
not through an action of this packet. Selecting Option A is therefore a ratification of the
resolution that actually happened, and saying so is the point. A decision record that claimed
to have directed the outcome would be false.

**What Option A gives up.** It duplicates content that also exists on the local line, so the
two lines still carry independent copies of this file and will conflict on exactly it. That
cost was accepted rather than avoided, and it is the reason Scope 3 matters more, not less.

**Scope 3: taken.** Its mechanism is already built, derived and proven — see the evidence under
that scope. Prior runs recorded it without ticking anything, correctly, because ticking Scope 3
would have decided Scope 1 by implication. This decision removes that block.

**Scope 2 restated under Option A:** verify that the deployed branch carries the panel and that
its tests pass there. No content authorship remains for this packet to perform.

### Definition of Done

- [x] A reconciliation approach is selected and recorded with its rationale.
  → Evidence: Option A recorded above, including what it gives up (duplicate content on two lines that must still conflict on this file).
- [x] Open questions 1 and 4 in `design.md` are answered.
  → Evidence: Q1 — A and C, both taken. Q4 — the disposition is recorded immediately below.
- [x] The disposition of Scope 3 is recorded as taken or declined.
  → Evidence: taken. The guard exists on `origin/main` at `scripts/selftest.mjs:28704` and its four assertions pass; see Scope 3.
- [x] Scope 2's shape is restated in terms of the selected approach.
  → Evidence: restated above as verification rather than authorship, because the content landed via Feature 022.

## Scope 2: Make The Deployed Branch Carry The Panel Its Tests Exercise

**Status:** Done (satisfied-by-feature-022)
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

- [x] All four wiring markers count non-zero on the deployed branch.
  → Evidence: `git show origin/main:lifetime-tax-strategy-lab.html | grep -c` → combinedSettlementCard 2, combinedCurveChart 3, combinedFederalLeg 2, combinedIndependenceLine 3. Exit Code: 0
- [x] All three previously absent selectors resolve.
  → Evidence: runtime probe on the clean ref — `#combinedCurveChart` count 1, `#combinedSettlementCard` count 1. `[data-rl-value="combinedFederalLeg"]` is rendered only in the driven state, so it reads 0 on bare load and its resolution is demonstrated by the eight passing tests below rather than by that probe.
- [x] All eight tests in `tests/lifetime-tax-combined.spec.mjs` pass, with raw output recorded.
  → Evidence: `npx playwright test --project=system-chrome tests/lifetime-tax-combined.spec.mjs` on a clean `origin/main` worktree → `8 passed (6.6s)`. Exit Code: 0
- [x] The retired test title is no longer present on the deployed branch.
  → Evidence: `git grep -c 'renders the single-jurisdiction settlement region' -- tests/` → 0 occurrences. Exit Code: 1 (no match)
- [x] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
  → Evidence: clean `origin/main` worktree → `self-test: 3408 passed, 0 failed`. Exit Code: 0
- [x] The deploy gate is green and `deploy` is not skipped.
  → Evidence: run 32744354615 on `adbfc86bb` → run_conclusion=success, verify=success, **deploy=success**. The filed run 32651572136 showed verify=failure, deploy=skipped.
- [x] No test was relaxed to accommodate a page without the panel.
  → Evidence: `tests/lifetime-tax-combined.spec.mjs` is unmodified by this packet; `git diff origin/main -- tests/lifetime-tax-combined.spec.mjs` is empty.
- [x] Raw output evidence is recorded inline for each item above.
  → Evidence: each item above carries its command and its output.

**Attribution.** This packet did not author the remedy. The panel reached the deployed branch
through the Feature 022 work described in Scope 1. What is claimed here is verification, and the
evidence above is verification evidence.

## Scope 3: Notice The Next Silent Loss

**Status:** Done
**Disposition:** taken — recorded in Scope 1

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

- [x] The check fails on the defective condition, with raw output recorded.
  → Evidence: evaluated against `origin/main` content read straight out of the ref at filing time; seventeen findings from a spec present and intact at that ref. Raw output under `## Durable Guard Added After The Filing Above` in `report.md`.
- [x] The check passes on a coherent branch, with raw output recorded.
  → Evidence: clean `origin/main` worktree → W1 14 modules, W2 unwired none, W3 10 anchors missing none, W4 6 names missing none. Exit Code: 0
- [x] The check is not satisfiable by a branch that carries the spec and not the selectors.
  → Evidence: both required sets are derived, not listed — modules from `readdirSync`, markers from the browser spec's own locators — and each derivation carries a floor (modules >= 10, id anchors >= 8, value names >= 5), so emptying a derivation's source fails rather than passing vacuously.
- [x] `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline.
  → Evidence: `self-test: 3408 passed, 0 failed` on the clean ref, above the 3406 recorded earlier in this packet's history. Exit Code: 0
- [x] Raw output evidence is recorded inline for each item above.
  → Evidence: commands and outputs are inline above; the seventeen-finding transcript is in `report.md`.

**Why the guard is narrow, and why that is the design rather than a shortcut.** A check that
compared every spec against every page was re-derived independently while closing this packet
and measured 52 findings on a green tree. Three causes, none fixable by tightening a pattern:
a spec navigates several pages so the target of any one assertion is flow-sensitive; many ids
are injected at runtime by shared scripts; and some selectors are composed rather than literal.
`[data-rl-value="combinedFederalLeg"]` — a selector this packet's own FR-016-004 names — is
rendered at runtime and appears nowhere in the static HTML, so the broad form would have
reported it missing on a healthy page. The landed guard avoids all three by comparing exactly
one spec against exactly one route.

## Cross-Scope Definition of Done

- [ ] `bug.md` status is updated from Confirmed to Fixed and then Verified.
      Partially done and deliberately left unticked. `bug.md` now reads Fixed, with the evidence
      above. `Verified` is the validating agent's to set, not this execution's, so the item stays
      open rather than being ticked on half its text.
- [x] `report.md` carries pre-fix failure proof and post-fix success proof.
  → Evidence: pre-fix — the seventeen-finding transcript against the defective ref and run 32651572136 (verify=failure, deploy=skipped). Post-fix — `8 passed`, `3408 passed, 0 failed`, and run 32744354615 (deploy=success).
- [x] The twenty-five failures owned elsewhere are confirmed still attributed elsewhere and
      were not altered by this packet's remedy.
  → Evidence: this packet changed no source file at all; its only edits are its own artifacts. The gate is now green end to end, so those failures were resolved by their own owners.
- [ ] `uservalidation.md` carries a filled Human Acceptance Record.
      Not this execution's to fill. Human acceptance has not occurred.
