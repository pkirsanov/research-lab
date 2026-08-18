# Scope 4 Execution Report — Bracket-Fill Roth Conversion Comparison

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-04-01

Scenario SCN-021-010 — exactly two policies are returned, both computed from the
identical workspace and the identical resolved pack.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-021-010 — the conversion amount equals the distance to the named
bracket edge, for every supported filing status and every bracket.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-021-010 — mutating the pack's bracket edge changes the conversion
amount, and `rltaxstrategy.js` declares no bracket edge of its own.
Command: `node scripts/selftest.mjs`

### TP-04-04

Scenario SCN-021-010 — the converted case equals an independent full
`computeAnnualFederalTax` call at the converted income, including moved gain
stacking.
Command: `node scripts/selftest.mjs`

### TP-04-05

Scenario SCN-021-010 — a mutated implementation that adds a marginal-rate product
to the baseline tax is proven to fail the gain-stacking assertion.
Command: `node scripts/selftest.mjs`

### TP-04-06

Scenario SCN-021-010 — a household already at or above the selected edge yields an
explicitly labeled zero-amount conversion.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-021-010 — the marginal rate at the fill edge comes from the Scope 03
curve, and an incomplete curve propagates its incompleteness.
Command: `node scripts/selftest.mjs`

### TP-04-08

Scenario SCN-021-011 — the `notModeled` list carries its full required membership,
each entry with a reason and a deferral code.
Command: `node scripts/selftest.mjs`

### TP-04-09

Scenario SCN-021-011 — removing any required `notModeled` entry is proven to fail,
and the list is a structural record member rather than page copy.
Command: `node scripts/selftest.mjs`

### TP-04-10

Scenario SCN-021-012 — enumerating the result record proves there is no
probability, lifetime total, break-even year, survival figure, rank or accuracy
field.
Command: `node scripts/selftest.mjs`

### TP-04-11

Scenario SCN-021-012 — declared outside-funds and declared withheld are
distinguishable, and an undeclared funding source yields an unavailable record
with no assumed default.
Command: `node scripts/selftest.mjs`

### Scenario SCN-021-010

`Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack" --reporter=list`

### Scenario SCN-021-011

`Regression: SCN-021-011 the conversion comparison discloses everything it did not model`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-011 the conversion comparison discloses everything it did not model" --reporter=list`

### Scenario SCN-021-012

`Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-012 the comparison emits a single year federal difference and no probability or ranking" --reporter=list`

### TP-04-15

The cumulative Scope 01 through Scope 04 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-0" --reporter=list`

### TP-04-16

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-04-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical.

## Claim Boundary

Filled at execution. Holds the text scan proving no published error rate, no
self-invalidation statistic, no track record, no accuracy figure and no plan
success probability appears in this scope's allowed paths.

## Completion Statement

Filled at execution.
