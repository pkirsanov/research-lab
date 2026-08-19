# User Validation: BUG-012 — Nothing To Validate Yet

This packet **files a defect and implements no remedy**, by instruction. There is no delivered
behaviour to exercise, so every item below ships **unchecked** — including the automation-readiness
items, because those record facts about a fix that does not exist.

Automation may check the Automation Readiness section once a fix lands, and doing so grants no
acceptance whatsoever. Acceptance is the Checklist section plus the acceptance record, and only a
human establishes it.

## Automation Readiness

- [ ] A scan of all 293 files under `data/bars/` reports zero rows with `l > min(o, c)`, down from
      the reported 71,714. **No fix exists; this is the primary outcome and it has not been
      attempted.**
- [ ] `scripts/fetch-bars.mjs` cannot emit an incoherent row, proven by an adversarial vendor payload
      whose adjusted close falls below the raw low.
- [ ] A committed coherence guard fails on an incoherent row and runs inside
      `node scripts/selftest.mjs`.
- [ ] The reversal fixture's resolved inputs cannot change without a reviewed commit, or a drift
      between fixture and data fails with a message naming fixture, symbol and row.
- [ ] A failed reversal boot causes `getViewState()` to return a non-null value carrying the refusal
      reason, proven with a deliberately injected failing input.
- [ ] The three non-fixture agenda tests at `tests/tool-experience.spec.mjs` lines 364, 458 and 713
      still pass unmodified, showing the successful boot path was untouched.
- [ ] All six affected tests pass — `tests/tool-experience.spec.mjs` lines 442, 485, 566, 605, 639
      and `tests/contextual-tooltip.spec.mjs` line 115 — in the full committed suite.
- [ ] `playwright.config.mjs` declares no global `timeout` and no `retries`, no test is marked
      `.skip` or `.fixme`, and no assertion was deleted or weakened.
- [ ] `node scripts/selftest.mjs` reports 0 failed with no reduction in assertion count.
- [ ] `bash .github/bubbles/scripts/artifact-lint.sh specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc`
      exits 0 on the completed packet.

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

Acceptance has not occurred and cannot occur. This packet delivers documentation of a defect, not a
change in behaviour, so there is nothing for a human to exercise. A human completes this section
after a fix has been delivered and exercised.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
