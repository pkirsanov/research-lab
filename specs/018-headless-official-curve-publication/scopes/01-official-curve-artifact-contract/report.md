# Scope 1 Execution Report — Official Curve Artifact Contract And Validation Gate

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-01-01

Scenario SCN-018-004 — a fresh family carries source id, https source URL on the
declared official host, observation as-of and retrieval time.
Command: `node scripts/selftest.mjs`

### TP-01-02

Scenario SCN-018-001 — a credential-shaped request field is refused with
`secret-shaped-request-field`.
Command: `node scripts/selftest.mjs`

### TP-01-03

Scenarios SCN-018-004, SCN-018-019 — the gate exits 0 on the conformant fixture
and non-zero with one named error on each of seven adversarial fixtures.
Command: `node scripts/validate-official-curves.mjs`

### TP-01-04

Scenario SCN-018-002 — the rights and restriction sweep refuses an oas value, a
financial-conditions value or a `restricted-local-view` string.
Command: `node scripts/selftest.mjs`

### TP-01-05

Scenario SCN-018-003 — the committed bond source policy matches none of
`api_key`, `fredgraph`, `series/BAML`, `series/NFCI`.
Command: `node scripts/selftest.mjs`

### TP-01-06

Scenario SCN-018-018 — a full-artifact sweep finds no restricted value.
Command: `node scripts/selftest.mjs`

### TP-01-07

Scenario SCN-018-019 — the query-binding fixture passes
`validateSourceProvenance` and is refused by the feature gate.
Command: `node scripts/selftest.mjs`

### TP-01-08

Scenario SCN-018-020 — `declaredPolicy` verbatim, `persistence`
`same-origin-artifact`, `rights` `public-official`, and a `browser-cache`
persistence on a committed family refused.
Command: `node scripts/selftest.mjs`

### TP-01-09

Scenario SCN-018-021 — every pre-existing `SOURCE_IDS` key and `SOURCE_POLICIES`
entry unchanged; the only difference is the two added Treasury entries.
Command: `node scripts/selftest.mjs`

### TP-01-10

Scenario SCN-018-022 — the spec-test-path guard reports no new missing path and
the frozen baseline is byte-identical.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-01-11

Scenario SCN-018-021 — every pre-existing provenance group stays green after the
allowlist extension.
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

## Findings Raised

Filled at execution. Each finding is recorded with its id, its evidence and its
routed owner.

## Completion Statement

Filled at execution.
