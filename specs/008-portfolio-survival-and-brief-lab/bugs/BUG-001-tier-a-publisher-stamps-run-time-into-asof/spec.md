# BUG-001 Specification

## Problem Statement

`asOf` and `generatedAt` are two different clocks answering two different questions. `asOf`
answers *"which window does this brief analyze?"*. `generatedAt` answers *"when did the run
that produced this file execute?"*. The Tier-A publisher collapsed them into one value, so
a run that started 37 minutes after its window boundary declared the `morning` window and
stamped 11:37 evidence onto it.

Every consumer of that artifact enforces the boundary the artifact declares. Collapsing the
two clocks therefore did not produce a slightly-stale brief; it produced an artifact that
its own contract must refuse. And because the schedule selector was populated inside the
same transaction that composed the evidence window, that refusal emptied the control rather
than explaining itself.

The remedy must correct the publisher without weakening the boundary, and must separate the
schedule from the evidence window so a refusal is always legible.

## Requirements

### FR-B001-001 — `asOf` is the analyzed window's evidence cutoff

The Tier-A publisher MUST set `asOf` to the evidence cutoff of the window the run analyzes,
resolved from the run instant's New York civil date and the window's declared `etTime`. It
MUST NOT set it to the run wall-clock. An 11:37 ET run of the 11:00 ET `morning` window MUST
publish `asOf` 11:00 ET.

### FR-B001-002 — `generatedAt` remains the run wall-clock

`generatedAt` MUST continue to carry the actual instant of the run that produced the file.
The two fields MUST be permitted to differ, because that difference is the audit record of
when a declared window was actually published.

### FR-B001-003 — One cutoff rule, shared by publisher and consumer

The rule that maps `(windows, windowId, instant)` to an evidence cutoff MUST exist once and
be called by both the publisher and the consumer. A second implementation, or a restatement
of the ET times as literals, MUST NOT be introduced: two copies of a boundary rule drift,
and a drifted boundary is exactly the defect being closed.

### FR-B001-004 — The consumer boundary is not weakened

`validateGenericWindow` MUST continue to refuse a publication whose `snapshotRef.asOf` or
`payloadRef.asOf` is later than the cutoff of the window it declares, with
`P008-BRIEF-EVIDENCE` / `generic-evidence-cutoff-conflict`. No relaxation, tolerance
window, or bypass may be added. The boundary is Feature 008's decision-time evidence
guarantee; a brief that declares the 11:00 window must not silently carry 11:37 evidence.

### FR-B001-005 — The schedule survives a refused evidence window

The public window schedule and the composed evidence window are two separate transactions.
The selector MUST be rendered from the public schedule **before** composition is attempted,
so a refused composition can never leave the control with zero options. The reader MUST
still see every declared window after a refusal.

### FR-B001-006 — A refusal names itself on screen

An unavailable evidence window MUST expose its contract code and reason both structurally
(`data-generic-window-error`) and in reader-visible copy. The refusal identity already
existed on `state.genericWindowError`, but reached only the diagnostics object; on screen an
unsatisfiable contract was indistinguishable from "no data yet". The copy MUST state that
nothing was composed, and MUST NOT imply an empty result set.

### FR-B001-007 — The publication clock is read from the publication timestamp

The cockpit's publication clock MUST read `snapshotRef.generatedAt`. Reading it from
`payloadRef.asOf` was the same conflation on the presentation side: it collapsed the
publication clock onto the evidence cutoff and made a past brief unauditable. That defect
was invisible while the two fields were byte-identical, and becomes visible the moment
FR-B001-001 makes them differ.

### FR-B001-008 — The runbook documents the corrected behaviour

`notes/market-brief.md` MUST NOT continue to describe the defect as intended behaviour. Its
definition of the two fields was already correct; the sentence claiming Tier-A sets both to
the run time MUST be replaced with the rule the publisher now implements.

### FR-B001-009 — Lockstep consumers inherit rather than substitute

Any consumer that derives or propagates `asOf` MUST inherit the published window cutoff. It
MUST NOT fall back to a wall-clock when the field is absent: a substituted clock republishes
the defect under a different name. Absence MUST fail loudly instead.

## Scenarios

```gherkin
Scenario: SCN-B001-CUTOFF-STAMPED
  Given the morning window declares an 11:00 ET evidence cutoff
  When a Tier-A run executes at 11:37 ET and publishes that window
  Then the snapshot asOf is the 11:00 ET cutoff
  And the snapshot generatedAt is the 11:37 ET run instant

Scenario: SCN-B001-SHARED-CUTOFF-RULE
  Given the publisher and the consumer both need the cutoff of a declared window
  When each resolves it
  Then both call the same exported helper
  And neither restates the declared ET times as literals

Scenario: SCN-B001-LATE-PUBLICATION-REFUSED
  Given a publication whose asOf is later than the cutoff of the window it declares
  When the brief tab composes its evidence window
  Then composition is refused with P008-BRIEF-EVIDENCE / generic-evidence-cutoff-conflict
  And no lane, action, or identity is invented to fill the gap

Scenario: SCN-B001-SCHEDULE-SURVIVES-REFUSAL
  Given the public schedule has loaded and composition is then refused
  When the reader looks at the evidence-window selector
  Then it still offers every declared window
  And the refusal is named on screen rather than presented as an empty tab

Scenario: SCN-B001-PUBLICATION-CLOCK-DISTINCT
  Given asOf and generatedAt now carry different instants
  When the cockpit renders the publication clock
  Then it reads snapshotRef.generatedAt
  And it does not read payloadRef.asOf

Scenario: SCN-B001-NO-WALLCLOCK-FALLBACK
  Given a snapshot that carries no asOf
  When a lockstep consumer builds a payload from it
  Then it fails loudly
  And it does not substitute the run wall-clock
```
