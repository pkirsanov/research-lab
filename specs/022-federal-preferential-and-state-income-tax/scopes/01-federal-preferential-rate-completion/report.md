# Scope 1 Execution Report — Federal Preferential Rate Completion

This file is the evidence surface for scope 1. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Sourcing

Filled at execution. Holds, for each of `BI-1` and `BI-3`, the authority title,
the URL, the retrieval timestamp recorded in the pack's `SourceRecord/v1`, the
locator, and the verbatim outcome of the retrieval attempt. A failed retrieval is
recorded here with the same detail as a successful one, together with the
`AbsentFigure/v1` it produced. No figure may appear in the pack whose retrieval is
not recorded in this section.

## Test Evidence

### TP-01-01

Scenario SCN-022-001 — `RateTable/v2` validates with an override list, and an
absent-band path, a duplicate component, an empty locator, a `not-retrieved`
source and a newsroom source are each refused `RLTAX-PACK-INVALID` naming the
component.
Command: `node scripts/selftest.mjs`

### TP-01-02

Scenario SCN-022-001 — the unmodified Feature 021 pack validates unchanged through
the new validator and every `RateTable/v1` table is accepted with its default
citation intact.
Command: `node scripts/selftest.mjs`

### TP-01-03

Scenario SCN-022-001 — `effectiveSourceFor` returns the override when present and
the default otherwise, flags which it returned, and refuses rather than defaulting
when the figure carries no default.
Command: `node scripts/selftest.mjs`

### TP-01-04

Scenario SCN-022-002 — preferential tax is exact immediately below, exactly at,
and immediately above every breakpoint the pack carries, for every filing status
whose table resolved.
Command: `node scripts/selftest.mjs`

### TP-01-05

Scenario SCN-022-002 — a qualified dividend and a long-term capital gain of the
same amount produce an identical total, and pooling order does not change the
result.
Command: `node scripts/selftest.mjs`

### TP-01-06

Scenario SCN-022-002 — `totalFederalTax` is a valued record for a household with
preferential income in a resolved status, and remains
`RLTAX-THRESHOLD-UNAVAILABLE` for a status whose table is absent.
Command: `node scripts/selftest.mjs`

### TP-01-07

Scenario SCN-022-001 — a table whose breakpoints are overridden to the rate
authority, whose amounts carry a different tax year, is proven to fail the
tax-year agreement assertion.
Command: `node scripts/selftest.mjs`

### TP-01-08

Scenario SCN-022-003 — an implementation that prices an unsupported preferential
category in a carried band is proven to fail the unsupported-feature enumeration.
Command: `node scripts/selftest.mjs`

### TP-01-09

Scenario SCN-022-003 — every preferential category the pack does not carry is
present in `unsupportedFeatures[]` with a reason, and no code path emits a
complete-federal-tax label.
Command: `node scripts/selftest.mjs`

### TP-01-10

Scenario SCN-022-002 — an unresolved filing status carries an `AbsentFigure/v1`
with a `missingSource` pointer, carries no smuggled numeric member, and ships no
partial table.
Command: `node scripts/selftest.mjs`

### TP-01-11

Scenario SCN-022-002 — repeated computation over identical input produces a
byte-identical result with global `fetch` stubbed to throw for the whole group.
Command: `node scripts/selftest.mjs`

### TP-01-12

Scenario SCN-022-002 — `rltaxrules.js` and `rltax.js` hold no tax-domain numeric
constant, bracket table, jurisdiction name or authority name, and both detectors
are proven to fire on a module that does.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-001

`Regression: SCN-022-001 a preferential table displays a distinct source per component`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-001 a preferential table displays a distinct source per component" --reporter=list`

### Scenario SCN-022-002

`Regression: SCN-022-002 a household with preferential income receives a valued federal total`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-002 a household with preferential income receives a valued federal total" --reporter=list`

### Scenario SCN-022-003

`Regression: SCN-022-003 unsupported preferential categories are named and never folded in`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-003 unsupported preferential categories are named and never folded in" --reporter=list`

### TP-01-16

Feature 021's cumulative browser suite executed unchanged over the real route,
proving no regression.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-021-" --reporter=list`

### TP-01-17

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-01-18

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-01-19

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

### TP-01-20

The supersession marker check: every distinct `SUP-022-NN` marker is a ledger id,
the delivered set equals this scope's seven owned entries, each marked region
names its shape, and no assertion changed without a marker.
Command: `node scripts/selftest.mjs`

### TP-01-21

Each retained branch proven non-vacuous against the absent-table fixture, and the
fabricated-figure cases demonstrated to fail.
Command: `node scripts/selftest.mjs`

## Supersession Ledger

Filled at execution. One block per owned entry — SUP-022-01, -02, -04, -05, -06,
-07, -09 — each holding the superseded clause verbatim, the replacement, the
shape, the intended-RED output proving the replacement failed against the
unchanged implementation, the green output after the behaviour change, and the
adversarial evidence showing each named mutation was seen to fail.

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including `rltax.js`, `rltaxworkspace.js`,
`rltaxstrategy.js`, `site-exclusions.json` and Feature 021's spec directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no result is labelled a complete federal tax.

## Completion Statement

Filled at execution.
