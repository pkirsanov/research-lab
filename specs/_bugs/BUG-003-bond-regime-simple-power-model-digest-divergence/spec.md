# Bug Specification: BUG-003 Bond Regime Simple/Power Model-Digest Divergence

Links: [bug.md](bug.md) | [design.md](design.md) | [scopes.md](scopes.md) | [report.md](report.md) | [uservalidation.md](uservalidation.md)

## Problem Statement

Feature 003 defines one computation feeding two UI compositions. Its protected SCN-003-011 contract requires Simple and Power to expose the same decision digest when a user switches modes without refreshing. Independent BUG-002 acceptance found that contract failing: Simple exposed `8a020d8b` and Power exposed `40108ba6`.

Current-session inspection shows both values are real outputs of successive automatic-hydration states. The product renders cached state, says Ready, starts background hydration, says Ready again from intermediate renders, and finally replaces the shared view model. The protected test can therefore compare two times even though it correctly targets two modes. A timing-dependent pass is insufficient because Ready does not identify a stable comparison boundary.

## Outcome Contract

**Intent:** Make the Bond Regime Ready state a stable publication boundary so Simple and Power always compose one settled model during a no-refresh mode switch.

**Success Signal:** The unchanged `BS-011 Simple and Power share one model digest` test passes, a deterministic adversarial test proves Ready is withheld while automatic Treasury hydration is unresolved, the complete Bond Regime file passes, and the complete system-Chrome inventory passes with zero mode-switch requests and unchanged assumptions.

**Hard Constraints:** Preserve SCN-003-011, FR-041, FR-042, the exact BS-011 title and assertions, cache-first meaningful paint, automatic delta hydration, one `computeBondLabViewModel` path, composition-only mode switching, zero internal request interception, external-boundary-only deterministic fixtures, no package or registry change, and the explicit change boundary in this packet.

**Failure Condition:** The repair fails if Ready can be observed while automatic hydration may still replace `runtime.viewModel`; if Simple and Power can expose different digests for one no-refresh interaction; if the protected test is weakened, delayed, renamed, skipped, or repointed; if mode switching starts computing or fetching; or if an excluded path changes.

## Evidence Basis

| Evidence | Contract conclusion |
| --- | --- |
| Independent complete system-Chrome inventory | 72 passed and protected BS-011 failed with Simple `8a020d8b` versus Power `40108ba6` |
| Independent isolated replay | 0 passed and 1 failed for the exact protected title |
| Current exact isolated replays | Both passed after hydration settled, proving the defect is scheduling-sensitive |
| Current complete Bond file replay | 26 passed, including BS-011, which confirms that green replay alone cannot close a race |
| Twelve-page mutation timeline | Every page produced `8a020d8b` then `40108ba6` through the same runtime and Simple node |
| `bond-regime-lab.html::setMode` | Mode switch does not call `recompute()` or replace the view model |
| `bond-regime-lab.html::render` and `hydrate` | Ready is written while `refresh.active` is true and before the refresh promise terminal state |
| Feature 003 spec/design/manifest | SCN-003-011 is required, regression-protected, and based on one shared `BondLabViewModel` |

## Actors And Use Cases

| Actor | Goal | Required boundary |
| --- | --- | --- |
| Bond Regime user | Switch from Simple summary to Power detail without changing the decision | Both views compose one settled model |
| Keyboard user | Change tabs while automatic hydration is active | Status remains truthful and controls do not create a second model path |
| Feature 003 owner | Keep SCN-003-011 as a durable protected contract | Test title and assertions remain unchanged |
| BUG-002 test owner | Complete independent acceptance without a foreign protected regression | Exact, focused-file, and complete inventory checks are green |
| Feature 006 owner | Resume Scope 3 only after the blocking chain is green | Receives independent evidence, not implementation assertions |

### Single-Capability Justification

This bug repairs one lifecycle in one existing static tool. It introduces no second provider, strategy, adapter, storage mechanism, shared UI foundation, or cross-tool capability. A new abstraction would increase blast radius without solving another variation. The correct repair remains local to the Bond Regime boot/hydration boundary and its feature-specific regression file.

### Single-Screen Justification

Simple and Power are two compositions inside the same `bond-regime-lab.html` document, not separate screens or reusable cross-feature UI. This repair changes only when that page may report Ready; it adds no primitive, component contract, navigation target, or shared composition rule. Existing page-local controls and DOM projections remain the concrete implementation.

## Requirements

### Stable Ready Boundary

- **BRD-001:** Cached observations must still render before external hydration completes.
- **BRD-002:** While automatic hydration can still replace `runtime.observedSnapshot` or `runtime.viewModel`, `appStatus` must remain Refreshing and must not expose Ready.
- **BRD-003:** Ready may be published only after `runtime.refresh.active` is false for the current automatic hydration promise.
- **BRD-004:** Boot must not create an externally observable Ready interval before the automatic hydration lifecycle starts.
- **BRD-005:** Success and explicit degraded-source completion both settle to Ready only after the final recompute for that hydration attempt.
- **BRD-006:** Refresh status must remain truthful if cached recompute or final recompute invokes the shared renderer.

### One Model, Two Compositions

- **BRD-007:** `computeBondLabViewModel` remains the only full model assembly path.
- **BRD-008:** `render()` and `renderPower()` must project the same current `runtime.viewModel.decisionDigest`.
- **BRD-009:** `setMode()` must not call `recompute()`, fetch data, replace observations, or mutate decision inputs.
- **BRD-010:** A mode switch must preserve scenario assumptions and add zero requests.
- **BRD-011:** No mode-specific digest or duplicate digest source may be added.

### Protected Regression Integrity

- **BRD-012:** The existing test title remains exactly `BS-011 Simple and Power share one model digest`.
- **BRD-013:** Its Simple digest read, Power click, Power digest read, digest equality, assumption preservation, and zero-request assertions remain intact.
- **BRD-014:** A deterministic adversarial E2E case must hold the true external Treasury boundary unresolved, assert that Ready is not exposed, release that boundary, await Ready, and then prove digest parity.
- **BRD-015:** The adversarial test must fail on the current production lifecycle before the production edit and pass after repair.
- **BRD-016:** No conditional return, skip, retry-to-green loop, internal request interception, or self-validating digest injection is permitted.

### Containment And Resume

- **BRD-017:** Only `bond-regime-lab.html`, the feature-specific Bond Regime test file, and BUG-003 evidence/state artifacts may change.
- **BRD-018:** Feature 003 planning/state, Feature 006, BUG-002, Market Brief, shared JavaScript, registries, package graph, Feature 005, framework files, and unrelated dirty paths remain byte-untouched.
- **BRD-019:** Delivery records just-in-time hashes/status for both authorized existing files and stops on concurrent drift.
- **BRD-020:** Independent verification runs the exact protected title, complete Bond file, and complete system-Chrome inventory in that order after focused GREEN.
- **BRD-021:** Only after that independent chain is green does ownership return to BUG-002 SCOPE-01 `bubbles.test`, followed by BUG-002 validation/audit and the parent Feature 006 Scope 3 replay.

## User Scenarios

### SCN-BUG003-001: Ready identifies one stable model across Simple and Power

```gherkin
Scenario: SCN-BUG003-001 Ready identifies one stable model across Simple and Power
  Given cached Bond Regime bars are painted and automatic external Treasury hydration is unresolved
  When the page reports its readiness state and the user switches from Simple to Power after Ready
  Then Ready is absent until automatic hydration has settled
  And Simple and Power expose the same shared decision digest
  And assumptions remain unchanged
  And the mode switch adds no request
```

This bug scenario repairs the timing precondition of existing protected `SCN-003-011`; it does not replace, invalidate, rename, or relax that scenario.

## Acceptance Criteria

| ID | Acceptance signal |
| --- | --- |
| AC-BUG003-001 | The new adversarial E2E test fails before production repair because Ready appears while the external Treasury boundary remains unresolved. |
| AC-BUG003-002 | After repair, cached content is visible under Refreshing and Ready appears only after the held boundary is released and final recompute completes. |
| AC-BUG003-003 | The existing protected BS-011 title and assertions are byte-unchanged and pass. |
| AC-BUG003-004 | The adversarial test reads code-produced digests, never injects an expected digest, and proves both values equal after Ready. |
| AC-BUG003-005 | The complete `tests/bond-regime-lab.spec.mjs` file passes on `system-chrome`. |
| AC-BUG003-006 | The complete system-Chrome inventory passes with no skipped required test. |
| AC-BUG003-007 | `node scripts/selftest.mjs`, regression-quality, source-lock, artifact, freshness, traceability, G094, diagnostics, JSON-contract, and change-boundary checks pass. |
| AC-BUG003-008 | Path-scoped status and hash evidence proves every excluded surface stayed untouched. |
| AC-BUG003-009 | BUG-002 independent test resumes only after AC-BUG003-001 through AC-BUG003-008 have independent evidence. |

## Test Contract

### Existing Protected Regression

- **Title:** `BS-011 Simple and Power share one model digest`
- **Path:** `tests/bond-regime-lab.spec.mjs`
- **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "BS-011 Simple and Power share one model digest" --reporter=list`
- **Integrity:** Preserve the exact title and all current behavior assertions. Do not add a wait inside this test as the production Ready contract must carry the stability guarantee.

### Deterministic Adversarial Regression

- **Title:** `Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison`
- **Path:** `tests/bond-regime-lab.spec.mjs`
- **Command:** `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/bond-regime-lab.spec.mjs --grep "Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison" --reporter=list`
- **RED:** Hold the true external Treasury route unresolved without timers. Current production exposes Ready from an intermediate render, so the direct not-Ready assertion fails.
- **GREEN:** Repaired production keeps cached content under Refreshing, publishes Ready only after release/final recompute, then exposes equal Simple/Power digests with unchanged assumptions and zero mode-switch requests.

The test uses real production page/model/render code over the existing ephemeral HTTP server. Only the true external Treasury boundary is fixture-controlled. It reads no credential, contacts no production monitoring or backup surface, and mutates no repository file.

## Excluded Changes

- Adding a wait, retry, conditional bailout, skip, or weaker equality to the protected BS-011 test.
- Renaming or repointing SCN-003-011 or its exact test title.
- Creating separate Simple/Power calculators or digests.
- Disabling automatic hydration or removing cache-first paint.
- Editing Feature 003 planning/state to redefine the contract.
- Editing Feature 006, BUG-002, Market Brief, shared JavaScript, registries, package/dependency graph, Feature 005, Playwright configuration, framework files, or unrelated dirty paths.

## Parent Resume Contract

The blocked acceptance chain is fixed and ordered: BUG-003 repair and focused adversarial GREEN, exact protected BS-011 GREEN, complete Bond file GREEN, complete system-Chrome inventory GREEN, return BUG-002 SCOPE-01 to `bubbles.test`, validate and audit BUG-002, then replay Feature 006 Scope 3. This packet leaves every state and evidence surface owned by those later links unchanged.
