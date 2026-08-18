# Scope 2 Execution Report — Net Investment Income Tax And Additional Medicare Tax

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Sourcing

Filled at execution. Holds, for `BI-4`, the authority title, the URL, the
retrieval timestamp recorded in each `SourceRecord/v1`, the locator, and the
verbatim outcome of every retrieval attempt — including the attempt to establish
that each threshold set applies to the declared tax year. A `declaredFor` array
may not be populated unless the retrieval that established it is recorded here. A
failed retrieval is recorded with the same detail as a successful one, together
with the `AbsentFigure/v1` it produced.

## Test Evidence

### TP-02-01

Scenario SCN-022-004 — `ThresholdSet/v1` validates, and the four named
malformations including a `declaredFor` omitting the declared year are each
refused by name.
Command: `node scripts/selftest.mjs`

### TP-02-02

Scenario SCN-022-004 — `TaxLeg/v1` validates, and a duplicate `legId`, an
uncarried `figureRef` and an excluded leg whose figure is absent are each refused
by name.
Command: `node scripts/selftest.mjs`

### TP-02-03

Scenario SCN-022-004 — the generalized `CO-8` sum equals the previous two-leg sum
for every Feature 021 fixture against the unmodified Feature 021 pack.
Command: `node scripts/selftest.mjs`

### TP-02-04

Scenario SCN-022-004 — the net investment income tax is exact below, at and above
the threshold for every filing status, and is the rate applied to the lesser of
the base and the excess.
Command: `node scripts/selftest.mjs`

### TP-02-05

Scenario SCN-022-005 — the additional Medicare tax is exact below, at and above
the threshold for every filing status and reads exactly one workspace member.
Command: `node scripts/selftest.mjs`

### TP-02-06

Scenario SCN-022-006 — raising ordinary income alone increases the investment
income surtax where the cap does not bind and leaves the Medicare surtax
byte-identical.
Command: `node scripts/selftest.mjs`

### TP-02-07

Scenario SCN-022-006 — an implementation whose Medicare surtax reads gross income
instead of the wage basis is proven to fail the asymmetry assertion.
Command: `node scripts/selftest.mjs`

### TP-02-08

Scenario SCN-022-004 — implementations that include tax-exempt interest in the
investment-income base, and separately in the modified-adjusted-gross measure, are
each proven to fail reconciliation leg `L6`.
Command: `node scripts/selftest.mjs`

### TP-02-09

Scenario SCN-022-004 — an implementation that treats an undeclared basis as zero
is proven to fail, and a declared zero is proven to compute a real zero.
Command: `node scripts/selftest.mjs`

### TP-02-10

Scenario SCN-022-005 — a refusing leg makes `CO-8` a refusal naming the leg, and
no leg is treated as zero because it is unavailable.
Command: `node scripts/selftest.mjs`

### TP-02-11

Scenario SCN-022-004 — a threshold set whose `declaredFor` omits the declared tax
year is refused rather than applied and carries no numeric member.
Command: `node scripts/selftest.mjs`

### TP-02-12

Scenario SCN-022-004 — the modified-adjusted-gross completeness declaration is
populated and non-empty, and an empty list is proven to fail.
Command: `node scripts/selftest.mjs`

### TP-02-13

Scenario SCN-022-005 — both new basis members are inventoried, cleared and
redacted, each asserted independently.
Command: `node scripts/selftest.mjs`

### TP-02-14

Scenario SCN-022-004 — no module holds a surtax rate, threshold, jurisdiction name
or authority name, and the detector is proven to fire on a module that does.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-004

`Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one" --reporter=list`

### Scenario SCN-022-005

`Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --reporter=list`

### Scenario SCN-022-006

`Regression: SCN-022-006 added ordinary income moves one surtax and not the other`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --reporter=list`

### TP-02-18

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-02-19

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-02-20

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-02-21

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

### TP-02-22

The supersession marker check: every distinct `SUP-022-NN` marker is a ledger id,
the delivered set equals Scope 01's seven plus this scope's two, each marked
region names its shape, and no assertion changed without a marker.
Command: `node scripts/selftest.mjs`

### TP-02-23

The moved-versus-deleted and disjointness mutations, each demonstrated to fail.
Command: `node scripts/selftest.mjs`

## Supersession Ledger

Filled at execution. One block per owned entry — SUP-022-03 and SUP-022-08 — plus
one per amendment — SUP-022-04 and SUP-022-09 — each holding the superseded clause
verbatim, the replacement, the shape, the intended-RED output proving the
replacement failed against the unchanged implementation, the green output after
the behaviour change, and the adversarial evidence.

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including `rltaxstrategy.js`, `site-exclusions.json` and
Feature 021's spec directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no result is labelled a complete federal tax.

## Completion Statement

Filled at execution.
