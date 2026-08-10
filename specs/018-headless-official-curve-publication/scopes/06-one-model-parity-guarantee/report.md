# Scope 6 Execution Report — One-Model Parity Guarantee

This file is the evidence surface for scope 6. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-06-01

Scenario SCN-018-011 — one frozen input set yields pairwise-equal `curveState`,
`curveImpulse`, `inflationState` and `durationPosture` across the browser
composition and the real headless consumption path.
Command: `node scripts/selftest.mjs`

### TP-06-02

Scenario SCN-018-012 — the two-calendar-year input yields a non-`Unavailable`
impulse on a January run date while the one-year input yields `Unavailable`.
Command: `node scripts/selftest.mjs`

### TP-06-03

Scenario SCN-018-036 — perturbing one row of the headless input alone makes the
compositions disagree, proving the comparison can fail.
Command: `node scripts/selftest.mjs`

### TP-06-04

Scenario SCN-018-037 — unequal `coverageYears` yields `Cannot be compared` with
the differing-window reason, asserted to be neither `Agree` nor `Differ`.
Command: `node scripts/selftest.mjs`

### TP-06-05

Scenario SCN-018-011 — the parity group writes only under a temporary root and
leaves `data/curves/us-treasury/curve.json` byte-identical.
Command: `node scripts/selftest.mjs`

### TP-06-06

Scenario SCN-018-038 — the parity line renders exactly one of three verdicts with
its compared-field count, and an absent comparison renders `Cannot be compared`
with its reason.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### TP-06-07

Scenarios SCN-018-011, SCN-018-038 — the page still renders when the comparison
cannot run, every existing bond-tool row still passes, and a `Differ` verdict is
not dismissible.
Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

## Build Quality Gate Evidence

### selftest

Command: `node scripts/selftest.mjs`

### browser gate

Command: `npx --no-install playwright test tests/bond-regime-lab.spec.mjs --config=playwright.config.mjs --project=system-chrome`

### feature gate

Command: `node scripts/validate-official-curves.mjs`

### publication gate

Command: `node scripts/validate-brief-payload.mjs`

### spec-test-path guard

Command: `node scripts/validate-spec-test-paths.mjs`

### change boundary

Command: `git diff --name-only`

## Findings Raised

Filled at execution.

## Completion Statement

Filled at execution.
