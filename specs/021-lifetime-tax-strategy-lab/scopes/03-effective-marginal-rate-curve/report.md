# Scope 3 Execution Report — Effective Marginal Rate Curve

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Test Evidence

### TP-03-01

Scenario SCN-021-007 — two ordered multi-point curves are returned and no API
offers a scalar effective rate.
Command: `node scripts/selftest.mjs`

### TP-03-02

Scenario SCN-021-007 — each curve rate equals a difference of two
`computeAnnualFederalTax` calls to full internal precision.
Command: `node scripts/selftest.mjs`

### TP-03-03

Scenario SCN-021-007 — every segment whose rate changes names a contributing
threshold and carries its source reference.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-021-007 — a mutated implementation that changes a rate with no
attributable threshold is proven to be refused rather than displayed.
Command: `node scripts/selftest.mjs`

### TP-03-05

Scenario SCN-021-008 — a declared discontinuity emits two adjacent points with
different rates, no interpolated point, and a cliff flag.
Command: `node scripts/selftest.mjs`

### TP-03-06

Scenario SCN-021-008 — a mutated implementation that interpolates across a
declared cliff is proven to fail the step assertion.
Command: `node scripts/selftest.mjs`

### TP-03-07

Scenario SCN-021-009 — the unavailable-contributor list is non-empty and names
every deferred threshold with its code and reason; the curve is labeled
incomplete with the count.
Command: `node scripts/selftest.mjs`

### TP-03-08

Scenario SCN-021-009 — an empty unavailable-contributor list is proven to fail,
and a contributor rendered as a zero contribution is proven to fail.
Command: `node scripts/selftest.mjs`

### TP-03-09

Scenario SCN-021-007 — `rltax.js` still holds no tax-domain numeric constant
after this scope and reaches pack data only through Scope 01's resolver.
Command: `node scripts/selftest.mjs`

### TP-03-10

Scenario SCN-021-007 — a missing or malformed sweep policy yields
`RLTAX-CONFIG-INVALID` and no curve; no sweep constant is hard-coded.
Command: `node scripts/selftest.mjs`

### TP-03-11

Scenario SCN-021-007 — the text-equivalent table and the chart read the identical
curve record.
Command: `node scripts/selftest.mjs`

### Scenario SCN-021-007

`Regression: SCN-021-007 the next dollar is priced as a curve with named thresholds`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-007 the next dollar is priced as a curve with named thresholds" --reporter=list`

### Scenario SCN-021-008

`Regression: SCN-021-008 a cliff renders as a step and is never smoothed`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-008 a cliff renders as a step and is never smoothed" --reporter=list`

### Scenario SCN-021-009

`Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete" --reporter=list`

### TP-03-15

The cumulative Scope 01 through Scope 03 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-00" --reporter=list`

### TP-03-16

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-03-17

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this
scope's allowed paths.

## Completion Statement

Filled at execution.
