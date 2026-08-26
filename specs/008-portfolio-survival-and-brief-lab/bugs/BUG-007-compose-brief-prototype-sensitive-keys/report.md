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

The bounded implementation, test, independent regression, simplify, and gaps
checks are GREEN at the current tree. Gaps found no source, persistent-test,
scenario, Test Plan, DoD-shape, or implementation-reality delivery gap. It
corrected the report's time-sensitive receipt wording and routes to
`bubbles.harden`; later quality phases, human acceptance, TP-B007-011, and
validate-owned certification remain explicit gates. Packet status remains
`in_progress`; no human-acceptance item, DoD checkbox, structured Test Plan
status, receipt identity, certification field, scope terminal status, or spec
terminal status is changed.

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
