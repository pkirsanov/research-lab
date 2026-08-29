# Report — Published Row Provenance Policy

## Summary

**Status: not_started. Nothing has been executed and nothing is claimed.**

This packet was filed on 2026-08-29 by `bubbles.goal` as the `spec-filed` disposition for a
discovered issue in `specs/_bugs/BUG-012-ingestion-writes-adjusted-close-beside-raw-ohlc`. Filing it
is the whole of the work done so far.

## Provenance Of This Filing

BUG-012's report recorded the condition under the heading *"Still open, and recorded as out of scope
rather than done"*. Under Gate G095 that phrasing is not a disposition — an issue an agent observes
must be filed, not narrated — so this packet exists to hold it.

The framing is BUG-012's own and is preserved rather than re-argued: the overwrite is a separate
decision from the defect BUG-012 fixed, and settling it inside a bug packet would have been scope
creep laundered as a fix.

## What Has NOT Been Done

- The exposure has not been measured. No count of in-place value changes exists.
- No owner decision has been made. `design.md` records four option sketches and explicitly does not
  choose among them.
- No mechanism has been implemented, and none should be before Scope 1 completes.

## Completion Statement

**This packet is `not_started` and nothing is complete.**

The only work performed is the filing itself: the six required artifacts exist on disk as of
2026-08-29, which is what discharges the `spec-filed` disposition Gate G095 requires. Filing is not
progress on the question.

No scope has begun, no phase has run, and `certification.certifiedCompletedPhases` is empty. Scope 1
must measure the exposure and record an owner decision before any mechanism is considered.

## Test Evidence

None. No test has been written and no command has been executed against this packet's scopes. This
section will hold executed evidence when Scope 1 runs; recording anything here now would be
fabrication.
