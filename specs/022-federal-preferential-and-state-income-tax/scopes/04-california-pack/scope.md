# Scope 4: California Pack

## 04-california-pack

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In Progress (deliverables and tests verified; newly added planning rows unverified)
**Scope-Kind:** runtime-behavior
**Tags:** `pack:state`, `sourcing-gated:true`, `stress-case:true`, `known-value-tested`
**Depends On:** 01, 02, 03
**Foundation:** false

**Primary Outcome:** a California resident receives a state settlement computed
from California's own structure rather than from a federal shape with California
numbers: capital gains and qualified dividends taxed in the ordinary schedule, a
California standard deduction, exemption relief applied as a credit **after** rate
application, and a surcharge whose threshold is identical for every filing status
and against which no credit may be applied. This scope adds **no contract**. Every
shape it needs was proven against Florida and the fixture packs in Scope 03; if
California does not fit, that is a finding about the contract rather than a licence
to widen it toward California.

## Requirement Coverage

- **FR-022-022** — the ordinary schedule prices pooled ordinary, qualified-dividend
  and long-term-capital-gain income; no preferential table is carried.
- **FR-022-023** — California's own standard deduction per filing status, applied
  to its own taxable-income computation.
- **FR-022-024** — exemption relief carried as a credit with an application point
  after rate application, never as a reduction of income.
- **FR-022-025** — the surcharge threshold is identical for every filing status,
  including married filing jointly.
- **FR-022-026** — no credit is applied against the surcharge.
- **FR-022-027** — every unretrieved California figure ships as an absent figure
  with a `missingSource` pointer and its leg refuses.

Inherited and re-asserted: **FR-022-002** retrieved non-newsroom sources,
**FR-022-003** locators, **FR-022-007** no derivation, **FR-022-008** leg-set
summation, **FR-022-020** and **FR-022-021** pack-declared preferential policy and
application points, **NFR-022-005** no in-module rule value.

## Gherkin Scenarios

```gherkin
Scenario: SCN-022-010 California taxes preferential income as ordinary income
  Given a California resident with ordinary income and a realized long-term capital gain
  When the state settlement is computed
  Then the gain is taxed in the same schedule as ordinary income with no preferential band applied
  And the pack declares that it carries no preferential treatment rather than the engine assuming it
  And the federal settlement for the identical household still applies its preferential bands

Scenario: SCN-022-011 California exemption relief is a credit applied after the rate
  Given a California resident eligible for exemption credits
  When the state settlement is computed
  Then the credit is subtracted from the computed tax rather than from income
  And the order is visible in the displayed stage list
  And an implementation that subtracts the credit from income is demonstrated to fail the assertion

Scenario: SCN-022-012 The California surcharge threshold does not vary by filing status
  Given California residents in each supported filing status with taxable income immediately below, exactly at, and immediately above the surcharge threshold
  When the state settlement is computed
  Then every filing status crosses at the identical threshold
  And no exemption credit reduces the surcharge
  And each of the three positions produces the known value derived from the pack's own figures
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-022-010 conformity | California residency, valid workspace | Enter a long-term gain, then the same amount as ordinary income | An identical state figure in both cases, and a federal figure that differs between them | e2e-ui |
| SCN-022-011 credit order | California residency, credits eligible | Open the state stage ledger | The credit appearing after rate application, with the pre-credit and post-credit figures both visible | e2e-ui |
| SCN-022-012 threshold | Each filing status in turn | Enter taxable income below, at and above the surcharge threshold | The same crossing point in all four statuses, and a surcharge unchanged by the credit | e2e-ui |
| Absent figure | A status whose schedule was not retrieved | Open the state panel | `RLTAX-THRESHOLD-UNAVAILABLE` with the `missingSource` pointer, and no numeral in its place | e2e-ui |
| Order unavailable | A pack with no establishable calculation order | Open the state panel | `RLTAX-PACK-INVALID` refusing the whole pack, with no partial California figure anywhere | e2e-ui |

## Implementation Files

### New

- `tax-rules/state/CA/<year>.json` — the California pack.
- Known-value fixture files for every California bracket edge the pack carries,
  for the standard deduction in each status, for the credit application, and for
  the surcharge threshold in all four statuses, each naming the source edition and
  tax year it was derived from.

### Modified

- `lifetime-tax-strategy-lab.html` — `ReliefLedger` and the California rows of
  `StateStageLedger`.
- `scripts/selftest.mjs` — one appended assertion group.

**No module is modified in this scope.** That is the scope's structural claim: the
contract from Scope 03 must carry California without an engine edit. An engine
edit here is a finding, recorded as such, not absorbed.

## Implementation Plan

1. **Retrieve `BI-7` first.** Open the authority that states California's order of
   deduction, rate application, credit and surcharge, and record it. If the order
   cannot be established, the whole pack is `RLTAX-PACK-INVALID` and this scope
   ships a refusing pack rather than a partial one. Do not infer the order from
   the federal order or from the shape of a form.
2. **Retrieve `BI-6`.** Open the Franchise Tax Board publications for the declared
   tax year and transcribe, directly from them: the rate schedule bands for each
   filing status, the standard deduction for each filing status, and the exemption
   credit amounts. Open the statutory section for the surcharge and transcribe its
   rate and threshold. Record every retrieval in its own `SourceRecord/v1` with
   its own `retrievedAt`.
3. Every figure that cannot be retrieved ships as an `AbsentFigure/v1` with a
   `missingSource` pointer. A California pack that ships with several absent
   figures is a correct outcome of this scope. A California pack that ships with a
   recalled figure is not.
4. Author the pack with `preferentialPolicy: "none"` and **no**
   `preferentialRateTables` member. The contract already refuses a pack that
   declares `none` while carrying one, so this is enforced rather than reviewed.
5. Declare the leg set: the ordinary leg and the surcharge leg, both
   `includedInTotal`. Declare the ordered calculation array for
   `preferentialPolicy: "none"`, which omits the two preferential stages, and let
   the engine's derived comparison refuse any mismatch.
6. Declare the surcharge as a `ThresholdSet/v1` with `varyByFilingStatus: false`
   and a single threshold key. This is the member that lets the engine apply an
   unusual threshold rule without knowing that anything unusual is happening. Do
   not add a filing-status branch anywhere.
7. Declare the exemption credit as a `ReliefMechanism/v1` with
   `kind: "credit-against-tax"`, `applicationPoint: "after-rate-application"` and
   an `appliesToLegs[]` naming the ordinary leg **only**. The surcharge leg is
   deliberately absent from that list, which is what keeps the credit off the
   surcharge without an engine rule.
8. Declare the California standard deduction as its own `DeductionAmount/v1` per
   filing status, cited to its own authority. Do not reference the federal
   deduction and do not derive one from the other.
9. Populate `unsupportedFeatures[]` with every California provision the pack does
   not carry, so a reader sees the coverage boundary without inspecting the tables.
10. Add the known-value fixtures. The surcharge fixtures are the unusual ones:
    all four filing statuses must cross at the **same** value, which is the
    opposite of every other threshold in this feature, and a fixture set that
    doubles the threshold for a joint return must be shown to fail.
11. Render `ReliefLedger` and the California stage rows, showing the pre-credit
    and post-credit figures side by side so the application point is visible
    rather than asserted.
12. Append a `lifetime-tax — California state pack` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| The Scope 03 contract | Consumed, not modified | Scope 05 | High — an engine edit made to accommodate California would mean the contract was shaped around one pack after all | Assert every module file is byte-identical at the end of this scope, and treat any required edit as a finding routed back to Scope 03 rather than applied here | Delete the pack; no module changed |
| `tax-rules/state/CA/<year>.json` | Created | Scope 05 | Medium — a wrong figure changes a state total but no contract | Validate the pack and run every known-value fixture before any route row | Delete the pack file |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |
| `lifetime-tax-strategy-lab.html` | Two ledgers added | Scope 05 | Low — same-feature page | The CSP meta stays byte-identical | Revert the panels |

## Change Boundary And Protected Paths

**Allowed new:** `tax-rules/state/CA/<year>.json` · this scope's fixture files.

**Allowed modified:** `lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs`
(append-only — this scope owns no supersession) · this scope's Playwright spec.

**Excluded — must remain byte-identical:** `rltaxrules.js` · `rltax.js` ·
`rltaxstate.js` · `rltaxworkspace.js` · `rltaxstrategy.js` ·
`tax-rules/federal/**` · `tax-rules/state/FL/**` · `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`tools.json` · `index.html` · `rlnav.js` · `README.md` · `notes/README.md` ·
`market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · `tests/lifetime-tax-*.spec.mjs` ·
`tests/lifetime-tax.support.mjs` · every framework-managed file.

Every module is excluded on purpose. This is the scope that tests whether Scope
03 produced a contract or a California-shaped hole.

**Allowed file families:** the *Allowed new* and *Allowed modified* paths named
above, and nothing else.

**Excluded surfaces:** the byte-identical list named above. Collateral cleanup
outside the allowed families is opt-in and is not performed under this scope.

**Rollback:** delete the California pack and its fixtures; revert the page panels
and the appended selftest group. No module reverts are needed because none
changed.

## Assertion Supersession Owned By This Scope

**None.** This scope owns no entry in the
[supersession ledger](../../spec.md#supersession-ledger). Adding a second state
pack changes no behaviour any pre-existing assertion pins, so every one of them
must still pass unchanged at the end of this scope. An assertion that fails here
is a defect in this scope's change and is fixed rather than edited. This scope
appends only.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run the
exact command, and confirm the intended contract assertion is what fails. Then
implement the smallest owned change and rerun the identical command.

**Named intended-RED assertion for this scope:** a married-filing-jointly
California household with taxable income immediately above the surcharge threshold
owes the surcharge, and owes the identical surcharge a single household with the
same taxable income owes. Before the pack declares `varyByFilingStatus: false` the
assertion fails because the joint threshold resolves to a different value. A
syntax error, a missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Pack validity | unit | SCN-022-010 | `scripts/selftest.mjs` | The California pack validates through the unmodified Scope 03 contract, declares `preferentialPolicy: "none"`, carries no preferential table, and its ordered array matches the engine's derived array element for element | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Known value | unit | SCN-022-010 | `scripts/selftest.mjs` | State tax is exact immediately below, exactly at, and immediately above every California bracket edge the pack carries, for every filing status whose schedule resolved | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Known value | unit | SCN-022-010 | `scripts/selftest.mjs` | A long-term gain and an equal amount of ordinary income produce an identical California figure, while the federal figures for the same two households differ | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Known value | unit | SCN-022-011 | `scripts/selftest.mjs` | The California standard deduction resolves per filing status from its own authority, is applied to California taxable income, and is never derived from the federal deduction | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Known value | unit | SCN-022-011 | `scripts/selftest.mjs` | The exemption credit is subtracted from the computed tax after rate application, and the pre-credit and post-credit figures are both published | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Adversarial | unit | SCN-022-011 | `scripts/selftest.mjs` | Regression: an implementation that subtracts the exemption credit from income is proven to fail the application-point assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Known value | unit | SCN-022-012 | `scripts/selftest.mjs` | The surcharge is exact immediately below, exactly at, and immediately above the threshold, and all four filing statuses cross at the identical value | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Adversarial | unit | SCN-022-012 | `scripts/selftest.mjs` | Regression: a pack that doubles the surcharge threshold for a joint return is proven to fail the identical-threshold assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Adversarial | unit | SCN-022-012 | `scripts/selftest.mjs` | Regression: an implementation that applies the exemption credit to the surcharge leg is proven to fail the `appliesToLegs[]` assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Adversarial | unit | SCN-022-010 | `scripts/selftest.mjs` | Regression: a pack that declares no preferential treatment while carrying a preferential table is proven to be refused | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Absence discipline | unit | SCN-022-012 | `scripts/selftest.mjs` | Every unretrieved California figure is an `AbsentFigure/v1` with a `missingSource` pointer and no smuggled numeric member, and its leg refuses while sibling legs still resolve | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | Absence discipline | unit | SCN-022-012 | `scripts/selftest.mjs` | A pack whose calculation order cannot be established is refused in full as `RLTAX-PACK-INVALID`, and no partial California figure is produced | `node scripts/selftest.mjs` | No | `report.md#tp-04-12` |
| TP-04-13 | Contract stability | unit | SCN-022-010 | `scripts/selftest.mjs` | Every module file is byte-identical to its Scope 03 state, proving California required no engine edit | `node scripts/selftest.mjs` plus a path-scoped status check | No | `report.md#tp-04-13` |
| TP-04-14 | Coverage boundary | unit | SCN-022-010 | `scripts/selftest.mjs` | `unsupportedFeatures[]` is non-empty and names every California provision the pack does not carry, and no result is labelled a complete state tax | `node scripts/selftest.mjs` | No | `report.md#tp-04-14` |
| TP-04-15 | No-shadow | unit | SCN-022-010 | `scripts/selftest.mjs` | Regression: no module holds a California bracket, rate, deduction, credit, threshold, state name or authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-04-15` |
| TP-04-16 | Regression E2E | e2e-ui | SCN-022-010 | `lifetime-tax-california.spec.mjs` | `Regression: SCN-022-010 California renders no preferential stage and a long term gain reaches the identical state result an equal ordinary amount reaches` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-010 California renders no preferential stage and a long term gain reaches the identical state result an equal ordinary amount reaches" --reporter=list` | Yes | `report.md#scenario-scn-022-010` |
| TP-04-17 | Regression E2E | e2e-ui | SCN-022-011 | `lifetime-tax-california.spec.mjs` | `Regression: SCN-022-011 the exemption credit stage is rendered after the rate and the leg sum and refuses rather than resolving to zero` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-011 the exemption credit stage is rendered after the rate and the leg sum and refuses rather than resolving to zero" --reporter=list` | Yes | `report.md#scenario-scn-022-011` |
| TP-04-18 | Regression E2E | e2e-ui | SCN-022-012 | `lifetime-tax-california.spec.mjs` | `Regression: SCN-022-012 the surcharge threshold is identical for every filing status` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-012 the surcharge threshold is identical for every filing status" --reporter=list` | Yes | `report.md#scenario-scn-022-012` |
| TP-04-19 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-001 … -012 | Feature 021's five specs plus this feature's four | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-04-19` |
| TP-04-20 | Repo gate | unit | SCN-022-010 … -012 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-04-20` |
| TP-04-21 | Path guard | unit | SCN-022-010 … -012 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-04-21` |
| TP-04-22 | Deploy gate | unit | SCN-022-010 … -012 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-04-22` |

### Definition of Done

- [ ] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-022-010, SCN-022-011 and SCN-022-012 pass under the exact persistent titles this scope's Test Plan names, and each of those titles is present in the spec file rather than merely selected by `--grep`. Adversarial case: renaming or deleting one of those persistent titles must fail this row, so an empty grep selection can never be read as a pass.
- [ ] Broader E2E regression suite passes across the whole lifetime-tax browser family, not this scope's own spec file alone. Adversarial case: a change made inside this scope that reddens a sibling scope's persistent title must fail this row even while this scope's own rows stay green.
- [ ] Change Boundary is respected and zero excluded file families were changed, proven by a path-scoped `git status --porcelain` over the excluded surfaces plus an mtime comparison for any untracked excluded directory. Adversarial case: touching one excluded path must produce a row and fail this item; `git diff --quiet` alone is not accepted, because it reports an untracked path as unchanged.

- [x] `BI-7` was closed by a retrieval performed in the implementation session and
      recorded with its own `retrievedAt`, or the whole pack ships refusing and no
      partial California figure exists anywhere.
  - **Phase:** implement · **Command:** the retrieval record in the pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-04-12`
  - **Evidence:** the first branch is the one taken. Revenue and Taxation Code
    sections 17041, 17039 and 17043 were each opened in this session and read
    back against the shipped pack; section 17043 subdivision (a) states the rate
    and the threshold digit for digit, and subdivisions (c)(1) to (c)(3) state
    the three exclusions the pack encodes. TP-04-12 fell by name under a
    value-free `retrieved`-to-`attempted` probe and returned green under the
    identical command after an in-invocation revert.
- [x] `BI-6` was closed by retrievals performed in the implementation session,
      each recorded with its own `retrievedAt` and its own locator, or every figure
      those retrievals could not reach ships as an `AbsentFigure/v1` naming its
      refusal code, its reason, what would make it available and its
      `missingSource`, and the refusal path is proven end to end. Under either
      branch no figure was recalled, derived from another figure, or taken from a
      secondary site.
  - **Phase:** implement · **Command:** the retrieval records in the pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-04-11`
  - **Adversarial case this row must still fail.** A figure that appears in the
    pack under **neither** branch — no `SourceRecord/v1` with its own
    `retrievedAt` and locator, and no `AbsentFigure/v1` — must fall this row; so
    must a figure whose value is derived from another figure in the pack, from a
    federal figure, or from another tax year, however completely it is cited. The
    second branch is a licence to ship an honest absence, never a licence to ship
    an unsourced number wearing an absence's paperwork.
  - **Open because:** `BI-6` covers three figure groups and **none of them was
    retrievable**. A third session took the route the earlier two had not, the
    Revenue and Taxation Code sections that create the figures, and retrieved
    both in full: section 17073.5 for the standard deduction and section 17054
    for the exemption credits. Neither supplies a declared-year amount, and each
    says so itself — subdivision 17073.5(d) requires the Franchise Tax Board to
    *recompute* the deduction every taxable year and subdivision 17054(i)
    requires it to *compute* the credits the same way, both from a Consumer
    Price Index change the Department of Industrial Relations transmits **no
    later than August 1 of the current calendar year**. The printed amounts are
    a pre-indexing base, exactly as section 17041(h) makes the printed brackets
    one. The declared-year Form 540 booklet that would carry the recomputed
    tables returns HTTP 404, as do three further declared-year and prior-year
    rate pages.

    **The three missing figures, named exactly:** the ordinary rate schedule for
    all four filing statuses; the standard deduction for all four filing
    statuses; the personal exemption credit amount for all four filing statuses.
    **What would unblock them:** publication of the Franchise Tax Board's Form 540
    personal income tax booklet for the declared tax year, which carries all
    three in one document. The CPI input for the declared year was transmitted
    at the start of this month, so the blocker is a dated external publication
    event, not a broken link a later session could route around.

    **A prior claim on this row is withdrawn.** The earlier note recorded that
    the declared year's Form 540-ES instructions state the declared year's
    standard deduction. The amount that worksheet lists for each filing status is
    identical, to the dollar, to the amount the *prior* year's Form 540 chart
    lists for the same status, and it sits in a worksheet whose adjacent lines
    send the filer to the prior year's tax table and the prior year's exemption
    credit. Section 17073.5(d) mandates a recomputation every year, so a genuine
    declared-year figure equal to the prior year's to the dollar would require a
    zero CPI change. Closing this row on it would have relabelled a figure across
    tax years, which `BI-6` and FR-022-007 both forbid.

    The pack was left carrying no figure for the third time; what changed is that
    the twelve year-blocked absent figures now name the recomputation mandate,
    the August 1 transmission and the specific publication whose issue supplies
    them, instead of saying "was not retrieved in this session". See
    `report.md#sourcing`.
  - **Restated 2026-08-22 by `bubbles.plan`: branch one failed, and branch two is
    now written into the row.** The previous wording carried only the retrieval
    branch, so it asserted a retrieval that the three sessions above proved cannot
    happen for the declared year, and no amount of correct work could close it.
    Scope 03's `BI-5` has carried the two-branch shape all along — closed by a
    retrieval, **or** the pack ships the figure as an `AbsentFigure/v1` and the
    refusal path is proven instead — and `BI-6` now matches it. Branch two is
    **satisfiable today**: the pack carries 16 `AbsentFigure/v1` records, four
    each under `standardDeductions`, `ordinaryRateTables`, `preferentialRateTables`
    and the exemption credit's per-status `amounts`, and every one of them carries
    `code`, `domain`, `reason`, `whatWouldMakeItAvailable` and `missingSource`
    with no value-bearing member. The refusal path is proven end to end by
    TP-04-11 in `scripts/selftest.mjs` and by the California regression in
    `lifetime-tax-state.spec.mjs`, which reads the code, the domain, the reason
    and the named `missingSource` off a focusable element and proves no dollar
    figure is rendered anywhere in the state card.
  - **Still routed to `bubbles.implement`, but for a smaller thing.** Closing this
    row now needs the verifier to walk all 16 records against the second branch's
    four named members and confirm the adversarial case above fails, not another
    retrieval attempt. The question of the pack's declared year remains open and
    is a separate decision; it no longer holds this row hostage.
  - **Closed on branch two.** The walk asked for was performed and is owned by an
    assertion rather than by prose. All 16 records — 4 `standardDeductions`, 4
    `ordinaryRateTables`, 4 `preferentialRateTables` and the credit's 4 per-status
    `amounts` — are `AbsentFigure/v1`, each carrying `code`, `domain`, `reason`,
    `whatWouldMakeItAvailable` and a `missingSource` with a title, a url and a
    locator, with 16 **distinct** domains and no value-bearing member anywhere. The
    row's adversarial case is carried by two controls the assertion cannot pass
    without: a bare number planted under neither branch is counted short by the
    walk and refused by the contract, and a deduction derived from the surcharge
    threshold the pack already carries is caught by a cross-group detector that
    returns one hit on the clone and zero on the shipped pack. Proven able to fail
    through `scripts/red-green-probe.sh`: duplicating one preferential domain fell
    it at `3181 passed, 2 failed`, and the same command returned
    `3183 passed, 0 failed` after the harness reverted and hash-verified. Both RED
    failures are accounted for read-only rather than assumed — TP-04-01's digest
    clause, which any pack edit moves, and this assertion.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#bi-6s-second-branch-walked-in-this-session`, `report.md#tp-04-11`
- [x] FR-022-027 is implemented: every unretrieved figure is an `AbsentFigure/v1`
      with a `missingSource` pointer and no numeric member, and its leg refuses
      while sibling legs still resolve.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-11`
  - **Evidence:** twelve absent figures across the deduction, rate-table and
    exemption-credit groups each carry the refusal code, a resolvable
    `missingSource`, and none of the five value-bearing member names. TP-04-11
    fell by name under a value-free probe that emptied one `missingSource`
    locator and returned green under the identical command after an
    in-invocation revert.
- [x] FR-022-022 is implemented: the pack declares no preferential treatment,
      carries no preferential table, and prices pooled preferential income in its
      ordinary schedule, proven by an adversarial mutation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-01`, `report.md#tp-04-03`, `report.md#tp-04-10`
  - **Evidence:** the pack declares `preferentialPolicy: "none"`, carries no
    preferential rate table for any status, and its declared order omits the two
    preferential stages. TP-04-03 pins that a gain-holding and an ordinary-only
    California household pool one supported-income measure, publish no
    preferential measure and receive the identical outcome, while the same two
    households diverge federally because the federal settlement does carve the
    gain into a preferential band. TP-04-03 fell by name when one term was
    dropped from the pooling sum and returned green under the identical command
    after an in-invocation revert; TP-04-10 refuses a pack that declares `none`
    while carrying a table.
- [x] FR-022-023 and FR-022-024 are implemented: California's own deduction is
      applied to California's own taxable income and is never derived from the
      federal deduction, and the exemption relief is declared
      `credit-against-tax` at `after-rate-application` naming the ordinary leg
      alone, with that stage ordered after both the rate stage and the leg sum —
      each proven by an adversarial mutation — and when the pack carries no amount
      for either, that stage refuses under its own named code rather than
      resolving to zero, being skipped, or borrowing a figure from elsewhere.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-04`, `report.md#tp-04-05`, `report.md#tp-04-06`, `report.md#tp-04-11`
  - **Adversarial case this row must still fail.** Move the credit to
    `before-rate-application`; convert it to `deduction-from-income`; reorder the
    pack so `CO-13` precedes `CO-6` or `CO-8`; clone the pack so a deduction
    borrows the federal single-filer figure; and — the clause this row adds —
    replace the absent-amount return in the relief stage with a zero or a skip, so
    the settlement silently prices a household as though it had claimed nothing
    rather than refusing. Each of the five must fall this row.
  - **Restated 2026-08-22 by `bubbles.plan`, and the earlier open-reason is
    withdrawn.** The previous wording required "both figures published", which
    presupposed a retrieval that cannot happen: all four filing statuses'
    `standardDeductions` are `AbsentFigure/v1`, and the single
    `ReliefMechanism/v1` carries per-status `amounts` that are each an
    `AbsentFigure/v1` naming `RLTAX-THRESHOLD-UNAVAILABLE`, so no pre-credit and
    post-credit pair can ever be shown while `BI-6` is open. That made the row
    unclosable for a reason that is not a defect in the work. What FR-022-023 and
    FR-022-024 actually require is an **application point**, not an amount, and
    the row now says so.
  - **What is already proven, and what the verifier must still check.** The
    mechanism half passes today: TP-04-05 and TP-04-06 pin the credit as
    `credit-against-tax` at `after-rate-application` with `appliesToLegs` naming
    the ordinary leg alone, place `CO-13` after both `CO-6` and `CO-8` in the
    pack's declared order, and refuse a pack that moves it before the rate or
    turns it into a deduction from income. TP-04-04 owns the never-derived clause
    and was proven able to fail by name through `scripts/red-green-probe.sh`
    against `rltaxstate.js`: no number anywhere in the pack equals any federal
    standard deduction, the settlement publishes `appliedDeduction` as a refusal
    that propagates, and a clone borrowing the federal single-filer figure is
    caught. The refusal-rather-than-zero clause is the clause this restatement
    adds, and it is a real behaviour rather than a placeholder:
    `applyReliefAfterRate` in `rltaxstate.js` returns `absentFigureRefusal` on an
    absent per-status amount, and falls through to a named
    `RLTAX-THRESHOLD-UNAVAILABLE` on a non-finite one, so neither a zero nor a
    skip is reachable. The verifier must confirm that clause has its own
    discriminating RED before closing the row.
  - **This row no longer waits on `BI-6`.** The amounts stay absent for as long as
    `BI-6` is open, and that is now the row's *expected* state rather than its
    blocker. It must still not be closed by asserting the application point alone
    while leaving the absent-amount refusal unproven.
  - **Closed, with the added clause given its own discriminating RED.** The
    mechanism half stands unchanged on TP-04-05/TP-04-06 and TP-04-04. The clause
    the restatement added is now owned by an assertion that reaches
    `applyReliefAfterRate` directly, because the shipped settlement refuses at the
    deduction long before `CO-13` and never exercises the stage. For all four
    filing statuses the shipped pack yields a refusal carrying
    `RLTAX-THRESHOLD-UNAVAILABLE`, the mechanism's own domain
    `state-relief:personal-exemption-credit` and a remediation, with **no** `value`,
    **no** `applied` list and **no** `reductionByLeg` — so neither a zero nor a
    skip is readable off it. Two controls prove the refusal is caused by the
    absence rather than by the stage: a synthetic control amount, which is not a
    California figure and is not offered as one, resolves the same stage into
    exactly one `CO-13` application against the ordinary leg alone; and a
    non-finite amount reaches the same named code by its own fall-through. Both
    failure modes the row names were probed separately through
    `scripts/red-green-probe.sh` — replacing the refusal with a `continue` (the
    skip) and with `amount = 0` (the zero). Each fell this assertion **alone** at
    `3182 passed, 1 failed`, and each same-command GREEN returned
    `3183 passed, 0 failed` after the harness reverted and hash-verified.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#the-refusal-rather-than-zero-clause-closed-in-this-session`, `report.md#tp-04-04`, `report.md#tp-04-05`, `report.md#tp-04-06`
- [x] FR-022-025 and FR-022-026 are implemented: all four filing statuses cross at
      the identical surcharge threshold and no credit reduces the surcharge, each
      proven by an adversarial mutation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-07`, `report.md#tp-04-08`, `report.md#tp-04-09`
  - **Evidence:** the threshold set declares `varyByFilingStatus: false` with the
    single `all` key, and all four statuses produce identical figures below, at
    and above it. TP-04-08 doubles the joint threshold in a clone and proves two
    households with the same taxable income then diverge; TP-04-09 proves the
    shipped `appliesToLegs[]` names the ordinary leg alone while the surcharge leg
    is declared. TP-04-07 fell by name under a value-free boolean probe and
    returned green under the identical command after an in-invocation revert.
- [x] Known-value boundary coverage exists below, at and above every California
      bracket edge the pack carries and the surcharge threshold, for every filing
      status, and each fixture names the source edition and tax year it was
      derived from.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-02`, `report.md#tp-04-07`
  - **Evidence:** no ordinary schedule resolved, so the pack carries no bracket
    edge and the row is closed by proving the covered set is closed over what the
    pack actually carries rather than by covering an absent schedule. TP-04-02
    enumerates both edge families, pins the carried set to the single surcharge
    threshold covered below, at and above for all four statuses, and resolves that
    edge to a retrieved source record naming its edition and declared year. Two
    negative controls are built in: the enumerator must find two more edges on a
    clone carrying a schedule, and the provenance pointer must resolve to nothing
    on a clone whose `sourceRef` dangles. TP-04-02 fell alone by name under a
    value-free probe that truncated the enumerator to the ordinary family and
    returned green under the identical command after an in-invocation revert.
- [x] No module file changed in this scope. Every module is byte-identical to its
      Scope 03 state, proving the contract carried California without an engine
      edit. Any edit that appeared necessary is recorded as a finding routed back
      to Scope 03 rather than applied here.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#tp-04-13`, `report.md#change-boundary`
  - **Evidence:** decided by object hash, not by a status check that a commit
    could satisfy. All five engine modules compare IDENTICAL at three points —
    the feature-family creation commit, `HEAD`, and the working tree via
    `git hash-object` — and the comparator carries a negative control: run against
    `scripts/selftest.mjs` it reports DIFFERS, so an all-IDENTICAL result is not a
    broken comparator. The history agrees: no commit since the route was created
    has touched any module, the federal pack or the Florida pack, and none is
    dirty. This scope's six commits have a one-file non-spec footprint —
    `scripts/selftest.mjs` at 24 insertions, 0 deletions, append-only and on the
    allowed-modified list. Stated plainly: Scope 03 has no distinct end commit, so
    the window used is creation-commit to working tree, which strictly contains
    the Scope 03 to Scope 04 window. No module edit was needed, so there is no
    finding to route back to Scope 03.
- [x] `unsupportedFeatures[]` is non-empty and no result is labelled a complete
      state tax.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-14`
  - **Evidence:** both clauses re-derived directly, not inherited.
    `unsupportedFeatures[]` is an array of eight entries, and the first three name
    the unretrieved figure groups themselves — rate schedule, standard deduction,
    exemption credit — so the boundary names the `BI-6` gap rather than hiding it.
    `completeStateTax` occurs at exactly three sites in `rltaxstate.js`, which is
    the whole set of returns the module has, and every one is the literal `false`;
    across the tracked tree there is no assignment of any other value. Both
    TP-04-14 assertions this scope owns pass by name, with the suite green at
    `3106 passed, 0 failed`. The prior session's recorded miss and its value-free
    boolean RED/GREEN stand unchanged above it.
- [x] No output states a probability, a lifetime figure, a track record or an
      error rate, and no California figure is presented as an estimate.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Evidence:** five detectors were run over this scope's two output paths, the
    California pack and the page that renders its notices. Each detector is proven
    live on a planted sentence before the scan is trusted and the run aborts if any
    is dead; that guard fired once, catching a lifetime-figure detector that did
    not match its own planted sentence, which was widened and re-proven. The
    probability, lifetime-figure, track-record and error-rate detectors returned
    zero hits. The single estimate hit is the pack's own statement that an
    unsupported residency pattern refuses *rather than being approximated*, and a
    classifier proven live on both an asserted and a disclaimed form reports
    asserted-estimate count zero.
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-04-01 through TP-04-22 commands · **Evidence:** `report.md#test-evidence`, `report.md#row-census-audit--every-test-plan-rows-intended-red`
  - **Closed on 2026-08-22.** This row carried two blockers. Both were tested
    rather than argued, and both fell. What each blocker was, and what closed it,
    is kept below rather than deleted, because the first blocker's conclusion was
    wrong and a row that hides its own error rate is not trustworthy.
  - **Blocker one — the browser rows. Two were retargeted; the third was
    recorded inexpressible and that record is now withdrawn.** TP-04-16 and
    TP-04-17 were retargeted on 2026-08-22 against the rendered calculation
    order, and `tests/lifetime-tax-california.spec.mjs` now carries both titles.
    TP-04-18 was recorded as unable to be expressed against the refusal path,
    with the routed instruction "do not author a TP-04-18 test; that row stays
    unwritten until `BI-6` closes". The premise of that record stands and is not
    disputed: California's settlement refuses at its unretrieved deduction before
    any leg is priced, so on the shipped pack all four filing statuses render the
    identical not-reached surcharge stage and no crossing point exists to
    observe. The conclusion drawn from it does not stand. This repository had
    already made an unreachable branch observable twice by serving a contract
    fixture at a declared pack path — `CO-7` for preferential stacking, and
    `BI-5` branch two for the sourced zero — and the same means works here. The
    row is now covered, the routed do-not-author instruction is withdrawn, and
    the full reasoning with both probes is at `report.md#tp-04-18--recorded-inexpressible-tested-and-overturned`.
    - **What is fixture and what is California.** The deduction and the ordinary
      schedule that carry the household past `CO-2` are the fixture's. They are
      invented for the contract, they are labelled as fixture values in the
      fixture's own source record and in each figure's own locator, and the test
      asserts that labelling rather than assuming it. The chassis is
      unmistakably a fixture and cannot be mistaken for a sourced California
      pack: id `contract-fixture-no-preferential`, jurisdiction `state:ZZ`,
      `ruleStatus` `user-hypothetical-law`, `publishedAt` and `retrievedAt` of
      `2999-01-01`, an `expiresAt` of `9999-12-31`, an `example.invalid` source
      url, and a retrieval note opening `This is a CONTRACT FIXTURE`.
    - **No California figure was invented, interpolated or derived.** The
      surcharge threshold set is the one California figure that was retrieved,
      and it is used with the `ca-rtc-17043` citation it already had. The test
      lifts it off the shipped pack at run time and asserts `JSON.stringify`
      equality against `CALIFORNIA.thresholdSets[setId]`, so it is the shipped
      object rather than a transcription of it — which is also what makes the row
      a pin on California rather than on the fixture, proven by a probe that
      mutates the shipped pack and reddens the row.
  - **Blocker two — the row-by-row audit, now performed.** The blocker recorded
    that no session had established that each of the twenty-two rows carries its
    own intended-RED and same-command-GREEN pair, so the universal claim this row
    makes was unsupported. That audit was performed in this session and is
    recorded row by row at `report.md#census`. Eleven rows already carried a
    pair. The remaining rows were probed through `scripts/red-green-probe.sh`,
    which verifies the mutation landed, reverts, and verifies the revert by blob
    hash against the committed object before running GREEN with the identical
    command. Every unit probe was pinned with `--summary-match` to **the row's
    own assertion text**, so each block shows that row's own line turning from
    `✓` to `✗ FAIL:` and back, rather than merely showing the suite go red — a
    mutation that reddened the suite without flipping the row under audit would
    have printed an identical compared line on both sides and would not have been
    recorded as that row's evidence.
  - **The adversarial case this row had to fail, and why it now passes honestly.**
    The stated adversarial case was a `lifetime-tax-california.spec.mjs` whose
    three tests assert nothing beyond the bare refusal — the card's code and the
    absence of a dollar figure — which would let all three commands report green
    while covering none of the three behaviours. The shipped spec file is not in
    that state, and each of the three was shown to fall on the behaviour it
    names: TP-04-16 falls when a preferential stage is rendered into the stage
    set, TP-04-17 falls when the credit stage is rendered ahead of the rate stage
    and the leg sum, and TP-04-18 falls both when the shipped threshold set is
    declared to vary by filing status and when one status resolves a different
    threshold while the stage still renders a figure. A bare refusal assertion
    survives none of those three mutations.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-04-20`, `report.md#tp-04-21`, `report.md#tp-04-22`
  - **Evidence:** all three executed at exit 0. The suite entered this session at
    `3103 passed, 0 failed` and leaves it at `3105 passed, 0 failed`; the
    append-only claim is decidable rather than asserted, with the session diff
    over `scripts/selftest.mjs` reporting 90 insertions and 0 deletions. The path
    guard reports `new=0 stale=0` and the frozen baseline and `site-exclusions.json`
    are byte-identical over the session. The guard is recorded as having caught a
    defect this session introduced — a bare test path written into the report — and
    the fix rather than the suppression is what returned it to green.
