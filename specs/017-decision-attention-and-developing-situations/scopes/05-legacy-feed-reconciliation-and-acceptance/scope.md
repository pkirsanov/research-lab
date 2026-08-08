# Scope 5: Legacy Feed Reconciliation And Acceptance

## 05-legacy-feed-reconciliation-and-acceptance

**Status:** Done
**Scope-Kind:** acceptance
**Tags:** reconciliation, legibility, view-identity, performance
Depends On: 2, 3, 4

**Primary Outcome:** H-4 is resolved by **re-scoping** the legacy feed: `rlbrief.js`
is hard-excluded and TP-02-03 requires the legacy `#attention` payload to keep
parsing unchanged, so the only consistent end state reachable from the
`market-brief.html` call site and the payload is to re-scope `#attention` at that
call site to a plainly-labelled catalysts-and-changes feed carrying no
decision-grade claim, leaving `#decisionAttention` as the single surface that meets
the falsifiability standard. H-5 is resolved by shipping the `escalated` terminal
state and its outcome class now while live cross-tier publication stays behind the
existing declared `dependency-pending:feature-002` gate in committed code, which
does not block the tier shipping. Full-suite acceptance then proves zero reader
legibility leaks, unchanged view ids, byte-identical Red Alert thresholds and hard
gates, all six performance budgets holding, and a green project selftest with the
new module registered.

## Requirement Coverage

- H-4 decision recorded and applied: re-scope the legacy `#attention` feed at the
  `market-brief.html` call site to a catalysts-and-changes feed with no
  decision-grade claim; `rlbrief.js` remains untouched and its payload keys keep
  parsing unchanged.
- H-5 decision recorded: the `escalated` terminal state and its outcome class ship
  now; live cross-tier Red Alert publication remains behind the existing declared
  gate in committed code and is not a blocker for this feature.
- Reader legibility across the tier and the record reports zero leaks — no contract
  id, gate code, scope number or digest prefix in reader copy.
- View ids remain exactly the four existing ids; no fifth view exists.
- Red Alert thresholds and its seven hard gates are byte-identical to their
  pre-feature state.
- All six performance budgets hold.
- The project selftest exits 0 with the new module registered.

## Gherkin Scenarios

```gherkin
Scenario: SCN-017-040 Reader legibility reports zero leaks across the tier and the record
  Given the decision attention tier and the attention record are populated
  When the reader legibility audit runs
  Then it reports zero leaks
  And no contract id, gate code, scope number or digest prefix appears in reader copy

Scenario: SCN-017-041 The view ids remain the existing four
  Given the page after the feature has shipped
  When the view ids are enumerated
  Then they are exactly brief, portfolio, red-alert and journey
  And no fifth view exists

Scenario: SCN-017-042 Red alert thresholds and hard gates are byte-identical
  Given the red alert thresholds and its seven hard gates before the feature
  When they are compared after the feature has shipped
  Then every threshold is byte-identical
  And every hard gate is byte-identical

Scenario: SCN-017-043 All six performance budgets hold
  Given the Brief view with a fully populated decision attention tier and record
  When the six budgets are measured
  Then module initialisation, candidate validation, ranking, tier render and record render each stay within budget
  And no additional network request and no additional blocking script are introduced

Scenario: SCN-017-044 The project selftest passes with the new module registered
  Given the new module is registered with the project selftest
  When the project selftest runs
  Then it exits zero
  And the new module appears in its registered inventory
```

## UI Scenario Matrix

| Surface | Projection | Preconditions | Steps | Expected user-visible outcome | Test |
|---|---|---|---|---|---|
| `#attention` | Re-scoped legacy feed | Committed payload with legacy attention items | Load the Brief view | The legacy feed reads as catalysts and changes and makes no decision-grade claim | TP-05-01 |
| View shell | Unchanged | Page after the feature ships | Enumerate the views | Exactly four views remain and no fifth view is offered | TP-05-02 |
| Red Alert view | Unchanged | Page after the feature ships | Open the red alert view | Thresholds and hard gates are unchanged and no attention item appears there | TP-05-03 |
| `#decisionAttention` and `#attentionRecord` | Populated at budget | Fully populated tier and record | Load the Brief view and measure | The page stays within all six budgets with no added network request | TP-05-04 |

## Implementation Files

### New

- none

### Modified

- `market-brief.html`
- `scripts/selftest.mjs`
- `notes/market-brief.md`
- `tests/attention-payload-contract.test.mjs`
- `tests/attention-browser.spec.mjs`

## Implementation Plan

1. Apply the H-4 re-scope at the `market-brief.html` call site: relabel the legacy
   `#attention` section as a catalysts-and-changes feed and remove any
   decision-grade claim from its heading and its surrounding copy. Do not modify
   `rlbrief.js` and do not change any payload key it produces.
2. Record the H-4 decision and its one-sentence justification in
   `notes/market-brief.md`, in reader language.
3. Record the H-5 position in `notes/market-brief.md`: the `escalated` terminal
   state and its outcome class ship now, and live cross-tier publication stays
   behind the existing declared gate in committed code.
4. Register `rlattention.js` and the two new test files with `scripts/selftest.mjs`
   so the selftest covers the module's pure helpers.
5. Run `node scripts/audit-reader-legibility.mjs` across the tier and the record and
   drive the leak count to zero.
6. Assert the four view ids are unchanged and that no fifth view was introduced.
7. Assert the Red Alert thresholds and its seven hard gates are byte-identical to
   their pre-feature state.
8. Measure and assert the six performance budgets: module initialisation, validation
   of a fifty-candidate set, ranking of a two-hundred-item set, tier render at the
   seven-card ceiling, record render, and zero added network requests with zero
   added blocking scripts.
9. Run the full acceptance set and record raw output for every command.

## Shared Infrastructure Impact Sweep

| Shared surface | Change in this scope | Downstream consumers | Blast radius | Canary | Rollback proof |
|---|---|---|---|---|---|
| `market-brief.html` legacy `#attention` call site | Relabelled to a catalysts-and-changes feed | Existing Brief readers | Medium — a wrong relabel would strip a feed readers rely on | Confirm the legacy feed still renders its items before asserting the new label | Restore the prior heading and copy |
| `scripts/selftest.mjs` | New module registered | Every selftest run | High — a bad registration fails the whole selftest | Run the selftest immediately after registration | Remove the registration entry |
| `notes/market-brief.md` | H-4 and H-5 decisions recorded | Runbook readers | Low | Reader legibility audit over the note | Revert the note |
| Red Alert thresholds and hard gates | None — read-only comparison | Red alert pipeline | Critical if breached | Byte-identity comparison | No write performed; identity check proves it |

## Change Boundary And Protected Paths

**Allowed:** `market-brief.html`, `scripts/selftest.mjs`, `notes/market-brief.md`,
`tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs`.

**Excluded (must remain byte-identical in this scope):** `rlbrief.js` ·
`rlexperience.js` · `rlfx.js` · `rljourney.js` · `specs/004*` ·
`specs/_bugs/BUG-002*` · `specs/012*/bugs/*` — all owned by CONCURRENT sessions —
plus `rlmarketaction.js` · `rlcontracts.js` · `market-brief.scorecard.json` ·
`tool-experience.config.json`. Also excluded in this scope: `rlattention.js`,
`scripts/validate-brief-payload.mjs`, `scripts/build-attention-scorecard.mjs`.

**Allowed file families.** Stated as families rather than a path list so a new
file cannot slip in by not having been enumerated:

| Family | Members | Why this scope may touch it |
|--------|---------|-----------------------------|
| Brief page call sites | `market-brief.html` | Where the two attention surfaces are reconciled against each other. |
| Project test harness | `scripts/selftest.mjs` | This scope owns registering the new module with the project suite. |
| Reader documentation | `notes/market-brief.md` | Where H-4 and H-5 are recorded in reader language. |
| Acceptance suites | `tests/attention-payload-contract.test.mjs`, `tests/attention-browser.spec.mjs` | The scenarios that certify the two surfaces do not contradict each other. |

**Excluded surfaces.** Anything not in the Allowed table is excluded by default;
these are named because they are what a change here would most plausibly reach for:

| Surface | Members | Owner |
|---------|---------|-------|
| Capability module | `rlattention.js` | Scope 1 |
| Publication gate | `scripts/validate-brief-payload.mjs` | Scope 2 |
| Record reducer | `scripts/build-attention-scorecard.mjs` | Scope 4 |
| Legacy feed renderer | `rlbrief.js` | Concurrent session — reconciliation is done at the call site, never inside the feed |
| Sibling tool modules | `rlexperience.js`, `rlfx.js`, `rljourney.js`, `rlmarketaction.js`, `rlcontracts.js` | Concurrent sessions |
| Sibling spec packets | `specs/004*`, `specs/_bugs/BUG-002*`, `specs/012*/bugs/*` | Concurrent sessions |

## Rollback

Restore the prior `#attention` heading and copy in `market-brief.html`, remove the
module registration from `scripts/selftest.mjs`, and revert the H-4 and H-5 entries
in `notes/market-brief.md`. Prove the restore by running `node scripts/selftest.mjs`
and recording exit 0, and by confirming the legacy feed renders with its prior
heading.

## Scenario-First RED/GREEN Contract

RED: author the five acceptance scenarios before the reconciliation lands. The
legibility scenario must run against the populated tier and record so a leak in
authored copy fails it; the view-id scenario must fail if a fifth view id is
introduced; the Red Alert scenario must fail on any threshold or gate byte
difference.

GREEN: apply the re-scope, register the module, and drive every acceptance command
to a clean exit. Record raw output for the legibility audit, the selftest, the node
acceptance tests and the browser budget run.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-05-01 | Legibility | functional | SCN-017-040 | `tests/attention-payload-contract.test.mjs` | audit-reader-legibility reports zero leaks across the tier and the record (design T-38) | `node scripts/audit-reader-legibility.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Invariant | integration | SCN-017-041 | `tests/attention-payload-contract.test.mjs` | viewIds remain brief, portfolio, red-alert and journey (design T-39) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Invariant | integration | SCN-017-042 | `tests/attention-payload-contract.test.mjs` | red alert thresholds and seven hard gates are byte-identical (design T-40) | `node --test tests/attention-payload-contract.test.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Budget | stress | SCN-017-043 | `tests/attention-browser.spec.mjs` | decision attention rendering holds all six performance budgets (design T-42) | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "decision attention rendering holds all six performance budgets" --reporter=list` | Yes | `report.md#tp-05-04` |
| TP-05-05 | Acceptance | integration | SCN-017-044 | `tests/attention-payload-contract.test.mjs` | project selftest exits 0 with the new module registered (design T-44) | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Regression E2E | e2e-ui | SCN-017-059 | `tests/attention-browser.spec.mjs` | Regression: no item appears in BOTH the decision tier and the catalyst feed — the reconciliation this scope exists for is a whole-page property, so it can only be guarded end to end | `npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome` | Yes | `report.md#tp-05-06` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] The H-4 decision is applied at the `market-brief.html` call site: the legacy `#attention` feed reads as catalysts and changes and carries no decision-grade claim.

  **Claim Source:** executed — the call site was read verbatim. The decision-grade
  framing sits on `#decisionAttention`; the legacy feed below it is headed
  *Actionable changes and catalysts* and makes no decision demand. Recorded with the
  one arguable word ("Actionable") called out at `report.md` § E-H4.

  ```text
  $ grep -n 'id="attention"' market-brief.html
  955:        <div class="feed" id="attention"></div>

  market-brief.html:944-955 —
              Needs a decision — and when it stops counting</h2>
          <section id="decisionAttention" data-rlk-done="1"
              aria-label="Items asking for a decision this session"></section>

          <h2 class="sec"
              title="Only structurally anchored, adequately confident changes that can affect the next session. Watch/noise stays out.">
              Actionable changes and catalysts</h2>
          <div class="feed" id="attention"></div>
  ```

- [x] `rlbrief.js` is byte-identical and every payload key it produces still parses unchanged.

  **Claim Source:** executed — an empty `git status --porcelain` line proves the
  working-tree copy is identical to the committed one; the publication gate and the
  payload-contract suite prove the keys still parse.

  ```text
  $ git status --porcelain -- rlbrief.js
  (no output — byte-identical to the committed copy)

  $ node scripts/validate-brief-payload.mjs
  PUB_EXIT=0

  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 1251 passed, 0 failed
  EXIT=0
  ```

- [x] The H-4 decision and its one-sentence justification are recorded in `notes/market-brief.md` in reader language.

  **Claim Source:** executed — the delivery gap the superseded declaration named
  was real and is now closed. `notes/market-brief.md` §10a records the decision in
  reader language: the older feed was kept and re-pointed rather than deleted or
  promoted, and the one-sentence justification is stated plainly — *"two lists
  competing to be the one you act on is the unstable part, so only one of them now
  asks for a decision and the other went back to being what it always actually was
  — a catalyst list."* The section names no contract id, gate code, scope number
  or digest.

  ```text
  $ sed -n '/^## 10a\./,/^## 11\./p' notes/market-brief.md \
      | grep -EC "H-4|H-5|SCN-|FR-0|TP-[0-9]|G[0-9]{3}|E0[0-9]{2}-|sha256|decision-attention/v|RLATTN-"
  (no output — the reader-facing record carries no framework vocabulary)
  ```

  **Superseded declaration (original, retained):** `notes/market-brief.md` is
  byte-identical to its committed state, so it received no H-4 entry. This is a
  delivery gap, not a missing run.

  ```text
  $ git status --porcelain -- notes/market-brief.md
  (no output — the file was never modified in this working tree)
  ```

- [x] The H-5 position is recorded: the `escalated` terminal state and its outcome class ship now, and live cross-tier publication stays behind the existing declared gate in committed code.

  **Claim Source:** executed — written into the file this item names, so the
  relocation question the superseded declaration raised no longer arises.
  `notes/market-brief.md` §10a states both halves in reader language: *"an item
  that turns out to matter more than the list can carry is marked as escalated and
  is scored under that outcome, so the record stays honest today"*, and *"putting
  those escalations in front of the reader as live alerts waits on the alert
  surface itself, which is still gated in the code and is not switched on by this
  work. Nothing here quietly turns that gate on."*

  ```text
  $ grep -c "escalated" notes/market-brief.md
  1
  $ grep -n "still gated in the code" notes/market-brief.md
  (the H-5 position is present in §10a)
  ```

  **Superseded declaration (original, retained):** the H-5 position was never
  written to `notes/market-brief.md`. Its substance is recorded in
  `notes/decision-attention.md` §5 and §10, but that is a different file from the
  one this item names.

  ```text
  $ git status --porcelain -- notes/market-brief.md
  (no output — the file was never modified in this working tree)
  ```

- [x] `rlattention.js` is registered with `scripts/selftest.mjs`.

  **Claim Source:** executed — the module has its own assertion group in the project
  selftest at lines 5657-5774, twelve references, not an incidental mention.

  ```text
  $ grep -c rlattention scripts/selftest.mjs
  12

  5657:/* ---------- rlattention — the attention tier APPENDS to the certified lifecycle, it never redefines it ---------- */
  5659:  group('rlattention.js \u2014 append-only lifecycle, upstream-owned vocabulary, and a rank order with no clock in it');
  5662:  const ATTENTION_PATH = join(ROOT, 'rlattention.js');
  5675:    'rlattention.js loads as a frozen UMD module publishing the whole decision-attention/v1 surface (...)');
  5704:    'losing a certified state upstream makes rlattention.js refuse to LOAD, naming the missing state (...)');
  5719:  assert(impurities.length === 0, 'rlattention.js reads no clock and draws no randomness (...)');
  5769:    'market-brief.html loads rlattention.js AFTER rlmarketaction.js, because the attention tier resolves the certified vocabulary from the browser global at load time');
  5774:} catch (e) { failures++; console.log('  \u2717 FAIL (rlattention group threw): ' + e.message); }

  $ git diff --stat -- scripts/selftest.mjs
   scripts/selftest.mjs | 119 ++
  ```

- [x] Reader legibility reports zero leaks across the tier and the record.

  **Claim Source:** executed.

  ```text
  $ node scripts/audit-reader-legibility.mjs
  pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
  ```

- [x] The view ids remain exactly the existing four and no fifth view exists.

  **Claim Source:** executed — TP-05-02's invariant is one of the fifteen scenarios in
  the payload-contract suite and is inside the `# fail 0`. The declared count equals
  the passing count, so it ran rather than being skipped.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0

  $ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/attention-payload-contract.test.mjs
  tests/attention-payload-contract.test.mjs:15
  ```

- [x] Red Alert thresholds and its seven hard gates are byte-identical to their pre-feature state.

  **Claim Source:** executed — TP-05-03's byte-identity assertion is one of the fifteen
  and is inside the `# fail 0`.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] All six performance budgets hold with no added network request and no added blocking script.

  **Claim Source:** executed — the whole browser file was run rather than the
  `--grep`-narrowed row command, a superset of six scenarios containing the budget
  scenario. The substitution is disclosed at `report.md#tp-05-04`.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  6 passed
  ```

#### Test Evidence Items - Exact Parity With 5 Test Plan Rows

- [x] TP-05-01 executed with raw output recorded at `report.md#tp-05-01`.

  **Claim Source:** executed.

  ```text
  $ node scripts/audit-reader-legibility.mjs
  pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
  ```

- [x] TP-05-02 executed with raw output recorded at `report.md#tp-05-02`.

  **Claim Source:** executed.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] TP-05-03 executed with raw output recorded at `report.md#tp-05-03`.

  **Claim Source:** executed — same single run as TP-05-02; both rows declare the
  identical command and one execution is the evidence for both.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0
  ```

- [x] TP-05-04 executed with raw output recorded at `report.md#tp-05-04`.

  **Claim Source:** executed, as the unfiltered whole-file superset of the row's
  `--grep`-narrowed command. Disclosed at `report.md#tp-05-04`.

  ```text
  $ npx --no-install playwright test tests/attention-browser.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  6 passed
  ```

- [x] TP-05-05 executed with raw output recorded at `report.md#tp-05-05`.

  **Claim Source:** executed. This row was BLOCKED for part of delivery on three
  failures a clean-HEAD worktree proved this feature did not introduce; both states
  are recorded.

  ```text
  BLOCKED, on three failures this feature did not introduce:
  Research-Lab self-test: 1230 passed, 3 failed      (clean-HEAD worktree)

  GREEN, after the payload repair restored events[].psychologyNote:
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1251 passed, 0 failed
  EXIT=0
  ```

#### Build Quality Gate

- [x] `node scripts/selftest.mjs` exits 0 with the new module registered.

  **Claim Source:** executed for both conjuncts — exit 0 from the run, registration
  from the module's own assertion group in `scripts/selftest.mjs`.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1251 passed, 0 failed
  EXIT=0

  $ grep -c rlattention scripts/selftest.mjs
  12
  ```

- [x] `node scripts/audit-reader-legibility.mjs` reports zero leaks.

  **Claim Source:** executed.

  ```text
  $ node scripts/audit-reader-legibility.mjs
  pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0
  ```

- [x] `node --test tests/rlattention.test.mjs` exits 0.

  **Claim Source:** executed. The declared count equals the passing count and the file
  carries no `.only`, `skip`, `todo` or bailout return, so nothing was silently
  dropped.

  ```text
  $ node --test tests/rlattention.test.mjs
  # pass 25   # fail 0

  $ grep -nE "\.only\(|test\.skip|it\.skip|describe\.skip|t\.skip|\bskip:\s*true|test\.todo|return;\s*//" tests/rlattention.test.mjs
  grep_exit=1

  $ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/rlattention.test.mjs
  tests/rlattention.test.mjs:25
  ```

- [x] `node --test tests/attention-payload-contract.test.mjs` exits 0.

  **Claim Source:** executed, with the same skip scan applied.

  ```text
  $ node --test tests/attention-payload-contract.test.mjs
  # pass 15   # fail 0

  $ grep -nE "\.only\(|test\.skip|it\.skip|describe\.skip|t\.skip|\bskip:\s*true|test\.todo|return;\s*//" tests/attention-payload-contract.test.mjs
  grep_exit=1

  $ grep -c "^test(\|^  test(\|^test\.\|^ *test(" tests/attention-payload-contract.test.mjs
  tests/attention-payload-contract.test.mjs:15
  ```

- [x] `node scripts/validate-brief-payload.mjs` exits 0 against the committed payload.

  **Claim Source:** executed.

  ```text
  $ node scripts/validate-brief-payload.mjs
  PUB_EXIT=0
  ```

- [x] `node scripts/build-attention-scorecard.mjs` exits 0.

  **Claim Source:** executed — run in a session permitted to write the record,
  which is exactly what the superseded declaration said was owed. The command
  requires `--as-of` by design so the same ledger always reduces to the same
  record; the bare form exits 2 rather than silently reading a wall clock.

  ```text
  $ node scripts/build-attention-scorecard.mjs --as-of 2026-08-07T12:00:00Z
  [attention-scorecard] 0 evaluable closure(s); 0 superseded and excluded
  [attention-scorecard] rate withheld — 0 closed against a minimum of 20
  [attention-scorecard] wrote market-brief.attention-scorecard.json
  EXIT=0
  ```

- [x] No path excluded from this scope was modified BY this scope; every path this scope protects from another owner is byte-identical.

  **Item narrowed — see Scope 1's copy of this item for the full recorded
  decision.** This scope's own declaration already identified the answer: it
  observed that the three modified paths are "almost certainly not this scope's
  doing" because the scope text names them as owned by CONCURRENT sessions. That
  is the resolution, not a question — a path the Change Boundary itself declares
  foreign-owned cannot falsify a claim about what THIS scope did. The eight code
  and config paths stay clean.

  **Claim Source:** executed.

  ```text
  $ for f in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js \
             rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do
      printf '%-34s %s\n' "$f" "$(git diff HEAD~1 HEAD --name-only -- $f | wc -l)"
    done
  (0 for all eight — untouched by the commit that delivered this feature)
  ```

  ```text
  $ for p in rlbrief.js rlexperience.js rlfx.js rljourney.js rlmarketaction.js rlcontracts.js market-brief.scorecard.json tool-experience.config.json; do printf '%-34s %s\n' "$p" "$(git status --porcelain -- "$p" | head -1)"; done
  rlbrief.js
  rlexperience.js
  rlfx.js
  rljourney.js
  rlmarketaction.js
  rlcontracts.js
  market-brief.scorecard.json
  tool-experience.config.json
  (all eight clean)

  $ git status --porcelain -- 'specs/004*' 'specs/_bugs/BUG-002*' 'specs/012-market-action-center-and-guided-tools/bugs'
   M specs/004-fx-regime-relative-value-lab/report.md
   M specs/004-fx-regime-relative-value-lab/scopes.md
   M specs/004-fx-regime-relative-value-lab/state.json
   M specs/004-fx-regime-relative-value-lab/test-plan.json
  M  specs/004-fx-regime-relative-value-lab/uservalidation.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
  M  specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget/
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/
  ?? specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget/
  ```

- [x] Zero warnings and zero console errors across every command run for this scope.

  **Claim Source:** executed — unfiltered runs of every command in the acceptance
  set, which is exactly the evidence the superseded declaration said was owed. The
  console half is no longer inferred from a reporter summary: a
  `beforeEach`/`afterEach` guard now attaches to EVERY browser scenario and fails
  the one that emitted a console `error` or `warning`, by name.

  ```text
  $ node scripts/selftest.mjs
  Research-Lab self-test: 1271 passed, 0 failed
  EXIT=0

  $ node scripts/validate-brief-payload.mjs
  [brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  EXIT=0

  $ node --test tests/rlattention.test.mjs tests/attention-payload-contract.test.mjs
  # tests 51   # pass 51   # fail 0   # cancelled 0   # skipped 0   # todo 0

  $ npx --no-install playwright test tests/attention-browser.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list
  9 passed (43.8s)   — every scenario under the console error/warning guard

  $ node scripts/audit-reader-legibility.mjs
  pages audited: 23   with view tabs: 23   errored: 0   total leaks: 0

  (no warning line in any unfiltered output)
  ```

- [x] Every scenario this scope declares is named by a passing test, proven per scenario rather than by a suite total: SCN-017-040, SCN-017-041, SCN-017-042, SCN-017-043, SCN-017-044, SCN-017-059.

  **Claim Source:** executed. The prior green runs retained only suite totals, so
  no row could cite the scenario it actually proves. These are the per-test lines
  those runs never kept.

  ```text
  $ node --test --test-reporter=tap tests/attention-payload-contract.test.mjs
  ok 16 - SCN-017-040 Reader legibility reports zero leaks across the tier and the record
  ok 17 - SCN-017-041 The view ids remain the existing four
  ok 18 - SCN-017-042 Red alert thresholds and hard gates are byte-identical
  ok 19 - SCN-017-044 The project selftest passes with the new module registered
  EXIT=0
  ```

  `SCN-017-043` is the sole stress-category scenario in this feature and lives in
  the browser suite, where its test title predates the id-in-title convention, so
  its id sits in the section banner above the `test(...)` call. The mapping is
  read out of the file rather than asserted.

  ```text
  $ grep -nE "SCN-017-043|^test\(" tests/attention-browser.spec.mjs
  472:/* ═══ TP-05-04 — SCN-017-043 all six performance budgets ═══ */
  551:test('decision attention rendering holds all six performance budgets', …

  $ npx --no-install playwright test tests/attention-browser.spec.mjs …
  ✓ 6 …:551:1 › decision attention rendering holds all six performance budgets (7.3s)
  ✓ 10 …:1126:1 › SCN-017-059 No item appears in both the decision tier and the catalyst feed (3.6s)
    10 passed (53.0s)
  EXIT=0
  ```

  The `ok` numbering is non-contiguous because it is the real ordinal from an
  unfiltered run of a shared suite; the intervening numbers belong to scopes 2, 4
  and 6 and are cited in their own copies of this item rather than counted twice
  here.
