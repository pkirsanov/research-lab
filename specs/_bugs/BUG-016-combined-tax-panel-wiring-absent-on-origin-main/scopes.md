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
# SCN-BUG016-01
  Scenario: The owner selects an approach
    Given the two branch tips hold different resolutions of the same page
    And the wiring is absent at their merge base
    When the owner selects a reconciliation approach
    Then the selection is recorded with its rationale
    And Scope 2 is defined in terms of that selection

# SCN-BUG016-02
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

### Implementation Files

- `lifetime-tax-strategy-lab.html` is the deployed route whose panel wiring reflects the selected approach.
- `rltaxcombined.js` is the combined-settlement module loaded by that route.
- `scripts/selftest.mjs` is the recurrence guard selected by taking Scope 3.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` is the live consumer proof for the selected deployed outcome.

### Test Plan

| Type | Coverage |
|---|---|
| None | This scope produces a recorded decision, not behaviour. There is nothing to execute. |
| E2E | Scenario-specific E2E consumer proof executes `tests/lifetime-tax-combined.spec.mjs` test `Regression: SCN-022-013 the combined total is the sum of two independent settlements`; the W1-W5 BUG-016 group in `scripts/selftest.mjs` maps the recurrence disposition. |

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

- [x] The owner selects an approach: a reconciliation approach is recorded with its rationale, and the scenario-specific E2E consumer regression for SCN-BUG016-01 passes.
  → Evidence: Option A recorded above, including what it gives up (duplicate content on two lines that must still conflict on this file). `report.md` `## Independent Verification Round` records the combined browser file green.
- [x] Open questions 1 and 4 in `design.md` are answered, and the broader combined-panel E2E regression suite passes.
  → Evidence: Q1 — A and C, both taken. Q4 — the disposition is recorded immediately below. `report.md` independently records `green-summary: 8 passed (4.1s)`.
- [x] The selection accounts for recurrence: the disposition of Scope 3 is recorded as taken or declined.
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
# SCN-BUG016-03
  Scenario: The curve chart resolves
    Given the deployed revision of the lifetime tax strategy lab
    When a test waits for the combined curve chart
    Then the element is found within the assertion budget

# SCN-BUG016-04
  Scenario: The unavailability marker resolves
    Given a pack year mismatch and a refusing state leg
    When a test waits for the combined settlement card unavailability marker
    Then the element is found and carries the expected reason code

# SCN-BUG016-05
  Scenario: The federal leg value resolves
    Given the deployed revision of the lifetime tax strategy lab
    When a test reads the combined federal leg value
    Then the read returns without exhausting the test budget

# SCN-BUG016-06
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

### Implementation Files

- `lifetime-tax-strategy-lab.html` owns the panel markup, module tag, curve anchor, refusal marker, and federal-leg projection.
- `rltaxcombined.js` computes the combined settlement consumed by the route.
- `scripts/selftest.mjs` carries the route-to-test coherence guard.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` carries all eight production-route regressions.

### Test Plan

| Type | Coverage |
|---|---|
| Browser | All eight tests in `tests/lifetime-tax-combined.spec.mjs` pass against the deployed revision. |
| Selftest | `node scripts/selftest.mjs` reports zero failures and no fewer assertions than the recorded baseline. |
| Gate | The deploy workflow's `verify` job passes and `deploy` runs rather than reporting `skipped`. |
| E2E | Scenario-specific E2E regressions execute `tests/lifetime-tax-combined.spec.mjs` tests `Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction`, `Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`, `Regression: SCN-022-013 the combined total is the sum of two independent settlements`, and the entire eight-test file for SCN-BUG016-03 through SCN-BUG016-06. |

### Definition of Done

- [x] All four wiring markers count non-zero on the deployed branch.
  → Evidence: `git show origin/main:lifetime-tax-strategy-lab.html | grep -c` → combinedSettlementCard 2, combinedCurveChart 3, combinedFederalLeg 2, combinedIndependenceLine 3. Exit Code: 0
- [x] The curve chart resolves within the assertion budget, the unavailability marker resolves for a pack-year mismatch and a refusing state leg, and the federal leg value resolves without exhausting the test budget; these are the scenario-specific E2E regressions for SCN-BUG016-03 through SCN-BUG016-05. → Evidence: the clean-ref runtime probe records `#combinedCurveChart` and `#combinedSettlementCard` count 1; the curve, pack-year-mismatch, combined-total, and refusing-state-leg browser tests pass in the eight-test run below and drive `[data-rl-value="combinedFederalLeg"]`.
- [x] The whole spec passes, not only the quotable failure: the broader combined-panel E2E regression suite of all eight tests in `tests/lifetime-tax-combined.spec.mjs` passes, with raw output recorded.
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
# SCN-BUG016-07
  Scenario: A spec is present and its target selectors are not
    Given a spec file present on the branch
    And a page it targets that lacks the selectors the spec asserts
    When the coherence check runs
    Then the condition is reported before publication

# SCN-BUG016-08
  Scenario: A coherent branch is not obstructed
    Given a spec file whose target selectors are all present
    When the coherence check runs
    Then it reports nothing and does not fail
```

### Implementation Plan

1. Decide the check's scope, narrowly enough to stay cheap and quiet.
2. Establish the check fails on the current condition and passes on a coherent branch.
3. Wire it where it runs before publication.

### Implementation Files

- `scripts/selftest.mjs` implements the W1-W5 route/module/selector coherence guard.
- `lifetime-tax-strategy-lab.html` is the guarded route.

### Consumer Proof Files

- `tests/lifetime-tax-combined.spec.mjs` supplies the derived selector inventory and the live consumer canary.

### Test Plan

| Type | Coverage |
|---|---|
| Adversarial | The check fails against a branch state carrying the spec without the selectors. |
| Negative | The check passes against a coherent branch and reports nothing. |
| Selftest | `node scripts/selftest.mjs` reports zero failures at or above the recorded baseline. |
| E2E | Scenario-specific E2E consumer proof runs the eight tests in `tests/lifetime-tax-combined.spec.mjs` while the W1-W5 group in `scripts/selftest.mjs` checks SCN-BUG016-07 and SCN-BUG016-08 against the same route and selector inventory. |

### Definition of Done

- [x] A spec present while its target selectors are absent is reported before publication: the check fails on the defective condition, and its scenario-specific E2E consumer regression remains mapped to `tests/lifetime-tax-combined.spec.mjs`, with raw output recorded.
  → Evidence: evaluated against `origin/main` content read straight out of the ref at filing time; seventeen findings from a spec present and intact at that ref. Raw output under `## Durable Guard Added After The Filing Above` in `report.md`; the same report records the combined browser file green after repair.
- [x] A coherent branch is not obstructed: the check reports nothing and passes, and the broader combined-panel E2E regression suite passes, with raw output recorded.
  → Evidence: clean `origin/main` worktree → W1 14 modules, W2 unwired none, W3 10 anchors missing none, W4 6 names missing none. Exit Code: 0. `report.md` independently records all eight combined browser tests passing.
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

- [x] `bug.md` status is updated from Confirmed to Fixed and then Verified.
      Both transitions have now occurred. `bug.md` read `Fixed` on the implementing round's evidence
      and reads `Verified` on an independent round's, recorded under `report.md`
      § Independent Verification Round. That round wrote no part of this packet and re-derived every
      premise rather than inheriting one.
      A later round re-measured the three premises the closing claim rests on, independently rather
      than by inheritance, and all three hold: `gh run view 32744354615` reports
      `conclusion=success` with `verify=success` and `deploy=success`; `combinedFederalLeg` is
      present at the deployed ref, where `HEAD` and `origin/main` are the same commit; and `W1`-`W4`
      all pass. Perturbation went further than presence — `W2` and `W3` were each proven to turn red
      when a module tag or an anchor id is dropped, and `W2` names the module. That round also
      found, and recorded in `report.md` § Finding, that `W4` does **not** discriminate for three of
      its six names, `combinedFederalLeg` among them, because those names are also quoted in
      `SIMPLE_FIELDS` and `W4` matches the name anywhere in the route rather than at the emitting
      call.
      **Superseded by the independent round.** That blind spot was repaired, and `W5` was added for
      the case a repaired `W4` still could not see. Both repairs were re-derived here rather than
      accepted: `W2`, `W3`, `W5` and `W4` on all four of its call shapes each turn red under
      mutation with the revert hash-verified, and the three previously-blind names were probed
      individually rather than sampled. Under the `SIMPLE_FIELDS` mutation, `W4` returns exit 7 —
      no discrimination — which is the measurement that shows `W5` is not redundant. `Verified` is
      still a certification claim, and this packet is the first in the repository to occupy that
      state; it does so on a round that wrote none of the work it checked.
- [x] `report.md` carries pre-fix failure proof and post-fix success proof.
  → Evidence: pre-fix — the seventeen-finding transcript against the defective ref and run 32651572136 (verify=failure, deploy=skipped). Post-fix — `8 passed`, `3408 passed, 0 failed`, and run 32744354615 (deploy=success).
- [x] The twenty-five failures owned elsewhere are confirmed still attributed elsewhere and
      were not altered by this packet's remedy.
  → Evidence: this packet changed no source file at all; its only edits are its own artifacts. The gate is now green end to end, so those failures were resolved by their own owners.
- [x] `uservalidation.md` carries a filled Human Acceptance Record.
  → Evidence: filled at the operator's instruction "validated BUG-016 and BUG-017, sign them" —
    `acceptedBy: operator`, `acceptedAt: 2026-08-25T22:22:04Z`, `method: human-interactive`,
    the method the registry defines as a human exercising the delivered behaviour in a live
    session. One acceptance act covered both packets, so the record declares `acceptanceAct`,
    the packets it covers, and a basis specific to this one. The Checklist remains unticked and
    no status moved; this row asserts the record exists and is filled, nothing further.
