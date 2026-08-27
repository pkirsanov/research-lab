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

## Fresh Test-Phase Execution At Current Revision

The commands in this section ran from a tracked-clean detached checkout at
`ff7a587643c8148e407df43075846a7e0f98b269`. They supersede the stale execution
outcomes above without rewriting those historical records.

### Fresh TP-BUG022-C03 Feature 008 Playwright Regression

**Phase:** test
**Executed:** YES (current session)
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 TP-BUG022-C03 Feature 008 Playwright at ff7a5876
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 1440 npx --no-install playwright test tests/portfolio-survival-accessibility.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 303
sha256: bd94cc46dcd01ac32f7f23104f94eb8b133c4b8d820cb7267f137989814f9248
--- first 20 ---

Running 94 tests using 2 workers

  ✓   2 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:109:1 › Regression: SCN-008-026 all six allocation methods share one frozen basis (1.2s)
  ✓   1 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:89:1 › Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete (1.5s)
  ✓   3 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:137:1 › Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner (512ms)
  ✓   5 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:158:1 › Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation (530ms)
  ✓   6 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:189:1 › Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states (573ms)
  ✓   7 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:235:1 › Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence (490ms)
  ✓   4 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:316:1 › Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision (2.1s)
  ✓   8 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:253:1 › Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions (553ms)
  ✓  10 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:293:1 › Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence (747ms)
  ✓   9 [system-chrome] › tests/portfolio-survival-accessibility.spec.mjs:501:1 › Adversarial: SCN-008-053 reduced accessibility implementations fail closed (1.3s)
  ✓  11 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:339:1 › Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate (736ms)
[TP-05-02] windows=pre-market,morning,pre-close,after-hours times=07:30,11:00,15:00,17:00 preserved=3 excludedAfterCutoff=1
  ✓  12 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:89:1 › Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time (497ms)
[TP-05-03] held=MSFT watchlistOnly=QQQ completedResearch=0 inferred=0 duplicated=0
  ✓  14 [system-chrome] › tests/portfolio-survival-brief.spec.mjs:175:1 › Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history (462ms)
  ✓  13 [system-chrome] › tests/portfolio-survival-allocation.spec.mjs:375:1 › Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity (671ms)
[TP-05-04] behaviorHistory=insufficient-history inferred=0 heldRetained=true explained=true
--- omitted 263 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓  77 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:143:1 › Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (569ms)
  ✓  79 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:180:1 › Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom (643ms)
  ✓  80 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:253:1 › Regression: SCN-008-015 concentration lenses expose overlap and missing look through (551ms)
  ✓  78 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:265:1 › Regression: SCN-008-020 dated cash need records before and after collision capital (1.5s)
  ✓  81 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:286:1 › Regression: SCN-008-016 beta alpha R squared and residual risk stay separate (556ms)
  ✓  83 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:325:1 › Regression: SCN-008-016 benchmark fit is unavailable rather than regressed against a guess (535ms)
  ✓  82 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:306:1 › Regression: SCN-008-021 missing survival definition renders distributions without probability (1.5s)
  ✓  84 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:344:1 › Regression: SCN-008-017 marginal and total risk contributions reconcile (552ms)
  ✓  86 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:372:1 › Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies (556ms)
  ✓  87 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:409:1 › Regression: SCN-008-017 return contribution stays distinct from risk contribution (540ms)
  ✓  88 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:438:1 › Regression: SCN-008-015 manual assets and absent look through stay visible not omitted (522ms)
  ✓  85 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:342:1 › Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity (2.2s)
  ✓  89 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:465:1 › Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity (614ms)
  ✓  91 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:527:1 › Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth (600ms)
  ✓  90 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:405:1 › Regression: Feature 008 an incomplete cash need is refused rather than partly assumed (1.1s)
  ✓  92 [system-chrome] › tests/portfolio-survival-risk.spec.mjs:565:1 › Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio (513ms)
  ✓  93 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:422:1 › Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path (2.5s)
  ✓  94 [system-chrome] › tests/portfolio-survival-paths.spec.mjs:463:1 › Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view (1.6s)

  94 passed (1.1m)
```

### Fresh TP-BUG022-C04 Clean-Tree Repository Selftest - Non-Zero

**Phase:** test
**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

The command ran immediately after `git status --short --branch` printed only
`## HEAD (no branch)` and `git rev-parse HEAD` printed
`ff7a587643c8148e407df43075846a7e0f98b269`.

```text
# BUG-022 TP-BUG022-C04 repository selftest clean ff7a5876
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 2340 node scripts/selftest.mjs
exit: 1
lines: 3961
sha256: 1eacd752e264cee527d5068ddd06ec820dd444ba40a0f96e4041fbb41445fcb9
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (1 new, 14 frozen, 0 stale of 86 claim(s))
--- omitted 3921 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a group missing `acceptanceBasis` on one member, and a group whose members each assert a DIFFERENT act, both FAIL — a partially-written declaration is the shape a bulk stamp would take if the exemption were the thing being gamed
  ✓ a third packet joining an already-declared act FAILS the whole group, because the two original members cover 2 of 3 — an exemption that grew silently would admit exactly the act being guarded (`coveredPackets` on specs/915-act-a covers 2 of the 3 packet(s) sharing this instant)
  ✓ the thirteen-record stamp — ten sharing ONE instant with three bare fields — still FAILS after the refinement, all ten reported, cleared by nothing: the exemption needs ten mutually-consistent covered sets and ten distinct bases, so it converts a silent side effect into a deliberate ten-part fabrication rather than opening a door (10 of 10 reported, group size 10)
  ✓ the scan read the real registry licence and parsed real acceptance records, so a green verdict is a comparison rather than a parser that stopped matching (25 record(s) in 63 file(s), 8 eligible, 3 collision group(s), baseline 4)
    DECLARED-ACT operator@1787696524 — declares one acceptance act `operator-session-2026-08-25-bug016-bug017` covering 2 packet(s), each with its own basis (specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main, specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos)
  ✓ no Human Acceptance Record outside the frozen baseline claims a live-session acceptance at an instant another packet also claims — a bulk stamp satisfies the terminal gate while asserting something that cannot have happened (0 new, 4 frozen, 0 stale of 4 colliding record(s))
  ✓ the real BUG-016/BUG-017 pair is cleared as ONE declared acceptance act rather than by a new baseline entry, and the frozen list still holds exactly the 4 pre-existing records — a baseline that grew to admit a legitimate record would stop meaning "debt awaiting correction" (1 declared act(s), baseline 4)

security findings — a declared bound that nothing validates is not a bound
  ✓ TB-SEC-02-01: a pack declaring an earliest claim age of zero or a negative is refused as RLTAX-PACK-INVALID naming that member, rather than admitted as a floor that lets every claim age through
  ✓ TB-SEC-02-02: no claim-age adjustment settles a negative benefit under any pack-declared floor, and the floor that is positive but too low to price refuses on the arithmetic naming the adjusted monthly benefit — a negative amount is finite, so the unrepresentable-figure guards cannot catch it (120 settled result(s) swept, 0 negative)
  ✓ TB-SEC-02-03: the shipped pack is untouched by both refusals — age 62 still settles at 1400, age 60 still refuses RLTAX-THRESHOLD-UNAVAILABLE under BUG-019’s own domain, and the full-retirement and delayed-credit ages still settle
  ✓ TB-SEC-01-01: the pack read holds its bound across the response BODY — the handler that receives the response head does not clear the timer, and the two disarm sites sit past the parsed body, so an origin that answers 200 and then stalls the stream is aborted rather than awaited without end
  ✓ TB-SEC-01-02: a declared read bound beyond the largest delay a timer can represent is refused by name rather than armed, the boundary value itself is still admitted, and the shipped configuration still validates — one past the ceiling the delay wraps and the bound fires at once instead of waiting longer
  ✓ TB-SEC-03-01: the probe anchors its repository from the checkout it is RUN IN before any target is examined, and no path seeds that anchor from a target, so the cross-repository guard reads "this repository" rather than "the same one the first --file happened to be in"
  ✓ TB-SEC-03-02: a --file in another Git checkout is refused at registration with the dirty-target exit rather than accepted as a new anchor, and the foreign file is byte-identical afterwards because the refusal lands before any target is hashed or mutated (exit 4)

================================================
Research-Lab self-test: 3464 passed, 1 failed
================================================
```

The dedicated scope-progress validator isolated the single failure:

```text
# BUG-022 scope-progress diagnosis at ff7a5876
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 120 node scripts/validate-scope-dod-progress.mjs --all
exit: 1
lines: 3
sha256: 0ac66e0d11d25030e201821c4333328cf5bdab2ec874b4c8248aee3d158c3234
--- output ---
[scope-dod-progress] packets=63 claims=86 agree=71 drift=15 unresolved=0 baseline=14 new=1 stale=0
  NEW-DRIFT specs/_bugs/BUG-022-historical-report-declaration-leak#01::certification (01-separate-active-declarations-from-historical-receipts) — claims 12/3 checked/unchecked, artifact has 12/4 [specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md]
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

## Fresh Test-Owned Closure At Current Validate Revision

The commands below ran from a tracked-clean detached checkout at
`c652cd092e8394d3d33803824153e906633e7f6e`. They supersede only the
non-zero C04 and containment uncertainty recorded above. They do not change
status, certification, scope status, or human acceptance.

### Fresh TP-BUG022-C04 Clean-Tree Repository Selftest At c652cd092

**Phase:** test
**Executed:** YES (current session)
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 2940 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 TP-BUG022-C04 clean-tree selftest at c652cd092
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 2940 node scripts/selftest.mjs
exit: 0
lines: 3960
sha256: 805c958016f75c304fc504ef35ede3bd267020a9ecaabaa012c992bd6fd272c7
--- first 20 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title

Feature 004 RLFX/RLDATA foundation
  ✓ RLFX CommonJS import preserves the existing global and explicit decisionTime is deterministic
  ✓ RLFX universe is bounded closed and asserts no live source authorization
  ✓ RLDATA source envelopes preserve approved rights and clocks and reject metadata-free rows
  ✓ RLDATA schema-one bars and legacy tool reads remain compatible beside versioned envelopes
  ✓ RLDATA Twelve Data mapping: interval/symbol translate, values sort newest-first → oldest-first with UTC epochs, empty volume → null, error/malformed → null
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- omitted 3920 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a group missing `acceptanceBasis` on one member, and a group whose members each assert a DIFFERENT act, both FAIL — a partially-written declaration is the shape a bulk stamp would take if the exemption were the thing being gamed
  ✓ a third packet joining an already-declared act FAILS the whole group, because the two original members cover 2 of 3 — an exemption that grew silently would admit exactly the act being guarded (`coveredPackets` on specs/915-act-a covers 2 of the 3 packet(s) sharing this instant)
  ✓ the thirteen-record stamp — ten sharing ONE instant with three bare fields — still FAILS after the refinement, all ten reported, cleared by nothing: the exemption needs ten mutually-consistent covered sets and ten distinct bases, so it converts a silent side effect into a deliberate ten-part fabrication rather than opening a door (10 of 10 reported, group size 10)
  ✓ the scan read the real registry licence and parsed real acceptance records, so a green verdict is a comparison rather than a parser that stopped matching (25 record(s) in 63 file(s), 8 eligible, 3 collision group(s), baseline 4)
    DECLARED-ACT operator@1787696524 — declares one acceptance act `operator-session-2026-08-25-bug016-bug017` covering 2 packet(s), each with its own basis (specs/_bugs/BUG-016-combined-tax-panel-wiring-absent-on-origin-main, specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos)
  ✓ no Human Acceptance Record outside the frozen baseline claims a live-session acceptance at an instant another packet also claims — a bulk stamp satisfies the terminal gate while asserting something that cannot have happened (0 new, 4 frozen, 0 stale of 4 colliding record(s))
  ✓ the real BUG-016/BUG-017 pair is cleared as ONE declared acceptance act rather than by a new baseline entry, and the frozen list still holds exactly the 4 pre-existing records — a baseline that grew to admit a legitimate record would stop meaning "debt awaiting correction" (1 declared act(s), baseline 4)

security findings — a declared bound that nothing validates is not a bound
  ✓ TB-SEC-02-01: a pack declaring an earliest claim age of zero or a negative is refused as RLTAX-PACK-INVALID naming that member, rather than admitted as a floor that lets every claim age through
  ✓ TB-SEC-02-02: no claim-age adjustment settles a negative benefit under any pack-declared floor, and the floor that is positive but too low to price refuses on the arithmetic naming the adjusted monthly benefit — a negative amount is finite, so the unrepresentable-figure guards cannot catch it (120 settled result(s) swept, 0 negative)
  ✓ TB-SEC-02-03: the shipped pack is untouched by both refusals — age 62 still settles at 1400, age 60 still refuses RLTAX-THRESHOLD-UNAVAILABLE under BUG-019’s own domain, and the full-retirement and delayed-credit ages still settle
  ✓ TB-SEC-01-01: the pack read holds its bound across the response BODY — the handler that receives the response head does not clear the timer, and the two disarm sites sit past the parsed body, so an origin that answers 200 and then stalls the stream is aborted rather than awaited without end
  ✓ TB-SEC-01-02: a declared read bound beyond the largest delay a timer can represent is refused by name rather than armed, the boundary value itself is still admitted, and the shipped configuration still validates — one past the ceiling the delay wraps and the bound fires at once instead of waiting longer
  ✓ TB-SEC-03-01: the probe anchors its repository from the checkout it is RUN IN before any target is examined, and no path seeds that anchor from a target, so the cross-repository guard reads "this repository" rather than "the same one the first --file happened to be in"
  ✓ TB-SEC-03-02: a --file in another Git checkout is refused at registration with the dirty-target exit rather than accepted as a new anchor, and the foreign file is byte-identical afterwards because the refusal lands before any target is hashed or mutated (exit 4)

================================================
Research-Lab self-test: 3465 passed, 0 failed
================================================
```

### Fresh Change Boundary Containment At c652cd092

**Phase:** test
**Executed:** YES (current session)
**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 540 node /private/tmp/rl-bug022-containment-db38903e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

The temporary read-only harness replayed the original delivery slice
`7d0b3147a..ec28e258d` and checked protected invariants at current HEAD. It
enumerated every allowed delivery path, required one atomic three-file
implementation commit, compared the protected Feature 008 report and both
ratchets, scanned the focused test for skip/only/todo/pending and silent-pass
patterns, and invoked the bugfix regression-quality guard.

```text
# BUG-022 exact current-revision Change Boundary containment
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 540 node /private/tmp/rl-bug022-containment-db38903e.mjs
exit: 0
lines: 49
sha256: 866f3a0b34ce3fc48a36208acd2561e5993e0e48b4337b5612e3bf62bedce2bb
--- first 20 ---
CONTAINMENT_BASE=7d0b3147a
DELIVERY_HEAD=ec28e258d6e65e0eaf4cce433ef885eee785af5f
CURRENT_HEAD=c652cd092e8394d3d33803824153e906633e7f6e
PASS current revision matches requested validate commit
PASS clean detached worktree
DELIVERY_TOUCHING_COMMITS=2
CHECK commit=ec28e258d subject=docs(BUG-022): record implementation evidence
ALLOW ec28e258d specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
ALLOW ec28e258d specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md
ALLOW ec28e258d specs/_bugs/BUG-022-historical-report-declaration-leak/state.json
CHECK commit=f226ae5c3 subject=fix(BUG-022): classify active test declarations
ALLOW f226ae5c3 .specify/memory/agents.md
ALLOW f226ae5c3 scripts/validate-test-file-reachability.mjs
ALLOW f226ae5c3 tests/playwright-runtime.foundation.functional.mjs
PASS atomic implementation commit=f226ae5c3 paths=3
PASS protected Feature 008 report unchanged
PASS reachability baseline file unchanged
KNOWN_DISCOVERY_CROSSINGS_BASE_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_DISCOVERY_CROSSINGS_HEAD_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
PASS KNOWN_DISCOVERY_CROSSINGS unchanged
--- omitted 9 line(s); sha256 above covers the full output ---
--- last 20 ---

ℹ️  Scanning tests/playwright-runtime.foundation.functional.mjs
✅ Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 1
  Files with adversarial signals: 1
============================================================
REGRESSION_QUALITY_EXIT=0
PASS focused regression-quality guard
ALLOWED_CHANGED_PATH_COUNT=6
CHANGED_ALLOWED .specify/memory/agents.md
CHANGED_ALLOWED scripts/validate-test-file-reachability.mjs
CHANGED_ALLOWED specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
CHANGED_ALLOWED specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md
CHANGED_ALLOWED specs/_bugs/BUG-022-historical-report-declaration-leak/state.json
CHANGED_ALLOWED tests/playwright-runtime.foundation.functional.mjs
CONTAINMENT_FAILURES=0
leakage=0
```

### Scope-Progress Validator After C03 Closure - Non-Zero

**Phase:** test
**Executed:** YES (current session)
**Command:** `node scripts/validate-scope-dod-progress.mjs --all`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-022 scope-progress after C03 closure
$ /usr/bin/perl -e alarm shift @ARGV; exec @ARGV 120 node scripts/validate-scope-dod-progress.mjs --all
exit: 1
lines: 3
sha256: 03e245e713bdd27a6a80fdf89fe5844e89c035d00e274ad17ae72b0b830391ae
--- output ---
[scope-dod-progress] packets=63 claims=86 agree=71 drift=15 unresolved=0 baseline=14 new=1 stale=0
  NEW-DRIFT specs/_bugs/BUG-022-historical-report-declaration-leak#01::certification (01-separate-active-declarations-from-historical-receipts) — claims 12/3 checked/unchecked, artifact has 14/2 [specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md]
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

### Code Diff Evidence

**Phase:** implement
**Executed:** YES (current session)
**Command:** `git cat-file -t 7d0b3147ac69bf0dfce94c24770b69d9b1f334a2 && git cat-file -t ec28e258d6e65e0eaf4cce433ef885eee785af5f && git merge-base --is-ancestor 7d0b3147ac69bf0dfce94c24770b69d9b1f334a2 ec28e258d6e65e0eaf4cce433ef885eee785af5f && git diff --name-status 7d0b3147ac69bf0dfce94c24770b69d9b1f334a2..ec28e258d6e65e0eaf4cce433ef885eee785af5f && git log --reverse --format='%H %s' 7d0b3147ac69bf0dfce94c24770b69d9b1f334a2..ec28e258d6e65e0eaf4cce433ef885eee785af5f`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

**Derived range:** base `7d0b3147ac69bf0dfce94c24770b69d9b1f334a2`; head `ec28e258d6e65e0eaf4cce433ef885eee785af5f`.

**Changed files:**

- Source: `scripts/validate-test-file-reachability.mjs`
- Test: `tests/playwright-runtime.foundation.functional.mjs`
- Config: `.specify/memory/agents.md`
- Config: `specs/_bugs/BUG-022-historical-report-declaration-leak/state.json`
- Docs: `specs/_bugs/BUG-022-historical-report-declaration-leak/report.md`
- Docs: `specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md`

**Containment:** `f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a` is the single three-file implementation commit. Its parent is the derived base. `ec28e258d6e65e0eaf4cce433ef885eee785af5f` is its direct child and changes only packet evidence. The two-commit range contains exactly the six paths above, so no protected Feature 008 report or baseline is in the delivery delta.

```text
commit
commit
M       .specify/memory/agents.md
M       scripts/validate-test-file-reachability.mjs
M       specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
M       specs/_bugs/BUG-022-historical-report-declaration-leak/scopes.md
M       specs/_bugs/BUG-022-historical-report-declaration-leak/state.json
M       tests/playwright-runtime.foundation.functional.mjs
f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a fix(BUG-022): classify active test declarations
ec28e258d6e65e0eaf4cce433ef885eee785af5f docs(BUG-022): record implementation evidence
```

## Regression Phase Attempt At `4bf10c039` - Route Required

### Verdict

**Phase:** regression
**Claim Source:** executed
**Outcome:** `route_required`
**Verdict:** `REGRESSION_DETECTED`

BUG-022's focused behavior, direct Feature 008 Node suites, clean-tree
selftest, regression-quality guard, and protected-byte checks passed. The
required Feature 008 Playwright command did not pass. All 94 browser scenarios
passed, but Playwright force-killed `worker-1` after its 300000ms teardown bound
and exited 1 with two errors outside test bodies.

This is the exact active defect class recorded by BUG-017. This run also
contradicts BUG-017's current claim that the committed two-worker pin avoids
the stall. The finding is routed to `bubbles.stabilize` against
`specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos`.
No BUG-017 artifact or implementation file changed. No completed `regression`
phase claim is recorded for BUG-022.

### Derived Regression Surface

**Phase:** regression
**Claim Source:** executed

The implementation parent is
`7d0b3147ac69bf0dfce94c24770b69d9b1f334a2`. The single implementation commit
is `f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a`. The regression epoch is
`4bf10c03906733cefe2b1de707faa3996ba25c66`.

```text
IMPLEMENTATION_CHANGED_PATHS=3
CHANGED .specify/memory/agents.md
CHANGED scripts/validate-test-file-reachability.mjs
CHANGED tests/playwright-runtime.foundation.functional.mjs
NUMSTAT 11      0       .specify/memory/agents.md
NUMSTAT 270     16      scripts/validate-test-file-reachability.mjs
NUMSTAT 289     0       tests/playwright-runtime.foundation.functional.mjs
FEATURE008_TEST_FILE_DELTA=0
```

The collector and foundation carrier share the declaration-classification
contract. Feature 008 is the protected dependent feature because the historical
receipt and the eight browser specifications are its artifacts. BUG-017 is the
affected cross-spec runtime because it owns the observed local macOS teardown
failure and shares the foundation carrier and Playwright configuration.

### Baseline Comparison

| Check | Prior packet baseline | Current result | Delta |
| --- | --- | --- | --- |
| Six BUG-022 functional rows | 6 passed, exit 0 | 6 passed, exit 0 | Stable |
| Feature 008 direct Node | 257 passed, exit 0 | 257 passed, exit 0 | Stable |
| Feature 008 Playwright | 94 passed, exit 0 | 94 passed, exit 1, two non-test errors | Regression |
| Full selftest | 3465 passed, 0 failed | 3465 passed, 0 failed | Stable |

The command registry declares no numerical line-coverage command. The executed
structural delta check found test declarations increasing from 11 to 23 and
assert calls increasing from 57 to 106. It found zero deleted tests, zero
deleted assertion lines, zero new skip/only/todo markers, zero permissive
assertions, and zero Feature 008 test-file edits.

### Focused Six Functional Tests

**Phase:** regression
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 regression six focused functional tests at 4bf10c039
exit: 0
lines: 14
sha256: 219fdc867e79180d292c1745fa45fd1d64a7d8aa7a0e1679556aa50e7d0b6efa
tests 6
pass 6
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 2016.037292
```

### Repository Reachability

**Phase:** regression
**Command:** `node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 regression repository reachability at 4bf10c039
exit: 0
lines: 43
sha256: 232f53d2e10cfef68fbbadfd5a56bb68b69ebb22ed7d48f42cb342cbfd7da1a3
testFiles=201
activeGlobs=10
historicalSites=30
classificationErrors=0
reachable=184
exempt=11
orphans=6
```

### Feature 008 Direct Node Suites

**Phase:** regression
**Command:** `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 regression Feature 008 direct Node suites at 4bf10c039
exit: 0
lines: 266
sha256: 989078ab35b2874e39686af8b17e381f7f9594a4860f2fe15342d1f3c2d2ba64
tests 257
suites 0
pass 257
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 4629.239375
```

### Feature 008 Playwright Suite - Non-Zero

**Phase:** regression
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-022 regression Feature 008 portfolio Playwright at 4bf10c039
exit: 1
lines: 306
sha256: d68b33966cfeefd77a19141b312a77014d1c5d2f60d5767539cd13ab48b2be65
Running 94 tests using 2 workers
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
94 passed (5.9m)
2 errors were not a part of any test, see above for details
```

### Clean-Tree Full Selftest

**Phase:** regression
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 regression clean-tree full selftest at 4bf10c039
exit: 0
lines: 3960
sha256: efefd867ffc731f693e91cb117629388ac3101324457a43b509f12896de499c1
Step 1 security - escaped model sinks and CSP on every page
Feature 004 RLFX/RLDATA foundation
security findings - a declared bound that nothing validates is not a bound
Research-Lab self-test: 3465 passed, 0 failed
```

### Regression Quality Guard

**Phase:** regression
**Command:** `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-022 regression quality guard at 4bf10c039
exit: 0
lines: 15
sha256: 60c5fdf627156ec3bc7ad7d88128aac403b250cde55fadfce3d6b18bcc7904d6
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/playwright-runtime.foundation.functional.mjs
Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
```

### Protected Bytes And Ratchets

**Phase:** regression
**Command:** current-session Node byte comparator over the protected report, reachability baseline, and `KNOWN_DISCOVERY_CROSSINGS`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
PROTECTED_REPORT_ANCHOR=359d536bbeb8f10c3184aba9397b1b1f972e7d70
PROTECTED_REPORT_ANCHOR_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_CURRENT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_BYTES=251561
REACHABILITY_BASELINE_BASE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_CURRENT_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_COUNTS=26->26
KNOWN_CROSSINGS_BASE_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSINGS_CURRENT_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSING_COUNTS=9->9
CONTAINMENT_FAILURES=0
leakage=0
```

### Coverage Delta And Weakening Scan

**Phase:** regression
**Command:** current-session Node diff audit over `7d0b3147a..f226ae5c3`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
FOUNDATION_TEST_DECLARATIONS=11->23
FOUNDATION_ASSERT_CALLS=57->106
DIFF_ADDED_TEST_DECLARATIONS=12
DIFF_DELETED_TEST_DECLARATIONS=0
DIFF_ADDED_ASSERTION_LINES=49
DIFF_DELETED_ASSERTION_LINES=0
DIFF_ADDED_SKIP_ONLY_TODO=0
DIFF_ADDED_PERMISSIVE_ASSERTIONS=0
FEATURE008_TEST_FILE_DELTA=0
COVERAGE_DELTA_FAILURES=0
```

### Routed Finding

`REG-BUG022-001` is unresolved. The required two-worker `system-chrome`
portfolio suite passed every scenario but exited 1 after Playwright force-killed
its worker. BUG-017 owns that failure class. Its current mitigation and
disclosure must be reassessed against this current-revision reproduction before
BUG-022 can record a completed regression phase.

### Final Governance Receipts

**Phase:** regression
**Claim Source:** executed

```text
command: bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak
exit: 0
result: Artifact lint PASSED
command: node scripts/validate-scope-dod-progress.mjs --all
exit: 0
sha256: b5a9ca8bc45dec0c5056a5a3a21883be1163a6a543e818f032093730455961a7
scope-progress: packets=63 claims=86 agree=72 drift=14 baseline=14 new=0 stale=0
command: node scripts/validate-acceptance-bulk-stamp.mjs
exit: 0
sha256: 4cc6dabaa6ef05110ef65d568e833c847c0bed35c092423761522d3c410fbabe
acceptance: files=63 records=25 eligible=8 new=0 stale=0
command: node scripts/pii-scan.mjs
exit: 0
sha256: ed2dc946715b18f001c21e2d35934b3625e2578dc11bc91233758fc6612cb7e5
pii: files=10016 messages=2298 findings=0
command: bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak
exit: 1
sha256: 8581650764ddd2096fd0da86d7f58693277bf83ff51eff82521e7ecc82414835
failedGateIds: [G022,G027,G136]
failedChecks: [Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 11
verdict: FAIL
```

The transition refusal is the required current non-terminal outcome. It does
not override the Playwright failure, complete the regression phase, certify a
scope, or change either status mirror.

## Stabilization Reassessment At `d532faaac` {#stabilization-reassessment-at-d532faaac}

**Phase:** stabilize
**Claim Source:** interpreted
**Interpretation:** BUG-017 remains active. BUG-022 C03 has no final-tree exit-0 evidence.

Fresh evidence is recorded in
[BUG-017 current-revision stabilization](../BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md#current-revision-stabilization-at-d532faaac).
The bounded full-run matrix produced two failures from two runs at the committed two-worker
setting. Both runs reported 94 passing scenarios before Playwright force-killed workers. Two
one-worker runs each reported 94 passes and exit 0.

The diagnosis tied the stuck process to the Foundation spec's system-Chrome pipe transport.
Repository HTTP servers had closed. Chrome had exited. The worker retained two transport Socket
handles and never reached `process.exit(0)`. A focused worker-boundary plus early browser-close
candidate passed Foundation followed by Paths with a strict 15000ms stop bound.

The sixth full run used a rejected bare-close probe. Playwright recorded
`"afterAll" hook timeout of 30000ms exceeded` and `status: failed`. VS Code discarded the async
terminal payload before retrieval, so no numeric outer exit is asserted. The result is not
exit-0 evidence and cannot complete C03.

`REG-BUG022-001` remains unresolved. BUG-022 stays `in_progress`. No checkbox, state field,
certification field, acceptance field, protected Feature 008 report, or baseline changed. No
stabilize phase claim is recorded.
