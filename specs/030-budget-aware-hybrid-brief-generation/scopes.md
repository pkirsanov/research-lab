# Feature 030 Execution Scopes

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Execution Outline

### Phase Order

1. **SCOPE-01 OpenAI-compatible shadow author adapter** - add one powerless,
   non-authoritative author path for the two approved local profiles while the
   current Copilot CLI scheduler and publication path remain unchanged.

### New Types And Signatures

- `validateShadowPolicy(config) -> validated shadow policy or B030 refusal`
- `resolveShadowProfile(config, env) -> one frozen profile or refusal`
- `validateRouteCapability(value) -> model-route-capability/v1`
- `normalizeLocalUsage(value) -> measured, unmeasured, or not-applicable dimensions`
- `qualifyOpenAICompatibleModel(profile, signal) -> exact model capability or refusal`
- `invokeOpenAICompatibleChat(profile, authorRequest, signal) -> author response plus usage receipt`
- `brief-shadow-generate` stdin: one frozen `brief-author.mjs` request envelope
- `brief-shadow-generate` stdout: safe non-authoritative JSON containing the
  matching author response envelope and normalized usage receipt

### Validation Checkpoints

- **Checkpoint A:** Pure contract checks reject missing or unknown profiles,
  invalid runtime bindings, invalid capability records, and numeric zero used
  for absent measurements before transport work begins.
- **Checkpoint B:** A real loopback HTTP server exercises `/v1/models` and
  `/v1/chat/completions` through the production adapter. It proves exact model
  admission, strict JSON, byte limits, cancellation, deadlines, concurrency,
  no provider switching, and safe receipts.
- **Checkpoint C:** One operator-configured OMLX invocation and one
  operator-configured Ollama invocation exercise their actual endpoints. Each
  proves transport compatibility only and must fail when requested but
  unavailable.
- **Checkpoint D:** Authority-containment checks compare protected artifact,
  Git, and scheduler state before and after shadow invocation. The public
  payload validator and complete project selftest then run unchanged.

### Inactive Plan Inventory

- Route planning inside `runBriefRefresh`, reuse wiring, materiality, and budget
  settlement require owner activation through a new plan revision.
- The 30-run corpus, comparative evaluator, and promotion rubric require their
  owner records before activation.
- Scheduler integration, public publication, legacy-path removal, and cutover
  proof require a separately approved plan revision.

### Requirement Coverage Boundary

| Inventory | Requirement groups |
| --- | --- |
| Active in Scope 01 | FR-030-005, FR-030-007, FR-030-008, FR-030-015, FR-030-024, FR-030-026, FR-030-028, FR-030-035, FR-030-036, FR-030-039, FR-030-040; NFR-030-004, NFR-030-005, NFR-030-006 |
| Inactive route and run control | FR-030-001 through FR-030-004, FR-030-006, FR-030-009 through FR-030-014, FR-030-016 through FR-030-023, FR-030-025, FR-030-027; NFR-030-001 through NFR-030-003, NFR-030-008 |
| Inactive evidence, publication, and promotion | FR-030-029 through FR-030-034, FR-030-037, FR-030-038; NFR-030-007 |

The inactive groups remain feature obligations. They are not executable scope
work until their owner records named in design.md exist and the plan is revised.

## Overview

This plan contains one foundation scope because every active change contributes
to one independently testable outcome: an explicit local shadow choice can
consume a frozen author request and return a bounded candidate without gaining
production authority. The shared transport lands before any route-planner or
publication integration. The scope is tagged as a foundation because both
approved profiles use the same transport and validators.

| # | Scope | Kind | Foundation | Surfaces | Test rows | DoD summary | Status |
| --- | --- | --- | --- | --- | ---: | --- | --- |
| 01 | OpenAI-compatible shadow author adapter | contract/runtime | true | UMD contracts, Node adapter/runtime/CLI, config, tests | 8 | Explicit selection, bounded real transport, authority containment, unchanged public contracts | In Progress |

## Scope 01: OpenAI-compatible shadow author adapter

**Scope ID:** `01-openai-compatible-shadow-author-adapter`
**Status:** In Progress
**Priority:** P0
**Kind:** contract/runtime
**Foundation:** true
**Depends On:** None
**Goal Contribution:** Establish the approved provider-neutral local author
boundary needed to evaluate economical routes without changing the current
Copilot CLI generation or publication authority.

### Scope Requirements

1. **S01-R01 Shared transport.** Create one `openai-compatible-chat/v1`
   transport using Node built-ins only. Do not change `package.json`,
   `package-lock.json`, `.npmrc`, or the browser runtime.
2. **S01-R02 Explicit profiles.** The committed policy declares exactly the
   approved shadow profiles `omlx-openai-compatible-qwen38` and
   `ollama-openai-compatible`. `BRIEF_SHADOW_PROFILE` is required. A missing,
   unknown, or non-shadow value refuses with `B030-SHADOW-PROFILE` before any
   HTTP request. There is no default, discovery, or provider switch.
3. **S01-R03 Runtime bindings.** The OMLX profile commits model ID
   `Qwen3.8-27B-3bit-MLX` and requires `BRIEF_OMLX_BASE_URL`. The Ollama profile
   requires both `BRIEF_OLLAMA_BASE_URL` and `BRIEF_OLLAMA_MODEL`. No endpoint
   URL, host identity, account, credential, or installation path is committed.
4. **S01-R04 Endpoint admission.** A base URL exists only through the selected
   profile's named environment binding. It must be an explicit absolute HTTP or
   HTTPS URL with no credentials, query, or fragment. The adapter never infers
   an endpoint and never emits the resolved URL. Loopback and an explicitly
   supplied operator URL follow the same validator.
5. **S01-R05 Exact model preflight.** Before generation, call only
   `/v1/models`, require a valid bounded JSON model list, and require an exact
   ID match for the selected model. An unreachable endpoint, malformed model
   response, or absent exact model refuses with `B030-ROUTE-UNAVAILABLE` before
   `/v1/chat/completions`.
6. **S01-R06 Finite transport policy.** Commit and validate these shadow-only
   limits: model-list timeout `5000` ms; model-list response maximum `262144`
   bytes; chat timeout `120000` ms; serialized chat request maximum `98304`
   bytes; chat response maximum `98304` bytes; retry count `0`; per-process
   in-flight chat maximum `1`. Missing, non-integer, non-positive, or exceeded
   limits refuse. No code-supplied limit replaces missing policy.
7. **S01-R07 Strict completion.** Send one non-streaming
   `/v1/chat/completions` request with the exact configured model, fixed system
   instructions, the frozen author request as data, and JSON-object response
   mode. Do not send tools or grant browsing, shell, file, Git, publication, or
   network authority beyond the selected endpoint. Require HTTP success, the
   closed OpenAI-compatible choice/message shape, JSON candidate content, and a
   response within all bounds.
8. **S01-R08 Usage truth.** Normalize prompt, completion, and optional total
   token fields as non-negative integers when present. Verify total consistency
   when all token fields exist. A missing provider field becomes `unmeasured`
   with no numeric value; it never becomes zero. Provider credits and monetary
   cost are `not-applicable` for these local profiles. Native provider response
   bodies and endpoint URLs do not enter receipts.
9. **S01-R09 Frozen author contract.** Use `brief-author.mjs` unchanged as the
   bounded `shell: false` child-process boundary. The route runtime passes one
   frozen request and accepts only its matching response envelope. The adapter
   cannot change provider, policy, budget, evidence refs, capability grants, or
   consequence state.
10. **S01-R10 Shadow-only CLI.** `scripts/brief-shadow-generate.mjs` requires a
    profile and one frozen stdin request. It writes no file and prints one safe
    normalized JSON result marked `authoritative: false`. Its argument parser
    rejects publication, commit, provider-switch, and weakened-validation
    options as unknown arguments.
11. **S01-R11 Easy switching.** Changing only `BRIEF_SHADOW_PROFILE` and that
    profile's required runtime bindings selects OMLX or Ollama. Both choices
    execute the same adapter transport, response validators, receipt validator,
    and authority checks.
12. **S01-R12 Production preservation.** The new modules have exactly one
    executable consumer: the shadow CLI. Existing production scripts do not
    import or invoke them. A shadow run cannot change the public payload,
    current pointer, history, scheduler receipt, Git index, working-tree files,
    or production process environment.
13. **S01-R13 Secret exclusion.** Read only the allowlisted profile, endpoint,
    and model variables. Secret-shaped environment names and sentinel values do
    not enter request JSON, response JSON, stdout, stderr, errors, or usage
    receipts. Initial adapters send no authorization header and accept no
    credential option.
14. **S01-R14 Honest qualification.** Loopback-server checks are functional
    transport tests, not provider evidence. Requested OMLX and Ollama canaries
    call the actual runtime endpoint and require a tiny strict-JSON candidate
    plus a valid measured-or-unmeasured usage state. They make no model-quality,
    promotion, cost-reduction, or implementation-completion claim.
15. **S01-R15 Explicit non-public inventory.** List `rlbriefroute.js` in
  `site-exclusions.json` with the substantive reason that it is a
  Node/shadow-only module with no public runtime consumer. Modify no other
  exclusion entry. Remove this single entry only under an approved plan
  revision that ships a production consumer for the module.

### Gherkin Scenarios

```gherkin
# SCN-030-001
Scenario: Explicit shadow profile resolves once or refuses before transport
  Given the committed policy declares the two approved shadow profiles and their required runtime bindings
  When an operator selects one profile for a frozen author request
  Then exactly that profile and model are frozen, while missing or unknown selection and invalid bindings refuse before any HTTP request

# SCN-030-002
Scenario: One bounded transport qualifies the exact model and returns strict JSON
  Given an explicitly selected profile has a valid runtime endpoint and exact configured model
  When the shadow runtime performs preflight and authors the frozen request
  Then it confirms the model through /v1/models before one bounded /v1/chat/completions call and returns strict candidate JSON with a truthful normalized usage state

# SCN-030-003
Scenario: Shadow authorship remains non-authoritative and powerless
  Given the current Copilot worker, scheduler, public payload, pointer, history, and Git state are authoritative
  When the shadow CLI processes a frozen author request under either approved profile
  Then it writes nothing, exposes no secret-shaped value, offers no production action, and leaves every authoritative surface byte-identical
```

### Implementation Plan

1. Add pure UMD validators in `rlbriefroute.js` for shadow policy, profile,
   capability, endpoint-binding metadata, finite limit fields, and normalized
   receipt states. Expose only deterministic validation and normalization.
2. Add only `rlbriefroute.js` to `site-exclusions.json`. State that it is a
  Node/shadow-only module with no public runtime consumer and that the entry
  is removed only when an approved production consumer ships. Preserve every
  other exclusion entry byte-for-byte.
3. Add shadow-only policy data to `market-brief.config.json`. Declare the two
   profile IDs, adapter IDs, environment variable names, OMLX model ID,
   capability records, usage mappings, and exact finite limits. Existing config
   members and existing readers retain their current meaning.
4. Add `scripts/brief-openai-compatible-adapter.mjs`. Use `node:http`,
   `node:https`, `node:url`, `AbortController`, and bounded stream handling for
   model preflight and chat. Reject over-limit data while reading it, cancel the
   request, and retain no native response body after normalization.
5. Add `scripts/brief-route-runtime.mjs`. Resolve exactly one profile from the
   committed policy and allowlisted runtime bindings, freeze its capability,
   invoke the shared adapter through the existing author process contract, and
   validate the matching response and usage receipt.
6. Add `scripts/brief-shadow-generate.mjs`. Accept only the profile option plus
   stdin JSON, invoke the route runtime, and emit one non-authoritative result.
   Keep stdout machine-readable and send sanitized refusal details to stderr.
7. Extend `scripts/selftest.mjs` with pure contract tests extracted from
   `rlbriefroute.js`. Cover both profile records, unknown values, limit edges,
   receipt states, and exact provider/model identity.
8. Add `tests/brief-openai-compatible-adapter.functional.mjs`. Run the real
   adapter/runtime/CLI against an ephemeral loopback HTTP server for positive,
   negative, boundary, stress, security, and authority-preservation cases.
9. Add `tests/brief-openai-compatible-adapter.integration.mjs`. Run the
   production shadow CLI against exactly one explicitly selected real endpoint
   per test title. Require complete runtime configuration and fail loud when a
   requested provider is unavailable.

### Change Boundary

#### Allowed Implementation Paths

- Create `rlbriefroute.js`.
- Create `scripts/brief-openai-compatible-adapter.mjs`.
- Create `scripts/brief-route-runtime.mjs`.
- Create `scripts/brief-shadow-generate.mjs`.
- Modify only the shadow-policy portion added to `market-brief.config.json`.
- Modify only the `rlbriefroute.js` declaration in `site-exclusions.json`;
  preserve every other exclusion entry byte-for-byte.
- Modify `scripts/selftest.mjs` only to register Feature 030 pure checks.
- Create `tests/brief-openai-compatible-adapter.functional.mjs`.
- Create `tests/brief-openai-compatible-adapter.integration.mjs`.

#### Excluded Implementation Paths And Surfaces

- `scripts/brief-author.mjs` remains byte-identical.
- `scripts/brief-refresh.mjs` remains byte-identical.
- `scripts/brief-narrative-parallel.mjs` remains byte-identical.
- `scripts/brief-refresh-and-push.sh` remains byte-identical.
- `scripts/brief-refresh-scheduled.sh` remains byte-identical.
- `scripts/validate-brief-payload.mjs` remains byte-identical.
- Public payload, pointer, history, scheduler state, pages, browser helpers,
  package manifests, workflows, framework files, and sibling specs remain
  byte-identical.
- Source acquisition, route planning, materiality, budget settlement, corpus
  evaluation, promotion, publication, commit, push, and scheduler cutover are
  not executable from Scope 01.

Collateral cleanup requires an approved plan revision before any edit.

### Consumer Impact Sweep

- No route, path, contract, identifier, or UI target is renamed or removed.
- The first and only executable consumer of the new runtime is
  `scripts/brief-shadow-generate.mjs`.
- `scripts/brief-narrative-parallel.mjs` stays the Copilot-specific production
  consumer and reads none of the new selector or endpoint variables.
- `scripts/brief-refresh-and-push.sh` and
  `scripts/brief-refresh-scheduled.sh` retain their existing invocation graph.
- `node scripts/validate-brief-payload.mjs` remains the public payload contract
  check and consumes no Feature 030 shadow output.
- Static consumer tracing must find no import, spawn, or shell reference to the
  new adapter/runtime/CLI from existing production files.
- `rlbriefroute.js` remains deliberately absent from the public runtime graph
  and is declared in `site-exclusions.json` as a Node/shadow-only module with
  no public runtime consumer. No other exclusion entry may change.

### Shared Infrastructure Impact Sweep

- `scripts/brief-author.mjs` is a protected shared process boundary. Scope 01
  adds a consumer but does not edit the boundary.
- Canary assertions cover its frozen stdin request, matching stdout response,
  timeout and output limits, `shell: false`, and powerless capability ledger.
- Existing caller order, public payload shape, scheduler occurrence state,
  source acquisition, and publication state must remain unchanged.
- Rollback removes the four new source modules, two new test modules, the
  Feature 030 selftest registration, the additive shadow-policy members, and
  only the `rlbriefroute.js` exclusion entry. Because production has no
  consumer, rollback does not move a pointer, replay authoring, or alter
  history.
- The independent real-endpoint canaries validate each external dependency
  path. The functional suite validates the protected process contract without
  modifying the shared boundary itself.

### Test Plan

| ID | DoD ID | Scenario | Test type | Category | Planned file or location | Exact test title or assertion | Exact command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | DOD-01-TP-01-01 | SCN-030-001, SCN-030-002, SCN-030-003 | unit | unit | `scripts/selftest.mjs` | Feature 030 shadow policy, transport-contract, authority, and receipt group validates both profiles and every pure fail-loud boundary | `node scripts/selftest.mjs` | No |
| TP-01-02 | DOD-01-TP-01-02 | SCN-030-001 | functional | functional | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP` | `node --test --test-name-pattern "Regression: SCN-030-001" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI with an ephemeral real HTTP server |
| TP-01-03 | DOD-01-TP-01-03 | SCN-030-002 | functional | functional | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-002 exact model preflight precedes one bounded strict JSON completion` | `node --test --test-name-pattern "Regression: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI with an ephemeral real HTTP server |
| TP-01-04 | DOD-01-TP-01-04 | SCN-030-001, SCN-030-002 | e2e-api | integration | `tests/brief-openai-compatible-adapter.integration.mjs` | `Regression E2E: SCN-030-002 OMLX returns tiny strict JSON with truthful usage state` | `BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 node --test --test-name-pattern "Regression E2E: SCN-030-002 OMLX" tests/brief-openai-compatible-adapter.integration.mjs` | Yes; actual OMLX endpoint from `BRIEF_OMLX_BASE_URL` |
| TP-01-05 | DOD-01-TP-01-05 | SCN-030-001, SCN-030-002 | e2e-api | integration | `tests/brief-openai-compatible-adapter.integration.mjs` | `Regression E2E: SCN-030-002 Ollama returns tiny strict JSON with truthful usage state` | `BRIEF_SHADOW_PROFILE=ollama-openai-compatible node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/brief-openai-compatible-adapter.integration.mjs` | Yes; actual Ollama endpoint from `BRIEF_OLLAMA_BASE_URL` and model from `BRIEF_OLLAMA_MODEL` |
| TP-01-06 | DOD-01-TP-01-06 | SCN-030-002 | stress | stress | `tests/brief-openai-compatible-adapter.functional.mjs` | `Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one` | `node --test --test-name-pattern "Stress: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production adapter and ephemeral real HTTP server |
| TP-01-07 | DOD-01-TP-01-07 | SCN-030-003 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels` | `node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI and real process/filesystem state |
| TP-01-08 | DOD-01-TP-01-08 | SCN-030-003 | contract-regression | integration | `scripts/validate-brief-payload.mjs` | Current committed public payload remains valid and does not consume shadow output | `node scripts/validate-brief-payload.mjs` | No |

#### Gherkin-To-Test Mapping

- `SCN-030-001` maps to TP-01-01 and TP-01-02.
- `SCN-030-002` maps to TP-01-03 through TP-01-06. TP-01-04 and TP-01-05
  are the real-provider proofs; TP-01-03 and TP-01-06 cannot substitute for
  them.
- `SCN-030-003` maps to TP-01-07 and TP-01-08. TP-01-07 must snapshot and
  compare protected bytes, tracked publication artifacts, Git index/worktree
  state, scheduler receipt, stdout, and stderr around a shadow invocation.

#### Impact-Aware Validation

The project config defines `codeIndex.adapter: codegraph` but no `testImpact`
map and no `traceContracts`. Scope 01 therefore declares no generated impact
categories or observability workflow. The focused order is TP-01-01,
TP-01-02/03/06/07, TP-01-04/05, TP-01-08, then the complete
`node scripts/selftest.mjs` regression already represented by TP-01-01.

#### Test Mechanisms And Negative Controls

| Scenario | Behavior traits | Required obligations | Production owners | Mechanism | Negative control |
| --- | --- | --- | --- | --- | --- |
| SCN-030-001 | pure-calculation, degraded-state, runtime-config | transformed-output assertion; named refusal; configured value exercised at runtime | `rlbriefroute.js`; `scripts/brief-route-runtime.mjs`; `market-brief.config.json` | production CLI; synthetic fixture; returned value; ephemeral-real dependency path | Remove or corrupt the selected profile and prove zero HTTP requests plus `B030-SHADOW-PROFILE` or `B030-ADAPTER-CONFIG` |
| SCN-030-002 | api-contract, dependency-path, sla-sensitive, runtime-config | real request/response; live provider boundary; exact finite bound assertion; configured model exercised | `scripts/brief-openai-compatible-adapter.mjs`; `scripts/brief-route-runtime.mjs`; `scripts/brief-shadow-generate.mjs` | production CLI; live-provider input; HTTP response; external-live dependency path | Remove the exact model from `/v1/models`, exceed each finite limit by one, and prove chat is never called or is cancelled with no second provider |
| SCN-030-003 | degraded-state, runtime-config, static-metadata | named refusal; configured profile exercised; artifact assertion over the protected consumer inventory | `scripts/brief-author.mjs`; `scripts/brief-shadow-generate.mjs`; `scripts/brief-narrative-parallel.mjs`; `scripts/brief-refresh-and-push.sh`; `scripts/brief-refresh-scheduled.sh` | production CLI; synthetic fixture; persisted-state byte comparison; same-origin-real dependency path | Add a publication-shaped flag or secret sentinel and prove the CLI refuses or the containment assertion fails before any tracked byte or Git state changes |

### Planning Assumptions And Owner Records

- The design-approved profile IDs are authoritative for this slice. Shorter
  aliases are not introduced because an alias would add a second selector name
  for the same adapter.
- Current endpoint availability is diagnostic context only. Each requested
  canary must establish availability again through the exact runtime binding.
- The complete 30-run corpus, comparative rubric, additional hosted/frontier
  adapters, stage priorities, and live cutover require the owner records named
  in design.md before they can enter an active execution scope.

### Definition of Done

#### Core Implementation

- [ ] The four planned source modules and additive shadow policy implement
  S01-R01 through S01-R14 without editing an excluded implementation path.
- [ ] OMLX and Ollama differ only by explicit profile configuration and usage
  mapping while sharing one transport and validator path.
- [ ] `brief-author.mjs` request/response and powerless process contracts remain
  unchanged and are exercised by the shadow runtime.
- [ ] The shadow CLI has no production consumer and cannot publish, write
  tracked files, mutate Git, choose another provider, or alter policy/budget.
- [ ] The Consumer Impact Sweep proves zero existing production imports,
  spawns, shell calls, or config reads for the new shadow modules and variables.
- [ ] The Shared Infrastructure Impact Sweep proves protected process and
  scheduler contracts through independent canaries, with the removal path
  verified before broad regression checks.
- [ ] The Change Boundary is respected and every excluded path remains
  byte-identical.
- [ ] `site-exclusions.json` contains only the authorized `rlbriefroute.js`
  change for Scope 01, records its Node/shadow-only status and absent public
  runtime consumer, and leaves every other exclusion entry byte-identical.

#### Test Plan Parity

- [ ] DOD-01-TP-01-01: TP-01-01 passes: pure shadow policy, profile, capability, finite-limit,
  and receipt contract checks cover SCN-030-001.
- [x] DOD-01-TP-01-02: TP-01-02 passes for SCN-030-001: explicit profile and runtime-binding failures refuse
  before HTTP and cover SCN-030-001.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern "Regression: SCN-030-001" tests/brief-openai-compatible-adapter.functional.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-02-scn-030-001-functional)
  - **Output:**

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
- [x] DOD-01-TP-01-03: TP-01-03 passes for SCN-030-002: exact model preflight, strict JSON completion, byte
  limits, deadline, cancellation, usage normalization, and no provider switch
  cover SCN-030-002 on the functional boundary.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern "Regression: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-03-scn-030-002-functional)
  - **Output:**

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
- [ ] DOD-01-TP-01-04: TP-01-04 passes against the actual explicitly configured OMLX endpoint
  and records a tiny strict-JSON result plus measured-or-unmeasured usage state.
- [x] DOD-01-TP-01-05: TP-01-05 passes against the actual explicitly configured Ollama endpoint
  and records a tiny strict-JSON result plus measured-or-unmeasured usage state.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible /opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/brief-openai-compatible-adapter.local-canary.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-05-real-ollama-canary)
  - **Output:**

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
- [x] DOD-01-TP-01-06: TP-01-06 passes: request, response, deadline, retry, and concurrency
  limits refuse at one unit above each finite cap.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 180 /opt/homebrew/bin/node --test --test-name-pattern "Stress: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-06-scn-030-002-stress)
  - **Output:**

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
- [x] DOD-01-TP-01-07: TP-01-07 passes for SCN-030-003: authority state remains byte-identical and secret
  sentinels are absent from transport, output, errors, logs, and receipts.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-07-scn-030-003-authority-containment)
  - **Output:**

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
- [x] DOD-01-TP-01-08: TP-01-08 passes: the current committed public payload remains valid under
  the existing validator and has no shadow-output dependency.
  - **Phase:** implement
  - **Executed:** YES (current session)
  - **Command:** `/opt/local/bin/gtimeout --signal=TERM --kill-after=5s 150 /opt/homebrew/bin/node scripts/validate-brief-payload.mjs`
  - **Exit Code:** 0
  - **Claim Source:** executed
  - **Evidence Ref:** [report.md](report.md#tp-01-08-existing-payload-contract)
  - **Output:**

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

#### Regression And Quality

- [ ] Scenario-specific persistent regression coverage exists for every
  behavior in SCN-030-001, SCN-030-002, and SCN-030-003.
- [ ] The broader regression command `node scripts/selftest.mjs` passes with no
  required test disabled.
- [ ] The exact commands in all eight Test Plan rows run with finite outer
  time limits and preserve complete output or bounded evidence capture.
- [ ] Static secret, authority, and consumer scans report no credential field,
  production consumer, publication action, Git mutation, or endpoint value in
  the new shadow path.
- [ ] `git diff --check` passes for every changed path and changed-path
  classification contains only this scope's allowed implementation and
  planning artifacts.
- [ ] Feature artifact lint, scenario obligation lint, test mechanism lint,
  scenario test resolution, and Test Plan parity checks pass without a bypass.
- [ ] Documentation and policy text describe Scope 01 as non-authoritative
  groundwork and make no quality, savings, promotion, publication, or completed
  implementation claim.
