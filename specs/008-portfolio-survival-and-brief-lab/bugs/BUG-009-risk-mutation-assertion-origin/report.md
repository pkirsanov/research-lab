# Report: BUG-009 Risk Mutation Assertion Origin

## Summary

- Added one focused `assetTreatment()` carrier for unsupported holdings and
  remapped only `F008-RISK-INPUT-001` to that title.
- Proved the focused title passes on shipped source and fails under the exact
  mutation through `ERR_ASSERTION`, not `TypeError` or test infrastructure.
- Proved the strict 18-case registry passes all three outer tests, the full risk
  carrier passes `3/3`, the five BUG-008 carriers pass `43/43`, and the
  proportionate risk browser carrier passes `13/13`.
- Ran the canonical selftest. It reported `3425 passed, 1 failed` because five
  literal home-path findings remain in planning-owned command catalogs.
- The linked-test resolver also found one planning-owned browser-title mismatch.
- Preserved product source, the shared injector, the other 17 registry entries,
  BUG-007, BUG-008, and parent Feature 008 artifacts.

## Completion Statement

The owned test repair and focused regression set are implemented and executed.
The planning-owned linked title and home-path command defects are repaired. The
canonical selftest, scenario resolver, and six packet gates are green in the
current planning session. The fixed canonical G028 scanner is also green as a
diagnostic, while final downstream G028 execution still requires propagation of
canonical fix `db7b4f2` through the installer. BUG-009 remains `in_progress`;
the scope remains In Progress. The completed plan-to-test transition is closed,
and the packet routes to `bubbles.regression` for the next quality phase. Human
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