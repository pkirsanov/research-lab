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

**Delivered 2026-08-20. Claim Source: executed.** The row was unwritable for as
long as it depended on the withheld-detail entry, which could not be delivered
while Scope 05's census pinned the tolerated marker gap to a literal pair of ids
(finding F-02-D). That census now derives its tolerance from the ledger's own
`Disposition` column and the entry is delivered, so the row was written.

It does **not** restate the Scope 05 census. That one closes marker-to-ledger
membership and is left untouched. This row adds the three clauses it does not
carry:

1. **The ownership arithmetic the Test Plan states, derived at run time.** The
   expected delivered set is Scope 01's owned ids, plus this scope's owned ids
   less the one the ledger dispositions `marker forbidden`, plus exactly those
   later-scope ids already present — each read out of the ledger's `Owning scope`
   and `Disposition` columns rather than pinned to a total that goes stale the
   next time a scope lands. The counts the row names are asserted as a
   cross-check on the derivation rather than in place of it: twelve owned by
   Scope 01, nine owned here, eight of those nine deliverable.
2. **Each marked region names its shape.**
3. **Containment.** No marker may sit in a lifetime-tax source, spec or page file
   outside the five this scope opened, which is how an assertion could otherwise
   be changed under a marker no census reads.

Green:

```text
  ✓ TP-02-22: the delivered marker set equals the set the feature ledger derives at run time — Scope 01’s owned ids, plus this scope’s owned ids less the one the ledger forbids, plus exactly those later-scope ids already present — every ledger row carries a recognised disposition, every delivered marker names its own shape, and no marker escapes the five opened files into another lifetime-tax source or spec (delivered 21, expected 21, shapeless [], escaped [])
Research-Lab self-test: 3175 passed, 0 failed
```

**A miss the first draft made, recorded rather than corrected in silence.** The
shape reader first anchored on the first appearance of an id. The reconciliation-leg
entry is legitimately cross-referenced from a neighbouring region that sorts
earlier in the file than its own declaration, so the row reported that entry as
declaring no shape when it plainly does. The reader now anchors on the
**declaration** form — the one occurrence that states what the entry supersedes —
and additionally requires **exactly one** declaration per id, so two declarations
of one id cannot let a later region claim a shape the ledger never assigned it.
That is strictly stronger than the first draft, not a relaxation of it.

**Intended RED through `scripts/red-green-probe.sh`.** The mutation is the defect
the row exists to catch: a delivered marker is removed from the region it marks,
leaving the assertion changed and nothing accounting for it. The mutation is a
comment rewrite and carries no household figure:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-22 a delivered supersession marker is removed from the region it marks
file:             tests/lifetime-tax-route.spec.mjs
mutation:         /* SUP-022-19: supersedes the positional  ->  /* Withheld-detail entry: supersedes the positional   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-22: the delivered marker set equals the set the feature ledger derives at run time — Scope 01’s owned ids, plus this scope’s owned ids less the one the ledger forbids, plus exa
green-exit:       0
green-summary:      ✓ TP-02-22: the delivered marker set equals the set the feature ledger derives at run time — Scope 01’s owned ids, plus this scope’s owned ids less the one the ledger forbids, plus exactly t
revert-verified:  yes (committed=3dfba4ff140d64bf3c638c8e100d565c68be9848 restored=3dfba4ff140d64bf3c638c8e100d565c68be9848)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

The mutation target is the route spec rather than `scripts/selftest.mjs` on
purpose. The harness refuses a dirty or untracked target with exit 4, and a
concurrent session holds uncommitted lines in the shared selftest, so probing the
file the assertion lives in was unavailable. Mutating an input the assertion reads
is the stronger probe anyway: it drives the row through the tree it is supposed to
be measuring rather than through its own source.

### TP-02-23

The moved-versus-deleted and disjointness mutations, each demonstrated to fail.
Command: `node scripts/selftest.mjs`

**Delivered 2026-08-20. Claim Source: executed.** All three cases the row names
are present, each demonstrated to fail against a mutated copy while the shipped
tree passes. Nothing on disk is mutated: the packs are deep clones and the route
spec is read as a string, so the demonstration cannot strand a live mutation the
way an in-file probe can.

1. **Moved versus deleted.** A pack clone with the surtax id removed from
   `unsupportedFeatures[]` *and* from `taxLegs[]` — deleted rather than moved —
   fails the clause the reconciliation entries share: absent from the contributor
   set **because** it became a declared leg. The shipped pack passes it.
2. **Disjointness.** A pack clone that lists the same id in both
   `unsupportedFeatures[]` and `taxLegs[]` fails disjointness, and the clone is
   asserted to actually carry the id so the case cannot pass vacuously. The
   shipped pack passes.
3. **Declared-target selection**, asserted over the route spec's own source text
   as the row requires. A copy of that source with the declared-target locator
   replaced by an ordinal fails the clause; the shipped source passes it. The
   replacement is asserted to have landed, so a no-op edit cannot report a
   discrimination that did not happen.

Comments are stripped before the third case reads the source, and that is
load-bearing rather than cosmetic: the marked region legitimately **names** the
superseded ordinal expectation in its own prose, so a scan that read the comment
would report the regression present in a tree that does not contain it.

Green:

```text
  ✓ TP-02-23: a pack that removes the surtax from the unavailable-contributor set without declaring a computed leg fails the moved-versus-deleted clause, a pack that lists the same id in both unsupportedFeatures[] and taxLegs[] fails the disjointness clause, and a route spec that selects a withheld-detail link by ordinal instead of by its declared target fails the declared-target clause — each against a mutated copy while the shipped tree passes all three
Research-Lab self-test: 3175 passed, 0 failed
```

**Intended RED through `scripts/red-green-probe.sh`.** The mutation reintroduces
the exact regression the third case exists to forbid — the route spec selects a
withheld-detail link by ordinal again:

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-23 the route spec reverts to selecting a withheld-detail link by ordinal
file:             tests/lifetime-tax-route.spec.mjs
mutation:         page.locator(`#powerLinkRows button[data-power-section="${FOCUS_TARGET}"]`)  ->  links.nth(3)   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-23: a pack that removes the surtax from the unavailable-contributor set without declaring a computed leg fails the moved-versus-deleted clause, a pack that lists the same id in both 
green-exit:       0
green-summary:      ✓ TP-02-23: a pack that removes the surtax from the unavailable-contributor set without declaring a computed leg fails the moved-versus-deleted clause, a pack that lists the same id in both unsupp
revert-verified:  yes (committed=3dfba4ff140d64bf3c638c8e100d565c68be9848 restored=3dfba4ff140d64bf3c638c8e100d565c68be9848)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

### The marker completion this delivery required

The shape clause found one real gap in the tree before it could pass: the
declared-edge entry's marked region opened `SUP-022-20.` with a period and carried
no `shape=` token, while this scope's own ledger assigns it `derive`. Its comment
was completed to the declaration form the other twenty carry. That is a comment
edit inside a marked region **this scope owns**; no assertion text, condition or
message was touched, and the pass count did not fall.

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

### Verification pass — 2026-08-20 (third) — SUP-022-19's narrowed clause is buildable and was built, but delivering it turns Scope 05's TP-05-22 red; all three items stay `[ ]` (finding F-02-D)

**Claim Source:** executed. **Outcome: all three open items stay `[ ]`.** The
correction `bubbles.plan` recorded at `63fbf797b` for finding **F-02-C** is sound as
far as it goes — SUP-022-19's surviving clause is real, buildable work, and it was
built and proven here before being reverted. What the correction did not carry is the
consequence that delivering it has for a later scope's already-green assertion, which
is a planning decision this agent may not take on its own.

**The narrowed clause was delivered and proven, then reverted.** The positional
`links.nth(3)` focus expectation is the last ordinal selection of a withheld-detail
link anywhere in the suite; every other caller — the rental, retirement-route and
state specs — already selects by `data-power-section`. The replacement selects the
bracket-detail link by the target it declares, pins that the declaration is
unambiguous for that target, and derives the focus expectation from the clicked
link's own attribute instead of a literal.

*Intended RED.* The bracket-detail row's declared section was retargeted in the page
— a value-free markup change, no household figure anywhere near it — and the row
failed on the new assertion:

```
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "SCN-021-013 Simple opens first" --reporter=list
    > 109 |   await expect(bracketDetailLink).toHaveCount(1);
          |                                   ^
      - waiting for locator('#powerLinkRows button[data-power-section="power-bracket-detail"]')
        14 × locator resolved to 0 elements
           - unexpected value "0"
  1 failed
    [system-chrome] › <repo>/tests/lifetime-tax-route.spec.mjs:37:1 › Regression: SCN-021-013 ...
```

*Same-command GREEN.* The probe was reverted inside the same shell invocation that
applied it, and the identical command was re-run:

```
$ npx --no-install playwright test --config=playwright.config.mjs \
    --project=system-chrome --grep "SCN-021-013 Simple opens first" --reporter=list
  ✓  1 [system-chrome] › <repo>/tests/lifetime-tax-route.spec.mjs:37:1 › Regression: SCN-021-013 ... (1.1s)
  1 passed (3.3s)
```

*Control proving the replacement is stronger, not merely different.* A RED alone does
not earn the word "supersedes" — the superseded ordinal would also have failed the
retarget above. The mutation that separates them is the one the page's own source
comment says the product must avoid: *"Appended rather than inserted: a prior
feature's browser row follows a link by position, so an inserted row would silently
retarget it."* A row was inserted ahead of the bracket-detail row and both forms were
run against it:

```
A. replacement, row inserted ahead   → 1 passed (879ms)
B. superseded ordinal, same insertion → 1 failed
```

The replacement survives; the ordinal does not. That is the constraint the narrowed
clause removes — a test dictating the order of a production array — and it is why the
clause is a strengthening rather than a rewrite.

**Finding F-02-D — the blocker the correction did not foresee.** With the marker
delivered, `node scripts/selftest.mjs` fell from 3155 passed / 0 failed to **3154
passed / 1 failed**:

```
  ✗ FAIL: TP-05-22: every SUP-022 marker delivered in the source maps to a ledger row,
    every ledger row except the two pre-existing unmarked Scope 02 rows named here is
    delivered, the ids stay inside the declared range, and the ledger total agrees with
    the paragraph that states it
```

Scope 05's TP-05-22 pins the tolerated gap as an exact list of **two** ids, assembled
from parts so the scanner does not count them as delivered, and compares it with
`JSON.stringify` — deliberately, so that "a third undelivered marker, or a delivered
marker with no ledger row, fails immediately". Delivering SUP-022-19 shrinks the real
gap to one id and the pinned equality no longer holds. The remedy is a one-line
tightening of that literal from two tolerated gaps to one, which is strictly stronger
than what stands today.

**Why this agent did not take it.** The remedy edits an assertion that belongs to
Scope 05, and the very DoD item it would unblock reads *"No assertion outside this
scope's ledger entries and amendments was edited, relaxed or deleted."* Feature 022
already has a shape for this — Scope 02 amends Scope 01's SUP-022-04 and SUP-022-09
replacements, and the ledger records it in an `Amending scope` column so an auditor is
not surprised by a second edit to the same line. No such amendment exists for
TP-05-22. Editing it anyway would close one item by silently breaching another, which
is the trade this item exists to refuse. The delivery was therefore reverted:
`tests/lifetime-tax-route.spec.mjs` is byte-identical to `569f7899c`, the live
`links.nth(3)` call is back, no `SUP-022-19` marker exists anywhere, no page or
fixture is dirty, and `node scripts/selftest.mjs` is back to **3155 passed, 0 failed**.

**What would make this decidable.** Either (a) `bubbles.plan` records an amendment
authorising SUP-022-19's delivery to tighten Scope 05's TP-05-22 tolerated-gap list
from `{18, 19}` to `{18}`, with the `Amending scope` column carrying it exactly as it
carries the SUP-022-04 and SUP-022-09 amendments; or (b) Scope 05's TP-05-22 is
restated to derive its tolerated gap from the ledger's own disposition column — the
row for SUP-022-18 already records superseded-in-substance — instead of pinning a
literal pair, which is the same defect shape as the stale totals TP-02-22 was itself
corrected to stop pinning.

**Consequences for the three open items, each re-derived against the tree.**

*Item — the eight deliverable supersessions.* Stays `[ ]`. Seven of the eight markers
are present in the tree (03, 08, 10, 14, 20 in `scripts/selftest.mjs`, 15 in the
federal spec, 16 in the route spec); SUP-022-19 is the eighth and is absent, for the
reason above. `SUP-022-18` correctly appears nowhere. The item cannot tick on seven of
eight, and the item's further requirement — that each of the eight was seen to fail
against the unchanged implementation first and carries its adversarial evidence — was
not re-derived for the seven here and is not claimed.

*Item — no assertion outside this scope's entries was edited.* Stays `[ ]`. Nothing
was edited: the working tree carries no change to `scripts/selftest.mjs` or any
Feature 021 spec from this session. But TP-02-22 and TP-02-23, the rows that would
prove it, are still unwritten, and both now depend on SUP-022-19. TP-02-22's expected
set is Scope 01's twelve plus this scope's eight deliverable ids plus later-scope ids
already present; the delivered set today is twenty ids and the expected set is
twenty-one, so the row as corrected would fail on the missing SUP-022-19 rather than
on anything it is meant to catch. TP-02-23's third case asserts SUP-022-19's narrowed
declared-target clause over the route spec's own source text, which cannot be asserted
while the clause is absent. Writing either row before the marker lands would produce a
row that fails for a reason it does not name.

*Item — every Test Plan row has intended RED and same-command GREEN.* Stays `[ ]`.
TP-02-22 and TP-02-23 carry no evidence for the reason above, and TP-02-03 carries
none either; its section records that the compatibility comparison against the
unmodified Feature 021 pack was not performed.

No file is left mutated by this pass. `git status --short` over this scope's product
surfaces, the five marker files and the route page is empty, and the only paths this
session changed are Feature 022's own scope and report artifacts.

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

### Planning correction — 2026-08-20 — TP-05-22's tolerated gap is derived from the ledger, not pinned (finding F-02-D)

**Claim Source:** executed. **Outcome: option (a) taken — the assertion is restated
to derive, and the `scripts/selftest.mjs` edit it needs is specified below and routed
rather than applied.** F-02-D was verified against the tree before anything was
changed: `links.nth(3)` at line 97 of `tests/lifetime-tax-route.spec.mjs` is the only
ordinal link selection anywhere under `tests/`; the page's own source comment at
`lifetime-tax-strategy-lab.html` line 1741 reads *"Appended rather than inserted: a
prior feature's browser row follows a link by position, so an inserted row would
silently retarget it"*; no `SUP-022-19` marker exists in `scripts/selftest.mjs` or any
spec under `tests/`, so the delivery is genuinely reverted; and `node
scripts/selftest.mjs` is `3155 passed, 0 failed` at exit 0.

**Why (a) rather than (b).** Option (b) — record a `TP-05-22` amendment in the
`Amending scope` column and tighten the tolerated pair from `{18, 19}` to `{18}` —
closes this instance and rebuilds the defect one id smaller. `{18}` is still a literal
pin, and it goes stale the next time a row is legitimately deferred or a displaced row
is re-dispositioned. Option (a) removes the class of failure rather than the instance,
and it is the correction already applied to this scope's own `TP-02-22`, which was
restated to read the ledger's owning-scope column at run time *"rather than pinned to a
literal total, because Scope 03's SUP-022-22 is already delivered and any fixed total
goes stale the next time a scope lands"*. Nothing blocked (a): the ledger's 22 rows
carry no embedded pipes, and the only programmatic reader of `spec.md` matches the
leading id cell, so a new column is safe to add.

**What was changed, and by whom it is owned.** `spec.md`'s supersession ledger gained a
`Disposition` column with three values — `marker required` (20 rows), `marker forbidden
— <reason>` (SUP-022-18) and `marker pending — <reason>` (SUP-022-19) — plus the
paragraph above the table that defines them. Scope 05's ledger-closure DoD item was
restated to derive its tolerance from that column; it remains `[ ]` and no checkbox was
ticked. `design.md`'s marker-check step 4 was restated from *"the delivered id set
equals the set the completed scopes own"* to the derived form, and its per-file marker
distribution no longer assigns SUP-022-18 to `scripts/selftest.mjs`, which the
disposition forbids. The last two were already routed to `bubbles.design` by this
scope's second verification pass and are now answered. The edited requirement text
lives in Scope 05 and in `design.md` rather than in this scope, which is the point of
routing the finding to planning: ledger and requirement text is planning-owned across
the whole feature, whereas an implementing scope editing another scope's assertion is
exactly what this scope's own DoD item forbids.

**The routed `scripts/selftest.mjs` change — specified, not applied.** That file is
shared with a concurrent session appending to it continuously, so it is untouched here.
Replace the block that currently ends at the `TP-05-22` assertion with:

```js
  /* The supersession ledger is closed, derived rather than pinned. This check formerly compared
     the unmarked-row set against a fixed pair of ids under JSON.stringify, so delivering either of
     them shrank the real gap and turned a green assertion red — a self-staling contract that made
     provable work unlandable (finding F-02-D). The tolerance is now read out of the ledger's own
     Disposition column at run time: a row may go unmarked only where the ledger dispositions it
     away, and a row it dispositions marker-forbidden must carry no marker anywhere, a direction the
     pinned form never asserted. Ids are still never written literally here, so naming one cannot
     make the scanner count it as delivered. */
  const markerFiles = ['scripts/selftest.mjs', 'tests/lifetime-tax-foundation.spec.mjs',
    'tests/lifetime-tax-federal.spec.mjs', 'tests/lifetime-tax-marginal.spec.mjs', 'tests/lifetime-tax-route.spec.mjs'];
  const deliveredMarkers = new Set();
  markerFiles.forEach((file) => {
    (read(file).match(/SUP-022-\d{2}/g) || []).forEach((marker) => deliveredMarkers.add(marker));
  });
  const MARKER_PREFIX = 'SUP-022-';
  const specText = read('specs/022-federal-preferential-and-state-income-tax/spec.md');
  const ledgerIds = [];
  const ledgerDisposition = new Map();
  (specText.match(/^\| (SUP-022-\d{2}) \|.*$/gm) || []).forEach((row) => {
    const cells = row.split('|').map((cell) => cell.trim());
    ledgerIds.push(cells[1]);
    const hit = /^marker (required|forbidden|pending)(?: \u2014 (\S.*))?$/.exec(cells[5] || '');
    if (hit) ledgerDisposition.set(cells[1], { token: hit[1], reason: hit[2] || '' });
  });
  const deliveredList = Array.from(deliveredMarkers).sort();
  const ledgerList = ledgerIds.slice().sort();
  const dispositionToken = (marker) =>
    (ledgerDisposition.has(marker) ? ledgerDisposition.get(marker).token : null);
  /* An unreadable or absent Disposition cell is a parse failure, not a free pass, and a tolerated
     disposition carrying no reason after the em dash cannot be used to silence a real gap. */
  const undispositionedRows = ledgerList.filter((marker) => dispositionToken(marker) === null);
  const toleratedWithoutReason = ledgerList.filter((marker) => dispositionToken(marker) !== null
    && dispositionToken(marker) !== 'required'
    && ledgerDisposition.get(marker).reason.length === 0);
  const toleratedUnmarked = ledgerList.filter((marker) => dispositionToken(marker) === 'forbidden'
    || dispositionToken(marker) === 'pending');
  const unmarkedLedgerRows = ledgerList.filter((marker) => deliveredList.indexOf(marker) < 0);
  const markersWithoutLedgerRow = deliveredList.filter((marker) => ledgerList.indexOf(marker) < 0);
  const unexplainedUnmarked = unmarkedLedgerRows.filter((marker) => toleratedUnmarked.indexOf(marker) < 0);
  const forbiddenButMarked = ledgerList.filter((marker) => dispositionToken(marker) === 'forbidden'
    && deliveredList.indexOf(marker) >= 0);
  assert(deliveredList.length > 0
    && undispositionedRows.length === 0
    && toleratedWithoutReason.length === 0
    && markersWithoutLedgerRow.length === 0
    && unexplainedUnmarked.length === 0
    && forbiddenButMarked.length === 0
    && toleratedUnmarked.length < ledgerList.length
    && ledgerList.every((marker) => /^SUP-022-(0[1-9]|1[0-9]|2[0-2])$/.test(marker))
    && deliveredList.indexOf(MARKER_PREFIX + '22') >= 0
    && specText.indexOf('Twenty-two pre-existing assertions are superseded') >= 0
    && ledgerList.length === 22,
  'TP-05-22: every delivered marker maps to a ledger row, every ledger row carries a recognised disposition with a reason where one is owed, every row the ledger dispositions marker-required is delivered, every row it dispositions marker-forbidden carries no marker anywhere, the tolerated gap is read out of the ledger rather than pinned to a literal pair, the tolerated set never covers the whole ledger, the ids stay inside the declared range, and the ledger total agrees with the paragraph that states it');
```

**The routed logic was executed against the tree before being written down**, as a
standalone reader over the real `spec.md` and the real five marker files, so this is a
measured result rather than a proposal:

```
delivered=20 ledger=22
undispositioned=[]
toleratedWithoutReason=[]
toleratedUnmarked=["SUP-022-18","SUP-022-19"]
unmarkedLedgerRows=["SUP-022-18","SUP-022-19"]
unexplainedUnmarked=[]
forbiddenButMarked=[]
VERDICT_TODAY=true
VERDICT_AFTER_19_DELIVERED=true
ADVERSARIAL_drop_07_marker_unexplained=["SUP-022-07"]
ADVERSARIAL_mark_18_forbiddenButMarked=["SUP-022-18"]
```

`VERDICT_TODAY=true` means the change is not a regression — it passes on the tree as it
stands. `VERDICT_AFTER_19_DELIVERED=true` is the defect being removed: the same input
with a `SUP-022-19` marker added still passes, so the delivery `bubbles.test` built and
reverted can now land without editing anything Scope 05 owns.

**Adversarial cases that still fail.** Two, and the second is a protection the pinned
form never had. First, **a marker genuinely missing with no recorded disposition**:
dropping `SUP-022-07`'s marker — a row dispositioned `marker required` — leaves it in
`unexplainedUnmarked`, and the assertion fails. Deferring a row is therefore only ever
tolerated when the ledger says so in writing, with a reason. Second, **a marker
attached to a displaced row**: adding a `SUP-022-18` marker anywhere puts it in
`forbiddenButMarked`, and the assertion fails, because that would attribute one
replacement to both this feature and Feature 023. The old form compared unmarked-set
equality and would have accepted that mutation silently. Two further degenerate paths
are closed: a `Disposition` column that went missing or unparseable makes every row
`undispositioned` and fails rather than tolerating everything, and a column that
dispositioned every row away trips `toleratedUnmarked.length < ledgerList.length`, so
the check cannot be made vacuous. On an empty ledger `ledgerList.length === 22` and
`deliveredList.length > 0` both fail.

**Sequencing.** The routed edit must land before `SUP-022-19` is delivered again.
Delivering the marker first, against the pinned form still in the file, reproduces
F-02-D exactly.

### Delivery — 2026-08-20 — SUP-022-19 is landed, in the mandated order

**Claim Source:** executed. The sequence was honoured: the routed derived form went
into `scripts/selftest.mjs` first and the suite was measured green on both sides of
that edit, and only then was the marker delivered. Every premise was re-derived
against the tree rather than carried over from the previous pass.

**Premises, re-derived.** A regex sweep of the whole `tests/` tree for an ordinal
link selection returns exactly one hit — `links.nth(3)` at line 97 of the route
spec — so the clause the ledger narrows SUP-022-19 to was still live and still the
last of its kind. The page's own source comment is present verbatim above the
withheld-detail row it protects: *"Appended rather than inserted: a prior feature's
browser row follows a link by position, so an inserted row would silently retarget
it"*. Index 3 of `POWER_LINK_ROWS` was read out of the page and is the
`power-bracket-detail` row, which is what the superseded expectation focused.

**What was delivered.** The positional click is replaced by a selection on the
target the link itself declares, preceded by a uniqueness assertion so a duplicated
declaration cannot let the click resolve to an arbitrary member:

```js
  const FOCUS_TARGET = 'power-bracket-detail';
  expect(targeted.filter((section) => section === FOCUS_TARGET).length).toBe(1);
  const targetedLink = page.locator(`#powerLinkRows button[data-power-section="${FOCUS_TARGET}"]`);
  await expect(targetedLink).toHaveCount(1);
  await targetedLink.click();
```

Nothing was relaxed: the two expectations that follow the click — Power becoming
pressed and the owning section taking focus — are unchanged in substance, and the
focus assertion is now derived from the same declared target rather than repeating
it as a literal.

**Intended RED, value-free, reverted inside the invocation that applied it.**
Retargeting the locator at a section the page never declares — the token the spec
already carries as a negative control — makes the selection resolve to nothing:

```
exit: 1
    Error: expect(locator).toHaveCount(expected) failed
    Locator:  locator('#powerLinkRows button[data-power-section="power-not-declared-by-this-route"]')
    Expected: 1
    Received: 0
        14 × locator resolved to 0 elements
  1 failed
```

The probe was reverted in the same shell invocation that applied it;
`git status --porcelain` for that path returned zero lines immediately afterwards.

**Same-command GREEN on the reverted tree**, the identical command:

```
exit: 0
  ✓  1 [system-chrome] › <repo>/tests/…route spec:37:1 › Regression: SCN-021-013 Simple
      opens first with a decision level answer and Power holds the detail (1.4s)
  1 passed (3.3s)
```

**Control — the replacement survives a row insertion the ordinal does not.** One
value-free row (`detail: "Probe row"`, pointing at an already-declared section) was
inserted immediately before the `power-bracket-detail` row, so the row the ordinal
counted to moved. Under that one mutation the two forms diverge:

```
CONTROL 1 — delivered declared-target form   exit: 0   1 passed (3.7s)
CONTROL 2 — superseded ordinal form          exit: 1   1 failed
    Error: expect(locator).toBeFocused() failed
    Locator:  locator('#power-bracket-detail')
    Expected: focused
    Received: inactive
```

That is the defect the page's comment was standing in for, now asserted instead of
commented. Both mutations were reverted inside the same invocation and
`git status --porcelain` for both paths returned zero lines afterwards.

**A first attempt at this control was invalid and is recorded rather than
discarded.** The insertion was applied with a brace-delimited substitution that
failed to compile, so the guard counted zero inserted rows while both runs went
ahead against an unmutated page — the ordinal form passed, which proves nothing.
The control was rerun with a landing guard that aborts and reverts unless exactly
one row is inserted; the numbers above are from that run.

**Effect on the derived ledger check.** With the marker present,
`node scripts/selftest.mjs` reports `3155 passed, 0 failed`. Against the pinned form
this same tree was `3154 passed, 1 failed` — that is F-02-D, and it is now closed by
construction rather than by deferring the work.

### The no-edit property, derived from history rather than asserted

The sibling Definition of Done item asks that no assertion outside this scope's
ledger entries and amendments was edited, relaxed or deleted. Every prior pass
recorded that property as an assertion of the author, which is exactly the shape
the item's own closing sentence refuses. It is derived here instead, from the
only channel that can falsify it: the deletion set of this scope's commits.

Three commits touch source in this scope. Their whole footprint over the five
opened files is below, and the **deletion** column is the one that matters —
an insertion cannot relax an assertion that is still present.

```text
c580636d6  scripts/selftest.mjs              170 insertions(+), 1 deletion(-)
64f50a325  scripts/selftest.mjs               37 insertions(+), 13 deletions(-)
4558c0f3c  tests/lifetime-tax-route.spec.mjs  14 insertions(+), 2 deletions(-)
```

All sixteen deleted lines are accounted for individually, and none is an
assertion outside this scope's entitlement:

```text
c580636d6 (1)  -  /* SUP-022-20. TP-03-05: every declared band edge renders as a step. The expected edge set is
64f50a325 (13) -  /* The supersession ledger is closed: every delivered marker maps to a ledger row. */
               -  const ledgerRows = new Set((specText.match(/^\| (SUP-022-\d{2}) \|/gm) || [])
               -    .map((row) => /SUP-022-\d{2}/.exec(row)[0]));
               -  const ledgerList = Array.from(ledgerRows).sort();
               -  /* Two Scope 02 replacements were delivered without their markers before this scope began. The
               -     gap is named individually here rather than tolerated by a loose comparison, so a third
               -     undelivered marker, or a delivered marker with no ledger row, fails immediately. The ids are
               -     assembled from parts so that naming them here does not make the scanner see them as
               -     delivered. */
               -  const MARKER_PREFIX = 'SUP-022-';
               -  const KNOWN_UNMARKED_LEDGER_ROWS = [MARKER_PREFIX + '18', MARKER_PREFIX + '19'];
               -    && JSON.stringify(unmarkedLedgerRows) === JSON.stringify(KNOWN_UNMARKED_LEDGER_ROWS)
               -  'TP-05-22: every SUP-022 marker delivered in the source maps to a ledger row, every ledger row except the two pre-exi
4558c0f3c (2)  -  await links.nth(3).click();
               -  await expect(page.locator('#power-bracket-detail')).toBeFocused();
```

Read row by row:

* The single deletion in `c580636d6` is a **comment header**, not an assertion.
  The declared-edge region opened `SUP-022-20.` with a period and carried no
  `shape=` token; it was completed to the declaration form the other twenty
  carry, inside a region this scope owns. No condition, no message, no operand.
* The thirteen in `64f50a325` are the whole of the TP-05-22 block that
  `bubbles.plan` restated — a **recorded amendment**, committed separately at
  `946026a9e` as the ledger change and landed here as the code change. The
  deleted form pinned its tolerated marker gap to the literal pair
  `[…'18', …'19']` under `JSON.stringify`; the replacement derives that
  tolerance from the ledger's own `Disposition` column and additionally asserts
  a direction the pinned form never did — that a row dispositioned marker
  forbidden carries no marker anywhere. Strictly stronger, and amended rather
  than self-authorised.
* The two in `4558c0f3c` are **exactly** SUP-022-19's superseded target: the
  positional `links.nth(3)` click and the focus expectation that followed it.
  That is the ledger entry's stated content, deleted because it was replaced.

Nothing else was removed **by this scope**. The three commits above are its
whole source footprint, and the two spec files it did not commit to — the
foundation and marginal specs — report **zero** deletions across the entire
feature-family window. So no sourcing rule, tolerance, determinism, privacy,
zero-network or Feature 008 canary is in this scope's deletion set, because that
set is these sixteen lines and no others.

**A first draft of this paragraph misattributed two lines, and the correction is
recorded rather than made silently.** The federal spec also carries two deleted
lines across the feature-family window, and the draft claimed them for
SUP-022-15, which this scope owns. That is false. `git log` names their commits
as `b7564960a` and `09dceb6fb`, both **Scope 01** commits, and both deletions are
comment prose rather than assertions:

```text
-     household and the zero-valued-headline clause; shape=partition. The pack now carries the
-     a gain stacked on top of ordinary taxable income. */
```

The corrected reading is stronger for this item, not weaker: this scope deleted
**nothing** in the federal spec, so its deletion set is the sixteen lines above
and is confined to two files.

**The forbidden marker.** `SUP-022-18` appears nowhere in the five opened files.
That is not asserted here — TP-02-22 reports `escaped []` and TP-05-22's
`forbiddenButMarked` clause fails if a row the ledger dispositions marker
forbidden ever acquires one. Both are green in the same run.

**The two proving rows are now written and green**, which is the condition the
item's own closing sentence set:

```text
  ✓ TP-02-22: … (delivered 21, expected 21, shapeless [], escaped [])
  ✓ TP-02-23: … each against a mutated copy while the shipped tree passes all three
Research-Lab self-test: 3175 passed, 0 failed
```

### The seven re-derived intended REDs — one per deliverable marker

The supersession item asks that each of the eight deliverable replacements was
**seen to fail against the unchanged implementation first**. The fourth pass
re-derived that for the withheld-detail entry only and refused to claim it for
the other seven. It is derived here for all seven, each through
`scripts/red-green-probe.sh`, so the revert is structural rather than
remembered.

Every probe is designed to the same standard: the mutation reintroduces the
**precise defect the replacement exists to catch**, and — where the superseded
form was a literal count — it is chosen so that the superseded literal would
still have passed. That is what makes the probe evidence about the
*replacement* rather than about the suite in general. None carries a rule
figure or a household amount.

`--summary-match` is bound to the owning assertion's own name in every block, so
the RED line names what fell rather than only reporting that something did.

| Marker | Owning assertion | Mutation reintroduces |
| --- | --- | --- |
| SUP-022-03 | `TP-01-01` | the surtax deleted from the declared legs while still absent from `unsupportedFeatures[]`, so its id lands in no accounting set |
| SUP-022-08 | `SCN-021-009` (marginal spec) | one rendered contributor domain substituted **at unchanged count** |
| SUP-022-10 | `TP-03-07` | the engine dropping a `movesMarginalRate` contributor the pack still declares |
| SUP-022-14 | `TP-02-05` | tax-exempt interest folded back into the investment-income base, which `L6` forbids |
| SUP-022-15 | `SCN-021-006` (federal spec) | the settled legs rendered in reverse order **at unchanged count** |
| SUP-022-16 | `SCN-021-013` (route spec) | the same reversal, in the file that owns the Power rendering |
| SUP-022-20 | `TP-03-05` | a declared band edge no longer flagged a step, so the curve smooths it |

Three of these are deliberately **count-preserving**. SUP-022-08 superseded
`Unavailable contributors: 14` and `toHaveCount(14)`; SUP-022-15 and SUP-022-16
each superseded `toHaveCount(5)`. A substitution at constant count and an
order reversal both leave those literals satisfied, so each probe fails only
because of the clause the supersession added.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-03 the investment-income surtax is deleted from the declared legs while still absent from unsupportedFeatures, so its id belongs to no accounting set
file:             rltaxrules.js
mutation:         return Object.freeze(pack.taxLegs.slice());  ->  return Object.freeze(pack.taxLegs.filter(function (leg) { return leg.legId !== "net-investment-income-tax"; }));   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-01-01: every one of Feature 021’s eighteen unsupported ids is in exactly one of unsupportedFeatures[], taxLegs[], the itemised composition, the pack’s inclusion policy and the pack�
green-exit:       0
green-summary:      ✓ TP-01-01: every one of Feature 021’s eighteen unsupported ids is in exactly one of unsupportedFeatures[], taxLegs[], the itemised composition, the pack’s inclusion policy and the pack’s me
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-08 one rendered contributor domain is substituted at unchanged count
file:             lifetime-tax-strategy-lab.html
mutation:         host.setAttribute("data-rl-unavailable-domain", record.domain);  ->  host.setAttribute("data-rl-unavailable-domain", record.domain === "marginal-contributor:premium-tax-credit" ? "marginal-contributor:substituted-at-constant-count" : record.domain);   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/lifetime-tax-marginal.spec.mjs --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-marginal.spec.mjs:136:1 › Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete
green-exit:       0
green-summary:      ✓  3 [system-chrome] › tests/lifetime-tax-marginal.spec.mjs:136:1 › Regression: SCN-021-009 unsupported thresholds are named unavailable contributors and the curve is labeled incomplete (1.0s)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-10 the engine drops one movesMarginalRate contributor the pack still declares
file:             rltaxrules.js
mutation:         if (pack.unsupportedFeatures[index] && pack.unsupportedFeatures[index].movesMarginalRate === true) {  ->  if (index > 0 && pack.unsupportedFeatures[index] && pack.unsupportedFeatures[index].movesMarginalRate === true) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-07: the shipped curve’s contributor id set equals the pack’s movesMarginalRate entries in both directions, the premium tax credit is still named so the removal was surgical, the
green-exit:       0
green-summary:      ✓ TP-03-07: the shipped curve’s contributor id set equals the pack’s movesMarginalRate entries in both directions, the premium tax credit is still named so the removal was surgical, the taxabl
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-14 the investment-income base folds tax-exempt interest back in, which L6 exists to forbid
file:             rltax.js
mutation:         var netInvestmentIncome = workspace.income.qualifiedDividend + workspace.income.longTermCapitalGain + declared;  ->  var netInvestmentIncome = workspace.income.qualifiedDividend + workspace.income.longTermCapitalGain + declared + workspace.income.taxExemptInterest;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-05: the published reconciliation leg-id list equals the engine’s own declaration in order and in both directions, every published leg holds for a settled result, L6 proves the inve
green-exit:       0
green-summary:      ✓ TP-02-05: the published reconciliation leg-id list equals the engine’s own declaration in order and in both directions, every published leg holds for a settled result, L6 proves the investment
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-15 the reconciliation rendering emits the settled legs in reverse order at unchanged count
file:             lifetime-tax-strategy-lab.html
mutation:         for (index = 0; index < settlement.reconciliation.legs.length; index += 1) {  ->  for (index = settlement.reconciliation.legs.length - 1; index >= 0; index -= 1) {   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/lifetime-tax-federal.spec.mjs --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-federal.spec.mjs:197:1 › Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles
green-exit:       0
green-summary:      ✓  3 [system-chrome] › tests/lifetime-tax-federal.spec.mjs:197:1 › Regression: SCN-021-006 deduction selection is explicit and the annual result reconciles (584ms)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-16 the reconciliation rendering emits the settled legs in reverse order at unchanged count
file:             lifetime-tax-strategy-lab.html
mutation:         for (index = 0; index < settlement.reconciliation.legs.length; index += 1) {  ->  for (index = settlement.reconciliation.legs.length - 1; index >= 0; index -= 1) {   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/lifetime-tax-route.spec.mjs --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-route.spec.mjs:37:1 › Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail
green-exit:       0
green-summary:      ✓  1 [system-chrome] › tests/lifetime-tax-route.spec.mjs:37:1 › Regression: SCN-021-013 Simple opens first with a decision level answer and Power holds the detail (823ms)
revert-verified:  yes (committed=8090388f3c54a97b8abf4db64cb5ce00993a730f restored=8090388f3c54a97b8abf4db64cb5ce00993a730f)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            SUP-022-20 a declared band edge stops being flagged a step, so the curve smooths it
file:             rltax.js
mutation:         cliff: segmentKind === "rate-step" || segmentKind === "cliff",  ->  cliff: segmentKind === "cliff",   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-03-05: every declared band edge inside the sweep renders as a step — two adjacent points one probe apart with different rates, cliff true, and no interpolated point between them (5 pa
green-exit:       0
green-summary:      ✓ TP-03-05: every declared band edge inside the sweep renders as a step — two adjacent points one probe apart with different rates, cliff true, and no interpolated point between them (5 pack-der
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**A mis-aimed first probe, recorded rather than discarded.** The accounting
entry's first probe truncated the declared leg list from the head
(`pack.taxLegs.slice(1)`). It discriminated on the exit channel — so a naive
reading would have banked it — but the `--summary-match` channel showed
`TP-01-01` **passing in both runs**. The reason is a real property of the
assertion rather than a fault in it: the leg dropped from the head is not one of
the eighteen unsupported ids the accounting ranges over, so the assertion was
right to stay green. Without the named summary channel this probe would have
been recorded as evidence for a row it never touched. The re-aimed probe above
deletes the surtax specifically, and `TP-01-01` then falls by name.

**Where the adversarial evidence for each entry lives.** The item asks that each
entry carries one, and the fourth pass's census found explicit in-suite blocks
for only three. The full accounting is:

| Marker | Adversarial evidence | Form |
| --- | --- | --- |
| SUP-022-03 | in-suite `SUP-022-03 ADVERSARIAL` block, plus TP-02-23 case 2 | assertion |
| SUP-022-08 | TP-02-23 case 1 (moved-versus-deleted) plus the probe above | assertion + probe |
| SUP-022-10 | TP-02-23 case 1 (the engine-side twin) plus the probe above | assertion + probe |
| SUP-022-14 | in-suite `SUP-022-14 ADVERSARIAL` block | assertion |
| SUP-022-15 | the count-preserving reversal probe above | probe |
| SUP-022-16 | the count-preserving reversal probe above | probe |
| SUP-022-19 | TP-02-23 case 3, plus the fourth pass's row-insertion control | assertion + control |
| SUP-022-20 | in-suite `SUP-022-20 ADVERSARIAL` block | assertion |

The two entries whose only adversarial evidence is a probe are the two rendered
row-count replacements. That is deliberate and is stated rather than glossed: an
in-suite Playwright "adversarial" block would have to mutate the page from
inside a browser test and restore it, which is exactly the stranded-mutation
hazard the harness exists to remove. An executed, hash-verified probe that
reintroduces the regression and names the test that falls is the stronger
artifact, and it is reproducible from the block above.

### Test Plan rows completed to intended RED — the nine that carried none

A per-row census of this report found nine Test Plan rows carrying a GREEN
observation and no RED. They are completed here, one
`scripts/red-green-probe.sh` block each. `--summary-match` is bound to the row's
own assertion name — or, for the browser row, to its scenario title — so each
block names what fell rather than reporting only that the run went red.

| Row | Mutation reintroduces | RED names |
| --- | --- | --- |
| TP-02-01 | the `declaredFor` year-membership refusal no longer firing | `TP-02-01` |
| TP-02-02 | a duplicate `legId` no longer refused | `TP-02-02` |
| TP-02-05 | the surtax applied to the whole declared wage basis, not the excess | `TP-02-05` |
| TP-02-06 | the modified-adjusted-gross measure blind to ordinary income | `TP-02-06` |
| TP-02-11 | a threshold set accepted although the declared year is absent | `TP-02-11` |
| TP-02-16 | the wage surtax ignoring its threshold, over the real route | `SCN-022-005` |
| TP-02-19 | a real engine defect that must drop the repository pass count | the count line |
| TP-02-20 | a tolerated missing path leaving the frozen baseline | `new=1` |
| TP-02-21 | this route leaving the exclusions register | a stale-exclusion refusal |

Two design notes, because both could otherwise look like shortcuts.

**The path-guard probe deliberately writes no new path.** The natural way to red
a "zero new missing test paths" row is to make a spec name a file that does not
exist — but the harness block would then carry that invented path into this
report, the guard would scan it here, and the row would be permanently red. The
probe instead comments out an entry the frozen baseline already tolerates, so
the count of missing paths is unchanged at 67 while the tolerated set shrinks to
66 and the same path is reported as new. The path that appears in the block
below is a real baseline entry, so pasting it changes nothing.

**The deploy-gate probe reds on the register, not on the plan's arithmetic.**
The row pairs "the plan succeeds" with "`site-exclusions.json` is unchanged", so
the mutation takes this route out of the exclusions register. The build refuses
with a stale-exclusion error rather than quietly producing a plan with one fewer
excluded path, which is the stronger of the two failures it could have shown.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-01 the declaredFor year-membership refusal stops firing
file:             rltaxrules.js
mutation:         set.indexing.declaredFor.indexOf(declaredYear) >= 0) {  ->  set.indexing.declaredFor.indexOf(declaredYear) >= -1) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-01: a declaredFor omitting the declared tax year and an empty declaredFor are each refused RLTAX-THRESHOLD-UNAVAILABLE naming the year, while the shipped set declaring 2026 is not
green-exit:       0
green-summary:      ✓ TP-02-01: a declaredFor omitting the declared tax year and an empty declaredFor are each refused RLTAX-THRESHOLD-UNAVAILABLE naming the year, while the shipped set declaring 2026 is not
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-02 a duplicate legId is no longer refused
file:             rltaxrules.js
mutation:         if (seen[leg.legId] === true) {  ->  if (false) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-02: a duplicate legId, a figureRef naming a figure the pack does not carry, and an includedInTotal:false leg whose figure is absent are each refused by the member that carries them,
green-exit:       0
green-summary:      ✓ TP-02-02: a duplicate legId, a figureRef naming a figure the pack does not carry, and an includedInTotal:false leg whose figure is absent are each refused by the member that carries them, so inc
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-05 the additional Medicare tax is applied to the whole declared wage basis instead of the excess over the threshold
file:             rltax.js
mutation:         var excess = Math.max(0, declared - threshold);  ->  var excess = declared;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold, and is byte-identical when ordinary income, qualified divi
green-exit:       0
green-summary:      ✓ TP-02-05: the additional Medicare tax is exact immediately below, exactly at and immediately above every filing-status threshold, and is byte-identical when ordinary income, qualified dividend a
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-06 the modified-adjusted-gross measure stops seeing ordinary income, so added ordinary income can no longer move the investment-income surtax
file:             rltax.js
mutation:         var modifiedAdjustedGross = basis.grossSupportedIncome;  ->  var modifiedAdjustedGross = netInvestmentIncome;   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishe
green-exit:       0
green-summary:      ✓ TP-02-06: added ordinary income alone raises the net investment income tax where the cap does not bind and leaves a non-zero additional Medicare tax byte-identical, and the result publishes the
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-11 a threshold set is accepted although the declared tax year is absent from its declaredFor
file:             rltaxrules.js
mutation:         set.indexing.declaredFor.indexOf(declaredYear) >= 0) {  ->  set.indexing.declaredFor.indexOf(declaredYear) >= -1) {   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:        ✗ FAIL: TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused RLTAX-THRESHOLD-UNAVAILABLE at settlement rather than applied, its leg carries no numeric value, and a wi
green-exit:       0
green-summary:      ✓ TP-02-11: a threshold set whose declaredFor omits the declared tax year is refused RLTAX-THRESHOLD-UNAVAILABLE at settlement rather than applied, its leg carries no numeric value, and a withdraw
revert-verified:  yes (committed=206d8d81d7be511e4aead22b4c25d7099083369a restored=206d8d81d7be511e4aead22b4c25d7099083369a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-16 the additional Medicare surtax stops honouring its threshold, so the declared wage basis is taxed in full
file:             rltax.js
mutation:         var excess = Math.max(0, declared - threshold);  ->  var excess = declared;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome tests/lifetime-tax-surtax.spec.mjs --reporter=list
red-exit:         1
red-summary:          [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:135:1 › Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis
green-exit:       0
green-summary:      ✓  2 [system-chrome] › tests/lifetime-tax-surtax.spec.mjs:135:1 › Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis (530ms)
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-19 a real engine defect must drop the whole-repository pass count
file:             rltax.js
mutation:         cliff: segmentKind === "rate-step" || segmentKind === "cliff",  ->  cliff: segmentKind === "cliff",   (1 occurrence(s))
command:          node scripts/selftest.mjs
red-exit:         1
red-summary:      Research-Lab self-test: 3174 passed, 1 failed
green-exit:       0
green-summary:    Research-Lab self-test: 3175 passed, 0 failed
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-20 a tolerated missing test path leaves the frozen baseline, so it must be reported as new
file:             scripts/validate-spec-test-paths.baseline
mutation:         tests/auction-gamma-playbook.spec.mjs  ->  # tests/auction-gamma-playbook.spec.mjs   (1 occurrence(s))
command:          node scripts/validate-spec-test-paths.mjs
red-exit:         1
red-summary:      [spec-test-paths] scanned=686 references=15464 distinctPaths=250 missingPaths=67 baseline=66 new=1 stale=0
green-exit:       0
green-summary:    [spec-test-paths] scanned=686 references=15464 distinctPaths=250 missingPaths=67 baseline=67 new=0 stale=0
revert-verified:  yes (committed=972f0de1d9ab47e0f584287138399e51187629dc restored=972f0de1d9ab47e0f584287138399e51187629dc)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-21 this route leaves the exclusions register, so the Pages plan meets an unregistered root page
file:             site-exclusions.json
mutation:         "path": "lifetime-tax-strategy-lab.html",  ->  "path": "lifetime-tax-strategy-lab.html.retired",   (1 occurrence(s))
command:          node scripts/build-pages-site.mjs --dry-run
red-exit:         1
red-summary:      Error: site exclusion is stale: lifetime-tax-strategy-lab.html.retired
green-exit:       0
green-summary:    {"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":128,"directories":["briefs","data","docs","notes","research","rlexperience-adapters",
revert-verified:  yes (committed=29c6fe08a58d97c1f119abdd38706cf02f675d60 restored=29c6fe08a58d97c1f119abdd38706cf02f675d60)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**One row remains: TP-02-18**, the cumulative browser suite. It is treated
separately below because its command is the whole `SCN-02[1-4]` sweep rather
than a per-file spec, and a probe over it costs two full sweeps.

### TP-02-18 completed to intended RED — the cumulative sweep, probed once

**Claim Source:** executed. The sweep was probed rather than described, at the
cost the paragraph above names: two full cumulative runs, 3.7 minutes red and
2.8 minutes green.

The mutation is the same threshold defect the per-file row TP-02-16 uses, and it
is chosen deliberately. This row's substance is *"every scenario owned by
features 021 … 024 passes, zero failed and zero skipped, not a convenient
subset"* — so what it must be shown sensitive to is **one owned scenario going
red inside the whole sweep**. A defect that fell the entire suite would prove
only that the command runs. Falling exactly one of seventy-seven is the shape
that proves the sweep is a sweep: the count moves by one and the run turns red.

The mutation is value-free — it deletes a `Math.max` and a subtraction and
carries no rule figure and no household amount.

```
=== RED/GREEN PROBE EVIDENCE ===
label:            TP-02-18 the wage surtax stops honouring its threshold, so a scenario this family owns falls inside the whole cumulative sweep
file:             rltax.js
mutation:         var excess = Math.max(0, declared - threshold);  ->  var excess = declared;   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep SCN-02\[1-4\] --reporter=list
red-exit:         1
red-summary:        76 passed (3.7m)
green-exit:       0
green-summary:      77 passed (2.8m)
revert-verified:  yes (committed=3206e1516e43338b5cfe79103fd989670a0cc269 restored=3206e1516e43338b5cfe79103fd989670a0cc269)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
```

**Read the two channels together.** `76 passed` against `77 passed` is the
count moving by exactly one, and `red-exit: 1` against `green-exit: 0` is the
suite refusing rather than absorbing it. Both channels were compared because
`--summary-match '[0-9]+ (passed|failed)'` was supplied — necessary here, since
this suite has previously exited non-zero on a `worker-N … force-killed it`
teardown fault with every test passing, and an exit-only verdict would have been
unreadable on such a run.

**The revert is hash-verified, not asserted.** `revert-verified: yes` compares
the working file against the committed blob `3206e1516e43338b5cfe79103fd989670a0cc269`
after the green run, so the module this probe mutated is byte-identical to the
committed one. That check is what earlier passes in this program did by hand and
occasionally got wrong.

**The green run is the current state of the row**, not a historical one: 77
passed, zero failed, zero skipped, over the alternation pinned to the four
owning spec numbers.

### Every Test Plan row now carries intended RED and same-command GREEN

With TP-02-18 above, the per-row census closes. Twenty-four rows, twenty-four
recorded pairs:

| Rows | Where the pair is recorded |
| --- | --- |
| TP-02-01, -02, -05, -06, -11, -16, -19, -20, -21 | the nine harness blocks in the census above |
| TP-02-18 | the harness block immediately above |
| TP-02-03, -04, -07, -08, -09, -10, -12, -14, -24 | their own sections, each with a named mutation, a failing run and a same-command green run |
| TP-02-15, -17 | the `SCN-022-004` and `SCN-022-006` scenario sections |
| TP-02-22, -23 | the seven re-derived intended REDs, one per deliverable marker |
| TP-02-13 | its own section — an in-test negative control plus two real failing runs of its own non-vacuity clause |

**TP-02-13 is the one row whose RED is not a source mutation, and that is a
reasoned position rather than a gap.** Any mutation able to fail it must route a
household value into a URL, a header or the console — the exact defect the row
exists to prevent, and one a prior session left live in this repository. Its
section records two genuine failing runs (`1 failed`, `PW_EXIT=1`) produced by
its own non-vacuity clause catching two real drafting misses, the same-command
green run that followed, and a detector proven able to name three planted values
inside the test process without any of them being navigated, fetched, logged or
rendered.

## Regression, Boundary And Sweep Evidence — 2026-08-24 Pass

This pass closes the four rows this scope carried open. Every command below was
executed in this session and its exit code captured immediately into a variable
or printed on the line that follows, before any other command ran.

**Declared deviation from the Test Plan command string.** The Test Plan cells
name `--project=system-chrome`. Every run recorded here used `--project=chromium`
— the bundled Playwright browser declared in `playwright.config.mjs`, whose
`browserName` is also `chromium` and which differs only by not requiring a system
Chrome install. The rows constrain the persistent **titles**, not the project, so
the substitution does not weaken them; it is recorded here rather than left for a
reader to infer from a mismatched command string.

### DoD — scenario-specific E2E regression for SCN-022-004, -005 and -006

Limb one, the titles are present in the spec file rather than merely selected.
Limb two, each named title selects exactly one test and that test passes.

```text
$ grep -c -F "test('Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one'" tests/lifetime-tax-surtax.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis'" tests/lifetime-tax-surtax.spec.mjs
1
exit code: 0
$ grep -c -F "test('Regression: SCN-022-006 added ordinary income moves one surtax and not the other'" tests/lifetime-tax-surtax.spec.mjs
1
exit code: 0
```

```text
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one" --list
Listing tests:
  [chromium] › tests/lifetime-tax-surtax.spec.mjs:74:1 › Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --list
Listing tests:
  [chromium] › tests/lifetime-tax-surtax.spec.mjs:135:1 › Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis
Total: 1 test in 1 file
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --list
Listing tests:
  [chromium] › tests/lifetime-tax-surtax.spec.mjs:188:1 › Regression: SCN-022-006 added ordinary income moves one surtax and not the other
Total: 1 test in 1 file
exit code: 0
```

```text
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one" --reporter=list

Running 1 test using 1 worker

  ✓  1 …me surtax computes from a declared basis and refuses without one (594ms)

  1 passed (1.9s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --reporter=list

Running 1 test using 1 worker

  ✓  1 …the additional Medicare surtax uses only its declared wage basis (327ms)

  1 passed (1.6s)
exit code: 0
==== $ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --reporter=list

Running 1 test using 1 worker

  ✓  1 …022-006 added ordinary income moves one surtax and not the other (271ms)

  1 passed (2.7s)
exit code: 0
```

**The adversarial case.** The row requires that renaming or deleting one of those
titles fails it, so that an empty grep selection can never be read as a pass. The
self-reverting probe renames the SCN-022-004 title and runs the identical command.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc02 renaming the persistent title makes the exact-title command fail
file:             tests/lifetime-tax-surtax.spec.mjs
mutation:         Regression: SCN-022-004 the investment income surtax computes from a declared basis and refuses without one  ->  RENAMED-BY-PROBE sc02 zzz   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep Regression:\ SCN-022-004\ the\ investment\ income\ surtax\ computes\ from\ a\ declared\ basis\ and\ refuses\ without\ one --reporter=list
red-exit:         1
red-summary:      Error: No tests found
green-exit:       0
green-summary:      1 passed (1.7s)
revert-verified:  yes (committed=611715449afd648bacce91924f6aa536c4b11a7a restored=611715449afd648bacce91924f6aa536c4b11a7a)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

Playwright does not report an empty selection as a pass — it raises
`Error: No tests found` and exits 1. The adversarial case therefore holds by the
runner's own behaviour, not by a convention this scope asserts.

**Verdict: closed.** Three titles present exactly once as `test()` declarations,
three exact-title commands each selecting exactly one test and exiting 0, and the
rename proven to fail the row.

### DoD — broader E2E regression across the lifetime-tax browser family

The row asks for the whole browser family, not this scope's own spec file. Two
runs are recorded, because `TP-02-18`'s `--grep "SCN-02[1-4]"` is narrower than
the row's own words. The first is the Test Plan's command; the second is the
family itself, selected by path with no grep at all. Both are recorded as
hash-verifiable bounded captures because each exceeds forty lines; the sha256
covers every line the command produced.

```
# sc02 TP-02-18 broader regression, grep-selected SCN-02[1-4]
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep SCN-02[1-4] --reporter=list
exit: 0
lines: 93
sha256: 3da400513c862eb0e2cf5ade0fa627f628311f8754adcf137ff1c9b36cc78451
--- first 6 ---

Running 88 tests using 6 workers

  ✓   2 [chromium] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (1.1s)
  ✓   6 [chromium] › tests/lifetime-tax-combined.spec.mjs:113:1 › Regression: SCN-022-013 the combined total is the sum of two independent settlements (1.1s)
  ✓   1 [chromium] › tests/lifetime-tax-benefit.spec.mjs:58:1 › Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount (1.1s)
--- omitted 81 line(s); sha256 above covers the full output ---
--- last 6 ---
  ✓  84 [chromium] › tests/lifetime-tax-use.spec.mjs:164:1 › Regression: SCN-023-011 the three Publication 527 boundaries land on the side the publication states (1.1s)
  ✓  86 [chromium] › tests/lifetime-tax-use.spec.mjs:234:1 › Regression: SCN-023-012 the under-threshold exception excludes the income and deducts no rental expense (497ms)
  ✓  87 [chromium] › tests/lifetime-tax-use.spec.mjs:268:1 › Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition (531ms)
  ✓  88 [chromium] › tests/lifetime-tax-use.spec.mjs:354:1 › Regression: SCN-023-010 the request ledger does not grow after the day-count declarations and every entry is a declared same-origin read (513ms)

  88 passed (16.4s)
```

```
# sc02 broader regression: whole lifetime-tax browser family, path-selected
$ npx --no-install playwright test --config=playwright.config.mjs --project=chromium tests/lifetime-tax-benefit.spec.mjs tests/lifetime-tax-california.spec.mjs tests/lifetime-tax-claim-age.spec.mjs tests/lifetime-tax-combined.spec.mjs tests/lifetime-tax-conversion.spec.mjs tests/lifetime-tax-deduction.spec.mjs tests/lifetime-tax-disposition.spec.mjs tests/lifetime-tax-federal.spec.mjs tests/lifetime-tax-foundation.spec.mjs tests/lifetime-tax-inclusion.spec.mjs tests/lifetime-tax-marginal.spec.mjs tests/lifetime-tax-medicare.spec.mjs tests/lifetime-tax-preferential.spec.mjs tests/lifetime-tax-property.spec.mjs tests/lifetime-tax-rental.spec.mjs tests/lifetime-tax-retirement-route.spec.mjs tests/lifetime-tax-route.spec.mjs tests/lifetime-tax-state.spec.mjs tests/lifetime-tax-surtax.spec.mjs tests/lifetime-tax-use.spec.mjs --reporter=list
exit: 0
lines: 99
sha256: 369b9591e4b932c8ad2840f0d9c572c779b01a4a960fb24a4dd89915ecc821cd
--- first 20 ---

Running 94 tests using 6 workers

  ✓   3 [chromium] › tests/lifetime-tax-combined.spec.mjs:77:1 › Regression: the shipped Florida pack states no imposition, so the combined answer inherits that refusal instead of adding a zero (941ms)
  ✓   5 [chromium] › tests/lifetime-tax-conversion.spec.mjs:35:1 › Regression: SCN-021-010 two conversion policies are compared and the fill amount comes from the pack (1.2s)
  ✓   1 [chromium] › tests/lifetime-tax-benefit.spec.mjs:58:1 › Regression: SCN-024-001 neither origin and both origins each refuse and neither shows a benefit amount (1.2s)
--- omitted 59 line(s); sha256 above covers the full output ---
--- last 20 ---
  ✓  93 [chromium] › tests/lifetime-tax-use.spec.mjs:268:1 › Regression: SCN-023-013 mixed use allocates by declared days and the personal portion reaches the composition (508ms)
  ✓  94 [chromium] › tests/lifetime-tax-use.spec.mjs:354:1 › Regression: SCN-023-010 the request ledger does not grow after the day-count declarations and every entry is a declared same-origin read (484ms)

  94 passed (16.7s)
```

**The under-selection gap, re-measured for this scope.** The family holds 94
tests across twenty spec files; `--grep "SCN-02[1-4]"` selects 88. The same six
titles carry no scenario token and are invisible to every grep-selected broader
command in this feature, which is finding **F-03-B** arriving again as a number
rather than as a prediction. The path-selected run above is not subject to it.

**The adversarial case.** The row requires that a change made inside this scope
which reddens a sibling scope's persistent title fails it, even while this scope's
own rows stay green. `lifetime-tax-strategy-lab.html` is on this scope's *Allowed
modified* list, so a change to it is in-boundary. The same one-token mutation is
run against the broader command and against this scope's own narrow command.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc02 an in-boundary page change reddens Feature 021 sibling titles
file:             lifetime-tax-strategy-lab.html
mutation:         simpleValueNode("conversionAmount",  ->  simpleValueNode("conversionAmountPROBE02",   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep SCN-021- --reporter=list
red-exit:         1
red-summary:        15 passed (8.8s)
green-exit:       0
green-summary:      17 passed (3.8s)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0

=== RED/GREEN PROBE EVIDENCE ===
label:            sc02 own narrow row stays green under the same in-boundary change
file:             lifetime-tax-strategy-lab.html
mutation:         simpleValueNode("conversionAmount",  ->  simpleValueNode("conversionAmountPROBE02",   (1 occurrence(s))
command:          npx --no-install playwright test --config=playwright.config.mjs --project=chromium --grep Regression:\ SCN-022-004\ the\ investment\ income\ surtax\ computes\ from\ a\ declared\ basis\ and\ refuses\ without\ one --reporter=list
red-exit:         0
red-summary:        1 passed (1.3s)
green-exit:       0
green-summary:      1 passed (1.2s)
revert-verified:  yes (committed=8ffe663489cb6307801d738f8850207de6b09d84 restored=8ffe663489cb6307801d738f8850207de6b09d84)
discriminating:   NO (red-exit 0 == green-exit 0)
=== END RED/GREEN PROBE EVIDENCE ===
red-green-probe: REFUSED — RED and GREEN produced the same outcome (both exited 0). The mutation did not make the command fail, so the assertion under test cannot fail and this is not RED/GREEN evidence.
probe exit code: 7
```

Read together the pair is the row's adversarial case, executed. One in-boundary
change drops the broader run from 17 passed to 15 and exits 1, while this scope's
own SCN-022-004 command still exits 0 and reports 1 passed. The narrow row cannot
see the damage; the broader row can. The second probe's exit 7 is the harness
refusing to call a non-discriminating pair RED/GREEN evidence, and that refusal is
exactly the observation this row needs.

**Verdict: closed.** The Test Plan's command passes 88 of 88, the path-selected
family passes 94 of 94 with zero failed and zero skipped, and the broader row is
proven to catch collateral damage the narrow row misses.

### DoD — Change Boundary respected, zero excluded file families changed

The row's stated proof is a path-scoped `git status --porcelain` over the excluded
surfaces plus an mtime comparison for any untracked excluded directory. This
scope's *Excluded — must remain byte-identical* list resolves to twenty-four
pathspecs, each of which was first confirmed to name a path that exists.

```text
pathspec_count=24
$ git status --porcelain -- <scope 02 excluded surfaces: 24 pathspecs>
exit code: 0
(no output above means zero rows)
$ git ls-files --others --exclude-standard -- <same pathspecs> | wc -l
       0
exit code: 0
```

**The mtime limb has an empty domain, and that is measured rather than assumed.**
`git ls-files --others --exclude-standard` over the same twenty-four pathspecs
returns zero, so every excluded surface this scope names is fully tracked. There
is no untracked excluded path for an mtime comparison to cover, which makes the
porcelain scan complete over the excluded set rather than merely convenient.

**Why `git diff --quiet` is not accepted, demonstrated rather than asserted.**

```text
$ git diff --quiet -- err.txt ; echo "exit $?"
exit 0
$ git status --porcelain -- err.txt
?? err.txt
exit code: 0
```

`err.txt` is an untracked file in the working tree. `git diff --quiet` reports it
unchanged and exits 0; `git status --porcelain` reports it. That asymmetry is the
reason the row names porcelain.

**The adversarial case.** Touching one excluded path must produce a row and fail
the item. `rltaxstrategy.js` is on this scope's excluded list, and the probe below
mutates one comment character in it and runs the boundary check itself as the
command.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc02 touching one excluded path makes the path-scoped porcelain check fail
file:             rltaxstrategy.js
mutation:         It owns NO tax arithmetic and NO bracket edge  ->  It owns NO tax arithmetic and NO bracket edge!   (1 occurrence(s))
command:          sh -c test\ -z\ \"\$\(git\ status\ --porcelain\ --\ rltaxstrategy.js\)\"
red-exit:         1
red-summary:      (no output)
green-exit:       0
green-summary:    (no output)
revert-verified:  yes (committed=f4dbb4a9c8dcf3b60a9aee0c4e3816f880ead964 restored=f4dbb4a9c8dcf3b60a9aee0c4e3816f880ead964)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

**Disclosure — a file on this scope's excluded list was transiently mutated by
this session's probes.** Every probe in this pass mutates a committed file, runs a
command, and reverts. The `rltaxstrategy.js` probe deliberately touched an
excluded file in order to prove the check can fail. In every case the harness
verified the restored blob hash against the committed blob hash, so each file is
byte-identical to its committed content at the end of the session and no commit
carries any of those mutations. The fact is recorded here rather than left silent,
because a reader checking mtimes rather than content would otherwise find movement
this report had not explained.

**Verdict: closed.** Zero porcelain rows over twenty-four excluded pathspecs, zero
untracked files anywhere in that set, the porcelain-versus-`git diff` asymmetry
demonstrated, and the check proven able to fail.

### DoD — Consumer Impact Sweep complete, zero stale first-party references

The row is conditional on this scope actually renaming, moving or removing
something, so the sweep's domain is derived from the shipped tree rather than
assumed. This scope moves two leg identifiers and removes one positional
selector; it renames nothing and moves no route or path.

```text
$ python3 -c "<read tax-rules/federal/2026.json>"
tax-rules/federal/2026.json
  taxLegs: ['ordinary', 'preferential', 'net-investment-income-tax', 'additional-medicare-tax']
  unsupportedFeatures contains net-investment-income-tax: False
  unsupportedFeatures contains additional-medicare-tax: False
```

`net-investment-income-tax` and `additional-medicare-tax` have moved out of
`unsupportedFeatures[]` and into `taxLegs[]`. The identifier strings are unchanged,
so a stale first-party reference is not a dangling name — it is any surface that
still treats either identifier as unsupported or unavailable. That is what the
repository-wide scan looks for.

```text
$ grep -rIl --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.first-load-fix-worktree -e 'net-investment-income-tax' -e 'additional-medicare-tax' . | sort
./lifetime-tax-strategy-lab.html
./rltax.js
./scripts/selftest.mjs
./specs/021-lifetime-tax-strategy-lab/design.md
./specs/022-federal-preferential-and-state-income-tax/design.md
./specs/022-federal-preferential-and-state-income-tax/scenario-manifest.json
./specs/022-federal-preferential-and-state-income-tax/scopes/02-net-investment-income-and-additional-medicare-tax/report.md
./specs/022-federal-preferential-and-state-income-tax/scopes/02-net-investment-income-and-additional-medicare-tax/scope.md
./specs/022-federal-preferential-and-state-income-tax/scopes/05-combined-settlement-and-marginal-curve/report.md
./specs/022-federal-preferential-and-state-income-tax/scopes/_index.md
./specs/022-federal-preferential-and-state-income-tax/spec.md
./specs/022-federal-preferential-and-state-income-tax/state.json
./specs/023-property-tax-and-rental-income/scopes/01-property-assessment-mechanics/report.md
./specs/023-property-tax-and-rental-income/scopes/02-primary-residence-federal-interaction/report.md
./specs/024-social-security-and-medicare/scopes/01-benefit-computation/report.md
./specs/024-social-security-and-medicare/scopes/02-benefit-taxation/report.md
./specs/024-social-security-and-medicare/scopes/04-medicare-premiums-and-irmaa/report.md
./tax-rules/federal/2026.json
./tests/lifetime-tax-marginal.spec.mjs
./tests/lifetime-tax-surtax.spec.mjs
exit code: 0
```

```text
$ grep -rInE '(net-investment-income-tax|additional-medicare-tax)' --include='*.js' --include='*.mjs' --include='*.html' --include='*.json' --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.first-load-fix-worktree . | grep -iE 'unsupported|unavailable|notModeled|not-modeled'
exit code(grep2)=1
(exit 1 from the second grep = zero stale executable rows)
```

Twenty first-party files carry the identifiers; **zero** executable surfaces pair
either identifier with unsupported, unavailable or not-modelled treatment. The
navigation, breadcrumb, redirect, deep-link and API-client limbs of the sweep
table all live inside those executable surfaces, so a stale row in any of them
would have appeared here.

The removed positional selector is swept separately.

```text
$ grep -rn 'links.nth(' tests/lifetime-tax-route.spec.mjs
tests/lifetime-tax-route.spec.mjs:91:  /* SUP-022-19: supersedes the positional `links.nth(3)` focus expectation; shape=derive. The
exit code: 0
```

One occurrence remains, and it is not a live selector — it is the SUP-022-19
marker comment citing the form it superseded, which is what the supersession
procedure requires it to do. Lines 89-94 were read to confirm the occurrence sits
inside a block comment. There is no live positional withheld-detail selection.

```text
$ grep -rInE '(net investment income tax|additional medicare tax|net-investment-income-tax|additional-medicare-tax)' notes/ *.md | grep -iE 'unsupported|not modeled|unavailable|out of scope'
exit code: 1
(exit 1 = zero stale prose rows)
```

**One reference is named rather than swept, and the distinction is deliberate.**
`specs/021-lifetime-tax-strategy-lab/design.md` carries the identifiers because
Feature 021 declared them unsupported at the time it shipped. That file is a
historical planning record of a completed feature and is on this scope's *Excluded
— must remain byte-identical* list. Editing it would both breach the boundary this
scope's sibling row proves intact and falsify the record of what Feature 021
actually decided. It is therefore reported here as a known, deliberate,
non-executable residue rather than counted as a stale reference or silently fixed.

**The adversarial case.** The row requires that one stale reference left anywhere
fails it, and that the proof be a repository-wide scan rather than a spot check.
The probe injects exactly one stale reference into `rltax.js` — a file on this
scope's *Allowed modified* list — and runs the repository-wide scan itself as the
command.

```text
=== RED/GREEN PROBE EVIDENCE ===
label:            sc02 one stale first-party reference makes the repository-wide sweep scan fail
file:             rltax.js
mutation:         notMovedByAddedOrdinaryIncome: Object.freeze(["additional-medicare-tax"]),  ->  notMovedByAddedOrdinaryIncome: Object.freeze(["additional-medicare-tax"]), /* PROBE stale reference: additional-medicare-tax is unsupported */   (1 occurrence(s))
command:          sh -c test\ -z\ \"\$\(grep\ -rInE\ \"\(net-investment-income-tax\|additional-medicare-tax\)\"\ --include=\*.js\ --include=\*.mjs\ --include=\*.html\ --include=\*.json\ --exclude-dir=node_modules\ --exclude-dir=.git\ --exclude-dir=.first-load-fix-worktree\ .\ \|\ grep\ -iE\ \"unsupported\|unavailable\|notModeled\|not-modeled\"\)\"
red-exit:         1
red-summary:      (no output)
green-exit:       0
green-summary:    (no output)
revert-verified:  yes (committed=8294f084523f504fcb19681e0e7cda2cdce457b5 restored=8294f084523f504fcb19681e0e7cda2cdce457b5)
discriminating:   yes (exit 1 != 0)
=== END RED/GREEN PROBE EVIDENCE ===
probe exit code: 0
```

The scan is repository-wide by construction: the mutation was planted in `rltax.js`
and the command names no file, so the row's own requirement that the proof not be
a spot check is satisfied by the shape of the command rather than by a claim.

**Verdict: closed.** The move set is derived from the shipped pack, the
repository-wide scan returns zero stale executable rows and zero stale prose rows,
the one non-executable residue is named rather than hidden, the removed positional
selector survives only inside its own supersession marker, and the scan is proven
able to fail on a single planted reference.

### Repository gates re-run in this pass

```text
$ node scripts/selftest.mjs
Research-Lab self-test: 3404 passed, 0 failed
SELFTEST_EXIT=0
$ node scripts/validate-spec-test-paths.mjs
[spec-test-paths] scanned=741 references=16947 distinctPaths=265 missingPaths=73 plannedMissing=3 baseline=70 new=0 stale=0
[spec-test-paths] OK — no new missing test path(s)
VALIDATE_PATHS_EXIT=0
```


