# Scope 4 Execution Report — California Pack

This file is the evidence surface for scope 4. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Sourcing

Filled at execution. Holds, for `BI-6` and `BI-7`, one entry per figure: the
authority title, the URL, the retrieval timestamp recorded in the
`SourceRecord/v1`, the locator, and the verbatim outcome of the retrieval
attempt. `BI-7` is recorded first, because an unestablished calculation order
refuses the whole pack and makes every figure moot.

Five Franchise Tax Board URLs failed at specification time. Every one of those
figures must be retrieved here or ship absent. A figure recalled, derived from
another figure, or read off a secondary aggregator is a specification violation,
not a shortcut. Each failed retrieval is recorded with the same detail as a
successful one, together with the `AbsentFigure/v1` it produced and the leg that
now refuses.

## Test Evidence

### TP-04-01

Scenario SCN-022-010 — the California pack validates through the unmodified Scope
03 contract, declares no preferential treatment, carries no preferential table,
and its ordered array matches the engine's derived array element for element.
Command: `node scripts/selftest.mjs`

### TP-04-02

Scenario SCN-022-010 — state tax is exact below, at and above every California
bracket edge the pack carries, for every filing status whose schedule resolved.
Command: `node scripts/selftest.mjs`

### TP-04-03

Scenario SCN-022-010 — a long-term gain and an equal amount of ordinary income
produce an identical California figure while the federal figures differ.
Command: `node scripts/selftest.mjs`

### TP-04-04

Scenario SCN-022-011 — the California standard deduction resolves per filing
status from its own authority and is never derived from the federal deduction.
Command: `node scripts/selftest.mjs`

### TP-04-05

Scenario SCN-022-011 — the exemption credit is subtracted from the computed tax
after rate application, with the pre-credit and post-credit figures both
published.
Command: `node scripts/selftest.mjs`

### TP-04-06

Scenario SCN-022-011 — an implementation that subtracts the exemption credit from
income is proven to fail the application-point assertion.
Command: `node scripts/selftest.mjs`

### TP-04-07

Scenario SCN-022-012 — the surcharge is exact below, at and above the threshold,
and all four filing statuses cross at the identical value.
Command: `node scripts/selftest.mjs`

### TP-04-08

Scenario SCN-022-012 — a pack that doubles the surcharge threshold for a joint
return is proven to fail the identical-threshold assertion.
Command: `node scripts/selftest.mjs`

### TP-04-09

Scenario SCN-022-012 — an implementation that applies the exemption credit to the
surcharge leg is proven to fail the `appliesToLegs[]` assertion.
Command: `node scripts/selftest.mjs`

### TP-04-10

Scenario SCN-022-010 — a pack that declares no preferential treatment while
carrying a preferential table is proven to be refused.
Command: `node scripts/selftest.mjs`

### TP-04-11

Scenario SCN-022-012 — every unretrieved California figure is an
`AbsentFigure/v1` with a `missingSource` pointer and no smuggled numeric member,
and its leg refuses while sibling legs still resolve.
Command: `node scripts/selftest.mjs`

### TP-04-12

Scenario SCN-022-012 — a pack whose calculation order cannot be established is
refused in full and produces no partial California figure.
Command: `node scripts/selftest.mjs`

### TP-04-13

Scenario SCN-022-010 — every module file is byte-identical to its Scope 03 state,
proving California required no engine edit.
Command: `node scripts/selftest.mjs` plus a path-scoped status check

### TP-04-14

Scenario SCN-022-010 — `unsupportedFeatures[]` is non-empty and no result is
labelled a complete state tax.
Command: `node scripts/selftest.mjs`

### TP-04-15

Scenario SCN-022-010 — no module holds a California bracket, rate, deduction,
credit, threshold, state name or authority name, and the detector is proven to
fire on a module that does.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-010

`Regression: SCN-022-010 California taxes a long term gain in its ordinary schedule`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-010 California taxes a long term gain in its ordinary schedule" --reporter=list`

### Scenario SCN-022-011

`Regression: SCN-022-011 the exemption credit is applied after the rate and never to income`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-011 the exemption credit is applied after the rate and never to income" --reporter=list`

### Scenario SCN-022-012

`Regression: SCN-022-012 the surcharge threshold is identical for every filing status`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-012 the surcharge threshold is identical for every filing status" --reporter=list`

### TP-04-19

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-04-20

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-04-21

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-04-22

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical — including **every module file**, the federal pack and the
Florida pack. Any module edit that appeared necessary is recorded here as a
finding routed back to Scope 03, not applied in this scope.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no California figure is presented as an estimate.

## Completion Statement

Filled at execution.
