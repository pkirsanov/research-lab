# BUG-014 Every Recommendation Carries Confidence 55, So The Action Gate Cannot Gate And The Ranked Slate Cannot Rank

- **Filed at commit:** `c2c83073e`
- **Severity:** High
- **Surface:** `scripts/brief-narrative-parallel.mjs` lane instructions, consumed by
  `rlexperience-adapters/market-action.js` `nextSessionActions` / `actionableAttention`
- **Workflow mode:** `bugfix-fastlane`
- **Related:** `specs/026-actionable-brief-brevity-and-cross-asset` (F-026-2),
  `specs/_bugs/BUG-009-decision-attention-gate-result-producer-absent`

## What Is Wrong

Every published recommendation carries `confidence: 55`. Not approximately, and not
usually. Across the 34 committed `market-brief.payload.json` runs from 2026-08-14 to
2026-08-20, spanning 8 distinct decision slates and both `swing` and `structural`
horizons, every recommendation in every run carries exactly 55.

The number is not decoration. `rlexperience-adapters/market-action.js` reads it twice:

```js
function nextSessionActions(recommendations, max, minConfidence) {
  var floor = isFinite(minConfidence) ? minConfidence : 55;
  var rows = (recommendations || []).map(normalizeRecommendation).filter(function (item) {
    return item.action !== "watch" && ... && item.confidence >= floor;
  });
  rows.sort(function (a, b) { return b.confidence - a.confidence; });
  return rows.slice(0, isFinite(max) && max > 0 ? max : 5);
}
```

With every value equal, two things follow mechanically:

1. **The ranked slate cannot rank.** The comparator returns `0` for every pair, so the
   sort is a no-op and `slice(0, max)` keeps the order the author happened to write.
   A slate the cockpit presents as ranked by conviction is really ranked by authoring
   position.
2. **The gate cannot gate.** `>= floor` becomes a cliff rather than a filter. Any floor
   at or below 55 admits the entire slate and any floor above 55 rejects all of it at
   once. There is no intermediate outcome, because there is no intermediate value.

`actionableAttention` applies the same `card.confidence >= floor` comparison for the
legacy attention feed.

## Root Cause

Neither lane that authors a confidence has ever been told how to choose one.

- The `core` lane, which owns `nextSession` actions, said only: *"Keep tactical
  confidence at or below the configured cap."*
- The `signals` lane, which owns `recommendations`, named `confidence` in a list of
  required keys and said nothing further.

The single numeral anywhere in that guidance is the tactical **cap**, and the author has
adopted it as a universal default. A ceiling stated without a corresponding rule for
choosing a value is read as the value.

This is the same defect class this repository has now closed eleven times: a contract the
pipeline enforces that the party expected to satisfy it is never told. It is recorded
here separately because it lands in the one field the reader is most entitled to trust.

## Aggravating Condition, Not Fixed Here

`market-brief.config.json` sets all three confidence thresholds to the same number:

| Threshold | Value |
|---|---|
| `tacticalConfidenceCap` | 55 |
| `minimumActionConfidence` | 55 |
| `minimumAttentionConfidence` | 55 |

Because the tactical cap equals the action floor, a `tactical` action has exactly one
admissible value: it is capped at `<= 55` and gated at `>= 55`. That collision plausibly
reinforced the anchor, and it is a product tradeoff rather than an authoring defect, so
this packet states it and does not change it. See `design.md` Open Questions.

## Evidence

Measured over committed blobs, not asserted:

| Window | Runs | Distinct decision slates | Distinct confidence values |
|---|---|---|---|
| 2026-08-14 → 2026-08-20 | 34 | 8 | **1** (`55`) |

The slate itself does vary after Feature 026: 13 identical runs from 2026-08-14 to
2026-08-17 became 7 transitions across the following 21 runs. So F-026-2 is fixed and
this is a separate, surviving invariance confined to `confidence`.

## Correction Recorded 2026-08-20, After Filing

The filing measured `recommendations` only. Measuring `nextSession.actions` as well
refutes the broader reading that the author never differentiates:

| `nextSession` horizon | Confidences across 34 runs |
|---|---|
| structural | **56 (x15), 57 (x19)** |
| swing | 55 (x102) |
| tactical | 55 (x34) |

Structural actions **do** vary. So the author differentiates when free to, and two
distinct causes were being conflated:

1. **Anchoring** on `recommendations` and swing actions, where 55 to 100 was available
   and 55 was chosen anyway. That is what the rendered contract addresses.
2. **Config necessity** on tactical actions. The publish validator refuses below
   `minimumActionConfidence` and above `tacticalConfidenceCap`, and both were 55, so 55
   was the ONLY legal value. Every one of the 34 runs published exactly one tactical
   action, so the collision was biting continuously rather than hypothetically.

The original claim "every recommendation carries exactly 55" stands for the
`recommendations` array. The implication that the author cannot differentiate does not.
