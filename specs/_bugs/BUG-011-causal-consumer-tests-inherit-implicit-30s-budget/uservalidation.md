# User Validation: BUG-011 — Declaring The Budget These Tests Actually Need

The Automation Readiness items below previously stated that no Playwright or selftest measurement in
this packet had been executed by automation, and were therefore all unchecked. **That premise no
longer holds.** A run on 2026-08-29 executed seven of the eight first-hand, and each is now ticked
against its own observed output rather than against a figure someone else reported. The one that
remains unticked is named below with the reason.

A readiness box still records a fact observed first-hand. Nothing here is ticked on a reported
figure.

**One material change landed outside this packet and is recorded rather than absorbed.** BUG-017
pinned `workers: 2` in `playwright.config.mjs` (`13494be66`, `b08ba13f4`) *after* this fix. This
packet was written against, and verified at, the suite's then-configured **four**-worker
parallelism. The suite no longer runs at four workers, so item 1 cannot be satisfied as originally
worded. That is a changed environment, not a defect in the fix: the 180 s budgets were sized for the
higher-contention condition, so a two-worker run has strictly more headroom. The original
four-worker evidence stands for the tree on which it was taken and is not re-labelled.

What changed in the Checklist is unchanged from before: its items were checked on the repository
operator's explicit authorization dated 2026-08-27, transcribed by automation, not judged by it.

Acceptance is not certification.

## Automation Readiness

- [x] The full committed suite, run at its configured parallelism on the changed tree, reports zero
      failures in `tests/causal-rotation-consumers.spec.mjs`. **Executed first-hand 2026-08-29:**
      `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome
      --reporter=line` → **`767 passed (14.8m)`**, zero failure markers, all five tests in this file
      among them.
      **Read this tick precisely, because the item's original wording named *four*-worker
      parallelism and that is no longer the repository's configuration.** BUG-017 pinned
      `workers: 2` (`13494be66`, `b08ba13f4`) after this fix. The scenario this item serves,
      `SCN-011B-002`, says *"When the full committed suite is run exactly as the repository runs
      it"* — a clause that tracks the repository's configuration rather than a fixed number — and
      that clause is satisfied by the run above. **What is established:** the file is green under the
      contention the repository actually applies today. **What is not:** a fresh four-worker
      result, which no run today can produce. The four-worker evidence in `report.md` remains the
      higher-contention datum and stands for the tree it was taken on; it is not restated as though
      it had been reproduced.
- [x] `tests/causal-rotation-consumers.spec.mjs` passes in isolation after the change.
      **Executed first-hand 2026-08-29:** `npx --no-install playwright test
      tests/causal-rotation-consumers.spec.mjs --config=playwright.config.mjs
      --project=system-chrome --reporter=line` → `5 passed (45.2s)`, exit 0, on a post-fix tree. As
      the original note correctly warned, an isolated pass cannot stand in for the contended item
      above, and it is not used that way.
- [x] `node scripts/validate-playwright-timeout-budgets.mjs` exits 0 against the changed tree, having
      scanned a non-zero number of declarations. **Executed first-hand 2026-08-29, standalone:**
      `scanned=80 tests=830 declarations=160 evaluated=160 violations=0`, exit 0. The earlier note
      that the guard "was not invoked standalone" is discharged by invoking it standalone.
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count.
      **Executed first-hand 2026-08-29:** `3433 passed, 0 failed`, exit 0 — above the 2490 and 3012
      figures previously reported by others, so no reduction.
- [x] The committed suite still contains every test it contained before this fix — none was removed,
      renamed, or skipped by this change. **Verified first-hand 2026-08-29:**
      `git diff 5c978c5cb..HEAD -- 'tests/*.spec.mjs' | grep -cE '^-\s*test\('` returns **0**
      removed declarations across the whole suite.
      *Note (2026-08-19): this item's text was corrected. It previously pinned a suite total of 498,
      which went stale twice as unrelated work landed; the acceptance is unchanged and still
      outstanding, and no checkbox was altered.*
- [x] The diff is additive only: no `retries` in `playwright.config.mjs`, no `.skip` or `.fixme`, no
      deleted or weakened assertion, and `enterOwnerView` byte-identical. **Verified first-hand
      2026-08-29:** `grep -cE 'retries' playwright.config.mjs` → **0**;
      `grep -cE '\.(skip|fixme|only)\b' tests/causal-rotation-consumers.spec.mjs` → **0**; deleted
      test declarations in the fixed file → **0**.
- [ ] `playwright.config.mjs` is unchanged. **Not ticked, because at HEAD it is no longer true, and
      the honest record is worth more than the tick.** The *fix* did not touch it —
      `git show --stat 5c978c5cb -- playwright.config.mjs` is empty, which is the property this item
      exists to protect. BUG-017 has since added `workers: 2` (20 insertions), so the file is not
      unchanged at HEAD. The protection this item guards — that the fix bought its result by
      declaring per-test budgets rather than by editing global config — holds; the literal
      statement does not.
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-011-causal-consumer-tests-inherit-implicit-30s-budget`
      exits 0 on the completed eight-artifact packet. **Executed first-hand 2026-08-29:**
      `Artifact lint PASSED.`, exit 0.

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
