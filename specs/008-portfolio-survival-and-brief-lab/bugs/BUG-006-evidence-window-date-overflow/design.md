# Design: BUG-006 Evidence Window Date Overflow

## Design Brief

### Current State

`validatePolicy()` validates behavior numbers through `finiteNonNegative()`.
That helper proves only type, finiteness, and non-negativity.

`deriveInterestSignals()` validates the policy first. It then computes:

```js
new Date(
  Date.parse(bucket.latest) +
  behavior.maximumEvidenceAgeDays * 86400000
).toISOString()
```

The validated value can push the sum beyond the finite Date range. The final
method then throws instead of returning a `PortfolioError/v1` envelope.

### Target State

Validation admits evidence-age windows from zero through a named 100-year
maximum. It rejects any larger value as an invalid behavior policy.

Derivation stays unchanged. Its existing validate-first call converts the
unsafe policy into the established config refusal before Date arithmetic runs.

## Root Cause Analysis

### Investigation Summary

Current source inspection found these controlling steps:

1. `finiteNonNegative()` accepts every finite number at or above zero.
2. The generic behavior-number loop applies that predicate to
   `maximumEvidenceAgeDays`.
3. No behavior-specific upper-bound check follows.
4. `deriveInterestSignals()` multiplies the accepted value by `86400000`.
5. It adds the product to `Date.parse(bucket.latest)`.
6. It calls `toISOString()` without an exception boundary.

A current-source probe confirmed the composition. The validator accepted
`99979350` days. The expiry sum exceeded `8640000000000000` milliseconds, and
`toISOString()` threw `RangeError: Invalid time value`.

### Root Cause

The policy validator proves numeric shape but not semantic safety. The consumer
assumes validation established every invariant needed by its Date operation.
The missing upper bound makes that assumption false.

### Impact Analysis

- **Affected component:** `rlportfolio.js`
- **Affected entry points:** `validatePolicy()` and callers that rely on it,
  including `deriveInterestSignals()`
- **Affected data:** no stored data mutation
- **Affected users:** only a deployment with an extreme committed policy value
- **Failure:** synchronous uncaught `RangeError`
- **Current likelihood:** low because the shipped value is `56`

## Fix Design

### Named Product Bound

Add one module constant near the policy and timestamp constants:

```js
// A century is beyond any useful behavior-evidence horizon. The extra 25 days
// cover the maximum leap-day count within 100 years.
var MAXIMUM_EVIDENCE_AGE_DAYS = 100 * 365 + 25;
```

The expression explains the value without a hidden magic number. The limit is
a conservative product bound, not an attempt to operate at the TimeClip edge.

The BUG-005 security probe measured the first Date failure at roughly
99,979,347 days for its fixture. The proposed bound is over 2,700 times smaller
and still over 650 times larger than the shipped 56-day policy.

### Validation Change

Extend the existing behavior-policy validation branch:

```js
!finiteNonNegative(behaviorPolicy.maximumEvidenceAgeDays) ||
behaviorPolicy.maximumEvidenceAgeDays > MAXIMUM_EVIDENCE_AGE_DAYS
```

Keep the existing failure call:

```js
failure("P008-CONFIG", "invalid-policy", "behavior", null, false)
```

`findNonFinite()` remains earlier in the function. `NaN` and infinities keep
their existing `non-finite-policy` refusal. Negative and above-bound finite
values use `invalid-policy` for the behavior section.

### Test Design

Extend `tests/portfolio-foundation.unit.mjs`. Keep the test in the existing
policy-contract carrier instead of creating a second policy test file.

Define the test-side boundary as `100 * 365 + 25`. Do not copy the unexplained
literal `36525` into assertions.

Required cases:

1. The committed `56` value validates.
2. The exact `100 * 365 + 25` boundary validates.
3. Boundary plus one returns the exact config refusal.
4. A known TimeClip-overflowing value returns that refusal from
   `deriveInterestSignals()` without throwing.
5. Removing the upper-bound predicate makes the one-over assertion fail.

The one-over case is the primary adversarial test. Current source accepts it,
so the test must be red before implementation.

### Alternatives Considered

1. **Use the largest TimeClip-derived day count.** Rejected. The useful bound
   would vary with the evidence timestamp, and arithmetic at the Date edge is
   harder to review than the product needs.
2. **Clamp the configured value.** Rejected. A hidden replacement violates the
   repository's fail-loud configuration policy.
3. **Catch `RangeError` in derivation.** Rejected. This validates too late and
   lets other policy consumers receive an invalid value.
4. **Change the committed value only.** Rejected. The shipped `56` is already
   safe, and changing it does not close the accepted-input class.

## Change Boundary

| Path | Planned change |
| --- | --- |
| `rlportfolio.js` | Add the named bound and enforce it in `validatePolicy()` |
| `tests/portfolio-foundation.unit.mjs` | Add boundary, one-over, and overflow-refusal cases |
| `notes/portfolio-survival-allocation-lab.md` | Add the regression case to the existing carrier inventory if that inventory requires a new row |
| This bug packet | Record design, plan, and evidence |

Excluded surfaces include the committed config value, expiry arithmetic,
signal schemas, storage schemas, HTML, shared data modules, and every other
feature packet.

## Capability Shape

### Single-Implementation Justification

One validator owns this policy contract. The change adds one predicate to that
owner and introduces no provider, adapter, strategy, or second implementation.
A new abstraction would add indirection without variation.

## Complexity Tracking

None - the simplest viable fix is one named constant, one validation predicate,
and focused regression assertions.

## Ownership Handoff

This diagnostic design records a concrete proposal. `bubbles.design` must
review and adopt the product-bound decision before `bubbles.plan` finalizes the
execution plan. `bubbles.test` must then author the red scenario-first carrier
before `bubbles.implement` changes source.
