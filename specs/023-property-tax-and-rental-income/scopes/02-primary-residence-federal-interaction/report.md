# Scope 2 Execution Report — Primary Residence Federal Interaction

This file is the evidence surface for scope 2. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

The itemized deduction stopped being a declared amount and became a composition.
`DeductionComponent/v1` and `ItemizedComposition/v1` landed in `rltaxrules.js`,
stage `CO-18` and `composeItemizedDeduction` landed in `rltax.js`, the mortgage
declarations landed in `rltaxworkspace.js`, and the federal pack gained a sourced
state-and-local-tax cap, a mortgage acquisition-debt limit set, and a declared tie
policy, while losing its `'state-and-local-tax'` unsupported entry.

Two figures were sought. The cap was retrieved and ships as a figure. The mortgage
acquisition-debt limits were **not** retrievable for this pack's declared year and
ship as two `AbsentFigure/v1` records, so the mortgage component refuses rather
than deducting declared interest in full. See [Sourcing](#sourcing).

One defect was fixed on entry: the Scope 02 selftest group called
`createTaxHash('sha256')`, an identifier declared inside a different `try` block,
so the group threw at TP-02-12 and every assertion after it never ran. It now
calls `createDeductionHash`, the helper this block actually declares.

All fourteen DoD items are now checked. The two that had been left unchecked both
depended on `lifetime-tax-deduction.spec.mjs` under `tests/`, this scope's own
Playwright spec, which did not exist in the tree. It was created in a follow-up
session carrying four tests; its rows TP-02-18 through TP-02-21 and the cumulative
selector TP-02-22 have intended-RED and same-command GREEN evidence recorded
below.

## Sourcing

Both retrievals were performed in this implementation session and both figures
were verified digit by digit against the retrieved text.

### BI-3 — the state and local tax deduction cap — RETRIEVED

- **Title:** Publication 505 (2026), Tax Withholding and Estimated Tax
- **URL:** `https://www.irs.gov/publications/p505`
- **Publisher:** Internal Revenue Service
- **retrievedAt:** `2026-08-17T19:03:51.000Z` (pack record `irs-p505-2026`),
  re-retrieved and re-verified in this session on 2026-08-17
- **Title-block year:** the document header reads **"For use in 2026"**, which is
  what establishes the declared year for the figure transcribed from it
- **Locator:** Reminders → *State and local tax deduction increased*
- **Retrieval outcome:** `retrieved`

Clause as retrieved, verbatim:

> **State and local tax deduction increased.** The overall limit on the deduction
> for state and local income, sales, and property taxes has increased. For 2026,
> the limit is $40,400 ($20,200 if married filing separately) and the overall
> limit is reduced if your modified adjusted gross income is more than $505,000
> ($252,500 if married filing separately) but will not be reduced below $10,000
> ($5,000 if married filing separately). For more information, see the
> Instructions for Schedule A (Form 1040).

A second, independent statement of the same figure appears in the same retrieved
publication, at *Instructions for the 2026 Annualized Estimated Tax Worksheet*,
Line 4:

> Be sure to consider deduction limits figured on Schedule A (Form 1040), such as
> the $40,400 ($20,200 for married individuals filing separately) limit on state
> and local taxes.

Transcription into `tax-rules/federal/2026.json` → `deductionCaps`, digit checked
against both statements:

| Pack member | Filing status | Pack value | Authority |
| --- | --- | --- | --- |
| `amounts` | `single` | `40400` | "the limit is $40,400" |
| `amounts` | `married-filing-jointly` | `40400` | same; MFS named as the only different amount |
| `amounts` | `head-of-household` | `40400` | same |
| `amounts` | `married-filing-separately` | `20200` | "($20,200 if married filing separately)" |
| `reductionThresholds` | `single` / `mfj` / `hoh` | `505000` | "more than $505,000" |
| `reductionThresholds` | `married-filing-separately` | `252500` | "($252,500 if married filing separately)" |
| `reductionFloors` | `single` / `mfj` / `hoh` | `10000` | "not be reduced below $10,000" |
| `reductionFloors` | `married-filing-separately` | `5000` | "($5,000 if married filing separately)" |
| `reductionRate` | all | **`AbsentFigure/v1`** | the clause states *that* the cap is reduced and states the floor, but **never states the rate** |

The reduction rate is the honest gap. Publication 505 refers the reader onward to
the Instructions for Schedule A (Form 1040) for the mechanics, and that instruction
was not retrieved in this session. The rate is therefore not derived from the
threshold and the floor — deriving it would be inventing it. A household above the
threshold receives `RLTAX-THRESHOLD-UNAVAILABLE` rather than an unreduced cap the
authority contradicts or a reduced one this pack made up. TP-02-12b pins exactly
that boundary.

### BI-4 — the mortgage acquisition-debt limit and its predecessor tier — NOT RETRIEVED

- **Title sought:** Publication 936, Home Mortgage Interest Deduction, edition for
  tax year 2026
- **URL:** `https://www.irs.gov/publications/p936`
- **retrievedAt:** 2026-08-17, this session
- **Retrieval outcome:** `unretrievable-for-declared-year`

The URL served a document whose title block reads, verbatim:

> # Publication 936 (2025), Home Mortgage Interest Deduction
>
> **For use in preparing 2025 Returns**

Its limits are stated for that year and are scoped to it in the text itself:

> Mortgages you (or your spouse if married filing a joint return) took out after
> October 13, 1987, and prior to December 16, 2017 … but only if **throughout 2025**
> these mortgages plus any grandfathered debt totaled $1 million or less ($500,000
> or less if married filing separately).
>
> Mortgages you … took out after December 15, 2017 … but only if **throughout 2025**
> these mortgages plus any grandfathered debt totaled $750,000 or less ($375,000 or
> less if married filing separately).

This pack declares 2026 effective. The Sourcing Directive forbids carrying a figure
from another tax year, and it does not matter that the 2025 figures are the ones a
reader might expect — an expectation is not a retrieval. **No acquisition-debt
limit was transcribed.** Both tiers ship as `AbsentFigure/v1`:

| Tier | Contract | Code |
| --- | --- | --- |
| `acquisition-debt-current` | `AbsentFigure/v1` | `RLTAX-THRESHOLD-UNAVAILABLE` |
| `acquisition-debt-predecessor` | `AbsentFigure/v1` | `RLTAX-THRESHOLD-UNAVAILABLE` |

Each carries `reason`, `whatWouldMakeItAvailable` and a `missingSource` pointer
naming the edition that would close it, and neither smuggles a numeric member
beside the absence. The consequence is a refusal, verified at
[TP-02-07](#tp-02-07): a household declaring mortgage interest and a debt balance
against the **shipped** pack receives `RLTAX-THRESHOLD-UNAVAILABLE`, no component
is published, no numeric itemized total is published, and no applied deduction is
published in its place.

TP-02-06's boundary arithmetic runs against a **fixture** pack whose tier limits
are the implementer's own invented figures. That fixture can never resolve for a
real return, and the selftest says so at the point of construction. It exercises
the arithmetic; it is not a source and it is not shipped.

### Pre-existing pack figures unchanged

[TP-02-12](#tp-02-12) proves the additions are additive: stripping `deductionCaps`,
`mortgageDebtLimits` and `deductionChoicePolicy` and restoring the removed
`'state-and-local-tax'` unsupported entry reproduces the pre-feature content digest
`sha256:e102f09087d48a9bb8482aaf3a396a49e78e0e74811f59fa089eb77df3b970bd` byte for
byte, so no pre-existing figure moved.

## Test Evidence

The whole-repository command below was executed once and every unit row in this
section is an assertion inside it. Its exit code and totals:

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 2653 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

Group output, unfiltered:

```
lifetime-tax — itemized composition and the capped deduction
  ✓ TP-02-01: a household that declared only the previous lump sum reaches its exact prior deduction under the composed shape, carried as one named component with its origin recorded, and the side applied is still the larger of the two totals
  ✓ TP-02-02: DeductionComponent/v1 refuses a missing origin and a missing disallowed amount, refuses a split that does not add back to the component amount, and ItemizedComposition/v1 refuses a cap binding or a chosen side outside its closed set
  ✓ TP-02-03: below, exactly at and above the sourced cap the itemised total, the binding and every component’s disallowed amount are exact, the disallowed amounts sum to the excess, the allowed amounts sum to the cap, and each capped component names the sibling it competes with
  ✓ TP-02-04: an implementation zeroing every disallowed amount fails the excess-sum assertion and fails the component contract, so the amount that bought nothing cannot be hidden behind a correct-looking allowed total
  ✓ TP-02-05: an unretrieved cap produces an unavailable binding, an unavailable chosen side and a refused itemised total, and no applied deduction is published in its place
  ✓ TP-02-06: with the declared balance below, exactly at and above the sourced acquisition-debt limit the deductible and disallowed portions are exact, and the declared predecessor tier reaches its own higher limit rather than the current one
  ✓ TP-02-07: an unretrieved acquisition-debt limit refuses the mortgage component on the shipped pack with no numeric member smuggled beside the absence, and mortgage interest declared without a tier refuses as a missing declaration rather than as a missing rule
  ✓ TP-02-08: with the limit absent no component, no numeric itemised total and no applied deduction is published, so an implementation deducting the declared interest in full fails here
  ✓ TP-02-09: below, exactly at and above the sourced standard deduction the chosen side is correct at each point, the tie follows the pack’s declared rule rather than an engine preference, and a household whose itemised total falls below the standard deduction is told its capped components changed nothing
  ✓ TP-02-10: a workspace member expressing a preferred deduction side is refused, the member is outside the closed workspace field set, and the settlement engine holds no reference to one, so the decision cannot be read from a declared flag
  ✓ TP-02-11: the state and local tax id is absent from unsupportedFeatures[] and present as the capped component family the pack’s own cap declares, and the unsupported set, the leg set and the component set are pairwise disjoint
  ✓ TP-02-12: the cap cites exactly one retrieved record with a locator, its filing-status variation names married filing separately as the only different amount, the reduction rate it could not establish ships absent, and stripping this scope’s pack additions reproduces the pre-feature content digest byte for byte
  ✓ TP-02-12b: at the reduction threshold the stated cap applies unchanged, and one dollar above it the composition refuses rather than publishing an unreduced cap the authority contradicts or a reduced one this pack invented
  ✓ TP-02-13: the itemised composition and the recomputed decision appear in the headline, the comparison, the curve contributors and the export, in both directions, against a fixture in which both elements are present and distinct
  ✓ TP-02-14: removing the recomputed decision from each of the four surfaces in turn fails the identity and each failure names the missing element
  ✓ TP-02-15: the refusal vocabulary member count equals its pre-feature value and every code the deduction composition raises is an existing member
  ✓ TP-02-16: every mortgage declaration is a declared workspace member, is omitted by the export sanitiser and listed in omittedFields, is described by the storage inventory, and the declared balance does not survive an export: 
  ✓ TP-02-17: every supersession this scope owns carries its marker in the file the per-file distribution places it in, the pack-derived and page-derived replacements are present, and the two-set accounting the three-set accounting replaced does not survive: 
  ✓ TP-02-CLAIM: nothing the deduction composition emits states a probability, a lifetime figure, a track record, an error rate or an estimate, and the detector is proven to fire on a sentence that does
```

### Intended RED on entry

The group did not run to completion before this scope's first edit. Its recorded
failure, verbatim:

```
✗ FAIL (Feature 023 Scope 02 deduction group threw): createTaxHash is not defined
Research-Lab self-test: 2645 passed, 1 failed
```

`createTaxHash` is declared at `scripts/selftest.mjs` L11924 inside a different
`try` block and is not in scope at the TP-02-12 call site, so every assertion from
TP-02-12 onward was unreachable. Repointing the call to `createDeductionHash`,
which this block declares at its head, took the group from 2645/1 to 2653/0 — the
eight-assertion difference is exactly the tail that had never executed.

### TP-02-01

Every prior-feature fixture produces its exact prior federal total under the
composed shape holding only the previously-declared amount.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-01` above.

### TP-02-02

The component and composition contracts refuse a missing origin, a missing
disallowed amount, and a binding or chosen side outside its closed set.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-02` above.

### TP-02-03

The itemized total, the binding and every disallowed amount are exact below,
exactly at and above the sourced cap, and the disallowed amounts sum to the excess.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-03` above.

### TP-02-04

An implementation zeroing a disallowed amount is proven to fail the excess-sum
assertion.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-04` above.

### TP-02-05

An absent cap produces an unavailable binding and an unavailable chosen side, and
the standard deduction is not chosen in its place.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-05` above.

### TP-02-06

The deductible and disallowed mortgage portions are exact below, exactly at and
above the debt limit, against the fixture pack described in [Sourcing](#sourcing).
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-06` above.

### TP-02-07

An unretrieved debt limit refuses the mortgage component on the **shipped** pack.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-07` above.

### TP-02-08

An implementation deducting the full declared interest when the limit is absent is
proven to fail.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-08` above.

### TP-02-09

The chosen side is correct below, exactly at and above the sourced standard
deduction, and the tie resolves the way the pack declares.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-09` above.

### TP-02-10

A workspace member expressing a preferred side is refused, and an implementation
reading such a flag is proven to fail the recomputation assertion.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-10` above.

### TP-02-11

The accounting between the unsupported set and the composition's component ids is
disjoint and exhaustive, and the state and local tax id is proven present as a
component.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-11` above.

### TP-02-12

The cap resolves to exactly one retrieved source with a locator, and every
pre-existing federal pack figure is byte-identical.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-12` and
`✓ TP-02-12b` above.

### TP-02-13

The composition and the decision appear in all four surfaces in both directions on
the all-non-zero fixture.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-13` above.

### TP-02-14

Removing the composition from each of the four surfaces in turn fails the
leg-visibility identity with the missing element named.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-14` above.

### TP-02-15

The refusal vocabulary member count equals its pre-feature value.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-15` above.

### TP-02-16

The mortgage declarations are inventoried, cleared, redacted, and absent from every
URL, request, referrer and console message.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-16` above.

### TP-02-17

Every supersession this scope owns carries its marker in the file the per-file
distribution places it in.
Command: `node scripts/selftest.mjs` · Exit `0` · Result: `✓ TP-02-17` above.

This row was the last to go green. Its recorded intermediate failure, after the
`createDeductionHash` fix but before SUP-023-02 and SUP-023-03 were written:

```
✗ FAIL: TP-02-17: every supersession this scope owns carries its marker in the file the per-file distribution places it in, the pack-derived and page-derived replacements are present, and the two-set accounting the three-set accounting replaced does not survive: SUP-023-02, SUP-023-03
Research-Lab self-test: 2652 passed, 1 failed
```

### Scenario SCN-023-004

Row TP-02-18, `Regression: SCN-023-004 property tax and state income tax compete
inside one cap and the disallowed amounts are shown`, in
`tests/lifetime-tax-deduction.spec.mjs`. It drives the real route in three states:
the cap bound, the cap unbound, and the cap absent. Every figure it compares
against is read from the served pack rather than restated, and the component's
allowed and disallowed halves are read back from the rendered row so the identity
`allowed + disallowed = amount` is asserted against what a reader actually sees.

**Observation recorded, not a defect.** The pack's cap declares a family of two,
`state-income-tax` and `property-tax`, which is what proves FR-023-013's id moved
out of `unsupportedFeatures[]` rather than vanishing. This scope's settlement
computes no state income tax — the route supplies that member as undefined — so the
apportionment runs over the one member that computed and the rendered component
names no sibling. The spec asserts that as the fact it is. A component naming an
uncomputed sibling would be claiming a competition that did not happen.

Intended RED and same-command GREEN are recorded together at
[TP-02-21](#tp-02-21), because all four browser rows share one command.

### Scenario SCN-023-005

Row TP-02-19, `Regression: SCN-023-005 mortgage interest is limited by a sourced
debt limit and the disallowed portion is named`. Its first half runs against the
**shipped** pack, which ships both acquisition-debt tiers absent, and proves the
component refuses with the tier's own domain, names Publication 936 and its missing
source, publishes no component row, and shows neither the declared interest nor a
zero in its place. Its second half serves a pack whose tiers carry limits and
proves the deductible portion is computed from the limit, the disallowed portion is
named beside it, the declared tier is the one applied rather than the higher one,
and interest declared without a tier refuses as a missing declaration rather than
as a missing rule.

The served pack's `contentSha256` is recomputed from the served bytes through
`RULES.packContentDigestInput`, so the page performs its real pack-integrity check
against the fixture rather than having that check disabled for it.

### Scenario SCN-023-006

Row TP-02-20, `Regression: SCN-023-006 the itemized versus standard decision is
recomputed and the chosen side is named`. The decisive assertion is that a
household declaring the **standard** mode while its itemised total sits above the
standard deduction is still shown the itemised side: an implementation reading the
declared mode flag fails there. Both totals are read from the decision table, the
standard deduction is compared against the pack's declared amount, the
below-standard case asserts the household is told its components changed nothing,
and the tie is asserted against `deductionChoicePolicy.onTie` rather than against a
fixed side.

### TP-02-21

Row TP-02-21, `Regression: SCN-023-006 the composition and the decision reach the
headline, the comparison, the curve and the export`. It runs the two-directional
leg set identity over the four surfaces on the all-non-zero fixture **while the
composition and the decision are in force**, so a composed deduction that dropped a
leg from any surface fails by name rather than as a numeric mismatch. It also
asserts the export omits every property and mortgage declaration and does not carry
the distinctive assessed value.

Intended RED for all four browser rows. The composition depends on the pack's
`deductionCaps` member; withholding it at its source leaves the route with no
component list to find, which is exactly the state this scope's Scenario-First
Red/Green Contract names. Every server in the spec was temporarily pointed at a
served pack with that member deleted, nothing else changed, same command:

```
$ npx --no-install playwright test tests/lifetime-tax-deduction.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line

Running 4 tests using 1 worker
  1) [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:113:1 › Regression: SCN-023-004 property tax and state income tax compete inside one cap and the disallowed amounts are shown

    Test timeout of 30000ms exceeded.

    Error: locator.textContent: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('#deductionCompositionBody tr').filter({ has: locator('td[data-rl-disallowed="property-tax"]') }).first().locator('td[data-rl-disallowed="property-tax"] [data-rl-value]')

  2) [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:243:1 › Regression: SCN-023-005 mortgage interest is limited by a sourced debt limit and the disallowed portion is named

    Error: expect(locator).toHaveAttribute(expected) failed

    Locator:  locator('#deductionRefusal [data-rl-unavailable]')
    Expected: "deduction-component:mortgage-interest:acquisition-debt-current"
    Received: "deduction-cap:state-and-local-tax"

  3) [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:337:1 › Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 21100
    Received: 0

  4) [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:391:1 › Regression: SCN-023-006 the composition and the decision reach the headline, the comparison, the curve and the export

    Test timeout of 30000ms exceeded.

    Error: locator.textContent: Test timeout of 30000ms exceeded.
    Call log:
      - waiting for locator('#deductionCompositionBody tr').filter({ has: locator('td[data-rl-disallowed="property-tax"]') }).first().locator('td[data-rl-disallowed="property-tax"] [data-rl-value]')

  4 failed
RED_EXIT=1
```

Same command, with the withholding reverted and nothing else changed:

```
$ npx --no-install playwright test tests/lifetime-tax-deduction.spec.mjs --config=playwright.config.mjs --project=system-chrome --reporter=line

Running 4 tests using 1 worker
  4 passed (3.7s)
GREEN_EXIT=0
```

### TP-02-22

Run as specified. The `--grep "SCN-02"` cumulative selector now resolves over both
of this feature's browser specs as well as the prior features':

```
$ npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=line

Running 25 tests using 6 workers
  25 passed (7.7s)
TP0222_EXIT=0
```

The named seven-file form of the same surface:

```
$ npx playwright test tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-deduction.spec.mjs --project=system-chrome --reporter=line

Running 25 tests using 6 workers
  25 passed (7.7s)
CUMULATIVE_EXIT=0
```

`--project=system-chrome` is used because the bundled Chromium binary is absent in
this environment. That is an environment gap, not a defect, and the system browser
exercises the same route.

The earlier 16-test, five-spec run recorded against this row before this feature's
browser specs existed remains true of that command; it is superseded here by the
cumulative selector the row actually names.

### TP-02-23

The whole-repository suite is green and the pass count rose rather than fell:
2645 passing with one failure on entry, 2653 passing with zero failures now.
Command: `node scripts/selftest.mjs` · Exit `0`.

### TP-02-24

Zero new missing spec-referenced test paths, with the baseline file unmodified.

```
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=602 references=13509 distinctPaths=227 missingPaths=71 baseline=77 new=0 stale=6
  STALE-BASELINE: 6 baseline entries are no longer missing — remove from scripts/validate-spec-test-paths.baseline:
      tests/causal-rotation-adversarial.spec.mjs
      tests/causal-rotation-brief.spec.mjs
      tests/causal-rotation-consumers.spec.mjs
      tests/causal-rotation-delivery.spec.mjs
      tests/causal-rotation-pages.spec.mjs
      tests/causal-rotation-registry.spec.mjs
[spec-test-paths] OK — no new missing test path(s) (6 stale baseline entries to remove)
PATHS_EXIT=0
```

`new=0` is the gate this row asserts. The six stale entries are pre-existing and
belong to the `causal-rotation` neighbours, not to this scope;
`scripts/validate-spec-test-paths.baseline` is on this scope's excluded list and
was not touched.

### TP-02-25

The Pages plan succeeds and `site-exclusions.json` carries no scope-02 change.

```
$ node scripts/build-pages-site.mjs --dry-run
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":9,"rootFiles":111,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/9bb69175f356c240125ee2384f73de8633483fa9b283895c85e3e89fccc66af6","omittedOrphanIndexes":136}
BUILD_EXIT=0
```

## Supersession Ledger

This scope owns five entries: the four it was assigned plus one admitted in flight.

### SUP-023-01 — delivered (Scope 02, `scripts/selftest.mjs`)

Superseded clause: `requiredUnsupportedIds` contains `'state-and-local-tax'`.
Replacement shape: `derive`. The three-set accounting between `unsupportedFeatures[]`,
the declared leg set and the composition's component ids proves the id **moved**
rather than vanished. Green at [TP-02-11](#tp-02-11) and [TP-02-17](#tp-02-17).

### SUP-023-02 — delivered (Scope 02, `tests/lifetime-tax-conversion.spec.mjs`)

Superseded clause, verbatim as it stood before this scope:

```js
  /* All eight entries sit in Simple at the same prominence as the figure itself. */
  const summary = page.locator('#notModeledSummary li');
  await expect(summary).toHaveCount(8);
  const summaryText = await summary.evaluateAll((nodes) => nodes.map((node) => node.textContent));
  ['State and local income tax', 'Medicare premiums and IRMAA bands', 'Premium tax credit',
    'Roth five-year clocks', 'Later-year distribution pressure', 'Required minimum distribution pressure',
    'Survivor filing-status effects', 'Lost growth on taxes paid']
    .forEach((label) => expect(summaryText.some((entry) => entry.includes(label))).toBe(true));
```

Replacement shape: `derive`. The count comes from `conversionNotModeled()`, the
declaration the page actually renders from, and identity is asserted in both
directions over ids and labels. The positive half asserts that
`'state-and-local-tax'` is absent from the federal pack's `unsupportedFeatures[]`
**and** present as the capped component family the pack's own cap declares, so a
deletion with nothing modelled in its place fails.

Strictly stronger because a hand-maintained eight passes blind through a
substitution at constant count, and passes blind through a removal that models
nothing in its place. The derived identity fails both.

Adversarial cases carried beside it: an id the page never declared must address no
row, and the declared set must be non-empty, so a derivation collapsing to zero
entries cannot pass the identity by vacuous truth.

### SUP-023-03 — delivered (Scope 02, `tests/lifetime-tax-conversion.spec.mjs`)

Superseded clause, verbatim as it stood before this scope:

```js
  /* Power carries the same eight with their reasons and their deferral codes. */
  await openPower(page);
  const detail = page.locator('#notModeledDetailBody tr');
  await expect(detail).toHaveCount(8);
  await expect(detail.nth(0)).toContainText('RLTAX-JURISDICTION-UNSUPPORTED');
  await expect(detail.nth(3)).toContainText('RLTAX-SCOPE-DEFERRED');
```

Replacement shape: `derive`. The same derived count, with every row addressed by
its declared entry id through a new `data-rl-notmodeled` attribute rendered from
the entry's own id, and each row's label and deferral code compared against what
that entry declares.

Strictly stronger because a reordering of the ledger leaves `nth(0)` and `nth(3)`
green while silently changing which entry they checked. The id-addressed clause
follows the entry.

Intended RED, recorded before the green. With the id attribute withheld from the
rendered rows and the replacement already in place:

```
$ npx playwright test tests/lifetime-tax-conversion.spec.mjs --project=system-chrome --reporter=line

    Call log:
      - Expect "toHaveCount" with timeout 5000ms
      - waiting for locator('#notModeledDetailBody tr[data-rl-notmodeled="state-tax"]')
        14 × locator resolved to 0 elements
           - unexpected value "0"

      133 |   for (const entry of declared) {
      134 |     const row = page.locator(`#notModeledDetailBody tr[data-rl-notmodeled="${entry.id}"]`);
    > 135 |     await expect(row).toHaveCount(1);
          |                       ^
  1 failed
    [system-chrome] › tests/lifetime-tax-conversion.spec.mjs:73:1 › Regression: SCN-021-011 the conversion comparison discloses everything it did not model 
  2 passed (7.9s)
```

Green after restoring the attribute: the 16-test run at [TP-02-22](#tp-02-22),
exit `0`.

### SUP-023-04 — delivered (Scope 02, `scripts/selftest.mjs`)

Superseded clause: `simpleFields.length === 7`. Replacement shape: `derive`.
Cross-artifact identity between the closed Simple list and the rendered Simple
markup, so the fields Scopes 03 and 05 add are absorbed. Green at
[TP-02-17](#tp-02-17), which asserts `renderedSimpleFieldIds` is present.

### SUP-023-11 — admitted in flight under ASC-8 (Scope 02, `scripts/selftest.mjs`)

Superseded clause: TP-02-10's `noticeIds.includes('state-and-local-tax')`.
Cause: FR-023-013 moves that id out of `unsupportedFeatures[]`, so a clause
requiring it to be **surfaced** as a not-carried feature pins a fact that is no
longer the fact. Traded for: the id is asserted absent from the notice set and
present as the capped component family the pack's cap declares. The other five
named ids keep their clause verbatim.

The marker was already present in `scripts/selftest.mjs` when this scope resumed,
but the ASC-8 bookkeeping it requires had not been done. This scope completed it in
one change, as ASC-8 directs: the ledger row was appended to
[`spec.md`](../../spec.md#supersession-ledger), its opening paragraph now states
eleven, the ownership table in [`scopes/_index.md`](../_index.md) now reads
five-plus-five-plus-one, and the per-file marker distribution in
[`design.md`](../../design.md#per-file-marker-distribution) now lists SUP-023-11
against `scripts/selftest.mjs` for scope 02. All four agree at eleven.

## Change Boundary

Files this scope modified, all of them on its allowed list:

| File | Allowed as |
| --- | --- |
| `scripts/selftest.mjs` | allowed modified (the `createDeductionHash` fix inside this scope's own appended group) |
| `lifetime-tax-strategy-lab.html` | allowed modified (the `data-rl-notmodeled` attribute SUP-023-03 requires) |
| `tests/lifetime-tax-conversion.spec.mjs` | allowed modified, SUP-023-02 and SUP-023-03 only |
| `tests/lifetime-tax-deduction.spec.mjs` | allowed new (this scope's own Playwright spec) |
| `specs/023-…/spec.md`, `scopes/_index.md`, `design.md` | the ASC-8 bookkeeping the supersession procedure mandates for SUP-023-11 |

Path-scoped status check over the repository:

```
$ git status --short
 M scripts/selftest.mjs
 M site-exclusions.json
?? lifetime-tax-strategy-lab.html
?? lifetime-tax-strategy.config.json
?? notes/lifetime-tax-strategy-lab.md
?? rltax.js
?? rltaxcombined.js
?? rltaxproperty.js
?? rltaxrules.js
?? rltaxstate.js
?? rltaxstrategy.js
?? rltaxworkspace.js
?? specs/021-lifetime-tax-strategy-lab/
?? specs/022-federal-preferential-and-state-income-tax/
?? specs/023-property-tax-and-rental-income/
?? tax-rules/
?? tests/lifetime-tax-conversion.spec.mjs
?? tests/lifetime-tax-deduction.spec.mjs
?? tests/lifetime-tax-federal.spec.mjs
?? tests/lifetime-tax-foundation.spec.mjs
?? tests/lifetime-tax-marginal.spec.mjs
?? tests/lifetime-tax-property.spec.mjs
?? tests/lifetime-tax-route.spec.mjs
?? tests/lifetime-tax.support.mjs
```

Exactly two tracked files differ from the committed tree. `scripts/selftest.mjs` is
allowed. `site-exclusions.json` is on this scope's excluded list, and its diff is
entirely Feature 021's eight module exclusions — it predates this scope and carries
no scope-02 content. `rltaxproperty.js` is correctly absent from that exclusion
list, which is Scope 01's TP-01-DEPLOY assertion and still holds.

Honest limitation: the prior-scope modules on the excluded list — `rltaxproperty.js`,
`rltaxstrategy.js`, `rltaxstate.js`, `rltaxcombined.js`, `tax-rules/property/**`,
`tax-rules/state/**`, and the four prior-feature browser specs — are untracked in
git, so byte-identity cannot be proven against a committed baseline for them. What
is established is that this scope opened none of them; the modified set above is
complete and none of those paths appear in it.

## Claim Boundary

`TP-02-CLAIM` scans everything the deduction composition emits, from the `CO-18`
marker onward in `rltax.js`, for probability, lifetime-figure, break-even,
track-record, error-rate and estimate language, and proves the detector fires on a
sentence that does contain such language, so a silent pass is not possible. Green
in the group output above. No deduction figure is presented as an estimate: the
composition publishes computed amounts, sourced caps, and explicit refusals.

## Completion Statement

All fourteen DoD items are checked, each against execution evidence anchored in
this file. The two that had been left unchecked shared one cause — this scope's own
Playwright spec did not exist — and both closed when it was created:

- **FR-023-014 and NFR-023-006** — the unit half was already green at TP-02-13 and
  TP-02-14; the browser half the item names, TP-02-21, is now green at
  [TP-02-21](#tp-02-21) with its intended RED recorded beside it.
- **Every Test Plan row has intended RED and same-command GREEN evidence** — rows
  TP-02-18 through TP-02-21 and the cumulative selector TP-02-22 are recorded at
  [TP-02-21](#tp-02-21) and [TP-02-22](#tp-02-22).

Everything else was already complete and remains green: `node scripts/selftest.mjs`
exits 0 at 2653/0, the cumulative browser suite passes 25/25 at exit 0,
`node scripts/build-pages-site.mjs --dry-run` exits 0,
`node scripts/validate-spec-test-paths.mjs` reports `new=0`, and
`artifact-lint.sh` passes.

The scope's sourcing obligation is discharged in both directions: the cap was
retrieved and shipped as a figure, and the mortgage debt limits were sought, not
found for the declared year, and shipped as refusals. No figure in this pack came
from memory, interpolation or another tax year.

---

## Audit — arithmetic and refusal integrity (2026-08-22)

Read-only audit of the calculation order and leg accounting across Features
021-024. Two findings belong to this scope. Neither was fixed here: both need a
design decision about which side of the disagreement is authoritative.

### F-AUDIT-01 — the composed deduction is never applied, and the panel says it was

`composeItemizedDeduction` recomputes the itemised-versus-standard decision at
`CO-18` and publishes `appliedDeduction` plus a `chosenReason` that asserts the
settlement acted on it — [rltax.js](../../../../rltax.js#L1970):

> The itemised total is larger than the standard deduction, so itemising is what
> this settlement applied.

The settlement did not. `computeAnnualFederalTax` takes its deduction from
[`selectDeduction`](../../../../rltax.js#L130), called at
[rltax.js](../../../../rltax.js#L174), which reads `workspace.deductionMode` and
`workspace.itemizedAmount` only. `CO-18`'s result reaches no settlement input.
The page then renders that sentence verbatim and labels the composed total
"applied" — [lifetime-tax-strategy-lab.html](../../../../lifetime-tax-strategy-lab.html#L4034)
and [line 4037](../../../../lifetime-tax-strategy-lab.html#L4037) — while the
headline beside it was priced on a different deduction entirely. In the page's
own envelope the settlement is computed before the composition and the workspace
is not re-settled from it.

Measured against the shipped 2026 federal pack, single filer, $200,000 ordinary
income, $20,000 property-tax component (cap $40,400, unbound):

| declared `deductionMode` | deduction the settlement applied | deduction the panel says was applied | headline `totalFederalTax` | tax implied by the panel's sentence |
| --- | --- | --- | --- | --- |
| `standard` | standard, $16,100 | itemized, $20,000 | $36,734 | $35,798 |
| `itemized`, $5,000 | itemized, $5,000 | itemized, $25,000 | $39,398 | $34,598 |

Consequence: the deduction panel overstates the applied deduction by up to
$20,000 and the headline disagrees with it by up to $4,800 of tax on this
fixture. A reader who reconciles the two surfaces cannot, and nothing on either
surface says they are answering different questions.

No assertion covers the relationship. `tests/lifetime-tax-deduction.spec.mjs`
references neither `appliedDeduction` nor `chosenReason`, and the selftest's
`CO-18` group asserts composition internals only — cap binding, apportionment,
component origins, the tie rule — never the composed total against the deduction
the settlement actually used.

Routed, not fixed. Either the settlement must consume `CO-18`'s decision, or the
sentence and the "applied" label must stop claiming it did. That is a
`FR-023-012` scope question, not an editorial one.

### F-AUDIT-03 — the design declares four reconciliation legs that do not exist

[design.md](../../design.md#L225) states:

> Reconciliation gains legs `L8` (property tax), `L9` (rental net after limits),
> `L10` (unrecaptured Section 1250) and `L11` (long-term remainder). Each is
> declared in the pack's leg set and summed from the declared set.

Neither clause holds.

`reconcileAnnualFederalTax` implements `L1` through `L6` and stops; `L8`, `L9`,
`L10` and `L11` appear nowhere in `rltax.js`, `rltaxstate.js`,
`lifetime-tax-strategy-lab.html`, `scripts/selftest.mjs` or any
`tests/lifetime-tax-*.mjs`. The shipped federal pack declares exactly four
`taxLegs` — `ordinary` (`CO-6`), `preferential` (`CO-7`),
`net-investment-income-tax` (`CO-11`) and `additional-medicare-tax` (`CO-12`).
No property, rental or disposition leg is in the declared set.

Two consequences, in opposite directions.

The implementation is right and the document is wrong about the total. Had the
second clause been built as written, the property-tax leg would have been summed
into `totalFederalTax` — which is precisely what the tool's own rendered copy
says must never happen ("It is a separate leg and is not added into the federal
figure above"). The document as it stands instructs the next implementer to
reintroduce the mis-summed-leg defect this program has already shipped once.

The document is right that a reconciliation is owed and it was never built. The
four housing legs of Feature 023 — the ones carrying the largest amounts outside
the federal total — have no reconciliation identity at runtime. `L1`-`L6`
reconcile the Feature 021/022 income-tax arithmetic and nothing else. Verified
green on the shipped pack: all six legs `holds`, zero not-evaluable.

Routed, not fixed. Correcting the design text is a judgement about which of the
two clauses was intended; building `L8`-`L11` is new scope.

### Surfaces audited clean

Confirmed by direct execution against the shipped pack, not by reading alone:
the deduction is applied to total income with the `max(0, ...)` floor; the
`CO-7` stacking window carries the ordinary-taxable-income term; both surtax
legs enter `totalFederalTax`; the Medicare premium legs are byte-identical
no-ops on that total; state tax is a separate settlement with no parameter
through which a federal figure could arrive.

The `CO-7` adversarial mutation the audit brief names was run through
`scripts/red-green-probe.sh` and is genuinely armed — dropping the ordinary term
from the stacking window turns **8** assertions RED, and the file was reverted
and hash-verified inside the probe.

---

## F-AUDIT-03 fixed (2026-08-22)

### What was wrong, verified against the tree

[design.md](../../design.md) said, in the Calculation Order section:

> Reconciliation gains legs `L8` (property tax), `L9` (rental net after limits),
> `L10` (unrecaptured Section 1250) and `L11` (long-term remainder). Each is
> declared in the pack's leg set and summed from the declared set.

Both clauses were confirmed false against the tree. `reconcileAnnualFederalTax`
adds `L1` through `L6` and stops; `rltaxstate.js` adds `L7`; nothing named `L8`
or beyond exists in any engine. The federal pack declares exactly four
`taxLegs` — `ordinary`, `preferential`, `net-investment-income-tax` and
`additional-medicare-tax`, all `includedInTotal: true` — and no housing amount
is a member of that set.

The second clause is the consequential half. `L4` is the identity that sums the
pack's `taxLegs` into `totalFederalTax`, so "declared in the pack's leg set and
summed from the declared set" instructs the next implementer to put property tax
inside the federal total. That is the same defect class as the headline that
rendered `ordinaryTax` in place of `totalFederalTax` and hid $84,481, and it
contradicts the tool's own rendered copy, which tells the reader property tax
"is a separate leg and is not added into the federal figure above".

### A second instance the audit did not name

The same shape was found in [Feature 024's design](../../../024-social-security-and-medicare/design.md):

> Reconciliation gains legs `L12` (Social Security inclusion), `L13` (Part B
> premium), `L14` (Part D premium) and `L15` (income-related adjustment).

`L12` through `L15` exist in no engine either. This one carried no summing
clause, so it was a naming defect rather than an arithmetic instruction, but it
is the same conflation of *reconciliation identity* with *declared leg* and it
was corrected in the same change.

### What the corrected text says

Both paragraphs now state what ships: reconciliation gains no leg; the federal
identities are `L1`-`L6` and the state independence identity is `L7`; the four
housing amounts (`property-tax`, `rental-net`, `disposition-recapture`,
`disposition-remainder`) and Feature 024's five legs are published as legs of the
settled record and are **not** members of the pack's `taxLegs` set, which is the
set `L4` sums into `totalFederalTax`.

The surrounding text was checked for contradiction. One line did contradict it:
the 023 Reuse section said "legs are pack-declared and summed from the declared
set", which is true of `pack.taxLegs` but recombines with the corrected paragraph
into the original claim. It now says explicitly that membership of that set is
what makes an amount part of the federal total, so an amount that is not a
federal tax is not a member. A repository-wide search for any other instruction
to sum a housing or cost leg into a tax total returned none.

### The assertion that now prevents the return

A new selftest group derives the permitted identity set from the engine sources
(`addLeg("L…")` in `rltax.js` and `rltaxstate.js`), cross-checks it against a
live settlement's published leg ids, and fails any of the four lifetime-tax
design documents that names a backticked `L…` identity outside it. It is scoped
to `design.md` deliberately: the `scope.md` planning artifacts use `L8`-`L15` as
planning names for what shipped as semantic leg ids, a divergence Scope 03's
report already reconciles in writing, and those files carry no summing
instruction.

The adversarial half runs against a string rather than the tree, so it cannot
leave a live mutation behind, and it pins both halves of the original defect
while proving the real `L4` is not dragged in with them.

### Red/green probe — the assertion discriminates

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-AUDIT-03: does any assertion reject a design that names an unbuilt reconciliation identity?
file:             specs/023-property-tax-and-rental-income/design.md
mutation:         Reconciliation gains no leg. The federal reconciliation identities are `L1`  ->  Reconciliation gains legs `L8` (property tax), `L9` (rental net), summed from the declared set. The federal reconciliation identities are `L1`   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3189 passed, 2 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3191 passed, 0 failed
summary-compared: Research-Lab self-test: 3189 passed, 2 failed  vs  Research-Lab self-test: 3191 passed, 0 failed   (elapsed time normalised out)
revert-verified:  yes (committed=9c22511c3ab5e8f0d504236304af57802dece2a0 restored=9c22511c3ab5e8f0d504236304af57802dece2a0)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

An earlier invocation of the identical probe returned exit 7 with both channels
reading `3190 passed, 1 failed`. That was not a property of the assertion: a
concurrent session holds uncommitted work in `scripts/selftest.mjs`, and one of
its assertions was transiently failing across both halves of that run. The
invocation recorded above was taken once the shared file was green again, and it
discriminates by two assertions rather than one.

### Ownership

`design.md` is `bubbles.design`'s artifact and `scope.md` is `bubbles.plan`'s.
This correction was made under an explicit operator instruction to verify and
correct the wording, and it is recorded here rather than presented as this
scope's own planning authority. No `scope.md` was touched.

## Regression sweep across Features 021-024 (2026-08-22)

Cross-feature sweep run after the audit and security phases landed behavioural
changes in the shared engine and the shared route. One finding belongs to this
scope. It is routed, not fixed.

### F-REG-01 — the F-AUDIT-01 fix stopped at the engine; both rendered surfaces still claim the composed deduction priced the tax

`e41cc4af0` published two new members on the `CO-18` record, `settlementDeduction`
and `agreesWithSettlement`, and appended a corrective clause to `chosenReason`.
Its own commit comment states the purpose:

> Publishing the settled deduction here is what lets every surface name which of
> the two produced the figure beside it instead of asserting the composed one did.

No surface consumes either member. Grepped across every `.js`, `.html` and `.mjs`
in the checkout, `settlementDeduction` and `agreesWithSettlement` appear only
inside `rltax.js`. They reach no renderer and no assertion.

What the Simple panel still renders, at
[lifetime-tax-strategy-lab.html](../../../../lifetime-tax-strategy-lab.html#L2833):

| line | text |
| --- | --- |
| 2833 | visible label `"Deduction actually applied: "` |
| 2838 | visible value `envelope.deduction.chosen` and `dollars(envelope.deduction.appliedDeduction)` |
| 2839 | tooltip prose `"The side this settlement actually applied, recomputed from the itemised total and the standard deduction rather than read from anything you declared. "` |

`envelope.deduction` is `ENGINE.composeItemizedDeduction(...)`, assigned at line
2514, so all three name the composed comparison. The settlement prices the tax on
`selectDeduction`, which returns the amount for `workspace.deductionMode` and
nothing else — confirmed by reading `rltax.js` lines 130-150 in this session.

The appended clause lands in that same tooltip, so the tooltip now contradicts
itself in one string: its first sentence says this is the side the settlement
applied, and the clause concatenated after it says `It did not price the tax`.

Three further sites carry the same claim and were also untouched:

| site | text |
| --- | --- |
| `lifetime-tax-strategy-lab.html:1065` | table `aria-label` `"…and the side actually applied"` |
| `lifetime-tax-strategy-lab.html:4045,4047` | decision-table third column, literal `"applied"` / `"not applied"` keyed on `composition.chosen` |
| `rltax.js:2007` | tie refusal `"the side actually applied cannot be named"` |

#### The audit understated the remediation cost, and this is the part that changes the routing

The F-AUDIT-01 entry above states:

> No assertion covers the relationship. `tests/lifetime-tax-deduction.spec.mjs`
> references neither `appliedDeduction` nor `chosenReason`

That is true of those two field names and false of the behaviour. The same file
pins the Simple row directly, and it chooses fixtures in which the composed side
and the declared mode deliberately disagree:

| line | fixture | assertion |
| --- | --- | --- |
| 349-359 | declares `standard`, itemised total set to `STANDARD_SINGLE + 5000` | `deductionSideChosen` must contain `itemized` |
| 362-371 | declares `itemized`, itemised total set to `STANDARD_SINGLE - 5000` | `deductionSideChosen` must contain `standard` |
| 373-376 | same | the amount shown must be the larger of the two totals |

Its own comment at line 346 makes the intent explicit:

> The decision follows the two totals, so the declared mode changes nothing: an
> implementation reading the mode flag would name the standard side here.

So in the first fixture the household declared `standard`, the settlement priced
the tax on the standard deduction, and a passing suite requires Simple to display
`itemized` at an amount `$5,000` higher. The assertion set does not merely fail to
cover the defect. It enforces it, in both directions, and it is the contract a fix
has to change.

#### Harness evidence — the node suite cannot discriminate

```
=== RED/GREEN PROBE EVIDENCE ===
label:            simple-deduction-row-renders-composed-not-settled
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.deduction.chosen + " \u00b7 " + dollars(envelope.deduction.appliedDeduction),  ->  envelope.deduction.settlementDeduction.mode + " \u00b7 " + dollars(envelope.deduction.settlementDeduction.value),   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3204 passed, 1 failed
green-exit:       1
green-summary:    Research-Lab self-test: 3204 passed, 1 failed
summary-compared: Research-Lab self-test: 3204 passed, 1 failed  vs  Research-Lab self-test: 3204 passed, 1 failed   (elapsed time normalised out)
revert-verified:  yes (committed=a2bdfa4a1b312df877c58d1b19d995716393595b restored=a2bdfa4a1b312df877c58d1b19d995716393595b)
discriminating:   NO (both channels agree: exit 1 == 1, summary "Research-Lab self-test: 3204 passed, 1 failed" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome on both channels
PROBE_EXIT=7
```

Swapping the Simple row from the composed deduction to the settled one changes
nothing the node suite reports. Exit 7 is the finding: no node assertion can tell
the two apart, so the browser contract quoted above is the only thing holding this
surface, and it holds it to the wrong side.

The `1 failed` in both halves is not mine. It is
`horizon ladder gate group threw: function not found: hlSma`, from a concurrent
session's uncommitted work in `scripts/selftest.mjs` and its untracked
`horizon-ladder-lab.html`. No file in this feature family is dirty. Because that
failure moves the aggregate under this sweep, the aggregate summary is not a
reliable probe channel in this session, and the count is quoted here only as the
observation it was.

#### The same probe re-run once the shared file went green

The concurrent session's failure cleared later in this session, so the identical
probe was run again against a clean baseline. It is recorded rather than
substituted for the capture above, because an evidence block is not rewritten
after the fact.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            simple-deduction-row-renders-composed-not-settled (clean baseline)
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.deduction.chosen + " \u00b7 " + dollars(envelope.deduction.appliedDeduction),  ->  envelope.deduction.settlementDeduction.mode + " \u00b7 " + dollars(envelope.deduction.settlementDeduction.value),   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         0
red-summary:      Research-Lab self-test: 3244 passed, 0 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3244 passed, 0 failed
summary-compared: Research-Lab self-test: 3244 passed, 0 failed  vs  Research-Lab self-test: 3244 passed, 0 failed   (elapsed time normalised out)
revert-verified:  yes (committed=a2bdfa4a1b312df877c58d1b19d995716393595b restored=a2bdfa4a1b312df877c58d1b19d995716393595b)
discriminating:   NO (both channels agree: exit 0 == 0, summary "Research-Lab self-test: 3244 passed, 0 failed" identical once elapsed time is normalised)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=7
```

Both halves green, both halves identical, exit 7. The finding does not depend on
the concurrent failure and is not an artefact of it. A whole suite of 3,244
assertions cannot tell whether the Simple panel names the deduction that priced
the tax or the one that did not.

**Claim Source:** executed. The probe above ran in this session. The greps for
`settlementDeduction`, `agreesWithSettlement`, `appliedDeduction` and
`actually applied` ran in this session. `rltax.js:130-150`,
`lifetime-tax-strategy-lab.html:2475-2530,2800-2860,4008-4050` and
`tests/lifetime-tax-deduction.spec.mjs:340-420` were read in this session.

#### Routed, not fixed

The audit routed F-AUDIT-01 with two admissible resolutions: the settlement
consumes the `CO-18` decision, or the sentence and the `applied` label stop
claiming it did. `e41cc4af0` took neither. It added the honest members and left
every label, every rendered value and the browser contract in place.

Choosing between those two remains an `FR-023-012` and `FR-023-014` scope
question, and the second one now also requires rewriting three assertions in
`tests/lifetime-tax-deduction.spec.mjs` and re-running the Playwright suite to
re-evidence roughly ten committed evidence blocks. This sweep runs no browser, so
it does not take that decision.

Owner: `bubbles.plan` for the `FR-023-012` / `FR-023-014` question, then
`bubbles.implement` for the surface and `bubbles.test` for the three assertions.

#### Ticked evidence this finding does not invalidate

No DoD item in this scope claims the Simple row names the settled deduction. The
`CO-18` items claim the composition recomputes the decision and surfaces it, which
it does. Nothing is unticked for this finding.

## F-REG-01 resolved (2026-08-22)

The routing above named the second admissible resolution: stop the sentence and
the `applied` label claiming the composition priced the tax. That is what was
built. The settlement still applies the mode the household declared, and `CO-18`
is still a comparison recomputed from the two totals, per `FR-023-012` and
`FR-023-014`. What changed is that both facts are now stated, and neither is
stated as the other.

### What each surface said, and what it says now

| surface | before | after |
| --- | --- | --- |
| Simple, label | `Deduction actually applied: ` | two rows: `Deduction that priced the tax: ` and `Larger side, by comparison: ` |
| Simple, value | one value, `deductionSideChosen`, fed from `chosen` and `appliedDeduction` | `deductionApplied` fed from `settlementDeduction.mode` and `settlementDeduction.value`; `deductionSideChosen` unchanged in what it reads, moved under the comparison label |
| Simple, tooltip on the composed value | `The side this settlement actually applied, recomputed from the itemised total and the standard deduction rather than read from anything you declared.` followed by `It did not price the tax: …` | `A comparison, and not the figure above: the larger of the itemised total and the standard deduction, recomputed from the two totals rather than read from anything you declared.` followed by `This comparison did not price the tax: …` |
| Power, table `aria-label` | `…and the side actually applied` | `…the side this comparison names as larger, and the side that priced the tax` |
| Power, caption | `The side applied is recomputed from the two totals.` | `The larger side is recomputed from the two totals … Naming it is a comparison: the tax was priced on the deduction named in the last column.` |
| Power, decision table | three columns, third headed `Applied`, cells `applied` / `not applied`, keyed on the composed side | four columns, `Comparison` (`named` / `not named`, keyed on the composed side) and `Priced the tax` (`priced the tax` / `did not price the tax`, keyed on `settlementDeduction.mode`) |
| `rltax.js` tie refusal | `…so the side actually applied cannot be named` | `…so the larger side cannot be named` |
| `rltax.js` appended clause | `It did not price the tax: this settlement applied the <mode> deduction…` | `This comparison did not price the tax: the settlement applied the <mode> deduction…` |

The self-contradiction is gone because the two halves no longer share a subject.
The hard-coded prefix now says the value beside it is a comparison, and the clause
appended after it names that comparison rather than leaving `It` to be read as the
settlement.

Under the fixture the browser rows use — single filer, declared mode `standard`,
itemised total set to `$21,100` against a sourced standard deduction of `$16,100`
— Simple previously showed one row reading `itemized · $21,100` under the label
`Deduction actually applied`. It now shows `standard · $16,100` under
`Deduction that priced the tax`, and `itemized · $21,100` under
`Larger side, by comparison`. The `$5,000` of deduction the finding names is no
longer attributed to a settlement that never applied it.

### Harness — the same probe move, exit 7 to exit 0

The move is the defect itself: feed the row that claims to have priced the tax
from the composed amount. Before the assertion existed, that move produced exit 7
on `node scripts/selftest.mjs`. It now produces exit 0 on the identical command.
Both halves ran in this session, against the committed tree, minutes apart.

Exit 7, before `TP-02-27` existed. Run against commit `15faccf3b`, which shipped
the corrected surfaces but no node assertion able to read them. No
`--summary-match` is pinned here: the aggregate count moves under a concurrent
session and is not a verdict channel, so the exit code carries the whole verdict.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-REG-01 same mutation, node channel: still cannot see a DOM surface
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.deduction.settlementDeduction.mode + " \u00b7 " + dollars(envelope.deduction.settlementDeduction.value),  ->  envelope.deduction.chosen + " \u00b7 " + dollars(envelope.deduction.appliedDeduction),   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         0
red-summary:      ================================================
green-exit:       0
green-summary:    ================================================
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   NO (red-exit 0 == green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome (both exited 0). The mutation did not make the command fail, so the assertion under test cannot fail and this is not RED/GREEN evidence.
PROBE_EXIT=7
```

Exit 0, after `TP-02-27` landed in commit `838a908ad`. Same file, same mutation,
same command. `--summary-match` is pinned to the assertion's own wording, so the
matched line is the assertion's verdict rather than an aggregate a concurrent
session can move.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-REG-01 the priced-the-tax row is fed from the composed amount — node channel, the same command that returned exit 7
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.deduction.settlementDeduction.mode + " \u00b7 " + dollars(envelope.deduction.settlementDeduction.value),  ->  envelope.deduction.chosen + " \u00b7 " + dollars(envelope.deduction.appliedDeduction),   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-27: the Simple panel feeds its priced-the-tax row from the settled deduction and its comparison row from the composed amount, neither is described as the other, no surface still says
green-exit:       0
green-summary:      ✓ TP-02-27: the Simple panel feeds its priced-the-tax row from the settled deduction and its comparison row from the composed amount, neither is described as the other, no surface still says the c
summary-compared:   ✗ FAIL: TP-02-27: the Simple panel feeds its priced-the-tax row from the settled deduction and its comparison row from the composed amount, neither is described as the other, no surface still says  vs    ✓ TP-02-27: the Simple panel feeds its priced-the-tax row from the settled deduction and its comparison row from the composed amount, neither is described as the other, no surface still says the c   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

The same mutation on the browser channel, pinned to the new row's own title.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-REG-01 the priced-the-tax row is fed from the composed amount (the defect, reintroduced)
file:             lifetime-tax-strategy-lab.html
mutation:         envelope.deduction.settlementDeduction.mode + " \u00b7 " + dollars(envelope.deduction.settlementDeduction.value),  ->  envelope.deduction.chosen + " \u00b7 " + dollars(envelope.deduction.appliedDeduction),   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-deduction.spec.mjs --project=system-chrome --grep F-REG-01 --reporter=line
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax 
green-exit:       0
green-summary:    [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax
summary-compared:     [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax   vs  [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

The corrected `TP-02-20` is discriminating rather than weakened. Making the
Power `Priced the tax` column echo the comparison instead of the settlement fails
it, which is the assertion the old row could not have made because it read only
three columns and demanded the composed side in the third.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-REG-01 the Power priced-the-tax column echoes the comparison instead of the settlement
file:             lifetime-tax-strategy-lab.html
mutation:         return pricedBy === side ? "priced the tax" : "did not price the tax";  ->  return composition.chosen === side ? "priced the tax" : "did not price the tax";   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-deduction.spec.mjs --project=system-chrome --grep itemized\ versus\ standard\ decision --reporter=line
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:334:1 › Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named 
green-exit:       0
green-summary:    [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:334:1 › Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named
summary-compared:     [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:334:1 › Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named   vs  [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:334:1 › Regression: SCN-023-006 the itemized versus standard decision is recomputed and the chosen side is named   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

The tooltip half is pinned too. Restoring the old self-contradicting prefix fails
the new row.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            F-REG-01 the composed tooltip carries the old self-contradicting prefix again
file:             lifetime-tax-strategy-lab.html
mutation:         "A comparison, and not the figure above: the larger of the itemised total and the standard deduction, recomputed from the two totals rather than read from anything you declared. "  ->  "The side this settlement actually applied, recomputed from the itemised total and the standard deduction rather than read from anything you declared. "   (1 occurrence(s))
command:          npx playwright test tests/lifetime-tax-deduction.spec.mjs --project=system-chrome --grep F-REG-01 --reporter=line
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax 
green-exit:       0
green-summary:    [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax
summary-compared:     [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax   vs  [1/1] [system-chrome] › tests/lifetime-tax-deduction.spec.mjs:416:1 › Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax   (elapsed time normalised out)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

### The assertions were corrected, not deleted

`tests/lifetime-tax-deduction.spec.mjs` pinned the wrong behaviour in both
directions. Every fixture is kept, including the two built so the declared mode
and the composed side deliberately disagree, because that disagreement is the only
thing that makes the row discriminating. What changed is what the fixtures are
asserted to produce.

| fixture | the old assertion | the corrected assertion |
| --- | --- | --- |
| declares `standard`, itemised `$21,100` | `itemised.applied === 'applied'`, `standard.applied === 'not applied'`, `deductionSideChosen` contains `itemized` | comparison column `named` / `not named` unchanged in meaning; `priced` column asserts `did not price the tax` on itemising and `priced the tax` on the standard side; `deductionApplied` must read `standard` and `$16,100` while `deductionSideChosen` reads `itemized` and `$21,100` |
| declares `itemized`, itemised `$11,100` | `standard.applied === 'applied'`, `deductionSideChosen` contains `standard`, amount is the larger of the two totals | the same comparison verdict, plus `priced the tax` on itemising, `deductionApplied` reading `itemized` and `$11,100`, and `deductionSideChosen` reading `standard` and `$16,100` |
| tie at `$16,100`, declared `itemized`, pack `onTie` is `standard` | `deductionSideChosen` contains the pack's tie side | the same, plus `deductionApplied` reading `itemized` — a third disagreement the old row could not see |

Two assertions were added rather than replaced: `#deductionChosenLine` must contain
`did not price the tax`, and the priced-the-tax row's amount must not be the
composed one. Coverage went up. Nothing was removed.

`TP-02-28` is the row the finding says was missing. It fails if any surface
presents the composed side as the deduction that priced the tax, and it reads the
label, the tooltip, the value, the Power headers and the table `aria-label`. It
asserts its own fixture is still discriminating — that the two figures disagree —
so a later pack edit that made them agree would fail the row rather than silently
neuter it.

### A correction to this report's own earlier wording

The narrative under `### Scenario SCN-023-006` above says the decisive assertion is
that a household declaring `standard` with an itemised total above the standard
deduction *is still shown the itemised side*. That sentence described the defect as
though it were the requirement. It is left in place rather than rewritten, because
an evidence narrative is not edited after the fact, and it is corrected here: the
decisive assertion is now that such a household is shown BOTH — the standard
deduction as the one that priced its tax, and the itemised side as the larger of
the two totals.

### DoD items unticked

One item is unticked. Its evidence no longer describes the shipped tests.

`Every Test Plan row has intended RED and same-command GREEN evidence recorded,
including the browser rows.` The recorded GREEN for `TP-02-20` was produced by
assertions that have since been replaced, so it evidences a row that no longer
exists in that form. The scope also now ships three assertions the Test Plan does
not list: `TP-02-26`, `TP-02-27` and `TP-02-28`. Both halves are reasons the tick
is not currently earned, and a false tick is what produced this finding.

The RED and GREEN for the changed and new rows are the four probe blocks above and
the browser run below. Re-ticking the item needs the Test Plan rows to exist first,
which is `bubbles.plan`'s artifact, so the item stays open here.

Nothing else is unticked. The `FR-023-012` item claims the decision is recomputed
from the two totals and the chosen side is named; it still is, and its evidence
(`report.md#tp-02-09`, `report.md#tp-02-10`) is engine-level and untouched. The
`FR-023-014` item claims the composition and the decision are surfaced on four
surfaces; they still are, under a label that no longer misdescribes them.

### Routed to `bubbles.plan`

Three Test Plan rows are needed in `scope.md`, which this agent does not own:

| id | type | category | scenario | file | what it pins |
| --- | --- | --- | --- | --- | --- |
| `TP-02-26` | Known value | unit | SCN-023-006 | `scripts/selftest.mjs` | the settled and composed deductions disagree, and the settled one is what `computeAnnualFederalTax` subtracted |
| `TP-02-27` | Adversarial | unit | SCN-023-006 | `scripts/selftest.mjs` | no rendered surface feeds a priced-the-tax claim from the composed amount; both regressions planted and proven to fail |
| `TP-02-28` | Regression E2E | e2e-ui | SCN-023-006 | `lifetime-tax-deduction.spec.mjs` | `Regression: F-REG-01 no surface names the composed side as the deduction that priced the tax` |

### Verification

`node scripts/selftest.mjs`, verbatim summary line:

```
Research-Lab self-test: 3255 passed, 0 failed
```

The recorded baseline was `3244 passed, 0 failed`. The count did not fall. Eleven
of the gain is not mine: a concurrent session committed horizon-ladder, scenario
and ledger assertions in `8013cd150` and `09d139bad` between the baseline reading
and this one. Comparing the two runs assertion line by assertion line, thirteen
lines are new and four are gone, all four of the gone lines being the same
stochastic and commit-count checks reprinted with a different observed value, and
zero of the seventeen mention a deduction, `lifetime-tax` or a `TP-02` marker. My
own contribution is the two lines `TP-02-26` and `TP-02-27`.

The browser suite for this scope's file:

```
$ npx playwright test tests/lifetime-tax-deduction.spec.mjs --reporter=line
  10 passed (5.8s)
```

Four lifetime-tax browser specs together, checked for collateral damage:

```
$ npx playwright test tests/lifetime-tax-deduction.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-conversion.spec.mjs --reporter=line
  30 passed (8.6s)
```

`node scripts/validate-spec-test-paths.mjs`:

```
[spec-test-paths] scanned=693 references=15620 distinctPaths=252 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
```

`bash .github/bubbles/scripts/artifact-lint.sh` on all four lifetime-tax features:

```
artifact-lint 021-lifetime-tax-strategy-lab EXIT=0
artifact-lint 022-federal-preferential-and-state-income-tax EXIT=0
artifact-lint 023-property-tax-and-rental-income EXIT=0
artifact-lint 024-social-security-and-medicare EXIT=0
```

**Claim Source:** executed. Every block above is the output of a command run in
this session. The two commits are `15faccf3b` (surfaces and corrected browser
assertions) and `838a908ad` (the node assertions), each verified with
`git cat-file -t` as an object of type `commit`.

## TP-02-26 intended-RED probe, engine channel (2026-08-22)

The section above recorded a GREEN for `TP-02-26` and no intended RED. The reason
was structural rather than an oversight: every probe in that section mutates a
rendered surface in `lifetime-tax-strategy-lab.html`, and `TP-02-26` asserts over
`composeItemizedDeduction` and `computeAnnualFederalTax`, which no surface
mutation reaches. A row's RED has to be demonstrated on the channel the row
actually reads, so the probe below mutates the engine instead.

The defect reintroduced is the one the row exists to refuse: the composition
republishes the settled figure as its own applied amount, so the two published
deductions collapse into one and `appliedDeduction !== settlementDeduction.value`
stops holding. That is the engine-level form of F-REG-01 — the same
interchangeability that let a suite of 3,244 checks pass while every rendered
surface named the wrong side.

`--summary-match` is pinned to `TP-02-26`'s own assertion wording, not to the
aggregate pass count. A concurrent session moves the aggregate, so the aggregate
is not a verdict channel for this row.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-26 engine channel: the composition republishes the settled figure as its own applied amount, collapsing the two published deductions into one
file:             rltax.js
mutation:         appliedDeduction: composedAmount,  ->  appliedDeduction: settlementSettled ? settlementDeduction.value : composedAmount,   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-26: when the declared mode is not the larger side the composition names itemising while the settlement prices the tax on the declared standard deduction, the two amounts differ, agre
green-exit:       0
green-summary:      ✓ TP-02-26: when the declared mode is not the larger side the composition names itemising while the settlement prices the tax on the declared standard deduction, the two amounts differ, agreesWith
summary-compared:   ✗ FAIL: TP-02-26: when the declared mode is not the larger side the composition names itemising while the settlement prices the tax on the declared standard deduction, the two amounts differ, agre  vs    ✓ TP-02-26: when the declared mode is not the larger side the composition names itemising while the settlement prices the tax on the declared standard deduction, the two amounts differ, agreesWith   (elapsed time normalised out)
revert-verified:  yes (committed=8294f084523f504fcb19681e0e7cda2cdce457b5 restored=8294f084523f504fcb19681e0e7cda2cdce457b5)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
PROBE_EXIT=0
```

The RED and the GREEN are the same command, `node scripts/selftest.mjs`, run
either side of one mutation the harness applied and reverted. `revert-verified`
reports the same blob hash before and after, so the engine file the GREEN ran
against is byte-identical to the committed one.

With this block, all three of `TP-02-26`, `TP-02-27` and `TP-02-28` carry a
recorded intended RED and a same-command GREEN, each on the channel its own row
names: `TP-02-26` on the engine, `TP-02-27` on the node read of the rendered
surface, `TP-02-28` on the browser grep.

**Claim Source:** executed. The block above is the verbatim stdout of the harness
invocation run in this session, with its exit code appended.

