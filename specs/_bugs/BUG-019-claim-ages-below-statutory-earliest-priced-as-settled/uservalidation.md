# User Validation: BUG-019 — Remedy Delivered

This packet was filed by a `bubbles.chaos` round with nothing delivered, and a remedy was later
carried into shipped code. The remedy is commit `e28be5814`, "declare the earliest priceable claim
age in the benefit pack and refuse below it", which declares `earliestClaimAge` in
`tax-rules/benefit/2026.json` and refuses beneath it through `BELOW_EARLIEST_CLAIM_AGE_DOMAIN` in
`rltaxsocialsecurity.js`, `rltaxclaimage.js` and the route — each re-read at the audited commit
rather than taken from the packet's prose. Executed evidence: selftest check `TB-SEC-02-03` settles
age 62 at 1400 and refuses age 60 under `RLTAX-THRESHOLD-UNAVAILABLE` in this packet's own domain.
All 18 Definition of Done rows in `scopes.md` are ticked with none open. There is therefore
delivered behaviour to exercise. The framing that previously stood here, saying there was none, was
written at filing time and outlived the fix.

The checklist below is what a human should be able to confirm now that Scopes 1 to 3 are
delivered. It was recorded at filing so the acceptance criteria were fixed before the fix was
written rather than after.

## Automation Readiness

| Item | Automatable | Why |
| --- | --- | --- |
| The priced side of the boundary still prices | Yes | A browser assertion on the rendered figure |
| The refused side refuses | Yes | A browser assertion on the refusal code |
| The comparison table refuses per row | Yes | A browser assertion on row count and row content |
| The refusal reads as a refusal to a person | No | Whether the wording is understandable is a human judgement |
| The earliest age is the right age | No | Correctness against a retrieved authority is a human reading of that authority |

The last two are the reason this file exists. Everything else belongs in the suite.

## Checklist

- [ ] Opening the route, declaring an ordinary household, and setting a claim age of 62 still shows
      a monthly and an annual benefit, and the figures are unchanged from before the fix.
- [ ] Setting the claim age to 60 shows a refusal instead of a figure.
- [ ] That refusal states, in words a reader who is not a tax professional can follow, that the
      declared age is below the earliest age the tool can price, and what the earliest age is.
- [ ] The refusal does not read as an error in the tool. It reads as the tool declining to answer.
- [ ] Entering `60,62,67` in the comparison ages field keeps three rows: age 60 refused in place,
      ages 62 and 67 priced.
- [ ] No row silently disappears from that table.
- [ ] The benefit section does not claim a claim age was "settled against the sourced factors"
      while it is refusing.
- [ ] Setting a claim age beyond age 70 still shows the age-70 figure, and now also says that the
      declared age is beyond the point at which the credit stops.
- [ ] The earliest age the tool refuses below matches the authority cited in the pack, read
      directly by a human rather than taken from the pack's own summary of it.

## Human Acceptance Record

**Accepted by:**

**Date:**

**What was checked, in the checker's own words:**

**Anything the checker did not accept:**
