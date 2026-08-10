# Scope 3 Execution Report — Observed-Cadence Freshness Admission

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-03-01

Scenario SCN-018-007 — a Friday `lastObserved` with a Sunday run date returns
`current` with no staleness reason.
Command: `node scripts/selftest.mjs`

### TP-03-02

Scenario SCN-018-008 — a bond-holiday gap returns `current`, and the recorded
opened-file set does not contain `data/calendars/xnys/calendar.json`.
Command: `node scripts/selftest.mjs`

### TP-03-03

Scenario SCN-018-009 — a run past the derived window returns `stale` with
`BRL-CURVE-FAMILY-STALE` and a populated admission block.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-018-010 — insufficient observed history returns `undetermined`,
asserted to be neither `current` nor `stale`.
Command: `node scripts/selftest.mjs`

### TP-03-05

Scenario SCN-018-027 — the window is enforced at `windowDays` and at
`windowDays + 1`.
Command: `node scripts/selftest.mjs`

### TP-03-06

Scenario SCN-018-028 — a publication stoppage returns `stale`.
Command: `node scripts/selftest.mjs`

### TP-03-07

Scenario SCN-018-027 — repeated evaluations of the same artifact and run date
return the identical verdict, and the rule reads no wall clock.
Command: `node scripts/selftest.mjs`

## Build Quality Gate Evidence

### selftest

Command: `node scripts/selftest.mjs`

### feature gate

Command: `node scripts/validate-official-curves.mjs`

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

### change boundary

Command: `git diff --name-only`

### measured cadence

The `maxObservedGapDays` and resulting `windowDays` measured over the committed
artifact, recorded verbatim.

## Findings Raised

Filled at execution.

## Completion Statement

Filled at execution.
