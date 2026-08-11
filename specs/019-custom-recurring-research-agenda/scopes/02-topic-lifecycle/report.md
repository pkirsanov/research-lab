# Scope 2 Execution Report — Topic Lifecycle And Append-Only Ledger

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-02-01

Scenario SCN-019-004 — a never-reviewed topic is due on the next generation.
Command: `node scripts/selftest.mjs`

### TP-02-02

Scenario SCN-019-004 — adding a topic requires only a committed registry edit.
Command: `node scripts/selftest.mjs`

### TP-02-03

Scenario SCN-019-005 — a paused topic is not researched, publishes paused rather
than unavailable, and keeps its history readable.
Command: `node scripts/selftest.mjs`

### TP-02-04

Scenario SCN-019-006 — a retired topic is not researched and no prior version is
deleted or rewritten.
Command: `node scripts/selftest.mjs`

### TP-02-05

Scenario SCN-019-006 — a retirement appends a new dated lifecycle event and leaves
every pre-existing ledger line byte-identical.
Command: `node scripts/selftest.mjs`

### TP-02-06

Scenario SCN-019-006 — an append that would shorten, reorder or overwrite a line
is refused, and a mutated helper without the guard is proven to destroy a line.
Command: `node scripts/selftest.mjs`

### TP-02-07

Scenario SCN-019-007 — an agent-attempted lifecycle transition is refused.
Command: `node scripts/selftest.mjs`

### TP-02-08

Scenario SCN-019-007 — the three real topics are accepted with their own declared
questions, scope boundaries and cadences.
Command: `node scripts/selftest.mjs`

### TP-02-09

Scenario SCN-019-007 — one invalid topic does not disable the others and the
balance holds.
Command: `node scripts/selftest.mjs`

### TP-02-10

Scenario SCN-019-007 — no committed artifact carries a private field, and a topic
carrying one is refused.
Command: `node scripts/selftest.mjs`

### TP-02-11

Scenario SCN-019-005 — the Pages build still plans successfully with the new
research directory present and not yet published.
Command: `node scripts/build-pages-site.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/build-pages-site.mjs`,
`node scripts/pii-scan.mjs`, `node scripts/validate-spec-test-paths.mjs`, and the
verbatim `git diff --name-only` output proving no excluded path was modified.

## Completion Statement

Filled at execution.
