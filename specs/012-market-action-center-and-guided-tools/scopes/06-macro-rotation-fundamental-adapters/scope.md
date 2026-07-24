# Scope 06: Macro, Rotation, And Fundamental Simple Adapters

## 06-macro-rotation-fundamental-adapters

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-overlay:true`, `owner-parity-critical:true`, `source-qualified:true`

Depends On: 05-market-structure-options-adapters

**Primary Outcome:** Eight macro/rotation/fundamental tools use real owning production logic through two domain modules. Every tool has a distinct steerable Simple question, explicit evidence clocks and gaps, owner-parity proof, per-tool parameter-effect regression, and no formula duplication or hidden fallback.

## Requirement Coverage

- **Functional:** FR-009 through FR-020 for the eight named tools and FR-060 through FR-062 where daily snapshots feed owner evidence.
- **Non-functional:** NFR-004 through NFR-007, NFR-011 through NFR-015, NFR-017 through NFR-018.
- **Derived technical scenario:** SCN-012-035.

## Gherkin Scenarios

### SCN-012-035 - Macro and fundamental adapters preserve owner truth while parameters matter

```gherkin
Scenario: SCN-012-035 Every macro rotation and fundamental Simple adapter runs against its owning model
  Given all eight definitions resolve to registered owner adapters and qualified or explicitly incomplete evidence
  When the registry-derived integration loop changes every enabled parameter through its allowed domain
  Then each tool recomputes at least one declared owner output or proves an explicit modeled flat region
  And observed facts, user assumptions, model estimates, source clocks, gaps, and uncertainty remain distinct
  And owner facts match Power while the Simple research question and interaction remain materially different
  And no adapter copies a formula, fetches a source, or substitutes missing evidence
```

## Adapter And Owner Map

| Tool | Adapter / Module | Existing Owner Seam | Steerable Simple Inputs | Produced Result And Power Distinction |
|---|---|---|---|---|
| `sector-research-lab` | `sector-rotation-transition/v1` / `macro-rotation.js` | RRG/momentum/acceleration/breadth/risk/ETF-fit owner compute in `sector-research-lab.html` | momentum lookbacks, acceleration weight, breadth floor, risk penalty, benchmark, ETF-fit weights | into/out candidate sensitivity; Power retains trajectories, breadth, flow, correlations, company map, and vehicle diagnostics |
| `global-rotation-lab` | `country-rotation/v1` / `macro-rotation.js` | country relative momentum/trend/FX/local-close/risk compute in `global-rotation-lab.html` | 21/63/126 weights, FX confirmation, local-close freshness, volatility penalty, diversification cap | country queue sensitivity; Power retains all country/FX/session/drawdown/diversification evidence |
| `real-assets-lab` | `real-asset-driver/v1` / `macro-rotation.js` | asset-specific driver models in `real-assets-lab.html` | asset choice, USD, rates, risk appetite, volatility, drawdown, breadth | selected-asset driver scenario; Power retains every underlying score/driver/model conflict |
| `bond-regime-lab` | `fixed-income-sleeve/v1` / `macro-rotation.js` | credit/duration/curve/real-yield/sleeve scenario logic in `bond-regime-lab.html` | horizon, rate shock, spread shock, carry, convexity, inflation/real-yield, confirmation | sleeve outcomes/regime sensitivity; Power retains credit ratios, duration confounds, curves, yields, source rights, and decompositions |
| `etf-momentum-lab` | `etf-ranking/v1` / `macro-rotation.js` | performance/risk/drawdown/correlation/holdings ranking compute in `etf-momentum-lab.html` | horizon, momentum blend, volatility/drawdown penalty, benchmark, basket weights, constraints | ranking/basket sensitivity; Power retains full analytics, holdings, Monte Carlo, and leaderboard |
| `ai-capex-strategy-lab` | `ai-capex-portfolio/v1` / `fundamental-models.js` | theme beneficiary/optimizer/crowding/risk logic in `ai-capex-strategy-lab.html` | horizon, theme weights, crowding friction, ETF dampers, correlation policy, risk objective | beneficiary/portfolio distribution sensitivity; Power retains 80-asset/13-theme optimizer and risk diagnostics |
| `msft-july-print-model` | `msft-margin-eps/v1` / `fundamental-models.js` | reported-period margin/EPS/valuation bridge in `msft-july-print-model.html` | depreciation, price/mix, FX, memory cost, capex phase, Q4 anchor, valuation multiple | margin/EPS/valuation sensitivity; Power retains reconciliation, bridge, ladder, heatmap, evidence clocks, and cost overlay |
| `company-fundamentals-lab` | `company-scenario-bridge/v1` / `fundamental-models.js` | source-qualified company scenario lineage in `company-fundamentals-lab.html` | revenue, margin, capital intensity, evidence cutoff, valuation assumptions | bounded company scenario preserving gaps; Power retains identity, filings, statement coverage, source clocks, peers, gaps, history |

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-035 each named tool | Qualified owner evidence, or owner-declared partial/unavailable evidence | Open Simple, change at least two meaningful controls, inspect baseline/current and Power handoff | Owner output and sensitivity change; evidence clocks/gaps remain truthful; source-qualified incomplete tools never fabricate a complete result | e2e-ui |
| Evidence-cutoff conflict | Company/static report evidence clocks disagree | Change an evidence-cutoff/assumption input | Partial/disputed state names conflict; no merge into a current fact | functional/e2e-ui |
| Daily snapshot owner path | One market-based tool has a valid stale same-origin snapshot | Open route | Snapshot paints with source/age before bounded delta; no adapter fetch occurs | functional/e2e-ui |

## Implementation Files

### New

- `rlexperience-adapters/macro-rotation.js`
- `rlexperience-adapters/fundamental-models.js`
- `tests/simple-model-adapters-macro-fundamental.unit.mjs`
- `tests/simple-model-adapters-macro-fundamental.spec.mjs`

### Modified

- `simple-models.json`
- `tests/simple-model-adapters.integration.mjs`
- `tests/simple-model-source-ownership.functional.mjs`
- `sector-research-lab.html`
- `global-rotation-lab.html`
- `real-assets-lab.html`
- `bond-regime-lab.html`
- `etf-momentum-lab.html`
- `ai-capex-strategy-lab.html`
- `msft-july-print-model.html`
- `company-fundamentals-lab.html`
- `scripts/selftest.mjs`

## Implementation Plan

1. Add RED owner-parity and per-tool parameter-effect tests before any owner extraction/adapter registration.
2. Complete the eight definitions with exact controls, units/domains/sources/output paths, scenario policies, clocks, gaps, uncertainty, limitations, and Power/Journey deep links.
3. Extract minimal pure owner seams only where the page lacks one. Both Power and Simple consume the same owner function; adapters contain normalization/projection, not copied formulas.
4. Register the exact macro/rotation and fundamental adapter IDs; enforce module/domain declarations and reject cross-module formula imports.
5. Freeze already-loaded owner evidence and preserve source/statement/model/market/retrieval clocks. Missing/static/partial evidence remains unavailable or partial and cannot become a default estimate.
6. Extend the one registry-derived integration loop and assert every enabled parameter affects its declared output path or an explicit modeled flat region.
7. Add one persistent E2E per tool with visible parameter, baseline/current, sensitivity, provenance, uncertainty, limitation, and Power distinction assertions.
8. Preserve daily snapshot/delta truth through existing RLDATA owner paths; no adapter acquires or refreshes evidence.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Eight owner pages | Existing Power conclusions, source clocks, partial states, and tool reads remain stable | Pre/post canonical owner inputs/outputs and existing Bond/company/market page browser suites |
| Shared adapter integration | Scope 05 registrations and results remain unchanged | Run complete Scope 05+06 registry loop and compare Scope 05 fingerprints |
| Company/static evidence | Partial/unavailable/disputed truth and distinct clocks are preserved | Existing company contract/unit/browser canaries plus later-evidence exclusion mutation |
| RLDATA/source shell | No adapter fetch/storage/key path is introduced | Static forbidden-authority scan and request ledger around all browser rows |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `rldata.js`, provider settings/keys, all market-structure/options/strategy/property adapter source outside the named shared integration test, all nonlisted pages/helpers, Journey/Brief/market-action/publication/private files, options producer/data, Feature 002/008/BUG-004, QF, package/source-lock files, and framework-managed files.

## Rollback

Unregister the two Scope 06 modules, restore the eight owner-page hunks, remove only their definition implementation fields/tests, and prove Scope 05 fingerprints plus all existing owner pages remain green. Rollback does not alter source snapshots, filings, local tool history, registry IDs, or published objects.

## Scenario-First RED/GREEN Contract

Write the bulk eight-tool loop and each exact browser title before adapter work. For source-qualified partial tools, RED must prove the missing production sensitivity/parity behavior, not demand a complete result the owner cannot support. After each owner extraction, run its focused integration test before changing another owner.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-06-01 | Unit | unit | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.unit.mjs` | Validate all eight definition/adapter contracts, clocks, provenance, gaps, no-effect mutations, and Simple-versus-Power distinction | `node --test tests/simple-model-adapters-macro-fundamental.unit.mjs` | No | `report.md#tp-06-01` |
| TP-06-02 | Adapter integration | integration | SCN-012-035 | `tests/simple-model-adapters.integration.mjs` | Registry-derived loop executes all 16 delivered adapters, proves each Scope 06 parameter effect/owner parity, and proves Scope 05 fingerprints unchanged | `node --test --test-name-pattern="macro rotation and fundamental adapters" tests/simple-model-adapters.integration.mjs` | No | `report.md#tp-06-02` |
| TP-06-03 | Source-qualified functional | functional | SCN-012-035 | `tests/simple-model-source-ownership.functional.mjs` | Preserve daily snapshot truth, distinct evidence clocks, partial/disputed states, and no adapter acquisition/default substitution | `node --test --test-name-pattern="macro and fundamental source qualification" tests/simple-model-source-ownership.functional.mjs` | No | `report.md#tp-06-03` |
| TP-06-04 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: sector rotation Simple controls recompute owner transition and ETF fit` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: sector rotation Simple controls recompute owner transition and ETF fit" --reporter=list` | Yes | `report.md#tp-06-04` |
| TP-06-05 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: global rotation Simple controls recompute owner country queue with FX and session truth` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: global rotation Simple controls recompute owner country queue with FX and session truth" --reporter=list` | Yes | `report.md#tp-06-05` |
| TP-06-06 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: real assets Simple controls recompute the selected owner driver model` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: real assets Simple controls recompute the selected owner driver model" --reporter=list` | Yes | `report.md#tp-06-06` |
| TP-06-07 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: bond regime Simple shocks recompute owner sleeve outcomes without hiding duration conflicts` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: bond regime Simple shocks recompute owner sleeve outcomes without hiding duration conflicts" --reporter=list` | Yes | `report.md#tp-06-07` |
| TP-06-08 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: ETF momentum Simple controls recompute owner ranking and basket sensitivity` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: ETF momentum Simple controls recompute owner ranking and basket sensitivity" --reporter=list` | Yes | `report.md#tp-06-08` |
| TP-06-09 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: AI capex Simple controls recompute owner beneficiary and portfolio distribution` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: AI capex Simple controls recompute owner beneficiary and portfolio distribution" --reporter=list` | Yes | `report.md#tp-06-09` |
| TP-06-10 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: MSFT print Simple controls recompute owner margin EPS and valuation bridge` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: MSFT print Simple controls recompute owner margin EPS and valuation bridge" --reporter=list` | Yes | `report.md#tp-06-10` |
| TP-06-11 | Regression E2E | e2e-ui | SCN-012-035 | `tests/simple-model-adapters-macro-fundamental.spec.mjs` | `Regression: company fundamentals Simple controls recompute a source-qualified scenario without filling gaps` | `npx --no-install playwright test tests/simple-model-adapters-macro-fundamental.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: company fundamentals Simple controls recompute a source-qualified scenario without filling gaps" --reporter=list` | Yes | `report.md#tp-06-11` |
| TP-06-12 | Broad regression | unit | SCN-012-035 | `scripts/selftest.mjs` | Preserve all existing owner/source/helper invariants and add cumulative 16-adapter completeness canaries | `node scripts/selftest.mjs` | No | `report.md#tp-06-12` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] SCN-012-035: All eight Scope 06 adapters execute actual owner logic, every enabled parameter affects a declared result or explicit flat region, and every Simple question is distinct from Power.
- [ ] Source/statement/model/market/retrieval clocks, gaps, partial/disputed states, provenance, uncertainty, and owner facts remain truthful and aligned.
- [ ] Scope 05 registrations/fingerprints and all existing owner behavior remain unchanged; no formula, fetch, default, or source owner is duplicated.

#### Test Evidence Items - Exact Parity With 12 Test Plan Rows

- [ ] TP-06-01 unit evidence proves all eight contract and adversarial invariants.
- [ ] TP-06-02 integration evidence proves the cumulative registry loop, parameter effects, owner parity, and Scope 05 stability.
- [ ] TP-06-03 functional evidence proves source qualification, clocks, gaps, and zero forbidden acquisition/default behavior.
- [ ] TP-06-04 E2E evidence proves sector-rotation parameter effect.
- [ ] TP-06-05 E2E evidence proves global-rotation parameter effect and FX/session truth.
- [ ] TP-06-06 E2E evidence proves real-assets owner-driver parameter effect.
- [ ] TP-06-07 E2E evidence proves bond-regime parameter effect without hiding conflicts.
- [ ] TP-06-08 E2E evidence proves ETF-momentum ranking/basket parameter effect.
- [ ] TP-06-09 E2E evidence proves AI-capex distribution parameter effect.
- [ ] TP-06-10 E2E evidence proves MSFT bridge parameter effect.
- [ ] TP-06-11 E2E evidence proves source-qualified company scenario effect without gap filling.
- [ ] TP-06-12 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan, owner pre/post parity, cumulative registry loop, parameter-effect/no-effect mutations, evidence-clock and later-evidence guards, forbidden-authority scan, protected-path diff, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and broad selftest are current and clean.
