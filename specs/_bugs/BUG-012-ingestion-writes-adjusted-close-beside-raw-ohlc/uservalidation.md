# User Validation: BUG-012 — Delivered, Awaiting Human Acceptance

The fix is delivered across three commits. The Automation Readiness items below record facts about
that fix and are ticked where an executed check or a reported execution establishes them.

**Ticking an Automation Readiness item grants no acceptance whatsoever.** Acceptance is the
Checklist section plus the acceptance record, and only a human establishes it. The Human Acceptance
Record remains unfilled, and the Checklist items remain unticked, because no human has exercised
this yet.

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

- [ ] A bar in `data/bars/` never claims a low above its own close. The four prices in a row describe
      one trade sequence, on one basis.
- [ ] The ingestion contract was **chosen deliberately** — adjust all four fields together, or keep
      the four raw and give the adjusted close its own field — with the reason recorded, rather than
      inherited from a bug report.
- [ ] Existing history was repaired too, not only future writes. Leaving 71,714 incoherent rows in
      place while fixing the writer would leave the defect live and the six tests red.
- [ ] `rlagenda.js` still refuses an impossible bar. The red went away because the data became
      correct, not because the check became lenient.
- [ ] A scheduled data refresh can no longer turn a committed test red. The test that broke here
      broke without any code change, which is the property being removed.
- [ ] When something on this page does fail, the page says so instead of hanging. The explanation it
      already computes reaches whatever is watching, rather than sitting in the DOM while an observer
      waits without bound.
- [ ] Nothing became easier to pass: no global Playwright `timeout` was added, no `retries`, no test
      skipped or marked `fixme`, no assertion deleted. A 240 s budget was tried during diagnosis and
      the tests still failed, so a larger budget was never a fix — only a way to stop seeing this.
- [ ] The separate provenance concern is understood as **still open**: a published historical row
      changed value in place with no trace, and deciding a policy for that is recorded in `spec.md`
      as out of scope for this packet rather than as done.

## Human Acceptance Record

Acceptance has not occurred. The fix is delivered and there is now behaviour for a human to
exercise, but no human has exercised it. Automation cannot fill this section and nothing above
substitutes for it.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
