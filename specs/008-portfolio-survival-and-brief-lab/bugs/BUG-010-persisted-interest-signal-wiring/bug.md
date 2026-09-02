# BUG-010: Persisted Interest-Signal Wiring Is Missing

**Status:** Confirmed by current source and governing-contract inspection
**Severity:** High
**Reported:** 2026-09-02
**Source finding:** `TEST-B005-T2-B-PERSISTED-SIGNAL-WIRING`
**Feature:** `specs/008-portfolio-survival-and-brief-lab`
**Registered page:** `portfolio-survival-allocation-lab.html`

## Summary

The registered Portfolio Survival page persists accepted behavior events but
does not synchronize the workspace's derived `interestSignals` cache.

The accepted completion path calls `buildBehaviorCandidate` and commits that
candidate directly. `buildBehaviorCandidate` appends `behaviorEvents` but does
not derive or replace `interestSignals`. The only replacement writer is
`rlportfolio.buildInterestSignalCandidate`, and the page never calls it.

The page still derives transient brief signals through
`RLPORTFOLIOBRIEF.deriveInterestSignals`. Brief ranking can therefore work while
the persisted cache remains empty. The Black-Litterman editor reads the
persisted cache, so its exclusion audit does not observe the same behavior
evidence that drives transient relevance.

## Severity

High. A live registered page violates the Feature 008 persisted workspace and
behavior-accounting contract. The transient brief remains usable, so this is
not a page crash or total feature outage.

## Reproduction

This bug-owner phase used source and contract inspection. It did not execute a
product test or claim a browser runtime result.

1. Read the page's accepted completion handler.
2. Observe that it commits `buildBehaviorCandidate(...).workspace` directly.
3. Search the page for `buildInterestSignalCandidate` and the portfolio-side
   `deriveInterestSignals` export.
4. Observe that neither symbol has a page caller.
5. Observe that the same page calls the brief-side transient derivation.
6. Observe that the Black-Litterman editor reads
   `state.opened.workspace.interestSignals`.
7. Read the existing E2E rows and confirm they assert persisted
   `behaviorEvents`, but not a non-empty persisted signal cache.

Evidence: [report.md#source-call-graph-evidence](report.md#source-call-graph-evidence).

## Expected Behavior

An accepted eligible completion must leave one authoritative workspace
generation whose `behaviorEvents` and current derived `interestSignals` agree.
Reloading the page must retain that current cache.

When evidence ages outside the declared window, recomputation must replace the
cache and remove stale-only signals without throwing. Clearing behavior must
empty both events and derived interests. Settings and passive activity must
create neither.

The Black-Litterman audit must observe the real persisted signal count while
continuing to derive zero views, return adjustments, and confidence from
behavior.

## Actual Behavior

The page commits the behavior-event candidate without invoking the persisted
signal writer. Page-created workspaces therefore have no production path that
populates `workspace.interestSignals`.

The brief computes a separate transient signal representation. The
Black-Litterman audit reads the unchanged persisted array and may report that no
behavior signal was present even when eligible behavior drives brief ranking.

## Root Cause

Feature 008 has two valid derivation contracts with different lifetimes.
`RLPORTFOLIOBRIEF.deriveInterestSignals` creates transient ranking input.
`rlportfolio.buildInterestSignalCandidate` replaces the durable workspace
cache. The registered completion transaction wires only the first lifecycle's
source data and never invokes the durable-cache writer.

Existing functional tests call the durable writer directly. They prove the
module can persist derived signals, but P18 states that tests are not production
consumers. Existing browser coverage persists events and recomputes transient
ranking without asserting the durable cache.

## Impact

- The workspace privacy inventory cannot demonstrate persisted derived
  interests created by normal page activity.
- Reload preserves behavior events and reconstructs brief ranking, but it does
  not prove or use a synchronized durable signal cache.
- Black-Litterman exclusion accounting receives an empty or previously seeded
  persisted array rather than the current derived cache.
- The BUG-005 stale-domain crash fix remains valid and contract-only.

## Proposed Resolution Boundary

Synchronize the current persisted signal cache whenever an eligible behavior
change is accepted. Preserve one atomic workspace generation. Surface a
persistence failure without claiming that the event was recorded.

Replace the cache from current events and policy instead of appending. Remove
aged-out signals and preserve behavior-clear semantics. Keep passive activity
excluded. Keep behavior unable to author Black-Litterman views, expected
returns, or confidence.

The analyst, UX, design, and plan owners must adopt or amend this boundary in
that order before implementation.

## Change Boundary For This Phase

This bug-owner phase changes packet artifacts only. It changes no product
source, persistent test, parent Feature 008 artifact, certification field,
human acceptance record, commit, deployment, or remote state.

## Related

- Parent feature: `specs/008-portfolio-survival-and-brief-lab`
- Source contract: `rlportfolio.js#buildInterestSignalCandidate`
- Registered consumer: `portfolio-survival-allocation-lab.html`
- Black-Litterman accounting: `rlportfolioanalytics.js#blackLittermanViews`
- Originating correction: `../BUG-005-stale-domain-interest-signal-crash/`
- Evidence: [report.md](report.md)
