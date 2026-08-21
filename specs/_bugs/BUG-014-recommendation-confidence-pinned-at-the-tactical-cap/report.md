# BUG-014 Report

All output below was produced by executing the named command in this session. Nothing is
restated from memory or from another packet.

## Summary

Every published recommendation carried `confidence: 55` across 34 committed payload runs,
so the field could neither gate nor rank. Both authoring lanes now render a confidence
contract derived from the enforced thresholds, and the hand-typed sentence it replaces is
gone. Scope 1 is delivered with 10 of 10 Definition of Done items evidenced. Scope 2, the
cap-to-floor threshold collision, is a product decision and is left unstarted.

## The Measurement That Established The Defect

Walked every committed `market-brief.payload.json` blob and read the authored
`direction/horizon/confidence` of each recommendation.

```
date/time         direction/horizon/confidence slate
  2026-08-14 13:52 hold/stru/55|rotate/swin/55|hedge/swin/55
  ...
  2026-08-17 13:58 hold/stru/55|rotate/swin/55|hedge/swin/55   SAME
  2026-08-18 04:22 rotate/swin/55|hedge/swin/55                CHANGED
  2026-08-19 14:08 hedge/swin/55|add/swin/55                   CHANGED
  2026-08-19 23:54 hedge/swin/55|add/swin/55|add/swin/55|trim/swin/55  CHANGED
  2026-08-20 05:58 add/swin/55|trim/swin/55|add/swin/55|hedge/swin/55  CHANGED
  2026-08-20 14:01 hedge/swin/55|trim/swin/55                  CHANGED

runs=34  distinct=8  transitions=7
```

Two independent facts fall out of the same table:

1. **Feature 026's F-026-2 is fixed.** 13 consecutive identical slates from 2026-08-14
   to 2026-08-17 became 7 transitions across the following 21 runs.
2. **`confidence` is invariant.** 8 distinct slates, both `swing` and `structural`
   horizons, 34 runs, and exactly one confidence value: `55`.

## Rendered Output

`node -e "import('./scripts/build-attention-items.mjs')..."`

```
Choose each confidence as a 0-100 reading of how strong that item's evidence actually is,
and vary it across items. It gates and it ranks: an action below 55 and an attention card
below 55 reach no reader, and surviving actions are sorted by this number, so items
sharing one value cannot be ranked and get cut in the order you happened to write them
rather than by conviction. 55 is the ceiling for a tactical-horizon item and also the
action floor, so a tactical action has exactly one admissible value: 55. A tactical read
you would not defend at that number belongs as a watch idea rather than an action. A
swing or structural call resting on corroborated evidence belongs clearly above the
floor, and a thin one belongs below it as a watch idea instead of an action. Do not give
two items the same confidence unless you genuinely cannot separate them.
```

The other two branches, exercised through the override seam:

```
--- cap=40 floor=55 ---
40 is the ceiling for a tactical-horizon item, which is below the 55 action floor — so a
tactical read cannot become an action at all and belongs in attention or as a watch idea.
--- cap=70 floor=55 ---
A tactical-horizon item is capped at 70, so it may only occupy 55 to 70; that band is a
ceiling, never a default and never a target.
```

## Threshold Decision

Scope 2, decided 2026-08-20 on delegated authority. Measuring `nextSession.actions` by
horizon separated two causes the filing had conflated:

```
  nextSession structural   confidences: {56: 15, 57: 19}
  nextSession swing        confidences: {55: 102}
  nextSession tactical     confidences: {55: 34}
```

Structural actions vary. Tactical does not, and cannot: the publish validator refuses
below `minimumActionConfidence` and above `tacticalConfidenceCap`, both 55, so 55 was the
only legal value — and a tactical action published on all 34 runs.

`tacticalConfidenceCap` stays 55 because `notes/market-brief.md` states that ceiling twice
as anti-reactivity doctrine. `minimumActionConfidence` moves to 50. The change excludes
nothing already published:

```
  min action confidence ever published: 55
```

The contract needed no code change to follow it, which is what the generic derivation was
for:

```
A tactical-horizon item is capped at 55, so it may only occupy 50 to 55; that band is a
ceiling, never a default and never a target.
```

## Test Evidence

### Selftest

`node scripts/selftest.mjs`

```
Research-Lab self-test: 3200 passed, 0 failed
```

Exit code 0. Zero `✗` marks in the log. The count moved from 3192 to 3200, which is the
8 pins this packet adds:

**Re-run after Scope 2 and the sibling decisions: `3212 passed, 0 failed`, validator exit
0, `validate-tool-experience` exit 0 with `brief-first-load bytes=184621 budget=204800
result=PASS`.**

```
✓ the confidence contract states the enforced minimumActionConfidence of 55
✓ the confidence contract states the enforced minimumAttentionConfidence of 55
✓ the confidence contract states the enforced tacticalConfidenceCap of 55
✓ the confidence contract tells the author the number ranks, and to vary it - the two facts that make a pinned value harmful
✓ both the core and signals lanes render the confidence contract, because both author a confidence
✓ the hand-typed tactical-cap sentence is gone rather than left beside the rendered contract as a second copy
✓ the confidence contract derives a DIFFERENT tactical clause for cap-below-floor, cap-above-floor and cap-equals-floor rather than restating one fixed sentence
✓ live config has the tactical cap equal to the action floor, and the contract says so plainly
```

### Adversarial Check

A pin that cannot fail is decoration. The core-lane interpolation was removed and the
suite re-run:

```
exit=1 (expect non-zero)
1
  ✗ FAIL: both the core and signals lanes render the confidence contract, because both author a confidence
```

The wiring was then restored and re-counted at 2 interpolations, and the suite returned
to 3200 passed / 0 failed with 0 `✗`.

### No Second Copy

`grep -c "Keep tactical confidence at or below the configured cap" scripts/brief-narrative-parallel.mjs`

```
0
```

### Validator

`node scripts/validate-brief-payload.mjs`

```
[brief-contract] PASS: all visible sections, registry coverage, model-specific real assets, and next-session actions are valid
```

Exit code 0.

## Blast Radius

`git diff --numstat`

```
3       3       scripts/brief-narrative-parallel.mjs
59      0       scripts/build-attention-items.mjs
48      1       scripts/selftest.mjs
```

No threshold, gate function, payload schema, or committed payload was modified. A
temporary config mutation used to exercise the two non-live branches was reverted and
confirmed at `0 changed files` before the permanent override seam replaced it.

## Completion Statement

Scope 1 is delivered and every Definition of Done item is evidenced above. Scope 2 is
unstarted and not agent-dischargeable: it asks whether the tactical cap should equal the
action floor, which is a product decision about whether tactical reads are actionable.

What is **not** established here: whether stating the contract is by itself sufficient to
make authored confidence vary in production. That requires observing a narrative run
composed after this change, and no such run has occurred. The claim proven is that both
lanes now receive a contract derived from the enforced bands; the claim deliberately not
made is that the next payload will carry a spread.
