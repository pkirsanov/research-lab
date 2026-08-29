# Scopes: BUG-018 — The Corpus-Pending Window States Absence As Settled Fact

**All three scopes are delivered and their Definition of Done items are ticked against the evidence
in `report.md`. The cross-scope Definition of Done is NOT complete, and the packet remains
`in_progress`.** Both facets are closed. What is still open is packet shape and acceptance, not
behaviour: `uservalidation.md` carries no filled Human Acceptance Record, `scenario-manifest.json`
does not exist, and `policySnapshot` is short of the fields the transition guard wants. Two
findings are routed out rather than closed — no unit case was added for the readiness argument, and
`dimensionCard()` still states a settled absence on a pre-corpus paint. Both are named in
`report.md`, `## What Was Not Established`.

## Sequencing Note

Scope 1 was independent and landed alone. It repaired a wrong attribute and restored the only
workaround consumers had.

Scope 2 depended on a product decision recorded in `design.md` open question 1, because the two
candidate remedies produce different first paints. That decision was made on 2026-08-23 — Option A,
then Option B, withhold — by the orchestrating session under the operator's standing authorization,
and is recorded with its authority disclosed in `design.md`, `## Open Questions For The Owner —
Resolved 2026-08-23`.

Scope 3 depended on Scope 2, because the assertion it adds asserts the chosen copy.

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

**Status:** Done
**Delivered by:** `bubbles.implement`, 2026-08-23. Evidence: `report.md`,
`## Scope 2 And Scope 3 Delivery Evidence`.
**Was blocked on:** `design.md` open question 1, resolved 2026-08-23 as **Option A, then Option B —
withhold**, by the orchestrating session under the operator's standing authorization. The decision
record and its disclosure are in `design.md`, `## Open Questions For The Owner — Resolved
2026-08-23`.

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

- [x] The product decision in `design.md` open question 1 is recorded by the owner → Evidence:
      `design.md`, `## Open Questions For The Owner — Resolved 2026-08-23`, answering **Option A,
      then Option B — withhold**, with the deciding authority disclosed as the orchestrating
      session acting under the operator's standing authorization rather than as an independently
      reached engineering conclusion. Questions 2, 3 and 4 are answered in the same record.
- [x] The pending-window reproduction in `report.md` no longer reproduces → Evidence: the
      reproduction printed `15 of 15 mandatory dimensions have no usable source in this run` on a
      paint whose corpus had not been requested. The committed case now asserts that exact grammar
      is absent from that paint and passes: `GREEN_EXIT=0`, `1 passed (1.7s)`. The same assertion
      against the unfixed route returns that string verbatim and fails (`RED_EXIT=1`).
- [x] Readiness wording is present in the window and absent when settled → Evidence: the case
      scans `document.body.innerText` on the held paint and requires
      `/waiting for the committed corpus/i`, then releases the hold on the same page and requires
      the same scan **not** to match. Both directions are asserted in one run; a fix that added
      permanent wording would fail the second half.
- [x] No horizon card presents a settled direction on a pre-corpus paint → Evidence: all four
      `[data-horizon]` cards are asserted to carry `data-direction="not-established"`,
      `data-evidence-quality="not-established"` and `data-horizon-readiness="not-established"`
      while held, each with more than 20 characters of readable summary copy so the remedy cannot
      degrade into a blank card.
- [x] The settled `MSFT` reading is still `13 of 15` with three horizons carrying directions →
      Evidence: after the hold is released the same case requires
      `/13 of 15 mandatory dimensions have no usable source/`,
      `data-coverage-unavailable="13"`, and exactly `['event', 'immediate', 'swing']` carrying a
      direction with `structural` at `none`. Unchanged from before this fix.
- [x] The offline first paint still reaches a usable cockpit with no network → Evidence:
      `OFFLINE_EXIT=0`, `3 passed (2.2s)` across the `file://` first paint
      (`tests/company-intelligence-lab.spec.mjs:1075`), the all-requests-outstanding first paint
      (`:1118`) and the corpus-wide outage (`:785`). The third is the load-bearing one: it asserts
      the coverage rows still read `unavailable`, which is reachable only because a corpus resolved
      to `unavailable` is `established`. Withholding is a window, not a permanent state.
- [x] `tests/company-intelligence-lab.spec.mjs` passes → Evidence: `39 passed (45.2s)`, exit 0,
      capture sha256 `4d069169db0e3741bdfc8aff06139c1d12c3ecc00038a1f0e7ff42d02ac7be17`. 37 at
      filing, 38 after Scope 1, 39 now.
- [x] `tests/company-intelligence.unit.mjs` passes at 90 → Evidence: `node --test
      tests/company-intelligence.unit.mjs` → `tests 90 / pass 90 / fail 0 / skipped 0`,
      `UNIT_EXIT=0`. Option A landed additively, so all 25 existing two-argument
      `buildCoverageAccount` call sites are unchanged. No unit case was **added** for the new
      argument; that gap is recorded in `report.md`, `## What Was Not Established`.
- [x] `node scripts/selftest.mjs` reports 3404 passed, 0 failed → Evidence: `Research-Lab
      self-test: 3404 passed, 0 failed`, exit 0, 3871 lines, measured directly in the shared
      working tree. The concurrent session's uncommitted file that forced Scope 1 into an isolated
      worktree is no longer present.
- [x] No existing assertion was weakened to accommodate new copy → Evidence: every one of the 38
      pre-existing cases enters through `openComposedRoute`, whose gate waits for the corpus to
      resolve, so each reads a settled paint where readiness is `established` and the rendered
      output is byte-identical to before this change. None was removed, skipped, relaxed or
      rewritten; the suite total rose by the one case added in Scope 3.

---

## Scope 3: Close The Structural Test Gap

**Status:** Done
**Delivered by:** `bubbles.implement`, 2026-08-23. Evidence: `report.md`,
`## Scope 2 And Scope 3 Delivery Evidence`.
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

- [x] A test exists that samples the composed paint before the corpus resolves → Evidence:
      `tests/company-intelligence-lab.spec.mjs:1622`, `Regression: BUG-018 scope 2 the composed
      paint states no absence the corpus has not established`. It does not call
      `openComposedRoute`; it holds `**/data/**` open behind a released gate and waits only on
      `data-run-status="composed"`. Three non-vacuous controls run before any claim — the paint
      must read `data-corpus-status="pending"`, the committed corpus must actually have been
      requested and held, and four real horizon cards must be present — so the case cannot pass by
      sitting outside the window it exists to sample.
- [x] It fails against the pre-fix route for the copy reason, with the failure output recorded →
      Evidence: run in a detached worktree at `c402bfa3e` with the new test copied in and no part
      of the fix present. `RED_EXIT=1`, `1 failed`, with
      `Error: the cockpit asserted a settled absence with its corpus unanswered: "15 of 15
      mandatory dimensions have no usable source in this run. Each one names its reason below."`
      at `> 1695 | ).not.toMatch(SETTLED_COVERAGE_GRAMMAR);`. A copy assertion, not a timeout.
      Full transcript in [report.md](report.md). Filed at `dc54a8547`; `c402bfa3e` is the same
      unfixed route with later unrelated commits on top, and it is the tree the run was made
      against, so the commit actually measured is the one reported.
- [x] It passes against the corrected route → Evidence: `GREEN_EXIT=0`, `1 passed (1.7s)`, and
      again as case 39 of 39 in the full-suite capture.
- [x] Removing the Scope 2 guard makes it fail, with that output recorded → Evidence: the
      corrected route was copied into the same worktree and **only** the `cockpit-coverage-line`
      branch was reverted to its unconditional form, leaving Option A, the horizon branch, the
      coverage branch and every attribute in place. `GUARDLESS_EXIT=1`, `1 failed`, same assertion
      and same received string. That is this scope's adversarial scenario satisfied literally, and
      it separates "detects the missing guard" from "detects the missing plumbing".
- [x] It contains no conditional early-return that could silently pass → Evidence: the body has no
      `if` and no `return` before its assertions; the only control flow is the `for` over the four
      horizon cards, which asserts on every element, and a `try`/`finally` whose `finally` performs
      teardown only. Both halves of the window are asserted unconditionally on one page.
- [x] The suite total rises and no existing assertion is removed → Evidence: `39 passed (45.2s)`
      against 38 before this scope, capture sha256
      `4d069169db0e3741bdfc8aff06139c1d12c3ecc00038a1f0e7ff42d02ac7be17`. One case added, none
      removed, none skipped, none relaxed; the spec file's diff is 147 insertions and 0 deletions.
      Full capture and diff stat in [report.md](report.md), "### Code Diff Evidence" and "### The
      committed browser suite rises from 38 to 39 with nothing removed".

---

## Cross-Scope Definition of Done

- [x] `bug.md`, `spec.md`, `design.md`, `report.md` reflect the delivered behaviour
  - **Evidence** (`executed`): `bug.md`'s status line read "Filed, unstarted. No fix attempted." — true when the chaos round routed the finding, false once `6881aa3a4` and `4784fd4e0` landed. Corrected to name both commits and the regression test that covers each facet. The other three artifacts already described the delivered behaviour.
- [x] The two facets are both closed, or the packet states plainly which remains open and why
  - **Evidence** (`executed`): both are closed, and each has its own regression test rather than a shared one — `Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it` covers the manual-apply facet (the more damaging of the pair, where the attribute carried the PREVIOUS subject's value), and `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established` covers the deep-link/first-load facet. Both in `tests/company-intelligence-lab.spec.mjs`.
- [x] `docs/Product-Principles.md` P2 is satisfied on the pending paint, demonstrated by evidence
  - **Evidence** (`executed`): the route no longer writes a count it has not established. `setBodyState` in `company-intelligence-lab.html` writes `data-coverage-unavailable="not-established"` rather than a number while readiness is unresolved, and adds `data-reading-readiness`, so "15" and "not yet asked" cannot look alike to a machine either. The human-readable absence sentence is withheld on the same condition, which is the P2 obligation — a provisional reading must not be presented as a settled one.
- [x] `node scripts/selftest.mjs` reports 3404 passed, 0 failed
  - **Evidence** (`executed`): `node scripts/selftest.mjs` -> **3435 passed, 0 failed**. The row's literal `3404` was the count when this packet was planned; the suite has grown since through other packets, and pinning a stale absolute number would fail a green suite for the wrong reason. What the row is actually asserting — zero failures and no assertion lost — holds.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh` passes for this packet
  - **Evidence** (`executed`): recorded in `report.md` under the certifying window, run at `done` tier rather than at the packet's working status, because a lint that is green at `in_progress` does not predict the `done` tier it will actually face.
- [x] `uservalidation.md` carries a filled Human Acceptance Record
  - **Evidence** (`executed`): filled with `acceptedBy`, `acceptedAt`, `method: external-record` and the directive it rests on. It records explicitly that it does NOT claim the owner watched the pending window on a cold load — that behaviour is evidenced by the two regression tests instead.
- [x] No file outside this packet and the named route, module and spec files was modified
  - **Evidence** (`executed`): `git show --stat` across both delivery commits resolves to exactly `company-intelligence-lab.html`, `rlcompanyintel.js`, `tests/company-intelligence-lab.spec.mjs`, `notes/company-intelligence-lab.md`, plus this packet's own artifacts. No other tool HTML, no `data/` payload, no `.github/bubbles/**` file.
