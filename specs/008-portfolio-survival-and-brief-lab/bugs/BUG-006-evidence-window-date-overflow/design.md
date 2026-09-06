# Design: BUG-006 Evidence Window Date Overflow

## Design Brief

### Current State

`rlportfolio.js` now owns a private `36525`-day product ceiling and enforces it
through `validatePolicy()`. Core `deriveInterestSignals()` validates before it
formats signal expiry, and the shipped value remains `56`.

Exported `rlportfoliobrief.js::composeBrief()` is a second policy-derived Date
formatter. It subtracts `maximumEvidenceAgeDays` from `composedAt` without first
calling the shared validator. Current execution accepts `36526`, accepts a
non-finite value, and throws `RangeError` for a finite backward-TimeClip
overflow value that `validatePolicy()` refuses.

### Target State

Every policy-derived Date formatter relies on the one `validatePolicy()` owner.
`composeBrief()` delegates to that validator immediately before it first reads
`maximumEvidenceAgeDays` and returns any failure result unchanged.

The existing local input, window, timestamp, and cutoff errors keep their
precedence. The shipped 56-day influence window, valid-policy scoring, both
Date expressions, schemas, storage, UI, and public contract versions remain
unchanged.

### Patterns to Follow

- Keep the invariant in the closed policy validator in `rlportfolio.js`.
- Use a private module-scope `var`, matching the module's constant convention.
- Preserve `findNonFinite()` before section-specific semantic validation.
- Reuse `failure("P008-CONFIG", "invalid-policy", "behavior", null, false)`.
- Follow `rlportfoliobrief.js::deriveInterestSignals()`: delegate to
   `portfolio.validatePolicy()` and return its result without rebuilding it.
- Keep `tests/portfolio-foundation.unit.mjs` as the policy-contract carrier.
- Use `tests/portfolio-brief.functional.mjs` for the exported `composeBrief()`
   consumer contract and its existing action-history cutoff fixture.

### Patterns to Avoid

- Do not derive the ceiling from the ECMAScript TimeClip boundary.
- Do not clamp, coerce, round, or substitute an invalid configured value.
- Do not catch `RangeError` and continue with partial derivation.
- Do not export the ceiling for tests to read from production code.
- Do not duplicate the ceiling in `rlportfoliobrief.js` or the HTML page.
- Do not rebuild a shared policy failure with the brief module's local `err()`
   or `contractErr()` helpers.
- Do not hoist shared validation ahead of existing brief input, window,
   timestamp, or cutoff checks.
- Do not change the committed 56-day policy value.

### Resolved Decisions

- The ceiling is `100 * 365 + 25`, which equals `36525` days.
- The ceiling limits behavior evidence eligibility, not stored-history lifetime.
- The constant name is `MAXIMUM_EVIDENCE_AGE_DAYS`.
- `rlportfolio.js` owns the constant and the only enforcing predicate.
- Finite above-bound values use `P008-CONFIG / invalid-policy / behavior`.
- Non-finite values retain their existing `non-finite-policy` refusal.
- One-over and actual-overflow inputs provide separate regression cases.
- `composeBrief()` adds one shared-validator delegation and no local ceiling.
- The delegation occurs after existing local prerequisites and immediately
   before `var maxAgeDays = input.policy.behavior.maximumEvidenceAgeDays`.
- `composeBrief()` returns the shared failure object unchanged and never catches
   Date formatting exceptions.
- The already-delivered `rlportfolio.js` predicate and foundation tests are not
   reopened by this consumer repair.

### Open Questions

None found. The spec fixes the value, refusal shape, owner, and non-movement
contract.

## Purpose And Scope

This design closes the remaining public-consumer gap after the shared validator
repair. It does not change the active evidence window, behavior scoring, stored
history, or signal representation.

The repair routes each policy-derived Date formatter through the policy's one
validation owner before that formatter uses the evidence-age value.

## Root Cause Analysis

### Controlling Path

The delivered core path performs these steps:

1. `findNonFinite()` rejects `NaN` and infinities.
2. The behavior section validates closed vocabulary and event capacity.
3. The behavior section rejects values above `MAXIMUM_EVIDENCE_AGE_DAYS`.
4. The generic numeric loop applies `finiteNonNegative()`.
5. `deriveInterestSignals()` returns a policy failure before adding the window
   to `bucket.latest`.

The remaining brief path performs these steps:

1. `composeBrief()` checks its local input, window, policy-presence, timestamp,
   window-id, and generic-cutoff prerequisites.
2. It normalizes evidence and completion collections.
3. It reads `input.policy.behavior.maximumEvidenceAgeDays` directly.
4. It subtracts that value from `composedAt` and calls `toISOString()`.
5. It never calls `portfolio.validatePolicy()` on this path.

The shared validator proves the product range, but this exported consumer does
not consult it before trusting the policy. That bypass is the remaining root
cause.

### Runtime Boundary Versus Product Ceiling

The safe whole-day offset depends on the evidence timestamp. The formula below
defines that offset against the positive TimeClip boundary.

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

### Public Consumer Validation

Add one delegation in `composeBrief()` immediately before its first
`maximumEvidenceAgeDays` read:

```js
var policyResult = portfolio.validatePolicy(input.policy);
if (!policyResult.ok) return policyResult;
```

The call belongs after the existing local input, window, policy-presence,
`publishedAt`, `composedAt`, window-id, and generic-cutoff checks. Those local
failures therefore retain their current precedence. Evidence and completion
normalization before this point has no failure return and performs no mutation.

The shared call must occur before `maxAgeDays` is aliased and before the
backward action-history cutoff is formatted. It validates the entire closed
policy rather than duplicating one numeric predicate. `composeBrief()` must
return the shared result directly, including its `PortfolioError/v1` fields,
instead of translating it through `err()` or `contractErr()`.

### Exact `composeBrief()` Contract

| `maximumEvidenceAgeDays` | Shared validation | Required `composeBrief()` behavior |
| --- | --- | --- |
| `36525` | Accepted | Continue composition, return `ok: true`, and format the existing action-history cutoff without changing its expression. |
| `36526` | `P008-CONFIG / invalid-policy / behavior` | Return the exact shared failure envelope before Date arithmetic; do not throw, clamp, or echo the value. |
| Non-finite (`NaN` or infinity) | `P008-CONFIG / non-finite-policy / policy.behavior.maximumEvidenceAgeDays` | Return the exact shared failure envelope before Date arithmetic; do not convert the cutoff to `null` and continue. |
| Finite backward-TimeClip overflow, including `100100000` | `P008-CONFIG / invalid-policy / behavior` | Return the exact shared failure envelope; no `RangeError` escapes. |

For a doubly invalid call, existing local checks still win until the insertion
point. For example, invalid `composedAt` plus `36526` must continue to return
`P008-BRIEF-COMPOSED / local-composition-time-required`. Once those local
prerequisites pass, shared policy validation wins before policy-derived Date
formatting or behavior-floor evaluation.

### Derivation Non-Movement

Do not change `deriveInterestSignals()` expiry arithmetic. Its first operation
already returns a failed `validatePolicy()` result before workspace validation
or Date arithmetic.

Do not change `rlportfoliobrief.js::deriveInterestSignals()`. Its existing floor
guard still owns `behavior-floor-policy-invalid`, including its precedence for
non-finite floor inputs. Its later `portfolio.validatePolicy(input.policy)` call
continues to refuse finite above-bound values with the shared envelope.

## Consumer Inventory

### Production Consumers

| Consumer | Relationship | Effect of the new ceiling |
| --- | --- | --- |
| `portfolio-survival-allocation.config.json` | Supplies the selected `56`-day window | No file change and no behavior change |
| `rlportfolio.js::validatePolicy` | Public owner of the closed policy contract | Adds the only enforcing predicate |
| `rlportfolio.js::deriveInterestSignals` | Direct validate-first Date consumer | Returns the shared refusal before Date arithmetic |
| `rlportfolio.js::buildInterestSignalCandidate` | Calls core derivation | Inherits the refusal without a source change |
| `rlportfoliobrief.js::deriveInterestSignals` | Calls `portfolio.validatePolicy()` after its existing floor guard | No change; retains floor-error precedence and shared policy refusal |
| `rlportfoliobrief.js::composeBrief` | Formats a backward action-history cutoff from the same policy | Adds one shared-validator delegation immediately before the policy-derived Date expression |
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
| `tests/portfolio-behavior-occurrence.unit.mjs` | Calls both validators and both derivation modules | Preserve refusal ordering and cross-module behavior. Refine the BUG-004 mutation anchor only enough to remove the `deriveInterestSignals()` recheck while preserving its loop and the new `composeBrief()` pair. This harness-only repair changes no BUG-004 expected outcome. |
| `tests/portfolio-brief.functional.mjs` | Directly exercises exported `composeBrief()` and owns the fourth-clock cutoff assertions | Add the public-consumer boundary, refusal, no-throw, and local-error-precedence regression |
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

Both repaired paths must return that envelope. An uncaught `RangeError`, a
clamp, a locally rebuilt error, or a successful empty result would each violate
the design.

## Testing And Validation Strategy

1. Assert the committed `56` value remains valid.
2. Assert `100 * 365 + 25` remains valid.
3. Assert one day above the ceiling returns the exact invalid-policy envelope.
4. Prove the chosen overflow fixture genuinely throws under direct Date
   formatting.
5. Pass that overflow policy to core derivation and assert a returned config
   refusal without an exception.
6. Assert infinity retains `non-finite-policy` and its precise field path.
7. Add a persistent `composeBrief()` consumer case in
   `tests/portfolio-brief.functional.mjs` that accepts `36525`, refuses `36526`,
   refuses non-finite input, and refuses a proven backward-TimeClip overflow
   without throwing.
8. Assert the consumer returns the shared envelopes exactly, rather than brief
   error helpers, and that invalid `composedAt` retains its existing precedence
   over shared policy validation.
9. Record a focused RED run against the current brief consumer before adding
   the delegation. The test must fail because `36526` and non-finite values
   succeed and the overflow value throws.
10. Remove or bypass the new delegation in an isolated negative control and
    require the consumer regression to fail.
11. Run the existing direct consumers and all eight browser carriers to prove
    the committed 56-day path did not move.

The product boundary and runtime-overflow fixtures must remain separate. One
proves the policy decision. The other proves the dangerous input class exists.

## Change Boundary

| Path | Planned change |
| --- | --- |
| `rlportfoliobrief.js` | Add one shared-validator delegation immediately before `composeBrief()` reads `maximumEvidenceAgeDays` |
| `tests/portfolio-behavior-occurrence.unit.mjs` | Refine the existing BUG-004 mutation anchor to pair the shared delegation with the uniquely following `retainedIdentityOrder.forEach` statement. Remove only the `deriveInterestSignals()` pair, re-emit the loop opener, and assert one pair disappeared while `composeBrief()` retains its pair. No BUG-004 contract or expected outcome changes. |
| `tests/portfolio-brief.functional.mjs` | Add the persistent exported-consumer boundary, refusal, overflow, and precedence regression |
| This bug packet | Preserve aligned design, plan, and execution evidence through their owning agents |

The delivered `rlportfolio.js` ceiling/predicate and
`tests/portfolio-foundation.unit.mjs` regression are preserved without further
change. Excluded surfaces include policy JSON, both Date expressions,
`rlportfoliobrief.js::deriveInterestSignals()`, HTML, notes, signal schemas,
storage schemas, shared data modules, parent or sibling packets, and generated
`_site/**` output.

## Capability Shape

### Single-Implementation Justification

This is a bug fix inside one existing policy foundation. One validator owns the
contract, while a second public consumer delegates to it. No second provider,
strategy, screen contract, or adapter appears.

A reusable abstraction would add indirection without adding a variation point.

## Alternatives And Tradeoffs

1. **Use a TimeClip-derived maximum.** Rejected because the value depends on
   the evidence timestamp and would encode a runtime edge as product policy.
2. **Clamp the configured value.** Rejected because it hides invalid policy and
   changes the requested evidence horizon silently.
3. **Catch `RangeError` in derivation.** Rejected because validation would still
   admit an invalid policy for every other consumer.
4. **Duplicate the check in brief composition.** Rejected because it creates a
   second policy owner and risks refusal-order drift.
5. **Change only the committed value.** Rejected because `56` is already valid
   and does not close the accepted-input class.
6. **Validate at the top of `composeBrief()`.** Rejected because it would reorder
   existing local input, timestamp, window-id, and cutoff errors. The call
   belongs at the first policy-derived Date use instead.
7. **Translate the failure through `contractErr()`.** Rejected because rebuilding
   the envelope duplicates ownership and can drift from `validatePolicy()`.

## Complexity Tracking

None - the simplest viable approach uses one private constant, one predicate,
and focused regression assertions.

## Ownership Handoff

This design preserves the delivered product ceiling and extends its exact
refusal contract to the omitted public consumer. `bubbles.plan` must
narrow-expand the existing Scope 01 rather than create a new bug packet. The
plan must add `rlportfoliobrief.js` and `tests/portfolio-brief.functional.mjs`
to the active Change Boundary. It must add one `composeBrief()` consumer
scenario to `scenario-manifest.json`. It must add matching RED and functional
rows to `test-plan.json` and Test Plan-to-DoD parity. The persistent brief
carrier then follows RED -> implement -> GREEN.

`bubbles.test` owns the red regression carrier.
`bubbles.implement` owns the two-line delegated validation repair after that
test demonstrates the current failure. The packet and Scope 01 remain
`in_progress`. This design reconciliation promotes no existing DoD item or
certification claim.

## Open Questions

None found. The active design contains one current contract and no superseded
alternative.
