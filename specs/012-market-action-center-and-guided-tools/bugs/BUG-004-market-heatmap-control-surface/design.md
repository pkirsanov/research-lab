# Bug Fix Design: BUG-004 Market Heatmap Control Surface

## Design Brief

### Current State

The production Simple bridge in `rlexperience.js` runs only when
`rlviews:change` enters Simple. Market Heatmap registers its owner provider
synchronously, but its real cache hydration finishes later, so the cold-open
bridge run can paint an honest `unavailable` projection and never run again.
Commit `2f65a02a` added the registry-derived Simple controls and local control
recompute; this design preserves that implementation.

The native `#winSeg`, `#sizeSeg`, and `#grpSeg` controls are inside the same
`.simple-only` panel as the legacy verdict. Power hides that whole panel. The
grouping handler also calls `fetchDelta()`, which conflicts with FR-B004-07's
post-hydration zero-request contract.

### Target State

`RLEXPERIENCE.requestSimpleRefresh({ toolId })` becomes the single public entry
point for Simple owner-state requalification. Both `rlviews:change` and the
heatmap's terminal hydration transition use it. The shared coordinator filters
by current tool and current Simple mode, coalesces duplicate requests, rereads
the existing provider, and permits only the latest generation to mutate the
panel.

Market Heatmap hydrates the deduplicated union needed by both grouping modes
once during boot. Every Simple and Power lever then recomputes locally. The
three native Power controls move into the existing Map panel; the legacy
verdict remains the only `.simple-only` content.

### Patterns to Follow

- Keep adapter resolution, runtime setup, truthful unavailable projection, and
  rendering in `rlexperience.js`.
- Keep `rlviews.js::applyVisual()` as the sole owner of `body.rlv-focused`.
- Keep page-owned acquisition and the existing
  `__rlOwnerStateProvider["market-heatmap-lab"]` seam.
- Extend `tests/simple-production-bridge.unit.mjs` and the existing Scope 15
  `scripts/selftest.mjs` canary block instead of creating a parallel harness.
- Retain `2f65a02a` control domains, production recompute, focus restoration,
  and request-observer assertions.

### Patterns to Avoid

- Do not dispatch a synthetic `rlviews:change`; owner readiness is not a view
  transition.
- Do not listen to global `rl:data-status`; it is noisy and not tool-scoped.
- Do not let the page call low-level `renderSimpleBridge()` or copy shared
  setup, formulas, provider resolution, or race handling.
- Do not poll readiness, add a second cache/provider, or fetch on a lever
  change.
- Do not clone the native controls or add another decorative Map panel.

### Resolved Decisions

- Choose a public refresh API, not a raw owner-state DOM event.
- Keep one coordinator per document with one active run and at most one latest
  pending successor.
- Use cross-invocation generation guards in addition to the existing local
  control `runSequence`.
- Perform one boot hydration over the union required by both grouping modes.
- Move the existing native lever node into the existing Map panel.
- Preserve all parent Feature 012 contracts and all `2f65a02a` behavior.

### Open Questions

None. The bug specification, parent Feature 012 contracts, current bridge, and
page lifecycle determine the required behavior without an owner decision.

## Design Ownership And Baseline

This is the design-owner reconciliation of the filing-time seed. It establishes
the active technical contract for `TR-BUG004-DESIGN`; no provisional mechanism
remains in active sections.

The source baseline inspected for this approval is local `HEAD` `8fc65030`.
That HEAD includes an unrelated docs-only commit above prompt baseline
`ff392a05`; neither commit changes the controlling BUG-004 paths. Protected
control commit `2f65a02a` remains in ancestry and must not be replaced or
reverted. This document records design approval only and makes no runtime-test,
deployment, or certification claim.

## Purpose And Scope

The repair restores one existing capability: the Feature 012 production Simple
bridge can project owner state that becomes ready after shell boot, while Market
Heatmap remains steerable in both Simple and Power.

The design changes no model formula, parameter domain, provider, registry
identity, storage schema, route, dependency, or publication contract. It
changes only shared bridge lifecycle coordination and the heatmap page's
hydration/control composition.

### Single-Implementation Justification

This is a narrow bug fix inside the existing production Simple foundation. It
does not add a second bridge, provider type, adapter family, screen primitive,
or model variant. A new capability foundation would duplicate the established
`RLEXPERIENCE` and owner-provider contracts; the correct design is a surgical
extension of that foundation.

## Root Cause Analysis

### Defect A: cold-open Simple never requalifies

The controlling sequence is:

1. `market-heatmap-lab.html` registers
   `__rlOwnerStateProvider["market-heatmap-lab"]` synchronously.
2. `rlapp.js` detects that provider and resolves ordinary `ownerModes` to
   `["power"]`.
3. `rlviews.js` applies default mode `simple`, adds `body.rlv-focused`, and emits
   `rlviews:change`.
4. `rlexperience.js::installSimpleProjectionBridge()` handles that event, reads
   the provider once, and runs the adapter. Before hydration, owner evidence does
   not permit a ready breadth projection, so the panel honestly becomes
   `unavailable`.
5. The page completes `fetchDelta()`, calls its native `render()`, and sets
   `data-heatmap-hydration="ready"`.
6. No second `rlviews:change` or owner-state refresh occurs. The shared panel
   remains unavailable until the user changes modes.

**Falsifiable hypothesis:** if the shared bridge receives one tool-scoped refresh
after the final hydration-ready transition and rereads the provider, direct
Simple becomes ready without a mode change.

**Discriminating check:** open directly in Simple, never click a shell tab,
observe `unavailable`, wait for `data-heatmap-hydration="ready"`, then require
`ready`. Failure after the ready marker disproves the fix.

### Defect B: deployed Simple has no controls

Discovery `HEAD` (`31ea9942`) had no `data-rlexperience-control*` renderer in
`rlexperience.js` or its heatmap wiring test, and the deployed page fetch exposed
an unavailable projection with no controls. During filing, the concurrent lane
committed its generic registry-derived renderer and tests as `2f65a02a`. Its
heatmap flow still drives Power then Simple after hydration. The commit is a
partial repair for control rendering, not evidence that production is deployed,
that cold-open requalification works, or that Power controls are restored.

### Defect C: Power hides native levers

The native verdict and all three lever groups share one
`<div class="panel simple-only">`. Power applies
`body.power #simpleWrap .simple-only { display:none; }`. Therefore Power hides
`#winSeg`, `#sizeSeg`, and `#grpSeg` even though their handlers remain wired and
the treemap remains visible.

### Coverage Gap

The committed heatmap wiring regression waits for hydration and then explicitly
clicks Power followed by Simple. That action generates the only refresh the
bridge understands, so the test cannot detect Defect A. Its Power check asserts
only that the adapter panel is hidden and `rlv-focused` is absent; it never
asserts the three controls.

### Required no-refetch reconciliation

The current `#grpSeg` handler calls `fetchDelta()` before `render()`. In
addition, `symList()` returns symbols only for the currently selected grouping.
That behavior contradicts FR-B004-07 and the heatmap notes contract that levers
rerun one local render over one loaded data set. Visibility alone would leave
the restored Power grouping control behaviorally nonconformant.

### Cross-invocation race

`renderSimpleBridgeInternal()` owns a local `runSequence`, which suppresses
stale control runs within one invocation. Every mode event or owner refresh
creates a new invocation and resets that sequence. An older invocation can
therefore finish after a newer invocation and overwrite its ready or
user-actuated result unless the installed bridge owns a generation across
invocations.

## Architecture Overview

```text
rlviews:change(simple) --------------------+
                                            |
heatmap terminal hydration ----------------+--> requestSimpleRefresh({toolId})
                                                   |
                                                   v
                                      tool/mode filter + coordinator
                                                   |
                                      latest provider snapshot read
                                                   |
                                      existing renderSimpleBridge path
                                                   |
                                      generation-gated panel commit
```

The page declares only that its owner state reached a terminal hydration
boundary. The shared bridge continues to own registry lookup, adapter binding,
provider invocation, runtime preparation, truthful failure projection,
coalescing, and panel mutation.

## Public Refresh Contract

Add this production API to `RLEXPERIENCE`:

```text
requestSimpleRefresh({ toolId }) -> Promise<SimpleProjection | null>
```

Contract:

1. `toolId` is required and must exactly equal
   `__rlviewsRegistration.shell.toolId`.
2. The registered tool must be `experience.kind === "ordinary"`.
3. `document.body[data-rlview]` must currently equal `simple`.
4. The Simple panel, definition, provider, adapter binding, config, and public
   API are resolved from the current registration and globals.
5. An accepted request rereads the provider when work starts and runs the
   existing `renderSimpleBridgeInternal()` path.
6. A wrong-tool, non-ordinary, non-Simple, absent-registration, or superseded
   request resolves `null` and performs no provider read or panel mutation.
7. Missing owner evidence, adapter binding, or usable model input remains an
   honest `unavailable` projection; the API never forces `ready`.
8. The method performs no fetch, provider access, storage write, publication,
   author call, formula substitution, or `rlv-focused` mutation.

`renderSimpleBridge(options)` remains available for the existing low-level
unit/integration harness. Page code uses `requestSimpleRefresh({ toolId })` and
does not construct low-level bridge options.

## Tool-Scoped Refresh Lifecycle

### View-driven entry

`installSimpleProjectionBridge()` remains the `rlviews:change` listener but
delegates to the public coordinator:

- Every view change invalidates the prior bridge generation.
- Entering Simple calls `requestSimpleRefresh({ toolId: detail.toolId })`.
- Entering Power, Brief, or Journey clears any pending Simple successor and
  causes an in-flight Simple completion to discard its DOM commit.

This preserves `rlviews.js` as the sole focus/visibility owner while preventing
an async Simple result from painting after the user has left Simple.

### Page-driven entry

Market Heatmap calls
`RLEXPERIENCE.requestSimpleRefresh({ toolId: "market-heatmap-lab" })` only after
a terminal hydration sequence performs these steps in order:

1. mark `HYDRATION.active = false`;
2. render from the now-settled cache;
3. set `data-heatmap-hydration="ready"`;
4. request the tool-scoped Simple refresh.

The same terminal helper serves successful hydration and the boot error terminal
path. On error, the provider may remain insufficient and the bridge remains
honestly unavailable. The ready marker means the hydration attempt is terminal,
not that a model result is guaranteed.

The heatmap requests exactly one refresh per hydration cycle. Under this design,
boot is the only acquisition cycle; lever changes do not start another cycle.

## Coalescing And Latest-Result-Wins

The installed coordinator owns monotonic `generation` state for the document.

1. Every accepted view/owner refresh claims a newer generation.
2. Same-tool requests received before scheduled work begins coalesce into one
   provider read and one bridge run using the newest generation.
3. While one run is active, at most one pending successor exists. A later
   request replaces that pending successor; intermediate requests never run.
4. Provider state is read when a run starts, not when it is queued.
5. `renderSimpleBridgeInternal()` receives a commit predicate and checks it
   before every panel mutation: unavailable render, ready render, control
   render, and focus restoration.
6. A stale completion resolves `null`; it does not render stale ready or replace
   a newer result with unavailable.
7. Within the current generation, the existing local `runSequence` remains the
   ordering authority for control changes.
8. A newer owner refresh invalidates the old generation immediately. Controls
   from the old generation are inert until the newer projection commits, so a
   user cannot actuate stale owner evidence.

The effective commit identity is `(generation, runSequence)`: generation orders
owner/view refreshes across invocations; runSequence orders controls inside the
current invocation.

## Heatmap Data And No-Refetch Contract

Replace state-dependent boot symbol selection with a deduplicated set containing
both:

- enabled `UNI.entries` symbols/member symbols needed by sector grouping;
- `UNI.sectorMap[*].constituents` needed by constituent grouping.

The availability manifest continues to filter thematic members. Boot passes the
stable union to one hydration cycle. The owner provider continues to build the
constituent snapshot through `RLMARKETSTRUCTURE.reduceOwnerState`; no formula
moves.

After boot settles, `#winSeg`, `#sizeSeg`, and `#grpSeg` each update canonical
state, persist, and call `render()` only. Shared Simple controls keep running the
production adapter over captured owner state. No lever invokes `fetchDelta`,
`RLDATA.ensureBars`, `fetch`, or `providerFetch`.

## Power Control Relocation

Keep the legacy verdict and `#verdictSub` in `.panel.simple-only`. Move the
single existing `.levers` node, including `#winSeg`, `#sizeSeg`, and `#grpSeg`,
into the existing Map panel immediately before the canvas wrapper.

- Shared-shell Simple keeps all native page content hidden through
  `body.rlv-focused`; the adapter panel owns five registry-derived controls.
- Power exposes the Map panel and its three native controls next to the output
  they steer; `.simple-only` hides only the legacy verdict.
- Existing IDs, button markup, labels, selected classes, handlers, local state
  keys, and model state remain unchanged. The controls move; they are not cloned.

## Protected Concurrent Work

`rlexperience.js` and `tests/simple-production-wiring.spec.mjs` were committed by
their concurrent owner as `2f65a02a`. Implementation must reread current bytes,
patch surgically, and retain registry-derived five controls, local recompute,
focus restoration, and no-refetch assertions. Control rendering is an existing
prerequisite, not evidence for direct cold-open or Power behavior.

## One-Compute And No-Refetch Invariants

1. The readiness refresh reads the same page provider already used by Simple and
   Power and passes that owner state to the existing adapter.
2. Simple control changes recompute against the owner state captured for the
   current ready render; they do not call the provider or any network API.
3. Power controls continue to mutate the page's canonical `state` and rerender
   the existing treemap/table formulas.
4. Boot hydrates one union sufficient for both Power grouping modes. After it
  settles, changing window, size, or grouping produces an empty request ledger.
  Request listeners are allowed; request interception is not.
5. The regression compares the rendered projection to a production-runtime
   projection from the same frozen owner state so visual change cannot be
   satisfied by relabeling static output.

## Data, Storage, Configuration, And Migrations

- Data schema and registry/config files remain unchanged.
- `mktHeatmapState` retains its existing key and fields.
- Dependencies and package manifests remain unchanged.
- No migration, rollout flag, compatibility fallback, or cache purge exists.

## Security, Privacy, And Authority

The coordinator handles public in-browser analytical state only. It introduces
no credentials, authentication, remote execution, private portfolio data, or
new persistence. Executable-source canaries keep the coordinator and bridge free
of network, provider, storage, cookie, beacon, publication, and author authority.
Existing RLDATA acquisition remains page-owned and boot-only.

## Failure Handling And Observability

- `data-heatmap-hydration="loading|ready"` reports page hydration lifecycle.
- `data-rlexperience-simple-state="unavailable|ready"` reports projection truth.
- `data-rlexperience-adapter` identifies a ready production adapter.
- Existing status text reports hydration progress and settled cache count.

A current-generation provider/setup/prepare failure renders honest unavailable.
A stale failure paints nothing because rendering a superseded error would
overwrite current truth. No console-only success marker is added.

## Implementation Surface

### Collision-sensitive

- `rlexperience.js` - public coordinator, view delegation, and cross-invocation
  commit guard integrated with `2f65a02a` controls.
- `tests/simple-production-bridge.unit.mjs` - tool/mode filtering, coalescing,
  view invalidation, and stale-result suppression.
- `tests/simple-production-wiring.spec.mjs` - preserve committed assertions;
  edit only if coordination is required to remove the masking mode toggle.
- `scripts/selftest.mjs` - extend the existing Scope 15 bridge canary block.

### Page-local

- `market-heatmap-lab.html` - stable boot hydration union, terminal refresh
  call, local-only grouping change, and lever relocation into the Map panel.

### Preferred new regression file

- `tests/market-heatmap-control-surface.spec.mjs` - dedicated direct-Simple and
  direct-Power regressions. A new file avoids overwriting the active test patch
  and keeps all three bug discriminators together.

### Shared contract tests

- Existing `tests/simple-production-bridge.integration.mjs` and
  `scripts/selftest.mjs` remain broad regression gates.

### Explicitly excluded

- `rlviews.js`, `rlapp.js`, `rldata.js`, `simple-models.json`,
  `rlexperience-adapters/market-structure.js`, all parent spec artifacts, and
  all certification fields.

## High-Fan-Out Canary Plan

1. `RLEXPERIENCE.requestSimpleRefresh` exists while `renderSimpleBridge` remains
  callable.
2. Wrong-tool and non-Simple requests perform zero provider reads and panel
  writes; leaving Simple invalidates active work.
3. Duplicate same-turn requests perform one provider read/preparation; an active
  run retains only the latest pending successor.
4. A delayed generation N resolving after N+1 cannot alter N+1's panel.
5. Current failure paints unavailable; the same failure from a stale generation
  paints nothing.
6. Coordinator plus bridge executable source has no forbidden authority and no
  `rlv-focused` write.
7. The registry-derived all-wired-tool provider/adapter parity loop remains
  green; no heatmap-only branch enters the shared bridge.
8. `market-brief` remains brief-only and never enters ordinary Simple refresh.
9. Direct-Simple and direct-Power browser canaries prove both control surfaces
  and an empty post-hydration request ledger.

## Regression Design

1. **Cold-open adversarial case:** enter Simple directly, install no request
   interception, click no mode control, observe `unavailable`, wait for 135
   priced constituents and hydration ready, then require automatic `ready` and
   all five controls.
2. **Simple controls:** derive the expected control set from the production
   registry, actuate controls within declared domains, compare the rendered
   projection to production runtime output, and require no requests.
3. **Power controls:** enter Power directly, assert all three native groups have
   layout boxes and accessible controls, actuate each, assert selected state plus
   a user-visible treemap/table change, and require no requests.
4. **Pre-fix RED:** A and C fail against current bytes despite `2f65a02a`. B's
  dedicated no-control RED is captured against immutable discovery/deployed
  bytes without rewriting current `HEAD`. The worktree is never stashed or
  reset to manufacture that evidence.

## Alternatives And Tradeoffs

| Alternative | Decision | Reason |
|---|---|---|
| Raw `rlexperience:owner-state-change` event | Reject | It adds an untyped global event, can be missed before listener installation, gives no completion contract, and still needs a coordinator. |
| Public `requestSimpleRefresh({toolId})` | Choose | It matches the existing production API, centralizes filtering/races, and is directly testable. |
| Global `rl:data-status` listener | Reject | Aggregate status changes would recompute unrelated tools. |
| Synthetic `rlviews:change` | Reject | The view did not change, and navigation side effects are unrelated to readiness. |
| Heatmap calls low-level `renderSimpleBridge` | Reject | It duplicates shared registry, binding, config, provider, and race ownership. |
| Poll provider readiness | Reject | Timers guess cadence and add hidden work. |
| Fetch missing symbols on grouping change | Reject | It violates FR-B004-07 and the one-loaded-data-set contract. |
| Add another Power control panel | Reject | Moving the existing lever node into Map is smaller and avoids another framed surface. |

## Risk And Rollback

- **High-fan-out risk:** the coordinator serves every wired ordinary tool.
  Registry-derived isolation, authority, parity, and Brief canaries run before
  broad validation.
- **Race risk:** every panel mutation path must honor the cross-invocation
  predicate; ready, unavailable, controls, and focus restoration are covered.
- **Boot-cost risk:** union hydration may include symbols from both grouping
  modes. Existing concurrency stays bounded at two, and controls cause no later
  acquisition cycle.
- **Collision risk:** shared files contain protected `2f65a02a` work. Changes
  are surgical and preserve that commit's behavior.
- **Duplicate-control risk:** focused Simple hides native controls, while shared
  controls remain confined to the adapter panel.

Rollback is one atomic source/test revert of the BUG-004 implementation:

1. remove `requestSimpleRefresh` and restore direct
   `rlviews:change -> renderSimpleBridgeInternal` behavior;
2. remove the heatmap terminal refresh call and restore state-dependent symbol
   hydration plus the grouping fetch handler;
3. move the single `.levers` node back under `.panel.simple-only`;
4. remove only BUG-004 coordinator/page regressions and canary additions.

No cache purge, storage migration, registry rollback, data rewrite, provider
change, or deployment migration is required. Commit `2f65a02a` remains intact
on both forward and rollback paths.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
|---|---|---|
| Public shared refresh coordinator | Trigger another view-change event from the page | A false navigation event hides owner readiness and invokes unrelated side effects. |
| Cross-invocation generation plus local sequence | Keep only the existing local sequence | Local state resets per invocation and cannot suppress an older invocation. |
| One active plus one latest pending successor | Start every refresh immediately | Concurrent work creates avoidable stale completions and duplicate compute. |
| Boot-time union hydration | Fetch when grouping changes | A lever would perform acquisition, violating FR-B004-07. |
| Dedicated heatmap regression file | Rely on the Scope 15 toggle test | Its Power-to-Simple setup is the masking action that makes cold-open pass. |