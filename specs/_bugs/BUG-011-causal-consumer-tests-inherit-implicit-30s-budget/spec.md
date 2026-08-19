# Spec: BUG-011 — A Test Budget Must Be Declared, Not Inherited

## Problem statement

Playwright applies a per-test budget of 30000 ms when a configuration declares no `timeout`. That
number is a runner default, not a statement about any particular test. A test whose legitimate work
approaches or exceeds it will pass alone and fail under parallelism, and the failure names a limit
that appears nowhere in the file.

The defect is the silence. A budget that no one chose cannot be reviewed, and the first evidence
that it was wrong is an intermittent red.

## Expected behaviour

**INV-011-1 — declared budget.** Every test in `tests/causal-rotation-consumers.spec.mjs` declares an
explicit budget covering the work it performs, with margin for the contention created by running the
committed suite at its configured worker count.

**INV-011-2 — the suite is green under its own parallelism.** The full committed suite, run exactly
as the repository runs it, reports zero failures attributable to this file.

**INV-011-3 — nothing is weakened.** Satisfying INV-011-1 changes no assertion, no wait condition,
no declared wait budget, and no helper behaviour. Specifically it does not introduce `retries`, does
not mark any test `.skip` or `.fixme`, deletes no assertion, and does not relax `enterOwnerView`.

**INV-011-4 — the coherence guard still holds.** `scripts/validate-playwright-timeout-budgets.mjs`
(BUG-009, INV-009-1) exits 0 after the change, and continues to observe this file. Raising an
enclosing budget may never create an unreachable wait declaration elsewhere.

**INV-011-5 — the suite is unreduced.** The change removes, skips, or renames no test. The committed
suite still enumerates 498 tests.

## Acceptance criteria

| ID | Criterion |
|---|---|
| AC-1 | Every test in `tests/causal-rotation-consumers.spec.mjs` declares `test.setTimeout(...)` as its first statement. |
| AC-2 | The declared value is an existing in-repo magnitude, not a new one. |
| AC-3 | The file passes in isolation. |
| AC-4 | The full committed suite runs with zero failures in this file. |
| AC-5 | `node scripts/selftest.mjs` reports 0 failed, with the assertion count not below the pre-change count. |
| AC-6 | `node scripts/validate-playwright-timeout-budgets.mjs` exits 0. |
| AC-7 | `playwright.config.mjs` is unchanged — no suite-wide `timeout`, no `retries`. |
| AC-8 | The committed diff for this fix is additive only: no line of existing test logic is modified or deleted. |
| AC-9 | The suite still enumerates 498 tests. |

## Out of scope

- **Making the three owner pages load faster.** This packet changes how long the test may take, not
  what the page does. `sector-research-lab.html`, `global-rotation-lab.html` and
  `real-assets-lab.html` are untouched.
- **Replacing `waitForLoadState('networkidle')` with a deterministic wait.** Considered and
  rejected with reasons in `design.md` §3. It requires a page-level readiness marker that these
  three pages do not expose, and adding one is a Feature 001 product change.
- **Other intermittently slow spec files.** `tests/simple-production-wiring.spec.mjs` runs for 7.0 m
  and creates much of the contention, but it declares its own budgets and is green. Its cost is
  recorded as context, not claimed as this defect.
- **Any change inside `specs/015-recommendation-outcome-ledger-and-track-record`.** That packet has
  in-flight uncommitted work and is untouched here.

## Traceability

| Invariant | Scenario | Scope |
|---|---|---|
| INV-011-1 | SCN-011B-001 | 01 |
| INV-011-2 | SCN-011B-002 | 01 |
| INV-011-3 | SCN-011B-003 | 01 |
| INV-011-4 | SCN-011B-004 | 01 |
| INV-011-5 | SCN-011B-005 | 01 |
