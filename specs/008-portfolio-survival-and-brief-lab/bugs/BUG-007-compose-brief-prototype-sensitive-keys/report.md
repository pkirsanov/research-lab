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
- Kept the parent Feature 008 scope and root test-plan transaction untouched.

## Completion Statement

The bounded implementation and test-owned obligations TP-B007-001 through
TP-B007-010 are GREEN in the current session. The test phase routes to
`bubbles.regression`; later quality phases, human acceptance, TP-B007-011, and
validate-owned certification remain explicit gates. Packet status remains
`in_progress`; no human-acceptance item, certification field, scope terminal
status, or spec terminal status is changed.

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
**Command:** `timeout 240 node --test tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Evidence:** [Current mutation evidence](#bug007-current-mutation-integrity)

Both integrity titles passed. The BUG-007 title applies each of the three exact
in-memory substitutions once, requires its named protective title to fail, and
hash-compares all four tracked product/test inputs before and after execution.

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
currentOwner: bubbles.test
nextRequiredOwner: bubbles.regression
bug: BUG-007-compose-brief-prototype-sensitive-keys
addressedFindings:
  - SEC-B006-S1-IMPLEMENTATION
  - SEC-B006-S1-TEST
unresolvedFindings: []
evidence:
  - report.md#bug007-current-focused-functional
  - report.md#bug007-current-mutation-integrity
  - report.md#bug007-current-scenario-browser
  - report.md#bug007-current-feature-e2e
  - report.md#bug007-current-selftest
  - report.md#bug007-current-receipt-integrity
reason: TP-B007-001 through TP-B007-010 pass with current receipts; regression is the next bugfix-fastlane owner while acceptance, TP-B007-011, certification, and terminal status remain open.
```
