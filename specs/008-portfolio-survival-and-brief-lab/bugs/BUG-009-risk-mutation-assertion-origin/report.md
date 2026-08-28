# Report: BUG-009 Risk Mutation Assertion Origin

## Summary

- The focused `assetTreatment()` carrier and the single
  `F008-RISK-INPUT-001` registry remap are implemented and verified.
- Revision-317 stabilization executed the exact shipped title five times at
  `1/1`, the exact mutant five times sequentially at the required `0/1` through
  `ERR_ASSERTION`, and six concurrent mutant children across three isolated
  marker probes. Every child applied exactly once through `Module._compile`;
  every stabilization marker was removed. One agent-authored concurrent-probe
  validator exited `1` because shell quoting corrupted its assertion-code
  regex; the child TAP and markers were correct, and a quote-safe rerun passed.
- The complete 18-case strict registry passed `3/3` on three independent runs.
  The full risk carrier passed `3/3`, and the canonical build-free selftest
  passed `3426/3426` over 3,895 lines with SHA-256
  `2078b99217bc1a18c8e906b14d3dc531190be1213bd2d1d90012398b471b12f0`.
- No BUG-009 process, file, marker, timeout, race, cleanup, or resource leak was
  reproduced. The increasing registry wall time was observed while the shared
  host load average was `11.25/10.26/9.02` and unrelated QuantitativeFinance
  and Smackerel Docker clients were active. Research Lab declares no
  performance SLA, so no latency pass/fail claim is inferred from those times.
- Production analytics, injector, focused carrier, and registry bytes remain
  equal to the implementation/HEAD blobs. The shared index stayed empty and
  no foreign dirty path was staged, reverted, or edited.
- Revision-319 DevOps consumed `BUG-009-ROUTE-019` and confirmed implementation
  commit `4824edc81` changes exactly two test files. The canonical Pages build
  passed, its artifact omits both tests and the BUG packet, and the exact CI
  selftest passed `3426/3426`. No CI, build, deployment, configuration,
  dependency, observability, release, registry, or runtime-operations change
  is required, and no live deployment was invoked.
- Revision-321 security consumed `BUG-009-ROUTE-020` and audited the actual
  implementation commit, both changed tests, and the unchanged shared injector.
  G034 reported zero findings, the dependency source lock rejected all 16
  hostile relaxations, the canonical Node security suites passed `19/19`, the
  complete mutation mechanism passed `3/3`, and the focused title passed `1/1`.
  A disposable probe confirmed fail-loud input and anchor behavior, child-only
  preload scope, private temporary-directory ownership, parallel marker
  isolation, unchanged source bytes, and cleanup.
- Verdict: `SECURE WITHIN THE BUG-009 TEST-ONLY CHANGE BOUNDARY`. This is not a
  broad Research Lab security certification. `BUG-009-ROUTE-021` routes next to
  `bubbles.validate`, the next persisted fastlane phase.
- Historical before/after evidence, including the earlier `3425/3426` failure,
  the revision-311 `NOT_HARDENED` result, and old route language inside dated
  sections remains intact as valid history. The parent Feature 008 transaction,
  BUG-007, README, docs, product source, tests, baseline, DoD, scope status,
  human acceptance, certification, and all foreign paths remain unchanged by
  this security closeout.

## Completion Statement

The revision-321 security phase inspected the actual two-file implementation
commit and the unchanged shared mutation injector. It found no BUG-009-local
security defect. The injector is explicitly classified as a trusted test
harness rather than a sandbox: its parent can choose an outside-root module,
replacement source, inherited Node options, and marker path, but that parent
already controls Node execution and no user, provider, page, runtime, or
less-privileged input reaches those values. The preload runs only in spawned
test children, and the three mechanism files and BUG packet are absent from the
generated Pages artifact. `BUG-009-ROUTE-020` is resolved, security is recorded
in execution provenance, and `BUG-009-ROUTE-021` routes next to
`bubbles.validate`. BUG-009 remains `in_progress`, Scope 1 remains In Progress,
and all 18 DoD items remain unchecked. Human acceptance and every certification
field remain untouched and unclaimed.

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

<!-- bubbles:g040-skip-begin -->
**Phase:** plan follow-up
<!-- bubbles:g040-skip-end -->
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
NEW-MISSING [run-scoped chaos-439508 Playwright harness; removed after execution] (2 reference site(s))
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
| `HARDEN-B009-007` | Canonical selftest is `3425/3426` because protected parent state names the removed run-scoped chaos-439508 Playwright harness twice as a durable test artifact. | `bubbles.validate` for the existing parent route |

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
| `HARDEN-B009-007` | Unresolved external parent finding. Preserve the canonical selftest result at `3425/3426`: parent Feature 008 state names the removed run-scoped chaos-439508 Playwright harness twice as a durable test artifact. | Existing parent Feature 008 `bubbles.docs` execution-history route started `2026-08-27T06:19:29Z`, already assigned to `bubbles.validate` against parent `state.json` |

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

## HARDEN-B009-005 Lifecycle Reconciliation - 2026-08-27 {#harden-b009-005-lifecycle-reconciliation-2026-08-27}

**Phase:** plan
**Agent:** `bubbles.plan`
**Claim Source:** interpreted
**Interpretation:** This planner-owned reconciliation updates only current
lifecycle and execution-routing statements. It preserves every historical
evidence section, the fresh `NOT_HARDENED` verdict, and the unresolved external
parent finding.
**Recorded at:** `2026-08-27T06:57:19Z`
**Repository authority:** host revision `304`; committed Research Lab decision
`rb:vscode-d037d272141b9d17af8fa6ccdd049e69:305` at control revision `305`.

### Resolved Route And Finding

`BUG-009-ROUTE-013` is resolved by `bubbles.plan`.
`HARDEN-B009-005` is addressed because the active report Summary, Completion
Statement, and `scopes.md` lifecycle text now agree that
`HARDEN-B009-003` and `HARDEN-B009-004` were resolved by their owners.
`HARDEN-B009-001..005` are therefore addressed in the current ledger.

### Ordered Continuation

`HARDEN-B009-006` remains unresolved on existing `BUG-009-ROUTE-014`, with
`bubbles.analyst` as the next required owner. `HARDEN-B009-007` remains an
external parent Feature 008 selftest blocker linked to the existing parent
`bubbles.validate` route. No duplicate BUG-local route is created for it.

After `HARDEN-B009-006` and `HARDEN-B009-007` resolve, rerun harden. This
reconciliation does not route to stabilize. BUG-009 remains `in_progress`.
Scope 1 remains In Progress. All 18 DoD items remain unchecked. Human
acceptance and every certification field remain unchanged.

## HARDEN-B009-007 Parent Validation - Repository Authority Revision 308 {#harden-b009-007-parent-validation-revision-308}

**Phase:** validate
**Agent:** `bubbles.validate`
**Claim Source:** executed
**Recorded at:** `2026-08-27T07:23:29Z`
**Repository authority:** host observation revision `308`; committed Research
Lab decision `rb:vscode-d037d272141b9d17af8fa6ccdd049e69:309` at control
revision `309`.

### Parent Repair And Focused Validation

The parent Feature 008 state retains chaos identity `439508`, all three seeds
`439508`, `811327`, and `205774`, the `344` traced actions, the `7/7` outcomes,
the zero-finding control-arm result, and the later docs finding. Only the two
tokens that named the disposed harness as a durable test file changed. BUG-009's
four historical descriptions now use the same semantic run-scoped harness name
so they cannot recreate the missing-path contract they describe.

**Commands:**

- `timeout 120 node scripts/validate-spec-test-paths.mjs`
- `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 parent path repair canonical selftest" -- node scripts/selftest.mjs`

**Exit Codes:** `0`, `0`

```text
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=837 references=19603 distinctPaths=269 missingPaths=70
 plannedMissing=0 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)

# BUG-009 parent path repair canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3919
sha256: 9ff226b15e342070f8ce8c820cb6344e2e2323f3ec821c2398221efff650f8d1
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

### Finding Disposition And Route

`HARDEN-B009-007` is `addressed_external`. The parent path contract and the
canonical selftest are green without recreating the disposable harness or
changing the frozen missing-path baseline. `BUG-009-ROUTE-015` returns BUG-009
to `bubbles.harden` for a fresh harden pass. The retained verdict is
`NOT_HARDENED`; no stabilize route or completion claim is created.

BUG-009 remains `in_progress`. Scope 1 remains In Progress. All 18 DoD items
remain unchecked. Human acceptance, completed phase claims, and every
certification field remain unchanged.

## Fresh Harden Pass - Repository Authority Revision 311 {#fresh-harden-revision-311}

**Phase:** harden
**Agent:** `bubbles.harden`
**Claim Source:** interpreted
**Interpretation:** `NOT_HARDENED`. Every requested technical check passes on
the current tree. The active planner-owned lifecycle text has not caught up
with the addressed finding ledger, so H3 cannot pass and harden cannot route to
stabilize.
**Recorded at:** `2026-08-27T07:42:15Z`

### Repository Authority And Mode

**Claim Source:** executed

```text
host expectedControlRevision=310
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:311 revision=311 repository=research-lab root=~/research-lab
HEAD=72ebc6188d3e59d732bcd93919c7c09fd1f7db8f
persisted workflowMode=bugfix-fastlane
grandfathered mode resolver exit=0
statusCeiling=done
phaseOrder=[select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize]
BUG-009-ROUTE-015 status at entry=pending
HARDEN-B009-006 status at entry=addressed
HARDEN-B009-007 status at entry=addressed_external
harden completedPhaseClaims at entry=false
```

The fresh working-tree baseline contained 58 concurrent dirty paths. BUG-009
`report.md` and `state.json` were clean at entry. No foreign path was staged or
reverted.

### Exact Focused And Mutation Origin

**Claim Source:** executed

```text
# BUG-009 revision-311 focused shipped title
$ node --test --test-name-pattern=^BUG-009 risk mapping: unsupported holdings remain named exclusions$ tests/portfolio-risk.functional.mjs
exit: 0
lines: 16
sha256: 0f5eb1bf8fd5b938ebd9dd16dedee7ad9b4805dfdae21820e2c334bfc76919a5
# tests 1
# pass 1
# fail 0
# skipped 0
# todo 0

# BUG-009 revision-311 exact mutant origin
exit: 1
lines: 36
sha256: 1ec1275710fc40af32ce63dd46b7470143230630c1a8a56ee2463ada29401679
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
code: 'ERR_ASSERTION'
name: 'AssertionError'
# tests 1
# pass 0
# fail 1
# skipped 0
# todo 0
MUTANT_EXIT=1
APPLICATION_LINES=1
APPLICATION=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

The mutant output contains the selected title once as the only failed test and
contains no `TypeError`, `ERR_TEST_FAILURE`, injector, preload, setup, anchor,
syntax, or module-load substitute.

### Registry And Regression Battery

**Claim Source:** executed

```text
# BUG-009 revision-311 strict all-18 registry
exit: 0
lines: 28
sha256: 3eb41852dbd5f3fadc35014f35fbe6e34914365cf6830dab051f852030bf3ba6
# tests 3
# pass 3
# fail 0
# skipped 0
# todo 0

# BUG-009 revision-311 full risk carrier
exit: 0
lines: 28
sha256: c97d3a6952b80c2f714502194a44ad57a58947012622d995a1d7b15b56b0a47a
# tests 3
# pass 3
# fail 0
# skipped 0
# todo 0

# BUG-009 revision-311 five BUG-008 carriers
exit: 0
lines: 268
sha256: eab86e2b5464b0853fb741eba44e1bd4399ae5638d91c6d0d6ab2a9ac1598017
# tests 43
# pass 43
# fail 0
# skipped 0
# todo 0

# BUG-009 revision-311 risk browser carrier
Version 1.61.1
exit: 0
lines: 18
sha256: 57b6deb9f99639aaeb6fe20880dc9dfc1f820d8a2a06cbeda83fdc94632770c7
Running 13 tests using 1 worker
13 passed (17.2s)

# BUG-009 revision-311 canonical selftest
exit: 0
lines: 3919
sha256: a22edfce72c9ad983f201bb7e54c886b51e3a0370228075b71cdf5e5dede2b40
Research-Lab self-test: 3426 passed, 0 failed
```

The registry source contains exactly 18 `F008-*` cases. Its three passing outer
tests enforce one shipped pass, one mutant assertion failure, one application,
and the declared hook for every case.

### Regression Quality, G028, And Packet Gates

**Claim Source:** executed

```text
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2
Files with adversarial signals: 2
G028_DECLARED_IMPLEMENTATION_FILES=2
G028_IMPLEMENTATION_FILE=tests/portfolio-risk.functional.mjs
G028_IMPLEMENTATION_FILE=tests/portfolio-test-integrity.unit.mjs
IMPLEMENTATION REALITY SCAN RESULT
Files scanned:  2
Violations:     0
Warnings:       0
artifact-lint exit=0 lines=40 sha256=182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
traceability exit=0 lines=36 sha256=56cdf2f943125826d779de67e7166b248e0459614679c77355de62e74e75e097
scenario-obligation exit=0 scenarios=1 sha256=9376304b85bf6ba26f043584e558e404f0f8bb5a67ce9be569e0f4633a03cbc4
test-mechanism exit=0 mechanisms=1 sha256=9b5eb8597f28e2be64b065f55afd39e399c4dc67fcf86a91b0b4263fdace96f3
scope-context-fit exit=0 scopes=1 sha256=7a84f3ca9c4d89bb763bfc95ee9d8247f3eb7fafed040311e53609f2ae6627d9
capability-foundation exit=0 proportionality=not-triggered sha256=c8502accec1740a853e05cb2ed184bbb1ff266bf33792fd4d2a02aa02a651fc9
```

The selected compliance scan found zero skip markers, zero browser request
interceptions, and zero required-scenario bailout returns. The browser carrier
contains 147 direct `expect(...)` calls. All 11 planned test IDs match across
the Markdown Test Plan, `test-plan.json`, `scenario-manifest.json`, and the DoD.
The packet has one scope and one Gherkin scenario; cross-scope duplication is
not applicable.

### Exact-Title And Blob Containment

**Claim Source:** executed

```text
bug.md CURRENT=1 EXPECTED=1 STALE=0
spec.md CURRENT=1 EXPECTED=1 STALE=0
design.md CURRENT=1 EXPECTED=1 STALE=0
scopes.md CURRENT=3 EXPECTED=3 STALE=0
scenario-manifest.json CURRENT=1 EXPECTED=1 STALE=0
test-plan.json CURRENT=4 EXPECTED=4 STALE=0
tests/portfolio-risk.functional.mjs CURRENT=1 EXPECTED=1 STALE=0
tests/portfolio-test-integrity.unit.mjs CURRENT=1 EXPECTED=1 STALE=0
TITLE_SURFACES=8
REGISTRY_F008_CASES=18
STATIC_CONTRACT_EXIT=0
rlportfolioanalytics.js parent=203c57b14898a13e0da81898e755ea5f5f6674ba implementation=203c57b14898a13e0da81898e755ea5f5f6674ba head=203c57b14898a13e0da81898e755ea5f5f6674ba worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
tests/portfolio-defect-injector.cjs parent=20ed786006be23f542ec3c524758eda625567ea9 implementation=20ed786006be23f542ec3c524758eda625567ea9 head=20ed786006be23f542ec3c524758eda625567ea9 worktree=20ed786006be23f542ec3c524758eda625567ea9
tests/portfolio-risk.functional.mjs implementation=2a537316eadbf5067d19c020e0a60b020fb16e84 head=2a537316eadbf5067d19c020e0a60b020fb16e84 worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
tests/portfolio-test-integrity.unit.mjs implementation=5aa222876f78430ef1d76a2c980045cf6a5d5207 head=5aa222876f78430ef1d76a2c980045cf6a5d5207 worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
IMPLEMENTATION_CHANGED_PATH_COUNT=2
tests/portfolio-risk.functional.mjs
tests/portfolio-test-integrity.unit.mjs
SOURCE_TEST_BLOB_CONTAINMENT_EXIT=0
```

### Planner Lifecycle Finding

`HARDEN-B009-008` is open for `bubbles.plan`. The active top section,
Scope 1 execution routing, and unchecked-item uncertainty declaration in
`scopes.md` still name `bubbles.analyst` as the next owner, still describe
`HARDEN-B009-006` and `HARDEN-B009-007` as unresolved, and still withhold the
fresh harden pass until those already-addressed findings resolve.

The planning-owned bytes remain unchanged. The required repair is limited to
reconciling those active lifecycle statements with the current state and
report while preserving Scope 1 as In Progress, every DoD item unchecked, and
human acceptance and certification unchanged.

**Claim Source:** executed

```text
STALE_ROUTE_014_OCCURRENCES=4
STALE_ANALYST_OCCURRENCES=4
FINDING_006_ACTIVE_OCCURRENCES=5
FINDING_007_ACTIVE_OCCURRENCES=4
CURRENT_ROUTE_015_OCCURRENCES=0
ACTIVE_LIFECYCLE_RESULT=FAIL
STATUS=in_progress
CERTIFICATION_STATUS=in_progress
SCOPE_STATUS=In Progress
DOD_CHECKED=0
DOD_UNCHECKED=18
USERVALIDATION_CHECKED=0
USERVALIDATION_UNCHECKED=6
HARDEN_PHASE_CLAIMED=false
ROUTE_015_STATUS=pending
FINDING_006_STATUS=addressed
FINDING_007_STATUS=addressed_external
```

The mismatch is planner-owned. This pass does not edit `scopes.md`, check any
DoD item, claim human acceptance, or modify certification.

### Verdict And Route

Verdict: **NOT_HARDENED**.

`BUG-009-ROUTE-015` is consumed and resolved by this executed pass.
`BUG-009-ROUTE-016` routes `HARDEN-B009-008` to `bubbles.plan` for the narrow
active-lifecycle reconciliation. A fresh harden pass is required after that
planner-owned change. No route to `bubbles.stabilize` is opened.

## HARDEN-B009-008 Planner Lifecycle Reconciliation - Repository Authority Revision 313 {#harden-b009-008-planner-lifecycle-reconciliation-revision-313}

**Agent:** `bubbles.plan`
**Claim Source:** interpreted

**Interpretation:** The revision-311 harden evidence records a technically
clean battery. It also records `NOT_HARDENED` because three active scope blocks
still described addressed findings as unresolved.

This planner pass reconciles only those active lifecycle blocks. It addresses
`HARDEN-B009-008` and resolves `BUG-009-ROUTE-016`.
`HARDEN-B009-001..008` are now addressed. `BUG-009-ROUTE-015` remains consumed
by the revision-311 pass.

`BUG-009-ROUTE-017` routes the packet to `bubbles.harden` for one clean fresh
pass before stabilize. This planner pass does not claim harden completion or
open a stabilize route.

BUG-009 remains `in_progress`, and Scope 1 remains In Progress. All 18 DoD
items remain unchecked. Human acceptance and certification remain unchanged.
Historical harden sections remain unchanged.

## ROUTE-017 Decisive Fresh Harden - Repository Authority Revision 315 {#fresh-harden-revision-315}

**Phase:** harden
**Agent:** `bubbles.harden`
**Recorded at:** `2026-08-27T08:09:18Z`
**Claim Source:** interpreted
**Interpretation:** The complete requested technical battery is clean on the
current tree. This section records the execution before the owned execution
state write. Final H3 disposition, route resolution, and the hardened verdict
require the post-write coherence check recorded below; no terminal completion,
scope completion, DoD check, human acceptance, or certification is inferred
from this technical result.

### Repository Authority And Persisted Mode

**Claim Source:** executed

```text
host expectedControlRevision=314
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:315 revision=315 repository=research-lab root=~/research-lab
HEAD=222b445c2941bf1e148c4a6d25a377310dd9b289
shared staged paths=0
BUG-009 report.md dirty at entry=false
BUG-009 state.json dirty at entry=false
workflowMode=bugfix-fastlane
statusCeiling=done
phaseOrder=[select,bootstrap,implement,test,regression,simplify,gaps,harden,stabilize,devops,security,validate,audit,finalize]
BUG-009-ROUTE-017 status at entry=pending
next persisted phase after harden=stabilize
```

The baseline listed the concurrent parent Feature 008 transaction, BUG-007,
README, docs, product source, tests, and baseline changes with an empty shared
index. No foreign path was staged or reverted.

### Exact Shipped And Assertion-Origin Proof

**Claim Source:** interpreted
**Interpretation:** The full mutant TAP output names exactly one selected test,
one failure, `ERR_ASSERTION`, and no `TypeError` or `ERR_TEST_FAILURE`. The
disposable marker contains exactly one line and identifies
`Module._compile`. Together these signals prove the registered defect was
applied once and failed at the selected protective assertion rather than at an
injector or downstream runtime failure.

```text
focused shipped source:
BUG-009 risk mapping: unsupported holdings remain named exclusions
tests=1
pass=1
fail=0
skipped=0
todo=0
exit=0

exact F008-RISK-INPUT-001 mutant:
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
code: ERR_ASSERTION
name: AssertionError
tests=1
pass=0
fail=1
skipped=0
todo=0
MUTANT_EXIT=1
APPLICATION_LINES=1
APPLICATION=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

The mutation remained in memory. The temporary marker was removed after the
run, and no shipped source or test byte was mutated.

### Registry And Regression Battery

**Claim Source:** executed

```text
strict registry source cardinality=18 F008 cases
strict registry tests=3 pass=3 fail=0 skipped=0 todo=0 exit=0
full risk tests=3 pass=3 fail=0 skipped=0 todo=0 exit=0
five BUG-008 carriers tests=43 pass=43 fail=0 skipped=0 todo=0 exit=0
five BUG-008 carriers lines=268
five BUG-008 carriers sha256=056e1ef64ababf72afebc536ac02d44a5280ed3071f5973a0bf4eae97188b071
Playwright version=1.61.1
risk browser tests=13 pass=13 fail=0 using system-chrome exit=0
canonical selftest lines=3895
canonical selftest sha256=c98201c12fdb07b9e719ad08eedc85b300f48a0dfa81de5ccaf3d909f1faba3d
Research-Lab self-test: 3426 passed, 0 failed
regression-quality violations=0 warnings=0
regression-quality files=2 adversarial-files=2
Pages build registeredPages=29 rootFiles=123 exit=0
parent path validator references=19612 distinctPaths=269 missingPaths=70
parent path validator baseline=70 new=0 stale=0 exit=0
```

The path validator's reference count reflects the live concurrent parent
transaction. Its decisive current result remains `new=0` and `stale=0`; no
baseline change was made by this harden pass.

### Installed G028 And Six Packet Gates

**Claim Source:** executed

```text
installed downstream G028 resolved implementation files=2
installed downstream G028 files scanned=2
installed downstream G028 violations=0
installed downstream G028 warnings=0
artifact-lint exit=0
traceability-guard exit=0 warnings=0
scenario-obligation-lint exit=0 scenarios=1
test-mechanism-lint exit=0 mechanisms=1
scope-context-fit-lint exit=0 scopes=1
capability-foundation-guard exit=0 proportionality=not-triggered
skip-marker scan exit=1 expected=1
live-mock scan exit=1 expected=1
incomplete-marker scan exit=1 expected=1
editor diagnostics implementation files=0
editor diagnostics report.md=0
editor diagnostics state.json=0
```

Research Lab declares no lint or format command. No substitute command was
invented.

### H4-H9 Hardening Profile Review

**Claim Source:** interpreted
**Interpretation:** The code reads and executed checks support the profile
dispositions below. H3 is intentionally withheld until the owned state write
and post-write active-lifecycle check.

| Check | Result | Current basis |
| --- | --- | --- |
| H4 test taxonomy | PASS | The pure-calculation/test-integrity scenario has direct functional and unit mutation proof plus the proportionate real-browser regression declared by the packet. |
| H5 semantic fidelity | PASS | The exact carrier calls exported `RLPA.assetTreatment()` and directly asserts state, market inclusion, named exclusion, partial state, ids, and weights. |
| H6 realistic paths | PASS | All three linked tests exist and the installed traceability guard resolves them. |
| H7 regression quality | PASS | Persistent direct, strict-registry, five-carrier, and browser regressions are green; the bugfix guard reports two adversarial files and zero findings. |
| H8 cross-scope deduplication | PASS | The packet has one scope, so no consecutive-scope duplicate can exist. |
| H9 structured-plan sync | PASS | Markdown, JSON, and scenario rows carry the same 11 unique IDs with no missing command reference. |

```text
MARKDOWN_TEST_IDS=11
JSON_TEST_IDS=11
SCENARIO_TEST_ROWS=11
DUPLICATE_MARKDOWN_IDS=0
DUPLICATE_JSON_IDS=0
MISSING_COMMAND_REFS=0
SCOPE_IDS=01-restore-risk-mutation-assertion-origin
H9_TEST_PLAN_SYNC=PASS
ACTIVE_LIFECYCLE_RESULT=PASS
HARDEN-B009-001..008=addressed
unresolved findings=0
DoD unchecked=18 checked=0
human acceptance checked=0
certified completed scopes=0
certified completed phases=0
```

### Exact-Title And Implementation Containment

**Claim Source:** executed

```text
bug.md CURRENT=1 EXPECTED=1 STALE=0
spec.md CURRENT=1 EXPECTED=1 STALE=0
design.md CURRENT=1 EXPECTED=1 STALE=0
scopes.md CURRENT=3 EXPECTED=3 STALE=0
scenario-manifest.json CURRENT=1 EXPECTED=1 STALE=0
test-plan.json CURRENT=4 EXPECTED=4 STALE=0
tests/portfolio-risk.functional.mjs CURRENT=1 EXPECTED=1 STALE=0
tests/portfolio-test-integrity.unit.mjs CURRENT=1 EXPECTED=1 STALE=0
TITLE_SURFACES=8
REGISTRY_F008_CASES=18
rlportfolioanalytics.js parent=203c57b14898a13e0da81898e755ea5f5f6674ba implementation=203c57b14898a13e0da81898e755ea5f5f6674ba head=203c57b14898a13e0da81898e755ea5f5f6674ba worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
tests/portfolio-defect-injector.cjs parent=20ed786006be23f542ec3c524758eda625567ea9 implementation=20ed786006be23f542ec3c524758eda625567ea9 head=20ed786006be23f542ec3c524758eda625567ea9 worktree=20ed786006be23f542ec3c524758eda625567ea9
tests/portfolio-risk.functional.mjs implementation=2a537316eadbf5067d19c020e0a60b020fb16e84 head=2a537316eadbf5067d19c020e0a60b020fb16e84 worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
tests/portfolio-test-integrity.unit.mjs implementation=5aa222876f78430ef1d76a2c980045cf6a5d5207 head=5aa222876f78430ef1d76a2c980045cf6a5d5207 worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
IMPLEMENTATION_CHANGED_PATH_COUNT=2
tests/portfolio-risk.functional.mjs
tests/portfolio-test-integrity.unit.mjs
SOURCE_TEST_BLOB_CONTAINMENT=PASS
```

The title parity check deliberately excludes `report.md`: legacy route and
title language inside timestamped historical evidence remains valid history,
not active drift.

### Post-State Closeout Receipt

**Claim Source:** executed

```text
STATUS=PASS
SCOPE=PASS
ROUTE17=PASS
ROUTE18=PASS
ROUTING=PASS
CLAIM=PASS
HISTORY=PASS
FINDINGS=PASS
DOD=PASS
ACCEPTANCE=PASS
CERTIFICATION=PASS
STATE_CLOSEOUT_RESULT=PASS
```

The state closeout resolves `BUG-009-ROUTE-017`, opens
`BUG-009-ROUTE-018` to `bubbles.stabilize`, records one harden phase claim and
one matching history row, and adds `B009-HARDEN-EXECUTION-004` to addressed
findings. It preserves `in_progress`, Scope 1 In Progress, all 18 unchecked DoD
items, human acceptance, and certification. The final H3/H9 result is recorded
after the immediate post-report coherence run below.

### Final H3/H9 Result And Route

**Validated at:** `2026-08-27T08:11:04Z`
**Claim Source:** executed

```text
REPORT=PASS
STATE=PASS
ROUTE=PASS
HISTORY=PASS
FINDINGS=PASS
PRESERVATION=PASS
H9=PASS
H3_REQUIRED_ARTIFACT_UPDATES=PASS
H9_TEST_PLAN_SYNC=PASS
PENDING_ROUTE=BUG-009-ROUTE-018:bubbles.stabilize
STATUS=in_progress
SCOPE_STATUS=In Progress
DOD_UNCHECKED=18
CERTIFIED_PHASES=0
FINAL_HARDEN_PROFILE=PASS
```

Verdict: **HARDENED**.

`BUG-009-ROUTE-017` is resolved. Harden is complete in execution provenance,
with `B009-HARDEN-EXECUTION-004` addressed and no unresolved finding.
`BUG-009-ROUTE-018` routes next to `bubbles.stabilize`, the phase immediately
after harden in the persisted `bugfix-fastlane` order. This result does not
mark the scope or bug done and does not modify human acceptance or
certification.

## ROUTE-018 Stabilization - Repository Authority Revision 317 {#stabilize-revision-317}

**Phase:** stabilize
**Agent:** `bubbles.stabilize`
**Recorded at:** `2026-08-27T08:24:15Z`
**Claim Source:** interpreted
**Interpretation:** Current-session repeated execution found no BUG-009-local
flake, mutation race, resource leak, timeout, isolation failure, cleanup defect,
or build-free suite regression. The registry timing variance occurred during
measured unrelated host load and has no repository-defined SLA against which to
make a performance verdict.

### Repository Authority And Change Boundary

**Claim Source:** executed

```text
host expectedControlRevision=316
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=~/research-lab source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-d037d272141b9d17af8fa6ccdd049e69:317 revision=317 repository=research-lab root=~/research-lab
implementation commit=4824edc81b0920b40e728f55b8e8dfdbe1804b2d
implementation paths=tests/portfolio-risk.functional.mjs,tests/portfolio-test-integrity.unit.mjs
hardening commit=e15e4aaaeeb8b7a37ecd6429214882a767dc8608
hardening paths=BUG-009/report.md,BUG-009/state.json
HEAD=e15e4aaaeeb8b7a37ecd6429214882a767dc8608
BUG-009 dirty at entry=false
shared staged paths at entry=0
workflowMode=bugfix-fastlane
pending route at entry=BUG-009-ROUTE-018:bubbles.stabilize
```

The concurrent parent Feature 008, BUG-007, README, docs, product source,
accessibility tests, and reachability-baseline changes were present at entry.
They were treated as foreign work and were not staged, reverted, or edited.

### Stability Inventory

| Domain | Result | Evidence-backed disposition |
| --- | --- | --- |
| Reliability and flake behavior | PASS | Five shipped-title runs passed exactly once; three complete registry runs passed all three outer tests. |
| Deterministic mutation application | PASS | Five sequential and six concurrent exact-mutant children each produced the required assertion RED and one `Module._compile` marker. |
| Race behavior | PASS | Three two-child probes used distinct markers; the quote-safe isolated-stream probe validated each child independently. |
| Test isolation and cleanup | PASS | Mutation stayed process-local; all 11 stabilization markers were deleted; no new strict-registry temp root remained. |
| Timeouts | PASS | Every test and inspection carried an explicit bound; no timeout fired. The direct carrier has no timer, network, filesystem, or asynchronous dependency. |
| Resource usage | PASS with observation | No Research Lab Node process remained. Host memory and disk were not pressured; unrelated shared-host load explains timing noise more plausibly than the deterministic two-record carrier. |
| Build and configuration | PASS | The repository is build-free for this check, no config or dependency surface changed, and canonical `node scripts/selftest.mjs` passed. |

No security or compliance conclusion is made by this stability phase.

### Repeated Focused Shipped Title

**Claim Source:** interpreted
**Interpretation:** Each row was observed from a separate bounded terminal
execution of the exact title. The variation is reported without inventing a
latency threshold.

| Trial | Exit | Tests | Pass | Fail | Skipped | Test duration ms | Total duration ms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | 1 | 1 | 0 | 0 | 3.574167 | 80.849556 |
| 2 | 0 | 1 | 1 | 0 | 0 | 3.405876 | 84.411202 |
| 3 | 0 | 1 | 1 | 0 | 0 | 4.325807 | 97.455872 |
| 4 | 0 | 1 | 1 | 0 | 0 | 3.144605 | 87.482636 |
| 5 | 0 | 1 | 1 | 0 | 0 | 3.283104 | 86.609503 |

Representative raw output from trial 5:

```text
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 3.283104
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
# duration_ms 86.609503
```

### Repeated Exact Mutant And Concurrent Race Probe

**Claim Source:** interpreted
**Interpretation:** All five sequential trials used a unique disposable marker,
validated expected child exit `1`, one selected test, one assertion failure,
absence of `TypeError` and `ERR_TEST_FAILURE`, and exactly one
`Module._compile` marker before deleting that marker. Two additional exact
mutants ran simultaneously with separate markers; both retained the same causal
shape and cleanup contract.

| Sequential trial | Child exit | Tests | Pass | Fail | Failure code | Applications | Marker cleaned | Total duration ms |
| ---: | ---: | ---: | ---: | ---: | --- | ---: | --- | ---: |
| 1 | 1 | 1 | 0 | 1 | `ERR_ASSERTION` | 1 | YES | 99.950840 |
| 2 | 1 | 1 | 0 | 1 | `ERR_ASSERTION` | 1 | YES | 147.084818 |
| 3 | 1 | 1 | 0 | 1 | `ERR_ASSERTION` | 1 | YES | 125.550664 |
| 4 | 1 | 1 | 0 | 1 | `ERR_ASSERTION` | 1 | YES | 155.135458 |
| 5 | 1 | 1 | 0 | 1 | `ERR_ASSERTION` | 1 | YES | 82.082998 |

```text
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 1.966903
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
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 99.95084
MUTANT_TRIAL=1 CHILD_EXIT=1
MARKER_CONTENT=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
MARKER_CLEANED=YES
VALIDATION_EXIT=0
```

Initial concurrent shell probe receipt:

```text
RACE_A_EXIT=1
RACE_A_MARKER=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
RACE_B_EXIT=1
RACE_B_MARKER=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
RACE_MARKERS_CLEANED=YES
```

The concurrent TAP streams interleaved on the shared terminal. They are not used
for per-line parsing; the independent process exits, two `ERR_ASSERTION` records,
and isolated marker contents are the stable signals.

The first isolated-stream harness then exposed an agent-authored validator
defect. Both child TAP streams showed `ERR_ASSERTION`, both markers were valid,
and cleanup succeeded, but shell quoting removed the apostrophe-sensitive regex
and the wrapper honestly exited `1`:

```text
# BUG-009 stabilize isolated concurrent mutants
exit: 1
lines: 86
sha256: 08faea293fa5925dece17a5afb8d5139e63bd0a2ddbc4320e47ad407189de467
RACE_A_EXIT=1
RACE_A_MARKER=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
RACE_A_OUTPUT_VALID=NO
RACE_A_MARKER_VALID=YES
RACE_B_EXIT=1
RACE_B_MARKER=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
RACE_B_OUTPUT_VALID=NO
RACE_B_MARKER_VALID=YES
RACE_MARKERS_CLEANED=YES
RACE_VALIDATION=FAIL
```

This was not a repository or BUG-009 failure. The same two-child probe reran
with a quote-safe `ERR_ASSERTION` check and passed:

```text
# BUG-009 stabilize isolated concurrent mutants corrected
exit: 0
lines: 86
sha256: aaf62ac2fb0401aec5b54056ed20ca590e30019497a071a6f348ec072ff6f77d
--- first 20 ---
RACE_A_OUTPUT_BEGIN
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 1.82109
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
--- omitted 46 line(s); sha256 above covers the full output ---
--- last 20 ---
1..1
# tests 1
# suites 0
# pass 0
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 85.011913
RACE_B_OUTPUT_END
RACE_B_EXIT=1
RACE_B_MARKER=applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
RACE_B_OUTPUT_VALID=YES
RACE_B_MARKER_VALID=YES
RACE_MARKERS_CLEANED=YES
RACE_VALIDATION=PASS
```

### Repeated Strict Registry And Full Risk Carrier

**Claim Source:** interpreted
**Interpretation:** Three independent complete registry processes each passed
all three outer tests. Each first outer test traverses all 18 registered Feature
008 mutation cases and enforces one shipped pass, one assertion-origin mutant
failure, and one declared-hook application per case.

| Registry trial | Exit | Tests | Pass | Fail | Cancelled | Skipped | Total duration ms |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0 | 3 | 3 | 0 | 0 | 0 | 10152.463196 |
| 2 | 0 | 3 | 3 | 0 | 0 | 0 | 12480.176157 |
| 3 | 0 | 3 | 3 | 0 | 0 | 0 | 18682.864959 |

```text
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 12822.545758
  type: 'test'
  ...
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
  ---
  duration_ms: 2892.064118
  type: 'test'
  ...
# Subtest: BUG-007: represented mutants execute one protective assertion through one intended hook
ok 3 - BUG-007: represented mutants execute one protective assertion through one intended hook
  ---
  duration_ms: 2040.798554
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
# duration_ms 18682.864959
```

The neighboring full risk carrier remained green:

```text
TAP version 13
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
# duration_ms 93.089753
```

### Canonical Build-Free Selftest

**Command:** `timeout 1800 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 stabilize canonical selftest" -- node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 stabilize canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: 2078b99217bc1a18c8e906b14d3dc531190be1213bd2d1d90012398b471b12f0
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
--- omitted 3855 line(s); sha256 above covers the full output ---
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

The stored hash covers the complete command output. The compact rendering keeps
the 3,895-line evidence bounded; no application build exists or was invented.

### Host Load, Cleanup, And Byte Containment

**Claim Source:** interpreted
**Interpretation:** The registry timing increased while unrelated shared-host
work was active. Available memory and disk remained ample, every BUG-009 test
process exited, and no BUG-009-created marker or temp root remained. Two
`rl-scope28-*` directories dated 2026-08-24 existed before this phase and were
preserved as foreign residue rather than deleted or attributed to BUG-009.

```text
load average: 11.25, 10.26, 9.02
memory total MiB=48176 used=18457 free=2535 available=29718
swap total MiB=16384 used=1824 free=14559
filesystem size=1007G used=545G available=411G use=58%
unrelated process: docker cwd=~/quantitativeFinance
unrelated process: docker cwd=~/smackerel
pre-existing process: python3 cwd=~/research-lab elapsed=6545s
BUG-009 Research Lab node processes after checks=0
BUG-009 stabilization markers after checks=0
new rl-scope28 temp roots after checks=0
pre-existing rl-scope28 temp roots=2 dated 2026-08-24
timeouts fired=0
performance SLA declared for this test-only repair=none
```

```text
BLOB path=rlportfolioanalytics.js implementation=203c57b14898a13e0da81898e755ea5f5f6674ba head=203c57b14898a13e0da81898e755ea5f5f6674ba worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
BLOB path=tests/portfolio-defect-injector.cjs implementation=20ed786006be23f542ec3c524758eda625567ea9 head=20ed786006be23f542ec3c524758eda625567ea9 worktree=20ed786006be23f542ec3c524758eda625567ea9
BLOB path=tests/portfolio-risk.functional.mjs implementation=2a537316eadbf5067d19c020e0a60b020fb16e84 head=2a537316eadbf5067d19c020e0a60b020fb16e84 worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
BLOB path=tests/portfolio-test-integrity.unit.mjs implementation=5aa222876f78430ef1d76a2c980045cf6a5d5207 head=5aa222876f78430ef1d76a2c980045cf6a5d5207 worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
BUG-009 dirty before owned edit=false
shared staged paths=0
stabilization marker paths=0
new registry temp roots=0
Research Lab node processes=0
CONTAINMENT_SNAPSHOT_COMPLETE
```

### Stabilize Profile And Route

**Claim Source:** interpreted
**Interpretation:** The executed checks support all four stabilize-profile
requirements. No stability remediation or foreign-owner defect was discovered.

| Check | Result | Basis |
| --- | --- | --- |
| ST1 stability scan complete | PASS | Reliability, mutation determinism, race behavior, isolation, cleanup, timeouts, resources, build, and configuration were reviewed. |
| ST2 findings backed by evidence | PASS | No defect finding was raised; the timing observation is tied to measured host load and explicitly carries no SLA claim. |
| ST3 fixes verified | NOT APPLICABLE | Stabilize changed no source, test, injector, configuration, or runtime behavior. |
| ST4 scope artifacts updated | PASS | This report and execution-only state record the phase result and next persisted owner. |

Verdict: **STABLE**.

`BUG-009-ROUTE-018` is resolved. `B009-STABILIZE-EXECUTION-001` records the
phase, and `BUG-009-ROUTE-019` routes next to `bubbles.devops`. BUG-009 remains
`in_progress`, Scope 1 remains In Progress, all 18 DoD items remain unchecked,
human acceptance remains unclaimed, and certification remains unchanged.

### Post-Edit Artifact And Editor Validation

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 stabilize artifact lint" -- bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 stabilize artifact lint
$ bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin
exit: 0
lines: 40
sha256: 182cf27f7948b167f9fdebccae5bf6994636355face5d8ae0a4d55666dc9b567
Required artifacts present: spec.md, design.md, uservalidation.md, state.json, scopes.md, report.md
Forbidden sidecar artifacts present: 0
DoD section found: YES
DoD checkbox syntax: PASS
User-validation checklist found: YES
User-validation checkbox syntax: PASS
Automation and human acceptance separated: YES
state.json status: in_progress
state.json workflowMode: bugfix-fastlane
state.json v3 required fields: PASS
state.json v3 recommended fields: PASS
Top-level status matches certification.status: YES
Mode allows done; current status remains in_progress
report Summary section: PASS
report Completion Statement section: PASS
report Test Evidence section: PASS
Mode-specific promotion gates: SKIPPED because status is not in promotion set
Value-first rationale lint: NOT APPLICABLE
Scenario path-placeholder lint: NOT APPLICABLE
Checked DoD evidence blocks: PASS
Unfilled scope evidence templates: 0
Unfilled report evidence templates: 0
Artifact lint PASSED.
```

The hash covers the complete 40-line raw artifact-lint output. Editor
diagnostics immediately after the first owned edit reported zero errors in
`report.md` and zero errors in `state.json`. The final-byte rerun is recorded by
the phase closeout command results rather than predicted here.

## ROUTE-019 DevOps - Repository Authority Revision 319 {#devops-revision-319}

**Phase:** devops
**Agent:** `bubbles.devops`
**Recorded at:** `2026-08-27`
**Claim Source:** interpreted
**Interpretation:** The implementation commit changes one direct functional
test and one strict-registry title scalar. It changes no deployable page,
production source, Pages workflow, build script, configuration, dependency,
deployment, observability, release, registry, or runtime surface. The existing
Pages pipeline already runs the canonical selftest and registered-site build
before deployment, and the builder excludes `specs`, `scripts`, and top-level
test infrastructure from the published `_site` artifact.

### Persisted Mode And Route Order

**Command:** `timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 persisted bugfix-fastlane mode" -- bash .github/bubbles/scripts/mode-resolver.sh --grandfather bugfix-fastlane`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 persisted bugfix-fastlane mode
$ bash .github/bubbles/scripts/mode-resolver.sh --grandfather bugfix-fastlane
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

The persisted sequence places `security` immediately after `devops`.

### Implementation And Operational Impact

**Command:** `timeout 60 git --no-pager show --format=fuller --name-status 4824edc81`
**Exit Code:** 0
**Claim Source:** executed

```text
commit 4824edc81b0920b40e728f55b8e8dfdbe1804b2d
Author:     pkirsanov <pkirsanov@users.noreply.github.com>
AuthorDate: Thu Aug 27 01:15:48 2026 +0000
Commit:     pkirsanov <pkirsanov@users.noreply.github.com>
CommitDate: Thu Aug 27 01:15:48 2026 +0000

    test(BUG-009): assert named risk exclusions

M       tests/portfolio-risk.functional.mjs
M       tests/portfolio-test-integrity.unit.mjs
```

The exact patch adds one `RLPA.assetTreatment()` test with direct assertions
and changes only the `F008-RISK-INPUT-001` `title` value. No operational path
appears in the commit.

| Surface | Disposition | Grounded basis |
| --- | --- | --- |
| CI | No change required | `.github/workflows/pages.yml` already gates deploy on `node scripts/selftest.mjs`, source-lock validation, the Pages build, and the full browser suite. |
| Pages build | Verify only | `node scripts/build-pages-site.mjs` is the declared build and succeeded below. |
| Deployment | No change required | The deploy job consumes `_site`; the build plan excludes top-level tests and all `specs`. |
| Configuration and dependencies | No change required | Neither implementation path is a config, manifest, lockfile, package, or generated artifact. |
| Observability and runtime operations | Not applicable | Research Lab declares no runtime service, lifecycle command, or telemetry deployment for this test-only repair. |
| Release and registry | No change required | No page, tool registration, navigation entry, release packet, or public artifact membership changes. |

### Canonical Pages Build

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 DevOps Pages build" -- node scripts/build-pages-site.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 DevOps Pages build
$ node scripts/build-pages-site.mjs
exit: 0
lines: 1
sha256: f6fd8b5d118d9bba99eb7b75c51c2643cce74640b56f2b3882ce55217a3a77ea
--- output ---
{"contractVersion":"pages-site-build-result/v1","dryRun":false,"registeredPages":29,"excludedPaths":12,"rootFiles":123,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/82b13eade7cb2e0673ec91324f0bdbf9a84461a363aa7209693a875c20b40cab","omittedOrphanIndexes":182}
```

The exact canonical build produced the registered Pages artifact without adding
a DevOps remediation obligation.

### Detailed Pages Artifact Contract

**Command:**

```text
timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 DevOps Pages build details" -- node -e 'import("./scripts/build-pages-site.mjs").then(({buildPagesSite})=>{const fs=require("node:fs");const plan=buildPagesSite();console.log("CONTRACT=pages-site-build-result/v1");console.log(`REGISTERED_PAGES=${plan.registeredPages.length}`);console.log(`EXCLUDED_PATHS=${plan.excludedPaths.length}`);console.log(`ROOT_FILES=${plan.rootFiles.length}`);console.log(`PUBLIC_DIRECTORIES=${plan.directories.join(",")}`);console.log(`HISTORY_INDEX=${plan.historyIndexDirectory}`);console.log(`OMITTED_ORPHAN_INDEXES=${plan.orphanIndexDirectories.length}`);console.log(`PUBLISHED_INDEX=${fs.existsSync("_site/index.html")?"present":"absent"}`);console.log(`PUBLISHED_NOJEKYLL=${fs.existsSync("_site/.nojekyll")?"present":"absent"}`);console.log(`PUBLISHED_FOCUSED_TEST=${fs.existsSync("_site/tests/portfolio-risk.functional.mjs")?"present":"absent"}`);console.log(`PUBLISHED_REGISTRY_TEST=${fs.existsSync("_site/tests/portfolio-test-integrity.unit.mjs")?"present":"absent"}`);console.log(`PUBLISHED_BUG_PACKET=${fs.existsSync("_site/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin")?"present":"absent"}`);console.log("PAGES_BUILD=PASS")})'
```

**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 DevOps Pages build details
exit: 0
lines: 13
sha256: e8270b7459ad190a5d9480255a306ac632f03132aeea91c32511e336a9e1b5b2
--- output ---
CONTRACT=pages-site-build-result/v1
REGISTERED_PAGES=29
EXCLUDED_PATHS=12
ROOT_FILES=123
PUBLIC_DIRECTORIES=briefs,data,docs,notes,research,rlexperience-adapters,tests/fixtures
HISTORY_INDEX=briefs/indexes/82b13eade7cb2e0673ec91324f0bdbf9a84461a363aa7209693a875c20b40cab
OMITTED_ORPHAN_INDEXES=182
PUBLISHED_INDEX=present
PUBLISHED_NOJEKYLL=present
PUBLISHED_FOCUSED_TEST=absent
PUBLISHED_REGISTRY_TEST=absent
PUBLISHED_BUG_PACKET=absent
PAGES_BUILD=PASS
```

### Canonical CI Selftest

**Command:** `timeout 1800 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 DevOps canonical selftest" -- node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 DevOps canonical selftest
$ node scripts/selftest.mjs
exit: 0
lines: 3895
sha256: 036d7710d7e974aa18018d770b041e6309f8d20c55c24086857162d3629e73d8
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
--- omitted 3855 line(s); sha256 above covers the full output ---
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

The stored hash covers the complete 3,895-line source output. The compact
rendering keeps every displayed line verbatim while the hash covers the omitted
middle.

### CI Path And Artifact Membership Consistency

**Command:**

```text
timeout 120 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 DevOps CI path consistency" -- node -e 'const fs=require("node:fs");const{execFileSync}=require("node:child_process");const expected=["tests/portfolio-risk.functional.mjs","tests/portfolio-test-integrity.unit.mjs"];const paths=execFileSync("git",["diff-tree","--no-commit-id","--name-only","-r","4824edc81"],{encoding:"utf8"}).trim().split("\n");if(JSON.stringify(paths)!==JSON.stringify(expected))throw new Error("implementation path set drifted");console.log("IMPLEMENTATION_PATHS");for(const path of paths)console.log(path);console.log(`IMPLEMENTATION_PATH_COUNT=${paths.length}`);const checks=[["PUBLISHED_FOCUSED_TEST","_site/tests/portfolio-risk.functional.mjs",false],["PUBLISHED_REGISTRY_TEST","_site/tests/portfolio-test-integrity.unit.mjs",false],["PUBLISHED_BUG_PACKET","_site/specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin",false],["PUBLISHED_INDEX","_site/index.html",true],["PUBLISHED_NOJEKYLL","_site/.nojekyll",true]];for(const[label,path,want]of checks){const found=fs.existsSync(path);if(found!==want)throw new Error(`${label} unexpected membership`);console.log(`${label}=${found?"present":"absent"}`)}console.log("OPERATIONAL_PATHS_CHANGED=0");console.log("CI_PATH_CONSISTENCY=PASS");'
```

**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 DevOps CI path consistency
exit: 0
lines: 11
sha256: 1089e5c7c580f5b5fabb0123e3f353fc02d61243459757aaf8b3a02c5257d4ba
--- output ---
IMPLEMENTATION_PATHS
tests/portfolio-risk.functional.mjs
tests/portfolio-test-integrity.unit.mjs
IMPLEMENTATION_PATH_COUNT=2
PUBLISHED_FOCUSED_TEST=absent
PUBLISHED_REGISTRY_TEST=absent
PUBLISHED_BUG_PACKET=absent
PUBLISHED_INDEX=present
PUBLISHED_NOJEKYLL=present
OPERATIONAL_PATHS_CHANGED=0
CI_PATH_CONSISTENCY=PASS
```

### DevOps Disposition And Route

**Claim Source:** interpreted
**Interpretation:** Actual commit and current contract evidence disconfirm every
candidate operational obligation. Adding a workflow, deployment action,
configuration key, observability hook, release artifact, or registry entry for
this test-only repair would be invented work.

Verdict: **NO DEVOPS CHANGE REQUIRED**.

`BUG-009-ROUTE-019` is resolved. `B009-DEVOPS-EXECUTION-001` records the
no-change phase, and `BUG-009-ROUTE-020` routes next to `bubbles.security`, the
phase immediately after DevOps in the persisted `bugfix-fastlane` order.
BUG-009 remains `in_progress`, Scope 1 remains In Progress, all 18 DoD items
remain unchecked, human acceptance remains unclaimed, and certification remains
unchanged.

## ROUTE-020 Security - Repository Authority Revision 321 {#security-revision-321}

**Phase:** security
**Agent:** `bubbles.security`
**Recorded at:** `2026-08-27T08:56:12Z`
**Claim Source:** interpreted
**Interpretation:** No BUG-009 security defect was found in implementation
commit `4824edc81`. The verdict covers only the two changed test hunks and the
unchanged injector mechanism they invoke. G034 and the canonical Node security
suites provide supporting repository checks, but they do not turn this narrow
review into a whole-repository security certification.

### Threat Model And Review Boundary

| Surface | Trust transition | Data or capability | Result |
| --- | --- | --- | --- |
| Committed `CASES` entry to child environment | Trusted test parent to spawned Node child | Module path, exact anchor, replacement source, marker path | No external or runtime input enters the transition. |
| Child `NODE_OPTIONS` to preload | Spawn configuration to `portfolio-defect-injector.cjs` | Process-wide hooks inside that child | The hook does not enter the parent or an uninjected control child. |
| Preload to target source | Exact resolved filename plus exact one-anchor replacement | In-memory executable JavaScript | Powerful by design; not a sandbox or privilege boundary. |
| Preload to marker | Caller-selected path to append-only diagnostic record | Relative module name, hook name, byte count | Actual harness places markers in a unique `0700` directory and removes it through `t.after`. |
| Repository to Pages artifact | Source tree to `_site` allowlist | Public deployable bytes | Both changed tests, the injector, and the BUG packet are omitted. |

The focused fixture contains synthetic symbols and holding identifiers only.
The harness copies the parent environment into each child, so ambient secrets
could exist in child process memory. The changed title and carrier do not print
the environment, replacement input, or marker path. Marker content is limited
to module, hook, and byte count. This is a process-inheritance observation, not
a claim that operating-system process memory is secret-free.

### Implementation Commit And Pre-Existing Injector

**Command:** `timeout 30 git --no-pager show --format=fuller --name-status --summary 4824edc81`
**Exit Code:** 0
**Claim Source:** executed

```text
commit 4824edc81b0920b40e728f55b8e8dfdbe1804b2d
Author:     pkirsanov <pkirsanov@users.noreply.github.com>
AuthorDate: Thu Aug 27 01:15:48 2026 +0000
Commit:     pkirsanov <pkirsanov@users.noreply.github.com>
CommitDate: Thu Aug 27 01:15:48 2026 +0000

    test(BUG-009): assert named risk exclusions

M       tests/portfolio-risk.functional.mjs
M       tests/portfolio-test-integrity.unit.mjs
```

**Command:** `timeout 30 git --no-pager log --follow --format='%H %aI %s' -- tests/portfolio-defect-injector.cjs`
**Exit Code:** 0
**Claim Source:** executed

```text
82d1db5e5819738aa4f5049ebe7078514408620c 2026-08-27T00:15:49+00:00 test(BUG-007): prove mutation failure causality
fef1b4491088d0fac1a56a9914078dc3fb2e3e23 2026-08-24T01:19:37+00:00 test(008): checkpoint adversarial test replacement
```

The injector predates BUG-009. The implementation diff adds one direct
`assetTreatment()` test and changes one static `title` scalar. It does not
change environment handling, base64 decoding, path resolution, hooks, marker
I/O, dependencies, Pages packaging, or production source.

### Security Assessment

| Requested area | Assessment | Grounded disposition |
| --- | --- | --- |
| Environment-variable inputs | Five injector inputs are required. The harness derives them from committed case records and a private temp path. `RL_DEFECT_DOUBLE_APPLICATION_CONTROL` is a fixed internal control. | No BUG-009 regression. Missing marker input failed loud in the disposable probe. |
| Base64 decode and replacement | Base64 is transport, not validation. Arbitrary decoded replacement text can execute after compilation. Empty or malformed decoded anchors do not silently apply because the one-occurrence check rejects them. | Pre-existing trusted-harness capability. Invalid base64 and absent anchors failed before marker creation. |
| Exact module and anchor constraints | Both hooks compare the fully resolved loaded filename to `TARGET`. `representedSource()` requires exactly one anchor and rejects no-op replacement. | Exact-target control passed; zero and duplicate anchors were rejected with empty markers. |
| Arbitrary path or code execution | `path.resolve(ROOT, MODULE_REL)` accepts absolute and traversing paths, and replacement text is executable JavaScript. `MARKER` is also caller-selected. | Deliberate, pre-existing capability, not a sandbox. The only caller is already-authorized committed test code that can execute Node and write files directly; BUG-009 adds no less-privileged input or new authority. |
| `NODE_OPTIONS` preload scope | The harness appends `--require <injector>` only to the spawned child's copied environment and uses `spawnSync` argv with no shell. Existing parent options are inherited. | Probe confirmed the parent hook and an uninjected child remain unchanged. No production or browser process receives the preload. |
| Marker creation, permissions, and cleanup | The harness creates a unique `mkdtempSync` workspace, pre-creates each marker, and removes the workspace in `t.after`. The injector appends module, hook, and byte count only. | Probe observed directory mode `0700`, marker mode `0644` with no group/other write bit, unchanged source, and zero residue. The directory prevents other-user reads of the `0644` file. Hard-kill residue remains a generic temp-file limitation, not introduced by BUG-009. |
| Parallel isolation | Every integrity invocation is a separate Node process, and marker paths are unique inside the per-test workspace. | Four concurrent children each produced one isolated marker and exited successfully. |
| Secret and PII exposure | The two changed hunks contain no credential or personal input. The child inherits ambient environment values but neither changed test nor injector emits them. Actual marker content omits environment and replacement values. | No exposure found in the reviewed path. No claim is made about unrelated repository code or OS process inspection. |
| Test-to-production boundary | All three mechanism files remain under `tests/`. No production module imports the injector, and implementation commit `4824edc81` changes no production file. | Test-only boundary preserved. |
| Generated Pages exclusion | The builder publishes an explicit directory allowlist containing only `tests/fixtures` from the test tree. | Isolated Pages build omitted both changed tests, the injector, and BUG state, then removed its temporary artifact. |
| Supply chain and dependencies | `package.json`, `package-lock.json`, `.npmrc`, the Pages build script, and Pages workflow are unchanged by the implementation commit. | Source-lock validation passed and rejected all 16 adversarial relaxations. No CVE-absence claim is made because this review did not run an undeclared network vulnerability audit. |
| New title mapping | The title is a committed scalar, regex-escaped, and passed as a `spawnSync` argv element. It never reaches a shell. The mapping changes the selected assertion from broad downstream structure to the exact unsupported-holding contract while the full risk carrier remains independently executed. | Trust is narrowed and made more causal; no command-injection or authority expansion was introduced. |

### Mechanical Security And Reality Scans

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 G034 mechanical security floor" -- bash .github/bubbles/scripts/security-gate.sh --repo-root .`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 G034 mechanical security floor
$ bash .github/bubbles/scripts/security-gate.sh --repo-root .
exit: 0
lines: 1
sha256: 5c96c1174f3bd9937056d5075db7fbe6421b358e2770b19a5704e751e19bd7f0
--- output ---
[security-gate] OK — 10163 tracked file(s), zero G034 findings
```

G034 is the required mechanical floor. Its clean result does not cover
authorization, injection, sandboxing, or business-logic trust by itself.

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 installed implementation reality security scan" -- bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 installed implementation reality security scan
$ bash .github/bubbles/scripts/implementation-reality-scan.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin --verbose
exit: 0
lines: 35
sha256: 32afbca50feeceaa740f471db55387647e6f219712239c11ea128083cc61b9a2
--- output ---
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

### Dependency And Canonical Security Checks

**Command:** `timeout 120 node scripts/validate-node-source-lock.mjs`
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

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 canonical Node security suites" -- node --test tests/*.security.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 canonical Node security suites
$ node --test tests/red-alert.security.mjs tests/web-evidence.security.mjs
exit: 0
lines: 124
sha256: 7fef7e3535c048a3dd7bf0726c335100cc93774c3f46200b87ff2f12a98f1848
--- first 20 ---
TAP version 13
# Subtest: acquire() discards a hostile injected source and its marker never enters the frozen bundle or the projection
ok 1 - acquire() discards a hostile injected source and its marker never enters the frozen bundle or the projection
  ---
  duration_ms: 16.496233
  type: 'test'
  ...
# Subtest: a hostile thesis is a closed refusal at assembly and its marker is never echoed in the refusal
ok 2 - a hostile thesis is a closed refusal at assembly and its marker is never echoed in the refusal
  ---
  duration_ms: 3.287767
  type: 'test'
  ...
# Subtest: the engine source and runtime red-alert policy hardcode no illustrative named topic
ok 3 - the engine source and runtime red-alert policy hardcode no illustrative named topic
  ---
  duration_ms: 2.72189
  type: 'test'
  ...
# Subtest: no red-alert policy exposes a topic catalog, seed catalog, or a minimum-output floor
--- omitted 84 line(s); sha256 above covers the full output ---
--- last 20 ---
# Subtest: STATIC authority proof: acquisition module imports ONLY node:crypto and owns zero forbidden capability
ok 18 - STATIC authority proof: acquisition module imports ONLY node:crypto and owns zero forbidden capability
  ---
  duration_ms: 1.835926
  type: 'test'
  ...
# Subtest: Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one
ok 19 - Regression: agenda acquisition rejects query URL byte time and concurrency limits at capacity plus one
  ---
  duration_ms: 1.206352
  type: 'test'
  ...
1..19
# tests 19
# suites 0
# pass 19
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 154.711042
```

The security suites are broad supporting regression evidence. They do not
exercise the mutation injector and are not cited as proof of its controls.

### Mutation Mechanism And Focused Carrier

**Command:** `timeout 600 bash .github/bubbles/scripts/evidence-capture.sh --label "BUG-009 complete mutation mechanism" -- node --test tests/portfolio-test-integrity.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 complete mutation mechanism
$ node --test tests/portfolio-test-integrity.unit.mjs
exit: 0
lines: 28
sha256: cb390e50cf5622dd9143ae56e5f9c2b9324b950501f56aaef09993db0aa3bc18
--- output ---
TAP version 13
# Subtest: Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing
  ---
  duration_ms: 7429.035841
  type: 'test'
  ...
# Subtest: BUG-007: caller-key protections and normal ordering are load-bearing in memory
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in memory
  ---
  duration_ms: 1619.654238
  type: 'test'
  ...
# Subtest: BUG-007: represented mutants execute one protective assertion through one intended hook
ok 3 - BUG-007: represented mutants execute one protective assertion through one intended hook
  ---
  duration_ms: 1885.443047
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
# duration_ms 11053.311879
```

**Command:** `timeout 120 node --test --test-reporter=tap --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
TAP version 13
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  ---
  duration_ms: 3.708592
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
# duration_ms 103.71889
```

### Disposable Injector Boundary Probe

**Command:** `cd ~/research-lab && timeout 120 node /tmp/bug009-security-probe.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
[bug009-security] required-marker-input=REFUSED
[bug009-security] invalid-base64-anchor=REFUSED
[bug009-security] absent-anchor=REFUSED found=0 marker=empty
[bug009-security] duplicate-anchor=REFUSED found=2 marker=empty
[bug009-security] exact-module-control=PASS sibling=unmodified
[bug009-security] outside-root-target=ALLOWED caller-controlled-preload
[bug009-security] replacement-source-execution=CONFIRMED child-only
[bug009-security] node-options-scope=child-only parent-hook=unchanged
[bug009-security] marker-directory-mode=0700
[bug009-security] marker-file-mode=0644 group-other-write=false
[bug009-security] marker-content=module-hook-byte-count-only
[bug009-security] parallel-children=4 isolated-markers=4
[bug009-security] target-source-hash=unchanged
[bug009-security] cleanup=PASS residue=false
[bug009-security] trust-boundary=test-parent-already-controls-node-execution
```

The disposable script created only `/tmp` fixtures, removed its entire fixture
tree in `finally`, and was then itself removed. A separate check printed
`[bug009-security] probe-script-cleanup=PASS residue=false`.

### Pages And Byte Containment

**Command:**

```text
cd ~/research-lab && timeout 120 node --input-type=module -e 'import assert from "node:assert/strict"; import { existsSync, rmSync } from "node:fs"; import { buildPagesSite } from "./scripts/build-pages-site.mjs"; const destination=`.rl-site-bug009-security-${process.pid}`; const omitted=["tests/portfolio-risk.functional.mjs","tests/portfolio-test-integrity.unit.mjs","tests/portfolio-defect-injector.cjs","specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json"]; let plan; try { plan=buildPagesSite({destination}); for (const path of omitted) assert.equal(existsSync(`${destination}/${path}`),false,path); assert.equal(existsSync(`${destination}/tests/fixtures`),true); console.log(`[bug009-pages] registered-pages=${plan.registeredPages.length}`); console.log(`[bug009-pages] public-directories=${plan.directories.join(",")}`); for (const path of omitted) console.log(`[bug009-pages] omitted=${path}`); console.log("[bug009-pages] allowed-test-subtree=tests/fixtures"); console.log("[bug009-pages] mechanism-files-public=false"); console.log("[bug009-pages] bug-packet-public=false"); } finally { rmSync(destination,{recursive:true,force:true}); } console.log(`[bug009-pages] cleanup=${existsSync(destination) ? "FAIL" : "PASS"}`);'
```

**Exit Code:** 0
**Claim Source:** executed

```text
[bug009-pages] registered-pages=29
[bug009-pages] public-directories=briefs,data,docs,notes,research,rlexperience-adapters,tests/fixtures
[bug009-pages] omitted=tests/portfolio-risk.functional.mjs
[bug009-pages] omitted=tests/portfolio-test-integrity.unit.mjs
[bug009-pages] omitted=tests/portfolio-defect-injector.cjs
[bug009-pages] omitted=specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json
[bug009-pages] allowed-test-subtree=tests/fixtures
[bug009-pages] mechanism-files-public=false
[bug009-pages] bug-packet-public=false
[bug009-pages] cleanup=PASS
```

**Command:**

```text
cd ~/research-lab && for path in tests/portfolio-defect-injector.cjs rlportfolioanalytics.js tests/portfolio-risk.functional.mjs tests/portfolio-test-integrity.unit.mjs; do parent=$(timeout 30 git rev-parse "4824edc81^:$path"); implementation=$(timeout 30 git rev-parse "4824edc81:$path"); head=$(timeout 30 git rev-parse "HEAD:$path"); worktree=$(timeout 30 git hash-object "$path"); printf '[bug009-containment] %s parent=%s implementation=%s head=%s worktree=%s\n' "$path" "$parent" "$implementation" "$head" "$worktree"; done; if timeout 30 git diff --quiet 4824edc81^ 4824edc81 -- package.json package-lock.json .npmrc; then echo '[bug009-containment] dependency-files=UNCHANGED'; else echo '[bug009-containment] dependency-files=CHANGED'; exit 1; fi; if timeout 30 git diff --quiet 4824edc81^ 4824edc81 -- scripts/build-pages-site.mjs .github/workflows/pages.yml; then echo '[bug009-containment] pages-build-workflow=UNCHANGED'; else echo '[bug009-containment] pages-build-workflow=CHANGED'; exit 1; fi; if [[ -z "$(timeout 30 git status --short -- tests/portfolio-defect-injector.cjs rlportfolioanalytics.js tests/portfolio-risk.functional.mjs tests/portfolio-test-integrity.unit.mjs)" ]]; then echo '[bug009-containment] reviewed-implementation-paths=WORKTREE_CLEAN'; else echo '[bug009-containment] reviewed-implementation-paths=WORKTREE_DIRTY'; exit 1; fi; if [[ -z "$(timeout 30 git status --short -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/report.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json)" ]]; then echo '[bug009-containment] owned-artifacts-before-edit=WORKTREE_CLEAN'; else echo '[bug009-containment] owned-artifacts-before-edit=WORKTREE_DIRTY'; exit 1; fi
```

**Exit Code:** 0
**Claim Source:** executed

```text
[bug009-containment] tests/portfolio-defect-injector.cjs parent=20ed786006be23f542ec3c524758eda625567ea9 implementation=20ed786006be23f542ec3c524758eda625567ea9 head=20ed786006be23f542ec3c524758eda625567ea9 worktree=20ed786006be23f542ec3c524758eda625567ea9
[bug009-containment] rlportfolioanalytics.js parent=203c57b14898a13e0da81898e755ea5f5f6674ba implementation=203c57b14898a13e0da81898e755ea5f5f6674ba head=203c57b14898a13e0da81898e755ea5f5f6674ba worktree=203c57b14898a13e0da81898e755ea5f5f6674ba
[bug009-containment] tests/portfolio-risk.functional.mjs parent=a69b5e284265b661ddeab477d4c449f2c777f81d implementation=2a537316eadbf5067d19c020e0a60b020fb16e84 head=2a537316eadbf5067d19c020e0a60b020fb16e84 worktree=2a537316eadbf5067d19c020e0a60b020fb16e84
[bug009-containment] tests/portfolio-test-integrity.unit.mjs parent=22fbd21801fd48054d84bf8433f0a3a911bea863 implementation=5aa222876f78430ef1d76a2c980045cf6a5d5207 head=5aa222876f78430ef1d76a2c980045cf6a5d5207 worktree=5aa222876f78430ef1d76a2c980045cf6a5d5207
[bug009-containment] dependency-files=UNCHANGED
[bug009-containment] pages-build-workflow=UNCHANGED
[bug009-containment] reviewed-implementation-paths=WORKTREE_CLEAN
[bug009-containment] owned-artifacts-before-edit=WORKTREE_CLEAN
```

### Security Profile And Route

| Check | Result | Basis |
| --- | --- | --- |
| SE1 security coverage complete | PASS | Inputs, decode/replacement, module and anchor constraints, arbitrary target/code capability, preload scope, marker lifecycle, parallel isolation, exposure, production boundary, Pages, dependencies, and title trust were reviewed. |
| SE2 dependency or scanner evidence | PASS | G034, installed G028, source-lock validation, and canonical Node security suites executed. |
| SE3 findings grounded | PASS | The no-defect result and every trust assumption are tied to source, commit, blob, or executable probe evidence above. |
| SE4 artifact handling for open issues | NOT APPLICABLE | No BUG-009 security defect or foreign-owned remediation was found. |

Security verdict: **SECURE WITHIN THE BUG-009 TEST-ONLY CHANGE BOUNDARY**.

This verdict does not claim that the injector safely accepts untrusted input;
it does not. It claims that BUG-009 did not introduce such an input path or
expand authority. `BUG-009-ROUTE-020` is resolved.
`B009-SECURITY-EXECUTION-001` records the phase, and
`BUG-009-ROUTE-021` routes next to `bubbles.validate`, the phase immediately
after security in the persisted `bugfix-fastlane` order. BUG-009 remains
`in_progress`, Scope 1 remains In Progress, all 18 DoD items remain unchecked,
human acceptance remains unclaimed, and certification remains unchanged.

### Post-Edit JSON, Editor, And Preservation Checks

**Command:**

```text
cd ~/research-lab && timeout 30 node -e 'const fs=require("node:fs"); const path="specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json"; const state=JSON.parse(fs.readFileSync(path,"utf8")); if(state.status!=="in_progress") throw new Error("status changed"); if(state.certification.status!=="in_progress") throw new Error("certification changed"); if(state.execution.scopeInventory[0].status!=="In Progress") throw new Error("scope changed"); if(state.execution.nextRequiredOwner!=="bubbles.validate") throw new Error("route owner mismatch"); const route20=state.transitionRequests.find((route)=>route.id==="BUG-009-ROUTE-020"); const route21=state.transitionRequests.find((route)=>route.id==="BUG-009-ROUTE-021"); if(route20?.status!=="resolved"||route21?.status!=="pending") throw new Error("route state mismatch"); console.log("[bug009-state] json=PASS"); console.log(`[bug009-state] status=${state.status}`); console.log(`[bug009-state] certification=${state.certification.status}`); console.log(`[bug009-state] scope=${state.execution.scopeInventory[0].status}`); console.log(`[bug009-state] completed-scopes=${state.completedScopes.length}`); console.log(`[bug009-state] security-claim=${state.execution.completedPhaseClaims.includes("security")}`); console.log(`[bug009-state] route-020=${route20.status}`); console.log(`[bug009-state] route-021=${route21.status}`); console.log(`[bug009-state] next-owner=${state.execution.nextRequiredOwner}`); console.log(`[bug009-state] human-cert-fields-unchanged=${state.certification.certifiedAt===null}`);'
```

**Exit Code:** 0
**Claim Source:** executed

```text
[bug009-state] json=PASS
[bug009-state] status=in_progress
[bug009-state] certification=in_progress
[bug009-state] scope=In Progress
[bug009-state] completed-scopes=0
[bug009-state] security-claim=true
[bug009-state] route-020=resolved
[bug009-state] route-021=pending
[bug009-state] next-owner=bubbles.validate
[bug009-state] human-cert-fields-unchanged=true
```

**Tool:** VS Code diagnostics for BUG-009 `report.md` and `state.json`
**Claim Source:** executed

```text
report.md: No errors found
state.json: No errors found
```

**Command:**

```text
cd ~/research-lab && timeout 30 node -e 'const fs=require("node:fs"); const base="specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin"; const scopes=fs.readFileSync(`${base}/scopes.md`,"utf8"); const state=JSON.parse(fs.readFileSync(`${base}/state.json`,"utf8")); const unchecked=(scopes.match(/^- \[ \]/gm)||[]).length; const checked=(scopes.match(/^- \[[xX]\]/gm)||[]).length; if(unchecked!==18||checked!==0) throw new Error(`DoD drift ${unchecked}/${checked}`); if(state.status!=="in_progress"||state.certification.status!=="in_progress"||state.execution.scopeInventory[0].status!=="In Progress") throw new Error("lifecycle drift"); console.log(`[bug009-preservation] dod-unchecked=${unchecked}`); console.log(`[bug009-preservation] dod-checked=${checked}`); console.log(`[bug009-preservation] status=${state.status}`); console.log(`[bug009-preservation] scope=${state.execution.scopeInventory[0].status}`); console.log(`[bug009-preservation] certification=${state.certification.status}`); console.log(`[bug009-preservation] human-certified-at=${state.certification.certifiedAt}`);' && if timeout 30 git diff --quiet -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/scopes.md specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/uservalidation.md; then echo '[bug009-preservation] planning-and-human-files=UNCHANGED'; else echo '[bug009-preservation] planning-and-human-files=CHANGED'; exit 1; fi; echo '[bug009-preservation] dirty-bug-paths:'; timeout 30 git diff --name-only -- specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin; if [[ -z "$(timeout 30 git diff --cached --name-status)" ]]; then echo '[bug009-preservation] staged-paths=0'; else echo '[bug009-preservation] staged-paths=NONZERO'; exit 1; fi
```

**Exit Code:** 0
**Claim Source:** executed

```text
[bug009-preservation] dod-unchecked=18
[bug009-preservation] dod-checked=0
[bug009-preservation] status=in_progress
[bug009-preservation] scope=In Progress
[bug009-preservation] certification=in_progress
[bug009-preservation] human-certified-at=null
[bug009-preservation] planning-and-human-files=UNCHANGED
[bug009-preservation] dirty-bug-paths:
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/report.md
specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin/state.json
[bug009-preservation] staged-paths=0
```

## Validate Phase — Independent Re-Derivation (BUG-009-ROUTE-021)

### Summary

`bubbles.validate` executed every BUG-009 verification command itself against the
current working tree at HEAD `33e239d5c`. No earlier recorded number is restated
as current evidence. A concurrent session merged a moved `origin/main`
(`0b7534f0a`) carrying 535 changed files including `scripts/selftest.mjs`, so the
previously recorded `3426/3426` canonical baseline was stale by construction and
was re-derived rather than reused.

The product contract holds. The packet cannot reach a terminal status this
session, and the reasons are recorded below rather than worked around.

### Environment

**Claim Source:** executed

```text
HEAD                 33e239d5ce3d3dadf53c720823614bddd6364e8e (main, ahead 75)
index                empty (0 staged paths)
working tree         61 dirty entries, all belonging to an unrelated in-flight
                     Feature 008 / accessibility transaction
BUG-009 packet       clean before this validate append
```

### TP-B009-001 Focused Shipped Carrier GREEN {#validate-tp-b009-001}

**Command:**

```text
timeout 240 node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs
```

**Exit Code:** 0
**Claim Source:** executed

```text
✔ BUG-009 risk mapping: unsupported holdings remain named exclusions (4.099381ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 81.563315
FOCUSED_GREEN_EXIT=0
```

The exact persistent title executes once and passes once on shipped source.

### TP-B009-002 Exact Mutant RED Through ERR_ASSERTION {#validate-tp-b009-002}

The mutation applied is the `F008-RISK-INPUT-001` entry of the strict registry
verbatim: module `rlportfolioanalytics.js`, `find` the named-exclusion push,
`replace` the early `unsupported-holding` return. The `find` string was first
proven to occur exactly once in the shipped module, so the substitution is exact
rather than approximate.

**Command:**

```text
FIND='      else excluded.push({ symbol: h.symbol, assetType: h.assetType || "unknown" });'
REPL='      else return { state: "unsupported-holding", symbol: h.symbol };'
grep -cF "$FIND" rlportfolioanalytics.js
export RL_DEFECT_MODULE=rlportfolioanalytics.js
export RL_DEFECT_FIND_B64=$(printf '%s' "$FIND" | base64 -w0)
export RL_DEFECT_REPLACE_B64=$(printf '%s' "$REPL" | base64 -w0)
export RL_DEFECT_MARKER=$(mktemp -t bug009-marker.XXXXXX)
export NODE_OPTIONS="--require $PWD/tests/portfolio-defect-injector.cjs"
timeout 240 node --test --test-name-pattern='^BUG-009 risk mapping: unsupported holdings remain named exclusions$' tests/portfolio-risk.functional.mjs
```

**Exit Code:** 1 (required RED)
**Claim Source:** executed

```text
=== exactness: FIND present in shipped module? ===
1
GREP_COUNT_ABOVE (must be exactly 1)
MARKER=/tmp/bug009-marker.x2e4Fm

✖ BUG-009 risk mapping: unsupported holdings remain named exclusions (2.197693ms)
ℹ tests 1
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0

✖ failing tests:

test at tests/portfolio-risk.functional.mjs:43:1
✖ BUG-009 risk mapping: unsupported holdings remain named exclusions (2.197693ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
      at TestContext.<anonymous> (file:///<repo-root>/tests/portfolio-risk.functional.mjs:60:10)
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'unsupported-holding',
    expected: 'ok',
    operator: 'strictEqual',
    diff: 'simple'
  }
MUTATION_RED_EXIT=1

=== applied-representation marker contents ===
applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

This is the precise contract BUG-009 exists to establish. The failure origin is
`AssertionError [ERR_ASSERTION]` with `code: 'ERR_ASSERTION'` and
`operator: 'strictEqual'`, raised inside the carrier's own assertion at
`tests/portfolio-risk.functional.mjs:60`. There is no `TypeError`, no
`ERR_TEST_FAILURE`, and no infrastructure substitute. The marker independently
records `via=Module._compile`, matching the registry's declared `intendedHook`,
so the mutation reached the module through the intended representation exactly
once.

### TP-B009-003 Full Strict Registry {#validate-tp-b009-003}

**Command:**

```text
timeout 240 node --test tests/portfolio-test-integrity.unit.mjs
```

**Exit Code:** 0
**Claim Source:** executed

```text
✔ Adversarial: SCN-008-054 every audited Feature 008 defect class remains load-bearing (6081.835772ms)
✔ BUG-007: caller-key protections and normal ordering are load-bearing in memory (1333.855477ms)
✔ BUG-007: represented mutants execute one protective assertion through one intended hook (1299.821115ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 8795.349732
FULL_REGISTRY_EXIT=0
```

Registry breadth was counted rather than assumed: 18 `finding:` entries, one of
which is `F008-RISK-INPUT-001`, whose `title` field now reads
`BUG-009 risk mapping: unsupported holdings remain named exclusions`. The remap
is present in the current tree and is the only title change.

```text
=== registry case count === 18
F008-PORTFOLIO-LIFECYCLE-001  F008-CLEAR-RUNTIME-001   F008-CLEAR-TEST-001
F008-BEHAVIOR-CONTRACT-001    F008-BAR-COVERAGE-001    F008-BRIEF-EVIDENCE-001
F008-BRIEF-POLICY-001         F008-BROWSER-API-001     F008-RISK-INPUT-001
F008-RISK-DIAGNOSTICS-001     F008-PATH-CONTRACT-001   F008-SURVIVAL-PATH-001
F008-DIVERSIFICATION-001      F008-HEDGE-001           F008-ALLOCATION-001
F008-SENSITIVITY-BL-001       F008-DOSSIER-001         F008-COMPUTE-NAV-001
```

### TP-B009-004 Full Risk Carrier {#validate-tp-b009-004}

**Command:** `timeout 240 node --test tests/portfolio-risk.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ BUG-009 risk mapping: unsupported holdings remain named exclusions (3.31049ms)
✔ SCN-008-047 mixed portfolio freezes one cutoff and composes partial structured risk output (6.101281ms)
✔ SCN-008-047 failed candidate preserves the last valid structured result (3.12239ms)
ℹ tests 3
ℹ pass 3
ℹ fail 0
ℹ skipped 0
ℹ duration_ms 87.429132
FULL_RISK_EXIT=0
```

### TP-B009-005 BUG-008 Carriers {#validate-tp-b009-005}

**Command:**

```text
timeout 600 node --test tests/portfolio-privacy.functional.mjs tests/portfolio-paths.functional.mjs tests/portfolio-diversification.functional.mjs tests/portfolio-allocation.functional.mjs tests/portfolio-dossier.functional.mjs
```

**Exit Code:** 0
**Claim Source:** executed

```text
ℹ tests 43
ℹ suites 0
ℹ pass 43
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2127.842794
BUG008_CARRIERS_EXIT=0
```

All five named carriers are green; no BUG-008 title regressed under the remap.

### TP-B009-006 Proportionate Browser Regression {#validate-tp-b009-006}

**Command:**

```text
timeout 1800 npx --no-install playwright test tests/portfolio-survival-risk.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
```

**Exit Code:** 0
**Claim Source:** executed

```text
Running 13 tests using 1 worker
  ✓   1 …: SCN-008-013 arithmetic CAGR and conditional drag stay separate (1.4s)
  ✓   2 …n: SCN-008-014 unrecovered drawdown stops at the evidence cutoff (1.1s)
  ✓   3 …wdown canvas tables remain equivalent at desktop mobile and zoom (1.3s)
  ✓   4 …015 concentration lenses expose overlap and missing look through (1.2s)
  ✓   5 …SCN-008-016 beta alpha R squared and residual risk stay separate (1.2s)
  ✓   6 …nchmark fit is unavailable rather than regressed against a guess (1.2s)
  ✓   7 …ion: SCN-008-017 marginal and total risk contributions reconcile (1.3s)
  ✓   8 …lared proxy factors report exposures and name themselves proxies (1.1s)
  ✓   9 …08-017 return contribution stays distinct from risk contribution (1.1s)
  ✓  10 …5 manual assets and absent look through stay visible not omitted (1.1s)
  ✓  11 …and contribution diagnostics preserve mobile canvas table parity (1.3s)
  ✓  12 …olio inputs preserve eligible risk diagnostics and partial truth (1.3s)
  ✓  13 … 008 Risk X-Ray refuses rather than showing a partial portfolio (992ms)

  13 passed (18.7s)
RISK_E2E_EXIT=0
```

This is offered as proportionate regression breadth only. The direct
assertion-origin contract is proved by the pure-logic pair above, not here.

### TP-B009-008 Canonical Selftest — Re-Derived, Total Changed {#validate-tp-b009-008}

**Command:** `timeout 1800 node scripts/selftest.mjs` (via installed
`evidence-capture.sh`, which hashes every produced line)
**Exit Code:** 0
**Claim Source:** executed

```text
# BUG-009 validate: canonical selftest on current tree
$ node scripts/selftest.mjs
exit: 0
lines: 3898
sha256: b05ad83593bfce36f7f515d68cce52822c19e93bb64797cf2087653cf5dc9179
--- last lines ---
  ✓ no scope progress claim disagrees with its Definition of Done outside the
    frozen baseline (0 new, 14 frozen, 0 stale of 87 claim(s))

================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
```

The current tree produces **3429 passed, 0 failed**. The packet's earlier
recorded total was 3426. The total moved by +3 because the merged
`origin/main` changed `scripts/selftest.mjs` among 535 files. Nothing failed, so
this is a baseline movement caused by work outside BUG-009, not a regression, and
it is recorded rather than reconciled away. Validate does not own that
divergence and did not adjust any budget or baseline to absorb it.

### TP-B009-009 / TP-B009-010 Guards {#validate-tp-b009-009}

**Claim Source:** executed

```text
$ timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/portfolio-test-integrity.unit.mjs tests/portfolio-risk.functional.mjs
✅ Adversarial signal detected in tests/portfolio-test-integrity.unit.mjs
✅ Adversarial signal detected in tests/portfolio-risk.functional.mjs
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
REGRESSION_QUALITY_EXIT=0

$ timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh <packet> --verbose
  Files scanned:  2
  Violations:     0
  Warnings:       0
🟢 PASSED: No source code reality violations detected
G028_EXIT=0
```

### TP-B009-011 Named Packet Gates {#validate-tp-b009-011}

All six gates named by `CMD-B009-PACKET` were run through the installed
`.github/bubbles/scripts/` entry points.

**Claim Source:** executed

```text
artifact-lint.sh              → Artifact lint PASSED.                    EXIT=0
traceability-guard.sh         → RESULT: PASSED (0 warnings)              EXIT=0
scenario-obligation-lint.sh   → OK — 1 coherent derived obligation matrix EXIT=0
test-mechanism-lint.sh        → OK — 1 declared mechanism(s) coherent     EXIT=0
scope-context-fit-lint.sh     → OK — all 1 scope(s) self-contained        EXIT=0
capability-foundation-guard.sh→ PASS Gate G094                           EXIT=0
```

### Code Diff Evidence

Change-boundary containment was verified against the real implementation commit
rather than asserted from the scope prose.

**Command:** `git --no-pager show --stat --oneline 4824edc81`
**Exit Code:** 0
**Claim Source:** executed

```text
4824edc81 test(BUG-009): assert named risk exclusions
 tests/portfolio-risk.functional.mjs     | 29 +++++++++++++++++++++++++++++
 tests/portfolio-test-integrity.unit.mjs |  2 +-
 2 files changed, 30 insertions(+), 1 deletion(-)
```

Exactly two files, both tests, +30 / −1. `rlportfolioanalytics.js` and
`tests/portfolio-defect-injector.cjs` are untouched by the delivery, so the
declared test-only Change Boundary holds and the mutation proof runs against
genuinely shipped source.

### Blocking Findings Validate Does Not Own

**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh <packet>`
**Exit Code:** 1
**Claim Source:** executed

```text
🔴 TRANSITION BLOCKED: 17 failure(s), 2 warning(s)
failedGateIds: [G061,G022,G053,G027,G040,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
verdict: FAIL
```

<!-- bubbles:g040-skip-begin -->
| Gate | Finding | Owner |
| --- | --- | --- |
| G022 | Required phases `implement`, `validate`, `audit` absent from phase records. Persisted claims are `bug, plan, test, regression, simplify, gaps, harden, stabilize, devops, security`. | `bubbles.audit` must run; the phase vocabulary is plan-owned |
| G022 Check 6B / G140 | Phase names `plan` and `design` are not registered in the installed `.github/bubbles/workflows.yaml`; `phase-name-enum-lint.sh` exits 1 on the same two names | framework-managed installed surface; downstream must not hand-edit it |
| G136 | Scope is a repair but `scopes.md` carries no change-boundary DoD item enumerating allowed and excluded surfaces | `bubbles.plan` |
| G027 | Phase claims include implement/test while `completedScopes` is empty and zero scopes are Done | resolves once DoD adjudication is applied by the scope owner |
| G061 | `BUG-009-ROUTE-021` carried `status: pending`, which is outside the accepted `open / closed / resolved` enum | resolved by this validate phase |
| G061 (residual) | The guard's `open` shape models an **external** referral: it demands `routedTo`, `routedToSpec`, `routedToCommit`, `routedToTicket` as a URL, `productAction: "none"`, and `crossRepoFollowUp: true`. `BUG-009-ROUTE-022` is an **internal** next-owner handoff inside this repository. Validate populated those fields, saw the guard then require an external URL and a cross-repo flag, and removed them rather than fabricate a cross-repo referral that does not exist. Every earlier route in this packet sidestepped the mismatch by being marked `resolved` on creation, so no internal open handoff has ever satisfied G061 here. | `bubbles.plan` — reconcile the packet's internal-handoff routing convention with the installed G061 schema |
| G040 | One deferral-language hit in `report.md` | adjudicated below |
<!-- bubbles:g040-skip-end -->

### G040 Adjudication — report.md:573

**Exit Code:** 0
**Claim Source:** executed

```text
$ grep -n 'Phase:\*\* plan follow-up' report.md
573:**Phase:** plan follow-up
```

Read in context, line 573 is the phase label on the header of a historical
`TP-B009-008` selftest evidence block. It names which phase produced that run.
It promises no work, and no unfinished obligation hides behind it.

That makes it a false positive **in substance** and a real failure **in
mechanism**: G040 scans report artifacts for a fixed vocabulary, that label
matches it, and the gate is blocking with no bypass. The correct resolution is
not to launder the wording of a historical evidence block. It is to give the
label a registered phase name — which is the same defect G140 and Check 6B
already report, since the phase it names is itself unregistered. One root cause,
three symptoms. Validate records the adjudication and routes the phase-vocabulary
reconciliation to the owner rather than rewriting prior evidence prose to quiet a
scanner.


### DoD Adjudication

Validate does not own `scopes.md`, so the checkboxes are left for the scope
owner to apply together with the G136 change-boundary repair that the same file
already needs. The verdict per item is recorded here so the owner applies ticks
to evidence rather than to assertion.

| DoD item | Validate verdict | Evidence |
| --- | --- | --- |
| `SCN-B009-001` proves exact focused title calls real exported source | SUPPORTED | [#validate-tp-b009-001](#validate-tp-b009-001) |
| Root cause remains the broad mutation-to-title mapping | SUPPORTED | registry entry `F008-RISK-INPUT-001` now names the focused title |
| Exact persistent title present | SUPPORTED | [#validate-tp-b009-001](#validate-tp-b009-001) |
| Only the `F008-RISK-INPUT-001` title mapping changes | SUPPORTED | [Code Diff Evidence](#code-diff-evidence) — 2 files, +30/−1 |
| Delivery stays inside the test-only Change Boundary | SUPPORTED | [Code Diff Evidence](#code-diff-evidence) |
| `TP-B009-000` persistent wrong-origin RED | NOT RE-EXECUTABLE | Post-fix the registry is green by design; the pre-fix RED is a persistent historical record, not a re-runnable claim |
| `TP-B009-001` focused shipped GREEN passes exactly once | SUPPORTED | [#validate-tp-b009-001](#validate-tp-b009-001) |
| `TP-B009-002` focused mutation RED via `ERR_ASSERTION` | SUPPORTED | [#validate-tp-b009-002](#validate-tp-b009-002) |
| `TP-B009-003` registry 3/3 with all 18 cases | SUPPORTED | [#validate-tp-b009-003](#validate-tp-b009-003) |
| `TP-B009-004` full risk carrier | SUPPORTED | [#validate-tp-b009-004](#validate-tp-b009-004) |
| `TP-B009-005` five BUG-008 carriers | SUPPORTED | [#validate-tp-b009-005](#validate-tp-b009-005) |
| `TP-B009-006` browser regression | SUPPORTED | [#validate-tp-b009-006](#validate-tp-b009-006) |
| `TP-B009-008` canonical selftest | SUPPORTED WITH MOVED TOTAL | [#validate-tp-b009-008](#validate-tp-b009-008) — 3429/3429, was 3426 |
| `TP-B009-009` regression-quality guard | SUPPORTED | [#validate-tp-b009-009](#validate-tp-b009-009) |
| `TP-B009-010` installed G028 scanner | SUPPORTED | [#validate-tp-b009-009](#validate-tp-b009-009) |
| `TP-B009-011` packet planning gates | SUPPORTED | [#validate-tp-b009-011](#validate-tp-b009-011) |
| Human acceptance remains unclaimed and human-owned | NOT VALIDATE'S TO CLAIM | untouched by design; no acceptance record was manufactured |
| Build Quality Gate | NOT SATISFIED | state-transition guard exits 1 with G022, G136, G040, G061, G027, G053 |

Sixteen items are supported by commands executed in this session. One is a
persistent historical record that cannot be re-executed post-fix without
inverting its meaning. One is human-owned and was deliberately left alone. The
Build Quality Gate cannot pass while the guard blocks.

### Completion Statement

The BUG-009 product contract is proved on the current tree: the exact focused
title passes on shipped source and fails through `ERR_ASSERTION` at
`Module._compile` under the exact registry mutation, with the full registry,
every carrier, the browser regression, and the canonical selftest green, and the
delivery confined to two test files.

Certification is nevertheless withheld. `bubbles.validate` will not certify a
`bugfix-fastlane` packet whose `delivery-completion-v1` profile still requires an
`audit` phase that has not run, whose scope file lacks the G136 change-boundary
enumeration, and whose phase vocabulary the installed registry rejects. Status
stays `in_progress`, certification stays `in_progress`, human acceptance stays
unclaimed, and `BUG-009-ROUTE-022` carries the named findings to `bubbles.plan`.

The unrelated 61-entry working-tree transaction was neither staged, reset,
stashed, nor reverted, and nothing was pushed.

## Plan Phase — BUG-009-ROUTE-022 Reconciliation {#plan-route-022-reconciliation}

`bubbles.plan` consumed `BUG-009-ROUTE-022` and cleared every block it was
routed. It did not touch the three residual gates that belong to other owners.

### Repository Binding

**Exit Code:** 0
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/repository-binding.sh validate-packet \
    --session-id vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05 \
    --session-control-file <session-control-file> \
    --packet-file <inherited-packet>
REPOSITORY PACKET VALID actionable=true repository=research-lab
  root=<repo-root>
  decision=rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:1 revision=1
```

The inherited packet validated against authoritative session control at
revision 1 before any repository-local read or write.

### Baseline And Result

**Exit Code:** 1 (both runs; the residual gates are not plan-owned)
**Claim Source:** executed

| Run | `failureCount` | `failedGateIds` | Output sha256 |
| --- | --- | --- | --- |
| Baseline, before this pass | 15 | `G061, G022, G027, G040, G136` | `8e9cd0b249b397ff0a09862c84359384464ab8ae1d87f6fe9c3312ec80b20137` |
| After the plan-owned repairs | 10 | `G022, G027, G136` | `637515329302319d4c4a5b5dd3e574457bda8f8bb55065b40e35ddb49e785b7c` |

Both runs are `bash .github/bubbles/scripts/state-transition-guard.sh` against
this packet, recorded through `evidence-capture.sh`, so each hash is
re-derivable with `--verify`. `G061` and `G040` moved into `passedGateIds`.

### Check 8D — Change Boundary Containment

Two blocks were open: the mandated change-boundary DoD item was absent, and the
scope did not enumerate allowed and excluded surfaces. The real boundary was
read from the implementation commit rather than assumed.

**Command:** `git show --numstat --format='%H %s' 4824edc81`
**Exit Code:** 0
**Claim Source:** executed

```text
4824edc81b0920b40e728f55b8e8dfdbe1804b2d test(BUG-009): assert named risk exclusions

29      0       tests/portfolio-risk.functional.mjs
1       1       tests/portfolio-test-integrity.unit.mjs
```

`scopes.md` now carries an **Allowed file families** table naming exactly those
two paths and an **Excluded surfaces** table naming the product source, the
injector, the seven non-`title` fields of `F008-RISK-INPUT-001`, the other 17
registry entries, all parent Feature 008 artifacts, the BUG-007 and BUG-008
packets, every path in the concurrent working-tree transaction, and
`.github/bubbles/**`. The boundary was written to match the verified commit; it
was not widened to make a check pass. The mandated DoD item is present and
checked against the command above.

### Gate G061 — Internal Route Schema

The guard admits an `open` route when it carries `routedTo`, one of
`routedToCommit` / `routedToSpec` / `routedToTicket`, and `productAction`
equal to `none`. Its cross-repo boolean is required only when the route
*looks external* — that is, when it carries a commit, a ticket URL, a
`routedToSpec` naming a different spec, or a routing class matching
`upstream|external`:

```text
looks_external = routed_commit
                 or routed_ticket
                 or (routed_spec and not same_spec_route)
                 or re.search(r"upstream|external", routing_class, re.I)
if looks_external and not cross_repo:
    problems.append("routed externally but crossRepoFollowUp is not true")
```

`BUG-009-ROUTE-023` therefore satisfies the schema truthfully: `routedTo` names
`bubbles.audit`, `routedToSpec` names this same guarded spec, `productAction`
is `none`, and no commit or ticket is present. `same_spec_route` is true, so
`looks_external` is false and no cross-repo referral is fabricated. Validate's
earlier reading — that the guard demands an external URL and the cross-repo
flag on every open route — was inaccurate; the guard demands them only on the
external branch. That correction is what made a truthful repair possible.

### Gate G040 — Adjudication, Not Laundering

Two hits were present. Both were adjudicated as false positives in substance:

| Line | Text class | Adjudication |
| --- | --- | --- |
| `report.md:573` | `**Phase:**` label on a historical `TP-B009-008` evidence-block header | A phase label. It promises nothing and hides no obligation. |
| The validate findings table | Prose quoting a guard schema field name while describing the G061 mismatch | An identifier, not an admission of unfinished work. |

Neither hit was reworded. The framework's own opt-in
`<!-- bubbles:g040-skip-begin -->` / `<!-- bubbles:g040-skip-end -->` markers
bound exactly those two regions, leaving every evidence word byte-identical and
the exemption visible in the file. The broader `certifying-window-begin` marker
was **not** used: it would have exempted all 4,413 prior lines, and a blanket
exemption is a worse answer than a scoped one. Post-marker enforcement stays
strict, and the scan now reports zero net hits across every packet artifact.

The second hit exposes a framework gap rather than a packet defect. The
exclusion list already exempts four camelCase route identifiers of the same
class but omits the guard's own cross-repo field, so any artifact that
describes the G061 schema in prose trips the scanner on an identifier. That gap
is recorded in `state.json.unresolvedFindings` as
`B009-FRAMEWORK-G040-EXCLUSION-001`.

### DoD Adjudication Applied

`scopes.md` moved from 0 of 18 checked to 16 of 19. The nineteenth item is the
mandated change-boundary item added by this pass. Every tick carries an inline
evidence reference to a command executed against the current tree, and
`artifact-lint.sh` confirms it:

**Command:** `bash .github/bubbles/scripts/artifact-lint.sh <packet>`
**Exit Code:** 0
**Claim Source:** executed

```text
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

Three items stay unchecked, each for a stated reason: `TP-B009-000` is a
persistent pre-fix historical record that cannot be re-executed post-fix
without inverting its meaning, so no fresh run is claimed; human acceptance is
human-owned and `uservalidation.md` is untouched; and the Build Quality Gate
requires validate-owned transition checks that still exit 1.

Validate's summary prose counted sixteen supported items while its own table
shows fifteen plus the historical record. This pass checked the fifteen the
table supports, plus the new change-boundary item, for sixteen of nineteen.

### Residual Gates Not Owned By Plan

| Gate | Finding | Disposition |
| --- | --- | --- |
| G022 Check 6B | Phase `plan` is absent from the phase registry | `B009-FRAMEWORK-PHASE-REGISTRY-001`. Both the installed registry and canonical bubbles at `2086d1e` list the same 30 phases, and neither registers `plan` or `design`. A canonical framework gap, not install staleness. `.github/bubbles/**` was not edited. |
| G022 Check 6 | Required phases `implement` and `audit` absent | `B009-PHASE-IMPLEMENT-001` and `BUG-009-ROUTE-023`. Delivery landed under the `test` phase; no `implement` record was fabricated. `bubbles.audit` has never run and is the next owner. |
| G027 / Check 15 and Check 5 | `completedScopes` empty while Scope 1 is In Progress | Resolves only when the scope legitimately completes downstream. Neither was forced. |
| G136 | Human acceptance terminal gate | Human-owned. No acceptance record was manufactured. |

### Containment

No product source or test byte changed. `.github/bubbles/**` was not edited.
The concurrent 61-entry unrelated working-tree transaction was neither staged,
reset, stashed, checked out, nor reverted. `uservalidation.md` is untouched.
Status stays `in_progress`, certification stays `in_progress`, Scope 1 stays In
Progress, `completedScopes` stays empty, and nothing was pushed.

## Audit Phase — BUG-009-ROUTE-023 Final Audit {#audit-route-023}

`bubbles.audit` consumed `BUG-009-ROUTE-023`. This is the first time the
`audit` phase has run for this packet. Every number below was produced by a
command executed in this audit session; nothing is restated from an upstream
phase. Real filesystem paths are written as `<repo-root>` on purpose — see the
CRITICAL finding in the security subsection for why that discipline matters.

**Resolved contract.** `transition-contract-resolver.sh` returned
`workflowMode: bugfix-fastlane`, `auditProfile: delivery-completion-v1`,
`statusCeiling: done`, `targetStatus: done`,
`contractDigest: sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f`,
`targetRevision: sha256:0329f35339de9d65d678aa673db37b2a940efc23c52cc9a7e68ee90c56ab1ee1`.
The delivery-completion vocabulary therefore applies, so this section issues a
shipment verdict rather than a planning verdict.

### Repository Binding

**Exit Code:** 0
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/repository-binding.sh preflight \
    --session-id vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05 \
    --session-control-file <session-control-file> \
    --request-class STRUCTURED --workspace-root <11 host-declared roots> \
    --repository-root <repo-root> --expected-control-revision 1
REPOSITORY PREFLIGHT CONFIRMED repository=research-lab root=<repo-root>
  source=explicit-repositoryRoot affinity=confirmed
PREFLIGHT_COMMITTED decision=rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:2
  revision=2 repository=research-lab
```

### Change Boundary — CLEAN

**Exit Code:** 0
**Claim Source:** executed

```text
$ git show --stat --oneline 4824edc81
4824edc81 test(BUG-009): assert named risk exclusions
 tests/portfolio-risk.functional.mjs     | 29 +++++++++++++++++++++++++++++
 tests/portfolio-test-integrity.unit.mjs |  2 +-
 2 files changed, 30 insertions(+), 1 deletion(-)

$ git status --porcelain -- tests/portfolio-risk.functional.mjs \
    tests/portfolio-test-integrity.unit.mjs \
    tests/portfolio-defect-injector.cjs rlportfolioanalytics.js
(no output)
```

The delivery is exactly the two declared test files. Product source
`rlportfolioanalytics.js` and the shared harness
`tests/portfolio-defect-injector.cjs` carry no change, and the whole BUG-009
surface is byte-identical to `HEAD`. The declared two-file test-only boundary
is confirmed by execution, not by assertion.

### Assertion-Origin Causality — PROVEN LOAD-BEARING

This is the substantive audit question: does the repaired registry title prove
*exact* assertion-origin causality, or does it merely happen to fail? I ran the
`F008-RISK-INPUT-001` mutation twice against the same product mutation — once
against the post-fix title, once against the pre-fix title as an adversarial
control. The control is what converts this from a structural check into proof.

**Exit Code:** 1 (both mutant runs — a mutant that exits 0 would be the defect)
**Claim Source:** executed

```text
$ grep -Fc '      else excluded.push({ symbol: h.symbol, ... });' rlportfolioanalytics.js
1

[A] post-fix title, mutation applied in memory
# Subtest: BUG-009 risk mapping: unsupported holdings remain named exclusions
not ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  operator: 'strictEqual'
  expected: 'ok'
  actual: 'unsupported-holding'
  stack: TestContext.<anonymous>
    (file://<repo-root>/tests/portfolio-risk.functional.mjs:60:10)
# pass 0
# fail 1
marker: applied module=rlportfolioanalytics.js via=Module._compile bytes=311532

[B] ADVERSARIAL CONTROL — same mutation, pre-fix title SCN-008-047
not ok 1 - SCN-008-047 mixed portfolio freezes one cutoff and composes partial
  structured risk output
  error: "Cannot read properties of undefined (reading 'state')"
  code: 'ERR_TEST_FAILURE'
  name: 'TypeError'
  stack: TestContext.<anonymous>
    (file://<repo-root>/tests/portfolio-risk.functional.mjs:123:54)
# pass 0
# fail 1
marker: applied module=rlportfolioanalytics.js via=Module._compile bytes=311532
```

Both titles fail, so a naive "did it go red?" check could not tell them apart —
and that is precisely how the original defect survived. They fail for different
reasons. The pre-fix title dies at line 123 with a `TypeError` from reading
`.state` off an `undefined` downstream value: an incidental crash caused by
consuming a malformed return, not a protective assertion. The post-fix title
dies at line 60 with `ERR_ASSERTION`, `operator: strictEqual`,
`actual 'unsupported-holding'` against `expected 'ok'` — the mutation's exact
semantic effect, named by the assertion that exists to reject it.

`mutationCausalityProblems()` in `tests/portfolio-test-integrity.unit.mjs:347`
requires `code: 'ERR_ASSERTION'`, exactly one applied substitution, the exact
module, the exact intended hook, exactly one resolved test, and
`exit != 0 && pass == 0 && fail == 1`. Run [B] satisfies none of the assertion
clause. The repair is therefore load-bearing rather than cosmetic: the pre-fix
mapping would now be rejected by the very harness it was registered in.

**Not a tautology.** The new test carries eight assertions over real
`RLPA.assetTreatment` output — `state`, `marketBased`,
`excludedFromMarketAnalytics` (asserting the named `symbol`/`assetType` pair),
and five `lookThrough` fields including `coveredWeight 0.6` /
`uncoveredWeight 0.4`. No stub, fake, canned literal, or proxy assertion
appears; the values are computed by shipped product code.

### Shipped Green And Harness Integrity

**Exit Code:** 0 (all three)
**Claim Source:** executed

```text
[C] focused BUG-009 test, unmutated tree
ok 1 - BUG-009 risk mapping: unsupported holdings remain named exclusions
# pass 1
# fail 0

[D] full risk carrier tests/portfolio-risk.functional.mjs
# tests 3
# pass 3
# fail 0

[F] strict registry tests/portfolio-test-integrity.unit.mjs
ok 1 - Adversarial: SCN-008-054 every audited Feature 008 defect class remains
       load-bearing
ok 2 - BUG-007: caller-key protections and normal ordering are load-bearing in
       memory
ok 3 - BUG-007: represented mutants execute one protective assertion through one
       intended hook
# tests 3
# pass 3
# fail 0
```

The in-memory mutation wrote nothing: after four mutant executions the dirty
count was still 61 and `rlportfolioanalytics.js` was still clean.

### Security — CRITICAL FINDING `B009-AUDIT-PII-001`

**Exit Code:** 1
**Claim Source:** executed

```text
$ node scripts/pii-scan.mjs
[pii-scan] specs/008-portfolio-survival-and-brief-lab/bugs/
  BUG-009-risk-mutation-assertion-origin/report.md:4435:8
  rule=home-path length=13
[pii-scan] files=10332 messages=2334 findings=1 FAIL

$ git blame -L 4435,4435 -- <packet>/report.md
58a8089caa (pkirsanov 2026-08-27 4435)   root=<a real 13-character home path>

$ git show 6e9f574a8 --stat --oneline
6e9f574a8 security(BUG-009): redact real home path from captured evidence
 .../BUG-009-risk-mutation-assertion-origin/report.md | 2 +-

occurrences of the identifier in this report.md, by commit:
  6e9f574a8 -> 0
  58a8089ca -> 1
```

A real operator home path is committed on the repository surface at
`report.md:4435`, inside the `## Plan Phase — BUG-009-ROUTE-022 Reconciliation`
evidence block. It is the **only** finding in a 10,332-file / 2,334-message
scan, and it is a **regression of an already-remediated defect**: commit
`6e9f574a8` drove the count to zero, and the plan-phase commit `58a8089ca`
reintroduced it one commit later while transcribing a binding transcript by
hand.

The line is inside a plain fenced block, not an `evidence-capture.sh` block, so
no recorded `sha256` covers it and a redaction to `<repo-root>` would preserve
the evidence semantics exactly. Audit did not perform that redaction: the block
belongs to `bubbles.plan`, not to audit, and rewriting another owner's evidence
is a foreign-artifact change. It is routed instead.

No credential, token, key, or secret was found. The mutation injector is a
trusted in-repo test harness and was not treated as an untrusted-input
boundary.

### Canonical Validation — RED

**Exit Code:** 1
**Claim Source:** executed

```text
$ node scripts/selftest.mjs
  ✗ FAIL: committed surface carries no personal identifier
================================================
Research-Lab self-test: 3428 passed, 1 failed
================================================
lines: 3903
sha256: f49a315df3adddba26ee4e63e2cf48163cf9663f5ef2432bcebea3b60c8cdc4e
```

`scripts/selftest.mjs:2688` asserts the PII scan result, so the finding above
is not advisory — it turns the repository's only canonical validation command
red. The packet's standing narrative describes "the canonical selftest green",
which was true when `bubbles.validate` measured it and is **not true of the
current tree**. This is a real regression introduced after that measurement by
`58a8089ca`, not a fabricated claim by `bubbles.validate`; the distinction is
recorded deliberately so the routed fix targets the right commit.

### Implement-Phase Adjudication `B009-PHASE-IMPLEMENT-001`

The resolved `bugfix-fastlane` `phaseOrder` is `select, bootstrap, implement,
test, regression, simplify, gaps, harden, stabilize, devops, security, validate,
audit, finalize`. `implement` is required and is absent from
`execution.completedPhaseClaims`.

Audit's adjudication: the `implement` phase **did occur**. Commit `4824edc81`
is a real, non-empty delivery (2 files, +30/-1) that produced the entire fix,
and `bugfix-fastlane` provides no separate phase for a test-only change — the
mode's `test` phase is claimed alongside it and is a different phase. The
omission is therefore a **recording gap, not a work gap**.

Audit did **not** write the claim. `execution.completedPhaseClaims` is a phase
record, and this agent is forbidden from writing phase claims or certification
state; inventing one to clear a check is exactly the fabrication this phase
exists to catch. The recording is routed to the owner instead. No phase claim
was fabricated.

### Guard Baseline Observed By Audit

**Exit Code:** 1
**Claim Source:** executed

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh <packet> \
    --target-status done --expect-workflow-mode bugfix-fastlane \
    --expect-contract-digest sha256:aa91472c...c449f
applicableCheckClasses: [universal,mode-required,delivery-completion]
passedGateIds: [G057,G061,G053,G040,G051,G068,G082,G083,G084,G128,G085,G086,
  G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G027,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 10
verdict: FAIL
sha256: c6fb0cfb2253c25725ec4f6d3b9c72ac662d1e273642c49cd09abc4eee2691da
```

Audit measured `failureCount: 10`, not the 11 carried in the inbound routing
note. The contract digest and workflow mode assertions were accepted, so this
is a genuine count difference rather than a provenance conflict; the smaller
number is reported as measured rather than reconciled to the expectation.

### Audit Verdict — DO_NOT_SHIP

The engineering substance of BUG-009 is sound and, on the evidence above,
better than the packet claimed for itself: the boundary is exactly two test
files, the new test asserts real computed behavior, and the adversarial control
proves the repaired mapping is load-bearing rather than incidental. Had the
security scan been clean this would have been a straightforward advance.

It is not clean. A real personal identifier sits on the committed surface and
the repository's canonical validation command exits 1 because of it. A packet
cannot ship while its own artifact is the single blocking PII finding in the
repository, and it cannot ship on a claim of green validation that the current
tree contradicts. The verdict is therefore `DO_NOT_SHIP`, driven entirely by
`B009-AUDIT-PII-001` and not by any defect in the delivered test repair.

| Finding | Severity | Owner | Action |
| --- | --- | --- | --- |
| `B009-AUDIT-PII-001` | CRITICAL | `bubbles.plan` | Redact the identifier at `report.md:4435` to `<repo-root>`; re-run `node scripts/pii-scan.mjs` to 0 findings and `node scripts/selftest.mjs` to green |
| `B009-PHASE-IMPLEMENT-001` | HIGH | `bubbles.plan` | Record the real `implement` phase for commit `4824edc81`; do not invent scope or evidence |
| `B009-FRAMEWORK-PHASE-REGISTRY-001` | UNRESOLVED | parent / framework | `plan` and `design` are unregistered in canonical bubbles `2086d1e`; `.github/bubbles/**` is framework-managed and was not edited |
| G136 human acceptance | UNRESOLVED | human | Untouched by audit; no acceptance record manufactured |
| G027 `completedScopes` / Scope 1 In Progress | UNRESOLVED | downstream | Resolves only on legitimate completion; not forced |

### Spot-Check Recommendations

Automation gets more convincing as it gets more confident, so these are the
items worth re-checking by hand rather than trusting this report:

1. **The PII line itself.** Open `report.md:4435` and confirm the identifier is
   really there and really is a home path. Everything in the verdict rests on
   this one line, and the scanner withholds the matched text by design.
2. **The adversarial control [B].** Re-run the pre-fix-title mutant and confirm
   it fails with `TypeError` rather than `ERR_ASSERTION`. If both titles failed
   the same way, the BUG-009 repair would be cosmetic and this report's central
   conclusion would be wrong.
3. **The selftest delta.** The count moved `3426 -> 3429 -> 3428 passed` across
   this session because a concurrent merge changed `scripts/selftest.mjs`.
   Confirm the single failure is the PII assertion and not a second, masked
   regression riding in on that merge.
4. **The implement-phase adjudication.** This is audit's judgement, not a
   measurement: confirm you agree that `4824edc81` constitutes the `implement`
   phase for a test-only `bugfix-fastlane` delivery before anyone records it.
5. **Scope 1 and the 3 unchecked DoD rows.** They remain open by intent.
   Confirm none was quietly advanced.

### Containment

Audit changed two paths, both audit-owned: this `report.md` section and the
additive `execution.audit` record in `state.json`. No product source, no test,
no `scopes.md` DoD row, no scope status, no `completedScopes`, no
`completedPhaseClaims`, no `certification.*`, and no top-level status was
written. `uservalidation.md` was not read into a claim and not modified.
`.github/bubbles/**` was not edited. The concurrent 61-entry unrelated
working-tree transaction was neither staged, reset, stashed, checked out, nor
reverted. Nothing was pushed.

## Audit Addendum — `B009-AUDIT-PII-001` Remediated, Verdict Re-Derived {#audit-addendum-pii-remediated}

The section above was written and staged while the finding was live. It is no
longer true of the tree, so it is corrected here rather than left standing — a
stale claim is the exact defect this audit raised against the packet, and audit
does not get an exemption from its own finding. The original section is left
intact as the record of what was observed; this addendum supersedes its verdict.

**Exit Code:** 0 (all three)
**Claim Source:** executed

```text
$ sed -n 4435p report.md
  root=<repo-root>

$ node scripts/pii-scan.mjs
[pii-scan] files=10332 messages=2335 findings=0 OK

$ node scripts/selftest.mjs
Research-Lab self-test: 3429 passed, 0 failed
lines: 3898
sha256: a5e2f8a910a0587c973fe8d5bb953337213aba89c59fc53adfdfafb8f5c6d50f
```

While this audit was persisting its evidence, concurrent commit `ddd1a22c7`
applied exactly the redaction this audit specified — `root=<repo-root>`, the
same placeholder form `6e9f574a8` used. The repository-wide PII scan is clean
and the canonical selftest is green at `3429 passed, 0 failed`.
`B009-AUDIT-PII-001` is therefore **RESOLVED**, and the packet's claim of a
green canonical selftest is true again.

Two disclosures, because both are the kind of thing a reader would want to have
been told rather than discover:

**This audit's commit was absorbed.** `ddd1a22c7` also swept this audit's two
staged packet files into its own commit before this agent's `git commit` ran,
so `report.md` and `state.json` are committed under a foreign commit message
rather than an audit-authored one. `git commit` consequently created nothing.
No history was rewritten to correct that, because rewriting a concurrent
session's commit is more dangerous than the cosmetic problem it would fix.

**The working tree carried a 62nd entry, not 61.** `.specify/memory/open-work.md`
was modified at `17:36:29Z`, inside this audit's window. None of the commands
this audit ran authors that file — the scripts that write it (`open-work-report.sh`,
`closeout-report.sh`, `cli.sh`, `framework-validate.sh`) were never invoked here
— so it belongs to the concurrent session. It was not staged, reset, stashed, or
reverted by audit, and `ddd1a22c7` has since committed it.

### Re-Derived Guard Result

**Exit Code:** 1
**Claim Source:** executed

```text
failedGateIds: [G022,G027,G136]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 10
verdict: FAIL
sha256: c2e76e2fcf7165d26763200e9567829c709b137959bafe4978ada4ca25c4b165
```

The count is unchanged at 10. Recording `execution.audit` does **not** satisfy
the audit-phase requirement on its own: the guard reads
`completedPhaseClaims` and `certifiedCompletedPhases`, and this agent is
forbidden from writing either. So the audit phase genuinely executed and is
genuinely evidenced, while its *claim* remains unrecorded — the same shape as
the `implement` finding, and routed the same way rather than self-recorded.

### Re-Derived Verdict — REWORK_REQUIRED

`DO_NOT_SHIP` is withdrawn. It rested entirely on `B009-AUDIT-PII-001`, which is
resolved. No critical defect, no security defect, and no evidence-integrity
defect remains, and the delivered test repair passed every audit check on its
own merits.

`SHIP_IT` is not available either: the guard still refuses at `failureCount 10`.
What remains is recording and ownership, not engineering —
`B009-PHASE-IMPLEMENT-001` plus the unrecorded audit-phase claim (both routed in
`BUG-009-ROUTE-024`), the framework phase-registry gap, human acceptance, and
the scope completion that resolves only downstream. Hence `REWORK_REQUIRED`.

| Finding | Severity | State | Owner |
| --- | --- | --- | --- |
| `B009-AUDIT-PII-001` | CRITICAL | **RESOLVED** by `ddd1a22c7`; verified by pii-scan 0 findings and selftest 3429/0 | — |
| `B009-PHASE-IMPLEMENT-001` | HIGH | UNRESOLVED — routed in `BUG-009-ROUTE-024` | `bubbles.plan` |
| audit-phase claim unrecorded | HIGH | UNRESOLVED — audit may not write phase claims | `bubbles.plan` |
| `B009-FRAMEWORK-PHASE-REGISTRY-001` | MEDIUM | UNRESOLVED — canonical framework gap | parent / framework |
| `B009-FRAMEWORK-G040-EXCLUSION-001` | LOW | UNRESOLVED — canonical framework gap | parent / framework |
| G136 human acceptance | — | UNRESOLVED — untouched, nothing manufactured | human |
| G027 `completedScopes` / Scope 1 | — | UNRESOLVED — not forced | downstream |

Spot-check item 1 in the section above ("open `report.md:4435` and confirm the
identifier is really there") is now obsolete — confirm instead that it reads
`root=<repo-root>`. Items 2 through 5 stand unchanged.

---

## Plan Phase — BUG-009-ROUTE-024 Phase-Record Repair {#plan-route-024-phase-record-repair}

**Owner:** `bubbles.plan` · **Route consumed:** `BUG-009-ROUTE-024` (from `bubbles.audit`)
**Repository binding:** preflight `PREFLIGHT_COMMITTED`, decision `rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:3`, control revision 3, `root=<repo-root>`, exit 0.

This section records a **semantics judgement**, not a measurement. It is written
so the decision is auditable and reversible by whoever disagrees.

### Measured effect

| Measurement | Before | After |
| --- | --- | --- |
| `state-transition-guard.sh` `failureCount` | 10 | **7** |
| `failedGateIds` | `G022, G027, G136` | `G022, G027, G136` |
| Guard exit code | 1 | 1 |
| `node scripts/pii-scan.mjs` | — | exit 0 — `files=10332 messages=2336 findings=0 OK` |
| `node scripts/selftest.mjs` | — | exit 0 — `Research-Lab self-test: 3429 passed, 0 failed` |

Three blocks cleared: the missing `audit` phase, the unregistered `plan` phase
claim, and the phase-owner-contract rollup. `failedGateIds` is unchanged because
G022 still carries the `implement` pair (see the refusal below).

### (a) `implement` — DECLINED, and why the stated rationale was wrong

The route asked for the `implement` phase to be recorded, citing `4824edc81`,
on the rationale that *"`bugfix-fastlane` has no separate test-only phase, so
that commit **is** the implement phase."*

**That rationale is false, and this pass falsified it rather than repeating it.**
The guard's own Check 6 for this mode requires `implement` **and** `test` as two
distinct phases; `test` already PASSES; and the packet carries distinct
test-phase commits `50a541600` and `40ae3fdf6` alongside `4824edc81`.

The underlying *claim* nevertheless survives independent scrutiny: the packet's
own devops, security, validate and audit phases each call `4824edc81` the
implementation commit, at `report.md` lines 888, 1019, 1240, 2855, 3552 and 3619.
So the work is real. The reason offered for it was not.

The claim was still **not recorded**, because recording it would require
provenance that cannot be supplied honestly. `state-transition-guard.sh` Check 6B
accepts `implement` provenance from exactly two sources:

1. `bubbles.implement` — the registry-declared owner (`workflows.yaml`
   `phases.implement.owner`). It appears in **0 of 22** `executionHistory`
   entries and authored no commit in this packet's log.
2. `bubbles.bug` — a hardcoded delegation shortcut at
   `state-transition-guard.sh:2183`. Both `bubbles.bug` entries record
   `phasesExecuted: ["bug"]`; neither authored the delivery.

`executionHistory` entry 3 records who actually did it: **`bubbles.test`**, with
`action: "implemented-and-verified-recorded-test-contracts"`. For a test-only
defect the implementation and the test are the same artifact — `4824edc81`
changes no production file — so the registry's `implement` owner set has no
honest member.

Writing a `bubbles.implement` entry that never ran, or grafting `implement` onto
a `bubbles.bug` entry that did not author it, is precisely the **phantom owner**
Check 6B refuses to synthesize. Parent confirmation cannot authorize fabricating
an execution record. The honest resolution is a framework change to the
`implement` owner set or its delegation shortcut — for example admitting
`bubbles.test` for test-only defects — which cannot be made here because
`.github/bubbles/**` is framework-managed. Escalated as
`B009-PHASE-IMPLEMENT-001` in `BUG-009-ROUTE-025`.

### (b) `audit` — RECORDED

`bubbles.audit` genuinely executed this session. Verified with
`git show --stat 9f5f266eb`: *"audit(BUG-009): addendum — PII finding resolved,
verdict re-derived to REWORK_REQUIRED"*, `report.md +96`, `state.json +43/-3`.
Audit disclosed that its own `execution.audit` write could not move the guard,
because Check 6/6B read `completedPhaseClaims` / `certifiedCompletedPhases`,
which audit may not write.

`audit` was added to `completedPhaseClaims` and a matching `executionHistory`
entry recorded with `9f5f266eb` as evidence. The entry carries an explicit
`recordedBy: bubbles.plan` disclosure: the phase execution is real and SHA-backed,
but the act of recording it is this agent's, not audit's. Check 6B now reports
`Phase 'audit' has specialist provenance from bubbles.audit`.

### (c) `plan` — REMOVED from `completedPhaseClaims`, provenance preserved in full

**This pass agrees with the parent's reading.** Grounds, each verified here by
direct read rather than inherited:

1. `workflows.yaml` `phases:` registers **30** phases. Neither `plan` nor
   `design` is among them.
2. The same file separates two different concepts:
   `modeTemplates.planningChainAgents` = `[bubbles.analyst, bubbles.ux,
   bubbles.design, bubbles.plan]` (line 80) versus
   `modeTemplates.findingDeliveryPhases` = `[implement, test, validate, audit,
   docs, finalize]` (line 109). `plan` appears as a planning-chain **agent**,
   never as a delivery **phase**.
3. Corroboration the route did not cite: the guard's Check 6 required-phase list
   for this mode is `implement, test, regression, simplify, stabilize, security,
   validate, audit`. `plan` is not a required delivery phase.

On the `modelFloor` objection — `design: sonnet-class` / `plan: sonnet-class` at
lines 782-783 — that table selects a **model tier by agent name**. The guard
never reads `modelFloor` for phase ownership. The apparent self-contradiction is
cosmetic and does not make `plan` a delivery phase.

`completedPhaseClaims` is therefore a record of **delivery phases**, and
`plan`'s presence in it was a **category error in the packet**, fixable here
without touching the framework.

**Nothing was erased.** All six `bubbles.plan` `executionHistory` entries are
preserved byte-for-byte; a seventh was appended for this pass. Removing a phase
*claim* is a classification fix; erasing execution provenance would be
falsification, and none occurred. The reasoning is also persisted in-band at
`state.json` → `execution.completedPhaseClaimsAdjudication` so it survives
independently of this report.

**If a future owner disagrees** and concludes `plan` genuinely belongs in
`completedPhaseClaims`, the correct remedy is to register `plan` and `design` in
the framework `phases:` block with declared owners — not to re-add an
unregistered claim. `B009-FRAMEWORK-PHASE-REGISTRY-001` remains open for that.

### Remaining 7 blockers, and who owns them

| # | Block | Gate | Owner |
| --- | --- | --- | --- |
| 1 | 3 unchecked DoD items | — | mixed: human + framework |
| 2 | Scope 1 still `In Progress` | — | downstream of 1 |
| 3 | `implement` not in phase records | G022 | **framework** — owner-set gap |
| 4 | 1 specialist phase missing (rollup of 3) | G022 | framework |
| 5 | `completedScopes` is empty | G027 | downstream of 1–2 |
| 6 | Zero scopes marked `Done` | G027 | downstream of 1–2 |
| 7 | Human acceptance not established | G136 | **human** |

### What this pass did not touch

`uservalidation.md` is **byte-identical** — 0 of 6 items checked, no acceptance
record manufactured. The three unchecked DoD items in `scopes.md` are unchanged;
the Build Quality Gate legitimately remains unchecked because the guard still
exits 1. `completedScopes`, Scope 1 status, `status`, `certification.status` and
`certifiedAt` are unchanged. No product source or test byte changed.
`.github/bubbles/**` was not edited. The concurrent 61-entry unrelated
working-tree transaction was neither staged, reset, stashed nor reverted.
Nothing was pushed.

## Implement Phase — Owner-Level Refusal To Record (BUG-009-ROUTE-025) {#implement-route-025-owner-refusal}

**Claim Source:** executed

`bubbles.implement` — the registry-declared owner of the `implement` phase — was
dispatched to record that phase, with the parent's explicit confirmation and an
explicit instruction to verify `4824edc81` first and to report rather than record
if observation contradicted the premise. Observation contradicted the premise.
**No `implement` claim was written.** `state.json` is byte-identical after this
pass; only this section was added.

This is the second refusal on this route. The first came from `bubbles.plan`
(a non-owner) in `755044b65`. This one comes from the owner itself, which is the
stronger form: the agent that alone can legitimately supply `implement`
provenance states that it cannot, because it did not execute the delivery.

### Premise-by-premise verification

| # | Parent's premise | Verdict | Command run this session |
| --- | --- | --- | --- |
| A | `4824edc81` is a real delivery of exactly two files, +30/−1 | **CONFIRMED** | `git show --stat 4824edc81` |
| B | `bugfix-fastlane` has no separate test-only phase, so that commit *is* the implement phase | **FALSIFIED** | read `modes.yaml` line 304 |
| C | The gap is a recording gap, safe to record | **FALSIFIED** | read guard lines 2172–2185; enumerated `executionHistory` |
| D | (implied) Recording it clears the block | **FALSIFIED** | `state-transition-guard.sh` baseline |

**A — confirmed.** `git show --stat 4824edc81` (exit 0) returned commit
`4824edc81b0920b40e728f55b8e8dfdbe1804b2d`, `test(BUG-009): assert named risk
exclusions`, Thu Aug 27 01:15:48 2026:

```
 tests/portfolio-risk.functional.mjs     | 29 +++++++++++++++++++++++++++++
 tests/portfolio-test-integrity.unit.mjs |  2 +-
 2 files changed, 30 insertions(+), 1 deletion(-)
```

Exactly the two files and exactly the +30/−1 the parent stated. That the commit
is a real, bounded, test-only delivery is not in dispute.

**B — falsified.** The premise that licenses treating a `test(...)` commit as the
`implement` phase is that the mode collapses the two. It does not.
`.github/bubbles/workflows/modes.yaml` line 304 declares:

```
phaseOrder: [ select, bootstrap, implement, test, regression, simplify, gaps,
              harden, stabilize, devops, security, validate, audit, finalize ]
```

`implement` and `test` are two distinct ordered phases. The `test` phase already
PASSES on this packet under its own provenance. So the missing phase is not a
label for work that was done under another name — the two names are separately
required, and only one of them was executed.

**C — falsified, and this is the decisive one.** The guard does not accept an
`implement` claim from any agent. `state-transition-guard.sh` Pass 1
(lines 2172–2181) matches a claimed phase against an owner **set**, and line 2183
adds one hardcoded exception:

```
# bubbles.bug delegation shortcut for implement/test
elif [[ "$claimed_phase" == "implement" || "$claimed_phase" == "test" ]] && ... $1=="bubbles.bug" ...
```

So `implement` provenance is admissible only from `bubbles.implement` or
`bubbles.bug`. Neither executed this delivery. Enumerating all 24
`executionHistory` entries returned **zero** entries with `phase == "implement"`
or `implement` in `phasesExecuted`. The sole entry covering the work is index 3:

```
{ "agent": "bubbles.test", "phase": "test",
  "action": "implemented-and-verified-recorded-test-contracts",
  "phasesExecuted": ["test"], "provenanceMode": "specialist" }
```

`bubbles.test` did the work, under the `test` phase, and the commit is prefixed
`test(BUG-009)`. For `bubbles.implement` to write an entry claiming it executed
`4824edc81` would be a false statement about authorship: that commit predates
this dispatch by roughly seventeen hours and was produced by a different phase.

The requested write is not merely inaccurate, it is self-defeating. Because Pass 1
keys on `agent` ∈ owner-set together with `phase == "implement"` and
`provenanceMode` `specialist`-or-absent, the entry described in the dispatch is
*precisely* the shape that flips the check to PASS. It would not surface the gap
to the guard; it would conceal it. That is the phantom owner Check 6B exists to
refuse, and the refusal is worth more than the green check.

**D — falsified.** Recording would not clear the block. Two of the seven
baseline failures are Gate G027, which already fires *because* the packet claims
implement/test phases while no scope is Done:

```
🔴 BLOCK: Execution/certification phases claim implement/test phases but completedScopes is EMPTY — FABRICATION (Gate G027)
🔴 BLOCK: Execution/certification phases claim implement/test phases but ZERO scopes are marked 'Done' — FABRICATION (Gate G027)
```

Adding an `implement` claim *reinforces* the antecedent of both. The best case
was 7 → 5, purchased with a fabricated provenance record, while the three
human-gated failures (unchecked DoD, scope status, G136 acceptance) are
untouchable by this agent by construction.

### Guard result — unchanged, by design

`state-transition-guard.sh` was run against this packet before the edit:
**7 failures, 2 warnings, exit 1**, `blockingCode: DELIVERY_COMPLETION_FAILED`.
Because this pass changed only `report.md`, the count is unchanged at **7**. No
failure was cleared and none was introduced. The seven remain as tabulated in the
preceding ROUTE-024 section.

### The actual defect

The framework's `implement` owner-set has no member for a defect whose entire
correct remedy is a test-contract change. `bugfix-fastlane` requires `implement`
unconditionally, but a test-only fix is executed by `bubbles.test`, whose
provenance the owner-set rejects for that phase. The packet is therefore
structurally unable to satisfy Check 6 without either fabricating provenance or
performing product-source work it does not need. This is carried as
`B009-PHASE-IMPLEMENT-001` and is a framework registry decision, not a packet
defect. It is owner-routed; `.github/bubbles/**` is framework-managed and was not
edited.

A sanctioned mechanism may already exist: Pass 2 of the same check accepts
`provenanceMode: "parent-expanded"` with an `expandedBy` in the orchestrator
allowlist and an `expansionReason` of at least 20 characters. That path is for an
orchestrator expanding a phase a specialist covered. `bubbles.implement` is not an
orchestrator and did not take it. Whether it is the right remedy here is the
registry owner's call, not this agent's.

### What this pass did not touch

`state.json` is **byte-identical** — no `completedPhaseClaims` entry added, and
`executionHistory` still holds all 24 entries including all 7 from `bubbles.plan`.
`uservalidation.md` is byte-identical with 0 of 6 items checked. No DoD item was
checked. No product source or test file was modified — not
`rlportfolioanalytics.js`, not `tests/portfolio-defect-injector.cjs`, and not
either of the two files in `4824edc81`. `status`, `certification.status` and
`certifiedAt` are unchanged. `.github/bubbles/**` was not edited. The concurrent
61-entry unrelated working-tree transaction was neither staged, reset, stashed nor
reverted. Nothing was pushed.

## Validate Phase — Phase Stub Adjudication And Certification (BUG-009-ROUTE-025) {#validate-route-025-phase-stub-and-certification}

This section is the destination of an anchor that three artifacts already cited
before it existed. `scopes.md` referenced
`report.md#validate-route-025-phase-stub-and-certification` twice and
`state.json` once at `execution.phaseStubs.implement.evidenceRef`, while the
heading itself resolved to **0** matches. An earlier pass authored the references
and exhausted its budget before authoring the target. Writing the section is the
repair; every figure below is the observed output of a command re-executed in
this certifying session, never a value copied from an earlier pass.

### The `implement` phase is a stub, not a claim

`execution.phaseStubs.implement` records the `implement` phase as a **stub**. It
is deliberately not an entry in `execution.completedPhaseClaims`, and this
section is the adjudication behind that choice.

The premise is that no implementation phase existed to execute. BUG-009's defect
was a test asserting the wrong thing, so the entire remedy is commit
`4824edc81`, which changed exactly two test files and no product source:
`tests/portfolio-risk.functional.mjs` (`+29/-0`) and
`tests/portfolio-test-integrity.unit.mjs` (`+1/-1`), a net `+30/-1` wholly inside
the packet's declared change boundary. For a test-only defect the implementation
and the test are the same artifact; there is no second thing to build.

A `completedPhaseClaims` entry would then be worse than the stub, not better.
Check 6B demands provenance for a claimed phase, and it accepts `implement`
provenance only from `bubbles.implement` — the registry-declared owner — or from
`bubbles.bug` through the hardcoded delegation shortcut. Neither executed this
delivery: `executionHistory` entry 3 records `bubbles.test` with action
`implemented-and-verified-recorded-test-contracts`. Manufacturing a claim would
therefore require writing a `bubbles.implement` entry that never ran, or grafting
`implement` onto a `bubbles.bug` entry that did not author the work. That is
exactly the phantom owner Check 6B exists to refuse.

`bubbles.implement` was dispatched and **refused for that reason**, recording its
refusal at [report.md#implement-route-025-owner-refusal](report.md#implement-route-025-owner-refusal).
The refusal is the correct outcome, and the stub is the sanctioned expression of
it: `state-transition-guard.sh` documents `phaseStubs` as the v4.1.0 mechanism
for a phase that legitimately had nothing to execute, admits a stub into the
merged phase set when its `reason` is a non-empty string, and never demands
provenance for a stub — because a stub is not a claim. Gate G022 is satisfied by
stating the truth rather than by inventing an owner.

The framework observation that produced the impasse is retained as
`B009-PHASE-IMPLEMENT-001`: the `implement` owner set has no honest member for a
defect whose whole correct remedy is a test-contract change. That is a registry
decision carried upstream for the parent orchestrator, not a packet defect.
`.github/bubbles/**` is framework-managed and was not edited by this pass.

### Human acceptance is human-owned and recorded as `external-record`

`uservalidation.md` carries a `## Human Acceptance Record` naming
`acceptedBy: pkirsanov`, `acceptedAt: 2026-08-27`, and `method: external-record`.
Automation transcribed the operator's explicit dated authorization from the
2026-08-27 working session; it did not manufacture acceptance and holds no
acceptance authority of its own, per
`.github/bubbles/registry/acceptance-authority.yaml`.

The method is `external-record` rather than `human-interactive` because that is
what actually happened. The operator approved on the strength of the verification
reported to them and did **not** separately exercise the delivered behavior in a
live session. Their dated session directive *is* the external record; no UAT
ticket, sign-off identifier, or other external artifact exists, and none is
claimed. Gate G136 passes on that authored record.

This certifying pass did not touch the `## Checklist` section or the
`## Human Acceptance Record`. Both are human-owned and were already correct. The
only `uservalidation.md` edit made here is inside the automation-owned
`## Automation Readiness` block, whose fifth item — *"Validate-owned certification
completes"* — was held unchecked precisely until the certification below actually
completed.

### Certification evidence

Four commands, each executed in this session against the packet at its truthful
`in_progress` state:

| Command | Exit Code | Observed |
|---------|-----------|----------|
| `bash .github/bubbles/scripts/state-transition-guard.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin` | 0 | `failureCount: 0`, `verdict: PASS`, `blockingCode: none` |
| `node scripts/selftest.mjs` | 0 | `Research-Lab self-test: 3429 passed, 0 failed` |
| `node scripts/pii-scan.mjs` | 0 | `[pii-scan] files=10332 messages=2342 findings=0 OK` |
| `bash .github/bubbles/scripts/artifact-lint.sh specs/008-portfolio-survival-and-brief-lab/bugs/BUG-009-risk-mutation-assertion-origin` | 0 | `Artifact lint PASSED.` |

The `selftest` run produced 3898 lines; the bounded capture carries
`sha256: 45f9d858c5fdd47b40515a5f2b100f942f972772f184066794f9a90230f9efc3` over
every line produced, re-derivable with `evidence-capture.sh --verify`. Zero
required tests were skipped and no result was satisfied by an infrastructure-error
substitute.

The `pii-scan` message count reads **2342** here against the 2341 recorded in the
preceding pass and 2340 before that. The scanned corpus moves between sessions as
artifacts are authored; `findings` is **0** on all three readings, which is the
figure the gate turns on. The count is recorded as observed rather than reconciled
to a prior number.

### Certification was attempted and reverted — `BUG-009-ROUTE-026`

Certification did **not** complete. A green guard at `in_progress` does not imply
a certifiable packet, because `artifact-lint.sh` is status-gated and the guard
delegates to it. Measured both ways this session on byte-identical content:

| `status` / `certification.status` | `artifact-lint.sh` | `state-transition-guard.sh` |
|---|---|---|
| `in_progress` | exit 0 — `Artifact lint PASSED.` | exit 0 — `failureCount: 0`, `verdict: PASS` |
| `done` | exit 1 — 68 issues | exit 1 — `failureCount: 3`, `blockingCode: DELIVERY_COMPLETION_FAILED` |

Re-running the lint at `in_progress` after the section above was written returned
exit 0, which isolates the cause to the status transition rather than to this
pass's edits. The 68 issues fall into three classes, none closable by this agent
within its boundaries:

**Class A — 63 findings.** `Evidence block too short` and `Evidence block lacks
terminal output signals`, raised against pre-existing historical evidence spread
through a 5270-line `report.md` authored by roughly a dozen prior phases.
Clearing them means rewriting prior phases' recorded evidence, which
anti-fabrication forbids.

**Class B — 2 findings.** The mode requires `report.md` sections
`### Validation Evidence` and `### Audit Evidence`; this packet never carried
those exact headings, and the requirement is checked only at a terminal status.

**Class C — the structural one.** `Required specialist phase 'implement' missing
from execution/certification phase records (Gate G022 — FABRICATION)`. This is
`B009-PHASE-IMPLEMENT-001` resurfacing in a second enforcement surface. The two
guards disagree about the same fact: `state-transition-guard.sh` honors
`execution.phaseStubs` as the v4.1.0 mechanism for a phase that legitimately had
nothing to execute, while `artifact-lint.sh` contains **zero** references to
`phaseStubs` — verified by `grep` this session — so it cannot see the stub and
demands a claim the packet cannot honestly make. Satisfying it requires writing a
`bubbles.implement` entry that never ran, which is precisely the phantom owner
the stub exists to avoid. That is a framework inconsistency, not a packet defect,
and `.github/bubbles/**` is framework-managed and was not edited.

So `status` and `certification.status` were restored to `in_progress`,
`certifiedCompletedPhases` restored to empty, `certifiedAt` and `completedAt`
left null, and `requiresRevalidation` set true. A truthful `in_progress` beats a
fabricated `done`. `BUG-009-ROUTE-025` is resolved — its three named blockers are
closed and the anchor repair completed the last plan-owned gap — and
`BUG-009-ROUTE-026` is opened carrying Classes A and C to the orchestrator.

`implement` was **not** added to `certifiedCompletedPhases`; it is a `phaseStub`,
and adding it as a claim would manufacture the phantom owner this section
adjudicates. `plan` was **not** re-added: the installed 30-phase registry omits
it, no mode's `phaseOrder` contains it, and it was removed as a classification
fix under ROUTE-024 with all seven `bubbles.plan` `executionHistory` entries
preserved. `executionHistory` retains all 24 prior entries and gained exactly one
from this pass. The `uservalidation.md` `## Checklist` and
`## Human Acceptance Record` were not touched, and the automation-owned
certification readiness item remains unchecked because its stated condition is
still false. No product source or test file was modified — not
`rlportfolioanalytics.js`, not `tests/portfolio-defect-injector.cjs`, and not
either of the two files in `4824edc81`. The concurrent unrelated working-tree
transaction, and the separate `specs/007-technical-analysis-decision-lab/` files
owned by a concurrent session, were neither staged, reset, stashed nor reverted.
Nothing was pushed.

<!-- bubbles:certifying-window-begin -->

## Validate Phase — Artifact Closure Under The Repaired Linter (BUG-009-ROUTE-026) {#validate-route-026-artifact-closure}

**Phase:** validate
**Agent:** bubbles.validate
**Route consumed:** BUG-009-ROUTE-026
**Repository authority:** `rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:11`,
control revision 11, `PREFLIGHT_COMMITTED`, exit 0.

Every block below this point is inside the current certifying window and is
enforced at full strictness by Check 3. Nothing above it was edited, reworded,
or removed by this pass.

### The Certifying-Window Boundary And Why It Is Placed Here

`BUG-009-ROUTE-026` recorded 68 lint issues at `status: done`, of which 63 were
Check 3 evidence-block findings against historical content. This pass measured
them again after the framework repair and found 63 still standing, distributed
across roughly a dozen prior phases between report line 555 and line 4955, plus
five inside the ROUTE-025 implement section.

Those 63 were inspected rather than assumed. A representative sample is real
recorded output that simply does not carry two of the eight transcript-shaped
signals the heuristic counts: a `git show --stat` file-list, a `phaseOrder`
excerpt quoted from `modes.yaml`, a shell excerpt quoted from
`state-transition-guard.sh`, an `executionHistory` JSON object, a two-line
`grep -n` result already labelled `**Exit Code:** 0` and
`**Claim Source:** executed`, and a key/value verification dump of commit
hashes and blob digests. None is empty, fabricated, or placeholder content.

Making those blocks emit two signals would mean editing another phase's
recorded output until it looked more like a transcript, which is fabrication.
Deleting them would destroy the audit trail. The framework anticipates exactly
this and provides a single opt-in, append-only certifying-window sentinel,
documented at `artifact-lint.sh` as the way to let a long-running spec promote
"instead of retroactively rewriting hundreds of historical blocks (which the
append-only audit rule forbids)". Exactly one sentinel is permitted per file;
more than one fails loud. This pass placed the one sentinel immediately above
this section, so the boundary falls between the last prior specialist round and
this pass's own fresh evidence. The exemption buys nothing for this pass: every
block it authors sits after the sentinel and is checked in full.

The scan that located the 63, replicated from the linter's own block walk:

```text
$ node /tmp/bug009-block-scan.mjs specs/.../BUG-009-.../report.md
totalBlocks=134 failingBlocks=63
L1704-1706 lang='text' too-short(1)
L4348-4351 lang='text' too-short(2)
L5200-5204 lang='' signals(0/2)[]
```

### Validation Evidence

Baseline at `status: done` before this pass changed any artifact. The count is
65, not the 68 `BUG-009-ROUTE-026` recorded, because the framework repair landed
in between:

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/.../BUG-009-...
[required-section findings, quoted verbatim, 2 of them]
   state.json workflowMode 'bugfix-fastlane' requires report.md section: Validation Evidence
   state.json workflowMode 'bugfix-fastlane' requires report.md section: Audit Evidence
   Evidence block lacks terminal output signals (1/2 required):
   Evidence block too short (1 lines):
Artifact lint FAILED with 65 issue(s).
ARTIFACT_LINT_DONE_BEFORE_EXIT=1
```

The three that disappeared are the Gate G022 implement findings. Canonical
Bubbles commit `bf49806` taught `artifact-lint.sh` to honour
`execution.phaseStubs`, which `state-transition-guard.sh` has honoured since
v4.1.0. Both of the linter's required-specialist check sites now resolve the
stub instead of demanding the phantom `bubbles.implement` owner that
`B009-PHASE-IMPLEMENT-001` refused to synthesize:

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/.../BUG-009-...
   Required specialist phase 'implement' found in execution/certification phase records
   Required specialist phase 'test' found in execution/certification phase records
   Required specialist phase 'implement' recorded in execution/certification phase records
   Required specialist phase 'audit' recorded in execution/certification phase records
```

The two missing sections were a real artifact defect, not a heuristic artifact.
The mode requires headings named `Validation Evidence` and `Audit Evidence`, and
the packet carried `Validation Summary` and `Audit Verdict` instead. This
section and the next supply them. Disclosure, so the check cannot be mistaken
for self-satisfying: the verbatim lint lines quoted above name those two
headings inside a fenced block, and the linter's section grep is not
fence-aware, so it would match the quotation as well as the real headings. Both
real headings exist regardless, at this document's `### Validation Evidence` and
`### Audit Evidence`.

Canonical repository checks, both green in this session:

```text
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

```text
$ node scripts/pii-scan.mjs
[pii-scan] files=10332 messages=2344 findings=0 OK
PII_SCAN_EXIT=0
```

The transition guard resolves the delivery contract and permits the `done`
target with no failures:

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/.../BUG-009-...
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: []
failureCount: 0
exitStatus: 0
verdict: PASS
```

### Audit Evidence

The audit phase executed and its evidence is recorded in this file at
`#audit-route-023` and at `#audit-addendum-pii-remediated`. This section reports
that record; it does not re-perform the audit, which `bubbles.validate` does not
own and may not write.

The audit's first attempt returned `DO_NOT_SHIP` on `B009-AUDIT-PII-001`. The
addendum withdrew that verdict once the finding was remediated and re-derived
`REWORK_REQUIRED`, on the explicit ground that "`SHIP_IT` is not available
either: the guard still refuses at `failureCount 10`", pending scope completion
that could only resolve downstream. The currently active attempt therefore still
records a delivery refusal:

```text
$ node -e '...read ./state.json execution.audit...'
currentAttemptId=BUG-009-AUDIT-002
attemptId=BUG-009-AUDIT-002 resultState=ACTIVE agent=bubbles.audit
verdict=REWORK_REQUIRED
deliveryEvaluation=REFUSED
outcome=route_required
evidenceRef=(none)
unresolvedFindings=["B009-PHASE-IMPLEMENT-001","B009-FRAMEWORK-PHASE-REGISTRY-001","B009-FRAMEWORK-G040-EXCLUSION-001"]
```

Two properties of that record decide this pass's disposition.

First, the attempt carries no `evidenceRef`, so there is no `AUDIT_RESULT_V1`
transcript to adjudicate. The framework's own contract lint cannot be pointed at
anything, because it requires a result file:

```text
$ bash .github/bubbles/scripts/audit-result-contract-lint.sh --spec-dir specs/.../BUG-009-...
Usage:
  bash bubbles/scripts/audit-result-contract-lint.sh --result FILE
  bash bubbles/scripts/audit-result-contract-lint.sh --agent-contract FILE
AUDIT_CONTRACT_LINT_EXIT=64
```

Second, nothing mechanical will refuse on that verdict under this profile. The
guard's attempt-state and verdict enforcement is written for
`planning-maturity-v1`; a grep of `state-transition-guard.sh` for
`REWORK_REQUIRED`, `DO_NOT_SHIP`, `auditVerdict` and `deliveryEvaluation`
returns zero matches, so `delivery-completion-v1` reaches `verdict: PASS`
without ever reading the audit's conclusion.

That combination is precisely why this pass stops short of certifying. The
grounds the audit named are discharged: `pii-scan` reports `findings=0`, Scope 1
is `Done`, `completedScopes` is populated, all 19 Definition of Done items are
checked, and the guard reports `failureCount 0` rather than the 10 the addendum
was waiting on. But discharging an auditor's stated grounds is not the same as
the auditor withdrawing its refusal, and `execution.audit` is audit-owned state
that `bubbles.validate` is forbidden to repair. Writing `certification.status:
done` over an unretracted `deliveryEvaluation: REFUSED` would publish a
machine-readable completion claim that the packet's own independent check still
denies, and downstream consumers read that field without reading this paragraph.
That is the same phantom-green pattern `B009-PHASE-IMPLEMENT-001` refused, in a
different field.

The correct next step is the one the verdict names. `REWORK_REQUIRED` means
rework, then re-audit; the rework is done, so the packet routes to
`bubbles.audit` for a delivery re-audit that can either lift the refusal or
state a surviving reason.

### Result At `status: done` After This Pass

Re-measured on the same status flip that produced 65, after the two headings
were authored and the sentinel placed:

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/.../BUG-009-...
   Skipped 134 evidence blocks before the certifying-window sentinel (prior-window history) in report.md
Artifact lint PASSED.
ARTIFACT_LINT_DONE_AFTER_EXIT=0
```

The exemption is bounded and verifiable. The file now holds 142 fenced blocks
and exactly one sentinel, `grep -cF` returns 1, and 134 are skipped, so the 8
this pass authored were checked at full strictness and passed. Every one of the
63 findings lies inside the skipped span; not one of them was edited.

Flipping status also surfaced two gates that a partial flip cannot satisfy,
which is the correct behaviour rather than a defect:

```text
$ bash .github/bubbles/scripts/post-cert-spec-edit-guard.sh specs/.../BUG-009-...
post-cert-spec-edit-guard: G088 requires top-level certifiedAt for certified spec ... (status=done)
G088_EXIT=2
$ bash .github/bubbles/scripts/inter-spec-dependency-guard.sh specs/.../BUG-009-...
G089 inter_spec_dependency_gate violation: ... has status 'done' while requiresRevalidation:true is unresolved
G089_EXIT=1
```

Both name fields that a genuine certification populates, so they are the
remaining mechanical conditions rather than obstacles. The flip was reverted.
`status`, `certification.status`, `certifiedAt`, `completedAt`,
`certifiedCompletedPhases` and `requiresRevalidation` all hold their inbound
values, and both checks are green at the restored status:

```text
$ bash .github/bubbles/scripts/artifact-lint.sh specs/.../BUG-009-...
Artifact lint PASSED.
LINT_INPROGRESS_EXIT=0
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/.../BUG-009-...
failedGateIds: []
failureCount: 0
verdict: PASS
GUARD_INPROGRESS_EXIT=0
```

### Disposition

This pass closed the artifact half of `BUG-009-ROUTE-026` and left the audit
half to its owner. The fifth `## Automation Readiness` item in
`uservalidation.md` stays unchecked, because it asserts that validate-owned
certification completed and it did not. The `## Checklist` and the
`## Human Acceptance Record` were not touched. No product source or test file
was modified, `.github/bubbles/**` was not edited, the concurrent session's
`specs/007-technical-analysis-decision-lab/` files and the unrelated 61-entry
working-tree transaction were neither staged nor reverted, and nothing was
pushed.

<a id="validate-route-027-target-status-remeasure"></a>

## Validation Evidence — Independent Re-Measurement At The Target Status

Run under repository-binding preflight decision
`rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:12` at control revision 12
(`PREFLIGHT_COMMITTED`, exit 0). The instruction for this pass was to certify
BUG-009 or report honestly why not. It reports why not.

A gate result is only meaningful at the status being claimed. Both gates were
therefore re-run twice: once at the inbound `in_progress`, and once with
`status` and `certification.status` set to `done`, `completedAt`, `certifiedAt`
and `certification.certifiedCompletedPhases` populated. The `done`
configuration was a measurement only; it was reverted with
`git checkout HEAD -- state.json` and nothing claiming `done` was committed.

**Claim Source:** executed

#### 1. Baseline at `in_progress` — both gates green

```
$ bash .github/bubbles/scripts/artifact-lint.sh <packet>
ℹ️  Workflow mode 'bugfix-fastlane' allows status 'done'; current status is 'in_progress'
✅ Mode-specific report gates skipped (status not in promotion set)
Artifact lint PASSED.
ARTIFACT_LINT_INPROGRESS_EXIT=0

$ bash .github/bubbles/scripts/state-transition-guard.sh <packet>
🟡 TRANSITION PERMITTED with 2 warning(s)
failedGateIds: []
blockingCode: none
failureCount: 0
exitStatus: 0
verdict: PASS
GUARD_INPROGRESS_EXIT=0
```

The `in_progress` pass is not evidence that `done` is reachable. The lint line
`Mode-specific report gates skipped (status not in promotion set)` states
plainly that a class of checks does not run below the promotion set.

#### 2. `artifact-lint.sh` at `done` — exit 0, upstream fix confirmed

```
$ grep -c 'phaseStubs' .github/bubbles/scripts/artifact-lint.sh
5

$ bash .github/bubbles/scripts/artifact-lint.sh <packet>          # status: done
✅ DoD completion gate passed for status 'done' (all DoD checkboxes are checked)
✅ Workflow mode 'bugfix-fastlane' permits current status 'done' (ceiling: done)
✅ All 1 scope(s) in scopes.md are marked Done
✅ Required specialist phase 'implement' found in execution/certification phase records
✅ Phase-scope coherence verified (Gate G027)
✅ workflowMode gate satisfied: ### Validation Evidence
✅ workflowMode gate satisfied: ### Audit Evidence
ℹ️  Skipped 134 evidence blocks before <SENTINEL> (prior-window history)
✅ All 145 evidence blocks in report.md contain legitimate terminal output
Artifact lint PASSED.
ARTIFACT_LINT_DONE_EXIT=0
```

`<SENTINEL>` above is a verbatim elision of the certifying-window begin marker.
The literal token is deliberately not reproduced here: Gates G040, G084 and G095
each count occurrences of that marker across the whole file and block on more
than one, so quoting the linter's output literally would forge a second
certifying window. The single real marker remains at its original position.

The artifact surface is certifiable. `implement` is accepted from
`execution.phaseStubs`, not from a fabricated claim: `certifiedCompletedPhases`
was populated with 11 phases and `jq '... index("implement") != null'` returned
`false` while the linter still printed that the phase was found and recorded.

#### 3. `state-transition-guard.sh` at `done` — exit 1, Gate G089

```
$ bash .github/bubbles/scripts/state-transition-guard.sh <packet>   # status: done
--- Check 31: Inter-Spec Dependency Enforcement (Gate G089) ---
🔴 BLOCK: Inter-spec dependency guard failed — Gate G089.
🔴 TRANSITION BLOCKED: 1 failure(s), 1 warning(s)
state.json status MUST NOT be set to 'done'.
auditProfile: delivery-completion-v1
failedGateIds: [G089]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 1
exitStatus: 1
verdict: FAIL
GUARD_DONE_EXIT=1

$ bash .github/bubbles/scripts/inter-spec-dependency-guard.sh <packet>
G089 inter_spec_dependency_gate violation: ... has status 'done' while
requiresRevalidation:true is unresolved; demote the spec or recertify after revalidation
G089 inter_spec_dependency_gate blocked: findings=1 dependencies=0 requiresRevalidation=true
INTER_SPEC_EXIT=1
```

The blocker is the **top-level** `"requiresRevalidation": true` at
`state.json:18`, which is a distinct field from the
`certification.requiresRevalidation` at line 282 that this pass had set to
`false`. Setting the certification-scoped field did not and should not clear
the top-level one. This gate is not reachable at `in_progress`, which is why
the prior pass's green guard did not predict it.

This finding was **not** cleared. Flipping `requiresRevalidation` to `false` is
editing the exact field the failing gate reads, in order to make that gate
report success, which is gate-gaming rather than gate-satisfaction. The packet
is linked to `specs/008-portfolio-survival-and-brief-lab`, whose committed
status is `in_progress`, so the flag is consistent with reality.

#### 4. Audit refusal is unretracted — independent of the gates

```
$ jq -r '.execution.audit.attempts[]? | "id=\(.attemptId) state=\(.resultState) verdict=\(.auditVerdict) delivery=\(.deliveryEvaluation) evidenceRef=\(.evidenceRef // "NULL") unresolved=\((.unresolvedFindings // []) | length)"' state.json
id=BUG-009-AUDIT-001  state=SUPERSEDED  verdict=DO_NOT_SHIP       delivery=REFUSED  evidenceRef=NULL  unresolved=4
id=BUG-009-AUDIT-002  state=ACTIVE      verdict=REWORK_REQUIRED   delivery=REFUSED  evidenceRef=NULL  unresolved=3

$ jq -r '.execution.audit.attempts[]? | select(.resultState=="ACTIVE") | .unresolvedFindings[]?' state.json
B009-PHASE-IMPLEMENT-001
B009-FRAMEWORK-PHASE-REGISTRY-001
B009-FRAMEWORK-G040-EXCLUSION-001
```

The guard's silence on this is structural, and was verified rather than assumed:

```
$ for t in REWORK_REQUIRED DO_NOT_SHIP auditVerdict deliveryEvaluation SHIP_IT unresolvedFindings evidenceRef; do
    printf '%-22s %s\n' "$t" "$(grep -c "$t" .github/bubbles/scripts/state-transition-guard.sh)"; done
REWORK_REQUIRED        0
DO_NOT_SHIP            0
auditVerdict           0
deliveryEvaluation     0
SHIP_IT                0
unresolvedFindings     0
evidenceRef            0
```

The guard's attempt-state enforcement is gated on `planning-maturity-v1`; this
packet resolves to `delivery-completion-v1`. A green guard here therefore
carries no information about whether the audit cleared the packet.

#### 5. Disposition

Certification was refused on two independent grounds, either of which is
sufficient:

| # | Ground | Measured |
|---|--------|----------|
| 1 | `state-transition-guard.sh` fails at `done` | `failedGateIds: [G089]`, `failureCount: 1`, exit 1 |
| 2 | Current audit attempt `ACTIVE` with `REWORK_REQUIRED`, `REFUSED`, `evidenceRef: NULL`, 3 unresolved findings | validate is forbidden to write audit-owned state or certify over a non-clean verdict with no `AUDIT_RESULT_V1` transcript |

`BUG-009-ROUTE-026` was already `resolved` before this pass; the open request is
`BUG-009-ROUTE-027`, addressed to `bubbles.audit`. It was left open, because
closing another owner's routing request while its stated refusal stands would
discard the routing rather than satisfy it.

`status` and `certification.status` remain `in_progress`. The fifth
`## Automation Readiness` item stays unchecked, because it asserts that
validate-owned certification completed and it did not. `## Checklist` and
`## Human Acceptance Record` were untouched, no historical evidence block was
rewritten or deleted, `.github/bubbles/**` was not modified, the concurrent
session's `specs/007-technical-analysis-decision-lab/` files and the unrelated
working-tree transaction were neither staged nor reverted, and nothing was
pushed.

## Audit Phase — Attempt `BUG-009-AUDIT-003`: Refusal Restated On Re-Executed Evidence (BUG-009-ROUTE-027) {#audit-attempt-003-refusal-restated}

Attempt `BUG-009-AUDIT-002` was `ACTIVE` / `REWORK_REQUIRED` / `REFUSED` and was
blocking certification. This attempt supersedes it, closes it with a terminal
`resultState`, and re-derives the verdict from commands executed this session
under repository-binding decision
`rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:14` at control revision 14
(`PREFLIGHT_COMMITTED`, exit 0).

**Outcome: the refusal is RESTATED, on a narrower and different ground than
attempt 002 used.** Attempt 002 refused on `DELIVERY_COMPLETION_FAILED` with
`failureCount 10` across `G022` / `G027` / `G136`. Every one of those has since
cleared. One blocker that attempt 002 never named now stands alone: `G089`.

### The three post-fix verifications

All three of the claims put to this audit are confirmed by direct execution.

```text
$ jq -r '.execution.phaseStubs.implement.stubbedBy, .execution.phaseStubs.implement.deliveryCommit' state.json
bubbles.validate
4824edc81
exit 0

$ git show --stat --oneline 4824edc81
4824edc81 test(BUG-009): assert named risk exclusions
 tests/portfolio-risk.functional.mjs     | 29 +++++++++++++++++++++++++++++
 tests/portfolio-test-integrity.unit.mjs |  2 +-
 2 files changed, 30 insertions(+), 1 deletion(-)
exit 0

$ grep -c phaseStubs .github/bubbles/scripts/artifact-lint.sh
5
exit 0
```

The delivery is test-only: two test files, `+30/-1`, no product source. That is
the precise situation `phaseStubs` exists to record, so the `implement` stub is
honest rather than a recording gap.

Claim 3 required care. `artifact-lint.sh` is **status-gated**, so running it
against the packet at its committed `in_progress` status skips the promotion-set
gates and proves nothing about `done`. It was therefore re-run against an
out-of-repo copy at `status=done`, leaving the real packet untouched.

```text
$ bash .github/bubbles/scripts/artifact-lint.sh <tmp>/pkt      # copy at status=done
✅ Required specialist phase 'implement' recorded in execution/certification phase records
✅ Required specialist phase 'test' recorded in execution/certification phase records
✅ Required specialist phase 'validate' recorded in execution/certification phase records
✅ Required specialist phase 'audit' recorded in execution/certification phase records
✅ Phase-scope coherence verified (Gate G027)
ℹ️  Skipped 134 evidence blocks before <!-- bubbles:certifying-window-begin --> (prior-window history) in report.md
✅ All 150 evidence blocks in report.md contain legitimate terminal output
Artifact lint PASSED.
exit 0

$ git status --porcelain -- <packet> | wc -l
0
```

The 68 issues previously seen at `done` are gone, and `implement` now resolves
from the stub. The framework defect is genuinely fixed.

### The decisive blocker: `G089`

The guard was run in assertion-only form against the registry-resolved contract.

```text
$ bash .github/bubbles/scripts/state-transition-guard.sh <packet> \
    --target-status done --expect-workflow-mode bugfix-fastlane \
    --expect-contract-digest sha256:aa91472c047d3d985d38c1d308feb1e6081955b2aa553816deb5987d9cdc449f
passedGateIds: [...,G022,G027,G136,G040,G089,...]
failedGateIds: []
failureCount: 0
verdict: PASS
exit 0
```

**This green result must not be read as certifiability.** It measures the packet
at its committed `in_progress` status. `inter-spec-dependency-guard.sh` branches
on the `status` field in `state.json`, not on the `--target-status` flag:

```text
$ sed -n '275,276p' .github/bubbles/scripts/inter-spec-dependency-guard.sh
if [[ "$requires_revalidation" == "true" && ( "$current_status" == "done" || "$current_status" == "done_with_concerns" ) ]]; then
  violation "$spec_rel has status '$current_status' while requiresRevalidation:true is unresolved; demote the spec or recertify after revalidation"

$ jq -r '.requiresRevalidation' state.json
true
exit 0
```

Both operands of that conjunction are established: `requiresRevalidation` is
`true` today, and `status` becomes `done` on promotion. The violation therefore
fires deterministically at the target status. This is a pure function of two
fields read directly, not an inference. It corroborates the independent real-path
measurement recorded at commit `e7468c902` (`failedGateIds [G089]`,
`failureCount 1`).

Note that `specDependsOn` is `[]` and the guard passes standalone:

```text
$ bash .github/bubbles/scripts/inter-spec-dependency-guard.sh <packet>
inter-spec-dependency-guard: PASS Gate G089 (inter_spec_dependency_gate) - spec=<packet> dependencies=0 acceptedDependencies=none requiresRevalidation=true acknowledgedUnstableDependencies=0
exit 0
```

The dependency arm of `G089` is clean. The blocker is the standalone
`requiresRevalidation` arm at lines 275-276, which is independent of dependencies
entirely.

A `status=done` probe on the out-of-repo copy additionally reported `G088` and
`G089`, but that probe is **not** valid evidence for either gate: both guards
resolve paths against the repository root and the copy lives outside it.

```text
$ bash .github/bubbles/scripts/inter-spec-dependency-guard.sh <tmp>/pkt
inter-spec-dependency-guard: unable to resolve repository root from specDir: <tmp>/pkt
exit 2
```

Exit 2 is a runtime error, not a finding. `G088` is discarded as a probe
artifact; it is not carried as a finding against this packet.

### Adjudication of the three unresolved findings

| Finding | Verdict | Ground |
|---|---|---|
| `B009-PHASE-IMPLEMENT-001` | **RESOLVED** | The stub is honest for a test-only defect (`4824edc81`: 2 test files, `+30/-1`, no product source), `artifact-lint.sh` now honors `phaseStubs` (`grep -c` = 5, landed at `07c89e991`), lint at `done` reports `implement` recorded, and `G022` passes. No phantom owner was synthesized. |
| `B009-FRAMEWORK-PHASE-REGISTRY-001` | **STILL STANDING upstream, NOT blocking here** | The registry gap (`plan`/`design` unregistered) is a canonical framework defect, not a packet defect; it is filed as residue at `.specify/memory/open-work.md` by `b65fefc06`. It is not closable from inside this repository and `G022` no longer fails on it. |
| `B009-FRAMEWORK-G040-EXCLUSION-001` | **STILL STANDING upstream, NOT blocking here** | Same class: an upstream observation. `G040` appears in `passedGateIds` in the guard run above, so it constrains nothing about this packet's promotion. |

Two of three remain open, but neither is a delivery defect and neither is the
reason this audit refuses. The sole reason is `G089`.

### `requiresRevalidation` assessment (recorded as a finding; field NOT edited)

Recorded as `B009-REVALIDATION-RESIDUE-001`. Judgment: **stale revert residue,
not a genuine revalidation obligation** — with the caveat that clearing it is
not this agent's call.

```text
$ for c in dfe6c95ab d18731c51 e7468c902; do git show "$c:<packet>/state.json" | jq -r '.requiresRevalidation'; done
false
true
true

$ git log --oneline --all -S'inter-spec-dependency-revalidation' -- <packet>
(no output)
exit 0

$ jq -r '{certifiedAt, certRequiresReval: .certification.requiresRevalidation}' state.json
{ "certifiedAt": null, "certRequiresReval": null }
```

Four facts support the residue reading. The flag was set by validate itself as
part of unwinding a failed certification — `d18731c51`'s own note states
"`status` and `certification.status` were restored to `in_progress`,
`certifiedCompletedPhases` restored to empty, and `requiresRevalidation` set
true". `specDependsOn` is `[]`, so no dependency demotion could have justified
it. `inter-spec-dependency-revalidation.sh`, the mechanism that legitimately
marks dependents, has never touched this packet. And `certifiedAt` is `null`, so
the packet was never certified and has nothing to be revalidated *against*.

Decisively, the condition that motivated the flag is gone: it was set because
certification failed with 68 lint issues at `done`, and that failure was a
framework defect fixed at `07c89e991` and verified cleared above.

This does **not** license clearing it here. Validate was right that editing the
field a failing gate reads, purely to make it pass, is gate-gaming. But the
gate's own remediation text is "demote the spec or **recertify after
revalidation**" — the flag means *revalidation pending*, and a post-fix
revalidation has now in fact been performed and recorded (`f56b36e7c`,
`e7468c902`, and this attempt). Clearing it as the documented outcome of a
completed revalidation would be legitimate; clearing it to turn a gate green
would not. That distinction, and the decision, belong to `bubbles.validate`.

### Verdict

`REWORK_REQUIRED`. Engineering substance is sound and independently
re-verified — the mutation evidence, the test suites, `selftest`, the lint at
both statuses, and every previously failing gate. The refusal is restated on the
single remaining ground that `G089` blocks deterministically at the target
status while `requiresRevalidation:true` stands unresolved.

The circularity in the prior standoff is broken by this record: attempt 002 is
now closed with a terminal `resultState` and a non-null `evidenceRef`, so
"audit refusal unretracted" is no longer a reason for validate to refuse. What
remains for the owner is a single, specific decision about one field.

### Boundaries honored

`status` and `certification.status` were not changed and remain `in_progress`;
no DoD checkbox, scope status, `completedScopes`, `completedPhaseClaims`, or
`certification.*` field was written. `requiresRevalidation` was not edited.
`executionHistory` was appended to only. `uservalidation.md`, product source,
tests, and `.github/bubbles/**` were untouched. The concurrent session's
`specs/007-technical-analysis-decision-lab/` files and the unrelated working-tree
transaction were neither staged nor reverted. `node scripts/pii-scan.mjs` was run
before committing. Nothing was pushed.

### Revalidation Residue Adjudicated; Certification Refused On A New Root Cause {#validate-route-027-revalidation-decision}

> **Transcript elision, disclosed.** Several tool lines below name the report's
> window-boundary marker. Every occurrence is rendered as the bare backticked
> token `certifying-window-begin`, never in its literal comment form, because
> the literal form is itself the control token this section is about and a
> verbatim paste would add a further occurrence to this file. That is exactly
> the accident being diagnosed. Wording is otherwise unaltered; the convention
> matches the existing safe mention already in this report.

**Decision 1 — `B009-REVALIDATION-RESIDUE-001`: top-level `requiresRevalidation`
is CLEARED to `false`.** `bubbles.audit` recorded this finding as
`RECORDED_NOT_EDITED` and delegated it explicitly: *"That decision belongs to
bubbles.validate, not to audit."* Five independent facts were re-derived this
session rather than taken from the prior record:

1. **Provenance is revert residue.** `git show d18731c51` on `state.json` shows
   `- "requiresRevalidation": false` / `+ "requiresRevalidation": true`, and that
   commit's own note states the flag was set while *"status and
   certification.status were restored to in_progress, certifiedCompletedPhases
   restored to empty"* — that is, while unwinding a failed certification attempt.
2. **The legitimate setter never ran.** `specDependsOn` is `[]`, and
   `git log -S'inter-spec-dependency-revalidation'` over this packet returns only
   `87c1c728d`, which merely quotes the script name in audit prose.
3. **There is nothing to revalidate against.** `certifiedAt` is `null`; the packet
   was never certified, so no prior certification's validity is in question.
4. **The guard's own remedy sanctions clearing.** `inter-spec-dependency-guard.sh`
   line 276 names the remedy as *"demote the spec or recertify after
   revalidation"*, and a revalidation was performed and re-derived here.
5. **Clearing it produced no gate benefit.** G089 fires only at `done` /
   `done_with_concerns`. The packet is being left at `in_progress`, so the flag's
   clearing changes no gate outcome. It records a completed revalidation; it does
   not purchase a green check.

Revalidation re-derived this session:

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 3429 passed, 0 failed
================================================
SELFTEST_EXIT=0

$ node scripts/pii-scan.mjs
[pii-scan] files=10332 messages=2347 findings=0 OK
PII_EXIT=0

$ bash .github/bubbles/scripts/inter-spec-dependency-guard.sh <packet>
inter-spec-dependency-guard: PASS Gate G089 (inter_spec_dependency_gate) -
  dependencies=0 acceptedDependencies=none requiresRevalidation=false
  acknowledgedUnstableDependencies=0
G089_EXIT=0

$ git show 4824edc81 --stat     # delivery commit intact on current tree
 tests/portfolio-risk.functional.mjs     | 29 +++++++++++++++++++++++++++++
 tests/portfolio-test-integrity.unit.mjs |  2 +-
 2 files changed, 30 insertions(+), 1 deletion(-)
```

**Decision 2 — certification REFUSED. A previously undiagnosed defect blocks the
packet at every status.** Certification was attempted, measured, and reverted.
At `status: done` the lint fails; on byte-identical content at `in_progress` it
passes, and the transition guard fails at both:

```
$ bash .github/bubbles/scripts/artifact-lint.sh <packet>      # status: done
Artifact lint FAILED with 64 issue(s).
ARTIFACT_LINT_DONE_EXIT=1
  45  Evidence block lacks terminal output signals
  18  Evidence block too short
   1  Multiple `certifying-window-begin` markers (2) in report.md

$ bash .github/bubbles/scripts/artifact-lint.sh <packet>      # status: in_progress
Artifact lint PASSED.
ARTIFACT_LINT_INPROGRESS_EXIT=0   issues=0

$ bash .github/bubbles/scripts/state-transition-guard.sh <packet>
failedGateIds: [G040,G084,G095]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 3
verdict: FAIL
STATE_TRANSITION_GUARD_EXIT=1

$ bash .github/bubbles/scripts/pre-existing-deferral-guard.sh <packet>
pre-existing-deferral-guard: multiple `certifying-window-begin` markers (2)
G084_EXIT=2

$ bash .github/bubbles/scripts/discovered-issue-disposition-guard.sh <packet>
G095 ERROR: multiple `certifying-window-begin` markers (2)
G095_EXIT=2
```

**Root cause — `B009-LINT-WINDOW-MARKER-001`.** All three gates fail on one
condition, and the 63 evidence findings are its downstream consequence, not
independent defects. This report carries exactly ONE real window marker, at line
5429. A second occurrence of the literal token sits at line 5891 **inside a
fenced code block**: it is a pasted line of the lint's own success transcript,
added by `87c1c728d`, reading `Skipped 134 evidence blocks before <marker>
(prior-window history)`. The marker counter and the marker consumer disagree
about fenced code:

```
$ sed -n '1644p' .github/bubbles/scripts/artifact-lint.sh      # COUNTER: fence-blind
  cw_marker_count=$(grep -cF -- '<marker>' "$current_report_file" || true)

$ sed -n '1663p' .github/bubbles/scripts/artifact-lint.sh      # CONSUMER: fence-aware
    if [[ "$in_code_block" -eq 0 ]] && [[ "$line" == *"<marker>"* ]]; then

$ awk 'BEGIN{f=0} /^```/{f=!f} /<marker>/{print NR"  in_code_fence="f}' report.md
5429  in_code_fence=0
5891  in_code_fence=1

$ for c in e7468c902 87c1c728d; do git show "$c:<packet>/report.md" | grep -cF -- '<marker>'; done
1      # e7468c902 — lint PASSED at done
2      # 87c1c728d — lint FAILS at done
```

The counter sees 2 and declares "multiple markers"; the consumer correctly sees
1. Because the window mechanism is opt-in *only when exactly one marker is
counted*, the miscount disables it, and all 134 prior-window evidence blocks are
re-checked — producing the 63 findings. The packet did not regress substantively:
it acquired a quoted control token. Audit pasted the transcript proving the lint
passed, and that paste is what makes the lint fail.

**Why this pass did not repair it.** The offending line is inside
`bubbles.audit`'s recorded evidence block. This agent's ownership of `report.md`
is append-only, and rewriting another phase's transcript to clear three gates is
the same category of action audit warned against on the revalidation flag. The
counter/consumer inconsistency itself lives in `.github/bubbles/**`, which is
framework-managed and was not edited. Both admissible repairs therefore sit with
other owners, so this is routed rather than forced.

**Disposition.** `status` and `certification.status` remain `in_progress`;
`certifiedAt`, `completedAt`, and `certification.certifiedCompletedPhases` were
restored to their pre-attempt values after the measurement above. A truthful
`in_progress` beats a fabricated `done`.

### Boundaries honored (route 027 pass)

`requiresRevalidation` was set `false` as the recorded outcome of a completed
revalidation. `status`, `certification.status`, `certifiedAt`, `completedAt`, and
`certifiedCompletedPhases` are unchanged from HEAD. No DoD checkbox, scope
status, or `completedScopes` entry was written; `uservalidation.md` was not
touched, so its Checklist, Human Acceptance Record, and Automation Readiness
items are byte-identical. `implement` was not claimed and `plan` was not added.
`executionHistory` was appended to only and retains all 28 prior entries,
including all 7 from `bubbles.plan`. Product source, tests, and
`.github/bubbles/**` were untouched. The concurrent session's
`specs/007-technical-analysis-decision-lab/` files and the unrelated working-tree
transaction were neither staged nor reverted. Nothing was pushed.

## Validate Phase — Certification Refused On A Single Framework Marker Condition {#validate-certification-refusal-marker-condition}

**Phase Agent:** bubbles.validate

> **Transcript elision, disclosed.** Tool lines below name the report's
> window-boundary marker. Every occurrence is rendered as the bare backticked
> token `certifying-window-begin`, never in its literal comment form, because
> the literal form is the control token this section is about and a verbatim
> paste would add further occurrences to this file — the exact accident being
> diagnosed. Wording is otherwise unaltered; the convention matches the one
> already disclosed above in this report.

This pass was invoked to certify `done` on the premise that every blocker was
cleared. Two premises held; one did not. Every number below was produced by a
command run in this session under binding decision
`rb:vscode-8c5a5a2683cf16f2dcec3bf76c6a9d05:16`, not carried over from the record.

**Held.** `requiresRevalidation` is `false` and G089 now passes, appearing in
`passedGateIds` of the guard run at target status `done`. DoD is 19 checked, 0
unchecked; scope 01 is `Done`.

**Did not hold.** The premise that `artifact-lint.sh` exits 0 at `done`. It exits
1 with 64 issues. The packet's own committed finding
`B009-LINT-WINDOW-MARKER-001` already said so, and this pass reproduced it.

### Marker count reproduced from the artifact, not from the record

```
$ grep -cF -- '`certifying-window-begin`' report.md      # literal form elided
2
$ grep -nF -- '`certifying-window-begin`' report.md      # literal form elided
5429:`certifying-window-begin`
5891:ℹ️  Skipped 134 evidence blocks before `certifying-window-begin` (prior-window history) in report.md
```

Line 5429 is the one real marker. Line 5891 is a verbatim line of
`artifact-lint`'s own success transcript sitting inside a fenced code block. The
counter at `artifact-lint.sh:1644` uses fence-blind `grep -cF` and sees 2; its
own consumer at `:1663` requires `in_code_block -eq 0` and correctly sees 1.

### Both gates measured at the final `done` status

`status` and `certification.status` were flipped to `done` on otherwise
byte-identical content, both gates were run, and the probe was reverted with
`git checkout`; the packet was verified clean against HEAD `58a2d4f11` before and
after.

```
$ bash .github/bubbles/scripts/artifact-lint.sh <packet>     # status=done
❌ Multiple `certifying-window-begin` markers (2) in report.md — at most one is allowed (it marks the single current certifying-window start)
❌ Evidence block lacks terminal output signals (1/2 required):
❌ Evidence block too short (1 lines):
ARTIFACT_LINT_DONE_PROBE_EXIT=1
$ ... | grep -c '^❌'
64
```

```
$ bash .github/bubbles/scripts/state-transition-guard.sh <packet>   # status=done
passedGateIds: [G057,G061,G053,G051,G068,G082,G083,G128,G085,G086,G091,G087,G093,G089,G092,G090,G094,G097,G098,G099,G100,G130,G131,G136]
failedGateIds: [G040,G084,G088,G095]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 5
exitStatus: 1
verdict: FAIL
GUARD_DONE_PROBE_EXIT=1
```

On the same content at `in_progress`, `artifact-lint.sh` exits 0 and reports
`Artifact lint PASSED.`

### Four failing gates are one condition, not four

```
$ bash .github/bubbles/scripts/pre-existing-deferral-guard.sh <packet>
pre-existing-deferral-guard: multiple certifying-window markers (2) in .../report.md — at most one is allowed
pre-existing-deferral-guard_EXIT=2
$ bash .github/bubbles/scripts/discovered-issue-disposition-guard.sh <packet>
G095 ERROR: multiple certifying-window markers (2) in .../report.md — at most one is allowed
discovered-issue-disposition-guard_EXIT=2
```

G040, G084 and G095 all abort on the same multiple-marker condition. **G088 is
not a fourth blocker**, correcting the earlier record:

```
$ bash .github/bubbles/scripts/post-cert-spec-edit-guard.sh <packet>   # in_progress
post-cert-spec-edit-guard: PASS Gate G088 ... status=in_progress is not certified done
post-cert-spec-edit-guard_EXIT=0
$ bash .github/bubbles/scripts/post-cert-spec-edit-guard.sh <packet>   # done probe
post-cert-spec-edit-guard: G088 requires top-level certifiedAt for certified spec ... (status=done)
G088_DONE_EXIT=2
```

G088 fired only because the minimal probe left `certifiedAt` unset, which genuine
certification would populate. The blocking condition is therefore **singular**.

### Why this pass did not repair it

Neither admissible repair belongs to `bubbles.validate`. The counter/consumer
inconsistency is in `.github/bubbles/**`, which is framework-managed and out of
bounds. The only downstream alternative would rewrite a verbatim transcript line
inside `bubbles.audit`'s recorded evidence block — evidence tampering, refused
for exactly the reason audit itself refused to clear `requiresRevalidation` to
turn a gate green.

### Second, independent refusal ground

`execution.audit.currentAttemptId` `BUG-009-AUDIT-003` is `ACTIVE` and records
`auditVerdict: REWORK_REQUIRED`, `deliveryEvaluation: REFUSED`, `outcome:
route_required`, `blockingCode: DELIVERY_COMPLETION_FAILED`. Terminal
certification requires a clean delivery verdict, and `execution.audit` is
audit-owned state that validate may not repair. No clean attempt was
manufactured. `BUG-009-ROUTE-027` is already `resolved`; the open route is
`BUG-009-ROUTE-028`, which already targets `bubbles.audit` and was left open
rather than duplicated.

### Ownership Routing Summary

| Finding | Owner Required | Reason | Re-validation Needed |
|---------|----------------|--------|----------------------|
| B009-LINT-WINDOW-MARKER-001 | bubbles.audit (or framework) | Audit re-states its transcript token, or the framework makes the marker counter fence-aware to match its consumer | yes |
| BUG-009-AUDIT-003 non-clean verdict | bubbles.audit | Fresh delivery audit must issue a clean verdict; validate may not repair audit history | yes |

### What was not written

`status`, `certification.status`, `completedAt`, `certification.completedAt`,
`certifiedAt` and `certifiedCompletedPhases` are unchanged, so
`certifiedCompletedPhases` remains empty. `implement` was never claimed and
`plan` was never added. `certification.scopeProgress` was not stamped.
`uservalidation.md` was not touched, so its Checklist, Human Acceptance Record
and all five Automation Readiness items are byte-identical; the fifth item
correctly remains unchecked because validate-owned certification did not
complete. `executionHistory` is append-only and retains all 29 prior entries
including all 7 from `bubbles.plan`. Product source, tests and
`.github/bubbles/**` were untouched. `specs/007-technical-analysis-decision-lab/`
was neither read, staged, reset nor reverted. Nothing was pushed.

