# Report: BUG-002 Market Brief Session-Date Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Summary

- Reproduced `F006-EXT-SELFTEST-MARKET-BRIEF-001` from unchanged current bytes with the exact repository command.
- Confirmed the sole failure is the Market Brief payload/snapshot target-date invariant: `496 passed, 1 failed`.
- Traced the invalid pair to the committed scheduler path: a July 15 narrative commit followed by same-date and rollover Tier-A-only commits.
- Classified the observed state as invalid stale Tier B caused by wrapper publication atomicity, while preserving same-target visibly stale Tier B as valid data-only behavior.
- Created a complete planning packet only. No delivery, test, validation, audit, certification, or parent-feature mutation is claimed.

## Completion Statement

BUG-002 remains In Progress. Root cause and an implementation-ready one-scope plan are complete, but the wrapper, current data pair, regressions, independent test matrix, and certification have not been changed or executed. The next required owner is `bubbles.implement` for scenario-first RED and SCOPE-01 delivery.

## Bug Reproduction - Before Fix

**Phase:** bug-discovery  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** executed  
**Output window:** Market Brief group plus final summary from the full current-session output; unrelated passing groups remain in the terminal capture.

```text
rlapp.js — one key surface, all-page status, automatic stale-data refresh
  ✓ every registered tool loads the shared data-status shell
  ✓ every registered tool loads RLDATA before RLAPP
  ✓ the landing page exposes status-only current-document provider policy without a credential editor
  ✓ tool pages expose no duplicate credential inputs
  ✓ registered tools expose no duplicate provider credential setter migration or durable storage access
  ✓ registered tools expose no credential-bearing provider URL transport
  ✓ market brief refreshes its live layer automatically
  ✓ swing and intraday pages fetch only stale/missing shared deltas on boot
  ✓ options structure auto-loads its selected chain without optional cross-origin probes
  ✓ strategy validation auto-refreshes enabled instruments from shared bars
  ✓ same-origin bar snapshots include brief thematic-group ETFs and members

market brief — registry-wide coverage + action-only payload contract
  ✗ FAIL: current payload satisfies the executable brief contract: nextSession.sessionDate must match snapshot.nextSessionDate
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp

================================================
Research-Lab self-test: 496 passed, 1 failed
================================================
```

**Result:** FAIL, reproduced exactly. The output establishes the repository regression and shows that the surrounding shared status and Market Brief negative-contract assertions still pass.

## Current Pair Inspection

**Phase:** bug-analysis  
**Claim Source:** interpreted  
**Interpretation:** Direct reads of the current JSON show a whole-payload semantic mismatch, not a single stale scalar. The payload's date, thesis, actions, bars note, and events target July 15; the snapshot targets July 16.

| Artifact | Current fact |
| --- | --- |
| `market-brief.payload.json` | `window=pre-market`; `asOf=2026-07-15T07:32:00-04:00`; `generatedAt=2026-07-15T10:53:00-04:00`; `nextSession.sessionDate=2026-07-15` |
| Payload narrative | Thesis says `targeting today's regular session`; actions reference today's PPI and July 15 triggers; event rows include July 15 and July 16 |
| `market-brief.snapshot.json` | `window=after-hours`; `generatedAt=2026-07-15T21:02:38.507Z`; `nextSessionDate=2026-07-16` |
| `brief-history.jsonl` | Row 40 targets July 15; row 41 advances to July 16 |
| `rlbrief.js` | `renderNextSession` takes date/thesis/actions from payload and market state from snapshot |

Changing the payload date alone is prohibited because it would present July 15 reasoning as a July 16 plan.

## Commit Provenance

**Phase:** bug-analysis  
**Command:** `git status --short --untracked-files=all -- market-brief.payload.json market-brief.snapshot.json brief-history.jsonl scripts/brief-refresh.mjs scripts/brief-refresh-and-push.sh scripts/validate-brief-payload.mjs scripts/selftest.mjs notes/market-brief.md .github/prompts/market-brief-update.prompt.md specs/_bugs/BUG-002-market-brief-session-date-drift` plus path-scoped `git log` queries from the same command invocation  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG002_PROVENANCE_BEGIN
 M .github/prompts/market-brief-update.prompt.md
 M notes/market-brief.md
 M scripts/selftest.mjs
?? scripts/validate-brief-payload.mjs
LAST_TOUCH_PAYLOAD
3d1bbcf6b713bdc685f2d45bc2b65c72338a2275
2026-07-15T08:00:03-07:00
market-brief: pre-market 2026-07-15 narrative regeneration
LAST_TOUCH_SNAPSHOT
3e5958ce9b2eee4977cb87a59b7cf18264c3d11d
2026-07-15T14:32:41-07:00
market-brief: Tier-A data-only refresh 2026-07-15 17:32 EDT (after-hours)
LAST_TOUCH_HISTORY
3e5958ce9b2eee4977cb87a59b7cf18264c3d11d
2026-07-15T14:32:41-07:00
market-brief: Tier-A data-only refresh 2026-07-15 17:32 EDT (after-hours)
RECENT_MARKET_BRIEF_COMMITS
commit=3e5958ce9b2eee4977cb87a59b7cf18264c3d11d
authorDate=2026-07-15T14:32:41-07:00
subject=market-brief: Tier-A data-only refresh 2026-07-15 17:32 EDT (after-hours)

M       brief-history.jsonl
M       market-brief.snapshot.json
commit=751b85d72dea16e790cd4e1281f3ed155bd06e60
authorDate=2026-07-15T12:32:33-07:00
subject=market-brief: Tier-A data-only refresh 2026-07-15 15:32 EDT (pre-close)

M       brief-history.jsonl
M       market-brief.snapshot.json
commit=3d1bbcf6b713bdc685f2d45bc2b65c72338a2275
authorDate=2026-07-15T08:00:03-07:00
subject=market-brief: pre-market 2026-07-15 narrative regeneration

M       market-brief.payload.json
BUG002_PROVENANCE_END
```

**Result:** PASS as diagnostic evidence. The bad pair is committed output of the data-only branch. The current protected dirty paths are also explicit before packet creation.

## Root Cause Decision

**Phase:** bug-analysis  
**Claim Source:** interpreted  
**Interpretation:** The source and commit evidence form one causal chain: Tier A crossed the target date, Tier B did not regenerate, the wrapper staged Tier A unconditionally, and no pair validation ran before commit.

| Finding | Evidence | Decision |
| --- | --- | --- |
| Invalid stale Tier B | Current payload/snapshot differ and renderer composes them | Retain the prior coherent pair on a failed rollover |
| Same-target stale Tier B | Runbook permits data-only publication and payload timestamps expose age | Keep only when the retained payload validates against candidate Tier A |
| Wrapper atomicity | Unconditional Tier-A staging plus payload-only rollback | Primary code defect |
| Validator correctness | Explicit requirement and user-visible action semantics agree | Preserve unchanged |

## Regression Contract

The exact adversarial regression planned in [scopes.md](scopes.md) is `Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails` in `tests/brief-refresh-atomicity.test.mjs`, run with `node --test tests/brief-refresh-atomicity.test.mjs`. Its discriminator is a candidate July 16 Tier A beside retained July 15 Tier B. It must fail before the wrapper edit and pass after byte-level pair/history retention.

The E2E contract is `Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot` in `tests/market-brief-session-date-drift.spec.mjs`, run through the checkout-local Playwright 1.61.1 `system-chrome` project. It serves real production page/renderer bytes over ephemeral HTTP and uses no request interception.

## Test Evidence

| Test surface | Current-session status | Evidence boundary |
| --- | --- | --- |
| `node scripts/selftest.mjs` | Executed, exit 1, `496 passed, 1 failed` | Valid before-fix reproduction; not after-fix proof |
| `node scripts/validate-brief-payload.mjs` | Executed, exit 1, exact date mismatch | Supporting before-fix contract reproduction; not a completion claim |
| `node --test tests/brief-refresh-atomicity.test.mjs` | Not run; file does not exist in this planning phase | Must RED before wrapper edit and GREEN after repair |
| Focused BUG-002 Playwright title | Not run; file does not exist in this planning phase | Must execute over real HTTP after implementation |
| Complete BUG-002 Playwright file | Not run; file does not exist in this planning phase | Independent focused-file evidence required |
| Broader Playwright inventory | Not run in this bug-packet invocation | Required after focused rows pass |

No planned row is represented as passing. Exact commands, titles, isolation rules, and assertions are in [scopes.md](scopes.md) and `test-plan.json`.

## Bug Verification - After Fix

**Phase:** validate  
**Claim Source:** not-run  
**Reason:** This invocation was restricted to bug artifacts. No wrapper, current pair, regression test, or product byte was changed, so after-fix execution would be false evidence.

> **Uncertainty Declaration**
> **What was attempted:** Current-session before-fix selftest reproduction, narrow contract reproduction, source-path analysis, current JSON inspection, and Git provenance inspection.
> **What was observed:** The current pair remains invalid and `node scripts/selftest.mjs` exits 1.
> **Why this is uncertain:** There is no implemented fix or independent verification result to evaluate.
> **What would resolve this:** Execute the exact RED/GREEN, validator, selftest, focused E2E, broader E2E, rollback, dirty-boundary, and gate commands in [scopes.md](scopes.md) after SCOPE-01 implementation.

## Code Diff Boundary

The intended delta from this invocation is exactly the nine files under `specs/_bugs/BUG-002-market-brief-session-date-drift/`. The current prompt, runbook, selftest, untracked validator, payload, snapshot, history, wrapper, Feature 005, Feature 006, shared JavaScript, package graph, and framework installation were not edited.

## Finding Accounting

| Finding | Disposition in this invocation | Remaining owner |
| --- | --- | --- |
| `BUG002-RCA-001` | Addressed: controlling scheduler path, invalid-state classification, valid same-target exception, and validator decision are grounded in current evidence | None |
| `BUG002-PLANNING-001` | Addressed: one-scope implementation, regression, rollback, dirty-boundary, current-repair, and parent-resume contracts are complete | None |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Preserved unresolved with exact current reproduction and parent traceability | `bubbles.implement`, then test/validate owners |
| `BUG002-WRAPPER-ATOMICITY` | Unresolved: production wrapper still publishes cross-date candidate Tier A | `bubbles.implement` |
| `BUG002-REGRESSION-GAP` | Unresolved: exact functional and E2E tests are planned but do not exist yet | `bubbles.implement`, then `bubbles.test` |
| `BUG002-DIRTY-BOUNDARY` | Unresolved: runtime preflight and rollback behavior are designed but not implemented | `bubbles.implement` |

## Invocation Audit

No workflow runner or subagent was invoked. The user explicitly required the parent `bubbles.goal` direct-authorized runner context to receive a self-contained `bubbles.bug` packet without nested dispatch.

## SCOPE-01 Implementation Resume

**Phase:** implement  
**Claim Source:** executed  
**Observed at:** `2026-07-16T04:07:11Z`

This resume began after concurrent work had already added the wrapper transaction and all three BUG-002 test files. The required first command therefore tested those current bytes rather than the historical original wrapper. It passed all eight cases and falsified the local hypothesis that another wrapper repair was needed.

### Initial Focused Current-Bytes Verdict

**Executed:** YES (in current session, before any author-time edit by this invocation)  
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`  
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
[bug002-atomicity] wrapperExit=0
[bug002-atomicity] baselineDate=2026-07-15
[bug002-atomicity] candidateDate=2026-07-16
[bug002-atomicity] payloadDate=2026-07-15
[bug002-atomicity] snapshotDate=2026-07-15
[bug002-atomicity] snapshotRetained=true
[bug002-atomicity] historyRetained=true
[bug002-atomicity] payloadRetained=true
[bug002-atomicity] staged=""
[bug002-atomicity] status=""
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (766.7605ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (2466.214792ms)
✔ matching generated Tier B advances snapshot payload and history together (1105.781ms)
✔ failed narrative attempt restores config before a successful retry (739.959625ms)
✔ dirty owned publication path refuses before every external boundary (243.369083ms)
✔ invalid clean baseline refuses before every external boundary (378.547583ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (549.914542ms)
✔ forced final validation failure restores every owned baseline byte and index path (571.6795ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6895.696417
```

**Result:** PASS. The existing wrapper satisfies the planned transaction matrix, so this invocation did not edit it.

The initial resumed run did not provide RED evidence because the working-tree wrapper was already repaired. The immutable pre-fix replay below resolves that evidence gap without changing production bytes.

### Final Immutable Pre-Fix RED And Working-Tree GREEN

**Phase:** implement  
**Claim Source:** executed  
**Pre-fix source:** committed `HEAD:scripts/brief-refresh-and-push.sh`, copied by the test support into each isolated temporary fixture when `BUG002_WRAPPER_SOURCE=HEAD` is set  
**Production mutation during proof:** none

**RED command:** `BUG002_WRAPPER_SOURCE=HEAD node --test tests/brief-refresh-atomicity.test.mjs` (executed through the Bubbles tool-log wrapper)  
**Exit Code:** 1  
**Raw output window:**

```text
[bug002-atomicity] wrapperExit=0
[bug002-atomicity] baselineDate=2026-07-15
[bug002-atomicity] candidateDate=2026-07-16
[bug002-atomicity] payloadDate=2026-07-15
[bug002-atomicity] snapshotDate=2026-07-16
[bug002-atomicity] snapshotRetained=false
[bug002-atomicity] historyRetained=false
[bug002-atomicity] payloadRetained=true
[bug002-atomicity] staged=""
[bug002-atomicity] status=""
✖ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✖ staged owned publication path refuses without changing its index entry
✖ untracked owned data path refuses before every external boundary
ℹ tests 10
ℹ pass 1
ℹ fail 9
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: failed rollover retains the prior snapshot target
+ actual - expected
+ '2026-07-16'
- '2026-07-15'
[tool-log] recorded exit=1 duration=4554ms
```

**Result:** EXPECTED FAIL. The committed pre-fix wrapper publishes the July 16 Tier-A candidate beside the retained July 15 payload and lacks the planned owned-path refusal and rollback behavior.

**GREEN command:** `node --test tests/brief-refresh-atomicity.test.mjs` (executed through the Bubbles tool-log wrapper)  
**Exit Code:** 0  
**Raw output window:**

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5620.76125
[tool-log] recorded exit=0 duration=5671ms
```

**Result:** PASS. The final matrix changes from `1/10` under immutable pre-fix bytes to `10/10` under the repaired wrapper, with no production or test edit between the two executions.

### Exact Current-Pair Repair Identity

The initial read-only baseline showed a clean but invalid current pair and an unchanged payload:

```text
CURRENT_BLOB_IDS_PAYLOAD_SNAPSHOT_HISTORY
25452eff0d384f71adbea92597f0917f79ec0c1a
09a9117b3f4e76987ecaaa241a92162e2c7734bb
1e422624cf3add0a82cb28ca00581141b159a980
SOURCE_BLOB_IDS_SNAPSHOT_HISTORY
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
```

While this invocation was retrieving the immutable source bytes read-only, concurrent work changed only the two planned repair targets. The just-in-time recheck observed exact source-commit identity, so this invocation preserved those concurrent bytes rather than overwriting them.

**Executed:** YES  
**Command:** `git hash-object market-brief.payload.json market-brief.snapshot.json brief-history.jsonl` plus `git rev-parse '751b85d72dea16e790cd4e1281f3ed155bd06e60:market-brief.snapshot.json' '751b85d72dea16e790cd4e1281f3ed155bd06e60:brief-history.jsonl'`  
**Exit Code:** 0  
**Claim Source:** executed  
**Output:**

```text
CURRENT_BLOB_IDS_PAYLOAD_SNAPSHOT_HISTORY
25452eff0d384f71adbea92597f0917f79ec0c1a
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
SOURCE_BLOB_IDS_SNAPSHOT_HISTORY
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
```

**Result:** PASS. Snapshot and history are byte-identical to commit `751b85d72dea16e790cd4e1281f3ed155bd06e60`; payload retained its initial/current Git blob ID.

### Post-Repair Functional Matrix

**Executed:** YES  
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Output:**

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (585.476417ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (524.687208ms)
✔ matching generated Tier B advances snapshot payload and history together (783.327667ms)
✔ failed narrative attempt restores config before a successful retry (1444.473792ms)
✔ dirty owned publication path refuses before every external boundary (287.759917ms)
✔ invalid clean baseline refuses before every external boundary (370.774292ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (732.674292ms)
✔ forced final validation failure restores every owned baseline byte and index path (646.739791ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5450.685167
```

**Result:** PASS. The complete functional transaction, rollback, invalid-baseline, and dirty-worktree matrix is green after the exact pair repair.

### Current-Pair Contract And Repository Canary

**Executed:** YES  
**Commands:** `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`  
**Exit Codes:** 0; 0  
**Claim Source:** executed  
**Output window:**

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid

market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp

================================================
Research-Lab self-test: 497 passed, 0 failed
================================================
```

**Result:** PASS. `F006-EXT-SELFTEST-MARKET-BRIEF-001` is implementation-addressed on current bytes; Feature 006 remains untouched and owns its own replay.

### Focused Browser Regression

**Executed:** YES  
**Commands:**

- `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
- `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0  
**Claim Source:** executed  
**Protected-title output:**

```text
Running 1 test using 1 worker

  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.8s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
Switched to a new branch 'main'
To /var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T/research-lab-bug002-evhtYM/remote.git
 * [new branch]      main -> main

  1 passed (3.7s)
```

**Complete focused-file output:**

```text
Running 1 test using 1 worker

  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (5.0s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
Switched to a new branch 'main'
To /var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T/research-lab-bug002-kQYGa1/remote.git
 * [new branch]      main -> main

  1 passed (9.5s)
```

**Result:** PASS. The protected title and complete BUG-002 browser file both pass through checkout-local Playwright 1.61.1 and `system-chrome` over the real ephemeral HTTP fixture.

### Implementation Integrity And Dirty Boundary

**Executed:** YES  
**Commands:** `bash -n scripts/brief-refresh-and-push.sh`; path-scoped `git diff --check`; current/source blob checks; explicit path-scoped `git status --short --untracked-files=all`  
**Exit Code:** 0  
**Claim Source:** executed  
**Output window:**

```text
BUG002_IMPLEMENT_INTEGRITY_BEGIN
BASH_N_EXIT=0
DIFF_CHECK_EXIT=0
CURRENT_BLOB_IDS_PAYLOAD_SNAPSHOT_HISTORY
25452eff0d384f71adbea92597f0917f79ec0c1a
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
SOURCE_BLOB_IDS_SNAPSHOT_HISTORY
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
EXPLICIT_BOUNDARY_STATUS
 M .github/prompts/market-brief-update.prompt.md
 M brief-history.jsonl
 M market-brief.snapshot.json
 M notes/market-brief.md
 M scripts/brief-refresh-and-push.sh
 M scripts/selftest.mjs
?? tests/brief-refresh-atomicity.support.mjs
?? tests/brief-refresh-atomicity.test.mjs
?? tests/market-brief-session-date-drift.spec.mjs
BUG002_IMPLEMENT_INTEGRITY_END
```

**Result:** PASS for the executed implementation subset. The protected prompt, runbook, selftest, Feature 006 artifacts, and unrelated paths were not edited, staged, restored, cleaned, or normalized by this invocation. Broader regression, governance, independent test, validate, and audit gates are not claimed here.

## Implementation Finding Accounting

| Finding | Implementation disposition | Evidence | Next owner |
| --- | --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed on current bytes: exact repository canary changed from the reproduced `496/1` mismatch to `497/0` without editing Feature 006 or `scripts/selftest.mjs` | [Current-Pair Contract And Repository Canary](#current-pair-contract-and-repository-canary) | `bubbles.test` for independent verification |
| `BUG002-WRAPPER-ATOMICITY` | Addressed by the resumed wrapper bytes: all eight transaction cases pass; no additional local wrapper change was justified | [Initial Focused Current-Bytes Verdict](#initial-focused-current-bytes-verdict), [Post-Repair Functional Matrix](#post-repair-functional-matrix) | `bubbles.test` |
| `BUG002-REGRESSION-GAP` | Addressed at implementation level: functional matrix plus protected-title and complete-file Playwright regressions exist and pass | [Post-Repair Functional Matrix](#post-repair-functional-matrix), [Focused Browser Regression](#focused-browser-regression) | `bubbles.test` |
| `BUG002-DIRTY-BOUNDARY` | Addressed at implementation level: owned dirt refuses, unrelated staged/unstaged dirt remains identical in isolated fixtures, and actual protected paths remained outside this invocation's write boundary | [Post-Repair Functional Matrix](#post-repair-functional-matrix), [Implementation Integrity And Dirty Boundary](#implementation-integrity-and-dirty-boundary) | `bubbles.test` |

## Implementation Handoff

BUG-002 remains In Progress. The implementation-owned focused matrix, exact pair identity, unchanged validator, complete repository canary, shell parse, diff integrity, and focused browser checks are green. No terminal completion, independent test, validation, audit, certification, parent Feature 006 replay, or historical original-wrapper RED claim is made. The next required owner is `bubbles.test`.

## Implement Verification Addendum - 2026-07-16

This addendum records the latest approved implementation and test hashes after the shared worktree expanded the functional matrix from eight to ten cases. It supersedes only the implementation-phase evidence summary above; it does not alter planning truth or make an independent-test, validation, audit, certification, terminal-status, or parent-feature claim.

### Recovered Original RED Provenance

**Phase:** implement  
**Command:** current tool-log query for original rows 842 and 845  
**Exit Code:** 0  
**Claim Source:** interpreted  
**Interpretation:** The structured log proves the exact functional and browser commands exited 1 before later green executions. The original raw RED stdout is not reconstructed; the later immutable-`HEAD` replay above supplies behavior-level raw RED output.

```text
BUG002_ORIGINAL_RED_PROVENANCE_BEGIN
line=842
timestamp=2026-07-15T23:35:29Z
command=node --test tests/brief-refresh-atomicity.test.mjs
exitCode=1
stdoutBytes=2315
stdoutHash=6d1f75dd17a4331ea330355288c870a815829f02dcd4df1a18348692cf666439
tags=bugfix,scope-01,red,TP-01-02,SCN-BUG002-001,adversarial
line=845
timestamp=2026-07-15T23:37:12Z
exitCode=1
stdoutBytes=1929
stdoutHash=a25e60a2e698d468a4c04240d0907f47b71e1352dcc5e856471c7d2375a465c5
tags=bugfix,scope-01,red,TP-01-05,SCN-BUG002-001,e2e-ui,adversarial
twoOriginalRows=PASS
allOriginalExitOne=PASS
laterGreenExists=PASS
claimBoundary=structured-tool-log-metadata; raw RED stdout is not reconstructed
result=PASS
BUG002_ORIGINAL_RED_PROVENANCE_END
```

### Latest Functional And Repository Proof

**Phase:** implement  
**Commands:** `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`  
**Exit Codes:** 0; 0; 0  
**Claim Source:** executed

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 10
ℹ pass 10
ℹ fail 0
ℹ skipped 0
ℹ todo 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
Research-Lab self-test: 497 passed, 0 failed
```

### Final Fixture Authenticity And Isolation

**Phase:** implement  
**Command:** current `BUG002_FINAL_AUTHENTICITY` probe using the real support module and wrapper  
**Exit Code:** 0  
**Claim Source:** executed

```text
BUG002_FINAL_AUTHENTICITY_BEGIN
wrapperExecuted=PASS
osTempFixture=PASS
realGitRepo=PASS
localBareRemote=PASS
realWrapperBytes=PASS
realPageBytes=PASS
realRendererBytes=PASS
realHttpPage=PASS
realHttpRenderer=PASS
loopbackEphemeralHttp=PASS
noRequestInterception=PASS
noExternalUrlFixture=PASS
noSecretBearingEnvRead=PASS
noProdPollutionSurface=PASS
coherentPublishedPair=PASS
fixtureRootClass=os-temporary-directory
gitOriginClass=local-bare-repository
httpOriginClass=ephemeral-loopback
result=PASS
BUG002_FINAL_AUTHENTICITY_END
```

### Final Browser Regression

**Phase:** implement  
**Commands:** exact TP-01-05, TP-01-06, and TP-01-10 Playwright commands  
**Exit Codes:** 0; 0; 0  
**Claim Source:** executed

```text
Running 1 test using 1 worker
✓ Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
1 passed (3.2s)
Running 1 test using 1 worker
✓ Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
1 passed (2.9s)
Full inventory project=system-chrome
BUG-002 scenario passed in the complete inventory
Existing provider, portfolio, bond, FX, Trend Dynamics, Technical Analysis, and Palm Springs scenarios passed
73 passed (54.3s)
```

### Final Governance And Containment Matrix

**Phase:** implement  
**Commands:** regression-quality, source-lock, portability, environment-isolation, artifact, freshness, traceability, G094, implementation-reality, framework-write, JSON/JSONL, diagnostics, and scoped diff checks  
**Exit Codes:** all blocking commands 0  
**Claim Source:** executed

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
Artifact lint PASSED.
RESULT: PASS (0 freshness failures, 0 warnings)
TRACEABILITY RESULT: PASSED (0 warnings)
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
IMPLEMENTATION REALITY SCAN: Files scanned=7 Violations=0 Warnings=1
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
jsonParse=state.json:PASS
jsonlParse=brief-history.jsonl:PASS:rows=40
snapshotExactSource=PASS
historyExactSource=PASS
topStatusPreserved=PASS
certificationUntouched=PASS
diffCheck=PASS
approvedPathsStaged=NO
VS Code diagnostics: no errors in the wrapper, three tests, repaired snapshot, scopes, report, or state
```

The implementation-reality scan's one warning is preserved verbatim in command evidence: `Scopes yielded 0 files - falling back to design.md for file discovery`; it then resolved seven files and reported zero violations. The independent authenticity probe directly covered the live-test interception and runtime boundaries that the fallback discovery did not classify.

## Current Invocation Superseding Implementation Evidence

**Phase:** implement  
**Observed through:** `2026-07-16T04:17:32Z`  
**Claim Source:** executed

This section preserves all prior planning and resumed-implementation evidence as historical context. It supersedes only the earlier implementation statement that the broader Playwright and governance gates had not run. No certification or terminal-status claim is made.

### Current Invocation Command Ledger

| Command | Exit code | Direct result |
| --- | ---: | --- |
| `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 8 passed, 0 failed |
| Focused exact BUG-002 Playwright title | 0 | 1 passed |
| Complete `tests/market-brief-session-date-drift.spec.mjs` | 0 | 1 passed |
| `node scripts/validate-brief-payload.mjs` | 0 | Pair contract passed |
| `node scripts/selftest.mjs` | 0 | 497 passed, 0 failed |
| `bash -n scripts/brief-refresh-and-push.sh` | 0 | Empty stdout; explicit exit captured below |
| Complete system-Chrome Playwright inventory | 0 | 73 passed |
| Regression-quality guard, `--bugfix`, all three BUG-002 test files | 0 | 0 violations, 0 warnings |
| Environment-pollution scan | 0 | Passed |
| `node scripts/validate-node-source-lock.mjs` | 0 | Actual graph passed; 16 adversarial inputs rejected |
| macOS portability guard on the wrapper | 0 | All 13 classes passed |
| Artifact lint | 0 | Passed with the existing deprecated `certification.scopeProgress` advisory |
| Artifact freshness guard | 0 | 0 failures, 0 warnings |
| Traceability guard | 0 | Passed with 0 warnings |
| Implementation-reality scan | 0 | 0 violations; design fallback discovery advisory |
| G094 capability-foundation guard | 0 | Passed |
| Downstream framework-write guard | 0 | Managed integrity passed; dirty local-source install advisory |
| Final payload/data/protected-path integrity check | 0 | Exact hashes, blobs, index, and status preserved |
| Path-scoped `git diff --check` | 0 | Empty stdout; explicit exit captured below |

### Current Invocation Functional Matrix

**Phase:** implement  
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Output window:** direct discriminator lines and final runner summary from the full current-invocation output.

```text
[bug002-atomicity] wrapperExit=0
[bug002-atomicity] baselineDate=2026-07-15
[bug002-atomicity] candidateDate=2026-07-16
[bug002-atomicity] payloadDate=2026-07-15
[bug002-atomicity] snapshotDate=2026-07-15
[bug002-atomicity] snapshotRetained=true
[bug002-atomicity] historyRetained=true
[bug002-atomicity] payloadRetained=true
[bug002-atomicity] staged=""
[bug002-atomicity] status=""
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (588.87525ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (650.355417ms)
✔ matching generated Tier B advances snapshot payload and history together (970.994834ms)
✔ failed narrative attempt restores config before a successful retry (1070.105083ms)
✔ dirty owned publication path refuses before every external boundary (352.987791ms)
✔ invalid clean baseline refuses before every external boundary (439.476209ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (818.154625ms)
✔ forced final validation failure restores every owned baseline byte and index path (648.6125ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5616.258416
```

**Result:** PASS. This directly covers rollover retention, same-target publication, paired advancement, retry isolation, owned-dirt refusal, invalid-baseline refusal, unrelated-dirt preservation, and failure rollback.

### Current Invocation Browser And Broader Regression

**Phase:** implement  
**Commands:** exact protected BUG-002 Playwright title; complete BUG-002 Playwright file; complete `system-chrome` inventory  
**Exit Codes:** 0; 0; 0  
**Claim Source:** executed  
**Output windows:** complete focused summaries plus the final contiguous inventory window from full current-invocation output.

```text
Running 1 test using 1 worker

  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (5.3s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint:   git branch -m <name>
Switched to a new branch 'main'

  1 passed (9.5s)

Running 1 test using 1 worker

  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (9.7s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
Switched to a new branch 'main'

  1 passed (13.1s)

  ✓  63 … restricted endpoint or raw observation persistence path exists (431ms)
  ✓  64 …spec.mjs:313:1 › BS-011 Simple and Power share one model digest (416ms)
  ✓  65 …-012 lever change recomputes without fetch or observed mutation (252ms)
  ✓  66 …mjs:344:1 › BS-014 partial data is keyboard and text equivalent (254ms)
  ✓  67 …Regime tool publishes one owner read without restricted payload (268ms)
  ✓  68 … nonblank synchronous and text equivalent on desktop and mobile (420ms)
  ✓  69 …stale error and large-shock layouts contain text without overlap (1.5s)
  ✓  70 …r ratio window sleeve focus and restored preferences stay local (321ms)
  ✓  71 …xpose return risk drawdown and trend when history is sufficient (230ms)
  ✓  72 …nfig cache and reachable public sources without uncaught errors (176ms)
  ✓  73 …andmarks names focus and noncolor states at 390 and 1440 widths (368ms)

  73 passed (1.4m)
```

**Result:** PASS. The scenario-specific real-HTTP browser regression and the complete existing browser inventory are green on `system-chrome`.

### Current Invocation Pair Contract And Repository Canary

**Phase:** implement  
**Commands:** `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`  
**Exit Codes:** 0; 0  
**Claim Source:** executed  
**Output window:** validator output plus the complete Market Brief group and repository summary from the full selftest output.

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid

market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp

================================================
Research-Lab self-test: 497 passed, 0 failed
================================================
```

**Result:** PASS. The exact current pair is coherent and the full repository canary no longer reports `F006-EXT-SELFTEST-MARKET-BRIEF-001`.

### Current Invocation Quality Gates

**Phase:** implement  
**Commands:** regression-quality guard; environment-pollution scan; Node source-lock validator; macOS portability guard; artifact lint/freshness/traceability; implementation-reality scan; G094; downstream framework-write guard  
**Exit Codes:** all 0  
**Claim Source:** executed  
**Output windows:** direct summaries from each full current-invocation command.

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-16T04:11:01Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/brief-refresh-atomicity.support.mjs
✅ Adversarial signal detected in tests/brief-refresh-atomicity.support.mjs
ℹ️  Scanning tests/brief-refresh-atomicity.test.mjs
✅ Adversarial signal detected in tests/brief-refresh-atomicity.test.mjs
ℹ️  Scanning tests/market-brief-session-date-drift.spec.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
== macOS portability guard -- scanning 1 file(s) ==
ok   class-1 raw-timeout: none
ok   class-2 in-place-sed: none
ok   class-3 date-d-parse: none
ok   class-4 stat-c-mtime: none
ok   class-5 readlink-f-absolutize: none
ok   class-6 grep-pcre: none
ok   class-7 bracket-v-isset: none
ok   class-8 mapfile-readarray: none
ok   class-9 mktemp-suffix: none
ok   class-10 df-output: none
ok   class-11 bin-true-false: none
ok   class-12 paste-no-stdin-operand: none
ok   class-13 date-nanoseconds: none
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Files scanned:  7
Violations:     0
Warnings:       1
🟡 PASSED with 1 warning(s) — manual review advised
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
✅ Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
```

**Result:** PASS with three explicit non-blocking advisories: artifact lint reports deprecated `certification.scopeProgress`; implementation reality used design fallback discovery and still scanned seven files with zero violations; framework-write protection reports the existing dirty local-source install provenance while confirming managed-file integrity. This implementation phase did not edit any advisory-owning foreign surface.

### Current Invocation Byte And Dirty-Boundary Integrity

**Phase:** implement  
**Commands:** final SHA-256/Git-blob/index/status comparison; `bash -n scripts/brief-refresh-and-push.sh`; path-scoped `git diff --check`  
**Exit Codes:** 0; 0; 0  
**Claim Source:** executed  
**Output:**

```text
BUG002_FINAL_INTEGRITY_BEGIN
PAYLOAD_PRE_EXPECTED=a00a401e268d112326ca7aaf269a0c462f905433a450f538f569eb63b5dc76d4
PAYLOAD_POST_ACTUAL
a00a401e268d112326ca7aaf269a0c462f905433a450f538f569eb63b5dc76d4  market-brief.payload.json
DATA_BLOB_EXPECTED
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
DATA_BLOB_ACTUAL
b0672387762a3b9762699d5be07d899db135dc5c
9fcf286189f4d82ba00271774351fc388000b3b0
EXACT_DATA_EQUALITY=PASS
PAYLOAD_IDENTITY=PASS
PROTECTED_ACTUAL_SHA256
5f79826698bfc97010fb63a3d349e38d6affe9c4c42eac80d4073dc182957836  notes/market-brief.md
083013f9debfe89e038eeae35b7bec5631d6872b19e5eafff2861d70fabee041  .github/prompts/market-brief-update.prompt.md
f47e86bc746eddad82892844aacde100ff8f82d6e29e4d0a4df6a68ed0bb53c8  scripts/selftest.mjs
78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f  scripts/validate-brief-payload.mjs
PROTECTED_ACTUAL_INDEX
100644 a31581b6652b56022feaf3f9f00dcc73841bd3fc 0       .github/prompts/market-brief-update.prompt.md
100644 f6b06647c4650978120aabc7192933d917e2edfa 0       notes/market-brief.md
100644 03a285cfa21b2f2e1b22b539ac0452094029c110 0       scripts/selftest.mjs
PROTECTED_ACTUAL_STATUS
 M .github/prompts/market-brief-update.prompt.md
 M notes/market-brief.md
 M scripts/selftest.mjs
?? scripts/validate-brief-payload.mjs
BUG_OWNED_STAGED_PATHS
BUG002_FINAL_INTEGRITY_END
BUG002_SYNTAX_DIFF_BEGIN
COMMAND=bash -n scripts/brief-refresh-and-push.sh
BASH_N_EXIT=0
COMMAND=git diff --check -- BUG-002 implementation paths
DIFF_CHECK_EXIT=0
BASH_OUTPUT=empty-on-success
DIFF_OUTPUT=empty-on-success
NO_STAGE_OR_COMMIT_PERFORMED=true
BUG002_SYNTAX_DIFF_END
```

**Result:** PASS. Payload bytes are unchanged; snapshot/history exactly equal commit `751b85d72dea16e790cd4e1281f3ed155bd06e60`; protected hashes, index entries, and dirty statuses match the pre-edit baseline; and no BUG-002 path is staged.

## Current Invocation Finding Closure

| Finding | Current implementation disposition | Remaining owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed on implementation bytes; exact canary is `497 passed, 0 failed` | `bubbles.test` must independently verify |
| `BUG002-WRAPPER-ATOMICITY` | Addressed on implementation bytes; all ten final transaction branches pass | `bubbles.test` must independently verify |
| `BUG002-REGRESSION-GAP` | Addressed on implementation bytes; functional, exact-title, complete-file, and broader browser regressions pass | `bubbles.test` must independently verify |
| `BUG002-DIRTY-BOUNDARY` | Addressed on implementation bytes; isolated adversaries and real-worktree identity checks pass | `bubbles.test` must independently verify |
| `BUG002-RED-EVIDENCE-GAP` | Addressed with literal current-session output from the final ten-case suite against immutable committed pre-fix wrapper bytes (`1 passed, 9 failed`), followed without an intervening edit by working-tree GREEN (`10 passed, 0 failed`) | `bubbles.test` must independently verify |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved by role boundary; implementation evidence is not independent certification | `bubbles.test` |
| `BUG002-VALIDATE-CERTIFICATION` | Unresolved by role boundary; implementation did not write terminal or certification state | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Unresolved by role boundary; no audit specialist claim is fabricated | `bubbles.audit` |

The scope and top-level bug status remain In Progress. Implementation-owned DoD items carry executed evidence; independent test, validation, audit, certification, and parent replay remain unchecked.

## Independent Test Phase - 2026-07-16

**Phase:** test  
**Agent:** `bubbles.test`  
**Workflow mode:** `bugfix-fastlane`  
**Execution model:** `direct-authorized-runner` under the continuing `bubbles.goal` run  
**Scope:** `SCOPE-01`  
**Evidence session:** `BUG002-SCOPE01-TEST-20260715-CURRENT`  
**Evidence cutoff:** `2026-07-16T05:28:09Z`  
**Claim Source:** executed

The locally resolved mode order is `select, bootstrap, implement, test, regression, simplify, gaps, harden, stabilize, devops, security, validate, audit, finalize`. This section claims only `test`. BUG-002, SCOPE-01, and certification remain In Progress; the next required owner is `bubbles.regression`.

### RED Provenance Boundary

The durable tool-log rows at `2026-07-15T23:35:29Z` and `2026-07-15T23:37:12Z` prove that the original functional and browser commands exited `1` before later green rows. Their metadata includes stdout byte counts and hashes, but the original raw stdout was not reconstructed in this invocation. Those rows are therefore interpreted historical provenance, not current-session raw RED evidence.

The test phase independently replayed the final ten-case matrix against immutable committed `HEAD` wrapper bytes. This is current-session behavior-level RED evidence for the committed pre-fix implementation; it is not represented as the original pre-edit run.

**Command:** `env BUG002_WRAPPER_SOURCE=HEAD node --test tests/brief-refresh-atomicity.test.mjs`  
**Exit Code:** 1 (expected RED)  
**Claim Source:** interpreted  
**Interpretation:** The final regression matrix is failure-sensitive to the immutable committed wrapper. The first adversarial case observed `snapshotDate=2026-07-16` where the contract requires retained `2026-07-15`; nine of ten cases failed and no case was skipped.

```text
✖ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (554.796333ms)
✖ same-target retained Tier B publishes candidate Tier A with visible payload staleness (504.1415ms)
✖ matching generated Tier B advances snapshot payload and history together (437.672ms)
✖ failed narrative attempt restores config before a successful retry (567.04775ms)
✖ dirty owned publication path refuses before every external boundary (763.61475ms)
✖ staged owned publication path refuses without changing its index entry (636.553625ms)
✖ untracked owned data path refuses before every external boundary (1351.957ms)
✖ invalid clean baseline refuses before every external boundary (871.871208ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (501.4095ms)
✖ forced final validation failure restores every owned baseline byte and index path (608.830417ms)
ℹ tests 10
ℹ suites 0
ℹ pass 1
ℹ fail 9
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6867.3685
```

No repository file was edited between this immutable replay and the following working-tree GREEN.

### Functional Transaction Matrix

**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (807.093375ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (712.441292ms)
✔ matching generated Tier B advances snapshot payload and history together (1391.474917ms)
✔ failed narrative attempt restores config before a successful retry (2551.020166ms)
✔ dirty owned publication path refuses before every external boundary (2062.544ms)
✔ staged owned publication path refuses without changing its index entry (2078.365666ms)
✔ untracked owned data path refuses before every external boundary (10055.564291ms)
✔ invalid clean baseline refuses before every external boundary (757.9915ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (1106.812458ms)
✔ forced final validation failure restores every owned baseline byte and index path (867.6895ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 22454.875583
```

### Browser Verification

**Commands:**

1. `npx --no-install playwright --version`
2. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
3. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
4. `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0; 0; 0  
**Claim Source:** executed

```text
Version 1.61.1
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot (2.2s)
  1 passed (3.0s)
Running 1 test using 1 worker
  ✓  1 [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot (2.2s)
  1 passed (2.9s)
  ✓  63 [system-chrome] › tests/bond-regime-lab.spec.mjs:302:1 › No browser credential restricted endpoint or raw observation persistence path exists (358ms)
  ✓  64 [system-chrome] › tests/bond-regime-lab.spec.mjs:313:1 › BS-011 Simple and Power share one model digest (276ms)
  ✓  65 [system-chrome] › tests/bond-regime-lab.spec.mjs:328:1 › BS-012 lever change recomputes without fetch or observed mutation (203ms)
  ✓  66 [system-chrome] › tests/bond-regime-lab.spec.mjs:344:1 › BS-014 partial data is keyboard and text equivalent (230ms)
  ✓  67 [system-chrome] › tests/bond-regime-lab.spec.mjs:358:1 › Registered Bond Regime tool publishes one owner read without restricted payload (240ms)
  ✓  68 [system-chrome] › tests/bond-regime-lab.spec.mjs:371:1 › Power canvases are nonblank synchronous and text equivalent on desktop and mobile (441ms)
  ✓  69 [system-chrome] › tests/bond-regime-lab.spec.mjs:390:1 › Fresh partial stale error and large-shock layouts contain text without overlap (1.6s)
  ✓  70 [system-chrome] › tests/bond-regime-lab.spec.mjs:431:1 › Power ratio window sleeve focus and restored preferences stay local (658ms)
  ✓  71 [system-chrome] › tests/bond-regime-lab.spec.mjs:450:1 › Power sleeve analytics expose return risk drawdown and trend when history is sufficient (307ms)
  ✓  72 [system-chrome] › tests/bond-regime-lab.spec.mjs:460:1 › Live page loads production config cache and reachable public sources without uncaught errors (232ms)
  ✓  73 [system-chrome] › tests/bond-regime-lab.spec.mjs:470:1 › Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths (358ms)
  73 passed (52.3s)
```

### Current Pair And Repository Canary

**Commands:** `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`  
**Exit Codes:** 0; 0  
**Claim Source:** executed

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp
================================================
Research-Lab self-test: 497 passed, 0 failed
================================================
```

### Test Quality And Governance Guards

Each command below was executed through `.github/bubbles/scripts/tool-log.sh` under the evidence session named above.

| Command | Exit code | Observed result |
| --- | ---: | --- |
| `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/brief-refresh-atomicity.support.mjs tests/brief-refresh-atomicity.test.mjs tests/market-brief-session-date-drift.spec.mjs` | 0 | 3 files; 0 violations; 0 warnings |
| `bash .github/bubbles/scripts/env-pollution-scan.sh /Users/pkirsanov/Projects/research-lab` | 0 | No test-to-prod-surface writes |
| `node scripts/validate-node-source-lock.mjs` | 0 | Actual graph passed; all 16 adversarial inputs rejected |
| `bash .github/bubbles/scripts/macos-portability-guard.sh scripts/brief-refresh-and-push.sh` | 0 | All 13 portability classes passed |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-002-market-brief-session-date-drift` | 0 | Packet passed; deprecated `scopeProgress` advisory retained |
| `bash .github/bubbles/scripts/artifact-freshness-guard.sh specs/_bugs/BUG-002-market-brief-session-date-drift` | 0 | 0 failures; 0 warnings |
| `bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-002-market-brief-session-date-drift` | 0 | 1 scenario; 11 test rows; 0 warnings |
| `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/_bugs/BUG-002-market-brief-session-date-drift --verbose` | 0 | 7 files; 0 violations; 1 design-fallback warning |
| `bash .github/bubbles/scripts/capability-foundation-guard.sh specs/_bugs/BUG-002-market-brief-session-date-drift` | 0 | G094 passed |
| `bash .github/bubbles/scripts/cli.sh framework-write-guard` | 0 | Managed-file integrity passed; dirty local-source install advisory retained |
| `bash .github/bubbles/scripts/cli.sh doctor` | 0 | 17 passed; 0 failed; 1 advisory |
| `bash -n scripts/brief-refresh-and-push.sh` | 0 | Empty stdout; exit recorded by tool log |
| BUG-002 JSON/JSONL parse and date-equality probe | 0 | 6 JSON files and 40 JSONL rows passed; July 15 equals July 15 |
| Corrected skip/mock/bailout/self-validation/plan-parity audit | 0 | All 17 checks passed |
| Source-commit/protected-byte/index/status integrity probe | 0 | All comparisons passed; no BUG-owned path staged |

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Files scanned:  7
Violations:     0
Warnings:       1
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
✅ Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
Result: 17 passed, 0 failed, 1 advisory
```

The implementation-reality warning was observed verbatim as `Scopes yielded 0 files — falling back to design.md for file discovery`; the scan still resolved seven files and reported zero violations. The live-test interception and runtime boundaries were verified separately below.

### Fixture Authenticity, Isolation, And Test Integrity

**Command:** independent runtime authenticity probe using `tests/brief-refresh-atomicity.support.mjs`, followed by the corrected test-integrity audit  
**Exit Codes:** 0; 0  
**Claim Source:** executed

```text
BUG002_TEST_AUTHENTICITY_BEGIN
wrapperExecuted=PASS
osTempFixture=PASS
realGitRepo=PASS
localBareRemote=PASS
realWrapperBytes=PASS
realPageBytes=PASS
realRendererBytes=PASS
realHttpPage=PASS
realHttpRenderer=PASS
loopbackEphemeralHttp=PASS
requestObserverPresent=PASS
externalRequestAssertionPresent=PASS
noRequestInterception=PASS
noExternalUrlFixture=PASS
noNamedSecretEnvRead=PASS
noProdPollutionSurface=PASS
coherentPublishedPair=PASS
snapshotRetained=PASS
historyRetained=PASS
payloadRetained=PASS
fixtureCleaned=PASS
result=PASS
BUG002_TEST_AUTHENTICITY_END
```

```text
BUG002_TEST_INTEGRITY_AUDIT_BEGIN
threeFiles=PASS
zeroSkipOnlyTodo=PASS
zeroLiveInterception=PASS
zeroRequiredBailout=PASS
functionalCasesTen=PASS
e2eCasesOne=PASS
planRowsTen=PASS
markdownRowsTen=PASS
scenarioOne=PASS
regressionsTwo=PASS
realWrapperPath=PASS
realPageAndRenderer=PASS
realGitAndRemote=PASS
realLoopbackServer=PASS
meaningfulFunctionalAssertions=PASS
meaningfulBrowserAssertions=PASS
adversarialDateDiscriminator=PASS
result=PASS
BUG002_TEST_INTEGRITY_AUDIT_END
```

The first integrity-probe attempt exited `1` because its unbounded `xit(` regex matched three ordinary `process.exit(...)` calls. A targeted source search identified only those false-positive matches. The corrected token-boundary probe above exited `0`; both attempts remain in the structured tool log.

The first post-edit closeout validator also exited `1` because `scenario-manifest.json` and `state.json` lacked terminal LF bytes after the patch. Both JSON documents parsed successfully and every semantic/routing assertion passed in that run. The two final newlines were added without changing JSON content, and the identical validator then passed all 15 checks. The failed and passing rows remain in the structured tool log.

### Data And Protected-Worktree Integrity

**Command:** independent SHA-256, Git index/status, source-commit byte, staging, and parent-tree probe  
**Exit Code:** 0  
**Claim Source:** executed

```text
PATH=scripts/brief-refresh-and-push.sh
hashStable=PASS
indexStable=PASS
statusStable=PASS
PATH=tests/brief-refresh-atomicity.support.mjs
hashStable=PASS
indexStable=PASS
statusStable=PASS
PATH=tests/brief-refresh-atomicity.test.mjs
hashStable=PASS
indexStable=PASS
statusStable=PASS
PATH=tests/market-brief-session-date-drift.spec.mjs
hashStable=PASS
indexStable=PASS
statusStable=PASS
source=3d1bbcf6b713bdc685f2d45bc2b65c72338a2275:market-brief.payload.json
sourceByteIdentical=PASS
source=751b85d72dea16e790cd4e1281f3ed155bd06e60:market-brief.snapshot.json
sourceByteIdentical=PASS
source=751b85d72dea16e790cd4e1281f3ed155bd06e60:brief-history.jsonl
sourceByteIdentical=PASS
bugOwnedStagedNone=PASS
feature005TreeSha256=030b33a6aa07923f4f96574b79e8df5b585276bf4ca990869a5b6d16e74eec4d
feature006TreeSha256=d228c039f33784ad3060af868b5bc518186fcc08cce6c7d60a1b98fab69e5a15
result=PASS
```

The full probe also compared and passed the hashes, index entries, and statuses for payload, snapshot, history, config, prompt, runbook, selftest, validator, page, and renderer. No source, data, test, protected, parent Feature 005, or parent Feature 006 byte was changed by the test phase before this evidence append.

### Diagnostics

**Tool:** VS Code diagnostics  
**Claim Source:** executed

```text
scripts/brief-refresh-and-push.sh: No errors found
tests/brief-refresh-atomicity.support.mjs: No errors found
tests/brief-refresh-atomicity.test.mjs: No errors found
tests/market-brief-session-date-drift.spec.mjs: No errors found
market-brief.snapshot.json: No errors found
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md: No errors found
specs/_bugs/BUG-002-market-brief-session-date-drift/state.json: No errors found
```

### Independent Test Finding Accounting

| Finding | Test-phase disposition | Remaining owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed: current repository canary is `497 passed, 0 failed` | `bubbles.regression` for the next registered phase |
| `BUG002-WRAPPER-ATOMICITY` | Addressed: immutable wrapper RED and working-tree 10/10 GREEN discriminate the transaction repair | `bubbles.regression` |
| `BUG002-REGRESSION-GAP` | Addressed: exact title, complete focused file, and 73-test inventory are green | `bubbles.regression` |
| `BUG002-DIRTY-BOUNDARY` | Addressed: isolated adversaries and real-worktree hash/index/status comparisons passed | `bubbles.regression` |
| `BUG002-RED-EVIDENCE-GAP` | Addressed within the stated boundary: original rows remain metadata-only; current immutable-HEAD replay supplies behavior-level raw RED | `bubbles.regression` |
| `BUG002-INDEPENDENT-VERIFICATION` | Addressed by this `bubbles.test` execution and evidence session | `bubbles.regression` |
| `BUG002-TEST-PROBE-FALSE-POSITIVE` | Addressed: bounded `xit(` token matching removed the `process.exit(...)` diagnostic false positive; corrected audit passed | none |
| `BUG002-TEST-CLOSEOUT-NEWLINE` | Addressed: the focused closeout validator found two missing terminal LF bytes; both were added and the identical 15-check validator passed | none |
| `BUG002-REGRESSION-PHASE` | Not executed by this agent; it is the next locally resolved phase | `bubbles.regression` |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed; certification remains untouched | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Not executed; no audit claim is made | `bubbles.audit` |

### Test Phase Verdict And Route

The selected functional, integration, and E2E-UI requirements all passed with zero skips. The independent authenticity, regression-quality, pollution, source-lock, portability, artifact, traceability, implementation-reality, G094, managed-framework, parse, syntax, diagnostics, and byte-containment checks passed. `TR-BUG-002-TEST` may be resolved as a test execution claim.

SCOPE-01 and BUG-002 remain In Progress. No Done, Fixed, Verified, Closed, validation, audit, certification, or parent Feature 006 claim is made. The locally resolved next phase is `regression`, owned by `bubbles.regression`.

### Depth-1 Current-Session Corroboration

**Phase:** test  
**Execution model:** `direct-authorized-runner`, depth-1 specialist invoked by `bubbles.goal`  
**Evidence session:** `bug002-test-depth1-20260715`  
**Observed from:** `2026-07-16T05:02:31Z` through `2026-07-16T05:23:13Z`  
**Claim Source:** executed

This invocation independently reran the required matrix from current on-disk bytes while the concurrent test owner was recording the section above. It did not change production, data, tests, certification, user validation, or parent-feature artifacts. The durable structured rows in `.specify/runtime/tool-calls.jsonl` attribute every gate-relevant command below to `bubbles.test`, `BUG-002`, and `SCOPE-01`.

| Evidence | Exit | Direct result |
| --- | ---: | --- |
| Immutable `HEAD` functional replay, `BUG002_WRAPPER_SOURCE=HEAD node --test tests/brief-refresh-atomicity.test.mjs` | 1 | Expected RED: 1 passed, 9 failed; snapshot July 16 vs payload July 15 |
| Current `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 10 passed, 0 failed, 0 skipped, 0 todo |
| `node scripts/validate-brief-payload.mjs` | 0 | Unchanged pair contract passed |
| `node scripts/selftest.mjs` | 0 | 497 passed, 0 failed |
| Exact-title BUG-002 Playwright row | 0 | 1 passed |
| Complete BUG-002 Playwright file | 0 | 1 passed |
| Complete `system-chrome` inventory | 0 | 73 passed |
| `bash -n` plus macOS portability guard | 0; 0 | Parse passed; all 13 portability classes passed |
| Source-lock validator | 0 | Actual graph passed; 16 adversarial sources rejected |
| Regression-quality `--bugfix` | 0 | 3 files, 0 violations, 0 warnings |
| Environment-pollution scan | 0 | No test-to-production-surface writes |
| Artifact lint, freshness, traceability | 0; 0; 0 | Packet passed; freshness 0/0; traceability 0 warnings |
| G079 impact planner | 0 | No `testImpact` map; normal full matrix retained |
| G051 canonical evidence predicate | 0 | Zero matching evidence lines in `report.md` and `scopes.md` |
| Implementation reality and framework-write guard | 0; 0 | 0 violations; managed-file integrity passed |
| VS Code diagnostics | 0 findings | Wrapper, three tests, repaired data, and BUG packet clean |

**Immutable RED output:**

```text
✖ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✖ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✖ matching generated Tier B advances snapshot payload and history together
✖ failed narrative attempt restores config before a successful retry
✖ dirty owned publication path refuses before every external boundary
✖ staged owned publication path refuses without changing its index entry
✖ untracked owned data path refuses before every external boundary
✖ invalid clean baseline refuses before every external boundary
✔ unrelated staged and unstaged dirt remains byte and index identical
✖ forced final validation failure restores every owned baseline byte and index path
ℹ tests 10
ℹ pass 1
ℹ fail 9
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: failed rollover retains the prior snapshot target
+ actual - expected
+ '2026-07-16'
- '2026-07-15'
[tool-log] recorded exit=1 duration=4676ms
```

**Current GREEN output:**

```text
[bug002-atomicity] baselineDate=2026-07-15
[bug002-atomicity] candidateDate=2026-07-16
[bug002-atomicity] payloadDate=2026-07-15
[bug002-atomicity] snapshotDate=2026-07-15
[bug002-atomicity] snapshotRetained=true
[bug002-atomicity] historyRetained=true
[bug002-atomicity] payloadRetained=true
[bug002-atomicity] staged=""
[bug002-atomicity] status=""
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 10
ℹ pass 10
ℹ fail 0
ℹ skipped 0
ℹ todo 0
[tool-log] recorded exit=0 duration=5565ms
```

**G051 output:**

```text
BUG002_G051_BEGIN
gate=G051 test_env_dependency_gate
source=state-transition-guard.sh Check 19 canonical generic predicate
projectOverride=none
scanFile=specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
matches=0
scanFile=specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
matches=0
envDependencyHitFiles=0
functionalMatrixEnvironmentResult=PASS
validatorEnvironmentResult=PASS
selftestEnvironmentResult=PASS
systemChromeEnvironmentResult=PASS
G051_RESULT=PASS
BUG002_G051_END
```

No new product or test defect was discovered. The existing deprecated validate-owned `scopeProgress` advisory, G028 design-fallback discovery advisory with zero violations, and dirty local-source install advisory remain non-blocking and were not modified by test ownership. All existing findings retain the dispositions in the accounting table above; `BUG002-REGRESSION-PHASE` remains the sole immediate route to `bubbles.regression`.

## Depth-1 Reliability Recheck - 2026-07-16

**Phase:** test  
**Evidence session:** `bug002-test-depth1-20260715`  
**Claim Source:** executed

The prior `73/73` TP-01-10 executions remain valid historical runs, but a required reliability recheck on the same current bytes did not remain green. The exact complete `system-chrome` command failed one Feature 007 shared-behavior canary; its isolated exact-title replay passed. This is an order- or concurrency-sensitive full-inventory failure, not permission to treat the isolated pass as a substitute for TP-01-10.

### Failed Complete Inventory Recheck

**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` (through `tool-log.sh`)  
**Exit Code:** 1  
**Claim Source:** executed

```text
  ✘  41 [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:152:1 › Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior (315ms)
  ✓  64 [system-chrome] › tests/bond-regime-lab.spec.mjs:313:1 › BS-011 Simple and Power share one model digest (252ms)
  ✓  65 [system-chrome] › tests/bond-regime-lab.spec.mjs:328:1 › BS-012 lever change recomputes without fetch or observed mutation (211ms)
  ✓  66 [system-chrome] › tests/bond-regime-lab.spec.mjs:344:1 › BS-014 partial data is keyboard and text equivalent (225ms)
  ✓  67 [system-chrome] › tests/bond-regime-lab.spec.mjs:358:1 › Registered Bond Regime tool publishes one owner read without restricted payload (181ms)
  ✓  68 [system-chrome] › tests/bond-regime-lab.spec.mjs:371:1 › Power canvases are nonblank synchronous and text equivalent on desktop and mobile (431ms)
  ✓  69 [system-chrome] › tests/bond-regime-lab.spec.mjs:390:1 › Fresh partial stale error and large-shock layouts contain text without overlap (2.1s)
  ✓  70 [system-chrome] › tests/bond-regime-lab.spec.mjs:431:1 › Power ratio window sleeve focus and restored preferences stay local (459ms)
  ✓  71 [system-chrome] › tests/bond-regime-lab.spec.mjs:450:1 › Power sleeve analytics expose return risk drawdown and trend when history is sufficient (357ms)
  ✓  72 [system-chrome] › tests/bond-regime-lab.spec.mjs:460:1 › Live page loads production config cache and reachable public sources without uncaught errors (223ms)
  ✓  73 [system-chrome] › tests/bond-regime-lab.spec.mjs:470:1 › Both modes expose landmarks names focus and noncolor states at 390 and 1440 widths (356ms)
Error: page.evaluate: TypeError: Cannot read properties of undefined (reading 'seriesEnvelope')
    at /Users/pkirsanov/Projects/research-lab/tests/technical-analysis-decision-lab.spec.mjs:154:29
  1 failed
    [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:152:1 › Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior
  72 passed (54.5s)
[tool-log] recorded exit=1 duration=55631ms
```

### Focused Failure Triage

**Command:** `npx --no-install playwright test tests/technical-analysis-decision-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior" --reporter=list` (through `tool-log.sh`)  
**Exit Code:** 0  
**Claim Source:** executed

```text
Running 1 test using 1 worker
[Feature-007-canary] legacyRldataBytesEqual=true
[Feature-007-canary] qualifiedRows=2
[Feature-007-canary] credentialApi=preserved
[Feature-007-canary] rlvalidDeclarations=7
[Feature-007-canary] strategyParity=true
  ✓  1 [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:152:1 › Regression: Feature 007 qualified series and RLVALID preserve legacy shared behavior (1.7s)
  1 passed (3.9s)
[tool-log] recorded exit=0 duration=4761ms
```

### Reliability Finding And Verdict

| Finding | Disposition | Owner |
| --- | --- | --- |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved: exact TP-01-10 failed `72/73`; focused title passed `1/1`, proving order/concurrency sensitivity rather than a stable focused defect | `bubbles.implement` |
| `BUG002-REGRESSION-GAP` | Reopened because the required broad inventory is not reliably green | `bubbles.implement`, then `bubbles.test` re-verification |
| `BUG002-INDEPENDENT-VERIFICATION` | Remains unresolved because one required planned row failed | `bubbles.implement`, then `bubbles.test` |
| `BUG002-VALIDATE-CERTIFICATION` | Not run | `bubbles.validate` after clean intervening phases |
| `BUG002-AUDIT-CERTIFICATION` | Not run | `bubbles.audit` after validate |

**Verdict:** `NOT_TESTED` for completion purposes. Focused BUG-002 behavior is green, but the selected test matrix is not fully passing. `TR-BUG-002-TEST` resolves with `route_required`, and `TR-BUG-002-IMPLEMENT-REWORK-01` routes the complete-inventory instability to `bubbles.implement`. BUG-002 and SCOPE-01 remain In Progress; regression is not the next owner until rework and independent test replay are clean.

## Independent Test Reliability Addendum - 2026-07-16

**Phase:** test  
**Agent:** `bubbles.test`  
**Scope:** `SCOPE-01`  
**Claim Source:** executed  
**Outcome:** `route_required`

This addendum supersedes only the earlier conclusion that one green `73/73` run was sufficient to complete the test phase. It preserves that run as historical evidence but adds two later exact complete-inventory executions against the same current bytes. No source, data, or test file changed between the runs.

### Exact Complete-Inventory Failure

**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
Running 73 tests using 6 workers
  ✓  63 … restricted endpoint or raw observation persistence path exists
  ✓  64 … BS-011 Simple and Power share one model digest
  ✘  65 … BS-012 lever change recomputes without fetch or observed mutation
  ✓  66 … BS-014 partial data is keyboard and text equivalent
  ✓  67 … Bond Regime tool publishes one owner read without restricted payload
  ✓  68 … nonblank synchronous and text equivalent on desktop and mobile
  ✓  69 … stale error and large-shock layouts contain text without overlap
  ✓  70 … ratio window sleeve focus and restored preferences stay local
  ✓  71 … expose return risk drawdown and trend when history is sufficient
  ✓  72 … config cache and reachable public sources without uncaught errors
  ✓  73 … landmarks names focus and noncolor states at 390 and 1440 widths
Expected: "b05f8b2a"
Received: "7f521d72"
expect(await page.locator('#decisionGrid').getAttribute('data-observed-digest')).toBe(beforeObserved)
1 failed
72 passed (35.9s)
```

The exact failing title was rerun once as a diagnostic:

**Command:** `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "BS-012 lever change recomputes without fetch or observed mutation" --reporter=list`  
**Exit Code:** 0  
**Claim Source:** executed

```text
Running 1 test using 1 worker
  ✓  1 … BS-012 lever change recomputes without fetch or observed mutation (541ms)
  1 passed (1.2s)
```

The isolated pass classifies the first complete-run failure as suite-order or concurrency sensitive. It does not replace the failed complete-inventory evidence.

### Exact Complete-Inventory Reliability Replay

**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`  
**Exit Code:** 1  
**Claim Source:** executed

```text
✓  64 … BS-011 Simple and Power share one model digest
✓  65 … BS-012 lever change recomputes without fetch or observed mutation
✓  66 … BS-014 partial data is keyboard and text equivalent
✓  67 … Bond Regime tool publishes one owner read without restricted payload
✓  68 … nonblank synchronous and text equivalent on desktop and mobile
✓  69 … stale error and large-shock layouts contain text without overlap
✓  70 … ratio window sleeve focus and restored preferences stay local
✓  71 … expose return risk drawdown and trend when history is sufficient
✓  72 … config cache and reachable public sources without uncaught errors
✓  73 … landmarks names focus and noncolor states at 390 and 1440 widths
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
73 passed (5.7m)
2 errors were not a part of any test, see above for details
```

The replay is also non-green. Passing all assertions does not override Playwright's two worker-lifecycle errors or the force kills.

### Preserved Focused Results

The reliability finding does not invalidate the independently executed focused evidence:

```text
Immutable HEAD functional matrix: exit 1, expected RED, 1 passed / 9 failed
Current functional matrix: exit 0, 10 passed / 0 failed / 0 skipped / 0 todo
Current pair validator: exit 0
Repository selftest: exit 0, 497 passed / 0 failed
Bash parser: exit 0
Protected BUG-002 browser title: exit 0, 1 passed
Complete BUG-002 browser file: exit 0, 1 passed
Source lock: exit 0, 16 adversarial sources rejected
Regression quality: exit 0, 0 violations / 0 warnings
Environment pollution: exit 0, no production-surface writes
Portability, artifact, freshness, traceability, G094, framework, JSON/JSONL, diagnostics, and path-scoped diff integrity: exit 0
```

### Reliability Finding Accounting

| Finding | Current test disposition | Required owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed: independent selftest is 497/0 | none for this finding |
| `BUG002-WRAPPER-ATOMICITY` | Addressed: immutable RED and current 10/10 GREEN discriminate the repair | none for this finding |
| `BUG002-REGRESSION-GAP` | Addressed at focused scope: functional and real-browser BUG-002 regressions exist and pass | none for this finding |
| `BUG002-DIRTY-BOUNDARY` | Addressed: isolated dirt matrix and actual protected-byte hashes pass | none for this finding |
| `BUG002-RED-EVIDENCE-GAP` | Addressed: current-session immutable-wrapper RED is raw and nonzero | none for this finding |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because TP-01-10 is not reliably green | `bubbles.implement` |
| `BUG002-BROAD-E2E-INSTABILITY` | New blocking finding: complete inventory has both a suite-only digest mutation and worker-shutdown errors | `bubbles.implement` |
| `BUG002-REGRESSION-PHASE` | Not eligible while the test phase remains incomplete | `bubbles.regression` after rework and clean test replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed; certification remains pending | `bubbles.validate` after clean test and regression phases |
| `BUG002-AUDIT-CERTIFICATION` | Not executed; audit remains pending | `bubbles.audit` after validation |

### State Coordination Blocker

During the evidence append, another writer modified `state.json` concurrently. The file became syntactically invalid, including interleaved `scopeInventory`, `audit`, policy, and duplicated transition-request fragments. Two controlled delete-and-recreate attempts were immediately overwritten/restored by the active writer. The blocking parser result at that point was:

```text
stateJsonParse=FAIL
error=Expected ',' or '}' after property value in JSON at position 1242 (line 34 column 21)
```

After the concurrent writer quiesced, a bounded structural repair restored the original certification and policy snapshots, removed only interleaved duplicate transition fragments, and applied the current test route. The identical parser plus an eight-invariant state-coherence probe then produced:

```text
stateJsonParse=PASS
status-in-progress=PASS
test-unclaimed=PASS
next-implement=PASS
pending-rework=PASS
test-transition-route=PASS
latest-route=PASS
broad-finding=PASS
certification-untouched=PASS
result=PASS
```

`TR-BUG-002-TEST` is resolved with `outcome: route_required`; `test` is absent from `execution.completedPhaseClaims`; `TR-BUG-002-IMPLEMENT-REWORK-01` is the sole pending request; certification remains `in_progress` with no completed scope or certified phase. The truthful next owner is `bubbles.implement` for `BUG002-BROAD-E2E-INSTABILITY`; test completion, regression, validation, audit, certification, and parent replay remain unclaimed.

### Final State Surface Verdict

After the successful coherence probe above, the active editor buffer wrote a second complete JSON object immediately after the first. The final post-edit closeout therefore observed the following current bytes:

```text
scripts/brief-refresh-and-push.sh=UNCHANGED
tests/brief-refresh-atomicity.support.mjs=UNCHANGED
tests/brief-refresh-atomicity.test.mjs=UNCHANGED
tests/market-brief-session-date-drift.spec.mjs=UNCHANGED
market-brief.payload.json=UNCHANGED
market-brief.snapshot.json=UNCHANGED
brief-history.jsonl=UNCHANGED
market-brief.config.json=UNCHANGED
market-brief.html=UNCHANGED
rlbrief.js=UNCHANGED
notes/market-brief.md=UNCHANGED
.github/prompts/market-brief-update.prompt.md=UNCHANGED
scripts/selftest.mjs=UNCHANGED
scripts/validate-brief-payload.mjs=UNCHANGED
SyntaxError: Unexpected non-whitespace character after JSON at position 18006 (line 373 column 2)
```

Inspection confirmed the boundary is `}{`: two individually shaped state objects were concatenated by concurrent whole-file writes. Separate delete/create attempts were immediately restored by the active editor buffer, and the file tool rejected an atomic delete-plus-add for one path with `Add File Error: Duplicate Path`. No further state edit is attempted after the bounded repair limit.

The final current `state.json` is therefore a blocking coordination defect even though the intended latest object records the truthful `bubbles.implement` route. The report evidence is durable; the machine state requires single-writer reconciliation by the active parent runner before any downstream specialist dispatch can be trusted.

### State Recovery Completion

**Phase:** test  
**Claim Source:** executed  
**Result:** PASS

This block supersedes only the preceding `Final State Surface Verdict`. After the concurrent writer quiesced, both concatenated documents were parsed independently. The newer `2026-07-16T05:44:39Z` document was retained as canonical; the older valid `2026-07-16T05:39:42Z` document was preserved losslessly under `_supersededConcurrentState`. No certification value was promoted or otherwise changed.

```text
BUG002_STATE_RECOVERY_CHECK_BEGIN
statusInProgress=PASS
certificationInProgress=PASS
certificationCompletedScopesEmpty=PASS
certifiedPhasesEmpty=PASS
certificationScopeNotStarted=PASS
testNotCompleted=PASS
phaseRemainsTest=PASS
nextOwnerImplement=PASS
pendingRework=PASS
broadFailureRouted=PASS
olderSnapshotPreserved=PASS
canonicalUpdated=2026-07-16T05:44:39Z
certificationSemanticsChanged=NO
result=PASS
BUG002_STATE_RECOVERY_CHECK_END
```

The canonical artifact lint then exited `0` and accepted the recovered state. The active machine route is `TR-BUG-002-IMPLEMENT-REWORK-01` to `bubbles.implement`; `test` remains absent from `execution.completedPhaseClaims`, and BUG-002/SCOPE-01 remain In Progress.

## Implementation Rework Reliability Proof - 2026-07-16

**Phase:** implement
**Claim Source:** executed
**Scope:** `SCOPE-01`
**Transition:** `TR-BUG-002-IMPLEMENT-REWORK-01`

### Smallest Lawful Rework

The only BUG-002-adjacent dirty source byte at pickup was the two-line close-order change in `tests/brief-refresh-atomicity.support.mjs`. It initiates `server.close(...)` before calling `server.closeAllConnections?.()`. Every neighboring HTTP test helper already uses that order. The reverse committed order could drain current sockets before the server stopped accepting connections, leaving a race in which a replacement connection kept worker-0 alive.

The committed Bond Regime helper already waits for a completed refresh, a populated view model, and a rendered observed digest equal to the model digest before BS-012 captures its baseline. No Bond Regime test byte, assertion, worker count, test selection, or inventory boundary was changed.

**Executed:** YES (current session)
**Command:** `git status --short --untracked-files=all && git --no-pager diff -- tests/brief-refresh-atomicity.support.mjs && git --no-pager diff --check -- tests/brief-refresh-atomicity.support.mjs`
**Exit Code:** 0
**Output:**

```text
 M playwright.config.mjs
 M scripts/selftest.mjs
 M specs/010-company-fundamentals-and-brief-lab/state.json
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md
 M specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json
 M tests/brief-refresh-atomicity.support.mjs
?? company-fundamentals-lab.html
?? company-fundamentals.config.json
?? rlcompany.js
?? scripts/validate-company-fundamentals.mjs
?? tests/company-fundamentals-contracts.unit.mjs
?? tests/company-fundamentals-lab.spec.mjs
?? tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js
?? tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json
diff --git a/tests/brief-refresh-atomicity.support.mjs b/tests/brief-refresh-atomicity.support.mjs
index 8636ac1..a9cbd93 100644
--- a/tests/brief-refresh-atomicity.support.mjs
+++ b/tests/brief-refresh-atomicity.support.mjs
@@ -308,8 +308,8 @@ export async function startBriefFixtureServer(fixture) {
   return {
     baseUrl: `http://127.0.0.1:${server.address().port}`,
     close: () => new Promise((resolveClosed, rejectClosed) => {
-      server.closeAllConnections?.();
       server.close((error) => error ? rejectClosed(error) : resolveClosed());
+      server.closeAllConnections?.();
     })
   };
 }
```

**Result:** PASS. The candidate is exactly one teardown-order swap; protected concurrent paths were observed and left in place.

### Focused Browser Discriminator

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output:**

```text
Running 1 test using 1 worker

  PASS  1 Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot (2.0s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
hint:
hint: Names commonly chosen instead of 'master' are 'main', 'trunk' and
hint: 'development'. The just-created branch can be renamed via this command:
hint:
hint:   git branch -m <name>
Switched to a new branch 'main'
To /var/folders/.../research-lab-bug002-a70DAa/remote.git
 * [new branch]      main -> main

  1 passed (3.5s)
```

**Result:** PASS. The real loopback HTTP fixture completed and returned from its close path.

### Exact Full Inventory Reliability Repetitions

The protected concurrent `playwright.config.mjs` adds Feature 010 coverage, so the exact mandatory command discovered 76 tests rather than the earlier 73. The command, project, workers, and inventory were not narrowed or overridden.

**Executed:** YES (current session, repetition 1)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output (raw completion slice from the full unfiltered terminal capture):**

```text
Running 76 tests using 6 workers
  PASS  66 model ready waits for auto-hydration before Simple and Power comparison (274ms)
  PASS  67 BS-011 Simple and Power share one model digest (290ms)
  PASS  68 BS-012 lever change recomputes without fetch or observed mutation (319ms)
  PASS  69 BS-014 partial data is keyboard and text equivalent (343ms)
  PASS  70 Registered Bond Regime tool publishes one owner read without restricted payload (263ms)
  PASS  71 nonblank synchronous and text equivalent on desktop and mobile (563ms)
  PASS  72 stale error and large-shock layouts contain text without overlap (2.1s)
  PASS  73 ratio window sleeve focus and restored preferences stay local (454ms)
  PASS  74 expose return risk drawdown and trend when history is sufficient (275ms)
  PASS  75 config cache and reachable public sources without uncaught errors (199ms)
  PASS  76 landmarks names focus and noncolor states at 390 and 1440 widths (441ms)

  76 passed (26.3s)
```

**Result:** PASS. BS-012 retained its observed digest and Playwright exited normally with no worker lifecycle error.

**Executed:** YES (current session, repetition 2)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Output (raw completion slice from the full unfiltered terminal capture):**

```text
Running 76 tests using 6 workers
  PASS  66 model ready waits for auto-hydration before Simple and Power comparison (229ms)
  PASS  67 BS-011 Simple and Power share one model digest (234ms)
  PASS  68 BS-012 lever change recomputes without fetch or observed mutation (195ms)
  PASS  69 BS-014 partial data is keyboard and text equivalent (209ms)
  PASS  70 Registered Bond Regime tool publishes one owner read without restricted payload (186ms)
  PASS  71 nonblank synchronous and text equivalent on desktop and mobile (357ms)
  PASS  72 stale error and large-shock layouts contain text without overlap (1.3s)
  PASS  73 ratio window sleeve focus and restored preferences stay local (281ms)
  PASS  74 expose return risk drawdown and trend when history is sufficient (227ms)
  PASS  75 config cache and reachable public sources without uncaught errors (187ms)
  PASS  76 landmarks names focus and noncolor states at 390 and 1440 widths (371ms)

  76 passed (19.5s)
```

**Result:** PASS. The independent repetition also exited without an error outside tests or a worker force-kill.

### Impacted BUG-002 Checks

**Executed:** YES (current session)
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** 0
**Output:**

```text
PASS Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (646.258084ms)
PASS same-target retained Tier B publishes candidate Tier A with visible payload staleness (970.497833ms)
PASS matching generated Tier B advances snapshot payload and history together (1056.669208ms)
PASS failed narrative attempt restores config before a successful retry (1410.057042ms)
PASS dirty owned publication path refuses before every external boundary (258.773125ms)
PASS scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (732.969541ms)
PASS staged owned publication path refuses without changing its index entry (288.724459ms)
PASS untracked owned data path refuses before every external boundary (557.339208ms)
PASS invalid clean baseline refuses before every external boundary (423.481417ms)
PASS invalid brief baseline still publishes validated ticker cache when narrative cannot advance (624.022292ms)
PASS explicit repair mode replaces an invalid baseline only with a final-valid matching pair (1219.332292ms)
PASS scheduled launcher automatically repairs an invalid baseline through a final-valid pair (971.010791ms)
PASS unrelated staged and unstaged dirt remains byte and index identical (628.626291ms)
PASS forced final validation failure restores every owned baseline byte and index path (871.785583ms)
tests 14
suites 0
pass 14
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 10721.857167
```

**Result:** PASS. No test was skipped, narrowed, or weakened.

**Executed:** YES (current session)
**Command:** `node scripts/validate-brief-payload.mjs`
**Exit Code:** 0
**Output:**

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

The current-pair integrity probe supplied the required raw identity detail:

```text
BUG002_CURRENT_PAIR_CHECK_BEGIN
snapshot.current=63e44da8221d49e585a420236487c40442e225da
snapshot.head=63e44da8221d49e585a420236487c40442e225da
snapshot.unchanged=PASS
history.current=1fc8e69fc5d650044a91c9202dc1bb20c24bf2ca
history.head=1fc8e69fc5d650044a91c9202dc1bb20c24bf2ca
history.unchanged=PASS
payload.current=d4ff648b0011db096c5de3cd9326c3f39e1e6ccd
payload.head=d4ff648b0011db096c5de3cd9326c3f39e1e6ccd
payload.unchanged=PASS
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
validator.exit=0
pair.diffAgainstHead.exit=0
historical751.snapshot=b0672387762a3b9762699d5be07d899db135dc5c
historical751.history=9fcf286189f4d82ba00271774351fc388000b3b0
historical751.identityNow=NOT-CURRENT
BUG002_CURRENT_PAIR_CHECK_END
```

**Result:** PASS for the requested current-pair coherence and byte-integrity check. A preceding deliberately stricter diagnostic exited `1` because the committed current pair is no longer byte-identical to the historical `751b85d` data blobs. No pair byte was changed. Current snapshot, history, and payload all match HEAD and the unchanged validator accepts them.

**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Output (raw completion slice from the full unfiltered terminal capture):**

```text
Feature 010 Scope 1 company publication foundation
  PASS Feature 010 production config validates and binds to the publication fingerprint
  PASS Feature 010 source-qualified SEC extract binds to SourceArtifact content identity
  PASS Feature 010 complete publication graph and canonical manifest hash validate
  PASS Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  PASS Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  PASS Feature 010 material claim resolves source transformation consumer rights and unavailable-link lineage
  PASS Feature 010 direct route loads only same-origin scripts and exposes no credential field
  PASS Feature 010 validator executes production config graph projection and trace functions

================================================
Research-Lab self-test: 505 passed, 0 failed
================================================
```

**Result:** PASS. The protected concurrent Feature 010 additions were included and introduced no failure.

### Rework Finding Accounting

| Finding | Implementation disposition | Next owner |
| --- | --- | --- |
| `BUG002-BROAD-E2E-INSTABILITY` | Addressed by the deterministic server close-order repair, focused browser pass, and two clean exact 76-test inventories with BS-012 stable and no worker lifecycle errors | `bubbles.test` for independent replay |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved by design; implementation evidence cannot certify independent test | `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Not claimed in this implementation rework | `bubbles.regression` only after independent test |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed | `bubbles.validate` after test and regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed | `bubbles.audit` after validation |

`TR-BUG-002-IMPLEMENT-REWORK-01` is resolved only as implementation rework. A fresh `TR-BUG-002-TEST-REWORK-01` routes the unchanged candidate and exact commands to `bubbles.test`. BUG-002 and SCOPE-01 remain In Progress; no test, regression, validation, audit, certification, scope-completion, or terminal bug claim is made.

### Post-Edit State And Ownership Integrity

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-002-market-brief-session-date-drift`
**Exit Code:** 0
**Output:**

```text
Required artifact exists: spec.md
Required artifact exists: design.md
Required artifact exists: uservalidation.md
Required artifact exists: state.json
Required artifact exists: scopes.md
Required artifact exists: report.md
No forbidden sidecar artifacts present
Found DoD section in scopes.md
scopes.md DoD contains checkbox items
All DoD bullet items use checkbox syntax in scopes.md
Detected state.json status: in_progress
Detected state.json workflowMode: bugfix-fastlane
state.json v3 has required field: status
state.json v3 has required field: execution
state.json v3 has required field: certification
state.json v3 has required field: policySnapshot
Top-level status matches certification.status
Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

The pre-existing deprecated `scopeProgress` warning remained non-blocking and was not changed in this rework.

The state-specific invariant probe exited `0` with the following raw output:

```text
BUG002_STATE_TRANSITION_CHECK_BEGIN
statusInProgress=PASS
activeAgentTest=PASS
phaseTest=PASS
nextOwnerTest=PASS
pendingOnlyFreshTest=PASS
implementReworkResolved=PASS
freshTestPending=PASS
broadFindingReworked=PASS
testUnclaimed=PASS
scopeStillInProgress=PASS
certificationUnchanged=PASS
policySnapshotUnchanged=PASS
forensicSnapshotUnchanged=PASS
result=PASS
BUG002_STATE_TRANSITION_CHECK_END
```

The probe parsed current and HEAD state with Node, compared `certification`, `policySnapshot`, and `_supersededConcurrentState` structurally, and asserted the fresh transition IDs and owners. It did not write any file.

A first post-edit hash helper exited `127` before reading any file because its local variable name `path` replaced zsh's command-search path. The corrected helper then identified a real concurrent-writer event. A complete non-short-circuit comparison exited `1` and recorded exactly two foreign-path changes while all other protected hashes remained equal to the pre-edit baseline:

```text
BUG002_PROTECTED_HASH_COMPARISON_BEGIN
playwright.config.mjs=f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655 result=PASS
scripts/selftest.mjs=0dfd5dc6178ea29e5317a60f30656932240dc6051db7e0c3738b2987371645f3 result=PASS
specs/010-company-fundamentals-and-brief-lab/state.json=fd2a09898c29a1a12a87515d06bd49b6c0dfe02210522dfb0acad40883a240bd expected=13ed4b4c007f68a1864b68d39b9a4ae1770d82524643b1317f7ca075528b70ab result=CONCURRENT-CHANGE
company-fundamentals-lab.html=204468317f0f5eeb4541de23efe38ea40f755d16f40638a1f6de4d759e4b2ae0 result=PASS
company-fundamentals.config.json=92e00e432d9950423730f89139e20a724e7dff36622ccacd4d0ad9c58692afb4 result=PASS
rlcompany.js=36740dd188ce05761ef090eb1698a3311d8e6cea22d1aa0d52ee2d6e6ae9b08b result=PASS
scripts/validate-company-fundamentals.mjs=1b5aab83096b354174fd86f96efb7acbfd442048cdbd165d82f49379ec971b49 result=PASS
tests/company-fundamentals-contracts.unit.mjs=8b683bf27dd6c8a7dcfd97d3f3edfff63112df216faba9e3ef2f0ce2aa8c693c result=PASS
tests/company-fundamentals-lab.spec.mjs=ee8d757a1f175fa3ceed377790c7acb1b930e4e1376202bde0957ecb71faa3e2 result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json=3097a9e19692b3afa0d5aa9fde69fda9afdf1b3920dc84e6367014a86f06b7cc result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md=7841ff60b988403a651788f4fd14274534402bac346594e335e1b8732d73e490 expected=7ad3d3739909042514c804d299891988e838a1cff30c0d1277b75eddd8611f97 result=CONCURRENT-CHANGE
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/uservalidation.md=a959c7f3f536e48ceba4ffd5ae41924fb079e224aa4e2089597144bd443ced4c result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/test-plan.json=539dc9468d836be1c4f43a222f16a8f1c343a75283b401224a07c950a31e9689 result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md=64c88faa95fa9a486bec336c5ceedd9156a0500ca471ac7b0a1c6f9e0487668b result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/bug.md=d7c30b444fa3e52532092f1902a79552e1cf597353cfd8820441814ad76fff7d result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/spec.md=271c236ca71d1d2588393a7b61c766ba460750418db895f8fd7fdd0450d99e1c result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md=46e17211e86de011313e63329f2d9b22c6cfd943c614bcfb097a7d781f372e04 result=PASS
specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scenario-manifest.json=ac2fb045dfebb7f0c696d47472aa2833cd2ab36db3c6cd7ff4ce81313deb2421 result=PASS
tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js=83aeb5034901e4dfd63ff1422e7f5af74c67bedbc60f9ecb533b0e636468d8c2 result=PASS
tests/fixtures/company-fundamentals/source-qualified/sec-submissions-msft.extract.json=fc589f9426ea3cbb2cb55f46f2b046db6fb1c7ffc193c5f809aa6380ecadaec7 result=PASS
mismatch_count=2
BUG002_PROTECTED_HASH_COMPARISON_END
```

#### Uncertainty Declaration

- **What was attempted:** Compare every protected concurrent file to its SHA-256 captured before the BUG-002 report/state edit.
- **What was observed:** Two foreign artifacts changed after the baseline: Feature 010 `state.json` and BUG-003 `report.md`. The candidate, Playwright config, selftest, all untracked Feature 010 code/data files, and every other BUG-003 artifact retained their baseline hashes.
- **Why this is uncertain:** The worktree has concurrent writers, so end-to-end global byte stability cannot be attributed solely to this invocation.
- **What resolves ownership:** This invocation neither edited nor restored either changed foreign artifact. Its authored diff remains limited to the adopted BUG-002 helper candidate plus BUG-002 `report.md` and canonical execution/routing fields in BUG-002 `state.json`.

### Closeout Gate Caveat

The bugfix-specific test-integrity and environment-isolation gates passed:

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-16T23:37:58Z
  Bugfix mode: true
============================================================

Scanning tests/brief-refresh-atomicity.test.mjs
Adversarial signal detected in tests/brief-refresh-atomicity.test.mjs
Scanning tests/market-brief-session-date-drift.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 1
============================================================
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
```

`bash .github/bubbles/scripts/cli.sh framework-write-guard` exited `1` on two installed checksum mismatches:

```text
Checking downstream framework-managed files against .github/bubbles/.checksums
Installed release manifest: version=7.20.0 gitSha=9b785d7da7554082cfe0232998ef72cc99637087
Install provenance: mode=local-source sourceRef=main sourceGitSha=9b785d7da7554082cfe0232998ef72cc99637087 dirty=true
Installed from a dirty local source checkout. This is not a clean published release install.
Framework-managed file drift detected: bubbles/scripts/install-bubbles-hooks.sh
Expected: 86884efc58c9fe9f1e7953cd42e7239d60444e62348ecb796a18ad393df02119
Actual:   e1ef1ba8e73f4ee03c3f033b9dc997f122e5b49337cda92d8e1902110c56c344
Framework-managed file drift detected: bubbles/mcp/tools/query_tool_log.json
Expected: f10bbcd6b3ae01e9dd5ba9becd05e2a5cc2c43feb2c980c2060221d2e3732a2e
Actual:   da6955e0958cd5240c48fb906793b1a2761fd09517d9efabf45c8efdd53bf121
Downstream repos must not directly author changes in framework-managed Bubbles files.
Never repair this by editing .github/bubbles/.checksums downstream.
```

The follow-up ownership probe exited `0` and proved both flagged files are byte-identical to HEAD:

```text
FRAMEWORK_DRIFT_OWNERSHIP_CHECK_BEGIN
frameworkPaths.diffAgainstHead.exit=0
installHook.current=c44fa6dac6b3746e4cde1b1d09767480e612a9ce
installHook.head=c44fa6dac6b3746e4cde1b1d09767480e612a9ce
queryToolLog.current=c652352b3b6a20595de6622e4a029340c4f8c4a4
queryToolLog.head=c652352b3b6a20595de6622e4a029340c4f8c4a4
FRAMEWORK_DRIFT_OWNERSHIP_CHECK_END
```

This is a pre-existing installed-framework baseline issue outside BUG-002 and outside downstream implementation ownership. It is not repaired, bypassed, or represented as a passing gate. The scoped BUG-002 diff check passed after the report formatting repair, and no path is staged.

## Independent Test Rework Replay - 2026-07-17

**Phase:** test
**Transition:** `TR-BUG-002-TEST-REWORK-01`
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Claim Source:** executed

This replay used the current shared-worktree bytes after a just-in-time status,
candidate-diff, SHA-256, and staged-path baseline. The candidate remained the
two-line teardown-order swap in `tests/brief-refresh-atomicity.support.mjs`:
`server.close(callback)` is initiated before `server.closeAllConnections?.()`.
No production, test, Playwright configuration, Market Brief data contract,
Feature 002, Feature 010, BUG-003, or company-fundamentals byte was edited by
this test invocation.

### Functional And Focused Browser Evidence

**Executed:** YES (current session)
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (602.596417ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (878.681334ms)
✔ matching generated Tier B advances snapshot payload and history together (1937.600125ms)
✔ failed narrative attempt restores config before a successful retry (1089.955458ms)
✔ dirty owned publication path refuses before every external boundary (242.043ms)
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (847.991917ms)
✔ staged owned publication path refuses without changing its index entry (222.187417ms)
✔ untracked owned data path refuses before every external boundary (219.329208ms)
✔ invalid clean baseline refuses before every external boundary (327.409ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (668.357292ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (1337.222166ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (1471.835833ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (791.105458ms)
✔ forced final validation failure restores every owned baseline byte and index path (1276.57875ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11971.834875
```

**Result:** PASS. TP-01-02, TP-01-03, and TP-01-04 are green with every
current case executed.

**Executed:** YES (current session)
**Commands:**

1. `npx --no-install playwright --version`
2. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
3. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output:**

```text
Version 1.61.1
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (2.4s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (3.1s)
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (2.2s)
hint: Using 'master' as the name for the initial branch. This default branch name
hint: is subject to change. To configure the initial branch name to use in all
hint: of your new repositories, which will suppress this warning, call:
hint:
hint:   git config --global init.defaultBranch <name>
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (2.9s)
```

**Result:** PASS. TP-01-05 and TP-01-06 both completed over real loopback HTTP.

### Required Complete Inventory Repetitions

**Executed:** YES (current session, sequential repetition 1)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Output (literal pass, failure, and completion lines from the full unfiltered capture):**

```text
Running 76 tests using 6 workers
  ✓   3 … serves prior-session actions beside an advanced Tier-A snapshot (6.9s)
  ✘   5 … concepts remain unavailable while independent facts stay usable (1.4s)
  ✘  16 …claim reaches its exact source transformation and consumer chain (6.6s)
  ✓  68 …-012 lever change recomputes without fetch or observed mutation (197ms)
  1) [system-chrome] › tests/company-fundamentals-lab.spec.mjs:14:1 › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
    Expected value: "/data/company-fundamentals/companies/sec-cik-0000789019/current.json"
    Received array: ["/company-fundamentals-lab.html", "/rldata.js", "/rlapp.js", "/rlcompany.js", "/tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js", "/rlg.js", "/rlchart.js", "/rlticker.js", "/rlnav.js"]
  2) [system-chrome] › tests/company-fundamentals-lab.spec.mjs:63:1 › Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
    Locator:  locator('#sources')
    Expected: visible
    Received: hidden
    Timeout:  5000ms
  2 failed
    [system-chrome] › tests/company-fundamentals-lab.spec.mjs:14:1 › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
    [system-chrome] › tests/company-fundamentals-lab.spec.mjs:63:1 › Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
  74 passed (47.4s)
```

**Result:** FAIL. BUG-002 and BS-012 passed, but TP-01-10 did not.

**Executed:** YES (current session, sequential repetition 2)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Output (literal pass, failure, and completion lines from the full unfiltered capture):**

```text
Running 76 tests using 6 workers
  ✓   1 … serves prior-session actions beside an advanced Tier-A snapshot (4.6s)
  ✘   6 … concepts remain unavailable while independent facts stay usable (1.1s)
  ✘  15 …claim reaches its exact source transformation and consumer chain (5.9s)
  ✓  68 …-012 lever change recomputes without fetch or observed mutation (181ms)
  1) [system-chrome] › tests/company-fundamentals-lab.spec.mjs:14:1 › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
    Expected value: "/data/company-fundamentals/companies/sec-cik-0000789019/current.json"
    Received array: ["/company-fundamentals-lab.html", "/rldata.js", "/rlapp.js", "/rlcompany.js", "/tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js", "/rlg.js", "/rlchart.js", "/rlticker.js", "/rlnav.js"]
  2) [system-chrome] › tests/company-fundamentals-lab.spec.mjs:63:1 › Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
    Locator:  locator('#sources')
    Expected: visible
    Received: hidden
    Timeout:  5000ms
  2 failed
    [system-chrome] › tests/company-fundamentals-lab.spec.mjs:14:1 › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
    [system-chrome] › tests/company-fundamentals-lab.spec.mjs:63:1 › Regression: SCN-010-029 every material claim reaches its exact source transformation and consumer chain
  74 passed (45.8s)
```

**Result:** FAIL. The identical Feature 010 failures repeated. Neither full
capture emitted a worker force-kill, worker-lifecycle failure, or error outside
a test; that clean teardown signal does not substitute for the failed 76-test
inventory requirement.

### Pair Contract And Repository Canary

**Executed:** YES (current session)
**Commands:** `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`
**Exit Codes:** 0; 1
**Claim Source:** executed
**Output:**

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
  ✓ current payload satisfies the executable brief contract
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 source-qualified SEC extract binds to SourceArtifact content identity
  ✓ Feature 010 complete publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✗ FAIL (Feature 010 Scope 1 foundation group threw): Cannot read properties of undefined (reading 'source')
================================================
Research-Lab self-test: 502 passed, 1 failed
================================================
```

**Result:** PARTIAL. TP-01-07 and the Market Brief selftest assertion passed;
TP-01-08's complete repository inventory failed in the concurrently active
Feature 010 Scope 1 group.

### Test Integrity And Phase Gates

**Executed:** YES (current session)
**Commands:** BUG-002 regression-quality guard, corrected skip/interception
scan, environment-pollution scan, Node source-lock validator, macOS portability
guard, wrapper Bash parse, and G079 impact planner
**Exit Codes:** 0 for every final command
**Claim Source:** executed
**Output:**

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
BUG002_G003_CLASSIFICATION_SCAN_BEGIN
skipOnlyTodo=PASS
liveInterception=PASS
functionalClassification=PASS
e2eUiClassification=PASS
adversarialRegression=PASS
BUG002_G003_CLASSIFICATION_SCAN_END
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
Test Impact Plan
Configured: false
Changed files:
- tests/brief-refresh-atomicity.support.mjs
No testImpact map configured; run the repo's normal required validation set.
```

The first skip-marker diagnostic exited `1` because an unbounded `xit(` token
matched three ordinary `process.exit(...)` calls. The corrected token-boundary
scan above exited `0`. No test or production byte changed.

### Test Rework Finding Accounting

| Finding | Current test disposition | Routed owner |
| --- | --- | --- |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved: the teardown/lifecycle symptom did not recur, but both required complete inventories failed `74/76` | `bubbles.implement` through `TR-BUG-002-F010-IMPLEMENT-01` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved: focused BUG-002 checks are green, but TP-01-08 and TP-01-10 are not clean | `bubbles.test` after the routed repair |
| `BUG002-CONCURRENT-F010-FOUNDATION-FAILURE` | Open: Feature 010 SCN-010-026 and SCN-010-029 failed twice, and the Feature 010 selftest group threw on missing `source` | `bubbles.implement`, the active owner in `specs/010-company-fundamentals-and-brief-lab/state.json` |
| `BUG002-REGRESSION-PHASE` | Not reached because the required test phase is incomplete | `bubbles.regression` only after a clean independent replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed | `bubbles.validate` after test and regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed | `bubbles.audit` after validation |

`TR-BUG-002-TEST-REWORK-01` resolves only as `route_required`; it does not
create a `test` completion claim. `TR-BUG-002-F010-IMPLEMENT-01` carries the
two exact browser titles, the selftest failure, the Feature 010 owner path, and
the required return route for another unchanged BUG-002 replay.

## Discovered Issues

| Date | Finding | Evidence | Disposition | Owner / reference |
| --- | --- | --- | --- | --- |
| 2026-07-17 | `BUG002-CONCURRENT-F010-FOUNDATION-FAILURE` | Two exact full inventories each failed Feature 010 SCN-010-026 and SCN-010-029 at `74/76`; complete selftest failed `502/1` on missing `source` | routed | `bubbles.implement`; `TR-BUG-002-F010-IMPLEMENT-01`; `specs/010-company-fundamentals-and-brief-lab` |

## Test Rework Closeout Checks

**Phase:** test
**Claim Source:** executed

### Artifact, Traceability, G051, And G095 Results

**Executed:** YES (current session, after report/state edit)
**Commands:** artifact lint, artifact freshness guard, traceability guard,
G051 Check 19 predicate, and discovered-issue disposition guard
**Exit Codes:** 0; 0; 0; 0; 0
**Claim Source:** executed
**Output:**

```text
Required artifact exists: spec.md
Required artifact exists: design.md
Required artifact exists: uservalidation.md
Required artifact exists: state.json
Required artifact exists: scopes.md
Required artifact exists: report.md
No forbidden sidecar artifacts present
Detected state.json status: in_progress
Detected state.json workflowMode: bugfix-fastlane
Top-level status matches certification.status
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
scenario-manifest.json covers 1 scenario contract(s)
Scenarios checked: 1
Test rows checked: 11
RESULT: PASSED (0 warnings)
BUG002_G051_BEGIN
gate=G051 test_env_dependency_gate
source=state-transition-guard.sh Check 19 canonical generic predicate
projectOverride=none
scanFile=specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
matches=0
scanFile=specs/_bugs/BUG-002-market-brief-session-date-drift/scopes.md
matches=0
envDependencyHitFiles=0
G051_RESULT=PASS
BUG002_G051_END
G095: discovered-issue disposition clean (no unfiled deferrals)
```

**Result:** PASS. G005 evidence shape, packet freshness, scenario traceability,
G051 environment independence, and G095 disposition all passed. Artifact lint
retained the existing non-blocking deprecated `scopeProgress` advisory; no
certification field was changed.

### Byte, Status, And Concurrent-Writer Boundary

**Executed:** YES (current session)
**Command:** pre-run SHA-256/status baseline followed by post-edit SHA-256,
staged-path, contract-path, Feature 002, scoped diff-integrity, and full-status
comparison
**Exit Code:** 1 for the aggregate comparison; scoped repair check then 0
**Claim Source:** executed
**Interpretation:** The aggregate comparison intentionally fails when any
protected shared-worktree path changes after baseline. Nine foreign paths
changed concurrently. The edit tool wrote only BUG-002 `report.md` and
`state.json`; this invocation did not restore, normalize, stage, or modify any
foreign path. The Feature 010 changes arrived after the failed test captures,
so they do not retroactively satisfy TP-01-08 or TP-01-10.
**Output:**

```text
BUG002_FINAL_CONTAINMENT_BEGIN
path=tests/brief-refresh-atomicity.support.mjs hash=0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4 result=PASS
path=tests/brief-refresh-atomicity.test.mjs hash=071906cd9cad9168e35b35997c0b5c398c767ed7df9d40d44cd7de8a04b405aa result=PASS
path=tests/market-brief-session-date-drift.spec.mjs hash=f386e157fc53665716379bcb692403b64792498fa949b6260e2de57ce64a8092 result=PASS
path=playwright.config.mjs result=CONCURRENT-CHANGE
path=scripts/selftest.mjs hash=0dfd5dc6178ea29e5317a60f30656932240dc6051db7e0c3738b2987371645f3 result=PASS
path=specs/010-company-fundamentals-and-brief-lab/state.json hash=fd2a09898c29a1a12a87515d06bd49b6c0dfe02210522dfb0acad40883a240bd result=PASS
path=specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/state.json result=CONCURRENT-CHANGE
path=specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/report.md hash=7013bf35e381ec1b323d1539c5f937c8e0665e877cd7827ad27d825e5a9df24d result=PASS
path=specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/scopes.md result=CONCURRENT-CHANGE
path=specs/_bugs/BUG-003-bond-regime-simple-power-model-digest-divergence/design.md hash=46e17211e86de011313e63329f2d9b22c6cfd943c614bcfb097a7d781f372e04 result=PASS
path=company-fundamentals-lab.html result=CONCURRENT-CHANGE
path=rlcompany.js result=CONCURRENT-CHANGE
path=scripts/validate-company-fundamentals.mjs result=CONCURRENT-CHANGE
path=tests/company-fundamentals-contracts.unit.mjs result=CONCURRENT-CHANGE
path=tests/company-fundamentals-lab.spec.mjs result=CONCURRENT-CHANGE
path=tests/fixtures/company-fundamentals/source-qualified/foundation-publication.js result=CONCURRENT-CHANGE
feature002_worktree_diff_exit=0 result=PASS
protected_staged_diff_exit=0 result=PASS
market_contract_diff_exit=0 result=PASS
bug002_staged_diff_exit=0 result=PASS
hash_mismatch_count=9
BUG002_FINAL_CONTAINMENT_END
stateJsonParse=PASS
```

The initial scoped `git diff --check` identified only trailing spaces introduced
in this new evidence section. They were removed with no semantic change; the
identical scoped diff check then exited `0`, and `state.json` parsed. The final
closeout reruns below are the authoritative post-repair checks.

### Test Phase Verdict

`TR-BUG-002-TEST-REWORK-01` is `route_required`, not a successful test-phase
claim. G003, G005, G051, G079, functional coverage, focused E2E, payload
validation, source lock, portability, and isolation are green. G004 remains
failed because TP-01-08 is `502/1` and both mandatory TP-01-10 repetitions are
`74/76`. SCOPE-01, BUG-002 status, and certification remain `in_progress`.
The next required owner is `bubbles.implement` for
`TR-BUG-002-F010-IMPLEMENT-01`.

## Independent Test Current-Byte Replay - 2026-07-18T02:54:35Z

**Phase:** test
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Claim Source:** executed

This replay started from the durable shared-worktree bytes. It read the current
SEC extract before execution, captured a status/hash/index baseline with zero
staged paths, and changed no product, test, fixture, Feature 004, Feature 010,
BUG-003, Market Brief data, planning, or certification byte. Only this report
and test-owned execution routing in `state.json` are updated after execution.

### Dependency Revalidation

The predecessor reports and states were read on current bytes:

- Feature 010 resolves `TR-F010-SCOPE01-TEST-OWNERSHIP-01` through its
  test-owned `11/11`, `508/0`, validator, and focused browser evidence.
- Feature 004 contains `Test Phase Owner-Settled Successor Acceptance -
  2026-07-17T02:27:26Z` with the direct collision canary at `3/3` on the bytes
  accepted in that session.
- BUG-003 resolves `TR-BUG-003-TEST` at `2026-07-17T02:27:26Z` with focused
  `1/1`, protected `1/1`, Bond `27/27`, selftest `508/0`, system-Chrome
  `76/76`, and a route to this BUG-002 replay.

The Feature 010 dependency remains green on the newer current bytes, but the
Feature 004 dependency no longer does: `scripts/selftest.mjs` moved after its
owner-settled checkpoint, and its direct canary now fails closed at `0/3`.

### Exact Test Plan Matrix

| Test Plan row | Current exact command outcome | Skipped |
| --- | --- | ---: |
| TP-01-02 through TP-01-04 | `node --test tests/brief-refresh-atomicity.test.mjs`: exit 0; 14/14 | 0 |
| TP-01-05 | exact grep-filtered browser title: exit 0; 1/1 | 0 |
| TP-01-06 | complete BUG-002 browser file: exit 0; 1/1 | 0 |
| TP-01-07 | committed pair validator: exit 0; PASS | N/A |
| TP-01-08 | complete repository selftest: exit 0; 491/0 | 0 |
| TP-01-09 | exact Bash parse: exit 0 | N/A |
| TP-01-10 repetition 1 | browser assertions 132/132; Feature 004 collection prelude 0/3; not clean | 0 |
| TP-01-10 repetition 2 | exit 1; browser assertions 132/132; Feature 004 prelude 0/3; two force-killed workers and two non-test errors | 0 |

### Current Functional Transaction Matrix

**Executed:** YES (current session)
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (541.577125ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (550.716667ms)
✔ matching generated Tier B advances snapshot payload and history together (917.846166ms)
✔ failed narrative attempt restores config before a successful retry (846.517708ms)
✔ dirty owned publication path refuses before every external boundary (200.126041ms)
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (631.626542ms)
✔ staged owned publication path refuses without changing its index entry (214.084292ms)
✔ untracked owned data path refuses before every external boundary (193.468667ms)
✔ invalid clean baseline refuses before every external boundary (298.228708ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (579.461959ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (928.554958ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (1093.27575ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (542.584625ms)
✔ forced final validation failure restores every owned baseline byte and index path (798.921208ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8394.609834
```

**Result:** PASS. TP-01-02, TP-01-03, and TP-01-04 are green without a
selective-run, skip, todo, bailout, or residual staged-path condition.

### Focused Browser And Runner Identity

**Executed:** YES (current session)
**Commands:** checkout-local version, exact TP-01-05 title, and complete
TP-01-06 file commands from `scopes.md`
**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output:**

```text
Version 1.61.1
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (2.2s)
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (3.3s)
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.8s)
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (2.7s)
```

**Result:** PASS. Both runs used the checkout-local Playwright 1.61.1 runner,
system Chrome, the real wrapper, and real ephemeral loopback HTTP.

### Pair Validator, Complete Selftest, And Shell Parse

**Executed:** YES (current session)
**Commands:** `node scripts/validate-brief-payload.mjs`; `node
scripts/selftest.mjs`; `bash -n scripts/brief-refresh-and-push.sh`
**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output window:** Feature 010 group and aggregate from the full unfiltered
491-check selftest capture, plus the validator line.

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Feature 010 Scope 1 company publication foundation
  ✓ Feature 010 production config validates and binds to the publication fingerprint
  ✓ Feature 010 current pointer selects the content-addressed production manifest
  ✓ Feature 010 retained SEC payload is byte-hash coherent and passes production parsing
  ✓ Feature 010 SourceArtifact binds the exact retained response bytes
  ✓ Feature 010 materialized publication graph and canonical manifest hash validate
  ✓ Feature 010 canonical serialization is key-order independent and SHA-256 matches the standard vector
  ✓ Feature 010 accepted identity and period derive from production-normalized source bytes
  ✓ Feature 010 missing revenue withholds only dependency-reachable outputs without zero or carry
  ✓ Feature 010 unavailable claim resolves required source period transformation consumer rights and unavailable-link lineage without unrelated evidence
  ✓ Feature 010 direct route uses the production current-pointer loader with same-origin scripts and no credential field
  ✓ Feature 010 validator executes exact-capture parsing config graph projection and trace functions
  ✓ Feature 010 reporting periods classify annual quarter YTD and instant and never show YTD or instant as a standalone quarter
  ✓ Feature 010 reconciliation restates amendments and keeps genuine conflicts visible without averaging
  ✓ Feature 010 statement integrity blocks a balance-sheet imbalance while keeping source facts inspectable and passes a clean statement
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

The Bash parse emitted no stdout and returned exit 0. TP-01-07 through
TP-01-09 are green on current bytes.

### Current Required Complete Inventory Repetitions

**Executed:** YES (current session, twice sequentially)
**Command for each run:** `npx --no-install playwright test
--config=playwright.config.mjs --project=system-chrome --reporter=list`
**Claim Source:** interpreted
**Interpretation:** Both complete browser inventories executed all 132 browser
tests and passed BUG-002, current Feature 010 scenarios, and protected BS-012.
They do not satisfy TP-01-10 because both emitted a failing Feature 004 Node
collection prelude, and repetition 2 additionally exited 1 after force-killing
two workers. Repetition 1 did not receive a separate post-command shell-status
sentinel; its raw collection failures are independently reproduced by the
direct canary below and are sufficient to classify the run as non-clean.

```text
REPETITION 1
✖ Feature 004 preserves every pre-existing dirty hunk (20.000792ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (7.181208ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (6.571ms)
Running 132 tests using 6 workers
  ✓    1 …serves prior-session actions beside an advanced Tier-A snapshot (4.0s)
  ✓   58 …7 qualified series and RLVALID preserve legacy shared behavior (488ms)
  ✓  123 …012 lever change recomputes without fetch or observed mutation (235ms)
  132 passed (46.6s)

REPETITION 2
✖ Feature 004 preserves every pre-existing dirty hunk (26.286875ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (7.132667ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (8.725625ms)
Running 132 tests using 6 workers
  ✓    2 …serves prior-session actions beside an advanced Tier-A snapshot (6.9s)
  ✓   63 …7 qualified series and RLVALID preserve legacy shared behavior (774ms)
  ✓  115 …012 lever change recomputes without fetch or observed mutation (244ms)
Error: worker-4 process did not exit within 300000ms after stop, force-killed it
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
  132 passed (5.5m)
  2 errors were not a part of any test, see above for details
BUG002_TP0110_REPETITION2_EXIT=1
```

**Result:** FAIL. TP-01-10 requires two clean exits with no collection-side or
worker-lifecycle errors; neither repetition meets that contract.

### Feature 004 Direct Dependency Canary

**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
✖ Feature 004 preserves every pre-existing dirty hunk (11.97125ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (4.953083ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (4.266ms)
ℹ tests 3
ℹ suites 0
ℹ pass 0
ℹ fail 3
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: Feature 006 current start byte is exact
108232 !== 117426
```

**Result:** FAIL CLOSED. Feature 004's accepted checkpoint still requires the
Feature 006 marker at byte `117426`; current `scripts/selftest.mjs` places it at
`108232`. The existing parser must not be weakened before a planning-owned
successor checkpoint records the new complete identity.

### Current Feature 010 And SEC Capture Verification

**Executed:** YES (current session)
**Commands:** current company unit file, production validator, and complete
company browser file
**Exit Codes:** 0; 0; 0
**Claim Source:** executed
**Output:**

```text
✔ retained SEC payload is byte-hash coherent and production-parseable (24.292ms)
✔ production SEC parser hashes raw bytes and normalizes aligned issuer and filing fields (0.53425ms)
✔ exact recorded source publication validates and binds the retained response bytes (7.807167ms)
ℹ tests 49
ℹ pass 49
ℹ fail 0
ℹ skipped 0
[company-fundamentals] source capture: 184333 exact raw SEC response bytes hash-valid
[company-fundamentals] objects: 13 reachable immutable objects hash-valid
[company-fundamentals] SCN-010-026: dependency withholding valid
[company-fundamentals] SCN-010-029: source trace valid
[company-fundamentals] source capture: exact raw SEC response bytes retained
[company-fundamentals] validation: PASS
Running 30 tests using 1 worker
  ✓   1 …concepts remain unavailable while independent facts stay usable (543ms)
  ✓   2 …claim reaches its exact source transformation and consumer chain (1.1s)
  ✓  29 …eserves owner clocks limitations and non recomputation boundary (268ms)
  ✓  30 …d evidence produces one unchanged brief without narrative churn (258ms)
  30 passed (10.4s)
```

The SEC metadata extract remained
`a7f7d585d5f6ce328c3e0ecb70a789478ca5cf5b8b1d7237bb99e635c71eef8b`
and its retained raw gzip/base64 payload remained
`cde4e2480f478befe0c03745e2611669ff1b73665d15fbe46f4a765e8f764bce`
from baseline through final containment. The historical 11/11 and 2/2
transition is therefore verified and its newer current consumers are also
green at 49/49 and 30/30.

### Integrity, Isolation, And Governance

**Executed:** YES (current session)
**Claim Source:** executed
**Output:**

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
skipOnlyTodo=PASS
liveInterception=PASS
requiredBailout=PASS
internalMock=PASS
integrityFailures=0
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
G051_RESULT=PASS
Test Impact Plan
Configured: false
No testImpact map configured; run the repo's normal required validation set.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
Files scanned:  7
Violations:     0
Warnings:       1
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
Result: 17 passed, 0 failed, 1 advisory
```

The implementation-reality warning is the existing design-discovery fallback;
it scanned seven files and found zero violations. Doctor's framework drift and
undeclared observability messages are advisory-only. This project declares no
`testImpact` or `traceContracts`, so G079 retains the normal full matrix and
G080/G100 are clean no-ops.

The current traceability guard exited 1 for one planning-owned shape issue:

```text
scenario-manifest.json covers 1 scenario contract(s)
All linked tests from scenario-manifest.json exist
Scope 1: SCOPE-01 Atomic Market Brief Publication has no recognized Test Plan section (expected exact ## Test Plan or ### Test Plan)
Scope 1: SCOPE-01 Atomic Market Brief Publication scenario maps to DoD item: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
RESULT: FAILED (1 failures, 0 warnings)
```

The live scope heading is `### Test Plan - SCOPE-01`. Changing that planning
text is owned by `bubbles.plan`, not this test phase.

### Runtime Authenticity And Byte Containment

**Executed:** YES (current session)
**Claim Source:** executed
**Output:**

```text
BUG002_RUNTIME_AUTHENTICITY_BEGIN
wrapperExit=0
osTempFixture=true
realGitRepo=true
realWrapperBytes=true
realHttpStatus=200
realPageServed=true
loopbackEphemeralHttp=true
coherentPublishedPair=true
snapshotRetained=true
historyRetained=true
payloadRetained=true
fixtureCleaned=true
result=PASS
BUG002_RUNTIME_AUTHENTICITY_END
```

The first hash probe was invalid because a zsh local named `path` shadowed
zsh's executable-search array; its `shasum: command not found` rows are not
byte evidence. The corrected probe used `/usr/bin/shasum`, retained all 21
pre-run hashes, found zero staged BUG-owned paths, and found zero temporary
fixture residue. No concurrent byte movement occurred during this invocation.

The current pair is a later clean July 17 publication rather than the historical
July 15 repair bytes. It is coherent and exactly HEAD-identical:

```text
payloadSessionDate=2026-07-17
snapshotSessionDate=2026-07-17
historyRows=49
historyLastSessionDate=2026-07-17
pairCoherent=true
HEAD/worktree payload blob: 02a7a7d32501b443e7336c83600dc2ff35bb685a
HEAD/worktree snapshot blob: 1849ae62c2cc900d37df7fcff759ddce23820e24
HEAD/worktree history blob: 86e781ec94ee78b5f243ce538029e46c137286ee
bugOwnedStagedNone=PASS
fixtureResidueCount=0
```

Git provenance shows successful later Market Brief auto-refresh commits at
pre-market, morning, pre-close, and after-hours on July 17. The old repair-blob
comparison is therefore historical, while TP-01-07 and the current HEAD pair
are green.

### Current Finding Accounting And Verdict

| Finding | Current disposition | Owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed on current bytes by pair validation and selftest `491/0` | accepted for this test replay |
| `BUG002-WRAPPER-ATOMICITY` | Addressed by 14/14 functional behavior and current runtime authenticity | accepted for this test replay |
| `BUG002-REGRESSION-GAP` | Addressed at the focused boundary by exact title 1/1 and complete file 1/1 | accepted for this test replay |
| `BUG002-DIRTY-BOUNDARY` | Addressed by exact baseline/final hash identity, no staging, and zero fixture residue | accepted for this test replay |
| `BUG002-CONCURRENT-F010-FOUNDATION-FAILURE` | Addressed on newer current bytes: unit 49/49, validator PASS, browser 30/30, selftest Feature 010 group green | accepted for this test replay |
| `BUG002-F004-SELFTEST-CHECKPOINT-DRIFT` | Unresolved: current Feature 006 marker is `108232`, accepted Feature 004 checkpoint requires `117426` | `bubbles.plan`, then `bubbles.test` |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved: both full runs emit Feature 004 0/3; repetition 2 also force-kills two workers | same Feature 004 plan/test chain |
| `BUG002-TRACEABILITY-TEST-PLAN-HEADING` | Unresolved: current guard does not recognize `### Test Plan - SCOPE-01` | `bubbles.plan` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because TP-01-10 and traceability are not clean | `bubbles.test` after planning-owned repairs |
| `BUG002-REGRESSION-PHASE` | Not executed because the test exit gate is red | `bubbles.regression` only after clean test replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed | `bubbles.audit` after validation |

**Test verdict:** `NOT_TESTED`. SCOPE-01 and BUG-002 remain `in_progress`.
No `test` phase completion, Fixed/Verified/Closed status, regression,
validation, audit, certification, or parent Feature 006 replay is claimed.
The immediate required owner is `bubbles.plan`; after its two exact planning
repairs, `bubbles.test` must rerun the direct Feature 004 canary and the
unchanged BUG-002 matrix, including two clean TP-01-10 repetitions.

### Post-Edit Closeout

**Executed:** YES (current session)
**Claim Source:** executed
**Output:**

```text
stateJsonParse=PASS
nextRequiredOwner=bubbles.plan
pendingTransitions=TR-BUG-002-F004-PLAN-02,TR-BUG-002-PLAN-TRACEABILITY-01
certificationStatus=in_progress
completedPhaseClaims=implement
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
G095: discovered-issue disposition clean (no unfiled deferrals)
report.md: No errors found
state.json: No errors found
```

The post-edit traceability rerun remains the single routed failure described
above. No state transition toward `done` was attempted, so the terminal
state-transition guard is not applicable to this route-only test result.

### Additional Independent Replay Delta - 2026-07-18T02:54:58Z

**Phase:** test
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Claim Source:** executed

This addendum records only evidence not present in the concurrent replay above.
It does not supersede that replay or alter its plan-owned routing. A second
sequential pair of the identical complete system-Chrome command confirmed the
same non-clean finding set with reversed lifecycle ordering: the first run
force-killed two workers after all 132 assertions passed, while the second run
completed 132/132 cleanly. Both runs emitted the same real Feature 004 `0/3`
Node canary prelude before Playwright's inventory.

**Executed:** YES (current session, twice sequentially)
**Command for each run:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Codes:** 1; 0
**Claim Source:** executed
**Output window:** literal collection and completion lines from the full
unfiltered captures.

```text
ADDITIONAL REPETITION 1
FAIL Feature 004 preserves every pre-existing dirty hunk
FAIL Feature 004 collision disposition parser fails closed on malformed records
FAIL Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
Running 132 tests using 6 workers
  PASS Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
Error: worker-4 process did not exit within 300000ms after stop, force-killed it
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
132 passed (5.6m)
2 errors were not a part of any test, see above for details
ADDITIONAL REPETITION 2
FAIL Feature 004 preserves every pre-existing dirty hunk
FAIL Feature 004 collision disposition parser fails closed on malformed records
FAIL Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
Running 132 tests using 6 workers
  PASS Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
132 passed (24.9s)
```

**Result:** FAIL for repeated clean-exit reliability. Across both independent
pairs, every exact inventory emitted the Feature 004 canary failure; one run in
each pair additionally emitted two force-killed-worker errors. No worker count,
project, test match, grep, shard, retry, or inventory setting changed.

The first custom source-authenticity probe in this addendum exited `1` because
its shell quoting removed five source literals from the comparisons. It changed
no file. The corrected shell-safe probe retained the same accepted hashes and
passed every check:

```text
hashStable:tests/brief-refresh-atomicity.support.mjs=PASS
hashStable:tests/brief-refresh-atomicity.test.mjs=PASS
hashStable:tests/market-brief-session-date-drift.spec.mjs=PASS
hashStable:playwright.config.mjs=PASS
zeroSkipOnlyTodo=PASS
zeroRequestInterception=PASS
zeroRequiredBailout=PASS
functionalCasesFourteen=PASS
browserCasesOne=PASS
exactProtectedTitle=PASS
productionWrapperCopied=PASS
productionPageAndRendererCopied=PASS
realGitFixture=PASS
realLoopbackHttp=PASS
meaningfulFunctionalAssertions=PASS
meaningfulBrowserAssertions=PASS
adversarialDateDiscriminator=PASS
zeroWorkerNarrowing=PASS
zeroInventoryNarrowing=PASS
externalStubsOnly=PASS
violations=0
result=PASS
```

`BUG002-TEST-INTEGRITY-PROBE-QUOTING` is addressed by that corrected result.
VS Code diagnostics were clean for the three BUG-002 test files,
`playwright.config.mjs`, `report.md`, and `state.json`. The production wrapper
retained three diagnostics: `WEB_ALLOW`, `BRIEF_CONTRACT`, and `PROMPT` are
assigned but no longer consumed after the parallel-narrative refactor.
`BUG002-WRAPPER-DEAD-NARRATIVE-CONFIG` remains open to `bubbles.implement`.
No source or test edit was made, and the existing `NOT_TESTED` verdict remains
unchanged.

## Implementation Diagnostics Reconciliation - 2026-07-18T03:45:28Z

**Phase:** implement
**Agent:** `bubbles.implement`
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Transition:** `TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01`
**Claim Source:** executed

This invocation resumed after the production edit already existed. It made no
source or test edit. Current bytes prove that the wrapper contains exactly the
prior three-assignment cleanup, while every protected test and selftest identity
remains unchanged. BUG-002 and SCOPE-01 remain nonterminal; this evidence does
not claim independent test, regression, validation, audit, certification, or
parent Feature 006 replay.

### Current-Byte Identity

**Executed:** YES (current session)
**Claim Source:** executed
**Command:** `shasum -a 256 scripts/brief-refresh-and-push.sh tests/brief-refresh-atomicity.support.mjs tests/brief-refresh-atomicity.test.mjs tests/market-brief-session-date-drift.spec.mjs playwright.config.mjs tests/feature-004-dirty-tree-collision.test.mjs scripts/selftest.mjs`, followed by `git hash-object scripts/brief-refresh-and-push.sh`, path-scoped status, and the complete wrapper diff
**Exit Code:** 0
**Output:**

```text
BUG002_IDENTITY_RECONCILIATION_COMPLETE_BEGIN
642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181  scripts/brief-refresh-and-push.sh
0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4  tests/brief-refresh-atomicity.support.mjs
071906cd9cad9168e35b35997c0b5c398c767ed7df9d40d44cd7de8a04b405aa  tests/brief-refresh-atomicity.test.mjs
f386e157fc53665716379bcb692403b64792498fa949b6260e2de57ce64a8092  tests/market-brief-session-date-drift.spec.mjs
8c4beaf38397cdc44210c0dd4b7dc76c5da11fcde135573aa2db5642484cc386  playwright.config.mjs
104bc0ded6ae2fbe45bc51aa66e110fcac3f3050b3ab18cb4040af48ee7dac57  tests/feature-004-dirty-tree-collision.test.mjs
519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b  scripts/selftest.mjs
WRAPPER_GIT_OID
222f371774b0b272e9d16724e819be38917671a1
WRAPPER_STATUS
 M scripts/brief-refresh-and-push.sh
WRAPPER_COMPLETE_DIFF
diff --git a/scripts/brief-refresh-and-push.sh b/scripts/brief-refresh-and-push.sh
index d7ad58d..222f371 100755
BUG002_IDENTITY_RECONCILIATION_COMPLETE_END
```

**Result:** PASS. The wrapper matches the routed after-image at SHA-256
`642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181`
and Git OID `222f371774b0b272e9d16724e819be38917671a1`. The complete diff showed
only removal of the dead `WEB_ALLOW`, `BRIEF_CONTRACT`, and `PROMPT`
assignments plus their stale comments. The protected hashes are unchanged.

The active Feature 004 planning authority is the additive
`feature004-dirty-collision-selftest-successor/v3` block. Its current selftest
identity remains Git OID `660eb298ff2a417064e514da5db8f95c2e85b87d`, SHA-256
`519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b`,
and six hunks. V3 corrects only hunk 1 committed-producer provenance; the
Feature 006 slice remains `[108232,150300)` at SHA-256
`2959603e818bc2494baa51be85edcd71343657facdc660b0dc66bcfacb43ddef`.

### Parse, Diagnostics, Functional, And Pair Acceptance

**Executed:** YES (current session)
**Claim Source:** executed
**Commands:** `bash -n scripts/brief-refresh-and-push.sh`; `shellcheck scripts/brief-refresh-and-push.sh`; `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`
**Exit Codes:** 0; 0; 0; 0
**Output:**

```text
BUG002_PARSE_SHELLCHECK_BEGIN
BASH_PARSE_EXIT=0
SHELLCHECK_EXIT=0
BUG002_PARSE_SHELLCHECK_END
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (536.199916ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (570.235708ms)
✔ matching generated Tier B advances snapshot payload and history together (1030.376292ms)
✔ failed narrative attempt restores config before a successful retry (1034.361625ms)
✔ dirty owned publication path refuses before every external boundary (217.149125ms)
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (789.984917ms)
✔ staged owned publication path refuses without changing its index entry (220.660083ms)
✔ untracked owned data path refuses before every external boundary (204.183667ms)
✔ invalid clean baseline refuses before every external boundary (299.368916ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (598.383ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (837.969833ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (981.326917ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (643.238667ms)
✔ forced final validation failure restores every owned baseline byte and index path (883.792958ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8903.825458
BUG002_FUNCTIONAL_MATRIX_EXIT=0
BUG002_FUNCTIONAL_MATRIX_END
BUG002_PAIR_VALIDATOR_BEGIN
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
BUG002_PAIR_VALIDATOR_EXIT=0
BUG002_PAIR_VALIDATOR_END
```

**Result:** PASS. Bash parses, shellcheck emits zero diagnostics, all 14
unchanged functional cases pass with no skips/todos, and the unchanged current
pair validator accepts the committed pair.

### Portability, Focused Browser, And Diff Integrity

**Executed:** YES (current session)
**Claim Source:** executed
**Commands:** `bash .github/bubbles/scripts/macos-portability-guard.sh scripts/brief-refresh-and-push.sh`; `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`; `git diff --check -- scripts/brief-refresh-and-push.sh`
**Exit Codes:** 0; 0; 0
**Output:**

```text
BUG002_PORTABILITY_BEGIN
== macOS portability guard -- scanning 1 file(s) ==
ok   class-1 raw-timeout: none
ok   class-2 in-place-sed: none
ok   class-3 date-d-parse: none
ok   class-4 stat-c-mtime: none
ok   class-5 readlink-f-absolutize: none
ok   class-6 grep-pcre: none
ok   class-7 bracket-v-isset: none
ok   class-8 mapfile-readarray: none
ok   class-9 mktemp-suffix: none
ok   class-10 df-output: none
ok   class-11 bin-true-false: none
ok   class-12 paste-no-stdin-operand: none
ok   class-13 date-nanoseconds: none

PASS: the scanned surface is WSL+macOS portable.
BUG002_PORTABILITY_EXIT=0
BUG002_PORTABILITY_END
BUG002_FOCUSED_BROWSER_BEGIN

Running 1 test using 1 worker

  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (2.0s)

  1 passed (3.3s)
BUG002_FOCUSED_BROWSER_EXIT=0
BUG002_FOCUSED_BROWSER_END
BUG002_WRAPPER_DIFF_CHECK_BEGIN
BUG002_WRAPPER_DIFF_CHECK_EXIT=0
BUG002_WRAPPER_DIFF_CHECK_END
```

**Result:** PASS. All 13 portability classes pass, the exact protected BUG-002
browser title passes `1/1`, and the wrapper-scoped diff check exits `0`.

### Finding Closure And Routing

`BUG002-WRAPPER-DEAD-NARRATIVE-CONFIG` is addressed at implementation level.
No test byte, Feature 004 artifact, Feature 010/BUG-003 artifact, planning text,
DoD item, checkbox, or certification field changed. The complete repository
inventory was intentionally not rerun because the routed next phase owns the
Feature 004 v3 parser adoption and unchanged broad replay.

The next required owner is `bubbles.test`, in this order:

1. Validate mandatory v2 and adopt the Feature 004 v3 successor as the active
  strict parser target while preserving every predecessor as validated history.
2. Run the direct Feature 004 collision canary and require `3/3` green without
  inferring Feature 004 completion.
3. Replay the unchanged BUG-002 focused matrix and required complete inventory
  without weakening assertions, worker count, inventory, or lifecycle checks.

BUG-002 remains `in_progress`; SCOPE-01 remains `in_progress`; certification
remains `in_progress` with no completed certified phase or scope added.

## Implementation Diagnostics Current-Session Replay - 2026-07-18T03:56:02Z

**Phase:** implement
**Agent:** `bubbles.implement`
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Transition:** `TR-BUG-002-IMPLEMENT-DIAGNOSTICS-01`
**Claim Source:** executed

This invocation found the permitted wrapper after-image already present and the
transition already resolved. It did not reapply or widen that edit. Instead, it
reproduced the three diagnostics against immutable `HEAD`, reran the focused
checks against the current worktree, and verified the protected identities
before recording this replay. No source, test, Feature 004, Feature 005, Feature
010, scope-planning, validation, audit, or certification byte changed.

### Root-Cause Decision

**Claim Source:** interpreted
**Interpretation:** The delegated launcher's current source makes it the sole
policy owner; the retained wrapper assignments have no consumer and must be
removed rather than reconnected.

The three assignments are dead wrapper configuration and must not be
reconnected. The current call path delegates to
`scripts/brief-narrative-parallel.mjs`, which owns the four lane instructions,
the complete lane prompt, the curated `webAllow`, `BRIEF_NO_WEB` handling, and
construction of `--allow-all-tools`, `--deny-tool=shell`, and per-lane
`--allow-url` arguments. Reconnecting the stale wrapper values would create a
second, unused policy authority. The existing surgical removal is therefore the
smallest design-consistent repair; dummy reads would only conceal the defect.

### Exact Diagnostic RED And Focused GREEN

**Executed:** YES (current session)
**Claim Source:** executed
**Command:** framed `shellcheck -f gcc -s bash <(git show HEAD:scripts/brief-refresh-and-push.sh)` followed by `shellcheck -f gcc scripts/brief-refresh-and-push.sh`
**Exit Codes:** 1; 0
**Output:**

```text
BUG002_COMPACT_DIAGNOSTIC_EVIDENCE_BEGIN
HEAD_SOURCE=git-show-HEAD:scripts/brief-refresh-and-push.sh
/dev/fd/11:190:39: warning: WEB_ALLOW appears unused. Verify use (or export if used externally). [SC2034]
/dev/fd/11:192:3: warning: BRIEF_CONTRACT appears unused. Verify use (or export if used externally). [SC2034]
/dev/fd/11:193:3: warning: PROMPT appears unused. Verify use (or export if used externally). [SC2034]
HEAD_DIAGNOSTIC_EXIT=1
WORKTREE_DIAGNOSTIC_EXIT=0
DIAGNOSTIC_FINDING_COUNT=3
DIAGNOSTIC_DISCRIMINATOR=PASS
BUG002_COMPACT_DIAGNOSTIC_EVIDENCE_END
```

**Result:** PASS. The committed predecessor reproduces all three routed
findings, while the current wrapper emits none.

### Requested Focused Validation Sequence

**Executed:** YES (current session)
**Claim Source:** executed
**Commands:** `bash -n scripts/brief-refresh-and-push.sh`; `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`; `bash .github/bubbles/scripts/macos-portability-guard.sh scripts/brief-refresh-and-push.sh`; `shellcheck scripts/brief-refresh-and-push.sh`; `git diff --check -- scripts/brief-refresh-and-push.sh`
**Exit Codes:** 0; 0; 0; 0; 0; 0
**Output:** verbatim final test-runner window from the full fixture output,
followed by the complete focused command signals

```text
BASH_PARSE_EXIT=0
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (593.586ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (577.178208ms)
✔ matching generated Tier B advances snapshot payload and history together (1003.776166ms)
✔ failed narrative attempt restores config before a successful retry (879.287542ms)
✔ dirty owned publication path refuses before every external boundary (201.240709ms)
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (637.046959ms)
✔ staged owned publication path refuses without changing its index entry (380.4805ms)
✔ untracked owned data path refuses before every external boundary (214.178209ms)
✔ invalid clean baseline refuses before every external boundary (328.987ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (618.145583ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (893.494708ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (1052.716875ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (715.735417ms)
✔ forced final validation failure restores every owned baseline byte and index path (859.174542ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9011.486584
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
== macOS portability guard -- scanning 1 file(s) ==
ok   class-1 raw-timeout: none
ok   class-2 in-place-sed: none
ok   class-3 date-d-parse: none
ok   class-4 stat-c-mtime: none
ok   class-5 readlink-f-absolutize: none
ok   class-6 grep-pcre: none
ok   class-7 bracket-v-isset: none
ok   class-8 mapfile-readarray: none
ok   class-9 mktemp-suffix: none
ok   class-10 df-output: none
ok   class-11 bin-true-false: none
ok   class-12 paste-no-stdin-operand: none
ok   class-13 date-nanoseconds: none
PASS: the scanned surface is WSL+macOS portable.
SHELLCHECK_EXIT=0
WRAPPER_DIFF_CHECK_EXIT=0
```

**Result:** PASS. The exact 14-case matrix remains unchanged and green, the
current pair validates, all 13 portability classes pass, diagnostics are clean,
and the path-scoped diff check reports no whitespace error.

### Protected Identity Replay

**Executed:** YES (current session)
**Claim Source:** executed
**Command:** explicit SHA-256 checks for the wrapper, three BUG-002 tests, Feature 004 collision parser, and selftest; then `git rev-parse`/`git hash-object` identity checks for `scripts/selftest.mjs`
**Exit Code:** 0
**Output:**

```text
tests/brief-refresh-atomicity.support.mjs=0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4
tests/brief-refresh-atomicity.test.mjs=071906cd9cad9168e35b35997c0b5c398c767ed7df9d40d44cd7de8a04b405aa
tests/market-brief-session-date-drift.spec.mjs=f386e157fc53665716379bcb692403b64792498fa949b6260e2de57ce64a8092
tests/feature-004-dirty-tree-collision.test.mjs=104bc0ded6ae2fbe45bc51aa66e110fcac3f3050b3ab18cb4040af48ee7dac57
scripts/selftest.mjs=519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b
scripts/brief-refresh-and-push.sh=642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181
HASH_FENCE_EXIT=0
SELFTEST_HEAD_OID=44be5ac34526a076050ddf69e92cb32ffc443831
SELFTEST_INDEX_OID=44be5ac34526a076050ddf69e92cb32ffc443831
SELFTEST_WORKTREE_OID=660eb298ff2a417064e514da5db8f95c2e85b87d
COLLISION_WORKTREE_OID=230f0e0814660b3480691fc77cd0d9aff4b5a05d
V3_IDENTITY_EXIT=0
```

**Result:** PASS. All three BUG-002 test hashes are unchanged. The Feature 004
collision parser was neither executed nor edited, and both it and
`scripts/selftest.mjs` retain the v3 handoff identities. The next required owner
remains `bubbles.test` for `TR-BUG-002-F004-V3-PARSER-01`. BUG-002 and SCOPE-01
remain `in_progress`; no test, regression, validation, audit, certification, or
parent replay claim is made.

## V3 Parser Adoption Attempt - 2026-07-18T04:04:55Z

**Phase:** test
**Agent:** `bubbles.test`
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Transitions:** `TR-BUG-002-F004-V3-PARSER-01` and `TR-F004-SELFTEST-SUCCESSOR-V3-TEST`
**Claim Source:** executed

This invocation changed only `tests/feature-004-dirty-tree-collision.test.mjs`
before recording this evidence. It preserved every Feature 004 planning block
byte-for-byte and preserved `scripts/selftest.mjs` at Git worktree OID
`660eb298ff2a417064e514da5db8f95c2e85b87d` and SHA-256
`519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b`.
The direct canary did not become green within the required three-attempt limit,
so no BUG-002 TP-01-02 through TP-01-10 replay or downstream guard matrix was
started.

### Direct Canary Attempt 1

**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Output window:** literal complete runner summary and first discriminating assertion

```text
✖ Feature 004 preserves every pre-existing dirty hunk (20.176584ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (8.882ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (10.087584ms)
ℹ tests 3
ℹ suites 0
ℹ pass 0
ℹ fail 3
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 112.805292
AssertionError [ERR_ASSERTION]: Feature 006 current start byte is exact
108232 !== 117426
```

**Result:** FAIL. The parser reached the immutable settled-delta predecessor but
still compared that historical offset to current v2 bytes before applying v2's
exact offset transition.

### Direct Canary Attempt 2

**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Output window:** literal complete runner summary and first discriminating assertion

```text
✖ Feature 004 preserves every pre-existing dirty hunk (83.499916ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (57.940708ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (200.503875ms)
ℹ tests 3
ℹ suites 0
ℹ pass 0
ℹ fail 3
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 405.438125
AssertionError [ERR_ASSERTION]: Feature 010 current marker counts, order, bounds, length, and hash are exact
actual startByte=174699 expected startByte=183893
actual endByteExclusive=186985 expected endByteExclusive=191742
```

**Result:** FAIL. The parser advanced through the Feature 006 transition, then
the owner-settled v1 predecessor still compared its historical Feature 010
marker offsets to the current v2 marker slice.

### Direct Canary Attempt 3

**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Output:** literal complete runner summary and first discriminating assertion

```text
✖ Feature 004 preserves every pre-existing dirty hunk (84.007875ms)
✖ Feature 004 collision disposition parser fails closed on malformed records (58.660416ms)
✖ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (72.262834ms)
ℹ tests 3
ℹ suites 0
ℹ pass 0
ℹ fail 3
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 265.643625
AssertionError [ERR_ASSERTION]: selftest successor v2 preserves all eight committed index transitions
undefined !== 8
```

**Result:** FAIL. The exact v2 block stores the eight entries under
`committedIndexTransitions.records`; the local validator incorrectly reads
`committedIndexTransitions.length`. The current partial parser after-image is
SHA-256 `39f134c4976fdd8eadb71330045d7d27d4cfa7d367c052db554d1b5805f81545`
and Git worktree OID `47b0cc8f24cd6841cc98b8a28150d39ab39b1733`.

### Test Finding Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| `F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001` | Unresolved: direct canary is `0/3` after the maximum three local attempts | `bubbles.test` |
| `F004-V3-PARSER-COMMITTED-TRANSITIONS-SHAPE-001` | Unresolved local test defect: validate `committedIndexTransitions.records` as the exact eight-record sequence and rerun under a fresh authorized attempt budget | `bubbles.test` |
| `BUG002-INDEPENDENT-VERIFICATION` | Not run because the direct Feature 004 prerequisite never became green | `bubbles.test` after parser repair |

**Test verdict:** `NOT_TESTED`. `TR-BUG-002-F004-V3-PARSER-01` and
`TR-F004-SELFTEST-SUCCESSOR-V3-TEST` remain pending. BUG-002 and SCOPE-01 remain
`in_progress`; certification remains `in_progress`. Regression, validation,
audit, certification, and parent Feature 006 replay were not run or claimed.

## V3 Parser Validation Checkpoint - 2026-07-18T04:13:41Z

**Phase:** test
**Agent:** `bubbles.test`
**Execution model:** `direct-authorized-runner` under `bubbles.goal`
**Transitions:** `TR-BUG-002-F004-V3-PARSER-01` and `TR-F004-SELFTEST-SUCCESSOR-V3-TEST`
**Claim Source:** executed

This fresh bounded invocation recomputed the routed after-image before editing.
The stale attempt-3 assertion was absent: the saved parser already read
`committedIndexTransitions.records` and the untouched direct canary passed. A
contract audit found one remaining test-owned omission: v3's raw SHA-256 was
frozen but its marker-inclusive byte length was not. One edit attempt added the
exact `18606`-byte assertion beside the existing v3 raw-hash assertion. No
product, planning, selftest, wrapper, or other test byte changed.

### Identity And Raw-Block Fence

**Executed:** YES (current session)
**Command:** path-scoped `git status`, SHA-256 and Git worktree-object checks, followed by a read-only v2/v3 marker parser
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
PARSER_REPAIR_PREIMAGE_BEGIN
 M scripts/selftest.mjs
 M specs/004-fx-regime-relative-value-lab/report.md
 M specs/004-fx-regime-relative-value-lab/state.json
 M specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
 M specs/_bugs/BUG-002-market-brief-session-date-drift/state.json
 M tests/feature-004-dirty-tree-collision.test.mjs
39f134c4976fdd8eadb71330045d7d27d4cfa7d367c052db554d1b5805f81545  tests/feature-004-dirty-tree-collision.test.mjs
519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b  scripts/selftest.mjs
COLLISION_WORKTREE_OID=47b0cc8f24cd6841cc98b8a28150d39ab39b1733
SELFTEST_WORKTREE_OID=660eb298ff2a417064e514da5db8f95c2e85b87d
PARSER_REPAIR_AFTERIMAGE_BEGIN
83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d  tests/feature-004-dirty-tree-collision.test.mjs
519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b  scripts/selftest.mjs
COLLISION_WORKTREE_OID=1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5
SELFTEST_WORKTREE_OID=660eb298ff2a417064e514da5db8f95c2e85b87d
v2.sha256=eef8aa415b739df80b1aab4046adbb64a39c87c6fb1b73ff0ac210b67870f32a
v2.byteLength=35844
v3.sha256=8427a99ae9cadd27e401a7a06bd2f0e707e3c5096508c4e7fe903db67f8f1995
v3.byteLength=18606
PARSER_REPAIR_AFTERIMAGE_END
```

**Result:** PASS. The parser changed from SHA-256 `39f134...1545` / Git
worktree OID `47b0cc...1733` to `83e255...667d` / `1e57f5...f4d5` in one
test-only attempt. `scripts/selftest.mjs`, both planning blocks, and their raw
identities remained exact.

### Direct Canary Green

**Executed:** YES (current session)
**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output window:** final contract record and complete runner summary from the post-edit run

```text
{
  "historicalUntrackedPath": "scripts/validate-brief-payload.mjs",
  "currentStatus": "",
  "currentBlobOid": "7bd6639ce774a6b2a04f5cebf5254684a9f3ba28",
  "prefixLineChunks": 137,
  "prefixSha256": "78904d50f67b5e3046fe264d8585b9b68d21f7d3259bbb0284e2860f5aa7870f",
  "volatilePath": "market-brief.config.json",
  "volatileEditAttemptedByScopeOne": false
}
✔ Feature 004 preserves every pre-existing dirty hunk (1054.350875ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (7780.829042ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (704.021625ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9630.73075
```

**Result:** PASS. All three current-session direct runs passed `3/3`: the first
ran against the untouched saved after-image, the second ran immediately after
edit attempt `1/3`, and the third validated the parser against the checkpointed
state/report after-image. The parser validates nine immutable predecessors,
exact v2 and v3 raw identities, all six current diff hunks and producer
boundaries, both marker slices and the 65-symbol inventory, all 13 paths, every
false completion claim, and exhaustive closed-schema mutations.

### Parser Guard Matrix

**Executed:** YES (current session)
**Commands:** bugfix regression-quality guard; Node source-lock validator; environment-pollution scan; parser integrity/diff probe; VS Code diagnostics
**Exit Codes:** 0; 0; 0; 0; diagnostics clean
**Claim Source:** executed
**Output:**

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /Users/pkirsanov/Projects/research-lab
  Timestamp: 2026-07-18T04:11:59Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/feature-004-dirty-tree-collision.test.mjs
✅ Adversarial signal detected in tests/feature-004-dirty-tree-collision.test.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
COLLISION_TEST_INTEGRITY_BEGIN
skipOnlyTodoMatches=0
mockOrInterceptionMatches=0
silentBailoutMatches=0
gitDiffCheckExit=0
auditFailures=0
COLLISION_TEST_INTEGRITY_END
VS Code diagnostics: No errors found
```

**Result:** PASS. Regression quality, source locking, environment isolation,
skip/mock/bailout integrity, path-scoped diff integrity, and parser diagnostics
are clean on the final after-image.

### Evidence Diff Repair

**Executed:** YES (current session)
**Command:** `git diff --check -- tests/feature-004-dirty-tree-collision.test.mjs specs/004-fx-regime-relative-value-lab/state.json specs/_bugs/BUG-002-market-brief-session-date-drift/report.md specs/_bugs/BUG-002-market-brief-session-date-drift/state.json`
**Exit Codes:** 1; 0 after removing only the reported Markdown hard-break spaces
**Claim Source:** executed
**Output window:** first failure class and identical-command final result

```text
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3216: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3217: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3232: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3233: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3234: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3235: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3269: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3270: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3271: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3272: trailing whitespace.
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md:3307: trailing whitespace.
AUTHORED_DIFF_CHECK=FAIL
AUTHORED_DIFF_CHECK=PASS
```

**Result:** PASS after one evidence-only formatting repair. No test, product,
planning-block, wrapper, selftest, certification, or scope-status byte changed.

### V3 Parser Finding Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| `F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001` | Addressed for the parser portion: exact v2/v3 closed contracts and direct canary are green | `bubbles.test` |
| `F004-V3-PARSER-COMMITTED-TRANSITIONS-SHAPE-001` | Addressed by the saved after-image before this invocation; `.records` is exercised by both green direct runs | `bubbles.test` |
| `F004-V3-RAW-LENGTH-001` | Addressed in edit attempt 1: v3 marker-inclusive byte length `18606` is now fail-closed | `bubbles.test` |
| `BUG002-EVIDENCE-DIFF-TRAILING-SPACE-001` | Addressed: the authored-path diff check identified the new report's Markdown hard-break spaces; only those spaces were removed and the identical command passed | `bubbles.test` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved: the bounded invocation did not execute the multi-minute BUG-002 matrix or either full-inventory repetition | `bubbles.test` |

**Test verdict:** `NOT_TESTED` for BUG-002. Parser validation is green, but both
transition requests remain pending until the unchanged BUG-002 replay and two
exact full-inventory repetitions execute under a fresh `bubbles.test`
invocation. BUG-002 and SCOPE-01 remain `in_progress`; no Feature 004
completion, BUG-002 test-phase completion, regression, validation, audit,
certification, terminal bug, or parent replay claim is made.

## Independent V3 Parser And BUG-002 Replay - 2026-07-18T04:23:35Z

**Phase:** test

**Agent:** `bubbles.test`

**Execution model:** `direct-authorized-runner` under `bubbles.goal`

**Transition:** `TR-BUG-002-F004-V3-PARSER-01`

**Claim Source:** executed

This execution consumes the parser-only checkpoint above and supersedes only
its `NOT_TESTED` continuation. It changes no BUG-002 production or test byte,
no Feature 004 planning block or selftest byte, no Feature 005/010 byte, no
scope checkbox, and no certification field.

### Selected Test Matrix

| Test Type | Category | Exact Command | Total | Passed | Failed | Skipped |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Collision preservation | functional | `node --test tests/feature-004-dirty-tree-collision.test.mjs` | 3 | 3 | 0 | 0 |
| Atomic publication | functional | `node --test tests/brief-refresh-atomicity.test.mjs` | 14 | 14 | 0 | 0 |
| Pair contract | functional | `node scripts/validate-brief-payload.mjs` | 1 command | 1 | 0 | 0 |
| Repository canary | integration | `node scripts/selftest.mjs` | 491 | 491 | 0 | 0 |
| Protected browser title | e2e-ui | exact TP-01-05 command | 1 | 1 | 0 | 0 |
| Complete BUG-002 browser file | e2e-ui | exact TP-01-06 command | 1 | 1 | 0 | 0 |
| Complete browser inventory repetition 1 | e2e-ui | exact TP-01-10 command | 132 | 132 | 0 | 0 |
| Complete browser inventory repetition 2 | e2e-ui | exact TP-01-10 command | 132 | 132 | 0 | 0 |

The repository declares unit, UI-unit, E2E-API, stress, and load not applicable
for this shell/Git publication bug. No project `testImpact` or `traceContracts`
configuration exists, so the normal full matrix applies and trace/SLO capture is
a clean no-op.

### Functional, Pair, And Repository Evidence

**Executed:** YES (current session)

**Commands:** `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`

**Exit Codes:** 0; 0; 0

**Output windows:** complete functional summary, pair-validator line, and the
Market Brief completion slice from the full selftest capture

```text
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (593.032ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (886.970416ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (936.064166ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (544.523167ms)
✔ forced final validation failure restores every owned baseline byte and index path (784.259ms)
ℹ tests 14
ℹ suites 0
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8354.117
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

**Result:** PASS. The complete 14-case transaction matrix, unchanged pair
contract, and all 491 repository assertions are green with no skipped or todo
test.

### Focused Browser Evidence

**Executed:** YES (current session)

**Commands:**

- `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
- `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0

**Output:**

```text
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (2.2s)
hint: Using 'master' as the name for the initial branch.
Switched to a new branch 'main'
To /var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T/research-lab-bug002-c2KDju/remote.git
 * [new branch]      main -> main
1 passed (3.6s)
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.8s)
hint: Using 'master' as the name for the initial branch.
Switched to a new branch 'main'
To /var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T/research-lab-bug002-6gK7LS/remote.git
 * [new branch]      main -> main
1 passed (2.4s)
```

**Result:** PASS. Both commands execute the real wrapper inside a temporary Git
repository and serve the real production page/renderer over ephemeral loopback
HTTP without request interception.

### Final-Parser Complete Browser Repetitions

**Executed:** YES (current session, twice sequentially after the final parser
after-image)

**Command for each repetition:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0; 0

**Output windows:** direct collision prelude, natural worker count, BUG-002
assertion, and final runner result

```text
✔ Feature 004 preserves every pre-existing dirty hunk (1208.630958ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (9760.282875ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (866.604833ms)
Running 132 tests using 6 workers
  ✓  1 …serves prior-session actions beside an advanced Tier-A snapshot (3.9s)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (513ms)
132 passed (31.4s)
✔ Feature 004 preserves every pre-existing dirty hunk (1483.588334ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (10393.06975ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (921.892125ms)
Running 132 tests using 6 workers
  ✓  1 …serves prior-session actions beside an advanced Tier-A snapshot (3.2s)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (355ms)
132 passed (30.6s)
```

**Result:** PASS. Both repetitions include the final v3 parser `3/3` prelude,
pass all browser assertions, and emit no worker force-kill or non-test error.

### Current Pair And Integrity Evidence

**Executed:** YES (current session)

**Commands:** six-file JSON plus complete JSONL parse/date probe; current
payload/snapshot/history HEAD-identity probe; source/test integrity audit

**Exit Codes:** 0; 0; 0

**Output:**

```text
BUG002_PARSE_INTEGRITY_BEGIN
market-brief.payload.json=PASS
market-brief.snapshot.json=PASS
market-brief.config.json=PASS
specs/_bugs/BUG-002-market-brief-session-date-drift/state.json=PASS
specs/_bugs/BUG-002-market-brief-session-date-drift/scenario-manifest.json=PASS
specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json=PASS
brief-history.jsonl=PASS
historyRows=49
payloadDate=2026-07-17
snapshotDate=2026-07-17
dateEquality=PASS
result=PASS
BUG002_CURRENT_PAIR_HEAD_IDENTITY_BEGIN
file=market-brief.payload.json
currentSha256=c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206
headSha256=c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206
headIdentical=PASS
file=market-brief.snapshot.json
currentSha256=e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b
headSha256=e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b
headIdentical=PASS
file=brief-history.jsonl
currentSha256=05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b
headSha256=05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b
headIdentical=PASS
payloadSessionDate=2026-07-17
snapshotSessionDate=2026-07-17
historyLastSessionDate=2026-07-17
pairCoherent=PASS
pairStaged=NONE
result=PASS
BUG002_CURRENT_TEST_INTEGRITY_BEGIN
zeroSkipOnlyTodoPending=PASS
zeroRequestInterception=PASS
zeroFixtureReplacement=PASS
zeroInternalMock=PASS
zeroRequiredSilentBailout=PASS
functionalCasesFourteen=PASS
browserCasesOne=PASS
collisionCasesThree=PASS
zeroWorkerNarrowing=PASS
zeroInventoryNarrowing=PASS
systemChromeExact=PASS
result=PASS
```

**Result:** PASS. The current 49-row history and both visible pair owners agree
on July 17, all three pair files equal `HEAD`, no pair path is staged, and the
required tests contain no skip, interception, replacement, mock, bailout,
worker narrowing, or inventory narrowing path.

### Governance And Diagnostics Evidence

**Executed:** YES (current session)

**Commands:** Bash parse; ShellCheck; bugfix regression-quality; environment
pollution; Node source lock; macOS portability; artifact lint, freshness, and
traceability; implementation reality; G094; framework-write guard; IDE
diagnostics

**Exit Codes:** all blocking commands 0; diagnostics clean

**Output:**

```text
bashParse=PASS
shellcheck=PASS
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Files scanned:  7
Violations:     0
Warnings:       1
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
```

The implementation-reality warning is the existing design-discovery fallback:
the scan resolved seven files from `design.md`, then reported zero violations.
Project config declares neither `testImpact` nor `traceContracts`.
The VS Code diagnostics tool separately returned no errors for the collision
test, both reports, and both state files.

### Reliability Observation

One extra post-matrix direct canary stalled after its first test on a sleeping
`git hash-object --stdin` child. The process tree was terminated without any
file mutation. The identical command then passed `3/3`, and both subsequent
final-parser full inventories also passed their `3/3` preludes. The required
matrix therefore has three consecutive current-byte green canaries after the
non-test subprocess stall.

### Concurrent Foreign-State Movement

**Claim Source:** executed and interpreted

**Interpretation:** The non-owned dirty-tree aggregate changed during final
evidence recording because the active Feature 005 audit owner updated its own
report and state. All non-owned source and test mtimes predate the initial
aggregate capture, and this invocation did not edit or restore any Feature 005
byte. The foreign state parses and remains nonterminal. Because that audit is
active, this section records observations rather than claiming a stable foreign
aggregate.

```text
NON_OWNED_DIRTY_BASELINE_BEGIN
recordCount=50
aggregateSha256=0d982dbd20247c785253a2ffbcebdef0bdb070281fe464a4659997e812694188
feature005Records=35
feature010Records=3
stagedCount=0
result=PASS
NON_OWNED_DIRTY_BASELINE_END
NON_OWNED_DIRTY_FINAL_BEGIN
recordCount=50
aggregateSha256=9591fc3d1afb88e86ae9d2a90d03c0da0e4bae1cc5e03819edf3f104457d01c1
expectedSha256=0d982dbd20247c785253a2ffbcebdef0bdb070281fe464a4659997e812694188
feature005Records=35
feature010Records=3
stagedCount=0
byteIdentical=FAIL
NON_OWNED_DIRTY_FINAL_END
2026-07-18T04:30:25.681Z  M bytes=118529 specs/005-palm-springs-rental-market-lab/state.json
2026-07-18T04:09:04.800Z  M bytes=470747 specs/005-palm-springs-rental-market-lab/report.md
2026-07-18T04:02:54.798Z  M bytes=239401 specs/005-palm-springs-rental-market-lab/scopes.md
2026-07-18T03:52:47.238Z  M bytes=31306 tests/palm-springs-rental-market-lab.spec.mjs
FEATURE005_CONCURRENT_STATE_BEGIN
jsonParse=PASS
sha256=9c9531a588b65eaf81ee552f1e2f5cc839bb2646a0f3f23129cab889793310b7
status=in_progress
activeAgent=bubbles.audit
currentPhase=audit
certificationStatus=in_progress
result=PASS
FEATURE005_CONCURRENT_STATE_END
```

A later recheck observed the same foreign audit owner continue writing its own
evidence surfaces:

```text
NON_OWNED_DIRTY_STABILITY_BEGIN
recordCount=50
aggregateSha256=0c07067187fdf897debd8ebe5cc5724112be1c6f10dda14d6add8ed161b5d0e6
expectedSha256=9591fc3d1afb88e86ae9d2a90d03c0da0e4bae1cc5e03819edf3f104457d01c1
stagedCount=0
stableAfterConcurrentAuditWrite=FAIL
NON_OWNED_DIRTY_STABILITY_END
FEATURE005_ACTIVE_AUDIT_FILES_BEGIN
path=specs/005-palm-springs-rental-market-lab/report.md
sha256=03da65e91424c2a56b6b85a298071ee0c8c373ca1df33e108b0a6473c92d397a
mtime=2026-07-18T04:33:44.293Z
path=specs/005-palm-springs-rental-market-lab/state.json
sha256=3fc89cf0e940fdc323a9ae26fe769ba9616da4d8d31c177228d4ca81b38df035
mtime=2026-07-18T04:35:36.165Z
stateJsonParse=PASS
activeAgent=bubbles.audit
currentPhase=audit
status=in_progress
certificationStatus=in_progress
result=PASS
FEATURE005_ACTIVE_AUDIT_FILES_END
```

### Shared-Seam Finding Accounting And Route

| Finding | Current disposition | Next owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed on current bytes by pair validation and selftest `491/0`. | none for this finding |
| `BUG002-WRAPPER-ATOMICITY` | Addressed by the unchanged `14/14` transaction matrix. | none for this finding |
| `BUG002-REGRESSION-GAP` | Addressed by the exact title, complete browser file, and both complete inventories. | none for this finding |
| `BUG002-DIRTY-BOUNDARY` | Addressed by temporary fixture isolation, HEAD-identical pair proof, zero staging, and explicit preservation of the concurrent Feature 005 audit write. | none for this finding |
| `F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001` | Addressed by strict v2/v3 parsing and repeated current-byte `3/3` execution. | none for this finding |
| `BUG002-F004-SELFTEST-CHECKPOINT-DRIFT` | Addressed by the planning v3 correction plus final parser identity equality. | none for this finding |
| `BUG002-BROAD-E2E-INSTABILITY` | Addressed by two sequential final-parser `132/132` runs with clean worker shutdown. | none for this finding |
| `BUG002-INDEPENDENT-VERIFICATION` | Addressed by this independent replay. | none for this finding |
| `BUG002-REGRESSION-PHASE` | Not executed by this test owner; it is the next registered bugfix-fastlane phase. | `bubbles.regression` |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed. | `bubbles.audit` after validation |

**Test verdict:** `TESTED` for the selected BUG-002 matrix. BUG-002 and SCOPE-01
remain `in_progress`; no terminal bug, scope completion, validation, audit,
certification, or parent Feature 006 replay is claimed. The registry-resolved
next owner is `bubbles.regression`.

## Registered Regression Profile - 2026-07-18T04:51:31Z

**Phase:** regression

**Agent:** `bubbles.regression`

**Execution model:** `direct-authorized-runner` under `bubbles.goal`

**Transition:** `TR-BUG-002-REGRESSION-01`

**Claim Source:** executed

This phase consumed the final test-owned v3 parser handoff without changing any
product, test, parser, planning, foreign-spec, certification, or scope-status
byte. The repo has no registered coverage-percentage command; coverage delta is
therefore measured through exact protected test cardinality, full selftest and
browser inventory counts, scenario traceability, assertion integrity, and the
accepted source/test/parser hashes. No percentage is inferred.

### Test Baseline Comparison

| Category | Accepted test handoff | Regression execution | Delta | Status |
| --- | ---: | ---: | ---: | --- |
| Feature 004 collision canary | 3/3 | 3/3 | 0 | clean |
| BUG-002 functional transaction matrix | 14/14 | 14/14 | 0 | clean |
| Current pair validator | PASS | PASS | 0 | clean |
| Repository selftest | 491/491 | 491/491 | 0 | clean |
| Exact BUG-002 browser title | 1/1 | 1/1 | 0 | clean |
| Complete BUG-002 browser file | 1/1 | 1/1 | 0 | clean |
| Complete system-Chrome inventory | 132/132 | 132/132 | 0 | clean |
| Gherkin traceability | 1/1 | 1/1 | 0 | clean |

**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Structured evidence:** `.specify/runtime/tool-calls.jsonl::line=1085;sessionId=bug002-regression-20260717;agent=bubbles.regression;exitCode=0;stdoutHash=b90b8c620839b74a4b8fb6a196be94658d8d8b42f36665ca871605bfbaff657b`

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS. The protected scenario, same-target compatibility, paired
advancement, retry isolation, owned-dirt refusal, isolated scheduler path,
invalid-baseline handling, rollback, and unrelated-dirt preservation all remain
failure-sensitive and green.

### Browser And Cross-Spec Regression

**Commands:** exact TP-01-05 title, complete TP-01-06 file, exact TP-01-10
inventory, BUG-003 held-hydration title, protected BS-011 title, Feature 010
SCN-010-030 title, and `node scripts/validate-trend-dynamics-cycle.mjs`

**Exit Codes:** 0 for every command

**Claim Source:** executed

**Structured evidence:** tool-log lines `1086` through `1095`; the complete
inventory is line `1091` with stdout SHA-256
`b0d4420048777cdda380706fb980bc45bafb75e4d6ab08c1e1716c15a4e0a933`.

```text
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
Running 132 tests using 6 workers
✓ Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
✓ Regression: SCN-010-030 Feature 002 preserves owner clocks limitations and non recomputation boundary
✓ Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison
✓ BS-011 Simple and Power share one model digest
✓ Registered Bond Regime tool publishes one owner read without restricted payload
132 passed (54.7s)
Focused BUG-002 title: 1 passed
Complete BUG-002 file: 1 passed
Focused BUG-003 held-hydration title: 1 passed
Focused BS-011 title: 1 passed
Focused Feature 010 SCN-010-030 title: 1 passed
[tdc-validator] scope3-consumer-sweep=PASS page-functions=8 selftest-marker=Feature-006 browser-titles=6 fixture-routes=2
[tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged
[tdc-validator] OK
```

**Result:** PASS. The complete inventory emitted the strict Feature 004 `3/3`
prelude, ran all 132 browser tests with the registered six workers, and emitted
no worker force-kill or error outside tests. Focused evidence independently
confirms BUG-003 lifecycle/digest separation, Feature 010 owner-read clocks and
non-recomputation, and Feature 006 contract/consumer coherence.

### Pair, JSONL, And Repository Coherence

**Commands:** `node scripts/validate-brief-payload.mjs`; `node
scripts/selftest.mjs`; read-only six-JSON, complete-JSONL, date, HEAD-identity,
and staging probe

**Exit Codes:** 0; 0; 0

**Claim Source:** executed

**Structured evidence:** tool-log lines `1089`, `1090`, and `1108`.

```text
json=market-brief.payload.json result=PASS
json=market-brief.snapshot.json result=PASS
json=market-brief.config.json result=PASS
json=specs/_bugs/BUG-002-market-brief-session-date-drift/state.json result=PASS
json=specs/_bugs/BUG-002-market-brief-session-date-drift/scenario-manifest.json result=PASS
json=specs/_bugs/BUG-002-market-brief-session-date-drift/test-plan.json result=PASS
historyRows=49
historyParse=PASS
payloadSessionDate=2026-07-17
snapshotSessionDate=2026-07-17
historyLastSessionDate=2026-07-17
dateEquality=PASS
historyTailCoherent=PASS
headIdentity=market-brief.payload.json result=PASS sha256=c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206
headIdentity=market-brief.snapshot.json result=PASS sha256=e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b
headIdentity=brief-history.jsonl result=PASS sha256=05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b
stagedPairPaths=0
result=PASS
Research-Lab self-test: 491 passed, 0 failed
```

**Result:** PASS. The current published transaction is coherent, fully
parseable, byte-identical to HEAD, and unstaged. The complete selftest retains
the Market Brief, Feature 006, and Feature 010 groups with zero failures.

### Integrity, Coverage Delta, And Governance

**Commands:** regression-quality `--bugfix` over all three BUG-002 tests;
source-lock; environment-pollution; macOS portability; Bash parse; artifact
lint/freshness/traceability; G095; implementation reality; G094; framework-write
guard; final accepted-hash/cardinality/assertion/staging probe

**Exit Codes:** 0 for every final command

**Claim Source:** executed

**Structured evidence:** tool-log lines `1096` through `1107` and final
integrity line `1111`. Lines `1109` and `1110` are preserved failed diagnostic
probes whose regexes respectively counted `.test(...)` helper calls and missed
indented guarded declarations; line `1111` uses declaration-aware matching and
passes the identical intended contract.

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
G095: discovered-issue disposition clean (no unfiled deferrals)
Files scanned: 7
Violations: 0
Warnings: 1
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
functionalCases=14
browserCases=1
collisionCases=3
skipOnlyTodoMarkers=0
browserInterceptionMarkers=0
browserBailoutMarkers=0
protectedAssertions=PASS
workerTopology=registered-config-natural result=PASS
inventoryNarrowing=NONE
stagedPaths=0
coverageDelta=functional:14->14,browser:1->1,collision:3->3,selftest:491->491,inventory:132->132
result=PASS
```

The one implementation-reality warning is the pre-existing design-file fallback
used to discover seven implementation paths; the scan reports zero violations.
The repo declares no `testImpact` or `traceContracts`, and no deployment surface
changed, so impact reduction, trace/SLO capture, and the deployment-regression
scan are not applicable to this phase.

### TDD Provenance

**Commands:** current structured-log read of original rows `842` and `845`;
current wrapper Git history; `BUG002_WRAPPER_SOURCE=HEAD node --test
tests/brief-refresh-atomicity.test.mjs`

**Exit Codes:** 0; 0; 0

**Claim Source:** interpreted

**Interpretation:** The original functional and browser RED rows remain durable
and predate the fix. The current `HEAD` now contains atomicity repair commit
`b11d9f0e41aeb74dc2825a99b7a2d086003dbab6`, so the historical convenience alias
`BUG002_WRAPPER_SOURCE=HEAD` no longer selects pre-fix bytes and correctly passes
14/14. It is post-fix evidence in this session, not a fabricated fresh RED.

```text
line=842
timestamp=2026-07-15T23:35:29Z
command=node --test tests/brief-refresh-atomicity.test.mjs
exitCode=1
stdoutBytes=2315
stdoutHash=6d1f75dd17a4331ea330355288c870a815829f02dcd4df1a18348692cf666439
line=845
timestamp=2026-07-15T23:37:12Z
exitCode=1
stdoutBytes=1929
stdoutHash=a25e60a2e698d468a4c04240d0907f47b71e1352dcc5e856471c7d2375a465c5
rowsExist=PASS
bothOriginalExitOne=PASS
b11d9f0e41aeb74dc2825a99b7a2d086003dbab6 2026-07-16T09:35:08-07:00 fix market brief scheduled publication
currentHead=a93076912aa1df17ca1e41ea929d37f1b8f40d51
currentHeadReplay=14 passed, 0 failed
```

**Result:** PASS. The scenario-first RED ordering remains auditable, the same
protected regression remains present at the accepted hash, and current fixed
bytes pass the broader profile.

### Design Coherence And Concurrent Owner Boundary

| Dependency | Contract reviewed | Executed discriminator | Verdict |
| --- | --- | --- | --- |
| Feature 004 | `design.md` requires preserved shared selftest assertions, fail-closed contracts, and no broad collision exemption | strict v3 canary `3/3`, full-inventory prelude `3/3` | coherent |
| BUG-003 | lifecycle proof belongs to held hydration while BS-011 owns settled Simple/Power parity | adversarial `1/1`, BS-011 `1/1`, broad rows green | coherent |
| Feature 006 | one immutable result publishes one owner read; Market Brief consumes the sentence without recomputation | production validator `OK`, pair validator PASS, selftest `491/0`, complete browser scenarios green | coherent |
| Feature 010 | Feature 002 consumes one committed owner read while preserving four clocks, limitations, and non-recomputation | SCN-010-030 `1/1`, selftest foundation green, complete inventory row green | coherent |

Feature 005 report/state hashes moved from the accepted test-handoff observation
while this regression profile ran. The final read-only classification was:

```text
FEATURE005_CONCURRENT_OWNER_CLASSIFICATION_BEGIN
reportSha256=cc3199229fb96367b16bf8d155d1241b19fc7720dfd4edf97987e5f765c214d9
stateSha256=7353baf4982536428404a24b3a6ba0aa2b06ed9fbb7b5d710b1d48148c7deed0
reportMovedSinceAccepted=true
stateMovedSinceAccepted=true
status=in_progress
activeAgent=bubbles.plan
currentPhase=bootstrap
currentScope=02-four-unit-online-research-and-production-payloads
certificationStatus=in_progress
stagedFeature005Paths=NONE
classification=FOREIGN_OWNER_MOVEMENT_NOT_BUG002_REGRESSION_DRIFT
FEATURE005_CONCURRENT_OWNER_CLASSIFICATION_END
```

No Feature 005 byte was edited, restored, normalized, staged, or used to narrow
the BUG-002 inventory. Its current owner movement is recorded separately from
the stable BUG-002 product/test/parser hash fence.

### Regression Finding Accounting And Verdict

| Finding | Disposition | Remaining owner |
| --- | --- | --- |
| `BUG002-REGRESSION-PHASE` | Addressed by the registered current-byte profile: protected functional/browser checks, complete inventory, cross-spec discriminators, governance, coherence, and stable coverage counts all pass | none |
| `BUG002-REGRESSION-CARDINALITY-PROBE-001` | Addressed in-session: two diagnostic regexes miscounted source formatting; the declaration-aware third probe passed exact `14/1/3` cardinality without changing a test | none |
| `BUG002-TDD-HEAD-BASELINE-ADVANCED-001` | Addressed as provenance classification: original RED rows remain exact; current HEAD contains the fix and its 14/14 result is post-fix evidence | none |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed by regression ownership | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Not executed by regression ownership | `bubbles.audit` after validation |

🟢 REGRESSION_FREE

All registered regression checks passed on the accepted current bytes.

```text
Test baseline: functional 14->14; selftest 491->491; browser 132->132
Cross-spec conflicts: 0
Design contradictions: 0
Coverage surface: stable by exact test counts, hashes, and 1/1 scenario traceability
Gherkin traceability: 100% (1/1)
Protected hash drift: 0
Staged paths: 0
```

BUG-002 and SCOPE-01 remain `in_progress`; certification is unchanged. The
regression transition is clean for validate-owned review.

## Fresh Independent Reliability Supersession - 2026-07-18T04:40:37Z

**Phase:** test

**Agent:** `bubbles.test`

**Execution model:** `direct-authorized-runner` under `bubbles.goal`

**Transition:** reopened `TR-BUG-002-F004-V3-PARSER-01`

**Claim Source:** executed

This later independent replay preserves the concurrent `04:23:35Z` section as
historical evidence but supersedes its reliability verdict. The parser and all
focused BUG-002 behavior remain green. The second required exact TP-01-10 run
passed every browser assertion, then failed worker shutdown twice and exited
`1`. The test phase therefore cannot remain complete and regression cannot run.

No product, test, planning, Feature 004, Feature 010, BUG-003, certification,
or current-pair byte was changed. This phase appends only this evidence and
updates BUG-002 execution/routing state.

### Exact Current Test Plan Matrix

| Test Plan row | Exact command | Exit | Total | Passed | Failed | Skipped / todo | Current result |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| TP-01-02 | `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 14 | 14 | 0 | 0 / 0 | adversarial rollover green |
| TP-01-03 | `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 14 | 14 | 0 | 0 / 0 | complete transaction matrix green |
| TP-01-04 | `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 14 | 14 | 0 | 0 / 0 | dirty-boundary matrix green |
| TP-01-05 | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list` | 0 | 1 | 1 | 0 | 0 / 0 | exact title green |
| TP-01-06 | `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 1 | 1 | 0 | 0 / 0 | complete file green |
| TP-01-07 | `node scripts/validate-brief-payload.mjs` | 0 | 1 command | 1 | 0 | N/A | pair contract pass |
| TP-01-08 | `node scripts/selftest.mjs` | 0 | 491 | 491 | 0 | 0 / 0 | complete repository selftest green |
| TP-01-09 | `bash -n scripts/brief-refresh-and-push.sh` | 0 | 1 command | 1 | 0 | N/A | silent Bash parse pass |
| TP-01-10 repetition 1 | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | parser 3 + browser 132 | 3 + 132 | 0 | 0 / 0 | clean |
| TP-01-10 repetition 2 | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list` | 1 | parser 3 + browser 132 | 3 + 132 | 0 test failures | 0 / 0 | two force-killed worker-0 errors outside tests |

The checkout-local runner identity command
`npx --no-install playwright --version` exited `0` with exactly
`Version 1.61.1`.

### Parser Prerequisite And Functional Matrix

**Executed:** YES (current session)

**Commands:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`;
`node --test tests/brief-refresh-atomicity.test.mjs`

**Exit Codes:** 0; 0

**Claim Source:** executed

**Output windows:** final direct-canary summary and complete functional result
from the full unfiltered terminal captures

```text
✔ Feature 004 preserves every pre-existing dirty hunk (1036.324292ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (7621.415291ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (819.17775ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 9564.680334
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails (548.217875ms)
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness (565.532042ms)
✔ matching generated Tier B advances snapshot payload and history together (878.414208ms)
✔ failed narrative attempt restores config before a successful retry (848.976791ms)
✔ dirty owned publication path refuses before every external boundary (196.715292ms)
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty (635.042125ms)
✔ staged owned publication path refuses without changing its index entry (246.648917ms)
✔ untracked owned data path refuses before every external boundary (209.722542ms)
✔ invalid clean baseline refuses before every external boundary (309.122917ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (612.304583ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (876.105292ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (1167.441625ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (532.128125ms)
✔ forced final validation failure restores every owned baseline byte and index path (751.676417ms)
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS. The v3 parser is still validated at `3/3`, and TP-01-02
through TP-01-04 pass all `14` real temporary-Git transaction cases.

### Focused Browser, Pair, Selftest, And Parse

**Executed:** YES (current session)

**Commands:** exact TP-01-05; exact TP-01-06; `node
scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`; `bash -n
scripts/brief-refresh-and-push.sh`

**Exit Codes:** 0; 0; 0; 0; 0

**Claim Source:** executed

```text
Version 1.61.1
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.9s)
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (2.9s)
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.7s)
Switched to a new branch 'main'
 * [new branch]      main -> main
  1 passed (2.2s)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
market brief — registry-wide coverage + action-only payload contract
  ✓ current payload satisfies the executable brief contract
  ✓ contract rejects omission of a registered tool
  ✓ contract rejects a generic real-assets read without GLD/BTC/SLV detail
  ✓ contract rejects watch-only or incomplete next-session output
  ✓ contract rejects a missing visible brief section
  ✓ contract rejects an incomplete structural backdrop
  ✓ contract rejects a missing generation timestamp
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

The Bash parse emitted no stdout and returned exit `0`. TP-01-05 through
TP-01-09 are green on the exact protected bytes.

### Required Full-Inventory Repetitions

**Executed:** YES (current session, twice sequentially)

**Command for each run:** `npx --no-install playwright test
--config=playwright.config.mjs --project=system-chrome --reporter=list`

**Claim Source:** executed

**Repetition 1 exit code:** 0

```text
✔ Feature 004 preserves every pre-existing dirty hunk (1450.797959ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (9623.791ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (983.678166ms)
Running 132 tests using 6 workers
  ✓    2 …serves prior-session actions beside an advanced Tier-A snapshot (3.5s)
  ✓   12 …laim reaches its exact source transformation and consumer chain (1.4s)
  ✓   25 …uarterly YTD and instant history preserve exact period meaning (606ms)
  ✓  122 …012 lever change recomputes without fetch or observed mutation (206ms)
  ✓  124 …serves owner clocks limitations and non recomputation boundary (272ms)
  ✓  126 … evidence produces one unchanged brief without narrative churn (262ms)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (346ms)
  132 passed (58.1s)
```

**Repetition 2 exit code:** 1

```text
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
Running 132 tests using 6 workers
  ✓    1 …serves prior-session actions beside an advanced Tier-A snapshot (3.8s)
  ✓   12 …laim reaches its exact source transformation and consumer chain (1.5s)
  ✓   26 …uarterly YTD and instant history preserve exact period meaning (664ms)
  ✓  115 …012 lever change recomputes without fetch or observed mutation (327ms)
  ✓  127 …serves owner clocks limitations and non recomputation boundary (269ms)
  ✓  128 … evidence produces one unchanged brief without narrative churn (271ms)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (386ms)
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
  132 passed (5.5m)
  2 errors were not a part of any test, see above for details
BUG002_TP0110_REPETITION2_EXIT=1
```

**Result:** FAIL. All `132` browser assertions and all three parser assertions
passed in both repetitions, but repetition 2 violated the explicit no-force-kill
and no-non-test-error contract and exited `1`. Earlier clean repetitions do not
erase this later reliability failure.

The focused BUG-002 file exited promptly twice. Fifteen browser files own HTTP
lifecycle hooks with the same close pattern, so this run does not identify one
lawful test file to edit. No speculative test repair was made.

### Governance, Authenticity, And Containment

**Executed:** YES (current session)

**Claim Source:** executed

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Files scanned:  7
Violations:     0
Warnings:       1
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
G095: discovered-issue disposition clean (no unfiled deferrals)
BUG002_G003_CLASSIFICATION_SCAN_BEGIN
skipOnlyTodo=PASS
liveInterception=PASS
requiredBailout=PASS
internalMock=PASS
functionalClassification=PASS
e2eUiClassification=PASS
adversarialRegression=PASS
productionBytes=PASS
collisionClosedSchema=PASS
filesScanned=4
integrityFailures=0
BUG002_G003_CLASSIFICATION_SCAN_END
BUG002_G051_BEGIN
matches=0
matches=0
envDependencyHitFiles=0
systemChromeEnvironmentResult=FAIL_NON_ENV_LIFECYCLE
G051_RESULT=PASS
BUG002_G051_END
Test Impact Plan
Configured: false
No testImpact map configured; run the repo's normal required validation set.
```

The first custom G003 probe had three false failures because it scanned parser
policy strings and used same-line regexes for multi-line fixtures. The corrected
probe above passed without changing a file. ShellCheck, scoped `git diff
--check`, and VS Code diagnostics were also clean. The implementation-reality
warning is the existing design-discovery fallback with zero violations.

Current pair and protected identity evidence:

```text
historyRows=49
payloadDate=2026-07-17
snapshotDate=2026-07-17
historyLastSessionDate=2026-07-17
pairCoherent=PASS
file=market-brief.payload.json
currentSha256=c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206
headIdentical=PASS
file=market-brief.snapshot.json
currentSha256=e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b
headIdentical=PASS
file=brief-history.jsonl
currentSha256=05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b
headIdentical=PASS
pairStaged=NONE
collisionSha256=83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d
collisionGitOid=1e57f53aafd1117e7e4ef63d8ce4b466cf39f4d5
selftestSha256=519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b
selftestGitOid=660eb298ff2a417064e514da5db8f95c2e85b87d
wrapperSha256=642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181
wrapperGitOid=222f371774b0b272e9d16724e819be38917671a1
secExtractSha256=a7f7d585d5f6ce328c3e0ecb70a789478ca5cf5b8b1d7237bb99e635c71eef8b
secRawSha256=cde4e2480f478befe0c03745e2611669ff1b73665d15fbe46f4a765e8f764bce
stagedPaths=NONE
fixtureResidueCount=0
identityFailures=0
```

The initial artifact reads predated a concurrent `04:23:35Z` test append. A
subsequent fence detected and preserved that append plus its later Feature 005
audit disclosure. Source, test, scope, wrapper, selftest, SEC, pair, and staging
identities did not move. Authored paths for this supersession are only
`report.md` and test-owned execution/routing fields in `state.json`.

### Fresh Finding Accounting And Route

| Finding | Current disposition | Next owner |
| --- | --- | --- |
| `F006-EXT-SELFTEST-MARKET-BRIEF-001` | Addressed: pair validator pass and selftest `491/0`. | none for this finding |
| `BUG002-WRAPPER-ATOMICITY` | Addressed: unchanged functional matrix `14/14`. | none for this finding |
| `BUG002-REGRESSION-GAP` | Addressed at the behavior boundary: exact title and complete focused browser file each `1/1`. | none for this finding |
| `BUG002-DIRTY-BOUNDARY` | Addressed: exact hashes, HEAD-identical pair, zero staging, zero fixture residue, and concurrent evidence preservation. | none for this finding |
| `F004-COLLISION-SELFTEST-SUCCESSOR-V3-PARSER-001` | Addressed for parser behavior: direct and both inventory preludes passed `3/3`. | none for parser behavior |
| `BUG002-BROAD-E2E-INSTABILITY` | Reopened: repetition 2 exited `1` after two worker-0 force-kills and two non-test errors. | `bubbles.implement` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because TP-01-10 is not repeatedly clean. | `bubbles.implement`, then `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Blocked; regression did not run and is not claimed. | `bubbles.regression` only after clean independent replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed. | `bubbles.audit` after validation |

**Test verdict:** `NOT_TESTED`. BUG-002 and SCOPE-01 remain `in_progress`.
Parser validation remains green, but the combined parser/replay transition is
reopened with `replayExecuted=false`. Regression, validation, audit,
certification, terminal bug status, and parent Feature 006 replay are not
claimed. The next required owner is `bubbles.implement` for
`TR-BUG-002-IMPLEMENT-REWORK-02`.

## Regression Concurrent-State Reconciliation - 2026-07-18T04:54:21Z

**Phase:** regression

**Agent:** `bubbles.regression`

**Claim Source:** executed and interpreted

**Interpretation:** The registered regression commands were executed from the
accepted `04:23:35Z` handoff, and this phase's one exact full inventory passed
parser `3/3` plus browser `132/132`. A concurrent test-owner write became
visible only after the regression evidence append. Its evidence timestamp
`04:40:37Z` predates the regression session's first structured row at
`04:42:05Z`: the second test-owned sequential inventory passed all assertions,
then force-killed worker-0 twice and exited `1`. That current machine-state fact
invalidates the clean-test entry precondition. One later clean regression sample
cannot erase an earlier mandatory reliability failure.

This reconciliation supersedes only the `REGRESSION_FREE` verdict and validate
route in the `Registered Regression Profile - 2026-07-18T04:51:31Z` section.
All commands, hashes, focused passes, cross-spec checks, governance results, and
pair-coherence evidence in that section remain valid observations.

```text
CONCURRENT_REGRESSION_ENTRY_RECONCILIATION_BEGIN
testSupersessionAt=2026-07-18T04:40:37Z
regressionFirstToolLogAt=2026-07-18T04:42:05Z
testRepetitionOne=exit 0; parser 3/3; browser 132/132; zero non-test errors
testRepetitionTwo=exit 1; parser 3/3; browser 132/132; worker-0 force-killed twice; two non-test errors
regressionInventory=exit 0; parser 3/3; browser 132/132; zero non-test errors
currentStateStatus=in_progress
currentCertificationStatus=in_progress
currentPendingTransition=TR-BUG-002-IMPLEMENT-REWORK-02
currentNextOwner=bubbles.implement
regressionTransitionBlockedBy=TR-BUG-002-IMPLEMENT-REWORK-02
regressionCompletedPhaseClaimAdded=false
regressionTransitionResolved=false
certificationMutation=false
stateMutationByRegression=false
result=ROUTE_REQUIRED
CONCURRENT_REGRESSION_ENTRY_RECONCILIATION_END
```

### Superseding Finding Accounting

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved and preserved: a required test-owned repetition exited `1` after two worker-0 force-kills and two non-test errors | `bubbles.implement` via `TR-BUG-002-IMPLEMENT-REWORK-02` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because TP-01-10 is not repeatedly clean | `bubbles.implement`, then `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Unresolved: commands ran, but the current blocked transition cannot receive a completion claim | `bubbles.regression` after clean independent replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not eligible while test and regression are incomplete | `bubbles.validate` after the earlier phases are clean |
| `BUG002-AUDIT-CERTIFICATION` | Not eligible before validation | `bubbles.audit` after validation |
| `BUG002-REGRESSION-CARDINALITY-PROBE-001` | Addressed: two source-format regex false positives were replaced by the declaration-aware probe at tool-log line `1111`, which passed without a test edit | none |
| `BUG002-TDD-HEAD-BASELINE-ADVANCED-001` | Addressed as provenance classification: original RED rows `842`/`845` remain exact; current HEAD includes the fix and is post-fix evidence | none |
| `BUG002-REGRESSION-ENTRY-STATE-RACE-001` | Addressed by re-reading current state, preserving the test-owner write, retracting the stale verdict, and refusing any state or certification mutation | none |

⚠️ REGRESSION_DETECTED

One blocking reliability regression remains in the required complete browser
profile. Focused BUG-002 behavior, parser semantics, pair coherence, source
locking, environment isolation, portability, traceability, artifact integrity,
cross-spec contracts, and coverage counts remain green, but they cannot replace
the failed repeated full-inventory exit.

```text
Regressions detected: 1
Category: worker lifecycle / complete system-Chrome inventory
Cross-spec conflicts: 0
Design contradictions: 0
Coverage drop: 0 by registered executable counts
Fix cycle needed: YES
Required route: TR-BUG-002-IMPLEMENT-REWORK-02 -> bubbles.implement
```

BUG-002 and SCOPE-01 remain `in_progress`. The current state already carries the
complete implement-rework route, so `bubbles.regression` makes no state edit and
does not resolve `TR-BUG-002-REGRESSION-01`.

## Implementation Rework 02 Discovery Gate Failure - 2026-07-18T16:47:55Z

**Phase:** implement

**Agent:** `bubbles.implement`

**Claim Source:** executed and interpreted

The implementation slice changed only `playwright.config.mjs` and
`tests/playwright-runtime.foundation.functional.mjs`: it added the
planning-authorized top-level `**/*.spec.mjs` matcher plus exact matcher,
12-file browser inventory, and two-file Node-suite exclusion assertions. No
global setup, browser test, Node `.test.mjs` file, worker/retry setting,
package/source-lock surface, browser fallback, or protected dirty file was
edited by this invocation.

The mandatory first validation failed before any later gate ran. The matcher
and new inventory assertions were reached, but the pre-existing fail-closed
shared-seam assertion found 11 importers for 12 browser specs. The sole missing
importer is the committed `tests/market-brief-session-date-drift.spec.mjs`,
whose first line imports `playwright/test` directly. That browser file is
explicitly excluded by the planning amendment, so the assertion was not
weakened and the ownership boundary was not crossed.

### Mandatory First Validation

**Executed:** YES (in current session)

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`

**Exit Code:** 1

**Output:**

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=11
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] importer=tests/bond-regime-lab.spec.mjs
[playwright-runtime] importer=tests/causal-rotation-lab.spec.mjs
[playwright-runtime] importer=tests/company-fundamentals-lab.spec.mjs
[playwright-runtime] importer=tests/fx-regime-relative-value-lab.spec.mjs
[playwright-runtime] importer=tests/msft-july-market-refresh.spec.mjs
[playwright-runtime] importer=tests/palm-springs-rental-market-lab.spec.mjs
[playwright-runtime] importer=tests/portfolio-survival-foundation.spec.mjs
[playwright-runtime] importer=tests/provider-credentials.spec.mjs
[playwright-runtime] importer=tests/technical-analysis-decision-lab.spec.mjs
[playwright-runtime] importer=tests/trend-dynamics-cycle-lab.spec.mjs
[playwright-runtime] importer=tests/volatility-sizing-lab.spec.mjs
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✖ every Playwright spec uses the shared seam and sole committed browser config
ℹ tests 4
ℹ suites 0
ℹ pass 3
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
✖ failing tests:
test at tests/playwright-runtime.foundation.functional.mjs:119:1
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal
- tests/market-brief-session-date-drift.spec.mjs
```

**Result:** FAIL

### Gate Disposition And Finding Accounting

Gate 1 failed, so gates 2 through 7 were not executed. This section makes no
BUG completion, scope completion, test completion, regression, validation,
audit, certification, or independent-verification claim.

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Unresolved: the matcher edit exists, but its mandatory first validation is not green. | `bubbles.plan`, then `bubbles.implement` |
| `BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE` | New and unresolved: TP-01-12 requires every browser spec to use the shared seam while the sole violating browser spec is excluded from this slice. | `bubbles.plan` via `TR-BUG-002-PLAN-PLAYWRIGHT-SHARED-SEAM-01` |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved: the two required complete inventory repetitions did not run after gate 1 failed. | `bubbles.implement`, then `bubbles.test` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved: no fresh independent replay is eligible. | `bubbles.test` only after implementation gates are green |

The protected dirty file `tests/brief-refresh-atomicity.support.mjs` remained
outside both `apply_patch` calls and outside every executed command's write
surface. Post-edit status still reports it as concurrently modified; it was not
edited, restored, staged, or normalized by this invocation. Active Feature
004/005/010 and all unrelated work remain preserved.

## Implementation Rework 02 Ordered Gate Corroboration - 2026-07-18T16:49:32Z

**Phase:** implement

**Agent:** `bubbles.implement`

**Claim Source:** executed and interpreted

This addendum preserves the concurrent `16:47:55Z` receipt above. During the
initial reads, both authorized files changed concurrently from their first-read
contents. The required path-scoped baseline then captured those two unstaged
hunks and no staged bytes. This invocation preserved the concurrent matcher and
all existing assertions, then added one fifth fail-closed test with the exact 12
browser filenames, exact two direct Node filenames, per-browser shared-seam
imports, and per-Node `node:test` ownership with no Playwright import.

### Two-File Baseline, After-Image, And Rollback Unit

**Executed:** YES (current session)

**Baseline Claim Source:** executed

```text
BUG002_REWORK02_TWO_FILE_BASELINE_BEGIN
STATUS_BEGIN
 M playwright.config.mjs
 M tests/playwright-runtime.foundation.functional.mjs
STATUS_END
STAGED_DIFF_BEGIN
STAGED_DIFF_END
SHA256_BEGIN
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
72a965b81c7ccc21ddca5ae1f7f6e249a82f76898269ac07bf121da00b8f7f76  tests/playwright-runtime.foundation.functional.mjs
SHA256_END
WORKTREE_GIT_OID_BEGIN
1519a2ccd630adaa466ecd412ac968f9ba243e70
88e957c07de85f024540e0eeb7a5d05d5c02fbed
WORKTREE_GIT_OID_END
INDEX_ENTRY_BEGIN
100644 a73ccde03c26e3a84dda0c1b693b873c3bb92595 0 playwright.config.mjs
100644 0bcc931a0485f9d60e3f20feba6a5c9824843ca0 0 tests/playwright-runtime.foundation.functional.mjs
INDEX_ENTRY_END
BUG002_REWORK02_TWO_FILE_BASELINE_END
```

**After-Image Claim Source:** executed

```text
BUG002_REWORK02_TWO_FILE_AFTER_BEGIN
CAPTURED_AT=2026-07-18T16:49:32Z
STATUS_BEGIN
 M playwright.config.mjs
 M tests/playwright-runtime.foundation.functional.mjs
STATUS_END
STAGED_DIFF_BEGIN
STAGED_DIFF_END
SHA256_BEGIN
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
f96a2a73b1ac2872ca06e49e0c71bc04230c1dbbd6e3d15627f82945e71b7296  tests/playwright-runtime.foundation.functional.mjs
SHA256_END
WORKTREE_GIT_OID_BEGIN
1519a2ccd630adaa466ecd412ac968f9ba243e70
a877fad80c655d527ce2c0ff40f706cca13706bb
WORKTREE_GIT_OID_END
INDEX_ENTRY_BEGIN
100644 a73ccde03c26e3a84dda0c1b693b873c3bb92595 0 playwright.config.mjs
100644 0bcc931a0485f9d60e3f20feba6a5c9824843ca0 0 tests/playwright-runtime.foundation.functional.mjs
INDEX_ENTRY_END
BUG002_REWORK02_TWO_FILE_AFTER_END
```

**Rollback Claim Source:** interpreted from the executed hashes and complete
path-scoped diff. The exact planned rollback unit is the top-level matcher hunk
in `playwright.config.mjs` together with all paired matcher/taxonomy assertions
in `tests/playwright-runtime.foundation.functional.mjs`. The index object IDs
did not move. Reversing only this invocation's appended fifth-test hunk would
restore the foundation file to baseline SHA-256
`72a965b81c7ccc21ddca5ae1f7f6e249a82f76898269ac07bf121da00b8f7f76`
while the config remains at
`f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655`.
A full planned rollback would reverse both authorized-file diffs against the
unchanged index. No destructive rollback was executed, and the accepted repair
bytes remain in the worktree.

### Ordered TP-01-11 And TP-01-12 Replay

**TP-01-11 Claim Source:** executed

**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`

**Exit Code:** 0

```text
✔ Feature 004 preserves every pre-existing dirty hunk (1214.099709ms)
✔ Feature 004 collision disposition parser fails closed on malformed records (9137.177083ms)
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary (660.0135ms)
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 11120.538625
```

**TP-01-12 Claim Source:** executed

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`

**Exit Code:** 1

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=11
[playwright-runtime] absoluteOverrides=0
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✖ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ suites 0
ℹ pass 3
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Both failures identify the same committed source fact:
`tests/market-brief-session-date-drift.spec.mjs` imports `playwright/test`
directly. A path-scoped status and complete `HEAD` read proved that file is
clean and the direct import is committed baseline, not concurrent dirt. The
existing shared-seam assertion was not weakened. Under the planning amendment's
explicit exclusion of every `.spec.mjs` edit, this is not locally repairable.

### Static Checks And Editor Diagnostics

**Claim Source:** executed

```text
BUG002_REWORK02_STATIC_CHECKS_BEGIN
NODE_SOURCE_LOCK_BEGIN
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
NODE_SOURCE_LOCK_EXIT=0
BASH_PARSE_BEGIN
BASH_PARSE_EXIT=0
TWO_FILE_DIFF_CHECK_BEGIN
TWO_FILE_DIFF_CHECK_EXIT=0
BUG002_REWORK02_STATIC_CHECKS_END
```

VS Code diagnostics returned `No errors found` for both authorized files.

### Gate Stop And Finding Closure

**Claim Source:** not-run for TP-01-13, TP-01-05, TP-01-06, and both TP-01-10
repetitions. The authoritative sequence says no later checkpoint starts until
the preceding checkpoint is green. After TP-01-12 reproduced the committed
shared-seam contradiction, unrestricted `--list`, focused browser execution,
complete BUG-002 browser execution, and the two full inventories were therefore
not run in this invocation.

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG002-DISCOVERY-TAXONOMY-ASSERTIONS` | Addressed at source level: the fifth test records the exact 12/2 inventory and direct-Node/shared-browser import contracts; no pass claim is made while TP-01-12 is red. | none for source authoring |
| `BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE` | Unresolved: the committed BUG-002 browser spec violates the required shared seam, while the active amendment excludes that file from edit authority. | `bubbles.plan` via `TR-BUG-002-PLAN-PLAYWRIGHT-SHARED-SEAM-01` |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Unresolved until the ownership contradiction is reconciled and TP-01-12/13 are green. | `bubbles.plan`, then `bubbles.implement` |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved because the two exact TP-01-10 repetitions were correctly blocked by TP-01-12. | `bubbles.implement`, then `bubbles.test` |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved; no independent replay or certification claim is made. | `bubbles.test` after implementation checks pass |

The concurrent state update already routes
`TR-BUG-002-PLAN-PLAYWRIGHT-SHARED-SEAM-01` to `bubbles.plan`. This addendum
does not mutate `state.json`, `scopes.md`, any certification field, any browser
spec, any direct Node suite, or any unrelated dirty byte. BUG-002 and SCOPE-01
remain `in_progress`.

## Test-Owner Shared-Seam Execution - 2026-07-18T17:19:40Z

**Phase:** test

**Agent:** `bubbles.test`

**Claim Source:** executed and interpreted

This execution follows the explicit top-level `bubbles.goal` dispatch for
`TR-BUG-002-TEST-PLAYWRIGHT-SHARED-SEAM-01`. A concurrent planning writer later
preserved that test route as superseded and added an implementation route. This
section does not erase that history. It records the actual test-owner mutation
and the new fail-closed result observed before any ordered Gate 1 command ran.

### Clean Browser-Spec Baseline

**Command:** path-scoped status, SHA-256, Git object, index entry, and complete
staged/unstaged/HEAD diff for
`tests/market-brief-session-date-drift.spec.mjs`

**Exit Code:** 0

**Claim Source:** executed

```text
BUG002_SHARED_SEAM_BASELINE_BEGIN
STATUS_BEGIN
STATUS_END
SHA256_BEGIN
f386e157fc53665716379bcb692403b64792498fa949b6260e2de57ce64a8092  tests/market-brief-session-date-drift.spec.mjs
SHA256_END
WORKTREE_GIT_OID_BEGIN
b796912cf747fd63dc0c36482902b63ee7cd1a3e
WORKTREE_GIT_OID_END
INDEX_ENTRY_BEGIN
100644 b796912cf747fd63dc0c36482902b63ee7cd1a3e 0 tests/market-brief-session-date-drift.spec.mjs
INDEX_ENTRY_END
UNSTAGED_DIFF_BEGIN
UNSTAGED_DIFF_END
STAGED_DIFF_BEGIN
STAGED_DIFF_END
HEAD_DIFF_BEGIN
HEAD_DIFF_END
BUG002_SHARED_SEAM_BASELINE_END
```

The empty status and three empty diff windows prove the browser spec began
clean. Its worktree and index Git objects were both
`b796912cf747fd63dc0c36482902b63ee7cd1a3e`.

### Current-Session Pre-Edit RED

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`

**Exit Code:** 1

**Claim Source:** executed

**Raw output window:** opening inventory and final counts from the complete
current-session transcript; the full output exceeded 100 lines.

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=11
[playwright-runtime] absoluteOverrides=0
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✖ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ suites 0
ℹ pass 3
ℹ fail 2
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
test at tests/playwright-runtime.foundation.functional.mjs:119:1
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal
- tests/market-brief-session-date-drift.spec.mjs
test at tests/playwright-runtime.foundation.functional.mjs:154:1
AssertionError [ERR_ASSERTION]: market-brief-session-date-drift.spec.mjs must import the shared Playwright runtime
```

The RED is adversarial and specific: runtime identity, source locality,
no-fallback authority, 12-spec discovery, and two-Node-suite exclusion all ran;
only the direct BUG-002 browser import caused these two failures.

### Authorized Import Mutation And Byte Proof

**Mutation:** one `apply_patch` replacement in
`tests/market-brief-session-date-drift.spec.mjs`

**Claim Source:** executed

```text
The following files were successfully edited:
/Users/pkirsanov/Projects/research-lab/tests/market-brief-session-date-drift.spec.mjs
```

**Command:** reconstruct the expected after-image from `HEAD` by replacing the
single direct import, assert exact byte equality, then run the required
three-file `git diff --check`

**Exit Code:** 0

**Claim Source:** executed

```text
BUG002_IMPORT_ONLY_PROOF_BEGIN
path=tests/market-brief-session-date-drift.spec.mjs
baselineSha256=f386e157fc53665716379bcb692403b64792498fa949b6260e2de57ce64a8092
afterSha256=b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc
baselineBytes=1844
afterBytes=1853
expectedBytes=1853
baselineDirectImportCount=1
afterDirectImportCount=0
afterSharedImportCount=1
everyOtherByteUnchanged=PASS
IMPORT_ONLY_PROOF_RESULT=PASS
BUG002_IMPORT_ONLY_PROOF_END
BUG002_THREE_FILE_DIFF_CHECK_BEGIN
diffCheckExit=0
BUG002_THREE_FILE_DIFF_CHECK_END
```

The complete rollback-unit diff independently attributes exactly three hunks:
the predecessor `testMatch` hunk in `playwright.config.mjs`, the predecessor
foundation assertions in `tests/playwright-runtime.foundation.functional.mjs`,
and this invocation's first-line import hunk. The browser spec has no second
hunk, no staged bytes, and no other changed byte.

### Immediate Post-Edit Foundation Check

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`

**Exit Code:** 1

**Claim Source:** executed

**Raw output window:** opening inventory, final counts, and first failure signal
from the complete current-session transcript; the full output exceeded 100
lines.

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] importer=tests/market-brief-session-date-drift.spec.mjs
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ suites 0
ℹ pass 4
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
test at tests/playwright-runtime.foundation.functional.mjs:154:1
AssertionError [ERR_ASSERTION]: brief-refresh-atomicity.test.mjs must use node:test
actual: const { default: test } = await import('node:test');
expected: /from\s+['"]node:test['"]/
```

The authorized import repair turned the all-browser shared-seam assertion green
at `12/12`. The remaining failure is a distinct taxonomy assertion mismatch:
`tests/brief-refresh-atomicity.test.mjs` uses a guarded dynamic
`await import('node:test')`, while the newly delivered foundation assertion
accepts only a static `from 'node:test'` form. Both that Node suite and the
foundation assertion are excluded from this transition's writable bytes. The
foundation assertion was not weakened and no second edit attempt was made.

### Diagnostics And Stop Boundary

**Tool:** VS Code diagnostics for the accepted rollback unit

**Claim Source:** executed

```text
playwright.config.mjs: No errors found
tests/playwright-runtime.foundation.functional.mjs: No errors found
tests/market-brief-session-date-drift.spec.mjs: No errors found
```

The immediate focused check is the first failure after the authorized edit, so
the ordered sequence stopped before TP-01-11. The following commands are
**Claim Source: not-run** in this execution and are not represented as passing:

| Planned row | Current execution result |
| --- | --- |
| TP-01-11 Feature 004 Node canary | Not run after the immediate foundation failure |
| TP-01-12 ordered foundation repetition | Not run as a separate gate; the mandatory immediate check already failed the same command |
| TP-01-13 unrestricted Playwright listing | Not run |
| TP-01-05 exact BUG-002 title | Not run |
| TP-01-06 complete BUG-002 browser file | Not run |
| TP-01-10 repetition 1 | Not run |
| TP-01-10 repetition 2 | Not run |
| `node --test tests/brief-refresh-atomicity.test.mjs` | Not run |
| `node scripts/validate-brief-payload.mjs` | Not run |
| `node scripts/selftest.mjs` | Not run |
| `bash -n scripts/brief-refresh-and-push.sh` | Not run |
| `node scripts/validate-node-source-lock.mjs` | Not run |

No regression, validate, audit, certification, terminal status, or parent
Feature 006 replay claim is made. BUG-002 and SCOPE-01 remain `in_progress`.

### Test-Owner Finding Accounting And Route

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE` | Addressed: the only direct browser import was replaced and the all-browser shared-seam assertion advanced from `11/12` to `12/12`. | none |
| `BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH` | Unresolved: the read-only foundation assertion rejects the existing guarded dynamic `node:test` import even though the suite remains a direct Node test. The active boundary forbids changing either file. | `bubbles.plan` |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Unresolved because the complete foundation command still exits `1`; unrestricted discovery is ineligible. | `bubbles.plan`, then `bubbles.test` |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved and not re-executed because the stop boundary was reached before TP-01-10. | `bubbles.test` after planning reconciliation |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because the selected test profile did not complete. | `bubbles.test` after planning reconciliation |
| `BUG002-REGRESSION-PHASE` | Not eligible while independent test remains red. | `bubbles.regression` only after a clean test return |
| `BUG002-VALIDATE-CERTIFICATION` | Not eligible before test and regression complete. | `bubbles.validate` |
| `BUG002-AUDIT-CERTIFICATION` | Not eligible before validation. | `bubbles.audit` |

The smallest valid route is
`TR-BUG-002-PLAN-NODE-TEST-TAXONOMY-01 -> bubbles.plan`: reconcile whether the
foundation contract must recognize the existing guarded dynamic `node:test`
form or explicitly authorize a different test-owned change. Preserve the green
12/12 shared browser seam, both Node suites' behavior, every assertion and
inventory count, and all excluded paths. The next test execution must restart
at the same immediate foundation command before TP-01-11.

## Implementation Shared-Seam Reconciliation And Ordered Replay - 2026-07-18T17:26:24Z

**Phase:** implement
**Agent:** `bubbles.implement`
**Transition:** `TR-BUG-002-IMPLEMENT-PLAYWRIGHT-SHARED-SEAM-01`
**Outcome:** `route_required`
**Claim Source:** executed

This section appends to, and does not replace, the concurrent test-owner record
above. The explicit operator planning authorization made exactly three paths
implementation-owned for this replay. The existing first-line browser import
candidate was adopted without rewriting it. The only new source/test edit in
this invocation was the fail-closed foundation matcher needed to recognize both
real ESM forms of the direct Node test contract:

```js
/(?:from\s+['"]node:test['"]|import\(\s*['"]node:test['"]\s*\))/
```

The assertion still requires an actual `node:test` import and still rejects
`playwright/test` and `./playwright-runtime.mjs` in both Node suites. No Node
suite, browser assertion, inventory entry, browser authority, worker, retry,
setup hook, runtime seam, package/source-lock surface, Feature 004/005/010
artifact, or framework file was edited.

### Current-Disk Adoption And Repair Loop

The pre-run baseline and final containment hashes were:

```text
path                                                       before                                                            after
playwright.config.mjs                                      f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655
tests/playwright-runtime.foundation.functional.mjs         f96a2a73b1ac2872ca06e49e0c71bc04230c1dbbd6e3d15627f82945e71b7296  32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26
tests/market-brief-session-date-drift.spec.mjs              b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc  b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc
tests/brief-refresh-atomicity.support.mjs                    0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4  0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4
```

The browser-suite hash remained identical throughout this invocation, proving
the concurrent line-1 substitution was adopted rather than rewritten. The
protected dirty helper also remained byte-identical.

Gate 1 first reproduced the concurrent taxonomy mismatch. The ordered sequence
remained stopped inside Gate 1 while the authorized foundation path was repaired:

```text
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] absoluteOverrides=0
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 4
ℹ fail 1
AssertionError [ERR_ASSERTION]: brief-refresh-atomicity.test.mjs must use node:test
actual: const { default: test } = await import('node:test');
expected: /from\s+['"]node:test['"]/
```

The first patch attempt landed in the wrong repeated assertion context; its
immediate rerun failed locally with `nodeSuiteName is not defined` and the
original taxonomy failure. No later gate ran. That misplaced edit was removed,
the no-fallback log was restored exactly, and the matcher was applied only in
the intended Node-suite inventory loop. The next Gate 1 run was green.

### Gate 1 - Shared Runtime Foundation

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[playwright-runtime] package=node_modules/playwright
[playwright-runtime] cli=node_modules/playwright/cli.js
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Gate 2 - Feature 004 Direct Node Canary

**Command:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 10647.934584
```

### Gate 3 - Browser Discovery Inventory

**Command:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

The untruncated output began at `Listing tests:` and contained only `.spec.mjs`
entries. These verbatim inventory markers cover all 12 discovered files:

```text
Listing tests:
  [system-chrome] › tests/bond-regime-lab.spec.mjs:75:1 › BS-001 duration-driven ratio improvement stays mixed
  [system-chrome] › tests/causal-rotation-lab.spec.mjs:36:1 › Regression: served causal contracts preserve explicit stale and unavailable states
  [system-chrome] › tests/company-fundamentals-lab.spec.mjs:14:1 › Regression: SCN-010-026 missing concepts remain unavailable while independent facts stay usable
  [system-chrome] › tests/fx-regime-relative-value-lab.spec.mjs:34:1 › Browser functional source envelopes match in browser and CommonJS for one decisionTime
  [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
  [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth
  [system-chrome] › tests/palm-springs-rental-market-lab.spec.mjs:60:1 › Regression: SCN-005-002 missing configuration blocks payload fetch and every output
  [system-chrome] › tests/portfolio-survival-foundation.spec.mjs:60:1 › Regression: SCN-008-001 valid local portfolio import creates one current revision
  [system-chrome] › tests/provider-credentials.spec.mjs:51:3 › Canary BUG-001: real index loads shared status and erase controls with no credential editor
  [system-chrome] › tests/technical-analysis-decision-lab.spec.mjs:55:1 › Regression: SCN-007-005 stock four-hour profile exposes session remainder and variant identity
  [system-chrome] › tests/trend-dynamics-cycle-lab.spec.mjs:57:1 › Regression: SCN-006-001 noisy sustained trend ignores sub-threshold residual wiggles
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:67:1 › Regression BS-002: storm-gauge percentile always renders its trailing window and observation count
Total: 132 tests in 12 files
```

No `.test.mjs`, Node TAP prelude, `# Subtest:`, or Feature 004 direct-suite
output appeared in the discovery listing.

### Gate 4 - Implementation Exact And Complete BUG-002 Browser File

**Commands:**

1. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
2. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0, 0
**Claim Source:** executed

Each command ran one test. The exact-title run reported `1 passed (2.8s)` and
the complete-file run reported this clean close:

```text
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot (1.8s)
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-begin
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-begin
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  1 passed (2.4s)
```

### Gate 5 - Impacted Functional And Repository Checks

**Commands and observed exits:**

| Command | Exit | Observed result |
| --- | ---: | --- |
| `node --test tests/brief-refresh-atomicity.test.mjs` | 0 | 14 passed, 0 failed |
| `node scripts/validate-brief-payload.mjs` | 0 | brief contract PASS |
| `node scripts/selftest.mjs` | 0 | 491 passed, 0 failed |
| `bash -n scripts/brief-refresh-and-push.sh` | 0 | no stdout/stderr |

**Claim Source:** executed

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 14
ℹ pass 14
ℹ fail 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

### Gate 6 - Identical Full Command Twice Sequentially

**Command, repetition 1 and repetition 2:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Codes:** 0, 0
**Claim Source:** executed

Repetition 1:

```text
  ✓  130 …pose return risk drawdown and trend when history is sufficient (241ms)
  ✓  131 …fig cache and reachable public sources without uncaught errors (196ms)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (389ms)
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  132 passed (47.1s)
```

Repetition 2:

```text
  ✓  130 …pose return risk drawdown and trend when history is sufficient (243ms)
  ✓  131 …fig cache and reachable public sources without uncaught errors (176ms)
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths (360ms)
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  132 passed (48.3s)
```

Both commands returned synchronously. Neither output contained a Node-test
prelude, non-test error, force-kill, or retained-handle report. The post-run
process check found `retainedPlaywrightRunner=NONE`.

### Gate 7 - Containment And Diagnostics

**Command:** path-scoped `git diff --check`, status/hash/diff inspection for the
three authorized paths and protected surfaces, staged-path inspection, plus a
retained Playwright-runner check
**Exit Code:** 0
**Claim Source:** executed

```text
BUG002_GATE7_BEGIN
DIFF_CHECK=PASS
PATH_SCOPED_STATUS
 M playwright.config.mjs
 M scripts/brief-refresh-and-push.sh
 M scripts/selftest.mjs
 M tests/brief-refresh-atomicity.support.mjs
 M tests/feature-004-dirty-tree-collision.test.mjs
 M tests/market-brief-session-date-drift.spec.mjs
 M tests/playwright-runtime.foundation.functional.mjs
PATH_SCOPED_HASHES
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26  tests/playwright-runtime.foundation.functional.mjs
b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc  tests/market-brief-session-date-drift.spec.mjs
0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4  tests/brief-refresh-atomicity.support.mjs
STAGED_PATHS
RETAINED_RUNNER_CHECK
retainedPlaywrightRunner=NONE
BUG002_GATE7_END
```

VS Code diagnostics reported `No errors found` for all three authorized paths.
The final diff contains only the existing top-level matcher, the existing
foundation/inventory slice plus the import-form matcher repair, and the adopted
first-line BUG-002 shared-seam import. `git diff --check` passed and no path was
staged.

### Finding Accounting And Independent Replay Route

| Finding | Implementation disposition |
| --- | --- |
| `BUG002-PLAYWRIGHT-SHARED-SEAM-BASELINE` | Addressed: the concurrent first-line import was adopted without a byte change. |
| `BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH` | Addressed in the authorized foundation path while preserving fail-closed import semantics. |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Addressed by Gate 1 and Gate 3: 12 shared-seam browser files, two direct Node files excluded, 132 tests listed. |
| `BUG002-BROAD-E2E-INSTABILITY` | Addressed for implementation ownership by two sequential 132/132 clean exits and graceful teardown; independent replay remains required. |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved and routed to fresh `TR-BUG-002-TEST-PLAYWRIGHT-SHARED-SEAM-02`. |
| `BUG002-REGRESSION-PHASE` | Unresolved; not executed or claimed. |
| `BUG002-VALIDATE-CERTIFICATION` | Unresolved; not executed or claimed. |
| `BUG002-AUDIT-CERTIFICATION` | Unresolved; not executed or claimed. |

The concurrent pending planning transition is preserved in state as foreign
history; this implementation invocation does not resolve it. Only
`TR-BUG-002-IMPLEMENT-PLAYWRIGHT-SHARED-SEAM-01` is resolved. BUG-002 and
SCOPE-01 remain `in_progress`; no test-phase, regression, validation, audit,
certification, scope-completion, or bug-completion claim is made.

### Shared-Seam Closeout Validation

**Command:** parse `state.json`, assert the exact blocked routing contract and
absence of a test completion claim, then run diff integrity over the rollback
unit and the two test-owned evidence artifacts

**Exit Code:** 0

**Claim Source:** executed

```text
BUG002_STATE_ROUTE_VALIDATION_BEGIN
statusInProgress=PASS
certificationInProgress=PASS
activeAgentTest=PASS
currentPhaseTest=PASS
nextOwnerPlan=PASS
nextTargetExact=PASS
pendingExact=PASS
routePending=PASS
implementBlocked=PASS
noTestPhaseClaim=PASS
historyRouteRequired=PASS
completedPhaseClaims=implement
certifiedCompletedPhases=
BUG002_STATE_ROUTE_VALIDATION_END
BUG002_EVIDENCE_DIFF_CHECK_BEGIN
diffCheckExit=0
BUG002_EVIDENCE_DIFF_CHECK_END
```

**Tool:** VS Code diagnostics after the evidence and execution-state writes

**Claim Source:** executed

```text
playwright.config.mjs: No errors found
tests/playwright-runtime.foundation.functional.mjs: No errors found
tests/market-brief-session-date-drift.spec.mjs: No errors found
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md: No errors found
specs/_bugs/BUG-002-market-brief-session-date-drift/state.json: No errors found
```

**Mutation containment claim source:** executed tool history. Successful
`apply_patch` writes in this invocation target only:

```text
tests/market-brief-session-date-drift.spec.mjs
specs/_bugs/BUG-002-market-brief-session-date-drift/report.md
specs/_bugs/BUG-002-market-brief-session-date-drift/state.json
```

The first path contains only the proved import-source hunk. The latter two are
the permitted test evidence and execution/routing records. No source, other
test, worker, retry, setup hook, package/source-lock, browser authority,
inventory, production data, Feature 004/010/MSFT, framework-managed, staged, or
unrelated dirty path was passed to a successful file-mutation tool. One rejected
multi-block `state.json` patch changed no byte, and one malformed read-only shell
probe was terminated at its continuation prompt before execution; neither is
presented as validation evidence.

## Independent Shared-Seam Test Replay - 2026-07-18T17:45:34Z

**Phase:** test
**Agent:** `bubbles.test`
**Requested transition:** `TR-BUG-002-TEST-PLAYWRIGHT-SHARED-SEAM-02`
**Active successor:** `TR-BUG-002-TEST-NODE-TEST-TAXONOMY-01`
**Workflow mode:** `bugfix-fastlane`
**Outcome:** `route_required`
**Claim Source:** executed

Current disk was read before execution. While the replay was running, planning
resolved the requested transition as superseded by the narrower active
successor. The successor carries the same seven gates unchanged plus an
immediate foundation check. The existing predicate already matched its exact
authorized after-image, so test ownership adopted it without rewriting any test
byte and executed the complete successor sequence.

No source, test, planning, framework, certification, Feature 004/005/010, or
protected helper byte was edited. The only writes from this test phase are this
append-only evidence section and BUG-002 execution/routing fields in
`state.json`.

### Pre-Execution Drift Fence

**Command:** transition-hash comparison using `shasum -a 256`, followed by
path-scoped `git status --short --untracked-files=all` and
`git diff --cached --name-status`

**Exit Code:** 0

**Claim Source:** executed

```text
EXPECTED_HASH_RESULT path=playwright.config.mjs result=PASS
EXPECTED_HASH_RESULT path=tests/playwright-runtime.foundation.functional.mjs result=PASS
EXPECTED_HASH_RESULT path=tests/market-brief-session-date-drift.spec.mjs result=PASS
EXPECTED_HASH_RESULT path=tests/brief-refresh-atomicity.support.mjs result=PASS
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26  tests/playwright-runtime.foundation.functional.mjs
b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc  tests/market-brief-session-date-drift.spec.mjs
0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4  tests/brief-refresh-atomicity.support.mjs
642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181  scripts/brief-refresh-and-push.sh
c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206  market-brief.payload.json
e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b  market-brief.snapshot.json
05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b  brief-history.jsonl
83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d  tests/feature-004-dirty-tree-collision.test.mjs
519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b  scripts/selftest.mjs
STAGED_STATUS_BEGIN
STAGED_STATUS_END
BUG002_INDEPENDENT_BASELINE_END
```

**Result:** PASS. All four transition hashes matched before Gate 1. The
wrapper, pair, collision-parser, and selftest identities were frozen for the
post-run comparison. Protected dirty paths were already dirty and entirely
unstaged before execution.

### Gates 1 And 2 - Independent Foundations

**Commands:**

1. `node --test tests/playwright-runtime.foundation.functional.mjs`
2. `node --test tests/feature-004-dirty-tree-collision.test.mjs`

**Exit Codes:** 0, 0

**Claim Source:** executed

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 5
ℹ fail 0
ℹ skipped 0
ℹ todo 0
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS. The immediate shared-runtime foundation passed `5/5`; the
independent Feature 004 canary then passed `3/3` without changing its parser or
the protected selftest checkpoint.

### Gate 3 - Browser-Only Discovery

**Command:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

The complete unfiltered listing was retained by the terminal execution. A
read-only assertion over that raw capture produced:

```text
listingStartsNormally=true
browserEntries=132
browserFiles=12
browserFile=tests/bond-regime-lab.spec.mjs
browserFile=tests/causal-rotation-lab.spec.mjs
browserFile=tests/company-fundamentals-lab.spec.mjs
browserFile=tests/fx-regime-relative-value-lab.spec.mjs
browserFile=tests/market-brief-session-date-drift.spec.mjs
browserFile=tests/msft-july-market-refresh.spec.mjs
browserFile=tests/palm-springs-rental-market-lab.spec.mjs
browserFile=tests/portfolio-survival-foundation.spec.mjs
browserFile=tests/provider-credentials.spec.mjs
browserFile=tests/technical-analysis-decision-lab.spec.mjs
browserFile=tests/trend-dynamics-cycle-lab.spec.mjs
browserFile=tests/volatility-sizing-lab.spec.mjs
totalMarker=true
forbidden.nodeTestFile=false
forbidden.tapVersion=false
forbidden.subtest=false
forbidden.feature004Prelude=false
gate3Proof=PASS
```

**Result:** PASS. Discovery began at `Listing tests:`, listed exactly 132 tests
in 12 `.spec.mjs` files, and emitted no `.test.mjs`, TAP, subtest, or Feature
004 direct-Node prelude.

### Gate 4 - Independent Exact And Complete BUG-002 Browser File

**Commands:**

1. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot" --reporter=list`
2. `npx --no-install playwright test tests/market-brief-session-date-drift.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0, 0

**Claim Source:** executed

```text
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-begin
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-begin
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  1 passed
```

**Result:** PASS. TP-01-05 and TP-01-06 each passed `1/1` through the real
wrapper, production page and renderer, OS-temporary Git repository, local bare
remote, and ephemeral loopback HTTP server. No external request or retained
worker lifecycle was observed.

### Gate 5 - Functional, Contract, Repository, And Parse Checks

**Commands:**

1. `node --test tests/brief-refresh-atomicity.test.mjs`
2. `node scripts/validate-brief-payload.mjs`
3. `node scripts/selftest.mjs`
4. `bash -n scripts/brief-refresh-and-push.sh`

**Exit Codes:** 0, 0, 0, 0

**Claim Source:** executed

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ skipped 0
ℹ todo 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Research-Lab self-test: 491 passed, 0 failed
BUG002_BASH_PARSE_BEGIN
bash_parse_exit=0
BUG002_BASH_PARSE_END
```

**Result:** PASS. The complete functional matrix passed `14/14`, the committed
pair validator passed, the repository selftest passed `491/0`, and the wrapper
parsed on macOS.

### Gate 6 - Two Sequential Complete Browser Inventories

**Command, repetition 1 and repetition 2:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** 0, 0

**Claim Source:** executed

Each exact command ran the complete current inventory and returned
synchronously at `132 passed`. The closing raw windows were:

```text
REPETITION_1
  ✓  130 …pose return risk drawdown and trend when history is sufficient
  ✓  131 …fig cache and reachable public sources without uncaught errors
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  132 passed (23.0s)
REPETITION_2
  ✓  130 …pose return risk drawdown and trend when history is sufficient
  ✓  131 …fig cache and reachable public sources without uncaught errors
  ✓  132 …ndmarks names focus and noncolor states at 390 and 1440 widths
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  132 passed (48.1s)
```

The corrected read-only output probes and process checks recorded:

```text
required.summary=true
required.processExit=true
forbidden.nodeTestFile=false
forbidden.tapVersion=false
forbidden.subtest=false
forbidden.feature004Prelude=false
forbidden.nonTestError=false
forbidden.forceKill=false
forbidden.retainedHandle=false
forbidden.digestDrift=false
repetition1CorrectedOutputProof=PASS
repetition1CorrectedRetainedPlaywrightProcess=NONE
repetition2OutputProof=PASS
repetition2RetainedPlaywrightProcess=NONE
```

**Result:** PASS. Both required repetitions passed `132/132`, reached the
graceful process-exit marker, emitted no retained Node prelude, non-test error,
force-kill, retained-handle, or digest-drift marker, and left no Playwright
process.

An earlier auxiliary repetition-1 probe required two beginning-of-output tokens
that VS Code had dropped after the 70 KB terminal run and therefore exited `1`.
It still observed every forbidden marker as false and no retained process. The
corrected end-state probe above exited `0`; this was an evidence-window checker
mistake, not a test-runner finding.

### Gate 7 - Byte, Status, Staging, Process, And Diagnostic Containment

**Command:** compare all ten protected SHA-256 values to the pre-run baseline;
compare path-scoped status and staging; run path-scoped `git diff --check`; check
for retained Playwright processes

**Exit Code:** 0

**Claim Source:** executed

```text
HASH_RESULT path=playwright.config.mjs result=UNCHANGED
HASH_RESULT path=tests/playwright-runtime.foundation.functional.mjs result=UNCHANGED
HASH_RESULT path=tests/market-brief-session-date-drift.spec.mjs result=UNCHANGED
HASH_RESULT path=tests/brief-refresh-atomicity.support.mjs result=UNCHANGED
HASH_RESULT path=scripts/brief-refresh-and-push.sh result=UNCHANGED
HASH_RESULT path=market-brief.payload.json result=UNCHANGED
HASH_RESULT path=market-brief.snapshot.json result=UNCHANGED
HASH_RESULT path=brief-history.jsonl result=UNCHANGED
HASH_RESULT path=tests/feature-004-dirty-tree-collision.test.mjs result=UNCHANGED
HASH_RESULT path=scripts/selftest.mjs result=UNCHANGED
protectedStatusMatchesBaseline=PASS
protectedStagingMatchesBaseline=PASS staged=NONE
protectedDiffCheckExit=0
retainedPlaywrightProcess=NONE
BUG002_GATE7_CONTAINMENT_END
```

VS Code diagnostics separately returned `No errors found` for all ten protected
paths. Test execution changed none of their bytes, dirty states, or index state.

### Test Integrity And Governance

**Commands:** bugfix regression-quality guard; corrected 17-point test-integrity
audit; environment-pollution scan; Node source-lock validator; macOS portability
guard; BUG-002 artifact lint; BUG-002 traceability guard

**Exit Codes:** 0 for every final command

**Claim Source:** executed

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
testIntegrityChecks=17/17
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
== macOS portability guard -- scanning 1 file(s) ==
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
Test rows checked: 14
RESULT: PASSED (0 warnings)
```

**Result:** PASS. The tests contain no skip/only/todo, interception, internal
mock, or silent-bailout pattern; they execute the real wrapper and page against
owned temporary Git/HTTP fixtures and assert code-produced publication state.
The source graph and portability checks are green. The packet retains one
nonblocking deprecated `scopeProgress` advisory, unchanged by this phase. The
project declares no `testImpact` or `traceContracts`, so impact planning and
trace/SLO evidence are not applicable.

### Test Verdict And Finding Accounting

| Test surface | Total | Passed | Failed | Skipped |
| --- | ---: | ---: | ---: | ---: |
| Shared Playwright foundation | 5 | 5 | 0 | 0 |
| Feature 004 collision canary | 3 | 3 | 0 | 0 |
| BUG-002 functional matrix | 14 | 14 | 0 | 0 |
| Complete repository selftest | 491 | 491 | 0 | 0 |
| Exact BUG-002 browser title | 1 | 1 | 0 | 0 |
| Complete BUG-002 browser file | 1 | 1 | 0 | 0 |
| Full browser inventory repetition 1 | 132 | 132 | 0 | 0 |
| Full browser inventory repetition 2 | 132 | 132 | 0 | 0 |

| Finding | Test disposition |
| --- | --- |
| `BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH` | Addressed under test ownership: the exact existing predicate was adopted without a byte change and the immediate foundation passed `5/5`. |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Addressed independently: foundation `5/5` and discovery `132 in 12` prove browser/Node separation and 12 shared importers. |
| `BUG002-BROAD-E2E-INSTABILITY` | Addressed independently: two sequential exact commands passed `132/132`, reached `process-exit`, and left no retained process. |
| `BUG002-INDEPENDENT-VERIFICATION` | Addressed: all successor gates plus integrity, isolation, source-lock, portability, lint, traceability, and diagnostics passed on the recorded after-image. |
| `BUG002-EVIDENCE-WINDOW-PROBE-001` | Addressed in-session: a read-only probe over-required truncated beginning tokens; the corrected end-state probe passed for repetition 1 and changed no repository byte. |
| `BUG002-REGRESSION-PHASE` | Not executed or claimed by this phase; the existing transition is unblocked for `bubbles.regression`. |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed. |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed. |

`TR-BUG-002-TEST-NODE-TEST-TAXONOMY-01` is resolved as an independent test
execution claim. The superseded requested transition remains preserved exactly
as concurrent planning history. BUG-002 and SCOPE-01 remain `in_progress`. No
regression, validation, audit, certification, scope-completion, bug-completion,
or parent Feature 006 replay claim is made.

## Current Browser-Inventory Cardinality Supersession - 2026-07-18T21:12:15Z

**Phase:** test
**Agent:** `bubbles.test`
**Resumed transition:** `TR-BUG-002-TEST-NODE-TEST-TAXONOMY-01`
**Workflow mode:** `bugfix-fastlane`
**Outcome:** `route_required`
**Claim Source:** executed

This later current-byte replay preserves the complete `17:45:34Z` test section
as valid historical evidence for the inventory that existed then. It
supersedes only that section's current test-phase and regression-route claims.
The shared-runtime foundation and Feature 004 canary remain green, but
unrestricted Playwright discovery now lists `133` tests in the same 12 browser
files. The active BUG-002 planning contract requires exactly `132`; therefore
Gate 3 fails even though the listing command itself exits `0`.

The new inventory member is the planning-backed Feature 005 browser regression
`Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable
not factual`. Feature 005 remains concurrently owned by its own audit/test
route. No Feature 005 artifact or browser test was edited, restored, staged, or
reclassified by this invocation.

### Four-Hunk Boundary And Immediate Foundation

**Executed:** YES (in current session)
**Commands:** path-scoped status/diff/hash baseline; `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG002_FOUR_HUNK_BOUNDARY_STAGED_BEGIN
BUG002_FOUR_HUNK_BOUNDARY_STAGED_END
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26  tests/playwright-runtime.foundation.functional.mjs
b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc  tests/market-brief-session-date-drift.spec.mjs
70b68b970551e2473aab3817bf8cde6480d6ff2641cde9cbf2823ede2a69d0d4  tests/playwright-runtime.mjs
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 5
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS. The current four-hunk after-image is unstaged and retains the
accepted hashes. The static-or-dynamic `node:test` predicate is independently
green under test ownership.

### Gates 1 And 2

**Executed:** YES (in current session)
**Commands:** `node --test tests/feature-004-dirty-tree-collision.test.mjs`; `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Codes:** 0; 0
**Claim Source:** executed

```text
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] discoveryTaxonomy=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ shared runtime rejects sibling global-prefix and npm-cache Playwright packages
✔ shared runtime contains no browser executable or package fallback authority
✔ every Playwright spec uses the shared seam and sole committed browser config
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 5
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS. Gate 1 is `3/3`; the Gate 2 replay remains `5/5`.

### Gate 3 - Current Discovery Failure

**Executed:** YES (in current session)
**Command:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The runner successfully listed its inventory, but the
planning-owned exact-cardinality assertion fails because the native total is
`133`, not `132`. The same output still proves 12 `.spec.mjs` browser files and
no `.test.mjs` Node prelude.

```text
Listing tests:
  [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
  [system-chrome] › tests/palm-springs-rental-market-lab.spec.mjs:458:1 › Regression: SCN-005-026 refresh accounts independently for all four mandatory units
  [system-chrome] › tests/palm-springs-rental-market-lab.spec.mjs:480:1 › Regression: SCN-005-027 acquisition baselines disclose sample status and legal unknowns
  [system-chrome] › tests/palm-springs-rental-market-lab.spec.mjs:518:1 › Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:192:1 › Cache-first partial paint renders synchronous non-blank canvases with text and table fallback
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:208:1 › Controls recompute one decision without any market-data request
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:221:1 › Power canvases carry aria-label and same-data table on desktop and mobile
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:236:1 › Registered Volatility Sizing tool publishes one owner read and Market Brief renders it without recompute
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:262:1 › TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL
Total: 133 tests in 12 files
```

**Result:** FAIL against TP-01-13's exact `132 tests in 12 files` contract.
The test source is not weakened to make a stale planning count pass.

### Mandatory Stop Boundary

Per the transition's fail-fast sequence, execution stopped at the first current
failure. The following required commands are **Claim Source: not-run** in this
invocation and are not represented as passing:

| Required surface | Exact command | Current invocation |
| --- | --- | --- |
| BUG-002 functional matrix | `node --test tests/brief-refresh-atomicity.test.mjs` | Not run after Gate 3 failure |
| Pair validator | `node scripts/validate-brief-payload.mjs` | Not run after Gate 3 failure |
| Repository selftest | `node scripts/selftest.mjs` | Not run after Gate 3 failure |
| Exact BUG-002 browser title | TP-01-05 command | Not run after Gate 3 failure |
| Complete BUG-002 browser file | TP-01-06 command | Not run after Gate 3 failure |
| Complete inventory repetition 1 | TP-01-10 command | Not run after Gate 3 failure |
| Complete inventory repetition 2 | TP-01-10 command | Not run after Gate 3 failure |
| Quality/source-lock/isolation/portability/artifact/traceability matrix | planned guard commands | Not run after Gate 3 failure |

### Cardinality-Supersession Finding Accounting And Route

| Finding | Current disposition | Required owner |
| --- | --- | --- |
| `BUG002-NODE-TEST-TAXONOMY-ASSERTION-MISMATCH` | Test-verified resolved: immediate and Gate 2 foundation executions each pass `5/5`. | none |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | New blocking planning drift: planned `132`, current native inventory `133` after planned Feature 005 SCN-005-028 joined the shared suite. | `bubbles.plan` |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Unresolved only at exact cardinality; 12 browser files, two excluded Node suites, and 12 shared importers remain green. | `bubbles.plan`, then `bubbles.test` |
| `BUG002-BROAD-E2E-INSTABILITY` | Not re-executed because Gate 3 failed first; current repeated-clean-exit proof is absent. | `bubbles.test` after planning reconciliation |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved because the current authorized sequence stopped before focused, functional, and complete inventory execution. | `bubbles.plan`, then `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Re-blocked; regression cannot consume a stale independent-test claim. | `bubbles.regression` only after a clean current replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed. | `bubbles.audit` after validation |

`TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-01` routes the exact count
reconciliation to `bubbles.plan`. BUG-002 and SCOPE-01 remain `in_progress`;
certification is unchanged. No source, test, Playwright config, planning,
Feature 004/005/006/009/010, framework, or unrelated dirty byte was edited.

<!-- BUG002 current cardinality handoff EOF -->

## Regression Attempt On Superseded 133-Test Inventory - 2026-07-18T21:28:40Z

**Phase:** regression
**Agent:** `bubbles.regression`
**Transition:** `TR-BUG-002-REGRESSION-01`
**Workflow mode:** `bugfix-fastlane`
**Outcome:** `route_required`
**Claim Source:** executed and interpreted

This attempt began from the then-visible `17:45:34Z` clean test handoff. During
execution, the newer `21:12:15Z` test-owned cardinality supersession became
visible and truthfully re-blocked regression on
`TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-01`. That concurrent section
and route remain authoritative and unchanged.

The user-required regression profile was still executed without narrowing so
the complete current finding set would not be lost. It found one additional,
stable Feature 009 test-clock regression after the inventory grew from 132 to
133. This section does not claim a completed regression phase and does not
route to validation.

### Baseline Comparison

| Category | Accepted test handoff | Current regression attempt | Delta | Result |
| --- | ---: | ---: | ---: | --- |
| Shared Playwright foundation | 5/5 | 5/5 | 0 | clean |
| Feature 004 collision canary | 3/3 | 3/3 | 0 | clean |
| BUG-002 functional transaction matrix | 14/14 | 14/14 | 0 | clean |
| Current pair validator | PASS | PASS | 0 | clean |
| Repository selftest | 491/491 | 491/491 | 0 | clean |
| Exact BUG-002 browser title | 1/1 | 1/1 | 0 | clean |
| Complete BUG-002 browser file | 1/1 | 1/1 | 0 | clean |
| Browser discovery | 132 in 12 | 133 in 12 | +1 | planning contract failure |
| Complete system-Chrome inventory | 132/132 | 132/133 | -1 pass | regression |
| Gherkin traceability | 1/1 | 1/1 | 0 | clean |

The repository has no coverage-percentage command. Coverage delta is therefore
reported only through registered executable cardinality, stable protected test
hashes, the complete selftest, and scenario traceability. There is no count
drop in the protected BUG-002 surfaces; the browser inventory grew by one
planned Feature 005 test, but the exact BUG-002 `132` contract is stale until
planning reconciles it.

### Protected Hash And Test Foundation Evidence

**Executed:** YES (in current session)
**Commands:** protected SHA-256/status/staging probe; `node --test tests/playwright-runtime.foundation.functional.mjs`; `node --test tests/feature-004-dirty-tree-collision.test.mjs`
**Exit Codes:** 0; 0; 0
**Claim Source:** executed

```text
protected path=playwright.config.mjs result=PASS
protected path=tests/playwright-runtime.foundation.functional.mjs result=PASS
protected path=tests/market-brief-session-date-drift.spec.mjs result=PASS
protected path=tests/brief-refresh-atomicity.support.mjs result=PASS
protected path=scripts/brief-refresh-and-push.sh result=PASS
protected path=market-brief.payload.json result=PASS
protected path=market-brief.snapshot.json result=PASS
protected path=brief-history.jsonl result=PASS
protected path=tests/feature-004-dirty-tree-collision.test.mjs result=PASS
protected path=scripts/selftest.mjs result=PASS
additionalProtected path=tests/playwright-runtime.mjs sha256=70b68b970551e2473aab3817bf8cde6480d6ff2641cde9cbf2823ede2a69d0d4
additionalProtected path=tests/brief-refresh-atomicity.test.mjs sha256=071906cd9cad9168e35b35997c0b5c398c767ed7df9d40d44cd7de8a04b405aa
certificationSha256=fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958
stagedPaths=NONE
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
✔ shared runtime exports the exact checkout-local Playwright 1.61.1 API
✔ every Playwright spec uses the shared seam and sole committed browser config
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
ℹ tests 5
ℹ pass 5
ℹ fail 0
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

**Result:** PASS. The matcher, shared runtime, BUG-002 import, helper, wrapper,
pair, collision parser, and selftest identities match the accepted handoff.
No path was staged and certification remained exact.

### BUG-002 Functional And Focused Browser Evidence

**Executed:** YES (in current session)
**Commands:** `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`; exact TP-01-05; complete TP-01-06; `bash -n scripts/brief-refresh-and-push.sh`
**Exit Codes:** 0; 0; 0; 0; 0; 0
**Claim Source:** executed

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ skipped 0
ℹ todo 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Research-Lab self-test: 491 passed, 0 failed
Running 1 test using 1 worker
✓ Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
1 passed
BUG002_BASH_PARSE_EXIT=0
```

**Result:** PASS. The fixed BUG-002 behavior itself remains green and reaches
graceful browser process exit.

### Discovery And Complete-Inventory Findings

**Executed:** YES (in current session)
**Commands:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`; `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Codes:** 0; 1
**Claim Source:** interpreted
**Interpretation:** Discovery itself succeeds, but violates the planning-owned
exact count. The complete current inventory then runs all 133 tests and exposes
a stable Feature 009 failure. Neither result permits regression completion.

```text
listingStarts=true
browserEntries=133
browserFiles=12
total133=true
protectedExpected132=false
nodeTestLeak=false
tapLeak=false
inventorySummary=true
feature009Failure=true
processExit=true
nonTestError=false
forceKill=false
retainedHandle=false
digestDrift=false
browserFile=tests/bond-regime-lab.spec.mjs tests=27
browserFile=tests/causal-rotation-lab.spec.mjs tests=4
browserFile=tests/company-fundamentals-lab.spec.mjs tests=30
browserFile=tests/fx-regime-relative-value-lab.spec.mjs tests=9
browserFile=tests/market-brief-session-date-drift.spec.mjs tests=1
browserFile=tests/msft-july-market-refresh.spec.mjs tests=1
browserFile=tests/palm-springs-rental-market-lab.spec.mjs tests=18
browserFile=tests/portfolio-survival-foundation.spec.mjs tests=3
browserFile=tests/provider-credentials.spec.mjs tests=4
browserFile=tests/technical-analysis-decision-lab.spec.mjs tests=5
browserFile=tests/trend-dynamics-cycle-lab.spec.mjs tests=15
browserFile=tests/volatility-sizing-lab.spec.mjs tests=16
protectedInventoryContract=FAIL expected=132 actual=133
fullInventoryVerdict=FAIL feature009=stale-vs-complete
```

The complete inventory's literal failure was:

```text
1) [system-chrome] › tests/msft-july-market-refresh.spec.mjs:46:1 › Regression: SCN-009-001/002/005 cache-first market truth

Error: expect(received).toBe(expected) // Object.is equality

Expected: "complete"
Received: "stale"

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate

130 |     const state = window.MsftJulyModel?.runtime?.acceptedState;
131 |     return state?.marketStatus || null;
> 132 |   })).toBe('complete');

1 failed
132 passed (46.8s)
```

### Feature 009 Focused Reproduction And Classification

**Executed:** YES (in current session)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-009-001/002/005 cache-first market truth" --reporter=list`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The exact title fails identically in isolation, so this is
not suite-order-only. Current option and bar caches were fetched on July 17;
the page evaluates them with `new Date()` on July 18. The production contract
marks a quote older than 24 hours `stale` and aggregates accepted stale input to
`marketStatus="stale"`. The E2E expects `complete` without binding evaluation
time even though Feature 009's design explicitly permits an injected clock.
Production is behaving according to its staleness contract; the persistent E2E
clock is the foreign test-owned defect.

```text
Running 1 test using 1 worker
✘ Regression: SCN-009-001/002/005 cache-first market truth
Expected: "complete"
Received: "stale"
Timeout 5000ms exceeded while waiting on the predicate
at tests/msft-july-market-refresh.spec.mjs:132:7
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=global-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-end
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=stop-profiling-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
1 failed
```

### Cross-Spec And Governance Evidence

**Executed:** YES (in current session)
**Commands:** focused BUG-003 held hydration; focused BS-011; Feature 010 SCN-010-030; `node scripts/validate-trend-dynamics-cycle.mjs`; regression-quality, pollution, source-lock, portability, artifact, freshness, traceability, reality, G094, framework-write, and G095 guards
**Exit Codes:** 0 for every listed command
**Claim Source:** executed

```text
BUG-003 held-hydration title: 1 passed
BS-011 Simple and Power share one model digest: 1 passed
Feature 010 SCN-010-030 owner clocks/non-recomputation: 1 passed
[tdc-validator] scope3-consumer-sweep=PASS page-functions=8 selftest-marker=Feature-006 browser-titles=6 fixture-routes=2
[tdc-validator] scope3-stale-reference-sweep=PASS heldout-key=heldOutMinimumGain reconstruction-key=maxAbsoluteError nav-targets=unchanged
[tdc-validator] OK
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
RESULT: PASS (0 failures, 0 warnings)
RESULT: PASSED (0 warnings)
Files scanned: 7
Violations: 0
Warnings: 1
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
Managed-file integrity: downstream framework-managed files still match the installed upstream snapshot
G095: discovered-issue disposition clean (no unfiled deferrals)
```

The implementation-reality warning is the existing design-file fallback; it
resolved seven files and found zero violations. No deployment surface changed,
so the G081 deployment regression scan is `NOT_APPLICABLE`.

### TDD, Coverage, Process, And Containment Evidence

**Executed:** YES (in current session)
**Commands:** structured tool-log provenance audit; declaration-aware coverage probe; process ancestry/refined runner probe; pair/hash/staging containment probes
**Exit Codes:** 0 for all final probes; one initial process probe exited 1 before provenance classification
**Claim Source:** executed and interpreted
**Interpretation:** The initial process probe counted a persistent Playwright
`test-server`. An ancestry check proved it started before this phase under the
VS Code extension host. The refined check found zero retained CLI runners. This
diagnostic false positive changed no repository byte.

```text
redRows=2
red ts=2026-07-15T23:35:29Z exitCode=1 tags=bugfix,scope-01,red,TP-01-02,SCN-BUG002-001,adversarial
red ts=2026-07-15T23:37:12Z exitCode=1 tags=bugfix,scope-01,red,TP-01-05,SCN-BUG002-001,e2e-ui,adversarial
fixCommit=b11d9f0e41aeb74dc2825a99b7a2d086003dbab6 2026-07-16T09:35:08-07:00 fix market brief scheduled publication
functionalRegressionPresent=true
browserRegressionPresent=true
redBeforeFix=PASS
functionalDeclarations=14
browserDeclarations=1
collisionDeclarations=3
foundationDeclarations=5
acceptedCoverage=functional:14,browser:1,collision:3,foundation:5,selftest:491,inventory:132
currentCoverage=functional:14,browser:1,collision:3,foundation:5,selftest:491,inventory:133
coverageDrop=0
inventoryContractDrift=132->133
protectedAssertionSurface=PASS
retainedCliRunnerCount=0
vscodeTestServerCount=1
classification=NO_RETAINED_CLI_RUNNER
pairCoherent=PASS
digestDrift=ABSENT
stagedPaths=NONE
certificationSha256=fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958
```

All protected BUG-002/runtime hashes remained exact. The all-foreign dirty
aggregate changed only because the concurrently active Feature 005 owner wrote
its own `report.md` and `state.json`; Feature 005 source/tests and all Feature
010 surfaces remained byte-identical. This phase did not edit, restore,
normalize, stage, or use those foreign writes as a pass signal.

### Regression Finding Accounting And Verdict

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | Preserved unresolved from the concurrent test supersession: active planned Feature 005 SCN-005-028 changed the native inventory from 132 to 133. | `bubbles.plan` via existing `TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-01` |
| `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION` | New stable regression: both full inventory and exact isolated title fail because the current cache has truthfully aged to `stale` while the E2E requires `complete` without fixing evaluation time. | `bubbles.test` via `TR-BUG-002-F009-TEST-CLOCK-01` after planning reconciliation |
| `BUG002-RUNNER-PROBE-TEST-SERVER-001` | Addressed in-session: the apparent retained process is a pre-existing VS Code-owned `test-server`; refined matching found zero retained CLI runner. | none |
| `BUG002-REGRESSION-PHASE` | Unresolved: entry test evidence was superseded and the complete current inventory failed 132/133. No regression completion claim is recorded. | `bubbles.regression` after plan/test repair and a clean current replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not eligible and not executed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not eligible and not executed. | `bubbles.audit` after validation |

⚠️ REGRESSION_DETECTED

Two blocking current-profile findings remain: one planning-owned exact
cardinality drift and one test-owned Feature 009 clock drift. The BUG-002
behavior, parser, pair, source lock, isolation, portability, cross-spec
contracts, and protected hashes remain green, but they cannot replace a failed
complete browser profile.

```text
Regressions detected: 2
Categories: shared inventory contract; Feature 009 E2E evaluation clock
Cross-spec conflicts: 1
Design contradictions: 0
Coverage drop: 0 by registered executable counts
Fix cycle needed: YES
Required routing: bubbles.plan -> bubbles.test -> bubbles.regression
```

BUG-002 and SCOPE-01 remain `in_progress`. Regression, validation, audit,
certification, terminal bug status, and parent Feature 006 replay remain
unclaimed.

<!-- BUG002 regression attempt EOF -->
<!-- BUG002 regression attempt final boundary -->

## Feature 009 Clock Repair Corroboration And Fresh Replay Entry Sanity - 2026-07-18T21:59:59Z

**Agent:** `bubbles.test`
**Workflow mode:** `bugfix-fastlane`
**Resolved prerequisite:** `TR-BUG-002-F009-TEST-CLOCK-01`
**Next transition:** `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01`
**Claim Source:** executed

This invocation began while another authorized `bubbles.test` invocation was
finishing the same narrow clock transition. The initial source read observed the
pre-repair test, but the just-in-time hash baseline already contained the exact
two-line candidate at SHA-256
`8a52e745f55ae36000d77595f0bfc2e506e8ed48cbf8f7259f63449beef7237c`.
The candidate derives one evaluation instant one minute after the newer parsed
cache retrieval time and installs it with `page.clock.setFixedTime(...)` before
`page.addInitScript(...)` and before production navigation.

The concurrent owner recorded the required genuine pre-edit RED and the first
post-edit GREEN at [the Feature 009 transition receipt](../../009-msft-july-market-refresh/report.md#tr-bug-002-f009-test-clock-01-deterministic-browser-clock-repair-2026-07-18t215444z).
This invocation does not re-attribute that RED. Its own first exact execution
was green because the candidate was already present at the hash baseline. The
concurrent `state.json` routing update was preserved rather than overwritten;
its `certification` subtree remained SHA-256
`fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958`.

### Production Clock Seam

The production page retains the real Feature 009 clock boundary:

1. `boot()` captures exactly one `new Date().toISOString()` evaluation time.
2. `boot()` passes that value unchanged to `settleQuote` and `settleBars`.
3. Those functions call `msftValidateQuoteEnvelope(..., evaluationTime)` and
   `msftValidateBarsEnvelope(..., evaluationTime)`.
4. The validators retain the unchanged 24-hour quote and 48-hour/four-calendar-
   day bars freshness policies.

The test binds the browser clock before production boot. It does not write
`acceptedState`, replace `window.MsftJulyModel`, intercept a request, rewrite a
cache, or change a production threshold.

### Focused And Complete Feature 009 Browser Evidence

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-009-001/002/005 cache-first market truth" --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] quoteProviderAsOf=2026-07-17T15:59:59 quoteRetrievedAt=2026-07-17T20:48:17.970Z
[SCN-009-002] barsCutoff=2026-07-17 barsRetrievedAt=2026-07-17T20:48:12.303Z
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=393.79 dailyClose=393.82000732421875
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  ✓  1 ...:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (638ms)
  1 passed (2.2s)
```

**Result:** PASS. The unchanged `complete` assertion is green against real
same-origin cache reads, with zero provider requests and both forced shared-
write/report failure paths preserved.

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/msft-july-market-refresh.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
Running 1 test using 1 worker
[SCN-009-001] firstPaint=loading/loading quote=null technicalClose=null
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-001] quoteReportKeys=label,providerAsOf,retrievedAt,sharedWrite,sourceId
[SCN-009-001] barsReportKeys=cutoff,label,retrievedAt,rowCount,sharedWrite,sourceId
[SCN-009-002] modelAsOf=2026-07-06
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=393.79 dailyClose=393.82000732421875
[SCN-009-005] technicalOwners=close,sma20,sma50,sma200,high252,stack,signedDistances source=dailyRowsOnly
  ✓  1 ...:47:1 › Regression: SCN-009-001/002/005 cache-first market truth (544ms)
  1 passed (1.5s)
```

**Result:** PASS. The complete current Feature 009 browser file contains one
implemented Scope 1 test and passed it without selective omission.

### Feature 009 Functional And Source-Integrity Evidence

**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:** relevant contiguous Feature 009 window plus final command summary.

```text
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 bar validator accepts every actual daily row and exact bar clocks
  ✓ Feature 009 quote validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 bar validator rejects every closed failure class with its exact reason code
  ✓ Feature 009 daily close and SMA20/SMA50/SMA200 equal independent test math over actual daily rows
  ✓ Feature 009 High252 stack and signed distances equal independent test math over actual daily rows
  ✓ Feature 009 delayed quote differs from and never contaminates the last daily close
  ✓ Feature 009 short daily history exposes every unsupported technical as unavailable with a closed reason
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 accepted state preserves the model cutoff and daily-only technical ownership
  ✓ Feature 009 accepted state is deeply immutable across market truth branches
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only
================================================
Research-Lab self-test: 491 passed, 0 failed
================================================
```

**Result:** PASS.
**Executed:** YES (current session)
**Command:** `node -e '<17-check Feature 009 source-integrity audit>'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
FEATURE009_SOURCE_INTEGRITY_BEGIN
PASS: exact-title-once
PASS: cache-relative-clock
PASS: clock-set-once
PASS: clock-before-init-script
PASS: clock-before-production-navigation
PASS: complete-assertion-preserved
PASS: request-observer-preserved
PASS: zero-provider-request-assertion-preserved
PASS: shared-quote-failure-preserved
PASS: shared-bars-failure-preserved
PASS: shared-report-failure-preserved
PASS: no-request-interception
PASS: no-fixture-file-mutation
PASS: no-cache-envelope-mutation
PASS: no-production-controller-replacement
PASS: no-accepted-state-overwrite
PASS: no-skip-only-todo
checks=17
failed=0
FEATURE009_SOURCE_INTEGRITY_END
```

**Result:** PASS. The candidate changes test evaluation time only; all output,
request, fixture, shared-failure, title, and assertion contracts remain real.

### Shared Foundation And Discovery Entry Sanity

**Executed:** YES (current session)
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] apiIdentity=PASS
[playwright-runtime] outside=sibling-repo exit=1 borrowed=false
[playwright-runtime] outside=global-prefix exit=1 borrowed=false
[playwright-runtime] outside=npm-cache-hash exit=1 borrowed=false
[playwright-runtime] browserExecutableFallback=ABSENT
[playwright-runtime] externalPackageFallback=ABSENT
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**Result:** PASS.

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test --list --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:** bounded raw windows from lines 1-12 and 300-311 of the complete
311-line listing; the complete output was retained by the terminal runner.

```text
Listing tests:
  [system-chrome] › tests/bond-regime-lab.spec.mjs:75:1 › BS-001 duration-driven ratio improvement stays mixed
  [system-chrome] › tests/bond-regime-lab.spec.mjs:94:1 › BS-002 aligned ratios plus OAS confirmation are constructive
  [system-chrome] › tests/bond-regime-lab.spec.mjs:111:1 › BS-003 tight but widening keeps level and momentum separate
  [system-chrome] › tests/bond-regime-lab.spec.mjs:128:1 › BS-010 latest common date excludes unmatched leg
  [system-chrome] › tests/bond-regime-lab.spec.mjs:137:1 › BS-004 bull steepener retains defensive credit context
  ...
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:208:1 › Controls recompute one decision without any market-data request
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:221:1 › Power canvases carry aria-label and same-data table on desktop and mobile
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:236:1 › Registered Volatility Sizing tool publishes one owner read and Market Brief renders it without recompute
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:262:1 › TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL
Total: 133 tests in 12 files
NODE_SUITE_LEAK=ABSENT
```

**Result:** PASS. This is entry sanity only. The direct Feature 004 canary,
focused BUG-002 browser cases, and two complete 133/133 repetitions were not
executed here and remain owned by the fresh pending transition.

### Additional Quality Canaries

The checkout-local runner reported exactly `Version 1.61.1`.
`node scripts/validate-node-source-lock.mjs` passed the real manifest, `.npmrc`,
lockfile, exact graph, integrity, and all 16 adversarial source cases.
The MSFT page parser reported `OK page=msft-july-print-model.html inline=4 refs=50`.
The bugfix regression-quality guard reported zero violations and zero warnings.
The environment-pollution scan reported no test-to-production-surface writes.

### Finding And Routing Disposition

| Finding | Current disposition | Next owner |
| --- | --- | --- |
| `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION` | Addressed by the concurrent authorized test-only repair; independently corroborated here without a duplicate RED claim. | none |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | Planning contract is 133 in 12 and entry sanity is green; complete independent replay remains absent. | `bubbles.test` via `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01` |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Foundation and listing are green; the complete ordered replay is still required. | `bubbles.test` |
| `BUG002-BROAD-E2E-INSTABILITY` | Not tested by two complete inventories in this invocation. | `bubbles.test` |
| `BUG002-INDEPENDENT-VERIFICATION` | Not complete; this invocation intentionally stops at entry sanity. | `bubbles.test` |
| `BUG002-REGRESSION-PHASE` | Not executed and remains blocked by the pending independent replay. | `bubbles.regression` after test replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed. | `bubbles.audit` after validation |

`TR-BUG-002-F009-TEST-CLOCK-01` remains resolved. The current route is the
fresh pending `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01`; it must begin
again at the immediate foundation command and execute its complete ordered
sequence. BUG-002, SCOPE-01, regression, validation, audit, certification, and
Feature 009 completion remain unclaimed.

### JSON, Artifact, And Traceability Validation

**Executed:** YES (current session)
**Command:** `node -e '<BUG-002 routing/report/certification assertions>' && git diff --check -- specs/_bugs/BUG-002-market-brief-session-date-drift/report.md specs/_bugs/BUG-002-market-brief-session-date-drift/state.json`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
BUG002_ROUTING_JSON_VALIDATION_BEGIN
PASS: state-json-parse
PASS: report-anchor
PASS: clock-transition-resolved
PASS: clock-evidence-linked
PASS: inventory-transition-pending
PASS: inventory-evidence-linked
PASS: entry-sanity-foundation
PASS: entry-sanity-cardinality
PASS: entry-sanity-no-node-leak
PASS: complete-replay-unclaimed
PASS: next-route-preserved
PASS: certification-unchanged
certificationSha256=fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958
checks=12
failed=0
BUG002_ROUTING_JSON_VALIDATION_END
```

**Result:** PASS.

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-002-market-brief-session-date-drift`
**Exit Code:** 0
**Claim Source:** executed
**Output:** relevant contiguous final gate window.

```text
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
⚠️  state.json uses deprecated field 'scopeProgress' — see scope-workflow.md state.json canonical schema v2
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

**Result:** PASS with the existing non-blocking deprecated `scopeProgress`
warning; this invocation did not modify that foreign schema field.

**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-002-market-brief-session-date-drift`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: scripts/selftest.mjs
✅ scenario-manifest.json linked test exists: tests/feature-004-dirty-tree-collision.test.mjs
✅ scenario-manifest.json linked test exists: tests/playwright-runtime.foundation.functional.mjs
✅ scenario-manifest.json linked test exists: playwright.config.mjs
✅ scenario-manifest.json records evidenceRefs
✅ All linked tests from scenario-manifest.json exist
✅ Scope 1: SCOPE-01 Atomic Market Brief Publication scenario mapped to Test Plan row: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
ℹ️  Scope 1: SCOPE-01 Atomic Market Brief Publication scenario→row match confidence: declared
✅ Scope 1: SCOPE-01 Atomic Market Brief Publication scenario maps to concrete test file: scripts/selftest.mjs
✅ Scope 1: SCOPE-01 Atomic Market Brief Publication report references concrete test evidence: scripts/selftest.mjs
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ Scope 1: SCOPE-01 Atomic Market Brief Publication scenario maps to DoD item: SCN-BUG002-001 failed rollover retains the last coherent Market Brief pair
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 14
ℹ️  Scenario-to-row mappings: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
RESULT: PASSED (0 warnings)
```

**Result:** PASS.

<!-- BUG002 F009 clock corroboration and replay-entry sanity EOF -->

## Current 133-Test Independent Replay And Regression Route - 2026-07-18T22:11:24Z

**Phase:** test
**Agent:** `bubbles.test`
**Workflow:** top-level `bubbles.goal` direct-authorized-runner / `bugfix-fastlane`
**Transition:** `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01`
**Outcome:** `completed_owned` for the test phase only; `route_required` to the existing regression transition
**Claim Source:** executed

This replay started only after the Feature 009 prerequisite
`TR-BUG-002-F009-TEST-CLOCK-01` was resolved with its genuine RED and identical
focused GREEN in the Feature 009 report. It changed no source, test, config,
framework, Feature 004/005/006/009/010, or unrelated byte. BUG-002 and SCOPE-01
remain `in_progress`; certification remains unchanged; regression, validation,
audit, terminal bug completion, and the parent Feature 006 replay are not
claimed.

### Historical 132 Boundary

Every earlier `132/132` observation remains historical evidence for the exact
browser inventory present at that execution time. It is neither deleted nor
relabelled. The active planning contract is now the truthful current inventory:
`133` browser assertions in 12 `.spec.mjs` files, two excluded direct-Node
`.test.mjs` suites, 12 shared-runtime imports, and matcher `**/*.spec.mjs`.
Only the current replay below supports the present test-phase route.

### Pre-Run Protected Boundary

**Executed:** YES (current session)
**Commands:** repository/path-scoped status, SHA-256, index, staged/unstaged diff, and accepted four-part boundary inspection
**Exit Code:** 0
**Claim Source:** executed
**Output:** current protected-byte window from the complete pre-run snapshot.

```text
BUG002_PRE_RUN_PROTECTED_HASHES_BEGIN
f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655  playwright.config.mjs
32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26  tests/playwright-runtime.foundation.functional.mjs
83e2558c263e23af68972c1bb29e01aa5a4844ff455c820043004ec1a1a0667d  tests/feature-004-dirty-tree-collision.test.mjs
071906cd9cad9168e35b35997c0b5c398c767ed7df9d40d44cd7de8a04b405aa  tests/brief-refresh-atomicity.test.mjs
b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc  tests/market-brief-session-date-drift.spec.mjs
4f34d4a34fd681fa0b2a0bd18793cbfe8d638f236caf08ee43bd3f2c3fec259c  tests/palm-springs-rental-market-lab.spec.mjs
8a52e745f55ae36000d77595f0bfc2e506e8ed48cbf8f7259f63449beef7237c  tests/msft-july-market-refresh.spec.mjs
0ace0f37c9f00f34b89bc60b49d91a760e5ea10a03ebd7f602028a42299cdde4  tests/brief-refresh-atomicity.support.mjs
642e8f7c9f09ede6675cc8ec2514fc27deb80fc255549f94330023aa78bec181  scripts/brief-refresh-and-push.sh
c79327f323af4e1f767f58296bba64a38ac610248acfdbd005f88f982da3e206  market-brief.payload.json
e077e8b9abd6b29178df15113cba66d6c77ca7603e99d1fe97216f9f3081eb2b  market-brief.snapshot.json
05af3837f215aee4c6a0d8bf8ee3da57156c18816a58709c971a5a1fda7fad7b  brief-history.jsonl
519ec91a3531c7e8375860392f23d0672f6fe2babd09643a834a681260fbd96b  scripts/selftest.mjs
70b68b970551e2473aab3817bf8cde6480d6ff2641cde9cbf2823ede2a69d0d4  tests/playwright-runtime.mjs
BUG002_PRE_RUN_STAGED_NAME_STATUS_BEGIN
BUG002_PRE_RUN_STAGED_NAME_STATUS_END
BUG002_PRE_RUN_PROTECTED_HASHES_END
```

The unstaged boundary contained exactly the three accepted files. Its four
conceptual rollback elements were the matcher addition, paired foundation
assertions including the static-or-dynamic `node:test` predicate, the BUG-002
shared-runtime import, and no neighboring staged byte.

### Ordered Immediate Check And Gates 1-5

**Executed:** YES (current session)
**Commands:** exact immediate TP-01-12; TP-01-11; TP-01-12; TP-01-13; TP-01-05; TP-01-06 commands from the active Test Plan
**Exit Codes:** 0; 0; 0; 0; 0; 0
**Claim Source:** executed
**Output:** raw runner signals from the ordered commands.

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
ℹ tests 5
ℹ pass 5
ℹ fail 0
✔ Feature 004 preserves every pre-existing dirty hunk
✔ Feature 004 collision disposition parser fails closed on malformed records
✔ Feature 004 preserves the historical validator prefix, tracked transition, and volatile config boundary
ℹ tests 3
ℹ pass 3
ℹ fail 0
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] discoveryTaxonomy=PASS
ℹ tests 5
ℹ pass 5
ℹ fail 0
Listing tests:
  [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
  [system-chrome] › tests/msft-july-market-refresh.spec.mjs:47:1 › Regression: SCN-009-001/002/005 cache-first market truth
  [system-chrome] › tests/palm-springs-rental-market-lab.spec.mjs:518:1 › Regression: SCN-005-028 remaining-2026 and 2027 scenarios remain falsifiable not factual
Total: 133 tests in 12 files
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  1 passed (3.2s)
Running 1 test using 1 worker
  ✓  1 …r serves prior-session actions beside an advanced Tier-A snapshot
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
[BUG002_PW_STAGE] worker=0 stage=process-exit
  1 passed (2.7s)
```

The unrestricted listing began at Playwright's `Listing tests:` output. It
contained only `.spec.mjs` browser entries and emitted no Feature 004/TAP or
`.test.mjs` prelude.

### Functional And Integration Obligations

**Executed:** YES (current session)
**Commands:** `node --test tests/brief-refresh-atomicity.test.mjs`; `node scripts/validate-brief-payload.mjs`; `node scripts/selftest.mjs`; `bash -n scripts/brief-refresh-and-push.sh`
**Exit Codes:** 0; 0; 0; 0
**Claim Source:** executed
**Output:** raw final windows from the complete commands.

```text
✔ Regression BUG-002: target-date rollover retains the last coherent pair when Tier B fails
✔ same-target retained Tier B publishes candidate Tier A with visible payload staleness
✔ matching generated Tier B advances snapshot payload and history together
✔ failed narrative attempt restores config before a successful retry
✔ dirty owned publication path refuses before every external boundary
✔ scheduled launcher publishes from an isolated checkout while developer-owned output is dirty
✔ staged owned publication path refuses without changing its index entry
✔ untracked owned data path refuses before every external boundary
✔ invalid clean baseline refuses before every external boundary
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair
✔ unrelated staged and unstaged dirt remains byte and index identical
✔ forced final validation failure restores every owned baseline byte and index path
ℹ tests 14
ℹ pass 14
ℹ fail 0
ℹ skipped 0
ℹ todo 0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Feature 009 Scope 1 cache-owned MSFT market truth
  ✓ Feature 009 quote validator accepts the actual cache value and exact quote clocks
  ✓ Feature 009 accepted state keeps model quote bar retrieval and evaluation clocks distinct with no ambiguous data_as_of
  ✓ Feature 009 production-validated quote replacement changes quote-owned fields only
Research-Lab self-test: 491 passed, 0 failed
Bash parse exit: 0 (silent success)
```

### Gates 6 And 7 - Complete Current Browser Inventory

**Executed:** YES (current session)
**Command repeated twice:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Codes:** 0; 0
**Claim Source:** executed
**Output:** exact end-state and lifecycle lines from the two complete terminal spill records.

```text
GATE6_SPILL_CLOSE_MARKERS_BEGIN
160:[BUG002_PW_STAGE] worker=3 stage=process-runner-close-begin
202:[BUG002_PW_STAGE] worker=3 stage=process-runner-close-end
205:[BUG002_PW_STAGE] worker=3 stage=process-exit
537:[BUG002_PW_STAGE] worker=2 stage=process-runner-close-begin
579:[BUG002_PW_STAGE] worker=2 stage=process-runner-close-end
582:[BUG002_PW_STAGE] worker=2 stage=process-exit
982:[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
1024:[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
1027:[BUG002_PW_STAGE] worker=0 stage=process-exit
1029:  133 passed (19.6s)
GATE6_SPILL_GREP_EXIT=0
GATE6_SPILL_CLOSE_MARKERS_END
GATE7_SPILL_CLOSE_MARKERS_BEGIN
469:[BUG002_PW_STAGE] worker=2 stage=process-runner-close-begin
511:[BUG002_PW_STAGE] worker=2 stage=process-runner-close-end
514:[BUG002_PW_STAGE] worker=2 stage=process-exit
982:[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
1024:[BUG002_PW_STAGE] worker=0 stage=process-runner-close-end
1027:[BUG002_PW_STAGE] worker=0 stage=process-exit
1029:  133 passed (18.3s)
GATE7_SPILL_GREP_EXIT=0
GATE7_SPILL_CLOSE_MARKERS_END
```

The final corrected lifecycle probe observed balanced close/exit counts
(`3/3` then `2/2`), one `133 passed` summary per repetition, zero force-kill or
non-test-error signatures, zero Node canary/TAP preludes, and
`retainedCliRunnerCount=0`. One hour-old VS Code-owned Playwright `test-server`
remained and was classified separately from a CLI test runner.

### Test Integrity And Governance

**Executed:** YES (current session)
**Commands:** bugfix regression-quality guard for the three BUG-002 test files; environment-pollution scan; Node source-lock validator; macOS portability guard; BUG-002 artifact lint; BUG-002 traceability guard
**Exit Codes:** 0 for every command
**Claim Source:** executed
**Output:** raw command summaries.

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 2
[env-pollution-scan] env-pollution-scan PASSED (no test-to-prod-surface writes detected)
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
ok   class-1 raw-timeout: none
ok   class-2 in-place-sed: none
ok   class-3 date-d-parse: none
ok   class-4 stat-c-mtime: none
ok   class-5 readlink-f-absolutize: none
ok   class-6 grep-pcre: none
ok   class-7 bracket-v-isset: none
ok   class-8 mapfile-readarray: none
ok   class-9 mktemp-suffix: none
ok   class-10 df-output: none
ok   class-11 bin-true-false: none
ok   class-12 paste-no-stdin-operand: none
ok   class-13 date-nanoseconds: none
PASS: the scanned surface is WSL+macOS portable.
Artifact lint PASSED.
Scenarios checked: 1
Test rows checked: 14
Scenario-to-row mappings: 1
DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
RESULT: PASSED (0 warnings)
```

Artifact lint retained one pre-existing non-blocking advisory for deprecated
`scopeProgress`; certification and that foreign schema field were not changed.

### Protected-Byte Containment

**Executed:** YES (current session)
**Command:** post-replay SHA-256/status/staging and four-part boundary comparator
**Exit Code:** 0
**Claim Source:** executed
**Output:** final comparator summary; all 14 paths also printed their exact
matching SHA-256 and status in the complete command output.

```text
PASS protectedStaging=NONE
PASS fourHunkBoundary=matcher
PASS fourHunkBoundary=foundation-config-import
PASS fourHunkBoundary=foundation-static-or-dynamic-node-predicate
PASS fourHunkBoundary=bug002-shared-runtime-import
PASS fourHunkBoundary=exact-three-boundary-files
PASS hash path=tests/msft-july-market-refresh.spec.mjs sha256=8a52e745f55ae36000d77595f0bfc2e506e8ed48cbf8f7259f63449beef7237c
PASS hash path=tests/palm-springs-rental-market-lab.spec.mjs sha256=4f34d4a34fd681fa0b2a0bd18793cbfe8d638f236caf08ee43bd3f2c3fec259c
PASS hash path=tests/market-brief-session-date-drift.spec.mjs sha256=b3f128faa1a2448d2e2f355b28c5852f72421e7f6774bcf07f33e9f1f82972bc
PASS hash path=tests/playwright-runtime.foundation.functional.mjs sha256=32631efbab203c90fab9fdd64ce6e0f4896c4d1bdfce004f20d75b3dd3b84e26
PASS hash path=playwright.config.mjs sha256=f27a2517053ab1127d5be43637fd0993023e18147b72fb2584b2f11156225655
failed=0
BUG002_POST_REPLAY_PROTECTED_BYTES_END
```

### Diagnostic Probe Accounting

Two read-only lifecycle probes exited `1` after both exact browser commands had
already passed. The first matched VS Code's pre-existing `test-server` as a CLI
runner and assumed unwrapped spill text. The second correctly excluded that
process but incorrectly required exactly one close sequence per multi-worker
run. Direct spill inspection showed balanced close/end/exit records, and the
third probe passed with the correct invariant. Finding
`BUG002-LIFECYCLE-PROBE-ASSUMPTION-001` is addressed by that corrected probe;
neither diagnostic changed repository bytes or relabelled the two test results.

### Current Test Finding Accounting And Route

| Finding | Current test disposition | Next owner |
| --- | --- | --- |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | Test-verified resolved: unrestricted discovery is exactly 133 tests in 12 `.spec.mjs` files. Historical 132 evidence remains historical. | none |
| `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION` | Resolved prerequisite corroborated by the 491/491 selftest and both complete 133/133 browser repetitions. | none |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Test-verified resolved: immediate and Gate 2 foundation are 5/5; Gate 1 is 3/3; discovery proves 12 browser files, two excluded Node suites, 12 shared importers, and the `.spec.mjs` matcher. | none |
| `BUG002-BROAD-E2E-INSTABILITY` | Test-verified resolved for the current bytes: both exact repetitions passed 133/133, returned naturally, emitted balanced close/exit records, and left zero CLI runner. | none |
| `BUG002-INDEPENDENT-VERIFICATION` | Test-verified resolved for the test phase: every ordered behavioral, functional, integration, integrity, and governance command passed. | none |
| `BUG002-LIFECYCLE-PROBE-ASSUMPTION-001` | Addressed in-session by the corrected spill/process classifier. | none |
| `BUG002-REGRESSION-PHASE` | Open and not executed by this phase. | `bubbles.regression` via existing `TR-BUG-002-REGRESSION-01` |
| `BUG002-VALIDATE-CERTIFICATION` | Open and not executed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Open and not executed. | `bubbles.audit` after validation |

`TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01` is resolved under test
ownership and routes to the existing `TR-BUG-002-REGRESSION-01`. This is a
test-phase `completed_owned` claim only. It is not a scope, bug, regression,
validation, audit, certification, or parent Feature 006 completion claim.

<!-- BUG002 current 133 independent replay EOF -->
<!-- BUG002 report terminal newline -->

## Fresh 133-Test Reliability Supersession And Implementation Rework Route - 2026-07-18T22:27:44Z

**Phase:** test
**Agent:** `bubbles.test`
**Workflow:** top-level `bubbles.goal` direct-authorized runner / `bugfix-fastlane`
**Transition:** `TR-BUG-002-TEST-BROWSER-INVENTORY-CARDINALITY-01`
**Outcome:** `route_required`
**Claim Source:** executed

This replay began at `2026-07-18T22:13:20Z` while another authorized test
writer was finishing the preceding clean 133-test receipt. That concurrent
receipt and its evidence remain preserved above. This later exact execution is
the current reliability observation: repetition 1 exited cleanly at `133/133`,
but repetition 2 passed all 133 assertions and then failed the mandatory
lifecycle contract when worker 0 did not exit within 300 seconds, was
force-killed twice, and produced two errors outside tests. Passing assertions
do not override a non-clean Playwright exit.

BUG-002 and SCOPE-01 remain `in_progress`. The current test-phase claim is
lowered, regression is re-blocked, and the recurring lifecycle finding routes
to `bubbles.implement` through `TR-BUG-002-IMPLEMENT-REWORK-03`. No source,
test, config, planning, certification, framework, or foreign-feature byte was
edited during test execution.

### Ordered Matrix Through First Failure

| Step | Exact result | Disposition |
| --- | --- | --- |
| Immediate shared foundation | `5/5`, zero failed/skipped/todo | PASS |
| Feature 004 direct canary | `3/3`, zero failed/skipped/todo | PASS |
| Gate 2 shared foundation | `5/5`, zero failed/skipped/todo | PASS |
| Unrestricted Playwright listing | exactly `133` tests in 12 `.spec.mjs` files; two `.test.mjs` suites excluded | PASS |
| Exact BUG-002 browser title | `1/1`, graceful `process-exit` | PASS |
| Complete BUG-002 browser file | `1/1`, graceful `process-exit` | PASS |
| BUG-002 atomicity matrix | `14/14`, zero failed/skipped/todo | PASS |
| Payload validator | contract PASS | PASS |
| Repository selftest | `491/491`, zero failed | PASS |
| Bash parse | silent exit 0 | PASS |
| Exact Feature 009 browser title | `1/1`, graceful `process-exit` | PASS |
| Complete Feature 009 browser file | `1/1`, graceful `process-exit` | PASS |
| Full system-Chrome repetition 1 | `133/133`, clean exit; observed worker IDs `0,2` each closed and exited | PASS |
| Full system-Chrome repetition 2 | `133/133`, then two worker-0 force-kill errors outside tests after 300 seconds | FAIL; stop boundary |

### Shared Foundation And Discovery Evidence

**Executed:** YES (current session)
**Commands:** immediate and Gate 2 `node --test tests/playwright-runtime.foundation.functional.mjs`; `node --test tests/feature-004-dirty-tree-collision.test.mjs`; unrestricted Playwright `--list`
**Exit Codes:** 0; 0; 0; 0
**Claim Source:** executed
**Output:**

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
foundation immediate: tests=5 pass=5 fail=0 skipped=0 todo=0
Feature 004 canary: tests=3 pass=3 fail=0 skipped=0 todo=0
foundation Gate 2: tests=5 pass=5 fail=0 skipped=0 todo=0
Listing tests:
Total: 133 tests in 12 files
listing assertion: .test.mjs=ABSENT TAP=ABSENT Feature004Prelude=ABSENT retry=ABSENT
```

**Result:** PASS. The browser inventory and shared-runtime boundary are current
and independently verified; this finding is not the failing surface.

### Focused Functional And Browser Evidence

**Executed:** YES (current session)
**Commands:** exact and complete BUG-002 browser commands; atomicity matrix; payload validator; repository selftest; Bash parse; exact and complete Feature 009 browser commands
**Exit Codes:** all 0
**Claim Source:** executed
**Output:**

```text
BUG-002 exact browser title: 1 passed
BUG-002 complete browser file: 1 passed
BUG-002 browser lifecycle: process-runner-close-end; process-exit
atomicity tests=14 pass=14 fail=0 skipped=0 todo=0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Research-Lab self-test: 491 passed, 0 failed
Bash parse: exit 0
[SCN-009-001] cacheRequests=quote:1,bars:1 providerRequests=0
[SCN-009-001] sharedWriteFailures=quote:1,bars:1 reportFailures=2
[SCN-009-002] uniqueClocks=6 data_as_of=absent
[SCN-009-005] dailyRows=501 quote=393.79 dailyClose=393.82000732421875
Feature 009 exact browser title: 1 passed
Feature 009 complete browser file: 1 passed
Feature 009 browser lifecycle: process-runner-close-end; process-exit
```

**Result:** PASS. The BUG-002 behavior and Feature 009 deterministic clock
repair remain focused-green on the same bytes used by both broad repetitions.

### Full Repetition 1

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Output:** corrected full-spill lifecycle receipt.

```text
PASS: summary-133
PASS: natural-worker-markers-present
PASS: worker-close-cardinality
PASS: worker-exit-cardinality
PASS: no-failed-summary
PASS: no-force-kill
PASS: no-non-test-error
PASS: no-retry
PASS: no-node-suite
PASS: no-digest-drift
observedWorkerIds=0,2
processRunnerCloseEnd=2
processExit=2
transcriptLines=1032
failed=0
```

**Result:** PASS. The exact unrestricted command passed `133/133` and every
observed worker reached both close-end and process-exit without retry or
out-of-test error.

### Full Repetition 2 - First Failure

**Executed:** YES (current session)
**Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Output:** verbatim terminal tail from the exact process after VS Code moved
the still-running command to background during its five-minute quiet wait.

```text
  ✓  133 ... landmarks names focus and noncolor states at 390 and 1440 widths (327ms)
[BUG002_PW_STAGE] worker=0 stage=process-runner-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-graceful-close-begin
[BUG002_PW_STAGE] worker=0 stage=worker-stop-end
[BUG002_PW_STAGE] worker=0 stage=load-if-needed-begin
[BUG002_PW_STAGE] worker=0 stage=load-if-needed-end
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-begin
[BUG002_PW_STAGE] worker=0 stage=test-fixture-teardown-end
[BUG002_PW_STAGE] worker=0 stage=worker-fixture-teardown-begin
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=_reuseContext stage=begin
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=_reuseContext stage=end
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=_optionContextReuseMode stage=begin
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=_optionContextReuseMode stage=end
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=video stage=begin
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=video stage=end
[BUG002_PW_FIXTURE] worker=0 scope=worker fixture=browser stage=begin
Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-0 process did not exit within 300000ms after stop, force-killed it

  133 passed (5.3m)
  2 errors were not a part of any test, see above for details
```

**Result:** FAIL. This is the same recurrent worker-0 lifecycle failure class
previously routed through implementation rework. No retry was attempted and no
worker, inventory, project, or command option was narrowed.

### Fail-Fast Boundary

**Claim Source:** not-run

The remaining requested integrity/governance matrix was not executed after the
first failing gate: regression-quality, interception/mock/skip/todo/bailout
audit, environment pollution, Node source lock, macOS portability, artifact
lint, traceability, diff check, final protected-hash/status/staging comparison,
diagnostics, and retained-runner classification. No pass claim is made for
those commands in this invocation. Their preceding concurrent evidence remains
historical and is not reused as current-session proof.

### Finding Accounting And Route

| Finding | Current disposition | Required owner |
| --- | --- | --- |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | Addressed: current discovery is exactly 133 tests in 12 browser files. | none |
| `BUG002-F009-CACHE-CLOCK-DRIFT-REGRESSION` | Addressed: exact and complete Feature 009 browser checks passed `1/1`. | none |
| `BUG002-SHARED-PLAYWRIGHT-DISCOVERY-BOUNDARY` | Addressed: foundation `5/5`, canary `3/3`, foundation `5/5`, and listing contract all passed. | none |
| `BUG002-BROAD-E2E-INSTABILITY` | Reopened: repetition 2 force-killed worker 0 twice after all 133 assertions passed and emitted two non-test errors. | `bubbles.implement` via `TR-BUG-002-IMPLEMENT-REWORK-03` |
| `BUG002-INDEPENDENT-VERIFICATION` | Reopened: the ordered matrix stopped at the failing second broad repetition. | `bubbles.test` after implementation rework |
| `BUG002-REGRESSION-PHASE` | Blocked by the current reliability failure; not executed. | `bubbles.regression` only after a fresh clean test replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed. | `bubbles.audit` after validation |

**Test verdict:** `NOT_TESTED` for current completion purposes. The concurrent
clean run remains valid historical evidence, but the fresher exact failure
prevents a current test-phase claim. Certification SHA-256 remains
`fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958`.

<!-- BUG002 fresh 133 reliability supersession EOF -->
<!-- BUG002 reliability supersession terminal marker -->

## Implementation Rework 03 Lockfile Restoration And Overlap Containment - 2026-07-18T22:53:57Z

**Phase:** implement
**Agent:** `bubbles.implement`
**Workflow:** top-level `bubbles.goal` direct-authorized runner / `bugfix-fastlane`
**Transition:** `TR-BUG-002-IMPLEMENT-REWORK-03`
**Outcome:** `route_required`
**Claim Source:** executed

This implementation rework made no committed source, test, configuration,
planning, framework, certification, or foreign-feature change. It audited all
12 browser-suite server lifecycles, every shared server close helper, and every
manual browser context. All repository-owned servers are awaited; inline HTTP
servers call `closeAllConnections()`; the BUG-002 server closes from `finally`;
and all manually created contexts close. The failing instrumented trace had
already completed test-scope teardown and reached Playwright's built-in worker
`browser` fixture, so a committed repository fixture leak is not supported.

### Root-Cause Discrimination

| Candidate | Current evidence | Disposition |
| --- | --- | --- |
| Repository-owned fixture/server/context leak | All 12 servers and all manual contexts have awaited close paths; focused BUG-002 title and complete file each left zero runner/browser processes. | Not supported on current bytes. |
| Dirty ignored Playwright after-image | `BUG002_PW_STAGE` / `BUG002_PW_FIXTURE` existed in two ignored package files and their hashes differed from a lockfile restore. | Proven environment drift; repaired through `npm ci`, not by hand-editing `node_modules`. |
| Concurrent machine saturation / overlapping Playwright | Load reached `18.97` and then `17.96`; another exact full run owned PID 57895/57916 with five workers and 30 Chrome processes. Two restore attempts refused; the first post-restore full-run gate later found two runners and 36 browser processes. | Directly proven; current stop boundary. |
| Genuine Playwright/Chrome teardown race | The prior failure stalled in built-in `browser` teardown, but no clean-package, no-overlap two-run reproduction was completed in this invocation. | Not established and not ruled out; fresh independent replay required. |

The local hypothesis was that the recurrent force-kill required both a dirty
ignored Playwright after-image and overlapping machine load, rather than a
committed fixture leak. The cheap falsifier was a source-locked `npm ci`
restore followed by the unchanged matrix under a zero-overlap gate. The package
restore and all checks through Bash parse passed. The first exact full-run
preflight then refused before launch because a concurrent run had already
started. Per the fail-fast contract, neither full repetition nor any later
governance check is claimed here.

### Process And Overlap Evidence

**Executed:** YES
**Claim Source:** executed
**Output:**

```text
BUG002_REWORK03_PROCESS_BASELINE_BEGIN
2026-07-18T22:43:18Z
15:43  up 2 days,  2:21, 3 users, load averages: 18.97 11.81 8.99
63482 ... node_modules/playwright/cli.js test-server -c playwright.config.mjs --host 127.0.0.1
BUG002_REWORK03_PROCESS_BASELINE_END
BUG002_REWORK03_OVERLAP_OWNER_BEGIN
2026-07-18T22:46:12Z
15:46  up 2 days,  2:24, 3 users, load averages: 17.96 12.17 9.51
playwrightRelatedRunnerCount=3
playwrightBrowserProcessCount=30
57895 28239 57895 S+ ... npm exec playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list
57916 57895 57895 S+ ... node /Users/pkirsanov/Projects/research-lab/node_modules/.bin/playwright test --config=playwright.config.mjs --project=system-chrome --reporter=list
57922 57916 57895 ... node .../node_modules/playwright/lib/worker/workerProcessEntry.js
57925 57916 57895 ... node .../node_modules/playwright/lib/worker/workerProcessEntry.js
57926 57916 57895 ... node .../node_modules/playwright/lib/worker/workerProcessEntry.js
57924 57916 57895 ... node .../node_modules/playwright/lib/worker/workerProcessEntry.js
57921 57916 57895 ... node .../node_modules/playwright/lib/worker/workerProcessEntry.js
BUG002_REWORK03_LOCKFILE_RESTORE_REFUSED_OVERLAP
Command exited with code 75
```

The persistent PID 63482 is VS Code's Playwright test-server and had no
Playwright-profile browser child at the successful restore boundary. It was not
killed or modified. The exact full runner and its browser processes belonged to
another terminal and were also left untouched.

### Source-Locked Package Restoration

**Executed:** YES
**Commands:** `node scripts/validate-node-source-lock.mjs`; guarded `npm ci`;
`npx --no-install playwright --version`; `npm ls playwright playwright-core --depth=0`
**Exit Codes:** 0; 0; 0; 0
**Claim Source:** executed
**Output:**

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
activePlaywrightRunnerCount=0
activePlaywrightBrowserProcessCount=0
BUG002_REWORK03_FINAL_OVERLAP_GATE_CLEAR
added 3 packages, and audited 4 packages in 418ms
found 0 vulnerabilities
BUG002_REWORK03_FINAL_OVERLAP_GATE_RESTORED
```

Exact package hashes changed only on the two locally instrumented ignored
files. Committed source-lock surfaces and Playwright package identity remained
unchanged:

```text
before common/index.js                 baf100298d13967098f9321c2697c0174da80d9060f8bb219d2e37171c14038b
after  common/index.js                 f06ef2600a7ec53a67dc86e3f3ef809b7df3d81a848f5cad35a81675f531a321
before worker/workerProcessEntry.js    8fb1fee4cd1aefd9ff7fa07510fe4e3d8663639629332d8b285da07ce47df4bb
after  worker/workerProcessEntry.js    e8b654850c073df3996816eb09edf845490d9a6e75785477a9ddb69d586cca54
before/after playwright/package.json   6b840268612656f0639fb7d68782e8353bdf11518589d30ddf66f283c2670ed5
before/after package.json              6897a3e4afa6cb6d255860bbfbaf756d012e0a87faa5c23d7717af96a3af9e9d
before/after package-lock.json         0cd1a537e3601fcf4993cea14b03c59d219c4a1e8c0b4b60bd6ee440253b070b
before/after .npmrc                    e414f7c7e7f51a71dde1ddf1f65892d01fe482bcca95846a3a349ff0a20903c6
restored marker search                 zero BUG002_PW_STAGE / BUG002_PW_FIXTURE matches
restored runtime                       Version 1.61.1
restored dependency tree               playwright@1.61.1
```

### Ordered Validation Through First Unresolved Gate

| Step | Result | Disposition |
| --- | --- | --- |
| Immediate shared foundation | `5/5` | PASS |
| Feature 004 direct canary | `3/3` | PASS |
| Unrestricted discovery | exactly `133` tests in 12 files | PASS |
| Exact BUG-002 browser title | `1/1`; zero pre/post runner/browser processes | PASS |
| Complete BUG-002 browser file | `1/1`; zero pre/post runner/browser processes | PASS |
| Atomicity matrix | `14/14` | PASS |
| Pair validator | contract PASS | PASS |
| Repository selftest | `491/491` | PASS |
| Bash parse | exit 0 | PASS |
| Full repetition 1 | not launched; preflight saw two external runners and 36 browser processes | STOP / route |
| Full repetition 2 and later governance matrix | not run | NOT RUN |

**Claim Source:** executed
**Output:**

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
foundation: tests=5 pass=5 fail=0 skipped=0 todo=0
Feature 004: tests=3 pass=3 fail=0 skipped=0 todo=0
Total: 133 tests in 12 files
BUG-002 exact title: 1 passed; postActiveRunnerCount=0; postActiveBrowserProcessCount=0
BUG-002 complete file: 1 passed; postActiveRunnerCount=0; postActiveBrowserProcessCount=0
atomicity: tests=14 pass=14 fail=0 skipped=0 todo=0
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
Research-Lab self-test: 491 passed, 0 failed
BUG002_REWORK03_BASH_PARSE_PASS
BUG002_REWORK03_FULL_REPETITION_1_BEGIN
2026-07-18T22:52:23Z
15:52  up 2 days,  2:30, 3 users, load averages: 11.76 12.81 11.41
preActiveRunnerCount=2 preActiveBrowserProcessCount=36
```

The full Playwright invocation did not start after that preflight, so no
repetition result, force-kill absence, retained-handle absence, pollution,
portability, regression-quality, diagnostics, protected-hash, final status, or
final diff pass is claimed for the post-stop portion of this invocation.

### Finding Accounting And Route

| Finding | Disposition |
| --- | --- |
| `BUG002-PLAYWRIGHT-AFTERIMAGE-DRIFT` | Addressed: lockfile-faithful `npm ci` removed all local instrumentation while preserving exact Playwright 1.61.1 and committed source-lock hashes. |
| `BUG002-CONCURRENT-PLAYWRIGHT-OVERLAP` | Contained, not globally resolved: three independent observations found external exact Playwright runs and high load. The successor must refuse to start unless runner/browser counts are zero. |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved until two clean no-overlap full repetitions complete on the restored package. |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved; implementation evidence cannot substitute for a fresh `bubbles.test` replay. |
| `BUG002-REGRESSION-PHASE` | Blocked by `TR-BUG-002-TEST-REWORK-03`. |
| `BUG002-VALIDATE-CERTIFICATION` / `BUG002-AUDIT-CERTIFICATION` | Not run and not claimed. |

`TR-BUG-002-IMPLEMENT-REWORK-03` resolves as `route_required`, not as bug or
scope completion. Fresh transition `TR-BUG-002-TEST-REWORK-03` restarts at the
immediate foundation command, requires the complete ordered matrix and two
unchanged full repetitions under a zero-overlap precondition, and changes no
source, test, config, package, planning, framework, or certification byte.
BUG-002 and SCOPE-01 remain `in_progress`; certification remains unchanged.

<!-- BUG002 implementation rework 03 EOF -->
<!-- BUG002 implementation rework 03 terminal marker -->
<!-- BUG002 report EOF -->

## No-Overlap Test Rework 03 Gate 3 Inventory Refusal - 2026-07-18T23:09:14Z

**Phase:** test
**Agent:** `bubbles.test`
**Workflow:** top-level `bubbles.goal` direct-authorized runner / `bugfix-fastlane`
**Transition:** `TR-BUG-002-TEST-REWORK-03`
**Outcome:** `route_required`
**Claim Source:** executed

This no-mutation replay entered with restored, source-locked Playwright 1.61.1
and no real Playwright runner or browser profile. The immediate foundation,
Feature 004 canary, and foundation replay passed in the required order. Gate 3
then produced a genuine acceptance failure: the exact unrestricted command
exited `0` but listed `143` tests in 12 files, while the active BUG-002 Test
Plan requires exactly `133` in 12. The sequence stopped before Gate 4. A
successful process exit does not override the failed cardinality assertion.

No process was killed or modified. No source, test, configuration, dependency,
Feature 004/005/006/009/010, framework, certification, or unrelated byte was
changed by this execution. BUG-002 and SCOPE-01 remain `in_progress`, the test
phase is not claimed, and regression remains blocked.

After the fail-fast receipt and BUG-002 bookkeeping edit, the final containment
probe observed a concurrent Feature 005 mutation to
`tests/palm-springs-rental-market-lab.spec.mjs`: its SHA-256 changed from
`17ce0dec86b2a3ba8d27729ccbd8b090d0bd56089e033b96d32ce39f60c0eb28` to
`3032fed335506625a99900d3055ba9e0a7dc2f008847325151043d1d6124b92f`.
This agent did not edit or revert that foreign file. The stop-time 143-test
observation remains exact, but final 14-path hash equality is not claimed.

### Entry Preflight And Source-Lock Evidence

**Commands:** protected status/hash/staging snapshot; installed-marker scan;
`npx --no-install playwright --version`; `node scripts/validate-node-source-lock.mjs`;
exact runner/profile/test-server classification
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
timestamp=2026-07-18T23:05:53Z
topLevelStatus=in_progress
transitionStatus=pending
transitionAllowedMutationPaths=0
completedPhaseClaims=implement
certificationStatus=in_progress
certificationCompletedScopes=0
certificationSha256=fd08a5c4eb464011f731cb7ddd38635d47c1b0ccf81ad48e86e4a93c2aa79958
instrumentationMarkerGrepExit=1
instrumentationMarkers=ABSENT
Version 1.61.1
playwrightVersionExact=PASS expected=Version 1.61.1
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
realRunnerCount=0
playwrightProfileCount=0
testServerCount=1
testServerChildCount=0
BUG002_REWORK03_TEST_PREFLIGHT_CLEAR
```

The sole test-server was the persistent VS Code process PID 63482. It had no
children and was not classified as a test runner.

### Ordered Execution Through Gate 3

| Step | Command exit | Exact result | Disposition |
| --- | --- | --- | --- |
| Immediate foundation | `0` | `5/5`; zero failed/skipped/todo | PASS |
| Gate 1 Feature 004 canary | `0` | `3/3`; zero failed/skipped/todo | PASS |
| Gate 2 foundation replay | `0` | `5/5`; zero failed/skipped/todo | PASS |
| Gate 3 unrestricted discovery | `0` | `143` tests in 12 files; active contract requires `133` | FAIL; stop boundary |

**Commands:** exact immediate TP-01-12; TP-01-11; TP-01-12; TP-01-13
**Exit Codes:** 0; 0; 0; 0 (Gate 3 acceptance failure)
**Claim Source:** executed
**Output:**

```text
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=12
[playwright-runtime] excludedNodeSuites=2
[playwright-runtime] sharedImporters=12
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserInventory=12
[playwright-runtime] directNodeInventory=2
[playwright-runtime] discoveryTaxonomy=PASS
immediate foundation: tests=5 pass=5 fail=0 skipped=0 todo=0
Feature 004 canary: tests=3 pass=3 fail=0 skipped=0 todo=0
Gate 2 foundation: tests=5 pass=5 fail=0 skipped=0 todo=0
Listing tests:
  [system-chrome] › tests/market-brief-session-date-drift.spec.mjs:11:1 › Regression BUG-002: a failed rollover never serves prior-session actions beside an advanced Tier-A snapshot
  [system-chrome] › tests/msft-july-market-refresh.spec.mjs:47:1 › Regression: SCN-009-001/002/005 cache-first market truth
  [system-chrome] › tests/volatility-sizing-lab.spec.mjs:262:1 › TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL
Total: 143 tests in 12 files
```

The listing began directly at `Listing tests:` and contained no Node TAP or
Feature 004 prelude. File taxonomy and shared-runtime ownership remain green;
only exact assertion cardinality failed.

### Cardinality Attribution And Containment

**Commands:** full unstaged diff for the only modified foreign browser suite;
HEAD/current title comparison; pre/failure protected SHA-256, status, and
staging comparison; final process classification
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
expectedBrowserAssertions=133
observedBrowserAssertions=143
observedBrowserFiles=12
assertionDelta=10
foreignBrowserPath=tests/palm-springs-rental-market-lab.spec.mjs
headTestCount=5
workingTreeTestCount=28
netTestDelta=23
addedTitleCount=23
removedTitleCount=0
headSha256=daa6f5eaa9d440f5f6cfe3364157c5c7220e1da2c0ca14c6015f8a670da67dce
workingTreeSha256=17ce0dec86b2a3ba8d27729ccbd8b090d0bd56089e033b96d32ce39f60c0eb28
preflightWorkingTreeSha256=17ce0dec86b2a3ba8d27729ccbd8b090d0bd56089e033b96d32ce39f60c0eb28
failureWorkingTreeSha256=17ce0dec86b2a3ba8d27729ccbd8b090d0bd56089e033b96d32ce39f60c0eb28
stopTimeProtectedHashMismatches=0
postBookkeepingConcurrentSha256=3032fed335506625a99900d3055ba9e0a7dc2f008847325151043d1d6124b92f
postBookkeepingProtectedHashMismatches=1
postBookkeepingConcurrentPath=tests/palm-springs-rental-market-lab.spec.mjs
protectedStaging=NONE
realRunnerCount=0
playwrightProfileCount=0
testServerCount=1
testServerChildCount=0
```

The Palm Springs file is owned by Feature 005 and was already modified at
entry. Its full diff contains the new browser scenarios; this invocation did
not edit, stage, restore, or normalize it. The prior 133-test receipt and its
historical Feature 005 hash remain preserved. It changed again concurrently
after the Gate 3 stop, so planning must wait for a stable inventory and must not
remove foreign tests to satisfy BUG-002.

### Test Rework 03 Fail-Fast Boundary

**Claim Source:** not-run

Gate 4 exact BUG-002 title, Gate 5 complete BUG-002 file, the 14-case atomicity
matrix, payload validator, repository selftest, Bash parse, both complete
Playwright repetitions, and all post-repetition governance checks were not run
after the Gate 3 acceptance failure. No pass, lifecycle, regression-quality,
pollution, portability, artifact, traceability, diagnostics, or completion
claim is made for those commands in this invocation.

### Inherited Report Diagnostics

The pre-existing Markdown/EOF observation recorded as
`BUG002-REPORT-EOF-IDE-QUIRK` remains separate from this behavioral failure.
One correction pass renamed only this new section's duplicate subheadings and
removed its added EOF blank. No historical report section was rewritten.

### Test Rework 03 Finding Accounting And Route

| Finding | Current disposition | Required owner |
| --- | --- | --- |
| `BUG002-CONCURRENT-PLAYWRIGHT-OVERLAP` | Contained for this execution window: entry and final counts were runner `0`, profile `0`; the childless VS Code test-server was left alone. | none for this window |
| `BUG002-BROWSER-INVENTORY-CARDINALITY-DRIFT` | Reopened: exact discovery is `143/12`, not planned `133/12`; concurrent Feature 005 browser work is the only modified foreign browser suite. | `bubbles.plan` via `TR-BUG-002-PLAN-BROWSER-INVENTORY-CARDINALITY-02` |
| `BUG002-BROAD-E2E-INSTABILITY` | Unresolved: neither full repetition ran after Gate 3. | `bubbles.test` after planning reconciliation |
| `BUG002-INDEPENDENT-VERIFICATION` | Unresolved: ordered verification stopped at Gate 3. | `bubbles.test` after planning reconciliation |
| `BUG002-REGRESSION-PHASE` | Blocked; not executed. | `bubbles.regression` only after a complete clean test replay |
| `BUG002-VALIDATE-CERTIFICATION` | Not executed or claimed. | `bubbles.validate` after regression |
| `BUG002-AUDIT-CERTIFICATION` | Not executed or claimed. | `bubbles.audit` after validation |

`TR-BUG-002-TEST-REWORK-03` resolves as `route_required`, not as a test-phase,
scope, bug, regression, validation, audit, certification, or parent Feature 006
completion claim. The next owner is `bubbles.plan`; after it records the stable
truthful inventory, `bubbles.test` must restart from the immediate foundation
command rather than resume at Gate 4.

<!-- BUG002 no-overlap test rework 03 gate 3 refusal EOF -->
