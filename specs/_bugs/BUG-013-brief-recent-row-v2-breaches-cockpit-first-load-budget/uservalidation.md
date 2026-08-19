# User Validation: BUG-013 — Filed, Nothing Delivered

This packet files a defect and implements nothing. There is no delivered behaviour to exercise.

The Automation Readiness items below record facts about the **filing** — that the defect is real,
measured, and correctly attributed. They are ticked where an executed check establishes them.

**Ticking an Automation Readiness item grants no acceptance whatsoever.** Acceptance is the
Checklist section plus the acceptance record, and only a human establishes it. Every Checklist item
is unticked and the Human Acceptance Record is unfilled, because nothing has been fixed and the
central decision has not been made.

## Automation Readiness

- [x] The first-load payload is over its declared budget at `9af68427b`. **`wc -c` over the seven `firstLoadPaths` totals 209,387 against `briefFirstLoadMaxBytes` of 204,800 — 4,587 over. Reproduced by direct measurement without running the suite.**
- [x] The payload was inside budget at `0f61d1a14`. **Summing the same seven paths from committed blobs gives 197,756, which is 7,044 under.**
- [x] One file supplies almost all the growth. **`brief-history.recent.jsonl` contributes 10,848 of the 11,631 added bytes, 93%. The other six contribute 783 combined.**
- [x] The row cap held and constrained nothing. **30 rows at both commits, exactly `briefHistoryRecentMaxRows`. Per-row cost rose from ~397 to ~4,939 bytes, 12.4x.**
- [x] The four v2 keys account for the per-row growth. **On the largest v2 row of 4,947 bytes: `tracked` 3,565, `crossAsset` 613, `dark` 325, `claims` 61 — 4,564 total, 92% of the row. `tracked` alone is 72%, carrying 12 instruments at ~297 bytes each.**
- [x] The steady-state projection exceeds the budget by far more than today's overage. **2 of 30 rows are v2 now. At 30 of 30: file ~148,410, payload ~336,791 against 204,800 — 1.64x, an overage of 131,991 bytes, roughly 29x what is visible today.**
- [x] The per-file byte budget cannot fire before the aggregate one. **`briefHistoryRecentMaxBytes` is 204,800, identical to `briefFirstLoadMaxBytes`. At the projected 148,410 the file is inside its own budget while the aggregate is 1.64x over.**
- [x] The enabling change is identified and sits inside the measurement window. **`git merge-base --is-ancestor` confirms `3855ee75d` (Feature 026 Scope 3) is a descendant of `0f61d1a14` and an ancestor of `9af68427b`, and it is the only commit in the window touching `scripts/shard-brief-history.mjs` or `tool-experience.config.json`.**
- [x] Both sides of the design conflict are quoted from the source rather than paraphrased. **Position A and Position B are both in the doc comment above `compactRow()` in `scripts/shard-brief-history.mjs`; `report.md` quotes each verbatim.**
- [x] No source file was modified and nothing was committed. **`scripts/shard-brief-history.mjs`, `tool-experience.config.json`, `rlcockpit.js`, every `*.page.json` and every `brief-history*` artifact are untouched; the only additions are this packet's seven artifacts.**
- [ ] `node scripts/selftest.mjs` reports 3012 passed, 15 failed at `9af68427b`. **Left unticked: this is attributed to the operator's prior execution in this session and was not re-run here, because running the suite was out of scope for the filing task. The failing condition was independently reproduced by direct byte measurement, but the pass and fail counts themselves are reported, not observed by this packet.**
- [ ] The remedy is chosen. **Left unticked deliberately. Four candidates are enumerated in `design.md` and none is selected. The choice is a product tradeoff for Feature 026's owner and this packet refuses to prejudge it.**

## Checklist

- [ ] The defect as filed is the real defect: a payload every visitor downloads is over its declared budget, and the number is still rising.
- [ ] The projection is the reason this matters now rather than later. 4,587 bytes over looks tunable; 131,991 bytes over is not, and the second number is where this is heading with no further code change.
- [ ] Raising `briefFirstLoadMaxBytes` is understood as **refuted, not merely discouraged**. A budget that clears 209,387 goes red again as the window turns over; clearing the projection means accepting a 329 KB first-load payload, which is a different decision on different grounds.
- [ ] The design conflict is stated fairly. `compactRow()`'s exclusion of per-instrument content and Feature 026's need for it are both deliberate, both documented, and neither is treated here as the mistake.
- [ ] Picking the remedy is **your** decision, not the filing agent's. That the packet enumerates four candidates and selects none is the intended outcome, not an incomplete one.
- [ ] The budget check is understood as correct. It caught real growth while 28 of 30 rows were still unrepriced, which is why the remedy is still cheap. Nothing proposed weakens it.
- [ ] Bounding rows without bounding bytes is understood as the structural gap. The 30-row cap held exactly and stopped nothing, and a per-file byte budget equal to the whole-payload budget can never bind first.
- [ ] The scope ordering is right: the decision comes first, and building either remaining scope before it would select the remedy by implementing one.
- [ ] Open question 5 in `design.md` deserves an answer — whether a fifth key added on the same reasoning would recur this conflict, and whether a standing rule is needed instead of a one-time adjudication.

## Human Acceptance Record

Acceptance has not occurred and cannot occur yet. This packet delivers no behaviour to exercise; it
delivers a defect description, a measurement, and a decision request. Automation cannot fill this
section and nothing above substitutes for it.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
