# Scope 05: Market-Structure And Options Simple Adapters

## 05-market-structure-options-adapters

Planning authority: [spec.md](../../spec.md), [design.md](../../design.md), and the [scope index](../_index.md). Execution evidence belongs in [report.md](report.md).

**Status:** In Progress

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-overlay:true`, `owner-parity-critical:true`, `source-ownership-critical:true`

Depends On: 04-simple-model-core-runtime

**Primary Outcome:** Eight market-structure/options tools use real owning production logic through two domain adapter modules, each with a distinct parameterized Simple question, meaningful parameter effects, owner-evidence parity, truthful source states, and persistent per-tool browser regressions. The source chain and options publisher remain under their existing owners.

## Requirement Coverage

- **Functional:** FR-009 through FR-020 for the eight named tools; FR-056 through FR-065 source ownership.
- **Non-functional:** NFR-004 through NFR-007, NFR-011 through NFR-015, NFR-017 through NFR-018.
- **Acceptance:** SCN-012-001, SCN-012-014, SCN-012-015, and SCN-012-016.

## Gherkin Scenarios

### SCN-012-001 - Simple is a distinct steerable model

```gherkin
Scenario: SCN-012-001 An ordinary tool opens in Simple mode
  Given the tool has a valid SimpleModel contract and qualified inputs
  When the user changes a meaningful model parameter
  Then production model logic recomputes the current result
  And baseline-versus-current sensitivity, source, as-of, uncertainty, and limitations are visible
  And the experience is not a summary or filtered Power dashboard
```

### SCN-012-014 - Yahoo retains its keyless chain

```gherkin
Scenario: SCN-012-014 Yahoo data is not available through the tailnet proxy
  Given the request is a keyless Yahoo request
  When RLDATA follows its approved keyless chain
  Then direct and approved public CORS paths are attempted in the existing order
  And no keyed-provider local key is read or attached
```

### SCN-012-015 - Daily snapshot paints before a remote delta

```gherkin
Scenario: SCN-012-015 A committed daily-bar snapshot is present but old
  Given the snapshot contains valid bars and source metadata
  When a tool opens
  Then it paints the valid cached snapshot with its Git-backed source and stale state
  And only the missing or stale delta is requested remotely
  And a successful same-origin load is not labeled live
```

### SCN-012-016 - Options ownership remains unchanged

```gherkin
Scenario: SCN-012-016 An options tool or matrix cell needs chain evidence
  Given scripts/fetch-options.mjs published data/options/TICKER.json
  When the browser resolves the chain
  Then it consumes the same-origin snapshot before any existing conditional live path
  And Feature 012 creates no second scheduled or browser-owned chain publication
```

## Adapter And Owner Map

| Tool | Adapter / Module | Existing Owner Seam | Steerable Simple Inputs | Produced Result And Power Distinction |
|---|---|---|---|---|
| `market-heatmap-lab` | `market-breadth/v1` / `market-structure.js` | breadth/treemap return and sector-relative outlier compute in `market-heatmap-lab.html` | return window, grouping, size metric, breadth threshold, outlier sigma | broad/narrow leadership sensitivity; Power retains full treemap, breadth rows, sortable constituents, and outlier diagnostics |
| `intraday-tape-lab` | `session-auction/v1` / `market-structure.js` | session VWAP/opening-range/profile/control compute in `intraday-tape-lab.html` | opening-range length, VWAP band width, profile bins, control threshold, gamma context | session type and support/resistance scenario; Power retains full tape/profile/delta/analogs/0DTE evidence |
| `swing-structure-lab` | `swing-transition/v1` / `market-structure.js` | MA/structure/pattern/OBV/regime compute in `swing-structure-lab.html` | MA horizons, breakout tolerance, volume/OBV confirmation, pattern threshold, regime window | trend/range/reversal state sensitivity; Power retains complete structure, profiles, patterns, OBV, regime, and magnets |
| `volatility-sizing-lab` | `conditional-volatility/v1` / `market-structure.js` | `rlvol.js` estimator/regime/sizing functions used by `volatility-sizing-lab.html` | estimator, history/regime window, target volatility, cap, floor, notional, horizon | forecast/regime/throttle sensitivity; Power retains term structure, persistence, estimator conflict, and worked sizing evidence |
| `technical-analysis-decision-lab` | `technical-five-gate/v1` / `market-structure.js` | five-gate/model-family/expectancy owner logic in `technical-analysis-decision-lab.html` | timeframe, data tier, five thresholds, entry/stop/cost, family requirements | setup state/expectancy; if owner model is incomplete, exact unavailable replaces any invented signal; Power retains every specialist family/conflict/risk diagnostic |
| `options-flow-feed-lab` | `options-anomaly/v1` / `options.js` | chain anomaly/vol-OI/premium/IV aggregation in `options-flow-feed-lab.html` | expiry window, vol/OI threshold, premium weighting, IV threshold, call/put aggregation | unusualness sensitivity without trade-side inference; Power retains contract-level chain evidence and source gaps |
| `options-structure-lab` | `options-surface/v1` / `options.js` | GEX/walls/flip/expected-move/skew owner compute in `options-structure-lab.html` | expiry, spot shock, IV shock, dealer-sign convention, OI weighting, rate, time | wall/flip/expected-move/skew scenario; Power retains strikes, expiries, smiles, term, VRP, short-interest, and squeeze evidence |
| `gamma-trading-lab` | `dealer-gamma-playbook/v1` / `options.js` | gamma/OVI/OPEX playbook compute in `gamma-trading-lab.html` | spot path, time-to-expiry, sign convention, OVI threshold, aggressiveness, horizon | pin/trend/overextension playbook sensitivity; Power retains strike GEX, OVI history, expiry ladder, and sign diagnostics |

Owner functions may be surgically extracted to an existing/new owner helper only with byte/semantic parity tests. The adapter cannot copy a formula, fetch, mutate owner state, or import another domain adapter.

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-001 each named tool | Qualified owner evidence or exact unavailable owner state | Open Simple, change two meaningful controls, compare baseline/current, open Power | Owner-produced output paths change with visible sensitivity; owner facts match Power; Simple question/layout is distinct | e2e-ui |
| SCN-012-014 Yahoo unavailable at proxy | Existing RLDATA keyless-chain functional harness | Exercise keyless owner hydration | Existing ordered keyless paths remain; provider-key sentinel is never read/attached | functional |
| SCN-012-015 old daily snapshot | Same-origin stale snapshot plus controlled delta boundary | Open market-structure route | Stale snapshot paints first and labels `pages-snapshot`; only delta requested | e2e-ui/functional |
| SCN-012-016 options snapshot | Existing same-origin options object | Open each options Simple and owner Power link | Same-origin object is first owner evidence; no Feature 012 producer, schedule, storage, or browser publication exists | e2e-ui/functional |

## Implementation Files

### New

- `rlexperience-adapters/market-structure.js`
- `rlexperience-adapters/options.js`
- `tests/simple-model-adapters-market.unit.mjs`
- `tests/simple-model-adapters.integration.mjs`
- `tests/simple-model-source-ownership.functional.mjs`
- `tests/simple-model-adapters-market.spec.mjs`

### Modified

- `simple-models.json`
- `market-heatmap-lab.html`
- `intraday-tape-lab.html`
- `swing-structure-lab.html`
- `volatility-sizing-lab.html`
- `technical-analysis-decision-lab.html`
- `options-flow-feed-lab.html`
- `options-structure-lab.html`
- `gamma-trading-lab.html`
- `rlvol.js`
- `scripts/selftest.mjs`

## Implementation Plan

1. Write the per-tool parameter-effect and owner-parity tests RED before extracting/exporting any owner seam or registering an adapter.
2. Complete all eight explicit definitions with exact parameters, units, domains, sources, output paths, seeds, scenarios, policies, limitations, and deep links; no adapter supplies a missing default.
3. Extract only the minimal pure owner functions required by an adapter. Keep owning page behavior and Power output semantically identical, and prove parity before registering the adapter.
4. Register exact adapter IDs through their domain module; reject undeclared/duplicate IDs and cross-domain formula imports.
5. Capture already-loaded RLDATA/same-origin/owner state, freeze it, and perform only local compute. Adapters never call `fetch`, `providerFetch`, local credential APIs, LLMs, public publishers, or private stores.
6. Preserve Yahoo's keyless chain and daily-snapshot/delta semantics through owner canaries. This scope does not certify BUG-004 keyed-provider fallback.
7. Preserve `scripts/fetch-options.mjs` and `data/options/**` byte ownership. Option adapters consume the owner/same-origin projection only and create no scheduled/browser chain producer.
8. Render the distinct Simple interaction through Scope 04 core and Scope 03 context; all owner deep links preserve evidence identity.
9. Run one registry-derived integration loop across all eight adapters and one persistent browser parameter-effect test per tool; a missing owner seam remains explicit unavailable and blocks that adapter's completion.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| Eight owner pages and `rlvol.js` | Existing Power outputs, controls, reads, and source states remain semantically identical | Pre/post canonical owner-input/output fingerprints and existing page-specific browser tests where present |
| `rldata.js` | Yahoo/keyed provider, cache, snapshot, and tool-read ownership unchanged | Existing provider/source tests plus static zero-edit assertion for `rldata.js` |
| Options publisher/data | One scheduled producer and same-origin path remain | Git diff inventory and source scan prove no new option producer/path; existing snapshot parser canary remains green |
| Shared adapter integration loop | Registry membership, not a literal list, selects the scope's declared adapters | Added valid definition mutation and missing-adapter mutation exercise the same production loop |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `rldata.js`, provider configuration/credentials, `scripts/fetch-options.mjs`, `data/options/**`, all nonlisted tools/helpers, macro/fundamental/strategy/property adapter modules, Journey/Brief/market-action/publication/private-portfolio files, Feature 002/008/BUG-004, QF, package/source-lock files, and framework-managed files.

**Formula ownership:** no formula is copied into `rlexperience.js`, JSON, another adapter, or a test helper. Any owner extraction must be consumed by both Power and Simple.

## Rollback

Unregister the two modules, restore the eight owner-page/helper hunks, remove only their definition implementation fields/tests, and verify prior Power/page/source behavior and the Scope 01-04 foundation. Do not delete/cache-reset source data, option snapshots, provider config, or user-local history.

## Scenario-First RED/GREEN Contract

Each of the eight persistent E2E tests and the bulk integration loop is written before its owner extraction/adapter registration. A valid RED proves the declared production output does not change, the owner parity path is absent, or the exact adapter is unavailable. A live/provider outage, stale input allowed by policy, missing browser, or selector/setup error is not valid RED.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-05-01 | Unit | unit | SCN-012-001 | `tests/simple-model-adapters-market.unit.mjs` | Validate eight definitions/adapters, parameter domains/output paths, owner seam identities, no-effect mutations, and Simple-versus-Power distinctions | `node --test tests/simple-model-adapters-market.unit.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Adapter integration | integration | SCN-012-001 | `tests/simple-model-adapters.integration.mjs` | Registry-derived loop executes all eight real owner adapters, changes each declared parameter, proves output/sensitivity effects, and compares owner facts | `node --test --test-name-pattern="market structure and options adapters" tests/simple-model-adapters.integration.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Source ownership functional | functional | SCN-012-014, SCN-012-015, SCN-012-016 | `tests/simple-model-source-ownership.functional.mjs` | Preserve Yahoo keyless order, stale Git snapshot-first/delta-only truth, option snapshot-first owner, and zero new producer/key access | `node --test tests/simple-model-source-ownership.functional.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Regression E2E | e2e-ui | SCN-012-001 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: market heatmap Simple breadth controls recompute owner leadership sensitivity` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: market heatmap Simple breadth controls recompute owner leadership sensitivity" --reporter=list` | Yes | `report.md#tp-05-04` |
| TP-05-05 | Regression E2E | e2e-ui | SCN-012-001, SCN-012-015 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: intraday tape Simple auction controls recompute from truthful snapshot evidence" --reporter=list` | Yes | `report.md#tp-05-05` |
| TP-05-06 | Regression E2E | e2e-ui | SCN-012-001 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: swing structure Simple thresholds recompute owner transition state` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: swing structure Simple thresholds recompute owner transition state" --reporter=list` | Yes | `report.md#tp-05-06` |
| TP-05-07 | Regression E2E | e2e-ui | SCN-012-001 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: volatility sizing Simple controls recompute owner forecast regime and throttle` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: volatility sizing Simple controls recompute owner forecast regime and throttle" --reporter=list` | Yes | `report.md#tp-05-07` |
| TP-05-08 | Regression E2E | e2e-ui | SCN-012-001 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: technical decision Simple five-gate controls recompute or stay honestly unavailable` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: technical decision Simple five-gate controls recompute or stay honestly unavailable" --reporter=list` | Yes | `report.md#tp-05-08` |
| TP-05-09 | Regression E2E | e2e-ui | SCN-012-001, SCN-012-016 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: options flow Simple anomaly controls recompute without trade-side inference or new chain owner` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: options flow Simple anomaly controls recompute without trade-side inference or new chain owner" --reporter=list` | Yes | `report.md#tp-05-09` |
| TP-05-10 | Regression E2E | e2e-ui | SCN-012-001, SCN-012-016 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: options structure Simple shocks recompute owner walls flip move and skew from same-origin evidence` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: options structure Simple shocks recompute owner walls flip move and skew from same-origin evidence" --reporter=list` | Yes | `report.md#tp-05-10` |
| TP-05-11 | Regression E2E | e2e-ui | SCN-012-001, SCN-012-016 | `tests/simple-model-adapters-market.spec.mjs` | `Regression: gamma trading Simple controls recompute owner playbook from existing options owner` | `npx --no-install playwright test tests/simple-model-adapters-market.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: gamma trading Simple controls recompute owner playbook from existing options owner" --reporter=list` | Yes | `report.md#tp-05-11` |
| TP-05-12 | Broad regression | unit | SCN-012-001, SCN-012-014, SCN-012-015, SCN-012-016 | `scripts/selftest.mjs` | Preserve all existing owner/source/option/helper invariants and add all-eight adapter completeness canaries | `node scripts/selftest.mjs` | No | `report.md#tp-05-12` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] SCN-012-001: All eight named adapters execute actual owner logic, every enabled parameter affects declared production output or proves a modeled flat region, and Simple remains distinct from Power.
- [ ] Owner facts, evidence identities, provenance, as-of, freshness, uncertainty, and limitations agree across Simple and Power without formula copies.
- [ ] SCN-012-014, SCN-012-015, and SCN-012-016: Yahoo, daily snapshot/delta, and options ownership/order remain unchanged; BUG-004 keyed fallback is not claimed.
- [ ] The change remains within the exact adapter/owner-page boundary and rollback restores all eight owner pages without data loss.

#### Test Evidence Items - Exact Parity With 12 Test Plan Rows

- [ ] TP-05-01 unit evidence proves eight definition/adapter contracts and no-effect/distinction mutations.
- [ ] TP-05-02 integration evidence proves the registry-derived eight-adapter owner-parity and parameter-effect loop.
- [ ] TP-05-03 functional evidence proves SCN-012-014/015/016 source order, truth, and ownership.
- [ ] TP-05-04 E2E evidence proves market-heatmap parameter effect.
- [ ] TP-05-05 E2E evidence proves intraday-tape parameter effect and snapshot truth.
- [ ] TP-05-06 E2E evidence proves swing-structure parameter effect.
- [ ] TP-05-07 E2E evidence proves volatility-sizing parameter effect.
- [ ] TP-05-08 E2E evidence proves technical-decision recompute or honest unavailable behavior.
- [ ] TP-05-09 E2E evidence proves options-flow parameter effect and no trade-side/new-owner claim.
- [ ] TP-05-10 E2E evidence proves options-structure parameter effect from same-origin evidence.
- [ ] TP-05-11 E2E evidence proves gamma-trading parameter effect from the existing owner.
- [ ] TP-05-12 broad selftest evidence proves existing Research Lab behavior remains green.

#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan, owner pre/post parity, bulk registry loop, parameter-effect/no-effect mutations, Yahoo/key/snapshot/option owner scans, changed-path boundary, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and broad selftest are current and clean.
