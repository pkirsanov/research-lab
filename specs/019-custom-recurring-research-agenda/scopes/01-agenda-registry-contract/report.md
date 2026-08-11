# Scope 1 Execution Report — Agenda Registry Contract And Owning Module

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-01-01

Scenario SCN-019-001 — the committed registry is read by a Node run with `fetch`
stubbed to throw and no browser state, and every declared topic is returned.
Command: `node scripts/selftest.mjs`

### TP-01-02

Scenario SCN-019-002 — an absent registry returns a named absence and synthesises
no default topic set.
Command: `node scripts/selftest.mjs`

### TP-01-03

Scenario SCN-019-002 — an unparseable body and an unknown contract version both
return an unreadable state without throwing into the caller.
Command: `node scripts/selftest.mjs`

### TP-01-04

Scenario SCN-019-003 — the three-topic fixture missing one declared question
yields two accepted topics and one named refusal.
Command: `node scripts/selftest.mjs`

### TP-01-05

Scenario SCN-019-003 — the balancing assertion holds for every fixture, and a
mutated validator that drops a refused topic is proven to fail it.
Command: `node scripts/selftest.mjs`

### TP-01-06

Scenario SCN-019-003 — every refusal code raised is a member of the frozen code
array, and each of the fourteen codes is raised by at least one input.
Command: `node scripts/selftest.mjs`

### TP-01-07

Scenario SCN-019-001 — the topic identifier pattern and the duplicate-id refusal.
Command: `node scripts/selftest.mjs`

### TP-01-08

Scenario SCN-019-001 — cadence, freshness window and review budget are each
refused when absent or non-positive, with no default substituted.
Command: `node scripts/selftest.mjs`

### TP-01-09

Scenario SCN-019-001 — exactly one declaration of each closed vocabulary exists in
the repository.
Command: `node scripts/selftest.mjs`

### TP-01-10

Scenario SCN-019-001 — the committed registry validates with zero refusals,
including the fourth drafted topic.
Command: `node scripts/selftest.mjs`

### TP-01-11

Scenario SCN-019-001 — the spec-artifact test-path guard reports zero new missing
paths.
Command: `node scripts/validate-spec-test-paths.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/validate-spec-test-paths.mjs`,
`node scripts/pii-scan.mjs`, and the verbatim `git diff --name-only` output
proving no excluded path was modified.

## Completion Statement

Filled at execution.
