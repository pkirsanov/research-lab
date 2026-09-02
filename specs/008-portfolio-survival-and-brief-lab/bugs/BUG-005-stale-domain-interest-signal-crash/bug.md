# BUG-005: Stale-Domain Interest Signal Crash

**Status:** Confirmed
**Severity:** Critical
**Reported:** 2026-08-24
**Feature:** specs/008-portfolio-survival-and-brief-lab
**Affected module:** `rlportfolio.js` — `deriveInterestSignals`

## Summary

`rlportfolio.deriveInterestSignals` throws an uncaught
`RangeError: Invalid time value` whenever **every** eligible behavior event in a
domain falls outside `policy.behavior.maximumEvidenceAgeDays`.

This is a crash, not a refused result. The module's whole contract is
`{ ok, value | error }` — every other failure path returns a `failure(...)`
envelope that the caller can render. This one escapes the envelope entirely and
propagates out of the module, so the caller has nothing to catch and nothing to
show. Because the throw happens while mapping the domain list, a single stale
domain destroys the derivation for **all** domains in the workspace, including
domains whose evidence is fresh and valid.

## Reproduction

Deterministic, no network, no browser.

1. Build an empty workspace.
2. Append one behavior event in domain `equity-research` at
   `2026-01-10T10:00:00.000Z`.
3. Call `deriveInterestSignals(workspace, '2026-07-20T08:00:00.000Z', policy)`.

The event is 190.92 days old against a declared `maximumEvidenceAgeDays` of 56,
so it is the only event in its domain and it is unambiguously out of window.

**Observed:** `RangeError: Invalid time value`, thrown at `rlportfolio.js:2518`.
**Expected:** an `{ ok: true, value: [...] }` envelope that reports the domain
honestly rather than terminating the caller.

Receipt: `report.md#repro-head`.

## Mechanism

Three lines, in this order, inside `deriveInterestSignals`:

| Line | Statement | Consequence |
| --- | --- | --- |
| 2462 | `byDomain[key] = { ... latest: null ... }` | the domain bucket is created for **every** structurally valid event |
| 2475 | `if (ageDays < 0 \|\| ageDays > behavior.maximumEvidenceAgeDays) return;` | the age filter runs **after** the bucket already exists |
| 2518 | `expiresAt: new Date(Date.parse(bucket.latest) + ...).toISOString()` | `bucket.latest` is still `null`, `Date.parse(null)` is `NaN`, `new Date(NaN).toISOString()` throws |

The bucket is created before the filter that decides whether the bucket has any
right to exist. Nothing between 2462 and 2518 can repair that: `bucket.latest`
is only ever assigned inside the post-filter accumulation loop, which this
domain never enters.

`ageDays < 0` reaches the same throw, so a domain whose only evidence is
future-dated relative to `now` crashes identically.

## Blast Radius

`deriveInterestSignals` is a public `rlportfolio.js` export used by
`buildInterestSignalCandidate`. Valid module consumers could therefore trigger
the uncaught exception before the fix.

The current registered page calls neither export. Its brief ranking uses the
separate `RLPORTFOLIOBRIEF.deriveInterestSignals` function, which BUG-005 did not
change. Current evidence therefore does not establish a permanent crash in a
registered-page flow.

The page separately reads `workspace.interestSignals` for Black-Litterman
exclusion accounting. It does not call the persisted-cache writer. That wiring
defect is tracked independently in
[`BUG-010-persisted-interest-signal-wiring`](../BUG-010-persisted-interest-signal-wiring/).
It does not widen BUG-005's crash blast radius. The stale-domain repair and its
contract-only adversarial carrier remain valid.

## Divergence From The Brief

`rlportfoliobrief.deriveInterestSignals` does **not** throw on byte-identical
input. It emits a row with `latestSupportAt: null`, `score: 0`,
`supportingOccurrenceIds: []`, and `floor.rawOccurrenceCount: 1`.

The two derivations therefore disagree about what a stale domain *is*. That
disagreement is the second half of this bug and is resolved in `design.md`
(§ Divergence Resolution), not treated as incidental.

Receipt: `report.md#repro-divergence`.

## Provenance — Pre-Existing

This defect is **not** caused by the BehaviorOccurrence repair.

`a59e38d71 fix(008): separate behavior occurrences from relevance` did touch this
function: it introduced `eligibleEvents` and moved the accumulation into a second
loop over `dedupeBehaviorEvents` output. But it left the bucket-before-filter
ordering exactly as it found it — the `byDomain[key] = {...}` creation still
precedes the age filter in both revisions — and it did not touch the `expiresAt`
line at all. That line was last modified by `9ee3c39ae` on 2026-08-20.

Proven by execution rather than by reading the diff: the identical
`RangeError: Invalid time value` reproduces against `7bdbcb936`, the parent of
`a59e38d71`. Receipt: `report.md#repro-pre-existing`.

## Corroboration

`bubbles.simplify` reached the same bucket-before-filter conclusion from source
inspection alone, before `bubbles.gaps` executed the input that reproduced it.
Static reading and execution agree on the mechanism.

## Root Cause

Recorded in `design.md` § Root Cause.

## Fix

Recorded in `design.md` § Fix and delivered under `scopes.md` Scope 1.
