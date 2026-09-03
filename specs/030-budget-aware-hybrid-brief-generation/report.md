# Feature 030 Execution Report

Links: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Scope: SCOPE-01 OpenAI-compatible shadow author adapter

### Summary

Scope status is In Progress. The four planned source modules, additive shadow
policy, Feature 030 selftest group, functional suite, and real-provider canary
suite now exist. The current Copilot worker and publication path remain
production-authoritative.

Six Test Plan rows pass on current source bytes. TP-01-01 is blocked by two
repository integration declarations outside the approved write boundary.
TP-01-04 reaches the real OMLX service and refuses when the selected model host
cannot admit the completion under its current memory ceiling. No model-quality,
promotion, publication, cost-reduction, completion, or certification claim is
made.

### Decision Record

- The first active scope is one provider-neutral OpenAI-compatible shadow
  adapter used by the approved OMLX and Ollama profiles.
- The current Copilot CLI worker and scheduler remain production-authoritative.
- New shadow output is non-authoritative and has no publication consumer.
- Real endpoint qualification proves transport compatibility only.

### Code Diff Evidence

Implementation changes are limited to the eight approved source and test paths:

- `rlbriefroute.js`
- `market-brief.config.json`
- `scripts/brief-openai-compatible-adapter.mjs`
- `scripts/brief-route-runtime.mjs`
- `scripts/brief-shadow-generate.mjs`
- `scripts/selftest.mjs`
- `tests/brief-openai-compatible-adapter.functional.mjs`
- `tests/brief-openai-compatible-adapter.local-canary.mjs`

The pre-edit protected-path SHA-256 inventory is retained in current-session
execution evidence. The final parity check remains required before handoff.

### Completion Statement

Scope 01 remains In Progress and is not certified. Passing Test Plan items may
carry implementation-owner evidence. The failed rows and repository integration
findings prevent a completion claim.

### Test Evidence

#### RED Proof

**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern "Regression: SCN-030-001" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 1
**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The complete current-session capture has 35 lines and SHA-256
`25461298cf1cf77d6a3e16bd1fd7529987891df8b8520eabe9f863f702e91c10`.
It reports `ERR_MODULE_NOT_FOUND` for the approved
`scripts/brief-route-runtime.mjs` path, with one failed test and no parser error.

**Result:** EXPECTED RED. The planned test parsed and failed because the approved
runtime module did not exist.

#### TP-01-01 Full Selftest

**Executed:** YES (current session)
**Command:** `node scripts/selftest.mjs`
**Exit Code:** 1
**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The seven Feature 030 pure assertions pass. Two existing
global inventory assertions fail on the new UMD file and canary filename.
**Captured result:** 3,985 lines, SHA-256
`cce1717eb12f49ee7ea6d8f2221432b03fbbc3c2de3679ca9a2b493de3103fe9`.
The generated compact capture reports `3472 passed, 2 failed` and names both
inventory failures.

**Result:** FAIL.

#### TP-01-02 SCN-030-001 Functional

**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern "Regression: SCN-030-001" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-02 final-source GREEN
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-001 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 0cb11743bfb21d6120f30e81ab3c819ab667ee8f92e52158fb0854abb327b8a2
--- output ---
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (180.565417ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 236.027375
```

**Result:** PASS.

#### TP-01-03 SCN-030-002 Functional

**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern "Regression: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-03 final-source GREEN
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-002 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: bc26ced53200891a3902a7f903427864a61061f4e22152b850dbfc2b45432ddf
--- output ---
✔ Regression: SCN-030-002 exact model preflight precedes one bounded strict JSON completion (437.74475ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 494.296
```

**Result:** PASS.

#### TP-01-04 Real OMLX Canary

**Executed:** YES (current session)
**Command:** `BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 node --test --test-name-pattern "Regression E2E: SCN-030-002 OMLX" tests/brief-openai-compatible-adapter.local-canary.mjs`
**Exit Code:** 1
**Phase:** implement
**Claim Source:** executed
**Interpretation:** Exact model discovery succeeds. The real chat request receives
a host-capacity HTTP refusal and the adapter returns `B030-ROUTE-UNAVAILABLE`
without switching providers.
**Captured result:** 30 lines, SHA-256
`0c75530a2e384c194bd1b936603abb44522e99b55b85abaf0dc4d1eb5c9a284b`.
The complete capture reports one failed test with the closed code
`B030-ROUTE-UNAVAILABLE`, reason `http-status`, and field `chat`.

**Result:** FAIL.

#### TP-01-05 Real Ollama Canary

**Executed:** YES (current session)
**Command:** `BRIEF_SHADOW_PROFILE=ollama-openai-compatible node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/brief-openai-compatible-adapter.local-canary.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-05 final Ollama canary
$ /usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern Regression E2E: SCN-030-002 Ollama tests/brief-openai-compatible-adapter.local-canary.mjs
exit: 0
lines: 9
sha256: d96ab5df48c3bfa270d9c9d5707f6dfa45fae387a0591ef427a69a84eaeb2dee
--- output ---
✔ Regression E2E: SCN-030-002 Ollama returns tiny strict JSON with truthful usage state (1110.073083ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 1149.518459
```

**Result:** PASS.

#### TP-01-06 SCN-030-002 Stress

**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern "Stress: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-06 final-source GREEN
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern Stress: SCN-030-002 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: cf09440aa7f2fe72dd6cbdfe1eab08c456c32c7a21c69fd3a09abef54f696c20
--- output ---
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5021.511708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5075.089875
```

**Result:** PASS.

#### TP-01-07 SCN-030-003 Authority Containment

**Executed:** YES (current session)
**Command:** `node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-07 final-source GREEN
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-003 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: b92e168a7bfe63acacfe331065301b49c3cb6ca0527a69250efa51ff5dbb093f
--- output ---
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (350.019208ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 405.91275
```

**Result:** PASS.

#### TP-01-08 Existing Payload Contract

**Executed:** YES (current session)
**Command:** `node scripts/validate-brief-payload.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 TP-01-08 unchanged public payload validator
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node scripts/validate-brief-payload.mjs
exit: 0
lines: 7
sha256: d7fedfd61fc5b8dd602c92410282de4c6438442aacff9cbf5c9e07b0a795fc98
--- output ---
[brief-contract] company owner-read names its producing adapter and states that no recommendation is produced: PASS
[brief-contract] every evidence timestamp is at or before the declared window cutoff: PASS
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

**Result:** PASS.

#### Complete Functional File

**Executed:** YES (current session)
**Command:** `node --test tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Phase:** implement
**Claim Source:** executed
**Output:**

```text
# Feature 030 complete functional file final-source pass
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 210 /opt/homebrew/bin/node --test tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 12
sha256: e05231e252befec15e59441d1621023011cec7e4e5864860b6e5e151fba0840b
--- output ---
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (191.325417ms)
✔ Regression: SCN-030-002 exact model preflight precedes one bounded strict JSON completion (504.861417ms)
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5011.304458ms)
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (336.85325ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6102.512167
```

**Result:** PASS.

### Validation Evidence

**Executed:** NO
**Command:** None for implementation validation
**Phase Agent:** bubbles.validate
**Claim Source:** not-run

No implementation validation evidence is recorded.

### Audit Evidence

**Executed:** NO
**Command:** None
**Phase Agent:** bubbles.audit
**Claim Source:** not-run

No audit verdict is recorded.

### Chaos Evidence

**Executed:** NO
**Command:** None
**Phase Agent:** bubbles.chaos
**Claim Source:** not-run

No chaos result is recorded.

### Uncertainty Declarations

- `F030-IMPLEMENT-OMLX-CAPACITY`: TP-01-04 reached the actual OMLX model list
  and chat endpoint. The chat request was refused by the model host under its
  current dynamic memory ceiling. The row remains unchecked. Resolution requires
  enough host capacity to admit the committed model, followed by the same exact
  canary command.
- `F030-PLAN-PAGES-EXCLUSION`: the repository selftest requires an unconsumed
  root UMD module to be listed in `site-exclusions.json`. That file is not in the
  approved Scope 01 write boundary. TP-01-01 remains failed until the planning
  owner either authorizes that declaration or changes the approved module
  placement without weakening the no-production-consumer rule.
- `F030-PLAN-CANARY-REACHABILITY`: the repository reachability guard reports
  `tests/brief-openai-compatible-adapter.local-canary.mjs` as a new orphan. Exact
  file commands intentionally do not satisfy its glob contract, and no approved
  path owns an active selecting glob. TP-01-01 remains failed until the planning
  owner records an authorized runner declaration or an approved filename that
  matches an active glob.

### Scenario Contract Evidence

[scenario-manifest.json](scenario-manifest.json) records three scenario
contracts. Implementation-owned test links and current report evidence refs are
updated while each scenario remains `in_progress`.

### Coverage Report

The functional file executes all three scenarios and passes four tests. The
real Ollama dependency path passes. The required real OMLX dependency path does
not pass under current host capacity, so complete scenario proof is absent.

### Lint And Quality

Current-session checks:

- Node source lock: PASS, capture SHA-256
  `e9bb9b552e92cd5b05328a34448e33d4bcc2b39dfe4f5ae0e430911374c711b1`.
- Regression quality guard: PASS with 0 violations and 0 warnings, capture
  SHA-256 `1312e5df6ecead6fe92c9979cff4d6dfebcbaf224dee999ad1b8b4a6c39a12c4`.
- Environment-pollution scan: PASS, capture SHA-256
  `935699c5a0a653f9335fa685d89080c1dddd0b94c93dea63fffa4c5d99971c61`.
- Implementation reality scan: exit 0 with one discovery warning. It resolved
  two files through the design fallback, so direct all-path checks remain part
  of final validation. Capture SHA-256
  `0320d87cd3ef4060d46ed6877350a344a3a1386a00eb12b1aadaac7a78a82146`.
- Strict work-boundary classification: PASS for all ten current dirty paths,
  capture SHA-256
  `5269a9643258ed1695c3e76617d844c5494ab0cec2d88ab17733670ab9c858c3`.
- Editor diagnostics: 0 errors across all eight implementation paths.

### Validation Summary

Implementation-owner validation is partial. Six Test Plan rows and the complete
functional file pass. TP-01-01 and TP-01-04 fail for the recorded reasons.
Scope 01 remains In Progress. Certification fields remain unchanged.

### Audit Verdict

No audit verdict exists.
