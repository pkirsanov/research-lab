# Scope 3: Claim-Age Comparison

## 03-claim-age-comparison

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Done with concerns
**Scope-Kind:** runtime-behavior
**Tags:** `deterministic:true`, `no-probability:true`, `claim-boundary:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01
**Foundation:** false

**Primary Outcome:** a household declares a set of claim ages and receives, for
each, the adjusted annual benefit and the cumulative total to the sourced
life-expectancy age, plus the age at which two of those cumulative totals are
equal — presented in the order it declared them, with the mortality source named,
and with the record saying in its own words that these are arithmetic over
declared figures rather than a prediction. Nothing here is a probability, nothing
is ranked, and nothing is recommended.

## Requirement Coverage

- **FR-024-015** — the mortality pack carries a life-expectancy figure by age and
  no probability-bearing member; a pack carrying one is refused.
- **FR-024-016** — each declared claim age's cumulative total is the adjusted
  annual benefit summed over the whole years from that claim age to the sourced
  life-expectancy age.
- **FR-024-017** — the age at which two claim ages' cumulative totals are equal is
  published with both claim ages named and with the record's own statement that it
  is arithmetic over declared figures rather than a prediction.
- **FR-024-018** — the record carries no probability, rank, score, success,
  survival, recommendation, discount-rate or appreciation member, proven by an
  exhaustive enumeration of every member name in it.
- **FR-024-019** — claim ages are presented in declared order and none is marked
  best, optimal, recommended or preferred.
- **FR-024-020** — an absent mortality figure withholds the cumulative totals and
  the equality age rather than substituting a default horizon.
- **FR-024-021** — the comparison is deterministic: two runs over identical
  declarations produce byte-identical records.

Inherited and re-asserted: **NFR-024-001** declared or sourced never conflated,
**NFR-024-002** zero network, **NFR-024-003** no household value in any URL or
request, **NFR-024-004** vocabulary and income-kind counts unchanged,
**NFR-024-005** no figure or authority name in any module, **NFR-024-007** no
probability, **NFR-024-008** no track record or accuracy figure, **NFR-024-009**
Feature 008 byte-identity, **NFR-024-010** no registration, **NFR-024-011**
harness rules.

## Gherkin Scenarios

```gherkin
Scenario: SCN-024-007 The claim-age comparison is deterministic and carries no probability
  Given a declared set of claim ages and a sourced mortality basis
  When the comparison runs twice over identical declarations
  Then the two records are byte-identical
  And the mortality basis is the life-expectancy column alone
  And a pack offering a probability-bearing member is refused RLTAX-PACK-INVALID naming the member
  And an exhaustive enumeration of every member name in the record finds no probability, rank, score, success, survival or recommendation member

Scenario: SCN-024-008 The cumulative totals and the age at which they are equal are arithmetic over declared figures
  Given two declared claim ages and a sourced life-expectancy figure
  When the comparison runs
  Then each claim age's cumulative total is the adjusted annual benefit summed over the whole years from that claim age to the life-expectancy age
  And the age at which the two cumulative totals are equal is published with both claim ages named
  And the record states in its own words that the figure is arithmetic over declared figures rather than a prediction
  And no discount rate and no appreciation assumption appears anywhere in the record
  And an absent life-expectancy figure withholds both the cumulative totals and the equality age rather than substituting a default horizon

Scenario: SCN-024-009 The comparison ranks nothing and recommends nothing
  Given a comparison across three claim ages in which one produces a larger cumulative total than the others
  When the record is produced and rendered
  Then no claim age is marked best, optimal, recommended or preferred
  And the ages are presented in declared order rather than sorted by any figure
  And the record states that it selects nothing
  And a rendering that ordered or emphasised by outcome is proven to fail
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-024-007 determinism | A settled benefit and three declared claim ages | Open the claim-age panel, reload, open it again | The rendered table is identical between the two loads, cell for cell | e2e-ui |
| SCN-024-007 mortality source | A resolved mortality pack | Open the claim-age panel | The table id, its own table year and a reachable citation with its locator, and no probability column anywhere on the panel | e2e-ui |
| SCN-024-008 cumulative totals | Two declared claim ages, life-expectancy figure resolved | Open the claim-age panel | Per age: the adjusted annual benefit, the whole-year count, and the cumulative total; and the equality age with both claim ages named | e2e-ui |
| SCN-024-008 record statements | Any complete comparison | Open the claim-age panel | The record's own result-kind statement and its selects-nothing statement, both rendered as text on the panel rather than held only in the record | e2e-ui |
| SCN-024-008 mortality absent | Life-expectancy figure absent | Open the claim-age panel | `RLTAX-THRESHOLD-UNAVAILABLE` in place of the cumulative totals and the equality age, with the per-age adjusted benefits still shown | e2e-ui |
| SCN-024-009 declared order | Three claim ages declared in an order that is not ascending by cumulative total | Open the claim-age panel | The rows appear in the declared order, no row is emphasised, and no cell carries a best, optimal, recommended or preferred marker | e2e-ui |

## Implementation Files

### New

- `rltaxclaimage.js` — UMD module owning `resolveMortalityBasis`,
  `cumulativeBenefitTotal` and `cumulativeParityAge`, every one a top-level
  `function name(...) {}` declaration.
- `tax-rules/mortality/<year>.json` — the life-expectancy pack.
- Fixture packs: one carrying a complete life-expectancy column, one with the
  figure for the relevant age absent, one carrying a probability-bearing member
  that must be refused, and one whose life-expectancy figures are deliberately
  non-standard so a recalled table cannot pass.
- `lifetime-tax-claim-age.spec.mjs` — this scope's browser rows, in the
  repository's Playwright spec directory alongside the other `lifetime-tax-*`
  specs.

### Modified

- `rltaxrules.js` — `MortalityBasis/v1`, `ClaimAgeComparison/v1`, and the
  probability-member refusal.
- `rltax.js` — stage `CO-23`.
- `rltaxworkspace.js` — the declared claim-age set plus its privacy surface.
- `lifetime-tax-strategy-lab.html` — the claim-age inputs and the
  `power-claim-age` section.
- `scripts/selftest.mjs` — one appended group. **No supersession marker.**

## Implementation Plan

1. Add `MortalityBasis/v1`. Validation **refuses** any member whose name or
   declared kind indicates a probability, a survivorship count or a hazard, with
   `RLTAX-PACK-INVALID` naming the member. This is written before the pack is
   authored, so a pack carrying an extra column cannot be quietly accepted.
2. Add `ClaimAgeComparison/v1` with `perAge[]` in declared order, `parityAges[]`,
   `resultKindStatement` and `selectsNothingStatement`. The two statements are
   members of the record rather than page copy, so they travel with the record
   into the export.
3. Author `rltaxclaimage.js`. Every pure analytic function is a top-level
   declaration; use `Number.isFinite`; no figure, age or authority name appears in
   the module. **No canvas drawing in this scope is wrapped in
   `requestAnimationFrame`** — the panel must render correctly in a background
   tab, where that callback does not fire.
4. Implement `cumulativeBenefitTotal` as a sum over whole years from the claim age
   to the sourced life-expectancy age. No discount rate, no growth rate, no
   inflation adjustment and no partial-year interpolation exists anywhere in the
   module; a reviewer must be able to grep for each and find nothing.
5. Implement `cumulativeParityAge` over a pair of claim ages, returning the age at
   which the two cumulative totals are equal together with both claim ages by
   name. **Apply ASC-9 deliberately here.** This is a break-even-style output and
   the repository carries five separate forbidden-token detectors for break-even
   claims. The permitted response taken by this scope is to make the claim
   genuinely weaker than the one those detectors forbid: an equality of two sums
   over declared figures, stated by the record to be arithmetic rather than a
   prediction. Choosing a synonym so the same claim passes the same scan is
   forbidden and is not admissible to the ledger. Record the decision and its
   reasoning in `report.md`.
6. **Extend the claim-boundary detectors rather than superseding them.** Add
   `rltaxclaimage.js` and `tax-rules/mortality/<year>.json` to the scanned file
   sets in the two selftest claim scans, and assert every forbidden token stays
   forbidden in them. This is a strengthening; it adds files to a scan and removes
   nothing.
7. Add the record's own exhaustive member enumeration, using the same forbidden
   member list the conversion comparison record already uses. The conversion
   record's own enumeration is **not** shared, extended or modified — it is
   retained verbatim and this scope gets its own.
8. Implement the declared-order guarantee: `perAge[]` is built by iterating the
   declared claim ages, and no sort exists anywhere in the module or the renderer.
9. **Retrieve `BI-9`.** Open the period life table, transcribe the
   life-expectancy figure by age and the table's own year, verify every digit
   against the page, and record it in a `SourceRecord` with its locator and
   `retrievedAt`. Judge the edition year per component kind. If the figure cannot
   be retrieved it ships absent, the cumulative totals and the parity age are
   withheld, and the per-age adjusted benefits still render.
10. Author the mortality pack from the retrieved record only, carrying the
    life-expectancy column and nothing else. No figure in `spec.md`, `design.md`
    or this file may be transcribed into it, and none of those documents contains
    one.
11. Add stage `CO-23` in `rltax.js`. The stage reads the adjusted annual benefit
    Scope 01 produced and the mortality basis, and nothing else.
12. Add the declared claim-age set to `rltaxworkspace.js` with its inventory,
    clear and export-sanitizer entries. A claim age discloses an intention and is
    treated as a household value.
13. Render the `power-claim-age` section. Bind every control through the
    declaration-signature no-op guard. Scope every assertion to `#power-claim-age`
    or `#simple`; use no unscoped `.first()`. The renderer reads only members the
    settlement publishes, so an absent life-expectancy figure cannot abort
    `renderPower()`.
14. Append a `lifetime-tax — claim age comparison` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The claim-boundary scanned file sets | Two files added to two scans | Every feature's claim boundary | **Medium and asymmetric** — adding a file to a scan can only refuse more, never less, so the risk is a false refusal on a legitimate string rather than a missed leak | Assert every pre-existing scanned file still passes unchanged, and assert the two added files are actually scanned by planting a forbidden token in a fixture copy and proving it is caught | Remove the two files from the sets |
| `rltaxrules.js` contract registry | Two contracts and one refusal added | Scope 05 | Medium — a probability refusal that matches on name alone would reject a legitimate member whose name merely contains a substring | Assert the refusal fires on a probability-bearing member and does not fire on a life-expectancy member, against fixtures carrying both | Remove both contracts |
| The forbidden-member enumeration | A second, independent enumeration added | Scope 05 | Low — it is additive and the conversion record's own enumeration is untouched | Assert the conversion record's enumeration is byte-identical and still passes | Remove the new enumeration |
| `rltaxworkspace.js` | The claim-age set plus its privacy surface | Scope 05 | Medium — a claim age discloses an intention | Assert the set is inventoried, cleared, redacted and absent from every URL, request, referrer and console message | Remove the member |
| `POWER_SECTION_IDS` and the withheld-link set | One section added | Scope 05 | Low — both counts are derived identities and absorb this growth | Assert the derived identity still holds in both directions | Remove the section |
| `scripts/selftest.mjs` | One group appended, no marker | The whole-repo gate | Low | Pre-existing pass count must not fall | Remove the group |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxclaimage.js` · `tax-rules/mortality/<year>.json` · this
scope's fixture packs · `lifetime-tax-claim-age.spec.mjs`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append, plus the two
claim-scan file-set extensions).

No prior-feature test file is opened. The
[per-file marker distribution](../design.md#per-file-marker-distribution) places
no marker owned by this scope in any file, because this scope owns no ledger
entry. The two selftest claim-scan extensions are **strengthenings, not
supersessions**: they add files to a scanned set and remove no token, no clause
and no assertion. They therefore require no marker and no ledger row, and
`report.md` records that determination explicitly so a later reader does not
mistake an unmarked edit for an unrecorded one.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `specs/023-*/**` · `rltaxsocialsecurity.js` ·
`rltaxinclusion.js` · `rltaxstrategy.js` · `rltaxstate.js` · `rltaxcombined.js` ·
`rltaxproperty.js` · `rltaxrental.js` · `rltaxuse.js` · `rltaxdisposition.js` ·
`tax-rules/federal/**` · `tax-rules/state/**` · `tax-rules/property/**` ·
`tax-rules/benefit/**` · `tools.json` · `index.html` · `rlnav.js` · `README.md` ·
`notes/README.md` · `market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every `tests/lifetime-tax-*.spec.mjs`
except this scope's new file · `tests/lifetime-tax.support.mjs` · every
framework-managed file.

`tax-rules/federal/**` is excluded deliberately. A comparison across claim ages
touches no tax total and must not require a federal pack edit; if it does, the
comparison is computing something it should not be.

**Rollback:** delete `rltaxclaimage.js`, the mortality pack and the fixtures;
revert the two contracts, the probability refusal, stage `CO-23`, the workspace
member and the two claim-scan file-set extensions; revert the page section.

## Assertion Supersession Owned By This Scope

**None.** That is a finding, not an omission.

This scope's whole neighbourhood was examined during planning: the five
forbidden-token detectors for break-even claims, the conversion record's
forbidden-member enumeration, and the per-feature claim scans. Every one was
cleared, and the reasoning is recorded in
[Assertions considered and not superseded](../spec.md#assertions-considered-and-not-superseded).
The reason none is eligible is **RD-5**: this feature does not emit the claim
those detectors forbid. It emits a weaker one, and it extends the detectors to
cover its own files rather than carving an exception out of them.

The implementer is nonetheless bound by ASC-9. If a delivered member name,
attribute value or string would be caught by one of these detectors, the two
permitted responses are to make the claim genuinely weaker or to supersede the
detector under the ledger — and the choice, with its reasoning, is recorded in
`report.md`. Choosing a synonym so that the same claim passes the same scan is a
weakening, is not one of the two, and does not become admissible because the
suite goes green.

Every pre-existing assertion must still pass unchanged at the end of this scope.
An assertion that fails is either a defect in this scope's change and is fixed, or
an ASC-8 admission recorded across all four surfaces before the edit.

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** a fixture mortality pack carrying
a probability-bearing member alongside its life-expectancy column must be refused
`RLTAX-PACK-INVALID` naming the member, and no comparison may be produced from it.
Before the refusal exists the pack validates, the comparison settles and the
assertion fails on the presence of a comparison — which is the exact route by
which a probability would enter a tool that states it publishes none. A syntax
error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-03-01 | Contract | unit | SCN-024-007 | `scripts/selftest.mjs` | `MortalityBasis/v1` refuses a probability-bearing, survivorship-count or hazard member with `RLTAX-PACK-INVALID` naming it, and accepts a life-expectancy member whose name contains no forbidden substring | `node scripts/selftest.mjs` | No | `report.md#tp-03-01` |
| TP-03-02 | Adversarial | unit | SCN-024-007 | `scripts/selftest.mjs` | Regression: a fixture pack carrying a probability column beside its life-expectancy column is refused and produces no comparison; a refusal matching on substring alone that would reject a legitimate member is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-02` |
| TP-03-03 | Determinism | unit | SCN-024-007 | `scripts/selftest.mjs` | Two runs over identical declarations produce byte-identical serialized records, and a third run after an unrelated settlement produces the same bytes again | `node scripts/selftest.mjs` | No | `report.md#tp-03-03` |
| TP-03-04 | Claim boundary | unit | SCN-024-007 | `scripts/selftest.mjs` | An exhaustive enumeration of every member name in the comparison record, at every depth, finds no probability, rank, score, success, survival, recommendation, discount-rate or appreciation member; the enumeration is proven non-vacuous by asserting it visited more members than the record's top level | `node scripts/selftest.mjs` | No | `report.md#tp-03-04` |
| TP-03-05 | Claim boundary | unit | SCN-024-007 | `scripts/selftest.mjs` | Regression: the two claim scans now include `rltaxclaimage.js` and the mortality pack, proven by planting a forbidden token in a fixture copy of each and asserting it is caught; every pre-existing scanned file still passes unchanged | `node scripts/selftest.mjs` | No | `report.md#tp-03-05` |
| TP-03-06 | Isolation | unit | SCN-024-007 | `scripts/selftest.mjs` | The conversion comparison record's own forbidden-member enumeration is byte-identical to its pre-feature text and still passes, proving this scope added an enumeration rather than extending one | `node scripts/selftest.mjs` | No | `report.md#tp-03-06` |
| TP-03-07 | Known value | unit | SCN-024-008 | `scripts/selftest.mjs` | Against a fixture pack with deliberately non-standard life-expectancy figures, each claim age's cumulative total equals the adjusted annual benefit times the whole-year count from that claim age to the life-expectancy age, asserted at three claim ages | `node scripts/selftest.mjs` | No | `report.md#tp-03-07` |
| TP-03-08 | Adversarial | unit | SCN-024-008 | `scripts/selftest.mjs` | Regression: an implementation using a recalled life-expectancy figure is proven to fail against the non-standard fixture; one applying a discount rate or a growth rate is proven to fail; and no discount, growth, inflation or interpolation term exists anywhere in the module | `node scripts/selftest.mjs` | No | `report.md#tp-03-08` |
| TP-03-09 | Known value | unit | SCN-024-008 | `scripts/selftest.mjs` | The equality age is the age at which the two cumulative totals are equal, published with both claim ages named, asserted on a pair whose totals cross and on a pair whose totals never cross with the second withholding the figure rather than reporting a bound | `node scripts/selftest.mjs` | No | `report.md#tp-03-09` |
| TP-03-10 | Contract | unit | SCN-024-008 | `scripts/selftest.mjs` | `resultKindStatement` and `selectsNothingStatement` are members of the record rather than page copy, are non-empty, and travel with the record into the export | `node scripts/selftest.mjs` | No | `report.md#tp-03-10` |
| TP-03-11 | Degraded state | unit | SCN-024-008 | `scripts/selftest.mjs` | An absent life-expectancy figure withholds the cumulative totals and the equality age, the per-age adjusted benefits still resolve, and no default horizon appears anywhere in the record | `node scripts/selftest.mjs` | No | `report.md#tp-03-11` |
| TP-03-12 | Adversarial | unit | SCN-024-008 | `scripts/selftest.mjs` | Regression: an implementation substituting a default horizon for an absent life-expectancy figure is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-03-12` |
| TP-03-13 | Declared order | unit | SCN-024-009 | `scripts/selftest.mjs` | `perAge[]` appears in declared order for a declaration whose order is not ascending by cumulative total, and no sort exists anywhere in the module or the renderer | `node scripts/selftest.mjs` | No | `report.md#tp-03-13` |
| TP-03-14 | Adversarial | unit | SCN-024-009 | `scripts/selftest.mjs` | Regression: an implementation sorting by cumulative total is proven to fail, and one marking the largest total is proven to fail the forbidden-member enumeration | `node scripts/selftest.mjs` | No | `report.md#tp-03-14` |
| TP-03-15 | Sourcing | unit | SCN-024-007 | `scripts/selftest.mjs` | The mortality pack's life-expectancy column resolves to exactly one retrieved source with a locator, a `retrievedAt` and the table's own year, and an unretrieved figure is an `AbsentFigure` with a `missingSource` pointer and no smuggled numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-03-15` |
| TP-03-16 | No-shadow | unit | SCN-024-008 | `scripts/selftest.mjs` | Regression: no module holds a life-expectancy figure, an age or an authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-03-16` |
| TP-03-17 | Privacy | unit | SCN-024-009 | `scripts/selftest.mjs` | The declared claim-age set is inventoried, cleared, redacted and absent from every URL, request, referrer and console message, and the declared storage key count is asserted unchanged in the same assertion | `node scripts/selftest.mjs` | No | `report.md#tp-03-17` |
| TP-03-18 | Harness | unit | SCN-024-007 | `scripts/selftest.mjs` | The new module is UMD rather than ESM, every pure analytic function is a top-level declaration the extractor lifts, `Number.isFinite` is used rather than the bare global, and no drawing anywhere in this scope is wrapped in `requestAnimationFrame` | `node scripts/selftest.mjs` | No | `report.md#tp-03-18` |
| TP-03-19 | Render safety | unit | SCN-024-008 | `scripts/selftest.mjs` | With the life-expectancy figure absent, every Power section still renders, and every control routes through the declaration-signature no-op guard so a re-render with an unchanged signature performs no DOM replacement | `node scripts/selftest.mjs` | No | `report.md#tp-03-19` |
| TP-03-20 | Regression E2E | e2e-ui | SCN-024-007 | `lifetime-tax-claim-age.spec.mjs` | `Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-007 the claim-age panel renders identically across two loads and shows no probability column" --reporter=list` | Yes | `report.md#scenario-scn-024-007` |
| TP-03-21 | Regression E2E | e2e-ui | SCN-024-008 | `lifetime-tax-claim-age.spec.mjs` | `Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-008 the cumulative totals and the equality age are shown with both claim ages named and the record's own arithmetic statement" --reporter=list` | Yes | `report.md#scenario-scn-024-008` |
| TP-03-22 | Regression E2E | e2e-ui | SCN-024-008 | `lifetime-tax-claim-age.spec.mjs` | `Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-008 an absent life-expectancy figure withholds the totals and the equality age while the per-age benefits still render" --reporter=list` | Yes | `report.md#tp-03-22` |
| TP-03-23 | Regression E2E | e2e-ui | SCN-024-009 | `lifetime-tax-claim-age.spec.mjs` | `Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-009 the claim ages render in declared order with nothing marked best, optimal, recommended or preferred" --reporter=list` | Yes | `report.md#scenario-scn-024-009` |
| TP-03-24 | Privacy E2E | e2e-ui | SCN-024-009 | `lifetime-tax-claim-age.spec.mjs` | `Regression: SCN-024-009 every request is a declared same-origin GET and no declared claim age reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-009 every request is a declared same-origin GET and no declared claim age reaches a URL" --reporter=list` | Yes | `report.md#tp-03-24` |
| TP-03-25 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-*, SCN-024-001 … -009 | The prior features' specs plus this scope's | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-03-25` |
| TP-03-26 | Repo gate | unit | SCN-024-007 … -009 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-03-26` |
| TP-03-27 | Path guard | unit | SCN-024-007 … -009 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-03-27` |
| TP-03-28 | Deploy gate | unit | SCN-024-007 … -009 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-03-28` |
| TP-03-29 | Privacy E2E | e2e-ui | SCN-024-009 | `tests/lifetime-tax-claim-age.spec.mjs` | GAP, NOT AUTHORED (opened 2026-08-22, F-REG-03). `TP-03-24` places no bound on ledger growth after first paint and has no non-empty pin, so its `requested.forEach((path) => expect(permitted).toContain(path))` would pass vacuously against a route that read nothing — the guard-that-cannot-fail class. Required, in that same run: `afterFirstPaint` captured after `openLifetimeTax`, asserted greater than zero, and the ledger asserted not to grow past it once the claim-age comparison is declared. Adversarial cases: a request issued after the comparison is declared fails the no-growth assertion, and a boot that read nothing fails the greater-than-zero pin, which also makes the existing permitted-set sweep non-vacuous | not authored | Yes | not authored |

### Definition of Done

A row is checked only when it is genuinely satisfied and was observed to be
satisfied. A row that is not satisfied stays `[ ]` and carries a stated reason. If
delivery makes a row's claim false, the row is corrected rather than checked.

- [x] FR-024-015 is implemented: the mortality contract refuses a
      probability-bearing, survivorship-count or hazard member naming it, accepts a
      legitimate life-expectancy member, and a fixture pack carrying a probability
      column produces no comparison.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-01`, `report.md#tp-03-02`
- [x] FR-024-021 holds: two runs over identical declarations produce byte-identical
      records, and a third run after an unrelated settlement produces the same bytes.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-03`
- [x] FR-024-018 holds: an exhaustive enumeration at every depth finds no forbidden
      member, the enumeration is proven non-vacuous, and the conversion comparison
      record's own enumeration is byte-identical and still passes.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-04`, `report.md#tp-03-06`
- [x] The claim-boundary detectors were **strengthened rather than superseded**:
      `rltaxclaimage.js` and the mortality pack are in the scanned sets, proven by
      planting a forbidden token in a fixture copy of each, and every pre-existing
      scanned file still passes unchanged.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-05`
- [x] The ASC-9 naming decision is recorded: which of the two permitted responses
      this scope took for the equality-age output, and why. A synonym chosen so the
      same claim passes the same scan was not one of them.
  - **Phase:** implement · **Command:** the ASC-9 record in `report.md` plus `node scripts/selftest.mjs` · **Evidence:** `report.md#asc-9-naming-decision`
- [x] FR-024-016 and FR-024-017 are implemented: each cumulative total is the
      adjusted annual benefit summed over the whole years to the sourced
      life-expectancy age, the equality age names both claim ages, a pair whose
      totals never cross withholds the figure rather than reporting a bound, and no
      discount, growth, inflation or interpolation term exists anywhere in the
      module.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-07`, `report.md#tp-03-08`, `report.md#tp-03-09`
- [x] The record's two statements are members of the record rather than page copy,
      are non-empty, and travel into the export.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-10`
- [x] FR-024-020 is implemented: an absent life-expectancy figure withholds the
      cumulative totals and the equality age, the per-age benefits still resolve, and
      substituting a default horizon is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-03-11`, `report.md#tp-03-12`, `report.md#tp-03-22`
- [x] FR-024-019 is implemented: the ages render in declared order, no sort exists
      in the module or the renderer, nothing is marked best, optimal, recommended or
      preferred, and sorting or marking is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-03-13`, `report.md#tp-03-14`, `report.md#scenario-scn-024-009`
- [x] `BI-9` was closed by a retrieval performed in the implementation session,
      verified digit by digit against the retrieved page and recorded with its own
      `retrievedAt`, its locator and the table's own year, with the edition year
      judged per component kind — or the figure ships as an `AbsentFigure/v1` and the
      totals are withheld.
  - **Phase:** implement · **Command:** the retrieval record in the mortality pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-03-15`
- [x] NFR-024-003 and NFR-024-005 hold: the declared claim-age set is inventoried,
      cleared and redacted, the declared storage key count is asserted unchanged in
      the same assertion, every entry in the request ledger is a GET carrying no
      body for a path the route's own configuration declares, no declared claim age
      and no mortality column reaches a URL, and no module holds a figure or an
      authority name.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-03-16`, `report.md#tp-03-17`, `report.md#tp-03-24`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "the request
    ledger stays empty with a mortality pack now loaded from disk", which was
    false twice over. First, the ledger is never empty. Second, the cited row
    `TP-03-24` (`SCN-024-009`) does not establish that the mortality pack was
    fetched at all: its two `toContain` assertions are made against `permitted =
    declaredRouteAssets()`, the set of paths the route is ALLOWED to read, not
    against `requested`. That clause has been dropped rather than reworded.
    Adversarial cases for what remains: a read of a path the configuration does
    not declare fails `requested.forEach((path) => expect(permitted).toContain(path))`;
    a POST or a request carrying a body fails the method and `postData`
    assertions; and a claim age or the mortality column id reaching a URL fails
    the `urls` scan. Two limits are named rather than hidden and are opened as
    `TP-03-29` below: the row places no bound on ledger growth after first paint,
    and it has no non-empty pin, so `requested.forEach(...)` would pass vacuously
    against a route that read nothing.
- [x] `SCN-024-009` constrains ledger growth and cannot pass vacuously: the run
      captures the ledger length after first paint, asserts it is greater than
      zero, and asserts the ledger does not grow past it.
  - **Phase:** test · **Command:** `TP-03-29` · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed. `tests/lifetime-tax-claim-age.spec.mjs` captures
    `afterFirstPaint` immediately after `openLifetimeTax`, pins it greater than
    zero, and after the comparison is declared, settled and the view switched
    asserts `ledger.length` still equals it. Both halves are proven to
    discriminate by their own harness probe, each with a hash-verified revert:
    arm A zeroes the capture and reds
    `expect(afterFirstPaint).toBeGreaterThan(0)`, arm B subtracts one from it and
    reds `expect(ledger.length).toBe(afterFirstPaint)`. Arm B matters on its own
    because the permitted-set sweep cannot detect a ledger that grew — a request
    to a declared path made after the declarations would satisfy every other
    assertion in the row.
- [x] NFR-024-011 holds: the new module is UMD, every pure analytic function is a
      top-level declaration the extractor lifts, `Number.isFinite` is used rather
      than the bare global, and no drawing in this scope is wrapped in
      `requestAnimationFrame`.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-18`
- [x] The `power-claim-age` renderer reads only members the settlement publishes,
      proven by rendering every Power section with the life-expectancy figure absent,
      and every control routes through the declaration-signature no-op guard.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-03-19`
- [x] This scope delivered **no** supersession, and `report.md` records why: every
      assertion in the break-even neighbourhood was examined and cleared under RD-5,
      and the two claim-scan file-set extensions are strengthenings that add files
      and remove nothing.
  - **Phase:** implement · **Command:** the `SUP-024-NN` marker check plus `node scripts/selftest.mjs` · **Evidence:** `report.md#supersession-ledger`
- [x] Every excluded path is byte-identical, including `tax-rules/federal/**`,
      proving a comparison across claim ages required no federal pack edit.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Claim Source:** executed. The single ground on which this row previously
    stayed `[ ]` is discharged. `site-exclusions.json` carried 44 uncommitted
    insertions from a concurrent session; commit `e903749c0` commits that file
    together with `scripts/selftest.mjs`, and `e903749c0` is now `HEAD`. The
    excluded list was re-enumerated from this scope's Change Boundary and every
    glob resolved to the concrete paths present in the tree: `specs/021-*/**`
    resolved to both `specs/021-execution-receipts-and-session-review-adoption`
    and `specs/021-lifetime-tax-strategy-lab`; `tests/lifetime-tax-*.spec.mjs`
    resolved to all fifteen files minus this scope's own
    `tests/lifetime-tax-claim-age.spec.mjs`; framework-managed resolved to
    `.github/bubbles`, `.github/agents`, `.github/prompts`,
    `.github/instructions` and `.github/skills`. Both directions were run over
    that full set — `git status --porcelain` catches modification, staging and
    any untracked file appearing under an excluded directory, and
    `git diff --stat e903749c0` catches divergence from the committed
    feature-complete tree. Both returned empty at exit 0, so every excluded path
    is byte-identical.

    ```
    $ git status --porcelain -- rlportfolio.js rlportfolioanalytics.js portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab specs/021-execution-receipts-and-session-review-adoption specs/021-lifetime-tax-strategy-lab specs/022-federal-preferential-and-state-income-tax specs/023-property-tax-and-rental-income rltaxsocialsecurity.js rltaxinclusion.js rltaxstrategy.js rltaxstate.js rltaxcombined.js rltaxproperty.js rltaxrental.js rltaxuse.js rltaxdisposition.js tax-rules/federal tax-rules/state tax-rules/property tax-rules/benefit tools.json index.html rlnav.js README.md notes/README.md 'market-brief.*' briefs data watchlist.json site-exclusions.json scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline tests/lifetime-tax-benefit.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-deduction.spec.mjs tests/lifetime-tax-disposition.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-inclusion.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-medicare.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-rental.spec.mjs tests/lifetime-tax-retirement-route.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-use.spec.mjs tests/lifetime-tax.support.mjs .github/bubbles .github/agents .github/prompts .github/instructions .github/skills
    SCOPE03_EXCLUDED_STATUS_EXIT=0
    $ git --no-pager diff --stat e903749c0 -- <the identical path list>
    SCOPE03_EXCLUDED_DIFF_EXIT=0
    ```

    Both commands printed no lines before their exit-code echo; the empty region
    above the `EXIT=0` line is the result, not a truncation.

    The `tax-rules/federal/**` clause carries a second, independent check that
    does not depend on attribution. The federal pack holds no claim-age, mortality,
    survival, break-even or life-expectancy content at all, so a comparison across
    claim ages had nothing in that pack to edit:

    ```
    $ grep -rniE 'claim.?age|mortality|survival|break.?even|life.?expectanc' tax-rules/federal/
    FEDERAL_PACK_CLAIMAGE_GREP_EXIT=1
    ```

    Exit 1 from `grep` is zero matches, and the command printed no lines.

    **Limitation, recorded rather than hidden.** Features 021-024 landed as the
    single commit `b9d92a3f1`, in which every file named above appears as a pure
    creation — `git diff --stat b9d92a3f1^ e903749c0` over the excluded set shows
    `tax-rules/federal/2026.json | 1159 +++`, `rltaxsocialsecurity.js | 750 +++`
    and their siblings as all-insertion adds. A diff against `e903749c0` therefore
    proves the worktree has not drifted from the feature-complete tree, but cannot
    attribute an edit *inside* that commit to one scope. The byte-identity claim is
    proven in that no-drift sense. The federal-pack clause is additionally proven
    substantively by the content scan above, which holds regardless of attribution.
- [x] No output states a probability, a plan success figure, a future-year figure, a
      track record or an error rate, and no claim age is described as optimal,
      recommended or best.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence recorded,
      including the browser rows.
  - **Re-ticked 2026-08-22 at the full count of twenty-nine.** The note below is
    kept because it records why the item was opened. `TP-03-29` is now authored
    in `tests/lifetime-tax-claim-age.spec.mjs` and carries a two-arm RED with a
    same-command GREEN, both arms hash-verified on revert. The twenty-eight rows
    the **Checked because** note already accounted for are unchanged, so the word
    "Every" holds again at the new count.
  - **Unticked 2026-08-22 (F-REG-03).** `TP-03-29` was opened in this scope and
    is not authored, so it carries neither a RED nor a GREEN. The word "Every"
    therefore no longer holds. Ticking it again requires `TP-03-29` authored with
    a RED and a same-command GREEN.
  - **Phase:** implement · **Command:** the exact TP-03-01 through TP-03-28 commands · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed for all 28 rows.
  - **Checked because:** every one of the 28 rows now carries a RED and a GREEN
    captured under that row's own declared command.

    **26 rows probed earlier.** TP-03-01 through TP-03-24 were probed in the
    implementation session and are recorded under
    `report.md#intended-red-evidence-per-test-plan-row`. TP-03-26, TP-03-27 and
    TP-03-28 were probed in a later session and are recorded under
    `report.md#intended-red-evidence-for-the-four-gate-rows-tp-03-25--tp-03-28`,
    with TP-03-28 carrying two probes because the row makes two separable claims.

    **TP-03-25 closed.** The broader browser regression was the last row without a
    RED. It is now probed at `report.md#probe-29--same-command-red-and-green-for-tp-03-25`:
    a single value-free rounding mutation in `rltaxclaimage.js` produced
    `2 failed, 75 passed` under the row's own command, the mutation was reverted
    inside the same shell invocation, and the same command then produced
    `77 passed`. Both failing rows carry `SCN-024-008`, a scenario this scope owns,
    so the delta is attributable to the mutation.

    **Both prior blockers are gone, and neither was waved away.** The command now
    returns a summary line and an exit code in both directions, so a baseline
    exists for the RED to be a delta against. The selector is now the
    four-feature-pinned `SCN-02[1-4]` rather than the substring `SCN-02`, so the
    concurrent session's `SCN-025-*` and `SCN-026-*` files can neither satisfy nor
    break the row. The GREEN run's non-zero exit code comes from Playwright worker
    teardown faults that the runner itself classifies as `errors … not a part of
    any test`; the run reports zero failed, and the discrepancy is stated in the
    evidence rather than hidden.

    **Superseded:** the earlier note on this item claimed the only honest RED was
    the narrow TP-03-05 / TP-03-CLAIM pair, and a later note claimed TP-03-25 was
    unprovable in that sitting. Both are now out of date.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-03-26`, `report.md#tp-03-27`, `report.md#tp-03-28`
