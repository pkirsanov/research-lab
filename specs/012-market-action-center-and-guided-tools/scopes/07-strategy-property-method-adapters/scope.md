# Scope 07: Strategy, Property, And Method Simple Adapters

## 07-strategy-property-method-adapters

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-overlay:true`, `owner-parity-critical:true`, `registry-completion:true`

Depends On: 06-macro-rotation-fundamental-adapters

**Primary Outcome:** The remaining six ordinary tools plus the Market Action Center action-triage model use actual owner logic. Strategy simulations prove visible seeded reproducibility, property/method models preserve evidence limitations, and release validation accounts for all 22 ordinary Simple adapters plus the internal Center triage model without a generic fallback.

## Requirement Coverage

- **Functional:** FR-009 through FR-020 for the remaining six ordinary tools and the in-Brief action-triage model.
- **Non-functional:** NFR-004 through NFR-007, NFR-011 through NFR-015, NFR-017 through NFR-018.
- **Acceptance:** SCN-012-002 plus derived SCN-012-036. SCN-012-032 all-tool Journey goals remains Scope 08.

## Gherkin Scenarios

### SCN-012-002 - Stochastic Simple results are reproducible

```gherkin
Scenario: SCN-012-002 A Simple simulation is repeated with one seed
  Given model inputs, parameters, evidence identity, and seed are unchanged
  When the simulation runs twice
  Then result identity and output summary are identical
  And changing the seed creates a distinct run
  And parameter sensitivity remains separate from path randomness
```

### SCN-012-036 - Every ordinary registry tool owns a distinct model adapter

```gherkin
Scenario: SCN-012-036 The complete ordinary-tool Simple adapter inventory is validated
  Given Scopes 05 through 07 have registered their declared domain adapters
  When the production registry loop executes every ordinary definition
  Then all 22 ordinary tools resolve exactly one actual owner adapter
  And every enabled parameter has a proved production output effect or explicit modeled flat region
  And every Simple research question, result path, and interaction is distinct from its Power investigation
  And no unavailable owner is replaced by a generic model, copied formula, or hardcoded tool switch
```

## Adapter And Owner Map

| Tool / Internal Model | Adapter / Module | Existing Owner Seam | Steerable Simple Inputs | Produced Result And Power Distinction |
|---|---|---|---|---|
| `strategy-self-improvement-lab` | `strategy-evolution/v1` / `strategy-research.js` | seeded strategy path/walk-forward/search logic in `strategy-self-improvement-lab.html` | numeric goal, one allowed variable, search budget, overfit penalty, path seed, acceptance rule | accepted/rejected change distribution; Power retains trials, folds, scorecard, penalties, ledger, and rejected candidates |
| `strategy-validation-lab` | `walk-forward-validation/v1` / `strategy-research.js` | real-data fold/embargo/cost/deflated evidence in `strategy-validation-lab.html` | rule, universe, folds, embargo, costs, trial count, robustness threshold | OOS/deflated robustness sensitivity; Power retains fold results, cross-instrument hold, costs, and curve-fit diagnostics |
| `smart-money-flow-lab` | `disclosure-decay/v1` / `strategy-research.js` | filing-lag/cluster/consensus/decay logic in `smart-money-flow-lab.html` | source mix, lag half-life, cluster minimum, consensus threshold, edge-decay rule | surviving conviction sensitivity; Power retains records, clocks, breadth, quality, and decay audit |
| `waterfront-polo-lab` | `location-suitability/v1` / `property-research.js` | property/water/travel/hazard suitability logic in `waterfront-polo-lab.html` | budget, square footage, land/privacy, water type, travel time, insurance/flood, club verification | market suitability ranking; Power retains every row, distance approximation, water/hazard/club evidence |
| `palm-springs-rental-market-lab` | `str-scenario/palm-springs/v1` / `property-research.js` | shared `rlrental.js` place-based engine used by the Palm Springs page | segment, ADR, occupancy, financing, expenses, insurance/regulatory shock, horizon | cash-flow/evidence sensitivity; Power retains nine categories, segment evidence, scenarios, sources, and missing economics |
| `ocean-shores-rental-market-lab` | `str-scenario/ocean-shores/v1` / `property-research.js` | shared `rlrental.js` place-based engine used by the Ocean Shores page | segment, seasonal occupancy, ADR, financing, costs, storm/insurance, regulation, horizon | seasonal cash-flow/evidence sensitivity; Power retains nine categories, local seasonality, sources, and missing economics |
| Market Action Center Brief internal model | `market-action-triage/v1` / `market-action.js` | existing Market Brief window/action-gating functions, extracted without changing current payload behavior | window, horizon, evidence threshold, catalyst horizon, risk posture | bounded action/no-action triage inside Brief; no top-level Simple and no Power; evidence details remain disclosures |

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-002 seeded strategy | Qualified deterministic path evidence | Run same seed twice, change a parameter with same seed, then choose new seed | Same seed repeats identity/output; parameter delta uses common randomness; new seed is labeled path change, not sensitivity | e2e-ui |
| SCN-012-036 each remaining ordinary tool | Valid owner evidence or explicit unavailable state | Change meaningful controls, compare baseline/current, open Power | Actual owner result changes or exact unavailable appears; limitations/gaps remain; no generic result | e2e-ui |
| Center triage model | Current legacy-compatible Market Brief public evidence | Change in-view triage controls | Bounded action/no-action result changes inside Brief; no top-level Simple tab appears | e2e-ui |

## Implementation Files

### New

- `rlexperience-adapters/strategy-research.js`
- `rlexperience-adapters/property-research.js`
- `rlexperience-adapters/market-action.js`
- `tests/simple-model-adapters-strategy-property.unit.mjs`
- `tests/simple-model-adapters-strategy-property.spec.mjs`

### Modified

- `simple-models.json`
- `tests/simple-model-adapters.integration.mjs`
- `strategy-self-improvement-lab.html`
- `strategy-validation-lab.html`
- `smart-money-flow-lab.html`
- `waterfront-polo-lab.html`
- `palm-springs-rental-market-lab.html`
- `ocean-shores-rental-market-lab.html`
- `rlrental.js`
- `market-brief.html`
- `market-brief.config.json`
- `scripts/validate-tool-experience.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Add RED tests for seeded repeatability/common randomness, each remaining owner parameter effect, Center triage/no-action, and complete 22-tool adapter inventory.
2. Complete six ordinary definitions and the internal Center triage definition with exact parameters, units/domains/sources, result paths, seed/scenario policies, evidence states, limitations, and deep links.
3. Extract minimal pure owner seams only; both owner Power/current page and adapter consume one function. Shared `rlrental.js` remains the sole place-based formula owner.
4. Register exact strategy, property, and Center adapter IDs. The Center adapter is selected by registry metadata and renders only inside Brief; it cannot add a fifth/top-level Simple view.
5. Enforce explicit integer seed and common-random-number behavior for seeded strategy simulation. No ambient randomness, `Date.now()`, or hidden reseed participates.
6. Preserve static/off-theme/synthetic provenance and exact evidence limitations. Synthetic strategy data remains clearly simulated; property/club/hazard/economic gaps remain incomplete rather than zero-filled.
7. Extend the production integration loop to all 22 ordinary adapters plus the internal Center model. Validate every output path and Simple-versus-Power distinction; no missing tool can pass through a generic adapter.
8. Add per-tool browser effects and all-tool release validation. Any unresolved ordinary owner adapter blocks shell cutover rather than being silently omitted.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Strategy pages | Existing deterministic seeds, folds, ledgers, and source labels remain stable | Pre/post semantic fingerprints plus same-seed and new-seed tests |
| `rlrental.js` and two rental pages | Shared place-based equations and source-qualified incomplete states remain identical | Existing place-based contract/unit and Palm Springs browser suites plus Ocean Shores parity |
| Current Market Brief | Existing route/payload/action gates remain truthful before Scope 09/11 redesign | Legacy payload validator and action-gate canary; no new authored provenance label |
| All prior adapters | Scope 05/06 output fingerprints remain stable | Full registry loop compares prior adapter identities/results after Scope 07 registration |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `rldata.js`, provider credentials/paths, all Scope 05/06 owner pages/modules except the shared integration test, Journey/Brief author/publication/private portfolio/Red Alert files, option producer/data, Feature 002/008/BUG-004, QF, package/source-lock files, and framework-managed files.

**Center boundary:** Scope 07 may add the action-triage model and in-view host only. Product rename, route consumer migration, Portfolio/Red Alert/Journey views, and authored Brief cutover belong to later scopes.

## Rollback

Unregister the three Scope 07 modules, restore six owner pages/`rlrental.js`/Market Brief hunks, remove their definition/test additions, and prove all Scope 05/06 adapter fingerprints plus legacy Market Brief and rental/strategy owner behavior remain green. No local strategy ledger, rental data, provider cache, or publication object is deleted.

## Scenario-First RED/GREEN Contract

Write same-seed/new-seed/common-randomness and per-tool parameter-effect tests before owner extraction. Same-seed RED must fail because production behavior is missing/wrong, not because the test injects a random expected value. After each owner seam, run the focused row before touching the next tool; run the all-22 loop before any visible release claim.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-07-01 | Unit | unit | SCN-012-002, SCN-012-036 | `tests/simple-model-adapters-strategy-property.unit.mjs` | Validate seven definitions/adapters, seeds/common randomness, source classes, gaps, no-effect mutations, and Center in-view-only rule | `node --test tests/simple-model-adapters-strategy-property.unit.mjs` | No | `report.md#tp-07-01` |
| TP-07-02 | Complete adapter integration | integration | SCN-012-002, SCN-012-036 | `tests/simple-model-adapters.integration.mjs` | Registry-derived loop proves all 22 ordinary adapters plus Center triage, every enabled parameter effect/owner parity, distinct Simple questions, and no generic fallback | `node --test tests/simple-model-adapters.integration.mjs` | No | `report.md#tp-07-02` |
| TP-07-03 | Regression E2E | e2e-ui | SCN-012-002, SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: strategy self-improvement Simple repeats one seed and separates parameter sensitivity from path randomness` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: strategy self-improvement Simple repeats one seed and separates parameter sensitivity from path randomness" --reporter=list` | Yes | `report.md#scenario-scn-012-002` |
| TP-07-04 | Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: strategy validation Simple controls recompute owner out-of-sample evidence` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: strategy validation Simple controls recompute owner out-of-sample evidence" --reporter=list` | Yes | `report.md#tp-07-04` |
| TP-07-05 | Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: smart-money Simple controls recompute owner disclosure-lag decay` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: smart-money Simple controls recompute owner disclosure-lag decay" --reporter=list` | Yes | `report.md#tp-07-05` |
| TP-07-06 | Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: waterfront polo Simple controls recompute owner suitability with unverified evidence visible` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: waterfront polo Simple controls recompute owner suitability with unverified evidence visible" --reporter=list` | Yes | `report.md#tp-07-06` |
| TP-07-07 | Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: Palm Springs Simple controls recompute owner cash-flow without zero-filling gaps` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Palm Springs Simple controls recompute owner cash-flow without zero-filling gaps" --reporter=list` | Yes | `report.md#tp-07-07` |
| TP-07-08 | Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: Ocean Shores Simple controls recompute owner seasonal cash-flow without zero-filling gaps` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Ocean Shores Simple controls recompute owner seasonal cash-flow without zero-filling gaps" --reporter=list` | Yes | `report.md#tp-07-08` |
| TP-07-09 | Center triage Regression E2E | e2e-ui | SCN-012-036 | `tests/simple-model-adapters-strategy-property.spec.mjs` | `Regression: Market Action triage controls recompute bounded action or no-action inside Brief only` | `npx --no-install playwright test tests/simple-model-adapters-strategy-property.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: Market Action triage controls recompute bounded action or no-action inside Brief only" --reporter=list` | Yes | `report.md#tp-07-09` |
| TP-07-10 | All-tool release validator | functional | SCN-012-036 | `scripts/validate-tool-experience.mjs` | Validate 23 registry entries, 22 actual ordinary adapters, one in-Brief Center model, explicit effects, no generic adapter, and no unresolved definition | `node scripts/validate-tool-experience.mjs --require-simple-adapters` | No | `report.md#tp-07-10` |
| TP-07-11 | Broad regression | unit | SCN-012-002, SCN-012-036 | `scripts/selftest.mjs` | Preserve every existing owner/helper/source invariant and add complete Simple inventory/determinism canaries | `node scripts/selftest.mjs` | No | `report.md#tp-07-11` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] All remaining ordinary adapters and the in-Brief Center triage model execute actual owner logic with visible effects, distinct Simple questions, truthful evidence, and no formula copy/default/generic fallback.
- [ ] SCN-012-002 proves deterministic seed identity and separates common-random parameter sensitivity from path randomness.
- [ ] The production validator accounts for all 22 ordinary Simple adapters plus the Center in-view model; unresolved owners block release.
- [ ] Scope 05/06 fingerprints, current owner behavior, local ledgers/data, and legacy Market Brief provenance remain unchanged.

#### Test Evidence Items - Exact Parity With 11 Test Plan Rows

- [ ] TP-07-01 unit evidence proves adapter/seed/source/gap/Center rules.
- [ ] TP-07-02 integration evidence proves the complete owner-parity/parameter-effect inventory.
- [ ] TP-07-03 E2E evidence proves SCN-012-002 seeded strategy behavior.
- [ ] TP-07-04 E2E evidence proves strategy-validation parameter effect.
- [ ] TP-07-05 E2E evidence proves smart-money decay parameter effect.
- [ ] TP-07-06 E2E evidence proves waterfront/polo suitability and evidence truth.
- [ ] TP-07-07 E2E evidence proves Palm Springs cash-flow sensitivity without gap filling.
- [ ] TP-07-08 E2E evidence proves Ocean Shores seasonal sensitivity without gap filling.
- [ ] TP-07-09 E2E evidence proves Center triage stays bounded and inside Brief.
- [ ] TP-07-10 validator evidence proves SCN-012-036 complete Simple inventory with no generic/unresolved adapter.
- [ ] TP-07-11 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan, seeded determinism/common-randomness, owner pre/post parity, all-tool registry loop, parameter-effect/no-effect mutations, provenance/gap checks, changed-path boundary, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and broad selftest are current and clean.
