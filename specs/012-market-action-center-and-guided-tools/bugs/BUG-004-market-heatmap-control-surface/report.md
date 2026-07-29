# Report: BUG-004 Market Heatmap Control Surface

Links: [bug.md](bug.md) | [spec.md](spec.md) | [design.md](design.md) | [scopes.md](scopes.md)

## Summary

The six-artifact bug packet is filed. Source, history, deployed-page fetch, and
worktree-boundary evidence support three distinct defects: no cold-open Simple
requalification after asynchronous hydration, no controls in deployed Simple at
discovery, and native controls hidden in Power. The concurrent generic-control
patch was committed as `2f65a02a` during filing; it does not cover the other two
defects. No product source, test, parent artifact, or certification field was
changed by this invocation.

## Completion Statement

Discovery, design, and planning ownership are reconciled. Implementation,
regression execution, deployment verification, full validation, and
certification are not complete and are not claimed. The primary execution route
is `bubbles.implement`; the missing v3 `certification` shape remains a separate
foreign-owned route to `bubbles.validate` and was not filled by planning.

## Findings

| Finding | State | Evidence | Required disposition |
|---|---|---|---|
| F-BUG004-A | Open | Bridge listens to `rlviews:change` only; heatmap hydration reaches `ready` without a bridge refresh. | Add a tool-scoped shared owner-state refresh and latest-result guard. |
| F-BUG004-B | Open | Discovery `HEAD` had no shared control renderer and deployed fetch returned `Simple model unavailable`; concurrent commit `2f65a02a` now adds local controls but deployment/direct-cold-open readiness are unverified. | Preserve `2f65a02a` and retain a persistent five-control deployment/cold-open regression. |
| F-BUG004-C | Open | Native controls are children of `.simple-only`; Power hides that parent. | Relocate the native lever container outside the Power-hidden block. |
| F-BUG004-D | Open | Existing test waits for hydration, then clicks Power and Simple before requiring ready. | Add a direct-Simple test that never toggles modes. |
| F-BUG004-E | Open | Existing Power assertion checks panel hidden and `rlv-focused` absent, not `#winSeg/#sizeSeg/#grpSeg`. | Add a direct-Power visibility and functionality regression. |
| F-BUG004-F | Preserved | `rlexperience.js` and `tests/simple-production-wiring.spec.mjs` were active concurrent edits and became commit `2f65a02a` during filing. | Build on that commit; do not overwrite, revert, stash, or reset its work. |

## Repository Binding Evidence

**Claim Source:** executed

The inherited packet was validated before any repository-local read:

```text
REPOSITORY PACKET VALID actionable=true repository=research-lab root=<local-repository-root> decision=rb:vscode-eb9cb76de5cf2a992bf149706789fb73:1 revision=1
```

## Source Evidence: Native Control Placement And Hydration

**Executed:** YES

**Command:** `grep -nE 'body\.power #simpleWrap \.simple-only|class="panel simple-only"|id="winSeg"|id="sizeSeg"|id="grpSeg"|seg\("winSeg"|seg\("sizeSeg"|seg\("grpSeg"|data-heatmap-hydration' market-heatmap-lab.html`

**Exit Code:** 0

**Claim Source:** executed

```text
141:        body.power #simpleWrap .simple-only {
326:        <div class="panel simple-only">
331:                    <div class="seg" id="winSeg" aria-label="Color window">
338:                    <div class="seg" id="sizeSeg" aria-label="Tile size metric">
345:                    <div class="seg" id="grpSeg" aria-label="Grouping">
915:                document.body.setAttribute("data-heatmap-hydration", "loading");
933:                    document.body.setAttribute("data-heatmap-hydration", "ready");
953:                seg("winSeg", "w", function (v) { state.win = v; saveState(); render(); });
954:                seg("sizeSeg", "s", function (v) { state.size = v; saveState(); render(); });
955:                seg("grpSeg", "g", function (v) { state.grp = v; saveState(); fetchDelta(); render(); });
979:                document.body.setAttribute("data-heatmap-hydration", "loading");
997:                    document.body.setAttribute("data-heatmap-hydration", "ready");
```

**Result:** The three live controls share the Power-hidden parent. Hydration has
an explicit final ready transition, but no bridge notification appears here.

## Source Evidence: Shared Bridge Trigger

**Executed:** YES

**Command:** `grep -nE 'rlv-focused|ownerModes:|addEventListener\("rlviews:change"|detail\.mode !== "simple"|ownerState = providers|renderSimpleBridgeInternal|rl:data-status' rlviews.js rlapp.js rlexperience.js rldata.js`

**Exit Code:** 0

**Claim Source:** executed

```text
rlviews.js:47:      "body.rlv-focused>*:not(#rlviews):not(#rlnav):not(#rlnav-launcher):not(#rlnav-edge):not(#rl-proto-warn):not(#rl-data-shell):not([data-rlexperience-panel]):not(script):not(style):not(link){display:none!important}",
rlviews.js:146:    document.body.classList.toggle("rlv-focused", ownerModes.indexOf(mode) === -1);
rlapp.js:295:             rlv-focused; this is a data-only effect. */
rlapp.js:296:          ownerModes: resolved.value.kind === "ordinary"
rlapp.js:599:    root.addEventListener("rl:data-status", renderStatus);
rlexperience.js:1408:     INVARIANT (BUG-003 closure): this bridge NEVER mutates body.rlv-focused -
rlexperience.js:1412:  function renderSimpleBridgeInternal(options) {
rlexperience.js:1642:    globalThis.addEventListener("rlviews:change", function (event) {
rlexperience.js:1644:      if (!detail || detail.mode !== "simple" || typeof document === "undefined") return;
rlexperience.js:1664:        try { ownerState = providers[toolId](); } catch (providerError) { ownerState = null; }
rlexperience.js:1670:      renderSimpleBridgeInternal({
rlexperience.js:1684:         is the sole owner of rlv-focused; the stub's classList.add is removed. */
rlexperience.js:2150:    renderSimpleBridge: function (options) { return renderSimpleBridgeInternal(options); },
rldata.js:241:    try { if (root && typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") root.dispatchEvent(new root.CustomEvent("rl:data-status", { detail: dataState() })); } catch (e) { }
```

**Result:** The production bridge has one mode-change trigger. The only existing
data event is global aggregate status, not a tool-scoped owner-readiness contract.

## History Evidence

**Executed:** YES

**Commands:** `git blame` over the cited selector/control/provider/test ranges;
`git show -s --format=fuller c81d808d`; `git show -s --format=fuller f216be0d`

**Exit Code:** 0

**Claim Source:** executed

```text
c81d808dd (pkirsanov 2026-07-24 07:21:06 +0000 141) body.power #simpleWrap .simple-only {
c81d808dd (pkirsanov 2026-07-24 07:21:06 +0000 326) <div class="panel simple-only">
bec99eeb8 (pkirsanov 2026-07-08 11:30:58 -0700 331) <div class="seg" id="winSeg" aria-label="Color window">
bec99eeb8 (pkirsanov 2026-07-08 11:30:58 -0700 338) <div class="seg" id="sizeSeg" aria-label="Tile size metric">
bec99eeb8 (pkirsanov 2026-07-08 11:30:58 -0700 345) <div class="seg" id="grpSeg" aria-label="Grouping">
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 290) /* Provider-gated Model B rollout (Scope 15): an ordinary tool becomes an
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 296) ownerModes: resolved.value.kind === "ordinary"
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 297) ? ((root.__rlOwnerStateProvider && typeof root.__rlOwnerStateProvider[toolId] === "function") ? ["power"] : ["simple", "power"])
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 36) async function openHydratedHeatmap(page) {
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 51) // Real owner-mode flow: toggle to Power then Simple so rlviews:change->simple fires AFTER hydration.
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 52) await page.getByRole('tab', { name: 'Power', exact: true }).click();
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 53) await page.getByRole('tab', { name: 'Simple', exact: true }).click();
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 77) // Power: the adapter panel is hidden and native content is shown (rlv-focused OFF) - nothing deleted.
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 79) await expect(panel).toBeHidden();
f216be0d2 (pkirsanov 2026-07-27 05:25:14 +0000 80) await expect(page.locator('body')).not.toHaveClass(/rlv-focused/);
commit c81d808dd1e146fbf976f8801d54fffaeeb8418d
AuthorDate: Fri Jul 24 07:21:06 2026 +0000
commit f216be0d2f28bf69b232174d9b0810d8482009d4
AuthorDate: Mon Jul 27 05:25:14 2026 +0000
```

**Result:** `c81d808d` created the Power hiding relationship;
`f216be0d` created the provider-gated bridge and a test sequence that masks
cold-open readiness and does not inspect the native controls.

## Collision-Sensitive Worktree Evidence

**Executed:** YES

**Commands:** `git status --short -- rlexperience.js tests/simple-production-wiring.spec.mjs market-heatmap-lab.html rlviews.js rlapp.js`; `git grep -n 'data-rlexperience-control' HEAD -- rlexperience.js tests/simple-production-wiring.spec.mjs`; `git diff --numstat -- rlexperience.js tests/simple-production-wiring.spec.mjs`

**Claim Source:** executed

```text
 M rlexperience.js
 M tests/simple-production-wiring.spec.mjs
HEAD_CONTROL_GREP_EXIT=1
252     15      rlexperience.js
357     5       tests/simple-production-wiring.spec.mjs
```

**Result at discovery `HEAD` `31ea9942`:** the generic controls were absent from
committed bytes and present in a large active patch. The page and shared shell
visibility files were clean on the path-scoped status check. This filing left
both dirty files untouched.

## Concurrent Commit During Filing

**Executed:** YES

**Commands:** `git status --short -- rlexperience.js tests/simple-production-wiring.spec.mjs`; `git log -4 -- rlexperience.js tests/simple-production-wiring.spec.mjs`; `git grep -n 'data-rlexperience-control' HEAD -- rlexperience.js tests/simple-production-wiring.spec.mjs`

**Claim Source:** executed

```text
(path-scoped status empty: both paths clean)
2f65a02a3d3951b0756e01eb87ac42a103b28435
2026-07-29T15:45:37+00:00
feat(012/scope-15): make the Simple bridge genuinely steerable + author TP-15-03/TP-15-04
HEAD:rlexperience.js:1510:      row.setAttribute("data-rlexperience-control", parameter.parameterId);
HEAD:rlexperience.js:1554:      node.setAttribute("data-rlexperience-control-input", parameter.parameterId);
HEAD:rlexperience.js:1594:      container.setAttribute("data-rlexperience-controls", "parameters");
HEAD:rlexperience.js:1597:      note.setAttribute("data-rlexperience-controls-note", "steerable");
HEAD:tests/simple-production-wiring.spec.mjs:237:  await expect(panel.locator('[data-rlexperience-controls="parameters"]')).toHaveCount(1);
HEAD:tests/simple-production-wiring.spec.mjs:238:  await expect(panel.locator('[data-rlexperience-control-input]')).toHaveCount(declared.length);
```

**Result:** the concurrent lane, not this invocation, committed the protected
control work. Current local `HEAD` now contains generic controls. No current
browser deployment claim is made for that commit, and its tests still toggle
Power then Simple before asserting readiness.

## Deployed Page Corroboration

**Executed:** YES, non-interactive webpage fetch on 2026-07-29

**Tool:** `fetch_webpage`

**Claim Source:** executed

```text
## Simple model unavailable

Owner model adapter required: simple-adapter/market-breadth/v1. No model result
is available. No provider request, storage mutation, author call, publication,
formula substitution, or behavioral default was used.

Limitation: The shared core cannot invent or substitute the missing owner model.

SimplePowerBriefJourney
```

**Result:** The deployed page independently corroborates the unavailable Simple
projection. A webpage fetch does not execute a full browser interaction trace,
so it does not prove visibility geometry or the 135-constituent transition.

## Bug Reproduction - Before Fix

### Reporter-provided real-browser observation

**Claim Source:** interpreted (reporter-provided production observation; not
re-executed by this filing agent)

On 2026-07-29, production cold-open Simple settled with `body.rlv-focused`,
panel state `unavailable`, and all native controls invisible. After 135 priced
constituents hydrated, the panel remained unavailable until Power and then
Simple were selected. After that toggle it became `ready` with
`simple-adapter/market-breadth/v1`, but deployed shared control count remained
zero. In Power, three diagnostic panels were visible while `#winSeg`,
`#sizeSeg`, and `#grpSeg` were all invisible.

### Uncertainty declaration

The dynamic observation above is not relabeled as current-session browser
evidence. This invocation independently verified its controlling source paths,
history, deployed unavailable text, and test gap. The required persistent
real-browser RED remains unexecuted and is an explicit DoD item.

## Test Evidence

**Claim Source:** not-run

No unit, integration, Playwright, selftest, artifact-lint, or transition-guard
command was run for this filing-only invocation. No pass/fail, coverage, build,
implementation, or certification claim is made.

## Planned Verification Evidence

**Claim Source:** not-run

The exact planned commands are in [scopes.md](scopes.md#test-plan). Evidence must
be captured only after the persistent regressions exist and must include:

- cold-open Simple RED without any mode click, then GREEN after owner hydration;
- immutable-HEAD/deployed Simple-control RED if the active control patch remains;
- direct-Power native-control RED, then GREEN with all three controls functional;
- no-interception and no-silent-pass regression-quality scans;
- unit, bridge integration, and broad selftest output.

Concrete planned evidence files:

- `tests/simple-production-bridge.unit.mjs` - exact tool/mode filtering,
	coalescing, cross-generation commits, and failure-honesty canaries;
- `tests/market-heatmap-control-surface.spec.mjs` - independent direct-Simple
	readiness, all-five-Simple-controls, and direct-Power regressions;
- `tests/simple-production-bridge.integration.mjs` - production runtime,
	provider, adapter, owner-parity, and honest-unavailable sweep;
- `tests/simple-production-wiring.spec.mjs` - protected `2f65a02a` control and
	all-wired-tool behavior;
- `scripts/selftest.mjs` - executable-source authority and broad repository
	canaries.

## Planning Uncertainty Declaration

**Claim Source:** not-run

**What was attempted:** `bubbles.plan` reconciled the approved design into exact
Gherkin scenarios, persistent test titles, commands, Test Plan/DoD parity,
high-fan-out canaries, change boundaries, implementation ordering, and rollback
proof. Planning validation was executed, but product runtime tests were excluded
from this planning-only invocation.

**What was observed:** no implementation, browser regression, production bridge,
selftest, deployment, rollback rehearsal, or certification result was produced by
planning. Local commit `2f65a02a` exists, but current deployment remains unproven.

**Why this is uncertain:** planning specifies the required behavior and evidence;
it does not establish that the concurrent patch implements that behavior or that
any runtime command passes.

**What would resolve this:** the owning implementation/test phases must execute
the exact rows in `test-plan.json`, record immutable-baseline RED before accepting
the patch, record active-tree GREEN, and attach current-session evidence to each
matching DoD item. `bubbles.validate` must independently certify the resulting
evidence and repair the validate-owned `certification` shape.

## Invocation Audit

No `runSubagent` calls were available or invoked. Design and planning ownership
are recorded as route-required transitions rather than fabricated specialist
execution.