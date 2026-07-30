# Scope 15: Production Simple-View Adapter Wiring (Model B)

## 15-production-simple-adapter-wiring

**Status:** In Progress

**Current — 2026-07-30, HEAD `acf042bb`. 11 of 14 DoD items checked, 3 open, and
`SCN-012-039` is the single root blocker.** The other two open rows are not independent
failures: the Build Quality Gate inherits SCN-012-039's coverage clause verbatim, and the
change-boundary row is open only on an unrehearsed rollback. SCN-012-039's own clause
("every ordinary tool wired") is **unsatisfiable as written** — 4 of the 22 ordinary tools
are deliberately excluded by recorded product/architecture decision, and for the two
rental tools a deploy gate actively asserts that exclusion. An amendment is **proposed**
on that row and awaits an **owner decision**; `bubbles.plan` has not self-approved it.

**Delivered state — 2026-07-29, HEAD `a7631b36`, DoD reconciled this session.** The
production bridge is delivered and proven, and **19 of the 22 ordinary tools are
wired, 18 in strict projection parity**; the 19th
(`technical-analysis-decision-lab`) is the intended registry-gated honest
`unavailable` under the SCN-012-034 lock, not a gap. **All 7 Test Plan rows are now
closed with executed, attributable evidence**, the last two by this session:
TP-15-01 unit **9/9** (commit `a7631b36` added the missing `ownerModes` and
forbidden-authority assertions, so the declared file finally carries all four halves)
and TP-15-05 **28/28** (commit `28099a4d` added a genuine interception-free live-stack
carrier). Also green at exit 0: TP-15-02 integration 6/6, `scripts/selftest.mjs`
**968 passed / 0 failed** with the 16-canary bridge group, TP-15-03 + TP-15-04
`tests/simple-production-wiring.spec.mjs` 4/4, TP-15-06
`tests/volatility-sizing-lab.spec.mjs` 16/16, and the Pages deploy gate 53/53. Full raw
output in [report.md](report.md#dod-reconciliation-run--2026-07-29-head-a7631b36).

**`volatility-sizing-lab` is now WIRED — the earlier block was a real defect, and
it was fixed rather than assumed away.** A previous revision of this document
recorded the tool as blocked after an attempted wiring was cleanly reverted on a
TP-15-02 strict projection-parity divergence. That divergence was subsequently
root-caused: **the provider took a SECOND wall-clock sample**, so the bridge and
the explicit runtime path were computing against two different instants and could
never converge deterministically. The fix reads `asOf` and `decisionTime` back off
the page's own displayed decision (`runtime.decision.asOf` /
`runtime.decision.computedAt`) instead of sampling time again, making the provider
single-sourced and deterministic. That is a genuine defect fix — **no assertion was
relaxed, no tolerance was widened, and no parity check was removed**; the tool now
passes the same strict parity assertion that previously failed it. Delivered in
commit `30326253`.

**Three ordinary tools are not wired, plus `market-brief` which is out of scope by
design.** `market-brief` — by design: its registry `experience.kind` is
`market-action-center`, so it is not one of the 22 and its `ownerModes` stays
`["brief"]`. `msft-july-print-model` — not applicable: a deliberate
`window.__rlviewsInit = 1` shell opt-out means the bridge never runs and a provider
would be dead code. `palm-springs-rental-market-lab` and
`ocean-shores-rental-market-lab` — **a deliberate product decision, not merely an
engineering blocker** (see below).

**The two rental tools: why not wiring them is the correct outcome.** Two reasons
stand, and the *decisive* one is data, not engineering.

1. **DECISIVE — the owner deliberately withheld the economic layer.** The owner
   published `"purchasePriceUsd": null` with
   `"state": "unavailable"` for these places because the underlying research found
   insufficient data — the payload records the reason verbatim ("Aggregate all-home
   median only; no price range or member set." / "Cannot yield an eligible STR
   purchase baseline."). `tests/palm-springs-rental-market-lab.spec.mjs` — which is
   also the GitHub Pages deploy gate — **asserts that absence directly**
   (`expect(receiptField(luxuryLine, 'purchasePriceUsd')).toBe('UNAVAILABLE')` and
   `expect(receiptField(luxuryLine, 'baseline')).toBe('unavailable')`). Wiring an
   owner-state provider that produced a `ready` acquisition projection would
   therefore require **fabricating the exact economic layer the owner intentionally
   withheld**, and would break the deploy gate that protects that intent. Declining
   to wire these two is honoring a published product decision.
2. **Secondary — no per-tool adapter module on the page.** Neither page loads a
   `rlexperience-adapters/*` module (`grep -c` → 0 for both); the owner computation
   lives in the shared `RLRENTAL` engine, so a provider extraction would require
   editing shared code or duplicating a formula, both forbidden by this scope's
   Formula-ownership rule. This reason alone would make the work expensive; reason 1
   makes it wrong.

**Why `In Progress` rather than `Done` or `Blocked`.** **11 of the 14 DoD items are now
checked** and 3 remain open, so `Done` would be fabrication. The 3 open items are **not
test gaps** — every Test Plan row is green and attributable. They are:
(1) **SCN-012-039**'s parenthetical END-state clause "every ordinary tool wired" (19 of
22) — the single **root** blocker, and unsatisfiable as written because 4 tools are
deliberately excluded by product/architecture decision (an amendment is proposed on that
row, for owner decision); (2) the **Build Quality Gate**, which is purely derivative — it
inherits (1)'s coverage clause verbatim, its D3 blocker is closed and its scans were
re-run current at HEAD `acf042bb`; and (3) the **change-boundary/rollback** row, whose
allowlist half is now closed by D3 and which stays open solely because the documented
rollback path has never been rehearsed. `Blocked` would overstate it: (1) and (2) need an
owner decision, but the rollback rehearsal in (3) is ordinary agent-actionable work that
simply has not been done. `In Progress` is the only label that misrepresents neither half.

**Closed 2026-07-30 (HEAD `acf042bb`, `bubbles.plan`, artifact-only):** **SCN-012-041**
(both clauses met — 7 of the 8 `#simpleView` tools by per-page executed proof in the
`acf042bb` sweep, the 8th, `msft-july-print-model`, structurally outside the shell and
untouched by this scope) and drift **D3** (the Implementation Files allowlist reconciled
against a commit-set-derived delivered path set). New minor drift **D7** was raised, not
absorbed: `rlchart.js`, a shared surface, was edited outside the Shared Infrastructure
Impact Sweep.

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

The full verified per-tool owner-state-source mapping for all 23 tools (19
delegating, 3 open, 1 brief-only) is in
[`../../design-addendum-production-simple-wiring.md`](../../design-addendum-production-simple-wiring.md)
§5.3. Summary:

| Class | Count | Tools | Owner-state seam |
|---|---|---|---|
| Delegating (straightforward provider) | 19 | market-heatmap, options-flow-feed, intraday-tape, swing-structure, options-structure, gamma-trading, sector-research, global-rotation, real-assets, bond-regime, ai-capex-strategy, msft-july-print-model, company-fundamentals, etf-momentum, strategy-self-improvement, strategy-validation, smart-money-flow, waterfront-polo, volatility-sizing | page already delegates to its adapter module (`RL<MODULE>.*`); provider returns that same owner input |
| Open extraction | 2 | palm-springs + ocean-shores (`RLRENTAL`) | owner seam documented but page does not yet load the adapter module; extraction is **declined by product decision** — the owner published `purchasePriceUsd: null` and the Pages gate asserts that absence |
| Intentional unavailable | 1 | technical-analysis-decision-lab | adapter declared "unavailable until owner model exists"; honest unavailable panel, native content under power |
| Brief-only (out of scope) | 1 | market-brief | `market-action-triage` runs inside Brief; `ownerModes` unchanged |

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
|---|---|---|---|---|
| SCN-012-038/040 wired tool | Registered adapter + page provider | Open Simple, change one steerable control | Panel shows a ready adapter projection; the changed control moves the declared output; owner facts match Power | e2e-ui |
| SCN-012-039/041 #simpleView tool | bond-regime-lab wired | Toggle simple↔power | Simple: panel visible, `#simpleView` hidden; Power: `#powerView` native content visible, panel hidden | e2e-ui |
| SCN-012-042 unwired/no-owner tool | technical-analysis-decision-lab (or an un-provided tool) | Open Simple | Explicit "unavailable" projection; no invented signal; native content reachable under Power | e2e-ui |

## Implementation Files

**Reconciled 2026-07-30 at HEAD `acf042bb` — drift D3 CLOSED.** This list was stale: it
was authored ahead of delivery and never re-derived. It is now reconciled against a
**mechanically derived** delivered path set — `git show --name-only` over the 31
subject-attributed Scope 15 commits (`git log --all --grep='scope.15'`) plus the 2
BUG-004 commits that touched this scope's files. That derivation also surfaced two
Scope 15 commits missing from `report.md`'s own increments table: `cc0e81ef` (the commit
that actually delivered the TP-15-07 canaries) and `3f04904b`. Full record, including why
the earlier pathspec-filtered derivation could not have found this drift, is in
[report.md](report.md#d3--closed-2026-07-30--implementation-files-allowlist-was-stale).

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

### Modified — added by the 2026-07-30 D3 reconciliation

Delivered by Scope 15 commits, genuinely in-boundary, but not anticipated by the list above:

- `tests/simple-model-adapters-market.spec.mjs`, `tests/simple-model-adapters-macro-fundamental.spec.mjs`, `tests/simple-models.spec.mjs`, `tests/company-fundamentals-lab.spec.mjs` — per-tool adapter/wiring specs reconciled to the shell in the same commit as the tool they cover. This is the identical class of edit as `tests/bond-regime-lab.spec.mjs` and `tests/volatility-sizing-lab.spec.mjs`, which the list *did* name; delivery needed 7 such spec files and the list anticipated 3. All additive reconciliations, no rewrites (e.g. `tests/company-fundamentals-lab.spec.mjs` +48/-0 in `44afd71b`).
- `rlchart.js` — +5/-0 in `ab1d4879`, restoring the `canvas.__rlhit` legacy alias documented in `specs/003-bond-regime-and-scenario-lab/design.md` L1006 and dropped by an unrelated earlier refactor (`c81d808d`). Demoting bond-regime's native content to Power is what made those Power canvases load-bearing and surfaced the latent break, so the repair was required to keep this scope's own DoD green. **It is nevertheless a shared surface that this scope's Shared Infrastructure Impact Sweep did not enumerate** — recorded as new drift **D7**, not silently absorbed.

### Explicitly NOT added — delivered under a different artifact's boundary

- `tests/market-heatmap-control-surface.spec.mjs` — created by `087ad2ad` / `5c77e1f1`, whose subjects are `fix(012/BUG-004)` and which carry a complete BUG-004 artifact set. It is **BUG-004's carrier test**. Listing it here would misattribute another artifact's delivery to this scope and retroactively widen this boundary to cover work it does not own. Those two commits also touched `rlexperience.js`, `market-heatmap-lab.html` and `tests/simple-production-bridge.unit.mjs`, all already inside this allowlist, so they introduce no further drift.

### Declared but NOT delivered — retained deliberately

These four entries were planned and then declined for the documented product/architecture
reasons; no Scope 15 commit touches any of them. They are kept so the list records the
plan and its outcome, and are labelled here so they cannot be read as delivered:

- `msft-july-print-model.html` and `tests/msft-july-market-refresh.spec.mjs` — deliberate shared-shell opt-out (`meta rlviews=off` → `window.__rlviewsInit = 1`); the shell never runs, so a provider would be dead code.
- `palm-springs-rental-market-lab.html`, `ocean-shores-rental-market-lab.html` — declined by product decision (the owner published `purchasePriceUsd: null` and the Pages gate asserts that absence).

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

### Implementation Plan Progress (as of 2026-07-28, HEAD `30326253`)

Annotation only — no step is added, removed, or reworded, and no DoD item is
created here. Full evidence is in
[report.md](report.md#final-verification-run--2026-07-28-head-30326253).

- **Step 1 — Complete.** `tests/simple-production-bridge.unit.mjs` and
  `tests/simple-production-wiring.spec.mjs` landed with the bridge (`f216be0d`).
- **Step 2 — Complete.** Real bridge in `rlexperience.js` + provider-gated ordinary
  `ownerModes` in `rlapp.js` (`f216be0d`); `market-brief` confirmed unchanged.
- **Step 3 — Complete.** `market-heatmap-lab` wired and proven end-to-end
  (`f216be0d`, greened in `ab1d4879`).
- **Step 4 — Partially complete.** 18 of the 19 delegating tools are wired across
  `f216be0d`…`30326253` (including `bond-regime-lab`, `company-fundamentals-lab` and
  `volatility-sizing-lab`, all wired with their specs reconciled to the shell).
  Outstanding:
  `msft-july-print-model` — a deliberate shared-shell opt-out
  (`<meta name="rlviews" content="off">` → `window.__rlviewsInit = 1`), so the bridge
  never runs and a provider would be dead code. Wiring it means removing an
  intentional opt-out; that is an owner decision, not a scope-15 change.
- **Step 5 — Partially complete.** 7 of the 8 `#simpleView` pages are wired
  (`bond-regime`, `etf-momentum`, `gamma-trading`, `intraday-tape`, `sector-research`,
  `swing-structure`, `volatility-sizing`), and both `bond-regime-lab`'s spec
  (`fed8f9ab`) and `volatility-sizing-lab`'s spec (`30326253`) were reconciled to the
  shell. The 1 unwired `#simpleView` page (`msft-july-print-model`) is blocked on the
  owner opt-out decision; `tests/msft-july-market-refresh.spec.mjs` remains
  unmodified. **No BUG-003 closure is claimed** — TP-15-05's declared persistent title
  still does not exist in `tests/` (drift D4), so no test carries the declared closure
  contract.
- **Step 6 — Partially complete.** `technical-analysis-decision-lab` is done as the
  intentional registry-gated honest-`unavailable` (`ab1d4879`).
  **`volatility-sizing-lab` is now DONE** — the earlier revert was caused by the
  provider taking a second wall-clock sample; reading `asOf`/`decisionTime` back off
  the page's own displayed decision made the provider single-sourced and deterministic,
  and the tool now passes the same strict parity assertion that previously failed it
  (`30326253`). The two remaining extractions —
  `palm-springs-rental-market-lab` and `ocean-shores-rental-market-lab` — are
  **declined by product decision, not merely blocked**: the owner published
  `purchasePriceUsd: null` / `state: "unavailable"` because the research found
  insufficient data, and `tests/palm-springs-rental-market-lab.spec.mjs` (29 tests,
  also the GitHub Pages deploy gate) asserts that absence, so a `ready` acquisition
  projection would fabricate the economic layer the owner intentionally withheld.
  Secondarily, neither page loads a per-tool adapter module (`grep -c` → 0) and the
  owner computation lives in the shared `RLRENTAL` engine, so extraction would also
  require editing shared code or duplicating a formula, both forbidden by this scope's
  Formula-ownership rule.
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
| `rlchart.js` (**added retroactively 2026-07-30 — drift D7**) | Per-canvas hit-test contract (`canvas.__rlhit`) consumed by every tool's Power canvases | *Not applied at the time.* The sweep did not enumerate this surface, so `ab1d4879`'s +5/-0 alias restoration landed without the declared blast-radius/canary discipline. Recorded as **D7** so the gap is documented rather than back-dated; the change was in fact covered by the bond-regime Power-canvas suite (27/27) |

**Sweep-authoring lesson (D7).** This table was authored from the surfaces the plan
intended to *protect*, not from the surfaces the work would *touch*. Those are different
sets, and the difference is exactly where an unreviewed shared-surface edit fits.

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
| TP-15-03 | Regression E2E | e2e-ui | SCN-012-038 | `tests/simple-production-wiring.spec.mjs` | 2 carriers, each a verbatim test title — (a) `Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow` (panel-render half); (b) `TP-15-03 market-heatmap Simple renders real steerable controls and actuating one recomputes the production projection with no refetch` (control-recompute half) | `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "market-heatmap Simple renders" --reporter=list` — selects **2** | Yes | `report.md#tp-15-03` |
| TP-15-04 | Regression E2E | e2e-ui | SCN-012-038, SCN-012-040 | `tests/simple-production-wiring.spec.mjs` | 2 carriers, each a verbatim test title — (a) `TP-15-04 every wired ordinary tool paints its real Simple adapter panel with an owner-parity fact` (the wired-tool sweep); (b) `TP-15-04 the swept set is derived from the production registry + pages, and the honest-degradation cases are registry/provider derived` (anti-hardcoding guard on the swept set) | `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --grep "TP-15-04" --reporter=list` — selects **2** | Yes | `report.md#tp-15-04` |
| TP-15-05 | Regression E2E | e2e-ui | SCN-012-039, SCN-012-041 | `tests/bond-regime-lab.spec.mjs` | 2 carriers, each a verbatim test title — (a) `Regression BUG-003: Ready waits for auto-hydration before Simple and Power comparison` (the "NOT Simple" half + BUG-003 closure; **uses `page.route` interception — see D4**); (b) `BS-012 lever change recomputes without fetch or observed mutation` (a verified, interception-free caller of `openNativeResearchSurface`, which asserts the "native content shows in POWER" half) | `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` — whole-file run, selects **27** (the two carriers share no id prefix, so no single pipe-free `--grep` selects exactly both) | Yes | `report.md#tp-15-05` |
| TP-15-06 | Regression E2E | e2e-ui | SCN-012-041, SCN-012-042 | `tests/volatility-sizing-lab.spec.mjs` | 2 carriers, each a verbatim test title, both interception-free — (a) `TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration, not just by direct URL` (native Simple moved to Power **and** Simple shows the panel); (b) `Regression BS-009: insufficient history is unavailable with exact counts` (the honest-unavailable arm) | `npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` — whole-file run, selects **16** (the two carriers share no id prefix, so no single pipe-free `--grep` selects exactly both) | Yes | `report.md#tp-15-06` |
| TP-15-07 | Broad regression | unit | SCN-012-038, SCN-012-039, SCN-012-040, SCN-012-041, SCN-012-042 | `scripts/selftest.mjs` | Preserve all existing invariants and add production-bridge canaries (no forbidden authority, provider-absent honest unavailable, `ownerModes` contract); suite stays 0-fail | `node scripts/selftest.mjs` | No | `report.md#tp-15-07` |

**Row-command selection contract (added 2026-07-29 — closes drift D1's title half).** Every
`Command` cell above is required to select **≥1 test**; a cell whose `--grep` selects nothing is a
defect, not a pass. Each cell records its measured selection count, verified with `--list`:
TP-15-01 → 7, TP-15-02 → 6, TP-15-03 → 2, TP-15-04 → 2, TP-15-05 → 27, TP-15-06 → 16,
TP-15-07 → 968. Two conventions make this durable: **(1)** every declared persistent title is the
verbatim title of a real test, so a title-grep can never resolve to zero; **(2)** where a row's
proof is split across carriers that share no id prefix, the command is the whole-file run rather
than an alternation, because a `|` inside a markdown table cell would corrupt the table. Re-verify
any row with `--list` — a zero-selection grep prints `Total: 0 tests` and exits 1 on Playwright
1.61.1 (it becomes a silent exit-0 only under `--pass-with-no-tests`, which this repo never sets).

### Definition of Done - Tiered Validation

#### Core Delivery Items

- [x] SCN-012-038: The production bridge replaces the stub and renders the real registered adapter into `[data-rlexperience-panel="simple"]` for wired ordinary tools, with no fabricated default and no forbidden authority.

  **Claim Source:** executed (2026-07-28). The stub `installSimpleProjectionBridge` was
  replaced by the real `renderSimpleBridge` in `f216be0d`; the unit contract proves the
  real-adapter render and the no-fabricated-default fallbacks; the integration loop
  proves the REAL panel is painted for each wired tool; the static scan proves zero
  forbidden authority. **Coverage note:** this closes the bridge mechanism for wired
  ordinary tools; 3 ordinary tools are still unwired (tracked by SCN-012-039's END
  state). *(Count corrected 2026-07-28 at HEAD `30326253`: earlier revisions of this
  note said 6 and then 4; those predated `bond-regime-lab`, `company-fundamentals-lab`
  and `volatility-sizing-lab` being wired.)*

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

  NOT SATISFIED — **on the coverage clause alone; every mechanism clause is now proven.**
  Proven at HEAD `a7631b36`: provider-gated `ownerModes` (unit test 8, `ownerModes
  resolution: provider wiring hands Simple to the adapter panel and never regresses an
  unwired tool`, plus the TP-15-07 canary that executes `rlapp.js`'s **own** `ownerModes`
  expression); `applyVisual` as sole owner of `rlv-focused` (the canary scan finds exactly
  one executable `rlv-focused` write across 54 files, and it lives in `rlviews.js`);
  Simple-panel-vs-Power-native (the TP-15-05 live carrier asserts both directions); and
  never-mutates-`rlv-focused` (asserted on every unit fallback path, 0 recorded
  mutations). What fails is the item's own parenthetical naming the END state as "every
  ordinary tool wired", and **3 of the 22 ordinary tools are unwired at HEAD `a7631b36`**:
  `msft-july-print-model`, `palm-springs-rental-market-lab`,
  `ocean-shores-rental-market-lab`. The provider-gating mechanism itself and the
  never-mutates-`rlv-focused` half are both proven (SCN-012-038 evidence; TP-15-02
  6/6 this session), but the item cannot close until the END-state coverage clause is
  met. `msft-july-print-model` needs an owner decision to remove its deliberate shell
  opt-out; the two rental tools are **declined by product decision** (the owner
  published `purchasePriceUsd: null` and the Pages gate asserts that absence), so this
  clause may in fact never be closable as literally worded — that wording question is
  routed to `bubbles.plan`. *(Correction 2026-07-28: earlier revisions of this reason
  listed 6 and then 4 unwired tools including `bond-regime-lab`,
  `company-fundamentals-lab` and `volatility-sizing-lab`; all three are wired at HEAD —
  see the `[TP-15-02] wired (19)` line in
  [report.md](report.md#command-1--tp-15-02-integration).)*

  **RECOMMENDED AMENDMENT — PROPOSED 2026-07-30 by `bubbles.plan`, NOT self-approved.
  Requires owner decision. This row stays `- [ ]` until the owner rules.**

  *Diagnosis.* The row conflates two different things: a **mechanism** contract (how
  `ownerModes` resolves, who owns `rlv-focused`, what Simple and Power each show) and a
  **coverage** contract (how many tools the mechanism has been applied to). The mechanism
  half is fully proven. The coverage half — "END state = every ordinary tool wired" — is
  not merely unmet, it is **unsatisfiable**, because 4 of the 22 ordinary tools are
  deliberately excluded by decisions already recorded and, in two cases, actively
  defended by a deploy gate:

  | Tool | Why it is excluded | Could wiring it ever be correct? |
  |---|---|---|
  | `msft-july-print-model` | deliberate shell opt-out (`meta rlviews=off`) | only by reversing an architecture decision — an owner call |
  | `palm-springs-rental-market-lab` | owner published `purchasePriceUsd: null`; the Pages gate **asserts that absence** | **No** — a `ready` projection would fabricate the withheld economic layer |
  | `ocean-shores-rental-market-lab` | same | **No** — same |
  | `technical-analysis-decision-lab` | *is* wired, as the intended registry-gated honest `unavailable` (SCN-012-034 lock) | already correct; counted as wired |

  So the row as written can only ever be closed by doing something the product has
  decided must not be done. A DoD item that can only be satisfied by violating a product
  decision is a defective item, not an outstanding task.

  *Proposed replacement clause.* Keep every mechanism clause verbatim; replace only the
  parenthetical END-state clause with a coverage contract that is **derived and
  falsifiable** rather than absolute:

  > END state = every ordinary tool is either **wired** (its page registers
  > `__rlOwnerStateProvider[toolId]`, so its resolved `ownerModes` is `["power"]`) or
  > **explicitly exempted** by a recorded product/architecture decision naming the tool
  > and its reason. The exemption set is enumerated in the scope, and the TP-15-02
  > registry-derived derivation asserts that `wired ∪ exempt` covers the full ordinary
  > set with no third category — so a tool silently dropping out of wiring fails the
  > contract instead of quietly enlarging the exemption list.

  *Why this is not a weakening.* The current clause is unfalsifiable-in-practice: it can
  never go green, so it stops discriminating between "work remaining" and "work
  correctly declined". The replacement is strictly **more** testable — it adds a machine
  check (`wired ∪ exempt == ordinary`, no third bucket) that does not exist today, and it
  makes each exemption a named, reviewable decision rather than a footnote. At HEAD
  `acf042bb` it would evaluate as: 19 wired, 3 exempt, 22 ordinary, 0 unaccounted.

  *Knock-on if approved.* The Build Quality Gate's blocker 1 ("per-tool RED/GREEN is
  absent for the 3 unwired ordinary tools") inherits this clause verbatim and would need
  the same treatment — RED/GREEN required for every **wired** tool, and an exemption
  record for each exempt one. Both rows should be amended together or neither.

  *What the owner is being asked to decide.* (i) Accept, reject, or reword the
  replacement clause; (ii) confirm the 3-tool exemption set is the intended product
  position; (iii) confirm whether `msft-july-print-model`'s shell opt-out is permanent or
  is a deferred adoption. `bubbles.plan` does not have the authority to answer any of
  these, and has not.

- [x] SCN-012-040: Each wired page exposes its real current owner state through the uniform provider seam, and the adapter's owner facts match the page's Power path (owner parity, no formula copy).

  **Claim Source:** executed (2026-07-28, re-run at HEAD `30326253`). The wired set is
  derived from the production registry **and** the production pages (never a hard-coded
  list); every wired tool's Simple facts equal the owner/Power-path values; 18 of 19
  wired tools reach strict projection parity and the 19th is the deliberate
  module-absent honest-`unavailable` (`technical-analysis-decision-lab`, SCN-012-034
  lock, covered by SCN-012-042). "No formula copy" is corroborated by 14 `no inline
  copy` selftest canaries plus zero edits to any `rlexperience-adapters/*` module across
  every scope-15 commit — including `30326253`, which wired `volatility-sizing-lab` by
  adding a passthrough provider to the page and touched no adapter module. *(Evidence
  refreshed 2026-07-28 at HEAD `30326253`: the excerpts previously pasted here were
  genuine but superseded runs reporting 16 wired / 15-of-16, then 18 / 17-of-18; the
  identical commands were re-executed and now report 19 / 18-of-19 / 19 provider
  pages.)*

  ```text
  $ node --test tests/simple-production-bridge.integration.mjs
  [TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
  [TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
  [TP-15-02] strict parity (module loaded by the page): 18 of 19
  [TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
  ✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.125262ms)
  ✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (917.186397ms)
  ✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (879.434727ms)
  ✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1272.626227ms)
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.949663ms)
  ✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (30.057777ms)
  ℹ tests 6
  ℹ pass 6
  ℹ fail 0
  ===TP1502_EXIT=0===

  $ grep -ln '__rlOwnerStateProvider' *.html | wc -l
  19

  $ grep -c 'no inline copy' scripts/selftest.mjs
  14

  $ git show --name-only --format='' <every scope-15 commit> | grep -E 'rlexperience-adapters/'
  (empty = zero adapter-module formula edits)
  ```

- [x] SCN-012-041: The 8 `#simpleView` tools' native Simple content is reachable under Power with nothing deleted; BUG-003 is closed.

  **Claim Source:** executed (2026-07-30, `bubbles.plan`, HEAD `acf042bb`). Both clauses
  met. *(The prior reason — "NOT SATISFIED on the 8th `#simpleView` page alone" — was
  accurate at HEAD `a7631b36` and is **superseded**; it is retained verbatim below.)*

  ```text
  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1
  TP-15-04/SCN-012-041 derived native #simpleView tools: 7 of 19 wired (4 also declare #powerView) — intraday-tape-lab swing-structure-lab gamma-trading-lab sector-research-lab+#powerView bond-regime-lab+#powerView etf-momentum-lab+#powerView volatility-sizing-lab+#powerView
    4 passed (12.1m)
  Exit Code: 0
  ```

  RED proof: forcing the adapter panel visible under Power in `intraday-tape-lab` failed
  with `intraday-tape-lab: SCN-012-041 the adapter panel must be HIDDEN in Power`; the
  page was then restored byte-exactly to sha256
  `c7767c738cc42168879bc0f104ceef294f00d15b2fddacb09ba0ecef129b167d`.
  `msft-july-print-model` is the 8th page and is **N/A by design** — it is not wired
  (registers no `__rlOwnerStateProvider`) and sets `window.__rlviewsInit = 1`
  (lines 792-793), which `rlapp.js:302` gates the shell on, so the shell demotion this
  scenario describes structurally cannot run there.

  **Clause (b) — BUG-003 — was already met** by `28099a4d`'s interception-free live-stack
  carrier (28/28, exit 0). Unchanged by this edit.

  **Clause (a) is now met on all 8.** Two independent things closed it:

  *7 of 8, by per-page executed proof.* Commit `acf042bb` (+134/-1, in
  `tests/simple-production-wiring.spec.mjs` only) extended the TP-15-04 sweep to assert
  **both halves of this scenario per tool**, which no test previously did — 5 of the 7
  wired `#simpleView` pages had no dedicated spec at all. Per tool it now asserts, in
  Simple: `#simpleView` **attached** (`toHaveCount(1)`) but hidden, the adapter panel
  visible, and **zero** native top-level children rendered; in Power: the panel hidden,
  `body` releases `rlv-focused`, native top-level content visible, and `#powerView`
  visible on the pages that declare one. The attached-but-hidden pairing is deliberately
  adversarial — it is what makes "nothing **deleted**" a real assertion rather than a
  bare not-visible check that a deletion would also satisfy. The swept set is derived
  from page source (`pageDeclaresElementId`), never hard-coded, so a page gaining or
  losing `#simpleView` joins or leaves automatically; two anti-vacuity guards
  (`nativeSimpleTools.length > 0`, and `nativeDemotion.length === nativeSimpleTools.length`)
  make a silently-skipped tool a failure; and the shell rule selector is **extracted from
  the production `rlviews` stylesheet** with a fatal guard, so the test cannot drift from
  the contract it checks. RED-proven: forcing the adapter panel visible under Power in
  `intraday-tape-lab` fails with `intraday-tape-lab: SCN-012-041 the adapter panel must
  be HIDDEN in Power`; the page was restored byte-exactly to `c7767c73`.

  *The 8th, `msft-july-print-model`, is **N/A by design** — verified first-hand, not
  inherited.* The page is structurally outside the shell, and the scope never touched it:

  ```text
  $ grep -n 'name="rlviews"' msft-july-print-model.html
  778:  <meta name="rlviews" content="off">
  $ grep -n '__rlviewsInit' msft-july-print-model.html
  792:        if (m && (m.getAttribute('content') || '').toLowerCase() === 'off') window.__rlviewsInit = 1;
  793:      } catch (e) { window.__rlviewsInit = 1; }
  $ grep -n '__rlviewsInit' rlapp.js
  302:          return !!root.__rlviewsInit;
  $ sed -n '<ensureSharedScript>' rlapp.js
        function ensureSharedScript(id, src, ready) {
          return new Promise(function (resolve) {
            if (ready()) return resolve(true);      ← the pre-set flag short-circuits the load

  $ grep -c '__rlOwnerStateProvider' msft-july-print-model.html   → 0   (registers no provider)
  $ grep -c 'id="simpleView"' msft-july-print-model.html          → 1
  $ grep -c 'id="powerView"'  msft-july-print-model.html          → 1
  $ grep -c 'id="modeSeg"'    msft-july-print-model.html          → 1   (its OWN Simple/Power toggle)

  $ (all 31 scope-15 + 2 BUG-004 commits) | grep -c '^msft-july-print-model.html$'   → 0
  ```

  The chain closes end to end: `meta rlviews=off` pre-sets `window.__rlviewsInit = 1`,
  which makes `ensureSharedScript`'s `if (ready())` guard short-circuit, so `rlviews.js`
  is **never loaded**, so `body.rlv-focused` can never be applied, so the shell demotion
  this scenario describes structurally cannot run there. The page carries its own
  `#modeSeg` + `#simpleView` + `#powerView`, so its native Simple content **is** reachable
  under its own Power toggle. And **no commit in this scope touched the file** — so the
  scope hid nothing and deleted nothing on that page.

  **Why this closes but SCN-012-039 does not — the distinction is deliberate, not
  convenient.** SCN-012-039's open clause is a *coverage* assertion about a population
  ("every ordinary tool wired"); four tools are deliberately unwired, so that assertion
  is **false**. SCN-012-041's clause is a *preservation* assertion ("reachable … with
  nothing deleted"); for the msft page it is **true** — nothing is unreachable and
  nothing is deleted — and the risk it guards against (content lost to the shell's
  demotion) is structurally absent because the shell never runs. A false assertion cannot
  be checked; a true one reached by a different route can. Resolving that applicability
  question is `bubbles.plan`'s own call, and it is resolved here in the direction the
  evidence supports, with the reasoning recorded rather than assumed.

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
    WIRED    volatility-sizing-lab.html
    -- 8 pages, 7 wired, 4 of the 7 also declare #powerView

  (independently matches the sweep's OWN printed derivation:
   "TP-15-04/SCN-012-041 derived native #simpleView tools: 7 of 19 wired (4 also declare #powerView)")

  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1
    4 passed (12.1m)
  SWEEP_EXIT=0
  ```

  Full record: [report.md](report.md#dod-closure-run--2026-07-30-head-acf042bb).

  Superseded reason follows:

  NOT SATISFIED — **on the 8th `#simpleView` page alone; the BUG-003 half is now met.**
  7 of the 8 are reconciled with executed proof; the 8th is not. *(Correction 2026-07-28
  at HEAD `30326253`: earlier
  revisions of this reason said "no `#simpleView` tool has been reconciled" and then
  "6 of 8", and listed `bond-regime-lab` and `volatility-sizing-lab` as unwired. All of
  those statements are false at HEAD.)*

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
    WIRED    volatility-sizing-lab.html

  $ for t in tests/bond-regime-lab.spec.mjs tests/volatility-sizing-lab.spec.mjs tests/msft-july-market-refresh.spec.mjs; do \
      echo -n "  $t => "; git log --oneline f216be0d~1..HEAD -- "$t" | wc -l; done
    tests/bond-regime-lab.spec.mjs => 1
    tests/volatility-sizing-lab.spec.mjs => 1
    tests/msft-july-market-refresh.spec.mjs => 0
  ```

  The "nothing deleted / reachable under Power" half is genuinely proven for the 7
  wired pages: `fed8f9ab` reconciled `tests/bond-regime-lab.spec.mjs` and `30326253`
  reconciled `tests/volatility-sizing-lab.spec.mjs`, both by adding the
  `openNativeResearchSurface()` helper that drives the shell to Power before touching
  the native controls, and both specs were **executed this session inside the 102-test
  regression at exit 0** (`tests/volatility-sizing-lab.spec.mjs` additionally standalone
  at 16/16 — see [report.md](report.md#tp-15-06)).

  **Clause (b) — BUG-003 — is now MET.** *(The reason previously recorded here — "BUG-003
  is not closed — the Test Plan's TP-15-05 persistent title … does not exist anywhere in
  `tests/`, so no test carries the declared BUG-003-closure contract" — is **obsolete**:
  D4 half 1 closed 2026-07-29, and `28099a4d` added an interception-free live-stack
  carrier that asserts both directions of the contract. Executed 28/28 at HEAD
  `a7631b36` — see the TP-15-05 row.)* The bond-regime BUG-003 in `specs/_bugs/` is at
  status `done`.

  **Clause (a) is what keeps this row open:** *(SUPERSEDED 2026-07-30 — clause (a) is
  now met; see the Claim Source above. The original text follows unmodified.)* the 1
  unwired `#simpleView` page
  (`msft-july-print-model`) is not reconciled and its spec is untouched by this scope.
  It is also the one page where the shell **deliberately never runs** (a
  `window.__rlviewsInit = 1` opt-out), so it has no Power view for its native content to
  be "reachable under" — nothing there is hidden or deleted, but neither is the clause
  demonstrated as literally worded. Whether the clause is even applicable to a page that
  opts out of the shell is the same wording question as SCN-012-039's END-state clause,
  and is routed to `bubbles.plan`. Not closable by executing anything.

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

  **(a) Boundary — protected paths clean, but the allowlist is NOT clean.** Derived at
  HEAD `fed8f9ab` (prior session; **not** re-derived at HEAD `30326253`, so the path
  union below excludes commit `30326253`): the union of every path touched across all 16
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

  **Re-checked 2026-07-29 at HEAD `a7631b36`: both halves still stand.** D3 remains open
  with `bubbles.plan` (the allowlist has not been amended), and a repository-wide search
  for any recorded rollback exercise across this scope's artifacts returns nothing.
  Neither half is closable by executing a test — (a) needs a `bubbles.plan` allowlist
  amendment, (b) needs a rollback rehearsal that no one has performed.

  **Update 2026-07-30 at HEAD `acf042bb` — half (a) CLOSED, half (b) still OPEN, so the
  row stays unchecked.**

  *(a) Boundary — now clean.* Drift **D3** is closed. The allowlist has been reconciled
  against a delivered path set derived from the **commit set** (31 subject-attributed
  Scope 15 commits + 2 BUG-004 commits) rather than from a pathspec filter keyed on the
  allowlist itself — the earlier derivation was structurally incapable of finding paths
  outside the list it filtered on, which is why the drift persisted. Outcome: 5 paths
  added as genuine in-boundary delivery, 1 (`tests/market-heatmap-control-surface.spec.mjs`)
  **deliberately refused** because it is BUG-004's carrier and listing it would
  misattribute another artifact's delivery here, and 4 retained as explicitly
  declared-but-not-delivered. Protected paths re-verified untouched. One new finding was
  raised rather than absorbed: **D7**, `rlchart.js` was edited outside the Shared
  Infrastructure Impact Sweep.

  *(b) Rollback — still never demonstrated.* Unchanged. No executed command has exercised
  the documented rollback path. Rehearsing it requires source edits (restoring the stub,
  reverting `rlapp.js` and each page's provider), which an artifact-only run does not
  perform. **This half alone keeps the row open**, and it is ordinary agent-actionable
  work — not an owner decision.


#### Test Evidence Items - Exact Parity With 7 Test Plan Rows

- [x] TP-15-01 unit evidence proves the bridge contract, `ownerModes`, honest-unavailable fallback, and no forbidden authority.

  **Claim Source:** executed (2026-07-29, this agent, HEAD `a7631b36`). *(The prior
  Uncertainty Declaration recorded here — "the file contains **no** `ownerModes`
  assertion and **no** forbidden-authority assertion, so two of the four claims are not
  proven by the named test" — was accurate at HEAD `30326253`/`0890348a` and is
  **superseded**: commit `a7631b36` added exactly those two assertions to the declared
  file, taking it from 7 tests to 9.)* All four declared claims are now named tests in
  `tests/simple-production-bridge.unit.mjs` — bridge contract → tests 1-2;
  honest-unavailable fallback → tests 3-5; `ownerModes` → test 8; no forbidden
  authority → test 9. The forbidden-authority proof is no longer a manual static scan:
  test 9 runs the real bridge and asserts it touches no network, provider, storage or
  cookie surface.

  ```text
  $ node --test tests/simple-production-bridge.unit.mjs
  ✔ renderSimpleBridge is exposed on the production API (4.526289ms)
  ✔ provider present + real owner state → renders the REAL market-breadth adapter (ready), never mutates rlv-focused (28.047632ms)
  ✔ no owner-state provider → honest unavailable, no invented signal, never mutates rlv-focused (4.755089ms)
  ✔ owner evidence does not permit a run (unhydrated) → honest unavailable, never mutates rlv-focused (12.74387ms)
  ✔ missing adapter module → honest unavailable (no crash), never mutates rlv-focused (3.89799ms)
  ✔ a queued Simple run does not survive an invalidation, and its promise settles (19.714953ms)
  ✔ leaving Simple altogether also settles the queued run without painting (3.348991ms)
  ✔ ownerModes resolution: provider wiring hands Simple to the adapter panel and never regresses an unwired tool (1.077198ms)
  ✔ no forbidden authority: the runtime declares none, and running the real bridge touches no network, provider, storage or cookie surface (21.220249ms)
  ℹ tests 9
  ℹ suites 0
  ℹ pass 9
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 199.425417
  UNIT_EXIT=0
  ```

  See [report.md](report.md#command-1--tp-15-01-unit-all-four-declared-halves-99).

- [x] TP-15-02 integration evidence proves the registry-derived provider→runtime→panel loop and owner-parity for wired tools.

  **Claim Source:** executed (2026-07-28, re-run at HEAD `30326253`). Exact match to the
  Test Plan row: the file, the command, and all six test titles exist and pass,
  including the registry-derived loop and the owner-parity assertion. *(Evidence
  refreshed 2026-07-28 at HEAD `30326253`: the excerpts previously pasted here were
  genuine but superseded runs reporting 16 wired / 15-of-16 and then 18 / 17-of-18; the
  identical command was re-executed and now reports 19 / 18-of-19.)*

  ```text
  $ node --test tests/simple-production-bridge.integration.mjs
  [TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
  [TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
  [TP-15-02] strict parity (module loaded by the page): 18 of 19
  [TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
  ✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (49.125262ms)
  ✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (917.186397ms)
  ✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (879.434727ms)
  ✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (1272.626227ms)
  ✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (48.949663ms)
  ✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (30.057777ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 3317.921861
  ===TP1502_EXIT=0===
  ```

- [x] TP-15-03 E2E evidence proves market-heatmap Simple renders the real adapter panel and a control recomputes.

  **Claim Source:** executed (2026-07-29, whole-file run 4/4, exit 0 —
  [Command 4](report.md#command-4--tp-15-03--tp-15-04-wiring-spec-44-system-chrome)).

  ```text
  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
  Running 4 tests using 1 worker
    ✓  1 …Simple renders the real adapter panel in the real owner-mode flow (2.9s)
    ✓  2 …ctuating one recomputes the production projection with no refetch (4.1m)
    ✓  3 …ol paints its real Simple adapter panel with an owner-parity fact (7.2m)
    ✓  4 …s, and the honest-degradation cases are registry/provider derived (49ms)
    4 passed (11.4m)
  WIRING_EXIT=0
  ```

  Tests 1 and 2 are this row's two carriers — the panel-render half
  (`tests/simple-production-wiring.spec.mjs:48`) and the control-recompute half (`:198`).
  Both prior reasons are superseded. *Title drift (D1)* closed 2026-07-29: both halves
  now live in the declared file and the Test Plan declares them verbatim, so the
  reconciled command selects **2** tests (`--list` verified) and can no longer resolve to
  zero. *Missing attributable run* closed by Command 4. The declared file is
  interception-free — all five pattern matches are inside comment blocks that state the
  constraint.

  **Reproducibility note (disclosed, not elided).** Command 4 ran against a tree carrying
  an uncommitted +11/-26 delta on `tests/simple-production-wiring.spec.mjs`, which
  replaced a request-timing "network quiet" heuristic with the page's own declared
  terminal-hydration boundary (`awaitDeclaredHydrationBoundary(page, 'data-heatmap-hydration')`).
  That delta is byte-identical to what commit `bc3b7303` subsequently committed, and no
  commit since has touched the file — so the recorded run covers the content at HEAD
  `a7631b36` exactly. No assertion was relaxed, no tolerance widened, no check removed:
  the non-vacuity assertion (moving a real model input must change the rendered
  projection) and the empty-request-window assertion both survive unchanged.

  ```text
  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1
    4 passed (11.4m)
  WIRING_EXIT=0
  ```

  Superseded evidence follows:

  Re-verified this session at HEAD `30326253` (the 5 adapter/wiring specs containing
  both halves ran inside the 8-spec, 102-test regression at exit 0 —
  [report.md](report.md#command-5--simple-adapter--production-wiring--wired-tool-regression-8-specs-system-chrome)):

  ```text
  $ grep -rn 'renders the real adapter panel and one control recomputes owner leadership' tests/
  (exit 1 — declared title NOT FOUND)
  ```

- [x] TP-15-04 E2E evidence proves each wired ordinary tool shows a ready adapter panel in Simple with an owner-parity fact.

  **Claim Source:** executed (2026-07-29, `bubbles.validate`, whole-file run 4/4, exit 0 —
  [Command 4](report.md#command-4--tp-15-03--tp-15-04-wiring-spec-44-system-chrome)).
  Both prior reasons are superseded. *Title drift (D1)* closed 2026-07-29: the declared
  file now contains 4 tests, two of them this row's carriers, and the Test Plan declares
  both verbatim — `TP-15-04 every wired ordinary tool paints its real Simple adapter
  panel with an owner-parity fact` (`:731`, the `e2e-ui` sweep across all 19 wired tools)
  and `TP-15-04 the swept set is derived from the production registry + pages, and the
  honest-degradation cases are registry/provider derived` (`:822`, the anti-hardcoding
  guard). *Missing attributable run* closed by Command 4. The sweep is registry-derived
  rather than hard-coded, so it cannot silently shrink: all 19 wired tools converge and
  the swept set is re-derived from the production registry and pages on every run.

  ```text
  $ npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line --workers=1
    4 passed (11.4m)
  WIRING_EXIT=0
  ```

  Superseded evidence follows:

  ```text
  $ grep -rn 'each wired ordinary tool shows a ready adapter panel' tests/
  (exit 1 — declared title NOT FOUND anywhere in tests/)

  $ grep -n "test('" tests/simple-production-wiring.spec.mjs
  47:test('Regression: market-heatmap Simple renders the real adapter panel in the real owner-mode flow', async ({ page }) => {
  (exactly one test in the declared file)
  ```

- [x] TP-15-05 E2E evidence proves bond-regime native content shows in Power not Simple (BUG-003 closure).

  **Claim Source:** executed (2026-07-29, this agent, HEAD `a7631b36`, 28/28, exit 0 —
  [Command 2](report.md#command-2--tp-15-05-live-stack-carrier-2828-system-chrome)).

  ```text
  $ npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
  Running 28 tests using 1 worker
    ✓  17 …ady waits for auto-hydration before Simple and Power comparison (738ms)
    ✓  18 …ith native content hidden, shell Power shows the native content (11.0s)
    ✓  19 …spec.mjs:590:1 › BS-011 Simple and Power share one model digest (721ms)
    ✓  20 …-012 lever change recomputes without fetch or observed mutation (764ms)
    28 passed (41.5s)
  TP1505_EXIT=0
  ```

  **Both prior disqualifiers are now resolved.** Test 18 is the carrier commit `28099a4d`
  added — `TP-15-05 live-stack: shell Simple shows the registry adapter panel with native
  content hidden, shell Power shows the native content` (`tests/bond-regime-lab.spec.mjs:545`),
  taking the file from 27 to 28 tests. It opens with
  `openFromSharedCache(page, { routeTreasury: false })`, so there is **zero interception
  on its own path**; it resolves the adapter id from `simple-models.json` rather than
  hard-coding it; and it asserts BOTH halves of the declared row in one run. Its
  `toBeAttached()` + `not.toBeVisible()` pairing is deliberately adversarial — an absent
  node would satisfy a bare not-visible check, so a deletion cannot masquerade as a
  demotion.

  **D4 half 2 does not survive this, and is not laundered by it.** The old reason was
  that the row's only carrier (`Regression BUG-003:`) installs `page.route` and so, being
  mocked, cannot close a live `e2e-ui` row. That test **is still mocked and is expressly
  still not the carrier** — the row is now carried by an interception-free test instead.
  The three `page.route` sites at `:267/:334/:428` are pre-existing Feature-003 fixture
  pinning, untouched by this scope. *(Correction 2026-07-28: an earlier revision said
  "NOT STARTED — `bond-regime-lab` is unwired, its spec still asserts native
  `#simpleView [data-model-digest]` on the default Simple view". Both statements are
  false at HEAD.)*

  Superseded evidence and the original disqualifier analysis follow:

  `bond-regime-lab` **is wired**, `fed8f9ab` reconciled `tests/bond-regime-lab.spec.mjs`
  to the shell, and the spec was **re-executed this session at HEAD `30326253` inside
  the 8-spec, 102-test regression at exit 0**. The standalone 27/27 run below was
  captured at HEAD `fed8f9ab`; it is genuine and its tests are a subset of this
  session's 102-test green run:

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

  **Title drift RESOLVED 2026-07-29 (D4 half 1).** The reason previously recorded here
  — "the persistent title this Test Plan row declares does not exist, so there is no
  test carrying the declared BUG-003-closure contract" — is **obsolete**. The Test Plan
  row now declares its two real carriers verbatim:
  `Regression BUG-003: Ready waits for auto-hydration before Simple and Power
  comparison` (`:413`, the "NOT Simple" half + BUG-003 closure) and
  `BS-012 lever change recomputes without fetch or observed mutation` (`:515`, a
  mechanically verified caller of `openNativeResearchSurface`, which carries the
  "native content shows in POWER" half). Carrier attribution was verified by mapping
  every `openNativeResearchSurface(` call site to its enclosing test rather than by
  trusting the file's traceability comment — which lists `BS-004, BS-005, BS-012,
  BS-014` but whose **actual** callers are `BS-006`, `BS-007`,
  `Scenario controls reject nonfinite input…` and `BS-012`.

  **The row nevertheless stays open on its SECOND, independent disqualifier (D4 half 2,
  still OPEN):** carrier (a) uses `page.route` interception, so it cannot close a live
  `e2e-ui` row. Reconciling the title does not and must not launder that.

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

- [x] TP-15-06 E2E evidence proves volatility-sizing native Simple moved to Power and Simple shows the panel or an honest unavailable pending the RLVOL provider.

  **Claim Source:** executed (2026-07-29, 16/16, exit 0 —
  [Command 6](report.md#command-6--tp-15-06-volatility-sizing-spec-1616-system-chrome)).

  ```text
  $ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list
  Running 16 tests using 1 worker
    ✓   5 …n BS-009: insufficient history is unavailable with exact counts (765ms)
    ✓  16 …le THROUGH the shared rlnav registration, not just by direct URL (1.1s)
    16 passed (14.6s)
  TP1506_EXIT=0
  ```

  Tests 5 and 16 are this row's two declared carriers, and
  `tests/volatility-sizing-lab.spec.mjs` is untouched by every commit since, so that run
  covers the content at HEAD `a7631b36`. Both prior reasons are superseded: *D5 title
  drift* closed 2026-07-29 (the Test Plan now declares both real carriers verbatim), and
  the *missing attributable run* closed by Command 6. Both carriers are
  interception-free — the file's only `page.route` match is the comment block that
  **states** the zero-interception constraint.

  **The BEHAVIOUR is proven on both halves.** *(Correction: the previous reason here
  — "wiring was attempted and deliberately reverted … the tool is unwired" — is
  **obsolete and false** at HEAD.)* `volatility-sizing-lab` is WIRED: the page registers
  `__rlOwnerStateProvider["volatility-sizing-lab"]`, loads its declared `adapterModule`
  `rlexperience-adapters/market-structure.js` (line 663, after `rlvol.js`), and appears
  in `[TP-15-02] wired (19)` inside the 18-of-19 strict-parity set. The earlier parity
  divergence was root-caused to the provider taking a **second wall-clock sample** and
  fixed by reading `asOf`/`decisionTime` back off the page's own displayed decision — a
  real defect fix, with no assertion relaxed.

  Both halves this row asserts are proven by real, green, **interception-free**
  live-stack tests in `tests/volatility-sizing-lab.spec.mjs` (16/16, exit 0 this
  session):

  - *native Simple moved to Power* — `TP-02-04: the volatility tool is reachable
    THROUGH the shared rlnav registration…` asserts `#simpleView` is only
    `toBeAttached()` (deliberately off screen) while the adapter panel is visible, then
    drives the shell to Power and asserts `#powerView` and `#assetSelect` are visible.
  - *Simple shows the panel / an honest unavailable* — `Regression BS-009: insufficient
    history is unavailable with exact counts` asserts
    `[data-rlexperience-panel="simple"]` carries the **registry-resolved** adapter id
    (read from `simple-models.json`, not hard-coded), reports
    `data-rlexperience-simple-state="unavailable"`, and is visible.

  **Title drift RESOLVED 2026-07-29 (D5).** The reason previously recorded here — "the
  persistent title this Test Plan row declares does not exist anywhere in `tests/`, so
  no test carries the declared contract" — is **obsolete**. The Test Plan row now
  declares its two real, interception-free carriers verbatim:
  `TP-02-04: the volatility tool is reachable THROUGH the shared rlnav registration,
  not just by direct URL` (`:405`) and
  `Regression BS-009: insufficient history is unavailable with exact counts` (`:221`).
  Both were confirmed present by `--list`, and the whole-file command selects **16**
  tests. **Why the box nevertheless stays open:** what remains is an executed,
  attributable run of the reconciled command recorded in `report.md` — which
  `bubbles.plan` does not own and did not perform. Superseded evidence follows:

  ```text
  $ npx --no-install playwright test tests/volatility-sizing-lab.spec.mjs \
      --config=playwright.config.mjs --project=system-chrome --reporter=list --workers=1
  Running 16 tests using 1 worker
    ✓   5 …n BS-009: insufficient history is unavailable with exact counts (476ms)
    ✓  16 …e THROUGH the shared rlnav registration, not just by direct URL (858ms)
    16 passed (9.7s)
  ===TP1506_EXIT=0===

  $ grep -rn 'Regression: volatility-sizing native Simple moves to Power' tests/
  (exit 1 — declared title NOT FOUND)

  $ grep -nE 'page\.route|context\.route|intercept\(|cy\.intercept|msw|nock|wiremock' tests/volatility-sizing-lab.spec.mjs
  9: * page.route / route.fulfill / route.abort / response interception anywhere in this file.
  (1 match, inside the comment block that STATES the constraint — zero executable interception)
  ```

  Item satisfied on both halves. See [report.md](report.md#tp-15-06).

- [x] TP-15-07 broad selftest evidence proves existing Research Lab behavior remains green (0 failures) with the new bridge canaries.

  **Claim Source:** executed (2026-07-29, this agent, HEAD `a7631b36`). *(The prior
  Uncertainty Declaration — "**952 passed, 0 failed** … the 0-failure preservation half
  is met. But the 'new bridge canaries' half is not" — was accurate at HEAD `30326253`
  and is **superseded**: drift **D2** was closed 2026-07-29 by adding the Implementation
  Plan step-7 canaries as a named `Feature 012 Scope 15 production Simple-view bridge
  canaries (TP-15-07)` group of **16**. The delta 952 → 968 is exactly those 16
  canaries.)* Both halves are now met: the suite is green at 0 failures **and** the
  bridge canaries exist, executing `rlapp.js`'s own `ownerModes` expression and
  `rlviews.js`'s own `rlv-focused` predicate rather than a restated copy.

  ```text
  $ node scripts/selftest.mjs
    ✓ rlviews.js’s own rlv-focused predicate, fed those real ownerModes, focuses a wired tool’s Simple, leaves Power unfocused, and never focuses an unwired native Simple or a brief view
    ✓ RLEXPERIENCE.renderSimpleBridge is exposed on the production API
    ✓ a wired tool with no owner state degrades to an honest unavailable that names the missing owner adapter, publishes a null numeric, paints no numeric node, and invents no signal (market-heatmap-lab)
    ✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

  ================================================
  Research-Lab self-test: 968 passed, 0 failed
  ================================================
  SELFTEST_EXIT=0
  ```

  See [report.md](report.md#command-3--tp-15-07-broad-selftest-968-passed-0-failed).

  Superseded evidence (HEAD `30326253`, retained for audit) — this is the capture that
  justified keeping the row open, and it is exactly what the D2 closure overturned:

  ```text
  $ node scripts/selftest.mjs
  ================================================
  Research-Lab self-test: 952 passed, 0 failed
  ================================================
  ===SELFTEST_EXIT=0===

  $ grep -n 'renderSimpleBridge\|installSimpleProjectionBridge\|ownerModes\|production bridge' scripts/selftest.mjs
  (exit 1 — no matches; no bridge canary exists)
  ```


#### Build Quality Gate

- [ ] Per-tool RED/GREEN, exact system-Chrome identity, no-interception scan (no `page.route`/`context.route`/`intercept`/`msw`/`nock`), bridge/provider forbidden-authority scan, owner pre/post parity, the registry-derived loop, changed-path boundary, editor diagnostics, `git diff --check`, source-lock, registry validator, artifact lint, and the broad selftest are current and clean.

  PARTIALLY VERIFIED, NOT CLOSED. **Verified this session at HEAD `30326253`:** the
  registry-derived loop (TP-15-02, 6/6, exit 0); owner pre/post parity (TP-15-02,
  18-of-19 strict + 1 deliberate honest-`unavailable`); exact system-Chrome identity
  (`--project=system-chrome` on every Playwright run — the 8-spec regression 102
  passed, `tests/volatility-sizing-lab.spec.mjs` 16/16, and the
  `tests/palm-springs-rental-market-lab.spec.mjs` Pages gate 29 passed, all exit 0); the
  no-interception scan on this scope's own specs; a manual bridge forbidden-authority
  static scan; and the broad selftest (952 passed / 0 failed, exit 0).

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

  1. Per-tool RED/GREEN is absent for the **3** remaining unwired ordinary tools
     (`msft-july-print-model`, `palm-springs-rental-market-lab`,
     `ocean-shores-rental-market-lab`). *(Correction
     2026-07-28: earlier revisions of this reason said 6 and then 4 remaining tools;
     both counts predated `bond-regime-lab`, `company-fundamentals-lab` and
     `volatility-sizing-lab` being wired.)*
  2. ~~The automated bridge/provider forbidden-authority canary **does not exist**~~ —
     **CLOSED 2026-07-29 at HEAD `a7631b36`.** Implementation Plan step 7 landed the
     16-canary bridge group in `scripts/selftest.mjs` (952 → 968), and unit test 9 (`no
     forbidden authority: the runtime declares none, and running the real bridge touches
     no network, provider, storage or cookie surface`) makes it an automated assertion
     rather than a manual scan.
  3. The **changed-path boundary is not clean against the allowlist** — 5 delivered
     paths fall outside the declared Implementation Files (drift **D3**); see the
     change-boundary DoD item above.
  4. `tests/bond-regime-lab.spec.mjs`, which this scope modified, contains executable
     `page.route` interception at lines 267/334/375 (pre-existing Feature-003 fixture
     pinning). That is not a scope-15 regression, but it means the no-interception
     scan is **not** clean across every spec this scope touched, so the gate's own
     wording is not met.

  Reason 2 is closed and reason 4 no longer decides any DoD row (TP-15-05's carrier is
  now interception-free; the pre-existing Feature-003 `page.route` sites remain, so the
  gate's literal "across every spec this scope touched" wording is still not met). But
  **reasons 1 and 3 stand independently**, so this gate cannot close: per-tool RED/GREEN
  is absent for the 3 unwired ordinary tools, and the changed-path boundary is not clean
  against the declared Implementation Files allowlist (**D3**, open with `bubbles.plan`).

  **Update 2026-07-30 at HEAD `acf042bb` — scans re-run current; reason 3 CLOSED; the
  gate stays `- [ ]` on reason 1 alone.**

  *Scan currency — answered.* Every scan this gate names that does not require a
  12-minute browser run was re-executed at current HEAD by `bubbles.plan` this session,
  so "the evidence is from an older HEAD" is no longer a live concern. Raw output in
  [report.md](report.md#dod-closure-run--2026-07-30-head-acf042bb).

  ```text
  $ node scripts/validate-node-source-lock.mjs
  [node-source-lock] actual=PASS
  [node-source-lock] OK adversarial=16 unexpectedAcceptances=0
  SOURCE_LOCK_EXIT=0

  $ git diff --check
  DIFF_CHECK_EXIT=0

  $ node scripts/selftest.mjs
  Research-Lab self-test: 968 passed, 0 failed
  SELFTEST_EXIT=0
  ```

  *No-interception scan — measured, comment-stripped, with provenance.* 0 executable
  matches in `tests/simple-production-wiring.spec.mjs` (5 raw, all in comment blocks) and
  0 in `tests/market-heatmap-control-surface.spec.mjs` (2 raw, both comments).
  `tests/bond-regime-lab.spec.mjs` has exactly **3** executable sites, at 326/393/441 —
  and `git blame` attributes all three to `943972e2` (2026-07-16), which pre-dates this
  scope. The TP-15-05 live carrier (`28099a4d`) added **3 lines mentioning `page.route`
  and all 3 are comments** disclosing the pre-existing mocking; `3f04904b` and `fed8f9ab`
  added 0. **This scope introduced zero executable interception.**

  *Reason 3 — CLOSED.* D3 is closed; the allowlist is reconciled against a
  commit-set-derived delivered path set. See the change-boundary item above.

  *Reason 4 — recorded honestly, still literally unmet.* The scope added no interception,
  but a spec it *modified* carries 3 pre-existing sites, so the gate's own phrasing
  ("across every spec this scope touched") is not satisfied. It is not the deciding
  blocker.

  *Reason 1 — STANDS, and is why this row stays unchecked.* "Per-tool RED/GREEN is absent
  for the 3 unwired ordinary tools" is **SCN-012-039's coverage clause inherited
  verbatim**. Those 3 tools are deliberately unwired, so a per-tool RED/GREEN for them
  cannot exist without doing work the product has declined. Checking this composite gate
  while its own constituent SCN-012-039 remains open would be self-contradictory, so it
  is not checked. If the owner approves the SCN-012-039 amendment proposed above, this
  reason should be amended in the same change — RED/GREEN required for every **wired**
  tool, an exemption record for each exempt one.

