# Scope 5 Execution Report — Combined Settlement And Combined Marginal Curve

This file is the evidence surface for scope 5. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Sourcing

Filled at execution. This scope introduces no figure of its own; every value it
handles was sourced in Scopes 01 through 04. This section records that fact
explicitly and holds the verification that `rltaxcombined.js` introduced no
tax-domain constant and cited no authority, so that a reader can tell a scope with
no sourcing obligation from a scope that skipped one.

## Test Evidence

### TP-05-01

Scenario SCN-022-015 — `assertPackYearAgreement` refuses naming both pack ids and
both year arrays, and accepts a pair that both cover the declared year.
Command: `node scripts/selftest.mjs`

### TP-05-02

Scenario SCN-022-013 — the combined total equals the sum of the two jurisdiction
totals for every fixture pair and is the refusal of the refusing side when either
refuses.
Command: `node scripts/selftest.mjs`

### TP-05-03

Scenario SCN-022-013 — `orderIndependence.asserted` is produced by settling both
orders and comparing serialized results, and is not a constant.
Command: `node scripts/selftest.mjs`

### TP-05-04

Scenario SCN-022-013 — a state settlement mutated to subtract the federal total
from its taxable income is proven to break the order-independence assertion and
reconciliation leg `L7`.
Command: `node scripts/selftest.mjs`

### TP-05-05

Scenario SCN-022-013 — a federal settlement mutated to add the state total to its
itemized deduction is proven to break the order-independence assertion.
Command: `node scripts/selftest.mjs`

### TP-05-06

Scenario SCN-022-013 — a sourced-zero state total is included as a real addend
through a contract-version branch rather than a value comparison, and the combined
result is not labelled federal-only.
Command: `node scripts/selftest.mjs`

### TP-05-07

Scenario SCN-022-013 — the coupling record carries an empty `modeled` list as a
required member, names the unmodeled state-tax deduction, and populates the
itemized notice exactly when the deduction mode is itemized.
Command: `node scripts/selftest.mjs`

### TP-05-08

Scenario SCN-022-014 — each point's combined rate equals the sum of its two
component rates, and that sum equals a single finite difference over the combined
total.
Command: `node scripts/selftest.mjs`

### TP-05-09

Scenario SCN-022-014 — the sample set is the union of the grid and both
jurisdictions' crossings, each crossing emits its exact bracketing pair, and no
point is synthesized between a pair.
Command: `node scripts/selftest.mjs`

### TP-05-10

Scenario SCN-022-014 — an implementation that drops the state's crossings is
proven to fail the exact-crossing assertion at a state bracket edge.
Command: `node scripts/selftest.mjs`

### TP-05-11

Scenario SCN-022-014 — every contributing threshold carries a non-empty
jurisdiction and pack id, and an unattributable rate change is refused rather than
rendered.
Command: `node scripts/selftest.mjs`

### TP-05-12

Scenario SCN-022-014 — for the no-tax state the state series is present, flat at
zero across the domain, and attributed to the no-tax authority.
Command: `node scripts/selftest.mjs`

### TP-05-13

Scenario SCN-022-014 — a sweep whose union of crossings would exceed the budget is
refused, and no implementation drops a jurisdiction's crossings to fit.
Command: `node scripts/selftest.mjs`

### TP-05-14

Scenario SCN-022-014 — the curve record carries no scalar average and no summary
rate, and the chart and the text-equivalent table read the identical record.
Command: `node scripts/selftest.mjs`

### TP-05-15

Scenario SCN-022-013 — `rltaxcombined.js` holds no tax-domain numeric constant, no
jurisdiction name and no second definition of either settlement, and calls each
settlement exactly once per sample.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-013

`Regression: SCN-022-013 the combined total is the sum of two independent settlements`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the combined total is the sum of two independent settlements" --reporter=list`

### Scenario SCN-022-014

`Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve attributes every step to a named jurisdiction" --reporter=list`

### Scenario SCN-022-015

`Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-015 a pack year mismatch refuses and shows no combined figure" --reporter=list`

### TP-05-19

`Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-014 the combined curve is reachable by keyboard and has a text equivalent table" --reporter=list`

### TP-05-20

`Regression: SCN-022-013 the request ledger stays empty across the full combined workflow`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the request ledger stays empty across the full combined workflow" --reporter=list`

### TP-05-21

`Regression: SCN-022-013 the tool is absent from every registry and the market brief`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-013 the tool is absent from every registry and the market brief" --reporter=list`

### TP-05-22

The full cumulative Feature 021 and Feature 022 browser suites over the real
route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-05-23

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-05-24

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-05-25

The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML
exists, and `tax-rules/` remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Supersession Ledger

Filled at execution. This scope supersedes nothing, so this section holds the
closing check only: the nine `SUP-022-NN` markers present in the repository, each
mapped to its delivered ledger entry, and the evidence that every pre-existing
assertion outside those nine still passes unchanged.
Command: `node scripts/selftest.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including every engine module, every pack under
`tax-rules/`, `site-exclusions.json`, the registries and Feature 021's spec
directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
break-even year, ranking, recommendation, track record, accuracy claim or error
rate appears in this scope's allowed paths, and that no result is labelled a
complete combined tax.

## Completion Statement

Filled at execution.
