# Scope 2: Net Investment Income Tax And Additional Medicare Tax

## 02-net-investment-income-and-additional-medicare-tax

Planning authority: the [scope index](../_index.md). Execution evidence belongs in
[report.md](report.md).

**Status:** In Progress (deliverables and tests verified; newly added planning rows unverified)
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

**Allowed file families:** the *Allowed new* and *Allowed modified* paths named
above, and nothing else.

**Excluded surfaces:** the byte-identical list named above. Collateral cleanup
outside the allowed families is opt-in and is not performed under this scope.

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

This scope owns nine of the twenty-two entries in the
[supersession ledger](../../spec.md#supersession-ledger) and amends two that Scope
01 delivered. Eight of the nine are this scope's to deliver; the ninth,
SUP-022-18, is recorded **superseded-in-substance** below and is not deliverable
as work. It follows the
[per-scope procedure](../_index.md#assertion-supersession-procedure) for each of
the eight.

| Entry | Target | Shape | Replacement in one line |
| --- | --- | --- | --- |
| SUP-022-03 | `scripts/selftest.mjs` ~L11461 | account | `unsupportedFeatures[]` and `taxLegs[]` are disjoint and jointly exhaustive over Feature 021's eighteen ids, so nothing may disappear from both |
| SUP-022-08 | `tests/lifetime-tax-marginal.spec.mjs` L96 | derive | Label/list agreement, pack-derived contributor set identity, and positive proof that `net-investment-income-tax` moved to a computed leg rather than being deleted |
| SUP-022-10 | `scripts/selftest.mjs` ~L12070 | derive | The engine-side twin of SUP-022-08: pack-derived two-directional contributor-set identity on the shipped curve, plus the moved-versus-deleted clause |
| SUP-022-14 | `scripts/selftest.mjs` ~L11803 | derive | Ordered, two-directional reconciliation leg-set identity against the engine's own declaration, plus the `L6` exclusion clause |
| SUP-022-15 | `tests/lifetime-tax-federal.spec.mjs` L108-111 | derive | A record-derived rendered-row count and a `holds` loop bounded by the rendered rows |
| SUP-022-16 | `tests/lifetime-tax-route.spec.mjs` L80 | derive | The same record-derived row count, in the route spec that owns the Power rendering |
| SUP-022-18 | `scripts/selftest.mjs` ~L12450 | **superseded-in-substance** | Not deliverable by this scope. Every clause it named — `simpleFields.length === 7`, `powerLinkDetails.length === 9`, `powerLinkSections.length === 9` — was displaced first by Feature 023 under `SUP-023-04` and `SUP-023-05`. Row retained; see the disposition below |
| SUP-022-19 | `tests/lifetime-tax-route.spec.mjs` L97 | derive | **Narrowed.** Selection of a withheld-detail link by its declared target instead of by ordinal, replacing the positional `links.nth(3)` focus expectation. The two-directional link/section identity this row also once named was displaced by `SUP-023-06` and is no longer claimed here |
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

**SUP-022-18 — disposition: superseded-in-substance by SUP-023-04 and SUP-023-05.**
SUP-022-18 was written to replace three pinned counts in `scripts/selftest.mjs`
with cross-artifact identity between the closed Simple field list and the rendered
Simple markup. Feature 023 reached those clauses first. A fixed-string search of
the tree returns zero occurrences of `simpleFields.length === 7`,
`powerLinkDetails.length === 9` and `powerLinkSections.length === 9`; the
replacements are present and marked `SUP-023-04` and `SUP-023-05`, and
`SUP-023-04`'s marker states SUP-022-18's ledger replacement almost verbatim,
down to *every Simple-stays-decision-level clause is retained verbatim*. There is
nothing left for this scope to supersede. Attaching a `SUP-022-18` marker to those
regions would attribute one replacement to two features, which is exactly the
double-count the marker discipline exists to prevent, so the row is **not**
delivered and **not** deleted: it stays in the ledger carrying this disposition
and the ids that displaced it. The protection is not lost — a `data-rl-value`
field rendered in Simple outside `SIMPLE_FIELDS` still fails, under `SUP-023-04`,
which Feature 023 owns and which this scope must neither claim nor cite as its own
adversarial evidence. Feature 023's artifacts are read-only here.

**Routed to `bubbles.analyst` and `bubbles.design` — since answered.** The
feature-level ledger row at
[`spec.md#supersession-ledger`](../../spec.md#supersession-ledger) carried no
disposition column when this was written, and `design.md`'s per-file marker
distribution still placed a SUP-022-18 marker in `scripts/selftest.mjs`, which the
disposition forbids. Both were corrected while `TP-05-22` was restated for finding
**F-02-D**: the ledger now carries a `Disposition` column recording
`marker forbidden` for SUP-022-18 with the displacing `SUP-023-04` / `SUP-023-05`
ids, and the design table no longer assigns SUP-022-18 to any file. Neither
artifact is this agent's to edit and neither is edited here.

**SUP-022-19 — narrowed, not displaced.** Its count clause went the same way: the
route spec's `toHaveCount(9)` returns a fixed-string count of zero, replaced under
`SUP-023-06`, which also added the two-directional declared-section identity this
row once named. What survives is the positional focus expectation. Line 97 of
`tests/lifetime-tax-route.spec.mjs` still reads `await links.nth(3).click()`, and
selecting a withheld-detail link by ordinal is exactly the fragility the row was
opened for: reorder the link table and the assertion silently follows a different
detail while still passing. Replacing it with selection by declared target is real,
buildable work this scope owns, so SUP-022-19 stays a deliverable entry narrowed
to that one clause.

**One Simple-view entry, one rule.** SUP-022-19 remains because this scope puts
`SurtaxSummaryLines` and `ConversionAsymmetryLine` in Simple. It may not be used
to relax a Simple-markup clause: its replacement retains the no-`<canvas>`,
no-`<table>`, no-`curveTextEquivalent`, no-`bracketDetail`, no-`ruleLedger` and
field-id token-exclusion clauses **verbatim**. Every Simple surface this scope adds
is a `data-rl-value` field carried in `SIMPLE_FIELDS`, and that carriage is
enforced by `SUP-023-04` rather than by anything this scope delivers.

## Consumer Impact Sweep

This scope adds leg identifiers to the declared leg set and adds workspace
members. Any rename, move or removal of a leg identifier, a workspace member
name or a refusal code reaches the surfaces below, and each surface is swept
before the scope closes.

| Consumer surface | What a rename or removal would break | Sweep proof |
| --- | --- | --- |
| The route's result panels and their anchor ids | A renamed leg leaves a panel rendering an unavailable label instead of a figure | Every leg the pack declares is resolved to a rendered panel in the browser row |
| Deep links and breadcrumb anchors into those panels | A renamed anchor id makes a shared deep link land on nothing | Every anchor the page emits is resolved rather than assumed |
| Sibling scope modules that read the leg set as an API client | A removed leg identifier makes a sibling settlement silently short | The leg-set summation refuses on an unknown leg rather than skipping it |
| Fixture files and the supersession register | A renamed member leaves a fixture asserting an identifier that no longer exists | Every fixture input is re-resolved and an unknown member refuses |
| Documentation, notes and any redirect entry | A renamed identifier leaves a stale reference | A repository-wide stale-reference scan for the old identifier returns zero first-party rows |

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
| TP-02-22 | Supersession conformance | unit | SCN-022-004 … -006 | `scripts/selftest.mjs` | The marker check, derived rather than pinned: every distinct `SUP-022-NN` marker found in the opened files is an id in the feature ledger, which carries twenty-two entries; the delivered marker set equals Scope 01's **twelve** owned ids plus this scope's **eight deliverable** ids — its nine owned less SUP-022-18, which is superseded-in-substance and must therefore carry no marker anywhere in the tree — plus exactly those ids the ledger's own owning-scope column assigns to a later scope and that are already present, read out of the ledger at run time rather than pinned to a literal total, because Scope 03's SUP-022-22 is already delivered and any fixed total goes stale the next time a scope lands; each marked region names its shape; and no assertion changed without a marker | `node scripts/selftest.mjs` | No | `report.md#tp-02-22` |
| TP-02-23 | Supersession adversarial | unit | SCN-022-004 | `scripts/selftest.mjs` | Regression: an implementation that removes `net-investment-income-tax` from the unavailable-contributor set without declaring a computed leg is demonstrated to fail SUP-022-08's and SUP-022-10's moved-versus-deleted clauses, one that lists the id in both `unsupportedFeatures[]` and `taxLegs[]` is demonstrated to fail SUP-022-03's disjointness clause, and one whose route spec selects a withheld-detail link by ordinal rather than by its declared target is demonstrated to fail SUP-022-19's narrowed declared-target clause, asserted over the route spec's own source text as the SUP-023-06 checks in this file already are. The fourth case is **removed, not gated**: it turned on SUP-022-18's cross-artifact identity, and per SUP-022-18's disposition that clause will never exist under a `SUP-022` marker, so a gate would leave a case that can never fire. The mutation it named — a `data-rl-value` field rendered in Simple outside `SIMPLE_FIELDS` — stays caught by `SUP-023-04`, which Feature 023 owns and which this row must not cite as this scope's evidence | `node scripts/selftest.mjs` | No | `report.md#tp-02-23` |
| TP-02-24 | Fixture register | unit | SCN-022-004 … -006 | `scripts/selftest.mjs` | Every helper named in the Fixture Input Completion Register declares both bases at `0` and changed no other input member; at least one fixture household keeps both bases `null` and is proven to receive `RLTAX-INPUT-INCOMPLETE` on each leg and on the total; and every previously settled Feature 021 fixture value is byte-identical after completion | `node scripts/selftest.mjs` | No | `report.md#tp-02-24` |

### Definition of Done

- [x] Scenario-specific E2E regression tests for EVERY new/changed/fixed behavior in SCN-022-004, SCN-022-005 and SCN-022-006 pass under the exact persistent titles this scope's Test Plan names, and each of those titles is present in the spec file rather than merely selected by `--grep`. Adversarial case: renaming or deleting one of those persistent titles must fail this row, so an empty grep selection can never be read as a pass.
- [x] Broader E2E regression suite passes across the whole lifetime-tax browser family, not this scope's own spec file alone. Adversarial case: a change made inside this scope that reddens a sibling scope's persistent title must fail this row even while this scope's own rows stay green.
- [x] Change Boundary is respected and zero excluded file families were changed, proven by a path-scoped `git status --porcelain` over the excluded surfaces plus an mtime comparison for any untracked excluded directory. Adversarial case: touching one excluded path must produce a row and fail this item; `git diff --quiet` alone is not accepted, because it reports an untracked path as unchanged.
- [x] The Consumer Impact Sweep is complete for every renamed, moved or removed route, path, contract, identifier and UI target in this scope, and zero stale first-party references remain. Adversarial case: one stale reference left in navigation, a breadcrumb, a redirect, a deep link, an API client read or a doc must fail this row, and the proof must be a repository-wide stale-reference scan rather than a spot check.

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
- [x] This scope's eight deliverable supersessions and both amendments are
      delivered: SUP-022-03, -08, -10, -14, -15, -16, -19 and -20 each replaced by
      the stronger assertion the ledger names, each seen to fail against the
      unchanged implementation first, each carrying its `SUP-022-NN` marker and its
      adversarial evidence; SUP-022-04's spot checks updated and SUP-022-09's
      derived count confirmed to follow the pack. The ninth owned entry,
      SUP-022-18, is **not** among them: it is recorded superseded-in-substance and
      must carry no marker anywhere. SUP-022-19 counts only once its **narrowed**
      clause is delivered — selection of a withheld-detail link by declared target
      replacing the positional `links.nth(3)` — not by any count assertion, which
      `SUP-023-06` already owns.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` plus the per-spec browser commands · **Evidence:** `report.md#the-seven-re-derived-intended-reds--one-per-deliverable-marker`, `report.md#supersession-ledger`, `report.md#tp-02-23`
  - **Closed 2026-08-20 (fifth pass).** The fourth pass named exactly two
    unmeasured conjuncts and refused to absorb them; both are now measured. All
    eight markers are present and `SUP-022-18` appears nowhere, which TP-02-22
    reports as `delivered 21, expected 21, shapeless [], escaped []`. The
    **seen-to-fail** conjunct is re-derived for all seven entries the fourth pass
    did not claim — one `scripts/red-green-probe.sh` block each, with
    `--summary-match` bound to the owning assertion's own name so the RED line
    names what fell. Three of the seven are deliberately **count-preserving**,
    because those entries superseded literal counts and a probe that changed the
    count would have proven nothing about the replacement. The
    **adversarial-evidence** conjunct is accounted for entry by entry in a table
    rather than asserted in aggregate: five carry in-suite assertions, two carry
    an executed probe, and the reason the two rendered-count entries take the
    probe form is stated rather than glossed. A mis-aimed first probe that
    discriminated on exit while its named assertion stayed green in both runs is
    recorded with its correction.
  - *History retained.* **Open — requirement text corrected for finding F-02-C; awaiting delivery.**
    The earlier blocker note is superseded twice over: the Simple/Power panels
    being built was never the whole story, and neither was calling SUP-022-18
    simply undeliverable. Every clause SUP-022-18 and SUP-022-19 were written to
    supersede has been displaced by **Feature 023**, under Feature 023's markers.
    `simpleFields.length === 7`, `powerLinkDetails.length === 9`,
    `powerLinkSections.length === 9` and the route spec's `toHaveCount(9)` each
    return a fixed-string count of zero; the replacements are present and marked
    `SUP-023-04`, `SUP-023-05` and `SUP-023-06`, and `SUP-023-04`'s marker states
    SUP-022-18's ledger replacement almost verbatim. **Correction taken.**
    SUP-022-18 is recorded superseded-in-substance in the
    [ledger disposition](#assertion-supersession-owned-by-this-scope) rather than
    claimed as this scope's to deliver, because attaching a `SUP-022-18` marker to
    those regions would attribute one replacement to two features; the row is
    retained, not deleted, and cites the displacing ids. SUP-022-19 is narrowed to
    its surviving clause: the positional `links.nth(3)` focus expectation is still
    live at line 97 of `tests/lifetime-tax-route.spec.mjs`, so selection by
    declared target is real, buildable work. This item stays open because the eight
    deliverable replacements are not yet written; nothing here ticks it.
  - **Still open after verification pass 2026-08-20 (third) — finding F-02-D.**
    SUP-022-19's narrowed clause was built and proven in that pass: intended RED on a
    value-free retarget of the bracket-detail row, same-command GREEN after an
    immediate revert, and a control showing the replacement survives a row insertion
    the superseded ordinal does not. It was then **reverted**, because delivering its
    marker drops `node scripts/selftest.mjs` from 3155 passed to 3154 passed and 1
    failed: Scope 05's TP-05-22 pins the tolerated marker gap as the exact pair
    `{18, 19}` and compares it with `JSON.stringify`, so a delivered SUP-022-19
    breaks it. The remedy is a one-line tightening of that literal to `{18}` —
    strictly stronger than what stands — but it edits an assertion Scope 05 owns,
    which the sibling no-edit DoD item forbids without a recorded amendment, and no
    such amendment exists. Seven of the eight markers are present in the tree;
    SUP-022-19 is absent and `SUP-022-18` correctly appears nowhere. Seven of eight
    cannot tick this item, and the further requirement that each of the eight was
    seen to fail first and carries its adversarial evidence was not re-derived for
    the seven and is not claimed. Decidable once `bubbles.plan` either records the
    TP-05-22 amendment in the ledger's `Amending scope` column or restates TP-05-22
    to derive its tolerated gap from the ledger's disposition column instead of
    pinning a literal pair.
  - **Still open after delivery pass 2026-08-20 (fourth) — F-02-D is closed but two
    conjuncts of this item are not.** The blocker named above is gone: `bubbles.plan`
    restated TP-05-22 to derive, the derived form is in `scripts/selftest.mjs`, and
    `SUP-022-19` was then delivered with an intended RED, a same-command GREEN and a
    row-insertion control. **All eight deliverable markers are now present** — 03 and
    10, 14, 20 in `scripts/selftest.mjs`, 08 in the marginal spec, 15 in the federal
    spec, 16 and 19 in the route spec — both amendments are present (04 in
    `scripts/selftest.mjs`, 09 in the foundation spec), and `SUP-022-18` still appears
    nowhere, which its disposition requires. `node scripts/selftest.mjs` is `3155
    passed, 0 failed`. What still blocks the tick is the rest of the same sentence,
    and it is stated rather than absorbed. First, **"each seen to fail against the
    unchanged implementation first"** was re-derived in this pass for `SUP-022-19`
    only; it was not re-derived for the other seven and is not claimed for them.
    Second, **"each carrying … its adversarial evidence"** does not hold uniformly:
    a census of the five opened files finds an explicit adversarial block for 03, 14
    and 20, and none for 08, 10, 15, 16 or 19, and the case-insensitive sweep for
    adversarial reasoning finds zero occurrences in the federal and marginal specs.
    Ticking on the marker census alone would claim two conjuncts that were never
    measured. Decidable by re-deriving the seven intended REDs and supplying the
    missing adversarial cases for the entries that carry none.
  - *Superseded evidence pointers, retained for audit:* `report.md#supersession-ledger`, `report.md#verification-pass--2026-08-20-second--sup-022-18-and--19-were-displaced-by-feature-023-before-this-scope-could-deliver-them-finding-f-02-c`, `report.md#verification-pass--2026-08-20-third--sup-022-19s-narrowed-clause-is-buildable-and-was-built-but-delivering-it-turns-scope-05s-tp-05-22-red-all-three-items-stay---finding-f-02-d`
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
- [x] No assertion outside this scope's ledger entries and amendments was edited,
      relaxed or deleted, no Simple-markup clause was relaxed under SUP-022-19, no
      `SUP-022-18` marker was attached anywhere, and no sourcing rule, tolerance,
      determinism, privacy, zero-network or Feature 008 canary was touched.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-22`, `report.md#tp-02-23`, `report.md#the-no-edit-property-derived-from-history-rather-than-asserted`
  - **Closed 2026-08-20 (fifth pass).** The two proving rows the item's own closing
    sentence asked for are written and green — TP-02-22 reports `delivered 21,
    expected 21, shapeless [], escaped []` and TP-02-23 discriminates all three of
    its cases — and the no-edit property itself is now **derived from history
    rather than asserted by the author**, which is the shape the item's fourth-pass
    note refused. This scope's whole source footprint is three commits; their
    combined deletion set is sixteen lines, each attributed individually: one
    comment header completed inside the marked region this scope owns, thirteen
    inside the TP-05-22 block `bubbles.plan` restated under a recorded amendment,
    and two that are exactly SUP-022-19's superseded target. `SUP-022-18` appears
    nowhere, which TP-02-22's `escaped []` and TP-05-22's `forbiddenButMarked`
    clause both fail on. A first-draft misattribution of two federal-spec deletions
    is recorded with the evidence rather than corrected in silence.
  - *History retained.* **Open (first pass):** nothing was edited, but the TP-02-22
    and TP-02-23 conformance rows
    that would prove it were not written. Both rows are now reconciled against the
    tree — TP-02-22 derives its expected marker set from the ledger instead of
    pinning a stale total, and TP-02-23's fourth case is retargeted onto
    SUP-022-19's narrowed clause — so what remains is writing them.
  - **Still open after verification pass 2026-08-20 (third) — finding F-02-D.** The
    no-edit property itself holds against the tree: this session left no change to
    `scripts/selftest.mjs` or to any Feature 021 spec. What blocks the tick is that
    both proving rows now depend on SUP-022-19, which is not delivered. TP-02-22's
    expected set is Scope 01's twelve plus this scope's eight deliverable ids plus
    later-scope ids already present — twenty-one — while the delivered set is twenty,
    so the row as corrected would fail on the missing marker rather than on anything
    it exists to catch. TP-02-23's third case asserts SUP-022-19's narrowed
    declared-target clause over the route spec's own source text, which cannot be
    asserted while that clause is absent. Writing either row first would bank a row
    that fails for a reason it does not name.
  - **Still open after delivery pass 2026-08-20 (fourth) — the dependency is gone,
    the rows are not written.** `SUP-022-19` is delivered, so the reason both rows
    were unwritable no longer applies: TP-02-22's derived expected set now matches
    the twenty markers actually in the tree, and TP-02-23's third case now has a
    delivered declared-target clause to assert over the route spec's source text.
    The no-edit property itself continues to hold against the tree — this pass
    changed exactly one region of `scripts/selftest.mjs`, the TP-05-22 block that
    `bubbles.plan` routed, and it carries that routing; the only other source change
    is the marked `SUP-022-19` region in the route spec. Neither row has been
    written, and an unwritten row proves nothing, so the item stays `[ ]`. It is not
    ticked on the delivery alone, because the item's own words ask for the
    conformance rows and not for the absence of edits by assertion of the author.
  - **Phase:** implement · **Command:** `node scripts/selftest.mjs` · **Evidence:** `report.md#tp-02-22`, `report.md#tp-02-23`, `report.md#verification-pass--2026-08-20-third--sup-022-19s-narrowed-clause-is-buildable-and-was-built-but-delivering-it-turns-scope-05s-tp-05-22-red-all-three-items-stay---finding-f-02-d`
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
- [x] Every Test Plan row has intended RED and same-command GREEN evidence
      recorded, including the browser rows.
  - **Phase:** implement · **Command:** the exact TP-02-01 through TP-02-24 commands · **Evidence:** `report.md#test-evidence`, `report.md#tp-02-18-completed-to-intended-red--the-cumulative-sweep-probed-once`, `report.md#every-test-plan-row-now-carries-intended-red-and-same-command-green`
  - **Closed 2026-08-21.** The last row without a pair was TP-02-18, the cumulative
    `SCN-02[1-4]` sweep, now probed through `scripts/red-green-probe.sh` rather than
    described: the threshold defect fells exactly one owned scenario inside the
    sweep, `76 passed` red against `77 passed` green, exit 1 against exit 0, revert
    verified against the committed blob hash. Both channels were compared because
    this suite has previously exited non-zero on a teardown fault with every test
    passing. All twenty-four rows now carry a pair. TP-02-13 carries an in-test
    negative control plus two real failing runs instead of a source mutation,
    because any mutation able to fail it must itself route a household value off
    the page — that reasoning is recorded, not assumed.
  - **Superseded notes.** TP-02-22 and -23 were unblocked when SUP-022-19 landed,
    and TP-02-03's section now records the compatibility comparison against the
    unmodified Feature 021 pack as performed, with its own RED and GREEN.
- [x] Feature 008's files, Feature 021's spec directory, `rltaxstrategy.js`,
      `tests/lifetime-tax-conversion.spec.mjs`, the registries,
      `site-exclusions.json` and every brief or data artifact are byte-identical.
  - **Phase:** implement · **Command:** a path-scoped status check over the excluded list · **Evidence:** `report.md#change-boundary`
- [x] `node scripts/selftest.mjs` is green with no fall in pass count and no
      existing assertion edited, `node scripts/validate-spec-test-paths.mjs`
      reports zero new missing paths, and `node scripts/build-pages-site.mjs
      --dry-run` succeeds.
  - **Phase:** implement · **Command:** all three commands · **Evidence:** `report.md#tp-02-19`, `report.md#tp-02-20`, `report.md#tp-02-21`
