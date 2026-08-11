# Scope 4 Execution Report — Dossier And Honest Outcome States

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-04-01

Scenario SCN-019-012 — a researched topic produces a dossier whose every finding
carries a date, a source and a stated confidence.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-019-012 — a finding missing any of the three is refused and not
published, and a mutated validator without the refusal is proven to publish it.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-019-013 — no new evidence yields the unchanged outcome with zero
invented findings and the prior dossier still current.
Command: `node scripts/selftest.mjs`

### TP-04-04

Scenario SCN-019-013 — the reviewed discriminator separates "we looked and found
nothing" from "we did not look".
Command: `node scripts/selftest.mjs`

### TP-04-05

Scenario SCN-019-014 — evidence older than the declared freshness window yields the
stale outcome with the evidence age named.
Command: `node scripts/selftest.mjs`

### TP-04-06

Scenario SCN-019-014 — the freshness edge is enforced from both sides.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-019-015 — a failed research lane yields the unavailable outcome with a
named reason and zero placeholder findings.
Command: `node scripts/selftest.mjs`

### TP-04-08

Scenario SCN-019-015 — the other lanes' keys are byte-identical under a research
failure, and removing the optional flag is proven to fail the whole attempt.
Command: `node scripts/selftest.mjs`

### TP-04-09

Scenario SCN-019-016 — a new version references the version it supersedes and the
superseded version is still readable.
Command: `node scripts/selftest.mjs`

### TP-04-10

Scenario SCN-019-016 — a write at an existing version path is refused, and a mutated
writer without the guard is proven to overwrite a prior version.
Command: `node scripts/selftest.mjs`

### TP-04-11

Scenario SCN-019-016 — a correction is a new entry referencing the original.
Command: `node scripts/selftest.mjs`

### TP-04-12

Scenario SCN-019-012 — the committed artifact byte budget is asserted at its exact
edge from both sides.
Command: `node scripts/selftest.mjs`

### TP-04-13

Scenario SCN-019-013 — the lane is not spawned when nothing is due, and its input
carries only the selected topics.
Command: `node scripts/selftest.mjs`

### TP-04-14

Scenario SCN-019-012 — the committed web allowlist is byte-identical; no new source
or credential was added.
Command: `node scripts/selftest.mjs`

### TP-04-15

Scenario SCN-019-015 — the publication gate accepts a payload carrying an
unavailable topic and the rest of the brief publishes.
Command: `node scripts/validate-brief-payload.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`,
`node scripts/pii-scan.mjs`, `node scripts/validate-spec-test-paths.mjs`, and the
verbatim `git diff --name-only` output proving no excluded path was modified.

## Completion Statement

Filled at execution.
