# Scope 2 Execution Report — Action-List Routing And Born-Evaluable Emission

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-02-01

Scenario SCN-020-003 — a committed-universe subject with a direction-correct
invalidation level publishes with every contract field and resolves
machine-checkable.
Command: `node scripts/selftest.mjs`

### TP-02-02

Scenario SCN-020-003 — the published action carries its originating topic
identifier.
Command: `node scripts/selftest.mjs`

### TP-02-03

Scenario SCN-020-004 — an out-of-universe swing call is not emitted and the body
builder's own reason is recorded.
Command: `node scripts/selftest.mjs`

### TP-02-04

Scenario SCN-020-005 — a call with no attributable direction-correct invalidation
level is not emitted and the missing level is recorded as the reason.
Command: `node scripts/selftest.mjs`

### TP-02-05

Scenario SCN-020-005 — all three evaluability reasons are carried verbatim.
Command: `node scripts/selftest.mjs`

### TP-02-06

Scenario SCN-020-004 — removing the born-evaluable check is proven to let an
unscoreable call reach the payload.
Command: `node scripts/selftest.mjs`

### TP-02-07

Scenario SCN-020-004 — the publication gate accepts the payload and the rest of
the brief still publishes.
Command: `node scripts/validate-brief-payload.mjs`

### TP-02-08

Scenario SCN-020-006 — the configured maximum is enforced from the committed
figure and the assertion is proven able to fail.
Command: `node scripts/selftest.mjs`

### TP-02-09

Scenario SCN-020-006 — every pre-existing action is present afterwards, unchanged
and in its original order.
Command: `node scripts/selftest.mjs`

### TP-02-10

Scenario SCN-020-006 — a pass that would remove or overwrite an authored action is
refused and stops; removing the invariant is proven to drop one.
Command: `node scripts/selftest.mjs`

### TP-02-11

Scenario SCN-020-006 — every unplaced qualifying finding is recorded with a cap
reason.
Command: `node scripts/selftest.mjs`

### TP-02-12

Scenario SCN-020-007 — a genuine structural finding is outside the evaluability
rule and carries no scored-call framing.
Command: `node scripts/selftest.mjs`

### TP-02-13

Scenario SCN-020-007 — a swing finding relabelled structural is refused against the
immutable dossier value; removing the guard lets it escape the scan.
Command: `node scripts/selftest.mjs`

### TP-02-14

Scenario SCN-020-007 — a structural action carrying a full scored directional level
pair is refused; the two guards fail on different mutations.
Command: `node scripts/selftest.mjs`

### TP-02-15

Scenario SCN-020-006 — the selection and exclusion set are byte-identical across
repeated runs.
Command: `node scripts/selftest.mjs`

### TP-02-16

Scenario SCN-020-003 — no destination threshold, the evaluability rule and the
committed instrument universe are byte-identical.
Command: `node scripts/selftest.mjs`

## Build Quality Evidence

Filled at execution: unfiltered output and exit code for
`node scripts/selftest.mjs`, `node scripts/validate-brief-payload.mjs`,
`node scripts/validate-spec-test-paths.mjs`, and the verbatim
`git diff --name-only` output proving no excluded path was modified.

## Completion Statement

Filled at execution.
