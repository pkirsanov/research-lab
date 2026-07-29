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

## Immutable Before-Fix RED Evidence

**Phase:** implement

**Claim Source:** executed

This is a reproduction-only increment. The active source and test bytes were not
changed, no current-tree GREEN command was run, no DoD checkbox was marked, and
`state.json` was not changed. The current dedicated Playwright test bytes were
executed from the main repository while each static page root came from a unique,
clean, detached temporary worktree.

### Immutable worktree setup

**Executed:** YES (in current session)

**Commands:**

```text
git worktree add --detach /tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73 2f65a02a
git worktree add --detach /tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73 31ea9942
git -C <each-worktree> status --porcelain=v1 --untracked-files=all
```

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
$ git worktree add --detach <2f-worktree> 2f65a02a
Preparing worktree (detached HEAD 2f65a02a)
HEAD is now at 2f65a02a feat(012/scope-15): make the Simple bridge genuinely steerable + author TP-15-03/TP-15-04
$ git worktree add --detach <31-worktree> 31ea9942
Preparing worktree (detached HEAD 31ea9942)
HEAD is now at 31ea9942 state(002): back-fill the missing implement-phase provenance record

WORKTREE=/tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73
$ git status --porcelain=v1 --untracked-files=all
CLEAN=true status_exit=0
HEAD=2f65a02a3d3951b0756e01eb87ac42a103b28435
DETACHED=true

WORKTREE=/tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73
$ git status --porcelain=v1 --untracked-files=all
CLEAN=true status_exit=0
HEAD=31ea994280e121e5079e3c86b5db82387e163a72
DETACHED=true
```

**Result:** PASS - both immutable roots started clean and detached at the exact
requested commits.

### TP-B004-06 - valid immutable RED at `2f65a02a`

**Executed:** YES (in current session)

**Command:** `BUG004_IMMUTABLE_ROOT=/tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73 timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-A: direct Simple" --reporter=list`

**Exit Code:** 1

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

	✘  1 …cold-open requalifies after owner hydration without a mode change (2.8m)


	1) [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:393:1 › BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change

		Error: SCN-B004-A: the Simple panel never requalified on its own. Observed {"state":"unavailable","adapter":"simple-adapter/market-breadth/v1","view":"simple","hydration":"ready"}. Production accepted the same live owner state, so the panel is stale, not honestly unavailable.

			385 |     };
			386 |   });
		> 387 |   throw new Error(
					|         ^
			388 |     `SCN-B004-A: the Simple panel never requalified on its own. Observed ${JSON.stringify(observed)}. ` +
			389 |     'Production accepted the same live owner state, so the panel is stale, not honestly unavailable.'
			390 |   );
				at awaitPanelReadyUntouched (/home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:387:9)
				at /home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:431:3

		Error Context: test-results/tests-market-heatmap-contr-4c785-ation-without-a-mode-change-system-chrome/error-context.md

		Error Context: test-results/tests-market-heatmap-contr-4c785-ation-without-a-mode-change-system-chrome/error-context.md

	1 failed
		[system-chrome] › tests/market-heatmap-control-surface.spec.mjs:393:1 › BUG-004 SCN-B004-A: direct Simple cold-open requalifies after owner hydration without a mode change
TP-B004-06_PLAYWRIGHT_EXIT=1
```

**Result:** VALID RED - the selected test was discovered, reached its
non-vacuity gate, observed terminal owner hydration and production readiness,
then failed specifically because the untouched Simple panel remained
`unavailable`.

### TP-B004-08 - valid immutable RED at `2f65a02a`

**Executed:** YES (in current session)

**Command:** `BUG004_IMMUTABLE_ROOT=/tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73 timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-C: direct Power" --reporter=list`

**Exit Code:** 1

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

	✘  1 …applies native treemap controls with zero post-hydration requests (2.1m)


	1) [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:513:1 › BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests

		Error: the native lever #winSeg ("Color window") must be visible in Power — F-BUG004-C hid all three

		expect(locator).toBeVisible() failed

		Locator:  locator('#winSeg')
		Expected: visible
		Received: hidden
		Timeout:  5000ms

		Call log:
			- the native lever #winSeg ("Color window") must be visible in Power — F-BUG004-C hid all three with timeout 5000ms
			- waiting for locator('#winSeg')
				12 × locator resolved to <div class="seg" id="winSeg" aria-label="Color window">…</div>
					 - unexpected value "hidden"

			544 |       group,
			545 |       `the native lever #${lever.id} ("${lever.label}") must be visible in Power — F-BUG004-C hid all three`
		> 546 |     ).toBeVisible();
					|       ^
			547 |   }
			548 |
			549 |   requests.length = 0;
				at /home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:546:7

			Error Context: test-results/tests-market-heatmap-contr-0775a-ero-post-hydration-requests-system-chrome/error-context.md

			Error Context: test-results/tests-market-heatmap-contr-0775a-ero-post-hydration-requests-system-chrome/error-context.md

	1 failed
			[system-chrome] › tests/market-heatmap-control-surface.spec.mjs:513:1 › BUG-004 SCN-B004-C: direct Power applies native treemap controls with zero post-hydration requests
TP-B004-08_PLAYWRIGHT_EXIT=1
```

**Result:** VALID RED - the selected test was discovered, completed owner
hydration, found the real `#winSeg` node, and failed the expected visibility
assertion because the native Power control was hidden.

### TP-B004-07 - executed, but the required immutable RED is uncertain

**Executed:** YES (in current session)

**Command:** `BUG004_IMMUTABLE_ROOT=/tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73 timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list`

**Exit Code:** 1

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

	✘  1 …istry controls with owner parity and zero post-hydration requests (2.9m)


	1) [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:442:1 › BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests

		Error: SCN-B004-A: the Simple panel never requalified on its own. Observed {"state":"unavailable","adapter":"simple-adapter/market-breadth/v1","view":"simple","hydration":"ready"}. Production accepted the same live owner state, so the panel is stale, not honestly unavailable.

			385 |     };
			386 |   });
		> 387 |   throw new Error(
					|         ^
			388 |     `SCN-B004-A: the Simple panel never requalified on its own. Observed ${JSON.stringify(observed)}. ` +
			389 |     'Production accepted the same live owner state, so the panel is stale, not honestly unavailable.'
			390 |   );
				at awaitPanelReadyUntouched (/home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:387:9)
				at /home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:455:3

		Error Context: test-results/tests-market-heatmap-contr-9161d-ero-post-hydration-requests-system-chrome/error-context.md

		Error Context: test-results/tests-market-heatmap-contr-9161d-ero-post-hydration-requests-system-chrome/error-context.md

	1 failed
		[system-chrome] › tests/market-heatmap-control-surface.spec.mjs:442:1 › BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests
TP-B004-07_PLAYWRIGHT_EXIT=1
```

**Result:** INVALID AS TP-B004-07 RED - the title was discovered and assertions
executed, but the run failed first in `awaitPanelReadyUntouched` on the separate
cold-open requalification defect. It never reached the generic-control count or
actuation assertions, so the absence of the generic five-control renderer at
`31ea9942` is not reproduced by this run.

**Reproduction Claim Source:** not-run

**Uncertainty Declaration:** TP-B004-07's expected absent-generic-controls
discriminator remains unproven. The command did not time out and did not suffer a
dependency or shell failure, but its earlier SCN-B004-A assertion masked the
SCN-B004-B assertion that this immutable baseline was intended to exercise.

**Supersession:** This uncertainty is retained as execution history and is
superseded by the valid TP-B004-07 immutable RED captured in the surgical B
reproduction increment below.

### Temporary worktree cleanup

**Executed:** YES (in current session)

**Commands:**

```text
git worktree remove /tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73
git worktree remove /tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73
git worktree list --porcelain
```

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
PRE_REMOVE_WORKTREE=/tmp/research-lab-bug004-2f65a02a-vscode-eb9cb76de5cf2a992bf149706789fb73
CLEAN_BEFORE_REMOVE=true status_exit=0
$ git worktree remove <temporary-worktree>
REMOVE_EXIT=0
REMOVED=true

PRE_REMOVE_WORKTREE=/tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73
CLEAN_BEFORE_REMOVE=true status_exit=0
$ git worktree remove <temporary-worktree>
REMOVE_EXIT=0
REMOVED=true

$ git worktree list --porcelain
worktree /home/redacted/research-lab
HEAD 527b93173a6eb5e18aff4197cdfc933b36c84d6c
branch refs/heads/main
```

**Result:** PASS - both temporary worktrees were still clean when removed, both
paths were removed, and the final worktree inventory contained only main.

### Surgical TP-B004-07 reproduction increment

**Phase:** implement

**Claim Source:** executed

This increment changed only the persistent BUG-004 browser test and this report.
The test hook is active only when `BUG004_HISTORICAL_CONTROLS_RED=1` and
`BUG004_IMMUTABLE_ROOT` resolves outside the active root. After the immutable
page's real hydration, it invokes that old page's own provider, adapter module,
runtime, and low-level `RLEXPERIENCE.renderSimpleBridge` path once. It does not
toggle modes, intercept requests, supply data, copy a model formula, or load
current production source into the old page.

#### Immutable worktree setup at `31ea9942`

**Executed:** YES (in current session)

**Command:** `timeout 60 git worktree add --detach /tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73-b-red 31ea9942` followed by clean/detached checks

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
Preparing worktree (detached HEAD 31ea9942)
HEAD is now at 31ea9942 state(002): back-fill the missing implement-phase provenance record
31ea994280e121e5079e3c86b5db82387e163a72
detached_symbolic_ref_exit=1
```

The blank `git status --porcelain=v1 --untracked-files=all` output proves the
detached immutable worktree started clean.

#### TP-B004-07 - valid immutable RED at `31ea9942`

**Executed:** YES (in current session)

**Command:** `BUG004_IMMUTABLE_ROOT=/tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73-b-red BUG004_HISTORICAL_CONTROLS_RED=1 timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list`

**Exit Code:** 1 (expected RED)

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

	✘  1 ...istry controls with owner parity and zero post-hydration requests (2.2m)


	1) [system-chrome] › tests/market-heatmap-control-surface.spec.mjs:474:1 › BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests

		Error: expect(locator).toHaveCount(expected) failed

		Locator:  locator('[data-rlexperience-panel="simple"]').locator('[data-rlexperience-controls="parameters"]')
		Expected: 1
		Received: 0
		Timeout:  5000ms

		Call log:
			- Expect "toHaveCount" with timeout 5000ms
			- waiting for locator('[data-rlexperience-panel="simple"]').locator('[data-rlexperience-controls="parameters"]')
				14 × locator resolved to 0 elements
					 - unexpected value "0"


			509 |     'outlier-sigma'
			510 |   ]);
		> 511 |   await expect(panel.locator('[data-rlexperience-controls="parameters"]')).toHaveCount(1);
					|                                                                            ^
			512 |   await expect(panel.locator('[data-rlexperience-control-input]')).toHaveCount(declared.length);
			513 |   for (const parameter of declared) {
			514 |     const control = panel.getByLabel(parameter.label, { exact: true });
				at /home/redacted/research-lab/tests/market-heatmap-control-surface.spec.mjs:511:76

		Error Context: test-results/tests-market-heatmap-contr-9161d-ero-post-hydration-requests-system-chrome/error-context.md

	1 failed
		[system-chrome] › tests/market-heatmap-control-surface.spec.mjs:474:1 › BUG-004 SCN-B004-B: ready Simple applies all five registry controls with owner parity and zero post-hydration requests
historical_red_exit=1
```

**Result:** VALID RED - exactly one test was discovered. The real immutable page
completed hydration, its production low-level bridge rendered a ready panel,
and the unchanged B assertions then failed first because the historical page had
zero `[data-rlexperience-controls="parameters"]` containers. No readiness,
dependency, setup, timeout, or test-discovery failure masked the discriminator.

#### Temporary worktree cleanup

**Executed:** YES (in current session)

**Command:** clean status check, `timeout 60 git worktree remove /tmp/research-lab-bug004-31ea9942-vscode-eb9cb76de5cf2a992bf149706789fb73-b-red`, then `timeout 30 git worktree list --porcelain`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
worktree /home/redacted/research-lab
HEAD 8c2220846a2152a7074cca69cf189d4bf57e5e72
branch refs/heads/main
```

The pre-remove porcelain status was blank, so the temporary worktree remained
clean. The final inventory proves it was removed and only main remained.

#### Current-tree TP-B004-07 GREEN with historical flag absent

**Executed:** YES (in current session)

**Command:** `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
Running 1 test using 1 worker

	✓  1 ...istry controls with owner parity and zero post-hydration requests (4.5m)

	1 passed (4.5m)
current_b_green_exit=0
```

**Result:** PASS - the same B title passed once against the active tree with no
historical environment flag. The ordinary path remained a direct Simple cold
open and retained `assertNoModeToggle`; the historical hook did not execute.

#### Regression-quality guard

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/market-heatmap-control-surface.spec.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: /home/redacted/research-lab
	Timestamp: 2026-07-29T21:23:11Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/market-heatmap-control-surface.spec.mjs
✅ Adversarial signal detected in tests/market-heatmap-control-surface.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
regression_quality_guard_exit=0
```

**Result:** PASS - the historical-only conditional is accepted by the bugfix
quality guard; no bailout, masking, interception, skip, or warning was detected.

## Focused Implementation Test Evidence: TP-B004-01..05, TP-B004-09, TP-B004-11

**Phase:** implement

**Claim Source:** executed

Only the seven requested current-tree rows were executed. No browser test was
run, no DoD checkbox was marked, and no state, scope, planning, or certification
artifact was changed.

### TP-B004-01..04 - coordinator canaries

**Executed:** YES (in current session)

**Commands and observed exit codes:**

- `timeout 600 node --test --test-name-pattern="^requestSimpleRefresh filters wrong tool, non-Simple, non-ordinary, and invalidates work when leaving Simple$" tests/simple-production-bridge.unit.mjs` - exit 0
- `timeout 600 node --test --test-name-pattern="^requestSimpleRefresh coalesces pre-start duplicates and retains only the latest pending successor$" tests/simple-production-bridge.unit.mjs` - exit 0
- `timeout 600 node --test --test-name-pattern="^requestSimpleRefresh commits only the latest generation and preserves current-generation control ordering$" tests/simple-production-bridge.unit.mjs` - exit 0
- `timeout 600 node --test --test-name-pattern="^requestSimpleRefresh renders current failure unavailable and suppresses stale failure$" tests/simple-production-bridge.unit.mjs` - exit 0

**Claim Source:** executed

**Output (complete command outputs in the command order above):**

```text
✔ tests/simple-production-bridge.unit.mjs (103.022709ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 113.928809
✔ tests/simple-production-bridge.unit.mjs (105.710107ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 114.507207
✔ tests/simple-production-bridge.unit.mjs (87.309126ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 99.674829
✔ tests/simple-production-bridge.unit.mjs (85.823708ms)
ℹ tests 1
ℹ suites 0
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.272409
```

**Result:** PASS - TP-B004-01, TP-B004-02, TP-B004-03, and TP-B004-04 each
selected exactly one test and completed with zero failures, cancellations,
skips, or todos.

### TP-B004-05 - broad selftest

**Executed:** YES (in current session)

**Command:** `timeout 1200 node scripts/selftest.mjs`

**Exit Code:** 0

**Claim Source:** executed

The command ran without an output filter. Its 968-test stream exceeded terminal
scrollback; the complete final BUG-004-relevant output window and suite summary
are preserved below.

**Output:**

```text
Feature 012 Scope 15 production Simple-view bridge canaries (TP-15-07)
	✓ the bridge publishes a non-empty adapter-module binding table, each entry naming a browser global and a registrar (6 bindings parsed from rlexperience.js)
	✓ the wired set is derived from the production registry + the deployed pages and is non-empty (19 wired of 23 registry definitions, scanned 26 pages)
	✓ every page-registered owner-state provider resolves to a registry definition carrying a non-empty adapterId/adapterModule/definitionId (0 orphan wirings, 0 identity gaps across 19 wired tools)
	✓ every wired tool’s declared adapter module exists on disk and has a bridge binding (6 distinct modules across 19 wired tools)
	✓ every wired tool’s adapter module loads and exports the registrar its binding names (19/19 resolved, gaps: none)
	✓ registering every wired module into the REAL runtime registers the registry-declared adapterId for the registry-declared definitionId (19/19 checked, gaps: none)
	✓ no forbidden authority: the runtime’s own diagnostic reports every authority false after adapter registration (6 authority flags x 19 wired tools, owned: 0)
	✓ exactly one executable rlv-focused write exists across all production sources and it lives in rlviews.js (scanned 54 files, writers: rlviews.js x1)
	✓ applyVisual (rlviews.js) is the function that owns that sole rlv-focused write
	✓ the production bridge path (renderSimpleBridgeInternal + installSimpleProjectionBridge) contains no rlv-focused write and, once comments are stripped, no rlv-focused reference at all (21933 source chars)
	✓ the bridge path performs local compute only — no network, provider, storage, or cookie authority in its executable source (8 tokens checked, hits: none)
	✓ rlapp.js’s own ownerModes expression yields ["power"] for a provider-wired ordinary tool, ["simple","power"] for an unwired one (no regression), and ["brief"] for a brief-only tool
	✓ rlviews.js’s own rlv-focused predicate, fed those real ownerModes, focuses a wired tool’s Simple, leaves Power unfocused, and never focuses an unwired native Simple or a brief view
	✓ RLEXPERIENCE.renderSimpleBridge is exposed on the production API
	✓ a wired tool with no owner state degrades to an honest unavailable that names the missing owner adapter, publishes a null numeric, paints no numeric node, and invents no signal (market-heatmap-lab)
	✓ the bridge never mutates body.classList on the unavailable path — applyVisual stays the sole owner of rlv-focused (BUG-003 invariant, 0 recorded mutations)

================================================
Research-Lab self-test: 968 passed, 0 failed
================================================
```

**Result:** PASS - the broad selftest completed with 968 passed and 0 failed.

### TP-B004-09 - production bridge integration sweep

**Executed:** YES (in current session)

**Command:** `timeout 600 node --test tests/simple-production-bridge.integration.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
[TP-15-02] wired (19): market-heatmap-lab, options-flow-feed-lab, intraday-tape-lab, swing-structure-lab, options-structure-lab, gamma-trading-lab, sector-research-lab, global-rotation-lab, real-assets-lab, bond-regime-lab, ai-capex-strategy-lab, company-fundamentals-lab, etf-momentum-lab, strategy-self-improvement-lab, strategy-validation-lab, smart-money-flow-lab, waterfront-polo-lab, volatility-sizing-lab, technical-analysis-decision-lab
[TP-15-02] not wired (4): market-brief, msft-july-print-model, palm-springs-rental-market-lab, ocean-shores-rental-market-lab
[TP-15-02] strict parity (module loaded by the page): 18 of 19
[TP-15-02] honest generic unavailable (module deliberately absent, SCN-012-034 lock): technical-analysis-decision-lab
✔ TP-15-02 the wired-tool set is derived from the production registry + the production pages (never a hard-coded list) (70.057798ms)
✔ TP-15-02 registry-derived loop: each wired tool prepares through the REAL runtime and paints the REAL panel (1307.092664ms)
✔ TP-15-02 owner parity: every wired tool's Simple facts EQUAL the owner/Power-path values (1189.821072ms)
✔ TP-15-02 the production bridge reaches the SAME projection as the explicit runtime path for every module-backed wired tool (and the honest generic unavailable where the module is deliberately absent) (2004.334362ms)
✔ TP-15-02 honest unavailable: a wired tool whose provider yields NO owner state degrades truthfully (no invented signal) (59.131999ms)
✔ TP-15-02 honest unavailable: owner evidence that does not permit a run degrades truthfully rather than inventing a read (39.9623ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 4827.820791
```

**Result:** PASS - all six production bridge integration checks passed with no
failures, cancellations, skips, or todos.

### TP-B004-11 - regression-quality guard

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/market-heatmap-control-surface.spec.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: /home/redacted/research-lab
	Timestamp: 2026-07-29T21:28:16Z
	Bugfix mode: true
============================================================

ℹ️  Scanning tests/market-heatmap-control-surface.spec.mjs
✅ Adversarial signal detected in tests/market-heatmap-control-surface.spec.mjs

============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

**Result:** PASS - the guard found an adversarial bugfix signal and reported
zero violations and zero warnings.

## Current-Tree Implementation Evidence: TP-B004-06..08

The three corrected Test Plan commands were executed sequentially on the
current tree with the required `timeout 1200` wrapper. The list reporter output
was unfiltered. Execution framing recorded wall-clock duration and count without
changing the test title, assertions, production boundary, or command arguments.
No DoD checkbox or state field was changed.

### TP-B004-06 - direct Simple A

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-A: direct Simple" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
TEST_PLAN_ID=TP-B004-06
PHASE=implement
CWD=~/research-lab
STARTED_AT=2026-07-29T21:45:39Z
TIMEOUT_SECONDS=1200
COMMAND=timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-A: direct Simple" --reporter=list
Running 1 test using 1 worker
	✓  1 …cold-open requalifies after owner hydration without a mode change (3.6m)
	1 passed (3.7m)
EXIT_CODE=0
FINISHED_AT=2026-07-29T21:49:21Z
DURATION_SECONDS=222
TEST_COUNT=1
```

**Result:** PASS - exactly one direct-Simple test ran and passed after terminal
owner hydration without a mode change.

### TP-B004-07 - all-five Simple B

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
HISTORICAL_ENV_FLAG=absent
TEST_PLAN_ID=TP-B004-07
PHASE=implement
CWD=~/research-lab
STARTED_AT=2026-07-29T21:49:33Z
TIMEOUT_SECONDS=1200
COMMAND=timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-B: ready Simple" --reporter=list
Running 1 test using 1 worker
	✓  1 …istry controls with owner parity and zero post-hydration requests (3.7m)
	1 passed (3.7m)
EXIT_CODE=0
FINISHED_AT=2026-07-29T21:53:16Z
DURATION_SECONDS=223
TEST_COUNT=1
```

**Result:** PASS - exactly one all-five Simple-control test ran and passed with
the historical environment flag absent.

### TP-B004-08 - direct Power C

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-C: direct Power" --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
TEST_PLAN_ID=TP-B004-08
PHASE=implement
CWD=~/research-lab
STARTED_AT=2026-07-29T21:53:22Z
TIMEOUT_SECONDS=1200
COMMAND=timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/market-heatmap-control-surface.spec.mjs --grep "BUG-004 SCN-B004-C: direct Power" --reporter=list
Running 1 test using 1 worker
	✓  1 …applies native treemap controls with zero post-hydration requests (3.8m)
	1 passed (3.9m)
EXIT_CODE=0
FINISHED_AT=2026-07-29T21:57:15Z
DURATION_SECONDS=233
TEST_COUNT=1
```

**Result:** PASS - exactly one direct-Power test ran and passed with all native
treemap controls functional and zero post-hydration requests.

## Protected Control-Wiring Regression Evidence: TP-B004-10

**Phase:** implement

**Executed:** YES (in current session by the active workflow runner)

**Command:** `timeout 1200 npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/simple-production-wiring.spec.mjs --reporter=list`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
Running 4 tests using 1 worker

	✓  1 …Simple renders the real adapter panel in the real owner-mode flow (2.0s)
	✓  2 …ctuating one recomputes the production projection with no refetch (3.6m)
	✓  3 …ol paints its real Simple adapter panel with an owner-parity fact (7.1m)
TP-15-04 swept 19 wired tools: market-heatmap-lab=ready(x1) options-flow-feed-lab=ready(x1) intraday-tape-lab=unavailable(x1) swing-structure-lab=ready(x1) options-structure-lab=ready(x1) gamma-trading-lab=ready(x1) sector-research-lab=ready(x1) global-rotation-lab=ready(x1) real-assets-lab=ready(x1) bond-regime-lab=ready(x1) ai-capex-strategy-lab=ready(x1) company-fundamentals-lab=ready(x1) etf-momentum-lab=ready(x1) strategy-self-improvement-lab=ready(x1) strategy-validation-lab=ready(x1) smart-money-flow-lab=ready(x1) waterfront-polo-lab=ready(x1) volatility-sizing-lab=ready(x1) technical-analysis-decision-lab=unavailable(x1)
	✓  4 …s, and the honest-degradation cases are registry/provider derived (47ms)

	Slow test file: [system-chrome] › tests/simple-production-wiring.spec.mjs (10.8m)
	Consider running tests from slow files in parallel. See: https://playwright.dev/docs/test-parallel
	4 passed (10.8m)
```

**Result:** PASS - all four protected production-wiring tests passed. This run
preserves the existing registry-derived controls, production recomputation,
owner-parity sweep, and honest-degradation assertions; it is local implementation
evidence and is not represented as deployment or independent certification.

### Focused TP-15-03 Marker-Aware Harness Confirmation

**Phase:** implement

**Executed:** YES (in current session by the active workflow runner)

**Command:** The handoff packet did not preserve the focused command argv; it
identified the run as the focused `TP-15-03` selection after the marker-aware
harness edit. No command line is reconstructed here.

**Exit Code:** 0

**Claim Source:** interpreted

**Interpretation:** The supplied focused result directly confirms one selected
TP-15-03 test passed after the harness edit, but its missing argv prevents this
supplement from being used as a standalone Test Plan evidence block. The complete
four-test TP-B004-10 run above is the evidence of record.

```text
1 passed (3.6m)
EXIT_CODE=0
```

The marker-aware repair changes only the protected Playwright harness. It replaces
network-quiet timing as the definition of owner readiness with the page-owned
`body[data-heatmap-hydration="ready"]` terminal marker, and resets the passive
request ledger immediately before keyboard actuation. It neither changes product
logic nor intercepts, fulfills, or modifies requests. The full TP-B004-10 run
proves the repaired harness still carries all four protected assertions.

### Code Diff Evidence

**Phase:** implement

**Executed:** YES (in current session)

**Commands:** `git --no-pager log --oneline -15 -- <BUG-004 source/test paths>`;
`git --no-pager diff --name-status 2f65a02a..HEAD -- <BUG-004 source/test paths>`;
`git --no-pager diff 2f65a02a..HEAD -- <BUG-004 source/test paths>`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
5c77e1f1 fix(012/BUG-004): grouping lever recomputes without refetching; queued Simple run cannot outlive its view
b674ffc1 test(012/scope-15): sample owner evidence at the page's declared hydration boundary
087ad2ad fix(012/BUG-004): restore market-heatmap control surface in both views
2f65a02a feat(012/scope-15): make the Simple bridge genuinely steerable + author TP-15-03/TP-15-04
M       market-heatmap-lab.html
M       rlexperience.js
A       tests/market-heatmap-control-surface.spec.mjs
M       tests/simple-production-bridge.unit.mjs
M       tests/simple-production-wiring.spec.mjs
```

The full unfiltered diff was inspected. Relative to protected baseline
`2f65a02a`, the committed delta is confined to the two approved production files,
the dedicated regression, the coordinator canary file, and the protected wiring
harness. Its inverse removes the public refresh/coordinator changes, terminal
heatmap refresh and boot-union/local-recompute changes, native lever relocation,
and BUG-004 tests while retaining `2f65a02a`. No cache, provider, registry,
dependency, route, schema, migration, deployment, storage, or secret path appears.

## Implementation Closeout Checks

### Touched JavaScript Parse Checks

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `for file in rlexperience.js tests/simple-production-bridge.unit.mjs tests/market-heatmap-control-surface.spec.mjs scripts/selftest.mjs tests/simple-production-wiring.spec.mjs; do timeout 60 node --check "$file"; done`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
PARSE_CHECK=rlexperience.js
EXIT_CODE=0
PARSE_CHECK=tests/simple-production-bridge.unit.mjs
EXIT_CODE=0
PARSE_CHECK=tests/market-heatmap-control-surface.spec.mjs
EXIT_CODE=0
PARSE_CHECK=scripts/selftest.mjs
EXIT_CODE=0
PARSE_CHECK=tests/simple-production-wiring.spec.mjs
EXIT_CODE=0
PARSE_CHECKS_EXIT=0
```

### Implementation Closeout Focused Artifact Lint

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/artifact-lint.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
✅ Required artifact exists: spec.md
✅ Required artifact exists: design.md
✅ Required artifact exists: uservalidation.md
✅ Required artifact exists: state.json
✅ Required artifact exists: scopes.md
✅ Required artifact exists: report.md
✅ No forbidden sidecar artifacts present
✅ Found DoD section in scopes.md
✅ scopes.md DoD contains checkbox items
✅ All DoD bullet items use checkbox syntax in scopes.md
✅ Found Checklist section in uservalidation.md
✅ uservalidation checklist contains checkbox entries
✅ uservalidation checklist has checked-by-default entries
✅ All checklist bullet items use checkbox syntax
✅ Detected state.json status: in_progress
✅ Detected state.json workflowMode: bugfix-fastlane
✅ state.json v3 has required field: status
✅ state.json v3 has required field: execution
✅ state.json v3 has required field: certification
✅ state.json v3 has required field: policySnapshot
✅ state.json v3 has recommended field: transitionRequests
✅ state.json v3 has recommended field: reworkQueue
✅ state.json v3 has recommended field: executionHistory
✅ Top-level status matches certification.status
✅ report.md contains section matching: Summary
✅ report.md contains section matching: Completion Statement
✅ report.md contains section matching: Test Evidence
✅ Mode-specific report gates skipped (status not in promotion set)
✅ All checked DoD items in scopes.md have evidence blocks
✅ No unfilled evidence template placeholders in scopes.md
✅ No unfilled evidence template placeholders in report.md
Artifact lint PASSED.
```

### Implementation Reality Scan

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/implementation-reality-scan.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface --verbose`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
ℹ️  INFO: Scopes yielded 0 files — falling back to design.md for file discovery
⚠️  WARN: Resolved 6 file(s) from design.md fallback — scopes.md should reference these directly
ℹ️  INFO: Resolved 6 implementation file(s) to scan
--- Scan 1: Gateway/Backend Stub Patterns ---
--- Scan 1B: Handler / Endpoint Execution Depth ---
--- Scan 1C: Endpoint Not-Implemented / Placeholder Responses ---
--- Scan 1D: External Integration Authenticity ---
--- Scan 2: Frontend Hardcoded Data Patterns ---
--- Scan 2B: Sensitive Client Storage ---
--- Scan 3: Frontend API Call Absence ---
--- Scan 4: Prohibited Simulation Helpers in Production ---
--- Scan 5: Default/Fallback Value Patterns ---
--- Scan 6: Live-System Test Interception ---
ℹ️  INFO: No live-system test files referenced in scope artifacts for interception scan
--- Scan 7: IDOR / Auth Bypass Detection (Gate G047) ---
--- Scan 8: Silent Decode Failure Detection (Gate G048) ---
============================================================
	IMPLEMENTATION REALITY SCAN RESULT
============================================================
	Files scanned:  6
	Violations:     0
	Warnings:       1
🟡 PASSED with 1 warning(s) — manual review advised
```

**Interpretation:** All six resolved implementation files have zero reality
violations. The warning is retained, not laundered: scanner discovery fell back
from `scopes.md` to `design.md`. Because the Build Quality Gate requires zero
warnings, that DoD item remains unchecked for independent ownership review.

### Current In-Progress State Transition Guard

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/state-transition-guard.sh specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface`

**Exit Code:** 1

**Claim Source:** executed

The command ran with unfiltered output. Per the evidence window rule for output
over 100 lines, the final machine envelope and decisive nonterminal blockers are
preserved here rather than duplicating the entire 21 KB stream.

**Output (final verdict window):**

```text
--- Check 4: DoD Completion (Zero Unchecked) ---
ℹ️  INFO: DoD items total: 19 (checked: 0, unchecked: 19)
🔴 BLOCK: Resolved scope artifacts have 19 UNCHECKED DoD items — ALL must be [x] for 'done'
--- Check 5: Scope Status Cross-Reference ---
ℹ️  INFO: Resolved scopes: total=1, Done=0, In Progress=0, Not Started=1, Blocked=0
🔴 BLOCK: Resolved scope artifacts have 1 scope(s) still marked 'Not Started' — ALL scopes must be Done
--- Check 6: Specialist Phase Completion ---
🔴 BLOCK: Required phase 'implement' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: Required phase 'test' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: Required phase 'validate' NOT in execution/certification phase records (Gate G022 violation)
🔴 BLOCK: Required phase 'audit' NOT in execution/certification phase records (Gate G022 violation)
============================================================
	TRANSITION GUARD VERDICT
============================================================
🔴 TRANSITION BLOCKED: 32 failure(s), 1 warning(s)
state.json status MUST NOT be set to 'done'.
BEGIN TRANSITION_GUARD_RESULT_V1
schemaVersion: transition-guard-result/v1
workflowMode: bugfix-fastlane
auditProfile: delivery-completion-v1
targetStatus: done
failedGateIds: [G004,G061,G022,G053,G040,G068]
failedChecks: [Check-4-completion,Check-5-all-done]
blockingCode: DELIVERY_COMPLETION_FAILED
failureCount: 32
exitStatus: 1
verdict: FAIL
END TRANSITION_GUARD_RESULT_V1
```

**Result:** EXPECTED NONTERMINAL REFUSAL - implementation does not promote the
scope or spec. Independent test, regression, validate, and audit phases remain
outside this phase; top-level and certification status stay `in_progress`.

### Closeout Regression-Quality Guard

**Phase:** implement

**Executed:** YES (in current session)

**Command:** `timeout 600 bash .github/bubbles/scripts/regression-quality-guard.sh --bugfix tests/market-heatmap-control-surface.spec.mjs`

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
============================================================
	BUBBLES REGRESSION QUALITY GUARD
	Repo: /home/redacted/research-lab
	Timestamp: 2026-07-29T23:10:27Z
	Bugfix mode: true
============================================================
ℹ️  Scanning tests/market-heatmap-control-surface.spec.mjs
✅ Adversarial signal detected in tests/market-heatmap-control-surface.spec.mjs
============================================================
	REGRESSION QUALITY RESULT: 0 violation(s), 0 warning(s)
	Files scanned: 1
	Files with adversarial signals: 1
============================================================
```

### Implementation Closeout Uncertainty

**Phase:** implement

**Claim Source:** not-run

The Build Quality Gate remains unchecked. The closeout implementation-reality
scan executed and found zero violations, but it also emitted one warning because
its scope parser found zero implementation files and fell back to six files from
`design.md`. Resolving whether the planned scope text should be changed belongs
to `bubbles.plan`; independent test can also determine whether the warning is a
scanner-discovery false positive. This implementation phase does not rewrite the
planned scope or relabel a warning as zero warnings.

### Implementation Change Boundary And Rollback Audit

**Phase:** implement

**Executed:** YES (in current session)

**Command:** path-scoped and full `git status --short`; path-scoped
`git diff --name-status`; `git diff --cached --name-status`; `git diff --check`;
`git worktree list --porcelain`, each under an explicit 30-second timeout

**Exit Code:** 0

**Claim Source:** executed

**Output:**

```text
=== CHANGED-PATH BOUNDARY AUDIT: FULL STATUS ===
 M .github/bubbles-project.yaml
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/report.md
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/scopes.md
 M specs/012-market-action-center-and-guided-tools/scopes/15-production-simple-adapter-wiring/report.md
=== BUG-004 ALLOWED PATH STATUS ===
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/report.md
 M specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/scopes.md
=== BUG-004 ALLOWED PATH DIFF ===
M       specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/report.md
M       specs/012-market-action-center-and-guided-tools/bugs/BUG-004-market-heatmap-control-surface/scopes.md
=== STAGED PATHS ===
=== DIFF CHECK ===
DIFF_CHECK_EXIT=0
=== WORKTREE LIST ===
worktree /home/redacted/research-lab
HEAD bc3b7303ea022906fcc2f268465e733fdf649173
branch refs/heads/main
BOUNDARY_AUDIT_EXIT=0
```

**Result:** PASS - the active implementation delta is confined to allowed
BUG-004 execution artifacts, no path is staged, whitespace validation passes,
and no temporary worktree remains. The unrelated `.github/bubbles-project.yaml`
and parent Scope-15 report modifications are visible and were not edited,
staged, reset, stashed, reverted, or claimed by this phase.