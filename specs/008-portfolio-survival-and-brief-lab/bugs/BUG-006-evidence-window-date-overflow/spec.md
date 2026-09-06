# BUG-006 Expected Behavior Specification

## Problem Statement

Feature 008 treats its policy as a validated contract. The behavior policy
currently admits an evidence-age window beyond the finite ECMAScript Date
range. A consumer can then fail while formatting an interest-signal expiry or
a brief action-history cutoff.

This bug specification narrows the policy-validation contract. It does not
change evidence scoring, retention, or the shipped policy value.

## Outcome Contract

**Intent:** Reject an evidence-age policy that can create an unsafe or
operationally meaningless retention horizon before interest derivation uses it.

**Success Signal:** The exact named boundary is accepted. One day above it is
refused with `P008-CONFIG / invalid-policy / behavior`. A policy at the shipped
value remains valid. Interest-signal expiry derivation and brief action-history
cutoff composition return the same refusal for a TimeClip-overflowing policy and
never throw.

**Hard Constraints:**

- The bound is a named policy invariant, not an unexplained literal.
- The bound equals `100 * 365 + 25`, or `36525` days.
- The 25-day term documents the maximum leap-day allowance in 100 years.
- Shared policy validation rejects above-bound values before any consumer
  formats a policy-derived Date.
- One policy-validation capability owns the evidence-age ceiling and refusal.
  Consumers do not define another ceiling or translate the shared failure.
- The refusal uses the existing `PortfolioError/v1` envelope.
- The refusal code is `P008-CONFIG`.
- The refusal reason is `invalid-policy`.
- The refusal field is `behavior`.
- `valueEchoed` remains `false` and `recoverable` remains `false`.
- The validator does not clamp, round, coerce, or substitute the configured
  value.
- The committed `maximumEvidenceAgeDays: 56` value remains unchanged.
- No public contract version, storage schema, or signal schema changes.

**Failure Condition:** The repair fails if `36526` remains valid or `36525` is
rejected. It also fails if the shipped value changes. An overflowing policy
must never reach formatting in either policy-derived Date consumer. Neither
consumer may throw.

## Requirements

### FR-B006-001 - Named maximum evidence age

`rlportfolio.js` must define one named maximum for the behavior evidence-age
window. The source must identify a conservative 100-year product horizon. The
derivation must include the maximum 25 leap days.

$$
100 \times 365 + 25 = 36{,}525\text{ days}
$$

This limit is intentionally much smaller than the observed Date overflow
horizon. It remains far larger than the shipped 56-day evidence window.

### FR-B006-002 - Validation owns the failure

`validatePolicy()` must reject
`behavior.maximumEvidenceAgeDays > MAXIMUM_EVIDENCE_AGE_DAYS` in its behavior
section. Every consumer that formats a Date from this policy value must invoke
that shared validation capability before the formatting operation.

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

### FR-B006-004 - No consumer fallback

Interest-signal expiry derivation and brief action-history cutoff composition
must return the shared validation failure unchanged for an above-bound policy.
The brief's existing input, window, timestamp, and cutoff failures must retain
their precedence before shared policy validation.

No consumer may catch a Date-range error and continue, clamp the window to a
hidden value, or rebuild the shared refusal. Each approach would conceal or
diverge from invalid policy.

### FR-B006-005 - Adversarial regression

The one-over test must use `36526`. It must fail against current source because
current validation accepts that value.

A second case must use a window known to exceed TimeClip. It must prove the
interest-signal and brief composition paths return
`P008-CONFIG / invalid-policy / behavior` without throwing. Brief composition
must also preserve the shared non-finite refusal and its existing local-error
precedence.

### FR-B006-006 - Non-movement

Evidence scoring, half-life decay, event eligibility, signal identity, and
expiry and action-history cutoff calculations remain unchanged for valid
policies. No other policy number acquires a new bound.

### Single-Capability Justification

This repair extends one existing policy-validation capability across multiple
consumers. `rlportfolio.validatePolicy()` remains the sole owner of the
evidence-age range and refusal semantics. Interest-signal expiry derivation and
brief action-history cutoff composition consume that one capability and must
invoke it before formatting a policy-derived Date.

This work introduces no second provider, strategy, adapter, screen contract,
variant, or policy ceiling. A new abstraction or a consumer-local range check
would duplicate contract ownership and increase drift risk.

## Acceptance Criteria

| ID | Criterion | Planned verification |
| --- | --- | --- |
| AC-1 | `maximumEvidenceAgeDays: 36525` passes `validatePolicy()` | `SCN-B006-BOUNDARY-ACCEPTED` |
| AC-2 | `maximumEvidenceAgeDays: 36526` returns the exact existing config refusal from shared validation and both policy-derived Date consumers | `SCN-B006-ONE-OVER-REFUSED` |
| AC-3 | A TimeClip-overflowing window is refused before interest-signal expiry or brief action-history cutoff formatting, and neither consumer throws | `SCN-B006-OVERFLOW-REFUSED` |
| AC-4 | The committed config remains `56`, valid-policy expiry and action-history cutoff calculations do not move, and the allocation page still loads | Regression and E2E non-movement rows in `scopes.md` |

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

Current shared validation rejects values above the named boundary, and core
interest-signal derivation returns that refusal before Date formatting. Exported
brief composition still consumes the same policy value without shared
validation and can throw for a finite backward-TimeClip overflow. This packet's
remaining work extends the existing capability to that consumer without moving
the valid-policy behavior.

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
