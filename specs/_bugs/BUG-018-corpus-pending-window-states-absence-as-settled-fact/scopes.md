# Scopes: BUG-018 — The Corpus-Pending Window States Absence As Settled Fact

**Scope 1 is delivered and its six Definition of Done items are ticked against the evidence in
`report.md`, `## Scope 1 Delivery Evidence`. Every Scope 2, Scope 3 and cross-scope item below is
unticked, and every one of them should be.** Facet 2 is closed; facet 1 is not, and the packet
remains `in_progress`.

## Sequencing Note

Scope 1 is independent and can land alone. It repairs a wrong attribute and restores the only
workaround consumers have today.

Scope 2 depends on a product decision recorded in `design.md` open question 1. It must not begin
before that decision is made, because the two candidate remedies produce different first paints.

Scope 3 depends on Scope 2, because the assertion it adds must assert the chosen copy.

---

## Scope 1: Make `data-corpus-status` Describe The Subject On Screen

**Status:** Done
**Delivered by:** `bubbles.implement`, 2026-08-23. Evidence: `report.md`,
`## Scope 1 Delivery Evidence`.

### Problem This Scope Resolves

During a manual apply, the synchronous paint copies the **previous** subject's `corpusStatus` onto
the body, so the attribute can read `loaded` for a subject whose corpus has not been requested. A
consumer following the committed suite's own readiness convention is therefore unprotected: its
wait returns immediately on a stale value.

Mechanism and lines: `design.md`, "Facet 2".

### Gherkin Scenarios

```gherkin
Feature: The corpus attribute describes the current subject

  Scenario: Applying a new subject from a settled page
    Given the route has settled on a subject with data-corpus-status "loaded"
    When the operator applies a different subject
    And the body is sampled in the same task as the click handler
    Then data-corpus-status reads "pending"
    And it does not read "loaded"

  Scenario: The attribute recovers when that subject's corpus resolves
    Given a subject has just been applied and its corpus is in flight
    When the corpus resolves
    Then data-corpus-status reads "loaded" or "unavailable"

  Scenario: A refused entry does not reset the attribute for the standing subject
    Given the route has settled on a subject with data-corpus-status "loaded"
    When the operator enters a value the route refuses
    Then the standing subject's corpus state is not misreported as pending
```

### Implementation Plan

1. Move the `corpusStatus = "pending"` reset so it precedes the synchronous compose-and-render in
   `applySubject()`, rather than executing inside `loadCorpus()` afterwards.
2. Confirm the refusal path at `company-intelligence-lab.html:1073-1083` still reports the standing
   subject's state correctly, since `renderRefusal` also calls `setBodyState`.
3. Confirm no other caller depends on the reset happening inside `loadCorpus()`.

### Test Plan

| Type | What it proves |
| --- | --- |
| Unit | Not applicable: the ordering lives in the route, not the module |
| Browser (Playwright) | Sampling in the click task yields `pending`; the attribute recovers on resolve; the refusal path is unaffected |
| Regression | The 37 existing assertions in `tests/company-intelligence-lab.spec.mjs` still pass |

### Definition of Done

- [x] The stale-attribute reproduction in `report.md` no longer reproduces. → Evidence: sampling
      the body in the same task as the click handler now yields `pending`, where the recorded
      reproduction yielded `loaded` for a subject whose corpus had never been requested. Run and
      output in [report.md](report.md), "The same case passes after the change".
- [x] A browser test fails before the change and passes after, for the attribute reason. →
      Evidence: `npx --no-install playwright test --config=playwright.config.mjs
      --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1"` →
      `RED_EXIT=1` on `Expected: "pending" / Received: "loaded"`, which is the attribute assertion
      and not a timeout, then `GREEN_EXIT=0`, `1 passed (4.4s)`. Both transcripts in
      [report.md](report.md).
- [x] `tests/company-intelligence-lab.spec.mjs` passes at 37 or more. → Evidence: `38 passed
      (45.8s)`, exit 0, capture sha256 `9e4f1aca55fd662005bf1748e1f84a5c3f261a25c8a7180a0ca002c4a2b18686`.
      The count rose by the added case; no existing assertion was removed or weakened.
- [x] `tests/company-intelligence.unit.mjs` passes at 90. → Evidence: `node --test
      tests/company-intelligence.unit.mjs` → `tests 90 / pass 90 / fail 0 / skipped 0`,
      `UNIT_EXIT=0`, unchanged because readiness is still not an input to `rlcompanyintel.js`.
- [x] `node scripts/selftest.mjs` reports 3404 passed, 0 failed. → Evidence: `Research-Lab
      self-test: 3404 passed, 0 failed`, exit 0, measured at `HEAD` (`6a6f8a36e`) plus this
      scope's two files in a detached worktree, because the shared working tree carries a
      concurrent session's uncommitted `lifetime-tax-strategy-lab.html` whose `TP-05-01` and
      `TP-05-09` fail independently of this change. Both runs in [report.md](report.md).
- [x] The refusal path is exercised and unaffected. → Evidence: the new case asserts both refusal
      shapes — `C025-INPUT-REFUSED` from the shared input rule and `C025-IDENTITY-UNRESOLVED` from
      the resolver — each required to leave the standing subject's `data-corpus-status` at the
      value it held before the refused entry rather than resetting it to `pending`.

---

## Scope 2: Stop Asserting Absence The Route Has Not Established

**Status:** Not Started
**Blocked on:** `design.md` open question 1, a product decision

### Problem This Scope Resolves

The cockpit prints `N of 15 mandatory dimensions have no usable source in this run` and four
`none` / `absent` horizon cards on a paint that precedes the corpus request, with no user-visible
readiness wording. The settled reading for the same subject differs.

### Gherkin Scenarios

```gherkin
Feature: A composed reading states only what it has established

  Scenario: The pending window does not print a settled absence count
    Given the committed corpus is held for 2500 milliseconds
    When the route reaches its first composed paint for a deep-linked subject
    Then the cockpit does not assert a definite count of dimensions with no usable source

  Scenario: The pending window is visible without inspecting an attribute
    Given the committed corpus is held for 2500 milliseconds
    When the rendered body text is scanned on the composed paint
    Then readiness wording is present
    And that wording is absent once the corpus resolves

  Scenario: Horizon directions are not asserted against an unresolved corpus
    Given the committed corpus is held for 2500 milliseconds
    When the horizon cards are read on the composed paint
    Then no card presents a settled direction as a finding

  Scenario: The settled reading is unchanged
    Given the corpus has resolved for the covered subject
    Then the cockpit states 13 of 15 mandatory dimensions have no usable source
    And three of the four horizons carry a direction

  Scenario: A corpus that resolves to unavailable is still a settled reading
    Given every committed corpus request fails
    When the corpus state resolves to unavailable
    Then the reading is presented as settled, not as perpetually pending
```

### Implementation Plan

1. Apply the remedy selected in `design.md` open question 1 (withhold, or mark provisional).
2. If option A is selected in open question 3, thread readiness into `compose()` and
   `buildCoverageAccount` first, additively, so existing module callers are unchanged.
3. Apply the same treatment to the coverage sentence and to the horizon cards, so the two cannot
   disagree.
4. Preserve the offline first paint: a corpus resolved to `unavailable` is settled and must render
   as such.
5. Resolve FR-018-005: document one predicate over body attributes that distinguishes a settled
   paint, and use it.

### Test Plan

| Type | What it proves |
| --- | --- |
| Unit | If option A is taken: the account carries a not-established state and defaults to today's behaviour when readiness is absent |
| Browser (Playwright) | The pending window prints no settled count; readiness wording is present then absent; horizon cards are not settled; the settled reading is unchanged; a failed corpus still reads settled |
| Regression | Existing browser and unit suites pass unchanged; `scripts/selftest.mjs` holds its baseline |

### Definition of Done

- [ ] The product decision in `design.md` open question 1 is recorded by the owner
- [ ] The pending-window reproduction in `report.md` no longer reproduces
- [ ] Readiness wording is present in the window and absent when settled
- [ ] No horizon card presents a settled direction on a pre-corpus paint
- [ ] The settled `MSFT` reading is still `13 of 15` with three horizons carrying directions
- [ ] The offline first paint still reaches a usable cockpit with no network
- [ ] `tests/company-intelligence-lab.spec.mjs` passes
- [ ] `tests/company-intelligence.unit.mjs` passes at 90
- [ ] `node scripts/selftest.mjs` reports 3404 passed, 0 failed
- [ ] No existing assertion was weakened to accommodate new copy

---

## Scope 3: Close The Structural Test Gap

**Status:** Not Started
**Depends on:** Scope 2

### Problem This Scope Resolves

All 37 committed browser assertions enter through `openComposedRoute`
(`tests/company-intelligence-lab.spec.mjs:42`), which waits for
`data-corpus-status ∈ {loaded, unavailable}` at `tests/company-intelligence-lab.spec.mjs:58-59`.
The fixture waits the defect out, so the pending window is never sampled. Without a case that
enters the window on purpose, this defect can return silently.

### Gherkin Scenarios

```gherkin
Feature: The pending window is covered by the committed suite

  Scenario: A test samples the composed paint before the corpus resolves
    Given a test that does not enter through the settled-state fixture
    When it holds the committed corpus and samples the composed paint
    Then it asserts the copy on that paint is not a settled absence claim

  Scenario: The new case detects a reintroduction
    Given the corrected route
    When the pre-corpus guard is removed
    Then the new case fails
```

### Implementation Plan

1. Add a case that opens the route with the corpus held and samples the composed paint without
   using `openComposedRoute`.
2. Assert on the copy, not only on attributes, so the assertion tracks what a reader sees.
3. Verify the case fails against the code at `dc54a8547` for the copy reason and not a timeout.

### Test Plan

| Type | What it proves |
| --- | --- |
| Browser (Playwright) | The pending window is asserted directly |
| Adversarial | With the Scope 2 guard removed, the new case fails |

### Definition of Done

- [ ] A test exists that samples the composed paint before the corpus resolves
- [ ] It fails against `dc54a8547` for the copy reason, with the failure output recorded
- [ ] It passes against the corrected route
- [ ] Removing the Scope 2 guard makes it fail, with that output recorded
- [ ] It contains no conditional early-return that could silently pass
- [ ] The suite total rises and no existing assertion is removed

---

## Cross-Scope Definition of Done

- [ ] `bug.md`, `spec.md`, `design.md`, `report.md` reflect the delivered behaviour
- [ ] The two facets are both closed, or the packet states plainly which remains open and why
- [ ] `docs/Product-Principles.md` P2 is satisfied on the pending paint, demonstrated by evidence
- [ ] `node scripts/selftest.mjs` reports 3404 passed, 0 failed
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh` passes for this packet
- [ ] `uservalidation.md` carries a filled Human Acceptance Record
- [ ] No file outside this packet and the named route, module and spec files was modified
