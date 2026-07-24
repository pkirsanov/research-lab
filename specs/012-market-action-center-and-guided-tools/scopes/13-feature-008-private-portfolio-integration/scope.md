# Scope 13: Feature 008-Gated Private Portfolio Integration

## 13-feature-008-private-portfolio-integration

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-integration:true`, `external-gate:feature-008`, `privacy-critical:true`, `no-second-store:true`

Depends On: 09-public-matrix-market-action-scaffold, 12-dynamic-red-alert

**External Eligibility Gate:** Feature 008 must certify its RLPORTFOLIO import/store/privacy clear milestone, public-evidence barrier, and four-window local brief/ticker-scope milestone. Its current `not_started` certification and Scope 01 implementation/test claims do not satisfy this gate. If false, this scope remains Not Started and SCN-012-029 remains the correct UI.

**Primary Outcome:** After the exact gate passes, a narrow Feature 008 adapter returns opaque local ticker-scope references to the Market Action Center. Private rows use browser-local deterministic owner overlays, state that no scheduled personalized LLM Brief exists, never create a second store or remote/private artifact, and support local alert-stress Journey outcomes without holdings mutation or execution.

## Requirement Coverage

- **Functional:** FR-075 through FR-086, FR-098, FR-103 through FR-104, FR-111 through FR-112, FR-116, FR-119 through FR-120.
- **Non-functional:** NFR-001 through NFR-005, NFR-007 through NFR-009, NFR-012 through NFR-018.
- **Acceptance:** SCN-012-021 and SCN-012-027. SCN-012-029 remains the false-gate regression.

## Gherkin Scenarios

### SCN-012-021 - Private ticker remains browser-local

```gherkin
Scenario: SCN-012-021 A ticker exists only in the local RLPORTFOLIO workspace
  Given it is absent from public watchlist.json
  When PortfolioTickerMatrix renders in Phase A
  Then it shows browser-local deterministic owner overlays only
  And it states that no scheduled personalized LLM brief exists
  And the ticker is absent from commits, publisher input, URLs, and remote queries beyond approved public symbol lookup
```

### SCN-012-027 - Portfolio stress uses current alerts without mutation

```gherkin
Scenario: SCN-012-027 A private portfolio user selects Stress against current alerts
  Given a qualified Red Alert and valid local RLPORTFOLIO scope exist
  When the scenario lab applies the alert's declared shocks locally
  Then outcomes retain alert and portfolio provenance
  And no holding, target weight, hedge, order, or public artifact is changed
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-021 private-only row | Feature 008 gate true; opaque private research scope; ticker absent public watchlist | Open Portfolio/private lane and inspect row/cells | Repeated `Private workspace - local only`; local deterministic overlays/gaps; exact `No scheduled personalized LLM Brief`; no quantity/cost/P&L unless owner scope explicitly provides allowed class | e2e-ui |
| Same ticker in public/private | Same public symbol appears in both owner scopes | Filter All and inspect both lanes | Two explicit labels/projections; public Brief never becomes personal and private membership never enters public row/object | e2e-ui |
| SCN-012-027 local stress | Qualified alert plus opaque private revision reference | Start global stress Journey, change declared shock, complete packet | Deterministic local outcomes retain both provenance refs; Feature 008 store/public generation/request ledgers remain byte-identical | e2e-ui |
| Gate regression | Feature 008 predicate false fixture | Open Portfolio/private request | Exact SCN-012-029 band; no private adapter/store key call | e2e-ui |

## Implementation Files

### New

- `rlexperience-adapters/portfolio-scope.js`
- `tests/private-portfolio-adapter.unit.mjs`
- `tests/portfolio-matrix-privacy.functional.mjs`
- `tests/portfolio-stress-journey.functional.mjs`
- `tests/portfolio-private.spec.mjs`

### Modified

- `tool-experience.config.json`
- `rlmarketaction.js`
- `rljourney.js`
- `journeys.json`
- `market-brief.html`
- `tests/market-action-center.spec.mjs`
- `tests/journey.spec.mjs`
- `scripts/validate-market-action.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Run the exact Feature 008 predicate before RED or source edits and record accepted certification/milestone identities. Reject partial implementation claims or missing milestone evidence.
2. Implement the narrow `PortfolioScopeProvider/v1.listResearchScope()` adapter that imports Feature 008's shipped public API and returns provider ID, opaque revision ref, public ticker, scope class, opaque local ref, and privacy state only.
3. The adapter cannot create/save/remove/infer/migrate a ticker or holding and cannot read Feature 008 internal slots directly. Add/save/clear UI routes exclusively through Feature 008 controls/API.
4. Compose private matrix rows locally from opaque scope entries plus already-loaded public owner reads/Simple adapters. Non-applicable/partial/stale/disputed/unavailable cells remain explicit.
5. Ensure every private row says `No scheduled personalized LLM Brief`; never substitute a public/generic Brief as personal. Same symbol in both scopes remains two explicit lanes/rows.
6. Enforce the private barrier against URL/query/hash/title/referrer, `RLDATA.toolReads`, `RLAPP.report`, search/author/publisher input, console/log/telemetry, committed files, and public objects. Only Feature 008-authorized public symbol lookup may leave the browser, with no private scope fact attached.
7. Implement portfolio-stress Journey scenario-lab adapter over a frozen alert shock and opaque local revision ref. Re-resolve Feature 008 data locally at compute time; store only the opaque ref; do not mutate holdings/targets/hedges/orders.
8. Implement later-QF provider refusal/version seam only as runtime-neutral contract behavior; no network/auth/service code or private scheduled computation is added.
9. Preserve false/regressed Feature 008 dependency state and public matrix usability after integration code exists.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Feature 008 RLPORTFOLIO | Sole store/revision/privacy/clear owner and exact public API | Existing Feature 008 unit/functional/E2E suite plus before/after full local key/hash inventory |
| Public matrix/watchlist | Public rows/Briefs remain independent and ticker-only | Scope 09/11 public tests plus public object/tree hashes around private tests |
| Journey store | Stores opaque revision ref only, no private values | Forbidden-field/storage-byte tests and full Scope 08 storage suite |
| Red Alert | Stress consumes frozen alert reference and cannot change lifecycle | Scope 12 alert fingerprint/lifecycle before/after local stress |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Read-only dependency surfaces:** Feature 008's exported API and exact certification/milestone artifacts.

**Excluded:** every Feature 008 spec/design/scope/state/certification/source/internal storage file, `watchlist.json`, Feature 002 author/publication, public current objects/pointer/history, `rldata.js`, provider/query code, owner formulas/pages, Red Alert qualification logic, option owner/data, QF source, package/source-lock files, and framework-managed files.

**No second store:** no Feature 012 key may contain portfolio membership, holding class, quantity, cost, P&L, mandate, private ticker value, or private scenario answer.

## Rollback

Unregister only the Feature 012 portfolio provider/stress adapter and restore Center/Journey/config/test hunks. Feature 008 data/keys/revisions remain untouched. Public matrix/Brief/Alert/Journey continue; private lane returns to the exact dependency/unavailable state. No local portfolio migration, deletion, or public object rewrite occurs.

## Scenario-First RED/GREEN Contract

After the Feature 008 gate passes, create private adapter/privacy/stress tests before source edits. False dependency state is eligibility refusal, not RED. Valid RED must exercise the accepted Feature 008 public API and fail exact local-overlay/privacy/no-mutation behavior; a test-created second store is forbidden even as a fixture.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-13-01 | Dependency gate | functional | SCN-012-029 | `scripts/validate-tool-experience.mjs` | Prove named Feature 008 store/privacy/public-barrier/local-scope milestones are certified before integration | `node scripts/validate-tool-experience.mjs --dependency feature-008 --require-accepted` | No | `report.md#tp-13-01` |
| TP-13-02 | Unit | unit | SCN-012-021, SCN-012-027 | `tests/private-portfolio-adapter.unit.mjs` | Validate narrow provider schema/version/opaque refs/scope labels/private barrier/QF refusal and no store mutation methods | `node --test tests/private-portfolio-adapter.unit.mjs` | No | `report.md#tp-13-02` |
| TP-13-03 | Privacy functional | functional | SCN-012-021 | `tests/portfolio-matrix-privacy.functional.mjs` | Compose private/public/same-symbol rows and prove private sentinel absence from every forbidden local/public/remote surface | `node --test tests/portfolio-matrix-privacy.functional.mjs` | No | `report.md#tp-13-03` |
| TP-13-04 | Stress Journey functional | functional | SCN-012-027 | `tests/portfolio-stress-journey.functional.mjs` | Apply deterministic alert shocks through real Journey/Simple/provider contracts and prove portfolio/alert/public state unchanged | `node --test tests/portfolio-stress-journey.functional.mjs` | No | `report.md#tp-13-04` |
| TP-13-05 | Regression E2E | e2e-ui | SCN-012-021 | `tests/portfolio-private.spec.mjs` | `Regression: SCN-012-021 private-only ticker stays local and has no scheduled personalized LLM Brief` | `npx --no-install playwright test tests/portfolio-private.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-021 private-only ticker stays local and has no scheduled personalized LLM Brief" --reporter=list` | Yes | `report.md#scenario-scn-012-021` |
| TP-13-06 | Regression E2E | e2e-ui | SCN-012-027 | `tests/portfolio-private.spec.mjs` | `Regression: SCN-012-027 alert stress stays deterministic local provenance-complete and mutation-free` | `npx --no-install playwright test tests/portfolio-private.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-027 alert stress stays deterministic local provenance-complete and mutation-free" --reporter=list` | Yes | `report.md#scenario-scn-012-027` |
| TP-13-07 | Gate regression E2E | e2e-ui | SCN-012-029 | `tests/tool-experience.spec.mjs` | Re-run exact false-predicate private dependency regression after integration code exists | `npx --no-install playwright test tests/tool-experience.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-029 uncertified Feature 008 preserves public Portfolio and creates no private store" --reporter=list` | Yes | `report.md#tp-13-07` |
| TP-13-08 | Feature 008 regression | e2e-ui | SCN-012-021, SCN-012-027 | Existing Feature 008 foundation/brief suites | Preserve RLPORTFOLIO store/privacy/clear/public barrier/local-scope contracts through the repository-declared real browser runner | `npx --no-install playwright test tests/portfolio-survival-foundation.spec.mjs tests/portfolio-survival-brief.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes | `report.md#tp-13-08` |
| TP-13-09 | Broad regression | unit | SCN-012-021, SCN-012-027 | `scripts/selftest.mjs` | Preserve public/alert/Journey/Feature 008 boundaries and add private-provider/no-second-store canaries | `node scripts/selftest.mjs` | No | `report.md#tp-13-09` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] The exact Feature 008 predicate was mechanically true before integration and only its exported narrow provider API is consumed.
- [ ] Private/public/same-symbol rows remain explicitly separated; private overlays are deterministic/local and state no scheduled personalized LLM Brief.
- [ ] Portfolio-stress Journey retains alert/portfolio provenance and changes no holding/target/hedge/order/alert/public state.
- [ ] No second store or private leak exists; false/regressed dependency and rollback return to the exact public-preserving gate without touching RLPORTFOLIO data.

#### Test Evidence Items - Exact Parity With 9 Test Plan Rows

- [ ] TP-13-01 gate evidence proves Feature 008 was eligible.
- [ ] TP-13-02 unit evidence proves narrow provider/version/privacy/no-store/QF-refusal contracts.
- [ ] TP-13-03 functional evidence proves private/public matrix truth and sentinel absence.
- [ ] TP-13-04 functional evidence proves deterministic local stress and byte-identical owner/public state.
- [ ] TP-13-05 E2E evidence proves SCN-012-021 local-only private row and no scheduled personal Brief.
- [ ] TP-13-06 E2E evidence proves SCN-012-027 provenance-complete mutation-free stress.
- [ ] TP-13-07 E2E evidence proves SCN-012-029 false gate still creates no private store.
- [ ] TP-13-08 Feature 008 E2E evidence proves owning store/privacy/public-boundary behavior remains green.
- [ ] TP-13-09 broad selftest evidence proves the existing Research Lab baseline remains green.

#### Build Quality Gate

- [ ] Eligibility gate, scenario RED/GREEN, exact system-Chrome identity, no-interception scan, full storage/public/request/URL/referrer/log/DOM sentinel inventory, no-second-store source scan, opaque-ref/Feature 008 API checks, no-mutation hashes, QF refusal, protected-path diff, editor diagnostics, `git diff --check`, source-lock, validators, artifact lint, and broad selftest are current and clean.
