# Scope 1 Execution Report — Routable Finding Contract And Injected Adjudication

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-01-01

Scenario SCN-020-001 — a complete finding validates and carries every required
member.
Command: `node scripts/selftest.mjs`

### TP-01-02

Scenario SCN-020-001 — a finding missing any required member is refused by name
with no member defaulted.
Command: `node scripts/selftest.mjs`

### TP-01-03

Scenario SCN-020-001 — a mutated validator that supplies a default is proven to
route an incomplete finding.
Command: `node scripts/selftest.mjs`

### TP-01-04

Scenario SCN-020-001 — the projection copies the horizon verbatim from the
immutable dossier finding.
Command: `node scripts/selftest.mjs`

### TP-01-05

Scenario SCN-020-002 — exactly one module defines the finding shape and the
eligibility dispatch.
Command: `node scripts/selftest.mjs`

### TP-01-06

Scenario SCN-020-002 — a destination with no supplied adjudicator is refused and
no eligibility verdict of the module's own is returned.
Command: `node scripts/selftest.mjs`

### TP-01-07

Scenario SCN-020-002 — the module source holds no threshold, cap, score, minimum
or vocabulary belonging to any destination.
Command: `node scripts/selftest.mjs`

### TP-01-08

Scenario SCN-020-001 — the declared dispatch order is the order applied.
Command: `node scripts/selftest.mjs`

### TP-01-09

Scenario SCN-020-001 — an execution verb is refused before any submission, with
the vocabulary anchored to the owning list.
Command: `node scripts/selftest.mjs`

### TP-01-10

Scenario SCN-020-001 — every finding has at least one decision and the record
balances; a mutated recorder is proven to fail it.
Command: `node scripts/selftest.mjs`

### TP-01-11

Scenario SCN-020-001 — the record is byte-identical across repeated runs and the
dispatch runs with `fetch` stubbed to throw.
Command: `node scripts/selftest.mjs`

### TP-01-12

Scenario SCN-020-002 — the spec-artifact test-path guard reports zero new missing
paths.
Command: `node scripts/validate-spec-test-paths.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs` and `node scripts/validate-spec-test-paths.mjs`, plus
the verbatim `git diff --name-only` output proving no excluded path was modified.

## Completion Statement

Filled at execution.
