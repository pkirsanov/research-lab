# Bug: BUG-003 Feature 012 Shell Adopts The Feature 002 Brief Mount Into A Brief-Only Panel

- **Bug ID:** BUG-003
- **Owning feature:** `specs/012-market-action-center-and-guided-tools`
- **Victim feature:** `specs/002-distributed-tool-briefs-and-history` (Scope 10, TP-10-02)
- **Reported by:** Feature 002 regression phase (cross-feature discovery)
- **Discovered on HEAD:** `30326253af551d198c95ead352f1301f95944539`
- **Introduced by:** `c81d808d` — `feat(012): Market Action Center Scopes 01-04 + BUG-004 two-tier provider access` (2026-07-24)
- **Status:** Resolved — Feature 012 owner decision made; TP-10-02 reconciled to the shell contract (see [design.md](design.md) § The Decision, [report.md](report.md))

> **Resolution note.** Everything below the Summary is the original **discovery-phase**
> record, preserved verbatim as the evidence that led to the decision. The blocking
> question it raises has since been answered: the Feature 012 owner ruled the shell
> **correct as authored**, and TP-10-02 — the only member of the Feature 002 Scope 10
> brief family never reconciled — was updated to drive the Brief view exactly as its 13
> siblings already do. Where the discovery record says "not fixed", read "not fixed *at
> the time of discovery*".

---

## Summary

Feature 012's shared experience shell **relocates** Feature 002's declarative brief
anchor (`[data-rlbrief-mount]`) out of its authored position in the document and
**into the shell's `brief` view panel**. That panel is `hidden` in every view other
than `brief`, and ordinary tools boot into the `simple` view. The result is that the
Feature 002 brief mount is present, fully settled and reported ready
(`data-rlbrief-ready="1"`, `data-rlbrief-state="ready"`,
`data-rlexperience-state="registered"`) but is rendered `display:none` with a 0×0
box, so any assertion that the mount is **visible** after load fails.

Feature 002 Scope 10 test **TP-10-02** asserts exactly that, and therefore fails.

This is a genuine cross-feature interaction defect, not a flaky test:

- It reproduces deterministically in isolation (`node --test`, exit 1).
- It is **not** contention — no other test process is required to trigger it.
- It is **not** a Feature 002 defect in isolation: the same test passes byte-for-byte
  at the commit immediately before the Feature 012 shell change.

---

## Severity

**High.**

- TP-10-02 is a **required** live-stack integration test for Feature 002 Scope 10's
  Definition of Done. While it fails, Feature 002 Scope 10 cannot honestly certify.
- The underlying behaviour is **wiring-independent** and applies to **every** one of
  the 23 pages that host a `data-rlbrief-mount` (see
  [design.md](design.md) § Blast Radius). It is not limited to tools already wired by
  Feature 012 Scope 15.
- It is **not** Critical: the brief content is still reachable by the user — selecting
  the shell's **Brief** view reveals the very same, already-loaded mount with no
  refetch. The damage is to the Feature 002 acceptance contract and to any consumer
  that expects the brief to be present in the default view.

---

## Status

| Field | Value |
|---|---|
| Reproduced independently | YES — see [report.md](report.md) § Independent Reproduction |
| Root cause proven | YES — causally, not by inspection alone |
| Regression window pinned | YES — PASS at `767732db`, FAIL at `c81d808d` |
| Blast radius measured | YES — 5 tool ids probed, wired and unwired |
| Fixed | **YES** — TP-10-02 reconciled to the shell contract; zero product/shell change |
| Blocking decision | **RESOLVED** — Feature 012 owner ruled the shell correct as authored (see [design.md](design.md) § The Decision) |

---

## Exact Reproduction

Repository root: `/home/redacted/research-lab`. No stack, server or fixture setup is
required — the test provisions its own ephemeral fixture graph and HTTP server.

```bash
cd /home/redacted/research-lab
node --test tests/distributed-briefs.static.integration.mjs
```

**Observed:** exit code `1`, one failing test, in ~16s.

---

## Verbatim Failure Output

```
✖ static loader verifies coherent current objects and fetches history only after selection (16086.918126ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 16209.170882

✖ failing tests:

test at tests/distributed-briefs.static.integration.mjs:13:1
✖ static loader verifies coherent current objects and fetches history only after selection (16086.918126ms)
  page.waitForSelector: Timeout 15000ms exceeded.
  Call log:
    - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible
      32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>

      at TestContext.<anonymous> (/home/redacted/research-lab/tests/distributed-briefs.static.integration.mjs:27:20) {
    name: 'TimeoutError',
    log: [ `  - waiting for locator('[data-rlbrief-mount][data-rlbrief-ready="1"]') to be visible`, '    32 × locator resolved to hidden <section data-rlbrief-mount="" data-rlbrief-ready="1" data-rlbrief-state="ready" data-power-target="rlbrief-power" data-tool-id="sector-research-lab" data-simple-target="rlbrief-simple" data-rlexperience-state="registered">…</section>' ]
  }
```

The failing call site is
[tests/distributed-briefs.static.integration.mjs](../../../../tests/distributed-briefs.static.integration.mjs#L27).
Playwright's `waitForSelector` defaults to `state: 'visible'`, which is why an
attached-but-collapsed element times out.

---

## Root Cause (one sentence)

`rlviews.js::buildPanels()` moves the Feature 002 brief anchor into the shell's
`brief` panel, and `rlviews.js::applyVisual()` keeps that panel `hidden` in every
non-`brief` view, so the mount can never be visible in an ordinary tool's default
`simple` view.

Full analysis, including the three hypotheses this evidence **disproves**, is in
[design.md](design.md).

---

## Expected Behavior

Feature 002's authored contract (Scope 10, TP-10-02) is that a coherent current
brief graph produces a mount that is **ready and visible** once the page has loaded,
without the operator first navigating anywhere.

Feature 012's shell contract, introduced separately, is that "the brief lives only in
the Brief view".

These two contracts appeared mutually exclusive as written **in TP-10-02**. The owner
decision resolved the apparent conflict without trading either contract away: Feature
002's own 13-test Scope 10 regression suite had **already adopted** the Brief-view
contract through its `mountReady()` helper, so the ratified Feature 002 expectation is a
verified, already-loaded mount that renders ready **in the Brief view** with no refetch.
TP-10-02 was simply never updated when the shell landed. See [design.md](design.md)
§ Why the two contracts are NOT actually mutually exclusive and [spec.md](spec.md)
§ Out of Scope.

---

## Work Boundary Attestation

**Discovery phase (this file's original record):** documentation only — no fix, no
product/test/script/framework file modified, only this bug directory created.

**Resolution phase:** exactly one non-packet file changed,
`tests/distributed-briefs.static.integration.mjs`, at 13 insertions and 0 deletions. No
product, shell, config, tool-page or sibling-test file was modified: `rlviews.js`,
`rlbrief.js`, `rlexperience.js`, `tool-experience.config.json`, every `*.html` tool page
and `tests/distributed-briefs.spec.mjs` are byte-identical to HEAD.

See [report.md](report.md) § Boundary Attestation for the verified evidence.
