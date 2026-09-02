# Feature 030 - Budget-Aware Hybrid Brief Generation

## Problem Statement

Research Lab already separates deterministic market reads from authored brief
text. It also validates publication shape, preserves recommendation history,
and reuses unchanged source briefs.

The live scheduled path still assigns one model class to every narrative lane.
It may repeat principal lane attempts after a rejected outer attempt. This makes
provider cost a property of process repetition instead of evidence materiality.

The product needs a budget-aware generation capability. It must route each
stage to deterministic logic, a local model, a low-cost hosted model, or a
frontier model. It must preserve every existing honesty and publication rule.

## Outcome Contract

**Intent:** Generate each scheduled or on-demand brief through the least costly
eligible route that can preserve evidence quality. Use a frontier model only
when a deterministic materiality decision requires stronger synthesis.

**Success Signal:** An unchanged run makes no new model request. A routine
changed run publishes without a frontier request. A material run uses at most
one frontier synthesis request. Every published run carries measured usage or
an explicit unmeasured state. It passes the existing publication contracts and
preserves the prior brief when any required stage fails.

**Hard Constraints:** Evidence provenance, missing-data honesty, source-model
ownership, recommendation scoreability, append-only history, atomic
publication, and reader privacy remain unchanged. A configured cost or token
limit that cannot be measured blocks dispatch. No model may select its own
provider, expand its tools, alter a budget, or perform a consequential action.

**Failure Condition:** The feature fails if it reduces spend by hiding evidence,
weakening validation, suppressing misses, silently changing providers, or
publishing lower-quality claims. It also fails if unchanged evidence triggers
new paid authoring or one run can exceed its configured hard budget.

## Goals

1. Route each generation stage by capability, evidence classification,
   materiality, and remaining budget.
2. Keep acquisition, calculations, coverage, validation, and publication
   deterministic whenever their semantics are deterministic.
3. Use local and low-cost hosted models for bounded semantic work.
4. Reserve frontier synthesis for material conflicts and high-consequence
   conclusions.
5. Reuse accepted exact-input outcomes without another model request.
6. Record model usage, cost, route, quality, and publication identity together.
7. Prove quality and cost on a frozen historical corpus before cutover.

## Non-Goals

1. This feature does not change any owning market model or formula.
2. It does not introduce order execution, brokerage, personalized holdings, or
   investment advice.
3. It does not add a server, account system, bundler, or required paid data
   provider.
4. It does not let a cheaper model bypass an evidence or publication gate.
5. It does not make a model provider part of the product's permanent domain
   contract.
6. It does not rewrite Features 002, 019, or 026.
7. It does not publish source bodies, prompts, hidden reasoning, credentials,
   position sizes, cost basis, or profit and loss.

## Release Train

This repository has no release-train model. Its `config/` directory contains
only the shared domain model. It has no release-train registry or per-train
feature-flag bundles.

This feature therefore declares no train and introduces no flag. It changes an
existing internal publication capability and adds no public route.

## Domain Capability Model

### Capability

**Budget-Aware Hybrid Brief Generation** converts one frozen evidence set into
one validated brief publication. It selects a stage route before dispatch and
accounts for every resource consumed by that route.

### Domain Primitives

| Primitive | Purpose | Lifecycle |
| --- | --- | --- |
| Generation Run | Binds one window, evidence cutoff, route policy, budget, and publication outcome | planned -> inputs-frozen -> running -> validated -> published, or refused |
| Stage Intent | Declares one deterministic or semantic operation and its required capability | planned -> admitted -> dispatched -> accepted, reused, or refused |
| Route Class | Describes deterministic, local, low-cost hosted, frontier, or human-reviewed execution | eligible -> selected or refused |
| Materiality Decision | Determines whether evidence change requires stronger synthesis | unchanged, routine, material, conflicted, or prohibited |
| Budget Reservation | Protects capacity before a resource-consuming operation starts | proposed -> reserved -> debited and released, or refused |
| Usage Receipt | Records measured provider and resource consumption without prompt content | measured, partially measured, unmeasured, or invalid |
| Evidence Projection | Supplies only the bounded claims, sources, conflicts, and limitations needed by one stage | created -> validated -> consumed -> superseded |
| Stage Outcome | Preserves one accepted, rejected, reused, or unresolved result for exact inputs | candidate -> accepted, rejected, reused, or unresolved |
| Publication Candidate | Combines accepted stage outcomes behind the existing all-source barrier | assembled -> validated -> published or rejected |
| Evaluation Record | Compares cost, quality, and contract outcomes against a frozen baseline | observed -> accepted or rejected for promotion |

### Relationships

- One Generation Run contains an ordered set of Stage Intents.
- One Stage Intent resolves exactly one Route Class or refuses before dispatch.
- One resource-consuming Stage Intent requires one Budget Reservation.
- One dispatch occurrence produces one Usage Receipt and one Stage Outcome.
- One accepted Stage Outcome can serve later identical runs by reference.
- One Materiality Decision controls frontier eligibility.
- One Publication Candidate references every required accepted or reused outcome.
- One Evaluation Record compares equivalent frozen inputs across route policies.

### Business Policies

1. Deterministic semantics always use deterministic execution.
2. Route selection occurs before source-derived content leaves its allowed
   boundary.
3. Unchanged exact inputs cause reuse and zero new model requests.
4. A routine change cannot consume a frontier route.
5. A material run may use at most one frontier synthesis request.
6. A configured unmeasurable limit blocks dispatch.
7. An unconfigured measurement remains unmeasured and never becomes zero.
8. A route failure never causes an undeclared provider switch.
9. Failed generation never advances the current publication pointer.
10. Cost reduction cannot weaken evidence, history, scoreability, or privacy.

## Actors And Personas

| Actor | Description | Key Goals | Permissions |
| --- | --- | --- | --- |
| Brief Reader | Uses the current brief and its scorecard | Receive timely, concise, sourced, and candid guidance | Reads published artifacts only |
| Research Operator | Starts or schedules a generation run | Obtain a complete brief within an explicit budget | Selects approved policy profiles and inspects receipts |
| Publication Runtime | Executes the generation contract | Publish one coherent run or preserve the prior run | Runs only admitted stages and deterministic publication actions |
| Route Policy Owner | Defines eligible route classes and escalation rules | Balance evidence quality, privacy, latency, and cost | Changes versioned policy, but cannot alter an active frozen run |
| Product Auditor | Compares baseline and candidate generation | Verify quality, cost, provenance, and scoreability | Reads immutable inputs, outcomes, and evaluation records |

## Use Cases

### UC-030-001: Publish an unchanged window without paid authoring

- **Actor:** Publication Runtime
- **Preconditions:** The evidence and policy fingerprints match an accepted
  prior run.
- **Main Flow:**
  1. The runtime freezes the current inputs.
  2. It resolves accepted exact-input outcomes.
  3. It records reuse for every unchanged stage.
  4. It validates and publishes the coherent run reference.
- **Alternative Flows:** A changed freshness predicate invalidates only its
  dependent outcomes.
- **Postconditions:** No model request occurs and the run remains auditable.

### UC-030-002: Generate a routine changed brief economically

- **Actor:** Research Operator
- **Preconditions:** New admissible evidence creates a routine materiality
  decision.
- **Main Flow:**
  1. Deterministic stages update reads and coverage.
  2. Eligible bounded semantic stages use local or low-cost hosted routes.
  3. The runtime assembles one candidate after the all-source barrier.
  4. Deterministic validators admit or reject the candidate.
- **Alternative Flows:** If no eligible route exists, the run refuses without
  changing current publication.
- **Postconditions:** The published run contains no frontier usage.

### UC-030-003: Escalate one material synthesis

- **Actor:** Publication Runtime
- **Preconditions:** Deterministic analysis identifies a material conflict or
  high-consequence conclusion.
- **Main Flow:**
  1. The materiality decision names the escalation basis.
  2. The runtime builds one bounded evidence projection.
  3. It reserves the frontier request budget.
  4. One frontier route synthesizes the candidate.
  5. Deterministic validation checks every published claim.
- **Alternative Flows:** Unavailable frontier capacity refuses the run.
- **Postconditions:** At most one frontier request is charged to the run.

### UC-030-004: Stop before an unmeasurable paid dispatch

- **Actor:** Route Policy Owner
- **Preconditions:** A configured token, credit, or monetary cap lacks reliable
  measurement.
- **Main Flow:**
  1. Pre-dispatch admission checks route capabilities.
  2. Admission records the missing measurement capability.
  3. The run refuses before transmitting evidence.
- **Alternative Flows:** The owner may choose a measurable route through a new
  policy version.
- **Postconditions:** No paid request occurs under an unenforceable cap.

### UC-030-005: Compare a candidate policy before cutover

- **Actor:** Product Auditor
- **Preconditions:** A frozen historical corpus and current production outputs
  exist.
- **Main Flow:**
  1. The candidate policy processes the same frozen inputs.
  2. The evaluator compares claims, citations, conflicts, omissions, and costs.
  3. It publishes misses and regressions with equal prominence.
  4. It withholds promotion metrics below their minimum sample.
- **Alternative Flows:** Any critical honesty regression rejects promotion.
- **Postconditions:** Promotion rests on reproducible quality and cost evidence.

### UC-030-006: Recover without duplicate model work

- **Actor:** Publication Runtime
- **Preconditions:** A run stops after one or more accepted stage outcomes.
- **Main Flow:**
  1. The runtime validates the stored run and input identities.
  2. It reuses accepted exact-input outcomes.
  3. It resumes from the first unresolved stage.
  4. It preserves one logical occurrence across bounded transport retries.
- **Alternative Flows:** Input drift creates a distinct descendant run.
- **Postconditions:** Recovery creates no duplicate accepted outcome.

## Business Scenarios

### BS-030-001: Identical inputs make no new model request

```gherkin
Scenario: Exact accepted inputs are reused
  Given a prior run has accepted outcomes for the current evidence and policy
  When the same generation window is processed again
  Then the runtime records reuse and makes zero new model requests
```

### BS-030-002: Routine evidence avoids frontier synthesis

```gherkin
Scenario: A routine change uses an economical eligible route
  Given admissible evidence changed without a material conflict
  When the brief is generated
  Then no frontier request occurs and all publication checks still apply
```

### BS-030-003: Material evidence earns one frontier request

```gherkin
Scenario: A material conflict receives one bounded synthesis
  Given deterministic analysis identifies a material evidence conflict
  When the run reaches synthesis
  Then exactly one frontier request may occur against a bounded projection
```

### BS-030-004: Unmeasurable configured cost blocks dispatch

```gherkin
Scenario: A configured limit must be enforceable
  Given a selected paid route cannot measure a configured cost dimension
  When pre-dispatch admission evaluates the route
  Then the run refuses before any provider request
```

### BS-030-005: Exhausted budget preserves current publication

```gherkin
Scenario: A reservation cannot exceed the run budget
  Given the remaining budget cannot cover a required stage
  When that stage requests admission
  Then the run refuses and the current publication remains unchanged
```

### BS-030-006: Provider failure does not switch routes

```gherkin
Scenario: An unavailable selected route fails loud
  Given the policy selected one eligible route
  When that route is unavailable
  Then the stage records a refusal and no alternate provider is selected
```

### BS-030-007: Source instructions remain inert

```gherkin
Scenario: Untrusted evidence cannot change execution policy
  Given acquired source text requests a new tool, provider, or budget
  When a semantic stage consumes the evidence projection
  Then the request remains data and cannot alter the run contract
```

### BS-030-008: Invalid stage output cannot publish

```gherkin
Scenario: One malformed required outcome blocks the candidate
  Given a semantic stage returns output outside its closed contract
  When the publication candidate is assembled
  Then validation rejects the run and advances no current pointer
```

### BS-030-009: Recovery reuses accepted work

```gherkin
Scenario: An interrupted run resumes from the first unresolved stage
  Given a run stopped after accepted exact-input stage outcomes
  When the operator resumes that run
  Then accepted outcomes are reused and only unresolved work may dispatch
```

### BS-030-010: Missing evidence stays missing

```gherkin
Scenario: A cheaper route cannot fill an evidence gap with prose
  Given a required claim lacks admissible evidence
  When any model authors a candidate
  Then the gap remains explicit and unsupported material claims cannot publish
```

### BS-030-011: Shadow evaluation exposes quality regressions

```gherkin
Scenario: Lower cost cannot conceal weaker output
  Given baseline and candidate policies process the same frozen corpus
  When their evaluation records are compared
  Then every omission, unsupported claim, citation break, and miss is visible
```

### BS-030-012: Public access survives generation failure

```gherkin
Scenario: A failed generation does not break the current brief
  Given a reader has no provider key or account
  When the latest generation run refuses
  Then the last validated brief remains readable with its original freshness
```

## Functional Requirements

### Input And Stage Control

- **FR-030-001:** Every run MUST freeze its evidence, policy, budget, source
  revision, and intended publication window before semantic dispatch.
- **FR-030-002:** Every stage MUST declare its required capability and route
  class before execution.
- **FR-030-003:** Deterministic operations MUST NOT invoke a model.
- **FR-030-004:** One global model choice MUST NOT control every stage.
- **FR-030-005:** Every route MUST declare measurement, context, privacy,
  cancellation, and output capabilities.
- **FR-030-006:** Route eligibility MUST consider evidence classification,
  materiality, required capability, and remaining budget.
- **FR-030-007:** A route decision MUST resolve exactly one route or refuse.
- **FR-030-008:** An unavailable route MUST NOT cause a silent provider switch.

### Materiality And Model Use

- **FR-030-009:** Deterministic analysis MUST classify evidence change as
  unchanged, routine, material, conflicted, or prohibited.
- **FR-030-010:** An unchanged run MUST make zero new model requests.
- **FR-030-011:** A routine run MUST NOT invoke a frontier route.
- **FR-030-012:** A material run MUST use no more than one frontier synthesis
  request.
- **FR-030-013:** Frontier input MUST contain only the bounded claims, evidence
  links, conflicts, limitations, and required output contract.
- **FR-030-014:** Coverage and group roll-ups with deterministic semantics MUST
  remain deterministic.
- **FR-030-015:** Narrative models MUST NOT acquire sources or expand their own
  tool authority.

### Reuse, Retry, And Recovery

- **FR-030-016:** Accepted stage outcomes MUST have deterministic input and
  output identities.
- **FR-030-017:** Exact accepted input identities MUST reuse prior outcomes by
  reference.
- **FR-030-018:** A retry MUST preserve the same frozen input and logical
  occurrence identity.
- **FR-030-019:** Only policy-approved transport or contract-repair failures MAY
  consume retry capacity.
- **FR-030-020:** Resume MUST start at the first unresolved stage and MUST NOT
  repeat accepted work.

### Budget And Usage Truth

- **FR-030-021:** Every run and resource-consuming stage MUST have explicit
  hard budgets.
- **FR-030-022:** Budgets MUST independently account for model requests, input
  tokens, output tokens, cache operations, provider credits, and monetary cost.
  They MUST also account for source calls, retained bytes, wall time, retries,
  and concurrency.
- **FR-030-023:** A configured limit that cannot be measured MUST refuse before
  dispatch.
- **FR-030-024:** An unconfigured measurement MUST remain `unmeasured` and MUST
  NOT be represented as zero.
- **FR-030-025:** The runtime MUST reserve worst-permitted capacity before a
  consuming operation.
- **FR-030-026:** Every dispatch MUST produce a usage receipt with measured and
  unmeasured dimensions distinguished.
- **FR-030-027:** A provider overrun or invalid usage receipt MUST block
  publication and remain visible to the operator.

### Evidence And Publication

- **FR-030-028:** Every model output MUST remain candidate data until closed
  deterministic validation accepts it.
- **FR-030-029:** Missing, stale, conflicting, unsupported, and unavailable
  evidence MUST remain distinct.
- **FR-030-030:** Every material published claim MUST resolve to admissible
  immutable evidence.
- **FR-030-031:** Final synthesis MUST begin only after every required source
  outcome passes the existing all-source barrier.
- **FR-030-032:** A failed required stage MUST leave the current publication
  pointer unchanged.
- **FR-030-033:** Published history and usage records MUST be append-only.
- **FR-030-034:** Recommendations MUST retain instrument, level, invalidation,
  horizon, evidence quality, and source ownership needed for scoring.

### Safety And Promotion

- **FR-030-035:** Source text and model output MUST NOT alter routes, budgets,
  tools, validation, publication targets, or consequence boundaries.
- **FR-030-036:** Committed artifacts MUST exclude credentials, private account
  data, position size, cost basis, profit and loss, and hidden model content.
- **FR-030-037:** Candidate routing MUST run in shadow mode against at least 30
  representative frozen historical runs before replacing the live policy.
- **FR-030-038:** Promotion MUST require zero critical honesty regressions and
  complete cost measurement for every configured cost dimension.
- **FR-030-039:** The public brief MUST remain usable without a provider key,
  proxy, account, server, or successful latest generation.
- **FR-030-040:** The capability MUST NOT execute trades, send instructions,
  mutate accounts, or perform another consequential action.

## Non-Functional Requirements

- **NFR-030-001 Performance:** Exact reuse MUST complete without provider
  dispatch and within the deterministic publication budget.
- **NFR-030-002 Cost:** Every configured budget boundary MUST have a failing
  boundary test at one unit above its cap.
- **NFR-030-003 Reliability:** Interruption after any stage MUST preserve enough
  immutable state for exact resume.
- **NFR-030-004 Security:** Untrusted source and model content MUST remain inert
  at every control boundary.
- **NFR-030-005 Privacy:** Telemetry MUST contain only bounded identifiers,
  counts, route classes, costs, states, and digests.
- **NFR-030-006 Portability:** Public tools MUST retain build-free browser and
  local-file operation.
- **NFR-030-007 Auditability:** A reader or auditor MUST trace every published
  material claim to evidence, route, policy, and validation identity.
- **NFR-030-008 Determinism:** Equal frozen inputs and policies MUST produce the
  same stage plan and publication identities.

## Product Principle Alignment

| Principle | Alignment |
| --- | --- |
| P1 - Every displayed figure carries provenance | Route and usage figures retain measured provenance classes. |
| P2 - Missing data renders as missing | Missing evidence and unmeasured usage never become zero. |
| P3 - Confidence is evidence quality, never a win probability | Model class cannot change the confidence meaning. |
| P4 - Misses are published with equal prominence to hits | Shadow evaluation exposes candidate misses and regressions. |
| P5 - A rate is withheld below its minimum sample | Promotion rates remain withheld below the declared corpus minimum. |
| P6 - Say when the read is old | Failed generation preserves the prior brief and its original freshness. |
| P7 - No blackbox numbers | Published calculations remain owned by deterministic tool models. |
| P8 - Model-authored text is data, never markup | Every authored field remains escaped candidate data. |
| P9 - Works with nothing | The current public brief remains readable without model credentials. |
| P10 - UMD, never ESM | The feature adds no browser bundler or server requirement. |
| P11 - Reuse, never refetch | Exact accepted outcomes suppress repeated acquisition and authoring. |
| P12 - Cache-first, automatic first paint | The reader continues to paint the last validated publication first. |
| P13 - Tickers only, forever | No private portfolio state enters prompts, receipts, or publication. |
| P14 - Simple is the default, Power is the drill-down | The existing decision-first brief remains the default surface. |
| P15 - Everything is explained in place | Route, freshness, limitation, and evidence states remain explainable. |
| P16 - Deep-link, never duplicate | Brief claims continue linking to owning models instead of copying their math. |
| P17 - Reachable or removed | The capability reaches existing scheduled and on-demand publication entries. |
| P18 - Wired or not shipped | Promotion requires the live scheduler to consume the routed capability. |
| P19 - One definition per concept | Route, budget, materiality, and usage contracts each have one authority. |
| P20 - Every claim is scoreable | Route changes cannot relax recommendation scoreability. |
| P21 - Additive contracts, append-only history | New usage and route fields extend contracts and preserve history. |
| P22 - Budgets are assertions | Every budget has adversarial boundary tests and cannot rise to rescue a run. |
| P23 - A guard that cannot fail is not a guard | Each admission and publication guard receives a negative control. |
| P24 - Superseding closes the superseded | Cutover must close the replaced global-model policy in the same change. |
| P25 - Specs are capped, and never block on status | This specification has 40 requirements and depends on capabilities, not statuses. |

Roadmap examples do not prove delivery. Every capability in this feature remains
planned until implementation and current execution evidence establish it.

## Exposure Contract

| Capability | Surface class | Surface id | Status | Plan |
| --- | --- | --- | --- | --- |
| scheduled hybrid brief generation | cliCommand | `scripts/brief-refresh-scheduled.sh` | planned | `specs/030-budget-aware-hybrid-brief-generation` |
| on-demand hybrid brief generation | cliCommand | `scripts/brief-refresh-and-push.sh` | planned | `specs/030-budget-aware-hybrid-brief-generation` |
| route and usage inspection | internal | generation run receipt consumed by the publication validator | planned | `specs/030-budget-aware-hybrid-brief-generation` |
| shadow policy evaluation | internal | frozen-corpus evaluator consumed by the product auditor | planned | `specs/030-budget-aware-hybrid-brief-generation` |

## Evidence Sources

| Source | Observation used |
| --- | --- |
| `scripts/brief-narrative-parallel.mjs` | The live narrative path selects one global model and defines four principal lanes. |
| `scripts/brief-refresh-scheduled.sh` | Scheduled runs configure outer and per-lane attempts plus bounded concurrency. |
| `scripts/brief-refresh-and-push.sh` | The live path invokes parallel narrative generation before deterministic validation and publication. |
| `scripts/brief-refresh.mjs` | The evidence-first run state machine, reuse logic, author budgets, all-source barrier, and final author contracts already exist. |
| `scripts/brief-author.mjs` | Model authors already cross a bounded process and closed output boundary. |
| `scripts/web-evidence-acquire.mjs` | Source acquisition already has explicit calls, bytes, concurrency, and deadline budgets. |
| `specs/002-distributed-tool-briefs-and-history` | Owns distributed source briefs, reuse, barriers, immutable history, and atomic publication. |
| `specs/019-custom-recurring-research-agenda` | Owns recurring topic selection, dossiers, evidence roles, and sustained models. |
| `specs/026-actionable-brief-brevity-and-cross-asset` | Owns output brevity, delta-only publishing, dark states, and budget assertions. |
| `docs/Product-Principles.md` | Defines the 25 binding product principles applied above. |
