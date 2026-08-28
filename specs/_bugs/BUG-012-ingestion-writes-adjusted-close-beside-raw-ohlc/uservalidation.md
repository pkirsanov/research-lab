# User Validation: BUG-012 — Delivered, Accepted On Operator Authorization

The fix is delivered across three commits. The Automation Readiness items below record facts about
that fix and are ticked where an executed check or a reported execution establishes them.

**Ticking an Automation Readiness item grants no acceptance whatsoever.** Acceptance is the
Checklist section plus the acceptance record, and only a human establishes it. Both are now
complete: the repository operator authorized acceptance on 2026-08-27 and automation transcribed
that authorization below. One Automation Readiness item is still deliberately unticked, because the
evidence for it was never produced and an authorization to accept is not evidence that a suite ran.

Acceptance is not certification. This packet's `status` and `certification.status` remain
`in_progress`, and gates other than G136 are still failing.

## Automation Readiness

- [x] A scan of all 293 files under `data/bars/` reports zero rows with `l > min(o, c)`, down from
      the reported 71,714. **`node scripts/validate-bars-coherence.mjs` → `scanned 292 file(s),
      150013 row(s)` / `OK: every scanned row satisfies l <= min(o, c), h >= max(o, c) and l <= h`,
      exit 0. 292 not 293 because `index.json` is a manifest, not a symbol series, and is excluded
      by name; all 292 symbol files are covered.**
- [x] `scripts/fetch-bars.mjs` cannot emit an incoherent row, proven by an adversarial vendor payload
      whose adjusted close falls below the raw low. **`scripts/selftest.mjs:8762` asserts exactly
      that payload — the COP condition itself — and passes.**
- [x] A committed coherence guard fails on an incoherent row and runs inside
      `node scripts/selftest.mjs`. **`scripts/validate-bars-coherence.mjs` is imported at
      `scripts/selftest.mjs:29`.**
- [x] The reversal fixture's resolved inputs cannot change without a reviewed commit, or a drift
      between fixture and data fails with a message naming fixture, symbol and row. **Both: inputs
      are pinned in the committed `tests/fixtures/research-agenda/reversal-ui.bars.json`, and
      `scripts/selftest.mjs:8958`/`:8984` mutate a row deliberately and assert the named message.**
- [x] A failed reversal boot causes `getViewState()` to return a non-null value carrying the refusal
      reason, proven with a deliberately injected failing input. **The original defect was induced
      via a served override (`l=124.12000274658203 c=123.6949691772461`); readiness resolved in
      373 ms, and the reason was retrieved after DOM erasure.**
- [x] The three non-fixture agenda tests at `tests/tool-experience.spec.mjs` lines 364, 458 and 713
      still pass unmodified, showing the successful boot path was untouched. **Reported 21 passed;
      success view byte-identical pre/post fix on both paths, `keys=17`.**
- [ ] All six affected tests pass — `tests/tool-experience.spec.mjs` lines 442, 485, 566, 605, 639
      and `tests/contextual-tooltip.spec.mjs` line 115 — in the full committed suite. **Left
      unticked: the full committed suite was not run in the ticking session. The reported run covers
      a subset (21 passed), not the 490-test suite. Expected to pass, but expectation is not
      evidence.**
- [x] `playwright.config.mjs` declares no global `timeout` and no `retries`, no test is marked
      `.skip` or `.fixme`, and no assertion was deleted or weakened. **`playwright.config.mjs` does
      not appear in `git diff --name-only 5c978c5cb..HEAD` at all; `grep -cE '\.(skip|fixme)\('`
      returns 0 for both spec files; the Scope 02 commit changed 0 `expect()` lines.**
- [x] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count.
      **`Research-Lab self-test: 2534 passed, 0 failed`, exit 0 — up 44 from the 2490 baseline.**
- [x] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc`
      exits 0 on the completed packet. **`Artifact lint PASSED.`, exit 0, run after the DoD items
      were ticked.**

## Checklist

- [x] A bar in `data/bars/` never claims a low above its own close. The four prices in a row describe
      one trade sequence, on one basis.
- [x] The ingestion contract was **chosen deliberately** — adjust all four fields together, or keep
      the four raw and give the adjusted close its own field — with the reason recorded, rather than
      inherited from a bug report.
- [x] Existing history was repaired too, not only future writes. Leaving 71,714 incoherent rows in
      place while fixing the writer would leave the defect live and the six tests red.
- [x] `rlagenda.js` still refuses an impossible bar. The red went away because the data became
      correct, not because the check became lenient.
- [x] A scheduled data refresh can no longer turn a committed test red. The test that broke here
      broke without any code change, which is the property being removed.
- [x] When something on this page does fail, the page says so instead of hanging. The explanation it
      already computes reaches whatever is watching, rather than sitting in the DOM while an observer
      waits without bound.
- [x] Nothing became easier to pass: no global Playwright `timeout` was added, no `retries`, no test
      skipped or marked `fixme`, no assertion deleted. A 240 s budget was tried during diagnosis and
      the tests still failed, so a larger budget was never a fix — only a way to stop seeing this.
- [x] The separate provenance concern is understood as **still open**: a published historical row
      changed value in place with no trace, and deciding a policy for that is recorded in `spec.md`
      as out of scope for this packet rather than as done.

Each box above was checked on the repository operator's explicit instruction dated 2026-08-27 and
transcribed by automation on 2026-08-28. The judgement recorded by these boxes is the operator's,
not automation's. The last item in particular is an acknowledgement that a concern stays open, which
is a thing only the party accepting the packet can agree to leave open.

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
