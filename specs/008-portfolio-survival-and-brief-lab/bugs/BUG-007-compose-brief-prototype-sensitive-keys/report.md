# Report: BUG-007 Compose Brief Prototype-Sensitive Keys

## Summary

- Filed a complete BUG-007 control-plane packet for `SEC-B006-S1`.
- Independently reproduced the normal control and all six hostile subject/domain
  combinations against current `rlportfoliobrief.js`.
- Confirmed cleanup after every process-local built-in mutation.
- Inventoried ten internal caller-keyed maps, the nested date set, and two
  caller-supplied lookup maps that must be handled together.
- Authored the planned persistent functional, browser, and in-memory mutation
  carriers without changing product source or the shared defect injector.
- Executed the exact focused persistent command against unchanged source: all
  30 unrelated and compatibility tests passed, while exactly the four new
  hostile-key titles failed and zero tests were skipped.
- Kept the parent Feature 008 scope and root test-plan transaction untouched.

## Completion Statement

The scenario-first persistent RED handoff is complete. The bug fix is not
implemented, the browser and mutation carriers are authored but not executed,
and no GREEN, delivery, human-acceptance, or certification claim is made.
Packet status remains `in_progress` and routes to `bubbles.implement` for the
bounded `rlportfoliobrief.js` repair.

## Test Evidence

### Before Fix Reproduction {#before-fix-reproduction}

**Phase:** bug
**Executed:** YES
**Command:** `timeout 120 node -e '<process-isolated normal plus subject/domain hostile-key matrix over committed modules and configs>'`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-007 PROTOTYPE-SENSITIVE KEY PROBE
preProbeMutation=none
normal.ok=true
normal.laneOrder=held,watchlist,completedResearch,inferredRelevance
normal.subjectOrder=MSFT,BND,ZZTOP,semiconductors
normal.prototypeMutation=none
case=subjectId:__proto__ returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype cleanup=none
case=subjectId:constructor returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object cleanup=none
case=subjectId:toString returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype.toString cleanup=none
case=domain:__proto__ returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype cleanup=none
case=domain:constructor returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object cleanup=none
case=domain:toString returned=false envelope=false caught=true error=TypeError:categoriesBySubject[key].indexOf is not a function mutation=Object.prototype.toString cleanup=none
postProbeMutation=none
```

The exit code is zero because the diagnostic intentionally catches and records
each product throw so the complete six-case matrix and cleanup can execute. The
`returned=false`, `envelope=false`, `caught=true`, and mutation fields are the
failure signals.

### Root Cause And Map Inventory {#root-cause-map-inventory}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** Current source inspection connects the executed mutations
and throws to ordinary-object inherited lookup. The exact inventory is recorded
in `design.md#complete-affected-inventory` and includes all ten internal
caller-keyed maps, the nested date set, and the latent `owners` and
`priorEvidenceIds` reads. Domain keys enter the same support loop independently
of subject keys, matching the executed domain matrix.

### TP-B007-000 {#tp-b007-000}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-007 focused persistent RED
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 1
lines: 428
sha256: 223dd5ae9806cda76bea21b7fbb463f5679592eeb607d3edfc62c7016521ced3
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
  ---
  duration_ms: 238.189019
  type: 'test'
  ...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
  ---
  duration_ms: 37.074512
  type: 'test'
  ...
# Subtest: behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
  ---
  duration_ms: 82.478049
  type: 'test'
  ...
# Subtest: dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference
--- failure-shaped lines from the omitted region ---
not ok 6 - BUG-007: prototype-sensitive completion keys are safe own keys
not ok 7 - BUG-007: prototype-sensitive completion subjects are safe own keys
not ok 8 - BUG-007: prototype-sensitive completion domains are safe own keys
not ok 9 - BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
--- omitted 388 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 33 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
  ---
  duration_ms: 1.465505
  type: 'test'
  ...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 34 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
  ---
  duration_ms: 114.826057
  type: 'test'
  ...
1..34
# tests 34
# suites 0
# pass 30
# fail 4
# cancelled 0
# skipped 0
# todo 0
# duration_ms 709.704867
```

The first direct execution of the same exact command reported each hostile
case adding `2026-07-15` to its inherited target: `Object.prototype`, `Object`,
or `Object.prototype.toString`. The aggregate and per-axis titles first assert
that post-`finally` cleanup is empty, then fail on the observed pre-cleanup
mutation. That ordering proves cleanup completed and the RED is the prototype
defect rather than a setup or escaped-harness failure.

### TP-B007-001 {#tp-b007-001}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The exact run under `TP-B007-000` passed
`BUG-007: normal brief order and refusal precedence remain unchanged`. It also
passed every 29 pre-existing functional title. This is compatibility evidence,
not a GREEN claim for the hostile scenarios.

### TP-B007-002 {#tp-b007-002}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The exact run under `TP-B007-000` executed all three subject keys. The subject
title failed on the observed shared built-in mutation after its cleanup
assertion passed. Expected own-row assertions remain RED pending implementation.

### TP-B007-003 {#tp-b007-003}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The exact run under `TP-B007-000` executed all three domain keys. The domain
title failed on the observed shared built-in mutation after its cleanup
assertion passed. Expected support-count and floor assertions remain RED pending
implementation.

### TP-B007-004 {#tp-b007-004}

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The exact run under `TP-B007-000` executed own and inherited lookup fixtures for
all three keys. Cleanup passed; the title then failed on the same pre-cleanup
prototype mutation. Own/inherited lookup assertions remain RED pending the
earlier aggregation repair.

### TP-B007-005 {#tp-b007-005}

**Phase:** test
**Claim Source:** not-run
The persistent in-memory test-integrity challenge is authored in
`tests/portfolio-test-integrity.unit.mjs`. It is deliberately not executed in
this RED handoff because the protections it removes do not exist in unchanged
source. Post-implementation execution must require one applied substitution, a
RED protective title, and byte-identical tracked product/test files.

### TP-B007-006 {#tp-b007-006}

**Phase:** test
**Claim Source:** not-run
The persistent real-browser exported six-case matrix and visible production
`constructor` completion workflow are authored in
`tests/portfolio-survival-brief.spec.mjs`. They are reserved for the
post-implementation GREEN run; no browser result is claimed here.

### TP-B007-007 {#tp-b007-007}

**Phase:** test
**Claim Source:** not-run
The broader Feature 008 browser regression remains reserved for
post-implementation execution.

### TP-B007-008 {#tp-b007-008}

**Phase:** test
**Claim Source:** not-run
The canonical repository selftest remains reserved for post-implementation
execution.

### TP-B007-009 {#tp-b007-009}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && timeout 600 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && timeout 600 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root . && timeout 600 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && timeout 600 bash .github/bubbles/scripts/capability-foundation-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 artifact lint after RED handoff
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.
# BUG-007 traceability after RED handoff
exit: 0
lines: 54
sha256: 4a6caa70827d1e61b12d19a141c2af6ed6b343754101091cec321618d5c1a98d
Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
Scenarios checked: 3
Test rows checked: 13
DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
RESULT: PASSED (0 warnings)
[scenario-obligation-lint] OK - 3 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK - 3 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK - mutationExecution adapter is none (inert)
[scope-context-fit-lint] OK - all 1 scope(s) are self-contained; a fresh specialist can execute from the durable artifacts.
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
[execution-substate-guard] OK - execution substate is valid and distinct from certification.
```

The two verbose guard outputs were captured through `evidence-capture.sh`; their
hashes cover every omitted line. The other four packet guards and the
execution-substate guard emitted the compact lines shown. Home paths are
normalized to `~/research-lab` under repository PII policy.

### TP-B007-010 {#tp-b007-010}

**Phase:** test
**Claim Source:** not-run
The implementation-reality scan remains reserved for post-implementation
execution.

### TP-B007-011 {#tp-b007-011}

**Phase:** validate
**Claim Source:** not-run
The transition guard remains reserved for final validate-owned certification
after implementation, GREEN tests, human acceptance, and required quality work.

### Test Carrier Integrity {#test-carrier-integrity}

**Phase:** test
**Executed:** YES
**Commands:**

- `timeout 600 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root .`
- `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs`

**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
[scenario-test-resolve] OK — 9 reference(s) resolved via literal-scan; 9 category comparison(s) not applicable (no test-discovery adapter declared)
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-26T17:00:39Z
  Bugfix mode: true
============================================================
ℹ️  Scanning tests/portfolio-brief.functional.mjs
✅ Adversarial signal detected in tests/portfolio-brief.functional.mjs
ℹ️  Scanning tests/portfolio-survival-brief.spec.mjs
✅ Asserts the current surface in tests/portfolio-survival-brief.spec.mjs (mixed inspection accepted)
✅ Adversarial signal detected in tests/portfolio-survival-brief.spec.mjs
ℹ️  Scanning tests/portfolio-test-integrity.unit.mjs
✅ Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 3
  Files with adversarial signals: 3
============================================================
```

The home path in this evidence is normalized to `~/research-lab` under the
repository PII policy. No command output or verdict is otherwise changed.

## Code Diff Evidence

This test phase changes only the three planned persistent carriers plus this
test-owned report and execution state. `git diff --exit-code` returned zero for
`rlportfoliobrief.js` and `tests/portfolio-defect-injector.cjs`. Product source,
the shared injector, parent Feature 008 planning files, DoD checkboxes, human
validation, and certification fields are outside this commit.

## Validation Evidence

**Executed:** NO
**Command:** Not run in the validate phase.
**Phase Agent:** `bubbles.validate`
**Claim Source:** not-run

Validate-owned certification is outside this filing. Status remains
`in_progress`.

## Audit Evidence

**Executed:** NO
**Command:** Not run in the audit phase.
**Phase Agent:** `bubbles.audit`
**Claim Source:** not-run

Audit is a later required bugfix-fastlane phase.

## Chaos Evidence

**Executed:** NO
**Command:** Not applicable to packet filing.
**Phase Agent:** `bubbles.chaos`
**Claim Source:** not-run

No runtime implementation exists in this packet to probe through chaos work.

## Discovered Issues

No second defect was filed. Fixed-vocabulary lookup maps outside the completion
subject/domain aggregation boundary were deliberately not reclassified as part
of `SEC-B006-S1`.

## RESULT-ENVELOPE

```yaml
outcome: route_required
currentOwner: bubbles.bug
nextRequiredOwner: bubbles.design
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - SEC-B006-S1-FILING
unresolvedFindings:
  - SEC-B006-S1-IMPLEMENTATION
evidence:
  - report.md#before-fix-reproduction
reason: The defect is independently reproduced and fully packeted; design ownership must confirm the boundary before scenario-first persistent tests and source implementation.
```
