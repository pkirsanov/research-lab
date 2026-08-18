# Scope 3 Execution Report — Long-Term Rental

This file is the evidence surface for scope 3. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

Implemented. `rltaxrental.js` ships with `computeRentalSettlement`,
`computeCostRecovery`, `applyAtRiskLimit`, `applyPassiveActivityLimit` and
`specialAllowanceFor`; `rltaxrules.js` gains `RentalActivity/v1`,
`CostRecovery/v1` and `LossLimitation/v1`; `rltax.js` gains stage `CO-17` and the
`rental-net` leg; `rltaxworkspace.js` gains nine rental declarations with their
privacy surface; the route gains the `power-rental` section and one Simple field;
`tests/lifetime-tax-rental.spec.mjs` carries the four browser rows.

The leg identifier is `rental-net`. The plan calls it `L9`; the shipped engine
uses semantic leg identifiers throughout, and Scope 01 shipped `L8` as
`property-tax` for the same reason. The mapping is recorded here rather than left
to be inferred.

One supersession was admitted in flight under ASC-8 and booked on all four
surfaces in the same change: `SUP-023-12`. See
[the supersession section](#supersession-ledger).

## Sourcing

Both publications served a **2025** edition in this session. Publication 527's
title block reads `Publication 527 (2025), Residential Rental Property ... For
use in preparing 2025 Returns`, and Publication 925's reads `Publication 925
(2025), Passive Activity and At-Risk Rules ... For use in preparing 2025
Returns`. This pack declares 2026 effective. That is the same condition under
which Feature 023 Scope 02 refused both Publication 936 mortgage acquisition-debt
tiers, and the same test was applied here — per component kind, not per document.

The line drawn is between a figure the publication states **for a tax year** and
a **structural parameter of a method** the publication states without a year
qualifier. Publication 527 draws that line itself, which is what makes the
distinction checkable rather than convenient: its What's New section introduces
its year-scoped figures as `For 2025, the standard mileage rate` and `For tax
years beginning in 2025, the maximum section 179 expense deduction`, while
Table 2-1 and the Conventions section state the recovery period and the
convention with no year qualifier anywhere. That contrast is recorded verbatim in
the `yearInvarianceBasis` of `irs-p527-2025` and is the same shape of basis
Feature 022 used to carry the twenty-percent preferential rate from Topic no. 409.

Publication 925 offers no such in-document contrast for its dollar figures, so
every one of them ships absent.

### Retrieved — real figures, carried

| Figure | Value | Source | Locator | `retrievedAt` |
| --- | --- | --- | --- | --- |
| Residential rental GDS recovery period | `27.5` years | Publication 527 (2025), `https://www.irs.gov/publications/p527` | chapter 2, Table 2-1, row *Residential rental property (buildings or structures) and structural components*, General Depreciation System column | `2026-08-17T21:40:00.000Z` |
| Applicable convention | `mid-month` | Publication 527 (2025), same URL | chapter 2, Conventions, *Mid-month convention* | `2026-08-17T21:40:00.000Z` |
| Depreciation method | `straight-line` | Publication 527 (2025), same URL | chapter 2, Figuring Your Depreciation Deduction, *Residential rental property* | `2026-08-17T21:40:00.000Z` |
| At-risk limit applied first, order `1` | `appliedOrder: 1` | Publication 925 (2025), `https://www.irs.gov/publications/p925` | Introduction, and the At-Risk Limits caution | `2026-08-17T21:40:00.000Z` |
| Passive-activity limit applied second, order `2` | `appliedOrder: 2` | Publication 925 (2025), same URL | Passive Activity Loss, and Rental Activities | `2026-08-17T21:40:00.000Z` |
| Active participation is the allowance condition | `true` | Publication 925 (2025), same URL | Rental Activities, Special allowance | `2026-08-17T21:40:00.000Z` |

The ordering rule rests on three unqualified statements of one structural rule in
two publications: Publication 925's Introduction (`you must apply the at-risk
rules before the passive activity rules`), its At-Risk Limits caution, and
Publication 527 chapter 3 Limits on Rental Losses (`You must consider these rules
in the order shown below`, at-risk first).

**Digit-by-digit verification of the cost-recovery arithmetic.** The convention
was verified against Publication 527's own worked examples rather than against
the implementer's reading of it. All four agree, and TP-03-03 asserts all four:

| Publication 527 example | Publication states | Engine computes |
| --- | --- | --- |
| February, Year 1, Table 2-2d | `3.182%` | `3.1818%` |
| Year 6 full year, Table 2-2d | `3.636%` | `3.6364%` |
| May, Year 1, Table 2-2d | `2.273%` | `2.2727%` |
| August conversion, `$147,000` basis | `$2,005` | `$2,004.55` |

### Absent — `AbsentFigure/v1`, and the leg refuses

| Figure | Code | `missingSource` |
| --- | --- | --- |
| Special allowance maximum, and its married-filing-separately amount | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, `https://www.irs.gov/publications/p925`, Rental Activities, Special allowance, *Maximum special allowance* |
| Both edges of the modified-adjusted-gross-income phase-out range | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, same URL, Rental Activities, *Phaseout rule* |
| The rate at which the allowance is reduced | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, same URL, Rental Activities, *Phaseout rule* |

**Consequence, stated plainly.** Against the shipped 2026 pack a rental producing
a **loss** refuses at
`loss-limit:passive-activity:specialAllowance:maximumAmounts`, because the
passive-activity limit cannot be applied without the allowance and applying it
without one would disallow a loss the allowance may have permitted. A rental
producing **net income** settles normally, because no loss limit engages. The
limit ladder is therefore exercised against fixture packs carrying the
implementer's own figures, which are reachable only from the selftest and the
browser spec and are labelled as fixtures at every site.

The reduction rate is shipped absent *with* the range rather than carried alone,
because a reduction rate without the range it is applied across establishes
nothing.

### Pack change was additive only

`node scripts/selftest.mjs` TP-03-02 and TP-02-12 both assert it. The pack member
set partitions exactly into the recorded pre-feature list and this feature's five
declared additions; the derived reconstruction reproduces the pre-feature content
digest `sha256:e102f09087d48a9bb8482aaf3a396a49e78e0e74811f59fa089eb77df3b970bd`
byte for byte; and a mutated pre-existing figure is proven to break it. The pack
digest moved to
`sha256:87b28e85b99b1f54ae562e95e3693c6b9efbd336d8a27c4d41173926fb2a72fc` and
`lifetime-tax-strategy.config.json` was updated in the same change, which TP-01-01
and TP-03-02 both check.

## Gate Results

Run at the end of the scope, verbatim exit codes.

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 2674 passed, 0 failed
================================================
GATE1_EXIT=0

$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  29 passed (10.0s)
exit 0

$ node scripts/build-pages-site.mjs --dry-run
GATE3_EXIT=0

$ bash .github/bubbles/scripts/artifact-lint.sh specs/023-property-tax-and-rental-income
GATE4_EXIT=0

$ node scripts/validate-spec-test-paths.mjs
GATE5_EXIT=0
```

The pre-existing selftest pass count was 2653 and did not fall; this scope's
appended group and the SUP-023-12 replacement take it to 2674. The pre-existing
browser count was 25 and did not fall; this scope's four rows take it to 29.

## Supersession Ledger

`SUP-023-12`, admitted in flight under ASC-8 during this scope.

**Superseded clause, verbatim:**

```js
const restored02 = clonePack02();
delete restored02.deductionCaps;
delete restored02.mortgageDebtLimits;
delete restored02.deductionChoicePolicy;
```

**Cause (ASC-1).** FR-023-016, FR-023-017 and FR-023-018 require the recovery
period, the convention and the loss-limit ordering to live in the federal pack.
This scope therefore inserts two source records and two top-level members. The
reconstruction above removes only Scope 02's three members, so the pre-feature
digest no longer reproduced and TP-02-12 failed.

**Intended-RED, observed:**

```
✗ FAIL: TP-02-12: the cap cites exactly one retrieved record with a locator, its
filing-status variation names married filing separately as the only different
amount, the reduction rate it could not establish ships absent, and stripping
this scope's pack additions reproduces the pre-feature content digest byte for byte
Research-Lab self-test: 2652 passed, 1 failed
```

**Shape:** `derive`. The reconstruction now derives from the recorded pre-feature
member list, and the pack's member set must partition exactly into that list and
this feature's declared additions.

**GREEN, same command:** `Research-Lab self-test: 2653 passed, 0 failed`.

**Adversarial cases, each executed and each seen to fail before the replacement
was seen to pass:** a mutated pre-existing figure (`standardDeductions.single.amount`
incremented by one) produces a different reconstructed digest; an undeclared
top-level member (`undeclaredExtraMember`) is caught by the partition and named.

**Booked on all four surfaces in the same change:** the ledger row in
[`spec.md`](../../spec.md#supersession-ledger), its opening count paragraph
(nine predicted plus three in-flight, twelve total), the ownership table in
[`_index.md`](../_index.md#ownership) (`| 03 | SUP-023-12 | 1 |`, and *Five plus
five plus one plus one is twelve*), and the per-file marker distribution in
[`design.md`](../../design.md#per-file-marker-distribution). TP-03-26 asserts all
four agree.

## Test Evidence

### TP-03-01

The cost-recovery contract refuses a missing recovery period, a missing convention,
and either carrying no citation or no locator.
Command: `node scripts/selftest.mjs`

### TP-03-02

Every pre-existing federal pack figure is byte-identical after the additive
insertion of the three retrieved records.
Command: `node scripts/selftest.mjs`

### TP-03-03

Depreciation is recomputed from the fixture pack's deliberately non-standard period
and convention for a first partial year, a full year and a final partial year.
Command: `node scripts/selftest.mjs`

### TP-03-04

An implementation using a recalled recovery period or a default convention is proven
to fail against the non-standard fixture.
Command: `node scripts/selftest.mjs`

### TP-03-05

An absent recovery period or convention refuses the depreciation and the rental leg,
and no settlement is produced without cost recovery.
Command: `node scripts/selftest.mjs`

### TP-03-06

The applied limits carry strictly increasing order with the at-risk limit first,
derived from the sourced ordering rule.
Command: `node scripts/selftest.mjs`

### TP-03-07

An implementation applying the passive limit first is proven to fail the ordering
assertion and to produce a different allowed amount.
Command: `node scripts/selftest.mjs`

### TP-03-08

The special allowance is exact below, exactly at and above each edge of the sourced
phase-out range.
Command: `node scripts/selftest.mjs`

### TP-03-09

An absent special allowance or phase-out range refuses the leg rather than applying
the passive limit without it.
Command: `node scripts/selftest.mjs`

### TP-03-10

Every applied limit publishes its before, allowed and disallowed amounts, and the
three reconcile exactly for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-11

An implementation zeroing a disallowed amount is proven to fail the reconciliation
assertion.
Command: `node scripts/selftest.mjs`

### TP-03-12

The opening carryforward is a declaration carrying no citation, and one carrying a
source reference is refused.
Command: `node scripts/selftest.mjs`

### TP-03-13

Exactly one closing figure is published for the declared year, and no member, page
node or export field names another year.
Command: `node scripts/selftest.mjs`

### TP-03-14

An implementation projecting the carryforward into a following year is proven to
fail the single-year assertion.
Command: `node scripts/selftest.mjs`

### TP-03-15

The published adjusted basis equals the declared basis less the published
accumulated recovery for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-16

Leg `L9` appears in all four surfaces in both directions on the all-non-zero
fixture, and `L8` still does.
Command: `node scripts/selftest.mjs`

### TP-03-17

Removing the rental leg from each of the four surfaces in turn fails the
leg-visibility identity with the missing leg named.
Command: `node scripts/selftest.mjs`

### TP-03-18

The refusal vocabulary member count equals its pre-feature value.
Command: `node scripts/selftest.mjs`

### TP-03-19

No module holds a recovery period, convention, allowance amount, phase-out edge or
authority name, and the detector fires on a module that does.
Command: `node scripts/selftest.mjs`

### TP-03-20

The rental declarations are inventoried, cleared, redacted, and absent from every
URL, request, referrer and console message.
Command: `node scripts/selftest.mjs`

### Scenario SCN-023-007

A long-term rental settles after sourced depreciation and refuses without it.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it" --reporter=list`

### Scenario SCN-023-008

The limit ladder is applied in order and every disallowed amount is published.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-008 the limit ladder is applied in order and every disallowed amount is published" --reporter=list`

### Scenario SCN-023-009

The suspended loss closes for the declared year and no future year appears.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-009 the suspended loss closes for the declared year and no future year appears" --reporter=list`

### TP-03-24

The rental leg reaches the headline, the comparison, the curve and the export in the
browser.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 the rental leg reaches the headline, the comparison, the curve and the export" --reporter=list`

### TP-03-25

The cumulative browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-03-26

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-03-27

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-03-28

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Supersession Ledger

Filled at execution. This scope supersedes nothing, so this section holds the
closing check only: the `SUP-023-NN` markers present in the repository mapped to the
entries the completed scopes own, and the evidence that every pre-existing assertion
outside them still passes unchanged. Where ASC-8 admitted an entry in flight, the
admission and its ledger row are recorded here.
Command: `node scripts/selftest.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped status check proving every excluded path
is byte-identical, and that the only federal pack change is the additive insertion
of the three retrieved records.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
future year, break-even year, ranking, recommendation, track record or error rate
appears in this scope's allowed paths.

## Completion Statement

Filled at execution.
