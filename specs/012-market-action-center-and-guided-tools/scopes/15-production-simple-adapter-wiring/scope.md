# Scope 15: Production Simple-View Adapter Wiring (Model B)

## 15-production-simple-adapter-wiring

**Status:** Not Started

**Scope-Kind:** runtime-behavior

**Tags:** `concrete-overlay:true`, `owner-parity-critical:true`, `production-wiring-gap:true`, `bug-003-closure:true`

Depends On: 05-market-structure-options-adapters, 06-macro-rotation-fundamental-adapters, 07-strategy-property-method-adapters

**Primary Outcome:** Every ordinary tool's live "Simple" view renders its
Feature 012 SimpleModel adapter (Model B) instead of the current dead-code stub.
On `rlviews:change`→`simple` for an ordinary tool, the shell resolves the tool's
registered adapter, obtains the page's real current owner state through a uniform
provider seam, runs the adapter compute, and renders a visible adapter projection
into `[data-rlexperience-panel="simple"]`; native rich Simple content is
reorganized into "Power" with nothing deleted. Ordinary `ownerModes` become
`["power"]`, `applyVisual` becomes the sole owner of `rlv-focused`, and the stub
bridge is replaced — closing the BUG-003 native-view breakage. `market-brief`
(brief-only) is unaffected.

## Requirement Coverage

- Completes `SCN-012-001` ("Simple is a distinct steerable model") in
  **production**: the adapter Simple that Scopes 05/06/07 built now renders on
  the live page rather than only in injected-fixture tests.
- New scope-local scenarios: `SCN-012-038` (production bridge renders the real
  adapter), `SCN-012-039` (`ownerModes` makes the panel visible in simple and
  native in power), `SCN-012-040` (per-page owner-state provider seam,
  owner-parity), `SCN-012-041` (native Simple demoted to Power, nothing deleted),
  `SCN-012-042` (truthful `unavailable` for tools without a wired provider / owner
  model — no invented signal).
- Design authority: [`../../design-addendum-production-simple-wiring.md`](../../design-addendum-production-simple-wiring.md).

## Gherkin Scenarios

### SCN-012-038 - Production bridge renders the real adapter (not the stub)

```
Given an ordinary tool page whose adapter is registered and whose owner-state provider is present
When the view changes to "simple"
Then the shell resolves the tool's adapter definition, obtains the page's real owner state,
     runs createSimpleRuntime + register + prepare + renderSimpleProjection,
     and [data-rlexperience-panel="simple"] shows a ready projection
     (data-rlexperience-simple-state="ready", data-rlexperience-adapter="<adapterId>")
And no provider request, storage mutation, author call, publication, or fabricated default is used.
```

### SCN-012-039 - ownerModes make the panel visible in simple and native in power

```
Given ordinary ownerModes are ["power"]
When the view is "simple"
Then body.rlv-focused is ON, the adapter panel is visible, and native content is hidden
And when the view is "power"
Then body.rlv-focused is OFF, native content is visible, and the adapter panel is hidden
And the bridge never mutates body.rlv-focused (applyVisual is the sole owner).
```

### SCN-012-040 - Per-page owner-state provider preserves owner parity

```
Given a wired ordinary page registers its toolId provider returning the same frozen owner input
      it already feeds to its adapter module's owner functions
When the adapter compute runs in Simple
Then the produced owner facts, evidence identity, provenance, as-of, and freshness
     match the page's Power path without any formula copy.
```

### SCN-012-041 - Native Simple is demoted to Power, nothing deleted

```
Given a #simpleView tool (e.g. bond-regime-lab)
When the view is "simple"
Then the adapter panel is visible and the native #simpleView content is not visible
And when the view is "power"
Then the native #powerView / #modeSeg content is visible and the adapter panel is hidden.
```

### SCN-012-042 - Truthful unavailable when no provider or owner model exists

```
Given an ordinary tool without a wired owner-state provider,
      or a tool whose adapter is declared unavailable until an owner model exists
      (technical-analysis-decision-lab)
When the view is "simple"
Then the panel renders the explicit "unavailable" projection
And no invented signal, default, or reinterpreted foundation receipt is shown.
```

## Adapter And Owner Map

The full verified per-tool owner-state-source mapping for all 23 tools (18
delegating, 4 open, 1 brief-only) is in
[`../../design-addendum-production-simple-wiring.md`](../../design-addendum-production-simple-wiring.md)
§5.3. Summary:

| Class | Count | Tools | Owner-state seam |
|---|---|---|---|
| Delegating (straightforward provider) | 18 | market-heatmap, options-flow-feed, intraday-tape, swing-structure, options-structure, gamma-trading, sector-research, global-rotation, real-assets, bond-regime, ai-capex-strategy, msft-july-print-model, company-fundamentals, etf-momentum, strategy-self-improvement, strategy-validation, smart-money-flow, waterfront-polo | page already delegates to its adapter module (`RL<MODULE>.*`); provider returns that same owner input |
| Open extraction | 3 | volatility-sizing (`rlvol.js`/RLVOL), palm-springs + ocean-shores (`RLRENTAL`) | owner seam documented but page does not yet load the adapter module; extract owner-parity provider |
| Intentional unavailable | 1 | technical-analysis-decision-lab | adapter declared "unavailable until owner model exists"; honest unavailable panel, native content under power |
| Brief-only (out of scope) | 1 | market-brief | `market-action-triage` runs inside Brief; `ownerModes` unchanged |

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-038/040 wired tool | Registered adapter + page provider | Open Simple, change one steerable control | Panel shows a ready adapter projection; the changed control moves the declared output; owner facts match Power | e2e-ui |
| SCN-012-039/041 #simpleView tool | bond-regime-lab wired | Toggle simple↔power | Simple: panel visible, `#simpleView` hidden; Power: `#powerView` native content visible, panel hidden | e2e-ui |
| SCN-012-042 unwired/no-owner tool | technical-analysis-decision-lab (or an un-provided tool) | Open Simple | Explicit "unavailable" projection; no invented signal; native content reachable under Power | e2e-ui |

## Implementation Files

### New

- `tests/simple-production-bridge.unit.mjs`
- `tests/simple-production-bridge.integration.mjs`
- `tests/simple-production-wiring.spec.mjs`

### Modified

- `rlexperience.js` (replace `installSimpleProjectionBridge` stub with the real production bridge; no `rlv-focused` mutation)
- `rlapp.js` (ordinary `ownerModes` → `["power"]`)
- each wired ordinary page (register a `toolId` owner-state provider; for the `#simpleView` subset, move native Simple content under Power): `market-heatmap-lab.html`, `options-flow-feed-lab.html`, `intraday-tape-lab.html`, `swing-structure-lab.html`, `options-structure-lab.html`, `gamma-trading-lab.html`, `sector-research-lab.html`, `global-rotation-lab.html`, `real-assets-lab.html`, `bond-regime-lab.html`, `ai-capex-strategy-lab.html`, `msft-july-print-model.html`, `company-fundamentals-lab.html`, `etf-momentum-lab.html`, `strategy-self-improvement-lab.html`, `strategy-validation-lab.html`, `smart-money-flow-lab.html`, `waterfront-polo-lab.html`, `volatility-sizing-lab.html`, `palm-springs-rental-market-lab.html`, `ocean-shores-rental-market-lab.html`, `technical-analysis-decision-lab.html`
- `tests/bond-regime-lab.spec.mjs`, `tests/volatility-sizing-lab.spec.mjs`, `tests/msft-july-market-refresh.spec.mjs` (move native `#simpleView` expectations to Power; assert the adapter panel in Simple)
- `scripts/selftest.mjs` (production-bridge canaries)

Owner extraction for the 4 open tools may surgically export/reuse existing owner
functions (`rlvol.js`, the rental engine, or the domain module) **only** with
byte/semantic-parity proof; no formula is copied into `rlexperience.js`, JSON,
another adapter, or a test helper.

## Implementation Plan

1. Write the RED contract tests first: the production-bridge unit contract and
   the single-tool `market-heatmap-lab` simple→panel e2e, both failing against
   the current stub before any code change.
2. **Shell bridge + ownerModes.** Replace `installSimpleProjectionBridge` with
   the real bridge (resolve the adapter definition by `toolId`; resolve the
   `__rlOwnerStateProvider[toolId]`; `createSimpleRuntime` + `register<Domain>Adapters`
   + `runtime.prepare({ ownerContext:{ ownerState }, … })` + `renderSimpleProjection`;
   render honest `unavailable` when the provider is absent; **never** mutate
   `body.rlv-focused`). Flip ordinary `ownerModes` in `rlapp.js` to `["power"]`.
   Confirm `market-brief` (brief-only) is unchanged.
3. **Proven single-tool end-to-end.** Wire `market-heatmap-lab` (its
   `reduceOwnerState` already exists): register its provider from the page's live
   `constituents`; prove simple→ready panel + one control recompute, and
   power→native, GREEN.
4. **Remaining delegating tools in adapter-module batches** (owner input already
   present; add each page's provider, owner-parity preserved): market-structure
   batch (intraday-tape, swing-structure), options batch (options-flow-feed,
   options-structure, gamma-trading), macro-rotation batch (sector-research,
   global-rotation, real-assets, bond-regime, etf-momentum), fundamental-models
   batch (ai-capex-strategy, msft-july-print-model, company-fundamentals),
   strategy-research batch (strategy-self-improvement, strategy-validation,
   smart-money-flow), property-research (waterfront-polo).
5. **Reconcile the 8 `#simpleView` tools** — move native Simple content under
   Power in HTML; update the 3 affected specs (`bond-regime-lab.spec.mjs`,
   `volatility-sizing-lab.spec.mjs`, `msft-july-market-refresh.spec.mjs`); add the
   NEW non-tautological regression proving native content shows in Power (not
   Simple) for bond-regime, closing BUG-003.
6. **Handle the 4 non-delegating tools** — extract owner-parity providers for
   `volatility-sizing-lab` (RLVOL), `palm-springs-rental-market-lab` and
   `ocean-shores-rental-market-lab` (RLRENTAL); document
   `technical-analysis-decision-lab` as intentional honest-`unavailable` until an
   owner five-gate model exists (native content under Power).
7. Add `scripts/selftest.mjs` canaries (bridge has no forbidden authority;
   provider-absent → honest unavailable; `ownerModes` contract). Verify
   `node scripts/selftest.mjs` stays 0-fail and every Feature 012 adapter e2e is
   GREEN in the real owner-mode flow.

## Shared Infrastructure Impact Sweep

| Protected surface | Downstream contract | Independent canary before broad validation |
|---|---|---|
| `rlviews.js` `applyVisual` | Owner/focus semantics unchanged except via the `ownerModes` data change | Assert `applyVisual` logic is unmodified; the behavior change flows only from `ownerModes` |
| `rldata.js` | Provider, cache, snapshot, owner-read ownership unchanged | Static zero-edit assertion for `rldata.js`; the bridge and providers never fetch |
| The 7 adapter modules' formulas | Owner formulas unchanged; only owner extraction for the 4 open tools, with parity | Pre/post owner fingerprint parity; forbidden-authority scan on the bridge and providers |
| `market-brief` / Market Action Center | Brief-only shell and `market-action-triage`-in-Brief unchanged | `market-brief` `ownerModes` stays `["brief"]`; no ordinary-Simple path touches it |

## Change Boundary And Protected Paths

**Allowed:** only files listed under Implementation Files.

**Excluded:** `rldata.js`, `rlviews.js` logic (data-only `ownerModes` effect via
`rlapp.js`), provider configuration/credentials, `scripts/fetch-options.mjs`,
`data/options/**`, `market-brief.html` / Brief / Market Action Center /
publication / private-portfolio surfaces, Feature 002/008 gates, BUG-004, QF,
package/source-lock files, framework-managed files, and the concurrent-session
dirty files (`specs/012-.../bugs/BUG-001-*`, `BUG-002-*`, `tool-experience-shell.*`).

**Formula ownership:** no formula is copied into `rlexperience.js`, JSON, another
adapter, or a test helper. Any owner extraction for the 4 open tools must be
consumed by both Power and Simple with parity proof.

## Rollback

Restore the stub `installSimpleProjectionBridge`, revert the `rlapp.js`
`ownerModes` change, revert each page's provider registration and native-Simple
relocation, and revert the 3 modified specs and selftest canaries. No source
data, option snapshots, provider config, or user-local history is deleted or
reset. (Note: rollback restores the pre-existing BUG-003 breakage, which is the
prior state.)

## Scenario-First RED/GREEN Contract

Each production-wiring test is written before its code change. A valid RED proves
the panel is empty/unavailable or native content is re-hidden under the current
stub, or that a wired tool's control produces no owner effect. A live/provider
outage, a stale input allowed by policy, a missing browser, or a selector/setup
error is not a valid RED. The BUG-003 regression must fail on the current stub
and pass only after the bridge + `ownerModes` change.

## Test Plan

| ID | Type | Category | Scenario | File / Location | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
|---|---|---|---|---|---|---|---|---|
| TP-15-01 | Unit | unit | SCN-012-038, SCN-012-039, SCN-012-042 | `tests/simple-production-bridge.unit.mjs` | The production bridge resolves the adapter by toolId, calls the owner-state provider, runs the runtime, renders a ready projection, never mutates `rlv-focused`, renders honest unavailable when the provider is absent, and carries no forbidden authority; ordinary `ownerModes` is `["power"]` and brief-only is unchanged | `node --test tests/simple-production-bridge.unit.mjs` | No | `report.md#tp-15-01` |
| TP-15-02 | Integration | integration | SCN-012-038, SCN-012-040 | `tests/simple-production-bridge.integration.mjs` | Registry-derived loop drives each wired tool's provider → `runtime.prepare` → ready projection into the panel and proves owner-parity facts equal the Power path | `node --test tests/simple-production-bridge.integration.mjs` | No | `report.md#tp-15-02` |
| TP-15-03 | Regression E2E | e2e-ui | SCN-012-038 | `tests/simple-production-wiring.spec.mjs` | `Regression: market-heatmap Simple renders the real adapter panel and one control recomputes owner leadership` | `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: market-heatmap Simple renders the real adapter panel and one control recomputes owner leadership" --reporter=list` | Yes | `report.md#tp-15-03` |
| TP-15-04 | Regression E2E | e2e-ui | SCN-012-038, SCN-012-040 | `tests/simple-production-wiring.spec.mjs` | `Regression: each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact` | `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact" --reporter=list` | Yes | `report.md#tp-15-04` |
| TP-15-05 | Regression E2E | e2e-ui | SCN-012-039, SCN-012-041 | `tests/bond-regime-lab.spec.mjs` | `Regression: bond-regime native content shows in Power not Simple and the adapter panel is the Simple surface (BUG-003 closure)` | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: bond-regime native content shows in Power not Simple and the adapter panel is the Simple surface" --reporter=list` | Yes | `report.md#tp-15-05` |
| TP-15-06 | Regression E2E | e2e-ui | SCN-012-041, SCN-012-042 | `tests/volatility-sizing-lab.spec.mjs` | `Regression: volatility-sizing native Simple moves to Power and Simple shows the adapter panel or an honest unavailable until the RLVOL provider is wired` | `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "Regression: volatility-sizing native Simple moves to Power and Simple shows the adapter panel or an honest unavailable until the RLVOL provider is wired" --reporter=list` | Yes | `report.md#tp-15-06` |
| TP-15-07 | Broad regression | unit | SCN-012-038, SCN-012-039, SCN-012-040, SCN-012-041, SCN-012-042 | `scripts/selftest.mjs` | Preserve all existing invariants and add production-bridge canaries (no forbidden authority, provider-absent honest unavailable, `ownerModes` contract); suite stays 0-fail | `node scripts/selftest.mjs` | No | `report.md#tp-15-07` |

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [ ] SCN-012-038: The production bridge replaces the stub and renders the real registered adapter into `[data-rlexperience-panel="simple"]` for wired ordinary tools, with no fabricated default and no forbidden authority.
- [ ] SCN-012-039: Ordinary `ownerModes` is `["power"]`; `applyVisual` is the sole owner of `rlv-focused`; Simple shows the panel (native hidden) and Power shows native content (panel hidden); the bridge never mutates `rlv-focused`.
- [ ] SCN-012-040: Each wired page exposes its real current owner state through the uniform provider seam, and the adapter's owner facts match the page's Power path (owner parity, no formula copy).
- [ ] SCN-012-041: The 8 `#simpleView` tools' native Simple content is reachable under Power with nothing deleted; BUG-003 is closed.
- [ ] SCN-012-042: Tools without a wired provider, and `technical-analysis-decision-lab` (no owner model), render an explicit honest `unavailable` with no invented signal; `market-brief` (brief-only) is unaffected.
- [ ] The change remains within the exact bridge/ownerModes/page-provider boundary; rollback restores the prior stub behavior without data loss.

#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-15-01 unit evidence proves the bridge contract, `ownerModes`, honest-unavailable fallback, and no forbidden authority.
- [ ] TP-15-02 integration evidence proves the registry-derived provider→runtime→panel loop and owner-parity for wired tools.
- [ ] TP-15-03 E2E evidence proves market-heatmap Simple renders the real adapter panel and a control recomputes.
- [ ] TP-15-04 E2E evidence proves each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact.
- [ ] TP-15-05 E2E evidence proves bond-regime native content shows in Power not Simple (BUG-003 closure).
- [ ] TP-15-06 E2E evidence proves volatility-sizing native Simple moved to Power and Simple shows the panel or an honest unavailable pending the RLVOL provider.
- [ ] TP-15-07 broad selftest evidence proves existing Research Lab behavior remains green (0 failures) with the new bridge canaries.

#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan (no `page.route`/`context.route`/`intercept`/`msw`/`nock`), bridge/provider forbidden-authority scan, owner pre/post parity, the registry-derived loop, changed-path boundary, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and the broad selftest are current and clean.
