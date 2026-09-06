# Feature 030 Execution Report

Links: [scopes.md](scopes.md) | [uservalidation.md](uservalidation.md)

## Scope: SCOPE-01 OpenAI-compatible shadow author adapter

### Summary

Scope status is In Progress. The four planned source modules, additive shadow
policy, Feature 030 selftest group, functional suite, and real-provider canary
suite now exist. The current Copilot worker and publication path remain
production-authoritative.

An earlier independent test-owner invocation passed all eight Test Plan rows.
A later implementation-owner invocation recorded seven passing rows and one
TP-01-05 deadline refusal. Both historical captures remain below.

This resumed implementation reconciliation reran TP-01-05 against the exact
configured Ollama model. The model was cold before the run. The canary passed
in 88.3 seconds under the committed 120-second adapter deadline. A finite
removal-path probe then proved that unselecting the shadow profile leaves the
Copilot production graph unchanged. The focused protected-boundary comparison
also matched the pre-canary repository and external scheduler baselines.

The protected production files, public payload, public history, current pointer,
package manifests, scheduler state, and Git index were hashed before the live
canary. Every protected repository digest, Git status, Git index digest, and
Git index tree matched afterward. The external scheduler status and
acknowledgment also matched their pre-canary baseline. No endpoint value or
model-server setting is recorded in this report. No model-quality, promotion,
publication, cost-reduction, scope completion, validation, audit, chaos,
documentation, or certification claim is made.
Planner-owned Test Plan status and hash metadata and scenario-manifest stage text
remain unchanged and require reconciliation by `bubbles.plan`.

### Decision Record

- The first active scope is one provider-neutral OpenAI-compatible shadow
  adapter used by the approved OMLX and Ollama profiles.
- The current Copilot CLI worker and scheduler remain production-authoritative.
- New shadow output is non-authoritative and has no publication consumer.
- Real endpoint qualification proves transport compatibility only.

### Code Diff Evidence

Implementation and test changes are limited to the nine approved source and test
paths:

- `rlbriefroute.js`
- `market-brief.config.json`
- `site-exclusions.json`
- `scripts/brief-openai-compatible-adapter.mjs`
- `scripts/brief-route-runtime.mjs`
- `scripts/brief-shadow-generate.mjs`
- `scripts/selftest.mjs`
- `tests/brief-openai-compatible-adapter.functional.mjs`
- `tests/brief-openai-compatible-adapter.local-canary.mjs`

The test owner changed only `scripts/selftest.mjs` and
`tests/brief-openai-compatible-adapter.functional.mjs` to close missing dynamic
schema matrix coverage. The protected-path SHA-256 inventory is recorded below.

### Completion Statement

Scope 01 remains In Progress and is not certified. The test phase is independently
verified, but this report does not promote scope status or substitute for the
remaining owner-specific workflow phases.

### Test Evidence

The implementation-phase RED and failed captures below are retained as historical
evidence. The current test verdict is recorded under the `Current Test Phase`
headings later in this section.

#### DOD-01-TP-01-01 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 960 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-01 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 900 /opt/homebrew/bin/node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-01 implementation reconciliation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 900 /opt/homebrew/bin/node scripts/selftest.mjs
exit: 0
lines: 3986
sha256: 1bb8ac0b45fee90ab78df6cdec78bd79e801bb16075fe2dfd028129b1dc5f7aa
--- first 40 ---
Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
  ✓ CSP keeps the single-file inline-script design while defaulting to self
--- omitted 3906 line(s); sha256 above covers the full output ---
--- last 40 ---
Feature 030 Scope 01 - shadow policy transport contract authority and receipts
  ✓ Feature 030 policy declares exactly the two approved shadow profiles and no alias or production adapter
  ✓ Feature 030 resolves each exact profile to its declared provider and model while both share one transport contract
  ✓ Feature 030 builds the dynamic strict three-key response schema and standard no-reasoning request for every request contract through both profiles
  ✓ Feature 030 refuses missing unknown and incomplete profile selection with closed codes instead of defaults
  ✓ Feature 030 commits every exact finite limit and refuses policy missing any one instead of supplying a code fallback
  ✓ Feature 030 validates the one provider-neutral local capability and refuses a route-class substitution
  ✓ Feature 030 normalizes present token integers, preserves absent usage as unmeasured without zero, and rejects inconsistent totals
  ✓ Feature 030 commits binding names rather than endpoint or credential values and rejects credential or query-bearing URLs
================================================
Research-Lab self-test: 3475 passed, 0 failed
================================================
```

**Result:** PASS.

#### DOD-01-TP-01-02 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-02 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern 'Regression: SCN-030-001' tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-02 implementation reconciliation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-001 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 76b6e3c64215dc99787d70948cc38ae4fdf6b8569a16eb5f925ad6c9ab5181ac
--- output ---
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (184.326ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 239.502833
```

**Result:** PASS.

#### DOD-01-TP-01-03 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-03 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern 'Regression: SCN-030-002' tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-03 implementation reconciliation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-002 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 189ac33ed9d44cf628528fb11afc9e82e8099848b5ed2446faab0f3669b6781f
--- output ---
✔ Regression: SCN-030-002 exact model preflight precedes one bounded dynamic-schema completion (941.820084ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 994.1775
```

**Result:** PASS.

#### DOD-01-TP-01-04 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/usr/bin/env BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 300 /opt/homebrew/bin/node --test --test-name-pattern 'Regression E2E: SCN-030-002 OMLX' tests/brief-openai-compatible-adapter.local-canary.mjs`
**Runtime Binding:** `BRIEF_OMLX_BASE_URL` was supplied only to the command process; its value is not persisted.
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-04 real OMLX implementation reconciliation
$ /usr/bin/env BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 300 /opt/homebrew/bin/node --test --test-name-pattern Regression E2E: SCN-030-002 OMLX tests/brief-openai-compatible-adapter.local-canary.mjs
exit: 0
lines: 9
sha256: fd246d5793c77c423c11076d7c8e63e8da587be4d738d62bbaab5cddc4211f18
--- output ---
✔ Regression E2E: SCN-030-002 OMLX returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state (62329.569958ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62390.312792
```

**Result:** PASS.

#### DOD-01-TP-01-05 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test --test-name-pattern 'Regression E2E: SCN-030-002 Ollama' tests/brief-openai-compatible-adapter.local-canary.mjs`
**Runtime Bindings:** `BRIEF_OLLAMA_BASE_URL` and `BRIEF_OLLAMA_MODEL` were supplied only to the command process; their values are not persisted.
**Precondition:** Tailscale reported `TAILSCALE_BACKEND_STATE=Running` immediately before the canary.
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
TAILSCALE_BACKEND_STATE=Running
# Feature 030 DOD-01-TP-01-05 real Ollama implementation reconciliation
$ /usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test --test-name-pattern Regression E2E: SCN-030-002 Ollama tests/brief-openai-compatible-adapter.local-canary.mjs
exit: 1
lines: 29
sha256: 0fa1c25d9ec7223c1ea76a5a3dbd9e84599ab300e53053077884b6e70cdec014
--- output ---
✖ Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state (120262.674125ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 120306.963709
AssertionError [ERR_ASSERTION]: {"contractVersion":"brief-shadow-refusal/v1","authoritative":false,"error":{"contractVersion":"brief-shadow-error/v1","code":"B030-ROUTE-UNAVAILABLE","reason":"deadline-exceeded","field":"chat"}}
```

**Result:** FAIL. The selected endpoint did not return the required chat result within the committed deadline. No provider switch occurred.

#### DOD-01-TP-01-06 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 210 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-06 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern 'Stress: SCN-030-002' tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-06 implementation reconciliation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern Stress: SCN-030-002 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 107e0e422851d7a8dc67c16e3dc57b849c68fd771a274726b9207a98fd2576b5
--- output ---
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5023.413708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5080.419959
```

**Result:** PASS.

#### DOD-01-TP-01-07 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-07 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern 'Regression: SCN-030-003' tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-07 implementation reconciliation
$ /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern Regression: SCN-030-003 tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
lines: 9
sha256: 9a7395b3083975d702bd1fe386eadcddc7e9cc6fc5be503732f9d9586dc8ab31
--- output ---
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (363.530334ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 423.224416
```

**Result:** PASS.

#### DOD-01-TP-01-08 Current Implementation Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 DOD-01-TP-01-08 implementation reconciliation' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node scripts/validate-brief-payload.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 DOD-01-TP-01-08 implementation reconciliation
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

#### Core Brief Author Process Contract

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 210 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 core brief-author process contract' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /bin/zsh -f -c 'set -eu; GIT=/opt/local/bin/git; GREP=/usr/bin/grep; $GIT diff --quiet -- scripts/brief-author.mjs; print BRIEF_AUTHOR_WORKTREE_DELTA=NONE; $GREP -nF "spawn(settings.command, settings.args, { shell: false" scripts/brief-author.mjs; print BRIEF_AUTHOR_SHELL_FALSE=FOUND; $GREP -nF "from '\''./brief-author.mjs'\''" scripts/brief-route-runtime.mjs; print SHADOW_RUNTIME_BRIEF_AUTHOR_IMPORT=FOUND; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 core brief-author process contract
exit: 0
lines: 14
sha256: a1987309c90957ce5f3f414e7e48c3d8b5906a9b8e7f1c6c1d6c3583785d09b5
--- output ---
BRIEF_AUTHOR_WORKTREE_DELTA=NONE
315:      child = spawn(settings.command, settings.args, { shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
BRIEF_AUTHOR_SHELL_FALSE=FOUND
6:import { invokeAuthor, validateAuthorEnvelope } from './brief-author.mjs';
SHADOW_RUNTIME_BRIEF_AUTHOR_IMPORT=FOUND
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (358.453083ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 411.666209
```

**Result:** PASS.

#### Core Powerless Shadow CLI

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 210 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 core powerless shadow CLI' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /bin/zsh -f -c 'set -eu; GREP=/usr/bin/grep; $GREP -nF "if (process.argv.length !== 2)" scripts/brief-shadow-generate.mjs; print SHADOW_CLI_ARGUMENT_SURFACE=CLOSED; $GREP -nF "authoritative: false" scripts/brief-shadow-generate.mjs; print SHADOW_CLI_AUTHORITY=FALSE; if forbidden=$($GREP -nE "writeFile|appendFile|unlink|rmSync|exec\\(|execSync|git[[:space:]]" scripts/brief-shadow-generate.mjs); then print -u2 -r -- "$forbidden"; exit 1; else grep_exit=$?; [[ "$grep_exit" -eq 1 ]]; fi; print SHADOW_CLI_WRITE_EXEC_GIT_MATCHES=0; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 core powerless shadow CLI
exit: 0
lines: 14
sha256: a021f196b2744a1317c53b7ef89a95228038b83f146a4e60df4db54fffab3520
--- output ---
38:  if (process.argv.length !== 2) {
SHADOW_CLI_ARGUMENT_SURFACE=CLOSED
14:    authoritative: false,
SHADOW_CLI_AUTHORITY=FALSE
SHADOW_CLI_WRITE_EXEC_GIT_MATCHES=0
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (347.92575ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 404.601917
```

**Result:** PASS.

#### Core Consumer Impact Sweep

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 consumer impact sweep' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /bin/zsh -f -c 'set -eu; GREP=/usr/bin/grep; pattern="brief-route-runtime|brief-openai-compatible-adapter|brief-shadow-generate|rlbriefroute|BRIEF_SHADOW_PROFILE|BRIEF_OMLX_BASE_URL|BRIEF_OLLAMA_BASE_URL|BRIEF_OLLAMA_MODEL"; production_paths=(scripts/brief-refresh.mjs scripts/brief-narrative-parallel.mjs scripts/brief-refresh-and-push.sh scripts/brief-refresh-scheduled.sh scripts/validate-brief-payload.mjs); for production_path in "${production_paths[@]}"; do if leaks=$($GREP -nE "$pattern" "$production_path"); then print -u2 -r -- "$leaks"; exit 1; else grep_exit=$?; [[ "$grep_exit" -eq 1 ]]; fi; print -r -- "PRODUCTION_SHADOW_REFERENCES=0|path=$production_path"; done; $GREP -nF "from '\''./brief-route-runtime.mjs'\''" scripts/brief-shadow-generate.mjs; print SHADOW_CLI_RUNTIME_IMPORT=FOUND; $GREP -nF "brief-openai-compatible-adapter.mjs" scripts/brief-route-runtime.mjs; print SHADOW_RUNTIME_ADAPTER_IMPORT=FOUND; print CONSUMER_IMPACT_SWEEP=PASS'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 consumer impact sweep
exit: 0
lines: 10
sha256: cc72f2d2fc302eb71312e51cbc30ec8d9357b49453d1ec20e9c0f3ef07ad150f
--- output ---
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-narrative-parallel.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-and-push.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-scheduled.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/validate-brief-payload.mjs
2:import { runShadowAuthor, resolveShadowRuntimeProfile } from './brief-route-runtime.mjs';
SHADOW_CLI_RUNTIME_IMPORT=FOUND
12:const ADAPTER_PATH = join(HERE, 'brief-openai-compatible-adapter.mjs');
SHADOW_RUNTIME_ADAPTER_IMPORT=FOUND
CONSUMER_IMPACT_SWEEP=PASS
```

**Result:** PASS.

#### Core Site Exclusion Additive Boundary

**Phase:** implement
**Executed:** YES (current invocation)
**Command:**

```sh
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 site exclusion additive boundary' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 60 /bin/zsh -f -c '
set -eu
GIT=/opt/local/bin/git
JQ=$(command -v jq)
numstat=$($GIT diff --numstat -- site-exclusions.json)
print -r -- "SITE_EXCLUSIONS_NUMSTAT=$numstat"
[[ "$numstat" == $'4\t0\tsite-exclusions.json' ]]
before=$($GIT show HEAD:site-exclusions.json)
after=$(/bin/cat site-exclusions.json)
"$JQ" -en --argjson before "$before" --argjson after "$after" '"'"'
  ($after.contractVersion == $before.contractVersion)
  and ($after.note == $before.note)
  and (($after.files | length) == (($before.files | length) + 1))
  and ($after.files[0:($before.files | length)] == $before.files)
  and ($after.files[-1] == {
    path: "rlbriefroute.js",
    reason: "Feature 030 Node/shadow-only route contract with no public runtime consumer. It must leave exclusions only when a future approved production consumer ships."
  })
'"'"'
print SITE_EXCLUSIONS_PRIOR_ENTRIES=IDENTICAL
print SITE_EXCLUSIONS_AUTHORIZED_APPEND=PASS
'
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 site exclusion additive boundary
exit: 0
lines: 4
sha256: afb18269a81ddcd15ac63b42087b7431a27ab9942dfb306ff9aec9c0c3f1f458
--- output ---
SITE_EXCLUSIONS_NUMSTAT=4       0       site-exclusions.json
true
SITE_EXCLUSIONS_PRIOR_ENTRIES=IDENTICAL
SITE_EXCLUSIONS_AUTHORIZED_APPEND=PASS
```

**Result:** PASS.

#### Persistent Scenario Regression Coverage

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 300 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 persistent scenario regression coverage' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 270 /bin/zsh -f -c 'set -eu; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 210 /opt/homebrew/bin/node --test tests/brief-openai-compatible-adapter.functional.mjs; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /opt/homebrew/bin/bash .github/bubbles/scripts/scenario-test-resolve.sh specs/030-budget-aware-hybrid-brief-generation; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /opt/homebrew/bin/bash .github/bubbles/scripts/regression-quality-guard.sh tests/brief-openai-compatible-adapter.functional.mjs tests/brief-openai-compatible-adapter.local-canary.mjs'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 persistent scenario regression coverage
exit: 0
lines: 27
sha256: 0168839a88d9f9cfb2fdb82c8665ff6009edac1ad76d2b126c6690437463c920
--- output ---
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (187.894167ms)
✔ Regression: SCN-030-002 exact model preflight precedes one bounded dynamic-schema completion (906.830333ms)
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5011.304917ms)
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (345.275625ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6504.773042
[scenario-test-resolve] OK — 12 reference(s) resolved via literal-scan; 11 category comparison(s) not applicable (no test-discovery adapter declared)
============================================================
  BUBBLES REGRESSION QUALITY GUARD
  Bugfix mode: false
============================================================
ℹ️  Scanning tests/brief-openai-compatible-adapter.functional.mjs
ℹ️  Scanning tests/brief-openai-compatible-adapter.local-canary.mjs
============================================================
  REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
  Files scanned: 2
============================================================
```

**Result:** PASS.

#### Full Regression And Disabled-Test Scan

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 960 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 full regression and disabled-test scan' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 900 /bin/zsh -f -c 'set -eu; GREP=/usr/bin/grep; files=(scripts/selftest.mjs tests/brief-openai-compatible-adapter.functional.mjs tests/brief-openai-compatible-adapter.local-canary.mjs); if disabled=$($GREP -nE "(test|it|describe)\\.(skip|only)[[:space:]]*\\(|\\.todo[[:space:]]*\\(" "${files[@]}"); then print -u2 -r -- "$disabled"; exit 1; else grep_exit=$?; [[ "$grep_exit" -eq 1 ]]; fi; print FEATURE030_DISABLED_TEST_MARKERS=0; /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 840 /opt/homebrew/bin/node scripts/selftest.mjs'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 full regression and disabled-test scan
exit: 0
lines: 3987
sha256: 5e59a301731d3e5e9d21e30cfdce07509f304299d58a08abc7cbf0ef55ddec24
--- first 40 ---
FEATURE030_DISABLED_TEST_MARKERS=0
Step 1 security — escaped model sinks and CSP on every page
  ✓ every shipped HTML page carries a Content-Security-Policy meta
  ✓ all pages use one identical CSP instead of drifting per page
--- omitted 3907 line(s); sha256 above covers the full output ---
--- last 40 ---
Feature 030 Scope 01 - shadow policy transport contract authority and receipts
  ✓ Feature 030 policy declares exactly the two approved shadow profiles and no alias or production adapter
  ✓ Feature 030 resolves each exact profile to its declared provider and model while both share one transport contract
  ✓ Feature 030 builds the dynamic strict three-key response schema and standard no-reasoning request for every request contract through both profiles
  ✓ Feature 030 refuses missing unknown and incomplete profile selection with closed codes instead of defaults
  ✓ Feature 030 commits every exact finite limit and refuses policy missing any one instead of supplying a code fallback
  ✓ Feature 030 validates the one provider-neutral local capability and refuses a route-class substitution
  ✓ Feature 030 normalizes present token integers, preserves absent usage as unmeasured without zero, and rejects inconsistent totals
  ✓ Feature 030 commits binding names rather than endpoint or credential values and rejects credential or query-bearing URLs
================================================
Research-Lab self-test: 3475 passed, 0 failed
================================================
```

**Result:** PASS.

#### Eight-Row Finite Evidence Audit

**Phase:** implement
**Executed:** YES (current invocation)
**Command:**

```sh
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 eight-row finite evidence audit' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 60 /usr/bin/perl -0777 -e '
use strict;
use warnings;
my $path = shift;
open my $fh, "<", $path or die "$path: $!\n";
local $/;
my $text = <$fh>;
for my $number (1 .. 8) {
  my $id = sprintf("TP-01-%02d", $number);
  $text =~ /^#### DOD-01-$id Current Implementation Reconciliation\n(.*?)(?=^#### |\z)/ms or die "$id current block missing\n";
  my $block = $1;
  $block =~ /\*\*Command:\*\*.*gtimeout/s or die "$id finite command missing\n";
  $block =~ /\*\*Claim Source:\*\* executed/ or die "$id executed provenance missing\n";
  $block =~ /\*\*Exit Code:\*\* ([01])/ or die "$id exit missing\n";
  my $exit = $1;
  $block =~ /\*\*Output:\*\*/ or die "$id output missing\n";
  $block =~ /sha256: [0-9a-f]{64}/ or die "$id capture hash missing\n";
  my $expected = $number == 5 ? 1 : 0;
  die "$id exit $exit expected $expected\n" unless $exit == $expected;
  print "$id|finite=true|output=complete-or-bounded|exit=$exit|hash=present\n";
}
print "FEATURE030_TEST_PLAN_COMMAND_RECORDS=8\n";
' specs/030-budget-aware-hybrid-brief-generation/report.md
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 eight-row finite evidence audit
exit: 0
lines: 9
sha256: 9fae3d6884df39fbad755175e585d10a45a735660e76633a072fb0c733074275
--- output ---
TP-01-01|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-02|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-03|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-04|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-05|finite=true|output=complete-or-bounded|exit=1|hash=present
TP-01-06|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-07|finite=true|output=complete-or-bounded|exit=0|hash=present
TP-01-08|finite=true|output=complete-or-bounded|exit=0|hash=present
FEATURE030_TEST_PLAN_COMMAND_RECORDS=8
```

**Result:** PASS for finite execution and evidence accounting. TP-01-05 remains a separate failed test outcome.

#### Static Secret Authority Consumer Boundary

**Phase:** implement
**Executed:** YES (current invocation)
**Command:**

```sh
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 static secret authority consumer boundary' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /bin/zsh -f -c '
set -eu
GREP=/usr/bin/grep
JQ=$(command -v jq)
assert_no_match() {
  local pattern="$1"
  shift
  if matches=$($GREP -nE "$pattern" "$@"); then
    print -u2 -r -- "$matches"
    exit 1
  else
    local grep_exit=$?
    [[ "$grep_exit" -eq 1 ]]
  fi
}
"$JQ" -e '"'"'[."brief-generation-shadow/v1" | paths(scalars) as $path | $path[-1] | select(type == "string" and test("authorization|cookie|credential|api[-_]?key|password|passphrase|secret|bearer"; "i"))] | length == 0'"'"' market-brief.config.json
print SHADOW_POLICY_SECRET_SHAPED_KEYS=0
"$JQ" -e '"'"'[."brief-generation-shadow/v1" | .. | strings | select(test("^https?://"; "i"))] | length == 0'"'"' market-brief.config.json
print SHADOW_POLICY_COMMITTED_ENDPOINT_VALUES=0
mutation_pattern="writeFile|appendFile|unlink|rmSync|renameSync|copyFile|exec\\(|execSync|spawnSync|git[[:space:]]"
for source_path in rlbriefroute.js scripts/brief-openai-compatible-adapter.mjs scripts/brief-route-runtime.mjs scripts/brief-shadow-generate.mjs; do
  assert_no_match "$mutation_pattern" "$source_path"
  print -r -- "SHADOW_MUTATION_API_MATCHES=0|path=$source_path"
done
assert_no_match "authorization[[:space:]]*:" scripts/brief-openai-compatible-adapter.mjs
print SHADOW_AUTHORIZATION_HEADER_MATCHES=0
consumer_pattern="brief-route-runtime|brief-openai-compatible-adapter|brief-shadow-generate|rlbriefroute|BRIEF_SHADOW_PROFILE|BRIEF_OMLX_BASE_URL|BRIEF_OLLAMA_BASE_URL|BRIEF_OLLAMA_MODEL"
for production_path in scripts/brief-refresh.mjs scripts/brief-narrative-parallel.mjs scripts/brief-refresh-and-push.sh scripts/brief-refresh-scheduled.sh scripts/validate-brief-payload.mjs; do
  assert_no_match "$consumer_pattern" "$production_path"
  print -r -- "PRODUCTION_SHADOW_REFERENCES=0|path=$production_path"
done
print STATIC_SECRET_AUTHORITY_CONSUMER_BOUNDARY=PASS
'
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 static secret authority consumer boundary
exit: 0
lines: 15
sha256: 378640f146262bc959636137e8503d01434f733b1f5b604f5b284df4fa5f0547
--- output ---
true
SHADOW_POLICY_SECRET_SHAPED_KEYS=0
true
SHADOW_POLICY_COMMITTED_ENDPOINT_VALUES=0
SHADOW_MUTATION_API_MATCHES=0|path=rlbriefroute.js
SHADOW_MUTATION_API_MATCHES=0|path=scripts/brief-openai-compatible-adapter.mjs
SHADOW_MUTATION_API_MATCHES=0|path=scripts/brief-route-runtime.mjs
SHADOW_MUTATION_API_MATCHES=0|path=scripts/brief-shadow-generate.mjs
SHADOW_AUTHORIZATION_HEADER_MATCHES=0
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-narrative-parallel.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-and-push.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-scheduled.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/validate-brief-payload.mjs
STATIC_SECRET_AUTHORITY_CONSUMER_BOUNDARY=PASS
```

**Result:** PASS.

#### Non-Authoritative Groundwork Claims

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 non-authoritative groundwork claims' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 60 /bin/zsh -f -c 'set -eu; GREP=/usr/bin/grep; JQ=$(command -v jq); $GREP -nF "Artifact status:** Planning only." specs/030-budget-aware-hybrid-brief-generation/design.md; print DESIGN_DELIVERY_CLAIM=ABSENT; $GREP -nF "S01-R10 Shadow-only CLI." specs/030-budget-aware-hybrid-brief-generation/scopes.md; print SCOPE_SHADOW_ONLY_DECLARATION=FOUND; $GREP -nF "Scope status is In Progress." specs/030-budget-aware-hybrid-brief-generation/report.md; print REPORT_SCOPE_STATUS=IN_PROGRESS; $GREP -nF "production-authoritative." specs/030-budget-aware-hybrid-brief-generation/report.md; print REPORT_PRODUCTION_AUTHORITY=PRESERVED; /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 30 /usr/bin/perl -0777 -e '\''my $path = shift; open my $fh, "<", $path or die "$path: $!\n"; local $/; my $text = <$fh>; die "Scope 01 completion claim found\n" if $text =~ /Scope 01\s+(?:is\s+)?(?:Done|Completed)/i; die "claim disclaimer missing\n" unless $text =~ /No endpoint value or model-server setting is recorded.*?No\s+model-quality, promotion, publication, cost-reduction, scope completion,\s+validation, audit, chaos, documentation, or certification claim is made\./s; print "REPORT_SCOPE01_COMPLETION_CLAIMS=0\nREPORT_FORBIDDEN_CLAIM_DISCLAIMER=FOUND\n";'\'' specs/030-budget-aware-hybrid-brief-generation/report.md; "$JQ" -e '\''[."brief-generation-shadow/v1" | paths as $path | $path[-1] | select(type == "string" and test("quality|saving|promotion|publication"; "i"))] | length == 0'\'' market-brief.config.json; print SHADOW_POLICY_PROMOTION_PUBLICATION_QUALITY_SAVINGS_KEYS=0; print NON_AUTHORITATIVE_GROUNDWORK_CLAIMS=PASS'`
**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 non-authoritative groundwork claims
exit: 0
lines: 14
sha256: 64d3a76f7c414211fc070bff277700e636fbadd098eaa3f31b6f56eb92a65e59
--- output ---
5:**Artifact status:** Planning only. This document claims no implementation,
DESIGN_DELIVERY_CLAIM=ABSENT
149:10. **S01-R10 Shadow-only CLI.** `scripts/brief-shadow-generate.mjs` requires a
SCOPE_SHADOW_ONLY_DECLARATION=FOUND
9:Scope status is In Progress. The four planned source modules, additive shadow
REPORT_SCOPE_STATUS=IN_PROGRESS
12:production-authoritative.
35:- The current Copilot CLI worker and scheduler remain production-authoritative.
REPORT_PRODUCTION_AUTHORITY=PRESERVED
REPORT_SCOPE01_COMPLETION_CLAIMS=0
REPORT_FORBIDDEN_CLAIM_DISCLAIMER=FOUND
true
SHADOW_POLICY_PROMOTION_PUBLICATION_QUALITY_SAVINGS_KEYS=0
NON_AUTHORITATIVE_GROUNDWORK_CLAIMS=PASS
```

**Result:** PASS.

#### Diff And Work-Boundary Classification

**Phase:** implement
**Executed:** YES (current invocation)
**Command:**

```sh
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 diff and work-boundary classification' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 90 /bin/zsh -f -c '
set -eu
GIT=/opt/local/bin/git
feature_count=0
baseline_unrelated_count=0
while IFS= read -r record || [[ -n "$record" ]]; do
  [[ -n "$record" ]] || continue
  path="${record[4,-1]}"
  [[ "$path" == *" -> "* ]] && path="${path##* -> }"
  case "$path" in
    specs/030-budget-aware-hybrid-brief-generation/*|rlbriefroute.js|market-brief.config.json|site-exclusions.json|scripts/brief-openai-compatible-adapter.mjs|scripts/brief-route-runtime.mjs|scripts/brief-shadow-generate.mjs|scripts/selftest.mjs|tests/brief-openai-compatible-adapter.functional.mjs|tests/brief-openai-compatible-adapter.local-canary.mjs)
      feature_count=$((feature_count + 1))
      print -r -- "FEATURE030_ALLOWED_CHANGE=${record[1,2]}|path=$path"
      ;;
    specs/_bugs/BUG-022-historical-report-declaration-leak/report.md|specs/_bugs/BUG-022-historical-report-declaration-leak/state.json)
      baseline_unrelated_count=$((baseline_unrelated_count + 1))
      print -r -- "PREEXISTING_BASELINE_CHANGE=${record[1,2]}|path=$path"
      ;;
    *)
      print -u2 -r -- "UNEXPECTED_CHANGE=${record[1,2]}|path=$path"
      exit 1
      ;;
  esac
done < <($GIT -c core.quotePath=false status --porcelain=v1 --untracked-files=all)
[[ "$feature_count" -gt 0 ]]
[[ "$baseline_unrelated_count" -eq 2 ]]
framework_status=$($GIT status --porcelain=v1 --untracked-files=all -- .github/bubbles .github/agents .github/prompts .github/instructions .github/skills)
[[ -z "$framework_status" ]]
print FRAMEWORK_MANAGED_STATUS=EMPTY
$GIT diff --check -- specs/030-budget-aware-hybrid-brief-generation rlbriefroute.js market-brief.config.json site-exclusions.json scripts/brief-openai-compatible-adapter.mjs scripts/brief-route-runtime.mjs scripts/brief-shadow-generate.mjs scripts/selftest.mjs tests/brief-openai-compatible-adapter.functional.mjs tests/brief-openai-compatible-adapter.local-canary.mjs
print GIT_DIFF_CHECK=PASS
print -r -- "WORK_BOUNDARY_CLASSIFICATION=PASS|feature030=$feature_count|preexisting_unrelated=$baseline_unrelated_count|unexpected=0"
'
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 diff and work-boundary classification
exit: 0
lines: 15
sha256: 0d0d0dcf007012f83c98341c826a78eec65f5542345cc574b8cb395b05e1cf56
--- output ---
FEATURE030_ALLOWED_CHANGE= M|path=scripts/brief-openai-compatible-adapter.mjs
FEATURE030_ALLOWED_CHANGE= M|path=scripts/selftest.mjs
FEATURE030_ALLOWED_CHANGE= M|path=site-exclusions.json
FEATURE030_ALLOWED_CHANGE= M|path=specs/030-budget-aware-hybrid-brief-generation/report.md
FEATURE030_ALLOWED_CHANGE= M|path=specs/030-budget-aware-hybrid-brief-generation/scenario-manifest.json
FEATURE030_ALLOWED_CHANGE= M|path=specs/030-budget-aware-hybrid-brief-generation/scopes.md
FEATURE030_ALLOWED_CHANGE= M|path=specs/030-budget-aware-hybrid-brief-generation/state.json
FEATURE030_ALLOWED_CHANGE= M|path=specs/030-budget-aware-hybrid-brief-generation/test-plan.json
PREEXISTING_BASELINE_CHANGE= M|path=specs/_bugs/BUG-022-historical-report-declaration-leak/report.md
PREEXISTING_BASELINE_CHANGE= M|path=specs/_bugs/BUG-022-historical-report-declaration-leak/state.json
FEATURE030_ALLOWED_CHANGE= M|path=tests/brief-openai-compatible-adapter.functional.mjs
FEATURE030_ALLOWED_CHANGE= M|path=tests/brief-openai-compatible-adapter.local-canary.mjs
FRAMEWORK_MANAGED_STATUS=EMPTY
GIT_DIFF_CHECK=PASS
WORK_BOUNDARY_CLASSIFICATION=PASS|feature030=10|preexisting_unrelated=2|unexpected=0
```

**Result:** PASS.

#### Named Governance Gates

**Phase:** implement
**Executed:** YES (current invocation)
**Command:**

```sh
/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 480 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 named governance gates' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=10s 420 /bin/zsh -f -c '
set -eu
spec=specs/030-budget-aware-hybrid-brief-generation
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/bash .github/bubbles/scripts/artifact-lint.sh "$spec"
artifact_lint=PASS
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/scenario-obligation-lint.sh "$spec"
scenario_obligations=PASS
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/test-mechanism-lint.sh "$spec" --repo-root "$PWD"
test_mechanisms=PASS
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 120 /opt/homebrew/bin/bash .github/bubbles/scripts/scenario-test-resolve.sh "$spec" --repo-root "$PWD"
scenario_resolution=PASS
/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/bash .github/bubbles/scripts/traceability-guard.sh "$spec" --all-scopes
traceability_parity=PASS
print -r -- "ARTIFACT_LINT=$artifact_lint"
print -r -- "SCENARIO_OBLIGATIONS=$scenario_obligations"
print -r -- "TEST_MECHANISMS=$test_mechanisms"
print -r -- "EXACT_SCENARIO_RESOLUTION=$scenario_resolution"
print -r -- "TRACEABILITY_TEST_PLAN_PARITY=$traceability_parity"
print FEATURE030_NAMED_GOVERNANCE_GATES=PASS
'
```

**Exit Code:** 0
**Claim Source:** executed
**Output:**

```text
# Feature 030 named governance gates
exit: 0
lines: 107
sha256: e028f105f0cbd0809478cf4c28b5f6921c9e8f138bd33514fa2f312967cb6751
--- first 40 ---
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ All checked DoD items in scopes.md have evidence blocks
Artifact lint PASSED.
--- omitted 27 line(s); sha256 above covers the full output ---
--- last 40 ---
ℹ️  DoD fidelity: 3 scenarios checked, 3 mapped to DoD, 0 unmapped
--- Traceability Summary ---
ℹ️  Scenarios checked: 3
ℹ️  Test rows checked: 13
ℹ️  Scenario-to-row mappings: 3
ℹ️  Concrete test file references: 3
ℹ️  Report evidence references: 3
ℹ️  DoD fidelity scenarios: 3 (mapped: 3, unmapped: 0)
ℹ️  Edge confidence (IMP-015 Scope B): declared=6 inferred=0 ambiguous=0
RESULT: PASSED (0 warnings)
ARTIFACT_LINT=PASS
SCENARIO_OBLIGATIONS=PASS
TEST_MECHANISMS=PASS
EXACT_SCENARIO_RESOLUTION=PASS
TRACEABILITY_TEST_PLAN_PARITY=PASS
FEATURE030_NAMED_GOVERNANCE_GATES=PASS
```

**Result:** PASS.

#### Protected Scheduler Boundary Mismatch

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 60 /opt/homebrew/bin/bash .github/bubbles/scripts/evidence-capture.sh --lines 40 --label 'Feature 030 scheduler boundary mismatch' -- /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 30 /bin/zsh -f -c 'set -u; GIT=/opt/local/bin/git; SHASUM=/usr/bin/shasum; pre=44312f804115714bf2449bdb80430522efd641904ee41a0cbba5f79c09964300; scheduler_rel=$($GIT rev-parse --git-path brief-scheduler.status) || exit $?; case "$scheduler_rel" in /*) scheduler_path="$scheduler_rel" ;; *) scheduler_path="$PWD/$scheduler_rel" ;; esac; hash_line=$($SHASUM -a 256 "$scheduler_path") || exit $?; current=${hash_line%% *}; print -r -- "SCHEDULER_PRE_SHA256=$pre"; print -r -- "SCHEDULER_CURRENT_SHA256=$current"; if [[ "$current" == "$pre" ]]; then print SCHEDULER_BOUNDARY_MATCH=true; exit 0; fi; print SCHEDULER_BOUNDARY_MATCH=false; exit 1'`
**Exit Code:** 1
**Claim Source:** executed
**Output:**

```text
# Feature 030 scheduler boundary mismatch
exit: 1
lines: 3
sha256: 0b4e0b2f580cbca8fa783155857b5b51f184781d576099ffb3dc4ad70ad25d89
--- output ---
SCHEDULER_PRE_SHA256=44312f804115714bf2449bdb80430522efd641904ee41a0cbba5f79c09964300
SCHEDULER_CURRENT_SHA256=e2ca445b813db19416dd07182b4cff973895aec54d4cafafa6df0d4567776508
SCHEDULER_BOUNDARY_MATCH=false
```

**Result:** FAIL. The twelve protected repository files matched their pre-run digests, the publish acknowledgment and Git index matched, but the scheduler status file changed during this invocation. No restore was attempted.

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

#### TP-01-01 Current Test Phase

**Phase:** test
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 900 /opt/homebrew/bin/node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 3,986 lines; SHA-256 `94a8bb347382f10192e9b10ed9dc41f043384d9ccade46ad32a934bdc5091ea9`

```text
Feature 030 Scope 01 - shadow policy transport contract authority and receipts
  ✓ Feature 030 policy declares exactly the two approved shadow profiles and no alias or production adapter
  ✓ Feature 030 resolves each exact profile to its declared provider and model while both share one transport contract
  ✓ Feature 030 builds the dynamic strict three-key response schema and standard no-reasoning request for every request contract through both profiles
  ✓ Feature 030 refuses missing unknown and incomplete profile selection with closed codes instead of defaults
  ✓ Feature 030 commits every exact finite limit and refuses policy missing any one instead of supplying a code fallback
  ✓ Feature 030 validates the one provider-neutral local capability and refuses a route-class substitution
  ✓ Feature 030 normalizes present token integers, preserves absent usage as unmeasured without zero, and rejects inconsistent totals
  ✓ Feature 030 commits binding names rather than endpoint or credential values and rejects credential or query-bearing URLs
================================================
Research-Lab self-test: 3475 passed, 0 failed
================================================
```

#### TP-01-02-03-06-07 Current Functional

**Phase:** test
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 12 lines; SHA-256 `aa82918923c79a72c6e67235a30b78dfd5f557c79ca565f1f44739b834b56023`

```text
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (189.182083ms)
✔ Regression: SCN-030-002 exact model preflight precedes one bounded dynamic-schema completion (1004.950333ms)
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5010.95275ms)
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (413.235125ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6679.066667
```

The exact TP-01-03-only run also passed with capture SHA-256
`83aa69c01864235367b896bbf816bddb1d057d44b5ff7ff7a8b21dcd598ca37d`.
It exercises tool-author v1, tool-author v2, and final-author v1 through the real
loopback transport and rejects a non-`stop` completion.

#### TP-01-04 Current OMLX

**Phase:** test
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test --test-name-pattern '^Regression E2E: SCN-030-002 OMLX returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state$' tests/brief-openai-compatible-adapter.local-canary.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 9 lines; SHA-256 `535097c827727860418ce46372083df5ae7cf88b897d5e36a18d5fb0ed2d1b13`

```text
✔ Regression E2E: SCN-030-002 OMLX returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state (63787.403666ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 63836.256208
```

#### TP-01-05 Current Ollama

**Phase:** test
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test --test-name-pattern '^Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state$' tests/brief-openai-compatible-adapter.local-canary.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 9 lines; SHA-256 `246467d95e8251d39177d4f02af2f1f04e33a315aea369821d4ee2d9b39061c3`

```text
✔ Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state (4241.536916ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4308.932291
```

#### TP-01-08 Current Payload

**Phase:** test
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node scripts/validate-brief-payload.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 7 lines; SHA-256 `d7fedfd61fc5b8dd602c92410282de4c6438442aacff9cbf5c9e07b0a795fc98`

```text
[brief-contract] company owner-read names its producing adapter and states that no recommendation is produced: PASS
[brief-contract] every evidence timestamp is at or before the declared window cutoff: PASS
[brief-contract] SCN-019-020 payload toolRead and page read agree and expose no destination routing fields: PASS
[brief-contract] Every declared topic and section is accounted and every mandatory review belongs to the current generation: PASS
[brief-contract] causal brief items require eligible stage owner freshness independent reason and falsifiers: PASS
[brief-contract] Market Brief causal coverage and elevation satisfy low-noise independence policy: PASS (coverageRows=1 elevated=false planEligible=false)
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

#### Current Test Phase - Scenario Contract Gates

**Phase:** test
**Claim Source:** executed

```text
[scenario-test-resolve] OK — 12 reference(s) resolved via literal-scan; 11 category comparison(s) not applicable (no test-discovery adapter declared)
[scenario-obligation-lint] OK — 3 scenario(s) with a coherent derived obligation matrix
[test-mechanism-lint] OK — 3 declared mechanism(s) coherent with their scenario traits
[mutation-receipt] OK — mutationExecution adapter is none (inert)
```

Capture SHA-256 values are `0399de4e5bef5604e9c9f92b21ad0ac920fff2178a73fef8cc99367a428f7deb`,
`7dbb095c16f05c2fae19ae80055d1e32ce124c903ca0237729f2240ac973d146`,
and `40a09fadd5507bc3e742ca138d1bc1de63a54e6aeb2fd09c530a97f7aa8a5207`.

#### Current Test Phase - Integrity Audits

**Phase:** test
**Claim Source:** interpreted
**Interpretation:** The executable scans establish zero disabled-test markers,
zero live-canary mock/interception patterns, and zero regression-quality
violations. Source review confirms the assertions observe adapter-produced
schema, ordering, refusals, normalized usage, and actual provider output rather
than merely echoing fixture literals.

```text
FEATURE030_SKIP_MARKER_MATCHES=0
FEATURE030_LIVE_CANARY_MOCK_MATCHES=0
REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
Files scanned: 2
```

The regression-quality capture SHA-256 is
`8c55189ecaf59183395ecefb898ea9062395f03e73a23e0602cfeb7d2a36b283`.

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

### Historical Uncertainty Declarations

This section records the prior implementation-owner invocation. The current
correction evidence appears under `Current Implementation Reconciliation`.

TP-01-05 is unresolved in this implementation-owner invocation. Tailscale was
`Running`, but the selected endpoint did not return the required candidate
within the committed chat deadline. The item stays unchecked.

- Historical `F030-IMPLEMENT-OMLX-CAPACITY` remains resolved by both the earlier
  test-owner capture and this invocation's exact OMLX canary, whose capture
  SHA-256 is `fd246d5793c77c423c11076d7c8e63e8da587be4d738d62bbaab5cddc4211f18`.
- The earlier test-owner Ollama pass remains a true historical result. It does
  not override this invocation's deadline refusal, capture SHA-256
  `0fa1c25d9ec7223c1ea76a5a3dbd9e84599ab300e53053077884b6e70cdec014`.
- Historical `F030-PLAN-PAGES-EXCLUSION` is resolved on current bytes: the full
  selftest passes 3,475 checks with zero failures.
- Historical `F030-PLAN-CANARY-REACHABILITY` is resolved on current bytes: the
  scenario resolver resolves all 12 linked references, including both exact
  long canary titles.
- Planner-owned Test Plan status, evidence-state, and capture-hash fields still
  describe the earlier implementation phase. This test invocation did not edit
  those fields or the plan-owned DoD checkboxes.

### Scenario Contract Evidence

[scenario-manifest.json](scenario-manifest.json) records three scenario
contracts. Implementation-owned test links and current report evidence refs are
updated while each scenario remains `in_progress`.

### Coverage Report

All three Scope 01 scenarios have persistent regression coverage. The functional
file passes four tests and exercises profile refusal, all three dynamic response
contract mappings, finite limits, non-stop refusal, usage normalization, and
authority containment. The current OMLX canary passes. The earlier independent
test-owner Ollama canary passed, while this implementation-owner invocation
received a deadline refusal, so current two-provider transport qualification is
not claimed. The full selftest covers the pure policy and dynamic-schema matrix.
The public payload contract remains valid.

The self-validating-test audit found no selected assertion whose result would
survive replacement of the adapter with an input echo. The functional assertions
depend on produced request shape, request ordering, bounded refusal, normalized
usage, and closed output validation. The canaries depend on actual model output
crossing the selected external boundary.

### Lint And Quality

Earlier test-owner checks:

- Regression quality: PASS with 0 violations and 0 warnings; capture SHA-256
  `8c55189ecaf59183395ecefb898ea9062395f03e73a23e0602cfeb7d2a36b283`.
- Skip/only/todo marker scan: zero matches across the selftest, functional file,
  and real-provider canary file.
- Live-canary mock/interception scan: zero matches.
- Scenario linked-test resolution: 12 references resolved; capture SHA-256
  `0399de4e5bef5604e9c9f92b21ad0ac920fff2178a73fef8cc99367a428f7deb`.
- Scenario obligations: three coherent matrices; capture SHA-256
  `7dbb095c16f05c2fae19ae80055d1e32ce124c903ca0237729f2240ac973d146`.
- Test mechanisms: three coherent declarations; capture SHA-256
  `40a09fadd5507bc3e742ca138d1bc1de63a54e6aeb2fd09c530a97f7aa8a5207`.
- Artifact lint after the test-evidence update: PASS; 40 captured lines; SHA-256
  `40054627ee759c118d599693cb399528ef26d4f34bf28e09e3cbc6295930c25b`.
- Traceability after the current evidence-link update: PASS with zero warnings;
  57 captured lines; SHA-256
  `bdb7770f25f4af73fc27c29882d6f8ed25131f5ac70b4f77963e8f9eabc0ad28`.
- Protected-file and Git-index hashes matched exactly before and after all test
  commands; every protected path remained status-clean.

### Prior Validation Summary

This summary records the prior implementation-owner invocation. It remains
historical evidence and does not override the current correction below.

The earlier test-owner invocation was green for all selected Scope 01 categories.
This implementation-owner invocation records seven passing Test Plan rows and
one failed row, TP-01-05, with zero skipped tests. Scope 01 remains In Progress.
Validation, audit, chaos, documentation, scope completion, and certification
remain unclaimed, and certification fields remain unchanged.

The planner-owned `test-plan.json` status and hash fields still describe the
earlier implementation phase. The planner-owned scenario manifest `stageNote`
also says its link arrays are empty even though the current arrays are populated.
Those planning-text corrections are not test-owned and remain routed to
`bubbles.plan`.

### Audit Verdict

No audit verdict exists.

### Current Implementation Reconciliation - 2026-09-03

#### TP-01-05 Current Correction

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible BRIEF_OLLAMA_BASE_URL="$ollama_url" BRIEF_OLLAMA_MODEL=qwen3.8:27b /opt/homebrew/bin/node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/*.local-canary.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 11 lines; SHA-256 `b159234c8a2d02266ac823017c6a681f139803f2b68ab7b0a687ed30124ee66b`
**Tool-log tags:** `DOD-01-TP-01-05`, `SCN-030-002`, `external-live`, `outer-240s`, `adapter-deadline-120s`
**Output:**

```text
TP_01_05_CANARY=START
✔ Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state (88302.052417ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 88340.877
TP_01_05_CANARY_EXIT=0
```

**Result:** PASS. The exact configured model was cold before the run. No
prewarming, model unloading, host change, timeout change, or provider switch
occurred. The runtime endpoint remained private and in-process.

#### Ordered Shadow Removal Path Verification

**Phase:** implement
**Executed:** YES (current invocation, before broad regression)
**Command:** Finite in-process production-consumer scan, unselected shadow CLI
probe, and protected-state comparison recorded by the Bubbles tool log.
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 33 lines; SHA-256 `fbf11190d7e96dc9bddd95050f1bda51dde0b8bb042b310f65dfe919b363557c`
**Tool-log tags:** `removal-path`, `unselected-shadow`,
`production-authority`, `pre-broad-regression`
**Output:**

```text
REMOVAL_DEPENDENCIES=0|path=scripts/brief-refresh.mjs
REMOVAL_DEPENDENCIES=0|path=scripts/brief-narrative-parallel.mjs
REMOVAL_DEPENDENCIES=0|path=scripts/brief-refresh-and-push.sh
REMOVAL_DEPENDENCIES=0|path=scripts/brief-refresh-scheduled.sh
REMOVAL_DEPENDENCIES=0|path=scripts/validate-brief-payload.mjs
362:WORKER="$PUBLISH_ROOT/scripts/brief-refresh-and-push.sh"
COPILOT_SCHEDULER_WORKER_BINDING=UNCHANGED
522:          "$NODE_BIN" scripts/brief-narrative-parallel.mjs \
COPILOT_WORKER_NARRATIVE_BINDING=UNCHANGED
51:const copilotBin = process.env.BRIEF_COPILOT_BIN || 'copilot';
52:const model = process.env.BRIEF_MODEL || 'claude-opus-4.8';
COPILOT_NARRATIVE_AUTHORITY_BINDINGS=UNCHANGED
{"contractVersion":"brief-shadow-refusal/v1","authoritative":false,"error":{"contractVersion":"brief-shadow-error/v1","code":"B030-SHADOW-PROFILE","reason":"profile-required-or-unknown","field":"BRIEF_SHADOW_PROFILE"}}
UNSELECTED_SHADOW_EXIT=2
UNSELECTED_SHADOW_REFUSAL=B030-SHADOW-PROFILE
REMOVAL_GIT_STATUS_MATCH=true
REMOVAL_GIT_INDEX_MATCH=true
REMOVAL_GIT_TREE_MATCH=true
REMOVAL_PROTECTED_MATCH=true|path=scripts/brief-author.mjs
REMOVAL_PROTECTED_MATCH=true|path=scripts/brief-refresh.mjs
REMOVAL_PROTECTED_MATCH=true|path=scripts/brief-narrative-parallel.mjs
REMOVAL_PROTECTED_MATCH=true|path=scripts/brief-refresh-and-push.sh
REMOVAL_PROTECTED_MATCH=true|path=scripts/brief-refresh-scheduled.sh
REMOVAL_PROTECTED_MATCH=true|path=scripts/validate-brief-payload.mjs
REMOVAL_PROTECTED_MATCH=true|path=market-brief.payload.json
REMOVAL_PROTECTED_MATCH=true|path=brief-history.jsonl
REMOVAL_PROTECTED_MATCH=true|path=briefs/current.json
REMOVAL_PROTECTED_MATCH=true|path=package.json
REMOVAL_PROTECTED_MATCH=true|path=package-lock.json
REMOVAL_PROTECTED_MATCH=true|path=.npmrc
REMOVAL_EXTERNAL_SCHEDULER_STATUS_MATCH=true
REMOVAL_EXTERNAL_SCHEDULER_ACK_MATCH=true
SHADOW_REMOVAL_PATH=PASS
```

**Result:** PASS. The production graph has no shadow dependency. An absent
shadow selector refuses before transport. Copilot production bindings and all
protected authority surfaces remain unchanged.

#### Protected Baseline And Consumer Reconciliation

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** Focused comparison against the protected baseline captured after a
Git stat refresh and before the live canary.
**Exit Code:** 0
**Claim Source:** executed
**Baseline capture:** 49 lines; SHA-256 `66db10aa6c2c5119bf582ab9e9477d562fe750135ebf0e7bfcb7518c30cb54f0`
**Comparison capture:** 25 lines; SHA-256 `e6c7897e6fef9d4dcaecc75069a28df649c3218d131c8d5a68fe56002ebb5fbd`
**Tool-log tags:** `protected-boundary`, `consumer-scan`,
`baseline-comparison`, `no-git-mutation`
**Output:**

```text
BASELINE_ROOT_BRANCH_HEAD_MATCH=true
BASELINE_GIT_STATUS_MATCH=true
BASELINE_GIT_INDEX_SHA256_MATCH=true
BASELINE_GIT_INDEX_TREE_MATCH=true
BASELINE_PROTECTED_MATCH=true|path=package-lock.json
BASELINE_PROTECTED_MATCH=true|path=briefs/current.json
BASELINE_PROTECTED_MATCH=true|path=scripts/brief-author.mjs
BASELINE_PROTECTED_MATCH=true|path=brief-history.jsonl
BASELINE_PROTECTED_MATCH=true|path=package.json
BASELINE_PROTECTED_MATCH=true|path=.npmrc
BASELINE_PROTECTED_MATCH=true|path=scripts/brief-refresh-and-push.sh
BASELINE_PROTECTED_MATCH=true|path=scripts/brief-refresh.mjs
BASELINE_PROTECTED_MATCH=true|path=scripts/validate-brief-payload.mjs
BASELINE_PROTECTED_MATCH=true|path=scripts/brief-narrative-parallel.mjs
BASELINE_PROTECTED_MATCH=true|path=market-brief.payload.json
BASELINE_PROTECTED_MATCH=true|path=scripts/brief-refresh-scheduled.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-narrative-parallel.mjs
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-and-push.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/brief-refresh-scheduled.sh
PRODUCTION_SHADOW_REFERENCES=0|path=scripts/validate-brief-payload.mjs
EXTERNAL_SCHEDULER_STATUS_MATCHES_PRE_CANARY_BASELINE=true
EXTERNAL_SCHEDULER_ACK_MATCHES_PRE_CANARY_BASELINE=true
EXTERNAL_SCHEDULER_BASELINE_CLASSIFICATION=PREEXISTING_RUNTIME_STATE_NOT_AUTHORED_REPOSITORY_BYTES
PROTECTED_BOUNDARY_AND_CONSUMER_SCAN=PASS
```

**Result:** PASS. The canary and removal probe caused no Git mutation and no
change to excluded repository bytes. The scheduler status and acknowledgment
are external runtime files. Their current digests match the baseline captured
after the latest scheduled publication.

#### External Scheduler Context

**Claim Source:** interpreted from operator-provided diagnostic context

The latest scheduled publication predates this invocation's baseline. The
operator identified run key `2026-09-03/pre-market`, publication commit
`397dc41d7c4189299d2e2ceb0486927545e39677`, and terminal exit `0`. This
invocation did not execute that publication. It is external runtime context,
not Feature 030 source or execution evidence.

#### Implementation Finding Reconciliation

- `F030-IMPLEMENT-DOD-EVIDENCE`: addressed by the four current evidence links
  in Scope 01.
- `F030-IMPLEMENT-TP-01-05-DEADLINE`: addressed by the exact passing canary
  above without changing the committed deadline.
- `F030-IMPLEMENT-PROTECTED-SCHEDULER-DRIFT`: addressed by the fresh baseline
  and matching post-canary external status digests.
- `F030-PLAN-TEST-PLAN-EVIDENCE-REFRESH`: unresolved and owned by
  `bubbles.plan`.
- `F030-PLAN-SCENARIO-STAGE-NOTE`: unresolved and owned by `bubbles.plan`.

Scope 01 remains In Progress. Certification remains `not_started`. No scope or
spec completion is claimed.

#### Post-Edit Focused Functional Suite

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 240 /opt/homebrew/bin/node --test tests/brief-openai-compatible-adapter.functional.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 12 lines; SHA-256 `5ee3cb1b9099de88f84247dbd264560fbed2865c459893a767c72a3e1dbacb4e`
**Output:**

```text
✔ Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP (182.515042ms)
✔ Regression: SCN-030-002 exact model preflight precedes one bounded dynamic-schema completion (962.707208ms)
✔ Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one (5010.418791ms)
✔ Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels (352.598917ms)
ℹ tests 4
ℹ suites 0
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6565.417958
```

**Result:** PASS.

#### Post-Edit Full Selftest

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=10s 900 /opt/homebrew/bin/node scripts/selftest.mjs`
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 3,986 lines; SHA-256 `1594b2685fece31e61ade8407d0fdf01e3b4bd4a06ceb7b89bf8ce935be6beb4`
**Output:**

```text
Feature 030 Scope 01 - shadow policy transport contract authority and receipts
  ✓ Feature 030 policy declares exactly the two approved shadow profiles and no alias or production adapter
  ✓ Feature 030 resolves each exact profile to its declared provider and model while both share one transport contract
  ✓ Feature 030 builds the dynamic strict three-key response schema and standard no-reasoning request for every request contract through both profiles
  ✓ Feature 030 refuses missing unknown and incomplete profile selection with closed codes instead of defaults
  ✓ Feature 030 commits every exact finite limit and refuses policy missing any one instead of supplying a code fallback
  ✓ Feature 030 validates the one provider-neutral local capability and refuses a route-class substitution
  ✓ Feature 030 normalizes present token integers, preserves absent usage as unmeasured without zero, and rejects inconsistent totals
  ✓ Feature 030 commits binding names rather than endpoint or credential values and rejects credential or query-bearing URLs

================================================
Research-Lab self-test: 3475 passed, 0 failed
================================================
```

**Result:** PASS. The capture hash covers all 3,986 produced lines.

#### Post-Edit Payload And Governance Checks

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** Bounded sequence of `node scripts/validate-brief-payload.mjs`,
`scenario-test-resolve.sh`, `artifact-lint.sh`, and `traceability-guard.sh`.
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 110 lines; SHA-256 `1824343371017992af20e67ead7fff7c4ddb6b83fdd1cbe0da05d3b9c7a85f74`
**Output:**

```text
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
FEATURE030_PAYLOAD_VALIDATION=PASS
[scenario-test-resolve] OK — 12 reference(s) resolved via literal-scan; 11 category comparison(s) not applicable (no test-discovery adapter declared)
FEATURE030_SCENARIO_TEST_RESOLVER=PASS
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
RESULT: PASSED (0 warnings)
FEATURE030_TRACEABILITY=PASS
FEATURE030_REQUESTED_POST_EDIT_CHECKS=PASS
```

**Result:** PASS. Artifact lint and traceability both completed without a
bypass. Traceability reported three mapped scenarios and zero warnings.

#### Final Protected Repository Boundary

**Phase:** implement
**Executed:** YES (current invocation)
**Command:** Final protected repository comparison against the pre-canary
baseline, with external scheduler runtime files reported separately.
**Exit Code:** 0
**Claim Source:** executed
**Capture:** 17 lines; SHA-256 `008b0fabe6a527f91a27ac10c7ae2f8064dd6868d8c2c65528752574c34a5a27`
**Output:**

```text
FINAL_REPOSITORY_HEAD_BRANCH_STATUS_INDEX=PASS
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=package-lock.json
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=briefs/current.json
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/brief-author.mjs
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=brief-history.jsonl
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=package.json
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=.npmrc
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/brief-refresh-and-push.sh
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/brief-refresh.mjs
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/validate-brief-payload.mjs
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/brief-narrative-parallel.mjs
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=market-brief.payload.json
FINAL_PROTECTED_REPOSITORY_MATCH=true|path=scripts/brief-refresh-scheduled.sh
FINAL_EXTERNAL_SCHEDULER_STATUS_BASELINE_MATCH=true
FINAL_EXTERNAL_SCHEDULER_ACK_BASELINE_MATCH=true
FINAL_EXTERNAL_SCHEDULER_CLASSIFICATION=RUNTIME_STATE_OUTSIDE_AUTHORED_REPOSITORY_BYTES
FINAL_PROTECTED_REPOSITORY_BOUNDARY=PASS
```

**Result:** PASS. The broad checks caused no protected repository or external
scheduler change.

#### Implement Tier Validation

**Phase:** implement
**Claim Source:** interpreted
**Interpretation:** The executed checks support the following Tier verdicts.

| Check | Verdict | Evidence |
| --- | --- | --- |
| Tier 1 artifact lint | PASS | Post-edit payload and governance capture `1824343371017992af20e67ead7fff7c4ddb6b83fdd1cbe0da05d3b9c7a85f74` |
| Tier 1 terminal transition guard | NOT_APPLICABLE | No status transition was requested or attempted |
| Tier 1 continuation and deferral language | PASS | G040 appears in the read-only terminal guard's passed gate set |
| Tier 1 result envelope | PENDING RESPONSE | The terminal response owns this output |
| Tier 1 evidence provenance | PASS | Artifact lint accepted the current report and scope evidence |
| Tier 1 unchecked DoD declarations | PASS | Focused state check reported `SCOPE_DOD_UNCHECKED=0` |
| Tier 1 impact and trace configuration | NOT_APPLICABLE | Scope 01 declares no generated test-impact category or observability workflow |
| I1 scope DoD evidence | PASS | All Scope 01 items are checked with current or retained evidence links |
| I2 required tests | PASS | TP-01-05, focused functional, full selftest, payload, resolver, artifact, and traceability checks passed |
| I3 docs synchronized | NOT_APPLICABLE | This invocation changed evidence only and changed no product behavior or managed documentation |
| I4 scope state coherent | PASS | `execution-substate-guard.sh` accepted `implemented`; status and certification remain `not_started` |
| I5 no new policy violations | PASS WITH ADVISORY | `implementation-reality-scan.sh` found zero violations and one source-discovery warning |
| I6 observability evidence | NOT_APPLICABLE | No Test Plan row declares `observabilityWorkflow` |

The combined canonical-guard command exited `1` after the substate and reality
checks passed. `state-transition-guard.sh` evaluates promotion to `done` and
correctly refused that terminal transition with 34 failures and one warning.
Its failed gate set was `G060`, `G022`, `G027`, `G068`, `G089`, `G094`, and
`G136`. This invocation does not claim those later full-delivery gates passed.
Capture SHA-256: `78cc9b5882f006e210ae2b311644fb5582505a1e8af0e516b99d1a3e7fe70dd8`.

The reality scan warning states that scope-path discovery found zero files and
fell back to two design references. It is non-blocking but remains finding
`F030-PLAN-REALITY-SCAN-SOURCE-DISCOVERY`, owned by `bubbles.plan`.

The focused follow-up check exited `0`. It confirmed a clean diff, no scope or
spec promotion, unchanged `not_started` certification, and zero unchecked DoD
items. Capture SHA-256:
`c5f7f284627b93951ed3fc1e022e6108aedfb3d0b060745dbbe38b5899eaf869`.

### Security Bug Implementation Reconciliation - 2026-09-03

**Phase:** implement
**Executed:** YES (current session)
**Claim Source:** executed

#### F030-SEC-01

- Exact TP-01-09 RED: exit 1 because the rounded-equality tuple reached `ok: true`; capture `d70a3ef787c2505d9816b4610fd55dc7f9e8d12e0403053f48631e40c1e3a4f0`.
- Exact TP-01-09 GREEN: exit 0 after safe-integer admission and overflow-before-addition; capture `68e7050d53bf8cd21c57b3358d820e027884ee40a5551e14662b8ec8dd2c1241`.
- Existing SCN-030-002 functional and stress checks passed; captures `f9ce1b10880db549ec5853a33b0ba8d49dafbb3c01a9dc88dde993dd76f8a83d` and `a40a2015a95e62589fd40792a89d6e59f36268ba7d3d49943241bc93d309fc65`.

#### F030-SEC-02

- Exact TP-01-10 RED: exit 1 because a retained digest reached the transport callback; capture `a355f2d551cff67f17a555f3d82eaee540e50bf03a0a12de6c96d45f2e9c22da`.
- Exact TP-01-10 GREEN: exit 0 for all eight canonical field mutations across process, route, and adapter boundaries with zero callback, child, model-list, and chat calls; capture `0f08ca473558f5998247749534cb4387be0543c5fd8e2fdcc377211e913af0d2`.
- Canonical tool-v1, tool-v2, and final-v1 builder bytes and fingerprints matched `HEAD`; verification did not mutate requests. Capture `4a7c13b6efc2f0617b302fcceef399241d02db0054f1c90e5c5ed8b474f61e7f`.
- Existing v1, v2, and final author-boundary suites passed 11 tests with zero skips; capture `14311ea0042b07f05c66e13558fa17cebf6a608f7f25064fd2b687ceeb66bdee`.

#### Post-Fix Verification

- Complete Feature 030 functional suite: 6 passed, 0 failed, 0 skipped; capture `73dd73d41d56dcf4271cf60efd79e5ea3cd9108df5069bcdd941c6bc5ea52388`.
- Public payload validator: exit 0; capture `d7fedfd61fc5b8dd602c92410282de4c6438442aacff9cbf5c9e07b0a795fc98`.
- Scenario resolver: 14 references resolved; capture `25613b11b91b4836f24f06eafbbe8ee4e957407b417bf4b98e1b7c303e4cb7cd`.
- Parent artifact lint: exit 0; capture `40054627ee759c118d599693cb399528ef26d4f34bf28e09e3cbc6295930c25b`.
- Parent traceability: 3 scenarios mapped with 0 warnings; capture `7480a2f6b43447a6f2f906d78d747d5b0ba5487b77b4f1051c1f37a892047f23`.
- Structured Test Plan parity: 10 parent rows and 4 rows per bug packet matched; capture `a474181e93d5bc6ebead02f91bf37e2920af11e41d1be7fb815381406195704d`.
- Implementation reality scan: 1 discovered UMD source, 0 violations, 0 warnings; capture `bd7c897cb79aa711b318f7673be2d486ba00229409e2bd05c83ff518f6ddd508`.
- Strict parent and bug work-boundary checks passed; capture `149717e2bbd52b646b3273b0b6ed84d47c8e5b21bb6d80e3fe017427d46989a7`.
- Secret, authority, and production-consumer scan passed; capture `378640f146262bc959636137e8503d01434f733b1f5b604f5b284df4fa5f0547`.
- Bugfix regression-quality scan reported 0 violations and 0 warnings; capture `cabb97687d0e23cb4f0763c17cda2fd15acb2fb7a677d6c089b024b702d2ac1e`.

#### Real Provider Canaries

The final OMLX and Ollama requests were produced by the canonical builder and
verified before dispatch. Endpoint values remained in child process memory and
were not persisted. The outer bound was 240 seconds and the committed adapter
chat timeout remained 120 seconds. No prewarm, reroute, host change, or model
setting change occurred.

- OMLX: exit 0 on final canary bytes; capture `a8ebaaea00d344f5806fa3b470a15199adbc06f5ca01292cdca0c33f4d976aa7`.
- Ollama: the first canonical request returned the closed `completion-message-shape` refusal. Adding the bounded candidate to frozen builder data produced exit 0 on the rerun; final capture `09791d35e6ee1d14efce5bcc20e9259e0e6376df6e2b669cb232f5457c4bea7a`.

#### Nonterminal Findings

The complete `node scripts/selftest.mjs` command executed. All nine Feature 030
assertions passed, including safe-integer and canonical-verifier byte
preservation. The command exited 1 because the unrelated
`OPS-integrate-research-lab-main` packet references three missing test files.
The dedicated diagnostic capture is
`020a5bcbfd6e00c0826dbb9eeb7c3d965078c4cc828179c60e41cd8e1b6cc6e4`.
No OPS artifact was modified.

The external scheduler status receipt changed independently during the live
provider window. Its publish acknowledgment remained unchanged. This is
runtime context outside authored repository bytes and is not claimed as
Feature 030 execution evidence. No restore was attempted.

Scope 01 remains In Progress. Independent test, security, validation, and audit
are required. Certification status and completed scopes remain unchanged.

#### Final Repository Boundary

**Phase:** implement
**Claim Source:** executed
**Capture SHA-256:** `3c0cc5daa613a8a83894ea0d6eb62668103ef6f9b967baeb3c08a87006979910`

The final check reported unchanged `HEAD`, an empty Git index, passing
`git diff --check`, zero framework-managed changes, all protected production
and public hashes unchanged, and the preexisting BUG-022 diff unchanged. It
classified 31 Feature 030 paths, 2 preexisting BUG-022 paths, 8 concurrent
operations-packet paths, and 0 unexpected paths. The external scheduler status
receipt did not match the session-initial digest; its acknowledgment did.

## Independent Test Verification - 2026-09-03

**Phase:** test
**Executed:** YES
**Claim Source:** executed
**Repository branch:** `checkpoint/research-lab-20260902-7fbaa/late/feature-030-design`
**Repository HEAD:** `eba665b8ee5569b2bb14c4ab6f868cb7636788c8`
**Initial worktree status SHA-256:** `c22d89742355a1796b0196cb32ea5039beb315dc2fed758863528616262bd7d7`
**Initial Git index SHA-256:** `6bca61f4f766cee3b8fa884dd33dd4ffd3610b6084e70f28769bf71d85c3ef3d`

### Security Regression Proof

```text
$ node --test --test-name-pattern "Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage" tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
✔ Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage (0.682541ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
$ node --test --test-name-pattern "Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch" tests/brief-openai-compatible-adapter.functional.mjs
exit: 0
✔ Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch (8.60675ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
ℹ skipped 0
ℹ todo 0
```

TP-01-09 capture: `50b6034c381ad61d65107fdcaec6929dec107d0caa5e11e9088d588f4559914d`.
TP-01-10 capture: `c7efd6ed006d15689386f40979718e0abaeeb95d083e1363105686531a338cea`.

TP-01-10 starts from a builder-generated request and retains its digest while
independently mutating all eight canonical fields: `contractVersion`, `data`,
`provider`, `model`, `promptPolicy`, `schema`, `validator`, and
`maxOutputTokens`. Its passing loop requires refusal before the transport
callback, child probe, route model-list, route chat, adapter model-list, and
adapter chat boundaries. The final counter assertion requires zero child,
model-list, and chat calls. The current-source matrix audit found all eight
mutations and every guard assertion. Capture:
`5648f82374ffd3d795c7630700caecd4b6a938bcabdfa3ff886781994b55b450`.

### Parent Test Plan Results

| Row | Exact command outcome | Result | Capture SHA-256 |
| --- | --- | --- | --- |
| TP-01-01 | `node scripts/selftest.mjs` | Exit 1: 3,475 passed, 1 unrelated OPS path-ratchet failure; all 9 Feature 030 assertions passed | `de31f97ceb3ca6332e76ce86423b207df80d59bf515e924064d9f2d0d3367ccd` |
| TP-01-02 | Exact `Regression: SCN-030-001` selector | 1 passed, 0 failed, 0 skipped | `6a88466e1c806e7b6cc0c52028b52c5df7516d57fc265eb04267bb7db6be6b3b` |
| TP-01-03 | Exact `Regression: SCN-030-002` selector | 1 passed, 0 failed, 0 skipped | `02e6876da5c23304f62b11d66b0ce1153b7b9eda224a03d8c9b95857cd861bc1` |
| TP-01-04 | Exact OMLX command with private in-process endpoint binding | 1 passed in 69 seconds, 0 failed, 0 skipped | `bdb8952781aff8368da66e37546507a7a11e37511bd89a55d2c02a431593f035` |
| TP-01-05 | Exact Ollama command with private Tailscale binding and `qwen3.8:27b` | 1 passed in 5 seconds, 0 failed, 0 skipped | `c1432481e4e2b0bf3d68bee451afc73fdf55bfb9503c43b8564a172da4257bcb` |
| TP-01-06 | Exact `Stress: SCN-030-002` selector | 1 passed in 5.0 seconds, 0 failed, 0 skipped | `2f821a04ddfcf5a0cc5ce8ffb7eed0ede2ae9e0c89548e68967c0a9c383cf93f` |
| TP-01-07 | Exact `Regression: SCN-030-003` selector | First run observed an external scheduler receipt race; unchanged rerun passed 1 of 1 | `692934fb6a066852479a13f6f33bde990f5a9f1e0be593511063c6bed35d8887`, `3c9c4955d06d94cdfcb8a03961336823c2c71235bf7575a3ededccc4ee6c1777` |
| TP-01-08 | `node scripts/validate-brief-payload.mjs` | Exit 0; all 7 printed contract checks passed | `d7fedfd61fc5b8dd602c92410282de4c6438442aacff9cbf5c9e07b0a795fc98` |
| TP-01-09 | Exact unsafe-token security selector | 1 passed, 0 failed, 0 skipped | `50b6034c381ad61d65107fdcaec6929dec107d0caa5e11e9088d588f4559914d` |
| TP-01-10 | Exact retained-fingerprint security selector | 1 passed, 0 failed, 0 skipped | `c7efd6ed006d15689386f40979718e0abaeeb95d083e1363105686531a338cea` |

The complete Feature 030 functional carrier passed 6 of 6 after the broad
selftest failure, with zero failures, skips, or todos. Capture:
`bfeee28a8e522ee7b7097e41254aae99c54a3f14f83e9dba8195a360d30b53ec`.
The established tool-author v1, tool-author v2, and final-author v1 boundary
matrix passed 11 of 11. Capture:
`c6675a162addac45b36c542e2993ffecbef309c597636a2a86e65e705feadc85`.

### Broad Selftest Causality

The full selftest is not green and is not reported as green. It produced 4,012
lines and ended with `Research-Lab self-test: 3475 passed, 1 failed`. Its only
failure was the spec-test-path ratchet. The canonical validator independently
reported exactly these three absent paths, all owned by
`specs/_ops/OPS-integrate-research-lab-main`:

```text
NEW-MISSING tests/ops-integrate-research-lab-main.functional.mjs
NEW-MISSING tests/ops-integrate-research-lab-main.integration.mjs
NEW-MISSING tests/shock-transmission.e2e.spec.mjs
[spec-test-paths] FAIL — 3 new referenced path(s) do not exist
```

Path-causality capture:
`0a3919c2dfe9cef1d55029c36609528d90adf2b271cda8630074f232d12accb2`.
No OPS artifact was edited.

### Test Integrity And Governance

- Disabled-marker and fake-live scans reported zero matches across all five relevant author tests. The TP-01-10 source matrix contained all eight fields and all seven pre-dispatch guard assertions. Capture: `5648f82374ffd3d795c7630700caecd4b6a938bcabdfa3ff886781994b55b450`.
- The bugfix regression-quality guard scanned both Feature 030 carriers and reported 0 violations and 0 warnings. Capture: `3d713fe6e6d128e53c2e641125bb8304089031e8caf58e3e5364cf618805f591`.
- Parent and both bug artifact lint, test-mechanism lint, linked-test resolution, and traceability/Test Plan mapping passed. Capture: `ed0b33223d36ef4e26e03d38c1d5a9c068def11c9fe8a7d312e904c5d2937808`.
- All three scenario manifests passed the installed JSON Schema. Capture: `82e033f9418a7f8c72192df6bc89bcf6a1e2a6291aab1b8ac49f0b8f91760943`.
- Contract-aware structured Test Plan parity passed 10 parent rows and 4 rows in each bug packet. Capture: `cb9adefcd4b8e615bd6c474c17dbc960c6158edc25429e2b04f54bf34aac1a66`.
- Parent scenario obligations passed. BUG-001 lacks an obligation entry for its declared `pure-calculation` trait; BUG-002 lacks entries for `pure-calculation` and `dependency-path`. These are planner-owned manifest findings. Captures: `166c99bbfd78dfd3e578b8b2c027c33e8f48005727597c50e7d561e0fa3da1c2` and `aa025c5577649ac300320079f7bfa67b9d554b0fcadd8d39e8bda8618c91d475`.
- The focused secret/authority/consumer scan found zero secret-shaped policy keys, committed endpoints, mutation APIs, authorization headers, or production/public shadow consumers. Capture: `528b7727de64bfcba2c3b683faba26f68d3969fb63c0135b3bd77eb8794d1d43`.
- The repository security gate scanned 10,043 tracked files with zero findings. The PII scanner scanned 10,042 files and 2,323 commit messages with zero findings. Captures: `14d80232634c77bab4df436f05fdf729728159ed575b8eb4d9d1705904f0b135` and `afb48caff79d25e811ee5fbb9822db8ed960570a19cfe8eb959f4f48010e153f`.

### Publication And Byte Boundaries

GitHub Pages run `33749482741` was independently queried. It is completed with
conclusion `success`, its verify and deploy jobs succeeded, and its head is
publication commit `397dc41d7c4189299d2e2ceb0486927545e39677`. That run
predates this dirty Feature 030 tree and is not current-byte certification.
Capture: `61032d22224db1556a87ad6626f972f3c27016f73267d4d3d944aa378e020c31`.

All 10 Feature 030 implementation/test files and all 11 protected production
and public files matched the initial SHA-256 baseline before evidence edits.
Branch, HEAD, worktree-status digest, and Git index also matched. BUG-022 and
all OPS bytes were frozen separately for the final comparison. The scheduler
status receipt advanced independently during this run; the publish
acknowledgment remained byte-identical and no scheduler process remained.
Capture: `43062956f0d1161ea1e17e0503eacae99ea67896697303e0a926c46cee20dfb0`.

### Test Disposition

`F030-SEC-01` and `F030-SEC-02` are independently verified on the current exact
bytes. Scope 01 remains In Progress, the parent top-level status remains
`not_started`, certification remains `not_started`, and completed scopes remain
empty. No Done state, certification, validation, audit, commit, push, public
artifact, source, test, planning requirement, model-host, BUG-022, OPS, or
framework change is claimed. Security review owns the next disposition.
