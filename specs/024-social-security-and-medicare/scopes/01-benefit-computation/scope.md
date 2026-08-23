# Scope 1: Benefit Computation

## 01-benefit-computation

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In Progress (deliverables and tests verified; newly added planning rows unverified)
**Scope-Kind:** runtime-behavior
**Tags:** `foundation:true`, `two-origin-declaration:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** none
**Foundation:** true

**Primary Outcome:** a household declares either the Primary Insurance Amount it
read off a Social Security statement or the earnings a computation needs, plus a
birth year and a claim age, and receives an annual benefit figure with the full
retirement age it was measured from and every sourced factor that adjusted it. The
two origins fail independently, so a household with a statement is never told its
answer is degraded because a wage-indexing series could not be retrieved. This
scope also builds the sourced row lookup and the leg-census machinery that every
later scope in this feature consumes unchanged.

## Requirement Coverage

- **FR-024-001** — `BenefitBasis/v1` carries a `basisOrigin` from the closed set
  `declared-statement-pia` · `computed-from-earnings`; the declared origin carries
  no `sourceRef` and is labelled the household's own input.
- **FR-024-002** — neither origin declared refuses `RLTAX-INPUT-INCOMPLETE` naming
  both; both declared refuses naming the ambiguity; neither is resolved by
  precedence.
- **FR-024-003** — the computed origin derives Average Indexed Monthly Earnings
  from the declared record and a sourced indexing series, and applies each sourced
  bend-point percentage to the portion its own declared breakpoint delimits.
- **FR-024-004** — the full retirement age is read from a sourced table row for the
  declared birth year; a birth year outside the table refuses rather than using an
  adjacent row.
- **FR-024-005** — an early claim applies the sourced per-month reduction factors
  for the months counted; a delayed claim applies the sourced credit rate up to the
  sourced stopping age and no further.
- **FR-024-006** — the record publishes the months counted, the factor applied to
  each, and every sourced parameter with its citation and locator; an unretrieved
  parameter is an `AbsentFigure/v1` and the benefit refuses.
- **FR-024-007** — the benefit settlement is surfaced with a rule status in the
  headline, the comparison, the marginal curve and the export.

Inherited and re-asserted: **NFR-024-001** declared or sourced never conflated,
**NFR-024-002** zero network, **NFR-024-003** no household value in any URL or
request, **NFR-024-004** vocabulary and income-kind counts unchanged,
**NFR-024-005** no figure or authority name in any module, **NFR-024-006** leg
visibility, **NFR-024-007** no probability, **NFR-024-009** Feature 008
byte-identity, **NFR-024-010** no registration, **NFR-024-011** UMD, top-level
declarations, `Number.isFinite`, no `requestAnimationFrame`.

## Gherkin Scenarios

```gherkin
Scenario: SCN-024-001 The two benefit-basis origins are separate object kinds and refuse separately
  Given a household declaring neither a statement Primary Insurance Amount nor an earnings record
  And separately a household declaring both
  When the benefit basis resolves for each
  Then the first is RLTAX-INPUT-INCOMPLETE naming both accepted declarations
  And the second is RLTAX-INPUT-INCOMPLETE naming the ambiguity rather than choosing one
  And a household declaring exactly one settles with its basisOrigin published
  And neither refusal shows a zero or a typical benefit amount

Scenario: SCN-024-002 The Primary Insurance Amount is computed through sourced bend points at their declared breakpoints
  Given a declared earnings record and a sourced bend-point set with its indexing series
  When the computed origin runs
  Then the Average Indexed Monthly Earnings is computed from the declared record and the sourced series
  And each bend-point percentage is applied to the portion its own declared breakpoint delimits
  And the record publishes every breakpoint and percentage with its citation and locator
  And an unretrieved indexing series refuses the computed origin while the declared origin stays available

Scenario: SCN-024-003 Full retirement age, the early reduction and the delayed credit come from sourced tables and stop where the source says
  Given a declared birth year and a declared claim age
  When the claim-age adjustment runs
  Then the full retirement age is read from the sourced table row for that birth year
  And a claim before it applies the sourced per-month reduction factors for the months counted
  And a claim after it applies the sourced credit rate up to the sourced stopping age and no further
  And a birth year outside the sourced table refuses rather than using an adjacent row
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-024-001 neither declared | Packs resolved, both benefit inputs blank | Open the benefit panel | `RLTAX-INPUT-INCOMPLETE` naming both accepted declarations, no numeral, labelled as the household's own missing input | e2e-ui |
| SCN-024-001 both declared | Statement amount and earnings record both supplied | Open the benefit panel | `RLTAX-INPUT-INCOMPLETE` naming the ambiguity and stating that exactly one is required, with no figure computed from either | e2e-ui |
| SCN-024-001 origin labelling | Exactly one origin declared | Open the benefit panel | The `basisOrigin` is named on the panel, the declared amount carries no citation and is labelled the household's input, and every sourced factor carries a citation with its locator | e2e-ui |
| SCN-024-002 computed path | Earnings record declared, bend points retrieved | Open the benefit panel | Indexed earnings, the Average Indexed Monthly Earnings, and each bend-point portion with its percentage and reachable citation | e2e-ui |
| SCN-024-002 indexing absent | Earnings record declared, indexing series absent | Open the benefit panel | `RLTAX-THRESHOLD-UNAVAILABLE` on the computed origin, and a statement that the declared origin remains available with what supplying it would take | e2e-ui |
| SCN-024-003 adjustment | Birth year and an early claim age declared | Open the benefit panel | The full retirement age row, the months counted, each factor applied, and the adjusted annual benefit | e2e-ui |
| SCN-024-003 out of domain | A birth year outside the sourced table's declared domain | Open the benefit panel | `RLTAX-THRESHOLD-UNAVAILABLE` naming the table and its declared domain, with no adjacent row used | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The benefit leg appears in the headline total, the comparison table, the curve contributor list and the export | e2e-ui |

## Implementation Files

### New

- `rltaxsocialsecurity.js` — UMD module owning `resolveBenefitBasis`,
  `computePrimaryInsuranceAmount`, `resolveFullRetirementAge` and
  `applyClaimAgeAdjustment`, every one a top-level `function name(...) {}`
  declaration.
- `tax-rules/benefit/<year>.json` — the benefit-formula pack.
- Fixture packs: one carrying a complete bend-point set, one with the indexing
  series absent, one with the full-retirement-age table absent, one whose table
  declares a narrow domain for the out-of-domain case, one with the delayed credit
  stopping age absent, and one carrying deliberately non-standard breakpoints so a
  recalled figure cannot pass.
- The all-non-zero leg-census fixture, extended with the benefit leg.
- `lifetime-tax-benefit.spec.mjs` — this scope's browser rows, in the
  repository's Playwright spec directory alongside the other `lifetime-tax-*`
  specs.

### Modified

- `rltaxrules.js` — `BenefitBasis/v1`, `ClaimAgeAdjustment/v1`, the `basisOrigin`
  enum, the sourced-row-lookup grammar and its declared-domain member.
- `rltax.js` — stage `CO-20`, the benefit leg, and the leg-census helper extended
  with the surface-naming clause.
- `rltaxworkspace.js` — the statement amount, the earnings record, the birth year
  and the claim age, plus their inventory, clear and export-sanitizer entries.
- `lifetime-tax-strategy-lab.html` — the benefit inputs and the `power-benefit`
  section.
- `scripts/selftest.mjs` — one appended group, plus SUP-024-01.

## Implementation Plan

1. Add `BenefitBasis/v1` to `rltaxrules.js` with the closed `basisOrigin` set.
   Validation refuses a `sourceRef` on the declared amount and refuses a computed
   origin missing any bend-point citation, which is what makes the two origins
   structurally incapable of impersonating each other.
2. Implement the neither-and-both refusals. Both are
   `RLTAX-INPUT-INCOMPLETE` and both are distinguished by contract shape rather
   than by message text, so a copy edit cannot collapse them. **There is no
   precedence branch anywhere**; a reviewer must be able to grep for one and find
   nothing.
3. Add the **sourced row lookup**: a pack table carrying its own declared domain,
   keyed by a declared value, returning an `AbsentFigure/v1` when the key falls
   outside the domain. Scopes 03 and 04 consume this unchanged, so it is written
   once here and not re-invented.
4. Add the **exact-boundary comparison record**, reused from Feature 023's
   `UseClassification/v1` shape: `{ left, operator, right, result }`, published so
   inclusivity is inspectable.
5. Author `rltaxsocialsecurity.js`. Every pure analytic function is a top-level
   `function name(...) {}` declaration so the selftest extractor can lift it; an
   arrow const is silently never extracted and therefore silently never tested.
   Use `Number.isFinite`, never the bare global.
6. Implement `computePrimaryInsuranceAmount` so each sourced percentage is applied
   to the portion its own declared breakpoint delimits. No breakpoint, percentage
   or count is a module constant.
7. Implement `applyClaimAgeAdjustment` so the months counted and the factor applied
   to each are published rather than folded into one multiplier, and so the
   delayed credit is bounded by the sourced stopping age with the bound stated.
8. **Retrieve `BI-1` and `BI-2`.** Open the benefit-formula and wage-indexing
   pages, transcribe the breakpoints, the percentages and the indexing series
   rule, verify every digit against the page, and record each in a `SourceRecord`
   with its locator and `retrievedAt`. Judge the edition year per component kind.
   A figure that cannot be retrieved ships absent and the computed origin refuses
   while the declared origin stays available.
9. **Retrieve `BI-3`, `BI-4` and `BI-5`.** Open the full-retirement-age,
   early-reduction and delayed-credit pages and transcribe the table rows, the
   per-month factors and the credit rate and stopping age the same way. Same
   consequence on failure, except that `BI-3` failing refuses every claim age.
10. Author the benefit pack from the retrieved records only. No figure in
    `spec.md`, `design.md` or this file may be transcribed into it, and none of
    those documents contains one.
11. Add stage `CO-20` and the benefit leg in `rltax.js`, derived from the pack's
    declared leg set rather than from a list in the module.
12. Extend the **leg-census helper** so a failure names both the missing leg and
    the failing surface. Scopes 02 through 05 consume it unchanged.
13. Add the four declarations to `rltaxworkspace.js`. Treat the earnings record and
    the birth year as the most sensitive objects this program carries: extend the
    inventory, the clear action and the export sanitizer, and prove each
    independently. Every one lives inside the existing workspace key, so the
    declared key count is unchanged and an assertion says so **and** says each new
    declaration is inventoried, because an unchanged count is otherwise
    indistinguishable from a declaration that was never inventoried.
14. Render the `power-benefit` section and the origin labelling. Bind every control
    through the existing declaration-signature no-op guard so a re-render with an
    unchanged signature performs no DOM replacement and cannot detach a focused
    node. Scope every assertion to `#power-benefit` or `#simple`; use no unscoped
    `.first()`.
15. Deliver SUP-024-01 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure).
16. Append a `lifetime-tax — social security benefit basis` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxrules.js` contract registry | Two contracts and one enum added | Scopes 02–05 | High — a validator that accepts a `sourceRef` on a declared amount destroys the feature's central distinction | Assert a declared basis carrying a citation is refused and a computed basis missing one is refused, before either is consumed | Remove both contracts |
| The sourced row lookup | New shared lookup shape | Scopes 03, 04 | High — a lookup that falls back to an adjacent row would silently produce a plausible wrong figure in three separate families | Assert an out-of-domain key returns an `AbsentFigure` and never a neighbouring row, against a fixture table with a deliberately narrow domain | Remove the lookup and inline the table read |
| `rltax.js` leg set | The benefit leg added, derived from the pack | Scopes 02–05 and Features 021–023 reconciliation | High — a hardcoded leg list would silently drop every later leg | Assert Features 021 through 023 fixtures produce their exact prior leg sets before the benefit leg is added | Remove the leg from the pack's declared set |
| The leg-census helper | Extended to name the failing surface | Scopes 02–05 | High — a helper that passes on an all-zero fixture proves nothing and would certify the exact defect it exists to catch | Assert the helper fails when the benefit leg is removed from each of the four surfaces in turn, on the all-non-zero fixture, naming the surface each time | Revert to the Feature 023 helper |
| `rltaxworkspace.js` | Four declarations plus the privacy surface | Scopes 02–05 | High — an earnings record is a year-by-year employment history | Assert each new declaration is inventoried, cleared, redacted, and absent from every URL, request, referrer and console message, and assert the declared key count is unchanged | Remove the members |
| `POWER_SECTION_IDS` and the withheld-link set | One section added | Scopes 02–05 | Low — both counts were converted to derived identities by SUP-023-05 and SUP-023-06 and absorb this growth | Assert the derived identity still holds in both directions with the new section present | Remove the section |
| `scripts/selftest.mjs` | One group appended plus SUP-024-01 | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the marker |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxsocialsecurity.js` · `tax-rules/benefit/<year>.json` · this
scope's fixture packs and leg-census fixture · `lifetime-tax-benefit.spec.mjs`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `lifetime-tax-strategy.config.json` ·
`scripts/selftest.mjs` (append, plus SUP-024-01) · `tests/lifetime-tax.support.mjs`,
`tests/lifetime-tax-foundation.spec.mjs`, `tests/lifetime-tax-route.spec.mjs` and
`tests/lifetime-tax-property.spec.mjs` (SUP-024-09 only).

The four test files and `lifetime-tax-strategy.config.json` were added to this
list during implementation under the
[ASC-8 in-flight admission](../_index.md#asc-8-in-flight-admission), because the
benefit pack is a request the route genuinely makes and SUP-023-10's derivation
genuinely did not admit it. The
[per-file marker distribution](../design.md#per-file-marker-distribution) now
places SUP-024-09 in those four test files and names this scope as their owner,
which is what makes opening them admissible. No other prior-feature test file is
opened, and no assertion in any of them is weakened or removed.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `specs/023-*/**` · `rltaxstrategy.js` · `rltaxstate.js` ·
`rltaxcombined.js` · `rltaxproperty.js` · `rltaxrental.js` · `rltaxuse.js` ·
`rltaxdisposition.js` · `tax-rules/federal/**` · `tax-rules/state/**` ·
`tax-rules/property/**` · `tools.json` · `index.html` · `rlnav.js` · `README.md` ·
`notes/README.md` · `market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every `tests/lifetime-tax-*.spec.mjs`
except this scope's new file and the three carrying SUP-024-09 · every
framework-managed file.

`tax-rules/federal/**` is excluded deliberately. Establishing what a benefit *is*
must not require an income-tax pack edit; if it does, the benefit axis is not a
seam. Scope 02 opens it for the inclusion policy, which is the first thing that
genuinely belongs there.

**Allowed file families:** the *Allowed new* and *Allowed modified* paths named
above, and nothing else.

**Excluded surfaces:** the byte-identical list named above. Collateral cleanup
outside the allowed families is opt-in and is not performed under this scope.

**Rollback:** delete `rltaxsocialsecurity.js`, the benefit pack and the fixtures;
revert the two contracts, the `basisOrigin` enum, the sourced row lookup, stage
`CO-20`, the benefit leg, the census extension and the workspace members; revert
the page section; revert SUP-024-01 to its superseded clause.

## Assertion Supersession Owned By This Scope

Two entries: **SUP-024-01** and **SUP-024-09**.

**SUP-024-01** is caused by a deliberate change this scope's requirement coverage
names — FR-024-001 through FR-024-005 add a module of pure analytic functions, so
the hand-maintained count of extractable functions stops describing the tree. The
replacement derives the count from the modules the extractor is pointed at and
asserts the per-module breakdown, so the three modules Scopes 02 through 04 add
are absorbed without a further entry and a module contributing nothing fails by
name.

**SUP-024-09** was admitted in flight under ASC-8. FR-024-006 and FR-024-007 add
a fourth pack family, and SUP-023-10's permitted-asset derivation named the three
pre-existing families one key at a time, so the benefit pack was a request the
route genuinely makes and the derivation genuinely did not admit. The replacement
derives the family set from the configuration itself, and the route is changed to
DECLARE its benefit pack in that same configuration surface rather than assembling
the path inline. All four ASC-8 surfaces were updated in the same change.

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside these two that fails is either a defect in this
scope's change and is fixed, or a further ASC-8 admission recorded in the ledger —
across all four surfaces — before the edit.

## Consumer Impact Sweep

This scope fixes the benefit pack path grammar, the `basisOrigin` enum members,
the stage identifiers and the workspace member names. Any rename, move or
removal of one of those identifiers reaches the surfaces below, and each
surface is swept before the scope closes.

| Consumer surface | What a rename or removal would break | Sweep proof |
| --- | --- | --- |
| The benefit pack path the route reads as an API client | A moved pack path turns a declared read into an unresolved request | The declared-read canary fails on any declared read that does not resolve |
| The route's benefit section and its anchor ids | A renamed stage leaves the section unavailable instead of resolved | Every declared stage resolves to a rendered row in the browser row |
| Deep links and breadcrumb anchors into that section | A renamed anchor id makes a shared deep link land on nothing | Every anchor the page emits is resolved rather than assumed |
| Sibling scopes and fixtures that name the same enum or stage | A renamed member leaves a fixture asserting an identifier that no longer exists | An unknown enum member refuses by name rather than defaulting |
| Documentation, notes and any redirect entry | A renamed identifier leaves a stale reference | A repository-wide stale-reference scan for the old identifier returns zero first-party rows |

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** a workspace declaring **both** a
statement Primary Insurance Amount and an earnings record must refuse
`RLTAX-INPUT-INCOMPLETE` naming the ambiguity, and the refusal record must carry
no benefit amount computed from either declaration. Before the two-origin contract
exists, the resolver returns a figure from one of them and the assertion fails on
the presence of that figure — which is precisely the precedence behaviour this
scope exists to prevent. A syntax error, a missing browser or an absent test does
not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-01-00 | Fixture Canary | unit | SCN-024-001 … -003 | `scripts/selftest.mjs` | Canary: the shared selftest harness plus this scope's own benefit-pack fixture files load and the pre-existing assertion count does not fall, run alone before any broad rerun. Adversarial case: a fixture whose contract changed must redden this row before the broad suite is re-run, so a broad green can never be the first signal | `node scripts/selftest.mjs` | No | `report.md#tp-01-00` |
| TP-01-01 | Contract | unit | SCN-024-001 | `scripts/selftest.mjs` | `BenefitBasis/v1` refuses a `sourceRef` on a declared statement amount, and refuses a computed origin whose bend points carry no citation or no locator | `node scripts/selftest.mjs` | No | `report.md#tp-01-01` |
| TP-01-02 | Refusal separation | unit | SCN-024-001 | `scripts/selftest.mjs` | Neither origin declared refuses `RLTAX-INPUT-INCOMPLETE` naming both accepted declarations; both declared refuses naming the ambiguity; the two are distinguished by contract shape and not by message text | `node scripts/selftest.mjs` | No | `report.md#tp-01-02` |
| TP-01-03 | Adversarial | unit | SCN-024-001 | `scripts/selftest.mjs` | Regression: an implementation preferring the statement amount when both origins are declared is proven to fail, and the failure names the precedence it took | `node scripts/selftest.mjs` | No | `report.md#tp-01-03` |
| TP-01-04 | Known value | unit | SCN-024-002 | `scripts/selftest.mjs` | Against a fixture pack with deliberately non-standard breakpoints, each percentage is applied to the portion its own breakpoint delimits, asserted below, exactly at and above each breakpoint | `node scripts/selftest.mjs` | No | `report.md#tp-01-04` |
| TP-01-05 | Adversarial | unit | SCN-024-002 | `scripts/selftest.mjs` | Regression: an implementation using recalled breakpoints is proven to fail against the non-standard fixture, and one applying a percentage to the whole rather than to its portion is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-05` |
| TP-01-06 | Independence | unit | SCN-024-002 | `scripts/selftest.mjs` | With the indexing series absent the computed origin refuses `RLTAX-THRESHOLD-UNAVAILABLE` and the declared origin settles unchanged in the same run, proving the two paths fail independently | `node scripts/selftest.mjs` | No | `report.md#tp-01-06` |
| TP-01-07 | Known value | unit | SCN-024-003 | `scripts/selftest.mjs` | The full retirement age is read from the sourced table row for the declared birth year, asserted at the first row, an interior row and the last row of the fixture table's declared domain | `node scripts/selftest.mjs` | No | `report.md#tp-01-07` |
| TP-01-08 | Adversarial | unit | SCN-024-003 | `scripts/selftest.mjs` | Regression: a birth year one outside the fixture table's declared domain returns an `AbsentFigure` and refuses; an implementation clamping to the nearest row is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-01-08` |
| TP-01-09 | Known value | unit | SCN-024-003 | `scripts/selftest.mjs` | An early claim applies the sourced per-month factors for the months counted and publishes each; a delayed claim applies the credit up to the sourced stopping age, and a claim age beyond it accrues no further credit with the bound stated | `node scripts/selftest.mjs` | No | `report.md#tp-01-09` |
| TP-01-10 | Adversarial | unit | SCN-024-003 | `scripts/selftest.mjs` | Regression: an implementation accruing delayed credit past the sourced stopping age is proven to fail, and one folding the months into a single multiplier is proven to fail the published-factors assertion | `node scripts/selftest.mjs` | No | `report.md#tp-01-10` |
| TP-01-11 | Sourcing | unit | SCN-024-002 | `scripts/selftest.mjs` | Every value-bearing member of the shipped benefit pack resolves to exactly one retrieved source with a locator and a `retrievedAt`, every member from another edition year carries a quoted `yearInvarianceBasis`, and every unretrieved member is an `AbsentFigure` with a `missingSource` pointer and no smuggled numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-01-11` |
| TP-01-12 | Leg visibility | unit | SCN-024-003 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the settled record's declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export, in both directions | `node scripts/selftest.mjs` | No | `report.md#tp-01-12` |
| TP-01-13 | Adversarial | unit | SCN-024-003 | `scripts/selftest.mjs` | Regression: removing the benefit leg from each of the four surfaces in turn is proven to fail, and each failure names both the missing leg and the failing surface | `node scripts/selftest.mjs` | No | `report.md#tp-01-13` |
| TP-01-14 | Vocabulary | unit | SCN-024-001 | `scripts/selftest.mjs` | The refusal vocabulary member count and the supported income-kind count each equal their pre-feature values, and every pre-existing member retains its meaning and raising site | `node scripts/selftest.mjs` | No | `report.md#tp-01-14` |
| TP-01-15 | No-shadow | unit | SCN-024-002 | `scripts/selftest.mjs` | Regression: no module holds a bend point, a percentage, a factor, an age, an agency name or a publication name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-01-15` |
| TP-01-16 | Privacy | unit | SCN-024-001 | `scripts/selftest.mjs` | Each of the four declarations is inventoried, cleared, redacted by the export sanitizer, and absent from every URL, request, referrer and console message; the declared storage key count is asserted unchanged in the same assertion that asserts each declaration is inventoried | `node scripts/selftest.mjs` | No | `report.md#tp-01-16` |
| TP-01-17 | Harness | unit | SCN-024-002 | `scripts/selftest.mjs` | The new module is UMD rather than ESM, every pure analytic function is a top-level declaration the extractor lifts, the module uses `Number.isFinite` rather than the bare global, and it wraps no drawing in `requestAnimationFrame` | `node scripts/selftest.mjs` | No | `report.md#tp-01-17` |
| TP-01-18 | Supersession | unit | SCN-024-002 | `scripts/selftest.mjs` | SUP-024-01's replacement derives the extractable-function count from the scanned module set and asserts the per-module breakdown; the superseded literal is proven to have failed first, and a function rewritten as an arrow const is proven to be reported by module name | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-01-19 | Render safety | unit | SCN-024-003 | `scripts/selftest.mjs` | Every control this scope adds routes through the declaration-signature no-op guard, a re-render with an unchanged signature performs no DOM replacement, and the `power-benefit` renderer reads only members the settlement publishes | `node scripts/selftest.mjs` | No | `report.md#tp-01-19` |
| TP-01-20 | Regression E2E | e2e-ui | SCN-024-001 | `lifetime-tax-benefit.spec.mjs` | `Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount" --reporter=list` | Yes | `report.md#scenario-scn-024-001` |
| TP-01-21 | Regression E2E | e2e-ui | SCN-024-002 | `lifetime-tax-benefit.spec.mjs` | `Regression: SCN-024-002 the computed origin publishes its bend points and refuses alone when the indexing series is absent` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-002 the computed origin publishes its bend points and refuses alone when the indexing series is absent" --reporter=list` | Yes | `report.md#scenario-scn-024-002` |
| TP-01-22 | Regression E2E | e2e-ui | SCN-024-003 | `lifetime-tax-benefit.spec.mjs` | `Regression: SCN-024-003 the full retirement age row, the months counted and each factor applied are shown and an out-of-domain birth year refuses` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-003 the full retirement age row, the months counted and each factor applied are shown and an out-of-domain birth year refuses" --reporter=list` | Yes | `report.md#scenario-scn-024-003` |
| TP-01-23 | Leg visibility E2E | e2e-ui | SCN-024-003 | `lifetime-tax-benefit.spec.mjs` | `Regression: SCN-024-003 the benefit leg reaches the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-003 the benefit leg reaches the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-01-23` |
| TP-01-24 | Privacy E2E | e2e-ui | SCN-024-001 | `lifetime-tax-benefit.spec.mjs` | `Regression: SCN-024-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no benefit declaration reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-001 the request ledger does not grow after first paint, every entry is a declared same-origin read, and no benefit declaration reaches a URL" --reporter=list` | Yes | `report.md#tp-01-24` |
| TP-01-25 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-*, SCN-024-001 … -003 | The prior features' specs plus this scope's | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row. **Outstanding — no run of this row's command as corrected exists yet.** `report.md#tp-01-25--the-named-cumulative-command-run-for-the-first-time` records that two sessions substituted a `tests/lifetime-tax-*.spec.mjs` file-glob superset for the named command, and that a later session finally ran it as written — but under the then-ambiguous unbracketed `SCN-02` selector, which selected 67 tests including the concurrent session's `SCN-025-*` and `SCN-026-*`. That evidence is therefore for a superseded command. One real execution of the corrected command above is still owed | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-01-25` |
| TP-01-26 | Repo gate | unit | SCN-024-001 … -003 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-01-26` |
| TP-01-27 | Path guard | unit | SCN-024-001 … -003 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-01-27` |
| TP-01-28 | Deploy gate | unit | SCN-024-001 … -003 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-01-28` |

### Definition of Done

A row is checked only when it is genuinely satisfied and was observed to be
satisfied. A row that is not satisfied stays `[ ]` and carries a stated reason. If
delivery makes a row's claim false, the row is corrected rather than checked.

- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-024-001, SCN-024-002 and SCN-024-003 pass under the exact persistent titles this scope's Test Plan names, and each of those titles is present in the spec file rather than merely selected by `--grep`. Adversarial case: renaming or deleting one of those persistent titles must fail this row, so an empty grep selection can never be read as a pass.
- [ ] Broader E2E regression suite passes across the whole lifetime-tax browser family, not this scope's own spec file alone. Adversarial case: a change made inside this scope that reddens a sibling scope's persistent title must fail this row even while this scope's own rows stay green.
- [ ] Change Boundary is respected and zero excluded file families were changed, proven by a path-scoped `git status --porcelain` over the excluded surfaces plus an mtime comparison for any untracked excluded directory. Adversarial case: touching one excluded path must produce a row and fail this item; `git diff --quiet` alone is not accepted, because it reports an untracked path as unchanged.
- [ ] The Consumer Impact Sweep is complete for every renamed, moved or removed route, path, contract, identifier and UI target in this scope, and zero stale first-party references remain. Adversarial case: one stale reference left in navigation, a breadcrumb, a redirect, a deep link, an API client read or a doc must fail this row, and the proof must be a repository-wide stale-reference scan rather than a spot check.
- [ ] Independent canary suite for shared fixture/bootstrap contracts passes before broad suite reruns, run as its own command ahead of the whole-repository gate. Adversarial case: breaking one shared fixture contract must redden the canary first; a canary that stays green while the broad suite fails is itself a defect and fails this row.
- [ ] Rollback or restore path for shared infrastructure changes is documented and verified by executing it, not by asserting that it exists. Adversarial case: a rollback that leaves the shared surface differing from its pre-change hash must fail this row.

- [x] FR-024-001 and FR-024-002 are implemented: the declared origin refuses a
      citation, the computed origin requires one, neither-declared and
      both-declared each refuse by contract shape, and no precedence branch exists
      anywhere in any module.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-01`, `report.md#tp-01-02`, `report.md#tp-01-03`
- [x] FR-024-003 is implemented: each sourced percentage is applied to the portion
      its own declared breakpoint delimits, proven against a fixture pack with
      deliberately non-standard breakpoints so a recalled figure cannot pass.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-04`, `report.md#tp-01-05`
- [x] The two origins fail independently: an absent indexing series refuses the
      computed origin while the declared origin settles unchanged in the same run.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-01-06`, `report.md#scenario-scn-024-002`
- [x] FR-024-004 and FR-024-005 are implemented: the sourced row lookup returns an
      `AbsentFigure` outside its declared domain and never a neighbouring row, the
      months counted and each factor applied are published rather than folded, and
      the delayed credit is bounded by the sourced stopping age with the bound
      stated.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-07`, `report.md#tp-01-08`, `report.md#tp-01-09`, `report.md#tp-01-10`
- [x] FR-024-006 holds and `BI-1` through `BI-5` were closed by retrievals
      performed in the implementation session, each verified digit by digit against
      the retrieved page and recorded with its own `retrievedAt` and locator, with
      the edition year judged per component kind — or the affected member ships as
      an `AbsentFigure/v1`, its path refuses, and the behaviour is proven by a
      fixture pack instead.
  - **Phase:** implement · **Command:** the retrieval records in the benefit pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-01-11`
- [x] FR-024-007 and NFR-024-006 are implemented: the benefit leg is surfaced in
      the headline, the comparison, the curve and the export, proven by a
      two-directional set identity against a fixture in which every leg is non-zero
      and mutually distinct, and removing the leg from each surface in turn is
      demonstrated to fail with both the leg and the surface named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-01-12`, `report.md#tp-01-13`, `report.md#tp-01-23`
- [x] NFR-024-004 holds: the refusal vocabulary member count and the supported
      income-kind count each equal their pre-feature values and no member's meaning
      changed.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-14`
- [x] NFR-024-003 and NFR-024-005 hold: every one of the four declarations is
      inventoried, cleared and redacted, the declared storage key count is asserted
      unchanged in the same assertion that asserts each declaration is inventoried,
      the request ledger does not grow after first paint, every entry in it is a
      read of a path the route's own configuration declares, the benefit pack is
      present in the ledger the run produced, and no module holds a figure or an
      authority name.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-01-15`, `report.md#tp-01-16`, `report.md#tp-01-24`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "the request
    ledger stays empty with a benefit pack now loaded from disk", which is false
    and self-contradictory: a ledger holding the benefit pack read is not empty.
    The cited row `TP-01-24` (`SCN-024-001`) asserts
    `expect(afterFirstPaint).toBeGreaterThan(0)`, then
    `expect(ledger.length).toBe(afterFirstPaint)`, then
    `paths.forEach((path) => expect(permitted).toContain(path))`, then
    `expect(paths).toContain('/' + BENEFIT_PACK_PATH)`. Adversarial cases: a
    request issued after first paint fails the no-growth assertion; a read of a
    path the configuration does not declare fails the permitted-set assertion; a
    boot that read nothing fails the greater-than-zero pin; and a benefit pack
    that is permitted but never fetched fails the `toContain` pin. The row does
    NOT constrain the origin of an entry — it compares `new URL(entry.url).pathname`
    only — so no same-origin claim is made here; that gap is carried by Feature
    021 Scope 01 `TP-01-18`.
  - **Amended 2026-08-23 (F-REG-03 closure).** The final sentence above no
    longer describes the row. `SCN-024-001` now projects the ledger through the
    shared `sameOriginPaths(ledger, site)`, which refuses on origin before it
    returns any pathname, so the row DOES constrain the origin of an entry. The
    change is a conjunct rather than a replacement: every assertion and every
    adversarial case listed above is unchanged. The new adversarial case is a
    read whose pathname is declared but whose origin is not the route's, probed
    at
    `specs/021-lifetime-tax-strategy-lab/scopes/01-tax-workspace-rule-pack-and-privacy-foundation/report.md#the-decisive-probe--a-cross-origin-url-with-a-declared-pathname`.
    The tick above is not withdrawn: its claim was about no-growth and declared
    paths, both still executed and both now strictly better supported.
- [x] NFR-024-011 holds: the new module is UMD, every pure analytic function is a
      top-level declaration the extractor lifts, `Number.isFinite` is used rather
      than the bare global, and no drawing is wrapped in `requestAnimationFrame`.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-17`
- [x] Every control added routes through the declaration-signature no-op guard, a
      re-render with an unchanged signature performs no DOM replacement, and the
      `power-benefit` renderer reads only members the settlement publishes.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-01-19`
- [x] SUP-024-01 is delivered with its marker, the replacement derived from the
      scanned module set, the superseded clause recorded verbatim, and the
      intended-RED failure recorded before its green.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-01-18`
- [x] Every excluded path is byte-identical, including `tax-rules/federal/**`,
      proving that establishing what a benefit is did not require an income-tax
      pack edit.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list, plus the federal pack's declared content digest re-derived at load · **Evidence:** `report.md#change-boundary`
- [x] No output states a probability, a plan success figure, a future-year figure,
      a track record or an error rate, and no benefit figure is presented as an
      estimate or a typical amount.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Satisfied.** All twenty-eight rows now carry intended RED and same-command
    GREEN. Twenty-six hold a dedicated probe in which the assertion's own subject
    was reverted in the product, the named assertion was observed to fail under
    the row's own command, the subject was restored byte-identically and the
    identical command was re-run. TP-01-25's named `--grep "SCN-02"` command has
    been run as written in both directions. TP-01-14's borrowed RED was replaced
    with a dedicated one. Two rows rest on evidence that is honestly weaker and
    is labelled as such: **TP-01-26**, whose claim is about the suite as a whole
    and whose RED can only ever come from another row's probe, and **TP-01-18**,
    which carried its RED from the implementation session.
  - **Selector correction after this evidence was recorded (planning note, no
    evidence claimed).** TP-01-25's command is now `--grep "SCN-02[1-4]"`. The RED
    and GREEN cited above were both observed under the superseded `--grep "SCN-02"`,
    which also selected a concurrent session's `SCN-025-*` and `SCN-026-*`, so that
    pair is not evidence for the row as it now reads. This item is left as it stands
    — only `bubbles.test` may re-run the corrected command and restate the claim.
  - **Phase:** implement · **Command:** the exact TP-01-01 through TP-01-28 commands · **Evidence:** `report.md#per-row-intended-red-and-same-command-green`, `report.md#second-evidence-session--the-nine-rows-that-had-no-intended-red`, `report.md#test-evidence`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-01-26`, `report.md#tp-01-27`, `report.md#tp-01-28`
