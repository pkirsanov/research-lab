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
