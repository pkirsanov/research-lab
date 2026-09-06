# Bug Fix Design: BUG-001 Unsafe Token Usage Normalization

## Root Cause Analysis

### Investigation Summary

`rlbriefroute.js` has two integer gates for usage values.
`usageDimension` validates provider fields. `validateUsageDimension` validates
the normalized receipt. Both call `Number.isInteger` and accept unsafe numbers.

`normalizeLocalUsage` validates the three dimensions, then evaluates
`input.value + output.value !== total.value`. It does not guard the addition.

### Root Cause

The implementation uses integer syntax as a substitute for exact numeric
representation. `Number.isInteger` accepts values beyond
`Number.MAX_SAFE_INTEGER`. Addition can therefore round before the provider
total comparison and convert an inconsistent receipt into an accepted one.

### Impact Analysis

- **Affected component:** `rlbriefroute.js` usage normalization and receipt validation.
- **Affected data:** local-provider prompt, completion, and total token dimensions.
- **Security impact:** a rounded total can cross the usage-integrity boundary.
- **Authority impact:** none is permitted; the shadow path remains non-authoritative.
- **Consumer impact:** zero production consumers exist for this shadow path.

## Fix Design

### Solution Approach

1. Replace both token-value `Number.isInteger` checks with
   `Number.isSafeInteger` while retaining the non-negative condition.
2. Validate prompt, completion, and provider total independently before any
   arithmetic.
3. When prompt and completion are measured, compare prompt with
   `Number.MAX_SAFE_INTEGER - completion` before adding them.
4. Compute the sum only after the pre-addition guard passes.
5. Assert that the computed sum remains a safe integer.
6. Compare a measured provider total only with that safe computed sum.
7. Preserve `unmeasured` states when any field is missing or `null`.

All failures use the existing `B030-USAGE-INVALID` envelope. The implementation
may add a specific overflow reason, but it must not change the closed error code.

### Ordering Invariant

The repair must preserve this order:

1. validate each present field;
2. return any field refusal;
3. guard prompt-plus-completion overflow;
4. compute the sum;
5. compare an independently safe provider total;
6. build and validate the receipt.

### Change Boundary

| Path | Authorized change |
| --- | --- |
| `rlbriefroute.js` | Change only usage field validation, safe addition, and measured receipt validation. |
| `scripts/selftest.mjs` | Add focused Feature 030 safe-integer assertions only. |
| `tests/brief-openai-compatible-adapter.functional.mjs` | Add only TP-01-09 and helpers used exclusively by that test. |
| `specs/030-budget-aware-hybrid-brief-generation/bugs/BUG-001-unsafe-token-usage-normalization/**` | Record this packet and later evidence. |

The shared selftest and functional carrier are coordinated with BUG-002.
BUG-001 owns only safe-integer assertions and the exact TP-01-09 title.

### Preserved Architecture

No route, endpoint, provider, model, adapter, policy, receipt contract, public
artifact, scheduler, or production entrypoint changes. A rejected usage payload
does not authorize rerouting. Copilot production remains authoritative.

### Alternative Approaches Considered

1. Convert counts to `BigInt`. Rejected because the existing receipt contract
   uses JSON numbers and the required repair is strict admission, not a new type.
2. Compare the provider total before validating the operands. Rejected because
   unsafe operands can already corrupt the arithmetic.
3. Omit total consistency validation. Rejected because it would weaken the
   existing integrity contract.
4. Synthesize a total when the provider omits it. Rejected because missing data
   must remain unmeasured.

## Regression Design

TP-01-09 uses the exact parent title and command. It first captures RED on the
reported rounded-equality case. It then covers safe boundaries, each unsafe
field, addition overflow, safe inconsistency, missing values, and `null` values.

The same command captures GREEN after the repair. The complete repository
selftest and both provider canaries then verify the unchanged broader path.

## Risks And Controls

| Risk | Control |
| --- | --- |
| An unsafe value enters through a prebuilt receipt. | Apply safe-integer validation in `validateUsageDimension` as well as provider parsing. |
| Addition occurs before the overflow check. | Assert the maximum-minus-completion guard with an overflow-at-one negative case. |
| Missing data becomes zero. | Assert absence of `value` on every unmeasured dimension. |
| The shared functional file mixes BUG-001 and BUG-002 changes. | Keep distinct exact test titles and helpers with one finding owner each. |
| A refusal reroutes to another provider. | Preserve routing code byte-for-byte and assert no second provider path. |

## Complexity Tracking

None - the repair strengthens the two existing numeric gates and one existing
sum without adding a new abstraction.
