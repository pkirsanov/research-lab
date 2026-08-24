# Design: 023 Property Tax And Rental Income (Slice 3)

Feature directory: `specs/023-property-tax-and-rental-income`
Specification: [`spec.md`](spec.md) · Planning: [`scopes/_index.md`](scopes/_index.md)
Predecessor design: [`specs/022-federal-preferential-and-state-income-tax/design.md`](../022-federal-preferential-and-state-income-tax/design.md)

---

## Design Brief

### Current State

Feature 021 shipped a federal engine with a declared-lump-sum itemized deduction
and a not-modeled ledger naming state and local tax. Feature 022 adds
per-component provenance, two threshold surtaxes, a state rule-pack contract,
`SourcedZero/v1`, two state income-tax packs and a combined settlement. Nothing in
either feature knows a household owns anything.

### Target State

Four new engine modules and two new pack families, composed into the existing
settlement rather than beside it. The federal settlement gains a deduction
composition and up to four new legs. The route gains one Power section per scope
and a small number of Simple fields.

### Patterns To Follow

- The pack seam from Feature 022: no module names a jurisdiction, a rate or a
  threshold. Everything is a pack field.
- The provenance model from Feature 022: `ComponentSource/v1` and
  `SourceRecord/v2`, reused unchanged for the regime packs.
- The refusal discipline from Feature 021: `AbsentFigure/v1` with a
  `missingSource` pointer and no smuggled numeric member.
- The leg model from Feature 022 Scope 02: the legs of `totalFederalTax` are the
  members of the pack's `taxLegs` set, summed from that declared set and never
  from a hardcoded list. Membership of that set is what makes an amount part of
  the federal total, so an amount that is not a federal tax is not a member.

### Patterns To Avoid

- A regime-name branch. `if (regime === 'save-our-homes')` is the failure this
  design exists to prevent; the cap basis is a declared enum member and the engine
  applies it at that basis.
- A blended property-tax input that hides which half is sourced.
- A parallel preferential stacking implementation in the disposition module.
- A boolean classification. The Publication 527 category is a published record.

---

## Module Boundaries And File Surface

### New files

| File | Owner scope | Contents |
| --- | --- | --- |
| `rltaxproperty.js` | 01 | `PropertyAssessment/v1`, `PropertyReliefRegime/v1`, `resolvePropertyRegime`, `computePropertyTax`, `propertyMarginalContext` |
| `rltaxrental.js` | 03 | `RentalActivity/v1`, `CostRecovery/v1`, `LossLimitation/v1`, `computeRentalSettlement`, `applyAtRiskLimit`, `applyPassiveActivityLimit` |
| `rltaxuse.js` | 04 | `UseClassification/v1`, `classifyDwellingUse`, `allocateByUseDays` |
| `rltaxdisposition.js` | 05 | `Disposition/v1`, `GainComponent/v1`, `computeDisposition`, `applyResidenceExclusion` |
| `tax-rules/property/FL/<year>.json` | 01 | Florida relief regime |
| `tax-rules/property/CA/<year>.json` | 01 | California relief regime |
| Fixture regimes and fixture packs | 01, 03, 04, 05 | Branch coverage independent of any real jurisdiction |

### Existing files edited

| File | Scopes | Why |
| --- | --- | --- |
| `rltaxrules.js` | 01, 02, 03, 04, 05 | New contracts, the widened pack grammar, the deduction-component contract |
| `rltax.js` | 01, 02, 03, 04, 05 | New calculation-order stages, the deduction composition, leg-set growth |
| `rltaxworkspace.js` | 01, 03, 04, 05 | Property, rental, use and disposition declarations plus their privacy surface |
| `lifetime-tax-strategy-lab.html` | 01, 02, 03, 04, 05 | Inputs, Power sections, Simple fields, leg surfacing |
| `scripts/selftest.mjs` | 01, 02, 03, 04, 05 | One appended group per scope, plus this feature's superseded assertions |
| `tests/lifetime-tax-route.spec.mjs` | 01 | SUP-023-06 and SUP-023-10 only |
| `tests/lifetime-tax-foundation.spec.mjs` | 01 | SUP-023-07, SUP-023-08 and SUP-023-10 only |
| `tests/lifetime-tax-conversion.spec.mjs` | 02 | SUP-023-02 and SUP-023-03 only |
| `tests/lifetime-tax-rental.spec.mjs` | 04 | SUP-023-13 only, admitted in flight under ASC-8 |

### Dependency direction

`rltaxrules.js` depends on nothing. `rltaxproperty.js`, `rltaxuse.js` and
`rltaxdisposition.js` depend on `rltaxrules.js` only. `rltaxrental.js` depends on
`rltaxrules.js` and `rltaxuse.js`. `rltax.js` composes all of them. No new module
imports `rltax.js`, so no cycle is possible and each new module is testable
without the settlement.

`rltaxdisposition.js` does **not** implement preferential stacking. It produces
gain components and hands them to the Feature 022 preferential model. That
absence is what makes FR-023-031 structural rather than conventional.

### Harness constraints

Every new module is UMD, loads from `file://`, and issues no request. Regime packs
load through the same local pack loader Feature 022 uses for state packs.

---

## Capability Foundation

Scope 01 is the foundation. It introduces the declared-versus-sourced split that
every later scope consumes, and the regime contract that the two shipped regimes
and every fixture regime satisfy.

### Foundation contracts

- The split between a declared object and a sourced object, with two different
  refusal codes and two different renderings.
- The application-point model for a relief mechanism, reused from Feature 022's
  `ReliefMechanism/v1` rather than re-invented.
- The cap-basis enum, which is the variation axis the two shipped regimes exercise
  in opposite directions.

### Extension points

- A new relief regime is a new pack file. No module changes.
- A new cap basis is a new enum member plus one engine branch on the member, never
  on a regime name.

### Variation axes exercised by the two shipped regimes

| Axis | Florida | California |
| --- | --- | --- |
| Cap basis | `prior-assessed-value` | `acquisition-value` |
| What the cap limits | Growth of an annually re-set assessment | Growth of a frozen acquisition basis |
| Rate ceiling | Not carried | Carried, applied as a ceiling on the declared rate |
| Exemption shape | Tiered exemption against the assessment | Exemption where retrieved, otherwise absent |

Two regimes on opposite ends of the cap-basis axis is what makes the contract a
contract. A single regime would be one regime's arithmetic wearing a contract's
clothes.

---

## Contracts

### `PropertyAssessment/v1`

`{ contractVersion, assessedValue, priorAssessedValue, acquisitionValue, localCombinedRate, exemptionElections[], origin: "declared" }`

Every member is declared. The contract carries no `sourceRef` and validation
refuses one. A missing member required by the resolved regime is
`RLTAX-INPUT-INCOMPLETE` naming the member and naming the regime that required it.

### `PropertyReliefRegime/v1`

`{ contractVersion, regimeId, jurisdiction, year, exemptions[], assessmentCap, rateCeiling, sourceRecords[] }`

Every value-bearing member carries a `ComponentSource/v1`. `assessmentCap` is
`{ capBasis, capRate|capAmount, sourceRef, locator }` where `capBasis` is a member
of the closed set `prior-assessed-value` · `acquisition-value`. An unretrieved
member is an `AbsentFigure/v1` and the settlement refuses
`RLTAX-THRESHOLD-UNAVAILABLE`.

A regime carrying a `rateCeiling` applies it as `min(declaredRate, ceiling)` and
publishes which side bound. A regime carrying no `rateCeiling` uses the declared
rate and publishes that no ceiling applies — a stated fact, not a silent pass.

### `DeductionComponent/v1`

`{ componentId, label, amount, origin: "declared"|"computed", cappedWith[], allowedAmount, disallowedAmount, sourceRef? }`

`cappedWith[]` names the other components sharing the cap, which is what makes the
competition visible. `disallowedAmount` is always present, and is `0` only when
the cap did not bind — never as a stand-in for unknown.

### `ItemizedComposition/v1`

`{ components[], cap, capBinding: "bound"|"unbound"|"unavailable", itemizedTotal, standardDeduction, chosen: "itemized"|"standard"|"unavailable", chosenReason }`

`chosen` is recomputed from the two totals. A composition whose `cap` is an
`AbsentFigure` produces `capBinding: "unavailable"` and `chosen: "unavailable"`,
and the settlement refuses rather than quietly taking the standard deduction.

### `UseClassification/v1`

`{ contractVersion, category, rentalDays, personalUseDays, testParameters[], comparisonsPerformed[], ruleStatus }`

`testParameters[]` holds the sourced day figure, the sourced percentage figure and
the sourced rental-days threshold, each with its citation.
`comparisonsPerformed[]` records each comparison as
`{ left, operator, right, result }` so the boundary cases are assertable at the
exact figure and the inclusivity is inspectable. A parameter that is an
`AbsentFigure` refuses the classification; no category is assigned.

### `CostRecovery/v1`

`{ depreciableBasis, recoveryPeriod, convention, placedInServiceMonth, currentYearDeduction, sourceRecords[] }`

`recoveryPeriod` and `convention` are sourced. Neither has a default. The
deduction is computed from them and from the declared basis and month.

### `LossLimitation/v1`

`{ limitId, appliedOrder, amountBefore, allowedAmount, disallowedAmount, disposition: "suspended", sourceRef }`

`appliedOrder` is an integer the engine asserts is strictly increasing across the
applied limits, which is how FR-023-017's ordering is proven rather than assumed.

### `GainComponent/v1`

`{ componentId: "unrecaptured-1250"|"long-term-remainder", amount, pricingRule, maximumRate?, sourceRef }`

`pricingRule` is `own-maximum-rate` for the recapture component and
`preferential-stacking` for the remainder. The disposition module sets the rule
and does not execute the second one.

---

## Calculation Order

The federal ordered array gains four stages, appended after Feature 022's stages
and before the total. Each is derived from the pack and the workspace, never from
a constant list.

| Stage | Owner scope | What it does |
| --- | --- | --- |
| `CO-15` | 01 | Resolve the property regime, apply the exemptions and the cap at the declared basis, apply the rate ceiling, produce the property-tax leg |
| `CO-16` | 04 | Classify the dwelling use and publish the classification |
| `CO-17` | 03, 04 | Settle the rental activity for the published category, apply cost recovery, apply the limits in declared order |
| `CO-18` | 02 | Compose the itemized deduction, apply the cap, decide itemized versus standard |
| `CO-19` | 05 | Settle the disposition, split the gain, apply the exclusion, hand the remainder to the preferential model |

`CO-16` precedes `CO-17` because a rental cannot be settled before its category is
known. `CO-18` follows `CO-17` because the personal portion of an allocated
expense is a deduction component. `CO-19` is last because the exclusion applies to
a gain that must already be split.

Reconciliation gains no leg. The federal reconciliation identities are `L1`
through `L6` in `reconcileAnnualFederalTax`, and `L7` in `rltaxstate.js` is the
state independence identity. This feature adds none of its own, and no identity
beyond that set exists.

The four housing amounts — `property-tax` (`CO-15`), `rental-net` (`CO-17`),
`disposition-recapture` and `disposition-remainder` (`CO-19`) — are published as
legs of the settled record and are **not** members of the pack's `taxLegs` set.
That set is the one `L4` sums into `totalFederalTax`, so no housing amount is
ever added to the federal figure. Property tax in particular is a separate leg:
the rendered copy states in words that it is not added into the federal figure,
and a cost leg that nonetheless entered the total is the `mis-summed-leg`
finding `CO-24`'s census exists to raise. What holds these four amounts
accountable is the leg-visibility set identity below, not a reconciliation leg.

---

## Leg Visibility

This section exists because Feature 022's validation found a headline that showed
one leg where a combined total belonged, understating the figure by
eighty-eight percent, latent because the hidden legs were zero in the fixture that
covered it.

**The rule.** For every leg in the settled record, four surfaces must carry it:
the headline total, the comparison table, the marginal curve's contributor set,
and the export. The check is not "the headline is correct for this fixture"; it is
a **set identity between the record's declared legs and each surface's rendered
legs, in both directions**, asserted against a fixture in which **every leg is
non-zero and mutually distinct**.

**Why the fixture matters more than the assertion.** A zero leg passes an addition
check whether or not it was added. The leg-visibility fixture therefore assigns
each leg a distinct non-zero value, so that omitting any one changes the headline
by an amount unique to that leg. An implementation that drops a leg cannot produce
the right total by luck.

**The adversarial case.** Each scope that adds a leg demonstrates, by mutation,
that removing its leg from any one of the four surfaces fails the assertion — and
that the failure names the missing leg rather than reporting a numeric mismatch.

---

## Refusal Conditions Folded Into Existing Members

This feature adds no refusal code. Five candidate conditions were considered and
each is folded, named individually so a later reader can tell a considered fold
from an unexamined one.

| Candidate | Folded into | Why |
| --- | --- | --- |
| An undeclared assessed value, local rate or exemption election | `RLTAX-INPUT-INCOMPLETE` | It is exactly the existing condition: the household has not supplied a required declaration, and the remediation is identical |
| An unretrieved cap, ceiling, recovery period, allowance or exclusion amount | `RLTAX-THRESHOLD-UNAVAILABLE` | It is exactly the existing condition: a sourced rule the pack could not establish |
| A classification attempted without a retrieved test parameter | `RLTAX-THRESHOLD-UNAVAILABLE` | The blocking object is the unretrieved parameter, not the classification |
| A reduced primary-residence exclusion for unforeseen circumstances | `RLTAX-SCOPE-DEFERRED` | The rule exists and is not modelled, which is what that member already means |
| A second property, a commercial rental or a like-kind exchange | `RLTAX-SCOPE-DEFERRED` | Same |

A DoD item in Scope 01 asserts the member count is unchanged from its pre-feature
value, so an accidental addition cannot pass unnoticed.

---

## Assertion Supersession Mechanics

### The four shapes a replacement may take

| Shape | When | What the replacement does |
| --- | --- | --- |
| `derive` | The original pinned a literal count or length | Reads the expected value from the artifact it describes |
| `split` | The original pinned behaviour that now has two branches | Asserts the new branch, and retains the original clause verbatim on a fixture that still exhibits the old behaviour |
| `strengthen` | The original was already derived but is now under-specified | Adds the new rule beside the retained clause |
| `relocate` | The behaviour moved to a different surface | Asserts it on the new surface and asserts its absence from the old |

### Marker convention

Each replacement carries a block comment immediately above it:

```
/* SUP-023-NN: supersedes `<the exact original clause>`; shape=<shape>. <one line
   on what protection is preserved and what is added>.
   Ledger: specs/023-property-tax-and-rental-income/spec.md#supersession-ledger */
```

### The marker check

Run at the end of every scope:

1. Collect the distinct `SUP-023-NN` markers present in the repository.
2. Collect the ledger entries owned by the completed scopes.
3. The two sets must be equal.
4. The ledger row count must equal the sum of the per-scope ownership column in
   [`scopes/_index.md`](scopes/_index.md#ownership). Where ASC-8 admitted an entry
   in flight, both are updated in the same change.
5. No assertion outside the marker set may differ from its pre-feature text.

### Per-file marker distribution

| File | Markers it may carry | Owning scope |
| --- | --- | --- |
| `scripts/selftest.mjs` | SUP-023-01, SUP-023-04, SUP-023-11 | 02 |
| `scripts/selftest.mjs` | SUP-023-05 | 01 |
| `scripts/selftest.mjs` | SUP-023-12 | 03 |
| `scripts/selftest.mjs` | SUP-023-09 | 05 |
| `scripts/selftest.mjs` | SUP-023-14 | 04 |
| `tests/lifetime-tax-route.spec.mjs` | SUP-023-06, SUP-023-10 | 01 |
| `tests/lifetime-tax-foundation.spec.mjs` | SUP-023-07, SUP-023-08, SUP-023-10 | 01 |
| `tests/lifetime-tax-conversion.spec.mjs` | SUP-023-02, SUP-023-03 | 02 |
| `tests/lifetime-tax-rental.spec.mjs` | SUP-023-13 | 04 |
| `tests/lifetime-tax-federal.spec.mjs` | none | — |
| `tests/lifetime-tax-marginal.spec.mjs` | none | — |

Every scope's Change Boundary is derived from this table: a scope may open a
prior-feature test file only if this table places one of its owned markers there,
and a file carrying no marker owned by a scope stays in that scope's excluded
list. An ASC-8 admission that requires a file not listed here updates this table
in the same change and states which scope now owns it.

---

## Component Tree

| Surface | Scope | What lands there |
| --- | --- | --- |
| Simple | 02 | The itemized-versus-standard outcome, one field |
| Simple | 03 | The rental net contribution, one field |
| Simple | 05 | The disposition total, one field |
| Power `power-property` | 01 | Assessment inputs, applied relief, the regime's citations |
| Power `power-deduction` | 02 | The composition table, the cap binding, the disallowed amounts |
| Power `power-rental` | 03 | Schedule E detail, cost recovery, the limit ladder |
| Power `power-use` | 04 | The classification record and the comparisons performed |
| Power `power-disposition` | 05 | The gain components, the recapture rate, the exclusion tests |

Simple gains three fields and stays decision-level: no band table, no rule trace,
no raw series. Every withheld detail links to the Power section that owns it,
which is why the withheld-link counts are superseded by derivation in Scope 01.

---

## Privacy Boundary

The property's assessed value, its acquisition value, its rental days, its
personal-use days, its basis and its proceeds are at least as sensitive as an
income amount. Each is added to the storage inventory, to the clear action and to
the export sanitizer in the same scope that introduces it, and each is proven
independently. The assessed value and the acquisition value are additionally
location-adjacent, because a parcel value plus a declared residency state narrows
a household considerably; neither may reach a URL, a request, a referrer or a
console message.

The export omits every household declaration this feature adds and states what it
omitted.

---

## Testing And Validation Strategy

### Known-value coverage

Every sourced figure is asserted at three points where a boundary exists: below,
exactly at, and above. The three Publication 527 boundaries are asserted at the
exact sourced figure, never near it.

### Adversarial mutations that must be demonstrated to fail

| Mutation | Must break |
| --- | --- |
| A regime-name branch replacing the cap-basis branch | The fixture-regime coverage, which uses no real regime name |
| An assessment cap applied at the wrong basis | The Florida-versus-California divergence assertion |
| A rate ceiling used as the rate | The declared-rate-below-ceiling assertion |
| A capped component whose disallowed amount is zeroed instead of computed | The composition's disjoint-accounting assertion |
| The itemized-versus-standard decision taken from a declared flag | The recomputation assertion |
| Depreciation using a recalled recovery period | The sourced-parameter assertion, since the fixture pack carries a deliberately non-standard period |
| The passive limit applied before the at-risk limit | The strictly-increasing `appliedOrder` assertion |
| A disallowed loss zeroed instead of published | The disallowed-amount presence assertion |
| A strict comparison where the publication states inclusive | Each of the three boundary assertions |
| The whole gain priced under one rule | The two-component leg assertion |
| The exclusion applied to the recapture component | The exclusion-target assertion |
| Any leg dropped from any of the four surfaces | The leg-visibility set identity, on the all-non-zero fixture |

### Repository gates run at the end of every scope

- `node scripts/selftest.mjs` — green, with no fall in the pre-existing pass count.
- `node scripts/validate-spec-test-paths.mjs` — zero new missing paths.
- `node scripts/build-pages-site.mjs --dry-run` — succeeds, proving no new root
  HTML entered without a `site-exclusions.json` decision and that `tax-rules/`
  remains outside the public directories.
- The `SUP-023-NN` marker check above.

### Browser rows

Every scope carries persistent Playwright rows through the `system-chrome`
project against the real route, with no request interception, no service worker
and no external provider. Titles are the browser-row contract and stay
byte-identical once written.

---

## Alternatives Considered

| Alternative | Rejected because |
| --- | --- |
| Ship a county millage database | Stale on arrival, undetectably wrong per user, and unsourceable to one authority |
| Keep the itemized deduction a declared lump sum and add property tax beside it | The cap competition — the decision-relevant fact — becomes invisible, and `'state-and-local-tax'` cannot honestly leave the not-modeled ledger |
| Branch on days inline instead of publishing a classification | The user cannot verify the category, and the boundary cases become assertions about a branch rather than about a comparison |
| Implement preferential stacking inside the disposition module | Two implementations of one rule diverge; the remainder component is handed to the Feature 022 model instead |
| Add a refusal code per new condition | Five conditions each fold into an existing member with the same meaning and the same remediation; adding members would dilute the vocabulary |

## Complexity Tracking

The highest-risk surface is Scope 02, because it converts a declared value into a
composed one and touches the assertion that most other assertions read through.
It is placed second, immediately after the foundation, so that every later scope
builds on the composed shape rather than migrating to it.

## Open Questions And Routed Items

### Answered here

- The cap basis is an enum member, not a regime name.
- The classification is a record, not a branch.
- The disposition module does not stack.

### Routed to the implementer

- The mortgage interest grandfathered tier's reachability from declared inputs.
- Whether the personal-use percentage compares against days rented at fair rental
  value or days rented at all, per BI-8.

### Routed to a later feature

- Multi-year depreciation and suspended-loss ledgers — Feature 025.
- Additional property regimes and local income tax — Feature 024.
- Registration — Feature 026.
