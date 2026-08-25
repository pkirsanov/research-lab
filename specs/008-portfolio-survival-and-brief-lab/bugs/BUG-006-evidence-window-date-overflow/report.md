# BUG-006 Report

## Summary

Current source and the originating BUG-005 security finding were inspected
under a committed Research Lab repository binding. A focused current-source
probe reproduced the accepted-policy to invalid-Date failure chain.

No product source or test was edited. No product test was run by
`bubbles.bug`.

`bubbles.plan` subsequently reconciled the existing single scope against the
adopted design, current source owners, committed policy, neighboring test
carrier, parent requirements, and current Bubbles scenario-obligation contract.
No product source or test was edited or executed by `bubbles.plan`.

## Completion Statement

Bug discovery, reproduction, design, and one narrow executable repair scope are
recorded. Delivery is not complete. Scope 1 remains `Not Started`; status and
certification remain `in_progress`.

The next required owner is `bubbles.test`. Product implementation remains
blocked until the persistent boundary and overflow tests are authored and their
focused pre-fix RED result is recorded.

## Repository Binding

**Claim Source:** executed

The host adapter resolved all declared workspace roots. Repository preflight
then committed Research Lab as the actionable root:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:204 revision=204 repository=research-lab root=<repo>
repositoryRoot=<repo>
repositoryAlias=research-lab
authority=explicit-repository-root
transition=confirmed
targetKind=repository-root
pathVisibility=local
actionable=true
```

### Planning authority confirmation

**Phase:** plan
**Claim Source:** executed

The current planning invocation independently resolved the host session and
confirmed the exact BUG-006 target at external control revision `210`:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=concrete-target affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:210 revision=210 repository=research-lab root=<repo>
authority=concrete-target
transition=confirmed
targetKind=absolute-target
pathVisibility=local
actionable=true
```

## Planning Reconciliation

**Phase:** plan
**Claim Source:** interpreted from current-session repository reads

- `scopes.md` retains one scope and now records the RED-before-implementation
	checkpoint as its own Test Plan and DoD item.
- `scenario-manifest.json` declares only the applicable pure-calculation,
	static-metadata, and degraded-state traits, with explicit obligations,
	mechanisms, negative controls, and implementation owners.
- `test-plan.json` mirrors nine Test Plan rows, commands, scenario links, and
	evidence anchors without recording any execution result.
- `state.json` records the plan phase and routes to `bubbles.test`; top-level
	status, certification, scope status, and completed scopes remain unchanged.
- `uservalidation.md` remains entirely unchecked. No human acceptance is
	inferred or recorded.

## Findings

### SEC-B005-S1 - Accepted policy can overflow Date

`rlportfolio.js` defines `finiteNonNegative()` as a type, finiteness, and sign
check. The behavior-policy numeric loop applies it to
`maximumEvidenceAgeDays` and imposes no upper bound.

`deriveInterestSignals()` validates the policy first. It later calculates
`Date.parse(bucket.latest) + maximumEvidenceAgeDays * 86400000` and calls
`toISOString()`.

**Claim Source:** interpreted from current source

The failure is not inferred from naming. The controlling validator and
derivation regions were read in this session from `rlportfolio.js`.

### Prior security measurement corroboration

The BUG-005 security phase recorded these values:

```text
largestSafe=99979346
firstThrow=99979347
pre=RangeError
post=RangeError
shipped maximumEvidenceAgeDays=56
```

Its detailed table records a one-day transition between the largest safe value
and the first throwing value for each of two fixtures.

**Claim Source:** interpreted from
`../BUG-005-stale-domain-interest-signal-crash/report.md`

This packet does not restate that prior run as current-session execution. The
focused reproduction below independently confirms the failure class.

## Bug Reproduction - Before Fix {#before-fix-reproduction}

**Phase:** bug
**Executed:** YES
**Command:** `cd ~/research-lab && timeout 30 node -e 'const a=require("./rlportfolio"),p=require("./portfolio-survival-allocation.config.json"),v=n=>a.validatePolicy({...p,behavior:{...p.behavior,maximumEvidenceAgeDays:n}}).ok,n=99979350,m=Date.parse("2026-07-16T10:00:00.000Z")+n*86400000;let iso;try{iso=new Date(m).toISOString()}catch(e){iso=e.name+":"+e.message}console.log(["BUG-006 FOCUSED PROBE","shippedDays="+p.behavior.maximumEvidenceAgeDays,"proposedBoundDays=36525","validateAtBound="+v(36525),"validateOneOver="+v(36526),"overflowDays="+n,"validateOverflow="+v(n),"derivedExpiryMs="+m,"timeClipMaxMs=8640000000000000","exceedsTimeClip="+(m>8640000000000000),"toISOString="+iso,"finding="+(v(n)&&m>8640000000000000?"CONFIRMED":"NOT_CONFIRMED")].join("\n"))'`
**Exit Code:** 0
**Claim Source:** executed

The command loaded the current `rlportfolio.js` and committed policy. It cloned
the policy for each check and applied the exact expiry arithmetic used by
`deriveInterestSignals()`.

```text
BUG-006 FOCUSED PROBE
shippedDays=56
proposedBoundDays=36525
validateAtBound=true
validateOneOver=true
overflowDays=99979350
validateOverflow=true
derivedExpiryMs=8640000036000000
timeClipMaxMs=8640000000000000
exceedsTimeClip=true
toISOString=RangeError:Invalid time value
finding=CONFIRMED
```

**Result:** FAIL as a product contract. The diagnostic process exited zero
because it completed its classification. Current validation accepts both the
one-over product boundary and the TimeClip-overflowing value.

## Root Cause

The validator checks numeric shape but omits a semantic upper bound. The
consumer trusts validation and performs Date arithmetic that has a stricter
domain than finite non-negative numbers.

This is pre-existing. BUG-005 recorded identical pre-fix and post-fix overflow
behavior. The BUG-005 source repair moved bucket creation and did not change
the expiry expression or policy validator.

**Claim Source:** interpreted from current source and the BUG-005 security
report

## Proposed Bound

Use a named conservative product maximum:

```text
MAXIMUM_EVIDENCE_AGE_DAYS = 100 * 365 + 25 = 36525
```

The 25-day term covers the maximum leap-day count in 100 years. A century is
far beyond a useful behavior-evidence horizon. It is also over 2,700 times
smaller than the observed Date overflow boundary.

The bound avoids three weaker designs: TimeClip-edge arithmetic, silent
clamping, and catch-and-continue handling inside derivation.

**Claim Source:** interpreted from the executed boundary evidence and product
policy

## Test Evidence

No product test was executed, and no passing product result is claimed. The
scenario-first test plan is in `scopes.md`.

> **Uncertainty Declaration**
> **What was attempted:** The current validator and expiry expression were
> inspected and composed in a focused Node diagnostic.
> **What was observed:** Current validation accepted the overflowing policy,
> and the Date conversion threw `RangeError`.
> **Why this is uncertain:** No persistent regression test or source repair
> exists yet.
> **What would resolve this:** `bubbles.test` must author the planned boundary
> carrier and record its red result before `bubbles.implement` changes source.

## Packet Validation Evidence

### Artifact lint

**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Exit Code:** 0
**Claim Source:** executed

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
All checklist bullet items use checkbox syntax
uservalidation separates automation readiness from human acceptance
Detected state.json status: in_progress
Detected state.json workflowMode: bugfix-fastlane
Top-level status matches certification.status
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

**Result:** PASS

### Traceability guard

**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Exit Code:** 0
**Claim Source:** executed

```text
BUBBLES TRACEABILITY GUARD
Feature: <repo>/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow
Scenario Manifest Cross-Check (G057/G059)
scenario-manifest.json covers 3 scenario contract(s)
scenario-manifest.json linked test exists: tests/portfolio-foundation.unit.mjs
scenario-manifest.json linked test exists: tests/portfolio-foundation.unit.mjs
scenario-manifest.json linked test exists: tests/portfolio-foundation.unit.mjs
scenario-manifest.json records evidenceRefs for all 3 scenario contract(s)
All linked tests from scenario-manifest.json exist
scopes.md scenario mapped to Test Plan row: SCN-B006-BOUNDARY-ACCEPTED
scopes.md scenario maps to concrete test file: tests/portfolio-foundation.unit.mjs
scopes.md report evidence DEFERRED (scope is Not Started, so no run has produced evidence yet)
scopes.md scenario mapped to Test Plan row: SCN-B006-ONE-OVER-REFUSED
scopes.md scenario maps to concrete test file: tests/portfolio-foundation.unit.mjs
scopes.md report evidence DEFERRED (scope is Not Started, so no run has produced evidence yet)
scopes.md scenario mapped to Test Plan row: SCN-B006-OVERFLOW-REFUSED
scopes.md scenario maps to concrete test file: tests/portfolio-foundation.unit.mjs
scopes.md report evidence DEFERRED (scope is Not Started, so no run has produced evidence yet)
DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
Scenarios checked: 3
Test rows checked: 7
Scenario-to-row mappings: 3
Concrete test file references: 3
Report evidence references: 0
Report evidence DEFERRED to their own execution (Not Started scopes): 3
DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
Edge confidence (IMP-015 Scope B): declared=6 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
```

**Result:** PASS

## Packet Artifact Inventory

Only this packet's nine files are in scope:

| File | Purpose |
| --- | --- |
| `bug.md` | Defect, severity, reproduction, and scope |
| `spec.md` | Expected behavior and product-principle alignment |
| `design.md` | Root cause and proposed narrow fix |
| `scopes.md` | Scenario-first handoff, Test Plan, and unchecked DoD |
| `report.md` | Current-session discovery and reproduction evidence |
| `uservalidation.md` | Unchecked automation and human acceptance checklist |
| `state.json` | Version 3 non-terminal control plane |
| `scenario-manifest.json` | Planned scenario registry |
| `test-plan.json` | Planner-owned structured test handoff |

Existing modified framework-agent files are outside this packet and remain
untouched.

## Routing

1. `bubbles.test` authors the exact boundary, one-over, huge-finite,
	refusal-shape, non-finite-precedence, and shipped-56 assertions, then records
	the focused pre-fix RED result.
2. `bubbles.implement` adds the private named maximum and one validator
	predicate inside the declared change boundary.
3. `bubbles.test` performs focused GREEN, allocation-page non-movement,
	Feature 008 browser, and canonical repository regression runs.
4. `bubbles.validate` runs the packet and transition guards and owns any
	certification write.
