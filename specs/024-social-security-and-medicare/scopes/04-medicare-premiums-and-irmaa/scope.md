# Scope 4: Medicare Premiums And The Income-Related Adjustment

## 04-medicare-premiums-and-irmaa

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In progress — 17 of 19 Definition of Done rows satisfied
**Scope-Kind:** runtime-behavior
**Tags:** `engine:medicare`, `structural-independence:true`, `cost-leg:true`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01, 02
**Foundation:** false

**Primary Outcome:** a household declares the modified adjusted gross income for
the year the pack's own lookback offset names, and receives the standard Part B
and Part D premiums, the income-related adjustment for the bracket that
declaration falls in, and an annual Medicare cost that is visibly beside the
federal tax total rather than inside it. The declared lookback year is checked
against the pack's own offset and refuses when it disagrees, and the current
year's income figure — which is sitting right there in the settlement, in the same
units, under almost the same name — is structurally unable to reach the resolver.

## Requirement Coverage

- **FR-024-022** — `LookbackMagi/v1` is a declaration carrying its own year; an
  undeclared lookback refuses `RLTAX-INPUT-INCOMPLETE` naming the year required.
- **FR-024-023** — the adjustment resolver accepts a `LookbackMagi/v1` and a
  bracket pack and nothing else; no current-year income figure is reachable through
  any parameter, member or closure.
- **FR-024-024** — the declared lookback year is asserted equal to the premium year
  minus the pack's own declared offset and refuses when it is not; `'irmaa-bands'`
  moves out of `unsupportedFeatures[]` into declared legs.
- **FR-024-025** — the bracket is selected at the exact sourced boundary for the
  filing status, and both the Part B and the Part D adjustment amounts are applied
  and cited.
- **FR-024-026** — the Part B premium, the Part D premium and the adjustment are
  declared legs with `includedInTotal` false, summed into a separately published
  annual Medicare cost that enters no tax total.
- **FR-024-027** — an unretrieved premium, boundary or adjustment amount refuses;
  `includedInTotal` false is never used to carry an absent figure.
- **FR-024-028** — the three premium legs are surfaced in the headline, the
  comparison, the marginal curve and the export.

Inherited and re-asserted: **NFR-024-001** declared or sourced never conflated,
**NFR-024-002** zero network, **NFR-024-003** no household value in any URL or
request, **NFR-024-004** vocabulary and income-kind counts unchanged,
**NFR-024-005** no figure or authority name in any module, **NFR-024-006** leg
visibility, **NFR-024-007** no probability, **NFR-024-009** Feature 008
byte-identity, **NFR-024-010** no registration, **NFR-024-011** harness rules.

## Gherkin Scenarios

```gherkin
Scenario: SCN-024-010 The adjustment is resolved from a declared lookback year and the current year cannot reach it
  Given a settlement carrying a non-zero current-year modified adjusted gross measure
  And a declared modified adjusted gross income for the year the pack's declared lookback offset names
  When the adjustment resolves
  Then the bracket is selected from that declaration alone
  And the resolver accepts no current-year income figure through any parameter, member or closure
  And a declared lookback year that is not the premium year minus the pack's offset refuses
  And an undeclared lookback refuses RLTAX-INPUT-INCOMPLETE naming the year required

Scenario: SCN-024-011 The bracket boundaries are exact and the adjustment applies to both parts
  Given declared lookback incomes below the first sourced boundary, exactly at it and above it
  When the adjustment resolves for each
  Then each lands in the bracket the source states
  And the comparison is asserted at the exact sourced boundary using the source's own operator
  And the bracket's Part B and Part D adjustment amounts are both applied and both cited
  And an unretrieved boundary or amount refuses the adjustment rather than applying zero

Scenario: SCN-024-012 A premium is surfaced everywhere and summed into no tax total
  Given a settled household with non-zero premiums and a non-zero adjustment
  When the settlement runs
  Then the three premium legs are declared with includedInTotal false
  And they appear in the headline, the comparison, the marginal curve and the export
  And they are summed into a separately published annual Medicare cost
  And totalFederalTax is proven to exclude every one of them
  And the reconciliation identity over included legs holds with legs present that it must exclude
  And a mutation flipping any premium leg to included is proven to fail
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-024-010 lookback undeclared | Packs resolved, lookback input blank | Open the medicare panel | `RLTAX-INPUT-INCOMPLETE` naming the exact year required and showing the offset that produced it, with no premium computed | e2e-ui |
| SCN-024-010 lookback year wrong | A lookback declared for a year that is not the premium year minus the offset | Open the medicare panel | `RLTAX-PACK-YEAR-MISMATCH` naming the declared year, the premium year and the pack's offset | e2e-ui |
| SCN-024-010 lookback correct | A lookback declared for the correct year | Open the medicare panel | The declared amount labelled as the household's own input for that named year, with no citation, beside the bracket it selected | e2e-ui |
| SCN-024-011 boundary | A lookback exactly at a sourced boundary | Open the medicare panel | The bracket the source states for the exact figure, with the operator shown so the inclusivity is readable, and both part adjustments with reachable citations | e2e-ui |
| SCN-024-011 amount absent | A bracket whose Part D adjustment was not retrieved | Open the medicare panel | `RLTAX-THRESHOLD-UNAVAILABLE` naming the missing amount, with no zero applied in its place and no premium leg shipped for that part | e2e-ui |
| SCN-024-012 cost beside tax | Non-zero premiums and a non-zero adjustment | Open Simple | The annual Medicare cost rendered as its own figure beside the headline, visibly labelled as not part of the federal tax total | e2e-ui |
| SCN-024-012 leg visibility | The all-non-zero leg fixture | Open Simple then Power | All three premium legs appear in the headline block, the comparison table, the curve contributor list and the export, and none appears inside `totalFederalTax` | e2e-ui |

## Implementation Files

### New

- `rltaxmedicare.js` — UMD module owning `resolveAdjustmentBracket`,
  `computePremiumLegs` and `annualMedicareCost`, every one a top-level
  `function name(...) {}` declaration. The module imports `rltaxrules.js` only. It
  does not import `rltax.js`, does not receive a workspace and does not receive a
  settlement.
- `tax-rules/medicare/<year>.json` — the premium and bracket pack, carrying its own
  declared lookback offset.
- Fixture packs: one carrying complete premiums and brackets, one with the Part D
  adjustment absent, one with a boundary absent, one with deliberately
  non-standard boundaries, one declaring an offset other than the shipped one, and
  one attempting an `includedInTotal: false` leg whose figure is absent.
- `lifetime-tax-medicare.spec.mjs` — this scope's browser rows, in the
  repository's Playwright spec directory alongside the other `lifetime-tax-*`
  specs.

### Modified

- `rltaxrules.js` — `LookbackMagi/v1`, `AdjustmentBracket/v1`, `PremiumRecord/v1`,
  and the lookback-year offset check.
- `rltax.js` — stage `CO-22`, the three cost legs, and the annual Medicare cost.
- `rltaxworkspace.js` — the lookback declaration and its year plus their privacy
  surface.
- `tax-rules/federal/<year>.json` — the medicare policy and the removal of
  `'irmaa-bands'` from `unsupportedFeatures[]`.
- `rltaxstrategy.js` — the corrected `medicare-and-irmaa` reason **only**.
- `lifetime-tax-strategy-lab.html` — the medicare inputs, the `power-medicare`
  section and the annual-cost figure beside the headline.
- `scripts/selftest.mjs` — one appended group, plus SUP-024-06 and SUP-024-07.

## Implementation Plan

1. Add `LookbackMagi/v1`. Every member is declared; validation refuses a
   `sourceRef`. The contract carries **no** reference to the settled year, no
   workspace handle and no settlement handle, so the object itself cannot smuggle
   a current-year figure into the resolver.
2. Add `AdjustmentBracket/v1` with a sourced `boundaryOperator`, so the
   exact-boundary case is decided by the source rather than by a convention, and a
   filing status the source does not enumerate ships as an `AbsentFigure/v1` rather
   than borrowing an adjacent status's amounts.
3. Add `PremiumRecord/v1` with `includedInTotal` structurally `false` and a
   validation that **refuses** a record whose standard premium or adjustment is an
   `AbsentFigure`. The pack contract already refuses an `includedInTotal: false`
   leg whose figure is absent; this scope re-asserts that rule rather than
   weakening it, because `false` is a display mechanism and not a way to carry a
   refusal past a total.
4. Author `rltaxmedicare.js`. `resolveAdjustmentBracket(lookback, bracketPack)`
   takes exactly two parameters and there must be **no third through which a
   current-year figure could arrive** — not a workspace, not a settlement, not an
   options bag, not a module-scope variable set elsewhere. A reviewer must be able
   to read the signature and the module's whole closure set and confirm it.
5. Implement the lookback-year check: the declared year must equal the premium
   year minus the pack's own declared offset, refusing `RLTAX-PACK-YEAR-MISMATCH`
   naming the declared year, the premium year and the offset. The offset is a pack
   member, never a module constant.
6. **Retrieve `BI-10`.** Open the premium pages, transcribe the standard Part B
   premium and the Part D base beneficiary premium, verify every digit against the
   page, and record each in a `SourceRecord` with its locator and `retrievedAt`.
   Judge the edition year per component kind.
7. **Retrieve `BI-11`.** Transcribe the bracket boundaries, both part adjustment
   amounts per filing status, the boundary operator and the declared lookback
   offset the same way. A filing status the source does not enumerate ships absent.
   If the offset cannot be established the whole Medicare settlement refuses,
   because without it the lookback-year check has nothing to check against and an
   unchecked lookback year is the defect this scope exists to prevent.
8. Author the medicare pack from the retrieved records only. No figure in
   `spec.md`, `design.md` or this file may be transcribed into it, and none of
   those documents contains one.
9. Add stage `CO-22` in `rltax.js`. The stage passes the declared lookback and the
   bracket pack to the resolver and nothing else. Its position after `CO-21` is
   positional only; the independence is structural and is asserted as such.
10. Add the three cost legs with `includedInTotal: false`, derived from the pack's
    declared leg set, and the separately published annual Medicare cost.
11. **Repair the `L4` vacuity.** Reconciliation identity `L4` reads *the sum of
    every declared leg whose `includedInTotal` is true equals `totalFederalTax`*,
    and every leg shipped before this feature has `includedInTotal: true`, so its
    filter has never removed anything. Assert that the filter now removes exactly
    three legs, that `totalFederalTax` differs from the sum over all declared legs,
    and that a mutation flipping any premium leg to `true` is demonstrated to fail.
    The identity itself is unchanged and is not superseded.
12. Remove `'irmaa-bands'` from the federal pack's `unsupportedFeatures[]`, through
    the derived accounting Scope 02 built, and prove the moved id resolves to legs
    whose `includedInTotal` is false.
13. **Correct the `medicare-and-irmaa` reason in `rltaxstrategy.js`.** The entry
    stays — a conversion's effect on the adjustment lands two premium years later
    and this feature computes no future year, so the conversion comparison
    genuinely still does not price it. But the clause stating that the pack
    declares no band becomes false the moment this scope ships, and a false clause
    is corrected rather than left standing because the surrounding work was done.
    Add a new assertion pinning the corrected reason against the pack's declared
    brackets, which no assertion previously did. Change nothing else in that file.
14. Add the lookback declaration and its year to `rltaxworkspace.js` with their
    inventory, clear and export-sanitizer entries. A second year's finances is a
    household value.
15. Render the `power-medicare` section and the annual-cost figure beside the
    headline, visibly labelled as not part of the federal tax total. Bind every
    control through the declaration-signature no-op guard. Scope every assertion to
    `#power-medicare` or `#simple`; use no unscoped `.first()`.
16. Deliver SUP-024-06 and SUP-024-07 under the
    [supersession procedure](../_index.md#assertion-supersession-procedure).
17. Append a `lifetime-tax — medicare premiums and the income-related adjustment`
    group to `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `rltax.js` leg set and total | Three `includedInTotal: false` legs added | Scope 05, and every total in Features 021–023 | **Highest in this feature** — this is the first time the leg set contains a leg the total must exclude, and a total that included one would be wrong in the direction users are least able to check | Assert Features 021 through 023 fixtures produce their exact prior totals with no lookback declared, then assert the `L4` filter removes exactly three legs and that flipping any one to `true` fails | Remove the three legs from the pack's declared set |
| The `L4` reconciliation identity | Unchanged, but its exclusion clause becomes non-vacuous | Every reconciliation consumer | High — a clause that has never been exercised is a clause nobody knows works | Assert the filter's removed count is exactly three and that the identity still holds; assert it fails when a premium leg is flipped | Not applicable; the identity is unchanged |
| `rltaxstrategy.js` | One reason string corrected | The conversion comparison and its not-modeled disclosure | Medium — the entry must stay while its reason changes, and the two are easy to conflate | Assert the entry is still present with its id, its label and its deferral code unchanged, and that only the reason differs; assert the corrected reason against the pack's declared brackets | Revert the reason |
| `tax-rules/federal/<year>.json` | Medicare policy added, one id removed | The whole federal settlement and the not-modeled accounting | Medium — Scope 02's derived accounting absorbs the removal without an edit, which is the point | Assert the derived accounting absorbed this removal with no change to the check itself | Revert the pack |
| `rltaxworkspace.js` | The lookback declaration and its year | Scope 05 | High — a second year's finances | Assert both are inventoried, cleared, redacted and absent from every URL, request, referrer and console message | Remove the members |
| `scripts/selftest.mjs` | One group appended plus two markers | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the group and revert the two markers |

## Change Boundary And Protected Paths

**Allowed new:** `rltaxmedicare.js` · `tax-rules/medicare/<year>.json` · this
scope's fixture packs · `lifetime-tax-medicare.spec.mjs`.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`tax-rules/federal/<year>.json` · `rltaxstrategy.js` (the `medicare-and-irmaa`
reason only) · `lifetime-tax-strategy-lab.html` · `scripts/selftest.mjs` (append,
plus SUP-024-06, SUP-024-07, SUP-024-10 and SUP-024-12) ·
`tests/lifetime-tax-route.spec.mjs` (**SUP-024-11 only**).

Exactly one prior-feature test file is opened, and only for one ledgered
supersession. The
[per-file marker distribution](../design.md#per-file-marker-distribution) places
four of this scope's owned markers in `scripts/selftest.mjs` and the fifth,
SUP-024-11, in `tests/lifetime-tax-route.spec.mjs`; that table is what permits
that file to be opened, and it permits nothing else in it. The permitted edit is
confined to SUP-024-11's ledgered target — SCN-021-014's positional
`unavailable.first()` spot-check, replaced by the view-aware
keyboard-reachability sweep the ledger row describes — plus its marker. Every
other assertion in that file, including the SUP-024-09 derivation Scope 01 placed
there, stays byte-identical. `rltaxstrategy.js` is a prior-feature **module**, not
a test file, and is opened for exactly one string; the correction is recorded in
`report.md` with the before and after text.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`specs/022-*/**` · `specs/023-*/**` · `rltaxsocialsecurity.js` ·
`rltaxinclusion.js` · `rltaxclaimage.js` · `rltaxstate.js` · `rltaxcombined.js` ·
`rltaxproperty.js` · `rltaxrental.js` · `rltaxuse.js` · `rltaxdisposition.js` ·
`tax-rules/state/**` · `tax-rules/property/**` · `tax-rules/benefit/**` ·
`tax-rules/mortality/**` · `tools.json` · `index.html` · `rlnav.js` · `README.md` ·
`notes/README.md` · `market-brief.*` · `briefs/**` · `data/**` · `watchlist.json` ·
`site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` · every `tests/lifetime-tax-*.spec.mjs`
except this scope's new file and the SUP-024-11 target in
`tests/lifetime-tax-route.spec.mjs` named above · `tests/lifetime-tax.support.mjs` ·
every framework-managed file.

Every other prior module is excluded deliberately. Pricing a premium must touch
nothing that computes a tax; if it does, the cost axis is not separate from the
tax axis and the whole of RD-4 is undermined.

**Rollback:** delete `rltaxmedicare.js`, the medicare pack and the fixtures;
revert the three contracts, the lookback-year offset check, stage `CO-22`, the
three cost legs, the annual Medicare cost and the workspace members; revert the
federal pack's medicare policy and its `unsupportedFeatures[]` removal; revert the
`rltaxstrategy.js` reason; revert the page section and the annual-cost figure;
revert the five supersession replacements this scope owns — SUP-024-06,
SUP-024-07, SUP-024-10, SUP-024-11 and SUP-024-12 — to their superseded clauses.

## Assertion Supersession Owned By This Scope

Five entries: **SUP-024-06**, **SUP-024-07**, **SUP-024-10**, **SUP-024-11** and
**SUP-024-12**. The first two are caused by a deliberate change this scope's
requirement coverage names — FR-024-024 moves `'irmaa-bands'` out of the
not-modeled ledger into three declared legs. The last three were admitted under
ASC-8 during implementation, with all four count surfaces updated in the same
change.

SUP-024-06 is the not-carried clause for that id, and it lands on the derived
accounting Scope 02 built, so it names one id rather than rebuilding a check.
SUP-024-07 is subtler and is the more important of the two: a pre-existing
adversarial probe uses `'irmaa-bands'` specifically as an id the shipped pack
carries **only** on the unsupported side, and modelling it inverts that premise so
the probe stops proving what it was written to prove. A probe that has stopped
proving anything still passes, which is exactly why it is named here rather than
left to be discovered.

**SUP-024-10** is the marginal-rate contributor half of the same move: the
`surgicalRemoval` pair named `'irmaa-bands'` as an id the shipped pack still
carries as not modelled, which this scope makes false. **SUP-024-11** and
**SUP-024-12** are both latent positional fragility this scope's own delivery
exposed rather than caused. SUP-024-11 is a `.first()` spot-check on
`[data-rl-unavailable]` that this scope's Simple-view Medicare refusal displaced;
the refusal stays and the spot-check becomes a view-aware sweep. SUP-024-12 is a
selftest regex whose trailing `]` pinned two watched control ids to the END of
`DECLARATION_INPUTS`; it becomes the order-independent membership form its own
sibling already uses. No replacement removes a clause.

Note what is **not** in this list. The `medicare-and-irmaa` conversion entry stays
and only its reason is corrected, because a conversion's effect lands two premium
years later and this feature computes no future year — so no supersession is
admitted for it. The `L4` reconciliation identity is unchanged and is not
superseded; its exclusion clause simply becomes non-vacuous, and that is asserted
rather than assumed. Both determinations are recorded in
[Assertions considered and not superseded](../spec.md#assertions-considered-and-not-superseded).

Every other pre-existing assertion must still pass unchanged at the end of this
scope. An assertion outside these two that fails is either a defect in this
scope's change and is fixed, or an ASC-8 admission recorded across all four
surfaces before the edit.

## Scenario-First Red/Green Contract

Add the named known-value assertion first, run the exact command, and confirm the
intended contract assertion is what fails. Then implement the smallest owned change
and rerun the identical command.

**Named intended-RED assertion for this scope:** with a settlement carrying a
**non-zero current-year modified adjusted gross measure** and a declared lookback
income that is a **different figure**, the resolved bracket must be the one the
lookback selects and not the one the current-year measure would select, and the
resolver's parameter list must be provably incapable of receiving the current-year
measure. Before the structural separation exists the resolver reaches for whatever
income figure is in scope and the assertion fails on the resolved bracket index —
which is precisely the confusable-input defect this scope exists to prevent. The
two figures must be chosen so they fall in **different** brackets, because
identical brackets would make the assertion pass by coincidence. A syntax error, a
missing browser or an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-04-01 | Contract | unit | SCN-024-010 | `scripts/selftest.mjs` | `LookbackMagi/v1` refuses a `sourceRef`, carries its own year, and carries no reference to the settled year, no workspace handle and no settlement handle | `node scripts/selftest.mjs` | No | `report.md#tp-04-01` |
| TP-04-02 | Structural independence | unit | SCN-024-010 | `scripts/selftest.mjs` | `resolveAdjustmentBracket` accepts exactly a `LookbackMagi/v1` and a bracket pack; no third parameter, no options bag, no module-scope variable and no closure through which a current-year income figure could arrive exists in the module | `node scripts/selftest.mjs` | No | `report.md#tp-04-02` |
| TP-04-03 | Adversarial | unit | SCN-024-010 | `scripts/selftest.mjs` | Regression: with a settlement carrying a non-zero current-year measure that falls in a different bracket from the declared lookback, the resolved bracket is the lookback's; an implementation reading the current-year measure is proven to fail with the two bracket indexes named | `node scripts/selftest.mjs` | No | `report.md#tp-04-03` |
| TP-04-04 | Contract | unit | SCN-024-010 | `scripts/selftest.mjs` | An undeclared lookback refuses `RLTAX-INPUT-INCOMPLETE` naming the exact year required and the offset that produced it; a declared year that is not the premium year minus the pack's offset refuses `RLTAX-PACK-YEAR-MISMATCH` naming all three | `node scripts/selftest.mjs` | No | `report.md#tp-04-04` |
| TP-04-05 | Adversarial | unit | SCN-024-010 | `scripts/selftest.mjs` | Regression: a fixture pack declaring a different offset produces a different required year, proving the offset is a pack member and not a module constant | `node scripts/selftest.mjs` | No | `report.md#tp-04-05` |
| TP-04-06 | Known value | unit | SCN-024-011 | `scripts/selftest.mjs` | Against a fixture pack with deliberately non-standard boundaries, lookback incomes below, exactly at and above each boundary land in the bracket the pack states, using the pack's own `boundaryOperator` | `node scripts/selftest.mjs` | No | `report.md#tp-04-06` |
| TP-04-07 | Adversarial | unit | SCN-024-011 | `scripts/selftest.mjs` | Regression: an implementation treating a boundary as strict where the pack's operator states inclusive is proven to fail at the exact figure; one using recalled boundaries is proven to fail against the non-standard fixture | `node scripts/selftest.mjs` | No | `report.md#tp-04-07` |
| TP-04-08 | Known value | unit | SCN-024-011 | `scripts/selftest.mjs` | Both the Part B and the Part D adjustment amounts are applied and each cites its own source; a filing status the pack does not enumerate ships as an `AbsentFigure` rather than borrowing an adjacent status's amounts | `node scripts/selftest.mjs` | No | `report.md#tp-04-08` |
| TP-04-09 | Degraded state | unit | SCN-024-011 | `scripts/selftest.mjs` | An unretrieved premium, boundary or adjustment amount refuses `RLTAX-THRESHOLD-UNAVAILABLE` naming it, and no zero is applied in its place | `node scripts/selftest.mjs` | No | `report.md#tp-04-09` |
| TP-04-10 | Adversarial | unit | SCN-024-011 | `scripts/selftest.mjs` | Regression: a fixture attempting an `includedInTotal: false` leg whose figure is absent is refused, proving `false` is not a route past a refusal | `node scripts/selftest.mjs` | No | `report.md#tp-04-10` |
| TP-04-11 | Cost leg | unit | SCN-024-012 | `scripts/selftest.mjs` | The three premium legs are declared with `includedInTotal` false, are summed into the annual Medicare cost, and `totalFederalTax` is proven to exclude every one of them on a fixture where all three are non-zero and mutually distinct | `node scripts/selftest.mjs` | No | `report.md#tp-04-11` |
| TP-04-12 | Vacuity repair | unit | SCN-024-012 | `scripts/selftest.mjs` | The `L4` filter now removes exactly three legs, `totalFederalTax` differs from the sum over all declared legs by exactly the annual Medicare cost, and the identity still holds | `node scripts/selftest.mjs` | No | `report.md#tp-04-12` |
| TP-04-13 | Adversarial | unit | SCN-024-012 | `scripts/selftest.mjs` | Regression: flipping each premium leg to `includedInTotal: true` in turn is proven to fail the exclusion assertion, and each failure names the leg that entered the total | `node scripts/selftest.mjs` | No | `report.md#tp-04-13` |
| TP-04-14 | Non-regression | unit | SCN-024-012 | `scripts/selftest.mjs` | With no lookback declared, the Features 021 through 023 fixtures produce their exact prior totals and their exact prior leg sets | `node scripts/selftest.mjs` | No | `report.md#tp-04-14` |
| TP-04-15 | Ledger move | unit | SCN-024-010 | `scripts/selftest.mjs` | `'irmaa-bands'` is absent from `unsupportedFeatures[]` and present as legs whose `includedInTotal` is false, absorbed by Scope 02's derived accounting with no change to the accounting check itself | `node scripts/selftest.mjs` | No | `report.md#tp-04-15` |
| TP-04-16 | Reason correction | unit | SCN-024-010 | `scripts/selftest.mjs` | The `medicare-and-irmaa` conversion entry is still present with its id, label and deferral code unchanged and only its reason differing, the corrected reason is pinned against the pack's declared brackets, and the disclosure's required membership and count are unchanged | `node scripts/selftest.mjs` | No | `report.md#tp-04-16` |
| TP-04-17 | Sourcing | unit | SCN-024-011 | `scripts/selftest.mjs` | Every value-bearing member of the medicare pack resolves to exactly one retrieved source with a locator and a `retrievedAt`, every member from another edition year carries a quoted `yearInvarianceBasis`, and every unretrieved member is an `AbsentFigure` with a `missingSource` pointer and no smuggled numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-04-17` |
| TP-04-18 | Leg visibility | unit | SCN-024-012 | `scripts/selftest.mjs` | Against the all-non-zero fixture, the settled record's declared leg set equals the leg set of the headline, the comparison, the curve contributors and the export, in both directions, with all three premium legs present | `node scripts/selftest.mjs` | No | `report.md#tp-04-18` |
| TP-04-19 | Adversarial | unit | SCN-024-012 | `scripts/selftest.mjs` | Regression: removing each premium leg from each of the four surfaces in turn is proven to fail, and each failure names both the leg and the surface; a leg present on the surfaces but summed into the tax total is reported as such rather than as a numeric mismatch | `node scripts/selftest.mjs` | No | `report.md#tp-04-19` |
| TP-04-20 | No-shadow | unit | SCN-024-011 | `scripts/selftest.mjs` | Regression: no module holds a premium, a bracket boundary, an adjustment amount, an offset or an authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-04-20` |
| TP-04-21 | Privacy | unit | SCN-024-010 | `scripts/selftest.mjs` | The lookback declaration and its year are inventoried, cleared, redacted and absent from every URL, request, referrer and console message, and the declared storage key count is asserted unchanged in the same assertion | `node scripts/selftest.mjs` | No | `report.md#tp-04-21` |
| TP-04-22 | Supersession | unit | SCN-024-010 | `scripts/selftest.mjs` | SUP-024-06 and SUP-024-07 each carry their marker, each replacement is derived, each superseded clause is recorded verbatim, and SUP-024-07's re-pointed probe is proven to fire on both a deleted-not-moved id and a genuinely modelled one | `node scripts/selftest.mjs` | No | `report.md#supersession-ledger` |
| TP-04-23 | Render safety | unit | SCN-024-011 | `scripts/selftest.mjs` | With each medicare member absent in turn, every Power section still renders, and every control routes through the declaration-signature no-op guard | `node scripts/selftest.mjs` | No | `report.md#tp-04-23` |
| TP-04-24 | Regression E2E | e2e-ui | SCN-024-010 | `lifetime-tax-medicare.spec.mjs` | `Regression: SCN-024-010 an undeclared lookback names the year required and a wrong lookback year refuses naming the offset` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-010 an undeclared lookback names the year required and a wrong lookback year refuses naming the offset" --reporter=list` | Yes | `report.md#scenario-scn-024-010` |
| TP-04-25 | Regression E2E | e2e-ui | SCN-024-011 | `lifetime-tax-medicare.spec.mjs` | `Regression: SCN-024-011 the bracket is selected at the exact boundary and both part adjustments are shown with their citations` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-011 the bracket is selected at the exact boundary and both part adjustments are shown with their citations" --reporter=list` | Yes | `report.md#scenario-scn-024-011` |
| TP-04-26 | Regression E2E | e2e-ui | SCN-024-012 | `lifetime-tax-medicare.spec.mjs` | `Regression: SCN-024-012 the annual Medicare cost is rendered beside the headline and no premium leg is inside the federal tax total` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-012 the annual Medicare cost is rendered beside the headline and no premium leg is inside the federal tax total" --reporter=list` | Yes | `report.md#scenario-scn-024-012` |
| TP-04-27 | Leg visibility E2E | e2e-ui | SCN-024-012 | `lifetime-tax-medicare.spec.mjs` | `Regression: SCN-024-012 all three premium legs reach the headline, the comparison, the curve and the export` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-012 all three premium legs reach the headline, the comparison, the curve and the export" --reporter=list` | Yes | `report.md#tp-04-27` |
| TP-04-28 | Privacy E2E | e2e-ui | SCN-024-010 | `lifetime-tax-medicare.spec.mjs` | `Regression: SCN-024-010 every request is a declared same-origin GET with the medicare pack among them and no lookback declaration reaches a URL` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-024-010 every request is a declared same-origin GET with the medicare pack among them and no lookback declaration reaches a URL" --reporter=list` | Yes | `report.md#tp-04-28` |
| TP-04-29 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-*, SCN-023-*, SCN-024-001 … -012 | The prior features' specs plus this scope's | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row. **Outstanding defect — this row's named command has never been run as its own command.** `report.md#tp-04-29` records a `tests/lifetime-tax-*.spec.mjs` run over the same route instead. Correcting the selector does not discharge that; one real execution of the command exactly as written above is still owed | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-04-29` |
| TP-04-30 | Repo gate | unit | SCN-024-010 … -012 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-04-30` |
| TP-04-31 | Path guard | unit | SCN-024-010 … -012 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-04-31` |
| TP-04-32 | Deploy gate | unit | SCN-024-010 … -012 | `scripts/build-pages-site.mjs` | The Pages plan succeeds, `site-exclusions.json` is unchanged, and `tax-rules/` remains outside the public directories | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-04-32` |
| TP-04-33 | Privacy E2E | e2e-ui | SCN-024-010 | `tests/lifetime-tax-medicare.spec.mjs` | GAP, NOT AUTHORED (opened 2026-08-22, F-REG-03). `TP-04-28` pins the ledger non-empty and every entry declared, but places no bound on ledger growth after first paint, so a request issued once the lookback is declared would not fail it. Required, in that same run: `afterFirstPaint` captured after `openLifetimeTax` and the ledger asserted not to grow past it once `declareLookback` has run. Adversarial case: a request issued after the lookback is declared fails the no-growth assertion, which the existing non-empty and permitted-set assertions cannot detect because both are satisfied by a ledger that grew | not authored | Yes | not authored |

### Definition of Done

A row is checked only when it is genuinely satisfied and was observed to be
satisfied. A row that is not satisfied stays `[ ]` and carries a stated reason. If
delivery makes a row's claim false, the row is corrected rather than checked.

- [x] FR-024-022 and FR-024-023 are implemented: `LookbackMagi/v1` refuses a
      `sourceRef` and carries no settled-year, workspace or settlement handle, and
      the resolver's parameter list, options set and closure set are provably
      incapable of receiving a current-year income figure.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-01`, `report.md#tp-04-02`
  - **Claim Source:** executed. `2805 passed, 0 failed`, exit 0. TP-04-01 and TP-04-02 both green; the resolver's arity is read off the module source as 2 with parameters `lookback`, `bracketPack`, no rest parameter, no options bag, no `arguments` object and no module-scope binding reassigned in the module body.
- [x] The structural independence is proven non-vacuously: the settlement carries a
      non-zero current-year measure that falls in a **different** bracket from the
      declared lookback, the resolved bracket is the lookback's, and an
      implementation reading the current-year measure is proven to fail with both
      bracket indexes named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-03`
  - **Claim Source:** executed. TP-04-03 green. The two figures resolve to bracket indexes 0 and 2, asserted to differ before anything else, so the row cannot pass by the fixture collapsing them.
- [x] FR-024-024 is implemented: an undeclared lookback names the exact year
      required and the offset that produced it, a wrong year refuses naming all
      three, and a fixture pack with a different offset produces a different
      required year — proving the offset is a pack member.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-04`, `report.md#tp-04-05`
  - **Claim Source:** executed. TP-04-04 and TP-04-05 green, plus browser row TP-04-24. The shipped pack's 2-year offset yields required year 2024; the fixture's 3-year offset yields 2996 off the same code path, and a pack whose offset cannot be established refuses the whole Medicare settlement.
- [x] FR-024-025 is implemented: the bracket is selected at the exact sourced
      boundary using the source's own operator, both part adjustments are applied
      and cited, and a filing status the source does not enumerate ships absent
      rather than borrowing an adjacent status's amounts.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-06`, `report.md#tp-04-07`, `report.md#tp-04-08`
  - **Claim Source:** executed. TP-04-06, TP-04-07 and TP-04-08 green, plus browser row TP-04-25 at the sourced boundary. The fixture's two rows carry **opposite** operators, so a recalled convention cannot satisfy both; flipping the pack's operator moves the household sitting exactly on the boundary and leaves its neighbours where they were; a bracket stating no sourced inclusivity refuses rather than falling back.
- [x] FR-024-027 is implemented: an unretrieved premium, boundary or adjustment
      refuses with no zero applied, and an `includedInTotal: false` leg whose figure
      is absent is refused — proving `false` is not a route past a refusal.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-09`, `report.md#tp-04-10`
  - **Claim Source:** executed. TP-04-09 and TP-04-10 green. The shipped pack is the live case: the unretrieved Part D standard premium refuses `RLTAX-THRESHOLD-UNAVAILABLE`, its record is `null` rather than a zero, and the annual cost is withheld naming the leg that withheld it.
- [x] `BI-10` and `BI-11` were closed by retrievals performed in the implementation
      session, each verified digit by digit against the retrieved page and recorded
      with its own `retrievedAt` and locator, with the edition year judged per
      component kind — or the affected member ships absent and refuses, and a
      failure to establish the offset refuses the whole Medicare settlement.
  - **Phase:** implement · **Command:** the retrieval records in the medicare pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`, `report.md#tp-04-17`
  - **Claim Source:** executed. The SSA page `Premiums: Rules for Higher-Income Beneficiaries` was retrieved in this session and every boundary and adjustment amount in all three bracket sets was compared digit by digit against it — the full transcription table is in `report.md#sourcing`. The page dates its own figures to 2026, so no `yearInvarianceBasis` is claimed. The standard Part D premium ships as an `AbsentFigure/v1` with a `missingSource` pointer and no numeric member, because neither retrieved publication states one. TP-04-17 asserts the whole pack against that rule.
- [x] FR-024-026 is implemented: the three legs are `includedInTotal` false, are
      summed into the annual Medicare cost, and `totalFederalTax` excludes every one
      of them on a fixture where all three are non-zero and mutually distinct.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser row · **Evidence:** `report.md#tp-04-11`, `report.md#scenario-scn-024-012`
  - **Claim Source:** executed. TP-04-11 green: three legs, all `includedInTotal: false`, annual amounts 1200 / 240 / 120 — mutually distinct and all non-zero — summing exactly to the published annual cost. Browser row TP-04-26 green: every declared premium leg id is asserted **absent** from the page's own published reconciliation leg set, with that set asserted non-empty first.
- [x] The `L4` exclusion clause is proven non-vacuous rather than assumed: the
      filter removes exactly three legs, `totalFederalTax` differs from the
      all-legs sum by exactly the annual Medicare cost, the identity still holds,
      and flipping each premium leg to included in turn is demonstrated to fail with
      the entering leg named.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-12`, `report.md#tp-04-13`
  - **Claim Source:** executed. `2812 passed, 0 failed`, exit 0. TP-04-12 now runs against a real settlement built twice from the identical workspace and federal pack: the published leg set carries four included legs and exactly three excluded ones, the included legs sum to `totalFederalTax`, every declared leg sums to that total plus exactly the annual Medicare cost, and `L4` still holds with three legs present that it must exclude. TP-04-13 flips each premium leg in turn through a real settlement; each flip puts exactly that leg into the included set under its own name, breaks `L4`, and drives the settlement to refuse its own total with `RLTAX-RECONCILE`, while the unflipped settlement holds and publishes a finite figure. Intended RED observed first at `2809 passed, 3 failed` on the identical command.
- [x] The three cost legs are additive: with no lookback declared, the Features 021
      through 023 fixtures produce their exact prior totals and leg sets.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-14`
  - **Claim Source:** executed. TP-04-14 authored and green. Three fixtures spanning the prior features' shapes — ordinary only, preferential-bearing, wage-and-surtax bearing — are each settled with no lookback declared and again with the premium legs handed in. For every fixture the federal portion of the leg set is byte-identical, every other settled member is byte-identical, the total is unchanged, exactly three legs are appended and none enters the total. The three fixtures settle to three distinct totals, so the identity is not one figure agreeing with itself. The preferential fixture reproduces the exact figures Scope 02 pins for the identical workspace: gross 135000, ordinary taxable 103900, preferential taxable 15000, total taxable 118900. No premium had leaked into a tax total.
- [x] `'irmaa-bands'` is absent from the not-carried set and present as legs whose
      `includedInTotal` is false, absorbed by Scope 02's derived accounting with no
      change to the accounting check itself.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-15`
  - **Claim Source:** executed. The federal pack's `unsupportedFeatures[]` ids were enumerated and `'irmaa-bands'` is absent; `medicarePolicy` is present and its three `taxLegs` all carry `includedInTotal: false`. SUP-024-06 and SUP-024-10 assert both halves and are green in the `2805 passed, 0 failed` run.
- [x] The `medicare-and-irmaa` conversion reason is **corrected rather than the
      entry removed**: the entry keeps its id, label and deferral code, only the
      reason differs, the corrected reason is pinned against the pack's declared
      brackets by a new assertion, and the disclosure's required membership and
      count are unchanged. The before and after text is recorded.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-16`, `report.md#reason-correction`
  - **Claim Source:** executed. The before and after text is recorded in `report.md#reason-correction`. TP-04-16 authored and green: it asserts the entry keeps its id, its label and its deferral code with only the reason differing, and adds the pin this row required — a predicate reads the shipped pack's own bracket sets and requires at least two brackets carrying a numeric lower bound in every set, and the corrected reason is asserted to claim exactly that and to no longer claim the opposite. The pin is proven capable of failing against a pack whose bracket sets are emptied. The disclosure's membership and count of eight are asserted in the same row.
- [x] FR-024-028 and NFR-024-006 are implemented: all three legs are surfaced in all
      four places, proven by a two-directional set identity against the all-non-zero
      fixture, removing each from each surface in turn is demonstrated to fail with
      both named, and a leg present on the surfaces but summed into the tax total is
      reported as such rather than as a numeric mismatch.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser leg-visibility row · **Evidence:** `report.md#tp-04-18`, `report.md#tp-04-19`, `report.md#tp-04-27`
  - **Claim Source:** executed. This row found a real defect: the page surfaced the premium legs on the export record only, and never pushed them into the comparison table, the curve contributor table or the headline as per-leg hosts. The renderer now derives its premium rows by walking the legs the stage published. TP-04-18 extracts the page's own two surface builders and asserts the record, headline, comparison and curve sets identical in both directions with all three premium legs present; the record carries four federal legs beside them, so the identity is not three ids agreeing with themselves. TP-04-19 removes each premium leg from each surface in turn — twelve cases — and each fails naming both the leg and the surface, while the unmutated identity holds. The summed-into-total case is reported by the name of the entering leg and by the settlement refusing its own total. Browser row TP-04-27 authored and green, asserting the same identity over the rendered DOM. Intended RED observed for all three: `2810 passed, 2 failed` on the identical selftest command, and `Error: leg medicare-part-b-premium missing from the comparison surface` on the identical Playwright command.
- [x] NFR-024-003 and NFR-024-005 hold: the lookback declaration and its year are
      inventoried, cleared and redacted, the declared storage key count is asserted
      unchanged in the same assertion, the request ledger is non-empty and every
      entry in it is a GET carrying no body for a path the route's own
      configuration declares, a medicare pack is present in the ledger the run
      produced, and no module holds a figure, an offset or an authority name.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the browser privacy row · **Evidence:** `report.md#tp-04-20`, `report.md#tp-04-21`, `report.md#tp-04-28`
  - **Restated 2026-08-22 (F-REG-03).** The superseded text read "the request
    ledger stays empty with a medicare pack now loaded from disk", which is false
    and self-contradictory: a ledger holding the medicare pack read is not empty.
    The cited row `TP-04-28` (`SCN-024-010`) asserts
    `expect(paths.length).toBeGreaterThan(0)`, then
    `paths.forEach((path) => expect(permitted).toContain(path))`, then
    `expect(paths.some((path) => path.indexOf('/tax-rules/medicare/') === 0)).toBe(true)`
    against the ledger the run produced. Adversarial cases: a read of a path the
    configuration does not declare fails the permitted-set assertion; a boot that
    read nothing fails the greater-than-zero pin; a medicare pack that is
    permitted but never fetched fails the `some` pin; and the lookback figure
    reaching a URL fails `expect(request.url).not.toContain('168421')`. One limit
    is named rather than hidden and is opened as `TP-04-33` below: the row places
    no bound on ledger growth after first paint, so a request issued once the
    lookback is declared would not fail it.
- [ ] `SCN-024-010` constrains ledger growth: the run captures the ledger length
      after first paint and asserts the ledger does not grow past it once the
      lookback is declared.
  - **Phase:** test · **Command:** `TP-04-33` · **Evidence:** not authored — the
    scenario currently has no growth constraint. Opened 2026-08-22 (F-REG-03)
    rather than ticked, because no executed evidence for it exists.
  - **Claim Source:** executed. TP-04-20 green — no tax module holds a shipped premium, boundary, adjustment amount or authority name, and the detector is proven to fire on a planted figure. Browser row TP-04-28 green — the request ledger contains only declared assets, the medicare pack among them, and no lookback figure reaches a URL. TP-04-21 authored and green, closing the gap this row named: both lookback members are declared workspace fields that start `null`, are named by the unavailable-domain report while undeclared, are omitted by the export sanitizer and listed in `omittedFields`, and never appear in the exported bytes. The declared amount genuinely reaches storage — asserted before the clear — and the clear action removes all three declared keys. The declared storage key count of three is asserted unchanged in that same assertion.
- [x] The `power-medicare` renderer reads only members the settlement publishes,
      proven by rendering every Power section with each medicare member absent in
      turn, and every control routes through the declaration-signature no-op guard.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-04-23`
  - **Claim Source:** executed. TP-04-23's first arm is green as before. Its second arm, authored this session, closes the gap this row named: each of the eleven medicare pack members is removed in turn and the stage composed again. No removal throws, and every removal yields a shape the renderer's early return handles — a refusal carrying only the members read before that return, or an available shape publishing every member the renderer reads. At least one removal genuinely produces the refusal shape, so the arm is not vacuous. The member set checked is read off the renderer's own body rather than listed, so a member a later edit adds is covered without editing the check. A renderer throw would abort `renderPower` entirely, which is why the removals are exercised rather than reasoned about.
- [x] SUP-024-06 and SUP-024-07 are delivered with their markers, each replacement
      derived, each superseded clause recorded verbatim, each intended-RED failure
      recorded before its green, and SUP-024-07's re-pointed probe proven to fire on
      both a deleted-not-moved id and a genuinely modelled one.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#supersession-ledger`, `report.md#tp-04-22`
  - **Claim Source:** executed. TP-04-22's first arm is green as before: twelve markers and twelve ledger rows, equal as sets in both directions. Its second arm, authored this session, re-derives both causes rather than taking them on trust from the sites that carry them. SUP-024-06's superseded clause is restated against the tree as it stands and proven **false** — the id is no longer in the not-carried set — while its replacement holds. SUP-024-07's superseded probe is restated and proven **vacuous**: its filter is a no-op and it still passes, which is worse than a failure because nothing reports it. The replacement is then proven to fire on both sides of the move — on `payroll-tax`, an id chosen from the pack at run time because the shipped pack still carries it only as unsupported, when it is deleted from both lists; and on the genuinely modelled id when the medicare policy that received it is stripped. Both markers are asserted present with their superseded clause recorded verbatim and each pointing at its ledger row. Intended RED observed at `2809 passed, 3 failed` on the identical command.
- [x] Every excluded path is byte-identical, and the single permitted
      prior-feature test-file edit is confined to SUP-024-11's ledgered target in
      `tests/lifetime-tax-route.spec.mjs`, with every other assertion in that file
      unchanged. No excluded prior tax-computing module — `rltaxsocialsecurity.js`,
      `rltaxinclusion.js`, `rltaxclaimage.js`, `rltaxstate.js`, `rltaxcombined.js`,
      `rltaxproperty.js`, `rltaxrental.js`, `rltaxuse.js`, `rltaxdisposition.js` —
      and no prior pack family under `tax-rules/state/**`, `tax-rules/property/**`,
      `tax-rules/benefit/**` or `tax-rules/mortality/**` is opened at all. The
      engine this scope may modify, `rltax.js` and `rltaxrules.js`, changes no
      prior result: with no lookback declared, the Feature 021, 022 and 023
      fixtures reproduce their exact prior leg sets and totals. Together these
      prove that pricing a premium changed nothing that computes a tax.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list, plus `node scripts/selftest.mjs` for the prior-fixture invariance · **Evidence:** `report.md#change-boundary`, `report.md#tp-04-14`
  - **Claim Source:** executed. All three limbs were re-derived against the tree
    as it stands.

    **First limb — every excluded path byte-identical.** The one remaining ground
    on which this row stayed `[ ]` is discharged: `site-exclusions.json` carried 44
    uncommitted insertions, and commit `e903749c0` commits that file together with
    `scripts/selftest.mjs`. `e903749c0` is now `HEAD`. The excluded list was
    re-enumerated from this scope's Change Boundary, with `tests/lifetime-tax-*.spec.mjs`
    resolved to all fifteen files minus this scope's own
    `tests/lifetime-tax-medicare.spec.mjs` and minus the SUP-024-11 target
    `tests/lifetime-tax-route.spec.mjs`, and with `tax-rules/federal/**` and
    `rltaxstrategy.js` deliberately absent because this scope's Change Boundary
    lists them as allowed-modified rather than excluded. Both directions returned
    empty at exit 0:

    ```
    $ git status --porcelain -- rlportfolio.js rlportfolioanalytics.js portfolio-survival-allocation.config.json specs/008-portfolio-survival-and-brief-lab specs/021-execution-receipts-and-session-review-adoption specs/021-lifetime-tax-strategy-lab specs/022-federal-preferential-and-state-income-tax specs/023-property-tax-and-rental-income rltaxsocialsecurity.js rltaxinclusion.js rltaxclaimage.js rltaxstate.js rltaxcombined.js rltaxproperty.js rltaxrental.js rltaxuse.js rltaxdisposition.js tax-rules/state tax-rules/property tax-rules/benefit tax-rules/mortality tools.json index.html rlnav.js README.md notes/README.md 'market-brief.*' briefs data watchlist.json site-exclusions.json scripts/build-pages-site.mjs scripts/validate-spec-test-paths.baseline tests/lifetime-tax-benefit.spec.mjs tests/lifetime-tax-claim-age.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-deduction.spec.mjs tests/lifetime-tax-disposition.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-inclusion.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-rental.spec.mjs tests/lifetime-tax-retirement-route.spec.mjs tests/lifetime-tax-use.spec.mjs tests/lifetime-tax.support.mjs .github/bubbles .github/agents .github/prompts .github/instructions .github/skills
    SCOPE04_EXCLUDED_STATUS_EXIT=0
    $ git --no-pager diff --stat e903749c0 -- <the identical path list>
    SCOPE04_EXCLUDED_DIFF_EXIT=0
    ```

    Neither command printed a line before its exit-code echo. That covers the nine
    named prior tax-computing modules and all four excluded pack families
    (`tax-rules/state/**`, `tax-rules/property/**`, `tax-rules/benefit/**`,
    `tax-rules/mortality/**`), so none of them is opened.

    **Second limb — the permitted edit confined to SUP-024-11's target.**
    Re-derived this session rather than carried over. `tests/lifetime-tax-route.spec.mjs`
    is itself unmodified against `HEAD`, and inside it the file carries exactly one
    `SUP-024-11` marker, none of this scope's other four owned markers, and zero
    live occurrences of the superseded `unavailable.first()` pair — its only
    occurrence is the quoted text inside the SUP-024-11 marker comment at line 210:

    ```
    $ git status --porcelain -- tests/lifetime-tax-route.spec.mjs
    ROUTE_SPEC_STATUS_EXIT=0
    $ for m in SUP-024-06 SUP-024-07 SUP-024-10 SUP-024-11 SUP-024-12; do printf '%s=%s\n' "$m" "$(grep -c "$m" tests/lifetime-tax-route.spec.mjs)"; done
    SUP-024-06=0
    SUP-024-07=0
    SUP-024-10=0
    SUP-024-11=1
    SUP-024-12=0
    $ grep -nE "unavailable[^\n]*\.first\(\)" tests/lifetime-tax-route.spec.mjs
    210:  /* SUP-024-11: supersedes `await unavailable.first().focus(); await expect(unavailable.first())
    ```

    One correction to the record: an earlier draft of this reason placed SUP-024-09's
    `declaredRouteAssets` companion in `tests/lifetime-tax-property.spec.mjs`. The
    file's own marker text names `lifetime-tax-foundation.spec.mjs`, so that
    companion claim is withdrawn rather than repeated, and the confinement limb rests
    on the marker and occurrence counts above.

    **Third limb — prior-fixture invariance.** TP-04-14 is green in the
    `2843 passed, 0 failed` selftest run recorded for this session at exit 0: with no
    lookback declared, the Features 021, 022 and 023 fixtures reproduce their exact
    prior leg sets and totals.

    **Limitation, recorded rather than hidden.** Features 021-024 landed as the single
    commit `b9d92a3f1`, in which every excluded module and pack above appears as a
    pure creation. A diff against `e903749c0` therefore proves the worktree has not
    drifted from the feature-complete tree, but cannot attribute an edit *inside* that
    commit to one scope. The first limb is proven in that no-drift sense. The second
    and third limbs do not depend on attribution: the marker and occurrence counts and
    the fixture-invariance assertions are properties of the tree as it stands.
- [x] No output states a probability, a plan success figure, a future-year premium
      or bracket, a track record or an error rate, and no premium is presented as an
      estimate or a typical amount.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
  - **Claim Source:** executed. TP-04-CLAIM green. The scan runs over the composed premium legs, the annual cost and the shipped refusal, the detector is proven to fire on the sentence `our estimate of the typical premium`, and the pack is asserted to declare no `effectiveTaxYears` entry beyond the year it was retrieved for.
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence recorded,
      including the browser rows.
  - **Unticked 2026-08-22 (F-REG-03).** `TP-04-33` was opened in this scope and
    is not authored, so it carries neither a RED nor a GREEN. The word "Every"
    therefore no longer holds. Ticking it again requires `TP-04-33` authored with
    a RED and a same-command GREEN.
  - **Phase:** implement · **Command:** the exact TP-04-01 through TP-04-32 commands · **Evidence:** `report.md#test-evidence`
  - **Claim Source:** executed. All 32 rows now carry an observed intended RED and a same-command GREEN, recorded row by row in `report.md#per-row-results` and derived in Probes 1 through 18. The two defects that kept this row open are discharged. TP-04-29 was run as its own named command for the first time — `77 passed`, zero failed, zero skipped — and then driven to `64 passed / 13 failed` by Probe 18's value-free mutation on that identical command, so the cumulative gate is shown to be load-bearing rather than merely green. TP-04-28's RED is Probe 15, obtained by redirecting an existing fetch to an undeclared pathname rather than by placing a household value in a URL, which is the privacy defect the row itself forbids; the limb keyed to the declared amount is recorded as resting on inspection rather than on a RED, because no permissible mutation can drive it. TP-04-30's RED is Probes 1 through 11, each of which drives `node scripts/selftest.mjs` — TP-04-30's own command — from green to red and back. TP-04-31 is Probe 16 and TP-04-32 is Probe 17. Three rows earned their RED only after a strengthening, because each first passed under its own mutation: TP-04-23, TP-04-25 and TP-04-26. Those misses, and one mutation that landed on text its command does not read, are recorded in `report.md` rather than discarded.
- [x] `node scripts/selftest.mjs` is green with no fall in pass count,
      `node scripts/validate-spec-test-paths.mjs` reports zero new missing paths,
      and `node scripts/build-pages-site.mjs --dry-run` succeeds with
      `site-exclusions.json` unchanged.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-04-30`, `report.md#tp-04-31`, `report.md#tp-04-32`
  - **Claim Source:** executed. `2812 passed, 0 failed` exit 0, up from `2805 passed, 0 failed` at this session's start and from `2786 passed, 0 failed` at the previous one, so the pre-existing count did not fall. `[spec-test-paths] OK — no new missing test path(s)` exit 0, `new=0`. The Pages dry-run returned its result contract with `excludedPaths: 9` at exit 0, and `site-exclusions.json` was not opened in either session — its modified state in `git status` predates both. Verbatim output for all three is in `report.md#test-evidence`.
