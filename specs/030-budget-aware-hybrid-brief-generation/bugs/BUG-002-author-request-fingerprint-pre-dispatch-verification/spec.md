# Bug Specification: BUG-002 Author Request Fingerprint Pre-Dispatch Verification

- **Owning feature:** `specs/030-budget-aware-hybrid-brief-generation`
- **Finding:** `F030-SEC-02`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress

## Problem Statement

The canonical request fingerprint is generated once but not re-derived before
dispatch. Syntax-valid stale fingerprints can authorize changed request data.

## Outcome Contract

**Intent:** Reuse the single canonical author-request fingerprint algorithm at
every side-effect boundary.

**Success signal:** TP-01-10 fails on current bytes and passes after the repair
for all eight fingerprinted fields at all three dispatch boundaries.

**Failure condition:** Any stale-digest mutation reaches a callback, child
spawn, route dispatch, `/v1/models`, or `/v1/chat/completions`.

## Requirements

| ID | Requirement |
| --- | --- |
| FR-B002-01 | `brief-author.mjs` MUST export additive `verifyAuthorRequestFingerprint(request)`. |
| FR-B002-02 | The verifier MUST reuse the existing private canonical projection and stable fingerprint algorithm. |
| FR-B002-03 | The verifier MUST re-derive exactly `contractVersion`, `data`, `provider`, `model`, `promptPolicy`, `schema`, `validator`, and `maxOutputTokens`. |
| FR-B002-04 | Existing request builders, fingerprint projection, constants, and generated request bytes MUST remain unchanged. |
| FR-B002-05 | `invokeAuthor` MUST verify before a transport callback or child spawn. |
| FR-B002-06 | `brief-route-runtime.mjs` MUST verify before route dispatch. |
| FR-B002-07 | `brief-openai-compatible-adapter.mjs` MUST verify before model preflight or HTTP work. |
| FR-B002-08 | Retaining a digest while mutating any fingerprinted field MUST return a closed refusal. |
| FR-B002-09 | Every stale-digest refusal MUST leave process, transport, model, and HTTP counters at zero. |
| FR-B002-10 | Provider canaries MUST use requests produced by existing canonical builders. |
| FR-B002-11 | A refusal MUST NOT reroute, switch provider, choose another model, or alter policy. |
| FR-B002-12 | The repair MUST NOT add a production consumer or change Copilot generation, publication, scheduler, or public artifacts. |

## Acceptance Scenario

```gherkin
Scenario: SCN-030-003 Retained fingerprint mutations refuse before every dispatch boundary
  Given a canonical builder produced a frozen author request and its request fingerprint
  When any fingerprinted field is changed while the original digest is retained
  Then invokeAuthor refuses before a callback or child spawn
  And the route runtime refuses before route dispatch
  And the OpenAI-compatible adapter refuses before model preflight or HTTP
  And no provider reroute or authoritative state change occurs
```

## Adversarial Contract

TP-01-10 must mutate each canonical field independently. It must retain the
original digest and execute each mutation through `invokeAuthor`, the route
runtime, and the adapter boundary.

Each case must assert a refusal and zero callback, spawn, model, and HTTP calls.
The test must use production fingerprint code and contain no conditional return
that can turn a dispatch into a pass.

## Preserved Constraints

- Keep all existing request builders and emitted bytes unchanged.
- Keep the canonical projection private except through the additive verifier.
- Keep the response contracts and downstream strict validation unchanged.
- Keep the shadow CLI as the only executable shadow consumer.
- Keep Copilot production authoritative.
- Keep `F030-SEC-01` and `F030-SEC-OBS-01` outside this repair.

## Product Principle Alignment

| Principle | Alignment |
| --- | --- |
| P7 - No blackbox numbers | A request digest must be reproducible from the exact canonical request fields. |
| P19 - One definition per concept | `brief-author.mjs` remains the sole fingerprint algorithm owner. |
| P21 - Additive contracts, append-only history | The verifier is an additive export; existing builders and bytes remain unchanged. |
| P23 - A guard that cannot fail is not a guard | TP-01-10 mutates every covered field and proves zero side effects. |

## Delivery Reality

This packet specifies an open repair. It does not claim source changes, authored
TP-01-10 coverage, GREEN execution, or certification.
