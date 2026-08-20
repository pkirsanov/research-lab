# Scope 3 Execution Report — Long-Term Rental

This file is the evidence surface for scope 3. It was created during planning as a
structural template and is filled from execution only. Nothing here may be written
from expectation, inference or summary. Every anchor below holds raw, unfiltered
terminal output with its exit code.

## Summary

Implemented. `rltaxrental.js` ships with `computeRentalSettlement`,
`computeCostRecovery`, `applyAtRiskLimit`, `applyPassiveActivityLimit` and
`specialAllowanceFor`; `rltaxrules.js` gains `RentalActivity/v1`,
`CostRecovery/v1` and `LossLimitation/v1`; `rltax.js` gains stage `CO-17` and the
`rental-net` leg; `rltaxworkspace.js` gains nine rental declarations with their
privacy surface; the route gains the `power-rental` section and one Simple field;
`tests/lifetime-tax-rental.spec.mjs` carries the four browser rows.

The leg identifier is `rental-net`. The plan calls it `L9`; the shipped engine
uses semantic leg identifiers throughout, and Scope 01 shipped `L8` as
`property-tax` for the same reason. The mapping is recorded here rather than left
to be inferred.

One supersession was admitted in flight under ASC-8 and booked on all four
surfaces in the same change: `SUP-023-12`. See
[the supersession section](#supersession-ledger).

## Sourcing

Both publications served a **2025** edition in this session. Publication 527's
title block reads `Publication 527 (2025), Residential Rental Property ... For
use in preparing 2025 Returns`, and Publication 925's reads `Publication 925
(2025), Passive Activity and At-Risk Rules ... For use in preparing 2025
Returns`. This pack declares 2026 effective. That is the same condition under
which Feature 023 Scope 02 refused both Publication 936 mortgage acquisition-debt
tiers, and the same test was applied here — per component kind, not per document.

The line drawn is between a figure the publication states **for a tax year** and
a **structural parameter of a method** the publication states without a year
qualifier. Publication 527 draws that line itself, which is what makes the
distinction checkable rather than convenient: its What's New section introduces
its year-scoped figures as `For 2025, the standard mileage rate` and `For tax
years beginning in 2025, the maximum section 179 expense deduction`, while
Table 2-1 and the Conventions section state the recovery period and the
convention with no year qualifier anywhere. That contrast is recorded verbatim in
the `yearInvarianceBasis` of `irs-p527-2025` and is the same shape of basis
Feature 022 used to carry the twenty-percent preferential rate from Topic no. 409.

Publication 925 offers no such in-document contrast for its dollar figures, so
every one of them ships absent.

### Retrieved — real figures, carried

| Figure | Value | Source | Locator | `retrievedAt` |
| --- | --- | --- | --- | --- |
| Residential rental GDS recovery period | `27.5` years | Publication 527 (2025), `https://www.irs.gov/publications/p527` | chapter 2, Table 2-1, row *Residential rental property (buildings or structures) and structural components*, General Depreciation System column | `2026-08-17T21:40:00.000Z` |
| Applicable convention | `mid-month` | Publication 527 (2025), same URL | chapter 2, Conventions, *Mid-month convention* | `2026-08-17T21:40:00.000Z` |
| Depreciation method | `straight-line` | Publication 527 (2025), same URL | chapter 2, Figuring Your Depreciation Deduction, *Residential rental property* | `2026-08-17T21:40:00.000Z` |
| At-risk limit applied first, order `1` | `appliedOrder: 1` | Publication 925 (2025), `https://www.irs.gov/publications/p925` | Introduction, and the At-Risk Limits caution | `2026-08-17T21:40:00.000Z` |
| Passive-activity limit applied second, order `2` | `appliedOrder: 2` | Publication 925 (2025), same URL | Passive Activity Loss, and Rental Activities | `2026-08-17T21:40:00.000Z` |
| Active participation is the allowance condition | `true` | Publication 925 (2025), same URL | Rental Activities, Special allowance | `2026-08-17T21:40:00.000Z` |

The ordering rule rests on three unqualified statements of one structural rule in
two publications: Publication 925's Introduction (`you must apply the at-risk
rules before the passive activity rules`), its At-Risk Limits caution, and
Publication 527 chapter 3 Limits on Rental Losses (`You must consider these rules
in the order shown below`, at-risk first).

**Digit-by-digit verification of the cost-recovery arithmetic.** The convention
was verified against Publication 527's own worked examples rather than against
the implementer's reading of it. All four agree, and TP-03-03 asserts all four:

| Publication 527 example | Publication states | Engine computes |
| --- | --- | --- |
| February, Year 1, Table 2-2d | `3.182%` | `3.1818%` |
| Year 6 full year, Table 2-2d | `3.636%` | `3.6364%` |
| May, Year 1, Table 2-2d | `2.273%` | `2.2727%` |
| August conversion, `$147,000` basis | `$2,005` | `$2,004.55` |

### Absent — `AbsentFigure/v1`, and the leg refuses

| Figure | Code | `missingSource` |
| --- | --- | --- |
| Special allowance maximum, and its married-filing-separately amount | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, `https://www.irs.gov/publications/p925`, Rental Activities, Special allowance, *Maximum special allowance* |
| Both edges of the modified-adjusted-gross-income phase-out range | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, same URL, Rental Activities, *Phaseout rule* |
| The rate at which the allowance is reduced | `RLTAX-THRESHOLD-UNAVAILABLE` | Publication 925, edition for tax year 2026, same URL, Rental Activities, *Phaseout rule* |

**Consequence, stated plainly.** Against the shipped 2026 pack a rental producing
a **loss** refuses at
`loss-limit:passive-activity:specialAllowance:maximumAmounts`, because the
passive-activity limit cannot be applied without the allowance and applying it
without one would disallow a loss the allowance may have permitted. A rental
producing **net income** settles normally, because no loss limit engages. The
limit ladder is therefore exercised against fixture packs carrying the
implementer's own figures, which are reachable only from the selftest and the
browser spec and are labelled as fixtures at every site.

The reduction rate is shipped absent *with* the range rather than carried alone,
because a reduction rate without the range it is applied across establishes
nothing.

### Pack change was additive only

`node scripts/selftest.mjs` TP-03-02 and TP-02-12 both assert it. The pack member
set partitions exactly into the recorded pre-feature list and this feature's five
declared additions; the derived reconstruction reproduces the pre-feature content
digest `sha256:e102f09087d48a9bb8482aaf3a396a49e78e0e74811f59fa089eb77df3b970bd`
byte for byte; and a mutated pre-existing figure is proven to break it. The pack
digest moved to
`sha256:87b28e85b99b1f54ae562e95e3693c6b9efbd336d8a27c4d41173926fb2a72fc` and
`lifetime-tax-strategy.config.json` was updated in the same change, which TP-01-01
and TP-03-02 both check.

## Gate Results

Run at the end of the scope, verbatim exit codes.

```
$ node scripts/selftest.mjs
================================================
Research-Lab self-test: 2674 passed, 0 failed
================================================
GATE1_EXIT=0

$ npx playwright test tests/lifetime-tax-*.spec.mjs --project=system-chrome --reporter=line
  29 passed (10.0s)
exit 0

$ node scripts/build-pages-site.mjs --dry-run
GATE3_EXIT=0

$ bash .github/bubbles/scripts/artifact-lint.sh specs/023-property-tax-and-rental-income
GATE4_EXIT=0

$ node scripts/validate-spec-test-paths.mjs
GATE5_EXIT=0
```

The pre-existing selftest pass count was 2653 and did not fall; this scope's
appended group and the SUP-023-12 replacement take it to 2674. The pre-existing
browser count was 25 and did not fall; this scope's four rows take it to 29.

## Supersession Ledger

`SUP-023-12`, admitted in flight under ASC-8 during this scope.

**Superseded clause, verbatim:**

```js
const restored02 = clonePack02();
delete restored02.deductionCaps;
delete restored02.mortgageDebtLimits;
delete restored02.deductionChoicePolicy;
```

**Cause (ASC-1).** FR-023-016, FR-023-017 and FR-023-018 require the recovery
period, the convention and the loss-limit ordering to live in the federal pack.
This scope therefore inserts two source records and two top-level members. The
reconstruction above removes only Scope 02's three members, so the pre-feature
digest no longer reproduced and TP-02-12 failed.

**Intended-RED, observed:**

```
✗ FAIL: TP-02-12: the cap cites exactly one retrieved record with a locator, its
filing-status variation names married filing separately as the only different
amount, the reduction rate it could not establish ships absent, and stripping
this scope's pack additions reproduces the pre-feature content digest byte for byte
Research-Lab self-test: 2652 passed, 1 failed
```

**Shape:** `derive`. The reconstruction now derives from the recorded pre-feature
member list, and the pack's member set must partition exactly into that list and
this feature's declared additions.

**GREEN, same command:** `Research-Lab self-test: 2653 passed, 0 failed`.

**Adversarial cases, each executed and each seen to fail before the replacement
was seen to pass:** a mutated pre-existing figure (`standardDeductions.single.amount`
incremented by one) produces a different reconstructed digest; an undeclared
top-level member (`undeclaredExtraMember`) is caught by the partition and named.

**Booked on all four surfaces in the same change:** the ledger row in
[`spec.md`](../../spec.md#supersession-ledger), its opening count paragraph
(nine predicted plus three in-flight, twelve total), the ownership table in
[`_index.md`](../_index.md#ownership) (`| 03 | SUP-023-12 | 1 |`, and *Five plus
five plus one plus one is twelve*), and the per-file marker distribution in
[`design.md`](../../design.md#per-file-marker-distribution). TP-03-26 asserts all
four agree.

### Re-verification of the "superseded nothing" DoD row

The DoD row *This scope superseded nothing: no assertion outside the appended
selftest group changed, and no `SUP-023-NN` marker was added* was re-checked in a
later session rather than taken on trust. A repository-wide search for the marker
returns it as a delivered, booked artifact, so the row's claim is false as
written:

```
$ grep -rn 'SUP-023-12' --include='*.js' --include='*.mjs' --include='*.md' --include='*.html' .

specs/023-property-tax-and-rental-income/spec.md:362:| SUP-023-12 | `scripts/selftest.mjs` — TP-02-12's `restored02` reconstruction, …
specs/023-property-tax-and-rental-income/design.md:315:| `scripts/selftest.mjs` | SUP-023-12 | 03 |
specs/023-property-tax-and-rental-income/scopes/_index.md:84:| 03 | SUP-023-12 | 1 |
scripts/selftest.mjs:15927:     SUP-023-12: supersedes `const restored02 = clonePack02(); delete restored02.deductionCaps;
scripts/selftest.mjs:16764:    && /\| 03 \| SUP-023-12 \| 1 \|/.test(indexText03)
scripts/selftest.mjs:16765:    && /\| `scripts\/selftest\.mjs` \| SUP-023-12 \| 03 \|/.test(designText03)
scripts/selftest.mjs:16766:    && markers03.indexOf('SUP-023-12') >= 0
scripts/selftest.mjs:16767:    && /SUP-023-12: supersedes/.test(selftestText03),
```

The marker is present in `scripts/selftest.mjs`, which is outside this scope's
appended group, and it is booked on all four governance surfaces. The row
therefore stays unchecked. It is not reworded to match delivery, because the DoD
text is planning-owned content and rewriting a behavioural claim to fit what
shipped is precisely the fabrication the ownership rules forbid. The correct
disposition is the one already recorded: the planning prediction was wrong, ASC-8
covers exactly that case, and the row remains an honest open item.

Re-measured again in a later session against the committed tree, the ownership is
unchanged and is booked to this scope by id rather than by inference — `spec.md`
carries `| SUP-023-12 | … | 03 |` in the ledger's ownership column and `design.md`
carries `| scripts/selftest.mjs | SUP-023-12 | 03 |` in the marker distribution.
Both name Scope 03, so the row's *no marker was added* clause is false for this
scope specifically, not merely for the feature as a whole.

### Verification of the corrected ledgered-supersession row

`bubbles.plan` replaced the false *superseded nothing* prediction with a
ledgered-supersession requirement. Each of its conjuncts was executed against the
committed tree in this session rather than inferred from the correction note.

**Conjunct 1 — no assertion outside the appended group changed.** The Feature
021-024 selftest contribution entered `scripts/selftest.mjs` in commit
`e903749c0`. Measured against the commit immediately before it, the file has
never lost a line, so every pre-existing assertion is byte-identical to its
pre-feature text. A modification would appear as a deletion paired with an
addition, so a zero deletion count is a proof of the clause and not merely
consistent with it.

```
$ git --no-pager diff --numstat e903749c0^ e903749c0 -- scripts/selftest.mjs
9089    0       scripts/selftest.mjs

$ git --no-pager diff -U0 e903749c0^ e903749c0 -- scripts/selftest.mjs | grep -c '^-[^-]'
0

$ git --no-pager diff --numstat e903749c0^ HEAD -- scripts/selftest.mjs
11265   0       scripts/selftest.mjs
```

**Conjuncts 2 through 5 — exactly one owned entry, booked on all four surfaces,
clause verbatim, literal retired.** Executed by an out-of-tree read-only probe
that re-derives each surface from the artefact itself. Verbatim output:

```
--- OWNERSHIP TABLE, per scope ---
  scope 03  declared=1  entries=[SUP-023-12]  consistent=true

--- SCOPE 03 / SUP-023-12 FOUR-SURFACE BOOKING ---
  surface 1 ledger row owned by 03       = true
  surface 2 ownership table, exactly one = true
  surface 3 per-file distribution        = true
  surface 4 marker at its own site       = true
  marker confined to the named file      = ["scripts/selftest.mjs"]

--- SCOPE 03 SUPERSEDED LITERAL SURVIVAL ---
  literal present inside its marker comment = true
  literal survives in LIVE CODE            = false
  literal in any other file                = []

PROBE_VERDICT=ALL_CLAUSES_HOLD
PROBE_EXIT=0
```

The superseded literal `const restored02 = clonePack02(); delete
restored02.deductionCaps; delete restored02.mortgageDebtLimits; delete
restored02.deductionChoicePolicy;` is quoted verbatim at `scripts/selftest.mjs`
L15927-L15928 inside its own marker comment, which the marker convention
requires, and survives nowhere as live code — the live reconstruction at L16096
is the derived replacement `restorePreFeaturePack023(clonePack02())`.

**Failure clause — a marker in a file the distribution does not name.** The
probe reports `SUP-023-12` present in exactly one file, `scripts/selftest.mjs`,
which is the file `design.md` L315 names for it. The clause does not fire.

Every conjunct holds, so the row is checked.

## Test Evidence

### TP-03-01

The cost-recovery contract refuses a missing recovery period, a missing convention,
and either carrying no citation or no locator.
Command: `node scripts/selftest.mjs`

### TP-03-02

Every pre-existing federal pack figure is byte-identical after the additive
insertion of the three retrieved records.
Command: `node scripts/selftest.mjs`

### TP-03-03

Depreciation is recomputed from the fixture pack's deliberately non-standard period
and convention for a first partial year, a full year and a final partial year.
Command: `node scripts/selftest.mjs`

### TP-03-04

An implementation using a recalled recovery period or a default convention is proven
to fail against the non-standard fixture.
Command: `node scripts/selftest.mjs`

### TP-03-05

An absent recovery period or convention refuses the depreciation and the rental leg,
and no settlement is produced without cost recovery.
Command: `node scripts/selftest.mjs`

### TP-03-06

The applied limits carry strictly increasing order with the at-risk limit first,
derived from the sourced ordering rule.
Command: `node scripts/selftest.mjs`

### TP-03-07

An implementation applying the passive limit first is proven to fail the ordering
assertion and to produce a different allowed amount.
Command: `node scripts/selftest.mjs`

### TP-03-08

The special allowance is exact below, exactly at and above each edge of the sourced
phase-out range.
Command: `node scripts/selftest.mjs`

### TP-03-09

An absent special allowance or phase-out range refuses the leg rather than applying
the passive limit without it.
Command: `node scripts/selftest.mjs`

### TP-03-10

Every applied limit publishes its before, allowed and disallowed amounts, and the
three reconcile exactly for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-11

An implementation zeroing a disallowed amount is proven to fail the reconciliation
assertion.
Command: `node scripts/selftest.mjs`

### TP-03-12

The opening carryforward is a declaration carrying no citation, and one carrying a
source reference is refused.
Command: `node scripts/selftest.mjs`

### TP-03-13

Exactly one closing figure is published for the declared year, and no member, page
node or export field names another year.
Command: `node scripts/selftest.mjs`

### TP-03-14

An implementation projecting the carryforward into a following year is proven to
fail the single-year assertion.
Command: `node scripts/selftest.mjs`

### TP-03-15

The published adjusted basis equals the declared basis less the published
accumulated recovery for every fixture.
Command: `node scripts/selftest.mjs`

### TP-03-16

Leg `L9` appears in all four surfaces in both directions on the all-non-zero
fixture, and `L8` still does.
Command: `node scripts/selftest.mjs`

### TP-03-17

Removing the rental leg from each of the four surfaces in turn fails the
leg-visibility identity with the missing leg named.
Command: `node scripts/selftest.mjs`

### TP-03-18

The refusal vocabulary member count equals its pre-feature value.
Command: `node scripts/selftest.mjs`

### TP-03-19

No module holds a recovery period, convention, allowance amount, phase-out edge or
authority name, and the detector fires on a module that does.
Command: `node scripts/selftest.mjs`

### TP-03-20

The rental declarations are inventoried, cleared, redacted, and absent from every
URL, request, referrer and console message.
Command: `node scripts/selftest.mjs`

### Scenario SCN-023-007

A long-term rental settles after sourced depreciation and refuses without it.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 a long-term rental settles after sourced depreciation and refuses without it" --reporter=list`

### Scenario SCN-023-008

The limit ladder is applied in order and every disallowed amount is published.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-008 the limit ladder is applied in order and every disallowed amount is published" --reporter=list`

### Scenario SCN-023-009

The suspended loss closes for the declared year and no future year appears.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-009 the suspended loss closes for the declared year and no future year appears" --reporter=list`

### TP-03-24

The rental leg reaches the headline, the comparison, the curve and the export in the
browser.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "Regression: SCN-023-007 the rental leg reaches the headline, the comparison, the curve and the export" --reporter=list`

### TP-03-25

The cumulative browser suite over the real route.
Command: `npx --no-install playwright test --config=playwright.config.mjs --project=system-chrome --grep "SCN-02" --reporter=list`

### TP-03-26

The whole-repository suite, with the pre-existing pass count recorded before and
after the appended group.
Command: `node scripts/selftest.mjs`

### TP-03-27

Zero new missing spec-referenced test paths, with the baseline file unmodified.
Command: `node scripts/validate-spec-test-paths.mjs`

### TP-03-28

The Pages plan succeeds and `site-exclusions.json` is unchanged.
Command: `node scripts/build-pages-site.mjs --dry-run`

## Per-Row Intended-RED Probes — partial, with three assertion weaknesses found

This section is the start of the work the outstanding DoD row names, and it is
**explicitly incomplete**. It closes five Test Plan rows, discards two probes as
over-broad, and — the part worth reading — records **three mutations that did not
go red when they should have**. Those three are findings against this scope's own
assertions, not against the modules.

**Method.** One value-free mutation per probe, planted in the shipped module the
row asserts against, the row's own command run under it, `git checkout --` issued
explicitly in the **same shell invocation**, and the file's SHA-256 re-read
afterwards. Every probe below printed `REVERT_VERIFIED=yes`, and
`git status --short` over `rltax*.js` was empty after each batch. Every mutation
is value-free by construction — a boolean literal, a `+ 1`, an identifier, a
member *name*, or the literal `0` — so a slipped revert could not have disclosed a
household figure.

**The standing failure in every capture below.** `node scripts/selftest.mjs`
currently reports one failure on the unmutated tree: the spec-referenced test-path
guard, at `1 new, 67 known-missing`. That new path belongs to a concurrent
session's `specs/027-company-scoped-owner-deep-links/`, is not this feature's, and
is not repaired here. The unmutated baseline is therefore
**3129 passed, 1 failed**, and a probe's own RED is whatever stands *beyond* that
one.

### Probe R-1 — RED for TP-03-03 and TP-03-15

The recovery period is the denominator of the full-year deduction. The mutation
adds `1` to it, so every recomputed figure moves while the shape stays valid.

```diff
-    var fullYearDeduction = activity.depreciableBasis / period;
+    var fullYearDeduction = activity.depreciableBasis / (period + 1);
```

```text
PROBE R-1  expect=TP-03-03  file=rltaxrental.js:149  guard_matches=1  cmd=node scripts/selftest.mjs
  RED_EXIT=1  RED_LINES=3538  RED_SUMMARY=3127 passed, 3 failed
  RED_SHA256=0e2deb5ca785bb14fc9ea87823cc2c688e65097ea360a8fcbfc0012065bff715
  RED_FAIL=✗ TP-03-03: depreciation is recomputed from the fixture pack's non-standard period and
           convention at a first partial year, a full year, a final partial year and past the end
           of the period, and the shipped pack reproduces Publication 527's own worked figures
  RED_FAIL=✗ TP-03-15: the adjusted basis equals the declared basis less the accumulated recovery
           at every point of the period including its final year
  REVERT_VERIFIED=yes
```

Two rows fall, and the pair is the useful part: `TP-03-15` asserts the basis
identity, which is *derived* from the same accumulation, so a probe that moved the
deduction had to move both or one of the two was not really reading the engine.
**Both moved, so `TP-03-15` is closed by this probe rather than needing its own.**

### Probe R-2 — RED for TP-03-19

`TP-03-19` is the no-shadow row: no module may hold a recovery period, a
convention, an allowance amount, a phase-out edge or an authority name. The
mutation makes the engine pass a **hardcoded convention identifier** instead of
the one the pack declares — the "default convention" an implementation reaches for
when it stops reading the source.

```diff
-    var fraction = conventionFraction(rule.convention.conventionId, month);
+    var fraction = conventionFraction("mid-month", month);
```

```text
PROBE R-2  expect=TP-03-19  file=rltaxrental.js:150  guard_matches=1  cmd=node scripts/selftest.mjs
  RED_EXIT=1  RED_LINES=3538  RED_SUMMARY=3128 passed, 2 failed
  RED_SHA256=737d89d69693a641497992e6be8f6cbca24ab971ca2d5c619825e66f6de549d2
  RED_FAIL=✗ TP-03-19: the rental module holds no recovery period, allowance amount, phase-out
           edge or authority name, its single occurrence of the convention identifier is the
           branch selector the pack names rather than a figure, and the detector is proven to
           fire on a module that does hold them
  REVERT_VERIFIED=yes
```

**This probe was aimed at `TP-03-04` and hit `TP-03-19` instead, and the miss is
recorded rather than relabelled.** A hardcoded convention is exactly the
adversarial implementation `TP-03-04` describes, so the expectation was that
`TP-03-04` would fall. It did not; the no-shadow detector caught the mutation
first, because a second literal occurrence of the identifier is what that detector
counts. `TP-03-19` is genuinely closed here. `TP-03-04` is **not**, and it is left
open below.

### Probe R-3 — RED for TP-03-01 and TP-03-05

The cost-recovery engine refuses before any deduction exists when the pack's rule
is unavailable. The mutation conjoins a **boolean literal** to that refusal, so the
gate is present but never taken.

```diff
-    if (rules.isUnavailable(rule)) return rule;
+    if (false && rules.isUnavailable(rule)) return rule;
```

```text
PROBE R-3  expect=TP-03-05  file=rltaxrental.js:131  guard_matches=1  cmd=node scripts/selftest.mjs
  RED_EXIT=1  RED_LINES=3538  RED_SUMMARY=3127 passed, 3 failed
  RED_SHA256=e84d48cca63c2947c3d6e398540471381ac6dc541aa232072245182c69f75340
  RED_FAIL=✗ TP-03-01: CostRecovery/v1 refuses a missing recoveryPeriod, a missing convention, an
           absent figure for either, and either carrying no citation or no locator, and no refusal
           smuggles a deduction
  RED_FAIL=✗ TP-03-05: an absent recovery period refuses the depreciation and the whole rental
           leg, no settlement value is produced without cost recovery, and the leg carries the
           refusal rather than collapsing to a zero
  REVERT_VERIFIED=yes
```

`TP-03-01` and `TP-03-05` are the contract half and the leg half of the same
refusal, and both fall together, which is the correct behaviour: a refusal that
stopped being taken should be visible from the record's shape *and* from the leg.

### Probe R-4 — RED for TP-03-09

The special allowance refuses when the phase-out range is an `AbsentFigure`. The
mutation disables **only that half** of the gate, leaving the maximum-amount and
reduction-rate halves intact, so the probe discriminates between them.

```diff
-    if (rules.isAbsentFigure(allowanceRule.phaseOutRange)) {
+    if (false && rules.isAbsentFigure(allowanceRule.phaseOutRange)) {
```

```text
PROBE R-4  expect=TP-03-09  file=rltaxrental.js:306  guard_matches=1  cmd=node scripts/selftest.mjs
  RED_EXIT=1  RED_LINES=3538
  RED_SHA256=72557895bbe5c7d642f7c206c1f9b5d2117e30f178588ac7910367deccf1e237
  RED_FAIL=✗ TP-03-09: the shipped pack ships the allowance amount, its phase-out range and its
           reduction rate absent, a loss against it refuses the leg by the absent member's own
           domain rather than applying the passive limit without the allowance, and no absent
           figure smuggles a numeric member
  REVERT_VERIFIED=yes
```

### Three probes that did NOT go red — recorded as findings

Each mutation below is a defect the named row claims to catch. Each was applied,
the row's own command was run, and the suite returned the **unmutated** baseline
of 3129 passed and 1 failed — the standing foreign path-guard failure and nothing
else. Each was reverted and SHA-256-verified like every other probe.

```text
MISS M-1  target=TP-03-16, TP-03-17  file=rltaxrental.js:757
  mutation: legId: "rental-net"  →  legId: "rental-net-probe"
  RED_SHA256=9265d25588349e6f20334ec74d101e7974deb296c4bde5ec77c31a4a3258c063
  OBSERVED=3129 passed, 1 failed  (baseline; no new failure)   REVERT_VERIFIED=yes

MISS M-2  target=TP-03-10, TP-03-11  file=rltaxrental.js:698
  mutation: disallowedTotal += appliedLimits[index].disallowedAmount;  →  disallowedTotal += 0;
  RED_SHA256=4fcf7172d4689a420eedb406c93f0dc8377b90c575fe077fa877c1eaeb457e8b
  OBSERVED=3129 passed, 1 failed  (baseline; no new failure)   REVERT_VERIFIED=yes

MISS M-3  target=TP-03-20  file=rltaxrental.js:51
  mutation: one declaration member NAME emitted to the console at module load
  RED_SHA256=223fe2ac269a7e8c5d3dd1063717508fcea94e61ff4dc89beafb23c07f510522
  OBSERVED=3129 passed, 1 failed  (baseline; no new failure)   REVERT_VERIFIED=yes
```

**M-2 is the most serious of the three.** `TP-03-11` states in its own words that
"an implementation zeroing a disallowed amount instead of publishing it is proven
to fail the reconciliation assertion". The mutation zeroes exactly that, and the
reconciliation assertion did not fail. Whatever `TP-03-11` currently proves, it is
not the claim written in the Test Plan.

**M-1** renames the rental leg id, and neither the leg-visibility row nor its
adversarial partner noticed — which is the signature of an assertion that reads
the leg id from the same place the module publishes it rather than from the
surfaces independently.

**M-3** emits a declaration member name to the console, which is one of the four
channels `TP-03-20` says it watches, and the unit row did not see it.

None of the three is repaired here. Strengthening them means editing
`scripts/selftest.mjs`, which currently carries **uncommitted changes from a
concurrent session**; editing it now would entangle this feature's evidence with
another session's in-flight work, and a wrong repair is worse than a recorded gap.
They are left as named, reproducible findings with the exact mutation and the
exact SHA-256 that produced each observation, so the next session can re-derive
them in one command each rather than rediscover them.

### Two probes discarded as over-broad

```text
DISCARDED  attempted for TP-03-10/TP-03-11  file=rltaxrental.js:255
  mutation: disallowedAmount: amountBefore - allowedAmount  →  disallowedAmount: 0
  RESULT=✗ FAIL (Feature 023 Scope 03 rental group threw): Cannot read properties of undefined
  reason: the mutation broke the record's shape, so the whole group threw instead of the row
          failing. A group throw is not a RED for a row. Discarded; re-aimed as M-2.

DISCARDED  attempted for TP-03-06  file=rltaxrental.js:673
  mutation: the applied-limit sort comparator reversed
  RESULT=✗ FAIL (Feature 023 Scope 03 rental group threw): Cannot read properties of undefined
  reason: same over-broad failure mode. Discarded; TP-03-06 remains without a RED.
```

Both were reverted and SHA-256-verified. They are recorded because an over-broad
probe that is quietly retried until something goes red is how a probe stops being
evidence.

### What this section does NOT yet cover

Closed here: `TP-03-01`, `TP-03-03`, `TP-03-05`, `TP-03-09`, `TP-03-15`,
`TP-03-19`. Already closed before this session: `TP-03-07`, `TP-03-12`,
`TP-03-13`, `TP-03-14`, and `SUP-023-12`.

Still owed an intended RED: `TP-03-02`, `TP-03-04`, `TP-03-06`, `TP-03-08`,
`TP-03-10`, `TP-03-11`, `TP-03-16`, `TP-03-17`, `TP-03-18`, `TP-03-20`, the four
browser rows `TP-03-21` to `TP-03-24`, the cumulative suite `TP-03-25`, and the
three gate rows `TP-03-26` to `TP-03-28`. Of these, `TP-03-10`, `TP-03-11`,
`TP-03-16`, `TP-03-17` and `TP-03-20` cannot be closed by a probe at all until the
three weaknesses above are repaired — a mutation they do not detect cannot produce
their RED.

`TP-03-27` carries a second, independent obstacle: its command
`node scripts/validate-spec-test-paths.mjs` does not currently pass on the
unmutated tree, for the same foreign spec-027 references described above, so there
is no present GREEN to pair a RED with. Its historical GREEN, captured when the
tree was clean, stands in `report.md#tp-03-27` and is not withdrawn.

### Repair of the three weaknesses — M-2, `TP-03-11`

The finding above stands as recorded; this section appends what changed, it does
not rewrite it. The repair is **additive**: no existing assertion was edited,
weakened, removed or skipped, and no timeout was raised. Each strengthening is a
new assertion carrying the same row id beside the one that was too weak, so the
old assertion's text and verdict survive unchanged and the pair reads as a
before-and-after.

**What `TP-03-11` could not see.** Its check hands the contract validator a
limitation record **the test itself zeroed** and observes that the validator
rejects it. That proves the validator rejects a zeroed member. It says nothing
about whether the **engine** publishes the disallowed amounts it computed. M-2
zeroes the engine's accumulator, not a record the test builds, so the whole
assertion passed while the published carryforward went to zero — exactly the
"silently zeroed" defect `FR-023-019` forbids and the row names.

**The strengthening.** The engine's published aggregate is
`closingSuspendedLoss`, and the module's own contract comment says it is the sum
of every disallowed amount the ladder published. The new assertion recomputes that
sum from the individual limitation records and pins the published aggregate to it,
across all five reconciliation fixtures and the ladder fixture, and requires the
ladder's aggregate to be strictly positive so a fixture that legitimately
disallows nothing cannot make the check vacuous. Reading the aggregate is a
number read, so a zeroed accumulator fails **this row** rather than throwing and
aborting the group.

```text
PROBE M-2 (re-run against the strengthened assertion)   target=TP-03-11
  file=<repo>/rltaxrental.js:698
  mutation: disallowedTotal += appliedLimits[index].disallowedAmount;  →  disallowedTotal += 0;
  BEFORE_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  MUTATED_SHA256=f34e36b9f560e1e446d24956bc60c32a263bfb24cf03f79fd3da9994be020e84

  $ node scripts/selftest.mjs
  ✓ TP-03-11: a limitation whose disallowed amount is zeroed fails the reconciliation
    assertion and one that omits the member fails the contract, while the record the
    engine actually published passes both
  ✗ FAIL: TP-03-11: the published closing suspended loss equals the sum of the disallowed
    amounts the ladder published, recomputed from the individual limitation records,
    across every reconciliation fixture and the ladder fixture, so an engine that
    accumulated zero instead of the amount it computed fails here rather than publishing
    a silently zeroed carryforward
  Research-Lab self-test: 3130 passed, 1 failed

  RED IS THE NEW ASSERTION ALONE. The pre-existing TP-03-11 assertion still passed
  under the same mutation, which is the direct demonstration that it was the weak one
  and that the added conjunct is what discriminates. Exactly one failure, so the group
  did not throw and no later row was aborted.

  AFTER_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  REVERT_VERIFIED=yes

  $ node scripts/selftest.mjs        # same command, after revert
  ✓ TP-03-11: the published closing suspended loss equals the sum of the disallowed
    amounts the ladder published, ...
  Research-Lab self-test: 3131 passed, 0 failed
```

`git status --short` over every module, pack, page and test path was empty after
the revert. `TP-03-11` now carries an intended RED and a same-command GREEN.

### Repair of the three weaknesses — M-1, `TP-03-16` and `TP-03-17`

**What the rows could not see.** The leg-visibility identity was fed a
**hand-written leg list on both sides**: the declared set and all four surfaces
were built from the same literal array in the test. That exercises the helper —
which is real work, and the original assertion keeps doing it — but it never reads
the id the engine actually publishes. Renaming the rental leg in the module
therefore changed nothing the assertion looks at: the four surfaces went on
agreeing with each other about a leg the settled record no longer names, which is
precisely the drift `NFR-023-006` exists to catch.

**The strengthening.** The rental leg id is now read back from all three producers
that publish it — the settlement's marginal context, the composed federal leg, and
the marginal context that leg carries — and the three are required to agree. The
four surfaces are then rebuilt **from the published id** and run against the
declared set, so a rename in any one producer either breaks the producers'
agreement or leaves the leg missing from every surface. A renamed control is
carried in the same assertion and required to fail on all four surfaces with the
missing leg named, so a surface set that silently matched nothing cannot pass.

```text
PROBE M-1 (re-run against the strengthened assertion)   target=TP-03-16, TP-03-17
  file=<repo>/rltaxrental.js:757
  mutation: legId: "rental-net"  →  legId: "rental-net-probe"
  BEFORE_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  MUTATED_SHA256=95847443ec3edf3e5bea0bd854b177ca24546f60480bb3c53dba6d320ab56f34

  $ node scripts/selftest.mjs
  ✓ TP-03-16 and TP-03-17: the rental leg reaches all four surfaces on the all-non-zero
    fixture alongside the property leg, and removing either from each surface in turn
    fails the identity with the missing leg named ...
  ✗ FAIL: TP-03-16 and TP-03-17: the rental leg id is read back from all three producers
    that publish it, they agree, and the four surfaces built from the published id satisfy
    the identity against the declared set, while a renamed control is proven to fail it on
    every surface with the missing leg named ...
  Research-Lab self-test: 3131 passed, 1 failed

  RED IS THE NEW ASSERTION ALONE. The pre-existing pair still passed under the same
  rename, which is the demonstration that it read the leg id from the test rather than
  from the engine. Exactly one failure, so the group did not throw.

  AFTER_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  REVERT_VERIFIED=yes

  $ node scripts/selftest.mjs        # same command, after revert
  ✓ TP-03-16 and TP-03-17: the rental leg id is read back from all three producers ...
  Research-Lab self-test: 3132 passed, 0 failed
```

`git status --short` over every module, pack, page and test path was empty after
the revert. `TP-03-16` and `TP-03-17` now carry an intended RED and a same-command
GREEN.

### Repair of the three weaknesses — M-3, `TP-03-20`

**What the row could not see.** `TP-03-20` claims the rental declarations are
absent from every URL, request, referrer **and console message**. Its check
watched none of those at run time. It read the export bytes and the committed
configuration — both of which stay perfectly clean while a module writes a
declaration member name to the console at load, because neither is the console.

**The strengthening.** The rental module is now loaded **fresh**, with every
console method hooked, and a settlement and a marginal-context read are run
through the hook; nothing may be written, and no captured line may name a rental
declaration member. Three things stop the silence from being vacuous: the same
hook is handed a deliberate emission and must capture it; a static scan requires
no engine module to hold a console call at all, with its own detector proven to
fire on one that does; and the require-cache entry is saved and restored, which is
asserted, so later groups see the module they would have seen and the reload
cannot quietly become a no-op.

```text
PROBE M-3 (re-run against the strengthened assertion)   target=TP-03-20
  file=<repo>/rltaxrental.js:51
  mutation: one declaration member NAME emitted to the console at module load
            (inserted: console.log("rentalOpeningSuspendedLoss");)
  BEFORE_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  MUTATED_SHA256=1b51d976b84ce890b52722824d8ea8c1881fa50908a3bbf8a3c8ec38cdad9411

  $ node scripts/selftest.mjs
  ✓ TP-03-20: every rental declaration is a declared workspace field, is named in the
    export's omitted list, has no value in the exported bytes, refuses by name when
    undeclared, and no rental member reaches the committed configuration
  ✗ FAIL: TP-03-20: loading the rental module fresh with every console method hooked and
    settling through the hook writes nothing to the console, no captured line names a
    rental declaration member, the same hook is proven to capture a deliberate emission
    so the silence is not vacuous, no engine module holds a console call at all, and the
    detector is proven to fire on one that does
  Research-Lab self-test: 3132 passed, 1 failed

  RED IS THE NEW ASSERTION ALONE. The pre-existing TP-03-20 assertion still passed under
  the same emission, which is the demonstration that it never watched the channel the row
  names. Exactly one failure, so the group did not throw.

  AFTER_SHA256=230f966c0c38eba8a71f90dfa9d5c4aca71685997da03dce393dd942ede8026c
  REVERT_VERIFIED=yes        # and the module holds 0 console calls again

  $ node scripts/selftest.mjs        # same command, after revert
  ✓ TP-03-20: loading the rental module fresh with every console method hooked ...
  Research-Lab self-test: 3133 passed, 0 failed
```

`git status --short` over every module, pack, page and test path was empty after
the revert. `TP-03-20` now carries an intended RED and a same-command GREEN.

### Effect of the three repairs on the DoD row

The three assertion weaknesses are repaired and the five rows that could not be
probed at all are unblocked: `TP-03-11`, `TP-03-16`, `TP-03-17` and `TP-03-20` now
each carry an intended RED produced by the very mutation that previously slipped,
paired with a same-command GREEN after a SHA-256-verified revert. Fifteen of the
twenty-eight rows now carry a RED.

The DoD row that these block — "Every Test Plan row has intended RED and
same-command GREEN evidence recorded, including the browser rows" — **remains
open**, and deliberately so. It requires every row, and thirteen are still owed:
`TP-03-02`, `TP-03-04`, `TP-03-06`, `TP-03-08`, `TP-03-10`, `TP-03-18`, the five
browser rows `TP-03-21` to `TP-03-25`, and `TP-03-26` to `TP-03-28`.

`TP-03-27` is additionally blocked by a cause outside this feature and outside
this session's remit: its command `node scripts/validate-spec-test-paths.mjs` has
no present GREEN on a clean tree, because a concurrent session's feature-027 scope
folder references three test paths that do not exist. A row whose command does not
pass unmutated cannot be given a RED-and-GREEN pair, and the reference that turns
it red is not this feature's to remove. The row is therefore left unticked rather
than forced.

Baseline movement for the record: the whole-repository suite was `3129 passed,
1 failed` when the three misses were first recorded, and is `3133 passed, 0 failed`
now. The four added assertions account for the four added passes; the one failure
cleared when the concurrent session created the files its guard was missing. No
new failure was introduced and the pass count did not fall.

## Supersession Ledger

Filled at execution. This scope supersedes nothing, so this section holds the
closing check only: the `SUP-023-NN` markers present in the repository mapped to the
entries the completed scopes own, and the evidence that every pre-existing assertion
outside them still passes unchanged. Where ASC-8 admitted an entry in flight, the
admission and its ledger row are recorded here.
Command: `node scripts/selftest.mjs`

## Change Boundary

Filled at execution. Holds the path-scoped status check proving every excluded path
is byte-identical, and that the only federal pack change is the additive insertion
of the three retrieved records.

## Claim Boundary

Filled at execution. Holds the text scan proving no probability, lifetime figure,
future year, break-even year, ranking, recommendation, track record or error rate
appears in this scope's allowed paths.

## Completion Statement

Filled at execution.

## Fifth Pass — Five More Rows Carry An Intended RED, And One Assertion Is Unconditionally True

Same-command GREEN for every row whose command is `node scripts/selftest.mjs` was
re-observed on the clean tree in this session before any probe was applied:

```
$ node scripts/selftest.mjs
exit: 0
lines: 3569
sha256: 44f56aa61cfaab61db1eb927069731c6994a9789118ea3f289fbed25fa6d2139
Research-Lab self-test: 3156 passed, 0 failed
```

Every probe below was applied with an in-place edit, run, and reverted with
`git checkout --` inside the **same shell invocation**, with the pre-probe and
post-revert SHA-256 of the touched module compared and `git status --short`
re-read. Every mutation is value-free by construction — a code literal, a
comparison operator, a dropped term of a local sum, or a `.slice(1)` on an
exported view — so no household or tax figure could be disclosed by a slipped
revert. All five reverts matched their pre-probe SHA-256 exactly.

### Probe P03-1 — RED for `TP-03-18`

Mutation: one member identifier, `"RLTAX-RENTAL-UNAVAILABLE": true,`, inserted
into the refusal vocabulary declared in `rltaxrules.js`. This is exactly the
defect the row names — a scope that adds a code of its own instead of folding
its condition into an existing member.

```
$ node scripts/selftest.mjs        # probe applied
exit: 1
lines: 3569
sha256: 45294e8e7086abb7156f363d2e9b841abe3b770d60e934ec054e6b13743bfeee
  ✗ FAIL: TP-03-18: the refusal vocabulary still has exactly its fourteen pre-feature members and this scope added none
Research-Lab self-test: 3144 passed, 12 failed
PRE_SHA=c5fe2bfd8660fd494d2ad733713e393dedd9a805edfd9b11308e584f7f237f2c
POST_SHA=c5fe2bfd8660fd494d2ad733713e393dedd9a805edfd9b11308e584f7f237f2c
SHA_MATCH=yes
```

Eleven other rows across features 021, 022 and 024 also went red, because eleven
other scopes pin the same count. That breadth is a property of the vocabulary,
not a defect in this probe: the row named here failed on its own text.

### Probe P03-2 — RED for `TP-03-02`

Mutation: the member-name literal `"contentSha256"` in `packContentDigestInput`
was given one extra character, so the self-referential member stopped being
excluded from the bytes the digest covers.

```
$ node scripts/selftest.mjs        # probe applied
exit: 1
lines: 3569
sha256: 2a34ab787bcf37bbd4a6a41a04c8560d2f05af8ff0ff78f572212b9530eb25cc
  ✗ FAIL: TP-03-02: the pack stays valid after the additive insertion, its digest is re-derivable and equals the configuration pointer, …
Research-Lab self-test: 3147 passed, 9 failed
P03-2_REVERTED_SHA_MATCH=yes
```

No pack file was touched. The digest half of the row is proven to discriminate
without editing a single sourced byte.

### Probe P03-3 — RED for `TP-03-06`

Mutation: the published `appliedOrder` list was rebuilt from the position in the
ladder rather than from `entry.appliedOrder` — literally the module constant the
row exists to forbid. The renumbered-pack fixture then no longer moved with the
pack.

```
$ node scripts/selftest.mjs        # probe applied
exit: 1
lines: 3569
sha256: 9f41eaa977f24394991885529fb157d22321f08185b426bf9d5532144784ec21
  ✗ FAIL: TP-03-06: the applied limits carry strictly increasing orders with the at-risk limit first, the orders equal the pack's sourced rows rather than a module constant, …
Research-Lab self-test: 3155 passed, 1 failed
P03-3_REVERTED_SHA_MATCH=yes
```

One failure, no group throw: the row failed alone.

### Probe P03-4 — RED for `TP-03-08`

Mutation: one comparison operator, `measure > start` became `measure >= start`,
so the lower edge of the sourced phase-out range was treated as inside the
phase-out rather than at the maximum.

```
$ node scripts/selftest.mjs        # probe applied
exit: 1
lines: 3569
sha256: 1e0f417afe23b93885993105f797aee28f47beaab36f1003bb4070c86c20e06c
  ✗ FAIL: TP-03-08: the special allowance equals the sourced maximum at and below the lower edge, is reduced by the sourced rate one dollar above it, …
Research-Lab self-test: 3155 passed, 1 failed
P03-4_REVERTED_SHA_MATCH=yes
```

One failure, no group throw. The probe changes no figure: it changes only which
side of the sourced edge the boundary case falls on.

### Probes P03-5 and P03-6 — two misses, recorded rather than hidden

Two earlier attempts at `TP-03-10` did **not** produce a per-row RED, and both are
recorded because the reason is a finding about the row.

- **P03-5.** The `disposition` literal `"suspended"` was lengthened. Result:
  `✗ FAIL (Feature 023 Scope 03 rental group threw): Cannot read properties of undefined (reading 'length')`,
  3135 passed / 3 failed, capture sha256
  `61cfb76f375d05cf0c6cffbaa4de0b3ea635b0703f88be6794dbb28e9da925df`.
- **P03-6.** One term of the local reconciliation sum was dropped, so
  `disallowedAmount` became `amountBefore` alone. Result: the same group throw,
  3135 passed / 3 failed, capture sha256
  `08096fd014d59ffbbf23d1ca9931dbff93bda96d946a6315e9ab27af864b7101`.

Both mutations are detected — but by the engine's own `validateLossLimitation`,
which refuses the whole settlement, so the ladder never materialises and an
earlier assertion in the group throws before `TP-03-10` is reached. A group throw
is a red *command*, not a red *row*: it does not show that the row's own
assertion discriminates. Both were reverted in their own invocation with the
SHA-256 re-matched.

### Probe P03-7 — RED for `TP-03-10`

Mutation: the exported view of the contract key set was narrowed with
`LOSS_LIMITATION_KEYS.slice(1)`, leaving the internal constant the validator
enforces untouched. The engine therefore still produced a well-formed ladder, and
only the row's published-versus-enforced conjunct failed.

```
$ node scripts/selftest.mjs        # probe applied
exit: 1
lines: 3569
sha256: 0a68e940064acb82dadf7eb91fd748b28aea3d7575c108b0c54d1eae64032078
  ✗ FAIL: TP-03-10: every applied limit across five fixtures publishes all three amounts, they reconcile exactly, the disposition records that the disallowed amount is carried, and the record carries exactly the contract's key set
Research-Lab self-test: 3155 passed, 1 failed
P03-7_REVERTED_SHA_MATCH=yes
```

One failure, no group throw. The defect this discriminates against is real and
distinct from the two misses above: a module whose *published* contract disagrees
with the contract it *enforces*.

### `TP-03-26` is red under every probe above

`TP-03-26`'s command is the same whole-repository suite, and its expectation is
that the suite stays green with no fall in pass count. Each of the five probes
above drove it to a non-zero exit with a fallen pass count — 3144, 3147, 3155,
3155 and 3155 against the 3156 baseline — and each returned to 3156 passed / 0
failed on revert. That is an observed intended RED and a same-command GREEN for
`TP-03-26`.

### Finding — `TP-03-04`'s assertion is unconditionally true

`TP-03-04`'s assertion ends its conjunction with `|| true`. Because `&&` binds
tighter than `||`, the whole expression is `(every conjunct) || true`, which
evaluates to `true` for every possible input. **No mutation can turn this row
red**, including the two defects its own text names — a recalled recovery period
and a defaulted convention. The row cannot be given an intended RED while the
assertion is written this way; the obstacle is the assertion, not the absence of
a probe.

This is recorded rather than repaired. Repairing it means appending a falsifiable
restatement to `scripts/selftest.mjs`, which currently carries a concurrent
session's uncommitted 39-line addition; committing this scope's evidence would
either carry that in-flight foreign work into this feature's commit or require
partial staging of a shared file. A precisely located, reproducible finding is
the better outcome. What would make the row decidable: a new assertion, appended
beside the existing one and leaving it untouched, restating the same three
findings without the trailing `|| true`, after which the convention-branch
mutation P03-5's sibling would red it directly.

### Effect on the DoD row

Twenty of twenty-eight rows now carry an observed intended RED: the fifteen
recorded in the previous passes plus `TP-03-02`, `TP-03-06`, `TP-03-08`,
`TP-03-10`, `TP-03-18` and `TP-03-26` from this pass. The row stays unticked
because it requires **every** row. Still owed: `TP-03-04` (blocked by the
unconditional assertion above), the browser rows `TP-03-21` to `TP-03-25`, and
`TP-03-27` and `TP-03-28`. No assertion was edited, weakened, skipped or removed
and no timeout was raised in this pass.
