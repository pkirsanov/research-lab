# BUG-014 User Validation

## What To Check

1. Open `scripts/build-attention-items.mjs` and read
   `recommendationConfidenceContractInstruction()`. Confirm it reads its three numbers
   from `market-brief.config.json` and holds no literal copy of them.
2. Run `node scripts/selftest.mjs`. Confirm `3200 passed, 0 failed`.
3. Run `node scripts/validate-brief-payload.mjs`. Confirm exit 0.
4. Confirm `scripts/brief-narrative-parallel.mjs` interpolates the contract in both the
   `core` and `signals` lanes, and that the old hand-typed tactical-cap sentence is gone.
5. Decide Scope 2: whether `tacticalConfidenceCap` should remain equal to
   `minimumActionConfidence`. See `design.md` Open Question Q1.

## Reviewer Checklist

- [x] The defect is established by executed measurement over committed blobs, not asserted.
- [x] The instruction is derived from the enforced thresholds rather than restating them.
- [x] All three cap-to-floor branches are exercised, including the two live config never reaches.
- [x] The new pins are proven able to fail.
- [x] No threshold, gate, or payload schema was changed.
- [x] The report separates what was proven from what was not.
- [ ] The owner has decided Scope 2.

## Acceptance Contract

This packet is not accepted. Acceptance is a human act and this file deliberately does
not perform it.

Gate G136 looks for a section headed `## Human Acceptance Record` carrying an
`acceptedBy:` and an `acceptedAt:`. That heading is deliberately absent from this file,
and the field names above are quoted only to describe the contract. Writing them here
with an agent identity would not record acceptance; it would forge it. `guard-lib.sh`
states the same rule directly — *an agent cannot accept for a human* — and refuses an
`acceptedBy` matching `^bubbles\.`.

To accept, the owner adds the section below this line, with their own name and a real
timestamp. Until then the packet correctly reports `PD12-NO-RECORD`.
