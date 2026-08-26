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

`bubbles.test` then authored the three planned persistent BUG-006 tests and ran
the exact focused carrier against unchanged product source. The accepted
boundary/control test passed, and the two planned refusal tests failed under
their exact titles. No product source was edited.

`bubbles.implement` verified the current named ceiling and validator ordering,
then added the required source rationale for the conservative century horizon
and its 25-day leap allowance. Its focused post-edit carrier passed all 61
tests. Broader regression, audit, validation, and human acceptance remain
unclaimed.

Subsequent test and regression phases completed the existing shared-validator
rows. A gaps pass then identified exported `composeBrief()` as a second
policy-derived Date consumer that bypasses shared validation. Design and spec
now define that consumer contract. The current planning pass narrow-expands
Scope 01, adds one machine scenario, and adds `TP-B006-009/010` without
changing prior execution evidence.

## Completion Statement

The shared-validator repair and its existing RED/GREEN records are preserved.
The newly planned brief-consumer repair is not implemented or tested. Delivery
is not complete. Packet, scope, and certification remain `in_progress`, and
every Definition of Done item remains unchecked.

The next required owner is `bubbles.test`. It owns the persistent
`tests/portfolio-brief.functional.mjs` regression and the observed
`TP-B006-009` RED result before any `rlportfoliobrief.js` edit.

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

### Test authority confirmation

**Phase:** test
**Claim Source:** executed

The scenario-first RED invocation independently refreshed the host session and
confirmed the exact BUG-006 target at external control revision `212` before
reading or changing packet content:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=concrete-target affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:212 revision=212 repository=research-lab root=<repo>
repositoryAlias=research-lab
authority=concrete-target
transition=confirmed
scopeKind=command
scopeId=null
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

## Brief Consumer Planning Reconciliation

**Phase:** plan
**Claim Source:** interpreted from current-session repository reads

- Existing `TP-B006-000` through `TP-B006-008` statuses and evidence references
	remain unchanged.
- Scope 01 now includes `rlportfoliobrief.js` and
	`tests/portfolio-brief.functional.mjs` in its Change Boundary and consumer
	inventory.
- `SCN-B006-BRIEF-POLICY-VALIDATION` derives `pure-calculation`,
	`degraded-state`, and `shared-consumer` obligations. Functional parity is
	planned through `TP-B006-009/010`; the existing Feature 008 Brief route row
	remains the consumer-surface non-movement proof.
- `TP-B006-009` is the required pre-source RED. `TP-B006-010` is the unchanged
	carrier's post-source GREEN. Neither row has been executed.
- Scope, packet, certification, DoD, human acceptance, source, and tests remain
	non-terminal and unchanged by this planning pass.

> **Uncertainty Declaration**
> **What was attempted:** The planner reconciled Scope 01, the scenario
> manifest, the structured Test Plan, DoD mappings, report anchors, and
> execution routing, then ran focused artifact, traceability, obligation, and
> mechanism checks.
> **What was observed:** The planning checks accept four scenarios and the new
> brief carrier path. The persistent BUG-006 brief test title does not yet
> exist, and `TP-B006-009/010` remain explicitly not run.
> **Why this is uncertain:** Planning cannot demonstrate the required pre-fix
> failure or post-fix behavior without test-owned authorship and execution.
> **What would resolve this:** `bubbles.test` authors the exact persistent
> `SCN-B006-BRIEF-POLICY-VALIDATION` case and records `TP-B006-009` RED before
> any `rlportfoliobrief.js` edit.

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

The persistent scenario carrier records the required failing pre-fix state.
The implementation phase's focused post-edit check is recorded below. Formal
GREEN status and broader regression results remain test-owned and unclaimed.

## TP-B006-000 {#tp-b006-000}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Capture Command:** `timeout 250 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 focused pre-fix RED" -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-006 focused pre-fix RED
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 1
lines: 1282
sha256: 8f2f6c1adf9fba6f58391f6d2cfc69a84d1e4977e70fcb23ed24973364909d99
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 19.044282
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 4.376073
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.917482
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
--- failure-shaped lines from the omitted region ---
not ok 4 - BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
not ok 5 - BUG-006: an overflowing evidence window is refused before interest derivation
--- omitted 1242 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 86.338367
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 23.424756
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 59
# fail 2
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1908.261311
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 8f2f6c1adf9fba6f58391f6d2cfc69a84d1e4977e70fcb23ed24973364909d99 -- timeout 240 node --test tests/portfolio-foundation.unit.mjs -->

**Result:** FAIL as required for the scenario-first RED phase. The exact
persistent carrier exited `1`; 59 controls passed, 2 tests failed, and 0 were
skipped. The accepted `36525` boundary, committed `56`, and non-finite
precedence share one passing control test. The failures are exactly the one-over
and TimeClip-overflow refusal titles planned for BUG-006.

## Implementation Phase Evidence {#implementation-phase-evidence}

### Focused post-edit carrier

**Phase:** implement
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Capture Command:** `timeout 250 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 implement focused GREEN" -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 implement focused GREEN
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 376
sha256: 2d8d043dda9be543fc5603495dd515172e53a5839e1e80a3ca27d641db16dea9
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 19.762777
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 3.967375
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.591384
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 85.161072
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 21.697465
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 61
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1777.69418
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 2d8d043dda9be543fc5603495dd515172e53a5839e1e80a3ca27d641db16dea9 -- timeout 240 node --test tests/portfolio-foundation.unit.mjs -->

**Result:** PASS for the implementation phase's focused falsification check.
This invocation did not claim `bubbles.test` GREEN status or any broader
regression, audit, validation, or acceptance result.

### Final implementation packet lint

**Phase:** implement
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Capture Command:** `timeout 610 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 implement artifact lint" -- timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 implement artifact lint
$ timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow
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
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
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

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 -- timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow -->

**Result:** PASS

> **Uncertainty Declaration**
> **What was attempted:** The implementation owner ran the exact focused carrier,
> artifact lint, diff-format check, full changed-path inspection, and the
> source-only diff inspection.
> **What was observed:** The focused carrier passed 61 of 61 tests, artifact
> lint passed, `git diff --check` exited `0`, and all tracked changes remained
> inside the declared source, focused-test, and bug-packet boundary.
> **Why this is uncertain:** The allocation-page, eight-file browser matrix,
> canonical repository selftest, audit, validation, and human acceptance were
> outside this implementation-phase dispatch.
> **What would resolve this:** `bubbles.test` executes and records its planned
> focused GREEN accounting and broader regression rows before validation.

## Independent Test Phase Evidence

**Phase:** test
**Claim Source:** executed

The inherited dispatch packet was validated against authoritative session
control revision `216` before this phase read repository content:

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=<repo>
decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:216 revision=216
```

All product lanes used the exact commands recorded in `test-plan.json`. The
test phase also strengthened the overflow carrier so it executes direct Date
formatting and proves the chosen fixture throws `RangeError: Invalid time value`
before asserting that production validation prevents that path.

### Test Phase Command Ledger

| Command | Exit | Observed result |
| --- | ---: | --- |
| `timeout 600 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow --repo-root .` | 0 | 3 linked files/titles resolved; 3 category comparisons not applicable because no test-discovery adapter is declared |
| `timeout 240 node --test tests/portfolio-foundation.unit.mjs` | 0 | 61 tests, 61 passed, 0 failed, 0 skipped, 0 todo |
| `timeout 900 npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 16 passed |
| `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | 0 | 94 passed |
| `timeout 1800 node scripts/selftest.mjs` | 0 | 3426 passed, 0 failed |
| `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-foundation.unit.mjs` | 0 | 1 file scanned, adversarial signal present, 0 violations, 0 warnings |
| skip-marker scan on `tests/portfolio-foundation.unit.mjs` | 0 | 0 forbidden markers; the underlying `grep` exit was 1, meaning no matches |
| live interception scan across the eight Playwright carriers | 1 diagnostic | 4 textual matches: 3 comments and 1 executable disposable adversarial mutation in the accessibility carrier |
| `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-survival-accessibility.spec.mjs` | 0 | current production surface is asserted; mixed adversarial inspection accepted with 0 violations and 0 warnings |
| `timeout 60 bash .github/bubbles/scripts/test-leaf-receipt.sh resolve --repo-root . --names-only` | 0 | `adapter=none`; strict test-leaf receipts are not applicable |
| `timeout 120 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict` | 0 | global tool log: 11 total identities, 4 current, 3 valid closure-bearing identities, 0 stale, 1 unknown |

## TP-B006-001 {#tp-b006-001}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Capture Command:** `timeout 250 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 independent focused GREEN" -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 independent focused GREEN
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 376
sha256: 32f581845664464736cdb33c41bf42a279c550052d705902e8499534d1b221cb
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 18.929185
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 3.985276
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.816283
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 99.368397
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 39.208862
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 61
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1845.348099
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 32f581845664464736cdb33c41bf42a279c550052d705902e8499534d1b221cb -- timeout 240 node --test tests/portfolio-foundation.unit.mjs -->

An additional unfiltered run retained the exact title window and final totals:

```text
lines 1-5 and final 9 lines of the complete 70-line output
✔ RLPORTFOLIO is a frozen Node and browser dual-runtime contract (20.729574ms)
✔ mandatory policy is closed versioned finite and rejects unknown configuration (4.513773ms)
✔ BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary (2.745383ms)
✔ BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary (3.856076ms)
✔ BUG-006: an overflowing evidence window is refused before interest derivation (65.683202ms)
ℹ tests 61
ℹ suites 0
ℹ pass 61
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1954.208151
```

**Result:** PASS. `SCN-B006-BOUNDARY-ACCEPTED` is directly exercised by the
named title, including the independent `36525` derivation, committed `56`, and
non-finite refusal precedence assertions.

## TP-B006-002 {#tp-b006-002}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Focused carrier and exact title window](#tp-b006-001)

**Result:** PASS. The exact title
`BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary`
passed. The test asserts the frozen refusal and separately verifies that the
candidate still contains `36526`, so validation neither clamps nor replaces it.

## TP-B006-003 {#tp-b006-003}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Focused carrier and exact title window](#tp-b006-001)

**Result:** PASS. The exact title
`BUG-006: an overflowing evidence window is refused before interest derivation`
passed. The persistent test proves direct `toISOString()` formatting throws for
the fixture, then proves `deriveInterestSignals()` returns the frozen refusal
without allowing that exception to escape.

## TP-B006-004 {#tp-b006-004}

**Phase:** test
**Executed:** YES
**Command:** `timeout 900 npx --no-install playwright test tests/portfolio-survival-allocation.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Running 16 tests using 1 worker
	✓ 1 Regression: SCN-008-026 all six allocation methods share one frozen basis
	✓ 2 Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner
	✓ 3 Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation
	✓ 4 Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states
	✓ 5 Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence
	✓ 6 Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions
	✓ 7 Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence
	✓ 8 Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate
	✓ 9 Regression: Feature 008 allocation sensitivity ranges and Black Litterman editor preserve mobile table parity
	✓ 10 Regression: SCN-008-050 six real allocation methods enforce one complete basis and explicit views
	✓ 11 Regression: SCN-008-050 infeasible constraints remain visible and explicit BL posterior changes allocation
	✓ 12 Regression: SCN-008-031 dossier separates in sample walk forward costs and trials
	✓ 13 Regression: SCN-008-051 dossier preserves decision time costs trials corrections reload and private export
	✓ 14 Regression: SCN-008-032 efficiency claim is scoped to one tested information set
	✓ 15 Regression: SCN-008-033 correlation never emits a substantially identical verdict
	✓ 16 Regression: Feature 008 dossier ledgers claims corrections and private export remain accessible without mobile overlap
	16 passed (28.5s)
```

**Result:** PASS. This is allocation-page non-movement evidence for the
committed 56-day policy, not direct overflow-path evidence.

## TP-B006-005 {#tp-b006-005}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 Feature 008 eight-file browser matrix
exit: 0
lines: 303
sha256: 14bec301284897fc4c033f43fd336e4ab44b64292f62403dda5f924bc36fdca9
--- first 20 ---
Running 94 tests using 2 workers
	✓ 2 Regression: SCN-008-026 all six allocation methods share one frozen basis
	✓ 1 Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete
	✓ 3 Regression: SCN-008-027 allocation comparison presents tradeoffs and no universal winner
	✓ 5 Regression: SCN-008-029 conflicting constraints remain infeasible without relaxation
	✓ 6 Regression: Feature 008 six allocation rows preserve ordered mobile canvas table parity and infeasible states
	✓ 4 Regression: SCN-008-053 reduced motion forced colors contrast and text spacing preserve every decision
	✓ 7 Regression: Feature 008 Allocation refuses rather than showing candidate weights without evidence
	✓ 9 Regression: SCN-008-028 unstable allocation shows weight ranges and reversal conditions
	✓ 8 Adversarial: SCN-008-053 reduced accessibility implementations fail closed
	✓ 10 Regression: SCN-008-030 behavior cannot alter Black Litterman views returns or confidence
	✓ 11 Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
	✓ 12 Regression: SCN-008-030 explicit Black Litterman view keeps equilibrium view posterior and uncertainty separate
--- omitted 263 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ 83 Regression: SCN-008-017 marginal and total risk contributions reconcile
	✓ 85 Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies
	✓ 86 Regression: SCN-008-017 return contribution stays distinct from risk contribution
	✓ 84 Regression: SCN-008-021 missing survival definition renders distributions without probability
	✓ 87 Regression: SCN-008-015 manual assets and absent look through stay visible not omitted
	✓ 89 Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity
	✓ 90 Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
	✓ 91 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
	✓ 88 Regression: Feature 008 cash need timeline and path table preserve order and mobile canvas parity
	✓ 92 Regression: Feature 008 an incomplete cash need is refused rather than partly assumed
	✓ 93 Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
	✓ 94 Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
	94 passed (1.8m)
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 14bec301284897fc4c033f43fd336e4ab44b64292f62403dda5f924bc36fdca9 -- timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list -->

**Result:** PASS. All 94 tests in the exact eight-file Feature 008 browser
matrix passed.

## TP-B006-006 {#tp-b006-006}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 canonical repository selftest
exit: 0
lines: 3912
sha256: 4ff323c0038f4dc5bc5464f1a632045451dc16561cdf9c60b98d0be4ed1bd933
--- first 20 ---
Step 1 security — escaped model sinks and CSP on every page
	✓ every shipped HTML page carries a Content-Security-Policy meta
	✓ all pages use one identical CSP instead of drifting per page
	✓ CSP keeps the single-file inline-script design while defaulting to self
	✓ CSP blocks object, base-tag, and form exfiltration paths
	✓ CSP connect-src is an explicit origin allowlist, never wildcard https
	✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
	✓ no model/config-authored field reaches innerHTML without esc()
	✓ the sink detector catches an unescaped model-authored title
--- omitted 3872 line(s); sha256 above covers the full output ---
--- last 20 ---
	✓ a claim of 2 ticked and 1 open matches an artifact holding exactly those rows
	✓ a registry claiming more ticked rows than the artifact carries FAILS
	✓ a registry claiming fewer ticked rows than the artifact carries FAILS too
	✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped
	✓ the single-file bug-packet layout resolves all three of its claims
	✓ a scope already frozen in the baseline is carried as known debt rather than failing the run
	✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0
	✓ a scan that matches zero progress claims FAILS rather than passing vacuously
	✓ the scan read real progress claims against a present baseline
	✓ every committed progress claim resolves to a scope artifact the guard can actually read
	✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline
================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 4ff323c0038f4dc5bc5464f1a632045451dc16561cdf9c60b98d0be4ed1bd933 -- timeout 1800 node scripts/selftest.mjs -->

**Result:** PASS.

## Test Quality Audit

**Phase:** test
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/portfolio-foundation.unit.mjs
Adversarial signal detected in tests/portfolio-foundation.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
skip-marker-scan: 0 matches (grep exit 1 means clean)
live-mock-scan: 4 textual matches across 8 files
three matches are comments in tests/portfolio-survival-foundation.spec.mjs
one executable match is the disposable adversarial mutation in tests/portfolio-survival-accessibility.spec.mjs
BUBBLES REGRESSION QUALITY GUARD
Asserts the current surface in tests/portfolio-survival-accessibility.spec.mjs (mixed inspection accepted)
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
test-leaf-receipt adapter=none
```

The executable `page.route()` is not offered as the sole proof of the shipped
surface. The same accessibility test first asserts the healthy current page,
then serves an in-memory reduced copy as its negative control. The canonical
guard accepted this mixed proof, so no live-category gap or reclassification
was created.

### Self-Validating Test Audit

- **Tests audited:** the three BUG-006 tests in
	`tests/portfolio-foundation.unit.mjs`.
- **Self-validating tests found:** 0.
- **Mechanism:** each assertion calls production `validatePolicy()` or
	`deriveInterestSignals()` and checks a transformed result or refusal. The
	direct Date assertion independently proves the overflow fixture itself.
- **Negative control:** the recorded pre-fix run failed exactly the one-over
	and overflow refusal titles while the accepted-boundary control passed.
- **Persistent coverage:** all three titles remain in the committed carrier;
	no skip, only, todo, pending, or bailout marker was found.

## TP-B006-007 {#tp-b006-007}

**Phase:** test
**Executed:** YES
**Claim Source:** executed

```text
artifact-lint.sh
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.

traceability-guard.sh
exit: 0
lines: 48
sha256: f0dbd5fd272ae159ca257d967374cdd021985a5bea534999ae41fcfcb96a2bc2
Scenarios checked: 3
Test rows checked: 10
Scenario-to-row mappings: 3
Concrete test file references: 3
Report evidence references: 3
DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
Edge confidence: declared=6 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)

scenario-obligation-lint.sh
exit: 0
[scenario-obligation-lint] OK — 3 scenario(s) with a coherent derived obligation matrix

test-mechanism-lint.sh
exit: 0
[test-mechanism-lint] OK — 3 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)

scope-context-fit-lint.sh
exit: 0
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained

scenario-test-resolve.sh
exit: 0
[scenario-test-resolve] OK — 3 reference(s) resolved via literal-scan; 3 category comparisons not applicable

test-leaf-receipt.sh resolve --names-only
exit: 0
adapter=none
```

**Result:** PASS. Strict test-leaf receipt assertion is not applicable because
the project adapter resolves to `none`. This applies only to test-leaf receipts;
it does not disable global receipt verification and does not mean the global
structured tool-call log is absent. No test-leaf receipt was treated as proof.

### Global Evidence Receipt Integrity

**Phase:** test
**Executed:** YES
**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"total": 11,
	"current": 4,
	"superseded": 7,
	"withClosure": 3,
	"valid": 3,
	"stale": 0,
	"unknown": 1,
	"staleReceipts": []
}
STRICT_RECEIPT_EXIT=0
```

**Result:** PASS. `.specify/runtime/tool-calls.jsonl` exists and the global
strict receipt checker applies. All three current identities carrying closure
receipts are valid and non-stale; the checker reports one additional current
identity as unknown and still exits `0`. Global receipt integrity is current;
only the adapter-specific test-leaf receipt layer is not applicable.

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

## TP-B006-009 {#tp-b006-009}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Capture Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "TP-B006-009 pre-fix brief RED" -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# TP-B006-009 pre-fix brief RED
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 1
lines: 296
sha256: 9a0252da789da26cb85fa2da78c7754dfa3a572485c28e6d68e7b94c1ec8eade
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
	---
	duration_ms: 264.291403
	type: 'test'
	...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
	---
	duration_ms: 49.337839
	type: 'test'
	...
# Subtest: behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
	---
	duration_ms: 123.636448
	type: 'test'
	...
# Subtest: dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference
--- failure-shaped lines from the omitted region ---
not ok 15 - BUG-006: composeBrief validates shared evidence-age policy before Date formatting
--- omitted 256 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 28 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
	---
	duration_ms: 1.392693
	type: 'test'
	...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 29 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
	---
	duration_ms: 104.037251
	type: 'test'
	...
1..29
# tests 29
# suites 0
# pass 28
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 775.465404
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 9a0252da789da26cb85fa2da78c7754dfa3a572485c28e6d68e7b94c1ec8eade -- timeout 240 node --test tests/portfolio-brief.functional.mjs -->

**Result:** FAIL as required for the scenario-first RED phase. The exact
persistent title failed while 28 neighboring controls passed and 0 tests were
skipped. The test reaches its final aggregate assertion only after the local
`composedAt` error precedence, committed `56`, accepted `36525`, shared
validator envelopes, and direct backward-TimeClip `RangeError` control have all
passed. A title-scoped diagnostic of the same test observed that current
`composeBrief()` returned `ok: true` with cutoff
`1926-07-14T15:40:00.000Z` for `36526`, returned `ok: true` with a null cutoff
for `Infinity`, and threw `RangeError: Invalid time value` for `100100000`.
The shared validator refused those same inputs with the planned exact
envelopes. Product source was unchanged; `TP-B006-010` remains unexecuted.

## TP-B006-010 {#tp-b006-010}

**Phase:** test
**Executed:** YES (current session)
**Claim Source:** executed
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Capture Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 TP-B006-010 focused brief GREEN" -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0

```text
# BUG-006 TP-B006-010 focused brief GREEN
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 184
sha256: 7adf69a805de7ce12fbb1cc4f1b3955a83c69ec6f11f916ac431d112a450bc26
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
	---
	duration_ms: 238.416438
	type: 'test'
	...
--- omitted 144 line(s); sha256 above covers the full output ---
--- last 20 ---
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 29 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
	---
	duration_ms: 95.170816
	type: 'test'
	...
1..29
# tests 29
# suites 0
# pass 29
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 715.146516
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 7adf69a805de7ce12fbb1cc4f1b3955a83c69ec6f11f916ac431d112a450bc26 -- timeout 240 node --test tests/portfolio-brief.functional.mjs -->

**Result:** PASS. The carrier contains 29 exact test titles. The scenario title
`BUG-006: composeBrief validates shared evidence-age policy before Date formatting`
is test 15 and passed. Its assertions prove existing local-error precedence,
unchanged committed `56` behavior, successful `36525` composition, exact shared
refusals for `36526` and `Infinity`, and shared refusal for `100100000` without
an escaped `RangeError`. The structured receipt at `2026-08-25T23:46:20Z` also
records this exact command at exit 0 with the scenario binding and current
source/test closure; that receipt is inspected history, while the block above is
the independently executed test-owner proof.

## TP-B006-011 {#tp-b006-011}

**Phase:** test
**Executed:** YES (current session)
**Command:** `timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Capture Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 TP-B006-011 focused mutation-anchor regression" -- timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The focused carrier block is direct executed evidence. The
earlier structured receipt table is interpreted because the ledger preserves
exit status and closure, but not raw stdout.

### Receipt History Reconciliation

The ledger preserves exit status and input closure, but not raw stdout. The
three pre-repair entries therefore support only an interpreted failure-history
claim; no missing failure title or output is reconstructed here.

| Receipt UTC | Combined four-carrier exit | Behavior carrier closure |
| --- | ---: | --- |
| `2026-08-25T23:46:44Z` | 1 | `0f4daecfab34efc1ff647ee9863c1874bc185a3b61166015171fddb63a594cd8` |
| `2026-08-25T23:53:02Z` | 1 | `0f4daecfab34efc1ff647ee9863c1874bc185a3b61166015171fddb63a594cd8` |
| `2026-08-25T23:59:18Z` | 1 | `0f4daecfab34efc1ff647ee9863c1874bc185a3b61166015171fddb63a594cd8` |

The source repair added a second copy of the shared two-line validator pair in
`composeBrief()`. The prior test mutation matched that pair alone, so its
exactly-once guard became ambiguous. The test-only correction anchors the pair
to the uniquely following `retainedIdentityOrder.forEach` statement, replaces
the composite anchor with that same loop opener, and adds assertions that one
validation pair disappears while the loop and the separate `composeBrief()`
pair remain. This is a mutation-harness correction, not a product behavior
change and not a change to the BUG-004 expected outcome.

| Receipt UTC | Combined four-carrier exit | Behavior carrier closure |
| --- | ---: | --- |
| `2026-08-26T00:04:56Z` | 0 | `c52dd64c26a5247ccd860706eaaf31dc711499a323115a79909cb0d75c25a920` |
| `2026-08-26T00:05:08Z` | 0 | `c52dd64c26a5247ccd860706eaaf31dc711499a323115a79909cb0d75c25a920` |
| `2026-08-26T00:05:23Z` | 0 | `c52dd64c26a5247ccd860706eaaf31dc711499a323115a79909cb0d75c25a920` |

### Focused Current Proof

```text
# BUG-006 TP-B006-011 focused mutation-anchor regression
$ timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs
exit: 0
lines: 58
sha256: 863a84dbb54f642f11f0bb8d2f1aaa6e5d5678f5fcd234854940cec172b71749
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 75.713641
	type: 'test'
	...
--- omitted 18 line(s); sha256 above covers the full output ---
--- last 20 ---
# Subtest: BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
ok 8 - BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
	---
	duration_ms: 11.773229
	type: 'test'
	...
1..8
# tests 8
# suites 0
# pass 8
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 719.36144
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 863a84dbb54f642f11f0bb8d2f1aaa6e5d5678f5fcd234854940cec172b71749 -- timeout 240 node --test tests/portfolio-behavior-occurrence.unit.mjs -->

**Result:** PASS. The carrier contains eight exact test titles. The planned
mutation-control title is test 8 and passed, including its one-pair removal,
retained-loop, remaining-brief-pair, corrupt-policy fail-open, and valid-policy
equivalence assertions.

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

1. `bubbles.test` adds the persistent
	`tests/portfolio-brief.functional.mjs` consumer case and records the observed
	`TP-B006-009` RED result before any brief source edit.
2. `bubbles.implement` adds only the planned shared-validator delegation in
	`rlportfoliobrief.js::composeBrief()` and routes back to test ownership.
3. `bubbles.test` records `TP-B006-010` GREEN, reruns the preserved focused and
	consumer-surface regressions, and updates execution evidence without changing
	planner-owned test definitions.
4. `bubbles.validate` runs the packet and transition guards and owns any
	certification write.

## Regression Phase Evidence {#regression-phase-2026-08-25}

> **Verdict status:** Superseded for current-tree use by
> [Post-Expansion Regression Re-evaluation](#regression-phase-round-2). The
> commands and observations below remain valid historical evidence for the
> narrower `9b594d439` checkpoint, but its verdict predates the added
> `composeBrief()` consumer and BUG-004 mutation-anchor surfaces.

**Phase:** regression
**Claim Source:** interpreted
**Interpretation:** The technical checkpoint is regression-free within the
declared BUG-006 boundary. The production delta adds one private constant and
one centralized validator predicate. The focused test delta adds three tests
and deletes none. Current execution preserved the BUG-004 occurrence contract,
the BUG-005 stale-domain contract, the brief-side policy ordering, and the
committed 56-day policy. No product or test file was changed by this phase.

### Checkpoint And Contract Review

The reviewed checkpoint is `9b594d439651036dc323fb79f5cc7507af325ab4`.
Its product delta is confined to `rlportfolio.js` and
`tests/portfolio-foundation.unit.mjs`; the remaining five changed paths are
this bug packet's execution records.

| Concern | Grounded result |
| --- | --- |
| Validator ordering | `findNonFinite()` still runs before section semantics. Infinity therefore retains `non-finite-policy` and the precise `policy.behavior.maximumEvidenceAgeDays` field. |
| New rejection | Only finite values above `100 * 365 + 25` enter the existing `P008-CONFIG / invalid-policy / behavior` envelope. |
| Core derivation | `rlportfolio.deriveInterestSignals()` still calls `validatePolicy()` before workspace validation and Date arithmetic. |
| Brief derivation | `rlportfoliobrief.deriveInterestSignals()` is unchanged. Its existing floor guard still precedes its shared `portfolio.validatePolicy()` call. |
| BUG-004 | The age filter remains before semantic collapse, so a stale first occurrence cannot erase a fresh repeat. The occurrence-identity and anti-inflation carrier remained green. |
| BUG-005 | Bucket creation remains after age filtering, so stale-only domains remain omitted and cannot suppress fresh siblings. The six-row BUG-005 carrier remained green. |
| Shipped policy | `portfolio-survival-allocation.config.json` remains byte-unchanged at `maximumEvidenceAgeDays: 56`. |
| Public surface | No export, schema, route, HTML, storage, or public contract version changed. |
| Pages artifact | The local ignored `_site/rlportfolio.js` was stale build output, not a second source owner. `scripts/build-pages-site.mjs` deletes `_site` and copies the current root files before the Pages verify and deploy jobs. |
| Coverage delta | `git grep -c '^test('` measured 58 top-level tests at `9b594d439^` and 61 at `9b594d439`. The focused carrier changed by 81 additions and 0 deletions, exactly adding the three persistent BUG-006 tests. The project registry declares no coverage-percentage command, so no unexecuted percentage is claimed. |

`git diff --exit-code 9b594d439^ 9b594d439` produced no output for the
committed policy, `rlportfoliobrief.js`, the allocation HTML, and the BUG-004,
BUG-005, and brief carriers. That zero exit confirms the named neighboring
surfaces were not edited by the checkpoint.

### Existing Receipt Inspection

**Phase:** regression
**Claim Source:** interpreted
**Interpretation:** These are prior-session structured receipts inspected for
freshness and input identity. They are not adopted as this phase's test
execution.

- The report records focused GREEN output hash
	`32f581845664464736cdb33c41bf42a279c550052d705902e8499534d1b221cb`,
	eight-file browser hash
	`14bec301284897fc4c033f43fd336e4ab44b64292f62403dda5f924bc36fdca9`,
	and selftest hash
	`4ff323c0038f4dc5bc5464f1a632045451dc16561cdf9c60b98d0be4ed1bd933`.
- The latest four-carrier tool-log row records stdout hash
	`0e60a167f435a3e3d31c041609e5354b9de84e5b8dd8bc5c3452e06edf4ec083`
	and empty-stderr hash
	`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
- A current `sha256sum` matched every input closure in that row:
	`rlportfolio.js` `f04211203e975d4d92219bad4a4c03c32d54b46e6ef5cb95a46da9cf5a4152c8`,
	`rlportfoliobrief.js` `14df3cc796e151d7c07a01d37b1fc2a6130a70b53baaf81a8a8f0615fe42ebb3`,
	and the four carrier hashes recorded in `.specify/runtime/tool-calls.jsonl`.
- The latest browser and selftest receipts also carry the current
	`rlportfolio.js` hash. Their stdout hashes are
	`7be70819ec4b117d6d79ad18ce833390e46b7dce9103ac8eeb3d6a50e193846f`
	and `40e2461d9890cbb9e6f5161f200ebbdf86272cac48415e89b2c9e62b13867e8f`.

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
{
	"total": 11,
	"current": 4,
	"superseded": 7,
	"withClosure": 3,
	"valid": 3,
	"stale": 0,
	"unknown": 1,
	"staleReceipts": []
}
```

The one `unknown` identity is reported rather than upgraded to valid. The
strict checker still exits zero with no stale receipt.

### Independent Four-Carrier Closure

**Phase:** regression
**Command:** `timeout 650 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 regression four-carrier closure" -- timeout 600 node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 regression four-carrier closure
$ timeout 600 node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 628
sha256: 6b2eca1024f6b2d40bb8c770ea024f4d96dd6967a6c3104a8674ddcea92fd70d1
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 88.747059
	type: 'test'
	...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
	---
	duration_ms: 37.72427
	type: 'test'
	...
# Subtest: BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
ok 3 - BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
	---
	duration_ms: 91.469243
	type: 'test'
	...
# Subtest: BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap
--- omitted 588 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 102 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
	---
	duration_ms: 92.779935
	type: 'test'
	...
# Subtest: BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
ok 103 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
	---
	duration_ms: 66.600794
	type: 'test'
	...
1..103
# tests 103
# suites 0
# pass 103
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1921.218194
```

This phase deliberately did not rerun the 94-test browser matrix or the
3426-check selftest. Their current input-bound receipts were inspected above,
and the four-carrier closure directly covers the changed validator and the
neighboring behavior paths.

### Regression Quality Guards

**Phase:** regression
**Claim Source:** executed

```text
$ timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-foundation.unit.mjs
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: <repo>
	Timestamp: 2026-08-25T22:08:00Z
	Bugfix mode: false
============================================================

Scanning tests/portfolio-foundation.unit.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
============================================================
```

```text
$ timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-foundation.unit.mjs
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: <repo>
	Timestamp: 2026-08-25T22:08:08Z
	Bugfix mode: true
============================================================

Scanning tests/portfolio-foundation.unit.mjs
Adversarial signal detected in tests/portfolio-foundation.unit.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

Both required guard modes exited zero. No skip, only, todo, pending-test, or
bailout pattern was introduced by the focused carrier.

### Load-Bearing Predicate Control

**Phase:** regression
**Command:** `timeout 120 node --input-type=commonjs --eval '<in-memory exact-predicate removal and current-versus-mutant assertions>'`
**Exit Code:** 0
**Claim Source:** executed

The command read `rlportfolio.js`, required the ceiling predicate to occur
exactly once, removed only that predicate in memory, evaluated the resulting
module in a browser-shaped root, and compared it with the shipped module. It
did not write a repository file.

```text
BUG-006 in-memory predicate mutation
mutationAnchorCount=1
diskWrite=false
boundaryDays=36525
currentBoundaryOk=true
mutantBoundaryOk=true
oneOverDays=36526
currentOneOverOk=false
currentOneOverCode=P008-CONFIG
currentOneOverReason=invalid-policy
currentOneOverField=behavior
mutantOneOverOk=true
overflowFixture=RangeError:Invalid time value
currentOverflowOk=false
verdict=predicate-load-bearing
```

The negative control is discriminating: removing only the ceiling predicate
makes `36526` valid, while the shipped module refuses it. The independent
overflow calculation still throws `RangeError`, so the fixture is not a
plausible-but-safe large value.

### Regression Verdict And Routing

`REGRESSION_FREE`. No failing test, coverage-count decrease, weakened
assertion, shared-contract conflict, or missed production consumer was found.
The packet, scope, Definition of Done, certification, and human acceptance
remain unchanged and `in_progress`. The next phase owner is
`bubbles.simplify` for the bugfix-fastlane complexity review.

## Simplify Phase - 2026-08-25 {#simplify-phase-2026-08-25}

Executed as `bubbles.simplify` under the persisted `bugfix-fastlane` direct
authorized runner at technical checkpoint `9b594d439`. The review stayed inside
the changed product surface: `rlportfolio.js`,
`tests/portfolio-foundation.unit.mjs`, and this bug packet's simplify-owned
execution record. It changed no product source or test.

### Three-Pass Review

| Pass | Finding | Verdict |
| --- | --- | --- |
| Reuse | The private ceiling has one production use. The two refusal assertions already share `invalidBehaviorPolicyRefusal()`. | No missing shared abstraction or cross-file duplication. |
| Quality | The source change is one named private constant, one rationale comment, and one validator predicate. The three test titles separate boundary acceptance, one-over refusal, and the overflow failure chain. | The changed path is direct, field-specific, and readable. No dead code or unnecessary branch was found. |
| Efficiency | Validation adds one numeric comparison and no allocation, iteration, serialization, I/O, or additional Date work. The focused tests follow the file's existing per-test `loadContracts()` isolation pattern. | No runtime or test-harness optimization is justified. |

### Rejected Simplification Candidates

| Candidate | Why it was rejected |
| --- | --- |
| Hoist `100 * 365 + 25` into a test-file constant and reuse it in both boundary cases. | The repeated derivation is a small independent oracle in each adversarial case. Sharing test setup would save one expression while coupling the boundary and one-over fixtures to the same mutable declaration. |
| Replace `invalidBehaviorPolicyRefusal()` with one shared object constant. | The helper has exactly two callers and returns a fresh expected object each time. A shared object would save one call but permit accidental cross-test mutation and would not clarify the contract. |
| Collapse the direct TimeClip `assert.throws`, `assert.doesNotThrow`, and final refusal assertion into one shorter assertion. | Each assertion proves a different required fact: the fixture really overflows, the production call does not leak that exception, and the returned refusal keeps the exact envelope. Combining them would reduce diagnostic precision. |
| Extract a production helper for the single `maximumEvidenceAgeDays` comparison. | A one-use helper would add indirection around a field-specific policy rule and separate the bound from the exact `behavior` refusal it controls. The existing inline predicate is smaller and clearer. |

### Focused Confirmation

**Phase:** simplify
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 simplify focused confirmation" -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 simplify focused confirmation
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 376
sha256: 1baab5e22669ad48123b29bf02527790e44143a09c4ee2b53dbd99f784bfcf87
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 19.545284
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 4.067476
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.684584
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 81.191717
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 23.244662
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 61
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1943.01665
```

### Simplify Verdict And Routing

`MINIMAL_NO_CHANGE`. The implementation and focused tests already express the
contract with less risk than any reviewed alternative. This is a cleanup
verdict, not certification and not a new test-phase claim. Scope and packet
status remain `in_progress`; certification, human acceptance, planner content,
and Definition of Done checks remain untouched. The next required phase owner
is `bubbles.gaps`.

## Gaps Phase - 2026-08-25 {#gaps-phase-2026-08-25}

**Phase:** gaps
**Agent:** `bubbles.gaps`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** The committed `rlportfolio.js` repair satisfies the three
planned BUG-006 scenarios, but the design consumer inventory omits an exported
`rlportfoliobrief.js::composeBrief()` Date-formatting path. That function does
not call `portfolio.validatePolicy()` before subtracting
`maximumEvidenceAgeDays` and calling `toISOString()`. Current execution proves
that it accepts `36526` and throws `RangeError` for a larger finite policy that
the shared validator refuses. This is a real implementation and test gap, so
the phase cannot report `NO_GAPS` or route to hardening.

### Requirement, Acceptance, And Scenario Accounting

| Contract | Result | Concrete evidence |
| --- | --- | --- |
| `FR-B006-001` | Match | `rlportfolio.js` defines one private `MAXIMUM_EVIDENCE_AGE_DAYS = 100 * 365 + 25` with the century and leap-day rationale. |
| `FR-B006-002` | Partial | `validatePolicy()` owns the planned refusal, but exported `composeBrief()` consumes the same policy without invoking it. |
| `FR-B006-003` | Match in the shared validator | Current execution accepts `0`, `56`, and `36525`; it refuses `36526` with the frozen behavior envelope. |
| `FR-B006-004` | Partial | Core `deriveInterestSignals()` remains validate-first. Brief `composeBrief()` formats its separate action-history cutoff without validation. |
| `FR-B006-005` | Partial | The persistent carrier proves core forward-TimeClip refusal. No persistent case covers the brief-side backward-TimeClip path. |
| `FR-B006-006` | Match for the committed repair | The committed policy remains `56`; no public schema, storage schema, signal shape, expiry expression, or other policy numeric bound changed at checkpoint `9b594d439`. |
| `AC-1` | Match | `36525` passes the shared validator and focused test. |
| `AC-2` | Match only at the planned entry point | `36526` returns `P008-CONFIG / invalid-policy / behavior` from `validatePolicy()`, while `composeBrief()` returns success for the same policy. |
| `AC-3` | Match only at the planned entry point | Core derivation returns the refusal without throwing; brief composition can still throw on its own Date calculation. |
| `AC-4` | No new movement found | The committed config remains `56`; prior browser and selftest receipts remain input-bound to the current product hash and were not rerun in this phase. |

All three declared scenarios map cleanly to their structured rows and current
focused tests:

- `SCN-B006-BOUNDARY-ACCEPTED` -> `TP-B006-001`
- `SCN-B006-ONE-OVER-REFUSED` -> `TP-B006-000`, `TP-B006-002`
- `SCN-B006-OVERFLOW-REFUSED` -> `TP-B006-000`, `TP-B006-003`

The manifest and test plan omit the newly proven consumer behavior. A planning
owner must add a scenario and persistent brief-carrier row only after design
reconciles the missed consumer and error-order contract.

### Actual Consumer And Arithmetic Inventory

| Surface | Current behavior | Gap status |
| --- | --- | --- |
| `portfolio-survival-allocation.config.json` | Supplies the unchanged `56`-day policy. | Match |
| `rlportfolio.js::validatePolicy` | Sole owner of the new `36525` semantic maximum; `findNonFinite()` still precedes it. | Match |
| `rlportfolio.js::deriveInterestSignals` | Validates before workspace checks, age filtering, and forward expiry formatting. | Match |
| `rlportfoliobrief.js::deriveInterestSignals` | Keeps its existing floor-error precedence, then calls the shared validator before signal construction. | Match |
| `rlportfoliobrief.js::composeBrief` | Subtracts an aliased `maxAgeDays` and calls `toISOString()` without shared policy validation. | **Gap `GAP-B006-001`** |
| `portfolio-survival-allocation-lab.html` | Boot validates the fetched policy before storing it in `state.policy`; later ranking reads only that validated value. | Match |
| `_site/**` | Ignored generated output. `build-pages-site.mjs` removes `_site` and copies current root files on every package build. | Not a second source owner |

The exact-key sweep found no second policy validator for Feature 008. The only
other root `function validatePolicy` belongs to the unrelated `rlvol.js`
contract. The page performs age subtraction only. The two formatting paths are
the forward expiry in `rlportfolio.js` and the backward action-history cutoff in
`rlportfoliobrief.js`.

### Executed Consumer-Bypass Probe

**Phase:** gaps
**Command:** `timeout 60 node --input-type=commonjs --eval 'const fs=require("node:fs"); const portfolio=require("./rlportfolio.js"); const brief=require("./rlportfoliobrief.js"); const policy=JSON.parse(fs.readFileSync("portfolio-survival-allocation.config.json","utf8")); const windows=JSON.parse(fs.readFileSync("market-brief.config.json","utf8")).windows; const withAge=(days)=>({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:days}}); const input=(days)=>({windows,windowId:"morning",publishedAt:"2026-07-15T15:05:00.000Z",composedAt:"2026-07-15T15:40:00.000Z",holdings:[],watchlist:[],completions:[],evidence:[],policy:withAge(days)}); const oneOverValidation=portfolio.validatePolicy(withAge(36526)); const hugeDays=100100000; const hugeValidation=portfolio.validatePolicy(withAge(hugeDays)); let oneOverResult=null; let oneOverError=null; let hugeResult=null; let hugeError=null; try{oneOverResult=brief.composeBrief(input(36526));}catch(error){oneOverError=error;} try{hugeResult=brief.composeBrief(input(hugeDays));}catch(error){hugeError=error;} console.log("BUG-006 public consumer bypass probe"); console.log("oneOverDays=36526"); console.log("validatePolicy.oneOver.ok="+oneOverValidation.ok); console.log("validatePolicy.oneOver.reason="+(oneOverValidation.error&&oneOverValidation.error.reason)); console.log("composeBrief.oneOver.threw="+Boolean(oneOverError)); console.log("composeBrief.oneOver.ok="+(oneOverResult&&oneOverResult.ok)); console.log("hugeDays="+hugeDays); console.log("validatePolicy.huge.ok="+hugeValidation.ok); console.log("validatePolicy.huge.reason="+(hugeValidation.error&&hugeValidation.error.reason)); console.log("composeBrief.huge.threw="+Boolean(hugeError)); console.log("composeBrief.huge.error="+(hugeError?hugeError.name+":"+hugeError.message:"none")); console.log("composeBrief.huge.result="+(hugeResult?JSON.stringify(hugeResult):"none")); const confirmed=oneOverValidation.ok===false&&oneOverResult&&oneOverResult.ok===true&&hugeValidation.ok===false&&hugeError&&hugeError.name==="RangeError"; console.log("verdict="+(confirmed?"CONSUMER_BYPASS_CONFIRMED":"NOT_CONFIRMED")); if(!confirmed) process.exitCode=1;'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 public consumer bypass probe
oneOverDays=36526
validatePolicy.oneOver.ok=false
validatePolicy.oneOver.reason=invalid-policy
composeBrief.oneOver.threw=false
composeBrief.oneOver.ok=true
hugeDays=100100000
validatePolicy.huge.ok=false
validatePolicy.huge.reason=invalid-policy
composeBrief.huge.threw=true
composeBrief.huge.error=RangeError:Invalid time value
composeBrief.huge.result=none
verdict=CONSUMER_BYPASS_CONFIRMED
```

### Executed Boundary And Precedence Probe

**Phase:** gaps
**Command:** `timeout 60 node --input-type=commonjs --eval 'const fs=require("node:fs"); const api=require("./rlportfolio.js"); const policy=JSON.parse(fs.readFileSync("portfolio-survival-allocation.config.json","utf8")); const cases=[["negative",-1],["zero",0],["shipped",56],["ceiling",100*365+25],["one-over",100*365+26],["infinity",Infinity],["backward-overflow",100100000]]; console.log("BUG-006 validator edge and precedence probe"); console.log("committedValue="+policy.behavior.maximumEvidenceAgeDays); console.log("namedBoundary="+(100*365+25)); for(const [label,value] of cases){const result=api.validatePolicy({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:value}}); console.log(label+" value="+value+" ok="+result.ok+" code="+(result.error&&result.error.code||"none")+" reason="+(result.error&&result.error.reason||"none")+" field="+(result.error&&result.error.field||"none"));} const infinity=api.validatePolicy({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:Infinity}}); const oneOver=api.validatePolicy({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:36526}}); const expectations=api.validatePolicy(policy).ok===true&&api.validatePolicy({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:0}}).ok===true&&api.validatePolicy({...policy,behavior:{...policy.behavior,maximumEvidenceAgeDays:-1}}).error.reason==="invalid-policy"&&oneOver.error.reason==="invalid-policy"&&oneOver.error.field==="behavior"&&infinity.error.reason==="non-finite-policy"&&infinity.error.field==="policy.behavior.maximumEvidenceAgeDays"; console.log("precedenceAndBoundaries="+(expectations?"CONFIRMED":"FAILED")); if(!expectations) process.exitCode=1;'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 validator edge and precedence probe
committedValue=56
namedBoundary=36525
negative value=-1 ok=false code=P008-CONFIG reason=invalid-policy field=behavior
zero value=0 ok=true code=none reason=none field=none
shipped value=56 ok=true code=none reason=none field=none
ceiling value=36525 ok=true code=none reason=none field=none
one-over value=36526 ok=false code=P008-CONFIG reason=invalid-policy field=behavior
infinity value=Infinity ok=false code=P008-CONFIG reason=non-finite-policy field=policy.behavior.maximumEvidenceAgeDays
backward-overflow value=100100000 ok=false code=P008-CONFIG reason=invalid-policy field=behavior
precedenceAndBoundaries=CONFIRMED
```

The lower edge is the unchanged generic `finiteNonNegative()` contract rather
than a new BUG-006 requirement. No BUG-006-specific negative-value test exists,
but current execution confirms `-1` is refused and `0` is accepted. The changed
upper-bound and non-finite precedence have persistent focused assertions.

### Focused Carrier Confirmation

**Phase:** gaps
**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 gaps focused confirmation" -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 gaps focused confirmation
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 376
sha256: 8dca5c1db415a91ac199ab9ae295e248de6b30d91dbfe6f08b5859e893e5d45e
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 20.671075
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 4.259474
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.865382
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 76.415717
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 22.296559
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 61
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1824.381103
```

The green carrier proves the three declared scenarios. It also demonstrates
that those scenarios do not detect the exported brief-consumer bypass.

### Findings And Required Route

| Finding | Classification | Evidence | Required owner action |
| --- | --- | --- | --- |
| `GAP-B006-001` | 🔴 MISSING implementation coverage, medium | `composeBrief(36526)` succeeds; `composeBrief(100100000)` throws while `validatePolicy()` refuses both. | `bubbles.design` reconciles the omitted consumer, required refusal ordering, and change boundary before code changes. |
| `GAP-B006-002` | ⬛ UNTESTED consumer path, medium | `scenario-manifest.json` and `test-plan.json` cover only the shared validator and core derivation. | After design reconciliation, `bubbles.plan` adds a scenario and persistent `tests/portfolio-brief.functional.mjs` row, then routes RED -> implement -> GREEN. |

**Verdict:** `GAPS_REMAIN`. No product source or test was edited. No broad suite
was rerun because the current input-bound browser/selftest receipts remain valid
and the direct probe already falsified the clean hypothesis. The packet and
scope remain `in_progress`; certification, human acceptance, planning text, and
Definition of Done checks remain unchanged.

## Second-Round Implementation Phase Evidence {#implementation-phase-round-2}

**Phase:** implement
**Claim Source:** executed

The inherited repository packet was validated against session
`vscode-d037d272141b9d17af8fa6ccdd049e69` and authoritative control revision
`216` before repository reads. The canonical validator returned
`REPOSITORY PACKET VALID actionable=true repository=research-lab`. The persisted
`bugfix-fastlane` mode was then resolved with its grandfathered registry key and
reported `statusCeiling: done`.

### Source Decision

**Claim Source:** interpreted
**Interpretation:** The two-line delegation is the smallest repair because its
placement and unchanged-return behavior match every reconciled contract while
the focused carrier directly discriminates that placement.

The reconciled spec, design, Scope 01 plan, source-only diff, shared validator,
and complete `composeBrief()` prerequisite sequence agree on one repair. The
existing candidate calls `portfolio.validatePolicy(input.policy)` once after
the local input, policy-presence, publication timestamp, composition timestamp,
window-id, cutoff, and collection-normalization checks. It returns a failed
shared result unchanged immediately before the first
`maximumEvidenceAgeDays` read. The implementation owner retained those two
statements and corrected only their indentation. No local ceiling, refusal
translation, catch, clamp, Date-expression change, or shared-validator edit was
introduced.

### Exact Brief Carrier

**Executed:** YES (current session)
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Capture Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-006 implement round-2 brief GREEN' -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 implement round-2 brief GREEN
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 184
sha256: ceaf24cf926ce44bedafc57c978a8245980dc0f7f74a496420ee60ddb66c4cad
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
	---
	duration_ms: 331.973906
	type: 'test'
	...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
	---
	duration_ms: 51.732459
	type: 'test'
	...
# Subtest: behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
	---
	duration_ms: 98.653449
	type: 'test'
	...
--- omitted 144 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 28 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
	---
	duration_ms: 1.58059
	type: 'test'
	...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 29 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
	---
	duration_ms: 93.049686
	type: 'test'
	...
1..29
# tests 29
# suites 0
# pass 29
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 870.731849
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify ceaf24cf926ce44bedafc57c978a8245980dc0f7f74a496420ee60ddb66c4cad -- timeout 240 node --test tests/portfolio-brief.functional.mjs -->

**Result:** PASS for the implement-owned discriminating check. Independent
TP-B006-010 accounting remains test-owned.

### Focused Shared-Validator Carrier

**Executed:** YES (current session)
**Command:** `timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Capture Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-006 implement round-2 foundation GREEN' -- timeout 240 node --test tests/portfolio-foundation.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 implement round-2 foundation GREEN
$ timeout 240 node --test tests/portfolio-foundation.unit.mjs
exit: 0
lines: 376
sha256: 4e9643f986e06c167bf279ea7bdb5c5d0bd2d241aabaf9d79701818dc1b603ae
--- first 20 ---
TAP version 13
# Subtest: RLPORTFOLIO is a frozen Node and browser dual-runtime contract
ok 1 - RLPORTFOLIO is a frozen Node and browser dual-runtime contract
	---
	duration_ms: 37.073787
	type: 'test'
	...
# Subtest: mandatory policy is closed versioned finite and rejects unknown configuration
ok 2 - mandatory policy is closed versioned finite and rejects unknown configuration
	---
	duration_ms: 6.135865
	type: 'test'
	...
# Subtest: BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
ok 3 - BUG-006: maximumEvidenceAgeDays accepts the named 100-year boundary
	---
	duration_ms: 2.958683
	type: 'test'
	...
--- omitted 336 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 60 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 132.297143
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 61 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 35.192898
	type: 'test'
	...
1..61
# tests 61
# suites 0
# pass 61
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3021.636775
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 4e9643f986e06c167bf279ea7bdb5c5d0bd2d241aabaf9d79701818dc1b603ae -- timeout 240 node --test tests/portfolio-foundation.unit.mjs -->

**Result:** PASS for the shared validation owner regression.

### Artifact And Change-Boundary Checks

**Executed:** YES (current session)
**Command:** `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Capture Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-006 implement round-2 artifact lint' -- timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 implement round-2 artifact lint
$ timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow
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
✅ report.md contains section matching: ###[[:space:]]+Summary|^##[[:space:]]+Summary
✅ report.md contains section matching: ###[[:space:]]+Completion Statement|^##[[:space:]]+Completion Statement
✅ report.md contains section matching: ###[[:space:]]+Test Evidence|^##[[:space:]]+Test Evidence
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

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 -- timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow -->

**Executed:** YES (current session)
**Commands:** `timeout 60 git status --short`; `timeout 60 git diff --check`
**Exit Codes:** 0; 0
**Claim Source:** executed

```text
$ timeout 60 git status --short
 M rlportfoliobrief.js
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-004-same-day-behavior-occurrence-rejection/uservalidation.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/design.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/scenario-manifest.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/spec.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/state.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/test-plan.json
 M tests/portfolio-brief.functional.mjs
$ timeout 60 git diff --check
git_diff_check_exit=0
```

Nine paths belong to the declared BUG-006 source, test, and packet boundary.
The BUG-004 `uservalidation.md` path is a pre-existing concurrent human-owned
change. This phase did not read, edit, revert, or attribute that foreign path.
Diff-format validation passed.

### Finding Closure And Route

`GAP-B006-001` is addressed on the implementation surface: the exported brief
consumer now delegates once to the sole shared policy validator before Date
formatting, and both focused carriers pass. `TP-B006-010` remains an independent
test-owned execution and provenance obligation. The next route is
`bubbles.test` for the unchanged brief carrier and focused foundation regression
before broader test-owned rows continue. No test, planning artifact, DoD item,
certification field, human-acceptance record, commit, or push was changed by
this phase.

## Post-Expansion Regression Re-evaluation {#regression-phase-round-2}

**Phase:** regression
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `REGRESSION_FREE` for the expanded Scope 01 product and
test boundary. This re-evaluation supersedes only the prior regression verdict,
not its historical execution evidence. The packet and scope remain
`in_progress`; `TP-B006-008`, every DoD checkbox, human acceptance, and
certification remain unchanged.

### Full Delta And Prior-Contract Review

The comparison base is `9b594d439^`, immediately before the committed
shared-validator repair. The reviewed current surface includes that commit plus
the dirty `composeBrief()` and two-carrier expansion.

| Concern | Post-expansion result |
| --- | --- |
| Product delta | `rlportfolio.js` adds the private `100 * 365 + 25` ceiling and one validator predicate. `rlportfoliobrief.js::composeBrief()` adds one two-line delegation. Both policy-derived Date expressions are unchanged. |
| Local brief precedence | Existing input, windows, policy-presence, `publishedAt`, `composedAt`, window-id, and generic-cutoff refusals remain before shared validation. The passing brief carrier directly proves invalid `composedAt` still returns `P008-BRIEF-COMPOSED / local-composition-time-required` when the policy is also invalid. |
| Shared envelope parity | The passing brief carrier first compares `validatePolicy()` results for `36526`, infinity, and `100100000` to the frozen shared envelopes, then requires `composeBrief()` to return those same objects without throwing. No brief-local error translation was added. |
| Core derivation | `rlportfolio.deriveInterestSignals()` still validates before workspace validation and positive-TimeClip Date arithmetic. Its BUG-006 boundary, one-over, and overflow assertions remain green. |
| BUG-004 | Storage identity, semantic collapse, score, floor, rank identity, and forward-order contracts are unchanged. The test-only mutation now anchors the derive-side validation pair to `retainedIdentityOrder.forEach`, removes only that pair in memory, re-emits the loop opener, and leaves the compose pair present. |
| BUG-005 | Age filtering still precedes post-filter bucket creation. The stale-only omission, future-only omission, fresh-sibling, below-floor, mutation, and cross-module agreement rows all remain in the unchanged six-test carrier. |
| Public and stored contracts | No export, arity, route, HTML, policy JSON, schema, storage record, or contract version changed. The committed policy remains `maximumEvidenceAgeDays: 56`. |
| Coverage-count delta | The four persistent carriers move from 100 to 104 tests and from 1423 to 1449 `assert.*` calls. No carrier loses a test or assertion. The repository declares no coverage-percentage command, so no percentage is claimed. |

### Broad Receipt Freshness And Rerun Decision

**Claim Source:** interpreted
**Interpretation:** The post-expansion browser and selftest receipts are
prior-session executions, not executions by this phase. Both are bound to the
current `rlportfolio.js` and `rlportfoliobrief.js` hashes. The browser receipt
at `2026-08-25T23:50:47Z` and selftest receipt at
`2026-08-25T23:52:13Z` both record exit 0. Strict closure validation reports
zero stale receipts, so this phase did not rerun either broad suite.

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 post-expansion strict receipt freshness
$ timeout 120 bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict
exit: 0
lines: 10
sha256: 61ac707b4c80c7185b70d2c7a01edccd989188793364aba3ab3d28d145882f61
--- output ---
{
	"total": 52,
	"current": 27,
	"superseded": 25,
	"withClosure": 19,
	"valid": 19,
	"stale": 0,
	"unknown": 8,
	"staleReceipts": []
}
```

### Current Four-Carrier Closure

**Command:** `timeout 600 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 post-expansion regression four-carrier closure
$ timeout 600 bash .github/bubbles/scripts/tool-log.sh node --test tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-foundation.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 635
sha256: ed488ca12d3ac6f9becba7a95e9892471334ff2556deb1ff2870aeb3ea878d63
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 239.208045
	type: 'test'
	...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
	---
	duration_ms: 53.303476
	type: 'test'
	...
# Subtest: BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
ok 3 - BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
	---
	duration_ms: 140.867144
	type: 'test'
	...
# Subtest: BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap
--- omitted 595 line(s); sha256 above covers the full output ---
--- last 20 ---
	---
	duration_ms: 204.360958
	type: 'test'
	...
# Subtest: BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
ok 104 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
	---
	duration_ms: 106.745051
	type: 'test'
	...
1..104
# tests 104
# suites 0
# pass 104
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3363.275155
[tool-log] recorded exit=0 duration=3473ms -> <repo>/.specify/runtime/tool-calls.jsonl
```

### Regression Quality Guards

The report redacts the local home path in the guard banner as `<repo>`. The
capture hashes cover the complete original output.

**Claim Source:** executed

```text
# BUG-006 post-expansion regression quality normal
$ timeout 120 bash .github/bubbles/scripts/tool-log.sh bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs
exit: 0
lines: 15
sha256: 42688d3e1429a405d7ebabb3ca4ce23f7b5af167154ccc0d51964a65b74ce220
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: <repo>
	Timestamp: 2026-08-26T00:55:47Z
	Bugfix mode: false
============================================================

Scanning tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-behavior-occurrence.unit.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 2
============================================================
```

```text
# BUG-006 post-expansion regression quality bugfix
$ timeout 120 bash .github/bubbles/scripts/tool-log.sh bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs
exit: 0
lines: 18
sha256: c6c15baebdf3edc2566f154e8d6a976c2b166f38e32cafbfc3c5b2842dc43ce7
--- output ---
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: <repo>
	Timestamp: 2026-08-26T00:55:56Z
	Bugfix mode: true
============================================================

Scanning tests/portfolio-brief.functional.mjs
Adversarial signal detected in tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-behavior-occurrence.unit.mjs
Adversarial signal detected in tests/portfolio-behavior-occurrence.unit.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 2
	Files with adversarial signals: 2
============================================================
```

### Independent Load-Bearing Controls

The compose control installed an in-memory CommonJS loader for only
`rlportfoliobrief.js`. It required two shared-validation pairs before mutation,
removed the pair uniquely followed by the `maxAgeDays` alias, required the
derive pair plus `retainedIdentityOrder.forEach` to remain, and imported the
real brief functional carrier. It did not write to disk.

**Command:** `timeout 240 node --input-type=module --eval '<in-memory compose-only validator-removal hook, pair-count assertions, and import of tests/portfolio-brief.functional.mjs>'`
**Exit Code:** 1 (expected RED control)
**Claim Source:** executed

```text
# BUG-006 composeBrief delegation load-bearing control
exit: 1
lines: 305
sha256: 08f33d00c7c35b6a5cfea4b0e317a1a52d4bffefb8e92d225f366709019e664b
--- first 20 ---
BUG-006 composeBrief delegation mutation
diskWrite=false
pairCount.before=2
pairCount.after=1
composeAnchor.before=1
composeAnchor.after=0
deriveAnchor.before=1
deriveAnchor.after=1
expectedCarrier=29 tests with exact BUG-006 composeBrief title failing
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
	---
	duration_ms: 215.933965
	type: 'test'
	...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
	---
	duration_ms: 37.100571
--- failure-shaped lines from the omitted region ---
not ok 15 - BUG-006: composeBrief validates shared evidence-age policy before Date formatting
--- omitted 265 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 28 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
	---
	duration_ms: 1.57429
	type: 'test'
	...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 29 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
	---
	duration_ms: 97.1313
	type: 'test'
	...
1..29
# tests 29
# suites 0
# pass 28
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 543.005944
```

The separate BUG-004 control executes the existing in-memory mutation by exact
title. Its assertions require exactly one derive-side pair to disappear, the
derive loop to survive, and the compose pair to remain before it proves the
mutant fails open only on the corrupt empty-workspace case.

**Command:** `timeout 240 bash .github/bubbles/scripts/tool-log.sh node --test --test-name-pattern='^BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing$' tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 BUG-004 derive-anchor isolation control
exit: 0
lines: 17
sha256: 1325f079becae202bbeb9e6d5971313c4d64220ec2d62f31a7de9dda8792b392
--- output ---
TAP version 13
# Subtest: BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
ok 1 - BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
	---
	duration_ms: 38.504165
	type: 'test'
	...
1..1
# tests 1
# suites 0
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 146.696807
```

### Coverage Count And Scenario Resolution

**Claim Source:** executed

```text
BUG-006 post-expansion coverage-count comparison
coveragePercentageCommand=not-declared
baseline=9b594d439^ (pre-BUG-006)
tests/portfolio-foundation.unit.mjs: tests 58->61 delta=3; assertions 941->953 delta=12
tests/portfolio-brief.functional.mjs: tests 28->29 delta=1; assertions 315->327 delta=12
tests/portfolio-behavior-occurrence.unit.mjs: tests 8->8 delta=0; assertions 111->113 delta=2
tests/portfolio-stale-domain-signal.unit.mjs: tests 6->6 delta=0; assertions 56->56 delta=0
totalTests=100->104 delta=4
totalAssertions=1423->1449 delta=26
verdict=no-count-regression
```

The structured scenario resolver exited 0 and resolved all seven declared
file/title references through literal scan. Category comparison is honestly not
applicable because this repository declares no test-discovery adapter. The
four-carrier execution above supplies the current runtime result for every
resolved focused carrier.

### Regression Verdict And Routing

`REGRESSION_FREE`. No failing current test, prior-contract conflict, local-error
precedence change, shared-envelope divergence, coverage-count loss, weakened
assertion, stale broad receipt, or ambiguous mutation anchor was found. The
required next owner is `bubbles.simplify` for the expanded source/test surface.
No product, test, planning, specification, design, user-validation,
certification, or DoD content was changed by this regression phase.

### Regression-Owned Gate Receipts

**Claim Source:** executed

| UTC | Command | Exit | Structured stdout hash | Observed result |
| --- | --- | ---: | --- | --- |
| `2026-08-26T01:01:21Z` | `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow` | 0 | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` | Required artifacts and state shape present; report sections present; anti-fabrication checks clean; artifact lint passed. |
| `2026-08-26T01:01:58Z` | `bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow --verbose` | 0 | `361d0a45a81eaddc2c5b1a35c08e531f947d68f88363b101390a2ffe06c2037a` | Two implementation files resolved; 0 violations; 0 warnings. |
| `2026-08-26T01:02:11Z` | `git diff --check` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Empty stdout and stderr; no diff-format finding. |

The exact rows are recorded in `.specify/runtime/tool-calls.jsonl` with agent
`bubbles.regression`, this bug path, Scope 01, and `post-expansion` tags. The
artifact-lint capture covers 41 output lines with full-output sha256
`2d2cf867d5ea68c59ce72e370616eb2a64347cc636bb0f08426a4a30efc2eddf`.
The implementation-reality capture covers 37 output lines with full-output
sha256 `9c851eac65b680e03ccb69610f27684130dfe888accc351cd353f78b39000399`.

## Simplify Phase Round 2 - 2026-08-26 {#simplify-phase-round-2}

**Phase:** simplify
**Agent:** `bubbles.simplify`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `MINIMAL_NO_CHANGE` for the expanded Scope 01 source and
test boundary. The review covered only `rlportfolio.js`,
`rlportfoliobrief.js`, `tests/portfolio-foundation.unit.mjs`,
`tests/portfolio-brief.functional.mjs`, and
`tests/portfolio-behavior-occurrence.unit.mjs`. No product or test edit was
made. The packet and scope remain `in_progress`; Definition of Done, human
acceptance, and certification remain unchanged.

### Three-Pass Review

| Pass | Finding | Verdict |
| --- | --- | --- |
| Reuse | `rlportfolio.js::validatePolicy()` remains the sole owner of the `100 * 365 + 25` ceiling. `composeBrief()` delegates once and does not duplicate the ceiling or rebuild its refusal. The focused tests derive the boundary independently so production and test cannot share the same mistaken constant. | No missing abstraction or useful deduplication was found. |
| Quality | The two-line `composeBrief()` delegation follows every existing local prerequisite and immediately precedes the first `maximumEvidenceAgeDays` read. It returns the frozen shared failure unchanged. The foundation and brief carriers separately prove the shipped `56`, `36525`, `36526`, non-finite, forward-TimeClip, backward-TimeClip, no-clamp, no-throw, and local-precedence contracts. The BUG-004 mutation anchor combines the shared pair with its uniquely following loop opener, removes only that pair in memory, and re-emits the loop. | The expanded code and tests are direct, discriminating, and maintainable as written. |
| Efficiency | The round-2 cost is one call to the existing closed-policy validator before the unchanged Date calculation. That validator already owns its required object and key checks; a cheaper local comparison would duplicate only one invariant and bypass the rest. The new consumer code adds no separate loop, I/O, serialization, or Date calculation. | No runtime or test-harness optimization is justified. |

### Rejected Simplification Candidates

| Candidate | Why it was rejected |
| --- | --- |
| Remove the post-validation `isFinite(maxAgeDays)` branch in `composeBrief()`. | The design and scope explicitly preserve both policy-derived Date expressions. Removing the branch would change a pre-existing consumer expression and broaden this cleanup beyond the delivered two-line delegation without reducing current valid-policy work. |
| Move shared policy validation ahead of the established local prerequisite sequence or evidence normalization. | The design fixes the insertion point to preserve local input, window, timestamp, and cutoff refusal precedence. Moving the call would reopen an already-tested ordering contract. |
| Share the century boundary or refusal fixtures across production and both test carriers. | Independent derivation is the negative control for the product maximum. Coupling tests to a production export or one shared mutable fixture would make a common defect self-confirming. |
| Shorten the repaired mutation anchor to the two-line validator pair alone. | Two identical pairs now exist. The loop opener is the discriminator that removes only the `deriveInterestSignals()` check and proves the loop survives while `composeBrief()` keeps its own delegation. |
| Extract one-use helpers around either validator call. | A helper would add indirection without removing duplicated policy logic; the current two-line call sites make owner, order, and returned envelope visible. |

### Focused Three-Carrier Confirmation

**Command:** `timeout 420 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 simplify three-carrier confirmation" -- timeout 360 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 simplify three-carrier confirmation
$ timeout 360 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs
exit: 0
lines: 598
sha256: 3938f58a8e0ac3b9256147e8a837d0f8c5a60fbf57db1a0d18f6d2c5acee5d27
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 152.909741
	type: 'test'
	...
# Subtest: BUG-004: an exact occurrence repeat is still refused as a duplicate
ok 2 - BUG-004: an exact occurrence repeat is still refused as a duplicate
	---
	duration_ms: 62.295549
	type: 'test'
	...
# Subtest: BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
ok 3 - BUG-004: a repeated same-day occurrence cannot buy relevance it did not earn
	---
	duration_ms: 156.064523
	type: 'test'
	...
# Subtest: BUG-004: stored occurrence growth is bounded by the declared behaviour-event cap
--- omitted 558 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 97 - SCN-008-042 immutable PortfolioDraft lifecycle preserves stable holdings and commits an honest empty revision
	---
	duration_ms: 108.58469
	type: 'test'
	...
# Subtest: SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
ok 98 - SCN-008-043 validated ClearTombstone commits before verified deletion and returns value-safe evidence
	---
	duration_ms: 73.289288
	type: 'test'
	...
1..98
# tests 98
# suites 0
# pass 98
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3573.330521
```

### Exact Expanded-Consumer And Mutation-Anchor Probes

**Command:** `timeout 240 node --test --test-name-pattern='^BUG-006: composeBrief validates shared evidence-age policy before Date formatting$' tests/portfolio-brief.functional.mjs && timeout 240 node --test --test-name-pattern='^BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing$' tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ BUG-006: composeBrief validates shared evidence-age policy before Date formatting (33.865906ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 212.659279
✔ BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing (59.136061ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 207.31251
```

### Workflow Routing

**Command:** `timeout 180 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 simplify workflow routing" -- env BUBBLES_MODE_GRANDFATHER=1 timeout 120 bash .github/bubbles/scripts/mode-resolver.sh bugfix-fastlane`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 simplify workflow routing
$ env BUBBLES_MODE_GRANDFATHER=1 timeout 120 bash .github/bubbles/scripts/mode-resolver.sh bugfix-fastlane
exit: 0
lines: 46
sha256: 986156f2dbb912fa87df07d087705abebbe2af8d9db0959aa61484fc7b443022
--- first 20 ---
DEPRECATION (v7 grandfather): resolving removed v5 mode 'bugfix-fastlane' (v6 form: 'fix action:fastlane target:bug'). New work must use the v6 form.
statusCeiling: done
requiredGates: [G001, G002, G003, G004, G005, G006, G007, G008, G009, G010, G011, G012, G014, G015, G016, G018, G019, G020, G021, G022, G023, G024, G025, G026, G027, G028, G029, G033, G034, G035, G040, G044, G047, G048, G051, G055, G056, G057, G059, G060, G061, G094]
constraints:
	specReviewDefault: once-before-implement
	specReviewDefaultScope: done-ceiling-delivery-modes
	specReviewOptOutRequiresReason: true
	requireCanonicalPlanningChain: true
	planningChainAgents: [bubbles.analyst, bubbles.ux, bubbles.design, bubbles.plan]
	sequentialSpecCompletion: true
	crossAgentVerification: true
	antiFabricationDetection: true
	requireAllSpecialistsComplete: true
	requireAllScopesDoneBeforeSpecDone: true
	requirePerDodItemRawEvidence: true
	requireTestsForAllRealScenarios: true
	require100PercentBusinessLogicCoverage: true
	requirePhaseScopeCoherence: true
	requireImplementationRealityScan: true
	requireNoDefaultsNoFallbacks: true
--- omitted 6 line(s); sha256 above covers the full output ---
--- last 20 ---
	requireQualityLoopUntilCertifiedDone: true
	restartLoopAtPhase: implement
	blockedOnlyWhenValidateBlocked: true
	requireNoSkippedTests: true
	requireNoPreexistingFailingTests: true
	requireNoInternalMocksExceptExternalDeps: true
	requireGherkinE2eCoverage: true
	requireAllDiscoveredBugsClosedInRun: true
	requirePhaseEvidenceBeforeAdvance: true
	blockOnMissingSpecialistExecution: true
description: Focused bug loop with mandatory reproduction and verification. Loops until validate certifies the fix or returns a documented blocked verdict.
transitionAudit:
	profile: delivery-completion-v1
	target: statusCeiling
phaseOrder: [select, bootstrap, implement, test, regression, simplify, gaps, harden, stabilize, devops, security, validate, audit, finalize]
sessionBudget:
	maxWallClockMinutes: 180
	maxToolCalls: 350
	maxSingleToolResultBytes: 50000
	maxCumulativeToolResultBytes: 250000
```

The persisted registry places `gaps` immediately after `simplify`. Inbound
route `BUG-006-ROUTE-016` is complete, and the next required owner is
`bubbles.gaps` for the round-2 expanded-consumer gap review. This route does
not promote the packet, scope, Definition of Done, human acceptance, or
certification.

## Gaps Phase Round 2 - 2026-08-26 {#gaps-phase-round-2}

**Phase:** gaps
**Agent:** `bubbles.gaps`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `GAP_FREE_AFTER_REPAIR`. The exhaustive round-2 audit found
one persistent-test integrity gap and no product implementation gap. The test
gap was repaired inside the already planned `TP-B006-011` carrier. The packet,
scope, all 17 Definition of Done items, human acceptance, top-level status, and
certification remain `in_progress` or unchecked as they were before this phase.

### Finding And Repair

| Finding | Classification | Evidence | Resolution |
| --- | --- | --- | --- |
| `GAP-B006-R2-001` | medium, `PARTIAL` persistent mutation proof | The existing `TP-B006-011` assertion required only that removing the derive-side validator anchor reduce the generic two-line pair count by one. A disk-free counterexample containing only the derive pair still satisfied that assertion with `pairCount.before=1`, `pairCount.after=0`, and no compose pair. | Added `COMPOSE_POLICY_RECHECK`, anchored to the immediately following `maxAgeDays` read. The persistent mutation test now requires exactly one compose anchor before and after the derive-only mutation. No product source or BUG-004/BUG-005 expected behavior changed. |

**Command:** `timeout 30 node --input-type=module --eval '<pair-delta counterexample>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 TP-B006-011 assertion counterexample
syntheticSource=derive-anchor-only
composeAnchorPresent=false
pairCount.before=1
pairCount.after=0
existingDelta=1
existingAssertionPasses=true
remainingComposePairCount=0
requiredRemainingPairCount=1
verdict=CURRENT_ASSERTION_FALSE_POSITIVE
```

### Requirement And Scenario Coverage

**Claim Source:** interpreted

| Contract | Round-2 result | Concrete coverage |
| --- | --- | --- |
| `FR-B006-001` | `MATCH` | `rlportfolio.js` owns private `MAXIMUM_EVIDENCE_AGE_DAYS = 100 * 365 + 25` beside a conservative-century and leap-day comment. The value is not exported. |
| `FR-B006-002` | `MATCH` | `findNonFinite()` runs before section semantics. The behavior predicate owns the only ceiling. Core derivation and brief composition return direct `validatePolicy()` results before their policy-derived Date formatters. |
| `FR-B006-003` | `MATCH` | The foundation and brief carriers independently derive `36525`, accept it, refuse `36526`, and assert the committed policy remains exactly `56`. |
| `FR-B006-004` | `MATCH` | Core validation is the first derive operation. Brief composition keeps input, windows, policy presence, publication time, composition time, window ID, and generic cutoff checks before shared validation. Neither consumer clamps, translates, or catches the shared failure. |
| `FR-B006-005` | `MATCH` after `GAP-B006-R2-001` | Persistent tests cover one-over, non-finite precedence, positive TimeClip overflow, negative TimeClip overflow, no throw, and input non-mutation. The derive-only and compose-only disk-free mutations now have unique persistent anchors. |
| `FR-B006-006` | `MATCH` | Both Date expressions are unchanged. The repaired four-carrier closure retains `104` tests, including all BUG-004 and BUG-005 persistent rows. No scoring, decay, eligibility, identity, schema, or configured-policy source changed. |

| Scenario | Persistent proof | Result |
| --- | --- | --- |
| `SCN-B006-BOUNDARY-ACCEPTED` | `tests/portfolio-foundation.unit.mjs` plus the brief functional carrier | `MATCH` |
| `SCN-B006-ONE-OVER-REFUSED` | Exact shared refusal and no-clamp assertions in both direct consumers | `MATCH` |
| `SCN-B006-OVERFLOW-REFUSED` | Forward TimeClip fixture, direct `RangeError` control, and validate-first core refusal | `MATCH` |
| `SCN-B006-BRIEF-POLICY-VALIDATION` | Backward TimeClip fixture, local-error precedence, exact shared envelopes, no throw, and compose-anchor mutation control | `MATCH` |

The mechanical scope count is four scenarios, twelve Test Plan rows, seventeen
DoD items, zero checked items, and seventeen unchecked items. This phase made
no planner-owned scope or DoD edit.

### Complete `maximumEvidenceAgeDays` Consumer Audit

**Claim Source:** interpreted

The exact identifier search found the committed config, one closed-field name,
and ten runtime value consumers. Every runtime consumer is accounted below.

| Surface | Use | Validation relationship | Date-format risk |
| --- | --- | --- | --- |
| `rlportfolio.js::validatePolicy` | Sole upper-bound predicate | Owner | None |
| `rlportfolio.js::deriveInterestSignals` age filter | Excludes stale and future events | Core validation is the first operation | Comparison only |
| `rlportfolio.js::deriveInterestSignals` expiry | Adds the declared window to latest support | Core validation precedes workspace and Date work | The only forward policy-derived formatter; protected |
| `rlportfoliobrief.js::decayState` | Labels support current, decaying, or expired | Private helper reached from validated `composeBrief()` | Comparison only |
| `rlportfoliobrief.js::deriveInterestSignals` floor guard | Preserves `behavior-floor-policy-invalid` for non-finite floor inputs | Local precedence is deliberate | No formatting |
| `rlportfoliobrief.js::deriveInterestSignals` age filter | Excludes out-of-window occurrences | Later direct shared validation preserves the existing order | Comparison only |
| `rlportfoliobrief.js::composeBrief` cutoff | Subtracts the declared window from `composedAt` | Direct shared delegation immediately precedes the alias | The only backward policy-derived formatter; protected |
| `rlportfoliobrief.js::composeBrief` invalidation copy | Explains when support expires | Runs after successful shared validation | Text only |
| `portfolio-survival-allocation-lab.html::behaviorRanking` | Filters visible committed events | `boot()` stores policy only after `api.validatePolicy()` succeeds | Comparison only |
| `portfolio-survival-allocation-lab.html::renderBehavior` | Displays the declared value | Same validated boot state | Text only |

The one-hop page read therefore found no third policy-derived Date formatter.
The only two formatters remain the forward expiry and backward action-history
cutoff already named by the packet.

### Validation Evidence

#### Repaired Four-Carrier Closure

**Command:** `timeout 650 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 gaps repaired four-carrier closure" -- timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 gaps repaired four-carrier closure
$ timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 634
sha256: 621411ee15de7920a536439b3550ad57a6696835a1b8fb3b797170763c217e05
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 84.558121
	type: 'test'
	...
--- omitted 594 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 103 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
	---
	duration_ms: 149.061857
	type: 'test'
	...
# Subtest: BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
ok 104 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
	---
	duration_ms: 111.994867
	type: 'test'
	...
1..104
# tests 104
# suites 0
# pass 104
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2544.396831
```

#### Compose-Anchor Negative Control

This command changed no file. It replaced only the compose anchor returned by
`readFileSync()` inside one Node process. The complete output hash covers the
83-line expected RED run. The local home path in the stack was redacted as
`<repo>` in this report.

**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 compose-anchor persistence negative control" -- timeout 240 node --input-type=module --eval '<disk-free compose-anchor read hook and persistent carrier import>'`
**Exit Code:** 1 (expected RED control)
**Claim Source:** executed

```text
# BUG-006 round-2 compose-anchor persistence negative control
exit: 1
lines: 83
sha256: 357482d845271d2a6c9616d53e876342fff170d64f57610cb5e72cc258f28d27
--- first 20 ---
BUG-006 compose-anchor persistence mutation
diskWrite=false
target=rlportfoliobrief.js::composeBrief
expected=exact mutation-anchor test fails on missing compose delegation
mutatedReads=1
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
	---
	duration_ms: 85.847638
	type: 'test'
	...
--- failure-shaped lines from the omitted region ---
not ok 8 - BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
--- omitted 43 line(s); sha256 above covers the full output ---
--- last 20 ---
	actual: 0
	operator: 'strictEqual'
	stack: |-
		TestContext.<anonymous> (<repo>/tests/portfolio-behavior-occurrence.unit.mjs?compose-anchor-persistence-mutant:599:10)
	...
1..8
# tests 8
# suites 0
# pass 7
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 700.268167
```

#### Regression Quality

**Command:** `timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh tests/portfolio-behavior-occurrence.unit.mjs && timeout 240 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-behavior-occurrence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Repo: <repo>
Bugfix mode: false
Scanning tests/portfolio-behavior-occurrence.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
BUBBLES REGRESSION QUALITY GUARD
Repo: <repo>
Bugfix mode: true
Scanning tests/portfolio-behavior-occurrence.unit.mjs
Adversarial signal detected in tests/portfolio-behavior-occurrence.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 1
Files with adversarial signals: 1
```

The authorized source and test files contain no `TODO`, `FIXME`, `HACK`,
`STUB`, `unimplemented`, skip marker, focused-only marker, live interception,
or internal mock pattern. Artifact and implementation guards are rerun after
the packet update below.

### Workflow Routing

The persisted grandfathered `bugfix-fastlane` registry resolves a `done`
ceiling and orders `gaps` immediately before `harden`. Inbound route
`BUG-006-ROUTE-017` is completed. Route `BUG-006-ROUTE-018` transfers the
still-in-progress packet to `bubbles.harden` for the next registered phase.
No commit, merge, push, status promotion, DoD check, human-acceptance change,
or certification write occurred.

## Harden Phase Round 2 - 2026-08-26 {#harden-phase-round-2}

**Phase:** harden
**Agent:** `bubbles.harden`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `HARDENED_DIAGNOSTIC`. Round-2 hardening found no product
or persistent-test defect. The packet and scope remain `in_progress`. All 17
Definition of Done items remain unchecked. Human acceptance and certification
remain unchanged.

### Repository Authority And Workflow

**Claim Source:** executed

Repository preflight committed the exact BUG-006 target before local work:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=concrete-target affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:222 revision=222 repository=research-lab root=<repo>
repositoryAlias=research-lab
authority=concrete-target
transition=confirmed
scopeKind=command
scopeId=null
targetKind=absolute-target
pathVisibility=local
actionable=true
```

The persisted mode resolved through the explicit grandfather path. It has a
`done` ceiling. Its relevant phase sequence is `gaps`, `harden`, `stabilize`,
`devops`, `security`, `validate`, `audit`, and `finalize`.

### Baseline Validation

**Claim Source:** executed for command results and interpreted for coverage
classification.

| Check | Result | Count or detail |
| --- | --- | --- |
| Worktree checkpoint | PASS | Clean at `a77d45e8cb1971611003f961b988bde7a0815f09` |
| Build | NOT APPLICABLE | Research Lab is build-free. |
| Lint | NOT APPLICABLE | The command registry declares no repository lint command. |
| Source lock | PASS | Playwright `1.61.1`, lockfile v3, 16 adversarial source-lock refusals |
| Focused unit and functional closure | PASS | 104 passed, 0 failed, 0 skipped |
| Feature 008 browser matrix | PASS | 94 passed, 0 failed |
| Canonical repository selftest | PASS | 3426 passed, 0 failed |
| Regression-quality guards | PASS | 4 files, 0 violations, 0 warnings in normal and bugfix modes |
| Static integrity | PASS | 0 incomplete markers, 0 skip/focus markers, 0 mock/interception markers |
| Artifact lint | PASS | 40-line canonical check, exit 0 |
| Traceability | PASS | 4 scenarios, 13 rows checked, 0 warnings |
| Implementation reality | PASS | 2 product files, 0 violations, 0 warnings |
| Hardening findings | PASS | 0 product findings, 0 persistent-test findings |

### Complete Contract Probe

**Command:** `timeout 180 bash .github/bubbles/scripts/tool-log.sh node -e '<round-2 BUG-006 contract probe>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 round-2 harden contract probe
boundary=36525 integer=true
oneOver=36526 integer=true
shared-envelope=value-safe exact
shared-error-frozen=true
local-precedence.windows=P008-BRIEF-WINDOWS/generic-window-contract-required
local-precedence.policy-presence=P008-BRIEF-POLICY/behavior-and-queue-policy-required
local-precedence.publication-time=P008-BRIEF-PUBLISHED/generic-publication-time-required
local-precedence.composition-time=P008-BRIEF-COMPOSED/local-composition-time-required
local-precedence.window-id=P008-BRIEF-WINDOW-ID/window-not-in-generic-contract
local-precedence.cutoff=P008-BRIEF-CUTOFF/window-et-time-unparseable
shared-policy-after-local-prerequisites=P008-CONFIG/invalid-policy/behavior
compose-overflow=no-throw,input-unchanged
derive-overflow=no-throw,input-policy-unchanged
timeclip.forward=direct-RangeError
timeclip.backward=direct-RangeError
consumer-forward=shared-refusal-before-format
consumer-backward=shared-refusal-before-format
RESULT=PASS
```

The probe used deep-frozen brief input for the backward overflow. It compared
that input with a structured clone after execution. It also compared the core
overflow policy before and after derivation. Both consumers returned the exact
shared refusal without throwing or mutating their inputs.

### Runtime Consumer Review

**Claim Source:** interpreted from current source reads and the executed
contract probe.

| Runtime consumer | Hardening result |
| --- | --- |
| `rlportfolio.js::validatePolicy` ceiling | Sole owner. The ceiling anchor occurs once. |
| Core age filter | Runs after shared validation. It performs comparison only. |
| Core expiry formatter | Shared validation runs first. Forward overflow returns the shared refusal. |
| Brief `decayState` | Reached from validated composition. It performs comparison only. |
| Brief derive floor guard | Preserves local non-finite floor precedence. |
| Brief derive age filter | Shared validation follows at the preserved insertion point. |
| Brief cutoff formatter | Shared validation immediately precedes the alias. Backward overflow returns the shared refusal. |
| Brief invalidation copy | Runs only after successful shared validation. It formats text only. |
| Page behavior ranking | Consumes policy accepted during validated boot. It performs comparison only. |
| Page behavior display | Consumes policy accepted during validated boot. It formats text only. |

The review found no third policy-derived Date formatter. The two existing
formatters cover the forward and backward TimeClip directions.

### Focused Four-Carrier Closure

**Command:** `timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 harden focused four-carrier baseline
$ timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 634
sha256: 7b258579f3db8f0931f76cd327adce0ceaa0ad26c0e62a065c61861f86f99f39
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
--- omitted 594 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 103 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
ok 104 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
1..104
# tests 104
# suites 0
# pass 104
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### Load-Bearing Mutation Controls

**Claim Source:** executed

The controls changed no file. Each process replaced one unique source anchor
in memory.

| Control | Expected result | Observed result |
| --- | --- | --- |
| Remove shared ceiling predicate | One-over and forward-overflow tests fail | 59 passed, exactly 2 failed |
| Remove compose delegation | Exact composeBrief test fails | 28 passed, exactly 1 failed |
| Remove derive delegation inside persistent carrier | Corrupt policy fails open while valid policy stays equal | Carrier passed all 8 assertions |

```text
# BUG-006 round-2 shared-ceiling mutation expected RED
exit: 1
lines: 1288
sha256: ce964cb333628ae65a45f265cdf1bd778f262295644789c27df363df546920e3
mutation=remove sole maximumEvidenceAgeDays upper-bound predicate
not ok 4 - BUG-006: maximumEvidenceAgeDays refuses one day above the named boundary
not ok 5 - BUG-006: an overflowing evidence window is refused before interest derivation
1..61
# tests 61
# pass 59
# fail 2
# skipped 0
```

```text
# BUG-006 round-2 compose-delegation primed mutation expected RED
exit: 1
lines: 302
sha256: 9522419bdb673f46035992c62755eacc3946705c0d5d4e4649bd8fc6c9e3f2d4
diskWrite=false
target=rlportfoliobrief.js::composeBrief
anchorCount=1
mutatedReads=1
not ok 15 - BUG-006: composeBrief validates shared evidence-age policy before Date formatting
1..29
# tests 29
# pass 28
# fail 1
# skipped 0
```

```text
# BUG-006 round-2 derive-delegation persistent mutation proof
exit: 0
lines: 58
sha256: 4af51c11fd7cbcce65978e1d9a5985cdf42f3c08d0d6f24d18c336571612e5df
ok 7 - BUG-004: a corrupt policy still refuses on an empty workspace, and refuses exactly as the removed call did
ok 8 - BUG-004: removing the restored policy check reinstates the fail-open, so the assertion above is load-bearing
1..8
# tests 8
# pass 8
# fail 0
# skipped 0
# todo 0
```

### Browser And Repository Regression

**Claim Source:** executed

```text
# BUG-006 round-2 harden Feature 008 browser matrix
exit: 0
lines: 303
sha256: 319256c75f1d13d6b1688414ed0de053ad677f09c2b918cb8688240b6c1811e6
Running 94 tests using 2 workers
94 passed (2.6m)
```

```text
# BUG-006 round-2 harden canonical Research Lab selftest
exit: 0
lines: 3912
sha256: 97187993e59eb03e31a27f3044d01cbe02f2b04602fbc566808b80b726f30404
Step 1 security - escaped model sinks and CSP on every page
Feature 004 RLFX/RLDATA foundation
specs/ - every scope progress claim matches the Definition of Done it summarises
================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

### Test Plan Audit And Hardening Profile

**Claim Source:** interpreted from the current artifacts and executed guards.

| Check | Result |
| --- | --- |
| H1 findings classified with evidence | PASS. No speculative finding was recorded. |
| H2 fixes verified | NOT APPLICABLE. Hardening found no new defect. |
| H3 required artifact updates | PASS. This report and execution routing record the phase. |
| H4 taxonomy completeness | PASS. Unit, functional, E2E UI, artifact, and guard rows match the affected static-site surfaces. |
| H5 semantic fidelity | PASS. All four scenarios map to behavior assertions, not proxy status checks. |
| H6 repository-realistic paths | PASS. All four persistent carriers and commands exist in the command registry. |
| H7 regression quality | PASS. Every carrier has an adversarial signal. Three independent mutations are load-bearing. |
| H8 cross-scope deduplication | PASS. The packet has one scope. Shared rows have distinct purposes. |
| H9 `test-plan.json` synchronization | PASS. The structured plan retains the same twelve test entries and evidence anchors as `scopes.md`. |

No persistent test was added. The existing tests already fail under each
independent product regression. Adding a duplicate test would not increase
discrimination.

### Report Provenance Normalization

The post-edit claim-source lint found one older mixed-value provenance tag in
`TP-B006-011`. The block combined direct focused-carrier output with an
interpreted receipt-history table. Hardening changed only the tag to the closed
`interpreted` value and added its required interpretation. Commands, output,
hashes, receipt rows, and test claims remain byte-for-byte unchanged.

### Finding Closure And Routing

The hardening finding count is zero. Therefore, Gate G031 requires zero new
Gherkin scenarios and zero new DoD items. No completed scope reopened. No scope
or certification reset applies.

Inbound route `BUG-006-ROUTE-018` is complete. The grandfathered registry
places `stabilize` immediately after `harden`. Route `BUG-006-ROUTE-019`
transfers the unchanged, still-in-progress packet to `bubbles.stabilize`.

No source, persistent test, scope, Definition of Done checkbox, human
acceptance field, certification field, unrelated market brief, or data file
changed. No commit, merge, or push occurred.

## Stabilize Phase Round 2 - 2026-08-26 {#stabilize-phase-round-2}

**Phase:** stabilize
**Agent:** `bubbles.stabilize`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `STABLE_DIAGNOSTIC`. No stability finding requires a code,
test, configuration, runtime, deployment, or observability change. The packet
and scope remain `in_progress`. All Definition of Done items remain unchecked.
Human acceptance and certification remain unchanged.

### Repository Authority And Current Inputs

**Claim Source:** executed

Repository preflight committed the exact BUG-006 target before local work:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=concrete-target affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:223 revision=223 repository=research-lab root=<repo>
repositoryAlias=research-lab
authority=concrete-target
transition=confirmed
scopeKind=command
scopeId=null
targetKind=absolute-target
pathVisibility=local
actionable=true
```

`HEAD` is the committed harden checkpoint. The six authorized code and test
inputs have zero diff from that checkpoint:

```text
$ git rev-parse HEAD
583d6794d945a1eded58c54d6ce810f355f883c1
$ git diff --exit-code 583d6794d -- rlportfolio.js rlportfoliobrief.js tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
output: empty
$ git show --format=fuller --name-status 583d6794d
commit 583d6794d945a1eded58c54d6ce810f355f883c1
AuthorDate: Wed Aug 26 05:33:11 2026 +0000
CommitDate: Wed Aug 26 05:33:11 2026 +0000
M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/report.md
M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow/state.json
```

The harden browser matrix and canonical selftest remain input-current. Their
source and test inputs match this checkpoint. The current evidence remains:

- Feature 008 browser matrix: 94 passed, 0 failed, full-output SHA-256
	`319256c75f1d13d6b1688414ed0de053ad677f09c2b918cb8688240b6c1811e6`.
- Canonical repository selftest: 3426 passed, 0 failed, full-output SHA-256
	`97187993e59eb03e31a27f3044d01cbe02f2b04602fbc566808b80b726f30404`.

Both bounded evidence blocks remain at `report.md#harden-phase-round-2`.

### Stability Inventory

**Claim Source:** interpreted from current source, current history, the command
registry, and the executed probes below.

| Domain | Result | Evidence |
| --- | --- | --- |
| Reliability | PASS | Repeated valid, one-over, and overflow calls returned byte-stable results. Invalid calls returned the exact shared refusal. No call threw. |
| Boundary behavior | PASS | `36525` remained valid. `36526` and both TimeClip overflow fixtures remained bounded before Date formatting. |
| Mutation safety | PASS | Deep-frozen policies and brief inputs remained structurally equal to their snapshots after repeated calls. |
| Loops and retries | PASS | The two product patches add one comparison and one shared-validator call. They add no loop, timer, promise, retry, backoff, network call, or event listener. |
| Resource use | PASS | Active handles remained `1` before and after stress. Five post-GC heap samples stayed within a 36,832-byte range. |
| Log volume | PASS | Repeated calls emitted zero `log`, `warn`, or `error` messages. |
| Dual runtime | PASS | Browser-style and CommonJS exports retained identical key sets: 85 portfolio functions and 16 brief functions. Both APIs remained frozen. |
| Performance | PASS | Current valid composition measured 205.391 microseconds per call. The delegation added 194.294 microseconds median and stayed below the 250-microsecond probe budget. |
| Build and deployment | NOT APPLICABLE | The command registry declares no service lifecycle or manual deploy command. Pages deploys from a clean checkout after a push. This run changed no deploy surface. |
| Configuration | PASS | The committed policy remains 56 days. No package, lock, policy, workflow, or project configuration changed. |
| Observability | NOT APPLICABLE | Project config declares no `traceContracts` or observability adapter. The repaired pure functions create no new runtime signal or operational failure channel. |

### Focused Four-Carrier Closure

**Command:** `timeout 700 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 stabilize focused four-carrier closure" -- timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 stabilize focused four-carrier closure
$ timeout 600 node --test tests/portfolio-foundation.unit.mjs tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 634
sha256: 56c993cd959d1139f1052207d4510935baa25ccee1ed4fa3cdc93abe9c2dd9d0
--- first 20 ---
TAP version 13
# Subtest: BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
ok 1 - BUG-004: a later same-civil-day completion is a distinct occurrence under one semantic identity
--- omitted 594 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 103 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
ok 104 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
1..104
# tests 104
# suites 0
# pass 104
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2574.171984
```

### Repeated-Call And Resource Probe

**Command:** `timeout 180 node --expose-gc -e '<BUG-006 deterministic, mutation, dual-runtime, resource, and latency assertions>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 round-2 stabilize repeated-call probe
node-browser-api-parity=portfolio:85,brief:16,frozen-api:true,frozen-error:true
validate-boundary=2000 deterministic
validate-one-over=2000 deterministic exact-refusal
validate-overflow=2000 deterministic exact-refusal
compose-boundary=500 deterministic no-throw
compose-one-over=2000 deterministic no-throw
compose-overflow=2000 deterministic no-throw
derive-valid=500 deterministic no-throw
derive-one-over=2000 deterministic no-throw
derive-overflow=2000 deterministic no-throw
input-mutation=none frozen-inputs=true
console-emissions=log:0,warn:0,error:0
active-handles=before:1,after:1
heap-after-gc-bytes=baseline:7831752,samples:7867208,7867312,7868568,7868584,7868464
heap-range-bytes=36832,final-delta-bytes=36712
validate-one-over-us-per-call=97.203
validate-overflow-us-per-call=89.235
compose-one-over-us-per-call=87.124
compose-boundary-us-per-call=283.404
RESULT=PASS
```

The probe ran 18,000 deterministic behavior assertions. Its resource section
then ran 55,000 policy validations and 6,000 invalid compositions in one
process. Garbage collection ran before every recorded heap sample.

Two earlier probe attempts failed before the measured loop. The first expected
the result wrapper to be frozen, while the contract freezes its error object.
The second passed `structuredClone` directly to `Array.map`, which forwarded an
index as clone options. The successful probe corrected both probe defects. No
repository file changed during any attempt.

### Incremental Cost Probe

**Command:** `timeout 120 node -e '<current composeBrief versus disk-free no-delegation control>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 shared-validation incremental-cost probe
disk-write=false anchor-count=1
valid-output-parity=true
rounds=9 calls-per-variant-per-round=1000
current-us-per-call-median=205.391
no-delegation-control-us-per-call-median=11.097
delegation-delta-us-per-call=194.294
current-under-1ms=true
delegation-delta-under-250us=true
complexity=one-fixed-shape-validator-call-per-compose
RESULT=PASS
```

The control removed only the unique `composeBrief()` delegation in memory. It
wrote no file. Valid output remained equal before the nine alternating timing
rounds.

### Operational Boundary Review

**Claim Source:** interpreted from the current command registry, project
configuration, and the two exact product patches.

The command registry describes a static HTML and JavaScript product. It has no
service lifecycle and no manual deploy command. GitHub Actions builds `_site/`
from a clean checkout after a push.

The BUG-006 product patches contain no operational surface. The first patch
adds `MAXIMUM_EVIDENCE_AGE_DAYS` and one comparison. The second patch adds one
`portfolio.validatePolicy(input.policy)` call and one failure return.

No deployment, runtime configuration, package source, workflow, monitoring,
logging, metric, trace, alert, retry, or recovery change is required. The
registered `devops` phase still follows `stabilize`. It must review this
no-change boundary rather than be skipped.

### Finding Closure And Routing

The stabilization finding count is zero. No source or persistent test changed.
No new scenario, Test Plan row, or Definition of Done item is required.

Inbound route `BUG-006-ROUTE-019` is complete. The persisted grandfathered
`bugfix-fastlane` order places `devops` immediately after `stabilize`. A
no-change deployment-boundary review routes to `bubbles.devops`.

No scope, Definition of Done checkbox, human acceptance field, certification
field, parent Feature 008 artifact, commit, merge, or push changed.

### Final Packet Checks

**Claim Source:** executed

| Check | Result |
| --- | --- |
| Artifact lint | PASS. Required artifacts, state mirror, report sections, and anti-fabrication checks passed. |
| Traceability guard | PASS. Four scenarios, 13 test rows, four concrete files, four evidence mappings, and zero warnings. |
| Implementation reality | PASS. Two product files scanned with zero violations and zero warnings. |
| Claim-source lint | PASS. Every evidence block uses the closed provenance vocabulary. |
| Final state assertions | PASS. One stabilize claim, one stabilize history row, ROUTE-019 complete, ROUTE-020 pending, zero checked DoD items. |
| Diff containment | PASS. Only this bug report and execution state changed. |

The optional packet-scoped phase-name enum lint exited 1. It reported only the
historical `design` and `plan` tokens that existed before this run:

```text
$ bash .github/bubbles/scripts/phase-name-enum-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-006-evidence-window-date-overflow
[phase-name-enum-lint] scanned 1 state.json file(s), 11 packet phase(s), 0 authored phase(s)
[phase-name-enum-lint] FAIL [G140]: phase name(s) neither registered nor baselined:
	design
	plan
```

The failure set does not include the new `stabilize` token. The resolved
grandfathered mode registers `stabilize` between `harden` and `devops`. This
repository has no phase-name baseline file.

This is a framework-governance observation, not a BUG-006 stability defect.
The authorized packet cannot change framework-managed workflow files or erase
historical specialist claims. The packet remains `in_progress`, and the
registered next phase remains the no-change `bubbles.devops` review.

## DevOps Phase Round 2 - 2026-08-26 {#devops-phase-round-2}

**Phase:** devops
**Agent:** `bubbles.devops`
**Execution model:** `direct-authorized-runner`
**Parent agent:** none
**Claim Source:** interpreted
**Interpretation:** `NOT_APPLICABLE_NO_CHANGE`. BUG-006 introduces no package,
configuration, workflow, deployment, service-lifecycle, port, secret,
observability, runtime-operations, or artifact-generation obligation. No
operational defect was found, so no product, test, workflow, package, config,
deployment, or observability file changed. This phase did not invoke or claim a
live deployment.

### Repository Authority And Checkpoint

**Claim Source:** executed

The host adapter resolved this chat to Research Lab, and repository preflight
committed the actionable repository decision before any local read:

```text
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo> source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:225 revision=225 repository=research-lab root=<repo>
repositoryAlias=research-lab
authority=explicit-repository-root
transition=confirmed
scopeKind=command
scopeId=null
targetKind=repository-root
pathVisibility=local
actionable=true
```

The requested checkpoint was current and the two authorized packet files were
clean before this phase wrote them:

```text
811a73450
checkpoint=811a73450 subject=docs(BUG-006): record stability verification
```

### Operational Change-Boundary Audit

**Command:** current-session checkpoint audit over the exact operational path
set, the two changed product modules, and the three changed test carriers
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-006 round-2 devops operational-boundary audit
baseline=1e3a51f721d087b74cda91f780262073886c7dab
checkpoint=811a73450
actual-checkpoint=811a73450
checkpoint-match=PASS
operational-path=.github/workflows/pages.yml changed=no
operational-path=package.json changed=no
operational-path=package-lock.json changed=no
operational-path=.npmrc changed=no
operational-path=scripts/build-pages-site.mjs changed=no
operational-path=scripts/validate-node-source-lock.mjs changed=no
operational-path=.nojekyll changed=no
operational-path=site-exclusions.json changed=no
operational-path=tools.json changed=no
operational-path=playwright.config.mjs changed=no
operational-path=portfolio-survival-allocation.config.json changed=no
operational-path=.github/bubbles-project.yaml changed=no
changed-operational-token-scan=PASS matches=0
changed-test-dependency-scan=PASS import-or-require-delta=0
service-deploy-substrate=NOT_APPLICABLE absent
pages-checkout-steps=2
pages-artifact-path-steps=1
pages-deploy-action-steps=1
workflow-secret-references=0
audit-result=PASS
```

The checkpoint delta is confined to `rlportfolio.js`,
`rlportfoliobrief.js`, the three authorized test carriers, and this bug packet.
The product delta is one private numeric ceiling, one comparison, and one call
to the existing shared validator with a direct failed-result return. The test
delta adds no import or `require()` boundary. The operational-token scan covers
environment reads, network calls, sockets, timers, console emission,
OpenTelemetry, Prometheus, trace propagation, secrets, listeners, hostnames,
and host addresses.

### Source-Lock Policy

**Command:** `timeout 240 node scripts/validate-node-source-lock.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[node-source-lock] manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
[node-source-lock] npmrc=PASS registry=https://registry.npmjs.org/ entries=5 ignoreScripts=true
[node-source-lock] lockfile=PASS version=3 externalPackages=3 integrity=sha512
[node-source-lock] graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
[node-source-lock] adversarial=missing-file result=REJECTED code=FILE-MISSING
[node-source-lock] adversarial=manifest-drift result=REJECTED code=MANIFEST-KEYS
[node-source-lock] adversarial=manifest-range result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=manifest-wrong-version result=REJECTED code=MANIFEST-PLAYWRIGHT
[node-source-lock] adversarial=second-registry result=REJECTED code=NPMRC-DUPLICATE
[node-source-lock] adversarial=scoped-registry result=REJECTED code=NPMRC-SCOPED-REGISTRY
[node-source-lock] adversarial=verification-disabled result=REJECTED code=NPMRC-VERIFICATION
[node-source-lock] adversarial=lifecycle-relaxation result=REJECTED code=NPMRC-IGNORE-SCRIPTS
[node-source-lock] adversarial=untrusted-resolved-url result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=missing-integrity result=REJECTED code=LOCK-INTEGRITY
[node-source-lock] adversarial=git-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=file-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=path-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=http-source result=REJECTED code=LOCK-SOURCE
[node-source-lock] adversarial=external-version-range result=REJECTED code=LOCK-PACKAGE-VERSION
[node-source-lock] adversarial=extra-package result=REJECTED code=LOCK-GRAPH
[node-source-lock] actual=PASS
[node-source-lock] OK adversarial=16 unexpectedAcceptances=0
```

The scriptless private manifest, exact Playwright version, canonical npm
registry, lockfile-v3 graph, SHA-512 integrity hashes, disabled lifecycle
scripts, and rejection controls remain intact. No provisioning command was
needed because BUG-006 changes neither the manifest nor lockfile.

### Clean-Checkout Pages Semantics

**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 devops Pages staging dry-run" -- timeout 240 node scripts/build-pages-site.mjs --dry-run`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 devops Pages staging dry-run
$ timeout 240 node scripts/build-pages-site.mjs --dry-run
exit: 0
lines: 1
sha256: a6e63c92b8c288fedda3d1816560dfb8c65b1f09ee3a223ff77ed20b6260cd7d
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":29,"excludedPaths":12,"rootFiles":123,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/8839ab9c7d1bcc9b241dd2255a348313f4bd8837ebb98151d4458b0078cf958d","omittedOrphanIndexes":181}
```

The unchanged workflow retains two independent `actions/checkout@v4` steps.
Its blocking verify job validates source locking and the checked-in site before
the dependent deploy job performs a second clean checkout. That deploy job
runs the unchanged site-staging script, uploads only `_site`, and invokes
`actions/deploy-pages@v4`. The dry-run exercised the registered staging plan
without writing `_site`. It did not trigger GitHub Actions or deploy a live
site.

BUG-006 changes root JavaScript already included by the existing static-site
plan. It adds no page, registry entry, exclusion, generated asset, package
script, workflow step, deployment parameter, or manual operator action.

### Operations Obligation Matrix

**Claim Source:** interpreted from the current command registry, Pages
workflow, project config, source-lock files, exact checkpoint audit, and the two
executed focused checks above.

| Domain | Verdict | Current evidence |
| --- | --- | --- |
| Package and dependency provisioning | `NOT_APPLICABLE_NO_CHANGE` | `package.json`, `package-lock.json`, and `.npmrc` are unchanged. The source-lock validator passes with zero runtime dependencies and zero package scripts. |
| Project and product configuration | `NOT_APPLICABLE_NO_CHANGE` | `.github/bubbles-project.yaml`, `config/domain-model.yaml`, and `portfolio-survival-allocation.config.json` are unchanged. The shipped evidence window remains `56`. |
| CI and workflow | `NOT_APPLICABLE_NO_CHANGE` | `.github/workflows/pages.yml` is unchanged. BUG-006 adds no workflow permission, trigger, job, environment, cache, artifact, or deploy step. |
| Deployment | `NOT_APPLICABLE_NO_CHANGE` | The repository has no manual deploy command or `deploy/` adapter. Existing clean-checkout GitHub Pages semantics are unchanged. No live deployment was attempted or claimed. |
| Service lifecycle and ports | `NOT_APPLICABLE_NO_CHANGE` | The command registry declares no service lifecycle. No `Dockerfile`, Compose file, service, listener, port, hostname, or host-address delta exists. |
| Secrets and credentials | `NOT_APPLICABLE_NO_CHANGE` | The product/test delta has no secret or environment-read token, the Pages workflow has zero `secrets.*` references, and no source-lock or workflow surface changed. |
| Observability | `NOT_APPLICABLE_NO_CHANGE` | Project config declares no trace contract or observability adapter. BUG-006 adds no log, metric, trace, alert, retry, or runtime failure channel. |
| Runtime operations | `NOT_APPLICABLE_NO_CHANGE` | The repair is synchronous local validation in already-deployed static JavaScript. It adds no process, network, timer, background task, storage, or recovery obligation. |
| Artifact generation | `NOT_APPLICABLE_NO_CHANGE` | The unchanged registered Pages staging script already copies root JavaScript. Its dry-run plan passes; BUG-006 requires no new generated artifact or generation command. |

### Workflow Routing

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-006 round-2 devops bugfix-fastlane resolution" -- timeout 60 bash .github/bubbles/scripts/mode-resolver.sh --grandfather bugfix-fastlane`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-006 round-2 devops bugfix-fastlane resolution
$ timeout 60 bash .github/bubbles/scripts/mode-resolver.sh --grandfather bugfix-fastlane
exit: 0
lines: 46
sha256: 986156f2dbb912fa87df07d087705abebbe2af8d9db0959aa61484fc7b443022
--- first 20 ---
DEPRECATION (v7 grandfather): resolving removed v5 mode 'bugfix-fastlane' (v6 form: 'fix action:fastlane target:bug'). New work must use the v6 form.
statusCeiling: done
requiredGates: [G001, G002, G003, G004, G005, G006, G007, G008, G009, G010, G011, G012, G014, G015, G016, G018, G019, G020, G021, G022, G023, G024, G025, G026, G027, G028, G029, G033, G034, G035, G040, G044, G047, G048, G051, G055, G056, G057, G059, G060, G061, G094]
constraints:
	specReviewDefault: once-before-implement
	specReviewDefaultScope: done-ceiling-delivery-modes
	specReviewOptOutRequiresReason: true
	requireCanonicalPlanningChain: true
	planningChainAgents: [bubbles.analyst, bubbles.ux, bubbles.design, bubbles.plan]
	sequentialSpecCompletion: true
	crossAgentVerification: true
	antiFabricationDetection: true
	requireAllSpecialistsComplete: true
	requireAllScopesDoneBeforeSpecDone: true
	requirePerDodItemRawEvidence: true
	requireTestsForAllRealScenarios: true
	require100PercentBusinessLogicCoverage: true
	requirePhaseScopeCoherence: true
	requireImplementationRealityScan: true
	requireNoDefaultsNoFallbacks: true
--- omitted 6 line(s); sha256 above covers the full output ---
--- last 20 ---
	requireQualityLoopUntilCertifiedDone: true
	restartLoopAtPhase: implement
	blockedOnlyWhenValidateBlocked: true
	requireNoSkippedTests: true
	requireNoPreexistingFailingTests: true
	requireNoInternalMocksExceptExternalDeps: true
	requireGherkinE2eCoverage: true
	requireAllDiscoveredBugsClosedInRun: true
	requirePhaseEvidenceBeforeAdvance: true
	blockOnMissingSpecialistExecution: true
description: Focused bug loop with mandatory reproduction and verification. Loops until validate certifies the fix or returns a documented blocked verdict.
transitionAudit:
	profile: delivery-completion-v1
	target: statusCeiling
phaseOrder: [select, bootstrap, implement, test, regression, simplify, gaps, harden, stabilize, devops, security, validate, audit, finalize]
sessionBudget:
	maxWallClockMinutes: 180
	maxToolCalls: 350
	maxSingleToolResultBytes: 50000
	maxCumulativeToolResultBytes: 250000
```

Inbound route `BUG-006-ROUTE-020` is complete. The current persisted mode puts
`security` immediately after `devops`, so `BUG-006-ROUTE-021` routes the still
in-progress packet to `bubbles.security` for the round-2 security review.

### Phase Result

No DevOps finding exists. The owned result is
`NOT_APPLICABLE_NO_CHANGE`. Only this report and execution-owned state fields
changed. Packet and scope status remain `in_progress`; all Definition of Done
items remain unchecked; human acceptance and certification remain untouched.
No commit, merge, push, workflow dispatch, or live deployment was performed.
