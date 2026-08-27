# Report: BUG-022 Historical Report Declaration Leak

Links: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Current Packet Report

### Summary

The filing phase identified an artifact-authority defect in
`collectDeclaredTestGlobs()`. The parser treats immutable `report.md` receipts
as current Node suite declarations. A report-only Feature 008 pattern causes
eight false runner crossings. Excluding report receipts also exposes two real
Node families whose current authority must be made explicit.

### Completion Statement

The bug packet is filed and the parser root cause is diagnosed. No source or
test fix is claimed. No test-pass, validation-pass, or certification claim is
made. Status remains `in_progress`.

### Test Evidence

No implementation or test phase has executed for this packet. The operator's
failing command is diagnostic input only until the test owner re-executes it.

## Bug Reproduction - Before Fix

**Phase:** bug
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** not executed by this agent
**Claim Source:** not-run

> **Uncertainty Declaration**
> **What was attempted:** The filing phase executed the production parser and a declaration-authority counterfactual, not the Node test runner.
> **What was observed:** The operator supplied an 8-path failure. Current parser execution identified the same report-only pattern and its eight selected paths.
> **Why this is uncertain:** Operator-provided output cannot be restated as this agent's execution evidence.
> **What would resolve this:** The test owner must run the exact command before any implementation edit and record its real exit and output here.

## Diagnostic Evidence - Declaration Authority Counterfactual

**Phase:** bug
**Command:** current-session Node diagnostic importing `collectDeclaredTestGlobs`, `globToRegExp`, and `validateTestFileReachability`, then filtering only sites whose basename is `report.md`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The portfolio pattern is historical rather than active because all eight new crossings disappear when only report receipt sites are removed. The same filter reveals active-declaration debt for two separate Node families, so report scoping must ship with explicit command-registry declarations.

```text
reportOnlyPatterns:
  tests/*.functional.mjs
  tests/*.test.mjs
  tests/portfolio-*.mjs
crossingsBefore:
  9 frozen crossings
  8 portfolio-survival crossings
crossingsAfterExcludingReportReceipts:
  9 frozen crossings
  0 portfolio-survival crossings
currentOrphanCount: 7
activeAuthorityOrphanCount: 40
newlyExposedOrphans: 33
COUNTERFACTUAL_EXIT=0
```

The complete output was retained by the current-session terminal tool result.
This compact block records the discriminating signals without claiming that the
runtime-foundation test itself ran.

## Root Cause Evidence

**Claim Source:** interpreted
**Interpretation:** Source inspection identifies the mechanism that produced the executed diagnostic.

- `listFilesRecursive()` traverses every non-ignored directory.
- `collectDeclaredTestGlobs()` excludes only its own source and baseline.
- Every other readable text line is tested with `NODE_TEST_INVOCATION`.
- No function classifies `report.md` as execution evidence rather than command authority.
- The Feature 008 BUG-004 report line 3856 is the only site for `tests/portfolio-*.mjs`.

## Origin And Packet Ownership

**Phase:** bug
**Command:** fresh `git fetch origin main`, local `find specs -type d -name 'BUG-*'`, and `git ls-tree -d --name-only origin/main:specs/_bugs`
**Exit Code:** 0
**Claim Source:** executed

```text
local HEAD: 9dbd3b87c
origin/main: 3c8828f7c
local highest cross-feature id: BUG-021
origin/main highest cross-feature id: BUG-021
worktree count: 1
existing owner for this defect: none found
assigned packet: BUG-022-historical-report-declaration-leak
FETCH_EXIT=0
ORIGIN_TREE_EXIT=0
```

## Invocation Audit

No subagent was invoked during packet filing. The host runtime exposes no
`runSubagent` tool in this invocation, so design, planning, implementation,
test, validation, documentation, and recap dispatches remain unclaimed.

## Planning Handoff

Scope 1 maps repository closure to
`scripts/validate-test-file-reachability.mjs` and focused authority behavior to
`tests/playwright-runtime.foundation.functional.mjs`. These are planned test
paths only. This section records no implementation, execution, or pass claim.

## Change Ledger

The filing operation created only the eight artifacts in this BUG-022 packet.
No source, test, command-registry, historical report, protected bug packet, or
concurrent dirty path was edited by the filing phase.

## Implementation Execution - 2026-08-27T12:51:20Z

### Execution Summary

Commit `f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a` changes only these files:

- `.specify/memory/agents.md`
- `scripts/validate-test-file-reachability.mjs`
- `tests/playwright-runtime.foundation.functional.mjs`

The collector now assigns closed artifact and section roles to every command
candidate. Active, historical, and error sites remain separate. The command
registry now declares the functional and direct-test Node families.

### RED-01 - Existing Crossing Reproduction

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern='^committed discovery boundary keeps browser specs and direct Node suites disjoint$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED RED

```text
# BUG-022 RED-01 unchanged discovery boundary with dependencies
exit: 1
lines: 41
sha256: 4c2060a926fe7b4601f8d9d146cac06bedef5021e9cfbe1f8e0bad961829b9a3
✖ committed discovery boundary keeps browser specs and direct Node suites disjoint
AssertionError [ERR_ASSERTION]: file selected by both the browser matcher and a declared node --test glob
actual: [
  'tests/portfolio-survival-accessibility.spec.mjs',
  'tests/portfolio-survival-allocation.spec.mjs',
  'tests/portfolio-survival-brief.spec.mjs',
  'tests/portfolio-survival-diversification.spec.mjs',
  'tests/portfolio-survival-foundation.spec.mjs',
  'tests/portfolio-survival-mobile.spec.mjs',
  'tests/portfolio-survival-paths.spec.mjs',
  'tests/portfolio-survival-risk.spec.mjs'
]
expected: []
```

### RED-02 Through RED-06 And CTRL-01

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED RED with positive control green

```text
# BUG-022 RED-02 through RED-06 plus CTRL-01
exit: 1
lines: 144
sha256: 0548aa4bb5f69dfbbbc781c0538489212337d4f62571062619d3fb44023e0ca0
✖ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✖ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✖ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✖ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✖ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
tests 6
pass 1
fail 5
```

### Focused GREEN

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 focused GREEN with adversarial controls
exit: 0
lines: 14
sha256: 1dc42df34685ba8d09d852bc584dd17e54299d6a61d0bf4b06938ed07b00c5c4
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
tests 6
pass 6
fail 0
```

The crossing regression includes an active Test Plan with the same broad
portfolio glob. Both that active Node glob and Playwright select the fixture
spec. The historical copy remains diagnostic only.

### Reachability GREEN

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 final precommit reachability
exit: 0
lines: 43
sha256: 599da5809ed875ffff54f0a4befb0203252108ddd2326c078f254fdd16cfa982
201 test file(s) in tests/
10 active glob(s)
28 historical site(s)
0 classification error(s)
184 reachable
11 exempt (shared-helper-module)
6 orphan(s)
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:151
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:152
```

The baseline file and `KNOWN_DISCOVERY_CROSSINGS` did not change.

### Runtime Foundation GREEN

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 final precommit runtime foundation
exit: 0
lines: 44
sha256: 1ae7c796998049cf63ca419b946f276dc44fb14a0dfc4dd1da2e3ef05c36f8c3
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] frozenCrossings=9
[playwright-runtime] newCrossings=0
[playwright-runtime] discoveryTaxonomy=PASS
tests 14
pass 14
fail 0
```

### Feature 008 Node Regression

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 Feature 008 Node regressions
exit: 0
lines: 266
sha256: 1ff92c176d87fa2ecd9ea7c14e56cfbc73bbabd6361c17475546da92f972a61f
✔ SCN-008-046 all five public artifacts contribute independently to one local generic evidence identity
✔ SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
✔ SCN-008-047 failed candidate preserves the last valid structured result
✔ BUG-005: a stale domain must not suppress the fresh domains beside it
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
✔ TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control
tests 257
pass 257
fail 0
```

### Feature 008 Playwright Regression - Non-Zero

**Phase:** implement
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-022 Feature 008 Playwright regressions
exit: 1
lines: 306
sha256: ff5ecd3efac44f45f095793b3336380d7911b1ac575cc99d1f98f07e0cf414d3
Running 94 tests using 2 workers
✓ 92 [system-chrome] Regression: Feature 008 an incomplete cash need is refused rather than partly assumed
✓ 93 [system-chrome] Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
✓ 94 [system-chrome] Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
94 passed (5.8m)
2 errors were not a part of any test, see above for details
```

All 94 browser scenarios passed. The command remains non-zero because the
system-chrome worker teardown reproduced the protected BUG-017 failure class.
This invocation did not edit BUG-017.

### Clean-Tree Repository Selftest - Non-Zero

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

The command ran from tracked-clean commit
`f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a`.

```text
# BUG-022 canonical selftest clean f226ae5c3
exit: 1
lines: 3964
sha256: f0ca2f4598abdf294fac0cdde145a9e5b9eb1ba46b13fab1bba90ef48d37c854
Step 1 security — escaped model sinks and CSP on every page
✓ every shipped HTML page carries a Content-Security-Policy meta
✓ all pages use one identical CSP instead of drifting per page
✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline
14 new, 14 frozen, 0 stale of 86 claim(s)
Research-Lab self-test: 3464 passed, 1 failed
```

The default scope-progress output showed ten excluded BUG-016 through BUG-020
records and hid four findings behind its display limit. The `--all` run showed
three more excluded BUG-020 and BUG-021 records. It also showed BUG-022's
validate-owned `certification.scopeProgress` claim.

```text
# BUG-022 scope progress before execution recording
exit: 1
lines: 13
sha256: 4b45d9d901328ccea6797532bf6864f956dd7969a1e49882fa3503854aad80a9
[scope-dod-progress] packets=63 claims=86 agree=58 drift=28 unresolved=0 baseline=14 new=14 stale=0
NEW-DRIFT specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main#01::certification
NEW-DRIFT specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main#02::certification
NEW-DRIFT specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos#01::certification
NEW-DRIFT specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos#02::certification
NEW-DRIFT specs/_bugs/BUG-019-claim-ages-below-statutory-earliest-priced-as-settled#01::certification
[scope-dod-progress] FAIL — 14 scope progress claim(s) do not match their artifact
```

The full enumeration ran after execution progress was linked. It reported
BUG-022 as `claims 0/17 checked/unchecked, artifact has 9/6`. This agent did not
edit that certification field.

```text
# BUG-022 scope progress full enumeration after evidence links
exit: 1
lines: 16
sha256: f5a73d12b84d3bd1d7c86618960b6a5e3455cd847262bc8e8cca3c1ef195ad85
[scope-dod-progress] packets=63 claims=86 agree=58 drift=28 unresolved=0 baseline=14 new=14 stale=0
NEW-DRIFT specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main#01::certification
NEW-DRIFT specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos#01::certification
NEW-DRIFT specs/_bugs/BUG-019-claim-ages-below-statutory-earliest-priced-as-settled#01::certification
NEW-DRIFT specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite#01::certification
NEW-DRIFT specs/_bugs/BUG-021-pack-read-has-no-bound-so-the-route-waits-without-end#01::certification
NEW-DRIFT specs/_bugs/BUG-022-historical-report-declaration-leak#01::certification — claims 0/17 checked/unchecked, artifact has 9/6
[scope-dod-progress] FAIL — 14 scope progress claim(s) do not match their artifact
```

### Additional Requested Validators

**Phase:** implement
**Claim Source:** executed

```text
command: node scripts/validate-acceptance-bulk-stamp.mjs
exit: 0
sha256: 4cc6dabaa6ef05110ef65d568e833c847c0bed35c092423761522d3c410fbabe
[acceptance-bulk-stamp] files=63 records=25 eligible=8 ineligible=0 groups=3 declared-act=1 colliding=4 baseline=4 new=0 stale=0
[acceptance-bulk-stamp] OK — no new bulk-stamped acceptance record
command: node scripts/validate-spec-test-paths.mjs
exit: 0
sha256: c2b882d3b23d220aad82e7a3e1a42e151502248d30e8b4c125f6f6e86514aa29
[spec-test-paths] scanned=816 references=18774 distinctPaths=269 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
command: node scripts/pii-scan.mjs
exit: 0
sha256: e2c0ae3e76694969da57faa6b530c5be4552ae23b7afa743f57346713f9181b2
[pii-scan] files=10016 messages=2286 findings=0 OK
```

### Regression Quality

**Phase:** implement
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 bugfix regression quality
exit: 0
lines: 15
sha256: 7b75b28f4e95bc1ffd79b83bb6db80c93183f7d6c012a0a6e4cf28dc9456de55
BUBBLES REGRESSION QUALITY GUARD
Repo: /tmp/rl-bug022-db38903e
Bugfix mode: true
Scanning tests/playwright-runtime.foundation.functional.mjs
Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
```

### Current Verdict

The implementation and focused BUG-022 verification are complete. The packet
remains `in_progress`. Playwright has an excluded BUG-017 teardown failure.
The selftest also has 13 excluded drifts and one validate-owned BUG-022 drift.
No human acceptance, terminal status, or certification field changed.

### Packet Artifact Lint

**Phase:** implement
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 artifact lint after execution evidence
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Required artifact exists: spec.md
Required artifact exists: design.md
Required artifact exists: uservalidation.md
Required artifact exists: state.json
Required artifact exists: scopes.md
Required artifact exists: report.md
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Truthful Transition Guard

**Phase:** implement
**Executed:** YES (current session)
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED NON-TERMINAL REFUSAL

```text
# BUG-022 truthful transition guard after implementation
exit: 1
lines: 366
sha256: c4bfe43fdc71eb02d4a9938be1dba0a4650177d37158082fbb5fe63e75fa4976
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: [G022,G053,G093,G094,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 21
exitStatus: 1
verdict: FAIL
```

The guard did not change state. It refused terminal completion because the
packet still lacks complete DoD evidence and human acceptance.

### Change Containment

**Phase:** implement
**Executed:** YES (current session)
**Command:** bounded zsh allowlist check comparing the complete delta to `7d0b3147`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
base=7d0b3147
changed_count=6
ALLOW .specify/memory/agents.md
ALLOW scripts/validate-test-file-reachability.mjs
ALLOW specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
ALLOW specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md
ALLOW specs/_bugs/BUG-022-historical-report-declaration-leak/state.json
ALLOW tests/playwright-runtime.foundation.functional.mjs
UNCHANGED specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md
UNCHANGED scripts/validate-test-file-reachability.baseline
UNCHANGED .github/bubbles
UNCHANGED specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main
UNCHANGED specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos
UNCHANGED specs/_bugs/BUG-018-full-retirement-age-gaps-published-as-unavailable
UNCHANGED specs/_bugs/BUG-019-claim-ages-below-statutory-earliest-priced-as-settled
UNCHANGED specs/_bugs/BUG-020-income-beyond-double-range-settles-as-non-finite
UNCHANGED specs/_bugs/BUG-021-pack-read-has-no-bound-so-the-route-waits-without-end
UNCHANGED package.json
UNCHANGED package-lock.json
leakage=0
```
