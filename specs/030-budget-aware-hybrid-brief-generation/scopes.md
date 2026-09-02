# Feature 030 - Budget-Aware Hybrid Brief Generation - Scopes

Links: [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

Planning status: all scopes are `Not Started`. This plan records required work and proof. It makes no implementation, test, publication, quality, or cost claim.

## Execution Outline

### Phase Order

1. **Scope 01 - Route and Budget Foundation:** Add the provider-neutral UMD contracts, deterministic materiality and route planner, complete budget arithmetic, adapter qualification, and one real `runBriefRefresh` stage path.
2. **Scope 02 - Exact Reuse and Recovery:** Invoke Feature 002 reuse before planning, establish stable run/stage/occurrence identities, and resume only unresolved work.
3. **Scope 03 - Failure-Safe Settlement and Publication:** Settle normalized usage, fail loud on route/output/budget defects, and preserve the current publication pointer and append-only history.
4. **Scope 04 - Inert Evidence and Shadow Evaluation:** Enforce the prompt-injection and private-data boundary, compare at least 30 frozen runs, and block promotion on any critical honesty regression.
5. **Scope 05 - Atomic Cutover and Reader Continuity:** Move both operator entry paths to `runBriefRefresh`, remove the global-model production path after consumer trace, and prove the prior validated brief remains readable after generation failure.

### New Types And Signatures

- `rlbriefroute.js`: UMD exports for policy validation, materiality classification, route selection, resource reservation/settlement, canonical identities, and receipt validation.
- `brief-generation-policy/v1`: closed stage graph, route classes, materiality rules, budget/retry profiles, adapter references, shadow policy, and retention policy.
- `model-route-capability/v1`: provider-neutral stage, privacy, context, output, cancellation, and measurable-dimension capabilities.
- `stage-intent/v1 -> stage-plan/v1 | refusal`: one frozen semantic intent resolves exactly one route or refuses before dispatch.
- `materiality-decision/v1`: `unchanged | routine | material | conflicted | prohibited` with ordered deterministic rule evidence.
- `budget-reservation/v1`: complete twelve-dimension worst-case reservation with atomic debit and release.
- `stage-execution-receipt/v1` and `generation-usage-receipt/v1`: measured, unmeasured, and not-applicable usage states without prompt or provider-secret content.
- `scripts/brief-route-runtime.mjs`: adapter registry, frozen capability preflight, bounded dispatch/cancellation, and normalized usage mapping.
- `scripts/brief-shadow-evaluate.mjs`: immutable baseline/candidate comparison with no publication authority.
- Existing `runBriefRefresh(...)`: gains reuse, materiality, route planning, reservation, dispatch, settlement, and pointer-safe publication in the design's closed order.

### Validation Checkpoints

- **After Scope 01:** focused route, materiality, budget, adapter-boundary, configuration, and existing selftest checks must pass before reuse work starts.
- **After Scope 02:** exact-reuse and interruption matrices must prove zero repeated accepted work before settlement and publication failure paths are added.
- **After Scope 03:** every injected route, usage, contract, and publication failure must preserve the current pointer before shadow evaluation can consume candidate outputs.
- **After Scope 04:** the frozen-corpus evaluator must expose every critical regression and withhold undersampled rates before production entry paths change.
- **After Scope 05:** scheduled and on-demand cutover, stale-consumer trace, public reader continuity, payload validation, and the full repository selftest form the final delivery checkpoint.

### Ordering Rationale

Scope 01 is tagged `foundation:true` because every adapter, run stage, receipt, and evaluator consumes its closed contracts. Scope 02 establishes idempotency before failure handling. Scope 03 proves failure atomicity before Scope 04 spends against a shadow corpus. Scope 05 changes live entry paths only after all routed behavior and promotion evidence are independently checkable. Each scope depends on the preceding scope, so no later scope is eligible while an earlier scope remains incomplete.

## Scope Inventory

| # | Scope | Surfaces | Scenario contracts | Depends On | Status |
| --- | --- | --- | --- | --- | --- |
| 01 | Route and Budget Foundation | UMD policy module, config, Node adapter runtime, brief orchestrator | SCN-030-002, SCN-030-003, SCN-030-004 | None | Not Started |
| 02 | Exact Reuse and Recovery | Feature 002 reuse, run graph, stage identities, resume | SCN-030-001, SCN-030-009 | 01 | Not Started |
| 03 | Failure-Safe Settlement and Publication | budget ledger, receipts, validators, immutable artifacts, pointer | SCN-030-005, SCN-030-006, SCN-030-008 | 02 | Not Started |
| 04 | Inert Evidence and Shadow Evaluation | evidence projection, security boundary, frozen corpus evaluator | SCN-030-007, SCN-030-010, SCN-030-011 | 03 | Not Started |
| 05 | Atomic Cutover and Reader Continuity | scheduled/on-demand scripts, legacy closure, static brief reader | SCN-030-012 | 04 | Not Started |

## Scope 01: Route And Budget Foundation

**Status:** Not Started
**Priority:** P0
**Depends On:** None
**Foundation:** true
**Requirements:** FR-030-001 through FR-030-015, FR-030-021 through FR-030-026; NFR-030-002, NFR-030-004, NFR-030-005, NFR-030-008
**Outcome Contribution:** Route each unresolved semantic stage through the least costly eligible frozen route while enforcing materiality, privacy, capability, and complete hard budgets.

### Gherkin Scenarios

#### SCN-030-002 - Routine Evidence Avoids Frontier Synthesis

```gherkin
Scenario: A routine change uses an economical eligible route
  Given admissible evidence changed without a material conflict
  When the brief is generated
  Then no frontier request occurs and all publication checks still apply
```

#### SCN-030-003 - Material Evidence Earns One Frontier Request

```gherkin
Scenario: A material conflict receives one bounded synthesis
  Given deterministic analysis identifies a material evidence conflict
  When the run reaches synthesis
  Then exactly one frontier request may occur against a bounded projection
```

#### SCN-030-004 - Unmeasurable Configured Cost Blocks Dispatch

```gherkin
Scenario: A configured limit must be enforceable
  Given a selected paid route cannot measure a configured cost dimension
  When pre-dispatch admission evaluates the route
  Then the run refuses before any provider request
```

### Implementation Plan

1. Create `rlbriefroute.js` as the pure UMD authority for the versioned policy, stage-intent, stage-plan, materiality, resource-vector, reservation, identity, and receipt contracts from design sections 4, 7, 8, 9, and 10.
2. Extend `market-brief.config.json` with the required `brief-generation-policy/v1` groups. Require every member and all twelve resource dimensions. Reject unknown versions, missing members, duplicate route ordinals, secret-shaped adapter fields, and non-integer budget values.
3. Create `scripts/brief-route-runtime.mjs` for non-secret adapter registration, frozen capability preflight, bounded process or optional local-compatible dispatch, cancellation, and normalized usage mapping. Keep provider/model identity in adapter configuration and receipts, outside domain intents.
4. Extend `scripts/brief-author.mjs` to accept one frozen stage plan and return a candidate plus normalized receipt while preserving separate instructions, bounded JSON input/output, hard timeout, `shell: false`, and no web, shell, repository-write, publication, or provider-selection authority.
5. Extend `scripts/brief-refresh.mjs` so one unresolved stage reaches materiality, route planning, complete reservation, the selected adapter, deterministic output validation, and settlement. Keep deterministic stages model-free and keep source text/model prose out of planner inputs.
6. Emit the safe structured events declared in design section 18. Record only identifiers, counts, route classes, states, integer usage, costs, and digests.

### Shared Infrastructure Impact Sweep

- **Protected surfaces:** `market-brief.config.json`, `scripts/brief-refresh.mjs`, and `scripts/brief-author.mjs` are shared by scheduled, on-demand, Feature 002, Feature 019, Feature 026, validation, and static-reader workflows.
- **Contracts to preserve:** registry/source completeness, owner model outputs, author process isolation, output byte limits, all-source ordering, canonical JSON identities, payload shape, and the no-account build-free product boundary.
- **Independent canary:** run the existing `node scripts/selftest.mjs` before the Feature 030 focused tests and again after them. A Feature 030 test cannot certify its own shared setup.
- **Restore path:** preserve the prior config and run/publisher contract as Git-tracked inputs. A failed foundation change restores those exact files while leaving current publication objects and pointers untouched.

### Change Boundary

- **Allowed:** `rlbriefroute.js`, `market-brief.config.json`, `scripts/brief-route-runtime.mjs`, `scripts/brief-refresh.mjs`, `scripts/brief-author.mjs`, Feature 030 tests, and Feature 030 planning/evidence artifacts.
- **Excluded:** browser pages, registry tools, owning financial models, Feature 019 topic policy, Feature 026 output caps, provider credentials/endpoints, package manifests, deployment surfaces, and sibling feature artifacts.

### Test Plan

| Test Type | Test ID | Category | Scenario | Planned file | Exact planned test identity | Command | Live system | DoD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unit | TP-030-01-01 | unit | SCN-030-002 | `tests/distributed-briefs.final.unit.mjs` | `routine materiality selects an economical eligible route and rejects frontier` | `node --test tests/distributed-briefs.final.unit.mjs` | No | DOD-030-01-01 |
| Unit | TP-030-01-02 | unit | SCN-030-003 | `tests/distributed-briefs.final.unit.mjs` | `material final synthesis consumes one run-wide frontier permit` | `node --test tests/distributed-briefs.final.unit.mjs` | No | DOD-030-01-02 |
| Integration | TP-030-01-03 | integration | SCN-030-004 | `tests/distributed-briefs.authorship.integration.mjs` | `configured unmeasurable cost refuses before adapter invocation` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes - real child-process boundary | DOD-030-01-03 |
| Stress Boundary Matrix | TP-030-01-04 | stress | SCN-030-003, SCN-030-004 | `tests/distributed-briefs.final-budget.stress.mjs` | `every resource dimension rejects exactly one unit above its cap` | `node --test tests/distributed-briefs.final-budget.stress.mjs` | Yes - production budget and scheduler path | DOD-030-01-04 |
| Canary | TP-030-01-05 | functional | SCN-030-002, SCN-030-003, SCN-030-004 | `scripts/selftest.mjs` | `existing repository invariants remain valid before and after route foundation changes` | `node scripts/selftest.mjs` | No | DOD-030-01-05 |
| Regression E2E | TP-030-01-06 | e2e-api | SCN-030-002, SCN-030-003, SCN-030-004 | `tests/distributed-briefs.final.e2e.mjs` | `Regression: runBriefRefresh enforces routine, material, and unmeasurable route outcomes` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes - production run function and real adapter process | DOD-030-01-06 |

### Definition of Done

#### Tiered Validation

#### Core Items

- [ ] **DOD-030-01-01 (SCN-030-002):** TP-030-01-01 passes and proves routine inputs cannot select frontier.
- [ ] **DOD-030-01-02 (SCN-030-003):** TP-030-01-02 passes and proves one material run cannot dispatch a second frontier request.
- [ ] **DOD-030-01-03 (SCN-030-004):** TP-030-01-03 passes and proves a configured unmeasurable dimension refuses before the real adapter boundary receives evidence.
- [ ] **DOD-030-01-04:** TP-030-01-04 passes for all twelve resource dimensions at the cap and at cap plus one.
- [ ] **DOD-030-01-05:** TP-030-01-05 passes before and after the focused suite as the independent shared-contract canary.
- [ ] **DOD-030-01-06:** The scenario-specific Regression E2E test passes through `runBriefRefresh` and the actual bounded adapter process.
- [ ] Every new contract has one production consumer, closed version rejection, safe failure code, and adversarial negative control.
- [ ] The Shared Infrastructure Impact Sweep and restore path are verified, and the Change Boundary contains every changed path.

#### Build Quality Gate

- [ ] Focused tests, `node scripts/selftest.mjs`, JSON/config parsing, lint, and `git diff --check` pass with no skipped required tests or warnings; artifacts and operator documentation match the implemented contracts.

## Scope 02: Exact Reuse And Recovery

**Status:** Not Started
**Priority:** P0
**Depends On:** 01
**Requirements:** FR-030-016 through FR-030-020, FR-030-031, FR-030-033; NFR-030-001, NFR-030-003, NFR-030-008
**Outcome Contribution:** Make identical accepted work free and make interruption resume from the first unresolved stage without duplicate accepted outcomes or model work.

### Gherkin Scenarios

#### SCN-030-001 - Identical Inputs Make No New Model Request

```gherkin
Scenario: Exact accepted inputs are reused
  Given a prior run has accepted outcomes for the current evidence and policy
  When the same generation window is processed again
  Then the runtime records reuse and makes zero new model requests
```

#### SCN-030-009 - Recovery Reuses Accepted Work

```gherkin
Scenario: An interrupted run resumes from the first unresolved stage
  Given a run stopped after accepted exact-input stage outcomes
  When the operator resumes that run
  Then accepted outcomes are reused and only unresolved work may dispatch
```

### Implementation Plan

1. Call Feature 002 `resolveBriefReuse` for every owner-permitted semantic intent immediately after input freeze and before materiality, capability preflight, route planning, or reservation.
2. Implement the design section 10 canonical stage-intent, stage-plan, logical-occurrence, transport-attempt, and accepted-outcome identities with Feature 002 canonical JSON and SHA-256.
3. Record reuse by reference without copying accepted bodies. Classify a run `unchanged` only when every semantic intent is reusable under its owning feature's policy.
4. Preserve Feature 019 `every-generation` semantics. A required current pass remains unresolved and makes the run at least routine unless Feature 019's owner contract explicitly permits reuse.
5. Persist attempt state, output/receipt hashes, validation state, and accepted outcome refs in the Feature 002 run graph. Store no prompt, source body, hidden reasoning, or private value.
6. Resume by revalidating frozen run, policy, adapter config, and accepted object identities, then start at the first unresolved stage. Input or policy drift creates a distinct descendant run and cannot reuse the old occurrence identity.
7. Keep the Feature 002 all-source barrier and pointer-last publisher after all accepted or reused outcomes.

### Change Boundary

- **Allowed:** `rlbriefroute.js`, `scripts/brief-refresh.mjs`, Feature 002-compatible run manifests/history refs, Feature 030 tests, and Feature 030 planning/evidence artifacts.
- **Excluded:** Feature 002 business rules, Feature 019 reuse policy, source acquisition, browser rendering, provider selection policy, legacy entry scripts, and sibling feature artifacts.

### Test Plan

| Test Type | Test ID | Category | Scenario | Planned file | Exact planned test identity | Command | Live system | DoD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unit Identity Vectors | TP-030-02-01 | unit | SCN-030-001, SCN-030-009 | `tests/distributed-briefs.lifecycle.unit.mjs` | `equal frozen inputs produce equal stage plan occurrence and outcome identities` | `node --test tests/distributed-briefs.lifecycle.unit.mjs` | No | DOD-030-02-01 |
| Integration | TP-030-02-02 | integration | SCN-030-001 | `tests/distributed-briefs.final.integration.mjs` | `exact accepted inputs publish by reference with zero adapter calls` | `node --test tests/distributed-briefs.final.integration.mjs` | Yes - production run graph in an isolated fixture repository | DOD-030-02-02 |
| Integration | TP-030-02-03 | integration | SCN-030-009 | `tests/distributed-briefs.scheduler.integration.mjs` | `resume dispatches only the first unresolved stage and its successors` | `node --test tests/distributed-briefs.scheduler.integration.mjs` | Yes - production run graph and adapter process | DOD-030-02-03 |
| Failure Matrix | TP-030-02-04 | integration | SCN-030-009 | `tests/distributed-briefs.scheduler-failures.integration.mjs` | `interruption after every accepted stage preserves one authoritative outcome` | `node --test tests/distributed-briefs.scheduler-failures.integration.mjs` | Yes - production scheduler and run graph | DOD-030-02-04 |
| Regression E2E | TP-030-02-05 | e2e-api | SCN-030-001, SCN-030-009 | `tests/distributed-briefs.scheduler.e2e.mjs` | `Regression: repeated and resumed runs never repeat accepted semantic work` | `node --test tests/distributed-briefs.scheduler.e2e.mjs` | Yes - production run function and isolated publication graph | DOD-030-02-05 |
| Broader Regression | TP-030-02-06 | regression | SCN-030-001, SCN-030-009 | `scripts/selftest.mjs` | `repository selftest preserves Feature 002 history reuse and barrier contracts` | `node scripts/selftest.mjs` | No | DOD-030-02-06 |

### Definition of Done

#### Tiered Validation

#### Core Items

- [ ] **DOD-030-02-01:** TP-030-02-01 passes for stable and perturbed identity vectors.
- [ ] **DOD-030-02-02 (SCN-030-001):** TP-030-02-02 passes with a paid adapter that fails the test if invoked.
- [ ] **DOD-030-02-03 (SCN-030-009):** TP-030-02-03 passes and proves only unresolved work reaches the adapter.
- [ ] **DOD-030-02-04:** TP-030-02-04 passes at every stage boundary and preserves the first accepted outcome.
- [ ] **DOD-030-02-05:** The scenario-specific Regression E2E test passes for an identical run and an interrupted/resumed run.
- [ ] **DOD-030-02-06:** The broader repository regression suite passes without weakening Feature 002 or Feature 019 behavior.
- [ ] Run manifests and history link accepted/reused outcomes by immutable identity and contain no duplicated body or sensitive content.
- [ ] The Change Boundary contains every changed path and Feature 002/019 ownership remains unchanged.

#### Build Quality Gate

- [ ] Focused tests, `node scripts/selftest.mjs`, artifact parsing, lint, and `git diff --check` pass with no skipped required tests or warnings; implementation and operator documentation describe exact reuse and resume truthfully.

## Scope 03: Failure-Safe Settlement And Publication

**Status:** Not Started
**Priority:** P0
**Depends On:** 02
**Requirements:** FR-030-008, FR-030-018, FR-030-019, FR-030-021 through FR-030-034; NFR-030-002, NFR-030-003, NFR-030-007
**Outcome Contribution:** Refuse overspend, unavailable selected routes, malformed outcomes, and invalid receipts without provider switching, partial history, or current-pointer movement.

### Gherkin Scenarios

#### SCN-030-005 - Exhausted Budget Preserves Current Publication

```gherkin
Scenario: A reservation cannot exceed the run budget
  Given the remaining budget cannot cover a required stage
  When that stage requests admission
  Then the run refuses and the current publication remains unchanged
```

#### SCN-030-006 - Provider Failure Does Not Switch Routes

```gherkin
Scenario: An unavailable selected route fails loud
  Given the policy selected one eligible route
  When that route is unavailable
  Then the stage records a refusal and no alternate provider is selected
```

#### SCN-030-008 - Invalid Stage Output Cannot Publish

```gherkin
Scenario: One malformed required outcome blocks the candidate
  Given a semantic stage returns output outside its closed contract
  When the publication candidate is assembled
  Then validation rejects the run and advances no current pointer
```

### Implementation Plan

1. Extend the run ledger to reserve each complete worst-permitted resource vector atomically in stage order, debit every measured attempt, release unused capacity, and refuse oversubscription under concurrent workers.
2. Normalize `measured`, `unmeasured`, and `not-applicable` receipt states. Require integer values and sources for measured dimensions, prohibit numeric values for unmeasured/not-applicable states, and charge failed or cancelled provider consumption.
3. Treat usage above reservation, missing capped measurements, malformed receipts, duplicate accepted outcomes, and second frontier dispatch as publication-blocking failures with the design section 17 safe codes.
4. Preserve one frozen selected route across retries. Permit only policy-listed transport or contract-repair classes, keep the same occurrence and adapter config, and never invoke another adapter after failure.
5. Extend `scripts/validate-brief-payload.mjs` to validate the generation receipt ref, exact-reuse no-paid-use rule, frontier dispatch count, and complete configured measurement state without replacing its existing payload authority.
6. Extend Feature 002 immutable objects, run manifest, and append-only history rows with policy, materiality, stage plan/outcome, and usage refs. Keep pointer movement last and atomic.
7. Inject failure at every required stage, validator, commit, and push boundary. Compare the current pointer bytes and freshness before and after each refusal.

### Change Boundary

- **Allowed:** `rlbriefroute.js`, `scripts/brief-route-runtime.mjs`, `scripts/brief-refresh.mjs`, `scripts/validate-brief-payload.mjs`, Feature 002-compatible brief object/run/history fields, Feature 030 tests, and Feature 030 planning/evidence artifacts.
- **Excluded:** public brief layout, owning recommendation formulas, route-priority policy, provider credentials, scheduled/on-demand launch scripts, deployment surfaces, and sibling feature artifacts.

### Test Plan

| Test Type | Test ID | Category | Scenario | Planned file | Exact planned test identity | Command | Live system | DoD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stress Boundary | TP-030-03-01 | stress | SCN-030-005 | `tests/distributed-briefs.final-budget.stress.mjs` | `cap-plus-one reservation refuses atomically without changing remaining budget` | `node --test tests/distributed-briefs.final-budget.stress.mjs` | Yes - production budget and scheduler path | DOD-030-03-01 |
| Integration | TP-030-03-02 | integration | SCN-030-005 | `tests/brief-refresh-atomicity.test.mjs` | `exhausted required-stage budget preserves current pointer bytes and freshness` | `node --test tests/brief-refresh-atomicity.test.mjs` | Yes - isolated publication repository | DOD-030-03-02 |
| Integration | TP-030-03-03 | integration | SCN-030-006 | `tests/distributed-briefs.authorship.integration.mjs` | `selected adapter failure records refusal and invokes no alternate adapter` | `node --test tests/distributed-briefs.authorship.integration.mjs` | Yes - real child-process adapter boundary | DOD-030-03-03 |
| Integration | TP-030-03-04 | integration | SCN-030-008 | `tests/distributed-briefs.final.integration.mjs` | `malformed required stage output fails closed validation and cannot publish` | `node --test tests/distributed-briefs.final.integration.mjs` | Yes - production validators and isolated publication repository | DOD-030-03-04 |
| Failure Injection Matrix | TP-030-03-05 | integration | SCN-030-005, SCN-030-006, SCN-030-008 | `tests/distributed-briefs.scheduler-failures.integration.mjs` | `every required-stage validator commit and push failure preserves the prior publication` | `node --test tests/distributed-briefs.scheduler-failures.integration.mjs` | Yes - production scheduler and isolated publication graph | DOD-030-03-05 |
| Regression E2E | TP-030-03-06 | e2e-api | SCN-030-005, SCN-030-006, SCN-030-008 | `tests/distributed-briefs.final.e2e.mjs` | `Regression: budget route and contract failures cannot switch providers or move current` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes - production run function, adapter process, validators, and isolated publication graph | DOD-030-03-06 |
| Payload Contract | TP-030-03-07 | functional | SCN-030-008 | `scripts/validate-brief-payload.mjs` | `current payload validator accepts only a valid routed receipt graph` | `node scripts/validate-brief-payload.mjs` | No | DOD-030-03-07 |

### Definition of Done

#### Tiered Validation

#### Core Items

- [ ] **DOD-030-03-01:** TP-030-03-01 passes at the cap and exactly one unit above it.
- [ ] **DOD-030-03-02 (SCN-030-005):** TP-030-03-02 passes and proves the current pointer and freshness remain byte-identical.
- [ ] **DOD-030-03-03 (SCN-030-006):** TP-030-03-03 passes with call-count assertions for every non-selected adapter.
- [ ] **DOD-030-03-04 (SCN-030-008):** TP-030-03-04 passes through the existing all-source and payload validators.
- [ ] **DOD-030-03-05:** TP-030-03-05 passes across every named failure boundary and records consumed usage honestly.
- [ ] **DOD-030-03-06:** The scenario-specific Regression E2E test passes for budget exhaustion, provider failure, and malformed required output.
- [ ] **DOD-030-03-07:** The existing payload validator passes valid routed graphs and rejects invalid receipt, frontier-count, and configured-measurement variants.
- [ ] Immutable objects, append-only history, correction records, and pointer-last publication preserve Feature 002 authority.
- [ ] The Change Boundary contains every changed path and no public reader or launch script changes occur in this scope.

#### Build Quality Gate

- [ ] Focused tests, payload validation, `node scripts/selftest.mjs`, artifact parsing, lint, and `git diff --check` pass with no skipped required tests or warnings; failure codes and operator actions are documented without sensitive content.

## Scope 04: Inert Evidence And Shadow Evaluation

**Status:** Not Started
**Priority:** P0
**Depends On:** 03
**Requirements:** FR-030-013, FR-030-015, FR-030-028 through FR-030-030, FR-030-034 through FR-030-038, FR-030-040; NFR-030-004, NFR-030-005, NFR-030-007
**Outcome Contribution:** Prove cheaper routes cannot gain control authority, fabricate missing evidence, hide quality regressions, or qualify for promotion without complete measured comparison.

### Gherkin Scenarios

#### SCN-030-007 - Source Instructions Remain Inert

```gherkin
Scenario: Untrusted evidence cannot change execution policy
  Given acquired source text requests a new tool, provider, or budget
  When a semantic stage consumes the evidence projection
  Then the request remains data and cannot alter the run contract
```

#### SCN-030-010 - Missing Evidence Stays Missing

```gherkin
Scenario: A cheaper route cannot fill an evidence gap with prose
  Given a required claim lacks admissible evidence
  When any model authors a candidate
  Then the gap remains explicit and unsupported material claims cannot publish
```

#### SCN-030-011 - Shadow Evaluation Exposes Quality Regressions

```gherkin
Scenario: Lower cost cannot conceal weaker output
  Given baseline and candidate policies process the same frozen corpus
  When their evaluation records are compared
  Then every omission, unsupported claim, citation break, and miss is visible
```

### Implementation Plan

1. Preserve `scripts/web-evidence-acquire.mjs` as the source trust boundary. Emit normalized acquisition resource receipts, hash bounded bytes, discard raw bodies, and pass only safe source metadata and normalized claims into the frozen author projection.
2. Validate projections recursively against prompts, raw excerpts, credentials, endpoint/host values, browser-private state, position size, cost basis, profit and loss, account identity, and control-shaped route/tool/budget/publication fields.
3. Keep fixed instructions separate from source/model data. Reject instruction-shaped source content before authoring and instruction-shaped model output before acceptance without echoing unsafe content to logs or artifacts.
4. Create `scripts/brief-shadow-evaluate.mjs` to consume one immutable corpus manifest of at least 30 accepted historical runs and compare source coverage, citations, missing/conflict states, scoreability, misses, brevity, validators, route usage, and measured cost on identical frozen inputs.
5. Require the corpus strata from design section 15.1. Record an explicit incomplete evaluation when any required stratum, receipt unit, configured measurement, validator result, or rubric decision is absent.
6. Expose every critical regression with equal prominence and withhold rates below the approved sample. Keep human rubric labels blinded and randomized. Give the evaluator no current-pointer, public-history, commit, or push authority.
7. Encode the promotion matrix from design section 16. Any critical honesty regression, incomplete configured cost measurement, Feature 019/026 drift, or failed validator rejects promotion regardless of cost.

### Change Boundary

- **Allowed:** `scripts/web-evidence-acquire.mjs`, `scripts/brief-author.mjs`, `scripts/brief-shadow-evaluate.mjs`, immutable Feature 030 corpus/evaluation fixtures, Feature 030 tests, and Feature 030 planning/evidence artifacts.
- **Excluded:** live publication pointers/history, provider credentials/endpoints, browser-private data, public page layout, owning models, live cutover scripts, deployment surfaces, and sibling feature artifacts.

### Test Plan

| Test Type | Test ID | Category | Scenario | Planned file | Exact planned test identity | Command | Live system | DoD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Security | TP-030-04-01 | security | SCN-030-007 | `tests/web-evidence.security.mjs` | `hostile source and model text cannot change route tool budget validation or publication fields` | `node --test tests/web-evidence.security.mjs` | No | DOD-030-04-01 |
| Integration | TP-030-04-02 | integration | SCN-030-010 | `tests/distributed-briefs.final.integration.mjs` | `missing evidence remains explicit and unsupported material claims cannot publish` | `node --test tests/distributed-briefs.final.integration.mjs` | Yes - production acquisition author and validators | DOD-030-04-02 |
| Shadow Evaluation | TP-030-04-03 | functional | SCN-030-011 | `tests/distributed-briefs.final.unit.mjs` | `frozen baseline comparison exposes every critical regression class` | `node --test tests/distributed-briefs.final.unit.mjs` | No | DOD-030-04-03 |
| Corpus Admission | TP-030-04-04 | unit | SCN-030-011 | `tests/distributed-briefs.final.unit.mjs` | `promotion refuses fewer than thirty runs missing strata or incomplete configured cost` | `node --test tests/distributed-briefs.final.unit.mjs` | No | DOD-030-04-04 |
| Privacy And Artifact Scan | TP-030-04-05 | security | SCN-030-007, SCN-030-010 | `tests/web-evidence.security.mjs` | `committed projections receipts telemetry and evaluations exclude sensitive and hidden content` | `node --test tests/web-evidence.security.mjs` | No | DOD-030-04-05 |
| Regression E2E | TP-030-04-06 | e2e-api | SCN-030-007, SCN-030-010, SCN-030-011 | `tests/distributed-briefs.final.e2e.mjs` | `Regression: hostile and incomplete evidence stays inert and visible through shadow comparison` | `node --test tests/distributed-briefs.final.e2e.mjs` | Yes - production acquisition, adapter process, validators, and immutable corpus | DOD-030-04-06 |
| Broader Regression | TP-030-04-07 | regression | SCN-030-007, SCN-030-010, SCN-030-011 | `scripts/selftest.mjs` | `repository selftest preserves provenance missing-state scoreability and static-product contracts` | `node scripts/selftest.mjs` | No | DOD-030-04-07 |

### Definition of Done

#### Tiered Validation

#### Core Items

- [ ] **DOD-030-04-01 (SCN-030-007):** TP-030-04-01 passes with adversarial route, tool, budget, provider, publication, and consequence instructions.
- [ ] **DOD-030-04-02 (SCN-030-010):** TP-030-04-02 passes and rejects prose that attempts to replace missing admissible evidence.
- [ ] **DOD-030-04-03 (SCN-030-011):** TP-030-04-03 passes for every quality class in design section 21.4 with misses and regressions equally visible.
- [ ] **DOD-030-04-04:** TP-030-04-04 passes at corpus size 29 and 30, and for every required stratum and configured measurement state.
- [ ] **DOD-030-04-05:** TP-030-04-05 passes recursive scans over projections, receipts, telemetry, run artifacts, and evaluation records.
- [ ] **DOD-030-04-06:** The scenario-specific Regression E2E test passes through the actual acquisition, author, validation, and shadow-evaluation paths.
- [ ] **DOD-030-04-07:** The broader repository regression suite passes without weakening Product Principles P1-P8 or P20-P23.
- [ ] Shadow execution has no public pointer, public history, production payload, commit, or push authority.
- [ ] The Change Boundary contains every changed path and no environment-specific or private value enters committed artifacts.

#### Build Quality Gate

- [ ] Focused security/honesty/shadow tests, `node scripts/selftest.mjs`, artifact parsing, lint, PII scanning, and `git diff --check` pass with no skipped required tests or warnings; the frozen corpus and rubric records are complete and reviewable.

## Scope 05: Atomic Cutover And Reader Continuity

**Status:** Not Started
**Priority:** P0
**Depends On:** 04
**Requirements:** FR-030-004, FR-030-014, FR-030-031 through FR-030-034, FR-030-037 through FR-030-040; NFR-030-001, NFR-030-003, NFR-030-006, NFR-030-007
**Outcome Contribution:** Make the routed run the only production generation path while preserving scheduled/on-demand semantics, existing validators, static no-account reading, and the last validated brief on every failure.

### Gherkin Scenarios

#### SCN-030-012 - Public Access Survives Generation Failure

```gherkin
Scenario: A failed generation does not break the current brief
  Given a reader has no provider key or account
  When the latest generation run refuses
  Then the last validated brief remains readable with its original freshness
```

### Implementation Plan

1. Change `scripts/brief-refresh-and-push.sh` into a thin invocation of the live `runBriefRefresh` path followed by the existing payload and Feature 002 graph validators and pointer-last publication.
2. Update `scripts/brief-refresh-scheduled.sh` while preserving clone isolation, occurrence lock, due-window selection, acknowledgment, immutable launcher, and bounded execution. Remove the global lane-model and complete outer narrative retry settings.
3. Move every retained `core`, `signals`, `groups`, `coverage`, research-acquisition, and Feature 019 per-topic obligation into the design section 6 stage graph. Keep grouping/coverage deterministic and agenda semantics owner-controlled.
4. Remove every production call to `scripts/brief-narrative-parallel.mjs`, remove `BRIEF_MODEL` from worker/scheduler contracts, prove zero remaining production consumers, and then delete the legacy module in the same reviewed cutover.
5. Run scheduled and on-demand entry points against an isolated Git remote and immutable fixture corpus. Exercise exact reuse, routine, material, each failure boundary, commit/push resume, and payload/graph validation.
6. Verify `market-brief.html` and its current payload paint from the last validated publication through the existing static reader path with no provider key, proxy, account, server, model endpoint, or successful latest generation.
7. Keep rollback pointer/config based. Verify prior validated Feature 002 artifacts and policy before pointer movement. Never perform paid replay during rollback.

### Consumer Impact Sweep

- **Launchers:** scheduled trigger, on-demand refresh-and-push, any script that invokes the legacy narrative module, and operator documentation.
- **Configuration:** `BRIEF_MODEL`, lane attempt/concurrency settings, route adapter refs, budget profiles, and validator inputs.
- **Data consumers:** Feature 002 run graph/history/current pointers, Feature 019 agenda stages, Feature 026 payload/delta reader, `market-brief.html`, and `scripts/validate-brief-payload.mjs`.
- **Stale-reference surfaces:** shell scripts, `.mjs` imports/process launches, config keys, docs/runbooks, tests, current payload validation, and generated/public brief artifacts.
- **Closure proof:** no production caller invokes `brief-narrative-parallel.mjs`, no production config reads `BRIEF_MODEL`, and no hidden compatibility path can select the global-model lanes.

### Change Boundary

- **Allowed:** `scripts/brief-refresh-and-push.sh`, `scripts/brief-refresh-scheduled.sh`, `scripts/brief-refresh.mjs`, `scripts/validate-brief-payload.mjs`, `market-brief.config.json`, deletion of `scripts/brief-narrative-parallel.mjs` after consumer proof, Feature 030 tests, applicable operator docs, and Feature 030 planning/evidence artifacts.
- **Excluded:** browser layout/style changes, owning financial models, Feature 019 topic/cadence policy, Feature 026 output caps/order, package manifests, deployment targets, provider secrets/endpoints, and sibling feature artifacts.

### UI Scenario Matrix

| Scenario | Preconditions | Steps | Expected visible result | Test Type | Evidence target |
| --- | --- | --- | --- | --- | --- |
| SCN-030-012 static reader continuity | A valid current brief exists; provider credentials and account state are absent; the latest isolated generation refuses | Open the production brief through its build-free reader path and inspect freshness, sourced claims, dark states, and scorecard | The prior validated brief remains visible, its original freshness is unchanged, and no failed candidate or newer generation timestamp appears | e2e-ui | `report.md#scenario-scn-030-012` |

### Test Plan

| Test Type | Test ID | Category | Scenario | Planned file | Exact planned test identity | Command | Live system | DoD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cutover Integration | TP-030-05-01 | integration | SCN-030-012 | `tests/distributed-briefs.scheduler.integration.mjs` | `scheduled and on-demand entrypoints invoke only runBriefRefresh and existing validators` | `node --test tests/distributed-briefs.scheduler.integration.mjs` | Yes - real launch scripts and isolated Git remote | DOD-030-05-01 |
| Consumer Trace | TP-030-05-02 | functional | SCN-030-012 | `tests/distributed-briefs.consumer-trace.mjs` | `legacy narrative module and BRIEF_MODEL have zero production consumers after cutover` | `node --test tests/distributed-briefs.consumer-trace.mjs` | No | DOD-030-05-02 |
| Static Reader E2E | TP-030-05-03 | e2e-ui | SCN-030-012 | `tests/market-brief-freshness.spec.mjs` | `reader without provider access sees the prior validated brief after generation refusal` | `npx --no-install playwright test tests/market-brief-freshness.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "reader without provider access sees the prior validated brief after generation refusal" --reporter=list` | Yes - production static reader and payload | DOD-030-05-03 |
| Publication Matrix | TP-030-05-04 | e2e-api | SCN-030-012 | `tests/distributed-briefs.scheduler.e2e.mjs` | `scheduled and on-demand reuse routine material and failure runs preserve atomic publication` | `node --test tests/distributed-briefs.scheduler.e2e.mjs` | Yes - production launchers, run graph, adapter process, validators, and isolated Git remote | DOD-030-05-04 |
| Regression E2E | TP-030-05-05 | e2e-ui | SCN-030-012 | `tests/market-brief-freshness.spec.mjs` | `Regression: failed latest generation cannot replace content freshness or accessibility of current brief` | `npx --no-install playwright test tests/market-brief-freshness.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: failed latest generation cannot replace content freshness or accessibility of current brief" --reporter=list` | Yes - production static reader and payload | DOD-030-05-05 |
| Payload Contract | TP-030-05-06 | functional | SCN-030-012 | `scripts/validate-brief-payload.mjs` | `published routed payload passes the existing validator authority` | `node scripts/validate-brief-payload.mjs` | No | DOD-030-05-06 |
| Broader Regression | TP-030-05-07 | regression | SCN-030-012 | `scripts/selftest.mjs` | `full repository selftest passes after atomic cutover and legacy closure` | `node scripts/selftest.mjs` | No | DOD-030-05-07 |

### Definition of Done

#### Tiered Validation

#### Core Items

- [ ] **DOD-030-05-01:** TP-030-05-01 passes through both real launch scripts and the existing validators against an isolated Git remote.
- [ ] **DOD-030-05-02:** TP-030-05-02 proves zero stale production callers, imports, config reads, docs, or tests for the removed global-model path.
- [ ] **DOD-030-05-03:** TP-030-05-03 passes with no provider key, proxy, account, server, or successful latest generation.
- [ ] **DOD-030-05-04:** TP-030-05-04 passes for exact reuse, routine, material, every required-stage failure, commit failure, push failure, and push-only resume.
- [ ] **DOD-030-05-05 (SCN-030-012):** The scenario-specific Regression E2E test proves visible content, original freshness, keyboard/accessibility behavior, and dark states remain intact after refusal.
- [ ] **DOD-030-05-06:** The current payload validator passes the final routed publication without weakened authority checks.
- [ ] **DOD-030-05-07:** The broader repository regression suite passes after the legacy production path is removed.
- [ ] The Consumer Impact Sweep is complete and zero first-party reference to `brief-narrative-parallel.mjs` or `BRIEF_MODEL` remains outside historical evidence.
- [ ] Rollback selects validated prior artifacts and policy through Feature 002 pointer semantics and performs no source acquisition or model dispatch.
- [ ] The Change Boundary contains every changed path and no browser layout, owning model, package, deployment, secret, or sibling feature file changed.

#### Build Quality Gate

- [ ] Focused cutover/continuity tests, payload validation, `node scripts/selftest.mjs`, artifact parsing, lint, PII scanning, and `git diff --check` pass with no skipped required tests or warnings; operator documentation describes one authoritative generation path and its rollback.

## Requirement Coverage

| Requirement group | Owning scopes | Planned proof |
| --- | --- | --- |
| FR-030-001 through FR-030-015 | 01, 04, 05 | frozen stage contracts, deterministic materiality/route matrix, bounded adapter projection, and cutover consumer proof |
| FR-030-016 through FR-030-020 | 02, 03 | identity vectors, exact reuse, bounded retry, failure-after-each-stage resume, and no duplicate accepted outcome |
| FR-030-021 through FR-030-027 | 01, 03 | complete resource vectors, cap-plus-one matrix, pre-dispatch measurement admission, receipts, settlement, and overrun refusal |
| FR-030-028 through FR-030-036 | 03, 04, 05 | deterministic candidate validation, evidence lineage, pointer preservation, append-only history, scoreability, injection, privacy, and consequence-boundary tests |
| FR-030-037 through FR-030-040 | 04, 05 | thirty-run corpus gate, critical-regression promotion matrix, static no-account continuity, and authority scans |
| NFR-030-001 through NFR-030-008 | 01 through 05 | no-call reuse, budget boundaries, interruption/resume, injection, bounded telemetry, build-free reader, graph traceability, and repeated deterministic fixtures |
| BS-030-001 through BS-030-012 | 01 through 05 | all twelve stable scenario IDs map to persistent tests and evidence targets in `scenario-manifest.json` and `test-plan.json` |

No requirement or business scenario is omitted from the active scope inventory. Scope slicing changes execution order only; it does not narrow Feature 030's declared behavior.