# Scope 15: Production Simple-View Adapter Wiring (Model B)

## 15-production-simple-adapter-wiring

**Status:** In Progress

**Delivered state — 2026-07-28, HEAD `fed8f9ab`, re-executed this session.** The
production bridge is delivered and proven, and **18 of the 22 ordinary tools are
wired, 17 in strict projection parity**; the 18th
(`technical-analysis-decision-lab`) is the intended registry-gated honest
`unavailable` under the SCN-012-034 lock, not a gap. Every suite executed this
session is green at exit 0: TP-15-02 integration 6/6, TP-15-01 unit 5/5,
`scripts/selftest.mjs` 952 passed / 0 failed, the 5-spec Simple-adapter Playwright
batch 27/27, and `tests/bond-regime-lab.spec.mjs` 27/27. Full raw output in
[report.md](report.md#final-verification-run--2026-07-28-head-fed8f9ab).

**Five tools are not wired, each for a recorded cause.** `market-brief` — by
design: its registry `experience.kind` is `market-action-center`, so it is not one
of the 22 and its `ownerModes` stays `["brief"]`. `msft-july-print-model` — not
applicable: a deliberate `window.__rlviewsInit = 1` shell opt-out means the bridge
never runs and a provider would be dead code. `volatility-sizing-lab` — attempted
and **cleanly reverted**, because TP-15-02 strict projection parity diverged on a
live-data-dependent owner state. `palm-springs-rental-market-lab` and
`ocean-shores-rental-market-lab` — attempted and **cleanly reverted**, because the
owner computation lives in the shared `RLRENTAL` engine with no per-tool adapter
module, so extraction would require editing shared code or duplicating a formula,
both forbidden by this scope's Formula-ownership rule.

**Why `In Progress` rather than `Done` or `Blocked`.** 10 of the 14 DoD items are
open, so `Done` would be fabrication. `Blocked` would also be inaccurate, because
the remaining work is *mixed*: part is still agent-actionable inside this scope's
own allowlist — the Implementation Plan step-7 `scripts/selftest.mjs` bridge
canaries, and the absent `ownerModes` / forbidden-authority assertions in
`tests/simple-production-bridge.unit.mjs` (both files are declared Implementation
Files) — while the rest is externally blocked on owner decisions for the unwired
tools and on drifts D1-D4 routed to `bubbles.plan`. `In Progress` is the only
label that misrepresents neither half.

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

**Authoritative mechanism — provider-gating (resolves the tension with the flat `["power"]` phrasing):** `ownerModes` is resolved per ordinary tool by `rlapp.js`, gated on the page's owner-state provider — a page that has registered `__rlOwnerStateProvider[toolId]` resolves to `["power"]`; an un-provided page keeps `["simple", "power"]` so unwired tools do not regress. The rollout is incremental (one provider registration per tool); the END state (scope fully Done) is every ordinary tool wired, at which point every ordinary tool's resolved `ownerModes` is `["power"]`. The Gherkin below is therefore the per-wired-tool contract AND the all-ordinary-tools END-state contract.

```
Given a wired ordinary tool (its page registered an owner-state provider) so its resolved ownerModes are ["power"]
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
- `rlapp.js` (provider-gated ordinary `ownerModes`: resolves to `["power"]` once the page registers an owner-state provider, else `["simple", "power"]` so unwired tools do not regress — the authoritative incremental mechanism)
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
   `body.rlv-focused`). Provider-gate ordinary `ownerModes` in `rlapp.js`: resolve
   `["power"]` when the page has registered `__rlOwnerStateProvider[toolId]`, else
   keep `["simple", "power"]` so unwired tools do not regress (the authoritative
   incremental mechanism; the END state is every ordinary tool wired).
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

### Implementation Plan Progress (as of 2026-07-28, HEAD `fed8f9ab`)

Annotation only — no step is added, removed, or reworded, and no DoD item is
created here. Full evidence is in
[report.md](report.md#final-verification-run--2026-07-28-head-fed8f9ab).

- **Step 1 — Complete.** `tests/simple-production-bridge.unit.mjs` and
  `tests/simple-production-wiring.spec.mjs` landed with the bridge (`f216be0d`).
- **Step 2 — Complete.** Real bridge in `rlexperience.js` + provider-gated ordinary
  `ownerModes` in `rlapp.js` (`f216be0d`); `market-brief` confirmed unchanged.
- **Step 3 — Complete.** `market-heatmap-lab` wired and proven end-to-end
  (`f216be0d`, greened in `ab1d4879`).
- **Step 4 — Partially complete.** 17 of the 18 delegating tools are wired across
  `f216be0d`…`fed8f9ab` (including `bond-regime-lab` and `company-fundamentals-lab`,
  both wired with their specs reconciled to the shell). Outstanding:
  `msft-july-print-model` — a deliberate shared-shell opt-out
  (`<meta name="rlviews" content="off">` → `window.__rlviewsInit = 1`), so the bridge
  never runs and a provider would be dead code. Wiring it means removing an
  intentional opt-out; that is an owner decision, not a scope-15 change.
- **Step 5 — Partially complete.** 6 of the 8 `#simpleView` pages are wired
  (`bond-regime`, `etf-momentum`, `gamma-trading`, `intraday-tape`, `sector-research`,
  `swing-structure`), and `bond-regime-lab`'s spec was reconciled to the shell in
  `fed8f9ab`. The 2 unwired `#simpleView` pages (`msft-july-print-model`,
  `volatility-sizing-lab`) are blocked; `tests/volatility-sizing-lab.spec.mjs` and
  `tests/msft-july-market-refresh.spec.mjs` remain unmodified. **No BUG-003 closure is
  claimed** — `tests/bond-regime-lab.spec.mjs` was not executed in this verification
  session, so no evidence backs TP-15-05.
- **Step 6 — Partially complete.** `technical-analysis-decision-lab` is done as the
  intentional registry-gated honest-`unavailable` (`ab1d4879`). The three provider
  extractions were **attempted and cleanly reverted**:
  `volatility-sizing-lab` (TP-15-02 strict projection-parity failure —
  `volatility-sizing-lab: bridge state matches the explicit runtime path`, plus BS-008,
  BS-009 and TP-02-04 spec failures; root cause: the owner state is live-data
  dependent, so bridge and explicit runtime path do not converge deterministically),
  and `palm-springs-rental-market-lab` + `ocean-shores-rental-market-lab` (neither page
  loads a per-tool adapter module; the owner computation lives in the shared `RLRENTAL`
  engine, so wiring requires a named provider EXTRACTION from shared code — impossible
  without editing the shared engine or duplicating a formula, both forbidden by this
  scope's Formula-ownership rule; `tests/palm-springs-rental-market-lab.spec.mjs`
  (29 tests) is additionally the GitHub Pages deploy gate).
- **Step 7 — Outstanding.** The broad suite is 952 passed / 0 failed, but no bridge
  canary exists in `scripts/selftest.mjs` (`grep` for `renderSimpleBridge`,
  `ownerModes`, `installSimpleProjectionBridge`, `production bridge` returns nothing).

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

- [x] SCN-012-038: The production bridge replaces the stub and renders the real registered adapter into `[data-rlexperience-panel="simple"]` for wired ordinary tools, with no fabricated default and no forbidden authority.

  **Claim Source:** executed (2026-07-28). The stub `installSimpleProjectionBridge` was
  replaced by the real `renderSimpleBridge` in `f216be0d`; the unit contract proves the
  real-adapter render and the no-fabricated-default fallbacks; the integration loop
  proves the REAL panel is painted for each wired tool; the static scan proves zero
  forbidden authority. **Coverage note:** this closes the bridge mechanism for wired
  ordinary tools; 4 ordinary tools are still unwired (tracked by SCN-012-039's END
  state). *(Count corrected 2026-07-28 at HEAD `fed8f9ab`: an earlier revision of this
  note said 6, which predated `bond-regime-lab` and `company-fundamentals-lab` being
  wired.)*

  ```text
  $ node --test tests/simple-production-bridge.unit.mjs
  ✔ renderSimpleBridge is exposed on the production API (4.104797ms)
  ✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (25.70928ms)
  ✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.689196ms)
  ✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (10.036992ms)
  ✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.587498ms)
  ℹ tests 5
  ℹ pass 5
  ℹ fail 0
  ===TP1501_EXIT=0===

  $ node --test tests/simple-production-bridge.integration.mjs
  ✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (765.479122ms)
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.474755ms)
  ℹ tests 6
  ℹ pass 6
  ℹ fail 0
  ===TP1502_EXIT=0===

  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs (in the 5-spec batch)
    ✓  12 …imple renders the real adapter panel in the real owner-mode flow (1.8s)
    27 passed (33.0s)
  ===PW_ADAPTERS_EXIT=0===

  $ grep -nE 'fetch\(|providerFetch|localStorage|sessionStorage|publish' rlexperience.js
  1334:     local compute only: it never fetch/providerFetch, reads credentials, calls an
  1335:     author/publisher/store, or mutates owner state. */
  (2 matches, both inside the constraint comment — zero executable occurrences)
  ```

- [ ] SCN-012-039: Provider-gated ordinary `ownerModes` resolves to `["power"]` once a page registers its owner-state provider (else `["simple", "power"]`; END state = every ordinary tool wired); `applyVisual` is the sole owner of `rlv-focused`; Simple shows the panel (native hidden) and Power shows native content (panel hidden); the bridge never mutates `rlv-focused`.

  NOT SATISFIED — the item's own text names the END state as "every ordinary tool
  wired", and **4 of the 22 ordinary tools are unwired at HEAD `fed8f9ab`**:
  `msft-july-print-model`, `volatility-sizing-lab`, `palm-springs-rental-market-lab`,
  `ocean-shores-rental-market-lab`. The provider-gating mechanism itself and the
  never-mutates-`rlv-focused` half are both proven (SCN-012-038 evidence; TP-15-02
  6/6 this session), but the item cannot close until the END-state coverage clause is
  met, and each of the 4 needs an owner decision or a forbidden shared-engine
  extraction. *(Correction 2026-07-28: an earlier revision of this reason listed 6
  unwired tools including `bond-regime-lab` and `company-fundamentals-lab`; both are
  wired at HEAD — see the `[TP-15-02] wired (18)` line in
  [report.md](report.md#command-1--tp-15-02-integration).)*

- [x] SCN-012-040: Each wired page exposes its real current owner state through the uniform provider seam, and the adapter's owner facts match the page's Power path (owner parity, no formula copy).

  **Claim Source:** executed (2026-07-28, re-run at HEAD `fed8f9ab`). The wired set is
  derived from the production registry **and** the production pages (never a hard-coded
  list); every wired tool's Simple facts equal the owner/Power-path values; 17 of 18
  wired tools reach strict projection parity and the 18th is the deliberate
  module-absent honest-`unavailable` (`technical-analysis-decision-lab`, SCN-012-034
  lock, covered by SCN-012-042). "No formula copy" is corroborated by 14 `no inline
  copy` selftest canaries plus zero edits to any `rlexperience-adapters/*` module across
  all 16 scope-15 commits. *(Evidence refreshed 2026-07-28: the excerpt previously
  pasted here was a genuine but superseded earlier run showing 16 wired / 15-of-16
  parity / 16 provider pages; the identical commands were re-executed and now report
  18 / 17-of-18 / 18.)*

  ```text
  $ node --test tests/simple-production-bridge.integration.mjs
  [TP-15-02] wired (18): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
  [TP-15-02] not wired (5): market-brief, msft-july-print-model, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
  [TP-15-02] strict parity (module loaded by the page): 17 of 18
  [TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
  ✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.32967ms)
  ✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (831.178993ms)
  ✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (827.673198ms)
  ✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1244.529351ms)
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (71.715057ms)
  ✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (28.352383ms)
  ℹ tests 6
  ℹ pass 6
  ℹ fail 0
  ===TP1502_EXIT=0===

  $ grep -ln '__rlOwnerStateProvider' *.html | wc -l
  18

  $ grep -c 'no inline copy' scripts/selftest.mjs
  14

  $ git show --name-only --format='' <16 scope-15 commits> | grep -E 'rlexperience-adapters/'
  (empty = zero adapter-module formula edits)
  ```

- [ ] SCN-012-041: The 8 `#simpleView` tools' native Simple content is reachable under Power with nothing deleted; BUG-003 is closed.

  NOT SATISFIED — **6 of the 8 `#simpleView` tools are reconciled, 2 are not**, and
  BUG-003 closure is not claimable. *(Correction 2026-07-28: an earlier revision of
  this reason said "no `#simpleView` tool has been reconciled" and listed
  `bond-regime-lab` as unwired. Both statements are false at HEAD `fed8f9ab`.)*

  ```text
  $ for f in $(grep -l 'id="simpleView"' *.html | sort); do \
      grep -q '__rlOwnerStateProvider' "$f" && echo "  WIRED    $f" || echo "  UNWIRED  $f"; done
    WIRED    bond-regime-lab.html
    WIRED    etf-momentum-lab.html
    WIRED    gamma-trading-lab.html
    WIRED    intraday-tape-lab.html
    UNWIRED  msft-july-print-model.html
    WIRED    sector-research-lab.html
    WIRED    swing-structure-lab.html
    UNWIRED  volatility-sizing-lab.html

  $ for t in tests/bond-regime-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs tests/msft-july-market-refresh.spec.mjs; do \
      echo -n "  $t => "; git log --oneline f216be0d~1..HEAD -- "$t" | wc -l; done
    tests/bond-regime-lab.spec.mjs => 1
    tests/volatility-sizing-lab.spec.mjs => 0
    tests/msft-july-market-refresh.spec.mjs => 0
  ```

  The "nothing deleted / reachable under Power" half is genuinely proven for the 6
  wired pages: `fed8f9ab` reconciled `tests/bond-regime-lab.spec.mjs` by adding the
  `openNativeResearchSurface()` helper that drives the shell to Power before touching
  the native scenario controls, and that spec was **executed this session at 27/27,
  exit 0** (see [report.md](report.md#tp-15-05)). Two clauses still fail: (a) the 2
  unwired `#simpleView` pages (`msft-july-print-model`, `volatility-sizing-lab`) are
  not reconciled and their specs are untouched; (b) **BUG-003 is not closed** — the
  Test Plan's TP-15-05 persistent title
  (`Regression: bond-regime native content shows in Power not Simple and the adapter
  panel is the Simple surface`) does not exist anywhere in `tests/`
  (`grep -rn` exit 1), so no test carries the declared BUG-003-closure contract. That
  title drift is recorded as **D4** and routed to `bubbles.plan`.

- [x] SCN-012-042: Tools without a wired provider, and `technical-analysis-decision-lab` (no owner model), render an explicit honest `unavailable` with no invented signal; `market-brief` (brief-only) is unaffected.

  **Claim Source:** executed (2026-07-28). The provider-absent, unhydrated-evidence and
  missing-module paths all degrade to an honest `unavailable` with no invented signal
  and without mutating `rlv-focused`; `technical-analysis-decision-lab` is explicitly
  logged as the deliberate module-absent honest-`unavailable` under the SCN-012-034
  lock; `market-brief` is untouched by every scope-15 commit and still runs brief-only.

  ```text
  $ node --test tests/simple-production-bridge.unit.mjs
  ✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.689196ms)
  ✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (10.036992ms)
  ✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.587498ms)
  ℹ pass 5
  ℹ fail 0
  ===TP1501_EXIT=0===

  $ node --test tests/simple-production-bridge.integration.mjs
  [TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.474755ms)
  ✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (30.175572ms)
  ℹ pass 6
  ℹ fail 0
  ===TP1502_EXIT=0===

  $ npx --no-install playwright test <5-spec batch> --project=system-chrome --reporter=list
    ✓  19 …imple five-gate controls recompute or stay honestly unavailable (544ms)
    ✓  18 …controls recompute bounded action or no-action inside Brief only (3.1s)
    27 passed (33.0s)
  ===PW_ADAPTERS_EXIT=0===

  $ git show --name-only --format='' <16 scope-15 commits> | grep -E '^market-brief\.html'
  (empty = market-brief untouched)
  ```

- [ ] The change remains within the exact bridge/ownerModes/page-provider boundary; rollback restores the prior stub behavior without data loss.

  PARTIALLY VERIFIED, NOT CLOSED — two independent reasons, one of them a correction.

  **(a) Boundary — protected paths clean, but the allowlist is NOT clean.** Re-derived
  this session at HEAD `fed8f9ab`: the union of every path touched across all 16
  scope-15 commits is 30 paths, and **zero protected paths were touched**
  (`rldata.js`, `rlviews.js`, `market-brief.html`, `data/options/**`,
  `package.json`, `package-lock.json` — grep exit 1). However, **5 of those paths fall
  OUTSIDE this scope's declared Implementation Files allowlist**: `rlchart.js`,
  `tests/company-fundamentals-lab.spec.mjs`, `tests/simple-models.spec.mjs`,
  `tests/simple-model-adapters-market.spec.mjs`, and
  `tests/simple-model-adapters-macro-fundamental.spec.mjs`. *(Correction 2026-07-28: an
  earlier revision of this reason claimed "all 22 paths touched by the scope-15 commits
  are inside the Implementation Files allowlist". That claim was inaccurate; it is
  superseded by drift **D3** in
  [report.md](report.md#d3--implementation-files-allowlist-is-stale-newly-recorded),
  which is routed to `bubbles.plan`.)*

  ```text
  $ git log --format='%H' f216be0d~1..HEAD -- rlexperience.js rlapp.js \
      tests/simple-production-bridge.unit.mjs tests/simple-production-bridge.integration.mjs \
      tests/simple-production-wiring.spec.mjs '*-lab.html' \
    | while read c; do git show --name-only --format='' "$c"; done | grep -v '^$' | sort -u | wc -l
  30

  $ … | grep -E '^(rldata\.js|rlviews\.js|market-brief\.html|data/options/|package\.json|package-lock\.json)'
  (exit 1 — none touched)
  ```

  **(b) Rollback — never demonstrated.** No executed command has exercised the
  documented rollback path (restore the stub `installSimpleProjectionBridge`, revert
  the `rlapp.js` `ownerModes` change, revert each page's provider registration). The
  item therefore stays open on both halves.


#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [ ] TP-15-01 unit evidence proves the bridge contract, `ownerModes`, honest-unavailable fallback, and no forbidden authority.

  **Uncertainty Declaration.** `node --test tests/simple-production-bridge.unit.mjs`
  was re-executed this session at HEAD `fed8f9ab` and is green (5/5, exit 0 — evidence
  under SCN-012-038), proving the bridge contract and the honest-unavailable fallback.
  But the file contains **no** `ownerModes` assertion and **no** forbidden-authority
  assertion, so two of the four claims in this DoD row are not proven by the named
  test. Re-verified this session:

  ```text
  $ grep -n 'ownerModes\|forbidden\|providerFetch\|localStorage\|fetch(' tests/simple-production-bridge.unit.mjs
  (exit 1 — no matches)
  ```

  The bridge's zero-forbidden-authority property was confirmed by a manual static
  scan, but that is not the automated unit proof this row requires. Adding those two
  assertions is **in-allowlist, agent-actionable** work
  (`tests/simple-production-bridge.unit.mjs` is a declared Implementation File) that
  has simply not been done. Item stays open. See [report.md](report.md#tp-15-01).

- [x] TP-15-02 integration evidence proves the registry-derived provider→runtime→panel loop and owner-parity for wired tools.

  **Claim Source:** executed (2026-07-28, re-run at HEAD `fed8f9ab`). Exact match to the
  Test Plan row: the file, the command, and all six test titles exist and pass,
  including the registry-derived loop and the owner-parity assertion. *(Evidence
  refreshed 2026-07-28: the excerpt previously pasted here was a genuine but superseded
  earlier run reporting 16 wired / 15-of-16 parity; the identical command was
  re-executed and now reports 18 / 17-of-18.)*

  ```text
  $ node --test tests/simple-production-bridge.integration.mjs
  [TP-15-02] wired (18): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, technical-analysis-decision-lab
  [TP-15-02] not wired (5): market-brief, msft-july-print-model, volatility-sizing-lab, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
  [TP-15-02] strict parity (module loaded by the page): 17 of 18
  [TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
  ✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.32967ms)
  ✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (831.178993ms)
  ✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (827.673198ms)
  ✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1244.529351ms)
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (71.715057ms)
  ✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (28.352383ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 3175.402678
  ===TP1502_EXIT=0===
  ```

- [ ] TP-15-03 E2E evidence proves market-heatmap Simple renders the real adapter panel and a control recomputes.

  **Uncertainty Declaration.** Both behaviours are proven by real passing tests, but
  neither carries the persistent title this Test Plan row declares, and they live in two
  different files: `tests/simple-production-wiring.spec.mjs:47` is
  `Regression: market-heatmap Simple renders the real adapter panel in the real
  owner-mode flow` (not "…and one control recomputes owner leadership"), while the
  recompute half is `tests/simple-model-adapters-market.spec.mjs:310`
  (`Regression: market heatmap Simple breadth controls recompute owner leadership
  sensitivity`, a Scope-05 adapter e2e). Closing this row against a persistent title
  that does not exist would be fabrication. This is a Test-Plan ↔ implementation drift
  owned by `bubbles.plan`. Item stays open. See [report.md](report.md#tp-15-03).

  Re-verified this session at HEAD `fed8f9ab` (the 5-spec batch containing both halves
  ran 27/27, exit 0 — [report.md](report.md#command-4--simple-adapter--production-wiring-playwright-batch-5-specs-system-chrome)):

  ```text
  $ grep -rn 'renders the real adapter panel and one control recomputes owner leadership' tests/
  (exit 1 — declared title NOT FOUND)
  ```

- [ ] TP-15-04 E2E evidence proves each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact.

  NOT IMPLEMENTED — the declared persistent title
  (`Regression: each wired ordinary tool shows a ready adapter panel in Simple with an
  owner-parity fact`) does not exist in `tests/simple-production-wiring.spec.mjs`, which
  contains exactly one test (see TP-15-03). The per-wired-tool loop is currently proven
  at the **integration** layer by TP-15-02, not by an `e2e-ui` test. Item stays open.

  Re-verified this session at HEAD `fed8f9ab`:

  ```text
  $ grep -rn 'each wired ordinary tool shows a ready adapter panel' tests/
  (exit 1 — declared title NOT FOUND anywhere in tests/)

  $ grep -n "test('" tests/simple-production-wiring.spec.mjs
  47:test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
  (exactly one test in the declared file)
  ```

- [ ] TP-15-05 E2E evidence proves bond-regime native content shows in Power not Simple (BUG-003 closure).

  **Uncertainty Declaration — declared title does not exist (drift D4).** *(Correction
  2026-07-28: an earlier revision of this reason said "NOT STARTED — `bond-regime-lab`
  is unwired, its spec still asserts native `#simpleView [data-model-digest]` on the
  default Simple view". Both statements are false at HEAD `fed8f9ab`.)*

  `bond-regime-lab` **is wired**, `fed8f9ab` reconciled `tests/bond-regime-lab.spec.mjs`
  to the shell, and the spec was **executed this session at 27/27, exit 0** — the first
  executed evidence this row has ever carried:

  ```text
  $ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list
  Running 27 tests using 1 worker
    ✓   8 …js:202:1 › BS-006 six month mixed shock decomposes every sleeve (737ms)
    ✓   9 …S-007 oversized shock preserves estimate and lowers reliability (562ms)
    ✓  11 …reject nonfinite input and persist only allowlisted assumptions (523ms)
    ✓  17 …ady waits for auto-hydration before Simple and Power comparison (514ms)
    ✓  18 …spec.mjs:449:1 › BS-011 Simple and Power share one model digest (475ms)
    27 passed (24.1s)
  ===BONDREGIME_EXIT=0===
  ```

  The row nonetheless stays open, for the same anti-fabrication reason as TP-15-03 and
  TP-15-04: **the persistent title this Test Plan row declares does not exist**, so
  there is no test carrying the declared BUG-003-closure contract.

  ```text
  $ grep -rn 'bond-regime native content shows in Power not Simple' tests/
  (exit 1 — NOT FOUND)
  ```

  What `fed8f9ab` actually did was **modify** the pre-existing
  `Regression BUG-003: Ready waits for auto-hydration before Simple and Power
  comparison` test (introduced by `943972e2` on 2026-07-16, well before this scope) and
  add an `openNativeResearchSurface()` helper to three native-control tests. It did
  **not** add a test under TP-15-05's declared title. The native-content-under-Power
  behaviour is therefore genuinely proven, but not under the declared contract.

  **Second, independent disqualifier found this session:** that nearest-existing
  `Regression BUG-003:` test **uses request interception**, so it cannot satisfy an
  `e2e-ui` (live-system) Test Plan row under this repo's live-stack authenticity rule —
  a mocked Playwright test may not close a live-category DoD item:

  ```text
  $ grep -rn 'page\.route\|context\.route\|intercept(\|cy\.intercept\|msw\|nock\|wiremock' tests/bond-regime-lab.spec.mjs
  tests/bond-regime-lab.spec.mjs:267:    await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
  tests/bond-regime-lab.spec.mjs:334:  await page.route('**/*', async (route) => {
  tests/bond-regime-lab.spec.mjs:375:  await page.route(/home\.treasury\.gov\/.*daily_treasury_(?:real_)?yield_curve/, async (route) => {
  ```

  Line 375 sits inside the `Regression BUG-003:` test (which spans lines 362-448) and
  calls `route.fulfill(...)` with fixture CSV. By contrast
  `tests/simple-production-wiring.spec.mjs` is genuinely interception-free — its only
  two matches are the comment block at lines 16-17 that *states* the zero-interception
  constraint. Recorded as drift **D4**, routed to `bubbles.plan`. **BUG-003 is not
  claimed closed.**

- [ ] TP-15-06 E2E evidence proves volatility-sizing native Simple moved to Power and Simple shows the panel or an honest unavailable pending the RLVOL provider.

  NOT SATISFIED — wiring was attempted in this session and **deliberately reverted**.
  The page does not load its declared `adapterModule`
  (`rlexperience-adapters/market-structure.js`; it loads only `rlvol.js`), the reverted
  attempt broke `tests/volatility-sizing-lab.spec.mjs` (owned by Feature 011, certified
  `done`) and produced an unresolved TP-15-02 parity divergence. At HEAD the spec is
  back to 16/16 green with the tool unwired. Item stays open. See
  [report.md](report.md#tp-15-06).

- [ ] TP-15-07 broad selftest evidence proves existing Research Lab behavior remains green (0 failures) with the new bridge canaries.

  **Uncertainty Declaration.** `node scripts/selftest.mjs` was re-executed this session
  at HEAD `fed8f9ab`: **952 passed, 0 failed, exit 0** — the 0-failure preservation half
  is met. But the "new bridge canaries" half is not; re-verified this session:

  ```text
  $ node scripts/selftest.mjs
  ================================================
  Research-Lab self-test: 952 passed, 0 failed
  ================================================
  ===SELFTEST_EXIT=0===

  $ grep -n 'renderSimpleBridge\|installSimpleProjectionBridge\|ownerModes\|production bridge' scripts/selftest.mjs
  (exit 1 — no matches; no bridge canary exists)
  ```

  Adding those canaries is Implementation Plan step 7 and is **in-allowlist,
  agent-actionable** work (`scripts/selftest.mjs` is a declared Implementation File)
  that has simply not been done. Item stays open. See [report.md](report.md#tp-15-07).


#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan (no `page.route`/`context.route`/`intercept`/`msw`/`nock`), bridge/provider forbidden-authority scan, owner pre/post parity, the registry-derived loop, changed-path boundary, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and the broad selftest are current and clean.

  PARTIALLY VERIFIED, NOT CLOSED. **Verified this session at HEAD `fed8f9ab`:** the
  registry-derived loop (TP-15-02, 6/6, exit 0); owner pre/post parity (TP-15-02,
  17-of-18 strict + 1 deliberate honest-`unavailable`); exact system-Chrome identity
  (`--project=system-chrome` on both Playwright runs, 27/27 + 27/27, exit 0); the
  no-interception scan on this scope's own specs; the changed-path boundary (30 paths,
  zero protected paths touched); a manual bridge forbidden-authority static scan;
  `git diff --check` clean (exit 0); and the broad selftest (952 passed / 0 failed,
  exit 0).

  ```text
  $ grep -rn 'page\.route\|context\.route\|intercept(\|cy\.intercept\|msw\|nock\|wiremock' \
      tests/simple-production-wiring.spec.mjs tests/simple-production-bridge.integration.mjs \
      tests/simple-production-bridge.unit.mjs
  tests/simple-production-wiring.spec.mjs:16: * production bridge's rendered panel. There is NO page.route / context.route /
  tests/simple-production-wiring.spec.mjs:17: * intercept / msw / nock — the owner data is the page's real cached owner state,
  (2 matches, both inside the comment block that STATES the constraint — zero executable interception)

  $ git diff --check
  (exit 0 — clean)
  ```

  **NOT verified / not satisfied — four distinct reasons, any one of which blocks this
  gate:**

  1. Per-tool RED/GREEN is absent for the **4** remaining unwired ordinary tools
     (`msft-july-print-model`, `volatility-sizing-lab`,
     `palm-springs-rental-market-lab`, `ocean-shores-rental-market-lab`). *(Correction
     2026-07-28: an earlier revision of this reason said 6 remaining tools and "3 of
     them await a spec amendment"; both counts predated `bond-regime-lab` and
     `company-fundamentals-lab` being wired.)*
  2. The automated bridge/provider forbidden-authority canary **does not exist**
     (Implementation Plan step 7); only a manual static scan was performed.
  3. The **changed-path boundary is not clean against the allowlist** — 5 delivered
     paths fall outside the declared Implementation Files (drift **D3**); see the
     change-boundary DoD item above.
  4. `tests/bond-regime-lab.spec.mjs`, which this scope modified, contains executable
     `page.route` interception at lines 267/334/375 (pre-existing Feature-003 fixture
     pinning). That is not a scope-15 regression, but it means the no-interception
     scan is **not** clean across every spec this scope touched, so the gate's own
     wording is not met.

  This gate cannot close while 4 ordinary tools remain unwired, the step-7 canary is
  missing, and drifts D1-D4 are open with `bubbles.plan`.

