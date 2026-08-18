# Scope 2: Primary Residence Federal Interaction

## 02-primary-residence-federal-interaction

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In progress
**Scope-Kind:** runtime-behavior
**Tags:** `engine:federal`, `supersession-heavy:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01
**Foundation:** false

**Primary Outcome:** the itemized deduction stops being a number the household
types and becomes a composition it can read. Property tax and state income tax
compete inside one sourced cap, mortgage interest is limited by a sourced debt
limit, the amount that bought nothing is shown, and the itemized-versus-standard
decision is recomputed rather than declared. This is the scope that lets
`'state-and-local-tax'` honestly leave the not-modeled ledger.

## Requirement Coverage

- **FR-023-008** — the itemized deduction is a composed record of named components
  each carrying its origin.
- **FR-023-009** — the cap is a sourced figure with its filing-status variation,
  applied to the summed component with the binding recorded explicitly.
- **FR-023-010** — the amount of each capped component that produced no deduction
  is computed and displayed.
- **FR-023-011** — mortgage interest deductibility is computed from a sourced
  acquisition-debt limit; the disallowed portion is named; an unretrieved limit
  refuses rather than deducting in full.
- **FR-023-012** — the itemized-versus-standard decision is recomputed and the
  chosen side is named.
- **FR-023-013** — `'state-and-local-tax'` moves out of `unsupportedFeatures[]`
  into a named component with disjoint, exhaustive accounting.
- **FR-023-014** — the composition and the decision are surfaced in the headline,
  the comparison, the curve and the export.

Inherited and re-asserted: **FR-023-007** the property leg, **NFR-023-001**
declared or sourced never conflated, **NFR-023-002** zero network,
**NFR-023-003** privacy, **NFR-023-004** vocabulary unchanged, **NFR-023-006** leg
visibility, **NFR-023-009** Feature 008 byte-identity.

## Gherkin Scenarios

```gherkin
Scenario: SCN-023-004 Property tax and state income tax compete inside one cap
  Given a household with a computed property tax and a computed state income tax whose sum exceeds the sourced cap
  When the itemized deduction is composed
  Then each component appears by name with its origin recorded as declared or computed
  And the summed component is capped at the sourced limit for the filing status with the binding stated
  And the amount of each component that produced no deduction is displayed rather than dropped

Scenario: SCN-023-005 Mortgage interest is limited by a sourced debt limit
  Given declared mortgage interest and a declared acquisition-debt balance above the sourced limit
  When the deduction is composed
  Then the deductible portion is computed from the sourced limit
  And the disallowed portion is named rather than dropped
  And a declared balance for which no sourced limit was retrieved refuses rather than deducting the full amount

Scenario: SCN-023-006 The itemized-versus-standard decision is shown, not assumed
  Given a composed itemized total and the sourced standard deduction for the filing status
  When the federal settlement runs
  Then both totals are displayed side by side and the one actually used is named
  And the decision is recomputed from the two totals rather than read from a declared flag
  And a household whose itemized total falls below the standard deduction is told its property tax changed nothing
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-023-004 cap bound | Property tax and state income tax both computed, sum above cap | Open the deduction panel | Each component by name with its origin, the cap, the binding stated, and each component's disallowed amount | e2e-ui |
| SCN-023-004 cap unbound | Sum below the cap | Open the deduction panel | The same table with the binding stated as unbound and every disallowed amount zero, labelled as a computed zero | e2e-ui |
| SCN-023-004 cap absent | Cap not retrieved | Open the deduction panel | `RLTAX-THRESHOLD-UNAVAILABLE` on the itemized total, and the standard deduction is not silently chosen | e2e-ui |
| SCN-023-005 interest limited | Debt balance above the sourced limit | Open the deduction panel | The deductible portion, the disallowed portion by name, and the limit's citation reachable | e2e-ui |
| SCN-023-006 decision | Itemized total below the standard deduction | Open Simple then Power | The chosen side named in Simple, both totals side by side in Power, and a statement that the property tax changed nothing | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The composition and the decision reach the headline, the comparison, the curve and the export | e2e-ui |

## Implementation Files

### New

- Fixture packs: one with the cap bound, one unbound, one with the cap absent, one
  with the mortgage limit absent, and one whose itemized total sits exactly at the
  standard deduction.
- `lifetime-tax-deduction.spec.mjs` under `tests/` — this scope's Playwright spec.

### Modified

- `rltaxrules.js` — `DeductionComponent/v1`, `ItemizedComposition/v1`, the cap and
  debt-limit pack members with their `ComponentSource` citations.
- `rltax.js` — stage `CO-18`, `composeItemizedDeduction`, and the recomputed
  decision.
- `rltaxworkspace.js` — the mortgage interest and acquisition-debt declarations
  plus their privacy surface.
- `lifetime-tax-strategy-lab.html` — the `power-deduction` section and one Simple
  field.
- `tax-rules/federal/<year>.json` — the deduction cap and the mortgage
  acquisition-debt limit, and the removal of the `'state-and-local-tax'`
  unsupported entry.
- `scripts/selftest.mjs` — one appended group, plus SUP-023-01 and SUP-023-04.
- `tests/lifetime-tax-conversion.spec.mjs` — SUP-023-02 and SUP-023-03 only.

## Implementation Plan

1. Add `DeductionComponent/v1` with a required `origin` member and a required
   `disallowedAmount`. A component missing `disallowedAmount` is refused, so a
   silent zero cannot stand in for an uncomputed one.
2. Add `ItemizedComposition/v1` with `capBinding` from the closed set
   `bound` · `unbound` · `unavailable`, and `chosen` from
   `itemized` · `standard` · `unavailable`.
3. **Retrieve `BI-3`.** Open the Schedule A instructions, transcribe the state and
   local tax deduction cap and its filing-status variation, and record it with its
   locator. If unretrieved it ships absent, the itemized total refuses, and the
   standard deduction is not silently chosen.
4. **Retrieve `BI-4`.** Open Publication 936, transcribe the acquisition-debt
   limit and its grandfathered tier, and record each with its locator. If the tier
   is not reachable from the declarations the workspace carries, the tier refuses
   rather than assuming the current one.
5. Implement `composeItemizedDeduction`: build the components, record each origin,
   sum the capped family, apply the cap, and compute each component's disallowed
   amount as its share of the excess under the pack's declared apportionment rule.
   `cappedWith[]` names the other components sharing the cap.
6. Implement the mortgage interest limitation from the sourced limit and the
   declared balance. The disallowed portion is a named member of the component.
7. Implement stage `CO-18` and the recomputed decision. The decision reads the two
   totals and no declared flag; a workspace member expressing a preferred side is
   refused.
8. Remove the `'state-and-local-tax'` entry from the federal pack's
   `unsupportedFeatures[]` and assert the accounting between that array and the
   composition's component ids is disjoint and exhaustive, so the id is proven to
   have moved rather than vanished.
9. Extend the leg-visibility identity from Scope 01 to cover the composition and
   the decision on all four surfaces.
10. Add the mortgage declarations to `rltaxworkspace.js` with their inventory,
    clear and export-sanitizer entries.
11. Render the `power-deduction` section and one Simple field naming the chosen
    side. Simple stays decision-level: no component table in Simple, and the
    withheld detail links to `power-deduction`.
12. Deliver SUP-023-01, SUP-023-02, SUP-023-03 and SUP-023-04 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure).
13. Append a `lifetime-tax — itemized composition and the capped deduction` group
    to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The itemized deduction shape | Declared amount becomes a composed record | Scopes 03, 04, 05 and every Feature 021 and 022 fixture | Very high — every settled fixture reads through it | Assert every Feature 021 and 022 fixture produces its exact prior federal total when the composition contains only the previously-declared amount as a single component, before any new component is added | Restore the declared amount and revert the four supersessions |
| `unsupportedFeatures[]` | One entry removed | The not-modeled ledger on both Simple and Power, and three prior assertions | High — a removed entry with no replacement component makes the ledger's promise false | The SUP-023-01 replacement asserts disjoint exhaustive accounting, so a removal without a component fails | Restore the entry |
| `tax-rules/federal/<year>.json` | Cap and debt limit added, one unsupported entry removed | Scopes 03, 04, 05 | High — a pack edit that changes an existing figure would silently move every prior result | Assert every pre-existing federal pack figure is byte-identical before the additions are consumed | Revert the pack |
| Simple field set | One field added | Scopes 03 and 05, and SUP-023-04 | Medium | The SUP-023-04 replacement derives the set from the page, so later additions are absorbed | Remove the field |
| `scripts/selftest.mjs` | One group appended plus two markers | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the markers |

## Change Boundary And Protected Paths

**Allowed new:** this scope's fixture packs · `lifetime-tax-deduction.spec.mjs`
under `tests/`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `tax-rules/federal/<year>.json` ·
`scripts/selftest.mjs` (append, plus SUP-023-01 and SUP-023-04) ·
`tests/lifetime-tax-conversion.spec.mjs` (SUP-023-02 and SUP-023-03 only).

`tax-rules/federal/<year>.json` is allowed here **because** FR-023-009,
FR-023-011 and FR-023-013 require a cap, a debt limit and an unsupported-entry
removal in that pack. It is excluded from every other scope in this feature.
`tests/lifetime-tax-conversion.spec.mjs` is allowed **because** the
[per-file marker distribution](../design.md#per-file-marker-distribution) places
this scope's SUP-023-02 and SUP-023-03 there.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `rltaxproperty.js` · `rltaxstrategy.js` · `rltaxstate.js` ·
`rltaxcombined.js` · `tax-rules/property/**` · `tax-rules/state/**` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `notes/README.md` ·
`market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` ·
`tests/lifetime-tax-route.spec.mjs` · `tests/lifetime-tax-foundation.spec.mjs` ·
`tests/lifetime-tax-federal.spec.mjs` · `tests/lifetime-tax-marginal.spec.mjs` ·
Scope 01's `lifetime-tax-property.spec.mjs` · `tests/lifetime-tax.support.mjs` ·
every framework-managed file.

`rltaxproperty.js` is excluded deliberately. Composing the deduction must not
require a property-engine edit; if it does, the property leg is not a leg.

**Rollback:** revert the two contracts, stage `CO-18`, the composition, the
federal pack additions and the removed unsupported entry, the workspace members
and the page section; revert the four supersession replacements to their
superseded clauses; delete the fixtures and the spec file.

## Assertion Supersession Owned By This Scope

Four entries: **SUP-023-01**, **SUP-023-02**, **SUP-023-03**, **SUP-023-04**. Each
is caused by a deliberate change this scope's requirement coverage names:
FR-023-013 removes `'state-and-local-tax'` from the unsupported set, which moves
the not-modeled counts and the label expectation, and FR-023-012 adds one Simple
field. SUP-023-04's replacement derives the Simple set from the page, so the fields
Scopes 03 and 05 add are absorbed without a further entry.

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside these four that fails is either a defect in this
scope's change and is fixed, or an ASC-8 admission recorded in the ledger before
the edit.

## Scenario-First Red/Green Contract

**Named intended-RED assertion for this scope:** a household whose property tax
and state income tax sum above the sourced cap must produce an itemized total
equal to the uncapped components plus the cap, and each capped component must
carry a non-zero `disallowedAmount` whose sum equals the excess. Before the
composition exists the itemized deduction is a declared amount, the assertion
cannot find a component list, and it fails on the missing structure. A syntax
error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Compatibility | unit | SCN-023-006 | `scripts/selftest.mjs` | Every Feature 021 and Feature 022 fixture produces its exact prior federal total when the composition holds only the previously-declared amount as a single component | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Contract | unit | SCN-023-004 | `scripts/selftest.mjs` | `DeductionComponent/v1` refuses a missing `origin` and a missing `disallowedAmount`; `ItemizedComposition/v1` refuses a `capBinding` or `chosen` outside its closed set | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Known value | unit | SCN-023-004 | `scripts/selftest.mjs` | With the sum below, exactly at and above the sourced cap, the itemized total, the binding and every component's disallowed amount are exact, and the disallowed amounts sum to the excess | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Adversarial | unit | SCN-023-004 | `scripts/selftest.mjs` | Regression: an implementation zeroing `disallowedAmount` instead of computing it is proven to fail the excess-sum assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Refusal | unit | SCN-023-004 | `scripts/selftest.mjs` | A pack whose cap is an `AbsentFigure` produces `capBinding: "unavailable"`, `chosen: "unavailable"`, and a refused itemized total; the standard deduction is not chosen in its place | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Known value | unit | SCN-023-005 | `scripts/selftest.mjs` | With the declared balance below, exactly at and above the sourced debt limit, the deductible and disallowed portions are exact | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Refusal | unit | SCN-023-005 | `scripts/selftest.mjs` | An unretrieved debt limit refuses the mortgage component; no full-amount deduction is taken in its place | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Adversarial | unit | SCN-023-005 | `scripts/selftest.mjs` | Regression: an implementation deducting the full declared interest when the limit is absent is proven to fail the refusal assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Known value | unit | SCN-023-006 | `scripts/selftest.mjs` | With the itemized total below, exactly at and above the sourced standard deduction, the chosen side is correct at each point and the tie is resolved the way the pack declares | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Adversarial | unit | SCN-023-006 | `scripts/selftest.mjs` | Regression: a workspace member expressing a preferred side is refused, and an implementation reading such a flag is proven to fail the recomputation assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Accounting | unit | SCN-023-004 | `scripts/selftest.mjs` | The accounting between `unsupportedFeatures[]` and the composition's component ids is disjoint and exhaustive, and `'state-and-local-tax'` is proven present as a component rather than absent from both | `node scripts/selftest.mjs` | No | `report.md#tp-02-11` |
| TP-02-12 | Sourcing | unit | SCN-023-004 | `scripts/selftest.mjs` | The cap and the debt limit each resolve to exactly one retrieved source with a locator, and every pre-existing federal pack figure is byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-02-12` |
| TP-02-13 | Leg visibility | unit | SCN-023-006 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the composition and the decision appear in the headline, the comparison, the curve contributors and the export, in both directions | `node scripts/selftest.mjs` | No | `report.md#tp-02-13` |
| TP-02-14 | Adversarial | unit | SCN-023-006 | `scripts/selftest.mjs` | Regression: removing the composition from each of the four surfaces in turn is proven to fail the leg-visibility identity with the missing element named | `node scripts/selftest.mjs` | No | `report.md#tp-02-14` |
| TP-02-15 | Vocabulary | unit | SCN-023-004 | `scripts/selftest.mjs` | The refusal vocabulary member count equals its pre-feature value | `node scripts/selftest.mjs` | No | `report.md#tp-02-15` |
| TP-02-16 | Privacy | unit | SCN-023-005 | `scripts/selftest.mjs` | The mortgage interest and acquisition-debt declarations are inventoried, cleared, redacted, and absent from every URL, request, referrer and console message | `node scripts/selftest.mjs` | No | `report.md#tp-02-16` |
| TP-02-17 | Supersession | unit | SCN-023-004 | `scripts/selftest.mjs` | SUP-023-01's and SUP-023-04's replacements are pack-derived and page-derived respectively, and each superseded literal is proven to have failed first | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-02-18 | Regression E2E | e2e-ui | SCN-023-004 | `lifetime-tax-deduction.spec.mjs` | `Regression: SCN-023-004 property tax and state income tax compete inside one cap and the disallowed amounts are shown` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-004 property tax and state income tax compete inside one cap and the disallowed amounts are shown" --reporter=list` | Yes | `report.md#scenario-scn-023-004` |
| TP-02-19 | Regression E2E | e2e-ui | SCN-023-005 | `lifetime-tax-deduction.spec.mjs` | `Regression: SCN-023-005 mortgage interest is limited by a sourced debt limit and the disallowed portion is named` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-005 mortgage interest is limited by a sourced debt limit and the disallowed portion is named" --reporter=list` | Yes | `report.md#scenario-scn-023-005` |
| TP-02-20 | Regression E2E | e2e-ui | SCN-023-006 | `lifetime-tax-deduction.spec.mjs` | `Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named" --reporter=list` | Yes | `report.md#scenario-scn-023-006` |
| TP-02-21 | Leg visibility E2E | e2e-ui | SCN-023-006 | `lifetime-tax-deduction.spec.mjs` | `Regression: SCN-023-006 the composition and the decision reach the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-006 the composition and the decision reach the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-02-21` |
| TP-02-22 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -006 | The prior features' specs plus this feature's two | The cumulative browser suite over the real route | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list` | Yes | `report.md#tp-02-22` |
| TP-02-23 | Repo gate | unit | SCN-023-004 … -006 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-02-23` |
| TP-02-24 | Path guard | unit | SCN-023-004 … -006 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-02-24` |
| TP-02-25 | Deploy gate | unit | SCN-023-004 … -006 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-02-25` |

### Definition of Done

- [x] Every Feature 021 and Feature 022 fixture produces its exact prior federal
      total under the composed shape before any new component is added.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-01`
- [x] FR-023-008 through FR-023-010 are implemented: named components with
      recorded origins, a cap applied with its binding stated, and disallowed
      amounts computed rather than zeroed, proven exact below, at and above the cap.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-02`, `report.md#tp-02-03`, `report.md#tp-02-04`, `report.md#tp-02-05`
- [x] FR-023-011 is implemented: the mortgage component is limited by the sourced
      limit, the disallowed portion is named, and an unretrieved limit refuses
      rather than deducting in full.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-06`, `report.md#tp-02-07`, `report.md#tp-02-08`
- [x] `BI-3` and `BI-4` were closed by retrievals performed in the implementation
      session and recorded with their own `retrievedAt` and locators, or the
      affected figure ships as an `AbsentFigure/v1` and its component refuses.
  - **Phase:** implement · **Command:** the retrieval records in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-02-12`
- [x] FR-023-012 is implemented: the decision is recomputed from the two totals, a
      declared preference member is refused, and the chosen side is named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-09`, `report.md#tp-02-10`
- [x] FR-023-013 is implemented: `'state-and-local-tax'` is proven to have moved
      into a named component, with disjoint exhaustive accounting between the
      unsupported set and the component ids.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-11`
- [x] FR-023-014 and NFR-023-006 are implemented: the composition and the decision
      are surfaced in the headline, the comparison, the curve and the export,
      proven by a two-directional set identity on the all-non-zero fixture, and
      removing them from each surface in turn is demonstrated to fail with the
      missing element named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-02-13`, `report.md#tp-02-14`, `report.md#tp-02-21`
- [x] NFR-023-004 holds: the refusal vocabulary member count equals its pre-feature
      value.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-15`
- [x] NFR-023-003 holds: the mortgage declarations are inventoried, cleared and
      redacted, and the request ledger stays empty.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-16`
- [x] SUP-023-01 through SUP-023-04 are delivered with their markers, each
      replacement derived from the artifact it describes, each superseded clause
      recorded verbatim, and each intended-RED failure recorded before its green.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the conversion browser spec · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-02-17`
- [x] Every excluded path is byte-identical, including `rltaxproperty.js` and both
      non-federal pack families.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, a lifetime figure, a track record or an error
      rate, and no deduction figure is presented as an estimate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-02-01 through TP-02-22 commands · **Evidence:** `report.md#test-evidence`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-02-23`, `report.md#tp-02-24`, `report.md#tp-02-25`
