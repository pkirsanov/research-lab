# Scopes: BUG-004 Market Heatmap Control Surface

This planning contract reconciles BUG-004 to the approved design. It records no
runtime, deployment, or certification success. Commit `2f65a02a` is an immutable
local prerequisite containing the generic five-control work; whether those bytes
are deployed is unproven and MUST NOT be inferred from local ancestry.

## Execution Outline

### Phase Order

1. **SCOPE-01 - Restore automatic Simple readiness and both control surfaces:**
    adopt the concurrent patch surgically, complete only missing approved behavior,
    and validate one end-to-end heatmap outcome across the shared bridge and page.
2. Establish immutable RED provenance before implementation acceptance without
    stashing, resetting, reverting, or overwriting the active concurrent tree.
3. Validate shared coordinator canaries before page/browser acceptance: exact
   title selection, tool/mode filtering, bounded coalescing, immediate accepted-
   refresh generation invalidation, stale-control inertness, exact promise
   settlement, authority boundaries, parity, and Brief exclusion.
4. Validate page integration next: one boot-time union hydration, one terminal
    refresh request, local-only lever recomputation, and relocation of the single
    existing native control node into the existing Power Map panel.
5. Validate direct Simple and direct Power independently, then run existing
    bridge/wiring regressions, broad selftest, regression-quality, and rollback proof.

### New Types And Signatures

- `RLEXPERIENCE.requestSimpleRefresh({ toolId }) -> Promise<SimpleProjection | null>`
- Coordinator commit identity: `(generation, runSequence)`
- Coordinator capacity: one active run plus one latest pending successor
- Existing `renderSimpleBridge(options)` remains callable for current harnesses
- No registry, adapter, provider, cache, persistence, route, or schema signature changes

### Validation Checkpoints

- **Checkpoint 1 - RED provenance:** direct-Simple, immutable five-control
   baseline, and direct-Power defects are observed before patch acceptance.
- **Checkpoint 2 - shared canaries:** each focused coordinator command echoes
   its exact top-level title and reports one discovered test; coordinator unit
   and executable-source canaries pass before any browser result is interpreted.
- **Checkpoint 3 - behavior:** direct-Simple and direct-Power regressions prove
   user-visible outcomes without a masking mode toggle or request interception.
- **Checkpoint 4 - compatibility:** existing bridge, `2f65a02a` wiring, broad
   selftest, and regression-quality contracts remain green.
- **Checkpoint 5 - rollback:** BUG-004 additions can be removed while retaining
   `2f65a02a`; no data, cache, provider, registry, or deployment rollback exists.

## Scope Inventory

| Scope | Outcome | Surfaces | Status |
|---|---|---|---|
| SCOPE-01 | Direct Simple requalifies and both views remain steerable without refetch | shared bridge, heatmap page, focused tests, selftest canaries | Done |

## Finding Coverage

The original F-BUG004 findings remain represented by their recorded evidence.
The four reopened gaps are resolved in the current runtime/test/docs record;
certification remains open until the routed evidence repair and mandatory
validate/audit phases complete.

| Finding | Planned resolution | Primary scenario |
|---|---|---|
| F-BUG004-A | Direct Simple automatically requalifies after terminal owner hydration | SCN-B004-A |
| F-BUG004-B | Preserve `2f65a02a` and prove all five production Simple controls; deployment remains unproven | SCN-B004-B |
| F-BUG004-C | Relocate the existing native controls so direct Power exposes and applies them | SCN-B004-C |
| F-BUG004-D | Replace the masking Power-to-Simple setup with a direct-Simple no-toggle discriminator | SCN-B004-A |
| F-BUG004-E | Add direct-Power assertions for visibility, keyboard operation, selected state, output change, and zero refetch | SCN-B004-C |

F-BUG004-F remains `PRESERVED`, not open: the current source/test collision belongs
to another lane and must be integrated without overwrite, reset, stash, or revert.

- **GAP-BUG004-001:** Exact top-level coordinator titles and fail-closed
   file-wrapper selection are represented by TP-B004-01 through TP-B004-04.
- **GAP-BUG004-002:** Immediate generation claims, stale-control inertness,
   latest-pending replacement, and exact promise settlement are represented by
   SCN-B004-D and TP-B004-01 through TP-B004-04.
- **GAP-BUG004-003:** Native Power selected semantics and computed visible focus
   treatment are represented by SCN-B004-C and TP-B004-08.
- **GAP-BUG004-004:** The docs-owned canonical heatmap note is represented by
   its recorded documentation evidence; planning does not edit that note.

## SCOPE-01 - Restore Automatic Simple Readiness And Both Control Surfaces

- **Status:** Done
- **Depends On:** none
- **Owner agent:** `bubbles.implement` after `bubbles.design` and `bubbles.plan` approval
- **Change class:** shared bridge lifecycle plus one page-local control relocation
- **Capability role:** bugfix overlay on the existing production Simple bridge foundation

### Gherkin Scenarios

```gherkin
Scenario: SCN-B004-A Direct Simple cold-open requalifies after owner hydration
  Given a fresh browser opens market-heatmap-lab directly in Simple
  And no shell mode control is clicked
  And the initial owner evidence is insufficient for a breadth result
   When the real boot hydration reaches its terminal ready marker with 135 priced constituents
  Then the Simple panel automatically changes from unavailable to ready
  And the adapter is simple-adapter/market-breadth/v1
  And the current shell view remains Simple

Scenario: SCN-B004-B Ready Simple applies all five production registry controls
   Given the direct cold-open Simple panel is ready from the current owner snapshot
   When window, grouping, size-metric, breadth-threshold, and outlier-sigma are each actuated within their declared domains
   Then every control has its registry-declared accessible name and domain
   And each actuation changes the production projection over the already-loaded owner snapshot
   And the rendered result equals the production runtime result for the same inputs
  And no data request is emitted

Scenario: SCN-B004-C Direct Power applies the existing native treemap controls
  Given a fresh browser opens market-heatmap-lab directly in Power
   When real boot hydration settles
   Then winSeg, sizeSeg, and grpSeg are visible inside the existing Map panel
  And each control is keyboard-operable
    And every button exposes `aria-pressed="true|false"` with exactly one selected button per group
    And keyboard focus matches `:focus-visible` and paints a non-transparent outline at least 2 CSS pixels wide in every group
    And each actuation moves `aria-pressed="true"` to the target, clears it from the former selection, and updates its owned treemap or table interpretation
  And no data request is emitted

Scenario: SCN-B004-D Shared refresh and owner reuse are bounded and latest-result-wins
  Given two wired ordinary tools and asynchronous Simple preparations
   And the current generation has rendered controls while one Simple run is active
  And boot hydration loaded the deduplicated union required by sector and constituent grouping
   When two newer owner refreshes are accepted before the active run settles
  And Simple or Power actuates a lever after hydration
   Then only the exact current tool in the current Simple view reads its provider
   And duplicate pre-start requests coalesce into one run
    And each accepted owner refresh claims a newer generation before returning its promise
    And the active old generation becomes stale immediately and its rendered controls are inert
    And one active run retains only the latest pending successor while the replaced successor resolves null
    And stale active, ready, and unavailable completions resolve null without mutating the newest panel
    And the latest successor reads the provider when it starts and resolves the current ready or unavailable projection
    And every rejected, cancelled, replaced, stale, current-failure, and latest-successor promise settles without hanging
   And current-generation controls remain ordered by runSequence
  And every lever recomputes from the same owner evidence without fetchDelta, ensureBars, fetch, or providerFetch
  And no second cache, provider, adapter, or page-specific Simple model is used
```

### UI Scenario Matrix

| Scenario | Preconditions | Steps | User-visible expected result | Exact persistent title |
|---|---|---|---|---|
| SCN-B004-A / F-BUG004-D | Fresh context; default Simple; cold owner state; request observation only | Open heatmap, click no mode control, observe unavailable, wait for terminal hydration | Same Simple view becomes ready with `simple-adapter/market-breadth/v1` | `BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change` |
| SCN-B004-B | SCN-B004-A ready state | Keyboard-actuate all five registry-derived controls across changed domain values | Accessible selected/input state and production projection change for each control; request ledger stays empty | `BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests` |
| SCN-B004-C / GAP-BUG004-003 | Fresh context opened directly in Power | Wait for terminal hydration; keyboard-actuate `winSeg`, `sizeSeg`, and `grpSeg` | One `aria-pressed="true"` per group; target gains and former selection loses it; focused target matches `:focus-visible` with a visible >=2px outline; owned output and treemap change; request ledger stays empty | `BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests` |
| SCN-B004-D / GAP-BUG004-001..002 | Shared bridge unit harness with an active run, old controls, and two accepted successors | Exercise rejected contexts, same-turn duplicates, accepted mid-run B then C, stale control actuation, stale ready/failure, current failure, and view invalidation | Exact title is discovered; accepted B/C claim generations immediately; old controls are inert; B and stale work resolve null; only C may resolve current truth; no promise hangs | Exact top-level titles in TP-B004-01 through TP-B004-04 |

### RED-First Sequence

1. Record the collision-sensitive status for `rlexperience.js`,
   `market-heatmap-lab.html`, and
   `tests/market-heatmap-control-surface.spec.mjs`; treat current edits as another
   lane's work and never manufacture RED by altering the shared tree.
2. Finalize the three exact persistent browser titles before accepting source
   behavior. Split the current combined SCN-B004-A/B test so SCN-B004-B actuates
   every declared control, not only `window`.
3. Run the SCN-B004-A and SCN-B004-C assertions from an isolated immutable
   checkout at `2f65a02a`. They must fail for absent automatic requalification
   and hidden Power controls, respectively.
4. Run the SCN-B004-B assertion from an isolated immutable checkout at discovery
   revision `31ea9942`, where the generic control renderer is absent. This is
   immutable source RED only and does not establish current deployment state.
5. Run the same three assertions against the active concurrent tree before
   adding implementation edits. Record actual outcomes without reclassifying a
   pre-existing green patch result as RED provenance.
6. Preserve the immutable RED output, adopt working concurrent code, and add only
   missing approved behavior. The active worktree and index are never stashed,
   reset, reverted, or overwritten to produce evidence.
7. Before any GAP-BUG004-002 source edit, add the four exact top-level
   TP-B004-01..04 declarations. Run the current false-green title audit as RED,
   then run each focused command and require its exact title plus one discovered
   test; file-wrapper-only output is a failed non-vacuity gate even with exit 0.
8. Exercise accepted refresh B then C against the current coordinator before
   repair. The adversarial RED must show that generation does not advance at
   acceptance, the prior controls can still actuate, or the pending successor is
   joined instead of replaced; setup, discovery, or timeout failures are invalid RED.
9. Strengthen TP-B004-08 before the accessibility source edit. Its RED must reach
   all three visible groups and fail on missing semantic selected state or missing
   computed focus-visible outline, while retaining output, pixel, and no-refetch
   assertions.

### Implementation Plan

1. Re-read the active diff and `2f65a02a`; adopt working concurrent changes and
   implement only missing approved behavior. Preserve registry-derived controls,
   local recompute, focus restoration, and request-observer assertions.
2. `bubbles.test` adds the four exact top-level coordinator tests and strengthens
   TP-B004-08 first. Keep
   direct-Simple and direct-Power setup independent; prohibit a Power-to-Simple
   toggle, synthetic view event, request interception, service worker, optional
   assertion, or bailout return. No production source changes before valid RED.
3. Add `RLEXPERIENCE.requestSimpleRefresh({ toolId })` as the only page-facing
   refresh API. Keep `renderSimpleBridge(options)` available to existing harnesses.
4. Route view-driven and page-driven refreshes through one coordinator. Every
   accepted request claims its generation synchronously before the method returns.
   Pre-start duplicates share one scheduled promise; while active, each later
   accepted request replaces the prior pending successor, resolves that replaced
   promise to `null`, and leaves at most one latest successor.
5. Pass the acceptance-time generation into the run without minting another at
   start. Invalidate the active run and disable/inert its old controls immediately;
   stale control events perform no claim, prepare, or panel mutation. Guard honest
   unavailable, ready, controls, and focus restoration. Rejected/cancelled/replaced/
   stale promises resolve `null`; current failure resolves honest `unavailable`;
   only the latest current successor resolves its projection. Every path settles.
6. Build one deduplicated boot symbol union for both grouping modes. Complete one
   hydration cycle, render, set the terminal marker, then issue exactly one
   `requestSimpleRefresh({ toolId: "market-heatmap-lab" })` request.
7. Remove acquisition from every lever handler. The current concurrent Power
   regression's explicit `grpSeg` request-ledger exclusion must be deleted after
   union hydration makes grouping local-only; all five Simple controls and all
   three Power controls must prove zero requests.
8. Move the single existing `.levers` node into the existing Power Map panel.
   Leave only the legacy verdict in `.simple-only`; do not clone IDs or panels.
   Synchronize `aria-pressed` on every native segmented button and add the local
   project-standard `:focus-visible` outline without replacing the `.on` styling.
9. Run checkpoints in order. Stop on a shared-canary failure before interpreting
   browser output, then prove rollback and route certification to `bubbles.validate`.

### Implementation Files

- `rlexperience.js`
- `market-heatmap-lab.html`
- `tests/simple-production-bridge.unit.mjs`
- `tests/market-heatmap-control-surface.spec.mjs`
- `tests/simple-production-wiring.spec.mjs`
- `scripts/selftest.mjs`

### Consumer Impact Sweep

No public route, path, control identifier, event name, generated client, or
contract is renamed or removed by BUG-004. The required first-party consumer
inventory is nevertheless explicit because the repair changes observable public
API, event, control, and route behavior:

- **Public bridge API consumers:** `market-heatmap-lab.html`, the production
   bridge unit/integration harnesses, and the wiring/browser regressions consume
   `RLEXPERIENCE.requestSimpleRefresh({ toolId })`; existing
   `renderSimpleBridge(options)` callers remain supported.
- **Event consumers:** the owner terminal-ready marker triggers one page refresh;
   `rlviews.js::applyVisual()` remains the sole view/focus-class authority, and
   stale-generation control events remain inert.
- **Control consumers:** all five registry-derived Simple controls and the
   existing `#winSeg`, `#sizeSeg`, and `#grpSeg` Power groups retain their IDs,
   accessible names, domains, keyboard behavior, and no-request contract.
- **Route and navigation consumers:** the canonical
   `market-heatmap-lab.html` tool route/deep link remains unchanged; no navigation
   link, breadcrumb, redirect, route alias, or external URL requires migration.
- **Contract and documentation consumers:** `simple-models.json`, the market
   structure adapter, generated-client surfaces, config, and schemas are unchanged;
   the docs-owned heatmap note consumes the resulting behavior description only.
- **Stale-reference conclusion:** because no identifier is renamed or removed,
   there is no old-form caller to migrate or compatibility alias to contract.

### Shared Infrastructure Impact Sweep

`rlexperience.js` is a protected high-fan-out bridge used by every wired ordinary
tool. The implementer must inventory and preserve these contracts before broad
validation:

- registry-to-provider-to-adapter parity for every wired ordinary tool;
- `renderSimpleBridge(options)` compatibility for current unit/integration harnesses;
- `rlviews.js::applyVisual()` sole ownership of `body.rlv-focused`;
- no refresh participation by Brief-only `market-brief`;
- no network, provider acquisition, storage, cookie, beacon, publication, or
  author authority in coordinator/bridge executable source;
- honest unavailable behavior for current insufficient evidence;
- focus restoration and all five registry-derived controls from `2f65a02a`;
- exact current tool and current Simple mode filtering;
- one provider read for coalesced pre-start duplicates;
- one active run plus only the latest pending successor;
- stale ready and stale failure suppression across generations.
- acceptance-time generation claims, inert stale controls, replaced-successor
   cancellation, and bounded settlement of every returned promise;

TP-B004-01 through TP-B004-05 are the independent canary gate. They run before
the dedicated browser regressions and before the final broad selftest rerun.

### Change Boundary

**Allowed file families:**

- `rlexperience.js` - surgical coordinator and commit-guard integration only;
- `market-heatmap-lab.html` - union hydration, one terminal refresh, local-only
   lever handlers, and relocation of the existing lever node;
- `tests/simple-production-bridge.unit.mjs` - coordinator canaries;
- `tests/market-heatmap-control-surface.spec.mjs` - dedicated persistent browser regressions;
- `scripts/selftest.mjs` - additions inside the existing production-bridge canary block;
- `tests/simple-production-wiring.spec.mjs` only when collision coordination is
   explicit and the `2f65a02a` assertions remain intact.

**Excluded file families:**

- `rlviews.js`, `rlapp.js`, `rldata.js`, `simple-models.json`, registry data, and
   `rlexperience-adapters/market-structure.js`;
- alternate providers, caches, adapters, formulas, service workers, request
   interception, dependencies, package manifests, routes, schemas, and migrations;
- Feature 012 parent artifacts, unrelated specs, and all certification fields;
- unrelated cleanup or formatting in any collision-sensitive file.
- `notes/market-heatmap-lab.md` during implementation/test; it is docs-owned and
   may be edited only by `bubbles.docs` after runtime and test remediation.

Any controlling-path requirement outside this boundary is routed to the owning
planner before implementation expands.

### Test Plan

Every browser row uses request observation only. No row may install request
interception or a service worker. Executors enforce a 600-second limit per
focused command and 1200 seconds for `scripts/selftest.mjs` without changing the
canonical command recorded below.

| ID | Test Type | Category | Scenarios | File / Location | Exact Behavior / Persistent Title | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-B004-01 | Coordinator rejection/invalidation canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | Exact top-level title `TP-B004-01 requestSimpleRefresh rejects non-current contexts and settles invalidated queued work`; wrong-tool, absent-registration, non-ordinary, non-Simple, Brief, and leaving-Simple paths resolve `null`, read no provider, paint nothing, and never hang | `node --test --test-name-pattern="^TP-B004-01 requestSimpleRefresh rejects non-current contexts and settles invalidated queued work$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-02 | Coordinator coalescing/latest-pending canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | Exact top-level title `TP-B004-02 requestSimpleRefresh coalesces same-turn duplicates and replaces the pending successor`; pre-start duplicates share one run/read, active B then C leaves only C pending, and replaced B resolves `null` | `node --test --test-name-pattern="^TP-B004-02 requestSimpleRefresh coalesces same-turn duplicates and replaces the pending successor$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-03 | Accepted-generation and stale-control canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | Exact top-level title `TP-B004-03 accepted mid-run refresh immediately invalidates active generation and stale controls`; accepted B/C claim generations synchronously, old controls are disabled/inert, stale actuation performs no run or paint, active A resolves `null`, and latest C reads the provider at start | `node --test --test-name-pattern="^TP-B004-03 accepted mid-run refresh immediately invalidates active generation and stale controls$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-04 | Exact completion/failure settlement canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | Exact top-level title `TP-B004-04 current and stale refresh promises settle without overwriting current truth`; current failure resolves and paints honest `unavailable`, stale ready/failure resolve `null` without paint, cancelled/replaced/stale promises settle `null`, and the latest current successor resolves its projection | `node --test --test-name-pattern="^TP-B004-04 current and stale refresh promises settle without overwriting current truth$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-05 | Canary: shared-infrastructure and high-fan-out executable-source parity | `unit` | SCN-B004-D | `scripts/selftest.mjs` | Existing production-bridge block proves public/low-level API coexistence, forbidden-authority absence, wired-tool parity, no heatmap-only branch, and Brief exclusion before browser acceptance | `node scripts/selftest.mjs` | No |
| TP-B004-06 | Adversarial Regression E2E - direct Simple readiness | `e2e-ui` | SCN-B004-A | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-A: direct Simple" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
| TP-B004-07 | Adversarial Regression E2E - all five Simple controls | `e2e-ui` | SCN-B004-B, SCN-B004-D | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
| TP-B004-08 | Adversarial Regression E2E - accessible direct Power controls | `e2e-ui` | SCN-B004-C, SCN-B004-D | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests`; for all three groups require exactly one `aria-pressed="true"`, false on every alternative, semantic movement after Enter, `:focus-visible`, computed non-transparent >=2px outline, owned-output and treemap change, and zero requests | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-C: direct Power" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
| TP-B004-09 | Production bridge integration sweep | `integration` | SCN-B004-A, SCN-B004-D | `tests/simple-production-bridge.integration.mjs` | Existing registry-derived runtime, panel, owner-parity, explicit-runtime parity, and honest-unavailable tests remain green | `node --test tests/simple-production-bridge.integration.mjs` | No - real production modules in deterministic Node integration harness |
| TP-B004-10 | Protected control-wiring regression sweep | `e2e-ui` | SCN-B004-B, SCN-B004-D | `tests/simple-production-wiring.spec.mjs` | Existing `2f65a02a` registry controls, production recompute, focus restoration, all-wired-tool parity, and no-refetch assertions remain intact | `npx --no-install playwright test tests/simple-production-wiring.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=list` | Yes - real local pages and same-origin static server |
| TP-B004-11 | Regression and bailout quality | `functional` | SCN-B004-A, SCN-B004-B, SCN-B004-C | `tests/market-heatmap-control-surface.spec.mjs` | Reject mode-toggle masking, interception, service workers, skip/only/todo, failure-condition returns, optional assertions, grouping request exemptions, and tests that actuate fewer than all declared controls | `bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/market-heatmap-control-surface.spec.mjs` | No |

### Test Applicability

| Category | Applicability |
|---|---|
| unit | Required for coordinator races/filtering and the executable-source/parity canary |
| functional | Required for adversarial regression-quality enforcement |
| integration | Required for production registry/provider/adapter/runtime parity |
| ui-unit | Not applicable: the control surfaces are production inline-page and shared-shell behavior, not component-framework units |
| e2e-api | Not applicable: no service API, route, or transport contract changes |
| e2e-ui | Required for direct-Simple and direct-Power user-visible behavior plus protected `2f65a02a` wiring |
| stress | Not applicable: no latency, throughput, response-time, or SLO threshold is introduced |
| load | Not applicable: boot union capacity and provider throughput are unchanged |

### Rollback And Restore Proof

Before completion, the implementation report must classify the exact BUG-004
diff and show that its inverse has this bounded effect:

1. remove only the public coordinator and cross-invocation commit guard while
   retaining `2f65a02a` generic controls and low-level bridge compatibility;
2. remove the single heatmap terminal refresh call, restore the prior grouping
   acquisition path, and move the same lever node back beneath the legacy panel;
3. remove only BUG-004-specific regression/canary additions;
4. require no cache purge, storage rewrite, registry rollback, provider change,
   data migration, package change, deployment migration, or secret operation.

Rollback proof is structural and test-backed: the protected `2f65a02a` wiring
suite must remain present on the forward path, and final changed-path
classification must contain no excluded family.

### Documentation Handoff

`notes/market-heatmap-lab.md` is owned by `bubbles.docs`; planning and runtime
owners do not edit it. After implementation and exact test evidence, the docs
phase must make that note one current truth:

- retain one unambiguous current `LIVE` status and remove the contradictory
   proposed/not-built text and obsolete promotion checklist;
- document all five Simple registry controls: `window`, `grouping`,
   `size-metric`, `breadth-threshold`, and `outlier-sigma`;
- document the three Power native groups `#winSeg`, `#sizeSeg`, and `#grpSeg`
   beside the treemap and diagnostics, including semantic selected state and
   visible keyboard focus;
- state that direct Simple may begin honestly `unavailable`, automatically
   requalifies after terminal owner hydration, and remains unavailable when the
   settled evidence is genuinely insufficient;
- state that one boot-hydrated owner union feeds both views and every Simple or
   Power lever recomputes locally with zero post-hydration acquisition; and
- update version history/status wording without claiming deployment evidence
   not produced by the owning deployment phase.

### Definition of Done

Checked items below reference implementation-phase evidence with explicit claim
provenance. Unchecked items retain a specific uncertainty declaration; no scope,
deployment, independent-test, validation, or certification completion is claimed.

#### Core Outcomes

- [x] SCN-B004-A / F-BUG004-A / F-BUG004-D are resolved faithfully: a direct Simple cold-open starts honestly unavailable, clicks no shell mode control, and automatically requalifies to ready when terminal owner hydration reaches 135 priced constituents; the adapter is `simple-adapter/market-breadth/v1`, the shell remains in Simple, and no mode toggle, reload, manual refresh, synthetic view event, interception, or service worker masks the behavior. → Evidence: [TP-B004-06 direct Simple GREEN](report.md#tp-b004-06---direct-simple-a)
- [x] SCN-B004-B / F-BUG004-B are resolved faithfully: direct ready Simple exposes and actuates all five production registry controls (`window`, `grouping`, `size-metric`, `breadth-threshold`, and `outlier-sigma`) within their declared domains; every result matches the production runtime over the same owner snapshot, the post-hydration request ledger remains empty, and `2f65a02a` is preserved without representing local ancestry as deployment evidence. → Evidence: [current TP-B004-07 GREEN](report.md#current-tree-tp-b004-07-green-with-historical-flag-absent), [immutable TP-B004-07 RED](report.md#tp-b004-07---valid-immutable-red-at-31ea9942)
- [x] F-BUG004-C and F-BUG004-E are resolved: direct Power exposes the single existing `#winSeg`, `#sizeSeg`, and `#grpSeg` nodes in Map; exactly one button per group has `aria-pressed="true"`; keyboard actuation moves that semantic selection, paints a non-transparent >=2px `:focus-visible` outline, changes owned output and treemap pixels, and emits no request. → **Scenario:** SCN-B004-C; **Phase:** test; **Claim Source:** executed; Evidence: [TP-B004-08 direct Power Reopened Gaps Independent GREEN](report.md#exact-tp-b004-08-green-and-three-group-structure)
- [x] SCN-B004-D is resolved: accepted owner refreshes claim generations immediately; stale controls are inert; one active run retains only the latest pending successor; replaced, cancelled, stale, current-failure, and latest-successor promises settle exactly; one boot union still supports local-only controls in both views. → **Phase:** implement; **Claim Source:** executed; Evidence: [current gap-remediation coordinator outcome](report.md#scn-b004-d-coordinator-outcome)
- [x] The shared coordinator enforces exact current-tool/current-Simple filtering, acceptance-time generation claims, provider read at run start, immediate stale-control invalidation, one active plus one replaceable latest successor, `(generation, runSequence)` commit authority, and bounded settlement across ready, unavailable, controls, and focus restoration. → **Phase:** implement; **Claim Source:** executed; Evidence: [current focused and full coordinator carriers](report.md#scn-b004-d-coordinator-outcome)
- [x] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns: TP-B004-01 through TP-B004-05 run before browser acceptance and preserve ordinary-tool parity, Brief exclusion, low-level API compatibility, focus ownership, authority boundaries, honest unavailable behavior, and `2f65a02a` controls. → **Phase:** test; **Claim Source:** executed; Evidence: [Reopened Gaps Independent GREEN](report.md#exact-tp-b004-01-through-tp-b004-04-green), [TP-B004-05 broad selftest](report.md#tp-b004-05---broad-selftest)
- [x] Rollback or restore path for shared infrastructure changes is documented and verified: the bounded rollback/restore proof removes only BUG-004 additions and requires no data/cache/provider/registry/dependency/deployment/storage operation. → Evidence: [implementation boundary and rollback audit](report.md#implementation-change-boundary-and-rollback-audit) → **Phase:** implement; **Claim Source:** executed; Final evidence: [Final Change Boundary And Rollback Closeout](report.md#final-change-boundary-and-rollback-closeout)
- [x] Change Boundary is respected and zero excluded file families were changed: only allowed file families participate, and concurrent-lane work is not overwritten, reset, stashed, or reverted. → **Phase:** implement; **Claim Source:** executed; Evidence: [Final Change Boundary And Rollback Closeout](report.md#final-change-boundary-and-rollback-closeout)
- [x] The Consumer Impact Sweep enumerates the public bridge API, owner/view events, all Simple and Power controls, the stable tool route/deep link, navigation/breadcrumb/redirect surfaces, harnesses, docs, config, schemas, and generated-client applicability; zero stale first-party references remain because no identifier is renamed or removed. → **Phase:** plan; **Claim Source:** interpreted; Evidence: [Consumer Impact Sweep](#consumer-impact-sweep)
- [x] GAP-BUG004-004 canonical documentation is aligned by `bubbles.docs` to the current five-control Simple contract, three native Power groups, terminal-readiness semantics, local-only no-refetch behavior, and one truthful delivery status; no unsupported deployment claim is added. → Evidence: [Documentation Gap Closure](report.md#tr-bug004-docs-gap-evidence)

#### Test Evidence - Exact Parity With 11 Test Plan Rows

- [x] TP-B004-01 echoes its exact top-level title and reports `tests 1`, `pass 1`, `fail 0`, and `skipped 0`; rejected contexts and invalidated queued work settle `null` with zero provider reads or panel writes. File-wrapper-only output is failure. → **Phase:** test; **Claim Source:** executed; Evidence: [Reopened Gaps Independent GREEN](report.md#exact-tp-b004-01-through-tp-b004-04-green)
- [x] TP-B004-02 echoes its exact top-level title and reports one passing, zero-skipped test; pre-start duplicates share one run/read, active B then C retains only C, and replaced B settles `null`. File-wrapper-only output is failure. → **Phase:** test; **Claim Source:** executed; Evidence: [Reopened Gaps Independent GREEN](report.md#exact-tp-b004-01-through-tp-b004-04-green)
- [x] TP-B004-03 echoes its exact top-level title and reports one passing, zero-skipped test; accepted B/C claim generations immediately, old controls are inert, stale actuation cannot run or paint, active A settles `null`, and latest C reads the provider at start. File-wrapper-only output is failure. → **Phase:** test; **Claim Source:** executed; Evidence: [Reopened Gaps Independent GREEN](report.md#exact-tp-b004-01-through-tp-b004-04-green)
- [x] TP-B004-04 echoes its exact top-level title and reports one passing, zero-skipped test; current failure resolves honest `unavailable`, stale ready/failure and all cancelled/replaced/stale work resolve `null` without paint, latest current work resolves its projection, and no promise hangs. File-wrapper-only output is failure. → **Phase:** test; **Claim Source:** executed; Evidence: [Reopened Gaps Independent GREEN](report.md#exact-tp-b004-01-through-tp-b004-04-green)
- [x] TP-B004-05 is the explicit shared-infrastructure canary Test Plan/DoD pair and passes the early executable-source authority, public/low-level API compatibility, wired-tool parity, no-heatmap-branch, and Brief canaries before browser acceptance. → Evidence: [TP-B004-05 broad selftest](report.md#tp-b004-05---broad-selftest)
- [x] Scenario-specific E2E regression tests for every new/changed/fixed behavior are persistent: TP-B004-06 protects direct-Simple requalification, TP-B004-07 protects all five Simple controls with owner parity and no requests, and TP-B004-08 protects direct-Power semantics, focus, output, pixels, and no requests. TP-B004-06 records immutable `2f65a02a` RED before active direct-Simple GREEN without leaving Simple. → Evidence: [immutable A RED](report.md#tp-b004-06---valid-immutable-red-at-2f65a02a), [current A GREEN](report.md#tp-b004-06---direct-simple-a), [Simple controls](report.md#surgical-tp-b004-07-reproduction-increment), and [Power controls](report.md#reopened-gaps-independent-green)
- [x] TP-B004-07 records immutable discovery RED for the absent generic renderer without claiming current deployment state, then passes all five Simple controls with production owner parity and an empty request ledger. → Evidence: [immutable TP-B004-07 RED](report.md#tp-b004-07---valid-immutable-red-at-31ea9942), [current TP-B004-07 GREEN](report.md#current-tree-tp-b004-07-green-with-historical-flag-absent)
- [x] TP-B004-08 retains immutable `2f65a02a` visibility RED and adds accessibility RED, then passes all three direct-Power groups with exactly one semantic selection, `aria-pressed` movement, a computed visible focus ring, owned-output and treemap change, and an empty request ledger. → **Scenario:** SCN-B004-C; **Phase:** test; **Claim Source:** executed; Evidence: [immutable C RED](report.md#tp-b004-08---valid-immutable-red-at-2f65a02a), [accessibility RED](report.md#tp-b004-08---direct-power-accessibility-red), and [TP-B004-08 direct Power Reopened Gaps Independent GREEN](report.md#reopened-gaps-independent-green)
- [x] TP-B004-09 passes the existing production bridge registry/runtime/owner-parity/honest-unavailable integration sweep. → Evidence: [TP-B004-09 integration sweep](report.md#tp-b004-09---production-bridge-integration-sweep)
- [x] Broader E2E regression suite passes: TP-B004-10 preserves the protected `2f65a02a` control-wiring and all-wired-tool browser sweep without weakening, deleting, or replacing its assertions. → Evidence: [TP-B004-10 protected wiring sweep](report.md#protected-control-wiring-regression-evidence-tp-b004-10)
- [x] TP-B004-11 accepts all three persistent adversarial regressions and rejects masking mode toggles, request interception, service workers, silent-pass patterns, optional assertions, grouping request exemptions, and incomplete control actuation. → Evidence: [TP-B004-11 regression-quality guard](report.md#tp-b004-11---regression-quality-guard)

#### Build Quality Gate

- [x] Changed JavaScript parses; focused and broad commands finish within executor limits with zero warnings or skips; planning/runtime evidence carries honest claim provenance; Markdown and machine planning artifacts remain synchronized; applicable governance checks pass at the workflow-owned status; all required content is concrete, and no bypass, fabricated claim, hidden incompleteness, or certification self-promotion remains. → Evidence record: [independent test pre-close quality checks](report.md#governance-and-diff-gates) → **Phase:** test; **Claim Source:** executed; Final evidence: [Final Build Quality Evidence Pass](report.md#final-build-quality-evidence-pass)