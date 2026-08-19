# User Validation: BUG-009 — Declared Wait Budgets Must Be Reachable

## Status of this checklist

**Nothing has been delivered yet.** This packet contains discovery, reproduction, root cause, and
design only. The items below are therefore recorded **unchecked because the work is not done**, not
because a user reported a regression. Do not read an unchecked box here as a user-reported failure.

They become checkable once scope 01 and scope 02 are implemented under a delivery-capable workflow
mode.

## Checklist

- [ ] **What:** The two heatmap context regressions no longer fail on a busy machine.
  - **Steps:**
    1. Put the host under load (several concurrent builds, or eight busy loops).
    2. Run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs`.
  - **Expected:** all four tests pass. `SCN-012-003` and `SCN-012-004` wait for hydration instead of being killed at 30 s.
  - **Verify:** command exit code `0`.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** Reproduced failing today at `report.md#repro-pressure`.

- [ ] **What:** No test waits for less time than it says it will.
  - **Steps:**
    1. Run `node scripts/validate-playwright-timeout-budgets.mjs`.
  - **Expected:** exit `0`, and it reports having scanned a non-zero number of declarations.
  - **Verify:** command exit code `0`.
  - **Evidence:** `report.md` — pending scopes 01 and 02.
  - **Notes:** Must exit non-zero on the pre-fix tree first; a guard only ever seen green proves nothing.

- [ ] **What:** The suite still tests everything it tested before.
  - **Steps:**
    1. Run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list`.
  - **Expected:** 498 tests, none removed or skipped.
  - **Verify:** listed test count.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** Guards against "fixing" the red by deleting or skipping tests.

- [ ] **What:** Nothing was made easier to pass.
  - **Steps:**
    1. Review the committed diff for this bug.
  - **Expected:** only `test.setTimeout` declarations added and one `test.slow()` replaced. No assertion, wait condition, or declared wait budget altered. `playwright.config.mjs` unchanged.
  - **Verify:** diff review.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** The prohibition list is in `design.md` §2.3.
