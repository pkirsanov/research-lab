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
- `verifyAuthorRequestFingerprint(request) -> verified request or B030 refusal`
- `qualifyOpenAICompatibleModel(profile, signal) -> exact model capability or refusal`
- `buildAuthorResponseSchema(authorRequest) -> strict schema for one frozen response envelope`
- `invokeOpenAICompatibleChat(profile, authorRequest, signal) -> author response plus usage receipt`
- `brief-shadow-generate` stdin: one frozen `brief-author.mjs` request envelope
- `brief-shadow-generate` stdout: safe non-authoritative JSON containing the
  matching author response envelope and normalized usage receipt

### Validation Checkpoints

- **Checkpoint A:** Pure contract checks reject missing or unknown profiles,
  invalid runtime bindings, invalid capability records, unsafe token integers,
  overflowing token sums, and numeric zero used for absent measurements before
  transport work begins.
- **Checkpoint B:** A real loopback HTTP server exercises `/v1/models` and
  `/v1/chat/completions` through the production adapter. It proves exact model
  admission, a provider-neutral schema-constrained JSON object, downstream
  strict validation, byte limits, cancellation, deadlines, concurrency, no
  provider switching, safe receipts, and canonical request-fingerprint
  verification before every process, transport, and HTTP boundary.
- **Checkpoint C:** One operator-configured OMLX invocation and one
  operator-configured Ollama invocation have current implementation evidence
  against their actual endpoints. Each proves transport compatibility only.
  After both security fixes pass their provider-free RED/GREEN commands,
  independent verification must rerun both requested canaries with requests
  produced by the canonical builders and treat an unavailable endpoint as a
  failure.
- **Checkpoint D:** Authority-containment checks compare protected artifact,
  Git, and scheduler state before and after shadow invocation. The public
  payload validator and complete project selftest then run unchanged.

### Current Planning Handoff

- Existing passing evidence remains linked for unaffected Test Plan rows.
  Evidence for usage normalization, request-integrity enforcement, affected
  aggregate checks, and both provider canaries is invalidated by
  `F030-SEC-01` and `F030-SEC-02` until the revised tests pass on fixed bytes.
- Scope 01 remains **In Progress** and needs reverification. Two feature-bound
  bug packets must be created by `bubbles.bug` before `bubbles.implement`
  changes source or tests. Certification remains untouched.
- The shadow CLI remains non-authoritative. It is the only executable consumer
  of the new runtime, and no production entrypoint imports or invokes it.

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
| Active in Scope 01 | FR-030-005, FR-030-007, FR-030-008, FR-030-015, FR-030-016, FR-030-024, FR-030-026 through FR-030-028, FR-030-035, FR-030-036, FR-030-039, FR-030-040; NFR-030-004 through NFR-030-006, NFR-030-008 |
| Inactive route and run control | FR-030-001 through FR-030-004, FR-030-006, FR-030-009 through FR-030-014, FR-030-017 through FR-030-023, FR-030-025; NFR-030-001 through NFR-030-003 |
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
| 01 | OpenAI-compatible shadow author adapter | contract/runtime | true | UMD contracts, Node author/adapter/runtime/CLI, config, tests | 10 | Explicit selection, safe usage, canonical request integrity, bounded real transport, authority containment, unchanged public contracts | In Progress |

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
7. **S01-R07 Schema-constrained completion.** Send one non-streaming
  `/v1/chat/completions` request with the exact configured model, fixed system
  instructions, the frozen author request as data, and a provider-neutral
  schema-constrained JSON object response. Build the strict schema dynamically
  from the frozen request. Select the exact response contract and content key:
  `tool-author-request/v1` maps to `tool-author-response/v1` with `brief`,
  `tool-author-request/v2` maps to `tool-author-response/v2` with `brief`, and
  `final-author-request/v1` maps to `final-author-response/v1` with `final`.
  Fix `contractVersion` and `requestFingerprint` to their expected constants.
  Require exactly those two keys plus the selected content key. Reject
  additional top-level keys. Require the selected content value to be an
  object. `Payload` is only a meta-name for that request-specific `brief` or
  `final` value. It is never a literal response key. Do not
  send tools or grant browsing, shell, file, Git, publication, or network
  authority beyond the selected endpoint. Require HTTP success,
  `finish_reason: "stop"`, the closed OpenAI-compatible choice/message shape,
  schema-conforming candidate content, and a response within all bounds. Pass
  the parsed envelope through the existing downstream strict validator, which
  remains authoritative after transport-level schema enforcement.
8. **S01-R08 Usage truth.** Normalize prompt, completion, and optional total
  token fields only when each present value is a non-negative
  `Number.isSafeInteger`. When prompt and completion are measured, reject
  before addition if prompt exceeds `Number.MAX_SAFE_INTEGER - completion`,
  and reject any unsafe computed sum. Validate a present provider total
  independently as a non-negative safe integer before comparing it with a
  safely computed sum. A missing or `null` provider field becomes
  `unmeasured` with no synthesized zero or total. Provider credits and
  monetary cost are `not-applicable` for these local profiles. Native provider
  response bodies and endpoint URLs do not enter receipts.
9. **S01-R09 Frozen author contract.** Export the additive
  `verifyAuthorRequestFingerprint(request)` from `brief-author.mjs`. It must
  reuse the existing private canonical request projection and stable
  fingerprint algorithm without changing request bytes, contract versions,
  builders, canonical fields, or output bytes. Invoke it before transport
  callbacks or child spawn in `invokeAuthor`, before route dispatch in
  `scripts/brief-route-runtime.mjs`, and before model preflight or HTTP work in
  `scripts/brief-openai-compatible-adapter.mjs`. Retaining the original digest
  while mutating any canonical field (`contractVersion`, `data`, `provider`,
  `model`, `promptPolicy`, `schema`, `validator`, or `maxOutputTokens`) must
  refuse before process, transport, or HTTP dispatch. The route runtime passes
  one frozen request and accepts only its matching response envelope. The
  adapter cannot change provider, policy, budget, evidence refs, capability
  grants, or consequence state.
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
  call the actual runtime endpoint and require a tiny schema-constrained JSON
  object candidate, `finish_reason: "stop"`, downstream strict validation,
  and a valid measured-or-unmeasured usage state. They make no model-quality,
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
Scenario: One bounded transport qualifies the exact model and returns a schema-constrained JSON object
  Given an explicitly selected profile has a valid runtime endpoint and exact configured model
  When the shadow runtime performs preflight and authors the frozen request
  Then it confirms the model through /v1/models before one bounded /v1/chat/completions call and returns the exact contractVersion and requestFingerprint with the request-specific brief or final object value, a stop finish reason, downstream strict validation, and a truthful normalized usage state whose measured token values and computed sum are non-negative safe integers without synthesized missing values

# SCN-030-003
Scenario: Shadow authorship remains non-authoritative and powerless
  Given the current Copilot worker, scheduler, public payload, pointer, history, and Git state are authoritative
  When the shadow CLI processes a frozen author request under either approved profile
  Then the canonical request fingerprint is verified before any process, transport, or HTTP dispatch, and the invocation writes nothing, exposes no secret-shaped value, offers no production action, and leaves every authoritative surface byte-identical
```

### Implementation Plan

1. Add pure UMD validators in `rlbriefroute.js` for shadow policy, profile,
   capability, endpoint-binding metadata, finite limit fields, and normalized
  receipt states. Token fields must reject unsafe integers and overflow before
  addition. Expose only deterministic validation and normalization.
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
  model preflight and chat. Build the provider-neutral strict response schema
  from the frozen author request, enforce the exact three-key response
  envelope with `brief` for tool-author v1/v2 or `final` for final-author v1,
  require the selected value to be an object, and keep the downstream strict
  validator authoritative. Reject over-limit data while reading it, cancel the
  request, and retain no native response body after normalization. Verify the
  canonical author-request fingerprint before model preflight or HTTP work.
5. Add `scripts/brief-route-runtime.mjs`. Resolve exactly one profile from the
   committed policy and allowlisted runtime bindings, freeze its capability,
   invoke the shared adapter through the existing author process contract, and
   validate the matching response and usage receipt. Verify the canonical
   author-request fingerprint before route dispatch.
6. Add `scripts/brief-shadow-generate.mjs`. Accept only the profile option plus
   stdin JSON, invoke the route runtime, and emit one non-authoritative result.
   Keep stdout machine-readable and send sanitized refusal details to stderr.
7. Extend `scripts/selftest.mjs` with pure contract tests extracted from
   `rlbriefroute.js`. Cover both profile records, unknown values, limit edges,
  safe-integer receipt states, overflow rejection, and exact provider/model
  identity.
8. Add `tests/brief-openai-compatible-adapter.functional.mjs`. Run the real
   adapter/runtime/CLI against an ephemeral loopback HTTP server for positive,
  negative, boundary, stress, security, and authority-preservation cases.
  Capture same-command RED and GREEN evidence for unsafe token arithmetic and
  for the eight-field retained-digest mutation matrix at all three dispatch
  boundaries.
9. Add `tests/brief-openai-compatible-adapter.local-canary.mjs`. Run the
   production shadow CLI against exactly one explicitly selected real endpoint
  per test title. Build each request with the canonical author builder. Require
  complete runtime configuration and fail loud when a requested provider is
  unavailable. Run these real-provider canaries after the provider-free
  security regressions are green.

Real-provider canaries are intentionally isolated from
`tests/*.integration.mjs`. They require explicit operator endpoint bindings and
must not make ordinary deterministic integration runs environment-dependent.
Only the provider-specific commands declare `tests/*.local-canary.mjs`.
Each command supplies the selected profile and its required runtime bindings.
Missing configuration fails loud when that provider is requested.

### Implementation Files

- `rlbriefroute.js` - pure shadow policy, capability, and receipt contracts.
- `scripts/brief-author.mjs` - additive canonical fingerprint verifier and
  pre-dispatch verification in `invokeAuthor` only.
- `scripts/brief-openai-compatible-adapter.mjs` - bounded shared transport.
- `scripts/brief-route-runtime.mjs` - selected-profile runtime and receipt path.
- `scripts/brief-shadow-generate.mjs` - the only executable shadow entrypoint.

These are the complete Scope 01 source paths consumed by the implementation
reality scan. The final path is non-authoritative and has no production
consumer. The current Copilot generation and publication entrypoints remain
authoritative and do not import or invoke any path in this list.

### Change Boundary

#### Allowed Implementation Paths

- Create `rlbriefroute.js`.
- Modify `scripts/brief-author.mjs` only to export the additive
  `verifyAuthorRequestFingerprint(request)` over its existing private
  canonicalizer and invoke that verifier before transport callbacks or child
  spawn in `invokeAuthor`.
- Create `scripts/brief-openai-compatible-adapter.mjs`.
- Create `scripts/brief-route-runtime.mjs`.
- Create `scripts/brief-shadow-generate.mjs`.
- Modify only the shadow-policy portion added to `market-brief.config.json`.
- Modify only the `rlbriefroute.js` declaration in `site-exclusions.json`;
  preserve every other exclusion entry byte-for-byte.
- Modify `scripts/selftest.mjs` only to register Feature 030 pure checks.
- Create `tests/brief-openai-compatible-adapter.functional.mjs`.
- Create `tests/brief-openai-compatible-adapter.local-canary.mjs`.

#### Excluded Implementation Paths And Surfaces

- Every existing request builder, request/response contract, canonical request
  projection, and emitted request/output byte in `scripts/brief-author.mjs`
  remains byte-identical except for the additive verifier export and its
  pre-dispatch use in `invokeAuthor`.
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
  authorizes only an additive verifier export and its pre-dispatch call in
  `invokeAuthor`. Existing builders, canonical projection, contracts, and
  emitted request/output bytes remain invariant.
- Independent provider-free canaries exercise the protected boundary with all
  eight canonical fields mutated under a retained digest. They assert refusal
  before a transport callback, child spawn, route dispatch, model preflight, or
  HTTP request. The existing canaries continue to cover frozen stdin, matching
  stdout, timeout and output limits, `shell: false`, and the powerless ledger.
- Existing caller order, public payload shape, scheduler occurrence state,
  source acquisition, and publication state must remain unchanged.
- Rollback removes the additive verifier export and call, removes the four new
  source modules and two new test modules, restores the Feature 030 selftest
  registration and shadow-policy members, and removes only the
  `rlbriefroute.js` exclusion entry. Because production has no shadow consumer,
  rollback does not move a pointer, replay authoring, or alter history.
- The independent real-endpoint canaries validate each external dependency
  path. The functional suite validates the protected process contract without
  modifying the shared boundary itself.

### Test Plan

| ID | DoD ID | Scenario | Test type | Category | Planned file or location | Exact test title or assertion | Exact command | Live system |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-01 | DOD-01-TP-01-01 | SCN-030-001, SCN-030-002, SCN-030-003 | unit | unit | `scripts/selftest.mjs` | Feature 030 shadow policy, dynamic strict response schema, transport-contract, authority, safe-integer receipt, canonical fingerprint, and every pure fail-loud boundary | `node scripts/selftest.mjs` | No |
| TP-01-02 | DOD-01-TP-01-02 | SCN-030-001 | functional | functional | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-001 explicit profile resolves once or refuses before HTTP` | `node --test --test-name-pattern "Regression: SCN-030-001" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI with an ephemeral real HTTP server |
| TP-01-03 | DOD-01-TP-01-03 | SCN-030-002 | functional | functional | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-002 exact model preflight precedes one bounded dynamic-schema completion` | `node --test --test-name-pattern "Regression: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI with an ephemeral real HTTP server |
| TP-01-04 | DOD-01-TP-01-04 | SCN-030-001, SCN-030-002 | e2e-api | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | `Regression E2E: SCN-030-002 OMLX returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state` using a canonically built and verified request | `/usr/bin/env BRIEF_SHADOW_PROFILE=omlx-openai-compatible-qwen38 BRIEF_OMLX_BASE_URL="${BRIEF_OMLX_BASE_URL:?required for OMLX canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 OMLX" tests/*.local-canary.mjs` | Yes; actual OMLX endpoint from `BRIEF_OMLX_BASE_URL`; final post-fix canary |
| TP-01-05 | DOD-01-TP-01-05 | SCN-030-001, SCN-030-002 | e2e-api | integration | `tests/brief-openai-compatible-adapter.local-canary.mjs` | `Regression E2E: SCN-030-002 Ollama returns the schema-fixed envelope, object payload, stop finish reason, and truthful usage state` using a canonically built and verified request | `/usr/bin/env BRIEF_SHADOW_PROFILE=ollama-openai-compatible BRIEF_OLLAMA_BASE_URL="${BRIEF_OLLAMA_BASE_URL:?required for Ollama canary}" BRIEF_OLLAMA_MODEL="${BRIEF_OLLAMA_MODEL:?required for Ollama canary}" node --test --test-name-pattern "Regression E2E: SCN-030-002 Ollama" tests/*.local-canary.mjs` | Yes; actual Ollama endpoint from `BRIEF_OLLAMA_BASE_URL` and model from `BRIEF_OLLAMA_MODEL`; final post-fix canary |
| TP-01-06 | DOD-01-TP-01-06 | SCN-030-002 | stress | stress | `tests/brief-openai-compatible-adapter.functional.mjs` | `Stress: SCN-030-002 finite byte deadline retry and concurrency limits refuse at cap plus one` | `node --test --test-name-pattern "Stress: SCN-030-002" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production adapter and ephemeral real HTTP server |
| TP-01-07 | DOD-01-TP-01-07 | SCN-030-003 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Regression: SCN-030-003 shadow invocation preserves authority and excludes secret sentinels` | `node --test --test-name-pattern "Regression: SCN-030-003" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; production CLI and real process/filesystem state |
| TP-01-08 | DOD-01-TP-01-08 | SCN-030-003 | contract-regression | integration | `scripts/validate-brief-payload.mjs` | Current committed public payload remains valid and does not consume shadow output | `node scripts/validate-brief-payload.mjs` | No |
| TP-01-09 | DOD-01-TP-01-09 | SCN-030-002 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage` | RED and GREEN: `node --test --test-name-pattern "Security regression: SCN-030-002 unsafe token counts and overflow refuse before normalized usage" tests/brief-openai-compatible-adapter.functional.mjs` | No; provider-free production normalizer |
| TP-01-10 | DOD-01-TP-01-10 | SCN-030-003 | functional | security | `tests/brief-openai-compatible-adapter.functional.mjs` | `Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch` | RED and GREEN: `node --test --test-name-pattern "Security regression: SCN-030-003 retained request fingerprint mutation refuses before process transport or HTTP dispatch" tests/brief-openai-compatible-adapter.functional.mjs` | Yes; provider-free production boundaries with spawn, callback, and loopback request counters |

#### Gherkin-To-Test Mapping

- `SCN-030-001` maps to TP-01-01 and TP-01-02.
- `SCN-030-002` maps to TP-01-03 through TP-01-06 and TP-01-09. TP-01-09
  provides provider-free RED/GREEN proof for safe-integer and overflow
  semantics. TP-01-04 and TP-01-05 are the final real-provider proofs;
  provider-free rows cannot substitute for them.
- `SCN-030-003` maps to TP-01-07, TP-01-08, and TP-01-10. TP-01-10 executes
  the retained-digest mutation matrix for all eight canonical request fields
  through `invokeAuthor`, route dispatch, and adapter dispatch before process,
  callback, or HTTP work. TP-01-07 must snapshot and
  compare protected bytes, tracked publication artifacts, Git index/worktree
  state, scheduler receipt, stdout, and stderr around a shadow invocation.

#### Impact-Aware Validation

The project config defines `codeIndex.adapter: codegraph` but no `testImpact`
map and no `traceContracts`. Scope 01 therefore declares no generated impact
categories or observability workflow. The focused order is TP-01-09 and
TP-01-10 RED, implementation, TP-01-09 and TP-01-10 GREEN, TP-01-01,
TP-01-02/03/06/07, TP-01-08, and finally TP-01-04/05 against the two actual
providers. The complete `node scripts/selftest.mjs` regression is represented
by TP-01-01.

#### Test Mechanisms And Negative Controls

| Scenario | Behavior traits | Required obligations | Production owners | Mechanism | Negative control |
| --- | --- | --- | --- | --- | --- |
| SCN-030-001 | pure-calculation, degraded-state, runtime-config | transformed-output assertion; named refusal; configured value exercised at runtime | `rlbriefroute.js`; `scripts/brief-route-runtime.mjs`; `market-brief.config.json` | production CLI; synthetic fixture; returned value; ephemeral-real dependency path | Remove or corrupt the selected profile and prove zero HTTP requests plus `B030-SHADOW-PROFILE` or `B030-ADAPTER-CONFIG` |
| SCN-030-002 | pure-calculation, api-contract, dependency-path, sla-sensitive, runtime-config | safe-integer transformed-output assertion; real request/response; live provider boundary; exact dynamic schema and finite bound assertions; configured model exercised | `rlbriefroute.js`; `scripts/brief-openai-compatible-adapter.mjs`; `scripts/brief-route-runtime.mjs`; `scripts/brief-shadow-generate.mjs` | production normalizer and CLI; provider-free fixture plus live-provider input; returned usage and HTTP response; external-live dependency path | Retain the previous rounded total while supplying an unsafe token integer; overflow prompt plus completion; unsafe provider total; missing and `null` fields; malformed response shapes; absent exact model; finite limit plus one; prove refusal before unsafe arithmetic or bounded cancellation with no second provider |
| SCN-030-003 | pure-calculation, degraded-state, dependency-path, runtime-config, static-metadata | canonical fingerprint transformed-output assertion; named pre-dispatch refusal; all-boundary dispatch counters; configured profile exercised; artifact assertion over the protected consumer inventory | `scripts/brief-author.mjs`; `scripts/brief-route-runtime.mjs`; `scripts/brief-openai-compatible-adapter.mjs`; `scripts/brief-shadow-generate.mjs`; `scripts/brief-narrative-parallel.mjs`; `scripts/brief-refresh-and-push.sh`; `scripts/brief-refresh-scheduled.sh` | production verifier and CLI; synthetic mutation matrix; callback, child-spawn, and loopback HTTP counters; persisted-state byte comparison; same-origin-real dependency path | Retain the original digest while mutating each of `contractVersion`, `data`, `provider`, `model`, `promptPolicy`, `schema`, `validator`, and `maxOutputTokens`; require refusal before all process, transport, and HTTP counters; also prove publication-shaped options and secret sentinels cannot mutate authoritative state |

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

- [x] The four planned shadow source modules, the additive author-request
  verifier, and the additive shadow policy implement S01-R01 through S01-R14
  without editing an excluded implementation path.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** [Security Bug Implementation Reconciliation](report.md#security-bug-implementation-reconciliation---2026-09-03) records both exact RED/GREEN sequences and the complete functional suite.
- [x] OMLX and Ollama differ only by explicit profile configuration and usage
  mapping while sharing one transport and validator path. → Evidence: [DOD-01-TP-01-01 current implementation reconciliation](report.md#dod-01-tp-01-01-current-implementation-reconciliation)
- [x] `brief-author.mjs` preserves every existing request builder, contract,
  canonical projection, and emitted request/output byte except for the additive
  verifier export and its pre-dispatch use in `invokeAuthor`.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Current-versus-`HEAD` canonical builder bytes and fingerprints matched for tool-v1, tool-v2, and final-v1; capture `4a7c13b6efc2f0617b302fcceef399241d02db0054f1c90e5c5ed8b474f61e7f`.
- [x] The shadow CLI has no production consumer and cannot publish, write
  tracked files, mutate Git, choose another provider, or alter policy/budget. → Evidence: [Core powerless shadow CLI](report.md#core-powerless-shadow-cli)
- [x] The Consumer Impact Sweep proves zero existing production imports,
  spawns, shell calls, or config reads for the new shadow modules and variables. → Evidence: [Core Consumer Impact Sweep](report.md#core-consumer-impact-sweep)
- [x] The Shared Infrastructure Impact Sweep proves the protected author
  process boundary through the eight-field mutation matrix, independent
  canaries, and the bounded removal path before broad regression checks.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** TP-01-10 passed for eight fields at all three dispatch boundaries, and all 11 established author-boundary tests passed; see [F030-SEC-02](report.md#f030-sec-02).
- [x] The revised Change Boundary is respected, every excluded path remains
  byte-identical, and `scripts/brief-author.mjs` changes only at the authorized
  verifier export and `invokeAuthor` call sites.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Strict parent/bug work-boundary capture `149717e2bbd52b646b3273b0b6ed84d47c8e5b21bb6d80e3fe017427d46989a7`, builder byte comparison `4a7c13b6efc2f0617b302fcceef399241d02db0054f1c90e5c5ed8b474f61e7f`, and [Final Repository Boundary](report.md#final-repository-boundary).
- [x] `site-exclusions.json` contains only the authorized `rlbriefroute.js`
  change for Scope 01, records its Node/shadow-only status and absent public
  runtime consumer, and leaves every other exclusion entry byte-identical. → Evidence: [Core site exclusion additive boundary](report.md#core-site-exclusion-additive-boundary)

#### Test Plan Parity

- [ ] DOD-01-TP-01-01: TP-01-01 passes with safe-integer usage and canonical
  fingerprint checks alongside the existing pure shadow policy, profile,
  capability, schema, finite-limit, and authority checks.
  > **Uncertainty Declaration**
  > **What was attempted:** No revised selftest command was executed because the required security assertions are absent.
  > **What was observed:** [Prior TP-01-01 evidence](report.md#dod-01-tp-01-01-current-implementation-reconciliation) predates `F030-SEC-01` and `F030-SEC-02`.
  > **Why this is uncertain:** A passing old selftest cannot prove the new negative controls.
  > **What would resolve this:** Add the planned assertions and run `node scripts/selftest.mjs` on fixed bytes.
- [x] DOD-01-TP-01-02: TP-01-02 passes for SCN-030-001: explicit profile and runtime-binding failures refuse
  before HTTP and cover SCN-030-001. → Evidence: [DOD-01-TP-01-02 current implementation reconciliation](report.md#dod-01-tp-01-02-current-implementation-reconciliation)

- [x] DOD-01-TP-01-03: TP-01-03 passes for SCN-030-002: exact model preflight, the dynamic
  strict schema fixes both identity fields and the exact three-key object
  envelope, `finish_reason` is `stop`, the downstream strict validator accepts
  the candidate, and byte limits, deadline, cancellation, usage normalization,
  safe-integer arithmetic, canonical request verification, and no provider
  switch hold on the functional boundary.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** The complete post-fix functional file passed all 6 tests with no skips, capture `73dd73d41d56dcf4271cf60efd79e5ea3cd9108df5069bcdd941c6bc5ea52388`.
  - **Historical evidence for the superseded generic strict-JSON contract:**
    Retained verbatim below. It does not satisfy revised S01-R07.
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

- [x] DOD-01-TP-01-04: TP-01-04 passes last against the actual explicitly configured OMLX endpoint
  and records the schema-fixed identity fields, exact three-key envelope,
  object payload, stop finish reason, downstream strict-validation result, and
  measured-or-unmeasured safe-integer usage state from a canonically built and
  verified request.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Final builder-generated OMLX canary passed under the required finite bounds, capture `a8ebaaea00d344f5806fa3b470a15199adbc06f5ca01292cdca0c33f4d976aa7`.
- [x] DOD-01-TP-01-05: TP-01-05 passes last against the actual explicitly configured Ollama endpoint
  and records the schema-fixed identity fields, exact three-key envelope,
  object payload, stop finish reason, downstream strict-validation result, and
  measured-or-unmeasured safe-integer usage state from a canonically built and
  verified request.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Final builder-generated Ollama canary passed under the required finite bounds, capture `09791d35e6ee1d14efce5bcc20e9259e0e6376df6e2b669cb232f5457c4bea7a`.
  - **Historical evidence for the superseded generic strict-JSON contract:**
    Retained verbatim below. It does not satisfy revised S01-R07.
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
  limits refuse at one unit above each finite cap. → Evidence: [DOD-01-TP-01-06 current implementation reconciliation](report.md#dod-01-tp-01-06-current-implementation-reconciliation)

- [x] DOD-01-TP-01-07: TP-01-07 passes for SCN-030-003: authority state remains byte-identical and secret
  sentinels are absent from transport, output, errors, logs, and receipts. → Evidence: [DOD-01-TP-01-07 current implementation reconciliation](report.md#dod-01-tp-01-07-current-implementation-reconciliation)

- [x] DOD-01-TP-01-08: TP-01-08 passes: the current committed public payload remains valid under
  the existing validator and has no shadow-output dependency. → Evidence: [DOD-01-TP-01-08 current implementation reconciliation](report.md#dod-01-tp-01-08-current-implementation-reconciliation)

- [x] DOD-01-TP-01-09: TP-01-09 captures same-command RED then GREEN proof
  that every present token count is a non-negative safe integer, prompt plus
  completion cannot overflow, a present provider total is independently safe,
  and missing or `null` fields remain unmeasured without synthesized values.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Exact RED capture `d70a3ef787c2505d9816b4610fd55dc7f9e8d12e0403053f48631e40c1e3a4f0`; exact GREEN capture `68e7050d53bf8cd21c57b3358d820e027884ee40a5551e14662b8ec8dd2c1241`.
- [x] DOD-01-TP-01-10: TP-01-10 captures same-command RED then GREEN proof
  that retaining a digest while mutating each canonical field refuses before
  `invokeAuthor` process/transport work, route dispatch, and adapter model/HTTP
  work.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Exact RED capture `a355f2d551cff67f17a555f3d82eaee540e50bf03a0a12de6c96d45f2e9c22da`; exact GREEN capture `0f08ca473558f5998247749534cb4387be0543c5fd8e2fdcc377211e913af0d2`.

#### Regression And Quality

- [x] Scenario-specific persistent regression coverage exists for every
  behavior in SCN-030-001, SCN-030-002, and SCN-030-003, including both
  confirmed security defects.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Scenario resolver resolved all 14 links, traceability mapped all 3 scenarios, and both exact security rows passed; see [Post-Fix Verification](report.md#post-fix-verification).
- [ ] The broader regression command `node scripts/selftest.mjs` passes with no
  required test disabled after both security regressions are registered.
  > **Uncertainty Declaration**
  > **What was attempted:** The complete selftest ran after both security regressions and their selftest assertions were registered.
  > **What was observed:** All 9 Feature 030 assertions passed, but the command exited 1 because an unrelated operations packet references three missing test files.
  > **Why this is uncertain:** A nonzero complete command cannot establish repository-wide regression success.
  > **What would resolve this:** The operations packet owner must supply or reconcile its three referenced tests, then bubbles.test must rerun the complete selftest.
- [ ] The exact commands in all ten Test Plan rows run with finite outer time
  limits and preserve complete output or bounded evidence capture.
  > **Uncertainty Declaration**
  > **What was attempted:** The eight prior commands were retained and two exact finite commands were added.
  > **What was observed:** [Prior eight-row evidence](report.md#eight-row-finite-evidence-audit) contains no execution for TP-01-09 or TP-01-10.
  > **Why this is uncertain:** Ten-row command parity cannot be claimed from eight-row execution.
  > **What would resolve this:** Execute all ten planned commands in the prescribed order with finite supervision.
- [x] Static secret, authority, and consumer scans report no credential field,
  production consumer, publication action, Git mutation, or endpoint value in
  the new shadow path. → Evidence: [Static secret authority consumer boundary](report.md#static-secret-authority-consumer-boundary)
- [x] `git diff --check` passes for every changed path and changed-path
  classification contains only the revised scope boundary, including the
  narrow `scripts/brief-author.mjs` authorization.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Final boundary capture `3c0cc5daa613a8a83894ea0d6eb62668103ef6f9b967baeb3c08a87006979910` reported `GIT_DIFF_CHECK=PASS`, zero unexpected paths, unchanged protected bytes, and unchanged BUG-022 diff.
- [x] Feature artifact lint, scenario obligation lint, test mechanism lint,
  scenario test resolution, and Test Plan parity checks report their exact
  post-rework outcomes without a bypass.
  > **Phase:** implement. **Claim Source:** executed. **Evidence:** Artifact lint, 14-link scenario resolution, traceability, structured parity, and implementation reality checks passed; see [Post-Fix Verification](report.md#post-fix-verification).
- [x] Documentation and policy text describe Scope 01 as non-authoritative
  groundwork and make no quality, savings, promotion, publication, or completed
  implementation claim. → Evidence: [Non-Authoritative Groundwork Claims](report.md#non-authoritative-groundwork-claims)
