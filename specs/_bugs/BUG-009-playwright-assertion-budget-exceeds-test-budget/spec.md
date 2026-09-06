# Spec: BUG-009 — Declared Wait Budgets Must Be Reachable

## Problem statement

A Playwright wait declaration (`expect(...).toX(..., { timeout: N })`, `expect.poll(..., { timeout: N })`,
`page.waitFor*(..., { timeout: N })`) states how long the author is willing to wait for a condition.
The enclosing test budget states how long the runner will let the whole test run. When `N` exceeds
the enclosing budget, the declaration is unreachable: the runner terminates the test before the wait
can expire on its own terms.

An unreachable declaration is worse than a wrong one. It reads as a guarantee, it survives review
because the number looks deliberate, and it fails with an error naming a limit the author never
wrote.

## Expected behaviour

**INV-009-1 — budget coherence.** For every wait declaration in `tests/**/*.spec.mjs`, the declared
budget must be less than or equal to the effective budget of every test that can reach it.

The effective budget of a test is, in precedence order:

1. the largest `test.setTimeout(N)` in the test body, else
2. `3 × projectDefault` if the body calls `test.slow()`, else
3. the largest `test.setTimeout(N)` declared in a `test.beforeEach` in the same file, else
4. the project default from `playwright.config.mjs`, or Playwright's own default when the config
   declares none.

For a declaration written inside a module-level helper, the enclosing budget is the **minimum**
effective budget across every test that reaches that helper, directly or transitively. A helper
cannot know its caller, so it must be safe for the weakest one.

**INV-009-2 — the invariant is enforced mechanically.** A committed guard derives the above from the
committed sources and fails when INV-009-1 is violated. It reports the file, the line, the declared
value, the enclosing value, and the attribution path.

**INV-009-3 — the guard cannot pass vacuously.** A scan that matches zero wait declarations, or zero
test blocks, is itself a failure. A guard whose pattern silently stops matching would otherwise
reproduce the blind spot it exists to close.

**INV-009-4 — assertion strength is preserved.** Satisfying INV-009-1 must not change what any test
asserts, which conditions it waits for, or how long it is *willing* to wait. Only the enclosing test
budget may be raised.

## Acceptance criteria

| ID | Criterion |
|---|---|
| AC-1 | `tests/contextual-tooltip.spec.mjs` — every caller of `waitForHeatmap()` has an effective budget of at least the 120000 ms the helper declares, plus room for the rest of the test. |
| AC-2 | `tests/trend-dynamics-cycle-lab.spec.mjs` — the test at line 985 has an effective budget covering both sequential 60000 ms polls it declares. |
| AC-3 | The guard exits non-zero on the committed pre-fix tree, naming exactly the 3 known sites, and exits zero after the fix. |
| AC-4 | The guard stays green on the two verified near-miss shapes: an in-test `setTimeout` that legitimately exceeds a sibling's budget (`simple-model-adapters-macro-fundamental.spec.mjs:630,634`) and a `beforeEach`-declared budget (`market-brief-session-date-drift.spec.mjs:28`). |
| AC-5 | The guard fails on a synthetic re-introduction of the defect in a scratch fixture, proving it is not tautological. |
| AC-6 | No assertion, wait condition, or declared wait budget is weakened anywhere. |
| AC-7 | `playwright.config.mjs` gains no `timeout` key. |
| AC-8 | The full committed Playwright suite retains all 498 tests, with no test removed, skipped, or newly failing. |

## Out of scope

- `tests/simple-models.spec.mjs` load starvation. It declares no budget and is a capacity symptom,
  not a budget contradiction.
- Making heatmap hydration faster. This packet makes the declared wait reachable; it does not change
  what is being waited for.
- Any change inside `specs/015-recommendation-outcome-ledger-and-track-record`. That scope is
  forbidden from touching these files and must not close `T-01-R2` by editing them.

## Domain Capability Model

This packet delivers **one reusable capability and three applications of it**, which is why it reads
as repeated work rather than three unrelated edits.

**The capability is budget coherence:** for any Playwright test, every wait the author declared
inside it must fit within the enclosing test budget that governs it. A declaration that cannot be
honoured is a contradiction the runner resolves silently, by failing at the smaller number.

The capability is realised once, repository-wide, as `scripts/validate-playwright-timeout-budgets.mjs`.
It is not scoped to the two files this packet repairs; it evaluates every declared wait in every
spec file, which is what makes it a foundation rather than a fixture. `design.md` §3 records it as
"the durable value of this packet" for exactly that reason: without it the next author adds a
fourth contradiction and nothing notices.

The three repairs are **instances**, not separate capabilities. Each is the same corrective act —
raise the enclosing budget so the author's declared tolerance becomes reachable — applied at a site
where the contradiction already exists. They are enumerated with their differences in
`design.md` § Concrete Implementations and § Variation Axes.

## Traceability

| Invariant | Scenario | Scope |
|---|---|---|
| INV-009-1 | SCN-009B-001, SCN-009B-002 | 02 |
| INV-009-2 | SCN-009B-003 | 01 |
| INV-009-3 | SCN-009B-005 | 01 |
| INV-009-4 | SCN-009B-004 | 02 |
