# Scope 5 Execution Report — Scoring, Ledger Participation And Degraded Modes

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-05-01

Scenario SCN-020-019 — a resolved topic-originated call appears in the ledger
alongside non-topic calls with no exemption from the hit and miss counts.
Command: `node scripts/selftest.mjs`

### TP-05-02

Scenario SCN-020-019 — topic calls enter the same ledger through the same publish
path, with no origin-conditional branch in the scoring path.
Command: `node scripts/selftest.mjs`

### TP-05-03

Scenario SCN-020-020 — the ledger entry records the originating topic identifier
and dossier version as optional additive members with no version bump.
Command: `node scripts/selftest.mjs`

### TP-05-04

Scenario SCN-020-020 — scoring one call with and without its origin members yields
byte-identical outcomes; a weighting keyed on origin is proven to change it.
Command: `node scripts/selftest.mjs`

### TP-05-05

Scenario SCN-020-021 — a correction appends a new entry referencing the original and
the original is byte-identical afterwards.
Command: `node scripts/selftest.mjs`

### TP-05-06

Scenario SCN-020-020 — the per-topic rate is withheld below the committed minimum
resolved sample and asserted at the exact edge from both sides.
Command: `node scripts/selftest.mjs`

### TP-05-07

Scenario SCN-020-022 — the surface states publication is unavailable and the
qualifying candidate is still recorded.
Command: `node scripts/selftest.mjs`

### TP-05-08

Scenario SCN-020-022 — the reader sees the words saying nothing was published, with
the machine slug on a data attribute.
Command: `npx playwright test --project=system-chrome`

### TP-05-09

Scenario SCN-020-023 — a finding refused by every destination is present in the
record with one decision per destination attempted.
Command: `node scripts/selftest.mjs`

### TP-05-10

Scenario SCN-020-023 — each reason carries the refusing gate's own code rather than
a routing-side restatement.
Command: `node scripts/selftest.mjs`

### TP-05-11

Scenario SCN-020-023 — every routable finding has at least one decision; a mutated
pass that omits one is proven to publish a record that looks complete.
Command: `node scripts/selftest.mjs`

### TP-05-12

Scenario SCN-020-023 — the record reaches the brief page artifact as one additive
key, and a record published only into the payload leaves the reader with nothing.
Command: `node scripts/selftest.mjs`

### TP-05-13

Scenario SCN-020-023 — a long refusal list renders in full at desktop and at 320px,
neither truncated nor collapsed away.
Command: `npx playwright test --project=system-chrome`

### TP-05-14

Scenario SCN-020-023 — the refusal surface is a drawer section inside the existing
evidence drawer, not a new tier, view or feed.
Command: `npx playwright test --project=system-chrome`

### TP-05-15

Scenario SCN-020-022 — no gate code, contract slug or dependency-pending marker
appears in visible reader text.
Command: `node scripts/validate-brief-payload.mjs`

### TP-05-16

Scenario SCN-020-019 — no destination threshold, the public scope and the committed
instrument universe are byte-identical.
Command: `node scripts/selftest.mjs`

### TP-05-17

Scenario SCN-020-023 — the repository-wide scan passes with the routing record and
its fixtures committed.
Command: `node scripts/pii-scan.mjs`

### TP-05-18

Scenario SCN-020-023 — the spec-artifact test-path guard reports zero new missing
paths after the browser spec is created.
Command: `node scripts/validate-spec-test-paths.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`,
`node scripts/pii-scan.mjs`, `node scripts/validate-spec-test-paths.mjs`,
`npx playwright test --project=system-chrome`, and the verbatim
`git diff --name-only` output proving no excluded path was modified.

## Completion Statement

Filled at execution.
