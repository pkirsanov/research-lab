# Scope 04: SimpleModel Core Runtime

## 04-simple-model-core-runtime

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `foundation-overlay:true`, `determinism-critical:true`, `no-owner-adapter:true`

Depends On: 03-contextual-tooltip-foundation

**Primary Outcome:** The shared runtime validates and normalizes explicit SimpleModel definitions/parameters/evidence/seeds, creates stable semantic identities, orchestrates immutable baseline/current runs, compares sensitivity with common randomness, renders truth states, and refuses missing/unregistered owner adapters without performing source acquisition or embedding an owner formula.

## Requirement Coverage

- **Functional foundation:** FR-009 through FR-020 contract/runtime semantics, excluding concrete owner-formula delivery assigned to Scopes 05-07.
- **Non-functional:** NFR-004 through NFR-007, NFR-011 through NFR-015, and NFR-018.
- **Design contracts:** `SimpleModelDefinition/v1`, `ParameterDefinition/v1`, `NormalizedSimpleInput/v1`, `SimpleModelRun/v1`, `SimpleModelAdapter/v1`, stable compute identity, common-random-number sensitivity, cancellation, and exact truth states.

## Gherkin Scenarios

### SCN-012-034 - Core refuses missing owner behavior without inventing a model

```gherkin
Scenario: SCN-012-034 A valid model definition names an adapter that is not registered yet
  Given the definition, parameters, evidence references, and seed policy validate
  But no matching owner adapter is registered
  When the shared Simple runtime prepares the experience in a real page
  Then it renders an explicit unavailable state naming the missing adapter capability
  And it performs no provider request, owner-model substitution, default-value injection, or formula computation
  And registering a contract-valid adapter later does not require changing the shared runtime or tool-ID branching
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-034 unavailable owner adapter | Valid actual definition; adapter intentionally not registered | Open Simple and inspect source/truth controls | Exact unavailable state names adapter/owner requirement; no number, neutral verdict, hidden fallback, enabled decorative control, or request appears | e2e-ui |
| Invalid parameter | Production runtime receives out-of-domain value after one valid normalized input | Change control beyond declared range | Inline exact domain error; last valid identity/result remains; no new run or fetch occurs | functional/e2e-ui |
| Stale/missing input | Evidence lacks required finite field or stale policy rejects it | Open Simple | Partial/unavailable required-versus-observed state appears; no zero/average/prior unlabeled value | e2e-ui |

## Implementation Files

### Modified

- `rlexperience.js`
- `simple-models.json`
- `tool-experience.config.json`
- `scripts/validate-tool-experience.mjs`
- `scripts/selftest.mjs`

### New

- `tests/simple-models.unit.mjs`
- `tests/simple-model-runtime.functional.mjs`
- `tests/simple-models.spec.mjs`

## Implementation Plan

1. Implement strict definition/parameter/seed/scenario/policy validation with required explicit values, finite numeric domains, exact enum options, mandatory output paths, and no ambient/date/random default.
2. Implement deep-clone/freeze normalization and canonical semantic hashing over exact contract/model/evidence/parameter/seed/scenario/policy inputs. Exclude occurrence/render/storage/view time from identity.
3. Implement adapter registration by exact ID, duplicate/undeclared registration rejection, capability lookup, and pure lifecycle orchestration. The runtime may call only registered adapter methods; it cannot fetch, read provider keys, author, publish, or mutate storage.
4. Implement immutable baseline and current inputs/runs, explicit baseline reset, changed-parameter tracking, cancellation tokens for heavy cooperative compute, and stale-completion rejection.
5. Implement common-random-number sensitivity orchestration and separate seed-change/path-run identity. The core does not supply the stochastic process or owner formula.
6. Implement complete `ready/partial/stale/unavailable/disputed/rejected` projections, provenance classes, evidence cutoffs, assumptions, limitations, uncertainty, invalidation, and no-execution copy through safe DOM construction.
7. Add an unavailable-adapter real-page regression plus functional adapters defined inside the test boundary solely to exercise the production adapter interface and deterministic orchestration. These interface tests do not count as owner-adapter integration or feature completion.
8. Add performance/cancellation checks for the core orchestration budget, with no network wait and no claim about domain adapter compute until Scopes 05-07.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Scope 01 registries | Existing fingerprints and declaration validation remain stable | Re-run real registry validator before/after runtime additions |
| Scope 02 shell | Simple unavailable/ready projections do not alter mode/hash/history/focus | Shell functional and E2E canary remains green with missing adapter state selected |
| Scope 03 context | Parameter/result context uses RLCTX and essential truth remains visible | Context unit/functional suite validates no second disclosure owner |
| Source owners | No runtime path invokes fetch/provider/storage/author/publication | Static capability scan plus request/storage ledger around functional and browser runs |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** every `rlexperience-adapters/**` domain module, owner page/formula, `rldata.js`, `rlviews.js`, `rlapp.js`, `rlcontext.js`, RLG/RLTKR/RLCHART, Journey/market-action/WebEvidence/publication files, provider/config keys, options owner/data, Feature 002/008/BUG-004, QF, package/source-lock files, and framework-managed files.

**No owner adapter:** test-interface implementations must remain under `tests/` and cannot be registered by the shipped registry.

## Rollback

Remove only Scope 04 runtime behavior and tests, restore the Scope 01 validation-only `rlexperience.js`/config/definition bytes, and re-run Scope 01-03 canaries. No registry ID, owner page, source data, local session, or publication object is rewritten.

## Scenario-First RED/GREEN Contract

Create the exact unavailable-adapter, normalization, identity, sensitivity, no-effect, missing-input, and cancellation assertions before runtime behavior. The narrowest unit command runs immediately after the first edit; functional runs immediately after lifecycle wiring. RED cannot be a deliberately throwing pass-through fixture: it must prove production runtime behavior is absent or wrong.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-04-01 | Unit | unit | SCN-012-034 | `tests/simple-models.unit.mjs` | Validate definitions, explicit defaults, seeds, normalized input, canonical identity, states, adapter registration, common-random sensitivity orchestration, and closed errors | `node --test tests/simple-models.unit.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Functional | functional | SCN-012-034 | `tests/simple-model-runtime.functional.mjs` | Exercise production runtime with contract-test adapters: baseline/current immutability, reset, changed parameters, no-effect rejection, seed separation, stale completion, cancellation, and zero fetch/storage/author calls | `node --test tests/simple-model-runtime.functional.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Regression E2E | e2e-ui | SCN-012-034 | `tests/simple-models.spec.mjs` | `Regression: SCN-012-034 missing owner adapter stays unavailable without defaults fetch or fabricated result` | `npx --no-install playwright test tests/simple-models.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-034 missing owner adapter stays unavailable without defaults fetch or fabricated result" --reporter=list` | Yes | `report.md#scenario-scn-012-034` |
| TP-04-04 | Truth-state Regression E2E | e2e-ui | SCN-012-034 | `tests/simple-models.spec.mjs` | `Regression: Simple core preserves last valid run across invalid stale missing and non-finite input` | `npx --no-install playwright test tests/simple-models.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Simple core preserves last valid run across invalid stale missing and non-finite input" --reporter=list` | Yes | `report.md#tp-04-04` |
| TP-04-05 | Performance functional | functional | SCN-012-034 | `tests/simple-model-runtime.functional.mjs` | Prove standard orchestration stays within configured budget and heavy work yields in configured chunks, is cancellable, and discards stale tokens | `node --test --test-name-pattern="Simple runtime performance and cancellation" tests/simple-model-runtime.functional.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Broad regression | unit | SCN-012-034 | `scripts/selftest.mjs` | Preserve registry/shell/context/current model invariants and add core identity/no-authority canaries | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] The pure core enforces explicit definitions/parameters/seeds/evidence/policies, stable identity, immutable baseline/current runs, sensitivity orchestration, cancellation, provenance, uncertainty, and exact truth states. → Evidence: [report.md#tp-04-01](../04-simple-model-core-runtime/report.md#tp-04-01), [report.md#tp-04-02](../04-simple-model-core-runtime/report.md#tp-04-02)
- [x] Missing/unregistered owner behavior fails unavailable and no core path fetches, reads keys, mutates storage, authors, publishes, copies formulas, or supplies a behavioral default. → Evidence: [report.md#scenario-scn-012-034](../04-simple-model-core-runtime/report.md#scenario-scn-012-034), [report.md#forbidden-authority-scan](../04-simple-model-core-runtime/report.md#forbidden-authority-scan)
- [x] Scope 01-03 registry/shell/context contracts and rollback canaries remain green. → Evidence: [report.md#tp-04-06](../04-simple-model-core-runtime/report.md#tp-04-06)

#### Test Evidence Items - Exact Parity With 6 Test Plan Rows

- [x] TP-04-01 unit evidence proves the closed core schemas, identity, adapter, seed, sensitivity, and error semantics. → Evidence: [report.md#tp-04-01](../04-simple-model-core-runtime/report.md#tp-04-01)
- [x] TP-04-02 functional evidence proves lifecycle behavior, no-effect/stale/cancellation rejection, and zero forbidden authority. → Evidence: [report.md#tp-04-02](../04-simple-model-core-runtime/report.md#tp-04-02)
- [x] TP-04-03 E2E evidence proves SCN-012-034 honest unavailable owner state with no fabricated result. → Evidence: [report.md#scenario-scn-012-034](../04-simple-model-core-runtime/report.md#scenario-scn-012-034)
- [x] TP-04-04 E2E evidence proves invalid/stale/missing/non-finite input preserves truth and last-valid state. → Evidence: [report.md#tp-04-04](../04-simple-model-core-runtime/report.md#tp-04-04)
- [x] TP-04-05 performance evidence proves configured local responsiveness, cooperative chunks, cancellation, and stale-token discard. → Evidence: [report.md#tp-04-05](../04-simple-model-core-runtime/report.md#tp-04-05)
- [x] TP-04-06 broad selftest evidence proves existing Research Lab behavior remains green. → Evidence: [report.md#tp-04-06](../04-simple-model-core-runtime/report.md#tp-04-06)

#### Build Quality Gate

- [x] Scenario RED/GREEN, system-Chrome identity, no-interception scan, forbidden-authority/static source scan, deterministic repeatability, performance/cancellation output, protected-path diff, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and broad selftest are current and clean. → Evidence: [report.md#redgreen-replay-evidence](../04-simple-model-core-runtime/report.md#redgreen-replay-evidence), [report.md#no-interception-scan](../04-simple-model-core-runtime/report.md#no-interception-scan), [report.md#forbidden-authority-scan](../04-simple-model-core-runtime/report.md#forbidden-authority-scan), [report.md#lintquality](../04-simple-model-core-runtime/report.md#lintquality)
