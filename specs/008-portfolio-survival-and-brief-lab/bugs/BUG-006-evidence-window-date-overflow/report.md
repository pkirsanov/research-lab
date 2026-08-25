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

## Completion Statement

Bug discovery, reproduction, design, planning, scenario-first RED, and the
focused implementation check are recorded. Delivery is not complete. Packet,
scope, and certification remain `in_progress`, and every Definition of Done
item remains unchecked.

The next required owner is `bubbles.test`. It owns focused GREEN status,
regression execution, and scenario/test-plan evidence updates.

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

1. `bubbles.test` performs focused GREEN status accounting, allocation-page
	non-movement, Feature 008 browser, and canonical repository regression runs.
2. `bubbles.validate` runs the packet and transition guards and owns any
	certification write.
