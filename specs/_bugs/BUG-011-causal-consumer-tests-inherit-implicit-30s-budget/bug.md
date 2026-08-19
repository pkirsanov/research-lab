# BUG-011 — Feature 001 Consumer Regressions Run On A Budget Nobody Chose

- **Status:** Fixed — root cause verified, fix implemented, verified by execution
- **Severity:** Medium (intermittent suite red; no product defect)
- **Reported:** 2026-08-18
- **Affected features:** [`specs/001-causal-rotation-intelligence`](../../001-causal-rotation-intelligence)
- **Related packet:** [`BUG-009`](../BUG-009-playwright-assertion-budget-exceeds-test-budget) — same
  defect class (a declared budget too small for the work it contains), same fix shape, same guard.

## Summary

`tests/causal-rotation-consumers.spec.mjs` fails intermittently in the full suite and passes in
isolation. `playwright.config.mjs` declares no `timeout`, so every test in the file inherits
Playwright's implicit per-test default of 30000 ms. Each test in the file drives `openOwner()` one to
three times, and every call is a **full load of a heavy analytics page** followed by a
`waitForLoadState('networkidle')` settle. Measured on a single worker with no contention, the sector
test consumes **23.7 s of that 30 s** — 79% of a budget nobody chose. Under the suite's own
four-worker parallelism, alongside a spec file that runs for 7.0 m, the remaining margin disappears
and the runner kills the test.

The budget is not a decision. It is the absence of one.

## Reproduction

Every figure below was executed in this session on this host, at HEAD `adb97b983`.

**1. In isolation the file is green, and the margin is already thin.**

```
npx --no-install playwright test tests/causal-rotation-consumers.spec.mjs \
  --config=playwright.config.mjs --project=system-chrome --reporter=list
```

`5 passed (1.2m)`, exit `0`, on **1 worker**. Per-test durations against the inherited 30 s:

| Test | Line | `openOwner()` calls | Isolated duration | Share of 30 s |
|---|---|---|---|---|
| served owner timing reads … exposure contracts | 118 | 1 | 7.4 s | 25% |
| Sector acceleration remains visible … | 151 | 3 | **23.7 s** | **79%** |
| A country causal read disagrees … | 187 | 3 | **17.5 s** | **58%** |
| Energy equities strengthen … | 213 | 3 | 5.3 s | 18% |
| consumers reject unknown causal versions … | 240 | 2 | 12.5 s | 42% |

**2. In the full suite it is red.**

```
npx --no-install playwright test --config=playwright.config.mjs \
  --project=system-chrome --reporter=line
```

`496 passed`, `2 failed` (13.4 m), exit `1`, on **4 workers**:

```
  2 failed
    [system-chrome] › tests/causal-rotation-consumers.spec.mjs:151:1 › Regression: Sector acceleration remains visible while cause is unverified
    [system-chrome] › tests/causal-rotation-consumers.spec.mjs:187:1 › Regression: A country causal read disagrees with its market model
```

The two reds are exactly the two tests that consume 79% and 58% of their budget with **zero**
contention. The correlation is not incidental; it is the defect.

The same run reports the source of the contention:

```
  Slow test file: [system-chrome] › tests/simple-production-wiring.spec.mjs (7.0m)
```

## Expected vs actual

- **Expected:** a test is given enough time to perform the work it was written to perform.
- **Actual:** it is given 30000 ms because no one wrote a number, and it is killed mid-flight once
  the machine is busy.

## Correction to the reported symptom

The incoming report located both failures inside `page.waitForLoadState('networkidle')` at
`openOwner` (line 114). That is **where one run happened to be** when the budget expired, not a
property of the defect. The failure observed in this session surfaced at a different statement:

```
  1) [system-chrome] › tests/causal-rotation-consumers.spec.mjs:151:1 › Regression: Sector acceleration remains visible while cause is unverified

    Test timeout of 30000ms exceeded.

    Error: mobile

    expect(locator).toHaveCount(expected) failed
```

`Error: mobile` identifies the assertion at line 185 — *after* the third `openOwner`, not inside it.
The constant across both observations is `Test timeout of 30000ms exceeded`: the **enclosing test
budget**, which terminates whatever operation is in flight. This matters for the fix. A defect
localised to one wait invites tuning that wait; a defect in the total budget is only fixed by
declaring the total budget. The packet fixes the latter.

## Impact

- Two Feature 001 consumer regressions report red on a loaded machine while the behaviour they guard
  — that causal context may sit beside an owner verdict and may never change one — is intact. A
  suite that reports red for reasons unrelated to the product trains readers to discount it.
- Three further tests in the same file carry the same undeclared budget and the same cost driver.
  Two of them sit at 42% and 25% of budget uncontended. They are latent, not safe.

## Why this is not "flakiness to be tolerated", and not a masked failure

Anti-drift **D18** warns against widening a timeout to turn a red green. That warning aims at a gate
with headroom, where expiry is the signal. This is the opposite case, and the measurement separates
them: the work is **23.7 s on an idle single worker**, so the test was already spending nearly its
whole budget doing legitimate work before any contention existed. Nothing is being given room to
fail more slowly; the test is being given the time its own workload requires.

The distinction is testable, and this packet tests it: the tests must pass **without** the four
prohibited shortcuts — no `retries`, no `.skip`/`.fixme`, no deleted assertion, no weakened
`enterOwnerView`. Each of those would make the red disappear while the behaviour went unverified.
Raising the enclosing budget leaves every assertion executing exactly as before.

## Convention, not novelty

`test.setTimeout(180_000)` already exists at **6 sites across 4 spec files** —
`attention-browser.spec.mjs:650`, `contextual-tooltip.spec.mjs:23,67,158`,
`technical-analysis-decision-lab.spec.mjs:861`, `trend-dynamics-cycle-lab.spec.mjs:987` — three of
which are BUG-009's own delivered fix. This packet applies the identical shape at the identical
magnitude. It introduces no new number and no new mechanism.

## Artifacts

| Artifact | Purpose |
|---|---|
| `bug.md` | this file |
| `spec.md` | the invariant that must hold |
| `design.md` | root cause, the deliberate choice between the two fix options, rejected alternatives |
| `scopes.md` | one scope with Gherkin, test plan, and DoD |
| `report.md` | executed evidence for every figure above |
| `scenario-manifest.json` | scenario contract registry |
| `uservalidation.md` | automation readiness and human acceptance |
| `state.json` | execution state |
