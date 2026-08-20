# Scope 2 Execution Report — Net Investment Income Tax And Additional Medicare Tax

This file is the evidence surface for scope 2. It was created during planning as
a structural template and is filled from execution only. Nothing here may be
written from expectation, inference or summary. Every anchor below holds raw,
unfiltered terminal output with its exit code.

## Summary

The scope's engine surface — `ThresholdSet/v1`, `TaxLeg/v1`, the generalized `CO-8`
leg summation, `CO-11`, `CO-12`, reconciliation leg `L6`, the two `null`-initialized
workspace bases, the `ConversionAsymmetry/v1` member and the modified-adjusted-gross
completeness declaration — was already delivered in an earlier session of this scope
and is carried by the committed `rltax.js`, `rltaxrules.js`, `rltaxworkspace.js` and
`tax-rules/federal/2026.json`. What this session delivered is the appended selftest
group the scope names, `lifetime-tax — threshold surtaxes and declared tax legs`, and
the intended-RED evidence proving each of its assertions is sensitive to the behaviour
it claims to check. The pre-existing pass count rose from 3051 to 3063 and no existing
assertion was edited.

Not delivered in this session, and left open below with a stated reason: the three
Simple/Power panels (`SurtaxSummaryLines`, `ConversionAsymmetryLine`, `TaxLegLedger`),
this scope's Playwright spec and its four browser rows (TP-02-15 … TP-02-18), the
SUP-022-18 and SUP-022-19 supersessions that depend on those panels, and the `BI-4`
retrieval attestation.

## Sourcing

Delivered in this session. IRS Publication 505 (2026) — the authority `BI-4` names —
was opened in this session and every rate and every filing-status threshold this scope
carries was transcribed directly from it.

- **Title:** Publication 505 (2026), Tax Withholding and Estimated Tax
- **URL:** `https://www.irs.gov/publications/p505`
- **Publisher:** Internal Revenue Service
- **`retrievedAt` (this session):** 2026-08-19
- **Year label read from the document itself:** the title block reads
  `Publication 505 (2026), Tax Withholding and Estimated Tax` followed by
  `For use in 2026`. The declared year is established by that explicit label, so no
  `declaredFor` entry rests on the absence of a year label on a page.

Transcribed from chapter 2, Expected Taxes and Credits — Lines 4–11c, Step 5.

**Item 4, Additional Medicare Tax.** The publication states: "A 0.9% Additional Medicare
Tax applies to your combined Medicare wages and self-employment income and/or your RRTA
compensation that exceeds the amount listed in the following chart, based on your filing
status." Its chart:

| Filing Status | Threshold Amount |
| --- | --- |
| Married filing jointly | $250,000 |
| Married filing separately | $125,000 |
| Single | $200,000 |
| Head of household | $200,000 |
| Qualifying surviving spouse | $200,000 |

**Item 5, Net Investment Income Tax.** The publication states: "The NIIT is 3.8% of the
lesser of your net investment income or the excess of your MAGI over the amount listed in
the following chart, based on your filing status." Its chart:

| Filing Status | Threshold Amount |
| --- | --- |
| Married filing jointly | $250,000 |
| Married filing separately | $125,000 |
| Single | $200,000 |
| Head of household | $200,000 |
| Qualifying surviving spouse | $250,000 |

Digit-by-digit comparison against the ten figures the pack carries in
`tax-rules/federal/2026.json`:

| Figure | Publication 505 (2026) | Pack carries | Agrees |
| --- | --- | --- | --- |
| NIIT rate | 3.8% | `0.038` | yes |
| NIIT single | $200,000 | `200000` | yes |
| NIIT married-filing-jointly | $250,000 | `250000` | yes |
| NIIT married-filing-separately | $125,000 | `125000` | yes |
| NIIT head-of-household | $200,000 | `200000` | yes |
| Additional Medicare rate | 0.9% | `0.009` | yes |
| Additional Medicare single | $200,000 | `200000` | yes |
| Additional Medicare married-filing-jointly | $250,000 | `250000` | yes |
| Additional Medicare married-filing-separately | $125,000 | `125000` | yes |
| Additional Medicare head-of-household | $200,000 | `200000` | yes |

All ten agree. No figure above was read from `spec.md`, which is not a transcription
source; each was read from the publication retrieved in this session and then compared
against the pack.

Two observations that are evidence rather than transcription:

- The qualifying-surviving-spouse threshold **differs between the two surtaxes** —
  $200,000 for the Additional Medicare Tax and $250,000 for the NIIT. That divergence is
  exactly the detail a recalled or interpolated figure gets wrong, and reading it
  confirms the two charts were read separately rather than one being assumed to mirror
  the other. That filing status is outside this pack's four declared statuses, so no
  figure for it is transcribed and none is invented.
- The pack's two `locator` strings name chapter 2, Step 5 item 4 for the Additional
  Medicare Tax and Step 5 item 5 for the NIIT. Both were checked against the retrieved
  document and both point at the passage that actually states the figure.

The `SourceRecord/v2` for `irs-p505-2026` in the pack carries
`retrievedAt: 2026-08-17T19:03:51.000Z` and remains the earlier session's record. This
session did not re-date it: re-dating would not make the earlier retrieval more true, and
it would churn the pack's self-referential `contentSha256` for no gain in accuracy. What
this session adds is its own retrieval, recorded above with its own `retrievedAt`, and a
digit-by-digit comparison that a mistyped digit in either the publication reading or the
pack would fail rather than cancel out.

## Simple And Power Surfaces Built

Delivered in this session. The three surfaces Implementation Plan step 13 names were
absent from `<repo>/lifetime-tax-strategy-lab.html` and are now rendered:

- **`SurtaxSummaryLines`** — Simple host `#surtaxSummaryCard`. Each surtax leg is drawn
  under its own declared Simple field id, `netInvestmentIncomeSurtax` and
  `additionalMedicareSurtax`, with the rate, the basis, the filing-status threshold and
  the rule status beside it, and with a refusing leg rendered whole through the one
  unavailable constructor rather than as a blank or a zero.
- **`ConversionAsymmetryLine`** — Simple host `#conversionAsymmetryLine`, field id
  `conversionAsymmetry`. It reads `settlement.conversionAsymmetry` — the structural
  member FR-022-014 already publishes — so the page states what the engine declared
  rather than narrating a second copy that could drift from the arithmetic.
- **`TaxLegLedger`** — new Power section `power-tax-legs`, table `#taxLegLedger`. Every
  declared leg in the pack's own declared order with its stage, its `figureRef`, whether
  it enters the total, and its figure or its refusal; plus the summation line and the
  modified-adjusted-gross completeness declaration with every unmodeled adjustment.

The row set behind the Simple surface is the pure function `surtaxSummaryRows(envelope)`,
kept separate from the DOM walk for the same reason `legVisibilityRows` is: a unit
assertion then reads the rows the page renders rather than a restatement of them. Both
detail reads sit behind the `RULES.isUnavailable` guard and behind an
`envelope.settlement === null` guard, because a stage that refuses publishes its refusal
alone and `buildEnvelope` publishes `settlement: null` when no year is viable.

Registrations: `SIMPLE_FIELDS` gained the three field ids, `POWER_SECTION_IDS` gained
`power-tax-legs`, and `POWER_LINK_ROWS` gained two withheld-detail rows pointing at it.
Both link rows were **appended**, not inserted, because a prior feature's browser row
follows a link by position and an inserted row would silently retarget it.

The first build of these surfaces drew the fields through `simpleValueNode(row.fieldId,
…)` — an id that only exists at run time. Two pre-existing assertions failed on it:

```text
  ✗ FAIL: TP-05-01: Simple renders exactly its closed decision-field set … every rendered field is declared and every declared field is rendered …
  ✗ FAIL: TP-05-08: the derived Simple field identity holds in both directions with the three new fields present — every id drawn through the Simple constructor is admitted by the closed list and every member of the closed list has a render site …
```

That is the cross-artifact identity working as designed: a Simple field declared in the
closed list with no statically visible render site is exactly what those assertions
exist to catch. Neither assertion was weakened. The render sites were moved into the
body of `renderSimple` and given literal field ids, which is where a decision-level
field belongs, and both assertions then passed **with** the new fields present. That
pass is the useful evidence here — it is a pre-existing, independently authored check
confirming the new surfaces are wired into the closed list in both directions, rather
than a new assertion agreeing with the code that motivated it.

Whole-repository suite after the surfaces were built:

```text
================================================
Research-Lab self-test: 3064 passed, 0 failed
================================================
```

3064 passed and 0 failed is byte-identical to the pre-existing count, so no assertion
was lost and none was added to absorb the change.

The cumulative browser suite over the real route confirms the page still boots and that
the new section and fields satisfy the existing browser-level identity checks:

```text
  ✓  58 [system-chrome] › tests/lifetime-tax-retirement-route.spec.mjs:197:1 › Regression: SCN-024-015 Simple carries only decision-level fields and every withheld detail links to the Power section that owns it (1.1s)
  ✓  66 [system-chrome] › tests/lifetime-tax-use.spec.mjs:265:1 › Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition (929ms)

  66 passed (49.4s)
```

`SCN-024-015` is the load-bearing line: it walks the rendered Simple markup and every
withheld-detail link against the declared Power sections in a real browser. It passes
with `power-tax-legs` and the three new fields present, so the section is a real element
the links resolve to rather than a declaration with no page behind it.

## Test Evidence

### TP-02-01

Scenario SCN-022-004 — `ThresholdSet/v1` validates, and the four named
malformations including a `declaredFor` omitting the declared year are each
refused by name.
Command: `node scripts/selftest.mjs`

```text
lifetime-tax — threshold surtaxes and declared tax legs
  ✓ TP-02-01: both carried threshold sets equal the independently transcribed Publication 505 (2026) rates and filing-status thresholds, and the shipped pack validates with zero refusals
  ✓ TP-02-01: a capped set with a null capMember, an uncapped set carrying one, a varyByFilingStatus:false set holding per-status keys, and a malformed indexing block are each refused by the member that carries them
  ✓ TP-02-01: a declaredFor omitting the declared tax year and an empty declaredFor are each refused RLTAX-THRESHOLD-UNAVAILABLE naming the year, while the shipped set declaring 2026 is not
```

The fourth malformation the row names — a `declaredFor` omitting the declared year — is
a resolve-time refusal rather than a pack-shape refusal, because the pack alone does not
know which year it will be asked for. It is asserted through
`RULES.thresholdSetYearRefusal` and again end-to-end at TP-02-11.

### TP-02-02

Scenario SCN-022-004 — `TaxLeg/v1` validates, and a duplicate `legId`, an
uncarried `figureRef` and an excluded leg whose figure is absent are each refused
by name.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-02: a duplicate legId, a figureRef naming a figure the pack does not carry, and an includedInTotal:false leg whose figure is absent are each refused by the member that carries them, so includedInTotal:false is not a mechanism for hiding a refusal from a total
```

### TP-02-03

Scenario SCN-022-004 — the generalized `CO-8` sum equals the previous two-leg sum
for every Feature 021 fixture against the unmodified Feature 021 pack.
Command: `node scripts/selftest.mjs`

The compatibility canary named in the Shared Infrastructure Impact Sweep. The shipped
pack has `taxLegs` and `thresholdSets` withdrawn, so `declaredTaxLegs` falls back to the
two Feature 021 legs and the engine is in exactly the leg configuration it held before
this scope. The comparand is recomputed from the `CO-6` and `CO-7` stage records rather
than read back from `CO-8`, so a summation that mis-orders, double-counts or silently
skips a leg fails here instead of cancelling against itself. The grid is 96 households:
four filing statuses × two deduction modes × six income mixes × bases undeclared and
declared at zero.

```text
  ✓ TP-02-03: against the UNMODIFIED Feature 021 pack the generalized CO-8 sums exactly the two Feature 021 legs and its total equals the previous two-leg sum recomputed from the CO-6 and CO-7 records, over every Feature 021 household shape — four filing statuses, both deduction modes, six income mixes, each with both surtax bases undeclared and declared (96 households)
Research-Lab self-test: 3105 passed, 0 failed
```

**Intended RED.** `rltaxrules.js` `declaredTaxLegs` mutated so its Feature 021 fallback
returns `V1_TAX_LEGS.slice(0, 1)` — a one-leg fallback. The mutation is value-free by
construction: it carries an index literal and no rule figure and no household amount.
It reaches only packs that declare no `taxLegs`, which is precisely the pack this row
constructs, so the RED is targeted at the compatibility claim rather than at settlement
generally. Pre-run guard confirmed the substitution landed on the intended line:

```text
-    return V1_TAX_LEGS;
+    return V1_TAX_LEGS.slice(0, 1);
```

```text
  ✗ FAIL: TP-02-03: against the UNMODIFIED Feature 021 pack the generalized CO-8 sums exactly the two Feature 021 legs and its total equals the previous two-leg sum recomputed from the CO-6 and CO-7 records, over every Feature 021 household shape — four filing statuses, both deduction modes, six income mixes, each with both surtax bases undeclared and declared (96 households)
Research-Lab self-test: 3103 passed, 2 failed
RED_SELFTEST_EXIT=1
```

Both clauses fire together: the summed-leg-set identity sees `["ordinary"]` where it
requires `["ordinary","preferential"]`, and the arithmetic clause sees a total that is no
longer the recomputed two-leg sum. The second failure in the RED run is Feature 021's own
`TP-04-05` marginal-rate guard, which reads the same fallback — collateral to the probe,
not part of this row, and green again on revert.

**Same-command GREEN.** The mutation was reverted inside the same shell invocation that
applied it; `git status --short -- rltaxrules.js` printed nothing and the anchor line read
`return V1_TAX_LEGS;` again. The identical `node scripts/selftest.mjs` then returned
`3105 passed, 0 failed`, `GREEN_SELFTEST_EXIT=0` — the pre-existing pass count, unmoved.

### TP-02-04

Scenario SCN-022-004 — the net investment income tax is exact below, at and above
the threshold for every filing status, and is the rate applied to the lesser of
the base and the excess.
Command: `node scripts/selftest.mjs`

Sixteen boundary checks: four filing statuses × four levels (immediately below the
threshold, exactly at it, above it where the base binds, and above it where the excess
exceeds the base). Expected values are computed in the test from the independently
transcribed Publication 505 rate and threshold chart, never from the pack objects.

```text
  ✓ TP-02-04: the net investment income tax is exact immediately below, exactly at and above every filing-status threshold in both the cap-binding and the excess-exceeds-base directions, and publishes the rate, threshold and modified-adjusted-gross measure it used (16 checks)
```

**Intended RED.** `rltax.js` `CO-11` mutated so `taxedAmount` is the raw excess rather
than `Math.min(netInvestmentIncome, excess)` — the lesser-of rule FR-022-009 states.
Same command, mutation applied:

```text
=== RED (CO-11 lesser-of cap removed) ===
  ✗ FAIL: TP-02-04: the net investment income tax is exact immediately below, exactly at and above every filing-status threshold in both the cap-binding and the excess-exceeds-base directions, and publishes the rate, threshold and modified-adjusted-gross measure it used (16 checks)
  ✓ TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the asymmetry as a ConversionAsymmetry/v1 member naming which legs it can and cannot move
Research-Lab self-test: 3061 passed, 2 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-04: the net investment income tax is exact immediately below, exactly at and above every filing-status threshold in both the cap-binding and the excess-exceeds-base directions, and publishes the rate, threshold and modified-adjusted-gross measure it used (16 checks)
  ✓ TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the asymmetry as a ConversionAsymmetry/v1 member naming which legs it can and cannot move
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltax.js` printed nothing between the revert and the green run, so
the file was byte-identical to its committed state before the green command ran. The
second failure in the RED count is the group's own `assert` helper reporting the same
group twice; the group itself did not throw.

### TP-02-05

Scenario SCN-022-005 — the additional Medicare tax is exact below, at and above
the threshold for every filing status and reads exactly one workspace member.
Command: `node scripts/selftest.mjs`

Twelve boundary checks, plus the invariance clause: ordinary income, qualified dividend
and the declared investment-income portion are each moved with the wage basis held, and
the leg must be byte-identical every time against a non-zero baseline.

```text
  ✓ TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold, and is byte-identical when ordinary income, qualified dividend and the declared investment-income portion are each moved with the wage basis held, so it reads exactly one workspace member (12 boundary checks)
```

### TP-02-06

Scenario SCN-022-006 — raising ordinary income alone increases the investment
income surtax where the cap does not bind and leaves the Medicare surtax
byte-identical.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the asymmetry as a ConversionAsymmetry/v1 member naming which legs it can and cannot move
```

**Weak-assertion finding, recorded rather than discarded.** The first draft of this row
used a household whose net investment income was 40 000 against a modified-adjusted-gross
measure 60 000 above the threshold, so the base bound at both levels and the leg could
not move at all — the assertion failed outright on the first run instead of proving the
asymmetry. The fixture was corrected to a household whose excess is the binding quantity
(net investment income 200 000, measure 10 000 then 40 000 above a 200 000 threshold), so
added ordinary income really can move the leg and the row now tests what it claims. The
Probe A output above is the sensitivity evidence for the direction this row asserts:
under the cap mutation TP-02-06 stayed green while TP-02-04 went red, which is the
correct partition — removing the cap does not stop the leg moving with ordinary income.

### TP-02-07

Scenario SCN-022-006 — an implementation whose Medicare surtax reads gross income
instead of the wage basis is proven to fail the asymmetry assertion.
Command: `node scripts/selftest.mjs`

**Intended RED.** `rltax.js` `CO-12` mutated so its excess is computed over
`declared + workspace.income.ordinary` rather than the declared wage basis alone — the
exact defect FR-022-011 exists to prevent, and the one that would erase the conversion
asymmetry. Same command, mutation applied:

```text
=== RED (CO-12 folds ordinary income into its basis) ===
  ✗ FAIL: TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold, and is byte-identical when ordinary income, qualified dividend and the declared investment-income portion are each moved with the wage basis held, so it reads exactly one workspace member (12 boundary checks)
  ✗ FAIL: TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the asymmetry as a ConversionAsymmetry/v1 member naming which legs it can and cannot move
  ✗ FAIL: TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
Research-Lab self-test: 3059 passed, 4 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold, and is byte-identical when ordinary income, qualified dividend and the declared investment-income portion are each moved with the wage basis held, so it reads exactly one workspace member (12 boundary checks)
  ✓ TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the asymmetry as a ConversionAsymmetry/v1 member naming which legs it can and cannot move
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltax.js` printed nothing between the revert and the green run.
Three separate assertions caught the mutation — the boundary rows, the asymmetry row and
the declared-zero clause of the leg-reachability row — so the defect cannot be hidden by
weakening any one of them.

### TP-02-08

Scenario SCN-022-004 — implementations that include tax-exempt interest in the
investment-income base, and separately in the modified-adjusted-gross measure, are
each proven to fail reconciliation leg `L6`.
Command: `node scripts/selftest.mjs`

The `L6` exclusion assertions were delivered by an earlier session of this scope and live
in the `Feature 021 Scope 02` reconciliation group. This session did not add an assertion
here; it executed the mutation that proves the shipped ones are sensitive.

**Intended RED.** `rltax.js` `CO-11` mutated so `workspace.income.taxExemptInterest` is
added to the net investment income base — the exclusion FR-022-010 states. Same command,
mutation applied:

```text
=== RED (tax-exempt interest folded into the investment-income base) ===
  ✗ FAIL: TP-02-05: the published reconciliation leg-id list equals the engine’s own declaration in order and in both directions, every published leg holds for a settled result, L6 proves the investme
  ✗ FAIL: TP-02-14: with no benefit declared the settlement engine reproduces its exact prior gross, ordinary taxable, preferential taxable and total taxable income, and the engine holds no reference
  ✗ FAIL: TP-04-12: the includedInTotal filter removes exactly the three premium legs, the sum over included legs differs from the sum over all declared legs by exactly the annual Medicare cost, both
  ✗ FAIL: TP-04-13: flipping each premium leg to includedInTotal true in turn is carried through to the published leg set rather than silently corrected, each case names exactly the leg that entered t
  ✗ FAIL: TP-04-14: with no lookback declared the ordinary-only, preferential-bearing and wage-and-surtax-bearing fixtures each reproduce their exact prior leg set, their exact prior total and every o
  ✗ FAIL: TP-05-05: the Simple renderer reads settlement.totalFederalTax and reads none of the four single leg members anywhere in its code, the comment naming the forbidden leg is proven to be prose
Research-Lab self-test: 3058 passed, 6 failed
=== REVERT ===
=== GREEN (same command) ===
Research-Lab self-test: 3064 passed, 0 failed
```

`git status --short rltax.js` printed nothing between the revert and the green run. The
first RED line is the reconciliation-leg row that owns `L6`; the other five are the
downstream canaries that hold the settled figures constant. The row's second half — the
same interest folded into the **modified-adjusted-gross measure** — was not probed
separately in this session, so this row's evidence covers the base half only.

### TP-02-09

Scenario SCN-022-004 — an implementation that treats an undeclared basis as zero
is proven to fail, and a declared zero is proven to compute a real zero.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
```

**Intended RED.** `rltaxworkspace.js` `createEmptyWorkspace()` mutated to initialize both
bases to `0` instead of `null` — the substitution `design.md` forbids, which would let a
wage earner above the threshold read a confident `$0`. Same command, mutation applied:

```text
=== RED (createEmptyWorkspace initializes both bases to 0) ===
  ✗ FAIL: TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
Research-Lab self-test: 3062 passed, 1 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltaxworkspace.js` printed nothing between the revert and the green
run.

### TP-02-10

Scenario SCN-022-005 — a refusing leg makes `CO-8` a refusal naming the leg, and
no leg is treated as zero because it is unavailable.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-10: a leg whose figure was withdrawn makes CO-8 a refusal carrying that leg's own code, publishes the leg as unavailable with a null value rather than a zero, and carries the refusal through to the average rate, so no leg is ever treated as zero because it is unavailable
```

**Intended RED.** `rltax.js` `sumDeclaredLegs` mutated so a refusing included leg no
longer sets the refusal, leaving `CO-8` to return the sum of the legs that happened to
resolve — the silent-omission defect FR-022-008 exists to prevent. Same command,
mutation applied:

```text
=== RED (CO-8 skips a refusing leg instead of inheriting) ===
  ✗ FAIL: TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
  ✗ FAIL: TP-02-10: a leg whose figure was withdrawn makes CO-8 a refusal carrying that leg's own code, publishes the leg as unavailable with a null value rather than a zero, and carries the refusal through to the average rate, so no leg is ever treated as zero because it is unavailable
  ✗ FAIL: TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused RLTAX-THRESHOLD-UNAVAILABLE at settlement rather than applied, its leg carries no numeric value, and a withdrawn set ships as an AbsentFigure/v1 holding no numeric member at all
Research-Lab self-test: 3053 passed, 10 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-09: createEmptyWorkspace initializes both surtax bases to null, an undeclared basis refuses RLTAX-INPUT-INCOMPLETE naming the member it wants, CO-8 inherits that refusal instead of summing the legs that remain, and a declared zero computes a real zero carrying no refusal code
  ✓ TP-02-10: a leg whose figure was withdrawn makes CO-8 a refusal carrying that leg's own code, publishes the leg as unavailable with a null value rather than a zero, and carries the refusal through to the average rate, so no leg is ever treated as zero because it is unavailable
  ✓ TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused RLTAX-THRESHOLD-UNAVAILABLE at settlement rather than applied, its leg carries no numeric value, and a withdrawn set ships as an AbsentFigure/v1 holding no numeric member at all
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltax.js` printed nothing between the revert and the green run. Ten
assertions across this scope and the pre-existing Feature 021 and 022 groups caught the
mutation, which is the blast radius the scope's impact sweep predicted for `CO-8`.

### TP-02-11

Scenario SCN-022-004 — a threshold set whose `declaredFor` omits the declared tax
year is refused rather than applied and carries no numeric member.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused RLTAX-THRESHOLD-UNAVAILABLE at settlement rather than applied, its leg carries no numeric value, and a withdrawn set ships as an AbsentFigure/v1 holding no numeric member at all
```

The RED evidence for this row is the Probe D output immediately above, where the row
failed alongside TP-02-09 and TP-02-10 once the refusal stopped propagating.

### TP-02-12

Scenario SCN-022-004 — the modified-adjusted-gross completeness declaration is
populated and non-empty, and an empty list is proven to fail.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-12: the settlement publishes its modified-adjusted-gross measure as declared-incomplete with a non-empty list of unmodeled adjustments and the same value the surtax leg compared against, and a pack whose list is emptied is caught by the identical check rather than passing it
```

**Intended RED.** `rltax.js` mutated so the settlement's `modifiedAdjustedGross.complete`
is `true` whenever the pack carries a completeness block at all — presenting a measure
built from four income kinds as the statutory measure. Same command, mutation applied:

```text
=== RED (settlement presents the MAGI measure as complete) ===
  ✗ FAIL: TP-02-12: the settlement publishes its modified-adjusted-gross measure as declared-incomplete with a non-empty list of unmodeled adjustments and the same value the surtax leg compared against, and a pack whose list is emptied is caught by the identical check rather than passing it
Research-Lab self-test: 3062 passed, 1 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-12: the settlement publishes its modified-adjusted-gross measure as declared-incomplete with a non-empty list of unmodeled adjustments and the same value the surtax leg compared against, and a pack whose list is emptied is caught by the identical check rather than passing it
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltax.js` printed nothing between the revert and the green run. The
empty-list half of the row is proven inside the assertion itself: the same predicate is
applied to a pack whose `unmodeledAdjustments` array is emptied and must return false.

### TP-02-13

Scenario SCN-022-005 — both new basis members are inventoried, cleared and
redacted, each asserted independently.
Command: `node scripts/selftest.mjs`

```text
  ✓ TP-02-13: the privacy inventory names both declared surtax bases inside the household-values entry, the clear action removes the stored workspace carrying both declared amounts, and the export sanitizer covers both explicitly rather than dropping either without naming it in omittedFields
```

**Intended RED.** `rltaxworkspace.js` mutated to drop "the declared Medicare wage and
self-employment basis" from the workspace key's purpose text, so a household value would
be stored without being disclosed in the inventory. Same command, mutation applied:

```text
=== RED (wage basis dropped from the privacy inventory text) ===
  ✗ FAIL: TP-02-13: the privacy inventory names both declared surtax bases inside the household-values entry, the clear action removes the stored workspace carrying both declared amounts, and the export sanitizer covers both explicitly rather than dropping either without naming it in omittedFields
Research-Lab self-test: 3062 passed, 1 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-13: the privacy inventory names both declared surtax bases inside the household-values entry, the clear action removes the stored workspace carrying both declared amounts, and the export sanitizer covers both explicitly rather than dropping either without naming it in omittedFields
Research-Lab self-test: 3063 passed, 0 failed
```

`git status --short rltaxworkspace.js` printed nothing between the revert and the green
run.

**Finding for `bubbles.plan` — the DoD's "redacted" wording contradicts the shipped
sanitizer.** The Definition of Done item reads "Both new household values are
inventoried, cleared and redacted". The committed `sanitizeForExport` deliberately
**keeps** both declared bases in the exported workspace, exactly as it keeps the four
income amounts, and its stated contract is that a member it drops must be named in
`omittedFields[]` — "a field dropped without being listed is the defect this shape exists
to prevent". So the two members are *covered* by the sanitizer, not redacted by it. This
row asserts the behaviour that actually ships; the assertion was not weakened to fit the
wording, and the wording was not treated as satisfied. The DoD item stays open.

**Browser half — the URL, request, header and console clauses.** The engine-side inventory,
clear and export behaviour above is all a unit test can see. What only the real route can
show is that neither declared basis leaves the page. Added as a persistent title in this
scope's own spec:

```text
npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-005 neither declared surtax basis reaches a URL, a request, a referrer or a console message" --reporter=list

Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:245:1 › Regression: SCN-022-005 neither declared surtax basis reaches a URL, a request, a referrer or a console message (732ms)

  1 passed (2.4s)
PW_EXIT=0
```

The household declares two amounts chosen to be unmistakable in a transcript — neither is a
rule figure, neither is any other input on the page, and neither is a substring of one — and
both legs are asserted rendered first, so the scan runs against a page that actually held
both values. The scan then covers the address bar, every request URL, every request body,
**every request header value**, and every console message and page error.

**Two recorded misses, both fixed before the row was banked.** Neither is a defect in the
shipped page.

1. *The referrer channel was being read through the wrong API.* The first draft read
   `request.headers()`, whose synchronous view carries no `Referer` on this route. The
   referrer clause was therefore scanning an always-empty string.
2. *No request this page issues presents a `Referer` at all*, even through the async
   `allHeaders()`. A referrer-only clause is structurally vacuous here. The clause was
   widened to every request header value, which subsumes it — a value smuggled into the page
   URL reaches subsequent requests as `Referer`, and any other header carrying it is just as
   much a leak — and gives the scan a corpus that is provably non-empty.

Both misses were caught by the row's own non-vacuity clause rather than by inspection, and
both produced a real failing run before the fix:

```text
    Error: expect(received).toBeGreaterThan(expected)
    Expected: > 0
    Received:   0
    > 294 |   expect(requests.filter((entry) => entry.referrer.length > 0).length).toBeGreaterThan(0);
  1 failed
PW_EXIT=1
```

**Why this row carries an in-test negative control instead of a leak mutation.** Every
mutation that could make this assertion fail must, by construction, route a household value
into a URL, a header or the console — which is precisely the defect the row exists to
prevent, and precisely the defect a prior session left live in this repository as a real
`window.fetch("/rl-probe-telemetry.json?ordinary=" + …)`. No such probe was applied here and
none should be. Instead the detector is proven able to fail inside the test process only:
two control strings carrying the declared amounts are built and scanned without being
navigated, fetched, logged or rendered, and the scan must name all three planted
occurrences. A scan that could not name a planted value would have passed above for the
wrong reason.

### TP-02-14

Scenario SCN-022-004 — no module holds a surtax rate, threshold, jurisdiction name
or authority name, and the detector is proven to fire on a module that does.
Command: `node scripts/selftest.mjs`

Scope 01 widened the no-shadow scan across every `rltax*.js` module for **bracket
edges**. A surtax rate, a surtax threshold, a jurisdiction name and an authority id are
none of them a bracket edge, so none was reached by that scan. This row extends the same
standard to all four. The literal set is derived from the federal pack's threshold sets
and the name-token set from the pack's `sourceRecords[]` plus the committed state pack's
`jurisdiction` and `id`, so a figure either pack moves moves the scan with it.

```text
  ✓ TP-02-14: no rltax module on disk holds a surtax rate, a surtax threshold, a declared jurisdiction name or an authority id, and the detector is proven to fire on all four when one of each is planted in a different module (14 module(s), 5 rule literal(s), 10 name token(s); shipped findings: none)
```

**Intended RED.** The in-test half plants one rate, one threshold, one authority id and
one jurisdiction name in four different modules and requires the detector to name all
four. The on-disk half is proven separately by mutating `rltaxrules.js` to hold a real
surtax threshold literal. Same command, mutation applied:

```text
=== RED (a surtax threshold planted on disk in rltaxrules.js) ===
  ✗ FAIL: TP-02-14: no rltax module on disk holds a surtax rate, a surtax threshold, a declared jurisdiction name or an authority id, and the detector is proven to fire on all four when one of each is planted in a different module (14 module(s), 5 rule literal(s), 10 name token(s); shipped findings: rltaxrules.js:250000)
Research-Lab self-test: 3063 passed, 1 failed
=== REVERT ===
=== GREEN (same command) ===
  ✓ TP-02-14: no rltax module on disk holds a surtax rate, a surtax threshold, a declared jurisdiction name or an authority id, and the detector is proven to fire on all four when one of each is planted in a different module (14 module(s), 5 rule literal(s), 10 name token(s); shipped findings: none)
Research-Lab self-test: 3064 passed, 0 failed
```

`git status --short rltaxrules.js` printed nothing between the revert and the green run.
The RED verdict names the planted literal and the module holding it, so the scan is
reading the modules from disk rather than restating its own planted copy.

### Scenario SCN-022-004

`Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one" --reporter=list`

Delivered in this session. The spec file `<repo>/tests/lifetime-tax-surtax.spec.mjs` was
created and now carries the three persistent titles TP-02-15, TP-02-16 and TP-02-17 name.

Intended RED, before the file existed: the command resolved to `No tests found`, which is
the failure mode the row was in — a planned browser row that reported nothing while
appearing to be coverage. That is not a satisfying RED on its own, so a targeted
mutation RED is recorded under SCN-022-006 below.

GREEN, same command:

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:74:1 › Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one (837ms)

  1 passed (2.8s)
```

The scenario drives both halves over the real route. The computed half declares an
ordinary income of 260,000 against the single threshold of 200,000 and an
investment-income portion of 12,000, chosen so the CAP binds — the tax is the rate on
net investment income rather than on the 60,000 excess — because the capped direction is
the one an implementation that dropped the `lesser of` rule gets wrong. The refusal half
clears the declaration on the same page and asserts `RLTAX-INPUT-INCOMPLETE` naming
`otherOrdinaryNetInvestmentIncome`, that no `netInvestmentIncomeSurtax` figure is
rendered in its place, and that `headlineFederalTax` is absent too — the total inherited
the refusal rather than summing the legs that remain.

### Scenario SCN-022-005

`Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --reporter=list`

Delivered in this session. GREEN:

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:135:1 › Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis (874ms)

  1 passed (2.7s)
```

Three distinct figures at, immediately below and immediately above the threshold, each
derived from the pack's own threshold rather than pinned. The reads-exactly-one-member
clause is the load-bearing part: ordinary income is raised to 410,000 and the
investment-income portion to 50,000, each with the wage basis held, and the surtax must
be byte-identical after both. An implementation reading gross income instead of the wage
basis moves on the first of those and fails here.

### Scenario SCN-022-006

`Regression: SCN-022-006 added ordinary income moves one surtax and not the other`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --reporter=list`

Delivered in this session, with a targeted mutation RED and a same-command GREEN.

**Intended RED.** The mutation swapped the two arguments where `renderConversionAsymmetry`
publishes the asymmetry, so the page declared the Medicare leg movable and the
investment-income leg not — the exact inversion a reader could not detect by eye. Same
command:

```text
Running 1 test using 1 worker

  ✘  1 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:188:1 › Regression: SCN-022-006 added ordinary income moves one surtax and not the other (786ms)

  1) [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:188:1 › Regression: SCN-022-006 added ordinary income moves one surtax and not the other

    Error: expect(received).toContain(expected) // indexOf

    Expected value: "net-investment-income-tax"
    Received array: ["additional-medicare-tax"]

      230 |   const moved = (await line.getAttribute('data-rl-asymmetry-moved')).split(',');
      231 |   const notMoved = (await line.getAttribute('data-rl-asymmetry-not-moved')).split(',');
    > 232 |   expect(moved).toContain('net-investment-income-tax');
          |                 ^
      233 |   expect(notMoved).toContain('additional-medicare-tax');

  1 failed
```

The RED names the inverted set and the line that read it, so the assertion is reading the
rendered attribute rather than restating its own expectation.

**GREEN, after reverting the mutation, identical command:**

```text
Running 1 test using 1 worker

  ✓  1 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:188:1 › Regression: SCN-022-006 added ordinary income moves one surtax and not the other (678ms)

  1 passed (2.6s)
```

`git status --short` over the source, module, pack and test paths between the revert and
the green run showed only this scope's own two files — the page and the new spec — with
no stray probe file anywhere:

```text
 M lifetime-tax-strategy-lab.html
?? tests/lifetime-tax-surtax.spec.mjs
```

The scenario itself declares both bases past their thresholds, with the investment-income
portion large enough that the cap does NOT bind — if it bound, the leg would legitimately
hold still and the asymmetry would be untestable. Adding 50,000 of ordinary income alone
moves the investment-income surtax by exactly the rate applied to the added amount, and
leaves the Medicare surtax byte-identical.

### TP-02-18

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list`

Delivered in this session.

```text
  ✓  66 [system-chrome] › tests/lifetime-tax-retirement-route.spec.mjs:340:1 › Regression: SCN-024-015 a focused control survives a mode switch without being detached and a subsequent click registers (957ms)
  ✓  67 [system-chrome] › tests/lifetime-tax-use.spec.mjs:231:1 › Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense (929ms)
  ✓  68 [system-chrome] › tests/lifetime-tax-retirement-route.spec.mjs:370:1 › Regression: SCN-024-014 the request ledger stays empty with three new packs loaded and no retirement declaration reaches a URL (791ms)
  ✓  69 [system-chrome] › tests/lifetime-tax-use.spec.mjs:265:1 › Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition (887ms)

  69 passed (41.3s)
```

69 passed, zero failed, zero skipped. The count rose from the 66 this suite carried
before this session to 69, and the three added are exactly the three persistent titles
TP-02-15, TP-02-16 and TP-02-17 name — so the rise is the new coverage rather than a
selector change sweeping in scenarios another feature owns.

The selector is the alternation `SCN-021`, `SCN-022`, `SCN-023`, `SCN-024`, pinned to the
four owning spec numbers. It was run as `SCN-02[1-4]` and never as a bare `SCN-02`, which
would sweep in a concurrent session's `SCN-025` and `SCN-026` scenarios and make any
failure unattributable to this feature family.

One operational note recorded because it affects how this row must be run: an earlier
attempt started a second cumulative run while the first was still in flight, and the two
contended for the same static-server port and stalled. Both were terminated, the process
table was confirmed clear, and the run above is a single clean invocation. A stalled run
is not a failing run, and neither stalled attempt is reported here as evidence.

Re-run in this session after the privacy title was added, same command:

```text
Running 77 tests using 6 workers

Error: worker-0 process did not exit within 300000ms after stop, force-killed it
Error: worker-1 process did not exit within 300000ms after stop, force-killed it
Error: worker-5 process did not exit within 300000ms after stop, force-killed it
Error: worker-2 process did not exit within 300000ms after stop, force-killed it
Error: worker-4 process did not exit within 300000ms after stop, force-killed it
Error: worker-3 process did not exit within 300000ms after stop, force-killed it
Error: worker-3 process did not exit within 300000ms after stop, force-killed it

  77 passed (5.5m)
  7 errors were not a part of any test, see above for details
CUMULATIVE_EXIT=1
```

**77 passed, zero failed, zero skipped.** The trailing `worker-N … force-killed it` lines
are a known teardown fault in this harness, not test failures: Playwright reports them
separately as "errors … not a part of any test", and every one of the 77 tests is already
counted passed above them. They are the reason `CUMULATIVE_EXIT` is 1 while the suite
itself is clean, and they are reported here rather than filtered out.

The count rose from 69 to 77. One of the eight is this scope's added privacy title; the
other seven are `SCN-023` and `SCN-024` scenarios a concurrent session added to the same
feature family, which this selector legitimately sweeps because it is pinned to the four
owning spec numbers. No scenario outside `SCN-021` … `SCN-024` can enter or leave this row.

### TP-02-19

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

Before the appended group, on the committed tree:

```text
================================================
Research-Lab self-test: 3051 passed, 0 failed
================================================
```

After the appended group, same command:

```text
=== TP-02-19 selftest ===

================================================
Research-Lab self-test: 3064 passed, 0 failed
================================================
SELFTEST_EXIT=0
```

Thirteen assertions appended, zero pre-existing assertions edited, zero failures, and no
fall in the pre-existing pass count.

Re-run in this session after the three Simple/Power surfaces were built and the browser
spec was added, same command:

```text
=== TP-02-19 selftest ===

================================================
Research-Lab self-test: 3065 passed, 0 failed
================================================
```

Zero failed, and the pass count rose rather than fell. The rise of one is **not** this
scope's: `scripts/selftest.mjs` is unmodified by this session, and the new browser spec
is not referenced by the selftest at all — `node scripts/selftest.mjs | grep -c
"lifetime-tax-surtax"` returns `0`. The selftest reads `company-intelligence-lab.html`
and `rlcompanyintel.js` from disk, and both are being edited in-flight by a concurrent
session that owns them. The count was confirmed stable at 3065 across two consecutive
runs. What this row owes is that the count does not FALL and no assertion fails, and both
hold.

### TP-02-20

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

```text
=== TP-02-20 path guard ===
[spec-test-paths] scanned=677 references=14825 distinctPaths=243 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
PATHGUARD_EXIT=0
```

`missingPaths` equals `baseline` and `new=0`, so `scripts/validate-spec-test-paths.baseline`
was neither edited nor needed to be.

Re-run in this session after the browser spec was added, same command:

```text
=== TP-02-20 path guard ===
[spec-test-paths] scanned=677 references=14838 distinctPaths=244 missingPaths=67 baseline=67 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
exit=0
```

`distinctPaths` rose from 243 to 244 — the new spec file is now a real path this report
references — while `missingPaths` stayed at the baseline 67 with `new=0` and `stale=0`.
That is the useful reading: the added reference resolves to a file that exists, so the
baseline was neither edited nor needed to be.

### TP-02-21

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

```text
=== TP-02-21 pages plan ===
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/389a899499094a4f484a06ecc8903aa584524c3cf83b902f403a8d00f5a62cbe","omittedOrphanIndexes":143}
PAGES_EXIT=0
```

`site-exclusions.json` is proven byte-identical by the change-boundary status below.

Re-run in this session after the page work, same command:

```text
=== TP-02-21 pages build ===
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/004902309400a815a8ac1da2877422310e381d5c20748f711cbd0233e959a67a","omittedOrphanIndexes":144}
exit=0
```

`registeredPages` is still 28 and `excludedPaths` still 12, so the three new surfaces
added no root page and no second exclusion entry — the lifetime-tax route remains the one
unregistered page it already was. The `historyIndexDirectory` and `omittedOrphanIndexes`
differ because a concurrent session is writing brief history; neither is this scope's.

### TP-02-24

Scenario SCN-022-004 … -006 — every helper named in the Fixture Input Completion Register
declares both bases at `0` and changed no other input member; at least one fixture household
keeps both bases `null` and is refused `RLTAX-INPUT-INCOMPLETE` on each leg and on the total;
and every previously settled Feature 021 fixture value is byte-identical after completion.
Command: `node scripts/selftest.mjs`

The register row set is read out of `scope.md` at run time rather than restated in the test,
so a row added, a file renamed or a declared value changed in planning moves the assertion
with it. Each named helper is then proven on its own — bounded by its own closing marker —
and the file-wide FIC-4 sweep runs over every completion site that precedes this scope's own
group. The byte-identity clause settles one household twice against the **unmodified** Feature
021 pack, once with both bases undeclared and once completed at zero, and requires every stage
that feature published to be identical.

```text
  ✓ TP-02-24: the Fixture Input Completion Register read from the scope artifact carries four rows over two files each declaring both bases at 0; every named helper is found and proven to declare both; every completion site the register governs declares exactly 0, with only clone-borne probe households exempt and only by position; one fixture household keeps both bases null and is refused RLTAX-INPUT-INCOMPLETE on each leg and on the total; and against the unmodified Feature 021 pack every stage that feature published is byte-identical before and after completion (31 completion site(s), 8 Feature 021 stage(s), misses: none, non-zero: none)
Research-Lab self-test: 3106 passed, 0 failed
```

**Two recorded misses, both fixed before the row was banked.** Neither is a defect in the
shipped code; both are places where the first-draft assertion was wrong, and they are written
down here rather than quietly corrected.

1. *The file-wide sweep was too broad.* The first draft required every completion site in the
   register file to declare `0`, and it fired on `wageBearingL6` — a household this feature
   clones from an already-completed fixture and then deliberately re-declares so the `L6`
   exclusion clause has a wage basis to exclude. That is not a register completion. The rule
   now exempts a site only when its target was built by cloning.
2. *The clone exemption was too coarse, and survived its own mutation.* Exempting every
   identifier ever bound to a clone made the common name `workspace` globally exempt, so the
   PROBE 1 mutation below tripped only the named-helper clause and left the file-wide clause
   green. The exemption is now **positional**: a site is exempt only when the nearest preceding
   binding of that identifier is a clone, so a builder constructing from
   `createEmptyWorkspace()` is always governed. Both clauses fire on re-probe.

A third, smaller miss: bounding each helper body by a fixed character window truncated the
browser helper before its second field and reported a miss that was not there. Each body is
now bounded by its own closing marker.

**Intended RED, probe 1 — the static register half.** `scripts/selftest.mjs` line 14036, the
`strategyWorkspace` register completion, mutated from `= 0;` to `= null;`. The mutation is
value-free by construction: it substitutes a keyword literal and carries no rule figure and no
household amount. Pre-run guard confirmed the substitution landed on the intended line:

```text
-    workspace.investmentIncomeBasis.otherOrdinaryNetInvestmentIncome = 0;
+    workspace.investmentIncomeBasis.otherOrdinaryNetInvestmentIncome = null;
```

```text
  ✗ FAIL: TP-02-24: … (31 completion site(s), 8 Feature 021 stage(s), misses: strategyWorkspace:missing investmentIncomeBasis.otherOrdinaryNetInvestmentIncome = 0;, non-zero: 1)
Research-Lab self-test: 3097 passed, 4 failed
PROBE1_EXIT=1
```

Both static clauses fire together — the named-helper proof by name, and the file-wide sweep at
`non-zero: 1`. The three other failures are Feature 021's own conversion group, which settles
that helper's household; they are collateral to the probe and green again on revert.

**Intended RED, probe 2 — the runtime half.** `rltax.js` line 436, `CO-8`'s refusal
inheritance, mutated from `leg.includedInTotal === true` to `=== false`, so a refusing leg no
longer becomes the total. Value-free: a boolean keyword. Anchor uniqueness was checked before
the substitution (`anchor_count=1`) and the guard confirmed the landing:

```text
-      if (legUnavailable && refusal === null && leg.includedInTotal === true) refusal = record;
+      if (legUnavailable && refusal === null && leg.includedInTotal === false) refusal = record;
```

```text
  ✗ FAIL: TP-02-24: … (31 completion site(s), 8 Feature 021 stage(s), misses: none, non-zero: none)
Research-Lab self-test: 3095 passed, 11 failed
PROBE2_EXIT=1
```

Here the static clauses stay clean and the FIC-5 clause is what fails — the null-basis fixture
household no longer receives `RLTAX-INPUT-INCOMPLETE` on the total. The ten other failures are
every other refusal-propagation assertion in the repository, which is the correct blast radius
for removing refusal inheritance from the total.

**Same-command GREEN.** Each mutation was reverted inside the same shell invocation that
applied it. `git status --short` reported no tracked source file dirty and no stray probe
artifact, the anchor lines read their original text again, and the identical
`node scripts/selftest.mjs` returned `3106 passed, 0 failed`, `GREEN_EXIT=0` — the pre-existing
3105 plus this one appended assertion.

### TP-02-22

The supersession marker check: every distinct `SUP-022-NN` marker is a ledger id,
the delivered set equals Scope 01's eleven plus this scope's eight, each marked
region names its shape, and no assertion changed without a marker.
Command: `node scripts/selftest.mjs`

Not delivered in this session. This session appended a new group and edited no marked
region, so the delivered marker set is unchanged from what it was before this session
began; the row's own conformance assertion was not written.

### TP-02-23

The moved-versus-deleted and disjointness mutations, each demonstrated to fail.
Command: `node scripts/selftest.mjs`

Not delivered in this session. The third clause of this row depends on SUP-022-18's
cross-artifact `SIMPLE_FIELDS` identity, which cannot be written before the Simple panels
exist.

## Supersession Ledger

Not delivered in this session. No `SUP-022-NN` marked region was added, edited, relaxed
or removed. `git status --short` below is the evidence: the only files this session
changed are `<repo>/scripts/selftest.mjs` — by appending a marker-free group between the
existing final group and the summary block — and this scope's own two artifacts.

### Verification pass — 2026-08-20 — the three open items are each blocked, and two are blocked by their own wording (findings F-02-A and F-02-B)

**Claim Source:** executed. **Outcome: all three items stay `[ ]`.** They were
re-derived against the tree as it stands, not against a prior pass.

**Delivery census — the shared input.** Distinct `SUP-022-NN` markers actually
delivered across the five marker-bearing source files:

```
DELIVERED_DISTINCT=20
SUP-022-01 -02 -03 -04 -05 -06 -07 -08 -09 -10 -11 -12 -13 -14 -15 -16 -17 -20 -21 -22
SCOPE01_OWNED=12  delivered=12
SCOPE02_OWNED=8   delivered=6
SCOPE02_MISSING=  SUP-022-18, SUP-022-19
```

**Item — "Both owned supersessions and both amendments are delivered". STAYS `[ ]`.**
The census confirms the standing note: six of this scope's eight owned entries are
delivered and **SUP-022-18 and SUP-022-19 are not**. That alone decides the item;
no wording question arises. The item additionally carries the clause *"each seen to
fail against the unchanged implementation first"*, which is the same clause finding
**F-01-L** established is unanswerable against this repository's history — Features
021 and 022 landed in the single squashed commit `b9d92a3f1`, so no unchanged
implementation exists to run a replacement against. Scope 01's equivalent item was
restated to remove that clause; this one was not, so even delivering the two
missing entries would leave the item resting on an unanswerable clause.

**Item — "No assertion outside this scope's ledger entries and amendments was
edited, relaxed or deleted …". STAYS `[ ]`, and its two named provers cannot be
written as specified. Finding F-02-A.**

The standing note says the property holds but its rows were never written. The
property was re-checked and the note is consistent with the tree: `node
scripts/selftest.mjs` reports **3145 passed, 0 failed** in this session, so every
sourcing, tolerance, determinism, privacy and Feature 008 production-consumer
assertion the item names is present and passing rather than deleted or relaxed.
What cannot be produced is the proof the item demands, because **both named rows
are unbuildable as written**:

- **`TP-02-22` states an arithmetic the tree contradicts three ways.** The row
  requires asserting that "the delivered set equals Scope 01's **eleven** plus this
  scope's **eight** — **nineteen** in total". Against the census above, Scope 01
  owns and has delivered **twelve**, this scope has delivered **six** of eight, and
  the two scopes' delivered total is **eighteen** (twenty across all scopes). Every
  one of the three figures is wrong. Writing the row as specified would mean
  committing an assertion that is false against the artifact it describes; writing
  it correctly would mean silently substituting different numbers for the ones the
  plan states. The "eleven" is the same defect finding **F-01-I** recorded inside
  Scope 01 — where the owned-entry count was stated as twelve, eleven and seven in
  three places, and was reconciled to twelve — leaking across into this scope's Test
  Plan, which was never reconciled with it.
- **`TP-02-23` requires an adversarial case against a clause that does not exist.**
  Its fourth case demands that an implementation rendering a `data-rl-value` field
  in Simple outside `SIMPLE_FIELDS` "is demonstrated to fail **SUP-022-18's**
  cross-artifact identity". SUP-022-18 is one of the two undelivered entries. There
  is no clause to fail against, so the case cannot be built until the item above is
  delivered. Its other three cases — the moved-versus-deleted clauses of SUP-022-08
  and SUP-022-10, and SUP-022-03's disjointness — target delivered entries and are
  buildable today.

**What would make each decidable.** For `TP-02-22`: reconcile the row's counts with
the ledger the way Scope 01 reconciled its own — Scope 01 owns twelve, this scope
owns eight, so the delivered total is twenty once SUP-022-18 and -19 land and
eighteen until they do — and state the count once so it cannot drift again. A
shape-agreement check of the kind now running as `TP-01-22` would also catch the
class of defect this row is reaching for. For `TP-02-23`: build its three buildable
cases now and gate the fourth on SUP-022-18's delivery. Both are requirement-text
decisions and are routed to `bubbles.plan` rather than taken here.

**Item — "Every Test Plan row has intended RED and same-command GREEN evidence
recorded, including the browser rows". STAYS `[ ]`. Finding F-02-B.** This item is
the closure of the other two and inherits their blockers. Its standing note names
four rows still carrying no evidence — `TP-02-03`, `TP-02-22`, `TP-02-23` and
`TP-02-24`. Two of those four are the rows above, which cannot be written as
specified, so the item cannot close before they are reconciled. `TP-02-03` and
`TP-02-24` are not blocked by wording; both are buildable and neither was built or
run in this pass, so both are recorded `not-run` rather than assumed. The browser
half of this item's command was not run in this pass either.

**No file in this scope was mutated during this verification.** Every step was a
read-only census or the repository-wide selftest.

### Verification pass — 2026-08-20 (second) — SUP-022-18 and -19 were displaced by Feature 023 before this scope could deliver them (finding F-02-C)

**Claim Source:** executed, read-only. **Outcome: the item stays `[ ]`, but for a
materially different reason than the pass above recorded.** That pass established
*that* SUP-022-18 and SUP-022-19 are undelivered. It did not ask what had become of
the clauses they were written to supersede. They are gone — displaced by Feature
023, under Feature 023's markers.

**The superseded literals no longer exist.** Each of the four literals the two
ledger rows name was searched for as a fixed string in the file its row cites:

```
simpleFields.length === 7                selftest.mjs count=0
powerLinkDetails.length === 9            selftest.mjs count=0
powerLinkSections.length === 9           selftest.mjs count=0
toHaveCount(9)                           route.spec count=0
links.nth(3)                             route.spec count=1
```

Three of the four are absent. The only surviving text matching the first two is an
escaped regular expression inside Feature 023's own `TP-01-17`, which asserts those
literals are gone — it is the proof of absence, not a surviving instance.

**Which marker displaced each.** The replacements are present and marked, but the
marker on each is a Feature 023 id:

```
scripts/selftest.mjs:14411:  /* SUP-023-04: supersedes the pinned seven-member Simple field count; shape=derive.
scripts/selftest.mjs:14426:  /* SUP-023-05: supersedes the pinned nine-member withheld-detail and Power-section counts;
tests/lifetime-tax-route.spec.mjs:71:  /* SUP-023-06: supersedes the pinned nine-link count on the withheld-detail rows; shape=derive.
```

SUP-023-04's marker states its replacement as "cross-artifact identity between the
closed `SIMPLE_FIELDS` list and the fields the markup actually renders, in both
directions … every Simple-stays-decision-level clause is retained verbatim". That is
SUP-022-18's ledger replacement, in substance and very nearly in wording. SUP-023-06
delivers the two-directional link/section identity that is the first half of
SUP-022-19's replacement. A search for `SUP-022-18` or `SUP-022-19` across the five
marker-bearing files returns nothing outside the assembled-from-parts strings in
`TP-05-22`'s known-gap list, confirming neither id is delivered.

**Consequence for SUP-022-18 — not deliverable as work; this is a ledger decision.**
Every clause it was to supersede is already displaced and the replacement it names is
already in the tree under `SUP-023-04` and `SUP-023-05`. Attaching a `SUP-022-18`
marker to those regions would attribute one replacement to two features, which is
exactly the failure mode the marker census exists to prevent. Nothing remains that
this scope could build.

**Consequence for SUP-022-19 — one half is displaced, one half is real work.** Its
first clause, the pinned nine-link count, is displaced by SUP-023-06. Its second
clause is not: the positional focus expectation **survives** as `links.nth(3)` at
line 97 of the route spec, and SUP-023-06 replaced only the count, leaving the
ordinal selection untouched. "A selection by declared target instead of by ordinal"
is therefore still undelivered, still buildable, and collides with no Feature 023
entry.

**What would make the item decidable.** Record SUP-022-18 in the ledger as
superseded-in-substance by `SUP-023-04` and `SUP-023-05` — withdrawn rather than
delivered — so the item no longer asks this scope to deliver a replacement that
exists under another feature's id, and narrow SUP-022-19's row to the ordinal-
selection clause that is genuinely outstanding. Both are ledger-text decisions and
are routed to `bubbles.plan` rather than taken here. Until they are taken, the
item's own wording asks for something that cannot be built without double
attribution, so it stays `[ ]`.

**No file was mutated during this verification.** Every step was a fixed-string
search or a marker census.

## Change Boundary

Command: a path-scoped status check over the excluded list.

```text
=== change boundary: excluded paths must be byte-identical ===
 M notes/README.md
excluded_dirty_lines=0
=== full working tree ===
 M company-intelligence-lab.html
 M notes/README.md
 M notes/company-intelligence-lab.md
 M rlcompanyintel.js
 M scripts/selftest.mjs
 M specs/022-federal-preferential-and-state-income-tax/scopes/02-net-investment-income-and-additional-medicare-tax/report.md
 M specs/025-company-multi-horizon-intelligence-lab/report.md
 M specs/025-company-multi-horizon-intelligence-lab/scopes.md
 M specs/025-company-multi-horizon-intelligence-lab/state.json
 M specs/026-actionable-brief-brevity-and-cross-asset/scopes.md
 M tests/company-intelligence-lab.spec.mjs
 M tests/company-intelligence.unit.mjs
?? notes/us-israel-iran-conflict-market-scenarios-2026-08-19.md
?? notes/us-israel-iran-cross-asset-equity-screen-2026-08-19.md
```

`rlportfolio.js`, `rlportfolioanalytics.js`, `portfolio-survival-allocation.config.json`,
`specs/008-portfolio-survival-and-brief-lab/**`, `specs/021-*/**`, `rltaxstrategy.js`,
`tools.json`, `index.html`, `rlnav.js`, `briefs/**`, `data/**`, `watchlist.json`,
`site-exclusions.json`, `scripts/build-pages-site.mjs`,
`scripts/validate-spec-test-paths.baseline` and
`<repo>/tests/lifetime-tax-conversion.spec.mjs` are all byte-identical —
`excluded_dirty_lines=0`.

`notes/README.md` and the eleven other entries in the full-tree listing belong to a
concurrent session working Features 025 and 026; every one of them was already dirty
before this session's first command and none was touched here. `rltax.js`,
`rltaxrules.js`, `rltaxworkspace.js` and `tax-rules/federal/2026.json` are clean, which
is the proof that all eight mutation probes above were reverted rather than left behind.

## Claim Boundary

Command: a text scan over this scope's allowed paths.

```text
=== claim boundary scan over this scope's allowed paths ===
rltax.js:813:         labelled a complete federal tax. This is a structural member rather than page copy. */
claim_scan_exit=0
--- appended selftest group only ---
group_scan_exit=1
```

```text
2274:                            "The total federal income tax this settlement computed for the declared tax year, from the resolved rule pack only. It is not a
html_claim_hits=0
```

Two hits, both of them the rule being stated rather than broken: a comment in `rltax.js`
recording that no result is labelled a complete federal tax, and the page's own display
note saying the settled total "is not a complete federal tax". Zero probability claims,
zero lifetime figures, zero track records and zero error rates across `rltax.js`,
`rltaxrules.js`, `rltaxworkspace.js`, `tax-rules/federal/2026.json`,
`lifetime-tax-strategy-lab.html` and the appended selftest group.

## Completion Statement

Nine of the seventeen Definition of Done items are closed with executed evidence. The
eight that remain open are listed with their reason at the checkbox: three depend on the
Simple/Power panels and this scope's Playwright spec, which are not delivered; two depend
on the supersession-conformance rows, which depend on those panels; one depends on the
TP-02-03 compatibility comparison against the unmodified Feature 021 pack, which was not
executed; one depends on the Fixture Input Completion Register row; and one is the `BI-4`
retrieval, which an earlier session performed and this session cannot attest as its own.

One finding is returned to planning, recorded under TP-02-13: the DoD's "redacted"
wording for the two new household values contradicts the shipped `sanitizeForExport`,
which deliberately keeps both exactly as it keeps the four income amounts.

One weak-assertion miss is recorded rather than discarded, under TP-02-06: the first draft
of the asymmetry fixture had the investment-income base binding at both levels, so the
leg could not move and the row could not have proven what it claimed.

