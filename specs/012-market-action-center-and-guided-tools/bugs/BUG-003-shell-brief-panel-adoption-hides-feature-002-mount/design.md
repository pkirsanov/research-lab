# Bug Fix Design: BUG-003 Reconcile TP-10-02 To The Ratified Shell Brief-View Contract

## The Decision

**Feature 012's shell behaviour is CORRECT AS AUTHORED. No product or shell code
changes. The per-tool brief lives in the shell's Brief view. TP-10-02 is an
un-reconciled straggler and is reconciled to the shell.**

Decision owner: Feature 012. Recorded here as ratified; not re-litigated.

### Evidence Point 1 — the Brief view is a deliberate, committed top-level view

`tool-experience.config.json` authors the ordinary view set with `brief` as a
first-class member, defaulting to `simple`:

```json
    "ordinary-four-view/v1": {
      "viewSetId": "ordinary-four-view/v1",
      "kind": "ordinary",
      "registryToolId": null,
      "viewIds": ["simple", "power", "brief", "journey"],
      "labels": ["Simple", "Power", "Brief", "Journey"],
      "defaultViewId": "simple"
    },
```

This is an authored contract, not an accident of the shell refactor. `rlviews.js`
derives `var MODES = SHELL.viewIds.slice()` (L16) and boots at
`var current = SHELL.defaultViewId` (L20) directly from that config.

### Evidence Point 2 — Feature 002's own Scope 10 suite already ratified this contract

`tests/distributed-briefs.spec.mjs` (TP-10-04 .. TP-10-16, 13 tests) routes **every**
one of its tests through a `mountReady()` helper that performs the view switch, and
documents exactly why (L19-L27):

```js
async function mountReady(page, ctx, toolId) {
    await page.goto(harnessUrl(ctx.server.baseUrl, toolId), { waitUntil: 'load' });
    // The shared brief renders inside the shell's "Brief" view (feat(brief): brief lives only in Brief
    // view). Ordinary tools boot in their default "simple" view, so drive the real rlviews control to the
    // Brief view — exactly as every other shell regression does — before asserting the brief is visible.
    await page.waitForSelector('#rlviews[data-rlexperience-shell="ready"]', { timeout: 20000 });
    await page.locator('#rlviews button[data-rlview-mode="brief"]').click();
    await page.waitForSelector('[data-rlbrief-mount][data-rlbrief-ready="1"]', { timeout: 20000 });
}
```

Those 13 tests **pass** (verified: `13 passed (7.6s)`, exit 0 — see
[report.md](report.md) § Sibling Suite). Feature 002 therefore did not merely tolerate
the shell contract; it adopted it inside its own acceptance suite.

### Evidence Point 3 — TP-10-02 is the only family member never reconciled

`tests/distributed-briefs.static.integration.mjs` contained **zero** references to the
view-switch control, while its sibling contains one:

```
$ grep -c 'rlview-mode' tests/distributed-briefs.static.integration.mjs
0
$ grep -c 'rlview-mode' tests/distributed-briefs.spec.mjs
1
```

It is a straggler, not a dissenting contract.

### Evidence Point 4 — the brief is reachable and already loaded, so there is no user harm

The pre-fix failure log shows the mount resolving 32 consecutive times as
`data-rlbrief-ready="1" data-rlbrief-state="ready" data-rlexperience-state="registered"`
— fully settled, merely `hidden`. Selecting the Brief view reveals that same node with
**no refetch**: after the view switch the reconciled test still asserts
`mode switch performs no refetch` and `no history partition before Open history`, and
passes. This is precisely why [bug.md](bug.md) rates the defect **High** and not
**Critical**.

### Why the two contracts are NOT actually mutually exclusive

[bug.md](bug.md) § Expected Behavior stated that Feature 002's contract ("mount ready
and visible once the page has loaded, without navigating anywhere") and Feature 012's
contract ("the brief lives only in the Brief view") "are mutually exclusive as
currently written". That framing was drawn from TP-10-02 alone and does not survive
contact with the rest of Feature 002's own suite.

Feature 002's *ratified* contract — the one its 13-test Scope 10 regression suite
actually encodes — is: **a coherent current brief graph produces a verified,
already-loaded mount that renders ready in the Brief view with no refetch.** That is
satisfied by the Feature 012 shell exactly as authored. The apparent conflict was
confined to a single test that was never updated when the shell landed; it was a
reconciliation debt, not a contract collision. Once TP-10-02 adopts the same
`mountReady` sequencing its siblings already use, both features hold their contracts
simultaneously and no behaviour has to be traded away.

---

## Root Cause Analysis

### Investigation Summary

Reproduced deterministically in isolation (`node --test`, exit 1, ~16 s), then
re-reproduced causally by stashing only the fix and re-running (see
[report.md](report.md) § Causal RED Re-Proof). The shell source was read to confirm the
adoption is unconditional rather than brief-state dependent.

### Root Cause

`rlviews.js::buildPanels()` (L120-L139) appends the Feature 002 anchor into the `brief`
panel and marks every panel `hidden` at construction:

```js
      if (mode === "brief" && ANCHOR) {
        panel.appendChild(ANCHOR);
```
```js
      panel.hidden = true;
```

`rlviews.js::applyVisual()` (L141-L150) then unhides only the current mode:

```js
      panels[panelMode].hidden = panelMode !== mode || ownerPlaceholder;
```

Ordinary tools boot at `simple`, so the `brief` panel — and the anchor inside it —
stays `hidden`. Playwright's `waitForSelector` defaults to `state: 'visible'`, so an
attached-but-collapsed element times out. The adoption at L124-L125 is guarded only by
`mode === "brief" && ANCHOR`, i.e. it is **independent of brief load outcome**, which is
why the fail-closed integrity-error block needed the same reconciliation as the
coherent-graph block.

### Impact Analysis

- **Affected components:** one test file, `tests/distributed-briefs.static.integration.mjs`.
- **Affected data:** none. No fixture, pointer, object or registry byte changes.
- **Affected users:** none. The brief remains reachable in the Brief view with no
  refetch; only the Feature 002 acceptance assertion was out of date.
- **Blast radius of the *behaviour*:** 23 pages host a `data-rlbrief-mount`
  (`grep -l 'data-rlbrief-mount' *.html | wc -l` → `23`). All 23 inherit the ratified
  Brief-view contract; the decision creates **zero** page-level work.

---

## Fix Design

### Solution Approach

Apply the sibling's ratified pattern verbatim. A module-local `openBriefView(page)`
helper waits for `#rlviews[data-rlexperience-shell="ready"]`, then clicks
`#rlviews button[data-rlview-mode="brief"]`. It is invoked at **both** mount-wait sites,
immediately after `page.goto(...)` and immediately before the pre-existing
`waitForSelector(..., { timeout: 15000 })`, which is left byte-identical.

**Sequencing proof (FR-B003-03).** The switch is placed before every network-window
baseline it could perturb:

| Assertion | Line | Why the switch cannot invalidate it |
|---|---|---|
| `no history partition before Open history` | 53 | Evaluated *after* the switch, so it now additionally proves the view switch itself fetches no history partition — strictly stronger. |
| `mode switch performs no refetch` | 59 | Its baseline `beforePower` is snapshotted *after* the switch, so the switch is outside the measured window by construction. |
| `no partition fetched until a filter is selected` | 69 | Downstream of "Open history"; unaffected. |
| `exactly one selected partition fetched` | 75 | Counts only `/briefs/history/*`; the switch issues none. |

`cacheHeaders` is populated by a `page.on('response')` listener registered before
`goto`, so the `no-store` / `immutable` assertions are likewise unaffected.

### Constraints honoured

- Additive only: `13 insertions(+), 0 deletions(-)`.
- Assertion count unchanged: 15 → 15.
- `state: 'attached'` occurrences: 0 — visibility is still the assertion.
- `.skip` count unchanged: 1 → 1 (the pre-existing "Playwright runtime unavailable"
  guard, untouched).
- Mount-wait timeouts unchanged at 15000 ms. The only new timeout (20000 ms) belongs to
  the newly-introduced shell-ready wait and is copied from the ratified sibling, so no
  existing timeout was extended to mask anything. The reconciled test completes in
  ~2.2 s, versus a 15 s timeout exhaustion pre-fix — it passes by satisfying the wait,
  not by outlasting it.

### Single-Implementation Justification

There is exactly **one** implementation of the brief-view sequencing in this packet, and
that is deliberate.

The behaviour "wait for the shell to report ready, then drive the real `rlviews` control
to the Brief view" already has a ratified implementation:
`tests/distributed-briefs.spec.mjs::mountReady()`, used by all 13 sibling regressions.
This packet does **not** design a second one, a provider seam, a strategy interface, an
adapter or a variation axis. It copies that sequence into the one file that never adopted
it, and pins the copy behind a single module-local `openBriefView(page)` so both call
sites in that file are physically incapable of drifting apart.

A capability foundation with concrete implementations and variation axes would be
actively harmful here. The root cause of BUG-003 is that a family of 14 tests had 13
members on one sequencing and 1 member on another; the remedy is convergence on a single
implementation, not a framework that legitimises more than one. Nothing in this packet is
parameterised, pluggable or swappable, and no second variant is anticipated: the shell
publishes one `brief` view, the tool pages host one `[data-rlbrief-mount]` anchor, and
`ordinary-four-view/v1` is a single authored contract.

The cross-file abstraction question (hoisting `openBriefView` into
`tests/distributed-briefs.support.mjs` so the sibling suite and this test literally share
one function) is **out of scope by boundary, not by convenience**: it would edit
`tests/distributed-briefs.spec.mjs`, which FR-B003-06 requires to stay byte-identical.
The `openBriefView` doc comment therefore cites `mountReady` explicitly so the shared
contract is discoverable from both sides.

### Alternative Approaches Considered

1. **Change `rlviews.js` so the brief anchor stays visible in the default view** —
   rejected: it contradicts the ratified `ordinary-four-view/v1` contract, would break
   the 13 sibling tests that assert the Brief-view residency, and the owner decision
   explicitly forbids product/shell change.
2. **Relax TP-10-02's wait to `state: 'attached'`** — rejected: it would silently stop
   proving the brief is *rendered*, weakening a required Feature 002 acceptance
   assertion to make a red test green.
3. **Duplicate the anchor into both the default view and the Brief panel** — rejected:
   two live mounts for one tool invites double-render and double-fetch, and directly
   contradicts "brief lives only in Brief view".
4. **Mark TP-10-02 `.skip` until the contract is revisited** — rejected: it deletes
   Feature 002 Scope 10 coverage rather than reconciling it.

## Complexity Tracking

| Decision | Simpler fix considered | Why rejected |
|----------|------------------------|--------------|
| Extracted a shared `openBriefView(page)` helper instead of inlining the two lines twice | Inline the shell-ready wait + click at each of the two call sites | Two call sites needed identical sequencing; a single helper keeps the contract comment authoritative in one place and guarantees the fail-closed block cannot drift from the coherent block. |
