# Design: BUG-006 Evidence Window Date Overflow

## Design Brief

### Current State

`rlportfolio.js` treats `portfolio-survival-allocation.config.json` as a closed,
versioned policy. `validatePolicy()` checks every numeric behavior field for
finiteness and non-negativity.

The validator does not cap `behavior.maximumEvidenceAgeDays`. The shipped value
is `56`, but any finite non-negative value currently passes.

`deriveInterestSignals()` validates policy before it formats signal expiry.
An accepted extreme value can still push that expiry outside the finite Date
range and throw `RangeError`.

### Target State

`validatePolicy()` accepts evidence-age values through an explicit 100-year
product ceiling. It refuses larger finite values through the existing behavior
policy error contract.

The shipped 56-day influence window remains unchanged. Valid-policy scoring,
expiry arithmetic, schemas, storage, UI, and public contract versions remain
unchanged.

### Patterns to Follow

- Keep the invariant in the closed policy validator in `rlportfolio.js`.
- Use a private module-scope `var`, matching the module's constant convention.
- Preserve `findNonFinite()` before section-specific semantic validation.
- Reuse `failure("P008-CONFIG", "invalid-policy", "behavior", null, false)`.
- Keep `rlportfoliobrief.js` dependent on `portfolio.validatePolicy()`.
- Keep `tests/portfolio-foundation.unit.mjs` as the policy-contract carrier.

### Patterns to Avoid

- Do not derive the ceiling from the ECMAScript TimeClip boundary.
- Do not clamp, coerce, round, or substitute an invalid configured value.
- Do not catch `RangeError` and continue with partial derivation.
- Do not export the ceiling for tests to read from production code.
- Do not duplicate the ceiling in `rlportfoliobrief.js` or the HTML page.
- Do not change the committed 56-day policy value.

### Resolved Decisions

- The ceiling is `100 * 365 + 25`, which equals `36525` days.
- The ceiling limits behavior evidence eligibility, not stored-history lifetime.
- The constant name is `MAXIMUM_EVIDENCE_AGE_DAYS`.
- `rlportfolio.js` owns the constant and the only enforcing predicate.
- Finite above-bound values use `P008-CONFIG / invalid-policy / behavior`.
- Non-finite values retain their existing `non-finite-policy` refusal.
- One-over and actual-overflow inputs provide separate regression cases.

### Open Questions

None found. The spec fixes the value, refusal shape, owner, and non-movement
contract.

## Purpose And Scope

This design closes one policy-validation gap. It does not change the active
evidence window, behavior scoring, stored history, or signal representation.

The repair makes the policy's valid domain explicit before any consumer uses
the evidence-age value. Every existing consumer then inherits one answer.

## Root Cause Analysis

### Controlling Path

Current source performs these steps:

1. `findNonFinite()` rejects `NaN` and infinities.
2. The behavior section validates closed vocabulary and event capacity.
3. The generic numeric loop applies `finiteNonNegative()`.
4. No semantic maximum applies to `maximumEvidenceAgeDays`.
5. `deriveInterestSignals()` adds the accepted window to `bucket.latest`.
6. `toISOString()` throws when that sum exceeds TimeClip.

The validator proves numeric shape but not the product's valid range. The
consumer therefore trusts an invariant that validation never established.

### Runtime Boundary Versus Product Ceiling

The maximum whole-day offset that a timestamp can add without exceeding the
positive TimeClip boundary depends on that timestamp:

$$
\operatorname{safeDays}(t) = \left\lfloor
\frac{8{,}640{,}000{,}000{,}000{,}000 - \operatorname{Date.parse}(t)}
{86{,}400{,}000}
\right\rfloor
$$

For `2026-07-16T10:00:00.000Z`, current execution produced these boundaries:

- `99,979,349` whole days still format successfully.
- `99,979,350` days throw `RangeError: Invalid time value`.
- Both `36,525` and `36,526` days currently format successfully.

Therefore, `36,525` is not a runtime-limit approximation. A TimeClip-derived
limit would vary with each evidence timestamp and would remain near 100 million
days for current dates.

### Product Retention Decision

The 100-year ceiling limits how long behavior evidence may remain eligible to
influence a current research decision. It does not delete the stored event.

A century exceeds a defensible human research horizon. Treating older behavior
as current relevance would weaken the evidence-quality meaning required by the
parent feature.

The ceiling also leaves the shipped 56-day policy ample room. Product owners
can revise realistic evidence windows without approaching the validation cap.

The extra 25 days cover the largest leap-day count in a 100-year span. The
expression records that calendar rationale without pretending to model Date
capacity.

Changing this ceiling requires an explicit product-policy revision and new
boundary evidence. Runtime timestamps must never move the ceiling silently.

## Fix Design

### Constant Ownership And Name

Add this private module-scope constant in `rlportfolio.js`, beside the policy
and timestamp constants:

```js
// A century is the product ceiling for behavior evidence eligibility. The
// extra 25 days cover the largest leap-day count within 100 years.
var MAXIMUM_EVIDENCE_AGE_DAYS = 100 * 365 + 25;
```

`rlportfolio.js` owns this constant because `validatePolicy()` owns the closed
policy contract. The frozen public API must not export it.

Tests must express `100 * 365 + 25` independently. Importing the production
constant would let the validator and its assertion share the same defect.

No second constant belongs in `rlportfoliobrief.js`, the HTML page, or the JSON
policy. The JSON value remains the selected 56-day window, not its validity cap.

### Validation Ordering

Extend the existing behavior-policy branch with one finite upper-bound
predicate:

```js
behaviorPolicy.maximumEvidenceAgeDays > MAXIMUM_EVIDENCE_AGE_DAYS
```

Keep `findNonFinite()` earlier in `validatePolicy()`. This preserves the current
non-finite contract:

```json
{
  "contractVersion": "PortfolioError/v1",
  "code": "P008-CONFIG",
  "reason": "non-finite-policy",
  "valueEchoed": false,
  "recoverable": false,
  "field": "policy.behavior.maximumEvidenceAgeDays"
}
```

Finite negative values already fail as an invalid behavior policy. Finite
above-bound values join that existing semantic failure class:

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

The validator must return the same frozen failure envelope. It must not expose
the rejected value or mark the configuration error recoverable.

### Derivation Non-Movement

Do not change `deriveInterestSignals()` expiry arithmetic. Its first operation
already returns a failed `validatePolicy()` result before workspace validation
or Date arithmetic.

Do not change `rlportfoliobrief.js`. Its existing floor guard still owns
`behavior-floor-policy-invalid`, including its precedence for non-finite floor
inputs.

Its later `portfolio.validatePolicy(input.policy)` call will refuse a finite
above-bound value with the shared `P008-CONFIG / invalid-policy / behavior`
envelope.

## Consumer Inventory

### Production Consumers

| Consumer | Relationship | Effect of the new ceiling |
| --- | --- | --- |
| `portfolio-survival-allocation.config.json` | Supplies the selected `56`-day window | No file change and no behavior change |
| `rlportfolio.js::validatePolicy` | Public owner of the closed policy contract | Adds the only enforcing predicate |
| `rlportfolio.js::deriveInterestSignals` | Direct validate-first Date consumer | Returns the shared refusal before Date arithmetic |
| `rlportfolio.js::buildInterestSignalCandidate` | Calls core derivation | Inherits the refusal without a source change |
| `rlportfoliobrief.js::deriveInterestSignals` | Calls `portfolio.validatePolicy()` after its existing floor guard | Inherits finite above-bound refusal without reordering other errors |
| `portfolio-survival-allocation-lab.html::boot` | Calls `api.validatePolicy(policy)` before opening stores | Uses the existing blocked-policy UI for an invalid committed value |
| `portfolio-survival-allocation-lab.html::composeBrief` | Calls brief derivation for the visible brief | Uses the existing `Brief unavailable` error path |

The following 28 top-level `rlportfolio.js` functions call `validatePolicy()`
directly and inherit the ceiling:

1. `validateHoldingEntry`
2. `validateImport`
3. `validateManualDraft`
4. `createEmptyWorkspace`
5. `validatePortfolioRevision`
6. `validatePortfolioDraft`
7. `validateWorkspace`
8. `validateMandateDraft`
9. `validateMandateRevision`
10. `canonicalBehaviorIdentity`
11. `validateBehaviorEvent`
12. `buildBehaviorEvent`
13. `dedupeBehaviorEvents`
14. `validateInterestSignal`
15. `validateActionOutcome`
16. `reduceActionOutcome`
17. `deriveInterestSignals`
18. `validateResearchDossier`
19. `createResearchDossier`
20. `createDossierStore`
21. `previewDossierExport`
22. `exportDossierPrivate`
23. `clearDossierStorage`
24. `derivePersonalCategoryRegistry`
25. `clearAllPersonalData`
26. `createPortfolioStore`
27. `privacyInventory`
28. `computeWorkspace`

No caller needs a second check. Central validation keeps every public operation
on the same policy contract.

### Existing Test Consumers

| Test carrier | Existing relationship | Required treatment |
| --- | --- | --- |
| `tests/portfolio-foundation.unit.mjs` | Owns direct closed-policy assertions | Add shipped, boundary, one-over, and overflow-refusal cases |
| `tests/portfolio-allocation.functional.mjs` | Calls `validatePolicy()` | Must remain green under `56` |
| `tests/portfolio-behavior-occurrence.unit.mjs` | Calls both validators and both derivation modules | Preserve refusal ordering and cross-module behavior |
| `tests/portfolio-brief.functional.mjs` | Exercises policy and brief/core derivation | Preserve 56-day evidence semantics |
| `tests/portfolio-dossier.functional.mjs` | Calls `validatePolicy()` | Must remain green under `56` |
| `tests/portfolio-privacy.functional.mjs` | Calls policy and interest derivation | Preserve local history and clear behavior |
| `tests/portfolio-stale-domain-signal.unit.mjs` | Exercises core and brief age filtering | Preserve BUG-005 behavior and expiry output |
| `tests/portfolio-workspace.functional.mjs` | Validates policy before compute | Must remain green under `56` |

All eight browser carriers load `portfolio-survival-allocation-lab.html` and
therefore exercise the committed 56-day boot path:

- `tests/portfolio-survival-foundation.spec.mjs`
- `tests/portfolio-survival-brief.spec.mjs`
- `tests/portfolio-survival-risk.spec.mjs`
- `tests/portfolio-survival-paths.spec.mjs`
- `tests/portfolio-survival-diversification.spec.mjs`
- `tests/portfolio-survival-allocation.spec.mjs`
- `tests/portfolio-survival-mobile.spec.mjs`
- `tests/portfolio-survival-accessibility.spec.mjs`

## Data, Contract, And Migration Impact

No data model, storage schema, migration, or public contract version changes.
No existing workspace or event record changes shape.

The policy JSON retains `maximumEvidenceAgeDays: 56`. The ceiling is validator
code because it defines the valid range of that policy field.

## Security, Privacy, And Product Principles

The defect is an availability failure at a configuration boundary. The repair
prevents an accepted policy from escaping the declared result envelope.

The design follows the Research Lab admission test because it preserves the
availability and explainability of decision evidence.

It follows P7 by naming and deriving the ceiling. It follows P22 by requiring
an exact-boundary test, and it follows P23 through a one-over adversarial case.

The cap does not rewrite or delete history. Existing explicit clear operations
remain the only paths that remove behavior evidence.

## Failure Handling And Observability

No new log, metric, telemetry, or exception channel is needed. Invalid policy
already has a typed local error envelope and visible browser failure states.

The repaired path must return that envelope. An uncaught `RangeError`, a clamp,
or a successful empty result would each violate the design.

## Testing And Validation Strategy

1. Assert the committed `56` value remains valid.
2. Assert `100 * 365 + 25` remains valid.
3. Assert one day above the ceiling returns the exact invalid-policy envelope.
4. Prove the chosen overflow fixture genuinely throws under direct Date
   formatting.
5. Pass that overflow policy to core derivation and assert a returned config
   refusal without an exception.
6. Assert infinity retains `non-finite-policy` and its precise field path.
7. Remove the upper-bound predicate in an isolated test mutation and require
   the one-over case to fail.
8. Run the existing direct consumers and all eight browser carriers to prove
   the committed 56-day path did not move.

The product boundary and runtime-overflow fixtures must remain separate. One
proves the policy decision. The other proves the dangerous input class exists.

## Change Boundary

| Path | Planned change |
| --- | --- |
| `rlportfolio.js` | Add the private ceiling and enforce it in `validatePolicy()` |
| `tests/portfolio-foundation.unit.mjs` | Add boundary, one-over, overflow, and contract assertions |
| `notes/portfolio-survival-allocation-lab.md` | Add one carrier row only if its existing inventory requires it |
| This bug packet | Preserve aligned design, plan, and execution evidence through their owning agents |

Excluded surfaces include policy JSON, expiry arithmetic, `rlportfoliobrief.js`,
HTML, signal schemas, storage schemas, shared data modules, and other packets.

## Capability Shape

### Single-Implementation Justification

This is a bug fix inside one existing policy foundation. One validator owns the
contract, and no second provider, strategy, screen contract, or adapter appears.

A reusable abstraction would add indirection without adding a variation point.

## Alternatives And Tradeoffs

1. **Use a TimeClip-derived maximum.** Rejected because the value depends on
   the evidence timestamp and would encode a runtime edge as product policy.
2. **Clamp the configured value.** Rejected because it hides invalid policy and
   changes the requested evidence horizon silently.
3. **Catch `RangeError` in derivation.** Rejected because validation would still
   admit an invalid policy for every other consumer.
4. **Duplicate the check in brief derivation.** Rejected because it creates a
   second policy owner and risks refusal-order drift.
5. **Change only the committed value.** Rejected because `56` is already valid
   and does not close the accepted-input class.

## Complexity Tracking

None - the simplest viable approach uses one private constant, one predicate,
and focused regression assertions.

## Ownership Handoff

This design adopts the product ceiling and exact refusal contract. Any planning
reconciliation belongs to `bubbles.plan` before scenario-first test authorship
or implementation begins.

`bubbles.test` owns the red regression carrier. `bubbles.implement` owns the
source repair after the test demonstrates the current failure.

## Open Questions

None found. The active design contains one current contract and no superseded
alternative.
