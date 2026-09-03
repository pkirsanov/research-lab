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
- Independently reran the focused functional carrier at 34 of 34 and the
  in-memory mutation carrier at 2 of 2 under `bubbles.test` receipts.
- Executed the exact scenario browser carrier at 19 of 19, including the named
  BUG-007 hostile-key and visible `constructor` workflow.
- Executed the exact eight-file Feature 008 browser matrix at 95 of 95 and the
  canonical repository selftest at 3426 of 3426.
- Resolved all 9 linked test identities and passed bugfix regression quality on
  all 3 BUG-007 carriers with zero violations or warnings.
- Passed all 6 TP-B007-009 packet guards and TP-B007-010 implementation reality
  with zero violations or warnings.
- Verified 16 of 16 current BUG-007 receipt identities are closure-bearing and
  valid, with zero stale or unknown identities and all 10 required row tags.
- Rechecked source syntax and diff whitespace with explicit clean sentinels.
- Independently reviewed the 200-line `rlportfoliobrief.js` implementation diff
  and the adjacent parent, BUG-004, BUG-005, and BUG-006 design contracts.
- Independently reran the focused functional carrier at 34 of 34, the in-memory
  mutation carrier at 2 of 2, and the real browser carrier at 19 of 19.
- Revalidated all 3 persistent carriers through bugfix regression quality with
  zero violations or warnings and resolved all 9 scenario links.
- Verified the source, all 3 carriers, and the shared in-memory injector retained
  their exact pre-run sha256 values and remained clean in Git.
- The regression phase observed 16 of 16 BUG-007 test identities as current at
  its then-current packet hash. The gaps phase found 9 still valid and 7 stale
  after later report-only phase updates; the stale seven are the test-owned
  packet guards and implementation-reality identity, not behavior regressions.
- Rechecked the canonical global strict receipt truth at 29 stale and 42
  unknown identities: the original 22 stale identities remain unrelated
  repository history, while the additional 7 are the BUG-007 report-bound
  identities above. No identity was refreshed, relabeled, or treated as proof.
- Reviewed the exact implementation diff and all three persistent carriers for
  reuse, code quality, naming, and efficiency under `bubbles.simplify`.
- Kept the direct `Object.create(null)` and
  `Object.prototype.hasOwnProperty.call()` sites unchanged because each site
  exposes the security invariant that a helper or compressed expression would
  hide; no behavior-preserving simplification was clearer or smaller.
- Reran the focused functional carrier at 34 of 34 and the in-memory mutation
  carrier at 2 of 2, then revalidated all three carriers through bugfix
  regression quality with zero violations or warnings.
- Verified source and carrier bytes remained unchanged before and after the
  mutation run. The browser carrier was not rerun because simplify changed no
  source, test, browser contract, or behavior.
- Kept the parent Feature 008 scope and root test-plan transaction untouched.

## Completion Statement

Packet status: in_progress
Planning reconciliation: reconciled-current-evidence
Next required owner: bubbles.implement
Next required action: mandatory-delivery-chain-implementation-boundary-review

TP-B007-012 was executed-passed by bubbles.test. The rollback and restore DoD
is checked against its dated evidence. Human acceptance is recorded. This
planner reconciliation claims no test execution, implementation action,
transition result, scope completion, packet completion, or certification. The
implementation-boundary review does not presume that source changes are
required.

AUDIT-B007-ROUTE018-PROVENANCE-001 and AUDIT-B007-UX-OWNERSHIP-001 remain
addressed by their owning analyst and UX records. Audit attempt
BUG-007-AUDIT-001 remains REWORK_REQUIRED. VALIDATE-B007-G090-FRAMEWORK-001,
VALIDATE-B007-CHECK8-AGENT-ID-001, VALIDATE-REPO-HANDOFF-CYCLE-001,
VALIDATE-REPO-COLLECTED-TEST-COUNT-001, and
VALIDATE-REPO-STALE-RECEIPT-001 remain unresolved under their existing
external or independent owners.

TP-B007-011 is not-run and unchecked. Build Quality is unchecked. Scope 01 is
Not Started. Top-level status and certification.status are in_progress.
Historical evidence and route records remain unchanged.

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
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current focused functional evidence](#bug007-current-focused-functional)

The exact normal-order and refusal title passed in the title-visible 34-test
run. Lane and subject order plus both refusal envelopes are asserted directly
by that persistent title.

### TP-B007-002 {#tp-b007-002}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current focused functional evidence](#bug007-current-focused-functional)

The title-visible run passed the aggregate six-case title and the dedicated
three-subject title. The persistent assertions require own completed-research
rows, exact evidence ids, absent lookup semantics, no throw, and no mutation.

### TP-B007-003 {#tp-b007-003}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current focused functional evidence](#bug007-current-focused-functional)

The dedicated three-domain title passed. Its persistent assertions require two
supporting completions, two distinct dates, a satisfied floor, one inferred row,
the expected evidence id, no throw, and no shared built-in mutation.

### TP-B007-004 {#tp-b007-004}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current focused functional evidence](#bug007-current-focused-functional)

The own/inherited lookup and cleanup title passed. It asserts all three hostile
keys under own and inherited caller maps, post-finally restoration, zero
pre-cleanup mutation, no throw, and the unchanged owner/prior-window semantics.

### TP-B007-005 {#tp-b007-005}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** RED as required before the injector repair. The strengthened carrier
executed exactly one selected outer test and rejected the pre-existing false
positive identified by `HARDEN-B007-001`.

```text
# TP-B007-005 causal RED
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 1
lines: 58
sha256: ab3ee469f948cb062976b1245eb57bd43d045a14216e8dd5565e7e20d5f76ace
--- first 20 ---
TAP version 13
# Subtest: BUG-007: represented mutants execute one protective assertion through one intended hook
not ok 1 - BUG-007: represented mutants execute one protective assertion through one intended hook
  ---
  duration_ms: 1305.171228
  type: 'test'
  location: '~/research-lab/tests/portfolio-test-integrity.unit.mjs:454:1'
  failureType: 'testCodeFailure'
  error: |-
    BUG-007 protections that are not load-bearing:
      BUG-007-NULL-PROTOTYPE-MAP: the completion-category index regains Object.prototype inheritance: marker named hook readFileSync, expected Module._compile; mutant output contains forbidden infrastructure failure: error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'; mutant failure did not originate from the selected protective assertion
      BUG-007-OWN-OWNER-LOOKUP: an inherited owner entry is accepted as though the caller supplied it: marker named hook readFileSync, expected Module._compile; mutant output contains forbidden infrastructure failure: error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'; mutant failure did not originate from the selected protective assertion
      BUG-007-NORMAL-LANE-ORDER: watchlist is ranked ahead of held instead of preserving direct-authority order: marker named hook readFileSync, expected Module._compile; mutant output contains forbidden infrastructure failure: error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'; mutant failure did not originate from the selected protective assertion
      DOUBLE-APPLICATION-CONTROL: observed hooks ["readFileSync"], expected ["fs.readFileSync","Module._compile"]
      DOUBLE-APPLICATION-CONTROL: carrier did not classify two applications as infrastructure failure: marker named hook readFileSync, expected Module._compile; mutant output contains forbidden infrastructure failure: error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'; mutant failure did not originate from the selected protective assertion
      DOUBLE-APPLICATION-CONTROL: injector/preload failure prevented the selected protective assertion
      DIRECT-TEXT-CONTROL: marker named hook readFileSync, expected fs.readFileSync
--- omitted 18 line(s); sha256 above covers the full output ---
--- last 20 ---
    4: "DOUBLE-APPLICATION-CONTROL: carrier did not classify two applications as infrastructure failure: marker named hook readFileSync, expected Module._compile; mutant output contains forbidden infrastructure failure: error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'; mutant failure did not originate from the selected protective assertion"
    5: 'DOUBLE-APPLICATION-CONTROL: injector/preload failure prevented the selected protective assertion'
    6: 'DIRECT-TEXT-CONTROL: marker named hook readFileSync, expected fs.readFileSync'
  operator: 'deepStrictEqual'
  stack: |-
    TestContext.<anonymous> (~/research-lab/tests/portfolio-test-integrity.unit.mjs:523:10)
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
# duration_ms 1380.602627
```

### TP-B007-006 {#tp-b007-006}

**Phase:** test
**Executed:** YES
**Command:** `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current scenario browser evidence](#bug007-current-scenario-browser)

The exact file ran 19 tests. The named BUG-007 browser title passed and its
persistent body executes all six hostile exported cases, exact normal order,
zero built-in mutation/throw, and the visible preview/confirm/rerender path.

### TP-B007-007 {#tp-b007-007}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current broader E2E evidence](#bug007-current-feature-e2e)

The exact eight-file Feature 008 command passed 95 of 95 tests using the pinned
two-worker system-Chrome configuration.

### TP-B007-008 {#tp-b007-008}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current canonical selftest evidence](#bug007-current-selftest)

The canonical build-free repository selftest passed 3426 of 3426 checks with
zero failures.

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

#### Current Test-Phase Rerun

**Phase:** test
**Executed:** YES
**Command:** the exact six-child `CMD-B007-PACKET-GUARDS` sequence from
`test-plan.json`
**Exit Codes:** `0, 0, 0, 0, 0, 0`
**Claim Source:** executed

```text
artifact-lint: exit=0 lines=41 sha256=507ad846de580e14ee6107a0df565beb769df5c765d09281dcc1382ad1c602c8
artifact-lint: Artifact lint PASSED
traceability: exit=0 lines=55 sha256=84dfb35ef7788050f84d10c6288e615a199b6fb129d06548b1284b45501daf61
traceability: scenarios=3 test-rows=13 concrete-tests=3 evidence-refs=3 warnings=0
scenario-obligation: exit=0 scenarios=3 coherent=yes
test-mechanism: exit=0 mechanisms=3 coherent=yes
mutation-receipt: adapter=none outcome=inert
scope-context: exit=0 scopes=1 self-contained=yes
capability-foundation: exit=0 gate=G094 single-capability-justification=present
packet-guard-battery: passed=6 failed=0
```

Every child was wrapped separately by `tool-log.sh` with the packet, delivered
source, and persistent carrier inputs in its closure. The paths printed by the
traceability banner are normalized in this report; the capture hashes cover the
original streams.

### TP-B007-010 {#tp-b007-010}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-007 TP-B007-010 implementation reality
exit: 0
lines: 37
sha256: ba03475d07b7760e47602fc7aee55cf44c289db44630fde78cda8d362b5d3435
implementation files resolved: 1
gateway/backend stub violations: 0
frontend hardcoded-data violations: 0
default/fallback violations: 0
files scanned: 1
violations: 0
warnings: 0
PASSED: No source code reality violations detected
```

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

### Current Test Phase Focused Functional {#bug007-current-focused-functional}

**Phase:** test
**Executed:** YES
**Commands:**

- `timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test --test-reporter=spec tests/portfolio-brief.functional.mjs`

**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
# BUG-007 focused functional title-visible
$ timeout 240 node --test --test-reporter=spec tests/portfolio-brief.functional.mjs
exit: 0
lines: 43
sha256: 3ab97d4f216066315bd04d4523b950a37e3d00b7a54588855002c18bc21e2645
--- first 20 ---
PASS BUG-007: normal brief order and refusal precedence remain unchanged
PASS BUG-007: prototype-sensitive completion keys are safe own keys
PASS BUG-007: prototype-sensitive completion subjects are safe own keys
PASS BUG-007: prototype-sensitive completion domains are safe own keys
PASS BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
--- last 20 ---
tests 34
suites 0
pass 34
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 861.30562
```

The title lines above normalize Node's check glyph to `PASS`; the capture hash
covers the complete original 43-line stream. The exact required command also
ran through `tool-log.sh`: 34 tests, 34 passed, 0 failed, 0 skipped, 0 todo,
full-output sha256
`2b788db5ea8e88932add71903544156bd30f47ccd8896ba36a56b33c698e8543`.

### Current Test Phase Mutation Integrity {#bug007-current-mutation-integrity}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
1..2
# tests 2
# suites 0
# pass 2
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8523.081984
```

Capture sha256:
`1ca07ca2e6afbb9ba7dd66fe406db0abeeb207185adf67f4ed912df5501792af`.
An independent staged and unstaged diff check immediately afterward reported
`POST_MUTATION_SOURCE_TEST_INTEGRITY=clean` across all five tracked inputs.

### Current Test Phase Scenario Browser {#bug007-current-scenario-browser}

**Phase:** test
**Executed:** YES
**Command:** `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-006 scenario browser
exit: 0
lines: 68
sha256: 449d33ada0567f9a2f13bb3a7b4f95908fa4dab80ad0ac32fcdd593388de09ff
Running 19 tests using 1 worker
PASS BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
PASS Regression: SCN-008-007 TP-05-07 a completed-research subject renders in its own lane with its qualification source
PASS Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent
PASS Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace
PASS Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule
PASS Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
19 passed (32.9s)
tool-log receipt exit=0 duration=34154ms
```

The source scan over this carrier found zero `page.route`, `context.route`,
`msw`, `nock`, interception, skip, or bailout-return matches.

### Current Test Phase Feature E2E {#bug007-current-feature-e2e}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-007 Feature 008 E2E
exit: 0
lines: 305
sha256: 9f9a3e4d7d94a908f74aef4c6272ddb4fc99843f671feed794ad65a8d82be744
Running 95 tests using 2 workers
PASS Regression: SCN-008-026 all six allocation methods share one frozen basis
PASS Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete
PASS Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
PASS BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
PASS Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
PASS Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
95 passed (2.3m)
tool-log receipt exit=0 duration=137599ms
```

### Current Test Phase Canonical Selftest {#bug007-current-selftest}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-008 canonical selftest
exit: 0
lines: 3913
sha256: 27f5345ef4bf6e144518f234ff86f55aef7b134738dd0d159cee8fff580cd359
Step 1 security - escaped model sinks and CSP on every page
PASS every shipped HTML page carries a Content-Security-Policy meta
PASS production pages and shared runtime contain no open URL-forwarding relay chain
PASS no model/config-authored field reaches innerHTML without esc()
PASS every committed progress claim resolves to a scope artifact the guard can actually read
PASS no scope progress claim disagrees with its Definition of Done outside the frozen baseline
Research-Lab self-test: 3426 passed, 0 failed
tool-log receipt exit=0 duration=35318ms
```

### Current Test Phase Carrier Integrity {#bug007-current-carrier-integrity}

**Phase:** test
**Executed:** YES
**Commands:** scenario resolution, `regression-quality-guard.sh --bugfix`,
skip/interception/bailout scans, Playwright identity, test-leaf adapter resolve,
and source/test diff integrity.
**Exit Codes:** all `0`
**Claim Source:** executed

```text
Playwright version=1.61.1
scenario-test-resolve: 9 references resolved; 9 category comparisons not applicable
regression-quality: files scanned=3
regression-quality: files with adversarial signals=3
regression-quality: violations=0 warnings=0
skip_marker_matches=0
live_interception_matches=0
browser_bailout_matches=0
test-leaf-receipt adapter=none
SOURCE_TEST_INTEGRITY=clean
POST_MUTATION_SOURCE_TEST_INTEGRITY=clean
```

### Current Test Phase Receipt Integrity {#bug007-current-receipt-integrity}

**Phase:** test
**Executed:** YES
**Command:** current-session latest-identity and input-closure assertion over
`.specify/runtime/tool-calls.jsonl`, using the same identity fields and sha256
comparison rules as `evidence-receipt-check.sh`
**Exit Code:** 0
**Claim Source:** executed

```text
spec=BUG-007-compose-brief-prototype-sensitive-keys
session=BUG007-TEST-vscode-d037d272-238
appendCount=16
currentIdentities=16
withClosure=16
valid=16
stale=0
unknown=0
requiredTags=10
missingRequiredTags=[]
staleReceipts=[]
```

The canonical global strict checker was also executed. It exited `1` because
22 unrelated historical identities from earlier Feature 008 and BUG-006 work
remain current under different command identities after the delivered source
changed. They were not refreshed or rewritten from this BUG-007 boundary. The
scoped assertion above covers every current identity produced for the required
BUG-007 test rows and fails closed on any missing tag, stale input, unknown
closure, or missing file.

## Independent Regression Phase {#bug007-regression-phase}

**Phase:** regression
**Claim Source:** interpreted
**Interpretation:** The delivered map-only repair is regression-free inside the
declared BUG-007 boundary and its shared Feature 008 composer consumers. The
fresh functional, mutation, and browser executions preserve normal ordering,
own-versus-inherited lookup behavior, built-in integrity, no-throw behavior,
and ordinary-key compatibility. Freshness inspection supports reuse of the
test-owned broader Feature 008 and canonical-selftest receipts. This is not a
claim that the repository-wide strict receipt ledger is clean.

### Source Delta And Design Coherence

**Phase:** regression
**Executed:** YES
**Commands:**

- `timeout 30 git diff --no-ext-diff d49a2955b^ d49a2955b -- rlportfoliobrief.js`
- `timeout 30 node --check rlportfoliobrief.js`
- `timeout 30 git diff --check d49a2955b^ d49a2955b -- rlportfoliobrief.js`
- `timeout 30 git diff --exit-code d49a2955b^ 8d1ae27b2 -- tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs tests/portfolio-defect-injector.cjs`

**Exit Codes:** `0, 0, 0, 0`
**Claim Source:** executed

```text
# BUG-007 exact rlportfoliobrief diff
$ timeout 30 git diff --no-ext-diff d49a2955b^ d49a2955b -- rlportfoliobrief.js
exit: 0
lines: 200
sha256: e2305feeb60c0e869d1505ec12a659d618d58130be6c98aefdb4b94a6675bf01
--- first changed allocation ---
-    var seen = {};
+    var seen = Object.create(null);
--- omitted region covered by the full-output sha256 ---
--- final changed lookup ---
-          deepLink: owners[subjectId] ? owners[subjectId].href : null,
+          deepLink: resolvedOwner ? resolvedOwner.href : null,
NODE_CHECK_EXIT=0
IMPLEMENTATION_DIFF_CHECK_EXIT=0
IMPLEMENTATION_TEST_WINDOW_DIFF_EXIT=0
```

Inspection of the complete diff and current function found all ten named
caller-keyed maps plus the nested date set inheritance-free. Every absence test
over an affected map is own-property based. `owners` and `priorEvidenceIds` are
resolved once through own membership before use. No route, signature, contract
version, policy value, Date expression, error envelope, or output schema moved.

The parent design still assigns ranking, why-shown projection, de-duplication,
and lifecycle reduction to this composer. BUG-004 occurrence identity, BUG-005
stale-domain semantics, and BUG-006 shared policy validation remain unchanged.
Their persistent controls run in the focused functional or browser carriers.
No cross-spec contradiction or route collision was found.

### Fresh Functional And Mutation Closure

**Phase:** regression
**Executed:** YES
**Commands:**

- `timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test --test-reporter=spec tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`

**Exit Codes:** `0, 0, 0`
**Claim Source:** executed

```text
# BUG-007 regression focused functional
exit: 0
lines: 214
sha256: dad5d8c873b249a4a36ee6ebe38b977300a8d19e229b40e74fc32c58334b6d6b
PASS BUG-007: normal brief order and refusal precedence remain unchanged
PASS BUG-007: prototype-sensitive completion keys are safe own keys
PASS BUG-007: prototype-sensitive completion subjects are safe own keys
PASS BUG-007: prototype-sensitive completion domains are safe own keys
PASS BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
tests 34
pass 34
fail 0
skipped 0
todo 0
# BUG-007 regression mutation integrity
PASS Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
PASS BUG-007: caller-key protections and normal ordering are load-bearing in memory
tests 2
pass 2
fail 0
skipped 0
todo 0
```

The functional carrier directly checks the exact normal lane and subject order,
representative local and shared-policy refusals, all six subject/domain hostile
cases, descriptor-level built-in integrity before cleanup, no escaped throw,
own and inherited `owners`, and own and inherited `priorEvidenceIds`. The
mutation carrier independently makes the category map ordinary, accepts an
inherited owner, and swaps held/watchlist order, one substitution at a time.
Each mutant must turn its exact persistent title red while shipped source stays
green.

### Fresh Real-Browser Scenario

**Phase:** regression
**Executed:** YES
**Commands:**

- `timeout 30 npx --no-install playwright --version`
- `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`

**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
Version 1.61.1
# BUG-007 regression scenario browser
exit: 0
lines: 67
sha256: a5d5be5f6a622010c971ceca9d7b449d1ac24662047f63bd8636e1a771447c69
Running 19 tests using 1 worker
PASS BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
PASS Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
PASS Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule
PASS Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
19 passed (32.5s)
```

The named browser body invokes the UMD composer for all six hostile cases,
checks exact normal order and descriptor-level built-in integrity, then records
`constructor` through the production preview and confirm controls. It requires
one visible lane or named no-action row, an enabled Brief control, and zero page
errors.

### Carrier Quality And Scenario Resolution

**Phase:** regression
**Executed:** YES
**Commands:**

- `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs`
- `timeout 600 bash .github/bubbles/scripts/scenario-test-resolve.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root .`

**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Repo: ~/research-lab
Bugfix mode: true
Scanning tests/portfolio-brief.functional.mjs
Adversarial signal detected in tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-survival-brief.spec.mjs
Asserts the current surface in tests/portfolio-survival-brief.spec.mjs
Adversarial signal detected in tests/portfolio-survival-brief.spec.mjs
Scanning tests/portfolio-test-integrity.unit.mjs
Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
[scenario-test-resolve] OK - 9 reference(s) resolved via literal-scan; 9 category comparison(s) not applicable (no test-discovery adapter declared)
```

The repository path is normalized to `~/research-lab` for committed PII
hygiene. No guard verdict is otherwise rewritten.

### Source, Test, Injector, And Parent-Transaction Integrity

**Phase:** regression
**Executed:** YES
**Commands:** pre-run and post-run `sha256sum` over the five named paths, a
post-run `git diff --exit-code` over those paths, and pre-run and post-run
binary-patch hashes over the protected parent Feature 008 scopes, reports, and
root `test-plan.json`.
**Exit Codes:** all `0`
**Claim Source:** executed

```text
d8fa7cf2a0fe437039f49cef2f84e97693a776088c086d6f86f21ca1f913e8c0  rlportfoliobrief.js
a8d963a9feec48cb331eebc871f742f2784aa0676ca26d7ad211ef0d35d60b63  tests/portfolio-brief.functional.mjs
d4db00741c5efee7f63acc630d012fc6400dd91fa963e3ab66082355629b3b46  tests/portfolio-survival-brief.spec.mjs
e8f2eb90856588f5ec7cb4598b1d960f771d864c19135e1aa0967b8323594fce  tests/portfolio-test-integrity.unit.mjs
dfa9231cab23bc0c97ccb601ece72d185743649a2de4801236f4c7a6489d0e2f  tests/portfolio-defect-injector.cjs
POST-RUN: the same five sha256 values were observed
SOURCE_TEST_DIFF_EXIT=0
PARENT_PATCH_BEFORE=37e28a7dd65839134fba81f550a1cfbf2a4ad4b9b184f5387fbac07469b0db9c
PARENT_PATCH_AFTER=37e28a7dd65839134fba81f550a1cfbf2a4ad4b9b184f5387fbac07469b0db9c
PARENT_PATCH_MATCH=true
```

No source, persistent carrier, injector, parent scope, parent report, or parent
root Test Plan byte changed during this phase.

### Baseline And Coverage Delta

**Phase:** regression
**Claim Source:** interpreted
**Interpretation:** Research Lab registers no instrumented line-coverage
command, so this phase makes no percentage claim. It compares collected tests
and exact scenario carriers at the unchanged source/test hashes. The test-owned
95-test Feature 008 browser and 3426-check selftest receipts remain current in
the independently hash-validated scoped closure and were not relabeled as this
phase's executions.

| Carrier | Test-owner baseline | Regression observation | Delta |
| --- | ---: | ---: | ---: |
| Focused functional | 34/34 | 34/34 fresh execution | 0 |
| In-memory mutation | 2/2 | 2/2 fresh execution | 0 |
| Scenario browser | 19/19 | 19/19 fresh execution | 0 |
| Eight-file Feature 008 browser | 95/95 | 95/95 current input-bound receipt | 0 |
| Canonical selftest | 3426/3426 | 3426/3426 current input-bound receipt | 0 |

No assertion, test file, scenario link, skip marker, or persistent carrier was
removed in the implementation/test commit window.

### Scoped And Global Receipt Truth

**Phase:** regression
**Executed:** YES
**Commands:** canonical identity projection over the BUG-007 test session,
independent current-file sha256 verification of each latest closure,
`test-leaf-receipt.sh resolve --names-only`, and the canonical global strict
receipt checker.
**Exit Codes:** `0, 0, 0, 1`
**Claim Source:** executed

```text
SCOPED_RECEIPT_SESSION=BUG007-TEST-vscode-d037d272-238
appendCount=23
currentIdentities=16
withClosure=16
valid=16
stale=0
unknown=0
nonzeroExit=0
requiredTags=10
missingRequiredTags=[]
adapter=none
# BUG-007 regression global strict receipt status
exit: 1
lines: 121
sha256: 41d59b4be6b1951dd0b70f0d57d874b3a3c45819aeeb2bcc176e5144f5504921
total=147
current=82
superseded=65
withClosure=40
valid=18
stale=22
unknown=42
```

The scoped closure is adequate for the test owner's BUG-007 claims: canonical
supersession reduces 23 appends to 16 latest identities; every identity belongs
to `bubbles.test` and this bug, has a non-empty current input closure, exits
zero, and collectively carries TP-B007-001 through TP-B007-010. The configured
test-leaf adapter is `none`, so no unavailable adapter receipt is treated as
proof.

The repository-wide strict checker is not clean. Its 22 stale receipts are
earlier Feature 008 and BUG-006 command identities whose source, test, or report
inputs changed; 42 current identities have no closure. Those identities are
outside BUG-007 regression ownership. This phase neither refreshes nor rewrites
them and does not convert global exit `1` into a pass.

### Regression Verdict And Routing

`REGRESSION_FREE` inside the BUG-007 work boundary. No failing current test,
test-count decrease, weakened carrier, built-in mutation, escaped throw,
ordinary-key incompatibility, caller-map ownership regression, ordering change,
cross-spec contradiction, route collision, or source/test byte drift was found.

Route `BUG-007-ROUTE-006` is complete. The required next owner is
`bubbles.simplify` for the registered bugfix-fastlane complexity review. Human
acceptance, DoD, scope/spec terminal status, TP-B007-011, validation, and
certification remain untouched.

## Simplify Phase {#bug007-simplify-phase}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** The exact `d49a2955b` source delta and the functional,
browser, and mutation carriers contain no behavior-preserving simplification
that is clearer than the current direct form. The apparent repetition is the
designed audit surface: every caller-keyed map declaration and every membership
decision states its inheritance boundary locally. Hiding those sites behind a
helper, relying on truthiness, or sharing harness helpers across Node and browser
runtimes would reduce auditability or widen the change boundary. No source or
test file was edited.

### Three-Pass Review

| Pass | Reviewed surface | Verdict |
| --- | --- | --- |
| Reuse | Exact 200-line implementation diff plus all direct null-prototype and own-membership sites | No missed reusable abstraction. A map or membership helper is explicitly rejected by design and would hide the security property. |
| Quality | `distinctCount()`, `composeBrief()`, and the three persistent BUG-007 carrier blocks | Names and control flow match the security contract. Resolved owner, prior-evidence, support, category, horizon, and recency values avoid repeated reads without changing output semantics. |
| Efficiency | Aggregation loops, per-subject projection, bounded hostile matrices, and three in-memory mutants | Runtime remains linear in inputs with constant-time own checks. Test work is bounded and environment-specific; extraction would add coupling without reducing production work. |

No high, medium, or low simplify finding remained after aggregation. In
particular, `resolvedOwner` and `resolvedPriorEvidenceIds` deliberately
normalize own falsey values to `null`; compressing either expression would be
less explicit and would invite forbidden inherited or fallback lookup.

### Focused Functional Verification

**Phase:** simplify
**Executed:** YES
**Command:** `cd ~/research-lab && timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-007 simplify focused functional" -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** `0`
**Claim Source:** executed

```text
# BUG-007 simplify focused functional
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 214
sha256: 6ebdc0c83c0fe3b8821da621cb7d191d69c5bc22647be06585e433d6a522c524
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
  ---
  duration_ms: 330.606699
  type: 'test'
  ...
--- omitted 174 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 33 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
ok 34 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
1..34
# tests 34
# suites 0
# pass 34
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1057.411404
```

The focused carrier directly preserves normal lane and subject order, all six
hostile subject/domain cases, own-versus-inherited caller lookups, no-throw
behavior, and descriptor-level built-in integrity.

### Mutation, Byte, Carrier, And Parent Integrity

**Phase:** simplify
**Executed:** YES
**Commands:**

- `cd ~/research-lab && timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
- pre-run and post-run `sha256sum` plus `git diff --exit-code` over `rlportfoliobrief.js`, all three persistent carriers, and the shared injector
- `cd ~/research-lab && timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs`
- pre-run and post-run Git-object manifest comparison over all protected parent Feature 008 scope files, report files, and root `test-plan.json`

**Exit Codes:** all `0`
**Claim Source:** executed

```text
PASS Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
PASS BUG-007: caller-key protections and normal ordering are load-bearing in memory
tests 2
suites 0
pass 2
fail 0
cancelled 0
skipped 0
todo 0
d8fa7cf2a0fe437039f49cef2f84e97693a776088c086d6f86f21ca1f913e8c0  rlportfoliobrief.js
a8d963a9feec48cb331eebc871f742f2784aa0676ca26d7ad211ef0d35d60b63  tests/portfolio-brief.functional.mjs
d4db00741c5efee7f63acc630d012fc6400dd91fa963e3ab66082355629b3b46  tests/portfolio-survival-brief.spec.mjs
e8f2eb90856588f5ec7cb4598b1d960f771d864c19135e1aa0967b8323594fce  tests/portfolio-test-integrity.unit.mjs
dfa9231cab23bc0c97ccb601ece72d185743649a2de4801236f4c7a6489d0e2f  tests/portfolio-defect-injector.cjs
source_commit_diff_exit=0
carrier_commit_diff_exit=0
working_tree_diff_exit=0
POST_MUTATION_SOURCE_TEST_INTEGRITY=clean
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
PROTECTED_PATH_COUNT=59
PROTECTED_MANIFEST_EXPECTED=f9c9c4a25f14a2e857fc5390696a451f790bbf85869c286fc87049c409e220fb
PROTECTED_MANIFEST_CURRENT=f9c9c4a25f14a2e857fc5390696a451f790bbf85869c286fc87049c409e220fb
PROTECTED_PARENT_BYTES_MATCH=true
```

The mutation carrier still removes one representative null-prototype
allocation, one own-owner check, and the exact lane order in memory. Every
mutant turns its targeted title red while the shipped source and carriers stay
byte-identical. The protected parent Feature 008 transaction also retained its
aggregate manifest exactly.

### Simplify Verdict And Routing

`NO_SIMPLIFICATION_CHANGE_REQUIRED`. Route `BUG-007-ROUTE-007` is complete.
The required next owner is `bubbles.gaps` for the registered bugfix-fastlane
gap review. Human acceptance, every DoD checkbox, structured Test Plan status,
TP-B007-011, global receipt closure, validation, certification, scope/spec
status, and push remain untouched.

## Gaps Phase {#bug007-gaps-phase}

**Phase:** gaps
**Claim Source:** interpreted
**Interpretation:** The current implementation and the three persistent
carriers satisfy every BUG-007 requirement and scenario without a source,
test, planning-artifact, or behavior gap. One report claim had become stale:
the regression phase's 16-of-16 receipt result no longer described the current
tree after simplify appended to `report.md`. This section preserves that result
as historical phase evidence and records the current receipt split without
rewriting any receipt identity.

### Requirement And Source Audit

| Requirement | Current implementation and carrier | Gaps verdict |
| --- | --- | --- |
| `FR-B007-001` | `distinctCount()` plus all nine named `composeBrief()` caller-keyed maps and the nested date set use direct `Object.create(null)`; affected reads use direct own membership. | MATCH |
| `FR-B007-002` | The focused functional subject title covers `__proto__`, `constructor`, and `toString` as own completed-research keys; the browser carrier also records `constructor` through the production controls. | MATCH |
| `FR-B007-003` | The focused domain title covers all three keys with two completions, two distinct dates, a satisfied inference floor, and one inferred row. | MATCH |
| `FR-B007-004` | Functional and browser matrices snapshot descriptors on `Object.prototype`, `Object`, and `Object.prototype.toString`, inspect before cleanup, and restore in `finally`. | MATCH |
| `FR-B007-005` | `owners` and `priorEvidenceIds` resolve only own values; the functional carrier distinguishes explicit own entries from inherited entries for every hostile key. | MATCH |
| `FR-B007-006` | The normal functional title asserts exact lane/subject order and exact local/shared-policy refusal envelopes. | MATCH |
| `FR-B007-007` | Functional, real-browser, and in-memory mutation carriers persist. The mutation carrier makes one safe-map site, one owner-membership site, and exact lane order fail independently without writing tracked source. | MATCH |

The design decisions also remain intact: no key blacklist, input rewrite,
catch-and-continue path, map helper, route, public signature, contract version,
storage schema, policy value, or migration was introduced. The implementation
commit left the already-authored tests and shared injector unchanged.

### Design Decision Audit

| Design decision | Current reality | Verdict |
| --- | --- | --- |
| Allocate every affected internal map with direct `Object.create(null)`. | The helper and all nine `composeBrief()` maps use the direct form; the per-key date set does too. | MATCH |
| Use direct `Object.prototype.hasOwnProperty.call()` for affected membership decisions. | Initialization, projection, exclusion, evidence, owner, and prior-evidence reads use direct own membership. | MATCH |
| Add no safe-map or membership helper. | No helper or abstraction was added in `d49a2955b`. | MATCH |
| Preserve all three inherited-looking key spellings as data. | Source has no blacklist or rewrite; functional and browser matrices exercise all three. | MATCH |
| Preserve ordering, lane aggregation, action signatures, and refusal envelopes. | The normal carrier asserts exact lane/subject order and exact representative local/shared-policy failures. | MATCH |
| Cover six direct-export cases plus the UI-reachable `constructor` path. | The functional and browser matrices cover six cases; the browser test uses preview, confirm, rerender, and visible output for `constructor`. | MATCH |
| Use the existing in-memory injector and never mutate shipped source. | Three one-anchor mutations run through `tests/portfolio-defect-injector.cjs`; before/after carrier hashes and Git diff remain clean in prior and current mutation evidence. | MATCH |

### Source Site Audit

| Site | Caller-derived key or role | Current protection | Verdict |
| --- | --- | --- | --- |
| `distinctCount()::seen` | subject/date set | null-prototype allocation | MATCH |
| `excludedBySubject` | evidence subject | null-prototype allocation plus own membership at no-action projection | MATCH |
| `supportBySubject` | completion subject/domain | null-prototype allocation plus own initialization/read | MATCH |
| `categoriesBySubject` | completion subject/domain | null-prototype allocation plus own array initialization/read | MATCH |
| `horizonBySubject` | completion subject/domain | null-prototype allocation plus own first-write/read | MATCH |
| `newestSupportBySubject` | completion subject/domain | null-prototype allocation plus own absence/read | MATCH |
| `supportDatesBySubject` | completion subject/domain | null-prototype outer allocation plus own set lookup | MATCH |
| nested support-date set | ISO completion date | null-prototype per-key set | MATCH |
| `qualifiesVia` | holding/watchlist/completion/domain subject | null-prototype allocation plus own qualification creation | MATCH |
| `inferredDomains` | completion domain | null-prototype allocation; `Object.keys()` enumerates own domains | MATCH |
| `byId` | evidence subject | null-prototype allocation plus own aggregate creation/read | MATCH |
| `owners` | qualified subject | caller object preserved; one own truthy value resolved or `null` | MATCH |
| `priorEvidenceIds` | qualified subject | caller object preserved; one own truthy value resolved before `.slice()` or `null` | MATCH |

### Persistent Carrier Audit

| Carrier | Required role | Current finding |
| --- | --- | --- |
| `tests/portfolio-brief.functional.mjs` | Normal/refusal control, six hostile calls, own/inherited lookups, descriptor integrity, unconditional cleanup | Current execution passes 34 of 34; all five BUG-007 titles remain present and direct. |
| `tests/portfolio-survival-brief.spec.mjs` | Browser-global six-case parity plus real visible `constructor` workflow and uncaught-error trap | The 19-test input-bound receipt remains current; source inspection confirms direct production controls and visible-state assertions. |
| `tests/portfolio-test-integrity.unit.mjs` | Load-bearing safe-map, own-owner, and lane-order mutations | Current execution passes 2 of 2; each exact substitution must apply once and make its protective title fail. |
| `tests/portfolio-defect-injector.cjs` | Read-only in-memory mutation adapter | Unchanged across the implementation window and not edited by gaps. |
| Feature 008 browser matrix and `scripts/selftest.mjs` | Broader consumer and repository regression | Input-bound receipts remain current at 95 of 95 and 3426 of 3426 respectively; gaps did not duplicate those heavy runs after no source/test change. |

### Report Claim Audit

| Report claim class | Current disposition |
| --- | --- |
| Before-fix normal plus six-case reproduction and cleanup | Retained as historical executed diagnostic evidence; not rerun against fixed source. |
| Root-cause and complete map inventory | Source inspection agrees with the recorded interpretation. |
| `TP-B007-000` persistent RED | Retained as historical test evidence; carrier titles exist before implementation. |
| `TP-B007-001` through `TP-B007-004` focused GREEN | Re-executed in gaps at 34 of 34. |
| `TP-B007-005` mutation adequacy | Re-executed in gaps at 2 of 2. |
| `TP-B007-006` scenario browser | Current behavior-input receipt remains valid; gaps did not relabel it as a new execution. |
| `TP-B007-007` broader Feature 008 browser | Current behavior-input receipt remains valid; gaps did not relabel it as a new execution. |
| `TP-B007-008` canonical selftest | Current behavior-input receipt remains valid; gaps did not relabel it as a new execution. |
| `TP-B007-009` packet guards | Re-executed in gaps at exit 0; prior test-owned identity remains stale after report edits. |
| `TP-B007-010` implementation reality | Re-executed in gaps at exit 0 with 1 file, 0 violations, 0 warnings; prior test-owned identity remains stale after report edits. |
| Scenario and regression carrier integrity | Re-executed in gaps: 9 links resolved; 3 carriers accepted; 0 violations; 0 warnings. |
| Implementation focused GREEN and exact source delta | Source/current carrier inspection plus current focused execution agree; no implementation claim was widened. |
| Independent regression verdict | Behavior findings remain supported; its 16-of-16 receipt statement is preserved as historical and corrected for current packet hashes. |
| Simplify no-change verdict | Current direct security form remains unchanged; gaps found no contradictory complexity or behavior issue. |
| Validation, audit, chaos, acceptance, and `TP-B007-011` | Still explicitly not run or not completed; no pass or terminal claim added. |
| Current receipt closure | Corrected to 9 valid and 7 stale BUG-007 identities, with global strict 29 stale and 42 unknown. |

### Transition Route Audit

| Route | Handoff | Current disposition |
| --- | --- | --- |
| `BUG-007-ROUTE-001` | bug to design | Completed; design reconciles the reproduced defect and full map boundary. |
| `BUG-007-ROUTE-002` | design to plan | Completed; one-scope scenario/Test Plan packet exists. |
| `BUG-007-ROUTE-003` | plan to test | Completed; persistent scenario-first carriers were authored. |
| `BUG-007-ROUTE-004` | test RED to implement | Completed; bounded source repair is `d49a2955b`. |
| `BUG-007-ROUTE-005` | implement to test GREEN | Completed; focused, browser, broader, selftest, and guard evidence was produced. |
| `BUG-007-ROUTE-006` | test to regression | Completed; independent regression found no delivery regression. |
| `BUG-007-ROUTE-007` | regression to simplify | Completed; simplify made no source/test change. |
| `BUG-007-ROUTE-008` | simplify to gaps | Completed by this phase; no delivery gap remains. |
| `BUG-007-ROUTE-009` | gaps to harden | Pending and exact; harden is the next registered bugfix-fastlane owner. |

### Scenario And Test Plan Audit

| Scenario or row | Current proof | Ownership disposition |
| --- | --- | --- |
| `SCN-B007-NORMAL-COMPATIBILITY` | Current focused functional execution passes its exact title; the browser and broader E2E receipts retain current source/test input hashes. | No gap |
| `SCN-B007-SUBJECT-KEY-SAFETY` | Current focused functional and mutation executions pass; the scenario browser receipt retains current behavior inputs. | No gap |
| `SCN-B007-DOMAIN-KEY-SAFETY` | Current focused functional and mutation executions pass; the scenario browser receipt retains current behavior inputs. | No gap |
| `TP-B007-000` | Historical scenario-first RED remains recorded before `d49a2955b`; both protective titles exist in `d49a2955b^`, and the implementation commit changes no persistent carrier. | Historical test-owned evidence; do not rerun against fixed source |
| `TP-B007-001` through `TP-B007-004` | Current exact focused command: 34 tests, 34 pass, 0 fail, 0 skipped, 0 todo. | No gap |
| `TP-B007-005` | Current mutation command: 2 tests, 2 pass, 0 fail, 0 skipped, 0 todo. | No gap |
| `TP-B007-006` | Input-bound current test receipt covers the 19-test real-browser carrier and named visible `constructor` workflow. | No gap; browser was not rerun in this no-source-change phase |
| `TP-B007-007` | Input-bound current test receipt covers the 95-test eight-file Feature 008 browser matrix. | No gap; no duplicate heavy run created |
| `TP-B007-008` | Input-bound current test receipt covers the 3426-check canonical selftest. | No gap; no duplicate heavy run created |
| `TP-B007-009` | All six packet guards were executed in this gaps phase and passed. | No delivery gap; prior test-owned receipt identity remains truthfully stale after report changes |
| `TP-B007-010` | Implementation reality was executed in this gaps phase: 1 file, 0 violations, 0 warnings. | No delivery gap; prior test-owned receipt identity remains truthfully stale after report changes |
| `TP-B007-011` | Not run. The packet reserves it for validate only after all prerequisites. | `bubbles.validate`; unchanged |

### Definition Of Done Audit

| DoD item | Audit result | Owner or reason it remains unchecked |
| --- | --- | --- |
| Root cause and complete map inventory | Evidence and source agree. | DoD remains planner-owned and unchecked by instruction. |
| Change boundary and consumer sweep | Delivery and commits remain inside the declared source/test/packet boundary. | DoD remains unchecked. |
| `TP-B007-000` pre-fix RED and cleanup | Historical RED and pre-implementation carrier order are present. | Test-owned historical evidence; DoD remains unchecked. |
| `SCN-B007-NORMAL-COMPATIBILITY` | Current focused test passes. | DoD remains unchecked. |
| `SCN-B007-SUBJECT-KEY-SAFETY` | Current focused test passes. | DoD remains unchecked. |
| `SCN-B007-DOMAIN-KEY-SAFETY` | Current focused test passes. | DoD remains unchecked. |
| `TP-B007-004` lookup, built-in, cleanup | Current focused test passes. | DoD remains unchecked. |
| `TP-B007-005` mutation adequacy | Current mutation test passes. | DoD remains unchecked. |
| `TP-B007-006` scenario browser | Current input-bound receipt remains valid. | DoD remains unchecked. |
| `TP-B007-007` broader E2E | Current input-bound receipt remains valid. | DoD remains unchecked. |
| `TP-B007-008` selftest | Current input-bound receipt remains valid. | DoD remains unchecked. |
| `TP-B007-009` packet guards | Fresh gaps execution passes; old test identity is stale only because the report changed. | DoD remains unchecked. |
| `TP-B007-010` implementation reality | Fresh gaps execution passes; old test identity is stale only because the report changed. | DoD remains unchecked. |
| Human acceptance | Explicitly required by this packet and has not occurred. | Human owner only; blanket authorization is not witnessed acceptance. |
| `TP-B007-011` transition guard | Intentionally not run before acceptance, quality phases, and validation. | `bubbles.validate`; DoD remains unchecked. |
| Build Quality Gate | Later phase sequence is incomplete despite the clean delivery audit. | `bubbles.harden` and subsequent registered owners. |

### Current Gaps Execution

**Executed:** YES
**Commands:** focused functional, in-memory mutation, six packet guards,
implementation reality, regression-quality bugfix scan, scenario-test
resolution, source syntax, and changed-surface whitespace checks.
**Exit Codes:** all `0`
**Claim Source:** executed

```text
# BUG-007 gaps focused functional
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 214
sha256: 12a0a182a259c56bf7bc9fb97ff847f2660cf7708c135b938ec1956255e6d8b0
--- first 20 ---
TAP version 13
# Subtest: only an eligible completion becomes behavior evidence and no excluded source can create or grow one
ok 1 - only an eligible completion becomes behavior evidence and no excluded source can create or grow one
  ---
  duration_ms: 196.623302
  type: 'test'
  ...
# Subtest: route recomposition is invariant to behavior evidence and states that behavior contributes none
ok 2 - route recomposition is invariant to behavior evidence and states that behavior contributes none
  ---
  duration_ms: 34.1446
  type: 'test'
  ...
# Subtest: behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
ok 3 - behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline
  ---
  duration_ms: 84.712301
  type: 'test'
  ...
# Subtest: dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference
--- omitted 174 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 33 - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
  ---
  duration_ms: 1.4269
  type: 'test'
  ...
# Subtest: Regression: BUG-004 same-semantic occurrences cannot inflate relevance
ok 34 - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
  ---
  duration_ms: 90.862001
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
# duration_ms 636.11251

# BUG-007 mutation integrity
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing (7657.857786ms)
✔ BUG-007: caller-key protections and normal ordering are load-bearing in memory (969.603832ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8696.645075

# BUG-007 gaps post-edit packet guards
$ timeout 600 bash -c 'bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root . && bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys && bash .github/bubbles/scripts/capability-foundation-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys'
exit: 0
lines: 103
sha256: 0a8c57bf72bed3a2f6b5488535e9de2ea161c99e81a2a23b663967badcb8aa3a
--- first 20 ---
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
--- omitted 63 line(s); sha256 above covers the full output ---
--- last 20 ---

--- Traceability Summary ---
ℹ️  Scenarios checked: 3
ℹ️  Test rows checked: 13
ℹ️  Scenario-to-row mappings: 3
ℹ️  Concrete test file references: 3
ℹ️  Report evidence references: 3
ℹ️  DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=3 inferred=0 ambiguous=3

RESULT: PASSED (0 warnings)
[scenario-obligation-lint] OK — 3 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK — 3 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained (no chat/session-replay dependency); a fresh specialist can execute from the durable artifacts.
capability-foundation-guard: Gate G094 applies: triggerHits=3 concreteImplementationEntries=0
capability-foundation-guard: spec.md contains non-empty Single-Capability Justification
capability-foundation-guard: design.md contains non-empty Single-Implementation Justification
capability-foundation-guard: UX primitive check not applicable: screenCount=0 uiReuseHits=0
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied

# BUG-007 gaps post-edit implementation reality
$ bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose
exit: 0
lines: 36
sha256: bd7c897cb79aa711b318f7673be2d486ba00229409e2bd05c83ff518f6ddd508

ℹ️  INFO: Resolved 1 implementation file(s) to scan

--- Scan 1: Gateway/Backend Stub Patterns ---

--- Scan 1B: Handler / Endpoint Execution Depth ---

--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---

--- Scan 1D: External Integration Authenticity ---

--- Scan 2: Frontend Hardcoded Data Patterns ---

--- Scan 2B: Sensitive Client Storage ---

--- Scan 3: Frontend API Call Absence ---

--- Scan 4: Prohibited Simulation Helpers in Production ---

--- Scan 5: Default/Fallback Value Patterns ---

--- Scan 6: Live-System Test Interception ---
ℹ️  INFO: No live-system test files referenced in scope artifacts for interception scan

--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---

--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================

  Files scanned:  1
  Violations:     0
  Warnings:       0

🟢 PASSED: No source code reality violations detected

# BUG-007 regression quality
BUBBLES REGRESSION QUALITY GUARD
Repo: ~/research-lab
Bugfix mode: true
Scanning tests/portfolio-brief.functional.mjs
Adversarial signal detected in tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-survival-brief.spec.mjs
Asserts the current surface in tests/portfolio-survival-brief.spec.mjs (mixed inspection accepted)
Adversarial signal detected in tests/portfolio-survival-brief.spec.mjs
Scanning tests/portfolio-test-integrity.unit.mjs
Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3

[scenario-test-resolve] OK — 9 reference(s) resolved via literal-scan; 9 category comparison(s) not applicable (no test-discovery adapter declared)
NODE_CHECK_EXIT=0
DELIVERY_DIFF_CHECK_EXIT=0
exit
```

The bounded-capture hashes cover every omitted output line. The home path
printed by regression quality is normalized to `~/research-lab` under the
repository PII policy; no command verdict is changed.

### Scoped And Global Receipt Audit

**Phase:** gaps
**Executed:** YES
**Commands:** canonical global `evidence-receipt-check.sh --strict`, the same
checker without strict failure for full JSON, test-leaf adapter resolution, and
a read-only projection of the append-only BUG-007 test session using the
checker's exact identity fields.
**Exit Codes:** `1, 0, 0, 0`
**Claim Source:** interpreted
**Interpretation:** Global strict failure is real and must stay visible. The
BUG-007 session has 16 current closure-bearing identities and no unknown
identity. Seven are stale because their closure includes `report.md`, which
later phases changed. The other nine, including functional, mutation, scenario
browser, broader browser, selftest, regression-quality, scenario resolution,
and adapter-resolution receipts, remain valid. Fresh gaps executions directly
recheck the seven affected guard behaviors but do not impersonate or supersede
their test-owned identities.

```text
global total=147
global current=82
global superseded=65
global withClosure=40
global valid=11
global stale=29
global unknown=42
BUG-007 appendCount=23
BUG-007 currentIdentities=16
BUG-007 withClosure=16
BUG-007 unknown=0
BUG-007 valid=9
BUG-007 stale=7
stale BUG-007 identities=artifact-lint,traceability,scenario-obligation,test-mechanism,scope-context,capability-foundation,implementation-reality
stale BUG-007 reason=input hash differs: report.md
original unrelated stale identities=22
receipt identities changed by gaps=0
```

An attempted direct scoped invocation using a process-substitution stream was
also recorded and exited `2` because the checker requires `--log` to name a
regular file. No filtered receipt file was created, and that failed invocation
is not used as proof.

### Remaining Ownership Matrix

| Owner | Remaining responsibility | Gaps disposition |
| --- | --- | --- |
| `bubbles.harden` | Run the registered hardening profile against the existing packet, test taxonomy, semantic scenario coverage, regression quality, and structured-plan parity. | Next owner; do not invent a fix when no hardening finding exists. |
| `bubbles.stabilize` | Independently assess stability domains and back any finding with execution evidence. | Later mode phase. |
| `bubbles.devops` | Determine and evidence the build-free/static-site operational applicability; do not manufacture deployment work. | Later mode phase. |
| `bubbles.security` | Independently review the prototype-safety boundary and scanner applicability. | Later mode phase. |
| Human owner | Complete the explicit acceptance record only after direct witnessed acceptance. | Required by this bug packet; blanket authorization is not acceptance. |
| `bubbles.validate` | After prerequisites, execute `TP-B007-011` and own all certification writes. | Not run and untouched here. |
| `bubbles.audit` | Independently audit evidence provenance, receipt interpretation, and transition fidelity. | Later mode phase. |
| `bubbles.finalize` | Finalize only after the registered phase chain, human acceptance, transition guard, and certification permit it. | Later mode phase; no terminal state here. |

### Gaps Verdict And Routing

`NO_DELIVERY_GAP_FOUND`. The only gaps-owned repair was the time-sensitive
receipt wording in this report. Route `BUG-007-ROUTE-008` is complete. The next
registered owner is `bubbles.harden`. No source, persistent test, planning
artifact, acceptance item, DoD item, structured Test Plan status, receipt
identity, TP-B007-011 result, certification field, scope/spec status, terminal
state, or parent Feature 008 artifact changed.

## Code Diff Evidence

The implementation commit changes only `rlportfoliobrief.js` plus this BUG-007
report and execution state. This test phase changes only BUG-007 report and
execution-owned state. The shared injector, persistent carriers, parent Feature
008 planning transaction, DoD checkboxes, structured planning statuses, human
validation, and certification fields remain unchanged. Source/test integrity
was clean before and after the in-memory mutation carrier.

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
currentOwner: bubbles.gaps
nextRequiredOwner: bubbles.harden
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - SEC-B006-S1-IMPLEMENTATION
  - SEC-B006-S1-TEST
  - SEC-B006-S1-REGRESSION
  - SEC-B006-S1-SIMPLIFY
  - SEC-B006-S1-GAPS
unresolvedFindings: []
evidence:
  - report.md#bug007-gaps-phase
  - report.md#bug007-simplify-phase
reason: The exhaustive gaps audit found no source, persistent-test, scenario, Test Plan, DoD-shape, or implementation-reality delivery gap. It corrected only the report's time-sensitive receipt wording and preserved the real 29-stale/42-unknown global strict truth without relabeling any identity. Harden is next while acceptance, DoD, TP-B007-011, certification, terminal status, and the parent Feature 008 transaction remain unchanged.
```

## BUG-007 Hardening Phase {#bug007-harden-phase}

**Phase:** harden
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** The delivered product behavior passes every focused,
browser, broader-regression, selftest, source, packet, and integrity check run
in this phase. The target is nevertheless not hardened because a direct mutant
causality probe shows that the registered mutation carrier accepts an injector
self-error as proof that the persistent regression detected the represented
defect. This is a blocking test-integrity finding, not a product-source failure.

### Authority And Mode Resolution

Repository authority was refreshed from the VS Code session log and committed
to `research-lab` at control revision 249 before the hardening Bubbles guards.
The persisted `bugfix-fastlane` mode resolved with status ceiling `done` and
this phase order:

```text
select, bootstrap, implement, test, regression, simplify, gaps, harden,
stabilize, devops, security, validate, audit, finalize
```

The ordinary successor to a successful harden phase is `bubbles.stabilize`.
That successor is not reached here because the blocking finding requires a
planner-owned scope-boundary and persistent-test correction first.

### Hardening Baseline And Outcomes

| Check | Exact outcome | Hardening disposition |
| --- | --- | --- |
| Focused functional carrier | exit 0; 34/34 pass; 0 fail; 0 skipped; 0 todo | Product behavior passes |
| Registered in-memory mutation carrier | exit 0; 2/2 pass; 0 fail; 0 skipped; 0 todo | Rejected as mutation-causality proof by `HARDEN-B007-001` |
| Real-browser BUG-007 scenario file | Playwright 1.61.1; exit 0; 19/19 pass | Six hostile exported cases and visible `constructor` workflow pass |
| Exact Feature 008 browser matrix | exit 0; 95/95 pass | Broader browser regression passes |
| Canonical selftest | exit 0; 3426 pass; 0 fail | Repository regression passes |
| Artifact lint | exit 0; 40 output lines | Packet shape passes at in-progress status |
| Traceability | exit 0; 3 scenarios; 13 rows checked; 0 warnings | Scenario links and DoD fidelity pass |
| Implementation reality | exit 0; 1 file; 0 violations; 0 warnings | Product source scan passes |
| Regression quality `--bugfix` | exit 0; 3 files; 3 adversarial signals; 0 violations; 0 warnings | Static carrier-quality scan passes but does not detect the causal defect |
| Source syntax | exit 0 | `rlportfoliobrief.js` parses |
| Scenario/Test Plan/DoD parity | 3 scenarios; 12 Markdown rows; 12 JSON rows; 12 DoD test refs; 9 linked tests | Exact parity passes |
| Silent-pass/interception scan | 0 skip markers; 0 live interceptions; 0 bailout patterns | Passes |
| Caller-key structural attack | 11 null-prototype allocations and 2 own checks present once; nested-date and prior-lookup reductions rejected | Shipped source boundary passes |
| Source/test byte integrity | all 5 hashes unchanged; Git diff exit 0 | No tracked source/test mutation |
| Protected parent Feature 008 transaction | 49 paths; aggregate `19ad2e42e0ec72165baee5e35fbb3a2a2c2345e884462a9c2973cc5f4350b358` before and after | Preserved byte-for-byte |
| Scoped receipt identity | 23 appends; 16 current; 9 valid; 7 stale; 0 unknown; 0 nonzero | Preserved without refresh or relabel |
| Global strict receipt identity | exit 1; 147 total; 82 current; 11 valid; 29 stale; 42 unknown | Truthfully red; unrelated identities untouched |

### Focused Functional And Mutation Executions

**Phase:** harden
**Commands:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`;
`timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
# BUG-007 harden focused functional
exit: 0
lines: 214
sha256: de235ed9c0f5f2c560b6fa35f007e2d6f3b669ff6448b8a8ac06d95141d6382e
1..34
# tests 34
# suites 0
# pass 34
# fail 0
# cancelled 0
# skipped 0
# todo 0

# BUG-007 harden in-memory mutation carrier
exit: 0
lines: 22
sha256: 0e9375b84a2c0f4a9c10eff03b5fac215fa8880f7d9fbca96c7ae337425c14ba
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
1..2
# tests 2
# pass 2
# fail 0
# skipped 0
# todo 0
```

The focused carrier directly exercises normal lane and subject order, local
before shared-policy refusal precedence, all six hostile subject/domain cases,
the nested date-support path, own and inherited `owners` and
`priorEvidenceIds`, shared built-in snapshots, and unconditional cleanup. Its
34/34 result is accepted. The mutation carrier's 2/2 result is recorded but is
not accepted as causal proof because of the finding below.

### Real-Browser And Broader Regression

**Phase:** harden
**Commands:** exact BUG-007 browser file and exact eight-file Feature 008
browser matrix from `test-plan.json`
**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
# BUG-007 harden real-browser scenario file
exit: 0
lines: 67
sha256: 49b0996408b77454b9781cccfba47f50aec636f8b90d2c58dd0490435d98b965
Running 19 tests using 1 worker
PASS BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
PASS Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
19 passed (27.8s)

# BUG-007 harden exact Feature 008 browser matrix
exit: 0
lines: 304
sha256: 053a2b8bb951445084c00afaab3c0e5888edd30c676bb13c2d4b399cbad4432d
Running 95 tests using 2 workers
PASS BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
PASS Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
95 passed (2.0m)
```

The first browser run proves the real UMD export and the production preview,
confirm, persistence, rerender, and visible `constructor` workflow. The exact
broader matrix preserves all eight registered Feature 008 browser carriers.
Neither run uses request interception.

### Canonical Selftest And Packet Guards

**Phase:** harden
**Commands:** canonical selftest, artifact lint, traceability guard,
implementation-reality scan, and bugfix regression-quality guard
**Exit Codes:** all `0`
**Claim Source:** executed

```text
# BUG-007 harden canonical selftest
exit: 0
lines: 3912
sha256: fe8012dee8f8311546c741bb80246ccc98771e6d59caec0f717db1e346faa1b3
Research-Lab self-test: 3426 passed, 0 failed

# BUG-007 harden artifact lint
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.

# BUG-007 harden traceability
exit: 0
lines: 54
sha256: 399ea55e0a876f103edb90cd687ee8c9d5c0214240957b5d0e18ce1f45bcc6cb
Scenarios checked: 3
Test rows checked: 13
DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
RESULT: PASSED (0 warnings)

# BUG-007 harden implementation reality
exit: 0
lines: 36
sha256: bd7c897cb79aa711b318f7673be2d486ba00229409e2bd05c83ff518f6ddd508
Files scanned: 1
Violations: 0
Warnings: 0
PASSED: No source code reality violations detected

# BUG-007 bugfix regression quality
Files scanned: 3
Files with adversarial signals: 3
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
```

The regression-quality path printed the local repository root. This report
normalizes that home path to `~/research-lab`; no command result or identity is
changed.

### Static, Parity, And Integrity Checks

**Phase:** harden
**Commands:** source syntax, fail-closed scenario/Test Plan/DoD parity, explicit
skip/interception/bailout scan, caller-key structural mutations, SHA-256 and
Git diff checks, and protected-parent aggregate comparison
**Exit Codes:** all `0`
**Claim Source:** executed

```text
SOURCE_SYNTAX_EXIT=0
SCENARIOS markdown=3 manifest=3
TEST_PLAN markdown=12 json=12
DOD_TEST_REFS=12 parityRows=12
LINKED_TEST_REFS=9 resolved=9
PERSISTENT_TEST_FILES=3
CATEGORIES=artifact,e2e-ui,functional,guard,unit
CROSS_SCOPE_DUPLICATION=not-applicable-one-scope
SCENARIO_TEST_PLAN_DOD_PARITY=PASS
SKIP_MARKER_MATCHES=0
LIVE_INTERCEPTION_MATCHES=0
REQUIRED_BAILOUT_MATCHES=0
SILENT_PASS_OR_INTERCEPTION_SCAN=PASS
NESTED_DATE_SET_REMOVAL_REJECTED=true
PRIOR_INHERITED_LOOKUP_REJECTED=true
CALLER_KEY_STRUCTURAL_ATTACK=PASS
SOURCE_TEST_POST_ATTACK_EXIT=0
PROTECTED_PARENT_COUNT=49
PROTECTED_PARENT_AGGREGATE_SHA256=19ad2e42e0ec72165baee5e35fbb3a2a2c2345e884462a9c2973cc5f4350b358
PROTECTED_PARENT_BYTE_IDENTITY=PASS
```

The five source/test SHA-256 values were identical before and after all hostile
and mutation executions:

```text
d8fa7cf2a0fe437039f49cef2f84e97693a776088c086d6f86f21ca1f913e8c0  rlportfoliobrief.js
a8d963a9feec48cb331eebc871f742f2784aa0676ca26d7ad211ef0d35d60b63  tests/portfolio-brief.functional.mjs
e8f2eb90856588f5ec7cb4598b1d960f771d864c19135e1aa0967b8323594fce  tests/portfolio-test-integrity.unit.mjs
d4db00741c5efee7f63acc630d012fc6400dd91fa963e3ab66082355629b3b46  tests/portfolio-survival-brief.spec.mjs
dfa9231cab23bc0c97ccb601ece72d185743649a2de4801236f4c7a6489d0e2f  tests/portfolio-defect-injector.cjs
```

### Current Receipt Identity Accounting

**Phase:** harden
**Commands:** canonical global strict checker and read-only BUG-007 projection
using the checker's exact seven identity fields
**Exit Codes:** `1, 0`
**Claim Source:** interpreted
**Interpretation:** The global strict failure is real and unrelated receipt
identities remain untouched. The BUG-007 test session still has nine valid
behavior/source-bound identities and seven report-bound guard identities that
remain stale after later report edits. No receipt was appended, refreshed,
superseded, or relabeled in harden.

```text
# global strict
exit: 1
lines: 156
sha256: 815411c8399274c320f1d8aeff97b81e5fcf1be3c69e07583885c89be555bb83
global total=147
global current=82
global superseded=65
global withClosure=40
global valid=11
global stale=29
global unknown=42

# exact scoped projection
SCOPED_RECEIPT_SESSION=BUG007-TEST-vscode-d037d272-238
appendCount=23
currentIdentities=16
withClosure=16
valid=9
stale=7
unknown=0
nonzeroExit=0
requiredTags=10
missingRequiredTags=[]
staleIdentities=artifact-lint,traceability,scenario-obligation,test-mechanism,scope-context,capability-foundation,implementation-reality
SCOPED_RECEIPT_IDENTITY_ACCOUNTING=PASS
```

### Blocking Finding: Mutation Failure Causality {#harden-b007-001}

**Finding ID:** `HARDEN-B007-001`
**Severity:** high
**Owner:** `bubbles.plan`, then `bubbles.test`
**Claim Source:** executed

The registered in-memory carrier reports 2/2 green, but a direct execution of
its own `BUG-007-NULL-PROTOTYPE-MAP` mutation shows why the mutant is red. The
injector first applies through its `fs.readFileSync` hook. The `_compile` hook
then receives the already-mutated source, finds zero copies of the original
anchor, and throws. The harness accepts any nonzero mutant exit with at least
one failed test and exactly one marker line. It does not reject an injector
self-error, so the mutation can pass without reaching the protective assertion.

```text
TAP version 13
# Subtest: BUG-007: prototype-sensitive completion subjects are safe own keys
not ok 1 - BUG-007: prototype-sensitive completion subjects are safe own keys
  ---
  failureType: 'testCodeFailure'
  error: 'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) - a defect that cannot be represented is not a proof'
  code: 'ERR_TEST_FAILURE'
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
REGISTERED_MUTANT_EXIT=1
REGISTERED_MUTANT_APPLICATIONS=1
REGISTERED_MUTANT_INJECTOR_ERROR=true
```

An earlier extra prior-evidence mutant produced the same injector error. It is
explicitly rejected and is not used as evidence that the prior-evidence
assertion is load-bearing. The shipped GREEN lookup behavior and exact source
guard both pass; only mutation causality remains unproven.

The required repair is planner-owned because this scope explicitly excludes a
tracked edit to `tests/portfolio-defect-injector.cjs`. The plan must admit a
test-owned fix that distinguishes an already-mutated source passed between the
two hooks from a genuinely missing anchor, and the carrier must reject any
actual-case output containing an injector error. A persistent adversarial case
must prove that one application followed by an injector self-error cannot
satisfy mutation adequacy. After that repair, `bubbles.test` must rerun the
focused, mutation, browser, broader, selftest, packet, integrity, and receipt
closure before harden repeats.

### Harden Profile Verdict

| Profile check | Result |
| --- | --- |
| H1 Findings classified with evidence | PASS |
| H2 Fixes verified | FAIL - `HARDEN-B007-001` is unresolved and foreign-owned |
| H3 Required artifact updates made | PASS - report and execution routing only |
| H4 Test taxonomy completeness | PASS |
| H5 Gherkin-to-test semantic fidelity | PASS for GREEN behavior; mutation causality remains the H2 finding |
| H6 Repo-realistic test paths | PASS |
| H7 Regression coverage quality | FAIL for mutation-causality proof |
| H8 Cross-scope test deduplication | PASS, one-scope packet |
| H9 `test-plan.json` sync | PASS |

**Final verdict:** `NOT_HARDENED`.

Route `BUG-007-ROUTE-009` is complete because the requested hardening profile
executed. `harden` is deliberately not added to `completedPhaseClaims`: Tier 2
H2 and H7 fail, and claiming completion would fabricate the result the direct
mutant disproves. Human acceptance, every DoD checkbox, TP-B007-011,
`certification.*`, scope status, and top-level status remain unchanged.

## RESULT-ENVELOPE

```yaml
outcome: route_required
currentOwner: bubbles.harden
nextRequiredOwner: bubbles.plan
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings: []
unresolvedFindings:
  - HARDEN-B007-001: The shared in-memory injector double-applies across fs.readFileSync and _compile, and the mutation carrier counts the resulting injector self-error as load-bearing discrimination.
evidence:
  - report.md#harden-b007-001
  - report.md#bug007-harden-phase
reason: The product behavior, browser matrix, repository selftest, packet guards, source integrity, parity, and receipt accounting are clean, but mutation failure causality is not. Planning must admit the shared-injector repair before test and harden rerun; stabilize is the normal next mode phase only after harden legitimately completes.
```

## Error-Contract Completion {#bug007-error-contract-completion}

**Phase:** implement

This section closes the in-flight `PortfolioError/v1` conformance work that the
prior session left partially applied. It records the operator-directed
completion of two defects that the partial state had exposed rather than
introduced.

### Registry Completeness {#bug007-registry-completeness}

**Phase:** implement
**Command:** set-difference of every `"P008-*"` literal emitted across
`rlportfolio.js`, `rlportfoliobrief.js`, and `rlportfolioanalytics.js` against
the `ERROR_CODES` map in `rlportfolio.js`
**Exit Codes:** `0` (before), `0` (after)
**Claim Source:** executed

Before, the emitted set exceeded the registered set by nine codes. Because
`validatePortfolioError` gates on `ERROR_CODES[value.code]`, every one of those
nine was rejected as `P008-SCHEMA-CORRUPT` at the very boundary that was
supposed to carry it, so the refusal reaching a caller named the wrong cause.

```text
$ node -e '<emitted-vs-registered set difference>'
registered: 43 | emitted: 52
MISSING FROM REGISTRY (9):
  P008-BRIEF-COMPOSED
  P008-BRIEF-CUTOFF
  P008-BRIEF-POLICY
  P008-BRIEF-PUBLISHED
  P008-BRIEF-WINDOW-ID
  P008-BRIEF-WINDOWS
  P008-REBASE-PARTIAL
  P008-TRUTH-INPUT
  P008-WORKSPACE-COMPUTE
BASELINE_EXIT=0
```

All nine were registered beside their own families: the six `P008-BRIEF-*`
codes with the existing brief block, `P008-WORKSPACE-COMPUTE` with the
`P008-COMPUTE-*` block, and `P008-REBASE-PARTIAL` / `P008-TRUTH-INPUT` beside
the partial-operation codes. The same difference is now empty.

```text
$ node -e '<emitted-vs-registered set difference>'
registered: 52 | emitted: 52
MISSING FROM REGISTRY (0):
  (none)
REGISTRY_GAP_EXIT=0
```

### Expectation Correction {#bug007-expectation-correction}

**Phase:** implement
**Files:** `tests/portfolio-brief.functional.mjs:414`,
`tests/portfolio-brief.functional.mjs:911`
**Claim Source:** executed

Two assertions pinned a three-field error literal (`code`, `reason`, `field`).
That literal was never a conforming `PortfolioError/v1`, which retains all seven
keys; it recorded the pre-fix brief-local `err()` shape. Once `err()` began
delegating to `contractErr()`, both assertions turned red against the correct
value.

Both were corrected to the full conforming shape. The exact `code`, `reason`,
and `field` assertions are retained verbatim and neither assertion was relaxed
to a partial or loose match, so the discrimination the tests carried is
unchanged and the added keys are what the contract already required:

```text
error: {
  contractVersion: 'PortfolioError/v1',
  code: 'P008-BRIEF-COMPOSED',
  reason: 'local-composition-time-required',
  field: 'composedAt',
  row: null,
  valueEchoed: false,
  recoverable: false
}
```

The RED evidence that these two were the only failures, and that each failed
solely on the four missing keys rather than on `code`, `reason`, or `field`:

```text
$ node --test tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
✖ BUG-007: normal brief order and refusal precedence remain unchanged
✖ BUG-006: composeBrief validates shared evidence-age policy before Date formatting
ℹ tests 48
ℹ pass 46
ℹ fail 2

  + actual - expected
    {
      error: {
        code: 'P008-BRIEF-COMPOSED',
  +     contractVersion: 'PortfolioError/v1',
        field: 'composedAt',
        reason: 'local-composition-time-required',
  +     recoverable: false,
  +     row: null,
  +     valueEchoed: false
      },
      ok: false
    }
TEST_EXIT=1
```

### Verification {#bug007-contract-completion-verification}

**Phase:** implement
**Commands:** `node --test tests/portfolio-brief.functional.mjs
tests/portfolio-behavior-occurrence.unit.mjs
tests/portfolio-stale-domain-signal.unit.mjs`; `node scripts/selftest.mjs`
**Exit Codes:** `0, 0`
**Claim Source:** executed

```text
# BUG-007 contract-completion focused tests
$ node --test tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs
exit: 0
lines: 298
sha256: 90437fe6d980153a50b35e9543408b4b9d38f8f8d63af36a2fa6f286df439b19
--- last 20 ---
ok 47 - BUG-005: reinstating the superseded pre-filter bucket creation turns the stale-domain assertion red
  ---
  duration_ms: 93.089634
  type: 'test'
  ...
# Subtest: BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
ok 48 - BUG-005: rlportfolio and rlportfoliobrief agree that a stale domain carries zero live relevance
  ---
  duration_ms: 47.186551
  type: 'test'
  ...
1..48
# tests 48
# suites 0
# pass 48
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 659.718878
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 90437fe6d980153a50b35e9543408b4b9d38f8f8d63af36a2fa6f286df439b19 -- node --test tests/portfolio-brief.functional.mjs tests/portfolio-behavior-occurrence.unit.mjs tests/portfolio-stale-domain-signal.unit.mjs -->

```text
# BUG-007 contract-completion canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: 6d99ac6604bbd58484e9cbf07edfa44c25f2eb370e0e5bba6e3072c562048a22
--- last 20 ---
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (85 claim(s) across 64 packet(s), 71 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 85 claim(s))

================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 6d99ac6604bbd58484e9cbf07edfa44c25f2eb370e0e5bba6e3072c562048a22 -- node scripts/selftest.mjs -->

### Delta And Boundary {#bug007-contract-completion-delta}

**Phase:** implement
**Command:** `git --no-pager diff --stat -- rlportfolio.js rlportfoliobrief.js
tests/portfolio-brief.functional.mjs`
**Exit Code:** `0`
**Claim Source:** executed

```text
 rlportfolio.js                       | 31 ++++++++++++++++++++++++++++---
 rlportfoliobrief.js                  |  2 +-
 tests/portfolio-brief.functional.mjs | 12 ++++++++++--
 3 files changed, 39 insertions(+), 6 deletions(-)
```

The separate dirty parent Feature 008 scope, report, and root `test-plan.json`
transaction was already present on entry and remains untouched. Nothing was
committed. `HARDEN-B007-001` is unaffected by this section and remains open
and foreign-owned: this work registers error codes and corrects two
expectations, and does not address shared-injector mutation causality.

**Uncertainty declaration.** Coverage here is exactly the three named test
files plus the canonical selftest. The nine newly registered codes are now
*accepted* by `validatePortfolioError`, but no test in this run asserts the
end-to-end refusal payload for any of them individually, so their per-code
boundary behavior is admitted rather than proven. Neither the real-browser
matrix nor the in-memory mutation carrier was rerun in this session.

## RESULT-ENVELOPE

```yaml
outcome: completed_owned
currentOwner: bubbles.implement
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings: []
unresolvedFindings:
  - HARDEN-B007-001: Unchanged and still foreign-owned. Out of scope for this operator-directed error-contract completion.
evidence:
  - report.md#bug007-error-contract-completion
  - report.md#bug007-registry-completeness
  - report.md#bug007-expectation-correction
  - report.md#bug007-contract-completion-verification
reason: The nine emitted-but-unregistered P008 codes are registered and the emitted-minus-registered difference is empty. The two assertions that pinned the pre-fix three-field error literal now pin the full conforming PortfolioError/v1 shape with their exact code, reason and field retained. Focused tests are 48/48 at exit 0 and the canonical selftest is 3426/0 at exit 0. No commit was made, no DoD checkbox, human acceptance, certification, scope status or top-level status changed, and HARDEN-B007-001 remains open.
```

## TP-B007-008 Current Test-Owner Evidence {#bug007-tp-b007-008-current}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The source-visible assertion conjoins the exact 52/45/0
census and both negative controls. The current selftest exits zero with no
failed assertion, so the census assertion evaluated true.
**Result:** PASS

The current structured Test Plan intentionally pins this census. The new
assertion derives 52 registered codes and 45 quoted production emitter codes.
The emitted-minus-registered set is empty.

The assertion reads all three planned production modules. It strips comments
before scanning the first argument of each PortfolioError constructor call.
It reads registry keys from `rlportfolio.js::ERROR_CODES` rather than copying
the keys into the test.

The assertion also runs two negative controls. An invented emitted code appears
in the missing set. Removing a derived emitted code from a cloned registry also
places that code in the missing set.

```text
# BUG-007 TP-B007-008 final-tree canonical selftest
$ timeout 1800 node scripts/selftest.mjs
exit: 0
lines: 3907
sha256: ca53c419536133497fc871e3424a788d061b2a11c022b9a47a41d61faab28e1a
--- first 10 ---

Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
  ✓ CSP blocks object, base-tag, and form exfiltration paths
  ✓ CSP connect-src is an explicit origin allowlist, never wildcard https
  ✓ CSP preserves fixed providers, StockAnalysis, and custom-port tailnet proxy paths
  ✓ CSP allows no open URL-forwarding relay origin
  ✓ production pages and shared runtime contain no open URL-forwarding relay chain
--- omitted 3887 line(s); sha256 above covers the full output ---
--- last 10 ---
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
  ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
  ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
  ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
  ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3438 passed, 0 failed
================================================
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify ca53c419536133497fc871e3424a788d061b2a11c022b9a47a41d61faab28e1a -- timeout 1800 node scripts/selftest.mjs -->

The exact planned title is present once in the canonical selftest. The syntax
check and whitespace check also passed.

```text
$ timeout 120 node --check scripts/selftest.mjs
NODE_CHECK_EXIT=0
$ timeout 30 grep -nF 'Feature 008 PortfolioError registry covers every quoted production emitter' scripts/selftest.mjs
10542:  'Feature 008 PortfolioError registry covers every quoted production emitter');
TITLE_GREP_EXIT=0
TITLE_OCCURRENCES=1
SELFTEST_DIFF_CHECK_EXIT=0
```

This execution supersedes the earlier 3426-check TP-B007-008 receipt as the
current test-owner evidence. It does not rewrite the historical receipt.

### TP-B007-008 Artifact Closeout

The test-owned code and current execution are present. Planner-owned artifacts
still describe `TP-B007-008` as planned and not authored. Its DoD row remains
unchecked. This agent did not edit those foreign-owned artifacts.

## RESULT-ENVELOPE

```yaml
outcome: route_required
currentOwner: bubbles.test
nextRequiredOwner: bubbles.plan
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - TP-B007-008: The canonical source-derived registry census assertion now passes with 52 registered codes, 45 quoted production emitter codes, and zero missing codes.
unresolvedFindings:
  - TP-B007-008-ARTIFACT-CLOSEOUT: Planner-owned scope and structured Test Plan status still describe this test as planned and not authored, and the DoD row remains unchecked.
evidence:
  - report.md#bug007-tp-b007-008-current
reason: Test ownership added and executed the one planned assertion without changing source, other tests, planning artifacts, state, acceptance, or certification. Planning must reconcile the durable Test Plan and DoD status against this current evidence.
```

## Current Test Handoff - 2026-09-02 {#bug007-test-handoff-20260902}

This test phase validated the inherited actionable Research Lab binding before
local reads. It used the current `scopes.md`, `test-plan.json`, and
`scenario-manifest.json` as authority. It changed no product source, persistent
test, planning artifact, human acceptance record, parent Feature 008 artifact,
or sibling bug.

### Source, Runner, And Structured-Plan Identity {#bug007-test-identity-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 120 node scripts/validate-node-source-lock.mjs && timeout 60 npx --no-install playwright --version`
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
Version 1.61.1
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 60 jq -r '.scopes[].tests[] | [.id, .category, (.liveSystem | tostring), .file, .commandRef, (.testTitle // "-")] | @tsv' test-plan.json && timeout 600 bash .github/bubbles/scripts/scenario-test-resolve.sh <BUG-007> --repo-root .`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The twelve rows resolve to the exact command catalog and
execution classes below. The resolver independently found all sixteen current
linked path and title references.

```text
TP-B007-000 functional false tests/portfolio-brief.functional.mjs CMD-B007-FOCUSED historical-red
TP-B007-001 functional false tests/portfolio-brief.functional.mjs CMD-B007-FOCUSED
TP-B007-002 functional false tests/portfolio-brief.functional.mjs CMD-B007-FOCUSED
TP-B007-003 functional false tests/portfolio-brief.functional.mjs CMD-B007-FOCUSED
TP-B007-004 functional false tests/portfolio-brief.functional.mjs CMD-B007-FOCUSED
TP-B007-005 unit false tests/portfolio-test-integrity.unit.mjs CMD-B007-TEST-INTEGRITY
TP-B007-006 e2e-ui true tests/portfolio-survival-brief.spec.mjs CMD-B007-BRIEF-E2E
TP-B007-007 e2e-ui true eight exact Feature 008 browser files CMD-B007-FEATURE-E2E
TP-B007-008 functional false scripts/selftest.mjs CMD-B007-SELFTEST
TP-B007-009 artifact false six exact packet guards CMD-B007-PACKET-GUARDS
TP-B007-010 guard false implementation-reality-scan.sh CMD-B007-IMPLEMENTATION-REALITY
TP-B007-011 guard false state-transition-guard.sh CMD-B007-TRANSITION
[scenario-test-resolve] OK - 16 reference(s) resolved via literal-scan; 16 category comparison(s) not applicable (no test-discovery adapter declared)
```

The functional rows execute build-free Node logic. `TP-B007-005` executes
process-isolated in-memory representations. `TP-B007-006` and `TP-B007-007`
exercise ephemeral HTTP pages in system Chrome. The remaining rows are
repository selftest, artifact, or guard execution.

### Immutable Historical RED Adjudication {#bug007-tp-b007-000-current-adjudication}

**Phase:** test
**Executed:** YES
**Command:** `git merge-base --is-ancestor aad6fb52e d49a2955b; git show --name-only aad6fb52e; git show --name-only d49a2955b; git grep the three persistent BUG-007 titles before d49a2955b`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The carrier-authorship commit precedes the source repair,
all three protective titles exist before the repair, and the repair commit does
not edit a persistent test. The immutable exit-1 RED remains at
[`TP-B007-000`](#tp-b007-000); it was not recast as current GREEN execution.

```text
RED_AUTHORSHIP_PRECEDES_SOURCE_FIX=yes
RED_COMMIT=aad6fb52ebdafe5258ac77c74653c3b93770a4b5 test(008): add BUG-007 prototype-key RED
tests/portfolio-brief.functional.mjs
tests/portfolio-survival-brief.spec.mjs
tests/portfolio-test-integrity.unit.mjs
FIX_COMMIT=d49a2955b543433fc1fd502c1e346e3fd2888e11 fix(008): harden brief caller keys
rlportfoliobrief.js
aad6fb52e:tests/portfolio-brief.functional.mjs:444:test('BUG-007: prototype-sensitive completion keys are safe own keys', () => {
d49a2955b^:tests/portfolio-brief.functional.mjs:460:test('BUG-007: prototype-sensitive completion subjects are safe own keys', () => {
d49a2955b^:tests/portfolio-brief.functional.mjs:479:test('BUG-007: prototype-sensitive completion domains are safe own keys', () => {
TP-B007-000_PROVENANCE_OK immutable-report-evidence-only
```

### TP-B007-001 Through TP-B007-004 Current Focused Functional {#bug007-tp-b007-001-004-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-001 through TP-B007-004 focused functional current
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 42
sha256: 37421767af040b2ab326abc458c9a571fe7c975d835fb78e301d95fb3d29aba2
--- first 20 ---
ok - BUG-007: normal brief order and refusal precedence remain unchanged
ok - BUG-007: prototype-sensitive completion keys are safe own keys
ok - BUG-007: prototype-sensitive completion subjects are safe own keys
ok - BUG-007: prototype-sensitive completion domains are safe own keys
ok - BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
--- omitted output; sha256 above covers all 42 lines ---
--- last 20 ---
ok - SCN-008-046 every public boundary emits a closed value-safe PortfolioError
ok - Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract
ok - Regression: BUG-004 same-semantic occurrences cannot inflate relevance
tests 34
suites 0
pass 34
fail 0
cancelled 0
skipped 0
todo 0
```

The one execution independently earns the exact assertions mapped to
`TP-B007-001`, `TP-B007-002`, `TP-B007-003`, and `TP-B007-004`.

### TP-B007-005 Current Mutation Causality {#bug007-tp-b007-005-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The exact selected title executes the three registered
BUG-007 mutants and its embedded double-application, direct-text, unmatched
anchor, and uncoordinated setup controls. The title can pass only when each
mutant has one intended hook, one marker application, one selected failed test,
`ERR_ASSERTION` origin, and no injector/setup signature.

```text
# BUG-007 TP-B007-005 exact mutation causality current
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: d87bd24c5f6a1b2a0226ebc6d81554ada6eb266f4f0d055b854ea444bc9df2a9
ok - BUG-007: represented mutants execute one protective assertion through one intended hook
tests 1
suites 0
pass 1
fail 0
cancelled 0
skipped 0
todo 0
```

### TP-B007-006 Current Scenario Browser {#bug007-tp-b007-006-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-006 scenario browser current
$ timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 67
sha256: 8c2c6f75ec708195985609fa1a0adfae62f898f28ad6fcdfa4a971d50af31f17
--- first 20 ---
Running 19 tests using 1 worker
ok 1 - Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
ok 2 - Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history
ok 3 - Regression: SCN-008-010 insufficient completed history produces zero inferred actions
ok 4 - Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap
ok 5 - BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
--- omitted 27 lines; sha256 above covers the full output ---
--- last 20 ---
ok 16 - Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent
ok 17 - Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace
ok 18 - Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule
ok 19 - Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
19 passed (29.8s)
```

### TP-B007-007 Current Eight-File Browser Matrix {#bug007-tp-b007-007-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-007 eight-file Feature 008 browser current
$ timeout 1800 npx --no-install playwright test <eight exact Feature 008 files> --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 305
sha256: a14fefd30af2912f06d1d19e7d09c4a538ea7577f888e2a38c129f05d4e8a636
--- first 20 ---
Running 95 tests using 2 workers
ok 1 - Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete
ok 2 - Regression: SCN-008-026 all six allocation methods share one frozen basis
ok 8 - Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
--- omitted 265 lines; sha256 above covers the full output ---
--- last 20 ---
ok 91 - Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
ok 92 - Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
ok 93 - Regression: Feature 008 an incomplete cash need is refused rather than partly assumed
ok 94 - Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
ok 95 - Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
95 passed (1.9m)
```

### TP-B007-008 Current Canonical Selftest {#bug007-tp-b007-008-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-007 TP-B007-008 canonical selftest current
$ timeout 1800 node scripts/selftest.mjs
exit: 1
lines: 3918
sha256: bd642961febd79d6dfa11de5a393556f6b84ce9a36585794f44e9cf0f730d323
--- failure-shaped lines from the omitted region ---
FAIL: committed surface carries no personal identifier
--- omitted output; sha256 above covers all 3918 lines ---
Research-Lab self-test: 3442 passed, 1 failed
$ timeout 180 node scripts/pii-scan.mjs
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md:5864:301 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md:5870:175 rule=home-path length=13
[pii-scan] files=10774 messages=2554 findings=2 FAIL
[pii-scan] The matched text is withheld on purpose - printing it would copy the identifier into CI logs.
```

The only reported canonical-selftest failure is in the separately dirty
`BUG-005` report. That path is outside this handoff and explicitly protected
from edits. `TP-B007-008` therefore remains unearned even though its persistent
census title is present and syntax-clean; this row requires the complete
canonical selftest to exit zero.

### TP-B007-009 Current Packet Guards {#bug007-tp-b007-009-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** the six exact `CMD-B007-PACKET-GUARDS` child commands
**Exit Code:** 0
**Claim Source:** executed

```text
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
traceability exit=0 lines=67 sha256=3dd451d8ec28941930e6d5f86ac0be906f75f79b26ad82d38283410c93750ed5
traceability scenarios=4 test-rows=13 DoD-mapped=4 warnings=0
scenario-obligation exit=0 lines=1 sha256=3979d4214fdb7145fa4cad82986c6a605516b95479ac3ed7f6308d0a62022a0b
scenario-obligation coherent-scenarios=4
test-mechanism exit=0 lines=2 sha256=36ffdf83fc233d8197e21b38176847355aac161f635cd8a56fba0c9fa68295f6
test-mechanism coherent-mechanisms=4 mutation-adapter=none-inert
scope-context exit=0 lines=1 sha256=7a84f3ca9c4d89bb763bfc95ee9d8247f3eb7fafed040311e53609f2ae6627d9
scope-context scopes=1 self-contained=yes
capability-foundation exit=0 lines=5 sha256=377c513bf3d9c6a808bc13091eb6a78f12882526d6c956938d00b111df10cba3
capability-foundation gate=G094 result=PASS
packet-guard-battery passed=6 failed=0
```

### TP-B007-010 Current Implementation Reality {#bug007-tp-b007-010-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 TP-B007-010 implementation reality current
exit: 0
lines: 35
sha256: f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
Resolved 6 implementation file(s) to scan
Scan 1: Gateway/Backend Stub Patterns
Scan 2: Frontend Hardcoded Data Patterns
Scan 2B: Sensitive Client Storage
Scan 5: Default/Fallback Value Patterns
Scan 6: Live-System Test Interception
Files scanned: 6
Violations: 0
Warnings: 0
PASSED: No source code reality violations detected
```

### Carrier Quality And Source Integrity {#bug007-carrier-quality-current-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/portfolio-brief.functional.mjs
Adversarial signal detected in tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-survival-brief.spec.mjs
Asserts the current surface in tests/portfolio-survival-brief.spec.mjs (mixed inspection accepted)
Adversarial signal detected in tests/portfolio-survival-brief.spec.mjs
Scanning tests/portfolio-test-integrity.unit.mjs
Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
```

**Phase:** test
**Executed:** YES
**Command:** executable interception/skip scans, `node --check` over eight BUG-007 source/test files, and scoped staged/unstaged Git diff checks
**Exit Code:** 0
**Claim Source:** executed

```text
NO_INTERCEPTION_SCAN=PASS executable-matches=0 files=8
NO_SKIP_SCAN=PASS executable-matches=0 files=10
NODE_CHECK=PASS path=rlportfolio.js
NODE_CHECK=PASS path=rlportfoliobrief.js
NODE_CHECK=PASS path=rlportfolioanalytics.js
NODE_CHECK=PASS path=tests/portfolio-brief.functional.mjs
NODE_CHECK=PASS path=tests/portfolio-survival-brief.spec.mjs
NODE_CHECK=PASS path=tests/portfolio-test-integrity.unit.mjs
NODE_CHECK=PASS path=tests/portfolio-defect-injector.cjs
NODE_CHECK=PASS path=scripts/selftest.mjs
BUG007_SOURCE_TEST_DIFF=clean
10542: 'Feature 008 PortfolioError registry covers every quoted production emitter');
SOURCE_TEST_INTEGRITY=PASS
```

### Individual DoD Evidence Reconciliation {#bug007-dod-reconciliation-20260902}

The planner owns `scopes.md`, so this test phase did not change a checkbox or
scope status. The table records which current evidence is eligible for
planner-owned checkbox reconciliation and which gates remain unearned.

| DoD item | Current evidence | Test disposition |
| --- | --- | --- |
| Root cause and caller-keyed map inventory | Source/test identities, six-file reality scan, focused behavior, mutation causality | Eligible for planner reconciliation; interpreted mapping |
| Change boundary, five committed batches, and consumer sweep | Commit ancestry, current source/test clean diff, exact planned carriers | Eligible for planner reconciliation; interpreted mapping |
| `TP-B007-000` historical RED | Immutable [`TP-B007-000`](#tp-b007-000) plus current ancestry/title adjudication | Eligible as immutable RED; not rerun or relabeled |
| `TP-B007-001` normal/error compatibility | [34-test focused execution](#bug007-tp-b007-001-004-current-20260902) | Eligible; executed |
| `TP-B007-002` hostile subjects | [34-test focused execution](#bug007-tp-b007-001-004-current-20260902) | Eligible; executed |
| `TP-B007-003` hostile domains | [34-test focused execution](#bug007-tp-b007-001-004-current-20260902) | Eligible; executed |
| `TP-B007-004` own/inherited lookup and cleanup | [34-test focused execution](#bug007-tp-b007-001-004-current-20260902) | Eligible; executed |
| `TP-B007-005` mutation causality | [Exact title](#bug007-tp-b007-005-current-20260902) and [carrier quality](#bug007-carrier-quality-current-20260902) | Eligible; interpreted from exact assertions plus execution |
| `TP-B007-006` scenario browser | [19-test system-Chrome execution](#bug007-tp-b007-006-current-20260902) | Eligible; executed |
| `TP-B007-007` broad browser | [95-test eight-file execution](#bug007-tp-b007-007-current-20260902) | Eligible; executed |
| `TP-B007-008` canonical selftest | [3442 pass, 1 foreign-path failure](#bug007-tp-b007-008-current-20260902) | Not earned; keep unchecked |
| `TP-B007-009` packet guards | [Six-child guard battery](#bug007-tp-b007-009-current-20260902) | Eligible; executed |
| `TP-B007-010` implementation reality | [Six-file scan](#bug007-tp-b007-010-current-20260902) | Eligible; executed |
| Human acceptance | Existing checked item and untouched human record | Preserved; no automation claim added |
| `TP-B007-011` transition | Validate-owned and not yet certifying | Not earned; keep unchecked |
| Build Quality Gate | Canonical selftest and final transition are not green | Not earned; keep unchecked |

No current test phase completion claim is earned while `TP-B007-008` remains
red. `TP-B007-011`, certification, scope promotion, and terminal status remain
outside test ownership.

### Post-Edit Governance And Transition Diagnostic {#bug007-post-edit-governance-20260902}

**Phase:** test
**Executed:** YES
**Command:** claim-source lint, execution-substate guard, state boundary query, artifact lint, and traceability guard over the current BUG-007 packet
**Exit Code:** 0
**Claim Source:** executed

```text
[claim-source-lint] OK - every execution-evidence block carries a valid Claim Source tag
[execution-substate-guard] OK - execution substate is valid and distinct from certification
state-boundary-query=true
artifact-lint exit=0 lines=40
artifact-lint sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
artifact-lint result=PASSED
traceability exit=0 lines=67
traceability sha256=00e37e6e96e1cc71fb02089d40052941f8f9d5506e8713996d5e51d61d7cd598
traceability scenarios=4 test-rows=13 scenario-to-row=4 DoD-mapped=4
traceability warnings=0 result=PASSED
status=in_progress
certification.status=in_progress
certification.completedScopes=0
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED NON-CERTIFYING BLOCK

```text
# BUG-007 TP-B007-011 non-certifying transition guard current
exit: 1
lines: 370
sha256: 17e06e050efe83162d39a40e6aed23d0fc65987d0506625bfd872396ceb5c063
DoD items total: 16 (checked: 1, unchecked: 15)
Resolved scopes: total=1, Done=0, In Progress=0, Not Started=1, Blocked=0
Required phases missing: stabilize, security, validate, audit
G061: transitionRequest statuses use completed/pending instead of open/closed/resolved
G022: design and plan are not registered phases; implement lacks specialist provenance
G053: Code Diff Evidence section is absent
G027: implement/test phase claims exist while completedScopes is empty and zero scopes are Done
G090: retro convergence health failed
Check 8C: three shared-infrastructure planning requirements are absent
Check 8D: one change-boundary containment planning requirement is absent
Check 43: one stale receipt names protected sibling BUG-025
TRANSITION BLOCKED: 34 failure(s), 2 warning(s)
failedGateIds: G061,G022,G053,G027,G090
failedChecks: Check-4-completion,Check-5-all-done
blockingCode: DELIVERY_COMPLETION_FAILED
verdict: FAIL
```

The transition result is diagnostic only. Test ownership did not change
`TP-B007-011`, the fifteen planner-owned unchecked DoD items, the `Not Started`
scope header, transition-request vocabulary, missing quality-phase records,
code-diff planning evidence, certification, or terminal state. The stale
receipt naming `BUG-025` and the canonical-selftest PII findings naming
`BUG-005` are protected cross-boundary conditions and were not modified.

## Recovery Test Epoch - 2026-09-02 {#bug007-recovery-test-epoch-20260902}

This recovery validates the same actionable Research Lab binding after the
preceding `bubbles.test` invocation returned no result envelope. The parent
accepts no phase completion from that invocation. Current commands were
therefore executed again. No product source, persistent test, planner-owned
scope or plan, human acceptance, certification field, sibling bug, parent
Feature 008 transaction, commit, push, deploy, or dispatch changed.

### No-Result Residue Accounting {#bug007-no-result-residue-20260902}

**Phase:** test
**Executed:** YES
**Command:** scoped Git diff, status, and blob identity checks over the BUG-007
report and state
**Exit Code:** 0
**Claim Source:** executed

```text
NO_RESULT_DIFF report.md insertions=438 deletions=0
NO_RESULT_DIFF state.json insertions=11 deletions=11
NO_RESULT_STATUS report.md=modified
NO_RESULT_STATUS state.json=modified
NO_RESULT_BASE_BLOB report=9bd2694d03d87f1f6f9e43f93aff74e5b6df1d94
NO_RESULT_CURRENT_BLOB report=a65b88ff2987a1155c6fb4ddc2d1e721bbec75e4
NO_RESULT_BASE_BLOB state=9897bd301399d187d908aecab799f84f9ffa0fe6
NO_RESULT_CURRENT_BLOB state=587782ca96b05cd0610e4b1d77ee816715b119a5
NO_RESULT_RESIDUE_FILES=report.md,state.json
NO_RESULT_PHASE_COMPLETION_ACCEPTED=no
```

The 438 report lines contain the prior focused, mutation, browser, selftest,
packet, reality, carrier-quality, and transition-diagnostic record. The state
delta changes execution-only fields to a blocked test run. This recovery keeps
that append-only history, supersedes none of it as evidence, and bases its
verdict only on the executions below.

### Plan, Manifest, Runner, And File Identity {#bug007-recovery-identity-20260902}

**Phase:** test
**Executed:** YES
**Command:** exact 12-row Markdown/JSON/manifest parity probe followed by
`timeout 600 bash .github/bubbles/scripts/scenario-test-resolve.sh
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
--repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
expected count=12 ids=TP-B007-000,TP-B007-001,TP-B007-002,TP-B007-003,TP-B007-004,TP-B007-005,TP-B007-006,TP-B007-007,TP-B007-008,TP-B007-009,TP-B007-010,TP-B007-011
markdown count=12 ids=TP-B007-000,TP-B007-001,TP-B007-002,TP-B007-003,TP-B007-004,TP-B007-005,TP-B007-006,TP-B007-007,TP-B007-008,TP-B007-009,TP-B007-010,TP-B007-011
structured count=12 ids=TP-B007-000,TP-B007-001,TP-B007-002,TP-B007-003,TP-B007-004,TP-B007-005,TP-B007-006,TP-B007-007,TP-B007-008,TP-B007-009,TP-B007-010,TP-B007-011
manifest count=12 ids=TP-B007-000,TP-B007-001,TP-B007-002,TP-B007-003,TP-B007-004,TP-B007-005,TP-B007-006,TP-B007-007,TP-B007-008,TP-B007-009,TP-B007-010,TP-B007-011
scenarios count=4
linked-tests count=16
historical-red id=TP-B007-000 semantics=historical-red rerunPolicy=true
historical-red status=planned-not-executed
current-rows range=TP-B007-001..TP-B007-010
transition-row id=TP-B007-011
BUG007_12_ROW_PLAN_MANIFEST_PARITY=PASS
[scenario-test-resolve] OK - 16 reference(s) resolved via literal-scan; 16 category comparison(s) not applicable (no test-discovery adapter declared)
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 120 node scripts/validate-node-source-lock.mjs && timeout
60 npx --no-install playwright --version`
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
Version 1.61.1
```

**Phase:** test
**Executed:** YES
**Command:** scoped `git hash-object`, unstaged/staged diff, ancestry, and commit
identity checks over the eight BUG-007 source and test files
**Exit Code:** 0
**Claim Source:** executed

```text
BUG007_BLOB 81dd1f73bea5516fbffb76c459cdccae3984c415 rlportfolio.js
BUG007_BLOB 909a6af5bec57104282cbef72af70192b159beff rlportfoliobrief.js
BUG007_BLOB 203c57b14898a13e0da81898e755ea5f5f6674ba rlportfolioanalytics.js
BUG007_BLOB 245dc3282c5e69dcea3e73498f1d59894e57fa1b scripts/selftest.mjs
BUG007_BLOB 511f0cf79b705f645cd3ac6c9097c338d8e16a6b tests/portfolio-brief.functional.mjs
BUG007_BLOB b1c1d980981897b218f25e1abdd7222b17a1c557 tests/portfolio-survival-brief.spec.mjs
BUG007_BLOB 683da712352abd3145490842a0e636f7a400d272 tests/portfolio-test-integrity.unit.mjs
BUG007_BLOB 20ed786006be23f542ec3c524758eda625567ea9 tests/portfolio-defect-injector.cjs
BUG007_SOURCE_TEST_DIFF=clean
TP_B007_000_AUTHORSHIP_PRECEDES_FIX=yes
RED_COMMIT=aad6fb52ebdafe5258ac77c74653c3b93770a4b5 test(008): add BUG-007 prototype-key RED
FIX_COMMIT=d49a2955b543433fc1fd502c1e346e3fd2888e11 fix(008): harden brief caller keys
TP_B007_000_IMMUTABLE_HISTORICAL_RED=PASS
```

`TP-B007-000` remains the immutable historical exit-1 RED at
[`TP-B007-000`](#tp-b007-000). It was not executed against repaired source and
was not relabeled as a current GREEN result.

### TP-B007-001 Through TP-B007-004 Recovery Functional {#bug007-recovery-tp-b007-001-004}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 recovery TP-B007-001-004 focused functional
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 42
sha256: 1b7240449207b710680e59eca9d06c5a0cc06c60294277e7273b2ad157da54c3
--- selected current output; sha256 covers all 42 lines ---
ok - BUG-007: normal brief order and refusal precedence remain unchanged
ok - BUG-007: prototype-sensitive completion keys are safe own keys
ok - BUG-007: prototype-sensitive completion subjects are safe own keys
ok - BUG-007: prototype-sensitive completion domains are safe own keys
ok - BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
ok - SCN-008-046 every public boundary emits a closed value-safe PortfolioError
tests 34
suites 0
pass 34
fail 0
cancelled 0
skipped 0
todo 0
```

### TP-B007-005 Recovery Mutation Causality {#bug007-recovery-tp-b007-005}

**Phase:** test
**Executed:** YES
**Command:** `timeout 240 node --test --test-name-pattern='^BUG-007:
represented mutants execute one protective assertion through one intended
hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** The exact selected test executes three represented BUG-007
mutants. Its assertions require one application marker from the declared hook,
one selected protective test, one `ERR_ASSERTION` failure from that test, and no
injector, preload, setup, anchor, syntax, or module-load failure. It also rejects
the deliberate two-hook application, exercises the independent
`fs.readFileSync` carrier, and requires the uncoordinated zero-anchor setup to
fail loudly without recording an application.

```text
# BUG-007 recovery TP-B007-005 exact mutation causality
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: 68c7a4f465c0becb1629f2f5f86f7fa78d06e9308d00fc48d08e26efecae573b
ok - BUG-007: represented mutants execute one protective assertion through one intended hook
tests 1
suites 0
pass 1
fail 0
cancelled 0
skipped 0
todo 0
```

### TP-B007-006 Recovery Scenario Browser {#bug007-recovery-tp-b007-006}

**Phase:** test
**Executed:** YES
**Command:** `timeout 900 npx --no-install playwright test
tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs
--project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 recovery TP-B007-006 scenario browser
$ timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 67
sha256: bca93db142f9e64112f8f0ee3895fb78729cd00c5fabb3e619a9e13c0cdf04fc
--- first 20 ---
Running 19 tests using 1 worker
ok 1 - Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
ok 2 - Regression: SCN-008-007 held watch completed-research and inferred-relevance lanes reject raw history
ok 3 - Regression: SCN-008-010 insufficient completed history produces zero inferred actions
ok 4 - Regression: Feature 008 four-window brief preserves source lanes at desktop mobile and zoom without overlap
ok 5 - BUG-007: browser composer treats hostile keys as data and visible constructor remains operable
--- last 20 ---
ok 16 - Regression: SCN-008-046 generic evidence DST policy complete API and global queue remain coherent
ok 17 - Regression: SCN-008-052 mode tabs rebase and compute tokens preserve one immutable workspace
ok 18 - Regression: BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule
ok 19 - Regression: SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace
19 passed (29.5s)
```

### TP-B007-007 Recovery Eight-File Browser Matrix {#bug007-recovery-tp-b007-007}

**Phase:** test
**Executed:** YES
**Command:** the exact eight-file `CMD-B007-FEATURE-E2E` command from
`test-plan.json`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 recovery TP-B007-007 eight-file Feature 008 browser
$ timeout 1800 npx --no-install playwright test <eight exact Feature 008 files> --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 305
sha256: 1e19abaffa8928334a2fbc5c457e305b79d66043a99d0cd7c2ed1f67824b2a9a
--- first 20 ---
Running 95 tests using 2 workers
ok 1 - Regression: SCN-008-053 keyboard tabs modals and screen reader states are complete
ok 2 - Regression: SCN-008-026 all six allocation methods share one frozen basis
ok 8 - Regression: SCN-008-006 all four exact ET windows preserve cutoff and composition time
--- last 20 ---
ok 91 - Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
ok 92 - Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
ok 93 - Regression: Feature 008 an incomplete cash need is refused rather than partly assumed
ok 94 - Regression: SCN-008-048 complete scenario cash needs uncertainty and compute tokens govern every path
ok 95 - Regression: SCN-008-048 cancelled and superseded path jobs cannot replace the last valid view
95 passed (2.5m)
```

### TP-B007-008 Recovery Census And Canonical Selftest {#bug007-recovery-tp-b007-008}

**Phase:** test
**Executed:** YES
**Command:** exact source-derived census probe matching the persistent
`Feature 008 PortfolioError registry covers every quoted production emitter`
assertion
**Exit Code:** 0
**Claim Source:** executed

```text
CENSUS registryMatch=true
CENSUS registeredRows=52
CENSUS registeredUnique=52
CENSUS module=rlportfolio.js quotedCallArguments=281
CENSUS module=rlportfoliobrief.js quotedCallArguments=39
CENSUS module=rlportfolioanalytics.js quotedCallArguments=10
CENSUS emittedUnique=45
CENSUS missing=0
CENSUS inventedNegativeControl=true
CENSUS removedNegativeControl=true
CENSUS removedCode=P008-ACTION-LIFECYCLE
TP_B007_008_CENSUS_ASSERTION=PASS
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed
**Result:** FAIL

```text
# BUG-007 recovery TP-B007-008 canonical selftest and census
$ timeout 1800 node scripts/selftest.mjs
exit: 1
lines: 3918
sha256: e6bddd53d1f15778430da168dce26a58720c164379cc63419bf0b832dbd6743a
--- failure-shaped lines from the omitted region ---
FAIL: committed surface carries no personal identifier
--- omitted 3878 lines; sha256 above covers the full output ---
Research-Lab self-test: 3442 passed, 1 failed
$ timeout 300 node scripts/pii-scan.mjs
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md:5864:301 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md:5870:175 rule=home-path length=13
[pii-scan] files=10774 messages=2554 findings=2 FAIL
[pii-scan] The matched text is withheld on purpose - printing it would copy the identifier into CI logs.
```

The direct census is current and green. The required canonical selftest is not.
Both redacted findings are in the protected sibling BUG-005 report under its
current convergence diagnostic. This BUG-007 run does not own that evidence
section, so `TP-B007-008` remains unearned.

### TP-B007-009 Recovery Packet Battery {#bug007-recovery-tp-b007-009}

**Phase:** test
**Executed:** YES
**Command:** the six exact `CMD-B007-PACKET-GUARDS` child commands
**Exit Code:** 0
**Claim Source:** executed

```text
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
artifact-lint result=PASSED checked-DoD-evidence=PASS templates=PASS
traceability exit=0 lines=67 result=PASSED warnings=0
traceability scenarios=4 linked-references=16 scenario-to-DoD=4
scenario-obligation exit=0 coherent-scenarios=4
test-mechanism exit=0 coherent-mechanisms=4
mutation-execution-adapter=none-inert
scope-context exit=0 scopes=1 self-contained=yes
capability-foundation exit=0 gate=G094
capability-foundation triggerHits=2
capability-foundation spec-justification=present
capability-foundation design-justification=present
capability-foundation result=PASS
packet-guard-battery passed=6 failed=0
```

The traceability guard prints `test_rows=13`; the exact ID comparison above
independently proves that Markdown, structured plan, and manifest each contain
the same twelve unique IDs `TP-B007-000` through `TP-B007-011`.

### TP-B007-010 Recovery Implementation Reality {#bug007-recovery-tp-b007-010}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash
.github/bubbles/scripts/implementation-reality-scan.sh
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
--verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 recovery TP-B007-010 implementation reality
$ timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --verbose
exit: 0
lines: 35
sha256: f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
Resolved 6 implementation file(s) to scan
Scan 1: Gateway/Backend Stub Patterns
Scan 2: Frontend Hardcoded Data Patterns
Scan 2B: Sensitive Client Storage
Scan 5: Default/Fallback Value Patterns
Scan 6: Live-System Test Interception
Files scanned: 6
Violations: 0
Warnings: 0
PASSED: No source code reality violations detected
```

### Recovery Carrier Quality And Integrity {#bug007-recovery-carrier-quality-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash
.github/bubbles/scripts/regression-quality-guard.sh --bugfix
tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs
tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
BUBBLES REGRESSION QUALITY GUARD
Bugfix mode: true
Scanning tests/portfolio-brief.functional.mjs
Adversarial signal detected in tests/portfolio-brief.functional.mjs
Scanning tests/portfolio-survival-brief.spec.mjs
Asserts the current surface in tests/portfolio-survival-brief.spec.mjs (mixed inspection accepted)
Adversarial signal detected in tests/portfolio-survival-brief.spec.mjs
Scanning tests/portfolio-test-integrity.unit.mjs
Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
```

**Phase:** test
**Executed:** YES
**Command:** executable interception/skip declaration scan over the exact live
and persistent carrier sets
**Exit Code:** 0
**Claim Source:** interpreted
**Interpretation:** A broad token scan first found one `test.skip(...)` string
inside the mutation carrier's test-source mutation fixture. The declaration-
position scan classifies that one token as fixture input and finds zero
executable skip declarations. All eight live browser files contain zero request
interception declarations.

```text
NO_INTERCEPTION file=tests/portfolio-survival-foundation.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-brief.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-risk.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-paths.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-diversification.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-allocation.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-mobile.spec.mjs executableMatches=0
NO_INTERCEPTION file=tests/portfolio-survival-accessibility.spec.mjs executableMatches=0
NO_SKIP file=tests/portfolio-brief.functional.mjs rawMatches=0 fixtureLiteralMatches=0 executableMatches=0
NO_SKIP file=tests/portfolio-test-integrity.unit.mjs rawMatches=1 fixtureLiteralMatches=1 executableMatches=0
NO_SKIP file=tests/portfolio-defect-injector.cjs rawMatches=0 fixtureLiteralMatches=0 executableMatches=0
NO_SKIP_SUMMARY files=11 fixtureLiteralMatches=1 executableMatches=0
NO_INTERCEPTION_SUMMARY files=8 executableMatches=0
BUG007_EXECUTABLE_INTERCEPTION_SKIP_SCAN=PASS
```

**Phase:** test
**Executed:** YES
**Command:** `node --check`, post-mutation blob identity, and scoped staged plus
unstaged diff checks over all eight BUG-007 source and test files
**Exit Code:** 0
**Claim Source:** executed

```text
NODE_CHECK=PASS path=rlportfolio.js
NODE_CHECK=PASS path=rlportfoliobrief.js
NODE_CHECK=PASS path=rlportfolioanalytics.js
NODE_CHECK=PASS path=scripts/selftest.mjs
NODE_CHECK=PASS path=tests/portfolio-brief.functional.mjs
NODE_CHECK=PASS path=tests/portfolio-survival-brief.spec.mjs
NODE_CHECK=PASS path=tests/portfolio-test-integrity.unit.mjs
NODE_CHECK=PASS path=tests/portfolio-defect-injector.cjs
POST_MUTATION_BLOB 81dd1f73bea5516fbffb76c459cdccae3984c415 rlportfolio.js
POST_MUTATION_BLOB 909a6af5bec57104282cbef72af70192b159beff rlportfoliobrief.js
POST_MUTATION_BLOB 203c57b14898a13e0da81898e755ea5f5f6674ba rlportfolioanalytics.js
POST_MUTATION_BLOB 245dc3282c5e69dcea3e73498f1d59894e57fa1b scripts/selftest.mjs
POST_MUTATION_BLOB 511f0cf79b705f645cd3ac6c9097c338d8e16a6b tests/portfolio-brief.functional.mjs
POST_MUTATION_BLOB b1c1d980981897b218f25e1abdd7222b17a1c557 tests/portfolio-survival-brief.spec.mjs
POST_MUTATION_BLOB 683da712352abd3145490842a0e636f7a400d272 tests/portfolio-test-integrity.unit.mjs
POST_MUTATION_BLOB 20ed786006be23f542ec3c524758eda625567ea9 tests/portfolio-defect-injector.cjs
POST_MUTATION_SOURCE_TEST_INTEGRITY=PASS
```

### Recovery DoD Evidence Reconciliation {#bug007-recovery-dod-reconciliation-20260902}

The test agent owns report evidence but not planner-authored `scopes.md`
checkboxes. No checkbox or scope status changed. The current evidence
dispositions are exact:

| DoD item | Recovery disposition |
| --- | --- |
| Root cause and caller-keyed map inventory | Eligible for planner reconciliation; current source identities, focused behavior, and six-file reality scan are green. |
| Change boundary, five committed batches, and consumer sweep | Eligible for planner reconciliation; eight source/test files are byte-clean and protected sibling and parent transactions remain untouched. |
| `TP-B007-000` historical RED | Eligible as immutable historical RED only; not rerun or relabeled. |
| `TP-B007-001` normal/error compatibility | Earned by the 34-test focused execution. |
| `TP-B007-002` hostile subjects | Earned by the 34-test focused execution. |
| `TP-B007-003` hostile domains | Earned by the 34-test focused execution. |
| `TP-B007-004` own/inherited lookup and cleanup | Earned by the 34-test focused execution. |
| `TP-B007-005` mutation causality | Earned as interpreted evidence by the exact 1-test execution and its explicit hook, marker, assertion-origin, double-application, direct-read, zero-anchor, and byte-integrity assertions. |
| `TP-B007-006` scenario browser | Earned by the 19-test system-Chrome execution. |
| `TP-B007-007` broad browser | Earned by the 95-test eight-file system-Chrome execution. |
| `TP-B007-008` canonical selftest | Not earned: direct census passes, but the required canonical selftest exits 1 on two protected BUG-005 PII findings. |
| `TP-B007-009` packet guards | Earned by all six guard exits at zero. |
| `TP-B007-010` implementation reality | Earned by the six-file scan with zero violations and zero warnings. |
| Human acceptance | Existing human-owned checked item preserved unchanged. |
| `TP-B007-011` transition | Not earned and remains validation-owned. |
| Build Quality Gate | Not earned while TP-B007-008 and TP-B007-011 remain red. |

No test phase completion is recorded. A fully green canonical selftest is
required before test can route a completed execution to `bubbles.harden`.

### Recovery Post-Edit Governance {#bug007-recovery-post-edit-governance-20260902}

**Phase:** test
**Executed:** YES
**Command:** claim-source lint, execution-substate guard, artifact lint, and
traceability guard over the edited BUG-007 packet
**Exit Code:** 0
**Claim Source:** executed

```text
[claim-source-lint] OK - every execution-evidence block carries a valid Claim Source tag
[execution-substate-guard] OK - execution substate is valid and distinct from certification
artifact-lint required-artifacts=PASS
artifact-lint checkbox-shape=PASS
artifact-lint acceptance-separation=PASS
artifact-lint state-v3=PASS
artifact-lint top-level-certification-parity=PASS
artifact-lint checked-DoD-evidence=PASS
artifact-lint template-placeholders=0
artifact-lint result=PASSED
traceability exit=0
traceability lines=67
traceability sha256=52eacbfaf887f2c7c7c8a1e8104633333f77c62ed0535b2815be1e42a901532e
traceability scenarios=4
traceability linked-references=16
traceability DoD-mapped=4
traceability warnings=0
traceability result=PASSED
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash
.github/bubbles/scripts/state-transition-guard.sh
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED NON-CERTIFYING BLOCK

```text
# BUG-007 recovery final non-certifying transition
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 1
lines: 372
sha256: 83489158638b6cdf61fd668b14736461ee1d27a277915a5b2e4026b033472fb6
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
failedGateIds: [G061,G022,G053,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 34
exitStatus: 1
verdict: FAIL
```

The 34 current transition blocks are:

| Class | Exact remaining condition |
| --- | --- |
| Canonical selftest | `TP-B007-008` remains red because the repository PII scan finds two `home-path` values in the protected BUG-005 report. |
| DoD completion | 15 of 16 planner-owned DoD items remain unchecked. |
| Scope completion | The only scope remains `Not Started`; zero scopes are `Done`. |
| G061 | Transition requests `BUG-007-ROUTE-001` through `BUG-007-ROUTE-009` use `completed`, and `BUG-007-ROUTE-010` uses `pending`, rather than the accepted `open`, `closed`, or `resolved` vocabulary. |
| Required phases | `stabilize`, `security`, `validate`, and `audit` are absent. |
| G022 | `design` and `plan` are not registered workflow phases; `implement` lacks specialist provenance; `design`, `implement`, and `plan` lack execution-history backing. |
| Shared-infrastructure plan shape | The canary DoD item, rollback/restore DoD item, and explicit canary Test Plan row are absent. |
| Change-boundary plan shape | The explicit change-boundary DoD item is absent. |
| G053 | `report.md` has no `### Code Diff Evidence` section. |
| G027 | Implement/test claims exist while `completedScopes` is empty and zero scopes are marked `Done`. |
| Receipt freshness | One current stale receipt names protected sibling `BUG-025-company-corpus-read`. |
| G090 | Retro convergence health fails. |

The guard also reports one non-blocking warning: 25 of 77 report evidence
blocks lack terminal-output signals. Gate G136 passes: every human-acceptance
item is checked and its human record is present. Certification and terminal
state remain unchanged.

## Final Test-Owned Closure - 2026-09-02 {#bug007-final-test-closure-20260902}

The authoritative Research Lab packet was validated before this finalization.
The eight BUG-007 source and persistent-test inputs are byte-identical to the
accepted recovery epoch. The three planning inputs are clean at their current
committed identities. No browser input changed, so the accepted recovery runs
at 19 of 19 and 95 of 95 remain current without another broad browser matrix.

### Final Input Identity {#bug007-final-input-identity-20260902}

**Phase:** test
**Executed:** YES
**Command:** exact `git hash-object` comparison over eight BUG-007 source/test
inputs, followed by status and identity checks over `scopes.md`,
`test-plan.json`, and `scenario-manifest.json`
**Exit Code:** 0
**Claim Source:** executed

```text
BUG007_RECOVERY_IDENTITY=UNCHANGED path=rlportfolio.js blob=81dd1f73bea5516fbffb76c459cdccae3984c415
BUG007_RECOVERY_IDENTITY=UNCHANGED path=rlportfoliobrief.js blob=909a6af5bec57104282cbef72af70192b159beff
BUG007_RECOVERY_IDENTITY=UNCHANGED path=rlportfolioanalytics.js blob=203c57b14898a13e0da81898e755ea5f5f6674ba
BUG007_RECOVERY_IDENTITY=UNCHANGED path=scripts/selftest.mjs blob=245dc3282c5e69dcea3e73498f1d59894e57fa1b
BUG007_RECOVERY_IDENTITY=UNCHANGED path=tests/portfolio-brief.functional.mjs blob=511f0cf79b705f645cd3ac6c9097c338d8e16a6b
BUG007_RECOVERY_IDENTITY=UNCHANGED path=tests/portfolio-survival-brief.spec.mjs blob=b1c1d980981897b218f25e1abdd7222b17a1c557
BUG007_RECOVERY_IDENTITY=UNCHANGED path=tests/portfolio-test-integrity.unit.mjs blob=683da712352abd3145490842a0e636f7a400d272
BUG007_RECOVERY_IDENTITY=UNCHANGED path=tests/portfolio-defect-injector.cjs blob=20ed786006be23f542ec3c524758eda625567ea9
BUG007_PLAN_INPUT_BEFORE_RECONCILIATION=UNCHANGED path=scopes.md blob=f72713219612dbb26689c0e99c13895044d518e1
BUG007_PLAN_INPUT_AT_RECOVERY=UNCHANGED path=test-plan.json blob=9d829df490917da6ea3bb7831cad6ecce2a0d069
BUG007_PLAN_INPUT_BEFORE_RECONCILIATION=UNCHANGED path=scenario-manifest.json blob=d77ade5067dde22894c0bccd875f498ffec12166
BUG007_FINAL_INPUT_IDENTITY=PASS
```

### TP-B007-008 Final Census And Canonical Selftest {#bug007-final-tp-b007-008-20260902}

**Phase:** test
**Executed:** YES
**Command:** exact source-derived registry census over `rlportfolio.js`,
`rlportfoliobrief.js`, and `rlportfolioanalytics.js`
**Exit Code:** 0
**Claim Source:** executed

```text
CENSUS registryMatch=true
CENSUS registeredRows=52
CENSUS registeredUnique=52
CENSUS module=rlportfolio.js quotedCallArguments=281
CENSUS module=rlportfoliobrief.js quotedCallArguments=39
CENSUS module=rlportfolioanalytics.js quotedCallArguments=10
CENSUS emittedUnique=45
CENSUS missing=0
CENSUS inventedNegativeControl=true
CENSUS removedNegativeControl=true
CENSUS removedCode=P008-ACTION-LIFECYCLE
TP_B007_008_CENSUS_ASSERTION=PASS
```

**Phase:** test
**Executed:** YES
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Result:** PASS

```text
# BUG-007 TP-B007-008 final-tree canonical selftest
$ timeout 1800 node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: 9edcca41ba46fafd830053149cc14951316ec89cf8571b27e568b17907a84cad
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
--- omitted 3872 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 74 packet(s), 81 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
  ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
  ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
  ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
  ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3443 passed, 0 failed
================================================
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 9edcca41ba46fafd830053149cc14951316ec89cf8571b27e568b17907a84cad -- timeout 1800 node scripts/selftest.mjs -->

`TP-B007-008` is now earned on the exact final tree. This execution supersedes
only the two current red TP-B007-008 diagnostics above; it does not rewrite
their historical evidence.

### Code Diff Evidence {#bug007-final-code-diff-20260902}

**Phase:** test
**Executed:** YES
**Command:** scoped `git status --short`, `git diff --name-status`, `git diff
--numstat`, `git diff --check`, and staged plus unstaged delivery-input checks
**Exit Code:** 0
**Claim Source:** executed

```text
BUG007_FINALIZATION_CHANGED path=report.md
BUG007_FINALIZATION_CHANGED path=scenario-manifest.json
BUG007_FINALIZATION_CHANGED path=scopes.md
BUG007_FINALIZATION_CHANGED path=state.json
BUG007_FINALIZATION_CHANGED_FILES=4
BUG007_DELIVERY_INPUT_UNCHANGED path=rlportfolio.js
BUG007_DELIVERY_INPUT_UNCHANGED path=rlportfoliobrief.js
BUG007_DELIVERY_INPUT_UNCHANGED path=rlportfolioanalytics.js
BUG007_DELIVERY_INPUT_UNCHANGED path=scripts/selftest.mjs
BUG007_DELIVERY_INPUT_UNCHANGED path=tests/portfolio-brief.functional.mjs
BUG007_DELIVERY_INPUT_UNCHANGED path=tests/portfolio-survival-brief.spec.mjs
BUG007_DELIVERY_INPUT_UNCHANGED path=tests/portfolio-test-integrity.unit.mjs
BUG007_DELIVERY_INPUT_UNCHANGED path=tests/portfolio-defect-injector.cjs
BUG007_DIFF_CHECK=PASS
```

The changed files are exactly this BUG-007 report, its test-owned scenario
evidence links, its individually reconciled DoD checkboxes, and execution-only
state. The already dirty BUG-005 paths and untracked BUG-010 packet remain
present and untouched. No BUG-025 path, parent Feature 008 transaction path,
production source, persistent test, certification field, or human-acceptance
file changed in this finalization.

### Final Non-Certifying Transition {#bug007-final-transition-20260902}

**Phase:** test
**Executed:** YES
**Command:** `timeout 600 bash
.github/bubbles/scripts/state-transition-guard.sh
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 1
**Claim Source:** executed
**Result:** EXPECTED NON-CERTIFYING BLOCK

```text
# BUG-007 final non-certifying transition after diff evidence
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 1
lines: 375
sha256: 4b749417c2c0b947a058b03208da90ed8763d19e054187d5af478f9d37f94cd0
--- first 20 ---
============================================================
  BUBBLES STATE TRANSITION GUARD
  Feature: specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
  Timestamp: 2026-09-02T15:26:12Z
============================================================

--- Check 1: Required Artifacts ---
✅ PASS: Required artifact exists: spec.md
✅ PASS: Required artifact exists: design.md
✅ PASS: Required artifact exists: uservalidation.md
✅ PASS: Required artifact exists: state.json
✅ PASS: Required artifact exists: scopes.md
✅ PASS: Required artifact exists: report.md

--- Check 2: state.json Integrity ---
ℹ️  INFO: Current state.json status: in_progress
ℹ️  INFO: Current workflowMode: bugfix-fastlane

--- Check 2B: workflowMode Consistency ---
✅ PASS: workflowMode consistent across top-level and policySnapshot (bugfix-fastlane)
--- omitted 335 line(s); sha256 above covers the full output ---
--- last 20 ---

🔍 Running project-defined gates from ~/research-lab/.github/bubbles-project.yaml...
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:5fcb2ed359c3ac32730c8faffcc2ded84453780420bb1e92a46f2b308f1636b9
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 33
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 4b749417c2c0b947a058b03208da90ed8763d19e054187d5af478f9d37f94cd0 -- timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys -->

The post-evidence rerun clears G053. The remaining failed gate IDs are G061,
G022, G027, and G090. The remaining failed checks are completion and all-scopes-
done. The detailed plan-shape, phase, receipt, scope, and unchecked-item
conditions remain as listed above except for the removed G053 condition.

### Planner Rework Validation {#bug007-planner-rework-validation-20260902}

**Phase:** plan
**Executed:** YES
**Claim Source:** executed
**Evidence boundary:** These commands validate planner-owned artifact shape,
traceability, scenario obligations, test mechanisms, context fit, capability
proportionality, and the non-certifying transition result. Product test outcomes
remain owned by the test evidence sections above. No certification, scope
completion, Build Quality completion, or terminal status is claimed.

```text
# BUG-007 planner artifact lint
$ timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
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
All checked DoD items in scopes.md have evidence blocks
No unfilled evidence template placeholders in scopes.md
No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 -- timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys -->

```text
# BUG-007 planner traceability
$ timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 0
lines: 68
sha256: 9750b0dc0577d76d9cc41608f1dd634db2333f715a6bdbedc8bd25162166a5e2
--- first 20 ---
BUBBLES TRACEABILITY GUARD
Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
Scenario Manifest Cross-Check (G057/G059)
scenario-manifest.json covers 4 scenario contract(s)
scenario-manifest.json linked test exists: tests/portfolio-brief.functional.mjs
scenario-manifest.json linked test exists: tests/portfolio-test-integrity.unit.mjs
scenario-manifest.json linked test exists: tests/portfolio-survival-brief.spec.mjs
scenario-manifest.json linked test exists: scripts/selftest.mjs
--- omitted 28 line(s); sha256 above covers the full output ---
--- last 20 ---
scopes.md scenario maps to DoD item: SCN-B007-NORMAL-COMPATIBILITY
scopes.md scenario maps to DoD item: SCN-B007-SUBJECT-KEY-SAFETY
scopes.md scenario maps to DoD item: SCN-B007-DOMAIN-KEY-SAFETY
scopes.md scenario maps to DoD item: SCN-B007-MUTATION-MECHANISM-CAUSALITY
DoD fidelity: 4 scenarios checked, 4 mapped to DoD, 0 unmapped
Scenarios checked: 4
Test rows checked: 14
Scenario-to-row mappings: 4
Concrete test file references: 4
Report evidence references: 4
DoD fidelity scenarios: 4 (mapped: 4, unmapped: 0)
RESULT: PASSED (0 warnings)
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 9750b0dc0577d76d9cc41608f1dd634db2333f715a6bdbedc8bd25162166a5e2 -- timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys -->

```text
$ timeout 600 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
[scenario-obligation-lint] OK - 4 scenario(s) with a coherent derived obligation matrix
$ timeout 600 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root .
[test-mechanism-lint] OK - 4 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK - mutationExecution adapter is none (inert)
$ timeout 600 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
[scope-context-fit-lint] OK - all 1 scope(s) are self-contained; a fresh specialist can execute from the durable artifacts.
$ timeout 600 bash .github/bubbles/scripts/capability-foundation-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
capability-foundation-guard: Gate G094 applies: triggerHits=2 concreteImplementationEntries=0
capability-foundation-guard: spec.md contains non-empty Single-Capability Justification
capability-foundation-guard: design.md contains non-empty Single-Implementation Justification
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
```

```text
$ timeout 30 grep -Ein '^- \[(x| )\] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns' scopes.md
332:- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns.
$ timeout 30 grep -Ein '^- \[(x| )\] Rollback or restore path for shared infrastructure changes is documented and verified' scopes.md
338:- [ ] Rollback or restore path for shared infrastructure changes is documented and verified.
$ timeout 30 grep -Ein '^\|.*Canary:' scopes.md
262:| `TP-B007-012` | Canary: Shared-infrastructure independent canary | `unit` | No | ...
$ timeout 30 grep -Ein '^- \[(x| )\] Change Boundary is respected and zero excluded file families were changed' scopes.md
296:- [x] Change Boundary is respected and zero excluded file families were changed.
```

```text
# BUG-007 planner post-edit transition guard
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 1
lines: 375
sha256: fc0492d315118bd9852980a2b33cdf3b5fb36a24d26c6c3aa755dc306efd7235
workflowMode: bugfix-fastlane
targetStatus: done
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 27
exitStatus: 1
verdict: FAIL
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify fc0492d315118bd9852980a2b33cdf3b5fb36a24d26c6c3aa755dc306efd7235 -- timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys -->

The transition remains non-terminal. Relative to the pre-edit capture
(`failureCount: 33`), the six planner-shape diagnostics are gone. The exact
shared-infrastructure canary row, canary DoD, rollback/restore DoD, and standalone
change-boundary DoD regexes all match. Remaining failures are routed to later
delivery-completion and certification owners.

#### Final Routed-State Transition

```text
# BUG-007 final planner transition guard
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 1
lines: 376
sha256: 623dc7724b6f273a8e1e9c23a91eefe0f50716842f6e94bebae7fcb0e0c9fa24
workflowMode: bugfix-fastlane
targetStatus: done
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 28
exitStatus: 1
verdict: FAIL
```

<!-- verify: bash .github/bubbles/scripts/evidence-capture.sh --verify 623dc7724b6f273a8e1e9c23a91eefe0f50716842f6e94bebae7fcb0e0c9fa24 -- timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys -->

The final routed state remains `in_progress`, carries pending route
`BUG-007-ROUTE-011` to `bubbles.harden`, and exposes only the same four
later-owner gate IDs. No terminal transition was attempted or claimed.

### Planner Rework Retry 1 {#bug007-planner-rework-retry-1-20260902}

**Phase:** plan
**Executed:** YES
**Claim Source:** executed
**Evidence boundary:** This retry validates the planner-owned uncertainty,
shared-infrastructure, change-boundary, scenario-linkage, and routing shape. It
does not claim product-test authorship, rollback execution, Build Quality,
certification, scope completion, or terminal status.

```text
$ bash .github/bubbles/scripts/repository-binding.sh validate-packet --session-id vscode-4eb1fe77de39e34760ed144d84aa242e --session-control-file <external-control> --packet-file <exact-inherited-packet>
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-4eb1fe77de39e34760ed144d84aa242e:1 revision=1
$ CMD-B007-PACKET-GUARDS
artifact-lint: Artifact lint PASSED.
traceability-guard: RESULT: PASSED (0 warnings)
scenario-obligation-lint: OK - 4 scenario(s) with a coherent derived obligation matrix
test-mechanism-lint: OK - 4 declared mechanism(s) coherent with their scenario traits
mutation-receipt: OK - mutationExecution adapter is none (inert)
scope-context-fit-lint: OK - all 1 scope(s) are self-contained
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
exit: 0
$ git diff --check -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 0
stdout: empty
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
Check 8C Shared Infrastructure Blast-Radius Planning: PASS
Check 8D Change Boundary Containment: PASS
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 28
exitStatus: 1
verdict: FAIL
```

The retry adds the required Uncertainty Declaration to the intentionally
unchecked rollback/restore item. The pre-routing transition diagnostic proves
the shared-infrastructure and change-boundary findings are absent. G061 was
caused by route `BUG-007-ROUTE-011` using the noncanonical `pending` status; the
planner-owned route is normalized to an `open` same-spec handoff for final
validation. G022, G027, G090, the three unchecked completion items, scope
completion, and one unrelated global stale receipt remain later-owner work.

#### Final Post-Routing Transition

```text
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
transitionRequest BUG-007-ROUTE-011 is open-but-routed to 'bubbles.harden': PASS
Check 8C Shared Infrastructure Blast-Radius Planning: PASS
Check 8D Change Boundary Containment: PASS
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 27
exitStatus: 1
verdict: FAIL
```

Route `BUG-007-ROUTE-011` now passes the current same-spec routing contract.
G061 remains because historical routes `BUG-007-ROUTE-001` through
`BUG-007-ROUTE-010` use `completed`, which the current guard does not accept as
`closed` or `resolved`. Those records belong to their original workflow owners
and are not rewritten by this planner retry.

## Hardening Re-entry Route 011 - 2026-09-02 {#bug007-harden-route-011-20260902}

**Phase:** harden
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** Current product behavior, mutation causality, browser
behavior, packet shape, implementation reality, and persistent-carrier quality
pass their exact commands. The packet is not hardened. The documented
rollback does not apply cleanly on the final tree, the historical two-file
state cannot execute the exact current canary, two plan-authored report lines
make the canonical selftest fail, two commit rows understate their exact
committed paths, and ten historical route statuses remain outside the current
G061 vocabulary.

### Repository Authority And Command Posture

The exact inherited actionable packet validated against the external control
record before any repository-local read. The external control path is not
recorded in this artifact.

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=<repo-root> decision=rb:vscode-4eb1fe77de39e34760ed144d84aa242e:1 revision=1
workflowMode=bugfix-fastlane
scope=01-harden-caller-keyed-brief-aggregation
projectBuild=node scripts/build-pages-site.mjs
projectLint=not-declared
projectFormat=not-declared
projectTypecheck=not-declared
browserRunner=npx --no-install playwright
browserVersion=1.61.1
systemBrowserProject=system-chrome
repositoryCli=none
```

### Baseline And Current Execution

| Check | Current result | Evidence |
| --- | --- | --- |
| Pages artifact build | PASS | exit 0; `pages-site-build-result/v1`; 29 registered pages; sha256 `e8f3e909076799aee06e386be1092e9e344b90aa5060905c10cec77bbcad90e3` |
| Focused functional | PASS | 34/34; five BUG-007 titles and parent error title visible; sha256 `670a28ccb0ceb58afac428f6b72fe93c7aa1d904d410ae4276c6d6fc89c7359d` |
| Exact `TP-B007-012` current canary | PASS | named title executed 1/1 after rollback-probe restoration |
| Scenario browser | PASS | 19/19 under Playwright 1.61.1 system Chrome; sha256 `687de0f720858ae40314c1ffc1ea09fc4fdf46f7285d14c75baad9f0e48c5272` |
| Eight-file Feature 008 browser | PASS | 95/95; sha256 `6769a95cdc546e0a91a810da8ce0fb702c0a5664ebfef2884a1a242a1d28f842` |
| Canonical selftest | FAIL | 3442 pass, 1 fail; PII guard; sha256 `3f4fab569ca700819eb768cf9300e738a24eecef5eeecba1973cec06957508b0` |
| Six packet guards | PASS | artifact, traceability, scenario obligation, mechanism, context fit, and G094 all exit 0 |
| Implementation reality | PASS | 6 files, 0 violations, 0 warnings; sha256 `f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83` |
| Regression quality | PASS | ordinary and `--bugfix`; 3 files; 3 adversarial signals; 0 violations; 0 warnings |
| Scenario identity resolution | PASS | 17 references resolved; no test-discovery adapter configured |
| Transition diagnostic | FAIL as non-certifying | 27 failures; gates G061, G022, G027, G090; sha256 `5e68f7998cbe9b1deb838713a7e94b15513e279d9e07fa558f58b96004ed8e6e` |

The exact focused execution directly exposed every required BUG-007 title:

```text
BUG-007: normal brief order and refusal precedence remain unchanged
BUG-007: prototype-sensitive completion keys are safe own keys
BUG-007: prototype-sensitive completion subjects are safe own keys
BUG-007: prototype-sensitive completion domains are safe own keys
BUG-007: own lookup semantics and RED cleanup preserve shared built-ins
SCN-008-046 every public boundary emits a closed value-safe PortfolioError
tests 34
pass 34
fail 0
skipped 0
todo 0
```

The current canary executed the exact selected title after the isolated probe
was fully restored:

```text
$ timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs
BUG-007: represented mutants execute one protective assertion through one intended hook
tests 1
suites 0
pass 1
fail 0
cancelled 0
skipped 0
todo 0
duration_ms 1686.186423
```

The browser carrier exercised the six exported cases and production controls,
and the broader matrix retained every declared Feature 008 browser carrier:

```text
Playwright version=1.61.1
scenario-browser tests=19 pass=19 fail=0
BUG-007 browser title=passed
visible constructor path=passed
uncaught page errors=0
Feature-008 matrix tests=95 pass=95 fail=0
workers=2
project=system-chrome
request interception declarations=0
required bailout patterns=0
```

### Rollback And Restore Probe {#harden-b007-rollback-restore-001}

**Finding ID:** `HARDEN-B007-ROLLBACK-RESTORE-001`
**Severity:** blocker
**Owners:** `bubbles.design`, then `bubbles.plan`
**Claim Source:** executed

The documented inverse was attempted only in a local disposable clone at the
same HEAD as the operator checkout. It does not apply as one clean two-file
unit on the final tree. Git changes the injector and conflicts in the integrity
carrier. Aborting the revert succeeds and restores all five pinned hashes.

```text
$ git revert --no-commit 82d1db5e5819738aa4f5049ebe7078514408620c
Auto-merging tests/portfolio-test-integrity.unit.mjs
CONFLICT (content): Merge conflict in tests/portfolio-test-integrity.unit.mjs
error: could not revert 82d1db5e5... test(BUG-007): prove mutation failure causality
ROLLBACK_REVERT_EXIT=1
M  tests/portfolio-defect-injector.cjs
UU tests/portfolio-test-integrity.unit.mjs
tests/portfolio-test-integrity.unit.mjs
$ git revert --abort
ROLLBACK_ABORT_EXIT=0
```

The pre-probe and post-abort bytes match in both the clone and operator tree:

```text
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
clone status after abort=clean
operator scoped status=clean
later error-contract bytes changed during probe=no
operator worktree mutation during probe=no
```

Checking out the two parent blobs proves a different fact, not the documented
one-commit rollback. It changes exactly two paths and preserves all three later
error-contract hashes, but it removes 1,841 lines of later integrity-carrier
work. The exact `TP-B007-012` title is absent. Node's exact selector exits zero
with a file-level result, so that apparent pass is vacuous. The legacy title
passes 1/1 and therefore cannot substitute for the strengthened causal canary.

```text
M  tests/portfolio-defect-injector.cjs
M  tests/portfolio-test-integrity.unit.mjs
tests/portfolio-defect-injector.cjs     |   51 +-
tests/portfolio-test-integrity.unit.mjs | 1841 +------------------------------
2 files changed, 48 insertions(+), 1844 deletions(-)
TP_B007_012_EXACT_TITLE_GREP_EXIT=1
exact selector result=tests/portfolio-test-integrity.unit.mjs
exact selector tests=1 pass=1 fail=0
legacy title=BUG-007: caller-key protections and normal ordering are load-bearing in memory
legacy title tests=1 pass=1 fail=0
historical checkout is a valid final-tree rollback proof=false
```

The current rollback/restore DoD must remain unchecked. Design must define a
final-tree-safe inverse that preserves later changes. Plan must replace the
current clean-revert premise and add a non-vacuity assertion requiring the
exact canary title to be collected before a reverted-state result can count.

### Canonical Selftest Regression {#harden-b007-pii-evidence-001}

**Finding ID:** `HARDEN-B007-PII-EVIDENCE-001`
**Severity:** blocker
**Owners:** `bubbles.plan`, then `bubbles.test`
**Claim Source:** executed

The canonical selftest currently fails one of 3,443 checks. The standalone PII
scanner identifies two home-path findings in plan-authored evidence inside this
BUG-007 report. The scanner withholds the matched value, and this section does
not reproduce it.

```text
# BUG-007 ROUTE-011 harden canonical selftest
exit: 1
lines: 3918
sha256: 3f4fab569ca700819eb768cf9300e738a24eecef5eeecba1973cec06957508b0
FAIL: committed surface carries no personal identifier
Research-Lab self-test: 3442 passed, 1 failed
[pii-scan] report.md:3563:10 rule=home-path length=13
[pii-scan] report.md:3674:70 rule=home-path length=13
[pii-scan] files=10774 messages=2554 findings=2 FAIL
[pii-scan] The matched text is withheld on purpose
```

The checked `TP-B007-008` claim is false for the current artifact bytes. The
plan author must normalize only its two cited evidence lines without changing
their command result, then `bubbles.test` must rerun the canonical selftest and
reconcile the checkbox evidence. Hardening does not rewrite foreign evidence
or alter the checked item.

### Exact Commit Boundary Drift {#harden-b007-change-boundary-001}

**Finding ID:** `HARDEN-B007-CHANGE-BOUNDARY-001`
**Severity:** warn
**Owner:** `bubbles.plan`
**Claim Source:** executed

The Change Boundary table labels each row `Exact committed surfaces`, but the
first two rows list only implementation or persistent-test paths. Their commits
also changed this BUG-007 report and state. The other three rows match their
actual changed paths.

```text
aad6fb52ebdafe5258ac77c74653c3b93770a4b5 test(008): add BUG-007 prototype-key RED
M report.md
M state.json
M tests/portfolio-brief.functional.mjs
M tests/portfolio-survival-brief.spec.mjs
M tests/portfolio-test-integrity.unit.mjs
d49a2955b543433fc1fd502c1e346e3fd2888e11 fix(008): harden brief caller keys
M rlportfoliobrief.js
M report.md
M state.json
82d1db5e5 exact paths=tests/portfolio-defect-injector.cjs,tests/portfolio-test-integrity.unit.mjs
3688388d5 exact paths=rlportfolio.js,rlportfoliobrief.js,tests/portfolio-brief.functional.mjs
4c9f2e87b exact paths=scripts/selftest.mjs
```

Plan must either include the two control-plane files in those rows or narrow
the table label to the implementation/test subset. The existing checked Change
Boundary item is not changed by this diagnostic phase.

### G061 Historical Route Vocabulary {#harden-b007-g061-history-001}

**Finding ID:** `HARDEN-B007-G061-HISTORY-001`
**Severity:** blocker
**Owner:** `bubbles.validate`
**Claim Source:** executed

The current G061 implementation accepts terminal statuses `closed`,
`resolved`, `done`, `cancelled`, and `rejected`, plus a fully routed same-spec
`open` entry. Route 011 satisfies the open-route allowance. Routes 001 through
010 each use `completed`, which the guard classifies as invalid. This phase
does not rewrite those foreign historical records.

```text
BUG-007-ROUTE-001 status=completed classification=invalid from=bubbles.bug to=bubbles.design
BUG-007-ROUTE-002 status=completed classification=invalid from=bubbles.design to=bubbles.plan
BUG-007-ROUTE-003 status=completed classification=invalid from=bubbles.plan to=bubbles.test
BUG-007-ROUTE-004 status=completed classification=invalid from=bubbles.test to=bubbles.implement
BUG-007-ROUTE-005 status=completed classification=invalid from=bubbles.implement to=bubbles.test
BUG-007-ROUTE-006 status=completed classification=invalid from=bubbles.test to=bubbles.regression
BUG-007-ROUTE-007 status=completed classification=invalid from=bubbles.regression to=bubbles.simplify
BUG-007-ROUTE-008 status=completed classification=invalid from=bubbles.simplify to=bubbles.gaps
BUG-007-ROUTE-009 status=completed classification=invalid from=bubbles.gaps to=bubbles.harden
BUG-007-ROUTE-010 status=completed classification=invalid from=bubbles.harden to=bubbles.plan
BUG-007-ROUTE-011 status=open classification=open-routed from=bubbles.plan to=bubbles.harden
G061_ROUTE_COUNTS total=11 invalid=10 open=1 terminal=0
```

Validate owns state-control reconciliation and must either normalize the ten
historical status values with explicit resolution metadata or record a
mechanically accepted migration that preserves their original authorship.

### Scenario, Test Plan, And DoD Audit

**Phase:** harden
**Executed:** YES
**Claim Source:** executed

```text
TRACEABILITY_GUARD_COUNTED_ROWS=14
TEST_PLAN_DATA_ROWS=13
TEST_PLAN_UNIQUE_IDS=13
JSON_UNIQUE_IDS=13
DOD_PARITY_UNIQUE_IDS=13
PLAN_IDENTITY=true
GHERKIN_SCENARIOS=4
MANIFEST_SCENARIOS=4
SCENARIO_IDENTITY=true
DOD_TOTAL=18
DOD_CHECKED=15
DOD_UNCHECKED=3
UNCERTAINTY_DECLARATIONS=3
```

The requested 14-row guard count and the 13 semantic plan IDs are both true:
the traceability parser counts one additional structural table row. Markdown,
JSON, and DoD parity carry the same 13 unique IDs. The four Gherkin scenarios
match the four manifest scenarios. All 17 current linked test references
resolve. Cross-scope duplication is not applicable because this packet has one
scope.

The three unchecked items remain rollback/restore, `TP-B007-011`, and Build
Quality. Each has an Uncertainty Declaration. Scope 1 remains `Not Started`.
This phase does not check an item, change scope status, certify, or mark the bug
terminal.

### Test Compliance And Source Integrity

**Phase:** harden
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** Manual assertion tracing and the executed guards agree.
Functional tests assert exact returned values, mutation and cleanup. The browser
test invokes the real page export and production preview/confirm controls,
asserts visible output and zero page errors, and uses no request interception.
The mutation carrier requires an exact selected title, one intended hook, one
marker application, one `ERR_ASSERTION`, no infrastructure-error signature,
double-application refusal, and direct-text parity.

```text
regression-quality ordinary violations=0 warnings=0 files=3
regression-quality bugfix violations=0 warnings=0 adversarial-files=3
scenario-test-resolve references=17 unresolved=0
executable skip declarations=0
skip-like fixture literals=1
live interception declarations=0
required bailout patterns=0
node syntax checks=8 pass=8 fail=0
implementation reality files=6 violations=0 warnings=0
source/test scoped Git status=clean
current injector sha256=6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0
current integrity carrier sha256=77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e
```

The one skip-like token is fixture text that changes a synthetic test
declaration to `test.skip(...)` and proves the scope-claim verifier rejects a
filtered-out title. It is not an executable skip in the carrier.

### Hardening Profile Verdict

| Harden check | Result |
| --- | --- |
| H1 Findings classified with evidence | PASS |
| H2 Fixes verified | FAIL - four foreign-owned findings remain |
| H3 Required artifact updates made | PASS - this hardening section and execution route carry every finding |
| H4 Test taxonomy completeness | PASS - functional, unit mutation, live browser, repository, artifact, and guard proofs match the declared static-module/UI traits |
| H5 Gherkin-to-test semantic fidelity | PASS |
| H6 Repo-realistic test paths | PASS |
| H7 Regression coverage quality | FAIL - the rollback canary premise is not executable or non-vacuous in the historical state |
| H8 Cross-scope test deduplication | PASS - one scope |
| H9 `test-plan.json` sync | PASS - 13 unique IDs agree across all three plan surfaces |

**Hardening verdict:** `NOT_HARDENED`.

Route 011 is consumed by this exhaustive pass, but harden is not added to
`completedPhaseClaims`. The remediation chain is `bubbles.design` for the
final-tree-safe rollback design, `bubbles.plan` for scopes/report/boundary
reconciliation, `bubbles.test` for the current canonical selftest, and
`bubbles.validate` for historical route-state reconciliation. A clean harden
rerun is required before the normal next registered phase,
`bubbles.stabilize`, can begin.

## Planner Route 013 Remediation - 2026-09-02 {#bug007-planner-route-013-remediation-20260902}

**Phase:** plan
**Executed:** YES
**Claim Source:** executed
**Evidence boundary:** This section proves planner artifact reconciliation,
PII clearance, exact commit-path accounting, and repository validation. It does
not claim execution of the `TP-B007-012` semantic inverse. The rollback and
restore DoD remains unchecked for independent `bubbles.test` execution.

### Exact Commit Boundary Receipt

The repository history reports these exact changed paths:

```text
$ timeout 60 git diff-tree --no-commit-id --name-status -r 82d1db5e5819738aa4f5049ebe7078514408620c
M       tests/portfolio-defect-injector.cjs
M       tests/portfolio-test-integrity.unit.mjs
$ timeout 60 git diff-tree --no-commit-id --name-status -r 3688388d5af8012e6adfad769c68c4c1034eab6d
M       rlportfolio.js
M       rlportfoliobrief.js
M       tests/portfolio-brief.functional.mjs
$ timeout 60 git diff-tree --no-commit-id --name-status -r aad6fb52ebdafe5258ac77c74653c3b93770a4b5
M       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
M       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
M       tests/portfolio-brief.functional.mjs
M       tests/portfolio-survival-brief.spec.mjs
M       tests/portfolio-test-integrity.unit.mjs
$ timeout 60 git diff-tree --no-commit-id --name-status -r d49a2955b543433fc1fd502c1e346e3fd2888e11
M       rlportfoliobrief.js
M       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
M       specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
exit: 0
```

The corrected Change Boundary rows now include both planner control files for
`aad6fb52e` and `d49a2955b`. The `82d1db5e5` and `3688388d5` rows remain
unchanged because their existing path sets match the history receipt.

### PII And Canonical Selftest

```text
$ timeout 600 node scripts/pii-scan.mjs
[pii-scan] files=10774 messages=2554 findings=0 OK
exit: 0
```

```text
# BUG-007 route 013 canonical selftest after PII remediation
$ timeout 1800 node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: b7fc5e262d027101ee53d1fc08407bd278408127479293328a7d05bea9064be9
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
--- omitted 3872 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (95 claim(s) across 74 packet(s), 81 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 95 claim(s))
  ✓ SCN-011B-REG the regression matcher found at least one test declaration in tests/causal-rotation-consumers.spec.mjs — a matcher that silently stopped matching would pass this whole block vacuously (5 found)
  ✓ SCN-011B-REG every test in tests/causal-rotation-consumers.spec.mjs declares its own timeout budget, so none of them silently inherits the 30 s Playwright default that produced the intermittent red (5 budget(s) for 5 test(s))
  ✓ SCN-011B-REG every declared budget in tests/causal-rotation-consumers.spec.mjs clears the 60000 ms floor — the measured single-worker cost is 23.7 s, so anything at or near the 30 s default leaves no margin for four-worker contention (0 below floor of 5)
  ✓ SCN-011B-REG ADVERSARIAL the budget matcher detects a removed declaration, so a real regression that deletes one would turn this block red rather than leaving it green (5 → 4 after stripping one)

================================================
Research-Lab self-test: 3443 passed, 0 failed
================================================
```

The two cited planner-authored roots now use `~/research-lab`. The scan reports
zero findings, and the canonical selftest reports 3,443 passes and zero
failures on the corrected bytes.

### Structured Plan And Guard Results

```text
$ timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
Artifact lint PASSED.
$ timeout 600 bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
Scenarios checked: 4
Test rows checked: 14
DoD fidelity scenarios: 4 (mapped: 4, unmapped: 0)
RESULT: PASSED (0 warnings)
$ timeout 600 bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
[scenario-obligation-lint] OK - 4 scenario(s) with a coherent derived obligation matrix
$ timeout 600 bash .github/bubbles/scripts/test-mechanism-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --repo-root .
[test-mechanism-lint] OK - 4 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK - mutationExecution adapter is none (inert)
$ timeout 600 bash .github/bubbles/scripts/scope-context-fit-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
[scope-context-fit-lint] OK - all 1 scope(s) are self-contained
$ timeout 600 bash .github/bubbles/scripts/capability-foundation-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
exit: 0
```

The synchronized artifacts retain four scenarios and thirteen semantic Test
Plan identities. The traceability parser reports fourteen table rows. The
`TP-B007-012` current canary remains test-owned and passed in prior evidence.
Its semantic-inverse rollback and restore proof remains `planned-not-executed`.

## Test Route 014 - TP-B007-012 Rollback And Restore - 2026-09-02 {#bug007-shared-infrastructure-rollback-restore}

**Phase:** test
**Executed:** YES
**Claim Source:** executed
**Evidence boundary:** This section records independent `bubbles.test`
execution on the candidate revision. It does not change planner-owned scope
text, human acceptance, certification, scope status, top-level status, product
source, persistent tests, sibling bugs, or parent Feature 008 artifacts.

### Repository And Operator Baseline

**Phase:** test
**Executed:** YES
**Command:** `timeout 60 git rev-parse HEAD`; `timeout 60 git status --short
--untracked-files=all`; value-safe SHA-256 over that complete status output;
`timeout 60 git diff --cached --name-only`; `timeout 60 sha256sum
tests/portfolio-defect-injector.cjs tests/portfolio-test-integrity.unit.mjs
rlportfolio.js rlportfoliobrief.js tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
operator_head=22bd024068fd021c9ae6893ffd503bdb13a96a23
operator_dirty_inventory_sha256=0af89401b15c6c64d98b6b67e24314f3ba50e80079e6abadf8ce318d71d537ef
 M rlexperience-adapters/strategy-research.js
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/bug.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scenario-manifest.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/state.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/design.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scenario-manifest.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/test-plan.json
 M tests/distributed-briefs-read-adapters.integration.mjs
 M tests/distributed-briefs.final.integration.mjs
 M tests/simple-model-adapters-strategy-property.unit.mjs
 M tests/simple-model-adapters.integration.mjs
 M tests/simple-production-bridge.integration.mjs
 M tools.json
?? .github/bubbles-project/proposals/20260902-g090-convergence-summary-counted-as-snapshot.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-005-stale-domain-interest-signal-crash/test-plan.json
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/bug.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/design.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/report.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/scenario-manifest.json
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/scopes.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/spec.md
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/state.json
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/test-plan.json
?? specs/008-portfolio-survival-and-brief-lab/bugs/BUG-010-persisted-interest-signal-wiring/uservalidation.md
operator_index_empty=PASS
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
```

The five controlled hashes equal the design epoch. The operator index was
empty. The complete dirty-path inventory was hashed before the corrected
disposable proof began.

### Clean Disposable Baseline And Current Canary

**Phase:** test
**Executed:** YES
**Command:** `timeout 120 git clone --no-hardlinks --no-checkout
<operator-checkout> /tmp/research-lab-bug007-route014`; `timeout 60 git checkout
--detach 22bd024068fd021c9ae6893ffd503bdb13a96a23`; clean status, index, five-hash,
and exact-title checks; `timeout 300 bash
.github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 route 014 durable
TP-B007-012 pre-inverse current canary' -- timeout 240 node --test
--test-name-pattern='^BUG-007: represented mutants execute one protective
assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
HEAD is now at 22bd02406 docs: complete merged planning packets and scrub local paths
disposable_status_clean=PASS
disposable_index_empty=PASS
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
exact_title_count=1
# BUG-007 route 014 durable TP-B007-012 pre-inverse current canary
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: 3fa8f41da9a7a95e1aa9e8aa83b707060ce3b327c853c515ebb62526707dfcfc
✔ BUG-007: represented mutants execute one protective assertion through one intended hook (2344.110866ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2440.882335
```

### Injector-Only Semantic Inverse And Expected Detection

**Phase:** test
**Executed:** YES
**Command:** editor-applied exact injector-only semantic inverse from
`design.md#final-tree-safe-rollback-and-restore-contract`; `timeout 300 bash
.github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 route 014 durable
TP-B007-012 semantic-inverse expected failure' -- timeout 240 node --test
--test-name-pattern='^BUG-007: represented mutants execute one protective
assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 1, expected old-state detection
**Claim Source:** executed

```text
# BUG-007 route 014 durable TP-B007-012 semantic-inverse expected failure
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 1
lines: 47
sha256: 4422dcd06419e3b4cdc1dfcbc27399501684fc89307c01c7c650dce4d78b3363
✖ BUG-007: represented mutants execute one protective assertion through one intended hook (1379.450656ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1462.286356
✖ failing tests:
test at tests/portfolio-test-integrity.unit.mjs:2194:1
AssertionError [ERR_ASSERTION]: BUG-007 protections that are not load-bearing:
BUG-007-NULL-PROTOTYPE-MAP: marker named hook readFileSync, expected Module._compile;
mutant output contains forbidden infrastructure failure: error:
'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'
BUG-007-OWN-OWNER-LOOKUP: marker named hook readFileSync, expected Module._compile;
mutant output contains forbidden infrastructure failure: error:
'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'
BUG-007-NORMAL-LANE-ORDER: marker named hook readFileSync, expected Module._compile;
mutant output contains forbidden infrastructure failure: error:
'portfolio-defect-injector: anchor must occur exactly once in rlportfoliobrief.js (found 0) — a defect that cannot be represented is not a proof'
DOUBLE-APPLICATION-CONTROL: observed hooks ["readFileSync"], expected ["fs.readFileSync","Module._compile"]
DIRECT-TEXT-CONTROL: marker named hook readFileSync, expected fs.readFileSync
```

The intentionally reverted process collected exactly the unchanged title,
passed zero, failed one, skipped zero, and exposed the specified old dual-hook
zero-anchor infrastructure diagnostic. This is expected-failure evidence, not
a current-tree passing claim.

### Inverse Containment, Exact Restore, And Restored Canary

**Phase:** test
**Executed:** YES
**Command:** `timeout 60 git diff --name-only`; `timeout 60 git diff --cached
--name-only`; exact five-hash and title checks; editor restore of only
`tests/portfolio-defect-injector.cjs`; exact five-hash, scoped diff, index, and
status checks; restored exact-title selector through evidence capture
**Exit Code:** 0
**Claim Source:** executed

```text
changed_paths=tests/portfolio-defect-injector.cjs
inverse_diff_scope=injector-only
inverse_index_empty=PASS
3490418acab795d5f60b44d441d8ebe75aae85b04c3e7aab2559c4ef5d5c9aba  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
exact_title_count=1
integrity_carrier_byte_identity=PASS
error_contract_three_path_byte_identity=PASS
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
restored_index_empty=PASS
restored_status_clean=PASS
exact_title_count=1
restored_all_five_hashes=PASS
restored_scoped_diff=PASS
# BUG-007 route 014 durable TP-B007-012 restored current canary
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: 76bddacccad67dddbb5f5886a699246e9520b62251a03ff18ed3caddefffff35
✔ BUG-007: represented mutants execute one protective assertion through one intended hook (1562.037336ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1652.046054
```

### Disposable Removal And Operator Identity

**Phase:** test
**Executed:** YES
**Command:** `timeout 60 rm -rf /tmp/research-lab-bug007-route014`; residue,
complete operator-status digest, index, and five-hash comparisons
**Exit Code:** 0
**Claim Source:** executed

```text
disposable_residue_absent=PASS
operator_dirty_inventory_sha256=0af89401b15c6c64d98b6b67e24314f3ba50e80079e6abadf8ce318d71d537ef
operator_dirty_inventory_unchanged=PASS
operator_index_unchanged_empty=PASS
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
```

The complete pre-proof and post-proof dirty-inventory digests are equal. The
operator index remained empty, every controlled path retained its baseline
hash, and the disposable directory is absent.

### Current Functional, Canary, And Browser Regression

**Phase:** test
**Executed:** YES
**Commands:** exact `CMD-B007-FOCUSED`, `CMD-B007-SHARED-INFRA-CANARY`,
`CMD-B007-BRIEF-E2E`, and `CMD-B007-FEATURE-E2E` commands from `test-plan.json`
**Exit Code:** 0 for every current-tree command
**Claim Source:** executed

```text
focused command: timeout 240 node --test tests/portfolio-brief.functional.mjs
focused exit: 0
focused lines: 42
focused sha256: 03fa851ca32aee338c60935fe9af46e0e40f9f75157cd868824aaf6c9254b794
focused tests=34 pass=34 fail=0 cancelled=0 skipped=0 todo=0
exact canary command: timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exact canary exit: 0
exact canary lines: 9
exact canary sha256: 18c910829dc93f238d8039e090da31387e8015aa784ea62d38ad012dd42307ca
exact canary tests=1 pass=1 fail=0 cancelled=0 skipped=0 todo=0
scenario browser command: timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
scenario browser exit: 0
scenario browser lines: 67
scenario browser sha256: c6836c902d3cf8ccb6ead90be26543dd0a1b29941cc30f86818be641aa508f2e
scenario browser: Running 19 tests using 1 worker
scenario browser: BUG-007: browser composer treats hostile keys as data and visible constructor remains operable PASS
scenario browser: 19 passed (33.0s)
feature browser command: timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
feature browser exit: 0
feature browser lines: 305
feature browser sha256: 6e1431fe50094ef38390163eb91efce5655e05ccbd887840f4a79814dafd9fa9
feature browser: Running 95 tests using 2 workers
feature browser: 95 passed (2.1m)
```

The eight-file matrix was rerun rather than inherited. All eight exact inputs
from `CMD-B007-FEATURE-E2E` participated in the current 95-of-95 receipt.

### Canonical Selftest, PII, And Test Integrity

**Phase:** test
**Executed:** YES
**Commands:** `timeout 1800 node scripts/selftest.mjs`; `timeout 600 node
scripts/pii-scan.mjs`; ordinary and `--bugfix` regression-quality guards;
scenario resolution; executable skip-declaration and live-interception scans
**Exit Code:** 0 for every final command
**Claim Source:** executed

```text
selftest exit: 0
selftest lines: 3912
selftest sha256: 544ba27fc035d666e09103dc092685d358b936151e31870bc2fcf82de60984a5
Research-Lab self-test: 3443 passed, 0 failed
[pii-scan] files=10774 messages=2554 findings=0 OK
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 3
Files with adversarial signals: 3
[scenario-test-resolve] OK — 17 reference(s) resolved via literal-scan; 17 category comparison(s) not applicable (no test-discovery adapter declared)
executable_skip_declaration_scan=PASS matches=0 files=3
tests/portfolio-test-integrity.unit.mjs:1492: mutateTestSource(... test.skip(...))
live_interception_scan=PASS matches=0 files=1
```

The sole `test.skip` text is input to the scope-claim mutation verifier. The
anchored executable-declaration scan found zero active skip, only, or todo
declarations. Manual assertion tracing found no self-validating required test:
the functional carrier asserts composition, own/inherited lookup, ordering,
built-in integrity, and cleanup produced by the composer; the browser carrier
asserts the exported browser composer and real visible controls; the mutation
carrier perturbs the injector path and requires assertion-origin failure plus
tracked-byte identity.

### Reality And Packet Guards

**Phase:** test
**Executed:** YES
**Commands:** exact `CMD-B007-IMPLEMENTATION-REALITY` and all six children of
`CMD-B007-PACKET-GUARDS`
**Exit Code:** 0 for every command
**Claim Source:** executed

```text
implementation-reality exit: 0
implementation-reality lines: 35
implementation-reality sha256: f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
Files scanned: 6
Violations: 0
Warnings: 0
PASSED: No source code reality violations detected
artifact-lint exit: 0
artifact-lint lines: 40
artifact-lint sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Artifact lint PASSED.
traceability-guard exit: 0
traceability-guard lines: 68
traceability-guard sha256: f2a9782cdeedc201cdced0e7664ab3a6fd181112f386d1977595a8588f3e742d
Scenarios checked: 4
Test rows checked: 14
DoD fidelity scenarios: 4 (mapped: 4, unmapped: 0)
RESULT: PASSED (0 warnings)
[scenario-obligation-lint] OK — 4 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK — 4 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained (no chat/session-replay dependency); a fresh specialist can execute from the durable artifacts.
capability-foundation-guard: Gate G094 applies: triggerHits=2 concreteImplementationEntries=0
capability-foundation-guard: spec.md contains non-empty Single-Capability Justification
capability-foundation-guard: design.md contains non-empty Single-Implementation Justification
capability-foundation-guard: UX primitive check not applicable: screenCount=0 uiReuseHits=0
capability-foundation-guard: PASS Gate G094 - capability foundation requirements satisfied
```

`TP-B007-012` is independently executed and passes its complete current GREEN,
expected reverted-state detection, protected-byte preservation, byte-identical
restore, restored GREEN, and unchanged-operator-worktree sequence. The
repository ownership registry grants `bubbles.test` report evidence,
scenario-manifest evidence-link, and execution-state updates, but grants
`scopes.md` execution updates only to `bubbles.implement`. Therefore this test
run does not alter the planner-owned rollback/restore checkbox or its text.

## Planner Route 015 Rollback Evidence Reconciliation - 2026-09-02 {#bug007-planner-route-015-reconciliation-20260902}

**Phase:** plan
**Executed:** YES
**Claim Source:** executed
**Evidence boundary:** This section records planner-owned artifact and routing
validation only. The rollback sequence and product-test results remain owned by
the `bubbles.test` evidence at
`report.md#bug007-shared-infrastructure-rollback-restore`.

The planner consumed that durable evidence to check only the rollback or
restore DoD, remove its resolved Uncertainty Declaration, reconcile
`TP-B007-012` rollback/restore metadata and scenario linkage to
`executed-passed`, resolve route 015, and open route 016 to `bubbles.harden`.
It did not execute or claim the product tests.

```text
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 result=PASSED
traceability-guard exit=0 lines=68 sha256=97dc7b5faf914d6b1d90f698810a18638678f4dcbb573847d0ae8b785f1133b0 result=PASSED scenarios=4 rows=14 warnings=0
scenario-obligation-lint exit=0 scenarios=4 result=OK
test-mechanism-lint exit=0 mechanisms=4 mutation-adapter=none result=OK
scope-context-fit-lint exit=0 scopes=1 result=OK
capability-foundation-guard exit=0 gate=G094 result=PASS
pii-scan exit=0 files=10774 messages=2554 findings=0
scoped-diff-check exit=0 result=PASS
index-empty exit=0 result=PASS
protected-hash injector=6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0
protected-hash integrity-carrier=77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e
protected-hash rlportfolio=ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0
protected-hash rlportfoliobrief=2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30
protected-hash functional-carrier=875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124
non-certifying-transition exit=1 lines=378 sha256=be88e582f2e2ee0c209b3783fadf5a97d081a2e48edbfe1a940b02f2e1aa6293
non-certifying-transition passedGateIds=G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136
non-certifying-transition failedGateIds=G061,G022,G027,G090 verdict=FAIL expected-nonterminal
```

`TP-B007-011` and Build Quality remain unchecked. Scope 01 remains Not
Started. Top-level and certification status remain `in_progress`. Human
acceptance, source, persistent tests, design, sibling bugs, parent Feature 008,
and historical route vocabulary remain unchanged. The remaining
`HARDEN-B007-G061-HISTORY-001` finding stays routed to `bubbles.validate`.

## Hardening Route 016 - Current Packet Re-entry - 2026-09-02 {#bug007-harden-route-016-20260902}

**Phase:** harden
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** Current source, persistent tests, rollback evidence, build,
browser behavior, registered test categories, packet guards, implementation
reality, and regression quality are clean. The packet is not hardened because
active planner-owned lifecycle text contradicts the executed `TP-B007-012`
state and `scenario-manifest.json` repeats one object key. Both new findings
require planner reconciliation before hardening can advance.

### Repository Binding And Current Epoch

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=<repo-root> decision=rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:1 revision=1
HEAD=22bd024068fd021c9ae6893ffd503bdb13a96a23
index_empty=PASS
exact_tp_b007_012_title_count=1
controlled_hash_injector=6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0
controlled_hash_integrity=77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e
controlled_hash_rlportfolio=ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0
controlled_hash_rlportfoliobrief=2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30
controlled_hash_functional=875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124
post_execution_controlled_hashes_unchanged=PASS
```

The five controlled hashes are identical to the executed rollback/restore
epoch at [the test-owned proof](#bug007-shared-infrastructure-rollback-restore).
The rollback DoD reference therefore resolves to the same source and oracle
bytes that produced current GREEN, expected old-state detection, exact restore,
and restored GREEN.

### Exhaustive Current Execution

**Phase:** harden
**Executed:** YES
**Claim Source:** executed

```text
pages_build exit=0 lines=1 sha256=e8f3e909076799aee06e386be1092e9e344b90aa5060905c10cec77bbcad90e3 registeredPages=29
focused_functional exit=0 lines=42 sha256=ae6c2b2c4981adf156951e7998669396976349029c5162c849fb55b94a987098 tests=34 pass=34 fail=0 skipped=0
tp_b007_012_canary exit=0 lines=9 sha256=3798262e9cf1dded482a62b3a5dd922d252491af3960909d2a032d4dc58f2174 tests=1 pass=1 fail=0 skipped=0
playwright_version=1.61.1
node_source_lock exit=0 adversarial=16 unexpectedAcceptances=0
scenario_browser exit=0 lines=67 sha256=342798915381e64a927f2a8a3b7c231835dc54437a30f21fae07672dc15cfcda tests=19 pass=19 fail=0
feature_008_browser exit=0 lines=305 sha256=0500d149aaf35b06c7e4f41a35e902bed4c2902b2b56baf8930f48127fa89df7 tests=95 pass=95 fail=0
canonical_selftest exit=0 lines=3912 sha256=a98496a46fc57260cb5145a651575bd63367a132940679b2a2bb0374e2d8d218 checks=3443 pass=3443 fail=0
pii_scan exit=0 files=10774 messages=2554 findings=0
registered_unit exit=0 lines=676 sha256=1bdd0760ce7652616004dbea5d9f8649c900b4c86e23e110f678e2e7cfc997d6 tests=666 pass=666 fail=0 skipped=0
registered_integration exit=0 lines=62 sha256=5a84c13d86d92bdc710b08f9a62f3bd8f0088e8b0d92640265afee3003419b03 tests=37 pass=37 fail=0 skipped=0
registered_security exit=0 lines=27 sha256=1d1df3c95f7c5281731e04e4cf4f0f38dad3501a9626c530dfab0eab208a6a24 tests=19 pass=19 fail=0 skipped=0
registered_load exit=0 lines=33 sha256=02d26769c7eef37b634ece2d8e1906f45c20c09091fa96bf1158e00a647e739a tests=2 pass=2 fail=0 skipped=0
registered_stress exit=0 lines=50 sha256=b88860c29676da9170f17ba6bdb8a1ed11f29672938a8155fe33b24e2e41e9ad tests=9 pass=9 fail=0 skipped=0
artifact_lint exit=0 result=PASSED
traceability_guard exit=0 scenarios=4 rows=14 warnings=0
scenario_obligation_lint exit=0 scenarios=4
test_mechanism_lint exit=0 mechanisms=4
scope_context_fit exit=0 scopes=1
capability_foundation_guard exit=0 gate=G094
implementation_reality exit=0 lines=35 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83 files=6 violations=0 warnings=0
regression_quality exit=0 mode=ordinary files=3 violations=0 warnings=0
regression_quality exit=0 mode=bugfix files=3 adversarialFiles=3 violations=0 warnings=0
scenario_test_resolve exit=0 references=17 unresolved=0
```

No source, test, browser, rollback, packaging, taxonomy, test-substance, or
implementation-reality gap was observed in this execution epoch. The
repository does not declare lint, format, typecheck, test-impact, trace, or SLO
commands for this packet, so no substitute command was invented.

### Planner Coherence Findings

#### Active Lifecycle Contradiction {#harden-b007-plan-lifecycle-002}

**Finding ID:** `HARDEN-B007-PLAN-LIFECYCLE-002`
**Severity:** blocking
**Owner:** `bubbles.plan`
**Claim Source:** executed

The active Implementation Plan still calls rollback/restore an open DoD and
instructs `TP-B007-012` routing to `bubbles.test`. The same file now records the
test execution as complete and checks the rollback/restore DoD. Its header and
current dependency still name `bubbles.harden`, while this pass found planner
reconciliation work. The report Completion Statement also retains the old
hardening route and treats already-recorded human acceptance as an open gate.

```text
scopes.md:242 exact mutation-causality execution, with rollback/restore verification kept
scopes.md:244 6. Route `TP-B007-012` to `bubbles.test` for the independent semantic-inverse
scopes.md:285 **Execution status:** Executed-passed by `bubbles.test`; evidence:
scopes.md:398 - [x] Rollback or restore path for shared infrastructure changes is documented and verified.
scopes.md:6 **Next required owner:** `bubbles.harden`
scopes.md:76 **Current dependency:** `bubbles.harden` (exhaustive re-entry) -> remaining
report.md:70 `bubbles.harden`; later quality phases, human acceptance, TP-B007-011, and
```

Planner ownership must reconcile only the active lifecycle prose to the already
recorded test-owned execution and current route. Historical evidence and route
records remain byte-preserved.

#### Duplicate Structured Manifest Key {#harden-b007-manifest-dupkey-003}

**Finding ID:** `HARDEN-B007-MANIFEST-DUPKEY-003`
**Severity:** blocking
**Owner:** `bubbles.plan`
**Claim Source:** executed

`scenario-manifest.json::planningReconciliation.finalTreeRollbackRestore`
contains `executionOwner` twice. A permissive JSON parser silently keeps the
second value, so parse success cannot prove the structured packet is
unambiguous.

```text
scenario-manifest.json:35 "executionOwner": "bubbles.test",
scenario-manifest.json:36 "status": "executed-passed",
scenario-manifest.json:37 "evidenceRef": "report.md#bug007-shared-infrastructure-rollback-restore",
scenario-manifest.json:38 "executionOwner": "bubbles.test",
```

The duplicate must be removed without changing the retained value, execution
owner, evidence reference, scenario coverage, or test status.

### Transition Diagnostic And Harden Verdict

**Phase:** harden
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** The transition command is intentionally non-certifying.
Its nonzero result confirms the packet remains nonterminal and preserves the
validate-owned historical-route finding; it is not presented as a passing
transition.

```text
state_transition_guard exit=1 lines=378 sha256=7849568e13d1772b04f7c884acf27cb40c1ba53e6202c99380dd850e9042728f
passedGateIds=G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136
failedGateIds=G061,G022,G027,G090
failureCount=29
blockingCode=DELIVERY_COMPLETION_FAILED
verdict=FAIL
```

| Harden profile | Result |
| --- | --- |
| H1 findings classified with evidence | PASS |
| H2 fixes verified | FAIL - two planner-owned findings remain |
| H3 required artifact updates made | PASS - this evidence and route account for every finding |
| H4 test taxonomy completeness | PASS |
| H5 Gherkin-to-test semantic fidelity | PASS |
| H6 repo-realistic test paths | PASS |
| H7 regression coverage quality | PASS, including the executed final-tree rollback oracle |
| H8 cross-scope test deduplication | PASS - one scope |
| H9 `test-plan.json` and manifest sync | FAIL - duplicate manifest key and stale active lifecycle prose |

**Hardening verdict:** `NOT_HARDENED`.

Route `BUG-007-ROUTE-016` is consumed by this exhaustive re-entry.
`BUG-007-ROUTE-017` carries `HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003` to `bubbles.plan`. The existing
`HARDEN-B007-G061-HISTORY-001` remains assigned to `bubbles.validate` and no
historical route is rewritten. `TP-B007-011`, Build Quality, scope status,
top-level status, certification, and human acceptance remain unchanged.

## Hardening Re-entry After Planning Reconciliation - 2026-09-02 {#bug007-harden-planning-closure-20260902}

**Phase:** harden
**Agent:** `bubbles.harden`
**Claim Source:** interpreted
**Interpretation:** Current execution proves one-to-one closure of
`HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003`. The active planning views now distinguish
test execution, plan reconciliation, hardening re-entry, and later
certification; strict structured parsing finds no duplicate member. The dated
route-016 failure remains unchanged as historical truth.
`HARDEN-B007-G061-HISTORY-001` remains open under `bubbles.validate`. It is not
part of this planning-repair verdict and is not treated as a hardening failure.

### Repository Authority And Current Epoch

**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=<repo-root> decision=rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:1 revision=1
HEAD=22bd024068fd021c9ae6893ffd503bdb13a96a23
source_hash_rlportfolio=ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0
source_hash_rlportfoliobrief=2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30
carrier_hash_functional=875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124
carrier_hash_browser=ef3189652a7532385c19f839a150336c1295a9ee9f095468afe19468888c832c
carrier_hash_integrity=77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e
injector_hash=6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0
selftest_hash=829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a
exact_tp_b007_012_title_count=1
post_execution_source_and_carrier_hashes_unchanged=PASS
staged_scoped_paths=0
```

The implementation and persistent-carrier hashes match both the pre-execution
capture and the accepted route-014 rollback epoch. No product or test byte
changed during this hardening re-entry.

### Finding Closure Discriminator

**Command:** canonical `scenario-test-resolve.sh` plus exact active-lifecycle,
strict-manifest, `TP-B007-012`, and finding-ledger assertions
**Exit Code:** 0
**Claim Source:** executed

```text
[scenario-test-resolve] OK - 17 reference(s) resolved via literal-scan; 17 category comparison(s) not applicable (no test-discovery adapter declared)
active_scope_tp012_executed=PASS
active_scope_no_test_rerun=PASS
stale_active_test_route_absent=PASS
completion_planning_status=PASS
completion_owner=PASS
completion_acceptance_truth=PASS
completion_g061_preserved=PASS
dated_route016_preserved=PASS
dated_failure_truth_preserved=PASS
test_plan_planning_status=PASS
test_plan_owner=PASS
test_plan_action=PASS
manifest_execution_owner_source_cardinality=PASS
manifest_execution_owner=PASS
manifest_status=PASS
manifest_evidence_ref=PASS
manifest_reconciliation_owner=PASS
manifest_required_sequence=PASS
test_plan_tp012_cardinality=PASS
test_plan_tp012_execution_link=PASS
scenario_tp012_link=PASS
addressed_HARDEN-B007-PLAN-LIFECYCLE-002=PASS
unresolved_absent_HARDEN-B007-PLAN-LIFECYCLE-002=PASS
addressed_HARDEN-B007-MANIFEST-DUPKEY-003=PASS
unresolved_absent_HARDEN-B007-MANIFEST-DUPKEY-003=PASS
g061_only_unresolved=PASS
latest_routing_truth=PASS
BUG007_FINDING_CLOSURE_DISCRIMINATOR=PASS
```

The canonical scenario reader rejects duplicate JSON members. Its successful
17-reference resolution therefore supplies the fail-closed parse required by
the design. The exact assertions additionally prove that
`finalTreeRollbackRestore` has one `executionOwner`, owned by `bubbles.test`,
with `executed-passed`, the durable route-014 evidence reference,
`bubbles.plan` reconciliation ownership, and the unchanged seven-step sequence.

### Exhaustive Build-Free Execution

**Claim Source:** executed

```text
pages_build exit=0 registeredPages=29 rootFiles=124
focused_functional exit=0 tests=34 pass=34 fail=0 skipped=0 sha256=55f8af40be5e23b50f95515786d6cc705d510126b2991ad21e50aa6dc45faa3e
tp_b007_012_canary exit=0 tests=1 pass=1 fail=0 skipped=0 sha256=0e8b67b1ec504670fe5f6f739ef9a3531cbdfb7f65a42237fada350eba1469d0
node_source_lock exit=0 adversarial=16 unexpectedAcceptances=0
playwright_version=1.61.1
scenario_browser exit=0 tests=19 pass=19 fail=0 sha256=85068f2c09e73f890bac0c89255e4b2093a5d1325475103035262f9e7ab04de5
feature_008_browser exit=0 tests=95 pass=95 fail=0 sha256=92f89057a46866ea578bfd514a2169d035044ac4a79075ec2d542838f83ee8bc
registered_unit exit=0 tests=666 pass=666 fail=0 skipped=0 sha256=2d4b2e245991567358cf9cf29782c1f30f1663cd2976c100f5cc4cc77a268f4b
registered_integration exit=0 tests=37 pass=37 fail=0 skipped=0 sha256=d521d7578c9999dce124a20074417dd44dbf65aeb52a61ef67a86201328327fb
registered_security exit=0 tests=19 pass=19 fail=0 skipped=0 sha256=dfb653c194b86b275ed4f285ac1065f15c46977e18c182c9a4b6db437233fcb9
registered_load exit=0 tests=2 pass=2 fail=0 skipped=0 sha256=cd156cd4ec4cbabe7ecb997ce6dce4ab41e8621265cdb5fad67b439ee128058e
registered_stress exit=0 tests=9 pass=9 fail=0 skipped=0 sha256=5e7dff783a1db5411501b4b473752cedf3fb13cc3d110563d23f1751db51deab
canonical_selftest exit=0 checks=3443 pass=3443 fail=0 sha256=ebb65926574a94627588e920242cfa29133cc59f49e84a617c0c2cf79f03a077
packet_guards exit=0 lines=117 sha256=665aa5832fdb64d4a1bde11f6e09a9ffc3b261f578eefcfd6a4ae64f480d4f00
implementation_reality exit=0 files=6 violations=0 warnings=0 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
regression_quality_ordinary exit=0 files=3 violations=0 warnings=0
regression_quality_bugfix exit=0 files=3 adversarialFiles=3 violations=0 warnings=0
regression_quality_combined_sha256=a9de9ea64b76b22fe9350a60753b44cd414c5f7a4b7096a9a590ff4fe6c612a4
```

Research Lab declares no repository lint, format, or typecheck command. No
substitute was invented. The registered unit, integration, security, load,
stress, scenario-browser, broader-browser, focused functional, canary, packet,
implementation-reality, regression-quality, source-lock, Pages, and canonical
selftest surfaces all passed in this execution epoch with zero skipped tests.

### Compliance And History Boundary

**Claim Source:** executed

```text
skip_scan_exit=1
interception_scan_exit=1
bailout_scan_exit=1
incomplete_marker_scan_exit=1
BUG007_EXECUTABLE_COMPLIANCE=PASS
active_owner_harden=PASS
active_acceptance_recorded=PASS
active_old_acceptance_gate_absent=PASS
dated_contradiction_retained=PASS
dated_verdict_retained=PASS
ACTIVE_HISTORY_BOUNDARY=PASS
```

The first incomplete-marker probe matched three assertions in
`scripts/selftest.mjs` that deliberately search source for forbidden markers.
The declaration-aware rerun above searched actual comment/placeholder forms and
passed. This was an invocation-local probe correction, not a repository finding.
The executable scan found no skip/only declaration, live interception, required-
scenario bailout, or incomplete marker in the reviewed implementation and test
surface.

### Non-Certifying Transition Diagnostic

**Command:** `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** This is a delivery-completion diagnostic, not a hardening
pass criterion. It truthfully preserves the nonterminal packet and later-owner
work. None of its failed gate classes reopens either planning finding.

```text
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G061,G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done,Check-8-contract,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 29
exitStatus: 1
verdict: FAIL
evidence_sha256=b7ce66015893115178310916abf3a9ff2b55c36845b89fa4eaf761d0140575b3
```

`TP-B007-011`, Build Quality, Scope 01, later required specialist phases, G027,
and G090 remain later workflow work. `HARDEN-B007-G061-HISTORY-001` remains
explicitly validation-owned. This hardening pass neither edits nor adjudicates
those carriers.

### Harden Profile And Finding Accounting

| Check | Result | Current basis |
| --- | --- | --- |
| H1 findings classified with evidence | PASS | Both requested findings have exact executed closure assertions; G061 remains separately validation-owned. |
| H2 fixes verified | PASS | Strict structured parsing, lifecycle assertions, all registered test categories, browser matrices, and packet guards pass. |
| H3 required artifact updates | PASS | This harden evidence and execution-owned routing record the clean re-entry without changing foreign-owned planning, acceptance, or certification fields. |
| H4 test taxonomy | PASS | Functional, unit, integration, security, e2e-ui, load, stress, artifact, and guard surfaces are present and executed. |
| H5 semantic fidelity | PASS | All four scenarios resolve to 17 concrete references, including direct hostile-key and mutation-causality assertions. |
| H6 realistic paths | PASS | Canonical traceability and scenario resolution accept every planned path. |
| H7 regression quality | PASS | Three persistent carriers are adversarial; scenario browser and broader Feature 008 browser matrices pass. |
| H8 cross-scope deduplication | PASS | The packet has one scope. |
| H9 structured-plan sync | PASS | `TP-B007-012` occurs once in the structured plan, once in linked scenario execution, and the manifest rollback object has one execution owner. |

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `HARDEN-B007-PLAN-LIFECYCLE-002` | Confirmed addressed one-to-one | Finding closure discriminator, active/history boundary, and `report.md#completion-statement` |
| `HARDEN-B007-MANIFEST-DUPKEY-003` | Confirmed addressed one-to-one | Canonical duplicate-rejecting scenario parse and exact rollback-object assertions |
| `HARDEN-B007-G061-HISTORY-001` | Unchanged, validation-owned | `report.md#harden-b007-g061-history-001`; excluded from this repair verdict |

**Hardening verdict:** `HARDENED`.

No new finding exists. Harden is complete in execution provenance. Current
routing advances to `bubbles.stabilize`, the next required owner in
`bugfix-fastlane`. Packet status remains `in_progress`; Scope 01 remains Not
Started; `TP-B007-011` and Build Quality remain unchecked; human acceptance and
all certification fields remain unchanged.

## Implementation Ownership Review After Planning Repair - 2026-09-02 {#bug007-implementation-owner-noop-review-20260902}

**Phase:** implement
**Agent:** `bubbles.implement`
**Claim Source:** interpreted
**Interpretation:** The approved repair for
`HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003` is artifact-only. The current product source
and persistent tests retain the accepted hashes, have no staged or unstaged
delta, and pass both planned implementation discriminators. No
implementation-owned gap exists, so this phase makes no source or test edit.

### Repository Binding

**Claim Source:** executed

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:1 revision=1
```

### Authorized Delta And Byte Preservation

**Claim Source:** executed

```text
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/bug.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/design.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scenario-manifest.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/spec.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/test-plan.json
BUG007_SOURCE_AND_PERSISTENT_TEST_DIFF=clean
BUG007_STAGED_SOURCE_AND_PERSISTENT_TEST_DIFF=clean
BUG007_HUMAN_ACCEPTANCE_DIFF=clean
```

The accumulated BUG-007 worktree delta is confined to the eight bug-packet
artifacts authorized across the filing, analysis, design, planning, evidence,
and execution chain. The implementation source, persistent tests, shared
injector, repository selftest, and human acceptance carry no Git delta.

**Claim Source:** executed

```text
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
ef3189652a7532385c19f839a150336c1295a9ee9f095468afe19468888c832c  tests/portfolio-survival-brief.spec.mjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs
```

These hashes match the accepted hardening epoch recorded immediately above.

### Fresh Focused Functional Verification

**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 implementation-owner no-op functional verification' -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 implementation-owner no-op functional verification
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 42
sha256: 71c8281dd3e7500a25b3a43e7549c30619bd536f590ee3f2e8e49a063b2a0e5f
--- first 20 ---
✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (212.308519ms)
✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (41.818863ms)
✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (91.882938ms)
✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (24.048236ms)
✔ BUG-007: normal brief order and refusal precedence remain unchanged (5.646108ms)
✔ BUG-007: prototype-sensitive completion keys are safe own keys (7.154511ms)
✔ BUG-007: prototype-sensitive completion subjects are safe own keys (4.281607ms)
✔ BUG-007: prototype-sensitive completion domains are safe own keys (2.395303ms)
✔ BUG-007: own lookup semantics and RED cleanup preserve shared built-ins (4.948507ms)
✔ SCN-008-006 TP-05-01: each window is identified from the generic config and no later observation enters an earlier cutoff (3.108705ms)
✔ SCN-008-007 TP-05-01: the four qualification lanes stay separate and a subject is never duplicated across them (1.986603ms)
✔ SCN-008-010 TP-05-01: below the behavior floor the inferred lane is empty and the shortfall is named (2.333104ms)
✔ SCN-008-010 TP-05-01: unrelated completions cannot jointly clear an inferred domain floor (1.808902ms)
✔ SCN-008-007 TP-05-01: the visible queue is bounded by policy and ordered by materiality (1.233601ms)
✔ FR-064 a scoped subject with no surviving evidence is explained rather than dropped (1.403103ms)
✔ FR-064 subjects trimmed by the visible cap are accounted for, not silently discarded (1.104801ms)
✔ FR-060 and FR-061 each item routes to its owning tool or names the gap (1.979003ms)
✔ FR-067 the brief identity binds revision window cutoff policy and action set (1.648403ms)
✔ FR-041 the local action-history cutoff is a fourth clock and is actually enforced (1.530202ms)
✔ BUG-006: composeBrief validates shared evidence-age policy before Date formatting (2.859105ms)
--- omitted 2 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ FR-050 partial or stale evidence keeps its state and cannot support an action as if fresh (1.557903ms)
✔ SCN-008-008 TP-06-01: every item explains why it appears with the full FR-045 disclosure (1.344702ms)
✔ SCN-008-008 TP-06-01: recency decays on the declared half-life and expires past the age limit (2.149403ms)
✔ SCN-008-009 TP-06-01: settings and passive activity never become inferred interests (0.959201ms)
✔ SCN-008-034 TP-06-01: no authored action carries an order verb or a size instruction (0.998602ms)
✔ SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical (20.963731ms)
✔ Adversarial: behavior identity and temporal guards prevent false relevance (9.292214ms)
✔ SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time (4.028806ms)
✔ SCN-008-046 action candidates enforce generic freshness and one lifecycle reducer (3.442305ms)
✔ SCN-008-046 every public boundary emits a closed value-safe PortfolioError (0.880101ms)
✔ Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract (1.873303ms)
✔ Regression: BUG-004 same-semantic occurrences cannot inflate relevance (104.584457ms)
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 701.439055
```

All 34 focused functional tests pass. The four named BUG-007 checks cover
normal ordering, hostile own keys, hostile subjects, hostile domains, own
lookup semantics, cleanup, and shared built-in preservation.

### Fresh Mutation-Causality Canary

**Command:** `timeout 300 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 implementation-owner no-op mutation canary' -- timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 implementation-owner no-op mutation canary
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: 2939546bb7e4907b99e41f2c7170df333c7d2c7e9b4f9695e70c09715c58ba3f
--- output ---
✔ BUG-007: represented mutants execute one protective assertion through one intended hook (1519.837288ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1624.607846
```

### Finding Accounting And Handoff

| Finding | Implementation disposition | Evidence |
| --- | --- | --- |
| `HARDEN-B007-PLAN-LIFECYCLE-002` | Addressed by its planning owner; no implementation delta required. | Active lifecycle reconciliation plus fresh 34-of-34 behavior verification and clean source/test diff. |
| `HARDEN-B007-MANIFEST-DUPKEY-003` | Addressed by its planning owner; no source or persistent-test impact exists. | Strict duplicate-aware closure evidence in the hardening section plus clean source/test diff. |
| `HARDEN-B007-G061-HISTORY-001` | Unresolved and excluded from implementation ownership. | Preserved at `report.md#harden-b007-g061-history-001` for `bubbles.validate`. |

**Implementation verdict:** no implementation change required. The current
source and persistent tests already implement and protect the approved
prototype-safe behavior. Route the unchanged implementation epoch to
`bubbles.test` for independent test ownership. Human acceptance,
certification, historical routes, scope status, packet status, and the G061
finding remain unchanged.

## Test Ownership Verification After Artifact-Only Planning Repair - 2026-09-02 {#bug007-test-owner-planning-repair-verification-20260902}

**Phase:** test
**Agent:** `bubbles.test`
**Claim Source:** executed
**Evidence boundary:** This section independently verifies the artifact-only
repair and unchanged implementation epoch. It does not rerun or relabel the
historical RED, edit planning or acceptance artifacts, write certification,
promote scope or packet status, or alter historical transition requests.

### Repository Binding And Unchanged Implementation Epoch

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:1 revision=1
HEAD=22bd024068fd021c9ae6893ffd503bdb13a96a23
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
ef3189652a7532385c19f839a150336c1295a9ee9f095468afe19468888c832c  tests/portfolio-survival-brief.spec.mjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs
```

The repository root above is normalized for committed PII hygiene. The seven
implementation and carrier hashes match the accepted route-014 and hardening
epoch. Unrelated dirty workspace paths were observed and left untouched.

### Strict Structured Artifact And Finding Closure

**Command:** `timeout 120 node -e '<strict duplicate-aware decoder and exact BUG-007 field, lifecycle, history, and finding assertions>'`
**Exit Code:** 0
**Claim Source:** executed

```text
scenario-manifest.json_strict_duplicate_aware_parse=PASS
test-plan.json_strict_duplicate_aware_parse=PASS
state.json_strict_duplicate_aware_parse=PASS
manifest_execution_owner=PASS
manifest_status=PASS
manifest_evidence_ref=PASS
manifest_reconciliation_owner=PASS
manifest_required_sequence=PASS
test_plan_planning_status=PASS
test_plan_owner=PASS
test_plan_action=PASS
test_plan_tp012_cardinality=PASS
test_plan_tp012_execution_link=PASS
scenario_tp012_link=PASS
active_scope_tp012_executed=PASS
active_scope_no_test_rerun=PASS
active_scope_post_plan_owner=PASS
completion_planning_status=PASS
completion_owner=PASS
completion_acceptance_truth=PASS
completion_open_truth=PASS
completion_g061_preserved=PASS
dated_route016_preserved=PASS
dated_failure_truth_preserved=PASS
addressed_HARDEN_B007_PLAN_LIFECYCLE_002=PASS
addressed_HARDEN_B007_MANIFEST_DUPKEY_003=PASS
unresolved_repaired_findings_absent=PASS
g061_only_unresolved=PASS
state_nonterminal_truth=PASS
state_current_test_routing=PASS
historical_route_018_preserved=PASS
BUG007_FINDING_CLOSURE_DISCRIMINATOR=PASS
```

The decoder rejects repeated members, non-finite constants, and trailing
content before evaluating fields. The output directly proves one-to-one
closure of `HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003`. It also proves that
`HARDEN-B007-G061-HISTORY-001` remains the sole unresolved finding and the
dated route-016 contradiction remains preserved as history.

### Focused Functional, Mutation, Browser, And Canonical Carriers

**Commands:**

- `timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
- `timeout 30 npx --no-install playwright --version`
- `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- `timeout 1800 node scripts/selftest.mjs`

**Exit Codes:** `0, 0, 0, 0, 0`
**Claim Source:** executed

```text
focused_functional exit=0 lines=42 sha256=9005c703249c1812ed86afda6be28582ddf64153c5036bb6d6231ced9890ffe0
focused_functional tests=34 pass=34 fail=0 cancelled=0 skipped=0 todo=0
focused_functional named_bug007_checks=5
mutation_canary exit=0 lines=9 sha256=f06a76a0313af01e446ffe1c2523b199ded59809d33bb4fdd337d98a85ade162
mutation_canary tests=1 pass=1 fail=0 cancelled=0 skipped=0 todo=0
playwright_version=1.61.1
scenario_browser exit=0 lines=67 sha256=aa0cac4eea78c8ccda585c74f7ba4cf1d4311bab51534a71aeaf9046c7a33a45
scenario_browser tests=19 pass=19 fail=0
scenario_browser named_bug007_visible_constructor=PASS
final_validation_canonical_selftest exit=0 lines=3912 sha256=e8996844c941000599036fa6c761e62f6cba081968a79c531c82bbae446399d4
canonical_selftest checks=3443 pass=3443 fail=0
historical_red_rerun=NO
```

The focused carrier preserves all five BUG-007 functional assertions. The
exact mutation canary remains load-bearing. The real-browser carrier passes the
six hostile exported cases and visible `constructor` workflow through the
pinned checkout-local system-Chrome runner. The canonical selftest validates
the complete current build-free repository surface.

### Packet, Reality, Regression, PII, And Provenance Guards

**Commands:** canonical artifact lint, traceability, scenario resolution,
scenario obligations, test mechanism, scope context, capability foundation,
implementation reality, bugfix regression quality, Claim Source provenance,
execution-substate separation, and committed-surface PII scan over the current
BUG-007 packet.

**Exit Codes:** all `0`
**Claim Source:** executed

```text
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 result=PASSED
traceability-guard exit=0 lines=68 sha256=b731ae6ca9ec538e968f5622464d1da768990c875ec92e5250db4930a419641c
traceability scenarios=4 testRows=14 mappedDoD=4 warnings=0 result=PASSED
scenario-test-resolve references=17 unresolved=0
scenario-obligation-lint scenarios=4 result=OK
test-mechanism-lint mechanisms=4 result=OK
mutationExecution adapter=none outcome=inert
scope-context-fit-lint scopes=1 selfContained=1 result=OK
capability-foundation-guard gate=G094 result=PASS
implementation-reality exit=0 files=6 violations=0 warnings=0 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
regression-quality exit=0 files=3 adversarialFiles=3 violations=0 warnings=0 sha256=92bc477e63a7b099c1019713769897fc0f95350d284d26084128306cc80ca98f
claim-source-lint result=OK
execution-substate-guard result=OK
pii-scan files=10774 messages=2554 findings=0 result=OK
```

### Test Verdict And Routing

`TESTED` for the requested artifact-only repair and unchanged implementation
epoch. Findings `HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003` are independently closed one-to-one by the
strict artifact discriminator and current carriers. No new finding was
observed. `HARDEN-B007-G061-HISTORY-001` remains explicitly unresolved and
owned by `bubbles.validate`, which is the next mandatory delivery-chain owner.

## Validation-Owned Outcome Replay And G061 Reconciliation - 2026-09-02

### Outcome Contract Verification (G070)

**Phase:** validate
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** The functional carrier directly passes the ordinary-order,
prototype-sensitive subject, prototype-sensitive domain, own-lookup, cleanup,
and shared-built-in assertions. The real-browser carrier directly passes the
same hostile-key path plus the visible `constructor` workflow. Together these
current runs demonstrate the declared Success Signal and show that the declared
Failure Condition is not active. The focused mutation canary separately proves
the protection remains causally exercised through one intended hook.

| Field | Declared | Current evidence | Status |
| --- | --- | --- | --- |
| Intent | Treat accepted subject and domain strings as data, not object-prototype control surfaces. | Functional replay passes all five named BUG-007 contract checks. | PASS |
| Success Signal | Preserve normal observable composition while `__proto__`, `constructor`, and `toString` complete without throw or shared-built-in mutation. | Functional `34/34`; real-browser `19/19`, including `BUG-007: browser composer treats hostile keys as data and visible constructor remains operable`. | PASS |
| Hard Constraints | Inheritance-free maps and nested sets, own-key caller lookups, no blacklist, no catch-and-partial return, no observable contract movement. | Functional normal/refusal, hostile-key, own-lookup, cleanup, and parent error-contract assertions pass; mutation canary passes `1/1`. | PASS |
| Failure Condition | Any named key throws, escapes the contract, mutates a shared built-in, disappears, or moves normal/refusal output. | No functional or browser assertion failed; both commands report zero failures and zero skips. | NOT TRIGGERED |

```text
# BUG-007 validation outcome functional replay
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 42
sha256: 1341b7e4f86d2c767df0cfe62bb51c5ccf3be5b1593a5079f9afd6fe66789595
BUG-007: normal brief order and refusal precedence remain unchanged PASS
BUG-007: prototype-sensitive completion keys are safe own keys PASS
BUG-007: prototype-sensitive completion subjects are safe own keys PASS
BUG-007: prototype-sensitive completion domains are safe own keys PASS
BUG-007: own lookup semantics and RED cleanup preserve shared built-ins PASS
tests 34
pass 34
fail 0
cancelled 0
skipped 0
todo 0
```

```text
# BUG-007 validation real-browser scenario replay
$ timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
exit: 0
lines: 67
sha256: 02e1561c1322f911336bc5f5beab5e8f0799fc8482915e779233534f99deb674
Running 19 tests using 1 worker
BUG-007: browser composer treats hostile keys as data and visible constructor remains operable PASS
SCN-008-046 generic evidence DST policy complete API and global queue remain coherent PASS
BUG-001 a publication later than its declared window cutoff is refused by name and never empties the schedule PASS
SCN-008-055 every published Feature 008 entry opens the Portfolio Brief workspace PASS
19 passed (25.3s)
historical RED rerun: NO
```

```text
# BUG-007 validation mutation-causality canary
$ timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: ecb833143783f5b90e49b1950112ef1e18c4f51709705f0c3fc44f1b3605dcbe
BUG-007: represented mutants execute one protective assertion through one intended hook PASS
tests 1
pass 1
fail 0
cancelled 0
skipped 0
todo 0
```

### HARDEN-B007-G061-HISTORY-001 Reconciliation {#harden-b007-g061-history-reconciliation}

**Phase:** validate
**Executed:** YES
**Claim Source:** executed

Validation normalized only `BUG-007-ROUTE-001` through
`BUG-007-ROUTE-010` from the legacy terminal status `completed` to the current
G061 terminal status `resolved`. Each record retains its ID, original author,
target, next owner, reason, and ordering, and now carries an explicit
validation-owned resolution stating that only the terminal vocabulary changed.
Later route records, including the same-spec open route 018, remain unchanged.

```text
# BUG-007 TP-B007-011 after G061 history reconciliation
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys
exit: 1
lines: 369
sha256: 14fb0db0fef02efa94bf9988cda8c4755ca7bc7eb919f2d40bb05c669b158dd6
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
passedGateIds: G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136
failedGateIds: G022,G027,G090
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 17
verdict: FAIL
```

The guard directly closes the G061 finding while preserving the truthful
nonterminal result. `TP-B007-011`, Build Quality, Scope 01, top-level status,
and `certification.status` remain open or `in_progress`; this validation leg
does not certify the bug as `done`.

### Validation Verdict And Routing {#bug007-validation-verdict-20260902}

**Phase:** validate
**Executed:** YES
**Claim Source:** interpreted
**Interpretation:** BUG-007 behavior, scenario replay, build-free project tests,
artifact structure, traceability, implementation reality, regression quality,
source locking, PII, and evidence provenance are clean on the reconciled tree.
The overall validation verdict is `ROUTE_REQUIRED`, not a certification pass,
because the asserted transition guard remains nonzero on root-workflow phase and
scope prerequisites plus two framework-owned blockers. Repository-wide doctor
and handoff diagnostics also expose independent findings outside BUG-007.

```text
VALIDATION_MATRIX
pages_build exit=0 sha256=e8f3e909076799aee06e386be1092e9e344b90aa5060905c10cec77bbcad90e3 registeredPages=29
functional exit=0 sha256=1341b7e4f86d2c767df0cfe62bb51c5ccf3be5b1593a5079f9afd6fe66789595 tests=34 pass=34 fail=0 skipped=0
unit exit=0 sha256=f6c099b1894226fc2eb6ca9753f6427ee4d7f7a9e9100cbd52310c9febcce402 tests=666 pass=666 fail=0 skipped=0
integration exit=0 sha256=9428e99646a64109b09af37d41370f9dce6ef49cf0b2b435d512c8ca6bf2f135 tests=37 pass=37 fail=0 skipped=0
security exit=0 sha256=b70aecf5aa7814c85e94058604e7f28886e12d688e599137f57fef55c092d5ed tests=19 pass=19 fail=0 skipped=0
load exit=0 sha256=c2a6e2726a73ff174fb8f72d7a277a40dd49175f68a9ca388d652aeb1fc9ed1e tests=2 pass=2 fail=0 skipped=0
stress exit=0 sha256=e577642956a41551f6ca7bca83ec79db8bfd8048842fabf06fd8c1b605039992 tests=9 pass=9 fail=0 skipped=0
canonical_selftest exit=0 sha256=f245463521d3d7f13e8907ecfeee0ad7df7f51cdb0104f1894686572b42b09b9 checks=3443 pass=3443 fail=0
scenario_browser exit=0 sha256=02e1561c1322f911336bc5f5beab5e8f0799fc8482915e779233534f99deb674 tests=19 pass=19 fail=0
feature008_browser exit=0 sha256=fcac211d7492886c137d5e71bc54cf0798da3049c015dcb5b93141b3a03b7152 tests=95 pass=95 fail=0
source_lock exit=0 sha256=e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1 adversarial=16 unexpectedAcceptances=0
brief_contract exit=0 sha256=78e604f919ee46a4ac92dd03ec2ef662116caee5b7addb87d2a445b8cffb4490
causal_contract exit=0 sha256=086f4bb660488c97076bda78d4848a85af0b4a074e61f1bd591077ca4478ab0c checks=41 failures=0
session_review exit=0 sha256=d69f9e08b2a6d2fed190bad1530d98acafa96d48c7c5c00294c6d9c548a6420b tests=59 pass=59 fail=0
artifact_lint exit=0 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
traceability exit=0 scenarios=4 testRows=14 warnings=0
implementation_reality exit=0 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83 files=6 violations=0 warnings=0
artifact_freshness exit=0 sha256=b593a1f50ab3d44876e23f2b7022bcd1505e4719d6d7f8a2d00d6fd80020f96e failures=0 warnings=0
regression_quality exit=0 sha256=8125a80ed07fa9f7981d24c1b0e1292e9c606827116ad15b1b5c107284b7d12c files=3 adversarialFiles=3 violations=0 warnings=0
claim_source exit=0 sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653
scenario_links exit=0 sha256=fe33cbfb63d9c653f7daac337b52e256046b23dda2a25f280ab1ba2603b9b838 references=17 unresolved=0
pii_scan exit=0 sha256=3a1b576fd70ff0fe96dbbcae1ea5d60ede861d393a95be7d95cd64cb3ae4fc8f findings=0
framework_write_guard exit=0 sha256=70088ae5335b50a3b78b2d69ea25ac658de8bdcf95a29c68f40d4f4552f21ce2
repo_readiness exit=0 sha256=d16dc2bfd5aab2d39553799c1f3d81aa2afcbffc20157f02d2e217c111c6e0a1 pass=9 warn=0 fail=0
goal_fidelity exit=0 sha256=3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46
impact_plan exit=0 sha256=b8a61d3676117b7ce78c34fe14d71388951ca063a2e7c9c8bb0ddb75e28a003a configured=false
trace_contract exit=0 sha256=8ab4947dd9a22d9909bff0472c0f1eee4d45a911cb7a77fe18050e8869bba2e1 configured=false
slo_guard exit=0 sha256=2079b4a7a16b34289e44c11606457351773c1e059a3b4e49440f20f8d1ada585 posture=undeclared no-op=true
historical_red_rerun=NO
lint_command=NOT_DECLARED
format_command=NOT_DECLARED
```

```text
ASSERTED_TRANSITION
command=timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh <BUG-007> --expect-workflow-mode bugfix-fastlane --target-status done --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit=1
sha256=d428c7243599c4ede99a0f6aa5807996e476a2e747c61cf0a4f31f8065ed4163
workflowMode=bugfix-fastlane
auditProfile=delivery-completion-v1
targetStatus=done
targetRevision=sha256:28b67966f9f20b9ef403a4c3c913432b6bbfa39f5c156e11cab57fed438e0e83
passedGateIds=G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136
failedGateIds=G022,G027,G090
failureCount=17
blockingCode=DELIVERY_COMPLETION_FAILED
verdict=FAIL
```

#### Finding Accounting

| Finding | Disposition | Evidence or owner |
| --- | --- | --- |
| `HARDEN-B007-PLAN-LIFECYCLE-002` | Addressed one-to-one; independently revalidated. | Strict packet guards, current functional/browser matrix, and `report.md#bug007-test-owner-planning-repair-verification-20260902`. |
| `HARDEN-B007-MANIFEST-DUPKEY-003` | Addressed one-to-one; independently revalidated. | Strict JSON parsing and unique `executionOwner` evidence in the same test-owned section. |
| `HARDEN-B007-G061-HISTORY-001` | Addressed one-to-one by validation. | `report.md#harden-b007-g061-history-reconciliation`; asserted transition output includes `G061` in `passedGateIds`. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Unresolved, blocking external framework fix. | `bubbles.implement`; filed packet `.github/bubbles-project/proposals/20260902-g090-convergence-summary-counted-as-snapshot.md`; G090 exit `1`, sha256 `71c9ccfa9746ac488dea0d5bfeb5fd48ca335be9cce1b10da099c0e91abd27cf`. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Unresolved, blocking framework parser fix. | `bubbles.bug` then `bubbles.implement` in canonical Bubbles: Check 8 misclassifies the backticked agent identifier `bubbles.test` as a basename-only `.test` file. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Unresolved, independent repository evidence drift. | `bubbles.test`; doctor exits `1` at sha256 `49bc232d4ee8b117f621b318b1eff8601b937baddb9dfe7c244b78bf1bcbada6`; named diagnostic finds 19 foreign zero-collection receipts at sha256 `2632f651b08e8fe5c30859e4c9f02fe8e24daa63bbbaa56a066321718c0b147a`. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Unresolved, independent framework graph finding; no BUG-007 agent file changed. | `bubbles.bug` then `bubbles.implement`; checker exit `1`, sha256 `a1b76c8ac7b1785a164624fcd66b31c2340cf56700e365d6e7ae6fc4dae98eb5`; `.github/agents` diff exit `0`. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Unresolved, independent BUG-025 evidence receipt. | `bubbles.validate` on the owning BUG-025 packet; asserted transition Check 43 reports one stale foreign receipt. |

The earlier undated Completion Statement records the pre-validation handoff and
remains historical. This dated section is the current validation disposition.
Top-level `status` and `certification.status` remain `in_progress`; Scope 01
remains `Not Started`; `TP-B007-011` and Build Quality remain unchecked. No
validate phase claim, certified scope, certification timestamp, or terminal
status is written. The next routed owner is `bubbles.implement` for the already
filed G090 upstream repair; the additional owners above remain explicit and
must not disappear from the parent finding ledger.

## Finding-Owned Closure Audit - 2026-09-02 {#bug007-audit-finding-owned-closure-20260902}

**Phase:** audit
**Agent:** `bubbles.audit`
**Claim Source:** interpreted
**Interpretation:** The product source, persistent tests, shared injector,
repository selftest, and human acceptance artifact are unchanged in both the
staged and unstaged trees. The current planning lifecycle and duplicate-key
repairs are substantively present, and the independent registered unit suite
passes. G061 is addressed against the dated same-chain history, which records
all ten legacy routes as `completed` before validation normalized them. The
finding-owned chain is not clean enough to route to docs because route 018
remains open to an analyst who has no execution record and UX-owned spec
sections have no UX execution provenance.

### Audit Boundary And Independent Checks

**Claim Source:** executed

```text
artifact-lint: exit=0 result=Artifact lint PASSED
scenario-test-resolve: exit=0 references=17 unresolved=0
registered-unit: exit=0 tests=666 pass=666 fail=0 skipped=0 todo=0
implementation-reality: exit=0 files=6 violations=0 warnings=0
regression-quality-bugfix: exit=0 files=3 adversarialFiles=3 violations=0 warnings=0
source_test_acceptance_diff_exit=0
staged_source_test_acceptance_diff_exit=0
SOURCE_TEST_HUMAN_ACCEPTANCE_INTEGRITY=PASS
changed BUG-007 packet artifacts=8
changed protected source/test/acceptance artifacts=0
staged BUG-007 packet artifacts=0
audit profile=delivery-completion-v1
```

The eight in-boundary modified paths are `bug.md`, `design.md`, `report.md`,
`scenario-manifest.json`, `scopes.md`, `spec.md`, `state.json`, and
`test-plan.json`. Unrelated dirty paths were observed and left untouched.

### Mandatory Transition Diagnostic

**Command:** registry-resolved assertion-only `state-transition-guard.sh`
**Exit Code:** 1
**Claim Source:** executed

```text
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:f4a4ad77331ee13fd4f6a413ebdec3d9d23335b80a6d21d5a513fe6622843b04
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done,Check-8-contract,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 17
exitStatus: 1
verdict: FAIL
```

G061 now passes mechanically. The nonzero verdict remains truthful because the
scope has two unchecked DoD items, Scope 01 is `Not Started`, later mode phases
are absent, phase claims are incoherent, and G090 remains red. This audit does
not treat the failed delivery transition as a passing certification result.

### Finding Accounting Audit

**Command:** dated same-chain history versus current-state route, provenance,
and finding-ledger discriminator
**Exit Code:** 0
**Claim Source:** executed

```text
dated_route011_records_route010_completed=PASS
dated_route011_records_ten_legacy_completed_routes=PASS
route010_current_validation_resolution=PASS
route010_resolution_matches_dated_baseline=PASS
route018_still_open_to_analyst=PASS
route018_carries_requested_planning_findings=PASS
analyst_execution_history_absent=PASS
ux_execution_history_absent=PASS
ux_owned_spec_sections_added=PASS
top_level_ledger_marks_requested_findings_addressed=PASS
AUDIT_G061_HISTORY_RECONCILIATION=PASS
AUDIT_DISCREPANCY_ROUTE018_PROVENANCE=CONFIRMED
AUDIT_DISCREPANCY_UX_PROVENANCE=CONFIRMED
```

1. **[HIGH] `AUDIT-B007-ROUTE018-PROVENANCE-001`.** Route 018 remains `open`,
  carries the two planning findings, and requires `bubbles.analyst`, but no
  analyst execution appears in `executionHistory`. The top-level ledger
  nevertheless marks both findings addressed and carries no unresolved
  finding. Owner: `bubbles.analyst` first, then the state-control owner must
  reconcile route and ledger truth.
2. **[HIGH] `AUDIT-B007-UX-OWNERSHIP-001`.** The current `spec.md` adds
  `## UI Wireframes` and `## User Flows`, which are UX-owned surfaces, while no
  `bubbles.ux` execution record exists. Owner: `bubbles.ux` after the analyst
  adjudication.

`HARDEN-B007-PLAN-LIFECYCLE-002` and
`HARDEN-B007-MANIFEST-DUPKEY-003` are substantively addressed: the active plan
copy reflects executed `TP-B007-012`, the scenario resolver accepts all 17
references, and the manifest has one raw `executionOwner` member whose value is
`bubbles.test`. Their open route and missing planning-chain provenance prevent
clean one-to-one closure accounting but do not reopen the artifact repairs.
`HARDEN-B007-G061-HISTORY-001` is also addressed: the dated route-011 evidence
records routes 001 through 010 as `completed`, current records retain identity,
author, target, reason, and order while using `resolved`, and G061 passes in the
asserted guard.

### Evidence Provenance Review

All 23 `Claim Source: interpreted` blocks were individually reviewed against
their adjacent raw output. Their scoped regression, mutation, receipt,
historical RED, and non-certifying guard interpretations are reasonable. None
silently converts a failed command or a nonterminal state into a pass.

## Spot-Check Recommendations

These items do not alter the blocking verdict. They identify evidence that
merits human scrutiny because it is interpreted or exactly at the ten-line raw
output threshold.

1. **Root Cause And Map Inventory** - Interpreted; verify the complete map inventory against `design.md` and current source.
2. **Independent Regression Phase** - Interpreted; verify that the scoped verdict does not imply a clean global receipt ledger.
3. **Baseline And Coverage Delta** - Interpreted; verify reused 95-test and selftest receipts remained bound to unchanged inputs.
4. **Simplify Phase** - Interpreted; verify direct security checks remain clearer than a helper abstraction.
5. **Gaps Phase** - Interpreted; verify the reported receipt split matches the packet revision named there.
6. **Scoped And Global Receipt Audit** - Interpreted; verify seven stale BUG-007 identities are report-bound and not behavior regressions.
7. **BUG-007 Hardening Phase** - Interpreted; verify the historical mutation-causality failure is not read as current failure.
8. **Current Receipt Identity Accounting** - Interpreted; verify no identity was relabeled or refreshed by harden.
9. **TP-B007-008 Current Test-Owner Evidence** - Interpreted; verify the census assertion includes both negative controls.
10. **Source, Runner, And Structured-Plan Identity** - Interpreted; verify all declared rows resolve to the listed command classes.
11. **Immutable Historical RED Adjudication** - Interpreted; verify RED authorship precedes the source repair and was not rerun as GREEN.
12. **TP-B007-005 Current Mutation Causality** - Interpreted; verify the exact title enforces assertion-origin failure.
13. **TP-B007-005 Recovery Mutation Causality** - Interpreted; verify the deliberate double-application and direct-text controls remain active.
14. **Recovery Carrier Quality And Integrity** - Interpreted; verify the skip-like token remains fixture input rather than an executable skip.
15. **Hardening Re-entry Route 011** - Interpreted; verify each historical blocker remains dated and superseded by later evidence.
16. **Test Compliance And Source Integrity** - Interpreted; verify the browser carrier uses production controls and no interception.
17. **Hardening Route 016** - Interpreted; verify the two planning findings are the only findings that phase discovered.
18. **Transition Diagnostic And Harden Verdict** - Interpreted; verify its nonzero transition is not represented as certification.
19. **Hardening Re-entry After Planning Reconciliation** - Interpreted; verify artifact repair closure separately from route 018 lifecycle closure.
20. **Non-Certifying Transition Diagnostic** - Interpreted; verify G061 was still red in that historical epoch.
21. **Implementation Ownership Review After Planning Repair** - Interpreted; verify no source or persistent-test delta was required.
22. **Outcome Contract Verification (G070)** - Interpreted; verify functional and browser evidence jointly prove the declared signal.
23. **Validation Verdict And Routing** - Interpreted; verify every independent validation finding remains in parent accounting.
24. **Current Test-Phase Rerun** - Exactly ten raw lines; verify the compact block retains all six child outcomes.
25. **Source/Test/Parent Integrity** - Exactly ten raw lines; verify all named hashes and the parent aggregate are present.
26. **No-Result Residue Accounting** - Exactly ten raw lines; verify the no-result count is non-vacuous.
27. **Final Post-Routing Transition** - Exactly ten raw lines; verify the failed-gate set is complete for that epoch.
28. **Route 011 Baseline And Current Execution A** - Exactly ten raw lines; verify the focused and browser counts are preserved.
29. **Route 011 Baseline And Current Execution B** - Exactly ten raw lines; verify packet and reality outcomes are preserved.
30. **Rollback And Restore Probe** - Exactly ten raw lines; verify the expected revert conflict and successful abort are both shown.
31. **Canonical Selftest Regression** - Exactly ten raw lines; verify the PII failure location remains withheld but actionable.
32. **Route 016 Repository Binding And Current Epoch** - Exactly ten raw lines; verify all protected hashes match the accepted epoch.

### Audit Verdict And Routing

`REWORK_REQUIRED`. The engineering and persistent-test boundary is clean, but
the finding-owned closure record is not. Route first to `bubbles.analyst` to
consume or correct route 018 and produce the missing adjudication provenance.
The top-level runner must then dispatch `bubbles.ux` for the UX-owned spec
sections and reconcile the route/finding ledger through its owning phase.
`bubbles.docs` is not yet eligible. Scope, DoD, top-level status, human
acceptance, and `certification.*` remain unchanged.

## Implementation Boundary Review After Provenance Closure - 2026-09-03 {#bug007-implement-provenance-boundary-review-20260903}

**Phase:** implement
**Agent:** `bubbles.implement`
**Claim Source:** interpreted

The analyst, UX, design, and plan closure records require no product delta.
The current implementation already uses inheritance-free aggregation maps and
own-property reads for caller lookups. The persistent functional carrier covers
all six hostile subject and domain cases. The mutation carrier proves the
protective assertions remain causal without writing tracked files.

### Binding And Changed-Path Classification

**Claim Source:** executed

The inherited packet validated before repository-local inspection. The packet
contained seven modified planning and evidence artifacts. Every protected
source and persistent-test path had an empty staged and unstaged diff. Each
protected worktree blob matched its `HEAD` blob.

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=~/research-lab decision=rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:2 revision=2
BUG-007 IMPLEMENT BOUNDARY PRE-EDIT
head=ee8f872daa6bb9e0dc089e0cea1ab02a5c879ad8
packet_status_begin
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/bug.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/design.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/scopes.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/spec.md
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
 M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/test-plan.json
packet_status_end
protected_status_begin
protected_status_end
protected_unstaged_diff_begin
protected_unstaged_diff_end
protected_staged_diff_begin
protected_staged_diff_end
rlportfolio.worktree=81dd1f73bea5516fbffb76c459cdccae3984c415
rlportfolio.head=81dd1f73bea5516fbffb76c459cdccae3984c415
rlportfoliobrief.worktree=909a6af5bec57104282cbef72af70192b159beff
rlportfoliobrief.head=909a6af5bec57104282cbef72af70192b159beff
functional.worktree=511f0cf79b705f645cd3ac6c9097c338d8e16a6b
functional.head=511f0cf79b705f645cd3ac6c9097c338d8e16a6b
browser.worktree=b1c1d980981897b218f25e1abdd7222b17a1c557
browser.head=b1c1d980981897b218f25e1abdd7222b17a1c557
integrity.worktree=683da712352abd3145490842a0e636f7a400d272
integrity.head=683da712352abd3145490842a0e636f7a400d272
injector.worktree=20ed786006be23f542ec3c524758eda625567ea9
injector.head=20ed786006be23f542ec3c524758eda625567ea9
selftest.worktree=245dc3282c5e69dcea3e73498f1d59894e57fa1b
selftest.head=245dc3282c5e69dcea3e73498f1d59894e57fa1b
```

### Committed Delivery Boundary

**Command:**

```bash
cd ~/research-lab && printf '%s\n' 'BUG-007 COMMITTED DELIVERY BOUNDARY' && timeout 30 git show -s --format='commit=%H subject=%s' aad6fb52e && timeout 30 git diff-tree --no-commit-id --name-only -r aad6fb52e && timeout 30 git show -s --format='commit=%H subject=%s' d49a2955b && timeout 30 git diff-tree --no-commit-id --name-only -r d49a2955b && timeout 30 git show -s --format='commit=%H subject=%s' 82d1db5e5 && timeout 30 git diff-tree --no-commit-id --name-only -r 82d1db5e5 && timeout 30 git show -s --format='commit=%H subject=%s' 3688388d5 && timeout 30 git diff-tree --no-commit-id --name-only -r 3688388d5 && timeout 30 git show -s --format='commit=%H subject=%s' 4c9f2e87b && timeout 30 git diff-tree --no-commit-id --name-only -r 4c9f2e87b && printf '%s\n' 'commit_boundary_exit=0'
```

**Exit Code:** 0
**Claim Source:** executed

```text
BUG-007 COMMITTED DELIVERY BOUNDARY
commit=aad6fb52ebdafe5258ac77c74653c3b93770a4b5 subject=test(008): add BUG-007 prototype-key RED
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
tests/portfolio-brief.functional.mjs
tests/portfolio-survival-brief.spec.mjs
tests/portfolio-test-integrity.unit.mjs
commit=d49a2955b543433fc1fd502c1e346e3fd2888e11 subject=fix(008): harden brief caller keys
rlportfoliobrief.js
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json
commit=82d1db5e5819738aa4f5049ebe7078514408620c subject=test(BUG-007): prove mutation failure causality
tests/portfolio-defect-injector.cjs
tests/portfolio-test-integrity.unit.mjs
commit=3688388d5af8012e6adfad769c68c4c1034eab6d subject=fix(spec008): complete portfolio error contract
rlportfolio.js
rlportfoliobrief.js
tests/portfolio-brief.functional.mjs
commit=4c9f2e87b9738eece50c2f0f5b987046ee6ce7a8 subject=test(spec008): enforce portfolio error registry census
scripts/selftest.mjs
commit_boundary_exit=0
```

The observed path sets match the five implementation batches in the current
plan. The provenance repair adds no product behavior, source path, test path,
or shared-infrastructure obligation to those batches.

### Focused Functional Contract

**Executed:** YES (in current session)
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 implement boundary functional contract' -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 implement boundary functional contract
$ timeout 240 node --test tests/portfolio-brief.functional.mjs
exit: 0
lines: 42
sha256: 76cd8b1ba49a4a7a7010cca2530367ae9f8e1bafa6a3de8ded42040a59ab758b
--- first 20 ---
✔ only an eligible completion becomes behavior evidence and no excluded source can create or grow one (276.76172ms)
✔ route recomposition is invariant to behavior evidence and states that behavior contributes none (39.53966ms)
✔ behavior clear removes the committed evidence and returns recomposition to the pre-evidence baseline (90.977038ms)
✔ dismissal and automatic invalidation record a safe outcome and never a behavior event or a negative preference (19.21283ms)
✔ BUG-007: normal brief order and refusal precedence remain unchanged (6.64881ms)
✔ BUG-007: prototype-sensitive completion keys are safe own keys (5.839709ms)
✔ BUG-007: prototype-sensitive completion subjects are safe own keys (3.702006ms)
✔ BUG-007: prototype-sensitive completion domains are safe own keys (2.287503ms)
✔ BUG-007: own lookup semantics and RED cleanup preserve shared built-ins (5.134608ms)
✔ SCN-008-006 TP-05-01: each window is identified from the generic config and no later observation enters an earlier cutoff (2.735904ms)
✔ SCN-008-007 TP-05-01: the four qualification lanes stay separate and a subject is never duplicated across them (1.807403ms)
✔ SCN-008-010 TP-05-01: below the behavior floor the inferred lane is empty and the shortfall is named (2.019703ms)
✔ SCN-008-010 TP-05-01: unrelated completions cannot jointly clear an inferred domain floor (1.263402ms)
✔ SCN-008-007 TP-05-01: the visible queue is bounded by policy and ordered by materiality (1.075602ms)
✔ FR-064 a scoped subject with no surviving evidence is explained rather than dropped (1.191702ms)
✔ FR-064 subjects trimmed by the visible cap are accounted for, not silently discarded (1.848903ms)
✔ FR-060 and FR-061 each item routes to its owning tool or names the gap (0.983201ms)
✔ FR-067 the brief identity binds revision window cutoff policy and action set (1.379102ms)
✔ FR-041 the local action-history cutoff is a fourth clock and is actually enforced (1.465403ms)
✔ BUG-006: composeBrief validates shared evidence-age policy before Date formatting (4.819507ms)
--- omitted 2 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ FR-050 partial or stale evidence keeps its state and cannot support an action as if fresh (2.846505ms)
✔ SCN-008-008 TP-06-01: every item explains why it appears with the full FR-045 disclosure (1.290802ms)
✔ SCN-008-008 TP-06-01: recency decays on the declared half-life and expires past the age limit (1.753602ms)
✔ SCN-008-009 TP-06-01: settings and passive activity never become inferred interests (1.128902ms)
✔ SCN-008-034 TP-06-01: no authored action carries an order verb or a size instruction (1.156002ms)
✔ SCN-008-044 behavior identity civil time distinct floors and global ranking are canonical (21.835033ms)
✔ Adversarial: behavior identity and temporal guards prevent false relevance (8.572513ms)
✔ SCN-008-046 complete generic evidence validates all five inputs and resolves DST by New York civil time (5.083208ms)
✔ SCN-008-046 action candidates enforce generic freshness and one lifecycle reducer (3.786606ms)
✔ SCN-008-046 every public boundary emits a closed value-safe PortfolioError (1.982903ms)
✔ Adversarial: reduced brief evidence policy and API cannot satisfy the complete contract (2.144303ms)
✔ Regression: BUG-004 same-semantic occurrences cannot inflate relevance (100.069452ms)
ℹ tests 34
ℹ suites 0
ℹ pass 34
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 787.692694
```

The complete carrier passed 34 of 34 tests. It includes the normal-order,
hostile-key, subject, domain, lookup, cleanup, and parent error-contract checks.

### Mutation Causality And Post-Run Integrity

**Executed:** YES (in current session)
**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 implement boundary mutation causality' -- timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-007 implement boundary mutation causality
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: b35d4973ec5b19b3243a9728b599c5c1c78b038ebece47816cc92a906e8f57b1
--- output ---
✔ BUG-007: represented mutants execute one protective assertion through one intended hook (1520.391335ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1605.378066
```

**Claim Source:** executed

```text
BUG-007 POST-MUTATION PROTECTED INTEGRITY
protected_status_begin
protected_status_end
protected_unstaged_diff=clean
protected_staged_diff=clean
rlportfoliobrief=909a6af5bec57104282cbef72af70192b159beff
functional=511f0cf79b705f645cd3ac6c9097c338d8e16a6b
browser=b1c1d980981897b218f25e1abdd7222b17a1c557
integrity=683da712352abd3145490842a0e636f7a400d272
injector=20ed786006be23f542ec3c524758eda625567ea9
post_mutation_integrity_exit=0
```

The selector passed one of one. Its persistent test body verifies each shipped
protection against a represented mutant, one intended hook, one application,
and one protective assertion. It also verifies that tracked source and tests
retain their pre-run hashes.

### Seven-Finding Accounting

| Finding | Implement disposition |
| --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | Preserve addressed status from the analyst execution record. No implementation delta. |
| `AUDIT-B007-UX-OWNERSHIP-001` | Preserve addressed status from the UX execution record. No implementation delta. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Preserve unresolved external routing. Do not edit downstream framework files. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Preserve unresolved external routing. Do not edit downstream framework files. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Preserve unresolved external routing. Do not duplicate the existing proposal. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Preserve unresolved ownership in the existing repository packets. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Preserve unresolved validation ownership in BUG-025. |

### Implementation Disposition

No product source or persistent-test change is required. The current product
contract and its persistent carriers already satisfy the provenance-neutral
implementation boundary. This invocation changes only implement-owned evidence
and execution routing. Audit attempt `BUG-007-AUDIT-001` remains
`REWORK_REQUIRED`. Scope 01 remains `Not Started`. `TP-B007-011` and Build
Quality remain unchecked. Top-level and certification status remain
`in_progress`.

### Post-Edit Strict Packet And Diff Validation

**Executed:** YES (in current session)
**Command:**

```bash
cd ~/research-lab && timeout 120 node -e 'const f=require("node:fs"),a=require("node:assert/strict"),d="specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys",r=n=>f.readFileSync(`${d}/${n}`,"utf8"),mt=r("scenario-manifest.json"),m=JSON.parse(mt),p=JSON.parse(r("test-plan.json")),s=JSON.parse(r("state.json")),h=s.executionHistory.at(-1),A=["AUDIT-B007-ROUTE018-PROVENANCE-001","AUDIT-B007-UX-OWNERSHIP-001"],U=["VALIDATE-B007-G090-FRAMEWORK-001","VALIDATE-B007-CHECK8-AGENT-ID-001","VALIDATE-REPO-HANDOFF-CYCLE-001","VALIDATE-REPO-COLLECTED-TEST-COUNT-001","VALIDATE-REPO-STALE-RECEIPT-001"],c={scenario_manifest_json:!!m,test_plan_json:!!p,state_json:!!s,execution_owner_key_count:(mt.match(/"executionOwner"\s*:/g)||[]).length===1,manifest_owner:m.planningReconciliation.finalTreeRollbackRestore.executionOwner==="bubbles.test",plan_handoff:p.nextRequiredOwner==="bubbles.implement",state_phase:s.execution.currentPhase==="implement",state_route:s.execution.nextRequiredOwner==="bubbles.test",packet_nonterminal:s.status==="in_progress"&&s.certification.status==="in_progress",scope_nonterminal:s.execution.scopeInventory[0].status==="Not Started",audit_unchanged:s.execution.audit.attempts[0].auditVerdict==="REWORK_REQUIRED",addressed_partition:JSON.stringify(h.addressedFindings)===JSON.stringify(A),unresolved_partition:JSON.stringify(h.unresolvedFindings)===JSON.stringify(U),history_route:h.nextRequiredOwner==="bubbles.test",learning:h.learning.disposition==="not-applicable",report_anchor:(r("report.md").match(/\{#bug007-implement-provenance-boundary-review-20260903\}/g)||[]).length===1};for(const [k,v] of Object.entries(c)){a.equal(v,true,k);console.log(`${k}=PASS`)}' && timeout 30 git diff --check -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/report.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys/state.json && printf '%s\n' 'owned_diff_check=PASS' && timeout 30 git diff --quiet -- rlportfolio.js rlportfoliobrief.js scripts/selftest.mjs tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs tests/portfolio-defect-injector.cjs && printf '%s\n' 'protected_unstaged_diff=clean' && timeout 30 git diff --cached --quiet -- rlportfolio.js rlportfoliobrief.js scripts/selftest.mjs tests/portfolio-brief.functional.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-test-integrity.unit.mjs tests/portfolio-defect-injector.cjs && printf '%s\n' 'protected_staged_diff=clean' && printf '%s\n' 'strict_packet_and_diff_exit=0'
```

**Exit Code:** 0
**Claim Source:** executed

```text
scenario_manifest_json=PASS
test_plan_json=PASS
state_json=PASS
execution_owner_key_count=PASS
manifest_owner=PASS
plan_handoff=PASS
state_phase=PASS
state_route=PASS
packet_nonterminal=PASS
scope_nonterminal=PASS
audit_unchanged=PASS
addressed_partition=PASS
unresolved_partition=PASS
history_route=PASS
learning=PASS
report_anchor=PASS
owned_diff_check=PASS
protected_unstaged_diff=clean
protected_staged_diff=clean
strict_packet_and_diff_exit=0
```

This validation proves the current execution record and routing shape. It does
not certify the packet, close Scope 01, run `TP-B007-011`, or resolve any of the
five external or independent findings.

## Independent Test Verification After Provenance Closure - 2026-09-03 {#bug007-independent-test-provenance-closure-20260903}

**Phase:** test
**Executed:** YES (current session)
**Claim Source:** executed

This test-owned run independently inspected the current packet, product source,
persistent carriers, and complete seven-finding ledger. It made no product or
persistent-test change. The inherited repository packet validated as actionable
for `research-lab` at decision
`rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:2`, control revision `2`.

### Strict Packet, Provenance, And Route Resolution

**Commands:** canonical `scenario-test-resolve.sh`; an invocation-local strict
duplicate-key, non-finite-value, and trailing-content decoder over
`scenario-manifest.json`, `test-plan.json`, and `state.json`; an exact Markdown
to structured Test Plan parity discriminator; and a five-route carrier
discriminator over project-owned proposals and existing Research Lab packets.

**Exit Codes:** `0, 0, 0, 0`
**Claim Source:** executed

```text
[scenario-test-resolve] OK - 17 reference(s) resolved via literal-scan; 17 category comparison(s) not applicable (no test-discovery adapter declared)
scenario-manifest.json_strict_parse=PASS
test-plan.json_strict_parse=PASS
state.json_strict_parse=PASS
scenario_count_4=PASS
test_plan_row_count_13=PASS
tp011_planned_not_executed=PASS
manifest_execution_owner_unique=PASS
route018_resolved_by_analyst=PASS
analyst_execution_provenance=PASS
ux_execution_provenance=PASS
analyst_spec_anchor_unique=PASS
ux_spec_anchor_unique=PASS
design_no_product_delta=PASS
plan_four_scenarios_thirteen_rows_unchanged=PASS
audit_attempt_rework_required=PASS
current_addressed_partition=PASS
current_unresolved_partition=PASS
durable_addressed_ledger=PASS
durable_unresolved_ledger=PASS
finding_ledgers_disjoint=PASS
scope_not_started=PASS
tp011_checkbox_unchecked=PASS
build_quality_unchecked=PASS
packet_and_certification_in_progress=PASS
strict_packet_discriminator=PASS
markdown_test_plan_rows=13
json_test_plan_rows=13
markdown_unique_ids=13
json_unique_ids=13
markdown_json_row_order=PASS
four_scenarios_thirteen_rows=PASS
g090_state_route=PASS
g090_proposal_exists=PASS
check8_state_route=PASS
check8_proposal_exists=PASS
collected_count_state_route=PASS
spec022_packet_exists=PASS
spec023_packet_exists=PASS
spec024_packet_exists=PASS
bug025_packet_exists=PASS
handoff_cycle_state_route=PASS
handoff_cycle_external_reference_preserved=PASS
stale_receipt_state_route=PASS
all_five_remain_unresolved=PASS
external_proposals_repaired_claim_absent=PASS
```

The structured and Markdown plans each contain 13 unique rows in the same
order. The traceability guard below reports 14 raw table records because its
current extractor includes this table's `Plan ID` header; that raw diagnostic
is not used as the Test Plan row-count claim.

### Functional, Mutation, And Browser Carriers

**Commands:**

- `timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
- `timeout 30 npx --no-install playwright --version`
- `timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- `timeout 1800 npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs tests/portfolio-survival-risk.spec.mjs tests/portfolio-survival-paths.spec.mjs tests/portfolio-survival-diversification.spec.mjs tests/portfolio-survival-allocation.spec.mjs tests/portfolio-survival-mobile.spec.mjs tests/portfolio-survival-accessibility.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- `timeout 1800 node scripts/selftest.mjs`

**Exit Codes:** `0, 0, 0, 0, 0, 0`
**Claim Source:** executed

```text
focused_functional exit=0 lines=42 sha256=e05616851abed7ba3c42ca0a3f052680b018204a12f089e829625558974de1ae
focused_functional tests=34 pass=34 fail=0 cancelled=0 skipped=0 todo=0
focused_functional BUG-007 titles=5
mutation_canary exit=0 lines=9 sha256=115db4247feac4cbd9170906da5f08966e6b216c1dfb23f72a6469fb2e304bef
mutation_canary tests=1 pass=1 fail=0 cancelled=0 skipped=0 todo=0
playwright_version=Version 1.61.1
scenario_browser exit=0 lines=67 sha256=a2a9c3a9c4007b0ef03cf26161ce1f89a7dc9200e2b68976aafcf84c79cd591a
scenario_browser tests=19 pass=19 fail=0
scenario_browser BUG-007 visible constructor title=PASS
feature_browser exit=0 lines=305 sha256=bd3a5c8b4121672d3405b3cca79880b8bd098f503d14b06d24b69b4a9e6abc7b
feature_browser tests=95 pass=95 fail=0
canonical_selftest exit=0 lines=3912 sha256=e41b88b0010874e254b0bd480774f3fe772c24c749cdafba8893e03aad0a71ac
Research-Lab self-test: 3443 passed, 0 failed
historical TP-B007-000 rerun=NO
```

The focused suite directly exercises the ordinary fixture, all six hostile
subject/domain cases, own-versus-inherited lookups, cleanup, and the exact
seven-field error contract. The selected mutation carrier verifies one intended
hook, one application marker, one protective assertion, deliberate double-
application rejection, and direct-text carrier preservation. The browser run
uses the real page runtime and production preview/confirm controls.

### Packet, Reality, Regression, PII, And Provenance Checks

**Commands:** the six exact `CMD-B007-PACKET-GUARDS` children; canonical
`scenario-test-resolve.sh`; `implementation-reality-scan.sh --verbose`;
ordinary and `--bugfix` `regression-quality-guard.sh` over the three BUG-007
carriers; `node scripts/pii-scan.mjs`; `claim-source-lint.sh`; and
`execution-substate-guard.sh`.

**Exit Codes:** all `0`
**Claim Source:** executed

```text
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567 result=PASSED
traceability-guard exit=0 lines=68 sha256=79f400a41251ae7a105cc082bdc97c2127f1c66a5ac24fe6edb12923afa8e11a result=PASSED warnings=0
traceability scenarios=4 reported-test-rows-checked=14 mappedDoD=4
scenario-test-resolve references=17 unresolved=0
scenario-obligation-lint exit=0 scenarios=4 sha256=3979d4214fdb7145fa4cad82986c6a605516b95479ac3ed7f6308d0a62022a0b
test-mechanism-lint exit=0 mechanisms=4 mutationExecution=none-inert sha256=36ffdf83fc233d8197e21b38176847355aac161f635cd8a56fba0c9fa68295f6
scope-context-fit-lint exit=0 scopes=1 selfContained=1 sha256=7a84f3ca9c4d89bb763bfc95ee9d8247f3eb7fafed040311e53609f2ae6627d9
capability-foundation-guard exit=0 gate=G094 sha256=2f13ab2f63ec3af1bb62f76bf78f735847b51a97d37679d3d3fa77c14b1cea3c
implementation-reality exit=0 lines=35 files=6 violations=0 warnings=0 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83
regression-quality ordinary exit=0 files=3 violations=0 warnings=0 sha256=5ebb367b9a9dd91b4bd929fdbe415bb0590a6dcc1368e9249c07284ca3053bc2
regression-quality bugfix exit=0 files=3 adversarialFiles=3 violations=0 warnings=0 sha256=329a33daee310865dd563242f4d0e8d849d637dd63b679466351dac365d9743e
pii-scan exit=0 files=10785 messages=2555 findings=0 sha256=8019d6d3636a45a658a3c84c1715a0fe0eff8f0424e3e0d53ab05625644e6720
claim-source-lint exit=0 result=OK sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653
execution-substate-guard exit=0 result=OK sha256=b74a7708d4b21b384fecabc51716c01002cef29c028b9795d637037d2a9e7f46
```

No `testImpact`, `traceContracts`, or `observabilityWorkflow` contract is
declared for this packet, so no impact adapter or trace/SLO artifact is owed.

### Protected Source And Persistent-Test Bytes

**Command:** scoped staged/unstaged Git diff checks and `sha256sum` before and
after all selected test execution.

**Exit Code:** 0
**Claim Source:** executed

```text
protected_unstaged_diff=clean
protected_staged_diff=clean
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
4bdb4ab62f458c68507a1e91577e2380e0aff58115d622d5c573b367b959eaa3  rlportfolioanalytics.js
2912e92a182487ffa15fcb6124fef2f788aed7e0b73d4375057e6580451c0922  portfolio-survival-allocation-lab.html
829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
ef3189652a7532385c19f839a150336c1295a9ee9f095468afe19468888c832c  tests/portfolio-survival-brief.spec.mjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
source_test_delta=none
```

The before and after hashes are identical. This invocation changes only this
test-owned evidence section and authorized `state.json.execution.*` provenance;
it preserves earlier owner changes already present in the dirty packet.

### Seven-Finding Disposition And Handoff

| Finding | Independent test disposition |
| --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | Addressed by one `bubbles.analyst` execution record and the unique analyst spec anchor; independently verified, not reimplemented. |
| `AUDIT-B007-UX-OWNERSHIP-001` | Addressed by one `bubbles.ux` execution record and the unique UX spec anchor; independently verified, not reimplemented. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Unresolved external route retained; the Research Lab proposal exists and no framework repair is claimed. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Unresolved external route retained; the Research Lab proposal exists and no parser repair is claimed. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Unresolved external route retained; the foreign proposal reference is preserved without cross-repository mutation or repair claim. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Unresolved in the existing Specs 022, 023, 024, and BUG-025 packets; all four local packet carriers exist. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Unresolved in the existing BUG-025 packet and retained for `bubbles.validate`. |

Audit attempt `BUG-007-AUDIT-001` remains `REWORK_REQUIRED`. `TP-B007-011`
and Build Quality remain unchecked. Scope 01 remains `Not Started`; top-level
and certification status remain `in_progress`. Route next to
`bubbles.validate` for certification or blocked disposition.

## Certification Attempt And Local-Phase Routing - 2026-09-03 {#bug007-validation-certification-attempt-20260903}

**Phase:** validate
**Agent:** `bubbles.validate`
**Executed:** YES (current session)
**Claim Source:** interpreted
**Interpretation:** Current product replay and packet checks are green, but the
registry-bound `done` transition is not. The guard fails `G022`, `G027`, and
`G090` across completion, all-scopes-done, contract, and file-existence checks.
The active mode still has locally runnable `stabilize`, `devops`, and `security`
phases before terminal validation and audit. The correct disposition is
`route_required` to the first missing local owner, `bubbles.stabilize`, rather
than an external-only block or a certification promotion.

### Binding And Fresh Transition Contract

The inherited packet validated before repository-local work. Its binding remains
unchanged: repository `research-lab`, decision
`rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:2`, control revision `2`, and
actionable local root `~/research-lab`.

**Command:** `timeout 60 bash .github/bubbles/scripts/transition-contract-resolver.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys`
**Exit Code:** 0
**Claim Source:** executed

```text
schemaVersion=transition-contract/v1
workflowMode=bugfix-fastlane
auditProfile=delivery-completion-v1
statusCeiling=done
targetStatus=done
currentStatus=in_progress
contractDigest=sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision=sha256:605f9532a870c246eca0b2dbbf966cbb16532f0346d4c97b1a39fa9e662562fd
phaseOrder=select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize
sourceEditLockoutRequired=false
```

### TP-B007-011 Asserted Transition Result

**Command:** `timeout 720 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 TP-B007-011 asserted transition current validation' -- timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --expect-workflow-mode bugfix-fastlane --target-status done --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-007 TP-B007-011 asserted transition current validation
$ timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-007-compose-brief-prototype-sensitive-keys --expect-workflow-mode bugfix-fastlane --target-status done --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
exit: 1
lines: 369
sha256: b471b55ab11ae0dcaf8764e6eaf6178969fe78bf6df553eec9a430556448dd4a
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
targetRevision: sha256:605f9532a870c246eca0b2dbbf966cbb16532f0346d4c97b1a39fa9e662562fd
applicableCheckClasses: [universal,mode-required,delivery-completion]
notApplicableChecks: []
passedGateIds: [G057,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G094,G095,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G022,G027,G090]
failedChecks: [Check-4-completion,Check-5-all-done,Check-8-contract,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
parentExpandedPhases: 0
failureCount: 17
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

`TP-B007-011` therefore remains unchecked. Build Quality remains unchecked,
Scope 01 remains `Not Started`, and both status mirrors remain `in_progress`.
No validate phase claim, certified scope, certification timestamp, terminal
status, or audit-attempt rewrite is authorized by this result.

### Current Validation Replay

**Claim Source:** interpreted
**Interpretation:** Each row below restates a current-session terminal or
evidence-capture result with its observed exit status, count, and full-output
hash where the command produced a capture block. The raw `TP-B007-011` result
above remains the transition authority; green product checks do not convert its
nonzero verdict into certification.

```text
pages_build exit=0 lines=1 sha256=e8f3e909076799aee06e386be1092e9e344b90aa5060905c10cec77bbcad90e3 registeredPages=29
focused_functional exit=0 lines=42 sha256=8cf1e51e836920ba52281e966610855974ba3ade3305cebe9ec4b4a909386aef tests=34 pass=34 fail=0 skipped=0
mutation_causality exit=0 lines=9 sha256=6c09d6214f0ab317f40b8e87fd54729778a8865b1eb9e8ae53dfe98d66f28c29 tests=1 pass=1 fail=0 skipped=0
playwright_version=Version 1.61.1
scenario_browser exit=0 lines=67 sha256=8254e5be5c73fc083916ac0c6895365e3f55f44d4919d7e2f8c79233c1baa4f3 tests=19 pass=19 fail=0
feature008_browser exit=0 lines=305 sha256=31fb554ef980b2817aad902216ee7a1e537791095f3d313a054357c24fb2f37c tests=95 pass=95 fail=0
canonical_selftest exit=0 lines=3912 sha256=13cb6a78b9ecbb29a059a29b53482fc3fd13dc2af6e33f100e9e3d3adbea1b14 checks=3443 pass=3443 fail=0
registered_unit exit=0 lines=676 sha256=d3749eee6a14057cd325aacf9145835e22c9816a6710fe6aaf1ea4a3563ae3fc tests=666 pass=666 fail=0 skipped=0
registered_integration exit=0 lines=62 sha256=0be77e9172a163e4348901b74d8fcf9e9dc6eb4383544876d7f34dd91a67edd9 tests=37 pass=37 fail=0 skipped=0
registered_security exit=0 lines=27 sha256=32fbeeb885af2dda4981ade980147339aa4dc2400cd12effac20377c081ee8e1 tests=19 pass=19 fail=0 skipped=0
registered_load exit=0 lines=33 sha256=99d83bcd2395b983f1eda6a6a57b06c5dd343bcffe49a64ed20223606f0f22b5 tests=2 pass=2 fail=0 skipped=0
registered_stress exit=0 lines=50 sha256=a6f5617c90cecc280cdad14fe8758d53e128ef2dfe31f4c1cfba105570f20cd4 tests=9 pass=9 fail=0 skipped=0
goal_fidelity exit=0 lines=1 sha256=3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46
artifact_lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
traceability exit=0 lines=68 sha256=b0e5a0fe842f4edef7a19f446b31e14467b7333f5d559bcacc6a97e9526a2244 scenarios=4 warnings=0
scenario_obligations exit=0 scenarios=4
test_mechanisms exit=0 mechanisms=4 mutationExecution=none-inert
scope_context_fit exit=0 scopes=1 selfContained=1
capability_foundation exit=0 gate=G094
regression_quality exit=0 lines=16 sha256=fe1e78079560fe5e5559053783cf48318b219c00b81145c0c9315f0d59c50a9b files=3 violations=0 warnings=0
regression_quality_bugfix exit=0 files=3 adversarialFiles=3 violations=0 warnings=0
scenario_links exit=0 lines=1 sha256=fe33cbfb63d9c653f7daac337b52e256046b23dda2a25f280ab1ba2603b9b838 references=17 unresolved=0
implementation_reality exit=0 lines=35 sha256=f7b743e57927fc4c88c8f0acb327c98ab610136797aebc565ac3263109b01c83 files=6 violations=0 warnings=0
artifact_freshness exit=0 lines=20 sha256=ecf2dd11419cd07ab57baa17f53655457e4e6a90254bfafd6241b16ae7aa5bab failures=0 warnings=0
claim_source exit=0 lines=1 sha256=6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653
execution_substate initial=invalid-route_required repaired=needs_reverification rerun_exit=0
pii_scan exit=0 lines=1 sha256=8019d6d3636a45a658a3c84c1715a0fe0eff8f0424e3e0d53ab05625644e6720 findings=0
changed_spec_audit exit=0 lines=18 sha256=7f90a9c9580c07f0127ecae0742d6d3446e4230c93252ee3a11b5eb2f7c51891 doneSpecs=0 artifactLintPassed=1
framework_write_guard exit=0 lines=6 sha256=70088ae5335b50a3b78b2d69ea25ac658de8bdcf95a29c68f40d4f4552f21ce2
repo_readiness exit=0 lines=31 sha256=d16dc2bfd5aab2d39553799c1f3d81aa2afcbffc20157f02d2e217c111c6e0a1 pass=9 warn=0 fail=0
slo_guard exit=0 lines=1 sha256=2079b4a7a16b34289e44c11606457351773c1e059a3b4e49440f20f8d1ada585 posture=undeclared no-op=true
strict_json state=PASS test_plan=PASS scenario_manifest=PASS
protected_source_test_diff unstaged=clean staged=clean
historical_red_rerun=NO
lint_command=NOT_DECLARED
format_command=NOT_DECLARED
testImpact=NOT_CONFIGURED
traceContracts=NOT_CONFIGURED
```

### Nonzero Diagnostics And Ownership

These results remain nonzero and are not represented as passes:

```text
asserted_transition exit=1 lines=369 sha256=b471b55ab11ae0dcaf8764e6eaf6178969fe78bf6df553eec9a430556448dd4a failedGates=G022,G027,G090 failureCount=17
canonical_handoff_cycle exit=1 lines=109 sha256=4d6638101ec7387bfacff5dcdc1db411be399d62e21cf39a67fef44bb0f0d193 result=cycle-detected
framework_doctor exit=1 lines=187 sha256=4d94299eaa90a552e0ad00288515b05164e49234cdc3d37dfaf2e90e8557e70e pass=20 fail=1 advisory=81
collected_test_count exit=1 lines=48 sha256=2632f651b08e8fe5c30859e4c9f02fe8e24daa63bbbaa56a066321718c0b147a zeroCollectionBlocks=19
receipt_freshness exit=1 lines=16 sha256=35ba52500cbead0dda561743715b818f304462a3f688e3a1a6f41914a3926fc7 current=1802 valid=55 stale=1 unknown=1746 staleOwner=BUG-025
```

The handoff cycle is the existing external framework finding. The doctor and
detailed count guard preserve the independent repository evidence finding. The
strict receipt report names only the existing BUG-025 receipt. None is closed or
reclassified by this validation attempt.

### Seven-Finding Accounting

| Finding | Current validation disposition | Evidence or preserved owner |
| --- | --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | Addressed one-to-one; independently preserved. | `spec.md#bug007-route-018-analyst-adjudication-20260902` and the `bubbles.analyst` execution record. |
| `AUDIT-B007-UX-OWNERSHIP-001` | Addressed one-to-one; independently preserved. | `spec.md#bug007-ux-provenance-adjudication-20260903` and the `bubbles.ux` execution record. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Unresolved `blocking-external`; not claimed fixed. | Existing Research Lab proposal; `G090` is present in the current failed-gate set. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Unresolved `blocking-external`; not claimed fixed. | Existing Research Lab proposal; current failed checks include `Check-8-contract` and `Check-8-file-existence`. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Unresolved `blocking-external`; not claimed fixed. | Existing GuestHost proposal and canonical Bubbles ownership remain unchanged. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Unresolved `independent`. | Existing Spec 022, Spec 023, Spec 024, and BUG-025 packets remain the owners. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Unresolved `independent`. | Existing BUG-025 packet remains owned by `bubbles.validate`; no stale receipt is relabeled here. |

### Routing Disposition

Outcome is `route_required` to `bubbles.stabilize`, the first missing local
phase in the resolved `bugfix-fastlane` order after `harden`. The external
findings remain unresolved in parallel, but they do not justify skipping the
locally runnable phase chain. Audit attempt `BUG-007-AUDIT-001` remains
`REWORK_REQUIRED` and byte-for-byte unchanged.

## Stabilize Stability Profile - 2026-09-03 {#bug007-stabilize-profile-20260903}

**Phase:** stabilize
**Agent:** `bubbles.stabilize`
**Executed:** YES (current session)
**Claim Source:** interpreted
**Interpretation:** The registered build-free Node/browser profile is stable at
the observed epoch. Two independent functional runs produce the same 34-test
behavioral outcome. The mutation canary exercises its intentional failure paths
and cleanup. The real browser suite, registered load suite, and registered
stress suite terminate inside their bounds. Protected source and test hashes,
Git state, temporary-directory count, and matching process count are unchanged
after execution. No product stability defect was observed. Security review is
not claimed by this phase.

The inherited repository packet validated as actionable for `research-lab` at
decision `rb:vscode-7cd676ca5a49627fa13a2a070cfcf200:2`, control revision `2`,
before repository-local reads or execution.

### Repeatability And Determinism

**Commands:**

- `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize repeatability functional run 1' -- timeout 240 node --test tests/portfolio-brief.functional.mjs`
- `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize repeatability functional run 2' -- timeout 240 node --test tests/portfolio-brief.functional.mjs`

**Exit Codes:** `0, 0`
**Claim Source:** interpreted
**Interpretation:** Both independent runs collect the same 34 tests, pass the
same 34 tests, and report zero failures, cancellations, skips, and TODOs. Both
include all five BUG-007 titles and the parent error-contract title. The full
capture hashes differ because Node reports measured per-test durations; no
byte-for-byte console-output identity is claimed.

```text
run=1 exit=0 lines=42 sha256=b218c89bf7ed100f977f87cc21282d278910d57bfffc92e8ae881be2f786097f
run=1 tests=34 pass=34 fail=0 cancelled=0 skipped=0 todo=0
run=1 BUG-007 normal brief order and refusal precedence remain unchanged=PASS
run=1 BUG-007 prototype-sensitive completion keys are safe own keys=PASS
run=1 BUG-007 prototype-sensitive completion subjects are safe own keys=PASS
run=1 BUG-007 prototype-sensitive completion domains are safe own keys=PASS
run=1 BUG-007 own lookup semantics and RED cleanup preserve shared built-ins=PASS
run=2 exit=0 lines=42 sha256=fc3448c6bbe4ff8e00fac26d636d1b57b87a008ff3db413aab706e9c8745c2d6
run=2 tests=34 pass=34 fail=0 cancelled=0 skipped=0 todo=0
run=2 BUG-007 normal brief order and refusal precedence remain unchanged=PASS
run=2 BUG-007 prototype-sensitive completion keys are safe own keys=PASS
run=2 BUG-007 prototype-sensitive completion subjects are safe own keys=PASS
run=2 BUG-007 prototype-sensitive completion domains are safe own keys=PASS
run=2 BUG-007 own lookup semantics and RED cleanup preserve shared built-ins=PASS
repeatability_behavioral_outcome=PASS
```

### Failure-Path Cleanup Canary

**Command:** `timeout 360 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize failure-path cleanup canary' -- timeout 240 node --test --test-name-pattern='^BUG-007: represented mutants execute one protective assertion through one intended hook$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** `0`
**Claim Source:** interpreted
**Interpretation:** The selected test runs the three represented BUG-007
mutants, deliberate double-application refusal, direct-text control, and
uncoordinated zero-anchor refusal. Its assertions require one intended hook,
one application marker, one selected protective assertion, no infrastructure-
origin false pass, unchanged tracked bytes, and removal of its temporary
workspace through the registered `t.after` cleanup.

```text
# BUG-007 stabilize failure-path cleanup canary
$ timeout 240 node --test --test-name-pattern=^BUG-007: represented mutants execute one protective assertion through one intended hook$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 9
sha256: 13101832b2a9e542bc977fdd7bb10805e0d221601fb3200c9f2cf979e735a78b
BUG-007: represented mutants execute one protective assertion through one intended hook=PASS
tests=1
pass=1
fail=0
cancelled=0
skipped=0
todo=0
failure_path_cleanup_canary=PASS
```

### Browser, Load, And Stress Bounds

**Commands:**

- `timeout 30 npx --no-install playwright --version`
- `timeout 1020 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize real-browser cleanup and operability' -- timeout 900 npx --no-install playwright test tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
- `timeout 1020 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize registered load profile' -- timeout 900 node --test tests/*.load.mjs`
- `timeout 1500 bash .github/bubbles/scripts/evidence-capture.sh --label 'BUG-007 stabilize registered stress profile' -- timeout 1400 node --test tests/*.stress.mjs`

**Exit Codes:** `0, 0, 0, 0`
**Claim Source:** executed

```text
playwright_version=Version 1.61.1
browser exit=0 lines=67 sha256=088c0bcb9e062501d5fd21e0b197c10eddfc5690f80281cbea8b7c8dc139eec4
browser tests=19 pass=19 fail=0
browser BUG-007 visible constructor and hostile-key title=PASS
browser duration=30.9s bound=900s
load exit=0 lines=33 sha256=91d8b46d8f6e176c69471be838b645ad854a385d4f1ea074023f0ed3a1486284
load tests=2 pass=2 fail=0 cancelled=0 skipped=0 todo=0
load authoritative_history_references=124 expected=124
load largest_jsonl_row_bytes=355 budget_bytes=65536
load largest_month_partition_bytes=43927 budget_bytes=4194304
load history_index_bytes=33237 budget_bytes=1048576
load parallel_browser_contexts=8 isolated_keys=8 key_leaks=0
load duration_ms=6678.831605 bound_ms=900000
stress exit=0 lines=50 sha256=dff7abe47c47731fec0cfe0fac1a7c732001641eb460428e967e2d4bee2631cd
stress tests=9 pass=9 fail=0 cancelled=0 skipped=0 todo=0
stress author_pool_peak_concurrency=4 ceiling=4
stress all_source_retry_over_budget=REFUSED
stress run_attempt_over_budget=REFUSED
stress credential_cycles=250 roundtrips=250
stress proxy_key_leaks=0 tier2_requests_missing_key=0 key_leaks=0
stress legacy_storage_offenders=0
stress duration_ms=7728.560988 bound_ms=1400000
browser_load_stress_profile=PASS
```

The load and stress commands are the repository-wide registered categories.
BUG-007 declares no latency SLO or bug-specific load row, so these executions
prove the configured bounded profiles remain green; they do not invent a
`composeBrief()` latency threshold.

### Source Lock, Protected Bytes, And Residue

**Commands:** `timeout 120 node scripts/validate-node-source-lock.mjs`; pre-run
and post-run `timeout 60 sha256sum` plus scoped staged and unstaged
`git diff --exit-code` over the nine protected source/test paths; pre-run and
post-run nullglob census of `/tmp/rl-bug007-integrity-*`; and bounded `pgrep`
checks for BUG-007, Playwright, provider-test, portfolio-test, and
remote-debugging Chrome processes.
**Exit Code:** `0`
**Claim Source:** executed

```text
node_source_lock manifest=PASS private=true runtimeDependencies=0 scripts=0 playwright=1.61.1 node=>=20
node_source_lock npmrc=PASS entries=5 ignoreScripts=true
node_source_lock lockfile=PASS version=3 externalPackages=3 integrity=sha512
node_source_lock graph=PASS playwright=1.61.1 playwright-core=1.61.1 fsevents=2.3.2
node_source_lock adversarial=16 unexpectedAcceptances=0
ab595e803f91192234a14bfd4927c5fcb0394b3977c9dbfea5d4a6b7a05f20c0  rlportfolio.js
2c9805a22d683c407ed03c8a99b2d67b688d704ef79f2b9bab46dea6992a8d30  rlportfoliobrief.js
4bdb4ab62f458c68507a1e91577e2380e0aff58115d622d5c573b367b959eaa3  rlportfolioanalytics.js
2912e92a182487ffa15fcb6124fef2f788aed7e0b73d4375057e6580451c0922  portfolio-survival-allocation-lab.html
829fb8512bf5430106318aaeb21e562504b0a8e39b4ca8b48ab9e4e8ca11e60a  scripts/selftest.mjs
875825213e53b071374454a8acd232c506f351237781ca8665de876439a95124  tests/portfolio-brief.functional.mjs
ef3189652a7532385c19f839a150336c1295a9ee9f095468afe19468888c832c  tests/portfolio-survival-brief.spec.mjs
77103344c2881b11b5178be42f7721529059d6affaea948822362128d866d39e  tests/portfolio-test-integrity.unit.mjs
6b7520dfad7f348ef6ce7424d0a4337189f175d224eb7e4e7f24b616c6c8cab0  tests/portfolio-defect-injector.cjs
pre_run_protected_unstaged_diff=clean
pre_run_protected_staged_diff=clean
post_run_protected_unstaged_diff=clean
post_run_protected_staged_diff=clean
pre_run_temp_residue_count=0
post_run_temp_residue_count=0
pre_run_matching_process_state=none
post_run_matching_process_state=none
playwright_residue_state=none
protected_hashes_before_equal_after=PASS
resource_and_residue_cleanup=PASS
```

### Stability Domain Inventory

| Domain | Current-session result | Grounding |
| --- | --- | --- |
| Reliability and determinism | Clean | Two independent 34/34 functional outcomes retain identical collected/pass/fail/skip counts and all five BUG-007 titles. |
| Failure behavior | Clean | The exact 1/1 mutation canary rejects infrastructure-origin discrimination and restores its temporary workspace. |
| Browser runtime | Clean | The exact 19/19 `system-chrome` suite includes the hostile-key matrix and visible `constructor` flow; no matching process remains. |
| Performance and bounds | Clean | Registered load is 2/2 and stress is 9/9 inside explicit command bounds; declared concurrency, byte, history, retry, and cycle ceilings hold. |
| Resource usage and residue | Clean | Temporary-directory counts remain zero and no matching Node or remote-debugging Chrome process survives. |
| Build and dependency reproducibility | Clean | The source-lock validator accepts the exact graph and rejects all 16 adversarial drift cases; Playwright is exactly 1.61.1. |
| Configuration and deployment | No BUG-007 stability finding | The packet changes no runtime config or deployment surface. Research Lab has no service lifecycle for this static browser bug, and no `traceContracts` or test-impact config is declared. |

### Seven-Finding Accounting

| Finding | Stabilize disposition |
| --- | --- |
| `AUDIT-B007-ROUTE018-PROVENANCE-001` | Addressed remains addressed. The stabilize profile neither reopens nor reimplements the analyst-owned closure. |
| `AUDIT-B007-UX-OWNERSHIP-001` | Addressed remains addressed. The stabilize profile neither reopens nor reimplements the UX-owned closure. |
| `VALIDATE-B007-G090-FRAMEWORK-001` | Unresolved external framework finding remains unresolved. No downstream framework file changed. |
| `VALIDATE-B007-CHECK8-AGENT-ID-001` | Unresolved external framework finding remains unresolved. No parser repair is claimed. |
| `VALIDATE-REPO-HANDOFF-CYCLE-001` | Unresolved external framework finding remains unresolved. No cross-repository repair is claimed. |
| `VALIDATE-REPO-COLLECTED-TEST-COUNT-001` | Unresolved independent repository finding remains unresolved in its existing packets. |
| `VALIDATE-REPO-STALE-RECEIPT-001` | Unresolved independent repository finding remains unresolved in the existing BUG-025 packet. |

Audit attempt `BUG-007-AUDIT-001` remains `REWORK_REQUIRED`. `TP-B007-011`,
Build Quality, Scope 01, top-level status, and certification remain unchanged.
No new stability finding was raised.

### Stability Verdict

🟢 STABLE

All applicable stability checks passed across reliability, failure cleanup,
browser lifecycle, bounded performance, resource residue, dependency
reproducibility, and protected-byte integrity. No stability remediation is
required. Planning and scope artifacts updated: NO. Tests added or updated: 0.

### Stabilize Phase Return

The Stabilize Tier 2 profile is satisfied: the applicable domains were
reviewed, each conclusion is grounded in current-session execution, no fix was
required, and no new planning obligation exists. The canonical artifact lint,
Claim Source lint, and report diff check pass after the evidence append.

Execution routing now records `stabilize` and returns `route_required` to
`bubbles.devops`, the next phase in the active `bugfix-fastlane` order. Because
this invocation is owned by the top-level workflow, no duplicate specialist
`executionHistory` row is appended; the parent runner owns that row. Learning
disposition is `not-applicable`: the run confirmed the existing cleanup and
bounded-execution contracts without discovering a new reusable lesson.

The two addressed audit IDs remain addressed and the five unresolved IDs
remain unresolved under their existing ownership. Audit attempt
`BUG-007-AUDIT-001` remains `REWORK_REQUIRED`. `TP-B007-011`, Build Quality,
Scope 01, top-level status, and certification remain unchanged.
