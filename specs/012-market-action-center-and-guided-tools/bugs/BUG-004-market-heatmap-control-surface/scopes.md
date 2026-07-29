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
    tool/mode filtering, bounded coalescing, generation ordering, honest failure,
    stale suppression, authority boundaries, parity, and Brief exclusion.
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
- **Checkpoint 2 - shared canaries:** coordinator unit and executable-source
   canaries pass before any browser result is interpreted.
- **Checkpoint 3 - behavior:** direct-Simple and direct-Power regressions prove
   user-visible outcomes without a masking mode toggle or request interception.
- **Checkpoint 4 - compatibility:** existing bridge, `2f65a02a` wiring, broad
   selftest, and regression-quality contracts remain green.
- **Checkpoint 5 - rollback:** BUG-004 additions can be removed while retaining
   `2f65a02a`; no data, cache, provider, registry, or deployment rollback exists.

## Scope Inventory

| Scope | Outcome | Surfaces | Status |
|---|---|---|---|
| SCOPE-01 | Direct Simple requalifies and both views remain steerable without refetch | shared bridge, heatmap page, focused tests, selftest canaries | In Progress (implementation_complete_awaiting_independent_test) |

## Finding Coverage

All five findings remain open until implementation evidence is certified by the
owning agents.

| Finding | Planned resolution | Primary scenario |
|---|---|---|
| F-BUG004-A | Direct Simple automatically requalifies after terminal owner hydration | SCN-B004-A |
| F-BUG004-B | Preserve `2f65a02a` and prove all five production Simple controls; deployment remains unproven | SCN-B004-B |
| F-BUG004-C | Relocate the existing native controls so direct Power exposes and applies them | SCN-B004-C |
| F-BUG004-D | Replace the masking Power-to-Simple setup with a direct-Simple no-toggle discriminator | SCN-B004-A |
| F-BUG004-E | Add direct-Power assertions for visibility, keyboard operation, selected state, output change, and zero refetch | SCN-B004-C |

F-BUG004-F remains `PRESERVED`, not open: the current source/test collision belongs
to another lane and must be integrated without overwrite, reset, stash, or revert.

## SCOPE-01 - Restore Automatic Simple Readiness And Both Control Surfaces

- **Status:** In Progress (implementation_complete_awaiting_independent_test)
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
   And each actuation updates selected state and its owned treemap or table interpretation
  And no data request is emitted

Scenario: SCN-B004-D Shared refresh and owner reuse are bounded and latest-result-wins
  Given two wired ordinary tools and asynchronous Simple preparations
  And boot hydration loaded the deduplicated union required by sector and constituent grouping
  When refresh requests overlap across view and owner-state generations
  And Simple or Power actuates a lever after hydration
   Then only the exact current tool in the current Simple view reads its provider
   And duplicate pre-start requests coalesce into one run
   And one active run retains only the latest pending successor
   And a stale ready or unavailable completion cannot mutate the newest panel
   And current-generation controls remain ordered by runSequence
  And every lever recomputes from the same owner evidence without fetchDelta, ensureBars, fetch, or providerFetch
  And no second cache, provider, adapter, or page-specific Simple model is used
```

### UI Scenario Matrix

| Scenario | Preconditions | Steps | User-visible expected result | Exact persistent title |
|---|---|---|---|---|
| SCN-B004-A / F-BUG004-D | Fresh context; default Simple; cold owner state; request observation only | Open heatmap, click no mode control, observe unavailable, wait for terminal hydration | Same Simple view becomes ready with `simple-adapter/market-breadth/v1` | `BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change` |
| SCN-B004-B | SCN-B004-A ready state | Keyboard-actuate all five registry-derived controls across changed domain values | Accessible selected/input state and production projection change for each control; request ledger stays empty | `BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests` |
| SCN-B004-C / F-BUG004-E | Fresh context opened directly in Power | Wait for terminal hydration; keyboard-actuate `winSeg`, `sizeSeg`, and `grpSeg` | Existing controls have layout boxes in Map; selected state and owned treemap/table interpretation change; request ledger stays empty | `BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests` |
| SCN-B004-D | Shared bridge unit harness plus either settled UI view | Exercise wrong-tool, wrong-mode, duplicate, pending-successor, stale-ready, stale-failure, and every lever category | Only current work commits; controls reuse the one boot-hydrated owner union | Exact unit titles in TP-B004-01 through TP-B004-04 plus the three browser titles above |

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
   historical source RED only and does not establish current deployment state.
5. Run the same three assertions against the active concurrent tree before
   adding implementation edits. Record actual outcomes without reclassifying a
   pre-existing green patch result as RED provenance.
6. Preserve the immutable RED output, adopt working concurrent code, and add only
   missing approved behavior. The active worktree and index are never stashed,
   reset, reverted, or overwritten to produce evidence.

### Implementation Plan

1. Re-read the active diff and `2f65a02a`; adopt working concurrent changes and
   implement only missing approved behavior. Preserve registry-derived controls,
   local recompute, focus restoration, and request-observer assertions.
2. Finalize persistent tests first with the exact titles above. Keep
   direct-Simple and direct-Power setup independent; prohibit a Power-to-Simple
   toggle, synthetic view event, request interception, service worker, optional
   assertion, or bailout return.
3. Add `RLEXPERIENCE.requestSimpleRefresh({ toolId })` as the only page-facing
   refresh API. Keep `renderSimpleBridge(options)` available to existing harnesses.
4. Route view-driven and page-driven refreshes through one coordinator. Enforce
   exact current-tool/current-Simple filtering, one active plus one latest pending
   successor, provider read at run start, and `(generation, runSequence)` commits.
5. Guard every panel mutation path: honest unavailable, ready output, controls,
   and focus restoration. Leaving Simple invalidates active and pending work.
6. Build one deduplicated boot symbol union for both grouping modes. Complete one
   hydration cycle, render, set the terminal marker, then issue exactly one
   `requestSimpleRefresh({ toolId: "market-heatmap-lab" })` request.
7. Remove acquisition from every lever handler. The current concurrent Power
   regression's explicit `grpSeg` request-ledger exclusion must be deleted after
   union hydration makes grouping local-only; all five Simple controls and all
   three Power controls must prove zero requests.
8. Move the single existing `.levers` node into the existing Power Map panel.
   Leave only the legacy verdict in `.simple-only`; do not clone IDs or panels.
9. Run checkpoints in order. Stop on a shared-canary failure before interpreting
   browser output, then prove rollback and route certification to `bubbles.validate`.

### Implementation Files

- `rlexperience.js`
- `market-heatmap-lab.html`
- `tests/simple-production-bridge.unit.mjs`
- `tests/market-heatmap-control-surface.spec.mjs`
- `tests/simple-production-wiring.spec.mjs`
- `scripts/selftest.mjs`

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

TP-B004-01 through TP-B004-05 are the independent canary gate. They run before
the dedicated browser regressions and before the final broad selftest rerun.

### Change Boundary

**Allowed implementation paths:**

- `rlexperience.js` - surgical coordinator and commit-guard integration only;
- `market-heatmap-lab.html` - union hydration, one terminal refresh, local-only
   lever handlers, and relocation of the existing lever node;
- `tests/simple-production-bridge.unit.mjs` - coordinator canaries;
- `tests/market-heatmap-control-surface.spec.mjs` - dedicated persistent browser regressions;
- `scripts/selftest.mjs` - additions inside the existing production-bridge canary block;
- `tests/simple-production-wiring.spec.mjs` only when collision coordination is
   explicit and the `2f65a02a` assertions remain intact.

**Excluded paths:**

- `rlviews.js`, `rlapp.js`, `rldata.js`, `simple-models.json`, registry data, and
   `rlexperience-adapters/market-structure.js`;
- alternate providers, caches, adapters, formulas, service workers, request
   interception, dependencies, package manifests, routes, schemas, and migrations;
- Feature 012 parent artifacts, unrelated specs, and all certification fields;
- unrelated cleanup or formatting in any collision-sensitive file.

Any controlling-path requirement outside this boundary is routed to the owning
planner before implementation expands.

### Test Plan

Every browser row uses request observation only. No row may install request
interception or a service worker. Executors enforce a 600-second limit per
focused command and 1200 seconds for `scripts/selftest.mjs` without changing the
canonical command recorded below.

| ID | Test Type | Category | Scenarios | File / Location | Exact Behavior / Persistent Title | Command | Live System |
|---|---|---|---|---|---|---|---|
| TP-B004-01 | Coordinator filter canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | `requestSimpleRefresh filters wrong tool, non-Simple, non-ordinary, and invalidates work when leaving Simple` | `node --test --test-name-pattern="^requestSimpleRefresh filters wrong tool, non-Simple, non-ordinary, and invalidates work when leaving Simple$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-02 | Coordinator coalescing canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | `requestSimpleRefresh coalesces pre-start duplicates and retains only the latest pending successor` | `node --test --test-name-pattern="^requestSimpleRefresh coalesces pre-start duplicates and retains only the latest pending successor$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-03 | Coordinator commit-order canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | `requestSimpleRefresh commits only the latest generation and preserves current-generation control ordering` | `node --test --test-name-pattern="^requestSimpleRefresh commits only the latest generation and preserves current-generation control ordering$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-04 | Coordinator failure-honesty canary | `unit` | SCN-B004-D | `tests/simple-production-bridge.unit.mjs` | `requestSimpleRefresh renders current failure unavailable and suppresses stale failure` | `node --test --test-name-pattern="^requestSimpleRefresh renders current failure unavailable and suppresses stale failure$" tests/simple-production-bridge.unit.mjs` | No |
| TP-B004-05 | High-fan-out executable-source and parity canary | `unit` | SCN-B004-D | `scripts/selftest.mjs` | Existing production-bridge block proves public/low-level API coexistence, forbidden-authority absence, wired-tool parity, no heatmap-only branch, and Brief exclusion before browser acceptance | `node scripts/selftest.mjs` | No |
| TP-B004-06 | Adversarial Regression E2E - direct Simple readiness | `e2e-ui` | SCN-B004-A | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-A: direct Simple" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
| TP-B004-07 | Adversarial Regression E2E - all five Simple controls | `e2e-ui` | SCN-B004-B, SCN-B004-D | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
| TP-B004-08 | Adversarial Regression E2E - direct Power controls | `e2e-ui` | SCN-B004-C, SCN-B004-D | `tests/market-heatmap-control-surface.spec.mjs` | `BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-C: direct Power" --reporter=list` | Yes - real local page and same-origin static server; request observation only |
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

### Definition of Done

Checked items below reference implementation-phase evidence with explicit claim
provenance. Unchecked items retain a specific uncertainty declaration; no scope,
deployment, independent-test, validation, or certification completion is claimed.

#### Core Outcomes

- [x] F-BUG004-A and F-BUG004-D are resolved: direct Simple requalifies after terminal hydration without a mode toggle, reload, manual refresh, synthetic view event, interception, or service worker. → Evidence: [TP-B004-06 direct Simple GREEN](report.md#tp-b004-06---direct-simple-a)
- [x] F-BUG004-B is resolved: direct ready Simple exposes and applies all five registry controls over the production owner snapshot while preserving `2f65a02a`; local ancestry is not represented as deployment evidence. → Evidence: [surgical TP-B004-07 RED→GREEN](report.md#surgical-tp-b004-07-reproduction-increment)
- [x] F-BUG004-C and F-BUG004-E are resolved: direct Power exposes the single existing `#winSeg`, `#sizeSeg`, and `#grpSeg` nodes in Map, and keyboard actuation changes selected state and owned output. → Evidence: [TP-B004-08 direct Power GREEN](report.md#tp-b004-08---direct-power-c)
- [x] SCN-B004-D is resolved: one boot union supports both grouping modes; all five Simple controls and all three Power controls recompute from shared owner evidence with zero post-hydration acquisition. → Evidence: [TP-B004-06..08 current-tree outcomes](report.md#current-tree-implementation-evidence-tp-b004-0608)
- [x] The shared coordinator enforces exact current-tool/current-Simple filtering, one active plus one latest pending successor, provider read at run start, and `(generation, runSequence)` commit authority across ready, unavailable, controls, and focus restoration. → Evidence: [TP-B004-01..04 coordinator canaries](report.md#tp-b004-0104---coordinator-canaries)
- [x] The Shared Infrastructure Impact Sweep passes before browser acceptance, preserving ordinary-tool parity, Brief exclusion, low-level API compatibility, focus ownership, authority boundaries, honest unavailable behavior, and `2f65a02a` controls. → Evidence: [TP-B004-05 broad selftest](report.md#tp-b004-05---broad-selftest)
- [x] The Change Boundary and Rollback And Restore Proof are satisfied with zero excluded-family changes, no concurrent-lane overwrite/reset/stash/revert, and no data/cache/provider/registry/dependency/deployment/storage operation. → Evidence: [implementation boundary and rollback audit](report.md#implementation-change-boundary-and-rollback-audit)

#### Test Evidence - Exact Parity With 11 Test Plan Rows

- [x] TP-B004-01 passes exact wrong-tool, non-Simple, non-ordinary, leaving-Simple invalidation, zero-provider-read, zero-panel-write, and Brief-exclusion assertions. → Evidence: [TP-B004-01..04 coordinator canaries](report.md#tp-b004-0104---coordinator-canaries)
- [x] TP-B004-02 passes pre-start duplicate coalescing and one-active/one-latest-pending behavior. → Evidence: [TP-B004-01..04 coordinator canaries](report.md#tp-b004-0104---coordinator-canaries)
- [x] TP-B004-03 passes stale-generation suppression and current-generation `runSequence` ordering. → Evidence: [TP-B004-01..04 coordinator canaries](report.md#tp-b004-0104---coordinator-canaries)
- [x] TP-B004-04 passes honest current failure rendering and stale-failure suppression. → Evidence: [TP-B004-01..04 coordinator canaries](report.md#tp-b004-0104---coordinator-canaries)
- [x] TP-B004-05 passes the early executable-source authority, public/low-level API compatibility, wired-tool parity, no-heatmap-branch, and Brief canaries. → Evidence: [TP-B004-05 broad selftest](report.md#tp-b004-05---broad-selftest)
- [x] TP-B004-06 records immutable `2f65a02a` RED for absent automatic requalification, then passes direct-Simple GREEN in the active implementation without leaving Simple. → Evidence: [immutable A RED](report.md#tp-b004-06---valid-immutable-red-at-2f65a02a) and [current A GREEN](report.md#tp-b004-06---direct-simple-a)
- [x] TP-B004-07 records immutable discovery RED for the absent generic renderer without claiming current deployment state, then passes all five Simple controls with production owner parity and an empty request ledger. → Evidence: [surgical B RED→GREEN](report.md#surgical-tp-b004-07-reproduction-increment)
- [x] TP-B004-08 records immutable `2f65a02a` RED for hidden native controls, then passes all three direct-Power controls, including grouping, with keyboard operation, visible output changes, and an empty request ledger. → Evidence: [immutable C RED](report.md#tp-b004-08---valid-immutable-red-at-2f65a02a) and [current C GREEN](report.md#tp-b004-08---direct-power-c)
- [x] TP-B004-09 passes the existing production bridge registry/runtime/owner-parity/honest-unavailable integration sweep. → Evidence: [TP-B004-09 integration sweep](report.md#tp-b004-09---production-bridge-integration-sweep)
- [x] TP-B004-10 passes the protected `2f65a02a` control-wiring and all-wired-tool browser sweep without weakening, deleting, or replacing its assertions. → Evidence: [TP-B004-10 protected wiring sweep](report.md#protected-control-wiring-regression-evidence-tp-b004-10)
- [x] TP-B004-11 accepts all three persistent adversarial regressions and rejects masking mode toggles, request interception, service workers, silent-pass patterns, optional assertions, grouping request exemptions, and incomplete control actuation. → Evidence: [TP-B004-11 regression-quality guard](report.md#tp-b004-11---regression-quality-guard)

#### Build Quality Gate

- [ ] Changed JavaScript parses; focused and broad commands finish within executor limits with zero warnings or skips; planning/runtime evidence carries honest claim provenance; Markdown and machine planning artifacts remain synchronized; applicable governance checks pass at the workflow-owned status; no placeholder, bypass, fabricated claim, hidden incompleteness, or certification self-promotion remains. → Uncertainty: [planning not-run declaration](report.md#planning-uncertainty-declaration)
   > **Uncertainty Declaration**
   > **What was attempted:** touched-JavaScript parse checks, focused artifact lint, implementation-reality scan, current-state transition guard, and regression-quality guard.
   > **What was observed:** parse, artifact lint, and regression quality passed; the reality scan found zero violations but emitted one scope-discovery fallback warning; the transition guard correctly refused terminal promotion while later phases remain open.
   > **Why this is uncertain:** the DoD text requires zero warnings and synchronized planning discovery, which this implementation-owned evidence does not establish.
   > **What would resolve this:** the planning owner must reconcile scanner-visible implementation paths or independent testing must establish that the warning is non-applicable, then rerun the quality checks.