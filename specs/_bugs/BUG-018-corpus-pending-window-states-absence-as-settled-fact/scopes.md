# Scopes: BUG-018 — The Corpus-Pending Window States Absence As Settled Fact

**Scopes 1–3 remain recorded as Done against their historical execution evidence in `report.md`.
Scope 4 is Done against its executed publication-boundary evidence. The packet remains
`in_progress`; this execution-progress reconciliation does not claim validate-owned
certification.** The delivered pending-copy behavior and its exact route boundary remain
unchanged. Scope 4 adds the missing trust rule at the route's publication edge into shared
`RLDATA` state.

## Execution Outline

### Phase Order

1. **Scope 1 — current-subject corpus state.** Reset readiness before the synchronous apply paint,
       then verify the pending sample, later recovery, and refused-input behavior on the production
       route.
2. **Scope 2 — honest pending composition.** Carry corpus readiness through the existing coverage
       account and withhold settled coverage and horizon claims only while the corpus is unresolved.
3. **Scope 3 — durable regression.** Keep a committed browser case inside the pending window and
       prove that removing the coverage guard makes the exact copy assertion fail.
4. **Scope 4 — publication trust boundary.** Withhold an ordinary `rl-tool-read/v1` publication
      while readiness is `not-established`, preserve ordinary publication for both loaded and
      unavailable settled outcomes, and verify the transition with a deterministic request gate.

### New Types And Signatures

- `buildCoverageAccount(reads, registry, corpusReadiness)` accepts the additive readiness input.
- Coverage-account `readiness` uses the closed values `established` and `not-established`.
- `body[data-reading-readiness]` exposes whether the rendered account is established.
- `body[data-coverage-unavailable]` carries `not-established` instead of a number on a pending
      paint.
- The settled predicate is `data-run-status="composed"` together with
      `data-reading-readiness="established"`.
- The route may publish an ordinary `rl-tool-read/v1` record into the shared `RLDATA` tool-read
      channel only when the account carried by that record has readiness `established`.
- An established account publishes through the ordinary channel whether corpus settlement is
      `loaded` or `unavailable`; unavailable is a settled outcome, not a pending outcome.

### Validation Checkpoints

- Scope 1 stops before Scope 2 unless the focused `BUG-018 scope 1` browser regression, the full
      route browser suite, the module unit suite, and the repository selftest are green.
- Scope 2 stops before Scope 3 unless the held-corpus browser regression proves pending and settled
      copy on the same page, the outage cases remain settled, and the broader suites stay green.
- Scope 3 requires the focused regression, its recorded guard-removal negative control, the full
      route browser suite, and the repository selftest before its historical Done record is accepted.
- Scope 4 cannot claim execution until one browser run observes the publication channel before
      release, after loaded settlement, and after unavailable settlement using request-entry and
      release barriers rather than elapsed time or a shared request counter.

## Capability And UI Proportionality

### Single-Capability Planning Justification

This packet repairs readiness semantics inside the existing Company Multi-Horizon Intelligence
composition capability. It adds no provider, adapter, strategy, plugin, connector, second
capability, or independently variable implementation. `rlcompanyintel.js` remains the single
coverage-account contract, and `company-intelligence-lab.html` remains its existing route
consumer. Scope 4 governs only that route's publication into the already-shared `RLDATA` tool-read
channel. It does not create a second channel or a general publication framework, so a
foundation/overlay scope split would invent variation that this bug does not contain.

### Single-Screen Planning Justification

The user-visible change is confined to the existing `company-intelligence-lab.html` screen: its
cockpit coverage sentence, four horizon cards, coverage workspace, and body-state attributes all
consume one account-readiness value in one render. No second screen or cross-feature UI primitive
is introduced, so extracting a reusable UI primitive would add an unused abstraction.

## Change Boundary

**Allowed file families for the delivered repair:** this bug packet, `company-intelligence-lab.html`,
`rlcompanyintel.js`, `tests/company-intelligence-lab.spec.mjs`, and
`notes/company-intelligence-lab.md`.

**Allowed file families for this planning reconciliation:** only files inside
`specs/_bugs/BUG-018-corpus-pending-window-states-absence-as-settled-fact/`.

**Excluded surfaces:** every other tool route, shared data payload, provider configuration,
framework-managed `.github/bubbles/**` file, and every other spec packet. The current planning run
does not alter production source, tests, shared helpers, or managed product documentation.

**Allowed file families for Scope 4 execution:** `company-intelligence-lab.html`, the company-owned
publisher in `rlcompanyintel.js`, `tests/company-intelligence-lab.spec.mjs`,
`tests/company-intelligence.unit.mjs`, the narrow provenance assertion in `scripts/selftest.mjs`,
and `notes/company-intelligence-lab.md`.

**Scope 4 excluded surfaces:** `rldata.js`, corpus contents, coverage math, settled copy, horizon
direction calculation, route registration, navigation, provider configuration, every other tool's
publisher, and every consumer's recommendation logic. The company publisher must enforce its own
readiness before calling the unchanged shared storage API.

## Sequencing Note

Scope 1 was independent and landed alone. It repaired a wrong attribute and restored the only
workaround consumers had.

Scope 2 depended on a product decision recorded in `design.md` open question 1, because the two
candidate remedies produce different first paints. That decision was made on 2026-08-23 — Option A,
then Option B, withhold — by the orchestrating session under the operator's standing authorization,
and is recorded with its authority disclosed in `design.md`, `## Open Questions For The Owner —
Resolved 2026-08-23`.

Scope 3 depended on Scope 2, because the assertion it adds asserts the chosen copy.

Scope 4 depends on Scope 3. It adds a publication-edge invariant without reopening the delivered
copy, coverage, horizon, or current-subject semantics from Scopes 1–3.

---

## Scope 1: Make `data-corpus-status` Describe The Subject On Screen

**Status:** Done
**Scope-Kind:** runtime-behavior
**Consumer Surface:** `company-intelligence-lab.html`
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

### Implementation Files

- `company-intelligence-lab.html`

### Implementation Plan

1. Move the `corpusStatus = "pending"` reset so it precedes the synchronous compose-and-render in
   `applySubject()`, rather than executing inside `loadCorpus()` afterwards.
2. Confirm the refusal path at `company-intelligence-lab.html:1073-1083` still reports the standing
   subject's state correctly, since `renderRefusal` also calls `setBodyState`.
3. Confirm no other caller depends on the reset happening inside `loadCorpus()`.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-001`: sample `data-corpus-status` in the same task as the apply click. Expected title: `Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-002`: release the held corpus and assert the attribute recovers to `loaded` or `unavailable`. Expected title: `Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-003`: refuse both guarded input shapes and assert the standing subject's settled corpus state is preserved. Expected title: `Regression: BUG-018 scope 1 data-corpus-status describes the subject on screen, not the one that left it`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1"` | Yes |
| Broader regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Run the complete Company Multi-Horizon Intelligence Lab browser suite so the focused ordering repair does not weaken another route journey. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs` | Yes |
| Unit regression | `unit` | `tests/company-intelligence.unit.mjs` | Preserve all module-level company-intelligence contracts while the route-level ordering changes. | `node --test tests/company-intelligence.unit.mjs` | No |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve the complete build-free Research Lab invariant suite. | `node scripts/selftest.mjs` | No |

### Definition of Done

- [x] Applying a new subject from a settled page reports `data-corpus-status="pending"` in the same task rather than retaining `loaded`. → Evidence: sampling
      the body in the same task as the click handler now yields `pending`, where the recorded
      reproduction yielded `loaded` for a subject whose corpus had never been requested. Run and
      output in [report.md](report.md), "The same case passes after the change".
- [x] Scenario-specific E2E regression test for every new/changed/fixed behavior passes; the attribute recovers when that subject's corpus resolves, reaching `loaded` or `unavailable` after the pending sample. →
      Evidence: `npx --no-install playwright test --config=playwright.config.mjs
      --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 1"` →
      `RED_EXIT=1` on `Expected: "pending" / Received: "loaded"`, which is the attribute assertion
      and not a timeout, then `GREEN_EXIT=0`, `1 passed (4.4s)`. Both transcripts in
      [report.md](report.md).
- [x] Broader E2E regression suite passes for `tests/company-intelligence-lab.spec.mjs` at 37 or more. → Evidence: `38 passed
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
- [x] A refused entry does not reset the attribute for the standing subject; both refusal paths preserve its settled corpus state. → Evidence: the new case asserts both refusal
      shapes — `C025-INPUT-REFUSED` from the shared input rule and `C025-IDENTITY-UNRESOLVED` from
      the resolver — each required to leave the standing subject's `data-corpus-status` at the
      value it held before the refused entry rather than resetting it to `pending`.

---

## Scope 2: Stop Asserting Absence The Route Has Not Established

**Status:** Done
**Scope-Kind:** runtime-behavior
**Consumer Surface:** `company-intelligence-lab.html`
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
            Given a matching committed-corpus request has entered a deterministic hold
    When the route reaches its first composed paint for a deep-linked subject
    Then the cockpit does not assert a definite count of dimensions with no usable source

  Scenario: The pending window is visible without inspecting an attribute
            Given a matching committed-corpus request has entered a deterministic hold
    When the rendered body text is scanned on the composed paint
    Then readiness wording is present
    And that wording is absent once the corpus resolves

  Scenario: Horizon directions are not asserted against an unresolved corpus
            Given a matching committed-corpus request has entered a deterministic hold
    When the horizon cards are read on the composed paint
    Then no card presents a settled direction as a finding

  Scenario: The settled reading is unchanged
    Given the corpus has resolved for the covered subject
    Then the cockpit states 13 of 15 mandatory dimensions have no usable source
    And three of the four horizons carry a direction

  Scenario: A corpus that resolves to unavailable is still a settled reading
            Given every committed corpus request from company-intelligence-lab.html fails
            When the route's corpus state resolves to unavailable
            Then body[data-reading-readiness] reports "established"
            And the route presents its named unavailable reading instead of pending copy
```

### Implementation Files

- `company-intelligence-lab.html`
- `rlcompanyintel.js`

### Implementation Plan

1. Apply the resolved Option A readiness contract, then the resolved Option B withholding rule
      recorded in `design.md`, `## Open Questions For The Owner — Resolved 2026-08-23`.
2. Thread readiness into `compose()` and `buildCoverageAccount` first, additively, so existing
      module callers are unchanged.
3. Apply the same treatment to the coverage sentence and to the horizon cards, so the two cannot
   disagree.
4. Preserve the offline first paint: a corpus resolved to `unavailable` is settled and must render
   as such.
5. Resolve FR-018-005: document one predicate over body attributes that distinguishes a settled
   paint, and use it.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-004`: the held pending paint does not print settled absence grammar. Expected title: `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-005`: the pending window is visible without inspecting an attribute; readiness wording is visible while held and absent after the same corpus settles. Expected title: `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-006`: every pending horizon card exposes not-established direction and evidence quality instead of a settled finding. Expected title: `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-007`: the settled reading is unchanged after corpus resolution; the `MSFT` account remains `13 of 15` with the established horizon directions unchanged. Expected title: `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-008`: corpus-wide request failure resolves to an established unavailable reading rather than a perpetual pending state. Expected titles include `Stabilize: every committed source unavailable degrades to a named absence, not a blank or a zero`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "file:// origin|every data request still outstanding|every committed source unavailable"` | Yes |
| Broader regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Run the complete route browser suite after the pending-state copy and account-contract changes. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs` | Yes |
| Unit regression | `unit` | `tests/company-intelligence.unit.mjs` | Preserve all existing two-argument `buildCoverageAccount` behavior while the optional readiness argument is introduced. | `node --test tests/company-intelligence.unit.mjs` | No |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve the complete build-free Research Lab invariant suite. | `node scripts/selftest.mjs` | No |

### Definition of Done

- [x] The product decision in `design.md` open question 1 is recorded by the owner → Evidence:
      `design.md`, `## Open Questions For The Owner — Resolved 2026-08-23`, answering **Option A,
      then Option B — withhold**, with the deciding authority disclosed as the orchestrating
      session acting under the operator's standing authorization rather than as an independently
      reached engineering conclusion. Questions 2, 3 and 4 are answered in the same record.
- [x] Scenario-specific E2E regression test for every new/changed/fixed behavior passes; the pending window does not print a settled absence count before the committed corpus answers. → Evidence: the
      reproduction printed `15 of 15 mandatory dimensions have no usable source in this run` on a
      paint whose corpus had not been requested. The committed case now asserts that exact grammar
      is absent from that paint and passes: `GREEN_EXIT=0`, `1 passed (1.7s)`. The same assertion
      against the unfixed route returns that string verbatim and fails (`RED_EXIT=1`).
- [x] The pending window is visible without inspecting an attribute: readiness wording is present while held and absent when settled. → Evidence: the case
      scans `document.body.innerText` on the held paint and requires
      `/waiting for the committed corpus/i`, then releases the hold on the same page and requires
      the same scan **not** to match. Both directions are asserted in one run; a fix that added
      permanent wording would fail the second half.
- [x] No horizon card presents a settled direction on a pre-corpus paint → Evidence: all four
      `[data-horizon]` cards are asserted to carry `data-direction="not-established"`,
      `data-evidence-quality="not-established"` and `data-horizon-readiness="not-established"`
      while held, each with more than 20 characters of readable summary copy so the remedy cannot
      degrade into a blank card.
- [x] The settled reading is unchanged: `MSFT` remains `13 of 15` with three horizons carrying directions. →
      Evidence: after the hold is released the same case requires
      `/13 of 15 mandatory dimensions have no usable source/`,
      `data-coverage-unavailable="13"`, and exactly `['event', 'immediate', 'swing']` carrying a
      direction with `structural` at `none`. Unchanged from before this fix.
- [x] A corpus that resolves to unavailable is still a settled reading: the offline first paint reaches a usable cockpit with named unavailable data instead of remaining pending → Evidence:
      `OFFLINE_EXIT=0`, `3 passed (2.2s)` across the `file://` first paint
      (`tests/company-intelligence-lab.spec.mjs:1075`), the all-requests-outstanding first paint
      (`:1118`) and the corpus-wide outage (`:785`). The third is the load-bearing one: it asserts
      the coverage rows still read `unavailable`, which is reachable only because a corpus resolved
      to `unavailable` is `established`. Withholding is a window, not a permanent state.
- [x] Broader E2E regression suite passes for `tests/company-intelligence-lab.spec.mjs` → Evidence: `39 passed (45.2s)`, exit 0,
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
**Scope-Kind:** runtime-behavior
**Consumer Surface:** `company-intelligence-lab.html`
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

### Implementation Files

- `company-intelligence-lab.html`
- `tests/company-intelligence-lab.spec.mjs`

### Implementation Plan

1. Add a case that opens the route with the corpus held and samples the composed paint without
   using `openComposedRoute`.
2. Assert on the copy, not only on attributes, so the assertion tracks what a reader sees.
3. Verify the case fails against the code at `dc54a8547` for the copy reason and not a timeout.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Scenario-specific regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-009`: hold `**/data/**`, wait only for the composed paint, and assert that its visible copy is not settled absence grammar. Expected title: `Regression: BUG-018 scope 2 the composed paint states no absence the corpus has not established`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Adversarial regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-010`: prove the persistent case fails for its copy assertion when only the pending coverage guard is removed. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 scope 2"` | Yes |
| Broader regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Run the complete route browser suite and retain every pre-existing journey plus the new pending-window case. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs` | Yes |
| Repository regression | `functional` | `scripts/selftest.mjs` | Preserve the complete build-free Research Lab invariant suite after the test-gap closure. | `node scripts/selftest.mjs` | No |

### Definition of Done

- [x] Scenario-specific E2E regression test for every new/changed/fixed behavior passes; a test samples the composed paint before the corpus resolves and asserts its visible copy. → Evidence:
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
- [x] The new case detects a reintroduction: its adversarial regression E2E fails when the Scope 2 guard is removed, with that output recorded. → Evidence: the
      corrected route was copied into the same worktree and **only** the `cockpit-coverage-line`
      branch was reverted to its unconditional form, leaving Option A, the horizon branch, the
      coverage branch and every attribute in place. `GUARDLESS_EXIT=1`, `1 failed`, same assertion
      and same received string. That is this scope's adversarial scenario satisfied literally, and
      it separates "detects the missing guard" from "detects the missing plumbing".
- [x] It contains no conditional early-return that could silently pass → Evidence: the body has no
      `if` and no `return` before its assertions; the only control flow is the `for` over the four
      horizon cards, which asserts on every element, and a `try`/`finally` whose `finally` performs
      teardown only. Both halves of the window are asserted unconditionally on one page.
- [x] Broader E2E regression suite passes with a higher suite total and no existing assertion removed → Evidence: `39 passed (45.2s)`
      against 38 before this scope, capture sha256
      `4d069169db0e3741bdfc8aff06139c1d12c3ecc00038a1f0e7ff42d02ac7be17`. One case added, none
      removed, none skipped, none relaxed; the spec file's diff is 147 insertions and 0 deletions.
      Full capture and diff stat in [report.md](report.md), "### Code Diff Evidence" and "### The
      committed browser suite rises from 38 to 39 with nothing removed".

---

## Historical Cross-Scope Definition of Done For Scopes 1–3

The checked items below preserve the historical delivery record for Scopes 1–3. They do not apply
to Scope 4 and do not claim that Scope 4 has been implemented or tested.

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
- [x] Change Boundary is respected and zero excluded file families were changed
  - **Evidence** (`executed`): `git show --stat` across both delivery commits resolves to exactly `company-intelligence-lab.html`, `rlcompanyintel.js`, `tests/company-intelligence-lab.spec.mjs`, `notes/company-intelligence-lab.md`, plus this packet's own artifacts. No other tool HTML, no `data/` payload, no `.github/bubbles/**` file.

---

## Scope 4: Enforce The Shared `RLDATA` Publication Trust Boundary

**Status:** Done
**Scope-Kind:** runtime-behavior
**Depends On:** Scope 3
**Consumer Surface:** the ordinary shared `RLDATA` `rl-tool-read/v1` channel as written by
`company-intelligence-lab.html`

### Problem This Scope Resolves

Scopes 1–3 prevent pending coverage and horizon claims from being presented as settled on the
route. They do not yet plan the equivalent trust rule for the route's publication into shared
`RLDATA` state. A record whose readiness is `not-established` must not enter the ordinary
`rl-tool-read/v1` channel. Once the same account settles, both `loaded` and `unavailable` outcomes
remain eligible for ordinary publication. This is a publication-edge rule only. It does not change
the settled account, the route's rendered copy, or any other tool's publication behavior.

### Gherkin Scenarios

```gherkin
Feature: Shared tool-read publication carries only settled company readings

  Scenario: A pending company reading is withheld from the ordinary channel
    Given observation of the ordinary shared tool-read channel begins before route navigation
    And a matching committed-corpus request has entered a deterministic hold
    When the route paints a composed account whose readiness is not-established
    Then no new rl-tool-read/v1 record for that not-established account is published

  Scenario: A loaded company reading publishes after settlement
    Given the pending account has not been published to the ordinary channel
    When the held corpus request is released and the account settles as loaded
            Then the ordinary channel contains an rl-tool-read/v1 record for the established account
    And its content describes the settled reading rather than the pending paint

  Scenario: An unavailable company reading is settled and still publishes
            Given the real ephemeral static server reports every committed corpus source unavailable
            When the account settles with unavailable corpus status and established readiness
            Then the ordinary channel contains an rl-tool-read/v1 record for the established unavailable account
    And the route does not remain permanently withheld

      Scenario: Browser-test provenance distinguishes pass-through fault injection
            Given ordinary route cases and annotated hold or delay cases share one browser test file
            When that file documents its request boundary
            Then it identifies the annotated cases as pass-through interception using the real response
            And it does not claim that the whole file has no request interception
```

### Implementation Plan

1. Gate the route-owned ordinary tool-read publication on the readiness carried by the exact
   coverage account being published. Do not infer readiness from elapsed time, cache occupancy, or
   a separately sampled body attribute.
2. Withhold the ordinary `rl-tool-read/v1` write when account readiness is `not-established`.
   Do not relabel the pending payload as an ordinary settled read.
3. Keep the existing settled publication path for readiness `established`. Exercise both corpus
   settlements: `loaded` and `unavailable`.
4. Start the pending-channel browser case in a fresh isolated context. Capture the pre-route
      `rlData.toolReads` baseline before route code runs. Require the company tool-read key to remain
      absent after request entry and before release. After release, read the same key through
      `window.RLDATA.toolRead()` and validate the exact ordinary contract. This distinguishes
      withholding from accidentally re-reading a pre-existing settled entry.
5. Replace the Scope 1 fixed pending delay and the Scope 2 unsynchronized request-counter assertion
      with a per-test held request-entry gate installed before navigation:
   - an `entered` signal resolves only after a matching request handler has begun and is blocked;
   - every matching handler awaits the same idempotent `release` signal;
      - Scope 1 samples its return-time pending attribute in the apply click task, then awaits
        `entered`, calls `release`, and verifies recovery;
      - Scope 2 and the pending-channel case await `entered`, then sample pending state before
        `release`;
   - the settled assertions run only after `release` and the established predicate;
   - teardown releases an unresolved gate in `finally`, so a failed assertion cannot strand a
     request;
      - the existing global `afterEach()` cleanup remains in force;
   - no fixed sleep, `waitForTimeout`, incremented request counter, or counter-poll establishes the
     observation window.
6. Narrow the browser file's stale provenance header. It may say that ordinary cases use the real
      static server and unmodified responses. It must also say that explicitly annotated fault cases
      use `page.route()` only to hold or delay a request before `route.continue()` forwards the real
      response unchanged. It must not claim that the file has no request interception. This wording
      change does not reclassify those cases as mocked E2E and does not authorize `route.fulfill()` or
      `route.abort()`.
7. Preserve the exact BUG-018 boundary: no corpus-content changes, no coverage-math changes, no
   settled-copy changes, no horizon-direction changes, no route registration, and no publication
   policy changes for another tool.

### Shared Infrastructure Impact Sweep

- **Protected surface:** the ordinary shared `RLDATA` tool-read channel consumed by the Market
  Brief and any other reader of `rl-tool-read/v1` records.
- **Contract at risk:** ordinary records imply a settled, publishable reading. Pending
  `not-established` accounts are withheld; settled `loaded` and settled `unavailable` accounts
  continue to publish.
- **Canary:** a browser test observes the real shared channel across the pending-to-loaded
      transition. The existing real missing-source server path observes unavailable settlement. Both
      assert values produced by the route's production publication path.
- **Rollback boundary:** revert only the company publisher's readiness guard and its focused test
      changes. Keep `rldata.js`, every other publisher, and Scopes 1–3 untouched.

### Test Plan

| Test Type | Category | File/Location | Description | Command | Live System |
| --- | --- | --- | --- | --- | --- |
| Publication-contract unit regression | `unit` | `tests/company-intelligence.unit.mjs` | `SCN-BUG-018-011`, `SCN-BUG-018-012`, and `SCN-BUG-018-013`: exercise the production company publisher with actual coverage-account outputs; require `not-established` to produce no ordinary write and require established loaded and unavailable accounts to retain valid `rl-tool-read/v1` output. Expected title: `BUG-018 company tool-read publication requires established account readiness`. | `node --test tests/company-intelligence.unit.mjs` | No |
| Scenario-specific regression E2E — pending channel | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-011`: install channel observation and a held request-entry gate before navigation; after `entered` and before `release`, assert that a composed `not-established` account creates no new ordinary `rl-tool-read/v1` publication. Expected title: `Regression: BUG-018 pending readiness is withheld from the ordinary RLDATA tool-read channel`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 pending readiness"` | Yes |
| Scenario-specific regression E2E — loaded settlement | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-012`: release the same observed gate to a loaded corpus, await the established predicate, and assert that `RLDATA.toolRead('company-intelligence-lab')` carries the exact nine-key ordinary contract for the settled account. Expected title: `Regression: BUG-018 settled readiness publishes to the ordinary RLDATA tool-read channel`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 settled readiness"` | Yes |
| Scenario-specific regression E2E — unavailable settlement | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | `SCN-BUG-018-013`: use the real ephemeral static server's missing-source path, await `data-corpus-status="unavailable"` with established readiness, and assert that the ordinary stored record has `availability="unavailable"` with null `asOf` and `freshUntil`. Expected title: `Regression: BUG-018 unavailable settlement remains publishable on the ordinary RLDATA tool-read channel`. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs --grep "BUG-018 unavailable settlement"` | Yes |
| Scenario-specific functional regression — test provenance | `functional` | `scripts/selftest.mjs` | `SCN-BUG-018-014` / `SEC-BUG018-002`: require the browser-file header to distinguish ordinary real-response coverage from annotated pass-through fault injection; reject the stale blanket claim of no interception without pinning the number or source line of fault regions. | `node scripts/selftest.mjs` | No |
| Broader regression E2E | `e2e-ui` | `tests/company-intelligence-lab.spec.mjs` | Run the complete Company Multi-Horizon Intelligence Lab browser suite. Existing settled copy, pending copy, offline first paint, refusal, and current-subject assertions remain unchanged. | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/company-intelligence-lab.spec.mjs` | Yes |
| Repository regression | `functional` | `scripts/selftest.mjs` | Run the repository selftest without pinning a stale historical pass count; require the command's current zero-failure contract. | `node scripts/selftest.mjs` | No |

### Definition of Done — Tiered Validation

#### Core Items

- [x] The route withholds every new ordinary `rl-tool-read/v1` publication whose exact account
      readiness is `not-established`. → Evidence:
      [pending publication](report.md#scope-4-pending-publication) and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)
- [x] Established `loaded` and established `unavailable` outcomes both retain ordinary
      `rl-tool-read/v1` publication, with no settled behavior from Scopes 1–3 weakened. → Evidence:
      [loaded settlement](report.md#scope-4-loaded-publication),
      [unavailable settlement](report.md#scope-4-unavailable-publication), and
      [complete browser regression](report.md#scope-4-full-browser)
- [x] The focused pending-window test uses a held request-entry gate with `entered` and `release`
      signals, contains no fixed delay or request-counter race, preserves global cleanup, and
      releases the gate in teardown. → Evidence:
      [repository selftest](report.md#scope-4-selftest),
      [request-gate integrity](report.md#scope-4-request-gate), and
      [complete browser regression](report.md#scope-4-full-browser)
- [x] The browser-file provenance header limits its no-interception claim to ordinary cases and
      names annotated pass-through hold/delay regions without claiming they do not intercept. →
      Evidence: [repository selftest](report.md#scope-4-selftest),
      [browser-test provenance](report.md#scope-4-provenance), and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)

#### Test Evidence Items

- [x] The publication-contract unit regression passes for `not-established`, established loaded,
      and established unavailable coverage accounts. → Evidence:
      [publication-contract unit regression](report.md#scope-4-unit)
- [x] Scenario-specific E2E regression test for every new/changed/fixed behavior passes: a pending company reading is withheld from the ordinary channel, and no new `rl-tool-read/v1` record for that `not-established` account is published.
      `SCN-BUG-018-011` samples the channel between request entry and release. → Evidence:
      [pending publication](report.md#scope-4-pending-publication) and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)
- [x] The scenario-specific E2E regression for `SCN-BUG-018-012`, "A loaded company reading
      publishes after settlement," passes. After release and loaded settlement, the ordinary
      channel contains an `rl-tool-read/v1` record for the established account, and its content
      describes the settled reading rather than the pending paint. → Evidence:
      [loaded settlement](report.md#scope-4-loaded-publication) and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)
- [x] The scenario-specific E2E regression for `SCN-BUG-018-013`, "An unavailable company reading
      is settled and still publishes," passes. The ordinary channel contains an `rl-tool-read/v1`
      record for the established unavailable account, and the route does not remain permanently
      withheld. → Evidence:
      [unavailable settlement](report.md#scope-4-unavailable-publication) and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)
- [x] Browser-test provenance distinguishes pass-through fault injection, identifies annotated cases as pass-through interception using the real response, and makes no blanket no-interception claim.
      The scenario-specific functional regression for `SCN-BUG-018-014` passes. →
      Evidence: [repository selftest](report.md#scope-4-selftest),
      [browser-test provenance](report.md#scope-4-provenance), and
      [RED-to-GREEN receipts](report.md#scope-4-red-green)
- [x] Broader E2E regression suite passes for the complete route browser suite with no skip,
      bailout, interception of an owned business response, or weakened existing assertion. →
      Evidence: [complete browser regression](report.md#scope-4-full-browser),
      [regression-quality guard](report.md#scope-4-regression-quality), and
      [request-gate integrity](report.md#scope-4-request-gate)
- [x] `node scripts/selftest.mjs` completes with its current zero-failure contract; evidence reports
      the observed current count rather than requiring the historical `3404` count. → Evidence:
      [repository selftest](report.md#scope-4-selftest)

#### Build Quality Gate

- [x] The declared change boundary is respected; planning, source, test, and documentation diffs
      contain no excluded behavior change; artifact lint and the exact repository checks required
      for the touched files complete without warnings; planning and test-plan artifacts remain in
      sync. → Evidence: [implementation reality](report.md#scope-4-implementation-reality),
      [regression-quality guard](report.md#scope-4-regression-quality),
      [PII scan](report.md#scope-4-pii),
      [repository selftest](report.md#scope-4-selftest), and
      [delivery summary](report.md#scope-4-publication-trust-boundary)

### Finding Disposition

| Finding | Planning disposition |
| --- | --- |
| `SEC-BUG018-001` | Addressed by pending-channel withholding plus separate established-loaded and established-unavailable publication requirements. |
| `SEC-BUG018-002` | Addressed by the exact, count-independent browser-file provenance wording and its static contract row. |
| `BUG018-STABILIZE-002` | Addressed by replacing the Scope 1 fixed delay with request-entry and explicit-release synchronization while preserving global cleanup. |
| `BUG018-STABILIZE-003` | Addressed by replacing the Scope 2 counter race with the same explicit request-entry barrier before pending-state assertions. |
| `BUG018-STABILIZE-001` | Routed to the complete independent [BUG-025 planning packet](../BUG-025-company-corpus-read-never-settles/scopes.md). This row records ownership only; it does not claim that packet was implemented, tested, or delivered. |
| `BUG018-STABILIZE-004` | Routed to the complete independent [BUG-026 planning packet](../BUG-026-superseded-company-corpus-state-writes/scopes.md). This row records ownership only; it does not claim that packet was implemented, tested, or delivered. |
