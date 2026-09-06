# User Validation: BUG-006 Evidence Window Date Overflow

Automation readiness and human acceptance are separate. This packet does not
claim delivery or certification.

## Automation Readiness

- [ ] The named boundary is implemented in `validatePolicy()`.
- [ ] The exact boundary passes and one day above it returns the config refusal.
- [ ] A TimeClip-overflowing policy returns the config refusal without throwing.
- [ ] The committed 56-day policy remains unchanged and valid.
- [ ] Focused, browser, and repository regressions pass.
- [ ] Validate-owned certification completes.

## Checklist

- [ ] Load the committed Feature 008 policy and confirm its evidence window is
      still 56 days.
- [ ] Validate a policy at the named 100-year boundary and confirm acceptance.
- [ ] Validate a policy one day above the bound and confirm
      `P008-CONFIG / invalid-policy / behavior`.
- [ ] Derive with a TimeClip-overflowing policy and confirm the same refusal
      appears without a thrown exception.
- [ ] Open the allocation lab and confirm its normal 56-day policy still loads.

## Human Acceptance Record

Acceptance has not occurred. Only a human may fill this record.

- acceptedBy: [unfilled]
- acceptedAt: [unfilled]
- method: [unfilled]
