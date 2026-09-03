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

### Current Test Finding Accounting And Routing

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

## Implementation Gap Repair — Convergence Iteration 4 {#implementation-gap-repair-convergence-iteration-4}

**Phase:** implement
**Claim Source:** executed
**Executed At:** 2026-08-29T09:06:11Z
**Outcome:** `route_required`

The implementation changed only the production reachability validator and its
shared persistent functional carrier. The four new tests were authored before
the production edit. Each exact title produced a behavior-specific RED and then
passed on the repaired implementation. The live tree also contains pre-existing
untracked tool-brief and probe work. Repository-wide validation therefore used
an isolated `d0c09a3ec90d2bb72920caee9e44f1d5f697c619` checkout with the exact
authorized BUG-022 implementation overlay and the already-present BUG-017 state
overlay. No excluded path was copied into that checkout.

### TP-BUG022-F07 RED And GREEN {#tp-bug022-f07-red-and-green}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write$' tests/playwright-runtime.foundation.functional.mjs`

```text
# BUG-022 TP-BUG022-F07 RED
exit: 1
lines: 33
sha256: 076aee42157988a60275fa0febce962319df55134e132a62ec48b9f77524d636
[BUG022-F07] case=bare-root exit=0 signal=none scanOutput=true baselineStable=true
✖ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write (171.57925ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 385.582625
```

```text
# BUG-022 TP-BUG022-F07 final GREEN
exit: 0
lines: 14
sha256: 3c9ca1da9c0602a29e4620dbdba049bd88c4aad1a79a7b084bdadaa31e58ac7e
[BUG022-F07] case=bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-before-bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-after-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=all-sites-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] unknownOptionExit=2 signal=none
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write (159.144ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 366.410833
```

The final output directly proves usage exit 2, zero scan output, stable
permutation sentinels, and the retained unknown-option refusal.

### TP-BUG022-F08 RED And GREEN {#tp-bug022-f08-red-and-green}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern$' tests/playwright-runtime.foundation.functional.mjs`

```text
# BUG-022 TP-BUG022-F08 RED
exit: 1
lines: 36
sha256: 4191e6a8d26eed1267a00c8704bbd369b6e9031fb65c338e39012d43da2c91d3
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=1
[BUG022-F08] kinds=playwright-testMatch
[BUG022-F08] declaration=playwright-testMatch sites=2 siteKinds=playwright-testMatch,node-test-argument
✖ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern (4.26525ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 208.619375
```

```text
# BUG-022 TP-BUG022-F08 final GREEN
exit: 0
lines: 14
sha256: b900b3732e13a26f1f0037621123c96dfa41c41596c9dd84831979f72b5a9553
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=2
[BUG022-F08] kinds=node-test-argument,playwright-testMatch
[BUG022-F08] declaration=node-test-argument sites=1 siteKinds=node-test-argument
[BUG022-F08] declaration=playwright-testMatch sites=1 siteKinds=playwright-testMatch
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern (3.753916ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 193.751
```

### TP-BUG022-F09 RED And GREEN {#tp-bug022-f09-red-and-green}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert$' tests/playwright-runtime.foundation.functional.mjs`

```text
# BUG-022 TP-BUG022-F09 RED
exit: 1
lines: 41
sha256: 84c7fc6ce897b8cdb731e4b71d48f471c2fb1b574c92b5e812e817104224fca1
[BUG022-F09] classificationErrors=0
[BUG022-F09] errorPatterns=
[BUG022-F09] proseCandidateCount=0
✖ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert (3.771667ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 211.196292
```

```text
# BUG-022 TP-BUG022-F09 final GREEN
exit: 0
lines: 15
sha256: 003253c6e6876a599eea016b206411395e78e50a27de787ce2bfc52fa31da275
[BUG022-F09] classificationErrors=3
[BUG022-F09] errorPatterns=tests/env-wrapped-*.mjs,tests/perl-wrapped-*.mjs,tests/timeout-wrapped-*.mjs
[BUG022-F09] proseCandidateCount=0
[BUG022-F09] misc/wrapped-commands.md:3 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:4 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:5 section=none reason=unknown-artifact-role
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert (4.010042ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 200.924541
```

### TP-BUG022-F10 RED And GREEN {#tp-bug022-f10-red-and-green}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs`

**Evidence-Provenance Display Correction:** The `sha256` value below remains
the historical hash of the original captured bytes. The test emitted a
fixture-relative value from a disposable external root. Only the displayed
path gains the established `<fixture-root>/` prefix. The refusal type, relative
leaf, historical control, test result, and exit remain unchanged.

```text
# BUG-022 TP-BUG022-F10 RED
exit: 1
lines: 32
sha256: eca74a3daf87659f07dfe0767628a364c0f988c9cf7a4c83d68c0506ea5f52b1
✖ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing (1.580375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 242.63875
```

```text
# BUG-022 TP-BUG022-F10 final GREEN
exit: 0
lines: 11
sha256: 0ced262b57389e1c0be8a3f9201c49e4d5d2bbce60e6b979944140734f2794de
[BUG022-F10] activeRefusal=RunnerDisjointnessRefusal path=<fixture-root>/tests/shared-crossing-example.mjs
[BUG022-F10] historicalVerdict=pass crossings=0
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing (6.400333ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 198.687209
```

### TP-BUG022-C08 Shared-Carrier Canary {#tp-bug022-c08-shared-carrier-canary}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0

```text
# BUG-022 TP-BUG022-C08 final shared functional carrier
exit: 0
lines: 81
sha256: 23c9bfa3a791fb8ba81db528fd8660e2000740dec20fd3c95eb05491f5a3e3ab
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
[playwright-runtime] discoveredSpecs=81
[playwright-runtime] sharedImporters=81
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=81
[playwright-runtime] nodeGlobSelected=118
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance (40.34475ms)
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth (3.002667ms)
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority (0.339875ms)
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write (158.894375ms)
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern (1.207917ms)
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert (0.669041ms)
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing (3.186166ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.792375ms)
✔ Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison (68.947208ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.401416ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.093209ms)
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (2.15525ms)
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2991.921083
```

### TP-BUG022-C09 Rollback And Restore Integrity {#tp-bug022-c09-rollback-and-restore-integrity}

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The isolated checkout first received the final authorized
overlay. The carrier's iteration-4 hunks were reversed with an IDE patch, and
`git restore --source=HEAD -- scripts/validate-test-file-reachability.mjs`
restored the pre-edit validator. Exact hashes then matched the pre-edit source
and carrier observations from this session. The final overlay was copied back,
and `cmp -s` returned zero for both final files. Protected hashes and ratchet
counts stayed constant across both directions.

```text
BUG022_C09_ROLLBACK_RESTORATION_BEGIN
SOURCE_ROLLBACK_SHA=fc0414647a567058d41142577bc67ffc3f2d32507ab77ffd88e1b8c244588873
SOURCE_PRE_EDIT_MATCH=true
TEST_ROLLBACK_SHA=21bd6607e2d29417c4930cda218ac8489c7edfca61c0e6d1506bb16f5245b0bd
TEST_PRE_EDIT_MATCH=true
BASELINE_SHA=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
BASELINE_PRE_EDIT_MATCH=true
REGISTRY_SHA=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
REGISTRY_PRE_EDIT_MATCH=true
PROTECTED_REPORT_SHA=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
PROTECTED_REPORT_PRE_EDIT_MATCH=true
BASELINE_ENTRY_COUNT=26
FROZEN_CROSSING_COUNT=9
PROTECTED_DIFF_EXIT=0
BUG022_C09_ROLLBACK_RESTORATION_END
```

```text
BUG022_C09_FORWARD_RESTORE_BEGIN
SOURCE_FINAL_RESTORE_CMP_EXIT=0
TEST_FINAL_RESTORE_CMP_EXIT=0
SOURCE_FINAL_SHA=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
TEST_FINAL_SHA=ad715fa42500a99a5ce65dcf3c89e35bf82935845d1b60c7133ceab9aa0b73a3
BASELINE_FINAL_SHA=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REGISTRY_FINAL_SHA=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
PROTECTED_REPORT_FINAL_SHA=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
BASELINE_ENTRY_COUNT=26
FROZEN_CROSSING_COUNT=9
BUG022_C09_FORWARD_RESTORE_END
```

```text
BUG022_TP_C09_FINAL_INTEGRITY_BEGIN
CHECK_1=source-test-diff-check
CHECK_1_EXIT=0
CHECK_2=protected-path-no-diff
CHECK_2_EXIT=0
BASELINE_SHA=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REGISTRY_SHA=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
PROTECTED_REPORT_SHA=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
BASELINE_ENTRY_COUNT=26
FROZEN_CROSSING_COUNT=9
BUG022_TP_C09_FINAL_INTEGRITY_END
```

### Implementation-Owned Closure Checks {#implementation-owned-closure-checks-r4}

**Phase:** implement
**Claim Source:** executed

```text
# BUG-022 final isolated production reachability
$ node scripts/validate-test-file-reachability.mjs
exit: 0
lines: 43
sha256: efddaced3677fc2af72938d1d5b6f46af58c8db2ac2e3facf65bed0a04e31090
201 test file(s) in tests/, 10 active glob(s), 30 historical site(s), 0 classification error(s) from 10016 artifact(s), 184 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s), first playwright.config.mjs:4
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:151
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:152
```

The complete output reports 20 stale baseline entries and no `NEW ORPHAN`
line. The command exits zero under the validator's shrink-only ratchet contract.

```text
# BUG-022 Node source-lock validation
$ node scripts/validate-node-source-lock.mjs
exit: 0
lines: 22
sha256: e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

```text
# BUG-022 regression-quality guard final implementation
$ /bin/bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 15
sha256: 718a6900b26a7472e43af3c1d53999d47f1a7aee1fcef83e07a0824be00dc8b3
ℹ️  Scanning tests/playwright-runtime.foundation.functional.mjs
✅ Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
```

The marker scans also exited zero with zero skip, only, todo, TODO, FIXME,
HACK, STUB, or `unimplemented!` findings. The implementation-reality scan
exited zero with no violation and one advisory planning-discovery warning.

### Preserved External And Test-Owner Findings {#preserved-external-and-test-owner-findings-r4}

**Phase:** implement
**Claim Source:** executed

The production validator on the shared live tree correctly refused one
pre-existing excluded concurrent file. The same final implementation passed in
the isolated authorized overlay above.

```text
BUG022_LIVE_REACHABILITY_DIAGNOSTIC_BEGIN
testFiles=207
activeGlobs=10
historicalSites=30
classificationErrors=0
knownOrphans=6
newOrphans=1
NEW_ORPHAN=tests/tool-brief-v2.stress.mjs
staleBaseline=20
baselineEntries=26
BUG022_LIVE_REACHABILITY_DIAGNOSTIC_END
```

The isolated repository selftest executed and recorded `3464 passed, 1
failed`. Its only failure was the expected reopened-scope progress mismatch:
the validate-owned mirror still records the prior 16-row state while this plan
contains six new rows. This implementation run does not alter certification or
scenario-derived mirrors. Final-revision scenario-state receipts belong to the
independent test phase requested by the workflow.

An initial attempt to capture the zero-output C09 diff command through the
installed evidence helper exposed an external helper arithmetic-format defect
after the inner command returned zero. The direct framed rerun above executed
both diff commands and returned zero. No installed framework file changed.

## Inherited Delta Audit And Current Mutation Proof — Convergence Iteration 4 {#inherited-delta-audit-current-mutation-proof-convergence-iteration-4}

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The inherited source and persistent-test delta implements
the four reopened gap contracts. This conclusion uses fresh mutation controls,
fresh GREEN executions, the complete carrier, isolated production reachability,
and reverse-and-forward byte checks from this invocation. It does not rely on a
silent dispatch having executed any test.
**Executed At:** 2026-08-29T09:20:58Z
**Outcome:** `route_required`

### Evidence Authority

The source and test changes were already present when this invocation began.
The operator stated that the silent dispatch supplied no tool-log execution
rows and no authoritative report or state evidence. Earlier iteration-4 prose
was therefore not used as proof for this audit.

The filing-time gap discovery remains the historical pre-implementation RED
basis. The four RED results below are explicitly **current mutation RED
controls** against the already-present implementation. They prove that each
persistent test rejects the exact regression it names. They are not presented
as pre-implementation chronology.

The inherited production and test bytes at audit entry were:

```text
SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
TEST_SHA256=cbb271091cbabb5b07b504e260d97ec374c581c60eadc195f84632ed691b1975
TEST_GIT_OBJECT=520a6a71b398a221c3f55c884b8591b680a05da1
PROTECTED_BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
COMMAND_REGISTRY_SHA256=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
PROTECTED_REPORT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
```

Source inspection and fresh execution exposed no defect that required a new
persistent source or test edit. Every temporary source mutation was reversed
immediately, and every restoration returned the entry object
`805d78d3719db0c0c438989df3eb13b7242cc7a9`.

### TP-BUG022-F07 Current Mutation RED {#tp-bug022-f07-current-mutation-red-r4-audit}

**Phase:** implement
**Claim Source:** executed
**Mutation:** Replace fail-loud `--root` operand validation with the old
`resolve(cwd, argv[++i] ?? '.')` fallback.
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1

```text
# BUG-022 iteration-4 F07 current mutation RED old root fallback
exit: 1
lines: 33
sha256: d5a7c27d07ecf2d400963c148be1095691f5d2ccb657886fed6befd79f341a82
[BUG022-F07] case=bare-root exit=0 signal=none scanOutput=true baselineStable=true
✖ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write
ℹ tests 1
ℹ pass 0
ℹ fail 1
AssertionError [ERR_ASSERTION]: bare-root must be a usage refusal
0 !== 2
```

```text
F07_SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
F07_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F07_EXPECTED_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F07_BYTE_RESTORED=true
```

### TP-BUG022-F08 Current Mutation RED {#tp-bug022-f08-current-mutation-red-r4-audit}

**Phase:** implement
**Claim Source:** executed
**Mutation:** Collapse `declarationIdentity(kind, pattern)` to pattern-only
identity.
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1

```text
# BUG-022 iteration-4 F08 current mutation RED pattern-only identity
exit: 1
lines: 36
sha256: a85cda5664b7343039830279e37289685988542118de570548aa29e3ac5ebfbe
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=1
[BUG022-F08] kinds=playwright-testMatch
[BUG022-F08] declaration=playwright-testMatch sites=2 siteKinds=playwright-testMatch,node-test-argument
ℹ tests 1
ℹ pass 0
ℹ fail 1
AssertionError [ERR_ASSERTION]: 1 !== 2
```

```text
F08_SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
F08_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F08_EXPECTED_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F08_BYTE_RESTORED=true
```

### TP-BUG022-F09 Current Mutation RED {#tp-bug022-f09-current-mutation-red-r4-audit}

**Phase:** implement
**Claim Source:** executed
**Mutation:** Remove the timeout-wrapper alternative from the anchored
production command parser while retaining the environment and Perl-alarm
alternatives.
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1

```text
# BUG-022 iteration-4 F09 current mutation RED timeout wrapper removed
exit: 1
lines: 42
sha256: 6f5c1c304377445434ecd3d8d0594fc9220c5d0da2ede827a45a0fffff303fc9
[BUG022-F09] classificationErrors=2
[BUG022-F09] errorPatterns=tests/env-wrapped-*.mjs,tests/perl-wrapped-*.mjs
[BUG022-F09] proseCandidateCount=0
[BUG022-F09] misc/wrapped-commands.md:3 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:5 section=none reason=unknown-artifact-role
ℹ tests 1
ℹ pass 0
ℹ fail 1
-   'tests/timeout-wrapped-*.mjs'
```

```text
F09_SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
F09_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F09_EXPECTED_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F09_BYTE_RESTORED=true
```

### TP-BUG022-F10 Current Mutation RED {#tp-bug022-f10-current-mutation-red-r4-audit}

**Phase:** implement
**Claim Source:** executed
**Mutation:** Bypass the shared typed refusal for a new active crossing while
retaining stale-crossing refusal.
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 1

```text
# BUG-022 iteration-4 F10 current mutation RED shared refusal bypassed
exit: 1
lines: 28
sha256: 8b8210531eb8982f33e83411e9ab205edaa605c9a83a3a26ffaa875fa64bf1a9
✖ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
AssertionError [ERR_ASSERTION]: Missing expected exception.
```

```text
F10_SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
F10_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F10_EXPECTED_SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
F10_BYTE_RESTORED=true
```

### Exact GREEN Executions {#tp-bug022-f07-f10-current-green-r4-audit}

**Phase:** implement
**Claim Source:** executed

Each command below is the same exact persistent-test command used for its
mutation RED control, executed after byte restoration.

```text
# TP-BUG022-F07 final GREEN
exit: 0
lines: 14
sha256: 1fb6935dcd9aa3b965b731a711b09b96cb36b68ebb049a5f2460557ba6c92a0f
[BUG022-F07] case=bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-before-bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-after-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=all-sites-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] unknownOptionExit=2 signal=none
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

```text
# TP-BUG022-F08 final GREEN
exit: 0
lines: 14
sha256: 6b3061fbf9459d14e6494974c354119c15ed77d0a9587df2937fe25c0efff578
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=2
[BUG022-F08] kinds=node-test-argument,playwright-testMatch
[BUG022-F08] declaration=node-test-argument sites=1 siteKinds=node-test-argument
[BUG022-F08] declaration=playwright-testMatch sites=1 siteKinds=playwright-testMatch
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

```text
# TP-BUG022-F09 final GREEN
exit: 0
lines: 15
sha256: 5c71a784af9c5748bdc83e2f4ef891c64fd84ee116be9e48ecef95f1f5636731
[BUG022-F09] classificationErrors=3
[BUG022-F09] errorPatterns=tests/env-wrapped-*.mjs,tests/perl-wrapped-*.mjs,tests/timeout-wrapped-*.mjs
[BUG022-F09] proseCandidateCount=0
[BUG022-F09] misc/wrapped-commands.md:3 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:4 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:5 section=none reason=unknown-artifact-role
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

**Evidence-Provenance Display Correction:** The F10 `sha256` below remains the
historical hash of the original captured bytes. Only the fixture path display
gains the `<fixture-root>/` prefix. All refusal, control, count, and exit facts
remain unchanged.

```text
# TP-BUG022-F10 final GREEN
exit: 0
lines: 11
sha256: 665ec9890f7ba3242ffee79c62b538daa2d368c0fa17d3e3b0557f59674fedcf
[BUG022-F10] activeRefusal=RunnerDisjointnessRefusal path=<fixture-root>/tests/shared-crossing-example.mjs
[BUG022-F10] historicalVerdict=pass crossings=0
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

F07 is the direct production CLI argument matrix. F10 is the direct active and
historical crossing control. Their outputs prove the named behavior rather than
a proxy reimplementation.

### TP-BUG022-C08 Shared-Carrier Canary {#tp-bug022-c08-current-audit-r4}

**Phase:** implement
**Claim Source:** executed
**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0

```text
# BUG-022 TP-BUG022-C08 final shared functional carrier
exit: 0
lines: 81
sha256: c4a7947bccb6d5533b1c2eb3785d41a0a738513b7e551304067832cafadba826
[playwright-runtime] committedBrowserConfigs=playwright.config.mjs
[playwright-runtime] testMatch=**/*.spec.mjs
[playwright-runtime] discoveredSpecs=81
[playwright-runtime] sharedImporters=81
[playwright-runtime] browserSelected=81
[playwright-runtime] nodeGlobSelected=118
[playwright-runtime] frozenCrossings=9
ℹ tests 20
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Production Reachability {#production-reachability-current-audit-r4}

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The shared live worktree refusal is caused only by the
operator-excluded concurrent tool-brief stress file. An isolated representation
containing HEAD plus the current BUG-022 source, test, scope, and structured
test-plan blobs excludes that unrelated untracked path and passes production
reachability with no classification error or new orphan.

```text
# BUG-022 live-tree production reachability diagnostic
exit: 1
lines: 44
sha256: 7fc31e974d66819fe186116cae270b508301e5b54d87a5b5c235fcccdc2b10ef
BUG022_LIVE_REACHABILITY_DIAGNOSTIC_BEGIN
testFiles=207
activeGlobs=10
historicalSites=30
classificationErrors=0
knownOrphans=6
newOrphans=1
NEW_ORPHAN=tests/tool-brief-v2.stress.mjs
staleBaseline=20
baselineEntries=26
BUG022_LIVE_REACHABILITY_DIAGNOSTIC_END
```

```text
# BUG-022 clean isolated authorized-overlay production reachability
exit: 0
lines: 43
sha256: c902f7d70d80217236b0850cb08cf91a8bf24c4f0f609f4df6a4e38548a2af34
201 test file(s) in tests/, 10 active glob(s), 26 historical site(s),
0 classification error(s) from 10017 artifact(s), 184 reachable,
11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s)
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s)
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s)
ISOLATED_REACHABILITY_EXIT=0
```

The first isolated attempt copied only source and test blobs. It correctly
refused one classification error from the older HEAD `scopes.md`, so it was not
accepted as closure evidence. A second setup attempt assigned zsh's reserved
`path` parameter, invalidated command lookup, and was also rejected. Its
temporary worktree was restored and removed with both cleanup commands at exit
0. The clean retry above used explicit paths, included the current planning
inputs consumed by the classifier, and ended with
`C09_TEMP_PRESENT_AFTER=false`.

### TP-BUG022-C09 Rollback And Restore {#tp-bug022-c09-current-audit-r4}

**Phase:** implement
**Claim Source:** executed

The isolated representation reversed the source and test pair to HEAD, checked
both exact objects, restored the two audited final blobs, compared both restored
files byte-for-byte with the live authorized files, checked protected paths,
and removed the temporary worktree.

```text
C09_REVERSE_EXIT=0
C09_REVERSE_SOURCE_OBJECT=5849f920d82efd4171da388370430ae163e771eb
C09_REVERSE_SOURCE_EXPECTED=5849f920d82efd4171da388370430ae163e771eb
C09_REVERSE_TEST_OBJECT=bea34c685c14aa758db2c8cf732efb3658b5220e
C09_REVERSE_TEST_EXPECTED=bea34c685c14aa758db2c8cf732efb3658b5220e
C09_FORWARD_INDEX_SOURCE_EXIT=0
C09_FORWARD_INDEX_TEST_EXIT=0
C09_FORWARD_CHECKOUT_EXIT=0
C09_FORWARD_SOURCE_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
C09_FORWARD_SOURCE_EXPECTED=805d78d3719db0c0c438989df3eb13b7242cc7a9
C09_FORWARD_TEST_OBJECT=520a6a71b398a221c3f55c884b8591b680a05da1
C09_FORWARD_TEST_EXPECTED=520a6a71b398a221c3f55c884b8591b680a05da1
C09_FORWARD_SOURCE_CMP_EXIT=0
C09_FORWARD_TEST_CMP_EXIT=0
C09_OVERLAY_DIFF_CHECK_EXIT=0
C09_PROTECTED_DIFF_EXIT=0
C09_BASELINE_ENTRY_COUNT=26
C09_CLEANUP_RESTORE_EXIT=0
C09_WORKTREE_REMOVE_EXIT=0
C09_TEMP_PRESENT_AFTER=false
C09_FAILURE_COUNT=0
```

### Protected Ratchets And Static Diagnostics {#protected-ratchets-and-static-diagnostics-current-audit-r4}

**Phase:** implement
**Claim Source:** executed

```text
PROTECTED_DIFF_EXIT=0
BASELINE_ENTRY_COUNT=26
BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
COMMAND_REGISTRY_SHA256=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
PROTECTED_REPORT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
CURRENT_CROSSING_COUNT=9
HEAD_CROSSING_COUNT=9
CURRENT_CROSSING_BLOCK_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
HEAD_CROSSING_BLOCK_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
CROSSING_BLOCK_BYTE_EQUAL=true
CROSSING_BLOCK_CHECK_EXIT=0
SOURCE_NODE_CHECK_EXIT=0
TEST_NODE_CHECK_EXIT=0
FORBIDDEN_MARKER_SCAN_EXIT=1
FORBIDDEN_MARKER_COUNT=0
EDITOR_DIAGNOSTIC_COUNT=0
```

The marker scan's exit 1 is the documented no-match result. Both editor
diagnostic reads reported no errors.

```text
# BUG-022 final Node source-lock validation
exit: 0
lines: 22
sha256: e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

```text
# BUG-022 final regression-quality guard
exit: 0
lines: 15
sha256: 5715b018c4f341adf47b98cdc1447e8668686bd0059717c6d337b4f33a639474
Scanning tests/playwright-runtime.foundation.functional.mjs
Adversarial signal detected in tests/playwright-runtime.foundation.functional.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
```

```text
# BUG-022 implementation reality scan
exit: 0
lines: 38
sha256: a0033397f6c850fb3c330ed3cca69325a237225c3ad2d139dd43213602814673
Files scanned: 1
Violations: 0
Warnings: 1
PASSED with 1 warning(s) — manual review advised
```

The reality-scan warning says scope-based implementation-file discovery found
zero paths and used one `design.md` fallback. It is planning-owned and does not
change the zero-violation implementation verdict.

### Finding Accounting And Ownership Boundary

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** Fresh current-session proof closes the implementation side
of all four reopened gap findings. Independent test ownership and planning-state
reconciliation remain separate authority boundaries.

| Finding | Implementation disposition | Current evidence |
| --- | --- | --- |
| `GAPS-R4-BUG022-001-MISSING-ROOT-VALUE` | Addressed | F07 current mutation RED `d5a7c27...`, byte restoration, GREEN `1fb6935d...` |
| `GAPS-R4-BUG022-002-KIND-COLLISION` | Addressed | F08 current mutation RED `a85cda56...`, byte restoration, GREEN `6b3061fb...` |
| `GAPS-R4-BUG022-003-WRAPPED-CANDIDATE` | Addressed | F09 current mutation RED `6f5c1c30...`, byte restoration, GREEN `5c71a784...` |
| `GAPS-R4-BUG022-004-PROXY-NEGATIVE-CONTROL` | Addressed | F10 current mutation RED `8b821053...`, byte restoration, GREEN `665ec989...` |

This invocation does not change `scopes.md`, `test-plan.json`,
`scenario-manifest.json`, `uservalidation.md`, certification, acceptance,
terminal status, BUG-017, framework files, baselines, the protected Feature 008
report, or any unrelated path. It gives no new completion authority to the six
new DoD rows, the Scope 1 status, or the planned test-plan rows. Independent
test execution owns their verification. Planning owns reconciliation after that
independent result.

The external tool-brief reachability path, SCN-BUG017-11 revision work, both
G136 boundaries, final receipt refresh, the remaining phase chain, global
stale-and-clone adjudication, and external framework drift retain their prior
owners and state.

## Independent Test Verification — Convergence Iteration 4 {#independent-test-verification-convergence-iteration-4}

**Phase:** test
**Claim Source:** executed
**Executed At:** 2026-08-29T09:34:17Z
**Outcome:** `route_required`

This invocation independently executed all six reopened rows. It did not use
the implementation-owner receipts as execution proof. The exact inherited
repository packet first passed `repository-binding.sh validate-packet` at
decision revision 9. A disposable clone then combined base HEAD
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619` with only the current BUG-022
source, focused carrier, and packet blobs. No market-brief, tool-brief, probe,
BUG-017, BUG-019, company-intelligence, or other concurrent delta entered the
overlay.

The independently observed implementation identities were:

```text
SOURCE_SHA256=ad5e9a80d9735ef24b5c65c4bafdd831365658a93aeb0236eee0ddd457e580c5
SOURCE_GIT_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
TEST_SHA256=cbb271091cbabb5b07b504e260d97ec374c581c60eadc195f84632ed691b1975
TEST_GIT_OBJECT=520a6a71b398a221c3f55c884b8591b680a05da1
BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
COMMAND_REGISTRY_SHA256=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
PROTECTED_REPORT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
OVERLAY_HEAD=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
OVERLAY_CHANGED_SOURCE=scripts/validate-test-file-reachability.mjs
OVERLAY_CHANGED_TEST=tests/playwright-runtime.foundation.functional.mjs
OVERLAY_CHANGED_PACKET=BUG-022 report, scenario manifest, scopes, state, and test plan
```

### Per-Row Outcome, Mechanism, And Negative Control

| Row | Outcome | Output SHA-256 | Test mechanism | Executed negative control |
| --- | --- | --- | --- | --- |
| `TP-BUG022-F07` | PASS, parent exit 0; four expected child usage refusals each exited 2 | `43e8402330b1f0a0cfad0ee3b24ecc1eac98960e9a686a41238264f867d2b9a3` | Production CLI subprocess, ephemeral fixture, returned exit and byte-stable baseline | Missing root plus option-shaped root, with `--update-baseline` before and after the invalid root; any scan, write, or non-2 result fails the test |
| `TP-BUG022-F08` | PASS, 2 declarations with homogeneous runner sites | `c13ccdad02d7413b94becce940cfa930377bd603d7968d62b5b9de6799c3b1ae` | Public production collector over an isolated declaration fixture | One identical pattern is declared by both Node and Playwright; a pattern-only identity collapses the pair and fails |
| `TP-BUG022-F09` | PASS, 3 wrapped errors and 0 prose candidates | `8559fd9fd34d504015c8f8cb62041067a4b7bbf67ad6f92e69e0f5a9665b9a50` | Public production collector over line-anchored command and prose fixtures | Identical wrapper tokens are placed at command position and behind a prose prefix; only command-position candidates may classify |
| `TP-BUG022-F10` | PASS, typed active refusal and historical pass | `844f23cacb88540bfbcff8b717f04a4d0aa8e1c3f5b22382556bd47e78bd6619` | Shared production disjointness function over active and historical declaration fixtures | The same `commandBytes` variable is used first in an active plan and then in a historical report; the active call must throw and the historical call must return pass |
| `TP-BUG022-C08` | PASS, 20 passed, 0 failed, 0 skipped, 0 todo | `cedd8ef75916adb95de0eca4b1fb4e75aec6b88fc2eebf9bba6ef586b25e4b2e` | Complete shared functional carrier against the final source and test objects | The carrier includes all four adversarial rows plus the pre-existing shared runtime, discovery, and BUG-017 canaries |
| `TP-BUG022-C09` | PASS, exact reverse and forward objects restored; protected ratchets unchanged | `75f6980b208fc216329137c6392edc459bae0a49abaa0ba9160f81b4d4e4b8ab` | Disposable-clone Git object reversal, restoration, byte comparison, and protected-path diff | Reverse both repaired files to their exact HEAD objects, restore the exact final objects, and fail on any object, byte, baseline, registry, report, or crossing mismatch |

### TP-BUG022-F07 — Invalid-Root Matrix

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent TP-BUG022-F07
exit: 0
lines: 14
sha256: 43e8402330b1f0a0cfad0ee3b24ecc1eac98960e9a686a41238264f867d2b9a3
[BUG022-F07] case=bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-before-bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-after-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=all-sites-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] unknownOptionExit=2 signal=none
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

The four nonzero child exits are expected usage refusals. The enclosing Node
test and evidence wrapper exited zero. No child emitted scan output or changed
its baseline sentinel.

### TP-BUG022-F08 — Kind Plus Pattern Identity

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent TP-BUG022-F08
exit: 0
lines: 14
sha256: c13ccdad02d7413b94becce940cfa930377bd603d7968d62b5b9de6799c3b1ae
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=2
[BUG022-F08] kinds=node-test-argument,playwright-testMatch
[BUG022-F08] declaration=node-test-argument sites=1 siteKinds=node-test-argument
[BUG022-F08] declaration=playwright-testMatch sites=1 siteKinds=playwright-testMatch
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

### TP-BUG022-F09 — Wrapper Recognition And Prose Inertness

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent TP-BUG022-F09
exit: 0
lines: 15
sha256: 8559fd9fd34d504015c8f8cb62041067a4b7bbf67ad6f92e69e0f5a9665b9a50
[BUG022-F09] classificationErrors=3
[BUG022-F09] errorPatterns=tests/env-wrapped-*.mjs,tests/perl-wrapped-*.mjs,tests/timeout-wrapped-*.mjs
[BUG022-F09] proseCandidateCount=0
[BUG022-F09] misc/wrapped-commands.md:3 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:4 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:5 section=none reason=unknown-artifact-role
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

### TP-BUG022-F10 — Shared Typed Refusal And Historical Control

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The test source uses one `commandBytes` value in both
fixtures. The executed output directly proves that the active fixture throws
`RunnerDisjointnessRefusal` for the exact fixture-relative leaf and the
historical fixture returns `pass` with zero crossings.

**Evidence-Byte Correction:** The historical raw-child-output receipt remains
recorded as exit 0, 11 lines, SHA-256
`844f23cacb88540bfbcff8b717f04a4d0aa8e1c3f5b22382556bd47e78bd6619`.
A prior display edit added a fixture-root prefix without recomputing that hash.
The edited display is no longer presented as bytes covered by the historical
hash. The original measured outcomes remain a typed active refusal for the
relative fixture leaf `shared-crossing-example.mjs`, a historical `pass` with
zero crossings, one passing test, and zero failures, skips, or todos.

#### Fresh F10 Receipt And Interpreted Provenance Rendering

**Phase:** test
**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Fresh Child-Output SHA-256:** `bea13d9ceba3c4e82e13a441e6e358dc95baaf1092d5ff76771e5be4f3795e73`
**Interpreted Rendering SHA-256:** `b33c690abf191ed8057ad2b9c82a811ae6e9d27575bb9bc9ded915360982b244`

The fresh child-output hash covers the 11 verbatim lines from the exact test
run. The rendering hash was independently derived over exactly the 10 lines
below, including its interpreted `<fixture-root>/` prefix and excluding runner
timings. The hashes attest different byte sequences and are not interchangeable.

```text
[BUG022-F10] activeRefusal=RunnerDisjointnessRefusal path=<fixture-root>/tests/shared-crossing-example.mjs
[BUG022-F10] historicalVerdict=pass crossings=0
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

This report-only correction changes the report object, so every prior
final-stable-revision scenario receipt is invalidated. Receipt state:
`refresh-required`; owner: `bubbles.plan`.

### TP-BUG022-C08 — Complete Shared Functional Carrier

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent TP-BUG022-C08 complete shared functional carrier
exit: 0
lines: 81
sha256: cedd8ef75916adb95de0eca4b1fb4e75aec6b88fc2eebf9bba6ef586b25e4b2e
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
--- omitted 41 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ Regression: SCN-BUG022-002 unknown artifact roles fail closed with candidate provenance
✔ Regression: SCN-BUG022-003 historical receipt classification removes exactly eight portfolio crossings without baseline growth
✔ Regression: SCN-BUG022-003 active functional and test Node families remain reachable without report authority
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence
✔ Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity
ℹ tests 20
ℹ suites 0
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The lower isolated discovery counts reflect the deliberate exclusion of the
concurrent untracked tool-brief and probe tests. No claim is made about the
dirty live-tree suite.

### Isolated Production Reachability

**Command:** `node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent isolated production reachability
exit: 0
lines: 43
sha256: efddaced3677fc2af72938d1d5b6f46af58c8db2ac2e3facf65bed0a04e31090
201 test file(s) in tests/, 10 active glob(s), 30 historical site(s), 0 classification error(s) from 10016 artifact(s), 184 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s), first playwright.config.mjs:4
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:151
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:152
glob tests/*.unit.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:162
glob tests/causal-rotation-*.mjs [node-test-argument] declared at 1 site(s), first notes/causal-rotation-lab.md:119
glob tests/portfolio-*.functional.mjs [node-test-argument] declared at 2 site(s)
glob tests/portfolio-*.unit.mjs [node-test-argument] declared at 2 site(s)
20 STALE BASELINE lines followed; there was no NEW ORPHAN line.
```

The stale baseline entries remain unchanged and are reserved for the recorded
stale-and-clone adjudication work.

### TP-BUG022-C09 — Exact-Object Rollback And Restore

**Command:** Disposable-clone reverse and forward object harness, followed by
the exact Test Plan command
`git diff --check -- scripts/validate-test-file-reachability.mjs tests/playwright-runtime.foundation.functional.mjs && git diff --exit-code -- scripts/validate-test-file-reachability.baseline .specify/memory/agents.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/report.md`.
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-022 independent TP-BUG022-C09 rollback restore exact objects and ratchets
exit: 0
lines: 36
sha256: 75f6980b208fc216329137c6392edc459bae0a49abaa0ba9160f81b4d4e4b8ab
C09_FINAL_SOURCE_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
C09_FINAL_TEST_OBJECT=520a6a71b398a221c3f55c884b8591b680a05da1
C09_HEAD_SOURCE_OBJECT=5849f920d82efd4171da388370430ae163e771eb
C09_HEAD_TEST_OBJECT=bea34c685c14aa758db2c8cf732efb3658b5220e
C09_BASELINE_COUNT_BEFORE=26
C09_CROSSING_COUNT_BEFORE=9
C09_PROTECTED_DIFF_BEFORE_EXIT=0
C09_REVERSE_RESET_EXIT=0
C09_REVERSE_CHECKOUT_EXIT=0
C09_REVERSE_SOURCE_OBJECT=5849f920d82efd4171da388370430ae163e771eb
C09_REVERSE_TEST_OBJECT=bea34c685c14aa758db2c8cf732efb3658b5220e
C09_CROSSING_COUNT_REVERSE=9
C09_FORWARD_INDEX_SOURCE_EXIT=0
C09_FORWARD_INDEX_TEST_EXIT=0
C09_FORWARD_CHECKOUT_EXIT=0
C09_RESTORED_SOURCE_OBJECT=805d78d3719db0c0c438989df3eb13b7242cc7a9
C09_RESTORED_TEST_OBJECT=520a6a71b398a221c3f55c884b8591b680a05da1
C09_SOURCE_LIVE_CMP_EXIT=0
C09_TEST_LIVE_CMP_EXIT=0
C09_WORKING_INDEX_DIFF_EXIT=0
C09_OVERLAY_DIFF_CHECK_EXIT=0
C09_PROTECTED_DIFF_AFTER_EXIT=0
C09_BASELINE_COUNT_AFTER=26
C09_CROSSING_COUNT_AFTER=9
C09_FAILURE_COUNT=0
```

The exact zero-output Test Plan child checks were then rerun with explicit
framing:

```text
TP_BUG022_C09_EXACT_COMMAND_BEGIN
SOURCE_TEST_DIFF_CHECK_EXIT=0
PROTECTED_PATH_DIFF_EXIT=0
TP_BUG022_C09_WRAPPER_EXIT=0
TP_BUG022_C09_EXACT_COMMAND_END
```

### Syntax, Source Lock, And Test-Weakening Checks

**Claim Source:** executed

```text
BUG022_SYNTAX_CHECKS_BEGIN
SOURCE_SYNTAX_EXIT=0
TEST_SYNTAX_EXIT=0
SYNTAX_WRAPPER_EXIT=0
BUG022_SYNTAX_CHECKS_END
BUG022_FOCUSED_TEST_WEAKENING_SCAN_BEGIN
SKIP_ONLY_TODO_FIXME_GREP_EXIT=1
MOCK_INTERCEPTION_GREP_EXIT=1
WEAKENING_SCAN_WRAPPER_EXIT=0
BUG022_FOCUSED_TEST_WEAKENING_SCAN_END
```

Both grep exit-1 results are the expected no-match child outcomes. The wrapper
exited zero only after confirming both no-match results.

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
Version 1.61.1
```

The source-locked fresh clone provisioned 3 packages with browser downloads
and lifecycle scripts disabled. Its audit reported 0 vulnerabilities.

### Regression Quality And Packet Contracts

**Claim Source:** executed

| Check | Exit | Output SHA-256 | Observed result |
| --- | --- | --- | --- |
| `regression-quality-guard.sh --bugfix` | 0 | `622ad928b6e6dc2cc6989cbfafa2dcf153a1c1db8e5fa1952e0f4950b7b6d0f4` | 0 violations, 0 warnings, adversarial signal present |
| `artifact-lint.sh` | 0 | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` | Artifact lint passed; all checked rows had evidence |
| `traceability-guard.sh --all-scopes` | 0 | `aa1ca7d3a89708a736837f9c482e8b3cbe47f9b1b7c3eacb3e6f33c8ff09f5c4` | 4 scenarios, 21 test rows, 4 DoD mappings, 0 warnings |
| `scenario-test-resolve.sh --repo-root .` | 0 | `f23b21e08413b21039928cc94c625d4afcc9c775cf09a820b70e6118cc157242` | 34 references resolved by literal scan |
| `test-mechanism-lint.sh --repo-root .` | 0 | `36ffdf83fc233d8197e21b38176847355aac161f635cd8a56fba0c9fa68295f6` | 4 mechanisms coherent; mutation adapter `none` was inert |
| `scenario-obligation-lint.sh` | 0 | `3979d4214fdb7145fa4cad82986c6a605516b95479ac3ed7f6308d0a62022a0b` | 4 scenarios had a coherent derived obligation matrix |

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
[scenario-test-resolve] OK — 34 reference(s) resolved via literal-scan; 10 category comparison(s) not applicable (no test-discovery adapter declared)
[test-mechanism-lint] OK — 4 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
[scenario-obligation-lint] OK — 4 scenario(s) with a coherent derived obligation matrix
Traceability scenarios checked: 4
Traceability test rows checked: 21
Traceability DoD fidelity: 4 mapped, 0 unmapped
Artifact lint PASSED.
```

### Canonical Selftest Checkpoint And Findings

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

The optional isolated canonical selftest ran. It is not reported as green. It
ended with `3463 passed, 2 failed`, output SHA-256
`694ea949e6c329e846372a5f95724c05f3d2ed11558da21ff58619846eeee76d`.
Direct component reruns identified both failures:

**Historical Diagnostic Display Correction:** The selftest SHA-256 above
remains the historical capture hash. Only the external fixture path display in
this excerpt gains the `<fixture-root>/` prefix. The recorded selftest failure,
counts, reference sites, and exits remain unchanged.

```text
[spec-test-paths] scanned=816 references=19128 distinctPaths=270 missingPaths=71 plannedMissing=0 baseline=70 new=1 stale=0
  NEW-MISSING <fixture-root>/tests/shared-crossing-example.mjs (2 reference site(s))
      referenced at specs/_bugs/BUG-022-historical-report-declaration-leak/report.md:2616
      referenced at specs/_bugs/BUG-022-historical-report-declaration-leak/report.md:3054
[spec-test-paths] FAIL — 1 new referenced path(s) do not exist
[scope-dod-progress] packets=63 claims=86 agree=70 drift=16 unresolved=0 baseline=14 new=2 stale=0
  NEW-DRIFT BUG-017 Scope 02 certification — claims 9/0, artifact has 9/2
  NEW-DRIFT BUG-022 Scope 01 certification — claims 16/0, artifact has 22/0
[scope-dod-progress] FAIL — 2 scope progress claim(s) do not match their artifact
```

`IMPL-R4-BUG022-REPORT-FIXTURE-PATH` is addressed by the display-only
corrections above. The three active F10 fixture outputs and this historical
diagnostic now identify the disposable external fixture root. Their historical
capture hashes, `RunnerDisjointnessRefusal`, identical-byte historical control,
counts, and exits remain as recorded. The BUG-017 mismatch belongs to excluded
concurrent work. The BUG-022 mismatch and the still-`planned` Test Plan/scenario
metadata require planning and later validate-owned reconciliation. The six
independently tested rows themselves all have passing current-session evidence.

### Evidence-Helper Infrastructure Finding

**Claim Source:** executed

The installed evidence helper mishandled the exact C09 command's legitimate
zero-line output. The child exited zero, but the helper printed `lines: 0` and a
second `0`, then emitted arithmetic syntax errors at lines 201 and 213. The
direct framed rerun above independently proved both child checks and the wrapper
exit were zero. No installed framework file was changed. This external
framework drift remains an unresolved infrastructure finding rather than being
silently treated as a clean helper execution.

### Ownership And Preserved Work

This test invocation appends only this test-owned evidence and one test-owned
execution-history entry. It does not edit source, config, tests, planning,
certification, user validation, installed framework files, protected reports,
baselines, or registry declarations. It does not mark any of the six DoD rows,
change Scope 1 status, or change Test Plan/scenario planning states.

G136 human acceptance, final receipt refresh, the new-revision
SCN-BUG017-11 run, later gaps/harden/security/docs/validate/audit phases,
stale-and-clone adjudication, external framework drift, and all excluded
concurrent work retain their existing ownership and state. No final
scenario-state receipt and no TP-BUG022-C03 browser suite was run in this
invocation.

## Post-Hardening Regression Phase — Convergence Iteration 4 {#post-hardening-regression-phase-convergence-iteration-4-bug022}

**Phase:** regression
**Claim Source:** executed
**Executed At:** 2026-08-29T10:17:00Z
**Outcome:** `completed_diagnostic`
**Verdict:** `REGRESSION_FREE`

This phase supersedes no prior regression section. Earlier failed attempts and their corrected
external-fixture provenance remain unchanged. The current epoch combines detached HEAD
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619` with exactly twelve authorized current paths.
It includes the reopened BUG-022 repair, independent test evidence, planning closure, and the
validate-owned 22/0 completion mirror.

The overlay excludes every market-brief, tool-brief, probe, BUG-019, and company-intelligence
path. Post-execution object comparison matched all twelve live authorized blobs. The overlay
contained no unexpected tracked or untracked repository path.

### Exact TP-BUG022-F07 Through TP-BUG022-F10 Reruns

**Claim Source:** executed

```text
# TP-BUG022-F07
[BUG022-F07] case=bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-before-bare-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=update-after-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] case=all-sites-option-root exit=2 signal=none scanOutput=false baselineStable=true
[BUG022-F07] unknownOptionExit=2 signal=none
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

```text
# TP-BUG022-F08
[BUG022-F08] pattern=tests/shared-runner-*.mjs
[BUG022-F08] declarationCount=2
[BUG022-F08] kinds=node-test-argument,playwright-testMatch
[BUG022-F08] declaration=node-test-argument sites=1 siteKinds=node-test-argument
[BUG022-F08] declaration=playwright-testMatch sites=1 siteKinds=playwright-testMatch
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

```text
# TP-BUG022-F09
[BUG022-F09] classificationErrors=3
[BUG022-F09] errorPatterns=tests/env-wrapped-*.mjs,tests/perl-wrapped-*.mjs,tests/timeout-wrapped-*.mjs
[BUG022-F09] proseCandidateCount=0
[BUG022-F09] misc/wrapped-commands.md:3 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:4 section=none reason=unknown-artifact-role
[BUG022-F09] misc/wrapped-commands.md:5 section=none reason=unknown-artifact-role
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

```text
# TP-BUG022-F10
[BUG022-F10] activeRefusal=RunnerDisjointnessRefusal path=<fixture-root>/tests/shared-crossing-example.mjs
[BUG022-F10] historicalVerdict=pass crossings=0
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Each title ran as a separate Node invocation. F07 exercised four production CLI subprocess
permutations. Every invalid root refused with exit 2 before scan output or baseline mutation.
F08 retained two homogeneous declarations for one exact pattern. F09 found all three supported
wrappers and no prose candidate. F10 used the shared production verdict for both controls.

### Complete Shared Carrier And Production Authority

**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Complete-capture SHA-256:** `9c01aefadf91c91dd0ae337ca8bd7c4f94e8e4a892f1acec0e9eb01ae1e47813`

```text
# BUG-017 BUG-022 regression R4 complete 20-test shared functional carrier
exit: 0
lines: 81
sha256: 9c01aefadf91c91dd0ae337ca8bd7c4f94e8e4a892f1acec0e9eb01ae1e47813
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
✔ Regression: SCN-BUG022-004 missing and option-shaped root values refuse before scan or baseline write
✔ Regression: SCN-BUG022-001 preserves Node and Playwright identities for one exact pattern
✔ Regression: SCN-BUG022-002 wrapped unknown commands fail closed while prose remains inert
✔ Regression: SCN-BUG022-003 shared disjointness verdict refuses an active same-pattern crossing
ℹ tests 20
ℹ pass 20
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

**Command:** `/usr/bin/perl -e 'alarm shift @ARGV; exec @ARGV' 120 node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Complete-capture SHA-256:** `95811b00ec5c110cf85af7c8965ff9b4f7efc1565e6cb89d06df7df643a0e1bb`

```text
201 test file(s) in tests/, 10 active glob(s), 30 historical site(s), 0 classification error(s) from 10017 artifact(s), 184 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s), first playwright.config.mjs:4
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:151
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:152
glob tests/*.unit.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:162
glob tests/portfolio-*.functional.mjs [node-test-argument] declared at 2 site(s)
glob tests/portfolio-*.unit.mjs [node-test-argument] declared at 2 site(s)
classificationErrors=0
newOrphans=0
baselineEntries=26
staleBaseline=20
```

The committed disjointness title also ran separately. It reported 79 browser-selected files,
115 Node-glob-selected files, 10 direct Node suites, nine frozen crossings, zero new crossings,
and `discoveryTaxonomy=PASS`.

### Feature 008 Consumers And Canonical Selftest

| Check | Exit | Current result |
| --- | ---: | --- |
| Feature 008 direct Node consumers | 0 | 257 passed, 0 failed, 0 skipped, 0 todo; SHA-256 `a2a38a5feff9ee550985933a065f855e0540ce2d0d756fae5ff82fa4e73f66be` |
| Exact Feature 008 C03 browser consumer | 0 | 94 passed at one `system-chrome` worker with no force-kill, lifecycle suppression, or process residue; [shared BUG-017 evidence](../BUG-017-system-chrome-worker-teardown-force-kill-on-macos/report.md#post-hardening-regression-phase-convergence-iteration-4-bug017) |
| Canonical repository selftest | 0 | 3465 passed, 0 failed before report append; SHA-256 `acf3b2d3560395faa122155969f670a6b66ec8ffa42f4550b2de3612931972c2` |
| Post-report report-sensitive matrix | 0 | All eight children exited 0; SHA-256 `d41b05cba85669b87f0f9751fc3930ce2c3846830cb82effc36c164b25da452d` |
| Post-report canonical selftest | 0 | 3465 passed, 0 failed; SHA-256 `76130c3052891a948e6aea0fc3ab70663417589e11ad94b07dcc6438b9e3d1f4` |

The 94-test run used the exact config-default command. Its capture contains 313 lines at
SHA-256 `9c931f0f328b1424e88ed75715e78f4fdbe6d5e93871e0b2e0feff018883db90`.
It reports `Running 94 tests using 1 worker`, `94 passed`, child exit 0, zero force-kill and
ignored-lifecycle markers, zero root-CWD and remote-debugging process delta, and cleaned output.

### Protected Integrity, Traceability, And Coverage

**Claim Source:** executed

```text
AUTHORIZED_OVERLAY_PATH_COUNT=12
EXCLUDED_PATH_COUNT=0
PROTECTED_FEATURE008_REPORT_SHA256=8ea0e36e28aa7a409006b1db4ba0612c202cdadbd59054d7686dc31c2bf6801b
REACHABILITY_BASELINE_SHA256=dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73
REACHABILITY_BASELINE_COUNT=26
COMMAND_REGISTRY_SHA256=2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49
KNOWN_CROSSINGS_SHA256=b5ead0c8589c7a1cf699f00d2a08790d24e784a495e5f0a8f2d25f1aef79f470
KNOWN_CROSSING_COUNT=9
CLASSIFICATION_ERRORS=0
NEW_REACHABILITY_ORPHANS=0
PROTECTED_REPORT_ACTIVE_AUTHORITY=0
ACTIVE_COUNTERFACTUAL_REFUSAL=RunnerDisjointnessRefusal
HISTORICAL_COUNTERFACTUAL_CROSSINGS=0
BUG017_REPORT_PRIOR_LINE_DELETIONS=0
BUG017_REJECTED_HISTORY_PRESENT=true
BUG017_REJECTED_CANDIDATE_MARKERS=0
BUG022_PRIOR_FAILED_AND_SUPERSEDED_REGRESSION_EVIDENCE_PRESENT=true
BUG022_EXTERNAL_FIXTURE_PROVENANCE=PASS
PROTECTED_INTEGRITY_FAILURES=0
```

Every preserved F10 and active-authority receipt names its disposable leaf under
`<fixture-root>/`. The path validator therefore reports zero new missing path.
The prior failed and superseded regression sections retain their headings and capture hashes.

```text
COVERAGE_HEAD_REVISION=d0c09a3ec90d2bb72920caee9e44f1d5f697c619
FUNCTIONAL_TEST_DECLARATIONS=16->20
FUNCTIONAL_ASSERT_CALLS=128->156
DIFF_ADDED_TEST_DECLARATIONS=4
DIFF_DELETED_TEST_DECLARATIONS=0
DIFF_ADDED_ASSERTION_LINES=28
DIFF_DELETED_ASSERTION_LINES=0
REQUIRED_NEW_TITLES=4
REQUIRED_NEW_TITLES_PRESENT=4
SKIP_ONLY_TODO_MARKERS=0
TODO_FIXME_HACK_STUB_MARKERS=0
COVERAGE_REGRESSION_FAILURES=0
```

The explicit marker and interception scans found no matches. Each grep child exited 1, and the
enclosing weakening scan exited 0. Regression quality reported zero violations and zero warnings.

The protected governance matrix executed 16 children. Spec-test paths, 22/0 scope progress,
regression quality, linked-test resolution, traceability, scenario obligations, test mechanisms,
both artifact lints, and all three syntax checks exited 0. The complete matrix has 344 lines at
SHA-256 `823b0e6be34d9a87b6a5af1d7fce2b1ecff0f9a7372050e67d9f6906c148a174`.

### Cross-Spec And Design Coherence

**Claim Source:** interpreted
**Interpretation:** The changed symbols have three active consumers. The production validator,
the shared functional carrier, and repository selftest consume declaration classification.
Feature 008 consumes the preserved runner boundary through its direct Node and browser suites.

The tracked spec reference scan found BUG-017, BUG-022, and Feature 008 as the current contract
owners. Other matches occur in historical reports or independent command records. Current tests
executed every active affected consumer named above.

BUG-022's closed authority model requires `(kind, pattern)` identity, anchored wrappers,
fail-loud root parsing, and one shared disjointness verdict. The current implementation and all
four exact tests preserve those decisions. BUG-017's one-worker containment remains compatible
with Feature 008's system-Chrome test plan. No route, data-model, UI-flow, or deployment conflict
was found.

### Preserved Boundaries And Verdict

This phase created no final scenario receipt. It did not edit source, config, tests, planning,
certification, user validation, framework files, baselines, ratchets, or protected Feature 008
evidence.

The human G136 boundaries remain unchanged. Final stable-revision receipts for every active
scenario remain reserved for one later checkpoint. Later simplify, gaps, harden, security,
validate, and audit phases remain independently owned. Global stale-and-clone adjudication stays
append-only. The external framework drift and zero-line evidence-helper finding remain external.

```text
🟢 REGRESSION_FREE
Protected functional baseline: 20/20 -> 20/20
Feature 008 direct Node: 257/257 -> 257/257
Feature 008 browser C03: 94/94 -> 94/94
Canonical selftest: 3465/3465 -> 3465/3465
Cross-spec conflicts: 0
Design contradictions: 0
Coverage: 16 -> 20 tests; 128 -> 156 assertion calls
Gherkin traceability: BUG-017 and BUG-022 both exit 0
New reachability orphans: 0
Protected integrity failures: 0
```

## Post-Hardening Simplify Phase — Convergence Iteration 4 {#post-hardening-simplify-phase-convergence-iteration-4-bug022}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** One shared-carrier test used test-local selection logic before invoking the
shared production disjointness verdict. The final test uses the production verdict's
`browserSelected` and `nodeSelected` sets for every downstream assertion.
**Executed At:** 2026-08-29T10:34:08Z
**Outcome:** `route_required`

### Superseding Review

This section supersedes the earlier simplify assessment for the reopened repair only.
The prior root-scan simplification and every earlier receipt remain unchanged.

| Pass | Current result |
| --- | --- |
| Reuse | The committed disjointness test now consumes the shared production verdict's selected sets. |
| Quality | The unused `crossings` destructure is gone. Every existing assertion remains. |
| Efficiency | The test removes one browser and one Node matcher compilation and selection pass. |

The test object changed from `520a6a71b398a221c3f55c884b8591b680a05da1` to
`d7bcf636103992a90b08d0b46f76c1838a55c42a`. Its SHA-256 is
`aa816fd68f730668e706d41cb3052fd4bbe19081496cdfc8427b4eaae151b526`.
The exact delta contains 11 added and 11 removed lines.

No production reduction is safe in the reopened parser. `ReachabilityUsageError` and
`parseReachabilityArguments()` preserve refusal before scanning. `declarationIdentity()` keeps
runner kind in the identity. `parseNodeTestCommandCandidate()` preserves anchored wrappers and
inert prose. `RunnerDisjointnessRefusal` preserves typed crossing details. F07 through F10 test
those separate contracts and are not duplicates.

### Exact Affected Regression

**Command:** `node --test --test-name-pattern='^committed discovery boundary keeps browser specs and direct Node suites disjoint$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=79
[playwright-runtime] nodeGlobSelected=115
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=9
[playwright-runtime] newCrossings=0
[playwright-runtime] discoveryTaxonomy=PASS
✔ committed discovery boundary keeps browser specs and direct Node suites disjoint (1486.101375ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1722.933667
```

### Contract And Carrier Verification

| Check | Exit | Current signal |
| --- | ---: | --- |
| TP-BUG022-F07 | 0 | Four invalid-root permutations refused at child exit 2 before scan output or baseline mutation. |
| TP-BUG022-F08 | 0 | One pattern produced two homogeneous declarations with distinct runner kinds. |
| TP-BUG022-F09 | 0 | Three supported wrappers classified as errors in an unknown artifact. Prose candidates remained zero. |
| TP-BUG022-F10 | 0 | The active control threw `RunnerDisjointnessRefusal`. The historical control returned pass with zero crossings. |
| Complete shared functional carrier | 0 | 20 passed with zero failures, skips, or todos. Complete-capture SHA-256 `9467954b474292f17eeb08d9aaabb624edf08c3a0fb7cb673952db26e38ff01f`. |
| Production reachability | 0 | Zero classification errors and zero new orphans. Complete-capture SHA-256 `95811b00ec5c110cf85af7c8965ff9b4f7efc1565e6cb89d06df7df643a0e1bb`. |
| Regression quality | 0 | Zero violations and zero warnings. The adversarial signal remained present. |
| Both packet artifact lints | 0 | Complete-capture SHA-256 `bec5645058bb65a0e938b181590c8cb811536c54163997855fa2dc6580f7c446`. |
| Both packet traceability guards | 0 | Complete-capture SHA-256 `04f6291fb023b50a227dc8d6b42c436c9823c66c6e82828658ed75569e8a9f2b`. |
| Canonical selftest before this report append | 0 | 3465 passed and zero failed. Complete-capture SHA-256 `0053ec80f5822af6eef982275ca74ab813b4d24ed8e1a799610be7cc7c976bcc`. |
| Deterministic ratio controls | 0 | 3.000 remained accepted, 3.001 remained refused, and owned temporary residue remained zero. |

The production parser remains object `805d78d3719db0c0c438989df3eb13b7242cc7a9`.
The ratio helper remains object `1fac6a8b7a783fd2c416c9449658296045a12611`.
The command registry, Playwright configuration, baseline, crossing ratchet, and protected Feature
008 report remain unchanged. No final receipt chain was executed. Status and certification remain
`in_progress`. The next required owner is `bubbles.gaps`.

## Independent Test Verification — Reopened Scope 1 Latest Nine Rows {#independent-test-verification-reopened-scope-1-latest-nine-rows}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Eight of the nine requested rows passed their exact current
commands in one isolated authorized overlay. TP-BUG022-R4-C19 executed and
remained nonzero, so this section does not claim all-nine closure.
**Outcome:** `route_required`

The exact repository packet for `research-lab`, decision
`rb:vscode-004aa4f6bc5dacec42ad4d9f2afe0015:10`, control revision 10, passed
`repository-binding.sh validate-packet` before the first repository-local read.
The execution overlay started at detached HEAD
`d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. It contained only the current
BUG-017 and BUG-022 shared source, test, planning, state, and report changes.
Market-brief, tool-brief, probe, detached BUG-022 scratch, and
company-intelligence worktree deltas did not enter the overlay.

### Per-Row Verdicts

| Row | Exit | Verdict | Full-output SHA-256 |
| --- | ---: | --- | --- |
| `DOD-TP-BUG022-R4-F11` | 0 | PASS: three presentation candidates failed closed at lines 5, 6, and 8; prose remained inert | `8518c47065b2f951df2b22b8dc65c0a51f06137d7fb356904a5be96fc2350bf9` |
| `DOD-TP-BUG022-R4-F12` | 0 | PASS: both option orders retained the same glob and provenance; malformed quoting failed closed | `02a3187a64f581762d46824eae3b6b962f3955427241773ee6ffbd397182dded` |
| `DOD-TP-BUG022-R4-F13` | 0 | PASS: both invalid writes exited 1 with identical before/after hashes; valid shrink exited 0 and normal rerun exited 0 | `dc410439670fa38a134d4302cfd4cc6079764dce255be940004a4dad4ce5aaf5` |
| `DOD-TP-BUG022-R4-F14` | 0 | PASS: dynamic, static, and require registrations remained test-bearing; only the true helper was exempt | `eb69c523485c8668092fc81baf5b3c8d8ba3b4b3f9eac235d91395c222a4003b` |
| `DOD-TP-BUG022-R4-C15` | 0 | PASS: 26 passed, 0 failed, 0 skipped, 0 todo | `fabc12ffdf19a870fae53474537e32a6c529615a50af95930b071605d665d6ca` |
| `DOD-TP-BUG022-R4-C16` | 0 | PASS only for the isolated authorized overlay: 201 files, 10 globs, 0 classification errors, 0 new orphans, 26 baseline entries unchanged | `7b3875d0f20293479ba916783770a612e369ac46037889239eb07b32f7f270cb` |
| `DOD-TP-BUG022-R4-C17` | 0 | PASS: direct Node 257/257 and exact browser 94/94 at one worker; zero owned residue and clean output removal | Node `9de0856f1ec5b50b6f9e87be4982255ec05ef9ddcf81ccc8bc479f2a13383847`; browser `9369a35796851f8d2bef40d946b5f11f2e4a4a250c0e564178d81d4bc850d023` |
| `DOD-TP-BUG022-R4-C18` | 0 | PASS: rollback and repaired source/test objects matched; protected and excluded snapshots stayed stable; mutation residue was false | `a169112af78acbd1290ab854e87e12e0bfe7650129156530f1e6cfa5c8379728` |
| `DOD-TP-BUG022-R4-C19` | 1 | FAIL: canonical selftest reported 3463 passed and 2 failed | `5c594ba1fee710c009297cbc9a36b1f14334d9b84e2ac533848d47f7f0b11d70` |

The C17 process harness first passed the wildcard as a literal child argument.
That attempt exited 1 with `No tests found`, SHA-256
`a46a54a538ffc0d623d6e90a8a4f6bbb469a908a8a9a995fe837afea2a6ef918`.
It cleaned its output and is retained as a failed harness attempt, not a test
pass. The succeeding harness invoked the exact planned command through zsh so
the wildcard expanded before Playwright received its file arguments.

### Focused Rows F11 Through F14

**Commands:** The exact four `node --test --test-name-pattern=...` commands in
the current Test Plan were executed separately.
**Exit Codes:** 0, 0, 0, 0
**Claim Source:** executed

```text
[BUG022-F11] classificationErrors=3
[BUG022-F11] errorLines=5,6,8
[BUG022-F11] proseCandidate=false
✔ Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed
[BUG022-F12] declarationPresent=true
[BUG022-F12] siteCount=2
[BUG022-F12] lines=7,8
[BUG022-F12] malformedFailClosed=true
✔ Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable
[BUG022-F13] case=new-orphan exit=1 signal=none
[BUG022-F13] case=new-orphan bytesStable=true
[BUG022-F13] case=vacuous exit=1 signal=none
[BUG022-F13] case=vacuous bytesStable=true
[BUG022-F13] case=valid-shrink updateExit=0
[BUG022-F13] case=valid-shrink normalExit=0
[BUG022-F13] case=valid-shrink normalRunBytesStable=true
✔ Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write
[BUG022-F14] orphanNew=true
[BUG022-F14] orphanExempt=false
[BUG022-F14] reachable=true
[BUG022-F14] reachableExempt=false
[BUG022-F14] trueHelperExempt=true
✔ Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing
```

### C15 Shared Carrier And C16 Isolated Reachability

**C15 Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**C15 Exit Code:** 0
**C16 Command:** `node scripts/validate-test-file-reachability.mjs`
**C16 Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression: SCN-BUG022-005 table cells and Command labels on unknown artifacts fail closed
✔ Regression: SCN-BUG022-006 quoted Node options before a test glob remain extractable
✔ Regression: SCN-BUG022-007 baseline update refuses vacuity and new orphan absorption before write
✔ Regression: SCN-BUG022-008 dynamic node:test imports remain test-bearing
✔ Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects
ℹ tests 26
ℹ pass 26
ℹ fail 0
ℹ skipped 0
ℹ todo 0
201 test file(s) in tests/, 10 active glob(s), 37 historical site(s), 0 classification error(s) from 10017 artifact(s), 184 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
```

The production reachability statement is limited to the isolated authorized
overlay. No green claim is made for the concurrently dirty live tree.

### C17 Feature 008 Consumers

**Node Command:** `node --test tests/portfolio-*.unit.mjs tests/portfolio-*.functional.mjs`
**Node Exit Code:** 0
**Browser Command:** `npx --no-install playwright test tests/portfolio-survival-*.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Browser Exit Code:** 0
**Claim Source:** executed

```text
ℹ tests 257
ℹ pass 257
ℹ fail 0
ℹ skipped 0
ℹ todo 0
BUG022_C17_PROCESS_PROOF_BEGIN
CONFIG_WORKERS=1
PROCESS_BEFORE relevant=0
Running 94 tests using 1 worker
94 passed (1.4m)
PLAYWRIGHT_EXIT=0 signal=none
PROCESS_OWNERSHIP trackedPids=321 samples=840 maxOwned=12 ownedResidue=0
PROCESS_AFTER relevant=0
OUTPUT_PRE_CLEAN repositoryCreated=1 externalCreated=false
LAST_RUN={ "status": "passed", "failedTests": [] }
OUTPUT_CLEANUP finalRepository=0 externalExists=false clean=true
RUN_RECEIPT accepted=true expectedTests=94 configuredWorkers=1
BUG022_C17_PROCESS_PROOF_END
```

### C18 Atomic Rollback And Current-Object Restoration

**Command:** `node --test --test-name-pattern='^Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects$' tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[BUG022-C18] rollbackSource=805d78d3719db0c0c438989df3eb13b7242cc7a9
[BUG022-C18] rollbackTest=79c9226484db386c9134b6cd4267e082e8ec179e
[BUG022-C18] repairedSource=7b08225e2619ae768db1a63c61d8a30c9c233862
[BUG022-C18] repairedTest=2133b5bf608b252ae8ec5f1f7f12ec95d8bf9e3a
[BUG022-C18] protectedObjects=3
[BUG022-C18] excludedSnapshotEntries=8
[BUG022-C18] excludedObjectsStable=true
[BUG022-C18] mutationResidue=false
✔ Regression: SCN-BUG022-007 atomic repair rollback preserves source test and ratchet objects
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

### C19 Canonical Selftest — Truthful Nonzero Result

**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline; planned-not-authored paths remain visible non-failing debt
✗ FAIL: no scope progress claim disagrees with its Definition of Done outside the frozen baseline
================================================
Research-Lab self-test: 3463 passed, 2 failed
================================================
[spec-test-paths] scanned=816 references=19199 distinctPaths=270 missingPaths=71 plannedMissing=0 baseline=70 new=1 stale=0
SPEC_TEST_PATHS_EXIT=1
[scope-dod-progress] packets=63 claims=86 agree=69 drift=17 unresolved=0 baseline=14 new=3 stale=0
SCOPE_DOD_PROGRESS_EXIT=1
COMPONENT_FAILURES=2
```

After the F10 evidence-byte correction, the path component had one new missing
reference: the explicitly excluded probe path named in current Scope 1. The
scope-progress component had three current state/artifact mismatches: BUG-017
Scopes 1 and 4, and BUG-022 Scope 1 at certification 22/0 versus artifact 22/9.
No state, planning, certification, acceptance, or excluded file was changed to
make this command green.

### Governance And Integrity Checkpoints

| Check | Exit | Full-output SHA-256 |
| --- | ---: | --- |
| Node source lock | 0 | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Artifact lint | 0 | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| Traceability | 0 | `c43d6f3698720d560b585be20f1275193b0d2da89fb0fb9c04ab0b0ec2f05667` |
| Linked-test resolution | 0 | `8cce09f63d3cb99c2b26986d50c623262c4eb0eb4a9c0cf720e3150120cf496b` |
| Test-mechanism lint | 0 | `0c3a6fdd70a1c05d82c936f49315b529d53948c78114dbc650d0bff03280ac35` |
| Scenario-obligation lint | 0 | `24692f2dfaad2ae31acf5e87aeca84a60c2bd2201fcba9e3fe421856479dc9db` |
| Regression-quality guard | 0 | `ad7aa2794b7bd5ffa77f7360e3c29347e8a2791de99fdf61b227aa3816f10d05` |
| Execution-substate guard | 1 | `a80a258d23f7f590772b1a4c63a09a79ba9c70126b461471db6e6ded662605c4` |
| Transition guard with modern Bash | 1 | `c9fde8bc1a7878b1bb19cb3a961a34330ca439ddc1f3928bc508cd7418fb86b2` |
| Transition guard with stock macOS Bash | 0 after syntax abort | `1a7066519bbcb7632c8455268b0212c4734346bd105d3961e8be324a9ac52e6c` |

The modern-Bash transition result failed G022, G027, and G136 with
`DELIVERY_COMPLETION_FAILED`. The stock-Bash execution stopped at line 4016 on
an unexpected `(` but returned zero. That zero is an upstream framework defect,
not a passing transition. G136 acceptance, the phase chain, state substate and
narrative, stale-and-clone adjudication, and upstream framework findings remain
unchanged.

The nine DoD rows remain unchecked. Scope status, top-level status,
certification, user validation, source, tests, planning, and protected history
remain unchanged. The report edit intentionally invalidates prior final-stable
scenario receipts and keeps receipt state `refresh-required` for
`bubbles.plan`.

## Current Authority Supersession — Convergence Iteration 4 Six-Row Closure {#current-authority-supersession-convergence-iteration-4-six-row-closure}

**Phase:** validate
**Claim Source:** executed

This section supersedes only the earlier current-status sentence, “The nine DoD rows remain
unchecked.” That sentence and every preceding report byte remain preserved as historical evidence.
Scope 1 is now artifact-complete at 37 checked and 0 unchecked. Independent structured receipts
for F20, F21, F22, C23, C24, and C25 exit 0 at tool-log lines 1620, 1621, 1622, 1623, 1627, and
1624. The F20 valid-update control also exits 0 at line 1625. Their input closures match source
SHA-256 `60aaec8745d728c3044c7f19f518b739911f17dd4a7f85fd6caf19b46826efef` and test SHA-256
`dd8d8f209781a2b9b8612f24e2a94708f01a564c990e7764a63611168a3cf036`.

Lifecycle status remains `in_progress`. Final-revision scenario receipts for BUG-017 and BUG-022,
the fresh gaps, harden, stabilize, devops, security, validate, and audit chain, both G136 boundaries,
stale and clone evidence adjudication, upstream framework findings, and concurrent work remain open.
This section makes no pass claim for any open condition and adds no phase or scenario certification.

## Final Post-Change Coupled Regression — Convergence Iteration 4 {#final-post-change-coupled-regression-convergence-iteration-4-bug022}

**Phase:** regression
**Claim Source:** executed
**Executed At:** 2026-08-30T03:09:03Z
**Outcome:** `completed_diagnostic`
**Verdict:** `REGRESSION_FREE`

This execution re-derived the coupled BUG-017 and BUG-022 baseline in a fresh detached checkout
at `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`. Fourteen current paths were overlaid from the
live checkout. The overlay contained zero market, tool-brief, focusability-probe, BUG-019, or
company-intelligence dirty paths. A pre-append comparison matched all fourteen live inputs and
reported zero staged paths, zero owned process residue, zero owned temporary residue, and zero
repository-output residue. Its capture exited 0 with SHA-256
`9eff9ad87b4c6ca0a2d10c60adfc41c2fca0f1b51d7c7a990509d4183020a646`.

### Baseline And Current Results

| Surface | Current result | Exit | Complete-output SHA-256 |
| --- | --- | ---: | --- |
| Node source lock | Exact Playwright `1.61.1`; 16 adversarial source-lock cases rejected | 0 | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Complete authority carrier | 34 passed; 0 failed, cancelled, skipped, or todo | 0 | `64684e925c908bf495bc9274ed2edf04085133f5b9a926f9182637808ee9e3cb` |
| F26 | Backticked unordered-list command produced one provenance-bearing fail-closed error | 0 | `573f9959e2d0f8e7f4493bc8988630dd872ffe9bbe0fe79278bb9579293a1c1a` |
| F27 | Backticked ordered-list command produced one provenance-bearing fail-closed error | 0 | `8c9835b5c9e61bfea3ff845efbb72115b7896d5e1497263af182675c43f78ac3` |
| F28 | `/opt/local/bin/gtimeout` command produced one provenance-bearing fail-closed error | 0 | `a8bc716609cb2247a58ea4de3078fadfc547eb49c92b4d1506bbaf44db18a2b6` |
| C31 | Exact reverse/reapply objects, four protected objects, nine ratchets, no residue | 0 | `ffa0e00e4a5172636e78c9bfe74f15dc2e6f86477245e0dec9e67088fa371bf5` |
| C25 compatibility | Prior reverse/reapply contract retained nine ratchets and no residue | 0 | `e66026e86d0495d2ac20a94a625731e0ae50de00bb7c8464a1231d8de6690891` |
| C31 mutation sensitivity | One isolated expected-object mutation made C31 fail exactly once; primary bytes stayed stable | 0 wrapper, 1 mutant | `f28646b2d13f545ee65de8d59c3689b7e9d7cd9795f2634b3bc0c67fdda928a6` |
| Production reachability | 201 test files, 10 active globs, 40 historical sites, 0 classification errors, 0 new orphans | 0 | `774f4adea6d250ccf1fdf6a3a39d0c5f50feb50b814fbc6e63b02fa08e0e3249` |
| Reachability ratchets | Non-vacuous; baseline 26; crossings 9; 0 new or stale crossings | 0 | `3332362ba43aacb33111c801f8f84c785bf2df8ac07faa5fea7ffb7270745104` |
| Feature 008 direct Node family | 257 passed; 0 failed, cancelled, skipped, or todo | 0 | `2fdf131a4392df9479ae3f882b71cafc459460b82dadf51a6edceb530d3a2414` |
| Feature 008 browser C03 | 94 passed with config-default one worker, `system-chrome`, channel `chrome` | 0 | `16039b082a476b70c871220bb581a71e16f753722fcfb5de22d2c891a0a6d72c` |
| Deterministic ratio boundary | `3.000` accepted; `3.001` rejected; no owned temp delta | 0 wrapper | `369b92f68d290ad6da1b4277e4ee70cfea37cac4bc3f16eb9b507f12b11d8ffc` |
| Live like-for-like ratio | Bundled Chromium `90951.057ms`; system Chrome `100033.024ms`; ratio `1.100` | 0 | `3bb6cd8eb6958513af0e2f597c3961f518c60179b884a27ac5ea28959c641e69` |
| Canonical repository selftest | 3465 passed; 0 failed | 0 | `5718979f3769efeeebd2a0d8925cb6b8702f102614132294f0ed651859607dcc` |
| Governance matrix | Both artifact lints, traceability, linked tests, scenario obligations, test mechanisms, regression quality, scope parity, and substates passed | 0 | `267c76d97329078647d9d8c9c586027d449ada4a1c2c41f5614ca309dafc676e` |
| Goal fidelity | Both pre-certification goal-fidelity boundaries passed | 0 | `02eeb2f6b059c95696c76de3c4f67dfd3093e25b21790acd475044153ea1df9f` |
| Completion and history | BUG-017 `3/0,11/0,8/0,6/0`; BUG-022 `43/0`; all mirrors agree | 0 | `4254c5ed87f21386de608c975c1eb1ea91ba29db9d6f103fcc227c729141c858` |
| Changed-path and coverage delta | Exactly 14 paths, zero staged or unexpected; tests `16→34`; assertions `128→336`; zero weakened assertions | 0 | `c82eece6e36ee10f95d038c29db684f84beeea5b340a1c3ef899e8f3e8d8cc3b` |
| Cross-spec design coherence | Active consumers inventoried; one-worker and authority contracts agree; no route, table, fetch, or deploy surface changed | 0 | `333aa2ed0341757458df79df48f1f34d9ff617b3f51b4c1d8edf3f0218d68040` |

The browser ownership probe sampled 786 times, observed 319 workload-descendant PIDs with a
maximum of 11 concurrent owned processes, and found zero surviving tracked PIDs. It found zero
post-run checkout-owned browser processes, zero remote-debugging Chrome residue, zero force-kill
or ignored-lifecycle markers, and zero skip, todo, fixme, or only annotations. The generated
test-results directory carried `status=passed` with zero failed tests and was removed. No external
output residue remained.

The live ratio is a performance observation over the same 22 files and 111 tests at one worker
on the same machine. It satisfies the declared maximum. It does not establish that an upstream,
transport, socket, browser, or process mechanism was removed.

### Cross-Spec And Historical Authority

**Claim Source:** interpreted
**Interpretation:** The executed consumer inventory found the reachability validator referenced
by Feature 008, Feature 015, and bug packets; the ratio helper only by bug packets; and the shared
carrier by Features 004, 005, 010, 027, and bug packets. The full carrier, production reachability,
Feature 008 direct Node family, exact browser consumer, live ratio workload, and canonical selftest
exercise the changed closure. BUG-017, BUG-022, and Feature 008 designs agree on one worker,
system Chrome, historical non-authority, real-page browser execution, and the shared typed
disjointness decision. No conflicting route, data model, UI flow, or deployment change was found.

`SCN-BUG017-04`, `SCN-BUG017-05`, `SCN-BUG017-09`, and `SCN-BUG017-10` are absent from active
scenario authority. Each remains present in the historical test-plan record, quoted historical
scope material, and report evidence. The history check counted 32 preserved non-zero receipt
signals and 156 historical markers across both reports. This section does not relabel any of them
as current success.

### Non-Qualifying Harness Diagnostics

The final verdict excludes every harness-only failure below. Each was corrected without changing
repository source, tests, planning, certification, or historical evidence.

| Diagnostic | Exit | Capture SHA-256 | Disposition |
| --- | ---: | --- | --- |
| First C31 mutation harness | 1 | `ed3c6e32f82602278bd5d913cdd39e35266dfc2cbcee76e9b64567d6eba3c62e` | Mutation anchor did not land; no mutation-sensitivity claim |
| First browser ownership harness | 1 | `25a3194b04a20b882bf357ab50bae314706d58f4c91cd3c852ac4b7974296b8b` | Playwright passed 94; harness failed to parse leading whitespace |
| Second browser ownership harness | 1 | `fe79c83cd5119e3394accaaf46aa0663f08c20a0ce145b4c1092b674740974f7` | Playwright passed 94; annotation detector matched ordinary title text |
| Draft governance matrix | 4 | `b24cf46a013d7e1ca069719bd3c47cae97d968d9b3a074e67f9aa39d55400ea9` | Two guessed script names and two incomplete goal invocations; corrected matrix passed |
| Draft completion counter | 1 | `893a1e9424fa184e0840559f97562f1617903b11197cc0ec19b520acd703d40e` | Ad hoc section bounds counted historical rows; canonical parser passed |
| Draft containment comparator | 1 | `c7dcb983f94eaa0d1e282c8427156c08859e6ae5efb2a2e3dcc4461ccaad494d` | Three moved assertions were initially treated as deletions; exact equivalents were present |
| Draft cross-spec heuristic | 1 | `7b2bb9663b9c44bb46f8810a34fac37e2fb82c820553fb931c72fb289b417709` | Heuristic expected identity prose absent from the design; exact design hardening passed |

The failed shell containment draft entered a quote-continuation state and was terminated. It
produced no qualifying capture and changed no repository file. The corrected external comparator
is the containment evidence above.

Packet and certification statuses remain `in_progress`. No certification status, certified
phase, human-acceptance field, source, test, planning, framework file, baseline, ratchet, or
historical receipt was changed by regression.

<!-- BUG022-INDEPENDENT-F32-C41-BEGIN -->
## Independent Test Owner Verification — F32–F36 And C37–C41

**Phase:** test
**Scope:** `01-separate-active-declarations-from-historical-receipts`
**Claim Source:** executed

This section records only commands executed by the registered independent test owner in the
current convergence-4 session. It does not adopt an implementation-owner pass as independent
proof. The ten row commands ran against source object
`8880edabee2d26ba567a10f2eca40c71fc398950` and carrier object
`ff74ad589621ee6980eb6a42795c4210bdfde769` unless the row explicitly names the isolated C38
overlay.

### Persistent Contract Inspection

The current carrier and structured plan audit found 42 top-level test declarations. Each of the
eight security-era persistent titles, F32–F36 and C39–C41, occurred exactly once. Each of the ten
F32–F36/C37–C41 structured commands occurred in exactly one matching Test Plan object. The
security blocks contained zero disabled-test calls and zero bare early returns. The canonical
bugfix regression-quality guard reported zero violations and zero warnings.

- Static title, command, and escape audit: tool-log line 1949, exit 0, stdout SHA-256
  `ad4e5e70036ff1695c923583937c8c3bc28f89ba3d4a997db0beaf583ab49550`.
- Canonical regression-quality guard plus token-bounded disabled-marker scan: tool-log line 1970,
  exit 0, stdout SHA-256
  `50ef34e602a1d699a2e8c37fd1db94b4ce7fb240523f092d284eb2e22a592143`; capture SHA-256
  `4c153d539b9e32e170c89a3a10a06b1f2a63df3b3fc9801617515d4942a773b8`.

### Historical RED Provenance Audit

**Claim Source:** interpreted
**Interpretation:** The independent audit parsed the canonical tool log and the retained raw
terminal records. It did not rerun or relabel the historical RED commands as independent test
execution. The ordered records show the persistent tests authored before the five RED commands,
all production-source patches after the final RED, no test patch during the repair, and the same
five persistent command identities passing afterward. The retained RED output directly names the
intended failing contract and reports zero skipped and todo tests. F32 also records both outside
sentinels changing before repair. F33 records both outside paths admitted without refusal. F34
records one error instead of six and an absent execution canary. F35 records zero errors instead
of four. F36 records the real dynamic import as exempt and the execution canary absent.

| Row | RED receipt | GREEN receipt | RED behavior capture SHA-256 | Provenance verdict |
| --- | --- | --- | --- | --- |
| F32 | line 1887, `2026-08-30T05:46:09Z`, exit 1 | line 1893, `2026-08-30T05:50:53Z`, exit 0 | `81d89ba528e1334f0c40fdde91687684cbd4cd552d599da5846bd07d81fbc544` | Same persistent command; intended baseline-leaf and scripts-parent mutation failure |
| F33 | line 1888, `2026-08-30T05:46:25Z`, exit 1 | line 1894, `2026-08-30T05:50:58Z`, exit 0 | `eca96ce81ab961eb11c2dec99b86dcdb6201e0eb5bc3fe7abf333ec4f1febf0d` | Same persistent command; intended outside-root admission failure |
| F34 | line 1889, `2026-08-30T05:46:29Z`, exit 1 | line 1895, `2026-08-30T05:51:08Z`, exit 0 | `35e627385a5e49801ad9728267db7db730a6f8f4c3c640f30a6286e6d2bcf33f` | Same persistent command; intended incomplete fail-closed classification |
| F35 | line 1890, `2026-08-30T05:46:42Z`, exit 1 | line 1896, `2026-08-30T05:51:17Z`, exit 0 | `7ab91d4edf39f1015fb2dd554449587d27037432d0c233b513862fc2645b28de` | Same persistent command; intended changed-directory authority acceptance |
| F36 | line 1892, `2026-08-30T05:46:59Z`, exit 1 | line 1897, `2026-08-30T05:51:25Z`, exit 0 | `3b4e5ea1c27e6aac636f31ba47bfe0d9fdf5a5f07d0120a833e9004c6c9699e2` | Same persistent command; intended dynamic-import false exemption |

The independent provenance parser itself is tool-log line 1967, exit 0, stdout SHA-256
`90a691bdeb2fbf6a82f200b45c346ebc7d480f89abf36b9362a581ed0f048702`; capture SHA-256
`b7bc11d562aaf4965993cfd41ab70e42aa85b8e406fab113b44d8453c33564db`.

### One-To-One Current Row Results

| Row | Exact executed command | Exit | Capture SHA-256 | Behavior-specific result |
| --- | --- | ---: | --- | --- |
| F32 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 baseline symlink escapes refuse before mutation$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `1c2f5f66e4faccf44bdacf21d658728c02babc25c5f08a56af0b927be2642a9b` | Leaf `RCH-FS-001`, parent `RCH-FS-002`, both sentinels stable, regular control exit 0 |
| F33 | `node --test --test-name-pattern='^Regression: SCN-BUG022-004 symlinked test discovery refuses outside-root admission$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `dee910888cb7a15ffd87cde0439ac4a96fcb34eec67059e5927e869eda6b0fe1` | Tests root `RCH-FS-003`, escaped entry `RCH-FS-004`, physical-path provenance present, regular control exit 0 |
| F34 | `node --test --test-name-pattern='^Regression: SCN-BUG022-002 ambiguous command forms fail closed without execution$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `9dbb8de6576bf2c2385cfd75ce6d18e7a65f54b644fb4c6ba399ec5510238145` | Six exact provenance-bearing classification errors, six supported controls, execution canary absent |
| F35 | `node --test --test-name-pattern='^Regression: SCN-BUG022-006 env chdir forms cannot change declaration authority$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `88a4e200c0c7083583df3a19737a6a830298ad0f89f709cb88d5d0011f3d53c8` | Four working-directory forms refused; three non-directory-changing controls retained |
| F36 | `node --test --test-name-pattern='^Regression: SCN-BUG022-008 comment-separated dynamic node:test imports remain test-bearing$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `fc23cbda3142acfb01aed9445be2ca75519f52f91570e51746eaa4c654d504a2` | Dynamic import orphanable and not exempt; four lookalikes exempt; execution canary absent |
| C37 | `node --test tests/playwright-runtime.foundation.functional.mjs` | 0 | `557482e5fb174c64cd515622124bab93ee0c11410d71a2149ce02964fd7078dd` | 42 tests, 42 passed, 0 failed, cancelled, skipped, or todo |
| C38 | `node scripts/validate-test-file-reachability.mjs` inside the authorized overlay recorded at tool-log line 1966 | 0 | `300a35da3884f7980dd077766a53f1130686b11a0999f5e6352b65e8f5a0578b` | Non-vacuous production CLI; 0 classification errors, 0 new orphans, unchanged baseline and crossing ratchets |
| C39 | `node --test --test-name-pattern='^Regression: BUG-022 security authority matrix closes all five findings together$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `6f490b939d9095e36700d8e24592c379e3a5e15bc82bee4acb4ae9e5e4d0ad74` | Five distinct verdicts true, five independent controls true, execution canary absent |
| C40 | `node --test --test-name-pattern='^Regression: SCN-BUG022-007 security repair rollback preserves source test ratchets and sentinels$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `372f0c98a85d57d1296c24fc0727884cac141d5304e8fc79b17bc0b1903a3fe8` | Exact reverse and forward source/test objects; four object mutants RED; nine-entry ratchet unchanged; excluded bytes stable |
| C41 | `node --test --test-name-pattern='^Regression: BUG-022 security repair contains exactly the validator and focused carrier$' tests/playwright-runtime.foundation.functional.mjs` | 0 | `7e4290ec6fe529de5358535b4851c04d94d69f1f6b6a23137e1369ddf343371f` | Exactly two implementation paths; all 12 protected-family mutants RED; 0 unexpected/staged paths or residue |

The structured current receipts are tool-log lines 1952–1961. C40's immediate independent
post-run scan is line 1959, exit 0, with zero fixture and process residue. C38's accepted receipt
is line 1966, exit 0, stdout SHA-256
`42d0f4a9b3107729fd23031959c76bf39b9ea24287f97cf492cad9c0d95e8d5c`.

### C38 Authorized Overlay

The accepted C38 overlay was based on HEAD `d0c09a3ec90d2bb72920caee9e44f1d5f697c619` plus exactly
14 current BUG-017/BUG-022 convergence paths. The two behavior paths were the reachability
validator and focused carrier. Market, tool-brief, focusability-probe, company-intelligence,
BUG-019, and detached-worktree changes were not admitted as overlay changes or executed as BUG-022
evidence.

The production result reported 201 test files, 10 active globs, 9 Node globs, 1 Playwright
matcher, 184 reachable files, 0 classification errors, and 0 new orphans. The baseline remained
26 entries with file SHA-256
`dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73` and set SHA-256
`c847133ed970a5f9508fb1abee6780bedc21296877e5ba338de914a68f28b56a`. The crossing ratchet
remained 9 entries with SHA-256
`97b06d69945f0b3cba3a9ceca33bf11c122ff3072775d1989bc37fb61cf4f950`, with 0 new and 0
stale crossings. The registry remained SHA-256
`2ad6e60ee916ff8ec4d7d68bb1ef4a62996c296095a62332e3f23d3ba9a9bd49`. Fixture and process
residue were both zero.

### Focused Governance Results

The post-execution matrix ran artifact lint, whole-packet traceability, linked-test resolution,
and test-mechanism lint. All four commands exited 0. Traceability checked 8 scenarios and 52 test
rows with zero warnings. Linked-test resolution resolved 38 references. Test-mechanism lint found
8 coherent declarations. Tool-log line 1968 records stdout SHA-256
`783ed58c081c16ba3c64be085804a17914d3b8079b60f597b0e7a2f34ed7fe8b`; capture SHA-256
`51db19be05cbfdee5fb4e70bbf433a6cf02bc371fb33b6b888ec47edb11036ae`.

### Non-Qualifying Independent Harness Findings

These nonzero results are findings, not pass evidence. Each was resolved by correcting only the
in-memory verification harness. Repository source, tests, planning, baselines, and ratchets were
not changed.

| Finding | Receipt | Observed failure | Resolution evidence |
| --- | --- | --- | --- |
| TEST-HARNESS-C38-001 | line 1962, exit 1, stdout SHA-256 `69f62704fc775e8ebbcaf6abe277a8d887e1bb65e103ad3d02fa78ff68dbecec` | The harness trimmed the porcelain status prefix and changed `scripts` to `cripts` | Line 1963 proved zero residue; path parsing was corrected |
| TEST-HARNESS-C38-002 | line 1964, exit 1, stdout SHA-256 `8d1d186eb039a54bfb188879035878a94c1804f4fa5599ccd3a1c1cfbecc45cc` | A two-file-only overlay omitted current BUG packet authority and the production CLI correctly reported 3 classification errors | Line 1965 proved zero residue; line 1966 used the complete 14-path convergence overlay and passed |
| TEST-HARNESS-SCAN-001 | line 1969, exit 1, stdout SHA-256 `9213cf8a545cec428a1c21cc787b8f8946bfd8040ce89dd78405905387c7be5e` | The broad `xit(` pattern matched the substring in `process.exit(` | Line 1970 used a token boundary and found zero disabled markers while the canonical guard remained green |

Human acceptance, final scenario receipts, planning reconciliation, and validate-owned
certification remain unresolved and unchanged by this test-owner run.
<!-- BUG022-INDEPENDENT-F32-C41-END -->

## Post-Security Regression Evidence After The Planning Path Repair — Convergence Iteration 4 {#post-security-regression-after-planning-path-repair-bug022}

**Phase:** regression
**Scope:** `01-separate-active-declarations-from-historical-receipts`
**Claim Source:** executed
**Executed At:** 2026-08-30T17:13:13Z
**Repository Revision:** `d0c09a3ec90d2bb72920caee9e44f1d5f697c619`

The plan-owned repair replaced the absent exact path in
`securityRepairBoundary.excludedFamilies` with the semantic identifier
`concurrent-focusability-probe-work`. The current test-plan SHA-256 is
`f410fc096d556a24e9141b935fbc219e01d8ecfb9d338bd0023ef15131e9cb4d`.
The parsed exclusion list contains the semantic identifier exactly once and the absent path zero
times.

### Current Execution Results

| Check | Tool-log evidence | Exit | Observed result |
| --- | --- | ---: | --- |
| Prior receipt closure audit | line 2041 | 0 | 268 declared inputs checked across lines 1974–2022; exactly 12 rows changed closure because they declared this test plan |
| Fresh authorized overlay | line 2043 | 0 | 23 authorized files matched current bytes; all 15 concurrent market, tool-brief, and focusability paths were excluded |
| Canonical spec-test paths | line 2044 | 0 | 816 artifacts, 19,320 references, 269 distinct paths, 70 frozen missing, `new=0`, `stale=0` |
| Canonical repository selftest | line 2045 | 0 | 3,465 passed and 0 failed over 3,960 output lines |
| Production reachability | line 2046 | 0 | 201 test files, 10 active globs, 0 classification errors, 0 new orphans |
| Reachability and crossing ratchets | line 2047 | 0 | Non-vacuous; baseline 26; crossings 9; 0 new or stale crossings; baseline bytes unchanged |
| BUG-022 governance matrix | line 2048 | 0 | Artifact lint, traceability, 38 linked references, 8 coherent mechanisms, and 8 obligation matrices passed |
| Cross-spec design coherence | line 2050 | 0 | Four affected packets inventoried; active-versus-historical authority stays fail-closed; 0 route, table, API, or deploy changes |
| Strict overlay cleanup | line 2051 | 0 | All 23 inputs still matched; overlay removed; 0 process, staged, unexpected, or repository-mutation residue |

### Reuse Decision And Regression Delta

The post-repair closure audit found one changed input: this test plan. It invalidated rows 1974,
1975, 1976, 1991, 1992, 1993, 2006, 2008, 2010, 2012, 2020, and 2022. The affected current
checks were rerun at rows 2043–2051. The required expensive rows below declared no changed input
and remain current:

| Retained result | Tool-log row | Current closure |
| --- | ---: | --- |
| Feature 008 direct Node consumers | 1994 | 257 passed, 0 failed; 16 declared inputs unchanged |
| Corrected one-worker Feature 008 browser proof | 1996 | 94 passed, exit 0; all 11 process and browser inputs unchanged |
| Live like-for-like ratio | 2000 | Exit 0; all four helper, config, and lifetime-tax inputs unchanged |
| Coverage and assertion delta | 2019 | Exit 0; source, carrier, registry, and both scenario manifests unchanged |

The 42-test carrier at row 1989 matched before this report append. It is excluded from final reuse
because this append changes its declared BUG-017 report input. No broader suite is substituted
for that report-sensitive closure.

### Preserved Non-Pass History

Every named non-pass remains non-pass history. Row 1984 is the first C40 residue probe. Row 1987
is the first pre-localization carrier. Row 1992 is the first ratchet assertion. Row 1995 is the
first C03 output-classification attempt. Rows 2002 and 2003 are the pre-repair selftest and
spec-path failures. Row 2032 is the later exact spec-path failure. Rows 2034 and 2035 are the
later selftest failures. Row 2042 is the first fresh-overlay exclusion-classification failure.
Row 2049 is the first cross-spec exact-wording failure. Corrected rows remain separate and do not
rewrite those outcomes.

This evidence does not certify scenarios or transition either status mirror. Human acceptance,
scenario receipt certification, remaining specialist phases, and validate-owned certification
remain outside this regression evidence.

## No-Change Simplify Phase After Post-Security Regression — Convergence Iteration 4 {#no-change-simplify-after-post-security-regression-bug022}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** Three review passes found no safe reduction that preserves declaration
authority, filesystem containment, inert command parsing, and the historical object proofs.
The executed checks below verify the unchanged implementation.
**Executed At:** 2026-08-30T17:26:00Z
**Outcome:** `route_required`

### Review Result

| Pass | Current result | Disposition |
| --- | --- | --- |
| Reuse | The focused carrier repeats local Git, hash, and snapshot helpers inside distinct rollback epochs. | Preserve them. Sharing those helpers would rewrite exact rollback objects and couple security cases that must fail independently. |
| Quality | No active TODO, FIXME, disabled test, unreferenced production helper, or removable parser branch was found. | No edit. The singular parser export remains a compatibility surface over the plural parser. |
| Efficiency | Reachability compiles matchers for per-file provenance and separately derives typed Node and Playwright selection sets. | No edit. Those outputs serve different contracts, and removing either path would weaken diagnostics or runner identity. |

The lexical `node:test` scanner, command grammar, root canonicalization, symlink checks,
baseline identity recheck, and atomic rename are security boundaries. Their explicit branches
remain readable and independently exercised. The config and command registry remain unchanged.

### Current Verification

| Check | Tool-log row | Exit | Current signal |
| --- | ---: | ---: | --- |
| Persisted and semantic mode resolution | 2064 | 0 | Both forms resolve `statusCeiling: done` and the persisted phase order. Capture SHA-256 `2317a09beb1593d4a52abdbfd53ff2c61e8ec7a50cd1a33eef601dbf0800acb2`. |
| Entry containment baseline | 2065 | 0 | 29 dirty paths classified as 3 implementation, 11 packet, and 15 hard-excluded paths. Zero path was unexpected or staged. |
| Complete focused carrier | 2066 | 0 | 42 tests passed. Zero failed, cancelled, skipped, or todo test. All five security findings and both BUG-017 fallback tests remained in the carrier. Capture SHA-256 `8dfe5d7fe88f983620e85cdfe0327f16f38e79f52e18ba4c00b5ff30368ef311`. |
| Ratio and fallback controls | 2066–2067 | 0 | The carrier preserved workers=1, `system-chrome`, channel `chrome`, visible force-kill semantics, and rejected-candidate rollback. Ratio `3.000` passed and `3.001` refused. |
| Authorized-overlay production reachability | 2068 | 0 | The 14-path overlay reported 201 tests, 10 active globs, zero classification errors, zero new orphans, and zero new or stale crossings. |
| Canonical spec-path validator | 2068 | 0 | It scanned 816 artifacts and 19,320 references, with `new=0 stale=0`. The overlay was removed. |
| Pre-provenance identity lock | 2069 | 0 | Dirty-manifest SHA-256 `02b3855fe858f564b0c0577c8f416630885da61eac5bf11832208a22d28fbe3f` and worktree-list SHA-256 `6812054d4691f867fd97e826db315f2e20c30fcdeb4ffe8a1cb5f63a655d63ea` match entry. |

The validator remains object `8880edabee2d26ba567a10f2eca40c71fc398950`. The focused
carrier remains object `ff74ad589621ee6980eb6a42795c4210bdfde769`. The ratio helper,
config, and command registry also retain their entry objects.

### Preserved Non-Terminal Boundaries

This phase creates no final scenario receipt and makes no validate or audit claim. The G136
human-acceptance boundary remains unchanged. Global stale and clone adjudication remains open.
The overlay preserved the 20 visible stale baseline entries, the 26-entry baseline, and the
9-entry crossing ratchet. Historical report evidence remains append-only.

Packet and certification statuses remain `in_progress`. Scenario states, human acceptance,
certification fields, and certified phase lists remain unchanged. The next required owner is
`bubbles.gaps` because no implementation byte changed.

## Final-Shape Gaps Audit — Convergence Iteration 4 {#final-shape-gaps-audit-convergence-iteration-4-bug022}

**Phase:** gaps
**Claim Source:** executed
**Outcome:** `route_required`
**Verdict:** `CRITICAL_GAPS_DETECTED`

The audit inspected the current parser, ratio helper, Playwright configuration, command
registry, complete persistent carrier, both planning packets, state mirrors, current report
authority, and preserved BUG-017 candidate-rejection history. It then exercised production
parser exports against isolated real filesystems. The five implementation objects matched the
post-security simplify epoch before the probes ran.

### Invariants That Held

- The complete persistent carrier passed 42 of 42 tests with zero failed, cancelled, skipped,
  or todo tests. Complete-output SHA-256:
  `15f27f20af73f62c29eb2d9aa52a925f35799a6d2fb1948ced4aa20e291b7ea3`.
- Both packets passed artifact lint, traceability, linked-test resolution, scenario-obligation
  lint, and test-mechanism lint. All 10 commands exited zero. Complete-output SHA-256:
  `7a4085720db621bbc037acc71a9daace12bdbd3f03b307fa839ac9aedd13e4b0`.
- Direct artifact derivation confirmed BUG-017 DoD mirrors at `3/0`, `11/0`, `8/0`, and `6/0`.
  It confirmed BUG-022 at `53/0`, 37 explicit Test Plan-to-DoD mappings, five active BUG-017
  scenarios with six historical scenarios excluded, eight unique BUG-022 scenarios, one
  certifying-window marker per report, and current routing to gaps. Complete-output SHA-256:
  `cc052b9da68c18c27386bd437363444f0a7dfff12945154b06987509869f80c0`.
- The deterministic ratio control accepted `3.000`, refused `3.001`, and left zero owned
  temporary roots. Complete-output SHA-256:
  `fe91866ed7e0eedbde58f6ac11ac2cd378bf49e11d1385a300bf14b7511ee640`.
- A same-kind declaration control retained one Node identity with two homogeneous sites. The
  selected one-worker fallback, browser parity, visible force-kill semantics, candidate
  rollback, baseline-write ordering, baseline and test symlink refusals, environment-directory
  refusal, and the five existing security rows all remained green inside the 42-test carrier.

These passing rows do not close the findings below. The carrier did not contain their exact
counterexamples.

### Complete Finding Set

The final expanded falsification matrix exited 1 with all 12 counterexamples observed, zero
fixture residue, and complete-output SHA-256
`f04ceb1b299a016ad3710895ce1b1990ba950d5977902996378a1172b9e67205`.

| Finding | Classification | Falsified contract and current behavior | Earliest owner |
| --- | --- | --- | --- |
| `GAP-R4-BUG022-015-UNKNOWN-NONMARKDOWN-CANDIDATE-DROP` | DIVERGENT, high | Design requires repository-wide candidate classification. The collector skips an unknown non-Markdown artifact after detecting `--test`, so its glob reaches no active, historical, or error ledger. The skip is at `scripts/validate-test-file-reachability.mjs:1071`. | `bubbles.plan` |
| `GAP-R4-BUG022-016-DIRECT-ARBITRARY-WRAPPER-DROP` | DIVERGENT, high | A direct `custom-wrapper node --test <glob>` candidate disappears instead of producing the required provenance-bearing unsupported-wrapper error. The parser limits arbitrary one-token wrapper recognition to table and command-label presentations at lines 895–903. | `bubbles.plan` |
| `GAP-R4-BUG022-017-LIST-ARBITRARY-WRAPPER-DROP` | DIVERGENT, high | The same arbitrary wrapper in a Markdown list also disappears. List recognition at line 614 does not reach the fail-closed wrapper path at lines 895–903. | `bubbles.plan` |
| `GAP-R4-BUG022-025-TASK-LIST-CANDIDATE-DROP` | PARTIAL, medium | A valid Markdown task-list command remains prefixed by `[ ]` after list extraction and disappears before classification. SCN-BUG022-005 promises that Markdown-list presentations cannot hide candidates. | `bubbles.plan` |
| `GAP-R4-BUG022-018-TABLE-BACKTICK-SUBSTITUTION-DROP` | DIVERGENT, high | A table command containing a backtick substitution is reduced to the inline code span. The Node declaration disappears instead of reaching the shell-substitution refusal. Lines 641–647 select every table code span in place of the full presented command. The execution canary remained absent, so this is a visibility failure rather than execution. | `bubbles.plan` |
| `GAP-R4-BUG022-022-TABLE-QUOTED-PIPE-CANDIDATE-DROP` | PARTIAL, medium | A table command with a quoted `--test-name-pattern` alternation is split on its inner pipe at line 606. Its positional glob disappears. This violates the quoted-option and complete-presentation contracts in SCN-BUG022-005 and SCN-BUG022-006. | `bubbles.plan` |
| `GAP-R4-BUG022-023-COMMAND-LABEL-BACKTICK-SUBSTITUTION-DROP` | DIVERGENT, high | A `Command:` declaration with an embedded backtick substitution is reduced to the code span and loses the Node glob. It should remain visible as a malformed command. The execution canary remained absent. | `bubbles.plan` |
| `GAP-R4-BUG022-019-UNBOUNDED-PERL-ALARM-GRAMMAR` | DIVERGENT, high | The Perl alarm recognizer accepts arbitrary text after `or die` because line 875 uses `or die .+`. The probe appended another Perl statement, and the collector admitted the glob as active with no classification error. The closed wrapper grammar therefore is not closed. Candidate text remained inert. | `bubbles.plan` |
| `GAP-R4-BUG022-026-ESCAPED-DECLARATION-SYMLINK-SILENT-SKIP` | DIVERGENT, high | A symlinked active-plan directory resolving outside the canonical root is silently omitted. `listFilesRecursive()` handles only real directories and files at lines 540–550, so `physicalReadPath()` never receives the escaped declaration. The contract requires an explicit containment refusal with provenance. | `bubbles.plan` |
| `GAP-R4-BUG022-020-NAMED-STATIC-NODE-TEST-EXEMPTION` | DIVERGENT, high | A real file using `import { test } from 'node:test'` passed the Node test runner, but reachability classified it as an exempt helper and not an orphan. The static-import scan stops at `{` on line 425 before reaching `from 'node:test'`. | `bubbles.plan` |
| `GAP-R4-BUG022-021-TEMPLATE-INTERPOLATION-NODE-TEST-EXEMPTION` | DIVERGENT, high | A real test registered from executable template interpolation passed the Node test runner, but reachability classified the file as an exempt helper. Lines 377–387 discard the entire template, including interpolation code. The design excludes template text, not executable `${...}` expressions. | `bubbles.plan` |
| `GAP-R4-BUG022-024-REGEX-LITERAL-NODE-TEST-FALSE-REGISTRATION` | DIVERGENT, medium | An imported helper containing only a regular-expression lookalike for `import('node:test')` became a blocking orphan instead of receiving the helper exemption. The tokenizer has no regular-expression literal state, so it tokenizes the lookalike as executable import syntax. | `bubbles.plan` |

### Finding Accounting And Route

- Findings discovered: 12.
- Findings addressed by gaps: 0. Gaps owns diagnosis, not planning, source, or test repair.
- Findings unresolved: 12.
- BUG-017 implementation findings: 0 in this audit.
- Required planning action: reopen BUG-022 Scope 1, map all 12 counterexamples to the existing
  SCN-BUG022-002, SCN-BUG022-004, SCN-BUG022-005, SCN-BUG022-006,
  SCN-BUG022-007, and SCN-BUG022-008 contracts, add one independently falsifiable Test Plan and
  DoD row per counterexample or justify a smaller root-cause grouping without dropping a case,
  and reset the Done and `53/0` mirrors coherently.
- Required downstream action after planning: `bubbles.implement` authors persistent RED tests
  before changing the parser, then `bubbles.test` independently proves every unchanged command
  GREEN plus the complete carrier, production CLI, rollback, containment, and residue controls.

The live-root production reachability command also exited nonzero on a pre-existing hard-excluded
concurrent orphan. That path is not part of this finding set and is not used as evidence for any
BUG-022 conclusion. The accepted isolated-overlay receipt remains preserved but is not promoted
to a gaps-phase closure claim.

The expensive 94-test browser and live-ratio commands were not rerun. Their prior receipts remain
preserved. The current object lock proved the ratio helper, reachability validator, focused
carrier, Playwright config, and command registry still match the post-security simplify epoch,
with zero staged path and a clean allowed-path diff. Complete-output SHA-256:
`b919268b0ff2e7450f021190a1a45fc562f01a0bf81d9d943f811edda7567392`.
Because the parser contract is not gap-free, this audit does not adopt those expensive receipts
as final scenario evidence and records no completed gaps phase claim.

Final scenario-receipt refresh, validate and audit ownership, both G136 boundaries, global stale
and clone adjudication, upstream framework findings, and every excluded concurrent family remain
open and unchanged. Packet and certification status remain `in_progress`.

### Post-Ledger Integrity And Non-Qualifying Harness History

The post-ledger integrity matrix exited zero. It reran the complete 42-test carrier, packet
artifact lint, direct mirror and scenario parity, and active-versus-historical runner authority.
The final authority result remained 10 active globs, 40 historical sites, zero classification
errors, zero new crossings, and zero stale crossings. Complete-output SHA-256:
`fb2ee23435c04eac01c29de0b24d298f3318913c191901e126df8344205d20e6`.

The first final-containment harness is retained as non-qualifying evidence. It exited 2 because
its double-quoted grep expression exposed Markdown backticks to zsh command substitution, and the
IDE deletion request had not removed two external temporary harness files. It made no repository
change and proved all five implementation objects unchanged, but it is not a containment pass.
Complete-output SHA-256: `88c24317ebcffbc4adbdcbccb203e0f57eca76f0c1a5ed6e4cdb95f0d8201ce7`.

The corrected containment command used a shell-safe expression and removed only those two
external temporary harness files. It exited zero with exactly 12 report finding rows, all five
implementation objects unchanged, zero staged paths, a clean allowed-path diff, and zero
temporary or process residue. Complete-output SHA-256:
`1d8e571c987dc62a90cce1e9dcd2646cf727d659b0a709efdc1fe83ad5b18885`.

## Current Implementation Recovery — Final-Shape Tax-Delivery Node {#current-implementation-recovery-final-shape-tax-delivery-node}

**Phase:** implement
**Claim Source:** executed
**Outcome:** `route_required`
**Source revision:** `fa9be9ddcd330220171c7e374071be6856adc677`

The refreshed `close-bug-022` goal-node packet passed repository-binding validation at control
revision 31. The persisted `bugfix-fastlane` mode and semantic
`fix action:fastlane target:bug` mode both resolved to `statusCeiling: done`.

### Candidate And Authorized-Overlay Boundary

The source root and authorized overlay carried validator SHA-256
`a7b05778fe053a92c1faf35641256f68cc3bf025420b14d7f856d1d727eb6ae1` and carrier
SHA-256 `e640d64b393b591dbbeafc38f3bce960016ef68e1135d2d30eaed6709cc90d35`.
The inspected pending overlay audit then executed at exit 0 with full-output SHA-256
`10b3fa95796f8878c4e618d9f53221681a162e9031bc922fbafceebaeb5f2d80`.
It proved all 14 authorized dependency paths byte-equal to the source root, all overlay index
objects equal to HEAD, zero staged paths, contained Playwright dependencies, and all 23
concurrent dirty paths absent from the overlay.

### F42 Through F53 RED Provenance

The refreshed behavior-specific provenance audit exited 0 with full-output SHA-256
`cbce9227294a81ac4f4a3f388e17549d96a8298d8718dee34bd618789c2a3d83`.
It verified exactly one structured RED receipt for each F42 through F53 at tool-log lines 2279
through 2290. Every row followed final-shape planning completion, used pre-repair source
SHA-256 `6adc41abd4d0a880dd33c9fa3f5e20314b7293b275be45bdc412cbb407e41b31`
and pre-repair test SHA-256
`495becce58f919f9a723b1c7d866b8c1b3254353b38d79d1324b0a366aa66441`, ran exactly
one test, and recorded one behavior-specific failure with zero pass, cancel, skip, or todo.
The audit rejected infrastructure errors, missing fixtures, syntax failures, command failures,
and timeouts as substitutes. The 12 capture hashes were:

| Finding | RED capture SHA-256 |
| --- | --- |
| F42 | `8224adeae1945798f23e7220f1da246c351d9dcb76c82abfc0388323eb70efd0` |
| F43 | `a677334667c927ea4f7382355054ca89a9184919c73d0bd9fd1c8dd467a92b4b` |
| F44 | `b9b82b1d058f792773a45fe18c39d9e652a490f14be127146f8efe43cdc3ee0e` |
| F45 | `2a8e4b165574a5e3575c13f918edad0b1b08f6af982728d3d6323a8ee04c3a47` |
| F46 | `729dce265e01cfba1704e963bbcff292acfe7cf5b58d5bd747ef077c67f58fff` |
| F47 | `4cd5456366899ecce4df8836a3f7831be506b0e7f3aac44b2e8b70715d64c7ad` |
| F48 | `fb905e3db5f3e6cc91cf38b4a14cd60e984b973466a0143f57d121883133d274` |
| F49 | `8b4a5b40e04467433e4467c8b2c1fc8f845e7d74b7d11cd42253796dc1061d94` |
| F50 | `72de873563f0cb06e2d615685efaf87d93d572bf1138e7f1718bf36fd12f66f1` |
| F51 | `487395c2b3d25fdf7c774bddd4f03dae16305f6ff68e73cdfb2f40d200d55e61` |
| F52 | `30fe350646eff05cc9fad7d44be01859ee1f17ce9eeeff2ecd701dde7a758ff9` |
| F53 | `b1511a1a796ad64cf6342b25a4df97c80a697f48f594cf7d535a6002ee71cce1` |

### Current Focused GREEN And Ordered Closure

All 12 exact focused commands ran sequentially on the current authorized overlay. Each ran one
test and exited 0 with zero fail, cancel, skip, or todo. Their current capture hashes were:

| Finding | GREEN capture SHA-256 |
| --- | --- |
| F42 | `aa534d0b19277291b600276a52bc23081eabde2a0d93e730c13b1c5310e8f824` |
| F43 | `109e47f5c610b8e85a9b89276bce40b29dd76762c61ca6623f2a23e387757dcb` |
| F44 | `90bff8480086d58dab8054a6ed77901ac1cbe8440024c0471096863bfac3be2c` |
| F45 | `b4538f3ec289eaaab896acc83f7b0e5a41932807dd108771ceaef9c2a5f51e87` |
| F46 | `9de95d9d19e149d2e13ffd7326896b7dd1e7b11156de8a97be3b79e8a3d5200d` |
| F47 | `0515a693fc6eeb467676321b31a0a00dfaa78586c63e21a2b25a3a833708dd07` |
| F48 | `8ced3a92a93ca5247fcc07fd0abd0194f54ed4c58149dc2ebad8c288ec977efc` |
| F49 | `45a19cea1e512d52c44ad5bd1e50c2e903b7b9095ff317404a1538c79874b8e4` |
| F50 | `1731800bc880999d326dd8477ff54764075b9e43769b01743cd5aad00263e18c` |
| F51 | `2c83d6182d89b09ae48987b3c00d9eec22ede57617d12bd9254a3f47aa2c75b6` |
| F52 | `755b64307ec701a595598d0accb56e7aebbb47486d6719056b86ddd9203803c0` |
| F53 | `77b304adf3cd8bf66fe0ae031d653099d291b4df22e60035172192823ea4d0b0` |

The planned C54 through C60 sequence then executed in order on the same candidate:

| Row | Exit | Full-output SHA-256 | Direct signal |
| --- | ---: | --- | --- |
| C54 | 0 | `748585c5c93c594560a130124195303d2cb41dba0a1d916a1d4e66aeefa5b2d9` | 57 passed; 0 failed, cancelled, skipped, or todo |
| C55 | 0 | `44ca05bbbf4253af62278761f948e6f8a032b220f708ec68a8518c85802cd7da` | 201 files, 10 active globs, 0 classification errors, 0 new orphans |
| C56 | 0 | `b73a31fec5f98afc562c4955c69d5a7ca64b13fd204144f1e66552678a54a753` | 12 verdicts, 12 controls, all canaries absent |
| C57 | 0 | `b03fffe5ed02966ed6c3c0a082d98b31d509399ab30b3672d7c5979ab9821f52` | exact reverse and forward objects; 3 protected objects; no fixture residue |
| C58 | 0 | `3f1bdd66db9f55daec1a955366f467073f15a08edb8f41b23c28b2f4e51edc04` | canonical selftest: 3465 passed, 0 failed |
| C59 | 0 | `a5e580baeab95791c5b45a869d1db7a417fb324b0c8cbd64514a82a9d505547e` | 819 artifacts, 19,431 references, 0 new or stale paths |
| C60 | 0 | `f28e22fede3f19586a37a3954d2f9ddb8477eba1951de6875e14be1a992aefd1` | 2 implementation paths, 12 protected mutants, 0 staged paths, 0 process residue |

The final-shape audit exited 0 with full-output SHA-256
`a988ff42f04f0e8ceb6e19267dba33ee6b9fefe5a4d5d1fb3beec8fac1edffc1`.
It independently counted 57 carrier registrations, exactly one registration for each of the
12 focused titles and C56, C57, and C60, zero disabled or alias-disabled registrations, an
unchanged 26-entry baseline object, an unchanged 9-entry crossing ratchet with SHA-256
`97b06d69945f0b3cba3a9ceca33bf11c122ff3072775d1989bc37fb61cf4f950`, zero staged
paths, and zero owned test process or temporary residue.

### Historical C58 Classification And Current Governance

The earlier C58 receipt exited 1 at 3464 passed and 1 failed. Its sole failure was the stale
validate-owned `certification.scopeProgress` claim of `53/0` against the plan-owned `53/19`
artifact. The focused diagnostic named that exact mismatch. The refreshed overlay carries the
validate-owned mirror at `53/19`; current `validate-scope-dod-progress.mjs` exits 0 with 72
agreements, 14 frozen drifts, and zero new or stale drift. No implementation-owned
certification write was made.

Artifact lint, freshness, traceability, linked-test resolution, scenario obligations,
test mechanisms, requirement mechanisms, and scope-progress validation all exited 0. Source
and carrier syntax checks, Node source-lock validation with 16 rejected adversarial source
mutants, bugfix regression-quality validation, and diff checks also exited 0.

The truthful nonterminal transition diagnostic exited 1 with full-output SHA-256
`3aca13ee9961c938d251807d7b29f8f659fcb56c41edab412a9f1d5196745828`.
It passed G057, G053, G040, G051, G068, G082 through G100 where applicable, G128, G130,
and G131. It retained G060, G022, G027, and G136 as non-implementation closure gates because
Scope 1 remains In Progress at 53 checked and 19 unchecked, scenario certification is absent,
specialist certification is incomplete, and human acceptance is unchanged.

Implementation ownership is complete for the final-shape parser and carrier. This phase does
not alter any of the 19 plan-owned rows, scope status, scenario state, human acceptance,
certification fields, or completed-scope mirrors. Independent test ownership is the next
required phase.

### Final Owned-Residue Cleanup

**Phase:** implement
**Claim Source:** executed

The final cleanup removed 37 task-owned disposable overlays, audit scripts, packet files,
result-envelope files, and output stores. Every removal returned exit 0 and reported the path
absent. No repository file, staged path, commit, push, reset, or acceptance artifact was part
of that cleanup.

<!-- BUG022-INDEPENDENT-FINAL-SHAPE-TEST-BEGIN -->
## Independent Final-Shape Test Verification — Tax-Delivery Node {#independent-final-shape-test-verification-tax-delivery-node}

**Phase:** test
**Claim Source:** executed
**Outcome:** `route_required`
**Executed At:** 2026-08-31T18:45:48Z through 2026-08-31T18:47:36Z
**Source revision:** `fa9be9ddcd330220171c7e374071be6856adc677`

The exact revision-31 `close-bug-022` goal-node packet passed binding validation before any
repository read. Both persisted `bugfix-fastlane` and semantic
`fix action:fastlane target:bug` resolved to `statusCeiling: done`. Independent execution used a
fresh disposable checkout at the source revision plus exactly 14 authorized current dependency
paths. The overlay audit excluded all 23 live-tree concurrent paths, found zero unexpected or
staged path, and retained exact current bytes.

The independently measured implementation identities were:

```text
SOURCE_SHA256=a7b05778fe053a92c1faf35641256f68cc3bf025420b14d7f856d1d727eb6ae1
TEST_SHA256=e640d64b393b591dbbeafc38f3bce960016ef68e1135d2d30eaed6709cc90d35
OVERLAY_HEAD=fa9be9ddcd330220171c7e374071be6856adc677
OVERLAY_DIRTY_COUNT=14
OVERLAY_UNEXPECTED_COUNT=0
OVERLAY_STAGED_COUNT=0
EXCLUDED_CONCURRENT_PATH_COUNT=23
OVERLAY_VERIFY_RESULT=PASS
```

### Independent Pre-Repair RED Provenance Audit

**Claim Source:** executed

The audit read the canonical structured log and retained raw terminal record. It did not adopt
an implementation-owner pass as current GREEN proof. Each RED followed final planning completion
at `2026-08-30T17:58:22Z`, ran at pre-repair source SHA-256
`6adc41abd4d0a880dd33c9fa3f5e20314b7293b275be45bdc412cbb407e41b31` and test
SHA-256 `495becce58f919f9a723b1c7d866b8c1b3254353b38d79d1324b0a366aa66441`, selected
one exact title, and produced one behavior-specific failure. Each run reported zero pass,
cancelled, skipped, or todo tests. The audit rejected setup errors, missing fixtures, syntax
errors, timeouts, signals, and generic nonzero results. It found 12 distinct capture hashes and
12 distinct structured stdout hashes. Its complete output SHA-256 was
`bf8a554bf43a0a51600747fc8f10361a814a0b0e9b8eb373e79c62b2a56c0692`.

| Row | Tool-log line | RED capture SHA-256 | Behavior-specific observed RED |
| --- | ---: | --- | --- |
| F42 | 2279 | `8224adeae1945798f23e7220f1da246c351d9dcb76c82abfc0388323eb70efd0` | Non-Markdown candidate was absent while Markdown and binary controls remained distinct. |
| F43 | 2280 | `a677334667c927ea4f7382355054ca89a9184919c73d0bd9fd1c8dd467a92b4b` | Direct arbitrary wrapper was absent; direct control existed; canary was absent. |
| F44 | 2281 | `b9b82b1d058f792773a45fe18c39d9e652a490f14be127146f8efe43cdc3ee0e` | Markdown-list arbitrary wrapper was absent while the direct list control remained active. |
| F45 | 2282 | `2a8e4b165574a5e3575c13f918edad0b1b08f6af982728d3d6323a8ee04c3a47` | One of three task-list candidates remained visible. |
| F46 | 2283 | `729dce265e01cfba1704e963bbcff292acfe7cf5b58d5bd747ef077c67f58fff` | Table backtick candidate was absent; control existed; canary was absent. |
| F47 | 2284 | `4cd5456366899ecce4df8836a3f7831be506b0e7f3aac44b2e8b70715d64c7ad` | Quoted-pipe declaration set was empty while structural controls remained visible. |
| F48 | 2285 | `fb905e3db5f3e6cc91cf38b4a14cd60e984b973466a0143f57d121883133d274` | Command-label backtick candidate was absent; control existed; canary was absent. |
| F49 | 2286 | `8b4a5b40e04467433e4467c8b2c1fc8f845e7d74b7d11cd42253796dc1061d94` | Trailing-statement wrapper remained active instead of malformed; canonical controls and inert canary were present. |
| F50 | 2287 | `72de873563f0cb06e2d615685efaf87d93d572bf1138e7f1718bf36fd12f66f1` | Escaped declaration symlink produced no refusal or logical path; regular control stayed active. |
| F51 | 2288 | `487395c2b3d25fdf7c774bddd4f03dae16305f6ff68e73cdfb2f40d200d55e61` | Named import executed under Node but was helper-exempt and not orphanable or reachable. |
| F52 | 2289 | `30fe350646eff05cc9fad7d44be01859ee1f17ce9eeeff2ecd701dde7a758ff9` | Interpolation import executed under Node but was helper-exempt and not orphanable or reachable. |
| F53 | 2290 | `b1511a1a796ad64cf6342b25a4df97c80a697f48f594cf7d535a6002ee71cce1` | Regex-only helper became an orphan while the real dynamic-import control remained test-bearing. |

### Independent Focused GREEN Receipts

**Claim Source:** executed

Each unchanged focused Test Plan command ran in its own process and produced one structured
test-owned receipt. All 12 selected exactly one title, passed one test, reported zero failed,
cancelled, skipped, or todo tests, exercised its named negative control, and retained candidate
execution canaries as absent where applicable.

| Row | Exit | Capture SHA-256 | Structured stdout SHA-256 |
| --- | ---: | --- | --- |
| F42 | 0 | `f491fcdeafb6112dda44e732775a4590a76a85f25424bd1b3b53c84df421eba3` | `65a2ab84ec5b5da50eb5ffe3884af2e2c7789eab88d97cd0eebb7fcc115f8a90` |
| F43 | 0 | `af46d530c3ce3a684ba48725927ca3603bfedc3446db395ebc58e5ce3c352d94` | `b8581d002d557e67751b9e4a50b249f5d68c0341b7fbcb0bf8b42ea3b060166e` |
| F44 | 0 | `c57881365f5ca8f96490023f18e64d1f715f0657d6888b9c1e1bd144f8004218` | `2af97212a5f0575dbc7ac6c74e3c28d9c318ccebf1ad8cdcf791085f868eae64` |
| F45 | 0 | `96e5888da7d6ca77253c605c7529e6c47b57fe2c8e76698a657cd41ce9ce5ee3` | `c4f4d0d7d04c6c3147f4a86217b39940f7f0c5167bff7f90d2b296929e44bfc5` |
| F46 | 0 | `9a65d4f0d03bca33d66784031d31ca830b8fbd29d3c071264ce223d0a07608a4` | `869a9a1a0f0f584e81ddaa63ba26d0a6e5415c8d32ac2664565792852f9745ad` |
| F47 | 0 | `60006e6fec1637b43cd59fa3845351ed3899faee8c63b6fb43c3500ba322ddd1` | `04dd2373f8a6b7832e3ac2fd5da5746a6afaca39e4c873907ac0c50fb857a770` |
| F48 | 0 | `f37d34e6accb6b2355bc84217414689f3112ba524f33367158391ef9523a7902` | `7c0de598a99735f3c322f942244fec50c76f7ac142771c10caf5be644815e7d2` |
| F49 | 0 | `2fce22faa74412ca0b4d840079f499432bfc703928fe32ebd730e9a8efd6117a` | `0b013eb68a574ea30c3370d28029ccecc41c916f86ecad38295b28ee0e9804b4` |
| F50 | 0 | `d58aa90187b526c2ba2db754a57f711f8e326eb7c0c8b9758712c96f8d6dbf15` | `2859b342d76c033a17345279adcfc4ea7fde76a22282493f9b13f85997502056` |
| F51 | 0 | `5f0a53454e7fce47fe7191b56c6ec6837320cc2391263ef37eda3bc09c0c95e1` | `8bf729bb0b0df8bd4167cfe0dbcd4817739257310a07af8665796b32cf45dd82` |
| F52 | 0 | `9111a92666278c94a5f3bc781c2958c599e1217bee5d67186e838fa1fe868a7c` | `8c1a845f5398d63f0f4394fd2eb5e9e2d00ce80b25fc1165f4c46086c0915a78` |
| F53 | 0 | `cdcc6de11e6d714ea42c992664218e8c65b094e8b735cf02fac04296077362cb` | `14e39270ede8924dcd23d24a858c6ddd92b6d854898a25f3d80bd810552c32e4` |

### Ordered C54 Through C60 Closure

**Claim Source:** executed

| Row | Exit | Capture SHA-256 | Direct result |
| --- | ---: | --- | --- |
| C54 | 0 | `81b312d80aeb1cc7e91013f84a8e87a6e2254f3f3456f661d2c82a73a6f350eb` | Complete carrier: 57 passed; 0 failed, cancelled, skipped, or todo. |
| C55 | 0 | `7b555cb69504f1275cb632a64f044b2363e456b4b2c5e8ab856c6ec94e787cbe` | 201 test files, 10 active globs, 9 Node globs, 1 Playwright matcher, 0 classification errors, 0 new orphans. |
| C56 | 0 | `54f2ccd909298155216328e0adec879db5059d11c47fe81b320c2e4fda0db9f6` | 12 distinct verdicts and 12 independent controls true; execution canaries absent. |
| C57 | 0 | `1fd4f81d753f9aa7ef92b43547290e4845a8520bc17abc49edf8cec0e78efbbc` | Exact reverse objects `8880edabee2d26ba567a10f2eca40c71fc398950` and `e11830e641ba77a022505ad447d62d3969677413`; exact current objects `4326d86b9509e9c12b96789239ce1035fafba60c` and `06b7d1b456089e8c15b3a6beeee257c6dea41356`; three protected objects stable; no fixture residue. |
| C58 | 0 | `2e62febe3e9ceb1802bdb8487363b7100e22298eb42d28a23e8bee5fbf7955e4` | Canonical repository selftest: 3,465 passed and 0 failed. |
| C59 | 0 | `a5e580baeab95791c5b45a869d1db7a417fb324b0c8cbd64514a82a9d505547e` | 819 artifacts and 19,431 references; 0 new and 0 stale paths. |
| C60 | 0 | `3e6298d63149430201e67d5d739ce69ba3eb5b29a7211df193c7db6ffe73c014` | Exactly two implementation paths; all 12 protected-family mutants RED; 0 staged paths and 0 process residue. |

The exact ratchet audit recorded the unchanged 26-entry reachability baseline set SHA-256
`c847133ed970a5f9508fb1abee6780bedc21296877e5ba338de914a68f28b56a` and the
unchanged 9-entry crossing ratchet SHA-256
`97b06d69945f0b3cba3a9ceca33bf11c122ff3072775d1989bc37fb61cf4f950`.
It recorded zero new or stale crossings and byte-identical spec-path baseline SHA-256
`21af4812deab3017ac663a09562e52357ec9f35f4f7ca9cd2250d42cf9e92069` before and
after C59.

### Test Integrity And Governance

**Claim Source:** executed

The corrected test-body audit found each F42 through F53 title exactly once, zero bare early
return, at least one production-path call, and between one and seven direct assertions per test.
It found zero disabled marker and zero internal mock or interception. Complete audit SHA-256:
`4289239c874ecdf629fef7e6c3facf3412e2b12e933146a9000651dfee095541`.

The source lock passed with exact Playwright `1.61.1`, three external packages, integrity hashes,
one npm registry, lifecycle scripts disabled, and all 16 adversarial source mutations rejected.
Fresh `npm ci --ignore-scripts` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` installed three packages
and downloaded no browser. The checkout-local runner reported `Version 1.61.1`.

Syntax for both candidate files, source lock, bugfix regression quality, token-bounded
skip/only/todo/pending scan, internal mock/interception scan, incomplete-marker scan, and Git
diff check all passed. Complete matrix SHA-256:
`44857bbdbeccfe357b3c56d8ba880ebc7d342e8279186c5eb37c3ecd66807904`.

Artifact lint, artifact freshness, whole-packet traceability, linked-test resolution, scenario
obligations, test mechanisms, requirement mechanisms, scope-progress validation, all three JSON
parsers, scenario-state preservation, lifecycle-state preservation, and Git diff check passed 14
of 14. Complete matrix SHA-256:
`0df444da06a1d73c65ebfc9b2ce5bbfebebcf9771f4655b2edf0e9a6552abbad`.

The final residue audit preserved the exact candidate hashes, found exactly 14 authorized overlay
paths, zero unexpected or staged paths, and zero owned temporary, process, or output residue.
Complete audit SHA-256:
`188d7f58c7bb4393ea7affae59b9f579fe4bd9e09381f3ced69d23bb9ff5bb35`.

One diagnostic quality scan falsely matched `process.exit` as the token `xit`. It was not used as
pass evidence. The token-bounded rerun above superseded that diagnostic without any repository
mutation. One governance draft invoked a nonexistent scenario-state script. It was not used as
pass evidence. The corrected 14-check matrix used repository-present commands plus direct JSON
state invariants and passed. Two early overlay audit drafts failed on zsh's read-only `status`
variable. They made no repository change and were superseded by the successful Node overlay audit.

### Preserved Nonterminal State And Routing

This test phase does not close any planning row or certify any scenario. Scope 1 remains
`In Progress` with 53 checked and 19 unchecked DoD rows. Top-level status and
`certification.status` remain `in_progress`. Both completed-scope arrays and
`certification.certifiedCompletedPhases` remain empty. Certification scope progress remains
53/19. Scenario state remains pre-implementation and planned. Human acceptance, user validation,
all planning files, all non-test phase claims, source, tests, baselines, registries, BUG-017,
BUG-020, Features 021–024 and 029–031, company-intelligence work, framework files, staging,
commits, and pushes remain unchanged.

Independent test ownership is complete for all 19 final-shape rows. Planning owns the next
reconciliation of those still-unchecked rows and Scope 1 status.
<!-- BUG022-INDEPENDENT-FINAL-SHAPE-TEST-END -->

## Plan Reconciliation Adjudication — Current Canonical Log {#plan-reconciliation-adjudication-current-canonical-log}

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** Eighteen rows have exact current source-and-carrier closure. C59 has an
exit-zero receipt, but that receipt does not contain the current validator source in its input
closure. The collective nineteen-row claim is therefore not established at the stated input
identity.

The repository binding packet for goal node `tax-close-bug-022` validated before repository
reads. The canonical tool log ended at line 2415 during this adjudication. F42 through F53 at
lines 2396 through 2407, C54 at line 2383, C55 at line 2387, C56 through C58 at lines 2391
through 2393, and C60 at line 2395 each record `agent: bubbles.test`, exit 0, validator SHA-256
`a7b05778fe053a92c1faf35641256f68cc3bf025420b14d7f856d1d727eb6ae1`, and carrier SHA-256
`8b2607f934db221ec408fe44fc2395645495284a5bf8536f6ae9127e7da1bcff` in `inputClosure`.

C59 line 2394 records exit 0 and stdout SHA-256
`2510d691059227ac1c4d982987041292226781e892b33746dbd2bc821d8f3793`. Its closure contains
the spec-path validator, `scopes.md`, `scenario-manifest.json`, `test-plan.json`, and the
current carrier. It omits the current validator source. Its scenario binding names revision
`fa9be9ddcd330220171c7e374071be6856adc677`, but that revision resolves source and carrier
blobs `5849f920d82efd4171da388370430ae163e771eb` and
`bea34c685c14aa758db2c8cf732efb3658b5220e`. Current worktree blobs are
`4326d86b9509e9c12b96789239ce1035fafba60c` and
`3436a3a814656ac1a6cbfa80f724936ea8c0b840`. The revision label cannot replace the omitted
current-source closure.

The corrected aggregate audit at line 2413 includes C59 in its expected row set. Its matching
rule requires the shared `sourceRevision` and current carrier, not the current validator source
closure. That audit therefore does not remove the C59 gap. Historical nonzero receipts remain
append-only at lines 2381, 2382, 2384, 2385, 2411, and 2414.

Planning reconciles the eighteen fully closed rows and retains C59 unchecked. Scope 1 remains
`In Progress` at 71 checked and 1 unchecked row. No certification field, human acceptance,
top-level terminal status, completed-scope mirror, test source, runtime source, or unrelated
dirty path changes in this planning pass. C59 requires one test-owned rerun with both current
implementation inputs recorded before Scope 1 planning status can become `Done`.

## C59 Row 2417 Semantic Adjudication {#c59-row-2417-semantic-adjudication}

**Phase:** plan
**Claim Source:** interpreted
**Interpretation:** Row 2417 repairs the earlier input-identity omission but does not prove the
zero-stale half of C59. The command treats stale baseline entries as an exit-zero result.

The scoped `tax-close-bug-022` repository packet validated before repository reads. Canonical
tool-log row 2417 records `agent: bubbles.test`, the exact command
`node scripts/validate-spec-test-paths.mjs`, exit 0, stdout SHA-256
`5fd6669856c34de1fc45e1fec23f3e36349f34a64e5316192c8ebf502c416592`, and six input hashes.
Independent comparison matched all six hashes to the pre-reconciliation validator, carrier,
spec-path validator, `scopes.md`, `scenario-manifest.json`, and `test-plan.json` bytes. Its
scenario binding names SCN-BUG022-007 and claims zero new or stale paths.

The production validator's `ok` predicate requires a non-vacuous scan, a present baseline, and
zero `newMissing` rows. It does not require an empty `staleBaseline`. Its success output also
explicitly permits stale entries. The exact C59 command was therefore executed with the baseline
hashed before and after:

```text
BUG022_FINAL_C59_DIAGNOSTIC_BEGIN
b71bd31738c77a2b14622ec292e0f76a4352e4fb17e084d01443f9377de61b93  scripts/validate-spec-test-paths.baseline
[spec-test-paths] scanned=821 references=19461 distinctPaths=269 missingPaths=65 plannedMissing=0 baseline=70 new=0 stale=5
  STALE-BASELINE: 5 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/tool-brief-v2-author-boundary.functional.mjs
      tests/tool-brief-v2-publication.integration.mjs
      tests/tool-brief-v2.spec.mjs
      tests/tool-brief-v2.stress.mjs
      tests/tool-brief-v2.unit.mjs
[spec-test-paths] OK — no new missing test path(s) (5 stale baseline entries to remove)
C59_FINAL_EXIT=0
b71bd31738c77a2b14622ec292e0f76a4352e4fb17e084d01443f9377de61b93  scripts/validate-spec-test-paths.baseline
BUG022_FINAL_C59_DIAGNOSTIC_END
```

The current evidence proves zero new missing path and no baseline mutation. It contradicts the
planned zero-stale result. C59 remains unchecked with an uncertainty declaration. Scope 1 remains
`In Progress` at 71 checked and 1 unchecked row. Under the resolved `bugfix-fastlane` phase order,
`bubbles.regression` follows a complete test phase. Because C59 keeps the test phase incomplete,
the actual immediate owner remains `bubbles.test`; this planning invocation does not run it.

Historical nonzero receipts at lines 2381, 2382, 2384, 2385, 2411, and 2414 remain unchanged.
No certification field or human-acceptance surface changes in this adjudication.

## C59 Zero-Stale Test Proof And Current Test Verdict {#c59-zero-stale-test-proof-current-test-verdict}

**Phase:** test
**Claim Source:** executed

The `tax-close-bug-022` packet validated at control revision 3. The test phase then
removed five paid-down paths from the shrinking spec-path baseline. All five paths
exist as current Tool Brief v2 test files. No new path entered the baseline.

### C59 Semantic RED And GREEN

The pre-repair command is preserved at tool-log line 2532. It exited 0 but reported
`new=0` and `stale=5`. Baseline SHA-256 remained
`b71bd31738c77a2b14622ec292e0f76a4352e4fb17e084d01443f9377de61b93` before and
after that run. This receipt is the semantic RED because exit zero did not satisfy
the planned zero-stale result.

The unchanged command then ran against the five-entry shrink. Tool-log line 2549
records exit 0 and the current report plus test identity. The baseline SHA-256 was
`6728e3a55bb36e4fab643322f71c42e7db0b140abec0a19edcfd9ac93a03397c` before and
after execution.

```text
BUG022_C59_FINAL_BEGIN
6728e3a55bb36e4fab643322f71c42e7db0b140abec0a19edcfd9ac93a03397c  scripts/validate-spec-test-paths.baseline
[spec-test-paths] scanned=821 references=19476 distinctPaths=270 missingPaths=65 plannedMissing=0 baseline=65 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
C59_FINAL_EXIT=0
6728e3a55bb36e4fab643322f71c42e7db0b140abec0a19edcfd9ac93a03397c  scripts/validate-spec-test-paths.baseline
BUG022_C59_FINAL_END
```

The RED and GREEN receipts establish the requested zero-stale semantic proof. The
planning-owned C59 DoD row remains unchecked until `bubbles.plan` reconciles it.

### Directly Caused Test Repairs

| Receipt | Exit | Current result |
| --- | ---: | --- |
| 2539, C57 rollback and object integrity | 0 | One test passed. Four protected objects remained stable. Reverse and forward objects matched. Fixture residue was false. |
| 2543, C41 strict dirty-boundary regression | 0 | One test passed. Unexpected dirty paths, staged paths, and process residue were zero. |
| 2544, C60 final-shape boundary | 0 | One test passed. Thirteen protected-family mutants turned RED. Staged paths and process residue were zero. |
| 2545, regression-quality guard | 0 | One bug-fix carrier was scanned. Violations and warnings were zero. |

The carrier now protects the C59 baseline in rollback and mutation checks. It also
classifies three exact concurrent Feature-012 paths as excluded and byte-stable.
The C57 oracle now names the rollback object produced by the current carrier bytes.

### Preserved Nonzero Receipts

| Receipt | Exit | Finding |
| --- | ---: | --- |
| 2538 | 127 | A mistyped Node executable prevented C57 from starting. Line 2539 is the corrected current-byte run. |
| 2540, C54 complete carrier | 1 | The frozen discovery crossing for `tests/distributed-briefs.spec.mjs` is stale. |
| 2541, focused discovery boundary | 1 | One test failed with that same stale crossing. New crossings remained zero. |
| 2546, C55 reachability | 1 | `tests/distributed-briefs.history.load.mjs` is a new orphan. Six known orphans and twenty stale reachability entries remain visible. |
| 2547, C58 canonical selftest | 1 | 3,461 assertions passed and three failed. The failures were reachability, duplicate spec number 029, and BUG-022 certification scope progress. |
| 2548, scope-progress diagnostic | 1 | BUG-022 certification claims 53 checked and 19 unchecked items. The scope artifact has 71 checked and 1 unchecked item. |

The interrupted C58 attempt did not produce a structured receipt. The signal-isolated
replacement at line 2547 is the evidence of record. Its complete output SHA-256 is
`bbfa85e8c6d647f0dd8054fdf7510513af5e06c8ceebd14bb6f34ce42427fe5e`.

### Finding Accounting And Routing

| Finding | Disposition | Owner |
| --- | --- | --- |
| `TP-BUG022-R4-C59-ZERO-STALE-SEMANTIC-PROOF` | Addressed by lines 2532 and 2533. Planning reconciliation remains separate. | `bubbles.plan` |
| `BUG022-C59-DIRECT-C41-BOUNDARY` | Addressed by the current-byte carrier and line 2543. | `bubbles.test` |
| `BUG022-C59-DIRECT-C57-ORACLE` | Addressed by the current-byte oracle and line 2539. | `bubbles.test` |
| `BUG022-C59-DIRECT-C60-PROTECTION` | Addressed by the added spec-path baseline mutation control and line 2544. | `bubbles.test` |
| `FOREIGN-F012-DISTRIBUTED-BRIEFS-LOAD-ORPHAN` | Open. The Feature-012 command surface does not select `tests/distributed-briefs.history.load.mjs`. | `bubbles.plan` |
| `BUG022-STALE-DISTRIBUTED-BRIEFS-CROSSING` | Open. The shrink-only crossing ratchet still lists `tests/distributed-briefs.spec.mjs` after current Node declarations stopped selecting it. | `bubbles.implement` |
| `FOREIGN-SPEC-029-NUMBER-COLLISION` | Open. Two current packet paths use spec number 029. | `bubbles.plan` |
| `VALIDATE-BUG022-SCOPE-PROGRESS-DRIFT` | Open. Certification remains 53/19 while the planning artifact remains 71/1. | `bubbles.validate` |

Scope 1 remains `In Progress`. The test verdict remains non-green because C54, C55,
and C58 are nonzero. Top-level status and certification remain `in_progress`.

### C54 Stale Distributed-Briefs Crossing Implementation

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** Current authority assigns `tests/distributed-briefs.spec.mjs` only to Playwright.
Feature 012 TP-11-11 explicitly excludes it from the active Node runner command.
Historical Node receipts remain evidence and do not restore active authority.
The shared crossing ratchet therefore shrinks from nine entries to eight.
The repair changes no Playwright scenario or expectation.

The pre-change C54 receipt is [tool-log line 2553](../../../.specify/runtime/tool-calls.jsonl#L2553).
It exited 1 with tool stdout SHA-256
`bd14aab483239c0ce2f1eb7cfc24dfcc2f407627eff464e1da5450455987678a`.
The full-output capture contains 595 lines with SHA-256
`9ff772aeddf265463617585dcae035941d1fe53b98754f4173b1de7ce0c5c512`.
Its terminal refusal names one stale crossing at `tests/distributed-briefs.spec.mjs`.

The repaired C54 receipt is [tool-log line 2571](../../../.specify/runtime/tool-calls.jsonl#L2571).
It exited 0 with tool stdout SHA-256
`504de73ab3b5a0df144baa0efef521af541eb7c0c37df3364b288983f388f1ee`.
The full-output capture contains 376 lines with SHA-256
`4c311870b9321ed782242ffb1e951dc2a2de8ff3c08972e24d366339a63db215`.
The carrier reports 57 tests, 57 passes, and zero failures, cancellations, skips, or todos.

The focused authority receipt is [tool-log line 2572](../../../.specify/runtime/tool-calls.jsonl#L2572).
It exited 0 with three passes and capture SHA-256
`e54f697f1152dbca6eb444c7448efcc11fdae7ace9f4c6a41b61d4ffef6e1bf8`.
It proves zero new crossings, an active crossing refusal, and a historical zero-crossing control.

The unchanged Playwright owner receipt is [tool-log line 2573](../../../.specify/runtime/tool-calls.jsonl#L2573).
It exited 0 with 13 passes and capture SHA-256
`016356b938e7f1d6dfe7b34c42b7b3a891221a381c315709d4a3fc7e2cf9818a`.
The target object remains `a4fbbb8c5821bd1347afdbd048646d1afe1b62e0`, identical to `HEAD`.

The regression-quality receipt is [tool-log line 2574](../../../.specify/runtime/tool-calls.jsonl#L2574).
It exited 0 with zero violations and zero warnings.
Its capture SHA-256 is `5cd0cc8221c5653a4372ebff784defb0f5be831b595ec5b6c623422380871025`.

Final implementation SHA-256 values are
`83f66be555e03b3c4fe3f2d07c923a00fbcd721640cf0ec561404512e67ad166`
for the validator and
`c0ae35644030b2c4827126d696cc4d35f0d3a8525059cccb040ea8b8bbdbae23`
for the carrier. The reachability and spec-path baselines remain unchanged.
Human acceptance remains byte-identical at SHA-256
`5215702ab99c28781a97302c9215ebe92a549532f61da380fba94a9e4ebd098b`.

C55 remains assigned to `bubbles.plan` under Feature 012.
C58 retains its existing `bubbles.plan` and `bubbles.validate` assignments.
This implementation phase does not alter their receipts or ownership.

## Independent C54 Test Verification — Scenario Revision 5 {#independent-c54-test-verification-scenario-revision-5}

**Phase:** test
**Claim Source:** executed
**Executed At:** 2026-09-01T22:16:57Z
**Outcome:** `route_required`

The `tax-close-bug-022` packet was derived from the declared three-stream
scenario plan and validated at control revision 5 for session
`vscode-a66638659f347684a54d8a6f9606fa12`. No repository-binding preflight ran.
The exact C54 command then ran on validator SHA-256
`83f66be555e03b3c4fe3f2d07c923a00fbcd721640cf0ec561404512e67ad166`
and carrier SHA-256
`c0ae35644030b2c4827126d696cc4d35f0d3a8525059cccb040ea8b8bbdbae23`.

### Exact C54 Carrier

**Command:** `node --test tests/playwright-runtime.foundation.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Receipt:** [.specify/runtime/tool-calls.jsonl line 2582](../../../.specify/runtime/tool-calls.jsonl#L2582)
**Structured stdout SHA-256:** `4fc4c9803c45020ecb8e7520fe1ae26aacc1f6bec5b32daad6d8a79c4f677da6`

```text
# BUG-022 independent exact TP-BUG022-R4-C54 revision 5
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=20s 780 /opt/homebrew/bin/node --test tests/playwright-runtime.foundation.functional.mjs
exit: 0
lines: 376
sha256: cf7e1f55696582fd267a6fec309cbc2422faa7e3596175b200780c2ec7d256e9
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
[playwright-runtime] discoveredSpecs=81
[playwright-runtime] sharedImporters=81
[playwright-runtime] absoluteOverrides=0
[playwright-runtime] matcher=**/*.spec.mjs
[playwright-runtime] browserSelected=81
[playwright-runtime] nodeGlobSelected=116
[playwright-runtime] directNodeSuites=10
[playwright-runtime] frozenCrossings=8
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ Regression: SCN-BUG022-008 regex literals mentioning node:test remain helper-exempt (2.7805ms)
✔ Regression: BUG-022 final-shape matrix closes all twelve findings together (5.67875ms)
✔ Regression: SCN-BUG022-007 security repair rollback preserves source test ratchets and sentinels (272.664458ms)
✔ Regression: BUG-022 security repair contains exactly the validator and focused carrier (207.737042ms)
✔ Regression: SCN-BUG022-007 final-shape repair rollback preserves source test ratchets and history (95.597458ms)
✔ Regression: BUG-022 final-shape repair contains exactly the validator and focused carrier (35.991959ms)
✔ Regression: SCN-BUG017-03 candidate classifications require distinguishing evidence (0.924875ms)
✔ Regression: SCN-BUG017-06 cost ratio evaluator rejects a known over-bound comparison (83.867291ms)
✔ Regression: SCN-BUG017-07 disclosure names its platform project symptom and intermittence (0.346125ms)
✔ Regression: SCN-BUG017-08 disclosure cannot replace the system-chrome worker pin (0.09475ms)
✔ Regression: SCN-BUG017-11 fallback preserves lifecycle failure visibility and browser parity (1.248833ms)
✔ Regression: SCN-BUG017-11 fallback selection requires rejected candidate and hash-verified rollback (82.218334ms)
ℹ tests 57
ℹ suites 0
ℹ pass 57
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5851.947334
```

### Directly Coupled Checks

| Check | Receipt | Exit | Current signal |
| --- | ---: | ---: | --- |
| Linked-test resolution | 2581 | 0 | 38 references resolved; no broken linked target |
| Active, historical, and runner-disjointness slice | 2583 | 0 | 3 passed; active crossing refused; historical control reported zero crossings |
| Browser source lock | 2584 | 0 | Exact Playwright 1.61.1 graph; all 16 adversarial source mutations rejected |
| Checkout-local runner identity | 2586 | 0 | `Version 1.61.1` |
| Distributed-briefs Playwright owner suite | 2587 | 0 | 13 passed through the committed `system-chrome` project |
| Bugfix regression-quality guard | 2588 | 0 | 0 violations, 0 warnings, 1 adversarial carrier |
| C54 title and escape audit | 2590 | 0 | 15 titles occur once; every body has assertions; zero top-level returns or disabled markers |
| Post-execution identity preservation | 2592 | 0 | Validator, carrier, both ratchets, test plan, and human acceptance retained their pre-run hashes |

The first runner-identity wrapper used an unavailable `/opt/local/bin/npx` and
recorded exit 127 at line 2585. The corrected repository command at line 2586
is the accepted identity proof. The first title audit at line 2589 extended two
test slices beyond their top-level callback terminators and misclassified nested
helper returns. The body-bounded replacement at line 2590 retained every title
and assertion check while reporting zero direct bailout. An earlier shared-terminal
focused attempt was interrupted before a local receipt existed. Line 2583 is its
single accepted replacement.

### Test Verdict And Route

C54 is independently GREEN on unchanged implementation bytes. The stale
distributed-briefs crossing finding is verified closed. C55 remains unchecked
and assigned to `bubbles.plan` because its latest current-byte receipt at line
2546 reports `tests/distributed-briefs.history.load.mjs` as a new orphan. C58
and its existing owner assignments remain unchanged. The planning-owned C54
status mirrors in `test-plan.json` and `scenario-manifest.json` retain their
pre-test values. `bubbles.plan` must reconcile those mirrors while handling
C55. Certification, human acceptance, historical evidence, and unrelated dirty
paths remain unchanged.

## C55 Direct-Node Family Verification — Scenario Revision 5 {#c55-direct-node-family-verification-scenario-revision-5}

**Phase:** test
**Claim Source:** executed
**Execution Window:** 2026-09-01T22:43:26Z through 2026-09-01T23:08:14Z
**Outcome:** `route_required`

The `tax-close-bug-022` packet was derived from the declared three-stream
scenario plan and validated at control revision 5 for session
`vscode-a66638659f347684a54d8a6f9606fa12`. No repository-binding preflight ran.
The test was authored before production changed. Tool-log line 2606 records the
expected RED because current production had no `direct-node-script` declaration.
The final focused GREEN is tool-log line 2621.

### Exact TP-11-14 Load Family

**Command:** `for test_file in tests/distributed-briefs*.load.mjs; do node "$test_file" || exit 1; done`
**Exit Code:** 0
**Claim Source:** executed
**Receipt:** [.specify/runtime/tool-calls.jsonl line 2618](../../../.specify/runtime/tool-calls.jsonl#L2618)
**Structured stdout SHA-256:** `2c0b74f17b0fc37ee1187e7d6f754e13dacf804e302529bf0b8142decc3237a9`

```text
Load: 31-day four-window history stays bounded to 124 authoritative references
  ✓ drove 124 runs (31 days x 4 windows == 124)
  ✓ runs partition holds exactly 124 authoritative references (got 124)
  ✓ every partition stays in the single canonical month 2026-07
  ✓ largest JSONL row 355B within the 64 KiB row budget
  ✓ largest monthly partition 43927B within the 4 MiB partition budget
  ✓ history index 33237B within the 1 MiB index budget
  ✓ index regeneration is idempotent under load
  ✓ final run validates append-only (ok)

================================================
history load: 8 passed, 0 failed
================================================
```

The load program stayed byte-identical at SHA-256
`f83b4a5798c549ec36fc1a70412c6228ddf25aef9a6891da0717ac53b0c6159a`.

### Exact C55 Production Reachability

**Command:** `node scripts/validate-test-file-reachability.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Receipt:** [.specify/runtime/tool-calls.jsonl line 2619](../../../.specify/runtime/tool-calls.jsonl#L2619)
**Structured stdout SHA-256:** `85774bf43b9868eafdd8baeb59928f782d29a99e816d01a20a65a6a7bbe62844`
**Full-output SHA-256:** `38bb6f7e85851eb679e5b3426b7f06ad45530509d49c4f710e1108f7e5205304`

```text
# BUG-022 final exact C55 production reachability GREEN
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=20s 780 /opt/homebrew/bin/node scripts/validate-test-file-reachability.mjs
exit: 0
lines: 56
sha256: 38bb6f7e85851eb679e5b3426b7f06ad45530509d49c4f710e1108f7e5205304
207 test file(s) in tests/, 23 active glob(s), 50 historical site(s), 0 classification error(s) from 10044 artifact(s), 190 reachable, 11 exempt (shared-helper-module), 6 orphan(s)
glob **/*.spec.mjs [playwright-testMatch] declared at 1 site(s), first playwright.config.mjs:4
glob tests/*.functional.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:151
glob tests/*.test.mjs [node-test-argument] declared at 1 site(s), first .specify/memory/agents.md:152
glob tests/distributed-briefs*.load.mjs [direct-node-script] declared at 4 site(s), first specs/002-distributed-tool-briefs-and-history/scopes/07-bounded-history-and-legacy-migration/scope.md:87
6 known orphan(s) frozen in scripts/validate-test-file-reachability.baseline
```

The six remaining orphans are the unchanged frozen baseline. No new orphan was
reported. The baseline stayed byte-identical at SHA-256
`dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73`.
The crossing ratchet stayed at eight entries.

### Focused And Broader Regression

| Check | Receipt | Exit | Current result |
| --- | ---: | ---: | --- |
| Direct runner identity | 2621 | 0 | One focused test passed. Active plain-Node, `node:test`, and Playwright identities stayed distinct. The identical report command remained historical. |
| Complete carrier | 2617 | 0 | 58 tests passed. Failed, cancelled, skipped, and todo counts were zero. Full-output SHA-256 was `7ae1cedebc0b4e927085dcf237559047cda7cfced4b7e60ea9dc031979d57a14`. |
| Integrity and quality | 2622 | 0 | Regression-quality violations and warnings were zero. Skip markers were zero. Diff checking passed. Protected hashes and eight crossing entries remained stable. |
| Tier 1 and Test profile | 2623 | 0 | Artifact lint, linked-test resolution, execution-substate, implementation-reality, and technical-prose checks passed. |

Final implementation identities are SHA-256
`6c763237506bfeb0b99a26a86b7075859a4ae84d5220bbcac7aa84cefd03426f`
for the validator and
`5deb02599f1dfae6789df58b3d93379578f1677f39bd0dcb12d5882ecadbe663`
for the carrier. Five historical rollback layers retain their original object
ratchets and pass inside the 58-test carrier.

### Preserved Failed Attempts

Tool-log line 2610 records the first exact C55 run after family recognition. It
found the direct family but rejected the typed BUG-022 runner mirror. Lines 2614
through 2616 record the carrier and rollback-adapter repair loop. Line 2620 is a
bounded timeout from a batch that remained active after its external caller
expired. Its exact process tree was terminated before the final focused and
carrier runs. These nonzero receipts remain append-only and do not override
lines 2617 through 2622.

### Finding Accounting And C58 Route

| Finding | Disposition | Owner |
| --- | --- | --- |
| `FOREIGN-F012-DISTRIBUTED-BRIEFS-LOAD-ORPHAN` | Addressed. TP-11-14 passed and exact C55 now selects the load family as `direct-node-script`. | `bubbles.test` |
| `TP-BUG022-R4-C55` | Addressed by lines 2618, 2619, 2621, and 2622. | `bubbles.test` |
| `PLAN-BUG022-C55-STRUCTURED-EVIDENCE-SYNC` | The plan-owned machine Test Plan still carries the pre-test C55 state. | `bubbles.plan` |
| `TP-BUG022-R4-C58` | Unresolved. No C58 rerun occurred in this C55-only invocation. | `bubbles.test` after owner repairs |
| `FOREIGN-SPEC-029-NUMBER-COLLISION` | Preserved under its existing owner route. | `bubbles.plan` |
| `VALIDATE-BUG022-SCOPE-PROGRESS-DRIFT` | Preserved under its existing owner route. | `bubbles.validate` |

Scope 1 remains `In Progress` with C58 unchecked. Top-level status and
certification remain `in_progress`. Human acceptance, historical receipts,
Feature 012 planning bytes, the load program, both ratchets, and unrelated dirty
work remain unchanged.

## C58 Current-Byte Test Verification At Scenario Revision 6 {#c58-current-byte-test-verification-at-scenario-revision-6}

**Phase:** test
**Claim Source:** executed
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 0

The `tax-close-bug-022` packet validated at control revision 6 with session
`vscode-a66638659f347684a54d8a6f9606fa12` and control-path digest
`sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.
Linked-test resolution then resolved 38 references. No repository-binding
preflight ran.

### Semantic RED And Test-Owned Repair

Tool-log line 2625 records the exact C58 command on the pre-repair current
bytes. The process exited 0, but it produced only 3,464 passing assertions.
That is one below the preserved 3,465 assertion floor, so the receipt is a
semantic RED rather than C58 completion. Its 3,972-line complete output has
SHA-256 `8e5ed38724565d32671a329875f7758e79fc188d93165b6e8d8780acc45db8bc`.

The current `scripts/selftest.mjs` delta had removed the assertion from a
three-case malformed output-budget loop while adding two other assertions.
The test-owned repair restored only that named-refusal oracle. The repaired
selftest SHA-256 is
`f81d281d85073825d5ef93f6d608aac10d3a29529c05a9bb143fcb64f3901852`.

### Current C58 GREEN

Tool-log line 2626 records the unchanged exact C58 command after the oracle
repair. The structured stdout SHA-256 is
`c9b104bc0d0015f3939106d6a5be76564a102a01af64bacf4425f0482be88afd`.
The evidence-capture block directly reported:

```text
# BUG-022 C58 canonical repository selftest after test-oracle repair
$ node scripts/selftest.mjs
exit: 0
lines: 3975
sha256: 2a8be9d36c7caf24a45fcf0020536cc367620834889ceb4455e2e7889e33380d
--- first 20 ---

Step 1 security - escaped model sinks and CSP on every page
  PASS every shipped HTML page carries a Content-Security-Policy meta
  PASS all pages use one identical CSP instead of drifting per page
--- omitted 3935 line(s); sha256 above covers the full output ---
--- last 20 ---
  PASS TB-SEC-03-01: the probe anchors its repository from the checkout it is RUN IN before any target is examined
  PASS TB-SEC-03-02: a --file in another Git checkout is refused at registration with the dirty-target exit

================================================
Research-Lab self-test: 3467 passed, 0 failed
================================================
```

The final count exceeds the preserved floor by two. Receipt 2547 remains the
preserved nonzero C58 history; receipt 2625 remains the current-session semantic
RED. Neither receipt was rewritten or removed.

### Current Input Closure

| Input | SHA-256 |
| --- | --- |
| `scripts/selftest.mjs` | `f81d281d85073825d5ef93f6d608aac10d3a29529c05a9bb143fcb64f3901852` |
| `scripts/validate-test-file-reachability.mjs` | `6c763237506bfeb0b99a26a86b7075859a4ae84d5220bbcac7aa84cefd03426f` |
| `scripts/validate-test-file-reachability.baseline` | `dbab8720445e1fdc267e381f49b1bee76f49c7e345c18ef669bccf85a820fd73` |
| `tests/playwright-runtime.foundation.functional.mjs` | `5deb02599f1dfae6789df58b3d93379578f1677f39bd0dcb12d5882ecadbe663` |
| `scopes.md` before evidence append | `c05af591842dff3a5985a8e6fd41abdc1fd1c023338a19f22268f62e67c67fb0` |
| `test-plan.json` | `1d7fd1e8681ff458bf72e096d39e3bed5bb983d3a9befb640543ed70232a3649` |
| `state.json` | `68e92c3e3bab52bc6b812b134739252473e602636a221aa867c838cc25902f52` |
| `scenario-manifest.json` before evidence-link update | `ad84447eab2853bceb8b958503b2384887d0f144ea4c3d786557526122dced71` |
| `report.md` before this append | `67625de2d8bbd70f9348472584b5d4c5f35fe23798964d1815345af7569c4f94` |
| scenario plan | `898b69a6410e773975ff4428c5188c621d7a19d744ede6a1e869f75cca90c856` |

### Finding Accounting And Owner Routing

| Finding | Disposition | Owner |
| --- | --- | --- |
| `C58-ASSERTION-BASELINE-REGRESSION` | Addressed by restoring the three-case named-refusal oracle and receipt 2626. | `bubbles.test` |
| `TP-BUG022-R4-C58` | Addressed by receipt 2626 at 3,467 passed and 0 failed. | `bubbles.test` |
| `PLAN-BUG022-C58-MIRROR-SYNC` | Machine Test Plan and plan-owned count/parity prose still describe C58 as unchecked. | `bubbles.plan` |
| `VALIDATE-BUG022-CERTIFICATION` | Certification and terminal scope status remain unchanged. | `bubbles.validate` |

No certification field, scope status, human-acceptance record, historical
receipt, source implementation, or unrelated dirty path changed in this test
slice.

## Final Validate-Owned Completion Mirror Reconciliation — Scenario Revision 6 {#final-validate-owned-completion-mirror-reconciliation-scenario-revision-6}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Current execution proves the DoD count mirror is 72 checked
and 0 unchecked, but it does not prove terminal completion. The asserted done
transition remains blocked by receipt-derived scenario state, plan-owned scope
status, required phase completion, and human acceptance. Validation therefore
reconciled only the nonterminal count mirror.

The dispatched `tax-close-bug-022` packet passed `validate-packet` at session
`vscode-a66638659f347684a54d8a6f9606fa12`, control revision 6, and control-path
digest `sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.
No repository-binding preflight ran.

### State Before And After

| Field | Before | After |
| --- | --- | --- |
| Top-level status | `in_progress` | `in_progress` |
| Certification status | `in_progress` | `in_progress` |
| Scope 1 certification status | `in_progress` | `in_progress` |
| Scope 1 DoD counts | 71 checked, 1 unchecked | 72 checked, 0 unchecked |
| `certification.completedScopes` | `[]` | `[]` |
| Top-level `completedScopes` | `[]` | `[]` |
| `certifiedCompletedPhases` | `[]` | `[]` |
| Human acceptance | Five checklist items unchecked; placeholder record | Unchanged |

### Executed Validation Evidence

| Tool-log row | Command | Exit | Observed result |
| --- | --- | ---: | --- |
| 2633 | G070 pre-certification goal-fidelity guard | 0 | `PASS boundary=pre-certification` |
| 2641 | Traceability guard | 0 | 8 scenarios mapped, 0 warnings; full-output SHA-256 `5c7a8cfc6f7e0a59840947a648701ee86420068bf936797edd2c3fc309f34532` |
| 2643 | Asserted done transition guard | 1 | Failed gates `G060`, `G022`, `G027`, `G136`; target revision `sha256:4875a8ef89d7e75985a7570fd27e880da51db7f2bd02547357acf1777cda63a2`; full-output SHA-256 `83f7066a0919449543d73d9f12fa6553c30c98e257d3452c1d6fe329f9a73f73` |
| 2644 | Certifiable scenario-state resolver | 1 | All eight `SCN-BUG022-*` contracts remain `PLANNED`; `certifiable: no`; full-output SHA-256 `30d6e16e727cf4846f42d050184da89620d323e2177fa555d1bea71062993557` |
| 2645 | Implementation reality scan | 0 | 0 violations and 1 known design-fallback warning; full-output SHA-256 `a0033397f6c850fb3c330ed3cca69325a237225c3ad2d139dd43213602814673` |
| 2646 | Artifact freshness guard | 0 | 0 failures, 0 warnings; full-output SHA-256 `3fd5e1d8e7893734780b0e0d2dea74ca0d31a74aeaf163042002f82d25a0abbe` |
| 2647 | Changed-spec done audit | 0 | One in-progress packet scanned; lint passed; terminal checks correctly skipped |
| 2648 | Bugfix regression-quality guard | 0 | 0 violations, 0 warnings, adversarial signal present |
| 2650 | Scope DoD progress validator | 0 | 86 claims, 72 agreeing, 14 frozen, 0 new drift, 0 stale; full-output SHA-256 `ecb9a6062e06eb00fe69297273b8037196d5479a2cb7ba248f316efd0b43a869` |
| 2651 | Exact canonical repository selftest | 0 | 3,467 passed, 0 failed; full-output SHA-256 `63a4ccb5219ff34c78f02c8cf67cf24f95db00e215017d8fda729f089977d9d3` |

Artifact lint also passed on the reconciled shape. The handoff-cycle utility
returned exit 2 because a bug packet contains no `.agent.md` files; that check
is not applicable to this target and supplies no completion evidence.

### Outcome Contract Verification

| Field | Declared | Current evidence | Status |
| --- | --- | --- | --- |
| Intent | Separate active declaration authority from historical receipts | G070 passed and the canonical selftest passed | Demonstrated mechanically |
| Success Signal | Preserve history, active authority, fail-closed candidates, reachable Node families, protected crossings, and the Feature 008 consumer | Current C58 and linked report receipts are green, but scenario states are not receipt-derived at the current revision | Not certifiable |
| Hard Constraints | Preserve authority, history, ratchets, protected artifacts, and the change boundary | Current regression-quality, reality, freshness, and canonical selftest checks are green | Demonstrated by current checks and cited receipts |
| Failure Condition | No authority leak, reachability loss, hidden candidate, weakened crossing, orphan debt, or excluded change | The canonical selftest is green; the terminal guard still finds process-state blockers | Runtime condition not observed; certification condition blocked |

### Finding Accounting

| Finding | Current disposition | Owner |
| --- | --- | --- |
| `VALIDATE-BUG022-SCOPE-PROGRESS-DRIFT` | Addressed by the 72/0 nonterminal count mirror and current scope-progress plus canonical selftest receipts | `bubbles.validate` |
| `PLAN-BUG022-C58-MIRROR-SYNC` | `scopes.md` still marks Scope 1 `In Progress`, while `test-plan.json` and current planning prose retain the pre-C58 state | `bubbles.plan` |
| `BUG022-G060-SCENARIO-STATE-RECEIPTS` | All eight contracts remain `PLANNED`; current receipts do not satisfy the required certifiable state set | `bubbles.test` after planning reconciliation |
| `BUG022-PHASE-CHAIN-COMPLETION` | Required `security`, `validate`, and `audit` phase completion is absent | Owning phase agents through the active runner |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Five human checklist items remain unchecked and the Human Acceptance Record is still the untouched placeholder | Human owner only |

Certification remains `in_progress`. No terminal status, acceptance record,
completion timestamp, certified phase, source file, test file, historical
failure, or unrelated dirty path was changed.

## Plan-Owned Scenario Receipt Handoff At Revision 6 {#plan-owned-scenario-receipt-handoff-revision-6}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Six exact persistent tests produced scenario-state RED
receipts. Check 43 rejects their preimplementation source closure as stale.
Two scenarios lack a valid RED mechanism under the current plan. The resolver
also rejects immutable earlier GREEN receipts after the new RED anchors.

The `tax-close-bug-022` node packet passed repository packet validation. The
validated session is `vscode-a66638659f347684a54d8a6f9606fa12`. The control
revision is 6. The control-path digest is
`sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.
No repository-binding preflight ran.

### RED Receipt Results

The RED fixture retained committed preimplementation source at revision
`fa9be9ddcd330220171c7e374071be6856adc677`. It overlaid only the current
persistent functional carrier. Every receipt hashed the validator, carrier,
Test Plan, and scenario manifest.

| Scenario | Test Plan row | Tool-log row | Exit | Stdout SHA-256 | Resolver result |
| --- | --- | ---: | ---: | --- | --- |
| `SCN-BUG022-001` | `TP-BUG022-F08` | 2668 | 1 | `22cb0d4bd666b6448bbcc565148a4fe6db93a15697d33bc1b35811c7eb6b9b4a` | `RED_VERIFIED` |
| `SCN-BUG022-002` | `TP-BUG022-R4-F43` | 2669 | 1 | `8f06ab58d84dcd45adf90083acf7c211b1b854afc4d89806a3607d77ec5cb5e8` | `RED_VERIFIED` |
| `SCN-BUG022-003` | `TP-BUG022-F10` | 2670 | 1 | `e29c68747f3fbce6afcfeb0eea0300221ff61b1a8abd261cb714e95e043a179d` | `RED_VERIFIED` |
| `SCN-BUG022-004` | `TP-BUG022-R4-F50` | 2671 | 1 | `2fdacb3743fd2a80674e17192232086a92887199ba25018b58c9948dc5159da2` | `RED_VERIFIED` |
| `SCN-BUG022-005` | `TP-BUG022-R4-F45` | 2672 | 1 | `ba164b698c2cf8d2ea446613bc603a8f5a9d704dad2a549afca066b6bec168be` | `RED_VERIFIED` |
| `SCN-BUG022-006` | `TP-BUG022-R4-F47` | 2673 | 1 | `e74093fe130ff6cb7f28868138f6251c6c9c749d937779f4654f2b6e4ace5f40` | `RED_VERIFIED` |
| `SCN-BUG022-008` | `TP-BUG022-R4-F51` | 2674 | 0 | `486051ca4e0bd7900afe13377d725c826322e870cea3f9b5096324b0bf1dccb3` | Invalid RED |

Rows 2668 through 2673 each selected one exact title. Representative reruns
reported 49 declarations, 48 skipped declarations, and only the selected title
as failed. The scenario-state resolver accepts these six nonzero rows as RED.
Check 43 does not admit them for transition evidence, as recorded below. Row
2674 remains immutable evidence that F51 did not discriminate the
preimplementation source. It must not be relabeled as RED.

No RED receipt exists for `SCN-BUG022-007`. Its selected F20 test exercises an
active runner crossing before a baseline write. The manifest control instead
requires baseline-leaf and scripts-parent symlink mutations. Binding F20 to
that control would claim behavior the selected test does not execute.

### Post-RED Scenario Resolution

**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-022-historical-report-declaration-leak --source-revision fa9be9ddcd330220171c7e374071be6856adc677 --format json`
**Exit Code:** 1
**Claim Source:** executed
**Complete stdout:** 109,647 bytes, SHA-256
`26cac9ceff913eebf4be4c68ddc56b4fc2d32e8ea5c909c59fef203e3666c7ee`.

| Scenario | Highest derived state | Missing states |
| --- | --- | --- |
| `SCN-BUG022-001` | `RED_VERIFIED` | `IMPLEMENTED`, `GREEN_TARGETED`, `REGRESSION_GREEN` |
| `SCN-BUG022-002` | `IMPLEMENTED` | `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-003` | `IMPLEMENTED` | `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-004` | `IMPLEMENTED` | `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-005` | `IMPLEMENTED` | `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-006` | `IMPLEMENTED` | `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-007` | `PLANNED` | `RED_VERIFIED`, `IMPLEMENTED`, `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |
| `SCN-BUG022-008` | `PLANNED` | `RED_VERIFIED`, `IMPLEMENTED`, `GREEN_TARGETED`, `GREEN_LIVE`, `REGRESSION_GREEN` |

The `IMPLEMENTED` states for scenarios 002 through 006 derive from earlier
same-revision implement rows. Those rows predate the new RED receipts. This
test phase does not reinterpret them as the required post-RED owner handoff.

The resolver reports 14 blocking refusals. Seven are
`SCS-TEST-SUBSTITUTED`. Four are `SCS-CONTROL-SUBSTITUTED`. Two are
`SCS-GREEN-WITHOUT-RED`. One is `SCS-RED-NOT-FAILING` for row 2674.
The resolver examines every same-revision GREEN after selecting a RED anchor.
Earlier GREEN rows with other test or control identities therefore remain
blocking in the append-only log. A fresh matching GREEN cannot remove them.

### RED Receipt Freshness Conflict

**Command:** `bash .github/bubbles/scripts/evidence-receipt-check.sh --log /private/tmp/bug022-red-receipts-2668-2674.jsonl --repo-root . --strict`
**Exit Code:** 1
**Claim Source:** executed

The canonical checker reported 7 current receipts, 7 input closures, 0 valid
receipts, 7 stale receipts, and 0 unknown receipts. Each stale reason is
`input hash differs: scripts/validate-test-file-reachability.mjs`. A targeted
hash comparison also confirmed that the carrier, Test Plan, and scenario
manifest hashes remain current. Each receipt records preimplementation SHA-256
`fc0414647a567058d41142577bc67ffc3f2d32507ab77ffd88e1b8c244588873`.
The repaired main tree has SHA-256
`6c763237506bfeb0b99a26a86b7075859a4ae84d5220bbcac7aa84cefd03426f`.

This difference is the RED proof. The generic receipt checker also defines
that difference as stale because it compares every closure with current main
tree bytes. The current framework provides no RED-phase exception or
preimplementation closure type. Recording repaired source in the RED closure
would misstate the bytes that the failing test executed.

### Finding Accounting

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG022-SCENARIO-RED-001-006` | Rows 2668 through 2673 derive `RED_VERIFIED`, but Check 43 rejects their preimplementation source hashes. | Upstream Bubbles framework owner |
| `BUG022-SCN007-RED-CONTROL-MISMATCH` | The selected F20 identity and manifest control prove different mutations. No RED was recorded. | `bubbles.plan` |
| `BUG022-SCN008-F51-NONDISCRIMINATING` | F51 passed against committed preimplementation source. Row 2674 is rejected by `SCS-RED-NOT-FAILING`. | `bubbles.plan` |
| `BUG022-APPEND-ONLY-SUBSTITUTION-DEADLOCK` | Prior GREEN rows become permanent substitution refusals after a later RED. Preserving those rows prevents clean resolution. | Upstream Bubbles framework owner |
| `BUG022-RED-FRESHNESS-CONFLICT` | Check 43 rejects the source difference that makes each RED genuine. Falsifying the closure would be fabrication. | Upstream Bubbles framework owner |
| `BUG022-FRESH-IMPLEMENT-RECEIPTS` | Fresh owner receipts remain blocked until the RED admission conflicts are resolved. | `bubbles.implement` |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Five checklist items and the acceptance record remain human-owned and unchanged. | Human owner |

No implement, targeted GREEN, LIVE, regression, certification, or human
acceptance phase is claimed by this handoff. No source, test, Test Plan,
scenario contract, state field, protected receipt, or unrelated dirty path was
changed.

## Scenario Receipt Integrity Repair At Revision 6 {#scenario-receipt-integrity-repair-revision-6}

**Phase:** test
**Executed:** YES
**Claim Source:** executed
**Result:** RED receipt integrity repaired. Scenario advancement remains blocked.

The `tax-close-bug-022` packet passed validation without repository-binding
preflight. It bound repository alias `research-lab` to session
`vscode-a66638659f347684a54d8a6f9606fa12`. It required control revision 6 and
digest `sha256:f10550b21098695e1ea28bf43c791c31fb8c52b8cd6cad3f680bcd516f6db7e4`.

### Earlier RED Attempt Adjudication

The retained runner logs distinguish behavior failures from setup failures.
Rows 2668, 2669, 2670, and 2672 reached their intended assertions. Rows 2671
and 2673 failed before their selected assertions could prove the planned
behavior. Row 2674 passed and remains an invalid RED receipt.

| Scenario | Prior row | Verdict | Observed discriminator |
| --- | ---: | --- | --- |
| `SCN-BUG022-001` | 2668 | Behavior-valid historical RED | The pattern-only map returned one declaration instead of two. |
| `SCN-BUG022-002` | 2669 | Behavior-valid historical RED | The direct arbitrary wrapper disappeared while the direct control remained active. |
| `SCN-BUG022-003` | 2670 | Behavior-valid historical RED | The shared production disjointness function was absent. |
| `SCN-BUG022-004` | 2671 | Invalid for receipt integrity | A missing exported class caused an `instanceof` `TypeError` before the selected symlink assertion completed. |
| `SCN-BUG022-005` | 2672 | Behavior-valid historical RED | Task-list candidates disappeared before classification. |
| `SCN-BUG022-006` | 2673 | Invalid for receipt integrity | A missing parser export caused a `TypeError` before the quoted-pipe assertion completed. |
| `SCN-BUG022-007` | none | Missing | No RED receipt existed. |
| `SCN-BUG022-008` | 2674 | Invalid RED, preserved | The selected F51 test exited 0 and discriminated nothing. |

The first replacement set at rows 2675 through 2682 remains immutable. A
later F20 test-only correction changed the carrier hash. The final current set
therefore supersedes those rows without deleting or relabeling them.

### Persistent Mutation Mechanism

The focused carrier now supports eight named RED controls through
`BUG022_SCENARIO_RED_CONTROL`. Each control copies the current validator into
an ephemeral directory. It applies one bounded mutation to that copy and
imports only the copy. Every run prints `productionSourceUnchanged=true`.

F20 also executes the existing F32 baseline controls. Its RED output reports a
baseline-leaf refusal, a scripts-parent refusal, and a successful regular
shrink. It then removes runner disjointness only from the temporary validator.
The crossing subprocess exits 0 and reports `verdictBeforeWrite=false`. The
outer F20 assertion exits 1 because the crossing should have been refused.

The final carrier contains no editor diagnostic. No production file changed.
This invocation did not run an independent residue scan after the final batch.

### Final Current RED Receipts

Every row below cites source revision
`fa9be9ddcd330220171c7e374071be6856adc677`. Every binding exactly matches its
planned test title, claim, negative control, and scenario implementation refs.
Every stderr hash is the empty-stream SHA-256
`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

| Scenario | Test Plan row | Tool-log row | Exit | Tool-log stdout SHA-256 | Validity signal |
| --- | --- | ---: | ---: | --- | --- |
| `SCN-BUG022-001` | `TP-BUG022-F08` | 2685 | 1 | `abe603acb51cee2c441418605d60d8f37c0d827fd217361a2dd4d2579abf50d1` | One declaration replaced the required Node and Playwright pair. |
| `SCN-BUG022-002` | `TP-BUG022-R4-F43` | 2686 | 1 | `2e05b57801bd8b18c195b9443660de1662c2f32bcac00da5ac195cc623616cfd` | The wrapped site was absent, the direct control remained, and the execution canary stayed absent. |
| `SCN-BUG022-003` | `TP-BUG022-F10` | 2687 | 1 | `4502068f10c8f4a2e29011295fc8face36ebd6b159195c21e7a45651725057ee` | The typed shared disjointness function was unavailable. |
| `SCN-BUG022-004` | `TP-BUG022-R4-F50` | 2688 | 1 | `48d48bfe26a294afa8d11c77ce5ca592fb790acc79170187dd06a106f3602e04` | The regular plan stayed active, but the escaped directory produced no refusal. |
| `SCN-BUG022-005` | `TP-BUG022-R4-F45` | 2689 | 1 | `50d775c721c428ff7635539b5e317fa46de33c08b0db8fc758a25208445c10f0` | Two candidates appeared where three equivalent task-list forms were required. |
| `SCN-BUG022-006` | `TP-BUG022-R4-F47` | 2690 | 1 | `c129354f79ca5f3f03b32bfb2fe2e130f6b65a58eba65464b294335b3a7d146a` | Direct parsing retained the glob, but table parsing returned no quoted-pipe declaration. |
| `SCN-BUG022-007` | `TP-BUG022-R4-F20` | 2691 | 1 | `0bfe512a26338725721884f63a7b8602d1e813be0d9ca9c2105ad0553e09532b` | All symlink controls passed, then the active crossing reached exit 0 before the write boundary. |
| `SCN-BUG022-008` | `TP-BUG022-R4-F51` | 2692 | 1 | `8b62c2125fc797297a671cc6d1287d2ff5fa5766de42468b369aee9a39278f44` | Node executed the file, but reachability marked it helper-exempt and not orphaned. |

The final receipt integrity comparison exited 0. It required eight rows, eight
exit-1 results, and exact identity, control, claim, revision, and implementation
refs. It also required four non-null input hashes per row.

| Input | SHA-256 in every final receipt |
| --- | --- |
| `scripts/validate-test-file-reachability.mjs` | `6c763237506bfeb0b99a26a86b7075859a4ae84d5220bbcac7aa84cefd03426f` |
| `tests/playwright-runtime.foundation.functional.mjs` | `9877f64beef3eeae2ef84c66be89114df54ab71bd151a69701d60be78ed6882b` |
| `test-plan.json` | `bf139833d00f161b6b05b86d8af05e3adf4b3bed640355d55e790bc1a8027578` |
| `scenario-manifest.json` | `57ff52a3f873d46a47948bacb122324b710057d99cef1e89361a4565eece0942` |

### Final Scenario-State Resolution

**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-022-historical-report-declaration-leak --format json`
**Exit Code:** 1
**Claim Source:** executed
**Complete output SHA-256:** `8a710d9de9ef470053191309dcad9a8fe2f2bc44d04ba0742652e8fa2c081000`

The resolver read eight scenarios at source revision
`fa9be9ddcd330220171c7e374071be6856adc677`. It returned no requested-state
unsatisfied rows because this invocation did not use `--require`. It returned
`certifiable: null` and 34 blocking refusals.

| Scenario | Highest state | Current exact-chain result |
| --- | --- | --- |
| `SCN-BUG022-001` | `RED_VERIFIED` | No current-revision implement receipt follows this RED. |
| `SCN-BUG022-002` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-003` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-004` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-005` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-006` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-007` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |
| `SCN-BUG022-008` | `IMPLEMENTED` | Earlier implement evidence exists, but no GREEN matches the selected test and control. |

The 34 blockers comprise 28 `SCS-TEST-SUBSTITUTED` refusals, five
`SCS-CONTROL-SUBSTITUTED` refusals, and one `SCS-RED-NOT-FAILING` refusal.
The final refusal belongs to preserved row 2674. The installed resolver has no
append-only receipt supersession mechanism. A valid later RED cannot erase or
adjudicate an earlier exit-zero RED. It also treats every same-scenario GREEN
with another planned discriminator as a permanent substitution refusal.

### Revision 6 Receipt Dispositions

| Finding | Disposition | Required owner |
| --- | --- | --- |
| `BUG022-RED-RECEIPT-INTEGRITY-001-008` | Addressed by final rows 2685 through 2692. | `bubbles.test` |
| `BUG022-PRIOR-RED-004-006` | Addressed by behavior-specific replacements at rows 2688 and 2690. | `bubbles.test` |
| `BUG022-SCN007-RED-CONTROL-MISMATCH` | Addressed by the persistent F20 control and row 2691. | `bubbles.test` |
| `BUG022-SCN008-F51-NONDISCRIMINATING` | Addressed by row 2692. Preserved row 2674 remains invalid RED history. | `bubbles.test` |
| `BUG022-APPEND-ONLY-SUBSTITUTION-DEADLOCK` | Unresolved. The resolver preserves 34 blocking refusals after valid replacements. | Upstream Bubbles framework owner |
| `BUG022-EXACT-CHAIN-IMPLEMENT-RECEIPTS` | Unresolved. The planned post-RED implementation receipt sequence did not run. | `bubbles.implement` |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Unresolved and unchanged. Five checklist items remain human-owned. | Human owner |

This repair records no implement, targeted GREEN, LIVE, regression,
certification, scope-status, or human-acceptance change. It does not edit the
scenario manifest after receipt capture because that would invalidate the
recorded manifest hash.

## Current Validate Receipt-Lifecycle Decision - Session 7FBA {#current-validate-receipt-lifecycle-decision-session-7fba}

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Current execution confirms aggregate repository health but
also reproduces the installed scenario resolver's append-only substitution
deadlock. Aggregate selftest success cannot certify any individual scenario.
The asserted terminal guard therefore remains the controlling decision, and no
certification or completion mirror advances.

### Repository Authority And Current Bytes

The inherited `tax-close-bug-022` packet passed `validate-packet` against host
session `vscode-7fbaa0072aa19f2dad3c4e8b6569c268`, control revision 1, and
control-path digest
`sha256:091ebb74a3dc57bfab99a63219b3f1e4662c1e5f3cea94fafc5dd801352f47ac`.
The scenario was transformed in memory so every node used the current session,
revision, digest, and node-specific decision ID. Both transformed JSON and the
packet reached the validator through file descriptors. No scenario rewrite and
no repository-binding preflight occurred.

The block below is a PII-safe projection of the observed packet result. It
redacts only the local absolute repository root.

```text
REPOSITORY PACKET SCOPED actionable=true repository=research-lab root=<repo-root> decision=rb:vscode-7fbaa0072aa19f2dad3c4e8b6569c268:1:node:tax-close-bug-022 revision=1 scopeKind=goal-node scopeId=tax-close-bug-022
REPOSITORY_BINDING_VALIDATE_EXIT=0
HEAD=fa9be9ddcd330220171c7e374071be6856adc677
validatorSha256=6c763237506bfeb0b99a26a86b7075859a4ae84d5220bbcac7aa84cefd03426f
carrierSha256=9877f64beef3eeae2ef84c66be89114df54ab71bd151a69701d60be78ed6882b
scenarioManifestSha256=57ff52a3f873d46a47948bacb122324b710057d99cef1e89361a4565eece0942
testPlanSha256=bf139833d00f161b6b05b86d8af05e3adf4b3bed640355d55e790bc1a8027578
installedResolverSha256=2f9c5b191f643d0b72317f4f41f75f1179bf7be0eab552c1bfe04d298acfcdaf
proposalSha256=dc8f4c0735e198ff25b142680dae6e83ac5b5891e00a9ba0c3a7086538b57eaf
PROPOSAL_TRACKED_EXIT=1 EXPECTED_UNTRACKED=1
```

The untracked downstream proposal is
`.github/bubbles-project/proposals/20260902-scenario-receipt-append-only-supersession.md`.
It requests an upstream Bubbles change. It is not an implemented resolver fix,
and this validation does not treat it as one.

### Current Validation Commands

| Check | Exact command | Exit | Current signal |
| --- | --- | ---: | --- |
| G070 outcome contract | `bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | `PASS boundary=pre-certification`; output SHA-256 `3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46` |
| Scenario receipt lifecycle | `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/_bugs/BUG-022-historical-report-declaration-leak --format json` | 1 | 3,023 lines; 34 blocking refusals; output SHA-256 `8a710d9de9ef470053191309dcad9a8fe2f2bc44d04ba0742652e8fa2c081000` |
| Transition contract | `bash .github/bubbles/scripts/transition-contract-resolver.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | `bugfix-fastlane`, target `done`, contract digest `sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`, target revision `sha256:2891e57baaa5f48a39290c295f926a4578bb7016e5a9be02aed052998acf75d6`; output SHA-256 `252b675df4f39912c0ac954bab33bb309dcbb89f8c21e8ef9cc2848af813c68b` |
| Asserted terminal guard | `bash .github/bubbles/scripts/state-transition-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak --target-status done --expect-workflow-mode bugfix-fastlane --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f` | 1 | 1,016 lines; 13 failures; failed gates `G060,G022,G027,G136`; output SHA-256 `0c20c3d6bea360d11b3f9b74f2b13b6a3b59dd4ffb224fd2585e34f7bda0502a` |
| Canonical repository selftest | `node scripts/selftest.mjs` | 0 | 3,467 passed, 0 failed across 3,975 output lines; output SHA-256 `5cc5def4e56c28f8317f342270db6d3c3c98642236037dfe76048ea7309b2e48` |
| Final report artifact lint | `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | 40 lines; all required artifacts and anti-fabrication checks passed; output SHA-256 `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| Scope-progress parity | `node scripts/validate-scope-dod-progress.mjs --all` | 0 | 86 claims, 72 agreeing, 14 frozen, 0 new drift, 0 stale; output SHA-256 `ecb9a6062e06eb00fe69297273b8037196d5479a2cb7ba248f316efd0b43a869` |
| Traceability | `bash .github/bubbles/scripts/traceability-guard.sh specs/_bugs/BUG-022-historical-report-declaration-leak` | 0 | 8 scenarios, 71 test rows, 8 concrete test mappings, 8 report evidence mappings, 0 warnings; output SHA-256 `ccf38ffb87f785e28b38d7838fd383d95fd0f96a6cd444fcde21eeab039985f3` |

The first asserted-guard attempt received an unrelated terminal `SIGINT` and
ended at child exit 130 after 683 lines. The first current selftest attempt was
also interrupted at child exit 130 after 3,800 lines. Neither interrupted run
supports a pass or failure claim. The table records only the complete reruns.

### Receipt-Lifecycle Verdict

```text
scenarioCount: 8
SCN-BUG022-001 highestState: RED_VERIFIED
SCN-BUG022-002 highestState: IMPLEMENTED
SCN-BUG022-003 highestState: IMPLEMENTED
SCN-BUG022-004 highestState: IMPLEMENTED
SCN-BUG022-005 highestState: IMPLEMENTED
SCN-BUG022-006 highestState: IMPLEMENTED
SCN-BUG022-007 highestState: IMPLEMENTED
SCN-BUG022-008 highestState: IMPLEMENTED
blockingRefusalCount: 34
blockingRefusals: 28 SCS-TEST-SUBSTITUTED, 5 SCS-CONTROL-SUBSTITUTED, 1 SCS-RED-NOT-FAILING
certifiable: null
```

The complete asserted guard independently reports this terminal result:

```text
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:2891e57baaa5f48a39290c295f926a4578bb7016e5a9be02aed052998acf75d6
failedGateIds: [G060,G022,G027,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 13
exitStatus: 1
verdict: FAIL
```

### Current Outcome Contract Verification - Session 7FBA

| Field | Current evidence | Status |
| --- | --- | --- |
| Intent | G070 passes on current spec and report bytes. | Demonstrated |
| Success Signal | The aggregate selftest passes, but the scenario resolver admits no certifiable chain. | Not certifiable |
| Hard Constraints | Current validator, carrier, scenario manifest, Test Plan, installed resolver, and proposal hashes are recorded without cleanup or mutation. | Preserved for this validation |
| Failure Condition | No aggregate product regression is observed, but the certification failure condition is active because scenario proof chains remain blocked. | Certification blocked |

### Finding Accounting And Ownership Routing

| Finding | Disposition | Owner |
| --- | --- | --- |
| `VALIDATE-BUG022-CURRENT-BYTE-BOUNDARY` | Addressed by current HEAD, SHA-256, scoped status, and proposal tracking checks. | `bubbles.validate` |
| `VALIDATE-BUG022-CURRENT-AGGREGATE-RECHECK` | Addressed by the complete 3,467/0 canonical selftest rerun. The receipt is aggregate-only. | `bubbles.validate` |
| `VALIDATE-BUG022-CURRENT-TERMINAL-DECISION` | Addressed by fresh contract resolution and the complete asserted guard refusal. | `bubbles.validate` |
| `BUG022-APPEND-ONLY-SUBSTITUTION-DEADLOCK` | Unresolved. The installed resolver keeps 34 superseded-history conflicts blocking later valid receipts. The downstream proposal is untracked and unimplemented. | Upstream `bubbles.implement` in the canonical Bubbles repository |
| `BUG022-G060-SCENARIO-STATE-RECEIPTS` | Unresolved. No scenario has a certifiable current chain. | Upstream resolver repair first; then `bubbles.test` |
| `BUG022-EXACT-CHAIN-IMPLEMENT-RECEIPTS` | Unresolved. Post-RED implementation and matching GREEN/LIVE/regression receipts cannot complete the normal chain until the resolver defect is repaired. | `bubbles.implement`, then `bubbles.test` and `bubbles.regression` |
| `BUG022-PHASE-CHAIN-COMPLETION` | Unresolved. G022 and G027 remain failed while the scope is nonterminal and required phase evidence is incomplete. | Active top-level runner after receipt lifecycle repair |
| `BUG022-G136-HUMAN-ACCEPTANCE` | Unresolved. The five Checklist items remain unchecked and the Human Acceptance Record remains an untouched placeholder. | Human owner |

Top-level `status` and `certification.status` remain `in_progress`.
`certification.scopeProgress` remains nonterminal at 72 checked and 0 unchecked.
Both completed-scope mirrors and `certifiedCompletedPhases` remain empty.
Certification timestamps remain null. No human acceptance, scenario state,
source, test, installed framework, proposal, branch, worktree, Git, deployment,
or unrelated dirty path was mutated by this validation record.
