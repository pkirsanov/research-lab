# Scope 4: Short-Term And Vacation Rental

## 04-short-term-and-vacation-rental

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In progress
**Scope-Kind:** runtime-behavior
**Tags:** `classification:pub-527`, `boundary-adversarial:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01, 02, 03
**Foundation:** false

**Primary Outcome:** a vacation-home owner learns which Publication 527 category
the property actually falls into before any number means anything, and can see the
comparison that produced it. The under-15-day exception excludes the income and
deducts nothing, and a mixed-use property allocates expenses by declared days with
the personal portion routed to the itemized composition rather than discarded.

## Requirement Coverage

- **FR-023-022** — `UseClassification/v1` publishes the category, both declared day
  counts, the sourced test parameters and the comparisons performed.
- **FR-023-023** — the test parameters are sourced; a classification attempted
  without a retrieved parameter refuses.
- **FR-023-024** — the comparisons are exact at the sourced day figure, at the
  sourced percentage of rental days, and at the fewer-than-15-days boundary, with
  inclusivity following the publication rather than a convention.
- **FR-023-025** — a property meeting the fewer-than-15-days exception excludes the
  rental income and deducts no rental expense, stating the exclusion as the reason.
- **FR-023-026** — expense allocation is computed from the declared day counts and
  the allocation basis is published with each allocated figure.
- **FR-023-027** — the personal portion of an allocated expense is routed to the
  itemized composition rather than discarded.
- **FR-023-028** — the classification and the category's leg appear in the
  headline, the comparison, the curve and the export.

Inherited and re-asserted: **FR-023-008** the deduction composition,
**FR-023-015** the rental leg, **NFR-023-001** declared or sourced never
conflated, **NFR-023-002** zero network, **NFR-023-003** privacy,
**NFR-023-004** vocabulary unchanged, **NFR-023-005** no figure in any module,
**NFR-023-006** leg visibility, **NFR-023-009** Feature 008 byte-identity.

## Gherkin Scenarios

```gherkin
Scenario: SCN-023-010 The personal-use test is run against sourced parameters and published
  Given declared rental days and declared personal-use days
  And a pack carrying the sourced day figure, the sourced percentage figure and the sourced rental-days threshold
  When the classification runs
  Then the category is produced by comparing the declarations against the sourced parameters
  And the record publishes both parameters with their citations and each comparison actually performed
  And a classification attempted with any parameter absent refuses rather than falling back to a recalled rule

Scenario: SCN-023-011 The three classification boundaries land on the correct side
  Given a property at exactly the sourced personal-use day figure
  And a property whose personal use is exactly the sourced percentage of its rental days
  And a property rented exactly at the fewer-than-15-days boundary
  When each is classified
  Then each lands on the side the publication states, asserted at the exact sourced figure rather than near it
  And an implementation treating any of the three comparisons as strict where the publication states inclusive is proven to fail
  And an implementation treating any as inclusive where the publication states strict is proven to fail

Scenario: SCN-023-012 A property rented under the exception excludes income and deducts nothing
  Given a property rented fewer than the sourced threshold of days and used as a residence
  When the settlement runs
  Then the rental income is excluded from income and no rental expense is deducted
  And the exclusion is stated as the reason rather than presented as a zero result
  And the mortgage interest and property tax remain available to the itemized composition unallocated

Scenario: SCN-023-013 A mixed-use property allocates expenses between personal and rental use
  Given declared rental days, declared personal-use days and declared expenses
  When the settlement runs
  Then each expense is allocated by the declared day counts with the allocation basis published beside each allocated figure
  And the rental portion of a directly-allocable expense is not re-allocated
  And the personal portion is routed to the itemized composition rather than discarded
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-023-010 classified | Both day counts declared, parameters sourced | Open the use panel | The category, both day counts, both parameters with reachable citations, and each comparison as left, operator, right and result | e2e-ui |
| SCN-023-010 parameter absent | A test parameter not retrieved | Open the use panel | `RLTAX-THRESHOLD-UNAVAILABLE` naming the parameter, no category assigned, and no rental figure produced | e2e-ui |
| SCN-023-011 boundaries | Each of the three boundary fixtures in turn | Open the use panel | Each shows the category the publication states, with the exact comparison rendered | e2e-ui |
| SCN-023-012 exception | Rented under the threshold, used as a residence | Open the use panel then the deduction panel | The income exclusion stated as the reason, no rental expense deducted, and the interest and property tax present unallocated in the composition | e2e-ui |
| SCN-023-013 allocation | Mixed use with declared expenses | Open the use panel then the deduction panel | Each allocated figure with its basis, the directly-allocable expense unallocated, and the personal portion present as a deduction component | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | The classification and the category's leg reach the headline, the comparison, the curve and the export | e2e-ui |

## Implementation Files

### New

- `rltaxuse.js` — UMD module owning `classifyDwellingUse` and `allocateByUseDays`.
- Fixture packs: one at exactly the sourced personal-use day figure, one at exactly
  the sourced percentage, one at exactly the fewer-than-15-days boundary, one one
  day either side of each, one with a test parameter absent, and one carrying a
  directly-allocable expense.
- `lifetime-tax-use.spec.mjs` under `tests/` — this scope's Playwright spec.

### Modified

- `rltaxrules.js` — `UseClassification/v1` and the classification parameter pack
  members with their citations.
- `rltax.js` — stage `CO-16`, placed before `CO-17`, and the routing from the
  published category to the settlement.
- `rltaxrental.js` — the exception path and the allocated-expense path, consuming
  the published classification rather than re-deriving it.
- `rltaxworkspace.js` — the day-count declarations plus their privacy surface.
- `lifetime-tax-strategy-lab.html` — the day inputs and the `power-use` section.
- `tax-rules/federal/<year>.json` — the `BI-8` classification parameters, inserted
  additively.
- `scripts/selftest.mjs` — one appended group, plus `SUP-023-14` and the TP-04-27
  correction the two admissions require.
- `tests/lifetime-tax-rental.spec.mjs` — `SUP-023-13` only.

## Implementation Plan

1. Add `UseClassification/v1` to `rltaxrules.js`. `comparisonsPerformed[]` entries
   are `{ left, operator, right, result }`, which is what makes inclusivity
   inspectable rather than buried in a branch.
2. **Retrieve `BI-8`.** Open Publication 527, transcribe the personal-use day
   figure, the personal-use percentage figure and the fewer-than-15-days rental
   threshold, and record each with its locator. Record also which quantity the
   percentage is compared against, per the open question in `spec.md`, and publish
   that in the classification record. If any parameter is unretrieved the
   classification refuses and no category is assigned.
3. Implement `classifyDwellingUse`. It reads the parameters from the pack, performs
   each comparison, records it, and returns the category. It contains no numeric
   literal, which the no-shadow scan asserts.
4. Implement stage `CO-16` before `CO-17` so no settlement can run before its
   category is published, and route from the published category rather than from
   the day counts.
5. Implement the exception path in `rltaxrental.js`: the rental income is excluded,
   no rental expense is deducted, and the reason is a stated exclusion rather than
   a zero. The mortgage interest and property tax remain available to the itemized
   composition unallocated.
6. Implement `allocateByUseDays`. Each allocated figure publishes its basis. An
   expense declared directly allocable is not re-allocated, and attempting to
   allocate it is refused.
7. Route the personal portion of each allocated expense into the Scope 02
   composition as a named component with `origin: "computed"`, so it competes
   inside the cap like every other component.
8. Extend the Scope 01 leg-visibility identity to cover the classification and the
   category's leg.
9. Add the day-count declarations to `rltaxworkspace.js` with their inventory,
   clear and export-sanitizer entries.
10. Render the `power-use` section showing the category, both day counts, both
    parameters with citations, and each comparison performed.
11. Append a `lifetime-tax — dwelling use classification and allocation` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltaxrental.js` | Two new settlement paths | Scope 05 | High — a routing change could send a long-term rental down the exception path | Assert every Scope 03 fixture still produces its exact prior settlement under the added routing, before either new path is reachable | Remove the routing and both paths |
| `rltax.js` stage order | `CO-16` inserted before `CO-17` | Scope 05 | High — a stage inserted at the wrong point settles before the category is known | Assert the derived ordered array places `CO-16` strictly before `CO-17` for every pack, and that a settlement attempted without a published classification refuses | Remove the stage |
| The itemized composition | Gains a computed component from allocation | Scope 05 | Medium — a component added without an origin breaks Scope 02's contract | Assert Scope 02's disjoint exhaustive accounting still holds with the added component | Remove the component |
| `tax-rules/federal/<year>.json` | Classification parameters inserted | Scope 05 | Medium | Assert every pre-existing federal figure is byte-identical | Revert the insertion |
| `rltaxworkspace.js` | Day-count declarations | Scope 05 | Medium | Assert each new key is inventoried, cleared, redacted and absent from every URL and request | Remove the members |
| `scripts/selftest.mjs` | One group appended, plus `SUP-023-14` and the TP-04-27 correction the admissions require | The whole-repo gate | Medium | Pre-existing pass count must not fall and no assertion outside the appended group, `SUP-023-14`'s target and TP-04-27 may change | Remove the group |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxuse.js` · this scope's fixture packs ·
`lifetime-tax-use.spec.mjs` under `tests/`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxrental.js` ·
`rltaxworkspace.js` · `lifetime-tax-strategy-lab.html` ·
`tax-rules/federal/<year>.json` (additive insertion of the `BI-8` retrieved
records only) · `scripts/selftest.mjs` (append-only, plus `SUP-023-14` and the
TP-04-27 correction the ASC-8 admissions below require) ·
`tests/lifetime-tax-rental.spec.mjs`
(SUP-023-13 only, admitted in flight under ASC-8; the
[per-file marker distribution](../../design.md#per-file-marker-distribution) was
updated in the same change to place both markers where they are carried).

`rltaxrental.js` and `tax-rules/federal/<year>.json` are allowed here **because**
FR-023-025, FR-023-026 and FR-023-023 require the exception path, the allocation
path and the sourced parameters respectively. The cross-check against the ledger
and the requirement coverage confirms no scope forbids an edit it requires.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `rltaxproperty.js` · `rltaxstrategy.js` · `rltaxstate.js` ·
`rltaxcombined.js` · `tax-rules/property/**` · `tax-rules/state/**` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `notes/README.md` ·
`market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every
`tests/lifetime-tax-*.spec.mjs` other than this scope's own and
`tests/lifetime-tax-rental.spec.mjs` (SUP-023-13 only) ·
`tests/lifetime-tax.support.mjs` · every framework-managed file.

**Rollback:** delete `rltaxuse.js`, the fixtures and the spec file; revert the
contract, stage `CO-16`, both rental paths, the composition component, the federal
pack insertion, the workspace members and the page section.

## Assertion Supersession Owned By This Scope

**Two, both admitted in flight under ASC-8: `SUP-023-13` and `SUP-023-14`.** This
scope was planned to own no entry in the
[supersession ledger](../spec.md#supersession-ledger), on the reasoning that
adding a classification changes no behaviour any pre-existing assertion pins.
That reasoning held for the classification and failed twice around it.

`SUP-023-13`. Scope 03 pinned `[data-rl-leg="rental-net"]` to `toHaveCount(1)`
while the rental leg reached the headline alone, and FR-023-028 and NFR-023-006
require this scope to wire it into the comparison and curve tables as well, so
the literal fails for an ASC-1 cause — the product got better. Replaced by a
surface-scoped identity whose surface set is read from the page's own
declaration.

`SUP-023-14`. Booking `SUP-023-13` on the four surfaces ASC-8 requires makes
Scope 03's TP-03-26 false, because that assertion pinned the ledger TOTAL and the
ownership arithmetic as literals rather than deriving them. Replaced by a
reconciliation that derives the row count, the ownership column's own sum and the
total the arithmetic sentence states, and asserts the three agree — so the next
admission needs no edit here at all.

Both entries were appended to the ledger, the
[ownership table](../_index.md#ownership) and `design.md`'s per-file marker
distribution in the same change as their edits, which is what ASC-8 requires and
what makes no planning round trip necessary.

Every other pre-existing assertion still passes unchanged. The one assertion in
this scope's own group that asserted the opposite — TP-04-27, which claimed this
scope added no supersession — was corrected to assert the true post-condition
rather than left standing as a false claim.

## Scenario-First Red/Green Contract

**Named intended-RED assertion for this scope:** a property whose personal-use days
equal exactly the sourced day figure must receive the category the publication
states for that exact value, and the assertion must read the expected side from
the retrieved parameter rather than from a literal. Before `classifyDwellingUse`
reads the pack the assertion fails because no classification record exists. A
syntax error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Contract | unit | SCN-023-010 | `scripts/selftest.mjs` | `UseClassification/v1` refuses a missing category, a missing day count, a parameter carrying no citation, and an empty `comparisonsPerformed[]` | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Compatibility | unit | SCN-023-010 | `scripts/selftest.mjs` | Every Scope 03 fixture produces its exact prior settlement under the added routing, and every pre-existing federal pack figure is byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Sourcing | unit | SCN-023-010 | `scripts/selftest.mjs` | Each of the three test parameters resolves to exactly one retrieved source with a locator, and the record publishes which quantity the percentage was compared against | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Refusal | unit | SCN-023-010 | `scripts/selftest.mjs` | A pack with any test parameter absent refuses the classification, assigns no category, and produces no rental figure | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Adversarial | unit | SCN-023-010 | `scripts/selftest.mjs` | Regression: an implementation falling back to a recalled rule when a parameter is absent is proven to fail the refusal assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Boundary | unit | SCN-023-011 | `scripts/selftest.mjs` | At exactly the sourced personal-use day figure, and at one day either side, the category matches the publication, with the expected side read from the retrieved parameter rather than a literal | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Boundary | unit | SCN-023-011 | `scripts/selftest.mjs` | At exactly the sourced percentage of rental days, and at one day either side, the category matches the publication | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Boundary | unit | SCN-023-011 | `scripts/selftest.mjs` | At exactly the fewer-than-15-days boundary, and at one day either side, the exception applies or does not as the publication states | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Adversarial | unit | SCN-023-011 | `scripts/selftest.mjs` | Regression: flipping each of the three comparisons from inclusive to strict is proven to fail its boundary assertion, and flipping each from strict to inclusive is proven to fail as well | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Ordering | unit | SCN-023-010 | `scripts/selftest.mjs` | The derived ordered array places `CO-16` strictly before `CO-17` for every pack, and a settlement attempted without a published classification refuses | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Known value | unit | SCN-023-012 | `scripts/selftest.mjs` | Under the exception the rental income is excluded, no rental expense is deducted, the reason is a stated exclusion, and the interest and property tax reach the composition unallocated | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | Adversarial | unit | SCN-023-012 | `scripts/selftest.mjs` | Regression: an implementation returning a zero net result instead of an exclusion reason is proven to fail the stated-reason assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-12` |
| TP-04-13 | Known value | unit | SCN-023-013 | `scripts/selftest.mjs` | Each allocated expense equals the declared amount times the declared day ratio, publishes its basis, and the sum of the rental and personal portions equals the declared amount exactly | `node scripts/selftest.mjs` | No | `report.md#tp-04-13` |
| TP-04-14 | Contract | unit | SCN-023-013 | `scripts/selftest.mjs` | A directly-allocable expense is not re-allocated and attempting to allocate it is refused | `node scripts/selftest.mjs` | No | `report.md#tp-04-14` |
| TP-04-15 | Integration | unit | SCN-023-013 | `scripts/selftest.mjs` | The personal portion enters the composition as a named component with `origin: "computed"`, and Scope 02's disjoint exhaustive accounting still holds | `node scripts/selftest.mjs` | No | `report.md#tp-04-15` |
| TP-04-16 | Adversarial | unit | SCN-023-013 | `scripts/selftest.mjs` | Regression: an implementation discarding the personal portion is proven to fail the allocation-sum assertion and the composition accounting | `node scripts/selftest.mjs` | No | `report.md#tp-04-16` |
| TP-04-17 | Leg visibility | unit | SCN-023-012 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the classification and the category's leg appear in the headline, the comparison, the curve contributors and the export, in both directions, and the prior legs still do | `node scripts/selftest.mjs` | No | `report.md#tp-04-17` |
| TP-04-18 | Adversarial | unit | SCN-023-012 | `scripts/selftest.mjs` | Regression: removing the classification from each of the four surfaces in turn is proven to fail the leg-visibility identity with the missing element named | `node scripts/selftest.mjs` | No | `report.md#tp-04-18` |
| TP-04-19 | Vocabulary | unit | SCN-023-010 | `scripts/selftest.mjs` | The refusal vocabulary member count equals its pre-feature value | `node scripts/selftest.mjs` | No | `report.md#tp-04-19` |
| TP-04-20 | No-shadow | unit | SCN-023-011 | `scripts/selftest.mjs` | Regression: `rltaxuse.js` contains no numeric literal for any test parameter and no authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-04-20` |
| TP-04-21 | Privacy | unit | SCN-023-010 | `scripts/selftest.mjs` | The day-count declarations are inventoried, cleared, redacted, and absent from every URL, request, referrer and console message | `node scripts/selftest.mjs` | No | `report.md#tp-04-21` |
| TP-04-22 | Regression E2E | e2e-ui | SCN-023-010 | `lifetime-tax-use.spec.mjs` | `Regression: SCN-023-010 the classification publishes its sourced parameters and refuses without them` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-010 the classification publishes its sourced parameters and refuses without them" --reporter=list` | Yes | `report.md#scenario-scn-023-010` |
| TP-04-23 | Regression E2E | e2e-ui | SCN-023-011 | `lifetime-tax-use.spec.mjs` | `Regression: SCN-023-011 the three Publication 527 boundaries land on the side the publication states` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-011 the three Publication 527 boundaries land on the side the publication states" --reporter=list` | Yes | `report.md#scenario-scn-023-011` |
| TP-04-24 | Regression E2E | e2e-ui | SCN-023-012 | `lifetime-tax-use.spec.mjs` | `Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense" --reporter=list` | Yes | `report.md#scenario-scn-023-012` |
| TP-04-25 | Regression E2E | e2e-ui | SCN-023-013 | `lifetime-tax-use.spec.mjs` | `Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition" --reporter=list` | Yes | `report.md#scenario-scn-023-013` |
| TP-04-26 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -013 | The prior features' specs plus this feature's four | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-04-26` |
| TP-04-27 | Repo gate | unit | SCN-023-010 … -013 | `scripts/selftest.mjs` | The whole-repository suite stays green, the pre-existing pass count does not fall, and both ASC-8 admissions are booked on all four surfaces and agree: the ledger carries fourteen rows of which exactly the two the ownership table claims for Scope 04 are owned by it, the opening count paragraph names the same two admissions and the same per-scope total, and the per-file marker distribution places each marker in the file that carries it | `node scripts/selftest.mjs` | No | `report.md#tp-04-27` |
| TP-04-28 | Path guard | unit | SCN-023-010 … -013 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-04-28` |
| TP-04-29 | Deploy gate | unit | SCN-023-010 … -013 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-04-29` |

### Definition of Done

- [x] Every Scope 03 fixture produces its exact prior settlement under the added
      routing, and every pre-existing federal pack figure is byte-identical.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-02`
- [x] FR-023-022 and FR-023-023 are implemented: the classification is a published
      record carrying both parameters with citations and each comparison performed,
      and an absent parameter refuses rather than falling back.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-01`, `report.md#tp-04-03`, `report.md#tp-04-04`, `report.md#tp-04-05`
- [x] `BI-8` was closed by a retrieval performed in the implementation session and
      recorded with its own `retrievedAt` and locator, including which quantity the
      percentage is compared against, or the classification refuses.
  - **Phase:** implement · **Command:** the retrieval record in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-04-03`
- [x] FR-023-024 is implemented: all three boundaries are asserted at the exact
      sourced figure and at one day either side, and flipping each comparison's
      inclusivity in either direction is demonstrated to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-06`, `report.md#tp-04-07`, `report.md#tp-04-08`, `report.md#tp-04-09`
- [x] Stage `CO-16` is strictly before `CO-17` for every pack, and a settlement
      attempted without a published classification refuses.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-10`
- [x] FR-023-025 is implemented: the exception excludes the income, deducts no
      rental expense, states the exclusion as the reason, leaves the interest and
      property tax unallocated in the composition, and a zero result in place of an
      exclusion reason is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-11`, `report.md#tp-04-12`
- [x] FR-023-026 and FR-023-027 are implemented: each allocation publishes its
      basis, the portions sum to the declared amount exactly, a directly-allocable
      expense is not re-allocated, the personal portion enters the composition, and
      discarding it is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-13`, `report.md#tp-04-14`, `report.md#tp-04-15`, `report.md#tp-04-16`
- [x] FR-023-028 and NFR-023-006 are implemented: the classification and the
      category's leg are surfaced in the headline, the comparison, the curve and the
      export, the prior legs still are, and removing them from each surface in turn
      is demonstrated to fail with the missing element named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser rows · **Evidence:** `report.md#tp-04-17`, `report.md#tp-04-18`, `report.md#sup-023-13--testslifetime-tax-rentalspecmjs`
- [x] NFR-023-004 and NFR-023-005 hold: the refusal vocabulary member count is
      unchanged and `rltaxuse.js` carries no test-parameter literal.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-19`, `report.md#tp-04-20`
- [x] NFR-023-003 holds: the day-count declarations are inventoried, cleared and
      redacted, and the request ledger stays empty.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-21`
- [x] `SUP-023-13` and `SUP-023-14` are delivered under ASC-8: each superseded
      literal is recorded with its replacement and its adversarial cases, each
      marker sits in the file the distribution places it in, and the ledger, its
      opening count paragraph, the ownership table and the marker distribution
      were all updated in the same change and agree.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the marker check · **Evidence:** `report.md#supersession-ledger`
- [x] Every excluded path is byte-identical, and the only federal pack change is
      the additive insertion of the retrieved classification parameters.
      Every excluded path that existed before the series is unchanged by the
      series commit; the entries the series created carry none of this scope's
      owned identifiers; the working tree shows no drift over the whole list; and
      the pack half is proven mechanically by TP-04-02.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`, `report.md#attribution-closed--the-row-is-now-satisfied`
- [x] No output states a probability, a lifetime figure, a track record or an error
      rate, and no classification is presented as an estimate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
      **Not satisfied.** Same-command GREEN is recorded for every row, and
      intended RED is recorded for both supersessions and for the four inherited
      browser failures. Intended RED is NOT recorded for TP-04-01 through
      TP-04-25: those rows were implemented in an earlier dispatch of this scope
      that did not record their RED, and this session cannot produce it after the
      fact without fabricating it.
  - **Phase:** implement · **Command:** the exact TP-04-01 through TP-04-26 commands · **Evidence:** `report.md#test-evidence`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-04-27`, `report.md#tp-04-28`, `report.md#tp-04-29`
