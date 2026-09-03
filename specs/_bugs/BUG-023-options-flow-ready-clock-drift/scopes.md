# Scopes: BUG-023 Options Flow Ready Clock Drift

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Planning Status

The bounded selftest repair and its earlier independent RED and GREEN evidence
are present. This reconciliation makes no new execution claim. Receipt-bound
scenario states, the shared-harness canary and restore proof, and the repository
E2E obligations remain In Progress.

## Execution Outline

### Phase Order

1. Scope 1 derives three explicit decision instants from `ownerState.nowMs`.
2. Scope 1 preserves the existing production freshness predicate and owner model.
3. Scope 1 adds persistent assertions for age zero and exactly seven days.
4. Scope 1 adds a persistent assertion for seven days plus one millisecond.
5. Scope 1 guards ready-only metric reads behind the ready-state branch.
6. Scope 1 records a bounded RED mutation for each scenario contract.
7. Scope 1 runs the registered complete repository selftest command.
8. Scope 1 proves that excluded production and product paths did not change.
9. Scope 1 records receipt-bound implementation and test evidence for all three scenarios.
10. Scope 1 runs the direct owner-path canary before the broader repository E2E command.
11. Scope 1 preserves external BUG-017, BUG-024, and Feature 031 findings as separately owned work.

### New Types And Signatures

- No production type, export, route, schema, or configuration changes.
- Existing input: `buildOptionsFlowToolRead({ asOf: string })`.
- Existing owner clock: `optionsFlowOwnerState(...).nowMs: number`.
- Local fixture helper: `optionsFlowAt(offsetMs: number): string`.
- Positive fixture: `optionsFlowAt(0)`.
- Inclusive fixture: `optionsFlowAt(7 * 86_400_000)`.
- First stale fixture: `optionsFlowAt(7 * 86_400_000 + 1)`.
- Existing ready output remains the only source of model metrics.
- Existing unavailable output remains free of ready-only metrics.

### Validation Checkpoints

- Before implementation, each RED mutation must fail its owning assertion.
- After implementation, each exact fixture must reach its specified state.
- The same production builder must execute for all three fixture instants.
- The complete command is exactly `node scripts/selftest.mjs`.
- The unavailable case must expose a named stale reason.
- The unavailable case must omit every ready-only metric key.
- The positive cases must expose owner-produced counts, lean, score, and ranking.
- A state mismatch must not trigger a secondary ready-only dereference.
- The direct production-owner canary must pass before the broader selftest runs.
- Scenario receipts must derive their state.
- The manifest must not declare lifecycle state.
- The final path check must allow only the BUG-023 packet and selftest block.
- Artifact and scenario guards must run before implementation handoff.

## Plan Summary

| Scope | Outcome | Surfaces | Tests | DoD summary | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Calendar-stable options-flow selftest | `scripts/selftest.mjs`, BUG-023 planning artifacts | Three functional regressions, scenario-specific and broader repository E2E, independent canary | Exact clocks, receipt-derived states, canary/restore, selftest-only boundary | In Progress |

## Scope 1: Make Options Flow Validation Calendar-Stable

**Status:** In Progress

**Depends On:** none

**Scope-Kind:** contract-only

**Requirements:** FR-BUG023-001 through FR-BUG023-007

### Dependency Direction

BUG-023 has no upstream dependency on Feature 031. It was created from
`F031-BROAD-OPTIONS-FLOW-001` to unblock Feature 031, so Feature 031 consumes this
repair and closes after BUG-023. The scenario node `shock-deliver-feature-031`
therefore lists `shock-close-bug-023` in `dependsOn`. BUG-023 does not list
Feature 031 as a dependency or completion prerequisite.

### Consumer Surface

The consumer is the repository command `node scripts/selftest.mjs`. It must report
the options-flow owner model and stale refusal truthfully on any execution date.

### Change Boundary

**Allowed file families:**

- The smallest options-flow owning-read block in `scripts/selftest.mjs`.
- `specs/_bugs/BUG-023-options-flow-ready-clock-drift/**`.

**Excluded surfaces:**

- `specs/031-shock-transmission-foundation/**`.
- All Feature 031 source, tests, and fixtures.
- Every Horizon Ladder source, data, note, and test.
- `tools.json`, `index.html`, and `rlnav.js`.
- `scripts/brief-refresh.mjs`, `scripts/owner-state.mjs`,
  `rlexperience-adapters/options.js`, and `data/options/**`.
- Every other bug packet and every installed framework path.

### Shared Infrastructure Impact Sweep

`scripts/selftest.mjs` is the shared repository validation harness. The permitted
edit stays inside its options-flow owning-read block. A defect there can disrupt
unrelated groups through ordering, timing, context construction, or failure
aggregation.

Downstream contract surfaces in the blast radius are:

- Tier-A assertion ordering and continuation after a state mismatch.
- Owner snapshot timing and `parsePagesChain` context injection.
- Ready-state metric access and unavailable-state failure reporting.
- The complete repository pass/fail accumulator.
- Externally owned BUG-017, BUG-024, and Feature 031 failure classification.

The independent canary imports the unchanged production owner modules directly.
It proves the three clock boundaries without using the modified selftest assertion
group. It must pass before the broader repository selftest runs.

The restore path is byte-conservative. RED controls use `BUG023_RED_CONTROL` and
must not rewrite `scripts/selftest.mjs`. Before and after canary execution, the
selftest SHA-256 must remain
`fc10b87d65549ea48dbdc3042b8526bfb30263e6bd42fb2635c5058b81fae439`. If it does
not, restore only the options-flow block to the implementation evidence identity,
then rerun the direct canary before any broad suite. Do not reset or replace the
whole shared harness.

#### Independent Canary Command

```bash
node --input-type=module -e '
import * as refresh from "./scripts/brief-refresh.mjs";
import * as owner from "./scripts/owner-state.mjs";
const page = refresh.loadToolFunctions("options-flow-feed-lab.html", ["parsePagesChain"]);
const ownerState = owner.optionsFlowOwnerState(process.cwd(), { parseChain: page.parsePagesChain });
if (!ownerState || !Number.isFinite(ownerState.nowMs)) throw new Error("finite ownerState.nowMs required");
const dayMs = 86_400_000;
const at = (offsetMs) => new Date(ownerState.nowMs + offsetMs).toISOString();
const ageZero = refresh.buildOptionsFlowToolRead({ asOf: at(0) });
const boundary = refresh.buildOptionsFlowToolRead({ asOf: at(7 * dayMs) });
const stale = refresh.buildOptionsFlowToolRead({ asOf: at(7 * dayMs + 1) });
const staleReadyKeys = ["tickers", "contractsFlagged", "consideredCount", "callPremium", "putPremium", "lean", "maxScore", "top"].filter((key) => Object.prototype.hasOwnProperty.call(stale.metrics, key));
const passed = ageZero.state === "ready" && boundary.state === "ready" && stale.state === "unavailable" && staleReadyKeys.length === 0;
console.log("BUG023_SHARED_HARNESS_CANARY=" + (passed ? "PASS" : "FAIL"));
if (!passed) process.exit(1);'
```

### Gherkin Scenarios

```gherkin
Feature: Options-flow repository validation uses explicit evidence clocks

  @SCN-BUG023-001
  Scenario: Live stale evidence remains unavailable
    Given committed options evidence older than the production freshness boundary
    When the live owner read evaluates at the current decision time
    Then it returns a named unavailable result
    And it exposes no ready-only metrics

  @SCN-BUG023-002
  Scenario: Positive owner-model proof uses an explicit evidence clock
    Given the same committed owner state and an explicit decision time inside the seven-day boundary
    When the options-flow read runs
    Then it reaches ready
    And publishes the owner model's real considered, flagged, lean, and ranked-contract values

  @SCN-BUG023-003
  Scenario: Repository validation is calendar-stable
    Given unchanged repository bytes and explicit clocks for the positive and stale cases
    When node scripts/selftest.mjs runs on different calendar dates
    Then the options-flow assertions keep the same outcome
    And unavailable metrics are not dereferenced as ready metrics
```

### Scenario Obligation Matrix

| Scenario | Behavior traits | Obligations | Production owner |
| --- | --- | --- | --- |
| `SCN-BUG023-001` | pure calculation, degraded state | Persistent production-path regression, named negative state, no plausible ready defaults | `scripts/brief-refresh.mjs#buildOptionsFlowToolRead` |
| `SCN-BUG023-002` | pure calculation | Persistent production-path regression over transformed owner-model output | `scripts/brief-refresh.mjs#buildOptionsFlowToolRead` |
| `SCN-BUG023-003` | pure calculation, static repository contract | Persistent repository regression and direct state-mismatch reporting | `scripts/selftest.mjs` options-flow assertion group |

### Implementation Plan

1. Load `parsePagesChain` through the existing page-function loader.
2. Build the owner state through `optionsFlowOwnerState()`.
3. Fail loudly unless `ownerState.nowMs` is finite.
4. Derive age-zero, exact-seven-day, and seven-days-plus-1ms ISO instants.
5. Call `buildOptionsFlowToolRead({ asOf })` for every fixture.
6. Assert ready owner-model output at age zero and exactly seven days.
7. Assert named unavailability and absent ready-only keys at the first stale instant.
8. Read counts, lean, score, and ranking only inside the ready-state branch.
9. Keep every production source, data, route, registry, and Feature 031 path unchanged.

### Persistent RED Controls

| Scenario | Bounded mutation | Exact RED command | Required RED signal |
| --- | --- | --- | --- |
| `SCN-BUG023-001` | Change the stale offset from `7D + 1ms` to `7D` in the selftest assertion group. | `node scripts/selftest.mjs` | The stale-state assertion fails because the inclusive boundary remains ready. |
| `SCN-BUG023-002` | Change the exact-seven-day offset from `7D` to `7D + 1ms` in the selftest assertion group. | `node scripts/selftest.mjs` | The boundary-ready assertion fails while production keeps its strict greater-than comparison. |
| `SCN-BUG023-003` | Remove the positive explicit `asOf` and the ready-state guard in the selftest assertion group. | `node scripts/selftest.mjs` | The options-flow group reproduces the clock drift and secondary unavailable-metric dereference. |

Restore the planned selftest bytes after each RED run. Do not mutate production freshness code for RED evidence.

### Test Plan

| ID | Scenario | Type | Category | File / exact assertion title | Exact command | Live system | Required result | Persistent RED control |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `TP-BUG023-01` | `SCN-BUG023-001` | Functional regression | functional | `scripts/selftest.mjs` / `options-flow first stale instant remains unavailable` | `node scripts/selftest.mjs` | No | The `T + 7D + 1ms` read is unavailable, names stale age, and omits all ready-only keys. | Replace `7D + 1ms` with `7D`. The stale assertion must fail. |
| `TP-BUG023-02` | `SCN-BUG023-002` | Functional regression | functional | `scripts/selftest.mjs` / `options-flow evidence-clock ready boundaries use owner model` | `node scripts/selftest.mjs` | No | The `T` and `T + 7D` reads are ready with owner-produced counts, lean, score, and ranking. | Replace the `7D` boundary with `7D + 1ms`. The boundary-ready assertion must fail. |
| `TP-BUG023-03` | `SCN-BUG023-003` | Repository regression | functional | `scripts/selftest.mjs` / `options-flow explicit clocks remain calendar-stable` | `node scripts/selftest.mjs` | No | The complete repository suite preserves all three outcomes and reports a direct state failure before any ready-only dereference. | Remove the positive explicit clock and ready guard. The options-flow group must reproduce both original failure modes. |
| `TP-BUG023-04` | `SCN-BUG023-001`, `SCN-BUG023-002`, `SCN-BUG023-003` | Regression E2E | functional | `scripts/selftest.mjs` / all three named options-flow assertions | `node scripts/selftest.mjs` | No | One repository process reaches the real parser, owner state, production builder, and owner model for all three scenario outcomes. | Run each existing `BUG023_RED_CONTROL`; its named scenario assertion must fail. |
| `TP-BUG023-05` | `SCN-BUG023-001`, `SCN-BUG023-002`, `SCN-BUG023-003` | Broader E2E regression | functional | `scripts/selftest.mjs` / `Research-Lab self-test` summary | `node scripts/selftest.mjs` | No | The complete repository command exits zero after the separately owned BUG-017, BUG-024, and Feature 031 findings close, with no options-flow regression. | Remove the explicit positive clock; the broader command must report the options-flow failure group. |
| `TP-BUG023-06` | `SCN-BUG023-001`, `SCN-BUG023-002`, `SCN-BUG023-003` | Fixture Canary | functional | direct `brief-refresh.mjs` and `owner-state.mjs` production path | Exact command in `Independent Canary Command` | No | The direct owner path returns ready at `T` and `T + 7D`, unavailable at `T + 7D + 1ms`, and no stale ready-only keys before the broad suite runs. | Change the stale canary offset to `T + 7D`; the canary must exit nonzero. |

### Definition of Done - Tiered Validation

#### Core Implementation

- [x] The options-flow assertion group derives all fixture instants from finite `ownerState.nowMs`, uses the same production builder, and guards ready-only reads. -> Evidence: [Implementation Clock Repair And Green Replays](report.md#implementation-clock-repair-and-green-replays)

#### Scenario Test Evidence

- [x] `TP-BUG023-01` proves `SCN-BUG023-001`, Live stale evidence remains unavailable. At seven days plus one millisecond, the result names staleness, omits ready-only metrics, and fails under its persistent RED mutation. -> Evidence: [TP-BUG023-01 Independent Evidence](report.md#tp-bug023-01-independent-evidence)
- [x] `TP-BUG023-02` proves `SCN-BUG023-002`, Positive owner-model proof uses an explicit evidence clock. Age zero and exactly seven days remain ready with real owner-model output and fail under the boundary RED mutation. -> Evidence: [TP-BUG023-02 Independent Evidence](report.md#tp-bug023-02-independent-evidence)
- [x] `TP-BUG023-03` proves `SCN-BUG023-003`, Repository validation is calendar-stable. The complete selftest keeps all explicit-clock outcomes, avoids unavailable-metric dereferences, and fails under the clock-drift RED mutation. -> Evidence: [TP-BUG023-03 Independent Evidence](report.md#tp-bug023-03-independent-evidence)
- [ ] Scenario-specific E2E regression tests for every new/changed/fixed behavior pass through `TP-BUG023-04`, with receipt bindings to `SCN-BUG023-001`, `SCN-BUG023-002`, and `SCN-BUG023-003`.
  > **Uncertainty Declaration**
  > **What was attempted:** This invocation reconciled planning only and did not execute `TP-BUG023-04`.
  > **What was observed:** Existing evidence predates the required scenario receipt bindings.
  > **Why this is uncertain:** The scenario-state resolver cannot derive the new E2E proof from unbound receipts.
  > **What would resolve this:** `bubbles.test` runs `node scripts/selftest.mjs` with the three required scenario bindings after the implementation receipt.
- [ ] Broader E2E regression suite passes through `TP-BUG023-05` after the separately owned external findings close.
  > **Uncertainty Declaration**
  > **What was attempted:** This invocation linked the broad command but did not rerun it as test evidence.
  > **What was observed:** The current recorded broad run has zero options-flow failures and two externally owned failures.
  > **Why this is uncertain:** A nonzero repository command cannot prove the broader E2E pass condition.
  > **What would resolve this:** `bubbles.test` records a zero-exit `node scripts/selftest.mjs` receipt after BUG-017 and BUG-024 close.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns through `TP-BUG023-06`.
  > **Uncertainty Declaration**
  > **What was attempted:** This invocation specified the direct owner-path canary but did not execute it as test evidence.
  > **What was observed:** Validate row 526 proves the same path on the prior planning bytes.
  > **Why this is uncertain:** Prior evidence does not certify the newly reconciled test-plan identity.
  > **What would resolve this:** `bubbles.test` runs the exact `TP-BUG023-06` command before the broad suite and records its scenario bindings.

#### Build Quality Gate

- [x] `node scripts/selftest.mjs` and the required BUG-023 planning guards record truthful exits. The final changed-path check shows no production freshness, Feature 031, Horizon Ladder, registry, navigation, route, data, or framework change. -> Evidence: [Final Test Integrity Gates](report.md#final-test-integrity-gates)
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified.
  > **Uncertainty Declaration**
  > **What was attempted:** The plan defines an environment-only RED path and a stable selftest hash.
  > **What was observed:** No restore drill ran during this planning invocation.
  > **Why this is uncertain:** Documentation alone cannot prove that the shared harness returns to the stable bytes.
  > **What would resolve this:** `bubbles.test` records matching pre/post hashes and reruns `TP-BUG023-06` before the broad suite.
- [ ] Change Boundary is respected and zero excluded file families were changed.
  > **Uncertainty Declaration**
  > **What was attempted:** Planning enumerated the allowed file families and excluded surfaces.
  > **What was observed:** This invocation did not produce implementation-owned changed-path evidence.
  > **Why this is uncertain:** Planning cannot certify the final implementation and test path inventory.
  > **What would resolve this:** `bubbles.implement` and `bubbles.test` record the final Git path inventory and protected-path hashes.

## Implementation Handoff

`bubbles.implement` next records the receipt-bound implementation identity for
the already-present bounded `scripts/selftest.mjs` change without altering the
repair. `bubbles.test` then owns the scenario-bound RED, targeted GREEN,
scenario-specific repository E2E, canary, restore, and broader regression
evidence. This planning update leaves all new DoD items unchecked.
