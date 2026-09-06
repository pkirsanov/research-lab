# User Validation: BUG-009 — Declared Wait Budgets Must Be Reachable

## Status of this checklist

**Delivered.** This packet's opening text formerly read "Nothing has been delivered yet" and
described the packet as discovery, reproduction, root cause, and design only. That is stale: both
scopes now record **Status: Done** and all 15 Definition-of-Done items in `scopes.md` are checked,
with zero unchecked. The text has been corrected rather than left to contradict the packet's record.

The items below are now checked on the repository operator's explicit authorization dated
2026-08-27, transcribed by automation. Acceptance is not certification: `status` and
`certification.status` remain `in_progress`, and gates other than G136 are still failing.

## Automation Readiness

Automation MAY check these, and doing so grants no acceptance whatsoever. Only items this turn
verified first-hand are checked; the rest are deliberately left unchecked rather than bulk-ticked.

- [x] Both scopes in `scopes.md` record **Status: Done**, and all 15 Definition-of-Done items are
      checked with zero unchecked. Read directly from `scopes.md` in this turn.
- [ ] The Playwright and selftest figures cited in the Checklist were re-derived by this agent. They
      were not. Those runs were executed in earlier turns and are attributed in `report.md`; this
      turn read that evidence and did not reproduce it.
- [ ] Independent validate-owned certification has completed. It has not: top-level `status` and
      `certification.status` remain `in_progress`, and the transition guard still reports failing
      gates other than G136.

## Checklist

- [x] **What:** The two heatmap context regressions no longer fail on a busy machine.
  - **Steps:**
    1. Put the host under load (several concurrent builds, or eight busy loops).
    2. Run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/contextual-tooltip.spec.mjs`.
  - **Expected:** all four tests pass. `SCN-012-003` and `SCN-012-004` wait for hydration instead of being killed at 30 s.
  - **Verify:** command exit code `0`.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** Reproduced failing today at `report.md#repro-pressure`.

- [x] **What:** No test waits for less time than it says it will.
  - **Steps:**
    1. Run `node scripts/validate-playwright-timeout-budgets.mjs`.
  - **Expected:** exit `0`, and it reports having scanned a non-zero number of declarations.
  - **Verify:** command exit code `0`.
  - **Evidence:** `report.md` — pending scopes 01 and 02.
  - **Notes:** Must exit non-zero on the pre-fix tree first; a guard only ever seen green proves nothing.

- [x] **What:** The suite still tests everything it tested before.
  - **Steps:**
    1. Run `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --list`.
  - **Expected:** 498 tests, none removed or skipped.
  - **Verify:** listed test count.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** Guards against "fixing" the red by deleting or skipping tests.

- [x] **What:** Nothing was made easier to pass.
  - **Steps:**
    1. Review the committed diff for this bug.
  - **Expected:** only `test.setTimeout` declarations added and one `test.slow()` replaced. No assertion, wait condition, or declared wait budget altered. `playwright.config.mjs` unchanged.
  - **Verify:** diff review.
  - **Evidence:** `report.md` — pending scope 02.
  - **Notes:** The prohibition list is in `design.md` §2.3.

Each box above was checked on the operator's instruction dated 2026-08-27 and transcribed by
automation. Automation did not judge these statements to be true and is not asserting them.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-27/28. The operator did not separately exercise this behaviour in a live session; they
authorized on the basis of the verification reported to them. That is exactly why the method below
is `external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's dated directive **is** the record. No UAT ticket, sign-off ID,
or other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-27
- method: external-record
- record: Operator directive in the 2026-08-27/28 working session, quoted verbatim — "authorized, approved, update all user validations as approved" and "Don't stop for user review, commit, continue, user approves all". Transcribed by automation 2026-08-28; the directive itself is the acceptance artifact and no external ticket exists.
