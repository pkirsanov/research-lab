# Scope 3 Execution Report — Attention-Tier Routing And The Exclusion Ledger

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-03-01

Scenario SCN-020-008 — a public subject with a resolvable deep link and a research
verb publishes through the existing composer.
Command: `node scripts/selftest.mjs`

### TP-03-02

Scenario SCN-020-008 — every published topic item passed through the existing
composer and no parallel composition path exists.
Command: `node scripts/selftest.mjs`

### TP-03-03

Scenario SCN-020-009 — a subject outside the public scope is refused with the
composer's own privacy code and recorded in its own channel.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-020-009 — a privacy refusal does not republish the subject it
withheld.
Command: `node scripts/selftest.mjs`

### TP-03-05

Scenario SCN-020-010 — an unresolvable deep link is refused with the composer's own
code and recorded with its field and reason.
Command: `node scripts/selftest.mjs`

### TP-03-06

Scenario SCN-020-010 — the deep link is composer-resolved and never authored by
routing.
Command: `node scripts/selftest.mjs`

### TP-03-07

Scenario SCN-020-011 — a verb outside the research-verb vocabulary is refused with
the composer's own code.
Command: `node scripts/selftest.mjs`

### TP-03-08

Scenario SCN-020-012 — a subject already published as an action is refused with the
overlap code.
Command: `node scripts/selftest.mjs`

### TP-03-09

Scenario SCN-020-012 — renaming or re-keying a subject to evade the overlap check
is proven not to publish, and no second duplicate check exists.
Command: `node scripts/selftest.mjs`

### TP-03-10

Scenario SCN-020-013 — built plus excluded equals declared, with exactly one
balancing assertion for the tier.
Command: `node scripts/selftest.mjs`

### TP-03-11

Scenario SCN-020-013 — an empty tier carries the composer's own empty statement and
is not padded.
Command: `node scripts/selftest.mjs`

### TP-03-12

Scenario SCN-020-013 — an action-side reason in the attention exclusions channel is
proven to fail the publish gate.
Command: `node scripts/validate-brief-payload.mjs`

### TP-03-13

Scenario SCN-020-013 — the routing record points at the exclusion index and copies
nothing; no routing code appears in the array.
Command: `node scripts/selftest.mjs`

### TP-03-14

Scenario SCN-020-008 — the attention contract module and the public scope are
byte-identical.
Command: `node scripts/selftest.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`,
`node scripts/validate-spec-test-paths.mjs`, and the verbatim
`git diff --name-only` output proving no excluded path was modified.

Also recorded here at execution: whether an owning registered research tool read
was available in the generation under test, and therefore whether SCN-020-008
was proven against a resolvable deep link or the deep-link refusal path was the
observed outcome for every submission.

## Completion Statement

Filled at execution.
