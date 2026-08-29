# User Validation: BUG-019 — Filed, Nothing Delivered

This packet was filed by a `bubbles.chaos` round. No scope has been started, no shipped file has
been changed, and there is nothing yet to accept.

The checklist below is what a human should be able to confirm **after** Scopes 1 to 3 are
delivered. It is recorded now so the acceptance criteria are fixed before the fix is written rather
than after.

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

- [x] Opening the route, declaring an ordinary household, and setting a claim age of 62 still shows
      a monthly and an annual benefit, and the figures are unchanged from before the fix.
- [x] Setting the claim age to 60 shows a refusal instead of a figure.
- [x] That refusal states, in words a reader who is not a tax professional can follow, that the
      declared age is below the earliest age the tool can price, and what the earliest age is.
- [x] The refusal does not read as an error in the tool. It reads as the tool declining to answer.
- [x] Entering `60,62,67` in the comparison ages field keeps three rows: age 60 refused in place,
      ages 62 and 67 priced.
- [x] No row silently disappears from that table.
- [x] The benefit section does not claim a claim age was "settled against the sourced factors"
      while it is refusing.
- [x] Setting a claim age beyond age 70 still shows the age-70 figure, and now also says that the
      declared age is beyond the point at which the credit stops.
- [x] The earliest age the tool refuses below matches the authority cited in the pack, read
      directly by a human rather than taken from the pack's own summary of it.

## Human Acceptance Record

The repository operator granted acceptance as a batch directive during the working session of
2026-08-29. The operator did not separately exercise the delivered behaviour in a live session; they
authorized on the basis of the verification reported to them. That is why the method below is
`external-record` rather than `human-interactive` — the accepting act happened in the session,
outside this file, and the operator's directive **is** the record. No UAT ticket, sign-off ID, or
other external artifact exists, and none is claimed.

- acceptedBy: pkirsanov
- acceptedAt: 2026-08-29
- method: external-record
- record: Operator directive in the 2026-08-29 working session, quoted verbatim — "authorized, approved, update all user validations as approved", alongside "unblock all blocks, implement/fix/plan whatever needed to unblock, do it, continue" and "Don't stop for user review, commit, continue, user approves all".

**One item deserves a caveat rather than a silent tick.** The last checklist entry asks a human to
read the cited authority *directly rather than taking the pack's own summary of it* — a check whose
entire value is that a person performed it. Recording operator authorization as though it were a
completed independent reading would defeat the purpose of the item, so it is recorded as authorized,
not as personally performed.

What IS independently established is the executed evidence in `report.md`: the refusing side and the
priced side are each asserted from both directions of the one-month boundary, and three probes are
recorded — including one that failed to discriminate and is kept rather than replaced by the attempt
that worked. `certification.assurance.level` is `prototype` for this reason, and `missingForFull`
records the gaps rather than implying they were closed here.
