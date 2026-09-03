# Report: BUG-022 Historical Report Declaration Leak

Links: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

<!-- bubbles:bug-packet-authority-iteration-4-begin -->

## Current Routing Authority After Convergence Iteration 4 {#current-routing-authority-after-convergence-iteration-4}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** Current implementation and test receipts supersede the filing-time routing statements below without changing their evidence.

Implementation and test phases have executed for BUG-022. The
[iteration-4 C03 consumer receipt](#test-phase-convergence-iteration-4-current-c03-consumer-receipt)
is the current dependency-consumer authority. Its
[linked BUG-017 process-residue proof](../BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md#test-phase-convergence-iteration-4-current-process-residue-proof)
records the selected config-default one-worker route. It records `system-chrome`,
`channel=chrome`, 94 of 94 passing, and exit 0. It records no force-kill,
lifecycle, skip, `todo`, `fixme`, or `only` marker. Playwright workers and
remote-debugging Chrome processes both had zero residue. Cleanup left no
repository or external probe artifact.

The `Current Packet Report` below remains a filing-time record. This section
supersedes its statement that no implementation or test phase executed. It
does not rewrite or erase that history.

The older
[two-worker dependency-unblock receipt](#bug-017-scope-4-dependency-unblock-receipt)
and [fallback-ineligible follow-up](#bug-017-scope-4-finalization-follow-up)
remain valid historical receipts. They are superseded and non-authoritative
for current routing. The same applies to older two-worker regression and
stabilization conclusions.

The one-worker route bounds exposure to BUG-017's observed teardown condition.
Neither current receipt claims BUG-017's mechanism or root cause was removed,
identified, or resolved.

BUG-022 remains `in_progress` pending validate-owned certification and human
acceptance. This section changes no terminal status, certification, scenario
state, completed phase, acceptance record, or test result.

<!-- bubbles:bug-packet-authority-iteration-4-end -->

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

### Iteration 4 Baseline Comparison

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

## BUG-017 Scope 4 Dependency-Unblock Receipt {#bug-017-scope-4-dependency-unblock-receipt}

**Phase:** implement
**Claim Source:** executed
**Execution time:** 2026-08-27T19:13:15Z

This is a consumer receipt from BUG-017 Scope 4, not a BUG-022 regression or stabilize phase
claim. The Foundation-local automatic worker boundary and early browser close were present. The
canonical BUG-022 C03 command then resolved two workers, passed all 94 tests, emitted no
failure-shaped force-kill block, and exited 0. A post-command scan found no workload-owned process
and no Playwright worker. BUG-022 remains `in_progress`; this append changes no state,
certification, scope, acceptance, Checklist, protected Feature 008 report, or ratchet.

**Phase:** implement
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `763bea8081d68ed1803dd58797307c0bf0bd541cb206c60a898c36db061f3620`

```text
# BUG-017 Scope 4 TP-BUG017-04-03 exact BUG-022 C03 workers 2
exit: 0
lines: 303
sha256: 763bea8081d68ed1803dd58797307c0bf0bd541cb206c60a898c36db061f3620
Running 94 tests using 2 workers
system-chrome: portfolio-survival-accessibility.spec.mjs
system-chrome: portfolio-survival-allocation.spec.mjs
system-chrome: portfolio-survival-brief.spec.mjs
system-chrome: portfolio-survival-diversification.spec.mjs
system-chrome: portfolio-survival-foundation.spec.mjs
system-chrome: portfolio-survival-mobile.spec.mjs
system-chrome: portfolio-survival-paths.spec.mjs
system-chrome: portfolio-survival-risk.spec.mjs
94 passed (1.7m)
```

**Phase:** implement
**Command:** `zsh -f -c '<resolved-config, candidate-hash, and process-residue receipt>'`
**Exit Code:** 0
**Claim Source:** executed

```text
SCOPE4_ROUTE_RECEIPT_BEGIN
candidateGate=PASS
selectedRoute=foundation-lifecycle
fallbackEligible=false
resolvedWorkers=2
project=system-chrome
channel=chrome
foundationSha256=68048d53b828788b4312495ec7117c572e189ccbebc95a9c959d4b50abaf73e5
canarySha256=61480b0e29ecd720bc764ea2f230a580d703a0fc90633ff1404a137e01e6bb70
configSha256=f2046ba0a332862e9a13475339099a29be5a44763b59c3d73f42baa0cbb6417d
ownedProcessResidue=0
playwrightWorkerResidue=0
forceKillSuppression=absent
SCOPE4_ROUTE_RECEIPT_END
```

The selected route keeps `playwright.config.mjs` at workers 2. The workers-1 fallback is
ineligible because its required predecessor, a lifecycle failure after 94 passing tests, did not
occur. No fallback implementation or fallback test run is claimed.

## BUG-017 Scope 4 Finalization Follow-Up {#bug-017-scope-4-finalization-follow-up}

**Phase:** implement
**Claim Source:** interpreted from BUG-017 current-session executed evidence
**Execution time:** 2026-08-27T19:42:40Z

The dependency-unblock receipt above remains a real record of one exact 94-test exit-0 run. It is
not a BUG-022 regression or stabilize claim. BUG-017's subsequent closeout bundle failed the
complete focused runtime-foundation file on SCN-BUG017-09, and an immediate exact named canary
failed again when Foundation's `afterAll` browser close timed out and one worker was force-killed
at the strict 15000ms stop bound. The same committed candidate bytes were present in both runs.

BUG-022 therefore remains `in_progress`. Its C03 historical receipt is preserved, but it cannot
advance to regression or stabilization while the owning BUG-017 lifecycle canary is red. The
workers=1 fallback remains ineligible under BUG-017's planned decision rule. No BUG-022 checkbox,
state, certification, acceptance, Checklist, protected Feature 008 report, or ratchet changed.

<!-- bubbles:certifying-window-begin -->

## BUG-017 Scope 4 Fallback Consumer Receipt {#bug-017-scope-4-fallback-consumer-receipt}

**Phase:** stabilize
**Claim Source:** executed
**Execution date:** 2026-08-27

BUG-017 preserved its lifecycle candidate evidence, reverted the candidate through two explicit
commits, and selected the planned one-worker fallback. This receipt records BUG-022's unchanged
TP-BUG022-C03 command. It does not record a BUG-022 phase completion or status transition.

**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `a3e93124da2431f11b6347f53b9ed678d0776cd56a3e75d2583b6dae68961c2b`

```text
RUN_BEGIN id=BUG022-C03-R2
EXACT_COMMAND=npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
PROCESS_COUNTS label=before-BUG022-C03-R2 worktreeCwd=0 remoteDebugChrome=0
Running 94 tests using 1 worker
94 passed (1.4m)
PROCESS_COUNTS label=after-BUG022-C03-R2 worktreeCwd=0 remoteDebugChrome=0
RUN_RECEIPT id=BUG022-C03-R2 playwrightExit=0 wallSeconds=86 resolvedOne=1 passed94=1 forceKill=0 ignoredLifecycle=0 ownedResidue=0 remoteDebugDelta=0
RUN_END id=BUG022-C03-R2
captureSha256=a3e93124da2431f11b6347f53b9ed678d0776cd56a3e75d2583b6dae68961c2b
result=PASS
```

BUG-022 remains `in_progress`. This append changes no BUG-022 checkbox, state, certification,
acceptance, Checklist, protected Feature 008 report, or baseline.

### Current BUG-022 Completion Guard

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak`
**Exit Code:** 1
**Claim Source:** executed
**Capture SHA-256:** `63da0db7847d524e65f35236c13c2453aa3a1ed65e3e5d291e5f50ea651dff14`

```text
BEGIN TRANSITION_GUARD_RESULT_V1
targetStatus: done
failedGateIds: [G022,G027,G040,G136]
failedChecks: [Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 12
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

This is a non-terminal guard result, not a pass. No BUG-022 state or acceptance field changed.

<!-- bubbles:test-iteration-4-consumer-proof-begin -->

## Test Phase Convergence Iteration 4 Current C03 Consumer Receipt {#test-phase-convergence-iteration-4-current-c03-consumer-receipt}

**Phase:** test
**Claim Source:** executed
**Execution date:** 2026-08-28

The current test invocation resolved all BUG-017 and BUG-022 linked test references before the
final browser execution. It then ran the unchanged TP-BUG022-C03 command through the bounded
process-ownership probe at the current dirty artifact and configuration revision.

**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Capture command:** `node --input-type=module -`
**Outer bound:** 900 seconds
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `d11ebe0748de9b55578374a346ecc8416fb90ed02b4ade0a0e8ec1085ff149da`
**Evidence:** [current BUG-017 process-residue proof](../BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md#current-exact-bug-022-c03-process-ownership-proof)

The referenced current-session receipt records `workers=1`, `project=system-chrome`,
`browser=chromium`, `channel=chrome`, 94 of 94 passing, child exit 0, zero force-kill and ignored
lifecycle markers, zero skip/todo/fixme/only markers, one observed workload-owned Playwright
worker, 256 observed workload-owned remote-debugging Chrome processes, zero residue in either
class, and zero repository or external output artifacts after cleanup.

The focused functional command selected the six BUG-022 authority regressions and the active
BUG-017 fallback regression. It passed 7 of 7 with exit 0, zero skips, and zero todos. Its
capture SHA-256 is `790928d37ea85d21fdc2ff54e7cec9d0dfef14adcb12f25d63fbc64b128b65e6`.
The combined artifact-lint command passed both packets with exit 0. Its capture SHA-256 is
`5d419d528ea6d8729428ef9d71b7feba1d35672f265f583997e90077120ba8a2`.

This receipt changes no BUG-022 planning semantics, status, certification, completed phase,
acceptance item, source, configuration, or test.

<!-- bubbles:test-iteration-4-consumer-proof-end -->

## Validate Phase Convergence Iteration 4 Certification Reconciliation {#validate-phase-convergence-iteration-4-certification-reconciliation}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Current validate execution establishes the focused command results below. The
94-test C03 result remains test-phase evidence from the current-session receipt above; validate
inspected that receipt and its linked BUG-017 provenance but did not execute or claim the browser
command.

### Current Test Receipt Provenance

The current test receipt is tagged `Phase: test` and `Claim Source: executed`. It cites complete
capture SHA-256 `d11ebe0748de9b55578374a346ecc8416fb90ed02b4ade0a0e8ec1085ff149da`.
The linked process probe reports one configured worker, `system-chrome`, Chrome channel, 94 of 94
passing, child exit 0, no force-kill or lifecycle-ignore marker, no skipped, `todo`, `fixme`, or
`only` marker, zero owned Playwright or Chrome residue, and complete output cleanup.

### Current Validate Execution

**Claim Source:** executed

| Check | Exit | Complete-capture fact |
| --- | ---: | --- |
| Semantic mode resolution | 0 | 45 lines, SHA-256 `f7ccd0bd74b094512fcd06fcd0dd30d284056b6c4e10c05ff37f1dddfe6fd544`; ceiling `done`, audit profile `delivery-completion-v1` |
| Goal fidelity at pre-certification | 1 | 3 lines, SHA-256 `e488ceed2f9b6ff116162597d7104aed9fedaab2c7c7dde57e694fb475679b11`; G070 reports no non-empty Outcome Contract and no Hard Constraints |
| Canonical scenario-state certifiability | 1 | 346 lines, SHA-256 `aa393201d193de41b0416b1559dcd6268af7e8e1bca447c1f485e012da3b3b59`; all three scenarios derive only `PLANNED` at source revision `4bd96545cd66` |
| Completion-mirror validator | 0 | 2 lines, SHA-256 `b5a9ca8bc45dec0c5056a5a3a21883be1163a6a543e818f032093730455961a7`; no new DoD progress drift |
| Artifact lint | 0 | 40 lines, SHA-256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| Linked-test resolution | 0 | 30 references resolved; SHA-256 `10c322e89756416e0f5d50d0d0d9d144196d61865fca2b91fb5358e6369ed07f` |
| Traceability guard | 0 | 75 lines, SHA-256 `6621b29aaa33700102ca31b00ea9fc7d735f1e4cf84661f39b2e3ecf05451d7e`; 3 scenarios mapped, 15 rows checked, 0 warnings |
| Focused BUG-017/BUG-022 functional contracts | 0 | 21 lines, SHA-256 `3a02af0a8664b23438b44d116a16e6be6a68b978660f8a2056e0bd56a4ca753d`; 7 passed, 0 failed, 0 skipped, 0 todo |
| Asserted transition guard | 1 | 710 lines, SHA-256 `dfc8019b142c537f9750fb1c595bdb5b2d484fd9ae72e2d63f0d3d20f92568c5`; failed gates G060, G022, G027, and G136 |

The scope artifact remains In Progress despite 16 checked and zero unchecked DoD rows. The
validate-owned `certification.scopeProgress` count already matches 16/0, and both completed-scope
arrays remain empty to match the non-Done scope artifact. Validate did not certify phases that the
execution record does not contain. The guard confirms `implement` and `test` provenance, while
`regression`, `simplify`, `stabilize`, `security`, `validate`, and `audit` are absent from the
phase-completion record.

The remaining guard conditions are: scenario states are not receipt-derived beyond `PLANNED`; the
scope artifact is not Done; the specialist chain is incomplete; G027 rejects implementation/test
claims with no Done scope; 76 current evidence receipts are stale; one substantive stdout hash is
classified as a receipt clone across incompatible or unproven identities; and G136 rejects all five
unchecked Checklist rows plus the placeholder Human Acceptance Record. Validate did not check any
human row or fill the record. The operator's generic authorization and approval text does not
enumerate these behavior-specific acceptance rows.

No repository-wide selftest was executed by validate. Existing nonzero selftest evidence and all
excluded market-brief, tool-brief, probe, and company-intelligence work remain outside this
validation claim.

## Validate-Owned Outcome Contract Success Signal Mapping — Iteration 4 {#validate-owned-outcome-contract-success-signal-mapping-iteration-4}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** This section evaluates the newly declared Success Signal only against receipts
already present in this packet and its linked BUG-017 packet. It does not create new test execution,
strengthen a receipt, or decide whether a receipt remains admissible after later artifact edits.

**Declared Success Signal:** The selected repair must preserve the historical Feature 008 report
bytes; keep active declaration sites authoritative with provenance; fail closed for unknown
candidates; keep both current Node families explicitly reachable; keep a protected active Node and
Playwright crossing blocking; and pass the current Feature 008 consumer through BUG-017's selected
one-worker `system-chrome` route.

| Success Signal clause | Current evidence | Evaluation |
| --- | --- | --- |
| Historical Feature 008 report bytes remain unchanged | [Protected Bytes And Ratchets](#protected-bytes-and-ratchets) records identical anchor and current SHA-256 values, `CONTAINMENT_FAILURES=0`, and `leakage=0`. | Demonstrated by the cited regression receipt. |
| Active declaration sites remain authoritative with provenance | The six named BUG-022 regressions in the [iteration-4 C03 consumer receipt](#test-phase-convergence-iteration-4-current-c03-consumer-receipt) include active Test Plan and structured test-plan authority. The recorded reachability receipt identifies both current registry declarations with artifact and line provenance. | Demonstrated by the cited receipts. |
| Unknown declaration candidates fail closed | The focused family includes `SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance`; the current seven-test family records all selected regressions passing. | Demonstrated by the cited focused receipt. |
| `tests/*.functional.mjs` and `tests/*.test.mjs` remain explicitly reachable | The focused family includes the active-family reachability regression, and the current linked-test resolution records 30 BUG-022 references resolved. | Demonstrated by the cited receipts. |
| A protected active Node and Playwright crossing still blocks | The focused GREEN receipt records the active broad-glob positive control and states that both active Node and Playwright selection reach the fixture specification. | Demonstrated by the cited regression receipt. |
| The current Feature 008 consumer passes on BUG-017's selected route | The [iteration-4 C03 consumer receipt](#test-phase-convergence-iteration-4-current-c03-consumer-receipt) links to the [current BUG-017 process proof](../BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md#test-phase-convergence-iteration-4-current-process-residue-proof), which records one worker, `system-chrome`, Chrome channel, 94 of 94 passing, exit zero, no lifecycle marker, zero owned residue, and complete cleanup. | Demonstrated by the cited current test receipt. |

The current focused receipt also records the six exact BUG-022 regressions plus the BUG-017
fallback regression as a seven-test family, linked-test resolution, and focused artifact lint.
This mapping makes no repository-wide selftest claim and no claim beyond the receipts identified
above. It preserves the active-versus-historical authority boundary, excluded paths, nonzero
historical evidence, the In Progress scope, missing specialist phase claims, human acceptance, and
non-terminal certification state.

## Regression Phase Convergence Iteration 4 At `d0c09a3ec` {#regression-phase-convergence-iteration-4-at-d0c09a3ec}

**Phase:** regression
**Claim Source:** executed
**Outcome:** `route_required`
**Verdict:** `REGRESSION_DETECTED`

The regression epoch was the detached checkpoint
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. The checkpoint had no tracked or
untracked repository delta before execution. Dependency provisioning created
only ignored checkout-local runtime files.

The BUG-022 classifier and its protected consumers passed. The complete changed
functional carrier passed 16 of 16. Repository reachability exited zero with no
new orphan and no classification error. Feature 008 direct Node consumers
passed 257 of 257. The exact Feature 008 browser command resolved one worker,
used `system-chrome`, passed 94 of 94, and exited zero. The protected Feature
008 report, reachability baseline, frozen crossing set, and rejected BUG-017
Foundation candidate stayed unchanged.

The required repository selftest did not pass. It reported 3464 passed and one
failed. The dedicated validator identified one current mismatch in BUG-017:
Scope 2 certification claims 9 checked and 0 unchecked items, while the scope
artifact has 9 checked and 2 unchecked items. This is a validate-owned mirror
outside BUG-022's change boundary. It still prevents a clean regression verdict.

The downstream framework write guard also exited one on five framework-managed
agent files. A range comparison found zero framework-managed delta between the
BUG-022 implementation parent and this checkpoint. The drift therefore predates
the BUG-022 implementation range and remains route-only.

No `execution.completedPhaseClaims` entry was added. No `state.json` field was
changed. No scenario receipt was refreshed. No terminal status, certification,
acceptance, source, config, test, framework, protected BUG-017 evidence, or
excluded concurrent-work path was changed.

### Derived Changed Surface And Protected Consumers

**Claim Source:** interpreted
**Interpretation:** The implementation range and current source identify the
three changed files and each runtime consumer below. Test execution then checks
the consumers rather than inferring their outcomes from source.

| Surface | Current consumer or invariant | Current execution |
| --- | --- | --- |
| `.specify/memory/agents.md` | Active current authority for `tests/*.functional.mjs` and `tests/*.test.mjs` | Reachability exit 0; full functional carrier exit 0 |
| `scripts/validate-test-file-reachability.mjs` | CLI validator, `validateTestFileReachability()`, and repository selftest | Validator exit 0; selftest exit 1 on the separate BUG-017 mirror |
| `tests/playwright-runtime.foundation.functional.mjs` | Six BUG-022 regressions, direct runner disjointness, and BUG-017 fallback/rejected-candidate controls | 16 of 16 passed |
| Feature 008 Node carriers | Sixteen `portfolio-*.unit.mjs` and `portfolio-*.functional.mjs` files | 257 of 257 passed |
| Feature 008 browser carriers | Eight `portfolio-survival-*.spec.mjs` files through the config-default route | 94 of 94 passed with one worker |
| BUG-017 fallback contract | `playwright.config.mjs`, current disclosure, and rolled-back Foundation candidate | `workers=1`; SCN-BUG017-11 passed; rejected markers absent |
| Historical Feature 008 receipt | Immutable BUG-004 `report.md` command receipt | Anchor and current SHA-256 values are identical |

The exact implementation commit changes only three files:

```text
IMPLEMENTATION_PATH_COUNT=3
IMPLEMENTATION_PATH=.specify/memory/agents.md
IMPLEMENTATION_PATH=scripts/validate-test-file-reachability.mjs
IMPLEMENTATION_PATH=tests/playwright-runtime.foundation.functional.mjs
```

### Baseline Comparison

**Claim Source:** interpreted
**Interpretation:** Prior values come from the existing report receipts read in
this phase. Current values come from the commands recorded below.

| Check | Prior packet baseline | Current checkpoint | Delta |
| --- | --- | --- | --- |
| BUG-022 focused functional regressions | 6 passed, 0 failed | 6 passed inside a 16-of-16 full-carrier pass | Stable |
| Feature 008 direct Node | 257 passed, 0 failed | 257 passed, 0 failed | Stable |
| Feature 008 browser C03 | 94 passed, exit 0, one worker | 94 passed, exit 0, one worker | Stable |
| Repository selftest | 3465 passed, 0 failed | 3464 passed, 1 failed | Regression |
| Protected report SHA-256 | `8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b` | Same | Stable |
| Reachability baseline entries | 26 | 26, with 20 now stale and zero new orphans | No growth; cleanup remains outside this boundary |
| Frozen Node/Playwright crossings | 9 | 9 | Stable |

The command registry declares no numerical line-coverage command. The structural
coverage comparison found six new BUG-022 test declarations, 49 new assertion
lines, no deleted declaration, no deleted assertion line, and all six BUG-022
test bodies byte-identical from the implementation commit to this checkpoint.

### Complete Functional Carrier And Disjointness

**Phase:** regression
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 regression full runtime foundation at d0c09a3ec
$ node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 59
sha256: 45494008c5d0646d6c82d36dd545add101de6e88761bb0e2b2f548110e8b70c7
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] frozenCrossings=9
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
tests 16
pass 16
fail 0
skipped 0
todo 0
duration_ms 2660.097125
```

### Reachability, Protected Bytes, And Ratchets

**Phase:** regression
**Command:** `node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture SHA-256:** `8ef92312b333cd1a09e78a4ec1d0cf2416dd061c1620b195f84b8c33d9373a6e`

The validator reported 201 test files, 10 active globs, 34 historical sites, 0
classification errors, 184 reachable files, 11 helper exemptions, 6 frozen
orphans, and no new orphan. The integrity comparator produced this independent
receipt:

```text
CHECKPOINT_HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
PROTECTED_REPORT_ANCHOR_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_CURRENT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_BYTES=251561
REACHABILITY_BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_COUNTS=26->26
REACHABILITY_NEW_ORPHANS=0
REACHABILITY_STALE_BASELINE=20
KNOWN_CROSSINGS_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSING_COUNTS=9->9
ACTIVE_GLOBS=10
HISTORICAL_SITES=34
CLASSIFICATION_ERRORS=0
PROTECTED_REPORT_PORTFOLIO_SITES=1
PROTECTED_REPORT_ACTIVE_AUTHORITY=0
REINTRODUCTION_EXPECTED_NEW_CROSSINGS=8
ACTIVE_COUNTERFACTUAL_CROSSING=1
BUG017_REPORT_SHA256=227f476f40ded9e77a53915907ced3eba2da1f7986f56a0f2b419941f3ad386a
BUG017_FOUNDATION_SHA256=fea510439df18dbd3c3e9541d303ddd5b677ac586f5f7316c98b346f1ee59edf
BUG017_REJECTED_CANDIDATE_MARKERS=0
CHECKPOINT_STATUS_CLEAN=true
CONTAINMENT_FAILURES=0
```

The comparator exited zero. Its complete output has SHA-256
`09c0a42d9c805598688775c11210e745f3c91b15660d1188b595f3368e9c520e`.

### Active-Authority Expected RED Control

**Phase:** regression
**Command:** `node /private/tmp/rl-bug022-active-authority-red-d0c09a3ec.mjs <checkpoint-root>`
**Child Exit Code:** 1
**Wrapper Exit Code:** 0
**Claim Source:** executed

**Evidence-Provenance Correction:** The harness ran under a disposable external
fixture/checkpoint root. It emitted the crossing relative to that external root.
The uncommitted report append originally rendered the crossing as a bare
repository-relative token. This correction adds only the established
`<fixture-root>/` provenance prefix. Every measured count, classification result,
exit code, and expected blocking outcome remains unchanged. The child failure
remains the intended blocking result, not a normal pass.

```text
ACTIVE_SITES=1
HISTORICAL_SITES=1
CLASSIFICATION_ERRORS=0
PLAYWRIGHT_PATTERN=**/*.spec.mjs
NODE_PATTERN=tests/portfolio-*.mjs
ACTIVE_CROSSING_COUNT=1
ACTIVE_CROSSING=<fixture-root>/tests/portfolio-counterfactual.spec.mjs
EXPECTED_RED: active Node and Playwright ownership crossing is blocking
ACTIVE_AUTHORITY_CONTROL_EXIT=1
ACTIVE_AUTHORITY_EXPECTATION=PASS
```

The control uses identical command bytes in an active Test Plan and a historical
report. Production classification keeps the report historical. The active site
still creates a crossing and the child exits one. The real protected report
pattern would select eight current browser specifications if it regained active
authority, so the persistent BUG-022 assertions would fail rather than silently
accept the original defect.

### Feature 008 Direct Node Consumers

**Phase:** regression
**Command:** `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 regression Feature 008 direct Node consumers at d0c09a3ec
exit: 0
lines: 266
sha256: 48ee7d0be4d8ad1429e437588f7c69615129112ca6d82ec00681fc6717d3d4d9
✔ SCN-008-046 all five public artifacts contribute independently to one local generic evidence identity
✔ SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
✔ SCN-008-047 failed candidate preserves the last valid structured result
✔ BUG-005: a stale domain must not suppress the fresh domains beside it
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
✔ TP-26-01 one workspace compute publishes one immutable view model under token cancel last-valid and rebase control
tests 257
suites 0
pass 257
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 4883.008625
```

### Feature 008 Browser C03 On The Selected Route

**Phase:** regression
**Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 regression Feature 008 C03 one-worker system Chrome at d0c09a3ec
exit: 0
lines: 303
sha256: 5112ad6a07f77d09d3e27a78dba81b5749d1d602d6a09567f2060ad5dbde24d8
Running 94 tests using 1 worker
✓ 1 [system-chrome] Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete
✓ 2 [system-chrome] Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision
✓ 3 [system-chrome] Adversarial: SCN-008-053 reduced accessibility implementations fail closed
✓ 89 [system-chrome] Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies
✓ 90 [system-chrome] Regression: SCN-008-017 return contribution stays distinct from risk contribution
✓ 91 [system-chrome] Regression: SCN-008-015 manual assets and absent look through stay visible not omitted
✓ 92 [system-chrome] Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity
✓ 93 [system-chrome] Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
✓ 94 [system-chrome] Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
94 passed (1.4m)
WORKTREE_OWNED_PROCESS_RESIDUE=0
```

### Required Clean-Checkpoint Selftest - Non-Zero

**Phase:** regression
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-022 regression clean-checkpoint repository selftest at d0c09a3ec
exit: 1
lines: 3961
sha256: c32aad74bc09c0cd2bad9b603f6da9c25ccce359b611f760b7175f589c6ceb8d
✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (1 new, 14 frozen, 0 stale of 86 claim(s))
================================================
Research-Lab self-test: 3464 passed, 1 failed
================================================
[scope-dod-progress] packets=63 claims=86 agree=71 drift=15 unresolved=0 baseline=14 new=1 stale=0
NEW-DRIFT specs/_bugs/BUG-017-system-chrome-worker-teardown-force-kill-on-macos#02::certification (02-apply-the-selected-remedy) — claims 9/0 checked/unchecked, artifact has 9/2
[scope-dod-progress] FAIL — 1 scope progress claim(s) do not match their artifact
```

This failure is `REG-BUG022-R4-001`. It is not attributed to the BUG-022
classifier. It is still a current repository regression and blocks this phase's
completion claim.

### Coverage Delta And Test-Weakening Audit

**Phase:** regression
**Command:** `node /private/tmp/rl-bug022-regression-coverage-d0c09a3ec.mjs <checkpoint-root>`
**Exit Code:** 0
**Claim Source:** executed

```text
COVERAGE_BASE_REVISION=7d0b3147ac69bf0dfce94c24770b69d9b1f334a2
COVERAGE_IMPLEMENTATION_REVISION=f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a
COVERAGE_CURRENT_REVISION=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
FOUNDATION_TEST_DECLARATIONS=8->14->16
FOUNDATION_ASSERT_CALLS=57->106->128
IMPLEMENTATION_ADDED_TEST_DECLARATIONS=6
IMPLEMENTATION_DELETED_TEST_DECLARATIONS=0
IMPLEMENTATION_ADDED_ASSERTION_LINES=49
IMPLEMENTATION_DELETED_ASSERTION_LINES=0
BUG022_REQUIRED_TITLES=6
BUG022_UNCHANGED_BLOCKS=6
BUG022_REMOVED_TITLES=0
POST_IMPLEMENTATION_DELETED_BUG022_LINES=0
BUG022_SKIP_ONLY_TODO_RETURN_MARKERS=0
COVERAGE_DELTA_FAILURES=0
```

The first audit script revision over-captured the helper declarations following
the sixth BUG-022 test and reported an unrelated BUG-017 disclosure change as a
test-body delta. The temporary comparator was corrected to stop at the BUG-017
helper boundary. The rerun above is the operative result. No repository file was
changed by either audit.

### Regression Quality And Traceability

**Phase:** regression
**Claim Source:** executed

```text
command: bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs
exit: 0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
command: bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-022-historical-report-declaration-leak --repo-root .
exit: 0
[scenario-test-resolve] OK — 30 reference(s) resolved via literal-scan; 6 category comparison(s) not applicable (no test-discovery adapter declared)
command: bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak
exit: 0
lines: 75
sha256: 4a3130691a3de3c69bd36b50933d61304ddb11f52600627912e54dc1914c3303
Scenarios checked: 3
Test rows checked: 15
RESULT: PASSED (0 warnings)
command: node scripts/validate-spec-test-paths.mjs
exit: 0
[spec-test-paths] scanned=816 references=19064 distinctPaths=269 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
```

### Packet Lint And Non-Terminal Guard

**Phase:** regression
**Claim Source:** executed

```text
command: bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak
exit: 0
Artifact lint PASSED.
command: bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak
exit: 1
lines: 370
sha256: 510dadcd82f43e2d6f4e6574ed1df73dc5a131f9cfa4e36246a71a1807634f3e
targetStatus: done
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G027,G136]
failedChecks: [Check-4-scenario-states]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 11
exitStatus: 1
verdict: FAIL
```

The non-zero transition result is truthful and expected. It does not certify a
terminal state. It preserves the test-owned scenario receipt refresh,
validate-owned completion mirrors, human acceptance, and incomplete phase chain.

### Pre-Existing Framework Install Drift

**Phase:** regression
**Command:** `bash .github/bubbles/scripts/cli.sh framework-write-guard`
**Exit Code:** 1
**Claim Source:** executed

```text
Installed release manifest: version=7.28.0 gitSha=1cf38f9493b8b035fc8a01f21ec07d02e3cc1531
Install provenance: mode=remote-ref sourceRef=main sourceGitSha=1cf38f9493b8b035fc8a01f21ec07d02e3cc1531 dirty=false
Framework-managed file drift detected: agents/bubbles.bug.agent.md
Framework-managed file drift detected: agents/bubbles.goal.agent.md
Framework-managed file drift detected: agents/bubbles.iterate.agent.md
Framework-managed file drift detected: agents/bubbles.sprint.agent.md
Framework-managed file drift detected: agents/bubbles.workflow.agent.md
exit: 1
lines: 27
sha256: 50c0596f6876882a7f353bf6e9b1ffbdc6db3ee60f172611114e1b6924c64358
FRAMEWORK_MANAGED_DELTA_EXIT=0
```

The range check covered all framework-managed directories from
`7d0b3147ac69bf0dfce94c24770b69d9b1f334a2` through this checkpoint and found
no delta. `REG-BUG022-R4-002` is therefore pre-existing and route-only. This
phase did not edit a managed file or its checksum authority.

The first governance attempt explicitly invoked macOS `/bin/bash` 3.2 instead
of the registered PATH-selected Bash 5.3.15. That invocation produced a parser
error and was invalidated. Every governance command above was executed again
with `bash`. `bash -n` then returned `BASH5_TRANSITION_GUARD_SYNTAX_EXIT=0`.

### Finding Accounting And Routing

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `REG-BUG022-R4-001` | Current clean-checkpoint selftest is red because BUG-017 Scope 2 certification says 9/0 while its scope artifact says 9/2. No BUG-022 source failure was found. | `bubbles.validate` |
| `REG-BUG022-R4-002` | Framework write guard reports five pre-existing managed-agent drifts. The BUG-022 range has zero framework-managed delta. | Upstream framework bug owner |
| `REG-BUG022-R4-003` | Reachability is green with zero new orphan, but 20 baseline entries are stale and the shrink-only ratchet requires owner adjudication. | `bubbles.test` |
| `REG-R4-BUG022-CURRENT-RECEIPT-REFRESH` | Final distinct scenario receipts must be captured against the stable artifact revision. This phase created none. | `bubbles.test` |
| `BUG022-VALIDATE-CERTIFICATION-MIRRORS` | BUG-022 and its BUG-017 dependency retain validate-owned non-terminal completion mirrors. | `bubbles.validate` |
| `BUG022-G136-HUMAN-ACCEPTANCE` | All five BUG-022 Checklist rows and the Human Acceptance Record remain human-owned and unchanged. | human |
| `BUG022-PHASE-CHAIN-COMPLETION` | The current guard still requires regression, simplify, stabilize, security, validate, and audit evidence before terminal certification. This failed regression phase adds no claim. | workflow phase owners |
| `BUG022-GLOBAL-STALE-CLONE-ADJUDICATION` | Global append-only stale and clone evidence remains outside this regression decision. No evidence was rewritten or reclassified here. | `bubbles.validate` and `bubbles.audit` |

The active changed behavior, current consumers, and protected historical bytes
are clean. The phase itself is not complete because the required repository
selftest is red. The workflow must not advance to simplify on this result.

## Regression Phase Convergence Iteration 4 Rerun With Reconciled BUG-017 Mirrors {#regression-phase-convergence-iteration-4-rerun-with-reconciled-bug017-mirrors}

**Phase:** regression
**Claim Source:** executed
**Executed At:** 2026-08-29T07:23:15Z
**Outcome:** `route_required`
**Verdict:** `REGRESSION_DETECTED`

This rerun used detached HEAD `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`
plus an isolated five-file working-tree overlay. The overlay contained only the
current BUG-017 `scopes.md`, `state.json`, and `test-plan.json` reconciliation
and the current BUG-022 `report.md` and `state.json`. It excluded every dirty
market-brief, tool-brief-v2, probe, BUG-019, and company-intelligence path. Byte
comparisons proved all five overlay files matched the source checkout before
execution. Post-execution status still named only those five files and no
untracked file.

The prior BUG-017 completion-mirror blocker is closed in this representation.
`validate-scope-dod-progress.mjs` reported 63 packets, 86 claims, 72 agreements,
14 frozen drifts, zero unresolved claims, zero new drift, zero stale drift, and
exit zero. Scope 2 now agrees at 11 checked and zero unchecked rows.

The BUG-022 behavior and consumers remain green. The complete functional carrier
passed 16 of 16. Reachability exited zero with 201 test files, 10 active globs,
36 historical sites, zero classification errors, 184 reachable files, 11 helper
exemptions, and six frozen orphans. Feature 008 direct Node consumers passed 257
of 257. The exact Feature 008 C03 command used one `system-chrome` worker, passed
94 of 94, and exited zero. The protected report, reachability baseline, frozen
crossing set, and rejected BUG-017 Foundation candidate remained unchanged.

The canonical repository selftest is still red for a new and different reason.
The earlier failed regression receipt names its temporary adversarial fixture as
`portfolio-counterfactual.spec.mjs` under the repository test directory. That
repository-relative path does not exist. `validate-spec-test-paths.mjs`
therefore reports one distinct new missing path at this report's preserved line
1627. The selftest passed 3464 checks, failed this one check, and exited one. The
operator required the earlier failed attempt to remain unchanged, so this rerun
did not rewrite, normalize, or baseline that receipt. No regression completion
claim or execution-history entry was added.

### Fresh Command Results

**Claim Source:** executed

| Check | Command | Exit | Current result |
| --- | --- | ---: | --- |
| Repository packet | `repository-binding.sh validate-packet` with decision `rb:vscode-004aa4f6bc5dacec42ad4d9f2afe0015:9` | 0 | Exact actionable `research-lab` packet valid at control revision 9 |
| Persisted mode | `bash .github/bubbles/scripts/mode-resolver.sh --grandfather bugfix-fastlane` | 0 | Ceiling `done`; regression remains in the resolved phase order |
| Completion mirror | `node scripts/validate-scope-dod-progress.mjs` | 0 | `new=0`, `stale=0`; the prior BUG-017 Scope 2 mismatch is absent |
| Source lock | `node scripts/validate-node-source-lock.mjs` | 0 | Exact Playwright 1.61.1 graph and 16 adversarial source-lock refusals passed |
| Provisioning | `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --ignore-scripts` | 0 | Three exact packages installed; zero vulnerabilities; no browser download |
| Runner identity | `npx --no-install playwright --version` | 0 | `Version 1.61.1` |
| Functional carrier | `node --test tests/playwright-runtime.foundation.functional.mjs` | 0 | 16 passed, zero failed/skipped/todo; 59 lines; SHA-256 `2a0e5f039ce0c82e2d09dc3a5366d96c1c73549331087b7d9cd2f6d892783722` |
| Reachability | `node scripts/validate-test-file-reachability.mjs` | 0 | Zero classification errors and zero new orphan |
| Protected integrity | isolated overlay integrity comparator | 0 | Five authorized overlay paths, zero excluded paths, unchanged bytes and ratchets |
| Active-authority adversarial control | active Test Plan plus historical report fixture | 0 wrapper, 1 expected child | One active crossing remained blocking |
| Feature 008 Node | `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs` | 0 | 257 passed; 266 lines; SHA-256 `6fcc52d4f42a77b2ba304356d9773ebe6e91122961f0ee82e2dadcf42617bbac` |
| Feature 008 C03 | `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 94 passed with one worker; 303 lines; SHA-256 `b6e6771b28189a3c67fa8ef1fefc47cbe417380107f6be2127cc95413938c025` |
| Repository selftest | `node scripts/selftest.mjs` | 1 | 3464 passed, one failed; 3962 lines; SHA-256 `e8d6fa111486bfc9e18fc92082821f56bab4f969c10211c4a549aef8fee8556d` |
| Missing-path diagnosis | `node scripts/validate-spec-test-paths.mjs` | 1 | One new missing path, zero planned missing paths, 70 frozen missing paths |
| Coverage delta | structural declaration/assertion comparator | 0 | Six required tests unchanged; no deleted test or assertion line; no skip/only/todo/return marker |
| Regression quality | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs` | 0 | Zero violations, zero warnings, adversarial signal present |
| Linked tests | `bash .github/bubbles/scripts/scenario-test-resolve.sh specs/_bugs/BUG-022-historical-report-declaration-leak --repo-root .` | 0 | 30 references resolved |
| Traceability | `bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | Three scenarios and 15 rows passed; 75 lines; SHA-256 `208858fd59acc5c88d1c75b362a860a01ddbf5f011f195d00420ce5ac0083b3e` |
| Artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | Artifact lint passed |

The first functional-carrier attempt exited one because a fresh detached
worktree had no checkout-local Playwright package. It was setup evidence, not a
product regression. The registered source-lock, lockfile-strict provisioning,
and runner-identity sequence then passed. The same functional command was rerun
and passed 16 of 16 as recorded above.

### Protected Bytes, Baselines, And Crossings

**Phase:** regression
**Claim Source:** executed

```text
CHECKPOINT_HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
CHECKPOINT_OVERLAY_PATH_COUNT=5
CHECKPOINT_EXCLUDED_PATHS=0
IMPLEMENTATION_PATH_COUNT=3
PROTECTED_REPORT_ANCHOR_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_CURRENT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_BYTES=251561
REACHABILITY_BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_COUNTS=26->26
REACHABILITY_NEW_ORPHANS=0
REACHABILITY_STALE_BASELINE=20
KNOWN_CROSSINGS_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSING_COUNTS=9->9
ACTIVE_GLOBS=10
HISTORICAL_SITES=36
CLASSIFICATION_ERRORS=0
PROTECTED_REPORT_PORTFOLIO_SITES=1
PROTECTED_REPORT_ACTIVE_AUTHORITY=0
REINTRODUCTION_EXPECTED_NEW_CROSSINGS=8
ACTIVE_COUNTERFACTUAL_CROSSING=1
BUG017_REJECTED_CANDIDATE_MARKERS=0
CHECKPOINT_AUTHORIZED_OVERLAY=true
CONTAINMENT_FAILURES=0
```

### Fresh Selftest Blocker

**Phase:** regression
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
exit: 1
lines: 3962
sha256: e8d6fa111486bfc9e18fc92082821f56bab4f969c10211c4a549aef8fee8556d
FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
new missing paths: 1
planned missing paths: 0
known missing paths: 70
stale baseline paths: 0
Research-Lab self-test: 3464 passed, 1 failed
spec-test-paths source: this report's preserved active-authority fixture receipt
completion-mirror source: reconciled BUG-017 overlay, exit 0, new=0
functional source: 16 passed, 0 failed
browser source: 94 passed, 0 failed, 1 worker, system-chrome
```

The dedicated diagnosis scanned 816 artifacts and 270 distinct paths. It found
71 missing paths: 70 frozen paths and one new path, with zero planned-missing
and zero stale-baseline paths. The command named this report's preserved line
1627 as the original reference site and exited one. A final report-epoch recheck
kept artifact lint at exit zero and reproduced the same single distinct missing
path. Its selftest passed 3464 checks, failed one, exited one, covered 3963 output
lines, and emitted SHA-256
`4309d5ba4f6faea3fe0231ef22f02a0101931499077f132b521257373985083b`.

### Coverage And Test-Weakening Audit

**Phase:** regression
**Claim Source:** executed

```text
COVERAGE_BASE_REVISION=7d0b3147ac69bf0dfce94c24770b69d9b1f334a2
COVERAGE_IMPLEMENTATION_REVISION=f226ae5c34dff3f6eb73723bff3c85c8f7ab4f2a
COVERAGE_CURRENT_REVISION=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
FOUNDATION_TEST_DECLARATIONS=8->14->16
FOUNDATION_ASSERT_CALLS=57->106->128
IMPLEMENTATION_ADDED_TEST_DECLARATIONS=6
IMPLEMENTATION_DELETED_TEST_DECLARATIONS=0
IMPLEMENTATION_ADDED_ASSERTION_LINES=49
IMPLEMENTATION_DELETED_ASSERTION_LINES=0
BUG022_REQUIRED_TITLES=6
BUG022_UNCHANGED_BLOCKS=6
BUG022_REMOVED_TITLES=0
POST_IMPLEMENTATION_DELETED_BUG022_LINES=0
BUG022_SKIP_ONLY_TODO_RETURN_MARKERS=0
COVERAGE_DELTA_FAILURES=0
```

No numerical line-coverage command is declared by the project registry. The
structural delta above is the available coverage comparison. Deployment
regression checks are not applicable because the exact implementation range
contains only `.specify/memory/agents.md`, the reachability validator, and the
runtime-foundation functional test. It contains no deploy, workflow, config, or
promotion surface.

### Finding Accounting And Routing For This Rerun

**Post-Rerun Evidence Reconciliation:** This row changed only after the
report-only correction passed isolated path validation, artifact lint, and the
canonical selftest. The earlier rerun narrative remains historical evidence.
This reconciliation does not complete the regression phase.
`bubbles.regression` must rerun the phase against the repaired report.

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `REG-BUG022-R4-RERUN-001` | Addressed after isolated validation passed. The receipt now renders the crossing as `<fixture-root>/tests/portfolio-counterfactual.spec.mjs`, which identifies its external temporary fixture provenance. `ACTIVE_SITES=1`, `HISTORICAL_SITES=1`, zero classification errors, one active crossing, child exit 1, wrapper exit 0, and the expected blocking outcome remain unchanged. | `bubbles.regression` to rerun convergence against this repaired report |
| `REG-BUG022-R4-001` | Addressed by the pending BUG-017 scope/planning overlay. Completion-mirror validation now exits zero with `new=0`; Scope 2 agrees at 11/0. | none |
| `REG-BUG022-R4-002` | Preserved route-only. The earlier framework-install drift finding remains outside the BUG-022 implementation range and this phase did not edit framework files. | upstream framework bug owner |
| `REG-BUG022-R4-003` | Preserved route-only. Reachability has zero new orphan but still reports 20 stale baseline entries. The shrink-only ratchet remains unchanged. | `bubbles.test` |
| `TEST-R4-BUG017-SCN11-NEW-STABLE-REVISION` | Preserved. SCN-BUG017-11 still needs its new-revision receipt chain and was not refreshed here. | `bubbles.test` |
| `REG-R4-BUG022-CURRENT-RECEIPT-REFRESH` | Preserved. Final distinct BUG-022 scenario receipts were not refreshed in this phase. | `bubbles.test` |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Preserved. Human Checklist and Acceptance Record fields were not changed. | human |
| `BUG022-PHASE-CHAIN-COMPLETION` | Preserved. Regression is still incomplete on the red selftest, and simplify plus the remaining required phases have not been claimed by this rerun. | workflow phase owners |
| `BUG022-GLOBAL-STALE-CLONE-ADJUDICATION` | Preserved. Global stale and clone evidence was not rewritten, reclassified, or certified. | `bubbles.validate` and `bubbles.audit` |

The functional, reachability, direct Node, browser, protected-integrity,
coverage-delta, regression-quality, linked-test, traceability, and artifact-lint
checks are green. The canonical repository selftest is not. This rerun therefore
adds no regression `completedPhaseClaim`, no `executionHistory` row, no scenario
receipt, and no completion or certification mutation.

## Regression Phase Completion After Scratch-Path Correction {#regression-phase-completion-after-scratch-path-correction}

**Phase:** regression
**Claim Source:** executed
**Executed At:** 2026-08-29T07:47:49Z
**Outcome:** `completed_diagnostic`
**Verdict:** `REGRESSION_FREE`

This narrowed rerun used detached HEAD
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619` plus the exact authorized
five-file overlay. The overlay contains three BUG-017 planning and state files,
plus this BUG-022 report and state. The integrity comparator found zero excluded
paths and zero parity failures against the source checkout.

The scratch-path correction changed only this report. The correction therefore
invalidated checks that recursively read report content. It did not invalidate
commands whose inputs remain product source, tests, browser configuration, or
unchanged planning artifacts.

### Input-Closure Re-Derivation

**Claim Source:** interpreted
**Interpretation:** The current source identifies each command's direct input
closure. The isolated status and parity comparator identify the only five
overlay paths. The current selftest then verifies the repository-wide closure.

| Prior check | Report in declared input closure | Current disposition |
| --- | --- | --- |
| Spec test-path validator | Yes. It recursively reads every text artifact below `specs/`. | Rerun at exit 0. |
| Test-file reachability | Yes. `collectDeclaredTestGlobs()` recursively reads repository text and classifies packet reports as historical. | Rerun at exit 0. |
| Runtime-foundation functional carrier | Yes. Its committed-boundary and BUG-022 tests call `collectDeclaredTestGlobs(ROOT)`. | Rerun at 16 passed and exit 0. |
| Canonical selftest | Yes. It invokes both report-sensitive validators against the repository root. | Rerun at 3465 passed and exit 0. |
| Traceability guard | Yes. It resolves the single-file scope's evidence through this report. | Rerun at exit 0. |
| Artifact lint | Yes. It reads report sections and anti-fabrication evidence. | Rerun at exit 0. |
| Transition guard | Yes. It evaluates the packet report and state. | Rerun at expected exit 1 for non-terminal obligations. |
| Protected-integrity comparator | Yes. It checks report parity and invokes current reachability. | Rerun at exit 0. |
| Feature 008 direct Node and C03 browser suites | No changed overlay artifact is a test input. A focused reference scan found no BUG-017, BUG-022, report, or state reference in those carriers. | Reused from the immediately preceding iteration-4 rerun. |
| Structural coverage comparator | No. It reads three committed revisions of the runtime-foundation test. | Reused because those revision inputs are immutable. |
| Regression-quality guard | No. It reads the unchanged runtime-foundation test. | Reused at zero violations and zero warnings. |
| Scenario linked-test resolver | No. It reads the unchanged scenario manifest and linked test files. | Reused at 30 resolved references. |
| Completion-mirror validator | No. It reads state and scope artifacts. The BUG-017 mirror overlay is byte-identical to the preceding rerun. | Reused. The current canonical selftest also covers this validator. |
| Source lock, provisioning, and runner identity | No. Their package, lock, registry, and local-install inputs did not change. | Reused from the preceding rerun. |
| Framework write guard | No. It reads installed framework files. The five-file overlay contains no framework path. | Prior external drift finding preserved without rerun. |

The broad carrier scan found two references to unchanged Feature 008 planning
artifacts. Neither reference names an authorized overlay path. The narrowed
changed-artifact scan returned no match, which confirms that the report-only
correction cannot affect the reused 257-test Node or 94-test browser inputs.

### Fresh Report-Sensitive Results

| Check | Exit | Current observed result |
| --- | ---: | --- |
| Persisted mode resolver | 0 | `bugfix-fastlane`, ceiling `done`, with regression before simplify |
| Spec test paths | 0 | 816 artifacts, 19071 references, 269 distinct paths, 70 frozen missing, zero new, zero stale |
| Reachability | 0 | 201 test files, 10 active globs, 38 historical sites, zero classification errors, zero new orphan |
| Full functional carrier | 0 | 16 passed, zero failed, zero skipped, zero todo |
| Protected integrity | 0 | Five authorized overlay paths, zero excluded paths, byte-stable protected report and ratchets |
| Traceability | 0 | Three scenarios and 15 Test Plan rows passed with zero warnings |
| Artifact lint | 0 | 40-line packet lint passed |
| Canonical selftest | 0 | 3465 passed and zero failed |
| Non-terminal transition guard | 1 | Expected refusal on G022, G136, and incomplete scenario-state chains |

**Phase:** regression
**Claim Source:** executed

```text
# BUG-022 regression after scratch-path correction spec test paths
$ node scripts/validate-spec-test-paths.mjs
exit: 0
lines: 2
sha256: 52b19f03f339c5ad3bc375418d869c603ecedb93f911ab4c79c64193786c7384
[spec-test-paths] scanned=816 references=19071 distinctPaths=269 missingPaths=70 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
# BUG-022 regression after scratch-path correction reachability
$ node scripts/validate-test-file-reachability.mjs
exit: 0
lines: 43
sha256: 655af9cfef9855c9c52258547502a6103029469d6da116ffe7dd25de4c013f3f
201 test file(s) in tests/, 10 active glob(s), 38 historical site(s), 0 classification error(s) from 10017 artifact(s), 184 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
```

The reachability output reports 20 stale baseline entries. It does not report a
new orphan. The validator's documented contract says a stale entry is reported
while the command exits zero. Its `main()` result depends on classification
errors, vacuity, baseline presence, and new orphans. It does not fail on
`staleBaseline`. `REG-BUG022-R4-003` is therefore reported stale debt, not a
blocking regression. Baseline cleanup remains under the existing global
stale-and-clone adjudication boundary.

**Phase:** regression
**Claim Source:** executed

```text
# BUG-022 regression after scratch-path correction full functional carrier
$ node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 59
sha256: 49d381cdf3605a67c990b15705fd574ccfb1fb4de5084ec55238ca544ab8d301
[playwright-runtime] version=1.61.1
[playwright-runtime] browserChannel=chrome
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] frozenCrossings=9
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
tests 16
pass 16
fail 0
skipped 0
todo 0
```

**Phase:** regression
**Claim Source:** executed

```text
# BUG-022 regression after scratch-path correction protected integrity
$ /bin/zsh -f -c node /private/tmp/rl-bug022-regression-integrity-iter4-overlay.mjs . "$SOURCE_ROOT"
exit: 0
lines: 33
sha256: a53975a22cccce81fdb2334925f4083e1bb5ceb93c17d11f606cff9743e3f681
CHECKPOINT_HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
CHECKPOINT_OVERLAY_PATH_COUNT=5
CHECKPOINT_EXCLUDED_PATHS=0
IMPLEMENTATION_PATH_COUNT=3
PROTECTED_REPORT_ANCHOR_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_CURRENT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_BYTES=251561
REACHABILITY_BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_COUNTS=26->26
REACHABILITY_NEW_ORPHANS=0
REACHABILITY_STALE_BASELINE=20
KNOWN_CROSSINGS_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSING_COUNTS=9->9
ACTIVE_GLOBS=10
HISTORICAL_SITES=38
CLASSIFICATION_ERRORS=0
PROTECTED_REPORT_PORTFOLIO_SITES=1
PROTECTED_REPORT_ACTIVE_AUTHORITY=0
REINTRODUCTION_EXPECTED_NEW_CROSSINGS=8
ACTIVE_COUNTERFACTUAL_CROSSING=1
BUG017_REJECTED_CANDIDATE_MARKERS=0
CHECKPOINT_AUTHORIZED_OVERLAY=true
CONTAINMENT_FAILURES=0
```

**Phase:** regression
**Claim Source:** executed

```text
# BUG-022 regression after scratch-path correction canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3960
sha256: 45585aad232a508440c154c878fca7f170d172927be7c4440739376abf876848
Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ no model/config-authored field reaches innerHTML without esc()
  ✓ the sink detector catches an unescaped model-authored title
security findings — a declared bound that nothing validates is not a bound
  ✓ TB-SEC-02-01: invalid earliest claim ages are refused
  ✓ TB-SEC-02-02: no claim-age adjustment settles a negative benefit
  ✓ TB-SEC-02-03: the shipped pack is untouched by both refusals
  ✓ TB-SEC-01-01: the pack read holds its bound across the response BODY
  ✓ TB-SEC-01-02: an unrepresentable read bound is refused by name
  ✓ TB-SEC-03-01: the probe anchors its repository from its execution checkout
  ✓ TB-SEC-03-02: a file in another Git checkout is refused before mutation
================================================
Research-Lab self-test: 3465 passed, 0 failed
================================================
```

The selftest window above preserves the exact summary and representative first
and last signals. The recorded SHA-256 covers all 3960 produced lines.

### Governance Results And Expected Non-Terminal Refusal

**Phase:** regression
**Claim Source:** executed

```text
# BUG-022 regression after scratch-path correction traceability
exit: 0
lines: 75
sha256: 81a24e6a26331cca05e5f5a1945ff404449ed322485812d2e08616234061e9d7
Scenarios checked: 3
Test rows checked: 15
RESULT: PASSED (0 warnings)
# BUG-022 regression after scratch-path correction artifact lint
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.
# BUG-022 regression after scratch-path correction non-terminal guard
exit: 1
lines: 372
sha256: b829c26395620d31f6c36115486d1a40691ab5f4fe53036d03a71cdf665ce140
targetStatus: done
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G136]
failedChecks: [Check-4-scenario-states]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 9
exitStatus: 1
verdict: FAIL
```

The transition guard tests a terminal `done` transition. Its non-zero result is
expected because this invocation must preserve the incomplete phase chain,
scenario receipts, and human acceptance. It does not invalidate the completed
diagnostic regression phase.

### Baseline, Cross-Spec, Design, And Coverage Verdict

| Axis | Before correction | Current | Verdict |
| --- | --- | --- | --- |
| Full functional carrier | 16 passed, zero failed | 16 passed, zero failed | Stable |
| Feature 008 direct Node | 257 passed, zero failed | Reused on unchanged inputs | Stable |
| Feature 008 C03 browser | 94 passed, one worker, exit 0 | Reused on unchanged inputs | Stable |
| Canonical selftest | 3464 passed, one path failure | 3465 passed, zero failed | Repaired |
| Spec path validator | One scratch-fixture path failure | Zero new missing paths | Repaired |
| Reachability | Zero new orphan, 20 stale baseline entries | Zero new orphan, 20 stale baseline entries | Stable and non-blocking |
| Structural coverage | Six required tests unchanged, no deletion or weakening | Reused on immutable revision inputs | Stable |
| Protected Feature 008 report | SHA-256 `8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b` | Same | Stable |

No cross-spec conflict remains in the reviewed delta. BUG-017's three overlay
files reconcile its completion mirror. The current selftest passes that
repository-wide check. Feature 008 retains its Node and browser consumers.

No design contradiction remains. The report correction adds external-fixture
provenance and changes no requirement, design, route, model, or state contract.
No UI flow or deployment surface changed. Deployment regression checks are not
applicable to the three-file BUG-022 implementation range.

### Finding Accounting And Preserved Boundaries

| Finding | Current disposition | Owner or boundary |
| --- | --- | --- |
| `REG-BUG022-R4-RERUN-001` | Addressed. The corrected external-fixture rendering passes the path validator and canonical selftest. | none |
| `REG-BUG022-R4-001` | Addressed. The authorized BUG-017 mirror overlay remains reconciled. | none |
| `REG-BUG022-R4-003` | Addressed as a regression classification. Twenty stale reachability entries are reported cleanup debt, not a failing condition. | Global stale-and-clone adjudication remains preserved. |
| `REG-BUG022-R4-002` | Preserved. Five installed framework-agent drifts remain external to the BUG-022 implementation and five-file overlay. | upstream framework bug owner |
| `TEST-R4-BUG017-SCN11-NEW-STABLE-REVISION` | Preserved. SCN-BUG017-11 still requires a new final-revision receipt chain. | `bubbles.test` |
| `REG-R4-BUG022-CURRENT-RECEIPT-REFRESH` | Preserved. BUG-022 scenario receipts are not refreshed in this phase. | `bubbles.test` |
| `F-ACCEPTANCE-017-G136` | Preserved. BUG-017 human acceptance remains unchanged. | human |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Preserved. BUG-022 human acceptance remains unchanged. | human |
| `BUG022-PHASE-CHAIN-COMPLETION` | Preserved. Simplify, gaps, harden, stabilize, devops, security, docs, validate, audit, and finalize remain unclaimed here. | workflow phase owners |
| `BUG022-GLOBAL-STALE-CLONE-ADJUDICATION` | Preserved. This phase does not rewrite stale or clone evidence. | `bubbles.validate` and `bubbles.audit` |

### Regression Verdict

```text
🟢 REGRESSION_FREE
Test baseline: 3464/3465 -> 3465/3465
Cross-spec conflicts: 0
Design contradictions: 0
Coverage: structural declaration and assertion coverage stable
Gherkin traceability: 3/3 scenarios, 15/15 rows, exit 0
Protected report drift: 0 bytes
New reachability orphans: 0
New missing spec test paths: 0
```

This phase adds no scenario receipt and changes no source, config, test,
planning, certification, user-validation, framework, or protected file. The
top-level status and certification status remain `in_progress`. The next
required phase owner is `bubbles.simplify`.

## Simplify Phase Convergence Iteration 4 — BUG-022 Root Scan Reuse {#simplify-phase-convergence-iteration-4-bug022}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** Two repository-root BUG-022 assertions called
`collectDeclaredTestGlobs(ROOT)` after an earlier test had already populated the file-local
`declaredGlobs()` cache. Reusing that cache removes two complete recursive repository scans while
leaving isolated fixture roots uncached. The final functional carrier and authority validator
executed against the resulting tree.
**Executed At:** 2026-08-29T08:02:53Z
**Outcome:** `route_required`

### Review And Change

The reuse and efficiency passes found the same issue: the two root-only SCN-BUG022-003 assertions
bypassed the existing cache. Each now calls `declaredGlobs()`. The quality pass found no safe
reduction in `candidateClassification()`, artifact precedence, fence-aware heading ancestry,
structured test-plan parsing, or classification-error handling. Those branches encode the
fail-closed authority model and remain unchanged.

The fixture tests still call `collectDeclaredTestGlobs(fixtureRoot)` directly. Historical report
sites remain visible but non-authoritative. Active plans remain authoritative. Unknown candidates
still fail closed with provenance. The protected Feature 008 report, reachability baseline, frozen
crossing set, command registry, Playwright config, exact failure messages, and external-fixture
provenance remain unchanged.

The isolated baseline run recorded the two root assertions at 384.639458ms and 400.391ms. The
final run recorded them at 2.902833ms and 0.606292ms. This is one before/after sample. The durable
claim is the structural removal of two redundant recursive scans, not a stable timing benchmark.

### Final Functional Carrier

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 simplify final authority regression
$ node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 59
sha256: 06c29bdb2904e34b8bc31cf52b98298e8932637912afef72e1802b40456a472d
--- first 20 ---
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
[playwright-runtime] committedBrowserConfigs=playwright.config.mjs
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=79
[playwright-runtime] sharedImporters=79
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
--- omitted 19 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint (3.069959ms)
✔ Regression: SCN-BUG022-001 historical report receipts do not declare Node test globs (1.074875ms)
✔ Regression: SCN-BUG022-001 active scope Test Plan and structured test-plan commands remain authoritative (1.464667ms)
✔ Regression: SCN-BUG022-002 fenced and misheaded evidence cannot gain or escape artifact authority (1.221792ms)
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance (40.210916ms)
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth (2.902833ms)
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority (0.606292ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.692416ms)
✔ Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison (72.640459ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.331583ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.094ms)
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (0.395333ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 989.417625
```

### Authority And Quality Checks

| Check | Exit | Current signal |
| --- | ---: | --- |
| `node scripts/validate-test-file-reachability.mjs` | 0 | 201 files, 10 active globs, 34 historical sites, zero classification errors, zero new orphan; capture SHA-256 `8ef92312b333cd1a09e78a4ec1d0cf2416dd061c1620b195f84b8c33d9373a6e` |
| `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs` | 0 | Zero violations, zero warnings, one file with adversarial signals; capture SHA-256 `aa15ca8f1b327f7e328140e11a54d2cf988a94ddd03020e89843be94ecc8e8ca` |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | Artifact lint passed; 40 lines; SHA-256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| `node scripts/validate-scope-dod-progress.mjs` | 0 | 63 packets, 86 claims, 72 agreements, 14 frozen drifts, zero new or stale drift |
| Targeted `git diff --check` | 0 | The six simplify implementation and artifact paths contain no whitespace error |
| Unedited-surface comparison | 0 | Current config, classifier, command registry, and protected Feature 008 report have no live-tree delta |

The reachability validator still reports the already-recorded 20-entry stale-baseline ledger and
zero new orphan. This phase does not mutate that global ledger. It also adds no scenario receipt.
BUG-022 receipt refresh and SCN-BUG017-11 remain owned by `bubbles.test` at the final stable
revision. Packet status and certification remain `in_progress`. The next workflow phase owner is
`bubbles.gaps`.
