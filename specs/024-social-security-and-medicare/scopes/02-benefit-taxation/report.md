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

Not delivered at the time this summary was first written: `lifetime-tax-inclusion.spec.mjs`,
the leg-visibility set identity across the four surfaces (TP-02-16, TP-02-17, TP-02-25),
and the browser rows TP-02-22 through TP-02-26. **All of those are delivered now** and
were verified by execution in a later session, recorded under
[TP-02-16](#tp-02-16), [TP-02-17](#tp-02-17) and [TP-02-25](#tp-02-25). Fifteen of the
seventeen Definition of Done rows are checked; two remain unchecked with stated
reasons, and three rows were **corrected** rather than checked because the delivery
made their original claim false — recorded under [Corrected rows](#corrected-rows)
below.

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

This scope is **Done with concerns**. Fifteen of seventeen Definition of Done
rows are checked; two are unchecked with stated reasons, and three of the
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
are delivered, each with its marker, each replacement derived from the artifact it
describes rather than re-baselined as a literal.

The intended-RED evidence below was produced by **reversible regression probes run
in this session**, in RED-then-GREEN order per entry: the pre-change artifact state
was restored, the exact command was run and the replacement was observed to fail by
name; the change was then re-applied and the identical command was run green. The
probes are recorded honestly as probes. This report does not claim the RED was
captured at the moment the replacement was first written, because it was not. Every
probe was reverted, and `git status --short` after the last revert lists no product,
test, pack or selftest file.

### SUP-024-02 — the not-carried membership of the benefit id

- **Superseded clause, verbatim.** The membership of `'taxable-social-security-benefits'`
  in `requiredUnsupportedIds` at `scripts/selftest.mjs`, and the accounting built over
  it requiring that id to be a named not-carried feature of the shipped federal pack.
- **Replacement.** The three-set accounting became a five-set accounting over the same
  original eighteen ids: `unsupportedFeatures[]`, `taxLegs[]`, the itemised
  composition's component family, the pack's inclusion policy and the pack's medicare
  policy are pairwise disjoint and jointly exhaustive. The moved id is asserted ABSENT
  from the not-carried set AND PRESENT as the policy that models it. Marker
  `SUP-024-02: supersedes` sits beside it. Shape `account`.
- **Derived, not re-baselined.** `inclusionModelsId` reads the pack's own
  `benefitInclusionPolicy.modelsUnsupportedFeatureId` and its `tierParameters`.
- **Intended RED.** The pre-change pack state was restored by re-inserting the
  `taxable-social-security-benefits` entry into `unsupportedFeatures[]` after the
  `tax-credits` anchor.

  ```text
  $ node scripts/selftest.mjs
  ✗ FAIL: TP-01-01: every one of Feature 021’s eighteen unsupported ids is in exactly
    one of unsupportedFeatures[], taxLegs[], the itemised composition, the pack’s
    inclusion policy and the pack’s medicare policy, the five sets are disjoint, the
    moved benefit id and the moved adjustment id are each absent from the not-carried
    set AND present as the policy that models them …
  Research-Lab self-test: 2835 passed, 8 failed
  exit code: 1
  ```

- **Same-command GREEN.** After reverting the probe: `node scripts/selftest.mjs` →
  `Research-Lab self-test: 2843 passed, 0 failed`, exit code `0`.
- **Adversarial case.** The in-tree probe `SUP-024-02 ADVERSARIAL` runs on every
  selftest invocation: a pack that deletes the id from `unsupportedFeatures[]` with no
  inclusion policy in its place is accounted for in neither set and fails both halves.
  It is green in the shipped tree and it was red in the regression probe above, so it
  is exercised rather than vacuous.

### SUP-024-03 — the surgical-removal triple

- **Superseded clause, verbatim.** `['taxable-social-security-benefits', 'irmaa-bands',
  'premium-tax-credit'].every((id) => contributorIds.indexOf(id) >= 0)` together with
  the clause `Social Security benefits, IRMAA and the premium tax credit are still
  named so the removal was surgical`.
- **Replacement.** A split. The surgical-removal clause is retained verbatim over
  `['premium-tax-credit']`, the member this feature does not model, and the moved
  member gains the stronger moved-not-deleted clause: absent from the contributor set
  AND present as the pack's own inclusion policy. Marker `SUP-024-03: supersedes` sits
  beside it. Shape `split`.
- **Derived, not re-baselined.** `packContributorIds` reads the pack's own
  `movesMarginalRate` entries and is asserted equal to the rendered contributor set in
  both directions.
- **Intended RED.** The same pack regression as SUP-024-02.

  ```text
  $ node scripts/selftest.mjs
  ✗ FAIL: TP-03-07: the shipped curve’s contributor id set equals the pack’s
    movesMarginalRate entries in both directions, the premium tax credit is still named
    so the removal was surgical, the taxable-benefit id is absent from the contributor
    set AND present as the pack’s own inclusion policy …
  Research-Lab self-test: 2835 passed, 8 failed
  exit code: 1
  ```

- **Same-command GREEN.** After reverting the probe: `node scripts/selftest.mjs` →
  `Research-Lab self-test: 2843 passed, 0 failed`, exit code `0`.
- **Adversarial case.** The retained branch is exercised against the shipped pack, in
  which `'premium-tax-credit'` is still not carried, so the retained half is not
  vacuous. The ASC-7 obligation is met by that member rather than by an empty filter.

### SUP-024-04 — the browser-side contributor triple

- **Superseded clause, verbatim.** `['taxable-social-security-benefits', 'irmaa-bands',
  'premium-tax-credit'].forEach((id) => expect(domains).toContain('marginal-contributor:' + id))`
  at `tests/lifetime-tax-marginal.spec.mjs`.
- **Replacement.** The not-carried contributor set is read from the pack's own
  `movesMarginalRate` entries and asserted equal in both directions to the rendered
  domain set, plus the explicit moved-not-culled arms. Marker `SUP-024-04: supersedes`
  sits beside it. Shape `derive`.
- **Intended RED.** This is the gap the Definition of Done row named as unobserved. It
  is now observed. Under the same pack regression, the exact Test Plan command for
  TP-02-21 was run.

  ```text
  $ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "marginal" --reporter=list
  1) [system-chrome] › tests/lifetime-tax-marginal.spec.mjs:136:1 › Regression:
     SCN-021-009 unsupported thresholds are named unavailable contributors and the
     curve is labeled incomplete

     Error: expect(received).not.toContain(expected) // indexOf
     Expected value: not "taxable-social-security-benefits"
     Received array: ["payroll-tax", "self-employment-tax",
       "qualified-business-income-deduction", "alternative-minimum-tax", "tax-credits",
       "taxable-social-security-benefits", "premium-tax-credit",
       "capital-loss-limitation-and-carryforward",
       "itemized-deduction-benefit-limitation-top-band", "senior-deduction",
       "qualified-small-business-stock-section-1202-gain", "collectibles-gain"]

     > 184 |   expect(notCarriedContributorIds).not.toContain('taxable-social-security-benefits');
  1 failed
  3 passed (3.4s)
  exit code: 1
  ```

  The failure lands on line 184, which is an arm SUP-024-04 itself added. The derived
  identity above it passed under the regression, which is the point of deriving it: the
  derivation absorbs the move, and the explicit moved-not-culled arm is what refuses a
  pack that never made the move.
- **Same-command GREEN.** After reverting the probe, the identical command →
  `4 passed (3.1s)`, exit code `0`.
- **Adversarial case.** `expect(notCarriedContributorIds).toContain('premium-tax-credit')`
  keeps a member this feature does not model required to render, so a cull cannot pass
  as a move. The RED above is the case that fails when the replacement is weakened back
  toward the superseded literal.

### SUP-024-05 — the two-term pack-member partition

- **Superseded clause, verbatim.** The two-term partition `PRE_FEATURE_PACK_MEMBERS_023`
  plus `FEATURE_023_ADDED_PACK_MEMBERS`, which asserted the federal pack's member set
  partitions exactly into that recorded pre-feature list plus Feature 023's declared
  additions.
- **Replacement.** The partition gains a third declared term,
  `FEATURE_024_ADDED_PACK_MEMBERS`, and the assertion fails BY NAME rather than by
  count. The reconstruction gains `FEATURE_024_REMOVED_UNSUPPORTED` and
  `FEATURE_024_MODIFIED_PACK_MEMBERS`, so the same pre-feature digest constant
  `sha256:e102f09087d48a9bb8482aaf3a396a49e78e0e74811f59fa089eb77df3b970bd` is retained
  and re-asserted unchanged over the same reconstructed bytes. Marker
  `SUP-024-05: supersedes` sits beside it. Shape `derive`.
- **Intended RED.** The superseded two-term form was restored by emptying the third
  term, and the exact command was run against the delivered pack.

  ```text
  $ node scripts/selftest.mjs
  ✗ FAIL: TP-02-12: … the pack member set partitions exactly into the recorded
    pre-feature list and this feature’s declared additions, and the derived
    reconstruction reproduces the pre-feature content digest byte for byte while a
    mutated pre-existing figure and an undeclared member are each proven to fail:
    medicarePolicy, benefitInclusionPolicy
  Research-Lab self-test: 2842 passed, 1 failed
  exit code: 1
  ```

  Exactly one assertion failed, and it named both members that belonged to no declared
  term. That is the by-name failure the replacement traded for, observed rather than
  described.
- **Same-command GREEN.** After restoring the third term: `node scripts/selftest.mjs` →
  `Research-Lab self-test: 2843 passed, 0 failed`, exit code `0`.
- **Adversarial case.** The in-tree `smuggled02` probe adds an undeclared top-level
  member and asserts it is caught by name, and `mutated02` asserts a mutated
  pre-existing figure breaks the reconstruction digest. Both run on every selftest
  invocation.

### SUP-024-08 — the joint completeness entry

- **Superseded clause, verbatim.** The
  `modifiedAdjustedGrossCompleteness.unmodeledAdjustments` entry reading `the taxable
  portion of Social Security and railroad retirement benefits` in
  `tax-rules/federal/2026.json`.
- **Target re-resolution.** The re-resolution found no pre-existing assertion pinning
  that array's content. Per the ledger entry's own instruction, the replacement is
  delivered as a NEW assertion pinning both halves verbatim in the same change, which is
  stronger than the unpinned string it replaces.
- **Replacement.** A split. The entry names railroad retirement benefits alone on the
  unmodelled side, retained verbatim as to that half, and the record gains a
  `modelledAdjustments` member naming the Social Security inclusion. TP-02-15 pins both
  halves verbatim and additionally proves that deleting the entry outright leaves
  railroad retirement unnamed. The marker `TP-02-15 COMPLETENESS SPLIT (SUP-024-08)`
  sits beside the replacement and `SUP-024-08's other half` sits beside the
  reconstruction's declared modification. Shape `split`.
- **Intended RED.** The pre-split record was restored: the joint entry was put back and
  the `modelledAdjustments` member was removed.

  ```text
  $ node scripts/selftest.mjs
  ✗ FAIL: TP-02-15: the completeness record names railroad retirement benefits alone on
    the unmodelled side, names the Social Security inclusion on the modelled side,
    states no Social Security entry on the unmodelled side, and deleting the entry
    outright is proven to leave railroad retirement unnamed
  Research-Lab self-test: 2838 passed, 5 failed
  exit code: 1
  ```

- **Same-command GREEN.** After reverting the probe: `node scripts/selftest.mjs` →
  `Research-Lab self-test: 2843 passed, 0 failed`, exit code `0`.
- **Adversarial case.** The `deletedOutright25` arm removes the railroad entry and
  asserts it is then unnamed, so a pack that deleted the entry rather than splitting it
  fails. It runs on every selftest invocation.

### Marker and count agreement

TP-02-20 asserts mechanically, on every selftest invocation, that the four markers this
scope carries in `scripts/selftest.mjs` and `tests/lifetime-tax-marginal.spec.mjs` are
present, that the ownership table in `scopes/_index.md` reads
`| 02 | SUP-024-02, SUP-024-03, SUP-024-04, SUP-024-05, SUP-024-08 | 5 |`, that the
per-file marker distribution in `design.md` places SUP-024-04 in the marginal spec, and
that each replacement reads the artifact it describes. SUP-024-08's replacement carries
its marker at the TP-02-15 site and at the reconstruction's declared modification.

No ASC-8 in-flight admission was made by this scope. No ASC-9 naming decision arose.


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

Every anchor below is filled with the raw unfiltered output of the exact command
named for that row in [scope.md](scope.md#test-plan), captured through
`.github/bubbles/scripts/evidence-capture.sh` so the sha256 covers every line the
run produced, together with its exit code and the intended-RED output that
preceded it.

The clean baseline is **2843 passed, 0 failed**, exit **0**. The selftest prints a
small amount of run-varying text, so two green runs hash differently while both
report the same counts; the count line and the exit code are the load-bearing
facts and the sha256 is recorded so each capture can be re-derived in place.

**The pack-digest collateral.** `tax-rules/federal/2026.json` carries a
`contentSha256` that four assertions outside this scope re-derive from the pack
bytes — `TP-01-01`, `TP-03-02`, `TP-04-02` and `TP-05-01`. Any probe that mutates
the pack therefore fails those four as well. That is those rows working, not a
second defect, and it is reported rather than absorbed. Probes are written against
product code wherever the row's claim can be broken there.

### TP-02-01

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `tax-rules/federal/2026.json` the third composition part is
  renamed from `"tax-exempt-interest"` to `"tax-free-interest"`. The record stays
  contract-valid — the id is still unique and non-empty — so the failure is the
  row's own naming claim rather than a refusal cascade.
- **RED.** exit `1`, `2838 passed, 5 failed`, sha256 `ee228a8bb47c…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-01: ProvisionalIncome/v1 publishes every part the source names by name with its amount and its origin, its total is the sum of exactly those parts, and distinctFrom names both adjusted gross income and the pack’s modified adjusted gross measure
```

  The other four failures are the pack-digest collateral described above.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `6ad63698216c…`.

**Two probes rejected before this one, and why.** Emptying the part `label`, and
dropping a member from `distinctFrom`, each made the contract validator refuse the
whole record, so `computeInclusionSettlement` published no `inclusion` member and
the scope-02 group threw before `TP-02-01` was reached. A group-level throw is a
red run but it is not evidence about this row, so both were reverted and replaced
by the probe above.

### TP-02-02

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxrules.js` the construction check inside
  `validateProvisionalIncome` is inverted from
  `part.readFromMeasureId !== null` to `=== null`, so the check never inspects a
  part that names the measure it was read from. This is precisely the
  compare-the-totals implementation the row exists to refuse: the copied-measure
  fixture totals one dollar and passes.
- **RED.** exit `1`, `2842 passed, 1 failed`, sha256 `6877bee9e731…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-02: a composition that read the pack’s modified adjusted gross measure is refused at a total of one dollar, which differs from that measure, while an identically-totalled composition built from the household’s own declaration passes — so the check inspects what was summed rather than
```

- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `c10ea2311887…`.


### TP-02-03

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` the tier selection in
  `selectInclusionTier` is loosened from `overSecond > 0` to `overSecond >= 0`.
  Because `overSecond` is `Math.max(0, …)`, every provisional income above the
  first base then lands in the second tier, so the between-the-two-bases case and
  the exactly-at-the-second-base case are misclassified.
- **RED.** exit `1`, `2842 passed, 1 failed`, sha256 `fbfc4a113886…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-03: against a fixture pack carrying deliberately non-standard base amounts, provisional incomes below the first base, exactly at it, between the two, exactly at the second and above it each land in the tier the fixture pack states
```

- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `25b074daa435…`.


### TP-02-04

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` `applyOperator` returns `left >= right`
  for the `">"` operator, so the pack's strict boundary is executed as an
  inclusive one — the exact swap the row exists to catch.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `4a7994fa8064…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-04: at provisional income exactly equal to the fixture base amount the shipped strict operator includes nothing and an inclusive operator includes something, so an implementation swapping the two is proven to fail at the exact figure, and the comparison the engine performed is publis
```

  The second failure is `TP-02-03`, which asserts the tier landing at exactly the
  base amount — the same boundary, so it is the tier row detecting the same
  swap from its own side rather than a separate defect.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `e6a4b48b1ad5…`.


### TP-02-05

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` `computeIncludedBenefit` publishes
  `included = beforeCeiling` instead of `Math.min(beforeCeiling, ceilingAmount)`,
  so the sourced ceiling is computed and published but never applied.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `3289753c634a…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-05: the included amount never exceeds the sourced ceiling proportion of the benefit, proven on a case where the ceiling did not bind and one where it did, and ceilingBound states which — both reproducing the publication’s own worked examples
```

  The second failure is `TP-02-06`, the adversarial row for the same ceiling. It
  holds its own dedicated probe below.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `2a018399b991…`.


### TP-02-06

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` the ceiling is computed from a recalled
  literal — `ceilingAmount = 0.85 * benefitAmount` — instead of from the pack's
  sourced `ceiling.value`. This is the recalled-proportion implementation the row
  exists to catch, expressed as the smallest edit that produces it.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `8bdede20031c…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-06: against a fixture pack whose ceiling proportion is deliberately not the shipped one, the included amount is the fixture’s ceiling rather than the shipped one, so an implementation applying a recalled proportion is proven to fail
```

  The second failure is `TP-02-HARNESS`, which forbids a base amount, tier
  percentage or ceiling proportion appearing as a literal anywhere in the module.
  It caught the same edit from the other side, which is the no-recalled-figures
  guard working rather than a second defect.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `7c703a81a1e6…`.


### TP-02-07

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxrules.js` the category-name arm of
  `validateQuotedInvarianceBasis` is neutered: the guard
  `quotation.length < MIN_QUOTED_CONTRAST_LENGTH || quotation.indexOf(" ") < 0`
  becomes `quotation.length < 0`, so a one-word category name is admitted as a
  quoted contrast.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `c52dbf149b4a…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-07: a yearInvarianceBasis is valid only when it quotes both halves of a contrast and locates each; a bare assertion, a category name, a reference to this repository’s own governance, a missing locator and a contrast quoting the same text on both sides are each refused, and the catego
```

  The second failure is `TP-02-08`, which asserts that a bare-assertion basis
  makes the inclusion refuse. It holds its own dedicated probe below.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `5a634aec65b0…`.


### TP-02-08

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` `resolveSourcedFigure` no longer consults
  the invariance basis for a figure carried across editions: the
  `if (!sameYear)` gate is made unreachable, so a base amount whose component
  kind has no established contrast is published as a value instead of refusing.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `c937ae26b726…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-08: a base amount the pack genuinely carries, whose invariance basis is absent or is a bare assertion, makes the inclusion refuse RLTAX-THRESHOLD-UNAVAILABLE naming the missing basis rather than the missing figure, and no tier and no amount is smuggled past the refusal
```

  The second failure is `TP-02-13`, whose unavailable-contributes-nothing arm
  builds its refused leg from the same no-basis pack. It holds its own dedicated
  probe below.
- **Revert.** Byte-identical; `git status --porcelain` listed no tracked file
  other than this report.
- **GREEN.** The identical command → exit `0`, `2843 passed, 0 failed`, sha256
  `5cd527c9b7c1…`.


### TP-02-09

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

**The concurrent-session baseline.** Every capture from here on was taken while a
separate session held uncommitted work in `specs/025-*` and `specs/026-*`. Its spec
artifacts name browser spec paths under `tests/` that do not exist, so the
spec-referenced-path assertion fails in every run below. That failure is foreign to
this scope, is present in the clean tree as well, and is named in each capture so it
is never mistaken for a probe result. The exact paths are deliberately **not**
written out here: the guard scans artifact text, so quoting a missing path would
make this report a reference site for it and turn a foreign failure into one this
scope caused. The clean baseline is therefore
**`2842 passed, 1 failed`, exit `1`** rather than the `2843 passed, 0 failed`,
exit `0` recorded above from the committed tree. A probe's RED is the count moving
**below** 2842, and the row's own assertion appearing by name.

- **Mutation.** In `rltaxrules.js` the first branch of
  `validateQuotedInvarianceBasis` is loosened so a bare narrative string is
  admitted as a valid basis:
  `if (isNonEmptyString(basis)) return { ok: true, refusals: [] };` is inserted
  ahead of the `!isPlainObject(basis)` refusal. This is exactly the loosening the
  row exists to forbid — the shape a prior feature's seven narrative bases would
  take if the tightened rule were relaxed to stop refusing them.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `aff1078ed2a8…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-09: every yearInvarianceBasis this scope authors satisfies the tightened rule, and every basis a prior feature shipped is re-validated against it and its outcome recorded — all 7 prior figure-level bases are narrative strings governed by the untouched rule in the module that owns the
```

  The other failure is the foreign spec-path failure described above.
- **Revert.** `git checkout -- rltaxrules.js`; `git status --short` then listed no
  tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `4931df64c84e…` — the row passes and only the foreign failure remains.

### TP-02-10

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `tax-rules/federal/2026.json` the `irs-p915-2025` source record's
  `retrievedAt` is emptied. Every value-bearing member of the inclusion policy cites
  that record, so each now resolves to a source that claims `retrievalOutcome:
  "retrieved"` while carrying no moment at which the retrieval happened — a sourcing
  claim with nothing behind it, which is the defect this row exists to catch. The
  member is deliberately one the settlement never gates on, so the group runs to the
  row rather than throwing short of it.
- **RED.** exit `1`, `2832 passed, 11 failed`, sha256 `ba59568d854b…`. This row's
  failing line, verbatim:

```text
  ✗ FAIL: TP-02-10: each of the 17 value-bearing members of the inclusion policy resolves to exactly one retrieved source carrying a locator and a retrievedAt, and an unretrieved member ships as a value-free AbsentFigure with a missingSource pointer that makes the whole inclusion refuse
```

  Seven of the others are the pack-digest and pack-validity collateral described at
  the head of this section; the remaining three are foreign (the spec-path row and
  the concurrent session's two company-intelligence rows).
- **Revert.** `git checkout -- tax-rules/federal/2026.json`, run in the same command
  as the probe; `git status --short` immediately after listed no tracked file other
  than this report.
- **GREEN.** The identical command → exit `1`, `2840 passed, 3 failed`, sha256
  `9a36ed0f5144…` — the row passes and only foreign failures remain.

**One probe rejected before this one, and why.** Emptying the `locator` on the
policy's `ceilingProportion` made `resolveSourcedFigure` refuse, so
`computeInclusionSettlement` published no settlement and the whole Feature 024
Scope 02 group threw with `Cannot read properties of undefined (reading
'provisionalIncome')` before `TP-02-10` was reached. A group-level throw is a red
run but it is not evidence about this row, so it was reverted and replaced by the
probe above — the same standard applied to the two probes rejected under
[TP-02-01](#tp-02-01).

**The foreign baseline moved during this session.** From this capture on the
concurrent session's own `TP-025-07` and `TP-025-08` also fail on a clean tree, so
the clean baseline is `2840 passed, 3 failed` rather than `2842 passed, 1 failed`.
All three failures are foreign to this scope: none names a Feature 024 row, and
`git status --short` shows this scope holds no tracked change but this report.

### TP-02-11

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `tax-rules/federal/2026.json` the inclusion policy's
  `modelsUnsupportedFeatureId` is changed from `"taxable-social-security-benefits"`
  to `"social-security-inclusion"` — the policy's own id. The policy still exists
  and the id is still gone from `unsupportedFeatures[]`, so the pack still *looks*
  like a move; what it no longer carries is the claim naming **which** not-carried
  id it took over. That is the cull-disguised-as-a-move this row exists to refuse.
- **RED.** exit `1`, `2834 passed, 9 failed`, sha256 `a4d1b76a7dc0…`. This row's
  failing line, verbatim:

```text
  ✗ FAIL: TP-02-11: the taxable-benefit id is absent from unsupportedFeatures[] and present as the inclusion policy the pack’s own tier declaration carries, the inclusion leg is declared by the policy rather than by the engine, the adjustment id beside it in the original triple is likewise absent fr
```

  Seven of the other eight are the **pack-digest collateral** described at the head
  of this section — `TP-01-01`'s digest row, `TP-03-02`, `TP-04-02` and `TP-05-01`
  re-derive `contentSha256` from the pack bytes — together with `TP-01-01`'s
  accounting, `TP-03-07`'s contributor identity and Feature 023's `TP-02-12` member
  partition, each of which reads the same member from its own side. The ninth is the
  foreign spec-path failure.
- **Revert.** `git checkout -- tax-rules/federal/2026.json`, run in the **same
  command** as the probe so the pack could not survive a dropped dispatch;
  `git status --short` immediately after listed no tracked file other than this
  report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `40d1d7c2930c…`.

**A note on the run-varying line count.** From this capture on, the total line
count is `3221` rather than `3218` and the path assertion reports `2 new … of 241
referenced` rather than `1 new … of 240`. That is the concurrent session adding a
further spec reference between runs. It is foreign drift, it moves the failing
count of a foreign row only, and the load-bearing figure — `2842 passed` on a clean
tree — is unchanged.

### TP-02-12

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

**Where this row lives.** TP-02-12 is delivered as the `SUP-024-02 ADVERSARIAL`
block at the Feature 021 accounting site, so its assertion message is labelled
`TP-01-01 adversarial` rather than `TP-02-12`. That is the supersession procedure
working: the replacement is written at the site of the clause it supersedes. The
mapping is recorded here so the failing line below is readable as this row's.

- **Mutation.** In `rltaxrules.js` `declaredTaxLegs` appends a leg whose `legId` is
  `taxable-social-security-benefits`, so the moved id becomes findable in a **second**
  place. This is exactly the masking defect the four-set accounting exists to catch:
  with the id reachable through `taxLegs[]`, a pack that deleted it from
  `unsupportedFeatures[]` with nothing modelled in its place would still be
  "accounted for", and the adversarial simulation would stop discriminating.
- **RED.** exit `1`, `2839 passed, 4 failed`, sha256 `eb5b6cccaf3e…`. This row's
  failing line, verbatim:

```text
  ✗ FAIL: TP-01-01 adversarial: a pack that deleted the benefit id with no inclusion policy in its place, a pack that deleted the adjustment id with no medicare policy in its place, and a pack whose medicare policy models the adjustment id but sums one of its legs into the tax total each fail the fi
```

  `TP-01-01` fails alongside it because the same duplicate breaks set disjointness,
  and `TP-04-12` fails because the invented leg is not one of the three premium legs
  its filter counts. Both are those rows detecting the same edit from their own side.
  The fourth is the foreign spec-path failure.
- **Revert.** `git checkout -- rltaxrules.js`; `git status --short` then listed no
  tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `30622fea6629…`.

### TP-02-13

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltax.js` the refusal branch of
  `ordinaryTaxableIncomeContribution` publishes `amount: 0` instead of
  `amount: null`. This is the defect the row's last clause names: an inclusion that
  could not be settled contributes a zero, telling a household that none of its
  benefit is taxable when in fact nothing was computed.
- **RED.** exit `1`, `2840 passed, 3 failed`, sha256 `594e465c0b64…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-13: the included amount is a named contributor to ordinary taxable income rather than a new income kind, the supported income-kind count and the pack’s incomeKinds member are unchanged, the refusal vocabulary member count is unchanged, and an unavailable inclusion contributes nothing
```

  The second failure is `TP-05-15`, Scope 05's own contributor row, which asserts
  the same null-rather-than-zero clause from the settled-record side; it is that
  row detecting the same edit rather than a separate defect. The third is the
  foreign spec-path failure.
- **Revert.** `git checkout -- rltax.js`; `git status --short` then listed no
  tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `62b35c99ed4e…`.

### TP-02-14

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltax.js` the inclusion is **woven into the pre-existing
  arithmetic** rather than left additive: `computeTaxableIncomeBasis` reads
  `pack.benefitInclusionPolicy`, settles the inclusion from the workspace and adds
  the included amount into `gross` before the deduction is applied.
- **Why this probe is the right one.** For the row's own fixture — a household with
  no benefit declared — the woven amount is zero, so **every figure the row pins
  stays numerically identical**. The weave is invisible to an arithmetic check and
  is caught only by the row's structural clause, that the engine holds no reference
  to the inclusion policy member. That is precisely the class of defect the clause
  exists for, and the probe demonstrates the clause is what carries it.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `e9a9682b06fe…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-14: with no benefit declared the settlement engine reproduces its exact prior gross, ordinary taxable, preferential taxable and total taxable income, and the engine holds no reference to the inclusion policy member, so the contributor is additive rather than woven into the pre-existi
```

  The other failure is the foreign spec-path failure.
- **Revert.** `git checkout -- rltax.js`; `git status --short` then listed no
  tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `d8a414b7da60…`.

### TP-02-15

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `tax-rules/federal/2026.json` the completeness record's
  unmodelled entry is returned to its **pre-split joint form**: `"the taxable
  portion of railroad retirement benefits"` becomes `"the taxable portion of Social
  Security and railroad retirement benefits"`. The pack now names Social Security
  on both sides at once — modelled by the inclusion policy and simultaneously
  disclosed as not modelled. That is the exact state the split exists to end, and
  the state an unsplit entry would silently persist in after FR-024-013 moved the id.
- **RED.** exit `1`, `2836 passed, 7 failed`, sha256 `1b9c8329728f…`. This row's
  failing line, verbatim:

```text
  ✗ FAIL: TP-02-15: the completeness record names railroad retirement benefits alone on the unmodelled side, names the Social Security inclusion on the modelled side, states no Social Security entry on the unmodelled side, and deleting the entry outright is proven to leave railroad retirement unname
```

  Four of the others are the pack-digest collateral; two are foreign.
- **Revert.** `git checkout -- tax-rules/federal/2026.json`, run in the same command
  as the probe; `git status --short` immediately after listed no tracked file other
  than this report.
- **GREEN.** The identical command → exit `1`, `2841 passed, 2 failed`, sha256
  `0782cf0df467…` — the row passes and only foreign failures remain.

### TP-02-16

Green. `node scripts/selftest.mjs` → `Research-Lab self-test: 2843 passed, 0 failed`,
exit code `0`. The assertion holds the two-directional identity against the
all-non-zero fixture `['property-tax', 'dwelling-use', 'rental-net', 'recapture',
'remainder', 'social-security-benefit', 'social-security-inclusion']` with
`social-security-inclusion` present in the declared set, proves a leg invented by a
surface fails the identity from the other side, and reads the delivered page's own
wiring so the check is on the route rather than on an array the assertion built for
itself.

### TP-02-17

Green. `node scripts/selftest.mjs` → `Research-Lab self-test: 2843 passed, 0 failed`,
exit code `0`. Removing the inclusion leg from each of the four surfaces in turn is
proven to fail, and each of the four failures names both the missing leg and the
surface it failed to reach.

This is the detector-level demonstration. The route-level demonstration of the same
claim — four real removals from the delivered page — is recorded under
[TP-02-25](#tp-02-25).

### TP-02-18

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` `computeInclusionSettlement` opens with
  `console.warn("inclusion settling for benefit amount", benefitAmount);`, so the
  module writes a household figure to the console — the leak the row's
  no-console clause exists to refuse.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `b620a5054934…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-18: the inclusion composes from members the workspace already inventories, adds no storage key and no new workspace field, and the module performs no network access, no storage access, no DOM access and writes nothing to the console
```

  The run's line count rose from `3218` to `3243`, which is the leak itself
  appearing in the transcript: twenty-five settlements each emitted the warning.
  That corroborates the probe executed rather than merely being read by a scan.
  The other failure is the foreign spec-path failure.
- **Revert.** `git checkout -- rltaxinclusion.js`; `git status --short` then listed
  no tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `18e9f601b288…`, line count back to `3218`.

### TP-02-19

Intended RED and same-command GREEN, both under `node scripts/selftest.mjs`.

- **Mutation.** In `rltaxinclusion.js` `computeIncludedBenefit` substitutes a
  fallback for the sourced ceiling instead of refusing:
  `if (rules.isUnavailable(ceiling)) return ceiling;` becomes
  `if (rules.isUnavailable(ceiling)) ceiling = { value: 1 };`. With the pack's
  `ceilingProportion` absent the settlement now completes and publishes a full
  inclusion record built around a figure that was never retrieved — the
  partly-built record the row exists to keep away from the renderer.
- **RED.** exit `1`, `2841 passed, 2 failed`, sha256 `d29e5c5b454b…`. Failing
  line, verbatim:

```text
  ✗ FAIL: TP-02-19: with each of the eight inclusion members absent in turn the settlement refuses with an existing code and a reason and publishes no partly-built inclusion record, so a renderer reading only published members cannot meet an absent figure where it expected a number
```

  The other failure is the foreign spec-path failure.
- **Revert.** `git checkout -- rltaxinclusion.js`; `git status --short` then listed
  no tracked file other than this report.
- **GREEN.** The identical command → exit `1`, `2842 passed, 1 failed`, sha256
  `00eac43130ca…`.

### TP-02-20

Green. `node scripts/selftest.mjs` → `Research-Lab self-test: 2843 passed, 0 failed`,
exit code `0`. The four markers this scope carries in `scripts/selftest.mjs` and
`tests/lifetime-tax-marginal.spec.mjs` are present, the ownership table and the
per-file marker distribution agree with them, and each replacement reads the artifact
it describes rather than restating a re-baselined literal. The per-entry detail is in
[the supersession ledger](#supersession-ledger).

### TP-02-21

Green. The exact Test Plan command:

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "marginal" --reporter=list
Running 4 tests using 2 workers
  ✓  1 …ion: SCN-008-017 marginal and total risk contributions reconcile (595ms)
  ✓  2 …1-007 the next dollar is priced as a curve with named thresholds (634ms)
  ✓  3 …ion: SCN-021-008 a cliff renders as a step and is never smoothed (470ms)
  ✓  4 …med unavailable contributors and the curve is labeled incomplete (879ms)
  4 passed (3.1s)
exit code: 0
```

The intended-RED for the same command, observed under the pack regression described in
[the supersession ledger](#sup-024-04--the-browser-side-contributor-triple), is
`1 failed`, `3 passed`, exit code `1`, at `tests/lifetime-tax-marginal.spec.mjs:184`.

### TP-02-22

Intended RED and same-command GREEN, both under the exact TP-02-22 command.

- **Mutation.** In `lifetime-tax-strategy-lab.html` the measure line stops
  publishing `provisional.distinctFrom`: the clause `". This measure is not " +
  provisional.distinctFrom.join(" and it is not ")` is removed. The panel still
  shows the composed total and still says it is composed from the parts below, so
  the page looks complete — what it no longer tells a reader is that provisional
  income is **not** adjusted gross income and **not** this pack's modified adjusted
  gross measure. That is the conflation FR-024-009 exists to prevent, rendered.
- **RED.** exit `1`, `1 failed`. Verbatim:

```text
Running 1 test using 1 worker

  ✘  1 …ry part by name with its origin and names the measures it is not (933ms)

  1) [system-chrome] › tests/lifetime-tax-inclusion.spec.mjs:41:1 › Regression: SCN-024-004 provisional income shows every part by name with its origin and names the measures it is not

    Error: expect(received).toContain(expected) // indexOf

    Expected substring: "adjusted-gross-income"
    Received string:    "Provisional income: $74,956; it is composed from the parts below and nothing else."

      75 |   const measureLine = await page.locator('#inclusionMeasureLine').innerText();
      76 |   expect(measureLine).toContain('$74,956');
    > 77 |   expect(measureLine).toContain('adjusted-gross-income');
         |                       ^
      78 |   expect(measureLine).toContain('modified-adjusted-gross-income');
```

  The composed total is still `$74,956`, so the row failed on the missing
  distinction rather than on an arithmetic change — the assertion is load-bearing
  for the claim it makes.
- **Revert.** `git checkout -- lifetime-tax-strategy-lab.html`; `git status --short`
  then listed no tracked file other than this report.
- **GREEN.** The identical command → `1 passed (1.9s)`, exit `0`.

### TP-02-23

Intended RED and same-command GREEN, both under the exact TP-02-23 command.

- **Mutation.** In `lifetime-tax-strategy-lab.html` the ceiling line stops reading
  `inclusion.ceilingBound` and renders one unconditional sentence naming the tier
  arithmetic and the ceiling figure. Both numbers are still shown and both are
  still correct; what the page no longer states is **which one governed the
  result**. This is the defect the row's binding clause exists to catch: a reader
  left to infer the binding from a figure that stopped moving.
- **RED.** exit `1`, `1 failed`. Verbatim:

```text
Running 1 test using 1 worker

  ✘  1 … amount with its operator shown and the ceiling binding is stated (5.7s)

  1) [system-chrome] › tests/lifetime-tax-inclusion.spec.mjs:90:1 › Regression: SCN-024-005 the tier is selected at the exact base amount with its operator shown and the ceiling binding is stated

    Error: expect(locator).toContainText(expected) failed

    Locator: locator('#inclusionCeilingLine')
    Expected substring: "did not bind"
    Received string:    "The tier arithmetic came to $1 and the sourced ceiling is $18,625."
    Timeout: 5000ms

      125 |   expect(aboveCells[1]).toBe('$25,001');
      126 |   expect(aboveCells[4]).toBe('yes');
    > 127 |   await expect(page.locator('#inclusionCeilingLine')).toContainText('did not bind');
```

  The exact-boundary half of the row had already passed before this point — the
  comparison rendered `$25,000 > $25,000 → no` and one dollar above rendered
  `$25,001 → yes` — so the row reached its ceiling clause with the operator half
  intact and failed on the clause the probe targeted.
- **Revert.** `git checkout -- lifetime-tax-strategy-lab.html`; `git status --short`
  then listed no tracked file other than this report.
- **GREEN.** The identical command → `1 passed (2.0s)`, exit `0`.

### TP-02-24

Intended RED and same-command GREEN, both under the exact TP-02-24 command.

- **Mutation.** In `lifetime-tax-strategy-lab.html` the base-amount table stops
  rendering the publication's own words: the quoted contrast and its locator are
  replaced by the flat sentence `"the figure does not vary by year"`. The column is
  still populated, the base amount and its edition year are unchanged, and the page
  still tells a reader the figure carries across editions — it just asserts it
  instead of quoting it. **That is assumed invariance, which is the single defect
  this scope exists to prevent**, and it is what an implementer reaches for when the
  publication's own contrast is inconvenient to carry through to the page.
- **RED.** exit `1`, `1 failed`. Verbatim:

```text
Running 1 test using 1 worker

  ✘  1 …rast and one without a contrast refuses naming the missing basis (881ms)

  1) [system-chrome] › tests/lifetime-tax-inclusion.spec.mjs:146:1 › Regression: SCN-024-006 a base amount from another edition shows its quoted contrast and one without a contrast refuses naming the missing basis

    Error: expect(received).toContain(expected) // indexOf

    Expected substring: "“"
    Received string:    "the figure does not vary by year"

      165 |     expect(cells[2].length).toBeGreaterThan('irs-p915-2025'.length + 5);
      166 |     expect(cells[3]).toBe('2025');
    > 167 |     expect(cells[4]).toContain('\u201c');
          |                      ^
      168 |     expect(cells[4]).not.toBe('the edition read is the declared year');
      169 |     expect(cells[4].length).toBeGreaterThan(60);
```

  The row failed on the **quotation mark**, not on emptiness: the bare assertion the
  probe substituted is exactly the shape the `not.toBe(...)` guard alone would have
  let through, so the three clauses together are what carry the claim.
- **Revert.** `git checkout -- lifetime-tax-strategy-lab.html`; `git status --short`
  then listed no tracked file other than this report.
- **GREEN.** The identical command → `1 passed (2.4s)`, exit `0`.

### TP-02-25

Green, and verified by four real removals rather than by reading the page.

```text
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-005 the inclusion leg reaches the headline, the comparison, the curve and the export" --reporter=list
Running 1 test using 1 worker
  ✓  1 …g reaches the headline, the comparison, the curve and the export (643ms)
  1 passed (1.8s)
exit code: 0
```

The row asserts a two-directional set identity between the settled record's leg set and
each of the four surfaces, against a fixture in which every leg settles a distinct
non-zero figure. A zero leg balances an addition check whether or not it was added,
which is exactly how a dropped leg hides, so the fixture is chosen to make every
omission change a surface by an amount unique to that leg.

**The four removal probes.** Each probe removed the inclusion leg from exactly one
delivered surface, ran the row, and was then reverted. Each probe was observed to fail,
and each failure named both the leg and the surface. The page is byte-identical after
the last revert.

| Surface | Probe applied to `lifetime-tax-strategy-lab.html` | Observed failure | Exit |
| --- | --- | --- | --- |
| headline | the `inclusionHost` guard was made unreachable | `Expected value: "social-security-inclusion"` / `Received array: ["social-security-benefit"]` at `lifetime-tax-inclusion.spec.mjs:215`, on `#headlineBlock [data-rl-leg]` | `1` |
| comparison | the composition row for the inclusion leg was not appended | `Locator: locator('#legCompositionBody tr[data-rl-leg="social-security-inclusion"]')` / `Expected substring: "named contributor to ordinary taxable income"` / `element(s) not found` at line 225 | `1` |
| curve | the curve contributor row for the inclusion leg was not appended | `Locator: locator('#curveLegContributorsBody tr[data-rl-leg="social-security-inclusion"]')` / `Expected substring: "resamples the declared workspace"` / `element(s) not found` at line 223 | `1` |
| export | the leg was filtered out of `settledLegs` | `Error: the leg social-security-inclusion is in the settled record and does not reach export` / `Received array: ["additional-medicare-tax", "net-investment-income-tax", "ordinary", "preferential", "social-security-benefit"]` at line 254 | `1` |

The export probe is the one that produced the two-directional identity's own message,
which names the leg and the surface in a single sentence. The other three were caught
earlier in the row by the per-surface assertions that precede the identity loop, each
of which names the leg and carries the surface in its locator.

After the fourth revert: `git status --short` listed no product file, and the row was
re-run green at `1 passed`, exit code `0`.

The headline figure itself is asserted by TP-02-23, which reads
`#headlineBlock [data-rl-value="inclusion-headline"]` and requires `$18,625` on the
ceiling-bound fixture and `$0` on the below-first-base-amount fixture. The leg reaches
the headline carrying its own figure rather than reaching it as an empty node.

### TP-02-26

Intended RED and same-command GREEN, both under the exact TP-02-26 command
(`--grep "SCN-02"`, the cumulative browser suite over the real route).

- **Mutation.** The **same** page probe recorded under [TP-02-24](#tp-02-24) — the
  quoted contrast replaced by a bare assertion — held while this command ran. That
  is deliberate: this row's claim is that the cumulative suite still detects a
  regression introduced anywhere in the delivered route, so its intended RED is a
  real route defect observed through the broad command rather than a defect
  manufactured for it.
- **RED.** exit `1`, sha256 `05e8cb388128…`, `1 failed`, `67 passed (21.4s)` of
  `68`. Verbatim tail:

```text
  1 failed
    [system-chrome] › tests/lifetime-tax-inclusion.spec.mjs:146:1 › Regression: SCN-024-006 a base amount from another edition shows its quoted contrast and one without a contrast refuses naming the missing basis
  67 passed (21.4s)
```

- **Revert.** `git checkout -- lifetime-tax-strategy-lab.html`; `git status --short`
  then listed no tracked file other than this report.
- **GREEN.** The identical command → exit `0`, sha256 `b86c830d28f2…`,
  **`68 passed (45.7s)`**, zero failed. The suite spans Features 021 through 024 and
  the concurrent session's Feature 025 browser rows, all over the real route.

### TP-02-27

Not executed.

### TP-02-28

Intended RED and same-command GREEN, both under `node scripts/validate-spec-test-paths.mjs`.

**What this row can and cannot claim right now.** The guard's verdict is repository-wide
and the concurrent session's `specs/026-*` artifacts name two browser spec paths that do
not exist, so the command **exits `1` on a clean tree**. This row's own claim is narrower
and is the one this scope can honour: that **this scope introduces no new missing path**.
Both readings are recorded below rather than letting the foreign exit code stand in for
either.

- **A real finding this row caught, in this session.** An earlier draft of the
  concurrent-session note above quoted the foreign missing path literally. The guard
  scans artifact text, so quoting it made this report a **third reference site** for it —
  the run showed the foreign path at `report.md:627` alongside the two `specs/026-*`
  sites. The prose was rewritten to describe the path instead of naming it, and the
  reference site disappeared. That is this row doing its job on this scope's own
  artifact, unprompted.
- **A stated elision, and why the evidence below carries one.** Recording this row's
  output verbatim is self-defeating: the first attempt pasted the three paths in full
  and the very next run reported **five new reference sites inside this file**,
  `new=3`, `references=14158`. The guard cannot distinguish a path a spec *claims* from
  a path a report *quotes*. Every occurrence below therefore ends `.spec.<mjs>` instead
  of `.spec.mjs`. **That single bracket is the only alteration made to any output in
  this report**, it is applied to path strings only, it changes no count, no exit code
  and no verdict line, and it is disclosed here so a reader re-running the command sees
  the unbracketed form and knows why.
- **Mutation.** A single line naming a non-existent spec path,
  `tests/lifetime-tax-inclusion-probe.spec.<mjs>`, was written into this report.
- **RED.** exit `1`, `new=3`. Verbatim but for the stated elision, the probe's own entry:

```text
[spec-test-paths] scanned=638 references=14155 distinctPaths=242 missingPaths=74 baseline=77 new=3 stale=6
  NEW-MISSING tests/lifetime-tax-inclusion-probe.spec.<mjs> (1 reference site(s))
      referenced at specs/024-social-security-and-medicare/scopes/02-benefit-taxation/report.md:1138
...
[spec-test-paths] FAIL — 3 new referenced path(s) do not exist
```

- **Revert.** The line was removed by editing this report; the removal is confirmed by
  the GREEN run below, in which no `specs/024-*` site appears.
- **GREEN, as far as this scope owns it.** The identical command → `new=2`,
  `distinctPaths=241`, and **every remaining reference site is under
  `specs/026-*`**, which this scope does not own and has not touched:

```text
[spec-test-paths] scanned=638 references=14154 distinctPaths=241 missingPaths=73 baseline=77 new=2 stale=6
  NEW-MISSING tests/market-brief-cockpit.spec.<mjs> (21 reference site(s))
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/scopes.md:87
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/scopes.md:100
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/scopes.md:184
      ... and 18 further reference site(s)
  NEW-MISSING tests/market-brief.spec.<mjs> (2 reference site(s))
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/design.md:1105
      referenced at specs/026-actionable-brief-brevity-and-cross-asset/design.md:1108
[spec-test-paths] FAIL — 2 new referenced path(s) do not exist
```

  The command's exit code is `1` and is **not** claimed as `0`. Zero of the two new
  paths is this scope's; the row's own claim holds and the residual failure is stated
  as foreign rather than absorbed.

**A foreign edit to a protected path, observed mid-session and left alone.** The
`STALE-BASELINE` block above — six `causal-rotation` entries — was present in the
RED and GREEN runs and then vanished from a later run, with
`git status --short` showing `M scripts/validate-spec-test-paths.baseline` and a
six-line deletion. **This scope did not make that edit**; the file is on this scope's
protected list, no command run here writes to it, and it changed between two
consecutive read-only invocations while the concurrent session was active. It is
recorded here rather than reverted, because reverting another session's in-flight
work would be a worse error than reporting it.

### TP-02-29

Not executed.
