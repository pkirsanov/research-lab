# Scopes: BUG-023 — The Cockpit Disclosure Test Reads A Mid-Load Lull As Settled

**Scope layout:** single-file.

## Sequencing Note

Scope 1 is blocked until the owner answers the open question in `design.md`: whether the cockpit
exposes — or may be given — a terminal "live layer settled" state. That answer selects between
directions A and B, and Scope 2's assertions depend on which was chosen.

## Scope 1: Establish The Baseline From Outstanding Work

**Status:** not started

### Problem This Scope Resolves

The baseline is taken when the request stream falls quiet for 500 ms, which happens mid-load.
Requests belonging to the page's own load are then attributed to a block expansion and reported
as an off-origin violation.

### Gherkin Scenarios

Implements `SCN-023-01` and `SCN-023-04` from `spec.md`.

### Implementation Plan

1. Record the owner's answer to the `design.md` open question.
2. Replace the silence poll with the selected signal — a page-asserted terminal state, or a
   neutralised live layer — so the baseline reflects outstanding work rather than elapsed quiet.
3. Make the precondition explicit: if settle cannot be established within a declared bound, fail
   naming that condition. Do not fall through into the disclosure assertions.
4. Keep the three outcomes distinguishable in the failure text: off-origin, credentialed,
   precondition unmet.

### Test Plan

| Id | Category | Asserts |
| --- | --- | --- |
| SCN-023-01 | browser | A load whose stream contains a lull wider than the old quiet window still yields a baseline taken after the live layer is done |
| SCN-023-04 | browser | An unestablishable precondition fails naming itself, and does not report an off-origin violation |

### Definition of Done

- [ ] The owner's answer to the `design.md` open question is recorded in this packet.
- [ ] The baseline no longer derives from elapsed silence.
- [ ] An unestablished precondition fails as itself, with its own message.
- [ ] The probe in `report.md` re-run against the fixed test shows the mid-load lull no longer
      changes the verdict.
- [ ] No retry, sleep-lengthening, or quiet-window widening was introduced.

## Scope 2: Prove The Invariant Still Bites

**Status:** not started

### Problem This Scope Resolves

A fix that stabilises the test by weakening it would be worse than the flake. The disclosure
invariant must still fail on a genuine violation.

### Gherkin Scenarios

Implements `SCN-023-02` and `SCN-023-03` from `spec.md`.

### Implementation Plan

1. Assert the invariant holds on the real page after a settled load.
2. Add an adversarial case: a block wired to issue an off-origin request on expansion MUST fail
   the test. Without it, a fix that stops measuring anything would pass.
3. Assert a deferred same-origin artifact fetch still passes, so the disclosure-first design is
   not punished.

### Test Plan

| Id | Category | Asserts |
| --- | --- | --- |
| SCN-023-02 | browser | No off-origin and no credentialed request follows any expansion |
| SCN-023-03 | browser | A deferred `file://` artifact fetch on expansion still passes |
| SCN-023-02-ADV | browser | A block that issues an off-origin request on expansion FAILS the test |

### Definition of Done

- [ ] The adversarial case fails before the guard is applied and passes after, proving the guard
      can still discriminate.
- [ ] A deferred same-origin fetch on expansion still passes.
- [ ] The full browser suite is green with the fix in place.

## Cross-Scope Definition of Done

- [ ] `bug.md` moves from Confirmed to Fixed and then to Verified, the latter by a party that did
      not write the fix.
- [ ] `uservalidation.md` carries a completed Human Acceptance Record.
- [ ] The pages gate is green, and the run that proves it is cited in `report.md`.
