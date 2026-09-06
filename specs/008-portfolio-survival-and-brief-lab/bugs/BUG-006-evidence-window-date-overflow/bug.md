# BUG-006: Evidence Window Date Overflow

**Status:** Confirmed
**Severity:** Low
**Reported:** 2026-08-25
**Source finding:** `SEC-B005-S1`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Affected module:** `rlportfolio.js`

## Summary

`validatePolicy()` accepts any finite non-negative
`policy.behavior.maximumEvidenceAgeDays` value. It has no upper bound.

`deriveInterestSignals()` later adds that value to a valid event timestamp and
calls `Date.prototype.toISOString()`. A sufficiently large configured window
exceeds the ECMAScript finite Date range and throws an uncaught
`RangeError: Invalid time value`.

The shipped value is `56` days. The defect therefore requires a reviewed config
change or equivalent origin control. It is pre-existing and is not caused by
the BUG-005 stale-domain repair. The remaining issue is still a real failure
class because an accepted policy can terminate derivation outside the module's
declared result envelope.

## Security Classification

- **Class:** availability and input-validation boundary
- **Severity:** Low
- **Reachability:** committed policy configuration, not ordinary user input
- **Current exposure:** latent in the public module API
- **Data impact:** no data disclosure or mutation was observed
- **Failure mode:** uncaught synchronous `RangeError`

## Reproduction

1. Load the committed policy and `rlportfolio.js`.
2. Clone the policy.
3. Set `maximumEvidenceAgeDays` to `99979350`.
4. Call `validatePolicy()` with the clone.
5. Apply the same expiry expression used by `deriveInterestSignals()` to
   `2026-07-16T10:00:00.000Z`.

### Observed

- `validatePolicy()` returns `ok: true`.
- The derived millisecond value is `8640000036000000`.
- That value exceeds the ECMAScript TimeClip maximum of
  `8640000000000000` milliseconds.
- `toISOString()` throws `RangeError: Invalid time value`.

Current-session evidence is in `report.md#before-fix-reproduction`.

### Expected

`validatePolicy()` must refuse an evidence-age value above a named product
bound before any derivation runs. The existing exact refusal contract is:

```text
code: P008-CONFIG
reason: invalid-policy
field: behavior
valueEchoed: false
recoverable: false
```

## Root Cause

`finiteNonNegative()` checks type, finiteness, and sign only. The generic
behavior-number loop applies that predicate to `maximumEvidenceAgeDays`.

The validator therefore accepts values that cannot safely participate in the
later Date calculation. `deriveInterestSignals()` trusts the validated policy
and has no reason to catch a range failure that validation should have refused.

## Proposed Resolution

Define `MAXIMUM_EVIDENCE_AGE_DAYS` as `100 * 365 + 25`, or `36525` days. The
25-day allowance covers the maximum leap-day count in a 100-year span.

Enforce `maximumEvidenceAgeDays <= MAXIMUM_EVIDENCE_AGE_DAYS` inside the
behavior-policy branch of `validatePolicy()`. Keep the shipped value at `56`.

The repair must not clamp, coerce, or replace an invalid value. It must return
the existing `P008-CONFIG / invalid-policy / behavior` envelope.

## Scope

The planned source change is limited to the named constant and the behavior
policy validation in `rlportfolio.js`. Planned tests extend the existing
Feature 008 foundation carrier. No source or test change is part of this filing
commit.

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Originating security review:
  `../BUG-005-stale-domain-interest-signal-crash/report.md#security-sec-b005-s1`
- Design: `design.md`
- Fix scope: `scopes.md`
