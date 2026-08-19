# Scopes: BUG-013 — Cockpit First-Load Budget Breach

**Workflow mode:** `bugfix-fastlane`
**Filed at commit:** `9af68427b`
**State:** Filed. No scope started. No Definition of Done item is ticked.

---

## Sequencing Note

Scope 1 is a decision, not an implementation. Scopes 2 and 3 both depend on it, because the byte
target and the artifact's shape are determined by which of the two documented intentions yields.

Scope 1 cannot be discharged by an agent. It requires Feature 026's owner. Attempting Scope 2 first
would mean choosing the remedy implicitly by building one, which is exactly what this packet
refuses to do.

---

## Scope 1: Adjudicate The Recent-Row Payload Contract

**Status:** [ ] Not Started
**Depends On:** none
**Owner:** Feature 026's owner. **Not agent-dischargeable.**

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

**Status:** [ ] Not Started
**Depends On:** Scope 1

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

**Status:** [ ] Not Started
**Depends On:** Scope 1

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

- [ ] `briefHistoryRecentMaxBytes` is strictly less than `briefFirstLoadMaxBytes`, and an assertion enforces that relationship (FR-013-003).
- [ ] The chosen value is derived from a stated share of the first-load budget, and the derivation is recorded.
- [ ] An adversarial regression case supplies an artifact sized above the per-file bound but below the aggregate bound, and the per-file check fails on it, proving it binds first.
- [ ] `briefHistoryRecentMaxRows` is retained or removed with a recorded reason, so the row cap's role after this change is explicit.
- [ ] `node scripts/selftest.mjs` reports 0 failed.

---

## Cross-Scope Definition of Done

- [ ] All acceptance criteria AC-1 through AC-7 in `spec.md` are satisfied, each against executed evidence.
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count from the 3012 baseline.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-013-brief-recent-row-v2-breaches-cockpit-first-load-budget` exits 0 on the completed packet.
- [ ] No remedy weakened, skipped, or deleted the `brief-first-load` assertion (FR-013-005).
- [ ] The decision recorded in Scope 1 is reflected in the code, and the code is reflected in the doc comment.
