# Bug Spec: BUG-003 Reconcile TP-10-02 To The Ratified Shell Brief-View Contract

- **Bug ID:** BUG-003
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Victim feature:** `specs/002-distributed-tool-briefs-and-history` (Scope 10, TP-10-02)
- **Workflow mode:** `bugfix-fastlane`
- **Decision status:** Feature 012 owner decision **MADE** — see [design.md](design.md) § The Decision

---

## Summary

Feature 012's shared experience shell adopts Feature 002's declarative brief anchor
(`[data-rlbrief-mount]`) into the shell's `brief` view panel. Ordinary tools boot into
their authored default `simple` view, so the mount is attached, settled and reported
ready (`data-rlbrief-ready="1"`, `data-rlbrief-state="ready"`) but is not *visible*
until the operator selects the Brief view.

Feature 002 Scope 10 test **TP-10-02**
(`tests/distributed-briefs.static.integration.mjs`) asserted mount visibility
immediately after page load, with no view switch, and therefore failed.

The Feature 012 owner has ruled that **the shell behaviour is correct as authored**.
TP-10-02 is the single un-reconciled member of the Scope 10 brief family: its 13
siblings in `tests/distributed-briefs.spec.mjs` already drive the shell to the Brief
view before asserting visibility. This bug reconciles TP-10-02 to that same,
already-ratified contract.

---

## Expected Behavior

1. `ordinary-four-view/v1` continues to publish `["simple","power","brief","journey"]`
   with `defaultViewId: "simple"`, and the shared brief continues to live **only** in
   the `brief` view panel.
2. `tests/distributed-briefs.static.integration.mjs` (TP-10-02) waits for the shell to
   report ready, drives the real `rlviews` control to the Brief view, and only then
   asserts the mount is ready and visible — identical to
   `tests/distributed-briefs.spec.mjs::mountReady()`.
3. Every assertion TP-10-02 previously made is still made, unchanged:
   - the coherent current graph renders `data-rlbrief-state="ready"`;
   - pointers are fetched `no-store` and immutable objects are cacheable;
   - **no** history partition is requested before "Open history";
   - the Power mode switch performs **no** refetch;
   - opening history fetches the pointer and index only;
   - selecting one filter fetches **exactly one** partition;
   - a SHA-256 mismatch fails closed with `integrity-error` and no partial evidence.

---

## Actual Behavior (pre-fix)

`page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]')` — whose default
Playwright state is `visible` — timed out after 15000 ms against an element that
resolved 32 consecutive times as `hidden`, because the shell keeps every non-current
view panel `hidden`. Exit code `1`.

---

## Requirements

| ID | Requirement |
|---|---|
| FR-B003-01 | TP-10-02 MUST drive the real `rlviews` Brief-view control before asserting brief visibility, using the same mechanism as its 13 ratified siblings. |
| FR-B003-02 | The reconciliation MUST be additive: zero assertions deleted, weakened, skipped or relaxed from `visible` to `attached`. |
| FR-B003-03 | The view switch MUST NOT invalidate any network-window assertion; it MUST be sequenced before every request-count baseline it could otherwise perturb. |
| FR-B003-04 | Both mount-wait sites (coherent-graph block and fail-closed integrity block) MUST be reconciled, because the shell adopts the anchor unconditionally. |
| FR-B003-05 | No product/shell file may change: `rlviews.js`, `rlbrief.js`, `rlexperience.js`, `tool-experience.config.json` and every tool page remain byte-identical. |
| FR-B003-06 | The 13 sibling tests in `tests/distributed-briefs.spec.mjs` MUST remain green and unmodified. |

---

## Out of Scope

- **Changing the brief visibility contract.** The owner decision is recorded, not
  re-litigated. The brief remains a Brief-view resident.
- **Any product or shell code change.** This bug is closed entirely inside one test
  file plus this packet.
- **The other 22 pages that host `data-rlbrief-mount`.** They inherit the ratified
  contract unchanged; no page-level work is created by this decision.
- **Feature 002's own artifacts.** `specs/002-*` is owned by a concurrent lane and is
  not touched by this packet.

---

## Acceptance

TP-10-02 passes (exit 0), the 13 sibling regressions pass, `scripts/selftest.mjs`
reports `952 passed, 0 failed`, and `tests/simple-production-bridge.integration.mjs`
reports 6/6 with `wired (19)` — all with raw evidence in [report.md](report.md).
