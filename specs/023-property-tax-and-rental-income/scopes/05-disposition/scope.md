# Scope 5: Disposition

## 05-disposition

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `engine:disposition`, `recapture:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01, 02, 03, 04
**Foundation:** false

**Primary Outcome:** a seller receives a disposition result that includes the part
usually omitted. The gain is split into an unrecaptured Section 1250 component
priced at its own sourced maximum rate and a remaining long-term component that
stacks under Feature 022's preferential model, and the primary-residence exclusion
is applied after the split, only when both sourced tests pass, and never to the
recapture component.

## Requirement Coverage

- **FR-023-029** — the gain is computed from declared proceeds, declared adjusted
  basis and declared accumulated depreciation, and split into components.
- **FR-023-030** — the unrecaptured Section 1250 component is priced at its own
  sourced maximum rate and is a separate leg from the remainder.
- **FR-023-031** — the remainder stacks under Feature 022's preferential model
  without a parallel implementation of that stacking.
- **FR-023-032** — depreciation recapture moves out of the unsupported preferential
  categories; the remaining above-rate categories keep their refusal unchanged.
- **FR-023-033** — the ownership test and the use test are evaluated separately
  against sourced period figures and the failing one is named.
- **FR-023-034** — the exclusion amount is sourced per filing status and is applied
  to the remaining gain and never to the recapture component.
- **FR-023-035** — both disposition legs appear in the headline, the comparison,
  the curve and the export.

Inherited and re-asserted: **FR-023-016** cost recovery adjusts the basis this
scope reads, **NFR-023-001** declared or sourced never conflated,
**NFR-023-002** zero network, **NFR-023-003** privacy, **NFR-023-004** vocabulary
unchanged, **NFR-023-005** no figure in any module, **NFR-023-006** leg
visibility, **NFR-023-007** no projection, **NFR-023-009** Feature 008
byte-identity, **NFR-023-010** no registration.

## Gherkin Scenarios

```gherkin
Scenario: SCN-023-014 A disposition splits gain into components priced under different rules
  Given declared proceeds, a declared adjusted basis and declared accumulated depreciation
  When the disposition settles
  Then the gain is split into an unrecaptured Section 1250 component and a remaining long-term component
  And the first is priced at the sourced maximum rate for that category and the second stacks under the existing preferential model
  And the two are separate legs, and a result pricing the whole gain under one rule is proven to fail

Scenario: SCN-023-015 The primary-residence exclusion applies after recapture and only when both tests pass
  Given a declared ownership history and a declared use history over the sourced lookback period
  When the exclusion is applied
  Then the ownership test and the use test are evaluated separately against sourced period figures
  And the exclusion amount is the sourced amount for the filing status and is applied to the remaining gain and never to the recapture component
  And a history failing either test receives no exclusion with the failing test named
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-023-014 split | Proceeds, basis and accumulated depreciation declared | Open the disposition panel | Both components by name, the recapture rate with its citation, and the remainder's stacking position | e2e-ui |
| SCN-023-014 rate absent | Recapture maximum rate not retrieved | Open the disposition panel | `RLTAX-THRESHOLD-UNAVAILABLE` on the recapture component, and the whole gain is not priced under the preferential model instead | e2e-ui |
| SCN-023-015 both pass | Ownership and use histories both satisfying the sourced periods | Open the disposition panel | Both tests shown as passed with their period figures cited, the exclusion applied to the remainder only | e2e-ui |
| SCN-023-015 one fails | Use history short of the sourced period | Open the disposition panel | No exclusion, the failing test named, and the passing test still shown as passed | e2e-ui |
| Deferral retained | A collectibles or small-business-stock category present | Open the preferential detail | Those categories still refuse with their original reason, unchanged by this scope | e2e-ui |
| Leg visibility | The all-non-zero leg fixture | Open Simple then Power | Both disposition legs reach the headline, the comparison, the curve and the export | e2e-ui |

## Implementation Files

### New

- `rltaxdisposition.js` — UMD module owning `computeDisposition` and
  `applyResidenceExclusion`.
- Fixture packs: one with the recapture rate absent, one with an exclusion amount
  absent, one whose ownership period is exactly at the sourced figure, one whose
  use period is exactly at it, and one whose recapture component exceeds the total
  gain so the split is proven bounded.
- `lifetime-tax-disposition.spec.mjs` under `tests/` — this scope's Playwright spec.

### Modified

- `rltaxrules.js` — `Disposition/v1`, `GainComponent/v1`, the recapture rate and
  the exclusion pack members with their citations.
- `rltax.js` — stage `CO-19`, reconciliation legs `L10` and `L11`, and the handoff
  of the remainder component into the existing preferential model.
- `rltaxworkspace.js` — the disposition declarations plus their privacy surface.
- `lifetime-tax-strategy-lab.html` — the disposition inputs, the
  `power-disposition` section and one Simple field.
- `tax-rules/federal/<year>.json` — the `BI-9` and `BI-10` retrieved records, and
  the removal of the depreciation-recapture unsupported entry.
- `scripts/selftest.mjs` — one appended group, plus SUP-023-09.

## Implementation Plan

1. Add `Disposition/v1` and `GainComponent/v1` to `rltaxrules.js`. `pricingRule` is
   a closed set of `own-maximum-rate` and `preferential-stacking`; a component
   carrying neither is refused.
2. **Retrieve `BI-10`.** Open IRS Topic no. 409, transcribe the unrecaptured
   Section 1250 gain maximum rate, and record it with its locator. If unretrieved
   the recapture component refuses, and the disposition does **not** fall back to
   pricing the whole gain under the preferential model.
3. **Retrieve `BI-9`.** Open Publication 523, transcribe the exclusion amounts per
   filing status and the ownership and use period figures with their lookback
   period, and record each with its locator. If any is unretrieved the exclusion
   refuses and no gain is excluded.
4. Implement `computeDisposition`. The gain is proceeds less adjusted basis. The
   recapture component is bounded by both the accumulated depreciation and the
   total gain, which the over-depreciated fixture proves. The remainder is the
   balance.
5. Set `pricingRule` on each component and hand the remainder to the Feature 022
   preferential model. `rltaxdisposition.js` contains no stacking arithmetic, and a
   scan asserts it, so the two implementations cannot diverge.
6. Implement `applyResidenceExclusion`. The ownership test and the use test are
   evaluated separately, each against its own sourced period figure over the
   sourced lookback, and each publishes its own pass or fail with the figure
   compared. A failing test names itself.
7. Apply the exclusion to the remainder component only. An implementation applying
   it to the recapture component is proven to fail.
8. Remove the depreciation-recapture entry from the federal pack's
   `unsupportedFeatures[]` and assert the remaining above-rate categories still
   refuse with their original reason unchanged.
9. Add stage `CO-19` and reconciliation legs `L10` and `L11`, derived from the
   pack's declared leg set.
10. Extend the Scope 01 leg-visibility identity to cover both legs.
11. Add the disposition declarations to `rltaxworkspace.js` with their inventory,
    clear and export-sanitizer entries.
12. Render the `power-disposition` section and one Simple field carrying the
    disposition total.
13. Deliver SUP-023-09 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure),
    re-resolving its target against the tree Feature 022 left.
14. Append a `lifetime-tax — disposition, recapture and the residence exclusion`
    group to `scripts/selftest.mjs`.
15. Run the whole-feature closing checks: the marker check over all nine ledger
    entries, the cumulative browser suite, and the assertion that the tool is still
    absent from every registry.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The preferential model | Gains a carried category | Feature 022's settlement and curve | Very high — a category added inside the stacking could move every existing preferential result | Assert every Feature 022 preferential fixture produces its exact prior total before the recapture category is registered | Restore the unsupported entry and unregister the category |
| `unsupportedFeatures[]` | One entry removed | The not-modeled ledger and SUP-023-09's target | High — the remaining above-rate categories must keep refusing | Assert each remaining above-rate category still refuses with its original reason, before the removal | Restore the entry |
| `rltax.js` leg set | Legs `L10` and `L11` added | None downstream; this is the last scope | High — two legs added at once makes a dropped one easier to miss | The all-non-zero fixture assigns each a distinct value so omitting either changes the total by a unique amount | Remove both from the declared set |
| The adjusted basis | Consumed from Scope 03 | None downstream | High — an unadjusted basis understates the recapture component | Assert the basis this scope reads equals the figure Scope 03 published, for every fixture | Read the declared basis directly and refuse |
| `tax-rules/federal/<year>.json` | Two records inserted, one unsupported entry removed | None downstream | High | Assert every pre-existing federal figure is byte-identical | Revert the pack |
| `scripts/selftest.mjs` | One group appended plus SUP-023-09 | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the marker |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxdisposition.js` · this scope's fixture packs ·
`lifetime-tax-disposition.spec.mjs` under `tests/`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`lifetime-tax-strategy-lab.html` · `tax-rules/federal/<year>.json` (additive
insertion of the `BI-9` and `BI-10` retrieved records, plus the removal of the
depreciation-recapture unsupported entry required by FR-023-032) ·
`scripts/selftest.mjs` (append, plus SUP-023-09).

`tax-rules/federal/<year>.json` and `scripts/selftest.mjs` are allowed here
**because** FR-023-030, FR-023-032 and FR-023-034 require the two retrieved
records and the unsupported-entry removal, and the
[per-file marker distribution](../design.md#per-file-marker-distribution) places
SUP-023-09 in the selftest. The cross-check against the ledger and the requirement
coverage confirms no scope forbids an edit it requires.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `rltaxproperty.js` · `rltaxuse.js` · `rltaxrental.js` ·
`rltaxstrategy.js` · `rltaxstate.js` · `rltaxcombined.js` ·
`tax-rules/property/**` · `tax-rules/state/**` · `tools.json` · `index.html` ·
`rlnav.js` · `README.md` · `notes/README.md` · `market-brief.*` · `briefs/**` ·
`data/**` · `watchlist.json` · `site-exclusions.json` ·
`scripts/build-pages-site.mjs` · `scripts/validate-spec-test-paths.baseline` ·
every `tests/lifetime-tax-*.spec.mjs` other than this scope's own ·
`tests/lifetime-tax.support.mjs` · every framework-managed file.

`rltaxrental.js` is excluded deliberately. The disposition reads the adjusted basis
Scope 03 publishes; if settling a sale requires editing the rental engine, the
basis is not published.

**Rollback:** delete `rltaxdisposition.js`, the fixtures and the spec file; revert
the two contracts, stage `CO-19`, both legs, the preferential category
registration, the federal pack insertions and the restored unsupported entry, the
workspace members and the page section; revert SUP-023-09's replacement to its
superseded clause.

## Assertion Supersession Owned By This Scope

One entry: **SUP-023-09**. It is caused by a deliberate change this scope's
requirement coverage names: FR-023-032 removes depreciation recapture from the
unsupported preferential categories. The replacement asserts the category is
carried with its own sourced maximum rate and its own stacking position, and
retains verbatim the original clause for every remaining above-rate category,
asserted against a fixture that still exhibits their refusal so the retained
branch is not vacuous.

The target is an assertion Feature 022 delivers. Its line is re-resolved against
the tree at implementation time. If the clause no longer exists in any form, this
scope stops; if it moved, it is simply re-located.

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside this one that fails is either a defect in this scope's
change and is fixed, or an ASC-8 admission recorded in the ledger before the edit.

## Scenario-First Red/Green Contract

**Named intended-RED assertion for this scope:** a disposition with declared
accumulated depreciation must produce **two** legs whose amounts sum to the total
gain and whose `pricingRule` values differ, and the recapture leg's tax must equal
the sourced maximum rate applied to its amount. Before the split exists the
assertion finds one leg and fails on the component count. A syntax error, a
missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-05-01 | Compatibility | unit | SCN-023-014 | `scripts/selftest.mjs` | Every Feature 022 preferential fixture produces its exact prior total before the recapture category is registered, and every pre-existing federal pack figure is byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-05-01` |
| TP-05-02 | Contract | unit | SCN-023-014 | `scripts/selftest.mjs` | `GainComponent/v1` refuses a `pricingRule` outside its closed set and refuses a recapture component carrying no maximum rate | `node scripts/selftest.mjs` | No | `report.md#tp-05-02` |
| TP-05-03 | Known value | unit | SCN-023-014 | `scripts/selftest.mjs` | The two components sum to the total gain for every fixture, and the recapture component is bounded by both the accumulated depreciation and the total gain including the over-depreciated fixture | `node scripts/selftest.mjs` | No | `report.md#tp-05-03` |
| TP-05-04 | Known value | unit | SCN-023-014 | `scripts/selftest.mjs` | The recapture component's tax equals the sourced maximum rate applied to its amount, and the remainder's tax equals the existing preferential model's result for that amount at that stacking position | `node scripts/selftest.mjs` | No | `report.md#tp-05-04` |
| TP-05-05 | Adversarial | unit | SCN-023-014 | `scripts/selftest.mjs` | Regression: an implementation pricing the whole gain under one rule is proven to fail the two-component assertion and to produce a different total | `node scripts/selftest.mjs` | No | `report.md#tp-05-05` |
| TP-05-06 | Independence | unit | SCN-023-014 | `scripts/selftest.mjs` | `rltaxdisposition.js` contains no stacking arithmetic and no rate literal; the remainder is handed to the existing preferential model and the scan is proven to fire on a module that duplicates the stacking | `node scripts/selftest.mjs` | No | `report.md#tp-05-06` |
| TP-05-07 | Refusal | unit | SCN-023-014 | `scripts/selftest.mjs` | An absent recapture maximum rate refuses the recapture component, and the disposition does not price the whole gain under the preferential model instead | `node scripts/selftest.mjs` | No | `report.md#tp-05-07` |
| TP-05-08 | Deferral integrity | unit | SCN-023-014 | `scripts/selftest.mjs` | Every remaining above-rate preferential category still refuses with its original reason unchanged, asserted against a fixture that exhibits each refusal at least once | `node scripts/selftest.mjs` | No | `report.md#tp-05-08` |
| TP-05-09 | Known value | unit | SCN-023-015 | `scripts/selftest.mjs` | The ownership test and the use test each pass and fail exactly at their sourced period figures, and each publishes the figure compared | `node scripts/selftest.mjs` | No | `report.md#tp-05-09` |
| TP-05-10 | Known value | unit | SCN-023-015 | `scripts/selftest.mjs` | The exclusion amount equals the sourced amount for each filing status, and the excluded amount is bounded by the remainder component | `node scripts/selftest.mjs` | No | `report.md#tp-05-10` |
| TP-05-11 | Adversarial | unit | SCN-023-015 | `scripts/selftest.mjs` | Regression: an implementation applying the exclusion to the recapture component is proven to fail the exclusion-target assertion | `node scripts/selftest.mjs` | No | `report.md#tp-05-11` |
| TP-05-12 | Adversarial | unit | SCN-023-015 | `scripts/selftest.mjs` | Regression: an implementation evaluating the two tests as one combined condition is proven to fail the named-failing-test assertion | `node scripts/selftest.mjs` | No | `report.md#tp-05-12` |
| TP-05-13 | Refusal | unit | SCN-023-015 | `scripts/selftest.mjs` | An absent exclusion amount or period figure refuses the exclusion; no gain is excluded and the refusal is stated | `node scripts/selftest.mjs` | No | `report.md#tp-05-13` |
| TP-05-14 | Basis integrity | unit | SCN-023-014 | `scripts/selftest.mjs` | The adjusted basis this scope reads equals the figure Scope 03 published, for every fixture carrying cost recovery | `node scripts/selftest.mjs` | No | `report.md#tp-05-14` |
| TP-05-15 | Leg visibility | unit | SCN-023-014 | `scripts/selftest.mjs` | Against the all-non-zero fixture, legs `L10` and `L11` appear in the headline, the comparison, the curve contributors and the export, in both directions, and every prior leg still does | `node scripts/selftest.mjs` | No | `report.md#tp-05-15` |
| TP-05-16 | Adversarial | unit | SCN-023-014 | `scripts/selftest.mjs` | Regression: removing each disposition leg from each of the four surfaces in turn is proven to fail the leg-visibility identity with the missing leg named, and each omission changes the headline by an amount unique to that leg | `node scripts/selftest.mjs` | No | `report.md#tp-05-16` |
| TP-05-17 | Vocabulary | unit | SCN-023-014 | `scripts/selftest.mjs` | The refusal vocabulary member count equals its pre-feature value | `node scripts/selftest.mjs` | No | `report.md#tp-05-17` |
| TP-05-18 | Privacy | unit | SCN-023-015 | `scripts/selftest.mjs` | The disposition declarations are inventoried, cleared, redacted, and absent from every URL, request, referrer and console message | `node scripts/selftest.mjs` | No | `report.md#tp-05-18` |
| TP-05-19 | Supersession | unit | SCN-023-014 | `scripts/selftest.mjs` | SUP-023-09's replacement asserts the carried category and retains the original clause for every remaining category on a fixture proven to exercise it; the superseded literal is proven to have failed first | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-05-20 | Marker check | unit | SCN-023-014 | `scripts/selftest.mjs` | The distinct `SUP-023-NN` markers in the repository equal the nine ledger entries, and no assertion outside that set differs from its pre-feature text | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-05-21 | No-registration | unit | SCN-023-015 | `scripts/selftest.mjs` | The tool remains absent from `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md` and market-brief coverage | `node scripts/selftest.mjs` | No | `report.md#tp-05-21` |
| TP-05-22 | Regression E2E | e2e-ui | SCN-023-014 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-014 the gain splits into two legs priced under different rules` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 the gain splits into two legs priced under different rules" --reporter=list` | Yes | `report.md#scenario-scn-023-014` |
| TP-05-23 | Regression E2E | e2e-ui | SCN-023-015 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test" --reporter=list` | Yes | `report.md#scenario-scn-023-015` |
| TP-05-24 | Leg visibility E2E | e2e-ui | SCN-023-014 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-05-24` |
| TP-05-25 | Privacy E2E | e2e-ui | SCN-023-015 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-015 the request ledger stays empty and no disposition declaration reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 the request ledger stays empty and no disposition declaration reaches a URL" --reporter=list` | Yes | `report.md#tp-05-25` |
| TP-05-26 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -015 | The prior features' specs plus this feature's five | The cumulative browser suite over the real route | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list` | Yes | `report.md#tp-05-26` |
| TP-05-27 | Repo gate | unit | SCN-023-014 … -015 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-05-27` |
| TP-05-28 | Path guard | unit | SCN-023-014 … -015 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-28` |
| TP-05-29 | Deploy gate | unit | SCN-023-014 … -015 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML exists, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-05-29` |

### Definition of Done

- [x] Every Feature 022 preferential fixture produces its exact prior total before
      the recapture category is registered, and every pre-existing federal pack
      figure is byte-identical.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-01`
- [x] FR-023-029 and FR-023-030 are implemented: the gain splits into two
      components that sum to the total, the recapture component is bounded by both
      the accumulated depreciation and the gain, it is priced at the sourced
      maximum rate, and pricing the whole gain under one rule is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-02`, `report.md#tp-05-03`, `report.md#tp-05-04`, `report.md#tp-05-05`
- [x] FR-023-031 is implemented: `rltaxdisposition.js` contains no stacking
      arithmetic and no rate literal, the remainder is handed to the existing
      preferential model, and a duplicated stacking is proven to be detected.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-06`
- [ ] `BI-9` and `BI-10` were closed by retrievals performed in the implementation
      session and recorded with their own `retrievedAt` and locators, or the
      affected figure ships as an `AbsentFigure/v1` and its component refuses.
  - **Phase:** implement · **Command:** the retrieval records in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-05-07`, `report.md#tp-05-13`
  - **Left unchecked because:** this completion session performed NO primary-source
    retrieval and re-verified no figure against a live authority, so it cannot
    attest the digit-by-digit verification this row asserts. What it did verify by
    inspection is recorded in `report.md#sourcing`: both retrieval records exist
    with title, URL, `publishedAt`, `retrievedAt`, `retrievalOutcome retrieved`,
    locator and applicable-year map, the head-of-household amount ships as an
    `AbsentFigure/v1`, and both refusal branches are green (`TP-05-07`,
    `TP-05-13`, and the browser branch in `TP-05-22` and `TP-05-23`). The row is
    for the implementation session to check.
- [x] FR-023-032 is implemented: depreciation recapture is a carried category, and
      every remaining above-rate category still refuses with its original reason,
      asserted against a fixture that exercises each refusal at least once.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-08`
- [x] FR-023-033 and FR-023-034 are implemented: the two tests are evaluated
      separately and exactly at their sourced period figures, the failing one is
      named, the exclusion amount is sourced per filing status, and applying it to
      the recapture component is proven to fail.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-09`, `report.md#tp-05-10`, `report.md#tp-05-11`, `report.md#tp-05-12`
- [x] The adjusted basis read here equals the figure Scope 03 published, for every
      fixture carrying cost recovery.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-14`
- [x] FR-023-035 and NFR-023-006 are implemented: both disposition legs are
      surfaced in the headline, the comparison, the curve and the export, every
      prior leg still is, and removing each leg from each surface in turn is
      demonstrated to fail with the missing leg named and the headline moving by an
      amount unique to that leg.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-05-15`, `report.md#tp-05-16`, `report.md#tp-05-24`
- [x] NFR-023-004 holds: the refusal vocabulary member count equals its pre-feature
      value, confirming this feature added no code.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-05-17`
- [x] NFR-023-003 holds: the disposition declarations are inventoried, cleared and
      redacted, and the request ledger stays empty.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-05-18`, `report.md#tp-05-25`
- [ ] SUP-023-09 is delivered with its marker, its superseded clause recorded
      verbatim, its intended-RED failure recorded before its green, and the marker
      check confirms the repository's `SUP-023-NN` markers equal the nine ledger
      entries.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the marker check · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-05-19`, `report.md#tp-05-20`
  - **Left unchecked because:** the marker check is green and was observed in this
    session (`TP-05-19 and TP-05-20`, exit 0), but the superseded clause verbatim
    and the intended-RED failure that preceded SUP-023-09's green were produced in
    the implementation session and are not recorded in `report.md`. This session
    did not observe that RED and will not claim it. The row needs the
    implementation session's capture, not a second green.
- [x] NFR-023-010 holds: the tool is still absent from every registry and no new
      root HTML exists.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus `node scripts/build-pages-site.mjs --dry-run` · **Evidence:** `report.md#tp-05-21`, `report.md#tp-05-29`
- [ ] Every excluded path is byte-identical, including `rltaxrental.js`, proving
      the disposition reads a published basis rather than reaching into the rental
      engine.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
  - **Left unchecked because:** byte-identity has no measurable baseline for the
    untracked excluded paths. The whole Feature 021 to 023 delivery is uncommitted,
    so `rltaxrental.js`, `rltaxuse.js`, `rltaxproperty.js` and the prior spec files
    are `??` rather than clean, and `site-exclusions.json` differs from `HEAD` by
    Feature 021's eight entries. What the path-scoped check in
    `report.md#change-boundary` does establish is that every TRACKED excluded path
    except `site-exclusions.json` is byte-identical to `HEAD`, that
    `site-exclusions.json` carries zero Feature 023 entries, and that this session
    changed only this scope's own spec file.
- [x] No output states a probability, an appreciation assumption, a lifetime
      figure, a future year, a track record or an error rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows and the cumulative suite.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-26 commands · **Evidence:** `report.md#test-evidence`
  - **Left unchecked because:** intended RED was observed in this session for the
    four browser rows only (`TP-05-22` through `TP-05-25`, recorded verbatim in
    `report.md#browser-rows--intended-red-observed-in-this-session`), and that RED
    was a defect in the spec's own assertions rather than the pre-implementation
    RED the row means. TP-05-01 through TP-05-21 and TP-05-26 have same-command
    GREEN recorded with exit codes but no RED capture, because their RED belongs to
    the implementation session.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-05-27`, `report.md#tp-05-28`, `report.md#tp-05-29`
