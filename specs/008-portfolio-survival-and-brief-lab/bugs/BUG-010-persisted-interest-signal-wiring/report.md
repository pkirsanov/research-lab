# BUG-010 Report

## Summary

This bug-owner phase independently inspected the current Feature 008 contract,
source, registered page, related tests, and bug inventory. It confirmed a
missing production edge between accepted behavior events and the durable
`workspace.interestSignals` cache.

The phase created this packet and corrected BUG-005's blast-radius prose. It
changed no product source or test.

## Completion Statement

This report records bug discovery and routing only. It makes no implementation,
product-test, validation, audit, certification, or human-acceptance claim.

The packet remains `in_progress`. The first required planning owner is
`bubbles.analyst`, followed by `bubbles.ux`, `bubbles.design`, and
`bubbles.plan`.

## Findings

### BUG-010-F1 - Durable Signal Writer Has No Registered-Page Caller

`rlportfolio.js` defines and exports `buildInterestSignalCandidate`. That
builder is the only current source assignment that replaces
`candidate.interestSignals` from derived values.

The registered page does not call that builder or the portfolio-side derivation
it wraps. Its accepted completion handler commits the output of
`buildBehaviorCandidate` directly.

### BUG-010-F2 - Existing Browser Coverage Does Not Assert The Durable Cache

The brief browser carrier asserts three persisted behavior events and transient
ranking across reload. It does not assert a non-empty persisted signal cache.

The Black-Litterman browser carrier accepts either a present or absent behavior
signal in its exclusion copy. It therefore proves zero behavior-derived views,
but not that the audit observed the current persisted signal count.

### BUG-010-F3 - BUG-005 Blast Radius Was Overstated

BUG-005 repaired a real public module contract defect. The current registered
page calls neither repaired export, so current evidence does not support a
permanent registered-page crash claim. BUG-005 now states that narrower blast
radius and links this distinct wiring packet.

## Duplicate Packet Check {#duplicate-packet-check}

**Phase:** bug
**Tool:** workspace text search
**Query:** `buildInterestSignalCandidate|workspace\.interestSignals|persisted interest signal|Black-Litterman.*interest|interest signal.*Black-Litterman`
**Surface:** `specs/008-portfolio-survival-and-brief-lab/bugs/**`
**Claim Source:** interpreted
**Interpretation:** The single exact symptom search found the missing-writer
discussion in BUG-005 and related contract references in BUG-006. The current
bug inventory ended at BUG-009 and contained no distinct persisted-signal
wiring packet. BUG-010 is therefore a new packet, not a duplicate.

## Test Evidence

No product test ran in this bug-owner phase. No product pass or fail result is
claimed.

### Source Call-Graph Evidence {#source-call-graph-evidence}

**Phase:** bug
**Executed:** YES
**Command:**

```bash
cd ~/research-lab && printf '%s\n' '[BUG-010] source contract probe' && timeout 30 git grep -n 'function buildInterestSignalCandidate\|candidate.interestSignals = derived.value' -- rlportfolio.js && if timeout 30 git grep -n 'buildInterestSignalCandidate' -- portfolio-survival-allocation-lab.html; then printf '%s\n' 'pageWriterLookup=unexpected-match'; exit 1; else writer_status=$?; printf 'pageWriterLookupExit=%s\n' "$writer_status"; [[ $writer_status -eq 1 ]] || exit "$writer_status"; fi && if timeout 30 git grep -n -E 'api\.deriveInterestSignals|window\.RLPORTFOLIO\.deriveInterestSignals' -- portfolio-survival-allocation-lab.html; then printf '%s\n' 'pagePortfolioDeriverLookup=unexpected-match'; exit 1; else deriver_status=$?; printf 'pagePortfolioDeriverLookupExit=%s\n' "$deriver_status"; [[ $deriver_status -eq 1 ]] || exit "$deriver_status"; fi && timeout 30 git grep -n 'var candidate = api.buildBehaviorCandidate' -- portfolio-survival-allocation-lab.html && timeout 30 git grep -n 'workspace.interestSignals' -- portfolio-survival-allocation-lab.html && timeout 30 git grep -n 'RLPORTFOLIOBRIEF.deriveInterestSignals' -- portfolio-survival-allocation-lab.html && timeout 30 git grep -n '"id": "portfolio-survival-allocation-lab"' -- tools.json && timeout 30 git grep -n 'persisted.behaviorEvents' -- tests/portfolio-survival-brief.spec.mjs && timeout 30 git grep -n -F "expect(exclusion).toMatch(/behaviour signal|No behaviour signal/);" -- tests/portfolio-survival-allocation.spec.mjs && printf '%s\n' 'BUG010_SOURCE_PROBE=complete'
```

**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The output proves page registration, missing exact writer
and portfolio-deriver calls, the direct behavior-candidate commit, the durable
cache read, the transient derivation, and the limits of browser assertions.

```text
[BUG-010] source contract probe
rlportfolio.js:2569:  function buildInterestSignalCandidate(currentWorkspace, now, policy) {
rlportfolio.js:2573:    candidate.interestSignals = derived.value;
pageWriterLookupExit=1
pagePortfolioDeriverLookupExit=1
portfolio-survival-allocation-lab.html:8767:                var candidate = api.buildBehaviorCandidate(completionDraft(), state.opened.workspace, { now: now() }, state.policy);
portfolio-survival-allocation-lab.html:3060:                    ? state.opened.workspace.interestSignals
portfolio-survival-allocation-lab.html:6423:                var interestResult = window.RLPORTFOLIOBRIEF.deriveInterestSignals({
tools.json:1798:      "id": "portfolio-survival-allocation-lab",
tests/portfolio-survival-brief.spec.mjs:828:  expect(persisted.behaviorEvents, 'all three real UI completions reach the canonical local store').toHaveLength(3);
tests/portfolio-survival-brief.spec.mjs:829:  expect(persisted.behaviorEvents.every((entry) => entry.eventIdentity.startsWith('sha256:'))).toBe(true);
tests/portfolio-survival-brief.spec.mjs:830:  expect(persisted.behaviorEvents.every((entry) => entry.genericEvidenceIdentity.startsWith('sha256:'))).toBe(true);
tests/portfolio-survival-brief.spec.mjs:831:  expect(persisted.behaviorEvents.every((entry) => entry.occurrence.contractVersion === 'BehaviorOccurrence/v1')).toBe(true);
tests/portfolio-survival-brief.spec.mjs:878:  console.log(`[TP-18-03] storedOccurrences=${persisted.behaviorEvents.length} eligible=2 quarantined=1`);
tests/portfolio-survival-allocation.spec.mjs:322:  expect(exclusion).toMatch(/behaviour signal|No behaviour signal/);
BUG010_SOURCE_PROBE=complete
```

The command used bounded `git grep` calls and explicit exit checks for both
absence assertions.

## Code Diff Evidence

This phase authorizes packet-only edits. Product source and persistent tests are
excluded from its change boundary.

## Validation Evidence

**Executed:** NO
**Phase Agent:** `bubbles.validate`
**Claim Source:** not-run
**Reason:** No validation agent ran, and this bug-owner phase cannot certify.

## Audit Evidence

**Executed:** NO
**Phase Agent:** `bubbles.audit`
**Claim Source:** not-run
**Reason:** No audit agent ran, and no audit verdict is claimed.

## Chaos Evidence

**Executed:** NO
**Phase Agent:** `bubbles.chaos`
**Claim Source:** not-run
**Reason:** No chaos phase applies to this discovery packet creation.

## Finding Accounting

| Finding | Disposition | Owner |
| --- | --- | --- |
| `TEST-B005-T2-A-BLAST-RADIUS` | Addressed in BUG-005 `bug.md` | `bubbles.bug` |
| `TEST-B005-T2-B-PERSISTED-SIGNAL-WIRING` | Addressed at discovery boundary by this distinct packet | `bubbles.bug` |
| `BUG-010-F1` | Routed into the planning chain | `bubbles.analyst` first |
| `BUG-010-F2` | Routed into the planning chain | `bubbles.analyst` first |
| `BUG-010-F3` | Addressed in BUG-005 `bug.md` | `bubbles.bug` |
| `BUG-010-PACKET-SHAPE-001` | Addressed by the exact `### Definition of Done` heading | `bubbles.bug` |
| `BUG-010-TRACE-SHAPE-001` | Addressed by seven provisional Gherkin contracts and declared mappings | `bubbles.bug` |

## Packet Governance Checks {#packet-governance-checks}

These commands validate packet shape, local references, and traceability. They
are governance checks, not product tests.

### BUG-005 Artifact And Reference Checks

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The normalized receipt below preserves the exact command,
exit code, line count, content hash, and decisive result. It is not presented as
a verbatim replay of every captured line.

```text
# BUG-005 bug-owner artifact lint
$ timeout 120 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
All checklist bullet items use checkbox syntax
uservalidation separates automation readiness from human acceptance
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
report.md contains section matching: Summary
report.md contains section matching: Completion Statement
report.md contains section matching: Test Evidence
Mode-specific report gates skipped (status not in promotion set)
Value-first selection rationale lint skipped (not a value-first report)
Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

```text
$ timeout 120 bash .github/bubbles/scripts/reference-existence-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
[reference-existence-lint] OK - 6 markdown file(s) scanned, every relative link target resolves
exit: 0
```

### BUG-005 Traceability Check

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The normalized bounded receipt preserves the command, exit
code, content hash, mapping counts, and final result.

```text
# BUG-005 bug-owner traceability
$ timeout 120 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash --all-scopes
exit: 0
lines: 62
sha256: fa2b6f9f3a4f727466592b20330a7c0081816a30673fe27e43e623993894374f
--- first 20 ---
BUBBLES TRACEABILITY GUARD
Feature: specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash
Scenario Manifest Cross-Check (G057/G059)
scenario-manifest.json covers 5 scenario contract(s)
scenario-manifest.json linked test exists: tests/portfolio-stale-domain-signal.unit.mjs
scenario-manifest.json records evidenceRefs for all 5 scenario contract(s)
All linked tests from scenario-manifest.json exist
Checking traceability for scopes.md
scopes.md scenario mapped to Test Plan row: SCN-B005-STALE-OMITTED
--- omitted 22 line(s); sha256 above covers the full output ---
--- last 20 ---
scopes.md scenario maps to DoD item: SCN-B005-FRESH-SIBLING
scopes.md scenario maps to DoD item: SCN-B005-DISCRIMINATION
scopes.md scenario maps to DoD item: SCN-B005-FLOOR-PRESERVED
scopes.md scenario maps to DoD item: SCN-B005-BRIEF-AGREEMENT
DoD fidelity: 5 scenarios checked, 5 mapped to DoD, 0 unmapped
Traceability Summary
Scenarios checked: 5
Test rows checked: 11
Scenario-to-row mappings: 5
Concrete test file references: 5
Report evidence references: 5
DoD fidelity scenarios: 5 (mapped: 5, unmapped: 0)
Edge confidence (IMP-015 Scope B): declared=10 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```

### BUG-010 Initial Shape Findings

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** These normalized receipt signals identify the two exact
initial failures and their full-output hashes.

```text
# BUG-010 discovery packet artifact lint
exit: 1
lines: 38
sha256: 0d9ab3baa835f4d00ec39fdd451c13f01955011be0b74a260c0854d276e406d5
scopes.md is missing '### Definition of Done' section
Artifact lint FAILED with 1 issue(s).
# BUG-010 discovery packet traceability
exit: 1
lines: 24
sha256: 078ddc048e5786ec08b31f55055532df0ccfd91ab976f5a2b8a776353a401b45
No scope-defined Gherkin scenarios found - scenario manifest cross-check skipped
scopes.md has no Gherkin scenarios to trace
RESULT: FAILED (1 failures, 0 warnings)
```

The bug-owner repair changed only provisional packet structure. It added the
exact DoD heading, seven Gherkin scenarios, declared Test Plan and DoD mappings,
manifest rows, and a not-started scope record.

### BUG-010 Final Artifact And Reference Checks

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The normalized receipt below preserves the exact command,
exit code, line count, content hash, and decisive result.

```text
# BUG-010 discovery packet artifact lint rerun
$ timeout 120 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
--- output ---
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
All checklist bullet items use checkbox syntax
uservalidation separates automation readiness from human acceptance
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
report.md contains section matching: Summary
report.md contains section matching: Completion Statement
report.md contains section matching: Test Evidence
Mode-specific report gates skipped (status not in promotion set)
Value-first selection rationale lint skipped (not a value-first report)
Scenario path-placeholder lint skipped (no matching scenario sections found)
=== Anti-Fabrication Evidence Checks ===
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
=== End Anti-Fabrication Checks ===
Artifact lint PASSED.
```

```text
$ timeout 120 bash .github/bubbles/scripts/reference-existence-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring
[reference-existence-lint] OK - 6 markdown file(s) scanned, every relative link target resolves
exit: 0
```

### BUG-010 Final Traceability Check

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The normalized bounded receipt preserves the command, exit
code, content hash, mapping counts, and final result.

```text
# BUG-010 discovery packet traceability rerun
$ timeout 120 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring --all-scopes
exit: 0
lines: 77
sha256: cc617028ab1b6d7b578c8bda187feda728ad0817371cff10e69067563fbceb57
--- first 20 ---
BUBBLES TRACEABILITY GUARD
Feature: specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring
Scenario Manifest Cross-Check (G057/G059)
scenario-manifest.json covers 7 scenario contract(s)
scenario-manifest.json linked test exists: tests/portfolio-survival-brief.spec.mjs
scenario-manifest.json linked test exists: tests/portfolio-stale-domain-signal.unit.mjs
scenario-manifest.json linked test exists: tests/portfolio-privacy.functional.mjs
scenario-manifest.json linked test exists: tests/portfolio-survival-allocation.spec.mjs
scenario-manifest.json records evidenceRefs for all 7 scenario contract(s)
All linked tests from scenario-manifest.json exist
Checking traceability for Scope 1: Synchronize Persisted Interest Signals
--- omitted 37 line(s); sha256 above covers the full output ---
--- last 20 ---
Scope 1 scenario maps to DoD item: SCN-B010-005 passive activity creates no inferred interest
Scope 1 scenario maps to DoD item: SCN-B010-006 Black-Litterman observes signals without using them
Scope 1 scenario maps to DoD item: SCN-B010-007 failed persistence preserves the prior generation
DoD fidelity: 7 scenarios checked, 7 mapped to DoD, 0 unmapped
Traceability Summary
Scenarios checked: 7
Test rows checked: 8
Scenario-to-row mappings: 7
Concrete test file references: 7
Report evidence references: 3
Report evidence DEFERRED to their own execution (Not Started scopes): 4
DoD fidelity scenarios: 7 (mapped: 7, unmapped: 0)
Edge confidence (IMP-015 Scope B): declared=14 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```
