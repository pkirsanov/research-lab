# BUG-014 Design

## Chosen Approach

Add one rendered instruction, `recommendationConfidenceContractInstruction()`, to
`scripts/build-attention-items.mjs`, and interpolate it into both authoring lanes in
`scripts/brief-narrative-parallel.mjs`.

This is deliberately the same shape as the seven attention contracts already shipped by
BUG-009: the instruction is **derived from the constants the consumer enforces**, so the
ask and the refusal cannot describe two different contracts. Nothing about the gate, the
thresholds, or the payload schema changes.

## Why Not The Alternatives

| Alternative | Why rejected |
|---|---|
| Compute confidence mechanically from snapshot evidence | Confidence is a judgement about evidence strength, and the lane holds the judgement. Deriving it in code would replace an author's read with a formula and invent a precision the inputs do not carry. |
| Raise `minimumActionConfidence` above 55 | With every value pinned at 55 this empties the action slate entirely. It changes the symptom into a worse one and still leaves the number inert. |
| Reject a payload whose confidences are all equal | A validator refusal would discard an otherwise good narrative over a field the author was never told how to set. Tell the author first; a gate on top of an unstated contract is the defect this repository keeps closing. |
| State the bands as literals in the lane prose | Two copies drift. The first threshold change would arm the gate and leave the sentence stale, which is exactly the failure mode BUG-009 documented eight times. |

## The Tactical Clause Is Derived, Not Fixed

The cap and the floor are independent config values, so the instruction computes their
relationship rather than asserting one sentence:

```js
if (tacticalCap < actionFloor)       // a tactical read cannot be an action at all
else if (tacticalCap === actionFloor) // exactly one admissible value
else                                  // the band floor..cap
```

Live config takes the middle branch. The other two would never execute in production and
would rot unobserved, so the selftest exercises all three through a `thresholdsOverride`
seam that is `undefined` on every production path. That seam mirrors the existing
`recomposePayloadAttention(payload, config, snapshotOverride)` precedent.

## Blast Radius

Three files: the instruction module, the lane wiring, the selftest. No payload schema
change, no config change, no consumer change. The published payload is unaffected until
the next narrative run, at which point the authored confidences may legitimately spread
across the band. A spread is the intended outcome and is not a regression.

## Open Questions For The Owner

**Q1 — Should `tacticalConfidenceCap` equal `minimumActionConfidence`?**

Committed config sets both to 55. A `tactical` action is therefore capped at `<= 55` and
gated at `>= 55`, leaving exactly one admissible value. Either the cap should sit above
the floor so tactical items have a band, or tactical items should be understood as
non-actionable by design and the floor raised above the cap to say so. Both are coherent;
they are different products. This packet states the collision in the rendered instruction
and changes neither value.

**Q2 — Should the payload validator eventually refuse an all-equal confidence slate?**

Once authors have been told the contract, a slate that still carries one value everywhere
is evidence the instruction did not land. A validator check would make that visible
rather than silent. It is deliberately not added here, because arming a refusal in the
same change that first states the contract leaves no run in which to observe whether the
contract alone is sufficient.
