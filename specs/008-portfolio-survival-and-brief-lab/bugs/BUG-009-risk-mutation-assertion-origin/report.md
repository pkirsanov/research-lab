# Report: BUG-009 Risk Mutation Assertion Origin

## Summary

- The focused `assetTreatment()` carrier and the single
  `F008-RISK-INPUT-001` registry remap are implemented and verified.
- Current recorded execution is focused shipped `1/1`, exact mutant `0/1`
  through required `ERR_ASSERTION`, strict registry `3/3`, full risk `3/3`,
  five BUG-008 carriers `43/43`, risk browser `13/13`, and canonical selftest
  `3426/3426`.
- Regression, simplify, gaps, and the sanctioned setup prerequisite are
  complete. The installed downstream G028 scan resolves both declared files
  with `0` violations and `0` warnings.
- The independent harden execution battery passes, but harden is not complete:
  it found and routed four control-plane findings. This reconciliation addresses
  only planner-owned `HARDEN-B009-002`; `HARDEN-B009-001` was already addressed,
  and `HARDEN-B009-003..004` remain open.
- The next required owner is `bubbles.design` for `HARDEN-B009-003`. The bug
  finding retains its separate owner.
- Historical before/after evidence, including the earlier `3425/3426` failure,
  remains intact. Product source, tests, DoD, scope status, human acceptance,
  certification, BUG-007, BUG-008, and parent Feature 008 artifacts are
  unchanged by this reconciliation.

## Completion Statement

The owned test repair and every test execution claimed by this report are
implemented and verified. Regression, simplify, gaps, and sanctioned setup are
complete; installed downstream G028 scans `2` files with `0` violations and
`0` warnings. Independent harden execution checks pass, but harden remains
incomplete because that pass routed four control-plane findings. This change
reconciles planner lifecycle metadata, addresses only `HARDEN-B009-002`, and
resolves `BUG-009-ROUTE-009`. The design and bug findings stay open, with
`bubbles.design` next for `HARDEN-B009-003`. BUG-009 remains `in_progress`, the
scope remains In Progress, every DoD item remains unchecked, and human
acceptance and certification remain untouched and unclaimed.

## Test Evidence

### Current-Session Strict Registry RED {#current-session-strict-registry-red}

**Phase:** bug
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-008-strict-registry-after-seven" -- node --test --test-name-pattern='^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-008-strict-registry-after-seven
$ node --test --test-name-pattern=^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$ tests/portfolio-test-integrity.unit.mjs
exit: 1
lines: 60
sha256: 46abaadc1994aabd750e4510fade07247c76cca617ddcc012147ea255230eba1
--- first 20 ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
not ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 7012.305938
  type: 'test'
  location: '~/research-lab/tests/portfolio-test-integrity.unit.mjs:377:1'
  failureType: 'testCodeFailure'
  error: |-
    audited defect classes that are NOT load-bearing:
      F008-RISK-INPUT-001 (scope 21, tests/portfolio-risk.functional.mjs): mutant failure did not originate from the selected protective assertion

    per-case:
      F008-PORTFOLIO-LIFECYCLE-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-CLEAR-RUNTIME-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-CLEAR-TEST-001 scope=17 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BEHAVIOR-CONTRACT-001 scope=18 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BAR-COVERAGE-001 scope=19 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=fs.readFileSync
      F008-BRIEF-EVIDENCE-001 scope=20 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
      F008-BRIEF-POLICY-001 scope=20 shipped=1/1 mutant=0/1 mutant-fail=1 applications=1 hook=Module._compile
--- omitted 20 line(s); sha256 above covers the full output ---
--- last 20 ---
  expected:
  actual:
    0: 'F008-RISK-INPUT-001 (scope 21, tests/portfolio-risk.functional.mjs): mutant failure did not originate from the selected protective assertion'
  operator: 'deepStrictEqual'
  stack: |-
    TestContext.<anonymous> (file://~/research-lab/tests/portfolio-test-integrity.unit.mjs:462:10)
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
# duration_ms 7119.516935
```

The stored hash covers the complete unsanitized source output. The displayed
block replaces local home prefixes with `~` under repository evidence policy.

### Operator-Supplied Prior Capture {#operator-supplied-prior-capture}

**Phase:** bug
**Claim Source:** not-run
**Source:** operator statement in the current invocation

The operator supplied exit `1`, 60 lines, and SHA-256
`c392d0bfa3891689ea12cc649a3fb1ddef9f35bfd49e1b8af651a70dec3aa238` for the same
command. The fresh current-session capture produced the same sole finding but a
different hash, `46abaadc...`, so this packet keeps the prior hash as diagnostic
input and does not restate it as current-session execution evidence.

### Selected Title Mutant Origin {#selected-title-mutant-origin}

**Phase:** bug
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009-selected-title-mutant-origin" -- env NODE_OPTIONS="--require $HOME/research-lab/tests/portfolio-defect-injector.cjs" RL_DEFECT_MODULE="rlportfolioanalytics.js" RL_DEFECT_FIND_B64="ICAgICAgZWxzZSBleGNsdWRlZC5wdXNoKHsgc3ltYm9sOiBoLnN5bWJvbCwgYXNzZXRUeXBlOiBoLmFzc2V0VHlwZSB8fCAidW5rbm93biIgfSk7" RL_DEFECT_REPLACE_B64="ICAgICAgZWxzZSByZXR1cm4geyBzdGF0ZTogInVuc3VwcG9ydGVkLWhvbGRpbmciLCBzeW1ib2w6IGguc3ltYm9sIH07" RL_DEFECT_MARKER="/tmp/research-lab-bug009-risk-marker-2046708" node --test --test-reporter=tap --test-name-pattern='^SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output$' tests/portfolio-risk.functional.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-009-selected-title-mutant-origin
exit: 1
lines: 27
sha256: 279edba7e9164b542c5206385b7ad9fc1a79815d39511a1af9d61396139a523f
--- output ---
TAP version 13
# Subtest: SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
not ok 1 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
  ---
  duration_ms: 7.64935
  type: 'test'
  location: '~/research-lab/tests/portfolio-risk.functional.mjs:43:1'
  failureType: 'testCodeFailure'
  error: "Cannot read properties of undefined (reading 'state')"
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: |-
    TestContext.<anonymous> (file://~/research-lab/tests/portfolio-risk.functional.mjs:94:54)
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
# duration_ms 92.671072
```

This output directly proves the current mapped title fails for a non-assertion
reason. It does not satisfy the required post-repair mutation RED.

### Current-Tree Root Cause Inspection {#current-tree-root-cause-inspection}

**Phase:** bug
**Claim Source:** interpreted
**Interpretation:** The executed failure aligns with the controlling source and
test paths. The current mapping is broader than the contract changed by the
mutation.

| Anchor | Current-tree fact |
| --- | --- |
| Registry entry | `F008-RISK-INPUT-001` replaces the named exclusion push with an early return and selects the whole-projection `SCN-008-047` title. |
| Causality predicate | The strict registry requires the selected title, `not ok 1`, and `ERR_ASSERTION`; runtime rubble is insufficient. |
| Production owner | `assetTreatment()` returns state, market inclusion, named exclusions, and look-through diagnostics, and is exported. |
| Current carrier | The mapped title reaches `projection.assetTreatment.lookThrough.state` after many unrelated projection assertions. |
| Exact failure | The mutant removes the nested look-through shape, producing `TypeError` and `ERR_TEST_FAILURE` at that access. |

### TP-B009-001 Focused Shipped-Source GREEN {#tp-b009-001}

**Phase:** test
**Command:** `timeout 240 node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 focused shipped source
$ node --test --test-name-pattern=^BUG-009 risk mapping: unsupported holdings remain named exclusions$ tests/portfolio-risk.functional.mjs
exit: 0
lines: 16
sha256: 6b0dba9e5271e14283e9bdc801ac673886f7daa8b57be864f1da3514ac850d34
--- output ---
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 4.00169
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
# duration_ms 85.477769
```

**Result:** PASS - one exact title executed and passed.

### TP-B009-002 Focused Mutation Assertion RED {#tp-b009-002}

**Phase:** test
**Command:** `timeout 240 env NODE_OPTIONS="--require $PWD/tests/portfolio-defect-injector.cjs" RL_DEFECT_MODULE=rlportfolioanalytics.js RL_DEFECT_FIND_B64=ICAgICAgZWxzZSBleGNsdWRlZC5wdXNoKHsgc3ltYm9sOiBoLnN5bWJvbCwgYXNzZXRUeXBlOiBoLmFzc2V0VHlwZSB8fCAidW5rbm93biIgfSk7 RL_DEFECT_REPLACE_B64=ICAgICAgZWxzZSByZXR1cm4geyBzdGF0ZTogInVuc3VwcG9ydGVkLWhvbGRpbmciLCBzeW1ib2w6IGguc3ltYm9sIH07 RL_DEFECT_MARKER=/dev/null node --test --test-reporter=tap --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
**Exit Code:** 1 (required mutation RED)
**Claim Source:** executed

```text
# BUG-009 focused mutation assertion origin
exit: 1
lines: 36
sha256: 1d6ebdf9a01bf0cceffd8e4ccb531420bd9ee020d801c7387944a3dadc42f07e
--- output ---
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 1.73447
  type: 'test'
  location: '~/research-lab/tests/portfolio-risk.functional.mjs:43:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    + actual - expected

    + 'unsupported-holding'
    - 'ok'

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 'ok'
  actual: 'unsupported-holding'
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file://~/research-lab/tests/portfolio-risk.functional.mjs:60:10)
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
# duration_ms 83.072171
```

The stored hash covers the complete unsanitized source output. The displayed
home prefixes are normalized to `~` under repository evidence policy. The
failure is the direct state assertion; no `TypeError` or `ERR_TEST_FAILURE`
appears.

### TP-B009-003 Narrowed And Full Strict Registry GREEN {#tp-b009-003}

**Phase:** test
**Claim Source:** executed

```text
# BUG-009 narrowed strict registry after remap
$ node --test --test-name-pattern=^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 16
sha256: b7c2163ab27fc67833869c2ca33cf01c45525ed0d8ce325dbca219d01f0523d9
--- output ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 6241.804186
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
# duration_ms 6312.984681

# BUG-009 full mutation registry
$ node --test tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 28
sha256: 707362d13333f8c4b22a0c1817570ee8243793d4859943dddafaf47191bc78f0
--- output ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 5875.387818
  type: 'test'
  ...
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
  ---
  duration_ms: 1342.763043
  type: 'test'
  ...
# Subtest: BUG-007: represented mutants execute one protective assertion through one intended hook
ok 3 - BUG-007: represented mutants execute one protective assertion through one intended hook
  ---
  duration_ms: 1324.439728
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 8619.071852
```

The narrowed outer test iterates the 18 registered source cases and enforces
one shipped pass, one mutant `ERR_ASSERTION`, one application, and the declared
hook for every case. Its pass therefore proves all 18 case-level checks. The
complete file passed all three outer tests.

### TP-B009-004 Full Risk Carrier GREEN {#tp-b009-004}

**Phase:** test
**Command:** `timeout 240 node --test tests/portfolio-risk.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 full risk carrier
$ node --test tests/portfolio-risk.functional.mjs
exit: 0
lines: 28
sha256: a9a7509bafd8ee003833ea676c95f286772f32c9c18a50c34fd483a04653b8e5
--- output ---
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 3.087158
  type: 'test'
  ...
# Subtest: SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
ok 2 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
  ---
  duration_ms: 6.219183
  type: 'test'
  ...
# Subtest: SCN-008-047 failed candidate preserves the last valid structured result
ok 3 - SCN-008-047 failed candidate preserves the last valid structured result
  ---
  duration_ms: 2.858713
  type: 'test'
  ...
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 85.683078
```

### TP-B009-005 BUG-008 Functional Carriers GREEN {#tp-b009-005}

**Phase:** test
**Command:** `timeout 600 node --test tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 BUG-008 functional carriers
exit: 0
lines: 268
sha256: 0b3ba7ae666669544b374e3c0683909581a1a47ba7e5af94f6e203c3cb561582
--- first 20 ---
TAP version 13
# Subtest: TP-13-02 six production candidates share one frozen basis and keep their own states
ok 1 - TP-13-02 six production candidates share one frozen basis and keep their own states
  ---
  duration_ms: 27.221449
  type: 'test'
  ...
# Subtest: BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible
ok 2 - BUG-008 allocation mapping: declared BND cap makes minimum variance infeasible
  ---
  duration_ms: 5.042919
  type: 'test'
  ...
# Subtest: TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear
ok 3 - TP-13-08 a saved allocation survives a reread and is emptied by the full personal clear
  ---
  duration_ms: 92.305645
  type: 'test'
  ...
# Subtest: TP-14-02 production sensitivity and Black-Litterman lifecycle run on the common basis
--- omitted 228 line(s); sha256 above covers the full output ---
--- last 20 ---
ok 42 - Adversarial: full personal clear detects undeclared keys live state and arbitrary residue
  ---
  duration_ms: 62.273261
  type: 'test'
  ...
# Subtest: TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract
ok 43 - TP-26-02 the ReturnContext handoff writes consumes and refuses under a strict closed contract
  ---
  duration_ms: 3.447224
  type: 'test'
  ...
1..43
# tests 43
# suites 0
# pass 43
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 2406.991148
```

### TP-B009-006 Proportionate Risk Browser GREEN {#tp-b009-006}

**Phase:** test
**Command:** `timeout 1800 npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list`
**Exit Code:** 0
**Claim Source:** executed

```text
Version 1.61.1
Running 13 tests using 1 worker
✓ 1 Regression: SCN-008-013 arithmetic CAGR and conditional drag stay separate
✓ 2 Regression: SCN-008-014 unrecovered drawdown stops at the evidence cutoff
✓ 3 Regression: Feature 008 return and drawdown canvas tables remain equivalent at desktop mobile and zoom
✓ 4 Regression: SCN-008-015 concentration lenses expose overlap and missing look through
✓ 5 Regression: SCN-008-016 beta alpha R squared and residual risk stay separate
✓ 6 Regression: SCN-008-016 benchmark fit is unavailable rather than regressed against a guess
✓ 7 Regression: SCN-008-017 marginal and total risk contributions reconcile
✓ 8 Regression: SCN-008-016 declared proxy factors report exposures and name themselves proxies
✓ 9 Regression: SCN-008-017 return contribution stays distinct from risk contribution
✓ 10 Regression: SCN-008-015 manual assets and absent look through stay visible not omitted
✓ 11 Regression: Feature 008 concentration CAPM and contribution diagnostics preserve mobile canvas table parity
✓ 12 Regression: SCN-008-047 mixed portfolio inputs preserve eligible risk diagnostics and partial truth
✓ 13 Regression: Feature 008 Risk X-Ray refuses rather than showing a partial portfolio
13 passed (15.6s)
sha256: cde6e45c0454c0dda89556f8a67b6266d08bae98a25d8ad320010ebb48fb34b0
```

The hash covers the complete 18-line Playwright output, including source
locations and durations. The displayed list removes local path prefixes only.

### TP-B009-008 Canonical Selftest - Routed Failure {#tp-b009-008}

**Phase:** test
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-009 canonical repository selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3921
sha256: b1bd806893ddbae77645acd313fdc8942a0ec499dc38940f830c56294b9b7eb2
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
  ✓ RLDATA Twelve Data mapping translates and validates values
  ✓ RLFX broad dollar keeps Broad AFE EME and proxy states separate
--- failure-shaped lines from the omitted region ---
  ✗ FAIL: committed surface carries no personal identifier
--- omitted 3881 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓ a claim of 2 ticked and 1 open matches an artifact holding exactly those rows, so the ordinary reconciled case is not reported — rows outside the Definition-of-Done section, rows in a sibling section, and rows inside a fenced block are all excluded (1 claim(s), 1 agreeing)
  ✓ the fence mask is what removes the documented example rows — ignoring fences the same artifact tallies 5/2 against the masked 4/1, so the rule is load-bearing rather than decorative
  ✓ a registry claiming more ticked rows than the artifact carries FAILS, and the finding names the packet, the scope and both sides (claims 3/0 checked/unchecked, artifact has 2/1)
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (85 claim(s) across 66 packet(s), 71 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 85 claim(s))

================================================
Research-Lab self-test: 3425 passed, 1 failed
================================================
```

The dedicated scanner isolated five findings in excluded BUG-009 planning
artifacts:

```text
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/scopes.md:151:28 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/scopes.md:151:88 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/test-plan.json:38:41 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/test-plan.json:38:121 rule=home-path length=13
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/test-plan.json:42:196 rule=home-path length=13
[pii-scan] files=10098 messages=2293 findings=5 FAIL
[pii-scan] The matched text is withheld on purpose — printing it would copy the identifier into CI logs.
[pii-scan] Open each cited line. Remove the identifier, or add a reasoned entry to scripts/pii-scan.config.json "allow".
[pii-scan] A git-message:<sha> finding lives in a commit message, not a file.
```

The two test files and this report/state pair had zero matching personal
identifier findings before this evidence update. `scopes.md` and
`test-plan.json` are planning-owned and excluded from this test invocation.

### TP-B009-008 Canonical Selftest GREEN After Planning Repair {#tp-b009-008-current}

**Phase:** plan follow-up
**Command:** `timeout 1800 node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009-canonical-selftest-after-planning-fix
$ node scripts/selftest.mjs
exit: 0
lines: 3912
sha256: 88d967a36c61ae8679fabf404c2c99a13bf33a8324724e19fd73cd9f639e7ea7
--- last 12 ---
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (85 claim(s) across 66 packet(s), 71 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 85 claim(s))

================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

The earlier failing block remains above as the before-repair result. This rerun
is the current claim. The generic staged-diff `pii-scan.sh` was also invoked,
but it exited `3` because this downstream repository has no `.gitleaks.toml`;
that command is not presented as PII evidence. The canonical selftest's own
committed-surface PII check is included in the green `3426/3426` result.

### TP-B009-009 Regression Quality GREEN {#tp-b009-009}

**Phase:** test
**Command:** `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-risk.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-27T01:05:07Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/portfolio-test-integrity.unit.mjs
✅ Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
ℹ️  Scanning tests/portfolio-risk.functional.mjs
✅ Adversarial signal detected in tests/portfolio-risk.functional.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
============================================================
sha256: 2178b45f0f9e187235e63214a8b2abb572a043a660009f8a916b6604a674cc0a
```

### TP-B009-010 Fixed Canonical G028 GREEN {#tp-b009-010}

**Phase:** test
**Command (local roots normalized):** `timeout 30 git -C ~/bubbles merge-base --is-ancestor db7b4f2 HEAD && timeout 600 bash ~/bubbles/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
canonical Bubbles HEAD: db7b4f200a89cbeda0c9f5c39428b8fb2b6e1f06
db7b4f2 ancestor exit=0
bubbles HEAD lookup exit=0
ℹ️  INFO: Resolved 2 implementation file(s) to scan
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
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---
============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================
  Files scanned:  2
  Violations:     0
  Warnings:       0
🟢 PASSED: No source code reality violations detected
sha256: 32afbca50feeceaa740f471db55387647e6f219712239c11ea128083cc61b9a2
```

### TP-B009-011 Named Packet Gates GREEN {#tp-b009-011-current}

**Phase:** test
**Claim Source:** executed

| Gate | Exit | Lines | Full-output SHA-256 |
| --- | ---: | ---: | --- |
| Artifact lint | 0 | 40 | `182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567` |
| Traceability | 0 | 36 | `62008f85bc39a5d9e01942eab3929be198cc21fda87b2ff179ab656f528917b9` |
| Scenario obligation | 0 | 1 | `9376304b85bf6ba26f043584e558e404f0f8bb5a67ce9be569e0f4633a03cbc4` |
| Test mechanism | 0 | 2 | `9b5eb8597f28e2be64b065f55afd39e399c4dc67fcf86a91b0b4263fdace96f3` |
| Scope context fit | 0 | 1 | `7a84f3ca9c4d89bb763bfc95ee9d8247f3eb7fafed040311e53609f2ae6627d9` |
| Capability foundation | 0 | 1 | `c8502accec1740a853e05cb2ed184bbb1ff266bf33792fd4d2a02aa02a651fc9` |

```text
artifact-lint:
Artifact lint PASSED.
traceability-guard:
RESULT: PASSED (0 warnings)
scenario-obligation-lint:
[scenario-obligation-lint] OK — 1 scenario(s) with a coherent derived obligation matrix
test-mechanism-lint:
[test-mechanism-lint] OK — 1 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
scope-context-fit-lint:
[scope-context-fit-lint] OK — all 1 scope(s) are self-contained
capability-foundation-guard:
capability-foundation-guard: PASS Gate G094 - proportionality triggers not present
```

### Linked-Test Resolution - Planning Route Required {#linked-test-resolution}

**Phase:** test
**Exit Code:** 1
**Claim Source:** executed

```text
# BUG-009 linked test resolution
exit: 1
lines: 5
sha256: 319d80e1d8deae2b11424fdb199eca515f8ba915048e043b38f8c6c77b65c0fb
--- output ---
scenario-test-resolve: FAIL — linked tests that do not resolve (Gate G057)
  MISSING-TITLE: SCN-B009-001 -> tests/portfolio-survival-risk.spec.mjs#Feature 008 risk browser regression
    the referenced file contains no test with this exact title

scenario-test-resolve: 1 unresolved reference(s) of 3 checked.
```

The browser file itself executed `13/13` green. The failure is the excluded
planning-owned `linkedTests[].testId` value, not browser execution.

### Syntax, Patch, And Editor Checks {#syntax-editor-checks}

**Phase:** test
**Exit Code:** 0
**Claim Source:** executed

```text
BUG-009 syntax and patch checks
node runtime:
v22.22.0
portfolio-risk.functional.mjs:
exit=0
portfolio-test-integrity.unit.mjs:
exit=0
path-scoped git diff --check:
exit=0
VS Code Problems API: 2 files checked
VS Code Problems API: 0 errors
BUG-009 static checks complete
```

## Scenario Contract Evidence

`scenario-manifest.json` defines one planned contract, `SCN-B009-001`, for a
direct exported-function assertion and exact mutation negative control. The
owned functional and registry proofs now execute as specified. The manifest
remains planning-owned and still carries one unresolved browser title, so no
scenario status or certification field was changed.

## Coverage Report

Observed post-repair coverage is: focused shipped `1/1`; focused mutation
`0/1` with required `ERR_ASSERTION`; narrowed 18-case registry `1/1`; complete
integrity file `3/3`; risk carrier `3/3`; five BUG-008 carriers `43/43`; risk
browser `13/13`; regression quality `2/2` files with adversarial signals;
canonical G028 2 files, 0 violations, 0 warnings; six named packet gates green.

The canonical selftest is not green: `3425/3426`, with one PII-scan failure in
excluded planning artifacts. This report therefore makes no complete-suite or
scope-completion claim.

## Lint/Quality

### TP-B009-011 Artifact Lint {#tp-b009-011}

**Phase:** bug
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 artifact lint filing" -- bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 artifact lint filing
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
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

### TP-B009-011 Traceability Guard {#tp-b009-011-traceability}

**Phase:** bug
**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 traceability filing" -- bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 traceability filing
$ bash .github/bubbles/scripts/traceability-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
exit: 0
lines: 36
sha256: ddb7452771e4830cc8056d434bb0b7b055c28feebf76e11788924a9f51e62b4b
--- output ---
============================================================
  BUBBLES TRACEABILITY GUARD
  Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
  Timestamp: 2026-08-27T00:43:31Z
============================================================
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: tests/portfolio-risk.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-test-integrity.unit.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-survival-risk.spec.mjs
✅ scenario-manifest.json records evidenceRefs for all 1 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
ℹ️  Checking traceability for scopes.md
✅ scopes.md scenario mapped to Test Plan row: SCN-B009-001 unsupported holdings remain named without aborting asset treatment
ℹ️  scopes.md scenario→row match confidence: ambiguous
✅ scopes.md scenario maps to concrete test file: tests/portfolio-test-integrity.unit.mjs
✅ scopes.md report references concrete test evidence: tests/portfolio-test-integrity.unit.mjs
ℹ️  scopes.md summary: scenarios=1 test_rows=13
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-B009-001 unsupported holdings remain named without aborting asset treatment
ℹ️  scopes.md scenario→DoD match confidence: declared
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 13
ℹ️  Scenario-to-row mappings: 1
ℹ️  Concrete test file references: 1
ℹ️  Report evidence references: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=1 inferred=0 ambiguous=1
RESULT: PASSED (0 warnings)
```

## Validation Summary

The two permitted test hunks have current-session functional, mutation,
registry, browser, scanner, and packet-gate evidence. The planning-owned linked
title and home-path defects are repaired; the scenario resolver, canonical
selftest, and packet planning gates are green in the current planning session.
The installed downstream G028 scanner has not yet received canonical fix
`db7b4f2`, so its final execution remains prerequisite-bound even though the
fixed canonical scanner is diagnostically green. BUG-009 therefore remains
`in_progress`; scope completion, human acceptance, and validate-owned
certification remain unchanged.

## Audit Verdict

Not run. The packet retains all test-owned evidence and routes to
`bubbles.regression`; no audit or certification claim is made.

## Independent Regression Phase {#independent-regression-phase-2026-08-27}

**Phase:** regression
**Claim Source:** executed
**Executed at:** `2026-08-27T01:43:38Z`
**Repository authority:** revision `273` was observed and committed before local
work; after the requested canonical-source diagnostic, Research Lab authority
was restored as decision `rb:vscode-d037d272141b9d17af8fa6ccdd049e69:276`.
**Tree under review:** `40ae3fdf6eca38966f8b0a6e9a78ffc8a1e5ea2f`
**Implementation commit:** `4824edc81b0920b40e728f55b8e8dfdbe1804b2d`
**Planning correction:** `4633054197c9501665cb96f723a033a390408634`

### Exact Behavior And Mutation Origin

The focused shipped title executed once and passed once. The unchanged
`F008-RISK-INPUT-001` mutation executed the same title once and failed once at
the first direct state assertion. Its complete TAP output named
`ERR_ASSERTION` and `AssertionError`; it contained no `TypeError`,
`ERR_TEST_FAILURE`, injector, preload, setup, anchor, syntax, or module-load
error. The separate marker inspection found exactly one application through
the declared hook.

**Commands:**

- `timeout 240 node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
- `timeout 240 env NODE_OPTIONS="--require $PWD/tests/portfolio-defect-injector.cjs" RL_DEFECT_MODULE=rlportfolioanalytics.js RL_DEFECT_FIND_B64=ICAgICAgZWxzZSBleGNsdWRlZC5wdXNoKHsgc3ltYm9sOiBoLnN5bWJvbCwgYXNzZXRUeXBlOiBoLmFzc2V0VHlwZSB8fCAidW5rbm93biIgfSk7 RL_DEFECT_REPLACE_B64=ICAgICAgZWxzZSByZXR1cm4geyBzdGF0ZTogInVuc3VwcG9ydGVkLWhvbGRpbmciLCBzeW1ib2w6IGguc3ltYm9sIH07 RL_DEFECT_MARKER=/tmp/rl-b009-regression-marker-536218b5 node --test --test-reporter=tap --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
- `wc -l /tmp/rl-b009-regression-marker-536218b5` and `cat /tmp/rl-b009-regression-marker-536218b5`

**Exit codes:** shipped `0`; mutant `1` as the required negative control;
marker inspection `0`.

```text
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 3.578076
  type: 'test'
  location: '~/research-lab/tests/portfolio-risk.functional.mjs:43:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    + actual - expected

    + 'unsupported-holding'
    - 'ok'

  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 'ok'
  actual: 'unsupported-holding'
  operator: 'strictEqual'
  ...
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 94.999875
1 /tmp/rl-b009-regression-marker-536218b5
applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

### Baseline And Broader Regression Comparison

| Check | Prior test-owned count | Independent regression count | Result |
| --- | ---: | ---: | --- |
| Focused shipped title | `1/1` | `1/1` | Stable |
| Exact mutant | `0/1`, required assertion RED | `0/1`, required assertion RED, one marker | Stable |
| Narrowed mutation umbrella | `1/1` | `1/1` over `18` registered cases | Stable |
| Full integrity file | `3/3` | `3/3` | Stable |
| Full risk carrier | `3/3` | `3/3` | Stable |
| Five BUG-008 carriers | `43/43` | `43/43` | Stable; full-output SHA-256 `c9eaf8b3d74e85ff8b8fa95f28654d4d355833c41e0a236e52660b323c6ac35e` |
| Risk Playwright carrier | `13/13` | `13/13` | Stable |
| Canonical Research Lab selftest | `3426/3426` | `3426/3426` | Stable; full-output SHA-256 `aae3de15ff6a81eb5513f4ab3113f6e69faba541bd56c1c4785fd62641956aab` |

The repository declares no code-coverage command, so no percentage is
invented. The implementation patch adds one persistent title with eight direct
assertions, removes no test or assertion, and changes one registry title
scalar. Regression quality scanned both changed files with `0` violations and
`0` warnings. Scenario resolution found all `3` linked references. The six
packet checks passed: artifact lint, traceability, one-scenario obligation
matrix, one declared test mechanism, one self-contained scope, and capability
proportionality.

### Commit And Protected-Byte Audit

`4824edc81` changes exactly two files: `tests/portfolio-risk.functional.mjs`
and `tests/portfolio-test-integrity.unit.mjs`, with `30` insertions and `1`
title-line deletion. The complete patch contains no baseline, budget, skip,
fallback, product, injector, or other registry-case change.

The product owner `rlportfolioanalytics.js` has Git blob
`203c57b14898a13e0da81898e755ea5f5f6674ba` at `4824edc81^`, at
`4824edc81`, at reviewed `HEAD`, and in the working tree. The shared injector
has Git blob `20ed786006be23f542ec3c524758eda625567ea9` at the same four
checkpoints. Existing Feature 008 overlap is coherent: `SCN-008-047` retains
the user-visible degraded-risk contract, while `SCN-008-054` retains the
18-case mutation umbrella. BUG-009 adds the direct assertion-origin carrier
under those contracts without replacing either scenario.

### Canonical G028 Diagnostic And Remaining Prerequisite

Canonical Bubbles `HEAD` is exactly
`db7b4f200a89cbeda0c9f5c39428b8fb2b6e1f06`, and its scanner blob is
`23e0af5448141427e268083f4be3c4eba6e7c2a7`. Executed from that canonical
source against BUG-009, G028 resolved `2` implementation files and reported
`0` violations and `0` warnings.

Research Lab's installed downstream scanner remains blob
`3518d226789ee99df26e84958c7008e5fef17d84`, so installer propagation of
`db7b4f2` remains an explicit prerequisite. This phase does not present the
canonical-source diagnostic as final downstream-installed G028 evidence.

### Regression Verdict And Route

🟢 `REGRESSION_FREE`

No failing carrier, coverage-surface reduction, scenario conflict, weakened
assertion, skip, baseline, budget, product-source drift, injector drift, or
cross-feature conflict was found in the requested regression closure. The
persisted `bugfix-fastlane` registry resolves the phase order as `regression`
followed by `simplify`; the next owner is therefore `bubbles.simplify`.
BUG-009 remains `in_progress`, its scope remains In Progress, every DoD item
remains unchecked, and human acceptance and certification remain unchanged.

## Simplify Phase - 2026-08-27 {#simplify-phase-2026-08-27}

**Phase:** simplify
**Claim Source:** interpreted
**Interpretation:** The bounded test delta is already the smallest auditable
form. Extracting a fixture or assertion helper would add indirection without
removing repeated behavior and would weaken the visible causal link between the
registered mutation and the first failing contract assertion.
**Executed at:** `2026-08-27T01:54:02Z`
**Repository authority:** host revision `277`; committed Research Lab decision
`rb:vscode-d037d272141b9d17af8fa6ccdd049e69:278` at control revision `278`.
**Reviewed implementation:** `4824edc81b0920b40e728f55b8e8dfdbe1804b2d`
**Reviewed paths:** `tests/portfolio-risk.functional.mjs` and the one
`F008-RISK-INPUT-001` title scalar in
`tests/portfolio-test-integrity.unit.mjs`.

### Three Independent Review Passes

| Pass | Finding | Decision |
| --- | --- | --- |
| Reuse | Existing Feature 008 fixtures exercise the larger `riskXRayProjection()` contract. None is a reusable direct two-holding `assetTreatment()` carrier. | Keep the local two-record input. Extracting it would obscure why this title alone is the mutation carrier. |
| Clarity | The eight assertions each expose one required contract fact: state, included symbol, named exclusion, look-through state, covered id, missing id, covered weight, and uncovered weight. | Keep the assertions direct and separate. A whole-object assertion or helper would reduce failure locality and assertion-origin auditability. |
| Efficiency | The title performs one production call over two small records and no repeated setup, serialization, sorting, or derived computation. The registry change is one exact scalar. | No optimization is available without adding code or weakening exactness. |

**Simplify verdict:** `NO_CHANGE`. No source or test byte was edited. No helper,
fixture, abstraction, fallback, baseline, budget, or skip was introduced.

### Focused Title

**Phase:** simplify
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 simplify focused title" -- node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
**Exit Code:** `0`
**Claim Source:** executed

```text
# BUG-009 simplify focused title
$ node --test --test-name-pattern=^BUG-009 risk mapping: unsupported holdings remain named exclusions$ tests/portfolio-risk.functional.mjs
exit: 0
lines: 16
sha256: d7ca2ef5d7f276be083e3fd88127727915c5e2922e130bfc73fb28a3abc0099f
--- output ---
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 3.279472
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
# duration_ms 75.436377
```

### Narrowed Registry

**Phase:** simplify
**Command:** `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 simplify narrowed registry" -- node --test --test-name-pattern='^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$' tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** `0`
**Claim Source:** executed

```text
# BUG-009 simplify narrowed registry
$ node --test --test-name-pattern=^Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing$ tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 16
sha256: 45e7499866212626ea7effac49f3e6b4d0fd38457e8e9b829f957be9bae85d2f
--- output ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 5832.498034
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
# duration_ms 5916.958837
```

### Complete Integrity And Risk Carriers

**Phase:** simplify
**Commands:**

- `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 simplify full integrity" -- node --test tests/portfolio-test-integrity.unit.mjs`
- `timeout 240 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 simplify full risk" -- node --test tests/portfolio-risk.functional.mjs`

**Exit Codes:** integrity `0`; risk `0`
**Claim Source:** executed

```text
# BUG-009 simplify full integrity
$ node --test tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 28
sha256: 9c28e1ddb53a33c2e4d8a529e39b5cc86c49bceb71719ff92616f0c0f4c5f893
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
# Subtest: BUG-007: represented mutants execute one protective assertion through one intended hook
ok 3 - BUG-007: represented mutants execute one protective assertion through one intended hook
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
# BUG-009 simplify full risk
$ node --test tests/portfolio-risk.functional.mjs
exit: 0
lines: 28
sha256: a3f6ba3531280c296eecd83c0a0eaaea80fbe1c0fe84fa5d536a22bf7f6edc3e
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
# Subtest: SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
ok 2 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
# Subtest: SCN-008-047 failed candidate preserves the last valid structured result
ok 3 - SCN-008-047 failed candidate preserves the last valid structured result
1..3
# tests 3
# suites 0
# pass 3
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

### Syntax, Regression Quality, And Blob Identity

**Phase:** simplify
**Commands:** `node --check` on both reviewed test files; the canonical
`regression-quality-guard.sh --bugfix` over those files; and four-checkpoint Git
blob comparisons over product, injector, and reviewed tests.
**Exit Codes:** syntax `0` and `0`; regression quality `0`; identity `0`.
**Claim Source:** executed
**Output normalization:** the regression guard's absolute repository root is
rendered as `~/research-lab`; no result line or count is changed.

```text
=== syntax: tests/portfolio-risk.functional.mjs ===
risk_syntax_exit=0
=== syntax: tests/portfolio-test-integrity.unit.mjs ===
integrity_syntax_exit=0
syntax_summary risk=0 integrity=0
# BUG-009 simplify regression quality
$ bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-risk.functional.mjs
exit: 0
lines: 17
sha256: 25b1fbc4368daaaa6046022ab02d36b6c4a89e6cb12a2236405b6e95a5008647
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: ~/research-lab
  Timestamp: 2026-08-27T01:53:13Z
  Bugfix mode: true
============================================================

ℹ️  Scanning tests/portfolio-test-integrity.unit.mjs
✅ Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
ℹ️  Scanning tests/portfolio-risk.functional.mjs
✅ Adversarial signal detected in tests/portfolio-risk.functional.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
  Files with adversarial signals: 2
============================================================
product_parent=203c57b14898a13e0da81898e755ea5f5f6674ba
product_commit=203c57b14898a13e0da81898e755ea5f5f6674ba
product_head=203c57b14898a13e0da81898e755ea5f5f6674ba
product_worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
injector_parent=20ed786006be23f542ec3c524758eda625567ea9
injector_commit=20ed786006be23f542ec3c524758eda625567ea9
injector_head=20ed786006be23f542ec3c524758eda625567ea9
injector_worktree=20ed786006be23f542ec3c524758eda625567ea9
risk_commit=2a537316eadbf5067d19c020e0a60b020fb16e84
risk_head=2a537316eadbf5067d19c020e0a60b020fb16e84
risk_worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
registry_commit=5aa222876f78430ef1d76a2c980045cf6a5d5207
registry_head=5aa222876f78430ef1d76a2c980045cf6a5d5207
registry_worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
identity_result=PASS
```

### Remaining Prerequisite And Route

The installed downstream G028 prerequisite is unchanged: canonical Bubbles fix
`db7b4f2` must propagate through the installer before final downstream G028
execution. This phase neither bypassed that prerequisite nor edited any
downstream framework file.

The resolved `bugfix-fastlane` phase order is `regression` -> `simplify` ->
`gaps`. The next owner is `bubbles.gaps`. BUG-009 stays `in_progress`; the
scope stays In Progress; all DoD checkboxes stay unchecked; human acceptance
and every certification field stay unchanged.

## Gaps Phase - 2026-08-27 {#gaps-phase-2026-08-27}

**Phase:** gaps
**Claim Source:** interpreted
**Interpretation:** Current-session source inspection and execution found no
requirement, design, scenario, assertion, browser-overlap, containment, or
packet-gate defect beyond the already-declared installed-scanner propagation
prerequisite. Canonical-source G028 execution is diagnostic only. It does not
satisfy the downstream-installed G028 obligation.
**Executed at:** `2026-08-27T02:13:40Z`
**Repository authority:** Research Lab decision
`rb:vscode-d037d272141b9d17af8fa6ccdd049e69:282`, control revision `282`.

### Requirement And Acceptance Audit

| Contract | Current result | Grounding |
| --- | --- | --- |
| `FR-B009-001` focused direct carrier | Match | `tests/portfolio-risk.functional.mjs` calls exported `RLPA.assetTreatment()` once in the exact BUG-009 title. |
| `FR-B009-002` explicit mixed input | Match | The fixture contains listed `AAA` at `0.6` and unsupported `UNKNOWN` at `0.4`; it does not call `riskXRayProjection()`. |
| `FR-B009-003` exact shipped assertions | Match | Eight direct assertions cover state, market inclusion, named exclusion and asset type, look-through state, ids, and weights. |
| `FR-B009-004` assertion-origin mutation RED | Match | Current mutant execution found one test, zero passes, one failure, `ERR_ASSERTION`, and one `Module._compile` receipt, with no `TypeError`, `ERR_TEST_FAILURE`, or injector failure. |
| `FR-B009-005` one mapping change | Match | Commit `4824edc81` changes only the focused test file and the one `F008-RISK-INPUT-001` title scalar. Product and injector blobs are identical at parent, implementation commit, HEAD, and working tree. |
| `FR-B009-006` complete registry certification | Match | The registry still contains 18 `F008-*` cases and the complete integrity file passes `3/3`; the controlling loop enforces one shipped pass, one mutant assertion failure, one application, and the declared hook per case. |
| `FR-B009-007` regression containment | Open only at downstream G028 | Focused, full risk, five BUG-008 carriers, real browser risk, selftest, linked-test resolution, regression quality, and six packet gates are green. Installed G028 scans one fallback `.js` file instead of the two declared `.mjs` test files. |
| `FR-B009-008` separate human acceptance | Match | `uservalidation.md` remains entirely unchecked and no acceptance record is claimed. |
| `AC-1` before-fix wrong-origin RED | Retained | Historical raw evidence remains at `report.md#current-session-strict-registry-red` and `report.md#selected-title-mutant-origin`; it names only `F008-RISK-INPUT-001` and the broad-title `TypeError` origin. |
| `AC-2` focused shipped GREEN | Match | Current run: `1/1` pass. |
| `AC-3` exact mutation assertion RED | Match | Current run: `0/1`, `ERR_ASSERTION`, exact one-application receipt. |
| `AC-4` all 18 causal | Match | Current registry cardinality is 18 and the complete integrity file is `3/3`. |
| `AC-5` broader carriers | Match | Full risk is `3/3`, five BUG-008 files are `43/43`, and the real-browser risk carrier is `13/13`. |
| `AC-6` adversarial, G028, packet gates | Open only at downstream G028 | Regression quality and all packet gates pass. The installed scanner remains under-covering until framework propagation. |

### Design, Scenario, Test Plan, And DoD Audit

- The focused two-holding fixture, first state assertion, direct value
  assertions, one-scalar registry remap, strict causality predicate, shared
  infrastructure sweep, and rollback boundary match `design.md` without an
  alternate implementation path.
- `SCN-B009-001` maps to all eight functional requirements and all six
  acceptance criteria. All three linked tests resolve. The existing browser
  `SCN-008-047` carrier remains a `13/13` broader regression and is not used as
  a substitute for the direct functional proof.
- The Test Plan contains 11 rows and the parity table contains 11 mappings.
  Current results are: `TP-B009-000` retained wrong-origin RED;
  `TP-B009-001` `1/1`; `TP-B009-002` required `0/1` assertion RED;
  `TP-B009-003` `3/3`; `TP-B009-004` `3/3`; `TP-B009-005` `43/43`;
  `TP-B009-006` `13/13`; `TP-B009-008` `3426/3426`;
  `TP-B009-009` zero violations and warnings; `TP-B009-010` open on installed
  scanner propagation; and `TP-B009-011` six of six named packet gates green.
- All 18 DoD items remain unchecked: 17 core items plus the Build Quality Gate.
  The scope and packet remain `in_progress`.

### Current Core Causality Evidence

**Phase:** gaps
**Commands:** focused shipped title; unchanged focused mutation with one marker
receipt; complete integrity file; complete risk carrier.
**Exit Codes:** shipped `0`; mutant `1` as the required negative control;
causality probe `0`; integrity `0`; risk `0`.
**Claim Source:** executed

```text
focused shipped source:
tests 1
pass 1
fail 0
skipped 0
todo 0
mutant source:
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
error: Expected values to be strictly equal:
actual: 'unsupported-holding'
expected: 'ok'
code: 'ERR_ASSERTION'
name: 'AssertionError'
# tests 1
# pass 0
# fail 1
MUTANT_EXIT=1
1 /tmp/rl-b009-gaps-536218b5.marker
applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
CAUSALITY_CHECK_EXIT=0
complete integrity:
tests 3
pass 3
fail 0
complete risk:
tests 3
pass 3
fail 0
```

### Current Regression And Packet Receipts

**Phase:** gaps
**Claim Source:** executed

| Check | Current result |
| --- | --- |
| Five BUG-008 functional carriers | `43/43`; full-output SHA-256 `f819f54b6d2b2a3226b8dff10109b63453769518af9ea01ab0ca4e5fd9a7d852` |
| Real-browser risk carrier | `13/13` with system Chrome |
| Linked-test resolver | `3` references resolved; category comparison not applicable because no discovery adapter is declared |
| Canonical repository selftest | `3426/3426`; full-output SHA-256 `ecb5fc03d60850283b611c5d2e0d62485aa8f8a25729c059fd3da331d8327bc0` |
| Regression-quality guard | `0` violations, `0` warnings, `2` adversarial files |
| Artifact lint | Exit `0`, `Artifact lint PASSED` |
| Traceability | Exit `0`, `1` scenario, all `3` linked files present, `0` warnings |
| Scenario obligation | Exit `0`, one coherent obligation matrix |
| Test mechanism | Exit `0`, one coherent mechanism; mutation adapter inert |
| Scope context fit | Exit `0`, one self-contained scope |
| Capability foundation | Exit `0`, Gate G094 proportionality trigger absent |

### Installed Versus Canonical G028

**Phase:** gaps
**Installed command:** `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`
**Canonical diagnostic command (local source root normalized):** `timeout 600 bash <bubbles-repo>/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`
**Exit Codes:** installed `0`; installed under-coverage probe `0`; canonical
diagnostic `0`.
**Claim Source:** executed

```text
installed downstream scanner:
INFO: Scopes yielded 0 files - falling back to design.md for file discovery
WARN: Resolved 1 file(s) from design.md fallback - scopes.md should reference these directly
INFO: Resolved 1 implementation file(s) to scan
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  1
Violations:     0
Warnings:       1
PASSED with 1 warning(s) - manual review advised
INSTALLED_DOWNSTREAM_G028_EXIT=0
INSTALLED_G028_UNDERCOVERAGE_PROBE_EXIT=0

canonical db7b4f2 diagnostic:
INFO: Resolved 2 implementation file(s) to scan
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  2
Violations:     0
Warnings:       0
PASSED: No source code reality violations detected
CANONICAL_DB7B4F2_ANCESTOR_EXIT=0
```

Canonical commit `db7b4f200a89cbeda0c9f5c39428b8fb2b6e1f06` changes the
implementation and test discovery regexes from `.js`-only JavaScript coverage
to `.js`, `.mjs`, and `.cjs`, and adds both discovery and live-interception
regressions. Research Lab's installed scanner is the pre-fix blob. Its green
exit scans only `rlportfolioanalytics.js` through design fallback; it does not
scan the two planned `.mjs` implementation files. Therefore the canonical
diagnostic is not accepted as `TP-B009-010` evidence.

### Static Accounting And Transition Receipt

**Phase:** gaps
**Claim Source:** executed

```text
registry_cases=18
test_plan_rows=11
parity_rows=11
dod_unchecked=18
dod_checked=0
product_parent=203c57b14898a13e0da81898e755ea5f5f6674ba
product_commit=203c57b14898a13e0da81898e755ea5f5f6674ba
product_head=203c57b14898a13e0da81898e755ea5f5f6674ba
product_worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
injector_parent=20ed786006be23f542ec3c524758eda625567ea9
injector_commit=20ed786006be23f542ec3c524758eda625567ea9
injector_head=20ed786006be23f542ec3c524758eda625567ea9
injector_worktree=20ed786006be23f542ec3c524758eda625567ea9
PROTECTED_IDENTITY_EXIT=0
tests/portfolio-risk.functional.mjs
tests/portfolio-test-integrity.unit.mjs
IMPLEMENTATION_BOUNDARY_EXIT=0
STATIC_ACCOUNTING_EXIT=0
```

The pre-route transition guard correctly refused terminal promotion: exit `1`,
352 lines, full-output SHA-256
`204d092cf6133fe127b1ce2956024a9eadc92dd6c422dd76ad4f37618342102c`,
blocking code `DELIVERY_COMPLETION_FAILED`, and failed gates
`G060,G061,G022,G053,G027,G040,G136`. This is expected for 18 unchecked DoD
items, a pending owner route, incomplete phase/certification state, and no
terminal transition request.

### Report Chronology Reconciliation

The opening Summary, the earlier Scenario Contract Evidence paragraph, and the
earlier Coverage Report describe intermediate test/planning snapshots. They are
not the current verdict. Current execution is selftest `3426/3426`, all three
linked tests resolved, six named packet gates green, and exactly one open
delivery prerequisite: installed G028 propagation. The historical raw failures
remain preserved because they establish the red-to-green chain.

### Gap Verdict And Required Owner Route

`B009-G028-PROPAGATION-001` is the only remaining delivery gap. Route it to
`bubbles.setup`, the registered downstream framework refresh owner. The owner
must propagate canonical `db7b4f2` through the standard installer/upgrade
surface, without directly patching the managed downstream script. After that
owner returns, `bubbles.gaps` must execute the installed downstream scanner
against BUG-009 and require two files, zero warnings, and zero violations.
Only then may the persisted `bugfix-fastlane` continue from `gaps` to `harden`.

The simplify route is resolved by this audit. No product, injector, persistent
test, planning artifact, parent Feature 008 artifact, human acceptance,
certification field, scope status, DoD checkbox, or concurrent dirty path is
changed by the gaps phase.

## Gaps Prerequisite Resume - 2026-08-27 {#gaps-prerequisite-resume-2026-08-27}

**Phase:** gaps
**Claim Source:** executed
**Executed at:** `2026-08-27T03:22:57Z`
**Repository authority:** host revision `290`; committed Research Lab decision
`rb:vscode-d037d272141b9d17af8fa6ccdd049e69:291` at control revision `291`.
**Reviewed base:** `64af9849f996ae10f11c043c4a70e74fafdcdd1f`.

This resumed pass owns only the installed-framework prerequisite that the
earlier gaps audit routed to `bubbles.setup`. It supersedes earlier current-state
statements that Research Lab still carried the pre-fix scanner. Historical RED
and pre-propagation evidence remains unchanged as chronology.

### Installed Framework Identity And Provenance

**Commands:** current UTC time and Research Lab `HEAD`; canonical commit and
scanner blob resolution through `git -C ../bubbles`; installed scanner
`git hash-object`; byte comparison with `cmp -s`; non-secret
`.github/bubbles/.install-source.json` field projection; root `.gitleaks.toml`
presence check.
**Exit Code:** `0`
**Claim Source:** executed

```text
verified_at=2026-08-27T03:22:57Z
research_lab_head=64af9849f996ae10f11c043c4a70e74fafdcdd1f
canonical_commit=2086d1e93c3fa6e6a7e1d68de64b91d2484159cc
canonical_commit_blob=23e0af5448141427e268083f4be3c4eba6e7c2a7
canonical_worktree_blob=23e0af5448141427e268083f4be3c4eba6e7c2a7
installed_blob=23e0af5448141427e268083f4be3c4eba6e7c2a7
scanner_cmp_exit=0
installedVersion=7.28.0
installMode=local-source
sourceGitSha=2086d1e93c3fa6e6a7e1d68de64b91d2484159cc
sourceDirty=false
targetRepoSlug=research-lab
root_gitleaks_exists_exit=0
```

The installed scanner is byte-identical to both canonical commit `2086d1e`
and the clean canonical working source. The installer provenance names that
exact full source SHA with `sourceDirty=false`.

### TP-B009-010 Installed Downstream G028 GREEN

**Command:** `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`
**Exit Code:** `0`
**Claim Source:** executed

```text
ℹ️  INFO: Resolved 2 implementation file(s) to scan

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

--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---

--- Scan 8: Silent Decode Failure Detection (Gate G048) ---

============================================================
  IMPLEMENTATION REALITY SCAN RESULT
============================================================

  Files scanned:  2
  Violations:     0
  Warnings:       0

🟢 PASSED: No source code reality violations detected
```

This is the required installed downstream execution. It resolves both planned
`.mjs` implementation files and closes the prior under-coverage gap without a
direct edit to any framework-managed downstream file.

### Proportionate Packet And Carrier Revalidation

**Commands:** artifact lint; traceability guard; scenario-test resolver; exact
focused title; complete strict registry; complete risk carrier.
**Exit Codes:** all `0`
**Claim Source:** executed
**Output normalization:** the traceability guard's local absolute repository
prefix is rendered as `~/research-lab`; no result, count, or path suffix changed.

```text
artifact-lint:
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

```text
traceability-guard:
============================================================
  BUBBLES TRACEABILITY GUARD
  Feature: ~/research-lab/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
  Timestamp: 2026-08-27T03:20:31Z
============================================================
--- Scenario Manifest Cross-Check (G057/G059) ---
✅ scenario-manifest.json covers 1 scenario contract(s)
✅ scenario-manifest.json linked test exists: tests/portfolio-risk.functional.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-test-integrity.unit.mjs
✅ scenario-manifest.json linked test exists: tests/portfolio-survival-risk.spec.mjs
✅ scenario-manifest.json records evidenceRefs for all 1 scenario contract(s)
✅ All linked tests from scenario-manifest.json exist
ℹ️  Checking traceability for scopes.md
✅ scopes.md scenario mapped to Test Plan row: SCN-B009-001 risk mapping keeps unsupported holdings as named exclusions
ℹ️  scopes.md scenario→row match confidence: ambiguous
✅ scopes.md scenario maps to concrete test file: tests/portfolio-risk.functional.mjs
✅ scopes.md report references concrete test evidence: tests/portfolio-risk.functional.mjs
ℹ️  scopes.md summary: scenarios=1 test_rows=12
--- Gherkin → DoD Content Fidelity (Gate G068) ---
✅ scopes.md scenario maps to DoD item: SCN-B009-001 risk mapping keeps unsupported holdings as named exclusions
ℹ️  scopes.md scenario→DoD match confidence: declared
ℹ️  DoD fidelity: 1 scenarios checked, 1 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 1
ℹ️  Test rows checked: 12
ℹ️  Scenario-to-row mappings: 1
ℹ️  Concrete test file references: 1
ℹ️  Report evidence references: 1
ℹ️  DoD fidelity scenarios: 1 (mapped: 1, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=1 inferred=0 ambiguous=1
RESULT: PASSED (0 warnings)
```

```text
[scenario-test-resolve] OK — 3 reference(s) resolved via literal-scan; 3 category comparison(s) not applicable (no test-discovery adapter declared)
focused title:
✔ BUG-009 risk mapping: unsupported holdings remain named exclusions
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
strict registry:
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
✔ BUG-007: caller-key protections and normal ordering are load-bearing in memory
✔ BUG-007: represented mutants execute one protective assertion through one intended hook
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
risk carrier:
✔ BUG-009 risk mapping: unsupported holdings remain named exclusions
✔ SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output
✔ SCN-008-047 failed candidate preserves the last valid structured result
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Canonical Repository Selftest

**Command:** `timeout 1800 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 post-propagation canonical selftest" -- node scripts/selftest.mjs`
**Exit Code:** `0`
**Claim Source:** executed

```text
# BUG-009 post-propagation canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3919
sha256: 6d3f3737ec78c1c05154d7a7a6992cd10330fc24a01b2dbf7ef249a4b131061d
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
--- omitted 3879 line(s); sha256 above covers the full output ---
--- last 20 ---
specs/ — every scope progress claim matches the Definition of Done it summarises
  ✓ a claim of 2 ticked and 1 open matches an artifact holding exactly those rows, so the ordinary reconciled case is not reported — rows outside the Definition-of-Done section, rows in a sibling section, and rows inside a fenced block are all excluded (1 claim(s), 1 agreeing)
  ✓ the fence mask is what removes the documented example rows — ignoring fences the same artifact tallies 5/2 against the masked 4/1, so the rule is load-bearing rather than decorative
  ✓ a registry claiming more ticked rows than the artifact carries FAILS, and the finding names the packet, the scope and both sides (claims 3/0 checked/unchecked, artifact has 2/1)
  ✓ a registry claiming fewer ticked rows than the artifact carries FAILS too — drift in either direction is a false summary
  ✓ a claim whose scope artifact cannot be located FAILS instead of being silently skipped — an unverifiable claim is not a verified one
  ✓ the single-file bug-packet layout resolves all three of its claims — a numbered scope whose tiered DoD includes a deeper sub-heading, a sibling scope that has not started, and the packet-level cross-scope block — across the dodChecked, dodTicked and dodTotal spellings alike (3/3 agreeing)
  ✓ scope 2 ends where the cross-scope block begins rather than running to end-of-file, and `## Scope Summary` is not mistaken for a scope section because it carries no ordinal (01, 02, cross-scope)
  ✓ a `#` line inside a fenced Gherkin block is a comment rather than a heading, so it never splits a scope or ends a Definition of Done (2 real headings, 3 when fences are ignored)
  ✓ a scope already frozen in the baseline is carried as known debt rather than failing the run, so pre-existing drift in packets this change does not own cannot turn the validation path red
  ✓ freezing one scope does not license the next — the baseline is keyed on the SCOPE, not on the numbers, so a second drifting scope still FAILS while the frozen one passes
  ✓ a baseline entry whose claim now matches its artifact is reported STALE while the run still exits 0, so the frozen list can only shrink
  ✓ a scan that matches zero progress claims FAILS rather than passing vacuously — a matcher that quietly stopped matching would otherwise reproduce the exact blind spot this guard closes
  ✓ the scan read real progress claims against a present baseline, so a green verdict is a comparison rather than a matcher that stopped matching (85 claim(s) across 66 packet(s), 71 agreeing, baseline 14 entries)
  ✓ every committed progress claim resolves to a scope artifact the guard can actually read, so none of them is passing merely because nothing could check it (0 unresolvable)
  ✓ no scope progress claim disagrees with its Definition of Done outside the frozen baseline — a stale count reads as a summary of the artifact while describing a state the artifact has left (0 new, 14 frozen, 0 stale of 85 claim(s))

================================================
Research-Lab self-test: 3426 passed, 0 failed
================================================
```

### Finding Closure And Next Route

The installed mode resolver was executed for the persisted state with
`--grandfather bugfix-fastlane`. It returned status ceiling `done` and this
phase order:

```text
phaseOrder: [select, bootstrap, implement, test, regression, simplify, gaps, harden, stabilize, devops, security, validate, audit, finalize]
```

`B009-G028-PROPAGATION-001` is resolved. The setup route is resolved by the
clean local-source install plus the independent installed-scanner `2/0/0`
result. The gaps phase is complete as diagnostic provenance only and routes to
`bubbles.harden`, the actual next persisted fastlane owner.

BUG-009 remains `in_progress`; Scope 1 remains In Progress; all 18 DoD items
remain unchecked. Human acceptance, certification, product source, tests,
injector, parent Feature 008 artifacts, and every concurrent dirty Feature 008
path remain unchanged.

## Harden Phase - 2026-08-27 {#harden-phase-2026-08-27}

**Phase:** harden
**Agent:** `bubbles.harden`
**Execution model:** `direct-authorized-runner`
**Executed at:** `2026-08-27T05:45:55Z`
**Claim Source:** interpreted
**Interpretation:** `NOT_HARDENED`. The implementation and every requested
behavioral or mechanical check are clean in this session. Four unresolved
control-plane findings prevent a hardened verdict: test-phase provenance and
current report summary drift, planner lifecycle drift, one stale exact title in
`design.md`, and the same stale exact title in `bug.md`. Those artifacts are
foreign-owned, so harden records and routes the findings instead of rewriting
them.

### Authority And Baseline

**Claim Source:** executed

```text
host expectedControlRevision=292
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:293 revision=293 repository=research-lab root=~/research-lab
HEAD=8588bffa61901d2180628e28df4a655c5e9b4705
subject=chore(008): close BUG-009 G028 prerequisite
pre-existing BUG-009 changes=0
pre-existing non-BUG-009 dirty paths were copied to an external temporary baseline
```

### Focused Causality Proof

**Claim Source:** executed
**Commands:** exact shipped title, then the unchanged
`F008-RISK-INPUT-001` in-memory substitution with a fresh marker.
**Exit Codes:** shipped `0`; mutant `1` as the required negative control;
causality probe `0`.

```text
shipped source:
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
# tests 1
# pass 1
# fail 0
# skipped 0
mutant source:
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
code: 'ERR_ASSERTION'
name: 'AssertionError'
# tests 1
# pass 0
# fail 1
MUTANT_EXIT=1
ERR_ASSERTION_COUNT=1
INFRASTRUCTURE_FAILURE_COUNT=0
MARKER_LINES=1
MARKER_TEXT=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
CAUSALITY_PROBE_EXIT=0
```

The complete mutant output contains no `TypeError`, `ERR_TEST_FAILURE`,
injector, preload, setup, anchor, syntax, or module-load failure. The first
direct state assertion is the failure origin.

### Requested Execution Closure

**Claim Source:** executed

| Check | Current-session result |
| --- | --- |
| Focused shipped title | `1/1`, exit `0` |
| Exact focused mutant | `0/1`, required exit `1`, one `ERR_ASSERTION`, one `Module._compile` marker, zero infrastructure signals |
| Strict mutation registry | `18` registered cases; complete file `3/3`, including both BUG-007 outer controls |
| Full risk carrier | `3/3` |
| Five BUG-008 functional carriers | `43/43`; 268 output lines; full-output SHA-256 `1b7a799b7069f50aa818593e8eac74c09111df2fc3b0a680eaee45cc72982d2d` |
| Risk browser carrier | Playwright `1.61.1`; system Chrome; `13/13` |
| Canonical repository selftest | `3426/3426`; 3919 output lines; full-output SHA-256 `d4cb8d4680a663f418c74a57b922f2c3166f717515ff3e208a1229882c70d4fb` |
| Pages site build | exit `0`; `29` registered pages, `123` root files |
| Installed downstream G028 | exact two declared `.mjs` files; `2` scanned, `0` violations, `0` warnings |

The installed scanner was the Research Lab path
`.github/bubbles/scripts/implementation-reality-scan.sh`, not the canonical
source path. Its committed and working-tree blob is
`23e0af5448141427e268083f4be3c4eba6e7c2a7`. Installer provenance records
version `7.28.0`, local source `2086d1e93c3fa6e6a7e1d68de64b91d2484159cc`,
and `sourceDirty=false`. The two paths resolved from the scope's canonical
Implementation Files section are `tests/portfolio-risk.functional.mjs` and
`tests/portfolio-test-integrity.unit.mjs`.

### Packet And Test-Quality Gates

**Claim Source:** executed

```text
ARTIFACT_EXIT=0
TRACEABILITY_EXIT=0
LINKED_TEST_RESOLVER_EXIT=0
SCENARIO_OBLIGATION_EXIT=0
TEST_MECHANISM_EXIT=0
SCOPE_CONTEXT_FIT_EXIT=0
CAPABILITY_GUARD_EXIT=0
REGRESSION_QUALITY_EXIT=0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2
Files with adversarial signals: 2
SYNTAX_RISK_EXIT=0
SYNTAX_REGISTRY_EXIT=0
SKIP_SCAN_EXIT=1 (zero matches)
LIVE_MOCK_SCAN_EXIT=1 (zero matches)
INCOMPLETE_MARKER_SCAN_EXIT=1 (zero matches)
FOCUSED_TITLE_COUNT=1
REGISTRY_TITLE_COUNT=1
```

The scenario resolver checked all three links. Scenario obligations reported
one coherent matrix. Test mechanism reported one coherent public-function
mechanism. Scope context fit reported one self-contained scope. Capability
foundation proportionality did not trigger. Research Lab declares no lint or
format command; no substitute command was invented.

### Commit And Blob Containment

**Claim Source:** executed

Implementation commit
`4824edc81b0920b40e728f55b8e8dfdbe1804b2d` changes exactly:

```text
tests/portfolio-risk.functional.mjs
tests/portfolio-test-integrity.unit.mjs
```

Routing commit `8588bffa61901d2180628e28df4a655c5e9b4705` changes only this
BUG-009 `report.md` and `state.json`. Current identity checks returned:

```text
rlportfolioanalytics.js parent=203c57b14898a13e0da81898e755ea5f5f6674ba impl=203c57b14898a13e0da81898e755ea5f5f6674ba head=203c57b14898a13e0da81898e755ea5f5f6674ba worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
tests/portfolio-defect-injector.cjs parent=20ed786006be23f542ec3c524758eda625567ea9 impl=20ed786006be23f542ec3c524758eda625567ea9 head=20ed786006be23f542ec3c524758eda625567ea9 worktree=20ed786006be23f542ec3c524758eda625567ea9
tests/portfolio-risk.functional.mjs impl=2a537316eadbf5067d19c020e0a60b020fb16e84 head=2a537316eadbf5067d19c020e0a60b020fb16e84 worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
tests/portfolio-test-integrity.unit.mjs impl=5aa222876f78430ef1d76a2c980045cf6a5d5207 head=5aa222876f78430ef1d76a2c980045cf6a5d5207 worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
BLOB_IDENTITY_EXIT=0
IMPLEMENTATION_PATH_CONTAINMENT_EXIT=0
```

### Artifact And Phase-Claim Findings

**Claim Source:** interpreted
**Interpretation:** The commands below identify current control-plane
contradictions. They do not invalidate the clean product and test execution,
but they prevent H3 and H9 from passing and therefore prevent a hardened phase
claim.

| Finding | Evidence | Required owner |
| --- | --- | --- |
| `HARDEN-B009-001` | `execution.completedPhaseClaims` includes `test`, but the present execution history has no `bubbles.test` / `phasesExecuted: [test]` entry. The diagnostic transition guard fails G022, and the focused history search exits `1`. The report contains test-phase evidence, so this is an unbacked state claim rather than proof the tests did not run. The opening report Summary and Completion Statement also retain the old `3425/3426`, unpropagated-G028, and regression-route current summary. | `bubbles.test` |
| `HARDEN-B009-002` | `scopes.md` still says the next owner is `bubbles.regression` and says regression must run; `test-plan.json` still says `ready-for-regression-owner`, marks executed rows `planned-not-executed`, and says regression remains unclaimed. State and report history prove regression, simplify, gaps, setup, and this harden attempt occurred later. | `bubbles.plan` |
| `HARDEN-B009-003` | `design.md` says the exact title is `BUG-009 risk mapping: unsupported holding is named without aborting asset treatment`; the spec, scope, scenario manifest, structured plan, registry, and shipped test use `BUG-009 risk mapping: unsupported holdings remain named exclusions`. | `bubbles.design` |
| `HARDEN-B009-004` | `bug.md` repeats the stale singular exact title while the delivered and planned title is the plural named-exclusions title. | `bubbles.bug` |

No test is weakened to clear these findings. No harden completion claim is
added. The installed mode resolver confirms that `stabilize` follows `harden`,
but routing to `bubbles.stabilize` is withheld until all four findings are
reconciled and harden reruns clean.

### Diagnostic Transition Guard And Remaining Prerequisites

**Claim Source:** executed

The guard was run only as a diagnostic. It exited `1` over 353 output lines,
full-output SHA-256
`cc4fb99110a075d559564dc095d0cb7dac0c9d768b59346ad0fca153ffdbcee5`.

```text
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: [G060,G061,G022,G053,G027,G040,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 24
exitStatus: 1
verdict: FAIL
```

The packet has `18` unchecked DoD items, `0` checked DoD items, one In Progress
scope, `0` completed scopes, `0` certified phases, six untouched unchecked
automation/human validation items, four control-plane findings above, and later
workflow phases still unexecuted. Status and certification correctly remain
`in_progress`. Human acceptance remains untouched.

### Harden Verdict And Route

Verdict: **NOT_HARDENED**.

The implementation is behaviorally clean under every requested independent
check. The packet is not control-plane clean. Route `HARDEN-B009-001` first to
`bubbles.test`; preserve the separately assigned planner, design, and bug
findings in the unresolved set. After every owner reconciles its artifact,
rerun harden before advancing to the persisted successor `bubbles.stabilize`.

### Protected Dirty Transaction Check

**Claim Source:** executed

```text
PROTECTED_FILES_CHECKED=58
PROTECTED_MISMATCHES=0
BUG-009 changed paths:
M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/report.md
M specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json
NON_OWNED_TARGET_DIFF_EXIT=0
editor diagnostics report.md=0
editor diagnostics state.json=0
git diff --check exit=0
```

The protected set includes every dirty file observed at entry, both BUG-007
artifacts, the separate parent Feature 008 transaction, and the two concurrent
chaos files that appeared before this harden edit. No protected byte changed.

### Post-Route Diagnostic Transition Receipt

**Claim Source:** executed

After the four findings were recorded and routed, the diagnostic guard was run
again. It remained correctly non-terminal: exit `1`, 356 output lines,
full-output SHA-256
`1ee53a5a0496d51107904e929962691164d266df6b4f99ec2cdfca17de9f00c7`,
the same failed gate set `G060,G061,G022,G053,G027,G040,G136`, `27` completion
failures, `DELIVERY_COMPLETION_FAILED`, and verdict `FAIL`. G095 remained in the
passed gate set. This is diagnostic evidence of unresolved prerequisites, not
an attempted status transition.

## Design Exact-Title Reconciliation - 2026-08-27 {#design-title-reconciliation-2026-08-27}

### Owned Finding Resolution

`HARDEN-B009-003` is addressed. The active exact title in `design.md` is now
`BUG-009 risk mapping: unsupported holdings remain named exclusions`, matching
the planned and delivered contract. The current-session focused title search
found no stale title in active design and found the active title at its one
focused-carrier declaration.

The reconciliation changes only that title. The eight direct assertion
obligations, unchanged mutation and `Module._compile` origin, product-source
boundary, alternatives, and prior report chronology remain intact.

### Required Owner Route

`BUG-009-ROUTE-010` is resolved by `bubbles.design`. `HARDEN-B009-004` and its
pending `BUG-009-ROUTE-011` remain open, with `bubbles.bug` as the next required
owner. Harden remains incomplete. Status, scope state, DoD, human acceptance,
and certification remain unchanged.

## Bug Exact-Title Reconciliation - 2026-08-27 {#bug-title-reconciliation-2026-08-27}

### Owned Finding Resolution

**Claim Source:** interpreted
**Interpretation:** `HARDEN-B009-004` is addressed. The proposed exact title in
`bug.md` is now
`BUG-009 risk mapping: unsupported holdings remain named exclusions`, matching
the active contract, plan, registry, and shipped test title.

The reconciliation changes only the stale proposed-title literal. It preserves
the diagnosed wrong-origin RED, root cause, exact mutation, `Module._compile`
causality, eight direct assertion obligations, and historical narrative.

### Required Owner Route

`BUG-009-ROUTE-011` is resolved by `bubbles.bug`. `BUG-009-ROUTE-012` routes the
packet to `bubbles.harden` for a fresh hardening pass. This remediation does not
claim that hardening passed. Status, scope state, DoD, human acceptance, and
certification remain unchanged.

## Fresh Harden Pass - Repository Authority Revision 300 {#fresh-harden-revision-300}

**Phase:** harden
**Agent:** `bubbles.harden`
**Execution model:** `direct-authorized-runner`
**Claim Source:** interpreted
**Interpretation:** `NOT_HARDENED`. The BUG-009 implementation and focused
regression surface pass. Current durable lifecycle and title parity do not.
The canonical selftest also fails on a protected parent Feature 008 reference.

### Repository Authority

**Phase:** harden
**Command:** `repository-binding-host-context.sh` followed by
`repository-binding.sh preflight` for Research Lab
**Exit Code:** `0`, then `0`
**Claim Source:** executed

```text
host expectedControlRevision=300
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:301 revision=301 repository=research-lab root=~/research-lab
HEAD=be808bd0d915ca921de06aaf43e744a579f94aee
subject=BUG-009: reconcile harden exact test title
BUG-009 working-tree changes at entry=0
staged changes at entry=0
```

### Focused Assertion-Origin Evidence

**Phase:** harden
**Commands:** exact focused shipped title, then the exact
`F008-RISK-INPUT-001` mutation with an external temporary marker
**Exit Codes:** shipped `0`, mutant `1` as the required negative control
**Claim Source:** executed

```text
shipped source:
BUG-009 risk mapping: unsupported holdings remain named exclusions
tests 1
pass 1
fail 0
skipped 0
todo 0
mutant source:
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
code: 'ERR_ASSERTION'
name: 'AssertionError'
expected: 'ok'
actual: 'unsupported-holding'
tests 1
pass 0
fail 1
MUTANT_EXIT=1
marker lines=1
applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

An initial attempt used `/dev/stderr` as the marker. Node rejected that marker
with `ENXIO` and `ERR_TEST_FAILURE`. That attempt is invalid evidence. The
corrected temporary-marker run above is the assertion-origin evidence.

### Current Regression And Gate Results

**Phase:** harden
**Claim Source:** executed

| Check | Current-session result |
| --- | --- |
| Exact focused shipped title | `1/1`, exit `0` |
| Exact focused mutant | `0/1`, required exit `1`, one `ERR_ASSERTION`, one `Module._compile` application |
| Strict 18-case registry | Three outer tests passed, `3/3`, zero skipped |
| Full risk carrier | `3/3`, zero skipped |
| Five BUG-008 carriers | `43/43`, zero skipped, 268 lines, SHA-256 `403a5c42683df2331b4e65f218ee1409cd4ecd27fbf946c60e394719a4b10c34` |
| Risk browser carrier | Playwright `1.61.1`, system Chrome, `13/13` |
| Regression-quality guard | Two files, two adversarial signals, zero violations, zero warnings |
| Installed downstream G028 | Two `.mjs` implementation files, zero violations, zero warnings |
| Artifact lint | Passed |
| Traceability | Passed, one scenario, three linked tests, zero warnings |
| Scenario obligation | Passed, one coherent obligation matrix |
| Test mechanism | Passed, one coherent public-function mechanism |
| Scope context | Passed, one self-contained scope |
| Capability foundation | Passed, G094 proportionality did not trigger |

The focused test calls exported `RLPA.assetTreatment()` directly. It contains
eight direct assertions for state, market inclusion, the named exclusion,
look-through state, covered and missing ids, and both weights. It does not call
`riskXRayProjection()` inside that title.

### Canonical Selftest Failure

**Phase:** harden
**Command:** `timeout 1800 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 fresh harden canonical selftest" -- node scripts/selftest.mjs`
**Exit Code:** `1`
**Claim Source:** executed

```text
# BUG-009 fresh harden canonical selftest
$ node scripts/selftest.mjs
exit: 1
lines: 3922
sha256: 3b576684ef7ce030e1170939cf1acf1275feb2a555a5ce1d0e7cb1816000abc7
FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline
Research-Lab self-test: 3425 passed, 1 failed
[spec-test-paths] scanned=837 references=19603 distinctPaths=270 missingPaths=71 plannedMissing=0 baseline=70 new=1 stale=0
NEW-MISSING tests/chaos-439508.spec.mjs (2 reference site(s))
referenced at specs/008-portfolio-survival-and-brief-lab/state.json:1604
referenced at specs/008-portfolio-survival-and-brief-lab/state.json:1618
[spec-test-paths] FAIL - 1 new referenced path(s) do not exist
```

The failure sits in the protected parent Feature 008 state. That state already
records the docs finding and routes its repair to `bubbles.validate`. This pass
does not edit, stage, or duplicate the parent route.

### Fresh Artifact Parity Findings

**Phase:** harden
**Claim Source:** executed

```text
bug.md exact-title count=1
spec.md exact-title count=0
design.md exact-title count=1
scopes.md exact-title count=3
scenario-manifest.json exact-title count=1
test-plan.json exact-title count=4
tests/portfolio-risk.functional.mjs exact-title count=1
tests/portfolio-test-integrity.unit.mjs exact-title count=1
TITLE_PARITY_EXIT=1
HARDEN-B009-001 state status=addressed
HARDEN-B009-002 state status=addressed
HARDEN-B009-003 state status=addressed
HARDEN-B009-004 state status=addressed
BUG-009-ROUTE-008 state status=resolved
BUG-009-ROUTE-009 state status=resolved
BUG-009-ROUTE-010 state status=resolved
BUG-009-ROUTE-011 state status=resolved
active scopes.md next owner=bubbles.design for HARDEN-B009-003
active report.md next owner=bubbles.design for HARDEN-B009-003
```

`HARDEN-B009-003` and `HARDEN-B009-004` are genuinely resolved. Their owner
artifacts carry the exact shipped title. Routes 010 and 011 match those facts.

`HARDEN-B009-001` and `HARDEN-B009-002` are not genuinely resolved in the
current durable packet. The report opening and active scope routing still say
that findings 003 and 004 remain open. They route to `bubbles.design`, despite
the later design and bug records that close both findings. Routes 008 and 009
record owner actions, but their required current-state outcome has regressed.

The exact title is absent from `spec.md`. This violates the required parity
across bug, spec, design, scope, manifest, plan, shipped test, and registry.

### Findings And Routes

| Finding | Current evidence | Required owner |
| --- | --- | --- |
| `HARDEN-B009-005` | Active `report.md` and `scopes.md` lifecycle text still routes resolved findings 003 and 004 to `bubbles.design`. | `bubbles.plan` |
| `HARDEN-B009-006` | The exact shipped title occurs zero times in `spec.md`, while all seven other required surfaces contain it. | `bubbles.analyst` |
| `HARDEN-B009-007` | Canonical selftest is `3425/3426` because protected parent state names missing `tests/chaos-439508.spec.mjs` twice. | `bubbles.validate` for the existing parent route |

### Fresh Harden Verdict

Verdict: **NOT_HARDENED**.

The fresh execution supports consuming `BUG-009-ROUTE-012` as an executed
harden request. It does not support a harden completion claim or a route to
`bubbles.stabilize`. Route the spec title to `bubbles.analyst`, route active
lifecycle text to `bubbles.plan`, preserve the existing parent route to
`bubbles.validate`, then rerun harden. BUG-009 remains `in_progress`. Scope 1
remains In Progress. Every DoD item remains unchecked. Human acceptance and
certification remain unchanged.

## Fresh Harden Durable Closeout - Repository Authority Revision 302 {#fresh-harden-durable-closeout-revision-302}

**Phase:** harden
**Agent:** `bubbles.harden`
**Claim Source:** interpreted
**Interpretation:** This section durably reconciles the already-executed fresh
harden pass. It preserves the execution evidence and `NOT_HARDENED` verdict in
the preceding section. It does not relabel the canonical selftest, rerun the
long battery, or claim harden completion.
**Recorded at:** `2026-08-27T06:50:32Z`
**Repository authority:** host revision `302`; committed Research Lab decision
`rb:vscode-d037d272141b9d17af8fa6ccdd049e69:303` at control revision `303`.

### Consumed Route

`BUG-009-ROUTE-012` is resolved by `bubbles.harden` because the requested fresh
pass executed. Its outcome is explicitly `NOT_HARDENED`, so `harden` is not
added to `execution.completedPhaseClaims` and the packet does not advance to
`bubbles.stabilize`.

### Unresolved Finding Ledger

| Finding | Durable disposition | Owner |
| --- | --- | --- |
| `HARDEN-B009-005` | Unresolved. Reconcile the active report Summary and Completion Statement plus `scopes.md` lifecycle and routing text that still says findings 003 and 004 remain open and routes to design. | `bubbles.plan` via `BUG-009-ROUTE-013` |
| `HARDEN-B009-006` | Unresolved. Add the exact shipped title to active `spec.md` without changing behavior, requirements, or acceptance criteria. | `bubbles.analyst` via `BUG-009-ROUTE-014` |
| `HARDEN-B009-007` | Unresolved external parent finding. Preserve the canonical selftest result at `3425/3426`: parent Feature 008 state references missing `tests/chaos-439508.spec.mjs` twice. | Existing parent Feature 008 `bubbles.docs` execution-history route started `2026-08-27T06:19:29Z`, already assigned to `bubbles.validate` against parent `state.json` |

No BUG-local transition request duplicates `HARDEN-B009-007`. The BUG state
links the existing parent route and leaves parent state and chaos files
untouched.

### Ordered Continuation

The next executable BUG-009 owner is `bubbles.plan` for
`HARDEN-B009-005`. The analyst route for `HARDEN-B009-006` and the existing
parent validate route for `HARDEN-B009-007` remain pending. A fresh harden pass
is required after those three findings are reconciled. There is no route to
stabilize from this closeout.

BUG-009 remains `in_progress`. Scope 1 remains In Progress. All 18 DoD items
remain unchecked. Human acceptance and every certification field remain
unchanged.