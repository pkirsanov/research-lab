# Scope 2: Net Investment Income Tax And Additional Medicare Tax

## 02-net-investment-income-and-additional-medicare-tax

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** Not started
**Scope-Kind:** runtime-behavior
**Tags:** `engine:federal`, `sourcing-gated:true`, `known-value-tested`
**Depends On:** 01
**Foundation:** false

**Primary Outcome:** the two federal threshold surtaxes become real legs of the
federal total, each computed from its own declared basis against its own
filing-status threshold set, and the household can see the one asymmetry that
matters most to a conversion decision: added ordinary income can move the net
investment income tax and cannot move the additional Medicare tax. The pack now
declares its own tax-leg set, so a jurisdiction with three legs and a jurisdiction
with two both settle through one summation.

## Requirement Coverage

- **FR-022-008** — a jurisdiction total is the sum of the pack's declared legs and
  is a refusal if any declared leg is.
- **FR-022-009** — the net investment income tax leg's rate, base, cap and
  threshold.
- **FR-022-010** — tax-exempt interest excluded from both the investment-income
  base and the modified adjusted gross income measure, and still recorded.
- **FR-022-011** — the additional Medicare tax leg uses the declared wage basis
  and no other income member.
- **FR-022-012** — each surtax requires its own declared basis; undeclared refuses
  by name, declared zero computes.
- **FR-022-013** — the modified adjusted gross income measure declares its own
  completeness and names every adjustment the pack does not model.
- **FR-022-014** — the conversion asymmetry is a structural member, not page copy.

Inherited and re-asserted: **FR-022-002** retrieved non-newsroom sources,
**FR-022-003** locators, **FR-022-007** no derivation, **NFR-022-001**
determinism, **NFR-022-005** no in-module rule value, **NFR-022-007**
append-first selftest, **NFR-022-009** Feature 008 byte-identity,
**NFR-022-011** supersession ledger conformance.

## Gherkin Scenarios

```gherkin
Scenario: SCN-022-004 The net investment income tax is computed from a declared basis and refuses without one
  Given a household whose modified adjusted gross income exceeds its filing-status threshold
  When the household has declared the ordinary-income portion that is net investment income
  Then the tax is the pack rate applied to the lesser of net investment income and the excess of modified adjusted gross income over the threshold
  And tax-exempt interest is excluded from both quantities and is still recorded
  And a household that has not declared the portion receives RLTAX-INPUT-INCOMPLETE naming the missing member rather than an assumed zero

Scenario: SCN-022-005 The additional Medicare tax is computed from a separate declared basis
  Given a household whose declared Medicare wages and self-employment income exceed its filing-status threshold
  When the additional Medicare tax is computed
  Then the tax is the pack rate applied to the excess of the declared wage basis over the threshold and uses no other income member
  And the result is exact immediately below, exactly at, and immediately above the threshold for every filing status
  And an undeclared wage basis receives RLTAX-INPUT-INCOMPLETE naming the missing member

Scenario: SCN-022-006 A conversion moves one surtax and not the other
  Given a household holding both investment income and Medicare wages, with both bases declared
  When an amount is added to ordinary income
  Then the net investment income tax can increase because modified adjusted gross income rose
  And the additional Medicare tax does not change because the wage basis did not
  And the result carries this asymmetry as a structural member rather than as page copy
```

## UI Scenario Matrix

| Scenario | Preconditions | User Steps | Exact Visible Result | Test Type |
| --- | --- | --- | --- | --- |
| SCN-022-004 computed | Valid workspace above the threshold | Declare the investment-income portion | A separate net investment income tax line with its rate, its base, its threshold and its rule status | e2e-ui |
| SCN-022-004 refused | Valid workspace, portion undeclared | Open the result | `RLTAX-INPUT-INCOMPLETE` naming the member, with no numeral and no zero in its place | e2e-ui |
| SCN-022-005 boundary | Valid workspace | Enter a wage basis below, at and above the threshold | Three distinct figures matching values derived from the pack's own threshold set | e2e-ui |
| SCN-022-006 asymmetry | Both bases declared, both above threshold | Raise ordinary income only | The investment-income surtax changes, the Medicare surtax does not, and the page states which moved and why | e2e-ui |
| Declared zero | Valid workspace, both bases declared as zero | Open the result | Two computed zeros with rule statuses, visibly distinct from the refusal surface | e2e-ui |

## Implementation Files

### New

- Known-value fixture files for both threshold sets, at, below and above each
  filing-status threshold, each naming the source edition and tax year it was
  derived from.
- A leg-set fixture pack exercising the refusal branches: a declared leg whose
  figure is absent, a leg naming a figure the pack does not carry, a duplicate
  `legId`, and an `includedInTotal: false` leg whose figure is absent.

### Modified

- `rltaxrules.js` — `ThresholdSet/v1`, `TaxLeg/v1`, `validateThresholdSet`,
  `validateTaxLegs`, and the `TaxRulePack/v2` members `taxLegs[]` and
  `thresholdSets`.
- `rltax.js` — stages `CO-11` and `CO-12`, `CO-8` generalized to sum the declared
  leg set, reconciliation leg `L6`.
- `rltaxworkspace.js` — `investmentIncomeBasis` and `wageBasis`, **each
  initialized `null`**, their declared-versus-undeclared handling, and their
  inclusion in the privacy inventory, the clear action and the export sanitizer.
- `tax-rules/federal/<year>.json` — two `ThresholdSet/v1` entries, the declared
  four-leg set, the ordered calculation array, and the modified-adjusted-gross
  completeness declaration.
- `lifetime-tax-strategy-lab.html` — `SurtaxSummaryLines`,
  `ConversionAsymmetryLine`, `TaxLegLedger`, and the two declared-basis inputs.
- `scripts/selftest.mjs` — one appended assertion group, plus the SUP-022-03,
  -10, -14 and -18 replacements and the SUP-022-04 amendment this scope owns
  there, plus the fixture-input completions named in the register below.
- `tests/lifetime-tax-marginal.spec.mjs` — `SUP-022-08` only. Title
  byte-identical.
- `tests/lifetime-tax-federal.spec.mjs` — `SUP-022-15` only. Title
  byte-identical.
- `tests/lifetime-tax-route.spec.mjs` — `SUP-022-16` and `SUP-022-19` only.
  Title byte-identical.
- `tests/lifetime-tax-foundation.spec.mjs` — the `SUP-022-09` amendment only.
  Title byte-identical.
- `tests/lifetime-tax.support.mjs` — the two basis declarations in
  `declareOrdinaryHousehold` only, under the register below.

## Implementation Plan

1. Add `ThresholdSet/v1` to `rltaxrules.js` with the closed `appliesTo` pair, the
   `varyByFilingStatus` switch, the `basisMember` and `capMember` pairing rule,
   and `indexing.declaredFor`.
2. Enforce the `indexing.declaredFor` rule as a refusal: the declared tax year
   must be a member, or the whole threshold set is refused
   `RLTAX-THRESHOLD-UNAVAILABLE`. This is the mechanical form of `BI-4`. Do not
   implement any branch that treats an empty or absent `declaredFor` as
   permission.
3. Add `TaxLeg/v1` and `validateTaxLegs`: non-empty, unique `legId`, every
   `figureRef` resolving to a figure the pack carries, and a refusal for any leg
   that sets `includedInTotal: false` while its figure is absent.
4. Generalize `CO-8` in `rltax.js` to sum exactly the legs whose
   `includedInTotal` is `true`, returning the refusal of the first refusing leg in
   declared order. Assert against the **unmodified** Feature 021 pack that the
   generalized sum equals the previous two-leg sum for every existing fixture,
   before any new leg is added.
5. **Retrieve `BI-4`.** The authority question is closed and the document is
   named: IRS Publication 505 (2026), "For use in 2026", states both surtax rates
   and all filing-status thresholds with an explicit year label, and Worksheet 2-7
   independently confirms the tax-year-2026 preferential figures. Closure names
   the document; it does not supply the figure. Open Publication 505, transcribe
   each rate and each filing-status threshold directly from it, and record the
   retrieval in a `SourceRecord/v1` with this session's own `retrievedAt`. Do not
   transcribe from `spec.md`, which is not a transcription source. A threshold
   that cannot be read for the declared year still ships as an `AbsentFigure/v1`
   and its leg still refuses; do not populate `declaredFor` from the absence of a
   year label on a page.
6. Implement `CO-11`. The investment-income base is the two preferential income
   members plus the declared ordinary portion. The modified-adjusted-gross measure
   is the gross supported income already computed by `CO-1`. Tax-exempt interest
   enters neither. The tax is the rate applied to the lesser of the base and the
   excess over the threshold.
7. Implement `CO-12`. The base is the declared wage basis and nothing else. No
   other income member may appear in the expression, and the no-shadow scan is
   extended to assert that `CO-12` reads exactly one workspace member.
8. Add `investmentIncomeBasis` and `wageBasis` to `rltaxworkspace.js`, **each
   initialized `null` by `createEmptyWorkspace()`**. A `null` member is undeclared
   and produces `RLTAX-INPUT-INCOMPLETE` naming it, and `CO-8` inherits that
   refusal; a `0` is a real declaration and computes a real zero. Do **not**
   initialize either member to `0` to keep a pre-existing household settled —
   that would let a wage earner above the threshold read a confident `$0`, which
   is the substitution this feature exists to prevent, and
   [`design.md`](../../design.md#undeclared-surtax-bases-and-leg-reachability)
   forbids it. Record the declared-versus-undeclared distinction in
   `declaredUnavailableDomains[]` exactly as Feature 021 records it for income.
   Extend `privacyInventory`, `clearAllPrivateData` and `sanitizeForExport` to
   cover both, and prove each with its own assertion.
9. Complete the pre-existing fixtures named in the
   [Fixture Input Completion Register](#fixture-input-completion-register), adding
   only the two declarations and only at value `0`. Keep at least one fixture
   household with both bases `null` and assert it refuses. If any assertion fails
   once a declaration is added, stop and return the finding; do not edit the
   assertion.
10. Add reconciliation leg `L6` asserting the investment-income base excludes
    tax-exempt interest and excludes the wage basis unless that amount was also
    declared as investment income. `L6` makes a federal settlement publish six
    reconciliation legs, which is why SUP-022-14, SUP-022-15 and SUP-022-16 exist.
11. Publish the conversion asymmetry as a structural member of the result, naming
    which legs a change in ordinary income can move and which it cannot, so a
    rendering change cannot drop it.
12. Declare the modified-adjusted-gross completeness in the result and list every
    adjustment the pack does not model, so the measure is never presented as
    complete.
13. Render `SurtaxSummaryLines` and `ConversionAsymmetryLine` in Simple as
    `data-rl-value` fields added to `SIMPLE_FIELDS`, each with a withheld-detail
    link to the Power section that owns its detail, and render `TaxLegLedger` in
    Power. Add no `<canvas>` and no `<table>` to Simple, and give no new field an
    id matching `band|curve|ledger|trace|reconcil|average`.
14. Append a `lifetime-tax — threshold surtaxes and declared tax legs` group to
    `scripts/selftest.mjs`.

## Shared Infrastructure Impact Sweep

| Shared surface | Change | Downstream consumers | Blast radius | Independent canary | Rollback |
| --- | --- | --- | --- | --- | --- |
| `CO-8` summation | Two hardcoded legs become a pack-declared set | Scopes 03, 04, 05 and every Feature 021 fixture | High — a leg-set summation that mis-orders or silently skips a refusing leg changes every total at once | Assert the generalized sum equals the previous two-leg sum for every Feature 021 fixture against the unmodified pack, BEFORE any new leg is declared | Revert to the two-leg sum; the pack's `taxLegs[]` is ignored |
| `rltaxworkspace.js` | Two new members plus privacy surface | Scopes 03, 04, 05 | High — a new household value that escapes the privacy inventory silently breaks Feature 021's central guarantee | Assert both members appear in the inventory, are removed by the clear action, and are accounted for by the export sanitizer under the identical rule as every income amount — kept in the exported workspace, with every withheld member named in `omittedFields[]` — each as its own assertion | Remove the members; the workspace validator rejects them as unknown keys |
| `tax-rules/federal/<year>.json` | Threshold sets, leg set, ordered array | Every later scope | High — an ordered array that does not match the engine's derived array refuses the whole pack | Validate the pack and assert the array matches element for element before any settlement row runs | Revert the pack file |
| `scripts/selftest.mjs` | One group appended | The whole-repo gate | Medium | Pre-existing pass count must not fall | Remove the appended group |

## Change Boundary And Protected Paths

**Allowed new:** this scope's fixture files.

**Allowed modified:** `rltaxrules.js` · `rltax.js` · `rltaxworkspace.js` ·
`tax-rules/federal/<year>.json` · `lifetime-tax-strategy-lab.html` ·
`scripts/selftest.mjs` (append-first; existing assertions only under SUP-022-03,
-10, -14, -18, -20 and the SUP-022-04 amendment; existing **fixture helpers** only
under the Fixture Input Completion Register) ·
`tests/lifetime-tax-marginal.spec.mjs` (SUP-022-08 expectations only) ·
`tests/lifetime-tax-federal.spec.mjs` (SUP-022-15 expectations only) ·
`tests/lifetime-tax-route.spec.mjs` (SUP-022-16 and SUP-022-19 expectations only) ·
`tests/lifetime-tax-foundation.spec.mjs` (the SUP-022-09 amendment only) ·
`tests/lifetime-tax.support.mjs` (the two basis declarations only, under the
register) · this scope's Playwright spec.

The four Feature 021 test files are named here because SUP-022-08, -15, -16, -19
and the SUP-022-09 amendment cannot be delivered without them, and
`tests/lifetime-tax.support.mjs` is named because the leg-reachability rule makes
every Feature 021 browser household's total refuse until it declares both bases.
`tests/lifetime-tax-conversion.spec.mjs` carries no marker owned by this scope and
stays excluded. Every test title stays byte-identical.

**Excluded — must remain byte-identical:** `rlportfolio.js` ·
`rlportfolioanalytics.js` · `portfolio-survival-allocation.config.json` ·
`specs/008-portfolio-survival-and-brief-lab/**` · `specs/021-*/**` ·
`rltaxstrategy.js` · `tools.json` · `index.html` · `rlnav.js` · `README.md` ·
`notes/README.md` · `market-brief.*` · `briefs/**` · `data/**` ·
`watchlist.json` · `site-exclusions.json` · `scripts/build-pages-site.mjs` ·
`scripts/validate-spec-test-paths.baseline` ·
`tests/lifetime-tax-conversion.spec.mjs` · every framework-managed file.

Every file in the excluded list carries **no** `SUP-022-*` marker owned by this
scope and appears in no row of the register below, per the
[per-file marker distribution](../../design.md#per-file-marker-distribution).
That is the test for membership, and it is what keeps the boundary and the ledger
from contradicting each other.

`rltaxstrategy.js` is excluded deliberately. The conversion comparison recomputes
both policies in full and therefore picks up the new legs with no edit; if it
needs one, the leg-set generalization is wrong and that is a finding. In
particular, `TP-04-01`'s `heldConstant.length === 9` survives only because this
file is untouched — if the published held-constant list must grow to name the two
new basis declarations, that is a finding returned to planning, not an in-scope
edit.

**Rollback:** revert the engine stages and the leg-set summation, revert the pack
file, remove the workspace members, delete the fixtures, revert the page panels
and the appended selftest group. Reverting SUP-022-03, -08, -10, -14, -15, -16,
-18 and -19 restores the Feature 021 originals verbatim; reverting the SUP-022-04
and SUP-022-09 amendments restores Scope 01's replacements; reverting the register
rows removes two declarations and restores every helper's prior input exactly.

## Fixture Input Completion Register

[`design.md`](../../design.md#undeclared-surtax-bases-and-leg-reachability) fixes
the rule that makes this necessary: the product never declares a basis on a
household's behalf, so `createEmptyWorkspace()` initializes both members to
`null`, an undeclared basis refuses its leg, and `CO-8` inherits the refusal.
Every pre-existing Feature 021 test household was built before these members
existed, so each must now declare them or lose its settled total.

A fixture author declaring a test household's basis is making a real, visible,
auditable statement about a household it owns. That is not the same act as the
product inventing a declaration, and the two must not be confused, because a
fixture edit is the other way a green suite can be made to lie. Rules FIC-1
through FIC-6 in `design.md` bind every row below.

| Helper | File | Members added | Declared value |
| --- | --- | --- | --- |
| The Feature 021 Scope 02 settlement workspace builders | `scripts/selftest.mjs` | both | `0` |
| `curveWorkspace` | `scripts/selftest.mjs` | both | `0` |
| `strategyWorkspace` | `scripts/selftest.mjs` | both | `0` |
| `declareOrdinaryHousehold` | `tests/lifetime-tax.support.mjs` | both | `0` |

Binding conditions on the whole register:

- **FIC-2 applies to every row.** Only the two declarations are added. No income
  amount, filing status, deduction mode, declared year, bracket selection or
  funding source changes in the same edit.
- **FIC-4 fixes the value.** Both are `0` — a real declaration of no net
  investment income portion and no Medicare wage basis — so both legs compute a
  real zero and no pre-existing settled figure moves. A non-zero declaration would
  move a known value and is forbidden here.
- **FIC-5 keeps the refusal path alive.** This scope adds at least one fixture
  household that keeps both bases `null` and asserts it receives
  `RLTAX-INPUT-INCOMPLETE` on each leg and on the total. Completing every fixture
  would leave the refusal unexercised, which is ASC-7's vacuity failure wearing
  different clothes.
- **FIC-3 is the stop condition.** If an assertion fails once a declaration is
  added, either the declaration or the behaviour is wrong. The scope stops and
  returns the finding. It does not edit the assertion, and no row of this register
  is ever a licence to touch one.
- **FIC-6 closes the register here.** A later scope needing a further
  fixture-input change returns the finding to planning.

## Assertion Supersession Owned By This Scope

This scope owns nine of the twenty-one entries in the
[supersession ledger](../../spec.md#supersession-ledger) and amends two that Scope
01 delivered. It follows the
[per-scope procedure](../_index.md#assertion-supersession-procedure) for each.

| Entry | Target | Shape | Replacement in one line |
| --- | --- | --- | --- |
| SUP-022-03 | `scripts/selftest.mjs` ~L11461 | account | `unsupportedFeatures[]` and `taxLegs[]` are disjoint and jointly exhaustive over Feature 021's eighteen ids, so nothing may disappear from both |
| SUP-022-08 | `tests/lifetime-tax-marginal.spec.mjs` L96 | derive | Label/list agreement, pack-derived contributor set identity, and positive proof that `net-investment-income-tax` moved to a computed leg rather than being deleted |
| SUP-022-10 | `scripts/selftest.mjs` ~L12070 | derive | The engine-side twin of SUP-022-08: pack-derived two-directional contributor-set identity on the shipped curve, plus the moved-versus-deleted clause |
| SUP-022-14 | `scripts/selftest.mjs` ~L11803 | derive | Ordered, two-directional reconciliation leg-set identity against the engine's own declaration, plus the `L6` exclusion clause |
| SUP-022-15 | `tests/lifetime-tax-federal.spec.mjs` L108-111 | derive | A record-derived rendered-row count and a `holds` loop bounded by the rendered rows |
| SUP-022-16 | `tests/lifetime-tax-route.spec.mjs` L80 | derive | The same record-derived row count, in the route spec that owns the Power rendering |
| SUP-022-18 | `scripts/selftest.mjs` ~L12450 | derive | Cross-artifact identity between `SIMPLE_FIELDS` and the rendered Simple markup; every Simple-stays-decision-level clause retained verbatim |
| SUP-022-19 | `tests/lifetime-tax-route.spec.mjs` L54-62 | derive | Two-directional withheld-detail link/section identity, and selection by declared target instead of by ordinal |
| SUP-022-20 | `scripts/selftest.mjs` ~L12327 | derive | A pack-derived declared-edge set, a step selector keyed on the segment's own step-ness rather than its width, and a labelling-honesty clause over every probe-width segment |

**Amendments to Scope 01's replacements**, carrying no new ledger entry:

- SUP-022-04 — remove the two surtax ids from the named spot checks, because the
  pack no longer lists them as unsupported. The set-identity clause is untouched.
- SUP-022-09 — the rendered contributor count is already derived from the pack by
  Scope 01's replacement, so this scope changes no assertion there and only
  confirms the derived count follows the pack down.

**This scope supersedes nothing else.** An assertion outside these entries that
fails is a defect in this scope's change and is fixed rather than edited. In
particular, SUP-022-08's and SUP-022-10's moved-versus-deleted clauses are the
guard against the convenient path of dropping the contributor from the page and
from the curve without computing it anywhere.

**Two Simple-view entries, one rule.** SUP-022-18 and SUP-022-19 exist because
this scope puts `SurtaxSummaryLines` and `ConversionAsymmetryLine` in Simple.
Neither entry may be used to relax a Simple-markup clause: both replacements
retain the no-`<canvas>`, no-`<table>`, no-`curveTextEquivalent`, no-`bracketDetail`,
no-`ruleLedger` and field-id token-exclusion clauses **verbatim**. Every Simple
surface this scope adds is a `data-rl-value` field carried in `SIMPLE_FIELDS`.

## Scenario-First Red/Green Contract

Add the named known-value assertion or the persistent browser title first, run the
exact command, and confirm the intended contract assertion is what fails. Then
implement the smallest owned change and rerun the identical command.

**Named intended-RED assertion for this scope:** a workspace whose
`wageBasis.medicareWagesAndSelfEmploymentIncome` is `null` must produce
`RLTAX-INPUT-INCOMPLETE` naming that member, and `CO-8` must inherit the refusal
rather than summing the remaining legs. Before `CO-12` exists the assertion fails
because the total resolves without the leg. A syntax error, a missing browser or
an absent test does not satisfy RED.

## Test Plan

| ID | Type | Category | Scenario | File | Exact Behavior / Persistent Title | Command | Live System | Evidence Anchor |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TP-02-01 | Contract | unit | SCN-022-004 | `scripts/selftest.mjs` | `ThresholdSet/v1` validates; a `capMember` present with the uncapped `appliesTo`, a `capMember` absent with the capped one, a `varyByFilingStatus: false` set carrying per-status keys, and a `declaredFor` omitting the declared year are each refused by name | `node scripts/selftest.mjs` | No | `report.md#tp-02-01` |
| TP-02-02 | Contract | unit | SCN-022-004 | `scripts/selftest.mjs` | `TaxLeg/v1` validates; a duplicate `legId`, a `figureRef` naming an uncarried figure, and an `includedInTotal: false` leg whose figure is absent are each refused by name | `node scripts/selftest.mjs` | No | `report.md#tp-02-02` |
| TP-02-03 | Compatibility | unit | SCN-022-004 | `scripts/selftest.mjs` | The generalized `CO-8` sum equals the previous two-leg sum for every Feature 021 fixture against the unmodified Feature 021 pack | `node scripts/selftest.mjs` | No | `report.md#tp-02-03` |
| TP-02-04 | Known value | unit | SCN-022-004 | `scripts/selftest.mjs` | The net investment income tax is exact below, at and above the threshold for every filing status, and is the rate applied to the lesser of the base and the excess | `node scripts/selftest.mjs` | No | `report.md#tp-02-04` |
| TP-02-05 | Known value | unit | SCN-022-005 | `scripts/selftest.mjs` | The additional Medicare tax is exact below, at and above the threshold for every filing status, and reads exactly one workspace member | `node scripts/selftest.mjs` | No | `report.md#tp-02-05` |
| TP-02-06 | Known value | unit | SCN-022-006 | `scripts/selftest.mjs` | Raising ordinary income alone increases the net investment income tax where the cap does not bind, and leaves the additional Medicare tax byte-identical | `node scripts/selftest.mjs` | No | `report.md#tp-02-06` |
| TP-02-07 | Adversarial | unit | SCN-022-006 | `scripts/selftest.mjs` | Regression: an implementation whose additional Medicare tax reads gross income instead of the wage basis is proven to fail the asymmetry assertion | `node scripts/selftest.mjs` | No | `report.md#tp-02-07` |
| TP-02-08 | Adversarial | unit | SCN-022-004 | `scripts/selftest.mjs` | Regression: an implementation that includes tax-exempt interest in the investment-income base, and separately one that includes it in the modified-adjusted-gross measure, are each proven to fail reconciliation leg `L6` | `node scripts/selftest.mjs` | No | `report.md#tp-02-08` |
| TP-02-09 | Adversarial | unit | SCN-022-004 | `scripts/selftest.mjs` | Regression: an implementation that treats an undeclared basis as zero is proven to fail the `RLTAX-INPUT-INCOMPLETE` assertion, a declared zero is proven to compute a real zero, `createEmptyWorkspace()` is proven to initialize both members to `null`, and the total is proven to inherit the refusal rather than summing the remaining legs | `node scripts/selftest.mjs` | No | `report.md#tp-02-09` |
| TP-02-10 | Refusal propagation | unit | SCN-022-005 | `scripts/selftest.mjs` | A refusing leg makes `CO-8` a refusal naming the leg, and no leg is treated as zero because it is unavailable | `node scripts/selftest.mjs` | No | `report.md#tp-02-10` |
| TP-02-11 | Absence discipline | unit | SCN-022-004 | `scripts/selftest.mjs` | A threshold set whose `declaredFor` omits the declared tax year is refused rather than applied, and ships as an `AbsentFigure/v1` carrying no numeric member | `node scripts/selftest.mjs` | No | `report.md#tp-02-11` |
| TP-02-12 | Completeness | unit | SCN-022-004 | `scripts/selftest.mjs` | The modified-adjusted-gross measure declares its own completeness and lists every unmodeled adjustment; an empty list is proven to fail | `node scripts/selftest.mjs` | No | `report.md#tp-02-12` |
| TP-02-13 | Privacy | unit | SCN-022-005 | `scripts/selftest.mjs` | Both new basis members appear in the privacy inventory, are removed by the clear action, and are accounted for by the export sanitizer under the identical rule as every income amount — kept in the exported workspace, with every withheld member named in `omittedFields[]` so neither can be dropped unnamed — each asserted independently | `node scripts/selftest.mjs` | No | `report.md#tp-02-13` |
| TP-02-14 | No-shadow | unit | SCN-022-004 | `scripts/selftest.mjs` | Regression: no module holds a surtax rate, threshold or authority name; the detector is proven to fire on a module that does | `node scripts/selftest.mjs` | No | `report.md#tp-02-14` |
| TP-02-15 | Regression E2E | e2e-ui | SCN-022-004 | `lifetime-tax-surtax.spec.mjs` | `Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one" --reporter=list` | Yes | `report.md#scenario-scn-022-004` |
| TP-02-16 | Regression E2E | e2e-ui | SCN-022-005 | `lifetime-tax-surtax.spec.mjs` | `Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --reporter=list` | Yes | `report.md#scenario-scn-022-005` |
| TP-02-17 | Regression E2E | e2e-ui | SCN-022-006 | `lifetime-tax-surtax.spec.mjs` | `Regression: SCN-022-006 added ordinary income moves one surtax and not the other` | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --reporter=list` | Yes | `report.md#scenario-scn-022-006` |
| TP-02-18 | Broader Regression E2E | e2e-ui | SCN-021-*, SCN-022-001 … -006 | `lifetime-tax-preferential.spec.mjs`, `lifetime-tax-surtax.spec.mjs`, Feature 021's five specs | Every scenario owned by features 021 … 024 passes over the real route — the whole cumulative browser suite for this feature family, zero failed and zero skipped, not a convenient subset. `SCN-02[1-4]` is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024` written without a `\|`, which a table cell cannot carry verbatim; it is pinned to the four owning spec numbers, so a scenario owned by any other feature can neither satisfy nor break this row | `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list` | Yes | `report.md#tp-02-18` |
| TP-02-19 | Repo gate | unit | SCN-022-004 … -006 | `scripts/selftest.mjs` | The whole-repository suite stays green and the pre-existing pass count does not fall | `node scripts/selftest.mjs` | No | `report.md#tp-02-19` |
| TP-02-20 | Path guard | unit | SCN-022-004 … -006 | `scripts/validate-spec-test-paths.mjs` | Zero new missing spec-referenced test paths | `node scripts/validate-spec-test-paths.mjs` | No | `report.md#tp-02-20` |
| TP-02-21 | Deploy gate | unit | SCN-022-004 … -006 | `scripts/build-pages-site.mjs` | The Pages plan succeeds and `site-exclusions.json` is unchanged | `node scripts/build-pages-site.mjs --dry-run` | No | `report.md#tp-02-21` |
| TP-02-22 | Supersession conformance | unit | SCN-022-004 … -006 | `scripts/selftest.mjs` | The marker check: every distinct `SUP-022-NN` marker is a ledger id, the delivered set equals Scope 01's eleven plus this scope's eight — nineteen in total — each marked region names its shape, and no assertion changed without a marker | `node scripts/selftest.mjs` | No | `report.md#tp-02-22` |
| TP-02-23 | Supersession adversarial | unit | SCN-022-004 | `scripts/selftest.mjs` | Regression: an implementation that removes `net-investment-income-tax` from the unavailable-contributor set without declaring a computed leg is demonstrated to fail SUP-022-08's and SUP-022-10's moved-versus-deleted clauses, one that lists the id in both `unsupportedFeatures[]` and `taxLegs[]` is demonstrated to fail SUP-022-03's disjointness clause, and one that renders a `data-rl-value` field in Simple outside `SIMPLE_FIELDS` is demonstrated to fail SUP-022-18's cross-artifact identity | `node scripts/selftest.mjs` | No | `report.md#tp-02-23` |
| TP-02-24 | Fixture register | unit | SCN-022-004 … -006 | `scripts/selftest.mjs` | Every helper named in the Fixture Input Completion Register declares both bases at `0` and changed no other input member; at least one fixture household keeps both bases `null` and is proven to receive `RLTAX-INPUT-INCOMPLETE` on each leg and on the total; and every previously settled Feature 021 fixture value is byte-identical after completion | `node scripts/selftest.mjs` | No | `report.md#tp-02-24` |

### Definition of Done

- [x] FR-022-008 is implemented: `CO-8` sums the pack's declared leg set, returns
      the refusal of the first refusing leg, and equals the previous two-leg sum
      for every Feature 021 fixture against the unmodified pack.
  - **Closed:** the TP-02-03 comparison against the **unmodified** Feature 021 pack
    now runs over 96 household shapes, with its comparand recomputed from the
    `CO-6` and `CO-7` records rather than read back from `CO-8`, and was proven
    RED by a one-leg fallback mutation before it was banked.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-02`, `report.md#tp-02-03`, `report.md#tp-02-10`
- [x] `BI-4`'s named authority — IRS Publication 505 (2026) — was opened in the
      implementation session, every rate and filing-status threshold was
      transcribed directly from it, the retrieval was recorded with its own
      `retrievedAt`, and no figure was transcribed from `spec.md`. No
      `declaredFor` entry was populated from the absence of a year label on a
      page.
  - **Phase:** implement · **Command:** the retrieval record in the pack plus `node scripts/selftest.mjs` · **Evidence:** `report.md#sourcing`
- [ ] Both owned supersessions and both amendments are delivered: SUP-022-03, -08,
      -10, -14, -15, -16, -18 and -19 each replaced by the stronger assertion the
      ledger names, each seen to fail against the unchanged implementation first,
      each carrying its `SUP-022-NN` marker and its adversarial evidence;
      SUP-022-04's spot checks updated and SUP-022-09's derived count confirmed to
      follow the pack.
  - **Open — and SUP-022-18 is not deliverable as work; finding F-02-C.** The
    earlier blocker note is superseded: the Simple/Power panels being built was
    never the whole story. Every clause SUP-022-18 and SUP-022-19 were written to
    supersede has since been displaced by **Feature 023**, under Feature 023's
    markers. `simpleFields.length === 7`, `powerLinkDetails.length === 9`,
    `powerLinkSections.length === 9` and the route spec's `toHaveCount(9)` each
    return a fixed-string count of zero; the replacements are present and marked
    `SUP-023-04`, `SUP-023-05` and `SUP-023-06`, and SUP-023-04's marker states
    SUP-022-18's ledger replacement almost verbatim. Attaching a `SUP-022-18`
    marker to those regions would attribute one replacement to two features.
    SUP-022-19 splits: its count clause is displaced by SUP-023-06, but the
    positional focus expectation it also names **survives** as `links.nth(3)`, so
    "a selection by declared target instead of by ordinal" is still real,
    buildable work. **What would make it decidable:** record SUP-022-18 as
    superseded-in-substance by SUP-023-04 and -05 rather than as this scope's to
    deliver, and narrow SUP-022-19's row to the ordinal-selection clause. Both are
    ledger-text decisions, routed to `bubbles.plan`.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-02-18 browser command · **Evidence:** `report.md#supersession-ledger`, `report.md#verification-pass--2026-08-20-second--sup-022-18-and--19-were-displaced-by-feature-023-before-this-scope-could-deliver-them-finding-f-02-c`
- [x] The leg-reachability rule is implemented as `design.md` states it: both
      basis members initialize to `null`, an undeclared basis refuses its leg by
      name, `CO-8` inherits, and neither member is ever initialized to a value.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-09`
- [x] The Fixture Input Completion Register is satisfied and closed: every named
      helper declares both bases at `0` and changed nothing else, at least one
      fixture household keeps both bases `null` and is asserted refusing, every
      previously settled Feature 021 value is unchanged, and no assertion was
      edited to accommodate a fixture-input change.
  - **Closed:** the TP-02-24 register row now reads the register out of this
    artifact at run time, proves each named helper on its own, sweeps every
    governed completion site, holds the `null`-basis household refusing on each
    leg and on the total, and settles one household twice against the unmodified
    Feature 021 pack for byte-identity. Two first-draft misses are recorded with
    the row rather than quietly corrected.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-02-18 browser command · **Evidence:** `report.md#tp-02-24`
- [ ] No assertion outside this scope's ledger entries and amendments was edited,
      relaxed or deleted, no Simple-markup clause was relaxed under SUP-022-18 or
      SUP-022-19, and no sourcing rule, tolerance, determinism, privacy,
      zero-network or Feature 008 canary was touched.
  - **Open:** nothing was edited, but the TP-02-22 and TP-02-23 conformance rows
    that would prove it were not written.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-22`, `report.md#tp-02-23`
- [x] Any threshold whose applicability to the declared tax year could not be
      established ships as an `AbsentFigure/v1` and its leg refuses.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-11`
- [x] FR-022-009 through FR-022-011 are implemented: the capped investment-income
      leg, the uncapped wage leg, and tax-exempt interest excluded from both
      quantities while still recorded.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-04`, `report.md#tp-02-05`, `report.md#tp-02-08`
- [x] Known-value boundary coverage exists at, below and above every threshold in
      both sets for every filing status, and each fixture names the source edition
      and tax year it was derived from.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-04`, `report.md#tp-02-05`
- [x] FR-022-012 is implemented: an undeclared basis refuses by name and a
      declared zero computes a real zero, proven by an adversarial case.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-09`
- [x] FR-022-013 and FR-022-014 are implemented: the completeness declaration is
      populated and non-empty, and the conversion asymmetry is a structural member
      proven by an adversarial mutation.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-06`, `report.md#tp-02-07`, `report.md#tp-02-12`
- [x] Both new household values are inventoried, are removed by the clear action,
      and are accounted for by the export sanitizer under the identical rule as
      every income amount: both are kept in the exported workspace the user asked
      for, and the manifest names in `omittedFields[]` every member it withholds,
      so neither can be dropped without being named. Each is proven independently,
      and neither appears in any URL, request, referrer or console message.
  - **Closed:** the wording defect is corrected — the shipped sanitizer KEEPS both,
    matching how it treats the four income amounts, so "redacted" was false as
    written and is replaced by the kept-and-disclosed disposition the design
    intends. The browser clause now has its own persistent title in this scope's
    spec, scanning the address bar, every request URL and body, every request
    header value and every console message and page error against two declared
    amounts, with an in-test negative control proving the scan can name a planted
    value. No leak mutation was applied, because any mutation that would fail this
    row must route a household value off the page.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the TP-02-13 browser title · **Evidence:** `report.md#tp-02-13`
- [x] No module holds a surtax rate, threshold, jurisdiction name or authority
      name, and the detector is proven to fire on a module that does.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-14`
- [x] No output states a probability, a lifetime figure, a track record or an
      error rate, and no result is labelled a complete federal tax.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus a text scan over this scope's allowed paths · **Evidence:** `report.md#claim-boundary`
- [ ] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Open:** TP-02-15, -16, -17 and -18 now carry evidence — the browser spec was
    written and the cumulative suite runs green at 69 passed. TP-02-03, -22, -23
    and -24 still carry none.
  - **Phase:** implement · **Command:** the exact TP-02-01 through TP-02-18 commands · **Evidence:** `report.md#test-evidence`
- [x] Feature 008's files, Feature 021's spec directory, `rltaxstrategy.js`,
      `tests/lifetime-tax-conversion.spec.mjs`, the registries,
      `site-exclusions.json` and every brief or data artifact are byte-identical.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-02-19`, `report.md#tp-02-20`, `report.md#tp-02-21`
