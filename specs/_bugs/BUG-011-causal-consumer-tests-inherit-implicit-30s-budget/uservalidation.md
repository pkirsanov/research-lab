# User Validation: BUG-011 — Declaring The Budget These Tests Actually Need

The code change is applied in the working tree, and the verification that would prove it works has
**not** reported. Every item below therefore ships **unchecked**, including the automation-readiness
items whose command was already run — because a readiness box records a fact this agent observed
first-hand, and no measurement in this packet was executed by this agent. All Playwright and selftest
figures were produced by the operator and are recorded in `report.md` as reported observations.

Automation may check the Automation Readiness section, and doing so grants no acceptance whatsoever.
Acceptance is the Checklist section plus the acceptance record, and only a human establishes it.

## Automation Readiness

- [ ] The full committed suite, run at its configured four-worker parallelism on the changed tree,
      reports zero failures in `tests/causal-rotation-consumers.spec.mjs`. **This is the decisive
      item and it has not reported.** `report.md` records the run as in flight; no tally is written
      anywhere in this packet.
- [ ] `tests/causal-rotation-consumers.spec.mjs` passes in isolation after the change. Recorded as
      not-yet-observed post-change; the pre-change isolated runs were green, which is precisely why
      an isolated pass cannot stand in for the item above.
- [ ] `node scripts/validate-playwright-timeout-budgets.mjs` exits 0 against the changed tree, having
      scanned a non-zero number of declarations. The operator's post-fix `node scripts/selftest.mjs`
      run — 2490 passed, 0 failed — exercises this guard, but the guard was not invoked standalone.
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count. Reported by
      the operator at 2490 passed / 0 failed; not re-derived here.
- [ ] The committed suite still contains every test it contained before this fix — none was removed,
      renamed, or skipped by this change.
      *Note (2026-08-19): this item's text was corrected. It previously pinned a suite total of 498,
      which went stale twice as unrelated work landed; the acceptance is unchanged and still
      outstanding, and no checkbox was altered.*
- [ ] The diff is additive only: no `retries` in `playwright.config.mjs`, no `.skip` or `.fixme`, no
      deleted or weakened assertion, and `enterOwnerView` byte-identical.
- [ ] `playwright.config.mjs` is unchanged.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget`
      exits 0 on the completed eight-artifact packet.

## Checklist

- [ ] Running the whole test suite the way the repository runs it no longer reports
      `tests/causal-rotation-consumers.spec.mjs` as red on a busy machine.
- [ ] The two Feature 001 guarantees those tests exist to hold — that causal context may sit beside
      an owner verdict, and may never change one — are still being checked. The red went away because
      the tests were given the time their work takes, not because anything is checked less.
- [ ] Nothing became easier to pass: no retries were added, no test was skipped or marked fixme, no
      assertion was deleted, and `enterOwnerView` still fails when no owner view can be reached.
- [ ] The suite still contains every test it contained before the change.
- [ ] The limitation is understood and accepted as the scope of this packet: the `networkidle` settle
      is still timing-dependent, and only its allowance grew. A slower machine can still exhaust the
      larger budget. Replacing that wait with a condition-based one needs a readiness marker the three
      owner pages do not expose, and is recorded in `spec.md` as out of scope, not as done.

## Human Acceptance Record

Acceptance has not occurred. The change is applied but unverified — the run that would let a human
see the suite green has not reported — so there is no acceptor, no acceptance date, and no acceptance
method to record. A human completes this section after exercising the delivered behaviour.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
