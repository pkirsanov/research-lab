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
- Hardened only `rlportfoliobrief.js` with the designed null-prototype internal
  maps and explicit own-property reads, including one resolved own truthy owner
  per qualified subject.
- Executed the focused functional carrier GREEN at 34 of 34 and the in-memory
  mutation carrier GREEN at 2 of 2, with zero failures or skips.
- Rechecked source syntax and diff whitespace with explicit clean sentinels.
- Kept the parent Feature 008 scope and root test-plan transaction untouched.

## Completion Statement

The bounded product-source implementation is complete and its focused
functional and in-memory mutation checks are GREEN. Scenario-specific browser,
broader browser regression, repository selftest, quality phases, human
acceptance, and validate-owned certification remain outside this implementation
handoff. Packet status remains `in_progress`; no DoD checkbox, scope status,
human-acceptance item, certification field, or terminal status is changed.

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

### Implementation Focused GREEN {#implementation-focused-green}

**Phase:** implement
**Executed:** YES
**Commands:**

- `timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
- `timeout 120 node --check rlportfoliobrief.js`
- `timeout 120 git diff --check -- rlportfoliobrief.js`

**Exit Codes:** `0, 0, 0, 0`
**Claim Source:** executed

```text
# BUG-007 focused implementation GREEN
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 214
sha256: 89c804d3db9643b06ea0e5d590290a781ec9061f464df75bc64f4a7f5a5e517c
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
  ---
  duration_ms: 196.381163
  type: 'test'
  ...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
  ---
  duration_ms: 36.230493
  type: 'test'
  ...
# Subtest: behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
  ---
  duration_ms: 86.714384
  type: 'test'
  ...
# Subtest: dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference
--- omitted 174 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 33 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
  ---
  duration_ms: 2.270299
  type: 'test'
  ...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 34 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
  ---
  duration_ms: 89.444584
  type: 'test'
  ...
1..34
# tests 34
# suites 0
# pass 34
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 631.944482
```

```text
# BUG-007 implementation mutation integrity
$ timeout 240 node --test tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 22
sha256: dc185865d27d1aa43c744ecffc96b1943994079253344345433ebb0df161ed39
--- output ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 7625.467133
  type: 'test'
  ...
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
  ---
  duration_ms: 916.435621
  type: 'test'
  ...
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8624.809185
```

```text
[node-check] OK
[git-diff-check] OK
```

The functional carrier proves the ordinary 30-title compatibility surface and
all four hostile-key titles together. The mutation carrier proves the safe-map,
caller-map ownership, and normal-order protections remain load-bearing without
writing tracked source. These focused results do not substitute for the
test-owned browser, broader regression, or repository selftest phases.

## Code Diff Evidence

This implementation phase changes only `rlportfoliobrief.js` plus this BUG-007
report and execution state. The source diff contains only the inventoried
caller-keyed allocations and own-property reads. The shared injector,
persistent carriers, parent Feature 008 planning transaction, DoD checkboxes,
human validation, and certification fields remain outside this implementation
transaction. `node --check` and `git diff --check` both completed cleanly.

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
currentOwner: bubbles.implement
nextRequiredOwner: bubbles.test
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - SEC-B006-S1-IMPLEMENTATION
unresolvedFindings: []
evidence:
  - report.md#implementation-focused-green
  - rlportfoliobrief.js
reason: The bounded product-source repair and focused implementation checks are complete; test ownership must execute the scenario-specific browser carrier, broader regression, and remaining planned verification before any completion or certification claim.
```
