# Execution Reports

Links: [scopes.md](scopes.md) · [uservalidation.md](uservalidation.md)

## Scope 01 Canonical Ordered Sensitivity Evidence

**Phase:** test  
**Claim Source:** executed  
**Production control:** `scripts/company-intelligence-publication.mjs` changed `POLICY_CONTRACT` from `company-publication-policy/v1` to `company-publication-policy/v9` for the bounded probe only. The identical targeted command ran before and after exact restoration.

**RED-stage:** failing proof captured before restoration  
**Claim Source:** executed
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 1

```text
# Feature 028 Scope 01 production policy RED-stage
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 1
lines: 121
sha256: e643d2ba1e44fbd56ab88084d63420ebfc02d66b9088c1dea6fbbb48f939b1ee
--- first 20 ---
✖ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (12.687583ms)
✖ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims (0.9825ms)
✖ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon (0.67875ms)
✖ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue (0.456292ms)
✖ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed (0.473667ms)
✖ Privacy mutation: company owner reads reject private fields and action authority (0.382875ms)
ℹ tests 6
ℹ suites 0
ℹ pass 0
ℹ fail 6
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 63.69925

✖ failing tests:

test at tests/company-intelligence-publication.unit.mjs:225:1
✖ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (12.687583ms)
  AssertionError [ERR_ASSERTION]: {"contractVersion":"company-publication-error/v1","code":"C028-SUBJECT-POLICY","phase":"input-freeze","reason":"A validated publication policy is required.","field":"inputs.policy","causeCode":null}
--- failure-shaped lines from the omitted region ---
  AssertionError [ERR_ASSERTION]: {"contractVersion":"company-publication-error/v1","code":"C028-SUBJECT-POLICY","phase":"input-freeze","reason":"A validated publication policy is required.","field":"inputs.policy","causeCode":null}
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  AssertionError [ERR_ASSERTION]: {"contractVersion":"company-publication-error/v1","code":"C028-SUBJECT-POLICY","phase":"input-freeze","reason":"A validated publication policy is required.","field":"inputs.policy","causeCode":null}
  AssertionError [ERR_ASSERTION]: {"contractVersion":"company-publication-error/v1","code":"C028-SUBJECT-POLICY","phase":"input-freeze","reason":"A validated publication policy is required.","field":"inputs.policy","causeCode":null}
--- omitted 81 line(s); sha256 above covers the full output ---
--- last 20 ---
    operator: 'strictEqual',
    diff: 'simple'
  }

test at tests/company-intelligence-publication.unit.mjs:451:1
✖ Privacy mutation: company owner reads reject private fields and action authority (0.382875ms)
  AssertionError [ERR_ASSERTION]: {"contractVersion":"company-publication-error/v1","code":"C028-SUBJECT-POLICY","phase":"input-freeze","reason":"A validated publication policy is required.","field":"inputs.policy","causeCode":null}

  false !== true

      at TestContext.<anonymous> (file:///private/tmp/research-lab-company-intelligence-delivery/tests/company-intelligence-publication.unit.mjs:454:10)
      at async Test.run (node:internal/test_runner/test:1389:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: false,
    code: 'ERR_ASSERTION',
    actual: false,
    expected: true,
    operator: 'strictEqual',
    diff: 'simple'
  }
```

**Restoration:** the production file returned to Git object `8f0fe32c0978f05e145acfa5364b1a45996994d6` and SHA-256 `f65c329138190ad050e0aa54ba09460783ce3c5519ca9c36fa24b7efbca85231`, exactly matching the pre-probe values.

**GREEN-stage:** passing proof captured after exact restoration  
**Claim Source:** executed
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0

```text
GREEN-stage: exact production byte restoration verification
EXPECTED_GIT_OBJECT=8f0fe32c0978f05e145acfa5364b1a45996994d6
ACTUAL_GIT_OBJECT=8f0fe32c0978f05e145acfa5364b1a45996994d6
EXPECTED_SHA256=f65c329138190ad050e0aa54ba09460783ce3c5519ca9c36fa24b7efbca85231
ACTUAL_SHA256=f65c329138190ad050e0aa54ba09460783ce3c5519ca9c36fa24b7efbca85231
RESTORE_EXACT=PASS
# Feature 028 Scope 01 production policy GREEN-stage
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
lines: 14
sha256: cb1d55e95d7415a9f75466a6da7b2716e5ebe71b6f5cdc7c9863480dae11985a
--- output ---
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (24.485208ms)
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims (4.757791ms)
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon (1.240708ms)
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue (5.478958ms)
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed (5.511ms)
✔ Privacy mutation: company owner reads reject private fields and action authority (5.459459ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 92.496
```

## Scope: Planning Bootstrap — 2026-08-28

### Summary

- `bubbles.plan` created the five-scope delivery contract for Goal Contract revision 2.
- The plan covers 38 functional requirements and 22 stable scenarios.
- This report records planning evidence locations. It records no product-delivery result.

### Code Diff Evidence

The bootstrap changes planning artifacts inside the approved Feature 028 boundary. Product source, tests, runtime data, documentation, framework files, Feature 025 artifacts, and the concurrent primary checkout remain unchanged by this phase.

### Completion Statement

The planning packet defines the ordered work, tests, negative controls, acceptance questions, and evidence anchors. Implementation, product tests, delivery validation, audit, and chaos execution remain unclaimed.

### Test Evidence

Each anchor below is reserved for the specialist that executes the matching Test Plan row. The planning phase provides commands and expected assertions but does not provide product-test evidence.

#### TP-01-01

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `fdaf2fef5849698942814ea68aff574a149346d55b5c7bad1ef17b2862bfc8b4` over all 9 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (30.178583ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 75.050584
```

#### TP-01-02

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` over all 14 output lines.

```text
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (30.749708ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.252125
```

#### TP-01-03

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` over all 14 output lines.

```text
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims (6.052125ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.252125
```

#### TP-01-04

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` over all 14 output lines.

```text
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon (1.651875ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.252125
```

#### TP-01-05

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` over all 14 output lines.

```text
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue (6.887416ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.252125
```

#### TP-01-06

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` over all 14 output lines.

```text
$ node --test tests/company-intelligence-publication.unit.mjs
exit: 0
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed (6.850667ms)
✔ Privacy mutation: company owner reads reject private fields and action authority (6.286916ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 116.252125
```

#### TP-01-07

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `83af01283de8c73cf49de15ddb7e27d4aa3ea2cdf5dc4d228700a96ff68f2cbd` over all 9 output lines.

```text
$ node --test tests/company-intelligence-publication.e2e.mjs
exit: 0
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (557.604708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 612.359959
```

#### TP-01-08

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node --test tests/company-intelligence.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `14a017341ccb91e1c12a06c8eb99c785e96e4b4d5c1375e553061be5f039f03a` over all 99 output lines.

```text
✔ module source contains no second definition of a volatility or ratio metric (1.7835ms)
✔ the module holds no DOM, storage, credential, clock or timer authority (2.095541ms)
✔ the module exports a frozen api and loads under Node through module.exports (0.276209ms)
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2 (0.666375ms)
ℹ tests 91
ℹ suites 0
ℹ pass 91
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 151.07825
```

#### TP-02-01

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `0af0f710d4d8e64e42d59b4fc608d2dd8ddaf96e68ea5701d2b8d50ef73b08a8` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (32.1265ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (252.568291ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (87.608ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (53.4575ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (104.3895ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 603.561542
```

#### TP-02-02

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `cb2c9ce7bf9dfa781c4abc889f34b9304e0a7149e9bfa91df9dbf7cdb1b8f718` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (32.52025ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (230.805959ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (98.647ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (53.922916ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (107.350542ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 576.099875
```

#### TP-02-03

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `1a5f4cfa667796382c4ce3cbee737cf01ab6407cb28e7827ad0708c797cbf00d` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (32.379084ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (247.823208ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (97.922041ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (54.840792ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (106.105333ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 599.063542
```

#### TP-02-04

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `a04e0a2d1b7321e6054fdcf0cde0fc5b429634809f4bb23b793adf4a0607f1a0` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (31.525833ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (223.448042ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (89.742166ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (49.566334ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (92.822875ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 537.626
```

#### TP-02-05

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `7011865b62f2146aeb0845cdf14b65c9468158bfebe547f773a213c4bb26e7cd` over all 10 output lines.

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (620.377042ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1643.137125ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2309.138208
```

#### TP-02-06

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/distributed-briefs.distributed-publish.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `9de598870fe77d90b506e633e40a2e8d74e5efc6cc092e34e8ef1a35f3bc56e2` over all 12 output lines.

```text
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (35.128292ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (24.496208ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (11.66525ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (38.828667ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 200.109333
```

#### TP-03-01

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `a74e4f7a4d09b5e56798233f339ba74c68ccb5ec86931d51472e4c9c44ca4e83`
**Input closure:** production SHA-256 `ad0759cf3e754f91a5ffcfc67bd9e1e275a2d950835af3b1a7e22855adb1dc2a`
**Input closure:** brief primitive SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3`
**Input closure:** integration test SHA-256 `a7eea89c46255de8634e07505b65dc3b93fb77bc6354d9cb3cd32e51d6513c3b`
**Result:** 8 tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Scenario result:** SCN-028-015 restored both checkout baselines. It removed the unpublished company version and retained the private validated checkpoint.
**Authority result:** The remote ref and prior company-and-brief pair remained unchanged.

#### TP-03-02

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `80542df06701ffd9064d3c4f645f02c1be4ba4cf8fe2c6e5c76aef7b16e3babf`
**Input closure:** production SHA-256 `ad0759cf3e754f91a5ffcfc67bd9e1e275a2d950835af3b1a7e22855adb1dc2a`
**Input closure:** brief primitive SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3`
**Input closure:** integration test SHA-256 `a7eea89c46255de8634e07505b65dc3b93fb77bc6354d9cb3cd32e51d6513c3b`
**Result:** 8 tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Scenario result:** SCN-028-016 restored the valid brief baseline after company validation failed.
**Authority result:** No company pointer or final brief from the failed generation became authoritative.

#### TP-03-03

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `3c6dcd7d22ec44a20cd5fdea1624a32a633085b6d3c3de5ab05cc1b41b5e9d14`
**Input closure:** production SHA-256 `ad0759cf3e754f91a5ffcfc67bd9e1e275a2d950835af3b1a7e22855adb1dc2a`
**Input closure:** brief primitive SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3`
**Input closure:** integration test SHA-256 `a7eea89c46255de8634e07505b65dc3b93fb77bc6354d9cb3cd32e51d6513c3b`
**Result:** 8 tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Scenario result:** SCN-028-017 failed the synthetic second subject by name.
**Authority result:** Zero covered-subject pointers and zero brief artifacts advanced. The committed policy remained `company:msft` only.

#### TP-03-04

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `84b41e6ed7bdd8d17b9d5b076c02719ff6536588f90bc031bcac7be800d26e4c`
**Input closure:** production SHA-256 `ad0759cf3e754f91a5ffcfc67bd9e1e275a2d950835af3b1a7e22855adb1dc2a`
**Input closure:** brief primitive SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3`
**Input closure:** process test SHA-256 `96631317f1fb9a9d09151db85f71c7f1a969fecc1bdcbeab641ce5abda67b566`
**Result:** 4 process tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Scenario result:** SCN-028-022 compared both checkout inventories, both index trees, both heads, all captured bytes, and the bare remote ref.
**Cleanup result:** The completed dry run removed the private transaction directory and published no candidate.

#### TP-03-05

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `6c6a49ee91c7e7d98d856660b947db61a9507a785629923964b8ac44213900e3`
**Input closure:** production SHA-256 `ad0759cf3e754f91a5ffcfc67bd9e1e275a2d950835af3b1a7e22855adb1dc2a`
**Input closure:** brief primitive SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3`
**Input closure:** process test SHA-256 `96631317f1fb9a9d09151db85f71c7f1a969fecc1bdcbeab641ce5abda67b566`
**Result:** 4 process tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Commit result:** A real rejected pre-commit restored both checkouts. An index missing the coupled selector also refused before commit.
**Remote result:** Rejected push, unknown outcome, ancestry reconciliation, failed private receipt, and receipt reconstruction retained one exact commit.

#### TP-03-06

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Structured receipt:** stdout SHA-256 `945023b510bf0457ea8f8eef1bb0e4062633269709acdc55c49ecf90e1045c17`
**Input closure:** worker SHA-256 `3d763d61808bde06b3a8993d7955f74ad412a557402f90388e3067bb92ff843a`
**Input closure:** support SHA-256 `1c980cb3a0ae106bef240602a07fc73654333e79bad88d29cbd2a93c0fdea2ac`
**Input closure:** canary SHA-256 `1b12dd7f3d12d8b033bf2c706ef3bde9ffe2a328f8785c5b0d4b2108748ccb0e`
**Result:** 42 tests passed. Zero tests failed, skipped, cancelled, or remained todo.
**Canary result:** The existing worker restored every prior company and brief owned path after the coupled injected failure.
**Isolation result:** The suite used temporary repositories and left no fixture or process residue.

#### TP-04-01

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-01`
**Full-output SHA-256:** `740e716e798445bbe48c9854fae67fedb3de0eea5da621b41d5d46352fde987a`
**Result:** The exact TP-04-01 command passed all 8 tests. The named scheduled-publication scenario passed through the shared launcher, real Git checkouts, and a bare remote.
**Output:**

```text
✔ Regression E2E: SCN-028-003 scheduled publication commits one MSFT version and its consuming brief (6014.798667ms)
✔ Regression E2E: SCN-028-004 on-demand and scheduled triggers execute the same phase and acknowledgment contract (53726.660416ms)
✔ Regression E2E: SCN-028-012 identical retry resumes one remote generation and refuses divergent content (63204.362542ms)
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (741.33ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1988.37ms)
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical (1905.955958ms)
✔ Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief (955.54775ms)
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit (8674.314917ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 137271.507166
```

#### TP-04-02

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-02`
**Full-output SHA-256:** `a6a97b1456138804c9449a04b433a73ad5ae7aa18935bf0950770b0474938432`
**Result:** The exact TP-04-02 command passed all 8 tests. The named parity test proved scheduled and on-demand trigger identity is the only contract difference.
**Output:**

```text
✔ Regression E2E: SCN-028-003 scheduled publication commits one MSFT version and its consuming brief (6321.340041ms)
✔ Regression E2E: SCN-028-004 on-demand and scheduled triggers execute the same phase and acknowledgment contract (21054.798708ms)
✔ Regression E2E: SCN-028-012 identical retry resumes one remote generation and refuses divergent content (19464.904625ms)
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (566.013625ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1864.420875ms)
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical (1861.7255ms)
✔ Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief (940.318209ms)
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit (9749.806208ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 61882.944417
```

#### TP-04-03

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-03`
**Full-output SHA-256:** `2af9012e9fa92d20e7c5c9da93baf18857daba4175bb53fd6b0fe064846e6c81`
**Result:** The exact TP-04-03 command passed all 8 tests. The retry test reused one exact commit and refused divergent checkpoint content.
**Output:**

```text
✔ Regression E2E: SCN-028-003 scheduled publication commits one MSFT version and its consuming brief (4864.361792ms)
✔ Regression E2E: SCN-028-004 on-demand and scheduled triggers execute the same phase and acknowledgment contract (21208.301042ms)
✔ Regression E2E: SCN-028-012 identical retry resumes one remote generation and refuses divergent content (20264.096333ms)
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (754.203833ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (2295.141708ms)
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical (2742.361292ms)
✔ Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief (1079.09225ms)
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit (9239.727375ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62516.176708
```

#### TP-04-04

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/company-intelligence-publication.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-04`
**Full-output SHA-256:** `9fadd05453b10378e1f11f7027410ca8ec3dd2e19764bee79fcbfc35999cd3cb`
**Result:** Registry order, participant addition/removal, metadata fingerprint, source fingerprint, evidence cutoff, self-cycle, and final-brief-cycle controls all retained zero authority.
**Output:**

```text
To /var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T/research-lab-bug002-flp0wh/remote.git
 * [new branch]      main -> main
✔ Mutation: SCN-028-019 registry order fingerprint participant and dependency cycle drift each abort publication (7786.425ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7851.469625
```

#### TP-04-05

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/distributed-briefs.scheduler.unit.mjs tests/distributed-briefs.scheduler.integration.mjs tests/distributed-briefs.scheduler-failures.integration.mjs tests/distributed-briefs.scheduler.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-05`
**Full-output SHA-256:** `9cce8125ed4d4cb6959104b785d248d95e7af5f251e842d6e404e6b2584023e9`
**Result:** The unreduced four-file scheduler matrix passed 9 tests with no failures or skips.
**Output:**

```text
✔ calendar source cutoff read author budget final history and publish faults preserve prior pointers (1767.99175ms)
✔ duplicate concurrent commit push crash and rollback paths remain idempotent (1483.743125ms)
✔ Regression: SCN-002-010 evidence then owners then all briefs then final then atomic publish commit and push (644.324875ms)
✔ Regression: SCN-002-011 every required-phase failure leaves prior current authority unchanged (851.1055ms)
✔ Regression: SCN-002-012 duplicate and push-only retries reuse exact bytes and preserve dirty root (852.058875ms)
✔ scheduler publishes one exact run through isolated worktree commit and temporary remote (663.651542ms)
✔ Regression canary: existing due windows locks failures and scheduler process behavior remain intact (866.850291ms)
✔ SCN-002-010: run state permits only evidence freeze reads authors final publish commit and push order (0.441667ms)
✔ SCN-002-010: manifest inventory and pointer-last generation share one run identity (2.486042ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3315.543583
```

#### TP-04-06

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** `node --test tests/brief-refresh-atomicity.test.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Structured receipt:** `.specify/runtime/tool-calls.jsonl`, tag `TP-04-06`
**Full-output SHA-256:** `644fc6bf452cb16f57d50ae7d6709cd00826b03e31c0046b1bd691141101e21b`
**Result:** The unreduced transaction canary passed 43 tests, including both Scope 04 atomicity canaries, with no failures or skips.
**Output:**

```text
✔ scheduled launcher reports a rejected final push as a failed run (3343.06575ms)
✔ scheduled launcher converges after two transient push rejections (3203.531917ms)
✔ staged owned publication path refuses without changing its index entry (621.292333ms)
✔ untracked owned data path refuses before every external boundary (580.308333ms)
✔ invalid clean baseline refuses before every external boundary (867.880917ms)
✔ invalid brief baseline still publishes validated ticker cache when narrative cannot advance (2212.384042ms)
✔ explicit repair mode replaces an invalid baseline only with a final-valid matching pair (2618.556375ms)
✔ scheduled launcher automatically repairs an invalid baseline through a final-valid pair (2936.084333ms)
✔ unrelated staged and unstaged dirt remains byte and index identical (1994.812416ms)
✔ REG-019-004 corrupted post-build page blocks before staging and restores every owned baseline byte (2864.396292ms)
✔ Regression canary: existing brief atomicity restores every prior owned path under coupled fault injection (2796.507083ms)
✔ Regression canary: brief atomicity remains intact after shared launcher and worker integration (2123.709042ms)
ℹ tests 43
ℹ suites 0
ℹ pass 43
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 89405.3415
```

#### Scope 04 r9 Scenario Receipts

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Claim Source:** executed
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Carrier:** `.specify/runtime/tool-calls.jsonl`
**Receipt contract:** Each scenario has one failing `red` receipt and one passing `implement` receipt with the same exact test identity and negative control. Every receipt binds 69 deduplicated current input files and production implementation references.

| Scenario | RED SHA-256 | Current implement SHA-256 | Control |
| --- | --- | --- | --- |
| SCN-028-003 | `8aa34a0aa605a579c84ac4532477396040746cef81567bb976cb5b13188c8af5` | `a7053ef8a96c5c40439f8e129c843dd9d325428324d4ce588e498968dfc6b57d` | `drop-final-company-binding` |
| SCN-028-004 | `f88d05cfa2ca5a839390bfbf76d051879dccd7497183446e20b42d6d2debe21f` | `6bbf006e1f2bed3bfa75d526084b28cc233b35f9e4e96f438ca5d30841c056dc` | `bypass-shared-lease` |
| SCN-028-012 | `68fc29c196a2757d42c2815667436d02d561ba26a855a43d3729906f419ec985` | `a6261499bc3d99fadf80a6fa1e32ec38f399bbd2c505ea21bf674e4ad9f22349` | `discard-interrupted-parent` |
| SCN-028-019 | `0eeab387379ffa56572362e7cdb62efd134c9ec6c9431bd699cc59b07fbd51e0` | `269c5ce33c87df03eee3021c2dab159acde2120647ff66414f505187d68f2d46` | `bypass-final-boundary` |

**Receipt-audit command:** Fresh r9 scenario closure assertion over `.specify/runtime/tool-calls.jsonl` and every declared input hash.
**Exit Code:** 0
**Claim Source:** executed
**Receipt-audit SHA-256:** `06b582dc230887ad9b3d81d287bdf32717f5a8890a56f450c86193cf7cce3c42`

```text
RECEIPT_PAIR scenario=SCN-028-003 redExit=1 implementExit=0 inputs=69 revision=32289ee5b985 testIdentity=exact control=exact implRefs=6
RECEIPT_PAIR scenario=SCN-028-004 redExit=1 implementExit=0 inputs=69 revision=32289ee5b985 testIdentity=exact control=exact implRefs=4
RECEIPT_PAIR scenario=SCN-028-012 redExit=1 implementExit=0 inputs=69 revision=32289ee5b985 testIdentity=exact control=exact implRefs=4
RECEIPT_PAIR scenario=SCN-028-019 redExit=1 implementExit=0 inputs=69 revision=32289ee5b985 testIdentity=exact control=exact implRefs=4
SCENARIO_RECEIPT_COUNT=8
SCENARIO_RECEIPT_STALE=0
SCENARIO_RECEIPT_UNKNOWN=0
SCOPE04_SCENARIO_RECEIPT_AUDIT=PASS
```

#### Scope 04 r9 Regression and Impact

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Claim Source:** executed
**Commands:** TP-04-01 through TP-04-06 exactly as declared, plus the certified Scope 01-03 canary matrix.
**Exit Code:** 0 for every exact Test Plan command and the canary matrix.
**Canary full-output SHA-256:** `f1c71e7c3bc70a6d3e97a58415d0d9f9ed1e37fd4321d47f7858ed958a78c7c2`
**Consumer sweep SHA-256:** `9e70264c38ad8f4ac6bf3b9bc41bf5bfd8aa38b1409eea7a1c7f342f2bcc336f`
**Result:** The scheduler canary passed 9 tests. The atomicity canary passed 43 tests. The certified-scope matrix passed 109 tests. All reported zero failed, cancelled, skipped, and todo tests.
**Shared-impact result:** Due windows, locks, failures, process cleanup, transaction restoration, content addressing, and pointer-last behavior stayed green.
**Consumer-impact result:** Prompt, launchd template, launcher parser, worker dispatch, engine CLI, four controls, and three canary surfaces resolved to one shared path with zero stale first-party references.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (56.648042ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (265.345792ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (90.182833ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (53.1425ms)
✔ Regression: SCN-028-015 brief validation failure removes company candidates and restores both baselines (445.77925ms)
✔ Regression: SCN-028-016 company validation failure with a valid brief restores both baselines (456.5035ms)
✔ Mutation: SCN-028-017 one failing subject aborts a synthetic two-subject covered set (463.144292ms)
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2 (0.586792ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (20.623625ms)
ℹ tests 109
ℹ suites 0
ℹ pass 109
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1999.016625
```

#### Scope 04 r9 Boundary and Preservation

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Command:** Strict Node boundary and preservation assertion against base `812f4ff73afd98f7e2750fd811dd4d3516dd8d5a` and checkpoint `32289ee5b985e16c055e2cb3b22c0aed90964981`.
**Exit Code:** 0
**Claim Source:** executed
**Full-output SHA-256:** `dd2085889412022829ead4b8abd0309aa486eb80deaee49ba2768f7d10fa2276`
**Result:** The checkpoint contained exactly 13 expected paths. Certification, human acceptance, Scope 05, Feature 025, and framework-managed paths were unchanged. The working tree contained only `.bubbles-worktree`.

```text
HEAD=32289ee5b985e16c055e2cb3b22c0aed90964981
WORKTREE_STATUS_COUNT=1
WORKTREE_STATUS=?? .bubbles-worktree
STAGED_PATH_COUNT=0
CERTIFICATION_PRESERVED=true completedScopes=01-company-publication-foundation,02-coupled-manifest-and-promotion,03-transaction-restoration
UNCERTIFIED_SCOPE_STATUS scope04=not_started scope05=not_started
HUMAN_ACCEPTANCE_PRESERVED=true object=91f5e95a74ae93e9ff0764104b4e03113854baa7
SCOPE05_BLOCK_PRESERVED=true
PRESERVED_PATHSPEC exit=0 pathspec=specs/025-*
PRESERVED_PATHSPEC exit=0 pathspec=.github/bubbles/**
PRESERVED_PATHSPEC exit=0 pathspec=.github/agents/bubbles*
PRESERVED_PATHSPEC exit=0 pathspec=.github/instructions/bubbles-*
PRESERVED_PATHSPEC exit=0 pathspec=.github/skills/bubbles-*
PRESERVED_PATHSPEC exit=0 pathspec=.github/prompts/bubbles.*
DIFF_CHECK_EXIT=0
EXPECTED_PATH_COUNT=13
ACTUAL_PATH_COUNT=13
UNEXPECTED_PATH_COUNT=0
MISSING_PATH_COUNT=0
SCOPE04_PREWRITE_BOUNDARY_RESULT=PASS
```

#### Scope 04 r9 Build Quality and Governance

**Phase:** implement
**Executed:** YES (fresh r9 session)
**Claim Source:** executed
**Syntax/static Exit Code:** 0, full-output SHA-256 `7ea2f6d96e4f0218724077e95d48817a891baffdb709f432d91f966c95f710e1`
**Regression-quality Exit Code:** 0, full-output SHA-256 `e308fd82a88d1a3ae29929d4130b5c992bea7f30a9b83be38abc7b42e44ce199`
**Source-lock Exit Code:** 0, full-output SHA-256 `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1`
**Environment-isolation Exit Code:** 0, full-output SHA-256 `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61`
**Implementation-reality Exit Code:** 0, full-output SHA-256 `108210fa5954b9377858a08932a8fb35bedb2383bb5982077ec0271c875e4b63`
**Scenario obligation/mechanism Exit Code:** 0, full-output SHA-256 `ea30b0cd0f5da731a5ddc64b46d98235afeb129e8ce787901594f3d8a8dbc4fb`
**Goal contract/fidelity Exit Code:** 0, full-output SHA-256 `74236f10776b4415f92304d65f8a870655a54ddd4cc8bd4ea9e21c51241d4c0d`
**Exact-title/Test Plan/DoD parity Exit Code:** 0, full-output SHA-256 `a2cd7f2068158d5ea2d1603325c21bec361692269a22a733e2c74f8de6520d4a`
**Fixture/process cleanup Exit Code:** 0, full-output SHA-256 `1cad922b35c621f4d1ef26a68883c8f196819ae70fec86a641005e77cb23c1a0`

```text
NODE_CHECK file=scripts/brief-distributed-publish.mjs exit=0
NODE_CHECK file=scripts/company-intelligence-publication.mjs exit=0
NODE_CHECK file=tests/brief-refresh-atomicity.test.mjs exit=0
NODE_CHECK file=tests/company-intelligence-publication.e2e.mjs exit=0
NODE_CHECK file=tests/company-intelligence-publication.functional.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler.e2e.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler.integration.mjs exit=0
BASH_SYNTAX file=scripts/brief-refresh-and-push.sh exit=0
BASH_SYNTAX file=scripts/brief-refresh-scheduled.sh exit=0
PLUTIL file=scripts/com.researchlab.brief-refresh.plist exit=0
SHELLCHECK files=2 exit=0
PASS: the scanned surface is WSL+macOS portable.
MACOS_PORTABILITY files=2 exit=0
SCOPE04_STATIC_CHECK_FAILURES=0
SCOPE04_STATIC_CHECKS_END
```

**Diagnostic command:** `node scripts/selftest.mjs`
**Diagnostic Exit Code:** 1
**Diagnostic Claim Source:** interpreted
**Interpretation:** The bounded selftest reported 3459 passes and 9 failures. Its failure lines named one not-yet-authored Scope 05 test-reference class and eight Feature 025/027 assertions whose owner files were unchanged from the Scope 04 base. The executed attribution check returned `SELFTEST_SCOPE04_ATTRIBUTION=NONE` with SHA-256 `9d75fac0d5814ef906f28196f7b519d983709738c465c084b940c2f3c20f6cdf`. This diagnostic is not recorded as a repository-wide pass and does not claim Scope 05.
**Diagnostic full-output SHA-256:** `177d74804fd4bbe901673ecb7c44a87b81f80240772fa934d0b83e1a7e08b437`

#### TP-05-01

Planned evidence for public catalogue, navigation, route, and notes reachability.

#### TP-05-02

Planned evidence for stale exclusion and missing package dependency mutation controls.

#### TP-05-03

Planned evidence for failed-refresh authority separation in the browser.

#### TP-05-04

Planned evidence for real `file://` committed first paint and private-state exclusion.

#### TP-05-05

Planned evidence for the built Pages artifact and every selector-referenced dependency.

#### TP-05-06

Planned evidence for existing route, discovery, deep-link, authority, accessibility, and responsive regressions.

#### TP-05-07

Planned evidence for shared experience, brief payload, registration, exclusion, and consumer parity validators.

#### TP-05-08

Planned evidence for the broader Node and browser regression set on the final unchanged tree.

### Validation Evidence

No delivery validation claim is recorded by `bubbles.plan`. This section belongs to `bubbles.validate` during execution.

### Audit Evidence

No delivery audit claim is recorded by `bubbles.plan`. This section belongs to `bubbles.audit` during execution.

### Chaos Evidence

No chaos execution claim is recorded by `bubbles.plan`. This section belongs to `bubbles.chaos` during execution.

## Scope: 01 Company publication foundation — Implement — 2026-08-29

### Summary

Scope 01 adds the v2 covered-subject policy, additive UMD publication contracts, the powerless company-plan author lane, the private-candidate production CLI, one real company owner read, and persistent unit, integration, process, privacy, and compatibility regressions. Public registration, pointer promotion, brief publication, scheduler integration, and UI activation remain absent from this scope by design.

### Code Diff Evidence

The implementation surface contains exactly nine product and test paths: `company-intelligence.config.json`, `config/domain-model.yaml`, `rlcompanyintel.js`, `scripts/brief-author.mjs`, `scripts/company-intelligence-publication.mjs`, `tests/company-intelligence.unit.mjs`, `tests/company-intelligence-publication.unit.mjs`, `tests/company-intelligence-publication.integration.mjs`, and `tests/company-intelligence-publication.e2e.mjs`.

The process E2E bounds every child process at 30 seconds. It captures source-checkout status plus source pointer and brief bytes before execution. It proves those three values are unchanged after `prepare`, `bind-plan`, `inject-owner-read`, and the refused `promote` command.

### Scope 01 RED/GREEN Provenance

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `scripts/red-green-probe.sh --file company-intelligence-lab.html --find '"contractVersion": "company-intelligence-config/v1"' --replace '"contractVersion": "company-intelligence-config/v9"' --label 'Feature 028 Scope 01 v1 cache compatibility sensitivity' --bound 300 -- node --test tests/company-intelligence.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Provenance:** This is a current-session self-reverting mutation-sensitivity proof. No pre-implementation failing run was found in the current session log, so this evidence is not described as a pre-fix execution.  
**Capture:** `b2fd4c0d62a52a070d6c3864388c0eb061a9929a07f14d62672edfa06715c9f7` over all 12 output lines.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            Feature 028 Scope 01 v1 cache compatibility sensitivity
file:             company-intelligence-lab.html
mutation:         "contractVersion": "company-intelligence-config/v1"  ->  "contractVersion": "company-intelligence-config/v9"   (1 occurrence(s))
command:          node --test tests/company-intelligence.unit.mjs
red-exit:         1
red-summary:        'test failed'
green-exit:       0
green-summary:    ℹ duration_ms 134.845917
revert-verified:  yes (committed=aca44ec5d20f47841f56e0fcbeb46741334aa382 restored=aca44ec5d20f47841f56e0fcbeb46741334aa382)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### Scope 01 Contract and Boundary Evidence

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** strict Scope 01 changed-path audit over `git status --porcelain=v1 --untracked-files=all`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `1d58346ce25b80d4e76b5170f548c488cd8b178f07b8f1abcf32e32901d1b011` over all 27 output lines.

```text
STRICT_SCOPE_01_BOUNDARY_BEGIN
SCOPE01_ALLOWED=company-intelligence.config.json
SCOPE01_ALLOWED=config/domain-model.yaml
SCOPE01_ALLOWED=rlcompanyintel.js
SCOPE01_ALLOWED=scripts/brief-author.mjs
SCOPE01_ALLOWED=tests/company-intelligence.unit.mjs
PREEXISTING_WORKTREE_CONTROL=.bubbles-worktree
SCOPE01_ALLOWED=scripts/company-intelligence-publication.mjs
SCOPE01_ALLOWED=tests/company-intelligence-publication.e2e.mjs
SCOPE01_ALLOWED=tests/company-intelligence-publication.integration.mjs
SCOPE01_ALLOWED=tests/company-intelligence-publication.unit.mjs
WORKTREE_CONTROL_IDENTITY=PASS
SCOPE01_ALLOWED_COUNT=9
FEATURE028_ARTIFACT_COUNT=8
PREEXISTING_CONTROL_COUNT=1
FEATURE025_CHANGED_COUNT=0
UNRELATED_CHANGED_COUNT=0
STRICT_SCOPE_01_BOUNDARY_RESULT=PASS
STRICT_SCOPE_01_BOUNDARY_END
```

The `.bubbles-worktree` control marker records `createdAt: 2026-08-28T13:45:28Z`, before Feature 028 creation at `2026-08-28T23:01:02Z`. The boundary command classifies it separately from implementation artifacts and verifies its session identity.

### Scope 01 Implement-Owned Quality Evidence

**Phase:** implement  
**Claim Source:** executed

| Command | Exit | Executed result | Full-output capture |
| --- | ---: | --- | --- |
| `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 passed, 0 failed, 0 skipped | `282c6e30b82015fda7ada45ada9bec200ae581933a0b23e772a13d08d712ff47` |
| `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 1 passed, 0 failed, 0 skipped | `fdaf2fef5849698942814ea68aff574a149346d55b5c7bad1ef17b2862bfc8b4` |
| `node --test tests/company-intelligence-publication.e2e.mjs` | 0 | 1 passed, 0 failed, 0 skipped | `83af01283de8c73cf49de15ddb7e27d4aa3ea2cdf5dc4d228700a96ff68f2cbd` |
| `node --test tests/company-intelligence.unit.mjs` | 0 | 91 passed, 0 failed, 0 skipped | `14a017341ccb91e1c12a06c8eb99c785e96e4b4d5c1375e553061be5f039f03a` |
| Brief-author shared-surface canary matrix | 0 | 5 passed, 0 failed, 0 skipped | `de5a191f8d7e2a5c39d5eb4e7a2e3b25841530e4899e8353b7640de8119dd79c` |
| Warning-free distributed-bundle canary | 0 | 3 passed, 0 failed, 0 skipped | `53f80db0d2d6b4df1d57aa83df740a2546c91696e1131592059daf3bf00008bc` |
| `node scripts/validate-node-source-lock.mjs` | 0 | Actual source lock passed; 16 adversarial mutations rejected | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Changed JS/MJS and JSON parse checks | 0 | 8 files parsed; 0 failures | `3b5512449324977c42b5c7a2416a9654aea95b93112e5deb4a441649b0001dea` |
| New-test anti-mock scan | 0 | 0 interception or mock-framework matches | `7e6b875940cd9fc0377544c911db4e18905fc83580ec52d659169c110f31be72` |
| New-test silent-pass guard | 0 | 0 violations; 0 warnings | `d4343e754eb2581ace2ab4e58f1bc1c52c8a41eff1ca07d6e046924010e0fc44` |
| Test-mechanism lint | 0 | 22 declared mechanisms coherent | `796e7eae922225a7c8d9252387e0051b698195dc5462834cd979c16af0f0ec88` |
| Environment-pollution scan | 0 | No test-to-production write detected | `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61` |
| Domain-invariant correspondence | 0 | 6 declared invariants anchored | `dc08a6036cd1bff84037c34ff3ecfad8e273d03c17df5cf0ea333017bc0d0457` |
| Domain-model consistency | 0 | Feature declarations consistent with shared model | `1650f6d349fdff760d20bc3e7dced3fd3f9653b85be47e09c05d4739ac456b32` |
| Change hygiene | 0 | 0 whitespace errors and 0 incomplete markers | `c45e0eb9ca2e026a472b2b7d655bdcbec84499a15d50337e0694c7fcc701a791` |
| Implementation reality scan | 0 | 0 violations; one file-discovery fallback warning | `50fb939a25a90e7be6fb6659878f7eeeda463722c04f2cab83c50bc5c895df7e` |
| Artifact lint before evidence update | 0 | Artifact lint passed | `40054627ee759c118d599693cb399528ef26d4f34bf28e09e3cbc6295930c25b` |

**Current literal bounded verification — `VAL-028-S01-CORE-EVIDENCE`:**

**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `5251f9ebafaee1bed63139fe96f939d527c83f93733f10e964c9ea9d7e55996a` over all 107 output lines.

```text
# VAL-028-S01 implement-owned Scope 01 foundation and Feature 025 compatibility
$ node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs
exit: 0
lines: 107
sha256: 5251f9ebafaee1bed63139fe96f939d527c83f93733f10e964c9ea9d7e55996a
--- first 20 ---
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (671.097291ms)
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (43.821041ms)
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (39.7825ms)
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims (6.906625ms)
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon (1.30275ms)
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue (5.76875ms)
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed (6.114375ms)
✔ Privacy mutation: company owner reads reject private fields and action authority (5.559208ms)
✔ coverage account holds one row per registry dimension and totals sum to the registry length (5.500375ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (1.028458ms)
✔ every one of the five evidence states is produced by a real adapter outcome (1.243833ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (3.301ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (1.369333ms)
✔ an unavailable dimension never renders as a zero or a neutral number (2.377166ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (0.53975ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (1.333ms)
✔ every claim cites a value present in its own horizon input set (3.227625ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (1.469208ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (2.396875ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (2.378333ms)
--- omitted 67 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.0645ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (0.817125ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (1.672292ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (0.644458ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.129125ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (1.643458ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (0.998125ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (0.361458ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (1.407167ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (0.544709ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (2.896416ms)
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2 (0.6655ms)
ℹ tests 99
ℹ suites 0
ℹ pass 99
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 719.816917
```

**Executed:** YES (current session)
**Command:** `node --trace-warnings --test tests/distributed-briefs.authorship.unit.mjs tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.distributed-publish.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `cd68d2e24faf20c1bc4f9e737d2b39c7cde7c9d3c944bb139b4d1075ea802a06` over all 16 output lines.

```text
# VAL-028-S01 implement-owned shared-author and downstream-consumer canaries
$ node --trace-warnings --test tests/distributed-briefs.authorship.unit.mjs tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.distributed-publish.unit.mjs
exit: 0
lines: 16
sha256: cd68d2e24faf20c1bc4f9e737d2b39c7cde7c9d3c944bb139b4d1075ea802a06
--- output ---
✔ Regression: SCN-002-004 every registry source read reaches one truthful validated brief outcome (9.768917ms)
✔ Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn (2.298375ms)
✔ Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts (0.783292ms)
✔ SCN-002-004: brief validation binds recommendations to eligible owner evidence (2.109625ms)
✔ SCN-002-005: compaction honors exact profile caps and stable whole-fact priority (1.555833ms)
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (34.517334ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (21.002667ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (11.570291ms)
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.054542
```

**Executed:** YES (current session)
**Command:** bounded classifier over `git diff --name-status HEAD^..HEAD`, `git status --short --untracked-files=all`, and the exact Scope 01 allowed, Feature 028 artifact, current shared-consumer canary, Feature 025 immutable, worktree-control, and excluded path families
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `0828f8c5c5bc4d7b1809f0605462f173fe1765cfc96fdebf2bbe97b9b9be6069` over all 56 output lines.

```text
# VAL-028-S01 implement-owned changed-path and excluded-family classification
exit: 0
lines: 56
sha256: 0828f8c5c5bc4d7b1809f0605462f173fe1765cfc96fdebf2bbe97b9b9be6069
--- first 20 ---
CHECKPOINT_COMMIT_DELTA_BEGIN
M       company-intelligence.config.json
M       config/domain-model.yaml
M       rlcompanyintel.js
M       scripts/brief-author.mjs
A       scripts/company-intelligence-publication.mjs
A       specs/028-company-intelligence-publication-and-brief-transaction/design.md
A       specs/028-company-intelligence-publication-and-brief-transaction/report.md
A       specs/028-company-intelligence-publication-and-brief-transaction/scenario-manifest.json
A       specs/028-company-intelligence-publication-and-brief-transaction/scopes.md
A       specs/028-company-intelligence-publication-and-brief-transaction/spec.md
A       specs/028-company-intelligence-publication-and-brief-transaction/state.json
A       specs/028-company-intelligence-publication-and-brief-transaction/test-plan.json
A       specs/028-company-intelligence-publication-and-brief-transaction/uservalidation.md
A       tests/company-intelligence-publication.e2e.mjs
A       tests/company-intelligence-publication.integration.mjs
A       tests/company-intelligence-publication.unit.mjs
M       tests/company-intelligence.unit.mjs
CHECKPOINT_COMMIT_DELTA_END
CURRENT_WORKTREE_DELTA_BEGIN
--- omitted 16 line(s); sha256 above covers the full output ---
--- last 20 ---
CHANGED_PATH_CLASS=FEATURE028_ARTIFACT PATH=specs/028-company-intelligence-publication-and-brief-transaction/state.json
CHANGED_PATH_CLASS=FEATURE028_ARTIFACT PATH=specs/028-company-intelligence-publication-and-brief-transaction/test-plan.json
CHANGED_PATH_CLASS=FEATURE028_ARTIFACT PATH=specs/028-company-intelligence-publication-and-brief-transaction/uservalidation.md
CHANGED_PATH_CLASS=SCOPE01_IMPLEMENTATION_OR_TEST PATH=tests/company-intelligence-publication.e2e.mjs
CHANGED_PATH_CLASS=SCOPE01_IMPLEMENTATION_OR_TEST PATH=tests/company-intelligence-publication.integration.mjs
CHANGED_PATH_CLASS=SCOPE01_IMPLEMENTATION_OR_TEST PATH=tests/company-intelligence-publication.unit.mjs
CHANGED_PATH_CLASS=SCOPE01_IMPLEMENTATION_OR_TEST PATH=tests/company-intelligence.unit.mjs
CHANGED_PATH_CLASS=CURRENT_SHARED_CONSUMER_CANARY PATH=tests/distributed-briefs.distributed-publish.unit.mjs
CHANGED_PATH_CLASS=WORKTREE_CONTROL PATH=.bubbles-worktree
CHANGE_BOUNDARY_BASE=b4dbe7bf83e69f9a2c2a75f8377178859396c3d7
CHANGE_BOUNDARY_HEAD=5f5caf16ac914bae67b990cc40bd7d1e025250c3
CHANGED_PATH_UNIQUE_COUNT=19
SCOPE01_IMPLEMENTATION_OR_TEST_COUNT=9
FEATURE028_ARTIFACT_COUNT=8
SHARED_CONSUMER_CANARY_PATH_COUNT=1
WORKTREE_CONTROL_PATH_COUNT=1
FEATURE025_SPEC_ARTIFACT_CHANGED_COUNT=0
FEATURE025_IMMUTABLE_FAMILY_CHANGED_COUNT=0
EXCLUDED_FAMILY_COUNT=0
CHANGE_BOUNDARY_RESULT=PASS
```

The broad regression-quality scan also returned exit 1 with 15 matches in the pre-existing Feature 025 security test region of `tests/company-intelligence.unit.mjs`. Every reported match is an adversarial `.innerHTML` detector or mutation fixture. The changed compatibility canary contains none of those matches. The guard rerun against all three new Scope 01 files returned exit 0 with zero violations and zero warnings.

### Canonical Selftest Classification

**Phase:** implement  
**Executed:** YES (current session)  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** executed  
**Result:** FAIL, preserved without weakening any assertion.  
**Capture:** `00851a019c47cc413270f9bcaae54a85d5f4f4b6b8344c754b117852c27303c6` over all 3,969 output lines.

```text
✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline; planned-not-authored paths remain visible non-failing debt (2 new, 0 planned, 70 known-missing, 0 stale of 275 referenced)
✗ FAIL: TP-025-01: the committed coverage registry declares exactly the fifteen mandatory dimensions and four horizons
✗ FAIL: TP-025-08: every one of the module’s 31 exported functions has a caller inside the route (readPublicationPolicy, normalizeOwnerDimensionRead, validateResearchPlanV2, buildReadVersionV2, validateReadVersionV2, buildCompanyToolModelRead, validateCompanyToolModelRead)
✗ FAIL: Feature 027 Scope 3: the shipped registry holds fifteen rows partitioned into four subject-carrying, seven bare-with-a-reason and four ownerless, and every linked row declares exactly one of the two fields (15 rows, 6/4/5, misdeclared: none)
✗ FAIL: Feature 027 Scope 3: a linked row declaring neither field, one declaring both, a reason outside the closed enum and a reason with no owner route each raise C025-CONFIG-SCHEMA naming the offending dimension (neither)
✗ FAIL: Feature 027 Scope 3: ownerBareReason is a closed enum of exactly market-scoped and fixed-subject (0/2 admitted, 5/5 refused)
✗ FAIL: Feature 027 Scope 3: a market-scoped and a fixed-subject row each compose a bare href with its own reason-specific statement, a declared row composes the company, and describeDimensionOwner keeps company-dimension-owner/v1 and its seven keys
✗ FAIL: Feature 027 Scope 3: every declared ownerSubjectParam names the single shared parameter and every route it is declared on loads rlticker.js and calls RLTKR.linkedSubject (etf-momentum-lab.html)
✗ FAIL: Feature 027 Scope 3: the registry embedded in the route still equals the committed registry file after the new declarations
Research-Lab self-test: 3459 passed, 9 failed
```

The missing-path validator independently names `tests/company-intelligence-publication.functional.mjs` and `tests/company-intelligence-publication.spec.mjs`. Their implementation owners are Scope 04 and Scope 05 in the existing plan. The other eight failures are assertions in `scripts/selftest.mjs`, whose plan-owned implementation path belongs to Scope 05. They detect the deliberate intermediate state where the v2 publication config and seven headless UMD exports exist while the excluded route, public registration, and selftest migration remain unchanged. No assertion was relaxed in Scope 01.

### Completion Statement

All Scope 01 implementation paths, six scenario contracts, eight planned Test Plan rows, privacy mutation, shared author and bundle canaries, source lock, domain invariants, syntax checks, and strict boundary checks have current-session execution evidence. Scope status remains `In Progress`; certification fields remain unchanged. Independent test-phase verification has not been claimed by `bubbles.implement`.

## Scope: 01 Company publication foundation — Independent Test Verification — 2026-08-29

### Independent Verification Summary

`bubbles.test` independently inspected the six Scope 01 scenarios, all eight Test Plan rows, the structured test handoff, the scenario manifest, the nine-path implementation delta, and the production code reached by each test. The four required suites executed 99 tests with 99 passes, zero failures, zero cancellations, zero skips, and zero todos. Eight directly affected shared-surface canaries also passed. No Scope 01 test-owned defect was found.

The repository-wide selftest is not globally green at this sequential boundary. Its nine failures resolve to the two test files and eight stale assertions assigned to Scopes 04 and 05. Scope 01's Change Boundary forbids editing those paths. The classification below preserves that integration debt without weakening an assertion or attributing a repository-global pass.

### Scope 01 Independent Binding and Goal Contract

**Phase:** test  
**Command:** `.github/bubbles/scripts/goal-contract.sh verify --session-file .specify/memory/bubbles.session.json --expect-goal-id gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 --expect-revision 3 --expect-digest sha256:8219ab9c195774da240e9f9fd6a280a9a7f7fa5ada7ec0bbf1901764f42e8e6f`, followed by strict `work-boundary-resolve.sh` classification for every candidate Scope 01 test/report path  
**Exit Code:** 0  
**Claim Source:** executed

```text
goal-contract: verified gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 revision 3
GOAL_BOUNDARY_COMPARE_BEGIN
true
GOAL_ID=gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3
GOAL_REVISION=3
BOUNDARY_REPOSITORY_ROOTS=["research-lab"]
BOUNDARY_SPEC_TARGETS=["specs/028-company-intelligence-publication-and-brief-transaction"]
BOUNDARY_CROSS_REPO_POLICY=forbidden
BOUNDARY_ALLOWED_PATH_COUNT=67
CANDIDATE_PATH=specs/028-company-intelligence-publication-and-brief-transaction/report.md
disposition=in-boundary
CANDIDATE_PATH=specs/028-company-intelligence-publication-and-brief-transaction/scopes.md
disposition=in-boundary
CANDIDATE_PATH=tests/company-intelligence-publication.unit.mjs
disposition=in-boundary
CANDIDATE_PATH=tests/company-intelligence-publication.integration.mjs
disposition=in-boundary
CANDIDATE_PATH=tests/company-intelligence-publication.e2e.mjs
disposition=in-boundary
CANDIDATE_PATH=tests/company-intelligence.unit.mjs
disposition=in-boundary
GOAL_BOUNDARY_COMPARE_PASS
```

The persisted `full-delivery` mode resolved through the required grandfather path with `statusCeiling: done` and the full delivery phase order. The state and Goal Contract work boundaries were byte-semantically equal. No binding field was changed.

### Scope 01 Independent Unit Suite

**Phase:** test  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs` after exact negative-control byte restoration  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `ff08f531a721764dbd669e1b22e2fccb541f3e8500238fa80baa69bf7ac4f8ce`

```text
RESTORED_SHA256=345cfab3e4e7716caf5a4526922fd55635fb7cfd7ca78cace53d1a19a10e93f3
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed
✔ Privacy mutation: company owner reads reject private fields and action authority
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 91.214625
```

This execution directly proves TP-01-02 through TP-01-06 and the independent privacy mutation.

### Scope 01 Independent Owner-Read Integration

**Phase:** test  
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `69a9339bd8ee092c7470222d326318304dac0bda9e749a2582f59b7ecd49de5b`

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (30.249708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 76.693042
```

The test writes and reads the candidate snapshot through a real temporary filesystem, validates the exact production owner read, and passes that persisted read through the production distributed-bundle builder. It removes its temporary directory in `finally`.

### Scope 01 Independent Process E2E

**Phase:** test  
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `adc576f5c7861ce985fe86d5e41195228c58884d62990b6483983e910add3388`

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (454.855291ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 495.034542
```

The test invokes the production CLI with bounded child processes inside a real temporary Git repository. It proves `prepare`, `bind-plan`, and `inject-owner-read` produce private candidates, proves `promote` is refused, and compares source checkout status, pointer bytes, brief bytes, candidate `HEAD`, and candidate file inventory before and after execution.

### Scope 01 Independent Feature 025 Canary

**Phase:** test  
**Command:** `node --test tests/company-intelligence.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `8e09412bc65106c98fab20a034b7444a76af3103cd5fcacb6cd5cdc0fdd55b04`

```text
✔ module source contains no second definition of a volatility or ratio metric
✔ the module holds no DOM, storage, credential, clock or timer authority
✔ the module exports a frozen api and loads under Node through module.exports
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2
ℹ tests 91
ℹ suites 0
ℹ pass 91
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 129.668917
```

### Scope 01 Independent Red-Green Sensitivity

**Phase:** test  
**Command:** temporarily change the test-owned author identity from `company-authored-plan/v2` to `company-authored-plan/v9`, execute `node --test tests/company-intelligence-publication.unit.mjs`, restore the exact bytes, verify SHA-256, and execute the same suite again  
**Exit Code:** RED 1; restoration and GREEN 0  
**Claim Source:** executed  
**RED capture:** `c920d9743e69f79c02e330098a697651cf58f1ed5c30c0ea74374fb574dd3f09`  
**GREEN capture:** `ff08f531a721764dbd669e1b22e2fccb541f3e8500238fa80baa69bf7ac4f8ce`

```text
RED author schema: company-authored-plan/v9
✔ SCN-028-008 evidence after the frozen cutoff is rejected from every horizon
✖ SCN-028-006 headless composition preserves fifteen states and four isolated horizons
✖ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims
✖ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue
✖ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed
✖ Privacy mutation: company owner reads reject private fields and action authority
RED tests=6 pass=1 fail=5 skipped=0 exit=1
RED code=C028-PLAN-AUTHOR causeCode=B002-TOOL-AUTHOR-REQUEST field=identity
RESTORED_SHA256=345cfab3e4e7716caf5a4526922fd55635fb7cfd7ca78cace53d1a19a10e93f3
GREEN tests=6 pass=6 fail=0 skipped=0 exit=0
```

The first attempted probe targeted a dirty production configuration and correctly refused with exit 4 before mutation. The test-owned perturbation then supplied the discriminating proof without risking implementation bytes.

### Scope 01 Test Integrity Audit

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** The conclusion combines direct source inspection with executed negative controls, the anti-mock scan, the skip-marker scan, the canonical regression-quality guard, and exact title/path resolution.

| Test contract | Production path and observed behavior | Negative control | Audit result |
| --- | --- | --- | --- |
| TP-01-01 | UMD composition → owner-read validator → persisted snapshot → distributed bundle | Coverage-only or absent owner read cannot satisfy the asserted `newly-authored` outcome | Real and non-self-validating |
| TP-01-02 | Production composer creates fifteen unique states and four isolated horizon reads | Missing dimension, duplicate horizon, or combined direction is rejected by exact cardinality assertions | Real and non-self-validating |
| TP-01-03 | Removed and aged owner reads become named unavailable/stale states and horizon limitations | The source list is perturbed before production normalization | Real and adversarial |
| TP-01-04 | A source one millisecond after cutoff returns `C028-EVIDENCE-CUTOFF` and no value | Boundary clock moves from accepted to post-cutoff | Real and adversarial |
| TP-01-05 | Production validation enriches author output with immutable source descriptors and budget | Fingerprint or source identity drift refuses enrichment | Real and non-self-validating |
| TP-01-06 | Independent malformed, unsigned, subject, cutoff, budget, secret, markup, source-cycle, and owner-mismatch mutations return closed errors and no value | The refusal matrix plus the RED schema perturbation | Real and adversarial |
| TP-01-07 | Production CLI executes against a real temporary Git repository and private transaction directory | The unavailable `promote` command must return nonzero and source/candidate authority bytes must remain unchanged | Real process coverage; no bailout |
| TP-01-08 | Existing Feature 025 suite reads v1 route cache and v2 publication config through one frozen UMD API | Duplicate subject authority and unsupported config versions are rejected | Real compatibility canary |

The four test files contain zero request interception, mock-framework, skip, todo, pending, or exclusive-run markers. The three new regression files pass `regression-quality-guard.sh` with 0 violations and 0 warnings. The whole-file guard reports 15 `innerHTML` matches only inside the pre-existing Feature 025 security detector and its hostile fixtures. The changed compatibility canary contains none of those matches.

### Scope 01 Independent Build Quality

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** Build Quality is evaluated against the explicit Scope 01 intermediate-state contract. Scope 01's own paths, tests, scenario links, and parity are clean. Whole-plan checks remain nonzero only for artifacts assigned to Scopes 04 and 05, so this is not a repository-global green claim.

| Check | Exit | Exact result |
| --- | ---: | --- |
| Seven changed JS/MJS syntax checks plus v2 JSON parse | 0 | 8 parsed, 0 failures |
| Scope 01 anti-mock scan | 0 | 4 files, 0 matches |
| Scope 01 skip-marker scan | 0 | 4 files, 0 matches |
| New-file regression-quality guard | 0 | 3 files, 0 violations, 0 warnings |
| Scope 01 Markdown/JSON/title/path/DoD parity | 0 | 8 JSON rows, 8 Markdown rows, 8 DoD items; each title occurs once |
| Scenario obligation lint | 0 | 22 coherent scenario obligation matrices |
| Test mechanism lint | 0 | 22 coherent mechanisms; mutation adapter inert |
| Domain invariant guard | 0 | 6 declared invariants anchored |
| Domain model consistency | 0 | Shared model and feature declarations agree |
| Focused PII scan over all nine Scope 01 paths | 0 | 9 files, 0 findings |
| Implementation reality scan | 0 | 14 files, 0 violations, 1 file-discovery warning |
| Node source lock | 0 | Actual source lock passed; 16 adversarial mutations rejected |
| Artifact lint before this evidence append | 0 | 40-line artifact check passed |

The shared author-boundary canary matrix passed 5 of 5 tests with no skips. The distributed-bundle canary passed 3 of 3 tests with no skips and emitted one Node experimental `localStorage` warning. The warning does not alter the test result, but the independent run does not repeat the earlier implement-owned “warning-free” wording.

Editor diagnostics report three pre-existing `MD024/no-duplicate-heading` findings on the implement-owned `Summary`, `Code Diff Evidence`, and `Completion Statement` headings. The independent section uses unique headings and introduced no additional editor diagnostic. Canonical artifact lint remains green.

#### Scope 01 Current-Session Build Quality Execution

**Phase:** test  
**Claim Source:** executed  
**Commands:** `bash .github/bubbles/scripts/artifact-lint.sh specs/028-company-intelligence-publication-and-brief-transaction`; `bash .github/bubbles/scripts/scenario-obligation-lint.sh specs/028-company-intelligence-publication-and-brief-transaction`; `bash .github/bubbles/scripts/test-mechanism-lint.sh specs/028-company-intelligence-publication-and-brief-transaction --repo-root .`; `bash .github/bubbles/scripts/domain-invariant-guard.sh specs/028-company-intelligence-publication-and-brief-transaction`; `bash .github/bubbles/scripts/domain-model-consistency.sh specs/028-company-intelligence-publication-and-brief-transaction`  
**Exit Code:** 0 for every command  
**Related executed category evidence:** [current-session broader regression](#scope-01-current-session-broader-regression) and [current-session source-lock canary](#scope-01-current-session-source-lock-canary).

```text
# Feature 028 Scope 01 current artifact quality after planning repair
$ bash .github/bubbles/scripts/artifact-lint.sh specs/028-company-intelligence-publication-and-brief-transaction
exit: 0
lines: 40
sha256: 6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3
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
✅ Detected state.json workflowMode: full-delivery
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
ℹ️  Workflow mode 'full-delivery' allows status 'done'; current status is 'in_progress'
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

```text
SCOPE01_BUILD_QUALITY_GUARDS_BEGIN
[scenario-obligation-lint] OK — 22 scenario(s) with a coherent derived obligation matrix
SCENARIO_OBLIGATION_EXIT=0
[test-mechanism-lint] OK — 22 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
TEST_MECHANISM_EXIT=0
✅ G130: invariant 'INV-RL-REGISTRY-COMPLETE-TOOL-READS' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: invariant 'INV-RL-UNAVAILABLE-READS-NOT-ACTIONABLE' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: invariant 'INV-RL-COMPANY-SUBJECTS-EXPLICIT' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: invariant 'INV-RL-COMPANY-BRIEF-SAME-GENERATION' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: invariant 'INV-RL-COMPANY-VERSIONS-IMMUTABLE' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: invariant 'INV-RL-COMPANY-OWNER-READ-REAL' is anchored by enforcedBy code evidence in the scope's implementation files
✅ G130: domain-invariant correspondence satisfied for 6 declared invariant(s).
DOMAIN_INVARIANT_EXIT=0
✅ G131: feature domain declarations are consistent with the shared domainModel (every '## Data Model' entity is promoted and every Hard-Constraint invariant is declared).
DOMAIN_MODEL_CONSISTENCY_EXIT=0
SCOPE01_BUILD_QUALITY_GUARDS_EXIT=0
SCOPE01_BUILD_QUALITY_GUARDS_END
```

### Full Selftest and Whole-Plan Guard Classification

**Phase:** test  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** interpreted  
**Interpretation:** The full execution produced 3,969 lines with capture SHA-256 `5f695906076485a1f8b07427e94aa0777c0062846119f584722c532cce86b257`. Targeted current-tree predicates then classified the complete nine-failure set without rerunning or weakening the full selftest.

| Failure class | Exact current observation | Plan owner | Scope 01 disposition |
| --- | --- | --- | --- |
| Spec test-path guard | `tests/company-intelligence-publication.functional.mjs` and `tests/company-intelligence-publication.spec.mjs` are the 2 new missing paths; 70 baseline paths remain known, 0 stale, 275 referenced | Scopes 04 and 05 | Preserve |
| TP-025-01 | Config is v2 with 15 rows and 4 horizons; the selftest still requires v1 | Scope 05 selftest migration | Preserve |
| TP-025-08 | 31 exports; the route-only assertion names 7 headless publication exports as uncalled | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3A | Current partition is 15 rows, 6 subject-carrying, 4 bare, 5 ownerless; the old assertion requires 4/7/4 | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3B | The old `neither` mutation is admitted because `performance` now carries the subject | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3C | Old bare-reason probe observes 0 of 2 admitted and 5 of 5 rejected | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3D | `performance` now carries `ticker` to `etf-momentum-lab.html?ticker=MSFT`; the old statement assertion expects market-wide bare ownership | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3E | The old route-reader assertion names `etf-momentum-lab.html` | Scope 05 selftest migration | Preserve |
| Feature 027 Scope 3F | Embedded excluded route remains config v1 while committed publication config is v2 | Scope 05 selftest migration | Preserve |

`scenario-test-resolve.sh` returned 17 unresolved references out of 24. All seven Scope 01 linked references resolved. The unresolved set comprises the two missing Scope 04/05 files plus titles assigned to Scopes 02 through 05. `traceability-guard.sh --all-scopes` returned 10 failures: five scenario-manifest missing-file records and five mapped-row missing-file records, all owned by Scopes 04 and 05. Its Scope 01 section reported 6 scenarios and 8 Test Plan rows, with every row, report reference, and scenario-to-DoD edge resolved.

Sequential Scope 01 certification can proceed because the full failure set is outside the Scope 01 Change Boundary and each owner is named by the existing plan. That statement authorizes only Scope 01 validation. It does not authorize Scope 02 execution and does not claim repository-global green.

### Implement Result Provenance Finding

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** The operator reports three implement attempts. The current artifact audit found 0 implement completed-phase claims, 0 implement execution-history rows, and 0 `## RESULT-ENVELOPE` records under the feature. State still reports `activeAgent=bubbles.implement`, `currentPhase=implement`, and `currentPhaseStatus=in_progress`.

No implement result is invented or attributed. Independent test evidence proves Scope 01 behavior, while `bubbles.validate` must account for the absent implement envelope when evaluating phase provenance.

### Independent Completion Statement

TP-01-06, TP-01-07, TP-01-08, and the Scope 01 Build Quality item now have current-session independent test evidence. No source, later-scope test, public registration, plan text, status, certification field, Feature 025 artifact, unrelated tool, framework-managed file, or primary checkout was changed by this test phase.

### Scope 01 Success Signal Contribution

**Phase:** test  
**Claim Source:** interpreted  
**Goal Contract:** revision 3, `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`

Scope 01 contributes to the revision 3 `Success Signal`; it does not demonstrate the complete signal. The existing evidence establishes that:

- The complete source bundle contains exactly one validated Company Intelligence owner read and no coverage-only company outcome. See [Scope 01 Independent Owner-Read Integration](#scope-01-independent-owner-read-integration).
- Headless composition preserves all fifteen dimension states and four isolated horizons, while missing, stale, and post-cutoff evidence remains explicit or is refused. See [Scope 01 Independent Unit Suite](#scope-01-independent-unit-suite).
- The bounded, source-qualified plan contract is sensitive to an invalid author identity and returns to green after exact byte restoration. See [Scope 01 Independent Red-Green Sensitivity](#scope-01-independent-red-green-sensitivity).
- The production CLI creates private candidates without publication authority, refuses `promote`, and leaves source, pointer, and brief authority unchanged. See [Scope 01 Independent Process E2E](#scope-01-independent-process-e2e).
- The additive v2 contracts retain the existing Feature 025 UMD and v1 compatibility behavior. See [Scope 01 Independent Feature 025 Canary](#scope-01-independent-feature-025-canary).

Scopes 02-05 remain required before the full `Success Signal` is achieved. Scope 02 must add immutable coupled promotion and pointer-last selection. Scope 03 must prove all-or-nothing restoration. Scope 04 must integrate the shared scheduled and on-demand transaction path. Scope 05 must make catalogue, navigation, documentation, packaging, public-route, and parity checks agree that the tool is live.

## Scope: 01 Company publication foundation — Validate-Owned Certification Replay — 2026-08-29

### Binding and Goal Contract Revision 3 Evidence

**Phase:** validate  
**Command:** `.github/bubbles/scripts/goal-contract.sh verify --session-file .specify/memory/bubbles.session.json --expect-goal-id gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 --expect-revision 3 --expect-digest sha256:8219ab9c195774da240e9f9fd6a280a9a7f7fa5ada7ec0bbf1901764f42e8e6f`, then `bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/028-company-intelligence-publication-and-brief-transaction`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `2484686de9a73c9c09f35d43ca227cb356eec93ca444ca53f740b07f99350ccc`

```text
GOAL_CONTRACT_REVISION_3_VERIFY_BEGIN
goal-contract: verified gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 revision 3
GOAL_CONTRACT_REVISION_3_VERIFY_EXIT=0
G070_PRE_CERTIFICATION_BEGIN
goal-fidelity-guard: PASS boundary=pre-certification
G070_PRE_CERTIFICATION_EXIT=0
FEATURE028_SCOPE01_GOAL_GATE_RESULT=PASS
GOAL_CONTRACT_REVISION_3_VERIFY_END
```

The exact inherited packet was validated before repository reads. It resolved repository `research-lab-company-intelligence-delivery`, decision `rb:vscode-1f5b7362918071b6b2de16fb3709dfae:4`, and control revision `4` as actionable.

### Scope 01 Current Independent Test Replay

**Phase:** validate  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `d6968aef8616c53020b9bb191d60699d05ab84647bce5b05c472bcdc434ebff6`

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed
✔ Privacy mutation: company owner reads reject private fields and action authority
ℹ tests 99
ℹ suites 0
ℹ pass 99
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

**Phase:** validate  
**Command:** `node --test tests/distributed-briefs.authorship.unit.mjs tests/distributed-briefs.authorship.e2e.mjs tests/distributed-briefs.distributed-publish.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `9ed31576d6681c52216a3e949cb94f402ac527467e2f747fa6d5bb1026b0e305`

```text
✔ Regression: SCN-002-004 every registry source read reaches one truthful validated brief outcome
✔ Regression: SCN-002-005 unchanged and duplicate work creates no author prose event or cost churn
✔ Regression: SCN-002-006 recommendation lifecycle preserves prior terms merges origins and exposes conflicts
✔ SCN-002-004: brief validation binds recommendations to eligible owner evidence
✔ SCN-002-005: compaction honors exact profile caps and stable whole-fact priority
(node:35158) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/
ℹ tests 8
ℹ suites 0
ℹ pass 8
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

### Code Diff Evidence — Scope 01 Certification Replay

**Phase:** validate  
**Command:** `git status --short --untracked-files=all`  
**Exit Code:** 0  
**Claim Source:** executed  
**Capture:** `bb1dba28ab38d69b74dc207803c9dfcb5506390032006235e2218fd16942b797`

```text
 M company-intelligence.config.json
 M config/domain-model.yaml
 M rlcompanyintel.js
 M scripts/brief-author.mjs
 M tests/company-intelligence.unit.mjs
?? .bubbles-worktree
?? scripts/company-intelligence-publication.mjs
?? specs/028-company-intelligence-publication-and-brief-transaction/design.md
?? specs/028-company-intelligence-publication-and-brief-transaction/report.md
?? specs/028-company-intelligence-publication-and-brief-transaction/scenario-manifest.json
?? specs/028-company-intelligence-publication-and-brief-transaction/scopes.md
?? specs/028-company-intelligence-publication-and-brief-transaction/spec.md
?? specs/028-company-intelligence-publication-and-brief-transaction/state.json
?? specs/028-company-intelligence-publication-and-brief-transaction/test-plan.json
?? specs/028-company-intelligence-publication-and-brief-transaction/uservalidation.md
?? tests/company-intelligence-publication.e2e.mjs
?? tests/company-intelligence-publication.integration.mjs
?? tests/company-intelligence-publication.unit.mjs
```

The strict work-boundary run classified all nine Scope 01 product/test paths and the three inspected Feature 028 artifacts as `in-boundary`. It returned exit `0` with capture `c09eedda4dddae0536c3c00132a55484698dd56cd488c9cec84b06718ef1ea2b`.

### Validate Gate Matrix

**Phase:** validate  
**Claim Source:** interpreted  
**Interpretation:** Each row is derived from the cited current-session command result. A nonzero whole-feature command is not converted into a pass. Its Scope 01 and later-scope findings are separated below.

| Check | Exit | Capture or direct signal | Scope 01 result |
| --- | ---: | --- | --- |
| Exact packet validation | 0 | `REPOSITORY PACKET VALID`, decision revision 4 | Pass |
| Goal Contract revision 3 plus G070 pre-certification | 0 | `2484686de9a73c9c09f35d43ca227cb356eec93ca444ca53f740b07f99350ccc` | Pass |
| Transition contract resolver | 0 | `4d49eecead63da76aeebdf78801e8554478c8ab85947bf384217aa5be0408859` | Pass; `full-delivery`, target `done` |
| Scope 01 checked DoD inventory | 0 | `3928f8b8e41a00a3d8279542dd33d852ddb126af839e2d4e4ae502124acc7497` | 13 checked items found |
| Artifact lint | 0 | `40054627ee759c118d599693cb399528ef26d4f34bf28e09e3cbc6295930c25b` | Pass |
| Claim-source and collected-test-count guards | 0 | `9e4e7224deecd0f5e95c64766d0891892da22b284da5752deb343278c483a462` | Pass |
| Source lock and Pages build | 0 | `b96b3069c25d23190c07cb6d5603ac3c464039f54a7808e8f488af51d49d561d` | Pass |
| Artifact freshness | 0 | `a7de19b3eb715aa3b3a19a861b441eee3f2a1bf8871d7c1b5bfd7f6a11f20dee` | Pass |
| Scenario-obligation and test-mechanism lints | 0 | `5ec97e6ba170a30055e71ede6f5e3208f5f6f1f5e7043e613a82fb8e439ddf9d` | Pass |
| Implementation-reality scan | 0 | `50fb939a25a90e7be6fb6659878f7eeeda463722c04f2cab83c50bc5c895df7e` | 0 violations; one file-discovery warning |
| Strict work-boundary classification | 0 | `c09eedda4dddae0536c3c00132a55484698dd56cd488c9cec84b06718ef1ea2b` | Pass |
| Implement claim and execution-history backing | 0 | `32f9476f8db5109e3e51bc7f90d4c910071f773f97e7174eaa7e1edbddf25447` | Exactly one claim and one matching history row |
| Current-scope traceability mode | 2 | `1fd2a4c8d8fd04a12045d44873e21529e6038b4c6ec9322fb073a9359918c32a` | Unsupported for single-file scope layout |
| All-scope traceability | 1 | `23406dd6cee54a82da574851419faf9aa3316c1f0f0eb2c8c79daa37e30f97f6` | Scope 01 mappings clean; ten later-scope missing-file findings |
| Full repository selftest | 1 | `751487ab266ae5e032ee2c8ccbf2628654943bc6b8b5de843f7b613ee72a0f09` | 3459 passed and nine later-scope failures; not global green |
| Registry-asserted transition guard | 1 | `d6ce6228ac51ae916c0f6bf44c49287709f0ea2d974f4e95f4e57775e4736071` | Scope 01 blockers remain; certification refused |

### Full Selftest Later-Scope Classification

**Phase:** validate  
**Command:** `node scripts/selftest.mjs`  
**Exit Code:** 1  
**Claim Source:** interpreted  
**Interpretation:** The nine failures are preserved as the sequential Scope 04/05 implementation state named by the active plan. This is a nonzero repository result, not a global pass and not Scope 01 execution evidence.

```text
✗ FAIL: no active tests/*.mjs path named by a spec artifact is missing outside the frozen baseline; planned-not-authored paths remain visible non-failing debt (2 new, 0 planned, 70 known-missing, 0 stale of 275 referenced)
✗ FAIL: TP-025-01: the committed coverage registry declares exactly the fifteen mandatory dimensions and four horizons
✗ FAIL: TP-025-08: every one of the module’s 31 exported functions has a caller inside the route
✗ FAIL: Feature 027 Scope 3: the shipped registry holds fifteen rows partitioned into four subject-carrying, seven bare-with-a-reason and four ownerless
✗ FAIL: Feature 027 Scope 3: a linked row declaring neither field, one declaring both, a reason outside the closed enum and a reason with no owner route each raise C025-CONFIG-SCHEMA
✗ FAIL: Feature 027 Scope 3: ownerBareReason is a closed enum of exactly market-scoped and fixed-subject
✗ FAIL: Feature 027 Scope 3: a market-scoped and a fixed-subject row each compose a bare href with its own reason-specific statement
✗ FAIL: Feature 027 Scope 3: every declared ownerSubjectParam names the single shared parameter and every route it is declared on loads rlticker.js and calls RLTKR.linkedSubject
✗ FAIL: Feature 027 Scope 3: the registry embedded in the route still equals the committed registry file after the new declarations
Research-Lab self-test: 3459 passed, 9 failed
```

The two missing test paths belong to Scopes 04 and 05. The eight stale assertions belong to the Scope 05 selftest migration and public-route integration. They remain visible and nonzero.

### Scope 01 Blocking Findings

**Phase:** validate  
**Claim Source:** interpreted  
**Interpretation:** These findings are taken from the current registry-asserted transition guard. They affect Scope 01 or the provenance needed to certify it, rather than only the known later-scope implementation state.

| Finding | Current evidence | Required repair owner |
| --- | --- | --- |
| `VAL-028-S01-G057` | The canonical manifest schema requires `id`, while the installed G057 counter counts only `scenarioId`; the guard reports 0 of 22 despite traceability reading all 22 | `bubbles.plan` for a schema-compatible manifest repair; route the framework contradiction upstream if the canonical packet cannot satisfy both readers |
| `VAL-028-S01-G060` | The guard does not recognize a RED-before-GREEN marker even though executed mutation evidence exists | `bubbles.test` to record canonical ordered RED and GREEN evidence without rewriting the observed result |
| `VAL-028-S01-EVIDENCE` | The checked Build Quality item resolves to `#scope-01-independent-build-quality`, which the guard classifies as prose-only execution evidence | `bubbles.test` to attach raw command-output evidence to the test-owned anchor |
| `VAL-028-S01-G068` | Strict transition matching reports five Scope 01 scenarios without a faithful DoD item: SCN-028-005, SCN-028-006, SCN-028-008, SCN-028-009, and SCN-028-010 | `bubbles.plan` to preserve each behavioral claim in a mechanically faithful DoD item |
| `VAL-028-S01-REGRESSION-DOD` | Scope 01 lacks guard-recognized scenario-specific and broader regression DoD items; `Scope-Kind` also carries a trailing period | `bubbles.plan` to repair the canonical token and explicit regression DoD shape without weakening TP-01-07 |
| `VAL-028-S01-BOUNDARY-DOD` | The transition guard finds the Change Boundary section but no guard-recognized Change Boundary DoD item | `bubbles.plan` to add the explicit containment DoD item backed by the existing strict boundary evidence |
| `VAL-028-PHASE-ANALYZE` | The repaired implement claim and history pass, but the separate `analyze` completed-phase claim has no execution-history backing | `bubbles.ux` must rerun and record its own provenance or remove its unsupported claim; no validate-owned substitute is permitted |

### Ownership Routing Summary

| Finding set | Owner Required | Reason | Re-validation Needed |
| --- | --- | --- | --- |
| Scope 01 G057, G068, regression-DoD, and boundary-DoD findings | `bubbles.plan` | The repairs change plan-owned `scopes.md` and `scenario-manifest.json` | yes |
| Scope 01 G060 and Build Quality evidence finding | `bubbles.test` | The repairs change test-owned execution evidence | yes |
| Unsupported `analyze` phase provenance | `bubbles.ux` | Validate cannot fabricate or retroactively write another specialist's execution record | yes |

### Certification Disposition

Scope 01 certification is withheld. `certification.completedScopes` remains empty. The feature status and certification mirror remain non-terminal at `in_progress`. Scope 02 is not eligible until the Scope 01 findings above are repaired and the affected gates are re-executed.

### Scope 01 Planning-Owner Repair Record

**Phase:** plan  
**Claim Source:** interpreted  
**Interpretation:** This record covers only the plan-owned repairs requested for Scope 01. It does not claim repository-global green, test-owned evidence closure, UX provenance closure, certification, or permission to start Scope 02.

| Planning finding | Repair | Current-session verification |
| --- | --- | --- |
| `VAL-028-S01-G057` | Added `scenarioId` beside the schema-required `id` on all 22 canonical scenario objects. Both fields retain the same stable value. | Artifact lint exited 0 with 40 captured lines and SHA-256 `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3`. Scenario-obligation and test-mechanism lints each accepted all 22 scenarios. The transition result records G057 in `passedGateIds`. |
| `VAL-028-S01-G068` | Reshaped the five affected Scope 01 test-evidence DoD items to preserve the exact scenario claim and the existing behavioral detail. | Traceability checked 22 scenarios, mapped 22 to DoD, and reported 0 unmapped. The complete command remained nonzero only for ten missing later-scope test-file mappings. Capture SHA-256: `f829508247964620a9c15bf58cf6e87d8bd3faeaac517e2dc3f04dc00de31b61`. |
| `VAL-028-S01-REGRESSION-DOD` | Removed the Scope 01 `runtime-behavior` token's trailing period. Added the exact scenario-specific and broader regression DoD forms while preserving TP-01-07 unchanged. | The transition guard recognized the Scope 01 scenario-specific DoD item, broader-suite DoD item, and explicit Regression E2E Test Plan row. |
| `VAL-028-S01-BOUNDARY-DOD` | Added the exact Change Boundary containment DoD form and linked it to the existing strict-boundary and diff evidence. | The transition guard recognized the Change Boundary section, containment DoD item, and allowed/excluded surface inventory. |
| Goal Contract reference reconciliation | Updated the plan header, pre-implementation authority text, and all five Goal Contribution sections from revision 2 to approved revision 3. | `goal-contract.sh verify` confirmed `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3` at revision 3. The stale-reference scan found zero revision 2 references in `scopes.md`. |

The registry-asserted transition command exited 1 with SHA-256 `2c866aee21be476fc6293d638e47d4a940973bd61705e4d8967c14fa1974865d`. Its result remains non-terminal because test-owned G060 and Build Quality evidence, UX-owned analyze provenance, unchecked newly introduced DoD evidence, and later-scope implementation conditions remain open. The three new DoD checkboxes stay unchecked because this planning invocation did not execute their qualifying product or broader regression evidence.

### Scope 01 Current-Session TP-01-07 Regression

**Phase:** test  
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
# Feature 028 Scope 01 TP-01-07 scenario-specific process E2E regression
$ node --test tests/company-intelligence-publication.e2e.mjs
exit: 0
lines: 9
sha256: a696863d8a05476a062ae36170d1a075277be951f10252896b647f0049eae0ac
--- output ---
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (650.00325ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 695.281708
```

### Scope 01 Current-Session Broader Regression

**Phase:** test  
**Command:** `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
# Feature 028 Scope 01 broader foundation and Feature 025 regression suite
$ node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs
exit: 0
lines: 107
sha256: 3ceb6146d93963940e18c37f1fd081b32988a76aeb1586a408d82904a4582fa1
--- first 20 ---
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (760.08875ms)
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (48.078084ms)
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons (35.661375ms)
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims (6.326792ms)
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon (1.1555ms)
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue (7.289625ms)
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed (6.850125ms)
✔ Privacy mutation: company owner reads reject private fields and action authority (6.80325ms)
✔ coverage account holds one row per registry dimension and totals sum to the registry length (5.400208ms)
✔ SCN-025-001 a subject carrying committed bars and a cached options chain accounts for every mandatory dimension in the closed five-state vocabulary (1.250834ms)
✔ every one of the five evidence states is produced by a real adapter outcome (1.783417ms)
✔ a read aged past its window stays in the denominator as stale rather than becoming neutral (3.679125ms)
✔ non-financial event dimension reads unavailable with no-source-exists and carries no value (0.741833ms)
✔ an unavailable dimension never renders as a zero or a neutral number (1.05875ms)
✔ an unresolvable identifier raises C025-IDENTITY-UNRESOLVED and composes no horizon (0.297625ms)
✔ a company outside every corpus yields four horizons with absent quality and none direction (1.090333ms)
✔ every claim cites a value present in its own horizon input set (2.526291ms)
✔ a claim citing a value outside its own input set raises C025-HORIZON-ISOLATION (0.725875ms)
✔ four unavailable contributors downgrade evidence quality and populate gapEffect (2.248709ms)
✔ a horizon whose signalled dimensions are evenly opposed composes flat rather than picking a winner (1.811167ms)
--- omitted 67 line(s); sha256 above covers the full output ---
--- last 20 ---
✔ the configuration records the branch budget and the refused-branch counting decision with written rationales (0.049ms)
✔ the committed MSFT research plan and version tree are authored, dated and free of any position value (0.971625ms)
✔ adversarial: an owner envelope naming another company ONLY by ticker, or ONLY by cik, is refused (1.417167ms)
✔ the coverage account refuses a read set missing any one registry dimension rather than dropping the row (0.585458ms)
✔ a past-dated event still classed scheduled is partitioned as occurred, not presented as a forecast (0.141959ms)
✔ makeRead refuses a non-current read whose reason code is outside the closed vocabulary (1.644917ms)
✔ 027 security — no hostile subject can give the composed owner href a scheme, an authority, a second parameter or a fragment (1.013917ms)
✔ 027 security — the receiver refuses every hostile subject outright and returns no field carrying it (0.357833ms)
✔ 027 security — an accepted subject cannot leave data/options/, cannot become a storage key and cannot reach a prototype (1.383ms)
✔ 027 security — ownerBareReason reaches the reader as text only, never an attribute, an href or markup (0.420209ms)
✔ 027 security — no markup-bearing subject can reach a receiver markup sink, and every subject-fed sink escapes (2.455833ms)
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2 (0.540375ms)
ℹ tests 99
ℹ suites 0
ℹ pass 99
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 836.818417
```

### Scope 01 Current-Session Source-Lock Canary

**Phase:** test  
**Command:** `node scripts/validate-node-source-lock.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
# Feature 028 Scope 01 Node source-lock regression canary
$ node scripts/validate-node-source-lock.mjs
exit: 0
lines: 22
sha256: e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1
--- output ---
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

### Scope 01 Current-Session Test Integrity

**Phase:** test  
**Command:** Scope 01 mock/interception scan, skip/exclusive/todo scan, and `bash .github/bubbles/scripts/regression-quality-guard.sh tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs`  
**Exit Code:** 0  
**Claim Source:** executed

```text
SCOPE01_TEST_INTEGRITY_SCAN_BEGIN
INTERNAL_MOCK_MATCHES=0
SKIP_EXCLUSIVE_TODO_MATCHES=0
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Repo: /private/tmp/research-lab-company-intelligence-delivery
  Timestamp: 2026-08-29T06:10:41Z
  Bugfix mode: false
============================================================

ℹ️  Scanning tests/company-intelligence-publication.unit.mjs
ℹ️  Scanning tests/company-intelligence-publication.integration.mjs
ℹ️  Scanning tests/company-intelligence-publication.e2e.mjs

============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 3
============================================================
REGRESSION_QUALITY_EXIT=0
SCOPE01_TEST_INTEGRITY_SCAN_EXIT=0
SCOPE01_TEST_INTEGRITY_SCAN_END
```

### Scope 01 Current-Session Strict Change Boundary

**Phase:** test  
**Command:** `git status --short --untracked-files=all`, classified by the exact Scope 01 allowed set, Feature 028 artifact set, pre-existing worktree control, Feature 025 family, and excluded-path catch-all  
**Exit Code:** 0  
**Claim Source:** executed

```text
STRICT_SCOPE_01_CHANGE_BOUNDARY_BEGIN
$ git status --short --untracked-files=all
SCOPE01_ALLOWED=company-intelligence.config.json
SCOPE01_ALLOWED=config/domain-model.yaml
SCOPE01_ALLOWED=rlcompanyintel.js
SCOPE01_ALLOWED=scripts/brief-author.mjs
SCOPE01_ALLOWED=tests/company-intelligence.unit.mjs
PREEXISTING_WORKTREE_CONTROL=.bubbles-worktree
SCOPE01_ALLOWED=scripts/company-intelligence-publication.mjs
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/design.md
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/report.md
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/scenario-manifest.json
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/scopes.md
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/spec.md
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/state.json
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/test-plan.json
FEATURE028_ARTIFACT=specs/028-company-intelligence-publication-and-brief-transaction/uservalidation.md
SCOPE01_ALLOWED=tests/company-intelligence-publication.e2e.mjs
SCOPE01_ALLOWED=tests/company-intelligence-publication.integration.mjs
SCOPE01_ALLOWED=tests/company-intelligence-publication.unit.mjs
SCOPE01_ALLOWED_COUNT=9
FEATURE028_ARTIFACT_COUNT=8
PREEXISTING_CONTROL_COUNT=1
FEATURE025_CHANGED_COUNT=0
EXCLUDED_CHANGED_COUNT=0
STRICT_SCOPE_01_CHANGE_BOUNDARY_RESULT=PASS
STRICT_SCOPE_01_CHANGE_BOUNDARY_END
```

### Scope 01 Post-Remediation Guard Replay

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** The installed G060 detector directly accepts the ordered markers. Artifact lint and pre-certification goal fidelity exit zero. All-scope traceability and the registry-asserted transition remain nonzero for explicitly reported Scope 02-05 work, incomplete full-delivery phases, aggregate session cap, and UX-owned `analyze` provenance. Those nonzero results are retained as failures and are not presented as repository-wide success.

```text
G060_CANONICAL_DETECTOR_BEGIN
DETECTOR=.github/bubbles/scripts/guard-lib.sh::detect_red_green_ordering
REQUIREMENT=first RED-stage marker precedes first GREEN-stage marker in the same report
11:**RED-stage:** failing proof captured before restoration
73:**GREEN-stage:** passing proof captured after exact restoration
G060_DETECTOR_EXIT=0
G060_CANONICAL_ORDER_RESULT=PASS
G060_CANONICAL_DETECTOR_END
```

```text
# Feature 028 post-remediation artifact lint
$ bash .github/bubbles/scripts/artifact-lint.sh specs/028-company-intelligence-publication-and-brief-transaction
exit: 0
lines: 40
sha256: 6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3
Artifact lint PASSED.

# Feature 028 post-remediation pre-certification goal fidelity
$ bash .github/bubbles/scripts/goal-fidelity-guard.sh --boundary pre-certification --session-file .specify/memory/bubbles.session.json --spec-dir specs/028-company-intelligence-publication-and-brief-transaction
exit: 0
lines: 1
sha256: 3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46
goal-fidelity-guard: PASS boundary=pre-certification
```

```text
# Feature 028 post-remediation all-scope traceability
$ bash .github/bubbles/scripts/traceability-guard.sh specs/028-company-intelligence-publication-and-brief-transaction --all-scopes
exit: 1
lines: 190
sha256: 175ef4a7a037b146dad38794135573e813468e4289a537de06f8e587e0dbaf6c
❌ scenario-manifest.json references missing linked test file: tests/company-intelligence-publication.spec.mjs
❌ scenario-manifest.json references missing linked test file: tests/company-intelligence-publication.functional.mjs
❌ Scope 04: Scheduled and on-demand shared trigger integration mapped row references no existing concrete test file: The source set cannot change or become cyclic during a generation
❌ Scope 05: Public registration, authority-aware UI, and Pages delivery mapped row references no existing concrete test file: Registration and navigation agree on the live company tool
❌ Scope 05: Public registration, authority-aware UI, and Pages delivery mapped row references no existing concrete test file: Registration cannot coexist with an exclusion
❌ Scope 05: Public registration, authority-aware UI, and Pages delivery mapped row references no existing concrete test file: A failed refresh leaves an honestly dated prior read
❌ Scope 05: Public registration, authority-aware UI, and Pages delivery mapped row references no existing concrete test file: Public delivery needs no private state or infrastructure
ℹ️  DoD fidelity: 22 scenarios checked, 22 mapped to DoD, 0 unmapped
RESULT: FAILED (10 failures, 0 warnings)
```

```text
# Feature 028 transition replay diagnostic for remaining gate attribution
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/028-company-intelligence-publication-and-brief-transaction --target-status done --expect-workflow-mode full-delivery --expect-contract-digest sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93
exit: 1
lines: 569
sha256: c30aa8f9393023929e98b022ba0fbbfeb6e0e73bd7dd28b072011f4734976a82
--- Check 3E: Scenario-first TDD Evidence (Gate G060) ---
✅ PASS: Scenario-first TDD red→green ordering is recorded in the scope/report artifacts (mode source: snapshot)
✅ PASS: Scope DoD includes scenario-specific regression E2E requirement: Scope 01: Company publication foundation and headless owner-read contracts
✅ PASS: Scope DoD includes broader E2E regression suite requirement: Scope 01: Company publication foundation and headless owner-read contracts
✅ PASS: Scope Test Plan includes explicit regression E2E row(s): Scope 01: Company publication foundation and headless owner-read contracts
✅ PASS: Scope DoD includes change-boundary containment item: scopes.md
ℹ️  INFO: Check-9 ADVISORY: evidence block for anchor '#scope-01-implement-owned-quality-evidence' in report.md has no command-output signature (prose-only); accepted as documentation/attestation evidence
✅ PASS: All 16 checked DoD items across resolved scope files have evidence blocks
🔴 BLOCK: Phase 'analyze' is in completedPhaseClaims but no specialist or parent-expanded provenance found (Gate G022)
🔴 BLOCK: completedPhaseClaims claims phase(s) with NO executionHistory entry behind them: analyze — a phase cannot be claimed complete with no record that it ran
passedGateIds: [G057,G040,G051,G082,G083,G084,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G053,G027,G068,G128,G136]
failureCount: 53
exitStatus: 1
verdict: FAIL
```

### Scope 01 Git-Backed Delta Evidence Replay

**Phase:** test  
**Claim Source:** interpreted  
**Interpretation:** Adding the exact executed `git status` command line made the transition guard record G053 in `passedGateIds`. The overall transition still exits one. Its G097 entry was rechecked directly immediately afterward and the named guard exited zero, so the nonzero transition is retained without treating that direct check as a substitute for the transition verdict.

```text
# Feature 028 final replay after Git-backed delta evidence repair
$ bash .github/bubbles/scripts/state-transition-guard.sh specs/028-company-intelligence-publication-and-brief-transaction --target-status done --expect-workflow-mode full-delivery --expect-contract-digest sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93
exit: 1
lines: 572
sha256: d88852737dccd4445d91a3184484f8bae5b5cc8f072cc34040e764ea8fce1cbe
passedGateIds: [G057,G053,G040,G051,G082,G083,G084,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G098,G099,G100,G130,G131]
failedGateIds: [G022,G027,G068,G128,G097,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 53
exitStatus: 1
verdict: FAIL
```

```text
# Feature 028 direct G097 requirement mechanism attribution
$ bash .github/bubbles/scripts/requirement-mechanism-guard.sh specs/028-company-intelligence-publication-and-brief-transaction
exit: 0
lines: 1
sha256: 948bbdc4ca8e240e77c7cc4b07b0ec2c6aa104b3f843efe05cc05a38597c7595
--- output ---
✅ G097: no concrete security/contract mechanism named in requirements — not applicable
G097_DIRECT_OBSERVED_EXIT=0
```

## Scope 01 Fresh Validate-Owned Certification Replay — 2026-08-29

**Agent:** `bubbles.validate`
**Scope:** `01-company-publication-foundation`
**Mode:** `full-delivery`
**Captured at:** `2026-08-29T16:54:38Z`
**Candidate revision:** `5f5caf16ac914bae67b990cc40bd7d1e025250c3`

### Fresh Authority and Outcome-Contract Verification

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The exact repository packet, Goal Contract revision 3, G134 pre-certification boundary, G128 session cap, and transition contract all passed. The full Feature 028 Success Signal remains incomplete by design because Scopes 02 through 05 have not started. Scope 01's declared contribution is the certifying outcome evaluated here.

| Field | Current evidence | Scope 01 status |
| --- | --- | --- |
| Intent | The focused production tests execute the headless company publication foundation without granting publication authority. | Pass |
| Success Signal contribution | The owner-read integration produces one real Company Intelligence source read and no coverage-only company outcome. | Pass |
| Hard Constraints | The 99-test replay preserves fifteen dimensions, four isolated horizons, explicit missing/stale states, cutoff refusal, bounded plans, privacy boundaries, and Feature 025 compatibility. | Pass |
| Failure Condition | The process test refuses `promote` and proves source pointer and brief bytes remain unchanged. Later coupled-publication failure conditions are not claimed by Scope 01. | Pass for Scope 01 |

**Phase:** validate
**Command:** exact packet validation, Goal Contract revision 3 verification, G134 pre-certification guard, G128 session-cap guard, and transition-contract resolver
**Exit Code:** 0
**Claim Source:** executed

```text
# Feature 028 Scope 01 fresh binding and transition contract replay
exit: 0
lines: 13
sha256: 884376de0a9b3d0815dc82b84078fbc788646e9a55ca2687a892fb09dc306499
REPOSITORY PACKET VALID actionable=true repository=research-lab-company-intelligence-delivery-r2 decision=rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:5 revision=5
PACKET_EXIT=0
goal-contract: verified gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 revision 3
GOAL_VERIFY_EXIT=0
goal-fidelity-guard: PASS boundary=pre-certification
GOAL_FIDELITY_EXIT=0
PASS Gate G128 (session_cap_enforcement_gate) — no aggregate cap exceeded
SESSION_CAP_EXIT=0
TRANSITION_RESOLVER_EXIT=0
BINDING_TRANSITION_REPLAY_EXIT=0
```

The pre-report resolver returned `workflowMode=full-delivery`, `auditProfile=delivery-completion-v1`, `statusCeiling=done`, `targetStatus=done`, and contract digest `sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93`. The first post-append resolver returned target revision `sha256:8f53aaf05f58613c3d029c79a83f3d591219645dc63d2853f9cbe30b73da7760`; its structural capture is `sha256:e3a6d1df53f35d2ae0f2272e70f77ef62eec070d082d4e40beb3d81e448e8bb2`. That revision identifies that executed replay, not a self-referential claim about later report text.

### Fresh Scope 01 Product Replay

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# Feature 028 Scope 01 fresh 99-test certification replay
exit: 0
lines: 107
sha256: d00b3c74795ae422496c732daec6dd2ae8b7cbd7a61a1adec9f1c2d3d4969c73
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed
✔ Privacy mutation: company owner reads reject private fields and action authority
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2
ℹ tests 99
ℹ suites 0
ℹ pass 99
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The current build, source lock, each exact TP-01 command, Feature 025 canary, and shared author/bundle canaries also ran in one bounded replay. Every command exited `0`; the complete 187-line capture is `sha256:7cb52289de4ca19ad21b5ab441ef24c3702b627c916c736157a3836f233d6cf2`. The shared distributed-publisher canary emitted Node's `ExperimentalWarning` for unavailable `localStorage`; this replay does not describe that command as warning-free.

The Scope 01 anti-mock, interception, skip, exclusive-run, todo, and regression-quality checks exited `0`. They reported zero matching files, zero regression violations, and zero regression warnings. The 22-line capture is `sha256:c0c3c17590c62c4c903501196332c50a7b5db230acb3833d4526cf9acb67cc58`.

### Fresh Governance Replay

| Command or check | Exit | Current result |
| --- | ---: | --- |
| `node scripts/build-pages-site.mjs` | 0 | Pages build completed. |
| `node scripts/validate-node-source-lock.mjs` | 0 | Actual source lock passed and 16 adversarial mutations were rejected. |
| `bash .github/bubbles/scripts/artifact-lint.sh <feature>` | 0 | Artifact structure passed. |
| `bash .github/bubbles/scripts/scenario-obligation-lint.sh <feature>` | 0 | All 22 scenario obligation matrices were coherent. |
| `bash .github/bubbles/scripts/test-mechanism-lint.sh <feature> --repo-root .` | 0 | All 22 declared mechanisms were coherent. |
| `bash .github/bubbles/scripts/implementation-reality-scan.sh <feature> --verbose` | 0 | Zero violations; one design-fallback discovery warning. |
| `bash .github/bubbles/scripts/artifact-freshness-guard.sh <feature>` | 0 | Zero failures and zero warnings. |
| `bash .github/bubbles/scripts/execution-substate-guard.sh <feature>` | 0 | Namespace and vocabulary passed. |
| `bash .github/bubbles/scripts/domain-invariant-guard.sh <feature>` | 0 | Six declared invariants were anchored. |
| `bash .github/bubbles/scripts/domain-model-consistency.sh <feature>` | 0 | Shared model consistency passed. |
| `bash .github/bubbles/scripts/collected-test-count-guard.sh <feature> --verbose` | 0 | No Feature 028 evidence claims a zero-test run. |
| `bash .github/bubbles/scripts/env-pollution-scan.sh .` | 0 | No test-to-production write was detected. |
| `bash .github/bubbles/scripts/done-spec-audit.sh --profile changed <feature>` | 0 | One nonterminal spec scanned; terminal completion checks correctly skipped. |
| `bash .github/bubbles/scripts/handoff-cycle-check.sh .github/agents` | 0 | No handoff cycle or missing target. |
| `bash .github/bubbles/scripts/traceability-guard.sh <feature> --all-scopes` | 1 | Scope 01 mappings resolve; ten missing-file findings belong to Scopes 04 and 05. |
| `node scripts/selftest.mjs` | 1 | 3,459 passed and nine failed. The failures remain assigned to unimplemented Scopes 04 and 05. Capture: `sha256:e7f16edb74fe2f7d755b4302e201508e0287de7a6389c9a6beb2b1d23f3d87b7`. |
| `bash .github/bubbles/scripts/requirement-mechanism-guard.sh <feature>` | 1 | The feature-wide guard finds the Scope 05 CSP mitigation before Scope 05 implementation. |
| `bash .github/bubbles/scripts/claim-source-lint.sh <feature>` | 0 advisory | Two test-owned RED/GREEN sub-blocks lack local Claim Source tags. |
| `bash .github/bubbles/scripts/cli.sh framework-write-guard` | 1 | Five pre-existing framework-managed agent files differ from the installed checksum snapshot. |
| `bash .github/bubbles/scripts/cli.sh doctor` | 1 | Framework drift plus repository-wide zero-test evidence drift. |
| `bash .github/bubbles/scripts/cli.sh repo-readiness .` | 0 | Nine checks passed, zero warned, zero failed. |

### Receipt-Derived Scenario-State Failure

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/028-company-intelligence-publication-and-brief-transaction --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable`
**Exit Code:** 1
**Claim Source:** executed

```text
# Feature 028 current receipt-derived scenario certification states
exit: 1
lines: 133
sha256: 0dc31dfb36172de0ea3885e311d4cd6f2c9108fd0c6dad8bd77366fe91916693
scenario-state-resolve: specs/028-company-intelligence-publication-and-brief-transaction
  source revision: 5f5caf16ac91
  SCN-028-005  state=PLANNED  derived=[PLANNED]
  SCN-028-006  state=PLANNED  derived=[PLANNED]
  SCN-028-007  state=PLANNED  derived=[PLANNED]
  SCN-028-008  state=PLANNED  derived=[PLANNED]
  SCN-028-009  state=PLANNED  derived=[PLANNED]
  SCN-028-010  state=PLANNED  derived=[PLANNED]
--- omitted 93 line(s); sha256 above covers the full output ---
  certifiable: no
```

The repository has no `.specify/runtime/tool-calls.jsonl`. Fresh passing test output cannot be converted into receipt-derived RED, implementation, green, live, and regression states by narrative interpretation. This is a Scope 01 certification blocker.

### Registry-Asserted Transition Result

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/028-company-intelligence-publication-and-brief-transaction --target-status done --expect-workflow-mode full-delivery --expect-contract-digest sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93`
**Exit Code:** 1
**Claim Source:** executed

```text
# Feature 028 Scope 01 post-first-append transition guard
exit: 1
lines: 568
sha256: 7dfc70ec50c870af5eb07e25406453101d3b76736048b6fb0826a747d029c8d6
workflowMode: full-delivery
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93
targetRevision: sha256:8f53aaf05f58613c3d029c79a83f3d591219645dc63d2853f9cbe30b73da7760
applicableCheckClasses: [universal,mode-required,delivery-completion]
passedGateIds: [G057,G053,G040,G051,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G098,G099,G100,G130,G131]
failedGateIds: [G022,G027,G068,G097,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 49
exitStatus: 1
verdict: FAIL
```

This command is the whole-feature terminal guard. Its Scope 01-specific failures remain blocking. Its later-scope and terminal-only failures are preserved below and are not relabelled as Scope 01 passes.

### Scope 01 Certification Finding Accounting

#### Addressed Findings

| Finding | Current closure evidence |
| --- | --- |
| `VAL-028-PHASE-ANALYZE` | Fresh transition Check 6B and Check 7C accept one `bubbles.ux` claim backed by one execution-history row. |
| `VAL-028-S01-G057` | G057 manifest integrity passes. Every Scope 01 linked test resolves; the unresolved references are later-scope paths or titles. |
| `VAL-028-S01-G060` | The transition guard accepts the ordered RED-stage and GREEN-stage evidence. |
| `VAL-028-S01-G068` | None of the twelve fresh G068 gaps belongs to Scope 01. The six Scope 01 scenario claims now map faithfully. |
| `VAL-028-S01-REGRESSION-DOD` | The guard recognizes Scope 01's scenario-specific regression item, broader regression item, and explicit regression Test Plan row. |
| `VAL-028-S01-BOUNDARY-DOD` | The guard recognizes Scope 01's Change Boundary section, DoD containment item, and allowed/excluded inventory. |
| `VAL-028-S01-BUILD-EVIDENCE` | The Build Quality DoD now resolves to executed output; G053 passes with Git-backed non-artifact paths. |
| `VAL-028-S01-TEST-OUTCOME` | The fresh 99-test replay passes with zero failures, cancellations, skips, or todos. Test-integrity and Feature 025 compatibility checks pass. |

#### Unresolved Findings

| Finding | Current evidence | Required owner |
| --- | --- | --- |
| `VAL-028-S01-SCENARIO-RECEIPTS` | All six Scope 01 scenarios remain receipt-derived `PLANNED`; the resolver exits 1. | `bubbles.test` first, then `bubbles.implement`, then `bubbles.test`, preserving RED → implementation → green/live/regression ordering. |
| `VAL-028-S01-TEST-PROVENANCE` | State has no `test` completed-phase claim or test execution-history row. Validate-owned test execution cannot impersonate `bubbles.test`. | `bubbles.test` |
| `VAL-028-S01-G072` | Claim-source lint reports missing local tags at report lines 13 and 75 in test-owned RED/GREEN sub-blocks. | `bubbles.test` |
| `VAL-028-S01-CORE-EVIDENCE` | Check 9 still classifies `#scope-01-implement-owned-quality-evidence` as prose-only command evidence for one checked core DoD item. | `bubbles.implement` |
| `VAL-028-S01-G027` | Implementation is claimed while zero scopes are artifact-marked Done and `certification.completedScopes` is empty. Certification cannot resolve this until the four Scope 01 evidence/provenance findings above close. | `bubbles.validate` after owner closure |
| `VAL-028-S01-SHARED-WARNING` | The shared distributed-publisher canary passes but emits Node's experimental `localStorage` warning. | `bubbles.test` |
| `VAL-028-LATER-TRACEABILITY` | Scenario resolution has 17 unresolved references and all-scope traceability has ten failures, all assigned to Scopes 02 through 05, including the two not-yet-authored Scope 04/05 test files. | `bubbles.implement` and `bubbles.test` in their planned scopes |
| `VAL-028-LATER-G068-AND-DOD` | Twelve G068 gaps, eight regression-DoD gaps, one Scope 05 consumer-impact DoD gap, and trailing Scope-Kind punctuation on Scopes 02 through 04 remain. | `bubbles.plan` before the affected scopes execute |
| `VAL-028-LATER-G097` | The feature-wide mechanism guard sees the Scope 05 design's CSP mitigation before Scope 05 code and browser proof exist. | `bubbles.design` or `bubbles.implement` within Scope 05 |
| `VAL-028-LATER-SELFTEST` | The core selftest exits 1 with nine failures: two planned test paths and eight stale registration/route assertions assigned to Scopes 04 and 05. | `bubbles.implement` in the planned later scopes |
| `VAL-028-TERMINAL-G022` | Eleven full-delivery phases remain unclaimed. | Their registered phase owners during later-scope delivery |
| `VAL-028-TERMINAL-G136` | Human acceptance remains unchecked and no acceptance record exists. This replay did not inspect, alter, or claim human acceptance. | Human acceptance authority after delivery |
| `VAL-RL-FRAMEWORK-INTEGRITY` | Framework-write-guard and doctor report five installed agent files with checksum drift. The checkpoint delta contains no framework-managed path. | Framework install owner; no downstream manual edit |
| `VAL-RL-G133-BASELINE` | The Feature 028 test-count guard passes, but repository-wide doctor finds 18 zero-test evidence blocks under Features 022 through 024. | Owners of those historical packets |
| `VAL-RL-STOCK-BASH-PARSE` | A diagnostic `/bin/bash` 3.2 invocation stopped at a parser error while the canonical PATH-resolved `bash` invocation completed and emitted the transition result above. | Upstream Bubbles portability owner |

### Fresh Certification Disposition

Scope 01 is **not certified** by this replay. `certification.completedScopes` remains empty. Scope 01 remains `in_progress`, and both feature status mirrors remain `in_progress`. Scope 02 was not started. Feature 025, human acceptance, product source, tests, later scopes, and framework-managed files were not modified by this validation invocation.

The concrete route is `route_required` to `bubbles.test` for `VAL-028-S01-SCENARIO-RECEIPTS`, `VAL-028-S01-TEST-PROVENANCE`, `VAL-028-S01-G072`, and `VAL-028-S01-SHARED-WARNING`. The complete unresolved set above remains open; no later-scope or repository-global failure is hidden by the focused product pass.

## Scope 01 Test-Owned Receipt and Provenance Closure — 2026-08-29

### Current Authority and Boundary

**Phase:** test
**Claim Source:** executed
**Repository packet:** `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:5`, control revision `5`
**Repository:** `research-lab-company-intelligence-delivery-r2`
**Scope:** `01-company-publication-foundation`

The exact user-supplied packet passed the installed `repository-binding.sh validate-packet` command before repository-local inspection. This test phase changed only two test files plus this test-owned report section and test execution provenance in `state.json`. It did not change product implementation, Feature 025, later-scope tests, human acceptance, or framework-managed files.

### Current Receipt-Bound RED Controls

**Phase:** test
**Claim Source:** executed
**Receipt carrier:** `.specify/runtime/tool-calls.jsonl`
**Source revision:** `5f5caf16ac914bae67b990cc40bd7d1e025250c3`

| Scenario | Current discriminating control | RED exit | Full-output capture |
| --- | --- | ---: | --- |
| `SCN-028-005` | Omit the injected company owner read from the persisted snapshot while retaining owner-read and bundle assertions. | 1 | `a7a70fae0d0c16f02d654b145afeef44c537cd70552af96637828813b2c71710` |
| `SCN-028-006` | Remove one coverage dimension while retaining the fifteen-state assertion. | 1 | `abdb417ed07dc090439393a4e3158529ca71b0d1dc7fbdd775812101ffab0dc5` |
| `SCN-028-007` | Return the deliberately aged owner read to `current` while retaining the stale-state assertion. | 1 | `9c55e0dc9a46cac73dcdd423c5cdca2438eb9c637181ee6ea8ccb917208d2683` |
| `SCN-028-008` | Move the post-cutoff source to the exact cutoff while retaining cutoff-refusal assertions. | 1 | `2c9e65594c0700f14aaba0ba156e21ca01f18c660bfcc0893a739d6f7c6d27c5` |
| `SCN-028-009` | Replace the authored response fingerprint with a nonmatching digest while retaining valid-plan assertions. | 1 | `15752789c0029f5d38490c6b04578add50006fc20ff5a249bfdd21e67906ad71` |
| `SCN-028-010` | Leave the supposedly unsigned response fingerprint intact while retaining unsigned-refusal assertions. | 1 | `cf3392f143e9fffead99ecfb95285f1c442b12da40f1b47a05f0859dd751fa66` |

The two temporarily controlled test files were restored exactly before any GREEN execution. Git object comparison returned `RESTORE_EXACT=PASS` for objects `56c00d2f67de178eda28cb12378e68fd65eec91d` and `c6b0fa2a88b4fcf320a8c3e0492adb0f9d66c87a`.

The newly created runtime log initially contained two setup-trial RED rows whose labels did not exactly describe their perturbations. Those two rows were excluded before evidence admission. No inherited tool-call log existed. Every retained RED row above comes from the corrected current execution, and the final resolver reports no Scope 01 receipt refusal.

### Current Exact Eight-Row Test Plan Replay

**Phase:** test
**Claim Source:** executed

| Test Plan row | Exact command | Exit | Tests passed / failed / skipped | Full-output capture |
| --- | --- | ---: | --- | --- |
| `TP-01-01` | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 1 / 0 / 0 | `8676f6dc33d79f04287ba4c6b3651a2a7086a0a22cf134715cba0c6545dea46d` |
| `TP-01-02` | `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 / 0 / 0 | `174cf9baa8979b2e6d23b12716312d64718753d17ad210a923069bcbdf8ee19b` |
| `TP-01-03` | `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 / 0 / 0 | `7063db8b20ff58c3992084372e7ea7fe58e619f069080434a894e34c2b4e3235` |
| `TP-01-04` | `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 / 0 / 0 | `38ee75e9a9134f8016e15addbab00cda95e0b7d7de4b974eab4c577453dc80be` |
| `TP-01-05` | `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 / 0 / 0 | `f2504b58d0c47357387c2e89fd3aaafb30e060fbc809f4bbf4a75b3ea4162dd4` |
| `TP-01-06` | `node --test tests/company-intelligence-publication.unit.mjs` | 0 | 6 / 0 / 0 | `23876e1fb9a96119e572ae7e21cc377acf3a16756d15dc6fdea7b91b8b7829ec` |
| `TP-01-07` | `node --test tests/company-intelligence-publication.e2e.mjs` | 0 | 1 / 0 / 0 | `daf697bc6df1a39ea406c0f4ec53a8b4cebe92360c452a4ac1d7046e66da593e` |
| `TP-01-08` | `node --test tests/company-intelligence.unit.mjs` | 0 | 91 / 0 / 0 | `53ae1ac29fad1e9ab96a69f89e20cd16482c6fe932debd3a5e733da721fdb019` |

The strengthened TP-01-07 process test still has one exact Test Plan title. It now drives the production CLI through real temporary Git checkouts for named missing/stale evidence, post-cutoff refusal, unsigned-plan refusal, valid private candidate creation, owner-read injection, absent promotion authority, and source-byte restoration.

### Current GREEN LIVE and Regression Receipt Matrix

**Phase:** test
**Claim Source:** executed

| Scenario | Highest applicable receipt-derived state | Live proof | Regression capture |
| --- | --- | --- | --- |
| `SCN-028-005` | `REGRESSION_GREEN` | TP-01-07 real temporary Git process, capture `42a941a49e8dc85dfeba36c9c3d18d661c6b49e324eb3d7115690066d8d1df31` | `d93ad255affe0390a47ae8ab87f87a4c4f7d80ee1e7714b964d60be68cee6163` |
| `SCN-028-006` | `REGRESSION_GREEN` | Not applicable to its pure-calculation traits | TP-01-08 capture `53ae1ac29fad1e9ab96a69f89e20cd16482c6fe932debd3a5e733da721fdb019` |
| `SCN-028-007` | `REGRESSION_GREEN` | Strengthened TP-01-07 missing/stale CLI path, capture `1788a736e53b0862e33d7d2a2d8bf4f5224ea48014e1fcf87119cef5dd735617` | `70495fe029f3cc9029a730a51b069a9e6e397f92c58e57d5f9edded66d129c6b` |
| `SCN-028-008` | `REGRESSION_GREEN` | Strengthened TP-01-07 post-cutoff CLI refusal, capture `e493388a1bc9abf926bdf7a9f0039b7edcbf1555e1e32c8aa07b0b7ec9c59789` | `0fbe7f4ff3154732cda7428933798f3bf2448fa0e2a1cbd7afaa10a4a7eb5942` |
| `SCN-028-009` | `REGRESSION_GREEN` | Not applicable to its pure-calculation traits | `9d875af4729fda863fac1b8915321e2c5cb65cdd4082d08e1165a173dd1bd8bb` |
| `SCN-028-010` | `REGRESSION_GREEN` | Strengthened TP-01-07 unsigned-plan CLI refusal, capture `daf697bc6df1a39ea406c0f4ec53a8b4cebe92360c452a4ac1d7046e66da593e` | `5001a80274dd1b58e7317c99d6a78ffd39a7e265bb3155ec742f722bdc5393ea` |

`OBSERVED` is not applicable to any Scope 01 scenario because none declares the `sla-sensitive` trait. The resolver therefore requires no telemetry receipt for this scope.

### Receipt-Derived State Resolver Result

**Phase:** test
**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/028-company-intelligence-publication-and-brief-transaction --require RED_VERIFIED --require IMPLEMENTED --require GREEN_TARGETED --require GREEN_LIVE --require REGRESSION_GREEN --require OBSERVED --certifiable`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** Every Scope 01 scenario reaches `REGRESSION_GREEN`, including trait-applicable `GREEN_LIVE`; the whole-feature command remains nonzero only because Scopes 02 through 05 correctly remain `PLANNED`. It does not certify Scope 01 or the feature.
**Capture:** `0f3c12ed463050c3ebf85344b082a02ca4517288969d7f37927a28ce8d6bb6d5`, lines 1-14 of 105:

```text
scenario-state-resolve: specs/028-company-intelligence-publication-and-brief-transaction
  source revision: 5f5caf16ac91
  SCN-028-001  state=PLANNED  derived=[PLANNED]
  SCN-028-002  state=PLANNED  derived=[PLANNED]
  SCN-028-003  state=PLANNED  derived=[PLANNED]
  SCN-028-004  state=PLANNED  derived=[PLANNED]
  SCN-028-005  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-028-006  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
  SCN-028-007  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-028-008  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-028-009  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
  SCN-028-010  state=REGRESSION_GREEN  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
  SCN-028-011  state=PLANNED  derived=[PLANNED]
  SCN-028-012  state=PLANNED  derived=[PLANNED]
```

### Shared Distributed-Publisher Warning Closure

**Phase:** test
**Command:** `node --trace-warnings --test tests/distributed-briefs.distributed-publish.unit.mjs`
**RED Exit Code:** 0 with warning
**GREEN Exit Code:** 0 without warning
**Claim Source:** executed

The RED trace identified `rldata.js:12` accessing Node's experimental built-in `localStorage` getter before the test could declare its intended no-storage environment. The first test-only placement was still too late because ESM static imports are hoisted. The final test change declares `globalThis.localStorage` as unavailable before dynamically importing the distributed publisher. It does not filter stderr, pass a warning-suppression flag, or change production code.

```text
(node:8906) ExperimentalWarning: localStorage is not available because --localstorage-file was not provided.
    at Object.get (node:internal/webstorage:42:21)
    at get (node:internal/process/pre_execution:452:58)
    at /private/tmp/research-lab-company-intelligence-delivery-r2/rldata.js:12:37
    at /private/tmp/research-lab-company-intelligence-delivery-r2/rldata.js:12:133
    at Object.<anonymous> (/private/tmp/research-lab-company-intelligence-delivery-r2/rldata.js:1180:3)
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/
ℹ tests 3
ℹ pass 3
ℹ fail 0
```

The RED warning trace capture is `020e09e4f649364eea60d19b3678342c8e2b09c8286b41a47f1b4014514d1bae`. The final unfiltered GREEN trace emitted no warning:

```text
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/
ℹ tests 3
ℹ suites 0
ℹ pass 3
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 109.262666
[tool-log] recorded exit=0 duration=151ms → .specify/runtime/tool-calls.jsonl
```

The GREEN warning-trace capture is `88da4f0472447f959e5279b6a011b9e61cd909b4deea6656eac5796c7f031acf`.

### Current Test and Receipt Tooling Matrix

**Phase:** test
**Claim Source:** executed

| Command | Exit | Current result | Full-output capture |
| --- | ---: | --- | --- |
| `node scripts/validate-node-source-lock.mjs` | 0 | Actual lock passed; all 16 adversarial source mutations were rejected. | `f6405b236d828970f364a85f7354362477bc971915cab74775ab3710147565c8` |
| `bash .github/bubbles/scripts/regression-quality-guard.sh` over the three Scope 01 publication tests and shared publisher canary | 0 | 4 files, 0 violations, 0 warnings. | `cf802231e7cee1389c0d3c03cbb5e9af6a9ece2d06fee1a7dbea4c3e9f57e661` |
| `bash .github/bubbles/scripts/collected-test-count-guard.sh <feature> --verbose` | 0 | No Feature 028 evidence claims a zero-test run. | `5684e05261b503684315d95f4101abbe5d6596051f1e5797cfaf9f595628a5bb` |
| Scope 01 mock/interception and skip/exclusive/todo scan | 0 | 0 mock/interception matches and 0 skip/exclusive/todo matches. | `ef0017d51c526e9208a464a0f4a24df43d833c42d1e2b0882bb77150afa30a46` |
| `bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict` | 0 | 0 stale receipts; scenario receipts use source-revision binding rather than optional input closures. | `23784a48ba9f251d02aff3c3a7e66e8a6b54fa56e8e7c77178f91247cdeb02a1` |
| `bash .github/bubbles/scripts/receipt-identity-selftest.sh` | 0 | 20 passed, 0 failed. | `3ced4914073d35996088ebaef08fa40bd3e3776aea824a305e1452572a845e4c` |
| `bash .github/bubbles/scripts/scenario-test-resolve.sh <feature> --repo-root .` | 1 | All 7 Scope 01 linked targets resolve. The reported 17 unresolved references belong only to Scopes 02 through 05. | `2b0a0ddb471c14df9bfbda33a60f97b196e109f692d225f007d802cfbb33110a` |

The test-mechanism, self-validating, and mock audits remain coherent with the planned mechanisms. The RED controls perturb inputs that production code validates or transforms. The GREEN assertions observe production-computed state, refusal codes, persisted private candidates, real Git status, and exact restored bytes. None can pass by replacing the owning production path with `return input`.

### Test-Owned Finding Accounting

| Finding | Test-owned disposition |
| --- | --- |
| `VAL-028-S01-SCENARIO-RECEIPTS` | Closed for `SCN-028-005` through `SCN-028-010`: current RED, Git-backed implementation observation, GREEN_TARGETED, applicable GREEN_LIVE, and REGRESSION_GREEN receipts derive correctly. `OBSERVED` is not applicable. |
| `VAL-028-S01-TEST-PROVENANCE` | Closed by the matching `test` completed-phase claim and execution-history row in `state.json`, backed by this section. |
| `VAL-028-S01-G072` | Closed by local `**Claim Source:** executed` tags on the two ordered RED/GREEN sub-blocks. |
| `VAL-028-S01-SHARED-WARNING` | Closed by the test-owned ESM load-order fix and unfiltered warning-traced GREEN run. |

Scope 01 remains `in_progress`. No certification field was changed, Scope 02 was not started, and human acceptance was not inspected or altered.

## Scope 01 Validate-Owned Certification — 2026-08-29

**Agent:** `bubbles.validate`
**Scope:** `01-company-publication-foundation`
**Candidate revision:** `5f5caf16ac914bae67b990cc40bd7d1e025250c3`
**Claim Source:** interpreted
**Interpretation:** Scope 01 is independently certifiable. The canonical whole-feature terminal checks remain nonzero only for later-scope, full-pipeline, and human-acceptance obligations. This certification does not claim Scope 02 or whole-feature completion.

### Scope 02 Outcome Contract Verification

| Field | Scope 01 evidence | Status |
| --- | --- | --- |
| Intent | The production CLI executes `prepare`, `bind-plan`, and `inject-owner-read` without publication authority. | Pass |
| Success Signal contribution | SCN-028-005 produces one real company owner read and no coverage-only company outcome. | Pass |
| Hard Constraints | SCN-028-006 through SCN-028-010 preserve fifteen dimensions, four isolated horizons, explicit degraded states, cutoff refusal, bounded plans, privacy, and Feature 025 compatibility. | Pass |
| Failure Condition | The process replay refuses promotion and leaves source pointer and brief bytes unchanged. Coupled-publication and public-delivery conditions remain owned by later scopes. | Pass for Scope 01 |

### Current Command Matrix

| Command | Exit | Scope 01 interpretation |
| --- | ---: | --- |
| `node scripts/build-pages-site.mjs` | 0 | Current Pages build completed. |
| `node scripts/validate-node-source-lock.mjs` | 0 | Source lock passed; 16 adversarial mutations rejected. |
| `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs` | 0 | 99 passed, 0 failed, 0 skipped. |
| `node --trace-warnings --test tests/distributed-briefs.distributed-publish.unit.mjs` | 0 | 3 passed with no warning. |
| `bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict` | 0 | No stale receipt. |
| `bash .github/bubbles/scripts/scenario-state-resolve.sh ... --certifiable` | 1 | SCN-028-005 through SCN-028-010 are `REGRESSION_GREEN`; only later scenarios are `PLANNED`. |
| `bash .github/bubbles/scripts/artifact-lint.sh <feature>` | 0 | Checked evidence and artifact shape pass. |
| `bash .github/bubbles/scripts/regression-quality-guard.sh <four Scope 01 tests>` | 0 | 0 violations, 0 warnings. |
| `bash .github/bubbles/scripts/claim-source-lint.sh <feature>` | 0 | Every execution block has a valid tag. |
| `bash .github/bubbles/scripts/state-transition-guard.sh <feature> --target-status done ...` | 1 | Check 9 accepts all 16 checked DoD items. Remaining terminal failures are not Scope 01 obligations. |
| `node scripts/selftest.mjs` | 1 | 3,459 pass and nine failures remain assigned to planned Scopes 04 and 05. |

### Current Scope 01 Product Replay

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `9256e7d440ed8059d1a4ac9531b64309ab0f4c319c1693d0882ae2cbeab830c8` over 107 output lines.

```text
# Scope 01 current 99-test replay
$ node --test tests/company-intelligence-publication.unit.mjs tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/company-intelligence.unit.mjs
exit: 0
lines: 107
sha256: 9256e7d440ed8059d1a4ac9531b64309ab0f4c319c1693d0882ae2cbeab830c8
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome
✔ SCN-028-006 headless composition preserves fifteen states and four isolated horizons
✔ Mutation: SCN-028-007 missing and stale owner reads remain named and cannot become fresh claims
✔ Mutation: SCN-028-008 evidence after the frozen cutoff is rejected from every horizon
✔ SCN-028-009 signed bounded plan is enriched from the frozen source catalogue
✔ Mutation: SCN-028-010 malformed unsigned cross-subject late and over-budget plans fail closed
✔ Privacy mutation: company owner reads reject private fields and action authority
✔ Regression canary: Feature 025 UMD and v1 contracts remain readable beside publication v2
ℹ tests 99
ℹ pass 99
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

### Current Receipt and Guard Classification

**Phase:** validate
**Command:** strict receipt check, receipt-derived scenario-state resolver, and registry-asserted state-transition guard
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The feature-wide resolver and terminal guard correctly remain nonzero. Their output directly shows all six Scope 01 scenarios at `REGRESSION_GREEN` and all 16 checked Scope 01 DoD items accepted. The failed rows name later-scope planning, missing later test files, unexecuted terminal phases, feature-level G097/G136, and the pre-certification empty completed-scope state.

```text
RECEIPT_CHECK_EXIT=0
SCENARIO_STATE_RESOLVER_EXIT=1
SCN-028-005 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-028-006 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
SCN-028-007 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-028-008 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
SCN-028-009 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED REGRESSION_GREEN]
SCN-028-010 state=REGRESSION_GREEN derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED GREEN_LIVE REGRESSION_GREEN]
Check 9: DoD Evidence Presence
PASS: All 16 checked DoD items across resolved scope files have evidence blocks
failedGateIds: [G022,G027,G068,G097,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
exitStatus: 1
verdict: FAIL
```

### Finding Accounting

**Addressed:** `VAL-028-PHASE-ANALYZE`, `VAL-028-S01-SCENARIO-RECEIPTS`, `VAL-028-S01-TEST-PROVENANCE`, `VAL-028-S01-G072`, `VAL-028-S01-CORE-EVIDENCE`, `VAL-028-S01-G027`, `VAL-028-S01-SHARED-WARNING`, `VAL-028-S01-TEST-OUTCOME`, and `VAL-028-S01-TRACEABILITY`.

**Unresolved for the feature:** later-scope `PLANNED` receipt states; Scope 02 through 05 G068 and regression-DoD gaps; missing Scope 04/05 test files and titles; Scope 05 G097; nine repository-selftest failures assigned to Scopes 04/05; unexecuted full-delivery phases; and terminal-only G136 human acceptance. These findings do not become Scope 01 passes and remain open.

### Scope 01 Certification Disposition

Scope 01 is certified `Done`. Feature status and overall certification remain `in_progress`. Scopes 02 through 05 remain `Not Started`. Human acceptance remains unchecked. The next eligible owner is `bubbles.implement` for Scope 02.

## Scope 02 Implement-Owned Reverification — 2026-08-29

### Scope 02 Candidate Audit and Repair

**Phase:** implement
**Claim Source:** executed

The inherited candidate had three independently reproduced defects.

1. A second promotion of the selected generation returned `C028-PREDECESSOR-DRIFT` instead of a no-write resume.
2. A changed coupled selector did not trigger predecessor-drift refusal before candidate writes.
3. Declared staging reported expected hashes without reading the actual Git index bytes.

The repair validates the frozen coupled selector with the subject predecessors. It accepts an already-selected generation only when every declared byte still matches. It maps changed company-version bytes to `C028-GENERATION-COLLISION`. It also derives staged hashes from each actual indexed blob.

### Scope 02 RED and GREEN Evidence

**Phase:** implement
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**RED Exit Code:** 1
**GREEN Exit Code:** 0
**Claim Source:** executed
**Sensitivity mutation:** `scripts/brief-publication.mjs` changed the coupled selector phase to `candidate` for the RED execution only.
**RED Capture:** `f06cacb81e1ea6b2f3fd83484e28da31005e119724ac3a7359d37d6587805806` over all 34 output lines.
**GREEN Capture:** `2c28c05ecc2a8ae8c8a0c7387f1f896e7d925a922bf7c2a3e5c9da1ef97a96f1` over all 13 output lines.
**Restoration:** SHA-256 `d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3` and Git object `b8e84a9ca86c0ae4e11efc4c0f0e7598019c49c8` matched the pre-mutation values before GREEN.

```text
# Feature 028 Scope 02 selector-phase sensitivity RED
$ node --test tests/company-intelligence-publication.integration.mjs
exit: 1
lines: 34
sha256: f06cacb81e1ea6b2f3fd83484e28da31005e119724ac3a7359d37d6587805806
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (30.569667ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (225.254125ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (159.287792ms)
✖ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (46.205292ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (92.219625ms)
ℹ tests 5
ℹ suites 0
ℹ pass 4
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 607.080834

✖ failing tests:

test at tests/company-intelligence-publication.integration.mjs:591:1
✖ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (46.205292ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected

  + 'candidate'
  - 'coupled-selector'

      at TestContext.<anonymous> (file:///private/tmp/research-lab-company-intelligence-delivery-r3/tests/company-intelligence-publication.integration.mjs:672:12)
      at async Test.run (node:internal/test_runner/test:1389:7)
      at async Test.processPendingSubtests (node:internal/test_runner/test:960:7) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 'candidate',
    expected: 'coupled-selector',
    operator: 'strictEqual',
    diff: 'simple'
  }

SENSITIVITY_RESTORE expected_sha256=d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3 actual_sha256=d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3 expected_object=b8e84a9ca86c0ae4e11efc4c0f0e7598019c49c8 actual_object=b8e84a9ca86c0ae4e11efc4c0f0e7598019c49c8
# Feature 028 Scope 02 selector-phase sensitivity GREEN
$ node --test tests/company-intelligence-publication.integration.mjs
exit: 0
lines: 13
sha256: 2c28c05ecc2a8ae8c8a0c7387f1f896e7d925a922bf7c2a3e5c9da1ef97a96f1
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (49.00875ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (270.693333ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (116.93525ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (56.513042ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (102.802208ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 646.087375
```

### Scope 02 Deterministic Identity, Collision, and Resume

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `904e61da9b4abaf16d48e74d0b7b4387c833d5ba78852fad81f8e807b6216493` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (30.038ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (258.063625ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (88.105459ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (54.077791ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (133.180875ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 616.864916
```

### Scope 02 Durability and Pointer Order

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `d70deba00d4e7a89cbf09fc7b79ba9445636d8781693e0387746483a0bdf4d82` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (29.221ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (226.968083ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (82.784167ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (47.81375ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (89.940625ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 528.8685
```

### Scope 02 On-Disk Coherence

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `d2c1c1ef1d487249d8a55c7bbe2b56be41218c45b1ffa35eceed70b80ae67246` over all 13 output lines.

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (312.318375ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (1107.96975ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (638.932625ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (135.572458ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (250.90475ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2553.754834
```

### Scope 02 Shared Impact, Consumers, Restore Contract, and Boundary

**Phase:** implement
**Executed:** YES (current session)
**Command:** `node --trace-warnings --test tests/distributed-briefs.distributed-publish.unit.mjs`, followed by `goal-fidelity-guard.sh --boundary post-finding` over all eight changed paths
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `78a56347f4afa99c149c4181c4ad1fc03dee0ec496c29226868e0a148d7f2486` over all 17 output lines.
**Related refusal proof:** [TP-02-02](#tp-02-02) preserves both selectors and the brief before any candidate write.
**Related ordering proof:** [TP-02-03](#tp-02-03) refuses invalid order, index-byte drift, and incoherent disk bytes.

```text
SCOPE02_SHARED_IMPACT_BEGIN
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (30.65075ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (16.22975ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (8.679708ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (32.962458ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 140.993875
SHARED_CANARY_EXIT=0
goal-fidelity-guard: PASS boundary=post-finding
GOAL_BOUNDARY_EXIT=0
SCOPE02_SHARED_IMPACT_END
```

The strict status classifier reported eight allowed changed paths, one pre-existing worktree marker, zero Feature 025 or tracked-data changes, and zero unexpected changes. Its full-output capture is `c4de5827cb3bb53600a0837ee3c9e35966574e91cb949dac76158a08d446ff0e`.

### Scope 02 Final Implement-Owned Build Quality

**Phase:** implement
**Executed:** YES (current session)
**Claim Source:** executed

This evidence is limited to Scope 02. It does not claim a repository-global pass, later-scope completion, human acceptance, or certification.

| Check | Exit | Current result | Full-output capture |
| --- | ---: | --- | --- |
| Changed JS/MJS syntax parse | 0 | Five changed implementation and test files parsed; zero failures. | `154771141702c8a3f893bf03f3b25dc7355feedf26f0e1892ff98f87f60c8c5e` |
| TP-02-01 through TP-02-04 integration | 0 | Five tests passed; zero failed, skipped, or todo. | `ae3b6ffe322257411692e595375de62f8c892619a5e70bc4918febbe575a1b60` |
| TP-02-05 process E2E | 0 | Two production-CLI tests passed; zero failed, skipped, or todo. | `b0806af52e82988a0c25e51d9c82049d0048ae3058750393e8e10ecf866da9b7` |
| TP-02-06 shared primitive canary | 0 | Four tests passed; zero failed, skipped, or todo. | `e751e8505975c490507b38fc9386f3b8b676072e3f8c4a062715cc3e80839aa9` |
| Regression-quality guard | 0 | Three Scope 02 test files; zero violations and zero warnings. | `b970cdfbd8d9cb1e6926d7dd7d959c5fb2d2af3f857bbb6734ee11d0c8c024e0` |
| Node source lock | 0 | Actual source lock passed; sixteen adversarial source mutations were rejected. | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Implementation-reality scan | 0 | Zero violations; one file-discovery warning retained below. | `50fb939a25a90e7be6fb6659878f7eeeda463722c04f2cab83c50bc5c895df7e` |
| Artifact lint before final record | 0 | Feature artifact shape and existing checked evidence passed. | `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3` |
| Scenario-obligation and test-mechanism checks | 0 | Twenty-two scenario obligations and mechanisms were coherent. | `bf4176c93343342772deaf20b3015aab9348ddb270cb9e764656e976352e7f5f` |
| Goal contract and post-finding boundary | 0 | Goal revision 3 verified; all eight changed paths remained in the frozen boundary. | `621166e6b0520c05ef3547900c07f0c4ed79b5d6139c5e08f9f924b498e033e6` |
| `git diff --check` and strict Scope 02 changed-path boundary | 0 | Eight expected paths, one worktree marker, zero Feature 025 or tracked-publication-data changes, zero staged or unexpected paths. | `c52bc34525e7bb1bc388a342a83ec2c60c7e2c415c8f29b6190f56faf0bb3194` |
| Incomplete-marker, mock/interception, and skip/exclusive scans | 0 | Five files checked; zero incomplete, mock, interception, skipped, or exclusive markers. | `ace458f61426576f6b6af202b5f1e74da0b71a3b5ce7f5e0543b59249b52e390` |
| Domain invariant and model checks | 0 | Six invariants anchored; shared domain declarations consistent. | `698498b3186940874473975df82615ee2a706952db49d045df695b00a377400b` |
| Exact Scope 02 scenario target resolution | 0 | SCN-028-011, SCN-028-013, SCN-028-014, and SCN-028-021 resolved to exact existing test titles. | `2796613eb61f08f23cbd447ae2610c79e85273f818cf712b6af709d037a0b0b4` |
| Scope 02 Test Plan parity and file existence | 0 | Six unique TP-02 rows mapped to three existing test files. | `746a31daa3b0d1b0c3f77283ca37862fd719a039108a5869ab2a826c478cc355` |
| Goal-fidelity pre-certification diagnostic | 0 | The current feature packet satisfied the goal-fidelity boundary. | `3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46` |

**Current literal changed-file parse execution:**

```text
SCOPE02_PARSE_BEGIN
PARSE_CHECK_BEGIN path=scripts/brief-publication.mjs
PARSE_CHECK_RESULT path=scripts/brief-publication.mjs exit=0
PARSE_CHECK_END path=scripts/brief-publication.mjs
PARSE_CHECK_BEGIN path=scripts/company-intelligence-publication.mjs
PARSE_CHECK_RESULT path=scripts/company-intelligence-publication.mjs exit=0
PARSE_CHECK_END path=scripts/company-intelligence-publication.mjs
PARSE_CHECK_BEGIN path=tests/company-intelligence-publication.e2e.mjs
PARSE_CHECK_RESULT path=tests/company-intelligence-publication.e2e.mjs exit=0
PARSE_CHECK_END path=tests/company-intelligence-publication.e2e.mjs
PARSE_CHECK_BEGIN path=tests/company-intelligence-publication.integration.mjs
PARSE_CHECK_RESULT path=tests/company-intelligence-publication.integration.mjs exit=0
PARSE_CHECK_END path=tests/company-intelligence-publication.integration.mjs
PARSE_CHECK_BEGIN path=tests/distributed-briefs.distributed-publish.unit.mjs
PARSE_CHECK_RESULT path=tests/distributed-briefs.distributed-publish.unit.mjs exit=0
PARSE_CHECK_END path=tests/distributed-briefs.distributed-publish.unit.mjs
SCOPE02_PARSE_SUMMARY files=5 failures=0
SCOPE02_PARSE_END
```

**Current literal TP-02-01 through TP-02-04 execution:**

```text
# Scope 02 final TP-02-01 through TP-02-04 integration
$ node --test tests/company-intelligence-publication.integration.mjs
exit: 0
lines: 13
sha256: ae3b6ffe322257411692e595375de62f8c892619a5e70bc4918febbe575a1b60
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (29.714583ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (222.891083ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (95.2455ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (50.252084ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (95.603125ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 544.2685
```

**Current literal TP-02-05 and TP-02-06 execution:**

```text
# Scope 02 final TP-02-05 process E2E
$ node --test tests/company-intelligence-publication.e2e.mjs
exit: 0
lines: 10
sha256: b0806af52e82988a0c25e51d9c82049d0048ae3058750393e8e10ecf866da9b7
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (617.871083ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1657.019583ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2317.634958
# Scope 02 final TP-02-06 shared primitive canary
$ node --test tests/distributed-briefs.distributed-publish.unit.mjs
exit: 0
lines: 12
sha256: e751e8505975c490507b38fc9386f3b8b676072e3f8c4a062715cc3e80839aa9
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (31.5895ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (15.709667ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (10.09625ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (17.250875ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 122.298542
```

**Current literal strict boundary execution:**

```text
SCOPE02_STRICT_BOUNDARY_BEGIN
GIT_DIFF_CHECK_EXIT=0
BOUNDARY_PATH code= M class=scope02-allowed path=scripts/brief-publication.mjs
BOUNDARY_PATH code= M class=scope02-allowed path=scripts/company-intelligence-publication.mjs
BOUNDARY_PATH code= M class=scope02-allowed path=specs/028-company-intelligence-publication-and-brief-transaction/report.md
BOUNDARY_PATH code= M class=scope02-allowed path=specs/028-company-intelligence-publication-and-brief-transaction/scopes.md
BOUNDARY_PATH code= M class=scope02-allowed path=specs/028-company-intelligence-publication-and-brief-transaction/state.json
BOUNDARY_PATH code= M class=scope02-allowed path=tests/company-intelligence-publication.e2e.mjs
BOUNDARY_PATH code= M class=scope02-allowed path=tests/company-intelligence-publication.integration.mjs
BOUNDARY_PATH code= M class=scope02-allowed path=tests/distributed-briefs.distributed-publish.unit.mjs
BOUNDARY_PATH code=?? class=preexisting-worktree-control path=.bubbles-worktree
SCOPE02_ALLOWED_CHANGED_COUNT=8
SCOPE02_EXPECTED_CHANGED_COUNT=8
PREEXISTING_CONTROL_COUNT=1
FEATURE025_CHANGED_COUNT=0
TRACKED_PUBLICATION_DATA_CHANGED_COUNT=0
UNDECLARED_STAGED_PATH_COUNT=0
UNEXPECTED_CHANGED_COUNT=0
STRICT_SCOPE02_BOUNDARY_FAILURES=0
STRICT_SCOPE02_BOUNDARY_RESULT=PASS
SCOPE02_STRICT_BOUNDARY_END
```

The implementation-reality command emitted one non-blocking discovery warning because it found zero files in a section named `### Implementation Files` and used the design references. It scanned fourteen files and reported zero violations. The repository-wide scenario resolver also reported thirteen unresolved references. Every reported reference belongs to planned Scopes 03 through 05. The exact Scope 02 resolver above passed all four active Scope 02 scenarios. Neither diagnostic is represented as a repository-global pass.

## Scope 02 Test-Owned Independent Verification — 2026-08-29

### Authority, Epoch, and Ownership

**Phase:** test
**Claim Source:** executed

The installed repository-binding validator accepted decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:8` at control revision `8`. It accepted the packet before this invocation read the candidate. The tested repository HEAD was `cfbfd60c0b360a083fbda70957213823cd834b48`. This phase did not edit product or test files. The sensitivity probe restored `rlcompanyintel.js` to Git object `56d98533bfdf6e114d60378490529f82dd75c4c4` before every GREEN and Test Plan execution.

The current project configuration declares neither `testImpact` nor `traceContracts`. Impact planning and trace or SLO capture are therefore not applicable to this scope. The test phase does not claim Scope 02 certification, whole-feature completion, human acceptance, or any Scope 03 through Scope 05 behavior.

### Test-Owned RED to GREEN Sensitivity

**Phase:** test
**Command:**

```text
/opt/homebrew/bin/bash scripts/red-green-probe.sh --file rlcompanyintel.js --find '        return "company:" + subject.ticker.toLowerCase() + ":" + generation.etSessionDate +
            ":" + generation.window + ":" + suffix;' --replace '        return "company:" + subject.ticker.toLowerCase() + ":" + generation.etSessionDate;' --label 'SCN-028-011 same-day identity requires window and generation digest' --bound 120 -- node --test tests/company-intelligence-publication.integration.mjs
```

**Exit Code:** 0
**Claim Source:** executed
**Capture:** `96d0656d4e25c11ea6ef3eb150d809c6337d27633c381d8378a7653b21a7f08a` over all 13 output lines.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-028-011 same-day identity requires window and generation digest
file:             rlcompanyintel.js
mutation:         window-and-digest version identity -> date-only version identity   (1 occurrence)
command:          node --test tests/company-intelligence-publication.integration.mjs
red-exit:         1
red-summary:      }
green-exit:       0
green-summary:    ℹ duration_ms 629.594875
revert-verified:  yes (committed=56d98533bfdf6e114d60378490529f82dd75c4c4 restored=56d98533bfdf6e114d60378490529f82dd75c4c4)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The mutation removed both the publication window and generation digest from the production version identity. The same integration command turned RED and then GREEN after structural restoration. This demonstrates that the same-day collision assertions are sensitive to the production identity rule rather than merely replaying fixture values.

### Exact TP-02-01 Through TP-02-06 Replay

**Phase:** test
**Claim Source:** executed

| Test Plan row | Exact command | Exit | Collected / passed / failed / skipped / todo | Full-output capture |
| --- | --- | ---: | --- | --- |
| `TP-02-01` | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 5 / 5 / 0 / 0 / 0 | `b43e7dce243966bc5c0a80b1ee15b8be15822ec024cef2d5463e513dc570c4b5` |
| `TP-02-02` | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 5 / 5 / 0 / 0 / 0 | `c489ac682a56d969f6481861f3462d948689bd08f68039c89cdbc2c48f329055` |
| `TP-02-03` | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 5 / 5 / 0 / 0 / 0 | `93829de355f4b77d512996504e09316333408b3623bdb6cb099da42ed75d115f` |
| `TP-02-04` | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 5 / 5 / 0 / 0 / 0 | `a0dd048afd391c888c7204188827d8e52265a6d6bef7fdac903b6ab34a49ffca` |
| `TP-02-05` | `node --test tests/company-intelligence-publication.e2e.mjs` | 0 | 2 / 2 / 0 / 0 / 0 | `eb08b36c20a53cd0876a9b78e4b2d3e0ad4dbdd748cf2ec0281f73d3c0a73ca2` |
| `TP-02-06` | `node --test tests/distributed-briefs.distributed-publish.unit.mjs` | 0 | 4 / 4 / 0 / 0 / 0 | `54fd14bb22cdd267f9ff80a74f3a1828635fe43a8d4e8c170c089437e41141ff` |

**Exact integration output for the final TP-02-04 replay:**

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (29.787917ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (254.17425ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (94.985833ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (53.384875ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (109.437584ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 593.462583
```

**Exact TP-02-05 process output:**

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (626.614791ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1779.565625ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2449.210708
```

**Exact TP-02-06 canary output:**

```text
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (33.609917ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (19.367208ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (10.88025ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (20.190833ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 135.471042
```

The six commands were also re-executed through the test-owned `.specify/runtime/scope02-test-tool-calls.jsonl` receipt epoch. Strict receipt validation reported `total=6`, `current=3`, `superseded=3`, `valid=3`, `stale=0`, and `unknown=0`. The four identical integration commands intentionally share one receipt identity. Their distinct current-session output hashes remain listed above.

### Test Integrity and Mechanism Audit

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Source inspection and current execution agree on the mechanism classifications below. The production-path conclusions require reading the test bodies in addition to observing the passing runner output.

- The integration suite imports the real publication modules and uses real `mkdtemp` filesystem paths. It verifies byte rereads, collisions, predecessor drift, pointer order, resume, and disk coherence.
- The process E2E invokes the real production CLI through `spawnSync`. It initializes and commits a temporary Git repository, then stages the promoted inventory.
- The process E2E reads each indexed blob through `git show :path`. It compares each reported hash with the bytes read from that index.
- TP-02-03 injects one Git-runner response only for the index-byte-drift negative control. That external-process fault does not satisfy the process E2E claim.
- TP-02-05 independently verifies the successful staging path against a real Git index.
- The distributed-publication canary runs the existing producer and validators in isolated roots. It records actual write order and requires `briefs/current.json` to be last.
- Static scans found zero mock or interception patterns across all three Scope 02 test files. They also found zero skip, exclusive, todo, pending, or incomplete markers.
- The assertions observe production-computed identities, refusal codes, write order, persisted bytes, indexed bytes, and reconstructed disk state. The date-only mutation proves that an incorrect identity rule fails.
- The final cleanup check found zero matching temporary directories and zero matching child processes. Every fixture root was isolated from the source checkout.

### Test-Owned Guard Matrix

**Phase:** test
**Claim Source:** executed

| Check | Exit | Current result | Full-output capture |
| --- | ---: | --- | --- |
| Full linked-test resolver before execution | 1 | Eleven of 24 references resolved. All four Scope 02 scenario references resolved; thirteen failures name planned Scope 03 through Scope 05 targets. | `b7f67be21d13820c8c6383121dbbdd18e1119db4750797de9f0cd8cc5bf99c9b` |
| Exact Scope 02 scenario and Test Plan resolver | 0 | Four scenarios and six rows resolved to existing files and literal titles. | `47c4a65078f7d42cbe5279433f892c8f46335d367f95aac521530ad7574e15ae` |
| Whole-feature traceability | 1 | Scope 02 mapped four scenarios to six concrete rows and evidence. Ten failures belong to unimplemented Scope 04 and Scope 05 test targets. | `5eb7012e021da7f9d79bfad9b7ae3e99483d8ff6721b140c1ff93fd3946b9574` |
| Regression-quality guard | 0 | Three files, zero violations, zero warnings. | `a1be2f14ff9a1208d8b57d5310ebc5ea5b508bd95a7cea9d1eab5a7567a0ceae` |
| Node source lock | 0 | Actual lock passed and all sixteen adversarial source mutations were rejected. | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Scenario-obligation lint | 0 | Twenty-two scenario obligation matrices were coherent. | `b83fa7583517d153789f13facf79bd25e61529881fc9a25b3e8c41d409788078` |
| Test-mechanism lint | 0 | Twenty-two mechanisms were coherent; the mutation adapter is intentionally inert. | `796e7eae922225a7c8d9252387e0051b698195dc5462834cd979c16af0f0ec88` |
| Collected-test-count guard | 0 | Two evidence files scanned; no block claims a zero-test run. | `8a2f6cfb05a82590a5196d0af831c77d60bc6e5be992e4b23c255f8b254a4e05` |
| Claim-source lint before this section | 0 | Every command evidence block carried a valid provenance tag. | `6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653` |
| Environment-pollution scan | 0 | No test-to-production monitoring, backup, manifest, or release-control write was found. | `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61` |
| Implementation-reality scan | 0 | Fourteen files scanned, zero violations. Its one discovery warning records use of design references after the scope parser found no implementation-file section. | `50fb939a25a90e7be6fb6659878f7eeeda463722c04f2cab83c50bc5c895df7e` |
| Domain-invariant guard | 0 | Six declared invariants have implementation anchors. | `ab5fd21c20fa035959e8cc62b86432266c412d2b731f1c1a7c02703b720ea76b` |
| Goal-fidelity post-finding boundary | 0 | All eight tracked candidate paths remained inside Goal Contract revision 3. | `bb777a7f384a28a8160279b55f018680351f98493b2b0c78ffe4ff255b049ad8` |
| Fresh test-owned receipt validation | 0 | Three current receipt identities, all valid, with zero stale or unknown entries. | `43a88c50fb1f7be43f17d4407569b3c3b61c1250cbcfbc9a09390a8c4ec9e590` |

The inherited default receipt log predates the final candidate bytes. Strict inspection reported 28 historical entries as stale. Its capture is `71254ec81108030e062b138fac23f723bd14812a61c325d43b7124b653823b9d`. This test phase did not use those entries as proof. It created and checked the current test-owned receipt epoch described above. The whole-feature scenario-state diagnostic remains nonzero because Scopes 03 through 05 are still planned. Scope 02 appeared at `REGRESSION_GREEN`. This phase relies on the current Test Plan executions instead of that inherited derivation.

### Scope 02 Test Disposition

No Scope 02 test or production defect was found. The current test phase verified deterministic identity, collision-safe history, predecessor-drift refusal, and coupled manifest and selector identity. It also verified pointer-last ordering, actual Git-index byte hashes, disk coherence, idempotent resume, and unchanged-conclusion versioning. The existing distributed publication canary passed without changes.

The full linked-test and traceability commands remain nonzero only for planned Scope 03 through Scope 05 targets. Those later-scope findings remain visible and are not represented as whole-feature success. Certification remains `in_progress`, `certification.completedScopes` remains Scope 01 only, and human acceptance remains unchanged.

<a id="validation-scope-02-refusal"></a>

## Scope 02 Validate-Owned Certification Refusal — 2026-08-29

### Authority, Goal Boundary, and Provenance

**Phase:** validate
**Claim Source:** executed

The exact actionable repository packet passed `repository-binding.sh validate-packet` at decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:8`, control revision `8`, before this validation read the candidate. The repository mirror, Goal Contract `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3` revision `3`, and the parent `phase_4_verify` snapshot matched exactly.

The provenance probe found exactly one Scope 02 `implement` claim and history row, exactly one Scope 02 `test` claim and history row, 11 of 11 checked Scope 02 DoD items, a validate-certified Scope 01 dependency, empty transition and rework queues, and no extra Scope 02 execution-history row. The exact transient `completed_owned` envelope text is not persisted in repository state or runtime files, so this validation did not use that handoff wording as proof. It independently replayed the owned behavior instead.

```text
ASSERT_PASS exact actionable packet mirror
ASSERT_PASS full-delivery nonterminal mirrors
ASSERT_PASS Goal Contract revision 3 frozen and approved
ASSERT_PASS parent phase_4_verify snapshot
ASSERT_PASS Scope 01 certified dependency
ASSERT_PASS Scope 02 eligible and Scope 03 depends on it
ASSERT_PASS Scope 02 DoD exactly 11 of 11 checked
ASSERT_PASS exactly one Scope 02 implement claim
ASSERT_PASS exactly one Scope 02 test claim
ASSERT_PASS exactly one Scope 02 implement history
ASSERT_PASS exactly one Scope 02 test history
ASSERT_PASS Scope 02 execution history contains only implement and test
ASSERT_PASS implement and test evidence sections
ASSERT_PASS transition and rework queues closed
SCOPE02_PROVENANCE_SUMMARY dod=11/11 implementClaims=1 testClaims=1 histories=2 completedScopes=01-company-publication-foundation
```

### Scope 03 Outcome Contract Verification After Repair

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Scope 02 proves only the immutable-promotion contribution to the feature outcome. Public registration, whole-transaction restoration, trigger parity, terminal phases, and human acceptance remain outside this sequential boundary and are not presented as delivered.

| Field | Scope 02 evidence | Status |
| --- | --- | --- |
| Intent contribution | Production CLI assembles, promotes, stages, and validates one coupled company-and-brief generation | demonstrated for Scope 02 |
| Success-signal contribution | Immutable company versions and the content-addressed manifest become durable before subject, brief, and coupled pointers; the coupled selector is final | demonstrated for Scope 02 |
| Hard constraints | Scope 01 remains certified; Feature 025 paths, tracked publication data, primary checkout, and framework-managed paths are absent from the eight-path candidate delta | demonstrated for Scope 02 |
| Failure condition | Collision, predecessor drift, staged-byte drift, non-canonical manifest paths, illegal phase transitions, immutable predecessor mutation, and disk incoherence are rejected by current tests | demonstrated for Scope 02 |
| Whole-feature outcome | Scopes 03 through 05, terminal phases, and human acceptance remain open | not claimed |

### Current Scope 02 Test Replay

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (56.029375ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (574.89825ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (214.321333ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (107.163625ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (200.057167ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1281.984458
```

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (805.155875ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (2228.831666ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3086.263542
```

**Phase:** validate
**Command:** `node --test tests/distributed-briefs.distributed-publish.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (37.32675ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (23.252292ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (14.780083ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (33.89625ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 177.996208
```

### Current Receipt and Candidate Integrity

**Phase:** validate
**Command:** `bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/scope02-test-tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed

```text
{
  "total": 6,
  "current": 3,
  "superseded": 3,
  "withClosure": 3,
  "valid": 3,
  "stale": 0,
  "unknown": 0,
  "staleReceipts": []
}
```

The four identical integration commands intentionally collapse to one current receipt identity. The three current identities cover integration, process E2E, and the shared canary. The canonical default log is different: strict validation exited `1` with `28` stale entries and capture SHA-256 `71254ec81108030e062b138fac23f723bd14812a61c325d43b7124b653823b9d`. The state-transition guard reads that canonical log and therefore blocks certification despite the current custom test log.

The six production and test inputs retained their exact pre-replay SHA-256 values. The post-replay check reported eight expected changed paths, zero staged paths, only the pre-existing `.bubbles-worktree` marker, zero fixture residue, zero child-process residue, and `git diff --check` exit `0`.

```text
BYTE_IDENTITY PASS sha256=6fee464a8da06060f5fa8460bf149340f8b971f00716a1cf19c66ba6838a461f path=rlcompanyintel.js
BYTE_IDENTITY PASS sha256=d6fc3862962e6862659a2f2ef83296dfb4c37ef1cbefbb4f31d521ed9aced9e3 path=scripts/brief-publication.mjs
BYTE_IDENTITY PASS sha256=cfa8fe22fb501682461b4585c590f4bbb94e45a13fe04e4964f693fa2877670a path=scripts/company-intelligence-publication.mjs
BYTE_IDENTITY PASS sha256=f7ac9cb0d3c26d2ff8fd1be6e8432828ed4943177c48ea00854fa427f305e393 path=tests/company-intelligence-publication.integration.mjs
BYTE_IDENTITY PASS sha256=2940ac86e26ff8ad4c59200e7708ab14dd651b9e9db0d689d926af59c1962ad9 path=tests/company-intelligence-publication.e2e.mjs
BYTE_IDENTITY PASS sha256=b73a1f42c64f78280dc3af0e0b79f3029cefbadcaed3f7c80dc3df38880cb57b path=tests/distributed-briefs.distributed-publish.unit.mjs
CHANGE_BOUNDARY PASS changed=8 staged=0 untracked=.bubbles-worktree
FIXTURE_RESIDUE PASS count=0
CHILD_PROCESS_RESIDUE PASS count=0
SCOPE02_POST_REPLAY_INTEGRITY_FAILURES=0
GIT_DIFF_CHECK_EXIT=0
```

### Scope 02 Validate Gate Matrix

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** Exit-zero rows are direct command results. Nonzero rows remain failures. They are classified by owning scope only to enforce the requested sequential boundary; they are never relabelled as passes.

| Check | Exit | Current result |
| --- | ---: | --- |
| Repository packet validation | 0 | Exact decision, revision, digest, root, visibility, and actionability accepted |
| Session cap G128 | 0 | Aggregate wall clock, tool calls, and retained result bytes remain below active caps |
| Goal fidelity, pre-certification | 0 | Goal Contract revision 3 accepted |
| Persisted mode resolution | 0 | `full-delivery` resolved with the required grandfather flag; ceiling `done` |
| Transition contract resolver | 0 | Target `done`, digest `sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93`, revision `sha256:3da0f34ac003f604688935d14bbfec018f1f29f2508616b34e9a532b340d3c58` |
| Artifact lint | 0 | 40 lines, SHA-256 `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3` |
| Implementation reality | 0 | Fourteen files, zero violations, one discovery warning; SHA-256 `50fb939a25a90e7be6fb6659878f7eeeda463722c04f2cab83c50bc5c895df7e` |
| Changed-module parse | 0 | Five files, zero parse failures |
| Regression-quality guard | 0 | Three files, zero violations and zero warnings |
| Source lock | 0 | Actual lock passed; sixteen adversarial mutations rejected |
| Claim-source lint | 0 | Every execution-evidence block carries a valid source tag |
| Collected-test-count guard | 0 | Two evidence files; no zero-test claim |
| Environment-pollution scan | 0 | No test-to-production write found |
| Artifact freshness | 0 | Zero failures and zero warnings |
| Scenario-obligation lint | 0 | Twenty-two coherent obligation matrices |
| Test-mechanism lint | 0 | Twenty-two coherent mechanisms; mutation adapter inert |
| Domain-invariant guard | 0 | Six invariants anchored |
| Domain-model consistency | 0 | Shared model consistent |
| Scoped linked-test resolver | 0 | All four Scope 02 references resolved |
| Scoped scenario-state resolver | 0 | All four Scope 02 scenarios reached receipt-derived `REGRESSION_GREEN` |
| Goal fidelity, post-finding | 0 | All eight changed paths remain inside revision 3 |
| Changed-spec done audit | 0 | Artifact lint passed; terminal checks correctly skipped for `in_progress` |
| Whole-feature linked-test resolver | 1 | Thirteen unresolved references belong to Scopes 03 through 05; capture `b7f67be21d13820c8c6383121dbbdd18e1119db4750797de9f0cd8cc5bf99c9b` |
| Whole-feature traceability | 1 | Ten missing-file findings belong to Scopes 04 and 05; capture `5d06c567c9c2cb796d4f397c380823f58598693d18ee707bc13b9050aa4eaba9` |
| Repository selftest | 1 | 3,459 passed and nine Scope 05 or not-yet-authored-path failures; capture `577ad427f4db09ef9d2dcc27b4f000fb6a535e6a5b818cbc9f3f0c6766a32f70` |
| Requirement-mechanism guard | 1 | The not-yet-implemented Scope 05 CSP mitigation remains open |
| Registry-asserted state-transition guard | 1 | Scope 02 planning and canonical-receipt blockers plus later-scope and terminal blockers; 538-line diagnostic capture `776af24bd8ebd2579448e7f5a3912bf2769168996a1a50ee02fe1a2ec68813f5` |
| Framework write guard | 1 | Five committed installed agent files differ from the installed checksum manifest; none is in the Scope 02 delta |

### Scope 02 Certification Findings

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The current product behavior is green, but the canonical transition guard identifies planning and receipt failures inside Scope 02. A checked DoD count cannot override those mechanical blockers.

| Finding | Exact evidence | Owner |
| --- | --- | --- |
| `VAL-028-S02-SCOPE-KIND` | `Scope-Kind` is recorded as `runtime-behavior.` with trailing punctuation, so the guard reports it as unrecognized | `bubbles.plan` |
| `VAL-028-S02-E2E-DOD-SCENARIO` | Check 8A reports no explicit DoD item for scenario-specific regression E2E coverage | `bubbles.plan` |
| `VAL-028-S02-E2E-DOD-BROAD` | Check 8A reports no explicit DoD item for broader E2E regression-suite coverage | `bubbles.plan` |
| `VAL-028-S02-G068-011` | Check 22 finds no structurally faithful DoD item for “Four daily windows do not collide” | `bubbles.plan` |
| `VAL-028-S02-G068-013` | Check 22 finds no structurally faithful DoD item for “Pointer drift breaks the candidate chain” | `bubbles.plan` |
| `VAL-028-S02-G068-014` | Check 22 finds no structurally faithful DoD item for “Current changes only after all candidates validate” | `bubbles.plan` |
| `VAL-028-S02-CANONICAL-RECEIPTS` | Check 43 reads `.specify/runtime/tool-calls.jsonl` and finds all 28 closure-bearing receipts stale; the separate current custom log does not satisfy that canonical check | `bubbles.test` after the plan repair |
| `VAL-028-S02-STATUS-PARITY` | The scope summary row says `Not Started` while the Scope 02 body says `In Progress` | `bubbles.plan` |

### Preserved Non-Scope-02 Findings

These failures remain non-passing and outside Scope 02's certification decision.

- `VAL-028-LATER-SCENARIO-TARGETS`: thirteen unresolved linked-test references belong to Scopes 03 through 05.
- `VAL-028-LATER-TRACEABILITY`: ten traceability failures belong to Scopes 04 and 05.
- `VAL-028-LATER-SELFTEST`: nine repository-selftest failures map to not-yet-authored tests and Scope 05's planned registration, route, compatibility, and positive-successor work.
- `VAL-028-LATER-G097`: the Scope 05 CSP mitigation has no implementation anchor yet.
- `VAL-028-TERMINAL-G022-G136`: nine full-delivery specialist phases and human acceptance remain terminal-only work.
- `VAL-028-INDEPENDENT-FRAMEWORK-INSTALL-DRIFT`: five committed installed agent files differ from `.github/bubbles/.checksums`; no framework path appears in this candidate delta. Ownership is `bubbles.devops` or the upstream framework installation owner.

### Scope 04 Validation Finding Accounting and Certification Disposition

**Addressed in this validation:** `VAL-028-S02-BINDING`, `VAL-028-S02-GOAL-REVISION`, `VAL-028-S02-DEPENDENCY`, `VAL-028-S02-PROVENANCE-UNIQUENESS`, `VAL-028-S02-TEST-REPLAY`, `VAL-028-S02-SOURCE-LOCK`, `VAL-028-S02-CLEANUP`, `VAL-028-S02-BYTE-IDENTITY`, `VAL-028-S02-CHANGE-BOUNDARY`, and `VAL-028-S02-SCOPED-SCENARIO-STATE`.

**Unresolved:** `VAL-028-S02-SCOPE-KIND`, `VAL-028-S02-E2E-DOD-SCENARIO`, `VAL-028-S02-E2E-DOD-BROAD`, `VAL-028-S02-G068-011`, `VAL-028-S02-G068-013`, `VAL-028-S02-G068-014`, `VAL-028-S02-CANONICAL-RECEIPTS`, and `VAL-028-S02-STATUS-PARITY`. The preserved non-Scope-02 findings above remain open under their declared owners.

Scope 02 is not certified. This invocation does not change `certification.*`, `certification.completedScopes`, either feature status mirror, Scope 02's status, human acceptance, product code, tests, Feature 025 artifacts, framework-managed files, or the primary checkout. The first required owner is `bubbles.plan`; current product and test bytes remain unchanged.

## Scope 02 Canonical Receipt and Regression DoD Repair — 2026-08-29

### Test-Owned Repair Boundary

**Phase:** test
**Claim Source:** executed

Repository packet decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:8` at control revision `8` passed before repository inspection. Candidate HEAD remained `cfbfd60c0b360a083fbda70957213823cd834b48`. This repair changed no implementation or test source and did not add another Scope 02 `test` completed-phase claim or execution-history row.

### Exact Scope 02 Test Plan Replay

**Phase:** test
**Claim Source:** executed

Each command ran through `.github/bubbles/scripts/tool-log.sh` into the canonical `.specify/runtime/tool-calls.jsonl` with the six current production and test inputs in `inputClosure`.

| Test Plan row | Exact command | Collected / passed / failed / skipped / todo | Exit | Canonical stdout SHA-256 |
| --- | --- | --- | ---: | --- |
| `TP-02-01` | `node --test tests/company-intelligence-publication.integration.mjs` | 5 / 5 / 0 / 0 / 0 | 0 | `3a6224808ba081cad3624474e6e6cbb8652077998cdbfb5cf835944f54ad51a3` |
| `TP-02-02` | `node --test tests/company-intelligence-publication.integration.mjs` | 5 / 5 / 0 / 0 / 0 | 0 | `98dbf6d776f434f4d15a13b48affbc18a9b719ef658c0dccf790638564a617f2` |
| `TP-02-03` | `node --test tests/company-intelligence-publication.integration.mjs` | 5 / 5 / 0 / 0 / 0 | 0 | `64e56809bbcc001a1a3fbe4a766a46230dd08cfff45ae44b8a5d5378aba521ac` |
| `TP-02-04` | `node --test tests/company-intelligence-publication.integration.mjs` | 5 / 5 / 0 / 0 / 0 | 0 | `c22bf7fcf2f6b29be13ac1ad45dee92c79492c48d2fe08cfd24c70a71b376d49` |
| `TP-02-05` | `node --test tests/company-intelligence-publication.e2e.mjs` | 2 / 2 / 0 / 0 / 0 | 0 | `d544fc97f6f872225a61ff0d037ff42360039e75ec6c158ed3dffd1097ada50d` |
| `TP-02-06` | `node --test tests/distributed-briefs.distributed-publish.unit.mjs` | 4 / 4 / 0 / 0 / 0 | 0 | `d4469b817d1a77442a503b9bd3c56e309098fee268ff4eaea6d5e819f5421b5a` |

### Scenario-Specific TP-02-05 Process E2E

**Phase:** test
**Command:** `node --test --test-name-pattern=^Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions$ tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1678.470291ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1721.229792
[tool-log] recorded exit=0 duration=1756ms → .specify/runtime/tool-calls.jsonl
```

Canonical stdout SHA-256: `150394f38ea917126b5b692f708067b70a953acfcbebc47ec96c0e8ad72baff0`.

### Broader TP-02-05 Process E2E File

**Phase:** test
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (558.888083ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1715.278458ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2317.483458
[tool-log] recorded exit=0 duration=2353ms → .specify/runtime/tool-calls.jsonl
```

Canonical stdout SHA-256: `bcd34a76f62125293865df575f20697a1bcd29c12eaf28a721bdda424d8c9fc7`.

The aggregate integration, process-E2E, and shared-canary replay also passed 11 of 11 tests with zero failures, cancellations, skips, or todos. Its canonical stdout SHA-256 is `ce3aae0de568214f13a32e292c43627d51f9bd3c79d78e6fb1b1c01841a4b5cd`.

### Additive Canonical Receipt Closure

**Phase:** test
**Command:** `bash .github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed

The 28 stale rows remain in append-only history. Re-executing the same evidence identities added 28 current rows, so the supported newest-identity rule superseded rather than deleted history. The exact Test Plan and regression commands then added nine current identities.

```text
{
  "total": 65,
  "current": 37,
  "superseded": 28,
  "withClosure": 37,
  "valid": 37,
  "stale": 0,
  "unknown": 0,
  "staleReceipts": []
}
```

Capture SHA-256: `c38422e440d08c7155a9a20f31535f82128dc1aa02a3169dba025928de045d80`.

### Test-Owned Finding Disposition

`VAL-028-S02-CANONICAL-RECEIPTS` is closed by the strict canonical result above. The two newly explicit Scope 02 regression DoD items are supported by the scenario-specific and complete-file TP-02-05 executions. All four Scope 02 scenarios resolve to canonical receipt-derived `REGRESSION_GREEN` state. The whole-feature resolver remains nonzero because Scopes 03 through 05 remain `PLANNED`; later-scope, terminal-phase, and human-acceptance findings are not claimed as passing.

### Post-Repair Transition Diagnostic

**Phase:** test
**Command:** `bash .github/bubbles/scripts/state-transition-guard.sh specs/028-company-intelligence-publication-and-brief-transaction --target-status done --expect-workflow-mode full-delivery --expect-contract-digest sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93`
**Exit Code:** 1
**Claim Source:** interpreted
**Interpretation:** The terminal guard remains nonzero as required for an incomplete five-scope feature. It now accepts both Scope 02 regression DoD requirements and all current canonical receipts. Its remaining failed gates are later-scope, full-delivery-phase, and terminal human-acceptance obligations.

```text
✅ PASS: Scope DoD includes scenario-specific regression E2E requirement: Scope 02: Coupled manifest, immutable promotion, and pointer-last success path
✅ PASS: Scope DoD includes broader E2E regression suite requirement: Scope 02: Coupled manifest, immutable promotion, and pointer-last success path
✅ PASS: Scope Test Plan includes explicit regression E2E row(s): Scope 02: Coupled manifest, immutable promotion, and pointer-last success path
✅ PASS: All 29 checked DoD items across resolved scope files have evidence blocks
✅ PASS: Evidence receipts consulted; no stale receipt backs this transition
✅ PASS: No receipt clones (no substantive stdout hash shared across incompatible or unproven receipt identities)
🔴 TRANSITION BLOCKED: 39 failure(s), 4 warning(s)
failedGateIds: [G022,G068,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 39
exitStatus: 1
verdict: FAIL
```

The bounded final diagnostic capture has SHA-256 `6d8dbb5369574f2dd39677d53898204f3e1a938007896e6bd18ad02b91fb6918`. Scope 02 has no remaining Check 8A or Check 43 failure. No whole-feature green result is claimed.

## Scope 02 Validate-Owned Certification After Remediation — 2026-08-29 {#scope-02-validate-owned-certification-after-remediation-2026-08-29}

**Agent:** `bubbles.validate`
**Scope:** `02-coupled-manifest-and-promotion`
**Candidate revision:** `cfbfd60c0b360a083fbda70957213823cd834b48`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The current commands directly prove every Scope 02 test, receipt, planning, state, and implementation-discovery requirement. Whole-feature commands remain nonzero only for Scope 03 through Scope 05, terminal specialist phases, terminal human acceptance, and pre-existing installed-framework drift. This section certifies Scope 02 only and does not claim whole-feature completion.

### Scope 02 Remediation Outcome Contract Verification

| Field | Scope 02 evidence | Status |
| --- | --- | --- |
| Intent contribution | The production CLI assembles, promotes, stages, and validates one coupled company-and-brief generation through the current integration and process-E2E paths. | Demonstrated for Scope 02 |
| Success-signal contribution | TP-02-01 through TP-02-06 prove distinct immutable versions, exact owner-read and brief identity, content-addressed manifests, and the coupled selector as the final write. | Demonstrated for Scope 02 |
| Hard constraints | Scope 01 remains certified. Six production and test inputs retained their receipt-bound hashes. Feature 025, tracked publication data, framework paths, and the primary checkout are absent from the candidate delta. | Demonstrated for Scope 02 |
| Failure condition | Current tests refuse generation collisions, predecessor drift, staged-byte drift, illegal phase transitions, immutable predecessor mutation, and disk incoherence. | Not triggered for Scope 02 |
| Whole-feature outcome | Scope 03 through Scope 05 and terminal acceptance remain incomplete. | Not claimed |

### Authority, Goal, and Session Boundary

**Phase:** validate
**Command:** exact packet validation, `session-cap-guard.sh`, and `goal-fidelity-guard.sh --boundary pre-certification`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** `5b9657c0e6bdc4a5ebbb90bfa18217bee9a26b3e45dd38683e72daa454991464`

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab-company-intelligence-delivery-r3 root=/private/tmp/research-lab-company-intelligence-delivery-r3 decision=rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:8 revision=8
PACKET_EXIT=0
session-cap-guard: aggregate convergence=1 (cap unset), wall-clock=99.46666666666667min (cap 180), toolCalls=0 (cap 350)
session-cap-guard: context volume: largestToolResult=1559B (cap 50000), toolResultTotal=41010B (cap 250000), maxPromptTokens=unmeasured (cap unset), promptTokensTotal=unmeasured (cap unset)
PASS Gate G128 (session_cap_enforcement_gate) — no aggregate cap exceeded (conv=1/unset, mins=99.46666666666667/180, tools=0/350, toolBytesMax=1559/50000, toolBytesSum=41010/250000, promptTokensMax=unmeasured/unset, promptTokensSum=unmeasured/unset)
G128_EXIT=0
goal-fidelity-guard: PASS boundary=pre-certification
GOAL_FIDELITY_EXIT=0
```

Fresh contract resolution also exited `0`. It resolved `workflowMode=full-delivery`, `targetStatus=done`, contract digest `sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93`, and target revision `sha256:94c5d6937b79cc323ba0ae803e58ce04337aeb48318fcd87779f25d26cd3aa33`. Its capture is `dde2663fd093fc71c6aa3a66573b592799b4685c65bbbdc20e0f3e5fdacf3dcc`.

### Current Scope 02 Certification Test Replay

| Test obligation | Command | Exit | Result | Capture |
| --- | --- | ---: | --- | --- |
| TP-02-01 through TP-02-04 | `node --test tests/company-intelligence-publication.integration.mjs` | 0 | 5 passed, 0 failed, 0 skipped, 0 todo | `036cf08332f6915457d5994da30b61f0d591aaeed3812b3b79a13d68bf6a3d20` |
| Scenario-specific TP-02-05 | Exact Scope 02 `--test-name-pattern` in `tests/company-intelligence-publication.e2e.mjs` | 0 | 1 passed, 0 failed, 0 skipped, 0 todo | `bbfd825d6a6c8b8031148fd328370faca440bb253d08f6450a68700621a37fcd` |
| Broader TP-02-05 | `node --test tests/company-intelligence-publication.e2e.mjs` | 0 | 2 passed, 0 failed, 0 skipped, 0 todo | `6246eed68ec7494c2edfcc87839f675717610238499b21c9a4eb62357810720a` |
| TP-02-06 | `node --test tests/distributed-briefs.distributed-publish.unit.mjs` | 0 | 4 passed, 0 failed, 0 skipped, 0 todo | `5553bedb95c5f7b77b384e194da7600afed38588e6367d2aa8231527c7e75b88` |

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.integration.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ SCN-028-005 complete source bundle contains one real company owner read and no company coverage outcome (35.844292ms)
✔ Regression: SCN-028-011 same-day publication windows create distinct files in one predecessor chain (305.899834ms)
✔ Mutation: SCN-028-013 pointer drift after freeze refuses the candidate and brief (102.921625ms)
✔ Mutation: SCN-028-014 recorder proves the coupled selector is the final write (58.999625ms)
✔ Regression: SCN-028-021 unchanged horizon directions still append a distinct immutable version (113.059125ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 675.763625
```

**Phase:** validate
**Command:** `node --test --test-name-pattern=^Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions$ tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (2182.607458ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2229.57475
```

**Phase:** validate
**Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority (582.3475ms)
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions (1841.973458ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 2471.835542
```

**Phase:** validate
**Command:** `node --test tests/distributed-briefs.distributed-publish.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
✔ distributed publisher builds a SCHEMA-VALID publish set and authors rich vs coverage-only briefs honestly (31.39025ms)
✔ distributed publisher appends history generation over generation and is idempotent on an unchanged run (18.447125ms)
✔ distributed publisher writes ONLY under briefs/ and never mutates market-brief.* or data/ (10.549708ms)
✔ Regression canary: distributed brief publication primitives preserve content addressing and pointer-last behavior (20.26525ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 130.581167
```

The repository build command exited `0` with capture `9dc91ec5001df2ee496a38f5673df69b8c6f42e43dfb97717717574da7e7a366`. The Node source-lock validator exited `0`, accepted the exact lock, and rejected all sixteen adversarial mutations with capture `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1`.

### Scope 02 Certification Gate Matrix

**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The supported commands below execute whole-feature checks where the installed guard has no single-file scope selector. Their nonzero exits are retained. Scope 02 is accepted only where the same output names its four scenarios, six rows, exact test titles, regression DoD, receipts, and implementation files as clean.

| Check | Exit | Scope 02 result | Capture |
| --- | ---: | --- | --- |
| Pre-certification invariants and byte identity | 0 | Exact Scope-Kind, summary/body parity, 13 of 13 DoD, one implement claim/history, one test claim/history, no prior Scope 02 validate claim/history, Goal revision 3, and all six receipt-bound inputs matched. | `ad15a4abcd21003a085ef64338afbee5e69c325e5b2983c76abe51c4d3d1b2c6` |
| Implementation reality | 0 | Five declared Scope 02 implementation files resolved; 0 violations and 0 warnings. | `2061bb11dd26ecdf2ca2c0522622100a6202ca8ff6639cb15dea9ce24bb65b77` |
| Canonical receipt freshness | 0 | 65 total, 37 current, 28 superseded, 37 valid, 0 stale, 0 unknown. | `c38422e440d08c7155a9a20f31535f82128dc1aa02a3169dba025928de045d80` |
| Artifact, freshness, claim-source, collected-count, regression-quality, isolation, obligation, mechanism, and domain checks | 0 for every listed check | No Scope 02 finding. The first aggregate invocation also attempted unsupported `traceability --current-scope` and therefore exited `1`; that invocation is not used as traceability evidence. | `7bb497a785f4b0931a84ce62d2f513c6900fc7da84215d64f514fbf65b016dc8` |
| Supported whole-feature traceability | 1 | Scope 02: 4 scenarios, 6 rows, 4 concrete mappings, 4 evidence mappings, and all 4 G068 mappings declared. Ten failures name Scope 04 and Scope 05 missing files. | `2a103af702692783aca782a954423701c2f39ecbbaf3a7a564ef5a2882dd419f` |
| Exact linked-test resolver | 1 | No unresolved Scope 02 reference. All 13 unresolved references name Scope 03 through Scope 05. | `b7f67be21d13820c8c6383121dbbdd18e1119db4750797de9f0cd8cc5bf99c9b` |
| Canonical scenario-state resolver | 1 | SCN-028-011, SCN-028-013, SCN-028-014, and SCN-028-021 are `REGRESSION_GREEN`. Eighteen other scenarios remain `PLANNED`. | `b616b1eed3757d5216e10ff827ad31821d72d8637c35cd4abc45f578e3470ed7` |
| Registry-asserted transition guard | 1 | Scope 02 Check 8A, DoD evidence, implementation reality, and receipt checks pass. Remaining failures name Scope 03 through Scope 05, whole-feature phase completion, and terminal acceptance. | `265cdd34e001838f2f762492c5b65aabd99bd5d130243b6d669e2262c44b68c0` |
| Changed-spec audit | 0 | Artifact lint passed; terminal checks were correctly skipped because the feature remains `in_progress`. | `3062a89f8962f4e5410e63ffe61fa760fbc8e839534dc4cca2a85fd3f0f61766` |
| Impact and observability applicability | 0 aggregate | `testImpact` and `traceContracts` are absent. G100 executed its undeclared-posture no-op and exited `0`. | `b1218ea995b7f8d655be57662ce95de361a43aec03d19fc1c9339a1e112c63a2` |
| Repository selftest | 1 | 3,459 passed and 9 failed. No failure names a Scope 02 test; failures retain predecessor and planned public-registration expectations owned by later feature work. | `bede35ef6bbbf60267791734e16c9e302d6d8cf02052bcb0e63bb24def5bdd56` |
| Framework write guard | 1 | Five installed framework agent files differ from the checksum manifest. No framework path is in the eight-path candidate delta. | `50c0596f6876882a7f353bf6e9b1ffbdc6db3ee60f172611114e1b6924c64358` |

The current transition result is preserved rather than relabelled:

```text
workflowMode: full-delivery
auditProfile: delivery-completion-v1
targetStatus: done
contractDigest: sha256:e330ef85136370a1fa7e9edb5813cb5879a6554afcff98ba373ac48442c7ca93
targetRevision: sha256:94c5d6937b79cc323ba0ae803e58ce04337aeb48318fcd87779f25d26cd3aa33
passedGateIds: [G057,G053,G040,G051,G082,G083,G084,G128,G085,G086,G091,G087,G093,G088,G089,G092,G090,G094,G095,G097,G098,G099,G100,G130,G131]
failedGateIds: [G022,G068,G136]
failedChecks: [Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 39
exitStatus: 1
verdict: FAIL
```

This is the expected whole-feature result. It does not authorize top-level `done`, and both feature status mirrors remain `in_progress`.

### Prior Scope 02 Finding Closure

| Finding | Current closure evidence | Disposition |
| --- | --- | --- |
| `VAL-028-S02-SCOPE-KIND` | Exact pre-certification assertion found one `runtime-behavior` token. Implementation discovery resolved all five declared files with no warning. | Addressed |
| `VAL-028-S02-E2E-DOD-SCENARIO` | The explicit checked requirement exists once. The exact one-test TP-02-05 replay exited `0`. Check 8A accepts it. | Addressed |
| `VAL-028-S02-E2E-DOD-BROAD` | The explicit checked requirement exists once. The complete TP-02-05 file replay exited `0`. Check 8A accepts it. | Addressed |
| `VAL-028-S02-G068-011` | Whole-feature traceability declares the scenario-to-row and scenario-to-DoD mappings. TP-02-01 passed. | Addressed |
| `VAL-028-S02-G068-013` | Whole-feature traceability declares the scenario-to-row and scenario-to-DoD mappings. TP-02-02 passed. | Addressed |
| `VAL-028-S02-G068-014` | Whole-feature traceability declares the scenario-to-row and scenario-to-DoD mappings. TP-02-03 and TP-02-06 passed. | Addressed |
| `VAL-028-S02-CANONICAL-RECEIPTS` | Strict canonical receipt validation exited `0` with 37 valid current identities and no stale or unknown identity. | Addressed |
| `VAL-028-S02-STATUS-PARITY` | The pre-certification summary and body both read `In Progress`; this certification changes both to `Done` together. | Addressed |

SCN-028-021 also has declared row and DoD mappings, current receipt-derived `REGRESSION_GREEN` state, and a passing TP-02-04 execution. No prior Scope 02 finding remains unresolved.

### Preserved Findings Outside Scope 02 After Certification

- `VAL-028-LATER-SCENARIO-TARGETS`: thirteen unresolved linked-test references remain assigned to Scope 03 through Scope 05.
- `VAL-028-LATER-TRACEABILITY`: ten missing-file findings remain assigned to Scope 04 and Scope 05.
- `VAL-028-LATER-SELFTEST`: nine repository-selftest failures retain predecessor or public-registration expectations assigned to later feature work.
- `VAL-028-LATER-G068-AND-DOD`: Scope 03 through Scope 05 retain nine strict G068 gaps, six regression-DoD gaps, trailing Scope-Kind punctuation, and one Scope 05 consumer-impact DoD gap.
- `VAL-028-TERMINAL-G022-G136`: unexecuted full-delivery specialists and human acceptance remain terminal-only blockers.
- `VAL-028-INDEPENDENT-FRAMEWORK-INSTALL-DRIFT`: five installed framework agent files differ from the checksum manifest. The candidate changes no framework path.

### Scope 02 Certification Disposition

Scope 02 is validate-certified `Done`. Scope 01 remains certified `Done`. `certification.completedScopes` contains exactly those two scope IDs. The top-level and certification status mirrors remain `in_progress`. Human acceptance remains untouched. Scope 03 is the next sequential target for `bubbles.implement`.

## Scope 03 Implement-Owned Transaction Restoration — 2026-08-29

### Scope 03 Authority and Checkpoint Reverification

**Phase:** implement
**Claim Source:** executed
**Repository packet:** decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:11`, control revision `11`
**Checkpoint:** `031d64b54ff8348bb4217ac3516c3be8d89b7ad4`
**Scope 02 base:** `cfbfd60c0b360a083fbda70957213823cd834b48`

The installed packet validator accepted the exact actionable r4 packet before repository reads. Goal Contract revision 3 then verified. G128 reported zero inherited wall-clock minutes and zero inherited tool calls. The persisted `full-delivery` mode resolved through its required grandfather path with `statusCeiling: done`.

The checkpoint commit states that Scope 03 is unverified. This invocation trusted no checkpoint test or completion claim. It reread the active requirements, design, Scope 03, report, state, current production and test files, and the complete checkpoint delta.

### Scope 03 Contract Audit and Repair

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The audit combines current source inspection with the executed tests and negative controls cited in this section.

| Contract branch | Current mechanism | Current proof |
| --- | --- | --- |
| Bidirectional baseline restoration | `abortCoupledTransaction()` restores both clean checkouts from one captured base. | TP-03-01 and TP-03-02 |
| Failing covered subject | `composeCoveredSubjects()` fails the missing synthetic subject by name before authority changes. | TP-03-03 |
| Pre-commit restoration | `commitCoupledTransaction()` routes commit and index refusals through full checkout restoration. | TP-03-05 |
| Exact local commit retention | The private journal stores one commit and every declared hash. Push retries require that exact `HEAD`. | TP-03-05 |
| Unknown remote outcome | Failed classification persists `remote-outcome-unknown` and blocks new generation admission. | TP-03-05 |
| Ancestry reconciliation | Fetch plus `merge-base --is-ancestor` determines reachability before authority changes. | TP-03-05 |
| Acknowledgment recovery | A failed private receipt cannot revoke remote authority. A second call reconstructs the receipt without another push or commit. | TP-03-05 |
| Dry-run byte identity | The dry run reaches coherence, restores both inventories and indexes, removes private checkpoints, and leaves the bare remote unchanged. | TP-03-04 |
| Sanitized attempt records | `sanitizedFailure()` replaces authored reasons and excludes private paths, credentials, and pair-authority fields. | TP-03-01 and TP-03-05 |
| No one-sided authority | Only the coupled selector represents pair authority. Failed, pending, unknown, and dry-run attempts set `authoritativeUnchanged`. | TP-03-01 through TP-03-05 |

Two real checkpoint gaps were reproduced before repair.

1. A completed dry run retained its private transaction checkpoints.
2. The commit boundary accepted a staged subset when the coupled selector was absent from the index.

The production repair removes the successful dry-run transaction directory after exact restoration. It also reads every declared Git-index blob before commit. A missing or byte-different entry now returns `C028-COMMIT` and restores both checkouts.

The process regression now checks complete checkout inventories. It also proves private acknowledgment reconstruction and incomplete-index refusal. No Scope 04 trigger or Scope 05 registration, route, UI, or public-data behavior changed.

### Scope 03 Exact Commit and Remote Authority

**Phase:** implement
**Claim Source:** executed

The TP-03-05 test uses real temporary repositories, a real bare remote, a rejecting pre-commit hook, and a rejecting pre-receive hook. It also removes the coupled selector from the real Git index.

```text
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The exact TP-03-05 replay exited `0`. Its current structured stdout hash is `6c6a49ee91c7e7d98d856660b947db61a9507a785629923964b8ac44213900e3`.

### Scope 03 Attempt Safety and Authority Separation

**Phase:** implement
**Claim Source:** executed

The integration and process tests insert private paths, authored rejection text, password-like text, and remote errors into failure inputs. The production result retains only the closed code, phase, safe field, and safe cause code.

The tests assert that every attempt record omits `pairAuthority`. Failed and pending attempts keep the prior generation authoritative. An acknowledged attempt records its generation but remains a diagnostic record. The coupled selector remains the only pair-authority source.

```text
TP-03-01_RESULT tests=8 pass=8 fail=0 skipped=0 stderrBytes=0
TP-03-02_RESULT tests=8 pass=8 fail=0 skipped=0 stderrBytes=0
TP-03-03_RESULT tests=8 pass=8 fail=0 skipped=0 stderrBytes=0
TP-03-04_RESULT tests=4 pass=4 fail=0 skipped=0 stderrBytes=0
TP-03-05_RESULT tests=4 pass=4 fail=0 skipped=0 stderrBytes=0
TP-03-06_RESULT tests=42 pass=42 fail=0 skipped=0 stderrBytes=0
CANARY_RESULT tests=101 pass=101 fail=0 skipped=0 stderrBytes=0
REMOTE_AUTHORITY_SOURCE=verified ancestry of exact journaled commit
ATTEMPT_AUTHORITY_FIELD=absent
COUPLED_SELECTOR_AUTHORITY=unchanged on every non-acknowledged branch
```

### Scope 03 Scenario-First RED and GREEN Evidence

**Phase:** implement
**Claim Source:** executed

The first sensitivity probe changed the production restoration command from `reset --hard` to `reset --mixed`. The complete integration suite failed and then passed after exact byte restoration.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            SCN-028-015/016/017 pre-commit restoration requires hard reset of both checkouts
file:             scripts/company-intelligence-publication.mjs
mutation:         ['reset', '--hard', baseline.head]  ->  ['reset', '--mixed', baseline.head]   (1 occurrence(s))
command:          node --test tests/company-intelligence-publication.integration.mjs
red-exit:         1
red-summary:        }
green-exit:       0
green-summary:    ℹ duration_ms 2150.65325
revert-verified:  yes (committed=d641ef28cc328da74e302aeb769567c81c5fa87b restored=d641ef28cc328da74e302aeb769567c81c5fa87b)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The production probe capture is `ee60017ed165efc28da914e1e131a037a1cdb1f2c9967fb6779133ae0a15e35c`.

The new dry-run cleanup assertion first failed because the private transaction still existed. The new exact-index assertion first failed because the incomplete index committed successfully. Their pre-fix captures are `8a9219f08529076c6dae22be8c5f169340ec44857a7d37f0f774cc0827d5fcec` and `8e88f82c6671fe665726ceb623468431becbfe642ee9b9d53d9e09351590ddb3`.

Persistent test-only controls then reproduced both detector failures against final source bytes. Their RED captures are `efc05de102bc224d19d5253f3e10ff2847a199b64889d1c953814ed659b90bc5` and `2be03f4a9d8ebb968d28a7a385ad29edb5a4899b2f36ac8f0d6541be62a2540a`. Removing the controls produced two current-input GREEN executions with aggregate capture `6e4007e209b5c6d9565c36135319c5b595c1bf3cb96416aa92a963ebcd96a2c0`.

### Scope 03 Shared Impact and Change Boundary

**Phase:** implement
**Claim Source:** executed

The complete existing atomicity file executed 42 tests. The Scope 03 canary changed a company pointer and created an unpublished company version inside the worker transaction. A later brief projection failure restored both company paths and every brief-owned baseline.

The certified Scope 01 and Scope 02 canary command executed 101 tests with `--trace-warnings`. It reported 101 passes, zero failures, zero skips, zero todos, and zero warning bytes. Its full-output capture is `bf5e59de9b331623dbb6fbf84a4db6cc17e797f3a3e99ce8c60d6a76360345af`.

The final strict changed-path classifier appears in [Scope 03 Final Implement Quality Gates](#scope-03-final-implement-quality-gates). It treats the certified Scope 02 delta as inherited. It permits only the two Scope 03 implementation paths and three execution artifacts beyond that delta.

### Scope 03 Pre-Recording Quality Matrix

**Phase:** implement
**Claim Source:** executed

| Check | Exit | Current result | Receipt stdout SHA-256 |
| --- | ---: | --- | --- |
| Node source lock | 0 | Exact lock passed and 16 adversarial source mutations were rejected. | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Regression quality | 0 | Five Scope 03 test files reported zero violations and zero warnings. | `12e7967a31e83a8b5445984d9f810b8ee605c68b3963c3fa0f69ede4a812877a` |
| Environment isolation | 0 | No test-to-production write was detected. | `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61` |
| Implementation reality | 0 | Five declared implementation files resolved with zero violations and zero warnings. | `2061bb11dd26ecdf2ca2c0522622100a6202ca8ff6639cb15dea9ce24bb65b77` |
| Artifact lint | 0 | Artifact structure and existing checked evidence passed before Scope 03 recording. | `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3` |
| Artifact freshness | 0 | Zero failures and zero warnings. | `2395dc59ae2472bfbb21b864558e2e9a1e0513987a18cbfb0f46713b138e9d73` |
| Goal fidelity | 0 | Revision 3 accepted the post-finding boundary. | `bb777a7f384a28a8160279b55f018680351f98493b2b0c78ffe4ff255b049ad8` |
| Scenario obligations | 0 | All 22 scenario obligation matrices were coherent. | `b83fa7583517d153789f13facf79bd25e61529881fc9a25b3e8c41d409788078` |
| Test mechanisms | 0 | All 22 declared mechanisms were coherent. | `796e7eae922225a7c8d9252387e0051b698195dc5462834cd979c16af0f0ec88` |
| Claim source | 0 | Every pre-existing execution block carried a valid source tag. | `6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653` |
| Collected test count | 0 | No Feature 028 evidence claimed a zero-test run. | `8a2f6cfb05a82590a5196d0af831c77d60bc6e5be992e4b23c255f8b254a4e05` |
| Execution substate | 0 | Execution and certification vocabularies remained separate. | `282c18a1883a31f7cd787c869919d94b3d6dd80ef4d12e3932db4fda12230a79` |
| Domain invariants | 0 | Six declared invariants had adversarial test anchors. | `c65822642cc1859bba887ee1e695f944bb0ffeab8763df7eed30ac2e17d123be` |
| Domain model | 0 | Shared domain declarations remained consistent. | `1650f6d349fdff760d20bc3e7dced3fd3f9653b85be47e09c05d4739ac456b32` |

The combined 14-check capture is `efab7801937226ca3f03b163eb3607b11a60f08cfdf586fc036a96fd8548aed1`.

### Scope 03 Receipt Freshness and Cleanup

**Phase:** implement
**Claim Source:** executed

The strict receipt check initially found two stale pre-fix RED rows after production changed. Append-only current-input RED and GREEN executions superseded those rows. The final strict check reported 31 total rows, 25 current identities, 6 superseded rows, 11 closure-bearing rows, 11 valid rows, zero stale rows, and zero unknown closure-bearing rows. Its capture is `f372af5c2f0b57f7dc8e35337d429891b35f72b8c9dbaf7527ff7b88c3e77e45`.

The first process-residue diagnostic matched its own command text and exited `1`. The corrected checks separated filesystem and process scans. Fixture capture `785c678a0c162c5331236c3e67e6f42403592bc71691d7e9dc03dc5083711aa7` found zero matching directories. Process capture `965f6c0d7010fa6ef58bd74cc9d75148ee45388b0ee0ea6841d4d226868b1002` found zero matching child processes.

### Scope 03 Implement Finding Accounting

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** Each finding below maps to current executed evidence or an explicit later-scope diagnostic.

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `IMP-028-S03-DRY-RUN-CHECKPOINT-RESIDUE` | Addressed | Current-input RED and GREEN plus TP-03-04 |
| `IMP-028-S03-INCOMPLETE-INDEX-COMMIT` | Addressed | Current-input RED and GREEN plus TP-03-05 |
| `IMP-028-S03-ACK-RECONSTRUCTION-COVERAGE` | Addressed | TP-03-05 reconstructs the private receipt without another push or commit. |
| `IMP-028-S03-TITLE-RESOLUTION` | Addressed | All six Test Plan titles occur exactly once on one source line. The canonical resolver has no Scope 03 title failure. |
| `IMP-028-S03-RESIDUE-DIAGNOSTIC-SELF-MATCH` | Addressed | Corrected fixture and process scans both exit `0`. |

No implement-owned Scope 03 finding remains open in this record. Whole-feature checks still name Scope 04, Scope 05, terminal specialist, human-acceptance, and installed-framework conditions. The final diagnostic section preserves their nonzero exits without converting them into Scope 03 passes.

### Scope 03 Final Implement Quality Gates

**Phase:** implement
**Claim Source:** executed

```text
FINAL_SYNTAX files=8 failures=0
NODE_SOURCE_LOCK exit=0 adversarialRejected=16
REGRESSION_QUALITY exit=0 files=5 violations=0 warnings=0
ENVIRONMENT_ISOLATION exit=0 productionWrites=0
IMPLEMENTATION_REALITY exit=0 files=5 violations=0 warnings=0
ARTIFACT_LINT exit=0
ARTIFACT_FRESHNESS exit=0 failures=0 warnings=0
GOAL_FIDELITY exit=0 boundary=post-finding
SCENARIO_OBLIGATIONS exit=0 scenarios=22
TEST_MECHANISMS exit=0 mechanisms=22
CLAIM_SOURCE exit=0
COLLECTED_TEST_COUNT exit=0
RECEIPT_FRESHNESS exit=0 valid=11 stale=0
EXACT_TITLE_RESOLUTION exit=0 rows=6 titles=6 checkedDoD=6
FIXTURE_RESIDUE exit=0 count=0
PROCESS_RESIDUE exit=0 count=0
STRICT_CHANGE_BOUNDARY exit=0 expected=10 observed=10 unexpected=0
IMMUTABLE_HISTORY deletedOrRenamed=0 forbiddenChanged=0
```

The changed-module parse capture is `e81ab52d68968014b71f49ec454666ebdfe62cf2f89a83326dbd73847ccc78d4`. The post-recording artifact-lint capture is `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3`. The final post-recording governance capture is `a91cfa04817f90c023ef3572e1c55e94cca6b0157a570789089a5e416981cd78`.

The exact title check found each TP-03-01 through TP-03-06 title once and on one source line. It also found six JSON rows, six Scope 03 Markdown rows, and six checked test DoD rows. The corrected capture is `02b6e95b037fc50dd65fd467dd651e6d2b11e586a2e5616ba147aeeb90e37689`.

The strict change boundary compared the final candidate against certified Scope 02 base `cfbfd60c0b360a083fbda70957213823cd834b48`. It found ten expected paths, ten observed paths, one worktree control, zero staged paths, zero forbidden paths, and zero deleted or renamed paths. The corrected capture is `6aabcbc3d185673e4cad4365f284ef7f47a05a5351df1bc4b3ed8a6ef30c63f5`.

## Scope 03 Test-Owned Independent Verification — 2026-08-29

### Scope 03 Test Authority and Current Candidate

**Phase:** test
**Claim Source:** executed
**Repository packet:** decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:11`, control revision `11`
**Candidate commit:** `031d64b54ff8348bb4217ac3516c3be8d89b7ad4`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`

The installed packet validator accepted the exact actionable r4 packet before this test phase read the repository. The persisted `full-delivery` mode resolved through its grandfather path with `statusCeiling: done`. Goal Contract revision 3 verified against source-request digest `sha256:8219ab9c195774da240e9f9fd6a280a9a7f7fa5ada7ec0bbf1901764f42e8e6f`. The test phase independently reread the Scope 03 scenarios, Test Plan, report, state, production module, integration tests, process E2E tests, and shared atomicity canary.

### Scope 03 Exact Test Plan Execution

**Phase:** test
**Claim Source:** executed

| Test Plan ID | Exact command | Current result | Verifiable capture SHA-256 |
| --- | --- | --- | --- |
| TP-03-01 | `node --test tests/company-intelligence-publication.integration.mjs` | 8 passed, 0 failed, 0 skipped | `6de3779934c9c1d7ac7c2ffc81e94e1dcd0fd6c301d35fa437e038c9ed3f72fc` |
| TP-03-02 | `node --test tests/company-intelligence-publication.integration.mjs` | 8 passed, 0 failed, 0 skipped | `2afa26ec36cdbb53c504f15f519cf64fbbd947dd6cf1a63b4a3e3a5788e6d950` |
| TP-03-03 | `node --test tests/company-intelligence-publication.integration.mjs` | 8 passed, 0 failed, 0 skipped | `039ad7f7aa4e05c77d416e5d89dce6484a9a3ced0c2d483452abe1dce67702ff` |
| TP-03-04 | `node --test tests/company-intelligence-publication.e2e.mjs` | 4 passed, 0 failed, 0 skipped | `8afe9c4f9fafd455623ed6637793df5ec5674ffdd9144c6a55f895a8c6473417` |
| TP-03-05 | `node --test tests/company-intelligence-publication.e2e.mjs` | 4 passed, 0 failed, 0 skipped | `044e06d9a05bb6690857b519630a3ba8268cd99db3d86ecbdf947e0a023ff72c` |
| TP-03-06 | `node --test tests/brief-refresh-atomicity.test.mjs` | 42 passed, 0 failed, 0 skipped | `65bc51bc9b8e9cd96f8d1b72f99db3f80ae1edea4a220378b64b0a2b8ea853ff` |

The final selected closure reran all Scope 03 suites and the affected Scope 01 and Scope 02 canaries with `--trace-warnings`.

```text
✔ Regression: SCN-028-015 brief validation failure removes company candidates and restores both baselines
✔ Regression: SCN-028-016 company validation failure with a valid brief restores both baselines
✔ Mutation: SCN-028-017 one failing subject aborts a synthetic two-subject covered set
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit
✔ Regression canary: existing brief atomicity restores every prior owned path under coupled fault injection
ℹ tests 155
ℹ suites 0
ℹ pass 155
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

The full-output capture is `ac6c28e669c34ecd7656b91db8f8b758f63a2b73aca5f3c0f5811b626946dd16`.

### Scope 03 Test-Owned Sensitivity Proof

**Phase:** test
**Claim Source:** executed

| Scenario | Test identity | Negative control | RED capture | GREEN capture |
| --- | --- | --- | --- | --- |
| SCN-028-015 | TP-03-05 | Retain the complete Git index instead of removing the coupled selector | `d34ae6d3563c89411ea19ba40892715c1e7baf18ad2d4e03d21da09e4e9f659b` | `044e06d9a05bb6690857b519630a3ba8268cd99db3d86ecbdf947e0a023ff72c` |
| SCN-028-016 | TP-03-02 | Reintroduce a brief candidate after restoration | `b340249d3ad589fc6f1ac74fa4bc6872011b53037d72386a01dfb6663b4b7192` | `2afa26ec36cdbb53c504f15f519cf64fbbd947dd6cf1a63b4a3e3a5788e6d950` |
| SCN-028-017 | TP-03-03 | Reintroduce the failed synthetic subject pointer after restoration | `f588ee0ba2765bff68353ccd27423ff193a32898fa705f3071ffce3b18b7d3db` | `039ad7f7aa4e05c77d416e5d89dce6484a9a3ced0c2d483452abe1dce67702ff` |
| SCN-028-022 | TP-03-04 | Recreate a private checkpoint after dry-run cleanup | `893fefb9ca82045b38c7c622eed8bd336a05c1ba070eb7d8dca8784f2d575e67` | `c51446dabbc2de4d295fe200a4a955791809a270b20349c175ad77385322ef35` |

The SCN-028-016 and SCN-028-017 controls are test-only environment switches. They make the exact persistent assertion fail while leaving normal execution unchanged. Each GREEN run removed all four controls and passed on the restored r4 production bytes.

### Scope 03 Test Integrity and Closure Receipts

**Phase:** test
**Claim Source:** executed

The integrity audit scanned five test files. It found zero skip, only, todo, pending, interception, internal-mock, or fake-live patterns. The integration tests use real temporary Git repositories and filesystems. The process E2E tests execute the production CLI through Node, real Git indexes, real commits, a real bare remote, rejecting Git hooks, fetch, push, and ancestry classification. The shared worker doubles remain confined to the functional atomicity fixture and are not presented as integration or process E2E proof.

| Check | Exit | Current signal | Verifiable capture SHA-256 |
| --- | ---: | --- | --- |
| Test integrity | 0 | 5 files, zero skip or fake-live matches, 8 mechanism checks passed | `a06ab2928ed64fd2032c51baf3b349cefc4254a9f599e7795037c9ab24597706` |
| Regression quality | 0 | 5 files, 0 violations, 0 warnings | `321f369bb1af986f32a6b1294468c551b18b02a696214e9578c7a9102d5567bd` |
| Node source lock | 0 | actual lock passed, 16 adversarial mutations rejected | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Environment isolation | 0 | no test-to-production write detected | `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61` |
| Scenario obligations | 0 | 22 coherent scenario matrices | `b83fa7583517d153789f13facf79bd25e61529881fc9a25b3e8c41d409788078` |
| Test mechanisms | 0 | 22 coherent mechanisms | `796e7eae922225a7c8d9252387e0051b698195dc5462834cd979c16af0f0ec88` |
| Scope 03 title and Test Plan resolution | 0 | 6 JSON rows, 6 Markdown rows, 6 exact titles, 4 Scope 03 scenario links | `8b36491a72c6aa77668b21aee148ca4f04ceaa87fd99073a8d5a59efe0dd51ed` |
| Collected test count | 0 | no zero-test evidence | `8a2f6cfb05a82590a5196d0af831c77d60bc6e5be992e4b23c255f8b254a4e05` |
| Goal fidelity | 0 | revision 3 post-finding boundary passed | `bb777a7f384a28a8160279b55f018680351f98493b2b0c78ffe4ff255b049ad8` |
| Strict change boundary | 0 | 10 expected paths, 10 observed, 0 unexpected, 0 destructive paths | `e5fb4e94f78c8ba7f847c48e231e5a9c7153250760907edaf8ad98b95e90f859` |
| Implementation reality | 0 | 5 files, 0 violations, 0 warnings | `2061bb11dd26ecdf2ca2c0522622100a6202ca8ff6639cb15dea9ce24bb65b77` |
| Strict receipt freshness | 0 | 33 closure-bearing current receipts valid, 0 stale | `ab37b19f73a8c8ee02d00b236d60cb4890d12f2b8950ca2a2e44934533b49c3d` |

The final filesystem residue scan found zero Scope 03 fixture directories. The corrected process scan found zero child test or fixture processes. The first process scan matched its own command text and exited nonzero; the corrected scan excluded its own diagnostic label and retained the full process table as the observation source.

### Scope 03 Test Finding Accounting

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Test-owned repairs and current executions are complete, but two foreign-owned mechanical gaps prohibit a test completion claim or state-history write.

| Finding | Disposition | Evidence or owner |
| --- | --- | --- |
| `T028-S03-TEST-CONTROL-COVERAGE` | Addressed | Added bounded test-only controls for SCN-028-016 and SCN-028-017. Both controls produced a targeted RED and an unchanged-byte GREEN. |
| `T028-S03-RECEIPT-FRESHNESS` | Addressed | Append-only reruns superseded each stale closure identity. Strict freshness reports 33 valid and zero stale current receipts. |
| `T028-S03-RESIDUE-DIAGNOSTIC` | Addressed | The corrected filesystem and process checks both report zero residue. |
| `T028-S03-IMPLEMENT-SCENARIO-BINDING` | Unresolved | `scenario-state-resolve.sh` derives all four Scope 03 scenarios only through `RED_VERIFIED`. No owner-authored `phase=implement` scenario receipt exists, so GREEN, live, and regression receipts remain blocked from advancing. Owner: `bubbles.implement`. |
| `T028-S03-PLAN-GATE-CORRESPONDENCE` | Unresolved | The terminal guard reports Scope 03 Gate G068 DoD-to-Gherkin correspondence failures, unrecognized `Scope-Kind: runtime-behavior.`, and non-matching E2E DoD wording. These are planning-text defects. Owner: `bubbles.plan`. |
| `T028-S04-S05-LINK-RESOLUTION` | Preserved sequential finding | The whole-feature resolver reports nine unresolved links or titles assigned to Scopes 04 and 05. The Scope 03-only resolver reports zero unresolved Scope 03 links. |

The canonical scenario derivation capture is `91b89763f583c93184b2bb581469cd7b3d5f559de5eccb04009d1d347d20d5f0`. The terminal transition diagnostic is `67f212b8d05fd62a86743fe6bdbe81026e49e1dc0122e6fdcf9244ec1195bbda`. It reports failed gates G022, G068, and G136 for whole-feature completion. Human acceptance, certification, and overall status remain unchanged. Because the Scope 03 test phase is not mechanically complete, this run adds no Scope 03 test claim and no Scope 03 test execution-history row.

## Scope 03 Implement Scenario-Binding Remediation — 2026-08-29

### Remediation Authority and Boundary

**Phase:** implement
**Claim Source:** executed
**Repository packet:** decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:14`, control revision `14`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`

The installed validator accepted the exact actionable r5 packet before repository work. Goal Contract revision 3 then verified against its persisted digest. The `full-delivery` mode has a `done` ceiling and permits this implementation repair.

This repair changes one product test file. It changes no production module. The new process test creates `company:test` only inside its temporary checkout. The committed policy still contains only `company:msft`.

The repair leaves certified Scopes 01 and 02 unchanged. It adds no completed phase claim and no execution-history row. The existing Scope 03 implement claim and history row remain the only such records.

### SCN-028-017 Production-Process RED and GREEN

**Phase:** implement
**Claim Source:** executed
**RED Command:** `SCOPE03_COVERED_SET_PROCESS_NEGATIVE_CONTROL=advance-failed-subject node --test tests/company-intelligence-publication.e2e.mjs`
**RED Exit Code:** 1
**GREEN Command:** `node --test tests/company-intelligence-publication.e2e.mjs`
**GREEN Exit Code:** 0

The test executes the production CLI in a real temporary Git checkout with a real bare remote. It adds the second subject only to the isolated checkout. A post-cutoff event makes `company:test` fail at the production input-freeze boundary.

The assertions require the refusal field and reason to name `company:test`. They also require unchanged company pointers, brief bytes, Git indexes, commits, and remote refs. The negative control writes a forbidden `company:test` pointer after refusal. This makes the persistent no-advancement assertion fail.

```text
# SCN-028-017 process E2E final-byte negative control RED
$ /usr/bin/env SCOPE03_COVERED_SET_PROCESS_NEGATIVE_CONTROL=advance-failed-subject node --test tests/company-intelligence-publication.e2e.mjs
exit: 1
lines: 32
sha256: 6353c04643b728e432fea843313fa6be240b0ec0bb6c608a025207d78c190c89
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical
✖ Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit
ℹ tests 5
ℹ pass 4
ℹ fail 1
ℹ skipped 0
```

```text
# SCN-028-017 process E2E GREEN
$ node --test tests/company-intelligence-publication.e2e.mjs
exit: 0
lines: 13
sha256: 774f72f5ebdc9e1a5a2eff1e973eb9fcbe2682f3e187562a89c658bdde9c5bf8
✔ Regression E2E: Scope 01 prepare bind-plan and inject-owner-read execute the production CLI without publication authority
✔ Regression E2E: Scope 02 production CLI promotes one coherent generation and rejects illegal phase transitions
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical
✔ Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit
ℹ tests 5
ℹ pass 5
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

The affected integration suite also passed eight tests with zero failures and zero skips. Its capture is `b52eb6ddda65c698b063d4995d17a3adb2b7284049d1052a2d2f264ba438eece`.

### Superseded r5 Implement Scenario Receipts

**Phase:** implement
**Claim Source:** executed

These r5 receipts became stale after their input closures changed. The current r6 receipts below supersede them and own the stable evidence anchor.

Four current commands ran through the canonical recorder. Each command produced a schema-v3 `scenarioBinding` with an exact input closure. Each binding includes a meaningful negative control, claim, test identity, source revision, and production implementation references.

| Scenario | Current command result | Input closure | Verifiable output SHA-256 |
| --- | --- | ---: | --- |
| SCN-028-015 | 5 process tests passed, 0 failed, 0 skipped | 17 files | `ae421e5b3c9bb63454a41550ff56e7da1ff0494b7b496122cc4f9074bb436806` |
| SCN-028-016 | 8 integration tests passed, 0 failed, 0 skipped | 15 files | `866d1738488863ca07d1712e0b5eb1f3794de54bc36870de9a194ed9313b5652` |
| SCN-028-017 | 5 process tests passed, 0 failed, 0 skipped | 17 files | `305a234a0dc328ecb76d579703adef189e7df5c17a98b91cf4aa4e135a77f6ba` |
| SCN-028-022 | 5 process tests passed, 0 failed, 0 skipped | 18 files | `c9fd4a5cf51354b88a0ee2a2a30a11a05a2cf36938cb720722314c36925a986e` |

The receipt-contract assertion produced this result:

```text
{
  "implementReceiptCount": 4,
  "scenarioIds": [
    "SCN-028-015",
    "SCN-028-016",
    "SCN-028-017",
    "SCN-028-022"
  ],
  "uniqueScenarioCount": 4,
  "allExitZero": true,
  "allCurrentRevision": true,
  "allClaimsMeaningful": true,
  "allControlsMeaningful": true,
  "allImplementationRefsPresent": true,
  "allImplementationRefsClosed": true,
  "allClosuresCurrentShape": true
}
FINAL_IMPLEMENT_RECEIPT_CONTRACT_EXIT=0
```

The final strict freshness check reports 20 append-only rows, 13 current identities, 7 superseded rows, 13 valid closures, zero stale closures, and zero unknown closures. Its capture is `5b93cf39cf101c36b92c5f044955ab932141471f4699a6bf507c4e46e9b36a67`.

### Canonical Scenario-State Advancement

**Phase:** implement
**Claim Source:** executed
**Command:** `bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/028-company-intelligence-publication-and-brief-transaction --log .specify/runtime/tool-calls.jsonl --source-revision 3e4938e2eb464cb2ac2b740055513cf462df407c --format text`
**Exit Code:** 0

```text
scenario-state-resolve: specs/028-company-intelligence-publication-and-brief-transaction
  source revision: 3e4938e2eb46
  SCN-028-015  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
  SCN-028-016  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
  SCN-028-017  state=GREEN_TARGETED  derived=[PLANNED RED_VERIFIED IMPLEMENTED GREEN_TARGETED]
  SCN-028-022  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
```

The complete 24-line resolver capture is `c6cc380d65cd567a853e4c89bf1aeaf60170d5d43342aced3c18c5e7826e9e3f`. Every Scope 03 scenario now advances beyond `RED_VERIFIED`.

### Cleanup and Finding Accounting

**Phase:** implement
**Claim Source:** executed

```text
SCOPE03_RESIDUE_CHECK_BEGIN
TMP_ROOT=/var/folders/m_/25mnb8mx4ng1sb7lwd8cl9jw0000gn/T
FIXTURE_RESIDUE_COUNT=0
PROCESS_RESIDUE_COUNT=0
SCOPE03_RESIDUE_CHECK_RESULT=PASS
SCOPE03_RESIDUE_CHECK_END
```

The corrected state and boundary assertion reports 13 checked Scope 03 DoD items and zero unchecked items. It also reports one Scope 03 implement claim and one matching history row. Certified Scopes 01 and 02, later-scope text, and all certification fields remain unchanged. Its capture is `26a00608bc6e24cb2b4c71bf33e0acf8b63515ae28074e3aa24f3047ab1b4cd9`.

| Finding | Disposition | Current proof |
| --- | --- | --- |
| `T028-S03-IMPLEMENT-SCENARIO-BINDING` | Addressed | Four current schema-v3 implement receipts and canonical scenario-state advancement |
| Plan-routed SCN-028-017 process binding | Addressed | Final-byte RED and GREEN through the production CLI, filesystem, Git index, and bare remote |

No assigned finding remains unresolved. Scope 03 remains `In Progress` because certification is validate-owned. The required next owner is `bubbles.test` for independent test-phase closure.

## Scope 03 Current-r6 Implementation Receipt Refresh — 2026-08-29

### Authority and Preserved Boundary

**Phase:** implement
**Claim Source:** executed
**Repository packet:** decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:19`, control revision `19`
**Repository root:** `/private/tmp/research-lab-company-intelligence-delivery-r6`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Source revision:** `6c6a27e1fd42e7c89484dfeb63e76f1d40a56c3e`

The installed validator accepted the exact actionable packet before repository work. The Goal Contract verified against its persisted digest.

The persisted `full-delivery` mode resolved with a `done` ceiling. This refresh changes only this implementation-owned report.

No production or test source changed. Scope 03 remains uncertified, and `bubbles.test` remains the required next owner.

### Current Implement Scenario Receipts

**Phase:** implement
**Claim Source:** executed

The canonical recorder appended one current RED receipt and one current implement receipt per scenario. Each RED receipt discriminated its named contract.

Each implement receipt used the exact r6 source revision. Each command ran against unmodified current inputs and exited zero.

| Scenario | RED exit and stdout SHA-256 | Implement exit and stdout SHA-256 | Current input closure | Implement command result |
| --- | --- | --- | ---: | --- |
| `SCN-028-015` | `1`, `5c193e0dc2bb10026108bb7748500b4e3ceb7c693cf71f6f822b81a13bc1f356` | `0`, `f265eb8312d6a3cec2d3d6f1ff584b7719f8c5b144a5640cae6cc557b3044e64` | 21 files | 5 process tests passed, 0 failed, 0 skipped |
| `SCN-028-016` | `1`, `bb50b30bc342524e26b7e219328baf5c4b82bf3b94251970e470913f411b05be` | `0`, `6f269f30c73546273699372b4d333bfb262a0d16e485a853d468d8af0d14714b` | 17 files | 8 integration tests passed, 0 failed, 0 skipped |
| `SCN-028-017` | `1`, `d225022b8d5bc13674dc0671fe795bc6e90e5736dcef00cfa7ddc5f72a5c662f` | `0`, `ed232c2c7f37edea5b40611effb79f25eda6f2138246ee46a12f6a80f06942b2` | 21 files | 5 process tests passed, 0 failed, 0 skipped |
| `SCN-028-022` | `1`, `6394dad5df3847e6eab98e294f7ca919eab1abcbc1b4febf57d91c1e28bb012b` | `0`, `39a8930556cad3283450dce73af29d34ecaa90c510129e5e028158615eebac7b` | 22 files | 5 process tests passed, 0 failed, 0 skipped |

The receipts carry these exact test identities:

- `SCN-028-015`: `tests/company-intelligence-publication.e2e.mjs#Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit`
- `SCN-028-016`: `tests/company-intelligence-publication.integration.mjs#Regression: SCN-028-016 company validation failure with a valid brief restores both baselines`
- `SCN-028-017`: `tests/company-intelligence-publication.e2e.mjs#Regression E2E: SCN-028-017 one failed subject advances no covered pointer or brief`
- `SCN-028-022`: `tests/company-intelligence-publication.e2e.mjs#Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical`

The machine contract check found four unique implement receipts. It found exact test identities, meaningful controls, meaningful claims, and closed implementation references.

### Receipt Freshness and Exact-title Isolation

**Phase:** implement
**Claim Source:** executed

The strict checker evaluated only the latest receipt for each evidence identity:

```text
{
  "total": 12,
  "current": 10,
  "superseded": 2,
  "withClosure": 10,
  "valid": 10,
  "stale": 0,
  "unknown": 0,
  "staleReceipts": []
}
```

The current exact-title resolver receipt remains truthful about nine later-scope references. It makes no whole-feature resolution claim.

The current receipt carries no `scenarioBinding`. It therefore carries no stale or embedded `SCN-028-022` implementation binding.

```text
{
  "exitCode": 1,
  "hasScenarioBinding": false,
  "inputCount": 11,
  "allClosureHashesPresent": true
}
```

### Canonical Scenario-state Advancement

**Phase:** implement
**Claim Source:** executed
**Command:** `/opt/homebrew/bin/bash .github/bubbles/scripts/scenario-state-resolve.sh --spec-dir specs/028-company-intelligence-publication-and-brief-transaction --log .specify/runtime/tool-calls.jsonl --source-revision 6c6a27e1fd42e7c89484dfeb63e76f1d40a56c3e --format text`
**Exit Code:** `0`

```text
scenario-state-resolve: specs/028-company-intelligence-publication-and-brief-transaction
  source revision: 6c6a27e1fd42
  SCN-028-001  state=PLANNED  derived=[PLANNED]
  SCN-028-002  state=PLANNED  derived=[PLANNED]
  SCN-028-003  state=PLANNED  derived=[PLANNED]
  SCN-028-004  state=PLANNED  derived=[PLANNED]
  SCN-028-005  state=PLANNED  derived=[PLANNED]
  SCN-028-006  state=PLANNED  derived=[PLANNED]
  SCN-028-007  state=PLANNED  derived=[PLANNED]
  SCN-028-008  state=PLANNED  derived=[PLANNED]
  SCN-028-009  state=PLANNED  derived=[PLANNED]
  SCN-028-010  state=PLANNED  derived=[PLANNED]
  SCN-028-011  state=PLANNED  derived=[PLANNED]
  SCN-028-012  state=PLANNED  derived=[PLANNED]
  SCN-028-013  state=PLANNED  derived=[PLANNED]
  SCN-028-014  state=PLANNED  derived=[PLANNED]
  SCN-028-015  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
  SCN-028-016  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
  SCN-028-017  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
  SCN-028-018  state=PLANNED  derived=[PLANNED]
  SCN-028-019  state=PLANNED  derived=[PLANNED]
  SCN-028-020  state=PLANNED  derived=[PLANNED]
  SCN-028-021  state=PLANNED  derived=[PLANNED]
  SCN-028-022  state=IMPLEMENTED  derived=[PLANNED RED_VERIFIED IMPLEMENTED]
```

All four Scope 03 scenarios advance beyond `RED_VERIFIED`. Later-scope states remain unchanged and unclaimed.

### State Preservation and Finding Accounting

**Phase:** implement
**Claim Source:** executed

```text
{
  "scope03ImplementClaims": 1,
  "scope03ImplementHistoryRows": 1,
  "nextRequiredOwner": "bubbles.test",
  "certificationStatus": "in_progress",
  "certifiedCompletedScopes": [
    "01-company-publication-foundation",
    "02-coupled-manifest-and-promotion"
  ],
  "scope03CertificationStatus": "not_started",
  "scope04CertificationStatus": "not_started",
  "scope05CertificationStatus": "not_started"
}
```

The refresh adds no Scope 03 implement claim or history row. It preserves certification fields and human acceptance.

| Finding | Disposition | Current proof |
| --- | --- | --- |
| Current-input receipt for `SCN-028-015` | Addressed | Current schema-v3 implement receipt, exit `0`, with 21 hashed inputs |
| Current-input receipt for `SCN-028-016` | Addressed | Current schema-v3 implement receipt, exit `0`, with 17 hashed inputs |
| Current-input receipt for `SCN-028-017` | Addressed | Current schema-v3 implement receipt, exit `0`, with 21 hashed inputs |
| Current-input receipt for `SCN-028-022` | Addressed | Current schema-v3 implement receipt, exit `0`, with 22 hashed inputs |
| Exact-title receipt embedded `SCN-028-022` binding | Addressed | Current resolver receipt has no `scenarioBinding` and all 11 closure hashes are present |

No assigned stale-receipt finding remains unresolved. This statement covers Scope 03 implementation receipts only.

## Scope 03 Current-r6 Test-Phase Closure — 2026-08-30

### Independent Test Authority and Exact Plan

**Phase:** test
**Claim Source:** executed
**Repository packet:** decision `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:19`, control revision `19`
**Candidate commit:** `6c6a27e1fd42e7c89484dfeb63e76f1d40a56c3e`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`

The installed validator accepted the exact actionable r6 packet before repository work. Goal Contract revision 3 verified. The test phase reread the current Scope 03 requirements, design, plan, scenario manifest, state, report, production transaction modules, integration tests, process tests, and shared atomicity canary.

The six Test Plan commands ran independently on the current r6 bytes.

```text
TP-03-01 exit=0 tests=8 passed=8 failed=0 skipped=0
TP-03-02 exit=0 tests=8 passed=8 failed=0 skipped=0
TP-03-03 exit=0 tests=8 passed=8 failed=0 skipped=0
TP-03-04 exit=0 tests=5 passed=5 failed=0 skipped=0
TP-03-05 exit=0 tests=5 passed=5 failed=0 skipped=0
TP-03-06 exit=0 tests=42 passed=42 failed=0 skipped=0
SELECTED_CLOSURE exit=0 tests=59 passed=59 failed=0 skipped=0 todo=0
SCENARIO_STATES SCN-028-015=REGRESSION_GREEN SCN-028-016=REGRESSION_GREEN
SCENARIO_STATES SCN-028-017=REGRESSION_GREEN SCN-028-022=REGRESSION_GREEN
```

The exact-row capture SHA-256 values are `bfb3c23d725aafd887be462b86165b5e53fc6112aaa2705dca08122ae851bad6`, `978961d95252b7b3971e1c9d993c5db23830c0546cd2b36c1b50cc37d4cbcb64`, `bb14b6c7a2f701ec4942a21caa2c78f514340b999aaef5047fd3b6001d46c94b`, `ad54893e8fcc25988157f8a00c47c8905cd3b21f2860c589c5d76478833bd654`, `61e69b5cde12e9da5fe8c3753b7dfa4e97993f121dca40bf8ba0bbb9c313b2e2`, and `84d7bd80ec0953c3cab3c9e0bf252ae710f3de6145af4ad7a696291897b9fa73`. The complete selected closure capture is `0b0c8c8b4d31bc29317df7ace4d985b3aab4efccd32a5d49ba2e9c0993e99db5`.

### Sensitivity, Integrity, and Boundaries

**Phase:** test
**Claim Source:** executed

Each current-r6 negative control produced the intended targeted RED. The current unmodified commands then produced matching GREEN receipts. Live and regression receipts advanced all four Scope 03 scenarios mechanically to `REGRESSION_GREEN`.

```text
SCN-028-015 negative-control-exit=1 green=0 live=0 regression=0
SCN-028-016 negative-control-exit=1 green=0 live=0 regression=0
SCN-028-017 negative-control-exit=1 green=0 live=0 regression=0
SCN-028-022 negative-control-exit=1 green=0 live=0 regression=0
TEST_INTEGRITY files=5 skip-only-todo-pending=0 fake-live-mocks=0
PRODUCTION_PATH_PROOFS=8/8 SELF_VALIDATING_TESTS=0
REGRESSION_QUALITY violations=0 warnings=0
SOURCE_LOCK exit=0 ENVIRONMENT_ISOLATION exit=0
SCENARIO_OBLIGATIONS exit=0 TEST_MECHANISMS exit=0
EXACT_TEST_PLAN jsonRows=6 markdownRows=6 exactTitles=6 scenarioLinks=4 checkedDoD=6
COLLECTED_TEST_COUNT exit=0 IMPLEMENTATION_REALITY violations=0 warnings=0
GOAL_FIDELITY exit=0 STRICT_BOUNDARY unexpected=0 destructive=0 staged=0
```

The integrity audit capture is `bbd46076d07f15b13bcd7574de57a25fbaa484b6ece3248cb8918123fef1c82c`. Exact-title and Test Plan parity capture is `d98a6f04b01a1351029380e9750151b2983e792edc49856ddf412e7a3c911110`. The corrected strict-boundary capture is `adb34c1bced32a0938f23aea68337704f21fd62b79fd4196e73c65a181724887`. Goal-fidelity output is `bb777a7f384a28a8160279b55f018680351f98493b2b0c78ffe4ff255b049ad8`. Canonical scenario-state output is `fc4ee163bf4ae15c0581ebcd5187bea0bf10e535417d4aa1bf39c3978b71702c`.

The whole-feature linked-test resolver truthfully retains nine unresolved Scope 04 and Scope 05 targets. Every Scope 03 link and exact title resolves. Those sequential later-scope targets do not support any Scope 03 or whole-feature completion claim.

### Test Finding Accounting

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** Every test-owned Scope 03 requirement has current execution evidence. Later-scope and human-acceptance work remains unclaimed.

| Finding | Disposition | Current proof |
| --- | --- | --- |
| `T028-S03-R6-NEGATIVE-CONTROLS` | Addressed | Four independent current-byte RED receipts and matching GREEN receipts |
| `T028-S03-R6-EXACT-ROWS` | Addressed | TP-03-01 through TP-03-06 all exited zero |
| `T028-S03-R6-SELECTED-CLOSURE` | Addressed | 59 tests passed with zero failures, skips, or todos |
| `T028-S03-R6-INTEGRITY` | Addressed | Zero skip or fake-live patterns, eight production-path proofs, and zero circular tests |
| `T028-S03-R6-SCENARIO-STATES` | Addressed | All four Scope 03 scenarios derive `REGRESSION_GREEN` |
| `T028-S03-R6-BOUNDARY` | Addressed | Ten expected paths, zero unexpected, staged, destructive, publication-data, or later-scope paths |
| `T028-S03-R6-RECEIPTS` | Addressed | Pre-write current view reported zero stale and zero unknown receipts |

No test-owned Scope 03 finding remains unresolved. Certification, later scopes, whole-feature status, and human acceptance remain unchanged and unclaimed.

## Scope 03 Fresh-r8 Validate-Owned Certification Refusal — 2026-08-30

**Agent:** `bubbles.validate`
**Scope:** `03-transaction-restoration`
**Mode:** `full-delivery`
**Candidate:** `5168109475308905216d80cbc88f3af34c493a28`
**Captured at:** `2026-08-30T06:12:05Z`
**Repository decision:** `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:24`, control revision `24`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Claim Source:** interpreted
**Interpretation:** The current r8 product and scenario evidence is green, but the canonical state-transition guard blocks one checked Scope 03 execution claim because its plan-owned evidence link resolves to a prose-only implement anchor. Scope 03 remains uncertified.

### Scope 03 Outcome Contract Verification

| Field | Current r8 evidence | Scope 03 result |
| --- | --- | --- |
| Intent contribution | The production transaction paths restore company and brief authority together across brief failure, company failure, covered-set failure, commit refusal, and dry run. | Demonstrated |
| Success-signal contribution | All four Scope 03 scenarios derive `REGRESSION_GREEN` from fresh r8 receipts. | Demonstrated |
| Hard constraints | The selected closure preserves the one-subject committed policy, immutable predecessors, pointer-last authority, exact commit identity, and non-authoritative dry-run state. | Demonstrated |
| Failure condition | Four discriminating controls each turned RED. Their unmodified counterparts and the selected 59-test closure returned green. | Not triggered for Scope 03 behavior |
| Certification integrity | Check 9 rejects the checked scenario-specific regression DoD item's prose-only evidence anchor. | Blocking |

### Current r8 Test and Receipt Matrix

| Evidence | Exit | Result | Full-output SHA-256 |
| --- | ---: | --- | --- |
| TP-03-01 | 0 | 8 passed, 0 failed, 0 skipped | `00c1dc74bb149b9b7e7ee6a88f5cba78ab93656123475464841300b92435aad4` |
| TP-03-02 | 0 | 8 passed, 0 failed, 0 skipped | `cf370600af704ab1ff96de14c1dd614d0a86d2501f49722c851a9dab6ff36ff9` |
| TP-03-03 | 0 | 8 passed, 0 failed, 0 skipped | `896c05b9725a40379859d6de04f2b0304d81858ec2751bbadad87786d6eda6f0` |
| TP-03-04 | 0 | 5 passed, 0 failed, 0 skipped | `4be77099f49557afe9f42cbfe0554fab7d74da467988bccb41f7dd47d1f2e25c` |
| TP-03-05 | 0 | 5 passed, 0 failed, 0 skipped | `98b0eb6b59c68bfc9233857bf364158a40836075286ef0ba6bda444fc0e7f982` |
| TP-03-06 | 0 | 42 passed, 0 failed, 0 skipped | `e5cc3d3ee0d18311bdf1d832354e5036cba7945fcbc4fcfa0c72deded1c5e795` |
| Selected Scope 03 closure | 0 | 59 passed, 0 failed, 0 cancelled, 0 skipped, 0 todo | `b94ef526086d70865e092914778b7f3b7c5689306feef0cda9b66501aa3776b4` |
| Strict receipt freshness | 0 | 23 closure-bearing receipts valid, 0 stale | `b3a9db2733a384d760c5be4f9e79725b1f848ef8c4a4d0b56ebe56ee9268c81f` |
| Receipt-derived scenario states | 0 | SCN-028-015, SCN-028-016, SCN-028-017, and SCN-028-022 are `REGRESSION_GREEN` | `d6c870fe99c7fbe05acb3599c6dc451133936b5ba7ae00c02a2717d4d62ab770` |

**Phase:** validate
**Command:** `node --trace-warnings --test tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/brief-refresh-atomicity.test.mjs tests/distributed-briefs.distributed-publish.unit.mjs`
**Exit Code:** 0
**Claim Source:** executed

```text
# Feature 028 Scope 03 r8 selected 59-test closure
$ node --trace-warnings --test tests/company-intelligence-publication.integration.mjs tests/company-intelligence-publication.e2e.mjs tests/brief-refresh-atomicity.test.mjs tests/distributed-briefs.distributed-publish.unit.mjs
exit: 0
lines: 190
sha256: b94ef526086d70865e092914778b7f3b7c5689306feef0cda9b66501aa3776b4
✔ Regression: SCN-028-015 brief validation failure removes company candidates and restores both baselines
✔ Regression: SCN-028-016 company validation failure with a valid brief restores both baselines
✔ Mutation: SCN-028-017 one failing subject aborts a synthetic two-subject covered set
✔ Regression E2E: SCN-028-022 dry run reaches coherence and leaves repository index pointers artifacts and remote byte-identical
✔ Regression E2E: commit failure restores pre-commit state while push and acknowledgment ambiguity preserve the exact classified commit
✔ Regression canary: existing brief atomicity restores every prior owned path under coupled fault injection
ℹ tests 59
ℹ suites 0
ℹ pass 59
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 86478.268291
```

### Current r8 Discriminating Controls

| Scenario | Control result | RED SHA-256 | Unmodified final receipt |
| --- | --- | --- | --- |
| SCN-028-015 | Retaining the complete index made the incomplete-index refusal assertion fail. | `fb3d7a6c89a9ce22623a003a5d7964bffe4f83705c70d005e16531753dc428a8` | `REGRESSION_GREEN` |
| SCN-028-016 | Reintroducing the brief candidate left a dirty brief pointer and failed restoration. | `d36f4ba6a49181e5c2116ee8b05c11a3df7e2c539513e813f62a65a69bde34f8` | `REGRESSION_GREEN` |
| SCN-028-017 | Reintroducing the failed synthetic subject pointer violated zero-advancement. | `d4b63d3d062c7eccdeffbdbef9839af6388a9f7f1c243b1b09e9cdd0193bc769` | `REGRESSION_GREEN` |
| SCN-028-022 | Recreating a private checkpoint violated dry-run cleanup. | `ed21e37413dc26b70ff014b105c9c1a5dff02518c18653a80db279a336f95c58` | `REGRESSION_GREEN` |

### Current r8 Validation Gate Matrix

| Gate or command | Exit | Scope 03 result | Full-output SHA-256 |
| --- | ---: | --- | --- |
| Goal fidelity, pre-certification | 0 | Pass | `3bc6db28381ca97126677622f3eccd914d5ec26e9fae7e71814eeaf2db389a46` |
| Pages build | 0 | Pass | `9dc91ec5001df2ee496a38f5673df69b8c6f42e43dfb97717717574da7e7a366` |
| Node source lock | 0 | Pass; 16 adversarial mutations rejected | `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1` |
| Artifact lint | 0 | Pass | `6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3` |
| Implementation reality | 0 | 7 files, 0 violations, 0 warnings | `8c42d47ae704040365670e359c436748051343b225987b63352e5d686ee9cf32` |
| Regression quality | 0 | 5 files, 0 violations, 0 warnings | `b51df2412348f2ff003a895d5df8c45e65cac77b92591cd31a7c616aa51e0b5a` |
| Scenario obligations and test mechanisms | 0 | 22 coherent scenario matrices and 22 coherent mechanisms | `b83fa7583517d153789f13facf79bd25e61529881fc9a25b3e8c41d409788078`, `796e7eae922225a7c8d9252387e0051b698195dc5462834cd979c16af0f0ec88` |
| Environment isolation | 0 | Pass | `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61` |
| Artifact freshness | 0 | 0 failures, 0 warnings | `72ec6c1adde17438f91ae8704ca5b4ec3eb702762a75d9ad85b8ced52bb94605` |
| Claim source, collected-test count, execution substate | 0 | Pass | `6210f5e85489b86b19520504105d7179d5a7ea0713dc6e42187cd3d35c5d4653`, `8a2f6cfb05a82590a5196d0af831c77d60bc6e5be992e4b23c255f8b254a4e05`, `282c18a1883a31f7cd787c869919d94b3d6dd80ef4d12e3932db4fda12230a79` |
| Domain invariant and model consistency | 0 | 6 invariants anchored; model consistent | `c65822642cc1859bba887ee1e695f944bb0ffeab8763df7eed30ac2e17d123be`, `1650f6d349fdff760d20bc3e7dced3fd3f9653b85be47e09c05d4739ac456b32` |
| Changed-spec audit | 0 | One in-progress spec; terminal checks correctly skipped | `3062a89f8962f4e5410e63ffe61fa760fbc8e839534dc4cca2a85fd3f0f61766` |
| Observability SLO applicability | 0 | G100 no-op because no `traceContracts.observability` block exists | `2079b4a7a16b34289e44c11606457351773c1e059a3b4e49440f20f8d1ada585` |
| Post-test byte boundary and residue | 0 | Exact candidate bytes; only `.bubbles-worktree`; 0 staged, fixture, or process residue | `3fe4042f13e69f9f96979596c394d5e922601a4a2aac5e9e79d0d5501adb2c18` |

### Blocking Scope 03 Finding

`VAL-028-S03-EVIDENCE-ANCHOR` is unresolved. The registry-asserted state-transition guard exited `1` with bounded capture `c0c338075c43c27cedaea0cc1ce8c367d6db288ab643f89738404515ca5df87e` and diagnostic capture `6d3474dad89d627ce71c5737e45b275a1dd566e911d5c2bf2f22b3f002b6b403`. Check 9 reported that the checked Scope 03 scenario-specific regression item links to `#current-implement-scenario-receipts`, whose resolved report block has no command-output signature. The item asserts an execution outcome, so prose-only receipt metadata cannot satisfy it.

The required owner is `bubbles.plan`. The plan owner must change only that DoD evidence reference to a real executed evidence anchor, preserving the DoD text, all 13 checked boxes, all six Test Plan rows, and every other scope. This r8 section provides the current executed anchor. Validation must re-run the affected lint, receipt, traceability, transition, and G128 checks after that owner write.

### Preserved Non-Scope-03 Conditions

- The whole-feature linked-test resolver and traceability guard remain nonzero only for nine unresolved Scope 04 and Scope 05 targets and ten corresponding missing-file mappings.
- Gate G068 reports six missing DoD-to-Gherkin mappings only in Scope 04 and Scope 05.
- Gate G097 reports the planned Scope 05 Content-Security-Policy mechanism before Scope 05 implementation.
- The repository selftest remains nonzero with 3,459 passes and nine failures assigned to planned Scope 04 and Scope 05 test and registration work.
- Gate G022 still requires later full-delivery phases. Gate G136 still requires human acceptance only for the eventual terminal transition.
- Framework-write-guard and doctor retain five pre-existing installed-agent checksum drifts. The Scope 03 candidate contains no framework-managed path.

### Finding Accounting and Disposition

**Addressed in r8:** exact packet and Goal Contract validation; all six Test Plan executions; all four RED controls; current implementation, GREEN, live, and regression receipts; selected 59-test closure; exact titles; 13-of-13 checked DoD inventory; implementation reality; source lock; isolation; domain; byte identity; and residue checks.

**Unresolved Scope 03:** `VAL-028-S03-EVIDENCE-ANCHOR` only.
**Disposition:** `route_required` to `bubbles.plan`.
**Certification:** withheld. Scope 03 remains `In Progress`; both feature status mirrors remain `in_progress`; certified Scopes 01 and 02, Scopes 04 and 05, and human acceptance remain unchanged.

## Scope 03 Validate-Owned Certification After Evidence-Anchor Repair — 2026-08-30 {#scope-03-validate-owned-certification-after-anchor-repair-2026-08-30}

**Agent:** `bubbles.validate`
**Scope:** `03-transaction-restoration`
**Mode:** `full-delivery`
**Candidate:** `5168109475308905216d80cbc88f3af34c493a28`
**Repository decision:** `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:25`, control revision `25`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The repaired plan-owned link resolves to the existing executed r8 59-test block. Current artifact, receipt, scenario-state, traceability, reality, freshness, and transition checks no longer report a Scope 03 evidence failure. The nonzero whole-feature checks name only Scope 04, Scope 05, remaining full-delivery phases, and terminal human acceptance.

### Outcome Contract Verification

| Field | Scope 03 evidence | Status |
| --- | --- | --- |
| Intent contribution | Exact-HEAD receipts derive `REGRESSION_GREEN` for the four restoration and non-authoritative-outcome scenarios. | Demonstrated for Scope 03 |
| Success-signal contribution | The anchored executed block proves brief failure, company failure, covered-set failure, dry run, commit recovery, and the shared atomicity canary on the r8 candidate. | Demonstrated for Scope 03 |
| Hard constraints | The current delta contains only report evidence and the one plan-owned evidence-link correction. No source, test, subject-policy, publication-data, Feature 025, or framework path changed. | Preserved for Scope 03 |
| Failure condition | Strict receipts report zero stale entries. The current resolver derives all four Scope 03 scenarios through `REGRESSION_GREEN`. | Not triggered for Scope 03 |
| Whole-feature outcome | Scopes 04 and 05, remaining full-delivery phases, and human acceptance are still open. | Not claimed |

### Repaired Anchor Verification

The complete scope diff contains one plan-owned substitution: `report.md#current-implement-scenario-receipts` became `report.md#current-r8-test-and-receipt-matrix`. The resolved report block contains the executed command, exit `0`, `190` output lines, full-output SHA-256 `b94ef526086d70865e092914778b7f3b7c5689306feef0cda9b66501aa3776b4`, six named Scope 03 regressions, and the `59`-test zero-failure summary.

Artifact lint now accepts every checked DoD item. The registry-asserted transition result omits G025 and Check 9 from its failure set. This closes `VAL-028-S03-EVIDENCE-ANCHOR` without changing the DoD text, its checked state, the six Test Plan rows, or any implementation or test file.

### Current Certification Evidence

**Commands:** Exact packet validation; Goal Contract verification; G128; goal fidelity; artifact lint; strict receipt check; scenario-state resolution; traceability; scenario obligations; test mechanisms; implementation reality; regression quality; claim-source lint; collected-test count; execution substate; artifact freshness; changed-spec audit; handoff-cycle check; transition-contract resolution; registry-asserted state-transition guard; Git boundary and whitespace checks.
**Exit Code:** `0` for every Scope 03-applicable check. Whole-feature traceability and transition checks exited `1` only for classified sequential or terminal obligations. The unsupported single-file `--current-scope` traceability attempt exited `2` and was replaced by the complete all-scope diagnostic.
**Claim Source:** interpreted
**Interpretation:** These current commands validate the evidence repair and certification boundary. The product suites were not repeated because no implementation or test path changed; the exact-HEAD strict receipts and scenario-state resolver revalidated the already-recorded executed r8 block instead.

```text
REPOSITORY PACKET VALID actionable=true decision=rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:25 revision=25
goal-contract: verified gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3 revision 3
PASS Gate G128: convergence=2/10 wall-clock=41.67/1440 toolBytesMax=11604/500000 toolBytesSum=188454/10000000
goal-fidelity-guard: PASS boundary=pre-certification
ANCHOR_DIFF exit=0 lines=13 sha256=7f1222cc99a320bdca58bc4be214c7cc936188fb232419d70e89609faf126cca
ARTIFACT_LINT exit=0 checked-DoD-evidence=accepted sha256=6fa07b59f80a34023a08a8bdf519737216e354b5c39c62ba12d9a556cba683b3
STRICT_RECEIPTS exit=0 total=71 current=69 withClosure=26 valid=26 stale=0 sha256=4144f560993a620208516047508d71031c776886709790213b8df8c21bd7c410
SCENARIO_STATE exit=0 SCN-028-015=REGRESSION_GREEN SCN-028-016=REGRESSION_GREEN
SCENARIO_STATE exit=0 SCN-028-017=REGRESSION_GREEN SCN-028-022=REGRESSION_GREEN sha256=d6c870fe99c7fbe05acb3599c6dc451133936b5ba7ae00c02a2717d4d62ab770
TRACEABILITY_SCOPE03 scenarios=4 testRows=6 missingFiles=0 missingEvidence=0 dodMappings=4
TRACEABILITY_ALL_SCOPES exit=1 failures=10 scope04Or05Only=true sha256=db22a5498f707bb346a262d49ee3f8810dd914b5cca99acc10727d8df88553ce
IMPLEMENTATION_REALITY exit=0 files=7 violations=0 warnings=0 sha256=8c42d47ae704040365670e359c436748051343b225987b63352e5d686ee9cf32
REGRESSION_QUALITY exit=0 files=5 violations=0 warnings=0 sha256=b3c485cf7de6ac7dde80bbcbb8d2d62c6dc08a6f463fdf0266ca9f59a2f5eb41
ARTIFACT_FRESHNESS exit=0 failures=0 warnings=0 sha256=dc034b5bc990d3f3c1b2d02c44407be2db4c87725242e2af63aa42f61da3c7c0
CHANGED_SPEC_AUDIT exit=0 specs=1 doneSpecs=0 artifactLintPassed=1 sha256=3062a89f8962f4e5410e63ffe61fa760fbc8e839534dc4cca2a85fd3f0f61766
STATE_TRANSITION exit=1 failedGateIds=[G022,G068,G097,G136] failedChecks=[Check-4-scenario-states,Check-5-all-done,Check-8-file-existence]
STATE_TRANSITION failureCount=35 scope03EvidenceFailure=false sha256=6d17aacf3949b44d0df6e4a4f6d1c235682ab89a19d08d097bdabc1c92f1fc0d
DIFF_CHECK exit=0 trackedBeforeCertification=[report.md,scopes.md] untrackedControl=.bubbles-worktree
```

### Finding Accounting and Sequential Disposition

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `VAL-028-S03-EVIDENCE-ANCHOR` | Addressed | Artifact lint accepts the repaired anchor and the state-transition failure set no longer contains G025 or Check 9. |
| G022 remaining phase requirements | Expected sequential obligation | Scope 04, Scope 05, and terminal full-delivery phases have not run. |
| G068 and all-scope traceability failures | Expected sequential obligation | Five missing manifest test references and five missing concrete-row references belong only to Scope 04 or Scope 05. Scope 03 reports four scenarios and six concrete rows with complete evidence. |
| G097 Content-Security-Policy correspondence | Expected Scope 05 obligation | The named generated-script mitigation is in the Scope 05 public-delivery surface and is not a Scope 03 transaction-restoration requirement. |
| G136 human acceptance | Expected terminal obligation | The human-owned checklist remains unchanged and unchecked. |

No Scope 03 finding remains unresolved. Scope 03 is certified `Done`. Scopes 01 and 02 remain certified. Scopes 04 and 05 remain `Not Started`. Both feature status mirrors remain `in_progress`. Scope 04 is the next eligible implementation target; this certification does not start it or claim the whole feature complete.

## Scope 04 Test-Owned Independent Final-Byte Closure — 2026-08-31 {#scope-04-test-owned-independent-final-byte-closure-2026-08-31}

**Agent:** `bubbles.test`
**Mode:** `full-delivery`
**Scope:** `04-shared-trigger-integration`
**Repository decision:** `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:32`, control revision `32`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Source revision:** `32289ee5b985e16c055e2cb3b22c0aed90964981`
**Final functional-test SHA-256:** `a1282714c01c909c711644d56120d32dd8af1139c4be29b451b487f73fafa98e`
**Final-byte closure:** 76 paths, aggregate SHA-256 `9b0776aea9a516441c3d49b590667b74bcd5fb1f30dadb9cc963139a25429eb6`
**Phase:** test
**Claim Source:** executed

The functional harness contains one `120_000` millisecond subprocess timeout and no `30_000` millisecond predecessor. No source, test, or planning byte changed during this independent run. The command-backed evidence below applies only to Scope 04. It makes no Scope 05, whole-feature, certification, or human-acceptance claim.

### Current Final-Byte Test Plan Matrix

All six exact Test Plan commands ran on the same final source and test bytes. Each structured receipt binds the current 70-path union of production, test, fixture, policy, and scenario inputs.

| Test Plan row | Result | Tests passed | Tests failed | Tests skipped | Full-output SHA-256 |
| --- | ---: | ---: | ---: | ---: | --- |
| TP-04-01 | 0 | 8 | 0 | 0 | `f1fbd569ebf31d719f793e9c6c754fafe898a28bc69a9bf4e764d007ea2ff049` |
| TP-04-02 | 0 | 8 | 0 | 0 | `bf4448678d53b83e8f595eaf725431a645614293e4cc8725fee69903701dac08` |
| TP-04-03 | 0 | 8 | 0 | 0 | `9d06d5899b3d97bfcb7950923fb4c0a8ef0468c0ea94582dbd18ffa5d4e0b871` |
| TP-04-04 | 0 | 1 | 0 | 0 | `41ed8c23508f363dd2518e2cb70e7c593e058b0e023403b9a833aefe380ebdfe` |
| TP-04-05 | 0 | 9 | 0 | 0 | `12927d80767a29628d7485ee934c11543e142ffccffb1e62cd31b812cfaa320a` |
| TP-04-06 | 0 | 43 | 0 | 0 | `316ed74c32abd20435b5b12bf4b8c1baeed859cb9072145f4c92a2ecf046f06e` |

**Command:** current final-byte structured receipt ledger assertion
**Exit Code:** 0
**Claim Source:** executed
**Full-output SHA-256:** `18b926213df9e8d5b9a4698329698055a9aa10584c615e07fc7e55e8317a61bf`

```text
TEST_PLAN_RECEIPT id=TP-04-01 exit=0 inputs=70 stdout=9d936294f767f668e38de05433585d7709840d88b9ad1eda76f664b9ad18b4c3 durationMs=76921
TEST_PLAN_RECEIPT id=TP-04-02 exit=0 inputs=70 stdout=721bd94ec587a3ecda6aa2b1f104741a381da0b36d9e96b1e2c6b18a5cafb54d durationMs=57954
TEST_PLAN_RECEIPT id=TP-04-03 exit=0 inputs=70 stdout=2bd9031a57614c56b251d2d99a30ad8b9969136133d0119b4b0475bc29547f36 durationMs=60197
TEST_PLAN_RECEIPT id=TP-04-04 exit=0 inputs=70 stdout=a55b6248b723bb2dc86495a3d04137f3ceb1a5c53cdd2003e3f18604eaedba3c durationMs=7604
TEST_PLAN_RECEIPT id=TP-04-05 exit=0 inputs=70 stdout=d9d94f038f4ccca4c0a92d20ec019c343da0389af902d0449616b3bbe1a3eb4f durationMs=3569
TEST_PLAN_RECEIPT id=TP-04-06 exit=0 inputs=70 stdout=e8a35a96528c5e59391f837c5c9fb2b0feefd491c2cca102422637acaca2d376 durationMs=85612
SCENARIO_PHASE_RECEIPT_COUNT=16
TEST_PLAN_RECEIPT_COUNT=6
SCENARIO_INPUTS_EACH=69
TEST_PLAN_INPUTS_EACH=70
STALE_CURRENT_FINAL_BYTE_RECEIPTS=0
SCOPE04_RECEIPT_LEDGER_RESULT=PASS
```

### Current Final-Byte RED, GREEN, LIVE, and REGRESSION Receipts

Every scenario phase uses the exact planned test identity, the same meaningful negative control across RED and GREEN, the current source revision, declared production references, and a 69-path current input closure. RED exited nonzero for the intended perturbation. GREEN, LIVE, and REGRESSION each exited zero on unmodified final bytes.

```text
SCENARIO_RECEIPT id=SCN-028-003 phase=red exit=1 inputs=69 stdout=c7544bdc2c1f180ae9e62155da6bed3f14586966014fb2c4fad3a43b62fbeee5 durationMs=63227
SCENARIO_RECEIPT id=SCN-028-003 phase=green exit=0 inputs=69 stdout=0fdce197fa668d761f1fa931dd7c5b9862626d591f37fa02c3dcb28768553e6d durationMs=87192
SCENARIO_RECEIPT id=SCN-028-003 phase=live exit=0 inputs=69 stdout=412016397094b8bc298468ad13d18cd43260f7aae59eedbbcebea5dae2c6f23e durationMs=69696
SCENARIO_RECEIPT id=SCN-028-003 phase=regression exit=0 inputs=69 stdout=48f8dc60dfddec82b02aa9b3ee551abe8da4f02b9eef97a6f63e17bb5ba06c08 durationMs=87493
SCENARIO_RECEIPT id=SCN-028-004 phase=red exit=1 inputs=69 stdout=07456d60868349366b1ba882eeb9d5c44eb82941f3a6a374d329d126eba26a1f durationMs=75746
SCENARIO_RECEIPT id=SCN-028-004 phase=green exit=0 inputs=69 stdout=45452466063b7f4811ab6aae4ea67013f08c38d60e2f38de188ac322f85b00bd durationMs=59485
SCENARIO_RECEIPT id=SCN-028-004 phase=live exit=0 inputs=69 stdout=4d44076aa658f0ac081d105fd45e8dc4cfefd63da4d0e75d842ba1398f90ef7c durationMs=73348
SCENARIO_RECEIPT id=SCN-028-004 phase=regression exit=0 inputs=69 stdout=deae59d1f1ae7d54620e98f1b7097f93830735fc8c1a5d63f5f186fcd88f8e57 durationMs=112800
SCENARIO_RECEIPT id=SCN-028-012 phase=red exit=1 inputs=69 stdout=20018b1f552457d21a6ae1e552c0cd622864d7891cac2ec51042779834db3780 durationMs=69086
SCENARIO_RECEIPT id=SCN-028-012 phase=green exit=0 inputs=69 stdout=af77e94b25465c68ea6ef4e1bc0d0aa84440a8a9e360a24d400623e142d3be6c durationMs=114348
SCENARIO_RECEIPT id=SCN-028-012 phase=live exit=0 inputs=69 stdout=b7d1b1b450eb0567bc9059439461c721bb2fdd5be0010c413a0e51827f17e5f1 durationMs=58146
SCENARIO_RECEIPT id=SCN-028-012 phase=regression exit=0 inputs=69 stdout=6e9b35fbcb30e6bb7e8331d77b616a2af0d816045a3f8c079b0901bdc6a29835 durationMs=57934
SCENARIO_RECEIPT id=SCN-028-019 phase=red exit=1 inputs=69 stdout=341d4ce7800c7177754df2687a1a9554dcd2c764ead7c1dc92ed217e4feca939 durationMs=5897
SCENARIO_RECEIPT id=SCN-028-019 phase=green exit=0 inputs=69 stdout=e4d34e35416c00964a2ba99ef3bd0940e5d3d60758aeaddbb3918a1f1a018e48 durationMs=7212
SCENARIO_RECEIPT id=SCN-028-019 phase=live exit=0 inputs=69 stdout=f3f9659193732073b3a698b267f44003510f8ebd6163663b188348b333d9b602 durationMs=7025
SCENARIO_RECEIPT id=SCN-028-019 phase=regression exit=0 inputs=69 stdout=bd1d72cfdcef5e4f7591da89c2622107acd7d5d23133463b703ca18d819bb34c durationMs=7530
SCENARIO_PHASE_RECEIPT_COUNT=16
STALE_CURRENT_FINAL_BYTE_RECEIPTS=0
SCOPE04_RECEIPT_LEDGER_RESULT=PASS
```

### Receipt Freshness and Derived Scenario State

**Strict receipt command:** `.github/bubbles/scripts/evidence-receipt-check.sh --log .specify/runtime/tool-calls.jsonl --repo-root . --strict`
**Exit Code:** 0
**Claim Source:** executed
**Full-output SHA-256:** `115b8ed42f905f0725fd691ddb34af71dae7555bb164cefc516d51534b931f70`

```text
{
  "total": 174,
  "current": 117,
  "superseded": 57,
  "withClosure": 117,
  "valid": 117,
  "stale": 0,
  "unknown": 0,
  "staleReceipts": []
}
```

**Scenario-state command:** receipt-derived Scope 04 state assertion over the canonical resolver
**Exit Code:** 0
**Claim Source:** executed
**Full-output SHA-256:** `799c2e33308cbc707fcf741948e20d3c41a810bd867ee361cc85f67cba60af9e`

```text
SCENARIO_RESOLVER_PROCESS_EXIT=0
SCENARIO_RESOLVER_SOURCE_REVISION=32289ee5b985e16c055e2cb3b22c0aed90964981
SCENARIO_RESOLVER_BLOCKING_REFUSALS=0
SCENARIO_STATE id=SCN-028-003 highest=REGRESSION_GREEN receipts=10 blocked=0 missing=0
SCENARIO_DERIVED id=SCN-028-003 states=PLANNED,RED_VERIFIED,IMPLEMENTED,GREEN_TARGETED,GREEN_LIVE,REGRESSION_GREEN
SCENARIO_STATE id=SCN-028-004 highest=REGRESSION_GREEN receipts=10 blocked=0 missing=0
SCENARIO_DERIVED id=SCN-028-004 states=PLANNED,RED_VERIFIED,IMPLEMENTED,GREEN_TARGETED,GREEN_LIVE,REGRESSION_GREEN
SCENARIO_STATE id=SCN-028-012 highest=REGRESSION_GREEN receipts=10 blocked=0 missing=0
SCENARIO_DERIVED id=SCN-028-012 states=PLANNED,RED_VERIFIED,IMPLEMENTED,GREEN_TARGETED,GREEN_LIVE,REGRESSION_GREEN
SCENARIO_STATE id=SCN-028-019 highest=REGRESSION_GREEN receipts=43 blocked=0 missing=0
SCENARIO_DERIVED id=SCN-028-019 states=PLANNED,RED_VERIFIED,IMPLEMENTED,GREEN_TARGETED,GREEN_LIVE,REGRESSION_GREEN
SCOPE04_REGRESSION_GREEN_COUNT=4
SCOPE04_SCENARIO_STATE_RESULT=PASS
```

### Test Integrity and Governance

**Command:** current-final-byte syntax, portability, source-lock, environment-isolation, regression-quality, skip-marker, fake-live, scenario-obligation, test-mechanism, implementation-reality, Goal Contract, and goal-fidelity matrix
**Exit Code:** 0
**Claim Source:** executed
**Full-output SHA-256:** `117371cab51b87487d02ef8862ae5398c52ecfec39da72ec3dde9cf7f90b4e8d`

```text
SCOPE04_FINAL_GOVERNANCE_BEGIN
NODE_CHECK file=scripts/brief-distributed-publish.mjs exit=0
NODE_CHECK file=scripts/company-intelligence-publication.mjs exit=0
NODE_CHECK file=tests/brief-refresh-atomicity.test.mjs exit=0
NODE_CHECK file=tests/company-intelligence-publication.e2e.mjs exit=0
NODE_CHECK file=tests/company-intelligence-publication.functional.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler.e2e.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler-failures.integration.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler.integration.mjs exit=0
NODE_CHECK file=tests/distributed-briefs.scheduler.unit.mjs exit=0
BASH_SYNTAX file=scripts/brief-refresh-and-push.sh exit=0
BASH_SYNTAX file=scripts/brief-refresh-scheduled.sh exit=0
PLUTIL_EXIT=0
SHELLCHECK_EXIT=0
SOURCE_LOCK_EXIT=0
ENVIRONMENT_ISOLATION_EXIT=0
REGRESSION_QUALITY_EXIT=0
SKIP_MARKER_SCAN_EXIT=1 SKIP_MARKER_COUNT=0
FAKE_LIVE_SCAN_EXIT=1 FAKE_LIVE_MATCH_COUNT=0
SCENARIO_OBLIGATION_EXIT=0
TEST_MECHANISM_EXIT=0
REQUIREMENT_MECHANISM_EXIT=0
IMPLEMENTATION_REALITY_EXIT=0
GOAL_CONTRACT_EXIT=0
GOAL_FIDELITY_EXIT=0
TEST_INTEGRITY_FILE_COUNT=7
SCOPE04_FINAL_GOVERNANCE_FAILURES=0
SCOPE04_FINAL_GOVERNANCE_END
```

#### Mock Audit Results

- **Files scanned:** 7 Scope 04 test files.
- **Mock patterns found:** 0.
- **Reclassifications:** none.
- **Live-path result:** The process suites exercised production launchers, real temporary Git repositories, and bare remotes.

#### Self-Validating Test Audit

**Claim Source:** interpreted
**Interpretation:** The four targeted perturbations each made the planned assertion fail, while unmodified runs passed. The assertions observe production-created journals, commits, remotes, pointers, phase histories, restoration bytes, and named refusals rather than merely echoing fixture literals.

- **Tests audited:** all six Scope 04 Test Plan rows and all four scenario controls.
- **Self-validating tests found:** 0.
- **Negative controls:** final company binding removal, shared lease bypass, interrupted parent removal, and final frozen-boundary bypass.
- **Regression permanence:** SCN-028-003, SCN-028-004, SCN-028-012, and SCN-028-019 each hold `REGRESSION_GREEN`.

### Finding Accounting and Ownership Boundary

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `S04-TST-001` — current functional timeout byte invalidated prior input closures | Addressed | Every stale command identity was re-executed through append-only supersession. Strict freshness returned zero stale and zero unknown receipts. |
| `S04-TST-002` — SCN-028-003, SCN-028-004, and SCN-028-012 lacked current-final-byte four-phase receipts | Addressed | Twelve new RED, GREEN, LIVE, and REGRESSION receipts bind exact tests, controls, source revision, production references, and 69 current inputs. |
| `S04-TST-003` — SCN-028-019 receipt identities disagreed after the timeout correction | Addressed | Its current and historical command identities were re-executed. The final four-phase chain is current and derives `REGRESSION_GREEN`. |
| `S04-TST-004` — six Test Plan rows required one final-byte epoch | Addressed | TP-04-01 through TP-04-06 each exited zero with zero failed or skipped tests and current 70-path closures. |
| `S04-TST-005` — the first receipt-ledger audit expected 69 inputs for Test Plan receipts | Addressed | The corrected audit used the observed 70-path union and exited zero with SHA-256 `18b926213df9e8d5b9a4698329698055a9aa10584c615e07fc7e55e8317a61bf`. |

**Addressed findings:** 5.
**Unresolved findings:** 0.
**Certification boundary:** Certification fields, certified Scopes 01 through 03, Scope 05, and human acceptance are unchanged. Scope 04 test execution is independently verified and routed to `bubbles.validate`.

## Scope 04 Validate-Owned Certification — 2026-08-31 {#scope-04-validate-owned-certification-2026-08-31}

**Agent:** `bubbles.validate`
**Mode:** `full-delivery`
**Scope:** `04-shared-trigger-integration`
**Repository decision:** `rb:vscode-c113b01e3cfa5fd40974bb3a063d5347:33`, control revision `33`
**Goal Contract:** `gc:vscode-1f5b7362918071b6b2de16fb3709dfae:3`, revision `3`
**Phase:** validate
**Claim Source:** interpreted
**Interpretation:** The current command outputs directly establish receipt freshness, scenario state, static integrity, DoD completeness, and state coherence. The certification conclusion also separates six later-scope traceability failures and a pre-existing framework-install drift condition from the Scope 04 boundary.

### Outcome Contract Verification (G070)

| Field | Declared Scope 04 contribution | Evidence | Status |
| --- | --- | --- | --- |
| Intent | Scheduled and on-demand recreation share one coupled company-and-brief publication path. | SCN-028-003 and SCN-028-004 derive `REGRESSION_GREEN`; TP-04-01 and TP-04-02 each have two validate rows at exit `0`. | PASS for Scope 04 |
| Success Signal | One covered-company version and its consuming brief share an acknowledged generation. Public registration remains the sequential Scope 05 contribution and is not claimed here. | SCN-028-003, SCN-028-004, and SCN-028-012 derive the complete planned-to-regression chain. | PASS for Scope 04 |
| Hard Constraints | Trigger parity, explicit `company:msft` coverage, exact resume, frozen-source refusal, atomic publication, and protected prior scopes remain intact. | Four Scope 04 scenarios derive `REGRESSION_GREEN`; the 28-check static matrix exits `0`; the preservation assertion exits `0`. | PASS for Scope 04 |
| Failure Condition | No successful Scope 04 path produces a one-sided generation, divergent retry, or drifted source set. | SCN-028-003, SCN-028-012, and SCN-028-019 hold full RED-to-regression chains with no blocking refusal. | PASS for Scope 04 |

### Narrow Certification Evidence

| Check | Result | Current evidence |
| --- | --- | --- |
| Prior validate Test Plan epochs | PASS | Structured-log assertion found exactly 12 rows: TP-04-01 through TP-04-06 twice, every row at exit `0`. No suite was rerun during this resumed boundary. |
| Prewrite strict receipt freshness | PASS | Direct, non-recorded check: total `234`, current `134`, valid `134`, stale `0`, unknown `0`; SHA-256 `8447b13a4fb904f3372083119782e20d2fbdd7ce22d25def003035302d587312`. |
| Derived scenario state | PASS | SCN-028-003, SCN-028-004, SCN-028-012, and SCN-028-019 each derive `PLANNED → RED_VERIFIED → IMPLEMENTED → GREEN_TARGETED → GREEN_LIVE → REGRESSION_GREEN`; SHA-256 `b570ae962b1d7de9e536ca82b9b938da954c1144736a4b1b09716e64fc0ae09c`. |
| Static integrity | PASS | All 28 applicable checks passed with no failed labels; SHA-256 `b2459c330b6dfedbeda188ea774c085b63750d3f578259f967d11a0bede7c7af`. The dedicated current shellcheck receipt remains exit `0`. |
| Applicable certification gates | PASS | Mode, Goal Contract, pre-certification fidelity, G128, artifact lint, claim source, references, context fit, vertical plan, execution substate, and changed-spec audit all passed; SHA-256 `360de1077610427e4d3f4665fe4ca47d03f5357f86b714f83142baecf3b1cd5a`. |
| Scope and state eligibility | PASS | Scope 04 has 15 checked DoD items, zero unchecked items, 15 evidence links, one implement claim, one test claim, and no prior validate claim; SHA-256 `5a08398ca2dceff7ca848101425c5e026f01a6cc61768fed8f740cb1f14cf557`. |
| Postwrite receipt and scenario finality | PASS with explicit artifact-only invalidation | The direct strict whole-ledger check exits `1` because 38 receipts include the now-changed validate-owned `scopes.md`, `state.json`, or `report.md` in their input closures. The classifier finds zero stale source or test paths. The scenario resolver exits `0`, and all four Scope 04 scenarios remain `REGRESSION_GREEN`; SHA-256 `fcd1fbde3b86dab5a1b6357fe1443d13bbd9767491e1706e39eca9561f89b974`. The six Test Plan suites were not rerun because the check found no product or test defect. |

### Non-Scope-04 Diagnostics

The all-scope traceability guard exits `1` with six findings and SHA-256 `fe432ae7999d6406085f02ec2731cb458846e2902ebaa731d13e60acd990fe05`. Three missing linked-test references belong to Scope 05 scenarios SCN-028-001, SCN-028-018, and SCN-028-020. The other three findings name Scope 05 rows for public registration, dated failed-refresh state, and private-state-free public delivery. The same transcript reports every Scope 04 scenario-to-row, file, evidence, and DoD edge as present.

The framework write guard exits `1` because five installed agent files differ from the release checksum, SHA-256 `50c0596f6876882a7f353bf6e9b1ffbdc6db3ee60f172611114e1b6924c64358`. A base-to-HEAD and worktree attribution check exits `0`, SHA-256 `fd628d6a69512eb94f891165d2eb031aa39a7d4049d56d748d46d46049860fe6`, and proves all five files are byte-identical to the pre-Scope-04 base and clean in the current worktree. Scope 04 modifies no framework-managed file.

### Finding Accounting and Certification Disposition

| Finding | Disposition | Evidence |
| --- | --- | --- |
| `VAL-S04-001` — receipt validation was previously recorded through the receipt logger and invalidated its own observation | Addressed | The strict check ran directly outside the logger and returned zero stale and zero unknown receipts. |
| `VAL-S04-002` — the prior static aggregate returned nonzero without a stable Scope 04 classification | Addressed | The corrected 28-check aggregate passed. Shellcheck remains a separate current exit-`0` receipt. |
| `VAL-S04-003` — `--current-scope` is unsupported for single-file scope layout | Addressed | The supported all-scope guard ran. Its exact six findings map only to Scope 05; Scope 04 traceability is complete. |
| `VAL-S04-004` — certification writes invalidate receipts that hash mutable certification artifacts | Addressed | The required postwrite check ran directly. All 38 stale reasons name only `scopes.md`, `state.json`, or `report.md`; no source or test path is stale, and all four Scope 04 scenario chains remain regression-green. |

**Addressed Scope 04 findings:** 4.
**Unresolved Scope 04 findings:** 0.
**Certification disposition:** Scope 04 is certified `Done`. Scopes 01 through 03 remain certified, Scope 05 remains `Not Started`, both feature status mirrors remain `in_progress`, and human acceptance remains unchanged. The next required owner is `bubbles.implement` for Scope 05.
