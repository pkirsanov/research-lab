# Design Addendum: Production Simple-View Adapter Wiring (Model B)

> **Status:** Design addendum to
> [`design.md`](design.md). Authored by `bubbles.design`. No code changed by
> this addendum — it specifies the wiring that **Scope 15** will implement.
> **Decision context:** the orchestrator has selected **Model B** (see the
> Decision section below); this addendum designs to that decision and does not
> relitigate it.
>
> This addendum is separate from `design.md` because `design.md` is already 1843
> lines; a pointer to this file is appended to `design.md` under
> `## Addendum: Production Simple-View Adapter Wiring (Model B)`.

## 1. The Foundational Gap (verified evidence)

Feature 012 delivered 23 SimpleModel adapter definitions (`simple-models.json`)
and their compute (`rlexperience-adapters/*.js`, 7 modules) in Scopes 05/06/07,
but **never wired the adapters into production page rendering**. Every factual
claim below was verified in this repository before writing:

| Claim | Evidence (file:line) |
|---|---|
| `renderSimpleProjection` (public API) has **zero** production callers | `grep '\.renderSimpleProjection('` excl. `tests/` → empty. Defined `rlexperience.js:1264` (`renderSimpleProjectionInternal`); exported `rlexperience.js:1800`. |
| The **only** production caller of the internal renderer is the stub bridge | `rlexperience.js:1334` inside `installSimpleProjectionBridge()` (`rlexperience.js:1310`, invoked `1339`). |
| The stub renders a hardcoded **"unavailable"** projection, never the real adapter | `rlexperience.js:1321-1333`: `projectSimpleStateInternal("unavailable", { message: "Owner model adapter required: …" })`. |
| The stub **unconditionally re-adds** `body.rlv-focused` after `applyVisual` set it | `rlexperience.js:1335` `document.body.classList.add("rlv-focused")` on the `rlviews:change`→`simple` event. |
| `applyVisual` already sets `rlv-focused = (ownerModes.indexOf(mode) === -1)` | `rlviews.js:145`. `apply()` calls `applyVisual` **then** dispatches `rlviews:change` (`rlviews.js:170-176`), so the stub listener re-hides native content the shell had just shown. |
| Ordinary tools set BOTH simple+power as owner modes | `rlapp.js:287` `ownerModes: resolved.value.kind === "ordinary" ? ["simple", "power"] : ["brief"]`. |
| Only `market-structure.js` exports a top-level owner reducer, and it is heatmap-specific | `rlexperience-adapters/market-structure.js:246` `reduceOwnerState` returns `toolId: "market-heatmap-lab"` hardcoded. The other 6 modules normalize owner state inside each adapter's `captureEvidence(ownerContext)`. |
| The full runtime→render path already exists and is exercised by adapter e2e (fixture-fed) | `tests/simple-model-adapters-market.spec.mjs:453` / `:465` and `tests/simple-models.spec.mjs:220`: `api.renderSimpleProjection(host, runtime.snapshot().value.projection)`. |

**Consequence:** the 23 adapters are dead in the live product. On the live site,
selecting the ordinary "Simple" view runs the stub → an honest-but-empty
"owner model adapter required / unavailable" panel, and the stub's extra
`rlv-focused` add re-hides the tool's native content (the open **BUG-003**
bond-regime native-view breakage).

## 2. The Decision (Model B — given, not relitigated)

Adopt **Model B**: the Feature 012 SimpleModel adapter is the **uniform canonical
"Simple" view** for every ordinary tool, superseding native ad-hoc Simple views.
Native rich Simple content is **reorganized into "Power" — nothing is deleted.**
This is Feature 012's `SCN-012-001` intent ("Simple is a distinct steerable
model"). Scope 15 completes the production wiring that Scopes 05/06/07 never did.

The **contrasting Model A** (Simple = each tool's native `#simpleView`) is
explicitly **not** chosen. This addendum designs only Model B.

## 3. Rendering Contract (replaces the stub bridge)

`installSimpleProjectionBridge()` (the stub) is **replaced** by a real
production bridge. On `rlviews:change` with `detail.mode === "simple"` for a
tool whose resolved `experience.kind === "ordinary"`, the shell MUST:

1. Resolve the tool's registered adapter definition from the model registry
   (`simple-models.json`, already loaded on `globalThis.__rlviewsRegistration`)
   by `detail.toolId` → the matching `definition` (its `definitionId`,
   `simpleAdapterId`, `adapterModule`, `parameterDefinitions`, `seedPolicy`).
2. Obtain the tool's **real current owner state** via the owner-state provider
   seam (Section 5), keyed by `toolId`.
3. Build/reuse a Simple runtime and register the tool's adapter module, then run
   the compute, using the **exact path the adapter e2e already proves**:

   ```text
   runtime  = RLEXPERIENCE.createSimpleRuntime(config, { contractVersion: "simple-model-registry/v1", definitions: [definition] })
   register = <RLMODULE>.register<Domain>Adapters(runtime, RLEXPERIENCE, [definition])   // e.g. RLMARKETSTRUCTURE.registerMarketStructureAdapters
   prepared = runtime.prepare({
                definitionId,
                ownerContext: { ownerState: <provider(toolId)> },   // REAL page state, not a fixture
                parameterValues: <registry defaults, or the panel's current control values>,
                seed: <definition.seedPolicy.required ? definition.seedPolicy.defaultSeed : null>,
                scenarioIds: ["baseline"],
                computedAt: <ISO now>
              })
   RLEXPERIENCE.renderSimpleProjection(panel, runtime.snapshot().value.projection)
   ```

   This is byte-for-byte the sequence in `tests/simple-model-adapters-market.spec.mjs:453/465`
   and `tests/simple-models.spec.mjs:220`; the **only** production difference is
   that `ownerState` comes from the page provider instead of a test fixture.
4. The panel `[data-rlexperience-panel="simple"]` is the render host and MUST be
   **VISIBLE** in simple mode (native hidden). Visibility is owned by
   `applyVisual` via the `ownerModes` change (Section 4), **not** by the bridge.

### Bridge invariants (fix BUG-003)

- The bridge **MUST NOT** mutate `body.rlv-focused`. `applyVisual` is the sole
  owner of `rlv-focused`; the stub's `classList.add("rlv-focused")` line is
  **removed**. (Under Model B `applyVisual` already sets `rlv-focused` ON for
  `simple` — Section 4 — so the add was both redundant and the BUG-003 cause.)
- Absent/failed provider → the bridge renders the **honest** `"unavailable"`
  projection (the current truthful fallback, minus the `rlv-focused` mutation).
  This preserves truth for not-yet-wired tools and lets wiring proceed
  incrementally (one tool at a time) with no regression to unwired tools.
- The bridge performs **local compute only**; it never `fetch`/`providerFetch`,
  reads credentials, calls an LLM/publisher/store, or mutates owner state —
  identical to the adapter authority boundary already enforced by Scope 05
  (`tests/simple-model-adapters-market.unit.mjs` "no forbidden authority" scan).

## 4. `ownerModes` Change

`rlapp.js:287` changes for ordinary tools from `["simple", "power"]` to
**`["power"]`**:

```diff
- ownerModes: resolved.value.kind === "ordinary" ? ["simple", "power"] : ["brief"]
+ ownerModes: resolved.value.kind === "ordinary" ? ["power"] : ["brief"]
```

Given `rlviews.js:145-152` (`applyVisual`), this makes — with **no other
`rlviews.js` logic change**:

| Mode | `rlv-focused` (`ownerModes.indexOf(mode) === -1`) | `[data-rlexperience-panel="simple"]` | native content |
|---|---|---|---|
| `simple` | `-1` → **ON** | **visible** (`ownerPlaceholder` false for `simple`; `panel.hidden = (panelMode !== mode)`) | hidden |
| `power` | present → **OFF** | hidden (`ownerPlaceholder` true) | **visible** |

So flipping `ownerModes` to `["power"]` **is** Model B and **simultaneously
fixes BUG-003** (native content shows correctly in power; the adapter panel
shows in simple). The `applyVisual` mechanics already support this the moment
`ownerModes` no longer lists `simple`.

**Brief-only tools are unaffected.** `market-brief` resolves to
`kind === "market-action-center"` (`tool-experience.config.json:14`), not
`"ordinary"`, so it keeps `ownerModes: ["brief"]` and its four-view Market
Action Center shell. Its `market-action-triage` adapter runs **inside Brief**
(registry `researchQuestion`: "no top-level Simple") and is therefore **out of
scope** for the ordinary Simple-panel wiring.

## 5. Owner-State Exposure — the Hard Part

Each adapter is **pure compute over an already-captured, frozen owner
snapshot** (`market-structure.js` header: "Data acquisition (RLDATA cache reads)
stays in the owning page; the page hands the adapter an already-loaded, frozen
owner snapshot through `captureEvidence`"). Today **only the injected-fixture
tests** provide that snapshot (`ownerContext: { ownerState: <fixture>() }`). The
live pages never feed it. Scope 15 introduces a uniform seam so each page
exposes its **real** current owner state to the runtime.

### 5.1 The uniform seam

Each ordinary page registers a provider keyed by `toolId`, following the
existing `globalThis.__rlviews*` convention:

```js
// on each ordinary page, after the page's own Simple/Power owner input is built:
globalThis.__rlOwnerStateProvider = globalThis.__rlOwnerStateProvider || {};
globalThis.__rlOwnerStateProvider["<toolId>"] = function () {
  // Return the SAME frozen owner snapshot the page already computes for its
  // native Simple/Power view (built from RLDATA-cache-derived inputs), shaped
  // to the adapter's ownerState contract. NO fetch here — reads live page state.
  return <frozenOwnerSnapshot>;
};
```

Properties:

- **Idempotent, per-tool, incremental.** A page with no provider yet →
  bridge renders honest `"unavailable"` (no regression). Tools are wired one at
  a time.
- **Owner-parity preserved.** The provider returns the exact owner input the
  page already feeds to its adapter module's owner functions (proven present —
  see 5.3), so Simple and Power share one formula (the Scope 05/06/07
  owner-parity contract is not weakened).
- **No new authority.** The provider only reads already-loaded page state; it
  never fetches. (The adapter's `captureEvidence` freezes/validates it.)

An alternative — the page calls a `RLEXPERIENCE.registerOwnerStateProvider(toolId, fn)`
API instead of writing a global — is acceptable if Scope 15 prefers an explicit
registration surface; the semantics (per-tool provider resolved by the bridge)
are identical. The concrete surface is a Scope-15 implementation choice; this
addendum fixes the **contract** (per-tool provider → `ownerContext.ownerState`),
not the exact global name.

### 5.2 `ownerState` shape

There is **no single reducer** across modules. `market-structure.js` exports
`reduceOwnerState` but it is **hardcoded to `toolId: "market-heatmap-lab"`**
(heatmap-only); the other 6 modules and the other 4 market-structure adapters
normalize `ownerState` inside each adapter's `captureEvidence(ownerContext)`,
and the tests **hand-build** each `ownerState` (e.g. `strategyOwnerFixture()`,
`palmOwnerFixture()`, `oceanOwnerFixture()`, `locationOwnerFixture()`,
`disclosureOwnerFixture()`, `walkForwardValidationOwnerFixture()`,
`marketActionOwnerFixture()`). Therefore each page's provider constructs the
**adapter-specific** `ownerState` shape; the per-adapter fixture is the
authoritative reference for that shape, and the per-page owner input is the
authoritative reference for the real values.

### 5.3 Full per-tool owner-state-source mapping (all 23)

Verified: which adapter module each page loads and the module-global owner
functions it already delegates to (proving the owner input is present on the
page). "Delegation anchor" = the `RL<MODULE>.<fn>` call site(s) in the page.
Owner seams cross-check the Scope 05/06/07 "Adapter And Owner Map" tables.

**A. Ordinary — page already delegates to its adapter module (owner input
present; provider extraction is straightforward) — 18 tools:**

| # | Tool | Adapter id | Module / global | Owner-state source (page input already fed to the module) | Delegation anchor |
|---|---|---|---|---|---|
| 1 | `market-heatmap-lab` | `market-breadth/v1` | `market-structure.js` / `RLMARKETSTRUCTURE` | page `constituents` (RLDATA cache) → `reduceOwnerState` (EXISTS, heatmap-specific) / `breadthReadCells`+`pctOverWindow`+`meanSampleSd` | `market-heatmap-lab.html:478,481,509,510,520,521,556` |
| 2 | `options-flow-feed-lab` | `options-anomaly/v1` | `options.js` / `RLOPTIONS` | parsed Yahoo/same-origin chain via `parseYahooChain`/`scoreChain`/`tapeRead` | `options-flow-feed-lab.html:399-405` |
| 3 | `intraday-tape-lab` | `session-auction/v1` | `market-structure.js` / `RLMARKETSTRUCTURE` | session bars/VWAP/profile via `computeSession`/`adherence`/`controlRead`/`sessionType` | `intraday-tape-lab.html:1424,1425,1430,1431` |
| 4 | `swing-structure-lab` | `swing-transition/v1` | `market-structure.js` / `RLMARKETSTRUCTURE` | MA/pivots/structure/OBV/regime via `smaArr`/`alignment`/`pivots`/`structure`/`accumDist`/`regimeBand` | `swing-structure-lab.html:1382,1427,1468,1469,1471,1473` |
| 5 | `options-structure-lab` | `options-surface/v1` | `options.js` / `RLOPTIONS` | chain + BSM surface via `nPDF`/`nCDF`/`bsm` | `options-structure-lab.html:1289-1291` |
| 6 | `gamma-trading-lab` | `dealer-gamma-playbook/v1` | `options.js` / `RLOPTIONS` | gamma env/OVI/OPEX via `gammaEnv`/`percentileOf`/`oviPercentile`/`opexInfo`/`thirdFriday`/`nextMonthly`/`nextQuarterly` | `gamma-trading-lab.html:1163,1164,1173,1174,1178,1180-1182` |
| 7 | `sector-research-lab` | `sector-rotation-transition/v1` | `macro-rotation.js` / `RLMACROROTATION` | rotation inputs via `rollZ`/`stateLabel`/`rrgQuadrant`/`rotationCandidacy` | `sector-research-lab.html:1985,1986,2076,2077,2090,2192,2193` |
| 8 | `global-rotation-lab` | `country-rotation/v1` | `macro-rotation.js` / `RLMACROROTATION` | country momentum + FX via `globalPairCorrelation` | `global-rotation-lab.html:1169,1294,1297` |
| 9 | `real-assets-lab` | `real-asset-driver/v1` | `macro-rotation.js` / `RLMACROROTATION` | real-asset driver inputs via `realBreadthPct` | `real-assets-lab.html:1011,1363,1365` |
| 10 | `bond-regime-lab` | `fixed-income-sleeve/v1` | `macro-rotation.js` / `RLMACROROTATION` | sleeve inputs via `sleeveTotalReturn` **(BUG-003 tool)** | `bond-regime-lab.html:1101,1891,1894` |
| 11 | `ai-capex-strategy-lab` | `ai-capex-portfolio/v1` | `fundamental-models.js` / `RLFUNDAMENTALS` | capex universe/theme inputs (`ai-capex-universe.json`) via `erf`/`normCdf`/`invNorm`/`bandStats`/`cvarOf`; **seeded** (`seedPolicy.required=true`) | `ai-capex-strategy-lab.html:1612-1618` |
| 12 | `msft-july-print-model` | `msft-margin-eps/v1` | `fundamental-models.js` / `RLFUNDAMENTALS` | margin/EPS/valuation inputs via `msftAnnualBridge` | `msft-july-print-model.html:2490,2603,2606` |
| 13 | `company-fundamentals-lab` | `company-scenario-bridge/v1` | `fundamental-models.js` / `RLFUNDAMENTALS` | company scenario/lineage inputs via `projectCompanyScenario` | `company-fundamentals-lab.html:1147,2141,2152,2182` |
| 14 | `etf-momentum-lab` | `etf-ranking/v1` | `macro-rotation.js` / `RLMACROROTATION` | ETF universe momentum via `etfMomentumSignal`/`etfCompositeScore` | `etf-momentum-lab.html:1618-1621` |
| 15 | `strategy-self-improvement-lab` | `strategy-evolution/v1` | `strategy-research.js` / `RLSTRATEGY` | seeded path/walk-forward inputs via `mulberry`/`gauss`/`genSeries`/`sma`; **seeded** | `strategy-self-improvement-lab.html:732-742` |
| 16 | `strategy-validation-lab` | `walk-forward-validation/v1` | `strategy-research.js` / `RLSTRATEGY` | rule/universe/OOS inputs via `seriesFromCloses`/`walkForwardEmbargo`/`scorePass`/`allPass` | `strategy-validation-lab.html:660,666-669` |
| 17 | `smart-money-flow-lab` | `disclosure-decay/v1` | `strategy-research.js` / `RLSTRATEGY` | disclosure inputs via `alphaDecay`/`dayGap` | `smart-money-flow-lab.html:855,856,859` |
| 18 | `waterfront-polo-lab` | `location-suitability/v1` | `property-research.js` / `RLPROPERTY` | property listings + geo via `haversineMi`/`driveMinutesApprox`/`nearestClub` | `waterfront-polo-lab.html:585,586,588,589,591,592` |

**B. Ordinary — page does NOT currently delegate to its adapter module
(owner-parity / provider extraction is an OPEN implementation item) — 4 tools:**

| # | Tool | Adapter id | Module | Owner-state source (documented, but NOT yet fed to the adapter) | Open item |
|---|---|---|---|---|---|
| 19 | `volatility-sizing-lab` | `conditional-volatility/v1` | `market-structure.js` | native engine `rlvol.js` / `RLVOL` (`buildVolDecisionRead`, `projectVolToolRead`, `validateUniverse`). Page loads `rlvol.js`, **not** `market-structure.js`. Registry: adapter "wraps RLVOL"; Scope 05 owner map: seam = `rlvol.js`. | Establish owner-parity provider from the page's RLVOL compute to the `conditional-volatility` `ownerState`. Page HAS native `#simpleView`. |
| 20 | `palm-springs-rental-market-lab` | `str-scenario/palm-springs/v1` | `property-research.js` | shared rental engine `RLRENTAL.mountRoute`. Page does **not** load `property-research.js`. Registry: adapter "reuses the owning rental engine". | Extract the rental-scenario owner input from `RLRENTAL` into the `str-scenario` `ownerState`; expose provider. |
| 21 | `ocean-shores-rental-market-lab` | `str-scenario/ocean-shores/v1` | `property-research.js` | shared rental engine `RLRENTAL.mountRoute`. Same as palm-springs. | Same as #20 (seasonal variant). |
| 22 | `technical-analysis-decision-lab` | `technical-five-gate/v1` | `market-structure.js` | **No owner model yet.** Page loads no adapter module. The adapter is **declared** to "return explicit unavailable rather than reinterpret the foundation receipt as a signal" (registry `limitations`; Scope 05 owner map). | **Intentional:** Simple panel legitimately renders honest `"unavailable"` until a five-gate owner model is authored. No provider until then. Page HAS native `#modeSeg`. **Not a wiring gap** — a documented, truthful exception. |

**C. Brief-only — out of scope for the ordinary Simple-panel wiring — 1 tool:**

| # | Tool | Adapter id | Module | Note |
|---|---|---|---|---|
| 23 | `market-brief` | `market-action-triage/v1` | `market-action.js` / `RLMARKETACTION` | `kind = market-action-center`; adapter runs **inside Brief** (registry: "no top-level Simple"). Not rendered via `[data-rlexperience-panel="simple"]`. `ownerModes` unchanged (`["brief"]`). Owner state = `market-brief` Brief compute (`market-brief.payload.json` path), handled by the Market Action Center Brief surface, not this Simple wiring. |

Totals: **18 straightforward + 4 open (3 extractions + 1 intentional-unavailable)
= 22 ordinary + 1 brief-only = 23.**

## 6. Native-Simple Reconciliation for the 8 `#simpleView` Tools

Verified 8 tools with a native `#simpleView`: `bond-regime-lab`,
`etf-momentum-lab`, `gamma-trading-lab`, `intraday-tape-lab`,
`msft-july-print-model`, `sector-research-lab`, `swing-structure-lab`,
`volatility-sizing-lab` (`grep 'id="simpleView"' *.html`). Under Model B their
native rich Simple content **moves to Power** (reachable via the power view /
existing `#powerView` or `#modeSeg` power toggle) — **nothing is deleted**.
`simple` becomes the adapter panel.

### 6.1 Affected test files (verified — only 3 assert `#simpleView` on simple)

`#simpleView`-on-simple assertions exist in **exactly 3** spec files. The other
5 `#simpleView` tools have **no** page spec asserting native Simple, so they
require **new** page-level e2e (Section 7), not edits.

| Tool | Spec file | Current assertion | Required change under Model B |
|---|---|---|---|
| `bond-regime-lab` | `tests/bond-regime-lab.spec.mjs` | `:349` `expect('#simpleView [data-model-digest]').toBeVisible()` on **default simple**; `:351,:365,:383` read the digest from `#simpleView` | The native digest source moves to **power**: assert `#powerView [data-model-digest]` (its `#powerView` digest is already read at `:370,:386`) in power mode; assert `[data-rlexperience-panel="simple"]` **visible** in simple mode. |
| `volatility-sizing-lab` | `tests/volatility-sizing-lab.spec.mjs` | `:74,:75,:80,:95,:161,:281` assert `#simpleView` text/visibility on simple | Move those native-content assertions to **power**; assert the adapter panel visible in simple. **NB:** this tool is also an **open extraction** (Section 5.3-B #19) — until its RLVOL provider lands, simple honestly shows `"unavailable"`, so the panel-visible assertion must tolerate the `unavailable` state until the provider is wired. |
| `msft-july-print-model` | `tests/msft-july-market-refresh.spec.mjs` | `:445,:455` DOM **existence** probes (`modeSeg`/`simpleView`/`powerView` present) | These are presence probes, not mode assertions; verify they remain valid when native controls sit under power (the elements still exist). Update only if any probe implies default-simple ownership. |

### 6.2 The other 5 `#simpleView` tools (no existing native-Simple spec)

`etf-momentum-lab`, `gamma-trading-lab`, `intraday-tape-lab`,
`sector-research-lab`, `swing-structure-lab` have native `#simpleView` in HTML
but **no** page spec that asserts it on simple. Reconciliation is HTML-only
(native Simple content moves under power); there is no spec to edit. At least
one of them is covered by the **new** regression in Section 7.

### 6.3 `#modeSeg` note

15 tools use the `body.power` / `#modeSeg` native pattern
(`grep 'id="modeSeg"'`); several overlap the `#simpleView` set. Under Model B
their `#modeSeg` native content is the **power** surface. No `#modeSeg` tool
loses content.

## 7. Test Strategy

1. **Existing adapter e2e must go GREEN in the real owner-mode flow.** The
   Feature 012 adapter e2e (`tests/simple-model-adapters-market.spec.mjs`,
   `tests/simple-model-adapters-macro-fundamental.spec.mjs`,
   `tests/simple-model-adapters-strategy-property.spec.mjs`,
   `tests/simple-models.spec.mjs`) already render the panel via the runtime with
   injected fixtures. In Model B they must additionally pass with the panel
   **visible** in `simple` mode when driven by the page provider (not a fixture)
   for each wired tool.
2. **New per-tool page e2e (live-stack, non-mocked).** For each wired tool, a
   page-level e2e that: opens the page, selects `simple`, asserts
   `[data-rlexperience-panel="simple"]` is **visible** with a **ready**
   adapter projection (`data-rlexperience-simple-state="ready"` +
   `data-rlexperience-adapter="<adapterId>"`, both set by
   `renderSimpleProjectionInternal` at `rlexperience.js:1270-1272`), and changes
   one steerable control to prove owner recompute. No `page.route`/`intercept`.
3. **NEW non-tautological regression: native content shows in POWER, not
   simple, for a `#simpleView` tool.** Use `bond-regime-lab` (the BUG-003 tool):
   - In `simple`: `[data-rlexperience-panel="simple"]` visible **and**
     `#simpleView` **not** visible (native hidden) — proves the adapter panel,
     not native Simple, is the simple surface.
   - In `power`: `#powerView [data-model-digest]` (native content) visible and
     the adapter panel hidden — proves native content demoted to power, not
     deleted.
   This is **adversarial**: it fails if the stub bridge (or a reverted
   `ownerModes`) re-hides native content or leaves the panel empty in simple,
   and it fails if native content is lost from power. It is not tautological
   (native visibility differs by mode, so it cannot pass in both broken and
   fixed states).
4. **`selftest` must stay green.** `node scripts/selftest.mjs` must remain **0
   failures** at its full count. The session-verified baseline at clean HEAD
   `1b89bada` is **952 pass / 0 fail**; Scope 15 MUST NOT reduce the passing
   count or introduce a failure. (Actual counts re-verified with real output at
   implementation time — not asserted here.)
5. **BUG-003 closure.** The bond-regime browser e2e that BUG-003 tracks
   (`tests/bond-regime-lab.spec.mjs`) must pass once (a) native digest moves to
   power (Section 6.1) and (b) `ownerModes` + the real bridge land.

## 8. Risks / Challenges to Model B (surfaced honestly)

- **`technical-analysis-decision-lab` has no owner model.** Its adapter is
  intentionally `"unavailable"` until a five-gate owner model is authored. Under
  Model B its `simple` view is an honest `"unavailable"` panel while its native
  `#modeSeg` content is fully available under `power`. This is **aligned** with
  `SCN-012-001` and the adapter's declared limitation (honest unavailable beats
  an invented signal), so it is a **caveat, not a blocker** — but it means one
  ordinary tool's `simple` view is deliberately empty-but-honest until follow-on
  owner-model work.
- **`volatility-sizing-lab` + the two rental tools do not currently delegate.**
  Their owner seams are documented (`rlvol.js`, `RLRENTAL`) but not yet fed to
  the adapter. Until each provider extraction lands, those `simple` views
  honestly show `"unavailable"`. No tool is blocked — the incremental provider
  seam (Section 5.1) degrades truthfully.
- **No tool's native Simple is impossible to demote to power.** Every
  `#simpleView` tool also exposes a power surface (`#powerView` or `#modeSeg`
  power), and every `#modeSeg` tool's native content already sits under a power
  toggle, so the "move to power" reconciliation has a concrete home for every
  tool. **No content-loss risk was found.**
- **Owner-parity must not be weakened.** The provider must return the exact
  owner input the page already feeds to its module (Section 5.1), or Simple and
  Power would diverge. The Scope 05/06/07 owner-parity tests remain the guard.

## 9. Boundary

Scope 15 touches: `rlexperience.js` (replace stub bridge), `rlapp.js`
(`ownerModes`), each wired ordinary page (register a provider; move native
Simple → power for the `#simpleView` subset), the 3 affected native-Simple spec
files, new per-tool/regression e2e, and `scripts/selftest.mjs` (canaries). It
MUST NOT touch: `rldata.js`, provider config/credentials, the 7 adapter modules'
formulas (owner extraction for the 4 open tools is byte/semantic-parity only),
`market-brief`/Brief/Market Action Center surfaces, Feature 002/008 gates, QF,
package/source-lock, framework-managed files, or the concurrent-session dirty
files (`specs/012-.../bugs/BUG-001-*`, `BUG-002-*`, `tool-experience-shell.*`).
