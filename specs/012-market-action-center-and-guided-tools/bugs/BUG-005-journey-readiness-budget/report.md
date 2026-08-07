# Report: BUG-005 Journey Readiness Budget

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

BUG-005 now has the bounded test-harness mutation authorized by the design.
Only `tests/journey.spec.mjs` changed: the existing helper accepts an optional
15-second-default timeout, and only the Market Action Center target uses a
30-second inner wait under Playwright's target-local slow budget. The readiness
predicate and all registry assertions are byte-identical to the pre-fix file.

The exact focused target passed 1/1 and the complete Journey file passed 9/9
serially with retries disabled. Full-suite acceptance is not claimed here and
remains independently owned by `bubbles.test`.

The intraday Simple adapter expected-failure was separately verified and is not
a counted failure: Playwright records one expected failure and zero unexpected
results. No second bug was filed.

## Completion Statement

The implementation-owned mutation and focused proof are complete. SCOPE-01
remains In Progress, every DoD item remains unchecked, and both top-level and
certification status remain `in_progress`. The required next owner is
`bubbles.test` for independent full-suite and remaining acceptance evidence;
validate-owned certification remains unclaimed.

## Repository Binding

**Phase:** bug
**Claim Source:** executed

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-e24db39cf992f7ccd8ec75209602db59:33 revision=33 repository=research-lab root=~/research-lab
repositoryAlias=research-lab
authority=explicit-repository-root
transition=confirmed
scopeKind=command
targetKind=repository-root
pathVisibility=local
actionable=true
controlPathDigest=sha256:e6d858a6f9bc1824d3a2cea3746d741a5bad41016d613dc242312185af9761fa
```

## Finding Classification

| Finding | Classification | Counted blocker | Evidence |
|---|---|---|---|
| F-BUG005-001 Journey Center mount timeout | Confirmed full-suite test-harness defect | Yes | Preserved top-level full-suite failure plus current same-file 9/9 discriminator |
| OBS-BUG005-001 Intraday `test.fail` marker | Valid expected failure; product sensitivity gap still present | No | Focused JSON: expected 1, unexpected 0, underlying visible-text assertion failed |

## Test Evidence

The evidence below separates inherited complete-suite RED, diagnostic evidence,
and current implementation-owned GREEN evidence. The implementation owner did
not rerun either complete suite; TP-B005-03 and TP-B005-04 remain assigned to
independent `bubbles.test`.

## Before-Fix Full-Suite Evidence

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The operator-provided top-level runner output is accepted as
the preserved failing suite observation, not relabeled as a command executed by
this filing agent.

```text
Owner-authorized serial full run: 275/277 displayed before final accounting.
Counted failure: tests/journey.spec.mjs:526.
Title: the Market Action Center remains the global journey surface.
Failure point: mountJourneyOnPage.
Observed timeout: 15,000 ms.
Waited condition: Journey panel visible.
Waited condition: data-rljourney-state equals ready.
Waited condition: __rljourneyController exists.
Exact identity isolated result: 1 passed.
Serial final summary: 1 failed, 276 passed.
Retries: 0.
The intraday expected-failure glyph was excluded from the counted failure list.
```

> **Uncertainty Declaration**
> **What was attempted:** the filing agent ran the full owning Journey file but not the 277-test carrier.
> **What was observed:** all 9 Journey tests passed; the inherited complete-suite failure remains the only RED.
> **Why this is uncertain:** the pre-fix complete-suite RED was produced by the top-level runner, not re-executed by this phase.
> **What would resolve this:** TP-B005-00 must reproduce the old-budget failure before implementation acceptance.

## Same-File Cumulative-State Discriminator

**Phase:** bug
**Command:** `timeout 300 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 9 tests using 1 worker

  ✓  1 …ipped by the four-view shell, and the goal chooser mounts itself (702ms)
  ✓  2 …d restores evidence-complete progress and never completes visits (956ms)
  ✓  3 …torage reports session-only and never claims durable persistence (589ms)
  ✓  4 …g stales only dependent steps and excludes stale packet outcomes (630ms)
  ✓  5 …review changes only local packet state and triggers no execution (800ms)
  ✓  6 … registered tool exposes concrete goals through one Journey shell (3.7s)
  ✓  7 …91:1 › the Journey chooser on a tool page is scoped to that tool (607ms)
  ✓  8 …6:1 › the Market Action Center remains the global journey surface (3.1s)
  ✓  9 …cenario lab share evidence completion backtrack and packet rules (583ms)

  9 passed (13.6s)
```

**Result:** The target passes after all same-file predecessors. Same-file
cumulative state or resource leakage is not supported by current evidence.

## Intraday Expected-Failure Semantics

**Phase:** bug
**Command:** `timeout 180 npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence" --reporter=json --workers=1 --retries=0`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The reporter marks the test expected only because its body
actually failed the visible-sensitivity assertion; therefore the marker remains
truthful and the glyph is excluded from counted failures.

Relevant window from the complete JSON reporter output:

```text
"title": "Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence",
"ok": true,
"annotations": [
  {
    "type": "fail",
    "description": "session-auction Simple read does not surface summary.control or summary.sessionType movement"
  }
],
"expectedStatus": "failed",
"results": [
  {
    "status": "failed",
    "duration": 732,
    "error": {
      "message": "expect(received).not.toBe(expected) // Object.is equality",
      "location": "tests/simple-model-adapters-market.spec.mjs:670:35"
    }
  }
],
"status": "expected",
"stats": {
  "expected": 1,
  "skipped": 0,
  "unexpected": 0,
  "flaky": 0
}
```

**Result:** The expected-failure marker remains truthful. The adapter now names
`summary.control.label` and `summary.sessionType.ownerType`, but the selected
control changes still render byte-identical baseline and changed text. This is
an expected product gap, not an unexpected-pass test defect or counted blocker.

## Source-Grounded Root Cause

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** Current source and execution outcomes support a localized
test budget defect; no production mutation is justified.

- `tests/journey.spec.mjs::mountJourneyOnPage` waits 15 seconds for visible,
  ready, and controller-live state.
- `rlapp.js::mountJourney` awaits `tool-experience.config.json`,
  `journeys.json`, the registry, and `rljourney.js`, mounts the controller, then
  publishes ready and `__rljourneyController`.
- Failed production inputs publish `unavailable`; extra time cannot satisfy the
  test unless production reaches the real ready state.
- Focused and same-file runs reach that state with all registry assertions
  unchanged.

## Mutation Boundary

**Phase:** implement
**Claim Source:** executed

The mutation is limited to the authorized helper timeout flow and one Center
call site. A normalization check reconstructed the current file from `HEAD` by
applying exactly those four edits and required byte equality.

**Commands:**

```text
git diff --check -- tests/journey.spec.mjs
git --no-pager diff -- tests/journey.spec.mjs
node -e '<exact four-replacement byte-boundary check against HEAD>'
```

**Exit Codes:** 0, 0, 0

```text
diff --git a/tests/journey.spec.mjs b/tests/journey.spec.mjs
index 03b0a54a..5e2b5ff3 100644
--- a/tests/journey.spec.mjs
+++ b/tests/journey.spec.mjs
@@ -113,13 +113,13 @@ async function openPage(page) {

 /* Activate the SHIPPED Journey view and wait for the SHIPPED mount. The four-view shell owns both
    the host and the call to RLAPP.mountJourney(); tests must never manufacture either one. */
-async function mountJourneyOnPage(page) {
+async function mountJourneyOnPage(page, timeout = 15_000) {
   await page.locator('#rlviews button[data-rlview-mode="journey"]').click();
   await page.waitForFunction(() => {
     const panel = document.querySelector('[data-rlexperience-panel="journey"]');
     const anchor = panel && panel.querySelector('[data-rljourney-mount]');
     return !!(panel && !panel.hidden && anchor && anchor.getAttribute('data-rljourney-state') === 'ready' && globalThis.__rljourneyController);
-  }, undefined, { timeout: 15000 });
+  }, undefined, { timeout });
 }

 /* The Market Action Center is the GLOBAL journey surface; a tool page is scoped to its own
@@ -524,8 +524,9 @@ test('the Journey chooser on a tool page is scoped to that tool', async ({ page
 });

 test('the Market Action Center remains the global journey surface', async ({ page }) => {
+  test.slow();
   await openCenter(page);
-  await mountJourneyOnPage(page);
+  await mountJourneyOnPage(page, 30_000);

   const order = await page.evaluate(() => Array.from(document.querySelectorAll('[data-rljourney-tool]'))
     .map((li) => li.getAttribute('data-rljourney-tool')));
BYTE_BOUNDARY_OK
Only helper signature/default, wait timeout flow, target-local test.slow(), and target call argument differ from HEAD.
```

`git diff --check` emitted no output. The changed test blob is
`5e2b5ff327a6dd14e3e8d3dd7849052ec07d7fcd`. No production, Playwright
configuration, Feature 004, parent Feature 012, BUG-002, dependency, unrelated
test, or certification byte was changed by this implementation phase.

## Implementation GREEN Evidence

**Phase:** implement
**Claim Source:** executed
**Commands, in execution order:**

```text
timeout 180 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "the Market Action Center remains the global journey surface" --reporter=list --workers=1 --retries=0
timeout 300 npx --no-install playwright test tests/journey.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1 --retries=0
```

**Exit Codes:** 0, 0

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/journey.spec.mjs:526:1 › the Market Action Center remains the global journey surface (6.2s)
  1 passed (10.3s)

Running 9 tests using 1 worker

  ✓  1 [system-chrome] › tests/journey.spec.mjs:138:1 › the [data-rljourney-mount] anchor is shipped by the four-view shell, and the goal chooser mounts itself
  ✓  2 [system-chrome] › tests/journey.spec.mjs:175:1 › Regression: SCN-012-009 Journey reload restores evidence-complete progress and never completes visits
  ✓  3 [system-chrome] › tests/journey.spec.mjs:237:1 › Regression: SCN-012-009 disabled browser storage reports session-only and never claims durable persistence
  ✓  4 [system-chrome] › tests/journey.spec.mjs:291:1 › Regression: SCN-012-010 backtracking stales only dependent steps and excludes stale packet outcomes
  ✓  5 [system-chrome] › tests/journey.spec.mjs:358:1 › Regression: SCN-012-011 human review changes only local packet state and triggers no execution
  ✓  6 [system-chrome] › tests/journey.spec.mjs:425:1 › Regression: SCN-012-032 every registered tool exposes concrete goals through one Journey shell
  ✓  7 [system-chrome] › tests/journey.spec.mjs:491:1 › the Journey chooser on a tool page is scoped to that tool
  ✓  8 [system-chrome] › tests/journey.spec.mjs:526:1 › the Market Action Center remains the global journey surface
  ✓  9 [system-chrome] › tests/journey.spec.mjs:542:1 › Regression: wizard checklist decision tree and scenario lab share evidence completion backtrack and packet rules (1.1s)
  9 passed (22.9s)
```

**Result:** TP-B005-01 passed 1/1. TP-B005-02 passed 9/9 with the Center
target eighth. Both used one worker and zero retries.

## Syntax, Regression Quality, And Diagnostics

**Phase:** implement
**Claim Source:** executed

**Commands:**

```text
node --check tests/journey.spec.mjs
timeout 120 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/journey.spec.mjs
```

**Exit Codes:** 0, 0

`node --check` emitted no output. The guard emitted:

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-04T14:39:03Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/journey.spec.mjs
✅ Adversarial signal detected in tests/journey.spec.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
```

**Tool:** `get_errors` on `tests/journey.spec.mjs`
**Claim Source:** executed
**Observed:** `No errors found.`

## Artifact Packet Validation

**Phase:** bug
**Command:** `timeout 300 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget`
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

=== Anti-Fabrication Evidence Checks ===
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md

=== End Anti-Fabrication Checks ===

Artifact lint PASSED.
```

## Control-Plane Integrity And Test Immutability

**Phase:** bug
**Command:** `node -e 'const fs=require("node:fs"),crypto=require("node:crypto"),root="specs/012-market-action-center-and-guided-tools/bugs/BUG-005-journey-readiness-budget",files=["bug.md","spec.md","design.md","scopes.md","report.md","uservalidation.md","scenario-manifest.json","state.json"],state=JSON.parse(fs.readFileSync(root+"/state.json")),manifest=JSON.parse(fs.readFileSync(root+"/scenario-manifest.json")),scenario=manifest.scenarios[0],hash="sha256:"+crypto.createHash("sha256").update(JSON.stringify(scenario.gherkin)).digest("hex");files.forEach(file=>{if(!fs.existsSync(root+"/"+file))throw Error(file);console.log("OK="+file)});console.log("STATUS_MIRROR="+(state.status===state.certification.status));console.log("MODE_OK="+(state.workflowMode==="bugfix-fastlane"));console.log("SCENARIO_HASH_OK="+(hash===scenario.gherkinHash));console.log("JSON_INTEGRITY=PASS")' && git diff --exit-code -- tests/journey.spec.mjs tests/simple-model-adapters-market.spec.mjs && echo 'TARGET_TEST_DIFF=clean'`
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
SCENARIO_HASH_OK=true
JSON_INTEGRITY=PASS
TARGET_TEST_DIFF=clean
```

**Tool:** `get_errors` on the BUG-005 packet
**Claim Source:** executed
**Observed:** `No errors found.`

## Invocation Audit

No `runSubagent` capability was available in this invocation, and no subagent
was invoked. The packet records a route to the next registry owner rather than
fabricating design, plan, implementation, test, or validation specialist runs.

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
