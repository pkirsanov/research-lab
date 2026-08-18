# Scope 3 Execution Report — State Rule-Pack Contract, Jurisdiction Resolution, And Florida

This file is the evidence surface for scope 3. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

Filled at execution.

## Sourcing

Filled at execution. Holds, for `BI-5`, the authority title, the URL, the
retrieval timestamp recorded in the `SourceRecord/v1`, the locator, and the
verbatim outcome of the retrieval attempt. The constitutional section and the
departmental tax list recorded in `spec.md` establish the ceiling and the
administrative absence and are not sufficient on their own; the step from those to
a stated zero may not be taken by derivation. A failed retrieval is recorded here
with the same detail as a successful one, together with the `AbsentFigure/v1` it
produced and the fixture pack used to prove the sourced-zero path in its place.

## Test Evidence

### TP-03-01

Scenario SCN-022-008 — the vocabulary has exactly one declaration, all twelve
Feature 021 members retain their meaning and raising site, and exactly two members
were added.
Command: `node scripts/selftest.mjs`

### TP-03-02

Scenario SCN-022-008 — the widened jurisdiction grammar accepts the federal and
well-formed state forms and refuses a malformed code, a lowercase code, a
three-letter code and a path-traversal attempt.
Command: `node scripts/selftest.mjs`

### TP-03-03

Scenario SCN-022-007 — the federal pack still derives the federal ordered array
element for element and every Feature 021 fixture value is unchanged.
Command: `node scripts/selftest.mjs`

### TP-03-04

Scenario SCN-022-009 — `SourcedZero/v1` validates only with the literal zero and a
complete citation; a non-zero value, an absent citation and a missing locator are
each refused.
Command: `node scripts/selftest.mjs`

### TP-03-05

Scenario SCN-022-009 — a pack declaring no individual income tax must carry an
authority, an empty leg set and no rate table, and a pack that declares no tax
while carrying a rate table is refused.
Command: `node scripts/selftest.mjs`

### TP-03-06

Scenario SCN-022-008 — `ReliefMechanism/v1` refuses a credit applied before rate
application, a deduction applied after it, and an `appliesToLegs[]` naming an
undeclared leg.
Command: `node scripts/selftest.mjs`

### TP-03-07

Scenario SCN-022-007 — an undeclared residency jurisdiction is
`RLTAX-INPUT-INCOMPLETE` naming the member, and the federal settlement still
resolves in full beside it.
Command: `node scripts/selftest.mjs`

### TP-03-08

Scenario SCN-022-008 — the unshipped-state refusal and the three unsupported
residency patterns carry four distinct reasons and remediations.
Command: `node scripts/selftest.mjs`

### TP-03-09

Scenario SCN-022-008 — an implementation that routes an unsupported residency
pattern through the jurisdiction code is proven to fail the refusal-separation
assertion.
Command: `node scripts/selftest.mjs`

### TP-03-10

Scenario SCN-022-009 — an implementation that returns a bare zero instead of a
`SourcedZero/v1` is proven to fail the contract-version discriminator assertion.
Command: `node scripts/selftest.mjs`

### TP-03-11

Scenario SCN-022-007 — an implementation that treats an undeclared residency as no
state tax is proven to fail.
Command: `node scripts/selftest.mjs`

### TP-03-12

Scenario SCN-022-009 — the Florida pack validates, resolves for the declared year,
produces a sourced-zero total with a rule status and a citation, and carries no
rate table for any filing status.
Command: `node scripts/selftest.mjs`

### TP-03-13

Scenario SCN-022-008 — a pack declaring no preferential treatment prices pooled
preferential income in its ordinary schedule and omits the two preferential stages
from its ordered array.
Command: `node scripts/selftest.mjs`

### TP-03-14

Scenario SCN-022-009 — `computeAnnualStateTax` accepts no federal figure through
any parameter, and reconciliation leg `L7` holds for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-15

Scenario SCN-022-007 — the residency members are inventoried, cleared and
redacted, each asserted independently.
Command: `node scripts/selftest.mjs`

### TP-03-16

Scenario SCN-022-008 — no module holds a state name, postal code, bracket, rate,
edge, threshold or authority name, and the detector is proven to fire on a module
that does.
Command: `node scripts/selftest.mjs`

### Scenario SCN-022-007

`Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 an undeclared residency refuses by name and never shows a zero" --reporter=list`

### Scenario SCN-022-008

`Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-008 an unshipped state and an unsupported residency pattern refuse differently" --reporter=list`

### Scenario SCN-022-009

`Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-009 a no-tax state renders a sourced zero distinct from a refusal" --reporter=list`

### TP-03-20

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-03-21

`Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-007 the request ledger stays empty and no household value reaches a URL" --reporter=list`

### TP-03-22

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-03-23

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-03-24

The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/`
remains outside the public directories.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Change Boundary

Filled at execution. Holds the path-scoped `git status` proving every excluded
path is byte-identical, including `tax-rules/federal/**`, `rltaxstrategy.js`,
`site-exclusions.json` and Feature 021's spec directory.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
recommendation, track record, accuracy claim or error rate appears in this scope's
allowed paths, and that no state figure is presented as an estimate or an average.

## Completion Statement

Filled at execution.
