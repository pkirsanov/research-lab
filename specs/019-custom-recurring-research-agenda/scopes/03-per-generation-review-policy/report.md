# Scope 3 Execution Report — Per-Generation Review Policy

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-03-01

Scenario SCN-019-008 — a topic inside its cadence is not due and keeps its most
recent dossier as current.
Command: `node scripts/selftest.mjs`

### TP-03-02

Scenario SCN-019-009 — an elapsed cadence makes a topic due and queues it.
Command: `node scripts/selftest.mjs`

### TP-03-03

Scenario SCN-019-009 — the cadence edge is enforced from both sides.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-019-010 — a declared trigger makes a topic due early and the record
carries the trigger's own sentence verbatim.
Command: `node scripts/selftest.mjs`

### TP-03-05

Scenario SCN-019-010 — all four trigger kinds resolve from committed artifacts and
an unknown kind is refused.
Command: `node scripts/selftest.mjs`

### TP-03-06

Scenario SCN-019-011 — the budget bounds the selection and the declared order is
the order applied.
Command: `node scripts/selftest.mjs`

### TP-03-07

Scenario SCN-019-011 — every unplaced due topic publishes a named deferred outcome
with its reason.
Command: `node scripts/selftest.mjs`

### TP-03-08

Scenario SCN-019-011 — the partition assertion covers every declared topic exactly
once, and a mutated planner that omits one is proven to fail it.
Command: `node scripts/selftest.mjs`

### TP-03-09

Scenario SCN-019-008 — the whole plan is computed with `fetch` stubbed to throw and
opens only committed repository paths.
Command: `node scripts/selftest.mjs`

### TP-03-10

Scenario SCN-019-011 — the researched count never exceeds the review budget, including
against a twelve-topic registry.
Command: `node scripts/selftest.mjs`

### TP-03-11

Scenario SCN-019-011 — the same inputs produce a byte-identical plan, including the
tie case separated only by topic identifier.
Command: `node scripts/selftest.mjs`

### TP-03-12

Scenario SCN-019-008 — every active topic appears in exactly one plan array on every
run, including runs where nothing is due.
Command: `node scripts/selftest.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs` and `node scripts/validate-spec-test-paths.mjs`, plus
the verbatim `git diff --name-only` output proving the three committed evidence
sources are byte-identical.

## Completion Statement

Filled at execution.
