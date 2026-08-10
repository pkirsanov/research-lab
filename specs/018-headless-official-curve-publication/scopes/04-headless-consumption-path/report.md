# Scope 4 Execution Report — Headless Consumption Path

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-04-01

Scenario SCN-018-015 — with no artifact on file the three curve families read
`Unavailable` and both curve gaps are named.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-018-016 — a gate-failing artifact admits exactly zero rows and the
reason names the failure class with no URL fragment.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-018-017 — the ADVERSARIAL 2 shape committed at
`scripts/selftest.mjs:5670-5682`, run unmodified against a real acquired
artifact: `state` `unavailable`, `durationPosture` resolved, `creditRegime`
`Indeterminate`, gap list narrowed to the credit gap alone.
Command: `node scripts/selftest.mjs`

### TP-04-04

Scenario SCN-018-029 — a stale admission admits zero rows, `curveAsOf` is `null`,
and `curveAdmission` carries the verdict, code and last good as-of.
Command: `node scripts/selftest.mjs`

### TP-04-05

Scenario SCN-018-013 — an inverted level with no impulse and no inflation state
yields a posture that is neither `Shorten` nor `Extend`.
Command: `node scripts/selftest.mjs`

### TP-04-06

Scenario SCN-018-014 — the breakeven row count equals the exact common-date
count, with no forward-fill, interpolation or nearest-date match.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-018-030 — the live read branches on the admission verdict and both
branches assert.
Command: `node scripts/selftest.mjs`

### TP-04-08

Scenario SCN-018-031 — the absent-curve adversarial case passes explicit named
absences, and ADVERSARIAL 1, 2 and 4 are byte-identical to their committed form.
Command: `node scripts/selftest.mjs`

### TP-04-09

Scenario SCN-018-030 — an explicit `deps.nominalCurve` still wins over a present
committed artifact.
Command: `node scripts/selftest.mjs`

### TP-04-10

Scenario SCN-018-017 — the payload carrying the changed bond entry and the added
`curveAdmission` metric passes the publication gate.
Command: `node scripts/validate-brief-payload.mjs`

## Build Quality Gate Evidence

### selftest

Command: `node scripts/selftest.mjs`

### publication gate

Command: `node scripts/validate-brief-payload.mjs`

### feature gate

Command: `node scripts/validate-official-curves.mjs`

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

### change boundary

Command: `git diff --name-only`

### first-load budget

The measured first-load total against the committed `briefFirstLoadMaxBytes`,
recorded verbatim from the selftest assertion.

## Findings Raised

Filled at execution.

## Completion Statement

Filled at execution.
