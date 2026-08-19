# Scopes: BUG-013 — Cockpit First-Load Budget Breach

**Workflow mode:** `bugfix-fastlane`
**Filed at commit:** `9af68427b`
**State:** Scope 3 delivered at `831144596`. Scopes 1 and 2 were resolved **upstream by Feature 026**,
not by this packet.

---

## Sequencing Note

Scope 1 is a decision, not an implementation. Scopes 2 and 3 both depend on it, because the byte
target and the artifact's shape are determined by which of the two documented intentions yields.

Scope 1 cannot be discharged by an agent. It requires Feature 026's owner. Attempting Scope 2 first
would mean choosing the remedy implicitly by building one, which is exactly what this packet
refuses to do.

**What happened instead.** Feature 026's owner decided it upstream, in commit `3872df354`, which is
in `HEAD`'s history and not in `9af68427b`'s. `compactRow()` now emits `trackedStates` — a per-symbol
label map — in place of the verbatim `tracked` block. That is candidate remedy 1 applied as a
projection, and `briefFirstLoadMaxBytes` was not raised. The dependency Scope 3 was waiting on is
therefore satisfied, so Scope 3 became executable and was executed. Scopes 1 and 2 keep their
Definition of Done boxes **unticked**: their outcomes hold at `HEAD` by measurement, but this packet
did not do that work and must not claim it. See `design.md` → "Resolution Of The Design Conflict —
Upstream, By Feature 026".

---

## Scope 1: Adjudicate The Recent-Row Payload Contract

**Status:** Resolved upstream by Feature 026 (`3872df354`) — **not delivered by this packet**
**Depends On:** none
**Owner:** Feature 026's owner. **Not agent-dischargeable.**

> **Attribution.** The adjudication happened in Feature 026, before this scope was ever picked up.
> Position A prevails on the verbatim per-instrument block (levels and flags stay in the append-only
> ledger, never first-loaded); Position B keeps its property at label granularity via
> `trackedStates`. The doc comment records the reason and names what is given up. The boxes below
> stay unticked because this packet performed none of that work, and because DoD item 4 is still
> genuinely open: open questions 3 and 5 in `design.md` have no recorded answer. Question 4 is
> answered by Scope 3.

### Problem This Scope Resolves

`compactRow()`'s doc comment holds two deliberate, documented, mutually incompatible intentions.
Position A excludes per-instrument content from the compact projection because that content is what
made the predecessor artifact unaffordable. Position B adds per-instrument content so "what changed
since I last told you" is answerable without a refetch. `tracked` is per-instrument content and is
72% of a v2 row.

No measurement resolves this. It is a tradeoff between a product property and a page-weight budget.

### Gherkin Scenarios

```gherkin
Feature: The recent-row contract states one coherent intention

  Scenario: A reader of compactRow finds a contract it can apply
    Given the doc comment above compactRow
    When a reader asks whether per-instrument state belongs in the compact projection
    Then the comment gives one answer
    And the answer matches what the function emits

  Scenario: The decision records its reason
    Given the owner has chosen between Position A and Position B
    When a later author asks why the artifact is shaped this way
    Then the recorded reason names the tradeoff that was made
    And it names what was given up
```

### Implementation Plan

1. Present the four enumerated candidates from `design.md` with their measured costs.
2. Record the owner's selection and the reason.
3. Record what the selection gives up, in the owner's words.
4. Amend `compactRow()`'s doc comment so its stated exclusion matches what the function emits.
5. Answer open questions 3, 4 and 5 from `design.md`, or record them as deliberately deferred.

### Test Plan

| Test Type | Category | Location | Description |
|---|---|---|---|
| Review | `manual` | this packet | The recorded decision names the chosen position and its cost |
| Static | `unit` | `scripts/selftest.mjs` | An assertion ties the emitted key set to the documented exclusion, so the comment cannot drift from the code again |

### Definition of Done

- [ ] The owner has selected one of the four candidate remedies, and the selection is recorded in this packet with the reason.
- [ ] The recorded decision names what the selection gives up, not only what it achieves.
- [ ] `compactRow()`'s doc comment states one contract, and its exclusion list is consistent with the keys the function emits (FR-013-004).
- [ ] Open questions 3, 4 and 5 from `design.md` are each answered or explicitly deferred with a reason.
- [ ] No source file was modified by this scope beyond the doc comment.

---

## Scope 2: Bring The First-Load Payload Inside Budget At Steady State

**Status:** Resolved upstream by Feature 026 (`3872df354`) — **not delivered by this packet**
**Depends On:** Scope 1

> **Attribution.** Measured at `831144596`: the first-load total is **201,282** against 204,800
> (3,518 under), `brief-history.recent.jsonl` fell 21,006 → **12,901** at the same 30 rows, the
> largest row fell ~4,947 → **804**, and `tracked` is present in **0 of 30** rows. All 30 rows
> already carry `brief-history-recent-row/v2`, so today's 12,901 *is* the steady state rather than a
> projection toward one. `briefFirstLoadMaxBytes` is unchanged at 204,800 — the budget was not
> raised. The boxes below stay unticked because this packet did not do the work; in particular the
> consumer audit named in the last item was performed by Feature 026, not recorded here.

### Problem This Scope Resolves

The first-load total is 209,387 against a 204,800 budget, and projects to ~336,791 once all 30
recent rows carry the v2 contract. Fifteen selftest assertions are red.

Clearing today's number is insufficient. FR-013-002 requires clearing the projection, which is what
makes candidate remedy 4 unusable and what makes candidate remedy 1 insufficient on its own —
removing `tracked` alone lands near 229,841, still over.

### Gherkin Scenarios

```gherkin
Feature: The cockpit first-load payload respects its declared budget

  Scenario: The payload is inside budget as it stands
    Given the seven paths listed in firstLoadPaths
    When their byte lengths are summed
    Then the total is at or below briefFirstLoadMaxBytes

  Scenario: The payload is inside budget once the recent window fully turns over
    Given every row in brief-history.recent.jsonl carries the current row contract
    When the first-load total is projected under that condition
    Then the projected total is at or below briefFirstLoadMaxBytes

  Scenario: The guard that caught this keeps its detection power
    Given the remedy is applied
    When scripts/selftest.mjs runs
    Then the brief-first-load assertion is present and unweakened
    And the total assertion count has not fallen from the 3012-passed baseline
```

### Implementation Plan

1. Apply the remedy selected in Scope 1.
2. Measure the first-load total directly from the seven `firstLoadPaths`.
3. Project the total with all 30 recent rows at the post-remedy contract, and record the arithmetic.
4. If the row contract changed shape, update `RECENT_CONTRACT` and keep the prior version named for readers (FR-013-006).
5. Audit every consumer of `brief-history.recent.jsonl` against the post-remedy shape.

### Test Plan

| Test Type | Category | Location | Description |
|---|---|---|---|
| Unit | `unit` | `scripts/selftest.mjs` | The first-load inventory is at or below budget |
| Unit | `unit` | `scripts/selftest.mjs` | A projection with all rows at the current contract is at or below budget |
| Unit | `unit` | `scripts/selftest.mjs` | The `brief-first-load` assertion exists and is not skipped |
| Regression | `unit` | `scripts/selftest.mjs` | An adversarial oversized recent artifact still fails the budget check |
| Contract | `unit` | `scripts/selftest.mjs` | Every consumer of the recent artifact reads the post-remedy shape |

### Definition of Done

- [ ] The first-load total, measured directly from the seven `firstLoadPaths`, is at or below `briefFirstLoadMaxBytes` (FR-013-001).
- [ ] A projection with all 30 recent rows at the post-remedy contract is recorded, and is at or below the budget (FR-013-002).
- [ ] `node scripts/selftest.mjs` reports 0 failed.
- [ ] The selftest assertion count has not fallen below the 3012 baseline recorded at `9af68427b` (FR-013-005).
- [ ] The `brief-first-load` assertion is present, unweakened, and not skipped (FR-013-005).
- [ ] An adversarial regression case supplies an oversized recent artifact and the budget check fails on it, proving the guard would still catch a recurrence.
- [ ] If the row shape changed, `RECENT_CONTRACT` reflects it and the prior contract stays exported and named (FR-013-006).
- [ ] Every consumer of `brief-history.recent.jsonl` was audited against the post-remedy shape, and the audit is recorded.

---

## Scope 3: Give The Recent Artifact A Byte Bound That Binds

**Status:** [x] Done — delivered at `831144596` (working tree, uncommitted)
**Depends On:** Scope 1 — satisfied upstream by Feature 026 (`3872df354`)

### Problem This Scope Resolves

The retention policy bounds rows, not bytes. `briefHistoryRecentMaxRows` is 30 and held exactly
across the regression, so it constrained nothing.

`briefHistoryRecentMaxBytes` exists but is 204,800, identical to `briefFirstLoadMaxBytes`. One file
of seven may consume the entire payload allowance alone. At the projected steady state of 148,410
bytes the file is still inside its own per-file budget while the aggregate is 1.64x over. The
per-file guard cannot fire before the aggregate guard in any scenario, so it detects nothing the
aggregate does not.

Without this scope, the next per-row growth reproduces this defect exactly.

### Gherkin Scenarios

```gherkin
Feature: The recent artifact is bounded in the dimension that constrains it

  Scenario: A per-row size increase is caught by the artifact's own bound
    Given the recent artifact holds its configured row count
    When per-row size grows enough to threaten the first-load budget
    Then the recent artifact's own byte bound fails first
    And the failure names the recent artifact rather than the aggregate

  Scenario: The per-file bound cannot be satisfied by the whole-payload budget
    Given briefHistoryRecentMaxBytes is compared against briefFirstLoadMaxBytes
    When the two values are read
    Then the per-file bound is strictly smaller than the whole-payload bound
```

### Implementation Plan

1. Derive a per-file byte bound for `brief-history.recent.jsonl` from the share of the first-load budget this artifact is intended to occupy.
2. Set `briefHistoryRecentMaxBytes` to that value.
3. Add an assertion that `briefHistoryRecentMaxBytes` is strictly less than `briefFirstLoadMaxBytes`, so the non-binding configuration cannot return.
4. Record why the chosen share is the right share.

### Test Plan

| Test Type | Category | Location | Description |
|---|---|---|---|
| Unit | `unit` | `scripts/selftest.mjs` | `briefHistoryRecentMaxBytes` is strictly less than `briefFirstLoadMaxBytes` |
| Unit | `unit` | `scripts/selftest.mjs` | The recent artifact is at or below its own byte bound |
| Regression | `unit` | `scripts/selftest.mjs` | An adversarial artifact sized between the per-file bound and the aggregate bound fails the per-file check, proving it binds first |

### Definition of Done

- [x] `briefHistoryRecentMaxBytes` is strictly less than `briefFirstLoadMaxBytes`, and an assertion enforces that relationship (FR-013-003).

  **Claim Source:** executed. `briefHistoryRecentMaxBytes` set 204800 → **40960** in
  `tool-experience.config.json`; the relationship is asserted in `scripts/selftest.mjs`.

  ```
  $ node scripts/selftest.mjs        # bounded-history group, verbatim
    ✓ the recent window’s per-file byte bound is strictly smaller than the whole-payload budget
      (40960 < 204800), so it is capable of firing at all
    ✓ the recent window is inside its declared byte budget (12901 <= 40960)
    ✓ the recent window is inside its declared row budget (30 <= 30)
    ✓ the cockpit’s whole first-load payload is inside budget (197 KB <= 200 KB)

  $ node scripts/validate-tool-experience.mjs ; echo "VALIDATOR_EXIT=$?"
  [tool-experience] artifact=brief-history-recent bytes=12901 budget=40960 result=PASS
  [tool-experience] artifact=brief-history-recent-rows bytes=30 budget=30 result=PASS
  [tool-experience] artifact=brief-first-load bytes=201282 budget=204800 result=PASS
  [tool-experience] OK adversarial=13 unexpectedAcceptances=0
  VALIDATOR_EXIT=0
  ```

- [x] The chosen value is derived from a stated share of the first-load budget, and the derivation is recorded.

  **Claim Source:** executed (measurements) + recorded (`design.md` → "The Per-File Byte Bound —
  The Chosen Value And Why"). 40,960 is **exactly one fifth of `briefFirstLoadMaxBytes`**, the share
  a supporting history strip is granted among seven first-load files. It occupies 6.3% today, so the
  share lets it triple and still be the fourth-largest of the seven.

  ```
  $ node -e '...'   # byte lengths of the seven firstLoadPaths, measured
      7970  market-brief.config.page.json
     93049  market-brief.page.json
      2124  watchlist.json
     12901  brief-history.recent.jsonl
     69881  market-brief.snapshot.page.json
      3157  market-brief.tools.page.json
     12200  market-brief.scorecard.json
  first-load total = 201282  budget=204800  headroom=3518
  recent.jsonl bytes=12901 rows=30 maxRowBytes=804 minRowBytes=399 avg=430
  30-row projection at largest row = 24120
  rows carrying tracked = 0 of 30
  ```

  Headroom: **3.17x** today's 12,901 · **1.70x** the 24,120 all-rows-at-largest projection ·
  **1.55x** the 26,490 re-serialised figure · **5.0x smaller** than the aggregate bound ·
  **0.28x** the 148,170-byte regression, which it refuses.

- [x] An adversarial regression case supplies an artifact sized above the per-file bound but below the aggregate bound, and the per-file check fails on it, proving it binds first.

  **Claim Source:** executed. The production checker `validateArtifactBudgets` is run over synthetic
  inventories; `brief-history-recent` precedes `brief-first-load` in its check list and `invariant`
  throws on the first breach, so the refusal names this artifact and the aggregate is never reached.
  Nothing was written to disk — `brief-history.recent.jsonl` is unmodified.

  ```
  synthesized regression artifact: rows=30 bytes=135871 (~4529 B/row) -- held in memory, never written
  A. regression artifact vs new bound 40960 ......... REFUSED: brief-history-recent exceeds configured artifact byte budget
     aggregate at that size would be 324252 > 204800, yet the refusal names brief-history-recent: the per-file check is evaluated first.
  B. 51200 B recent inside a 200000 B payload the aggregate ACCEPTS . REFUSED: brief-history-recent exceeds configured artifact byte budget
  C. same case under the OLD equal-budgets config (204800) ......... ACCEPTED
  D. regression artifact under the OLD config ...................... REFUSED: brief-first-load exceeds configured artifact byte budget
  E. control - todays real inventory .............................. ACCEPTED
  ```

  **B vs C is the proof the DoD asks for**: 51,200 bytes is above the per-file bound and inside a
  200,000-byte payload the aggregate accepts, so only the per-file bound can refuse it — and under
  the old equal-budgets value it was ACCEPTED. **D is the proof of inertness being removed**: at
  135,871 bytes the old per-file guard still did not fire; the aggregate did. **E** shows the
  refusals are conditional, not an unconditional thrower.

  The same cases run inside `scripts/selftest.mjs`, at the packet's recorded 4,939 B/row:

  ```
    ✓ the production budget checker accepts today’s real inventory (12901 B recent inside 201282 B payload)
    ✓ a 148170-byte recent artifact is refused by its own bound, named, before the aggregate check is
      evaluated ("brief-history-recent exceeds configured artifact byte budget")
    ✓ a 51200-byte recent artifact inside a 200000-byte payload the aggregate accepts is still refused
      by the per-file bound
    ✓ the identical artifact was ACCEPTED under the old equal-budgets configuration, so tightening the
      per-file bound is what created the detection
  ```

- [x] `briefHistoryRecentMaxRows` is retained or removed with a recorded reason, so the row cap's role after this change is explicit.

  **Claim Source:** recorded (`design.md` → "The row cap is retained"), grounded in executed
  measurement. **Retained at 30.** The two caps constrain different things and neither implies the
  other: the row cap bounds how much history the trend strip *shows*; the byte cap bounds what the
  payload *costs*. The regression held the row cap exactly — `the recent window is inside its
  declared row budget (30 <= 30)` was green throughout — while multiplying the price of a row by
  12.4x. Removing the row cap would let a future cheap-row encoding silently widen the window.

- [x] `node scripts/selftest.mjs` reports 0 failed.

  **Claim Source:** executed.

  ```
  $ node scripts/selftest.mjs ; echo "SELFTEST_EXIT=$?"
  Research-Lab self-test: 3047 passed, 0 failed
  SELFTEST_EXIT=0
  ```

  3,047 ≥ the 3,042 pre-change count and ≥ the 3,012 baseline recorded at `9af68427b`; the five new
  assertions are the ones quoted above. The `brief-first-load` assertion is present and unweakened.

---

## Cross-Scope Definition of Done

- [x] All acceptance criteria AC-1 through AC-7 in `spec.md` are satisfied, each against executed evidence.

  **Claim Source:** executed. AC-1 `3047 passed, 0 failed` (≥ 3,012 baseline). AC-2 first-load
  `201282 <= 204800`, summed directly from the seven `firstLoadPaths`. AC-3 all 30 rows already
  carry `brief-history-recent-row/v2`, so 12,901 *is* the steady state; the pessimistic
  all-rows-at-largest projection is `804 x 30 = 24,120`, and the payload at that size is
  `188,381 + 24,120 = 212,501`… **see the note below.** AC-4 the per-file bound refuses at 40,961
  and names the artifact before the aggregate is evaluated. AC-5/AC-6/AC-7 executed:

  ```
  AC-5 doc-comment exclusion list  = ["toolReads","toolCoverage","groups","sectors","names"]
  AC-5 emitted keys                = ["contractVersion","ts","window","marketClosed","nextSessionDate",
                                      "regimeBand","regimeScore","vix","fearGreed","bench","crossAsset",
                                      "trackedStates","claims","dark"]
  AC-5 excluded names emitted      = []   (empty => doc comment and code agree)
  AC-5 emits verbatim `tracked`?   = false   emits `trackedStates`? = true
  AC-7 RECENT_CONTRACT             = brief-history-recent-row/v2
  AC-7 RECENT_CONTRACT_V1 exported = brief-history-recent-row/v1
  AC-6 brief-first-load assertion present in selftest = true
  ```

  **Uncertainty declaration on AC-3.** AC-3 is satisfied on its own terms — all 30 rows carry the
  current contract and the measured total is inside budget. The *pessimistic* variant, every row at
  the largest committed row, lands at 212,501 and would be over. That is a hypothetical the packet
  never required and the aggregate guard would catch, but it is stated rather than omitted: the
  aggregate has only 3,518 bytes of headroom today, and the other six files own 188,381 of it. That
  is a live exposure and it belongs to Scope 2's owner, not to this scope.

- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count from the 3012 baseline.

  **Claim Source:** executed. `Research-Lab self-test: 3047 passed, 0 failed`, `SELFTEST_EXIT=0`.
  3,042 before this change, 3,047 after: five added, none removed.

- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-013-brief-recent-row-v2-breaches-cockpit-first-load-budget` exits 0 on the completed packet.

  **Claim Source:** executed. See `report.md` → "Scope 3 execution evidence".

- [x] No remedy weakened, skipped, or deleted the `brief-first-load` assertion (FR-013-005).

  **Claim Source:** executed. The assertion is present and passing, its adversarial `unbounded log`
  companion is untouched, and the suite's assertion count rose from 3,042 to 3,047.

  ```
  $ node scripts/selftest.mjs        # bounded-history group, verbatim
    ✓ the cockpit’s whole first-load payload is inside budget (197 KB <= 200 KB)
    ✓ the unbounded log genuinely exceeds the budget (7147 KB), so fetching it would FAIL this test
      rather than slip through
    ✓ the first-load budget is DECLARED in tool-experience.config.json artifactBudgets, not left implicit
  Research-Lab self-test: 3047 passed, 0 failed

  $ node -e '...'   # the assertion still exists in source
  AC-6 brief-first-load assertion present in selftest = true
  ```

- [x] The decision recorded in Scope 1 is reflected in the code, and the code is reflected in the doc comment.

  **Claim Source:** executed, and **attributed to Feature 026, not to this packet**. `compactRow()`
  is invoked on a live row and its emitted key set is intersected with the doc comment's exclusion
  list; the intersection is empty, and the verbatim `tracked` key is gone.

  ```
  AC-5 doc-comment exclusion list  = ["toolReads","toolCoverage","groups","sectors","names"]
  AC-5 excluded names emitted      = []   (empty => doc comment and code agree)
  AC-5 emits verbatim `tracked`?   = false   emits `trackedStates`? = true
  ```
