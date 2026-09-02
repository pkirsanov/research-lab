# BUG-010 Expected-Behavior Intake

**Artifact owner:** `bubbles.analyst`
**Current authoring state:** `route_required`
**Authorship boundary:** This file records bug-owner evidence inputs. It does
not claim that the analyst phase has executed.

## Problem Statement

Feature 008 declares `interestSignals` as a derived workspace cache that is
reproducible from behavior events and policy. The registered page persists
eligible behavior events but never invokes the cache writer. Its transient
brief projection and durable workspace can therefore disagree about whether
behavior-derived relevance exists.

## Verified Parent Contract

The parent Feature 008 artifacts establish these constraints:

1. `InterestSignal` is local derived research based only on eligible
   `BehaviorEvent` rows.
2. `workspace.interestSignals` is reproducible from events and policy.
3. Clearing behavior removes events and derived interests immediately.
4. Settings and passive activity cannot create or strengthen an interest.
5. Behavior may affect relevance only.
6. Behavior cannot become a Black-Litterman view, expected return, confidence,
   constraint, or trade authority.
7. A persistence failure must remain visible and cannot imply a durable write.

## Expected Behavior Inputs

The analyst must preserve these bug-owner findings:

- Two eligible page completions produce a non-empty persisted signal cache.
- A storage reopen retains the current cache and supporting evidence.
- Recomputing after all evidence ages out removes the stale-only signal without
  throwing.
- Behavior clear empties both events and derived interests on reread.
- Settings, mode changes, scrolling, dwell, and other passive activity create
  no event and no signal.
- Black-Litterman accounting observes the real signal count while reporting
  zero behavior-derived views, return adjustments, and confidence.
- A failed combined persistence transaction preserves the prior authoritative
  generation and reports that the completion was not recorded.

## Outcome Boundary For Analyst Review

**Intent:** Keep the durable workspace cache synchronized with accepted local
behavior while preserving inference containment and atomic storage semantics.

**Success signal:** A real page workflow persists current signals, survives a
reload, removes expired signals, clears them with behavior history, and exposes
their count to Black-Litterman exclusion accounting without creating a view.

**Failure condition:** The defect remains when the page persists only events,
updates signals in a second non-atomic generation, leaves expired signals in
the cache, hides a persistence failure, or lets behavior affect allocation
inputs.

The analyst owns the final Outcome Contract, functional requirements, and
acceptance criteria. No such ownership claim is made here.

## UX Intake

The UX phase must define visible behavior for successful recording, persistence
failure, reload, stale-signal removal, behavior clear, privacy inventory, and
Black-Litterman exclusion accounting. Existing completion confirmation and
error surfaces remain the starting point.

## Product Principle Alignment Intake

### Admission Test

The repair improves decision quality by making relevance provenance and
exclusion accounting agree with durable local state.

### P18 - Wired Or Not Shipped

`buildInterestSignalCandidate` currently has test consumers but no production
page consumer. The repair must connect the durable contract to the registered
page or remove the persisted-cache claim through an owner-approved contract
change.

### P21 - Additive Contracts, Append-Only History

The repair must preserve immutable workspace generations and atomic pointer
swap semantics. It must not rewrite prior generations in place.

### P23 - A Guard That Cannot Fail Is Not A Guard

The regression must prove the current missing-writer behavior before the fix.
It must then fail if the page again persists events without current signals.

## Human Acceptance

Human acceptance has not occurred. Automation must not populate the acceptance
record or check the human checklist.

## Non-Goals For This Bug-Owner Phase

- Selecting the final design transaction.
- Authoring the final scope plan or Definition of Done.
- Editing product source or tests.
- Claiming browser execution, delivery, certification, or acceptance.
