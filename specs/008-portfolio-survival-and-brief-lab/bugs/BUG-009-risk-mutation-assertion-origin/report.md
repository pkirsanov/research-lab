# Report: BUG-009 Risk Mutation Assertion Origin

[Scope](scopes.md) | [User validation](uservalidation.md)

## Summary

- Reproduced the strict mutation registry with the exact operator-requested
  command in the current session.
- Observed exit `1`, 60 source-output lines, and only
  `F008-RISK-INPUT-001` as a remaining finding.
- Ran the currently mapped title under only the registered mutation.
- Observed a downstream `TypeError` with `ERR_TEST_FAILURE` at the
  `lookThrough.state` access, not a protective `ERR_ASSERTION`.
- Inspected the mutation entry, causality predicate, exported
  `assetTreatment()` function, and current risk carrier.
- Filed one test-only scope and left every delivery, human acceptance, and
  certification claim incomplete.
- Preserved all concurrent dirty paths, product source, BUG-007, BUG-008, and
  parent Feature 008 artifacts.

## Completion Statement

Diagnosis and filing are complete for this packet only. BUG-009 remains
`in_progress` and routes to `bubbles.plan`. No source or persistent test changed.
No shipped GREEN, repaired mutation RED, scope completion, human acceptance, or
certification is claimed.

## Test Evidence

### Current-Session Strict Registry RED {#current-session-strict-registry-red}

**Phase:** bug
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-008-strict-registry-after-seven" -- node --test --test-name-pattern='^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-008-strict-registry-after-seven
$ node --test --test-name-pattern=^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$ tests/portfolio-test-integrity.unit.mjs
exit: 1
lines: 60
sha256: 46abaadc1994aabd750e4510fade07247c76cca617ddcc012147ea255230eba1
--- first 20 ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
not ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 7012.305938
  type: 'test'
  location: '~/research-lab/tests/portfolio-test-integrity.unit.mjs:377:1'
  failureType: 'testCodeFailure'
  error: |-
    audited defect classes that are NOT load-bearing:
      F008-RISK-INPUT-001 (scope 21, tests/portfolio-risk.functional.mjs): mutant failure did not originate from the selected protective assertion

    per-case:
      F008-PORTFOLIO-LIFECYCLE-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-CLEAR-RUNTIME-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-CLEAR-TEST-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BEHAVIOR-CONTRACT-001 scope=18 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BAR-COVERAGE-001 scope=19 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=fs.readFileSync
      F008-BRIEF-EVIDENCE-001 scope=20 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BRIEF-POLICY-001 scope=20 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
--- omitted 20 line(s); sha256 above covers the full output ---
--- last 20 ---
  expected:
  actual:
    0: 'F008-RISK-INPUT-001 (scope 21, tests/portfolio-risk.functional.mjs): mutant failure did not originate from the selected protective assertion'
  operator: 'deepStrictEqual'
  stack: |-
    TestContext.<anonymous> (file://~/research-lab/tests/portfolio-test-integrity.unit.mjs:462:10)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 7119.516935
```

The stored hash covers the complete unsanitized source output. The displayed
block replaces local home prefixes with `~` under repository evidence policy.

### Operator-Supplied Prior Capture {#operator-supplied-prior-capture}

**Phase:** bug
**Claim Source:** not-run
**Source:** operator statement in the current invocation

The operator supplied exit `1`, 60 lines, and SHA-256
`c392d0bfa3891689ea12cc649a3fb1ddef9f35bfd49e1b8af651a70dec3aa238` for the same
command. The fresh current-session capture produced the same sole finding but a
different hash, `46abaadc...`, so this packet keeps the prior hash as diagnostic
input and does not restate it as current-session execution evidence.

### Selected Title Mutant Origin {#selected-title-mutant-origin}

**Phase:** bug
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009-selected-title-mutant-origin" -- env NODE_OPTIONS="--require $HOME/research-lab/tests/portfolio-defect-injector.cjs" RL_DEFECT_MODULE="rlportfolioanalytics.js" RL_DEFECT_FIND_B64="ICAgICAgZWxzZSBleGNsdWRlZC5wdXNoKHsgc3ltYm9sOiBoLnN5bWJvbCwgYXNzZXRUeXBlOiBoLmFzc2V0VHlwZSB8fCAidW5rbm93biIgfSk7" RL_DEFECT_REPLACE_B64="ICAgICAgZWxzZSByZXR1cm4geyBzdGF0ZTogInVuc3VwcG9ydGVkLWhvbGRpbmciLCBzeW1ib2w6IGguc3ltYm9sIH07" RL_DEFECT_MARKER="/tmp/research-lab-bug009-risk-marker-2046708" node --test --test-reporter=tap --test-name-pattern='^SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output$' tests/portfolio-risk.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-009-selected-title-mutant-origin
exit: 1
lines: 27
sha256: 279edba7e9164b542c5206385b7ad9fc1a79815d39511a1af9d61396139a523f
--- output ---
TAP version 13
# Subtest: SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
not ok 1 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
  ---
  duration_ms: 7.64935
  type: 'test'
  location: '~/research-lab/tests/portfolio-risk.functional.mjs:43:1'
  failureType: 'testCodeFailure'
  error: "Cannot read properties of undefined (reading 'state')"
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: |-
    TestContext.<anonymous> (file://~/research-lab/tests/portfolio-risk.functional.mjs:94:54)
    Test.runInAsyncScope (node:async_hooks:214:14)
    Test.run (node:internal/test_runner/test:1047:25)
    Test.start (node:internal/test_runner/test:944:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 92.671072
```

This output directly proves the current mapped title fails for a non-assertion
reason. It does not satisfy the required post-repair mutation RED.

### Current-Tree Root Cause Inspection {#current-tree-root-cause-inspection}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The executed failure aligns with the controlling source and
test paths. The current mapping is broader than the contract changed by the
mutation.

| Anchor | Current-tree fact |
| --- | --- |
| Registry entry | `F008-RISK-INPUT-001` replaces the named exclusion push with an early return and selects the whole-projection `SCN-008-047` title. |
| Causality predicate | The strict registry requires the selected title, `not ok 1`, and `ERR_ASSERTION`; runtime rubble is insufficient. |
| Production owner | `assetTreatment()` returns state, market inclusion, named exclusions, and look-through diagnostics, and is exported. |
| Current carrier | The mapped title reaches `projection.assetTreatment.lookThrough.state` after many unrelated projection assertions. |
| Exact failure | The mutant removes the nested look-through shape, producing `TypeError` and `ERR_TEST_FAILURE` at that access. |

## Scenario Contract Evidence

`scenario-manifest.json` defines one planned contract, `SCN-B009-001`, for a
direct exported-function assertion and exact mutation negative control. No
scenario is marked implemented or verified.

## Coverage Report

Planned coverage includes focused shipped GREEN, focused mutation
`ERR_ASSERTION` RED, full 18-case registry 3/3 GREEN, full risk carrier,
relevant Node and browser carriers, canonical selftest, regression-quality
guard, fixed canonical G028 scanner, and packet gates.

No post-repair coverage result is claimed.

## Lint/Quality

### TP-B009-011 Artifact Lint {#tp-b009-011}

**Phase:** bug
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 artifact lint filing" -- bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 artifact lint filing
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
✅ All checklist bullet items use checkbox syntax
✅ uservalidation separates automation readiness from human acceptance
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

### TP-B009-011 Traceability Guard {#tp-b009-011-traceability}

**Phase:** bug
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 traceability filing" -- bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 traceability filing
$ bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
exit: 0
lines: 36
sha256: ddb7452771e4830cc8056d434bb0b7b055c28feebf76e11788924a9f51e62b4b
--- output ---
============================================================
  BUBBLES TRACEABILITY GUARD
  Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
  Timestamp: 2026-08-27T00:43:31Z
============================================================
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: tests/portfolio-risk.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-test-integrity.unit.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-survival-risk.spec.mjs
✅ scenario-manifest.json records evidenceRefs for all 1 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
ℹ️  Checking traceability for scopes.md
✅ scopes.md scenario mapped to Test Plan row: SCN-B009-001 unsupported holdings remain named without aborting asset treatment
ℹ️  scopes.md scenario→row match confidence: ambiguous
✅ scopes.md scenario maps to concrete test file: tests/portfolio-test-integrity.unit.mjs
✅ scopes.md report references concrete test evidence: tests/portfolio-test-integrity.unit.mjs
ℹ️  scopes.md summary: scenarios=1 test_rows=13
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-B009-001 unsupported holdings remain named without aborting asset treatment
ℹ️  scopes.md scenario→DoD match confidence: declared
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 13
ℹ️  Scenario-to-row mappings: 1
ℹ️  Concrete test file references: 1
ℹ️  Report evidence references: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=1 inferred=0 ambiguous=1
RESULT: PASSED (0 warnings)
```

## Validation Summary

Filing-time artifact lint and traceability pass. BUG-009 remains `in_progress`;
delivery validation and certification remain unrun and unchanged.

## Audit Verdict

Not run. This invocation performs diagnosis and filing only.