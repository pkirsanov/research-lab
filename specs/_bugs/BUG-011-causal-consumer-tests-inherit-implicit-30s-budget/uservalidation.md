# User Validation: BUG-011 — Declaring The Budget These Tests Actually Need

The Automation Readiness items below remain **unchecked**, and deliberately so: a readiness box
records a fact this agent observed first-hand, and no Playwright or selftest measurement in this
packet was executed by this agent. All such figures were produced by the operator and are recorded
in `report.md` as reported observations. This update did not change that, and did not tick them.

What changed is the Checklist. Its items are now checked, and the basis is the repository operator's
explicit authorization dated 2026-08-27, transcribed here by automation. They are **not** checked on
automation's own judgement. A checked readiness box would not have granted acceptance in any case —
acceptance is the Checklist plus the acceptance record, and only a human establishes it.

Acceptance is not certification. This packet's `status` and `certification.status` remain
`in_progress`, and gates other than G136 are still failing.

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

- [x] Running the whole test suite the way the repository runs it no longer reports
      `tests/causal-rotation-consumers.spec.mjs` as red on a busy machine.
- [x] The two Feature 001 guarantees those tests exist to hold — that causal context may sit beside
      an owner verdict, and may never change one — are still being checked. The red went away because
      the tests were given the time their work takes, not because anything is checked less.
- [x] Nothing became easier to pass: no retries were added, no test was skipped or marked fixme, no
      assertion was deleted, and `enterOwnerView` still fails when no owner view can be reached.
- [x] The suite still contains every test it contained before the change.
- [x] The limitation is understood and accepted as the scope of this packet: the `networkidle` settle
      is still timing-dependent, and only its allowance grew. A slower machine can still exhaust the
      larger budget. Replacing that wait with a condition-based one needs a readiness marker the three
      owner pages do not expose, and is recorded in `spec.md` as out of scope, not as done.

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
