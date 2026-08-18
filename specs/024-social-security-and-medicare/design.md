# Design: 024 Social Security And Medicare (Slice 4)

Feature directory: `specs/024-social-security-and-medicare`
Specification: [`spec.md`](spec.md) · Planning: [`scopes/_index.md`](scopes/_index.md)
Predecessor design: [`specs/023-property-tax-and-rental-income/design.md`](../023-property-tax-and-rental-income/design.md)

---

## Design Brief

### Current State

Features 021 through 023 settle federal income tax with per-component provenance,
two threshold surtaxes, two state income-tax packs, a property-tax leg, a composed
itemized deduction, a rental settlement and a disposition. The federal pack's
`unsupportedFeatures[]` names `taxable-social-security-benefits` and
`irmaa-bands`, both flagged `movesMarginalRate`, and the marginal curve reports
itself incomplete because of them. `taxLegs[]` carries four legs and every one of
them has `includedInTotal: true`, so the reconciliation identity that excludes
non-included legs has never had a leg to exclude.

### Target State

Four new engine modules and three new pack families, composed into the existing
settlement rather than beside it. The federal pack gains an inclusion policy and a
medicare policy. The leg set gains four legs, three of which are costs. The route
gains four Power sections and three Simple fields. Two entries leave the
not-modeled ledger by being modelled.

### Patterns To Follow

- The pack seam from Feature 022: no module names a jurisdiction, an authority, a
  rate or a threshold. Everything is a pack field.
- The provenance model from Feature 022: `ComponentSource/v1` and
  `SourceRecord/v2`, reused unchanged, including `componentKind` and
  `yearInvarianceBasis`.
- The refusal discipline from Feature 021: `AbsentFigure/v1` with a
  `missingSource` pointer and no smuggled numeric member.
- The leg model from Feature 022 Scope 02: legs are pack-declared and summed from
  the declared set, never from a hardcoded list.
- The structural-independence pattern from Feature 023 Scope 01:
  `computePropertyTax` takes no income figure through any parameter. The
  adjustment resolver takes the same treatment against a figure that is not merely
  irrelevant but confusable.
- The published-record pattern from Feature 023 Scope 04: a classification is a
  returned record carrying the parameters and the comparison that produced it,
  never an inline branch. The inclusion tier and the adjustment bracket are both
  that shape.

### Patterns To Avoid

- A precedence rule between the two benefit-basis origins. Two declarations is an
  ambiguity, not an input to be resolved.
- A current-year income figure anywhere in the adjustment's reach — as a
  parameter, as a member of a parameter, or captured in a closure.
- A percentage applied inline for the inclusion. The tier is a published record.
- A premium summed into any tax total, and `includedInTotal: false` used to carry
  an absent figure past a refusal.
- A member renamed until a forbidden-token scan stops firing. Forbidden by ASC-9.
- An invariance basis asserted from a figure's category rather than quoted from
  the publication.

---

## Module Boundaries And File Surface

### New files

| File | Owner scope | Contents |
| --- | --- | --- |
| `rltaxsocialsecurity.js` | 01 | `BenefitBasis/v1`, `ClaimAgeAdjustment/v1`, `resolveBenefitBasis`, `computePrimaryInsuranceAmount`, `resolveFullRetirementAge`, `applyClaimAgeAdjustment` |
| `rltaxinclusion.js` | 02 | `ProvisionalIncome/v1`, `BenefitInclusion/v1`, `composeProvisionalIncome`, `selectInclusionTier`, `computeIncludedBenefit` |
| `rltaxclaimage.js` | 03 | `MortalityBasis/v1`, `ClaimAgeComparison/v1`, `resolveMortalityBasis`, `cumulativeBenefitTotal`, `cumulativeParityAge` |
| `rltaxmedicare.js` | 04 | `LookbackMagi/v1`, `AdjustmentBracket/v1`, `PremiumRecord/v1`, `resolveAdjustmentBracket`, `computePremiumLegs`, `annualMedicareCost` |
| `tax-rules/benefit/<year>.json` | 01 | Bend points, the full-retirement-age table, reduction factors, the delayed credit rate and stopping age, and the indexing series reference |
| `tax-rules/mortality/<year>.json` | 03 | The period life table's life-expectancy column, and nothing else |
| `tax-rules/medicare/<year>.json` | 04 | Standard premiums, adjustment brackets per filing status, and the declared lookback offset |
| Fixture packs | 01, 02, 03, 04 | Branch coverage independent of any real authority, including a fixture carrying a probability member that must be refused |
| `lifetime-tax-benefit.spec.mjs` | 01 | Scope 01's browser rows, under the repository's Playwright spec directory |
| `lifetime-tax-inclusion.spec.mjs` | 02 | Scope 02's browser rows, same directory |
| `lifetime-tax-claim-age.spec.mjs` | 03 | Scope 03's browser rows, same directory |
| `lifetime-tax-medicare.spec.mjs` | 04 | Scope 04's browser rows, same directory |
| `lifetime-tax-retirement-route.spec.mjs` | 05 | Scope 05's browser rows, same directory |

### Existing files edited

| File | Scopes | Why |
| --- | --- | --- |
| `rltaxrules.js` | 01, 02, 03, 04 | New contracts, the widened pack grammar, the mortality probability refusal |
| `rltax.js` | 01, 02, 03, 04, 05 | New calculation-order stages, the ordinary-taxable-income contributor, leg-set growth, the annual Medicare cost |
| `rltaxworkspace.js` | 01, 02, 03, 04 | Benefit, inclusion, claim-age and lookback declarations plus their privacy surface |
| `tax-rules/federal/<year>.json` | 02, 04 | The inclusion policy, the medicare policy, and the two `unsupportedFeatures[]` removals |
| `rltaxstrategy.js` | 04 | The corrected `medicare-and-irmaa` reason only |
| `lifetime-tax-strategy-lab.html` | 01, 02, 03, 04, 05 | Inputs, Power sections, Simple fields, leg surfacing, the export |
| `scripts/selftest.mjs` | 01, 02, 03, 04, 05 | One appended group per scope, plus this feature's superseded assertions |
| `tests/lifetime-tax-marginal.spec.mjs` | 02 | SUP-024-04 only |

### Dependency direction

`rltaxrules.js` depends on nothing. `rltaxsocialsecurity.js`, `rltaxinclusion.js`
and `rltaxmedicare.js` depend on `rltaxrules.js` only. `rltaxclaimage.js` depends
on `rltaxrules.js` and `rltaxsocialsecurity.js`. `rltax.js` composes all of them.
No new module imports `rltax.js`, so no cycle is possible and each new module is
testable without the settlement.

`rltaxmedicare.js` does **not** import `rltax.js`, does not receive a workspace,
and does not receive a settlement. That absence is what makes FR-024-023
structural rather than conventional.

### Harness constraints

Every new module is UMD — a global attach plus `module.exports` — loads from
`file://`, and issues no request. Every pure analytic function is a top-level
`function name(...) {}` declaration, because `scripts/selftest.mjs` extracts them
by brace-matching and an arrow const is silently never extracted and therefore
silently never tested. `Number.isFinite` is used rather than the bare global. No
canvas drawing is wrapped in `requestAnimationFrame`, which does not fire in a
background tab. The `.spec.mjs` browser files are legitimately ESM and are the
only ESM this feature adds.

---

## Capability Foundation

Scope 01 is the foundation. It introduces the two-origin declaration model that
every later scope reads through, and the sourced-table lookup shape that the full
retirement age, the reduction factors, the delayed credit, the mortality table and
the adjustment brackets all satisfy.

### Foundation contracts

- The two-origin basis, with a closed `basisOrigin` set, no precedence, and two
  independently failing retrieval paths.
- The **sourced row lookup**: a table keyed by a declared value, where a
  declaration outside the table's own declared domain refuses rather than using an
  adjacent row. Reused unchanged by Scopes 03 and 04.
- The **exact-boundary comparison record**: every threshold comparison is
  published as `{ left, operator, right, result }` so inclusivity is inspectable
  and boundary cases are assertable at the exact figure. Reused from Feature 023's
  `UseClassification/v1` rather than re-invented.

### Extension points

- A new sourced table is a new pack member with a declared domain. No module
  changes.
- A new basis origin is a new enum member plus one engine branch on the member,
  never on the presence or absence of a declaration.

### Variation axes exercised by the two basis origins

| Axis | `declared-statement-pia` | `computed-from-earnings` |
| --- | --- | --- |
| Provenance | Declared; no `sourceRef`; labelled the household's own input | Computed; every parameter sourced and cited |
| Retrieval dependency | None | The bend points and the indexing series, which fail independently |
| Failure mode | The household has not supplied it | The pack could not establish a rule |
| Refusal code | `RLTAX-INPUT-INCOMPLETE` | `RLTAX-THRESHOLD-UNAVAILABLE` |

Two origins on opposite ends of the provenance axis is what makes the contract a
contract. A single origin with an optional computation would be one path's
arithmetic wearing a contract's clothes.

---

## Contracts

### `BenefitBasis/v1`

`{ contractVersion, basisOrigin, primaryInsuranceAmountMonthly, earningsRecord?, indexedEarnings?, bendPointsApplied?, sourceRecords[], origin }`

`basisOrigin` is a member of the closed set `declared-statement-pia` ·
`computed-from-earnings`. Under the declared origin the contract carries no
`sourceRef` on the amount and validation refuses one; `earningsRecord`,
`indexedEarnings` and `bendPointsApplied` are absent rather than empty. Under the
computed origin every bend point and percentage carries a `ComponentSource/v1`.
Neither, and both, refuse `RLTAX-INPUT-INCOMPLETE` — the second naming the
ambiguity rather than choosing.

### `ClaimAgeAdjustment/v1`

`{ contractVersion, birthYear, fullRetirementAge, claimAge, monthsEarly, monthsDelayed, factorsApplied[], adjustedMonthlyBenefit, adjustedAnnualBenefit, comparisonsPerformed[], sourceRecords[], ruleStatus }`

`factorsApplied[]` records each sourced factor, the month count it applied to and
its citation, so a record can be re-derived without the module.
`fullRetirementAge` is read from the sourced table row for `birthYear`; a
`birthYear` outside the table's declared domain produces an `AbsentFigure/v1` and
the adjustment refuses. `monthsDelayed` is bounded by the sourced stopping age and
the bound is published rather than applied silently.

### `ProvisionalIncome/v1`

`{ contractVersion, parts[], total, measureId: "provisional-income", distinctFrom[], sourceRef, locator }`

`parts[]` names each contributor with its amount and its origin.
`distinctFrom[]` names the measures this one is not — the pack's adjusted gross
income and its `modifiedAdjustedGrossCompleteness` measure — and validation
refuses a composition whose total equals either of them by construction rather
than by arithmetic coincidence.

### `BenefitInclusion/v1`

`{ contractVersion, provisionalIncome, baseAmounts[], tier, comparisonsPerformed[], includedAmount, ceilingProportion, ceilingBound, sourceRecords[], ruleStatus }`

`baseAmounts[]` holds the sourced figures for the filing status, each with its
citation, its `componentKind` and — where the edition year differs from the
declared tax year — its `yearInvarianceBasis`. `comparisonsPerformed[]` records
each comparison as `{ left, operator, right, result }`. `ceilingBound` states
whether the sourced ceiling proportion bound the result. A base amount that is an
`AbsentFigure` refuses the inclusion; no tier is assigned.

### `MortalityBasis/v1`

`{ contractVersion, tableId, tableYear, lifeExpectancyByAge[], sourceRef, locator }`

The contract carries the life-expectancy column and nothing else. Validation
**refuses** any member whose name or declared kind indicates a probability, a
survivorship count or a hazard, because carrying one would put a probability into
a tool that states it publishes none. A pack offering one is refused
`RLTAX-PACK-INVALID` naming the member.

### `ClaimAgeComparison/v1`

`{ contractVersion, claimAges[], perAge[], parityAges[], mortalityBasisRef, resultKindStatement, selectsNothingStatement }`

`perAge[]` is in declared order, never sorted by any figure, and each entry
carries the adjusted annual benefit, the whole-year count to the life-expectancy
age and the cumulative total. `parityAges[]` records, for each pair, the two claim
ages by name and the age at which their cumulative totals are equal.
`resultKindStatement` is the record's own text saying the figures are arithmetic
over declared figures rather than a prediction. `selectsNothingStatement` is the
record's own text saying it selects nothing. An exhaustive enumeration of every
member name in the record must contain no forbidden token.

### `LookbackMagi/v1`

`{ contractVersion, lookbackYear, modifiedAdjustedGrossIncome, origin: "declared" }`

Every member is declared. The contract carries no `sourceRef` and validation
refuses one. It carries no reference to the settled year, no workspace handle and
no settlement handle, so the object itself cannot smuggle a current-year figure
into the resolver.

### `AdjustmentBracket/v1`

`{ contractVersion, bracketIndex, filingStatus, lowerBound, upperBound, boundaryOperator, partBAdjustment, partDAdjustment, sourceRecords[] }`

`boundaryOperator` is the sourced inclusivity, so the exact-boundary case is
decided by the source rather than by a convention. A filing status the source does
not enumerate ships as an `AbsentFigure/v1` rather than borrowing an adjacent
status's amounts.

### `PremiumRecord/v1`

`{ contractVersion, partId, standardPremiumMonthly, adjustmentMonthly, totalMonthly, totalAnnual, includedInTotal: false, sourceRecords[] }`

`partId` is a member of the closed set `part-b` · `part-d`. `includedInTotal` is
structurally `false`. A record whose `standardPremiumMonthly` or
`adjustmentMonthly` is an `AbsentFigure` is refused rather than shipped, because
the pack contract already refuses an `includedInTotal: false` leg whose figure is
absent and this feature does not weaken that.

---

## Calculation Order

The federal ordered array gains five stages, appended after Feature 023's stages
and before the total. Each is derived from the pack and the workspace, never from
a constant list.

| Stage | Owner scope | What it does |
| --- | --- | --- |
| `CO-20` | 01 | Resolve the benefit basis from its declared origin, read the full retirement age, apply the reduction or the credit, produce the adjusted annual benefit |
| `CO-21` | 02 | Compose provisional income, select the inclusion tier, compute the included amount, contribute it to ordinary taxable income |
| `CO-22` | 04 | Resolve the adjustment bracket from the declared lookback alone, produce the three premium legs and the annual Medicare cost |
| `CO-23` | 03 | Run the claim-age comparison across the declared claim ages on the sourced mortality basis |
| `CO-24` | 05 | Compose the surfacing: the leg census across four surfaces, the Simple field set, the export sanitizer |

`CO-21` follows `CO-20` because provisional income needs a settled benefit.
`CO-22` follows `CO-21` in the array but takes **no input from it** — the ordering
is positional and the independence is structural, which is exactly the property
FR-024-023 requires and a positional ordering alone would not give. `CO-23`
follows `CO-21` because the comparison reports the after-inclusion figure at each
claim age. `CO-24` is last because a census cannot run before the legs exist.

Reconciliation gains legs `L12` (Social Security inclusion), `L13` (Part B
premium), `L14` (Part D premium) and `L15` (income-related adjustment). `L13`,
`L14` and `L15` are declared with `includedInTotal: false`.

### The `L4` exclusion clause becomes non-vacuous

`rltax.js` reconciliation identity `L4` reads *the sum of every declared leg whose
`includedInTotal` is true equals `totalFederalTax`*. Every leg shipped before this
feature has `includedInTotal: true`, so the filter has never removed anything and
the clause has never been exercised. Scope 04 gives it three legs to exclude.

This is not a supersession — the identity is unchanged and still passes. It is a
**vacuity repair**, and it is treated with the same rigour ASC-7 applies to a
retained branch: Scope 04 carries a DoD row requiring an assertion that the filter
actually removed three legs, that `totalFederalTax` differs from the sum over all
declared legs, and that a mutation flipping any premium leg to
`includedInTotal: true` is demonstrated to fail.

---

## Leg Visibility

This section is inherited from Feature 023 and is extended by one clause.

**The rule.** For every leg in the settled record, four surfaces must carry it:
the headline total, the comparison table, the marginal curve's contributor set,
and the export. The check is a **set identity between the record's declared legs
and each surface's rendered legs, in both directions**, asserted against a fixture
in which **every leg is non-zero and mutually distinct**, and reported by naming
both the missing leg and the failing surface.

**The new clause.** Surfacing a leg and summing a leg are different obligations
and this feature is the first to separate them. A cost leg must appear on all four
surfaces and in no tax total. The census therefore asserts membership on the
surfaces and non-membership in `totalFederalTax`, and a leg that satisfies one and
fails the other is reported as such rather than as a numeric mismatch.

**Why the fixture matters more than the assertion.** A zero leg passes an addition
check whether or not it was added. The leg-visibility fixture assigns each leg a
distinct non-zero value, so omitting any one changes the headline by an amount
unique to that leg. This feature extends that fixture with its four legs, and
gives the three cost legs values distinct from each other and from every tax leg,
so a premium accidentally summed into the tax total changes the total by an
identifiable amount.

**The headline.** The headline renders `totalFederalTax`. It does not render
`ordinaryTax`, `preferentialTax`, `netInvestmentIncomeTax`, `additionalMedicareTax`
or any other single leg. A Feature 022 defect rendered `ordinaryTax` there, hid
the preferential and surtax legs and understated tax owed by up to eighty-eight
percent, latent because the hidden legs were zero in the fixture that covered it.
The annual Medicare cost is rendered as a **separate figure beside** the headline
and is visibly not part of it.

---

## Route Rendering Hazards

These are known defect classes in this page. Each is a design constraint, not a
review note.

| Hazard | What happens | The constraint |
| --- | --- | --- |
| Render-detach | Binding a control to both `input` and `change` with an unconditional `render()` detaches the node mid-interaction, so clicks and focus silently fail | A declaration-signature no-op guard already exists and every control this feature adds routes through it. The guard is preserved, and an assertion proves a re-render with an unchanged signature performs no DOM replacement |
| Renderer throw | A throw inside `renderPower()` aborts the whole Power render, so one absent member removes every section after it | Every renderer reads only members the settlement actually publishes, and a fixture settlement with each new member absent in turn is asserted to render every Power section |
| Stale or hidden node | Simple is `display:none` in Power, and `applyDisplayMode` rebuilds only Power, so a `.first()` query can resolve to a hidden or stale node | Every assertion scopes its query to the surface it means — `#simple ...` or `#power-<section> ...` — and no assertion in this feature uses an unscoped `.first()` |
| Destructive census ordering | The leg census removes a leg from the first declared surface, which document order makes the headline inside `#simple`, and Simple is not rebuilt on a mode switch | Every Simple assertion runs before the destructive census probe, and the probe is last and carries a comment saying why |
| Silent test loss | The selftest extractor lifts pure functions by brace-matching top-level `function name(...) {}` declarations, so an arrow const is never extracted and never tested | Every pure analytic function in this feature's four modules is a top-level declaration, and SUP-024-01's derived replacement fails by module name when a module contributes none |

---

## Refusal Conditions Folded Into Existing Members

This feature adds no refusal code. Six candidate conditions were considered and
each is folded, named individually so a later reader can tell a considered fold
from an unexamined one.

| Candidate | Folded into | Why |
| --- | --- | --- |
| Neither benefit-basis origin declared, or both declared | `RLTAX-INPUT-INCOMPLETE` | Both are the existing condition: the household has not supplied a usable declaration set, and the remediation is to supply exactly one |
| An unretrieved bend point, full-retirement-age row, reduction factor, credit rate, base amount, life-expectancy figure, premium or bracket boundary | `RLTAX-THRESHOLD-UNAVAILABLE` | Exactly the existing condition: a sourced rule the pack could not establish |
| A retrieved figure from another edition year with no quoted invariance contrast | `RLTAX-THRESHOLD-UNAVAILABLE` | The blocking object is the missing basis, which leaves the pack without an establishable rule for the declared year — the same condition, reached by a different route |
| A mortality pack offering a probability-bearing member | `RLTAX-PACK-INVALID` | The pack violates the contract's declared shape, which is what that member already means |
| A declared lookback year that is not the premium year minus the pack's offset | `RLTAX-PACK-YEAR-MISMATCH` | A declared year that disagrees with the pack's own year rule is exactly that condition |
| A spousal, survivor, disability or railroad benefit, or a Part A premium, penalty or plan selection | `RLTAX-SCOPE-DEFERRED` | The rule exists and is not modelled, which is what that member already means |

A DoD item in Scope 01 asserts the member count is unchanged from its pre-feature
value, so an accidental addition cannot pass unnoticed. A DoD item in Scope 02
asserts the supported income-kind count is unchanged for the same reason.

---

## Assertion Supersession Mechanics

### The four shapes a replacement may take

| Shape | When | What the replacement does |
| --- | --- | --- |
| `derive` | The original pinned a literal count or length | Reads the expected value from the artifact it describes |
| `split` | The original pinned behaviour that now has two branches | Asserts the new branch, and retains the original clause verbatim on a fixture that still exhibits the old behaviour |
| `strengthen` | The original was already derived but is now under-specified | Adds the new rule beside the retained clause |
| `relocate` | The behaviour moved to a different surface, or a probe's subject moved | Asserts it on the new subject and asserts the old subject's new status |

### Marker convention

Each replacement carries a block comment immediately above it:

```
/* SUP-024-NN: supersedes `<the exact original clause>`; shape=<shape>. <one line
   on what protection is preserved and what is added>.
   Ledger: specs/024-social-security-and-medicare/spec.md#supersession-ledger */
```

### The marker check

Run at the end of every scope:

1. Collect the distinct `SUP-024-NN` markers present in the repository.
2. Collect the ledger entries owned by the completed scopes.
3. The two sets must be equal.
4. The ledger row count must equal the total its opening paragraph states, the sum
   of the per-scope ownership column in
   [`scopes/_index.md`](scopes/_index.md#ownership), and the marker count in the
   per-file distribution below. Where ASC-8 admitted an entry in flight, all four
   are updated in the same change.
5. No assertion outside the marker set may differ from its pre-feature text.

### Per-file marker distribution

| File | Markers it may carry | Owning scope |
| --- | --- | --- |
| `scripts/selftest.mjs` | SUP-024-01 | 01 |
| `scripts/selftest.mjs` | SUP-024-02, SUP-024-03, SUP-024-05 | 02 |
| `scripts/selftest.mjs` | SUP-024-06, SUP-024-07, SUP-024-10, SUP-024-12 | 04 |
| `tests/lifetime-tax.support.mjs` | SUP-024-09 | 01 |
| `tests/lifetime-tax-foundation.spec.mjs` | SUP-024-09 | 01 |
| `tests/lifetime-tax-route.spec.mjs` | SUP-024-09 | 01 |
| `tests/lifetime-tax-route.spec.mjs` | SUP-024-11 | 04 |
| `tests/lifetime-tax-property.spec.mjs` | SUP-024-09 | 01 |
| `tests/lifetime-tax-marginal.spec.mjs` | SUP-024-04 | 02 |
| `tax-rules/federal/<year>.json` and the assertion pinning its completeness record | SUP-024-08 | 02 |
| `tests/lifetime-tax-conversion.spec.mjs` | none | — |
| `tests/lifetime-tax-federal.spec.mjs` | none | — |
| `tests/lifetime-tax-rental.spec.mjs` | none | — |
| `tests/lifetime-tax-use.spec.mjs` | none | — |
| `tests/lifetime-tax-disposition.spec.mjs` | none | — |

Two plus five plus zero plus two plus zero is nine, matching the ledger.
SUP-024-09 is one entry carried in four files, because the derivation it
replaces was defined once in the shared support module and referenced by the
three specs that assert the privacy ledger. A marker count is a count of
ENTRIES, not of files.

Every scope's Change Boundary is derived from this table: a scope may open a
prior-feature test file only if this table places one of its owned markers there,
and a file carrying no marker owned by a scope stays in that scope's excluded
list. An ASC-8 admission that requires a file not listed here updates this table
in the same change and states which scope now owns it.

---

## Component Tree

| Surface | Scope | What lands there |
| --- | --- | --- |
| Simple | 05 | The annual benefit, the taxable portion and the annual Medicare cost — three fields, all decision-level |
| Power `power-benefit` | 01 | The basis origin, the bend points where computed, the full retirement age row, the factors applied and their citations |
| Power `power-inclusion` | 02 | The provisional income parts, the base amounts with their invariance bases, the tier and the comparisons performed |
| Power `power-claim-age` | 03 | The per-age table in declared order, the parity ages, the mortality basis and the two record statements |
| Power `power-medicare` | 04 | The declared lookback and its year, the bracket, both adjustments, the three premium legs and the annual cost |

Simple gains three fields and stays decision-level: no band table, no rule trace,
no raw series, no per-age table. Every withheld detail links to the Power section
that owns it. Both the Simple field set and the withheld-link set are already
asserted by derived identities from Features 022 and 023, so this growth is
absorbed without a ledger entry.

---

## Privacy Boundary

An earnings record is the most sensitive object this program has carried: it is a
year-by-year employment history, and it is location-adjacent and
employer-adjacent in a way an income total is not. A birth year is
directly identifying in combination with almost anything else. A claim age
discloses an intention. A lookback modified adjusted gross income discloses a
second year's finances.

Each is added to the storage inventory, to the clear action and to the export
sanitizer in the same scope that introduces it, and each is proven independently.
Every one of them lives inside the existing workspace storage key rather than in a
new key, so the declared key count is unchanged — a DoD item asserts both that the
count did not change and that every new declaration is nonetheless inventoried,
cleared and redacted, because an unchanged count is otherwise indistinguishable
from a declaration that was never inventoried.

None may reach a URL, a query string, a hash, a request, a referrer or a console
message. The export omits every one of them and states what it omitted.

---

## Testing And Validation Strategy

### Known-value coverage

Every sourced figure with a boundary is asserted at three points: below, exactly
at, and above. The two inclusion base amounts and every adjustment bracket
boundary are asserted at the exact sourced figure, never near it, and the
inclusivity is taken from the source's own `boundaryOperator` rather than from a
convention.

### Adversarial mutations that must be demonstrated to fail

| Mutation | Must break |
| --- | --- |
| A precedence rule choosing the statement figure when both origins are declared | The both-declared ambiguity refusal |
| The computed path falling back to unindexed earnings when the indexing series is absent | The computed-path refusal, and the assertion that the declared path stays available |
| A full retirement age read from an adjacent table row for an out-of-domain birth year | The table-domain refusal |
| A delayed credit accruing past the sourced stopping age | The bounded-months assertion |
| Provisional income computed as the pack's modified adjusted gross measure | The `distinctFrom[]` assertion |
| A base amount carried across edition years with no quoted contrast | The `yearInvarianceBasis` validation |
| A strict comparison where the source states inclusive, at either base amount or any bracket boundary | Each exact-boundary assertion |
| The included amount exceeding the sourced ceiling proportion | The ceiling assertion |
| A mortality pack carrying a probability column | The `MortalityBasis/v1` member refusal |
| The comparison sorted by cumulative total | The declared-order assertion |
| A default horizon substituted for an absent life-expectancy figure | The withheld-totals assertion |
| The current year's modified adjusted gross measure passed to the adjustment resolver | The resolver's parameter-shape assertion, since no parameter accepts it |
| A lookback year not equal to the premium year minus the pack's offset | The year-mismatch refusal |
| A premium leg flipped to `includedInTotal: true` | The `totalFederalTax` exclusion assertion, and the non-vacuous `L4` filter assertion |
| An `includedInTotal: false` leg carrying an absent figure | The pre-existing pack contract refusal, re-asserted |
| Any leg dropped from any of the four surfaces | The leg-visibility set identity, on the all-non-zero fixture, naming the leg and the surface |
| The headline reading a single leg instead of `totalFederalTax` | The headline-source assertion, on a fixture where the two differ |
| A pure function rewritten as an arrow const | SUP-024-01's derived extraction count, by module name |

### Repository gates run at the end of every scope

- `node scripts/selftest.mjs` — green, with no fall in the pre-existing pass count.
- `node scripts/validate-spec-test-paths.mjs` — zero new missing paths.
- `node scripts/build-pages-site.mjs --dry-run` — succeeds, proving no new root
  HTML entered without a `site-exclusions.json` decision and that `tax-rules/`
  remains outside the public directories.
- The `SUP-024-NN` marker check above.

### Browser rows

Every scope carries persistent Playwright rows through the `system-chrome`
project against the real route, with no request interception, no service worker
and no external provider. Titles are the browser-row contract and stay
byte-identical once written.

---

## Alternatives Considered

| Alternative | Rejected because |
| --- | --- |
| One benefit input with a hidden preference for the statement figure | The user cannot tell which arithmetic produced the number, and a failed indexing retrieval silently degrades an answer that never needed it |
| Deriving the lookback income from the current year with a note | The note is the whole defect: a plausible number with a caveat is still a plausible number, and the caveat is exactly what a user skips |
| Carrying the base amounts on their statutory category | Category is not evidence. Feature 023 refused figures from two publications and carried them from a third, and the difference was always what the publication said about itself |
| A new income kind for the included benefit portion | Ordinary income would then live in two places, and every downstream rule reading ordinary income would have to be taught about the second |
| A new `legKind` member to mark a cost | `includedInTotal` already exists, already refuses an absent figure, and already carries the semantics. A second mechanism would give two answers to one question |
| Renaming the parity age until the break-even detectors stop firing | Forbidden by ASC-9. The claim is made genuinely weaker instead, and the detectors are extended to cover the new files |
| Publishing a probability of outliving a claim age | Forbidden by the outcome contract, and the source's life-expectancy column answers the deterministic question without it |

## Complexity Tracking

The highest-risk surface is Scope 04, because it is the only scope where the
correct input and the wrong input have the same units, the same shape and almost
the same name. It is placed fourth, after the two scopes whose figures it must not
touch have already settled, so that the structural independence can be asserted
against a settlement that genuinely holds a current-year measure rather than
against an empty one.

The second-highest is Scope 02, because it carries five of the eight ledger
entries and touches the not-modeled accounting that most other assertions read
through.

## Open Questions And Routed Items

### Answered here

- The two basis origins have no precedence; both declared is a refusal.
- The adjustment resolver's independence is structural, not positional.
- A premium is `includedInTotal: false`, not a new leg kind.
- The mortality basis is the life-expectancy column alone.
- The parity age is not renamed to pass a scan; the claim is made weaker and the
  scans are extended.

### Routed to the implementer

- The joint-filer provisional income composition, per BI-6.
- The monthly-versus-annual accrual of the delayed credit, per BI-5.
- The mapping between the adjustment's filing groupings and the pack's filing
  statuses, per BI-11.

### Routed to a later feature

- Plan success probability and multi-year projection — Feature 025.
- Spousal, survivor and disability benefits — not scheduled.
- Registration — Feature 026.
- Additional state regimes and local income tax — Feature 023's register routes
  these to this number and this feature does not deliver them; recorded as an
  [open question](spec.md#open-questions) for the owner.
