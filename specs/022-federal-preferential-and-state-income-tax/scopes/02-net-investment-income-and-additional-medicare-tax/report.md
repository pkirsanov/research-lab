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

Not delivered in this session. `tax-rules/federal/2026.json` carries a
`SourceRecord/v2` for `irs-p505-2026` — Publication 505 (2026), Tax Withholding and
Estimated Tax — with `retrievedAt: 2026-08-17T19:03:51.000Z`, `retrievalOutcome:
retrieved`, and a retrieval note naming chapter 2, Step 5 items 4 and 5 as the
locators for the two surtax rates and their filing-status threshold charts. That record
was written by an earlier session. This session did not open Publication 505 and
therefore cannot attest the retrieval as its own executed evidence; the DoD item stays
open. What this session did execute is the parity check below, which compares the
pack's carried figures against the same figures transcribed independently into the
selftest group — a mistyped digit in either place fails rather than cancelling out.

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

Not delivered in this session. The compatibility comparison against the **unmodified**
Feature 021 pack was not executed here, so this row carries no evidence.

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

Not delivered in this session. This scope's Playwright spec does not exist yet, because
the three Simple/Power panels it would drive — `SurtaxSummaryLines`,
`ConversionAsymmetryLine` and `TaxLegLedger` — are not rendered by
`<repo>/lifetime-tax-strategy-lab.html`. The row carries no evidence.

### Scenario SCN-022-005

`Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-005 the additional Medicare surtax uses only its declared wage basis" --reporter=list`

Not delivered in this session, for the same reason as SCN-022-004.

### Scenario SCN-022-006

`Regression: SCN-022-006 added ordinary income moves one surtax and not the other`
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-022-006 added ordinary income moves one surtax and not the other" --reporter=list`

Not delivered in this session, for the same reason as SCN-022-004.

### TP-02-18

The cumulative Feature 021 and Feature 022 browser suites over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02[1-4]" --reporter=list`

Not run in this session. This session changed no browser-reachable behaviour: the three
files it touched are `<repo>/scripts/selftest.mjs`, this report, and the scope's
Definition of Done. Running the cumulative suite would produce a result, but not evidence
for a row whose owning spec does not exist, so it is left unrun rather than reported as a
pass for something it did not check.

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

### TP-02-21

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

```text
=== TP-02-21 pages plan ===
{"contractVersion":"pages-site-build-result/v1","dryRun":true,"registeredPages":28,"excludedPaths":12,"rootFiles":120,"directories":["briefs","data","docs","notes","research","rlexperience-adapters","tests/fixtures"],"historyIndexDirectory":"briefs/indexes/389a899499094a4f484a06ecc8903aa584524c3cf83b902f403a8d00f5a62cbe","omittedOrphanIndexes":143}
PAGES_EXIT=0
```

`site-exclusions.json` is proven byte-identical by the change-boundary status below.

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

