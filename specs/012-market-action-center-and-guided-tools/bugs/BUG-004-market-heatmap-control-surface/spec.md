# Bug Specification: BUG-004 Market Heatmap Control Surface

- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Workflow mode:** `bugfix-fastlane`
- **Status:** In progress, discovery and planning only

## Problem Statement

Market Heatmap must remain a steerable analytical tool in both Simple and Power.
Today, Simple does not automatically requalify when asynchronous owner data
becomes ready, deployed Simple has no model controls, and Power hides the native
treemap controls. The fix must restore the complete control contract without
introducing a second model, refetching data on lever changes, or overwriting the
concurrent Simple-control work committed as `2f65a02a` during this filing.

## Outcome Contract

**Intent:** Restore the Market Heatmap's decision-first Simple controls and native Power controls without a mode-toggle workaround.

**Success Signal:** A direct Simple cold-open automatically becomes `ready` after terminal hydration and exposes `window`, `grouping`, `size-metric`, `breadth-threshold`, and `outlier-sigma`; a direct Power open exposes and operates the original `#winSeg`, `#sizeSeg`, and `#grpSeg` controls with selected and visible-focus semantics; every control recomputes without post-hydration acquisition; and wrong-tool events have zero provider, panel, ARIA, generation, queue, or state effects (SCN-B004-A through D).

**Hard Constraints:** Preserve exact-current-tool and current-Simple filtering, one active run plus only the latest pending successor, stale-control inertness, one boot hydration over the sector/constituent union, and the single existing native Power control nodes; introduce no cloned controls, provider-key or page-local acquisition/publication authority, deployment claim, or overwrite of unrelated or concurrent work including `2f65a02a` and its successors.

**Failure Condition:** The outcome fails on any direct-open readiness stall, missing or inert Simple or Power lever, post-hydration refetch, stale or wrong-tool mutation, duplicate control node, or false deployment or live-data claim.

## Contract Authority

Feature 012 defines the following heatmap experience:

- **Simple:** steer return window, grouping, size metric, breadth threshold, and
  outlier sigma to inspect broad/narrow leadership sensitivity.
- **Power:** inspect the full treemap, sector/constituent breadth, liquidity
  sizing, sortable rows, and sector-relative outliers.
- **Notes contract:** color window, size metric, and grouping are native heatmap
  levers; changing a lever recomputes from one loaded data set without refetch.

## Requirements

| ID | Requirement |
|---|---|
| FR-B004-01 | A fresh direct open into Simple MUST automatically re-evaluate the Simple owner projection when heatmap owner data changes from insufficient to ready. |
| FR-B004-02 | FR-B004-01 MUST complete without a Power-to-Simple toggle, synthetic mode change, reload, manual refresh, request interception, or service worker. |
| FR-B004-03 | Ready Simple MUST expose one accessible, functional control for each of the five registry-declared heatmap inputs: `window`, `grouping`, `size-metric`, `breadth-threshold`, and `outlier-sigma`. |
| FR-B004-04 | Each Simple control MUST change its declared model input and recompute the production `simple-adapter/market-breadth/v1` projection over the owner state already loaded. |
| FR-B004-05 | Power MUST show `#winSeg`, `#sizeSeg`, and `#grpSeg` together with the native treemap and Power diagnostic panels. |
| FR-B004-06 | Each Power control MUST remain keyboard-operable, update its selected state, and visibly change the treemap/table interpretation it owns. |
| FR-B004-07 | Simple and Power lever changes MUST issue zero new data requests after owner hydration has settled. Request observation is permitted; interception is forbidden. |
| FR-B004-08 | Simple and Power MUST continue to consume the same owner evidence and owner formulas. No formula copy, second cache, second provider, or page-specific Simple model is permitted. |
| FR-B004-09 | A stale asynchronous bridge run MUST NOT overwrite a newer ready projection or a user-actuated control result. |
| FR-B004-10 | Commit `2f65a02a` and any successor edits in `rlexperience.js` and `tests/simple-production-wiring.spec.mjs` MUST be preserved and integrated. They MUST NOT be reverted, replaced wholesale, or silently treated as deployed behavior before deployment is verified. |
| FR-B004-11 | The persistent regressions MUST fail against the current broken behavior and MUST cover cold-open Simple and direct-open Power independently. |

## Acceptance Scenarios

### AC-B004-A: automatic cold-open requalification

Given a fresh browser opens Market Heatmap directly in Simple, when the page
progresses from incomplete owner evidence to 135 priced constituents, then the
panel progresses from `unavailable` to `ready` automatically, remains in Simple,
uses `simple-adapter/market-breadth/v1`, and exposes all five controls.

### AC-B004-B: steerable Simple model

Given the ready Simple panel, when each declared control is actuated within its
declared domain, then the rendered production projection reflects the changed
input, remains owner-parity correct, and emits no data request.

### AC-B004-C: steerable Power treemap

Given a fresh browser opens Market Heatmap directly in Power, when hydration
settles, then `#winSeg`, `#sizeSeg`, and `#grpSeg` are visible beside the
diagnostics. Actuating each updates the native state and output with no refetch.

## Quality Attributes

- **Accessibility:** all restored controls have stable accessible names and
  visible focus; keyboard activation is covered by the browser regression.
- **Determinism:** readiness refresh is tool-scoped, idempotent, coalesced, and
  latest-result-wins.
- **Performance:** refresh and control recompute are local computation over
  existing owner state; they do not initiate hydration or provider access.
- **Honesty:** an actually insufficient owner state remains `unavailable`.
  Automatic requalification occurs only after the real provider yields evidence
  accepted by the production adapter.

## Capability Foundation

### Single-Capability Justification

This bug repairs one existing capability: the shared production Simple bridge's
ability to project changing owner state. A tool-scoped owner-state refresh is a
shared bridge concern because provider readiness can change asynchronously on
any wired ordinary page. A heatmap-only call into bridge internals would create
a second lifecycle mechanism and repeat the same defect on the next async owner.
The page remains responsible only for declaring that its owner state changed;
the shared bridge remains responsible for provider resolution, adapter setup,
projection, cancellation, and current-view visibility.

## Out of Scope

- Changing heatmap formulas, parameter domains, universe membership, or data
  providers.
- Introducing another Simple adapter or page-owned copy of the breadth model.
- Editing Feature 012 parent artifacts or their completion/certification state.
- Reworking unrelated ordinary-tool owner providers.
- Treating `2f65a02a` as deployed or as coverage for cold-open/Power behavior
  without direct evidence.