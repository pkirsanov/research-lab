# Scope 09: Public Matrix And Market Action Center Scaffold

## 09-public-matrix-market-action-scaffold

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `vertical-slice:true`, `consumer-trace:true`, `public-only:true`

Depends On: 08-journey-runtime-definitions

**Primary Outcome:** The existing `market-brief.html` route and `market-brief` registry identity present the visible Market Action Center with exactly Brief, Portfolio, Red Alert, and Journey. The scaffold includes a truthful public-watchlist-only matrix, route/hash compatibility, concise no-action behavior, and complete rename consumer tracing while private scope, authored v2 Briefs, and live Red Alert publication remain explicitly gated.

## Requirement Coverage

- **Functional:** FR-005, FR-066 through FR-069, FR-071 through FR-073, FR-077 through FR-080, FR-082, FR-085, FR-105 through FR-110, and FR-118 through FR-120.
- **Non-functional:** NFR-001 through NFR-004, NFR-007 through NFR-010, NFR-012 through NFR-018.
- **Acceptance:** SCN-012-017, SCN-012-019, and SCN-012-022.

## Gherkin Scenarios

### SCN-012-017 - Market Brief route becomes Market Action Center

```gherkin
Scenario: SCN-012-017 A user opens an existing market-brief.html bookmark
  Given the Market Action Center rename has shipped
  When the page loads
  Then the visible product is Market Action Center
  And exactly Brief, Portfolio, Red Alert, and Journey are top-level
  And the existing bookmark and registry identity remain functional
```

### SCN-012-019 - No action is a valid Brief

```gherkin
Scenario: SCN-012-019 No item clears the current action gate
  Given registry and evidence coverage are complete for the window
  When Brief renders
  Then it states that no current action clears the bar
  And it does not manufacture a trade, catalyst, or confidence claim
```

### SCN-012-022 - Watchlist never implies holdings

```gherkin
Scenario: SCN-012-022 A public watchlist ticker is not in the private workspace
  When the Portfolio view renders its row
  Then the row is labeled public watchlist
  And no holding, quantity, cost, P&L, mandate, or personal exposure is inferred
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-017 bookmark/legacy hash | Existing route/ID and `#simple` or `#power` legacy bookmark | Open route/hash, traverse four Center tabs, use Back/Forward | Visible title is Market Action Center; route/ID unchanged; exact four tabs only; `#simple` maps to Brief and `#power` to Brief evidence disclosure via replaceState | e2e-ui |
| SCN-012-019 no-action | Complete public window fixture with zero admitted actions | Open Brief | Cutoff/coverage and exact no-action copy lead; no action/catalyst/confidence row is fabricated; long detail remains closed | e2e-ui |
| SCN-012-022 public row | Public `watchlist.json` ticker with no private provider available | Open Portfolio, select row/cells | Scope reads `Public watchlist`; owner cells show current/partial/stale/unavailable/not-applicable; no private or holding fields/copy exist | e2e-ui |
| Dependency scaffold | Feature 002 and Feature 008 predicates false | Open Brief/Portfolio/Red Alert/Journey | Existing legacy payload is labeled by actual provenance; authored/private/live-alert capabilities are exact dependency-pending states | e2e-ui |

## Consumer Impact Sweep

| Consumer surface | Required action and regression |
|---|---|
| `tools.json` and `index.html` | Visible title/nav becomes Market Action Center while ID/file remain `market-brief`/`market-brief.html` |
| `rlnav.js` | Navigation label and search metadata migrate; no second entry |
| `market-brief.html` | Canonical route, h1/title, exact four views, legacy hash compatibility, no duplicate mode control |
| `market-brief.config.json` and payload IDs | IDs/scheduler/current payload compatibility remain stable; visible name changes only where product copy, not immutable history |
| Brief mounts, current pointer, history readers | Existing route/ID refs continue to resolve and legacy provenance remains explicit |
| scheduler scripts/wrappers/workflows | No route, payload ID, schedule, or owned-file list silently changes |
| deep links/bookmarks/hashes | Existing route works; `#simple`/`#power` map safely; no private value in history |
| tests/docs/prompts/runbook | Source/test consumers update in this scope; managed documentation wording is routed to Scope 14 docs phase; immutable historical records retain original text |

The source consumer-trace test must enumerate the repository and classify every old-name occurrence as migrated visible copy, explicit compatibility alias, immutable history, or a blocking stale reference.

## Implementation Files

### New

- `rlmarketaction.js`
- `tests/market-action.unit.mjs`
- `tests/public-portfolio-matrix.functional.mjs`
- `tests/market-action-consumer-trace.mjs`
- `tests/market-action-center.spec.mjs`

### Modified

- `market-brief.html`
- `market-brief.config.json`
- `tools.json`
- `index.html`
- `rlnav.js`
- `rlbrief.js`
- `rlexperience.js`
- `scripts/validate-market-action.mjs`
- `scripts/selftest.mjs`

## Implementation Plan

1. Implement pure `MarketActionCenterProjection/v1` and public `PortfolioTickerMatrix/v1` validators/composers in `rlmarketaction.js`; consume existing public reads and `watchlist.json`, never private state.
2. Rename visible product/nav/title copy through one consumer-traced change while preserving route, registry ID, payload IDs, scheduler ownership, history identities, and compatibility aliases.
3. Compose exactly four top-level views through the shared shell. No Simple/Power/fifth/experimental top-level mode remains; evidence and experiments are disclosures/in-view controls.
4. Preserve four ET windows and existing action gates. Build a truthful first viewport from the actual legacy/public projection while labeling its current provenance; no ToolBrief v2 or frozen-bundle claim appears before Scope 11.
5. Implement the exact no-action projection and closed long-context disclosures; any blocking limitation remains visible.
6. Build public-watchlist matrix rows from registry domain metadata and existing public owner reads. Cells are explicit applicable/current/partial/stale/disputed/unavailable/not-applicable and never neutral by omission.
7. Label every row `Public watchlist`; do not read/create Feature 008 keys or infer holdings. Scheduled public Brief cells remain dependency-pending until Scope 11.
8. Render Red Alert and private Portfolio as exact gates, while Journey uses Scope 08 global definitions with private stress prerequisite blocked.
9. Add complete rename/stale-reference tracing and exact legacy-hash/bookmark regressions.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Route/registry/navigation | One existing route and ID remain stable | Consumer trace plus real bookmark/deep-link/Back-Forward browser tests |
| Current Market Brief payload | Existing validator, windows, action gates, source clocks, and scheduler remain truthful | `node scripts/validate-brief-payload.mjs` and current Market Brief regressions remain green |
| Public watchlist | Ticker-only public research scope remains unchanged | Read-only hash/inventory before/after; matrix composer cannot write watchlist |
| Feature 008/private state | No key, adapter, or private field is read/created | Storage/public-request/URL/referrer sentinel inventory around Portfolio tests |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `watchlist.json` writes, Feature 008 source/storage, Feature 002 objects/scripts, WebEvidence/authorship, Red Alert implementation, `rldata.js`, provider logic, owner formulas/pages, options owner/data, QF, package/source-lock files, managed docs (until Scope 14 docs owner), immutable history content, and framework-managed files.

## Rollback

Restore the prior Market Brief visible title/shell/renderer and navigation copy while keeping `market-brief.html` and `market-brief` stable; unregister public matrix/Center projection; retain Scope 01-08 foundations. Verify current payload, scheduler, route/bookmarks, nav, and public watchlist bytes. No history, public data, or local storage is rewritten/deleted.

## Scenario-First RED/GREEN Contract

Write the route/title/four-tab, no-action, public-scope/no-holding, and consumer-trace tests before source edits. The old visible title/long single-flow/absent matrix should produce the intended RED. An absent browser or stale fixture is not valid RED.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-09-01 | Unit | unit | SCN-012-019, SCN-012-022 | `tests/market-action.unit.mjs` | Validate exact four-view projection, windows, no-action, public matrix states, scope labels, compatibility hashes, and no private/holding inference | `node --test tests/market-action.unit.mjs` | No | `report.md#tp-09-01` |
| TP-09-02 | Public matrix functional | functional | SCN-012-022 | `tests/public-portfolio-matrix.functional.mjs` | Compose actual public watchlist/owner-read projection, applicability/gaps/deep links, no writes, and absence of private/holding fields | `node --test tests/public-portfolio-matrix.functional.mjs` | No | `report.md#tp-09-02` |
| TP-09-03 | Consumer trace | functional | SCN-012-017 | `tests/market-action-consumer-trace.mjs` | Enumerate route/nav/config/payload/scripts/workflows/prompts/docs/tests/history refs and reject unclassified stale visible names or duplicate routes/IDs | `node --test tests/market-action-consumer-trace.mjs` | No | `report.md#tp-09-03` |
| TP-09-04 | Regression E2E | e2e-ui | SCN-012-017 | `tests/market-action-center.spec.mjs` | `Regression: SCN-012-017 existing Market Brief bookmark opens renamed Center with exact four views` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-017 existing Market Brief bookmark opens renamed Center with exact four views" --reporter=list` | Yes | `report.md#scenario-scn-012-017` |
| TP-09-05 | Regression E2E | e2e-ui | SCN-012-019 | `tests/market-action-center.spec.mjs` | `Regression: SCN-012-019 complete coverage with zero admitted actions renders no-action and no invented row` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-019 complete coverage with zero admitted actions renders no-action and no invented row" --reporter=list` | Yes | `report.md#scenario-scn-012-019` |
| TP-09-06 | Regression E2E | e2e-ui | SCN-012-022 | `tests/market-action-center.spec.mjs` | `Regression: SCN-012-022 public watchlist row never exposes or implies a holding` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-012-022 public watchlist row never exposes or implies a holding" --reporter=list` | Yes | `report.md#scenario-scn-012-022` |
| TP-09-07 | Legacy/projection regression | e2e-ui | SCN-012-017, SCN-012-019 | `tests/market-action-center.spec.mjs` | `Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful` | `npx --no-install playwright test tests/market-action-center.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: legacy hashes payload provenance windows action gates and closed disclosures remain truthful" --reporter=list` | Yes | `report.md#tp-09-07` |
| TP-09-08 | Broad regression | unit | SCN-012-017, SCN-012-019, SCN-012-022 | `scripts/selftest.mjs` | Preserve all existing registry/Brief/data/model invariants and add Center/public-matrix/consumer-trace canaries | `node scripts/selftest.mjs` | No | `report.md#tp-09-08` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] Existing route/ID/bookmarks remain functional under visible Market Action Center naming and exactly four top-level views, with zero stale first-party consumer references.
- [ ] Brief retains current windows/action gates/provenance and truthful no-action while long context is closed and integrated v2 claims remain gated.
- [ ] Public matrix is registry-derived, scope-labeled, gap-honest, read-only, and contains no private/holding inference or parallel store.
- [ ] Rename/scaffold rollback restores prior visible behavior without changing payload/history/watchlist/local data.

#### Test Evidence Items - Exact Parity With 8 Test Plan Rows

- [ ] TP-09-01 unit evidence proves Center/public-matrix/compatibility/no-action contracts.
- [ ] TP-09-02 functional evidence proves actual public projection and no private/write behavior.
- [ ] TP-09-03 consumer-trace evidence proves zero stale/duplicate first-party route/name consumers.
- [ ] TP-09-04 E2E evidence proves SCN-012-017 route/name/exact-four-view compatibility.
- [ ] TP-09-05 E2E evidence proves SCN-012-019 truthful no-action.
- [ ] TP-09-06 E2E evidence proves SCN-012-022 no holding inference.
- [ ] TP-09-07 E2E evidence proves legacy hashes/payload/windows/gates/disclosures remain truthful.
- [ ] TP-09-08 broad selftest evidence proves existing Research Lab behavior remains green.

#### Build Quality Gate

- [ ] Scenario RED/GREEN, exact system-Chrome identity, no-interception scan, full consumer trace/stale-reference scan, payload validator, public/private sentinel scan, accessibility/mobile/focus checks, protected-path diff, editor diagnostics, `git diff --check`, source-lock, registry/market-action validators, artifact lint, and broad selftest are current and clean.
