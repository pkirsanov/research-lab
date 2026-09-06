# Report: BUG-008 Stale Mutation Carrier Mappings

[Scope](scopes.md) | [User validation](uservalidation.md)

## Summary

- Filed a full v3 BUG-008 packet for `B008-MAPPING-001`.
- Inspected the current 18-case mutation registry and the seven named entries.
- Inspected all seven exact product mutation anchors in the current tree.
- Inspected each selected functional test body.
- Confirmed that the selected titles check neighboring behavior or output shape
  instead of the mutated value or state.
- Ran the packet artifact lint and traceability guard after filing. Both pass.
- Kept the product runtime, shared injector, BUG-007, and dirty parent Feature
  008 transaction outside this filing.
- Left every delivery DoD item, human checklist item, test-plan status, and
  certification field incomplete.

## Completion Statement

Diagnosis and filing are complete for the BUG-008 packet only. The bug remains
`in_progress`. No product source or persistent test changed. No test delivery,
human acceptance, scope completion, or certification is claimed. Planning owns
the next mutation-to-carrier reconciliation.

## Test Evidence

### Inherited Current-Session Diagnostic {#inherited-current-session-diagnostic}

**Phase:** bug
**Command:** `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** `1` as reported by the operator
**Claim Source:** not-run
**Source:** operator statement in the current invocation

This filing agent did not execute the product test command. The operator reports
that the command executed three outer tests, passed two, and failed one. The
comprehensive registry applied all 18 mutations. Seven selected titles stayed
green:

```text
F008-CLEAR-TEST-001
F008-PATH-CONTRACT-001
F008-SURVIVAL-PATH-001
F008-DIVERSIFICATION-001
F008-HEDGE-001
F008-ALLOCATION-001
F008-DOSSIER-001
```

This block is diagnostic input only. It does not satisfy `TP-B008-000` or any
DoD item. `bubbles.test` must rerun the exact command and record raw RED output.

### Current-Tree Mapping Inspection {#current-tree-mapping-inspection}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** Current file inspection establishes that every named
registry entry still carries its exact mutation anchor and selected title. The
selected test bodies do not assert the behavior changed by the mutation.

| Finding | Current inspection result |
| --- | --- |
| `F008-CLEAR-TEST-001` | Selected title asserts undeclared personal keys and controller residue, not the `publicExclusions` branch. |
| `F008-PATH-CONTRACT-001` | Selected title supersedes through controller state, so `tokenFailure()` can reject after the identity guard is removed. |
| `F008-SURVIVAL-PATH-001` | Selected title asserts a cash-need event exists, not its declared date, modeled date, session, or wealth timing. |
| `F008-DIVERSIFICATION-001` | Selected title asserts the adjustment contract version, not qualified dispatch or adjusted values. |
| `F008-HEDGE-001` | Selected title tests duplicate samples and missing cost data, not a non-aligned hedge sample. |
| `F008-ALLOCATION-001` | Selected title allows broad candidate states and does not require the named constraint breach. |
| `F008-DOSSIER-001` | Selected title creates a complete fold and tests other invalid states, not missing exact keys or request version. |

## Uncertainty Declarations

### TP-B008-000 Raw RED

> **Uncertainty Declaration**
> **What was attempted:** No product test was run by this diagnosis-only filing.
> **What was observed:** The operator supplied the three-test, two-pass,
> one-fail result and the seven green mutation mappings.
> **Why this is uncertain:** The filing agent has no raw runner transcript to
> attribute as its own execution evidence.
> **What would resolve this:** `bubbles.test` reruns the exact focused command
> and records the complete or bounded raw output at `report.md#tp-b008-000`.

## Scenario Contract Evidence

`scenario-manifest.json` defines `SCN-B008-MUTATION-MAPPING-CAUSALITY` and
links it to the comprehensive registry title plus the five affected functional
carriers. Every link remains planned.

## Coverage Report

Planned coverage includes all seven stale mappings, all 18 registry mutations,
five affected functional carriers, affected and broader Feature 008 browser
matrices, the canonical selftest, adversarial integrity checks, packet guards,
and the transition guard.

No coverage result is claimed by this filing.

## Lint/Quality

### Artifact Lint {#bug008-artifact-lint}

**Phase:** bug
**Command:** `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-008 artifact lint
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings
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

Verify the complete output hash with:
`bash .github/bubbles/scripts/evidence-capture.sh --verify 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 -- bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings`.

### Traceability Guard {#bug008-traceability-guard}

**Phase:** bug
**Command:** `bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-008 traceability guard
$ bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings
exit: 0
lines: 39
sha256: e9f150913ba15889231665893780b574dabc73705e9cde47d105f52f803a10f9
--- output ---
============================================================
  BUBBLES TRACEABILITY GUARD
  Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings
  Timestamp: 2026-08-26T23:33:41Z
============================================================
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: tests/portfolio-test-integrity.unit.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-privacy.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-paths.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-diversification.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-allocation.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-dossier.functional.mjs
✅ scenario-manifest.json records evidenceRefs for all 1 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
ℹ️  Checking traceability for scopes.md
✅ scopes.md scenario mapped to Test Plan row: SCN-B008-MUTATION-MAPPING-CAUSALITY
ℹ️  scopes.md scenario→row match confidence: ambiguous
✅ scopes.md scenario maps to concrete test file: tests/portfolio-test-integrity.unit.mjs
✅ scopes.md report references concrete test evidence: tests/portfolio-test-integrity.unit.mjs
ℹ️  scopes.md summary: scenarios=1 test_rows=14
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-B008-MUTATION-MAPPING-CAUSALITY
ℹ️  scopes.md scenario→DoD match confidence: declared
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 14
ℹ️  Scenario-to-row mappings: 1
ℹ️  Concrete test file references: 1
ℹ️  Report evidence references: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=1 inferred=0 ambiguous=1
RESULT: PASSED (0 warnings)
```

The stored hash covers the unsanitized full output. This report replaces the
local home prefix with `~` to satisfy repository PII policy.

Verify the complete output hash with:
`bash .github/bubbles/scripts/evidence-capture.sh --verify e9f150913ba15889231665893780b574dabc73705e9cde47d105f52f803a10f9 -- bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-008-stale-mutation-carrier-mappings`.

## Validation Summary

The packet passes filing-time artifact lint and traceability. It remains
`in_progress` and routes to `bubbles.test` for `TP-B008-000` persistent RED,
then the seven focused carrier additions in `TP-B008-001` through
`TP-B008-007`. Validate-owned certification remains unchanged and empty.

## Audit Verdict

Not run. This invocation files diagnosis only.
