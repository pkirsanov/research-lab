# BUG-006 Expected Behavior Specification

## Problem Statement

Feature 008 treats its policy as a validated contract. The behavior policy
currently admits an evidence-age window that can overflow the finite ECMAScript
Date range during interest-signal expiry derivation.

This bug specification narrows the policy-validation contract. It does not
change evidence scoring, retention, or the shipped policy value.

## Outcome Contract

**Intent:** Reject an evidence-age policy that can create an unsafe or
operationally meaningless retention horizon before interest derivation uses it.

**Success Signal:** The exact named boundary is accepted. One day above it is
refused with `P008-CONFIG / invalid-policy / behavior`. A policy at the shipped
value remains valid. A TimeClip-overflowing policy returns the same refusal from
`deriveInterestSignals()` and never throws.

**Hard Constraints:**

- The bound is a named policy invariant, not an unexplained literal.
- The bound equals `100 * 365 + 25`, or `36525` days.
- The 25-day term documents the maximum leap-day allowance in 100 years.
- Validation rejects above-bound values before derivation.
- The refusal uses the existing `PortfolioError/v1` envelope.
- The refusal code is `P008-CONFIG`.
- The refusal reason is `invalid-policy`.
- The refusal field is `behavior`.
- `valueEchoed` remains `false` and `recoverable` remains `false`.
- The validator does not clamp, round, coerce, or substitute the configured
  value.
- The committed `maximumEvidenceAgeDays: 56` value remains unchanged.
- No public contract version, storage schema, or signal schema changes.

**Failure Condition:** The repair fails if `36526` remains valid, if `36525` is
rejected, if the shipped value changes, or if an overflowing policy can still
reach `toISOString()` and throw.

## Requirements

### FR-B006-001 - Named maximum evidence age

`rlportfolio.js` must define one named maximum for the behavior evidence-age
window. The source must explain its derivation as a conservative 100-year
product horizon:

$$
100 \times 365 + 25 = 36{,}525\text{ days}
$$

This limit is intentionally much smaller than the observed Date overflow
horizon. It remains far larger than the shipped 56-day evidence window.

### FR-B006-002 - Validation owns the failure

`validatePolicy()` must reject
`behavior.maximumEvidenceAgeDays > MAXIMUM_EVIDENCE_AGE_DAYS` in its behavior
section. The rejection must occur before `deriveInterestSignals()` performs
Date arithmetic.

The exact error must be:

```json
{
  "contractVersion": "PortfolioError/v1",
  "code": "P008-CONFIG",
  "reason": "invalid-policy",
  "valueEchoed": false,
  "recoverable": false,
  "field": "behavior"
}
```

### FR-B006-003 - Boundary behavior

The value `36525` must remain valid. The value `36526` must be invalid. The
shipped value `56` must remain valid and unchanged.

### FR-B006-004 - No derivation fallback

`deriveInterestSignals()` must keep its current validate-first flow. It must
return the validation failure for an above-bound policy.

The implementation must not catch `RangeError` and continue. It must not clamp
the window to a hidden value. Either approach would conceal invalid policy.

### FR-B006-005 - Adversarial regression

The one-over test must use `36526`. It must fail against current source because
current validation accepts that value.

A second case must use a window known to exceed TimeClip. It must prove the
future validate-first path returns `P008-CONFIG / invalid-policy / behavior`
without throwing.

### FR-B006-006 - Non-movement

Evidence scoring, half-life decay, event eligibility, signal identity, and
expiry calculation remain unchanged for valid policies. No other policy number
acquires a new bound.

## Acceptance Criteria

| ID | Criterion | Planned verification |
| --- | --- | --- |
| AC-1 | `maximumEvidenceAgeDays: 36525` passes `validatePolicy()` | `SCN-B006-BOUNDARY-ACCEPTED` |
| AC-2 | `maximumEvidenceAgeDays: 36526` returns the exact existing config refusal | `SCN-B006-ONE-OVER-REFUSED` |
| AC-3 | A TimeClip-overflowing window is refused before derivation and does not throw | `SCN-B006-OVERFLOW-REFUSED` |
| AC-4 | The committed config remains `56` and the allocation page still loads | Regression and E2E non-movement rows in `scopes.md` |

## Product Principle Alignment

### Admission Test

The change improves decision quality by keeping policy-controlled evidence
derivation available and explicit. A crash removes every result and every
explanation from the caller.

### P7 - No blackbox numbers

The maximum is named and derived in source and tests. The implementation must
not use an unexplained literal or silent clamp.

### P22 - Budgets are assertions

The evidence-age budget gains executable assertions at the exact boundary and
one day above it. The shipped value is not raised to make a test pass.

### P23 - A guard that cannot fail is not a guard

The one-over case is adversarial. Removing the upper-bound predicate makes that
case fail because the invalid policy becomes accepted again.

### Current And Planned Behavior

Current source accepts the overflowing value and can throw. The bound and its
tests are planned by this packet and are not yet implemented.

## Release Train

Not applicable in this repository. Research Lab has no
`config/release-trains.yaml` registry or train-specific feature-flag bundles.
This bug introduces no feature flag.

## Non-Goals

- Changing the shipped 56-day value.
- Changing `deriveInterestSignals()` arithmetic for valid policies.
- Expanding the public policy schema.
- Adding a runtime fallback or catch-and-continue path.
- Revising other behavior-policy numeric limits.
