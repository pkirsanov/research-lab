# Scope 2 Execution Report — Tier-A Official Curve Acquisition

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-02-01

Scenario SCN-018-005 — a missing configured maturity column rejects the whole
real family with `BRL-CURVE-MATURITY-MISSING` and exactly zero rows.
Command: `node scripts/selftest.mjs`

### TP-02-02

Scenario SCN-018-006 — the nominal family stays fresh with full provenance while
the real family is unavailable with its code.
Command: `node scripts/selftest.mjs`

### TP-02-03

Scenario SCN-018-023 — `coverageYears` holds two consecutive UTC years and the
merged rows are date-ascending and date-unique.
Command: `node scripts/selftest.mjs`

### TP-02-04

Scenario SCN-018-024 — the carried-forward family is byte-identical to the prior
record and `retrievedAt` is not advanced.
Command: `node scripts/selftest.mjs`

### TP-02-05

Scenario SCN-018-025 — both families failing degrades the bond read alone and the
wider publication still completes.
Command: `node scripts/selftest.mjs`

### TP-02-06

Scenario SCN-018-026 — every request URL derives from the committed
`urlTemplate` values and no Treasury URL literal exists under `scripts/`.
Command: `node scripts/selftest.mjs`

### TP-02-07

Scenario SCN-018-023 — the artifact the acquisition module writes is accepted by
scope 1's gate.
Command: `node scripts/validate-official-curves.mjs`

### TP-02-08

Scenarios SCN-018-005, SCN-018-006 — only a `User-Agent` is sent, no host other
than `home.treasury.gov` is contacted, and the restricted families are never
read, fetched or written.
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

### measured artifact size

Command: `wc -c data/curves/us-treasury/curve.json`

## Findings Raised

Filled at execution.

## Completion Statement

Filled at execution.
