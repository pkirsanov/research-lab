# BUG-007: Compose Brief Prototype-Sensitive Keys

**Status:** Confirmed
**Severity:** High
**Reported:** 2026-08-26
**Source finding:** `SEC-B006-S1`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Affected module:** `rlportfoliobrief.js`

## Summary

Exported `composeBrief()` uses ordinary objects as maps keyed by caller-derived
completion subjects and domains. Prototype-sensitive strings therefore resolve
inherited properties instead of independent map entries.

For both `subjectId` and `domain`, each of `__proto__`, `constructor`, and
`toString` reaches shared built-in objects. The current support-date write
mutates one of those objects. The following category lookup throws a
`TypeError` outside the module's result envelope.

## Severity

High. A valid string value can synchronously terminate brief composition and
mutate process-global built-in state before the throw. No network or secret
boundary is involved, but the defect affects integrity and availability at an
exported production function.

## Reproduction

1. Load the committed portfolio policy, market-brief windows, and exported
   `rlportfoliobrief.js` module.
2. Compose the existing normal four-lane fixture and record its result and
   subject order.
3. Replace every completion `subjectId` with `__proto__`, `constructor`, and
   `toString`, one key per isolated call.
4. Repeat the same matrix for completion `domain`.
5. Before and after every call, inspect the three built-in targets reached by
   inherited lookup: `Object.prototype`, `Object`, and
   `Object.prototype.toString`.
6. Delete any process-local probe property in a `finally`-equivalent cleanup
   step and verify no target retains it.

### Observed

- The normal control returns `ok: true` with lane order
  `held,watchlist,completedResearch,inferredRelevance` and subject order
  `MSFT,BND,ZZTOP,semiconductors`.
- All six hostile subject/domain cases return no result envelope.
- All six cases throw
  `TypeError: categoriesBySubject[key].indexOf is not a function`.
- `__proto__` writes the completion date onto `Object.prototype`.
- `constructor` writes the completion date onto `Object`.
- `toString` writes the completion date onto
  `Object.prototype.toString`.
- Cleanup returns every built-in target to its pre-probe state.

Current-session output is recorded at
`report.md#before-fix-reproduction`.

### Expected

Caller-derived subjects and domains must behave as own keys, including
`__proto__`, `constructor`, and `toString`. `composeBrief()` must return through
its declared result contract without mutating shared prototypes or built-ins.
Normal output, lane and subject ordering, local refusal precedence, and shared
policy refusal behavior must not move.

## Root Cause

`composeBrief()` and its `distinctCount()` helper allocate caller-keyed maps
with `{}`. Reads therefore walk `Object.prototype`. The support-date map then
writes through the inherited object or function. The category map assumes its
lookup either misses or returns an array, but an inherited built-in value is
neither, so `.indexOf()` throws.

The affected internal map set is:

1. `distinctCount()` local `seen`
2. `excludedBySubject`
3. `supportBySubject`
4. `categoriesBySubject`
5. `horizonBySubject`
6. `newestSupportBySubject`
7. `supportDatesBySubject`
8. `qualifiesVia`
9. `inferredDomains`
10. `byId`

The per-subject date set created inside `supportDatesBySubject` is another
set-like ordinary object. Its keys are derived ISO dates rather than caller
subjects, but using the same null-prototype representation keeps the complete
aggregation chain inheritance-free.

Two caller-supplied lookup maps, `owners` and `priorEvidenceIds`, also use the
qualified subject as a direct property lookup. They are latent after a partial
aggregation-only repair: an absent `__proto__` key still resolves inherited
state, and `priorEvidenceIds[subjectId].slice()` can throw. They therefore
belong in the same fix boundary through own-property membership checks.

## Proposed Resolution

Use the module's existing `Object.create(null)` pattern for every internal
caller-keyed aggregation map and the nested date set. Use explicit own-property
membership for `owners` and `priorEvidenceIds` before reading their values.

Do not blacklist key spellings, catch and hide the exception, coerce input, or
change accepted string contracts. Preserve `Object.keys()`-based insertion
order and all existing refusal precedence.

## Scope

The planned source change is limited to caller-keyed map allocation and the two
membership-safe lookup sites in `rlportfoliobrief.js`. Persistent regressions
belong in the existing brief functional carrier and brief browser carrier.

This filing changes no product source or persistent test. It does not touch the
separate dirty parent Feature 008 scope and root test-plan transaction.

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Originating security finding:
  `../BUG-006-evidence-window-date-overflow/report.md#sec-b006-s1`
- Design: `design.md`
- Fix scope: `scopes.md`
