# Report: BUG-007 Shared-Shell Suite Budget

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

BUG-007 records the two remaining failures from the current four-worker browser
suite. Both are finite test-harness budget defects around shared-shell startup.
Both exact product targets pass in isolation with retries disabled.

The implementation applies two 30,000 to 60,000 ms helper-wait replacements and
one target-local `test.slow()` statement. `bubbles.plan` adopted the single
scope, scenario mappings, thirteen-row Test Plan, DoD, and machine test handoff
without changing that technical boundary. The four implementation-owned browser
checks pass with one worker and zero retries. Independent test ownership remains
required for complete-suite acceptance and DoD adjudication.

## Completion Statement

Diagnosis, design adoption, planning adoption, and the exact implementation are
complete. SCOPE-01, top-level status, and certification remain `in_progress`.
Every DoD item remains unchecked for independent `bubbles.test` execution.

`TR-BUG007-DESIGN` and `TR-BUG007-PLAN` are resolved. The next required owner is
`bubbles.test`, which must independently adjudicate the thirteen-row Test Plan,
including the four-worker and serial 280-identity acceptance carriers.

## Planning Adoption

- SCOPE-01 remains the only active scope and has no dependencies.
- SCN-B007-001 and SCN-B007-002 retain their behavior and persistent linked
  tests; only the active baseline count and deterministic hashes changed.
- The Markdown Test Plan and `test-plan.json` each carry thirteen matching rows.
- All thirteen test-related DoD items remain unchecked.
- Neither browser test, product source, configuration, dependency, sibling bug,
  parent Feature 012 artifact, nor certification field changed in planning.

## Repository Binding

**Phase:** bug
**Claim Source:** executed

```text
REPOSITORY PREFLIGHT BOUND repository=research-lab root=~/research-lab source=concrete-target affinity=established
PREFLIGHT_COMMITTED decision=rb:vscode-e24db39cf992f7ccd8ec75209602db59:1 revision=1 repository=research-lab root=~/research-lab
repositoryAlias=research-lab
authority=concrete-target
transition=established
scopeKind=command
scopeId=null
targetKind=absolute-target
pathVisibility=local
actionable=true
controlPathDigest=sha256:63efb184bab470f4de5d8b418acc5384cec6c2caec4a0d85ef98c544228334fc
```

## Packet Selection Evidence

**Phase:** bug
**Claim Source:** executed

One exact search found six Feature 012 bug states. BUG-001 is terminal `done`.
BUG-005 and BUG-006 are active but own the now-green Journey and tooltip
targets. No existing packet owns both remaining failures. BUG-007 is therefore
the next sequential successor.

## Finding Classification

| Finding | Classification | Counted blocker | Evidence |
|---|---|---|---|
| F-BUG007-001 TP-15-04 shell-ready timeout | Suite-context helper-local inner budget defect | Yes | Four-worker RED, isolated 19-tool GREEN, source-local 30-second wait inside a 900-second target |
| F-BUG007-002 BUG-001 options shell-count timeout | Suite-context target-local containing budget defect | Yes | Same four-worker RED, isolated 12-request GREEN, no target-local outer allowance |

## Test Evidence

The browser outcomes below were supplied by the operator in this invocation.
They are interpreted evidence. The filing agent did not rerun browser tests.

## Before-Fix Four-Worker Complete-Suite Evidence

**Phase:** bug
**Claim Source:** interpreted

```text
Browser project: system-chrome.
Workers: 4.
Retries: 0.
Discovered identities: 277.
Discovered files: 33.
Command duration: 6.0 minutes.
Final result: 275 passed, 2 failed.
Counted failures: 2.
Failure 1 file: tests/simple-production-wiring.spec.mjs.
Failure 1 line: 845 at discovery time.
Failure 1 title: TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact.
Failure 1 helper: openAndAwaitOwnerEvidence at line 527.
Failure 1 wait: #rlviews[data-rlexperience-shell="ready"].
Failure 1 explicit timeout: 30,000 ms.
Failure 1 elapsed target time: 31.3 seconds.
Failure 2 file: tests/tool-experience.spec.mjs.
Failure 2 line: 258.
Failure 2 title: Regression: BUG-001 options flow shell is ready before heavy hydration begins.
Failure 2 timeout: containing 30-second test timeout.
Failure 2 wait: ready shell count.
Failure 2 elapsed target time: 35.3 seconds.
Journey target: passed.
Contextual-tooltip target: passed.
Retries consumed: none.
```

**Result:** The current four-worker acceptance carrier is red before the
proposed test-only mutations.

## Focused TP-15-04 Discriminator

**Phase:** bug
**Claim Source:** interpreted

```text
File: tests/simple-production-wiring.spec.mjs.
Title: TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact.
Browser project: system-chrome.
Workers: 1.
Retries: 0.
Result: 1 passed, 0 failed.
Target duration: 4.3 minutes.
Command duration: 4.4 minutes.
Wired tools visited: 19.
Owner-parity assertions: passed for every visited tool.
Native-demotion assertions: passed.
Honest-unavailable branches: remained asserted.
No product or test mutation preceded this discriminator.
```

**Result:** F-BUG007-001 is not a deterministic product failure. The exact long
sweep passes when it does not share the host with three other workers.

## Focused BUG-001 Options Discriminator

**Phase:** bug
**Claim Source:** interpreted

```text
File: tests/tool-experience.spec.mjs.
Title: Regression: BUG-001 options flow shell is ready before heavy hydration begins.
Browser project: system-chrome.
Workers: 1.
Retries: 0.
Result: 1 passed, 0 failed.
Target duration: 14.3 seconds.
Command duration: 17.0 seconds.
First delta shellReadyAtStart: true.
First delta cacheFirstOwnerPainted: true.
Distinct option-delta starts: 12.
Ready shell count: 1.
Shell tab count: 4.
Experience panel count: 4.
Power and Simple navigation: passed.
```

**Result:** F-BUG007-002 is not a deterministic product failure. Its default
containing budget has limited contention margin.

## Source-Grounded Diagnosis

**Phase:** bug
**Claim Source:** interpreted

- `playwright.config.mjs` defines no timeout override.
- TP-15-04 calls `test.setTimeout(900000)` before the sweep.
- `openAndAwaitOwnerEvidence` has one call site in that sweep.
- Its shell-ready and owner-provider waits each use 30,000 ms.
- Its declared hydration wait remains 600,000 ms.
- Its owner-state polling deadline remains 60,000 ms.
- The helper comment states that shell readiness is synchronous once built.
- The BUG-001 options target has no `test.slow()` or `test.setTimeout()`.
- The options target retains all first-delta, twelve-request, shell, panel,
  tab, and navigation assertions.

## Current Source Identity And Boundary

**Phase:** bug
**Claim Source:** executed

```text
Repository revision: 35cc327a64dfe767f026b508582c415beb032e7e.
tests/simple-production-wiring.spec.mjs blob: 297560487c832d39b36ea8ef58dff47cd504383c.
tests/tool-experience.spec.mjs blob: 402eed62b4c8c371cff8b18c29d7ae33d92b8e7c.
playwright.config.mjs blob: d04ae12216125b710a1f94645feac2e28c1467cc.
Focused status command: git status --porcelain=v1 -- the two tests and Playwright config.
Focused status output: empty.
Target files had no pre-existing worktree diff.
Allowed future test files: 2.
Allowed helper timeout replacements: 2.
Allowed target-local statements: 1.
Allowed product files: 0.
Allowed configuration files: 0.
Allowed retry changes: 0.
Concurrent dirty paths outside BUG-007: preserved.
```

## Exact Implemented Mutations

**Phase:** bug
**Claim Source:** interpreted

1. Replaced both `timeout: 30000` arguments inside
   `openAndAwaitOwnerEvidence` with `timeout: 60000`.
2. Added `test.slow();` as the first statement inside the named BUG-001 target.
3. Kept the 600,000 hydration and 60,000 owner-state deadlines unchanged.
4. Kept all selectors, predicates, interactions, and assertions unchanged.

## Acceptance Evidence Status

**Phase:** implement
**Claim Source:** executed

Implementation executed TP-B007-01 through TP-B007-04, TP-B007-08 through
TP-B007-11, and the packet artifact-lint half of TP-B007-12. All scope DoD
items remain unchecked because `bubbles.test` owns independent adjudication.
TP-B007-05, TP-B007-06, TP-B007-07, and the traceability half of TP-B007-12
were not run by implementation.

## Implementation Mutation Boundary

**Phase:** implement
**Claim Source:** executed

**Commands:**

```text
timeout 30 node --input-type=module -e '<exact normalized scoped-diff assertion>'
timeout 30 git diff --check -- tests/simple-production-wiring.spec.mjs tests/tool-experience.spec.mjs playwright.config.mjs
timeout 30 git --no-pager diff -- tests/simple-production-wiring.spec.mjs tests/tool-experience.spec.mjs playwright.config.mjs
```

**Exit Codes:** 0, 0, 0

The first validator attempt exited 1 because its expected selector string used
double quotes where the source uses single quotes. It did not mutate the tree.
The corrected fail-closed validator emitted:

```text
CHANGED_FILE_COUNT=2
CHANGED_FILE_1=tests/simple-production-wiring.spec.mjs
CHANGED_FILE_2=tests/tool-experience.spec.mjs
PLAYWRIGHT_CONFIG_CHANGED=false
NORMALIZED_REMOVAL_COUNT=2
REMOVED_1=await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });
REMOVED_2={ timeout: 30000 }
NORMALIZED_ADDITION_COUNT=3
ADDED_1=await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 60000 });
ADDED_2={ timeout: 60000 }
ADDED_3=test.slow();
EXACT_NORMALIZED_DIFF=PASS
```

The complete scoped diff is:

```diff
diff --git a/tests/simple-production-wiring.spec.mjs b/tests/simple-production-wiring.spec.mjs
index 29756048..29d62945 100644
--- a/tests/simple-production-wiring.spec.mjs
+++ b/tests/simple-production-wiring.spec.mjs
@@ -524,11 +524,11 @@ async function awaitDeclaredHydrationBoundary(page, attributeName) {
 async function openAndAwaitOwnerEvidence(page, toolId) {
   await page.goto(`${site.baseUrl}/${toolId}.html`);
-  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 30000 });
+  await expect(page.locator('#rlviews[data-rlexperience-shell="ready"]')).toBeVisible({ timeout: 60000 });
   await page.waitForFunction(
     (id) => !!(globalThis.__rlOwnerStateProvider && typeof globalThis.__rlOwnerStateProvider[id] === 'function'),
     toolId,
-    { timeout: 30000 }
+    { timeout: 60000 }
   );
diff --git a/tests/tool-experience.spec.mjs b/tests/tool-experience.spec.mjs
index 402eed62..8326b4c6 100644
--- a/tests/tool-experience.spec.mjs
+++ b/tests/tool-experience.spec.mjs
@@ -256,6 +256,7 @@ test('Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio
 test('Regression: BUG-001 options flow shell is ready before heavy hydration begins', async ({ page }) => {
+  test.slow();
   await page.addInitScript(() => {
```

`git diff --check` emitted no output. Current test blobs are
`29d629452b8cee9f8d4de49f85df84e7303a70db` and
`8326b4c630e9be530d8f73f44bf94e261aea8855`. No product, dependency,
Playwright configuration, sibling bug, parent Feature 012, certification, or
unrelated dirty byte was changed by implementation.

## Implementation GREEN Evidence

**Phase:** implement
**Claim Source:** executed

**Commands, in execution order:**

```text
timeout 180 npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: BUG-001 options flow shell is ready before heavy hydration begins" --reporter=list --workers=1 --retries=0
timeout 1200 npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact" --reporter=list --workers=1 --retries=0
timeout 600 npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0
timeout 1800 npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0
```

**Exit Codes:** 0, 0, 0, 0

```text
Running 1 test using 1 worker
  ✓  1 …BUG-001 options flow shell is ready before heavy hydration begins (12.2s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  1 passed (15.9s)

Running 1 test using 1 worker
  ✓  1 …tool paints its real Simple adapter panel with an owner-parity fact (3.9m)
TP-15-04/SCN-012-041 derived native #simpleView tools: 7 of 19 wired (4 also declare #powerView)
TP-15-04 swept 19 wired tools: market-heatmap-lab=ready(x1) options-flow-feed-lab=ready(x1) intraday-tape-lab=unavailable(x1) swing-structure-lab=ready(x1) options-structure-lab=ready(x1) gamma-trading-lab=ready(x1) sector-research-lab=ready(x1) global-rotation-lab=ready(x1) real-assets-lab=ready(x1) bond-regime-lab=ready(x1) ai-capex-strategy-lab=ready(x1) company-fundamentals-lab=ready(x1) etf-momentum-lab=ready(x1) strategy-self-improvement-lab=ready(x1) strategy-validation-lab=ready(x1) smart-money-flow-lab=ready(x1) waterfront-polo-lab=ready(x1) volatility-sizing-lab=ready(x1) technical-analysis-decision-lab=unavailable(x1)
TP-15-04/SCN-012-041 native demotion verified on 7 tools
  1 passed (3.9m)

Running 5 tests using 1 worker
  ✓  1 …shadow registry validation derives all experiences without cutover (601ms)
  ✓  2 …published milestones exposes exact Brief gate and no author request (1.0s)
  ✓  3 …002 with published milestones opens the Brief gate on live state (691ms)
  ✓  4 …ature 008 preserves public Portfolio and creates no private store (3.5s)
  ✓  5 …BUG-001 options flow shell is ready before heavy hydration begins (12.1s)
[bug001-order] firstDelta=/data/options/SPY.json shellReadyAtStart=true cacheFirstOwnerPainted=true
  5 passed (19.9s)

Running 4 tests using 1 worker
  ✓  1 …Simple renders the real adapter panel in the real owner-mode flow (1.8s)
  ✓  2 …actuating one recomputes the production projection with no refetch (13.5s)
  ✓  3 …tool paints its real Simple adapter panel with an owner-parity fact (4.2m)
TP-15-04 swept 19 wired tools with every owner-parity assertion intact
TP-15-04/SCN-012-041 native demotion verified on 7 tools
  ✓  4 …and the honest-degradation cases are registry/provider derived (111ms)
  4 passed (4.5m)
```

**Result:** TP-B007-03 passed 1/1, TP-B007-01 passed 1/1 across all 19
wired tools, TP-B007-04 passed 5/5, and TP-B007-02 passed 4/4. Every run
used one worker and zero retries.

## Syntax And Regression Quality

**Phase:** implement
**Claim Source:** executed

**Commands:**

```text
timeout 30 node --check tests/simple-production-wiring.spec.mjs
timeout 30 node --check tests/tool-experience.spec.mjs
timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/simple-production-wiring.spec.mjs
timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/tool-experience.spec.mjs
```

**Exit Codes:** 0, 0, 0, 0

Both syntax checks emitted no output. The guards emitted:

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/simple-production-wiring.spec.mjs
✅ Adversarial signal detected in tests/simple-production-wiring.spec.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
ℹ️  Scanning tests/tool-experience.spec.mjs
✅ Adversarial signal detected in tests/tool-experience.spec.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Result:** Both modules parse. Both bugfix guards report one adversarial
signal, zero violations, and zero warnings.

## Implementation Artifact Lint

**Phase:** implement
**Claim Source:** executed
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget`
**Exit Code:** 0

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
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

**Result:** PASS at nonterminal `in_progress`. This does not certify the scope
or check any DoD item.

## Packet Validation

**Phase:** bug
**Claim Source:** executed

### Artifact Lint

**Executed:** YES (in current session)
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget`
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

**Result:** PASS. The packet passes structural and anti-fabrication lint at
`in_progress`. This does not claim implementation or browser acceptance.

### Control-Plane Integrity

**Executed:** YES (in current session)
**Command:** `timeout 60 node --input-type=module -e 'import{createHash}from"node:crypto";import{execFileSync}from"node:child_process";import{readdirSync,readFileSync}from"node:fs";const r="specs/012-market-action-center-and-guided-tools/bugs/BUG-007-shared-shell-suite-budget",s=JSON.parse(readFileSync(`${r}/state.json`)),m=JSON.parse(readFileSync(`${r}/scenario-manifest.json`)),q=readFileSync(`${r}/scopes.md`,"utf8"),f=readdirSync(r).sort();const c={FILES:f.length===8,STATUS:s.status===s.certification.status,MODE:s.workflowMode==="bugfix-fastlane",OWNER:s.execution.nextRequiredOwner==="bubbles.design",FINDINGS:s.findingsLedger.length===2,SCENARIOS:m.scenarios.length===2,HASHES:m.scenarios.every(x=>x.gherkinHash===`sha256:${createHash("sha256").update(JSON.stringify(x.gherkin)).digest("hex")}`),TEST_IDS:new Set(q.match(/TP-B007-\d{2}/g)||[]).size===13,TARGET_DIFF:execFileSync("git",["status","--porcelain=v1","--","tests/simple-production-wiring.spec.mjs","tests/tool-experience.spec.mjs","playwright.config.mjs"],{encoding:"utf8"})===""};for(const[k,v]of Object.entries(c)){console.log(`${k}=${v}`);if(!v)process.exitCode=1}console.log(`INTEGRITY=${process.exitCode?"FAIL":"PASS"}`);'`
**Exit Code:** 0
**Output:**

```text
FILES=true
STATUS=true
MODE=true
OWNER=true
FINDINGS=true
SCENARIOS=true
HASHES=true
TEST_IDS=true
TARGET_DIFF=true
INTEGRITY=PASS
```

**Result:** PASS. All eight files are coherent. Both target tests and
`playwright.config.mjs` retain their pre-packet blobs and clean diff.

## Packet Artifacts

| File | Purpose |
|---|---|
| `bug.md` | Diagnosis, reproduction, packet selection, and boundary |
| `spec.md` | Expected behavior and hard constraints |
| `design.md` | Routed root cause and exact proposed fix |
| `scopes.md` | Routed scenarios, Test Plan, and unchecked DoD |
| `report.md` | Evidence provenance and current findings |
| `uservalidation.md` | Checked packet-truth checklist |
| `scenario-manifest.json` | Two stable scenario contracts |
| `test-plan.json` | Plan-owned thirteen-row machine test handoff |
| `state.json` | Version 3 execution and certification control plane |

## Unresolved Findings

- F-BUG007-001 has the exact helper-local implementation and implementation-owned
  GREEN proof. It remains open for independent complete-suite acceptance.
- F-BUG007-002 has the exact target-local implementation and implementation-owned
  GREEN proof. It remains open for independent complete-suite acceptance.
- Audit and validate-owned certification remain unstarted.

## Implementation Changed Files

| File | Implement-owned purpose |
|---|---|
| `tests/simple-production-wiring.spec.mjs` | Two readiness waits changed from 30,000 to 60,000 ms |
| `tests/tool-experience.spec.mjs` | One target-local first-statement `test.slow()` insertion |
| `report.md` | Current-session implement evidence and truthful handoff |
| `state.json` | Execution claim and next-owner routing only |

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
reconciled; status, findings, historical evidence, and certification remain
unchanged.
