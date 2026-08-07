# Report: BUG-006 Contextual Tooltip Suite Budget

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

BUG-006 records a current suite-context test-harness timing defect in the mobile
contextual-disclosure regression. The complete four-worker browser suite
exhausted Playwright's 30-second containing test timeout during the second real
close-button action, while the exact target passed 1/1 and the complete owning
file passed 3/3 serially.

The packet authorizes no product change. The smallest proposed implementation
is one target-local `test.slow()` statement in
`tests/contextual-tooltip.spec.mjs`, preserving all existing actions and
assertions. The original filing invocation changed no test or product code. A
later implementation applied the statement, but the target subsequently
drifted back to the exact pre-fix blob. The current implementation invocation
restored only that authorized statement; product code remains unchanged.

## Completion Statement

Diagnosis, packet creation, and the source-drift repair are complete. SCOPE-01,
top-level status, and certification remain `in_progress`; every DoD item
remains unchecked. The current bounded checks pass, while the complete-suite
acceptance rows were not executed in this repair invocation. The open finding
is routed to independent `bubbles.test` execution and validate-owned
certification.

## Repository Binding

**Phase:** bug
**Claim Source:** executed

```text
REPOSITORY PREFLIGHT BOUND repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=established
PREFLIGHT_COMMITTED decision=rb:vscode-e24db39cf992f7ccd8ec75209602db59:1 revision=1 repository=research-lab root=~/research-lab
repositoryAlias=research-lab
authority=explicit-repository-root
transition=established
scopeKind=command
scopeId=null
targetKind=repository-root
pathVisibility=local
actionable=true
controlPathDigest=sha256:d59ed78bfdab6de4fc67aa553259bd1a0d82238f986c1f99074def393502e50c
```

## Finding Classification

| Finding | Classification | Counted blocker | Evidence |
|---|---|---|---|
| F-BUG006-001 mobile disclosure target timeout | Confirmed suite-context test-harness outer-budget defect | Yes | Four-worker full-suite RED plus focused 1/1 and same-file 3/3 discriminators |

## Test Evidence

The pre-fix browser outcomes below were supplied by the top-level runner. They
are preserved as interpreted evidence and are not relabeled as commands
executed by this filing agent. No post-fix browser evidence exists because this
invocation was explicitly diagnostic and packet-only.

## Before-Fix Four-Worker Full-Suite Evidence

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The top-level runner's current complete-suite observation is
the preserved pre-fix RED carrier for TP-B006-00.

```text
Browser project: system-chrome.
Workers: 4.
Retries: 0.
Discovered identities: 277.
Discovered files: 33.
Identity digest: 832a7e0b84d07af9b8da6bb580cb3bf3efc128a7abf713cabb456d9433e368d6.
File path set: unchanged.
Final result: 276 passed, 1 failed.
Command duration: 8.8 minutes.
Sole failure file: tests/contextual-tooltip.spec.mjs.
Sole failure line: 110; timeout surfaced at line 137.
Sole failure title: Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas.
Timeout: 30,000 ms containing test timeout.
Failed operation: disclosure.locator('[data-rlcontext-close]').click().
Actionability wait: element visible, enabled, and stable.
Preceding state: every substantive assertion had reached the second disclosure open path.
BUG-005 Journey target: passed.
```

**Result:** The complete-suite carrier is red before the proposed target-local
outer-budget change. This is inherited evidence, not filing-agent execution.

## Focused Target Discriminator

**Phase:** bug
**Claim Source:** interpreted

```text
File: tests/contextual-tooltip.spec.mjs.
Title: Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas.
Browser project: system-chrome.
Workers: 1.
Retries: 0.
Result: 1 passed, 0 failed.
Target duration: 15.4 seconds.
Command duration: 17.7 seconds.
The first touch-open path completed.
The sheet geometry assertions completed.
The Escape close and focus restoration completed.
The second disclosure path completed in focused execution.
The real close-button click completed in focused execution.
The no-canvas same-data fallback completed.
```

**Result:** The product path is not deterministically broken. The focused target
already consumes roughly half of the default outer budget.

## Complete Same-File Discriminator

**Phase:** bug
**Claim Source:** interpreted

```text
File: tests/contextual-tooltip.spec.mjs.
Browser project: system-chrome.
Workers: 1.
Retries: 0.
Tests in file: 3.
Result: 3 passed, 0 failed.
Mobile target duration: 15.2 seconds.
Command duration: 20.5 seconds.
SCN-012-003 pointer, keyboard, touch, and table equivalence passed.
SCN-012-004 malformed label-only context failure behavior passed.
The mobile disclosure target passed after its same-file predecessors.
No file-local cumulative failure was observed.
No retry or interception was used.
```

**Result:** Same-file leakage is not supported by current evidence. The
four-worker complete-suite context remains the differentiating carrier.

## Source-Grounded Diagnosis

**Phase:** bug
**Claim Source:** interpreted

- `playwright.config.mjs` defines no global timeout override.
- The mobile target begins at `tests/contextual-tooltip.spec.mjs:110`.
- It opens a primary page and a separately initialized no-canvas page.
- It performs two real touch-open disclosure cycles.
- It validates sheet geometry, Escape close, and two focus restorations.
- The failing line uses a real locator click without `force`.
- The observed timeout is the containing 30-second test timeout, not a named
  inner readiness timeout.
- The smallest evidence-supported change is target-local `test.slow()`.

## Pre-Implementation Mutation Boundary

**Phase:** bug
**Claim Source:** executed

```text
Repository revision: 17ee5f56ff08ea63380b4a2708ac6a53571cb7d0.
Target test blob: aee8568200fa2ccd6020276386c7d58813cead91.
git diff --exit-code -- tests/contextual-tooltip.spec.mjs: exit 0.
Target test pre-existing diff: clean.
Allowed future source file: tests/contextual-tooltip.spec.mjs.
Allowed future source delta: one target-local finite outer-budget statement.
Global Playwright config mutation: forbidden.
Product code mutation: forbidden.
Retry, sleep, force, interception, or programmatic close: forbidden.
BUG-005 mutation: forbidden.
Feature 004 mutation: forbidden.
BUG-002 mutation: forbidden.
Parent Feature 012 mutation: forbidden.
Concurrent dirty bytes outside BUG-006: preserve byte-for-byte.
```

## Acceptance Evidence Status

**Phase:** bug
**Claim Source:** not-run

TP-B006-01 through TP-B006-09 are not claimed by this diagnostic invocation.
Their exact commands and acceptance conditions are defined in `scopes.md`.
Implementation must first preserve the one-statement boundary; independent
test and validation owners must then execute focused, same-file, four-worker,
serial, selftest, regression-quality, syntax, diff, and packet checks.

## Artifact Packet Validation

**Phase:** bug
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget`
**Exit Code:** 0
**Claim Source:** executed

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
Found Checklist section in uservalidation.md
uservalidation checklist contains checkbox entries
uservalidation checklist has checked-by-default entries
All checklist bullet items use checkbox syntax
Detected state.json status: in_progress
Detected state.json workflowMode: bugfix-fastlane
state.json v3 has required field: status
state.json v3 has required field: execution
state.json v3 has required field: certification
state.json v3 has required field: policySnapshot
state.json v3 has recommended field: transitionRequests
state.json v3 has recommended field: reworkQueue
state.json v3 has recommended field: executionHistory
Top-level status matches certification.status
Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
report.md contains Summary, Completion Statement, and Test Evidence sections
Mode-specific report gates skipped because status is not in the promotion set
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

**Result:** The complete packet passes structural and anti-fabrication lint at
`in_progress`. This does not claim implementation, browser acceptance, or
certification.

## Control-Plane Integrity And Mutation Boundary

**Phase:** bug
**Command:**

```bash
timeout 30 node --input-type=module -e 'import{createHash}from"node:crypto";import{execFileSync}from"node:child_process";import{existsSync,readFileSync}from"node:fs";const root="specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget",files=["bug.md","spec.md","design.md","scopes.md","report.md","uservalidation.md","scenario-manifest.json","state.json"];for(const file of files){if(!existsSync(`${root}/${file}`))throw Error(file);console.log(`OK=${file}`)}const state=JSON.parse(readFileSync(`${root}/state.json`)),manifest=JSON.parse(readFileSync(`${root}/scenario-manifest.json`)),scenario=manifest.scenarios[0],scopes=readFileSync(`${root}/scopes.md`,"utf8"),report=readFileSync(`${root}/report.md`,"utf8"),text=files.map(file=>readFileSync(`${root}/${file}`,"utf8")).join("\n"),prose=text.replace(/```[\s\S]*?```/g,""),ids=new Set(scopes.match(/TP-B006-\d{2}/g)||[]),checks={STATUS_MIRROR:state.status===state.certification.status,MODE_OK:state.workflowMode==="bugfix-fastlane",NEXT_OWNER_OK:state.execution.nextRequiredOwner==="bubbles.implement",OPEN_TRANSITION_OK:state.transitionRequests.some(r=>r.id==="TR-BUG006-IMPLEMENT"&&r.status==="open"&&r.routedTo==="bubbles.implement"),FINDING_OK:state.findingsLedger.some(f=>f.findingId==="F-BUG006-001"&&f.state==="OPEN"),SCENARIO_HASH_OK:scenario.gherkinHash===`sha256:${createHash("sha256").update(JSON.stringify(scenario.gherkin)).digest("hex")}`,LINKED_TEST_OK:scenario.linkedTests[0].file==="tests/contextual-tooltip.spec.mjs",DOD_UNCHECKED:!scopes.includes("- [x]"),TEST_PLAN_COUNT_OK:ids.size===10,CLAIM_SOURCES_OK:["executed","interpreted","not-run"].every(s=>report.includes(`**Claim Source:** ${s}`)),PLACEHOLDER_PROSE_SCAN_CLEAN:!/(TODO|FIXME|\[TODO|\bTBD\b|ACTUAL terminal)/.test(prose),TARGET_TEST_BLOB_OK:execFileSync("git",["hash-object","tests/contextual-tooltip.spec.mjs"],{encoding:"utf8"}).trim()==="aee8568200fa2ccd6020276386c7d58813cead91"};for(const[name,ok]of Object.entries(checks)){console.log(`${name}=${ok}`);if(!ok)throw Error(name)}console.log(`TEST_PLAN_UNIQUE_IDS=${ids.size}`);console.log("JSON_INTEGRITY=PASS")' && timeout 30 git diff --exit-code -- tests/contextual-tooltip.spec.mjs playwright.config.mjs && printf 'CONTROLLING_FILES_DIFF=clean\n' && timeout 30 git status --porcelain=v1 -- specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget tests/contextual-tooltip.spec.mjs playwright.config.mjs && printf 'BOUNDARY_STATUS_CAPTURED\n'
```

**Exit Code:** 0
**Claim Source:** executed

```text
OK=bug.md
OK=spec.md
OK=design.md
OK=scopes.md
OK=report.md
OK=uservalidation.md
OK=scenario-manifest.json
OK=state.json
STATUS_MIRROR=true
MODE_OK=true
NEXT_OWNER_OK=true
OPEN_TRANSITION_OK=true
FINDING_OK=true
SCENARIO_HASH_OK=true
LINKED_TEST_OK=true
DOD_UNCHECKED=true
TEST_PLAN_COUNT_OK=true
CLAIM_SOURCES_OK=true
PLACEHOLDER_PROSE_SCAN_CLEAN=true
TARGET_TEST_BLOB_OK=true
TEST_PLAN_UNIQUE_IDS=10
JSON_INTEGRITY=PASS
CONTROLLING_FILES_DIFF=clean
?? specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget/
BOUNDARY_STATUS_CAPTURED
```

**Result:** The eight-file packet is internally coherent and routed to the
correct next owner. The target test and Playwright configuration remain
unchanged; the focused boundary contains only the new BUG-006 directory.

Two earlier drafts of the integrity one-liner were command-only failures. The
first had a quoting error and exited before reading a packet file. The second
correctly read the packet but treated its own literal placeholder regex inside
this fenced command block as prose. The final command above excludes fenced
command and evidence blocks from that prose scan and is the executed integrity
result used for this claim.

## Changed Artifacts

## Implement Phase Execution

**Phase:** implement
**Claim Source:** executed
**Outcome:** The authorized one-line test-harness change is implemented. The
scope, top-level status, and certification remain `in_progress`. No DoD item is
closed by this phase. Independent test ownership is required for TP-B006-03 and
TP-B006-04.

### Targeted Browser Verification

**Executed:** YES (in current session)
**Command:** `timeout 180 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas" --reporter=list --workers=1 --retries=0`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 1 test using 1 worker

     1 [system-chrome] › tests/contextual-tooltip.spec.mjs:110:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas
  ✓  1 [system-chrome] › tests/contextual-tooltip.spec.mjs:110:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas (24.1s)
  1 passed (29.6s)
```

**Executed:** YES (in current session)
**Command:** `timeout 300 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 3 tests using 1 worker

    1 [system-chrome] › tests/contextual-tooltip.spec.mjs:20:1 › Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table
  ✓  1 [system-chrome] › tests/contextual-tooltip.spec.mjs:20:1 › Regression: SCN-012-003 Power chart context is equivalent by pointer keyboard touch and table
    2 [system-chrome] › tests/contextual-tooltip.spec.mjs:62:1 › Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers
  ✓  2 [system-chrome] › tests/contextual-tooltip.spec.mjs:62:1 › Regression: SCN-012-004 label-only context fails the exact Power item without hiding valid peers
    3 [system-chrome] › tests/contextual-tooltip.spec.mjs:110:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas
  ✓  3 [system-chrome] › tests/contextual-tooltip.spec.mjs:110:1 › Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas (21.7s)
  3 passed (29.0s)
```

**Result:** TP-B006-01 passed 1/1 and TP-B006-02 passed 3/3 with one
worker and retries disabled. No interaction or assertion changed.

### Syntax And Regression Quality

**Executed:** YES (in current session)
**Command:** `timeout 30 node --check tests/contextual-tooltip.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:** The syntax checker emitted no stdout.

**Executed:** YES (in current session)
**Command:** `timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/contextual-tooltip.spec.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-04T15:56:14Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/contextual-tooltip.spec.mjs
✅ Adversarial signal detected in tests/contextual-tooltip.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** TP-B006-06 and TP-B006-07 passed. The persistent regression
retains its adversarial signal and has no quality-guard violation.

### Exact Code Diff Evidence

**Executed:** YES (in current session)
**Command:** `git diff --check -- tests/contextual-tooltip.spec.mjs playwright.config.mjs && git diff --exit-code -- playwright.config.mjs && git diff --numstat -- tests/contextual-tooltip.spec.mjs playwright.config.mjs && git --no-pager diff -- tests/contextual-tooltip.spec.mjs playwright.config.mjs`
**Exit Code:** 0
**Claim Source:** executed

```diff
1       0       tests/contextual-tooltip.spec.mjs
diff --git a/tests/contextual-tooltip.spec.mjs b/tests/contextual-tooltip.spec.mjs
index aee85682..9f465c26 100644
--- a/tests/contextual-tooltip.spec.mjs
+++ b/tests/contextual-tooltip.spec.mjs
@@ -108,6 +108,7 @@ test('Regression: SCN-012-004 label-only context fails the exact Power item with
 });

 test('Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas', async ({ page }) => {
+  test.slow();
  await page.setViewportSize({ width: 390, height: 844 });
  const fallbackPage = await page.context().newPage();
  await fallbackPage.setViewportSize({ width: 390, height: 844 });
```

**Result:** TP-B006-08 passed. The target equals HEAD plus one added
`test.slow();` line, whitespace is clean, and `playwright.config.mjs` has no
diff.

### Packet Integrity And State Discipline

**Executed:** YES (in current session)
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget`
**Exit Code:** 0
**Claim Source:** executed

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ Value-first selection rationale lint skipped (not a value-first report)
✅ Scenario path-placeholder lint skipped (no matching scenario sections found)
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

**Executed:** YES (in current session)
**Command:** `timeout 300 bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-006-contextual-tooltip-suite-budget`
**Exit Code:** 1
**Claim Source:** executed

```text
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:5a69027f13ca7c8cb82829970334081556dbec4cc5d9ecf392bee53e933ad6ef
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G051,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G060,G006,G061,G022,G053,G028,G040,G068]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 23
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**Result:** The completion guard correctly prevents terminal state while
test-owned complete-suite evidence, remaining phases, and unchecked DoD items
are absent. Because the mandatory pre-state-write guard did not pass,
`state.json`, scope status, DoD checkboxes, and certification were not changed.

Only these new packet artifacts are authorized in this invocation:

| Artifact | Purpose |
|---|---|
| `bug.md` | Reproduction, classification, and mutation boundary |
| `spec.md` | Expected behavior and acceptance contract |
| `design.md` | Root cause and smallest fix design |
| `scopes.md` | Fix scope, exact commands, and unchecked DoD |
| `report.md` | Provenance-separated current evidence |
| `state.json` | v3 execution and certification control plane |
| `uservalidation.md` | Checked-by-default packet review checklist |
| `scenario-manifest.json` | Stable SCN-B006-001 contract |

## Invocation Audit

No `runSubagent` capability was available in this invocation, and no subagent
was invoked. The complete initial packet routes the open implementation finding
to the next registry owner instead of fabricating design, plan, implementation,
test, documentation, or validation specialist execution.

## Source Drift Repair - Current Implement Invocation

**Phase:** implement
**Claim Source:** executed
**Outcome:** The target began this invocation at the exact pre-fix blob
`aee8568200fa2ccd6020276386c7d58813cead91`. Only `test.slow();` was restored as
the first statement of the named mobile regression. The post-fix blob is
`9f465c266cf5c31bf1e19e5edfe4de7b125e36e7`.

### Current-Session Bounded Browser Verification

**Executed:** YES (in current session)
**Commands:**

```text
timeout 180 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas" --reporter=list --workers=1 --retries=0
timeout 300 npx --no-install playwright test tests/contextual-tooltip.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0
```

**Exit Codes:** 0, 0
**Claim Source:** executed

```text
Running 1 test using 1 worker

  ✓  1 …mobile returns focus and promotes same-data table without canvas (17.6s)

  1 passed (19.9s)

Running 3 tests using 1 worker

  ✓  1 …r chart context is equivalent by pointer keyboard touch and table (1.9s)
  ✓  2 …ly context fails the exact Power item without hiding valid peers (971ms)
  ✓  3 …mobile returns focus and promotes same-data table without canvas (19.4s)

  3 passed (24.5s)
```

**Result:** The focused target passed 1/1 and the complete contextual-tooltip
file passed 3/3 with one worker and retries disabled in this invocation. This
does not claim the unexecuted complete-suite acceptance rows.

### Current-Session Syntax And Regression Quality

**Executed:** YES (in current session)
**Commands:**

```text
timeout 30 node --check tests/contextual-tooltip.spec.mjs
timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/contextual-tooltip.spec.mjs
```

**Exit Codes:** 0, 0
**Claim Source:** executed

```text
syntax_exit=0
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-04T20:05:19Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/contextual-tooltip.spec.mjs
✅ Adversarial signal detected in tests/contextual-tooltip.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** The module parses, and the bugfix guard reports zero violations and
zero warnings while retaining an adversarial signal.

### Current-Session Exact Mutation Boundary

**Executed:** YES (in current session)
**Command:** `git hash-object tests/contextual-tooltip.spec.mjs playwright.config.mjs` plus scoped `git diff --check`, config `git diff --exit-code`, numstat, name-only, and zero-context diff checks
**Exit Code:** 0
**Claim Source:** executed

```text
BEGIN_BUG006_BOUNDARY
TARGET_BLOB
9f465c266cf5c31bf1e19e5edfe4de7b125e36e7
CONFIG_BLOB
d04ae12216125b710a1f94645feac2e28c1467cc
DIFF_CHECK_EXIT=0
CONFIG_DIFF_EXIT=0
NUMSTAT
1       0       tests/contextual-tooltip.spec.mjs
CHANGED_PATHS
tests/contextual-tooltip.spec.mjs
NORMALIZED_DIFF
diff --git a/tests/contextual-tooltip.spec.mjs b/tests/contextual-tooltip.spec.mjs
index aee85682..9f465c26 100644
--- a/tests/contextual-tooltip.spec.mjs
+++ b/tests/contextual-tooltip.spec.mjs
@@ -110,0 +111 @@ test('Regression: contextual disclosure fits mobile returns focus and promotes same-data table without canvas', async ({ page }) => {
+  test.slow();
END_BUG006_BOUNDARY
```

**Result:** The normalized source diff is exactly one added statement in the
authorized target. `playwright.config.mjs` is unchanged, and no other scoped
path appears.

### Current Status Truth

**Phase:** implement
**Claim Source:** not-run

The four-worker complete suite, serial complete suite, and repository selftest
were not run in this source-drift repair invocation. SCOPE-01, all DoD items,
top-level status, and certification therefore remain nonterminal and unchanged.
The next required owner is `bubbles.test`.

## Concurrent Baseline Reconciliation

**Phase:** bug
**Claim Source:** interpreted

The top-level runner supplied the current unrestricted system-Chrome list result
of 280 tests in 33 files at HEAD
`923833254b9463cfb163cac2aace2b2fb305333b`. This invocation independently
observed that HEAD and that commit `92383325` adds 216 lines and deletes none in
`tests/portfolio-survival-foundation.spec.mjs`; the runner identified those
additions as exactly three new Playwright tests.

The current acceptance target is 280 identities across the unchanged 33-file
path set. Historical 277-identity output above remains verbatim and continues to
describe the earlier execution only. No browser suite or repository selftest ran
in this reconciliation, and no pass, completion, or certification claim is
added.

The active route is `bubbles.test` for the existing complete-suite commands
against 280 identities. Design- and plan-owned active count mirrors are
reconciled; status, findings, historical evidence, the existing implementation
transition record, and certification remain unchanged.
