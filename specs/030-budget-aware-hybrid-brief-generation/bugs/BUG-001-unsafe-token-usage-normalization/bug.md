# BUG-001: Unsafe Token Usage Normalization

**Status:** Confirmed
**Severity:** Medium
**Security class:** A08 - Software and Data Integrity Failures
**Finding:** `F030-SEC-01`
**Reported:** 2026-09-03
**Feature:** `specs/030-budget-aware-hybrid-brief-generation`
**Affected module:** `rlbriefroute.js`

## Summary

`normalizeLocalUsage` accepts non-negative integers that exceed JavaScript's
safe-integer range. It then adds measured prompt and completion counts without
an overflow guard. IEEE-754 rounding can make an inconsistent provider total
compare equal to the rounded sum.

## Reproduction

The security handoff supplies this adversarial input:

1. Set `prompt_tokens` to `9007199254740992`.
2. Set `completion_tokens` to `1`.
3. Set `total_tokens` to `9007199254740992`.
4. Pass the object to `RLBRIEFROUTE.normalizeLocalUsage`.

The handoff reports an `ok: true` result because the unsafe addition rounds to
the supplied total. This invocation did not repeat the RED execution.

## Expected Behavior

Every present token count must be a non-negative `Number.isSafeInteger` value.
The normalizer must reject prompt-plus-completion overflow before addition. A
provider total must be independently safe before any consistency comparison.

Missing and `null` fields must remain `unmeasured`. The normalizer must not
synthesize zero or a total.

## Actual Behavior

`usageDimension` and `validateUsageDimension` use `Number.isInteger`.
`normalizeLocalUsage` compares `input + output` with the provider total without
checking whether the addition is safe.

## Environment

- Repository revision: `eba665b8ee5569b2bb14c4ab6f868cb7636788c8`
- Observation date: 2026-09-03
- Runtime: JavaScript number arithmetic
- Worktree: existing Feature 030 source and test changes were present before this packet

## Evidence Boundary

The RED result above is operator-supplied diagnostic context. It is not
current-invocation execution evidence. The exact TP-01-09 command must capture
RED before the source repair and GREEN after it.

## Root Cause

The normalizer treats mathematical integers and safely representable integers
as equivalent. JavaScript represents both unsafe operands as numbers, so
`Number.isInteger` accepts them. The unchecked sum can then lose precision
before the consistency comparison.

## Impact

The receipt can certify a rounded token total as consistent. That weakens the
integrity boundary for usage accounting and any later budget analysis that
consumes the receipt.

## Repair Boundary

The production repair belongs only in `rlbriefroute.js`. Focused assertions
belong in the Feature 030 section of `scripts/selftest.mjs` and in the exact
TP-01-09 test block in
`tests/brief-openai-compatible-adapter.functional.mjs`.

No route, provider, model, endpoint, policy, public artifact, scheduler, or
production consumer may change. A refusal must not trigger provider rerouting.

## Related

- Parent scenario: `SCN-030-002`
- Parent requirement: `S01-R08 Usage truth`
- Parent test row: `TP-01-09`
- Parent DoD row: `DOD-01-TP-01-09`
- Separate defect: `F030-SEC-02` belongs to BUG-002
- Framework observation: `F030-SEC-OBS-01` is not part of this packet
