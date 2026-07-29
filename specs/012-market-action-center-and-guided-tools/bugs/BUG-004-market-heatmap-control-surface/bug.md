# Bug: BUG-004 Market Heatmap Control Surface Is Unavailable

- **Bug ID:** BUG-004
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Reported:** 2026-07-29
- **Workflow mode:** `bugfix-fastlane`
- **Status:** Confirmed by source/history and corroborated on the deployed page; implementation not started

## Summary

Market Heatmap has lost its usable control surface in both primary views.
Three independent defects compose the regression:

| Finding | View | Defect |
|---|---|---|
| F-BUG004-A | Simple cold-open | The production Simple bridge renders before asynchronous owner data is ready and never requalifies after hydration unless the user changes modes. |
| F-BUG004-B | Simple controls | Deployed Simple exposed no controls at discovery. The five declared inputs were absent from discovery `HEAD`; the concurrent patch was committed as `2f65a02a` during filing, but its deployment and direct-cold-open behavior are not verified. |
| F-BUG004-C | Power controls | `#winSeg`, `#sizeSeg`, and `#grpSeg` are inside `.simple-only`, while Power applies `body.power #simpleWrap .simple-only { display:none; }`, so the treemap cannot be steered in Power. |

## Severity

**High.** The heatmap still paints data after hydration, but its decision surface is
not operable as contracted. Simple cold-open remains unavailable without an
undiscoverable Power-to-Simple toggle, and Power permanently hides the native
treemap levers. This breaks the core interaction rather than a cosmetic detail.

## Reproduction

### A. Cold-open Simple

1. Open `https://pkirsanov.github.io/research-lab/market-heatmap-lab.html` in a fresh browser context.
2. Leave the shell in Simple. Do not click Power or any other view.
3. Wait until the page's 135-symbol owner-data hydration completes.
4. Inspect the Simple adapter panel and available controls.

**Reported result:** the body is `rlv-focused`; the Simple panel is
`unavailable`; all native controls are hidden. Hydration completes, but Simple
does not become ready until Power and then Simple are selected manually.

### B. Power controls

1. Open the same page directly in Power.
2. Wait for the treemap and Power diagnostics.
3. Locate `#winSeg`, `#sizeSeg`, and `#grpSeg`.

**Reported result:** three diagnostic panels are visible, but all three native
control groups are invisible.

## Expected Behavior

1. A direct Simple cold-open automatically transitions from honest
   `unavailable` to `ready` when the owner provider becomes ready. No mode toggle
   is required.
2. Ready Simple exposes the five declared model controls: return window,
   grouping, size metric, breadth threshold, and outlier sigma.
3. Power exposes the native heatmap controls `#winSeg`, `#sizeSeg`, and
   `#grpSeg` alongside the full treemap and diagnostics.
4. Every lever changes real production computation over already-loaded owner
   data. Lever changes do not refetch data.
5. Simple and Power continue to derive from one owner-data computation and do
   not contradict each other.

## Actual Behavior

- The shared bridge is triggered by `rlviews:change` only. Its boot-time Simple
  run can honestly produce `unavailable`, but owner hydration does not emit a
  bridge refresh.
- Discovery `HEAD` (`31ea9942`) contained no generic Simple-control renderer.
   The deployed page fetch on 2026-07-29 returned `Simple model unavailable` for
   `simple-adapter/market-breadth/v1` and exposed no control text. During this
   filing, the concurrent lane committed the generic controls as `2f65a02a`;
   that change does not add cold-open requalification or restore Power controls.
- Power's page-local CSS hides the parent containing all three native controls.

## Root Cause

Two ownership boundaries fail to meet:

1. **Async owner readiness has no bridge contract.** The page owns hydration;
   the shared bridge owns Simple projection. The bridge listens for a mode
   change, but the page has no tool-scoped way to notify it that provider state
   changed from insufficient to ready.
2. **The Power visibility rule is too coarse.** Commit `c81d808d` added
   `.simple-only` to the panel containing both Simple-only verdict copy and the
   native controls, then made Power hide that entire panel.

Commit `f216be0d` later provider-gated heatmap `ownerModes` to `["power"]` and
added a live test that explicitly waits for hydration and toggles Power then
Simple. That sequence validates a post-toggle state but masks cold-open
requalification and never asserts the three native controls in Power.

## Regression Window

- `c81d808d` (2026-07-24): introduced the `.simple-only` control-container
  placement and Power hiding selector.
- `f216be0d` (2026-07-27): introduced the production Simple owner-state bridge,
  provider-gated `ownerModes`, and the mode-toggle-based heatmap test.

## Collision-Sensitive Concurrent Work

At discovery, the worktree contained uncommitted edits in:

- `rlexperience.js` (`252` insertions, `15` deletions)
- `tests/simple-production-wiring.spec.mjs` (`357` insertions, `5` deletions)

Those edits add generic Simple controls and exercise them. They were not owned
or touched by this bug-filing invocation. A concurrent lane committed them as
`2f65a02a` at 2026-07-29T15:45:37Z while the packet was being validated. They do
not cover a direct Simple cold-open without a mode toggle, and they do not
restore the native Power controls. Any implementation must build on that commit
rather than replace or revert it.

## Work Boundary

This invocation creates this six-file bug packet only. It does not modify
product HTML/JavaScript, tests, parent Feature 012 artifacts, or any
validate-owned certification field.

## Related Contracts

- [Feature 012 specification](../../spec.md), Tool Experience Matrix
- [Scope 05](../../scopes/05-market-structure-options-adapters/scope.md), market-heatmap owner map
- [Scope 15](../../scopes/15-production-simple-adapter-wiring/scope.md), production Simple bridge
- [Market Heatmap notes](../../../../notes/market-heatmap-lab.md), Simple/Power control contract
- [Design](design.md)
- [Scope](scopes.md)
- [Evidence](report.md)