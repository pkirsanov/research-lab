# Bug Specification: BUG-002 Market Brief Session-Date Drift

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Problem Statement

Research Lab publishes the Market Brief from two layers: deterministic Tier A owns `market-brief.snapshot.json` and `brief-history.jsonl`, while Tier B owns the actionable `market-brief.payload.json`. The timer permits a data-only run when Tier B cannot produce a valid narrative. The current implementation treats Tier A as independently publishable even when its `nextSessionDate` advances beyond the retained payload's `nextSession.sessionDate`.

That assumption is false for the visible action block. The page renders Tier-B date, thesis, and actions alongside Tier-A market state, and the executable contract intentionally requires both target dates to match. The current July 16 snapshot plus July 15 payload is therefore an invalid publication, not an acceptable stale payload.

## Outcome Contract

**Intent:** Make scheduled Market Brief publication atomic at the snapshot/payload session boundary while retaining a truthful data-only mode.

**Success Signal:** A failed or skipped Tier-B run can never commit or serve a snapshot/payload pair whose target session dates differ. Same-target stale Tier B remains visibly timestamped and may accompany newer Tier A. A target-date rollover with no valid matching Tier B retains the preceding coherent snapshot/payload/history set while allowing independently useful raw data refreshes to commit.

**Hard Constraints:** Preserve the validator assertion; never cosmetically relabel narrative content; no network or credential dependency in regression tests; exact wrapper-owned dirty-tree preflight; no overwrite of pre-existing owned or unrelated work; pair/history rollback on an invalid candidate; payload/config rollback between failed attempts; scoped staging only; no change to Market Brief rendering or analytical source; and current repository repair from version-controlled coherent bytes.

**Failure Condition:** The fix fails if any commit, worktree exit, or served page can combine a Tier-A target date with Tier-B actions for another date; if a failed candidate leaves payload/config changes behind; if a dirty owned path is overwritten; if unrelated dirty bytes change; if the validator is weakened; or if a test requires Copilot authentication, a secret, or external network access.

## Evidence Basis

| Evidence | Contract conclusion |
| --- | --- |
| Current-session `node scripts/selftest.mjs` | The sole failure is the pair date invariant; Feature 006 Scope 3 assertions are not the cause. |
| `market-brief.payload.json` | The complete narrative and actions explicitly target July 15 and cannot be relabeled truthfully. |
| `market-brief.snapshot.json` and `brief-history.jsonl` | Tier A crossed to July 16 during the after-hours run. |
| Git commits `3d1bbcf...`, `751b85d...`, and `3e5958c...` | Payload, same-date Tier A, and rollover Tier A were published by separate commits; the bad state is committed producer output. |
| `scripts/brief-refresh-and-push.sh` | Candidate Tier A is always staged; retained Tier B is not checked against it; rollback covers payload but not the full publication unit. |
| `scripts/validate-brief-payload.mjs` | The equality assertion is explicit and matches the runbook's action-only next-session contract. |
| `rlbrief.js::renderNextSession` | The browser composes Tier-B actions with Tier-A market state, making cross-date drift user-visible. |

## Actors And Use Cases

| Actor | Goal | Required boundary |
| --- | --- | --- |
| Market Brief reader | See actions that target the session named by the current deterministic context | Never receives a mixed-date action block |
| Scheduled publisher | Refresh useful data without wedging when narrative generation fails | May publish a stale narrative only when the candidate pair validates |
| Repository maintainer | Keep the full selftest as a reliable cross-feature canary | Does not weaken a valid assertion to accommodate broken data |
| Feature 006 owner | Resume Scope 3 after the foreign repository regression is fixed | Requires BUG-002 certification and a green exact selftest replay |

### Single-Capability Justification

This bug changes one concrete capability: the existing Market Brief timer's publication transaction. It does not introduce a second provider, adapter, strategy, renderer, storage abstraction, or reusable cross-feature component. A new foundation/overlay split would add indirection without another implementation variant. The correct boundary is one surgical wrapper repair plus isolated tests around the existing validator and page.

## Requirements

### Pair Coherence

- **BRD-001:** Before any refresh mutation, the currently published payload and snapshot must pass `scripts/validate-brief-payload.mjs`. An invalid baseline fails loud and no scheduled mutation begins.
- **BRD-002:** Before commit, the exact worktree pair selected for publication must pass the unchanged validator.
- **BRD-003:** A retained payload may accompany candidate Tier-A snapshot/history only when the validator accepts that retained payload against the candidate snapshot.
- **BRD-004:** If the retained payload does not validate against candidate Tier A, the wrapper restores snapshot and history to their pre-run bytes and excludes them from the commit. Refreshed raw files under `data/` may remain eligible for a scoped raw-data commit.
- **BRD-005:** A valid newly generated payload advances with its matching candidate snapshot/history in one scoped commit.
- **BRD-006:** `payload.nextSession.sessionDate === snapshot.nextSessionDate` remains mandatory. No stale marker, UI label, command option, or warning bypasses it.

### Attempt And Rollback Atomicity

- **BRD-007:** Each Tier-B attempt starts from the same pre-run payload/config bytes.
- **BRD-008:** A failed, timed-out, or invalid Tier-B attempt restores both payload and config before retry.
- **BRD-009:** Exhausted Tier-B attempts leave no candidate payload/config bytes in the worktree or index.
- **BRD-010:** Any failure after staging removes only wrapper-owned staged changes and restores only bytes proven clean at preflight; it never uses broad stash, reset, clean, or checkout overwrite.
- **BRD-011:** An uncommitted candidate history row is not retained when the visible snapshot candidate is rejected, because it did not become a published brief run.

### Dirty-Worktree Safety

- **BRD-012:** The wrapper checks staged, unstaged, and untracked state for its complete owned mutation set before fetch or refresh.
- **BRD-013:** Any dirty owned path produces a non-mutating refusal naming only path/status metadata, never secret values.
- **BRD-014:** Unrelated dirty paths neither block the owned transaction nor change byte content, index state, or status.
- **BRD-015:** Tests create an isolated temporary Git repository and synthetic non-secret dates; they never run refresh commands against the real checkout.

### Current-State Repair And Compatibility

- **BRD-016:** The current July 15 narrative remains byte-unchanged.
- **BRD-017:** The current committed snapshot/history pair is restored to the last version-controlled Tier-A state whose target date is July 15, using the pre-rollover commit `751b85d72dea16e790cd4e1281f3ed155bd06e60` as the source of truth.
- **BRD-018:** The repaired current pair passes `node scripts/validate-brief-payload.mjs` and the complete `node scripts/selftest.mjs`.
- **BRD-019:** Existing same-target data-only behavior remains valid and visibly stale through the payload's `asOf` and `generatedAt`; crossing the target date changes the result to pair retention.
- **BRD-020:** No Feature 005, Feature 006, shared renderer, shared JavaScript, analytical model, framework-managed path, package/source-lock file, runbook, prompt, selftest source, or validator source changes under this scope.

## User Scenario

### SCN-BUG002-001: Failed Tier B cannot publish prior-session actions beside an advanced Tier-A target

```gherkin
Scenario: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
  Given a clean published snapshot payload and history all target July 15
  And an isolated Tier-A candidate advances nextSessionDate to July 16
  When Tier B fails or is skipped and no valid July 16 payload exists
  Then the wrapper retains the July 15 snapshot payload and published history bytes
  And independently refreshed raw data may commit without the rejected brief candidate
  And the unchanged payload validator and rendered page never observe mixed target dates
```

## Acceptance Criteria

| ID | Acceptance signal |
| --- | --- |
| AC-BUG002-001 | The adversarial regression fails against the original wrapper because it commits or leaves the July 16 snapshot beside the July 15 payload. |
| AC-BUG002-002 | After repair, the same regression observes byte-identical baseline snapshot/payload/history after a failed rollover and a validator pass. |
| AC-BUG002-003 | A same-target Tier-A candidate plus retained Tier B commits successfully and remains visibly timestamped as stale. |
| AC-BUG002-004 | A valid newly generated matching payload advances snapshot/payload/history together. |
| AC-BUG002-005 | Failed attempt one cannot leak a valid-JSON config mutation into successful attempt two. |
| AC-BUG002-006 | A dirty owned path refuses before any stubbed fetch/refresh call; an unrelated dirty file remains byte- and index-identical through a successful isolated run. |
| AC-BUG002-007 | The browser regression serves real `market-brief.html` and asserts that the visible next-session date and action thesis remain on the retained coherent session after a failed rollover. |
| AC-BUG002-008 | The exact Market Brief validator and complete repository selftest both exit 0 after the current pair repair. |
| AC-BUG002-009 | Path-scoped status/diff checks show only authorized delivery files changed, with all protected dirty paths untouched. |

## Test Contract

The required adversarial test is:

- **Title:** `Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails`
- **Path:** `tests/brief-refresh-atomicity.test.mjs`
- **Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
- **Before-fix result:** Must fail against the original wrapper after the isolated Tier-A candidate advances to July 16 and Tier B remains July 15.
- **After-fix result:** Must pass against the repaired wrapper and prove byte-level rollback, no mixed commit, and validator success.

The browser test is:

- **Title:** `Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot`
- **Path:** `tests/market-brief-session-date-drift.spec.mjs`
- **Command:** `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
- **System boundary:** Real production wrapper copied into an isolated temporary Git repository, real production page/renderer bytes served by the existing ephemeral HTTP pattern, and only true external fetch/Copilot boundaries replaced with deterministic local stubs.

No test reads a credential, invokes Copilot, accesses the network, changes the real repository, or prints secret-bearing environment values.

## Excluded Changes

- Weakening, deleting, or conditionally skipping the date-equality assertion.
- Changing only `payload.nextSession.sessionDate` while leaving July 15 thesis, actions, events, and evidence.
- Teaching the page to hide or normalize a mixed pair.
- Rewriting Tier-A analytics, payload narrative, or renderer behavior.
- Replacing scoped Git operations with stash, reset, clean, broad checkout, or whole-worktree restoration.
- Editing the currently dirty runbook, prompt, selftest, untracked validator, Feature 005, Feature 006, or installed Bubbles files.

## Parent Resume Contract

`F006-EXT-SELFTEST-MARKET-BRIEF-001` remains open until BUG-002 implementation, independent test, validation, and audit complete. The parent may resume Feature 006 Scope 3 only after `node scripts/selftest.mjs` exits 0 on current bytes and the parent reruns its exact blocked Scope 3 quality row. This packet does not alter Feature 006 status, DoD, report, test plan, or certification.
