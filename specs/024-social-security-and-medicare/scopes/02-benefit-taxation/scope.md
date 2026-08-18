# Scope 2: Taxation Of Benefits

## 02-benefit-taxation

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Done with concerns
**Scope-Kind:** runtime-behavior
**Tags:** `engine:federal`, `supersession-heavy:true`, `year-invariance-gated:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01
**Foundation:** false

**Primary Outcome:** a household sees the provisional income the tool composed
from named parts, the base amounts it compared against, the tier that resulted and
the amount of its benefit that the federal return actually picks up — each with
the publication section behind it, and each carrying, where the publication served
another year's edition, that publication's own words establishing the figure does
not vary by year. This scope removes the first of the two ids that made the
marginal curve incomplete, and it converts the not-modeled accounting to its final
derived shape so the second removal in Scope 04 needs no further ledger entry.

## Requirement Coverage

- **FR-024-008** — provisional income is composed from the parts the source names,
  each published by name with its amount and its origin.
- **FR-024-009** — provisional income is a distinct measure from adjusted gross
  income and from the pack's modified adjusted gross measure, and reusing either is
  refused.
- **FR-024-010** — the inclusion tier is selected by comparing provisional income
  against sourced base amounts for the filing status, and the comparison performed
  is published.
- **FR-024-011** — the included amount is computed by the tier's own sourced
  arithmetic and is bounded by the sourced ceiling proportion of the benefit.
- **FR-024-012** — a base amount carried from another publication edition carries a
  written `yearInvarianceBasis` quoting the publication's own dating contrast for
  that component kind; without it the figure ships absent and the inclusion
  refuses.
- **FR-024-013** — `'taxable-social-security-benefits'` moves out of
  `unsupportedFeatures[]` into a modelled inclusion, and the accounting between the
  two is disjoint and exhaustive.
- **FR-024-014** — the included amount is a named contributor to ordinary taxable
  income, and the inclusion is surfaced in the headline, the comparison, the
  marginal curve and the export.

Inherited and re-asserted: **NFR-024-001** declared or sourced never conflated,
**NFR-024-002** zero network, **NFR-024-003** no household value in any URL or
request, **NFR-024-004** vocabulary and income-kind counts unchanged,
**NFR-024-005** no figure or authority name in any module, **NFR-024-006** leg
visibility, **NFR-024-007** no probability, **NFR-024-009** Feature 008
byte-identity, **NFR-024-010** no registration, **NFR-024-011** harness rules.

## Gherkin Scenarios

```gherkin
Scenario: SCN-024-004 Provisional income is composed from named parts and is not any other income measure
  Given declared other income, declared tax-exempt interest and a settled benefit
  When provisional income is computed
  Then it is composed from the parts the source names
  And each part appears by name with its amount and its origin
  And the record names the measures it is not, including the pack's modified adjusted gross measure
  And a composition that silently reused either of those measures is proven to fail

Scenario: SCN-024-005 The inclusion tier is selected at its exact sourced base amounts and the included amount is bounded by the sourced ceiling
  Given provisional incomes below the first sourced base amount, exactly at it, between the two, exactly at the second, and above it
  When the inclusion runs for each
  Then each lands in the tier the source states
  And each comparison is asserted at the exact sourced figure rather than near it
  And the included amount never exceeds the sourced ceiling proportion of the benefit
  And an implementation treating a comparison as strict where the source states inclusive is proven to fail

Scenario: SCN-024-006 A base amount from another publication edition is carried only on the publication's own contrast
  Given base amounts retrieved from a publication edition other than the declared tax year
  When the pack is authored
  Then a component kind is carried only with a written yearInvarianceBasis quoting the publication's own dating contrast
  And the basis and its locator are published beside the figures
  And a component kind lacking such a contrast ships as an AbsentFigure and the inclusion refuses
  And a basis recorded without a quoted contrast is proven to fail validation
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-024-004 composition | A settled benefit and declared other income | Open the inclusion panel | Each provisional income part by name, its amount, its origin, and the composed total labelled as a measure distinct from the others | e2e-ui |
| SCN-024-005 tier below | Provisional income below the first base amount | Open the inclusion panel | The tier naming that no benefit is included, the comparison performed shown with the exact base amount and its operator, and a reachable citation | e2e-ui |
| SCN-024-005 tier at boundary | Provisional income exactly at a base amount | Open the inclusion panel | The tier the source states for the exact figure, with the operator shown so the inclusivity is readable | e2e-ui |
| SCN-024-005 ceiling bound | Provisional income far above the second base amount | Open the inclusion panel | The included amount, the sourced ceiling proportion, and a statement that the ceiling bound the result | e2e-ui |
| SCN-024-006 invariance shown | Base amounts from another edition, contrast retrieved | Open the inclusion panel | Each base amount with its publication, its edition year, and the quoted contrast establishing it does not vary by year | e2e-ui |
| SCN-024-006 invariance absent | Base amounts retrieved, contrast not established | Open the inclusion panel | `RLTAX-THRESHOLD-UNAVAILABLE` naming the missing basis rather than the missing figure, with no tier assigned | e2e-ui |
| FR-024-013 ledger move | Any complete settlement | Open the not-modeled ledger | `Taxable Social Security benefits` is absent from the not-carried list and present as a modelled inclusion, and every other not-carried entry is unchanged | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The inclusion leg appears in the headline total, the comparison table, the curve contributor list and the export | e2e-ui |

## Implementation Files

### New

- `rltaxinclusion.js` — UMD module owning `composeProvisionalIncome`,
  `selectInclusionTier` and `computeIncludedBenefit`, every one a top-level
  `function name(...) {}` declaration.
- Fixture packs: one carrying complete base amounts with a quoted invariance
  basis, one carrying the same figures with the basis absent, one carrying a basis
  with no quoted contrast, one with deliberately non-standard base amounts, and
  one whose ceiling proportion binds on a small benefit.
- `lifetime-tax-inclusion.spec.mjs` — this scope's browser rows, in the
  repository's Playwright spec directory alongside the other `lifetime-tax-*`
  specs.

### Modified

- `rltaxrules.js` — `ProvisionalIncome/v1`, `BenefitInclusion/v1`, the
  `yearInvarianceBasis` validation extended to require a quoted contrast, and the
  `distinctFrom[]` refusal.
- `rltax.js` — stage `CO-21`, the inclusion leg, and the ordinary-taxable-income
  contributor.
- `rltaxworkspace.js` — the tax-exempt interest and other-income declarations the
  composition needs that the workspace does not already carry, plus their privacy
  surface.
- `tax-rules/federal/<year>.json` — the inclusion policy, the removal of
  `'taxable-social-security-benefits'` from `unsupportedFeatures[]`, and the
  `modifiedAdjustedGrossCompleteness` split.
- `lifetime-tax-strategy-lab.html` — the inclusion inputs and the `power-inclusion`
  section.
- `scripts/selftest.mjs` — one appended group, plus SUP-024-02, SUP-024-03,
  SUP-024-05 and SUP-024-08.
- `tests/lifetime-tax-marginal.spec.mjs` — SUP-024-04 only.

## Implementation Plan

1. Add `ProvisionalIncome/v1` with its `parts[]` and `distinctFrom[]` members.
   Validation refuses a composition whose total equals the pack's modified
   adjusted gross measure **by construction** — that is, one that reads that
   measure rather than composing the named parts — rather than one that merely
   happens to equal it arithmetically. The two are distinguished by inspecting
   which parts were summed, not by comparing totals.
2. Add `BenefitInclusion/v1` with `baseAmounts[]`, `comparisonsPerformed[]`,
   `ceilingProportion` and `ceilingBound`. Every comparison is published as
   `{ left, operator, right, result }` using Scope 01's exact-boundary record.
3. Extend the `yearInvarianceBasis` validation so a basis is valid only when it
   carries a **quoted contrast** from the publication with its own locator. A
   basis that is a bare assertion, a category name or a reference to another
   feature's finding is refused. This is the single validation this scope turns on
   and it is written before any figure is retrieved.
4. Author `rltaxinclusion.js`. Every pure analytic function is a top-level
   declaration; use `Number.isFinite`; no figure, percentage or publication name
   appears in the module.
5. **Retrieve `BI-6`.** Open the taxation publication, transcribe the parts that
   compose provisional income and the rule fixing how tax-exempt interest enters
   it, and record the composition rule with its locator. If the publication does
   not establish the joint-filer treatment, record the open question's answer as
   found and publish what was summed.
6. **Retrieve `BI-7`.** Transcribe the base amounts per filing status, the tier
   arithmetic and the ceiling proportion, verifying every digit against the page,
   and record each with its `componentKind`.
7. **Judge `BI-8` per component kind.** Read the publication for its own dating
   contrast. Where the publication's text establishes that a component kind does
   not vary by year, record a `yearInvarianceBasis` quoting that text with its
   locator. Where it does not, the component kind ships as an `AbsentFigure/v1`
   and the inclusion refuses **even though the figure was successfully
   retrieved**. That outcome is correct and this scope may not route around it.
8. Author the inclusion policy in the federal pack from the retrieved records
   only. No figure in `spec.md`, `design.md` or this file may be transcribed into
   it, and none of those documents contains one.
9. Implement `selectInclusionTier` so the tier is a returned record rather than a
   branch, and `computeIncludedBenefit` so the ceiling is applied from the sourced
   proportion and the binding is stated.
10. Add stage `CO-21` and the inclusion leg in `rltax.js`, and wire the included
    amount as a **named contributor to ordinary taxable income** rather than as a
    new income kind. `SUPPORTED_INCOME_KINDS` is unchanged and an assertion says so.
11. Remove `'taxable-social-security-benefits'` from the federal pack's
    `unsupportedFeatures[]` and prove the accounting between the not-carried set
    and the modelled inclusion is disjoint and exhaustive.
12. Split the `modifiedAdjustedGrossCompleteness.unmodeledAdjustments` entry that
    names Social Security and railroad retirement benefits together: railroad
    retirement is retained verbatim on the unmodelled side, and the Social Security
    inclusion is added to the modelled side. Under SUP-024-08 the replacement pins
    both halves verbatim.
13. Render the `power-inclusion` section. Bind every control through the
    declaration-signature no-op guard. Scope every assertion to `#power-inclusion`
    or `#simple`; use no unscoped `.first()`. The renderer reads only members the
    settlement publishes, so an absent base amount cannot abort `renderPower()`.
14. Deliver SUP-024-02, SUP-024-03, SUP-024-04, SUP-024-05 and SUP-024-08 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure). Write
    each replacement first and confirm it fails against the unchanged
    implementation before the behaviour changes.
15. Append a `lifetime-tax — social security benefit inclusion` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The `yearInvarianceBasis` validation | Tightened to require a quoted contrast | Every pack in Features 022, 023 and 024 | **Highest in this scope** — tightening a validation can retroactively refuse a figure a prior feature carried legitimately | Before tightening, assert every existing basis in every shipped pack against the new rule and record which pass; a prior basis that fails is a finding routed under ASC-8, never a silent loosening of the new rule | Revert the validation and the packs together |
| `rltaxrules.js` contract registry | Two contracts added | Scopes 04, 05 | High — a `distinctFrom[]` check that compares totals rather than composition would pass a measure that was copied | Assert a composition that reads the modified adjusted gross measure is refused even when its total differs from it | Remove both contracts |
| `rltax.js` ordinary taxable income | A named contributor added | Every federal figure in Features 021–023 | **High** — this changes a quantity every downstream rule reads | Assert Features 021, 022 and 023 fixtures produce their exact prior ordinary taxable income with no benefit declared, before the contributor is added | Remove the contributor |
| `tax-rules/federal/<year>.json` | Inclusion policy added, one id removed, completeness record split | The whole federal settlement and the not-modeled accounting | High — a removal with nothing modelled in its place is a silent loss of disclosure | SUP-024-02's replacement fails both halves when the id is deleted rather than moved | Revert the pack |
| The not-modeled accounting | Converted to a derived, disjoint, exhaustive form | Scope 04's second removal | Medium — the point of deriving it is that Scope 04 needs no further entry | Assert the derived accounting absorbs a second simulated removal without an edit | Revert to the literal |
| `scripts/selftest.mjs` | One group appended plus four markers | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the four markers |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxinclusion.js` · this scope's fixture packs ·
`lifetime-tax-inclusion.spec.mjs`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`tax-rules/federal/<year>.json` · `lifetime-tax-strategy-lab.html` ·
`scripts/selftest.mjs` (append, plus SUP-024-02, SUP-024-03, SUP-024-05 and
SUP-024-08) · `tests/lifetime-tax-marginal.spec.mjs` (SUP-024-04 only).

`tests/lifetime-tax-marginal.spec.mjs` is allowed **because** the
[per-file marker distribution](../design.md#per-file-marker-distribution) places
this scope's SUP-024-04 in it. No other prior-feature test file is opened.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `specs/023-*/**` · `rltaxsocialsecurity.js` ·
`rltaxstrategy.js` · `rltaxstate.js` · `rltaxcombined.js` · `rltaxproperty.js` ·
`rltaxrental.js` · `rltaxuse.js` · `rltaxdisposition.js` · `tax-rules/state/**` ·
`tax-rules/property/**` · `tax-rules/benefit/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `briefs/**` ·
`data/**` · `watchlist.json` · `site-exclusions.json` ·
`scripts/build-pages-site.mjs` · `scripts/validate-spec-test-paths.baseline` ·
every `tests/lifetime-tax-*.spec.mjs` except this scope's new file and
`tests/lifetime-tax-marginal.spec.mjs` · `tests/lifetime-tax.support.mjs` · every
framework-managed file.

`rltaxsocialsecurity.js` and `tax-rules/benefit/**` are excluded deliberately.
Taxing a benefit must not require changing what the benefit is; if it does, the
two scopes are one scope.

**Rollback:** delete `rltaxinclusion.js` and the fixtures; revert the two
contracts, the tightened invariance validation, stage `CO-21`, the inclusion leg,
the ordinary-taxable-income contributor and the workspace members; revert the
federal pack's inclusion policy, its `unsupportedFeatures[]` removal and its
completeness split; revert the page section; revert the five supersession
replacements to their superseded clauses.

## Assertion Supersession Owned By This Scope

Five entries: **SUP-024-02**, **SUP-024-03**, **SUP-024-04**, **SUP-024-05** and
**SUP-024-08**. Each is caused by a deliberate change this scope's requirement
coverage names: FR-024-013 moves an id out of the not-modeled ledger, which breaks
one selftest literal, one selftest surgical-removal triple and one browser-side
triple; FR-024-010 and FR-024-011 insert a top-level pack member, which breaks
Feature 023's declared-additions partition; and FR-024-010 models half of a
completeness entry that names two things.

Four of the five replacements are derived, so Scope 04's second id removal and
Scope 04's own pack member are absorbed without further entries. That absorption
is the point: this feature has watched four literal-count supersessions accumulate
across three predecessors, and every one of them was a literal that a later scope
had to hand-edit — an edit indistinguishable from one hiding a real regression.

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside these five that fails is either a defect in this
scope's change and is fixed, or an ASC-8 admission recorded across all four
surfaces before the edit.

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** a fixture pack whose base amounts
were retrieved from another edition year and whose `yearInvarianceBasis` carries
no quoted contrast must be **refused**, and the inclusion must return
`RLTAX-THRESHOLD-UNAVAILABLE` naming the missing basis rather than the missing
figure. Before the tightened validation exists the pack validates, the tier is
assigned and the assertion fails on the presence of a tier — which is exactly the
assumed-invariance defect this scope exists to prevent. A syntax error, a missing
browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Contract | unit | SCN-024-004 | `scripts/selftest.mjs` | `ProvisionalIncome/v1` publishes every part by name with its amount and origin, and `distinctFrom[]` names the pack's modified adjusted gross measure and adjusted gross income | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Adversarial | unit | SCN-024-004 | `scripts/selftest.mjs` | Regression: a composition that reads the pack's modified adjusted gross measure is refused even when its total differs from it, proving the check inspects composition rather than comparing totals | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Known value | unit | SCN-024-005 | `scripts/selftest.mjs` | Against a fixture pack with deliberately non-standard base amounts, provisional incomes below, exactly at, between, exactly at the second and above each land in the tier the pack states | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Adversarial | unit | SCN-024-005 | `scripts/selftest.mjs` | Regression: an implementation treating a comparison as strict where the pack's `operator` states inclusive is proven to fail at the exact figure, at both base amounts | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Known value | unit | SCN-024-005 | `scripts/selftest.mjs` | The included amount never exceeds the sourced ceiling proportion of the benefit, asserted on a fixture where the ceiling binds and one where it does not, with `ceilingBound` stating which | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Adversarial | unit | SCN-024-005 | `scripts/selftest.mjs` | Regression: an implementation applying a recalled ceiling proportion is proven to fail against the non-standard fixture | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Invariance | unit | SCN-024-006 | `scripts/selftest.mjs` | A `yearInvarianceBasis` is valid only with a quoted contrast and its own locator; a bare assertion, a category name and a reference to another feature's finding are each refused | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Invariance | unit | SCN-024-006 | `scripts/selftest.mjs` | A retrieved base amount whose component kind has no established contrast ships as an `AbsentFigure` and the inclusion refuses `RLTAX-THRESHOLD-UNAVAILABLE` naming the missing basis rather than the missing figure | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Regression | unit | SCN-024-006 | `scripts/selftest.mjs` | Regression: every `yearInvarianceBasis` already shipped by Features 022 and 023 is re-validated against the tightened rule and each result is recorded, so a retroactive refusal is a finding rather than a surprise | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Sourcing | unit | SCN-024-006 | `scripts/selftest.mjs` | Every value-bearing member of the inclusion policy resolves to exactly one retrieved source with a locator and a `retrievedAt`, and every unretrieved member is an `AbsentFigure` with a `missingSource` pointer and no smuggled numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Ledger move | unit | SCN-024-006 | `scripts/selftest.mjs` | `'taxable-social-security-benefits'` is absent from `unsupportedFeatures[]` and present as the modelled inclusion the pack's tier declaration carries, and the accounting between the two is disjoint and exhaustive | `node scripts/selftest.mjs` | No | `report.md#tp-02-11` |
| TP-02-12 | Adversarial | unit | SCN-024-006 | `scripts/selftest.mjs` | Regression: deleting the id with nothing modelled in its place fails both halves of the accounting, and every other not-carried id is asserted still named | `node scripts/selftest.mjs` | No | `report.md#tp-02-12` |
| TP-02-13 | Income kind | unit | SCN-024-005 | `scripts/selftest.mjs` | The included amount is a named contributor to ordinary taxable income, the supported income-kind count is unchanged, and the pack's `incomeKinds` member is unchanged | `node scripts/selftest.mjs` | No | `report.md#tp-02-13` |
| TP-02-14 | Non-regression | unit | SCN-024-004 | `scripts/selftest.mjs` | With no benefit declared, the Features 021 through 023 fixtures produce their exact prior ordinary taxable income and their exact prior total, proving the contributor is additive | `node scripts/selftest.mjs` | No | `report.md#tp-02-14` |
| TP-02-15 | Completeness split | unit | SCN-024-006 | `scripts/selftest.mjs` | The completeness record names railroad retirement benefits alone on the unmodelled side, verbatim as to that half, and names the Social Security inclusion on the modelled side; deleting the entry outright is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-02-15` |
| TP-02-16 | Leg visibility | unit | SCN-024-005 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the settled record's declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export, in both directions, with the inclusion leg present | `node scripts/selftest.mjs` | No | `report.md#tp-02-16` |
| TP-02-17 | Adversarial | unit | SCN-024-005 | `scripts/selftest.mjs` | Regression: removing the inclusion leg from each of the four surfaces in turn is proven to fail, and each failure names both the leg and the surface | `node scripts/selftest.mjs` | No | `report.md#tp-02-17` |
| TP-02-18 | Privacy | unit | SCN-024-004 | `scripts/selftest.mjs` | Every declaration this scope adds is inventoried, cleared, redacted and absent from every URL, request, referrer and console message, and the declared storage key count is asserted unchanged in the same assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-18` |
| TP-02-19 | Render safety | unit | SCN-024-006 | `scripts/selftest.mjs` | With each inclusion member absent in turn, every Power section still renders, proving the renderer reads only published members and one absent figure cannot abort `renderPower()` | `node scripts/selftest.mjs` | No | `report.md#tp-02-19` |
| TP-02-20 | Supersession | unit | SCN-024-006 | `scripts/selftest.mjs` | SUP-024-02, SUP-024-03, SUP-024-05 and SUP-024-08 each carry their marker, each replacement derives from the artifact it describes, each superseded clause is recorded verbatim, and each is proven to have failed first | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-02-21 | Supersession | e2e-ui | SCN-024-006 | `lifetime-tax-marginal.spec.mjs` | SUP-024-04's replacement reads the not-carried contributor set from the pack and asserts two-directional identity with the rendered domain set, absorbing a second simulated removal without an edit | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "marginal" --reporter=list` | Yes | `report.md#supersession-ledger` |
| TP-02-22 | Regression E2E | e2e-ui | SCN-024-004 | `lifetime-tax-inclusion.spec.mjs` | `Regression: SCN-024-004 provisional income shows every part by name with its origin and names the measures it is not` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-004 provisional income shows every part by name with its origin and names the measures it is not" --reporter=list` | Yes | `report.md#scenario-scn-024-004` |
| TP-02-23 | Regression E2E | e2e-ui | SCN-024-005 | `lifetime-tax-inclusion.spec.mjs` | `Regression: SCN-024-005 the tier is selected at the exact base amount with its operator shown and the ceiling binding is stated` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-005 the tier is selected at the exact base amount with its operator shown and the ceiling binding is stated" --reporter=list` | Yes | `report.md#scenario-scn-024-005` |
| TP-02-24 | Regression E2E | e2e-ui | SCN-024-006 | `lifetime-tax-inclusion.spec.mjs` | `Regression: SCN-024-006 a base amount from another edition shows its quoted contrast and one without a contrast refuses naming the missing basis` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-006 a base amount from another edition shows its quoted contrast and one without a contrast refuses naming the missing basis" --reporter=list` | Yes | `report.md#scenario-scn-024-006` |
| TP-02-25 | Leg visibility E2E | e2e-ui | SCN-024-005 | `lifetime-tax-inclusion.spec.mjs` | `Regression: SCN-024-005 the inclusion leg reaches the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-005 the inclusion leg reaches the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-02-25` |
| TP-02-26 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-*, SCN-024-001 … -006 | The prior features' specs plus this scope's | The cumulative browser suite over the real route | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list` | Yes | `report.md#tp-02-26` |
| TP-02-27 | Repo gate | unit | SCN-024-004 … -006 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-02-27` |
| TP-02-28 | Path guard | unit | SCN-024-004 … -006 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-02-28` |
| TP-02-29 | Deploy gate | unit | SCN-024-004 … -006 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-02-29` |

### Definition of Done

A row is checked only when it is genuinely satisfied and was observed to be
satisfied. A row that is not satisfied stays `[ ]` and carries a stated reason. If
delivery makes a row's claim false, the row is corrected rather than checked.

- [x] FR-024-008 and FR-024-009 are implemented: provisional income publishes every
      part by name with its origin, names the measures it is not, and a composition
      that reads the pack's modified adjusted gross measure is refused even when its
      total differs from it.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-01`, `report.md#tp-02-02`
- [x] FR-024-010 and FR-024-011 are implemented: the tier is a returned record, each
      comparison is asserted at the exact sourced figure with the source's own
      operator, and the included amount is bounded by the sourced ceiling with the
      binding stated.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-03`, `report.md#tp-02-04`, `report.md#tp-02-05`, `report.md#tp-02-06`
- [x] FR-024-012 is implemented: a `yearInvarianceBasis` is valid only with a quoted
      contrast and its own locator, and a component kind without one ships absent and
      the inclusion refuses naming the missing basis rather than the missing figure.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-07`, `report.md#tp-02-08`
- [x] Tightening the invariance validation did not retroactively refuse a basis a
      prior feature carried legitimately, **because the tightened rule governs the
      figure-level basis surface this scope introduces and the record-level rule
      Features 022 and 023 ship under is unchanged**; every existing basis was
      re-validated against the new rule and each result recorded, and the seven
      narrative bases that do not satisfy the structured form are a recorded finding
      rather than a loosening of the new rule.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-09`
- [x] `BI-6`, `BI-7` and `BI-8` were closed by retrievals performed in the
      implementation session, each verified digit by digit against the retrieved
      page and recorded with its own `retrievedAt` and locator, with the edition
      year judged per component kind — or the affected member ships as an
      `AbsentFigure/v1` and the inclusion refuses, **including the case where the
      figure was retrieved and only its invariance basis was not**.
  - **Phase:** implement · **Command:** the retrieval records in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-02-10`
- [x] FR-024-013 is implemented: the id is absent from the not-carried set and
      present as the modelled inclusion, the accounting is disjoint and exhaustive,
      deleting the id with nothing in its place is proven to fail, and every other
      not-carried id is asserted still named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-11`, `report.md#tp-02-12`
- [x] The completeness record's split is delivered: railroad retirement retained
      verbatim on the unmodelled side, the Social Security inclusion named on the
      modelled side, and deleting the entry outright proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-15`
- [x] NFR-024-004 holds and no income kind was added: the included amount is a named
      contributor to ordinary taxable income, both counts equal their pre-feature
      values, and the pack's `incomeKinds` member is unchanged.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-13`
- [x] The contributor is additive: with no benefit declared, the Features 021
      through 023 fixtures produce their exact prior ordinary taxable income and
      their exact prior total.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-14`
- [ ] FR-024-014 and NFR-024-006 are implemented: the inclusion leg is surfaced in
      all four places, proven by a two-directional set identity against the
      all-non-zero fixture, and removing it from each surface in turn is
      demonstrated to fail with both the leg and the surface named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-02-16`, `report.md#tp-02-17`, `report.md#tp-02-25`
  - **Not satisfied.** Stage `CO-21`, the `social-security-inclusion` leg and the
    `power-inclusion` Power section are delivered and the leg reaches the Power
    surface, but the leg is not yet carried into the headline, the comparison or the
    export, and no two-directional leg-visibility identity was run for it. Closing
    this needs the leg added to `settledLegIds` and to the three remaining surfaces,
    plus TP-02-16, TP-02-17 and TP-02-25.
- [x] NFR-024-003 holds: **this scope adds no household declaration** — the
      composition reads members the workspace already inventories — the declared
      storage key count is asserted unchanged in the same assertion that asserts it,
      and no household value reaches any URL, request, referrer or console message.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser request-ledger rows · **Evidence:** `report.md#tp-02-18`
- [x] The `power-inclusion` renderer reads only members the settlement publishes,
      proven by refusing wholesale with each inclusion member absent in turn so no
      partly-built record ever reaches it. **This scope adds no control**, so the
      declaration-signature no-op guard is inherited unchanged rather than extended.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-19`
- [ ] SUP-024-02, SUP-024-03, SUP-024-04, SUP-024-05 and SUP-024-08 are delivered
      with their markers, each replacement derived from the artifact it describes,
      each superseded clause recorded verbatim, and each intended-RED failure
      recorded before its green.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the marginal browser spec · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-02-20`, `report.md#tp-02-21`
  - **Partially satisfied.** All five replacements are delivered, derived and marked,
    and the marginal browser spec passes. Intended-RED was **observed** for
    SUP-024-02, SUP-024-03 and SUP-024-05 (three named selftest failures before the
    replacements were written); SUP-024-08 is a new pinning assertion, which the
    ledger entry itself anticipates. SUP-024-04's browser RED was **not separately
    observed** — the superseded literal was replaced without first running the
    marginal spec against it.
- [x] Every excluded path is byte-identical, including `rltaxsocialsecurity.js` and
      `tax-rules/benefit/**`, proving that taxing a benefit did not require changing
      what the benefit is.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, a plan success figure, a future-year figure, a
      track record or an error rate, and no included amount is presented as an
      estimate or a typical proportion.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence recorded,
      including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-02-01 through TP-02-29 commands · **Evidence:** `report.md#test-evidence`
  - **Not satisfied.** TP-02-01 through TP-02-15 and TP-02-18 through TP-02-21 are
    delivered green. TP-02-16, TP-02-17 and TP-02-22 through TP-02-26 are not
    delivered: `lifetime-tax-inclusion.spec.mjs` was not authored and the
    leg-visibility identity was not run. Intended RED is recorded for the four
    supersession sites only, not per Test Plan row.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-02-27`, `report.md#tp-02-28`, `report.md#tp-02-29`
