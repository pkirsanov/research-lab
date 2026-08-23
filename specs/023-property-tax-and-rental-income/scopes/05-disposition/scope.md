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
15. Run the whole-feature closing checks: the marker check over every ledger entry,
    with the expected count derived from the ledger rather than pinned, the
    cumulative browser suite, and the assertion that the tool is still absent from
    every registry.

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
| TP-05-20 | Marker check | unit | SCN-023-014 | `scripts/selftest.mjs` | The distinct `SUP-023-NN` markers in the repository and the ledger's entries are the same set in both directions, the expected count being derived from the ledger's own row count, the sum of the ownership column and the total its arithmetic sentence states rather than from a literal; the identity is proven able to fail when a marker id is removed and when one is renamed; and no assertion outside that set differs from its pre-feature text | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-05-21 | No-registration | unit | SCN-023-015 | `scripts/selftest.mjs` | The tool remains absent from `tools.json`, `index.html`, `rlnav.js`, `README.md`, `notes/README.md` and market-brief coverage | `node scripts/selftest.mjs` | No | `report.md#tp-05-21` |
| TP-05-22 | Regression E2E | e2e-ui | SCN-023-014 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-014 the gain splits into two legs priced under different rules` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 the gain splits into two legs priced under different rules" --reporter=list` | Yes | `report.md#scenario-scn-023-014` |
| TP-05-23 | Regression E2E | e2e-ui | SCN-023-015 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 the residence exclusion applies to the remainder only and names a failing test" --reporter=list` | Yes | `report.md#scenario-scn-023-015` |
| TP-05-24 | Leg visibility E2E | e2e-ui | SCN-023-014 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-014 both disposition legs reach the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-05-24` |
| TP-05-25 | Privacy E2E | e2e-ui | SCN-023-015 | `lifetime-tax-disposition.spec.mjs` | `Regression: SCN-023-015 no disposition declaration reaches a requested URL, the address bar, the referrer or a console message` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-015 no disposition declaration reaches a requested URL, the address bar, the referrer or a console message" --reporter=list` | Yes | `report.md#tp-05-25` |
| TP-05-26 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-001 … -015 | The prior features' specs plus this feature's five | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-05-26` |
| TP-05-27 | Repo gate | unit | SCN-023-014 … -015 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-05-27` |
| TP-05-28 | Path guard | unit | SCN-023-014 … -015 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-05-28` |
| TP-05-29 | Deploy gate | unit | SCN-023-014 … -015 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, no new root HTML exists, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-05-29` |
| TP-05-30 | Privacy E2E | e2e-ui | SCN-023-015 | `tests/lifetime-tax-disposition.spec.mjs` | GAP, NOT AUTHORED (opened 2026-08-22, F-REG-03). `SCN-023-015` is the only member of this feature family's privacy set that constrains *neither* ledger growth *nor* the declared-asset set: its body holds no `afterFirstPaint`, no `declaredRouteAssets` and no `permitted`, and its sole use of the request list is `requests.filter((url) => !url.endsWith('.js') && !url.endsWith('.css'))`. Required, in the same run: `afterFirstPaint` captured after `openLifetimeTax` and asserted greater than zero, the ledger asserted not to grow past it once the sale is declared, and every entry's pathname asserted to be a member of `declaredRouteAssets()` — which also removes the `.js`/`.css` blind spot, because a filtered-out asset URL would then have to be a declared path. Adversarial cases: a request issued after the sale is declared fails the no-growth assertion; a read of a path the configuration does not declare fails the permitted-set assertion; a sale figure smuggled onto a `.js` URL, which the current filter cannot see, fails the permitted-set assertion; and a boot that read nothing fails the greater-than-zero pin | not authored | Yes | not authored |

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
- [x] `BI-9` and `BI-10` were closed by retrievals performed in the implementation
      session and recorded with their own `retrievedAt` and locators, or the
      affected figure ships as an `AbsentFigure/v1` and its component refuses.
  - **Phase:** implement · **Command:** the retrieval records in the federal pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#bi-9-and-bi-10-disjunction--mechanically-derived-in-this-session`, `report.md#tp-05-07`, `report.md#tp-05-13`
  - **Claim Source:** executed. The row's disjunction was derived over every leaf of
    `dispositionPolicy`: 4 leaves are SOURCED with a resolving `sourceRecords` entry
    carrying `retrievedAt` and `retrievalOutcome retrieved` plus their own locator, 1
    leaf is an `AbsentFigure/v1` carrying code, domain, missingSource, reason and
    remediation, and `INCOMPLETE: 0` — no leaf falls outside both branches
    (`DERIVATION_EXIT=0`). The derivation is proven able to fail by three in-memory
    probes: removing a locator and gutting the absence each raise `INCOMPLETE` to 1,
    and substituting a borrowed `250000` for the head-of-household absence drops the
    `AbsentFigure/v1` count from 1 to 0. The probes ran on deep clones, so the pack
    was never written. Both refusal branches are green in
    `node scripts/selftest.mjs` (`3011 passed, 0 failed`, exit `0`).
    What this session did NOT do, and does not claim: it performed no new
    primary-source retrieval. The `retrievedAt` values `2026-08-17T19:03:51Z` and
    `2026-08-17T22:52:00Z` both precede commit `b9d92a3f1`
    (`2026-08-18T12:17:13-07:00`), which corroborates but does not by itself prove
    that the retrievals were performed in the implementation session.
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
      redacted, and no disposition declaration and no disposition member name
      reaches a requested URL outside the route's own script and stylesheet
      loads, the address bar, the referrer or a console message.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-05-18`, `report.md#tp-05-25`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "and the request
    ledger stays empty", which is false — the route issues its document reads and
    its `<script src>` loads on every boot. It was also the weakest-supported
    instance in this family: the cited browser row `TP-05-25` (`SCN-023-015`)
    proves *neither* of the two propositions the rest of the family proves. Its
    body holds no `afterFirstPaint`, no `declaredRouteAssets` and no `permitted`
    set; its only use of the request list is
    `requests.filter((url) => !url.endsWith('.js') && !url.endsWith('.css'))`,
    which it then scans for declared values and member names. The item now claims
    exactly that. Adversarial cases: a sale figure or a member name reaching a
    requested non-asset URL, the address bar, `document.referrer` or a console
    message each fails the scan. Two limits are deliberate and named rather than
    hidden: the row cannot see a value smuggled onto a `.js` or `.css` URL,
    because those are filtered out before the scan, and it skips any declared
    value shorter than five characters (`if (value.length < 5) continue;`). The
    ledger-growth and declared-asset halves are not covered by this scope at all
    and are opened as `TP-05-30` below.
- [x] NFR-023-003 holds on the live route for the disposition declarations: the
      request ledger does not grow after first paint and every entry in it is a
      read of a path the route's own configuration declares.
  - **Phase:** test · **Command:** `TP-05-30` · **Evidence:** `report.md#probes-25-to-28--the-four-rows-the-per-row-pass-never-reached-2026-08-22`
  - **Claim Source:** executed. `TP-05-30` is authored in
    `tests/lifetime-tax-disposition.spec.mjs`: it opens the real route, captures
    the ledger length immediately after first paint, pins it greater than zero,
    declares the sale as distinctive sentinels, then asserts the ledger has not
    grown and that every entry is a same-origin read of a path the route's own
    configuration declares. Three probes, one per adversarial case, each
    discriminated with a hash-verified revert: zeroing the capture reds the
    non-empty pin, subtracting one from it reds the no-growth equality, and
    withdrawing the declared pack family from the derivation reds the
    permitted-set sweep. The permitted set is derived from the page's own script
    tags and `declaredPackPaths`, so a module a later scope adds is admitted by
    the page's declaration rather than by a literal edited here.
- [x] SUP-023-09 is delivered with its marker in the file the per-file distribution
      names, its superseded clause recorded verbatim at its own site and the
      superseded literal surviving nowhere else, and the marker check confirms the
      repository's distinct `SUP-023-NN` markers and the ledger's entries are the
      same set in both directions. The expected count is DERIVED from the ledger
      itself — its row count, the sum of the ownership table's own count column and
      the total its arithmetic sentence states in words, all three in agreement —
      rather than stated as a literal, so a later ASC-8 admission is absorbed
      without editing this row. The identity is proven able to fail: recomputed once
      with a marker id removed and once with a marker id renamed, it fails in both
      cases and names the id that broke it.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the marker check · **Evidence:** `report.md#supersession-ledger`, `report.md#verification-of-the-corrected-ledger-derived-identity-row`, `report.md#tp-05-19`, `report.md#tp-05-20`
  - **Verified and checked.** Executed against the committed tree. The three count
    sources agree at fourteen (ledger rows `14`, ownership column `5+5+1+2+1=14`,
    sentence *Five plus five plus one plus two plus one is fourteen*), the tree
    carries exactly those fourteen distinct ids, and set equality holds in both
    directions. Both adversarial recomputations fail and name the breaking id: the
    removal names `SUP-023-12`, the rename names both `SUP-023-09` (lost) and
    `SUP-023-99` (unledgered), the latter while holding the set size constant so a
    count-only check could not have caught it.
  - **Corrected by `bubbles.plan`.** This row previously required the markers to
    equal *the nine ledger entries* and required SUP-023-09's intended-RED failure
    to be recorded before its green. Neither conjunct could be satisfied.
    1. **The count was a stale planning prediction.** The delivered ledger holds
       **fourteen** rows and the tree carries fourteen distinct ids, SUP-023-01
       through SUP-023-14, SUP-023-10 through SUP-023-14 having been admitted in
       flight under ASC-8 by Scopes 02, 03 and 04. Executed at correction time:
       `grep -rhoE 'SUP-023-[0-9]{2}' specs/023-property-tax-and-rental-income/ | sort -u | wc -l`
       → `14`, and `grep -cE '^\| SUP-023-[0-9]{2} \|' specs/023-property-tax-and-rental-income/spec.md`
       → `14`. The literal is replaced by the ledger-derived identity above — the
       same form Feature 024's equivalent row uses — so the next ASC-8 admission is
       absorbed without another planning edit rather than re-staling the number.
    2. **The intended-RED baseline is not recoverable.** The implementation session
       is squashed into commit `b9d92a3f1` together with every other scope of
       Features 021-024, so no pre-supersession tree state survives to re-derive
       that observation from. It is replaced by the adversarial identity probe
       above, which any session can reproduce on demand and which still fails
       whenever a marker and its ledger row disagree.
- [x] NFR-023-010 holds: the tool is still absent from every registry and no new
      root HTML exists.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus `node scripts/build-pages-site.mjs --dry-run` · **Evidence:** `report.md#tp-05-21`, `report.md#tp-05-29`
- [x] Every excluded path is byte-identical, including `rltaxrental.js`, proving
      the disposition reads a published basis rather than reaching into the rental
      engine.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`, `report.md#attribution-closed--the-row-is-now-satisfied`
  - **Closed on:** every pre-existing excluded path unchanged by the series commit;
    the created entries carrying none of this scope's artefacts as it left the tree;
    zero working-tree drift over all thirty-five entries; and `rltaxdisposition.js`
    requiring only `./rltaxrules`, so the rental engine is never reached into. The
    Feature 023 references now in the Feature 022 Scope 01 report arrived after this
    scope, in commit `906866405`.
- [x] No output states a probability, an appreciation assumption, a lifetime
      figure, a future year, a track record or an error rate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows and the cumulative suite.
  - **Re-ticked 2026-08-22 at the full count of thirty.** The note below is kept
    because it records why the item was opened. `TP-05-30` is now authored and
    carries a three-arm RED with a same-command GREEN. Auditing the rest of the
    Test Plan while closing it surfaced a second, older gap the note never named:
    the per-row pass closed `TP-05-01` through `TP-05-26` and its command list
    says exactly that, so the three gate rows `TP-05-27`, `TP-05-28` and
    `TP-05-29` had never carried a RED either. All four are now closed by probes
    25 to 28 in
    `report.md#probes-25-to-28--the-four-rows-the-per-row-pass-never-reached-2026-08-22`,
    each a harness run with its revert proven by blob hash. The finding already
    carried against the cumulative row travels forward unchanged and is not
    withdrawn: `TP-05-26`'s GREEN reports the 77 selected, 77 passed, zero failed
    and zero skipped the row claims, while exiting 1 on a worker-teardown trailer
    the runner labels as not part of any test.
  - **Unticked 2026-08-22 (F-REG-03).** `TP-05-30` was opened in this scope and
    is not authored, so it carries neither a RED nor a GREEN. The word "Every"
    therefore no longer holds. Ticking it again requires `TP-05-30` authored with
    a RED and a same-command GREEN.
  - **Phase:** implement · **Command:** the exact TP-05-01 through TP-05-26 commands · **Evidence:** `report.md#per-row-intended-red-probes`
  - **Closed by probes 20 to 24.** Probes 1 to 19 already carried `TP-05-01`
    through `TP-05-21`, every one under `node scripts/selftest.mjs`. The five
    rows that name browser commands are now closed under their own commands:
    probe 20 collapses the two pricing rules to one (`TP-05-22`), probe 21
    inverts which component the residence exclusion is applied to (`TP-05-23`),
    probe 22 renames the remainder leg id so the surface census cannot find it
    (`TP-05-24`), probe 23 emits one declaration **member name** to the console
    (`TP-05-25`), and probe 24 plants a `+ 1` term in the Feature 022 settlement
    engine so the cumulative suite's breadth claim is what goes red
    (`TP-05-26`). Every mutation is value-free by construction — a rule
    identifier, a component id, a member name or the literal `1` — each was
    reverted inside the same shell invocation and re-verified by SHA-256 with
    `REVERT_VERIFIED=yes`, and the module set was clean under `git status`
    afterwards.
  - **One finding is carried, not hidden.** The cumulative GREEN reports 77
    selected, 77 passed, zero failed and zero skipped — the row's stated claim —
    but exits 1 on a worker-teardown trailer the harness labels "not a part of
    any test". It reproduced twice on a clean tree with different worker ids. The
    teardown budget is outside this scope's allowed paths and is left as an
    inherited observation in `report.md#probe-24--red-for-tp-05-26-the-cumulative-suite`.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-05-27`, `report.md#tp-05-28`, `report.md#tp-05-29`
