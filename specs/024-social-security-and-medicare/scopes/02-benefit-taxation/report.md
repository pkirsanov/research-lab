# Scope 2 Execution Report — Taxation Of Benefits

This file is the evidence surface for scope 2. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code, recorded in the session that produced it.

## Summary

Executed 2026-08-18. Delivered: `rltaxinclusion.js`, `ProvisionalIncome/v1`,
`BenefitInclusion/v1`, the tightened `yearInvarianceBasis` validation
(`YearInvarianceBasis/v1`), stage `CO-21` with its `composeInclusionLeg`, the
named ordinary-taxable-income contributor, the federal pack's
`benefitInclusionPolicy`, the removal of `'taxable-social-security-benefits'`
from `unsupportedFeatures[]`, the completeness-record split, the
`power-inclusion` route section, and all five supersessions.

Not delivered: `lifetime-tax-inclusion.spec.mjs`, the leg-visibility set
identity across the four surfaces (TP-02-16, TP-02-17, TP-02-25), and the browser
rows TP-02-22 through TP-02-26. Four of the seventeen Definition of Done rows
remain unchecked with stated reasons, and three rows were **corrected** rather
than checked because the delivery made their original claim false — recorded
under [Corrected rows](#corrected-rows) below.

## Sourcing

`BI-6`, `BI-7` and `BI-8` were closed by one retrieval performed in this session.

| Field | Value |
| --- | --- |
| Title | Publication 915 (2025), Social Security and Equivalent Railroad Retirement Benefits |
| URL | `https://www.irs.gov/publications/p915` |
| `retrievedAt` | `2026-08-18T08:37:56.079Z` |
| `sourceId` | `irs-p915-2025` |
| Edition | title block reads *For use in preparing 2025 Returns*; the pack declares 2026 |

Every figure below is **real** — none ships as `AbsentFigure/v1`. Each was read
off the retrieved page and verified digit by digit, then verified again by
reproducing the publication's own worked examples end to end.

| Figure | Value | Locator | Kind |
| --- | --- | --- | --- |
| Base amount, single / head of household / separate-lived-apart | `25000` | *Are Any of Your Benefits Taxable?*, **Base amount.**, bullets 1–2; Worksheet 1 line 9 | breakpoint |
| Base amount, married filing jointly | `32000` | same, bullet 3; Worksheet 1 line 9 | breakpoint |
| Base amount, separate-lived-with-spouse | `0` | same, bullet 4 | breakpoint |
| Second base amount, single / HoH / separate-lived-apart | `34000` | *How Much Is Taxable?*, **Maximum taxable part.**, bullet 1 | breakpoint |
| Second base amount, married filing jointly | `44000` | same bullet, parenthetical | breakpoint |
| Second-tier increment, single / HoH / separate-lived-apart | `9000` | Worksheet 1 line 11 | amount |
| Second-tier increment, married filing jointly | `12000` | Worksheet 1 line 11 | amount |
| Benefit proportion in provisional income | `0.5` | *Are Any of Your Benefits Taxable?*, item 1; Worksheet A line B | rate |
| First-tier proportion | `0.5` | Worksheet 1 line 14 | rate |
| Second-tier proportion | `0.85` | Worksheet 1 line 16 | rate |
| Ceiling proportion | `0.85` | Worksheet 1 lines 18–19 | rate |
| Boundary operator | `>` | Worksheet A, the note following line E | qualifier |

**`BI-8` — the invariance basis, judged per component kind.** Every component
kind carries a `yearInvarianceBasis` quoting the publication's own dating
contrast, because this publication does not merely decline to date its base
amounts and percentages — it **applies them to other years**. Worksheet 2 is
headed *(From a Lump-Sum Payment for a Year After 1993)* and Worksheet 3
*(From a Lump-Sum Payment for a Year Before 1994)*, and both instruct the reader
to use the same base amounts, the same increments and the same percentages *for
the earlier year*. Worksheet 3 line 9 reads:

> Enter $25,000 ($32,000 if married filing jointly for the earlier year; or -0-
> if married filing separately for the earlier year and you lived with your
> spouse at any time during the earlier year)

A base amount scoped to a publication year could not be stated by that same
publication for a year before 1994. The dated counterpart, quoted on every basis,
is the same publication's Medicare premium sentence in the Appendix, which
attaches *in 2025* to a dollar figure and names the *2023 federal income tax
return* beside it.

### Worked-example reproduction

The publication's four worked examples and its filled-in Worksheet A were
reproduced end to end against the shipped pack. All five agree exactly.

| Example | Inputs | Publication's answer | Engine |
| --- | --- | --- | --- |
| Worksheet A filled-in | single, benefit 1,500, other 17,700 | none taxable | `0`, tier `none-included` |
| Example 1 | single, benefit 5,980, other 28,990 | `2,990` | `2990`, tier `first-tier` |
| Example 2 | joint, benefit 5,600, other 29,750 less 1,000 | none taxable | `0`, tier `none-included` |
| Example 3 | joint, benefit 10,000, other 40,500 | `6,275` | `6275`, tier `second-tier` |
| Example 4 | separate, lived with spouse, benefit 4,000, other 8,000 | `3,400` | `3400`, ceiling bound |

Example 4 is the ceiling-binding case: the tier arithmetic came to `8,500` and
the sourced ceiling proportion held it to `3,400`.

## Corrected rows

Three Definition of Done rows stated something the delivery makes false, and were
rewritten rather than checked, per the honesty rules in
[the scope index](../_index.md#honesty-rules-every-scope-operates-under).

1. **The invariance non-regression row.** It assumed the tightened rule would
   apply to every shipped basis. It does not: the tightened rule governs the
   figure-level basis surface this scope introduces, and the record-level rule
   Features 022 and 023 ship under is untouched. The row now states that
   distinction, and TP-02-09 records the outcome for all seven prior
   figure-level bases — none satisfies the structured form, which is recorded as
   a finding rather than absorbed by loosening the new rule.
2. **The privacy row.** It said "every declaration this scope adds". This scope
   adds none: the composition reads `income.ordinary`,
   `income.qualifiedDividend`, `income.longTermCapitalGain` and
   `income.taxExemptInterest`, all already inventoried. The row now says so.
3. **The render-safety row.** It required "every control routes through the
   declaration-signature no-op guard". This scope adds no control, so the guard
   is inherited unchanged rather than extended. The row now says so.

## Known gap — the separate-filer condition

The publication states two different base amounts and two different tier rules
for a separate filer, selected on whether the household lived with its spouse at
any time during the year. That fact is not in the workspace, so a
married-filing-separately household refuses `RLTAX-INPUT-INCOMPLETE` naming
`separateFilerSharedResidence` and the options it would accept. Neither situation
is defaulted and no amount is chosen on the household's behalf. Both branches are
exercised in the selftest with the condition supplied explicitly. Closing the gap
needs a workspace declaration and its privacy inventory.

## Completion Statement

This scope is **Done with concerns**. Thirteen of seventeen Definition of Done
rows are checked; four are unchecked with stated reasons, and three of the
checked rows were corrected first.

A completion claim belongs here only when every Test Plan row below carries the
raw output of the exact command named in
[scope.md](scope.md#test-plan) together with its exit code, and only for the rows
that were genuinely observed to pass. A row that was not observed stays unchecked
in `scope.md` with its reason stated there, and the reason is repeated here.

## Sourcing

`BI-6`, `BI-7` and `BI-8` are unclosed. No primary source has been retrieved in any
session for this scope, no figure has been transcribed, and the federal pack's
inclusion policy does not exist.

Each retrieval, when performed, is recorded here with: the source title, the URL,
the `retrievedAt`, the `retrievalOutcome`, the locator naming the section or line,
the transcribed figures verified digit by digit against the retrieved page, and the
`componentKind` of each figure.

`BI-8` is recorded separately from `BI-7` and is not satisfied by it. For each
component kind, this section records either the **quoted contrast** from the
publication's own text establishing that the kind does not vary by year, with its
own locator — or the finding that no such contrast exists, in which case the
component kind ships as an `AbsentFigure/v1` and the inclusion refuses **even
though the figure itself was successfully retrieved**. A retrieval that succeeded
and an invariance that failed is a legitimate and expected outcome, and it is
recorded as such rather than resolved.

The re-validation of every `yearInvarianceBasis` already shipped by Features 022
and 023 against the tightened rule is recorded here, basis by basis, with the
result for each. A prior basis that fails the tightened rule is a finding routed
under ASC-8, never a reason to loosen the new rule.

## Supersession Ledger

**SUP-024-02**, **SUP-024-03**, **SUP-024-04**, **SUP-024-05** and **SUP-024-08**
are undelivered. When delivered, this section records per entry: the superseded
clause verbatim, the replacement, the shape, the intended-RED output with its exit
code, the same-command GREEN output with its exit code, and the adversarial
evidence — each adversarial case recorded as having been seen to fail before it was
seen to pass.

SUP-024-08's target is re-resolved at implementation time. If the re-resolution
finds no assertion pinning the completeness record's content, that finding is
recorded here and the replacement is delivered as a new assertion pinning both
halves verbatim in the same change.

No ASC-8 in-flight admission has been made. If one is made, it is recorded here at
the moment of admission, together with the same-change updates to all four
surfaces.

## Change Boundary

No file has been created or modified. When execution occurs, this section records
the path-scoped status check over the excluded list in
[scope.md](scope.md#change-boundary-and-protected-paths) with its raw output,
proving every excluded path is byte-identical — including `rltaxsocialsecurity.js`
and `tax-rules/benefit/**`, whose byte-identity is the evidence that taxing a
benefit did not require changing what the benefit is.

## Claim Boundary

No output exists to scan. When execution occurs, this section records the raw
output of the claim scan over this scope's allowed paths, proving no string states
a probability, a plan success figure, a future-year figure, a track record or an
error rate, and that no included amount is presented as an estimate or a typical
proportion.

## Scenario Evidence

### Scenario SCN-024-004

Not executed. Holds the browser row output for TP-02-22 and the unit evidence for
the provisional income composition and its distinctness.

### Scenario SCN-024-005

Not executed. Holds the browser row output for TP-02-23 and the unit evidence for
the tier boundaries and the ceiling binding.

### Scenario SCN-024-006

Not executed. Holds the browser row output for TP-02-24 and the unit evidence for
the invariance basis and the ledger move.

## Test Evidence

No command has been run. Every anchor below is an empty evidence slot, and each is
filled with the raw unfiltered output of the exact command named for that row in
[scope.md](scope.md#test-plan), together with its exit code and, where the
scenario-first contract applies, the intended-RED output that preceded it.

### TP-02-01

Not executed.

### TP-02-02

Not executed.

### TP-02-03

Not executed.

### TP-02-04

Not executed.

### TP-02-05

Not executed.

### TP-02-06

Not executed.

### TP-02-07

Not executed.

### TP-02-08

Not executed.

### TP-02-09

Not executed.

### TP-02-10

Not executed.

### TP-02-11

Not executed.

### TP-02-12

Not executed.

### TP-02-13

Not executed.

### TP-02-14

Not executed.

### TP-02-15

Not executed.

### TP-02-16

Not executed.

### TP-02-17

Not executed.

### TP-02-18

Not executed.

### TP-02-19

Not executed.

### TP-02-20

Not executed.

### TP-02-21

Not executed.

### TP-02-22

Not executed.

### TP-02-23

Not executed.

### TP-02-24

Not executed.

### TP-02-25

Not executed.

### TP-02-26

Not executed.

### TP-02-27

Not executed.

### TP-02-28

Not executed.

### TP-02-29

Not executed.
