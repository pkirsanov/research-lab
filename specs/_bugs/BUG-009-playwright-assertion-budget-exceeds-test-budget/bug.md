# BUG-009 — A Declared Assertion Budget Larger Than The Test Budget That Contains It

- **Status:** Fixed — awaiting independent verification. This line previously read
  "fix designed, **fix not implemented**", which contradicted the packet's own record: both
  scopes are Done, all fifteen Definition of Done items are ticked, the three declarations are
  reachable through `test.setTimeout(180_000)`, and the Scope 1 budget-coherence guard is live
  at `scripts/selftest.mjs:9496`. The header was stale, not the work. `Verified` remains the
  validating agent's to set.
- **Severity:** Medium (active intermittent CI/local red; one site is latent)
- **Reported:** 2026-08-18
- **Affected features:** [`specs/012-market-action-center-and-guided-tools`](../../012-market-action-center-and-guided-tools), [`specs/006-trend-dynamics-cycle-lab`](../../006-trend-dynamics-cycle-lab)
- **Surfaced by:** [`specs/015-recommendation-outcome-ledger-and-track-record`](../../015-recommendation-outcome-ledger-and-track-record) scope `01-frozen-claim-contract`, row `T-01-R2`

## Summary

Three committed Playwright wait declarations name a budget larger than the test budget that
encloses them. `playwright.config.mjs` declares no `timeout`, so Playwright's per-test default
governs, and the runner itself reports that default as **30000 ms** for both projects. A wait that
asks for 60 s or 120 s inside a 30 s test cannot be honoured: the enclosing budget expires first and
kills the test while the wait is still running. The larger number is unreachable — it is, in effect,
dead code that reads as if it were a guarantee.

This is a contradiction between two declarations, not a tuning preference. The author asked for a
longer wait; the runtime silently caps it.

## Reproduction

Both halves were executed this session on an 8-core host.

**1. Static — deterministic, load-independent.** Three declarations exceed the budget that contains
them. Attribution is per test, and for waits written inside a shared helper it is to the weakest test
that can reach the helper through the call graph.

| Site | Declared | Enclosing budget | Reached via |
|---|---|---|---|
| `tests/contextual-tooltip.spec.mjs:11` | 120000 ms | **30000 ms** | helper `waitForHeatmap()` ← weakest caller |
| `tests/trend-dynamics-cycle-lab.spec.mjs:1035` | 60000 ms | **30000 ms** | test at line 985 |
| `tests/trend-dynamics-cycle-lab.spec.mjs:1040` | 60000 ms | **30000 ms** | test at line 985 |

`waitForHeatmap()` has three callers and **none** of them can honour 120 s: the tests at lines 21 and
63 declare nothing (30 s), and the test at line 152 declares `test.slow()`, which yields 3× the
default — 90 s, still short of 120 s.

**2. Dynamic — the failure itself.** Under added CPU pressure both undeclared callers fail, and the
runner prints the contradiction in its own words:

```
Test timeout of 30000ms exceeded.
Error: expect(locator).toHaveAttribute(expected) failed
Locator:  locator('body')
Expected: "ready"
Received: "loading"
Call log:
  - Expect "toHaveAttribute" with timeout 120000ms
```

`Test timeout of 30000ms exceeded` and `with timeout 120000ms` are the two halves of the defect on
adjacent lines. The observed attribute is `"loading"` — the page was still working, not wrong.

## Expected vs actual

- **Expected:** a wait declared at 120 s is allowed to wait up to 120 s.
- **Actual:** it is terminated at 30 s by the enclosing test budget, and the test fails with a
  timeout that names a number the author never wrote.

## Corrections to the reported symptom

Two claims in the incoming report did not survive verification, and the packet records the corrected
position rather than the reported one.

1. **`tests/simple-production-wiring.spec.mjs` is not defective.** Its 600000 ms and 60000 ms waits
   sit in helpers reachable only from tests that raise their own budget to 600000 ms (line 209) and
   900000 ms (line 863). Attribution to the weakest reachable caller yields 600000 ms and 900000 ms
   respectively, so no declaration exceeds its container. One residual fragility is recorded in
   `design.md` and is **not** claimed as this defect.
2. **`tests/simple-models.spec.mjs` is not this defect.** It declares no wait budget anywhere
   (`grep` exit 1). Its reported failure is load starvation under a shared 8-core host and is out of
   scope here.

## Impact

- `T-01-R2` in `specs/015` scope `01-frozen-claim-contract` is red and unticked, and that scope's
  Change Boundary forbids it from touching neighbouring features' test files. Its report already
  routes this to the Feature 012 owner "for the 30 s / 120 s budget mismatch". This packet is that
  work.
- Two Feature 012 regression tests (`SCN-012-003`, `SCN-012-004`) fail intermittently whenever the
  host is loaded, which trains readers to discount a red suite.
- The Feature 006 site is currently **latent**: the test completes in 4.4 s under pressure, so the
  unreachable 60 s declaration has not yet cost anything. It is still a contradiction, and it is
  exactly the shape that becomes active the moment the page gets slower.

## Why this is not "flakiness to be tolerated"

Anti-drift **D18** warns against widening a timeout to turn a red green, and that warning is right
where a gate has headroom and expiry signals starvation. This is the inverse case: the assertion
budget is already declared larger, and the enclosing budget is silently smaller. Raising the
enclosing budget does not weaken any assertion — it makes an already-declared intent reachable.
Nothing that fails today would pass tomorrow for any reason other than being given the time its
author already asked for.

The measured evidence supports that directly: the test at `contextual-tooltip.spec.mjs:152` runs the
**same** `waitForHeatmap()` helper and took **31.3 s** on an unloaded-enough run — over the 30 s
default. It passed only because it declares `test.slow()`. Its two siblings do the same work with no
declaration. The difference between green and red is the declaration, not the behaviour under test.

## Convention, not novelty

The repository already applies the fix shape in **33 `test.setTimeout(...)` call sites across 10
spec files**, plus **5 `test.slow()` sites across 4 files**, out of 49 spec files — including
`180_000` and `120_000` values identical to what this fix needs. The three defective sites simply
omit the declaration.

## Artifacts

| Artifact | Purpose |
|---|---|
| `bug.md` | this file |
| `spec.md` | the invariant that must hold |
| `design.md` | root cause, fix design per file, guard design, rejected alternatives |
| `scopes.md` | two scopes with Gherkin, test plan, and DoD |
| `report.md` | executed evidence for every figure above |
| `scenario-manifest.json` | scenario contract registry |
| `state.json` | execution state |
